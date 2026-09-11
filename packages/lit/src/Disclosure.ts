import { LitElement, css, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';

export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6';

/** Detail carried by the `toggle` CustomEvent. */
export interface DisclosureToggleDetail {
  open: boolean;
}

/** Overridable style hooks; see the `overrides` property. `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type DisclosureOverridableBinding =
  | 'triggerPaddingBlock'
  | 'triggerPaddingInline'
  | 'triggerGap'
  | 'triggerFontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight'
  | 'triggerRadius'
  | 'panelPaddingBlock'
  | 'panelPaddingInline'
  | 'disabledOpacity'
  | 'transition';

const HOOKS: Record<DisclosureOverridableBinding, string> = {
  triggerPaddingBlock: '--ds-disclosure-trigger-padding-block',
  triggerPaddingInline: '--ds-disclosure-trigger-padding-inline',
  triggerGap: '--ds-disclosure-trigger-gap',
  triggerFontFamily: '--ds-disclosure-trigger-font-family',
  triggerFontSize: '--ds-disclosure-trigger-font-size',
  triggerFontWeight: '--ds-disclosure-trigger-font-weight',
  triggerRadius: '--ds-disclosure-trigger-radius',
  panelPaddingBlock: '--ds-disclosure-panel-padding-block',
  panelPaddingInline: '--ds-disclosure-panel-padding-inline',
  disabledOpacity: '--ds-disclosure-disabled-opacity',
  transition: '--ds-disclosure-transition',
};

const HEADINGS: Record<DisclosureHeadingLevel, StaticValue> = {
  '2': literal`h2`,
  '3': literal`h3`,
  '4': literal`h4`,
  '5': literal`h5`,
  '6': literal`h6`,
};

function isHeadingLevel(value: unknown): value is DisclosureHeadingLevel {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(HEADINGS, value);
}

/**
 * `<ds-disclosure>` — Disclosure (category: container, APG pattern: disclosure).
 *
 * `<ds-disclosure summary="Advanced options">…</ds-disclosure>` renders a
 * native `<button aria-expanded aria-controls>` trigger in its shadow root and
 * the panel as the default `<slot>`, which exists only while open. Light-DOM
 * children that are not assigned to a slot are neither rendered nor in the
 * accessibility tree, so a closed panel is genuinely gone — the consumer's
 * nodes are never given `hidden`. With `keepMounted` the slot is always
 * rendered and its wrapper gets `hidden` while closed, which is required when
 * the panel holds form fields (a `<ds-form>` skips fields inside a closed
 * disclosure without it). Toggling dispatches a composed `toggle` CustomEvent
 * with `{ open }`. The chevron is composed from `<ds-icon name="chevron-right">`
 * and rotated in CSS rather than swapping glyphs, so the rotation animates.
 *
 * ## When to use
 *
 * Use a Disclosure to hide secondary content that some users need and most do
 * not: optional settings, long explanations, a list of details behind a
 * summary count. Stack several to make an accordion — each is independent.
 * Set `headingLevel` when the summaries are section titles so they appear in
 * the outline.
 *
 * @fires toggle - Fired after the state changes with `{ open }` in `detail`.
 * @slot - The panel content. Rendered only while open (always, but hidden while closed, with `keep-mounted`).
 * @csspart trigger - The native `<button>` (anatomy: trigger).
 * @csspart trigger-icon - The chevron (anatomy: triggerIcon).
 * @csspart panel - The panel wrapper (anatomy: panel).
 */
@customElement('ds-disclosure')
export class DsDisclosure extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-disclosure-trigger-padding-block: var(--space-sm);
      --ds-disclosure-trigger-padding-inline: var(--space-sm);
      --ds-disclosure-trigger-gap: var(--space-2);
      --ds-disclosure-trigger-font-family: var(--font-family-body);
      --ds-disclosure-trigger-font-size: var(--font-size-md);
      --ds-disclosure-trigger-font-weight: var(--font-weight-medium);
      --ds-disclosure-trigger-radius: var(--radius-md);
      --ds-disclosure-panel-padding-block: var(--space-sm);
      --ds-disclosure-panel-padding-inline: var(--space-sm);
      --ds-disclosure-disabled-opacity: var(--opacity-disabled);
      --ds-disclosure-transition: var(--motion-duration-base);
      font-family: var(--ds-disclosure-trigger-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* The heading has no styling of its own — the button carries it. */
    .heading {
      margin: 0;
      padding: 0;
      font: inherit;
    }

    .trigger {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--ds-disclosure-trigger-gap);
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--ds-disclosure-trigger-padding-block);
      padding-inline: var(--ds-disclosure-trigger-padding-inline);
      border: 0;
      border-radius: var(--ds-disclosure-trigger-radius);
      font-family: var(--ds-disclosure-trigger-font-family);
      font-size: var(--ds-disclosure-trigger-font-size);
      font-weight: var(--ds-disclosure-trigger-font-weight);
      line-height: var(--font-line-height-normal);
      text-align: start;
      color: var(--color-foreground);
      background: transparent;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* triggerBackgroundHover: pointer hover and pressed state */
    :host(:not([disabled])) .trigger:is(:hover, :active) {
      background: var(--color-background-subtle);
    }

    .trigger:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    :host([disabled]) .trigger {
      opacity: var(--ds-disclosure-disabled-opacity);
      cursor: not-allowed;
    }

    /* icon: a chevron, 1em, pointing right when closed and down when open */
    .icon {
      flex: none;
      color: var(--color-foreground-muted);
      transition: transform var(--ds-disclosure-transition) var(--motion-easing-standard);
    }
    :host([open]) .icon {
      transform: rotate(90deg);
    }
    :host(:dir(rtl)) .icon {
      transform: rotate(180deg);
    }
    :host(:dir(rtl)[open]) .icon {
      transform: rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger,
      .icon {
        transition: none;
      }
    }

    .panel {
      padding-block: var(--ds-disclosure-panel-padding-block);
      padding-inline: var(--ds-disclosure-panel-padding-inline);
      color: var(--color-foreground);
    }
    .panel[hidden] {
      display: none;
    }
  `;

  /** The trigger's label. Also its accessible name. Says what will be revealed. */
  @property() accessor summary = '';

  /** Controlled open state. Omit for an uncontrolled disclosure. */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Initial state for an uncontrolled disclosure. */
  @property({ type: Boolean, attribute: 'default-open' }) accessor defaultOpen = false;

  /** The trigger cannot be activated. Stays focusable and is announced as disabled. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) accessor keepMounted = false;

  /** When set, the trigger is wrapped in a heading of this level so it appears in the outline. */
  @property({ attribute: 'heading-level' }) accessor headingLevel: DisclosureHeadingLevel | undefined;

  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state (seeded from `defaultOpen`). */
  @state() private accessor internalOpen = false;

  @query('#trigger') private accessor triggerEl!: HTMLButtonElement;

  /** Whether the panel is currently open. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Disclosure');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalOpen = this.defaultOpen;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    // A controlled close (or an uncontrolled one) removes/hides the panel: move focus first.
    if (this.hasUpdated && (changed.has('open') || changed.has('internalOpen')) && !this.currentOpen) {
      this.moveFocusOutOfPanel();
    }
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const panelExists = isOpen || this.keepMounted;
    const trigger = html`
      <button
        id="trigger"
        class="trigger"
        part="trigger"
        type="button"
        aria-expanded=${isOpen ? 'true' : 'false'}
        aria-controls=${ifDefined(panelExists ? 'panel' : undefined)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        @click=${this.handleClick}
      >
        <ds-icon class="icon" part="trigger-icon" name="chevron-right" inline></ds-icon>
        <span class="summary">${this.summary}</span>
      </button>
    `;
    const level = this.headingLevel;
    const heading = isHeadingLevel(level)
      ? html`<${HEADINGS[level]} class="heading">${trigger}</${HEADINGS[level]}>`
      : trigger;

    return html`
      ${heading}
      ${panelExists
        ? html`<div id="panel" class="panel" part="panel" ?hidden=${!isOpen}><slot></slot></div>`
        : nothing}
    `;
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const next = !this.currentOpen;
    if (this.open !== undefined) {
      this.open = next;
    } else {
      this.internalOpen = next;
    }
    this.dispatchEvent(
      new CustomEvent<DisclosureToggleDetail>('toggle', {
        detail: { open: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Closing removes the panel from the tree, so focus inside it goes to the trigger first. */
  private moveFocusOutOfPanel(): void {
    const active = document.activeElement;
    if (active !== null && active !== this && this.contains(active)) {
      this.triggerEl.focus();
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DisclosureOverridableBinding[]) {
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
    'ds-disclosure': DsDisclosure;
  }
}
