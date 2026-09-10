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
  type SyntheticEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
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
  width: '--ds-alert-dialog-width',
  layer: '--ds-alert-dialog-layer',
  enter: '--ds-alert-dialog-enter',
  exit: '--ds-alert-dialog-exit',
};

function overridesToStyle(overrides: Partial<Record<AlertDialogOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as AlertDialogOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

const COPY = { cancelLabel: 'Cancel' };

/** Confirm button variant by tone: danger stays danger, warning and info read as the primary action. */
const CONFIRM_VARIANT: Record<AlertDialogTone, 'danger' | 'primary'> = {
  danger: 'danger',
  warning: 'primary',
  info: 'primary',
};

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export interface AlertDialogProps
  extends Omit<ComponentPropsWithoutRef<'dialog'>, 'children' | 'title' | 'onCancel' | 'onClose' | 'open'> {
  /** Controlled visibility, as in Dialog. */
  open: boolean;
  /** The question or statement, as a level-2 Heading and the accessible name ("Delete 3 files?"). */
  title: string;
  /** What will happen and whether it can be undone, in one or two sentences. Required: a decision without consequences stated is not a decision. */
  description: string;
  /** The nature of the decision. Sets the status icon and the confirm button's variant (danger → danger Button; warning and info → primary). */
  tone?: AlertDialogTone;
  /** The confirming action, restating it ("Delete files"). Never "OK" or "Yes". */
  confirmLabel: string;
  /** The declining action. Defaults to `copy.cancelLabel`. */
  cancelLabel?: string;
  /** Blocks confirm while a precondition is unmet (a typed confirmation, a loading state). Cancel always works. */
  confirmDisabled?: boolean;
  /** The user chose the confirming action. The consumer performs it and closes. */
  onConfirm?: () => void;
  /** The user declined, by the cancel button or Escape. Fired with reason `cancel` or `escape`. A scrim click does nothing. */
  onCancel?: (reason: AlertDialogCancelReason) => void;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertDialogOverridableBinding, TokenRef>>;
}

/**
 * AlertDialog — Design Schema, category: overlay.
 *
 * When to use:
 * Use an AlertDialog before an action that destroys data, spends money, sends something that
 * cannot be recalled, or leaves a state the user cannot get back to — and only when undo is not
 * available. Use `tone: danger` for destruction, `warning` for consequential-but-recoverable,
 * `info` for a decision with no downside that still needs a choice (leave the page with unsaved
 * changes? — that is `warning`).
 *
 * Do not confirm reversible actions; provide undo (a Toast with an action) instead, which is
 * faster and less annoying. Do not use an AlertDialog to show information (Alert or Dialog), to
 * collect input beyond a single typed confirmation (Dialog with a Form), or as a general "are you
 * sure" habit — if a team finds itself adding many, the actions need undo.
 */
export const AlertDialog = forwardRef<HTMLDialogElement, AlertDialogProps>(function AlertDialog(
  {
    open,
    title,
    description,
    tone = 'danger',
    confirmLabel,
    cancelLabel,
    confirmDisabled = false,
    onConfirm,
    onCancel,
    overrides,
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const titleId = `ds-alert-dialog${generatedId}-title`;
  const descriptionId = `ds-alert-dialog${generatedId}-description`;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  // Mounted while open, and while the exit transition finishes after `open` goes false.
  const [present, setPresent] = useState(open);
  // Drives the entered/exited CSS state; toggled a frame after mount so the enter transition runs.
  const [visible, setVisible] = useState(false);

  if (isDev && !title) {
    console.warn('AlertDialog: `title` is required and becomes the accessible name; it must not be empty.');
  }
  if (isDev && !description) {
    console.warn('AlertDialog: `description` is required — a decision without stated consequences is not a decision.');
  }

  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);

  // Mount: open the native dialog, focus Cancel (the first button, so Enter never confirms by
  // momentum), then reveal on the next frame.
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

    cancelButtonRef.current?.focus();

    if (prefersReducedMotion()) {
      setVisible(true);
      return undefined;
    }

    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
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

  // Body scroll lock while present, restored on close or unmount.
  useEffect(() => {
    if (!present) return undefined;
    document.documentElement.classList.add('ds-alert-dialog-lock-scroll');
    return () => document.documentElement.classList.remove('ds-alert-dialog-lock-scroll');
  }, [present]);

  const handleNativeCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // The consumer owns `open`; the dialog never closes itself.
    event.preventDefault();
    onCancel?.('escape');
  };

  const handleCancelClick = () => onCancel?.('cancel');
  const handleConfirmClick = () => onConfirm?.();

  if (!present) return null;

  const classes = [
    'ds-alert-dialog',
    `ds-alert-dialog--tone-${tone}`,
    visible ? 'ds-alert-dialog--visible' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const node = (
    <dialog
      {...rest}
      ref={dialogRef}
      data-ds="AlertDialog"
      className={classes}
      style={mergedStyle}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleNativeCancel}
    >
      <FocusScope trapped autoFocus="none" restoreFocus>
        <div className="ds-alert-dialog__surface" ref={surfaceRef} data-part="surface">
          <div className="ds-alert-dialog__content">
            <span className="ds-alert-dialog__icon" data-part="icon" aria-hidden="true">
              <Icon name={tone} size="lg" />
            </span>
            <div className="ds-alert-dialog__text">
              <Heading level={2} id={titleId} className="ds-alert-dialog__title">
                {title}
              </Heading>
              <Text id={descriptionId} tone="muted" size="sm" className="ds-alert-dialog__description">
                {description}
              </Text>
            </div>
          </div>
          <div className="ds-alert-dialog__footer" data-part="footer">
            <Stack direction="horizontal" gap="tight" justify="end">
              <Button
                ref={cancelButtonRef}
                variant="secondary"
                size="sm"
                label={cancelLabel ?? COPY.cancelLabel}
                onClick={handleCancelClick}
              />
              <Button
                variant={CONFIRM_VARIANT[tone]}
                size="sm"
                label={confirmLabel}
                disabled={confirmDisabled}
                onClick={handleConfirmClick}
              />
            </Stack>
          </div>
        </div>
      </FocusScope>
    </dialog>
  );

  return createPortal(node, document.body);
});
