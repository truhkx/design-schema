import { LitElement, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html, literal, type StaticValue } from 'lit/static-html.js';

export type DisclosureHeadingLevel = '2' | '3' | '4' | '5' | '6';

/** Detail carried by the `toggle` CustomEvent. */
export interface DisclosureToggleDetail {
  open: boolean;
}

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
 * with `{ open }`.
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

  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
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
      gap: var(--space-2);
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--space-sm);
      padding-inline: var(--space-sm);
      border: 0;
      border-radius: var(--radius-md);
      font-family: var(--font-family-body);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
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
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    /* icon: a chevron, 1em, pointing right when closed and down when open */
    .icon {
      flex: none;
      inline-size: 1em;
      block-size: 1em;
      color: var(--color-foreground-muted);
      fill: currentColor;
      transition: transform var(--motion-duration-base) var(--motion-easing-standard);
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
      padding-block: var(--space-sm);
      padding-inline: var(--space-sm);
      color: var(--color-foreground);
    }
    .panel[hidden] {
      display: none;
    }
  `;

  /** The trigger's label. Also its accessible name. Says what will be revealed. */
  @property() summary = '';

  /** Controlled open state. Omit for an uncontrolled disclosure. */
  @property({ type: Boolean, reflect: true }) open?: boolean;

  /** Initial state for an uncontrolled disclosure. */
  @property({ type: Boolean, attribute: 'default-open' }) defaultOpen = false;

  /** The trigger cannot be activated. Stays focusable and is announced as disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Keep the panel in the tree while closed (hidden, not unmounted). Required when the panel contains form fields. */
  @property({ type: Boolean, reflect: true, attribute: 'keep-mounted' }) keepMounted = false;

  /** When set, the trigger is wrapped in a heading of this level so it appears in the outline. */
  @property({ attribute: 'heading-level' }) headingLevel?: DisclosureHeadingLevel;

  /** Uncontrolled open state (seeded from `defaultOpen`). */
  @state() private internalOpen = false;

  @query('#trigger') private readonly triggerEl!: HTMLButtonElement;

  /** Whether the panel is currently open. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalOpen = this.defaultOpen;
      return;
    }
    // A controlled close (or an uncontrolled one) removes/hides the panel: move focus first.
    if ((changed.has('open') || changed.has('internalOpen')) && !this.currentOpen) {
      this.moveFocusOutOfPanel();
    }
  }

  protected override render() {
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
        <svg class="icon" part="trigger-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16">
          <path d="M5.5 2.5 11 8l-5.5 5.5-1.06-1.06L8.88 8 4.44 3.56 5.5 2.5Z" />
        </svg>
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
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-disclosure': DsDisclosure;
  }
}
