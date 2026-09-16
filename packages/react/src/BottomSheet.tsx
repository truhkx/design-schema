import {
  useEffect,
  useId,
  useImperativeHandle,
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
  | 'inset'
  | 'partGap'
  | 'footerGap'
  | 'maxWidth'
  | 'layer'
  | 'enter'
  | 'exit';

const OVERRIDE_HOOK: Record<BottomSheetOverridableBinding, string> = {
  scrim: '--ds-bottom-sheet-scrim',
  shadow: '--ds-bottom-sheet-shadow',
  radius: '--ds-bottom-sheet-radius',
  handleHeight: '--ds-bottom-sheet-handle-height',
  handleWidth: '--ds-bottom-sheet-handle-width',
  inset: '--ds-bottom-sheet-inset',
  partGap: '--ds-bottom-sheet-part-gap',
  footerGap: '--ds-bottom-sheet-footer-gap',
  maxWidth: '--ds-bottom-sheet-max-width',
  layer: '--ds-bottom-sheet-layer',
  enter: '--ds-bottom-sheet-enter',
  exit: '--ds-bottom-sheet-exit',
};

/** Bindings the wide (Dialog) presentation forwards to Dialog's own `overrides`; the rest are sheet-only. */
const DIALOG_FORWARDED: ReadonlyArray<BottomSheetOverridableBinding & DialogOverridableBinding> = [
  'inset',
  'radius',
  'partGap',
  'footerGap',
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
/** constants.dismissVelocity — px/ms at release that dismisses whatever the distance travelled. */
const DISMISS_VELOCITY = 1.5;

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
 * maxWidth — `layout.maxWidth.prose`, read from the loaded token stylesheet (a media query cannot
 * read a custom property). Above it the sheet presents as a centered Dialog.
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

interface DragState {
  startY: number;
  lastY: number;
  lastTime: number;
  velocity: number;
}

export interface BottomSheetProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open'> {
  /** Controlled visibility, as in Dialog. */
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
  footer?: ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight | undefined;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean | undefined;
  /**
   * Drag the handle (or the header) downward to dismiss: release past 25% of the sheet height, or
   * faster than 1.5 px/ms, dismisses; otherwise the sheet springs back. The dismiss then plays the
   * normal exit transition (no momentum physics). The body does not start the gesture; only the
   * handle and header do. Purely additive: the close button and Escape always exist.
   */
  dragToDismiss?: boolean | undefined;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: ((reason: BottomSheetCloseReason) => void) | undefined;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. Carries no payload. */
  onDragDismiss?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. `inset`, `radius`, `partGap` and `footerGap` are forwarded to Dialog above the breakpoint. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * BottomSheet — Design Schema, category: overlay.
 *
 * When to use:
 * Use a BottomSheet on phones for a task or a set of choices that would otherwise be a Dialog:
 * filters, a form of a few fields, details of a selected item, a picker with many options. Use
 * `height: content` by default; `full` for a task that needs the whole screen but should still feel
 * dismissable; `half` for a browsable list where seeing the page behind matters (a map with
 * results). For a flat list of actions, ActionSheet is the lighter component.
 *
 * Above the `layout.maxWidth.prose` breakpoint the same props render a centered `Dialog` of size md.
 * The sheet never closes itself: every close path calls `onClose` with a reason and the consumer
 * flips `open`.
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
  const wideDialogRef = useRef<HTMLDialogElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pointerDownInsideRef = useRef(false);
  const escapeHandledRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);
  // The always-present wrapper of the wide presentation; Dialog portals into it.
  const [wideHost, setWideHost] = useState<HTMLDivElement | null>(null);

  const latest = useRef({ open });
  latest.current = { open };

  useImperativeHandle(ref, () => (isWide ? wideDialogRef.current : dialogRef.current) as HTMLDialogElement, [
    isWide,
    present,
    wideHost,
  ]);

  const warnedRef = useRef(false);
  if (process.env.NODE_ENV !== 'production' && !heading && !warnedRef.current) {
    warnedRef.current = true;
    console.warn('BottomSheet: `heading` is required and becomes the accessible name; it must not be empty.');
  }

  if (open && !present) setPresent(true);

  // Narrow open: showModal(), move focus in (body's first control, else close button, else heading), reveal next frame.
  useLayoutEffect(() => {
    if (!present || isWide) return undefined;
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    if (!dialog || !surface) return undefined;
    if (!dialog.open) {
      // jsdom implements the `open` IDL attribute but not showModal(); the assignment is the fallback there.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
    }

    const bodyFirst = firstFocusableIn(bodyRef.current);
    const headingElement = headingRef.current;
    if (bodyFirst) {
      bodyFirst.focus();
    } else if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else if (headingElement) {
      if (headingElement.tabIndex !== -1) headingElement.tabIndex = -1;
      headingElement.focus();
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, isWide]);

  // A drag dismiss exits from wherever the finger left the sheet: drop the inline offset in the same
  // commit that drops the visible class, so the exit transition starts from there.
  useLayoutEffect(() => {
    if (open) return;
    const surface = surfaceRef.current;
    if (surface && surface.style.transform) surface.style.transform = '';
  }, [open]);

  // Narrow close: run the exit transition, then close() and unmount (FocusScope restores the opener).
  useEffect(() => {
    if (open || !present || isWide) return undefined;
    setVisible(false);
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    const finish = (): void => {
      if (dialog?.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.open = false;
      }
      setPresent(false);
    };
    if (!surface || hasNoTransition(surface)) {
      finish();
      return undefined;
    }
    const handleExited = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'transform') finish();
    };
    surface.addEventListener('transitionend', handleExited);
    return () => surface.removeEventListener('transitionend', handleExited);
  }, [open, present, isWide]);

  // Wide close: Dialog runs its own exit; the wrapper unmounts once Dialog has removed its node.
  useEffect(() => {
    if (!isWide || !wideHost || open) return undefined;
    if (wideHost.childElementCount === 0) {
      setPresent(false);
      return undefined;
    }
    const observer = new MutationObserver(() => {
      if (wideHost.childElementCount === 0 && !latest.current.open) setPresent(false);
    });
    observer.observe(wideHost, { childList: true });
    return () => observer.disconnect();
  }, [isWide, wideHost, open]);

  // Scroll lock on <html> while the narrow sheet is present; Dialog locks its own.
  useEffect(() => {
    if (!present || isWide) return undefined;
    return lockScroll();
  }, [present, isWide]);

  const requestClose = (reason: BottomSheetCloseReason): void => {
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>): void => {
    rest.onKeyDown?.(event);
    if (event.key !== 'Escape' || event.defaultPrevented || !open) return;
    event.preventDefault();
    escapeHandledRef.current = true;
    // The browser's `cancel` for this same key follows the keydown's listeners; skip it once.
    setTimeout(() => {
      escapeHandledRef.current = false;
    }, 0);
    requestClose('escape');
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the sheet, dismissible or not.
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    requestClose('escape');
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDialogElement>): void => {
    rest.onPointerDown?.(event);
    pointerDownInsideRef.current = event.target !== dialogRef.current;
  };

  // ::backdrop (the scrim) clicks target the <dialog> itself; a drag that started on the surface does not count.
  const handleClick = (event: ReactMouseEvent<HTMLDialogElement>): void => {
    rest.onClick?.(event);
    const startedInside = pointerDownInsideRef.current;
    pointerDownInsideRef.current = false;
    if (event.target !== dialogRef.current || startedInside || !open) return;
    requestClose('scrim');
  };

  // minTarget: the close Button keeps its own size; its wrapper extends the pointer target to the comfortable size.
  const handleCloseTargetClick = (event: ReactMouseEvent<HTMLSpanElement>): void => {
    const button = closeButtonRef.current;
    if (!button || button.contains(event.target as Node)) return;
    button.click();
  };

  const canDrag = dragToDismiss && dismissible;

  // Drag: Pointer Events on the header (which holds the decorative handle), downward only.
  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!canDrag || !open) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if ((event.target as Element).closest('button, a[href], input, select, textarea')) return;
    // The gesture begins only while the body is at its scroll top.
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    dragRef.current = { startY: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0 };
    // The drag-follow tracks the finger directly, reduced motion or not.
    surface.style.transition = 'none';
  };

  const trackPointer = (drag: DragState, event: ReactPointerEvent<HTMLDivElement>): void => {
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      drag.velocity = (event.clientY - drag.lastY) / elapsed;
      drag.lastY = event.clientY;
      drag.lastTime = event.timeStamp;
    }
  };

  const handleHeaderPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    trackPointer(drag, event);
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    dragRef.current = null;
    if (!drag || !surface) return;
    if (event.clientY !== drag.lastY) trackPointer(drag, event);
    surface.style.transition = '';

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const sheetHeight = surface.getBoundingClientRect().height;
    const pastDistance = sheetHeight > 0 && deltaY / sheetHeight > DISMISS_DISTANCE;
    const dismiss = !cancelled && deltaY > 0 && (pastDistance || drag.velocity > DISMISS_VELOCITY);

    if (!dismiss) {
      // Spring back on the sheet's own transition.
      surface.style.transform = '';
      return;
    }
    onDragDismiss?.();
    requestClose('drag');
    // A controlled consumer may keep the sheet open; then it springs back.
    requestAnimationFrame(() => {
      if (latest.current.open && surface.style.transform) surface.style.transform = '';
    });
  };

  if (!present) return null;

  const target = container ?? document.body;

  if (isWide) {
    let dialogOverrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
    for (const binding of DIALOG_FORWARDED) {
      const value = overrides?.[binding];
      if (value) dialogOverrides = { ...dialogOverrides, [binding]: value };
    }
    return createPortal(
      <div ref={setWideHost} data-ds="BottomSheet" className="ds-bottom-sheet-host">
        {wideHost ? (
          <Dialog
            {...rest}
            ref={wideDialogRef}
            open={open}
            heading={heading}
            hideHeading={hideHeading}
            footer={footer}
            size="md"
            dismissible={dismissible}
            onClose={onClose}
            container={wideHost}
            overrides={dialogOverrides}
          >
            {children}
          </Dialog>
        ) : null}
      </div>,
      target,
    );
  }

  const classes = [
    'ds-bottom-sheet',
    `ds-bottom-sheet--${height}`,
    canDrag ? 'ds-bottom-sheet--draggable' : null,
    visible && open ? 'ds-bottom-sheet--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const footerGap = overrides?.footerGap;
  const hasFooter = footer !== undefined && footer !== null && footer !== false;

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="BottomSheet"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      aria-modal="true"
      aria-labelledby={headingId}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
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
                <Heading level={2} id={headingId} ref={headingRef}>
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
                    onClick={() => requestClose('close-button')}
                  />
                </span>
              ) : null}
            </div>
          </div>
          <div className="ds-bottom-sheet__scroll" ref={scrollRef}>
            <Box data-part="body" inset="none" ref={bodyRef}>
              {children}
            </Box>
          </div>
          {hasFooter ? (
            <div className="ds-bottom-sheet__footer" data-part="footer">
              <Stack
                direction="horizontal"
                gap="tight"
                justify="end"
                wrap
                overrides={footerGap ? { gap: footerGap } : undefined}
              >
                {footer}
              </Stack>
            </div>
          ) : null}
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, target);
}
