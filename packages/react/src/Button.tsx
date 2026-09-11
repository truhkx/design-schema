import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import { trackPress } from './custom/analytics';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type ButtonOverridableBinding =
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

const OVERRIDE_HOOK: Record<ButtonOverridableBinding, string> = {
  backgroundHover: '--ds-button-background-hover',
  iconGap: '--ds-button-icon-gap',
  paddingInline: '--ds-button-padding-inline',
  paddingBlock: '--ds-button-padding-block',
  radius: '--ds-button-radius',
  fontFamily: '--ds-button-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontWeight: '--ds-button-font-weight',
  fontSize: '--ds-button-font-size',
  disabledOpacity: '--ds-button-disabled-opacity',
  transition: '--ds-button-transition',
  loadingSpin: '--ds-button-loading-spin',
  spinnerStroke: '--ds-button-spinner-stroke',
};

function overridesToStyle(overrides: Partial<Record<ButtonOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as ButtonOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'disabled' | 'children' | 'aria-label'> {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant;
  /** Controls horizontal padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize;
  /** Icon before the label. Decorative — hidden from assistive technology; the label carries the meaning. */
  leadingIcon?: ReactNode;
  /** Icon after the label. Decorative, like leadingIcon. */
  trailingIcon?: ReactNode;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType;
  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  disabled?: boolean;
  /**
   * Overrides the accessible name when it must say more than the visible label ("Sort by
   * Amount, ascending" on a header that shows "Amount"). The visible label must be the start of
   * it (WCAG 2.5.3 label-in-name). Maps to aria-label.
   */
  accessibleName?: string;
  /** Text used for this button when a Toolbar collapses it into its overflow Menu. */
  overflowLabel?: string;
  /**
   * Hides the visible label and shows only `leadingIcon`. `label` is still required and becomes
   * the accessible name. Padding becomes equal on all sides (`space.sm`).
   */
  iconOnly?: boolean;
  /**
   * Replaces the icon slot with a 1em ring spinner in `currentColor`, keeps the label space so
   * layout does not shift, and blocks repeat activation while an action is pending.
   */
  loading?: boolean;
  /**
   * The button sits on an inverse surface (Toast, Tooltip-like panels): `ghost` text uses
   * color.inverse.link and hover uses a translucent inverse foreground; the focus ring uses
   * color.inverse.focus. Only `ghost` is meaningful on inverse surfaces; other variants keep
   * their own fills.
   */
  inverse?: boolean;
  /** An event name sent to analytics when the button is pressed. Omit for no tracking. */
  track?: string;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<ButtonOverridableBinding, TokenRef>>;
  /** Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Fired after onPress with the `track` name and the button's label. */
  onTrack?: (name: string, label: string) => void;
}

/**
 * Button — Design Schema, category: action.
 *
 * When to use:
 * Use a Button when the user needs to **do something**: submit, save, confirm, open, add, delete.
 * The label should be a verb or verb phrase that describes the outcome ("Save changes", not "OK").
 *
 * Use the `primary` variant for the single most important action in a view. Use `secondary` for
 * the alternatives beside it, `ghost` for low-emphasis actions in dense UI such as toolbars, and
 * `danger` only for destructive, hard-to-undo actions.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label,
    variant = 'primary',
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
  },
  ref,
) {
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
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    iconOnly ? 'ds-button--icon-only' : null,
    inverse ? 'ds-button--inverse' : null,
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
        <span className="ds-button__spinner" data-part="leadingIcon" aria-hidden="true" />
      ) : leadingIcon !== undefined && leadingIcon !== null ? (
        <span className="ds-button__icon" data-part="leadingIcon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {iconOnly ? null : <span className="ds-button__label">{label}</span>}
      {!loading && trailingIcon !== undefined && trailingIcon !== null ? (
        <span className="ds-button__icon" data-part="trailingIcon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
});
