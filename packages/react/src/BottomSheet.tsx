import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Box } from './Box';
import { Button } from './Button';
import { Dialog } from './Dialog';
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

function overridesToStyle(overrides: Partial<Record<BottomSheetOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as BottomSheetOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { closeLabel: 'Close' };

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
 * Above `layout.maxWidth.prose` (read from the loaded token stylesheet, never hard-coded) the sheet
 * presents as a centered Dialog instead of rising from the bottom edge.
 */
function useIsWideViewport(): boolean {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue('--layout-max-width-prose').trim();
    if (!breakpoint) return undefined;
    const query = window.matchMedia(`(min-width: ${breakpoint})`);
    const update = () => setIsWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isWide;
}

export interface BottomSheetProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open'> {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The sheet's title and accessible name. May be visually hidden with `hideTitle` when the content is self-explanatory (a share sheet). */
  title: string;
  /** Keep the title for assistive technology but do not render it. The accessible name is required regardless; visually hidden is fine, absent is not. */
  hideTitle?: boolean;
  /** The body. Scrolls inside the sheet when taller than the sheet's height. */
  children: ReactNode;
  /** Action row, pinned to the bottom of the sheet above the safe area. */
  footer?: ReactNode;
  /** `content` sizes to the body up to 90% of the viewport; `half` is a fixed half-height; `full` is a near-full-screen sheet with the top gutter visible so the scrim still shows. */
  height?: BottomSheetHeight;
  /** Escape, the close button, a scrim tap and the drag gesture all request close. When false, only the footer actions close it; Escape still reports. */
  dismissible?: boolean;
  /** Drag the handle (or the sheet) downward to dismiss, with a velocity threshold. Purely additive: the close button and Escape always exist. */
  draggable?: boolean;
  /** Requested close with reason: `escape`, `close-button`, `scrim`, `drag`, or `action`. */
  onClose?: (reason: BottomSheetCloseReason) => void;
  /** The user dragged the sheet past the dismiss threshold. Fired before `onClose` with reason drag; provided so analytics can distinguish gestures. */
  onDragDismiss?: () => void;
  /** Portal target for the sheet's DOM node. Defaults to `document.body`. Only used below the wide-viewport breakpoint; the Dialog presentation manages its own container. */
  container?: HTMLElement;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. Only applied to the bottom-edge presentation; above the wide breakpoint the sheet renders as Dialog and uses Dialog's own overrides contract. */
  overrides?: Partial<Record<BottomSheetOverridableBinding, TokenRef>>;
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
 */
export const BottomSheet = forwardRef<HTMLDialogElement, BottomSheetProps>(function BottomSheet(
  {
    open,
    title,
    hideTitle = false,
    children,
    footer,
    height = 'content',
    dismissible = true,
    draggable = true,
    onClose,
    onDragDismiss,
    container,
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const isWide = useIsWideViewport();

  const generatedId = useId();
  const titleId = `ds-bottom-sheet${generatedId}-title`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startY: number; startTime: number } | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  if (isDev && !title) {
    console.warn('BottomSheet: `title` is required and becomes the accessible name; it must not be empty.');
  }

  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  // Mount: open the native dialog, move focus to the first control, then reveal on the next frame.
  useLayoutEffect(() => {
    if (!present || isWide) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) {
      // showModal() also reflects `open`, natively; the assignment is the fallback for engines
      // (jsdom, under test) that implement the `open` IDL attribute but not showModal() itself.
      dialog.showModal?.();
      dialog.open = true;
    }

    const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (first ?? closeButtonRef.current ?? dialog).focus();

    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, isWide]);

  // Exit: hide, then unmount and close() once the transition finishes (immediately under reduced motion).
  useEffect(() => {
    if (open || !present || isWide) return undefined;
    setVisible(false);
    const dialog = dialogRef.current;
    const finish = () => {
      setPresent(false);
      dialog?.close?.();
      if (dialog) dialog.open = false;
    };
    if (prefersReducedMotion()) {
      finish();
      return undefined;
    }
    const surface = surfaceRef.current;
    const handleExited = (event: TransitionEvent) => {
      if (event.target !== surface || event.propertyName !== 'transform') return;
      finish();
    };
    surface?.addEventListener('transitionend', handleExited);
    return () => surface?.removeEventListener('transitionend', handleExited);
  }, [open, present, isWide]);

  // Body scroll lock while the sheet is present, restored on close or unmount.
  useEffect(() => {
    if (!present || isWide) return undefined;
    document.documentElement.classList.add('ds-bottom-sheet-lock-scroll');
    return () => document.documentElement.classList.remove('ds-bottom-sheet-lock-scroll');
  }, [present, isWide]);

  const requestClose = (reason: BottomSheetCloseReason) => {
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the sheet never closes itself, even when it is not dismissible.
    event.preventDefault();
    requestClose('escape');
  };

  const handleScrimClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    requestClose('scrim');
  };

  const handleCloseButtonClick = () => requestClose('close-button');

  // Drag: Pointer Events on the header (which carries the decorative handle), tracking downward
  // distance only. Released past 25% of the sheet's height or a fast flick dismisses; otherwise the
  // sheet springs back on the same transition the open/close states use.
  const handleHeaderPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    if ((event.target as HTMLElement).closest('button')) return;
    const surface = surfaceRef.current;
    if (!surface) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startY: event.clientY, startTime: event.timeStamp };
    surface.style.transition = 'none';
  };

  const handleHeaderPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    if (!drag || !surface) return;
    const deltaY = Math.max(0, event.clientY - drag.startY);
    surface.style.transform = `translateY(${deltaY}px)`;
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const surface = surfaceRef.current;
    dragRef.current = null;
    if (!drag || !surface) return;

    const deltaY = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, event.timeStamp - drag.startTime);
    const velocity = deltaY / elapsed;
    const sheetHeight = surface.getBoundingClientRect().height || 1;
    const pastThreshold = deltaY / sheetHeight > 0.25 || velocity > 0.5;

    surface.style.transition = prefersReducedMotion() ? 'none' : '';
    surface.style.transform = '';

    if (pastThreshold && dismissible) {
      onDragDismiss?.();
      requestClose('drag');
    }
  };

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const bodyOverrides = overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined;

  if (isWide) {
    return (
      <Dialog
        {...rest}
        ref={ref}
        open={open}
        heading={title}
        hideHeading={hideTitle}
        footer={footer}
        size="md"
        dismissible={dismissible}
        onClose={onClose}
        container={container}
        className={className}
        style={style}
      >
        {children}
      </Dialog>
    );
  }

  if (!present) return null;

  const classes = [
    'ds-bottom-sheet',
    `ds-bottom-sheet--height-${height}`,
    visible ? 'ds-bottom-sheet--visible' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const titleClasses = ['ds-bottom-sheet__title', hideTitle ? 'ds-bottom-sheet__title--hidden' : null]
    .filter(Boolean)
    .join(' ');

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="BottomSheet"
      className={classes}
      style={mergedStyle}
      aria-modal="true"
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleScrimClick}
    >
      <FocusScope trapped autoFocus="none" restoreFocus>
        <div className="ds-bottom-sheet__surface" ref={surfaceRef} data-part="surface">
          <div
            className="ds-bottom-sheet__header"
            data-part="header"
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
          >
            <span className="ds-bottom-sheet__handle" data-part="handle" aria-hidden="true" />
            <div className="ds-bottom-sheet__heading-row">
              <Heading level={2} id={titleId} data-part="title" className={titleClasses}>
                {title}
              </Heading>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="md"
                iconOnly
                label={COPY.closeLabel}
                data-part="closeButton"
                className="ds-bottom-sheet__close"
                onClick={handleCloseButtonClick}
                leadingIcon={<Icon name="close" inline />}
              />
            </div>
          </div>
          <Box element="div" inset="lg" overrides={bodyOverrides} data-part="body" className="ds-bottom-sheet__body" ref={bodyRef}>
            {children}
          </Box>
          {footer !== undefined ? (
            <div className="ds-bottom-sheet__footer" data-part="footer">
              <Stack direction="horizontal" gap="tight" justify="end">
                {footer}
              </Stack>
            </div>
          ) : null}
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
});
