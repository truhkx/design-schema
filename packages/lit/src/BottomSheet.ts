import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
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
import type { DsFocusScope } from './FocusScope.js';
import type { DialogCloseDetail, DialogOverridableBinding } from './Dialog.js';
import type { StackOverridableBinding } from './Stack.js';

export type BottomSheetHeight = 'content' | 'half' | 'full';
export type BottomSheetCloseReason = 'escape' | 'close-button' | 'scrim' | 'drag' | 'action';

/** Detail carried by the `close` CustomEvent. */
export interface BottomSheetCloseDetail {
  reason: BottomSheetCloseReason;
}

/** Detail carried by the `drag-dismiss` CustomEvent (none: distance and velocity are not part of the contract). */
export type BottomSheetDragDismissDetail = void;

/** Overridable style hooks; see the `overrides` property. `surface`, `handle`, `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded. */
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

/** footerGap's token, forwarded to the footer Stack as `overrides.gap` when no override is set. */
const FOOTER_GAP_TOKEN: TokenRef = 'layout.gap.tight';

/** The maxWidth breakpoint, read once from the theme (not per-instance). */
const MAX_WIDTH_PROPERTY = '--layout-max-width-prose';

/** constants.dismissDistance: fraction of the sheet height a release must pass to dismiss. */
const DISMISS_DISTANCE = 0.25;

/** constants.dismissVelocity: release speed, in px/ms, that dismisses whatever the distance. */
const DISMISS_VELOCITY = 1.5;

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
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** The first tabbable element in tree order, walking slot assignments and open shadow roots. */
function firstFocusableIn(node: Element): HTMLElement | null {
  if (node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true') {
    return null;
  }
  if (node instanceof HTMLElement && !node.hidden && node.tabIndex >= 0 && node.matches(FOCUSABLE_SELECTOR)) {
    return node;
  }
  if (node instanceof HTMLSlotElement) {
    for (const assigned of node.assignedElements({ flatten: true })) {
      const found = firstFocusableIn(assigned);
      if (found) {
        return found;
      }
    }
    return null;
  }
  const scope = node.shadowRoot ?? node;
  for (const child of Array.from(scope.children)) {
    const found = firstFocusableIn(child);
    if (found) {
      return found;
    }
  }
  return null;
}

function getDeepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** How many open sheets hold the page-scroll lock, so a second one does not release it early. */
let scrollLocks = 0;
let previousOverflow = '';
let previousGutter = '';

function lockPageScroll(): void {
  scrollLocks += 1;
  if (scrollLocks === 1) {
    const style = document.documentElement.style;
    previousOverflow = style.getPropertyValue('overflow');
    previousGutter = style.getPropertyValue('scrollbar-gutter');
    style.setProperty('overflow', 'hidden');
    style.setProperty('scrollbar-gutter', 'stable');
  }
}

function unlockPageScroll(): void {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    const style = document.documentElement.style;
    style.setProperty('overflow', previousOverflow);
    style.setProperty('scrollbar-gutter', previousGutter);
  }
}

interface DragSample {
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
}

/**
 * `<ds-bottom-sheet>` — BottomSheet (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-bottom-sheet open heading="Filters" height="half">…</ds-bottom-sheet>`. The phone's
 * dialog: a native `<dialog>` in the shadow root opened with `showModal()` (top layer, inert
 * background, Escape), covering the viewport with a scrim element and the surface anchored to the
 * bottom edge. `<ds-focus-scope>` wraps the surface and returns focus to the opener on close.
 * Above the `layout.maxWidth.prose` viewport width (a `matchMedia` listener) the same props render
 * `<ds-dialog size="md">` instead, so screens are written once.
 *
 * Escape, the close button, a scrim click and a downward drag on the handle or header each request
 * close through the composed `close` event; the sheet never closes itself, the consumer flips
 * `open`. A drag past the threshold fires `drag-dismiss` first. A slotted form submitted with
 * `method="dialog"` requests close with reason `action`.
 *
 * ## When to use
 *
 * On phones, for a task or a set of choices that would otherwise be a Dialog: filters, a form of a
 * few fields, details of a selected item, a picker with many options. For a flat list of actions,
 * ActionSheet is the lighter component.
 *
 * ## When not to use
 *
 * Not as a menu (ActionSheet or Menu), a persistent panel (a bottom Landmark region), or content
 * the user must read at length (a page). Never stack sheets, and never rely on the drag gesture to
 * teach dismissal.
 *
 * @fires close - Requests close, with `{ reason: 'escape' | 'close-button' | 'scrim' | 'drag' | 'action' }`.
 * @fires drag-dismiss - Fired before `close` (reason `drag`) when a drag passes the dismiss threshold.
 * @slot - The body. Scrolls inside the sheet when taller than the sheet's height.
 * @slot footer - Action row, pinned to the bottom of the sheet above the safe area.
 */
@customElement('ds-bottom-sheet')
export class DsBottomSheet extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: contents;
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
      inset: 0;
      inline-size: auto;
      block-size: auto;
      max-inline-size: none;
      max-block-size: none;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      overflow: hidden;
      z-index: var(--ds-bottom-sheet-layer);
    }

    dialog[open] {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    /* The scrim is the element below; the native backdrop stays clear. */
    dialog::backdrop {
      background: transparent;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: var(--ds-bottom-sheet-scrim);
      opacity: 1;
      transition: opacity var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    .scope {
      position: relative;
      display: flex;
      box-sizing: border-box;
      inline-size: 100%;
    }

    /* height: content sizes to the body up to 90% of the viewport; the cap belongs to content alone. */
    :host([height='content']) .scope {
      max-block-size: 90dvh; /* literal-ok: 90% of the viewport, from the height prop's description */
    }
    :host([height='half']) .scope {
      block-size: 50dvh; /* literal-ok: half of the viewport, from the height prop's description */
    }
    :host([height='full']) .scope {
      block-size: calc(100dvh - var(--layout-gutter)); /* literal-ok: the full viewport less the top gutter */
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-inline-size: 0;
      max-block-size: 100%;
      gap: var(--ds-bottom-sheet-part-gap);
      padding-inline: var(--ds-bottom-sheet-inset);
      padding-block-start: var(--layout-gap-tight);
      padding-block-end: calc(var(--ds-bottom-sheet-inset) + env(safe-area-inset-bottom));
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
      /* radius: top corners only on phones */
      border-start-start-radius: var(--ds-bottom-sheet-radius);
      border-start-end-radius: var(--ds-bottom-sheet-radius);
      box-shadow: var(--ds-bottom-sheet-shadow);
      transform: translateY(0);
      transition: transform var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        transform: translateY(100%);
      }
    }

    /* exit: motion.duration.fast with motion.easing.exit, from wherever the surface is */
    .closing .scrim {
      opacity: 0;
      transition-duration: var(--ds-bottom-sheet-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    .closing .surface {
      transform: translateY(100%);
      transition-duration: var(--ds-bottom-sheet-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .surface {
        transition: none;
      }
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: var(--layout-gap-tight);
      flex: none;
    }

    .header.draggable {
      touch-action: none;
      cursor: grab;
    }

    /* handle: color.foreground.muted, locked; a decorative pill, aria-hidden and never a focus stop */
    .handle {
      align-self: center;
      inline-size: var(--ds-bottom-sheet-handle-width);
      block-size: var(--ds-bottom-sheet-handle-height);
      border-radius: var(--radius-full);
      background: var(--color-foreground-muted);
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--layout-gap-normal);
      min-inline-size: 0;
    }

    /* minTarget: size.target.comfortable, locked — the Button keeps its own size and colors */
    .close-button {
      flex: none;
      margin-inline-start: auto;
      min-inline-size: var(--size-target-comfortable);
      min-block-size: var(--size-target-comfortable);
    }

    /* The heading takes focus when nothing else can. */
    .heading:focus {
      outline: none;
    }
    .heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* hideHeading: out of view, still the accessible name. */
    .heading.visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern */
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

    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }
  `;

  /** Controlled visibility, as in Dialog. The consumer owns it; the sheet requests changes through `close`. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The sheet's title and accessible name. May be visually hidden with `hideHeading`. */
  @property() accessor heading = '';

  /** Keep the heading for assistive technology but do not render it. Attribute: `hide-heading`. */
  @property({ type: Boolean, attribute: 'hide-heading' }) accessor hideHeading = false;

  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is near-full-screen. */
  @property({ type: String, reflect: true }) accessor height: BottomSheetHeight = 'content';

  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. When false,
   * only the footer actions close it; Escape still reports. Attribute: `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /**
   * Drag the handle or header downward to dismiss. Purely additive: the close button and Escape
   * always exist. Attribute: `no-drag-to-dismiss`.
   */
  @property({ attribute: 'no-drag-to-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dragToDismiss = true;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** Above the maxWidth breakpoint the sheet presents as `<ds-dialog size="md">`. */
  @state() private accessor wide = false;

  /** The exit transition is playing: the sheet stays rendered a beat past `open` turning false. */
  @state() private accessor closing = false;

  @state() private accessor hasFooter = false;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('.scope') private accessor scopeEl!: DsFocusScope | null;
  @query('.scrim') private accessor scrimEl!: HTMLElement | null;
  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('.heading') private accessor headingEl!: HTMLElement | null;
  @query('.close-button') private accessor closeButtonEl!: HTMLElement | null;
  @query('slot:not([name])') private accessor bodySlotEl!: HTMLSlotElement | null;
  @query('slot[name="footer"]') private accessor footerSlotEl!: HTMLSlotElement | null;

  private scrollLocked = false;
  private closingProgrammatically = false;
  private focusBeforeCancel: HTMLElement | null = null;
  private wideQuery: MediaQueryList | null = null;
  private drag: DragSample | null = null;

  private readonly handleWideChange = (event: MediaQueryListEvent): void => {
    this.wide = event.matches;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'BottomSheet');
    this.addEventListener('submit', this.handleSubmit);
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue(MAX_WIDTH_PROPERTY).trim();
    if (breakpoint) {
      this.wideQuery = matchMedia(`(width > ${breakpoint})`);
      this.wide = this.wideQuery.matches;
      this.wideQuery.addEventListener('change', this.handleWideChange);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('submit', this.handleSubmit);
    this.wideQuery?.removeEventListener('change', this.handleWideChange);
    this.wideQuery = null;
    this.releaseScroll();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (this.wide) {
      this.closing = false;
      return;
    }
    if (changed.has('open')) {
      if (this.open) {
        this.closing = false;
      } else if (changed.get('open') === true) {
        this.closing = true;
      }
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('wide') && this.wide) {
      // The Dialog presentation owns scroll lock and focus from here.
      this.releaseScroll();
    }
    if (!this.wide && (changed.has('open') || changed.has('wide'))) {
      if (this.open) {
        void this.handleOpen();
      } else if (this.closing) {
        void this.handleClose();
      }
    }
    if (import.meta.env.DEV && (changed.has('heading') || changed.has('open'))) {
      this.warnInDev();
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (this.wide) {
      return this.renderDialog();
    }
    if (!this.open && !this.closing) {
      return nothing;
    }
    return this.renderSheet();
  }

  /** Above the breakpoint: the same props and slots on Dialog, with the shared overrides forwarded. */
  private renderDialog(): TemplateResult {
    return html`
      <ds-dialog
        ?open=${this.open}
        heading=${this.heading}
        size="md"
        .hideHeading=${this.hideHeading}
        .dismissible=${this.dismissible}
        .overrides=${this.dialogOverrides()}
        @close=${this.handleDialogClose}
        @opened=${this.stopInnerEvent}
      >
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </ds-dialog>
    `;
  }

  private renderSheet(): TemplateResult {
    const footerOverrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> = {
      gap: this.overrides?.footerGap ?? FOOTER_GAP_TOKEN,
    };
    const draggable = this.dismissible && this.dragToDismiss;

    return html`
      <dialog
        class=${classMap({ closing: this.closing })}
        aria-modal="true"
        aria-labelledby="heading"
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim" @click=${this.handleScrimClick}></div>
        <ds-focus-scope
          class="scope"
          part="focusScope"
          data-part="focusScope"
          auto-focus="none"
          .active=${!this.closing}
        >
          <div class="surface" part="surface" data-part="surface">
            <div
              class=${classMap({ header: true, draggable })}
              part="header"
              data-part="header"
              @pointerdown=${this.handlePointerDown}
              @pointermove=${this.handlePointerMove}
              @pointerup=${this.handlePointerUp}
              @pointercancel=${this.handlePointerCancel}
            >
              <span class="handle" part="handle" data-part="handle" aria-hidden="true"></span>
              <div class="title-row">
                <ds-heading
                  id="heading"
                  class=${classMap({ heading: true, 'visually-hidden': this.hideHeading })}
                  part="heading"
                  data-part="heading"
                  level="2"
                  tabindex="-1"
                  >${this.heading}</ds-heading
                >
                ${this.dismissible
                  ? html`<ds-button
                      class="close-button"
                      part="closeButton"
                      data-part="closeButton"
                      variant="ghost"
                      icon-only
                      label=${COPY_CLOSE_LABEL}
                      @press=${this.handleCloseButtonPress}
                      ><ds-icon slot="leading-icon" name="close"></ds-icon
                    ></ds-button>`
                  : nothing}
              </div>
            </div>
            <ds-box class="body" part="body" data-part="body"><slot></slot></ds-box>
            <ds-stack
              part="footer"
              data-part="footer"
              direction="horizontal"
              justify="end"
              .overrides=${footerOverrides}
              ?hidden=${!this.hasFooter}
              ><slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot
            ></ds-stack>
          </div>
        </ds-focus-scope>
      </dialog>
    `;
  }

  /** inset, radius, partGap and footerGap reach Dialog's own overrides; sheet-only bindings are no-ops there. */
  private dialogOverrides(): Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined {
    const overrides = this.overrides;
    if (!overrides) {
      return undefined;
    }
    const forwarded: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> = {};
    for (const binding of ['inset', 'radius', 'partGap', 'footerGap'] as const) {
      const ref = overrides[binding];
      if (ref !== undefined) {
        forwarded[binding] = ref;
      }
    }
    return forwarded;
  }

  /** Dialog's `close` is re-dispatched from the sheet so consumers see one event, from one element. */
  private readonly handleDialogClose = (event: Event): void => {
    event.stopPropagation();
    this.dispatchClose((event as CustomEvent<DialogCloseDetail>).detail.reason);
  };

  private readonly stopInnerEvent = (event: Event): void => {
    event.stopPropagation();
  };

  private readonly handleCancel = (event: Event): void => {
    // The consumer owns `open`: never let the browser close the <dialog> on its own.
    event.preventDefault();
    const active = getDeepActiveElement();
    this.focusBeforeCancel = active instanceof HTMLElement ? active : null;
    this.dispatchClose('escape');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // Chromium closes without a cancelable `cancel` when Escape arrives with no user activation.
    // `escape` was already reported from `cancel`; stay open until the consumer flips `open`.
    const dialog = this.dialogEl;
    if (this.open && dialog && !dialog.open) {
      dialog.showModal();
      const previous = this.focusBeforeCancel;
      if (previous?.isConnected) {
        previous.focus();
      } else {
        this.applyInitialFocus();
      }
    }
    this.focusBeforeCancel = null;
  };

  private readonly handleScrimClick = (event: MouseEvent): void => {
    if (!this.dismissible || event.target !== event.currentTarget) {
      return;
    }
    this.dispatchClose('scrim');
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // The composite reports `close`; the inner button's `press` stays inside.
    event.stopPropagation();
    this.dispatchClose('close-button');
  };

  /** A slotted form submitted with method="dialog" (or a formmethod="dialog" submitter) asks to close. */
  private readonly handleSubmit = (event: Event): void => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !this.open) {
      return;
    }
    const submitter = (event as SubmitEvent).submitter;
    const method =
      (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) &&
      submitter.hasAttribute('formmethod')
        ? submitter.formMethod
        : form.method;
    if (method === 'dialog') {
      event.preventDefault();
      if (this.wide) {
        // ds-dialog handles the same submit and reports `action` through its own close.
        return;
      }
      this.dispatchClose('action');
    }
  };

  private readonly handleFooterSlotChange = (): void => {
    const next = (this.footerSlotEl?.assignedNodes({ flatten: true }) ?? []).some(
      (node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()),
    );
    if (next !== this.hasFooter) {
      this.hasFooter = next;
    }
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.dismissible || !this.dragToDismiss || this.closing || !event.isPrimary || event.button !== 0) {
      return;
    }
    // The close button is a control, not a drag origin.
    if (event.composedPath().some((node) => node === this.closeButtonEl)) {
      return;
    }
    const surface = this.surfaceEl;
    if (!surface) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { startY: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0 };
    // The drag follows the finger directly, even under reduced motion.
    surface.style.transition = 'none';
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    const surface = this.surfaceEl;
    if (!drag || !surface) {
      return;
    }
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = (event.clientY - drag.lastY) / elapsed;
    }
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    const surface = this.surfaceEl;
    this.drag = null;
    if (!drag || !surface) {
      return;
    }
    const deltaY = Math.max(0, event.clientY - drag.startY);
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && deltaY > sheetHeight * DISMISS_DISTANCE;
    const pastVelocity = drag.velocity > DISMISS_VELOCITY;

    // Hand the transform back to the stylesheet's transitions.
    surface.style.removeProperty('transition');
    if (deltaY > 0 && (pastDistance || pastVelocity)) {
      this.dispatchEvent(new CustomEvent<BottomSheetDragDismissDetail>('drag-dismiss', { bubbles: true, composed: true }));
      this.dispatchClose('drag');
      if (!this.open) {
        // The consumer closed: the exit transition plays from where the finger left the sheet.
        return;
      }
    }
    // Spring back.
    surface.style.removeProperty('transform');
  };

  private readonly handlePointerCancel = (): void => {
    this.drag = null;
    const surface = this.surfaceEl;
    surface?.style.removeProperty('transition');
    surface?.style.removeProperty('transform');
  };

  private async handleOpen(): Promise<void> {
    const dialog = this.dialogEl;
    if (!dialog) {
      return;
    }
    if (!this.scrollLocked) {
      lockPageScroll();
      this.scrollLocked = true;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    // Slotted custom elements render their focusable internals after this update.
    await this.scopeEl?.updateComplete;
    if (!this.open || this.closing || this.wide) {
      return;
    }
    this.applyInitialFocus();
  }

  private async handleClose(): Promise<void> {
    await this.updateComplete;
    // A released drag left an inline transform: dropping it lets the exit run from that position.
    this.surfaceEl?.style.removeProperty('transform');
    await this.transitionsSettled();
    if (this.open || this.wide) {
      return;
    }
    const dialog = this.dialogEl;
    if (dialog?.open) {
      this.closingProgrammatically = true;
      dialog.close();
    }
    this.releaseScroll();
    // Rendering nothing disconnects the FocusScope, which returns focus to the opener.
    this.closing = false;
  }

  private async transitionsSettled(): Promise<void> {
    const parts = [this.scrimEl, this.surfaceEl].filter((el): el is HTMLElement => el !== null);
    // Flush style so transitions started by @starting-style or the closing class are registered.
    for (const part of parts) {
      void getComputedStyle(part).transform;
    }
    const running = parts.flatMap((part) => part.getAnimations());
    await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
  }

  /** FocusScope's `first`: the body's first control, else the close button, else the heading. */
  private applyInitialFocus(): void {
    const bodyFirst = this.bodySlotEl ? firstFocusableIn(this.bodySlotEl) : null;
    const target = bodyFirst ?? (this.dismissible ? this.closeButtonEl : null) ?? this.headingEl;
    target?.focus();
  }

  private releaseScroll(): void {
    if (this.scrollLocked) {
      unlockPageScroll();
      this.scrollLocked = false;
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
    if (this.open && !this.heading) {
      console.warn('<ds-bottom-sheet> requires a `heading`; it is the accessible name.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-bottom-sheet': DsBottomSheet;
  }
}
