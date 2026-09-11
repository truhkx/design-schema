import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type Ref, type ReactElement,
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

/** Bindings owned by the root; `helperSize` is forwarded entirely into the composed description/
 * error Text elements' own `overrides` instead (they render the helper text, not the root), and
 * `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept on the root for the
 * label and the raw `<input>`, neither of which is a Text. */
const ROOT_OVERRIDE_HOOK: Partial<Record<InputOverridableBinding, string | undefined>> = {
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
  lineHeight: '--ds-input-line-height',
  minTargetSm: '--ds-input-min-target-sm',
  disabledOpacity: '--ds-input-disabled-opacity',
};

function resolveOverrides(overrides: Partial<Record<InputOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  errorOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const errorOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};

  for (const binding of Object.keys(overrides) as InputOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    switch (binding) {
      case 'helperSize':
        descriptionOverrides.fontSize = ref;
        errorOverrides.fontSize = ref;
        break;
      case 'fontFamily':
        rootStyle['--ds-input-font-family'] = cssVar(ref); // literal-ok: CSS custom-property hook name, not a font stack
        descriptionOverrides.fontFamily = ref;
        errorOverrides.fontFamily = ref;
        break;
      case 'lineHeight':
        rootStyle['--ds-input-line-height'] = cssVar(ref);
        descriptionOverrides.lineHeight = ref;
        errorOverrides.lineHeight = ref;
        break;
      default: {
        const hook = ROOT_OVERRIDE_HOOK[binding];
        if (hook) rootStyle[hook] = cssVar(ref);
      }
    }
  }

  return { rootStyle: rootStyle as CSSProperties, descriptionOverrides, errorOverrides };
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
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small
   * type. */
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
  onChange?: ((value: string, event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** Fired when the field receives focus. */
  onFocus?: ((event: FocusEvent<HTMLInputElement>) => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. */
  onBlur?: ((event: FocusEvent<HTMLInputElement>) => void) | undefined;
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
export const Input = function Input({
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
  id: idProp,
  className,
  style,
  ...rest
}: InputProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
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

  const { rootStyle, descriptionOverrides, errorOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, descriptionOverrides: undefined, errorOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  return (
    <div className={classes} data-ds="Input" data-ds-field style={mergedStyle}>
      <label className={labelClasses} htmlFor={id}>
        {label}
        {required ? <span className="ds-input__required">{COPY.requiredIndicator}</span> : null}
      </label>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-input__description"
          overrides={descriptionOverrides}
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
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          className="ds-input__error"
          overrides={errorOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
};
