import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Icon.js';
import './Box.js';
import './Stack.js';
import './FocusScope.js';

export type SidePanelSide = 'start' | 'end';
export type SidePanelWidth = 'narrow' | 'default' | 'wide';
export type SidePanelPersistent = 'never' | 'content' | 'page';
export type SidePanelOpenChangeReason =
  | 'trigger'
  | 'escape'
  | 'close-button'
  | 'scrim'
  | 'swipe'
  | 'action'
  | 'navigation';

/** Detail carried by the `open-change` CustomEvent. */
export interface SidePanelOpenChangeDetail {
  open: boolean;
  reason: SidePanelOpenChangeReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type SidePanelOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'border'
  | 'borderWidth'
  | 'width'
  | 'widthNarrow'
  | 'widthWide'
  | 'edgeGutter'
  | 'inset'
  | 'headerGap'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<SidePanelOverridableBinding, string> = {
  scrim: '--ds-side-panel-scrim',
  shadow: '--ds-side-panel-shadow',
  border: '--ds-side-panel-border',
  borderWidth: '--ds-side-panel-border-width',
  width: '--ds-side-panel-width',
  widthNarrow: '--ds-side-panel-width-narrow',
  widthWide: '--ds-side-panel-width-wide',
  edgeGutter: '--ds-side-panel-edge-gutter',
  inset: '--ds-side-panel-inset',
  headerGap: '--ds-side-panel-header-gap',
  partGap: '--ds-side-panel-part-gap',
  footerGap: '--ds-side-panel-footer-gap',
  layer: '--ds-side-panel-layer',
  enter: '--ds-side-panel-enter',
  exit: '--ds-side-panel-exit',
};

/** copy.closeLabel */
const COPY_CLOSE_LABEL = 'Close';

/** Negates a boolean attribute: `no-dismiss` present means `dismissible` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

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

function findFirstFocusable(root: Element): HTMLElement | null {
  if (root instanceof HTMLElement && root.matches(FOCUSABLE_SELECTOR)) {
    return root;
  }
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

/** How many modal `<ds-side-panel>` instances currently hold the body-scroll lock. */
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

function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * `<ds-side-panel>` — SidePanel (category: overlay, APG pattern: disclosure).
 *
 * `<ds-side-panel heading="Menu" persistent="content"><ds-button slot="trigger"
 * icon-only label="Menu"></ds-button><ds-list>…</ds-list></ds-side-panel>`. The
 * `trigger` slot holds the APG disclosure button; clicking it toggles the
 * panel and sets `aria-expanded` directly on it (`aria-controls` is never set
 * — it cannot address an id inside the shadow root). A shadow `<dialog>`
 * backs both overlay modes: non-modal (default) opens it with `.show()` —
 * no backdrop, no trap, focus stays on the trigger, Tab flows trigger → panel
 * → page because the panel sits right after the trigger slot in the
 * flattened tree; modal opens it with `.showModal()` — native top layer,
 * inert background, focus moved in and trapped by `<ds-focus-scope trapped>`.
 * Above the `persistent` breakpoint (a `matchMedia` listener on the resolved
 * `layout.maxWidth.{content,page}` token) the host switches to `display:
 * block` in the parent grid, the trigger is hidden, and the same header/body/
 * footer render inside a plain `<aside role="complementary">` — no dialog, no
 * scrim, no trap, part of the page's tab order.
 *
 * ## When to use
 *
 * Use a SidePanel for phone navigation (a List or Tree of Links from the
 * `start` edge), for filters beside a results page, for a cart or detail
 * panel from the `end` edge, for a settings drawer. Set `persistent="content"`
 * when the same panel should become the permanent sidebar on desktop; leave
 * it `"never"` for panels that are always a temporary overlay.
 *
 * ## When not to use
 *
 * Not for a short list of actions (Menu, ActionSheet), a task with a few
 * fields (Dialog, BottomSheet), or content that is the page's point. Never
 * open one on hover, never stack side panels, and use `modal` only when the
 * page must not be used until the panel is done — a navigation drawer is not
 * that.
 *
 * @fires open-change - Fired when the panel opens or closes, with `{ open,
 *   reason }` in `detail`; `reason` is `trigger`, `escape`, `close-button`,
 *   `scrim`, `swipe`, `action` or `navigation`.
 * @slot trigger - The APG disclosure button that shows and hides the panel. Omit to control `open` from elsewhere.
 * @slot - The body: a List, Tree or Form. Scrolls inside the panel when taller than the viewport (anatomy: body).
 * @slot footer - Pinned above the safe area (anatomy: footer).
 * @csspart scrim - The non-modal backdrop, shown when `scrim` is set (anatomy: scrim).
 * @csspart surface - The padded surface: the `<dialog>` in overlay mode, the `<aside>` in persistent mode (anatomy: surface).
 * @csspart focus-scope - The focus-trapping wrapper (anatomy: focusScope).
 * @csspart header - The header row (anatomy: header).
 * @csspart title - The `<ds-heading>` (anatomy: title).
 * @csspart body - The `<ds-box>` wrapping the default slot (anatomy: body).
 * @csspart footer - The footer row (anatomy: footer).
 * @csspart close-button - The close `<ds-button>` (anatomy: closeButton).
 */
@customElement('ds-side-panel')
export class DsSidePanel extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      --ds-side-panel-scrim: var(--color-overlay-scrim);
      --ds-side-panel-shadow: var(--shadow-overlay);
      --ds-side-panel-border: var(--color-border);
      --ds-side-panel-border-width: var(--border-width-thin);
      --ds-side-panel-width: var(--layout-max-width-prose);
      --ds-side-panel-width-narrow: calc(var(--space-20) * 3);
      --ds-side-panel-width-wide: var(--layout-max-width-content);
      --ds-side-panel-edge-gutter: var(--space-12);
      --ds-side-panel-inset: var(--layout-inset-lg);
      --ds-side-panel-header-gap: var(--layout-gap-normal);
      --ds-side-panel-part-gap: var(--layout-gap-loose);
      --ds-side-panel-footer-gap: var(--layout-gap-tight);
      --ds-side-panel-layer: var(--layer-sheet);
      --ds-side-panel-enter: var(--motion-duration-base);
      --ds-side-panel-exit: var(--motion-duration-fast);
      --ds-side-panel-active-width: var(--ds-side-panel-width);
    }

    :host([width='narrow']) {
      --ds-side-panel-active-width: var(--ds-side-panel-width-narrow);
    }
    :host([width='wide']) {
      --ds-side-panel-active-width: var(--ds-side-panel-width-wide);
    }

    :host([hidden]) {
      display: none;
    }

    /* persistent: above the breakpoint the host itself lays out as a sidebar in the parent grid. */
    :host(.persistent) {
      display: block;
      inline-size: var(--ds-side-panel-active-width);
      block-size: 100%;
    }

    ::slotted([slot='trigger']) {
      display: inline-flex;
    }
    :host(.persistent) ::slotted([slot='trigger']) {
      display: none;
    }

    .scrim {
      position: fixed;
      inset: 0;
      margin: 0;
      padding: 0;
      border: 0;
      background: var(--ds-side-panel-scrim);
      z-index: calc(var(--ds-side-panel-layer) - 1);
    }
    .scrim[hidden] {
      display: none;
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-side-panel-part-gap);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
    }

    dialog.surface {
      margin: 0;
      padding: 0;
      border: 0;
      max-inline-size: none;
      position: fixed;
      inset-block: 0;
      inset-inline: auto;
      block-size: 100dvh;
      inline-size: min(var(--ds-side-panel-active-width), calc(100vw - var(--ds-side-panel-edge-gutter)));
      box-shadow: var(--ds-side-panel-shadow);
      z-index: var(--ds-side-panel-layer);
      color: inherit;
    }

    :host([side='start']) dialog.surface {
      inset-inline-start: 0;
      transition: inset-inline-start var(--ds-side-panel-enter) var(--motion-easing-standard);
    }
    :host([side='end']) dialog.surface {
      inset-inline-end: 0;
      transition: inset-inline-end var(--ds-side-panel-enter) var(--motion-easing-standard);
    }

    :host([side='start']) dialog.surface.closing {
      inset-inline-start: calc(-1 * var(--ds-side-panel-active-width));
      transition-duration: var(--ds-side-panel-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    :host([side='end']) dialog.surface.closing {
      inset-inline-end: calc(-1 * var(--ds-side-panel-active-width));
      transition-duration: var(--ds-side-panel-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @starting-style {
      :host([side='start']) dialog.surface[open] {
        inset-inline-start: calc(-1 * var(--ds-side-panel-active-width));
      }
      :host([side='end']) dialog.surface[open] {
        inset-inline-end: calc(-1 * var(--ds-side-panel-active-width));
      }
    }

    dialog.surface::backdrop {
      background: var(--ds-side-panel-scrim);
      transition: opacity var(--ds-side-panel-enter) var(--motion-easing-standard);
    }
    @starting-style {
      dialog.surface[open]::backdrop {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog.surface,
      dialog.surface::backdrop {
        transition: none;
      }
    }

    aside.surface {
      inline-size: 100%;
      block-size: 100%;
    }
    :host(.persistent[side='start']) aside.surface {
      border-inline-end: var(--ds-side-panel-border-width) solid var(--ds-side-panel-border);
    }
    :host(.persistent[side='end']) aside.surface {
      border-inline-start: var(--ds-side-panel-border-width) solid var(--ds-side-panel-border);
    }

    .header {
      display: flex;
      flex-direction: column;
      padding-inline: var(--ds-side-panel-inset);
      padding-block-start: var(--ds-side-panel-inset);
      flex: 0 0 auto;
    }

    .heading-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-side-panel-header-gap);
      min-inline-size: 0;
    }

    .title {
      min-inline-size: 0;
    }

    /* hideTitle: kept for the accessible name, removed from the visual layout. */
    .title--hidden {
      /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    .close {
      flex: none;
    }

    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }

    .footer-row {
      padding-block-end: env(safe-area-inset-bottom);
    }
  `;

  /** Controlled visibility. Omit for uncontrolled (the trigger toggles it). */
  @property({ type: Boolean, reflect: true }) open?: boolean;

  /**
   * The panel's title and accessible name. Named `heading`, not `title` —
   * `HTMLElement` already defines `title` as the tooltip attribute (see
   * Dialog and BottomSheet).
   */
  @property() heading!: string;

  /** Keep the title for assistive technology but do not render it. The accessible name is required regardless. */
  @property({ type: Boolean, attribute: 'hide-title' }) hideTitle = false;

  /** The edge the panel slides from; `start`/`end` follow the writing direction. */
  @property({ reflect: true }) side: SidePanelSide = 'start';

  /** Panel width on wide screens. On phones the panel is the viewport width minus `edgeGutter`. */
  @property({ reflect: true }) width: SidePanelWidth = 'default';

  /** Above this layout width the panel becomes a fixed sidebar: always visible, no scrim, no trap, no trigger. */
  @property({ reflect: true }) persistent: SidePanelPersistent = 'never';

  /** `false` (default, the disclosure pattern): no trap, focus stays on the trigger. `true`: a modal Dialog at the edge. */
  @property({ type: Boolean, reflect: true }) modal = false;

  /**
   * Show the scrim in non-modal mode too (modal always has one). Attribute
   * is the negation, `no-scrim`, because a boolean attribute cannot express
   * `false` for a prop that defaults `true`.
   */
  @property({ attribute: 'no-scrim', converter: NEGATED_BOOLEAN_CONVERTER }) scrim = true;

  /**
   * Escape, the close button, a scrim tap / outside click, and the swipe
   * gesture all request close. When false, only the trigger and footer
   * actions close it. Attribute is the negation, `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  dismissible = true;

  /**
   * On touch, a swipe toward the edge dismisses (native only — not wired up
   * on the web platform). Attribute is the negation, `no-swipe`.
   */
  @property({ attribute: 'no-swipe', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  swipeable = true;

  /** Per-instance style overrides: `{ inset: 'layout.inset.md' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<SidePanelOverridableBinding, TokenRef>>;

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private internalOpen = false;

  /** Whether the persistent breakpoint currently matches. */
  @state() private isPersistent = false;

  /** Whether the exit transition is playing. */
  @state() private closing = false;

  /** Whether the default slot currently has assigned content, for the dev warning. */
  @state() private hasBodyContent = false;

  @query('dialog') private readonly dialogEl?: HTMLDialogElement;
  @query('#heading') private readonly headingEl?: HTMLElement;
  @query('.close') private readonly closeButtonEl?: HTMLElement;

  private triggerEl: HTMLElement | null = null;
  private persistentQuery: MediaQueryList | null = null;
  private wasLogicalOpen = false;
  private wasOverlayOpen = false;
  private pendingReason: SidePanelOpenChangeReason = 'trigger';
  private focusTriggerOnClose = false;
  private closingProgrammatically = false;

  /** Whether the panel is currently open, controlled or not. */
  get currentOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'SidePanel');
    this.setupPersistentQuery();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.persistentQuery?.removeEventListener('change', this.handlePersistentChange);
    this.removeOutsideListener();
    if (this.modal && this.wasOverlayOpen) {
      unlockBodyScroll();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('persistent')) {
      this.setupPersistentQuery();
    }
    // Crossing into the persistent breakpoint while open: the render below is
    // about to swap the <dialog> for an <aside>, so clean up now while the
    // dialog element from the previous render is still queryable.
    if (changed.has('isPersistent') && this.isPersistent && this.wasOverlayOpen) {
      this.wasOverlayOpen = false;
      this.finishOverlayClose();
    }
  }

  protected override updated(): void {
    const isOpen = this.currentOpen;
    if (isOpen !== this.wasLogicalOpen) {
      this.wasLogicalOpen = isOpen;
      this.updateTriggerExpanded();
      this.dispatchOpenChange(isOpen);
    }
    const showOverlay = isOpen && !this.isPersistent;
    if (showOverlay !== this.wasOverlayOpen) {
      this.wasOverlayOpen = showOverlay;
      if (showOverlay) {
        this.openOverlay();
      } else {
        this.playExitAnimation();
      }
    }
    this.classList.toggle('persistent', this.isPersistent);
    this.warnInDev();
  }

  protected override render() {
    const isOpen = this.currentOpen;
    const isPersistent = this.isPersistent;
    const hasFooter = this.querySelector('[slot="footer"]') !== null;
    const titleClasses = classMap({ title: true, 'title--hidden': this.hideTitle });

    const content = html`
      <ds-focus-scope
        part="focus-scope"
        ?trapped=${this.modal && !isPersistent}
        ?active=${isOpen || isPersistent}
        auto-focus="none"
        ?restore-focus=${false}
        style="display: flex; flex-direction: column; gap: var(--ds-side-panel-part-gap); min-block-size: 0; flex: 1 1 auto"
      >
        <div class="header" part="header">
          <div class="heading-row">
            <ds-heading id="heading" part="title" class=${titleClasses} level="2" size="lg" tabindex="-1"
              >${this.heading}</ds-heading
            >
            ${!isPersistent
              ? html`
                  <ds-button
                    class="close"
                    part="close-button"
                    variant="ghost"
                    size="md"
                    icon-only
                    label=${COPY_CLOSE_LABEL}
                    @press=${this.handleCloseButtonPress}
                  >
                    <ds-icon slot="leading-icon" name="close"></ds-icon>
                  </ds-button>
                `
              : nothing}
          </div>
        </div>
        <ds-box class="body" part="body" inset="lg" .overrides=${this.bodyOverrides()} @click=${this.handleBodyClick}>
          <slot @slotchange=${this.handleBodySlotChange}></slot>
        </ds-box>
        ${hasFooter
          ? html`
              <ds-stack class="footer-row" part="footer" direction="horizontal" justify="end" style="gap: var(--ds-side-panel-footer-gap)">
                <slot name="footer"></slot>
              </ds-stack>
            `
          : nothing}
      </ds-focus-scope>
    `;

    return html`
      <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${!this.modal && !isPersistent
        ? html`
            <div
              class="scrim"
              part="scrim"
              aria-hidden="true"
              ?hidden=${!(this.scrim && isOpen)}
              @pointerdown=${this.handleScrimPointerDown}
            ></div>
          `
        : nothing}
      ${isPersistent
        ? html`<aside class="surface" part="surface" role="complementary" aria-labelledby="heading">${content}</aside>`
        : html`
            <dialog
              class="surface${this.closing ? ' closing' : ''}"
              part="surface"
              role=${this.modal ? nothing : 'complementary'}
              aria-modal=${this.modal ? 'true' : nothing}
              aria-labelledby="heading"
              @cancel=${this.handleCancel}
              @close=${this.handleNativeClose}
              @click=${this.handleDialogClick}
              @keydown=${this.handlePanelKeydown}
            >
              ${content}
            </dialog>
          `}
    `;
  }

  private bodyOverrides() {
    const inset = this.overrides?.inset;
    return inset ? { paddingBlock: inset, paddingInline: inset } : undefined;
  }

  private readonly handleTriggerSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const next = (slot.assignedElements({ flatten: true })[0] as HTMLElement | undefined) ?? null;
    if (next === this.triggerEl) {
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

  private readonly handleBodyClick = (event: Event): void => {
    if (this.isPersistent) {
      return;
    }
    const link = event
      .composedPath()
      .find((target): target is HTMLElement => target instanceof HTMLElement && (target.tagName === 'A' || target.tagName === 'DS-LINK'));
    if (link) {
      this.requestOpenChange(false, 'navigation', true);
    }
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // Keep the button's `press` inside the panel; consumers listen for `open-change`.
    event.stopPropagation();
    if (!this.dismissible) {
      return;
    }
    this.requestOpenChange(false, 'close-button', true);
  };

  private readonly handleCancel = (event: Event): void => {
    // The native default would close the <dialog> itself; the consumer owns `open` instead.
    event.preventDefault();
    if (!this.dismissible) {
      return;
    }
    this.requestOpenChange(false, 'escape', true);
  };

  private readonly handlePanelKeydown = (event: KeyboardEvent): void => {
    // A modal <dialog> already emits `cancel` for Escape; only handle it here for the non-modal (`.show()`) case.
    if (event.key !== 'Escape' || this.modal || !this.dismissible) {
      return;
    }
    event.preventDefault();
    this.requestOpenChange(false, 'escape', true);
  };

  private readonly handleDialogClick = (event: MouseEvent): void => {
    // Modal only: a click on the ::backdrop lands with the <dialog> itself as the target.
    if (!this.modal || !this.dismissible || event.target !== this.dialogEl) {
      return;
    }
    this.requestOpenChange(false, 'scrim', true);
  };

  private readonly handleScrimPointerDown = (): void => {
    if (!this.dismissible) {
      return;
    }
    this.requestOpenChange(false, 'scrim', true);
  };

  private readonly handleOutsidePointerDown = (event: PointerEvent): void => {
    if (event.composedPath().includes(this)) {
      return;
    }
    if (!this.dismissible) {
      return;
    }
    this.requestOpenChange(false, 'scrim', false);
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // Something else (a form with method="dialog", a direct .close() call) closed the dialog.
    this.requestOpenChange(false, 'action', false);
  };

  private requestOpenChange(next: boolean, reason: SidePanelOpenChangeReason, focusTriggerOnClose: boolean): void {
    this.pendingReason = reason;
    this.focusTriggerOnClose = focusTriggerOnClose;
    if (this.open !== undefined) {
      this.open = next;
    } else {
      this.internalOpen = next;
    }
  }

  private openOverlay(): void {
    this.closing = false;
    if (this.modal) {
      lockBodyScroll();
      this.dialogEl?.showModal();
      this.applyInitialFocus();
    } else {
      this.dialogEl?.show();
      this.addOutsideListener();
    }
  }

  private playExitAnimation(): void {
    if (prefersReducedMotion()) {
      this.finishOverlayClose();
      return;
    }
    this.closing = true;
    const dialog = this.dialogEl;
    if (!dialog) {
      this.finishOverlayClose();
      return;
    }
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== dialog || (event.propertyName !== 'inset-inline-start' && event.propertyName !== 'inset-inline-end')) {
        return;
      }
      dialog.removeEventListener('transitionend', handleTransitionEnd);
      this.finishOverlayClose();
    };
    dialog.addEventListener('transitionend', handleTransitionEnd);
  }

  private finishOverlayClose(): void {
    this.closing = false;
    this.removeOutsideListener();
    const dialog = this.dialogEl;
    if (dialog?.open) {
      this.closingProgrammatically = true;
      dialog.close();
    }
    if (this.modal) {
      unlockBodyScroll();
    }
    if (this.focusTriggerOnClose) {
      this.focusTriggerOnClose = false;
      this.triggerEl?.focus();
    }
  }

  private applyInitialFocus(): void {
    const target = this.findFirstBodyFocusable() ?? this.closeButtonEl ?? this.headingEl;
    target?.focus();
  }

  private findFirstBodyFocusable(): HTMLElement | null {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!slot) {
      return null;
    }
    for (const element of slot.assignedElements({ flatten: true })) {
      const found = findFirstFocusable(element);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private addOutsideListener(): void {
    document.addEventListener('pointerdown', this.handleOutsidePointerDown, true);
  }

  private removeOutsideListener(): void {
    document.removeEventListener('pointerdown', this.handleOutsidePointerDown, true);
  }

  private setupPersistentQuery(): void {
    this.persistentQuery?.removeEventListener('change', this.handlePersistentChange);
    this.persistentQuery = null;
    if (this.persistent === 'never') {
      this.isPersistent = false;
      return;
    }
    const tokenVar = this.persistent === 'page' ? '--layout-max-width-page' : '--layout-max-width-content';
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue(tokenVar).trim();
    if (!breakpoint) {
      this.isPersistent = false;
      return;
    }
    this.persistentQuery = matchMedia(`(min-width: ${breakpoint})`);
    this.isPersistent = this.persistentQuery.matches;
    this.persistentQuery.addEventListener('change', this.handlePersistentChange);
  }

  private readonly handlePersistentChange = (event: MediaQueryListEvent): void => {
    this.isPersistent = event.matches;
  };

  private dispatchOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent<SidePanelOpenChangeDetail>('open-change', {
        detail: { open, reason: this.pendingReason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as SidePanelOverridableBinding[]) {
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
    if (!this.heading) {
      console.warn('<ds-side-panel> requires a `heading`, used as the accessible name.', this);
    }
    if (!this.triggerEl && this.open === undefined) {
      console.warn(
        '<ds-side-panel> has no `trigger` slot and no controlled `open`; it can never be shown.',
        this,
      );
    }
    if (!this.hasBodyContent) {
      console.warn('<ds-side-panel> requires content in its default slot.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-side-panel': DsSidePanel;
  }
}
