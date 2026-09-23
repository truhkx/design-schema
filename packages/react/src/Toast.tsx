import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type Context,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { createPortal, flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text, type TextOverridableBinding } from './Text';
import './Toast.css';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'escape' | 'action' | 'replaced' | 'programmatic';

/**
 * Style bindings that can be overridden on a toast; accessibility-bearing bindings are never in
 * this list. `stackGap`, `regionInset` and `layer` belong to the region: see
 * `ToastRegionOverridableBinding`.
 */
export type ToastOverridableBinding =
  | 'radius'
  | 'shadow'
  | 'paddingBlock'
  | 'paddingInline'
  | 'gap'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'enter'
  | 'enterOffset'
  | 'exit';

/** Bindings drawn by the toast itself; `fontFamily`, `fontSize` and `lineHeight` are forwarded to Text. */
const OVERRIDE_HOOK: Record<Exclude<ToastOverridableBinding, TextOverridableBinding>, string> = {
  radius: '--ds-toast-radius',
  shadow: '--ds-toast-shadow',
  paddingBlock: '--ds-toast-padding-block',
  paddingInline: '--ds-toast-padding-inline',
  gap: '--ds-toast-gap',
  maxWidth: '--ds-toast-max-width',
  enter: '--ds-toast-enter',
  enterOffset: '--ds-toast-enter-offset',
  exit: '--ds-toast-exit',
};

/** Toast binding → the Text binding it is forwarded to on the `message` part. */
const MESSAGE_FORWARDS: Record<'fontFamily' | 'fontSize' | 'lineHeight', TextOverridableBinding> = {
  fontFamily: 'fontFamily', // literal-ok: Text binding name, not a font stack
  fontSize: 'fontSize',
  lineHeight: 'lineHeight',
};

/** Style bindings that can be overridden on the region (ToastRegion). */
export type ToastRegionOverridableBinding = 'stackGap' | 'regionInset' | 'layer';

const REGION_OVERRIDE_HOOK: Record<ToastRegionOverridableBinding, string> = {
  stackGap: '--ds-toast-stack-gap',
  regionInset: '--ds-toast-region-inset',
  layer: '--ds-toast-layer',
};

function hooksToStyle<Binding extends string>(
  hooks: Record<Binding, string>,
  overrides: Partial<Record<string, TokenRef | undefined>> | undefined,
): CSSProperties | undefined {
  if (!overrides) return undefined;
  const style: Record<string, string> = {};
  for (const binding of Object.keys(hooks) as Binding[]) {
    const ref = overrides[binding];
    if (ref) style[hooks[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { dismissLabel: 'Dismiss', regionLabel: 'Notifications' };

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Constants `shortDuration` / `longDuration`: motion.duration.loop × 6 / × 12, in ms. */
const LOOP_MULTIPLIER: Record<Exclude<ToastDuration, 'persistent'>, number> = { short: 6, long: 12 };

/** A resolved CSS time (`800ms`, `0.8s`) in ms; `null` when it cannot be read. */
function parseTime(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** The resolved motion.duration.loop on `el`, or `null` when it is 0 or the theme's tokens are not loaded. */
function resolveLoopMs(el: Element): number | null {
  const ms = parseTime(getComputedStyle(el).getPropertyValue('--motion-duration-loop'));
  return ms !== null && ms > 0 ? ms : null;
}

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const REGION_SELECTOR = '[data-ds="ToastRegion"]';

/** The focusable selector FocusScope walks with, kept in step with it. */
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
  if (!element.matches(FOCUSABLE_SELECTOR)) return false;
  if (element.matches(':disabled')) return false;
  return element.getAttribute('tabindex') !== '-1' && element.tabIndex >= 0;
}

function isExcludedSubtree(element: Element): boolean {
  return element.hasAttribute('inert') || element.getAttribute('aria-hidden') === 'true';
}

/**
 * FocusScope's focusable walker: document order, descending open shadow roots and assigned slot
 * nodes so a focusable inside a custom element counts. F6 and the focus restore both use it.
 */
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

/** Where focus was before it entered the toast region (by F6 or Tab); Escape and the buttons send it back. */
let returnFocusTarget: HTMLElement | null = null;

/** Moves focus to the element it came from, or else the next focusable element after `root` (the previous one when there is none). */
function returnFocus(root: HTMLElement): void {
  const target = returnFocusTarget;
  returnFocusTarget = null;
  if (target && target.isConnected && !root.contains(target)) {
    target.focus();
    return;
  }
  const candidates = collectFocusable(root.ownerDocument.body).filter((el) => !root.contains(el));
  const isAfter = (el: HTMLElement): boolean =>
    (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const next = candidates.find(isAfter);
  const previous = next === undefined ? candidates.filter((el) => !isAfter(el)).pop() : undefined;
  (next ?? previous)?.focus();
}

/** The region's timing, measured once at region mount; `loopMs` is `undefined` until then. */
interface RegionTiming {
  loopMs: number | null | undefined;
}

const ToastRegionContext: Context<RegionTiming | null> = createContext<RegionTiming | null>(null);

/**
 * The region's handle on one of its toasts: `dismissRequested` is set when `dismiss(toastId)` or
 * `dismiss()` asked it to leave, and `onExited` removes it once its exit transition has ended.
 */
interface ToastEntryHandle {
  dismissRequested: boolean;
  onExited: () => void;
}

const ToastEntryContext: Context<ToastEntryHandle | null> = createContext<ToastEntryHandle | null>(null);

function subscribeNothing(): () => void {
  return () => {};
}

export interface ToastProps extends Omit<ComponentPropsWithoutRef<'div'>, 'id' | 'children' | 'role' | 'style' | 'className'> {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s (both computed from motion.duration.loop × 6 / × 12 so themes
   * without motion still get sensible times), `persistent` until dismissed. When `actionLabel` is
   * set or `tone` is danger the toast is persistent regardless of this prop (a dev warning notes
   * the override only when `duration` was passed explicitly as `short` or `long`). If
   * motion.duration.loop resolves to 0 or cannot be resolved, both durations are persistent.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /**
   * Stable identity; showing a toast with the same toastId replaces the previous one instead of
   * stacking. It never becomes the DOM `id`; on a directly rendered Toast it has no effect.
   */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /**
   * The toast left the screen: reason `timeout`, `dismiss-button`, `escape`, `action`, `replaced`
   * (left immediately, without its exit transition), or `programmatic`. Fires synchronously when
   * the toast begins to leave; the element is removed once the exit transition ends.
   */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToastOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Toast — Design Schema, category: feedback.
 *
 * When to use:
 * Use a Toast to confirm a completed action that the user did not have to watch (sent, saved,
 * deleted, copied), to offer Undo for a reversible action, or to report a background result
 * ("Export ready" with a "View" action). Match `tone` to the outcome; use `persistent` whenever
 * there is an action, and for `danger`, so nobody misses the one they needed.
 *
 * Toasts are normally shown with `toast({ message })`, which renders them in the one
 * `ToastRegion`; rendering `<Toast>` directly is for previews and custom hosts. Toast exposes no
 * `ref`: toasts are created by `toast()`, not placed by callers.
 */
export function Toast({
  message,
  tone = 'neutral',
  actionLabel,
  duration,
  dismissible = true,
  toastId: _toastId,
  onAction,
  onDismiss,
  overrides,
  ...rest
}: ToastProps): ReactElement | null {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const regionTiming = useContext(ToastRegionContext);
  const entry = useContext(ToastEntryContext);
  const dismissRequested = entry?.dismissRequested ?? false;
  const onExitedLatest = useRef(entry?.onExited);
  onExitedLatest.current = entry?.onExited;
  const [ownLoopMs, setOwnLoopMs] = useState<number | null | undefined>(undefined);
  const loopMs = regionTiming ? regionTiming.loopMs : ownLoopMs;

  const [visible, setVisible] = useState(false);
  const [gone, setGone] = useState(false);
  const dismissedRef = useRef(false);
  const focusWithinRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissLatest = useRef(onDismiss);
  onDismissLatest.current = onDismiss;

  // An action or danger tone keeps the toast until dismissed, regardless of `duration`.
  const forcedPersistent = Boolean(actionLabel) || tone === 'danger';
  const effectiveDuration: ToastDuration = forcedPersistent ? 'persistent' : (duration ?? 'short');
  const showDismiss = dismissible || effectiveDuration === 'persistent';

  // Re-runs whenever the forced case is entered, or `duration` changes while it holds.
  useEffect(() => {
    if (isDev && forcedPersistent && (duration === 'short' || duration === 'long')) {
      console.warn(
        `Toast: \`duration: ${duration}\` is ignored — a toast with an action or \`tone: danger\` is persistent until dismissed.`,
      );
    }
  }, [forcedPersistent, duration]);

  // Outside a region, measure motion.duration.loop on the toast itself at mount.
  useEffect(() => {
    if (regionTiming || !rootRef.current) return;
    setOwnLoopMs(resolveLoopMs(rootRef.current));
  }, [regionTiming]);

  const dismiss = useCallback((reason: Exclude<ToastDismissReason, 'replaced'>) => {
    const node = rootRef.current;
    if (dismissedRef.current || !node) return;
    dismissedRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (node.contains(node.ownerDocument.activeElement)) returnFocus(node.closest<HTMLElement>(REGION_SELECTOR) ?? node);

    // onDismiss fires as the toast begins to leave; the element goes once the exit transition ends.
    onDismissLatest.current?.(reason);
    const remove = (): void => {
      setGone(true);
      onExitedLatest.current?.();
    };
    const exitMs = prefersReducedMotion() ? null : parseTime(getComputedStyle(node).getPropertyValue('--ds-toast-exit'));
    if (exitMs === null || exitMs <= 0) {
      remove();
      return;
    }
    setVisible(false);
    exitTimerRef.current = setTimeout(remove, exitMs);
  }, []);

  useEffect(
    () => () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (dismissRequested) dismiss('programmatic');
  }, [dismissRequested, dismiss]);

  // Enter: the toast mounts settled-out and reveals on the frame after it is in the DOM, so the
  // rise-and-fade runs; instant under reduced motion.
  useLayoutEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      setVisible(true);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Auto-dismiss: paused while hovered or touched, focused within, or the page is hidden. Without a
  // resolvable motion.duration.loop there is no time to count, so the toast stays until dismissed.
  useEffect(() => {
    const node = rootRef.current;
    if (effectiveDuration === 'persistent' || loopMs === undefined || loopMs === null || !node) return undefined;
    let remaining = loopMs * LOOP_MULTIPLIER[effectiveDuration];
    let startedAt = 0;
    let hovering = false;
    let focused = node.contains(node.ownerDocument.activeElement);

    const start = (): void => {
      if (timerRef.current || dismissedRef.current || hovering || focused || document.hidden) return;
      startedAt = Date.now();
      timerRef.current = setTimeout(() => dismiss('timeout'), remaining);
    };
    const pause = (): void => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remaining -= Date.now() - startedAt;
    };
    const handlePointerEnter = (): void => {
      hovering = true;
      pause();
    };
    const handlePointerLeave = (): void => {
      hovering = false;
      start();
    };
    const handleFocusIn = (): void => {
      focused = true;
      pause();
    };
    const handleFocusOut = (event: FocusEvent): void => {
      if (node.contains(event.relatedTarget as Node | null)) return;
      focused = false;
      start();
    };
    const handleVisibilityChange = (): void => {
      if (document.hidden) pause();
      else start();
    };

    start();
    node.addEventListener('pointerenter', handlePointerEnter);
    node.addEventListener('pointerleave', handlePointerLeave);
    node.addEventListener('pointercancel', handlePointerLeave);
    node.addEventListener('focusin', handleFocusIn);
    node.addEventListener('focusout', handleFocusOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      node.removeEventListener('pointerenter', handlePointerEnter);
      node.removeEventListener('pointerleave', handlePointerLeave);
      node.removeEventListener('pointercancel', handlePointerLeave);
      node.removeEventListener('focusin', handleFocusIn);
      node.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [effectiveDuration, loopMs, dismiss]);

  // Remember where focus came from when it enters by Tab, dismiss on Escape, and restore focus when
  // the toast leaves while holding it for any reason — including `replaced`, which is removed from
  // the region straight away and so unmounts without going through `dismiss`.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const region = node.closest<HTMLElement>(REGION_SELECTOR) ?? node;
    const handleFocusIn = (event: FocusEvent): void => {
      focusWithinRef.current = true;
      const from = event.relatedTarget;
      if (from instanceof HTMLElement && !region.contains(from)) returnFocusTarget = from;
    };
    const handleFocusOut = (event: FocusEvent): void => {
      if (!node.contains(event.relatedTarget as Node | null)) focusWithinRef.current = false;
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      dismiss('escape');
    };
    node.addEventListener('focusin', handleFocusIn);
    node.addEventListener('focusout', handleFocusOut);
    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('focusin', handleFocusIn);
      node.removeEventListener('focusout', handleFocusOut);
      node.removeEventListener('keydown', handleKeyDown);
      if (!focusWithinRef.current) return;
      // `dismiss` already restored focus for every other reason; only step in when focus is still
      // inside the toast (or has fallen to the body because the toast was taken out from under it).
      const active = node.ownerDocument.activeElement;
      if (active && active !== node.ownerDocument.body && !node.contains(active)) return;
      returnFocus(region);
    };
  }, [dismiss]);

  if (gone) return null;

  const handleActionClick = (): void => {
    onAction?.();
    dismiss('action');
  };

  const messageOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  if (overrides) {
    for (const binding of Object.keys(MESSAGE_FORWARDS) as (keyof typeof MESSAGE_FORWARDS)[]) {
      const tokenRef = overrides[binding];
      if (tokenRef) messageOverrides[MESSAGE_FORWARDS[binding]] = tokenRef;
    }
  }

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Toast"
      data-part="toast"
      className={`ds-toast ds-toast--${tone}${visible ? ' ds-toast--entered' : ''}`}
      style={hooksToStyle(OVERRIDE_HOOK, overrides)}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {tone !== 'neutral' ? (
        <Icon data-part="icon" name={tone} overrides={{ color: `color.inverse.status.${tone}` as TokenRef }} />
      ) : null}
      <Text element="span" size="md" data-part="message" overrides={messageOverrides}>
        {message}
      </Text>
      {/* Button owns its root's data-part, so each button part is a wrapper the toast owns around it. */}
      {actionLabel ? (
        <span className="ds-toast__action" data-part="actionButton">
          <Button variant="ghost" inverse size="sm" label={actionLabel} onClick={handleActionClick} />
        </span>
      ) : null}
      {showDismiss ? (
        <span className="ds-toast__dismiss" data-part="dismissButton">
          <Button
            variant="ghost"
            inverse
            size="sm"
            iconOnly
            label={COPY.dismissLabel}
            leadingIcon={<Icon name="close" inline />}
            onClick={() => dismiss('dismiss-button')}
          />
        </span>
      ) : null}
    </div>
  );
}

/** Options for `toast()`: the toast's props, shown in the region. */
export interface ToastOptions {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). */
  actionLabel?: string | undefined;
  /** `short` ≈ 5s, `long` ≈ 10s, `persistent` until dismissed. */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /** The toast left the screen. */
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}

interface ToastEntry {
  key: number;
  options: ToastOptions;
  dismissRequested: boolean;
  /** Reported its onDismiss and is playing its exit transition; no longer counts toward the three. */
  exiting: boolean;
  resolve: (result: { reason: ToastDismissReason }) => void;
}

/** "Do not stack more than three; the region replaces the oldest." A fixed count, not a token. */
const MAX_STACKED = 3;

let entries: ToastEntry[] = [];
const listeners = new Set<() => void>();
let entryCounter = 0;
let regionMountCount = 0;
let autoRoot: Root | null = null;

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastEntry[] {
  return entries;
}

const NO_ENTRIES: ToastEntry[] = [];

function getServerSnapshot(): ToastEntry[] {
  return NO_ENTRIES;
}

function settle(entry: ToastEntry, reason: ToastDismissReason): void {
  entry.options.onDismiss?.(reason);
  entry.resolve({ reason });
}

/** A toast began to leave (timeout, button, Escape, action, programmatic): report now, remove on `exitEntry`. */
function beginExit(key: number, reason: ToastDismissReason): void {
  const entry = entries.find((item) => item.key === key);
  if (!entry || entry.exiting) return;
  settle(entry, reason);
  entries = entries.map((item) => (item === entry ? { ...item, exiting: true } : item));
  notify();
}

/** A toast's exit transition ended: take it out of the region. */
function exitEntry(key: number): void {
  if (!entries.some((item) => item.key === key)) return;
  entries = entries.filter((item) => item.key !== key);
  notify();
}

/**
 * Adds a toast; one with the same toastId, or the oldest beyond three, leaves immediately as
 * `replaced`. Toasts already in their exit transition are neither replaced nor counted.
 */
function pushEntry(entry: ToastEntry): void {
  const id = entry.options.toastId;
  const replaced =
    id === undefined ? undefined : entries.find((item) => !item.exiting && item.options.toastId === id);
  let next = replaced ? entries.map((item) => (item === replaced ? entry : item)) : [...entries, entry];
  const active = next.filter((item) => !item.exiting);
  const evicted = active.length > MAX_STACKED ? active.slice(0, active.length - MAX_STACKED) : [];
  next = next.filter((item) => !evicted.includes(item));
  if (replaced) settle(replaced, 'replaced');
  for (const item of evicted) settle(item, 'replaced');
  entries = next;
  notify();
}

export interface ToastRegionProps {
  /** Per-instance style overrides for the region's own bindings (`stackGap`, `regionInset`, `layer`). */
  overrides?: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
  /** Portal target; defaults to `document.body`. */
  container?: HTMLElement | undefined;
}

/**
 * ToastRegion — the one persistent `role="region"` live region that holds every visible Toast.
 *
 * Mount it once at the app root, or let `toast()` create it on first use. It exists before any
 * toast so announcements fire; F6 moves focus into it from anywhere and back again.
 */
export function ToastRegion({ overrides, container }: ToastRegionProps): ReactElement | null {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False on the server and through hydration, so the portal renders only once the client owns the DOM.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const [timing, setTiming] = useState<RegionTiming>({ loopMs: undefined });

  useEffect(() => {
    regionMountCount += 1;
    return () => {
      regionMountCount -= 1;
    };
  }, []);

  // The two durations come from motion.duration.loop as resolved on the region at mount.
  useLayoutEffect(() => {
    if (hydrated && regionRef.current) setTiming({ loopMs: resolveLoopMs(regionRef.current) });
  }, [hydrated]);

  // F6 moves focus to the first toast's first button from anywhere, and back where it was on the next press.
  useEffect(() => {
    if (list.length === 0) return undefined;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'F6') return;
      const region = regionRef.current;
      if (!region) return;
      if (region.contains(document.activeElement)) {
        const target = returnFocusTarget;
        returnFocusTarget = null;
        if (!target || !target.isConnected) return;
        event.preventDefault();
        target.focus();
        return;
      }
      const first = collectFocusable(region)[0];
      if (!first) return;
      event.preventDefault();
      const active = document.activeElement;
      returnFocusTarget = active instanceof HTMLElement && active !== document.body ? active : null;
      first.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [list.length]);

  if (!hydrated) return null;

  return createPortal(
    <div
      ref={regionRef}
      role="region"
      aria-label={COPY.regionLabel}
      aria-live="polite"
      data-ds="ToastRegion"
      data-part="region"
      className="ds-toast-region"
      style={hooksToStyle(REGION_OVERRIDE_HOOK, overrides)}
    >
      <ToastRegionContext.Provider value={timing}>
        {list.map((entry) => (
          <ToastEntryContext.Provider
            key={entry.key}
            value={{ dismissRequested: entry.dismissRequested, onExited: () => exitEntry(entry.key) }}
          >
            <Toast
              message={entry.options.message}
              tone={entry.options.tone}
              actionLabel={entry.options.actionLabel}
              duration={entry.options.duration}
              dismissible={entry.options.dismissible}
              toastId={entry.options.toastId}
              onAction={entry.options.onAction}
              onDismiss={(reason) => beginExit(entry.key, reason)}
            />
          </ToastEntryContext.Provider>
        ))}
      </ToastRegionContext.Provider>
    </div>,
    container ?? document.body,
  );
}

/**
 * Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
 * rendered: `toast({ message: 'Link copied' })`. Resolves with `{ reason }` when the toast leaves.
 */
export function toast(options: ToastOptions): Promise<{ reason: ToastDismissReason }> {
  return new Promise((resolve) => {
    const entry: ToastEntry = { key: ++entryCounter, options, dismissRequested: false, exiting: false, resolve };
    if (regionMountCount > 0 || autoRoot || typeof document === 'undefined') {
      pushEntry(entry);
      return;
    }
    // Create the region empty first, so the live region exists before the content it announces.
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    autoRoot = root;
    flushSync(() => root.render(<ToastRegion />));
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => pushEntry(entry));
    else pushEntry(entry);
  });
}

/**
 * Removes the toast shown with `toastId`, or every toast when called with no id; each leaves
 * through its exit transition with reason `programmatic`.
 */
export function dismiss(toastId?: string): void {
  const matches = (entry: ToastEntry): boolean => toastId === undefined || entry.options.toastId === toastId;
  const targets = entries.filter((entry) => matches(entry) && !entry.dismissRequested && !entry.exiting);
  if (targets.length === 0) return;
  if (regionMountCount === 0) {
    // No region is rendering them, so nothing can animate out: settle and drop them now.
    entries = entries.filter((entry) => !targets.includes(entry));
    for (const entry of targets) settle(entry, 'programmatic');
    notify();
    return;
  }
  entries = entries.map((entry) => (targets.includes(entry) ? { ...entry, dismissRequested: true } : entry));
  notify();
}
