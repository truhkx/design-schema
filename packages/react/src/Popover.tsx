import {
  Fragment,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import './Popover.css';

export type PopoverPlacement =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'start'
  | 'end';

/** Heading level of the panel heading. Accepts the schema's string values and their numeric equivalents. */
export type PopoverHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** Where focus goes on open: the first control, or nowhere (the composer moves it). */
export type PopoverInitialFocus = 'first' | 'none';

/**
 * Why `onOpenChange` fired. Keeps its exported name although the union includes `trigger`, which
 * also opens.
 */
export type PopoverCloseReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** @deprecated Use `PopoverCloseReason`, the name every platform exports. */
export type PopoverOpenChangeReason = PopoverCloseReason;

/**
 * Style bindings that can be overridden per instance; `surface`, `breakpoint`, `focusRing` and
 * `focusRingWidth` are locked (their hooks stay themeable from page CSS).
 */
export type PopoverOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'offset'
  | 'arrowSize'
  | 'maxWidth'
  | 'gutter'
  | 'layer'
  | 'enter'
  | 'enterDistance'
  | 'exit';

const OVERRIDE_HOOK: Record<PopoverOverridableBinding, string> = {
  border: '--ds-popover-border',
  borderWidth: '--ds-popover-border-width',
  shadow: '--ds-popover-shadow',
  radius: '--ds-popover-radius',
  inset: '--ds-popover-inset',
  partGap: '--ds-popover-part-gap',
  offset: '--ds-popover-offset',
  arrowSize: '--ds-popover-arrow-size',
  maxWidth: '--ds-popover-max-width',
  gutter: '--ds-popover-gutter',
  layer: '--ds-popover-layer',
  enter: '--ds-popover-enter',
  enterDistance: '--ds-popover-enter-distance',
  exit: '--ds-popover-exit',
};

function overridesToStyle(overrides: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as PopoverOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // A locked binding passed at runtime has no hook here and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { closeLabel: 'Close' };

declare const process: { env: { NODE_ENV?: string } };

/** The side of the trigger the panel sits on, resolved to physical for positioning and the arrow. */
type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'summary',
  'iframe',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

function tabbablesIn(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) =>
      !element.matches(':disabled') &&
      element.tabIndex >= 0 &&
      !element.hasAttribute('data-focus-sentinel') &&
      !element.closest('[inert], [aria-hidden="true"]'),
  );
}

function supportsPopoverApi(): boolean {
  return typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';
}

/** False on the server and through hydration, true on a client-only mount and after hydration. */
function subscribeNothing(): () => void {
  return () => {};
}

/** Modal scroll lock on the root element, reference-counted across open modal popovers. */
let scrollLockCount = 0;
function lockScroll(): () => void {
  scrollLockCount += 1;
  document.documentElement.classList.add('ds-popover-lock-scroll');
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.documentElement.classList.remove('ds-popover-lock-scroll');
  };
}

/** Longest transition on the element in milliseconds; 0 when there is none (reduced motion, jsdom). */
function transitionMs(element: HTMLElement): number {
  const values = getComputedStyle(element).transitionDuration.split(',');
  let longest = 0;
  for (const value of values) {
    const trimmed = value.trim();
    const amount = parseFloat(trimmed);
    if (Number.isNaN(amount)) continue;
    longest = Math.max(longest, trimmed.endsWith('ms') ? amount : amount * 1000);
  }
  return longest;
}

/** A custom-property length read back in pixels (`px`, or `rem` against the root font size). */
function lengthPx(element: HTMLElement, property: string): number {
  const raw = getComputedStyle(element).getPropertyValue(property).trim();
  const amount = parseFloat(raw);
  if (Number.isNaN(amount)) return 0;
  if (raw.endsWith('rem')) return amount * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 0);
  return amount;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Preferred physical side for `placement`; `start`/`end` resolve from the trigger's direction. */
function preferredSide(placement: PopoverPlacement, rtl: boolean): PopoverSide {
  if (placement === 'start') return rtl ? 'right' : 'left';
  if (placement === 'end') return rtl ? 'left' : 'right';
  return placement.startsWith('top') ? 'top' : 'bottom';
}

const OPPOSITE: Record<PopoverSide, PopoverSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

/**
 * Positions the fixed panel from the trigger rect. It flips to the opposite side only when the
 * preferred one overflows and the opposite fits within the gutter; otherwise it stays, and it
 * shifts along the cross axis alone to keep the gutter, so the main axis may overflow.
 */
function positionPanel(trigger: HTMLElement, panel: HTMLElement, placement: PopoverPlacement): void {
  const rtl = getComputedStyle(trigger).direction === 'rtl';
  const t = trigger.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
  const gutter = lengthPx(panel, '--ds-popover-gutter');

  let side = preferredSide(placement, rtl);
  if (panel.dataset.side !== side) panel.dataset.side = side;
  const computed = getComputedStyle(panel);
  const offset = Math.max(
    parseFloat(computed.marginTop) || 0,
    parseFloat(computed.marginBottom) || 0,
    parseFloat(computed.marginLeft) || 0,
    parseFloat(computed.marginRight) || 0,
  );
  const p = panel.getBoundingClientRect();

  const fits = (candidate: PopoverSide): boolean => {
    if (candidate === 'bottom') return t.bottom + offset + p.height <= viewportHeight - gutter;
    if (candidate === 'top') return t.top - offset - p.height >= gutter;
    if (candidate === 'left') return t.left - offset - p.width >= gutter;
    return t.right + offset + p.width <= viewportWidth - gutter;
  };
  if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];
  if (panel.dataset.side !== side) panel.dataset.side = side;

  // The panel is placed by `top`/`left`, where the offset margin moves the box only when the side
  // facing the trigger is the panel's own top or left edge (data-side bottom or right). On the other
  // two the margin is inert, so the position math subtracts the value read back above instead, and
  // the gap comes out the same on all four sides.
  const coords: { top: string; left: string } = { top: '', left: '' };
  if (side === 'top' || side === 'bottom') {
    const align = placement.endsWith('-start') ? 'start' : placement.endsWith('-end') ? 'end' : 'center';
    let x = t.left + (t.width - p.width) / 2;
    if (align === 'start') x = rtl ? t.right - p.width : t.left;
    if (align === 'end') x = rtl ? t.left : t.right - p.width;
    coords.left = `${clamp(x, gutter, viewportWidth - gutter - p.width)}px`;
    coords.top = side === 'bottom' ? `${t.bottom}px` : `${t.top - p.height - offset}px`;
  } else {
    coords.top = `${clamp(t.top + (t.height - p.height) / 2, gutter, viewportHeight - gutter - p.height)}px`;
    coords.left = side === 'right' ? `${t.right}px` : `${t.left - p.width - offset}px`;
  }
  if (panel.style.top !== coords.top) panel.style.top = coords.top;
  if (panel.style.left !== coords.left) panel.style.left = coords.left;
}

/** The trigger's readable name, as `aria-labelledby` pointing at it would compute it (approximately). */
function readableName(element: HTMLElement): string {
  const label = element.getAttribute('aria-label')?.trim();
  if (label) return label;
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ')
      .trim();
    if (text) return text;
  }
  return element.textContent?.trim() || element.getAttribute('title')?.trim() || '';
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

interface TriggerProps {
  id?: string | undefined;
  ref?: Ref<HTMLElement> | undefined;
  onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined;
}

export interface PopoverProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'id' | 'popover'> {
  /**
   * Exactly one focusable element — usually a Button — that opens the popover; typed as a single
   * element, since it is cloned with aria-expanded/aria-controls and the toggle handler. A fragment,
   * a bare string or anything but one element warns in development, since it never opens the panel.
   */
  trigger: ReactElement;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger. */
  heading?: string | undefined;
  /** Heading level of the panel heading, so it fits the page outline (a popover usually sits under a level-2 section). */
  headingLevel?: PopoverHeadingLevel | undefined;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it); the uncontrolled popover starts closed and there is no defaultOpen. */
  open?: boolean | undefined;
  /**
   * Preferred side and alignment; flips and shifts to stay in the viewport. All eight values are
   * logical: `start`/`end` and the `-start`/`-end` alignments mirror in right-to-left writing.
   */
  placement?: PopoverPlacement | undefined;
  /**
   * False (default): the page stays interactive; clicking outside closes; focus moves in but is not
   * trapped, and Tab out closes. True: behaves as a small Dialog anchored to the trigger — focus
   * trapped, background inert, page scroll locked, no scrim — for content that must be finished (a
   * required form); pressing outside does nothing.
   */
  modal?: boolean | undefined;
  /** A small pointer toward the trigger. Off by default; Calm & precise prefers a plain edge. */
  showArrow?: boolean | undefined;
  /**
   * Show the close button. Escape and outside click work regardless (non-modal), so this is a
   * visibility switch, not Dialog's "must be answered" rule: with it false there is simply no close button.
   */
  dismissible?: boolean | undefined;
  /**
   * Where focus goes on open. `first` (default) is the first control: the first focusable element in
   * the body, then the close button, then the heading, then the panel. `none` moves no focus: a
   * composing component that opens the popover on content it owns focuses its own element once the
   * panel is shown, and until it does focus stays on the trigger.
   */
  initialFocus?: PopoverInitialFocus | undefined;
  /**
   * Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `outside`, `close-button`, `tab-out`.
   */
  onOpenChange?: ((open: boolean, reason: PopoverCloseReason) => void) | undefined;
  /** Portal target for the panel. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Popover — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date field,
 * a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help with a
 * link. Use `modal` when the panel contains a required step (a short form that must be submitted or
 * cancelled). Use `heading` when the content is not obvious from the trigger.
 *
 * The root (`data-ds="Popover"`, the override hooks, and `ref`) is the panel, which exists only while
 * open or closing (the ref is null while closed); the trigger is rendered in place and the panel
 * through a portal once hydrated.
 */
export function Popover({
  ref,
  trigger,
  children,
  heading,
  headingLevel = '3',
  open: openProp,
  placement = 'bottom',
  modal = false,
  showArrow = false,
  dismissible = true,
  initialFocus = 'first',
  onOpenChange,
  container,
  overrides,
  // Never forwarded to the root: `overrides` is the only per-instance styling.
  className: _className,
  style: _style,
  ...rest
}: PopoverProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const generatedId = useId();
  const panelId = `ds-popover${generatedId}-panel`;
  const headingId = `ds-popover${generatedId}-heading`;

  // The portal needs `document`: render no panel until hydrated, exactly as the server did.
  const hydrated = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? openProp : internalOpen;

  // Mounted while open, and while the exit transition runs after `open` goes false.
  const [exiting, setExiting] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setExiting(!open);
  }
  const mounted = open || exiting;
  // The open class follows the DOM: turned on a frame after the panel is shown.
  const [visible, setVisible] = useState(false);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  /** The reason of the close the popover itself reported; null for a close the consumer made alone. */
  const closeReasonRef = useRef<PopoverCloseReason | null>(null);
  const escapeHandledRef = useRef(false);
  const selfClosingRef = useRef(false);
  const warnedRef = useRef({ trigger: false, name: false });

  const latest = useRef({ open, placement, initialFocus });
  latest.current = { open, placement, initialFocus };

  const validTrigger = isValidElement(trigger) && trigger.type !== Fragment;
  if (process.env.NODE_ENV !== 'production' && !validTrigger && !warnedRef.current.trigger) {
    warnedRef.current.trigger = true;
    console.warn('Popover: `trigger` must be exactly one element (usually a Button); this one can never open the panel.');
  }

  const changeOpen = (next: boolean, reason: PopoverCloseReason): void => {
    closeReasonRef.current = next ? null : reason;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next, reason);
  };

  const setPanelRef = useCallback(
    (node: HTMLElement | null): void => {
      panelRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  /** The first control in the body, else the close button, else the heading, else the panel. */
  const placeInitialFocus = (): void => {
    const panel = panelRef.current;
    if (!panel || latest.current.initialFocus === 'none') return;
    const target =
      (bodyRef.current ? tabbablesIn(bodyRef.current)[0] : undefined) ??
      closeButtonRef.current ??
      headingRef.current ??
      panel;
    target.focus();
  };

  // Position while open: on open, on a placement change, and on scroll and resize.
  useLayoutEffect(() => {
    if (!hydrated || !open) return undefined;
    const reposition = (): void => {
      const anchor = triggerRef.current;
      const panel = panelRef.current;
      if (anchor && panel) positionPanel(anchor, panel, latest.current.placement);
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [hydrated, open, modal, placement]);

  // Open: enter the top layer, move focus in, then reveal on the next frame. Close: leave the top
  // layer, return focus per the reason, and unmount once the exit transition has run.
  useLayoutEffect(() => {
    if (!hydrated) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    if (open) {
      selfClosingRef.current = false;
      if (panel instanceof HTMLDialogElement) {
        if (!panel.open) {
          if (typeof panel.showModal === 'function') panel.showModal();
          else panel.setAttribute('open', '');
        }
      } else if (supportsPopoverApi() && !panel.matches(':popover-open')) {
        panel.showPopover();
      }
      placeInitialFocus();
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const reason = closeReasonRef.current;
    closeReasonRef.current = null;
    // A modal close() moves focus to the body, so the body counts as inside.
    const active = document.activeElement;
    const focusInside = active === null || active === document.body || panel.contains(active);
    const restore =
      reason === 'trigger' || reason === 'escape' || reason === 'close-button' ? true : reason === null && focusInside;

    if (panel instanceof HTMLDialogElement) {
      if (panel.open) {
        selfClosingRef.current = true;
        if (typeof panel.close === 'function') panel.close();
        else panel.removeAttribute('open');
      }
    } else if (supportsPopoverApi() && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
    if (restore) triggerRef.current?.focus();

    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      setExiting(false);
    };
    const duration = transitionMs(panel);
    if (duration === 0) {
      finish();
      return undefined;
    }
    const handleEnd = (event: TransitionEvent): void => {
      if (event.target === panel) finish();
    };
    panel.addEventListener('transitionend', handleEnd);
    panel.addEventListener('transitioncancel', handleEnd);
    const timer = window.setTimeout(finish, duration);
    return () => {
      panel.removeEventListener('transitionend', handleEnd);
      panel.removeEventListener('transitioncancel', handleEnd);
      window.clearTimeout(timer);
    };
  }, [hydrated, open, modal]);

  // Modal only: lock page scroll while open (no scrim; the ::backdrop is transparent).
  useLayoutEffect(() => {
    if (!hydrated || !open || !modal) return undefined;
    return lockScroll();
  }, [hydrated, open, modal]);

  // Non-modal: a pointerdown outside the panel and the trigger closes. The only dismissal listener.
  useEffect(() => {
    if (!hydrated || !open || modal) return undefined;
    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      changeOpen(false, 'outside');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  });

  // Development: a panel with no heading and a trigger with no readable name has no accessible name.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !hydrated || !open || heading || warnedRef.current.name) return;
    const anchor = triggerRef.current;
    if (anchor && readableName(anchor)) return;
    warnedRef.current.name = true;
    console.warn('Popover: the panel has no accessible name — give it a `heading`, or give the trigger a readable name.');
  }, [hydrated, open, heading]);

  const reportEscape = (): void => {
    escapeHandledRef.current = true;
    // The browser's `cancel` and `close` for this same key follow the keydown's listeners; skip them once.
    setTimeout(() => {
      escapeHandledRef.current = false;
    }, 0);
    changeOpen(false, 'escape');
  };

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    rest.onKeyDown?.(event as ReactKeyboardEvent<HTMLDivElement>);
    if (!open || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      // Keep an enclosing overlay (a Popover inside a Dialog) from closing on the same key.
      event.stopPropagation();
      if (!escapeHandledRef.current) reportEscape();
      return;
    }
    // Modal: no Tab handler; the wrap is FocusScope's.
    if (event.key !== 'Tab' || modal || event.altKey || event.ctrlKey || event.metaKey) return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = tabbablesIn(panel);
    const active = document.activeElement;
    const atStart = focusables.length === 0 || active === focusables[0];
    const atEnd = focusables.length === 0 || active === focusables[focusables.length - 1];
    if (event.shiftKey && atStart) {
      event.preventDefault();
      triggerRef.current?.focus();
      changeOpen(false, 'tab-out');
    } else if (!event.shiftKey && atEnd) {
      // No preventDefault: focus the trigger and let this Tab continue from it to the element after
      // it (or out of the page, as a native Tab would), without waiting for `open` to go false.
      triggerRef.current?.focus();
      changeOpen(false, 'tab-out');
    }
  };

  // The `closeButton` part hook is the wrapper, since Button names its own root part: a click that
  // lands on the wrapper rather than the button is forwarded to it instead of being swallowed.
  const handleCloseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = closeButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  // Escape before focus has moved in reaches the dialog as `cancel`; the consumer owns `open`.
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    reportEscape();
  };

  // A close the component did not ask for (a close watcher closing with no `cancel`) is an Escape;
  // if the consumer still holds `open` true, the dialog is shown again.
  const handleNativeClose = (): void => {
    if (selfClosingRef.current) {
      selfClosingRef.current = false;
      return;
    }
    if (!open) return;
    if (!escapeHandledRef.current) reportEscape();
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!(panel instanceof HTMLDialogElement) || panel.open || !latest.current.open) return;
      if (typeof panel.showModal === 'function') panel.showModal();
      else panel.setAttribute('open', '');
      placeInitialFocus();
    });
  };

  const triggerElement = validTrigger ? (trigger as ReactElement<TriggerProps>) : null;
  const triggerProps: TriggerProps = triggerElement?.props ?? {};
  const triggerId = triggerProps.id ?? `ds-popover${generatedId}-trigger`;
  const consumerTriggerRef = triggerProps.ref;
  const setTriggerRef = useCallback(
    (node: HTMLElement | null): void => {
      triggerRef.current = node;
      assignRef(consumerTriggerRef, node);
    },
    [consumerTriggerRef],
  );

  const panelShown = hydrated && mounted;

  const clonedTrigger = triggerElement
    ? cloneElement(triggerElement, {
        id: triggerId,
        ref: setTriggerRef,
        'aria-expanded': open ? 'true' : 'false',
        'aria-controls': panelShown ? panelId : undefined,
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          triggerProps.onClick?.(event);
          changeOpen(!open, 'trigger');
        },
      } as TriggerProps)
    : trigger;

  const classes = ['ds-popover', visible && open ? 'ds-popover--visible' : null].filter(Boolean).join(' ');
  const PanelTag = modal ? 'dialog' : 'div';
  const hasHeader = Boolean(heading) || dismissible;

  const panelNode = panelShown ? (
    <PanelTag
      {...(rest as Record<string, unknown>)}
      {...(modal
        ? { onCancel: handleCancel, onClose: handleNativeClose }
        : { popover: supportsPopoverApi() ? ('manual' as const) : undefined })}
      ref={setPanelRef}
      id={panelId}
      role="dialog"
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={heading ? headingId : triggerId}
      data-ds="Popover"
      data-part="panel"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      tabIndex={-1}
      onKeyDown={handlePanelKeyDown}
    >
      {showArrow ? <span aria-hidden="true" className="ds-popover__arrow" data-part="arrow" /> : null}
      <FocusScope trapped={modal} autoFocus="none" restoreFocus={false} active={open}>
        {/* FocusScope writes its own data-part="scope", so the focusScope part is this wrapper inside it. */}
        <div className="ds-popover__content" data-part="focusScope">
          {hasHeader ? (
            <div className="ds-popover__header">
              {heading ? (
                <div className="ds-popover__heading" data-part="heading">
                  <Heading level={headingLevel} id={headingId} ref={headingRef} tabIndex={-1}>
                    {heading}
                  </Heading>
                </div>
              ) : null}
              {dismissible ? (
                <span className="ds-popover__close" data-part="closeButton" onClick={handleCloseTargetClick}>
                  <Button
                    ref={closeButtonRef}
                    variant="ghost"
                    size="sm"
                    iconOnly
                    label={COPY.closeLabel}
                    leadingIcon={<Icon name="close" inline />}
                    onClick={() => changeOpen(false, 'close-button')}
                  />
                </span>
              ) : null}
            </div>
          ) : null}
          <Box data-part="body" ref={bodyRef}>
            {children}
          </Box>
        </div>
      </FocusScope>
    </PanelTag>
  ) : null;

  return (
    <>
      {clonedTrigger}
      {panelNode ? createPortal(panelNode, container ?? document.body) : null}
    </>
  );
}
