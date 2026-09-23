import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { focusableIn } from './FocusScope.js';
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

/** Where focus goes on open: the first control, or nowhere (the composer moves it). */
export type PopoverInitialFocus = 'first' | 'none';

/** Why `open-change` fired. */
export type PopoverCloseReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** Detail carried by the `open-change` CustomEvent. */
export interface PopoverOpenChangeDetail {
  open: boolean;
  reason: PopoverCloseReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `breakpoint`, `focusRing` and `focusRingWidth` are locked and excluded. */
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
  | 'gutter'
  | 'layer'
  | 'enter'
  | 'enterDistance'
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
  gutter: '--ds-popover-gutter',
  layer: '--ds-popover-layer',
  enter: '--ds-popover-enter',
  enterDistance: '--ds-popover-enter-distance',
  exit: '--ds-popover-exit',
};

/** copy.closeLabel */
const COPY_CLOSE_LABEL = 'Close';

/** Whether the running browser implements the Popover API. Evaluated once. */
const POPOVER_SUPPORTED = typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';

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

/** The panel margin that carries `offset`: the side facing the trigger. */
const OFFSET_MARGIN: Record<Side, 'marginTop' | 'marginBottom' | 'marginLeft' | 'marginRight'> = {
  bottom: 'marginTop',
  top: 'marginBottom',
  right: 'marginLeft',
  left: 'marginRight',
};

/** Resolves a logical placement against the trigger's writing direction. */
function resolvePlacement(placement: PopoverPlacement, rtl: boolean): { side: Side; align: Align } {
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
      return { side: rtl ? 'right' : 'left', align: 'center' };
    case 'end':
    default:
      return { side: rtl ? 'left' : 'right', align: 'center' };
  }
}

/** How many modal `<ds-popover>` instances currently hold the page-scroll lock. */
let openModalCount = 0;
let previousOverflow = '';
let previousGutter = '';

/** Locks page scroll the way Dialog does; `scrollbar-gutter: stable` keeps the page from shifting by the scrollbar width. */
function lockPageScroll(): void {
  openModalCount += 1;
  if (openModalCount === 1) {
    const style = document.documentElement.style;
    previousOverflow = style.getPropertyValue('overflow');
    previousGutter = style.getPropertyValue('scrollbar-gutter');
    style.setProperty('overflow', 'hidden');
    style.setProperty('scrollbar-gutter', 'stable');
  }
}

function unlockPageScroll(): void {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    const style = document.documentElement.style;
    style.setProperty('overflow', previousOverflow);
    style.setProperty('scrollbar-gutter', previousGutter);
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
 * the popover and marks it expanded (through its `expanded` property when it
 * has one, `aria-expanded` otherwise). `aria-controls` cannot cross the shadow
 * boundary, so it is never set; the panel is named by `aria-label`, from
 * `heading` or copied from the trigger's name.
 *
 * Non-modal (the default): the panel uses the Popover API (`popover="manual"`,
 * top layer) when supported and a `position: fixed` fallback otherwise.
 * Escape, the close button, a pointerdown outside and Tab past the last element
 * close it; Shift+Tab from the first element returns to the trigger and closes.
 * Modal: the panel is a native `<dialog>` opened with `showModal()`, trapped by
 * `<ds-focus-scope>`, with the page inert and scroll locked and no scrim; Escape
 * and the close button are the only ways out. Either way the panel is
 * positioned from the trigger's rect for `placement` (logical, mirrored in
 * right-to-left), flipped and shifted to stay in the viewport, and repositioned
 * on scroll and resize while open.
 *
 * `open` is controlled when set: the element reports `open-change` and shows
 * the new state only once the property changes. Omit it for uncontrolled use;
 * the uncontrolled popover starts closed.
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
      --ds-popover-gutter: var(--layout-gutter);
      --ds-popover-layer: var(--layer-dropdown);
      --ds-popover-enter: var(--motion-duration-fast);
      --ds-popover-enter-distance: var(--space-1);
      --ds-popover-exit: var(--motion-duration-fast);
      /* Locked: no override API, but still themeable from page CSS. */
      --ds-popover-surface: var(--color-overlay-surface);
      --ds-popover-focus-ring: var(--color-border-focus);
      --ds-popover-focus-ring-width: var(--border-width-focus);
      /* React Native only; declared so every platform carries the same hook set. */
      --ds-popover-breakpoint: var(--layout-max-width-prose);
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
      background: var(--ds-popover-surface);
      box-shadow: var(--ds-popover-shadow);
      max-inline-size: min(var(--ds-popover-max-width), calc(100vw - 2 * var(--ds-popover-gutter)));
      max-block-size: none;
      overflow: visible;
      color: var(--color-foreground);
      font-family: var(--font-family-body);
      z-index: var(--ds-popover-layer);
    }

    /* offset: a margin on the side facing the trigger, read back by the flip check. */
    [data-part='panel'][data-side='bottom'] {
      margin-top: var(--ds-popover-offset);
      --ds-popover-slide: translateY(calc(-1 * var(--ds-popover-enter-distance)));
    }
    [data-part='panel'][data-side='top'] {
      margin-bottom: var(--ds-popover-offset);
      --ds-popover-slide: translateY(var(--ds-popover-enter-distance));
    }
    [data-part='panel'][data-side='right'] {
      margin-left: var(--ds-popover-offset);
      --ds-popover-slide: translateX(calc(-1 * var(--ds-popover-enter-distance)));
    }
    [data-part='panel'][data-side='left'] {
      margin-right: var(--ds-popover-offset);
      --ds-popover-slide: translateX(var(--ds-popover-enter-distance));
    }

    [data-part='panel']:focus-visible {
      outline: var(--ds-popover-focus-ring-width) solid var(--ds-popover-focus-ring);
      outline-offset: var(--ds-popover-focus-ring-width);
    }

    /* exit: fade out with motion.easing.exit. */
    [data-part='panel'] {
      opacity: 0;
      transform: none;
      transition:
        opacity var(--ds-popover-exit) var(--motion-easing-exit),
        overlay var(--ds-popover-exit) allow-discrete,
        display var(--ds-popover-exit) allow-discrete;
    }

    /* enter: fade and an enterDistance slide from the trigger side, with motion.easing.standard. */
    div[data-part='panel']:popover-open,
    div[data-part='panel'].fallback-open,
    dialog[data-part='panel'][open] {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard),
        overlay var(--ds-popover-enter) allow-discrete,
        display var(--ds-popover-enter) allow-discrete;
    }

    @starting-style {
      div[data-part='panel']:popover-open,
      div[data-part='panel'].fallback-open,
      dialog[data-part='panel'][open] {
        opacity: 0;
        transform: var(--ds-popover-slide, none);
      }
    }

    div[data-part='panel']:not([popover]):not(.fallback-open) {
      pointer-events: none;
    }

    div[data-part='panel'][hidden] {
      display: none;
    }

    /* A modal popover does not dim the page. */
    dialog[data-part='panel']::backdrop {
      background: transparent;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='panel'],
      div[data-part='panel']:popover-open,
      div[data-part='panel'].fallback-open,
      dialog[data-part='panel'][open] {
        transition: none;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--ds-popover-part-gap);
    }

    /* The header row: the heading fills it, the close button sits at its inline end. */
    .header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ds-popover-part-gap);
    }

    /* The heading part is a popover-owned wrapper: <ds-heading> itself is never restyled. */
    [data-part='heading'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    /* The heading is focused only when the panel has no controls; its wrapper draws the ring. */
    [data-part='heading']:has(:focus-visible) {
      outline: var(--ds-popover-focus-ring-width) solid var(--ds-popover-focus-ring);
      outline-offset: var(--ds-popover-focus-ring-width);
    }

    [data-part='closeButton'] {
      display: inline-flex;
      flex: none;
    }

    [data-part='body'] {
      min-inline-size: 0;
    }

    /* arrowSize: a rotated square centered on the panel edge that faces the trigger, edged on its two outer sides. */
    [data-part='arrow'] {
      position: absolute;
      box-sizing: border-box;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--ds-popover-surface);
      border: 0 solid var(--ds-popover-border);
      transform: rotate(45deg);
    }

    [data-side='bottom'] > [data-part='arrow'] {
      top: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='top'] > [data-part='arrow'] {
      bottom: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }

    [data-side='right'] > [data-part='arrow'] {
      left: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='left'] > [data-part='arrow'] {
      right: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }
  `;

  /** Optional heading at the top of the panel; also the accessible name. Without it, the panel is named by the trigger. */
  @property() accessor heading: string | undefined;

  /** Heading level of the panel heading, so it fits the page outline. */
  @property({ attribute: 'heading-level', reflect: true }) accessor headingLevel: PopoverHeadingLevel = '3';

  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); there is no default-open. */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Preferred side and alignment; flips and shifts to stay in the viewport. Logical: mirrors in right-to-left. */
  @property({ reflect: true }) accessor placement: PopoverPlacement = 'bottom';

  /** `false` (default): the page stays interactive. `true`: a small Dialog anchored to the trigger — focus trapped, background inert. */
  @property({ type: Boolean, reflect: true }) accessor modal = false;

  /** A small pointer toward the trigger. Off by default. */
  @property({ type: Boolean, reflect: true, attribute: 'show-arrow' }) accessor showArrow = false;

  /**
   * Show the close button. Escape and outside click work regardless (non-modal),
   * so this is a visibility switch. Attribute: the negated `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /**
   * Where focus goes on open. `first` (default): the first control in the body, then the close
   * button, then the heading, then the panel. `none`: no focus move — the composer focuses its own
   * element once the panel is shown (with `modal` that is outside the trap until it does).
   */
  @property({ attribute: 'initial-focus', reflect: true }) accessor initialFocus: PopoverInitialFocus = 'first';

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** Whether the panel content is rendered: while open, and through the exit transition. */
  @state() private accessor mounted = false;

  /** The trigger's name, the panel's `aria-label` when `heading` is unset. */
  @state() private accessor triggerAccessibleName = '';

  /** Physical side the panel resolved to on the last positioning pass. */
  @state() private accessor side: Side = 'bottom';

  @query('[data-part="panel"]') private accessor panelEl!: HTMLElement | null;
  /** The `heading` part is the popover-owned wrapper; `tabindex="-1"` sits on the <ds-heading> inside it. */
  @query('[data-part="heading"]') private accessor headingEl!: HTMLElement | null;
  @query('[data-part="heading"] ds-heading') private accessor headingControlEl!: HTMLElement | null;
  @query('[data-part="closeButton"] ds-button') private accessor closeButtonControlEl!: HTMLElement | null;
  @query('[data-part="body"]') private accessor bodyEl!: HTMLElement | null;
  @query('slot:not([name])') private accessor bodySlotEl!: HTMLSlotElement | null;

  private readonly popoverSupported = POPOVER_SUPPORTED;
  private triggerEl: HTMLElement | null = null;
  private wasOpen = false;
  private scrollLocked = false;
  private request: OpenRequest | null = null;
  private exitGeneration = 0;
  private warned = false;

  /** Whether the popover is currently open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Popover');
    if (this.hasUpdated) {
      this.requestUpdate();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachTrigger();
    this.removeOpenListeners();
    this.releaseScrollLock();
    this.wasOpen = false;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (this.currentOpen && !this.mounted) {
      this.mounted = true;
    }
  }

  protected override firstUpdated(): void {
    if (import.meta.env.DEV) {
      setTimeout(() => this.warnInDev(), 0);
    }
  }

  protected override updated(changed: PropertyValues): void {
    const isOpen = this.currentOpen && this.isConnected;
    if (isOpen !== this.wasOpen) {
      this.wasOpen = isOpen;
      this.updateTriggerExpanded();
      if (isOpen) {
        this.handleOpened();
      } else {
        this.handleClosed();
      }
    } else if (isOpen && (changed.has('placement') || changed.has('heading') || changed.has('showArrow'))) {
      this.updatePosition();
    }
  }

  protected override render(): TemplateResult {
    const isOpen = this.currentOpen;
    const ariaLabel = this.heading || this.triggerAccessibleName || undefined;

    const panelContent = this.mounted
      ? html`
          ${this.showArrow ? html`<span data-part="arrow" part="arrow" aria-hidden="true"></span>` : nothing}
          <ds-focus-scope
            data-part="focusScope"
            part="focusScope"
            .trapped=${this.modal}
            .autoFocus=${'none'}
            .restoreFocus=${false}
            .active=${isOpen}
          >
            <div class="content">
              ${this.heading || this.dismissible
                ? html`
                    <div class="header">
                      ${this.heading
                        ? html`
                            <div data-part="heading" part="heading">
                              <ds-heading level=${this.headingLevel} tabindex="-1">${this.heading}</ds-heading>
                            </div>
                          `
                        : nothing}
                      ${this.dismissible
                        ? html`
                            <span data-part="closeButton" part="closeButton" @click=${this.handleCloseTargetClick}>
                              <ds-button
                                variant="ghost"
                                size="sm"
                                icon-only
                                label=${COPY_CLOSE_LABEL}
                                @press=${this.handleCloseButtonPress}
                              >
                                <ds-icon slot="leading-icon" name="close"></ds-icon>
                              </ds-button>
                            </span>
                          `
                        : nothing}
                    </div>
                  `
                : nothing}
              <div data-part="body" part="body"><ds-box><slot></slot></ds-box></div>
            </div>
          </ds-focus-scope>
        `
      : nothing;

    return html`
      <slot name="trigger" data-part="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal
        ? html`
            <dialog
              data-part="panel"
              part="panel"
              data-side=${this.side}
              tabindex="-1"
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
              tabindex="-1"
              aria-label=${ifDefined(ariaLabel)}
              popover=${this.popoverSupported ? 'manual' : nothing}
              ?hidden=${!this.popoverSupported && !isOpen && !this.mounted}
              @keydown=${this.handlePanelKeydown}
            >
              ${panelContent}
            </div>
          `}
    `;
  }

  /**
   * Re-measures and re-places the open panel. For composers whose slotted content lays out after
   * the panel opens, which the scroll and resize listeners never see. A no-op while closed.
   */
  reposition(): void {
    if (this.currentOpen) {
      this.updatePosition();
    }
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
    const name =
      trigger.getAttribute('aria-label') ||
      fromProp(trigger.accessibleName) ||
      fromProp(trigger.label) ||
      trigger.textContent?.trim() ||
      '';
    if (this.triggerAccessibleName !== name) {
      this.triggerAccessibleName = name;
    }
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
    this.requestOpenChange(!this.currentOpen, 'trigger', true);
  };

  /* ---- dismissal ---- */

  private readonly handleCloseButtonPress = (event: Event): void => {
    // The composite reports `open-change`; the button's own `press` stays inside.
    event.stopPropagation();
    this.requestOpenChange(false, 'close-button', true);
  };

  /**
   * The `closeButton` part hook is the popover-owned wrapper, so a press that lands on the
   * wrapper rather than on <ds-button> is forwarded to the button rather than swallowed.
   */
  private readonly handleCloseTargetClick = (event: Event): void => {
    if (event.target === event.currentTarget) {
      this.closeButtonControlEl?.click();
    }
  };

  private readonly handleDialogCancel = (event: Event): void => {
    // Escape pressed before focus reached the panel: keydown never saw it. The element owns `open`, not the <dialog>.
    event.preventDefault();
    if (this.currentOpen) {
      this.requestOpenChange(false, 'escape', true);
    }
  };

  private readonly handleDialogClose = (): void => {
    // The browser closed the <dialog> without us (a close request it would not let us cancel): report it and stay in sync.
    const panel = this.panelEl;
    if (!this.currentOpen || !(panel instanceof HTMLDialogElement)) {
      return;
    }
    this.requestOpenChange(false, 'escape', true);
    if (this.currentOpen && !panel.open) {
      panel.showModal();
    }
  };

  private readonly handlePanelKeydown = (event: KeyboardEvent): void => {
    if (!this.currentOpen) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.requestOpenChange(false, 'escape', true);
      return;
    }
    // Modal: FocusScope wraps Tab within the panel.
    if (this.modal || event.key !== 'Tab' || event.defaultPrevented) {
      return;
    }
    const focusables = this.getPanelFocusables();
    const active = getDeepActiveElement();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const onPanelItself = active === this.panelEl || this.isWithin(active, this.headingEl);
    if (event.shiftKey && (onPanelItself || (first !== undefined && this.isWithin(active, first)))) {
      event.preventDefault();
      this.triggerEl?.focus();
      this.requestOpenChange(false, 'tab-out', false);
    } else if (!event.shiftKey && ((onPanelItself && !last) || (last !== undefined && this.isWithin(active, last)))) {
      // The panel follows the trigger slot in the tab order, so the browser's own Tab would not leave it.
      event.preventDefault();
      this.focusAfterHost();
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
    this.exitGeneration += 1;
    this.updateTriggerAccessibleName();
    const panel = this.panelEl;
    if (!panel) {
      return;
    }
    if (panel instanceof HTMLDialogElement) {
      if (!this.scrollLocked) {
        lockPageScroll();
        this.scrollLocked = true;
      }
      if (!panel.open) {
        panel.showModal();
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
    // A controlled close with no reason from the popover restores focus only when it is inside the panel;
    // a modal popover's <dialog> close has already moved it to the body, which counts as inside.
    const active = getDeepActiveElement();
    const focusInside = this.isWithin(active, this.panelEl) || (this.modal && (active === null || active === document.body));
    // Trigger, Escape and the close button return focus; outside press and Tab out leave it where it went.
    const focusTrigger = request && request.open === false ? request.focusTrigger : focusInside;
    this.removeOpenListeners();
    const panel = this.panelEl;
    if (panel instanceof HTMLDialogElement) {
      if (panel.open) {
        panel.close();
      }
    } else if (panel && this.popoverSupported && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
    this.releaseScrollLock();
    if (focusTrigger) {
      this.triggerEl?.focus();
    }
    this.unmountAfterExit();
  }

  /** Keeps the content rendered through the exit transition, then drops it. */
  private unmountAfterExit(): void {
    const panel = this.panelEl;
    const generation = ++this.exitGeneration;
    let done = false;
    const complete = (): void => {
      if (done) {
        return;
      }
      done = true;
      panel?.removeEventListener('transitionend', handleTransitionEnd);
      panel?.removeEventListener('transitioncancel', handleTransitionEnd);
      if (generation === this.exitGeneration && !this.currentOpen) {
        this.mounted = false;
      }
    };
    const handleTransitionEnd = (event: Event): void => {
      if (event.target === panel) {
        complete();
      }
    };
    if (!panel) {
      complete();
      return;
    }
    panel.addEventListener('transitionend', handleTransitionEnd);
    panel.addEventListener('transitioncancel', handleTransitionEnd);
    const duration = Math.max(...getComputedStyle(panel).transitionDuration.split(',').map((d) => parseFloat(d) || 0));
    setTimeout(complete, duration * 1000);
  }

  private releaseScrollLock(): void {
    if (this.scrollLocked) {
      unlockPageScroll();
      this.scrollLocked = false;
    }
  }

  private removeOpenListeners(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  /* ---- focus ---- */

  /** The first control in the body, then the close button, then the heading, then the panel itself. */
  private async applyInitialFocus(): Promise<void> {
    // Slotted elements render their focusable internals in their own update: wait for them first.
    const slotted = (this.bodySlotEl?.assignedElements({ flatten: true }) ?? []).flatMap((el) => [
      el,
      ...Array.from(el.querySelectorAll('*')),
    ]);
    await Promise.all(
      [...slotted, this.headingControlEl, this.closeButtonControlEl].map(
        (el) => (el as Partial<LitElement> | null)?.updateComplete,
      ),
    );
    if (!this.currentOpen) {
      return;
    }
    // Content that rendered after the first pass changes the panel's size.
    this.updatePosition();
    if (this.initialFocus === 'none') {
      return;
    }
    const target = this.getBodyFocusables()[0] ?? this.closeButtonControlEl ?? this.headingControlEl ?? this.panelEl;
    target?.focus();
  }

  /** The controls in the panel body, in flat-tree order. The first is where focus lands on open. */
  private getBodyFocusables(): HTMLElement[] {
    const body = this.bodyEl;
    return body === null ? [] : focusableIn(body);
  }

  /**
   * Tabbable elements in panel DOM order, by FocusScope's walker — the header row (so the close
   * button) comes before the body, which the walker reaches through the `<slot>` assignments.
   */
  private getPanelFocusables(): HTMLElement[] {
    const panel = this.panelEl;
    return panel === null ? [] : focusableIn(panel);
  }

  /**
   * Focuses the first focusable element after the host, else the trigger. "Focusable" is
   * FocusScope's walker run over the document in DOM order, so the elements inside the host —
   * trigger slot then panel, the panel included wherever the top layer draws it — sit together,
   * and the first one past them is the element a native Tab would have reached.
   */
  private focusAfterHost(): void {
    const all = focusableIn(document.documentElement);
    const start = all.findIndex((el) => this.isWithin(el, this));
    const next = start === -1 ? undefined : all.slice(start).find((el) => !this.isWithin(el, this));
    (next ?? this.triggerEl)?.focus();
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
    // offset is the margin on the side currently facing the trigger; every side carries the same hook.
    const gap = parseFloat(getComputedStyle(panel)[OFFSET_MARGIN[this.side]]) || 0;
    const gutter = this.readLength('--ds-popover-gutter', panel);
    const rtl = getComputedStyle(trigger).direction === 'rtl';

    const { side: preferred, align } = resolvePlacement(this.placement, rtl);
    // A side fits when the panel stays `gutter` clear of that viewport edge.
    const fits = (candidate: Side): boolean => {
      switch (candidate) {
        case 'bottom':
          return triggerRect.bottom + gap + panelRect.height + gutter <= viewportHeight;
        case 'top':
          return triggerRect.top - gap - panelRect.height - gutter >= 0;
        case 'right':
          return triggerRect.right + gap + panelRect.width + gutter <= viewportWidth;
        case 'left':
          return triggerRect.left - gap - panelRect.width - gutter >= 0;
      }
    };
    const side = !fits(preferred) && fits(OPPOSITE[preferred]) ? OPPOSITE[preferred] : preferred;

    // Alignment is logical: in right-to-left, `start` is the trigger's right edge.
    const alignStartX = rtl ? triggerRect.right - panelRect.width : triggerRect.left;
    const alignEndX = rtl ? triggerRect.left : triggerRect.right - panelRect.width;

    // `top`/`left` place the margin box, whose facing-side margin is the offset.
    let top: number;
    let left: number;
    if (side === 'bottom' || side === 'top') {
      top = side === 'bottom' ? triggerRect.bottom : triggerRect.top - gap - panelRect.height;
      left =
        align === 'start'
          ? alignStartX
          : align === 'end'
            ? alignEndX
            : triggerRect.left + triggerRect.width / 2 - panelRect.width / 2;
      left = Math.min(Math.max(left, gutter), Math.max(gutter, viewportWidth - panelRect.width - gutter));
    } else {
      left = side === 'right' ? triggerRect.right : triggerRect.left - gap - panelRect.width;
      top = triggerRect.top + triggerRect.height / 2 - panelRect.height / 2;
      top = Math.min(Math.max(top, gutter), Math.max(gutter, viewportHeight - panelRect.height - gutter));
    }

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;

    if (this.side !== side) {
      // Move the offset margin now, so the placement above holds before the next render.
      panel.setAttribute('data-side', side);
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
    const hasBody = Array.from(this.childNodes).some((node) =>
      node instanceof Element ? node.slot === '' : node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim() !== '',
    );
    if (!hasBody) {
      this.warned = true;
      console.warn('<ds-popover> needs panel content in its default slot.', this);
    }
    this.updateTriggerAccessibleName();
    if (!this.heading && !this.triggerAccessibleName) {
      this.warned = true;
      console.warn('<ds-popover> panel has no accessible name: set `heading`, or give the trigger a readable name.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-popover': DsPopover;
  }
}
