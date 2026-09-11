import { LitElement, css, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';

export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6';
export type HeadingSize = '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md';
export type HeadingAlign = 'start' | 'center' | 'end';

/** Overridable style hooks; see the `overrides` property. `color` is locked and excluded. */
export type HeadingOverridableBinding = 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'marginBlockEnd';

const HOOKS: Record<HeadingOverridableBinding, string> = {
  fontFamily: `--ds-heading-font-family`,
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

function isHeadingLevel(value: unknown): value is HeadingLevel {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TAGS, value);
}

/**
 * `<ds-heading>` — Heading (category: typography).
 *
 * `<ds-heading level="2">` renders a real `<h2>` inside its shadow root with
 * `part="heading"`. `level` chooses the element (document outline); `size`
 * chooses the visual size independently and defaults to the size that matches
 * the level (1→4xl, 2→3xl, 3→2xl, 4→xl, 5→lg, 6→md).
 *
 * ## When to use
 *
 * Use a Heading to title a page, a section, or a card that contains its own
 * content. Choose `level` from the document outline — the page title is `1`,
 * its major sections are `2`, their subsections `3` — and then choose `size`
 * separately if the default visual size is wrong for the layout. Decoupling
 * level from size is the whole point of this component: it lets designers pick
 * the right look without breaking the outline.
 *
 * @slot - The heading text. Keep it short and descriptive; it is what appears in the page outline.
 * @csspart heading - The rendered `<h1>`–`<h6>`.
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

    .heading {
      margin-block: 0 var(--ds-heading-margin-block-end);
      margin-inline: 0;
      font-family: var(--ds-heading-font-family);
      font-weight: var(--ds-heading-font-weight);
      font-size: var(--ds-heading-font-size);
      line-height: var(--ds-heading-line-height);
      /* color: color.foreground.strong, locked — no override hook */
      color: var(--color-foreground-strong);
      text-align: start;
    }

    /* fontSize: font.size.{size} default per level */
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

    /* fontSize: an explicit size wins over the level default */
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

    :host([align='start']) .heading {
      text-align: start;
    }
    :host([align='center']) .heading {
      text-align: center;
    }
    :host([align='end']) .heading {
      text-align: end;
    }
  `;

  /**
   * Position in the document outline. Controls the semantic element, not the
   * visual size. Required; a missing or unknown level falls back to `<h2>`.
   */
  @property({ reflect: true }) accessor level!: HeadingLevel;

  /** Visual size, independent of level. Defaults to the size that matches the level. */
  @property({ reflect: true }) accessor size: HeadingSize | undefined;

  /** Horizontal text alignment. */
  @property({ reflect: true }) accessor align: HeadingAlign = 'start';

  /** Per-instance style overrides: `{ fontSize: 'font.size.lg' }`. `color` is locked and ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Heading');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override render(): TemplateResult {
    const tag = isHeadingLevel(this.level) ? TAGS[this.level] : TAGS['2'];
    return html`<${tag} class="heading" part="heading"><slot></slot></${tag}>`;
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
