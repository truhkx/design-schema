import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';

/** Detail carried by the `escape-attempt` CustomEvent. */
export interface FocusScopeEscapeAttemptDetail {
  direction: 'forward' | 'backward';
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'audio[controls]',
  'video[controls]',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  if (el.hasAttribute('data-focus-sentinel') || el.hasAttribute('data-focus-scope-anchor')) {
    return false;
  }
  if (el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number(tabindex) < 0) {
    return false;
  }
  return el.matches(FOCUSABLE_SELECTOR);
}

/** Walks light DOM, slot assignments and open shadow roots in tree order. */
function collectFocusable(node: Element, results: HTMLElement[]): void {
  if (node.hasAttribute('inert') || node.getAttribute('aria-hidden') === 'true') {
    return;
  }
  if (isFocusable(node)) {
    results.push(node);
  }
  if (node instanceof HTMLSlotElement) {
    for (const assigned of node.assignedElements({ flatten: true })) {
      collectFocusable(assigned, results);
    }
    return;
  }
  const scope = node.shadowRoot ?? node;
  for (const child of Array.from(scope.children)) {
    collectFocusable(child, results);
  }
}

function getDeepActiveElement(root: Document | ShadowRoot = document): Element | null {
  const active = root.activeElement;
  if (active?.shadowRoot?.activeElement) {
    return getDeepActiveElement(active.shadowRoot);
  }
  return active;
}

function findFocusableInDocument(): HTMLElement[] {
  const results: HTMLElement[] = [];
  for (const child of Array.from(document.body.children)) {
    collectFocusable(child, results);
  }
  return results;
}

/** Scopes currently mounted with `trapped` and `active`; the last entry owns Tab. */
const scopeStack: DsFocusScope[] = [];

/**
 * `<ds-focus-scope>` — FocusScope (category: primitive).
 *
 * A wrapper that renders no appearance and claims no role: it moves focus in
 * on mount, keeps Tab confined to its focusable descendants while `trapped`
 * and `active`, and restores focus to the opener on unmount. The host itself
 * is the wrapper (`display: block`, not `display: contents`, which breaks
 * focus delegation) with a default slot for the confined content. Two
 * visually hidden sentinels in the shadow root catch focus arriving from the
 * browser chrome and pass it through to the real content; a `focusin`
 * listener on `document` pulls focus back if it leaves the scope by any other
 * means while trapped and active. Nested scopes register on a module-level
 * stack so only the innermost trapped, active scope owns Tab.
 *
 * ## When to use
 *
 * Compose it inside a new modal surface the system does not already provide
 * (Dialog, AlertDialog, BottomSheet and ActionSheet already do), with
 * `trapped` on and your own Escape handling — or with `trapped="false"` for a
 * non-modal panel that should still move focus in and restore it on close.
 *
 * ## When not to use
 *
 * Never trap focus in something that is not modal (a sidebar, a form
 * section, a toolbar) — a user who cannot Tab past it is trapped in the WCAG
 * sense. Not for composites like a menu or tab list; those use a roving
 * tabindex and let Tab leave.
 *
 * @fires escape-attempt - Fired just before trapped focus wraps (Tab from the
 *   last descendant, Shift+Tab from the first), with `{ direction }`.
 *   Diagnostic; components do not need to listen for it.
 * @slot - The confined content.
 */
@customElement('ds-focus-scope')
export class DsFocusScope extends LitElement {
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
    .visually-hidden {
      position: fixed;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;

  /** Tab and Shift+Tab wrap within the scope; focus outside is pulled back in. */
  @property({ type: Boolean, reflect: true }) trapped = true;

  /** Where focus goes on mount. */
  @property({ attribute: 'auto-focus' }) autoFocus: FocusScopeAutoFocus = 'first';

  /** On unmount, return focus to the opener (or the next focusable element if it is gone). */
  @property({ type: Boolean, attribute: 'restore-focus' }) restoreFocus = true;

  /** Pauses the scope without unmounting it, so a nested scope can own Tab instead. */
  @property({ type: Boolean, reflect: true }) active = true;

  /**
   * Explicit element to restore focus to instead of the recorded opener. Not
   * an attribute — set the property directly (there is no React ref concept
   * in Lit; this is a plain element reference).
   */
  @property({ attribute: false }) returnFocusTo?: HTMLElement | null;

  @query('[data-focus-scope-anchor]') private readonly anchorEl!: HTMLElement;

  @query('[data-focus-sentinel="start"]') private readonly startSentinelEl!: HTMLElement;

  private openerElement: HTMLElement | null = null;
  private documentFocusableSnapshot: HTMLElement[] = [];
  private lastFocused: HTMLElement | null = null;

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !this.trapped || !this.isEffectivelyActive()) {
      return;
    }
    const focusable = this.getFocusableDescendants();
    if (focusable.length === 0) {
      return;
    }
    const active = getDeepActiveElement();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      this.dispatchEscapeAttempt('forward');
      first.focus();
    } else if (event.shiftKey && active === first) {
      event.preventDefault();
      this.dispatchEscapeAttempt('backward');
      last.focus();
    }
  };

  private readonly handleDocumentFocusIn = (): void => {
    if (!this.trapped || !this.isEffectivelyActive()) {
      return;
    }
    const active = getDeepActiveElement();
    if (active instanceof HTMLElement && this.scopeContains(active)) {
      if (isFocusable(active)) {
        this.lastFocused = active;
      }
      return;
    }
    const fallback = this.lastFocused ?? this.getFocusableDescendants()[0] ?? null;
    fallback?.focus();
  };

  private readonly handleSentinelFocus = (event: FocusEvent): void => {
    if (!this.trapped) {
      return;
    }
    const focusable = this.getFocusableDescendants();
    if (focusable.length === 0) {
      this.anchorEl.focus();
      return;
    }
    if (event.target === this.startSentinelEl) {
      focusable[0].focus();
    } else {
      focusable[focusable.length - 1].focus();
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.dataset.ds = 'FocusScope';
    this.openerElement = getDeepActiveElement() as HTMLElement | null;
    this.documentFocusableSnapshot = findFocusableInDocument();
    this.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    scopeStack.push(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    const index = scopeStack.indexOf(this);
    if (index !== -1) {
      scopeStack.splice(index, 1);
    }
    if (this.restoreFocus) {
      this.restoreFocusOnExit();
    }
  }

  protected override firstUpdated(): void {
    this.applyAutoFocus();
    this.warnInDev();
  }

  protected override render() {
    return html`
      <span class="visually-hidden" tabindex="-1" data-focus-scope-anchor></span>
      <span
        class="visually-hidden"
        tabindex="0"
        data-focus-sentinel="start"
        @focus=${this.handleSentinelFocus}
      ></span>
      <slot></slot>
      <span
        class="visually-hidden"
        tabindex="0"
        data-focus-sentinel="end"
        @focus=${this.handleSentinelFocus}
      ></span>
    `;
  }

  private applyAutoFocus(): void {
    switch (this.autoFocus) {
      case 'first': {
        const [first] = this.getFocusableDescendants();
        (first ?? this.anchorEl).focus();
        break;
      }
      case 'last': {
        const focusable = this.getFocusableDescendants();
        (focusable[focusable.length - 1] ?? this.anchorEl).focus();
        break;
      }
      case 'container':
        // delegatesFocus redirects this to the anchor, the shadow tree's first
        // script-focusable (tabindex=-1) descendant, standing in for the host.
        this.focus();
        break;
      case 'none':
      default:
        break;
    }
  }

  private restoreFocusOnExit(): void {
    const explicit = this.returnFocusTo;
    if (explicit && explicit.isConnected && isFocusable(explicit)) {
      explicit.focus();
      return;
    }
    const opener = this.openerElement;
    if (opener && opener.isConnected && isFocusable(opener)) {
      opener.focus();
      return;
    }
    const snapshot = this.documentFocusableSnapshot;
    const openerIndex = opener ? snapshot.indexOf(opener) : -1;
    if (openerIndex === -1) {
      return;
    }
    const isUsable = (el: HTMLElement): boolean => el !== opener && el.isConnected && isFocusable(el);
    for (let i = openerIndex + 1; i < snapshot.length; i += 1) {
      if (isUsable(snapshot[i])) {
        snapshot[i].focus();
        return;
      }
    }
    for (let i = openerIndex - 1; i >= 0; i -= 1) {
      if (isUsable(snapshot[i])) {
        snapshot[i].focus();
        return;
      }
    }
  }

  private getFocusableDescendants(): HTMLElement[] {
    const root = this.shadowRoot;
    if (!root) {
      return [];
    }
    const results: HTMLElement[] = [];
    for (const child of Array.from(root.children)) {
      collectFocusable(child, results);
    }
    return results;
  }

  private scopeContains(el: Element): boolean {
    if (this.contains(el)) {
      return true;
    }
    return this.shadowRoot?.contains(el) ?? false;
  }

  private isEffectivelyActive(): boolean {
    if (!this.active || !this.isConnected) {
      return false;
    }
    const trappedActive = scopeStack.filter((scope) => scope.trapped && scope.active);
    return trappedActive[trappedActive.length - 1] === this;
  }

  private dispatchEscapeAttempt(direction: 'forward' | 'backward'): void {
    this.dispatchEvent(
      new CustomEvent<FocusScopeEscapeAttemptDetail>('escape-attempt', {
        detail: { direction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV || !this.trapped) {
      return;
    }
    if (this.getFocusableDescendants().length === 0) {
      console.warn('<ds-focus-scope trapped> has no focusable descendants; it would trap focus with no escape.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-focus-scope': DsFocusScope;
  }
}
