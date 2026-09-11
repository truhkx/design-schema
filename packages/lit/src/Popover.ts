import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './FocusScope.js';
import './Heading.js';
import './Box.js';
import './Button.js';
import './Icon.js';

export type PopoverHeadingLevel = '2' | '3' | '4';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start'
  | 'end';

export type PopoverCloseReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** Detail carried by the `open-change` CustomEvent. */
export interface PopoverOpenChangeDetail {
  open: boolean;
  reason: PopoverCloseReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type PopoverOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'offset'
  | 'arrowSize'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<PopoverOverridableBinding, string> = {
  border: '--ds-popover-border',
  borderWidth: '--ds-popover-border-width',
  shadow: '--ds-popover-shadow',
  radius: '--ds-popover-radius',
  inset: '--ds-popover-inset',
  partGap: '--ds-popover-part-gap',
  offset: '--ds-popover-offset',
  arrowSize: '--ds-popover-arrow-size',
  maxWidth: '--ds-popover-max-width',
  layer: '--ds-popover-layer',
  enter: '--ds-popover-enter',
  exit: '--ds-popover-exit',
};

/** copy.closeLabel */
const COPY_CLOSE_LABEL = 'Close';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

/** Elements considered a focusable "control" inside the panel body. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'ds-button',
  'ds-link',
  'ds-input',
  'ds-checkbox',
  'ds-switch',
  'ds-radio-group',
  'ds-disclosure',
].join(',');

function findAllFocusable(root: HTMLElement): HTMLElement[] {
  const results: HTMLElement[] = [];
  if (root.matches(FOCUSABLE_SELECTOR)) {
    results.push(root);
  }
  results.push(...Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)));
  return results;
}

function findFirstFocusable(root: HTMLElement): HTMLElement | null {
  if (root.matches(FOCUSABLE_SELECTOR)) {
    return root;
  }
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

type Side = 'top' | 'bottom' | 'start' | 'end';
type Align = 'start' | 'center' | 'end';

function parsePlacement(placement: PopoverPlacement): { side: Side; align: Align } {
  switch (placement) {
    case 'bottom-start':
      return { side: 'bottom', align: 'start' };
    case 'bottom':
      return { side: 'bottom', align: 'center' };
    case 'bottom-end':
      return { side: 'bottom', align: 'end' };
    case 'top-start':
      return { side: 'top', align: 'start' };
    case 'top':
      return { side: 'top', align: 'center' };
    case 'top-end':
      return { side: 'top', align: 'end' };
    case 'start':
      return { side: 'start', align: 'center' };
    case 'end':
    default:
      return { side: 'end', align: 'center' };
  }
}

/** How many modal `<ds-popover>` instances currently hold the body-scroll lock. */
let openModalCount = 0;

function lockBodyScroll(): void {
  openModalCount += 1;
  if (openModalCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.documentElement.style.removeProperty('overflow');
  }
}

/** Negates a boolean attribute: `no-dismiss` present means `dismissible` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * `<ds-popover>` — Popover (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-popover placement="bottom-start"><ds-button slot="trigger"
 * label="Filters"></ds-button><div>…</div></ds-popover>`. The `trigger` slot
 * holds exactly one focusable element (usually a Button); clicking it toggles
 * the popover and sets `aria-expanded` directly on it. `aria-controls` cannot
 * cross the shadow boundary, so it is never set — the panel is named by
 * `aria-label`, computed from `heading` or copied from the trigger's own
 * accessible text. Non-modal (`modal` false, the default): the panel renders
 * with the Popover API (`popover="manual"`, top layer) when supported, and a
 * `position: fixed` fallback otherwise; a `<ds-focus-scope>` is mounted but
 * left untrapped, so Escape, the close button, an outside pointerdown, and
 * Tab past the last element all close it — returning focus to the trigger,
 * except for a plain Tab-out, which lets focus continue naturally past the
 * trigger. Modal (`modal` true): the panel is a native `<dialog>` opened with
 * `showModal()`, trapped by the same focus scope, with the page inert behind
 * it. Either way the panel is positioned from the trigger's
 * `getBoundingClientRect()` for `placement`, flipped and shifted to stay in
 * the viewport, and repositioned on scroll/resize while open.
 *
 * ## When to use
 *
 * Use a Popover for a compact interactive panel tied to a trigger: a date
 * picker under a date field, a color swatch, a filter panel behind a
 * "Filters" button, a share panel, contextual help with a link. Use `modal`
 * when the panel contains a required step (a short form that must be
 * submitted or cancelled). Use `heading` when the content is not obvious from
 * the trigger.
 *
 * ## When not to use
 *
 * Not for text-only hints (Tooltip), a list of actions (Menu), a list of
 * options (Select/Combobox), or anything that needs more than a small
 * panel's worth of content or must be completed before continuing (Dialog).
 * Never nest popovers, and never open one on hover.
 *
 * @fires open-change - Fired when the popover opens or closes, with `{ open,
 *   reason }` in `detail`; `reason` is `trigger`, `escape`, `outside`,
 *   `close-button` or `tab-out`.
 * @slot trigger - Exactly one focusable element that opens the popover (anatomy: trigger).
 * @slot - The panel content (anatomy: body). Keep it to what fits without scrolling.
 * @csspart panel - The positioned surface (anatomy: panel).
 * @csspart heading - The `<ds-heading>`, rendered when `heading` is set (anatomy: heading).
 * @csspart body - The `<ds-box>` wrapping the default slot (anatomy: body).
 * @csspart close-button - The close `<ds-button>` (anatomy: closeButton).
 * @csspart arrow - The pointer toward the trigger, rendered when `showArrow` is set (anatomy: arrow).
 */
@customElement('ds-popover')
export class DsPopover extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: inline-block;
      --ds-popover-border: var(--color-border);
      --ds-popover-border-width: var(--border-width-thin);
      --ds-popover-shadow: var(--shadow-overlay);
      --ds-popover-radius: var(--radius-md);
      --ds-popover-inset: var(--layout-inset-md);
      --ds-popover-part-gap: var(--layout-gap-normal);
      --ds-popover-offset: var(--space-2);
      --ds-popover-arrow-size: var(--space-2);
      --ds-popover-max-width: var(--layout-max-width-prose);
      --ds-popover-layer: var(--layer-dropdown);
      --ds-popover-enter: var(--motion-duration-fast);
      --ds-popover-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .panel {
      box-sizing: border-box;
      position: fixed;
      inset: auto;
      margin: 0;
      padding: var(--ds-popover-inset);
      border-style: solid;
      border-width: var(--ds-popover-border-width);
      border-color: var(--ds-popover-border);
      border-radius: var(--ds-popover-radius);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-popover-shadow);
      max-inline-size: min(var(--ds-popover-max-width), calc(100vw - 2 * var(--layout-gutter)));
      overflow: visible;
      color: var(--color-foreground);
      font-family: var(--font-family-body);
      z-index: var(--ds-popover-layer);
    }

    /* non-modal: Popover API top layer, or the position: fixed fallback above */
    div.panel {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition:
        opacity var(--ds-popover-exit) var(--motion-easing-standard),
        transform var(--ds-popover-exit) var(--motion-easing-standard),
        overlay var(--ds-popover-exit) allow-discrete,
        display var(--ds-popover-exit) allow-discrete;
    }

    div.panel:popover-open {
      opacity: 1;
      transform: translate(0, 0);
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    div.panel[hidden] {
      display: none;
    }

    @starting-style {
      div.panel:popover-open {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    /* modal: a native <dialog>, trapped and inert like a small Dialog */
    dialog.panel {
      border: 0;
      opacity: 1;
      transform: translate(0, 0);
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    dialog.panel::backdrop {
      background: transparent;
    }

    dialog.panel.closing {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition-duration: var(--ds-popover-exit);
    }

    @starting-style {
      dialog.panel[open] {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel {
        transition: none;
      }
    }

    .content {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-popover-part-gap);
      max-block-size: calc(100vh - 2 * var(--layout-gutter) - 2 * var(--ds-popover-inset));
      overflow-y: auto;
    }

    /* Reserves room so the heading never sits under the close button. */
    .content.has-close {
      padding-inline-end: calc(var(--size-target-min) + var(--ds-popover-part-gap));
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    .close {
      position: absolute;
      inset-block-start: var(--ds-popover-inset);
      inset-inline-end: var(--ds-popover-inset);
    }

    /* arrowSize: space.2. A rotated square pointer toward the trigger. */
    .arrow {
      position: absolute;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--color-overlay-surface);
      border-inline-start: var(--ds-popover-border-width) solid var(--ds-popover-border);
      border-block-start: var(--ds-popover-border-width) solid var(--ds-popover-border);
      transform: rotate(45deg);
    }
  `;

  /** Optional heading at the top of the panel; also the accessible name when set. */
  @property() accessor heading: string | undefined;

  /** Heading level of the panel heading, so it fits the page outline. */
  @property({ attribute: 'heading-level', reflect: true }) accessor headingLevel: PopoverHeadingLevel = '3';

  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Preferred side and alignment; flips and shifts to stay in the viewport. */
  @property({ reflect: true }) accessor placement: PopoverPlacement = 'bottom';

  /** `false` (default): the page stays interactive. `true`: a small trapped, inert Dialog anchored to the trigger. */
  @property({ type: Boolean, reflect: true }) accessor modal = false;

  /** A small pointer toward the trigger. Off by default. */
  @property({ type: Boolean, reflect: true, attribute: 'show-arrow' }) accessor showArrow = false;

  /**
   * Shows the close button. Escape and outside click (non-modal) always
   * close regardless. Attribute is the negation, `no-dismiss`, because a
   * boolean attribute cannot express `false` for a prop that defaults `true`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** Whether the modal exit transition is playing. */
  @state() private accessor closing = false;

  /** Whether the default slot currently has assigned content, for the dev warning. */
  @state() private accessor hasBodyContent = false;

  @query('.panel') private accessor panelEl!: HTMLElement;
  @query('#heading') private accessor headingEl!: HTMLElement | null;
  @query('.close') private accessor closeButtonEl!: HTMLElement | null;
  @query('.arrow') private accessor arrowEl!: HTMLElement | null;

  /** Copied from the trigger's own accessible text, for the panel's `aria-label` fallback when `heading` is unset. */
  @state() private accessor triggerAccessibleName = '';

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private triggerEl: HTMLElement | null = null;
  private wasOpen = false;
  private pendingReason: PopoverCloseReason = 'trigger';
  private focusTriggerOnClose = false;

  /** Whether the popover is currently open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Popover');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachTrigger();
    this.removeGlobalListeners();
    if (this.modal && this.currentOpen) {
      unlockBodyScroll();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    const isOpen = this.currentOpen;
    if (isOpen !== this.wasOpen) {
      this.wasOpen = isOpen;
      this.updateTriggerExpanded();
      if (isOpen) {
        this.handleOpened();
      } else {
        this.handleClosed();
      }
    } else if (isOpen && changed.has('placement')) {
      this.updatePosition();
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const ariaLabel = this.heading || this.triggerAccessibleName || undefined;
    const hasHeading = Boolean(this.heading);

    const panelContent = html`
      <ds-focus-scope
        ?trapped=${this.modal}
        ?active=${isOpen}
        auto-focus="none"
        ?restore-focus=${false}
      >
        <div class=${classMap({ content: true, 'has-close': this.dismissible })}>
          ${hasHeading
            ? html`<ds-heading id="heading" part="heading" level=${this.headingLevel} size="md" tabindex="-1">${this.heading}</ds-heading>`
            : nothing}
          <ds-box part="body"><slot @slotchange=${this.handleBodySlotChange}></slot></ds-box>
          ${this.dismissible
            ? html`
                <ds-button
                  class="close"
                  part="close-button"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${COPY_CLOSE_LABEL}
                  @press=${this.handleCloseButtonPress}
                >
                  <ds-icon slot="leading-icon" name="close"></ds-icon>
                </ds-button>
              `
            : nothing}
        </div>
      </ds-focus-scope>
      ${this.showArrow ? html`<span class="arrow" part="arrow" aria-hidden="true"></span>` : nothing}
    `;

    return html`
      <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal
        ? html`
            <dialog
              class="panel${this.closing ? ' closing' : ''}"
              part="panel"
              aria-label=${ifDefined(ariaLabel)}
              aria-modal="true"
              @cancel=${this.handleDialogCancel}
              @keydown=${this.handlePanelKeydown}
            >
              ${panelContent}
            </dialog>
          `
        : html`
            <div
              class="panel"
              part="panel"
              role="dialog"
              aria-label=${ifDefined(ariaLabel)}
              popover=${this.popoverSupported ? 'manual' : nothing}
              ?hidden=${this.popoverSupported ? false : !isOpen}
              @keydown=${this.handlePanelKeydown}
            >
              ${panelContent}
            </div>
          `}
    `;
  }

  private readonly handleTriggerSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const next = (slot.assignedElements({ flatten: true })[0] as HTMLElement | undefined) ?? null;
    if (next === this.triggerEl) {
      this.updateTriggerAccessibleName();
      this.updateTriggerExpanded();
      return;
    }
    this.detachTrigger();
    this.triggerEl = next;
    this.attachTrigger();
  };

  private attachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.addEventListener('click', this.handleTriggerClick);
    this.updateTriggerAccessibleName();
    this.updateTriggerExpanded();
    this.warnInDev();
  }

  private detachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.removeEventListener('click', this.handleTriggerClick);
    trigger.removeAttribute('aria-expanded');
  }

  private updateTriggerAccessibleName(): void {
    const trigger = this.triggerEl;
    this.triggerAccessibleName = trigger
      ? (trigger.getAttribute('aria-label') ?? trigger.getAttribute('label') ?? trigger.textContent?.trim() ?? '')
      : '';
  }

  private updateTriggerExpanded(): void {
    this.triggerEl?.setAttribute('aria-expanded', this.currentOpen ? 'true' : 'false');
  }

  private readonly handleTriggerClick = (): void => {
    this.requestOpenChange(!this.currentOpen, 'trigger', false);
  };

  private readonly handleBodySlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    this.hasBodyContent = slot.assignedNodes({ flatten: true }).length > 0;
    this.warnInDev();
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // Keep the button's `press` inside the popover; consumers listen for `open-change`.
    event.stopPropagation();
    this.requestOpenChange(false, 'close-button', true);
  };

  private readonly handleDialogCancel = (event: Event): void => {
    // The native default would close the <dialog> itself; the consumer owns `open` instead.
    event.preventDefault();
    this.requestOpenChange(false, 'escape', true);
  };

  private readonly handlePanelKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      // A modal <dialog> already emits `cancel` for Escape; avoid closing twice.
      if (!this.modal) {
        event.preventDefault();
        this.requestOpenChange(false, 'escape', true);
      }
      return;
    }
    if (this.modal || event.key !== 'Tab') {
      return;
    }
    const focusables = this.getPanelFocusables();
    if (focusables.length === 0) {
      return;
    }
    const active = getDeepActiveElement();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && active === first) {
      event.preventDefault();
      this.requestOpenChange(false, 'tab-out', true);
    } else if (!event.shiftKey && active === last) {
      // Hide synchronously so the slotted content leaves the tab order before
      // the browser's own Tab traversal (computed right after this handler
      // returns) tries to land on it.
      this.hidePanelImmediately();
      this.requestOpenChange(false, 'tab-out', false);
    }
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) {
      return;
    }
    this.requestOpenChange(false, 'outside', false);
  };

  private readonly handleReposition = (): void => {
    if (this.currentOpen) {
      this.updatePosition();
    }
  };

  private requestOpenChange(next: boolean, reason: PopoverCloseReason, focusTriggerOnClose: boolean): void {
    this.pendingReason = reason;
    this.focusTriggerOnClose = focusTriggerOnClose;
    if (this.open !== undefined) {
      this.open = next;
    } else {
      this.internalOpen = next;
    }
  }

  private handleOpened(): void {
    if (this.modal) {
      this.closing = false;
      lockBodyScroll();
      (this.panelEl as HTMLDialogElement).showModal();
    } else {
      this.addGlobalListeners();
      if (this.popoverSupported) {
        this.panelEl.showPopover();
      }
    }
    this.updatePosition();
    this.applyInitialFocus();
    this.dispatchOpenChange(true);
  }

  private handleClosed(): void {
    const shouldFocusTrigger = this.focusTriggerOnClose;
    this.focusTriggerOnClose = false;
    if (this.modal) {
      this.playModalExit(shouldFocusTrigger);
    } else {
      this.removeGlobalListeners();
      this.hidePanelImmediately();
      if (shouldFocusTrigger) {
        this.triggerEl?.focus();
      }
    }
    this.dispatchOpenChange(false);
  }

  private playModalExit(shouldFocusTrigger: boolean): void {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = (): void => {
      (this.panelEl as HTMLDialogElement).close();
      unlockBodyScroll();
      this.closing = false;
      if (shouldFocusTrigger) {
        this.triggerEl?.focus();
      }
    };
    if (reduced) {
      finish();
      return;
    }
    this.closing = true;
    const panel = this.panelEl;
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== panel || event.propertyName !== 'opacity') {
        return;
      }
      panel.removeEventListener('transitionend', handleTransitionEnd);
      finish();
    };
    panel.addEventListener('transitionend', handleTransitionEnd);
  }

  private hidePanelImmediately(): void {
    if (this.modal || !this.panelEl) {
      return;
    }
    if (this.popoverSupported) {
      if (this.panelEl.matches(':popover-open')) {
        this.panelEl.hidePopover();
      }
    } else {
      this.panelEl.hidden = true;
    }
  }

  private applyInitialFocus(): void {
    const target = this.findFirstBodyFocusable() ?? this.headingEl ?? null;
    target?.focus();
  }

  private findFirstBodyFocusable(): HTMLElement | null {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) {
      return null;
    }
    for (const element of slot.assignedElements({ flatten: true })) {
      if (element instanceof HTMLElement) {
        const found = findFirstFocusable(element);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private getPanelFocusables(): HTMLElement[] {
    const results: HTMLElement[] = [];
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    if (slot) {
      for (const element of slot.assignedElements({ flatten: true })) {
        if (element instanceof HTMLElement) {
          results.push(...findAllFocusable(element));
        }
      }
    }
    if (this.dismissible && this.closeButtonEl) {
      results.push(this.closeButtonEl);
    }
    return results;
  }

  private addGlobalListeners(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
  }

  private removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  private updatePosition(): void {
    const trigger = this.triggerEl;
    const panel = this.panelEl;
    if (!trigger || !panel) {
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const gap = parseFloat(getComputedStyle(this).getPropertyValue('--ds-popover-offset')) || 0;
    const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-gutter')) || 0;

    const { side: initialSide, align } = parsePlacement(this.placement);
    let side = initialSide;

    if (
      side === 'bottom' &&
      triggerRect.bottom + gap + panelRect.height > viewportHeight &&
      triggerRect.top - gap - panelRect.height >= 0
    ) {
      side = 'top';
    } else if (
      side === 'top' &&
      triggerRect.top - gap - panelRect.height < 0 &&
      triggerRect.bottom + gap + panelRect.height <= viewportHeight
    ) {
      side = 'bottom';
    } else if (
      side === 'start' &&
      triggerRect.left - gap - panelRect.width < 0 &&
      triggerRect.right + gap + panelRect.width <= viewportWidth
    ) {
      side = 'end';
    } else if (
      side === 'end' &&
      triggerRect.right + gap + panelRect.width > viewportWidth &&
      triggerRect.left - gap - panelRect.width >= 0
    ) {
      side = 'start';
    }

    let top: number;
    let left: number;
    if (side === 'bottom' || side === 'top') {
      top = side === 'bottom' ? triggerRect.bottom + gap : triggerRect.top - gap - panelRect.height;
      left =
        align === 'start'
          ? triggerRect.left
          : align === 'end'
            ? triggerRect.right - panelRect.width
            : triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
    } else {
      left = side === 'end' ? triggerRect.right + gap : triggerRect.left - gap - panelRect.width;
      top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
    }

    left = Math.min(Math.max(left, gutter), Math.max(gutter, viewportWidth - panelRect.width - gutter));
    top = Math.min(Math.max(top, gutter), Math.max(gutter, viewportHeight - panelRect.height - gutter));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;

    const slideDistance = 'var(--space-1)';
    let slideX = '0px';
    let slideY = '0px';
    if (side === 'bottom') {
      slideY = `calc(-1 * ${slideDistance})`;
    } else if (side === 'top') {
      slideY = slideDistance;
    } else if (side === 'end') {
      slideX = `calc(-1 * ${slideDistance})`;
    } else if (side === 'start') {
      slideX = slideDistance;
    }
    panel.style.setProperty('--ds-popover-slide-x', slideX);
    panel.style.setProperty('--ds-popover-slide-y', slideY);

    this.updateArrowPosition(side, triggerRect, top, left, panelRect);
  }

  private updateArrowPosition(side: Side, triggerRect: DOMRect, panelTop: number, panelLeft: number, panelRect: DOMRect): void {
    const arrow = this.arrowEl;
    if (!arrow) {
      return;
    }
    const arrowSize = parseFloat(getComputedStyle(this).getPropertyValue('--ds-popover-arrow-size')) || 0;
    const half = arrowSize / 2;
    arrow.style.top = '';
    arrow.style.bottom = '';
    arrow.style.left = '';
    arrow.style.right = '';
    if (side === 'bottom' || side === 'top') {
      const triggerCenterX = triggerRect.left + triggerRect.width / 2;
      const clamped = Math.min(Math.max(triggerCenterX - panelLeft, half), panelRect.width - half);
      arrow.style.left = `${clamped - half}px`;
      if (side === 'bottom') {
        arrow.style.top = `${-half}px`;
      } else {
        arrow.style.bottom = `${-half}px`;
      }
    } else {
      const triggerCenterY = triggerRect.top + triggerRect.height / 2;
      const clamped = Math.min(Math.max(triggerCenterY - panelTop, half), panelRect.height - half);
      arrow.style.top = `${clamped - half}px`;
      if (side === 'end') {
        arrow.style.left = `${-half}px`;
      } else {
        arrow.style.right = `${-half}px`;
      }
    }
  }

  private dispatchOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent<PopoverOpenChangeDetail>('open-change', {
        detail: { open, reason: this.pendingReason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as PopoverOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.triggerEl) {
      console.warn(
        '<ds-popover> requires a `trigger` slot: exactly one focusable element that opens the popover.',
        this,
      );
    }
    if (!this.hasBodyContent) {
      console.warn('<ds-popover> requires content in its default slot.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-popover': DsPopover;
  }
}
