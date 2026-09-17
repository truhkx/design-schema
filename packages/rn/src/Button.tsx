import * as React from 'react';
import { Animated, Easing, Platform, Pressable, Text as RNText, View } from 'react-native';
import type { Insets, LayoutChangeEvent, PressableProps, TextStyle, ViewInstance, ViewStyle } from 'react-native';
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
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'inverseBackgroundHover'
  | 'inverseHoverOpacity'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin'
  | 'spinnerSize';

export interface ButtonProps {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant | undefined;
  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize | undefined;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType | undefined;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel, Disclosure):
   * reflected to `accessibilityState.expanded`. `undefined` (the default) means this
   * button does not disclose anything, so `expanded` is omitted from the state object
   * rather than sent as `false`. Consumers rarely set it directly.
   */
  expanded?: boolean | undefined;
  /** Prevents activation. The button stays in the accessibility tree and is announced as disabled. */
  disabled?: boolean | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: React.ReactNode;
  /** Icon after the label. Decorative, like `leadingIcon`. */
  trailingIcon?: React.ReactNode;
  /** Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes the accessible name. Padding becomes equal on all sides (`space.sm`). */
  iconOnly?: boolean | undefined;
  /**
   * Shows a ring spinner in the leading icon slot (whether or not `leadingIcon` is set;
   * for `iconOnly` it replaces the sole glyph), hides `trailingIcon`, keeps the label
   * visible, and blocks repeat activation while an action is pending. `copy.loading` is
   * announced as the accessibility value beside `busy`, never as part of the name.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, tooltip-like panels). Only `ghost`
   * changes its fill there: its text switches to `color.inverse.link` and its pressed
   * fill to `color.inverse.foreground` at `opacity.disabled × 0.25`. Every variant's
   * focus ring switches to `color.inverse.focus`, since that ring must read against the
   * inverse surface regardless of the button's own fill.
   */
  inverse?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort
   * by Amount, ascending" on a header that shows "Amount"). The name must contain the
   * visible label (WCAG 2.5.3 label-in-name); starting with it is preferred. Maps to
   * `accessibilityLabel`.
   */
  accessibleName?: string | undefined;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow Menu. Not
   * rendered by Button itself — read by the collapsing parent.
   */
  overflowLabel?: string | undefined;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root `Pressable`, so a parent can measure or focus the button. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Supplementary description, forwarded verbatim to the root; Tooltip sets it when it describes the button. */
  accessibilityHint?: string | undefined;
  /** Set by a parent (Tooltip, when its content *is* the name) to replace the name the label would give. `accessibleName` still wins. */
  accessibilityLabel?: string | undefined;
  /** Fired when the button is activated by touch, keyboard, or assistive technology. */
  onPress?: (() => void) | undefined;
  /** Fired after `onPress` with the `track` name and the button's label, only when `track` is set. */
  onTrack?: ((name: string, label: string) => void) | undefined;
  /** Forwarded to the root so Tooltip can attach to the button; the button's own pressed state is kept alongside. */
  onPressOut?: PressableProps['onPressOut'];
  /** Forwarded to the root so Tooltip can open on long press. */
  onLongPress?: PressableProps['onLongPress'];
  /** Forwarded to the root (react-native-web pointer only). */
  onHoverIn?: PressableProps['onHoverIn'];
  /** Forwarded to the root (react-native-web pointer only). */
  onHoverOut?: PressableProps['onHoverOut'];
  /** Forwarded to the root; the button's own focus-ring state is kept alongside. */
  onFocus?: PressableProps['onFocus'];
  /** Forwarded to the root; the button's own focus-ring state is kept alongside. */
  onBlur?: PressableProps['onBlur'];
}

/** The component's user-facing strings, from the doc's `copy` block. */
const COPY = { loading: 'Loading' } as const;

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

/** `inverseHoverOpacity` is `opacity.disabled` times this factor (the binding's `computed`). */
const INVERSE_HOVER_OPACITY_FACTOR = 0.25; // literal-ok: the doc's computed multiplier on a token

/**
 * `color` at `alpha`. The doc's inverse ghost fill is a mix of a token with the surface;
 * web and Lit write it as `color-mix`, and native has no such function, so the resolved
 * token is re-emitted with an alpha channel. Anything that is not a `#rgb`/`#rrggbb`
 * token (a named color, an already-transparent value) is returned untouched.
 */
function withAlpha(color: string, alpha: number): string {
  const hex = color.startsWith('#') ? color.slice(1) : '';
  const full = hex.length === 3 ? `${hex[0]!}${hex[0]!}${hex[1]!}${hex[1]!}${hex[2]!}${hex[2]!}` : hex;
  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/u.test(full)) {
    return color;
  }
  const channel = (at: number): number => Number.parseInt(full.slice(at, at + 2), 16);
  return `rgba(${channel(0)}, ${channel(2)}, ${channel(4)}, ${alpha})`; // literal-ok: an alpha of a resolved token, not a new color
}

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
 * (`accessibleName`, else a name set by a parent, else `label`) and
 * `accessibilityState={{ disabled, busy, expanded }}` (`expanded` omitted unless a
 * disclosing parent sets it). `disabled` is never passed to `Pressable` itself — that
 * would drop it from the tab order — so a disabled button stays focusable and is
 * announced as disabled while a press guard blocks `onPress`. There is no hover on
 * touch, so `backgroundHover` animates in for the pressed state instead (over
 * `transition`, eased with `motion.easing.standard`, skipped under reduced motion); the
 * focus ring is a border drawn in `color.border.focus` (or `color.inverse.focus` when
 * `inverse`) that is transparent, not absent, so focusing never shifts layout.
 * `loading` puts a `spinnerSize` ring spinner in the leading icon slot that rotates
 * continuously over `loadingSpin` (frozen under reduced motion), hides `trailingIcon`,
 * keeps the label visible, announces `copy.loading` as the button's accessibility
 * value, and blocks repeat activation alongside `disabled`. `inverse` changes only
 * `ghost`'s foreground and pressed fill (`inverseBackgroundHover` at
 * `inverseHoverOpacity`, an alpha of the resolved color); other variants keep their own fills.
 * `type="submit"` calls `submit()` on the nearest Form context, since there is no
 * native form. `track`, when set, calls the hand-written `trackPress(name, label)`
 * after `onPress` and before `onTrack(name, label)` fires with the same pair. When the measured
 * footprint is smaller than the comfortable target, `hitSlop` makes up the difference.
 * `accessibilityHint`, `accessibilityLabel`, `onHoverIn`, `onHoverOut`, `onFocus`,
 * `onBlur`, `onLongPress` and `onPressOut` are forwarded to the root so Tooltip can
 * attach to the button. `leadingIcon`/`trailingIcon` render in decorative wrappers
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
  ref,
  accessibilityHint,
  accessibilityLabel,
  onPress,
  onTrack,
  onPressOut,
  onLongPress,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
}: ButtonProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const reducedMotion = useReducedMotion();

  const [focused, setFocused] = React.useState(false);
  const [pressedState, setPressedState] = React.useState(false);
  const [layout, setLayout] = React.useState<{ width: number; height: number } | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const colors = VARIANT_TOKENS[variant];
  const isInverseGhost = variant === 'ghost' && inverse;

  const background = t[colors.background];
  // `backgroundHover` is locked; only the inverse ghost fill and its alpha are overridable.
  const inverseBackgroundHover = overrides?.inverseBackgroundHover
    ? (resolveToken(t, overrides.inverseBackgroundHover) as string)
    : t.colorInverseForeground;
  const inverseHoverOpacity =
    (overrides?.inverseHoverOpacity ? (resolveToken(t, overrides.inverseHoverOpacity) as number) : t.opacityDisabled) *
    INVERSE_HOVER_OPACITY_FACTOR;
  const backgroundHover = isInverseGhost
    ? withAlpha(inverseBackgroundHover, inverseHoverOpacity)
    : t[colors.backgroundHover];
  // Only `ghost` is meaningful on an inverse surface; other variants keep their own fills.
  const foreground = isInverseGhost ? t.colorInverseLink : t[colors.foreground];
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
  // RN has no em: the ring is `font.size.{size}` across by default, independent of a `fontSize` override.
  const spinnerSize = overrides?.spinnerSize
    ? (resolveToken(t, overrides.spinnerSize) as number)
    : t[FONT_SIZE_TOKEN[size]];
  // `spinnerStroke` is locked: border.width.focus is a focus token.
  const spinnerStroke = t.borderWidthFocus;

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
      onTrack?.(track, label);
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
  const backgroundFillStyle: Animated.WithAnimatedValue<ViewStyle> = {
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

  // A spinnerSize ring: a circle stroked in the foreground color with one quarter
  // transparent, rotating to read as a spinner.
  const spinnerStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: spinnerSize,
    height: spinnerSize,
    borderRadius: spinnerSize / 2, // literal-ok: halves a token-derived size into a radius
    borderWidth: spinnerStroke,
    borderColor: foreground,
    borderTopColor: 'transparent',
    transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <Pressable
      ref={ref}
      testID="Button"
      accessibilityRole="button"
      accessibilityLabel={accessibleName ?? accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={expanded === undefined ? { disabled: isDisabled, busy: loading } : { disabled: isDisabled, busy: loading, expanded }}
      accessibilityValue={loading ? { text: COPY.loading } : undefined}
      hitSlop={hitSlop}
      onPress={handlePress}
      onPressIn={() => setPressedState(true)}
      onPressOut={(event) => {
        setPressedState(false);
        onPressOut?.(event);
      }}
      onLongPress={onLongPress}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onLayout={handleLayout}
      style={containerStyle}
    >
      <Animated.View style={backgroundFillStyle} pointerEvents="none" />
      {loading ? (
        <View testID="Button.leadingIcon" style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          <Animated.View style={spinnerStyle} />
        </View>
      ) : leadingIcon !== undefined && leadingIcon !== null ? (
        <View testID="Button.leadingIcon" style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          {leadingIcon}
        </View>
      ) : null}
      {iconOnly ? null : (
        <RNText testID="Button.label" allowFontScaling style={labelStyle}>
          {label}
        </RNText>
      )}
      {!iconOnly && !loading && trailingIcon !== undefined && trailingIcon !== null ? (
        <View testID="Button.trailingIcon" style={iconSlotStyle} accessibilityElementsHidden importantForAccessibility="no">
          {trailingIcon}
        </View>
      ) : null}
    </Pressable>
  );
}
