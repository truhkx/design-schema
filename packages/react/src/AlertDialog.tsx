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
  type ReactElement,
  type Ref,
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button, type ButtonVariant } from './Button';
import { FocusScope } from './FocusScope';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { Text } from './Text';
import './AlertDialog.css';

export type AlertDialogTone = 'danger' | 'warning' | 'info';
export type AlertDialogCancelReason = 'cancel' | 'escape';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type AlertDialogOverridableBinding =
  | 'scrim'
  | 'border'
  | 'borderWidth'
  | 'shadow'
  | 'radius'
  | 'inset'
  | 'partGap'
  | 'textGap'
  | 'iconGap'
  | 'footerGap'
  | 'iconSize'
  | 'width'
  | 'layer'
  | 'enter'
  | 'exit';

const OVERRIDE_HOOK: Record<AlertDialogOverridableBinding, string> = {
  scrim: '--ds-alert-dialog-scrim',
  border: '--ds-alert-dialog-border',
  borderWidth: '--ds-alert-dialog-border-width',
  shadow: '--ds-alert-dialog-shadow',
  radius: '--ds-alert-dialog-radius',
  inset: '--ds-alert-dialog-inset',
  partGap: '--ds-alert-dialog-part-gap',
  textGap: '--ds-alert-dialog-text-gap',
  iconGap: '--ds-alert-dialog-icon-gap',
  footerGap: '--ds-alert-dialog-footer-gap',
  iconSize: '--ds-alert-dialog-icon-size',
  width: '--ds-alert-dialog-width',
  layer: '--ds-alert-dialog-layer',
  enter: '--ds-alert-dialog-enter',
  exit: '--ds-alert-dialog-exit',
};

function overridesToStyle(overrides: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as AlertDialogOverridableBinding[]) {
    const ref = overrides[binding];
    const hook = OVERRIDE_HOOK[binding];
    // Locked bindings are not in the type; anything passed anyway has no hook and is ignored.
    if (ref && hook) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

/** copy.* — used verbatim. */
const COPY = { cancelLabel: 'Cancel' };

/** iconSize default (font.size.lg), forwarded to the Icon's own `size` override. */
const ICON_SIZE_TOKEN = 'font.size.lg' as TokenRef;

/** tone → confirm Button variant: danger → danger; warning and info → primary. */
const CONFIRM_VARIANT: Record<AlertDialogTone, ButtonVariant> = {
  danger: 'danger',
  warning: 'primary',
  info: 'primary',
};

declare const process: { env: { NODE_ENV?: string } };

/** True when the surface has no running transition (reduced motion, or no stylesheet as under jsdom). */
function hasNoTransition(element: HTMLElement): boolean {
  const durations = getComputedStyle(element).transitionDuration;
  if (!durations) return true;
  return durations.split(',').every((duration) => parseFloat(duration) === 0);
}

/** Scroll lock is reference-counted so an overlay opened over the alert dialog cannot release it early. */
let scrollLockCount = 0;
function lockScroll(): () => void {
  scrollLockCount += 1;
  document.documentElement.classList.add('ds-alert-dialog-lock-scroll');
  return () => {
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.documentElement.classList.remove('ds-alert-dialog-lock-scroll');
  };
}

export interface AlertDialogProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open' | 'role'> {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences. Required: a decision without consequences stated is not a decision. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. Forwarded to the confirm Button's own `disabled`. */
  confirmDisabled?: boolean | undefined;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: (() => void) | undefined;
  /** The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing. */
  onCancel?: ((reason: AlertDialogCancelReason) => void) | undefined;
  /** Portal target. Defaults to `document.body`. A platform prop, not part of the schema. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * AlertDialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use an AlertDialog before an action that destroys data, spends money, sends something that cannot
 * be recalled, or leaves a state the user cannot get back to — and only when undo is not available.
 * Use `tone: danger` for destruction, `warning` for consequential-but-recoverable, `info` for a
 * decision with no downside that still needs a choice (leave the page with unsaved changes? — that
 * is `warning`).
 *
 * The alert dialog never closes itself: Cancel and Escape fire `onCancel`, Confirm fires
 * `onConfirm`, a scrim click does nothing, and the consumer flips `open`.
 */
export function AlertDialog({
  ref,
  open,
  heading,
  description,
  tone = 'danger',
  confirmLabel,
  cancelLabel,
  confirmDisabled = false,
  onConfirm,
  onCancel,
  container,
  overrides,
  // Never forwarded to the root: `overrides` is the only per-instance styling.
  className: _className,
  style: _style,
  ...rest
}: AlertDialogProps & { ref?: Ref<HTMLDialogElement> | undefined }): ReactElement | null {
  const generatedId = useId();
  const headingId = `ds-alert-dialog${generatedId}-heading`;
  const descriptionId = `ds-alert-dialog${generatedId}-description`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const escapeHandledRef = useRef(false);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  const warnedRef = useRef(false);
  if (process.env.NODE_ENV !== 'production' && !warnedRef.current && (!heading || !description || !confirmLabel)) {
    warnedRef.current = true;
    console.warn(
      'AlertDialog: `heading`, `description` and `confirmLabel` are required; the heading is the accessible name and the description states the consequence.',
    );
  }

  if (open && !present) setPresent(true);

  // Open: showModal(), focus Cancel so Enter never confirms by momentum, then reveal on the next frame.
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
    cancelButtonRef.current?.focus();

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
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

  // Scroll lock on <html> while the alert dialog is present.
  useEffect(() => {
    if (!present) return undefined;
    return lockScroll();
  }, [present]);

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
    onCancel?.('escape');
  };

  const handleNativeCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the dialog.
    event.preventDefault();
    if (escapeHandledRef.current || !open) return;
    onCancel?.('escape');
  };

  if (!present) return null;

  const classes = [
    'ds-alert-dialog',
    `ds-alert-dialog--${tone}`,
    visible && open ? 'ds-alert-dialog--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="AlertDialog"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onKeyDown={handleKeyDown}
      onCancel={handleNativeCancel}
    >
      {/* No scrim click handler: a stray click on ::backdrop cannot answer the decision. */}
      <FocusScope trapped autoFocus="none" restoreFocus data-part="focusScope">
        <div className="ds-alert-dialog__surface" ref={surfaceRef} data-part="surface">
          <div className="ds-alert-dialog__row">
            <span className="ds-alert-dialog__icon" data-part="icon" aria-hidden="true">
              <Icon name={tone} overrides={{ size: overrides?.iconSize ?? ICON_SIZE_TOKEN }} />
            </span>
            <div className="ds-alert-dialog__text">
              <div className="ds-alert-dialog__heading" data-part="heading">
                <Heading level={2} id={headingId}>
                  {heading}
                </Heading>
              </div>
              <Text id={descriptionId} tone="muted" data-part="description">
                {description}
              </Text>
            </div>
          </div>
          <div className="ds-alert-dialog__footer" data-part="footer">
            <Stack
              direction="horizontal"
              gap="tight"
              justify="end"
              wrap
              overrides={overrides?.footerGap ? { gap: overrides.footerGap } : undefined}
            >
              {/* Cancel first in DOM order so it is the first focusable and focused on open. */}
              <span className="ds-alert-dialog__action" data-part="cancelButton">
                <Button
                  ref={cancelButtonRef}
                  variant="secondary"
                  label={cancelLabel ?? COPY.cancelLabel}
                  onClick={() => onCancel?.('cancel')}
                />
              </span>
              <span className="ds-alert-dialog__action" data-part="confirmButton">
                <Button
                  variant={CONFIRM_VARIANT[tone]}
                  label={confirmLabel}
                  disabled={confirmDisabled}
                  onClick={() => onConfirm?.()}
                />
              </span>
            </Stack>
          </div>
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
}
