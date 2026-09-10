import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import { useFormContext } from './FormContext';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit';

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'disabled' | 'children' | 'aria-label'> {
  /** The button's text. Also its accessible name. */
  label: string;
  /** Visual emphasis. One primary button per view. */
  variant?: ButtonVariant;
  /** Controls padding and font size. Touch targets never drop below the minimum regardless of size. */
  size?: ButtonSize;
  /** `submit` submits the enclosing Form. Everything else is `button`. */
  type?: ButtonType;
  /** Prevents activation. The button stays in the tab order and is announced as disabled. */
  disabled?: boolean;
  /** Hides the visible label and shows only the icon. `label` is still required and becomes the accessible name. */
  iconOnly?: boolean;
  /** Shows progress and blocks repeat activation while an action is pending. */
  loading?: boolean;
  /** Anatomy slot: icon rendered before the label. */
  leadingIcon?: ReactNode;
  /** Anatomy slot: icon rendered after the label. */
  trailingIcon?: ReactNode;
  /** Fired when the button is activated by pointer, keyboard (Enter/Space), or assistive technology. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
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
    type = 'button',
    disabled = false,
    iconOnly = false,
    loading = false,
    leadingIcon,
    trailingIcon,
    onClick,
    className,
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
  };

  const classes = [
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    iconOnly ? 'ds-button--icon-only' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      aria-label={iconOnly ? label : undefined}
      onClick={handleClick}
    >
      {leadingIcon !== undefined && leadingIcon !== null ? (
        <span className="ds-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {iconOnly ? null : <span className="ds-button__label">{label}</span>}
      {trailingIcon !== undefined && trailingIcon !== null ? (
        <span className="ds-button__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </button>
  );
});
