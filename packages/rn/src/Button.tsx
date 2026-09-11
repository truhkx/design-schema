import * as React from 'react';
import { Animated, Easing, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { Insets, LayoutChangeEvent, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import { toEasing, toFontWeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';
import { trackPress } from './custom/analytics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type ButtonOverridableBinding =
  | 'backgroundHover'
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin'
  | 'spinnerStroke';

/** The pair sent to `onTrack` after a tracked press. */
export interface ButtonTrackEvent {
  name: string;
  label: string;
}

export interface ButtonProps {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant;
  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure):
   * reflected to `accessibilityState.expanded`. `undefined` (the default) means this
   * button does not disclose anything, so `expanded` is omitted from the state object
   * rather than sent as `false`. Consumers rarely set it directly.
   */
  expanded?: boolean;
  /** Prevents activation. The button stays in the accessibility tree and is announced as disabled. */
  disabled?: boolean;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. Decorative, like `leadingIcon`. */
  trailingIcon?: React.ReactNode;
  /** Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`). */
  iconOnly?: boolean;
  /** Replaces the icon slot with a ring spinner, keeps the label in place, and blocks repeat activation while an action is pending. */
  loading?: boolean;
  /**
   * The button sits on an inverse surface (Toast, tooltip-like panels). Only
   * meaningful on `ghost`, whose text switches to `color.inverse.link`; every
   * variant's focus ring switches to `color.inverse.focus` since that ring must
   * read against the inverse surface regardless of the button's own fill.
   */
  inverse?: boolean;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort
   * by Amount, ascending" on a header that shows "Amount"). The visible label must be
   * the start of it (WCAG 2.5.3 label-in-name). Maps to `accessibilityLabel`.
   */
  accessibleName?: string;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow Menu. Not
   * rendered by Button itself — read by the collapsing parent.
   */
  overflowLabel?: string;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ButtonOverridableBinding, TokenRef>>;
  /** Fired when the button is activated by touch, keyboard, or assistive technology. */
  onPress?: () => void;
  /** Fired after `onPress` with the `track` name and the button's label, only when `track` is set. */
  onTrack?: (event: ButtonTrackEvent) => void;
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

const PADDING_INLINE_TOKEN = {
  sm: 'spaceSm',
  md: 'spaceMd',
  lg: 'spaceLg',
} as const satisfies Record<ButtonSize, keyof Tokens>;

const FONT_SIZE_TOKEN = {
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
  lg: 'fontSizeLg',
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
 * Renders a `Pressable` with `accessibilityRole="button"`, `accessibilityLabel`
 * (`accessibleName` when set, else `label`) and `accessibilityState={{ disabled, busy,
 * expanded }}` (`expanded` omitted unless a disclosing parent sets it). `disabled` is
 * never passed to `Pressable`
 * itself — that would drop it from the tab order — so a disabled button stays
 * focusable and is announced as disabled while a press guard blocks `onPress`. There
 * is no hover on touch, so `backgroundHover` animates in for the pressed state instead
 * (over `transition`, eased with `motion.easing.standard`, skipped under reduced
 * motion); the focus ring is a border drawn in `color.border.focus` (or
 * `color.inverse.focus` when `inverse`) that is transparent, not absent, so focusing
 * never shifts layout. `loading` replaces the leading icon slot with a ring spinner
 * that rotates continuously over `loadingSpin` (frozen under reduced motion), hides
 * `trailingIcon`, and keeps the label visible; it also blocks repeat activation
 * alongside `disabled`. `inverse` only changes `ghost`'s foreground token; other
 * variants keep their own fills. `type="submit"` calls `submit()` on the nearest Form
 * context. `track`, when set, calls the hand-written `trackPress(name, label)` after
 * `onPress` and before `onTrack` fires with the same pair. When the measured
 * footprint is smaller than the comfortable target, `hitSlop` makes up the
 * difference. `leadingIcon`/`trailingIcon` render in decorative wrappers
 * (`accessibilityElementsHidden`, `importantForAccessibility="no"`); there is no
 * cascade, so callers color glyphs with the variant's foreground themselves.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  type = 'button',
  expanded,
  disabled = false,
  leadingIcon,
  trailingIcon,
  iconOnly = false,
  loading = false,
  inverse = false,
  accessibleName,
  track,
  overrides,
  onPress,
  onTrack,
}: ButtonProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();

  const [focused, setFocused] = React.useState(false);
  const [pressedState, setPressedState] = React.useState(false);
  const [layout, setLayout] = React.useState<{ width: number; height: number } | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const colors = VARIANT_TOKENS[variant];

  const background = t[colors.background];
  const backgroundHover = overrides?.backgroundHover
    ? (resolveToken(t, overrides.backgroundHover) as string)
    : t[colors.backgroundHover];
  // Only `ghost` is meaningful on an inverse surface; other variants keep their own fills.
  const foreground = variant === 'ghost' && inverse ? t.colorInverseLink : t[colors.foreground];
  const focusRingColor = inverse ? t.colorInverseFocus : t.colorBorderFocus;

  const iconGap = overrides?.iconGap ? (resolveToken(t, overrides.iconGap) as number) : t.space2;
  const paddingInline = overrides?.paddingInline
    ? (resolveToken(t, overrides.paddingInline) as number)
    : iconOnly
      ? t.spaceSm
      : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t.spaceSm;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightMedium;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const disabledOpacity = overrides?.disabledOpacity
    ? (resolveToken(t, overrides.disabledOpacity) as number)
    : t.opacityDisabled;
  const transitionDuration = overrides?.transition
    ? (resolveToken(t, overrides.transition) as number)
    : t.motionDurationFast;
  const loadingSpinDuration = overrides?.loadingSpin
    ? (resolveToken(t, overrides.loadingSpin) as number)
    : t.motionDurationLoop;
  const spinnerStroke = overrides?.spinnerStroke
    ? (resolveToken(t, overrides.spinnerStroke) as number)
    : t.borderWidthFocus;

  // Background transitions between rest and pressed since there is no hover on touch.
  const highlight = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const toValue = pressedState && !isDisabled && !loading ? 1 : 0;
    if (reducedMotion) {
      highlight.setValue(toValue);
      return;
    }
    Animated.timing(highlight, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      // Color is not a layout property, but react-native-web has no native animated module.
      useNativeDriver: false,
    }).start();
  }, [pressedState, isDisabled, loading, reducedMotion, highlight, transitionDuration, t.motionEasingStandard]);

  const animatedBackground = highlight.interpolate({ inputRange: [0, 1], outputRange: [background, backgroundHover] });

  // The ring spins continuously while loading, and snaps to a fixed frame under
  // reduced motion rather than animating.
  const spin = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (!loading || reducedMotion) {
      spin.setValue(0);
      return undefined;
    }
    const loopAnimation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: loadingSpinDuration,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loopAnimation.start();
    return () => loopAnimation.stop();
  }, [loading, reducedMotion, spin, loadingSpinDuration]);

  // Before the first layout, assume the visual is at the minimum target so the
  // comfortable target is still reachable.
  const slop = (extent: number | undefined): number =>
    Math.max(0, Math.ceil((t.sizeTargetComfortable - (extent ?? t.sizeTargetMin)) / 2));
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
    if (track !== undefined) {
      trackPress(track, label);
      onTrack?.({ name: track, label });
    }
    if (type === 'submit') {
      form?.submit();
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: t.sizeTargetMin,
    minHeight: t.sizeTargetMin,
    gap: iconGap,
    paddingHorizontal: paddingInline,
    paddingVertical: paddingBlock,
    borderRadius: radius,
    borderWidth: t.borderWidthFocus,
    borderColor: focused ? focusRingColor : 'transparent',
    opacity: isDisabled ? disabledOpacity : 1,
  };

  // A separate fill behind the content, since the border's own color is fixed
  // (transparent or the focus ring) and cannot also carry the animated background.
  const backgroundFillStyle: Animated.WithAnimatedObject<ViewStyle> = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius,
    backgroundColor: animatedBackground,
  };

  const labelStyle: TextStyle = {
    fontFamily,
    fontWeight: toFontWeight(fontWeight),
    fontSize,
    color: foreground,
    textAlign: 'center',
  };

  const iconSlotStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
  };

  // A 1em ring: a circle stroked in the foreground color with one side transparent,
  // rotating to read as a spinner.
  const spinnerStyle: Animated.WithAnimatedObject<ViewStyle> = {
    width: fontSize,
    height: fontSize,
    borderRadius: fontSize / 2, // literal-ok: halves a token-derived size into a radius
    borderWidth: spinnerStroke,
    borderColor: foreground,
    borderTopColor: 'transparent',
    transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <Pressable
      testID="Button"
      accessibilityRole="button"
      accessibilityLabel={accessibleName ?? label}
      accessibilityState={expanded === undefined ? { disabled: isDisabled, busy: loading } : { disabled: isDisabled, busy: loading, expanded }}
      hitSlop={hitSlop}
      onPress={handlePress}
      onPressIn={() => setPressedState(true)}
      onPressOut={() => setPressedState(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onLayout={handleLayout}
      style={containerStyle}
    >
      <Animated.View style={backgroundFillStyle} pointerEvents="none" />
      {loading ? (
        <View style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          <Animated.View style={spinnerStyle} />
        </View>
      ) : leadingIcon !== undefined && leadingIcon !== null ? (
        <View style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          {leadingIcon}
        </View>
      ) : null}
      {iconOnly ? null : (
        <RNText allowFontScaling style={labelStyle}>
          {label}
        </RNText>
      )}
      {!iconOnly && !loading && trailingIcon !== undefined && trailingIcon !== null ? (
        <View style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          {trailingIcon}
        </View>
      ) : null}
    </Pressable>
  );
}
