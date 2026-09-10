import * as React from 'react';
import { Text as RNText } from 'react-native';
import type { TextStyle } from 'react-native';
import { TextNestingContext } from './Text';
import { useTheme } from './theme';
import type { Tokens } from './theme';

export type IconName =
  | 'check'
  | 'dash'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'close'
  | 'plus'
  | 'minus'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'external'
  | 'ellipsis'
  | 'search'
  | 'arrow-right'
  | 'arrow-left';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs
   * a shape; `info`, `success`, `warning` and `danger` are the four status shapes so
   * tone is never carried by color alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize;
  /** Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring `size`. For icons inside Text, Link and Button labels. */
  inline?: boolean;
  /**
   * Accessible name. When set, the icon is meaningful and exposed as an image with
   * this name; when omitted, it is decorative and hidden from assistive technology.
   * Most icons sit next to text and should have no label.
   */
  label?: string;
  /**
   * Glyph color. React Native has no `currentColor`, so the parent passes its own
   * foreground token explicitly (a Button its `foreground`, an Alert its `icon`
   * color). Falls back to `color.foreground`, or to the surrounding text color when
   * the icon is nested inside a system `Text`.
   */
  color?: string;
}

/**
 * The Unicode fallback for each glyph. Every character exists in the default iOS
 * and Android system fonts. This table is module-private: other components render
 * `<Icon name>`, never the characters.
 */
const GLYPHS = {
  check: '✓',
  dash: '–',
  'chevron-right': '›',
  'chevron-down': '⌄',
  'chevron-up': '⌃',
  'chevron-left': '‹',
  close: '×',
  plus: '+',
  minus: '−',
  info: 'ⓘ',
  success: '✓',
  warning: '▲',
  danger: '⨂',
  external: '↗',
  ellipsis: '…',
  search: '⌕',
  'arrow-right': '→',
  'arrow-left': '←',
} as const satisfies Record<IconName, string>;

const SIZE_TOKEN = {
  xs: 'fontSizeXs',
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
  lg: 'fontSizeLg',
  xl: 'fontSizeXl',
} as const satisfies Record<IconSize, keyof Tokens>;

/**
 * Icon — a single glyph that takes its size from the type scale and its color from
 * the text it sits in.
 *
 * When to use: Use an Icon wherever a component's anatomy names one: the leading
 * icon in a Button, the chevron in a Disclosure, the status shape in an Alert, the
 * check in a Checkbox, the external mark on a Link. Use `inline` when the icon is
 * inside running text. Give it a `label` only when the icon is the whole message.
 * Never use an Icon as a button; wrap it in a Button with `iconOnly` and a `label`.
 *
 * Renders React Native `Text` with the glyph from a Unicode table keyed by `name`.
 * This is the acknowledged platform limit: core React Native has no SVG and the
 * package adds no dependencies, so line glyphs cannot take the `border.width.focus`
 * stroke the web SVGs use, and the four status shapes are the closest system-font
 * characters rather than drawn shapes. Adopting react-native-svg is the one
 * dependency decision that would lift this, and the API is designed so that swap
 * is a drop-in change for consumers.
 *
 * `fontSize` (and a square `width`/`height`/`lineHeight`) come from `font.size.{size}`.
 * With `inline` no size is set: nested inside a system `Text` (detected through
 * `TextNestingContext`) the glyph inherits the surrounding font size, family and
 * color; standalone it uses the body size. There is no `currentColor`, so the
 * `color` prop is the parent's foreground token, falling back to `color.foreground`.
 * Decorative (no `label`): `accessibilityElementsHidden` and
 * `importantForAccessibility="no"`. Labelled: `accessibilityRole="image"` and
 * `accessibilityLabel`. No interaction, no focus, no animation.
 */
export function Icon({ name, size = 'md', inline = false, label, color }: IconProps): React.JSX.Element {
  const { tokens } = useTheme();
  const nested = React.useContext(TextNestingContext);

  const decorative = label === undefined || label === '';
  // Nested inside a system Text there is a cascade for once: an inline glyph inherits
  // the surrounding typography and color, exactly like currentColor on web.
  const inherits = inline && nested;
  const fontSize = tokens[SIZE_TOKEN[size]];

  const typography: TextStyle = inline
    ? inherits
      ? {}
      : { fontFamily: tokens.fontFamilyBody, fontSize: tokens.fontSizeMd }
    : {
        fontFamily: tokens.fontFamilyBody,
        fontSize,
        lineHeight: fontSize,
        width: fontSize,
        height: fontSize,
        textAlign: 'center',
        includeFontPadding: false,
      };

  const style: TextStyle = {
    ...typography,
    ...(color !== undefined ? { color } : inherits ? {} : { color: tokens.colorForeground }),
  };

  return (
    <RNText
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={decorative ? undefined : label}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no' : 'auto'}
      allowFontScaling
      style={style}
    >
      {GLYPHS[name]}
    </RNText>
  );
}
