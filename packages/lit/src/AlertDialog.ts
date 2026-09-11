import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Text.js';
import './Button.js';
import './Icon.js';
import './Stack.js';
import './FocusScope.js';

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
  layer: '--ds-alert-dialog-layer',
  enter: '--ds-alert-dialog-enter',
  exit: '--ds-alert-dialog-exit',
};

/** copy.cancelLabel */
const COPY_CANCEL_LABEL = 'Cancel';

/** How many `<ds-alert-dialog>` instances currently hold the body-scroll lock. */
let openCount = 0;

function lockBodyScroll(): void {
  openCount += 1;
  if (openCount === 1) {
    document.documentElement.style.overflow = 'hidden';
  }
}

function unlockBodyScroll(): void {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
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
 * `<ds-alert-dialog>` — AlertDialog (category: overlay, APG pattern: alertdialog).
 *
 * A Dialog with one job: get a considered yes or no. `<ds-alert-dialog open
 * tone="danger" heading="Delete 3 files?" description="…"
 * confirm-label="Delete files">` — no slots, since title, description and
 * labels are properties, so the element is fully described by attributes. A
 * native `<dialog>` in the shadow root is opened with `showModal()` for the
 * top layer, background inertness and `::backdrop` (the scrim); unlike Dialog
 * there is no close button and the scrim is inert to clicks, so the only ways
 * out are Cancel and Confirm. `<ds-focus-scope trapped>` wraps the footer so
 * Tab wraps between the two buttons; initial focus lands on Cancel so a
 * reflexive Enter never confirms by momentum.
 *
 * ## When to use
 *
 * Use before an action that destroys data, spends money, sends something
 * that cannot be recalled, or leaves a state the user cannot get back to —
 * and only when undo is not available. `tone="danger"` for destruction,
 * `warning` for consequential-but-recoverable, `info` for a decision with no
 * downside that still needs a choice.
 *
 * ## When not to use
 *
 * Not for a reversible action (offer undo instead), not to show information
 * (Alert or Dialog), not to collect input beyond a single typed confirmation
 * (Dialog with a form), and not as a general "are you sure" habit.
 *
 * @fires confirm - The user chose the confirming action. The consumer performs it and closes.
 * @fires cancel - The user declined, with `{ reason: 'cancel' | 'escape' }`. A scrim click does nothing.
 * @csspart surface - The padded, bordered surface (anatomy: surface).
 * @csspart focus-scope - The focus-trapping wrapper (anatomy: focusScope).
 * @csspart icon - The tone's status icon (anatomy: icon).
 * @csspart title - The `<ds-heading>` (anatomy: title).
 * @csspart description - The `<ds-text>` (anatomy: description).
 * @csspart footer - The button row (anatomy: footer).
 * @csspart cancel-button - The cancel `<ds-button>`.
 * @csspart confirm-button - The confirm `<ds-button>`.
 */
@customElement('ds-alert-dialog')
export class DsAlertDialog extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
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
      --ds-alert-dialog-layer: var(--layer-dialog);
      --ds-alert-dialog-enter: var(--motion-duration-base);
      --ds-alert-dialog-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    dialog {
      box-sizing: border-box;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      inline-size: 100%;
      max-inline-size: min(var(--ds-alert-dialog-width), calc(100vw - 2 * var(--layout-gutter)));
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      z-index: var(--ds-alert-dialog-layer);
    }

    /* scrim: color.overlay.scrim */
    dialog::backdrop {
      background: var(--ds-alert-dialog-scrim);
      transition: opacity var(--ds-alert-dialog-enter) var(--motion-easing-standard);
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
      padding: var(--ds-alert-dialog-inset);
      font-family: var(--font-family-body);
      /* surface: color.overlay.surface, locked — no override hook */
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

    .surface.closing {
      opacity: 0;
      transform: translateY(var(--space-2));
      transition-duration: var(--ds-alert-dialog-exit);
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

    .content {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-alert-dialog-icon-gap);
    }

    .icon {
      flex: none;
      /* iconSize: font.size.lg, forwarded to the child Icon's own --ds-icon-size hook */
      --ds-icon-size: var(--ds-alert-dialog-icon-size);
      /* icon: color.status.{tone}.icon, locked — no override hook */
    }
    :host([tone='danger']) .icon {
      color: var(--color-status-danger-icon);
    }
    :host([tone='warning']) .icon {
      color: var(--color-status-warning-icon);
    }
    :host([tone='info']) .icon {
      color: var(--color-status-info-icon);
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-alert-dialog-text-gap);
      min-inline-size: 0;
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }
  `;

  /** Controlled visibility, as in Dialog. The consumer owns it. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * The question or statement, as a level-2 Heading and the accessible name.
   * Named `heading`, not `title` — `HTMLElement` already defines `title` as
   * the tooltip attribute.
   */
  @property() heading!: string;

  /** What will happen and whether it can be undone. Becomes the accessible description. */
  @property() description!: string;

  /** The nature of the decision. Sets the status icon and the confirm button's variant. */
  @property({ reflect: true }) tone: AlertDialogTone = 'danger';

  /** The confirming action, restating it. Never "OK" or "Yes". */
  @property({ attribute: 'confirm-label' }) confirmLabel!: string;

  /** The declining action. Defaults to "Cancel". */
  @property({ attribute: 'cancel-label' }) cancelLabel?: string;

  /** Blocks confirm while a precondition is unmet. Cancel always works. */
  @property({ type: Boolean, reflect: true, attribute: 'confirm-disabled' }) confirmDisabled = false;

  /** Per-instance style overrides: `{ radius: 'radius.md' }`. Locked bindings (surface, icon, focusRing, focusRingWidth) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef>>;

  @query('dialog') private readonly dialogEl!: HTMLDialogElement;
  @query('.cancel') private readonly cancelButtonEl!: HTMLElement;

  private closing = false;
  private openerElement: Element | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'AlertDialog');
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
        this.playExit();
      }
    }
    this.warnInDev();
  }

  protected override render() {
    const cancelLabel = this.cancelLabel ?? COPY_CANCEL_LABEL;
    const confirmVariant = this.tone === 'danger' ? 'danger' : 'primary';

    return html`
      <dialog role="alertdialog" aria-modal="true" aria-labelledby="heading" aria-describedby="description" @cancel=${this.handleCancel}>
        <div class="surface${this.closing ? ' closing' : ''}" part="surface">
          <ds-focus-scope
            part="focus-scope"
            trapped
            ?active=${this.open}
            auto-focus="none"
            ?restore-focus=${false}
            style="display: flex; flex-direction: column; gap: var(--ds-alert-dialog-part-gap)"
          >
            <div class="content">
              <ds-icon class="icon" part="icon" name=${this.tone}></ds-icon>
              <div class="text">
                <ds-heading id="heading" part="title" level="2" size="lg" tabindex="-1">${this.heading}</ds-heading>
                <ds-text id="description" part="description" size="sm" tone="muted">${this.description}</ds-text>
              </div>
            </div>
            <ds-stack part="footer" direction="horizontal" justify="end" style="gap: var(--ds-alert-dialog-footer-gap)">
              <ds-button
                class="cancel"
                part="cancel-button"
                variant="secondary"
                size="sm"
                label=${cancelLabel}
                @press=${this.handleCancelPress}
              ></ds-button>
              <ds-button
                class="confirm"
                part="confirm-button"
                variant=${confirmVariant}
                size="sm"
                label=${this.confirmLabel}
                ?disabled=${this.confirmDisabled}
                @press=${this.handleConfirmPress}
              ></ds-button>
            </ds-stack>
          </ds-focus-scope>
        </div>
      </dialog>
    `;
  }

  private readonly handleCancel = (event: Event): void => {
    // The native default would close the <dialog> itself; the consumer owns `open` instead.
    event.preventDefault();
    this.dispatchCancel('escape');
  };

  private readonly handleCancelPress = (event: Event): void => {
    // Keep the button's `press` inside the dialog; consumers listen for `cancel`.
    event.stopPropagation();
    this.dispatchCancel('cancel');
  };

  private readonly handleConfirmPress = (event: Event): void => {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent<AlertDialogConfirmDetail>('confirm', { bubbles: true, composed: true }));
  };

  private handleOpen(): void {
    this.closing = false;
    this.openerElement = getDeepActiveElement();
    lockBodyScroll();
    this.dialogEl.showModal();
    this.cancelButtonEl?.focus();
  }

  private playExit(): void {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = (): void => {
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

  private restoreFocus(): void {
    const opener = this.openerElement;
    this.openerElement = null;
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
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
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.heading) {
      console.warn('<ds-alert-dialog> requires a `heading`, used as the accessible name.', this);
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
