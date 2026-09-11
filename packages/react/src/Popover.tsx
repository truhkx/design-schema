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

export type PopoverOpenChangeReason = 'trigger' | 'escape' | 'outside' | 'close-button' | 'tab-out';

/** Heading level of the panel heading. Accepts the schema's string values and their numeric equivalents. */
export type PopoverHeadingLevel = '2' | '3' | '4' | 2 | 3 | 4;

type PopoverSide = 'top' | 'bottom' | 'start' | 'end';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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
  exit: '--ds-popover-exit',
};

function overridesToStyle(overrides: Partial<Record<PopoverOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as PopoverOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { closeLabel: 'Close' };

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Moves focus to the next document-order tabbable element relative to `anchor`, ignoring anything
 * inside `exclude` (the panel that just closed).
 */
function focusAdjacent(anchor: HTMLElement | null, exclude: HTMLElement | null) {
  if (!anchor) return;
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !exclude || !exclude.contains(element),
  );
  const index = all.indexOf(anchor);
  if (index === -1) return;
  (all[index + 1] ?? anchor).focus();
}

/** Positions the panel from the trigger's rect for `placement`, flipping either axis on overflow. */
function computePosition(
  triggerRect: DOMRect,
  panelRect: DOMRect,
  placement: PopoverPlacement,
  rtl: boolean,
): { style: CSSProperties; side: PopoverSide } {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (placement === 'start' || placement === 'end') {
    const startIsLeft = !rtl;
    let side: 'start' | 'end' = placement;
    const wantsLeft = side === 'start' ? startIsLeft : !startIsLeft;
    const fitsLeft = triggerRect.left - panelRect.width >= 0;
    const fitsRight = triggerRect.right + panelRect.width <= viewportWidth;
    if ((wantsLeft && !fitsLeft && fitsRight) || (!wantsLeft && !fitsRight && fitsLeft)) {
      side = side === 'start' ? 'end' : 'start';
    }
    const finalWantsLeft = side === 'start' ? startIsLeft : !startIsLeft;

    const centerY = triggerRect.top + triggerRect.height / 2;
    const top = Math.min(Math.max(centerY - panelRect.height / 2, 0), Math.max(viewportHeight - panelRect.height, 0));
    const style: Record<string, number> = { top };
    if (finalWantsLeft) style.right = viewportWidth - triggerRect.left;
    else style.left = triggerRect.right;
    return { style: style as CSSProperties, side };
  }

  const hasAlign = placement.includes('-');
  const vertRaw = (hasAlign ? placement.split('-')[0] : placement) as 'top' | 'bottom';
  const alignRaw = (hasAlign ? placement.split('-')[1] : 'center') as 'start' | 'end' | 'center';

  let vertical = vertRaw;
  if (vertical === 'bottom' && triggerRect.bottom + panelRect.height > viewportHeight && triggerRect.top - panelRect.height >= 0) {
    vertical = 'top';
  } else if (vertical === 'top' && triggerRect.top - panelRect.height < 0 && triggerRect.bottom + panelRect.height <= viewportHeight) {
    vertical = 'bottom';
  }

  const style: Record<string, number> = {};
  if (vertical === 'bottom') style.top = triggerRect.bottom;
  else style.bottom = viewportHeight - triggerRect.top;

  if (alignRaw === 'center') {
    const centerX = triggerRect.left + triggerRect.width / 2;
    style.left = Math.min(Math.max(centerX - panelRect.width / 2, 0), Math.max(viewportWidth - panelRect.width, 0));
  } else {
    let horizontal = alignRaw;
    if (horizontal === 'start' && triggerRect.left + panelRect.width > viewportWidth && triggerRect.right - panelRect.width >= 0) {
      horizontal = 'end';
    } else if (horizontal === 'end' && triggerRect.right - panelRect.width < 0 && triggerRect.left + panelRect.width <= viewportWidth) {
      horizontal = 'start';
    }
    if (horizontal === 'start') style.left = triggerRect.left;
    else style.right = viewportWidth - triggerRect.right;
  }

  return { style: style as CSSProperties, side: vertical };
}

export interface PopoverProps {
  /** Exactly one focusable element — usually a Button — that opens the popover. The popover adds aria-expanded and aria-controls to it. */
  trigger: ReactElement;
  /** The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling. */
  children: ReactNode;
  /** Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger. */
  heading?: string;
  /** Heading level of the panel heading, so it fits the page outline (a popover usually sits under a level-2 section). */
  headingLevel?: PopoverHeadingLevel;
  /** Controlled open state. Omit for uncontrolled (the trigger toggles it). */
  open?: boolean;
  /** Preferred side and alignment; flips and shifts to stay in the viewport. */
  placement?: PopoverPlacement;
  /**
   * False (default): the page stays interactive; clicking outside closes; focus moves in but is
   * not trapped, and Tab out closes. True: behaves as a small Dialog anchored to the trigger —
   * focus trapped, background inert — for content that must be finished (a required form).
   */
  modal?: boolean;
  /** A small pointer toward the trigger. Off by default; Calm & precise prefers a plain edge. */
  showArrow?: boolean;
  /** Show the close button. Escape and outside click work regardless (non-modal). */
  dismissible?: boolean;
  /**
   * Fired when the popover opens or closes, with the new state and a reason: `trigger`, `escape`,
   * `outside`, `close-button`, `tab-out`.
   */
  onOpenChange?: (open: boolean, reason: PopoverOpenChangeReason) => void;
  /** Portal target for the panel's DOM node. Defaults to `document.body`. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<PopoverOverridableBinding, TokenRef>>;
}

/**
 * Popover — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Popover for a compact interactive panel tied to a trigger: a date picker under a date
 * field, a color swatch, a filter panel behind a "Filters" button, a share panel, contextual help
 * with a link. Use `modal` when the panel contains a required step (a short form that must be
 * submitted or cancelled). Use `heading` when the content is not obvious from the trigger.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
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
  },
  ref,
) {
  const generatedId = useId();
  const triggerId = `ds-popover${generatedId}-trigger`;
  const panelId = `ds-popover${generatedId}-panel`;
  const headingId = `ds-popover${generatedId}-heading`;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement, []);

  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const isControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? (openProp as boolean) : internalOpen;

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>();
  const [side, setSide] = useState<PopoverSide>('bottom');

  // Guards a close from firing twice for one interaction (e.g. Escape racing a pointerdown).
  const closingRef = useRef(false);
  // Suppresses FocusScope's restore-to-opener on unmount only for the forward tab-out case, which
  // wants focus on the element *after* the trigger, not the trigger itself.
  const restoreFocusRef = useRef(true);

  const latest = useRef({ placement });
  latest.current = { placement };

  if (isDev && Children.count(trigger) !== 1) {
    console.warn('Popover: `trigger` must be exactly one focusable element.');
  }

  const changeOpen = (value: boolean, reason: PopoverOpenChangeReason) => {
    if (!isControlled) setInternalOpen(value);
    onOpenChange?.(value, reason);
  };

  const requestClose = (reason: PopoverOpenChangeReason) => {
    if (closingRef.current) return;
    closingRef.current = true;
    changeOpen(false, reason);
  };

  const handleTriggerClick = () => {
    if (open) {
      requestClose('trigger');
    } else {
      closingRef.current = false;
      restoreFocusRef.current = true;
      changeOpen(true, 'trigger');
    }
  };

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setPresent(true);
    }
  }, [open]);

  // Mount: position the panel, focus the first control (or the heading, then the panel), then
  // reveal on the next frame. Repositions while the viewport scrolls or resizes.
  useLayoutEffect(() => {
    if (!present) return undefined;
    const panel = panelRef.current;
    if (!panel) return undefined;

    if (modal && panel instanceof HTMLDialogElement && !panel.open) {
      // showModal() also reflects `open`, natively; the assignment is the fallback for engines
      // (jsdom, under test) that implement the `open` IDL attribute but not showModal() itself.
      panel.showModal?.();
      panel.open = true;
    }

    const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? closeButtonRef.current ?? headingRef.current ?? panel).focus();

    const reposition = () => {
      const trigger = triggerRef.current;
      if (!trigger || !panel) return;
      const triggerRect = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const rtl = getComputedStyle(trigger).direction === 'rtl';
      const result = computePosition(triggerRect, panelRect, latest.current.placement, rtl);
      setPanelStyle(result.style);
      setSide(result.side);
    };
    reposition();

    if (prefersReducedMotion()) {
      setVisible(true);
      window.addEventListener('scroll', reposition, true);
      window.addEventListener('resize', reposition);
      return () => {
        window.removeEventListener('scroll', reposition, true);
        window.removeEventListener('resize', reposition);
      };
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [present, modal]);

  // Exit: hide, then unmount (and close() the native dialog) once the transition finishes.
  useEffect(() => {
    if (open || !present) return undefined;
    setVisible(false);
    const panel = panelRef.current;
    const finish = () => {
      setPresent(false);
      if (modal && panel instanceof HTMLDialogElement) {
        panel.close?.();
        panel.open = false;
      }
    };
    if (prefersReducedMotion()) {
      finish();
      return undefined;
    }
    const surface = surfaceRef.current;
    const handleExited = (event: TransitionEvent) => {
      if (event.target !== surface || event.propertyName !== 'opacity') return;
      finish();
    };
    surface?.addEventListener('transitionend', handleExited);
    return () => surface?.removeEventListener('transitionend', handleExited);
  }, [open, present, modal]);

  // Body scroll lock while a modal popover is present; non-modal leaves the page interactive.
  useEffect(() => {
    if (!modal || !present) return undefined;
    document.documentElement.classList.add('ds-popover-lock-scroll');
    return () => document.documentElement.classList.remove('ds-popover-lock-scroll');
  }, [modal, present]);

  // Non-modal: a pointerdown outside the panel and trigger closes.
  useEffect(() => {
    if (modal || !open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      requestClose('outside');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, open]);

  const handleDialogCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the popover never closes itself outside of `onOpenChange`.
    event.preventDefault();
    requestClose('escape');
  };

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const activeElement = document.activeElement;
    if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      restoreFocusRef.current = false;
      requestClose('tab-out');
      focusAdjacent(triggerRef.current, panel);
    } else if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      requestClose('tab-out');
      triggerRef.current?.focus();
    }
  };

  const handleCloseButtonClick = () => requestClose('close-button');

  const triggerElement = trigger as ReactElement<{
    onClick?: (event: ReactMouseEvent) => void;
  }>;
  const clonedTrigger = cloneElement(triggerElement, {
    ref: triggerRef,
    id: triggerId,
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': open ? panelId : undefined,
    onClick: (event: ReactMouseEvent) => {
      triggerElement.props.onClick?.(event);
      handleTriggerClick();
    },
  } as unknown as Attributes);

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedPanelStyle = { ...panelStyle, ...overrideStyle };
  const bodyOverrides = overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined;

  const panelClasses = ['ds-popover__panel', visible ? 'ds-popover__panel--visible' : null].filter(Boolean).join(' ');

  const panelContent = (
    <>
      {showArrow ? <span aria-hidden="true" data-part="arrow" className="ds-popover__arrow" /> : null}
      <FocusScope trapped={modal} autoFocus="none" restoreFocus={restoreFocusRef.current}>
        <div className="ds-popover__surface" ref={surfaceRef} data-part="panel">
          {heading || dismissible ? (
            <div className="ds-popover__header">
              {heading ? (
                <Heading level={headingLevel} id={headingId} ref={headingRef} tabIndex={-1} data-part="heading" className="ds-popover__heading">
                  {heading}
                </Heading>
              ) : null}
              {dismissible ? (
                <Button
                  ref={closeButtonRef}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  label={COPY.closeLabel}
                  data-part="closeButton"
                  className="ds-popover__close"
                  onClick={handleCloseButtonClick}
                  leadingIcon={<Icon name="close" inline />}
                />
              ) : null}
            </div>
          ) : null}
          <Box element="div" inset="md" overrides={bodyOverrides} data-part="body" className="ds-popover__body" ref={bodyRef}>
            {children}
          </Box>
        </div>
      </FocusScope>
    </>
  );

  const panelNode = present
    ? modal
      ? (
          <dialog
            ref={panelRef as Ref<HTMLDialogElement>}
            id={panelId}
            data-side={side}
            className={panelClasses}
            style={mergedPanelStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby={heading ? headingId : triggerId}
            onCancel={handleDialogCancel}
          >
            {panelContent}
          </dialog>
        )
      : (
          <div
            ref={panelRef as Ref<HTMLDivElement>}
            id={panelId}
            data-side={side}
            className={panelClasses}
            style={mergedPanelStyle}
            role="dialog"
            aria-modal="false"
            aria-labelledby={heading ? headingId : triggerId}
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
          >
            {panelContent}
          </div>
        )
    : null;

  return (
    <div ref={wrapperRef} data-ds="Popover" className="ds-popover">
      {clonedTrigger}
      {panelNode ? createPortal(panelNode, container ?? document.body) : null}
    </div>
  );
});
