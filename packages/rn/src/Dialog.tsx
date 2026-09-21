import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogInitialFocus = 'first' | 'title' | 'close';
/** Why `onClose` fired. `action` is never emitted by Dialog itself — it exists for a footer action that reports a close through the same handler. */
export type DialogCloseReason = 'escape' | 'close-button' | 'scrim' | 'action';

/** The style bindings a caller may replace with a different token; `surface`, `focusRing` and `focusRingWidth` are locked. */
export type DialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'gutter'
  | 'headerGap'
  | 'footerGap'
  | 'descriptionGap'
  | 'widthSm'
  | 'widthMd'
  | 'widthLg'
  | 'layer'
  | 'enter'
  | 'exit';

export interface DialogProps {
  /** Controlled only — there is no uncontrolled mode. The consumer owns `open`; the dialog never closes itself and requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: React.ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: React.ReactNode;
  /** Visually hide the heading while it remains the accessible name. RN has no visually hidden primitive, so the Heading is not rendered and the surface's accessibilityLabel stays the name. */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim press all request close. When `false` the close button is not rendered and the scrim does nothing; Escape (Android back, VoiceOver escape) still fires `onClose('escape')`. */
  dismissible?: boolean | undefined;
  /** Where accessibility focus lands on open: the body (default), the title, or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in; on the next frame after focus when there is no transition. */
  onOpened?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/**
 * Dialog — interrupts for one task and gives the screen back when it is done or
 * abandoned.
 *
 * A native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself, `statusBarTranslucent`) holding a full-screen scrim `Pressable` and, inside
 * a `FocusScope`, the surface `View` with `role="dialog"`, `accessibilityViewIsModal`,
 * `accessibilityLabel={heading}` and `accessibilityHint={description}`. Android back
 * (`onRequestClose`) and the VoiceOver escape gesture (`onAccessibilityEscape`) both
 * report `onClose('escape')`, even when not dismissible. Native has no descendant
 * walker, so `initialFocus` calls `setAccessibilityFocus` on the View wrapping the
 * title, the close button or the body, after the enter animation; there is no visible
 * focus ring on those targets. Scroll lock has no native meaning and is not
 * implemented. The Dialog is rooted in a Modal and exposes no ref.
 *
 * `inset` is applied once each way so nothing doubles between parts: the surface
 * column carries the block padding (top and bottom), the header and footer wrappers
 * the inline padding, and the body `Box` receives it as `overrides.paddingInline`
 * with zero block padding of its own.
 */
export function Dialog({
  open,
  heading,
  description,
  children,
  footer,
  hideHeading = false,
  size = 'md',
  dismissible = true,
  initialFocus = 'first',
  onClose,
  onOpened,
  overrides,
}: DialogProps): React.JSX.Element | null {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();

  // Kept mounted while the exit animation runs; derived during render so the Modal content exists on the open commit.
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  const progress = React.useRef(new Animated.Value(0)).current;

  const surfaceRef = React.useRef<ViewInstance>(null);
  const titleGroupRef = React.useRef<ViewInstance>(null);
  const closeButtonRef = React.useRef<ViewInstance>(null);
  const bodyRef = React.useRef<ViewInstance>(null);

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const gutter = overrides?.gutter ? (resolveToken(t, overrides.gutter) as number) : t.layoutGutter;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const descriptionGap = overrides?.descriptionGap
    ? (resolveToken(t, overrides.descriptionGap) as number)
    : t.layoutGapTight;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDialog;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  const widthSm = overrides?.widthSm ? (resolveToken(t, overrides.widthSm) as number) : t.layoutMaxWidthProse;
  // An override replaces the base; the × 0.75 stays in the rule.
  const widthMdBase = overrides?.widthMd ? (resolveToken(t, overrides.widthMd) as number) : t.layoutMaxWidthContent;
  const widthLg = overrides?.widthLg ? (resolveToken(t, overrides.widthLg) as number) : t.layoutMaxWidthContent;
  const sizeWidth: Record<DialogSize, number> = {
    sm: widthSm,
    md: widthMdBase * 0.75, // literal-ok: the schema's computed multiplier for widthMd
    lg: widthLg,
  };

  const focusInitial = (): void => {
    let target: ViewInstance | null;
    if (initialFocus === 'title') {
      // With hideHeading the Heading is not rendered, so the surface (which carries the name) takes focus.
      target = hideHeading ? surfaceRef.current : titleGroupRef.current;
    } else if (initialFocus === 'close' && dismissible) {
      target = closeButtonRef.current;
    } else {
      // `first`, and `close` without a close button: body, then footer, then close button, then heading — the body always renders.
      target = bodyRef.current;
    }
    const node = target ? findNodeHandle(target) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

  React.useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    if (open) {
      if (reducedMotion || enterDuration === 0) {
        progress.setValue(1);
        focusInitial();
        const frame = requestAnimationFrame(() => onOpened?.());
        return () => cancelAnimationFrame(frame);
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      // `finished` is false when `open` went false first, so onOpened does not fire for an interrupted enter.
      animation.start(({ finished }) => {
        if (finished) {
          focusInitial();
          onOpened?.();
        }
      });
      return () => animation.stop();
    }
    if (reducedMotion || exitDuration === 0) {
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
    // Runs on the open/closed transition and the mount gate it drives; the
    // animation config and handlers are read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  const handleScrimPress = (): void => {
    if (dismissible) {
      onClose?.('scrim');
    }
  };

  const handleCloseButtonPress = (): void => {
    onClose?.('close-button');
  };

  // Android back and the VoiceOver escape gesture: always reported, the consumer decides.
  const handleEscape = (): void => {
    onClose?.('escape');
  };

  if (!mounted) {
    return null;
  }

  const hostStyle: ViewStyle = { flex: 1 };

  const scrimStyle: Animated.WithAnimatedValue<ViewStyle> = {
    ...StyleSheet.absoluteFill,
    backgroundColor: scrimColor,
    opacity: progress,
  };

  const centerStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: gutter,
    zIndex: layer,
  };

  const motionStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    maxWidth: sizeWidth[size],
    maxHeight: windowHeight - 2 * gutter,
    borderRadius: radius,
    ...shadow,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [t.space2, 0] }) }],
  };

  const surfaceStyle: ViewStyle = {
    flexShrink: 1,
    borderRadius: radius,
    borderWidth,
    borderColor,
    backgroundColor: t.colorOverlaySurface,
    overflow: 'hidden',
    gap: partGap,
    // The block half of `inset`, once at the top and once at the bottom of the column.
    paddingVertical: inset,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: headerGap,
    paddingHorizontal: inset,
  };

  const titleGroupStyle: ViewStyle = {
    flexShrink: 1,
    gap: descriptionGap,
  };

  const bodyStyle: ViewStyle = { flexShrink: 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle}>
        <Animated.View style={scrimStyle}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleScrimPress}
            accessible={false}
            testID="Dialog.scrim"
          />
        </Animated.View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={centerStyle}
          pointerEvents="box-none"
        >
          <FocusScope trapped active={open} autoFocus="none" restoreFocus>
            <Animated.View style={motionStyle}>
              <View
                ref={surfaceRef}
                style={surfaceStyle}
                role="dialog"
                accessibilityViewIsModal
                accessibilityLabel={heading}
                accessibilityHint={description}
                onAccessibilityEscape={handleEscape}
                testID="Dialog"
              >
                <View style={headerStyle} testID="Dialog.header">
                  <View ref={titleGroupRef} style={titleGroupStyle}>
                    {!hideHeading ? <Heading level="2">{heading}</Heading> : null}
                    {description !== undefined ? <Text tone="muted">{description}</Text> : null}
                  </View>
                  {dismissible ? (
                    <View ref={closeButtonRef}>
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
                <View ref={bodyRef} style={bodyStyle} testID="Dialog.body">
                  <ScrollView style={bodyStyle} keyboardShouldPersistTaps="handled">
                    {/* `inset` reaches the Box only as a token path through its own overrides, always sent; the block padding stays on the surface. */}
                    <Box inset="none" overrides={{ paddingInline: overrides?.inset ?? 'layout.inset.lg' }}>
                      {children}
                    </Box>
                  </ScrollView>
                </View>
                {footer !== undefined ? (
                  <View style={footerStyle} testID="Dialog.footer">
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
              </View>
            </Animated.View>
          </FocusScope>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
