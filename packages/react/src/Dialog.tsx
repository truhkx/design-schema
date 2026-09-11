import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent, type ReactPortal,
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

export interface DialogProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open'> {
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
  /** Escape, the close button and a scrim click all request close. Set false for a dialog that must be answered (then provide the answers in the footer); Escape still fires `onClose` with reason `escape` so the consumer can decide. */
  dismissible?: boolean | undefined;
  /** Where focus lands on open: the first focusable control in the body (default), the title (for long or reading dialogs), or the close button. */
  initialFocus?: DialogInitialFocus | undefined;
  /** Fired when the user requests to close, with a reason: `escape`, `close-button`, `scrim`, or `action`. The consumer sets `open` to false (or not). */
  onClose?: ((reason: DialogCloseReason) => void) | undefined;
  /** Fired after the open transition ends and focus has moved in. Use to start work that needs the dialog visible. */
  onOpened?: (() => void) | undefined;
  /** Portal target for the dialog's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DialogOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Dialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use a Dialog for a short task that must complete before the user continues and needs its own
 * space: rename, create-with-a-few-fields, choose from options with consequences, confirm
 * something reversible with a form attached. Keep it to one screen of content; a dialog that
 * scrolls much is a page. Give it a `heading` that names the task and a `footer` with the completing
 * action first.
 */
export const Dialog = function Dialog({
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
  className,
  style,
  ...rest
}: DialogProps & { ref?: Ref<HTMLDialogElement> | undefined }): ReactPortal | null {
  const generatedId = useId();
  const headingId = `ds-dialog${generatedId}-heading`;
  const descriptionId = `ds-dialog${generatedId}-description`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  const latest = useRef({ initialFocus, onOpened });
  latest.current = { initialFocus, onOpened };

  if (isDev && !heading) {
    console.warn('Dialog: `heading` is required and becomes the accessible name; it must not be empty.');
  }

  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  // Mount: open the native dialog, move focus in per `initialFocus`, then reveal on the next frame.
  useLayoutEffect(() => {
    if (!present) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (!dialog.open) {
      // showModal() also reflects `open`, natively; the assignment is the fallback for engines
      // (jsdom, under test) that implement the `open` IDL attribute but not showModal() itself.
      dialog.showModal?.();
      dialog.open = true;
    }

    const { initialFocus: focusTarget } = latest.current;
    if (focusTarget === 'title') {
      headingRef.current?.focus();
    } else if (focusTarget === 'close') {
      closeButtonRef.current?.focus();
    } else {
      const first = bodyRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? closeButtonRef.current ?? dialog).focus();
    }

    if (prefersReducedMotion()) {
      setVisible(true);
      latest.current.onOpened?.();
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    const surface = surfaceRef.current;
    const handleEntered = (event: TransitionEvent) => {
      if (event.target !== surface || event.propertyName !== 'opacity') return;
      latest.current.onOpened?.();
    };
    surface?.addEventListener('transitionend', handleEntered);
    return () => {
      cancelAnimationFrame(frame);
      surface?.removeEventListener('transitionend', handleEntered);
    };
  }, [present]);

  // Exit: hide, then unmount and close() once the transition finishes (immediately under reduced motion).
  useEffect(() => {
    if (open || !present) return undefined;
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
      if (event.target !== surface || event.propertyName !== 'opacity') return;
      finish();
    };
    surface?.addEventListener('transitionend', handleExited);
    return () => surface?.removeEventListener('transitionend', handleExited);
  }, [open, present]);

  // Body scroll lock while the dialog is present, restored on close or unmount.
  useEffect(() => {
    if (!present) return undefined;
    document.documentElement.classList.add('ds-dialog-lock-scroll');
    return () => document.documentElement.classList.remove('ds-dialog-lock-scroll');
  }, [present]);

  const requestClose = (reason: DialogCloseReason) => {
    if (reason !== 'escape' && !dismissible) return;
    onClose?.(reason);
  };

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the dialog never closes itself, even when it is not dismissible.
    event.preventDefault();
    requestClose('escape');
  };

  const handleScrimClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (event.target !== dialogRef.current) return;
    requestClose('scrim');
  };

  const handleCloseButtonClick = () => requestClose('close-button');

  if (!present) return null;

  const classes = ['ds-dialog', `ds-dialog--${size}`, visible ? 'ds-dialog--visible' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;
  const bodyOverrides = overrides?.inset ? { paddingBlock: overrides.inset, paddingInline: overrides.inset } : undefined;

  const headingClasses = ['ds-dialog__heading', hideHeading ? 'ds-dialog__visually-hidden' : null]
    .filter(Boolean)
    .join(' ');

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="Dialog"
      className={classes}
      style={mergedStyle}
      aria-labelledby={headingId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={handleCancel}
      onClick={handleScrimClick}
    >
      <FocusScope trapped autoFocus="none" restoreFocus data-part="focusScope">
        <div className="ds-dialog__surface" ref={surfaceRef} data-part="surface">
          <div className="ds-dialog__header" data-part="header">
            <div className="ds-dialog__heading-group">
              <Heading
                level={2}
                id={headingId}
                ref={headingRef}
                tabIndex={-1}
                className={headingClasses}
                data-part="heading"
              >
                {heading}
              </Heading>
              {description ? (
                <Text id={descriptionId} tone="muted" size="sm" className="ds-dialog__description" data-part="description">
                  {description}
                </Text>
              ) : null}
            </div>
            {dismissible ? (
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="sm"
                iconOnly
                label={COPY.closeLabel}
                className="ds-dialog__close"
                data-part="closeButton"
                onClick={handleCloseButtonClick}
                leadingIcon={<Icon name="close" inline />}
              />
            ) : null}
          </div>
          <Box
            element="div"
            inset="lg"
            overrides={bodyOverrides}
            className="ds-dialog__body"
            data-part="body"
            ref={bodyRef}
          >
            {children}
          </Box>
          {footer !== undefined ? (
            <div className="ds-dialog__footer" data-part="footer">
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
};
