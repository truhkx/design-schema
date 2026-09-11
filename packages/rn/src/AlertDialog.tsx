import * as React from 'react';
import { AccessibilityInfo, Animated, Modal, StyleSheet, View, findNodeHandle } from 'react-native';
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
import type { Tokens } from './theme';

export type AlertDialogTone = 'danger' | 'warning' | 'info';
/** Why `onCancel` fired: the Cancel button or Escape/the Android back gesture. A scrim tap does neither — it is inert. */
export type AlertDialogCancelReason = 'cancel' | 'escape';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
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
  | 'layer'
  | 'enter'
  | 'exit';

export interface AlertDialogProps {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet. Cancel always works. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape/back. A scrim tap does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}

const COPY = {
  cancelLabel: 'Cancel',
} as const;

const TONE = {
  danger: { icon: 'colorStatusDangerIcon', glyph: 'danger', confirmVariant: 'danger' },
  warning: { icon: 'colorStatusWarningIcon', glyph: 'warning', confirmVariant: 'primary' },
  info: { icon: 'colorStatusInfoIcon', glyph: 'info', confirmVariant: 'primary' },
} as const satisfies Record<AlertDialogTone, { icon: keyof Tokens; glyph: IconName; confirmVariant: ButtonVariant }>;

/**
 * AlertDialog — a Dialog with one job: get a considered yes or no before an action
 * that destroys data, spends money, or cannot be undone.
 *
 * When to use: Use before a destructive, costly or unrecoverable action, and only
 * when undo is not available — `tone: danger` for destruction, `warning` for
 * consequential-but-recoverable, `info` for a no-downside decision that still needs
 * a choice. Do not use it for reversible actions (offer undo instead), to show
 * information (Alert, Dialog), or as a general "are you sure" habit.
 *
 * Renders a native `Modal` (`transparent`, `animationType="none"`) with a plain
 * scrim `View` — unlike Dialog there is no scrim `Pressable`, so a stray tap cannot
 * dismiss a decision — and a centered surface composing `FocusScope` (`trapped`,
 * `restoreFocus`) for the trap and focus-restore. There is no close button: the only
 * ways out are Cancel and Confirm. `onRequestClose` (the Android back gesture)
 * always reports `onCancel('escape')`. Initial accessibility focus lands on the
 * title once the enter animation finishes (or immediately under reduced motion) so
 * the question is read first; Cancel precedes Confirm in the accessibility order so
 * a reflexive Enter cancels rather than confirms. The icon, its color and the
 * confirm button's variant come from the `tone` lookup table. Buttons are the
 * system `Button` (`secondary` for Cancel; `danger` or `primary` for Confirm by
 * tone) — never restyled. The surface also carries the RN >= 0.74
 * `role="alertdialog"` prop alongside `accessibilityViewIsModal`, matching Dialog's
 * `role="dialog"`.
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
}: AlertDialogProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const resolvedCancelLabel = cancelLabel ?? COPY.cancelLabel;
  const toneTokens = TONE[tone];

  const [mounted, setMounted] = React.useState(open);
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current;
  const titleRef = React.useRef<ViewInstance>(null);

  const scrimColor = overrides?.scrim ? (resolveToken(t, overrides.scrim) as string) : t.colorOverlayScrim;
  const surfaceColor = t.colorOverlaySurface;
  const borderColor = overrides?.border ? (resolveToken(t, overrides.border) as string) : t.colorBorder;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const shadow = overrides?.shadow ? (resolveToken(t, overrides.shadow) as typeof t.shadowOverlay) : t.shadowOverlay;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusLg;
  const inset = overrides?.inset ? (resolveToken(t, overrides.inset) as number) : t.layoutInsetLg;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.layoutGapLoose;
  const textGap = overrides?.textGap ? (resolveToken(t, overrides.textGap) as number) : t.layoutGapTight;
  const iconGap = overrides?.iconGap ? (resolveToken(t, overrides.iconGap) as number) : t.layoutGapNormal;
  const width = overrides?.width ? (resolveToken(t, overrides.width) as number) : t.layoutMaxWidthProse;
  const layer = overrides?.layer ? (resolveToken(t, overrides.layer) as number) : t.layerDialog;
  const enterDuration = overrides?.enter ? (resolveToken(t, overrides.enter) as number) : t.motionDurationBase;
  const exitDuration = overrides?.exit ? (resolveToken(t, overrides.exit) as number) : t.motionDurationFast;
  const iconColor = t[toneTokens.icon];

  const focusTitle = React.useCallback(() => {
    const node = titleRef.current ? findNodeHandle(titleRef.current) : null;
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

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
        focusTitle();
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
          focusTitle();
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

  const handleRequestClose = (): void => {
    onCancel?.('escape');
  };

  const handleCancelPress = (): void => {
    onCancel?.('cancel');
  };

  const handleConfirmPress = (): void => {
    onConfirm?.();
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
    maxWidth: width,
    maxHeight: '90%', // literal-ok: a proportion of the viewport, not a design token
    borderRadius: radius,
    ...shadow,
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [t.space2, 0] }) }],
  };

  const innerSurfaceStyle: ViewStyle = {
    borderRadius: radius,
    borderWidth,
    borderColor,
    backgroundColor: surfaceColor,
    overflow: 'hidden',
    padding: inset,
    gap: partGap,
  };

  const iconRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: iconGap,
  };

  const titleGroupStyle: ViewStyle = {
    flexShrink: 1,
    gap: textGap,
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
        <Animated.View style={scrimStyle} testID="AlertDialog.scrim" />
        <View style={centerStyle} pointerEvents="box-none">
          <FocusScope trapped active={mounted} autoFocus="none" restoreFocus>
            <Animated.View
              style={outerSurfaceStyle}
              role="alertdialog"
              accessibilityViewIsModal
              accessibilityLabel={heading}
              accessibilityHint={description}
              testID="AlertDialog"
            >
              <View style={innerSurfaceStyle}>
                <View style={iconRowStyle}>
                  <Icon
                    name={toneTokens.glyph}
                    size="lg"
                    color={iconColor}
                    overrides={overrides?.iconSize ? { size: overrides.iconSize } : undefined}
                  />
                  <View ref={titleRef} style={titleGroupStyle}>
                    <Heading level={2}>{heading}</Heading>
                    <Text tone="muted">{description}</Text>
                  </View>
                </View>
                <Stack
                  direction="horizontal"
                  gap="tight"
                  justify="end"
                  overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
                >
                  <Button label={resolvedCancelLabel} variant="secondary" onPress={handleCancelPress} />
                  <Button
                    label={confirmLabel}
                    variant={toneTokens.confirmVariant}
                    disabled={confirmDisabled}
                    onPress={handleConfirmPress}
                  />
                </Stack>
              </View>
            </Animated.View>
          </FocusScope>
        </View>
      </View>
    </Modal>
  );
}
