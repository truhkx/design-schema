import * as React from 'react';
import { Linking, Text as RNText } from 'react-native';
import type { GestureResponderEvent, TextStyle } from 'react-native';
import { TextNestingContext } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';

export type LinkTone = 'default' | 'inherit';

export interface LinkProps {
  /** The destination. A URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Marks a destination outside the product: appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon. Navigation is still `onPress` or `Linking`. */
  external?: boolean;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone;
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

/** The decorative trailing glyph for `external`. */
const EXTERNAL_GLYPH = '↗';

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
 * There is no hover or visited state on native, so `colorHover` styles the pressed
 * state and `colorVisited` is unused. RN cannot set underline offset or thickness,
 * and `Text` has no focus events, so the focus ring (`focusRing*` tokens) cannot be
 * drawn by hand: hardware-keyboard focus relies on the platform's own indicator, and
 * react-native-web renders a real anchor with the browser's focus outline. The link
 * is never disabled: a destination that is not available is rendered as Text.
 */
export function Link({ href, label, external = false, tone = 'default', onPress }: LinkProps): React.JSX.Element {
  const { tokens } = useTheme();
  const nested = React.useContext(TextNestingContext);
  const [pressed, setPressed] = React.useState(false);

  const handlePress = (_event: GestureResponderEvent): void => {
    // The consumer's handler is the navigation; only without one does the system open the URL.
    if (onPress !== undefined) {
      onPress(href);
      return;
    }
    Linking.openURL(href).catch(() => undefined);
  };

  const color = tone === 'inherit' ? undefined : pressed ? tokens.colorLinkHover : tokens.colorLink;

  // Standalone, the Link sets the body typography (there is no cascade); nested in
  // a system Text it sets none and inherits the surrounding style.
  const typography: TextStyle = nested
    ? {}
    : {
        fontFamily: tokens.fontFamilyBody,
        fontWeight: toFontWeight(tokens.fontWeightRegular),
        fontSize: tokens.fontSizeMd,
        lineHeight: toLineHeight(tokens.fontSizeMd, tokens.fontLineHeightNormal),
      };

  const style: TextStyle = {
    ...typography,
    color,
    textDecorationLine: 'underline',
    textDecorationColor: color,
  };

  const iconStyle: TextStyle = {
    // externalIconSize: 1em of the surrounding font when nested; font.size.sm standalone.
    ...(nested ? {} : { fontSize: tokens.fontSizeSm }),
    color,
    textDecorationLine: 'none',
  };

  return (
    <RNText
      accessibilityRole="link"
      accessibilityLabel={external ? `${label}${COPY.externalSuffix}` : label}
      allowFontScaling
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
    >
      {label}
      {external ? (
        // Nested Text ignores margins, so `externalIconGap` cannot be applied; a space
        // character separates the glyph from the label instead.
        <RNText
          accessibilityElementsHidden
          importantForAccessibility="no"
          allowFontScaling
          style={iconStyle}
        >
          {` ${EXTERNAL_GLYPH}`}
        </RNText>
      ) : null}
    </RNText>
  );
}
