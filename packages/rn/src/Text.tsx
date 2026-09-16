import * as React from 'react';
import { I18nManager, Text as RNText } from 'react-native';
import type { TextInstance, TextStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { toFontWeight, toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'default' | 'strong' | 'muted' | 'danger' | 'onAction';
export type TextAlign = 'start' | 'center' | 'end';

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `color` is locked — the tone colors are contrast-checked against
 * the page background, so it is not overridable and is ignored if passed.
 */
export type TextOverridableBinding = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight';

export interface TextProps {
  /** The text content. Inline formatting (nested Text) is allowed; block elements are not. */
  children: React.ReactNode;
  /** Maps to the font size scale. `md` is body copy; `xs` is the smallest readable size and is reserved for captions and metadata. */
  size?: TextSize | undefined;
  /** Emphasis without changing size. Prefer weight over color for hierarchy. */
  weight?: TextWeight | undefined;
  /** Semantic color. `onAction` is only for text placed on an action background. */
  tone?: TextTone | undefined;
  /** Horizontal alignment. `start`/`end` follow writing direction. */
  align?: TextAlign | undefined;
  /** Clip to one line with an ellipsis. Screen readers still read the full text. */
  truncate?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined;
  /** The rendered `Text`, for measurement or accessibility focus. */
  ref?: React.Ref<TextInstance> | undefined;
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
 * The resolved size and color a system `Text` is rendering with, plus whether
 * anything is nested inside one at all. Inline components such as Icon and Link
 * read this to match the surrounding typography instead of falling back to a
 * default, since React Native has no cascade to inherit it from otherwise.
 */
export interface TextStyleContextValue {
  fontSize: number;
  color: string;
  nested: boolean;
}

const DEFAULT_TEXT_STYLE_CONTEXT: TextStyleContextValue = { fontSize: 0, color: '', nested: false };

export const TextStyleContext: React.Context<TextStyleContextValue> = React.createContext<TextStyleContextValue>(DEFAULT_TEXT_STYLE_CONTEXT);

/**
 * The foreground color in force for a subtree, standing in for the CSS cascade.
 *
 * Text's `color` binding is locked — every tone is contrast-checked against the page
 * background — so a component that owns a surface with a foreground of its own (Toast,
 * Tooltip, Slider's value bubble, DatePicker's selected day) cannot hand Text a color
 * through `overrides`. On web and Lit those components re-scope the `--color-foreground`
 * custom property around the composed text; React Native has no cascade to re-scope, so
 * they provide the color here instead and keep composing `Text` rather than restyling it
 * or drawing their own. A `tone` other than `default` still wins, since it carries
 * meaning the surface does not.
 *
 * Package-internal: it is not re-exported from the package entry point, because a
 * consumer's surface should grow a schema binding rather than paint text by hand.
 */
export const TextForegroundContext: React.Context<string | undefined> = React.createContext<string | undefined>(undefined);

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
 * scaling applies. There is no `element` prop on native. Provides
 * `TextStyleContext` with the resolved `fontSize`/`color` so inline children
 * (Icon, Link) can match this Text instead of falling back to a default.
 *
 * Native has no equivalent of web's `title`, so a truncated string has no
 * sighted affordance to reach the rest of it — screen readers still read it in
 * full. Keep truncated copy short enough that the visible line carries the
 * meaning.
 */
export function Text({
  children,
  size = 'md',
  weight = 'regular',
  tone = 'default',
  align = 'start',
  truncate = false,
  overrides,
  ref,
}: TextProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const surfaceColor = React.useContext(TextForegroundContext);

  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[SIZE_TOKEN[size]];
  const color = tone === 'default' && surfaceColor !== undefined ? surfaceColor : t[TONE_TOKEN[tone]];

  const style = React.useMemo<TextStyle>(() => {
    const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
    const fontWeight = overrides?.fontWeight ? (resolveToken(t, overrides.fontWeight) as number) : t[WEIGHT_TOKEN[weight]];

    return {
      fontFamily: overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody,
      fontSize,
      fontWeight: toFontWeight(fontWeight),
      lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
      color,
      textAlign: toTextAlign(align),
    };
  }, [t, weight, align, overrides, fontSize, color]);

  const contextValue = React.useMemo<TextStyleContextValue>(
    () => ({ fontSize, color, nested: true }),
    [fontSize, color],
  );

  return (
    <RNText
      ref={ref}
      testID="Text"
      allowFontScaling
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      style={style}
    >
      <TextStyleContext.Provider value={contextValue}>{children}</TextStyleContext.Provider>
    </RNText>
  );
}
