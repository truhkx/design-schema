import { LitElement, css, html, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import type { TextOverridableBinding } from './Text.js';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'tight' | 'normal' | 'loose';

/**
 * Overridable style hooks; see the `overrides` property. The accessibility-bearing `labelColor` is
 * locked and excluded. `labelSize` and `fontFamily` reach the composed label `Text` through its own
 * `overrides` (as `fontSize` and `fontFamily`) rather than a `--ds-divider-*` hook: Divider does not
 * style the Text itself, and page CSS reaches the label through Text's hooks.
 */
export type DividerOverridableBinding = 'color' | 'thickness' | 'spacing' | 'labelSize' | 'labelGap' | 'fontFamily';

/** The bindings Divider paints itself, and the host hook each one sets. */
const HOOKS: Partial<Record<DividerOverridableBinding, string>> = {
  color: '--ds-divider-color',
  thickness: '--ds-divider-thickness',
  spacing: '--ds-divider-spacing',
  labelGap: '--ds-divider-label-gap',
};

/** Divider bindings forwarded to the composed label Text's `overrides`. */
const LABEL_FORWARDS: ReadonlyArray<[DividerOverridableBinding, TextOverridableBinding]> = [
  ['labelSize', 'fontSize'],
  ['fontFamily', 'fontFamily'],
];

/**
 * `<ds-divider>` — Divider (category: layout, role: separator).
 *
 * The host is the line: it carries the thickness on the cross axis and the
 * shadow root paints it as the `line` part. `<ds-divider>` is decorative and
 * hidden from assistive technology (`aria-hidden="true"`); `<ds-divider
 * semantic>` or `<ds-divider label="or">` is exposed as `role="separator"`
 * with `aria-orientation`. A label renders in the shadow root as a
 * `<ds-text size="sm" tone="muted">` between two aria-hidden line segments and
 * names the separator through `aria-label` on the host — ids do not cross the
 * shadow root, and a separator's children are presentational.
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
      --ds-divider-label-gap: var(--layout-gap-normal);
      /* locked labelColor: declared for the CSS escape hatch and the naming codemod; the label's colour
         comes from the composed Text's tone="muted" (same token), so no rule restyles the child */
      --ds-divider-label-color: var(--color-foreground-muted);
      display: flex;
      box-sizing: border-box;
      block-size: var(--ds-divider-thickness);
      /* a one-token line is the smallest a divider may be: never let a flex parent shrink it away */
      flex-shrink: 0;
    }

    :host([hidden]) {
      display: none;
    }

    /* The host sizes the line on the cross axis; the line part paints it along the other. */
    [data-part='line'] {
      flex: 1 1 auto;
      background-color: var(--ds-divider-color);
    }

    /* stretches in a flex/grid row (block-size stays auto so align-self: stretch applies) and fills a parent with a definite height */
    :host([orientation='vertical']) {
      display: inline-flex;
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

    /* labelled (horizontal only): the host is a row of line, label, line, and the lines paint */
    :host([data-labelled]) {
      align-items: center;
      block-size: auto;
      gap: var(--ds-divider-label-gap);
    }

    :host([data-labelled]) [data-part='line'] {
      flex: 1 1 0;
      block-size: var(--ds-divider-thickness);
    }
  `;

  /**
   * Vertical dividers sit between inline siblings (toolbar groups) and stretch to the row height:
   * `inline-block` with `block-size: auto; align-self: stretch; min-block-size: 100%`. They need a
   * flex or grid row (a horizontal Stack with align stretch) or a parent with a definite height; in
   * plain block flow a vertical divider has no height and draws nothing.
   */
  @property({ type: String, reflect: true }) accessor orientation: DividerOrientation = 'horizontal';

  /**
   * Optional text in the middle of a horizontal divider ("or", "Earlier
   * today"). Turns the divider from decorative into a labelled separator
   * (`semantic` is implied). Ignored on a vertical divider, with a development
   * warning: a vertical line has no room for centered text. An ignored label
   * implies nothing either — a vertical divider is semantic only when
   * `semantic` says so. An empty string is no label. When in effect, the label
   * is the separator's accessible name (`aria-label` on the host, since ids do
   * not cross the shadow root) and the two line pieces on either side are
   * hidden from assistive technology.
   */
  @property({ type: String }) accessor label: string | undefined;

  /**
   * Expose as a separator to assistive technology. Leave false for purely visual lines between list
   * rows; set true (or provide a label) when the divider marks a real boundary between sections
   * that a screen-reader user should hear.
   */
  @property({ type: Boolean, reflect: true }) accessor semantic = false;

  /** Space on both sides along the cross axis, from the layout rhythm, for dividers used outside a Stack. */
  @property({ type: String, reflect: true }) accessor spacing: DividerSpacing = 'none';

  /** Per-instance style overrides: `{ color: 'color.border.strong' }`. `labelColor` is locked and ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DividerOverridableBinding, TokenRef | undefined>> | undefined;

  /** The ignored label last warned about, so the warning fires once per appearance or change. */
  private warnedLabel: string | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Divider');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('semantic') || changed.has('label') || changed.has('orientation')) {
      this.syncSemantics();
    }
    // Which bindings are in effect depends on `spacing` and on whether a label renders, so the
    // hooks are rewritten when those change too, not only when `overrides` does.
    if (
      changed.has('overrides') ||
      changed.has('spacing') ||
      changed.has('label') ||
      changed.has('orientation')
    ) {
      this.applyOverrides();
    }
    if (changed.has('label') || changed.has('orientation')) this.warnIgnoredLabel();
  }

  /** The label in effect: none on a vertical divider, and an empty string is no label. */
  private get effectiveLabel(): string | undefined {
    return this.orientation === 'vertical' ? undefined : this.label || undefined;
  }

  protected override render(): TemplateResult {
    const label = this.effectiveLabel;
    if (label === undefined) {
      return html`<span part="line" data-part="line" aria-hidden="true"></span>`;
    }
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
   * is presentational). Plain host attributes, not ElementInternals, so that
   * accessible-name readers observe them.
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
      // No copy.* string covers this warning; the wording matches React's so the two platforms warn alike.
      console.warn('<ds-divider>: `label` is ignored on a vertical divider — a vertical line has no room for centered text.', this);
    }
    this.warnedLabel = ignored;
  }

  /**
   * Overrides change values, never presence: `spacing: none` renders no space and takes no hook,
   * and the label bindings apply only while a label is in effect.
   */
  private applyOverrides(): void {
    const labelled = this.effectiveLabel !== undefined;
    for (const binding of Object.keys(HOOKS) as DividerOverridableBinding[]) {
      const hook = HOOKS[binding];
      if (hook === undefined) continue;
      const inEffect = binding === 'spacing' ? this.spacing !== 'none' : binding === 'labelGap' ? labelled : true;
      const ref = inEffect ? this.overrides?.[binding] : undefined;
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
