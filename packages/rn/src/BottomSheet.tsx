import * as React from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponderGestureState,
  PanResponderInstance,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type BottomSheetHeight = 'content' | 'half' | 'full';
/** Why `onClose` fired. `action` is never emitted by BottomSheet itself — it exists for a consumer's footer action reusing the same handler. */
export type BottomSheetCloseReason = 'escape' | 'close-button' | 'scrim' | 'drag' | 'action';

/** The style bindings a caller may replace with a different token; `surface`, `handle`, `maxWidth`, `minTarget`, `focusRing` and `focusRingWidth` are locked. */
export type BottomSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
  | 'headerPaddingTop'
  | 'handleGap'
  | 'headerGap'
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

export interface BottomSheetProps {
  /** Controlled visibility, as in Dialog. Controlled only — the consumer owns `open` and the sheet requests changes through `onClose`, never changing `open` itself. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode | undefined;
  /** `content` sizes to the body up to 90% of the window; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false the close button and handle are not rendered, a scrim tap and a drag do nothing, and Escape still reports with reason `escape`. */
  dismissible?: boolean | undefined;
  /** Drag the handle or header downward to dismiss: release past 25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive: Escape always exists, and the close button exists whenever the gesture does. */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose('drag')`; carries no payload. */
  onDragDismiss?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/** Schema constants without a token; `dragSlop` has one (`space.1`) and is read from the theme. */
const CONSTANTS = {
  contentCap: 0.9, // literal-ok: schema constant contentCap (ratio of the window, height content only)
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance (ratio of sheet height)
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity (px/ms)
} as const;

interface DragSample {
  dy: number;
  time: number;
}

/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps the
 * page visible behind a scrim, and goes away with a swipe, a tap outside, the close
 * button or Escape.
 *
 * One presentation at every window width — never a Dialog: the surface is `width: '100%'`
 * capped at `layout.maxWidth.prose` (locked) with `alignSelf: 'center'`, so a tablet gets
 * a capped, centred sheet at the bottom. A native `Modal` (`transparent`,
 * `animationType="none"` — the component animates itself, `statusBarTranslucent`) holding
 * a scrim `Pressable` and, inside a `FocusScope` (`trapped`, `autoFocus="first"`,
 * `restoreFocus`), an `Animated.View` surface anchored to the bottom with `role="dialog"`,
 * `accessibilityViewIsModal` and `accessibilityLabel={heading}`. It slides up with `enter`
 * and `motion.easing.standard` and down with `exit` and `motion.easing.exit`, instantly
 * under reduced motion. Android back (`onRequestClose`) and the VoiceOver escape gesture
 * report `onClose('escape')`, even when not dismissible. `autoFocus="first"` lands on the
 * scope wrapper rather than a real control — FocusScope's own documented native limit —
 * so the screen reader reads the sheet from the top, which is the intended result.
 *
 * A `PanResponder` on the header (handle and heading row, never the body `ScrollView`,
 * whatever its scroll position) claims a move once it passes `dragSlop` (`space.1`)
 * downward, so a tap on the close button still activates it; the offset counts from where
 * the slop was crossed, so the surface does not jump. It follows the finger even under
 * reduced motion, since the drag is user-driven. On release past `dismissDistance` of the
 * measured sheet height, or faster than `dismissVelocity` between the last two move
 * samples, it fires `onDragDismiss` then `onClose('drag')` and holds the released offset
 * until the consumer's update renders: `open` false plays the normal exit from there,
 * `open` still true springs back over `exit` with `motion.easing.standard`. The handle is
 * decorative, not a focus stop, and rendered only when the gesture is live.
 *
 * `inset` is applied once each way so nothing doubles between parts: the surface column
 * carries the block padding (`headerPaddingTop` at the top when the handle is rendered,
 * `inset` otherwise; `inset` at the bottom), the header and footer wrappers the inline
 * padding, and the body `Box` receives it as `overrides.paddingInline` with zero block
 * padding of its own. The bottom safe-area inset is an empty `SafeAreaView` after the last
 * part, whose column gap is cancelled so the only space it adds is its own inset; RN core
 * has no Android safe-area API, and the Modal is not `navigationBarTranslucent`, so
 * Android adds none.
 *
 * The closeButton part is a View sized to `size.target.comfortable`; the Button's own
 * hitSlop already extends its hit area to that target, so the wrapper's extra area
 * activates it. Scroll lock has no native meaning — a Modal has no page behind it to
 * scroll — and is not implemented. The Modal is its own window, so no ref is exposed; callers ref their trigger.
 */
export function BottomSheet({
  open,
  heading,
  hideHeading = false,
  children,
  footer,
  height = 'content',
  dismissible = true,
  dragToDismiss = true,
  onClose,
  onDragDismiss,
  overrides,
}: BottomSheetProps): React.JSX.Element | null {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();

  // Kept mounted while the exit animation runs; derived during render so the Modal content exists on the open commit.
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  // Bumped after a drag dismiss so an effect can read `open` once the consumer's update has rendered.
  const [dragReleases, setDragReleases] = React.useState(0);

  const progress = React.useRef(new Animated.Value(0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const sheetHeightRef = React.useRef(0);
  const samplesRef = React.useRef<DragSample[]>([]);
  // Where the slop was crossed; the drag offset counts from there.
  const grantDyRef = React.useRef(0);

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const handleHeight = overrides?.handleHeight ? (resolveToken(t, overrides.handleHeight) as number) : t.space1;
  const handleWidth = overrides?.handleWidth ? (resolveToken(t, overrides.handleWidth) as number) : t.space10;
  const handleRadius = overrides?.handleRadius ? (resolveToken(t, overrides.handleRadius) as number) : t.radiusFull;
  const headerPaddingTop = overrides?.headerPaddingTop
    ? (resolveToken(t, overrides.headerPaddingTop) as number)
    : t.spaceSm;
  const handleGap = overrides?.handleGap ? (resolveToken(t, overrides.handleGap) as number) : t.layoutGapTight;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  // The schema constant `dragSlop`; a constant, not an overridable binding.
  const dragSlop = t.space1;

  // The handle only exists where dragging does something, so there is no affordance that lies.
  const canDrag = dragToDismiss && dismissible;

  // Back to rest from wherever a drag left the surface; also finishes an enter the drag interrupted.
  const springBack = (): void => {
    // Closed already (a close that raced the gesture): only the offset returns, the exit keeps playing.
    if (reducedMotion || exitDuration === 0) {
      dragY.setValue(0);
      if (open) {
        progress.setValue(1);
      }
      return;
    }
    // A timing animation, not a spring: the theme's motion never bounces.
    const config = {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    };
    const toRest = [Animated.timing(dragY, config)];
    if (open) {
      toRest.push(Animated.timing(progress, { ...config, toValue: 1 }));
    }
    Animated.parallel(toRest).start();
  };

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      if (reducedMotion || enterDuration === 0) {
        progress.setValue(1);
        dragY.setValue(0);
        return undefined;
      }
      const enterConfig = {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      };
      // A reopen that interrupts a drag-dismiss exit also brings any held offset back to rest.
      const animation = Animated.parallel([
        Animated.timing(progress, enterConfig),
        Animated.timing(dragY, { ...enterConfig, toValue: 0 }),
      ]);
      animation.start();
      return () => animation.stop();
    }
    const unmount = (): void => {
      progress.setValue(0);
      dragY.setValue(0);
      setMounted(false);
    };
    if (reducedMotion || exitDuration === 0) {
      unmount();
      return undefined;
    }
    // Plays from wherever the surface is, including the position a drag dismiss left it at.
    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingExit),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        unmount();
      }
    });
    return () => animation.stop();
    // Runs on the open/closed transition and the mount gate it drives; the
    // animation config is read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  React.useEffect(() => {
    // The release and the consumer's `setState` batch into one render, so `open` here is
    // the consumer's answer to the dismiss: still true means spring back to rest.
    if (dragReleases > 0 && open) {
      springBack();
    }
    // Only a drag release triggers this check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragReleases]);

  // The responder is created once; it reads the current render's values through this ref.
  const latest = React.useRef({ open, dragSlop, windowHeight, onClose, onDragDismiss, springBack });
  latest.current = { open, dragSlop, windowHeight, onClose, onDragDismiss, springBack };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    const claims = (_: GestureResponderEvent, g: PanResponderGestureState): boolean =>
      g.dy > latest.current.dragSlop && Math.abs(g.dy) > Math.abs(g.dx);
    panResponder.current = PanResponder.create({
      // Capture so a drag that started on the heading or the close button is taken over by
      // the header — but only past the slop, so a tap still reaches the button.
      onMoveShouldSetPanResponderCapture: claims,
      onMoveShouldSetPanResponder: claims,
      onPanResponderGrant: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        samplesRef.current = [];
        grantDyRef.current = g.dy;
        // An enter still running holds where it is; the release's spring-back finishes it.
        progress.stopAnimation();
      },
      // Follows the finger even under reduced motion: the drag is user-driven.
      onPanResponderMove: (event: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, g.dy - grantDyRef.current);
        dragY.setValue(offset);
        const sample: DragSample = { dy: offset, time: event.nativeEvent.timestamp };
        samplesRef.current = [samplesRef.current[samplesRef.current.length - 1] ?? sample, sample];
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const offset = Math.max(0, g.dy - grantDyRef.current);
        const [previous, last] = samplesRef.current;
        const elapsed = previous !== undefined && last !== undefined ? last.time - previous.time : 0;
        // Between the last two move samples, and only downward speed counts.
        const velocity =
          previous !== undefined && last !== undefined && elapsed > 0
            ? Math.max(0, (last.dy - previous.dy) / elapsed)
            : 0;
        const sheetHeight = sheetHeightRef.current > 0 ? sheetHeightRef.current : latest.current.windowHeight;
        const dismiss = offset > sheetHeight * CONSTANTS.dismissDistance || velocity > CONSTANTS.dismissVelocity;
        // A close that raced the gesture: spring back and report nothing the sheet did not cause.
        if (!dismiss || !latest.current.open) {
          latest.current.springBack();
          return;
        }
        latest.current.onDragDismiss?.();
        latest.current.onClose?.('drag');
        setDragReleases((count) => count + 1);
      },
      onPanResponderTerminate: () => latest.current.springBack(),
    });
  }

  if (!mounted) {
    return null;
  }

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    onClose?.('close-button');
  };

  // Android back, a hardware Escape and the VoiceOver escape gesture: always reported, the consumer decides.
  const handleEscape = (): void => {
    onClose?.('escape');
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    sheetHeightRef.current = event.nativeEvent.layout.height;
  };

  // Nothing to show in the header: no handle, no visible heading, no close button.
  const showHeader = canDrag || !hideHeading || dismissible;

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  // With `statusBarTranslucent` the Modal window starts under the Android status bar, so a
  // `full` sheet clears the larger of the gutter and the status bar. iOS core exposes no
  // status-bar height, so there the gutter is all there is.
  const fullInset =
    Platform.OS === 'android' ? Math.max(t.layoutGutter, StatusBar.currentHeight ?? 0) : t.layoutGutter;

  const sheetHeight: Record<BottomSheetHeight, number | undefined> = {
    content: undefined,
    half: windowHeight * 0.5, // literal-ok: half the window, per the height enum
    full: windowHeight - fullInset,
  };
  // The cap belongs to `content` alone; `half` and `full` set the height outright.
  const maxSheetHeight = height === 'content' ? windowHeight * CONSTANTS.contentCap : undefined;

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    // One presentation at every width: full width on a phone, capped and centred beyond the token.
    width: '100%',
    maxWidth: t.layoutMaxWidthProse,
    alignSelf: 'center',
    height: sheetHeight[height],
    maxHeight: maxSheetHeight,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    gap: partGap,
    // The block edges are padded once, here on the column that holds the parts.
    paddingTop: canDrag ? headerPaddingTop : inset,
    paddingBottom: inset,
    transform: [
      {
        translateY: Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] }), dragY),
      },
    ],
  };

  // A column of the handle over the heading row; no block padding of its own.
  const headerStyle: ViewStyle = {
    paddingHorizontal: inset,
    gap: handleGap,
  };

  const handleStyle: ViewStyle = {
    alignSelf: 'center',
    width: handleWidth,
    height: handleHeight,
    borderRadius: handleRadius,
    backgroundColor: t.colorForegroundMuted,
  };

  // A sheet-owned element inside the header, not an anatomy part: no testID.
  const headingRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    // With the heading hidden the close button is end-aligned in the row.
    justifyContent: hideHeading ? 'flex-end' : 'space-between',
    gap: headerGap,
  };

  const headingStyle: ViewStyle = { flexShrink: 1 };

  const closeButtonStyle: ViewStyle = {
    minWidth: t.sizeTargetComfortable,
    minHeight: t.sizeTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // `half` and `full` fix the height, so the body takes the free space and the footer stays pinned.
  const bodyStyle: ViewStyle = { flexShrink: 1, flexGrow: height === 'content' ? 0 : 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
  };

  // Empty, after the last part: its bottom-edge padding is the only height it adds, and the
  // negative margin cancels the column gap that would otherwise sit above it.
  const safeAreaStyle: ViewStyle = { marginTop: -partGap };

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleScrimPress}
            accessible={false}
            testID="BottomSheet.scrim"
          />
        </Animated.View>
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={open} autoFocus="first" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              role="dialog"
              accessibilityViewIsModal
              aria-modal
              accessibilityLabel={heading}
              aria-label={heading}
              onAccessibilityEscape={handleEscape}
              testID="BottomSheet"
            >
              {showHeader ? (
                <View
                  {...(canDrag ? panResponder.current.panHandlers : undefined)}
                  style={headerStyle}
                  testID="BottomSheet.header"
                >
                  {canDrag ? (
                    <View
                      style={handleStyle}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                      aria-hidden
                      testID="BottomSheet.handle"
                    />
                  ) : null}
                  <View style={headingRowStyle}>
                    {!hideHeading ? (
                      <View style={headingStyle} testID="BottomSheet.heading">
                        <Heading level="2">{heading}</Heading>
                      </View>
                    ) : null}
                    {dismissible ? (
                      <View style={closeButtonStyle} testID="BottomSheet.closeButton">
                        <Button
                          label={COPY.closeLabel}
                          variant="ghost"
                          size="sm"
                          iconOnly
                          leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                          onPress={handleCloseButtonPress}
                        />
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
              {/* The sheet-owned scroll element, unnamed; Box writes its own testID, so the body hook is a wrapper inside it. */}
              <ScrollView style={bodyStyle} keyboardShouldPersistTaps="handled">
                <View testID="BottomSheet.body">
                  {/* `inset` reaches the Box only as a token path through its own overrides, always sent; the block padding stays on the surface. */}
                  <Box inset="none" overrides={{ paddingInline: overrides?.inset ?? 'layout.inset.lg' }}>
                    {children}
                  </Box>
                </View>
              </ScrollView>
              {footer !== undefined ? (
                <View style={footerStyle} testID="BottomSheet.footer">
                  <Stack
                    direction="horizontal"
                    justify="end"
                    wrap
                    overrides={{ gap: overrides?.footerGap ?? 'layout.gap.tight' }}
                  >
                    {footer}
                  </Stack>
                </View>
              ) : null}
              <SafeAreaView style={safeAreaStyle} />
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
