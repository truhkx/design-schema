import { LitElement, css, html, type PropertyValues, type TemplateResult, type CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

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

/** Overridable style hooks; see the `overrides` property. */
export type IconOverridableBinding = 'size' | 'color' | 'strokeWidth';

const HOOKS: Record<IconOverridableBinding, string> = {
  size: '--ds-icon-size',
  color: '--ds-icon-color',
  strokeWidth: '--ds-icon-stroke-width',
};

/**
 * The glyph table (anatomy: glyph), one `<path d>` per glyph on a 16×16 grid,
 * with `d` strings copied verbatim from `tools/icon-paths.json` — the table
 * every platform draws from. Module-private on purpose: other elements
 * compose `<ds-icon name>` and never import the paths. To add or redraw a
 * glyph, change the JSON, not this file.
 *
 * Line glyphs are stroked in `currentColor` at `border.width.focus` (set in
 * CSS on the `<svg>`); filled glyphs (the four status shapes and the
 * ellipsis) carry `class="filled"` and have no stroke — each is one
 * `fill-rule: evenodd` path whose inner mark is a hole. The status shapes are
 * four different silhouettes (circle-i, circle-check, triangle-!, octagon-x)
 * so tone is never carried by color alone.
 */
const GLYPHS: Record<IconName, TemplateResult> = {
  check: html`<path d="M3 8.5l3.5 3.5L13 5" />`,
  dash: html`<path d="M4 8h8" />`,
  'chevron-right': html`<path d="M6 3l5 5-5 5" />`,
  'chevron-down': html`<path d="M3 6l5 5 5-5" />`,
  'chevron-up': html`<path d="M3 10l5-5 5 5" />`,
  'chevron-left': html`<path d="M10 3L5 8l5 5" />`,
  close: html`<path d="M3 3l10 10M13 3L3 13" />`,
  plus: html`<path d="M8 3v10M3 8h10" />`,
  minus: html`<path d="M3 8h10" />`,
  info: html`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
  />`,
  success: html`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
  />`,
  warning: html`<path
    class="filled"
    d="M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
  />`,
  danger: html`<path
    class="filled"
    d="M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
  />`,
  external: html`<path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />`,
  ellipsis: html`<path
    class="filled"
    d="M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
  />`,
  search: html`<path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />`,
  'arrow-right': html`<path d="M3 8h10M9 4l4 4-4 4" />`,
  'arrow-left': html`<path d="M13 8H3M7 4L3 8l4 4" />`,
  calendar: html`<path d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" />`,
  menu: html`<path d="M2 4h12M2 8h12M2 12h12" />`,
  list: html`<path d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" />`,
  grid: html`<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />`,
  play: html`<path class="filled" d="M4 2l10 6-10 6z" />`,
  pause: html`<path class="filled" d="M3 2h3v12H3zM10 2h3v12H10z" />`,
  folder: html`<path d="M2 13V2h5v2h7v9z" />`,
  file: html`<path d="M4 2h5l3 3v9H4zM9 2v3h3" />`,
};

/**
 * `<ds-icon>` — Icon (category: primitive, role: img when labelled).
 *
 * `<ds-icon name="check" size="sm">` renders one inline `<svg viewBox="0 0 16 16">`
 * in its shadow root. The glyph is drawn in `currentColor`, and `color`
 * inherits through the shadow root, so a `<ds-icon>` inside a `<ds-button>`,
 * `<ds-link>` or `<ds-alert>` takes that component's foreground for free. Size
 * comes from the `font.size.{size}` scale so a glyph beside a label matches the
 * label; with `inline` it is 1em of the surrounding text and sits on the
 * baseline instead.
 *
 * Without `label` the icon is decorative and hidden from assistive technology
 * (`aria-hidden="true"`), so "Save" is announced as "Save", not "check mark
 * Save". With `label` it is exposed as an image with that name (`role="img"`
 * + `aria-label`). It never receives focus (`focusable="false"`).
 *
 * ## When to use
 *
 * Use an Icon wherever a component's anatomy names one: the leading icon in a
 * Button, the chevron in a Disclosure, the status shape in an Alert, the check
 * in a Checkbox, the external mark on a Link, the ellipsis in a collapsed
 * Breadcrumb. Use `inline` inside running text. Give it a `label` only when
 * the icon is the whole message. Do not use an Icon as a button: wrap it in a
 * `<ds-button icon-only label="…">`, which brings the target size, focus ring
 * and accessible name.
 *
 * @csspart glyph - The `<svg>` (anatomy: glyph).
 */
@customElement('ds-icon')
export class DsIcon extends LitElement {
  static override styles: CSSResult = css`
    /* size: font.size.{size} via --ds-icon-size; color: currentColor, falling back to inherit so an ancestor (Button, Link, Alert) colors this icon for free */
    :host {
      display: inline-flex;
      flex-shrink: 0;
      --ds-icon-size: var(--font-size-md);
      --ds-icon-stroke-width: var(--border-width-focus);
      inline-size: var(--ds-icon-size);
      block-size: var(--ds-icon-size);
      color: var(--ds-icon-color, inherit);
    }

    :host([size='xs']) {
      --ds-icon-size: var(--font-size-xs);
    }
    :host([size='sm']) {
      --ds-icon-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-icon-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-icon-size: var(--font-size-lg);
    }
    :host([size='xl']) {
      --ds-icon-size: var(--font-size-xl);
    }

    /* inline: 1em of the surrounding text, aligned to its baseline; ignores size (and any size override) */
    :host([inline]) {
      display: inline-block;
      vertical-align: -0.125em;
      inline-size: 1em;
      block-size: 1em;
    }

    :host([hidden]) {
      display: none;
    }

    /* strokeWidth: border.width.focus, kept at that thickness at every size so line glyphs stay legible at xs */
    svg {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      overflow: visible;
      fill: none;
      stroke: currentColor;
      stroke-width: var(--ds-icon-stroke-width);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    svg > * {
      vector-effect: non-scaling-stroke;
    }

    /* filled glyphs (status shapes, ellipsis) have no stroke; each is one evenodd path whose inner mark is a hole */
    .filled {
      fill: currentColor;
      stroke: none;
      fill-rule: evenodd;
    }
  `;

  /**
   * Which glyph. The set is deliberately small and grows only when a component
   * needs a shape; `info`, `success`, `warning` and `danger` are the four status
   * shapes (circle-i, circle-check, triangle-!, octagon-x).
   */
  @property({ reflect: true }) accessor name!: IconName;

  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  @property({ reflect: true }) accessor size: IconSize = 'md';

  /** Size the glyph at 1em of the surrounding text and align it to the baseline, ignoring `size`. */
  @property({ type: Boolean, reflect: true }) accessor inline = false;

  /**
   * Accessible name. When set, the icon is meaningful and exposed as an image
   * with this name; when omitted, it is decorative and hidden from assistive
   * technology. Most icons sit next to text and should have no label.
   */
  @property() accessor label: string | undefined;

  /** Per-instance style overrides: `{ color: 'color.status.danger.icon' }`. */
  @property({ attribute: false }) accessor overrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Icon');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as IconOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  protected override render(): TemplateResult {
    const glyph: TemplateResult | undefined = GLYPHS[this.name];
    if (import.meta.env.DEV && glyph === undefined) {
      console.warn(
        `<ds-icon> ${this.name === undefined ? 'requires a `name`' : `has no glyph named "${this.name}"`}.`,
      );
    }
    const labelled = Boolean(this.label);

    return html`
      <svg
        part="glyph"
        viewBox="0 0 16 16"
        focusable="false"
        role=${ifDefined(labelled ? 'img' : undefined)}
        aria-label=${ifDefined(labelled ? this.label : undefined)}
        aria-hidden=${ifDefined(labelled ? undefined : 'true')}
      >
        ${glyph}
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-icon': DsIcon;
  }
}
