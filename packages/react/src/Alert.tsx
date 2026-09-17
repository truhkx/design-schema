import { useId, useImperativeHandle, useRef, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import './Alert.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AlertLive = 'status' | 'alert' | 'off';

const COPY = { dismissLabel: 'Dismiss' } as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type AlertOverridableBinding =
  | 'border'
  | 'borderWidth'
  | 'radius'
  | 'padding'
  | 'gap'
  | 'partGap'
  | 'iconSize'
  | 'headingSize'
  | 'headingWeight'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'dismissMargin';

const OVERRIDE_HOOK: Record<AlertOverridableBinding, string> = {
  border: '--ds-alert-border',
  borderWidth: '--ds-alert-border-width',
  radius: '--ds-alert-radius',
  padding: '--ds-alert-padding',
  gap: '--ds-alert-gap',
  partGap: '--ds-alert-part-gap',
  iconSize: '--ds-alert-icon-size',
  headingSize: '--ds-alert-heading-size',
  headingWeight: '--ds-alert-heading-weight',
  fontFamily: '--ds-alert-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-alert-font-size',
  lineHeight: '--ds-alert-line-height',
  dismissMargin: '--ds-alert-dismiss-margin',
};

/** Default token for the `iconSize` binding, forwarded to the Icon as `overrides.size`. */
const ICON_SIZE_TOKEN = 'font.size.lg' as TokenRef;

function overridesToStyle(overrides: Partial<Record<AlertOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as AlertOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    // Locked bindings are not in the type; ignore them if passed anyway.
    if (hook === undefined || !ref) continue;
    style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex], [contenteditable]:not([contenteditable="false"])';

/** Whether `el` is rendered: neither it nor an ancestor is `hidden` or `display: none`. */
function isRendered(el: HTMLElement): boolean {
  const view = el.ownerDocument.defaultView;
  for (let node: HTMLElement | null = el; node !== null; node = node.parentElement) {
    if (node.hidden) return false;
    if (view !== null && view.getComputedStyle(node).display === 'none') return false;
  }
  return true;
}

/** A focus candidate outside the alert: not disabled, not inside `inert`, rendered, tabindex ≥ 0 when set. */
function isCandidate(root: HTMLElement, el: HTMLElement): boolean {
  if (root.contains(el)) return false;
  const tabindex = el.getAttribute('tabindex');
  if (tabindex !== null && Number.parseInt(tabindex, 10) < 0) return false;
  if (el.matches(':disabled') || el.closest('[inert]') !== null) return false;
  return isRendered(el);
}

/** Moves focus to the next focusable element after `root` in reading order, or the previous one when there is none. */
function focusOutside(root: HTMLElement): void {
  const candidates = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) =>
    isCandidate(root, el),
  );
  const isAfter = (el: HTMLElement): boolean =>
    (root.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  const next = candidates.find(isAfter);
  const previous = next === undefined ? candidates.filter((el) => !isAfter(el)).pop() : undefined;
  // Nothing focusable outside the alert: focus is left alone.
  (next ?? previous)?.focus();
}

export interface AlertProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'title' | 'style' | 'className'> {
  /**
   * What kind of message this is. Sets the colors and the icon, which together convey the tone
   * without relying on color. There is deliberately no `neutral` tone: every value here says
   * something about urgency, and a message that says nothing about urgency is not an Alert.
   */
  tone?: AlertTone | undefined;
  /**
   * A short bold first line for the message. Optional for one-line messages. Named `heading`, not
   * `title`, because `title` is a native attribute (tooltip) on every platform element.
   */
  heading?: string | undefined;
  /** The message body. Text and Links; no headings or form controls. */
  children: ReactNode;
  /**
   * How the alert is announced when it appears. `status` is polite (most messages), `alert`
   * interrupts (only for errors that block the user), `off` for alerts already present when the
   * view loads. Maps to role=status, role=alert, or a plain region. Never use `alert` for success or info.
   */
  live?: AlertLive | undefined;
  /**
   * Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer
   * removes the alert (the component is controlled by its presence in the tree).
   */
  dismissible?: boolean | undefined;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: (() => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<AlertOverridableBinding, TokenRef | undefined>> | undefined;
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
export function Alert({
  ref,
  tone = 'info',
  heading,
  children,
  live = 'status',
  dismissible = false,
  onDismiss,
  overrides,
  ...rest
}: AlertProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const headingId = useId();
  const bodyId = useId();
  const hasHeading = heading !== undefined && heading !== '';

  // The component is controlled by its presence in the tree: the consumer removes it on dismiss.
  const handleDismiss = (): void => {
    // Activation happened inside the alert; move focus out first so it is never lost.
    if (rootRef.current) focusOutside(rootRef.current);
    onDismiss?.();
  };

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Alert"
      data-part="container"
      className={`ds-alert ds-alert--${tone}`}
      style={overrides ? overridesToStyle(overrides) : undefined}
      role={live === 'off' ? undefined : live}
      aria-labelledby={hasHeading ? headingId : bodyId}
    >
      <span className="ds-alert__icon" data-part="icon">
        <Icon
          name={tone}
          overrides={{
            color: `color.status.${tone}.icon` as TokenRef,
            size: overrides?.iconSize ?? ICON_SIZE_TOKEN,
          }}
        />
      </span>
      <div className="ds-alert__content">
        {hasHeading ? (
          <p id={headingId} className="ds-alert__heading" data-part="heading">
            {heading}
          </p>
        ) : null}
        <div id={bodyId} className="ds-alert__body" data-part="body">
          {children}
        </div>
      </div>
      {dismissible ? (
        <span className="ds-alert__dismiss" data-part="dismissButton">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            label={COPY.dismissLabel}
            leadingIcon={<Icon name="close" inline />}
            onClick={handleDismiss}
          />
        </span>
      ) : null}
    </div>
  );
}
