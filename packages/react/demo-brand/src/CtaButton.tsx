import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import { useFormContext } from './FormContext';
import { trackPress } from './custom/analytics';
import './CtaButton.css';

export type CtaButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type CtaButtonSize = 'sm' | 'md' | 'lg';
export type CtaButtonType = 'button' | 'submit';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type CtaButtonOverridableBinding =
  | 'backgroundHover'
  | 'iconGap'
  | 'paddingInline'
  | 'paddingBlock'
  | 'radius'
  | 'fontFamily'
  | 'fontWeight'
  | 'fontSize'
  | 'disabledOpacity'
  | 'transition'
  | 'loadingSpin'
  | 'spinnerStroke';

const OVERRIDE_HOOK: Record<CtaButtonOverridableBinding, string> = {
  backgroundHover: '--demo-button-background-hover',
  iconGap: '--demo-button-icon-gap',
  paddingInline: '--demo-button-padding-inline',
  paddingBlock: '--demo-button-padding-block',
  radius: '--demo-button-radius',
  fontFamily: '--demo-button-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontWeight: '--demo-button-font-weight',
  fontSize: '--demo-button-font-size',
  disabledOpacity: '--demo-button-disabled-opacity',
  transition: '--demo-button-transition',
  loadingSpin: '--demo-button-loading-spin',
  spinnerStroke: '--demo-button-spinner-stroke',
};

function overridesToStyle(overrides: Partial<Record<CtaButtonOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as CtaButtonOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface CtaButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'disabled' | 'children' | 'aria-label'> {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  emphasis?: CtaButtonVariant | undefined;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: CtaButtonSize | undefined;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: ReactNode;
  /** Icon after the label. Decorative, like leadingIcon. */
  trailingIcon?: ReactNode;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: CtaButtonType | undefined;
  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  disabled?: boolean | undefined;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort by
   * Amount, ascending" on a header that shows "Amount"). The visible label must be the start of
   * it (WCAG 2.5.3 label-in-name). Maps to aria-label.
   */
  accessibleName?: string | undefined;
  /** Text used for this button when a Toolbar collapses it into its overflow Menu. */
  overflowLabel?: string | undefined;
  /**
   * Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes
   * the accessible name. Padding becomes equal on all sides (`space.sm`).
   */
  iconOnly?: boolean | undefined;
  /**
   * Replaces the icon slot with a 1em ring spinner in `currentColor`, keeps the label space so
   * layout does not shift, and blocks repeat activation while an action is pending.
   */
  loading?: boolean | undefined;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses
   * color.inverse.link and hover uses a translucent inverse foreground; the focus ring uses
   * color.inverse.focus. Only `ghost` is meaningful on inverse surfaces; other variants keep
   * their own fills.
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
export const CtaButton = function CtaButton({
  ref,
  label,
  emphasis = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  type = 'button',
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
  className,
  style,
  ...rest
}: CtaButtonProps & { ref?: Ref<HTMLButtonElement> | undefined }): ReactElement {
  const form = useFormContext();
  const isDisabled = disabled || (form?.disabled ?? false);
  const blocked = isDisabled || loading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
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
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      data-ds="Button"
      className={classes}
      style={mergedStyle}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-label={accessibleName ?? (iconOnly ? label : undefined)}
      onClick={handleClick}
    >
      {loading ? (
        <span className="demo-cta-button__spinner" data-part="leadingIcon" aria-hidden="true" />
      ) : leadingIcon !== undefined && leadingIcon !== null ? (
        <span className="demo-cta-button__icon" data-part="leadingIcon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {iconOnly ? null : <span className="demo-cta-button__label">{label}</span>}
      {!loading && trailingIcon !== undefined && trailingIcon !== null ? (
        <span className="demo-cta-button__icon" data-part="trailingIcon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
};
