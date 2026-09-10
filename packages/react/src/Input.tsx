import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { useFormContext } from './FormContext';
import './Input.css';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
export type InputSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}` is replaced by the visible label. */
const COPY = {
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type InputOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockSm'
  | 'paddingInlineSm'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'minTargetSm'
  | 'disabledOpacity';

const OVERRIDE_HOOK: Record<InputOverridableBinding, string> = {
  borderFocus: '--ds-input-border-focus',
  borderInvalid: '--ds-input-border-invalid',
  borderWidth: '--ds-input-border-width',
  radius: '--ds-input-radius',
  paddingInline: '--ds-input-padding-inline',
  paddingBlock: '--ds-input-padding-block',
  paddingBlockSm: '--ds-input-padding-block-sm',
  paddingInlineSm: '--ds-input-padding-inline-sm',
  partGap: '--ds-input-part-gap',
  fontFamily: '--ds-input-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-input-font-size',
  labelWeight: '--ds-input-label-weight',
  helperSize: '--ds-input-helper-size',
  lineHeight: '--ds-input-line-height',
  minTargetSm: '--ds-input-min-target-sm',
  disabledOpacity: '--ds-input-disabled-opacity',
};

function overridesToStyle(overrides: Partial<Record<InputOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as InputOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface InputProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'required'
    | 'size'
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
  /** Visually hide the label (it remains the accessible name). Only for a field whose context
   * already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small
   * type. */
  size?: InputSize;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string;
  /** HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG 1.3.5 input-purpose identification. */
  autocomplete?: string;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef>>;
  /** Fired on every value change with the new string value. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Fired when the field receives focus. */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
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
    hideLabel = false,
    size = 'md',
    disabled = false,
    invalid = false,
    error,
    autocomplete,
    overrides,
    onChange,
    onFocus,
    onBlur,
    id: idProp,
    className,
    style,
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
        if (isRequired && currentValue.trim() === '') return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        // Browser type validation (email, url, number…) still runs under novalidate via validity.
        if (el && currentValue !== '' && !el.validity.valid) {
          return el.validationMessage || COPY.invalid.replace('{label}', currentLabel);
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

  const classes = [
    'ds-input',
    `ds-input--${size}`,
    isInvalid ? 'ds-input--invalid' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-input__label', hideLabel ? 'ds-input__visually-hidden' : null].filter(Boolean).join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <div className={classes} data-ds="Input" data-ds-field style={mergedStyle}>
      <label className={labelClasses} htmlFor={id}>
        {label}
        {required ? <span className="ds-input__required">{COPY.requiredIndicator}</span> : null}
      </label>
      {description ? (
        <p id={descriptionId} data-part="description" className="ds-input__description">
          {description}
        </p>
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
        <p id={errorId} role="alert" data-part="errorMessage" className="ds-input__error">
          {resolvedError}
        </p>
      ) : null}
    </div>
  );
});
