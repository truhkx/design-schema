import { useId, useImperativeHandle, useRef, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import { CtaButton } from './CtaButton';
import { Icon } from './Icon';
import './Callout.css';

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger';
export type CalloutLive = 'status' | 'alert' | 'off';

/** copy.dismissLabel */
const DISMISS_LABEL = 'Dismiss';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CalloutOverridableBinding =
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

const OVERRIDE_HOOK: Record<CalloutOverridableBinding, string> = {
  border: '--demo-alert-border',
  borderWidth: '--demo-alert-border-width',
  radius: '--demo-alert-radius',
  padding: '--demo-alert-padding',
  gap: '--demo-alert-gap',
  partGap: '--demo-alert-part-gap',
  iconSize: '--demo-alert-icon-size',
  headingSize: '--demo-alert-heading-size',
  headingWeight: '--demo-alert-heading-weight',
  fontFamily: '--demo-alert-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--demo-alert-font-size',
  lineHeight: '--demo-alert-line-height',
  dismissMargin: '--demo-alert-dismiss-margin',
};

/** `iconSize` also drives the composed Icon's own `size` override, since Icon owns its own sizing hook. */
function overridesToStyle(overrides: Partial<Record<CalloutOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  iconSizeRef?: TokenRef | undefined;
} {
  const style: Record<string, string> = {};
  let iconSizeRef: TokenRef | undefined;
  for (const binding of Object.keys(overrides) as CalloutOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    style[OVERRIDE_HOOK[binding]] = cssVar(ref);
    if (binding === 'iconSize') iconSizeRef = ref;
  }
  return { rootStyle: style as CSSProperties, iconSizeRef };
}

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

export interface CalloutProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role' | 'title'> {
  /** What kind of message this is. Sets the colors and the icon, which together convey the tone without relying on color. */
  tone?: CalloutTone | undefined;
  /** A short bold first line for the message. Optional for one-line messages. Not the native `title` attribute. */
  heading?: string | undefined;
  /** The message body. Text and Links; no headings or form controls. */
  children: ReactNode;
  /** How the alert is announced when it appears. `status` is polite, `alert` interrupts, `off` for alerts present at load. */
  live?: CalloutLive | undefined;
  /** Shows a dismiss button at the end of the alert. Activating it fires `onDismiss`; the consumer removes the alert. */
  dismissible?: boolean | undefined;
  /** Fired when the user activates the dismiss button. The consumer removes the alert. */
  onDismiss?: (() => void) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CalloutOverridableBinding, TokenRef | undefined>> | undefined;
}

/**
 * Callout — Design Schema, category: feedback.
 *
 * When to use:
 * Use an Callout for a message that relates to the current view and should stay visible: a failed
 * save above the form, an expiring trial at the top of a screen, a success confirmation after
 * submit, a note that some features are unavailable offline. Choose `tone` by what the user
 * should do: `info` to know, `success` to relax, `warning` to be careful, `danger` to fix
 * something. Use `dismissible` for messages the user can safely put away; leave persistent
 * problems undismissable.
 */
export const Callout = function Callout({ ref, tone = 'info', heading, children, live = 'status', dismissible = false, onDismiss, overrides, className, style, ...rest }: CalloutProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const headingId = useId();
  const bodyId = useId();

  // The component is controlled by its presence in the tree: the consumer removes it on dismiss.
  const handleDismiss = () => {
    // Activation happened inside the alert; move focus out first so it is never lost.
    if (rootRef.current) focusOutside(rootRef.current);
    onDismiss?.();
  };

  const classes = ['demo-callout', `demo-callout--${tone}`, className ?? null].filter(Boolean).join(' ');

  const { rootStyle, iconSizeRef } = overrides ? overridesToStyle(overrides) : { rootStyle: undefined, iconSizeRef: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Alert"
      data-part="container"
      className={classes}
      style={mergedStyle}
      role={live === 'off' ? undefined : live}
      aria-labelledby={heading ? headingId : bodyId}
    >
      <span className="demo-callout__icon" data-part="icon" aria-hidden="true">
        <Icon
          name={tone}
          size="lg"
          overrides={{
            color: `color.status.${tone}.icon` as TokenRef,
            ...(iconSizeRef ? { size: iconSizeRef } : null),
          }}
        />
      </span>
      <div className="demo-callout__content">
        {heading ? (
          <p id={headingId} className="demo-callout__heading" data-part="heading">
            {heading}
          </p>
        ) : null}
        <div id={bodyId} className="demo-callout__body" data-part="body">
          {children}
        </div>
      </div>
      {dismissible ? (
        <span className="demo-callout__dismiss" data-part="dismissButton">
          <CtaButton emphasis="ghost" size="sm" iconOnly label={DISMISS_LABEL} onClick={handleDismiss} leadingIcon={<Icon name="close" inline />} />
        </span>
      ) : null}
    </div>
  );
};
