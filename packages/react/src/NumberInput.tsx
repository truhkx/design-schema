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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Text, type TextOverridableBinding } from './Text';
import { Button } from './Button';
import { Icon } from './Icon';
import { useFormContext } from './FormContext';
import './NumberInput.css';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';
export type NumberInputSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}`, `{min}` and `{max}` are the only interpolations. */
const COPY = {
  increment: 'Increase',
  decrement: 'Decrease',
  required: '{label} is required.',
  invalid: '{label} must be a number.',
  outOfRange: '{label} must be between {min} and {max}.',
  outOfRangeMin: '{label} must be {min} or more.',
  outOfRangeMax: '{label} must be {max} or less.',
  currencyMissing: 'format "currency" needs a currency code.',
  requiredIndicator: ' (required)',
};

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type NumberInputOverridableBinding =
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'affixGap'
  | 'stepperGap'
  | 'stepperDivider'
  | 'stepperDividerWidth'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'disabledOpacity';

/** Hooks on the root. `helperSize` has none: it is forwarded to the description and error Text
 * elements' `fontSize`. `fontFamily`/`lineHeight` are forwarded to those Text elements *and* kept
 * here for the label and the `<input>`, which are not Text. */
const ROOT_OVERRIDE_HOOK: Partial<Record<NumberInputOverridableBinding, string>> = {
  borderInvalid: '--ds-number-input-border-invalid',
  borderWidth: '--ds-number-input-border-width',
  radius: '--ds-number-input-radius',
  paddingInline: '--ds-number-input-padding-inline',
  paddingBlock: '--ds-number-input-padding-block',
  affixGap: '--ds-number-input-affix-gap',
  stepperGap: '--ds-number-input-stepper-gap',
  stepperDivider: '--ds-number-input-stepper-divider',
  stepperDividerWidth: '--ds-number-input-stepper-divider-width',
  partGap: '--ds-number-input-part-gap',
  labelWeight: '--ds-number-input-label-weight',
  fontFamily: '--ds-number-input-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-number-input-font-size',
  lineHeight: '--ds-number-input-line-height',
  disabledOpacity: '--ds-number-input-disabled-opacity',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  helperOverrides: TextOverrides;
} {
  const rootStyle: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  for (const binding of Object.keys(overrides) as NumberInputOverridableBinding[]) {
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

/** The environment locale's decimal and group separators. */
function localeSeparators(): { decimal: string; group: string } {
  if (typeof Intl === 'undefined') return { decimal: '.', group: ',' };
  const parts = new Intl.NumberFormat().formatToParts(12345.6);
  return {
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
  };
}

/** Decimal places in `step` (`0.01` → 2), the default `precision`. */
function decimalsInStep(step: number): number {
  if (!Number.isFinite(step)) return 0;
  const str = String(step);
  const exp = /e-(\d+)$/.exec(str);
  if (exp) return Number(exp[1]);
  const dot = str.indexOf('.');
  return dot === -1 ? 0 : str.length - dot - 1;
}

function roundTo(num: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(num * factor) / factor;
}

type Parsed = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number };

/**
 * Lenient parse of what people type or what the field displays: group separators and any other
 * character (currency symbol, percent sign, unit) are ignored; a leading minus and the locale's or
 * a period decimal separator are kept. Text with no digits at all is `invalid`.
 */
function parseTyped(raw: string): Parsed {
  const trimmed = raw.trim();
  if (trimmed === '') return { kind: 'empty' };
  const { decimal } = localeSeparators();
  // "." is a decimal only when the locale's own decimal is absent from the text (de-DE "1.234,5"
  // is 1234.5, "1.5" is 1.5).
  const periodIsDecimal = decimal === '.' || !trimmed.includes(decimal);
  let digits = '';
  let negative = false;
  let seenDecimal = false;
  for (const ch of trimmed) {
    if (ch >= '0' && ch <= '9') digits += ch;
    else if (ch === '-' && digits === '' && !seenDecimal) negative = true;
    else if ((ch === decimal || (ch === '.' && periodIsDecimal)) && !seenDecimal) {
      seenDecimal = true;
      digits += '.';
    }
  }
  if (!/\d/.test(digits)) return { kind: 'invalid' };
  const num = Number(`${negative ? '-' : ''}${digits.startsWith('.') ? `0${digits}` : digits}`);
  return Number.isFinite(num) ? { kind: 'number', value: num } : { kind: 'invalid' };
}

/** Whether Intl knows `unit` as a unit identifier. */
function isIntlUnit(unit: string): boolean {
  try {
    new Intl.NumberFormat(undefined, { style: 'unit', unit });
    return true;
  } catch {
    return false;
  }
}

function formatNumber(
  num: number,
  format: NumberInputFormat,
  fractionDigits: number,
  currency: string | undefined,
  unit: string | undefined,
): string {
  const base: Intl.NumberFormatOptions = { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits };
  if (format === 'currency') {
    return new Intl.NumberFormat(undefined, { ...base, style: 'currency', currency: currency || 'USD' }).format(num);
  }
  // percent stores the number as typed (25) and divides by 100 only for display.
  if (format === 'percent') return new Intl.NumberFormat(undefined, { ...base, style: 'percent' }).format(num / 100);
  if (format === 'unit' && unit && isIntlUnit(unit)) {
    return new Intl.NumberFormat(undefined, { ...base, style: 'unit', unit }).format(num);
  }
  return new Intl.NumberFormat(undefined, base).format(num);
}

/** A resolved CSS time (`200ms`, `0.2s`) in ms; `null` when it cannot be read. */
function parseTime(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value.trim());
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

/** Hold-to-repeat timings from the resolved theme: `motion.duration.base` delay, `motion.duration.fast`
 * interval. `null` when the theme's tokens are not loaded, in which case a press steps once. */
function resolveRepeatTimings(el: Element): { delay: number; interval: number } | null {
  const style = getComputedStyle(el);
  const delay = parseTime(style.getPropertyValue('--motion-duration-base'));
  const interval = parseTime(style.getPropertyValue('--motion-duration-fast'));
  return delay !== null && interval !== null && delay > 0 && interval > 0 ? { delay, interval } : null;
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
    | 'size'
    | 'disabled'
    | 'onChange'
    | 'inputMode'
    | 'role'
    | 'autoComplete'
    | 'aria-valuenow'
    | 'aria-valuemin'
    | 'aria-valuemax'
    | 'aria-valuetext'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-disabled'
    | 'className'
    | 'style'
    | 'children'
  > {
  /** Visible label. */
  label: string;
  /** Field name for the Form. The value registers as its plain decimal string (`String(value)`);
   * an empty or disabled field registers nothing. Consumers parse it back with `Number()`. */
  name: string;
  /** Controlled numeric value: `null` is a controlled empty field, `undefined` means uncontrolled
   * (defaultValue applies). While focused the input shows the raw typed text; the value takes over
   * the display on blur/Enter, on every step, and when the prop changes to a different number. */
  value?: number | null | undefined;
  /** Initial value. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons and arrow keys. When `precision` is omitted, values round to the
   * number of decimals in `step`; values never snap to multiples of `step`. */
  step?: number | undefined;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via Intl.NumberFormat: thousands separators, currency
   * symbol (`currency` prop), percent, or a unit (`unit` prop). The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour). A string Intl does not know is
   * shown as `trailingText` (the `suffix` part) when `trailingText` is not given, with plain decimal formatting. */
  unit?: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. (Not
   * `prefix`: that name is a native Element member.) */
  leadingText?: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit`
   * is not a valid Intl unit. */
  trailingText?: string | undefined;
  /** Hide the increment/decrement buttons. Arrow keys work regardless. */
  hideSteppers?: boolean | undefined;
  /** Example value shown while empty. */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context
   * already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after
   * clamping/rounding), with the number or undefined. */
  onChange?: ((value: number | undefined) => void) | undefined;
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
export function NumberInput({
  ref,
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
  leadingText,
  trailingText,
  hideSteppers = false,
  placeholder,
  description,
  required = false,
  hideLabel = false,
  size = 'md',
  disabled = false,
  invalid = false,
  error,
  overrides,
  onChange,
  readOnly,
  onKeyDown,
  onBlur,
  id: idProp,
  ...rest
}: NumberInputProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-number-input${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const digits = Math.max(0, Math.trunc(precision ?? decimalsInStep(step)));
  const unitKnown = format === 'unit' && unit !== undefined && unit !== '' && isIntlUnit(unit);
  // An unknown unit falls back to decimal formatting and shows the literal as trailingText.
  const resolvedTrailing = trailingText ?? (format === 'unit' && unit && !unitKnown ? unit : undefined);
  // currency draws its own symbol, so leadingText would show two.
  const resolvedLeading = format === 'currency' ? undefined : leadingText;
  const display = (num: number | undefined): string =>
    num === undefined ? '' : formatNumber(num, format, digits, currency, unit);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);
  const committedValue = isControlled ? (value ?? undefined) : internalValue;

  const [text, setText] = useState<string>(() => display(committedValue));
  const [textInvalid, setTextInvalid] = useState(false);
  const [rangeMessage, setRangeMessage] = useState<string | undefined>(undefined);

  const isDisabled = disabled || (form?.disabled ?? false);

  /** The shown number, advanced synchronously by `report` so steps and Form submission within the
   * same event see it; a controlled field is re-synced to its prop on every render. */
  const valueRef = useRef<number | undefined>(committedValue);
  valueRef.current = committedValue;
  /** Set while the text on screen is what the user typed, so the echo of that number does not reformat it. */
  const typingRef = useRef(false);

  // Reformat whenever the value or its formatting changes, except for the echo of the user's own typing.
  const formatKey = `${format}|${digits}|${currency ?? ''}|${unit ?? ''}`;
  const lastSynced = useRef({ value: committedValue, formatKey });
  useEffect(() => {
    const prev = lastSynced.current;
    if (Object.is(prev.value, committedValue) && prev.formatKey === formatKey) return;
    lastSynced.current = { value: committedValue, formatKey };
    if (prev.formatKey === formatKey) {
      const typed = parseTyped(inputRef.current?.value ?? '');
      // Typed text wins over an empty value: while typing (a controlled change to null keeps the
      // text until blur/Enter), and after a commit of non-numeric text, which stays as typed.
      if (committedValue === undefined && (typingRef.current || typed.kind === 'invalid')) return;
      if (typingRef.current && Object.is(typed.kind === 'number' ? typed.value : undefined, committedValue)) return;
    }
    typingRef.current = false;
    setText(committedValue === undefined ? '' : formatNumber(committedValue, format, digits, currency, unit));
    setTextInvalid(false);
  }, [committedValue, formatKey]);

  const warnedCurrency = useRef(false);
  useEffect(() => {
    if (isDev && format === 'currency' && !currency && !warnedCurrency.current) {
      warnedCurrency.current = true;
      console.warn(`NumberInput: ${COPY.currencyMissing}`);
    }
  }, [format, currency]);

  const latest = useRef({ label, required, disabled: isDisabled, invalid, error, textInvalid, rangeMessage });
  latest.current = { label, required, disabled: isDisabled, invalid, error, textInvalid, rangeMessage };

  /** The full precedence: `error` → required (empty) → invalid / non-numeric committed text → range. */
  const validationMessage = (): string | null => {
    const current = latest.current;
    if (current.error !== undefined && current.error !== '') return current.error;
    if (current.required && valueRef.current === undefined && !current.textInvalid) {
      return COPY.required.replace('{label}', current.label);
    }
    if (current.invalid || current.textInvalid) return COPY.invalid.replace('{label}', current.label);
    if (current.rangeMessage) return current.rangeMessage;
    return null;
  };
  const validationRef = useRef(validationMessage);
  validationRef.current = validationMessage;

  // validationMessage/validity follow the same precedence, so a submit straight after a clamp fails
  // once (outside a Form too) and the browser never shows its own text.
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
      // Disabled fields are not submitted; an empty field is omitted.
      getValue: () =>
        latest.current.disabled || valueRef.current === undefined ? undefined : String(valueRef.current),
      isDisabled: () => latest.current.disabled,
      validate: () => validationRef.current(),
      focus: () => inputRef.current?.focus(),
    });
  }, [form, name, id]);

  // The Form's mode decides when the field re-validates; after a failed submission every mode
  // re-validates on blur and on change, so a fixed field stops being flagged as the user types.
  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnBlur = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  function report(next: number | undefined): void {
    if (Object.is(next, valueRef.current)) return;
    // A controlled field keeps the prop until it changes; the render re-syncs valueRef from it.
    if (!isControlled) {
      valueRef.current = next;
      setInternalValue(next);
    }
    onChange?.(next);
    if (form && validatesOnChange) form.validateField(name);
  }

  function clamp(num: number): number {
    let next = num;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    return next;
  }

  function stepBy(delta: number): void {
    if (isDisabled || readOnly) return;
    const current = valueRef.current;
    // From empty, up goes to `min ?? 0` and down to `max ?? 0`.
    const target = current === undefined ? (delta > 0 ? (min ?? 0) : (max ?? 0)) : current + delta;
    typingRef.current = false;
    setTextInvalid(false);
    setRangeMessage(undefined);
    report(clamp(roundTo(target, digits)));
  }

  function setTo(target: number): void {
    if (isDisabled || readOnly) return;
    typingRef.current = false;
    setTextInvalid(false);
    setRangeMessage(undefined);
    report(roundTo(target, digits));
  }

  /** Blur and Enter: round to precision, clamp, reformat, and report a clamp rather than hide it. */
  function commit(): void {
    typingRef.current = false;
    const parsed = parseTyped(inputRef.current?.value ?? text);
    if (parsed.kind !== 'number') {
      setTextInvalid(parsed.kind === 'invalid');
      setRangeMessage(undefined);
      report(undefined);
      if (parsed.kind === 'empty') setText('');
      return;
    }
    const rounded = roundTo(parsed.value, digits);
    const next = clamp(rounded);
    setTextInvalid(false);
    setRangeMessage(next !== rounded ? rangeCopy() : undefined);
    report(next);
    setText(display(isControlled ? (value ?? undefined) : next));
  }

  function rangeCopy(): string {
    const withLabel = (s: string) => s.replace('{label}', label);
    if (min !== undefined && max !== undefined) {
      return withLabel(COPY.outOfRange).replace('{min}', display(min)).replace('{max}', display(max));
    }
    if (min !== undefined) return withLabel(COPY.outOfRangeMin).replace('{min}', display(min));
    return withLabel(COPY.outOfRangeMax).replace('{max}', display(max));
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (isDisabled || readOnly) {
      event.preventDefault();
      return;
    }
    const raw = event.target.value;
    typingRef.current = true;
    setText(raw);
    setRangeMessage(undefined);
    const parsed = parseTyped(raw);
    // Keystrokes that do not yet form a number ("-", ".") are left alone until blur.
    if (parsed.kind === 'invalid') return;
    setTextInvalid(false);
    report(parsed.kind === 'number' ? parsed.value : undefined);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled || readOnly) return;
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
          setTo(min);
        }
        break;
      case 'End':
        if (max !== undefined) {
          event.preventDefault();
          setTo(max);
        }
        break;
      case 'Enter':
        // Commit first so an enclosing form submits the rounded, clamped number.
        commit();
        break;
      default:
        break;
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    onBlur?.(event);
    if (!isDisabled && !readOnly) commit();
    if (form && validatesOnBlur) form.validateField(name);
  };

  /* Steppers: a press steps once, and repeats while held when the theme's durations resolve. */
  const repeatTimer = useRef<number | null>(null);
  const pointerStepped = useRef(false);

  function stopRepeat(): void {
    if (repeatTimer.current !== null) {
      window.clearTimeout(repeatTimer.current);
      repeatTimer.current = null;
    }
  }

  /** A press that ends without a click (the pointer left the button) must not swallow the next one. */
  function endPointerStep(): void {
    stopRepeat();
    pointerStepped.current = false;
  }

  useEffect(() => stopRepeat, []);

  const atMin = min !== undefined && committedValue !== undefined && committedValue <= min;
  const atMax = max !== undefined && committedValue !== undefined && committedValue >= max;

  function stepperPointerDown(event: ReactPointerEvent<HTMLElement>, direction: 1 | -1): void {
    // Keep focus where it is: the input stays the single tab stop.
    event.preventDefault();
    stopRepeat();
    pointerStepped.current = true;
    if (isDisabled || readOnly || (direction > 0 ? atMax : atMin)) return;
    stepBy(direction * step);
    const timings = resolveRepeatTimings(event.currentTarget);
    if (!timings) return;
    const tick = (): void => {
      const current = valueRef.current;
      if (current !== undefined && ((direction > 0 && max !== undefined && current >= max) || (direction < 0 && min !== undefined && current <= min))) {
        stopRepeat();
        return;
      }
      stepBy(direction * step);
      repeatTimer.current = window.setTimeout(tick, timings.interval);
    };
    repeatTimer.current = window.setTimeout(tick, timings.delay);
  }

  function stepperClick(event: ReactMouseEvent<HTMLElement>, direction: 1 | -1): void {
    event.preventDefault();
    // A pointer press already stepped; a click with no pointer (assistive tech, synthetic) steps here.
    if (pointerStepped.current) {
      pointerStepped.current = false;
      return;
    }
    if (isDisabled || readOnly || (direction > 0 ? atMax : atMin)) return;
    stepBy(direction * step);
  }

  // What the errorMessage part draws, following Input: the `error` prop, the Form's context entry,
  // then — only while the field is marked invalid — copy.required for an empty required field, else
  // copy.invalid for committed non-numeric text; then a clamp. `invalid` over a valid number draws
  // nothing (aria-invalid and the border carry it). An empty required field is never flagged on
  // first render, so `required` alone draws nothing here.
  const withLabel = (message: string): string => message.replace('{label}', label);
  const formError = form?.errors[name];
  const markedInvalid = invalid || formError !== undefined;
  const derivedMessage =
    required && committedValue === undefined && !textInvalid
      ? withLabel(COPY.required)
      : textInvalid
        ? withLabel(COPY.invalid)
        : undefined;
  const slotMessage =
    error !== undefined && error !== ''
      ? error
      : formError !== undefined && formError !== ''
        ? formError
        : markedInvalid && derivedMessage !== undefined
          ? derivedMessage
          : textInvalid
            ? withLabel(COPY.invalid)
            : rangeMessage;
  const isInvalid = markedInvalid || slotMessage !== undefined;
  const describedBy = [description ? descriptionId : null, slotMessage !== undefined ? errorId : null].filter(Boolean).join(' ');

  const valueText =
    committedValue === undefined
      ? undefined
      : `${resolvedLeading ?? ''}${display(committedValue)}${resolvedTrailing ? ` ${resolvedTrailing}` : ''}`;

  const classes = [
    'ds-number-input',
    `ds-number-input--${size}`,
    isInvalid ? 'ds-number-input--invalid' : null,
    isDisabled ? 'ds-number-input--disabled' : null,
  ]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-number-input__label', hideLabel ? 'ds-number-input__visually-hidden' : null]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, helperOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, helperOverrides: undefined };

  return (
    // The root is the group every dimmed part sits in, so it carries aria-disabled beside the input's.
    <div
      className={classes}
      role="group"
      aria-disabled={isDisabled ? 'true' : undefined}
      data-ds="NumberInput"
      data-ds-field
      style={rootStyle}
    >
      <label className={labelClasses} htmlFor={id} data-part="label">
        {label}
        {required ? COPY.requiredIndicator : null}
      </label>
      {description ? (
        // The wrapper is NumberInput's own: it carries the part and takes the disabled dimming, so
        // no rule of ours ever reaches the composed Text.
        <div className="ds-number-input__description" id={descriptionId} data-part="description">
          <Text element="p" size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </div>
      ) : null}
      <div className="ds-number-input__field" data-part="field">
        {resolvedLeading ? (
          <span className="ds-number-input__affix" data-part="prefix" aria-hidden="true">
            {resolvedLeading}
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
          value={text}
          placeholder={placeholder}
          className="ds-number-input__input"
          data-part="input"
          aria-valuenow={committedValue}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={valueText}
          aria-describedby={describedBy || undefined}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          readOnly={isDisabled ? true : readOnly}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        {resolvedTrailing ? (
          <span className="ds-number-input__affix" data-part="suffix" aria-hidden="true">
            {resolvedTrailing}
          </span>
        ) : null}
        {hideSteppers ? null : (
          // Not aria-hidden: these are real <button>s, and tabIndex={-1} removes them from the tab
          // order without removing focus, so hiding them would be axe's aria-hidden-focus. They stay
          // exposed under their own labels; the arrow keys, not this markup, are what make the field
          // one tab stop.
          <span className="ds-number-input__steppers">
            <span
              className="ds-number-input__stepper"
              data-part="decrementButton"
              onPointerDown={(event) => stepperPointerDown(event, -1)}
              onPointerUp={stopRepeat}
              onPointerLeave={endPointerStep}
              onPointerCancel={endPointerStep}
              onClick={(event) => stepperClick(event, -1)}
            >
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                label={COPY.decrement}
                leadingIcon={<Icon name="minus" inline />}
                disabled={isDisabled || atMin}
                tabIndex={-1}
              />
            </span>
            <span
              className="ds-number-input__stepper"
              data-part="incrementButton"
              onPointerDown={(event) => stepperPointerDown(event, 1)}
              onPointerUp={stopRepeat}
              onPointerLeave={endPointerStep}
              onPointerCancel={endPointerStep}
              onClick={(event) => stepperClick(event, 1)}
            >
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                label={COPY.increment}
                leadingIcon={<Icon name="plus" inline />}
                disabled={isDisabled || atMax}
                tabIndex={-1}
              />
            </span>
          </span>
        )}
      </div>
      {slotMessage !== undefined ? (
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
