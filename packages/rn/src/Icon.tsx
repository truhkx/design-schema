import * as React from 'react';
import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { TextStyleContext } from './Text';
import { useTheme } from './theme';
import type { Tokens } from './theme';
import { paths } from './paths';
import type { IconName } from './paths';

export type { IconName };
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. `strokeWidth` is locked: line glyphs stay legible at `xs` only
 * because they stroke at the focus width, so it is not overridable.
 */
export type IconOverridableBinding = 'size' | 'color';

export interface IconProps {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs
   * a shape; `info`, `success`, `warning` and `danger` are the four status shapes
   * (circle-i, circle-check, triangle-!, octagon-x) so tone is never carried by color
   * alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /** Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring `size`. For icons inside Text, Link and Button labels. */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an
   * image with this name; when omitted or empty, it is decorative and hidden from
   * assistive technology. Most icons sit next to text and should have no label.
   */
  label?: string | undefined;
  /**
   * React Native only: the color the parent passes, because there is no
   * `currentColor`. Falls back to `color.foreground` when the icon is not nested in a
   * `Text` (a nested glyph takes its parent Text's color instead).
   */
  color?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;
}

const SIZE_TOKEN = {
  xs: 'fontSizeXs',
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
  lg: 'fontSizeLg',
  xl: 'fontSizeXl',
} as const satisfies Record<IconSize, keyof Tokens>;

/** The shared glyph grid every platform draws on: path data is 16×16 and `viewBox` scales it to the rendered box. */
const GRID = 16; // literal-ok: the glyph grid's coordinate space, not a size value

/**
 * Icon — a single glyph that takes its size from the type scale and, on this
 * platform, an explicit color from its parent.
 *
 * When to use: Use an Icon wherever a component's anatomy names one: the leading
 * icon in a Button, the chevron in a Disclosure, the status shape in an Alert, the
 * check in a Checkbox, the external mark on a Link. Use `inline` when the icon is
 * inside running text. Give it a `label` only when the icon is the whole message.
 * Never use an Icon as a button; wrap it in a Button with `iconOnly` and a `label`.
 *
 * Renders `Svg`/`Path` from `react-native-svg` (the package's one sanctioned
 * dependency) against the same 16×16 `paths` table as web/Lit, so the glyphs stay
 * visually identical across platforms. Line glyphs stroke at `border.width.focus`
 * so they stay legible at `xs`; the four status shapes, `ellipsis`, `play` and
 * `pause` fill instead, with no stroke.
 *
 * There is no `currentColor` on native, so `color` is an explicit prop that falls
 * back to `color.foreground` — except inside a system `Text`, where the glyph takes
 * that Text's own resolved color through `TextStyleContext`, and (with `inline`) its
 * font size too, so it matches the surrounding copy exactly.
 *
 * `size` is ignored (a no-op) while `inline` is set, since the size then comes from
 * the text context instead. Decorative (no `label`): `accessibilityElementsHidden`
 * and `importantForAccessibility="no"`. Labelled: `accessibilityRole="image"` and
 * `accessibilityLabel`. No interaction, no focus, no animation.
 */
export function Icon({ name, size = 'md', inline = false, label, color, overrides }: IconProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const textStyle = React.useContext(TextStyleContext);

  const decorative = label === undefined || label === '';

  // `size` only governs the box when not inline: the override is a no-op there,
  // matching "overrides change values, never presence."
  const dimension = inline
    ? textStyle.nested
      ? textStyle.fontSize
      : t.fontSizeMd
    : overrides?.size
      ? (resolveToken(t, overrides.size) as number)
      : t[SIZE_TOKEN[size]];

  // The prop is what a parent passes in place of `currentColor`, so it wins; an
  // override replaces the binding's default, which is the enclosing Text's color
  // when there is one and `color.foreground` otherwise.
  const resolvedColor =
    color ??
    (overrides?.color
      ? (resolveToken(t, overrides.color) as string)
      : textStyle.nested
        ? textStyle.color
        : t.colorForeground);

  const glyph = paths[name];

  if (glyph === undefined) {
    if (__DEV__) {
      console.warn(`Icon: unknown name "${name}"`);
    }
    return <Svg testID="Icon" width={dimension} height={dimension} viewBox="0 0 16 16" />;
  }

  // `border.width.focus` is a screen-pixel thickness. react-native-web honors
  // `vector-effect="non-scaling-stroke"` and keeps it there; native ignores the hint
  // and reads strokeWidth in grid units, so convert it at the rendered size — the
  // stroke is then the same thickness at every size, which is the point at `xs`.
  // Filled glyphs draw no stroke at all.
  const strokeWidth = glyph.filled
    ? undefined
    : Platform.OS === 'web'
      ? t.borderWidthFocus
      : t.borderWidthFocus * (GRID / dimension);

  return (
    <Svg
      testID="Icon"
      width={dimension}
      height={dimension}
      viewBox="0 0 16 16"
      fill="none"
      stroke={resolvedColor}
      strokeWidth={strokeWidth!}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={(decorative ? undefined : label)!}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no' : 'auto'}
    >
      {glyph.filled ? (
        <Path testID="Icon.glyph" d={glyph.d} fill={resolvedColor} stroke="none" fillRule="evenodd" />
      ) : (
        <Path testID="Icon.glyph" d={glyph.d} vectorEffect="non-scaling-stroke" />
      )}
    </Svg>
  );
}
