import { LitElement, css, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import type { TextAlign } from './Text.js';

export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';

/** Overridable style hooks; see the `overrides` property. `color` is locked and excluded. */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

const HOOKS: Record<HeadingOverridableBinding, string> = {
  fontFamily: '--ds-heading-font-family',
  fontWeight: '--ds-heading-font-weight',
  fontSize: '--ds-heading-font-size',
  lineHeight: '--ds-heading-line-height',
  marginBlockEnd: '--ds-heading-margin-block-end',
};

const TAGS: Record<HeadingLevel, StaticValue> = {
  '1': literal`h1`,
  '2': literal`h2`,
  '3': literal`h3`,
  '4': literal`h4`,
  '5': literal`h5`,
  '6': literal`h6`,
};

/** The element rendered when `level` is missing or unknown, so the heading is never dropped. */
const FALLBACK_LEVEL: HeadingLevel = '2';

/**
 * Canonical levels are the strings `'1'`–`'6'`; the number form (`level=3`,
 * `.level = 3`) is accepted too and reflects as the same attribute.
 */
function normalizeLevel(value: HeadingLevel | number | null | undefined): HeadingLevel | undefined {
  if (value === undefined || value === null) return undefined;
  const key = String(value);
  return Object.prototype.hasOwnProperty.call(TAGS, key) ? (key as HeadingLevel) : undefined;
}

/**
 * `<ds-heading>` — Heading (category: typography).
 *
 * `<ds-heading level="2">` renders a real `<h2>` inside its shadow root. `level`
 * chooses the semantic element — the document outline screen-reader users
 * navigate by — and `size` chooses the visual size independently, defaulting to
 * the size that matches the level (1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md).
 * `level`, `size` and `align` are reflected, so `ds-heading[level='1']`
 * selectors work from a consuming app.
 *
 * ## When to use
 *
 * Use a Heading to title a page, a section, or a card that contains its own
 * content. Choose `level` from the document outline — the page title is `1`, its
 * major sections are `2`, their subsections `3` — and then choose `size`
 * separately if the default visual size is wrong for the layout. Decoupling
 * level from size is the whole point of this component: it lets designers pick
 * the right look without breaking the outline.
 *
 * ## When not to use
 *
 * Do not use a Heading purely to make text large or bold — use `<ds-text>` with
 * a larger size. Do not skip levels (a `2` followed by a `4`), do not use more
 * than one `level="1"` per page, and do not put interactive controls inside a
 * heading.
 *
 * Styling comes through the `--ds-heading-*` hooks and the `overrides`
 * property, never `::part`. Headings inside shadow roots are exposed to
 * assistive technology normally, but some in-page outline tools do not see them.
 *
 * @slot - The heading text. Keep it short and descriptive; it is what appears in the page outline.
 * @csspart text - The rendered `<h1>`–`<h6>`.
 */
@customElement('ds-heading')
export class DsHeading extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-heading-font-family: var(--font-family-heading);
      --ds-heading-font-weight: var(--font-weight-semibold);
      --ds-heading-font-size: var(--font-size-3xl);
      --ds-heading-line-height: var(--font-line-height-tight);
      --ds-heading-margin-block-end: var(--space-sm);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='text'] {
      /* marginBlockEnd: space.sm — the one margin the system allows, because a
         heading owns the gap to its own first paragraph. */
      margin-block: 0 var(--ds-heading-margin-block-end);
      margin-inline: 0;
      font-family: var(--ds-heading-font-family);
      font-weight: var(--ds-heading-font-weight);
      font-size: var(--ds-heading-font-size);
      line-height: var(--ds-heading-line-height);
      /* color: color.foreground.strong, locked (AAA against color.background) — no override hook */
      color: var(--color-foreground-strong);
      text-align: start;
    }

    /* fontSize: font.size.{size}, defaulted per level */
    :host([level='1']) {
      --ds-heading-font-size: var(--font-size-4xl);
    }
    :host([level='2']) {
      --ds-heading-font-size: var(--font-size-3xl);
    }
    :host([level='3']) {
      --ds-heading-font-size: var(--font-size-2xl);
    }
    :host([level='4']) {
      --ds-heading-font-size: var(--font-size-xl);
    }
    :host([level='5']) {
      --ds-heading-font-size: var(--font-size-lg);
    }
    :host([level='6']) {
      --ds-heading-font-size: var(--font-size-md);
    }

    /* fontSize: an explicit size wins over the level default (same specificity, later rule) */
    :host([size='4xl']) {
      --ds-heading-font-size: var(--font-size-4xl);
    }
    :host([size='3xl']) {
      --ds-heading-font-size: var(--font-size-3xl);
    }
    :host([size='2xl']) {
      --ds-heading-font-size: var(--font-size-2xl);
    }
    :host([size='xl']) {
      --ds-heading-font-size: var(--font-size-xl);
    }
    :host([size='lg']) {
      --ds-heading-font-size: var(--font-size-lg);
    }
    :host([size='md']) {
      --ds-heading-font-size: var(--font-size-md);
    }

    :host([align='start']) [data-part='text'] {
      text-align: start;
    }
    :host([align='center']) [data-part='text'] {
      text-align: center;
    }
    :host([align='end']) [data-part='text'] {
      text-align: end;
    }
  `;

  /**
   * Position in the document outline. Controls the semantic element, not the
   * visual size — screen-reader users navigate by heading level, so levels must
   * not skip (h1 → h3). Required; the canonical values are the strings `'1'`–
   * `'6'` and the numbers `1`–`6` are accepted too. The property holds
   * `undefined` until set; a missing, out-of-range or non-numeric level renders
   * as `<h2>` at the 3xl size and warns once per element in development.
   */
  @property({ type: String, reflect: true }) accessor level: HeadingLevel | 1 | 2 | 3 | 4 | 5 | 6 | undefined;

  /**
   * Visual size, independent of level. Defaults per level: 1 → 4xl, 2 → 3xl,
   * 3 → 2xl, 4 → xl, 5 → lg, 6 → md; an explicit size always wins. The resolved
   * default is never written back, so `[size]` matches only an explicit size.
   */
  @property({ type: String, reflect: true }) accessor size: HeadingSize | undefined;

  /** Horizontal text alignment. `start`/`end` follow writing direction. Text's align type. */
  @property({ type: String, reflect: true }) accessor align: TextAlign = 'start';

  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;

  /** Development-only: the fallback-level warning is emitted at most once per element, for its lifetime. */
  private warnedMissingLevel = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Heading');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    // Checked on every update, not only when `level` changed: an absent level has
    // no initial value, so it never appears in `changed` on the first render.
    if (import.meta.env.DEV && !this.warnedMissingLevel && normalizeLevel(this.level) === undefined) {
      this.warnedMissingLevel = true;
      console.warn(`Heading: level ${String(this.level)} is not one of 1–6; rendering as level ${FALLBACK_LEVEL}.`);
    }
  }

  protected override render(): TemplateResult {
    const tag = TAGS[normalizeLevel(this.level) ?? FALLBACK_LEVEL];
    return html`<${tag} part="text" data-part="text"><slot></slot></${tag}>`;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as HeadingOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-heading': DsHeading;
  }
}
