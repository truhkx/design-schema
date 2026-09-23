import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { useFormContext } from './FormContext';
import './RadioGroup.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';
/** One option. `value` is a short identifier (letters, digits, dashes) — it becomes part of an element id. */
export type RadioGroupOption = { value: string; label: string; description?: string; disabled?: boolean };

/**
 * copy.* — used verbatim; `{label}` is replaced by the legend. `position` is spoken on native only:
 * on web the browser announces "1 of 3" from the radios' shared `name`, so it is not rendered.
 */
const COPY = {
  required: '{label} is required.',
  invalid: '{label} is not valid.',
  requiredIndicator: ' (required)',
  position: '{index} of {total}',
} as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type RadioGroupOverridableBinding =
  | 'controlBorderWidth'
  | 'indicatorInset'
  | 'controlBorderInvalid'
  | 'controlSize'
  | 'controlRadius'
  | 'optionPaddingBlock'
  | 'optionTextGap'
  | 'optionGap'
  | 'listGap'
  | 'partGap'
  | 'legendSize'
  | 'legendWeight'
  | 'labelSize'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'disabledOpacity'
  | 'transition';

/** helperSize has no root hook: it reaches the composed Text only through its fontSize override. */
const OVERRIDE_HOOK: Partial<Record<RadioGroupOverridableBinding, string>> = {
  controlBorderWidth: '--ds-radio-group-control-border-width',
  indicatorInset: '--ds-radio-group-indicator-inset',
  controlBorderInvalid: '--ds-radio-group-control-border-invalid',
  controlSize: '--ds-radio-group-control-size',
  controlRadius: '--ds-radio-group-control-radius',
  optionPaddingBlock: '--ds-radio-group-option-padding-block',
  optionTextGap: '--ds-radio-group-option-text-gap',
  optionGap: '--ds-radio-group-option-gap',
  listGap: '--ds-radio-group-list-gap',
  partGap: '--ds-radio-group-part-gap',
  legendSize: '--ds-radio-group-legend-size',
  legendWeight: '--ds-radio-group-legend-weight',
  labelSize: '--ds-radio-group-label-size',
  labelWeight: '--ds-radio-group-label-weight',
  fontFamily: '--ds-radio-group-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-radio-group-line-height',
  disabledOpacity: '--ds-radio-group-disabled-opacity',
  transition: '--ds-radio-group-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  helperOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  for (const binding of Object.keys(overrides) as RadioGroupOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    // Descriptions and the error are Text: their typography bindings reach Text's own overrides.
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'lineHeight') helperOverrides.lineHeight = ref;
    // Locked bindings have no entry in the hook table, so they are ignored if passed.
    const hook = OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
  }
  return { rootStyle: rootStyle as CSSProperties, helperOverrides };
}

/** The keys a native radio group moves and selects with; swallowed while the whole group is disabled. */
const GUARDED_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', ' ']);

export interface RadioGroupProps
  extends Omit<
    ComponentPropsWithoutRef<'fieldset'>,
    | 'name'
    | 'disabled'
    | 'onChange'
    | 'children'
    | 'role'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-disabled'
    | 'className'
    | 'style'
  > {
  /** The group's legend — the question the options answer. Always visible. */
  label: string;
  /** Field name used by the enclosing Form. Also links the radios into one native group on web. */
  name: string;
  /**
   * The options in display order. Two to about seven; more than that is a Select (planned). Values
   * are short identifiers (letters, digits, dashes) — they become element ids.
   */
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  value?: string | undefined;
  /**
   * Initial selection for an uncontrolled group. Omit to start with nothing selected. It is read once,
   * when the group first renders: assigning it later is a no-op, exactly as a React state initialiser is.
   */
  defaultValue?: string | undefined;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  orientation?: RadioGroupOrientation | undefined;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  required?: boolean | undefined;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean | undefined;
  /**
   * Disables every option. Individual options use `options[].disabled`. The group's state folds into
   * each option's, so every radio announces as disabled rather than only the group. A disabled group
   * submits nothing and validates clean, so a disabled required group never blocks a submit.
   */
  disabled?: boolean | undefined;
  /** Persistent helper text under the legend. */
  description?: string | undefined;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<RadioGroupOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the selection changes, with the new option value. */
  onChange?: ((value: string) => void) | undefined;
}

/**
 * RadioGroup — Design Schema, category: input.
 *
 * When to use:
 * Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give options a `description` when the label alone does not tell them apart. Set `defaultValue` when there is a sensible default; leave the group unselected when the choice is consequential and you want a deliberate answer.
 */
export function RadioGroup({
  ref,
  label,
  name,
  options,
  value,
  defaultValue,
  orientation = 'vertical',
  required = false,
  invalid = false,
  disabled = false,
  description,
  error,
  overrides,
  onChange,
  onBlur,
  onKeyDown,
  id: idProp,
  ...rest
}: RadioGroupProps & { ref?: Ref<HTMLFieldSetElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-radio-group${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const fieldsetRef = useRef<HTMLFieldSetElement | null>(null);
  useImperativeHandle(ref, () => fieldsetRef.current as HTMLFieldSetElement, []);
  const radioRefs = useRef(new Map<string, HTMLInputElement>());

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const selected = isControlled ? value : internalValue;

  const isDisabled = disabled || (form?.disabled ?? false);
  // Displayed error: error prop → the Form's message → while invalid, copy.required (required and
  // nothing selected) else copy.invalid.
  const invalidCopy = required && selected === undefined ? COPY.required : COPY.invalid;
  const resolvedError =
    error ?? form?.errors[name] ?? (invalid ? invalidCopy.replace('{label}', label) : undefined);
  const isInvalid = invalid || resolvedError !== undefined;

  // Keep the latest props in a ref so the Form registration does not churn on every render.
  const latest = useRef({ label, required, disabled: isDisabled, invalid, error, selected, options });
  latest.current = { label, required, disabled: isDisabled, invalid, error, selected, options };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      // form.valueType is string: the selected value, or no key when nothing is selected. A disabled
      // group submits nothing and validates clean, as a native disabled control does.
      getValue: () => (latest.current.disabled ? undefined : latest.current.selected),
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const {
          label: currentLabel,
          required: isRequired,
          invalid: isInvalidProp,
          error: errorProp,
          selected: current,
          disabled: isDisabledNow,
        } = latest.current;
        if (isDisabledNow) return null;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && current === undefined) return COPY.required.replace('{label}', currentLabel);
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      // Where Tab would land: the selected radio, or the first enabled one when nothing is selected.
      focus: () => {
        const { selected: current, options: currentOptions } = latest.current;
        const target = current ?? currentOptions.find((option) => !option.disabled)?.value;
        if (target !== undefined) radioRefs.current.get(target)?.focus();
      },
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  // `validate: change` validates on each change, `blur` when focus leaves the whole group; after a
  // failed submit every mode re-validates on both, so a fixed group stops being flagged.
  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnBlur = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  // Roving tabindex, arrows, Space and Tab are the native radio group's; nothing is reimplemented.
  // Group `disabled` keeps the radios focusable (aria-disabled) and guards every way native radios select.
  const handleKeyDown = (event: KeyboardEvent<HTMLFieldSetElement>) => {
    onKeyDown?.(event);
    if (isDisabled && GUARDED_KEYS.has(event.key)) event.preventDefault();
  };

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isDisabled) event.preventDefault();
  };

  // `change` is not cancelable: a disabled group or option stops here with an early return.
  const handleChange = (option: RadioGroupOption) => (_event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled || option.disabled) return;
    if (!isControlled) setInternalValue(option.value);
    onChange?.(option.value);
    // validateField runs validate() before the re-render: hand it the value just chosen, not the one it replaces.
    latest.current.selected = option.value;
    if (form && validatesOnChange) form.validateField(name);
  };

  const handleBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
    onBlur?.(event);
    // `validate: blur` runs when focus leaves the group as a whole, not when it moves between radios.
    if (event.relatedTarget && fieldsetRef.current?.contains(event.relatedTarget as Node)) return;
    if (form && validatesOnBlur) form.validateField(name);
  };

  // The whole option row is the hit area: a click on its padding, gap or description selects the radio.
  // The radio and its native <label for> handle their own clicks.
  const handleRowClick = (option: RadioGroupOption) => (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('input, label')) return;
    if (!isDisabled && !option.disabled) radioRefs.current.get(option.value)?.click();
  };

  const setRadioRef = (optionValue: string) => (el: HTMLInputElement | null) => {
    if (el) radioRefs.current.set(optionValue, el);
    else radioRefs.current.delete(optionValue);
  };

  const classes = [
    'ds-radio-group',
    `ds-radio-group--${orientation}`,
    isInvalid ? 'ds-radio-group--invalid' : null,
    isDisabled ? 'ds-radio-group--disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    <fieldset
      {...rest}
      ref={fieldsetRef}
      id={id}
      role="radiogroup"
      data-ds="RadioGroup"
      data-ds-field
      data-part="group"
      className={classes}
      style={rootStyle}
      aria-describedby={describedBy || undefined}
      aria-invalid={isInvalid ? 'true' : undefined}
      aria-required={required ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <legend className="ds-radio-group__legend" data-part="legend">
        {label}
        {required ? COPY.requiredIndicator : null}
      </legend>
      {/* A legend is outside the fieldset's flex flow: the other parts stack in their own body. */}
      <div className="ds-radio-group__body">
        {description ? (
          <Text element="p" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        ) : null}
        <div className="ds-radio-group__list">
          {options.map((option) => {
            const optionId = `${id}-${option.value}`;
            const optionDescriptionId = `${optionId}-description`;
            // A disabled group dims every row once (on the root class); an option dims only its own row.
            const optionClasses = ['ds-radio-group__option', option.disabled ? 'ds-radio-group__option--disabled' : null]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={option.value} className={optionClasses} onClick={handleRowClick(option)}>
                {/* The input comes first so `:checked + label` can show the indicator inside the label. */}
                <input
                  ref={setRadioRef(option.value)}
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  data-part="radio"
                  checked={selected === option.value}
                  className="ds-radio-group__control"
                  // Per-option disabled is the native attribute so native arrow movement skips it.
                  disabled={option.disabled === true}
                  aria-describedby={option.description ? optionDescriptionId : undefined}
                  aria-disabled={isDisabled ? 'true' : undefined}
                  onClick={handleClick}
                  onChange={handleChange(option)}
                />
                <label htmlFor={optionId} data-part="radioLabel" className="ds-radio-group__label">
                  {/* radioIndicator: the dot, a real node (Firefox draws no pseudo-elements on inputs),
                      laid over the input and transparent to the pointer. Decorative: the input's
                      checked state is what is announced. */}
                  <span className="ds-radio-group__indicator" data-part="radioIndicator" aria-hidden="true" />
                  {option.label}
                </label>
                {option.description ? (
                  <div className="ds-radio-group__option-description">
                    <Text
                      element="p"
                      id={optionDescriptionId}
                      data-part="radioDescription"
                      size="sm"
                      tone="muted"
                      overrides={helperOverrides}
                    >
                      {option.description}
                    </Text>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        {resolvedError ? (
          <Text
            element="p"
            id={errorId}
            role="alert"
            data-part="errorMessage"
            size="sm"
            tone="danger"
            overrides={helperOverrides}
          >
            {resolvedError}
          </Text>
        ) : null}
      </div>
    </fieldset>
  );
}
