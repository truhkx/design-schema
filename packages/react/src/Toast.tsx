import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Ref, type ReactElement, type ReactPortal,
} from 'react';
import { createPortal } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';
import './Toast.css';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';
export type ToastDuration = 'short' | 'long' | 'persistent';
export type ToastDismissReason = 'timeout' | 'dismiss-button' | 'action' | 'replaced';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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
  | 'exit';

const OVERRIDE_HOOK: Record<ToastOverridableBinding, string> = {
  radius: '--ds-toast-radius',
  shadow: '--ds-toast-shadow',
  paddingBlock: '--ds-toast-padding-block',
  paddingInline: '--ds-toast-padding-inline',
  gap: '--ds-toast-gap',
  maxWidth: '--ds-toast-max-width',
  fontFamily: '--ds-toast-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-toast-font-size',
  lineHeight: '--ds-toast-line-height',
  enter: '--ds-toast-enter',
  exit: '--ds-toast-exit',
};

function overridesToStyle(overrides: Partial<Record<ToastOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ToastOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { dismissLabel: 'Dismiss', regionLabel: 'Notifications' };

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * `short`/`long` in ms. Computed from the doc's stated ~5s/~10s (motion.duration.loop × 6 / × 12);
 * hardcoded because a component has no way to read the active theme's resolved token value at
 * runtime without measuring the DOM (same reasoning as Tooltip's `DEFAULT_DELAY_MS`), so themes
 * with a different `motion.duration.loop` still get exactly these fallback times.
 */
const SHORT_DURATION_MS = 5000;
const LONG_DURATION_MS = 10000;

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside(root: HTMLElement) {
  const candidates = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !root.contains(el),
  );
  const isAfter = (el: HTMLElement) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const next = candidates.find(isAfter);
  const previous = next === undefined ? candidates.filter((el) => !isAfter(el)).pop() : undefined;
  (next ?? previous)?.focus();
}

export interface ToastProps
  extends Omit<
    ComponentPropsWithoutRef<'div'>,
    'id' | 'children' | 'role' | 'onPointerEnter' | 'onPointerLeave' | 'onFocus' | 'onBlur' | 'onKeyDown'
  > {
  /** One sentence saying what happened ("Message sent", "3 files deleted"). */
  message: string;
  /** Sets the leading icon; `neutral` has none. Toasts do not use tinted backgrounds — the icon and message carry the tone. */
  tone?: ToastTone | undefined;
  /** Label for a single action button ("Undo", "View"). When present the toast stays longer and pauses on hover and focus. */
  actionLabel?: string | undefined;
  /**
   * `short` ≈ 5s, `long` ≈ 10s, `persistent` until dismissed — required when there is an action
   * the user may need time to take, and for danger tone.
   */
  duration?: ToastDuration | undefined;
  /** Shows a dismiss button. Persistent toasts are always dismissible. */
  dismissible?: boolean | undefined;
  /** Stable identity; showing a toast with the same toastId replaces the previous one instead of stacking. */
  toastId?: string | undefined;
  /** The action button was activated. The toast dismisses. */
  onAction?: (() => void) | undefined;
  /** The toast left the screen: reason `timeout`, `dismiss-button`, `action`, or `replaced`. */
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
 */
export const Toast = function Toast({
  ref,
  message,
  tone = 'neutral',
  actionLabel,
  duration = 'short',
  dismissible = true,
  toastId,
  onAction,
  onDismiss,
  overrides,
  className,
  style,
  ...rest
}: ToastProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [visible, setVisible] = useState(false);
  const dismissedRef = useRef(false);
  const pendingReasonRef = useRef<ToastDismissReason | null>(null);
  const hoveringRef = useRef(false);
  const focusedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDismissLatest = useRef(onDismiss);
  onDismissLatest.current = onDismiss;

  // An action or danger tone forces the toast to stay until dismissed, regardless of `duration`.
  const forcedPersistent = Boolean(actionLabel) || tone === 'danger';
  const effectiveDuration: ToastDuration = forcedPersistent ? 'persistent' : duration;
  const showDismiss = dismissible || effectiveDuration === 'persistent';

  if (isDev && !message) {
    console.warn('Toast: `message` is required and is the toast’s content; it must not be empty.');
  }
  if (isDev && duration !== 'persistent' && forcedPersistent) {
    console.warn(
      'Toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.',
    );
  }

  const dismiss = useCallback((reason: ToastDismissReason) => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    pendingReasonRef.current = reason;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Enter: reveal on the next frame so the transition runs; instant under reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Exit: once `visible` drops for a dismissal, wait for the transition (or fire immediately under
  // reduced motion) before telling the consumer the toast is actually gone.
  useEffect(() => {
    if (visible || !dismissedRef.current) return undefined;
    const reason = pendingReasonRef.current;
    if (!reason) return undefined;
    if (prefersReducedMotion()) {
      onDismissLatest.current?.(reason);
      return undefined;
    }
    const node = rootRef.current;
    if (!node) return undefined;
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== node || event.propertyName !== 'opacity') return;
      onDismissLatest.current?.(reason);
    };
    node.addEventListener('transitionend', handleTransitionEnd);
    return () => node.removeEventListener('transitionend', handleTransitionEnd);
  }, [visible]);

  // Auto-dismiss timer: paused while hovered, focused-within, or the page is hidden.
  useEffect(() => {
    if (effectiveDuration === 'persistent') return undefined;
    let remaining = effectiveDuration === 'long' ? LONG_DURATION_MS : SHORT_DURATION_MS;
    let startedAt = Date.now();

    const start = () => {
      startedAt = Date.now();
      timerRef.current = setTimeout(() => dismiss('timeout'), remaining);
    };
    const pause = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remaining -= Date.now() - startedAt;
    };
    const resume = () => {
      if (timerRef.current || dismissedRef.current) return;
      if (hoveringRef.current || focusedRef.current || document.hidden) return;
      start();
    };

    start();

    const node = rootRef.current;
    const handlePointerEnter = () => {
      hoveringRef.current = true;
      pause();
    };
    const handlePointerLeave = () => {
      hoveringRef.current = false;
      resume();
    };
    const handleFocusIn = () => {
      focusedRef.current = true;
      pause();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (node?.contains(event.relatedTarget as Node | null)) return;
      focusedRef.current = false;
      resume();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) pause();
      else resume();
    };

    node?.addEventListener('pointerenter', handlePointerEnter);
    node?.addEventListener('pointerleave', handlePointerLeave);
    node?.addEventListener('focusin', handleFocusIn);
    node?.addEventListener('focusout', handleFocusOut);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      node?.removeEventListener('pointerenter', handlePointerEnter);
      node?.removeEventListener('pointerleave', handlePointerLeave);
      node?.removeEventListener('focusin', handleFocusIn);
      node?.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [effectiveDuration, dismiss]);

  // Escape dismisses the focused toast and moves focus out first, so it is never lost.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      focusOutside(node);
      dismiss('dismiss-button');
    };
    node.addEventListener('keydown', handleKeyDown);
    return () => node.removeEventListener('keydown', handleKeyDown);
  }, [dismiss]);

  const handleActionClick = () => {
    onAction?.();
    dismiss('action');
  };
  const handleDismissClick = () => dismiss('dismiss-button');

  const classes = ['ds-toast', visible ? 'ds-toast--entered' : null, className ?? null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div
      {...rest}
      ref={rootRef}
      id={toastId}
      data-ds="Toast"
      data-part="toast"
      data-tone={tone}
      className={classes}
      style={mergedStyle}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {tone !== 'neutral' ? (
        <span className="ds-toast__icon" data-part="icon" aria-hidden="true">
          <Icon name={tone} overrides={{ color: `color.inverse.status.${tone}` as TokenRef }} />
        </span>
      ) : null}
      <Text
        element="span"
        data-part="message"
        className="ds-toast__message"
        // The inverse-surface color is not forwarded here: Text's `color` binding is locked, so the
        // message reads Toast's own `--ds-toast-text` hook through `.ds-toast__message` instead.
        overrides={{
          ...(overrides?.fontFamily ? { fontFamily: overrides.fontFamily } : null),
          ...(overrides?.fontSize ? { fontSize: overrides.fontSize } : null),
          ...(overrides?.lineHeight ? { lineHeight: overrides.lineHeight } : null),
        }}
      >
        {message}
      </Text>
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
            onClick={handleDismissClick}
          />
        </span>
      ) : null}
    </div>
  );
};

/** Options for the imperative `toast()` call; the same fields as `ToastProps`, minus what only makes sense on a directly-rendered `<Toast>`. */
export interface ToastOptions {
  message: string;
  tone?: ToastTone | undefined;
  actionLabel?: string | undefined;
  duration?: ToastDuration | undefined;
  dismissible?: boolean | undefined;
  toastId?: string | undefined;
  onAction?: (() => void) | undefined;
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}

interface ToastEntry {
  id: string;
  message: string;
  tone: ToastTone;
  actionLabel?: string | undefined;
  duration: ToastDuration;
  dismissible: boolean;
  onAction?: (() => void) | undefined;
  onDismiss?: ((reason: ToastDismissReason) => void) | undefined;
}

const MAX_STACKED = 3;

let entries: ToastEntry[] = [];
const listeners = new Set<() => void>();
let toastCounter = 0;

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return entries;
}

/** Called by a Toast's own `onDismiss` once it has finished its exit transition. */
function removeEntry(id: string, reason: ToastDismissReason) {
  const target = entries.find((entry) => entry.id === id);
  if (!target) return;
  entries = entries.filter((entry) => entry.id !== id);
  notify();
  target.onDismiss?.(reason);
}

function pushEntry(entry: ToastEntry) {
  const existingIndex = entries.findIndex((item) => item.id === entry.id);
  if (existingIndex !== -1) {
    const previous = entries[existingIndex];
    const next = entries.slice();
    next[existingIndex] = entry;
    entries = next;
    previous!.onDismiss?.('replaced');
  } else {
    let next = [...entries, entry];
    let evicted: ToastEntry | null = null;
    if (next.length > MAX_STACKED) {
      evicted = next[0]!;
      next = next.slice(1);
    }
    entries = next;
    evicted?.onDismiss?.('replaced');
  }
  notify();
}

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ToastRegionOverridableBinding = 'regionInset' | 'stackGap' | 'layer';

const REGION_OVERRIDE_HOOK: Record<ToastRegionOverridableBinding, string> = {
  regionInset: '--ds-toast-region-inset',
  stackGap: '--ds-toast-region-stack-gap',
  layer: '--ds-toast-region-layer',
};

function regionOverridesToStyle(overrides: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ToastRegionOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[REGION_OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

let regionMountCount = 0;

export interface ToastRegionProps {
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ToastRegionOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * ToastRegion — the one persistent landmark that holds every visible Toast.
 *
 * Mount it once at the app root (or let `toast()` auto-mount it on first use). It exists before
 * any toast so announcements fire, is reachable from anywhere with F6, and stacks up to three
 * toasts above one another, newest last.
 */
export const ToastRegion = function ToastRegion({ ref, overrides }: ToastRegionProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactPortal | null {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const regionRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => regionRef.current as HTMLDivElement, []);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    regionMountCount += 1;
    return () => {
      regionMountCount -= 1;
    };
  }, []);

  // F6 moves focus into the region's first toast from anywhere, and back out again on a second press.
  useEffect(() => {
    if (list.length === 0) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'F6') return;
      const region = regionRef.current;
      if (!region) return;
      if (region.contains(document.activeElement)) {
        const previous = previousFocusRef.current;
        if (!previous) return;
        event.preventDefault();
        previousFocusRef.current = null;
        previous.focus();
      } else {
        const target = region.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (!target) return;
        event.preventDefault();
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        target.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [list.length]);

  if (list.length === 0) return null;

  const overrideStyle = overrides ? regionOverridesToStyle(overrides) : undefined;

  return createPortal(
    <div
      ref={regionRef}
      role="region"
      aria-label={COPY.regionLabel}
      aria-live="polite"
      data-ds="ToastRegion"
      data-part="region"
      className="ds-toast-region"
      style={overrideStyle}
    >
      {list.map((entry) => (
        <Toast
          key={entry.id}
          toastId={entry.id}
          message={entry.message}
          tone={entry.tone}
          actionLabel={entry.actionLabel}
          duration={entry.duration}
          dismissible={entry.dismissible}
          onAction={entry.onAction}
          onDismiss={(reason) => removeEntry(entry.id, reason)}
        />
      ))}
    </div>,
    document.body,
  );
};

let autoRoot: Root | null = null;

/** Creates a `<ToastRegion>` in `document.body` the first time `toast()` is called with none mounted. */
function ensureRegionMounted() {
  if (regionMountCount > 0 || autoRoot || typeof document === 'undefined') return;
  const container = document.createElement('div');
  document.body.appendChild(container);
  autoRoot = createRoot(container);
  autoRoot.render(<ToastRegion />);
}

/**
 * Shows a toast. A notification is an event, not a place in the tree, so it is called rather than
 * rendered: `toast({ message: 'Link copied' })`. Returns the toast's `id`.
 */
export function toast(options: ToastOptions): string {
  const id = options.toastId ?? `ds-toast-${++toastCounter}`;
  const tone = options.tone ?? 'neutral';
  const duration = options.duration ?? 'short';

  if (isDev) {
    if (!options.message) {
      console.warn('toast: `message` is required and is the toast’s content; it must not be empty.');
    }
    if (duration !== 'persistent' && (options.actionLabel || tone === 'danger')) {
      console.warn(
        'toast: `duration` should be `persistent` when an action is present or `tone` is `danger`, so the toast is never missed.',
      );
    }
  }

  pushEntry({
    id,
    message: options.message,
    tone,
    actionLabel: options.actionLabel,
    duration,
    dismissible: options.dismissible ?? true,
    onAction: options.onAction,
    onDismiss: options.onDismiss,
  });
  ensureRegionMounted();

  return id;
}
