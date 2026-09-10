import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/** Overridable style hooks; see the `overrides` property. `labelColor` is locked and excluded. */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

const HOOKS: Record<DividerOverridableBinding, string> = {
  color: '--ds-divider-color',
  thickness: '--ds-divider-thickness',
  spacing: '--ds-divider-spacing',
  labelSize: '--ds-divider-label-size',
  labelGap: '--ds-divider-label-gap',
  fontFamily: `--ds-divider-font-family`,
};

/**
 * `<ds-divider>` — Divider (category: layout, APG: separator).
 *
 * `<ds-divider>` is decorative and hidden from assistive technology by
 * default. `<ds-divider semantic>` or `<ds-divider label="or">` expose it as
 * `role="separator"` with `aria-orientation`, set on the host through
 * `ElementInternals` (a labelled divider is always semantic, whether or not
 * `semantic` is set). The host is the flex layout for one or two line
 * segments (`part="line"`) around an optional `<ds-text part="label">`.
 *
 * ## When to use
 *
 * Use a Divider between items in a dense list where whitespace alone does not
 * separate them, between toolbar groups (`orientation="vertical"`), and with
 * a `label` as an "or" between alternatives or a date heading in a feed. Use
 * `spacing` when the divider stands outside a Stack.
 *
 * ## When not to use
 *
 * Do not use dividers between page sections — use spacing and headings. Do
 * not use a labelled divider as a heading substitute.
 *
 * @csspart line - Each line segment either side of the label (anatomy: line).
 * @csspart label - The `<ds-text>` label (anatomy: label).
 */
@customElement('ds-divider')
export class DsDivider extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      gap: var(--ds-divider-label-gap);
      margin-block: var(--ds-divider-spacing);
      --ds-divider-color: var(--color-border);
      --ds-divider-thickness: var(--border-width-thin);
      --ds-divider-spacing: var(--layout-gap-none);
      --ds-divider-label-size: var(--font-size-sm);
      --ds-divider-label-gap: var(--layout-gap-normal);
      --ds-divider-font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation='vertical']) {
      display: inline-flex;
      flex-direction: column;
      align-self: stretch;
      margin-block: 0;
      margin-inline: var(--ds-divider-spacing);
    }

    /* spacing: layout.gap.{spacing} */
    :host([spacing='none']) {
      --ds-divider-spacing: var(--layout-gap-none);
    }
    :host([spacing='tight']) {
      --ds-divider-spacing: var(--layout-gap-tight);
    }
    :host([spacing='normal']) {
      --ds-divider-spacing: var(--layout-gap-normal);
    }
    :host([spacing='loose']) {
      --ds-divider-spacing: var(--layout-gap-loose);
    }

    /* color / thickness: color.border, border.width.thin */
    .line {
      flex: 1 1 auto;
      background: var(--ds-divider-color);
    }
    :host(:not([orientation='vertical'])) .line {
      block-size: var(--ds-divider-thickness);
    }
    :host([orientation='vertical']) .line {
      inline-size: var(--ds-divider-thickness);
    }

    /* labelSize / fontFamily forward into ds-text's own override hooks; labelColor stays on ds-text's locked tone="muted" */
    .label {
      --ds-text-font-size: var(--ds-divider-label-size);
      --ds-text-font-family: var(--ds-divider-font-family);
      white-space: nowrap;
    }
  `;

  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  @property({ reflect: true }) orientation: DividerOrientation = 'horizontal';

  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier
   * today"). Setting it turns the divider semantic. Ignored on a vertical
   * divider (a dev warning is logged): a vertical line has no room for
   * centered text.
   */
  @property() label?: string;

  /** Expose as role="separator" to assistive technology. Leave false for purely visual lines between list rows. */
  @property({ type: Boolean, reflect: true }) semantic = false;

  /** Space on both sides, from the layout rhythm, for dividers used outside a Stack that already spaces them. */
  @property({ reflect: true }) spacing: DividerSpacing = 'none';

  /** Per-instance style overrides: `{ spacing: 'layout.gap.tight' }`. `labelColor` is locked and ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<DividerOverridableBinding, TokenRef>>;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Divider');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('semantic') || changed.has('label') || changed.has('orientation')) {
      this.syncInternals();
    }
    if ((changed.has('label') || changed.has('orientation')) && this.label && this.orientation === 'vertical') {
      if (import.meta.env.DEV) {
        console.warn(
          'ds-divider: `label` is ignored on a vertical divider — a vertical line has no room for centered text.',
        );
      }
    }
  }

  /** `label` has no effect on a vertical divider (no room for centered text). */
  private get effectiveLabel(): string | undefined {
    return this.orientation === 'vertical' ? undefined : this.label;
  }

  protected override render() {
    const label = this.effectiveLabel;
    if (!label) {
      return html`<span class="line" part="line"></span>`;
    }
    return html`
      <span class="line" part="line"></span>
      <ds-text part="label" class="label" element="span" size="sm" tone="muted">${label}</ds-text>
      <span class="line" part="line"></span>
    `;
  }

  /** role=separator + aria-orientation when semantic or labelled; aria-hidden otherwise. */
  private syncInternals(): void {
    const semantic = this.semantic || Boolean(this.effectiveLabel);
    this.internals.role = semantic ? 'separator' : null;
    this.internals.ariaOrientation = semantic ? this.orientation : null;
    this.internals.ariaHidden = semantic ? null : 'true';
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DividerOverridableBinding[]) {
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
    'ds-divider': DsDivider;
  }
}
