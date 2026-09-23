import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Text.js';
import './Button.js';
import './Icon.js';
import './Box.js';
import './Stack.js';
import './FocusScope.js';
import { focusableIn, type DsFocusScope } from './FocusScope.js';
import type { StackOverridableBinding } from './Stack.js';
import type { BoxOverridableBinding } from './Box.js';

export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogInitialFocus = 'first' | 'title' | 'close';
export type DialogCloseReason = 'escape' | 'close-button' | 'scrim' | 'action';

/** Detail carried by the `close` CustomEvent. */
export interface DialogCloseDetail {
  reason: DialogCloseReason;
}

/** Detail carried by the `opened` CustomEvent (none). */
export type DialogOpenedDetail = void;

/** Overridable style hooks; see the `overrides` property. `surface`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type DialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'gutter'
  | 'headerGap'
  | 'footerGap'
  | 'descriptionGap'
  | 'widthSm'
  | 'widthMd'
  | 'widthLg'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<DialogOverridableBinding, string> = {
  scrim: '--ds-dialog-scrim',
  border: '--ds-dialog-border',
  borderWidth: '--ds-dialog-border-width',
  shadow: '--ds-dialog-shadow',
  radius: '--ds-dialog-radius',
  inset: '--ds-dialog-inset',
  partGap: '--ds-dialog-part-gap',
  gutter: '--ds-dialog-gutter',
  headerGap: '--ds-dialog-header-gap',
  footerGap: '--ds-dialog-footer-gap',
  descriptionGap: '--ds-dialog-description-gap',
  widthSm: '--ds-dialog-width-sm',
  widthMd: '--ds-dialog-width-md',
  widthLg: '--ds-dialog-width-lg',
  layer: '--ds-dialog-layer',
  enter: '--ds-dialog-enter',
  exit: '--ds-dialog-exit',
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

/**
 * The first tabbable element in a slot's assigned content, by exactly the rules the trapped
 * `<ds-focus-scope>` around the surface uses — `focusableIn` is shared for this, so initial focus
 * cannot land somewhere Tab would then refuse to return to.
 */
function firstFocusableIn(node: Element): HTMLElement | null {
  return focusableIn(node)[0] ?? null;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** How many open `<ds-dialog>`s hold the page-scroll lock, so a second one does not release it early. */
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

/**
 * `<ds-dialog>` — Dialog (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-dialog open heading="Rename project">…</ds-dialog>`. A native `<dialog>`
 * in the shadow root is opened with `showModal()` / `close()` as the reflected
 * `open` property changes, which gives the top layer, background inertness and
 * Escape. The `<dialog>` covers the viewport with a transparent `::backdrop`;
 * the scrim is a real element filling it and the surface sits centred above
 * it, so a click whose target is the scrim is the scrim click.
 * `<ds-focus-scope>` (auto-focus `none`) wraps the surface: it wraps Tab
 * across the shadow content and the slotted body and footer, and returns focus
 * to the opener when the dialog closes; the dialog places initial focus itself
 * per `initialFocus`.
 *
 * Escape, the close button and a scrim click each request close through the
 * composed `close` event with a reason; the dialog never closes itself, the
 * consumer flips `open`. A slotted form submitted with `method="dialog"`
 * requests close with reason `action`.
 *
 * ## When to use
 *
 * A short task that must complete before the user continues and needs its own
 * space: rename, create-with-a-few-fields, choose from options with
 * consequences. Keep it to one screen of content.
 *
 * ## When not to use
 *
 * Not for a message that needs no decision (Alert or Toast), a destructive
 * confirmation (AlertDialog), content that benefits from the page staying
 * visible (Popover or Disclosure), navigation menus (Menu), or on a phone for
 * anything the thumb should reach (BottomSheet). Never open one without a user
 * action, and never nest dialogs.
 *
 * @fires close - Requests close, with `{ reason: 'escape' | 'close-button' | 'scrim' | 'action' }`.
 * @fires opened - Fired after the open transition ends and focus has moved in.
 * @slot - The body. Scrolls inside the surface when taller than the viewport.
 * @slot footer - The action row. Primary action first, then one secondary.
 */
@customElement('ds-dialog')
export class DsDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: contents;
      --ds-dialog-scrim: var(--color-overlay-scrim);
      /* Locked: not in the overrides type, but still a hook, themeable from page CSS. */
      --ds-dialog-surface: var(--color-overlay-surface);
      --ds-dialog-focus-ring: var(--color-border-focus);
      --ds-dialog-focus-ring-width: var(--border-width-focus);
      --ds-dialog-border: var(--color-border);
      --ds-dialog-border-width: var(--border-width-thin);
      --ds-dialog-shadow: var(--shadow-overlay);
      --ds-dialog-radius: var(--radius-lg);
      --ds-dialog-inset: var(--layout-inset-lg);
      --ds-dialog-part-gap: var(--layout-gap-loose);
      --ds-dialog-gutter: var(--layout-gutter);
      --ds-dialog-header-gap: var(--layout-gap-normal);
      --ds-dialog-footer-gap: var(--layout-gap-tight);
      --ds-dialog-description-gap: var(--layout-gap-tight);
      --ds-dialog-width-sm: var(--layout-max-width-prose);
      --ds-dialog-width-md: var(--layout-max-width-content);
      --ds-dialog-width-lg: var(--layout-max-width-content);
      --ds-dialog-layer: var(--layer-dialog);
      --ds-dialog-enter: var(--motion-duration-base);
      --ds-dialog-exit: var(--motion-duration-fast);
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
      place-items: center;
      /* Only a non-top-layer fallback honours this; the top layer ignores z-index. */
      z-index: var(--ds-dialog-layer);
      /* The native <dialog> closes at the start of the exit (focus restore, page no longer inert);
         these keep it painted in the top layer until the exit transition ends. */
      transition:
        display var(--ds-dialog-exit) allow-discrete,
        overlay var(--ds-dialog-exit) allow-discrete;
    }

    dialog[open] {
      display: grid;
    }

    /* The scrim is the element below; the native backdrop stays clear. */
    dialog::backdrop {
      background: transparent;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: var(--ds-dialog-scrim);
      opacity: 1;
      transition: opacity var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    /* The <ds-focus-scope> host carries no part: it writes its own data-part="scope", and it only
       traps Tab and restores focus. */
    ds-focus-scope {
      min-inline-size: 0;
    }

    /* focusScope: the Dialog-owned part element inside the scope, wrapping the surface. */
    .scope {
      display: block;
      min-inline-size: 0;
    }

    .surface {
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      /* widthMd: layout.maxWidth.content × 0.75; an override replaces the base, the × 0.75 stays. */
      inline-size: calc(var(--ds-dialog-width-md) * 0.75);
      /* gutter: the minimum space between the surface and the viewport edge. */
      max-inline-size: calc(100vw - 2 * var(--ds-dialog-gutter));
      max-block-size: calc(100dvh - 2 * var(--ds-dialog-gutter));
      gap: var(--ds-dialog-part-gap);
      /* inset: the surface column carries the block padding, once at the top and once at the bottom. */
      padding-block: var(--ds-dialog-inset);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      background: var(--ds-dialog-surface);
      border-style: solid;
      border-width: var(--ds-dialog-border-width);
      border-color: var(--ds-dialog-border);
      border-radius: var(--ds-dialog-radius);
      box-shadow: var(--ds-dialog-shadow);
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-dialog-enter) var(--motion-easing-standard),
        transform var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    :host([size='sm']) .surface {
      inline-size: var(--ds-dialog-width-sm);
    }
    :host([size='lg']) .surface {
      inline-size: var(--ds-dialog-width-lg);
    }

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    /* exit: motion.duration.fast with motion.easing.exit, scrim and surface alike */
    .closing .scrim,
    .closing .surface {
      opacity: 0;
      transition-duration: var(--ds-dialog-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    .closing .surface {
      transform: translateY(var(--space-2));
    }

    @media (prefers-reduced-motion: reduce) {
      dialog,
      .scrim,
      .surface {
        transition: none;
      }
      /* The rise is motion too: no translate at either end under reduced motion. */
      .surface,
      .closing .surface {
        transform: none;
      }
    }

    /* header: inline inset only — the surface owns the block padding, so nothing doubles between parts. */
    .header {
      display: flex;
      flex: 0 0 auto;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-dialog-header-gap);
      padding-inline: var(--ds-dialog-inset);
    }

    /* The titles group: Dialog-owned, not an anatomy part. */
    .titles {
      display: flex;
      flex-direction: column;
      gap: var(--ds-dialog-description-gap);
      min-inline-size: 0;
    }

    .close-button {
      flex: none;
    }

    /* The heading wrapper draws the ring when the heading holds focus (tabindex -1). */
    .heading ds-heading:focus {
      outline: none;
    }
    .heading:has(:focus-visible) {
      outline: var(--ds-dialog-focus-ring-width) solid var(--ds-dialog-focus-ring);
      outline-offset: var(--ds-dialog-focus-ring-width);
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

    /* body: the only region that scrolls, so header and footer stay put. */
    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }
    /* inset reaches the body Box as inline padding only (and through overrides when set); the
       Box keeps zero block padding, which the surface's block padding already provides. */
    .body > ds-box {
      --ds-box-padding-inline: var(--ds-dialog-inset);
    }

    /* footer: end-aligned action row, inline inset only. */
    .footer {
      flex: 0 0 auto;
      padding-inline: var(--ds-dialog-inset);
    }
    /* footerGap reaches the Stack through its own hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-dialog-footer-gap);
    }
  `;

  /** Controlled visibility. The consumer owns it; the dialog requests changes through `close`. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. */
  @property() accessor heading = '';

  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  @property() accessor description: string | undefined;

  /** Visually hide the heading while it remains the accessible name. */
  @property({ type: Boolean, attribute: 'hide-heading' }) accessor hideHeading = false;

  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  @property({ type: String, reflect: true }) accessor size: DialogSize = 'md';

  /**
   * Escape, the close button and a scrim click all request close. Set false for a dialog that
   * must be answered: the close button is not rendered and the scrim does nothing; Escape still
   * fires `close` with reason `escape`. Attribute: `no-dismiss`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor dismissible = true;

  /** Where focus lands on open: the first focusable control, the title, or the close button. */
  @property({ type: String, attribute: 'initial-focus', reflect: true }) accessor initialFocus: DialogInitialFocus =
    'first';

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;

  /** The exit transition is playing: the dialog stays rendered a beat past `open` turning false. */
  @state() private accessor closing = false;

  /** A light-DOM child is assigned to the `footer` slot; the footer wrapper renders only then. */
  @state() private accessor hasFooter = false;

  /** The heading became the focus fallback of `first` / `close`, so it takes tabindex -1 too. */
  @state() private accessor headingIsFallback = false;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('ds-focus-scope') private accessor scopeEl!: DsFocusScope | null;
  @query('.scrim') private accessor scrimEl!: HTMLElement | null;
  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('ds-heading') private accessor headingEl!: HTMLElement | null;
  @query('.close-button ds-button') private accessor closeButtonEl!: HTMLElement | null;
  @query('slot:not([name])') private accessor bodySlotEl!: HTMLSlotElement | null;
  @query('slot[name="footer"]') private accessor footerSlotEl!: HTMLSlotElement | null;

  private scrollLocked = false;
  private closingProgrammatically = false;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported = false;

  /** Watches light-DOM children for `slot="footer"`; the callback only compares and sets state. */
  private readonly footerObserver: MutationObserver = new MutationObserver(() => this.syncHasFooter());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Dialog');
    this.addEventListener('submit', this.handleSubmit);
    this.syncHasFooter();
    this.footerObserver.observe(this, { childList: true, subtree: true, attributeFilter: ['slot'] });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('submit', this.handleSubmit);
    this.footerObserver.disconnect();
    this.releaseScroll();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('open')) {
      if (this.open) {
        this.closing = false;
      } else if (changed.get('open') === true) {
        this.closing = true;
      }
    }
    if (changed.has('initialFocus') || changed.has('dismissible') || (changed.has('open') && this.open)) {
      this.headingIsFallback = false;
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open')) {
      if (this.open) {
        void this.handleOpen();
      } else if (this.closing) {
        void this.handleClose();
      }
    }
    if (import.meta.env.DEV && (changed.has('heading') || changed.has('dismissible') || changed.has('open'))) {
      this.warnInDev();
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.open && !this.closing) {
      return nothing;
    }
    const description = this.description || undefined;
    const headingFocusable = this.initialFocus === 'title' || this.headingIsFallback;
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
        role="dialog"
        aria-modal="true"
        aria-label=${this.heading}
        aria-description=${ifDefined(description)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim" @click=${this.handleScrimClick}></div>
        <ds-focus-scope auto-focus="none" .active=${!this.closing}>
          <div class="scope" part="focusScope" data-part="focusScope">
            <div class="surface" part="surface" data-part="surface">
              <div class="header" part="header" data-part="header">
                <div class="titles">
                  <div
                    class=${classMap({ heading: true, 'visually-hidden': this.hideHeading })}
                    part="heading"
                    data-part="heading"
                  >
                    <ds-heading level="2" tabindex=${ifDefined(headingFocusable ? '-1' : undefined)}
                      >${this.heading}</ds-heading
                    >
                  </div>
                  ${description
                    ? html`<div part="description" data-part="description">
                        <ds-text tone="muted">${description}</ds-text>
                      </div>`
                    : nothing}
                </div>
                ${this.dismissible
                  ? html`<div class="close-button" part="closeButton" data-part="closeButton">
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
              <div class="body" part="body" data-part="body">
                <ds-box .overrides=${bodyOverrides}><slot></slot></ds-box>
              </div>
              ${this.hasFooter
                ? html`<div class="footer" part="footer" data-part="footer">
                    <ds-stack direction="horizontal" justify="end" wrap .overrides=${footerOverrides}
                      ><slot name="footer"></slot
                    ></ds-stack>
                  </div>`
                : nothing}
            </div>
          </div>
        </ds-focus-scope>
      </dialog>
    `;
  }

  private readonly handleCancel = (event: Event): void => {
    // The consumer owns `open`: never let the browser close the <dialog> on its own.
    event.preventDefault();
    if (!this.open) {
      return;
    }
    // A non-cancelable cancel (Chromium without user activation) is followed by a native close.
    this.escapeReported = !event.cancelable;
    this.dispatchClose('escape');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    if (!this.open) {
      return;
    }
    // The browser closed the <dialog> itself. If no `cancel` announced it, that was Escape too.
    if (!this.escapeReported) {
      this.dispatchClose('escape');
    }
    this.escapeReported = false;
    const dialog = this.dialogEl;
    if (dialog && !dialog.open) {
      dialog.showModal();
      void this.applyInitialFocus();
    }
  };

  private readonly handleScrimClick = (event: MouseEvent): void => {
    if (!this.open || !this.dismissible || event.target !== event.currentTarget) {
      return;
    }
    this.dispatchClose('scrim');
  };

  private readonly handleCloseButtonPress = (event: Event): void => {
    // The composite reports `close`; the inner button's `press` stays inside.
    event.stopPropagation();
    if (this.open) {
      this.dispatchClose('close-button');
    }
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
      this.dispatchClose('action');
    }
  };

  private syncHasFooter(): void {
    const next = Array.from(this.children).some((child) => child.slot === 'footer');
    if (next !== this.hasFooter) {
      this.hasFooter = next;
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
    if (!this.open || this.closing) {
      return;
    }
    await this.applyInitialFocus();
    const ran = await this.transitionsSettled();
    if (ran === 0) {
      // Nothing to wait for (reduced motion, zero duration): the next frame after focus moves in.
      await nextFrame();
    }
    if (!this.open || this.closing) {
      return;
    }
    this.dispatchEvent(new CustomEvent<DialogOpenedDetail>('opened', { bubbles: true, composed: true }));
  }

  private async handleClose(): Promise<void> {
    // Focus restore runs at the start of the exit: closing the native <dialog> now lifts the page's
    // inertness and returns focus to the element focused at showModal() time, while the CSS
    // `display`/`overlay` transitions keep it painted in the top layer for the exit.
    const dialog = this.dialogEl;
    if (dialog?.open) {
      this.closingProgrammatically = true;
      dialog.close();
    }
    this.releaseScroll();
    await this.transitionsSettled();
    if (this.open) {
      return;
    }
    // Rendering nothing disconnects the FocusScope, which restores the opener if focus is still unplaced.
    this.closing = false;
  }

  /** Waits for the scrim and surface transitions; resolves with how many were running. */
  private async transitionsSettled(): Promise<number> {
    const parts = [this.scrimEl, this.surfaceEl].filter((el): el is HTMLElement => el !== null);
    // Flush style so transitions started by @starting-style or the closing class are registered.
    for (const part of parts) {
      void getComputedStyle(part).opacity;
    }
    const running = parts.flatMap((part) => part.getAnimations());
    await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
    return running.length;
  }

  /**
   * `title` → the heading. `first` → body, footer, close button, heading.
   * `close` → the close button; without one (not dismissible), the `first` order.
   */
  private async applyInitialFocus(): Promise<void> {
    const close = this.dismissible ? this.closeButtonEl : null;
    let target: HTMLElement | null = null;
    if (this.initialFocus === 'close') {
      target = close;
    }
    if (this.initialFocus !== 'title' && !target) {
      const bodyFirst = this.bodySlotEl ? firstFocusableIn(this.bodySlotEl) : null;
      const footerFirst = this.footerSlotEl ? firstFocusableIn(this.footerSlotEl) : null;
      target = bodyFirst ?? footerFirst ?? close;
    }
    target?.focus();
    if (target && this.focusIsInside()) {
      return;
    }
    // Either nothing was focusable, or the candidate refused focus (the walker matches the scope's
    // Tab rules, which do not test visibility, so a `hidden` control can be picked). Focus must
    // still move in: the heading takes tabindex -1 as the last fallback.
    if (this.initialFocus !== 'title' && !this.headingIsFallback) {
      this.headingIsFallback = true;
      await this.updateComplete;
    }
    this.headingEl?.focus();
  }

  /** Focus rests on something inside the dialog — not on the scrim, and not on the page behind it. */
  private focusIsInside(): boolean {
    let active: Element | null = document.activeElement;
    while (active) {
      if (active === this) {
        return true;
      }
      active = active.shadowRoot?.activeElement ?? null;
    }
    return false;
  }

  private releaseScroll(): void {
    if (this.scrollLocked) {
      unlockPageScroll();
      this.scrollLocked = false;
    }
  }

  private dispatchClose(reason: DialogCloseReason): void {
    this.dispatchEvent(
      new CustomEvent<DialogCloseDetail>('close', { detail: { reason }, bubbles: true, composed: true }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DialogOverridableBinding[]) {
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
    if (!this.open) {
      return;
    }
    if (!this.heading) {
      console.warn('<ds-dialog> requires a `heading`; it is the accessible name.', this);
    }
    if (!this.dismissible && !this.hasFooter) {
      console.warn('<ds-dialog no-dismiss> has no footer: provide the answers in the footer.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-dialog': DsDialog;
  }
}
