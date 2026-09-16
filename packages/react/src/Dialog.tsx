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
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { Text } from './Text';
import './Dialog.css';

export type DialogSize = 'sm' | 'md' | 'lg';
export type DialogInitialFocus = 'first' | 'title' | 'close';
export type DialogCloseReason = 'escape' | 'close-button' | 'scrim' | 'action';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type DialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'headerGap'
  | 'footerGap'
  | 'descriptionGap'
  | 'widthSm'
  | 'layer'
  | 'enter'
  | 'exit';

const OVERRIDE_HOOK: Record<DialogOverridableBinding, string> = {
  scrim: '--ds-dialog-scrim',
  border: '--ds-dialog-border',
  borderWidth: '--ds-dialog-border-width',
  shadow: '--ds-dialog-shadow',
  radius: '--ds-dialog-radius',
  inset: '--ds-dialog-inset',
  partGap: '--ds-dialog-part-gap',
  headerGap: '--ds-dialog-header-gap',
  footerGap: '--ds-dialog-footer-gap',
  descriptionGap: '--ds-dialog-description-gap',
  widthSm: '--ds-dialog-width-sm',
  layer: '--ds-dialog-layer',
  enter: '--ds-dialog-enter',
  exit: '--ds-dialog-exit',
};

function overridesToStyle(overrides: Partial<Record<DialogOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as DialogOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // Locked bindings are not in the type; anything passed anyway has no hook and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/** copy.* — used verbatim. */
const COPY = { closeLabel: 'Close' };

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

/** Scroll lock is reference-counted so an overlay opened over the dialog cannot release it early. */
let scrollLockCount = 0;
function lockScroll(): () => void {
  scrollLockCount += 1;
  document.documentElement.classList.add('ds-dialog-lock-scroll');
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.documentElement.classList.remove('ds-dialog-lock-scroll');
  };
}

export interface DialogProps
  extends Omit<
    ComponentPropsWithoutRef<'dialog'>,
    'children' | 'title' | 'onCancel' | 'onClose' | 'open'
  > {
  /** Controlled visibility. The consumer owns it; the dialog requests changes through `onClose`. */
  open: boolean;
  /** The dialog's title, rendered as a level-2 Heading and used as the accessible name. Says what the task is ("Rename project"). */
  heading: string;
  /** One sentence under the title explaining the task or consequence. Becomes the accessible description. */
  description?: string | undefined;
  /** The body — a Form, Text, or controls. Scrolls inside the surface when taller than the viewport; header and footer stay put. */
  children: ReactNode;
  /** The action row. Primary action first, then one secondary; follows Form's action-order rule. A dialog with no footer must be dismissable from its body. */
  footer?: ReactNode;
  /** Visually hide the heading while it remains the accessible name (BottomSheet forwards its own hideHeading here above the breakpoint). */
  hideHeading?: boolean | undefined;
  /** Surface width on wide viewports. Full-width below the content measure on every size. */
  size?: DialogSize | undefined;
  /** Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer): the close button is not rendered and the scrim does nothing; Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Dialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Dialog for a short task that must complete before the user continues and needs its own
 * space: rename, create-with-a-few-fields, choose from options with consequences, confirm something
 * reversible with a form attached. Keep it to one screen of content; a dialog that scrolls much is a
 * page. Give it a `heading` that names the task and a `footer` with the completing action first.
 *
 * The dialog never closes itself: Escape, the close button and a scrim click call `onClose` with a
 * reason and the consumer flips `open`.
 */
export function Dialog({
  ref,
  open,
  heading,
  description,
  children,
  footer,
  hideHeading = false,
  size = 'md',
  dismissible = true,
  initialFocus = 'first',
  onClose,
  onOpened,
  container,
  overrides,
  // Never forwarded to the root: `overrides` is the only per-instance styling.
  className: _className,
  style: _style,
  ...rest
}: DialogProps & { ref?: Ref<HTMLDialogElement> | undefined }): ReactElement | null {
  const generatedId = useId();
  const headingId = `ds-dialog${generatedId}-heading`;
  const descriptionId = `ds-dialog${generatedId}-description`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pointerDownInsideRef = useRef(false);
  const escapeHandledRef = useRef(false);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  const latest = useRef({ initialFocus, dismissible, onOpened });
  latest.current = { initialFocus, dismissible, onOpened };

  const warnedRef = useRef(false);
  if (process.env.NODE_ENV !== 'production' && !heading && !warnedRef.current) {
    warnedRef.current = true;
    console.warn('Dialog: `heading` is required and becomes the accessible name; it must not be empty.');
  }

  if (open && !present) setPresent(true);

  // Open: showModal(), move focus in per `initialFocus`, then reveal on the next frame.
  useLayoutEffect(() => {
    if (!present) return undefined;
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    if (!dialog || !surface) return undefined;
    if (!dialog.open) {
      // showModal() gives the top layer, Escape and background inertness. jsdom implements the
      // `open` IDL attribute but not showModal(), so the assignment is the fallback there.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
    }

    const { initialFocus: focusTarget, dismissible: canDismiss } = latest.current;
    const headingElement = headingRef.current;
    const focusHeading = (): void => {
      if (!headingElement) return;
      if (headingElement.tabIndex !== -1) headingElement.tabIndex = -1;
      headingElement.focus();
    };
    const bodyFirst = firstFocusableIn(bodyRef.current);
    if (focusTarget === 'title') {
      focusHeading();
    } else if (focusTarget === 'close' && canDismiss && closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else if (bodyFirst) {
      bodyFirst.focus();
    } else if (focusTarget === 'first' && closeButtonRef.current) {
      closeButtonRef.current.focus();
    } else {
      focusHeading();
    }

    let fired = false;
    const fireOpened = (): void => {
      if (fired) return;
      fired = true;
      latest.current.onOpened?.();
    };
    const handleEntered = (event: TransitionEvent): void => {
      if (event.target === surface && event.propertyName === 'opacity') fireOpened();
    };
    surface.addEventListener('transitionend', handleEntered);
    const frame = requestAnimationFrame(() => {
      setVisible(true);
      if (hasNoTransition(surface)) fireOpened();
    });
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener('transitionend', handleEntered);
    };
  }, [present]);

  // Close: run the exit transition, then close() and unmount (FocusScope restores the opener).
  useEffect(() => {
    if (open || !present) return undefined;
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
      if (event.target === surface && event.propertyName === 'opacity') finish();
    };
    surface.addEventListener('transitionend', handleExited);
    return () => surface.removeEventListener('transitionend', handleExited);
  }, [open, present]);

  // Scroll lock on <html> while the dialog is present.
  useEffect(() => {
    if (!present) return undefined;
    return lockScroll();
  }, [present]);

  const requestClose = (reason: DialogCloseReason): void => {
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  // Escape arrives as keydown; the native `cancel` also covers other close requests (Android back).
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
    // The consumer owns `open`: never let the browser close the dialog, dismissible or not.
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    requestClose('escape');
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDialogElement>): void => {
    rest.onPointerDown?.(event);
    pointerDownInsideRef.current = event.target !== dialogRef.current;
  };

  // ::backdrop clicks target the <dialog> itself; a drag that started on the surface does not count.
  const handleClick = (event: ReactMouseEvent<HTMLDialogElement>): void => {
    rest.onClick?.(event);
    const startedInside = pointerDownInsideRef.current;
    pointerDownInsideRef.current = false;
    if (event.target !== dialogRef.current || startedInside || !open) return;
    requestClose('scrim');
  };

  if (!present) return null;

  const classes = ['ds-dialog', `ds-dialog--${size}`, visible && open ? 'ds-dialog--visible' : null]
    .filter(Boolean)
    .join(' ');

  const footerGap = overrides?.footerGap;

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="Dialog"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={handleKeyDown}
      onCancel={handleCancel}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <FocusScope trapped autoFocus="none" restoreFocus data-part="focusScope">
        <div className="ds-dialog__surface" ref={surfaceRef} data-part="surface">
          <div className="ds-dialog__header" data-part="header">
            <div className="ds-dialog__titles">
              <div
                className={hideHeading ? 'ds-dialog__heading ds-dialog__visually-hidden' : 'ds-dialog__heading'}
                data-part="heading"
              >
                <Heading
                  level={2}
                  id={headingId}
                  ref={headingRef}
                  tabIndex={initialFocus === 'title' ? -1 : undefined}
                >
                  {heading}
                </Heading>
              </div>
              {description ? (
                <Text id={descriptionId} tone="muted" data-part="description">
                  {description}
                </Text>
              ) : null}
            </div>
            {dismissible ? (
              <span className="ds-dialog__close" data-part="closeButton">
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
          <div className="ds-dialog__scroll">
            <Box data-part="body" ref={bodyRef}>
              {children}
            </Box>
          </div>
          {footer !== undefined && footer !== null && footer !== false ? (
            <div className="ds-dialog__footer" data-part="footer">
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

  return createPortal(node, container ?? document.body);
}
