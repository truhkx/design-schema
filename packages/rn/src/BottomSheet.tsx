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
import type { LayoutChangeEvent, PanResponderGestureState, ViewStyle } from 'react-native';
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
/** Why `onClose` fired. `action` is never emitted by BottomSheet itself — it exists for a consumer whose footer action also wants to report a close through the same callback. */
export type BottomSheetCloseReason = 'escape' | 'close-button' | 'scrim' | 'drag' | 'action';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type BottomSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'handleHeight'
  | 'handleWidth'
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

export interface BottomSheetProps {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /** Keep the heading for assistive technology but do not render it (forwarded to Dialog above the breakpoint). The accessible name is required regardless. */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean | undefined;
  /** Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive: the close button and Escape always exist. */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; carries no payload. */
  onDragDismiss?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/** Schema constants: `dismissDistance` (ratio of sheet height) and `dismissVelocity` (px/ms, PanResponder's own unit). */
const CONSTANTS = {
  dismissDistance: 0.25, // literal-ok: schema constant dismissDistance
  dismissVelocity: 1.5, // literal-ok: schema constant dismissVelocity
} as const;

// A move must be this many px downward (and more vertical than horizontal) before the
// header claims the responder, so a tap on the close button is never stolen.
const DRAG_SLOP = 4; // literal-ok: gesture recognition slop, not a visual size

// The bindings BottomSheet shares with Dialog's own overrides contract, forwarded
// when the sheet presents as a Dialog above `maxWidth`; `handleHeight`, `handleWidth`
// and `maxWidth` have no Dialog equivalent and are dropped.
const SHARED_DIALOG_BINDING: Partial<Record<BottomSheetOverridableBinding, DialogOverridableBinding | undefined>> = {
  scrim: 'scrim',
  shadow: 'shadow',
  radius: 'radius',
  inset: 'inset',
  partGap: 'partGap',
  footerGap: 'footerGap',
  layer: 'layer',
  enter: 'enter',
  exit: 'exit',
};

/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps
 * the page visible behind a scrim, and goes away with a swipe, a tap outside, the
 * close button or Escape.
 *
 * When to use: on phones for a task or a set of choices that would otherwise be a
 * Dialog: filters, a form of a few fields, details of a selected item, a picker with
 * many options. `height: content` by default; `full` for a task that needs the whole
 * screen but should still feel dismissable; `half` for a browsable list where seeing
 * the page behind matters. Not a menu (ActionSheet/Menu), not a persistent panel
 * (Landmark), not for long reading. Do not stack sheets.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * scrim `Pressable` and an `Animated.View` surface (`role="dialog"`,
 * `accessibilityViewIsModal`, `accessibilityLabel={heading}` whether or not the
 * heading is shown) anchored to the bottom, sliding up with `enter` and
 * `motion.easing.standard` and down with `exit` and `motion.easing.exit` (instant
 * under reduced motion). The surface composes `FocusScope` (`trapped`,
 * `autoFocus="first"`, `restoreFocus`), `Heading` (level 2), `Button` for the close
 * control (the Button itself reaches `size.target.comfortable` through its hitSlop),
 * `Box` for the scrollable body and `Stack` for the footer row — never restyled.
 *
 * A `PanResponder` on the header (handle plus heading row) follows a downward drag
 * with the finger, also under reduced motion. Released past `dismissDistance` of the
 * measured surface height or faster than `dismissVelocity`, it fires `onDragDismiss`
 * then `onClose('drag')` and leaves the surface where the finger left it: when the
 * consumer sets `open` to false, the ordinary exit transition plays from there (no
 * momentum). If the consumer keeps the sheet open, or the release is short, it
 * springs back. The body `ScrollView` never starts the gesture. With `dismissible`
 * false the close button is not rendered and the scrim and drag do nothing, as in
 * Dialog; `onRequestClose` (Android back, hardware Escape) always reports
 * `onClose('escape')`.
 *
 * `height` sizes the surface from `useWindowDimensions()`: `half` is half the window,
 * `full` the window less `layout.gutter`, `content` sizes to content up to 90%.
 * Bottom padding uses `SafeAreaView`, the inset mechanism core React Native offers.
 * Above `maxWidth` the component renders `Dialog size="md"` with the same props and
 * the shared overrides. Scroll lock has no native meaning and is not implemented.
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

  const [mounted, setMounted] = React.useState(open);
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const surfaceHeightRef = React.useRef(0);
  const openRef = React.useRef(open);
  openRef.current = open;

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const handleHeight = overrides?.handleHeight ? (resolveToken(t, overrides.handleHeight) as number) : t.space1;
  const handleWidth = overrides?.handleWidth ? (resolveToken(t, overrides.handleWidth) as number) : t.space10;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const maxWidth = overrides?.maxWidth ? (resolveToken(t, overrides.maxWidth) as number) : t.layoutMaxWidthProse;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerSheet;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const isWide = windowWidth > maxWidth;
  const canDrag = dragToDismiss && dismissible;

  React.useEffect(() => {
    if (open) {
      setMounted(true);
    }
  }, [open]);

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      dragY.setValue(0);
      if (reducedMotion) {
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
    if (reducedMotion) {
      progress.setValue(0);
      setMounted(false);
      return undefined;
    }
    // Plays from wherever the surface is, including a drag offset left by a dismiss.
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
    // Reacts to the open/closed transition and the mount gate it drives; the
    // animation's own config is read fresh each run rather than tracked as a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  React.useEffect(() => {
    if (__DEV__ && footer === undefined && !dismissible) {
      console.warn('BottomSheet: with no footer and dismissible={false}, provide a way to close the sheet in its body.');
    }
  }, [footer, dismissible]);

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    onClose?.('close-button');
  };

  const handleRequestClose = (): void => {
    onClose?.('escape');
  };

  const handleSurfaceLayout = (event: LayoutChangeEvent): void => {
    surfaceHeightRef.current = event.nativeEvent.layout.height;
  };

  const panResponder = React.useMemo(() => {
    const springBack = (): void => {
      if (reducedMotion) {
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
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g: PanResponderGestureState) =>
        g.dy > DRAG_SLOP && Math.abs(g.dy) > Math.abs(g.dx),
      // The drag follows the finger even under reduced motion: it is user-driven.
      onPanResponderMove: (_, g: PanResponderGestureState) => {
        dragY.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_, g: PanResponderGestureState) => {
        const sheetHeight = surfaceHeightRef.current > 0 ? surfaceHeightRef.current : windowHeight;
        const dismiss = g.dy > sheetHeight * CONSTANTS.dismissDistance || g.vy > CONSTANTS.dismissVelocity;
        if (!dismiss) {
          springBack();
          return;
        }
        onDragDismiss?.();
        onClose?.('drag');
        // Hold the release position for the exit transition; if the consumer keeps
        // the sheet open, spring back once the update has rendered.
        setTimeout(() => {
          if (openRef.current) {
            springBack();
          }
        }, 0);
      },
      onPanResponderTerminate: springBack,
    });
  }, [dragY, windowHeight, onDragDismiss, onClose, reducedMotion, exitDuration, t.motionEasingStandard]);

  if (isWide) {
    const dialogOverrides = overrides
      ? (Object.fromEntries(
          Object.entries(overrides)
            .map(([key, value]) => [SHARED_DIALOG_BINDING[key as BottomSheetOverridableBinding], value] as const)
            .filter((entry): entry is [DialogOverridableBinding, TokenRef] => entry[0] !== undefined && entry[1] !== undefined),
        ) as Partial<Record<DialogOverridableBinding, TokenRef | undefined>>)
      : undefined;
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

  if (!mounted && !open) {
    return null;
  }

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  const entryTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });

  const surfaceHeight: Record<BottomSheetHeight, number | undefined> = {
    content: undefined,
    half: windowHeight * 0.5, // literal-ok: half the viewport per spec
    full: windowHeight - t.layoutGutter,
  };

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    height: surfaceHeight[height],
    maxHeight: height === 'content' ? windowHeight * 0.9 : undefined, // literal-ok: 90% of the viewport per spec
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    ...shadow,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
    gap: partGap,
    transform: [{ translateY: Animated.add(entryTranslateY, dragY) }],
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingTop: t.spaceSm,
    gap: t.layoutGapTight,
  };

  const handleStyle: ViewStyle = {
    alignSelf: 'center',
    width: handleWidth,
    height: handleHeight,
    borderRadius: t.radiusFull,
    backgroundColor: t.colorForegroundMuted,
  };

  const headingRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: hideHeading ? 'flex-end' : 'space-between',
    gap: t.layoutGapNormal,
  };

  const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingBottom: inset,
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={handleRequestClose} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleScrimPress}
          accessible={false}
          testID="BottomSheet.scrim"
        />
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="first" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              role="dialog"
              accessibilityViewIsModal
              accessibilityLabel={heading}
              testID="BottomSheet"
            >
              <View {...(canDrag ? panResponder.panHandlers : null)} style={headerStyle} testID="BottomSheet.header">
                <View
                  style={handleStyle}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  testID="BottomSheet.handle"
                />
                <View style={headingRowStyle}>
                  {!hideHeading ? <Heading level={2}>{heading}</Heading> : null}
                  {dismissible ? (
                    <Button
                      label={COPY.closeLabel}
                      variant="ghost"
                      size="sm"
                      iconOnly
                      leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                      onPress={handleCloseButtonPress}
                    />
                  ) : null}
                </View>
              </View>
              <ScrollView
                testID="BottomSheet.body"
                style={bodyFlexStyle}
                contentContainerStyle={bodyContentStyle}
                keyboardShouldPersistTaps="handled"
              >
                <Box inset="lg" overrides={overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined}>
                  {children}
                </Box>
              </ScrollView>
              {footer !== undefined ? (
                <SafeAreaView style={footerStyle} testID="BottomSheet.footer">
                  <Stack
                    direction="horizontal"
                    gap="tight"
                    justify="end"
                    overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
                  >
                    {footer}
                  </Stack>
                </SafeAreaView>
              ) : null}
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
