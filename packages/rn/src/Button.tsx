import * as React from 'react';
import { ActivityIndicator, Pressable, Text as RNText, View } from 'react-native';
import type { Insets, LayoutChangeEvent, PressableStateCallbackType, TextStyle, ViewStyle } from 'react-native';
import { useFormContext } from './FormContext';
import { toFontWeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

export interface ButtonProps {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant;
  /** Controls padding. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType;
  /** Prevents activation. The button stays in the accessibility tree and is announced as disabled. */
  disabled?: boolean;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. Decorative, like `leadingIcon`. */
  trailingIcon?: React.ReactNode;
  /** Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`). */
  iconOnly?: boolean;
  /** Shows progress and blocks repeat activation while an action is pending. */
  loading?: boolean;
  /** Fired when the button is activated by touch, keyboard, or assistive technology. */
  onPress?: () => void;
}

const VARIANT_TOKENS = {
  primary: {
    background: 'colorActionPrimaryBackground',
    backgroundHover: 'colorActionPrimaryBackgroundHover',
    foreground: 'colorActionPrimaryForeground',
  },
  secondary: {
    background: 'colorActionSecondaryBackground',
    backgroundHover: 'colorActionSecondaryBackgroundHover',
    foreground: 'colorActionSecondaryForeground',
  },
  ghost: {
    background: 'colorActionGhostBackground',
    backgroundHover: 'colorActionGhostBackgroundHover',
    foreground: 'colorActionGhostForeground',
  },
  danger: {
    background: 'colorActionDangerBackground',
    backgroundHover: 'colorActionDangerBackgroundHover',
    foreground: 'colorActionDangerForeground',
  },
} as const satisfies Record<ButtonVariant, Record<'background' | 'backgroundHover' | 'foreground', keyof Tokens>>;

const SIZE_TOKEN = {
  sm: 'spaceSm',
  md: 'spaceMd',
  lg: 'spaceLg',
} as const satisfies Record<ButtonSize, keyof Tokens>;

/**
 * Button — lets people take an action with a single tap.
 *
 * When to use: Use a Button when the user needs to **do something**: submit, save,
 * confirm, open, add, delete. The label should be a verb or verb phrase that
 * describes the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view. Use
 * `secondary` for the alternatives beside it, `ghost` for low-emphasis actions in
 * dense UI such as toolbars, and `danger` only for destructive, hard-to-undo actions.
 *
 * Renders a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel` and
 * `accessibilityState={{ disabled, busy }}`. There is no hover on touch, so the
 * `backgroundHover` token styles the pressed state. When the measured footprint is
 * smaller than the comfortable 44px target, `hitSlop` makes up the difference.
 * `type="submit"` calls `submit()` on the nearest Form context. `leadingIcon` and
 * `trailingIcon` render in decorative wrappers (`accessibilityElementsHidden`,
 * `importantForAccessibility="no"`); `iconOnly` keeps only the leading one.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  leadingIcon,
  trailingIcon,
  iconOnly = false,
  loading = false,
  onPress,
}: ButtonProps): React.JSX.Element {
  const { tokens } = useTheme();
  const form = useFormContext();
  const [focused, setFocused] = React.useState(false);
  const [layout, setLayout] = React.useState<{ width: number; height: number } | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const colors = VARIANT_TOKENS[variant];
  const background = tokens[colors.background];
  const backgroundPressed = tokens[colors.backgroundHover];
  const foreground = tokens[colors.foreground];

  // Before the first layout, assume the visual is at the minimum target so the
  // comfortable target is still reachable.
  const slop = (extent: number | undefined): number =>
    Math.max(0, Math.ceil((tokens.sizeTargetComfortable - (extent ?? tokens.sizeTargetMin)) / 2));
  const hitSlop: Insets = {
    top: slop(layout?.height),
    bottom: slop(layout?.height),
    left: slop(layout?.width),
    right: slop(layout?.width),
  };

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setLayout((prev) => (prev !== null && prev.width === width && prev.height === height ? prev : { width, height }));
  };

  const handlePress = (): void => {
    if (isDisabled || loading) {
      return;
    }
    onPress?.();
    if (type === 'submit') {
      form?.submit();
    }
  };

  const containerStyle = ({ pressed }: PressableStateCallbackType): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: tokens.sizeTargetMin,
    minHeight: tokens.sizeTargetMin,
    gap: tokens.space2,
    paddingHorizontal: iconOnly ? tokens.spaceSm : tokens[SIZE_TOKEN[size]],
    paddingVertical: tokens.spaceSm,
    borderRadius: tokens.radiusMd,
    backgroundColor: pressed && !isDisabled && !loading ? backgroundPressed : background,
    // The focus ring is always laid out so focusing never shifts content; when the
    // button is not focused the ring takes the button's own background color.
    borderWidth: tokens.borderWidthFocus,
    borderColor: focused ? tokens.colorBorderFocus : background,
    opacity: isDisabled ? tokens.opacityDisabled : 1,
  });

  const labelStyle: TextStyle = {
    fontFamily: tokens.fontFamilyBody,
    fontWeight: toFontWeight(tokens.fontWeightMedium),
    fontSize: tokens.fontSizeMd,
    color: foreground,
    textAlign: 'center',
    // Keep the label's footprint while loading so the layout does not shift.
    opacity: loading ? 0 : 1,
  };

  // Icons are decorative and hide with the label while loading so the layout holds.
  const iconStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: loading ? 0 : 1,
  };

  const spinnerStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={handlePress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={handleLayout}
      style={containerStyle}
    >
      {leadingIcon !== undefined && leadingIcon !== null ? (
        <View style={iconStyle} accessibilityElementsHidden importantForAccessibility="no">
          {leadingIcon}
        </View>
      ) : null}
      {iconOnly ? null : (
        <RNText allowFontScaling style={labelStyle}>
          {label}
        </RNText>
      )}
      {!iconOnly && trailingIcon !== undefined && trailingIcon !== null ? (
        <View style={iconStyle} accessibilityElementsHidden importantForAccessibility="no">
          {trailingIcon}
        </View>
      ) : null}
      {loading ? (
        <View style={spinnerStyle} pointerEvents="none">
          <ActivityIndicator color={foreground} />
        </View>
      ) : null}
    </Pressable>
  );
}
