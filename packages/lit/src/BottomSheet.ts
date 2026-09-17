import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
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

/**
 * Overridable style hooks; see the `overrides` property. `surface`, `handle`, `maxWidth`,
 * `minTarget`, `focusRing` and `focusRingWidth` are locked and excluded.
 */
export type BottomSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
  | 'headerPaddingTop'
  | 'handleGap'
  | 'headerGap'
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<BottomSheetOverridableBinding, string> = {
  scrim: '--ds-bottom-sheet-scrim',
  shadow: '--ds-bottom-sheet-shadow',
  radius: '--ds-bottom-sheet-radius',
  handleHeight: '--ds-bottom-sheet-handle-height',
  handleWidth: '--ds-bottom-sheet-handle-width',
  handleRadius: '--ds-bottom-sheet-handle-radius',
  headerPaddingTop: '--ds-bottom-sheet-header-padding-top',
  handleGap: '--ds-bottom-sheet-handle-gap',
  headerGap: '--ds-bottom-sheet-header-gap',
  inset: '--ds-bottom-sheet-inset',
  partGap: '--ds-bottom-sheet-part-gap',
  footerGap: '--ds-bottom-sheet-footer-gap',
  layer: '--ds-bottom-sheet-layer',
  enter: '--ds-bottom-sheet-enter',
  exit: '--ds-bottom-sheet-exit',
};

/** The overrides whose binding Dialog shares by name; forwarded to its `overrides` in the wide presentation. */
const DIALOG_SHARED_BINDINGS = [
  'scrim',
  'shadow',
  'radius',
  'inset',
  'partGap',
  'headerGap',
  'footerGap',
  'layer',
  'enter',
  'exit',
] as const satisfies readonly (BottomSheetOverridableBinding & DialogOverridableBinding)[];

/** maxWidth (layout.maxWidth.prose): the breakpoint, read from the theme token, not per instance. */
const MAX_WIDTH_PROPERTY = '--layout-max-width-prose';

/** constants.dragSlop (space.1): read through the token at gesture time. */
const DRAG_SLOP_PROPERTY = '--space-1';

/** constants.dismissDistance: fraction of the sheet height a release must pass to dismiss. */
const DISMISS_DISTANCE = 0.25;

/** constants.dismissVelocity: downward release speed, in px/ms, that dismisses whatever the distance. */
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

/** A resolved length custom property (`4px`, `0.25rem`) in CSS pixels. */
function lengthInPx(element: Element, value: string): number {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  if (value.endsWith('rem')) {
    return amount * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  if (value.endsWith('em')) {
    return amount * Number.parseFloat(getComputedStyle(element).fontSize);
  }
  return amount;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
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

/** A pointer that went down on the header; it becomes a drag only once it has moved `dragSlop` downward. */
interface DragGesture {
  pointerId: number;
  startY: number;
  claimed: boolean;
  previousY: number;
  previousTime: number;
  lastY: number;
  lastTime: number;
}

/**
 * `<ds-bottom-sheet>` — BottomSheet (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-bottom-sheet open heading="Filters" height="half">…</ds-bottom-sheet>`. The phone's
 * dialog: a native `<dialog>` in the shadow root opened with `showModal()` (top layer, inert
 * background, Escape), covering the viewport with a scrim element and the surface anchored to the
 * bottom edge. `<ds-focus-scope>` wraps the surface, wraps Tab and returns focus to the opener on
 * close. Above the `layout.maxWidth.prose` viewport width (a `matchMedia` listener) the same props
 * render `<ds-dialog size="md">` instead, so screens are written once.
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
      --ds-bottom-sheet-handle-radius: var(--radius-full);
      --ds-bottom-sheet-header-padding-top: var(--space-sm);
      --ds-bottom-sheet-handle-gap: var(--layout-gap-tight);
      --ds-bottom-sheet-header-gap: var(--layout-gap-normal);
      --ds-bottom-sheet-inset: var(--layout-inset-lg);
      --ds-bottom-sheet-part-gap: var(--layout-gap-loose);
      --ds-bottom-sheet-footer-gap: var(--layout-gap-tight);
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
      /* layer: only a non-top-layer fallback honours this; the top layer ignores z-index. */
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
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
      /* radius: top corners only on phones */
      border-start-start-radius: var(--ds-bottom-sheet-radius);
      border-start-end-radius: var(--ds-bottom-sheet-radius);
      box-shadow: var(--ds-bottom-sheet-shadow);
      transform: translateY(0);
      /* enter: slide up with the scrim, same duration and easing */
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

    /* exit: slide down with motion.easing.exit, from wherever the surface is; the scrim fades alike */
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

    /* The drag follows the finger directly, even under reduced motion. */
    .surface.dragging {
      transition: none;
    }

    /* A below-threshold release returns to rest with the exit duration and the standard easing. */
    .surface.springing {
      transition: transform var(--ds-bottom-sheet-exit) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .surface,
      .surface.springing {
        transition: none;
      }
    }

    .header {
      display: flex;
      flex-direction: column;
      gap: var(--ds-bottom-sheet-handle-gap);
      flex: none;
      padding-inline: var(--ds-bottom-sheet-inset);
      /* No handle: the header's block-start padding is inset. */
      padding-block-start: var(--ds-bottom-sheet-inset);
    }
    .header.draggable {
      padding-block-start: var(--ds-bottom-sheet-header-padding-top);
      touch-action: none;
      cursor: grab;
    }

    /* handle: color.foreground.muted, locked; a decorative pill, aria-hidden and never a focus stop */
    .handle {
      align-self: center;
      inline-size: var(--ds-bottom-sheet-handle-width);
      block-size: var(--ds-bottom-sheet-handle-height);
      border-radius: var(--ds-bottom-sheet-handle-radius);
      background: var(--color-foreground-muted);
    }

    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-bottom-sheet-header-gap);
      min-inline-size: 0;
    }

    /* minTarget: size.target.comfortable, locked — the Button keeps its own size and colors */
    .close-button {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: none;
      margin-inline-start: auto;
      min-inline-size: var(--size-target-comfortable);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    /* The heading wrapper draws the ring when the heading holds focus (tabindex -1). */
    .heading ds-heading:focus {
      outline: none;
    }
    .heading:has(:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* hideHeading: out of view, still the accessible name and still a focus target. */
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
      padding-inline: var(--ds-bottom-sheet-inset);
    }

    .footer {
      flex: none;
      padding-inline: var(--ds-bottom-sheet-inset);
    }
    /* footerGap reaches the Stack through its own hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-bottom-sheet-footer-gap);
    }

    /* inset: the last part's block-end padding, plus the bottom safe area. */
    .surface > :last-child {
      padding-block-end: calc(var(--ds-bottom-sheet-inset) + env(safe-area-inset-bottom));
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
   * the close button and handle are not rendered, a scrim tap and a drag do nothing, and Escape
   * still reports. Attribute: `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /**
   * Drag the handle or header downward to dismiss. Purely additive: Escape always exists and the
   * close button exists whenever the gesture does. Attribute: `no-drag-to-dismiss`.
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

  /** A light-DOM child is assigned to the `footer` slot; the footer part renders only then. */
  @state() private accessor hasFooter = false;

  /** Nothing else could take initial focus, so the heading takes tabindex -1. */
  @state() private accessor headingIsFallback = false;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('.scope') private accessor scopeEl!: DsFocusScope | null;
  @query('.scrim') private accessor scrimEl!: HTMLElement | null;
  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('.heading ds-heading') private accessor headingEl!: HTMLElement | null;
  @query('.close-button ds-button') private accessor closeButtonEl!: HTMLElement | null;
  @query('slot:not([name])') private accessor bodySlotEl!: HTMLSlotElement | null;
  @query('slot[name="footer"]') private accessor footerSlotEl!: HTMLSlotElement | null;

  private scrollLocked = false;
  private closingProgrammatically = false;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported = false;
  private wideQuery: MediaQueryList | null = null;
  private gesture: DragGesture | null = null;

  /** Watches light-DOM children for `slot="footer"`; the callback only compares and sets state. */
  private readonly footerObserver: MutationObserver = new MutationObserver(() => this.syncHasFooter());

  private readonly handleWideChange = (event: MediaQueryListEvent): void => {
    this.wide = event.matches;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'BottomSheet');
    this.addEventListener('submit', this.handleSubmit);
    this.syncHasFooter();
    this.footerObserver.observe(this, { childList: true, subtree: true, attributeFilter: ['slot'] });
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
    this.footerObserver.disconnect();
    this.wideQuery?.removeEventListener('change', this.handleWideChange);
    this.wideQuery = null;
    this.gesture = null;
    this.releaseScroll();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('dismissible') || (changed.has('open') && this.open)) {
      this.headingIsFallback = false;
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
      this.gesture = null;
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
        ${this.hasFooter ? html`<slot name="footer" slot="footer"></slot>` : nothing}
      </ds-dialog>
    `;
  }

  private renderSheet(): TemplateResult {
    const draggable = this.dismissible && this.dragToDismiss;
    // Forwards reach the child's overrides only when set, so the CSS hook route keeps working otherwise.
    const footerGap = this.overrides?.footerGap;
    const footerOverrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined =
      footerGap === undefined ? undefined : { gap: footerGap };

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
              ${draggable ? html`<span class="handle" part="handle" data-part="handle" aria-hidden="true"></span>` : nothing}
              <div class="title-row">
                <div
                  id="heading"
                  class=${classMap({ heading: true, 'visually-hidden': this.hideHeading })}
                  part="heading"
                  data-part="heading"
                >
                  <ds-heading level="2" tabindex=${ifDefined(this.headingIsFallback ? '-1' : undefined)}
                    >${this.heading}</ds-heading
                  >
                </div>
                ${this.dismissible
                  ? html`<div
                      class="close-button"
                      part="closeButton"
                      data-part="closeButton"
                      @click=${this.handleCloseWrapperClick}
                    >
                      <ds-button
                        variant="ghost"
                        size="sm"
                        icon-only
                        label=${COPY_CLOSE_LABEL}
                        @press=${this.handleCloseButtonPress}
                        ><ds-icon slot="leading-icon" name="close"></ds-icon
                      ></ds-button>
                    </div>`
                  : nothing}
              </div>
            </div>
            <div class="body" part="body" data-part="body">
              <ds-box><slot></slot></ds-box>
            </div>
            ${this.hasFooter
              ? html`<div class="footer" part="footer" data-part="footer">
                  <ds-stack direction="horizontal" justify="end" .overrides=${footerOverrides}
                    ><slot name="footer"></slot
                  ></ds-stack>
                </div>`
              : nothing}
          </div>
        </ds-focus-scope>
      </dialog>
    `;
  }

  /** Every set override whose binding Dialog shares by name reaches Dialog's own overrides. */
  private dialogOverrides(): Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined {
    const overrides = this.overrides;
    if (!overrides) {
      return undefined;
    }
    const forwarded: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> = {};
    for (const binding of DIALOG_SHARED_BINDINGS) {
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
    // A non-cancelable cancel (Chromium without user activation) is followed by a native close.
    this.escapeReported = !event.cancelable;
    this.dispatchClose('escape');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // The browser closed the <dialog> itself. If no `cancel` announced it, that was Escape too.
    if (!this.escapeReported) {
      this.dispatchClose('escape');
    }
    this.escapeReported = false;
    const dialog = this.dialogEl;
    if (this.open && dialog && !dialog.open) {
      dialog.showModal();
      void this.applyInitialFocus();
    }
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

  /** The wrapper's extra target area activates the close button. */
  private readonly handleCloseWrapperClick = (event: MouseEvent): void => {
    const button = this.closeButtonEl;
    if (!button || event.composedPath().includes(button)) {
      return;
    }
    button.focus();
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

  private syncHasFooter(): void {
    const next = Array.from(this.children).some((child) => child.slot === 'footer');
    if (next !== this.hasFooter) {
      this.hasFooter = next;
    }
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.dismissible || !this.dragToDismiss || this.closing || !event.isPrimary || event.button !== 0) {
      return;
    }
    // Not claimed yet: a tap on the close button still activates it.
    this.gesture = {
      pointerId: event.pointerId,
      startY: event.clientY,
      claimed: false,
      previousY: event.clientY,
      previousTime: event.timeStamp,
      lastY: event.clientY,
      lastTime: event.timeStamp,
    };
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const gesture = this.gesture;
    const surface = this.surfaceEl;
    if (!gesture || !surface || event.pointerId !== gesture.pointerId) {
      return;
    }
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.claimed) {
      const slop = lengthInPx(this, getComputedStyle(this).getPropertyValue(DRAG_SLOP_PROPERTY).trim());
      if (deltaY < slop || deltaY <= 0) {
        return;
      }
      gesture.claimed = true;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      surface.classList.remove('springing');
      surface.classList.add('dragging');
    }
    gesture.previousY = gesture.lastY;
    gesture.previousTime = gesture.lastTime;
    gesture.lastY = event.clientY;
    gesture.lastTime = event.timeStamp;
    surface.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const gesture = this.gesture;
    const surface = this.surfaceEl;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    this.gesture = null;
    if (!gesture.claimed || !surface) {
      return;
    }
    surface.classList.remove('dragging');
    const deltaY = Math.max(0, event.clientY - gesture.startY);
    const sheetHeight = surface.getBoundingClientRect().height;
    const elapsed = gesture.lastTime - gesture.previousTime;
    // Measured between the last two move samples; only downward speed counts.
    const velocity = elapsed > 0 ? Math.max(0, (gesture.lastY - gesture.previousY) / elapsed) : 0;
    const pastDistance = sheetHeight > 0 && deltaY > sheetHeight * DISMISS_DISTANCE;
    const pastVelocity = velocity > DISMISS_VELOCITY;

    if (deltaY > 0 && (pastDistance || pastVelocity)) {
      this.dispatchEvent(
        new CustomEvent<BottomSheetDragDismissDetail>('drag-dismiss', { bubbles: true, composed: true }),
      );
      this.dispatchClose('drag');
      // Hold the release position until the consumer's update renders.
      void this.settleRelease(surface);
      return;
    }
    void this.springBack(surface);
  };

  private readonly handlePointerCancel = (): void => {
    const gesture = this.gesture;
    this.gesture = null;
    const surface = this.surfaceEl;
    if (gesture?.claimed && surface) {
      surface.classList.remove('dragging');
      void this.springBack(surface);
    }
  };

  /** After a drag dismiss: `open` false plays the exit from here (handleClose); still true springs back. */
  private async settleRelease(surface: HTMLElement): Promise<void> {
    await this.updateComplete;
    await nextFrame();
    if (this.open && !this.closing && !this.wide && surface.isConnected) {
      await this.springBack(surface);
    }
  }

  private async springBack(surface: HTMLElement): Promise<void> {
    surface.classList.add('springing');
    surface.style.removeProperty('transform');
    void getComputedStyle(surface).transform;
    await Promise.all(surface.getAnimations().map((animation) => animation.finished.catch(() => undefined)));
    if (!this.gesture?.claimed) {
      surface.classList.remove('springing');
    }
  }

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
    await this.applyInitialFocus();
  }

  private async handleClose(): Promise<void> {
    await this.updateComplete;
    this.gesture = null;
    const surface = this.surfaceEl;
    surface?.classList.remove('dragging', 'springing');
    // A released drag left an inline transform: dropping it lets the exit run from that position.
    surface?.style.removeProperty('transform');
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

  /** The first focusable in the body, then in the footer, then the close button, then the heading. */
  private async applyInitialFocus(): Promise<void> {
    const bodyFirst = this.bodySlotEl ? firstFocusableIn(this.bodySlotEl) : null;
    const footerFirst = this.footerSlotEl ? firstFocusableIn(this.footerSlotEl) : null;
    let target = bodyFirst ?? footerFirst ?? (this.dismissible ? this.closeButtonEl : null);
    if (!target) {
      if (!this.headingIsFallback) {
        this.headingIsFallback = true;
        await this.updateComplete;
      }
      target = this.headingEl;
    }
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
