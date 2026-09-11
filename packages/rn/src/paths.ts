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

/** One glyph: an SVG path `d` on the shared 16×16 grid. Line glyphs stroke; `filled` glyphs fill (fillRule evenodd) and draw no stroke. */
export interface IconGlyph {
  readonly d: string;
  readonly filled?: boolean;
}

/**
 * Glyphs drawn on a 16×16 grid, keyed by `name` — the same grid and `d` data as the
 * web/Lit `paths` table, so swapping platforms stays visually neutral. Line glyphs
 * (check, dash, chevrons, close, plus, minus, external, search, arrows, calendar,
 * menu, list, grid, folder, file) inherit the root `<Svg>`'s `fill="none"
 * stroke={color}`. Filled glyphs (the four status shapes, ellipsis, play, pause) set
 * `fill={color} stroke="none"`; the status shapes are single `fillRule="evenodd"`
 * paths whose inner mark (i, check, !, x) is a hole.
 *
 * Icon renders `<Icon name>`; nothing else should import this table.
 */
export const paths: Record<IconName, IconGlyph> = {
  check: { d: 'M3 8.5l3.5 3.5L13 5' },
  dash: { d: 'M4 8h8' },
  'chevron-right': { d: 'M6 3l5 5-5 5' },
  'chevron-down': { d: 'M3 6l5 5 5-5' },
  'chevron-up': { d: 'M3 10l5-5 5 5' },
  'chevron-left': { d: 'M10 3L5 8l5 5' },
  close: { d: 'M3 3l10 10M13 3L3 13' },
  plus: { d: 'M8 3v10M3 8h10' },
  minus: { d: 'M3 8h10' },
  /* circle-i */
  info: {
    filled: true,
    d: 'M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z',
  },
  /* circle-check */
  success: {
    filled: true,
    d: 'M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z',
  },
  /* triangle-! */
  warning: {
    filled: true,
    d: 'M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z',
  },
  /* octagon-x */
  danger: {
    filled: true,
    d: 'M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z',
  },
  external: { d: 'M6 3H3v10h10v-3M9 3h4v4M13 3L7 9' },
  ellipsis: {
    filled: true,
    d: 'M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0',
  },
  search: { d: 'M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14' },
  'arrow-right': { d: 'M3 8h10M9 4l4 4-4 4' },
  'arrow-left': { d: 'M13 8H3M7 4L3 8l4 4' },
  calendar: { d: 'M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3' },
  menu: { d: 'M2 4h12M2 8h12M2 12h12' },
  /* Dots drawn as zero-length, round-capped strokes so they render on the same stroke-only path as the lines. */
  list: { d: 'M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01' },
  grid: { d: 'M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z' },
  play: { filled: true, d: 'M4 2l10 6-10 6z' },
  pause: { filled: true, d: 'M3 2h3v12H3zM10 2h3v12H10z' },
  folder: { d: 'M2 13V2h5v2h7v9z' },
  file: { d: 'M4 2h5l3 3v9H4zM9 2v3h3' },
};
