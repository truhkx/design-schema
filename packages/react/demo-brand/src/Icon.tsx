import { type ComponentPropsWithoutRef, type CSSProperties, type ReactElement, type Ref } from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import './Icon.css';

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
  | 'arrow-left'
  | 'calendar'
  | 'menu'
  | 'list'
  | 'grid'
  | 'play'
  | 'pause'
  | 'folder'
  | 'file';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Style bindings that can be overridden per instance. `strokeWidth` is locked: line glyphs stay
 * legible at `xs` because they stroke at the focus-ring width, so it is not in this union (a
 * consumer who must change it sets `--demo-icon-stroke-width` from their own CSS).
 */
export type IconOverridableBinding = 'size' | 'color';

const OVERRIDE_HOOK: Record<IconOverridableBinding, string> = {
  size: '--demo-icon-size',
  color: '--demo-icon-color',
};

function overridesToStyle(overrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as IconOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/**
 * Glyphs drawn on a 16×16 grid, keyed by `name` — one `<path>` each, with the `d` taken verbatim
 * from `tools/icon-paths.json`, the one table every platform draws from (the SwiftUI paths and the
 * reference PNGs in `tests/icon-snapshots/` are generated from it, and the SwiftUI gate compares
 * pixels). To add or redraw a glyph, change that JSON, not this table.
 *
 * Line glyphs are bare paths and inherit the root `<svg>`'s `fill="none" stroke="currentColor"`;
 * `filled` glyphs (the four status shapes, ellipsis, play, pause) carry
 * `fill="currentColor" stroke="none" fill-rule="evenodd"` themselves, so a status shape is a single
 * path whose inner mark (i, check, !, ×) is a hole and reads on any surface without a second color.
 *
 * A module export: other components render `<Icon name>`, and nothing else imports this table.
 */
export const paths: Record<IconName, ReactElement> = {
  check: <path data-part="glyph" d="M3 8.5l3.5 3.5L13 5" />,
  dash: <path data-part="glyph" d="M4 8h8" />,
  'chevron-right': <path data-part="glyph" d="M6 3l5 5-5 5" />,
  'chevron-down': <path data-part="glyph" d="M3 6l5 5 5-5" />,
  'chevron-up': <path data-part="glyph" d="M3 10l5-5 5 5" />,
  'chevron-left': <path data-part="glyph" d="M10 3L5 8l5 5" />,
  close: <path data-part="glyph" d="M3 3l10 10M13 3L3 13" />,
  plus: <path data-part="glyph" d="M8 3v10M3 8h10" />,
  minus: <path data-part="glyph" d="M3 8h10" />,
  /* circle-i */
  info: (
    <path
      data-part="glyph"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
    />
  ),
  /* circle-check */
  success: (
    <path
      data-part="glyph"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
    />
  ),
  /* triangle-! */
  warning: (
    <path
      data-part="glyph"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
    />
  ),
  /* octagon-x */
  danger: (
    <path
      data-part="glyph"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
    />
  ),
  external: <path data-part="glyph" d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />,
  /* three dots, the web table's three r=1.25 circles as one path */
  ellipsis: (
    <path
      data-part="glyph"
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
    />
  ),
  search: <path data-part="glyph" d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />,
  'arrow-right': <path data-part="glyph" d="M3 8h10M9 4l4 4-4 4" />,
  'arrow-left': <path data-part="glyph" d="M13 8H3M7 4L3 8l4 4" />,
  calendar: <path data-part="glyph" d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" />,
  menu: <path data-part="glyph" d="M2 4h12M2 8h12M2 12h12" />,
  /* the bullet dots are zero-length round-capped strokes, so the whole glyph is one stroked path */
  list: <path data-part="glyph" d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" />,
  grid: <path data-part="glyph" d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />,
  play: <path data-part="glyph" fill="currentColor" stroke="none" fillRule="evenodd" d="M4 2l10 6-10 6z" />,
  pause: (
    <path data-part="glyph" fill="currentColor" stroke="none" fillRule="evenodd" d="M3 2h3v12H3zM10 2h3v12H10z" />
  ),
  folder: <path data-part="glyph" d="M2 13V2h5v2h7v9z" />,
  file: <path data-part="glyph" d="M4 2h5l3 3v9H4zM9 2v3h3" />,
};

export interface IconProps
  extends Omit<
    ComponentPropsWithoutRef<'svg'>,
    'name' | 'role' | 'aria-hidden' | 'aria-label' | 'viewBox' | 'focusable' | 'width' | 'height' | 'children'
  > {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs a shape;
   * `info`, `success`, `warning` and `danger` are the four status shapes (circle-i, circle-check,
   * triangle-!, octagon-x) so tone is never carried by color alone.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring
   * `size`. For icons inside Text, Link and CtaButton labels.
   */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an image with
   * this name; when omitted or empty, it is decorative and hidden from assistive technology. Most
   * icons sit next to text and should have no label.
   */
  label?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Icon — Design Schema, category: primitive.
 *
 * When to use:
 * Use an Icon wherever a component's anatomy names one: the leading icon in a CtaButton, the chevron
 * in a Expander, the status shape in an Callout, the check in a Checkbox, the external mark on a
 * Link, the ellipsis in a collapsed Breadcrumb. Use `inline` when the icon is inside running text.
 * Give it a `label` only when the icon is the whole message — a lone warning triangle in a table
 * cell, say — and the label is what a screen reader should say instead.
 *
 * Glyphs are drawn in `currentColor`, so a CtaButton, Link or Callout colors them for free; an icon with
 * no colored ancestor falls back to what the document root resolves, `color.foreground`. Line
 * glyphs use the focus-ring width as their stroke, at every size, so they stay legible at `xs`.
 */
export const Icon = function Icon({
  ref,
  name,
  size = 'md',
  inline = false,
  label,
  overrides,
  className,
  style,
  ...rest
}: IconProps & { ref?: Ref<SVGSVGElement> | undefined }): ReactElement {
  const labelled = label !== undefined && label !== '';
  const glyph: ReactElement | undefined = paths[name];

  if (isDev && !glyph) {
    console.warn(`Icon: unknown name "${name}" — no glyph in the paths table, so nothing is drawn.`);
  }

  // The size class is applied even when `inline`: the hook stays set for consistency, and
  // `.demo-icon--inline` (later in the cascade) takes the font size from the surrounding text instead.
  const classes = ['demo-icon', `demo-icon--${size}`, inline ? 'demo-icon--inline' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <svg
      {...rest}
      ref={ref}
      data-ds="Icon"
      className={classes}
      style={mergedStyle}
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : 'true'}
    >
      {glyph}
    </svg>
  );
};
