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

/** Bindings sharing a name with a Dialog binding; the wide presentation forwards them to Dialog's `overrides`. */
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
/** constants.dragSlop — `space.1`, read from the token at gesture time. */
const DRAG_SLOP_TOKEN = '--space-1';

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
 * maxWidth — `layout.maxWidth.prose`, read from the loaded theme (a media query cannot read a custom
 * property). Wide is `(width > token)`; exactly the token width is still a sheet.
 */
function wideQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
  if (!breakpoint) return null;
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
  startY: number;
  claimed: boolean;
  previous: DragSample | null;
  last: DragSample | null;
}

/** idle → dragging (past the slop) → settling (spring back) | held (dismissed, waiting for the consumer). */
type DragPhase = 'idle' | 'dragging' | 'settling' | 'held';

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
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or faster
   * than 1.5 px/ms, dismisses; otherwise the sheet springs back. The body does not start the gesture;
   * only the handle and header do, once the pointer has moved `dragSlop` downward. Purely additive: the
   * handle is rendered only when `dragToDismiss` and `dismissible` are both true. A gesture is never the
   * only way to dismiss (WCAG 2.5.1); the handle is not a focus stop.
   */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. It carries no payload. */
  onDragDismiss?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. Bindings Dialog shares are forwarded to it above the breakpoint. */
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
 * the root and `ref` are Dialog's `<dialog>`. Below it `ref` resolves to the sheet's `<dialog>`, null
 * while closed. The sheet never closes itself: every close path calls `onClose` with a reason.
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
  const escapeHandledRef = useRef(false);
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

  // The wide presentation is Dialog's own lifecycle; the sheet's presence just follows `open` there.
  if (isWide ? present !== open : open && !present) setPresent(open);

  /** Body, then footer, then the close button, then the heading (tabindex -1). */
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

  // Narrow open: showModal(), move focus in, reveal on the next frame.
  useLayoutEffect(() => {
    if (!present || isWide) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    selfClosingRef.current = false;
    if (!dialog.open) {
      // jsdom implements the `open` IDL attribute but not showModal(); the assignment is the fallback there.
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

  // After a drag dismiss the sheet holds the release position until the consumer's update renders:
  // `open` false exits from there (the offset drops in the same commit as the visible class);
  // `open` still true springs back.
  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (dragPhase === 'held') {
      if (open) {
        setDragPhase('settling');
        return undefined;
      }
      if (surface) surface.style.transform = '';
      setDragPhase('idle');
      return undefined;
    }
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

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>): void => {
    rest.onKeyDown?.(event);
    if (event.key !== 'Escape' || event.defaultPrevented || !open) return;
    event.preventDefault();
    escapeHandledRef.current = true;
    // The browser's `cancel` for this same key follows the keydown's listeners; skip it once.
    setTimeout(() => {
      escapeHandledRef.current = false;
    }, 0);
    // Reported even when not dismissible, as in Dialog.
    onClose?.('escape');
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the sheet, dismissible or not.
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    onClose?.('escape');
  };

  // A non-cancelable `cancel` closes the native dialog anyway; reopen unless the consumer set `open` false.
  const handleNativeClose = (): void => {
    if (selfClosingRef.current) {
      selfClosingRef.current = false;
      return;
    }
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open || !latest.current.open) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
      placeInitialFocus();
    });
  };

  const handleScrimClick = (): void => {
    if (!open || !dismissible) return;
    onClose?.('scrim');
  };

  // minTarget: the close Button keeps its own size; a click on the wrapper outside it clicks the Button.
  const handleCloseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = closeButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  const canDrag = dragToDismiss && dismissible;

  // Drag: Pointer Events on the header (which holds the handle). Nothing is claimed until the pointer
  // has moved `dragSlop` downward, so a tap on the close button still activates it.
  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!canDrag || !open || dragRef.current) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, claimed: false, previous: null, last: null };
  };

  const handleHeaderPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !surface) return;
    const deltaY = event.clientY - drag.startY;
    if (!drag.claimed) {
      const slop = parseFloat(getComputedStyle(surface).getPropertyValue(DRAG_SLOP_TOKEN));
      if (deltaY < (Number.isNaN(slop) ? 0 : slop) || deltaY <= 0) return;
      drag.claimed = true;
      if (typeof event.currentTarget.setPointerCapture === 'function') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      // The drag-follow tracks the finger directly, reduced motion or not.
      setDragPhase('dragging');
    }
    drag.previous = drag.last;
    drag.last = { y: event.clientY, time: event.timeStamp };
    surface.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const surface = surfaceRef.current;
    if (!drag.claimed || !surface) return;

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && deltaY > sheetHeight * DISMISS_DISTANCE;
    let velocity = 0;
    if (drag.previous && drag.last && drag.last.time > drag.previous.time) {
      velocity = (drag.last.y - drag.previous.y) / (drag.last.time - drag.previous.time);
    }
    // Only downward speed counts.
    const fastEnough = velocity > DISMISS_VELOCITY;

    if (cancelled || !open || !(pastDistance || fastEnough)) {
      setDragPhase('settling');
      return;
    }
    setDragPhase('held');
    onDragDismiss?.();
    onClose?.('drag');
  };

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
    dragPhase === 'dragging' || dragPhase === 'held' ? 'ds-bottom-sheet--dragging' : null,
    dragPhase === 'settling' ? 'ds-bottom-sheet--settling' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const footerGapOverride = overrides?.footerGap;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;

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
      <FocusScope trapped autoFocus="none" restoreFocus data-part="focusScope">
        <div className="ds-bottom-sheet__surface" ref={surfaceRef} data-part="surface">
          <div
            className="ds-bottom-sheet__header"
            data-part="header"
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={(event) => endDrag(event, false)}
            onPointerCancel={(event) => endDrag(event, true)}
          >
            {canDrag ? <span className="ds-bottom-sheet__handle" data-part="handle" aria-hidden="true" /> : null}
            <div className="ds-bottom-sheet__title-row">
              <div
                className={hideHeading ? 'ds-bottom-sheet__heading ds-bottom-sheet__visually-hidden' : 'ds-bottom-sheet__heading'}
                data-part="heading"
              >
                <Heading level="2" id={headingId} ref={headingRef}>
                  {heading}
                </Heading>
              </div>
              {dismissible ? (
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
          <div className="ds-bottom-sheet__scroll">
            <Box data-part="body" inset="none" ref={bodyRef}>
              {children}
            </Box>
          </div>
          {hasFooter ? (
            <div className="ds-bottom-sheet__footer" data-part="footer" ref={footerRef}>
              <Stack
                direction="horizontal"
                justify="end"
                wrap
                overrides={footerGapOverride ? { gap: footerGapOverride } : undefined}
              >
                {footer}
              </Stack>
            </div>
          ) : null}
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
}
