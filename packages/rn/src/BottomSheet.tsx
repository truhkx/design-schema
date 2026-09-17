import * as React from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
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
import { Dialog } from './Dialog';
import type { DialogOverridableBinding } from './Dialog';
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
  /** Keep the heading for assistive technology but do not render it (forwarded to Dialog above the breakpoint). The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode;
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

/** Schema constants without a token; `dragSlop` is read from `space.1` at render time. */
const CONSTANTS = {
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance (ratio of sheet height)
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity (px/ms)
} as const;

// Overrides whose binding shares a name with a Dialog binding, forwarded in the wide
// presentation; the handle bindings, `headerPaddingTop` and `handleGap` have no effect there.
const DIALOG_BINDINGS: readonly (BottomSheetOverridableBinding & DialogOverridableBinding)[] = [
  'scrim',
  'shadow',
  'radius',
  'inset',
  'partGap',
  'headerGap',
  'footerGap',
  'layer',
  'enter',
  'exit',
];

interface DragSample {
  dy: number;
  time: number;
}

/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps the
 * page visible behind a scrim, and goes away with a swipe, a tap outside, the close
 * button or Escape.
 *
 * At window width <= `layout.maxWidth.prose`: a native `Modal` (`transparent`,
 * `animationType="none"`, `statusBarTranslucent`) holding a scrim that fades with the
 * surface, a full-screen scrim `Pressable`, and inside a `FocusScope` (`trapped`,
 * `autoFocus="first"`, `restoreFocus`) an `Animated.View` surface anchored to the bottom
 * with `role="dialog"`, `accessibilityViewIsModal` and `accessibilityLabel={heading}`.
 * It slides up with `enter` and `motion.easing.standard` and down with `exit` and
 * `motion.easing.exit`, instantly under reduced motion. Android back (`onRequestClose`)
 * and the VoiceOver escape gesture report `onClose('escape')`, even when not dismissible.
 *
 * A `PanResponder` on the header (handle and heading row, never the body `ScrollView`)
 * claims a move once it passes `space.1` downward, follows the finger (also under reduced
 * motion), and on release past `dismissDistance` of the measured sheet height, or faster
 * than `dismissVelocity` between the last two move samples, fires `onDragDismiss` then
 * `onClose('drag')`. The sheet holds the release position until the consumer's update
 * renders: `open` false plays the exit from there; `open` still true springs back with
 * `exit` and `motion.easing.standard`. The handle is decorative and rendered only when
 * the gesture is live.
 *
 * The closeButton part is a View sized to `size.target.comfortable` around a ghost icon
 * Button, whose own hitSlop covers the extra area. The bottom inset comes from
 * `SafeAreaView` (iOS only; Android adds none). Scroll lock has no native meaning and is
 * not implemented. Above the breakpoint the component renders `Dialog size="md"` alone
 * with the same props and the shared overrides. The Modal is its own window, so no ref
 * is exposed.
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
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  // Kept mounted while the exit animation runs; derived during render so the Modal content exists on the open commit.
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  // Bumped after a drag dismiss so an effect can check `open` once the consumer's update has rendered.
  const [dragReleases, setDragReleases] = React.useState(0);

  const progress = React.useRef(new Animated.Value(0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const sheetHeightRef = React.useRef(0);
  const samplesRef = React.useRef<DragSample[]>([]);

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
  const dragSlop = t.space1;

  const isWide = windowWidth > t.layoutMaxWidthProse;
  const canDrag = dragToDismiss && dismissible;

  const springBack = (): void => {
    if (reducedMotion || exitDuration === 0) {
      dragY.setValue(0);
      return;
    }
    Animated.timing(dragY, {
      toValue: 0,
      duration: exitDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  };

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      dragY.setValue(0);
      if (reducedMotion || enterDuration === 0) {
        progress.setValue(1);
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start();
      return () => animation.stop();
    }
    if (reducedMotion || exitDuration === 0) {
      progress.setValue(0);
      setMounted(false);
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
        setMounted(false);
      }
    });
    return () => animation.stop();
    // Runs on the open/closed transition and the mount gate it drives; the
    // animation config is read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  React.useEffect(() => {
    if (dragReleases > 0 && open) {
      springBack();
    }
    // Only a drag release triggers this check; `open` is read as rendered with the consumer's update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragReleases]);

  // The responder is created once; it reads the current render's values through this ref.
  const latest = React.useRef({ dragSlop, windowHeight, onClose, onDragDismiss, springBack });
  latest.current = { dragSlop, windowHeight, onClose, onDragDismiss, springBack };

  const panResponder = React.useRef<PanResponderInstance | null>(null);
  if (panResponder.current === null) {
    const claims = (_: GestureResponderEvent, g: PanResponderGestureState): boolean =>
      g.dy > latest.current.dragSlop && Math.abs(g.dy) > Math.abs(g.dx);
    panResponder.current = PanResponder.create({
      // Capture so a drag that starts on the heading or close button can still claim, but only past the slop.
      onMoveShouldSetPanResponderCapture: claims,
      onMoveShouldSetPanResponder: claims,
      onPanResponderGrant: () => {
        samplesRef.current = [];
      },
      // Follows the finger even under reduced motion: the drag is user-driven.
      onPanResponderMove: (event: GestureResponderEvent, g: PanResponderGestureState) => {
        dragY.setValue(Math.max(0, g.dy));
        const sample: DragSample = { dy: g.dy, time: event.nativeEvent.timestamp };
        samplesRef.current = [samplesRef.current[samplesRef.current.length - 1] ?? sample, sample];
      },
      onPanResponderRelease: (_: GestureResponderEvent, g: PanResponderGestureState) => {
        const [previous, last] = samplesRef.current;
        const elapsed = previous !== undefined && last !== undefined ? last.time - previous.time : 0;
        // Only downward speed counts.
        const velocity = previous !== undefined && last !== undefined && elapsed > 0 ? Math.max(0, (last.dy - previous.dy) / elapsed) : 0;
        const sheetHeight = sheetHeightRef.current > 0 ? sheetHeightRef.current : latest.current.windowHeight;
        const dismiss = g.dy > sheetHeight * CONSTANTS.dismissDistance || velocity > CONSTANTS.dismissVelocity;
        if (!dismiss) {
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

  if (isWide) {
    let dialogOverrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
    if (overrides) {
      dialogOverrides = {};
      for (const binding of DIALOG_BINDINGS) {
        if (overrides[binding] !== undefined) {
          dialogOverrides[binding] = overrides[binding];
        }
      }
    }
    return (
      <Dialog
        open={open}
        heading={heading}
        hideHeading={hideHeading}
        size="md"
        dismissible={dismissible}
        footer={footer}
        onClose={onClose}
        overrides={dialogOverrides}
      >
        {children}
      </Dialog>
    );
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

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  const sheetHeight: Record<BottomSheetHeight, number | undefined> = {
    content: undefined,
    half: windowHeight * 0.5, // literal-ok: half the window, per the height enum
    full: windowHeight - t.layoutGutter,
  };

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    height: sheetHeight[height],
    maxHeight: height === 'content' ? windowHeight * 0.9 : undefined, // literal-ok: 90% of the window, per height content
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    gap: partGap,
    transform: [
      {
        translateY: Animated.add(
          progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] }),
          dragY,
        ),
      },
    ],
  };

  const headerStyle: ViewStyle = {
    paddingTop: canDrag ? headerPaddingTop : inset,
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

  const headingRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingBottom: inset,
  };

  const bodyOverrides = overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined;
  const footerOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : undefined;

  const body = (
    <ScrollView style={bodyStyle} keyboardShouldPersistTaps="handled" testID="BottomSheet.body">
      <Box inset="lg" overrides={bodyOverrides}>
        {children}
      </Box>
    </ScrollView>
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={handleScrimPress} accessible={false} testID="BottomSheet.scrim" />
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={open} autoFocus="first" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              role="dialog"
              accessibilityViewIsModal
              accessibilityLabel={heading}
              onAccessibilityEscape={handleEscape}
              testID="BottomSheet"
            >
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
              {footer !== undefined ? (
                <>
                  {body}
                  <SafeAreaView style={footerStyle} testID="BottomSheet.footer">
                    <Stack direction="horizontal" gap="tight" justify="end" overrides={footerOverrides}>
                      {footer}
                    </Stack>
                  </SafeAreaView>
                </>
              ) : (
                <SafeAreaView style={bodyStyle}>{body}</SafeAreaView>
              )}
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
