import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
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

/** Overridable style hooks; see the `overrides` property. `background`, `foreground`, `bodyColor` and `icon` are locked and excluded. */
export type AlertOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'padding'
  | 'gap'
  | 'partGap'
  | 'iconSize'
  | 'headingSize'
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
  headingSize: '--ds-alert-heading-size',
  headingWeight: '--ds-alert-heading-weight',
  fontFamily: '--ds-alert-font-family',
  fontSize: '--ds-alert-font-size',
  lineHeight: '--ds-alert-line-height',
  dismissMargin: '--ds-alert-dismiss-margin',
};

/** The web "next focusable" set: a, button, input, select, textarea, [tabindex] ≥ 0, contenteditable. */
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable]:not([contenteditable="false"])';

/** Default token for the `iconSize` binding, forwarded to the Icon as `overrides.size`. */
const ICON_SIZE_TOKEN = 'font.size.lg' as TokenRef;

/**
 * `<ds-alert>` — Alert (category: feedback, APG pattern: alert).
 *
 * `<ds-alert tone="danger" live="alert" heading="Payment failed">…</ds-alert>`.
 * A plain `role` attribute on the host (`status` or `alert`, removed when
 * `live` is `off`) makes the host the live region in the light DOM, and a
 * plain `aria-label` names it with the heading text, else the body text.
 * Inside the shadow root: the tone `<ds-icon>` in a box as tall as the first
 * line, a content column with the heading as a `<p>` (not a heading element,
 * so it does not disturb the outline) and the default slot, and, when
 * `dismissible`, a ghost `sm` icon-only `<ds-button>` labelled
 * copy.dismissLabel in a wrapper pulled into the corner with `dismissMargin`.
 * Dismissing stops the inner `press`, moves focus onward and dispatches a
 * composed `dismiss` CustomEvent; the consumer removes the element.
 *
 * @fires dismiss - Fired when the user activates the dismiss button. The consumer removes the alert.
 * @slot - The message body. Text and Links; no headings or form controls.
 */
@customElement('ds-alert')
export class DsAlert extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-alert-body-color: var(--color-foreground);
      --ds-alert-border-width: var(--border-width-thin);
      --ds-alert-radius: var(--radius-md);
      --ds-alert-padding: var(--space-md);
      --ds-alert-gap: var(--space-3);
      --ds-alert-part-gap: var(--space-1);
      --ds-alert-icon-size: var(--font-size-lg);
      --ds-alert-heading-size: var(--font-size-md);
      --ds-alert-heading-weight: var(--font-weight-semibold);
      --ds-alert-font-family: var(--font-family-body);
      --ds-alert-font-size: var(--font-size-md);
      --ds-alert-line-height: var(--font-line-height-normal);
      --ds-alert-dismiss-margin: var(--space-1);
    }

    :host([hidden]) {
      display: none;
    }

    /* {tone} bindings: background and foreground (locked) and border. The icon binding is locked by
       its non-text contrast pair and reaches the Icon through its own overrides.color, so it has no
       hook here and the icon box carries no color of its own. */
    :host([tone='info']) {
      --ds-alert-background: var(--color-status-info-background);
      --ds-alert-foreground: var(--color-status-info-foreground);
      --ds-alert-border: var(--color-status-info-border);
    }
    :host([tone='success']) {
      --ds-alert-background: var(--color-status-success-background);
      --ds-alert-foreground: var(--color-status-success-foreground);
      --ds-alert-border: var(--color-status-success-border);
    }
    :host([tone='warning']) {
      --ds-alert-background: var(--color-status-warning-background);
      --ds-alert-foreground: var(--color-status-warning-foreground);
      --ds-alert-border: var(--color-status-warning-border);
    }
    :host([tone='danger']) {
      --ds-alert-background: var(--color-status-danger-background);
      --ds-alert-foreground: var(--color-status-danger-foreground);
      --ds-alert-border: var(--color-status-danger-border);
    }

    .container {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: var(--ds-alert-gap);
      padding: var(--ds-alert-padding);
      background: var(--ds-alert-background);
      border: var(--ds-alert-border-width) solid var(--ds-alert-border);
      border-radius: var(--ds-alert-radius);
      font-family: var(--ds-alert-font-family);
      line-height: var(--ds-alert-line-height);
    }

    /* The icon box is as tall as the first line (or the icon, when larger); the Icon is centred in it.
       The hooks it reads are set on the host and inherited. Color and size reach the Icon through
       its own overrides, never through this box. */
    .icon {
      --ds-alert-first-line: calc(var(--ds-alert-font-size) * var(--ds-alert-line-height));
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      block-size: max(var(--ds-alert-first-line), var(--ds-alert-icon-size));
      line-height: 0;
    }
    /* The element sets data-has-heading on its root; no :has() query is used. */
    :host([data-has-heading]) .icon {
      --ds-alert-first-line: calc(var(--ds-alert-heading-size) * var(--ds-alert-line-height));
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
      color: var(--ds-alert-foreground);
      font-size: var(--ds-alert-heading-size);
      font-weight: var(--ds-alert-heading-weight);
    }

    .body {
      color: var(--ds-alert-body-color);
      font-size: var(--ds-alert-font-size);
    }

    /* dismissMargin: pull the Button into the corner; it keeps its own colors, radius and focus ring */
    .dismiss {
      flex: none;
      display: flex;
      margin-block-start: calc(-1 * var(--ds-alert-dismiss-margin));
      margin-inline-end: calc(-1 * var(--ds-alert-dismiss-margin));
    }
  `;

  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  @property({ type: String, reflect: true }) accessor tone: AlertTone = 'info';

  /** A short bold first line for the message. Optional for one-line messages. Never forwarded as the native `title`. */
  @property() accessor heading: string | undefined;

  /** How the alert is announced when it appears. `status` is polite; `alert` interrupts (blocking errors only); `off` for alerts present at load. */
  @property({ type: String, reflect: true }) accessor live: AlertLive = 'status';

  /** Shows a dismiss button at the end of the alert. Activating it fires `dismiss`; the consumer removes the alert. */
  @property({ type: Boolean, reflect: true }) accessor dismissible = false;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings (background, foreground, bodyColor, icon) are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;

  /** Body text edits do not change a property; watch the light DOM to keep the accessible name current. */
  private readonly bodyObserver: MutationObserver = new MutationObserver(() => this.syncAccessibleName());

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Alert');
    this.bodyObserver.observe(this, { childList: true, subtree: true, characterData: true });
    this.syncAccessibleName();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.bodyObserver.disconnect();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('live')) {
      // role="status" implies aria-live="polite" and role="alert" implies assertive; set only the role.
      const role = this.live === 'off' ? null : this.live;
      if (role === null) {
        if (this.hasAttribute('role')) this.removeAttribute('role');
      } else if (this.getAttribute('role') !== role) {
        this.setAttribute('role', role);
      }
    }
    if (changed.has('heading')) {
      // The icon box is as tall as the first line, which is the heading when there is one. The CSS
      // reads this attribute on the root rather than a `:has()` query, exactly as React does.
      const hasHeading = this.heading !== undefined && this.heading !== '';
      if (hasHeading !== this.hasAttribute('data-has-heading')) {
        if (hasHeading) this.setAttribute('data-has-heading', '');
        else this.removeAttribute('data-has-heading');
      }
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('heading')) {
      this.syncAccessibleName();
    }
  }

  protected override render(): TemplateResult {
    // An empty heading is the same as no heading: no heading element, and the name falls back to the body.
    const heading = this.heading === undefined || this.heading === '' ? undefined : this.heading;
    return html`
      <div class="container" part="container" data-part="container">
        <span class="icon" part="icon" data-part="icon">
          <ds-icon
            name=${this.tone}
            .overrides=${{
              color: `color.status.${this.tone}.icon` as TokenRef,
              size: this.overrides?.iconSize ?? ICON_SIZE_TOKEN,
            }}
          ></ds-icon>
        </span>
        <div class="content">
          ${heading !== undefined
            ? html`<p class="heading" part="heading" data-part="heading">${heading}</p>`
            : nothing}
          <div class="body" part="body" data-part="body"><slot></slot></div>
        </div>
        ${this.dismissible
          ? html`<span class="dismiss" part="dismissButton" data-part="dismissButton">
              <ds-button variant="ghost" size="sm" icon-only label=${COPY_DISMISS_LABEL} @press=${this.handleDismiss}>
                <ds-icon slot="leading-icon" name="close" inline></ds-icon>
              </ds-button>
            </span>`
          : nothing}
      </div>
    `;
  }

  /**
   * The region is named by its own content: the heading text when present,
   * else the body text. A plain `aria-label` attribute, since ids never cross
   * the shadow root and tests read the name from the attribute.
   */
  private syncAccessibleName(): void {
    const name = (this.heading || this.textContent || '').replace(/\s+/g, ' ').trim();
    if (name === '') {
      if (this.hasAttribute('aria-label')) this.removeAttribute('aria-label');
    } else if (this.getAttribute('aria-label') !== name) {
      this.setAttribute('aria-label', name);
    }
  }

  private handleDismiss(event: Event): void {
    // Keep the button's `press` inside the alert; consumers listen for `dismiss`.
    event.stopPropagation();
    this.moveFocusOnward();
    this.dispatchEvent(new CustomEvent<AlertDismissDetail>('dismiss', { bubbles: true, composed: true }));
  }

  /**
   * The consumer will remove the alert, so focus moves first to the next
   * focusable element after the alert in reading order, or to the previous
   * one when there is none. Left alone if nothing outside the alert is
   * focusable. Walks the flat tree (open shadow roots and slot assignments)
   * so focusables inside other components count.
   */
  private moveFocusOnward(): void {
    if (!this.matches(':focus-within')) {
      return;
    }
    let previous: HTMLElement | undefined;
    let next: HTMLElement | undefined;
    let passed = false;
    const visit = (node: Element): boolean => {
      if (node === this) {
        passed = true;
        return false;
      }
      if (node instanceof HTMLElement && node.matches(FOCUSABLE) && isFocusCandidate(node)) {
        if (passed) {
          next = node;
          return true;
        }
        previous = node;
      }
      const children: Element[] =
        node instanceof HTMLSlotElement
          ? node.assignedElements({ flatten: true })
          : Array.from(node.shadowRoot?.children ?? node.children);
      for (const child of children) {
        if (visit(child)) return true;
      }
      return false;
    };
    visit(document.documentElement);
    (next ?? previous)?.focus();
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

/** Skips negative tabindex, disabled, inert and unrendered elements. */
function isFocusCandidate(el: HTMLElement): boolean {
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0) return false;
  if (el.matches(':disabled')) return false;
  // `hidden` / `display: none` on the element or an ancestor, or computed `visibility: hidden`; no size check.
  if (!el.checkVisibility({ visibilityProperty: true })) return false;
  for (let node: Node | null = el; node; node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)) {
    if (node instanceof HTMLElement && node.inert) return false;
  }
  return true;
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-alert': DsAlert;
  }
}
