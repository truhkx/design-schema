import * as React from 'react';
import { Animated, Linking } from 'react-native';
import type { GestureResponderEvent, TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { TextStyleContext } from './Text';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

export type LinkTone = 'default' | 'inherit';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type LinkOverridableBinding = 'transition';

export interface LinkProps {
  /** The destination. A URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /**
   * Marks a destination outside the product: appends `copy.externalSuffix` to the accessible
   * name, with a decorative trailing icon. `onPress` fires first; the system browser then opens
   * the URL through `Linking` unless the handler returns `false`.
   */
  external?: boolean | undefined;
  /**
   * `default` uses the link colors. `inherit` takes the surrounding text color and relies on
   * the underline alone; rest and pressed both resolve to the inherited color.
   */
  tone?: LinkTone | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * Overrides the computed accessible name (`label`, plus `copy.externalSuffix` when
   * `external`). Set by a wrapping parent such as Tooltip that needs to fold its own
   * content into this link's name.
   */
  accessibilityLabel?: string | undefined;
  /** Forwarded to the native element untouched — set by a wrapping parent such as Tooltip. */
  accessibilityHint?: string | undefined;
  /** Forwarded to the native element untouched — lets a wrapping parent such as Tooltip attach hover/focus behavior. */
  onFocus?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched — lets a wrapping parent such as Tooltip attach hover/focus behavior. */
  onBlur?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched (react-native-web only — no touch hover). */
  onHoverIn?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched (react-native-web only — no touch hover). */
  onHoverOut?: ((event: unknown) => void) | undefined;
  /** Forwarded to the native element untouched — set by a wrapping parent such as Tooltip. */
  onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
  /**
   * Fired when the link is activated, with `href`. On native the consumer's handler is
   * the navigation; when no handler is given the system opens the URL with `Linking`.
   * An `external` link still hands off to `Linking` after the handler, since a
   * consumer-side router cannot open the system browser. Cancelable: return `false`
   * to skip any `Linking` hand-off.
   */
  onPress?: ((href: string) => boolean | void) | undefined;
}

const COPY = {
  externalSuffix: ' (opens in new tab)',
} as const;

/** `copy.externalSuffix`, exposed so composites (e.g. `Card`) can reproduce a Link's accessible name when they move it onto a wrapping element. */
export const LINK_EXTERNAL_SUFFIX: ' (opens in new tab)' = COPY.externalSuffix;

/**
 * Link — takes people somewhere. Buttons do things; links navigate.
 *
 * When to use: Use a Link for any navigation: to another screen, to an external
 * site, or inline inside body text. Use `external` whenever the destination leaves
 * the product, so people are warned before they lose their place. Do not use a Link
 * to trigger an action — that is a `ghost` Button.
 *
 * Renders `Text` with `accessibilityRole="link"` so it flows inline inside a parent
 * `Text`; standalone it is its own line. `accessibilityLabel` is the label plus
 * `copy.externalSuffix` when `external`, or the `accessibilityLabel` prop when a
 * wrapping parent (Tooltip) sets one. `onPress(href)` fires first when provided;
 * returning `false` cancels any `Linking` hand-off. For a non-`external` link the
 * handler is the navigation and `Linking.openURL(href)` is only the fallback without
 * one; an `external` link opens through `Linking` after the handler as well.
 * `accessibilityHint`, `onFocus`, `onBlur`, `onHoverIn`, `onHoverOut` and `onLongPress`
 * are forwarded to the native element, so a wrapping Tooltip can attach to this Link.
 * Link exposes no `ref`. Standalone, the Link sets the body typography via Text's
 * helpers since there is no cascade; nested in a system `Text` (detected through
 * `TextStyleContext`) it inherits.
 *
 * There is no hover or visited state on native, so `colorHover` styles the pressed
 * state (`colorVisited` unused) and the color crossfades over `transition` (eased
 * with `motion.easing.standard`, skipped under reduced motion). RN cannot set
 * underline offset or thickness, and nested `Text` ignores margins, so
 * `underlineThickness`, `underlineOffset` and `externalIconGap` have no effect on
 * this platform and are excluded from `LinkOverridableBinding`; a literal space
 * separates the label from the external glyph instead. `Text` has no focus events,
 * so the focus ring is the platform's own (`focusRing*` not applied); react-native-web
 * renders a real anchor with the browser's focus outline. The external glyph is the
 * shared `Icon` (`name="external"`, `inline`); with `tone: default` it receives the
 * link color, swapping instantly on press, and with `tone: inherit` it receives no
 * color and resolves the enclosing Text's color itself. The link is never disabled:
 * a destination that is not available is rendered as Text.
 */
export function Link({
  href,
  label,
  external = false,
  tone = 'default',
  overrides,
  accessibilityLabel,
  accessibilityHint,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  onLongPress,
  onPress,
}: LinkProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const { nested } = React.useContext(TextStyleContext);
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = React.useState(false);

  const transitionDuration = overrides?.transition
    ? (resolveToken(t, overrides.transition) as number)
    : t.motionDurationFast;

  // Crossfades between rest and pressed, since native has no hover.
  const highlight = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (tone === 'inherit') {
      return undefined;
    }
    const toValue = pressed ? 1 : 0;
    if (reducedMotion) {
      highlight.setValue(toValue);
      return undefined;
    }
    const animation = Animated.timing(highlight, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      // Color is not a layout property, but react-native-web has no native animated module.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [pressed, reducedMotion, highlight, transitionDuration, t.motionEasingStandard, tone]);

  const animatedColor = highlight.interpolate({ inputRange: [0, 1], outputRange: [t.colorLink, t.colorLinkHover] });

  const handlePress = (): void => {
    // Cancelable: a handler returning `false` skips the only default action, the Linking hand-off.
    if (onPress?.(href) === false) {
      return;
    }
    if (external || onPress === undefined) {
      Promise.resolve(Linking.openURL(href)).catch(() => undefined);
    }
  };

  // Text's types omit onFocus/onBlur/onHoverIn/onHoverOut (react-native-web wires them
  // up on Text), so the forwarded handlers go through an untyped bag.
  const forwardedProps: Record<string, unknown> = { onFocus, onBlur, onHoverIn, onHoverOut };

  // Standalone, the Link sets the body typography (there is no cascade); nested in
  // a system Text it sets none and inherits the surrounding style.
  const typography: TextStyle = nested
    ? { textDecorationLine: 'underline' }
    : {
        textDecorationLine: 'underline',
        fontFamily: t.fontFamilyBody,
        fontWeight: toFontWeight(t.fontWeightRegular),
        fontSize: t.fontSizeMd,
        lineHeight: toLineHeight(t.fontSizeMd, t.fontLineHeightNormal),
      };

  // `inherit`: nested, the label takes the enclosing Text's color; standalone there is
  // nothing to inherit, so it matches Icon's own fallback, color.foreground.
  const colorStyle =
    tone === 'inherit'
      ? nested
        ? null
        : { color: t.colorForeground }
      : { color: animatedColor, textDecorationColor: animatedColor };

  return (
    <Animated.Text
      testID="Link"
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? (external ? `${label}${COPY.externalSuffix}` : label)}
      accessibilityHint={accessibilityHint}
      allowFontScaling
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onLongPress={onLongPress}
      {...forwardedProps}
      style={[typography, colorStyle]}
    >
      {label}
      {external ? ' ' : null}
      {external ? (
        <Icon name="external" inline color={tone === 'inherit' ? undefined : pressed ? t.colorLinkHover : t.colorLink} />
      ) : null}
    </Animated.Text>
  );
}
