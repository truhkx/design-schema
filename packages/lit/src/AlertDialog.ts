import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Text.js';
import './Button.js';
import './Icon.js';
import './Stack.js';
import './FocusScope.js';
import type { DsFocusScope } from './FocusScope.js';
import type { IconOverridableBinding } from './Icon.js';
import type { StackOverridableBinding } from './Stack.js';

export type AlertDialogTone = 'danger' | 'warning' | 'info';
export type AlertDialogCancelReason = 'cancel' | 'escape';

/** Detail carried by the `confirm` CustomEvent (none). */
export type AlertDialogConfirmDetail = void;

/** Detail carried by the `cancel` CustomEvent. */
export interface AlertDialogCancelDetail {
  reason: AlertDialogCancelReason;
}

/** Overridable style hooks; see the `overrides` property. `surface`, `icon`, `focusRing` and `focusRingWidth` are locked and excluded. */
export type AlertDialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'textGap'
  | 'iconGap'
  | 'footerGap'
  | 'iconSize'
  | 'width'
  | 'gutter'
  | 'layer'
  | 'enter'
  | 'exit';

const HOOKS: Record<AlertDialogOverridableBinding, string> = {
  scrim: '--ds-alert-dialog-scrim',
  border: '--ds-alert-dialog-border',
  borderWidth: '--ds-alert-dialog-border-width',
  shadow: '--ds-alert-dialog-shadow',
  radius: '--ds-alert-dialog-radius',
  inset: '--ds-alert-dialog-inset',
  partGap: '--ds-alert-dialog-part-gap',
  textGap: '--ds-alert-dialog-text-gap',
  iconGap: '--ds-alert-dialog-icon-gap',
  footerGap: '--ds-alert-dialog-footer-gap',
  iconSize: '--ds-alert-dialog-icon-size',
  width: '--ds-alert-dialog-width',
  gutter: '--ds-alert-dialog-gutter',
  layer: '--ds-alert-dialog-layer',
  enter: '--ds-alert-dialog-enter',
  exit: '--ds-alert-dialog-exit',
};

/** copy.cancelLabel */
const COPY_CANCEL_LABEL = 'Cancel';

/** How many open `<ds-alert-dialog>`s hold the page-scroll lock, so a second one does not release it early. */
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
 * `<ds-alert-dialog>` — AlertDialog (category: overlay, APG pattern: alertdialog).
 *
 * A Dialog with one job: get a considered yes or no. `<ds-alert-dialog open
 * tone="danger" heading="Delete 3 files?" description="…"
 * confirm-label="Delete files">` — no slots: title, description and labels are
 * properties, so the element is fully described by attributes. The same shadow
 * `<dialog>` approach as `<ds-dialog>`, with `role="alertdialog"`: opened with
 * `showModal()` for the top layer and background inertness, the page scroll
 * locked while open, and `<ds-focus-scope>` (trapped, restoring focus)
 * wrapping Tab between the two buttons and returning focus to the opener on
 * close. Each anatomy part is an AlertDialog-owned wrapper carrying
 * `data-part`, since the composed children write their own.
 *
 * There is no close button and a scrim click does nothing, so the only ways
 * out are the two named ones. Escape and Cancel fire `cancel`; Confirm fires
 * `confirm`. Focus starts on Cancel so a reflexive Enter never confirms. The
 * element never closes itself: the consumer sets `open` false after handling
 * the event.
 *
 * ## When to use
 *
 * Before an action that destroys data, spends money, sends something that
 * cannot be recalled, or leaves a state the user cannot get back to — and only
 * when undo is not available. `danger` for destruction, `warning` for
 * consequential-but-recoverable, `info` for a decision with no downside that
 * still needs a choice.
 *
 * ## When not to use
 *
 * Not for a reversible action (provide undo), not to show information (Alert
 * or Dialog), not to collect input beyond a single typed confirmation (Dialog
 * with a Form), and not as a general "are you sure" habit.
 *
 * @fires confirm - The user chose the confirming action. The consumer performs it and closes.
 * @fires cancel - The user declined, with `{ reason: 'cancel' | 'escape' }`. A scrim click does nothing.
 */
@customElement('ds-alert-dialog')
export class DsAlertDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: contents;
      --ds-alert-dialog-scrim: var(--color-overlay-scrim);
      --ds-alert-dialog-border: var(--color-border);
      --ds-alert-dialog-border-width: var(--border-width-thin);
      --ds-alert-dialog-shadow: var(--shadow-overlay);
      --ds-alert-dialog-radius: var(--radius-lg);
      --ds-alert-dialog-inset: var(--layout-inset-lg);
      --ds-alert-dialog-part-gap: var(--layout-gap-loose);
      --ds-alert-dialog-text-gap: var(--layout-gap-tight);
      --ds-alert-dialog-icon-gap: var(--layout-gap-normal);
      --ds-alert-dialog-footer-gap: var(--layout-gap-tight);
      --ds-alert-dialog-icon-size: var(--font-size-lg);
      --ds-alert-dialog-width: var(--layout-max-width-prose);
      --ds-alert-dialog-gutter: var(--layout-gutter);
      --ds-alert-dialog-layer: var(--layer-dialog);
      --ds-alert-dialog-enter: var(--motion-duration-base);
      --ds-alert-dialog-exit: var(--motion-duration-fast);
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
      /* Only a non-top-layer fallback honours this; the top layer ignores z-index. */
      z-index: var(--ds-alert-dialog-layer);
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
      background: var(--ds-alert-dialog-scrim);
      opacity: 1;
      transition: opacity var(--ds-alert-dialog-enter) var(--motion-easing-standard);
    }

    .scope {
      position: relative;
      display: flex;
      box-sizing: border-box;
      inline-size: min(var(--ds-alert-dialog-width), calc(100% - 2 * var(--ds-alert-dialog-gutter)));
      max-block-size: calc(100% - 2 * var(--ds-alert-dialog-gutter));
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-inline-size: 0;
      max-block-size: 100%;
      overflow-y: auto;
      gap: var(--ds-alert-dialog-part-gap);
      padding: var(--ds-alert-dialog-inset);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
      border-style: solid;
      border-width: var(--ds-alert-dialog-border-width);
      border-color: var(--ds-alert-dialog-border);
      border-radius: var(--ds-alert-dialog-radius);
      box-shadow: var(--ds-alert-dialog-shadow);
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-alert-dialog-enter) var(--motion-easing-standard),
        transform var(--ds-alert-dialog-enter) var(--motion-easing-standard);
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
      transition-duration: var(--ds-alert-dialog-exit);
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

    /* The icon sits inline with the text block; partGap measures from this whole row. */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-alert-dialog-icon-gap);
    }

    /* icon: color.status.{tone}.icon, locked — no hook; forwarded to the Icon's overrides.color. */
    .icon {
      display: flex;
      flex: none;
    }
    /* iconSize reaches the Icon through its own hook (and through overrides when set). */
    .icon > ds-icon {
      --ds-icon-size: var(--ds-alert-dialog-icon-size);
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-alert-dialog-text-gap);
      min-inline-size: 0;
    }

    /* footerGap reaches the Stack through its own hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-alert-dialog-footer-gap);
    }
  `;

  /** Controlled visibility, as in Dialog. The consumer owns it; the element requests changes through `cancel` and `confirm`. */
  @property({ type: Boolean, reflect: true }) accessor open = false;

  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  @property() accessor heading = '';

  /** What will happen and whether it can be undone, in one or two sentences. Becomes the accessible description. */
  @property() accessor description = '';

  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger; warning and info → primary). */
  @property({ type: String, reflect: true }) accessor tone: AlertDialogTone = 'danger';

  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  @property({ attribute: 'confirm-label' }) accessor confirmLabel = '';

  /** The declining action. Defaults to `copy.cancelLabel`. */
  @property({ attribute: 'cancel-label' }) accessor cancelLabel: string | undefined;

  /** Blocks confirm while a precondition is unmet. Forwarded to the confirm Button's own `disabled`. Cancel always works. */
  @property({ type: Boolean, attribute: 'confirm-disabled' }) accessor confirmDisabled = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>>
    | undefined;

  /** The exit transition is playing: the dialog stays rendered a beat past `open` turning false. */
  @state() private accessor closing = false;

  @query('dialog') private accessor dialogEl!: HTMLDialogElement | null;
  @query('.scope') private accessor scopeEl!: DsFocusScope | null;
  @query('.scrim') private accessor scrimEl!: HTMLElement | null;
  @query('.surface') private accessor surfaceEl!: HTMLElement | null;
  @query('[data-part="cancelButton"] ds-button') private accessor cancelButtonEl!: HTMLElement | null;

  private scrollLocked = false;
  private closingProgrammatically = false;
  /** Escape was already reported from a non-cancelable `cancel` that the native close follows. */
  private escapeReported = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'AlertDialog');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
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
    if (
      import.meta.env.DEV &&
      (changed.has('open') || changed.has('heading') || changed.has('description') || changed.has('confirmLabel'))
    ) {
      this.warnInDev();
    }
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.open && !this.closing) {
      return nothing;
    }
    // icon is locked: the tone's status color always reaches the Icon's own color hook.
    const iconColor: TokenRef = `color.status.${this.tone}.icon`;
    // Other forwards reach the child's overrides only when set, so the CSS hook route keeps working otherwise.
    const iconSize = this.overrides?.iconSize;
    const iconOverrides: Partial<Record<IconOverridableBinding, TokenRef | undefined>> =
      iconSize === undefined ? { color: iconColor } : { color: iconColor, size: iconSize };
    const footerGap = this.overrides?.footerGap;
    const footerOverrides: Partial<Record<StackOverridableBinding, TokenRef | undefined>> | undefined =
      footerGap === undefined ? undefined : { gap: footerGap };
    const confirmVariant = this.tone === 'danger' ? 'danger' : 'primary';

    return html`
      <dialog
        class=${classMap({ closing: this.closing })}
        role="alertdialog"
        aria-modal="true"
        aria-label=${this.heading}
        aria-description=${this.description}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim"></div>
        <ds-focus-scope class="scope" part="focusScope" data-part="focusScope" .trapped=${true} .restoreFocus=${true}>
          <div class="surface" part="surface" data-part="surface">
            <div class="row">
              <div class="icon" part="icon" data-part="icon" aria-hidden="true">
                <ds-icon name=${this.tone} .overrides=${iconOverrides}></ds-icon>
              </div>
              <div class="text">
                <div part="heading" data-part="heading">
                  <ds-heading level="2">${this.heading}</ds-heading>
                </div>
                <div part="description" data-part="description">
                  <ds-text tone="muted">${this.description}</ds-text>
                </div>
              </div>
            </div>
            <div class="footer" part="footer" data-part="footer">
              <ds-stack direction="horizontal" justify="end" .overrides=${footerOverrides}>
                <div part="cancelButton" data-part="cancelButton">
                  <ds-button
                    variant="secondary"
                    size="md"
                    label=${this.cancelLabel ?? COPY_CANCEL_LABEL}
                    @press=${this.handleCancelPress}
                  ></ds-button>
                </div>
                <div part="confirmButton" data-part="confirmButton">
                  <ds-button
                    variant=${confirmVariant}
                    size="md"
                    label=${this.confirmLabel}
                    ?disabled=${this.confirmDisabled}
                    @press=${this.handleConfirmPress}
                  ></ds-button>
                </div>
              </ds-stack>
            </div>
          </div>
        </ds-focus-scope>
      </dialog>
    `;
  }

  private readonly handleCancel = (event: Event): void => {
    // The consumer owns `open`: never let the browser close the <dialog> on its own.
    event.preventDefault();
    // A non-cancelable cancel (Chromium without user activation) is followed by a native close.
    this.escapeReported = !event.cancelable;
    this.dispatchCancel('escape');
  };

  private readonly handleNativeClose = (): void => {
    if (this.closingProgrammatically) {
      this.closingProgrammatically = false;
      return;
    }
    // The browser closed the <dialog> itself. If no `cancel` announced it, that was Escape too.
    if (!this.escapeReported) {
      this.dispatchCancel('escape');
    }
    this.escapeReported = false;
    // Stay open until the consumer flips `open`.
    const dialog = this.dialogEl;
    if (this.open && dialog && !dialog.open) {
      dialog.showModal();
      this.cancelButtonEl?.focus();
    }
  };

  private readonly handleCancelPress = (event: Event): void => {
    // The composite reports `cancel`; the inner button's `press` stays inside.
    event.stopPropagation();
    this.dispatchCancel('cancel');
  };

  private readonly handleConfirmPress = (event: Event): void => {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent<AlertDialogConfirmDetail>('confirm', { bubbles: true, composed: true }));
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
    await this.scopeEl?.updateComplete;
    if (!this.open || this.closing) {
      return;
    }
    // Initial focus on Cancel, so Enter pressed reflexively never confirms.
    this.cancelButtonEl?.focus();
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
    // Flush style so transitions started by the closing class are registered.
    for (const part of parts) {
      void getComputedStyle(part).opacity;
    }
    const running = parts.flatMap((part) => part.getAnimations());
    await Promise.all(running.map((animation) => animation.finished.catch(() => undefined)));
  }

  private releaseScroll(): void {
    if (this.scrollLocked) {
      unlockPageScroll();
      this.scrollLocked = false;
    }
  }

  private dispatchCancel(reason: AlertDialogCancelReason): void {
    this.dispatchEvent(
      new CustomEvent<AlertDialogCancelDetail>('cancel', { detail: { reason }, bubbles: true, composed: true }),
    );
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as AlertDialogOverridableBinding[]) {
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
      console.warn('<ds-alert-dialog> requires a `heading`; it is the accessible name.', this);
    }
    if (!this.description) {
      console.warn('<ds-alert-dialog> requires a `description` stating the consequence.', this);
    }
    if (!this.confirmLabel) {
      console.warn('<ds-alert-dialog> requires a `confirm-label` restating the action.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-alert-dialog': DsAlertDialog;
  }
}
