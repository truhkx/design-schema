import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Icon.js';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

/** Detail carried by the `dismiss` CustomEvent (none). */
export type AlertDismissDetail = void;

/** copy.dismissLabel */
const COPY_DISMISS_LABEL = 'Dismiss';

type LabelledInternals = ElementInternals & { ariaLabelledByElements?: Element[] | null };

/** Overridable style hooks; see the `overrides` property. `background`, `foreground`, `bodyColor` and `icon` are locked and excluded. */
export type AlertOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'padding'
  | 'gap'
  | 'partGap'
  | 'iconSize'
  | 'headingWeight'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'dismissMargin';

const HOOKS: Record<AlertOverridableBinding, string> = {
  border: '--ds-alert-border',
  borderWidth: '--ds-alert-border-width',
  radius: '--ds-alert-radius',
  padding: '--ds-alert-padding',
  gap: '--ds-alert-gap',
  partGap: '--ds-alert-part-gap',
  iconSize: '--ds-alert-icon-size',
  headingWeight: '--ds-alert-heading-weight',
  fontFamily: `--ds-alert-font-family`,
  fontSize: '--ds-alert-font-size',
  lineHeight: '--ds-alert-line-height',
  dismissMargin: '--ds-alert-dismiss-margin',
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
 * shadow root: the tone icon as `<ds-icon name={tone}>`, a content column
 * with the heading as a `<p>` in `headingWeight` (not a heading element, so
 * it does not disturb the outline) and the default slot, and, when
 * `dismissible`, a ghost `sm` icon-only `<ds-button>` labelled "Dismiss" with
 * a `<ds-icon name="close">` leading icon, used unchanged (no `::part`
 * restyling) and pulled into the corner with `dismissMargin`. Dismissing
 * stops the inner `press`, moves focus onward and dispatches a composed
 * `dismiss` CustomEvent; the consumer removes the element.
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
 * @csspart heading - The heading paragraph (anatomy: heading).
 * @csspart body - The body wrapper (anatomy: body).
 * @csspart dismiss - The dismiss `<ds-button>` (anatomy: dismissButton).
 */
@customElement('ds-alert')
export class DsAlert extends LitElement {
  static override styles = css`
    :host {
      display: block;
      --ds-alert-border-width: var(--border-width-thin);
      --ds-alert-radius: var(--radius-md);
      --ds-alert-padding: var(--space-md);
      --ds-alert-gap: var(--space-3);
      --ds-alert-part-gap: var(--space-1);
      --ds-alert-icon-size: var(--font-size-lg);
      --ds-alert-heading-weight: var(--font-weight-semibold);
      --ds-alert-font-family: var(--font-family-body);
      --ds-alert-font-size: var(--font-size-md);
      --ds-alert-line-height: var(--font-line-height-normal);
      --ds-alert-dismiss-margin: var(--space-1);
      font-family: var(--ds-alert-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* border: color.status.{tone}.border */
    :host([tone='info']) {
      --ds-alert-border: var(--color-status-info-border);
    }
    :host([tone='success']) {
      --ds-alert-border: var(--color-status-success-border);
    }
    :host([tone='warning']) {
      --ds-alert-border: var(--color-status-warning-border);
    }
    :host([tone='danger']) {
      --ds-alert-border: var(--color-status-danger-border);
    }

    .container {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: var(--ds-alert-gap);
      padding: var(--ds-alert-padding);
      border: var(--ds-alert-border-width) solid var(--ds-alert-border);
      border-radius: var(--ds-alert-radius);
      font-size: var(--ds-alert-font-size);
      line-height: var(--ds-alert-line-height);
      /* bodyColor: color.foreground, locked — long messages read as text, not colored emphasis */
      color: var(--color-foreground);
    }

    /* background: color.status.{tone}.background, locked */
    :host([tone='info']) .container {
      background: var(--color-status-info-background);
    }
    :host([tone='success']) .container {
      background: var(--color-status-success-background);
    }
    :host([tone='warning']) .container {
      background: var(--color-status-warning-background);
    }
    :host([tone='danger']) .container {
      background: var(--color-status-danger-background);
    }

    /* iconSize: font.size.lg via the icon's own --ds-icon-size hook */
    .icon {
      flex: none;
      --ds-icon-size: var(--ds-alert-icon-size);
      /* Align with the first line of text. */
      margin-block-start: calc(
        (var(--ds-alert-font-size) * var(--ds-alert-line-height) - var(--ds-alert-icon-size)) / 2
      );
    }
    /* icon: color.status.{tone}.icon, locked */
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
      gap: var(--ds-alert-part-gap);
      min-inline-size: 0;
    }

    .heading {
      margin: 0;
      font-weight: var(--ds-alert-heading-weight);
    }
    /* foreground: color.status.{tone}.foreground, locked */
    :host([tone='info']) .heading {
      color: var(--color-status-info-foreground);
    }
    :host([tone='success']) .heading {
      color: var(--color-status-success-foreground);
    }
    :host([tone='warning']) .heading {
      color: var(--color-status-warning-foreground);
    }
    :host([tone='danger']) .heading {
      color: var(--color-status-danger-foreground);
    }

    .body {
      color: var(--color-foreground);
    }

    /* dismissMargin: pull the Button into the corner; it keeps its own colors, radius and focus ring */
    .dismiss {
      flex: none;
      margin-block: calc(-1 * var(--ds-alert-dismiss-margin));
      margin-inline-end: calc(-1 * var(--ds-alert-dismiss-margin));
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

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (background, foreground, bodyColor, icon) are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<AlertOverridableBinding, TokenRef>>;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Alert');
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('live')) {
      // role="status" implies aria-live="polite" and role="alert" implies assertive.
      this.internals.role = this.live === 'off' ? null : this.live;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncAccessibleName();
  }

  protected override render() {
    const hasHeading = Boolean(this.heading) || this.querySelector('[slot="heading"]') !== null;
    return html`
      <div class="container" part="container">
        <ds-icon class="icon" part="icon" name=${this.tone}></ds-icon>
        <div class="content">
          ${hasHeading
            ? html`<p class="heading" part="heading">
                <slot name="heading" @slotchange=${this.handleContentSlotChange}
                  >${this.heading ?? nothing}</slot
                >
              </p>`
            : nothing}
          <div class="body" part="body"><slot @slotchange=${this.handleContentSlotChange}></slot></div>
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
                <ds-icon slot="leading-icon" name="close" inline></ds-icon>
              </ds-button>
            `
          : nothing}
      </div>
    `;
  }

  /** Light-DOM slot content (heading or body) changed without a property change; re-render to keep `hasHeading` and the accessible name current. */
  private handleContentSlotChange(): void {
    this.requestUpdate();
  }

  /**
   * The region is named by the heading when present, else by the body (a
   * status region is named by its content) — an Alert always has a name.
   * `ariaLabelledByElements` points cross-root at the shadow-DOM element
   * where supported. Otherwise the target's flattened text becomes a
   * literal `aria-label` attribute, not `internals.ariaLabel`: ARIAMixin
   * values set through ElementInternals aren't visible to the
   * accessible-name computation the test suite uses (only real attributes
   * are), though real assistive tech reads either.
   */
  private syncAccessibleName(): void {
    const internals = this.internals as LabelledInternals;
    const target =
      this.renderRoot.querySelector<HTMLElement>('.heading') ??
      this.renderRoot.querySelector<HTMLElement>('.body');
    if ('ariaLabelledByElements' in this.internals) {
      internals.ariaLabelledByElements = target ? [target] : null;
      this.removeAttribute('aria-label');
      return;
    }
    // No cross-root ariaLabelledByElements support: read the assigned (or
    // fallback) slot content directly, since `target.textContent` does not
    // see light-DOM nodes projected into a shadow-root `<slot>`.
    const slot = target?.querySelector<HTMLSlotElement>('slot') ?? null;
    const text = (slot?.assignedNodes({ flatten: true }) ?? [])
      .map((node) => node.textContent ?? '')
      .join(' ')
      .trim();
    if (text) {
      this.setAttribute('aria-label', text);
    } else {
      this.removeAttribute('aria-label');
    }
  }

  private handleDismiss(event: Event): void {
    // Keep the button's `press` inside the alert; consumers listen for `dismiss`.
    event.stopPropagation();
    this.moveFocusOnward();
    this.dispatchEvent(
      new CustomEvent<AlertDismissDetail>('dismiss', { bubbles: true, composed: true }),
    );
  }

  /**
   * The consumer will remove the alert, so focus moves onward first: to the
   * next focusable element after the alert in reading order, or to the
   * previous one when there is none, so focus is never lost. Left alone if
   * nothing outside the alert is focusable.
   */
  private moveFocusOnward(): void {
    const active = document.activeElement;
    if (active === null || (active !== this && !this.contains(active))) {
      return;
    }
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (candidate) => !this.contains(candidate),
    );
    const next = candidates.find(
      (candidate) => (this.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    );
    if (next) {
      next.focus();
      return;
    }
    const before = candidates.filter(
      (candidate) => (this.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING) !== 0,
    );
    before[before.length - 1]?.focus();
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as AlertOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-alert': DsAlert;
  }
}
