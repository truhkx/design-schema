import * as React from 'react';
import { Animated, Linking, Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Icon } from './Icon';
import { TextNestingContext } from './Text';
import { toEasing, toFontWeight, toLineHeight, useReducedMotion, useTheme } from './theme';

export type LinkTone = 'default' | 'inherit';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type LinkOverridableBinding = 'transition';

export interface LinkProps {
  /** The destination. A URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Marks a destination outside the product: appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon. Navigation is still `onPress` or `Linking`. */
  external?: boolean;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef>>;
  /**
   * Fired when the link is activated, with `href`. On native the consumer's handler
   * is the navigation; when no handler is given the system opens the URL with `Linking`.
   */
  onPress?: (href: string) => void;
}

const COPY = {
  externalSuffix: ' (opens in new tab)',
} as const;

/** `copy.externalSuffix`, exposed so composites (e.g. `Card`) can reproduce a Link's accessible name when they move it onto a wrapping element. */
export const LINK_EXTERNAL_SUFFIX = COPY.externalSuffix;

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
 * `copy.externalSuffix` when `external`. Activation calls `onPress(href)` when
 * provided, otherwise `Linking.openURL(href)` — never both. Standalone, the Link
 * sets the body typography via Text's helpers since there is no cascade; nested in
 * a system `Text` (detected through `TextNestingContext`) it inherits.
 *
 * There is no hover or visited state on native, so `colorHover` styles the pressed
 * state (`colorVisited` unused) and the color crossfades over `transition` (eased
 * with `motion.easing.standard`, skipped under reduced motion) the same way Button
 * animates its background. RN cannot set underline offset or thickness, and nested
 * `Text` ignores margins, so `underlineThickness`, `underlineOffset` and
 * `externalIconGap` have no effect on this platform and are excluded from
 * `LinkOverridableBinding`; a literal space separates the label from the external
 * glyph instead. `Text` has no focus events, so the focus ring (`focusRing*` tokens)
 * cannot be drawn by hand: hardware-keyboard focus relies on the platform's own
 * indicator, and react-native-web renders a real anchor with the browser's focus
 * outline. The external glyph is the shared `Icon` (`name="external"`, `inline`),
 * matching Icon's own documented use for this mark; because Icon has no
 * `currentColor` fallback for animated color, its color swaps instantly with the
 * pressed state rather than crossfading. The link is never disabled: a destination
 * that is not available is rendered as Text.
 */
export function Link({
  href,
  label,
  external = false,
  tone = 'default',
  overrides,
  onPress,
}: LinkProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const nested = React.useContext(TextNestingContext);
  const reducedMotion = useReducedMotion();
  const [pressed, setPressed] = React.useState(false);

  const transitionDuration = overrides?.transition
    ? (resolveToken(t, overrides.transition) as number)
    : t.motionDurationFast;

  // Crossfades between rest and pressed since there is no hover on touch, mirroring Button.
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
  const iconColor = tone === 'inherit' ? undefined : pressed ? t.colorLinkHover : t.colorLink;

  const handlePress = (): void => {
    // The consumer's handler is the navigation; only without one does the system open the URL.
    if (onPress !== undefined) {
      onPress(href);
      return;
    }
    Linking.openURL(href).catch(() => undefined);
  };

  // Standalone, the Link sets the body typography (there is no cascade); nested in
  // a system Text it sets none and inherits the surrounding style.
  const typography: TextStyle = nested
    ? {}
    : {
        fontFamily: t.fontFamilyBody,
        fontWeight: toFontWeight(t.fontWeightRegular),
        fontSize: t.fontSizeMd,
        lineHeight: toLineHeight(t.fontSizeMd, t.fontLineHeightNormal),
      };

  const style: TextStyle = {
    ...typography,
    textDecorationLine: 'underline',
  };

  return (
    <Animated.Text
      testID="Link"
      accessibilityRole="link"
      accessibilityLabel={external ? `${label}${COPY.externalSuffix}` : label}
      allowFontScaling
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        style,
        tone === 'inherit' ? null : { color: animatedColor, textDecorationColor: animatedColor },
      ]}
    >
      {label}
      {external ? ' ' : null}
      {external ? <Icon name="external" inline color={iconColor} /> : null}
    </Animated.Text>
  );
}
