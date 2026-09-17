import * as React from 'react';
import { AccessibilityInfo, Animated, Modal, StyleSheet, View, findNodeHandle, useWindowDimensions } from 'react-native';
import type { ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { Stack } from './Stack';
import { Text } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';

export type AlertDialogTone = 'danger' | 'warning' | 'info';
/** Why `onCancel` fired: the Cancel button, or Escape (the Android back button, the VoiceOver escape gesture). A scrim tap fires nothing. */
export type AlertDialogCancelReason = 'cancel' | 'escape';

/** The style bindings a caller may replace with a different token; `surface`, `icon`, `focusRing` and `focusRingWidth` are locked. */
export type AlertDialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'textGap'
  | 'iconGap'
  | 'footerGap'
  | 'iconSize'
  | 'width'
  | 'gutter'
  | 'layer'
  | 'enter'
  | 'exit';

export interface AlertDialogProps {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). On native `level` only sets the size. */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences, as muted Text. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet, through the confirm Button's own `disabled` (focusable but inert). Cancel always works. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape. A scrim tap does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  cancelLabel: 'Cancel',
} as const;

const TONE = {
  danger: { icon: 'color.status.danger.icon', glyph: 'danger', confirmVariant: 'danger' },
  warning: { icon: 'color.status.warning.icon', glyph: 'warning', confirmVariant: 'primary' },
  info: { icon: 'color.status.info.icon', glyph: 'info', confirmVariant: 'primary' },
} as const satisfies Record<AlertDialogTone, { icon: TokenRef; glyph: IconName; confirmVariant: ButtonVariant }>;

/**
 * AlertDialog — a Dialog with one job: get a considered yes or no before an action
 * that destroys data, spends money, or cannot be undone.
 *
 * A native `Modal` (`transparent`, `animationType="none"` — the component animates
 * itself, `statusBarTranslucent`). The scrim is a plain `View` with no press handler
 * or responder, so a stray tap reaches nothing, and there is no close button: the
 * only ways out are Cancel and Confirm. Android back (`onRequestClose`) and the
 * VoiceOver escape gesture report `onCancel('escape')`. Inside a `FocusScope`
 * (`trapped`, `restoreFocus`, `autoFocus="none"`) the surface carries
 * `role="alertdialog"`, `accessibilityViewIsModal`, `accessibilityLabel={heading}` and
 * `accessibilityHint={description}`. Accessibility focus is placed on the View
 * wrapping the heading after the enter animation (at once under reduced motion) so
 * the question is read; Cancel precedes Confirm in the accessibility order. The tone
 * Icon is decorative and colored through its own `overrides.color`. Scroll lock has
 * no native meaning and is not implemented. Rooted in a Modal, it exposes no ref.
 */
export function AlertDialog({
  open,
  heading,
  description,
  tone = 'danger',
  confirmLabel,
  cancelLabel,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  overrides,
}: AlertDialogProps): React.JSX.Element | null {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const toneEntry = TONE[tone];

  // Kept mounted while the exit animation runs; derived during render so the Modal content exists on the open commit.
  const [mounted, setMounted] = React.useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  const progress = React.useRef(new Animated.Value(0)).current;
  const headingRef = React.useRef<ViewInstance>(null);

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const textGap = overrides?.textGap ? (resolveToken(t, overrides.textGap) as number) : t.layoutGapTight;
  const iconGap = overrides?.iconGap ? (resolveToken(t, overrides.iconGap) as number) : t.layoutGapNormal;
  const width = overrides?.width ? (resolveToken(t, overrides.width) as number) : t.layoutMaxWidthProse;
  const gutter = overrides?.gutter ? (resolveToken(t, overrides.gutter) as number) : t.layoutGutter;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDialog;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;

  const focusHeading = (): void => {
    const node = headingRef.current ? findNodeHandle(headingRef.current) : null;
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
        focusHeading();
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
          focusHeading();
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
    // animation config is read fresh each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mounted, reducedMotion]);

  // Android back and the VoiceOver escape gesture; confirmDisabled never blocks it.
  const handleEscape = (): void => {
    onCancel?.('escape');
  };

  const handleCancelPress = (): void => {
    onCancel?.('cancel');
  };

  const handleConfirmPress = (): void => {
    onConfirm?.();
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
    maxWidth: width,
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
    padding: inset,
    gap: partGap,
  };

  const contentRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: iconGap,
  };

  const textGroupStyle: ViewStyle = {
    flexShrink: 1,
    gap: textGap,
  };

  const iconOverrides = { color: toneEntry.icon, size: overrides?.iconSize ?? 'font.size.lg' } as const;
  const footerOverrides = overrides?.footerGap ? { gap: overrides.footerGap } : undefined;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleEscape} statusBarTranslucent>
      <View style={hostStyle} testID="AlertDialog">
        <Animated.View style={scrimStyle} testID="AlertDialog.scrim" />
        <View style={centerStyle} pointerEvents="box-none">
          <FocusScope trapped active={open} autoFocus="none" restoreFocus>
            <Animated.View style={motionStyle}>
              <View
                style={surfaceStyle}
                role="alertdialog"
                accessibilityViewIsModal
                accessibilityLabel={heading}
                accessibilityHint={description}
                onAccessibilityEscape={handleEscape}
                testID="AlertDialog.surface"
              >
                <View style={contentRowStyle}>
                  <View
                    testID="AlertDialog.icon"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    <Icon name={toneEntry.glyph} overrides={iconOverrides} />
                  </View>
                  <View style={textGroupStyle}>
                    <View ref={headingRef} testID="AlertDialog.heading">
                      <Heading level="2">{heading}</Heading>
                    </View>
                    <View testID="AlertDialog.description">
                      <Text tone="muted">{description}</Text>
                    </View>
                  </View>
                </View>
                <View testID="AlertDialog.footer">
                  <Stack direction="horizontal" gap="tight" justify="end" overrides={footerOverrides}>
                    <View testID="AlertDialog.cancelButton">
                      <Button
                        label={cancelLabel ?? COPY.cancelLabel}
                        variant="secondary"
                        size="md"
                        onPress={handleCancelPress}
                      />
                    </View>
                    <View testID="AlertDialog.confirmButton">
                      <Button
                        label={confirmLabel}
                        variant={toneEntry.confirmVariant}
                        size="md"
                        disabled={confirmDisabled}
                        onPress={handleConfirmPress}
                      />
                    </View>
                  </Stack>
                </View>
              </View>
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
