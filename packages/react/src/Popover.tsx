import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefCallback,
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

export type PopoverOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** Style bindings that can be overridden per instance; `surface`, `focusRing` and `focusRingWidth` are locked. */
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
      !element.closest('[inert]'),
  );
}

function supportsPopoverApi(): boolean {
  return typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.showPopover === 'function';
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
 * Positions the fixed panel from the trigger rect: flips to the opposite side when the preferred
 * one overflows and the opposite fits, then shifts along the cross axis to stay in the viewport.
 * The offset itself is the panel's margin on the trigger side (CSS, from the `offset` hook).
 */
function positionPanel(trigger: HTMLElement, panel: HTMLElement, placement: PopoverPlacement): void {
  const rtl = getComputedStyle(trigger).direction === 'rtl';
  const t = trigger.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

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
    if (candidate === 'bottom') return t.bottom + offset + p.height <= viewportHeight;
    if (candidate === 'top') return t.top - offset - p.height >= 0;
    if (candidate === 'left') return t.left - offset - p.width >= 0;
    return t.right + offset + p.width <= viewportWidth;
  };
  if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];
  if (panel.dataset.side !== side) panel.dataset.side = side;

  // The panel is placed by `top`/`left`, where the offset margin moves the box only when the side
  // facing the trigger is the panel's own top or left edge (data-side bottom or right). On the other
  // two the margin is inert, so the position math subtracts the value read back above instead, and
  // the gap comes out the same on all four sides.
  const coords: { top: string; right: string; bottom: string; left: string } = { top: '', right: '', bottom: '', left: '' };
  if (side === 'top' || side === 'bottom') {
    const align = placement.endsWith('-start') ? 'start' : placement.endsWith('-end') ? 'end' : 'center';
    let x = t.left + (t.width - p.width) / 2;
    if (align === 'start') x = rtl ? t.right - p.width : t.left;
    if (align === 'end') x = rtl ? t.left : t.right - p.width;
    coords.left = `${clamp(x, 0, viewportWidth - p.width)}px`;
    coords.top = side === 'bottom' ? `${t.bottom}px` : `${t.top - p.height - offset}px`;
  } else {
    coords.top = `${clamp(t.top + (t.height - p.height) / 2, 0, viewportHeight - p.height)}px`;
    coords.left = side === 'right' ? `${t.right}px` : `${t.left - p.width - offset}px`;
  }
  for (const key of ['top', 'right', 'bottom', 'left'] as const) {
    if (panel.style[key] !== coords[key]) panel.style[key] = coords[key];
  }
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

export interface PopoverProps {
  /**
   * Exactly one focusable element — usually a Button — that opens the popover; typed as a single
   * element, since it is cloned with aria-expanded/aria-controls and the toggle handler.
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
   * trapped, background inert — for content that must be finished (a required form).
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
   * Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `outside`, `close-button`, `tab-out`.
   */
  onOpenChange?: ((open: boolean, reason: PopoverOpenChangeReason) => void) | undefined;
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
 * The root (`data-ds="Popover"`, and `ref`) is the panel, which exists only while open or closing;
 * the trigger is rendered in place and the panel through a portal.
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
  onOpenChange,
  container,
  overrides,
}: PopoverProps & { ref?: Ref<HTMLElement> | undefined }): ReactElement {
  const generatedId = useId();
  const panelId = `ds-popover${generatedId}-panel`;
  const headingId = `ds-popover${generatedId}-heading`;

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

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  // Whether closing moves focus back to the trigger: not after an outside press (focus goes where
  // the pointer went) or a forward tab-out (focus goes to the element after the trigger).
  const restoreFocusRef = useRef(true);
  const escapeHandledRef = useRef(false);

  const latest = useRef({ placement, modal });
  latest.current = { placement, modal };

  const validTrigger = isValidElement(trigger);
  if (process.env.NODE_ENV !== 'production' && !validTrigger) {
    console.warn('Popover: `trigger` must be exactly one element (usually a Button).');
  }

  const changeOpen = (next: boolean, reason: PopoverOpenChangeReason): void => {
    // Opening resets the flag, so a later close the popover did not cause — a controlled consumer
    // setting `open` false — restores focus whenever focus is still inside the panel.
    restoreFocusRef.current = next || (reason !== 'outside' && reason !== 'tab-out');
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next, reason);
  };

  const setPanelRef: RefCallback<HTMLElement> = (node) => {
    panelRef.current = node;
    assignRef(ref, node);
  };

  // Open: show in the top layer, position, move focus in. Close: leave the top layer, return focus.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    if (!open) {
      if (panel instanceof HTMLDialogElement) {
        if (typeof panel.close === 'function') panel.close();
        else panel.removeAttribute('open');
      } else if (supportsPopoverApi() && panel.matches(':popover-open')) {
        panel.hidePopover();
      }
      document.documentElement.classList.remove('ds-popover-lock-scroll');
      const focusInside = panel.contains(document.activeElement) || document.activeElement === document.body;
      if (restoreFocusRef.current && focusInside) triggerRef.current?.focus();

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
    }

    if (panel instanceof HTMLDialogElement) {
      if (!panel.open) {
        if (typeof panel.showModal === 'function') panel.showModal();
        else panel.setAttribute('open', '');
      }
      document.documentElement.classList.add('ds-popover-lock-scroll');
    } else if (supportsPopoverApi() && !panel.matches(':popover-open')) {
      panel.showPopover();
    }

    const reposition = (): void => {
      const anchor = triggerRef.current;
      if (anchor && panelRef.current) positionPanel(anchor, panelRef.current, latest.current.placement);
    };
    reposition();

    // The first control, else the close button, else the heading, else the panel itself.
    const target =
      (bodyRef.current ? tabbablesIn(bodyRef.current)[0] : undefined) ??
      closeButtonRef.current ??
      headingRef.current ??
      panel;
    target.focus();

    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.documentElement.classList.remove('ds-popover-lock-scroll');
    };
  }, [open, modal]);

  // Re-place when the preferred placement changes while open.
  useLayoutEffect(() => {
    const anchor = triggerRef.current;
    const panel = panelRef.current;
    if (open && anchor && panel) positionPanel(anchor, panel, placement);
  }, [placement, open]);

  // Non-modal: a pointerdown outside the panel and the trigger closes. The only dismissal listener.
  useEffect(() => {
    if (!open || modal) return undefined;
    const handlePointerDown = (event: PointerEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      changeOpen(false, 'outside');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  });

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (!open || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      // Keep an enclosing overlay (a Popover inside a Dialog) from closing on the same key.
      event.stopPropagation();
      escapeHandledRef.current = true;
      setTimeout(() => {
        escapeHandledRef.current = false;
      }, 0);
      changeOpen(false, 'escape');
      return;
    }
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

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: the browser never closes the dialog by itself.
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    changeOpen(false, 'escape');
  };

  const triggerElement = validTrigger ? (trigger as ReactElement<TriggerProps>) : null;
  const triggerProps: TriggerProps = triggerElement?.props ?? {};
  const triggerId = triggerProps.id ?? `ds-popover${generatedId}-trigger`;

  const clonedTrigger = triggerElement
    ? cloneElement(triggerElement, {
        id: triggerId,
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          assignRef(triggerProps.ref, node);
        },
        'aria-expanded': open ? 'true' : 'false',
        'aria-controls': mounted ? panelId : undefined,
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          triggerProps.onClick?.(event);
          changeOpen(!open, 'trigger');
        },
      } as TriggerProps)
    : trigger;

  const PanelTag = modal ? 'dialog' : 'div';
  const panelAttributes = {
    ref: setPanelRef,
    id: panelId,
    role: 'dialog',
    'aria-modal': modal ? ('true' as const) : undefined,
    'aria-labelledby': heading ? headingId : triggerId,
    'data-ds': 'Popover',
    'data-part': 'panel',
    'data-state': open ? 'open' : 'closed',
    className: 'ds-popover',
    style: overrides ? overridesToStyle(overrides) : undefined,
    tabIndex: -1,
    onKeyDown: handlePanelKeyDown,
  };

  const panelNode = mounted ? (
    <PanelTag
      {...panelAttributes}
      {...(modal ? { onCancel: handleCancel } : { popover: supportsPopoverApi() ? ('manual' as const) : undefined })}
    >
      {showArrow ? <span aria-hidden="true" className="ds-popover__arrow" data-part="arrow" /> : null}
      <FocusScope trapped={modal} autoFocus="none" restoreFocus={false} active={open} data-part="focusScope">
        <div className="ds-popover__content">
          {heading || dismissible ? (
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
