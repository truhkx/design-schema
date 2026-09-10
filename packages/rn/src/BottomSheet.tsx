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
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
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
  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  hideHeading?: boolean;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: React.ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: React.ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean;
  /** Drag the handle (or the header) downward to dismiss, with a velocity threshold. Purely additive: the close button and Escape always exist. */
  dragToDismiss?: boolean;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: (reason: BottomSheetCloseReason) => void;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. */
  onDragDismiss?: () => void;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef>>;
}

const COPY = {
  closeLabel: 'Close',
} as const;

// The bindings BottomSheet shares with Dialog's own overrides contract, forwarded
// when the sheet presents as a Dialog above `maxWidth`; `handleHeight`, `handleWidth`
// and `maxWidth` have no Dialog equivalent and are dropped.
const SHARED_DIALOG_BINDING: Partial<Record<BottomSheetOverridableBinding, DialogOverridableBinding>> = {
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

const DRAG_DISMISS_RATIO = 0.25; // literal-ok: fraction of sheet height past which a drag dismisses, per spec ("> 25%" on web)
const DRAG_DISMISS_VELOCITY = 1.5; // literal-ok: release velocity (px/ms) past which a drag dismisses regardless of distance

/**
 * BottomSheet — the phone's dialog. Rises from the edge the thumb can reach, keeps
 * the page visible behind a scrim, and goes away with a swipe, a tap outside, the
 * close button or Escape.
 *
 * When to use: Use on phones for a task or a set of choices that would otherwise be
 * a Dialog: filters, a short form, details of a selected item, a picker with many
 * options. `height: content` by default; `full` for a task that needs the whole
 * screen but should still feel dismissable; `half` for a browsable list where seeing
 * the page behind matters. Do not use it as a menu (ActionSheet/Menu), a persistent
 * panel (Landmark), or for content the user must read at length (a page). Do not
 * stack sheets or rely on the drag gesture as the only way to dismiss.
 *
 * Renders a native `Modal` (`transparent`, `statusBarTranslucent`) with a full-screen
 * scrim `Pressable` and an `Animated.View` surface anchored to the bottom, sliding up
 * on open (skipped under reduced motion). The surface composes `FocusScope`
 * (`trapped`, `restoreFocus`) for the trap and focus-restore-on-close, `Heading`
 * (level 2) for the heading, `Button` for the close control, `Box` for the scrollable
 * body and `Stack` for the footer row — never restyled directly. A `PanResponder` on
 * the header (handle plus heading row) tracks a downward drag; past 25% of the
 * measured surface height or a fast flick, it fires `onDragDismiss` then
 * `onClose('drag')` and continues the motion off-screen with `Animated.decay` at the
 * release velocity (instant, no decay, under reduced motion); otherwise it springs
 * back. The gesture is additive — the close button and Escape (mapped from the
 * Android back button via `onRequestClose`) always exist and are never gated by
 * `dragToDismiss`, only by `dismissible`. `height` sets the surface's fixed height as
 * a fraction of `useWindowDimensions()` for `half`/`full`, or lets it size to content
 * up to 90% of the viewport (`content`). Bottom padding for the footer uses
 * `SafeAreaView`, the only inset mechanism available without a new dependency. Above
 * `maxWidth`, the component renders `Dialog` directly (composition, not duplication)
 * with the shared bindings forwarded through `overrides`; `hideHeading` maps directly
 * to Dialog's own prop of the same name. Scroll-lock has no native equivalent — there
 * is no page scroll for a modal window to suppress — so it is not implemented, the
 * same acknowledged limit as Dialog.
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
}: BottomSheetProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();

  const [mounted, setMounted] = React.useState(open);
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
  const dragY = React.useRef(new Animated.Value(0)).current;
  const surfaceHeightRef = React.useRef(0);

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

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        // False at touch-start so a tap on the close button inside the header is not
        // stolen by the responder; only an actual downward drag claims it.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          dragToDismiss && dismissible && gestureState.dy > 4 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            dragY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const threshold = (surfaceHeightRef.current || windowHeight * 0.5) * DRAG_DISMISS_RATIO;
          const shouldDismiss = gestureState.dy > threshold || gestureState.vy > DRAG_DISMISS_VELOCITY;
          if (shouldDismiss) {
            onDragDismiss?.();
            onClose?.('drag');
            if (reducedMotion) {
              dragY.setValue(windowHeight);
            } else {
              Animated.decay(dragY, {
                velocity: Math.max(gestureState.vy, 0.5),
                deceleration: 0.998,
                useNativeDriver: false,
              }).start();
            }
            return;
          }
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
        },
        onPanResponderTerminate: () => {
          if (reducedMotion) {
            dragY.setValue(0);
            return;
          }
          Animated.timing(dragY, { toValue: 0, duration: exitDuration, useNativeDriver: false }).start();
        },
      }),
    [dragToDismiss, dismissible, dragY, windowHeight, onDragDismiss, onClose, reducedMotion, exitDuration, t.motionEasingStandard],
  );

  if (isWide) {
    const dialogOverrides = overrides
      ? (Object.fromEntries(
          Object.entries(overrides)
            .map(([key, value]) => [SHARED_DIALOG_BINDING[key as BottomSheetOverridableBinding], value] as const)
            .filter((entry): entry is [DialogOverridableBinding, TokenRef] => entry[0] !== undefined),
        ) as Partial<Record<DialogOverridableBinding, TokenRef>>)
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

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedObject<ViewStyle> = {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const anchorStyle: ViewStyle = { flex: 1, justifyContent: 'flex-end', zIndex: layer };

  const entryTranslateY = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });

  const fixedHeight = height === 'half' ? windowHeight * 0.5 : height === 'full' ? windowHeight - t.layoutGutter : undefined;

  const surfaceStyle: Animated.WithAnimatedObject<ViewStyle> = {
    width: '100%',
    height: fixedHeight,
    maxHeight: height === 'content' ? windowHeight * 0.9 : undefined, // literal-ok: proportion of viewport per spec ("up to 90%")
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
    paddingTop: t.spaceSm, // not named by any binding; matches Dialog's heading-group gap precedent
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
    justifyContent: 'space-between',
    gap: t.layoutGapNormal,
  };

  const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingBottom: inset,
  };

  return (
    <Modal visible={mounted} transparent onRequestClose={handleRequestClose} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} />
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleScrimPress}
          accessible={false}
          testID="BottomSheet.scrim"
        />
        <View style={anchorStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="first" restoreFocus>
            <Animated.View
              style={surfaceStyle}
              onLayout={handleSurfaceLayout}
              accessibilityViewIsModal
              accessibilityLabel={heading}
              testID="BottomSheet"
            >
              <View {...(dragToDismiss && dismissible ? panResponder.panHandlers : null)} style={headerStyle} testID="BottomSheet.header">
                <View style={handleStyle} accessibilityElementsHidden importantForAccessibility="no" testID="BottomSheet.handle" />
                <View style={headingRowStyle}>
                  {!hideHeading ? <Heading level={2}>{heading}</Heading> : null}
                  <Button
                    label={COPY.closeLabel}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    disabled={!dismissible}
                    leadingIcon={<Icon name="close" color={t.colorActionGhostForeground} />}
                    onPress={handleCloseButtonPress}
                  />
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
