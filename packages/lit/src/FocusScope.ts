import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
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
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * "Disabled" is exactly `:disabled`, which already removes the form controls inside a
 * `fieldset[disabled]` (outside its first legend) while leaving the links and tabindex elements
 * there in, as the browser keeps them focusable. `aria-disabled` elements stay in: the system keeps
 * them focusable. `tabindex="-1"` is out; the scope's own anchor and sentinels are never candidates.
 * Visibility is not tested — an element hidden by CSS but neither `aria-hidden` nor `inert` counts.
 */
function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  if (el.hasAttribute('data-focus-sentinel') || el.hasAttribute('data-focus-scope-anchor')) {
    return false;
  }
  if (!el.matches(FOCUSABLE_SELECTOR) || el.matches(':disabled')) {
    return false;
  }
  return el.getAttribute('tabindex') !== '-1' && el.tabIndex >= 0;
}

/** `inert` and `aria-hidden="true"` subtrees contribute nothing at all. */
function isExcludedSubtree(el: Element): boolean {
  return el.hasAttribute('inert') || el.getAttribute('aria-hidden') === 'true';
}

/**
 * Walks light DOM, slot assignments and open shadow roots in tree order. A shadow host is walked
 * through its shadow root, whose `<slot>`s bring the assigned light children back in at the
 * position they actually render, so a slotted `<ds-button>` contributes its inner `<button>` once.
 */
function collectFocusable(node: Element, results: HTMLElement[]): void {
  if (isExcludedSubtree(node)) {
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

/**
 * The focusable elements inside `node`, in flat-tree order — the same walk the scope itself uses.
 * Shared so a component that resolves "the first/last focusable element" outside a trap (`<ds-popover>`
 * deciding where Tab leaves its panel) answers by exactly the rules a trapped scope would.
 */
export function focusableIn(node: Element): HTMLElement[] {
  const results: HTMLElement[] = [];
  collectFocusable(node, results);
  return results;
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
 * Flat-tree containment: a node inside a descendant's shadow root counts as inside, and so does a
 * node slotted in from outside. `parentNode` never crosses a slot assignment — a scope whose
 * `<slot>` is filled from a host's light DOM renders those nodes inside itself, but their
 * `parentNode` chain climbs to that host instead, so an assigned node is followed to the `<slot>`
 * it renders in. This is the walk `collectFocusable` already makes; without it here, a trapped
 * scope counts its own slotted content as an escape and pulls focus straight back out of it.
 */
function composedContains(container: Element, node: Node): boolean {
  let current: Node | null = node;
  while (current) {
    if (current === container) {
      return true;
    }
    const slot: HTMLSlotElement | null = current instanceof Element ? current.assignedSlot : null;
    current = slot ?? (current instanceof ShadowRoot ? current.host : current.parentNode);
  }
  return false;
}

/**
 * Mounted scopes, bottom to top. Only the topmost active entry is effective.
 * A scope always sits below every stacked scope it contains and above every stacked scope that
 * contains it; within that, activation order decides. There is no context on Lit, so the
 * containment test walks the composed tree from the mounting scope.
 */
const scopeStack: DsFocusScope[] = [];

/**
 * Inserts directly below the lowest stacked scope this one contains, so an outer scope connected
 * after its inner one still registers underneath it; otherwise on top.
 */
function registerScope(scope: DsFocusScope): void {
  removeFromStack(scope);
  const nestedIndex = scopeStack.findIndex((entry) => composedContains(scope, entry));
  if (nestedIndex === -1) {
    scopeStack.push(scope);
  } else {
    scopeStack.splice(nestedIndex, 0, scope);
  }
  refreshStack();
}

function unregisterScope(scope: DsFocusScope): void {
  removeFromStack(scope);
  refreshStack();
}

function removeFromStack(scope: DsFocusScope): void {
  const index = scopeStack.indexOf(scope);
  if (index !== -1) {
    scopeStack.splice(index, 1);
  }
}

/** The sentinels' tabindex depends on stack position, so every scope re-renders when the stack changes. */
function refreshStack(): void {
  for (const entry of scopeStack) {
    entry.requestUpdate();
  }
}

/** Only active scopes count when picking the top. */
function topActiveScope(): DsFocusScope | undefined {
  for (let i = scopeStack.length - 1; i >= 0; i -= 1) {
    const entry = scopeStack[i]!;
    if (entry.active) {
      return entry;
    }
  }
  return undefined;
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
 * into the first focusable descendant, so `host.focus()` does nothing.
 * `autoFocus: container` instead focuses an invisible anchor rendered first in
 * the shadow root, which carries `tabindex="-1"` only while `autoFocus` is
 * `container` and which also carries the `scope` part.
 *
 * Two visually hidden sentinels catch focus arriving from the browser chrome:
 * the start sentinel sends it to the first descendant, the end sentinel to the
 * last. They are tab stops only while the scope is trapped, active and top of
 * the stack. A `focusin` listener on `document` pulls focus back to the last
 * focused descendant if it leaves while the scope is effective. The scope
 * never handles Escape and never makes anything inert — the overlay owns both.
 *
 * Boolean props that default to `true` are exposed as negated attributes:
 * `no-trapped`, `no-active` (both reflected) and `no-restore-focus`. Composing
 * overlays set them as properties (`.active=${open}`), never as attributes,
 * which cannot turn off a true default.
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
   * Attribute: `no-restore-focus` (not reflected).
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
  /** The opener's ancestors, nearest first: the fallback when the marker went with the opener's parent. */
  private openerAncestors: HTMLElement[] = [];
  private lastFocused: HTMLElement | null = null;
  private childrenSettled: Promise<void> = Promise.resolve();

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (!this.isEffective()) {
      return;
    }
    const focusable = this.getFocusableDescendants();
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    const current = getDeepActiveElement();
    if (current === this.anchorEl) {
      // From the container: Tab goes to the first descendant and fires nothing; Shift+Tab wraps.
      event.preventDefault();
      if (event.shiftKey) {
        this.dispatchEscapeAttempt('backward');
        last.focus();
      } else {
        first.focus();
      }
    } else if (!event.shiftKey && current === last) {
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
    if (current instanceof HTMLElement && composedContains(this, current)) {
      if (isFocusable(current)) {
        this.lastFocused = current;
      }
      return;
    }
    if (!this.isEffective()) {
      return;
    }
    const remembered =
      this.lastFocused?.isConnected && composedContains(this, this.lastFocused) ? this.lastFocused : null;
    // With nothing to pull back to, focus is left where it went (the dev warning covers it).
    (remembered ?? this.getFocusableDescendants()[0] ?? this.containerTarget())?.focus();
  };

  private readonly handleSentinelFocus = (event: FocusEvent): void => {
    if (!this.isEffective()) {
      return;
    }
    // Each sentinel continues the direction of travel; wrapping at the real edges is the Tab
    // handler's job.
    const focusable = this.getFocusableDescendants();
    const target = event.target === this.startSentinelEl ? focusable[0] : focusable[focusable.length - 1];
    (target ?? this.containerTarget())?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.dataset.ds = 'FocusScope';
    this.recordOpener();
    this.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('focusin', this.handleDocumentFocusIn);
    registerScope(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleDocumentFocusIn);
    // Leave the stack before restoring, or this scope's own pull-back would claim the restored focus.
    unregisterScope(this);
    if (this.restoreFocus) {
      this.restoreFocusOnExit();
    }
    this.openerMarker?.remove();
    this.openerMarker = null;
    this.openerAncestors = [];
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
      // Reactivation moves the scope above every scope that is not its descendant.
      registerScope(this);
    } else if (
      (changed.has('active') && changed.get('active') !== undefined) ||
      (changed.has('trapped') && changed.get('trapped') !== undefined)
    ) {
      // Pausing or untrapping this scope can make another one the effective top.
      refreshStack();
    }
  }

  protected override render(): TemplateResult {
    const sentinelTabIndex = this.isEffective() ? '0' : '-1';
    return html`
      <span
        class="visually-hidden"
        part="scope"
        data-part="scope"
        tabindex=${this.autoFocus === 'container' ? '-1' : nothing}
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

  /**
   * Records the opener, a marker beside it and its ancestor chain, so focus can be restored to its
   * former position even after the opener — or the opener's parent — is removed.
   */
  private recordOpener(): void {
    const current = getDeepActiveElement();
    this.openerElement = current instanceof HTMLElement && current !== document.body ? current : null;
    this.openerMarker?.remove();
    this.openerMarker = null;
    this.openerAncestors = [];
    const opener = this.openerElement;
    if (!opener || composedContains(this, opener)) {
      return;
    }
    if (opener.parentNode) {
      this.openerMarker = document.createComment('ds-focus-scope opener');
      opener.after(this.openerMarker);
    }
    for (let node = opener.parentElement; node; node = node.parentElement) {
      if (composedContains(this, node)) {
        break;
      }
      this.openerAncestors.push(node);
    }
  }

  private applyAutoFocus(): void {
    switch (this.autoFocus) {
      case 'first':
        this.getFocusableDescendants()[0]?.focus();
        break;
      case 'last': {
        const focusable = this.getFocusableDescendants();
        focusable[focusable.length - 1]?.focus();
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

  /** The anchor, only while it is focusable (`autoFocus: container`). */
  private containerTarget(): HTMLElement | null {
    return this.autoFocus === 'container' ? this.anchorEl : null;
  }

  private resolveReturnTarget(): HTMLElement | undefined {
    const target = this.returnFocusTo;
    if (target instanceof HTMLElement) {
      return target;
    }
    return target?.value;
  }

  /** `returnFocusTo`, then the recorded opener, then the first focusable after where it used to be. */
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
    const anchor: Node | undefined = this.openerMarker?.isConnected
      ? this.openerMarker
      : this.openerAncestors.find((node) => node.isConnected);
    if (!anchor) {
      return;
    }
    const all: HTMLElement[] = [];
    collectFocusable(document.body, all);
    const next = all.find(
      (el) =>
        !composedContains(this, el) &&
        Boolean(anchor.compareDocumentPosition(documentHost(el)) & Node.DOCUMENT_POSITION_FOLLOWING),
    );
    next?.focus();
  }

  /**
   * Waits for the slotted elements and every custom element in their light-DOM subtrees (not
   * elements inside those elements' own shadow roots), so the walker sees their focusable internals.
   */
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

  /** Trapped, active, connected, and the top active scope on the stack. */
  private isEffective(): boolean {
    return this.trapped && this.active && this.isConnected && topActiveScope() === this;
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
    if (!import.meta.env.DEV || !this.trapped) {
      return;
    }
    if (this.getFocusableDescendants().length === 0) {
      console.warn(
        '<ds-focus-scope> is trapped with no focusable descendants, so focus inside it cannot move or leave. Add a focusable control (a close Button) or set the trapped property to false.',
        this,
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-focus-scope': DsFocusScope;
  }
}
