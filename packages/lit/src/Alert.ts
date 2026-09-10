import { LitElement, css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './Button.js';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

/** Detail carried by the `dismiss` CustomEvent (none). */
export type AlertDismissDetail = void;

/** copy.dismissLabel */
const COPY_DISMISS_LABEL = 'Dismiss';

/** Leading icon by tone: info circle, check circle, warning triangle, error octagon. */
const ICONS: Record<AlertTone, TemplateResult> = {
  info: html`<path
    d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8.75 7v4.5h-1.5V7h1.5ZM8 4.25a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"
  />`,
  success: html`<path
    d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Zm2.72 3.22 1.06 1.06L7 11.56 4.22 8.78l1.06-1.06L7 9.44l3.72-3.72Z"
  />`,
  warning: html`<path
    d="M8 1.5 15.25 14H.75L8 1.5Zm0 3L3.35 12.5h9.3L8 4.5Zm.75 2.5v3.5h-1.5V7h1.5ZM8 11.05a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z"
  />`,
  danger: html`<path
    d="M5.05 1h5.9L15 5.05v5.9L10.95 15h-5.9L1 10.95v-5.9L5.05 1Zm.62 1.5L2.5 5.67v4.66l3.17 3.17h4.66l3.17-3.17V5.67L10.33 2.5H5.67ZM8.75 4.5V9h-1.5V4.5h1.5ZM8 10.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"
  />`,
};

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), ' +
  'ds-button, ds-link, ds-input, ds-checkbox, ds-switch, ds-radio-group, ds-disclosure';

/**
 * `<ds-alert>` — Alert (category: feedback, APG pattern: alert).
 *
 * `<ds-alert tone="danger" live="alert" heading="Payment failed">…</ds-alert>`.
 * The `role` (`status` or `alert`, none when `live` is `off`) is set on the
 * host element via `ElementInternals`, so the live region is the host itself
 * in the light DOM tree where assistive technology expects it. Inside the
 * shadow root: the tone icon, a content column with the heading as a `<p>` in
 * `titleWeight` (not a heading element, so it does not disturb the outline)
 * and the default slot, and, when `dismissible`, a ghost `sm` icon-only
 * `<ds-button>` labelled "Dismiss", used unchanged (no `::part` restyling) and
 * pulled into the corner with `dismissMargin`. Dismissing stops the inner
 * `press`, moves focus onward and dispatches a composed `dismiss` CustomEvent;
 * the consumer removes the element.
 *
 * ## When to use
 *
 * Use an Alert for a message that relates to the current view and should stay
 * visible: a failed save above the form, an expiring trial, a success
 * confirmation after submit. Choose `tone` by what the user should do: `info`
 * to know, `success` to relax, `warning` to be careful, `danger` to fix
 * something. Use `dismissible` for messages the user can safely put away.
 *
 * @fires dismiss - Fired when the user activates the dismiss button. The consumer removes the alert.
 * @slot - The message body. Text and Links; no headings or form controls.
 * @slot heading - Rich heading content; replaces the `heading` property text.
 * @csspart container - The bordered box (anatomy: container).
 * @csspart icon - The tone icon (anatomy: icon).
 * @csspart heading - The heading paragraph (anatomy: title).
 * @csspart body - The body wrapper (anatomy: body).
 * @csspart dismiss - The dismiss `<ds-button>` (anatomy: dismissButton).
 */
@customElement('ds-alert')
export class DsAlert extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    .container {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-md);
      border: var(--border-width-thin) solid var(--color-status-info-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-md);
      line-height: var(--font-line-height-normal);
      color: var(--color-foreground);
      background: var(--color-status-info-background);
    }

    /* background / border / foreground / icon: color.status.{tone}.* */
    :host([tone='info']) .container {
      border-color: var(--color-status-info-border);
      background: var(--color-status-info-background);
    }
    :host([tone='success']) .container {
      border-color: var(--color-status-success-border);
      background: var(--color-status-success-background);
    }
    :host([tone='warning']) .container {
      border-color: var(--color-status-warning-border);
      background: var(--color-status-warning-background);
    }
    :host([tone='danger']) .container {
      border-color: var(--color-status-danger-border);
      background: var(--color-status-danger-background);
    }

    .icon {
      flex: none;
      inline-size: var(--font-size-lg);
      block-size: var(--font-size-lg);
      /* Align with the first line of text. */
      margin-block-start: calc((var(--font-size-md) * var(--font-line-height-normal) - var(--font-size-lg)) / 2);
      color: var(--color-status-info-icon);
      fill: currentColor;
    }
    :host([tone='info']) .icon {
      color: var(--color-status-info-icon);
    }
    :host([tone='success']) .icon {
      color: var(--color-status-success-icon);
    }
    :host([tone='warning']) .icon {
      color: var(--color-status-warning-icon);
    }
    :host([tone='danger']) .icon {
      color: var(--color-status-danger-icon);
    }

    .content {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      gap: var(--space-1);
      min-inline-size: 0;
    }

    .title {
      margin: 0;
      font-weight: var(--font-weight-semibold);
      color: var(--color-status-info-foreground);
    }
    :host([tone='info']) .title {
      color: var(--color-status-info-foreground);
    }
    :host([tone='success']) .title {
      color: var(--color-status-success-foreground);
    }
    :host([tone='warning']) .title {
      color: var(--color-status-warning-foreground);
    }
    :host([tone='danger']) .title {
      color: var(--color-status-danger-foreground);
    }

    /* bodyColor: the page foreground so long messages read as text */
    .body {
      color: var(--color-foreground);
    }

    /* dismissMargin: pull the Button into the corner; it keeps its own colors, radius and focus ring */
    .dismiss {
      flex: none;
      margin-block: calc(-1 * var(--space-1));
      margin-inline-end: calc(-1 * var(--space-1));
    }
  `;

  /** What kind of message this is. Sets the colors, the icon, and (with `live`) the announcement. */
  @property({ reflect: true }) tone: AlertTone = 'info';

  /** A short bold heading for the message. Optional for one-line messages. Never forwarded as the native `title`. */
  @property() heading?: string;

  /** How the alert is announced when it appears. `status` is polite; `alert` interrupts; `off` for alerts present at load. */
  @property({ reflect: true }) live: AlertLive = 'status';

  /** Shows a dismiss button at the end of the alert. */
  @property({ type: Boolean, reflect: true }) dismissible = false;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('live')) {
      // role="status" implies aria-live="polite" and role="alert" implies assertive.
      this.internals.role = this.live === 'off' ? null : this.live;
    }
  }

  protected override render() {
    const hasHeading = Boolean(this.heading) || this.querySelector('[slot="heading"]') !== null;
    return html`
      <div class="container" part="container">
        <svg class="icon" part="icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16">
          ${ICONS[this.tone] ?? ICONS.info}
        </svg>
        <div class="content">
          ${hasHeading
            ? html`<p class="title" part="heading"><slot name="heading">${this.heading ?? nothing}</slot></p>`
            : nothing}
          <div class="body" part="body"><slot></slot></div>
        </div>
        ${this.dismissible
          ? html`
              <ds-button
                class="dismiss"
                part="dismiss"
                variant="ghost"
                size="sm"
                icon-only
                label=${COPY_DISMISS_LABEL}
                @press=${this.handleDismiss}
              >
                <svg slot="leading-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
                  <path d="m4.22 3.16 3.78 3.78 3.78-3.78 1.06 1.06L9.06 8l3.78 3.78-1.06 1.06L8 9.06l-3.78 3.78-1.06-1.06L6.94 8 3.16 4.22l1.06-1.06Z" />
                </svg>
              </ds-button>
            `
          : nothing}
      </div>
    `;
  }

  private handleDismiss(event: Event): void {
    // Keep the button's `press` inside the alert; consumers listen for `dismiss`.
    event.stopPropagation();
    this.moveFocusOnward();
    this.dispatchEvent(
      new CustomEvent<AlertDismissDetail>('dismiss', { bubbles: true, composed: true }),
    );
  }

  /** The consumer will remove the alert, so focus moves to the next focusable element first. */
  private moveFocusOnward(): void {
    const active = document.activeElement;
    if (active === null || (active !== this && !this.contains(active))) {
      return;
    }
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE));
    const next = candidates.find(
      (candidate) =>
        !this.contains(candidate) &&
        (this.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
    next?.focus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-alert': DsAlert;
  }
}
