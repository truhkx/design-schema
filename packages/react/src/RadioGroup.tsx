import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
} from 'react';
import { Text } from './Text';
import { useFormContext } from './FormContext';
import './RadioGroup.css';

export type RadioGroupOrientation = 'vertical' | 'horizontal';
/** One option. `value` is a short identifier (letters, digits, dashes) — it becomes part of an element id. */
export type RadioGroupOption = { value: string; label: string; description?: string; disabled?: boolean };

/** copy.required — `{label}` is replaced by the legend. */
const REQUIRED_MESSAGE = '{label} is required.';
/** copy.requiredIndicator */
const REQUIRED_INDICATOR = ' (required)';

export interface RadioGroupProps
  extends Omit<
    ComponentPropsWithoutRef<'fieldset'>,
    'name' | 'disabled' | 'onChange' | 'children' | 'aria-describedby' | 'aria-invalid' | 'aria-required'
  > {
  /** The group's legend — the question the options answer. Always visible. */
  label: string;
  /** Field name used by the enclosing Form. Also links the radios into one native group. */
  name: string;
  /** The options in display order. Two to about seven; more than that is a Select (planned). */
  options: RadioGroupOption[];
  /** Controlled selected value. Omit for an uncontrolled group. */
  value?: string;
  /** Initial selection for an uncontrolled group. Omit to start with nothing selected. */
  defaultValue?: string;
  /** Layout of the options. Horizontal only for two or three short labels; it wraps rather than overflows. */
  orientation?: RadioGroupOrientation;
  /** An option must be selected to submit. Shown in the legend, not only by color. */
  required?: boolean;
  /** Marks the group as failing validation. Usually set by the Form; can be set directly. */
  invalid?: boolean;
  /** Disables every option. Individual options use `options[].disabled`. */
  disabled?: boolean;
  /** Persistent helper text under the legend. */
  description?: string;
  /** The group's error message. Setting it marks the group invalid. */
  error?: string;
  /** Fired when the selection changes, with the new option value. */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * RadioGroup — Design Schema, category: input.
 *
 * When to use:
 * Use a RadioGroup when the user must pick exactly one of two to about seven options and seeing
 * them all helps the decision — plan tiers, shipping methods, a "how did you hear about us". Give
 * options a `description` when the label alone does not tell them apart. Set `defaultValue` when
 * there is a sensible default; leave the group unselected when the choice is consequential and
 * you want a deliberate answer.
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
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
    onChange,
    onBlur,
    id: idProp,
    className,
    ...rest
  },
  ref,
) {
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
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = invalid || resolvedError !== undefined;

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
      getValue: () => latest.current.selected,
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const {
          label: currentLabel,
          required: isRequired,
          invalid: isInvalidProp,
          error: errorProp,
          selected: current,
        } = latest.current;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && current === undefined) return REQUIRED_MESSAGE.replace('{label}', currentLabel);
        if (isInvalidProp) return `${currentLabel} is not valid.`;
        return null;
      },
      // Tab lands on the selected radio, or the first enabled one when nothing is selected.
      focus: () => {
        const { selected: current, options: currentOptions } = latest.current;
        const target = current !== undefined ? current : currentOptions.find((option) => !option.disabled)?.value;
        if (target !== undefined) radioRefs.current.get(target)?.focus();
      },
    });
  }, [form, name, id]);

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  // Group `disabled` keeps the radios focusable (aria-disabled + guards); a per-option `disabled`
  // is the native attribute so the arrows skip it — the documented exception to the aria-disabled rule.
  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isDisabled) event.preventDefault();
  };

  const handleChange = (option: RadioGroupOption) => (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    if (!isControlled) setInternalValue(option.value);
    onChange?.(option.value, event);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const handleBlur = (event: FocusEvent<HTMLFieldSetElement>) => {
    onBlur?.(event);
    // Only when focus leaves the group as a whole, not when it moves between radios.
    if (event.relatedTarget && fieldsetRef.current?.contains(event.relatedTarget as Node)) return;
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
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
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      {...rest}
      ref={fieldsetRef}
      id={id}
      className={classes}
      aria-describedby={describedBy || undefined}
      aria-invalid={isInvalid ? 'true' : undefined}
      aria-required={required ? 'true' : undefined}
      aria-disabled={isDisabled ? 'true' : undefined}
      onBlur={handleBlur}
    >
      <Text element="legend" weight="medium" className="ds-radio-group__legend">
        {label}
        {required ? (
          <Text element="span" size="sm" tone="muted" weight="regular" className="ds-radio-group__required">
            {REQUIRED_INDICATOR}
          </Text>
        ) : null}
      </Text>
      {description ? (
        <Text element="p" id={descriptionId} size="sm" tone="muted" className="ds-radio-group__description">
          {description}
        </Text>
      ) : null}
      <div className="ds-radio-group__list">
        {options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const optionDescriptionId = `${optionId}-description`;
          const optionDisabled = isDisabled || option.disabled === true;
          const optionClasses = ['ds-radio-group__option', optionDisabled ? 'ds-radio-group__option--disabled' : null]
            .filter(Boolean)
            .join(' ');
          return (
            <div key={option.value} className={optionClasses}>
              <div className="ds-radio-group__row">
                <input
                  ref={setRadioRef(option.value)}
                  id={optionId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={isControlled ? value === option.value : undefined}
                  defaultChecked={isControlled ? undefined : defaultValue === option.value}
                  className="ds-radio-group__control"
                  disabled={option.disabled === true}
                  aria-describedby={option.description ? optionDescriptionId : undefined}
                  aria-disabled={isDisabled ? 'true' : undefined}
                  aria-invalid={isInvalid ? 'true' : undefined}
                  onClick={handleClick}
                  onChange={handleChange(option)}
                />
                <Text element="label" htmlFor={optionId} className="ds-radio-group__label">
                  {option.label}
                </Text>
              </div>
              {option.description ? (
                <Text
                  element="p"
                  id={optionDescriptionId}
                  size="sm"
                  tone="muted"
                  className="ds-radio-group__option-description"
                >
                  {option.description}
                </Text>
              ) : null}
            </div>
          );
        })}
      </div>
      {resolvedError ? (
        <Text element="p" id={errorId} role="alert" size="sm" tone="danger" className="ds-radio-group__error">
          {resolvedError}
        </Text>
      ) : null}
    </fieldset>
  );
});
