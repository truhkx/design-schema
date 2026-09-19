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
  | 'disabledOpacity'
  | 'transition';

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
  transition: '--ds-input-transition',
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

/** Browser/type validity other than our own custom message (email, url, number, pattern, length). */
function failsTypeValidity(el: HTMLInputElement): boolean {
  const v = el.validity;
  return (
    v.typeMismatch ||
    v.badInput ||
    v.patternMismatch ||
    v.rangeOverflow ||
    v.rangeUnderflow ||
    v.stepMismatch ||
    v.tooLong ||
    v.tooShort
  );
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
  /** Fired on every value change with the new string value, and nothing else (not the ChangeEvent). */
  onChange?: ((value: string) => void) | undefined;
  /** Fired when the field receives focus. Called with no arguments. */
  onFocus?: (() => void) | undefined;
  /** Fired when the field loses focus. The usual moment to validate. Called with no arguments. */
  onBlur?: (() => void) | undefined;
}

/**
 * Input — Design Schema, category: input. Collects a single line of text, bundling the label,
 * helper text, field and error message so their association is always correct.
 *
 * When to use:
 * Use Input for names, emails, passwords, search terms, and short free-text values. Choose `type`
 * for the value so touch keyboards and browser validation match. Provide `description` when the
 * format matters ("Use the email you signed up with"). Set `autocomplete` on web whenever the
 * value is personal data so browsers and assistive tools can fill it.
 *
 * The forwarded `ref` targets the `<input>` (so `focus()` and `select()` work), not the wrapper.
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
  const withLabel = (message: string): string => message.replace('{label}', label);

  // Error slot order: the `error` prop, the Form's context entry, then a copy message while `invalid`
  // is true — copy.required for an empty required field, else copy.invalid. The Form's entry is its
  // `invalid` mark, so its presence alone marks the field, even with an empty message.
  const formError = form?.errors[name];
  const markedInvalid = invalid || formError !== undefined;
  const slotMessage =
    error !== undefined && error !== ''
      ? error
      : formError !== undefined && formError !== ''
        ? formError
        : markedInvalid
          ? withLabel(required && currentValue === '' ? COPY.required : COPY.invalid)
          : undefined;
  const isInvalid = slotMessage !== undefined;

  // Keep the latest props in a ref so the Form registration does not churn on every render.
  const latest = useRef({ label, required, disabled: isDisabled, invalid, error });
  latest.current = { label, required, disabled: isDisabled, invalid, error };

  /** The full precedence: `error` → required → invalid → browser/type validity (as copy.invalid). */
  const validationMessage = (): string | null => {
    const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
    const el = inputRef.current;
    const fieldValue = el?.value ?? '';
    if (errorProp !== undefined && errorProp !== '') return errorProp;
    if (isRequired && fieldValue === '') return COPY.required.replace('{label}', currentLabel);
    if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
    if (el && failsTypeValidity(el)) return COPY.invalid.replace('{label}', currentLabel);
    return null;
  };
  const validationRef = useRef(validationMessage);
  validationRef.current = validationMessage;

  // validationMessage/validity follow the same precedence, so the browser never shows its own text.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const message = isDisabled ? '' : (validationRef.current() ?? '');
    if (el.validationMessage !== message) el.setCustomValidity(message);
  });

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
      validate: () => validationRef.current(),
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, isInvalid ? errorId : null].filter(Boolean).join(' ');

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
        <Text element="p" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={helperOverrides}>
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
      {isInvalid ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          overrides={helperOverrides}
        >
          {slotMessage}
        </Text>
      ) : null}
    </div>
  );
}
