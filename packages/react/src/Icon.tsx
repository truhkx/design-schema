import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
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
  | 'arrow-left';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Glyphs drawn on a 16×16 grid, keyed by `name`.
 *
 * Line glyphs (check, dash, chevrons, close, plus, minus, external, search, arrows) are bare
 * `<path>`s and inherit the root `<svg>`'s `fill="none" stroke="currentColor"`. Filled glyphs
 * (the four status shapes and ellipsis) set `fill="currentColor" stroke="none"` on themselves;
 * the status shapes are single `fill-rule="evenodd"` paths whose inner mark (i, check, !, x) is a
 * hole, so they read on any surface without a second color.
 *
 * Other components render `<Icon name>`; nothing else should import this table.
 */
export const paths: Record<IconName, ReactNode> = {
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
  ellipsis: (
    <g fill="currentColor" stroke="none">
      <circle cx="3" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="13" cy="8" r="1.25" />
    </g>
  ),
  search: <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />,
  'arrow-right': <path d="M3 8h10M9 4l4 4-4 4" />,
  'arrow-left': <path d="M13 8H3M7 4L3 8l4 4" />,
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
  size?: IconSize;
  /**
   * Size the glyph at 1em of the surrounding text and align it to the text baseline, ignoring
   * `size`. For icons inside Text, Link and Button labels.
   */
  inline?: boolean;
  /**
   * Accessible name. When set, the icon is meaningful and exposed as an image with this name;
   * when omitted, it is decorative and hidden from assistive technology. Most icons sit next to
   * text and should have no label.
   */
  label?: string;
}

/**
 * Icon — Design Schema, category: primitive.
 *
 * When to use:
 * Use an Icon wherever a component's anatomy names one: the leading icon in a Button, the chevron
 * in a Disclosure, the status shape in an Alert, the check in a Checkbox, the external mark on a
 * Link, the ellipsis in a collapsed Breadcrumb. Use `inline` when the icon is inside running text.
 * Give it a `label` only when the icon is the whole message — a lone warning triangle in a table
 * cell, say — and the label is what a screen reader should say instead.
 *
 * Glyphs are drawn in `currentColor`, so a Button, Link or Alert colors them for free; only an
 * icon with no colored ancestor falls back to `color.foreground`. Line glyphs use the focus-ring
 * width as their stroke.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 'md', inline = false, label, className, ...rest },
  ref,
) {
  const labelled = label !== undefined && label !== '';

  const classes = ['ds-icon', inline ? 'ds-icon--inline' : `ds-icon--${size}`, className ?? null]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      {...rest}
      ref={ref}
      className={classes}
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
      {paths[name]}
    </svg>
  );
});
