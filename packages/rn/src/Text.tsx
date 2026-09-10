import * as React from 'react';
import { I18nManager, Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TextOverridableBinding = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'color';

export interface TextProps {
  /** The text content. Inline formatting (nested Text) is allowed; block elements are not. */
  children: React.ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  tone?: TextTone;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign;
  /** Clip to one line with an ellipsis. Screen readers still read the full text. */
  truncate?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef>>;
}

const SIZE_TOKEN = {
  xs: 'fontSizeXs',
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
  lg: 'fontSizeLg',
  xl: 'fontSizeXl',
} as const satisfies Record<TextSize, keyof Tokens>;

const WEIGHT_TOKEN = {
  regular: 'fontWeightRegular',
  medium: 'fontWeightMedium',
  semibold: 'fontWeightSemibold',
  bold: 'fontWeightBold',
} as const satisfies Record<TextWeight, keyof Tokens>;

const TONE_TOKEN = {
  default: 'colorForeground',
  strong: 'colorForegroundStrong',
  muted: 'colorForegroundMuted',
  danger: 'colorForegroundDanger',
  onAction: 'colorForegroundOnAction',
} as const satisfies Record<TextTone, keyof Tokens>;

/**
 * `true` for anything rendered inside a system `Text`. Inline components such as
 * Link read it to inherit the surrounding typography instead of setting their own,
 * since React Native has no cascade to detect nesting otherwise.
 */
export const TextNestingContext = React.createContext<boolean>(false);

/** Resolves `start`/`end` against the current writing direction, since RN's `textAlign` has no logical values. */
export function toTextAlign(align: TextAlign): TextStyle['textAlign'] {
  if (align === 'center') {
    return 'center';
  }
  const rtl = I18nManager.isRTL;
  if (align === 'start') {
    return rtl ? 'right' : 'left';
  }
  return rtl ? 'left' : 'right';
}

/**
 * Text — the default way to put words on a screen.
 *
 * When to use: Use Text for paragraphs, labels, captions, helper text, and any
 * inline copy. Pick `size` from the scale rather than styling a raw element, and use
 * `tone` for meaning: `muted` for secondary information, `danger` for errors,
 * `strong` when a phrase must stand out from surrounding body copy. Use `weight` to
 * create hierarchy inside a size; it is calmer than jumping sizes.
 *
 * Renders React Native `Text`. `truncate` maps to `numberOfLines={1}` with
 * `ellipsizeMode="tail"`; `allowFontScaling` stays on so Dynamic Type / font
 * scaling applies. There is no `element` prop on native.
 */
export function Text({
  children,
  size = 'md',
  weight = 'regular',
  tone = 'default',
  align = 'start',
  truncate = false,
  overrides,
}: TextProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const style = React.useMemo<TextStyle>(() => {
    const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[SIZE_TOKEN[size]];
    const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
    const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t[WEIGHT_TOKEN[weight]];

    return {
      fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody,
      fontSize,
      fontWeight: toFontWeight(fontWeight),
      lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
      color: overrides?.color ? (resolveToken(t, overrides.color) as string) : t[TONE_TOKEN[tone]],
      textAlign: toTextAlign(align),
    };
  }, [t, size, weight, tone, align, overrides]);

  return (
    <RNText
      testID="Text"
      allowFontScaling
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      style={style}
    >
      <TextNestingContext.Provider value={true}>{children}</TextNestingContext.Provider>
    </RNText>
  );
}
