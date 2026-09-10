import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
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

/** Elements considered a focusable "control" when locating the first one in the body. */
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

/** How many `<ds-dialog>` instances currently hold the body-scroll lock, so a second dialog does not release it early. */
let openDialogCount = 0;

function lockBodyScroll(): void {
  openDialogCount += 1;
  if (openDialogCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  openDialogCount = Math.max(0, openDialogCount - 1);
  if (openDialogCount === 0) {
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

/**
 * `<ds-dialog>` — Dialog (category: overlay, APG pattern: dialog-modal).
 *
 * `<ds-dialog open heading="Rename project">…</ds-dialog>`. A native `<dialog>`
 * in the shadow root is opened with `showModal()`/`close()` as the reflected
 * `open` property changes, which gives the top layer, background inertness and
 * `::backdrop` (the scrim) for free. `<ds-focus-scope trapped>` wraps the
 * header, body and footer so Tab wraps within the dialog even though the body
 * and footer are slotted light-DOM content sitting outside the shadow
 * `<dialog>` in the composed tree; initial focus (`initialFocus`) and focus
 * restore to the opener are handled by the dialog itself. Escape, the close
 * button and a scrim click each request a close through the composed `close`
 * event with a reason; the dialog never closes itself; the consumer flips
 * `open`.
 *
 * ## When to use
 *
 * Use a Dialog for a short task that must complete before the user continues
 * and needs its own space: rename, create-with-a-few-fields, choose from
 * options with consequences, confirm something reversible with a form
 * attached. Keep it to one screen of content; a dialog that scrolls much is a
 * page.
 *
 * ## When not to use
 *
 * Not for a message that needs no decision (Alert or Toast), a destructive
 * confirmation (AlertDialog), content that benefits from the page context
 * staying visible (Popover or Disclosure), navigation menus (Menu), or on a
 * phone for anything the thumb should reach (BottomSheet). Never open on page
 * load without a user action, and never nest dialogs.
 *
 * @fires close - Requests close, with `{ reason: 'escape' | 'close-button' | 'scrim' | 'action' }`.
 *   The consumer sets `open` to false (or not).
 * @fires opened - Fired after the open transition ends and focus has moved in.
 * @slot - The body. Scrolls independently when taller than the viewport.
 * @slot footer - The action row. Primary action first, then one secondary.
 * @csspart surface - The padded, bordered surface (anatomy: surface).
 * @csspart header - The header row (anatomy: header).
 * @csspart title - The `<ds-heading>` (anatomy: title).
 * @csspart description - The `<ds-text>` (anatomy: description).
 * @csspart body - The body wrapper (anatomy: body).
 * @csspart footer - The footer row (anatomy: footer).
 * @csspart close-button - The close `<ds-button>` (anatomy: closeButton).
 */
@customElement('ds-dialog')
export class DsDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
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
      --ds-dialog-max-width: calc(var(--layout-max-width-content) * 0.75);
      --ds-dialog-layer: var(--layer-dialog);
      --ds-dialog-enter: var(--motion-duration-base);
      --ds-dialog-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* widthSm / md (3/4 content) / lg (content): layout.maxWidth.{prose,content} derived, not new tokens */
    :host([size='sm']) {
      --ds-dialog-max-width: var(--ds-dialog-width-sm);
    }
    :host([size='md']) {
      --ds-dialog-max-width: calc(var(--layout-max-width-content) * 0.75);
    }
    :host([size='lg']) {
      --ds-dialog-max-width: var(--layout-max-width-content);
    }

    dialog {
      box-sizing: border-box;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      inline-size: 100%;
      max-inline-size: min(var(--ds-dialog-max-width), calc(100vw - 2 * var(--layout-gutter)));
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      z-index: var(--ds-dialog-layer);
    }

    /* scrim: color.overlay.scrim */
    dialog::backdrop {
      background: var(--ds-dialog-scrim);
      transition: opacity var(--ds-dialog-enter) var(--motion-easing-standard);
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
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      padding: var(--ds-dialog-inset);
      font-family: var(--font-family-body);
      /* surface: color.overlay.surface, locked — no override hook */
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

    /* exit: motion.duration.fast with motion.easing.exit */
    .surface.closing {
      opacity: 0;
      transform: translateY(var(--space-2));
      transition-duration: var(--ds-dialog-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @starting-style {
      dialog[open] .surface {
        opacity: 0;
        transform: translateY(var(--space-2));
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

    .close {
      flex: none;
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
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

    .body {
      min-block-size: 0;
      overflow-y: auto;
    }
  `;

  /** Controlled visibility. The consumer owns it; the dialog requests changes through `close`. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * The dialog's title, rendered as a level-2 Heading and used as the
   * accessible name. Named `heading`, not `title` — `HTMLElement` already
   * defines `title` as the tooltip attribute.
   */
  @property() heading!: string;

  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  @property() description?: string;

  /** Visually hides the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  @property({ type: Boolean, attribute: 'hide-heading' }) hideHeading = false;

  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  @property({ reflect: true }) size: DialogSize = 'md';

  /**
   * Escape, the close button and a scrim click all request close. `false` for a dialog
   * that must be answered (then provide the answers in the footer): the close button is
   * not rendered and the scrim does nothing; Escape still reports. Attribute is the
   * negation, `no-dismiss`, because a boolean attribute cannot express `false` for a prop
   * that defaults `true`.
   */
  @property({ attribute: 'no-dismiss', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  dismissible = true;

  /** Where focus lands on open: the first focusable control in the body (default), the title, or the close button. */
  @property({ attribute: 'initial-focus', reflect: true }) initialFocus: DialogInitialFocus = 'first';

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, focusRing, focusRingWidth) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<DialogOverridableBinding, TokenRef>>;

  @query('dialog') private readonly dialogEl!: HTMLDialogElement;
  @query('#heading') private readonly headingEl!: HTMLElement;
  @query('.close') private readonly closeButtonEl!: HTMLElement;

  /** Whether the exit transition is playing (kept open a beat past the `open` flip so it can animate out). */
  @state() private closing = false;

  private openerElement: Element | null = null;
  private closingProgrammatically = false;
  private suppressCloseSync = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Dialog');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.dialogEl?.open) {
      unlockBodyScroll();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('open')) {
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
    const hasDescription = Boolean(this.description);
    const hasFooter = this.querySelector('[slot="footer"]') !== null;
    const headingClasses = classMap({ 'heading--hidden': this.hideHeading });

    return html`
      <dialog
        aria-modal="true"
        aria-labelledby="heading"
        aria-describedby=${ifDefined(hasDescription ? 'description' : undefined)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @click=${this.handleDialogClick}
      >
        <div class="surface${this.closing ? ' closing' : ''}" part="surface">
          <ds-focus-scope
            trapped
            ?active=${this.open}
            auto-focus="none"
            ?restore-focus=${false}
            style="display: flex; flex-direction: column; gap: var(--ds-dialog-part-gap)"
          >
            <div class="header" part="header">
              <div class="titles">
                <ds-heading id="heading" part="title" level="2" size="lg" tabindex="-1" class=${headingClasses}
                  >${this.heading}</ds-heading
                >
                ${hasDescription
                  ? html`<ds-text id="description" part="description" size="sm" tone="muted"
                      >${this.description}</ds-text
                    >`
                  : nothing}
              </div>
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
            <ds-box class="body" part="body" style="overflow-y: auto; min-block-size: 0">
              <slot></slot>
            </ds-box>
            ${hasFooter
              ? html`
                  <ds-stack
                    part="footer"
                    direction="horizontal"
                    style="gap: var(--ds-dialog-footer-gap)"
                  >
                    <slot name="footer"></slot>
                  </ds-stack>
                `
              : nothing}
          </ds-focus-scope>
        </div>
      </dialog>
    `;
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
    // Keep the button's `press` inside the dialog; consumers listen for `close`.
    // Only rendered when dismissible, so no guard needed here.
    event.stopPropagation();
    this.dispatchClose('close-button');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // The dialog closed itself — most likely a slotted form submitted with formmethod="dialog".
    unlockBodyScroll();
    this.restoreFocus();
    this.suppressCloseSync = true;
    this.open = false;
    this.dispatchClose('action');
  };

  private handleOpen(): void {
    this.closing = false;
    this.openerElement = getDeepActiveElement();
    lockBodyScroll();
    this.dialogEl.showModal();
    this.applyInitialFocus();
    this.scheduleOpened();
  }

  private playExit(): void {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = (): void => {
      this.closingProgrammatically = true;
      this.dialogEl.close();
      unlockBodyScroll();
      this.restoreFocus();
      this.closing = false;
    };
    if (reduced) {
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
      if (event.target !== surface || event.propertyName !== 'opacity') {
        return;
      }
      surface.removeEventListener('transitionend', handleTransitionEnd);
      finish();
    };
    surface.addEventListener('transitionend', handleTransitionEnd);
  }

  private applyInitialFocus(): void {
    let target: HTMLElement | null;
    if (this.initialFocus === 'close') {
      // The close button does not render when non-dismissible; fall back rather than drop focus.
      target = this.closeButtonEl ?? this.findFirstBodyFocusable() ?? this.headingEl;
    } else if (this.initialFocus === 'title') {
      target = this.headingEl;
    } else {
      target = this.findFirstBodyFocusable() ?? this.closeButtonEl ?? this.headingEl;
    }
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

  private scheduleOpened(): void {
    const dispatch = (): void => {
      this.dispatchEvent(new CustomEvent<DialogOpenedDetail>('opened', { bubbles: true, composed: true }));
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      dispatch();
      return;
    }
    const surface = this.renderRoot.querySelector<HTMLElement>('.surface');
    if (!surface) {
      dispatch();
      return;
    }
    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target !== surface || event.propertyName !== 'opacity') {
        return;
      }
      surface.removeEventListener('transitionend', handleTransitionEnd);
      dispatch();
    };
    surface.addEventListener('transitionend', handleTransitionEnd);
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
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.heading) {
      console.warn('<ds-dialog> requires a `heading`, used as the accessible name.', this);
    }
    if (!this.dismissible && this.querySelector('[slot="footer"]') === null) {
      console.warn(
        '<ds-dialog dismissible="false"> with no footer has no way to complete or leave the task besides Escape.',
        this,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-dialog': DsDialog;
  }
}
