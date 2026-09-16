import {
  createContext,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import './FocusScope.css';

declare const process: { env: { NODE_ENV?: string } };

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';
export type FocusScopeEscapeDirection = 'forward' | 'backward';

export interface FocusScopeProps
  extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'children' | 'tabIndex' | 'onKeyDown' | 'autoFocus' | 'className' | 'style' | 'role'
  > {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: ReactNode;
  /**
   * Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside
   * is pulled back in. False turns the scope into a plain "move focus in and restore on exit"
   * helper, for non-modal panels.
   */
  trapped?: boolean | undefined;
  /**
   * Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper
   * (made focusable with tabindex -1, for reading-first dialogs), or nowhere.
   */
  autoFocus?: FocusScopeAutoFocus | undefined;
  /**
   * On unmount, focus returns to the element that was focused when the scope mounted, or to the
   * next focusable element in the document if that one is gone.
   */
  restoreFocus?: boolean | undefined;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Required on native when
   * the opener is not a TextInput (React Native exposes no generic "currently focused element"),
   * so every overlay passes its trigger ref.
   */
  returnFocusTo?: RefObject<HTMLElement | null> | undefined;
  /**
   * Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is
   * open, so the innermost active scope owns Tab.
   */
  active?: boolean | undefined;
  /**
   * Fired when trapped focus would have left the scope (Tab from the last element, Shift+Tab from
   * the first) just before it wraps, with the direction. Diagnostic; components do not need it.
   */
  onEscapeAttempt?: ((direction: FocusScopeEscapeDirection) => void) | undefined;
}

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

function isFocusable(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hasAttribute('data-focus-sentinel')) return false;
  if (!element.matches(FOCUSABLE_SELECTOR)) return false;
  if (element.matches(':disabled')) return false;
  // tabindex=-1 is excluded; the container is never a candidate because the walk starts below it.
  return element.getAttribute('tabindex') !== '-1' && element.tabIndex >= 0;
}

function isExcludedSubtree(element: Element): boolean {
  return element.hasAttribute('inert') || element.getAttribute('aria-hidden') === 'true';
}

/** Walks DOM order including open shadow roots and assigned slot nodes, skipping inert and aria-hidden subtrees. */
function collectFocusable(root: Element | ShadowRoot, results: HTMLElement[] = []): HTMLElement[] {
  for (const child of Array.from(root.children)) {
    if (isExcludedSubtree(child)) continue;
    if (child instanceof HTMLSlotElement) {
      for (const assigned of child.assignedElements({ flatten: true })) {
        if (isExcludedSubtree(assigned)) continue;
        if (isFocusable(assigned)) results.push(assigned);
        if (assigned.shadowRoot) collectFocusable(assigned.shadowRoot, results);
        collectFocusable(assigned, results);
      }
      continue;
    }
    if (isFocusable(child)) results.push(child);
    if (child.shadowRoot) collectFocusable(child.shadowRoot, results);
    collectFocusable(child, results);
  }
  return results;
}

/** The focused element, descending into open shadow roots. */
function deepActiveElement(): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

/** First document-order focusable element after `marker`, for restoring focus once the opener is gone. */
function findNextFocusableAfter(marker: Node): HTMLElement | null {
  for (const element of collectFocusable(document.body)) {
    if (element.getRootNode() !== document) continue;
    if (marker.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
  }
  return null;
}

interface ScopeEntry {
  active: boolean;
  parent: ScopeEntry | null;
}

/** Module-level stack of mounted scopes; only the top entry traps, and only while it is active. */
const scopeStack: ScopeEntry[] = [];

/** The enclosing scope in the React tree (portals included), so nesting survives same-commit mounts. */
const ScopeParentContext = createContext<ScopeEntry | null>(null);

function isAncestorEntry(ancestor: ScopeEntry, entry: ScopeEntry): boolean {
  for (let current = entry.parent; current; current = current.parent) {
    if (current === ancestor) return true;
  }
  return false;
}

function pushScope(entry: ScopeEntry): void {
  // Child effects run before their parent's, so a nested scope mounted in the same commit may
  // already be registered: insert below it rather than on top.
  const index = scopeStack.findIndex((other) => isAncestorEntry(entry, other));
  if (index === -1) scopeStack.push(entry);
  else scopeStack.splice(index, 0, entry);
}

function removeScope(entry: ScopeEntry): void {
  const index = scopeStack.indexOf(entry);
  if (index !== -1) scopeStack.splice(index, 1);
}

/**
 * FocusScope — Design Schema, category: primitive.
 *
 * Moves focus in on mount, keeps Tab inside while trapped, and puts focus back on unmount. It never
 * handles Escape and never makes anything inert; the composing overlay owns both.
 *
 * When to use:
 * Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it
 * in their composition, and that is where it should live. Render it yourself only when building a
 * new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay),
 * with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal
 * panel that should still move focus in and restore it on close (a slide-in filter drawer that
 * keeps the page usable).
 */
export function FocusScope({
  ref,
  children,
  trapped = true,
  autoFocus = 'first',
  restoreFocus = true,
  returnFocusTo,
  active = true,
  onEscapeAttempt,
  ...rest
}: FocusScopeProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

  const parentEntry = useContext(ScopeParentContext);
  const entryRef = useRef<ScopeEntry | null>(null);
  if (entryRef.current === null) entryRef.current = { active, parent: parentEntry };
  const entry = entryRef.current;
  entry.active = active;

  const openerRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<Comment | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const latest = useRef({ trapped, restoreFocus, returnFocusTo, onEscapeAttempt });
  latest.current = { trapped, restoreFocus, returnFocusTo, onEscapeAttempt };

  const isEffective = (): boolean =>
    latest.current.trapped && entry.active && scopeStack[scopeStack.length - 1] === entry;

  // Registers in the stack, records the opener, focuses per `autoFocus`, and restores on unmount.
  // A layout effect, so it reads the opener before the parent's layout effects run: every overlay
  // composite moves focus into itself in its own useLayoutEffect, and a child's fire first.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    pushScope(entry);

    const opener = document.activeElement;
    openerRef.current = opener instanceof HTMLElement && opener !== document.body ? opener : null;

    const marker = document.createComment('ds-focus-scope-restore');
    const openerParent = openerRef.current?.parentNode;
    if (openerParent) openerParent.insertBefore(marker, openerRef.current!.nextSibling);
    markerRef.current = openerParent ? marker : null;

    const focusables = collectFocusable(container);
    if (process.env.NODE_ENV !== 'production' && latest.current.trapped && focusables.length === 0) {
      console.warn(
        'FocusScope: a trapped scope has no focusable descendants, so focus inside it cannot move or leave. Add a focusable control (a close Button) or set trapped={false}.',
      );
    }

    let target: HTMLElement | undefined;
    if (autoFocus === 'container') target = container;
    else if (autoFocus === 'first') target = focusables[0];
    else if (autoFocus === 'last') target = focusables[focusables.length - 1];
    if (target) {
      target.focus();
      if (target !== container) lastFocusedRef.current = target;
    }

    return () => {
      // Leave the stack before restoring, or the focusin trap below (still listening, since passive
      // cleanups run later) pulls the restored focus straight back into the departing container.
      removeScope(entry);
      const recorded = openerRef.current;
      const restoreMarker = markerRef.current;
      if (latest.current.restoreFocus) {
        const explicit = latest.current.returnFocusTo?.current;
        if (explicit && explicit.isConnected) explicit.focus();
        else if (recorded && recorded.isConnected) recorded.focus();
        else if (restoreMarker?.isConnected) findNextFocusableAfter(restoreMarker)?.focus();
      }
      restoreMarker?.parentNode?.removeChild(restoreMarker);
      markerRef.current = null;
    };
  }, []);

  // Focus that leaves the scope by any means (not only Tab) is pulled back to the last focused descendant.
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent): void => {
      const container = containerRef.current;
      const target = event.target;
      if (!container || !(target instanceof Node)) return;
      if (container.contains(target)) {
        const focused = deepActiveElement();
        if (focused instanceof HTMLElement && focused !== container && !focused.hasAttribute('data-focus-sentinel')) {
          lastFocusedRef.current = focused;
        }
        return;
      }
      if (!isEffective()) return;
      const remembered = lastFocusedRef.current;
      const fallback =
        remembered && container.contains(remembered) ? remembered : (collectFocusable(container)[0] ?? null);
      fallback?.focus();
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey || !isEffective()) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = collectFocusable(container);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    const focused = deepActiveElement();
    if (!event.shiftKey && focused === last) {
      latest.current.onEscapeAttempt?.('forward');
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && focused === first) {
      latest.current.onEscapeAttempt?.('backward');
      event.preventDefault();
      last.focus();
    }
  };

  // Sentinels catch focus arriving from the browser chrome and continue the direction of travel;
  // wrapping at the real edges is `handleKeyDown`'s job.
  const handleStartSentinelFocus = (): void => {
    const container = containerRef.current;
    if (!container || !isEffective()) return;
    collectFocusable(container)[0]?.focus();
  };
  const handleEndSentinelFocus = (): void => {
    const container = containerRef.current;
    if (!container || !isEffective()) return;
    const focusables = collectFocusable(container);
    focusables[focusables.length - 1]?.focus();
  };

  return (
    <ScopeParentContext.Provider value={entry}>
      <div
        data-part="scope"
        {...rest}
        ref={containerRef}
        tabIndex={autoFocus === 'container' ? -1 : undefined}
        data-focus-scope=""
        data-ds="FocusScope"
        className="ds-focus-scope"
        onKeyDown={handleKeyDown}
      >
        {trapped ? (
          <span
            tabIndex={0}
            data-focus-sentinel=""
            className="ds-focus-scope__sentinel"
            onFocus={handleStartSentinelFocus}
          />
        ) : null}
        {children}
        {trapped ? (
          <span tabIndex={0} data-focus-sentinel="" className="ds-focus-scope__sentinel" onFocus={handleEndSentinelFocus} />
        ) : null}
      </div>
    </ScopeParentContext.Provider>
  );
}
