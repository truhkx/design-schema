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
import type { BoxOverridableBinding } from './Box.js';
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

/**
 * The overrides whose binding Dialog shares by name; only these reach Dialog's own `overrides` in
 * the wide presentation, and only when the caller set them, so Dialog keeps its own tokens
 * otherwise — its `layer.dialog` included. The handle bindings, `headerPaddingTop` and `handleGap`
 * have no counterpart there, and a locked binding is never forwarded.
 */
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

/** constants.dragSlop (space.1): read from the resolved custom property at gesture time. */
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

/** A resolved length custom property (`4px`, `0.25rem`) in CSS pixels; an unresolvable value is 0. */
function lengthInPx(element: Element, value: string): number {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  if (value.endsWith('rem')) {
    const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(root) ? amount * root : 0;
  }
  if (value.endsWith('em')) {
    const own = Number.parseFloat(getComputedStyle(element).fontSize);
    return Number.isFinite(own) ? amount * own : 0;
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

/** One move sample, for the release velocity. */
interface DragSample {
  y: number;
  time: number;
}

/** A pointer that went down on the header; it becomes a drag only once it has moved `dragSlop` downward. */
interface DragGesture {
  pointerId: number;
  /** Where the pointer went down; the slop is measured from here. */
  startY: number;
  /** Where the slop was crossed; the offset counts from here, so the surface does not jump. */
  originY: number;
  claimed: boolean;
  previous: DragSample | null;
  last: DragSample | null;
}

/**
 * `<ds-bottom-sheet>` — BottomSheet (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-bottom-sheet open heading="Filters" height="half">…</ds-bottom-sheet>`. The phone's
 * dialog: a native `<dialog>` in the shadow root opened with `showModal()` (top layer, inert
 * background, Escape), covering the viewport with a scrim element and the surface anchored to the
 * bottom edge. `<ds-focus-scope>` wraps the surface, wraps Tab and returns focus to the opener on
 * close. Above the `layout.maxWidth.prose` viewport width (a `matchMedia` listener on the resolved
 * token) the same props render `<ds-dialog size="md">` instead, so screens are written once.
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
 * teach dismissal — the close button is visible on every dismissible sheet.
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

    /* The <dialog> fills the viewport and stacks its content at the bottom edge. */
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

    /* scrim: color.overlay.scrim, fading in with the enter duration and easing. */
    .scrim {
      position: absolute;
      inset: 0;
      background: var(--ds-bottom-sheet-scrim);
      opacity: 1;
      transition: opacity var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    /* focusScope: the <ds-focus-scope> host is the part element. Layout only. */
    .scope {
      position: relative;
      display: block;
      inline-size: 100%;
      min-inline-size: 0;
    }

    /* surface: color.overlay.surface (locked), top corners only, shadow, partGap. The block edges
       are padded once, here: inset at the start (headerPaddingTop when the handle is rendered) and
       inset plus the safe area at the end. No part carries block padding of its own. */
    .surface {
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      inline-size: 100%;
      min-inline-size: 0;
      gap: var(--ds-bottom-sheet-part-gap);
      padding-block-start: var(--ds-bottom-sheet-inset);
      padding-block-end: calc(var(--ds-bottom-sheet-inset) + env(safe-area-inset-bottom));
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      background: var(--color-overlay-surface);
      border-start-start-radius: var(--ds-bottom-sheet-radius);
      border-start-end-radius: var(--ds-bottom-sheet-radius);
      box-shadow: var(--ds-bottom-sheet-shadow);
      overflow: hidden;
      transform: translateY(0);
      /* enter: slide up from the bottom edge, with the scrim, same duration and easing. */
      transition: transform var(--ds-bottom-sheet-enter) var(--motion-easing-standard);
    }

    /* headerPaddingTop: the column's block-start padding above the handle, in place of inset. */
    :host(:not([no-dismiss]):not([no-drag-to-dismiss])) .surface {
      padding-block-start: var(--ds-bottom-sheet-header-padding-top);
    }

    /* height: content caps at 90% of the viewport; half and full set the block size outright and
       are deliberately not clamped by that cap, or full would stop short of near-full-screen. */
    :host([height='content']) .surface {
      max-block-size: 90dvh; /* literal-ok: the height prop's content cap, from the doc */
    }
    :host([height='half']) .surface {
      block-size: 50dvh; /* literal-ok: the height prop's half value, from the doc */
    }
    :host([height='full']) .surface {
      block-size: calc(100dvh - var(--layout-gutter)); /* literal-ok: full less the top gutter */
    }

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        transform: translateY(100%);
      }
    }

    /* exit: slide down with motion.easing.exit, from wherever the surface is; the scrim fades alike. */
    .closing .scrim,
    .closing .surface {
      transition-duration: var(--ds-bottom-sheet-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    .closing .scrim {
      opacity: 0;
    }
    .closing .surface {
      transform: translateY(100%);
    }

    /* The drag-follow tracks the finger directly, reduced motion or not. */
    .surface.dragging {
      transition: none;
    }

    /* A below-threshold release springs back to rest with the exit duration and the standard easing. */
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

    /* header: a column of the handle over the heading row, handleGap between them. Inline padding
       only — the surface owns the block edges, so nothing doubles between parts. */
    .header {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      gap: var(--ds-bottom-sheet-handle-gap);
      padding-inline: var(--ds-bottom-sheet-inset);
    }

    /* The header starts the drag gesture, so the browser must not pan on it. */
    .header.draggable {
      touch-action: none;
    }

    /* handle: color.foreground.muted (locked), a decorative pill — aria-hidden, never a focus stop. */
    .handle {
      align-self: center;
      inline-size: var(--ds-bottom-sheet-handle-width);
      block-size: var(--ds-bottom-sheet-handle-height);
      border-radius: var(--ds-bottom-sheet-handle-radius);
      background: var(--color-foreground-muted);
    }

    /* headerGap: the heading row's flex gap. Sheet-owned, not an anatomy part. With the heading
       hidden it is out of flow, so the close button's auto margin end-aligns it. */
    .title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-bottom-sheet-header-gap);
      min-inline-size: 0;
    }

    .heading {
      min-inline-size: 0;
    }

    /* focusRing / focusRingWidth (locked): drawn by the wrapper when the heading holds focus. */
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

    /* minTarget: size.target.comfortable (locked). Sheets are used one-handed, so the wrapper
       raises the pointer target; the Button keeps its own ghost / sm / icon-only size and colours. */
    .close-button {
      display: inline-flex;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      margin-inline-start: auto;
      min-inline-size: var(--size-target-comfortable);
      min-block-size: var(--size-target-comfortable);
    }

    /* body: the only region that scrolls, so the header and footer stay put. */
    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    /* inset reaches the body Box as inline padding through the Box's own hook (and through
       overrides when the caller set it); the Box keeps the zero block padding the surface provides. */
    .body > ds-box {
      --ds-box-padding-inline: var(--ds-bottom-sheet-inset);
    }

    /* footer: end-aligned action row, inline inset only. */
    .footer {
      flex: 0 0 auto;
      padding-inline: var(--ds-bottom-sheet-inset);
    }
    /* footerGap reaches the Stack through its own gap hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-bottom-sheet-footer-gap);
    }
  `;

  /**
   * Controlled visibility, as in Dialog. Controlled only — there is no uncontrolled mode; the
   * consumer owns `open` and the sheet requests changes through `close`, never changing it itself.
   */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The sheet's title and accessible name. May be visually hidden with `hideHeading`. */
  @property() accessor heading = '';

  /**
   * Keep the heading for assistive technology but do not render it (forwarded to Dialog above the
   * breakpoint). The accessible name is required regardless. Attribute: `hide-heading`.
   */
  @property({ type: Boolean, attribute: 'hide-heading' }) accessor hideHeading = false;

  /**
   * `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full`
   * is a near-full-screen sheet with the top gutter visible so the scrim still shows.
   */
  @property({ type: String, reflect: true }) accessor height: BottomSheetHeight = 'content';

  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. When false, only
   * the footer actions close it: the close button and the drag handle are not rendered, a scrim tap
   * and a drag do nothing, and Escape still reports with reason `escape`. Attribute: `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. Purely additive — Escape
   * always exists and the close button exists whenever the gesture does, so the handle is rendered
   * only when `dragToDismiss` and `dismissible` are both true. Attribute: `no-drag-to-dismiss`.
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

  /** Nothing else could take initial focus, so the heading takes tabindex -1 for the purpose. */
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
    // maxWidth is the breakpoint, read from the theme token: unresolved (no stylesheet, SSR) is a sheet.
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
      // Dialog plays its own exit; the sheet's closing beat has nothing to render.
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

  /**
   * Above the breakpoint the sheet is a Dialog: the same props and slots, the shared overrides
   * forwarded, and its `escape` / `close-button` / `scrim` / `action` reasons re-emitted as the
   * sheet's own. `drag` has no Dialog source, and Dialog's `opened` is not re-emitted.
   */
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
    // The handle is a drag affordance, so it only exists where the gesture does.
    const showHandle = this.dismissible && this.dragToDismiss;
    const showClose = this.dismissible;
    /** A header with no visible heading, no handle and no close button holds nothing: it is not rendered. */
    const showHeader = !this.hideHeading || showHandle || showClose;

    // Forwards reach the child's overrides only when set, so the CSS hook route keeps working otherwise.
    const inset = this.overrides?.inset;
    const bodyOverrides: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined =
      inset === undefined ? undefined : { paddingInline: inset };
    const footerGap = this.overrides?.footerGap;
    const footerOverrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined =
      footerGap === undefined ? undefined : { gap: footerGap };

    return html`
      <dialog
        class=${classMap({ closing: this.closing })}
        aria-modal="true"
        aria-label=${this.heading}
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
            ${showHeader
              ? html`<div
                  class=${classMap({ header: true, draggable: showHandle })}
                  part="header"
                  data-part="header"
                  @pointerdown=${this.handlePointerDown}
                  @pointermove=${this.handlePointerMove}
                  @pointerup=${this.handlePointerUp}
                  @pointercancel=${this.handlePointerCancel}
                >
                  ${showHandle
                    ? html`<span class="handle" part="handle" data-part="handle" aria-hidden="true"></span>`
                    : nothing}
                  <div class="title-row">
                    ${this.renderHeading()}
                    ${showClose
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
                </div>`
              : // No header to put it in: the visually hidden heading sits at the start of the column.
                this.renderHeading()}
            <div class="body" part="body" data-part="body">
              <ds-box .overrides=${bodyOverrides}><slot></slot></ds-box>
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

  /** Heading writes its own data-part, so the heading part is this sheet-owned wrapper around it. */
  private renderHeading(): TemplateResult {
    return html`
      <div
        class=${classMap({ heading: true, 'visually-hidden': this.hideHeading })}
        part="heading"
        data-part="heading"
      >
        <ds-heading level="2" tabindex=${ifDefined(this.headingIsFallback ? '-1' : undefined)}
          >${this.heading}</ds-heading
        >
      </div>
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
    // Escape reports even when the sheet is not dismissible.
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

  /**
   * The wrapper's extra target area activates the Button: it focuses it and requests close itself,
   * never reaching into the Button's internals or shadow root. A click on the Button is its own.
   */
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
        // ds-dialog catches the same submit and reports `action` through its own close.
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

  /**
   * Nothing is claimed on pointerdown, so a tap on the close button still activates it; the drag
   * begins only once the pointer has moved `dragSlop` downward on the handle or header.
   */
  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.dismissible || !this.dragToDismiss || !this.open || this.closing || this.gesture) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    // No coordinate, no gesture: an environment without real pointer data must not move the surface.
    if (!Number.isFinite(event.clientY)) {
      return;
    }
    this.gesture = {
      pointerId: event.pointerId,
      startY: event.clientY,
      originY: event.clientY,
      claimed: false,
      previous: null,
      last: null,
    };
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const gesture = this.gesture;
    const surface = this.surfaceEl;
    if (!gesture || !surface || event.pointerId !== gesture.pointerId || !Number.isFinite(event.clientY)) {
      return;
    }
    if (!gesture.claimed) {
      const moved = event.clientY - gesture.startY;
      const slop = lengthInPx(this, getComputedStyle(this).getPropertyValue(DRAG_SLOP_PROPERTY).trim());
      if (moved <= 0 || moved < slop) {
        return;
      }
      gesture.claimed = true;
      // The offset counts from where the slop was crossed, so the surface does not jump.
      gesture.originY = event.clientY;
      // Past the slop the header takes the move over from the child it started on.
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      surface.classList.remove('springing');
      surface.classList.add('dragging');
    }
    gesture.previous = gesture.last;
    gesture.last = { y: event.clientY, time: event.timeStamp };
    surface.style.transform = `translateY(${Math.max(0, event.clientY - gesture.originY)}px)`;
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

    const travelled = Number.isFinite(event.clientY) ? Math.max(0, event.clientY - gesture.originY) : 0;
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && travelled > sheetHeight * DISMISS_DISTANCE;
    // Velocity between the last two move samples before release; only downward speed counts.
    const { previous, last } = gesture;
    const velocity = previous && last && last.time > previous.time ? (last.y - previous.y) / (last.time - previous.time) : 0;
    const fastEnough = velocity > DISMISS_VELOCITY;

    if (this.open && (pastDistance || fastEnough)) {
      this.dispatchEvent(
        new CustomEvent<BottomSheetDragDismissDetail>('drag-dismiss', { bubbles: true, composed: true }),
      );
      this.dispatchClose('drag');
      // Hold the released offset until the consumer's next render, then exit or spring back from there.
      void this.settleRelease(surface);
      return;
    }
    void this.springBack(surface);
  };

  private readonly handlePointerCancel = (event: PointerEvent): void => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    this.gesture = null;
    const surface = this.surfaceEl;
    if (gesture.claimed && surface) {
      surface.classList.remove('dragging');
      void this.springBack(surface);
    }
  };

  /**
   * After a dismissing release: `updateComplete` after the `close` dispatch plus one animation
   * frame. If `open` is still true then, the sheet springs back; otherwise `handleClose` plays the
   * normal exit from the released offset.
   */
  private async settleRelease(surface: HTMLElement): Promise<void> {
    await this.updateComplete;
    await nextFrame();
    if (this.open && !this.closing && !this.wide && surface.isConnected) {
      await this.springBack(surface);
    }
  }

  /** A spring-back also finishes an interrupted enter animation: it returns the surface to rest. */
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
    // A released drag left an inline transform: dropping it plays the exit from that position.
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
