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
} from 'react-native';
import type { ScrollViewInstance, ViewInstance, ViewStyle } from 'react-native';
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
/** Why `onClose` fired. `action` is never emitted by Dialog itself — it exists for a consumer whose footer action also wants to report a close through the same callback. */
export type DialogCloseReason = 'escape' | 'close-button' | 'scrim' | 'action';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'headerGap'
  | 'footerGap'
  | 'descriptionGap'
  | 'widthSm'
  | 'layer'
  | 'enter'
  | 'exit';

export interface DialogProps {
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: React.ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: React.ReactNode;
  /** Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim click all request close. Set `false` for a dialog that must be answered (then provide the answers in the footer); Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  closeLabel: 'Close',
} as const;

/**
 * Dialog — interrupts for one task and gives the screen back when it's done or
 * abandoned. The scrim, trapped focus, inert background, Escape and focus-restore
 * exist to make that interruption safe and reversible.
 *
 * When to use: Use for a short task that must complete before the user continues:
 * rename, create-with-a-few-fields, choose from options with consequences. Keep it
 * to one screen of content. Do not use it for a message needing no decision (Alert),
 * a destructive confirmation (AlertDialog), or content that benefits from the page
 * staying visible (Popover/Disclosure).
 *
 * Renders a native `Modal` (`transparent`, `animationType="none"` — the component
 * animates itself) containing a full-screen scrim `Pressable` and a centered surface.
 * The surface composes `FocusScope` (`trapped`, `restoreFocus`) for the trap and
 * focus-restore-on-close; on native there is no descendant walker, so `initialFocus`
 * is implemented by hand with `AccessibilityInfo.setAccessibilityFocus` on the title,
 * the close button, or the body, once the enter animation finishes (or immediately
 * under reduced motion). `onRequestClose` (the Android back gesture) always reports
 * `onClose('escape')`, even when `dismissible` is `false` — the consumer decides,
 * because a keyboard/switch-access user must always have a reported way out. The
 * accessible name comes from `accessibilityLabel={heading}` on the modal surface
 * regardless of `hideHeading`, so hiding the heading only removes its visible
 * `Heading`, never the announced name. The surface also carries the RN >= 0.74
 * `role="dialog"` prop alongside `accessibilityViewIsModal`, as Landmark and
 * Fieldset use `role` for their own semantics. The `size` widths and `enter`/`exit`
 * durations are the same tokens as web; `widthSm` is the only overridable width, per
 * the schema. Scroll-lock has no native equivalent — there is no page scroll for a
 * modal window to suppress — so it is not implemented; the acknowledged limit is
 * `initialFocus` targeting a wrapping `View` rather than the first real focusable
 * descendant, the same limit `FocusScope` documents for itself.
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
}: DialogProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();

  const [mounted, setMounted] = React.useState(open);
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;

  const titleGroupRef = React.useRef<ViewInstance>(null);
  const closeButtonRef = React.useRef<ViewInstance>(null);
  const bodyRef = React.useRef<ScrollViewInstance>(null);

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapNormal;
  const descriptionGap = overrides?.descriptionGap
    ? (resolveToken(t, overrides.descriptionGap) as number)
    : t.layoutGapTight;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDialog;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  const widthSm = overrides?.widthSm ? (resolveToken(t, overrides.widthSm) as number) : t.layoutMaxWidthProse;
  // md/lg are 3/4 of and equal to layout.maxWidth.content — derived, not new tokens, and not independently overridable.
  const sizeWidth: Record<DialogSize, number> = {
    sm: widthSm,
    md: t.layoutMaxWidthContent * 0.75, // literal-ok: 3/4 of the content token per spec, not a design literal
    lg: t.layoutMaxWidthContent,
  };

  const focusInitial = React.useCallback(() => {
    const targetRef = initialFocus === 'title' ? titleGroupRef : initialFocus === 'close' ? closeButtonRef : bodyRef;
    const node = targetRef.current ? findNodeHandle(targetRef.current) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [initialFocus]);

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
      if (reducedMotion) {
        progress.setValue(1);
        onOpened?.();
        focusInitial();
        return undefined;
      }
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: enterDuration,
        easing: toEasing(t.motionEasingStandard),
        // react-native-web has no native animated module.
        useNativeDriver: false,
      });
      animation.start(({ finished }) => {
        if (finished) {
          onOpened?.();
          focusInitial();
        }
      });
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
      console.warn('Dialog: with no footer and dismissible={false}, provide a way to close the dialog in its body.');
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
    paddingHorizontal: t.layoutGutter,
    zIndex: layer,
  };

  const outerSurfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: '100%',
    maxWidth: sizeWidth[size],
    maxHeight: '90%', // literal-ok: a proportion of the viewport, not a design token
    borderRadius: radius,
    ...shadow,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [t.space2, 0] }) }],
  };

  const innerSurfaceStyle: ViewStyle = {
    flexShrink: 1,
    borderRadius: radius,
    borderWidth,
    borderColor,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
    gap: partGap,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: headerGap,
    paddingHorizontal: inset,
    paddingTop: inset,
  };

  const titleGroupStyle: ViewStyle = {
    flexShrink: 1,
    gap: descriptionGap,
  };

  const bodyFlexStyle: ViewStyle = { flexShrink: 1 };
  const bodyContentStyle: ViewStyle = { flexGrow: 1 };

  const footerStyle: ViewStyle = {
    paddingHorizontal: inset,
    paddingBottom: inset,
  };

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={handleRequestClose}
      statusBarTranslucent
    >
      <View style={hostStyle}>
        <Animated.View style={scrimStyle} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleScrimPress}
          accessible={false}
          testID="Dialog.scrim"
        />
        <View style={centerStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="none" restoreFocus>
            <Animated.View
              style={outerSurfaceStyle}
              role="dialog"
              accessibilityViewIsModal
              accessibilityLabel={heading}
              accessibilityHint={description}
              testID="Dialog"
            >
              <View style={innerSurfaceStyle}>
                <View style={headerStyle} testID="Dialog.header">
                  <View ref={titleGroupRef} style={titleGroupStyle}>
                    {!hideHeading ? <Heading level={2}>{heading}</Heading> : null}
                    {description !== undefined ? <Text tone="muted">{description}</Text> : null}
                  </View>
                  <View ref={closeButtonRef}>
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={bodyFlexStyle}>
                  <ScrollView
                    ref={bodyRef}
                    testID="Dialog.body"
                    style={bodyFlexStyle}
                    contentContainerStyle={bodyContentStyle}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Box inset="lg" overrides={overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined}>
                      {children}
                    </Box>
                  </ScrollView>
                </KeyboardAvoidingView>
                {footer !== undefined ? (
                  <View style={footerStyle} testID="Dialog.footer">
                    <Stack
                      direction="horizontal"
                      gap="tight"
                      justify="end"
                      overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
                    >
                      {footer}
                    </Stack>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
