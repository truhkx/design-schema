import { forwardRef, useImperativeHandle, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Button } from './Button';
import './Alert.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

/** copy.dismissLabel */
const DISMISS_LABEL = 'Dismiss';

/** Leading icon by tone: info circle, check circle, warning triangle, error octagon. Decorative. */
const ICON_PATH: Record<AlertTone, string> = {
  info: 'M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM8 7v4M8 5v.5',
  success: 'M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zM5 8l2 2 4-4',
  warning: 'M8 2l6.5 11.5h-13L8 2zM8 6.5v3M8 11v.5',
  danger: 'M5.3 1.5h5.4l3.8 3.8v5.4l-3.8 3.8H5.3L1.5 10.7V5.3l3.8-3.8zM8 5v3.5M8 11v.5',
};

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside(root: HTMLElement) {
  const candidates = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !root.contains(el),
  );
  const isAfter = (el: HTMLElement) => (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const next = candidates.find(isAfter);
  const previous = next === undefined ? candidates.filter((el) => !isAfter(el)).pop() : undefined;
  (next ?? previous)?.focus();
}

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'title'> {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  tone?: AlertTone;
  /** A short bold first line for the message. Optional for one-line messages. Not the native `title` attribute. */
  heading?: string;
  /** The message body. Text and Links; no headings or form controls. */
  children: ReactNode;
  /** How the alert is announced when it appears. `status` is polite, `alert` interrupts, `off` for alerts present at load. */
  live?: AlertLive;
  /** Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert. */
  dismissible?: boolean;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: () => void;
}

/**
 * Alert — Design Schema, category: feedback.
 *
 * When to use:
 * Use an Alert for a message that relates to the current view and should stay visible: a failed
 * save above the form, an expiring trial at the top of a screen, a success confirmation after
 * submit, a note that some features are unavailable offline. Choose `tone` by what the user
 * should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix
 * something. Use `dismissible` for messages the user can safely put away; leave persistent
 * problems undismissable.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = 'info', heading, children, live = 'status', dismissible = false, onDismiss, className, ...rest },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  // The component is controlled by its presence in the tree: the consumer removes it on dismiss.
  const handleDismiss = () => {
    // Activation happened inside the alert; move focus out first so it is never lost.
    if (rootRef.current) focusOutside(rootRef.current);
    onDismiss?.();
  };

  const classes = ['ds-alert', `ds-alert--${tone}`, className ?? null].filter(Boolean).join(' ');

  return (
    <div {...rest} ref={rootRef} className={classes} role={live === 'off' ? undefined : live}>
      <span className="ds-alert__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" focusable="false">
          <path d={ICON_PATH[tone]} />
        </svg>
      </span>
      <div className="ds-alert__content">
        {heading ? <p className="ds-alert__heading">{heading}</p> : null}
        <div className="ds-alert__body">{children}</div>
      </div>
      {dismissible ? (
        <span className="ds-alert__dismiss">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            label={DISMISS_LABEL}
            onClick={handleDismiss}
            leadingIcon={
              <svg width="1em" height="1em" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            }
          />
        </span>
      ) : null}
    </div>
  );
});
