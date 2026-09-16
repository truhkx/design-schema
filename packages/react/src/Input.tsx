import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
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
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'partGap'
  | 'fontFamily'
  | 'fontSize'
  | 'labelWeight'
  | 'helperSize'
  | 'lineHeight'
  | 'disabledOpacity';

/** Hooks on the root. `helperSize` has none: it is forwarded to the description and error Text
 * elements' `fontSize`. `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept
 * here for the label and the `<input>`, which are not Text. */
const ROOT_OVERRIDE_HOOK: Partial<Record<InputOverridableBinding, string>> = {
  borderInvalid: '--ds-input-border-invalid',
  borderWidth: '--ds-input-border-width',
  radius: '--ds-input-radius',
  paddingInline: '--ds-input-padding-inline',
  paddingBlock: '--ds-input-padding-block',
  partGap: '--ds-input-part-gap',
  fontFamily: '--ds-input-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-input-font-size',
  labelWeight: '--ds-input-label-weight',
  lineHeight: '--ds-input-line-height',
  disabledOpacity: '--ds-input-disabled-opacity',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  helperOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  for (const binding of Object.keys(overrides) as InputOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'lineHeight') helperOverrides.lineHeight = ref;
    // Locked bindings have no entry here, so they are ignored if passed.
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
  }
  return { rootStyle: rootStyle as CSSProperties, helperOverrides };
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
    | 'aria-disabled'
    | 'className'
    | 'style'
    | 'children'
  > {
  /** Visible label (visually hidden with `hideLabel`). Never replaced by a placeholder. */
  label: string;
  /** Field name used by the enclosing Form when collecting values. */
  name: string;
  /** Controlled value. Omit for an uncontrolled field. */
  value?: string | undefined;
  /** Initial value for an uncontrolled field. */
  defaultValue?: string | undefined;
  /** Example input shown while empty. Never the only description of what to enter. */
  placeholder?: string | undefined;
  /** Persistent helper text below the label explaining format or purpose. */
  description?: string | undefined;
  /** Input type. Drives the keyboard on touch platforms and browser validation on web. */
  type?: InputType | undefined;
  /** The field must have a value to submit. Shown in the label, not only by color. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context
   * already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: InputSize | undefined;
  /** Not editable and not submitted. Stays visible and readable. */
  disabled?: boolean | undefined;
  /** Marks the field as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /** The error message. Setting it implies `invalid`. Explain what is wrong and how to fix it. */
  error?: string | undefined;
  /** HTML autocomplete token (e.g. `email`, `given-name`). Enables WCAG 1.3.5 input-purpose identification. */
  autocomplete?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<InputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired on every value change with the new string value. */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: (() => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: (() => void) | undefined;
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
export function Input({
  ref,
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
  readOnly,
  id: idProp,
  ...rest
}: InputProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-input${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // Uncontrolled from `defaultValue`; controlled whenever `value` is given.
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const isDisabled = disabled || (form?.disabled ?? false);
  // A direct `error` prop wins; otherwise the Form may hold an error for this field.
  const resolvedError = error ?? form?.errors[name];
  const hasError = resolvedError !== undefined && resolvedError !== '';
  const isInvalid = invalid || hasError;

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
      // Disabled fields are not submitted.
      getValue: () => (latest.current.disabled ? undefined : (inputRef.current?.value ?? '')),
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
        const el = inputRef.current;
        const fieldValue = el?.value ?? '';
        if (errorProp !== undefined && errorProp !== '') return errorProp;
        if (isRequired && fieldValue.trim() === '') return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        // Browser type validity (email, url, number) last, reported with copy.invalid.
        if (el && !el.validity.valid) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(' ');

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    const next = event.target.value;
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const handleBlur = (): void => {
    onBlur?.();
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const classes = [
    'ds-input',
    `ds-input--${size}`,
    isInvalid ? 'ds-input--invalid' : null,
    isDisabled ? 'ds-input--disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-input__label', hideLabel ? 'ds-input__visually-hidden' : null].filter(Boolean).join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    <div className={classes} data-ds="Input" data-ds-field style={rootStyle}>
      <label className={labelClasses} htmlFor={id} data-part="label">
        {label}
        {required ? COPY.requiredIndicator : null}
      </label>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-input__description"
          overrides={helperOverrides}
        >
          {description}
        </Text>
      ) : null}
      <input
        {...rest}
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={currentValue}
        placeholder={placeholder}
        autoComplete={autocomplete}
        className="ds-input__field"
        data-part="field"
        aria-describedby={describedBy || undefined}
        aria-invalid={isInvalid ? 'true' : undefined}
        aria-required={required ? 'true' : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        readOnly={isDisabled ? true : readOnly}
        onChange={handleChange}
        onFocus={() => onFocus?.()}
        onBlur={handleBlur}
      />
      {hasError ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          className="ds-input__error"
          overrides={helperOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
}
