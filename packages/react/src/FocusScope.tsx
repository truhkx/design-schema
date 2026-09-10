import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './FocusScope.css';

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';
export type FocusScopeEscapeDirection = 'forward' | 'backward';

export interface FocusScopeProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'tabIndex' | 'onKeyDown' | 'autoFocus'> {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: ReactNode;
  /**
   * Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside
   * is pulled back in. False turns the scope into a plain "move focus in and restore on exit"
   * helper, for non-modal panels.
   */
  trapped?: boolean;
  /**
   * Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper
   * (made focusable with tabindex -1, for reading-first dialogs), or nowhere.
   */
  autoFocus?: FocusScopeAutoFocus;
  /**
   * On unmount, focus returns to the element that was focused when the scope mounted, or to the
   * next focusable element in the document if that one is gone.
   */
  restoreFocus?: boolean;
  /**
   * Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is
   * open, so the innermost active scope owns Tab.
   */
  active?: boolean;
  /**
   * Fired when trapped focus would have left the scope (Tab from the last element, Shift+Tab from
   * the first) just before it wraps, with the direction. Diagnostic; components do not need it.
   */
  onEscapeAttempt?: (direction: FocusScopeEscapeDirection) => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function isFocusable(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  if (element.hasAttribute('data-focus-sentinel')) return false;
  if ('disabled' in element && (element as unknown as { disabled: boolean }).disabled) return false;
  if (element.tabIndex < 0) return false;
  return element.matches(FOCUSABLE_SELECTOR);
}

function isHiddenSubtree(element: Element): boolean {
  return element.hasAttribute('inert') || element.getAttribute('aria-hidden') === 'true';
}

/** Walks DOM order including open shadow roots and assigned slot nodes, skipping hidden subtrees. */
function collectFocusable(root: Element | ShadowRoot, results: HTMLElement[] = []): HTMLElement[] {
  for (const child of Array.from(root.children)) {
    if (isHiddenSubtree(child)) continue;
    if (child instanceof HTMLSlotElement) {
      for (const assigned of child.assignedElements({ flatten: true })) {
        if (isHiddenSubtree(assigned)) continue;
        if (isFocusable(assigned)) results.push(assigned);
        if (assigned.shadowRoot) collectFocusable(assigned.shadowRoot, results);
        collectFocusable(assigned, results);
      }
      continue;
    }
    if (isFocusable(child)) results.push(child);
    if (child instanceof HTMLElement && child.shadowRoot) collectFocusable(child.shadowRoot, results);
    collectFocusable(child, results);
  }
  return results;
}

/** First document-order focusable element after `marker`, for restoring focus once the opener is gone. */
function findNextFocusableAfter(marker: Node): HTMLElement | null {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  for (const element of candidates) {
    if (!isFocusable(element)) continue;
    if (marker.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) return element;
  }
  return null;
}

/** Module-level stack of mounted scopes; only the top entry may act as trap/pull-back owner. */
const scopeStack: Array<{ active: boolean }> = [];

/**
 * FocusScope — Design Schema, category: primitive.
 *
 * When to use:
 * Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet and ActionSheet declare it
 * in their composition, and that is where it should live. Render it yourself only when building a
 * new modal surface the system does not have yet (a full-screen takeover, an onboarding overlay),
 * with `trapped` on and an Escape handler of your own — or with `trapped: false` for a non-modal
 * panel that should still move focus in and restore it on close (a slide-in filter drawer that
 * keeps the page usable).
 */
export const FocusScope = forwardRef<HTMLDivElement, FocusScopeProps>(function FocusScope(
  { children, trapped = true, autoFocus = 'first', restoreFocus = true, active = true, onEscapeAttempt, className, ...rest },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, []);

  const openerRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<Comment | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const entryRef = useRef<{ active: boolean }>({ active });
  entryRef.current.active = active;

  const latest = useRef({ trapped, restoreFocus, onEscapeAttempt });
  latest.current = { trapped, restoreFocus, onEscapeAttempt };

  const isTop = () => scopeStack.length > 0 && scopeStack[scopeStack.length - 1] === entryRef.current;
  const isEffectivelyActive = () => entryRef.current.active && isTop();

  // Registers in the module-level stack so a nested scope (a Menu inside this Dialog) can take over.
  useEffect(() => {
    scopeStack.push(entryRef.current);
    return () => {
      const index = scopeStack.indexOf(entryRef.current);
      if (index !== -1) scopeStack.splice(index, 1);
    };
  }, []);

  // Records the opener, focuses per `autoFocus`, and restores focus on unmount. Runs once: autoFocus
  // is "on mount" by definition, and restoreFocus is read fresh from `latest` at cleanup time.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const opener = document.activeElement;
    openerRef.current = opener instanceof HTMLElement ? opener : null;

    const marker = document.createComment('ds-focus-scope-restore');
    if (openerRef.current?.parentNode) {
      openerRef.current.parentNode.insertBefore(marker, openerRef.current.nextSibling);
    }
    markerRef.current = marker;

    if (autoFocus === 'container') {
      container.focus();
    } else if (autoFocus !== 'none') {
      const focusables = collectFocusable(container);
      const target = autoFocus === 'last' ? focusables[focusables.length - 1] : focusables[0];
      (target ?? container).focus();
    }

    return () => {
      const opener2 = openerRef.current;
      if (latest.current.restoreFocus) {
        if (opener2 && document.contains(opener2)) {
          opener2.focus();
        } else if (markerRef.current) {
          findNextFocusableAfter(markerRef.current)?.focus();
        }
      }
      if (markerRef.current?.parentNode) markerRef.current.parentNode.removeChild(markerRef.current);
    };
  }, []);

  // Safety net: focus that leaves the scope by any means (not only Tab) is pulled back in.
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (!latest.current.trapped || !isEffectivelyActive()) return;
      const container = containerRef.current;
      const target = event.target;
      if (!container || !(target instanceof Node)) return;
      if (container.contains(target)) {
        if (target instanceof HTMLElement && !target.hasAttribute('data-focus-sentinel')) {
          lastFocusedRef.current = target;
        }
        return;
      }
      const fallback = lastFocusedRef.current ?? collectFocusable(container)[0] ?? container;
      fallback.focus();
    };
    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !latest.current.trapped || !isEffectivelyActive()) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = collectFocusable(container);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeElement = document.activeElement;
    if (!event.shiftKey && activeElement === last) {
      latest.current.onEscapeAttempt?.('forward');
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && activeElement === first) {
      latest.current.onEscapeAttempt?.('backward');
      event.preventDefault();
      last.focus();
    }
  };

  // Sentinels catch focus arriving from the browser chrome (not from Tab wrapping inside the
  // scope, which `handleKeyDown` already redirects before it ever reaches them).
  const handleStartSentinelFocus = () => {
    if (!latest.current.trapped || !isEffectivelyActive()) return;
    const container = containerRef.current;
    if (!container) return;
    (collectFocusable(container)[0] ?? container).focus();
  };
  const handleEndSentinelFocus = () => {
    if (!latest.current.trapped || !isEffectivelyActive()) return;
    const container = containerRef.current;
    if (!container) return;
    const focusables = collectFocusable(container);
    (focusables[focusables.length - 1] ?? container).focus();
  };

  const classes = ['ds-focus-scope', className ?? null].filter(Boolean).join(' ');

  return (
    <div
      {...rest}
      ref={containerRef}
      tabIndex={-1}
      data-focus-scope=""
      data-ds="FocusScope"
      className={classes}
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
        <span
          tabIndex={0}
          data-focus-sentinel=""
          className="ds-focus-scope__sentinel"
          onFocus={handleEndSentinelFocus}
        />
      ) : null}
    </div>
  );
});
