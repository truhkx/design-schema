import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

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
  fontFamily: '--ds-divider-font-family',
};

/** Divider bindings forwarded to the composed label Text's `overrides`. */
const LABEL_FORWARDS: ReadonlyArray<[DividerOverridableBinding, TextOverridableBinding]> = [
  ['labelSize', 'fontSize'],
  ['fontFamily', 'fontFamily'],
];

/**
 * `<ds-divider>` — Divider (category: layout, role: separator).
 *
 * The host is the line. `<ds-divider>` is decorative and hidden from assistive
 * technology (`aria-hidden="true"`). `<ds-divider semantic>` or
 * `<ds-divider label="or">` is exposed as `role="separator"` with
 * `aria-orientation`; a label renders in the shadow root as a
 * `<ds-text size="sm" tone="muted">` between two aria-hidden line segments,
 * and names the separator through `aria-label` on the host.
 *
 * ## When to use
 *
 * Between items in a dense list where whitespace alone does not separate
 * them, between toolbar groups (`orientation="vertical"`), and with a `label`
 * as an "or" between alternatives or a date heading in a feed. Use `spacing`
 * when the divider stands outside a Stack.
 *
 * ## When not to use
 *
 * Not between page sections (use section spacing and headings), not under a
 * heading as decoration, and not as a heading substitute.
 */
@customElement('ds-divider')
export class DsDivider extends LitElement {
  static override styles: CSSResult = css`
    :host {
      --ds-divider-color: var(--color-border);
      --ds-divider-thickness: var(--border-width-thin);
      --ds-divider-label-size: var(--font-size-sm);
      --ds-divider-label-gap: var(--layout-gap-normal);
      --ds-divider-font-family: var(--font-family-body);
      display: block;
      box-sizing: border-box;
      block-size: var(--ds-divider-thickness);
      background-color: var(--ds-divider-color);
    }

    :host([hidden]) {
      display: none;
    }

    /* stretches in a flex/grid row (block-size stays auto so align-self: stretch applies) and fills a parent with a definite height */
    :host([orientation='vertical']) {
      display: inline-block;
      inline-size: var(--ds-divider-thickness);
      block-size: auto;
      min-block-size: 100%;
      align-self: stretch;
    }

    /* spacing: layout.gap.{spacing}; none is the off state, so the hook (and any override of it) applies only once a value is chosen */
    :host([spacing='tight']) {
      --ds-divider-spacing: var(--layout-gap-tight);
    }
    :host([spacing='normal']) {
      --ds-divider-spacing: var(--layout-gap-normal);
    }
    :host([spacing='loose']) {
      --ds-divider-spacing: var(--layout-gap-loose);
    }
    :host([spacing]:not([spacing='none'])) {
      margin-block: var(--ds-divider-spacing);
    }
    :host([orientation='vertical'][spacing]:not([spacing='none'])) {
      margin-block: 0;
      margin-inline: var(--ds-divider-spacing);
    }

    /* labelled (horizontal only): the host is a row of line, label, line */
    :host([data-labelled]) {
      display: flex;
      align-items: center;
      gap: var(--ds-divider-label-gap);
      block-size: auto;
      background-color: transparent;
    }

    [data-part='line'] {
      flex: 1 1 auto;
      block-size: var(--ds-divider-thickness);
      background-color: var(--ds-divider-color);
    }

    /* labelSize / fontFamily reach ds-text through its documented hooks (and its overrides); color and size come from tone="muted" size="sm" */
    [data-part='label'] {
      --ds-text-font-size: var(--ds-divider-label-size);
      --ds-text-font-family: var(--ds-divider-font-family);
      flex: 0 0 auto;
      white-space: nowrap;
    }
  `;

  /** Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height. */
  @property({ type: String, reflect: true }) accessor orientation: DividerOrientation = 'horizontal';

  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier
   * today"). Turns the divider into a labelled separator (`semantic` is
   * implied). Ignored on a vertical divider, with a development warning; an
   * ignored label implies nothing either. An empty string is no label.
   */
  @property({ type: String }) accessor label: string | undefined;

  /** Expose as a separator to assistive technology. Leave false for purely visual lines between list rows. */
  @property({ type: Boolean, reflect: true }) accessor semantic = false;

  /** Space on both sides along the cross axis, from the layout rhythm, for dividers used outside a Stack. */
  @property({ type: String, reflect: true }) accessor spacing: DividerSpacing = 'none';

  /** Per-instance style overrides: `{ color: 'color.border.strong' }`. `labelColor` is locked and ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;

  /** The label/orientation pair last warned about, so the warning fires once per appearance or change. */
  private warnedLabel: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Divider');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) this.applyOverrides();
    if (changed.has('semantic') || changed.has('label') || changed.has('orientation')) {
      this.syncSemantics();
    }
    if (changed.has('label') || changed.has('orientation')) this.warnIgnoredLabel();
  }

  /** The label in effect: none on a vertical divider, and an empty string is no label. */
  private get effectiveLabel(): string | undefined {
    return this.orientation === 'vertical' ? undefined : this.label || undefined;
  }

  protected override render(): TemplateResult | typeof nothing {
    const label = this.effectiveLabel;
    if (label === undefined) return nothing;
    return html`
      <span part="line" data-part="line" aria-hidden="true"></span>
      <ds-text
        part="label"
        data-part="label"
        size="sm"
        tone="muted"
        element="span"
        .overrides=${this.labelOverrides()}
      >${label}</ds-text>
      <span part="line" data-part="line" aria-hidden="true"></span>
    `;
  }

  /** `labelSize` → Text `fontSize`, `fontFamily` → Text `fontFamily`; only bindings the author overrode. */
  private labelOverrides(): Partial<Record<TextOverridableBinding, TokenRef | undefined>> | undefined {
    const forwarded: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
    let any = false;
    for (const [from, to] of LABEL_FORWARDS) {
      const ref = this.overrides?.[from];
      if (ref !== undefined) {
        forwarded[to] = ref;
        any = true;
      }
    }
    return any ? forwarded : undefined;
  }

  /**
   * Decorative → aria-hidden; semantic or labelled → role=separator with
   * aria-orientation (and the label as its name, since a separator's content
   * is presentational). Plain host attributes so accessibility-tree readers observe them.
   */
  private syncSemantics(): void {
    const label = this.effectiveLabel;
    const semantic = this.semantic || label !== undefined;
    this.toggleAttribute('data-labelled', label !== undefined);
    if (semantic) {
      this.removeAttribute('aria-hidden');
      this.setAttribute('role', 'separator');
      this.setAttribute('aria-orientation', this.orientation);
    } else {
      this.setAttribute('aria-hidden', 'true');
      this.removeAttribute('role');
      this.removeAttribute('aria-orientation');
    }
    if (label !== undefined) this.setAttribute('aria-label', label);
    else this.removeAttribute('aria-label');
  }

  private warnIgnoredLabel(): void {
    const ignored = this.orientation === 'vertical' && this.label ? this.label : undefined;
    if (ignored !== undefined && ignored !== this.warnedLabel && import.meta.env.DEV) {
      console.warn('ds-divider: `label` is ignored on a vertical divider: a vertical line has no room for centered text.');
    }
    this.warnedLabel = ignored;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DividerOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) this.style.removeProperty(hook);
      else this.style.setProperty(hook, cssVar(ref));
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-divider': DsDivider;
  }
}
