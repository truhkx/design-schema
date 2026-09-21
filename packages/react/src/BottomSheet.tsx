import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { Dialog, type DialogOverridableBinding } from './Dialog';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import './BottomSheet.css';

export type BottomSheetHeight = 'content' | 'half' | 'full';
export type BottomSheetCloseReason = 'escape' | 'close-button' | 'scrim' | 'drag' | 'action';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type BottomSheetOverridableBinding =
  | 'scrim'
  | 'shadow'
  | 'radius'
  | 'handleHeight'
  | 'handleWidth'
  | 'handleRadius'
  | 'headerPaddingTop'
  | 'handleGap'
  | 'headerGap'
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'layer'
  | 'enter'
  | 'exit';

const OVERRIDE_HOOK: Record<BottomSheetOverridableBinding, string> = {
  scrim: '--ds-bottom-sheet-scrim',
  shadow: '--ds-bottom-sheet-shadow',
  radius: '--ds-bottom-sheet-radius',
  handleHeight: '--ds-bottom-sheet-handle-height',
  handleWidth: '--ds-bottom-sheet-handle-width',
  handleRadius: '--ds-bottom-sheet-handle-radius',
  headerPaddingTop: '--ds-bottom-sheet-header-padding-top',
  handleGap: '--ds-bottom-sheet-handle-gap',
  headerGap: '--ds-bottom-sheet-header-gap',
  inset: '--ds-bottom-sheet-inset',
  partGap: '--ds-bottom-sheet-part-gap',
  footerGap: '--ds-bottom-sheet-footer-gap',
  layer: '--ds-bottom-sheet-layer',
  enter: '--ds-bottom-sheet-enter',
  exit: '--ds-bottom-sheet-exit',
};

/**
 * Bindings sharing a name with a Dialog binding; the wide presentation forwards those the caller set
 * to Dialog's `overrides`, so Dialog keeps its own tokens (its `layer.dialog` included) otherwise.
 * The handle bindings, `headerPaddingTop` and `handleGap` have no counterpart there, and a locked
 * binding (`surface`, `maxWidth`, `minTarget`, the focus ring) is never forwarded.
 */
const DIALOG_FORWARDED: ReadonlyArray<BottomSheetOverridableBinding & DialogOverridableBinding> = [
  'scrim',
  'shadow',
  'radius',
  'inset',
  'partGap',
  'headerGap',
  'footerGap',
  'layer',
  'enter',
  'exit',
];

function overridesToStyle(overrides: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as BottomSheetOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // Locked bindings are not in the type; anything passed anyway has no hook and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/** copy.* — used verbatim. */
const COPY = { closeLabel: 'Close' };

/** constants.dismissDistance — fraction of the sheet height a downward drag must pass to dismiss on release. */
const DISMISS_DISTANCE = 0.25;
/** constants.dismissVelocity — downward px/ms at release that dismisses whatever the distance travelled. */
const DISMISS_VELOCITY = 1.5;
/** constants.dragSlop — `space.1`, read from the resolved custom property at gesture time. */
const DRAG_SLOP_TOKEN = '--space-1';

/**
 * `space.1` in px: the token resolves to a rem length, so it is multiplied by the root font size.
 * An unresolvable value (no theme stylesheet, jsdom) counts as 0, as the doc says.
 */
function resolveDragSlop(element: HTMLElement): number {
  const raw = getComputedStyle(element).getPropertyValue(DRAG_SLOP_TOKEN).trim();
  const length = parseFloat(raw);
  if (!Number.isFinite(length)) return 0;
  if (!raw.endsWith('rem') && !raw.endsWith('em')) return length;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(rootFontSize) ? length * rootFontSize : 0;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function firstFocusableIn(root: HTMLElement | null): HTMLElement | null {
  if (!root) return null;
  for (const element of Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))) {
    if (!element.hasAttribute('data-focus-sentinel') && !element.closest('[inert]')) return element;
  }
  return null;
}

declare const process: { env: { NODE_ENV?: string } };

/** True when the surface has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition(element: HTMLElement): boolean {
  const durations = getComputedStyle(element).transitionDuration;
  if (!durations) return true;
  return durations.split(',').every((duration) => parseFloat(duration) === 0);
}

/** Scroll lock is reference-counted so an overlay opened over the sheet cannot release it early. */
let scrollLockCount = 0;
function lockScroll(): () => void {
  scrollLockCount += 1;
  document.documentElement.classList.add('ds-bottom-sheet-lock-scroll');
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.documentElement.classList.remove('ds-bottom-sheet-lock-scroll');
  };
}

/**
 * maxWidth — `layout.maxWidth.prose`, read from the loaded theme, since a media query cannot read a
 * custom property. Wide is `(width > token)`; exactly the token width is still a sheet. When the token
 * does not resolve (no theme stylesheet, jsdom, SSR) the sheet presentation renders.
 */
function wideQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
  if (!breakpoint) return null;
  // literal-ok: the media query text is the resolved token value, not an authored length.
  return window.matchMedia(`(width > ${breakpoint})`);
}

function useIsWideViewport(): boolean {
  const [isWide, setIsWide] = useState<boolean>(() => wideQuery()?.matches ?? false);
  useEffect(() => {
    const query = wideQuery();
    if (!query) return undefined;
    const update = (): void => setIsWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isWide;
}

interface DragSample {
  y: number;
  time: number;
}

interface DragState {
  pointerId: number;
  /** Where the pointer went down; the slop is measured from here. */
  startY: number;
  /** Where the slop was crossed; the drag offset counts from here, so the surface does not jump. */
  originY: number;
  claimed: boolean;
  previous: DragSample | null;
  last: DragSample | null;
}

/**
 * idle → dragging (past the slop) → settling (spring back to rest)
 *                                 | held (dismissed, holding the released offset) → exiting | settling
 */
type DragPhase = 'idle' | 'dragging' | 'settling' | 'held' | 'exiting';

export interface BottomSheetProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open'> {
  /** Controlled visibility, as in Dialog. Controlled only — there is no uncontrolled mode; the consumer owns `open` and the sheet requests changes through `onClose`, never changing `open` itself. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideHeading` when the content is self-explanatory (a share sheet). */
  heading: string;
  /**
   * Keep the heading for assistive technology but do not render it (forwarded to Dialog above the
   * breakpoint). The accessible name is required regardless; visually hidden is fine, absent is not.
   */
  hideHeading?: boolean | undefined;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: ReactNode | undefined;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /**
   * Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the
   * footer actions close it, as in Dialog: the close button and the drag handle are not rendered, a
   * scrim tap and a drag do nothing, and Escape still reports with reason `escape`. The wide Dialog
   * presentation receives the same value.
   */
  dismissible?: boolean | undefined;
  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. The body does not start the
   * gesture whatever its scroll position; only the handle and header do, and only once the pointer has
   * moved `dragSlop` downward, so a tap on the close button still activates it. Purely additive: the
   * handle is rendered only when `dragToDismiss` and `dismissible` are both true, so there is no drag
   * affordance where dragging does nothing. A gesture is never the only way to dismiss (WCAG 2.5.1);
   * the handle is not a focus stop.
   */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. The sheet never raises `action` itself; it exists for a consumer's footer action reusing the same handler. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag, so analytics can distinguish gestures. It carries no payload — the distance and velocity that triggered it are not part of the contract. */
  onDragDismiss?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. Bindings Dialog shares by name are forwarded to it above the breakpoint. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * BottomSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog: filters,
 * a form of a few fields, details of a selected item, a picker with many options. Use `height: content`
 * by default; `full` for a task that needs the whole screen but should still feel dismissable; `half`
 * for a browsable list where seeing the page behind matters (a map with results). For a flat list of
 * actions, ActionSheet is the lighter component.
 *
 * Above the `layout.maxWidth.prose` breakpoint the same props render `Dialog` of size md directly, so
 * the root and `ref` are Dialog's `<dialog>` and `drag` never fires. Below it `ref` resolves to the
 * sheet's `<dialog>`, null while closed. The sheet never closes itself: Escape, the close button, a
 * scrim tap and the drag gesture all call `onClose` with a reason and the consumer flips `open`.
 */
export function BottomSheet({
  ref,
  open,
  heading,
  hideHeading = false,
  children,
  footer,
  height = 'content',
  dismissible = true,
  dragToDismiss = true,
  onClose,
  onDragDismiss,
  container,
  overrides,
  // Never forwarded to the root: `overrides` is the only per-instance styling.
  className: _className,
  style: _style,
  ...rest
}: BottomSheetProps & { ref?: Ref<HTMLDialogElement> | undefined }): ReactElement | null {
  const isWide = useIsWideViewport();

  const generatedId = useId();
  const headingId = `ds-bottom-sheet${generatedId}-heading`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const setDialogNode = useCallback(
    (node: HTMLDialogElement | null): void => {
      dialogRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  /** True from the moment Escape is reported until the end of the task, so the browser's `cancel` and
   * `close` for that same key are not reported a second time. */
  const escapeReportedRef = useRef(false);
  const selfClosingRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);
  const [dragPhase, setDragPhase] = useState<DragPhase>('idle');

  const latest = useRef({ open });
  latest.current = { open };

  const warnedRef = useRef(false);
  if (process.env.NODE_ENV !== 'production' && !heading && !warnedRef.current) {
    warnedRef.current = true;
    console.warn('BottomSheet: `heading` is required and becomes the accessible name; it must not be empty.');
  }

  // The wide presentation is Dialog's own lifecycle, so presence there just follows `open`.
  if (isWide ? present !== open : open && !present) setPresent(open);

  /** Initial focus: the body, then the footer, then the close button, then the heading (tabindex -1). */
  const placeInitialFocus = (): void => {
    const target = firstFocusableIn(bodyRef.current) ?? firstFocusableIn(footerRef.current) ?? closeButtonRef.current;
    if (target) {
      target.focus();
      return;
    }
    const headingElement = headingRef.current;
    if (!headingElement) return;
    if (headingElement.tabIndex !== -1) headingElement.tabIndex = -1;
    headingElement.focus();
  };

  // Narrow open: showModal(), move focus in, reveal on the next frame. It also runs when `open`
  // returns true while the exit transition is still running, which reveals the surface again.
  useLayoutEffect(() => {
    if (!present || isWide) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    selfClosingRef.current = false;
    if (!dialog.open) {
      // showModal() gives the top layer, Escape and background inertness. jsdom implements the
      // `open` IDL attribute but not showModal(), so the assignment is the fallback there.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
    }
    placeInitialFocus();
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, isWide]);

  // Narrow close: run the exit transition, then close() and unmount (FocusScope restores the opener).
  useEffect(() => {
    if (open || !present || isWide) return undefined;
    setVisible(false);
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    const finish = (): void => {
      if (dialog?.open) {
        selfClosingRef.current = true;
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.open = false;
      }
      setPresent(false);
    };
    // A dialog the browser already closed is display: none, so no transitionend would ever arrive.
    if (!surface || !dialog?.open || hasNoTransition(surface)) {
      finish();
      return undefined;
    }
    const handleExited = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') finish();
    };
    surface.addEventListener('transitionend', handleExited);
    return () => surface.removeEventListener('transitionend', handleExited);
  }, [open, present, isWide]);

  // The released offset stays on the surface until the consumer's next render decides what it means.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;

    // held: the render that follows the `onClose` call has arrived (a setState in the handler is
    // batched into it). `open` still true springs back; `open` false plays the normal exit.
    if (dragPhase === 'held') {
      setDragPhase(open ? 'settling' : 'exiting');
      return undefined;
    }

    // exiting: `--visible` came off in the same commit, so dropping the inline offset animates the
    // exit from wherever the finger left the sheet — no momentum, just the exit transition.
    if (dragPhase === 'exiting') {
      if (open) {
        setDragPhase('settling');
        return undefined;
      }
      if (surface) surface.style.transform = '';
      setDragPhase('idle');
      return undefined;
    }

    // settling: spring back to rest over the exit duration with motion.easing.standard. Clearing the
    // offset also finishes an interrupted enter animation.
    if (dragPhase !== 'settling') return undefined;
    if (!surface) {
      setDragPhase('idle');
      return undefined;
    }
    surface.style.transform = '';
    if (hasNoTransition(surface)) {
      setDragPhase('idle');
      return undefined;
    }
    const handleSettled = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') setDragPhase('idle');
    };
    surface.addEventListener('transitionend', handleSettled);
    return () => surface.removeEventListener('transitionend', handleSettled);
  }, [dragPhase, open]);

  // Scroll lock on <html> while the narrow sheet is present; Dialog locks its own.
  useEffect(() => {
    if (!present || isWide) return undefined;
    return lockScroll();
  }, [present, isWide]);

  /** Each Escape is reported exactly once, whichever of keydown, `cancel` or `close` reaches us first. */
  const reportEscape = (): void => {
    escapeReportedRef.current = true;
    // The browser's `cancel` and `close` for this same key follow the keydown's listeners; skip them once.
    setTimeout(() => {
      escapeReportedRef.current = false;
    }, 0);
    // Reported even when not dismissible: Escape is the keyboard user's exit.
    onClose?.('escape');
  };

  /** Reopen after a close the component did not ask for, and put focus back in. */
  const reopenAfterNativeClose = (): void => {
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open || !latest.current.open) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
      placeInitialFocus();
    });
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>): void => {
    rest.onKeyDown?.(event);
    if (event.key !== 'Escape' || event.defaultPrevented || !open) return;
    event.preventDefault();
    if (!escapeReportedRef.current) reportEscape();
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the sheet, dismissible or not.
    event.preventDefault();
    if (escapeReportedRef.current || !open) return;
    reportEscape();
  };

  // A non-cancelable `cancel` closes the native dialog anyway, and a close watcher can close it with
  // no `cancel` at all (repeated Escape): report `escape` if nothing else did, then reopen unless the
  // consumer set `open` false.
  const handleNativeClose = (): void => {
    if (selfClosingRef.current) {
      selfClosingRef.current = false;
      return;
    }
    if (!open) return;
    if (!escapeReportedRef.current) reportEscape();
    reopenAfterNativeClose();
  };

  const handleScrimClick = (): void => {
    if (!open || !dismissible) return;
    onClose?.('scrim');
  };

  // minTarget: the closeButton wrapper is bigger than the Button, and its extra area activates it.
  // The wrapper focuses the Button and requests close itself, never reaching into the Button's internals.
  const handleCloseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = closeButtonRef.current;
    // A click on the Button itself is the Button's own onClick.
    if (button && button.contains(event.target as Node)) return;
    button?.focus();
    onClose?.('close-button');
  };

  const canDrag = dragToDismiss && dismissible;

  // Drag: Pointer Events on the header (which holds the handle). Nothing is claimed until the pointer
  // has moved `dragSlop` downward, so a tap on the close button still activates it.
  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!canDrag || !open || dragRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    // No coordinate, no gesture: an environment without Pointer Events must not translate the surface.
    if (!Number.isFinite(event.clientY)) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      originY: event.clientY,
      claimed: false,
      previous: null,
      last: null,
    };
  };

  const handleHeaderPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !surface) return;
    if (!Number.isFinite(event.clientY)) return;
    if (!drag.claimed) {
      const moved = event.clientY - drag.startY;
      if (moved <= 0 || moved < resolveDragSlop(surface)) return;
      drag.claimed = true;
      // The offset counts from where the slop was crossed, so the surface does not jump.
      drag.originY = event.clientY;
      // Past the slop the header takes the move over from the child it started on.
      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      // The drag-follow tracks the finger directly, reduced motion or not.
      setDragPhase('dragging');
    }
    drag.previous = drag.last;
    drag.last = { y: event.clientY, time: event.timeStamp };
    surface.style.transform = `translateY(${Math.max(0, event.clientY - drag.originY)}px)`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const surface = surfaceRef.current;
    if (!drag.claimed || !surface) return;

    const travelled = Number.isFinite(event.clientY) ? Math.max(0, event.clientY - drag.originY) : 0;
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && travelled > sheetHeight * DISMISS_DISTANCE;
    // Velocity between the last two move samples before release; only downward speed counts.
    let velocity = 0;
    if (drag.previous && drag.last && drag.last.time > drag.previous.time) {
      velocity = (drag.last.y - drag.previous.y) / (drag.last.time - drag.previous.time);
    }
    const fastEnough = velocity > DISMISS_VELOCITY;

    if (cancelled || !open || !(pastDistance || fastEnough)) {
      setDragPhase('settling');
      return;
    }
    // Hold the released offset until the consumer's next render, then exit or spring back from there.
    setDragPhase('held');
    onDragDismiss?.();
    onClose?.('drag');
  };

  // Above the breakpoint the sheet *is* a Dialog: the root carries Dialog's own hooks, `ref` resolves
  // to its <dialog>, and its `escape` / `close-button` / `scrim` / `action` reasons pass straight
  // through. `drag` has no Dialog source, and Dialog's `onOpened` is not re-emitted.
  if (isWide) {
    let dialogOverrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
    for (const binding of DIALOG_FORWARDED) {
      const value = overrides?.[binding];
      if (value) dialogOverrides = { ...dialogOverrides, [binding]: value };
    }
    return (
      <Dialog
        {...rest}
        ref={ref}
        open={open}
        heading={heading}
        hideHeading={hideHeading}
        footer={footer}
        size="md"
        dismissible={dismissible}
        onClose={onClose}
        container={container}
        overrides={dialogOverrides}
      >
        {children}
      </Dialog>
    );
  }

  if (!present) return null;

  const classes = [
    'ds-bottom-sheet',
    `ds-bottom-sheet--${height}`,
    canDrag ? 'ds-bottom-sheet--draggable' : null,
    visible && open ? 'ds-bottom-sheet--visible' : null,
    dragPhase === 'dragging' ? 'ds-bottom-sheet--dragging' : null,
    dragPhase === 'settling' ? 'ds-bottom-sheet--settling' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const insetOverride = overrides?.inset;
  const footerGapOverride = overrides?.footerGap;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;

  // The handle is a drag affordance, so it only exists where the gesture does.
  const showHandle = canDrag;
  const showClose = dismissible;
  /** A header with no visible heading, no handle and no close button is not rendered. */
  const showHeader = !hideHeading || showHandle || showClose;

  // Heading writes its own data-part, so the heading part is this sheet-owned wrapper around it.
  const headingNode = (
    <div
      className={
        hideHeading ? 'ds-bottom-sheet__heading ds-bottom-sheet__visually-hidden' : 'ds-bottom-sheet__heading'
      }
      data-part="heading"
    >
      <Heading level="2" id={headingId} ref={headingRef}>
        {heading}
      </Heading>
    </div>
  );

  const node = (
    <dialog
      {...rest}
      ref={setDialogNode}
      data-ds="BottomSheet"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      aria-modal="true"
      aria-labelledby={headingId}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      onClose={handleNativeClose}
    >
      <div className="ds-bottom-sheet__scrim" data-part="scrim" onClick={handleScrimClick} />
      {/* FocusScope writes its own data-part="scope", so the focusScope part is this wrapper inside it. */}
      <FocusScope trapped autoFocus="none" restoreFocus>
        <div className="ds-bottom-sheet__scope" data-part="focusScope">
          <div className="ds-bottom-sheet__surface" ref={surfaceRef} data-part="surface">
            {showHeader ? (
              <div
                className="ds-bottom-sheet__header"
                data-part="header"
                onPointerDown={handleHeaderPointerDown}
                onPointerMove={handleHeaderPointerMove}
                onPointerUp={(event) => endDrag(event, false)}
                onPointerCancel={(event) => endDrag(event, true)}
              >
                {/* handle: decorative, aria-hidden, never a focus stop. */}
                {showHandle ? <span className="ds-bottom-sheet__handle" data-part="handle" aria-hidden="true" /> : null}
                {/* The heading row is sheet-owned and carries no data-part: it only holds headerGap. */}
                <div className="ds-bottom-sheet__title-row">
                  {headingNode}
                  {showClose ? (
                    <span className="ds-bottom-sheet__close" data-part="closeButton" onClick={handleCloseTargetClick}>
                      <Button
                        ref={closeButtonRef}
                        variant="ghost"
                        size="sm"
                        iconOnly
                        label={COPY.closeLabel}
                        leadingIcon={<Icon name="close" inline />}
                        onClick={() => onClose?.('close-button')}
                      />
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              // No header to put it in: the visually hidden heading sits at the start of the column.
              headingNode
            )}
            {/* The sheet owns the scroll container, since Box never scrolls; the Box is the body part. */}
            <div className="ds-bottom-sheet__scroll">
              {/* inset reaches the Box through the stylesheet; the override is passed only when the caller sets it. */}
              <Box data-part="body" ref={bodyRef} overrides={insetOverride ? { paddingInline: insetOverride } : undefined}>
                {children}
              </Box>
            </div>
            {hasFooter ? (
              <div className="ds-bottom-sheet__footer" data-part="footer" ref={footerRef}>
                <Stack
                  direction="horizontal"
                  justify="end"
                  overrides={footerGapOverride ? { gap: footerGapOverride } : undefined}
                >
                  {footer}
                </Stack>
              </div>
            ) : null}
          </div>
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
}
