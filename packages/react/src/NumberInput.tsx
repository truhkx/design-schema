import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { useFormContext } from './FormContext';
import './NumberInput.css';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';

/** copy.* — used verbatim; `{label}`/`{min}`/`{max}` are replaced as noted. */
const COPY = {
  increment: 'Increase',
  decrement: 'Decrease',
  required: '{label} is required.',
  invalid: '{label} must be a number.',
  outOfRange: '{label} must be between {min} and {max}.',
  requiredIndicator: ' (required)',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type NumberInputOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'stepperGap'
  | 'stepperDivider'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

/** Bindings owned by the root; labelWeight/helperSize are forwarded entirely into the composed
 * Text elements' own `overrides` instead (the split Meter, RadioGroup and Slider use), and
 * fontFamily/fontSize/lineHeight are forwarded to Text *and* kept on the root for the raw
 * `<input>`, which has no Text of its own. */
const ROOT_OVERRIDE_HOOK: Partial<Record<NumberInputOverridableBinding, string>> = {
  borderFocus: '--ds-number-input-border-focus',
  borderInvalid: '--ds-number-input-border-invalid',
  borderWidth: '--ds-number-input-border-width',
  radius: '--ds-number-input-radius',
  paddingInline: '--ds-number-input-padding-inline',
  paddingBlock: '--ds-number-input-padding-block',
  affixGap: '--ds-number-input-affix-gap',
  stepperGap: '--ds-number-input-stepper-gap',
  stepperDivider: '--ds-number-input-stepper-divider',
  partGap: '--ds-number-input-part-gap',
  disabledOpacity: '--ds-number-input-disabled-opacity',
};

function resolveOverrides(overrides: Partial<Record<NumberInputOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
  errorOverrides: Partial<Record<TextOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};
  const errorOverrides: Partial<Record<TextOverridableBinding, TokenRef>> = {};

  for (const binding of Object.keys(overrides) as NumberInputOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    switch (binding) {
      case 'labelWeight':
        labelOverrides.fontWeight = ref;
        break;
      case 'helperSize':
        descriptionOverrides.fontSize = ref;
        errorOverrides.fontSize = ref;
        break;
      case 'fontFamily':
        rootStyle['--ds-number-input-font-family'] = cssVar(ref); // literal-ok: CSS custom-property hook name, not a font stack
        labelOverrides.fontFamily = ref;
        descriptionOverrides.fontFamily = ref;
        errorOverrides.fontFamily = ref;
        break;
      case 'fontSize':
        rootStyle['--ds-number-input-font-size'] = cssVar(ref);
        break;
      case 'lineHeight':
        rootStyle['--ds-number-input-line-height'] = cssVar(ref);
        labelOverrides.lineHeight = ref;
        descriptionOverrides.lineHeight = ref;
        errorOverrides.lineHeight = ref;
        break;
      default: {
        const hook = ROOT_OVERRIDE_HOOK[binding];
        if (hook) rootStyle[hook] = cssVar(ref);
      }
    }
  }

  return { rootStyle: rootStyle as CSSProperties, labelOverrides, descriptionOverrides, errorOverrides };
}

/** The environment's decimal separator, used (alongside a literal `.`) to parse typed input. */
const DECIMAL_SEPARATOR = (() => {
  if (typeof Intl === 'undefined') return '.';
  const part = new Intl.NumberFormat().formatToParts(1.1).find((p) => p.type === 'decimal');
  return part?.value ?? '.';
})();

/** hold-to-repeat initial delay/interval: `motion.duration.base`/`motion.duration.fast`,
 * hardcoded because a component cannot read the active theme's resolved token value at runtime
 * without measuring the DOM (same reasoning as Tooltip's DEFAULT_DELAY_MS). */
const REPEAT_START_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 80;

function decimalsInStep(step: number): number {
  if (!Number.isFinite(step)) return 0;
  const str = String(step);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

function roundTo(num: number, digits: number): number {
  const factor = 10 ** Math.max(digits, 0);
  return Math.round(num * factor) / factor;
}

/** Strips everything but digits, a leading minus, and either `.` or the locale's decimal separator. */
function parseTypedValue(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === '') return undefined;
  let cleaned = '';
  for (const ch of trimmed) {
    if (ch >= '0' && ch <= '9') cleaned += ch;
    else if (ch === '-' && cleaned === '') cleaned += ch;
    else if (ch === '.' || ch === DECIMAL_SEPARATOR) cleaned += '.';
  }
  if (cleaned === '' || cleaned === '-') return undefined;
  const num = Number(cleaned);
  return Number.isNaN(num) ? undefined : num;
}

function formatDisplayValue(
  num: number,
  format: NumberInputFormat,
  fractionDigits: number,
  currency: string | undefined,
  unit: string | undefined,
): string {
  const base: Intl.NumberFormatOptions = { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits };
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(undefined, { ...base, style: 'currency', currency: currency || 'USD' }).format(num);
    case 'percent':
      return new Intl.NumberFormat(undefined, { ...base, style: 'percent' }).format(num / 100);
    case 'unit':
      if (unit) {
        try {
          return new Intl.NumberFormat(undefined, { ...base, style: 'unit', unit, unitDisplay: 'short' }).format(num);
        } catch {
          // Not a valid Intl unit identifier — fall through to a plain decimal; `suffix` carries the literal unit instead.
        }
      }
      return new Intl.NumberFormat(undefined, base).format(num);
    case 'decimal':
    default:
      return new Intl.NumberFormat(undefined, base).format(num);
  }
}

export interface NumberInputProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'min'
    | 'max'
    | 'step'
    | 'required'
    | 'disabled'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'onKeyDown'
    | 'autoComplete'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'children'
  > {
  /** Visible label. */
  label: string;
  /** Field name for the Form. The collected value is a number (or undefined when empty). */
  name: string;
  /** Controlled numeric value. Omit for an uncontrolled field. */
  value?: number;
  /** Initial value for an uncontrolled field. */
  defaultValue?: number;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number;
  /** Upper bound. */
  max?: number;
  /** Increment for the buttons and arrow keys. Also the rounding granularity when `precision` is omitted. */
  step?: number;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number;
  /** Locale formatting of the displayed value: thousands separators, currency symbol (`currency`), percent, or a unit (`unit`). The underlying value is always a plain number. */
  format?: NumberInputFormat;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as `suffix`. */
  unit?: string;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. */
  prefix?: string;
  /** Static text after the value inside the field ("kg", "%"). */
  suffix?: string;
  /** Show the increment/decrement buttons. Arrow keys work regardless. */
  showSteppers?: boolean;
  /** Example value shown while empty. */
  placeholder?: string;
  /** Helper text. */
  description?: string;
  /** Must have a value to submit. */
  required?: boolean;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef>>;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChange?: (value: number | undefined) => void;
}

/**
 * NumberInput — Design Schema, category: input.
 *
 * When to use:
 * Use a NumberInput for any exact numeric value: quantities, amounts, measurements, ages, counts.
 * Choose `format` so the field reads as the thing it holds (`currency` with a code, `percent`, a
 * `unit`). Set `min`, `max` and `step` whenever they exist; they drive the buttons, the arrow keys
 * and the out-of-range message. Pair with a Slider when a feel for the scale helps.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label,
    name,
    value,
    defaultValue,
    min,
    max,
    step = 1,
    precision,
    format = 'decimal',
    currency,
    unit,
    prefix,
    suffix,
    showSteppers = true,
    placeholder,
    description,
    required = false,
    disabled = false,
    invalid = false,
    error,
    overrides,
    onChange,
    id: idProp,
    className,
    style,
    ...rest
  },
  ref,
) {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-number-input${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const resolvedPrecision = precision ?? decimalsInStep(step);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);
  const committedValue = isControlled ? value : internalValue;

  const [displayText, setDisplayText] = useState<string>(() =>
    committedValue === undefined ? '' : formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit),
  );
  const [isFocused, setIsFocused] = useState(false);

  const latestValueRef = useRef<number | undefined>(committedValue);
  latestValueRef.current = committedValue;
  const wasClampedRef = useRef(false);

  // Re-format the displayed text when the committed value changes from outside a keystroke
  // (a controlled `value` update, or a formatting-relevant prop change) while not mid-edit.
  useEffect(() => {
    if (isFocused) return;
    setDisplayText(committedValue === undefined ? '' : formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit));
  }, [committedValue, isFocused, format, resolvedPrecision, currency, unit]);

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
      getValue: () => (latestValueRef.current === undefined ? undefined : String(latestValueRef.current)),
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, invalid: isInvalidProp, error: errorProp } = latest.current;
        if (errorProp !== undefined) return errorProp;
        if (isRequired && latestValueRef.current === undefined) return COPY.required.replace('{label}', currentLabel);
        if (wasClampedRef.current && min !== undefined && max !== undefined) {
          return COPY.outOfRange.replace('{label}', currentLabel).replace('{min}', String(min)).replace('{max}', String(max));
        }
        if (isInvalidProp) return COPY.invalid.replace('{label}', currentLabel);
        return null;
      },
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id, min, max]);

  function applyValue(next: number | undefined, clamped = false) {
    if (!isControlled) setInternalValue(next);
    latestValueRef.current = next;
    wasClampedRef.current = clamped;
    setDisplayText(next === undefined ? '' : formatDisplayValue(next, format, resolvedPrecision, currency, unit));
    onChange?.(next);
    if (form && form.validate === 'change') form.validateField(name);
  }

  function stepBy(delta: number) {
    if (isDisabled) return;
    const base = latestValueRef.current ?? min ?? max ?? 0;
    let next = roundTo(base + delta, resolvedPrecision);
    if (min !== undefined) next = Math.max(next, min);
    if (max !== undefined) next = Math.min(next, max);
    applyValue(next);
  }

  function setValueTo(target: number) {
    if (isDisabled) return;
    applyValue(roundTo(target, resolvedPrecision));
  }

  function commit() {
    if (isDisabled) return;
    const raw = latestValueRef.current;
    if (raw === undefined) {
      setDisplayText('');
      wasClampedRef.current = false;
      return;
    }
    let next = roundTo(raw, resolvedPrecision);
    let clamped = false;
    if (min !== undefined && next < min) {
      next = min;
      clamped = true;
    }
    if (max !== undefined && next > max) {
      next = max;
      clamped = true;
    }
    applyValue(next, clamped);
  }

  const repeatTimeoutRef = useRef<number | null>(null);
  const repeatIntervalRef = useRef<number | null>(null);

  function clearRepeat() {
    if (repeatTimeoutRef.current !== null) {
      window.clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    if (repeatIntervalRef.current !== null) {
      window.clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }

  useEffect(() => clearRepeat, []);

  function startRepeat(delta: number) {
    stepBy(delta);
    repeatTimeoutRef.current = window.setTimeout(() => {
      repeatIntervalRef.current = window.setInterval(() => stepBy(delta), REPEAT_INTERVAL_MS);
    }, REPEAT_START_DELAY_MS);
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    const raw = event.target.value;
    setDisplayText(raw);
    const parsed = parseTypedValue(raw);
    if (!isControlled) setInternalValue(parsed);
    latestValueRef.current = parsed;
    wasClampedRef.current = false;
    onChange?.(parsed);
    if (form && form.validate === 'change') form.validateField(name);
  };

  const handleFocus = (_event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
  };

  const handleBlur = (_event: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    commit();
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(name);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        stepBy(step);
        break;
      case 'ArrowDown':
        event.preventDefault();
        stepBy(-step);
        break;
      case 'PageUp':
        event.preventDefault();
        stepBy(step * 10);
        break;
      case 'PageDown':
        event.preventDefault();
        stepBy(-step * 10);
        break;
      case 'Home':
        if (min !== undefined) {
          event.preventDefault();
          setValueTo(min);
        }
        break;
      case 'End':
        if (max !== undefined) {
          event.preventDefault();
          setValueTo(max);
        }
        break;
      case 'Enter':
        commit();
        break;
      default:
        break;
    }
  };

  const atMin = min !== undefined && committedValue !== undefined && committedValue <= min;
  const atMax = max !== undefined && committedValue !== undefined && committedValue >= max;

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');
  const isInvalid = invalid || resolvedError !== undefined;

  const ariaValueText =
    committedValue === undefined
      ? undefined
      : `${prefix ?? ''}${formatDisplayValue(committedValue, format, resolvedPrecision, currency, unit)}${suffix ?? ''}`;

  const { rootStyle, labelOverrides, descriptionOverrides, errorOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, labelOverrides: undefined, descriptionOverrides: undefined, errorOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const classes = ['ds-number-input', isDisabled ? 'ds-number-input--disabled' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const fieldClasses = [
    'ds-number-input__field',
    isInvalid ? 'ds-number-input__field--invalid' : null,
    isDisabled ? 'ds-number-input__field--disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-ds="NumberInput" style={mergedStyle}>
      <label className="ds-number-input__label-wrapper" htmlFor={id}>
        <Text element="span" data-part="label" weight="medium" className="ds-number-input__label" overrides={labelOverrides}>
          {label}
          {required ? <span className="ds-number-input__required">{COPY.requiredIndicator}</span> : null}
        </Text>
      </label>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          data-part="description"
          size="sm"
          tone="muted"
          className="ds-number-input__description"
          overrides={descriptionOverrides}
        >
          {description}
        </Text>
      ) : null}
      <div className={fieldClasses} data-part="field">
        <div className="ds-number-input__control">
          {prefix ? (
            <span className="ds-number-input__affix" data-part="prefix" aria-hidden="true">
              {prefix}
            </span>
          ) : null}
          <input
            {...rest}
            ref={inputRef}
            id={id}
            name={name}
            type="text"
            inputMode="decimal"
            role="spinbutton"
            autoComplete="off"
            value={displayText}
            placeholder={placeholder}
            data-part="input"
            className="ds-number-input__input"
            aria-valuenow={committedValue}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={ariaValueText}
            aria-describedby={describedBy || undefined}
            aria-invalid={isInvalid ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-disabled={isDisabled ? 'true' : undefined}
            readOnly={isDisabled ? true : rest.readOnly}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {suffix ? (
            <span className="ds-number-input__affix" data-part="suffix" aria-hidden="true">
              {suffix}
            </span>
          ) : null}
        </div>
        {showSteppers ? (
          <span className="ds-number-input__steppers">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              label={COPY.decrement}
              leadingIcon={<Icon name="minus" inline />}
              disabled={isDisabled || atMin}
              tabIndex={-1}
              aria-hidden="true"
              data-part="decrementButton"
              onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                event.preventDefault();
                if (isDisabled || atMin) return;
                startRepeat(-step);
              }}
              onPointerUp={clearRepeat}
              onPointerLeave={clearRepeat}
              onPointerCancel={clearRepeat}
            />
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              label={COPY.increment}
              leadingIcon={<Icon name="plus" inline />}
              disabled={isDisabled || atMax}
              tabIndex={-1}
              aria-hidden="true"
              data-part="incrementButton"
              onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
                event.preventDefault();
                if (isDisabled || atMax) return;
                startRepeat(step);
              }}
              onPointerUp={clearRepeat}
              onPointerLeave={clearRepeat}
              onPointerCancel={clearRepeat}
            />
          </span>
        ) : null}
      </div>
      {resolvedError ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          data-part="errorMessage"
          size="sm"
          tone="danger"
          className="ds-number-input__error"
          overrides={errorOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
});
