import * as React from 'react';
import { Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { toTextAlign } from './Text';
import type { TextAlign } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

/** Position in the document outline. The schema declares the values as strings; numbers are accepted for ergonomics. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6 | '1' | '2' | '3' | '4' | '5' | '6';
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

export interface HeadingProps {
  /**
   * Position in the document outline. On React Native this controls only the default
   * typography — iOS and Android have no heading levels, so the header trait is set
   * regardless of level. Document the outline in the screen's design instead.
   */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults to the size that matches the level. */
  size?: HeadingSize;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: React.ReactNode;
  /** Horizontal text alignment. */
  align?: TextAlign;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef>>;
}

const LEVEL_SIZE: Record<'1' | '2' | '3' | '4' | '5' | '6', HeadingSize> = {
  '1': '4xl',
  '2': '3xl',
  '3': '2xl',
  '4': 'xl',
  '5': 'lg',
  '6': 'md',
};

const SIZE_TOKEN = {
  '4xl': 'fontSize4xl',
  '3xl': 'fontSize3xl',
  '2xl': 'fontSize2xl',
  xl: 'fontSizeXl',
  lg: 'fontSizeLg',
  md: 'fontSizeMd',
} as const satisfies Record<HeadingSize, keyof Tokens>;

/**
 * Heading — labels a section of content and builds the outline screen-reader users
 * navigate by.
 *
 * When to use: Use a Heading to title a page, a section, or a card that contains its
 * own content. Choose `level` from the document outline — the page title is `1`, its
 * major sections are `2`, their subsections `3` — and then choose `size` separately
 * if the default visual size is wrong for the layout. Decoupling level from size is
 * the whole point of this component: it lets designers pick the right look without
 * breaking the outline.
 *
 * Renders `Text` with `accessibilityRole="header"`. `level` chooses the default
 * size only; VoiceOver and TalkBack expose the header trait but not a level. Do not
 * simulate levels with `accessibilityLabel` prefixes.
 */
export function Heading({ level, size, children, align = 'start', overrides }: HeadingProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const levelKey = String(level) as '1' | '2' | '3' | '4' | '5' | '6';
  const resolvedSize: HeadingSize = size ?? LEVEL_SIZE[levelKey];
  const defaultFontSize = t[SIZE_TOKEN[resolvedSize]];
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : defaultFontSize;
  const lineHeightMultiplier = overrides?.lineHeight
    ? (resolveToken(t, overrides.lineHeight) as number)
    : t.fontLineHeightTight;
  const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightSemibold;

  const style: TextStyle = {
    fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyHeading,
    fontWeight: toFontWeight(fontWeight),
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: t.colorForegroundStrong,
    marginBottom: overrides?.marginBlockEnd ? (resolveToken(t, overrides.marginBlockEnd) as number) : t.spaceSm,
    textAlign: toTextAlign(align),
  };

  return (
    <RNText accessibilityRole="header" allowFontScaling style={style} testID="Heading">
      {children}
    </RNText>
  );
}
