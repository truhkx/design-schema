import * as React from 'react';
import { Text as RNText } from 'react-native';
import type { TextInstance, TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { TextStyleContext, toTextAlign } from './Text';
import type { TextAlign, TextStyleContextValue } from './Text';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

/** Position in the document outline. The canonical values are strings; the `level` prop also accepts the number. */
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `color` is locked — heading text is contrast-checked at AAA
 * against the page background, so it is not overridable and is ignored if passed.
 */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

export interface HeadingProps {
  /**
   * Position in the document outline. On React Native this controls only the default
   * typography — iOS and Android have no heading levels, so the header trait is set
   * regardless of level. Document the outline in the screen's design instead. A missing,
   * out-of-range or non-numeric level is treated as `2` (the 3xl default size) and warns
   * once per element in development.
   */
  level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size, independent of level. Defaults per level: 1 → 4xl, 2 → 3xl, 3 → 2xl, 4 → xl, 5 → lg, 6 → md. */
  size?: HeadingSize | undefined;
  /** The heading text. Keep it short and descriptive; it is what appears in the page outline. */
  children: React.ReactNode;
  /** Horizontal text alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `Text`, for measurement or accessibility focus. */
  ref?: React.Ref<TextInstance> | undefined;
}

const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = {
  '1': '4xl',
  '2': '3xl',
  '3': '2xl',
  '4': 'xl',
  '5': 'lg',
  '6': 'md',
};

const LEVELS: readonly string[] = Object.keys(LEVEL_SIZE);

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
 * Renders `Text` with `accessibilityRole="header"`. `level` chooses the default size
 * only; VoiceOver and TalkBack expose the header trait but not a level, so there is
 * no outline to navigate on native — document it in the screen's design. Do not
 * simulate levels with `accessibilityLabel` prefixes like "Heading level 2"; it is
 * noisy and non-standard.
 *
 * `marginBlockEnd` is the one margin the system allows, because a heading owns the
 * gap to its own first paragraph; it maps to `marginBottom`, since React Native has
 * no logical margins.
 */
export function Heading({ level, size, children, align = 'start', overrides, ref }: HeadingProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const levelString = String(level);
  const levelValid = LEVELS.includes(levelString);
  const levelKey: HeadingLevel = levelValid ? (levelString as HeadingLevel) : '2';

  const warnedInvalidLevel = React.useRef(false);
  React.useEffect(() => {
    if (__DEV__ && !levelValid && !warnedInvalidLevel.current) {
      warnedInvalidLevel.current = true;
      console.warn(`Heading: level ${String(level)} is not one of 1–6; rendering as level 2.`);
    }
  }, [levelValid, level]);

  const resolvedSize: HeadingSize = size ?? LEVEL_SIZE[levelKey];
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[SIZE_TOKEN[resolvedSize]];
  const color = t.colorForegroundStrong;

  const style = React.useMemo<TextStyle>(() => {
    const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightTight;
    const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t.fontWeightSemibold;

    return {
      fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyHeading,
      fontWeight: toFontWeight(fontWeight),
      fontSize,
      lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
      color,
      marginBottom: overrides?.marginBlockEnd ? (resolveToken(t, overrides.marginBlockEnd) as number) : t.spaceSm,
      textAlign: toTextAlign(align),
    };
  }, [t, align, overrides, fontSize, color]);

  const contextValue = React.useMemo<TextStyleContextValue>(() => ({ fontSize, color, nested: true }), [fontSize, color]);

  return (
    <RNText ref={ref} testID="Heading" accessibilityRole="header" allowFontScaling style={style}>
      <TextStyleContext.Provider value={contextValue}>{children}</TextStyleContext.Provider>
    </RNText>
  );
}
