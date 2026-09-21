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
  | 'gutter'
  | 'layer'
  | 'rise'
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
  gutter: '--ds-alert-dialog-gutter',
  layer: '--ds-alert-dialog-layer',
  rise: '--ds-alert-dialog-rise',
  enter: '--ds-alert-dialog-enter',
  exit: '--ds-alert-dialog-exit',
};

function overridesToStyle(
  overrides: Partial<Record<AlertDialogOverridableBinding, TokenRef | undefined>>,
): CSSProperties {
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
  extends Omit<
    ComponentPropsWithoutRef<'dialog'>,
    'children' | 'title' | 'onCancel' | 'onClose' | 'open' | 'role'
  > {
  /** Controlled only — there is no uncontrolled mode; the consumer owns `open` and sets it false after handling `onConfirm` or `onCancel`, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading at the size Heading reads from level 2 (no explicit `size`), and the accessible name ("Delete 3 files?"). */
  heading: string;
  /** What will happen and whether it can be undone, in one or two sentences, rendered as Text `tone="muted"` at Text's default size (the color.foreground.muted contrast pair). Required: a decision without consequences stated is not a decision. */
  description: string;
  /** The nature of the decision. Sets the status icon (Icon `name` equal to the tone) and the confirm button's variant (danger → danger Button; warning and info → primary). Both buttons are Button size md. */
  tone?: AlertDialogTone | undefined;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string | undefined;
  /** Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. Forwarded to the confirm Button's own `disabled` — it stays focusable-but-inert, so Confirm is still the last Tab stop; AlertDialog neither restyles it nor sets aria-disabled itself. */
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
 * `onConfirm`, a scrim click does nothing, and the consumer flips `open`. Focus starts on Cancel so
 * Enter pressed reflexively cancels rather than destroys. The ref resolves to the `<dialog>`, null
 * while closed.
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
  const setDialogNode = useCallback(
    (node: HTMLDialogElement | null): void => {
      dialogRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  /** True from the moment Escape is reported until the end of the task, so the browser's `cancel`
   * for that same key is not reported a second time. */
  const escapeReportedRef = useRef(false);
  const selfClosingRef = useRef(false);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; set a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  const latestOpen = useRef(open);
  latestOpen.current = open;

  const warnedRef = useRef(false);
  if (process.env.NODE_ENV !== 'production' && !warnedRef.current && (!heading || !description || !confirmLabel)) {
    warnedRef.current = true;
    console.warn(
      'AlertDialog: `heading`, `description` and `confirmLabel` are required; the heading is the accessible name and the description states the consequence.',
    );
  }

  if (open && !present) setPresent(true);

  /** Focus lands on Cancel, so Enter pressed reflexively cancels rather than destroys (WCAG 3.3.4). */
  const focusCancel = (): void => {
    const cancelButton = cancelButtonRef.current;
    if (cancelButton && document.activeElement !== cancelButton) cancelButton.focus();
  };

  // Open: showModal(), move focus to Cancel, then reveal on the next frame. FocusScope takes
  // autoFocus `none` because its layout effect runs first (a child's fires before its parent's),
  // while the <dialog> is still closed and cannot take focus; it keeps the trap and the restore.
  // This also runs when `open` returns true while the exit transition is still running.
  useLayoutEffect(() => {
    if (!present || !open) return undefined;
    const dialog = dialogRef.current;
    const surface = surfaceRef.current;
    if (!dialog || !surface) return undefined;
    selfClosingRef.current = false;
    if (!dialog.open) {
      // showModal() gives the top layer, Escape and background inertness. jsdom implements the
      // `open` IDL attribute but not showModal(), so the assignment is the fallback there.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
    }
    focusCancel();
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [present, open]);

  // Close: run the exit transition, then close() and unmount (FocusScope restores the opener).
  useEffect(() => {
    if (open || !present) return undefined;
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

  /** Each Escape is reported exactly once, whichever of keydown or `cancel` reaches us first. */
  const reportEscape = (): void => {
    escapeReportedRef.current = true;
    // The browser's `cancel` for this same key follows the keydown's listeners; skip it once.
    setTimeout(() => {
      escapeReportedRef.current = false;
    }, 0);
    onCancel?.('escape');
  };

  // Escape arrives as keydown; the native `cancel` covers any other close request the browser raises.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>): void => {
    rest.onKeyDown?.(event);
    if (event.key !== 'Escape' || event.defaultPrevented || !open) return;
    event.preventDefault();
    if (!escapeReportedRef.current) reportEscape();
  };

  const handleNativeCancel = (event: SyntheticEvent<HTMLDialogElement>): void => {
    // The consumer owns `open`: never let the browser close the dialog.
    event.preventDefault();
    if (escapeReportedRef.current || !open) return;
    reportEscape();
  };

  // A non-cancelable `cancel` closes the native dialog anyway, and a close watcher can close it with
  // no `cancel` at all (repeated Escape): report `escape` if nothing else did, then reopen and put
  // focus back on Cancel unless the consumer set `open` false.
  const handleNativeClose = (): void => {
    if (selfClosingRef.current) {
      selfClosingRef.current = false;
      return;
    }
    if (!open) return;
    if (!escapeReportedRef.current) reportEscape();
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open || !latestOpen.current) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.open = true;
      focusCancel();
    });
  };

  if (!present) return null;

  const classes = [
    'ds-alert-dialog',
    `ds-alert-dialog--${tone}`,
    visible && open ? 'ds-alert-dialog--visible' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSizeOverride = overrides?.iconSize;
  const footerGapOverride = overrides?.footerGap;

  const node = (
    <dialog
      {...rest}
      ref={setDialogNode}
      data-ds="AlertDialog"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onKeyDown={handleKeyDown}
      onCancel={handleNativeCancel}
      onClose={handleNativeClose}
    >
      {/* A real element inside the full-viewport <dialog>, as in Dialog, with no click listener:
          a scrim click answers nothing. */}
      <div className="ds-alert-dialog__scrim" data-part="scrim" />
      {/* FocusScope writes its own data-part="scope", so the focusScope part is this wrapper inside it. */}
      <FocusScope trapped autoFocus="none" restoreFocus>
        <div className="ds-alert-dialog__scope" data-part="focusScope">
          <div className="ds-alert-dialog__surface" ref={surfaceRef} data-part="surface">
            {/* The icon-and-text row is AlertDialog-owned and carries no data-part: it only holds iconGap. */}
            <div className="ds-alert-dialog__row">
              {/* Decorative: the heading and description already carry the tone. */}
              <span className="ds-alert-dialog__icon" data-part="icon" aria-hidden="true">
                {/* icon (locked) and iconSize reach the Icon's own hooks from the stylesheet; the
                    size override is passed only when the caller set it. */}
                <Icon name={tone} overrides={iconSizeOverride ? { size: iconSizeOverride } : undefined} />
              </span>
              <div className="ds-alert-dialog__text">
                <div className="ds-alert-dialog__heading" data-part="heading">
                  <Heading level="2" id={headingId}>
                    {heading}
                  </Heading>
                </div>
                <div className="ds-alert-dialog__description" data-part="description">
                  <Text id={descriptionId} tone="muted">
                    {description}
                  </Text>
                </div>
              </div>
            </div>
            <div className="ds-alert-dialog__footer" data-part="footer">
              {/* footerGap reaches the Stack through the stylesheet; the override is passed only
                  when the caller sets it, so consumer CSS on the AlertDialog hook still works. */}
              <Stack
                direction="horizontal"
                gap="tight"
                justify="end"
                overrides={footerGapOverride ? { gap: footerGapOverride } : undefined}
              >
                {/* Cancel first in DOM order: the first focusable, focused on open; `justify: end`
                    puts the confirming action at the visual end of the row. */}
                <span className="ds-alert-dialog__action" data-part="cancelButton">
                  <Button
                    ref={cancelButtonRef}
                    variant="secondary"
                    size="md"
                    label={cancelLabel ?? COPY.cancelLabel}
                    onClick={() => onCancel?.('cancel')}
                  />
                </span>
                <span className="ds-alert-dialog__action" data-part="confirmButton">
                  <Button
                    variant={CONFIRM_VARIANT[tone]}
                    size="md"
                    label={confirmLabel}
                    disabled={confirmDisabled}
                    onClick={() => onConfirm?.()}
                  />
                </span>
              </Stack>
            </div>
          </div>
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, container ?? document.body);
}
