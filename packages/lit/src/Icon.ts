import { LitElement, css, html, type PropertyValues, type TemplateResult } from 'lit';
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
  | 'calendar';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Overridable style hooks; see the `overrides` property. */
export type IconOverridableBinding = 'size' | 'color' | 'strokeWidth';

const HOOKS: Record<IconOverridableBinding, string> = {
  size: '--ds-icon-size',
  color: '--ds-icon-color',
  strokeWidth: '--ds-icon-stroke-width',
};

/**
 * The glyph table (anatomy: glyph), drawn on a 16×16 grid. Module-private on
 * purpose: other elements compose `<ds-icon name>` and never import the paths.
 *
 * Line glyphs are stroked in `currentColor` at `border.width.focus` (set in
 * CSS on the `<svg>`); filled glyphs (the four status shapes and the ellipsis)
 * carry `class="filled"` and have no stroke. The status shapes are four
 * different silhouettes (circle-i, circle-check, triangle-!, octagon-x) so
 * tone is never carried by color alone.
 */
const GLYPHS: Record<IconName, TemplateResult> = {
  check: html`<path d="m3 8.5 3 3 7-7" />`,
  dash: html`<path d="M4 8h8" />`,
  'chevron-right': html`<path d="m6 3 5 5-5 5" />`,
  'chevron-down': html`<path d="m3 6 5 5 5-5" />`,
  'chevron-up': html`<path d="m3 10 5-5 5 5" />`,
  'chevron-left': html`<path d="M10 3 5 8l5 5" />`,
  close: html`<path d="m4 4 8 8M12 4l-8 8" />`,
  plus: html`<path d="M8 3v10M3 8h10" />`,
  minus: html`<path d="M3 8h10" />`,
  info: html`<path
    class="filled"
    d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8.75 7v4.5h-1.5V7h1.5ZM8 4.25a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"
  />`,
  success: html`<path
    class="filled"
    d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm2.72 3.22 1.06 1.06L7 11.56 4.22 8.78l1.06-1.06L7 9.44l3.72-3.72Z"
  />`,
  warning: html`<path
    class="filled"
    d="M8 1.5 15.25 14H.75L8 1.5Zm0 3L3.35 12.5h9.3L8 4.5Zm.75 2.5v3.5h-1.5V7h1.5ZM8 11.05a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z"
  />`,
  danger: html`<path
    class="filled"
    d="M5.05 1h5.9L15 5.05v5.9L10.95 15h-5.9L1 10.95v-5.9L5.05 1Zm.62 1.5L2.5 5.67v4.66l3.17 3.17h4.66l3.17-3.17V5.67L10.33 2.5H5.67Zm-.17 3.14L8 6.94l2.3-2.3 1.06 1.06L9.06 8l2.3 2.3-1.06 1.06L8 9.06l-2.3 2.3-1.06-1.06L6.94 8l-2.3-2.3 1.06-1.06Z"
  />`,
  external: html`<path d="M7 3H3v10h10V9M9 3h4v4M13 3 7 9" />`,
  ellipsis: html`<path
    class="filled"
    d="M3 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"
  />`,
  search: html`<circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3.5 3.5" />`,
  'arrow-right': html`<path d="M3 8h10M9 4l4 4-4 4" />`,
  'arrow-left': html`<path d="M13 8H3M7 4 3 8l4 4" />`,
  calendar: html`<path
    d="M3 3.5h10a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1ZM2 6.5h12M5 2v3M11 2v3"
  />`,
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
  static override styles = css`
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

    /* filled glyphs (status shapes, ellipsis) have no stroke */
    .filled {
      fill: currentColor;
      stroke: none;
    }
  `;

  /**
   * Which glyph. The set is deliberately small and grows only when a component
   * needs a shape; `info`, `success`, `warning` and `danger` are the four status
   * shapes (circle-i, circle-check, triangle-!, octagon-x).
   */
  @property({ reflect: true }) name!: IconName;

  /** Rendered size, from the font-size scale so icons line up with text of the same size. */
  @property({ reflect: true }) size: IconSize = 'md';

  /** Size the glyph at 1em of the surrounding text and align it to the baseline, ignoring `size`. */
  @property({ type: Boolean, reflect: true }) inline = false;

  /**
   * Accessible name. When set, the icon is meaningful and exposed as an image
   * with this name; when omitted, it is decorative and hidden from assistive
   * technology. Most icons sit next to text and should have no label.
   */
  @property() label?: string;

  /** Per-instance style overrides: `{ color: 'color.status.danger.icon' }`. */
  @property({ attribute: false }) overrides?: Partial<Record<IconOverridableBinding, TokenRef>>;

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

  protected override render() {
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
