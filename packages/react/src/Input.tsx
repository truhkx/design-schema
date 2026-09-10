import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
} from 'react';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './Input.css';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';

export interface InputProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'required'
    | 'disabled'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'autoComplete'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'children'
  > {
  /** Visible label. Always rendered; never replaced by a placeholder. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string;
  /** Persistent helper text below the label explaining format or purpose. */
  description?: string;
  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  type?: InputType;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string;
  /** HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG 1.3.5 input-purpose identification. */
  autocomplete?: string;
  /** Fired on every value change with the new string value. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Fired when the field receives focus. */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

/** Lower-cases the first character so a label reads naturally inside a sentence. */
function sentenceInline(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/**
 * Input — Design Schema, category: input.
 *
 * When to use:
 * Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type`
 * for the value so touch keyboards and browser validation match. Provide `description` when the
 * format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the
 * value is personal data so browsers and assistive tools can fill it.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    name,
    value,
    defaultValue,
    placeholder,
    description,
    type = 'text',
    required = false,
    disabled = false,
    invalid = false,
    error,
    autocomplete,
    onChange,
    onFocus,
    onBlur,
    id: idProp,
    className,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-input${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const isDisabled = disabled || (form?.disabled ?? false);
  // A direct `error` prop wins; otherwise the Form may hold an error for this field.
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

  // Keep the latest props in a ref so the Form registration does not churn on every render.
  const latest = useRef({ label, required, disabled: isDisabled, invalid, error });
  latest.current = { label, required, disabled: isDisabled, invalid, error };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => inputRef.current?.value ?? '',
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
        const el = inputRef.current;
        const currentValue = el?.value ?? '';
        if (errorProp !== undefined) return errorProp;
        if (isRequired && currentValue.trim() === '') return `Enter ${sentenceInline(currentLabel)}.`;
        if (isInvalidProp) return `${currentLabel} is not valid.`;
        // Browser type validation (email, url, number…) still runs under novalidate via validity.
        if (el && currentValue !== '' && !el.validity.valid) {
          return el.validationMessage || `${currentLabel} is not valid.`;
        }
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onChange?.(event.target.value, event);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const classes = ['ds-input', isInvalid ? 'ds-input--invalid' : null, className ?? null].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label className="ds-input__label" htmlFor={id}>
        <Text element="span" weight="medium" tone="strong">
          {label}
        </Text>
        {required ? (
          <Text element="span" size="sm" tone="muted" className="ds-input__required">
            {' (required)'}
          </Text>
        ) : null}
      </label>
      {description ? (
        <Text element="p" id={descriptionId} size="sm" tone="muted" className="ds-input__description">
          {description}
        </Text>
      ) : null}
      <input
        {...rest}
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className="ds-input__field"
        aria-describedby={describedBy || undefined}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        readOnly={isDisabled ? true : rest.readOnly}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={handleBlur}
      />
      {resolvedError ? (
        <Text element="p" id={errorId} role="alert" size="sm" tone="danger" className="ds-input__error">
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
});
