import { LitElement, css, html, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import type { Ref } from 'lit/directives/ref.js';

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';

export type FocusScopeEscapeAttemptDirection = 'forward' | 'backward';

/** Detail carried by the `escape-attempt` CustomEvent. */
export interface FocusScopeEscapeAttemptDetail {
  direction: FocusScopeEscapeAttemptDirection;
}

/**
 * Where focus is restored instead of the recorded opener: an element, or a Lit
 * `Ref` (`createRef()`), the Lit counterpart of the doc's `RefObject`.
 */
export type FocusScopeReturnTarget = HTMLElement | Ref<HTMLElement>;

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
  if (node instanceof HTMLFieldSetElement && node.disabled) {
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

/** The element itself, or the outermost shadow host holding it, so it can be ordered against document nodes. */
function documentHost(el: Element): Element {
  let node = el;
  let root = node.getRootNode();
  while (root instanceof ShadowRoot) {
    node = root.host;
    root = node.getRootNode();
  }
  return node;
}

/**
 * Mounted scopes in activation order. Only the last active entry is effective;
 * a scope moves to the top when it mounts or becomes active again.
 */
const scopeStack: DsFocusScope[] = [];

function pushScope(scope: DsFocusScope): void {
  removeScope(scope);
  scopeStack.push(scope);
}

function removeScope(scope: DsFocusScope): void {
  const index = scopeStack.indexOf(scope);
  if (index !== -1) {
    scopeStack.splice(index, 1);
  }
}

/**
 * `<ds-focus-scope>` — FocusScope (category: primitive).
 *
 * A wrapper that renders no appearance and claims no role: it moves focus in
 * on mount, keeps Tab confined to its focusable descendants while `trapped`
 * and `active`, and restores focus to the opener on unmount. The host itself
 * is the wrapper (`display: block`, not `display: contents`) with a default
 * slot for the confined content, and it is never focusable or tabbable.
 * `delegatesFocus` is deliberately off: it would send a `focus()` on the host
 * into the first focusable descendant. `autoFocus: container` instead focuses
 * an invisible `tabindex="-1"` anchor rendered first in the shadow root.
 *
 * Two visually hidden sentinels catch focus arriving from the browser chrome
 * while trapped: the start sentinel sends it to the first descendant, the end
 * sentinel to the last. A `focusin` listener on `document` pulls focus back to
 * the last focused descendant if it leaves while trapped and active. Nested
 * scopes register on a module-level stack; only the top active scope is
 * effective. The scope never handles Escape and never makes anything inert.
 *
 * Boolean props that default to `true` are exposed as negated attributes:
 * `no-trapped`, `no-active`, `no-restore-focus`.
 *
 * @fires escape-attempt - Fired just before trapped focus wraps (Tab from the
 *   last descendant, Shift+Tab from the first), with `{ direction }`.
 *   Diagnostic; components do not need to listen for it.
 * @slot - The confined content.
 */
@customElement('ds-focus-scope')
export class DsFocusScope extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    /* literal-ok: standard visually-hidden clip pattern */
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
    .visually-hidden:focus {
      outline: none;
    }
  `;

  /**
   * Tab and Shift+Tab wrap within the scope's focusable descendants, and focus
   * that lands outside is pulled back in. False turns the scope into a plain
   * "move focus in and restore on exit" helper. Attribute: `no-trapped`.
   */
  @property({ attribute: 'no-trapped', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor trapped = true;

  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own anchor, or nowhere. */
  @property({ attribute: 'auto-focus' }) accessor autoFocus: FocusScopeAutoFocus = 'first';

  /**
   * On unmount, focus returns to the element that was focused when the scope
   * mounted, or to the next focusable element if that one is gone.
   * Attribute: `no-restore-focus`.
   */
  @property({ attribute: 'no-restore-focus', converter: NEGATED_BOOLEAN_CONVERTER })
  accessor restoreFocus = true;

  /** Explicit element (or Lit `Ref`) to restore focus to instead of the recorded opener. Property only. */
  @property({ attribute: false }) accessor returnFocusTo: FocusScopeReturnTarget | undefined;

  /**
   * Pause the scope without unmounting it, so a nested scope can own Tab.
   * Attribute: `no-active`.
   */
  @property({ attribute: 'no-active', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor active = true;

  @query('[data-focus-scope-anchor]') private accessor anchorEl!: HTMLElement | null;

  @query('[data-focus-sentinel="start"]') private accessor startSentinelEl!: HTMLElement | null;

  private openerElement: HTMLElement | null = null;
  /** Marker left beside the opener, so "the next focusable element" survives the opener's removal. */
  private openerMarker: Comment | null = null;
  private lastFocused: HTMLElement | null = null;
  private childrenSettled: Promise<void> = Promise.resolve();

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || event.defaultPrevented || !this.isEffective()) {
      return;
    }
    const focusable = this.getFocusableDescendants();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    const current = getDeepActiveElement();
    if (!event.shiftKey && current === last) {
      event.preventDefault();
      this.dispatchEscapeAttempt('forward');
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      this.dispatchEscapeAttempt('backward');
      last.focus();
    }
  };

  private readonly handleDocumentFocusIn = (): void => {
    const current = getDeepActiveElement();
    if (current instanceof HTMLElement && this.scopeContains(current)) {
      if (isFocusable(current)) {
        this.lastFocused = current;
      }
      return;
    }
    if (!this.isEffective()) {
      return;
    }
    const remembered = this.lastFocused?.isConnected ? this.lastFocused : null;
    (remembered ?? this.getFocusableDescendants()[0] ?? this.anchorEl)?.focus();
  };

  private readonly handleSentinelFocus = (event: FocusEvent): void => {
    const focusable = this.getFocusableDescendants();
    const target = event.target === this.startSentinelEl ? focusable[0] : focusable[focusable.length - 1];
    (target ?? this.anchorEl)?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.dataset.ds = 'FocusScope';
    this.recordOpener();
    this.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    pushScope(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    removeScope(this);
    if (this.restoreFocus) {
      this.restoreFocusOnExit();
    }
    this.openerMarker?.remove();
    this.openerMarker = null;
    this.openerElement = null;
    this.lastFocused = null;
  }

  protected override firstUpdated(): void {
    // Slotted custom elements (ds-button, ds-input) render their focusable
    // internals in their own update, after this one: wait for them first.
    this.childrenSettled = this.settleChildren().then(() => {
      if (this.isConnected) {
        this.applyAutoFocus();
        this.warnInDev();
      }
    });
  }

  protected override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.childrenSettled;
    return result;
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('active') && changed.get('active') === false && this.active) {
      pushScope(this);
    }
  }

  protected override render(): TemplateResult {
    const sentinelTabIndex = this.trapped && this.active ? '0' : '-1';
    return html`
      <span
        class="visually-hidden"
        part="scope"
        data-part="scope"
        tabindex="-1"
        data-focus-scope-anchor
      ></span>
      <span
        class="visually-hidden"
        tabindex=${sentinelTabIndex}
        data-focus-sentinel="start"
        @focus=${this.handleSentinelFocus}
      ></span>
      <slot></slot>
      <span
        class="visually-hidden"
        tabindex=${sentinelTabIndex}
        data-focus-sentinel="end"
        @focus=${this.handleSentinelFocus}
      ></span>
    `;
  }

  private recordOpener(): void {
    const current = getDeepActiveElement();
    this.openerElement = current instanceof HTMLElement && current !== document.body ? current : null;
    this.openerMarker?.remove();
    this.openerMarker = null;
    const opener = this.openerElement;
    if (opener?.parentNode && !this.contains(opener)) {
      this.openerMarker = document.createComment('ds-focus-scope opener');
      opener.after(this.openerMarker);
    }
  }

  private applyAutoFocus(): void {
    switch (this.autoFocus) {
      case 'first': {
        const [first] = this.getFocusableDescendants();
        (first ?? this.anchorEl)?.focus();
        break;
      }
      case 'last': {
        const focusable = this.getFocusableDescendants();
        (focusable[focusable.length - 1] ?? this.anchorEl)?.focus();
        break;
      }
      case 'container':
        this.anchorEl?.focus();
        break;
      case 'none':
      default:
        break;
    }
  }

  private resolveReturnTarget(): HTMLElement | undefined {
    const target = this.returnFocusTo;
    if (target instanceof HTMLElement) {
      return target;
    }
    return target?.value;
  }

  private restoreFocusOnExit(): void {
    const explicit = this.resolveReturnTarget();
    if (explicit?.isConnected) {
      explicit.focus();
      return;
    }
    const opener = this.openerElement;
    if (opener?.isConnected) {
      opener.focus();
      return;
    }
    const marker = this.openerMarker;
    if (!marker?.isConnected) {
      return;
    }
    const all: HTMLElement[] = [];
    collectFocusable(document.body, all);
    const next = all.find(
      (el) => !this.scopeContains(el) && Boolean(marker.compareDocumentPosition(documentHost(el)) & Node.DOCUMENT_POSITION_FOLLOWING),
    );
    next?.focus();
  }

  private async settleChildren(): Promise<void> {
    const slot = this.shadowRoot?.querySelector('slot');
    const elements = (slot?.assignedElements({ flatten: true }) ?? []).flatMap((el) => [
      el,
      ...Array.from(el.querySelectorAll('*')),
    ]);
    await Promise.all(elements.map((el) => (el as Partial<LitElement>).updateComplete));
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

  /** Composed-tree containment: focus inside a slotted child's own shadow root still counts as inside. */
  private scopeContains(el: Element): boolean {
    let node: Node | null = el;
    while (node) {
      if (node === this) {
        return true;
      }
      node = node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode;
    }
    return false;
  }

  /** Trapped, active, connected, and the top active scope on the stack. */
  private isEffective(): boolean {
    if (!this.trapped || !this.active || !this.isConnected) {
      return false;
    }
    const activeScopes = scopeStack.filter((scope) => scope.active);
    return activeScopes[activeScopes.length - 1] === this;
  }

  private dispatchEscapeAttempt(direction: FocusScopeEscapeAttemptDirection): void {
    this.dispatchEvent(
      new CustomEvent<FocusScopeEscapeAttemptDetail>('escape-attempt', {
        detail: { direction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV || !this.trapped || !this.active) {
      return;
    }
    if (this.getFocusableDescendants().length === 0) {
      console.warn('<ds-focus-scope> is trapped with no focusable descendants; it would trap focus with no escape.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-focus-scope': DsFocusScope;
  }
}
