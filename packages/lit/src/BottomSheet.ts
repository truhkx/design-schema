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
import './Dialog.js';
import type { DialogOverridableBinding } from './Dialog.js';

export type BottomSheetHeight = 'content' | 'half' | 'full';
export type BottomSheetCloseReason = 'escape' | 'close-button' | 'scrim' | 'drag' | 'action';

/** Detail carried by the `close` CustomEvent. */
export interface BottomSheetCloseDetail {
  reason: BottomSheetCloseReason;
}

/** Detail carried by the `drag-dismiss` CustomEvent (none). */
export type BottomSheetDragDismissDetail = void;

/** Overridable style hooks; see the `overrides` property. `surface`, `handle`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type BottomSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'handleHeight'
  | 'handleWidth'
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<BottomSheetOverridableBinding, string> = {
  scrim: '--ds-bottom-sheet-scrim',
  shadow: '--ds-bottom-sheet-shadow',
  radius: '--ds-bottom-sheet-radius',
  handleHeight: '--ds-bottom-sheet-handle-height',
  handleWidth: '--ds-bottom-sheet-handle-width',
  inset: '--ds-bottom-sheet-inset',
  partGap: '--ds-bottom-sheet-part-gap',
  footerGap: '--ds-bottom-sheet-footer-gap',
  maxWidth: '--ds-bottom-sheet-max-width',
  layer: '--ds-bottom-sheet-layer',
  enter: '--ds-bottom-sheet-enter',
  exit: '--ds-bottom-sheet-exit',
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

/** How many `<ds-bottom-sheet>` instances (in their bottom-edge presentation) currently hold the body-scroll lock. */
let openSheetCount = 0;

function lockBodyScroll(): void {
  openSheetCount += 1;
  if (openSheetCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  openSheetCount = Math.max(0, openSheetCount - 1);
  if (openSheetCount === 0) {
    document.documentElement.style.removeProperty('overflow');
  }
}

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * `<ds-bottom-sheet>` — BottomSheet (category: overlay, APG pattern: dialog-modal).
 *
 * The phone's dialog: rises from the bottom edge behind a scrim, and above
 * the `maxWidth` breakpoint renders `<ds-dialog size="md">` instead — a
 * `matchMedia` listener on the resolved `layout.maxWidth.prose` token decides
 * which, so consumers write the screen once. Below the breakpoint a shadow
 * `<dialog>` is opened with `showModal()` for the top layer, background
 * inertness and `::backdrop` scrim; `<ds-focus-scope trapped>` wraps the
 * header, body and footer. A downward drag on the header (Pointer Events,
 * `setPointerCapture`) past a distance or velocity threshold fires
 * `drag-dismiss` then `close` with reason `drag`; it is purely additive, the
 * close button and Escape always work.
 *
 * ## When to use
 *
 * Use a BottomSheet on phones for a task or a set of choices that would
 * otherwise be a Dialog: filters, a form of a few fields, details of a
 * selected item, a picker with many options. Use `height="content"` by
 * default; `full` for a task that needs the whole screen but should still
 * feel dismissable; `half` for a browsable list where seeing the page behind
 * matters (a map with results). For a flat list of actions, ActionSheet is
 * the lighter component.
 *
 * ## When not to use
 *
 * Not as a menu (ActionSheet or Menu), a persistent panel (a bottom Landmark
 * region), or content the user must read at length (a page). Never stack
 * sheets, and never rely on the drag gesture as the only way to dismiss.
 *
 * @fires close - Requests close, with `{ reason: 'escape' | 'close-button' | 'scrim' | 'drag' | 'action' }`.
 *   The consumer sets `open` to false (or not).
 * @fires drag-dismiss - Fired before `close` (reason `drag`) when a drag gesture crosses the dismiss threshold.
 * @slot - The body. Scrolls inside the sheet when taller than the sheet's height.
 * @slot footer - Action row, pinned above the safe area.
 * @csspart surface - The padded, bordered surface (anatomy: surface).
 * @csspart focus-scope - The focus-trapping wrapper (anatomy: focusScope).
 * @csspart handle - The decorative drag handle (anatomy: handle).
 * @csspart header - The header row (anatomy: header).
 * @csspart heading - The `<ds-heading>` (anatomy: heading).
 * @csspart body - The body wrapper (anatomy: body).
 * @csspart footer - The footer row (anatomy: footer).
 * @csspart close-button - The close `<ds-button>` (anatomy: closeButton).
 */
@customElement('ds-bottom-sheet')
export class DsBottomSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
      --ds-bottom-sheet-scrim: var(--color-overlay-scrim);
      --ds-bottom-sheet-shadow: var(--shadow-overlay);
      --ds-bottom-sheet-radius: var(--radius-lg);
      --ds-bottom-sheet-handle-height: var(--space-1);
      --ds-bottom-sheet-handle-width: var(--space-10);
      --ds-bottom-sheet-inset: var(--layout-inset-lg);
      --ds-bottom-sheet-part-gap: var(--layout-gap-loose);
      --ds-bottom-sheet-footer-gap: var(--layout-gap-tight);
      --ds-bottom-sheet-max-width: var(--layout-max-width-prose);
      --ds-bottom-sheet-layer: var(--layer-sheet);
      --ds-bottom-sheet-enter: var(--motion-duration-base);
      --ds-bottom-sheet-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    dialog {
      box-sizing: border-box;
      position: fixed;
      inset-block-end: 0;
      inset-inline: 0;
      margin: 0;
      padding: 0;
      border: 0;
      inline-size: 100%;
      max-inline-size: none;
      max-block-size: 90dvh;
      background: transparent;
      color: inherit;
      z-index: var(--ds-bottom-sheet-layer);
    }

    /* height: content (default) sizes to the body up to the dialog's own 90dvh max-block-size; half
       and full set an exact block-size instead, so the 90dvh cap must not also apply to them. */
    :host([height='half']) dialog {
      max-block-size: none;
      block-size: 50dvh;
    }
    :host([height='full']) dialog {
      max-block-size: none;
      block-size: calc(100dvh - var(--layout-gutter));
    }

    /* scrim: color.overlay.scrim */
    dialog::backdrop {
      background: var(--ds-bottom-sheet-scrim);
      transition: opacity var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      block-size: 100%;
      gap: var(--ds-bottom-sheet-part-gap);
      font-family: var(--font-family-body);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      /* radius: top corners only on phones; ds-dialog rounds all corners for the wide presentation */
      border-start-start-radius: var(--ds-bottom-sheet-radius);
      border-start-end-radius: var(--ds-bottom-sheet-radius);
      box-shadow: var(--ds-bottom-sheet-shadow);
      overflow: hidden;
      padding-block-end: env(safe-area-inset-bottom);
      transform: translateY(0);
      transition: transform var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    .surface.closing {
      transform: translateY(100%);
      transition-duration: var(--ds-bottom-sheet-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @starting-style {
      dialog[open] .surface {
        transform: translateY(100%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog::backdrop,
      .surface {
        transition: none;
      }
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: var(--layout-gap-tight);
      padding-inline: var(--ds-bottom-sheet-inset);
      padding-block-start: var(--layout-gap-tight);
      flex: 0 0 auto;
      touch-action: none;
    }

    /* handle: color.foreground.muted, locked — a 4×36 decorative pill, aria-hidden and not focusable */
    .handle {
      align-self: center;
      inline-size: var(--ds-bottom-sheet-handle-width);
      block-size: var(--ds-bottom-sheet-handle-height);
      border-radius: var(--radius-full);
      background: var(--color-foreground-muted);
    }

    .heading-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--layout-gap-normal);
      min-inline-size: 0;
    }

    .heading {
      min-inline-size: 0;
    }

    /* hideHeading: kept for the accessible name, removed from the visual layout. */
    .heading--hidden {
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
  `;

  /** Controlled visibility, as in Dialog. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * The sheet's title and accessible name. Named `heading`, not `title` —
   * `HTMLElement` already defines `title` as the tooltip attribute (see
   * Dialog and AlertDialog).
   */
  @property() heading!: string;

  /** Keep the heading for assistive technology but do not render it. The accessible name is required regardless. */
  @property({ type: Boolean, attribute: 'hide-heading' }) hideHeading = false;

  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is near-full-screen. */
  @property({ reflect: true }) height: BottomSheetHeight = 'content';

  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. `false` for a
   * sheet that must be answered from its footer actions; Escape still reports. Attribute is the
   * negation, `no-dismiss`, because a boolean attribute cannot express `false` for a prop that
   * defaults `true` (see Dialog).
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  dismissible = true;

  /**
   * Drag the handle (or header) downward to dismiss. Purely additive: the close button and
   * Escape always exist. `platforms.lit.reflect` lists this attribute in its direct (non-negated)
   * form, unlike `dismissible`'s `no-dismiss` — kept literal per the doc; see the generation gap notes.
   */
  @property({ type: Boolean, attribute: 'drag-to-dismiss', reflect: true }) dragToDismiss = true;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, handle, focusRing, focusRingWidth) are ignored. Only applied below the wide-viewport breakpoint; above it the sheet renders as Dialog and uses Dialog's own overrides contract. */
  @property({ attribute: false }) overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef>>;

  /** Above `layout.maxWidth.prose` the sheet renders as a centered `<ds-dialog size="md">` instead. */
  @state() private isWide = false;

  /** Whether the exit transition is playing (kept open a beat past the `open` flip so it can animate out). */
  @state() private closing = false;

  @query('dialog') private readonly dialogEl!: HTMLDialogElement;
  @query('#heading') private readonly headingEl!: HTMLElement;
  @query('.close') private readonly closeButtonEl!: HTMLElement;

  private openerElement: Element | null = null;
  private closingProgrammatically = false;
  private suppressCloseSync = false;
  private wideQuery: MediaQueryList | null = null;
  private dragState: { startY: number; startTime: number } | null = null;

  private readonly handleWideChange = (event: MediaQueryListEvent): void => {
    this.isWide = event.matches;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'BottomSheet');
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
    if (breakpoint) {
      this.wideQuery = matchMedia(`(min-width: ${breakpoint})`);
      this.isWide = this.wideQuery.matches;
      this.wideQuery.addEventListener('change', this.handleWideChange);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.wideQuery?.removeEventListener('change', this.handleWideChange);
    if (!this.isWide && this.dialogEl?.open) {
      unlockBodyScroll();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (!this.isWide && changed.has('open')) {
      if (this.open) {
        this.handleOpen();
      } else if (changed.get('open') as boolean) {
        if (this.suppressCloseSync) {
          this.suppressCloseSync = false;
        } else {
          this.playExit();
        }
      }
    }
    this.warnInDev();
  }

  protected override render() {
    if (this.isWide) {
      return this.renderAsDialog();
    }
    return this.renderAsSheet();
  }

  private renderAsDialog() {
    return html`
      <ds-dialog
        ?open=${this.open}
        heading=${this.heading}
        size="md"
        .dismissible=${this.dismissible}
        .hideHeading=${this.hideHeading}
        .overrides=${this.dialogOverrides()}
      >
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </ds-dialog>
    `;
  }

  private renderAsSheet() {
    const hasFooter = this.querySelector('[slot="footer"]') !== null;
    const headingClasses = classMap({ heading: true, 'heading--hidden': this.hideHeading });

    return html`
      <dialog
        aria-modal="true"
        aria-labelledby="heading"
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @click=${this.handleDialogClick}
      >
        <div class="surface${this.closing ? ' closing' : ''}" part="surface">
          <ds-focus-scope
            part="focus-scope"
            trapped
            ?active=${this.open}
            auto-focus="none"
            ?restore-focus=${false}
            style="display: flex; flex-direction: column; gap: var(--ds-bottom-sheet-part-gap)"
          >
            <div
              class="header"
              part="header"
              @pointerdown=${this.handleHeaderPointerDown}
              @pointermove=${this.handleHeaderPointerMove}
              @pointerup=${this.handleHeaderPointerUp}
              @pointercancel=${this.handleHeaderPointerUp}
            >
              <span class="handle" part="handle" aria-hidden="true"></span>
              <div class="heading-row">
                <ds-heading id="heading" part="heading" class=${headingClasses} level="2" size="lg" tabindex="-1"
                  >${this.heading}</ds-heading
                >
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
              </div>
            </div>
            <ds-box class="body" part="body" inset="lg" .overrides=${this.bodyOverrides()}>
              <slot></slot>
            </ds-box>
            ${hasFooter
              ? html`
                  <ds-stack part="footer" direction="horizontal" justify="end" style="gap: var(--ds-bottom-sheet-footer-gap)">
                    <slot name="footer"></slot>
                  </ds-stack>
                `
              : nothing}
          </ds-focus-scope>
        </div>
      </dialog>
    `;
  }

  private bodyOverrides() {
    const inset = this.overrides?.inset;
    return inset ? { paddingBlock: inset, paddingInline: inset } : undefined;
  }

  /** Forwards the sheet-and-Dialog-shared bindings to `<ds-dialog>` in the wide presentation; sheet-only bindings (handle, edge radius, drag) have no Dialog equivalent. */
  private dialogOverrides(): Partial<Record<DialogOverridableBinding, TokenRef>> | undefined {
    const { inset, radius, partGap, footerGap } = this.overrides ?? {};
    if (inset === undefined && radius === undefined && partGap === undefined && footerGap === undefined) {
      return undefined;
    }
    return { inset, radius, partGap, footerGap };
  }

  private readonly handleCancel = (event: Event): void => {
    // The native default would close the <dialog> itself; the consumer owns `open` instead.
    event.preventDefault();
    this.dispatchClose('escape');
  };

  private readonly handleDialogClick = (event: MouseEvent): void => {
    if (!this.dismissible || event.target !== this.dialogEl) {
      return;
    }
    this.dispatchClose('scrim');
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // Keep the button's `press` inside the sheet; consumers listen for `close`.
    event.stopPropagation();
    if (!this.dismissible) {
      return;
    }
    this.dispatchClose('close-button');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    unlockBodyScroll();
    this.restoreFocus();
    this.suppressCloseSync = true;
    this.open = false;
    this.dispatchClose('action');
  };

  private readonly handleHeaderPointerDown = (event: PointerEvent): void => {
    if (!this.dragToDismiss) {
      return;
    }
    if ((event.target as HTMLElement).closest('.close')) {
      return;
    }
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!surface) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.dragState = { startY: event.clientY, startTime: event.timeStamp };
    surface.style.transition = 'none';
  };

  private readonly handleHeaderPointerMove = (event: PointerEvent): void => {
    const drag = this.dragState;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!drag || !surface) {
      return;
    }
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  private readonly handleHeaderPointerUp = (event: PointerEvent): void => {
    const drag = this.dragState;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    this.dragState = null;
    if (!drag || !surface) {
      return;
    }

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const velocity = deltaY / elapsed;
    const sheetHeight = surface.getBoundingClientRect().height || 1;
    const pastThreshold = deltaY / sheetHeight > 0.25 || velocity > 0.5;

    surface.style.transition = prefersReducedMotion() ? 'none' : '';
    surface.style.transform = '';

    if (pastThreshold && this.dismissible) {
      this.dispatchEvent(
        new CustomEvent<BottomSheetDragDismissDetail>('drag-dismiss', { bubbles: true, composed: true }),
      );
      this.dispatchClose('drag');
    }
  };

  private handleOpen(): void {
    this.closing = false;
    this.openerElement = getDeepActiveElement();
    lockBodyScroll();
    this.dialogEl.showModal();
    this.applyInitialFocus();
  }

  private playExit(): void {
    const finish = (): void => {
      this.closingProgrammatically = true;
      this.dialogEl.close();
      unlockBodyScroll();
      this.restoreFocus();
      this.closing = false;
    };
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    this.closing = true;
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!surface) {
      finish();
      return;
    }
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== surface || event.propertyName !== 'transform') {
        return;
      }
      surface.removeEventListener('transitionend', handleTransitionEnd);
      finish();
    };
    surface.addEventListener('transitionend', handleTransitionEnd);
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

  private restoreFocus(): void {
    const opener = this.openerElement;
    this.openerElement = null;
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }
  }

  private dispatchClose(reason: BottomSheetCloseReason): void {
    this.dispatchEvent(
      new CustomEvent<BottomSheetCloseDetail>('close', { detail: { reason }, bubbles: true, composed: true }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as BottomSheetOverridableBinding[]) {
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
      console.warn('<ds-bottom-sheet> requires a `heading`, used as the accessible name.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-bottom-sheet': DsBottomSheet;
  }
}
