import { LitElement, css, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Icon.js';

export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6';

/** Why the disclosure changed state. */
export type DisclosureToggleReason = 'pointer' | 'keyboard' | 'controlled';

/** Detail carried by the `toggle` CustomEvent. */
export interface DisclosureToggleDetail {
  /** The new state. */
  open: boolean;
  /** `pointer` (clicked or tapped), `keyboard` (Enter or Space), `controlled` (the consumer changed `open`). */
  reason: DisclosureToggleReason;
}

/** Overridable style hooks; see the `overrides` property. `triggerColor`, `triggerBackgroundHover`, `icon`, `panelColor`, `focusRing`, `focusRingWidth` and `minTarget` are locked and excluded. */
export type DisclosureOverridableBinding =
  | 'triggerPaddingBlock'
  | 'triggerPaddingInline'
  | 'triggerGap'
  | 'triggerFontFamily'
  | 'triggerFontSize'
  | 'triggerFontWeight'
  | 'triggerLineHeight'
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
  triggerLineHeight: '--ds-disclosure-trigger-line-height',
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
 * the panel holds form fields (a `<ds-form>` reads `currentOpen` and
 * `keepMounted` and skips fields inside a closed disclosure without it).
 *
 * Uncontrolled from `defaultOpen` unless `open` is set; a controlled element
 * shows the new state only once `open` changes. Every change dispatches a
 * composed `toggle` CustomEvent with `{ open, reason }` after the state changes.
 *
 * ## When to use
 *
 * Use a Disclosure to hide secondary content that some users need and most do
 * not: optional settings, long explanations, a list of details behind a
 * summary count. Stack several to make an accordion — each is independent.
 * Set `headingLevel` when the summaries are section titles so they appear in
 * the outline.
 *
 * @fires toggle - Fired after the state changes with `{ open, reason }` in `detail`.
 * @slot - The panel content. Rendered only while open (always, but hidden while closed, with `keep-mounted`).
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
      --ds-disclosure-trigger-line-height: var(--font-line-height-normal);
      --ds-disclosure-trigger-radius: var(--radius-md);
      --ds-disclosure-panel-padding-block: var(--space-sm);
      --ds-disclosure-panel-padding-inline: var(--space-sm);
      --ds-disclosure-disabled-opacity: var(--opacity-disabled);
      --ds-disclosure-transition: var(--motion-duration-base);
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

    [data-part='trigger'] {
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
      line-height: var(--ds-disclosure-trigger-line-height);
      text-align: start;
      color: var(--color-foreground);
      background: transparent;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    /* triggerBackgroundHover: pointer hover and pressed state */
    :host(:not([disabled])) [data-part='trigger']:is(:hover, :active) {
      background: var(--color-background-subtle);
    }

    [data-part='trigger']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    :host([disabled]) [data-part='trigger'] {
      opacity: var(--ds-disclosure-disabled-opacity);
      cursor: not-allowed;
    }

    /* icon: the wrapper the Disclosure owns carries the colour and the rotation; the composed
       <ds-icon inline> is never restyled and tracks the trigger's font size through 1em. */
    [data-part='triggerIcon'] {
      display: inline-flex;
      flex: none;
      color: var(--color-foreground-muted);
      transition: transform var(--ds-disclosure-transition) var(--motion-easing-standard);
    }
    [aria-expanded='true'] [data-part='triggerIcon'] {
      transform: rotate(90deg);
    }
    :host(:dir(rtl)) [data-part='triggerIcon'] {
      transform: scaleX(-1);
    }
    :host(:dir(rtl)) [aria-expanded='true'] [data-part='triggerIcon'] {
      transform: scaleX(-1) rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='triggerIcon'] {
        transition: none;
      }
    }

    [data-part='panel'] {
      padding-block: var(--ds-disclosure-panel-padding-block);
      padding-inline: var(--ds-disclosure-panel-padding-inline);
      color: var(--color-foreground);
    }
    [data-part='panel'][hidden] {
      display: none;
    }
  `;

  /** The trigger's label. Also its accessible name. Says what will be revealed. */
  @property() accessor summary = '';

  /** Controlled open state. Omit for an uncontrolled disclosure. */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Initial state for an uncontrolled disclosure. */
  @property({ type: Boolean, attribute: 'default-open' }) accessor defaultOpen = false;

  /** The trigger cannot be activated. Stays focusable and is announced as disabled; the panel keeps its current state. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) accessor keepMounted = false;

  /** When set, the trigger is wrapped in a heading of this level so it appears in the outline. */
  @property({ attribute: 'heading-level' }) accessor headingLevel: DisclosureHeadingLevel | undefined;

  /** Per-instance style overrides: `{ triggerRadius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DisclosureOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state (seeded from `defaultOpen`). */
  @state() private accessor internalOpen = false;

  @query('[data-part=trigger]') private accessor triggerEl!: HTMLButtonElement | null;

  /** The resolved state rendered at the last update; `undefined` before the first. */
  private renderedOpen: boolean | undefined;

  /** The state the last user activation asked for, so the resulting prop change is not re-reported as `controlled`. */
  private requestedOpen: boolean | undefined;

  /**
   * Focus entered the panel and has not demonstrably moved elsewhere. Unassigning a focused node from the slot can
   * drop focus to the body without a focusout, so the flag is cleared only when focus lands somewhere known.
   */
  private focusWithinPanel = false;

  /** Set when a close happens while focus is within the panel; resolved after the render that removes it. */
  private restoreFocusPending = false;

  /** Whether the panel is currently open (controlled `open`, else the uncontrolled state). */
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
    // Closing removes (or hides) the panel: focus within it is handed to the trigger once the render lands,
    // whether the close came from the trigger or from a controlled `open` change.
    if (this.hasUpdated && this.renderedOpen === true && !this.currentOpen && this.focusWithinPanel) {
      this.focusWithinPanel = false;
      this.restoreFocusPending = true;
    }
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const panelExists = isOpen || this.keepMounted;
    const trigger = html`
      <button
        data-part="trigger"
        part="trigger"
        type="button"
        aria-expanded=${isOpen ? 'true' : 'false'}
        aria-controls=${ifDefined(panelExists ? 'panel' : undefined)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        @click=${this.handleClick}
      >
        <span data-part="triggerIcon" part="triggerIcon"
          ><ds-icon name="chevron-right" inline></ds-icon
        ></span>
        <span>${this.summary}</span>
      </button>
    `;
    const level = this.headingLevel;
    const heading = isHeadingLevel(level)
      ? html`<${HEADINGS[level]} class="heading">${trigger}</${HEADINGS[level]}>`
      : trigger;

    return html`
      ${heading}
      ${panelExists
        ? html`<div
            id="panel"
            data-part="panel"
            part="panel"
            ?hidden=${!isOpen}
            @focusin=${this.handlePanelFocusIn}
            @focusout=${this.handlePanelFocusOut}
          ><slot></slot></div>`
        : nothing}
    `;
  }

  protected override updated(changed: PropertyValues): void {
    const now = this.currentOpen;
    const previous = this.renderedOpen;
    this.renderedOpen = now;
    if (this.restoreFocusPending) {
      this.restoreFocusPending = false;
      this.restoreFocus();
    }
    if (!changed.has('open') && !changed.has('internalOpen')) return;
    const requested = this.requestedOpen;
    this.requestedOpen = undefined;
    // A consumer-driven change of `open` that no user activation asked for.
    if (previous !== undefined && previous !== now && changed.has('open') && requested !== now) {
      this.dispatchToggle(now, 'controlled');
    }
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    const next = !this.currentOpen;
    // A keyboard activation of a native button produces a click with detail 0.
    const reason: DisclosureToggleReason = event.detail === 0 ? 'keyboard' : 'pointer';
    if (this.open === undefined) {
      this.internalOpen = next;
    } else {
      // Controlled: the new state shows only once the consumer sets `open`.
      this.requestedOpen = next;
    }
    this.dispatchToggle(next, reason);
  }

  private dispatchToggle(open: boolean, reason: DisclosureToggleReason): void {
    this.dispatchEvent(
      new CustomEvent<DisclosureToggleDetail>('toggle', {
        detail: { open, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handlePanelFocusIn(): void {
    this.focusWithinPanel = true;
  }

  private handlePanelFocusOut(event: FocusEvent): void {
    const to = event.relatedTarget;
    // Slotted panel content is the host's light DOM; the trigger lives in the shadow root, so it is not contained.
    if (to instanceof Node && (to === this || !this.contains(to))) {
      this.focusWithinPanel = false;
    }
  }

  /** Focus still inside the closed panel, or dropped to the body when the panel went away, moves to the trigger. */
  private restoreFocus(): void {
    const active = document.activeElement;
    const lost = active === null || active === document.body || (active !== this && this.contains(active));
    if (lost) this.triggerEl?.focus();
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
