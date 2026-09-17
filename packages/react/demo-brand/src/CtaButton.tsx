import {
  useId,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import { useFormContext } from './FormContext';
import { trackPress } from './custom/analytics';
import './CtaButton.css';

export type CtaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type CtaButtonSize = 'sm' | 'md' | 'lg';
export type CtaButtonType = 'button' | 'submit';

/** Copy from the component doc, used verbatim. */
const COPY: { loading: string } = { loading: 'Loading' };

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CtaButtonOverridableBinding =
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'inverseBackgroundHover'
  | 'inverseHoverOpacity'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin'
  | 'spinnerSize';

const OVERRIDE_HOOK: Record<CtaButtonOverridableBinding, string> = {
  iconGap: '--demo-button-icon-gap',
  paddingInline: '--demo-button-padding-inline',
  paddingBlock: '--demo-button-padding-block',
  radius: '--demo-button-radius',
  fontFamily: '--demo-button-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontWeight: '--demo-button-font-weight',
  fontSize: '--demo-button-font-size',
  inverseBackgroundHover: '--demo-button-inverse-background-hover',
  inverseHoverOpacity: '--demo-button-inverse-hover-opacity',
  disabledOpacity: '--demo-button-disabled-opacity',
  transition: '--demo-button-transition',
  loadingSpin: '--demo-button-loading-spin',
  spinnerSize: '--demo-button-spinner-size',
};

function overridesToStyle(overrides: Partial<Record<CtaButtonOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CtaButtonOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    // Locked bindings are not in the type; one passed anyway has no hook and is ignored.
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface CtaButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'disabled' | 'children' | 'aria-label' | 'onClick'> {
  /** The button's text. Also its accessible name. */
  label: string;
  /**
   * Visual emphasis. One primary button per view. These four are the whole set: there is no
   * `outline` emphasis, and a bordered low-fill emphasis would be a new value here with its own
   * colour pair and its own contrast proof, never an alias for `secondary`.
   */
  emphasis?: CtaButtonVariant | undefined;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: CtaButtonSize | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: ReactNode | undefined;
  /** Icon after the label. Decorative, like leadingIcon. */
  trailingIcon?: ReactNode | undefined;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: CtaButtonType | undefined;
  /**
   * Set by a parent that the button discloses (Menu, Popover, SidePanel, Expander): aria-expanded
   * on web. Consumers rarely set it directly. No default, and tri-state: undefined means the button
   * discloses nothing, so no expanded state is reported at all — though an `aria-expanded` arriving
   * through `...rest` still applies.
   */
  expanded?: boolean | undefined;
  /**
   * Prevents activation. The button stays in the tab order and is announced as disabled. A press
   * blocked by `disabled` or `loading` is not a press: onPress does not fire and nothing chained from
   * it (an extension's tracking) runs. Inside a disabled Form the button is disabled whatever this
   * prop says.
   */
  disabled?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort by Amount,
   * ascending" on a header that shows "Amount"). The name must contain the visible label (WCAG 2.5.3
   * label-in-name); starting with it is preferred but not required. Maps to aria-label.
   */
  accessibleName?: string | undefined;
  /**
   * Text used for this button when a Toolbar collapses it into its overflow Menu. Only Buttons
   * collapse; other controls stay visible. CtaButton itself never renders it: Toolbar reads it from the
   * CtaButton element's props (it never reaches the DOM).
   */
  overflowLabel?: string | undefined;
  /**
   * Hides the visible label and shows only `leadingIcon`; `trailingIcon` is not rendered either.
   * `label` is still required and becomes the accessible name. Padding becomes equal on all sides
   * (`space.sm`).
   */
  iconOnly?: boolean | undefined;
  /**
   * Shows a ring spinner (spinnerSize across, spinnerStroke thick, in `currentColor`) in the leading
   * icon slot (whether or not `leadingIcon` is set; for `iconOnly` it replaces the sole glyph), hides
   * `trailingIcon`, keeps the label visible and the layout unchanged, and blocks repeat activation
   * while an action is pending. `copy.loading` is announced as a description, never as part of the
   * name.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses
   * color.inverse.link and hover uses inverseBackgroundHover at inverseHoverOpacity over the surface;
   * the focus ring uses color.inverse.focus for every emphasis while `inverse` is true, since the ring
   * must read against the inverse surface. Only `ghost` changes its fill on inverse surfaces; other
   * variants keep their own fills.
   */
  inverse?: boolean | undefined;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<CtaButtonOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. */
  onClick?: ((event: MouseEvent<HTMLButtonElement>) => void) | undefined;
  /** Fired after onPress with the `track` name and the button's label. */
  onTrack?: ((name: string, label: string) => void) | undefined;
}

/**
 * CtaButton — Design Schema, category: action.
 *
 * When to use:
 * Use a CtaButton when the user needs to **do something**: submit, save, confirm, open, add, delete.
 * The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").
 *
 * Use the `primary` emphasis for the single most important action in a view. Use `secondary` for
 * the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and
 * `danger` only for destructive, hard-to-undo actions.
 */
export function CtaButton({
  ref,
  label,
  emphasis = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  type = 'button',
  expanded,
  disabled = false,
  accessibleName,
  overflowLabel: _overflowLabel,
  iconOnly = false,
  loading = false,
  inverse = false,
  track,
  overrides,
  onClick,
  onTrack,
  'aria-expanded': ariaExpanded,
  'aria-describedby': describedBy,
  className: _className,
  style: _style,
  ...rest
}: CtaButtonProps & { ref?: Ref<HTMLButtonElement> | undefined }): ReactElement {
  const form = useFormContext();
  const loadingId = `demo-cta-button${useId()}-loading`;
  const isDisabled = disabled || (form?.disabled ?? false);
  const blocked = isDisabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (blocked) {
      // aria-disabled does not stop native activation (including form submission), so we do.
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    onClick?.(event);
    if (track) {
      trackPress(track, label);
      onTrack?.(track, label);
    }
  };

  const classes = [
    'demo-cta-button',
    `demo-cta-button--${emphasis}`,
    `demo-cta-button--${size}`,
    iconOnly ? 'demo-cta-button--icon-only' : null,
    inverse ? 'demo-cta-button--inverse' : null,
  ]
    .filter(Boolean)
    .join(' ');

  // copy.loading is the button's description while busy, never part of its accessible name: the
  // node is aria-hidden, which an aria-describedby reference still resolves through.
  const describedByValue = loading ? [describedBy, loadingId].filter(Boolean).join(' ') : describedBy;

  const hasLeading = leadingIcon !== undefined && leadingIcon !== null;
  const hasTrailing = trailingIcon !== undefined && trailingIcon !== null;

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      data-ds="Button"
      data-part="container"
      className={classes}
      style={overrides ? overridesToStyle(overrides) : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-label={accessibleName ?? (iconOnly ? label : undefined)}
      aria-expanded={expanded ?? ariaExpanded}
      aria-describedby={describedByValue || undefined}
      onClick={handleClick}
    >
      {loading ? (
        <span className="demo-cta-button__spinner" aria-hidden="true" />
      ) : hasLeading ? (
        <span className="demo-cta-button__icon" data-part="leadingIcon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {iconOnly ? null : (
        <span className="demo-cta-button__label" data-part="label">
          {label}
        </span>
      )}
      {!loading && !iconOnly && hasTrailing ? (
        <span className="demo-cta-button__icon" data-part="trailingIcon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
      {loading ? (
        <span className="demo-cta-button__visually-hidden" id={loadingId} aria-hidden="true">
          {COPY.loading}
        </span>
      ) : null}
    </button>
  );
}
