import {
  Children,
  cloneElement,
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type Attributes,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';
export type TooltipDelay = 'default' | 'none';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const OVERRIDE_HOOK: Record<TooltipOverridableBinding, string> = {
  radius: '--ds-tooltip-radius',
  paddingBlock: '--ds-tooltip-padding-block',
  paddingInline: '--ds-tooltip-padding-inline',
  offset: '--ds-tooltip-offset',
  maxWidth: '--ds-tooltip-max-width',
  fontFamily: '--ds-tooltip-font-family', /* literal-ok: CSS custom-property name, not a font stack */
  fontSize: '--ds-tooltip-font-size',
  lineHeight: '--ds-tooltip-line-height',
  shadow: '--ds-tooltip-shadow',
  layer: '--ds-tooltip-layer',
  enter: '--ds-tooltip-enter',
  exit: '--ds-tooltip-exit',
};

function overridesToStyle(overrides: Partial<Record<TooltipOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TooltipOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** No hover surface on touch; the trigger still carries the accessible description/name. */
function hasNoHover(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(hover: none), (pointer: coarse)').matches
    : false;
}

/** delay.default: motion.duration.base × 3 — the doc calls out ~600ms with `motion.duration.base` at 200ms. */
const DEFAULT_DELAY_MS = 600;
/**
 * How long a tooltip stays "warm" after it closes, so the next one in a toolbar opens instantly.
 * Not a token: the doc names the effect but not a duration, so this reuses the show delay's length.
 */
const WARM_WINDOW_MS = DEFAULT_DELAY_MS;
/** Grace period before actually hiding, so the pointer can cross the `offset` gap onto the popup itself (WCAG 1.4.13 hoverable). Not specified by the doc. */
const CLOSE_GRACE_MS = 100;

let warmUntil = 0;

function markWarm() {
  warmUntil = Date.now() + WARM_WINDOW_MS;
}

function isWarm(): boolean {
  return Date.now() < warmUntil;
}

function mergeIds(existing: string | undefined, id: string): string {
  return existing ? `${existing} ${id}` : id;
}

/** Positions the popup from the trigger's rect for `placement`, flipping when it would overflow the viewport. */
function computePosition(
  triggerRect: DOMRect,
  popupRect: DOMRect,
  placement: TooltipPlacement,
  rtl: boolean,
): { style: CSSProperties; resolved: TooltipPlacement } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let resolved = placement;
  if (placement === 'top' && triggerRect.top - popupRect.height < 0 && triggerRect.bottom + popupRect.height <= viewportHeight) {
    resolved = 'bottom';
  } else if (
    placement === 'bottom' &&
    triggerRect.bottom + popupRect.height > viewportHeight &&
    triggerRect.top - popupRect.height >= 0
  ) {
    resolved = 'top';
  } else if (
    placement === 'start' &&
    (rtl ? triggerRect.right + popupRect.width > viewportWidth : triggerRect.left - popupRect.width < 0) &&
    (rtl ? triggerRect.left - popupRect.width >= 0 : triggerRect.right + popupRect.width <= viewportWidth)
  ) {
    resolved = 'end';
  } else if (
    placement === 'end' &&
    (rtl ? triggerRect.left - popupRect.width < 0 : triggerRect.right + popupRect.width > viewportWidth) &&
    (rtl ? triggerRect.right + popupRect.width <= viewportWidth : triggerRect.left - popupRect.width >= 0)
  ) {
    resolved = 'start';
  }

  const style: Record<string, number> = {};

  if (resolved === 'top' || resolved === 'bottom') {
    const centerX = triggerRect.left + triggerRect.width / 2;
    const left = Math.min(Math.max(centerX - popupRect.width / 2, 0), Math.max(viewportWidth - popupRect.width, 0));
    style.left = left;
    if (resolved === 'top') style.bottom = viewportHeight - triggerRect.top;
    else style.top = triggerRect.bottom;
  } else {
    const centerY = triggerRect.top + triggerRect.height / 2;
    const top = Math.min(Math.max(centerY - popupRect.height / 2, 0), Math.max(viewportHeight - popupRect.height, 0));
    style.top = top;
    // start/end are logical: start is the inline-start edge, which is the left edge in LTR and the right edge in RTL.
    const startIsLeft = !rtl;
    const wantsLeftSide = resolved === 'start' ? startIsLeft : !startIsLeft;
    if (wantsLeftSide) style.right = viewportWidth - triggerRect.left;
    else style.left = triggerRect.right;
  }

  return { style: style as CSSProperties, resolved };
}

export interface TooltipProps {
  /** The tooltip text. One short phrase or sentence; no markup, no links, no line breaks. */
  content: string;
  /** Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error, because keyboard users could never see the tooltip. */
  children: ReactElement;
  /** Preferred side; flips when it would overflow the viewport. */
  placement?: TooltipPlacement;
  /**
   * `true`: the tooltip is supplementary and becomes the child's accessible description
   * (aria-describedby). `false`: the tooltip IS the child's name (an icon-only button whose label
   * equals the tooltip) and is linked as aria-labelledby instead.
   */
  describes?: boolean;
  /**
   * Hover delay before showing: `default` uses `motion.duration.base` × 3 (roughly 600ms); `none`
   * for toolbars where a sibling tooltip is already open.
   */
  delay?: TooltipDelay;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TooltipOverridableBinding, TokenRef>>;
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
 * Do not put essential instructions, error messages or any content the user must read in a
 * tooltip; use helper text (Input `description`), an Alert, or a Disclosure. Do not put links or
 * buttons in it — a tooltip is not interactive, and an interactive overlay is a Popover (planned).
 * Do not attach it to a non-focusable element (an icon, a span): keyboard users could never open
 * it. Do not use it on touch-first screens to explain controls; on native the text becomes a hint
 * and is not visible.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, children, placement = 'top', describes = true, delay = 'default', overrides },
  ref,
) {
  const generatedId = useId();
  const tooltipId = `ds-tooltip${generatedId}`;

  const triggerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => popupRef.current as HTMLDivElement, []);

  // Mounted while the tooltip should show, and while the exit transition finishes after it hides.
  const [present, setPresent] = useState(false);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);
  const [popupStyle, setPopupStyle] = useState<CSSProperties>();
  const [resolvedPlacement, setResolvedPlacement] = useState<TooltipPlacement>(placement);

  // Open is derived from hover/focus, not stored directly: `present` is the source of truth for
  // whether the popup exists, mirroring the mount/exit pattern used by AlertDialog and Menu.
  const wantOpenRef = useRef(false);
  const hoveringTriggerRef = useRef(false);
  const hoveringPopupRef = useRef(false);
  const focusedRef = useRef(false);
  const dismissedRef = useRef(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latest = useRef({ delay, placement });
  latest.current = { delay, placement };

  if (isDev && !content) {
    console.warn('Tooltip: `content` is required and becomes the trigger’s accessible description or name; it must not be empty.');
  }
  if (isDev && Children.count(children) !== 1) {
    console.warn('Tooltip: `children` must be exactly one focusable element.');
  }

  const clearShowTimer = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };
  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const open = () => {
    clearShowTimer();
    clearHideTimer();
    if (wantOpenRef.current) return;
    wantOpenRef.current = true;
    markWarm();
    setPresent(true);
  };

  const close = () => {
    clearShowTimer();
    clearHideTimer();
    if (!wantOpenRef.current) return;
    wantOpenRef.current = false;
    markWarm();
    setVisible(false);
  };

  const requestOpen = (immediate: boolean) => {
    if (wantOpenRef.current) return;
    clearHideTimer();
    if (immediate || latest.current.delay === 'none' || isWarm()) {
      open();
    } else if (!showTimerRef.current) {
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null;
        open();
      }, DEFAULT_DELAY_MS);
    }
  };

  const requestClose = () => {
    clearShowTimer();
    if (!wantOpenRef.current) return;
    if (hideTimerRef.current) return;
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      if (!hoveringTriggerRef.current && !hoveringPopupRef.current && !focusedRef.current) close();
    }, CLOSE_GRACE_MS);
  };

  // Position on mount, reveal on the next frame, and reposition while the viewport moves.
  useLayoutEffect(() => {
    if (!present) return undefined;
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return undefined;

    const reposition = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const rtl = getComputedStyle(trigger).direction === 'rtl';
      const result = computePosition(triggerRect, popupRect, latest.current.placement, rtl);
      setPopupStyle(result.style);
      setResolvedPlacement(result.resolved);
    };
    reposition();

    if (prefersReducedMotion()) setVisible(true);
    else requestAnimationFrame(() => setVisible(true));

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [present]);

  // Exit: hide, then unmount once the transition finishes (immediately under reduced motion).
  useEffect(() => {
    if (wantOpenRef.current || !present) return undefined;
    const popup = popupRef.current;
    if (!popup || prefersReducedMotion()) {
      setPresent(false);
      return undefined;
    }
    const handleExited = (event: TransitionEvent) => {
      if (event.target !== popup || event.propertyName !== 'opacity') return;
      setPresent(false);
    };
    popup.addEventListener('transitionend', handleExited);
    return () => popup.removeEventListener('transitionend', handleExited);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, present]);

  // Escape hides without moving focus, and does not reopen while the trigger stays focused/hovered.
  useEffect(() => {
    if (!present) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      dismissedRef.current = true;
      close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [present]);

  useEffect(() => () => clearShowTimer(), []);
  useEffect(() => () => clearHideTimer(), []);

  const handleTriggerPointerEnter = () => {
    if (hasNoHover()) return;
    hoveringTriggerRef.current = true;
    if (!dismissedRef.current) requestOpen(false);
  };
  const handleTriggerPointerLeave = () => {
    hoveringTriggerRef.current = false;
    dismissedRef.current = false;
    requestClose();
  };
  const handleTriggerFocus = () => {
    focusedRef.current = true;
    if (!dismissedRef.current) requestOpen(true);
  };
  const handleTriggerBlur = (event: ReactFocusEvent) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    focusedRef.current = false;
    dismissedRef.current = false;
    requestClose();
  };
  const handlePopupPointerEnter = () => {
    hoveringPopupRef.current = true;
    clearHideTimer();
  };
  const handlePopupPointerLeave = () => {
    hoveringPopupRef.current = false;
    requestClose();
  };

  const child = Children.only(children) as ReactElement<{
    'aria-describedby'?: string;
    'aria-labelledby'?: string;
    onPointerEnter?: (event: ReactPointerEvent) => void;
    onPointerLeave?: (event: ReactPointerEvent) => void;
    onFocus?: (event: ReactFocusEvent) => void;
    onBlur?: (event: ReactFocusEvent) => void;
  }>;

  // `children` is an arbitrary, unknown element type, so there is no generic-safe way to type a
  // `ref` in cloneElement's config (React's own typings only admit `ref` for statically known
  // element/class types). Cast the config, not the element or its props, to keep the rest typed.
  const clonedProps = {
    ref: triggerRef,
    'aria-describedby': describes ? mergeIds(child.props['aria-describedby'], tooltipId) : child.props['aria-describedby'],
    'aria-labelledby': !describes ? mergeIds(child.props['aria-labelledby'], tooltipId) : child.props['aria-labelledby'],
    onPointerEnter: (event: ReactPointerEvent) => {
      child.props.onPointerEnter?.(event);
      handleTriggerPointerEnter();
    },
    onPointerLeave: (event: ReactPointerEvent) => {
      child.props.onPointerLeave?.(event);
      handleTriggerPointerLeave();
    },
    onFocus: (event: ReactFocusEvent) => {
      child.props.onFocus?.(event);
      handleTriggerFocus();
    },
    onBlur: (event: ReactFocusEvent) => {
      child.props.onBlur?.(event);
      handleTriggerBlur(event);
    },
  } as unknown as Attributes;
  const cloned = cloneElement(child, clonedProps);

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = { ...popupStyle, ...overrideStyle };

  const popupClasses = ['ds-tooltip', visible ? 'ds-tooltip--entered' : null].filter(Boolean).join(' ');

  return (
    <>
      {cloned}
      {present
        ? createPortal(
            <div
              ref={popupRef}
              role="tooltip"
              id={tooltipId}
              data-ds="Tooltip"
              data-placement={resolvedPlacement}
              className={popupClasses}
              style={mergedStyle}
              onPointerEnter={handlePopupPointerEnter}
              onPointerLeave={handlePopupPointerLeave}
            >
              <span className="ds-tooltip__text" data-part="text">
                {content}
              </span>
            </div>,
            document.body,
          )
        : null}
    </>
  );
});
