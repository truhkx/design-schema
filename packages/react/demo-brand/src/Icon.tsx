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
    // Locked bindings passed from JavaScript have no hook here and are ignored.
    const hook = OVERRIDE_HOOK[binding] as string | undefined;
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
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
 * A module export, not re-exported from the package index: other components render `<Icon name>`.
 */
export const paths: Record<IconName, ReactElement> = {
  check: <path d="M3 8.5l3.5 3.5L13 5" />,
  dash: <path d="M4 8h8" />,
  'chevron-right': <path d="M6 3l5 5-5 5" />,
  'chevron-down': <path d="M3 6l5 5 5-5" />,
  'chevron-up': <path d="M3 10l5-5 5 5" />,
  'chevron-left': <path d="M10 3L5 8l5 5" />,
  close: <path d="M3 3l10 10M13 3L3 13" />,
  plus: <path d="M8 3v10M3 8h10" />,
  minus: <path d="M3 8h10" />,
  /* circle-i */
  info: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
    />
  ),
  /* circle-check */
  success: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
    />
  ),
  /* triangle-! */
  warning: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
    />
  ),
  /* octagon-x */
  danger: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
    />
  ),
  external: <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />,
  /* three dots, the web table's three r=1.25 circles as one path */
  ellipsis: (
    <path
      fill="currentColor"
      stroke="none"
      fillRule="evenodd"
      d="M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
    />
  ),
  search: <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />,
  'arrow-right': <path d="M3 8h10M9 4l4 4-4 4" />,
  'arrow-left': <path d="M13 8H3M7 4L3 8l4 4" />,
  calendar: <path d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" />,
  menu: <path d="M2 4h12M2 8h12M2 12h12" />,
  /* the bullet dots are zero-length round-capped strokes, so the whole glyph is one stroked path */
  list: <path d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" />,
  grid: <path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />,
  play: <path fill="currentColor" stroke="none" fillRule="evenodd" d="M4 2l10 6-10 6z" />,
  pause: <path fill="currentColor" stroke="none" fillRule="evenodd" d="M3 2h3v12H3zM10 2h3v12H10z" />,
  folder: <path d="M2 13V2h5v2h7v9z" />,
  file: <path d="M4 2h5l3 3v9H4zM9 2v3h3" />,
};

export interface IconProps
  extends Omit<
    ComponentPropsWithoutRef<'svg'>,
    | 'name'
    | 'role'
    | 'aria-hidden'
    | 'aria-label'
    | 'viewBox'
    | 'focusable'
    | 'width'
    | 'height'
    | 'children'
    | 'className'
    | 'style'
  > {
  /**
   * Which glyph. The set is deliberately small and grows only when a component needs a shape;
   * `info`, `success`, `warning` and `danger` are the four status shapes (circle-i, circle-check,
   * triangle-!, octagon-x) so tone is never carried by color alone. `name` has no default; the
   * Default story renders `check`. Enum stories for hyphenated names capitalise each segment and
   * join them: `NameChevronRight`, `NameArrowLeft`.
   */
  name: IconName;
  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  size?: IconSize | undefined;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring
   * `size`. For icons inside Text, Link and CtaButton labels. On web `font-size: inherit` always has a
   * surrounding size to read, so there is no fallback.
   */
  inline?: boolean | undefined;
  /**
   * Accessible name. When set (non-empty), the icon is meaningful and exposed as an image with
   * this name; when omitted or empty, it is decorative and hidden from assistive technology — an
   * empty string is the decorative case, not an authoring error. Most icons sit next to text and
   * should have no label.
   */
  label?: string | undefined;
  /**
   * Per-instance style overrides: each entry sets the matching CSS hook (`--demo-icon-size`,
   * `--demo-icon-color`) to that token, inline. `size` is a no-op while `inline` is set.
   */
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
export function Icon({
  ref,
  name,
  size = 'md',
  inline = false,
  label,
  overrides,
  ...rest
}: IconProps & { ref?: Ref<SVGSVGElement> | undefined }): ReactElement {
  const labelled = label !== undefined && label !== '';
  // Own keys only, so a JavaScript caller's `name="toString"` is unknown rather than a prototype hit.
  const glyph = Object.hasOwn(paths, name) ? paths[name] : undefined;

  // Unreachable from TypeScript, possible from JavaScript: draw an empty glyph (keeping the label or
  // decorative props, so an unlabelled unknown icon stays hidden) and warn on every render, no dedupe.
  if (isDev && !glyph) {
    console.warn(`Icon: unknown name "${String(name)}"`);
  }

  // The size class is applied even when `inline`: the hook stays set for consistency, and
  // `.demo-icon--inline` (later in the cascade) takes the font size from the surrounding text instead.
  const classes = inline ? `demo-icon demo-icon--${size} demo-icon--inline` : `demo-icon demo-icon--${size}`;

  // className and style from `rest` (JavaScript callers) are overwritten below: the override
  // contract is the only per-instance styling.
  return (
    <svg
      {...rest}
      ref={ref}
      data-ds="Icon"
      data-part="glyph"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
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
}
