import {
  Children,
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Attributes,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TooltipDelay = 'default' | 'none';

/** Style bindings that can be overridden per instance; `surface` and `text` are locked and never in this list. */
export type TooltipOverridableBinding =
  | 'radius'
  | 'paddingBlock'
  | 'paddingInline'
  | 'offset'
  | 'maxWidth'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'shadow'
  | 'layer'
  | 'enter'
  | 'exit';

/**
 * Typography belongs to the composed Text, so `fontFamily`, `fontSize` and `lineHeight` are
 * forward-only: they have no `--ds-tooltip-*` hook, and the value — an override or this default —
 * is always passed to Text's `overrides` under the same name.
 */
type TooltipTextBinding = TooltipOverridableBinding & TextOverridableBinding;

const TEXT_DEFAULT: Record<TooltipTextBinding, TokenRef> = {
  fontFamily: 'font.family.body', // literal-ok: a TokenRef forwarded to Text, not a font stack
  fontSize: 'font.size.sm',
  lineHeight: 'font.lineHeight.normal',
};

/** Hooks for the bindings the bubble styles itself; the typography three are forwarded instead. */
const OVERRIDE_HOOK: Record<Exclude<TooltipOverridableBinding, TooltipTextBinding>, string> = {
  radius: '--ds-tooltip-radius',
  paddingBlock: '--ds-tooltip-padding-block',
  paddingInline: '--ds-tooltip-padding-inline',
  offset: '--ds-tooltip-offset',
  maxWidth: '--ds-tooltip-max-width',
  shadow: '--ds-tooltip-shadow',
  layer: '--ds-tooltip-layer',
  enter: '--ds-tooltip-enter',
  exit: '--ds-tooltip-exit',
};

function overridesToStyle(overrides: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TooltipOverridableBinding[]) {
    if (binding in TEXT_DEFAULT) continue;
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding as Exclude<TooltipOverridableBinding, TooltipTextBinding>];
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Constants, read through their token expressions at the moment they are needed. */
/** hoverDelay: motion.duration.base × 3, when `delay` is `default`. */
const HOVER_DELAY = 'calc(var(--motion-duration-base) * 3)';
/** warmWindow: motion.duration.base — after one tooltip hides, the next shows with no delay. */
const WARM_WINDOW = 'var(--motion-duration-base)';
/** pointerGrace: motion.duration.fast — the pointer may cross the `offset` gap onto the bubble. */
const POINTER_GRACE = 'var(--motion-duration-fast)';

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Shared "warm until" timestamp: a toolbar's tooltips show instantly while one has just hidden. */
let warmUntil = 0;

const subscribeNothing = (): (() => void) => () => {};
/** False on the server and through hydration, true on a client-only mount: gates the portal. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function matches(query: string): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false;
}

/** `0.6s`, `600ms` → milliseconds; anything unresolved (jsdom has no `var()`) is 0. */
function parseTime(value: string): number {
  const first = value.split(',')[0]?.trim() ?? '';
  const amount = Number.parseFloat(first);
  if (Number.isNaN(amount)) return 0;
  return first.endsWith('ms') ? amount : amount * 1000;
}

/**
 * Resolves a CSS expression to its computed value by letting the browser evaluate it on a detached
 * probe inside `host`, so logic follows the live tokens (and any hook set on `host`).
 */
function resolveComputed(host: Element, property: 'transitionDuration' | 'paddingLeft', expression: string): string {
  const probe = document.createElement('span');
  probe.hidden = true;
  probe.style[property] = expression;
  host.appendChild(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

function resolveMs(host: Element, expression: string): number {
  return parseTime(resolveComputed(host, 'transitionDuration', expression));
}

function mergeIds(existing: string | undefined, id: string): string {
  return existing ? `${existing} ${id}` : id;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Positions the bubble `gap` away from the trigger on `placement`, flipping to the opposite side when it would overflow the viewport. */
function computePosition(
  triggerRect: DOMRect,
  popupRect: DOMRect,
  placement: TooltipPlacement,
  rtl: boolean,
  gap: number,
): { style: CSSProperties; side: TooltipPlacement } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const style: Record<string, number> = {};

  if (placement === 'top' || placement === 'bottom') {
    const fitsAbove = triggerRect.top - gap - popupRect.height >= 0;
    const fitsBelow = triggerRect.bottom + gap + popupRect.height <= viewportHeight;
    let side: TooltipPlacement = placement;
    if (side === 'top' && !fitsAbove && fitsBelow) side = 'bottom';
    else if (side === 'bottom' && !fitsBelow && fitsAbove) side = 'top';

    const centerX = triggerRect.left + triggerRect.width / 2;
    style.left = Math.min(Math.max(centerX - popupRect.width / 2, 0), Math.max(viewportWidth - popupRect.width, 0));
    if (side === 'top') style.bottom = viewportHeight - triggerRect.top + gap;
    else style.top = triggerRect.bottom + gap;
    return { style: style as CSSProperties, side };
  }

  // start/end are logical: inline-start is the left edge in LTR and the right edge in RTL.
  const fitsLeft = triggerRect.left - gap - popupRect.width >= 0;
  const fitsRight = triggerRect.right + gap + popupRect.width <= viewportWidth;
  let side: TooltipPlacement = placement;
  const wantsLeft = (side === 'start') !== rtl;
  if ((wantsLeft && !fitsLeft && fitsRight) || (!wantsLeft && !fitsRight && fitsLeft)) {
    side = side === 'start' ? 'end' : 'start';
  }
  const onLeft = (side === 'start') !== rtl;

  const centerY = triggerRect.top + triggerRect.height / 2;
  style.top = Math.min(Math.max(centerY - popupRect.height / 2, 0), Math.max(viewportHeight - popupRect.height, 0));
  if (onLeft) style.right = viewportWidth - triggerRect.left + gap;
  else style.left = triggerRect.right + gap;
  return { style: style as CSSProperties, side };
}

type TriggerProps = {
  ref?: Ref<HTMLElement> | undefined;
  'aria-describedby'?: string | undefined;
  'aria-labelledby'?: string | undefined;
  onPointerEnter?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
  onPointerLeave?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
  onFocus?: ((event: ReactFocusEvent<HTMLElement>) => void) | undefined;
  onBlur?: ((event: ReactFocusEvent<HTMLElement>) => void) | undefined;
};

export interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /**
   * Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a
   * non-focusable child is an error, because keyboard users could never see the tooltip.
   */
  children: ReactElement<any>;
  /**
   * Preferred side; flips when it would overflow the viewport. `start`/`end` are logical and
   * mirror in right-to-left writing.
   */
  placement?: TooltipPlacement | undefined;
  /**
   * `true`: the tooltip is supplementary and becomes the child's accessible description
   * (aria-describedby). `false`: the tooltip IS the child's name (an icon-only button whose label
   * equals the tooltip) and is linked as aria-labelledby instead — set this when the child has no
   * visible text and its `label` equals `content`, to avoid announcing it twice. When they differ
   * anyway, the tooltip text wins and the child's visible label is no longer its accessible name.
   */
  describes?: boolean | undefined;
  /**
   * Controlled visibility, for stories and tests only (the Keyboard story renders the tooltip open
   * with it). Product code never sets it: a tooltip is hover and focus driven. There is no change
   * event: Escape still hides a tooltip rendered with `open: true`, and it stays hidden until the
   * `open` prop next changes. While `open` is set, only Escape and changes to `open` affect
   * visibility; hover, focus, blur and long-press do not.
   */
  open?: boolean | undefined;
  /**
   * Hover delay before showing: `default` uses `motion.duration.base` × 3 (roughly 600ms, so casual
   * mouse movement does not flash tooltips); `none` for toolbars where a sibling tooltip is already open.
   * After any tooltip hides, siblings show with no delay for one `motion.duration.base` (the warm window),
   * which skips the delay for `default` tooltips too; `none` is always instant. The pointer may cross to
   * the tooltip within one `motion.duration.fast` before it hides.
   */
  delay?: TooltipDelay | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined;
  /** Portal target for the bubble. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
}

/**
 * Tooltip — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Tooltip on an icon-only Button to show its name on hover and focus (with `describes: false`
 * so it is the accessible name, not a second announcement), or on a labelled control to add a short
 * clarification ("Includes archived items"). Use it in toolbars, table headers and dense UI where
 * visible labels do not fit. Keep it to a phrase.
 *
 * The description lives in two nodes: a visually-hidden `role="tooltip"` span carrying the id and
 * `data-ds="Tooltip"`, always in the accessibility tree, and the positioned bubble
 * (`data-part="popup"`), which is `aria-hidden` and only a visible copy. Tooltip exposes no `ref`:
 * a caller that needs the trigger refs its own child.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  describes = true,
  open,
  delay = 'default',
  overrides,
  container,
}: TooltipProps): ReactElement {
  const tooltipId = useId();
  const hydrated = useHydrated();

  const [internalOpen, setInternalOpen] = useState(false);
  // Escape hides the tooltip until the trigger loses hover and focus, or the `open` prop changes.
  const [dismissed, setDismissed] = useState(false);
  const isOpen = !dismissed && (open ?? internalOpen);

  // Mounted while open and while the exit fade runs; `visible` follows the DOM and drives the fade.
  const [present, setPresent] = useState(isOpen);
  if (isOpen && !present) setPresent(true);
  const [visible, setVisible] = useState(false);
  const shown = visible && isOpen;
  const [position, setPosition] = useState<CSSProperties>();
  const [side, setSide] = useState<TooltipPlacement>(placement);

  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const hoveringTrigger = useRef(false);
  const hoveringPopup = useRef(false);
  const focused = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const portalTarget = (): HTMLElement => container ?? document.body;

  const clearShow = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    showTimer.current = null;
  };
  const clearHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  };

  const show = (immediate: boolean) => {
    clearHide();
    if (immediate || delay === 'none' || Date.now() < warmUntil) {
      clearShow();
      setInternalOpen(true);
      return;
    }
    if (showTimer.current) return;
    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      setInternalOpen(true);
    }, resolveMs(portalTarget(), HOVER_DELAY));
  };

  const scheduleHide = () => {
    clearShow();
    if (hideTimer.current) return;
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      if (hoveringTrigger.current || hoveringPopup.current || focused.current) return;
      setInternalOpen(false);
      // A controlled tooltip dismissed by Escape stays hidden until `open` next changes.
      if (open === undefined) setDismissed(false);
    }, resolveMs(portalTarget(), POINTER_GRACE));
  };

  useEffect(() => {
    setDismissed(false);
  }, [open]);

  useEffect(
    () => () => {
      clearShow();
      clearHide();
    },
    [],
  );

  // Position from the trigger rect before paint, and follow scroll and resize.
  useLayoutEffect(() => {
    if (!present || !hydrated) return undefined;
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return undefined;
    const reposition = () => {
      const gap = Number.parseFloat(resolveComputed(popup, 'paddingLeft', 'var(--ds-tooltip-offset)')) || 0;
      const rtl = getComputedStyle(trigger).direction === 'rtl';
      const result = computePosition(trigger.getBoundingClientRect(), popup.getBoundingClientRect(), placement, rtl, gap);
      setPosition(result.style);
      setSide(result.side);
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [present, hydrated, placement, content]);

  // Enter on the frame after the bubble is in the DOM so the fade runs; on hide, fade out for `exit`,
  // then unmount and warm siblings.
  useLayoutEffect(() => {
    if (!present || !hydrated) return undefined;
    const popup = popupRef.current;
    if (isOpen) {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const host = popup ?? portalTarget();
    warmUntil = Date.now() + resolveMs(host, WARM_WINDOW);
    const exit = matches('(prefers-reduced-motion: reduce)') ? 0 : resolveMs(host, 'var(--ds-tooltip-exit)');
    const timer = setTimeout(() => setPresent(false), exit);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, present, hydrated]);

  // Escape hides a visible tooltip without moving focus. It is consumed in the capture phase with both
  // stopPropagation and preventDefault, because a native <dialog> closes on an Escape that is not
  // default-prevented: inside a Dialog the first Escape hides the tooltip, the second closes the Dialog.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      event.preventDefault();
      clearShow();
      setDismissed(true);
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  useEffect(() => {
    if (!isDev) return;
    if (!content) console.warn('Tooltip: `content` is required; it is the trigger’s accessible description or name.');
    const trigger = triggerRef.current;
    if (!trigger) console.warn('Tooltip: the child must forward `ref` to its focusable element.');
    else if (trigger.tabIndex < 0) console.warn('Tooltip: the child must be focusable, or keyboard users can never see the tooltip.');
  }, [content]);

  const child = Children.only(children) as ReactElement<TriggerProps>;
  const childRef = child.props.ref;

  const setTriggerRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      assignRef(childRef, node);
    },
    [childRef],
  );

  // `children` is an unknown element type, so React's typings cannot admit `ref` in the clone config;
  // cast the config only.
  const cloned = cloneElement(child, {
    ref: setTriggerRef,
    'aria-describedby': describes ? mergeIds(child.props['aria-describedby'], tooltipId) : child.props['aria-describedby'],
    'aria-labelledby': describes ? child.props['aria-labelledby'] : mergeIds(child.props['aria-labelledby'], tooltipId),
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
      child.props.onPointerEnter?.(event);
      // No hover surface on touch; the description stays in the accessibility tree.
      if (event.pointerType === 'touch') return;
      hoveringTrigger.current = true;
      show(false);
    },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
      child.props.onPointerLeave?.(event);
      hoveringTrigger.current = false;
      scheduleHide();
    },
    onFocus: (event: ReactFocusEvent<HTMLElement>) => {
      child.props.onFocus?.(event);
      focused.current = true;
      show(true);
    },
    onBlur: (event: ReactFocusEvent<HTMLElement>) => {
      child.props.onBlur?.(event);
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      focused.current = false;
      scheduleHide();
    },
  } as unknown as Attributes);

  const textOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  for (const binding of Object.keys(TEXT_DEFAULT) as TooltipTextBinding[]) {
    textOverrides[binding] = overrides?.[binding] ?? TEXT_DEFAULT[binding];
  }

  const classes = ['ds-tooltip', shown ? 'ds-tooltip--visible' : null].filter(Boolean).join(' ');

  return (
    <>
      {cloned}
      <span id={tooltipId} role="tooltip" data-ds="Tooltip" className="ds-tooltip__description">
        {content}
      </span>
      {present && hydrated
        ? createPortal(
            <div
              ref={popupRef}
              data-part="popup"
              data-placement={side}
              aria-hidden="true"
              className={classes}
              style={{ ...position, ...(overrides ? overridesToStyle(overrides) : undefined) }}
              onPointerEnter={() => {
                hoveringPopup.current = true;
                clearHide();
              }}
              onPointerLeave={() => {
                hoveringPopup.current = false;
                scheduleHide();
              }}
            >
              <Text element="span" size="sm" data-part="text" overrides={textOverrides}>
                {content}
              </Text>
            </div>,
            portalTarget(),
          )
        : null}
    </>
  );
}
