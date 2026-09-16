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
import type { DsFocusScope } from './FocusScope.js';
import type { StackOverridableBinding } from './Stack.js';

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
  | 'headerGap'
  | 'footerGap'
  | 'descriptionGap'
  | 'widthSm'
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
  headerGap: '--ds-dialog-header-gap',
  footerGap: '--ds-dialog-footer-gap',
  descriptionGap: '--ds-dialog-description-gap',
  widthSm: '--ds-dialog-width-sm',
  layer: '--ds-dialog-layer',
  enter: '--ds-dialog-enter',
  exit: '--ds-dialog-exit',
};

/** footerGap's token, forwarded to the footer Stack as `overrides.gap` when no override is set. */
const FOOTER_GAP_TOKEN: TokenRef = 'layout.gap.tight';

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
 * Escape. The `<dialog>` covers the viewport; the scrim is a real element
 * filling it and the surface sits centred above it, so a click that lands on
 * the scrim is the scrim click. `<ds-focus-scope>` (auto-focus `none`) wraps
 * the surface: it wraps Tab across the shadow content and the slotted body
 * and footer, and returns focus to the opener when the dialog closes; the
 * dialog places initial focus itself per `initialFocus`.
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
      --ds-dialog-border: var(--color-border);
      --ds-dialog-border-width: var(--border-width-thin);
      --ds-dialog-shadow: var(--shadow-overlay);
      --ds-dialog-radius: var(--radius-lg);
      --ds-dialog-inset: var(--layout-inset-lg);
      --ds-dialog-part-gap: var(--layout-gap-loose);
      --ds-dialog-header-gap: var(--layout-gap-normal);
      --ds-dialog-footer-gap: var(--layout-gap-tight);
      --ds-dialog-description-gap: var(--layout-gap-tight);
      --ds-dialog-width-sm: var(--layout-max-width-prose);
      --ds-dialog-layer: var(--layer-dialog);
      --ds-dialog-enter: var(--motion-duration-base);
      --ds-dialog-exit: var(--motion-duration-fast);
      /* md is 3/4 of content, lg is content: derived from layout.maxWidth.content, not new tokens */
      --ds-dialog-width: calc(var(--layout-max-width-content) * 0.75);
    }

    :host([hidden]) {
      display: none;
    }

    :host([size='sm']) {
      --ds-dialog-width: var(--ds-dialog-width-sm);
    }
    :host([size='md']) {
      --ds-dialog-width: calc(var(--layout-max-width-content) * 0.75);
    }
    :host([size='lg']) {
      --ds-dialog-width: var(--layout-max-width-content);
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
      z-index: var(--ds-dialog-layer);
    }

    dialog[open] {
      display: grid;
      place-items: center;
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

    .scope {
      position: relative;
      display: flex;
      box-sizing: border-box;
      inline-size: min(var(--ds-dialog-width), calc(100% - 2 * var(--layout-gutter)));
      max-block-size: calc(100% - 2 * var(--layout-gutter));
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-inline-size: 0;
      max-block-size: 100%;
      gap: var(--ds-dialog-part-gap);
      padding: var(--ds-dialog-inset);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
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

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    /* exit: motion.duration.fast with motion.easing.exit */
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
      .scrim,
      .surface {
        transition: none;
      }
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-dialog-header-gap);
    }

    .titles {
      display: flex;
      flex-direction: column;
      gap: var(--ds-dialog-description-gap);
      min-inline-size: 0;
    }

    .close-button {
      flex: none;
    }

    /* The heading takes focus for initialFocus: title. */
    .heading:focus {
      outline: none;
    }
    .heading:focus-visible {
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

  /** Where focus lands on open: the first focusable control in the body, the title, or the close button. */
  @property({ type: String, attribute: 'initial-focus', reflect: true }) accessor initialFocus: DialogInitialFocus =
    'first';

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;

  /** The exit transition is playing: the dialog stays rendered a beat past `open` turning false. */
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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Dialog');
    this.addEventListener('submit', this.handleSubmit);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('submit', this.handleSubmit);
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
    const footerGap = this.overrides?.footerGap ?? FOOTER_GAP_TOKEN;
    const footerOverrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> = { gap: footerGap };

    return html`
      <dialog
        class=${classMap({ closing: this.closing })}
        aria-modal="true"
        aria-label=${this.heading}
        aria-description=${ifDefined(description)}
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
            <div class="header" part="header" data-part="header">
              <div class="titles">
                <ds-heading
                  class=${classMap({ heading: true, 'visually-hidden': this.hideHeading })}
                  part="heading"
                  data-part="heading"
                  level="2"
                  tabindex="-1"
                  >${this.heading}</ds-heading
                >
                ${description
                  ? html`<ds-text part="description" data-part="description">${description}</ds-text>`
                  : nothing}
              </div>
              ${this.dismissible
                ? html`<ds-button
                    class="close-button"
                    part="closeButton"
                    data-part="closeButton"
                    variant="ghost"
                    size="sm"
                    icon-only
                    label=${COPY_CLOSE_LABEL}
                    @press=${this.handleCloseButtonPress}
                    ><ds-icon slot="leading-icon" name="close"></ds-icon
                  ></ds-button>`
                : nothing}
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
    this.applyInitialFocus();
    await this.transitionsSettled();
    if (!this.open || this.closing) {
      return;
    }
    this.dispatchEvent(new CustomEvent<DialogOpenedDetail>('opened', { bubbles: true, composed: true }));
  }

  private async handleClose(): Promise<void> {
    await this.updateComplete;
    await this.transitionsSettled();
    if (this.open) {
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
      void getComputedStyle(part).opacity;
    }
    const running = parts.flatMap((part) => part.getAnimations());
    await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
  }

  private applyInitialFocus(): void {
    const heading = this.headingEl;
    const close = this.dismissible ? this.closeButtonEl : null;
    const bodyFirst = this.bodySlotEl ? firstFocusableIn(this.bodySlotEl) : null;
    let target: HTMLElement | null;
    if (this.initialFocus === 'title') {
      target = heading;
    } else if (this.initialFocus === 'close') {
      // A non-dismissible dialog has no close button: the body's first control, then the heading.
      target = close ?? bodyFirst ?? heading;
    } else {
      const footerFirst = this.footerSlotEl ? firstFocusableIn(this.footerSlotEl) : null;
      target = bodyFirst ?? footerFirst ?? close ?? heading;
    }
    target?.focus();
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
    if (!this.dismissible && this.querySelector(':scope > [slot="footer"]') === null) {
      console.warn('<ds-dialog no-dismiss> has no footer: provide the answers in the footer.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-dialog': DsDialog;
  }
}
