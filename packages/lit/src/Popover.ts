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

/** Elements considered a focusable control inside the panel body. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'ds-button:not([disabled])',
  'ds-link',
  'ds-input:not([disabled])',
  'ds-checkbox:not([disabled])',
  'ds-switch:not([disabled])',
  'ds-radio-group:not([disabled])',
  'ds-date-picker:not([disabled])',
  'ds-disclosure:not([disabled])',
].join(',');

function collectFocusable(root: HTMLElement, into: HTMLElement[]): void {
  if (root.matches(FOCUSABLE_SELECTOR)) {
    into.push(root);
    return;
  }
  into.push(...Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)));
}

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** Physical side of the trigger the panel sits on, after logical resolution and flipping. */
type Side = 'top' | 'bottom' | 'left' | 'right';
type Align = 'start' | 'center' | 'end';

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/** Resolves a logical placement against the trigger's writing direction. */
function resolvePlacement(placement: PopoverPlacement, rtl: boolean): { side: Side; align: Align } {
  const start: Side = rtl ? 'right' : 'left';
  const end: Side = rtl ? 'left' : 'right';
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
      return { side: start, align: 'center' };
    case 'end':
    default:
      return { side: end, align: 'center' };
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

/** A requested open change, remembered until the element applies it (or the next request replaces it). */
interface OpenRequest {
  open: boolean;
  focusTrigger: boolean;
}

/**
 * `<ds-popover>` — Popover (category: overlay, APG pattern: disclosure).
 *
 * `<ds-popover placement="bottom-start"><ds-button slot="trigger"
 * label="Filters"></ds-button><div>…</div></ds-popover>`. The `trigger` slot
 * holds exactly one focusable element (usually a Button); activating it toggles
 * the popover and marks it expanded (a `ds-button` through its `expanded`
 * property, any other element through `aria-expanded`). `aria-controls` cannot
 * cross the shadow boundary, so it is never set; the panel is named by
 * `aria-label`, from `heading` or copied from the trigger's own text.
 *
 * Non-modal (`modal` false, the default): the panel uses the Popover API
 * (`popover="manual"`, top layer) when supported and a `position: fixed`
 * fallback otherwise. Escape, the close button, a pointerdown outside and Tab
 * past the last element close it; Shift+Tab from the first element returns to
 * the trigger and closes. Modal (`modal` true): the panel is a native
 * `<dialog>` opened with `showModal()`, trapped by `<ds-focus-scope>`, with the
 * page inert and scroll locked; Escape and the close button are the only ways
 * out. Either way the panel is positioned from the trigger's rect for
 * `placement` (logical, mirrored in right-to-left), flipped and shifted to stay
 * in the viewport, and repositioned on scroll and resize while open.
 *
 * `open` is controlled when set: the element reports `open-change` and shows
 * the new state only once the property changes. Omit it for uncontrolled use.
 *
 * @fires open-change - `{ open, reason }`; `reason` is `trigger`, `escape`,
 *   `outside`, `close-button` or `tab-out`. User interaction only.
 * @slot trigger - Exactly one focusable element that opens the popover (anatomy: trigger).
 * @slot - The panel content (anatomy: body). Keep it to what fits without scrolling.
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

    [data-part='panel'] {
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

    /* enter: fade and a space.1 slide from the trigger side */
    div[data-part='panel'] {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition:
        opacity var(--ds-popover-exit) var(--motion-easing-standard),
        transform var(--ds-popover-exit) var(--motion-easing-standard),
        overlay var(--ds-popover-exit) allow-discrete,
        display var(--ds-popover-exit) allow-discrete;
    }

    div[data-part='panel']:popover-open,
    div[data-part='panel'].fallback-open {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    div[data-part='panel'][hidden] {
      display: none;
    }

    @starting-style {
      div[data-part='panel']:popover-open,
      div[data-part='panel'].fallback-open {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    dialog[data-part='panel'] {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    dialog[data-part='panel']::backdrop {
      background: transparent;
    }

    dialog[data-part='panel'].closing {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition-duration: var(--ds-popover-exit);
    }

    @starting-style {
      dialog[data-part='panel'][open] {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='panel'] {
        transition: none;
      }
    }

    .content {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-popover-part-gap);
    }

    /* Reserves room so the heading never runs under the close button. */
    .content.has-close {
      padding-inline-end: calc(var(--size-target-min) + var(--ds-popover-part-gap));
    }

    [data-part='heading']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    [data-part='closeButton'] {
      position: absolute;
      inset-block-start: var(--ds-popover-inset);
      inset-inline-end: var(--ds-popover-inset);
    }

    /* arrowSize: a rotated square centered on the panel edge that faces the trigger. */
    [data-part='arrow'] {
      position: absolute;
      box-sizing: border-box;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--color-overlay-surface);
      border: 0 solid var(--ds-popover-border);
      transform: rotate(45deg);
    }

    [data-side='bottom'] > [data-part='arrow'] {
      top: calc(var(--ds-popover-arrow-size) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='top'] > [data-part='arrow'] {
      bottom: calc(var(--ds-popover-arrow-size) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }

    [data-side='right'] > [data-part='arrow'] {
      left: calc(var(--ds-popover-arrow-size) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='left'] > [data-part='arrow'] {
      right: calc(var(--ds-popover-arrow-size) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }
  `;

  /** Optional heading at the top of the panel; also the accessible name. Without it, the panel is named by the trigger. */
  @property() accessor heading: string | undefined;

  /** Heading level of the panel heading, so it fits the page outline. */
  @property({ attribute: 'heading-level', reflect: true }) accessor headingLevel: PopoverHeadingLevel = '3';

  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Preferred side and alignment; flips and shifts to stay in the viewport. Logical: mirrors in right-to-left. */
  @property({ reflect: true }) accessor placement: PopoverPlacement = 'bottom';

  /** `false` (default): the page stays interactive. `true`: a small Dialog anchored to the trigger — focus trapped, background inert. */
  @property({ type: Boolean, reflect: true }) accessor modal = false;

  /** A small pointer toward the trigger. Off by default. */
  @property({ type: Boolean, reflect: true, attribute: 'show-arrow' }) accessor showArrow = false;

  /**
   * Show the close button. Escape and outside click work regardless (non-modal).
   * Attribute: the negated `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (surface, focusRing, focusRingWidth) are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** Whether the modal exit transition is playing. */
  @state() private accessor closing = false;

  /** The trigger's own accessible text, the panel's `aria-label` when `heading` is unset. */
  @state() private accessor triggerAccessibleName = '';

  /** Physical side the panel resolved to on the last positioning pass. */
  @state() private accessor side: Side = 'bottom';

  @query('[data-part="panel"]') private accessor panelEl!: HTMLElement | null;
  @query('[data-part="heading"]') private accessor headingEl!: HTMLElement | null;
  @query('[data-part="closeButton"]') private accessor closeButtonEl!: HTMLElement | null;
  @query('slot:not([name])') private accessor bodySlotEl!: HTMLSlotElement | null;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private triggerEl: HTMLElement | null = null;
  private wasOpen = false;
  private request: OpenRequest | null = null;
  private warned = false;

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
    this.removeOpenListeners();
    if (this.modal && this.wasOpen) {
      unlockBodyScroll();
    }
    this.wasOpen = false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override firstUpdated(): void {
    if (import.meta.env.DEV) {
      setTimeout(() => this.warnInDev(), 0);
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
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const ariaLabel = this.heading || this.triggerAccessibleName || undefined;

    const panelContent = html`
      <ds-focus-scope
        data-part="focusScope"
        part="focusScope"
        .trapped=${this.modal}
        .active=${isOpen}
        .autoFocus=${'none'}
        .restoreFocus=${false}
      >
        <div class=${classMap({ content: true, 'has-close': this.dismissible })}>
          ${this.heading
            ? html`<ds-heading data-part="heading" part="heading" level=${this.headingLevel} tabindex="-1"
                >${this.heading}</ds-heading
              >`
            : nothing}
          <ds-box data-part="body" part="body"><slot></slot></ds-box>
          ${this.dismissible
            ? html`
                <ds-button
                  data-part="closeButton"
                  part="closeButton"
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
      ${this.showArrow ? html`<span data-part="arrow" part="arrow" aria-hidden="true"></span>` : nothing}
    `;

    return html`
      <slot name="trigger" data-part="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal
        ? html`
            <dialog
              data-part="panel"
              part="panel"
              data-side=${this.side}
              class=${classMap({ closing: this.closing })}
              aria-label=${ifDefined(ariaLabel)}
              aria-modal="true"
              @cancel=${this.handleDialogCancel}
              @close=${this.handleDialogClose}
              @keydown=${this.handlePanelKeydown}
            >
              ${panelContent}
            </dialog>
          `
        : html`
            <div
              data-part="panel"
              part="panel"
              data-side=${this.side}
              class=${classMap({ 'fallback-open': !this.popoverSupported && isOpen })}
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

  /* ---- trigger ---- */

  private readonly handleTriggerSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const next = (slot.assignedElements({ flatten: true })[0] as HTMLElement | undefined) ?? null;
    if (next !== this.triggerEl) {
      this.detachTrigger();
      this.triggerEl = next;
      next?.addEventListener('click', this.handleTriggerClick);
    }
    this.updateTriggerAccessibleName();
    this.updateTriggerExpanded();
    if (this.currentOpen) {
      // Opened before the trigger was assigned (`open` set at creation): position now that there is an anchor.
      this.updatePosition();
    }
  };

  private detachTrigger(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    trigger.removeEventListener('click', this.handleTriggerClick);
    if ('expanded' in trigger) {
      (trigger as HTMLElement & { expanded: boolean | undefined }).expanded = undefined;
    } else {
      trigger.removeAttribute('aria-expanded');
    }
  }

  private updateTriggerAccessibleName(): void {
    const trigger = this.triggerEl as (HTMLElement & { label?: unknown; accessibleName?: unknown }) | null;
    if (!trigger) {
      this.triggerAccessibleName = '';
      return;
    }
    const fromProp = (value: unknown): string => (typeof value === 'string' ? value : '');
    this.triggerAccessibleName =
      trigger.getAttribute('aria-label') ||
      fromProp(trigger.accessibleName) ||
      fromProp(trigger.label) ||
      trigger.textContent?.trim() ||
      '';
  }

  private updateTriggerExpanded(): void {
    const trigger = this.triggerEl;
    if (!trigger) {
      return;
    }
    const expanded = this.currentOpen;
    if ('expanded' in trigger) {
      const button = trigger as HTMLElement & { expanded: boolean | undefined };
      if (button.expanded !== expanded) {
        button.expanded = expanded;
      }
    } else if (trigger.getAttribute('aria-expanded') !== String(expanded)) {
      trigger.setAttribute('aria-expanded', String(expanded));
    }
  }

  private readonly handleTriggerClick = (): void => {
    // Focus is already on the trigger when it closes the popover.
    this.requestOpenChange(!this.currentOpen, 'trigger', false);
  };

  /* ---- dismissal ---- */

  private readonly handleCloseButtonPress = (event: Event): void => {
    // The composite reports `open-change`; the button's own `press` stays inside.
    event.stopPropagation();
    this.requestOpenChange(false, 'close-button', true);
  };

  private readonly handleDialogCancel = (event: Event): void => {
    // Escape is handled on keydown; this catches other close requests. The element owns `open`, not the <dialog>.
    event.preventDefault();
    if (this.currentOpen) {
      this.requestOpenChange(false, 'escape', true);
    }
  };

  private readonly handleDialogClose = (): void => {
    // The browser closed the <dialog> without us (an ignored cancel): report it rather than drift out of sync.
    if (this.currentOpen) {
      this.requestOpenChange(false, 'escape', true);
      if (this.currentOpen && this.panelEl && !(this.panelEl as HTMLDialogElement).open) {
        (this.panelEl as HTMLDialogElement).showModal();
      }
    }
  };

  private readonly handlePanelKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.requestOpenChange(false, 'escape', true);
      return;
    }
    if (this.modal || event.key !== 'Tab' || event.defaultPrevented) {
      return;
    }
    const focusables = this.getPanelFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) {
      return;
    }
    const active = getDeepActiveElement();
    if (event.shiftKey && this.isWithin(active, first)) {
      event.preventDefault();
      this.triggerEl?.focus();
      this.requestOpenChange(false, 'tab-out', false);
    } else if (!event.shiftKey && this.isWithin(active, last)) {
      this.requestOpenChange(false, 'tab-out', false);
      if (!this.currentOpen) {
        // Hide before the browser's own Tab traversal runs, so focus continues past the popover.
        this.hidePanelNow();
      }
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

  /**
   * Uncontrolled: applies the change, then reports it. Controlled: reports it only;
   * the element follows once the consumer sets `open`.
   */
  private requestOpenChange(next: boolean, reason: PopoverCloseReason, focusTrigger: boolean): void {
    this.request = { open: next, focusTrigger };
    if (this.open === undefined) {
      this.internalOpen = next;
    }
    this.dispatchEvent(
      new CustomEvent<PopoverOpenChangeDetail>('open-change', {
        detail: { open: next, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---- open / close ---- */

  private handleOpened(): void {
    this.request = null;
    const panel = this.panelEl;
    if (!panel) {
      return;
    }
    if (this.modal) {
      this.closing = false;
      lockBodyScroll();
      if (!(panel as HTMLDialogElement).open) {
        (panel as HTMLDialogElement).showModal();
      }
    } else {
      document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
      if (this.popoverSupported && !panel.matches(':popover-open')) {
        panel.showPopover();
      }
    }
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
    this.updatePosition();
    void this.applyInitialFocus();
  }

  private handleClosed(): void {
    const request = this.request;
    this.request = null;
    const focusInside = this.isWithin(getDeepActiveElement(), this.panelEl);
    const focusTrigger = request ? request.open === false && request.focusTrigger : focusInside;
    this.removeOpenListeners();
    if (this.modal) {
      this.playModalExit(focusTrigger);
    } else {
      this.hidePanelNow();
      if (focusTrigger) {
        this.triggerEl?.focus();
      }
    }
  }

  private playModalExit(focusTrigger: boolean): void {
    const panel = this.panelEl as HTMLDialogElement | null;
    const finish = (): void => {
      panel?.close();
      this.closing = false;
      unlockBodyScroll();
      if (focusTrigger) {
        this.triggerEl?.focus();
      }
    };
    if (!panel || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    this.closing = true;
    let done = false;
    const complete = (): void => {
      if (done) {
        return;
      }
      done = true;
      panel.removeEventListener('transitionend', handleTransitionEnd);
      if (this.currentOpen) {
        // Reopened during the exit: the dialog stays up and the reopen took its own scroll lock.
        unlockBodyScroll();
      } else {
        finish();
      }
    };
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === panel && event.propertyName === 'opacity') {
        complete();
      }
    };
    panel.addEventListener('transitionend', handleTransitionEnd);
    // A transition that never runs (zero duration, hidden tab) must not leave the page inert.
    const exit = parseFloat(getComputedStyle(panel).transitionDuration) || 0;
    setTimeout(complete, exit * 1000 + 50);
  }

  private hidePanelNow(): void {
    const panel = this.panelEl;
    if (this.modal || !panel) {
      return;
    }
    if (this.popoverSupported) {
      if (panel.matches(':popover-open')) {
        panel.hidePopover();
      }
    } else {
      panel.hidden = true;
    }
  }

  private removeOpenListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  /* ---- focus ---- */

  /** The first control in the panel, else the heading. */
  private async applyInitialFocus(): Promise<void> {
    // Slotted elements render their focusable internals in their own update: wait for them first.
    const slotted = (this.bodySlotEl?.assignedElements({ flatten: true }) ?? []).flatMap((el) => [
      el,
      ...Array.from(el.querySelectorAll('*')),
    ]);
    await Promise.all([...slotted, this.headingEl, this.closeButtonEl].map((el) => (el as Partial<LitElement> | null)?.updateComplete));
    if (!this.currentOpen) {
      return;
    }
    const target = this.getPanelFocusables()[0] ?? this.headingEl;
    target?.focus();
  }

  /** Focusable elements in panel order: body content, then the close button. */
  private getPanelFocusables(): HTMLElement[] {
    const results: HTMLElement[] = [];
    for (const element of this.bodySlotEl?.assignedElements({ flatten: true }) ?? []) {
      if (element instanceof HTMLElement) {
        collectFocusable(element, results);
      }
    }
    if (this.closeButtonEl) {
      results.push(this.closeButtonEl);
    }
    return results;
  }

  /** Composed-tree containment: focus inside a child's shadow root counts as inside it. */
  private isWithin(node: Node | null, container: Node | null): boolean {
    if (!container) {
      return false;
    }
    let current: Node | null = node;
    while (current) {
      if (current === container) {
        return true;
      }
      if (current instanceof HTMLElement && current.assignedSlot) {
        current = current.assignedSlot;
      } else {
        current = current.parentNode instanceof ShadowRoot ? current.parentNode.host : current.parentNode;
      }
    }
    return false;
  }

  /* ---- positioning ---- */

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
    const gap = this.readLength('--ds-popover-offset', panel);
    const gutter = this.readLength('--layout-gutter', panel);
    const rtl = getComputedStyle(trigger).direction === 'rtl';

    const { side: preferred, align } = resolvePlacement(this.placement, rtl);
    const fits = (candidate: Side): boolean => {
      switch (candidate) {
        case 'bottom':
          return triggerRect.bottom + gap + panelRect.height <= viewportHeight;
        case 'top':
          return triggerRect.top - gap - panelRect.height >= 0;
        case 'right':
          return triggerRect.right + gap + panelRect.width <= viewportWidth;
        case 'left':
          return triggerRect.left - gap - panelRect.width >= 0;
      }
    };
    const side = !fits(preferred) && fits(OPPOSITE[preferred]) ? OPPOSITE[preferred] : preferred;

    // Alignment is logical: in right-to-left, `start` is the trigger's right edge.
    const alignStartX = rtl ? triggerRect.right - panelRect.width : triggerRect.left;
    const alignEndX = rtl ? triggerRect.left : triggerRect.right - panelRect.width;

    let top: number;
    let left: number;
    if (side === 'bottom' || side === 'top') {
      top = side === 'bottom' ? triggerRect.bottom + gap : triggerRect.top - gap - panelRect.height;
      left =
        align === 'start'
          ? alignStartX
          : align === 'end'
            ? alignEndX
            : triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
    } else {
      left = side === 'right' ? triggerRect.right + gap : triggerRect.left - gap - panelRect.width;
      top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
    }

    // Shift along both axes to stay inside the viewport gutters.
    left = Math.min(Math.max(left, gutter), Math.max(gutter, viewportWidth - panelRect.width - gutter));
    top = Math.min(Math.max(top, gutter), Math.max(gutter, viewportHeight - panelRect.height - gutter));

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;

    const slide = 'var(--space-1)';
    const away = `calc(-1 * ${slide})`;
    panel.style.setProperty('--ds-popover-slide-x', side === 'right' ? away : side === 'left' ? slide : '0');
    panel.style.setProperty('--ds-popover-slide-y', side === 'bottom' ? away : side === 'top' ? slide : '0');

    if (this.side !== side) {
      this.side = side;
    }
  }

  /** Resolves a length custom property to pixels through a probe, so rem- and calc-valued tokens work. */
  private readLength(property: string, context: HTMLElement): number {
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.inlineSize = `var(${property})`;
    context.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }

  /* ---- overrides and warnings ---- */

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
    if (!import.meta.env.DEV || this.warned || !this.isConnected) {
      return;
    }
    const triggers = this.querySelectorAll(':scope > [slot="trigger"]');
    if (triggers.length !== 1) {
      this.warned = true;
      console.warn('<ds-popover> needs exactly one element in its `trigger` slot: the focusable element that opens it.', this);
    }
    if ((this.bodySlotEl?.assignedNodes({ flatten: true }) ?? []).length === 0) {
      this.warned = true;
      console.warn('<ds-popover> needs panel content in its default slot.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-popover': DsPopover;
  }
}
