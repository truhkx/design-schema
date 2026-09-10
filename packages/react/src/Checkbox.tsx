import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type MouseEvent,
} from 'react';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Checkbox.css';

/** copy.required — `{label}` is replaced by the visible label. */
const REQUIRED_MESSAGE = '{label} is required.';
/** copy.requiredIndicator */
const REQUIRED_INDICATOR = ' (required)';

export interface CheckboxProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'checked'
    | 'defaultChecked'
    | 'required'
    | 'disabled'
    | 'onChange'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-checked'
    | 'children'
  > {
  /** Visible label. Clicking or tapping it toggles the control. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** The value submitted when checked. Lets several checkboxes share a `name` to form a multi-select. */
  value?: string;
  /** Controlled checked state. Omit for an uncontrolled control. */
  checked?: boolean;
  /** Initial state for an uncontrolled control. */
  defaultChecked?: boolean;
  /** Shows the mixed indicator, for a parent checkbox whose children are partly selected. Visual and announced only. */
  indeterminate?: boolean;
  /** Cannot be toggled and is not submitted. Stays visible, readable and focusable. */
  disabled?: boolean;
  /** Must be checked to submit — for consent and agreement. Shown in the label, not only by color. */
  required?: boolean;
  /** Marks the control as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** Persistent helper text below the label. */
  description?: string;
  /** The error message. Setting it marks the control invalid. Say what to do ("Accept the terms to continue"). */
  error?: string;
  /** Fired when the checked state changes, with the new boolean. */
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Checkbox — Design Schema, category: input.
 *
 * When to use:
 * Use a Checkbox for one independent option ("Remember me"), for terms and consent (`required`),
 * or several with the same `name` when the user may pick any number of items. Use
 * `indeterminate` on a "select all" parent when only some of its children are checked.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    name,
    value = 'on',
    checked,
    defaultChecked = false,
    indeterminate = false,
    disabled = false,
    required = false,
    invalid = false,
    description,
    error,
    onChange,
    onClick,
    id: idProp,
    className,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-checkbox${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

  // `indeterminate` has no attribute; it is a DOM property.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  // Keep the latest props in a ref so the Form registration does not churn on every render.
  const latest = useRef({ label, value, required, disabled: isDisabled, invalid, error });
  latest.current = { label, value, required, disabled: isDisabled, invalid, error };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => (inputRef.current?.checked ? latest.current.value : undefined),
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && !inputRef.current?.checked) return REQUIRED_MESSAGE.replace('{label}', currentLabel);
        if (isInvalidProp) return `${currentLabel} is not valid.`;
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isDisabled) {
      // aria-disabled does not stop native toggling, so we do. The input stays focusable.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onChange?.(event.target.checked, event);
    // There is no useful blur moment for a checkbox: `blur` mode validates on change too.
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  // The whole row is the hit area: the description toggles the control too.
  const handleDescriptionClick = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const classes = [
    'ds-checkbox',
    isInvalid ? 'ds-checkbox--invalid' : null,
    isDisabled ? 'ds-checkbox--disabled' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="ds-checkbox__row">
        <input
          {...rest}
          ref={inputRef}
          id={id}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          className="ds-checkbox__control"
          aria-describedby={describedBy || undefined}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          aria-checked={indeterminate ? 'mixed' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          onClick={handleClick}
          onChange={handleChange}
        />
        <Text element="label" htmlFor={id} className="ds-checkbox__label">
          {label}
          {required ? (
            <Text element="span" size="sm" tone="muted" className="ds-checkbox__required">
              {REQUIRED_INDICATOR}
            </Text>
          ) : null}
        </Text>
      </div>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          size="sm"
          tone="muted"
          className="ds-checkbox__description"
          onClick={handleDescriptionClick}
        >
          {description}
        </Text>
      ) : null}
      {resolvedError ? (
        <Text element="p" id={errorId} role="alert" size="sm" tone="danger" className="ds-checkbox__error">
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
});
