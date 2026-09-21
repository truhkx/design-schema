import * as React from 'react';
import { AccessibilityInfo, Text as NativeText, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type {
  AccessibilityActionEvent,
  KeyboardTypeOptions,
  TextInputInstance,
  TextInputKeyPressEvent,
  TextStyle,
  ViewInstance,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { useFieldsetContext } from './Fieldset';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';
export type NumberInputSize = 'sm' | 'md';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
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

export interface NumberInputProps {
  /** Visible label. Also the field's `accessibilityLabel`. */
  label: string;
  /**
   * Field name for the Form. The value registers as its plain decimal string (`String(value)`: "." decimal,
   * no grouping, symbol or affixes); an empty or disabled field registers nothing. Parse it back with `Number()`.
   */
  name: string;
  /** Controlled numeric value: `null` is a controlled empty field, `undefined` means uncontrolled (`defaultValue` applies). */
  value?: number | null | undefined;
  /** Initial value. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons, arrow keys and accessibility actions. Values never snap to multiples of it. */
  step?: number | undefined;
  /** Decimal places to keep and display (a whole number). Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via `Intl.NumberFormat`. The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour). An unknown unit is shown as `trailingText` when none is given. */
  unit?: string | undefined;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. Ignored under `format: currency`. */
  leadingText?: string | undefined;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit` is not a valid Intl unit. */
  trailingText?: string | undefined;
  /** Hide the increment/decrement buttons. Arrow keys and the accessibility actions work regardless. */
  hideSteppers?: boolean | undefined;
  /** Example value shown while empty. */
  placeholder?: string | undefined;
  /** Helper text. Also the field's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: NumberInputSize | undefined;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean | undefined;
  /** Marks the field invalid. */
  invalid?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view (label, description, field and error group). */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChangeText?: ((value: number | undefined) => void) | undefined;
}

const FONT_SIZE_TOKEN = { sm: 'fontSizeSm', md: 'fontSizeMd' } as const satisfies Record<NumberInputSize, keyof Tokens>;
const PADDING_INLINE_TOKEN = { sm: 'space2', md: 'spaceMd' } as const satisfies Record<NumberInputSize, keyof Tokens>;
const PADDING_BLOCK_TOKEN = { sm: 'space1', md: 'spaceSm' } as const satisfies Record<NumberInputSize, keyof Tokens>;
const MIN_TARGET_TOKEN = { sm: 'sizeTargetMin', md: 'sizeTargetComfortable' } as const satisfies Record<NumberInputSize, keyof Tokens>;

/** PageUp/PageDown move by this many steps. */
const PAGE_STEPS = 10; // literal-ok: the keyboard contract's "ten steps", a count, not a design token

const COPY = {
  increment: 'Increase',
  decrement: 'Decrease',
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} must be a number.`,
  outOfRange: (label: string, min: string, max: string): string => `${label} must be between ${min} and ${max}.`,
  outOfRangeMin: (label: string, min: string): string => `${label} must be ${min} or more.`,
  outOfRangeMax: (label: string, max: string): string => `${label} must be ${max} or less.`,
  currencyMissing: 'format "currency" needs a currency code.',
  requiredIndicator: ' (required)',
} as const;

/** Only the two actions the adjustable role defines; their labels are the stepper copy. */
const STEP_ACTIONS = [
  { name: 'increment', label: COPY.increment },
  { name: 'decrement', label: COPY.decrement },
] as const;

/** The locale's decimal separator, accepted alongside "." when typing. */
const LOCALE_DECIMAL: string = (() => {
  try {
    return new Intl.NumberFormat().formatToParts(1.1).find((part) => part.type === 'decimal')?.value ?? '.';
  } catch {
    return '.';
  }
})();

function decimalPlaces(n: number): number {
  const s = String(n);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}

function roundToPrecision(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function clampValue(value: number, min: number | undefined, max: number | undefined): number {
  let v = value;
  if (min !== undefined) {
    v = Math.max(min, v);
  }
  if (max !== undefined) {
    v = Math.min(max, v);
  }
  return v;
}

/**
 * Keeps a leading minus, digits and one decimal separator, dropping everything else rather than
 * rejecting it loudly. "." counts as the decimal only when the locale's separator is absent from the
 * text, so a grouped "1.234,5" reads as 1234.5 in a comma-decimal locale.
 */
function sanitizeTyped(raw: string): string {
  const decimal = LOCALE_DECIMAL !== '.' && raw.includes(LOCALE_DECIMAL) ? LOCALE_DECIMAL : '.';
  let out = '';
  let seenDecimal = false;
  for (const ch of raw) {
    if (ch === '-' && out === '') {
      out += ch;
    } else if (ch === decimal && !seenDecimal) {
      seenDecimal = true;
      out += '.';
    } else if (ch >= '0' && ch <= '9') {
      out += ch;
    }
  }
  return out;
}

function hasDigit(text: string): boolean {
  return /[0-9]/.test(text);
}

/** A number once the text forms one; a lone "-" or "." is not yet a number. */
function parseTyped(text: string): number | undefined {
  if (!hasDigit(text)) {
    return undefined;
  }
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

function isValidUnit(unit: string): boolean {
  try {
    new Intl.NumberFormat(undefined, { style: 'unit', unit });
    return true;
  } catch {
    return false;
  }
}

/**
 * NumberInput — a number people type exactly, with step buttons and adjustable
 * accessibility actions for the small adjustments, and locale formatting so 1,234.5
 * reads the way the user expects.
 *
 * When to use: quantities, amounts, measurements, ages, counts. Choose `format` so
 * the field reads as the thing it holds; set `min`, `max` and `step` whenever they
 * exist. Not for identifiers made of digits (phone numbers, postal codes), which are
 * Input.
 *
 * Renders Input's group (label, description, field, error) where the field is a
 * bordered row: optional leading text, a `TextInput`, optional trailing text and,
 * unless `hideSteppers`, two system `Button`s (ghost, sm, iconOnly, minus/plus) behind a
 * hairline. The `TextInput` has `accessibilityRole="adjustable"`, `accessibilityValue`
 * whose text is the formatted value with its affixes ("2 kg"), and increment/decrement
 * accessibility actions, so the affix parts are hidden from assistive technology; the
 * steppers stay in it, labelled, because hiding a tappable Button is an
 * `aria-hidden-focus` violation. They step once per tap and disable at the bounds. While focused the
 * field shows what was typed; on blur or Enter the value is rounded to `precision`,
 * clamped to `min`/`max` (reporting `copy.outOfRange`, `outOfRangeMin` or `outOfRangeMax`
 * until the next keystroke or step when the clamp changed it) and shown through
 * `Intl.NumberFormat`. Committed text with no digits ("-") reports `copy.invalid`. On a
 * hardware keyboard that reports them (and on react-native-web), ArrowUp/Down step,
 * PageUp/Down step by ten and Home/End jump to a defined bound; iOS generally delivers
 * none of these, and the adjustable actions are the stepping path there. Enter inside a
 * Form submits it. `format: percent` stores the number as typed and divides by 100 for
 * display; `format: currency` without `currency` warns under `__DEV__` and uses USD, and
 * ignores `leadingText`; an unknown `unit` formats as a plain decimal with the unit shown
 * as trailing text. Inside a Fieldset the group's `disabled` and legend apply.
 * `disabled` dims the label, description, input and affixes with `disabledOpacity`; the
 * stepper Buttons dim through their own disabled style.
 */
export function NumberInput({
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
  ref,
  onChangeText,
}: NumberInputProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const fieldset = useFieldsetContext();
  const inputRef = React.useRef<TextInputInstance>(null);

  const [internalValue, setInternalValue] = React.useState<number | undefined>(defaultValue);
  // The typed text while focused; `null` means the display follows the value.
  const [rawText, setRawTextState] = React.useState<string | null>(null);
  const rawRef = React.useRef<string | null>(null);
  // True once a keystroke has changed the text since the last commit.
  const dirtyRef = React.useRef(false);
  const [focused, setFocused] = React.useState(false);
  const [clampMessage, setClampMessage] = React.useState<string | null>(null);
  const [textInvalid, setTextInvalid] = React.useState(false);

  const setRawText = (next: string | null): void => {
    rawRef.current = next;
    setRawTextState(next);
  };

  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const controlled = value !== undefined;
  const currentValue = controlled ? (value ?? undefined) : internalValue;
  const resolvedPrecision = Math.max(0, Math.round(precision ?? decimalPlaces(step)));

  const currencyMissing = format === 'currency' && (currency === undefined || currency === '');
  React.useEffect(() => {
    if (__DEV__ && currencyMissing) {
      console.warn(`NumberInput: ${COPY.currencyMissing}`);
    }
  }, [currencyMissing]);

  const unitValid = React.useMemo(() => format === 'unit' && unit !== undefined && unit !== '' && isValidUnit(unit), [format, unit]);
  const unitFallback = format === 'unit' && unit !== undefined && unit !== '' && !unitValid;

  const formatter = React.useMemo(() => {
    const digits = { minimumFractionDigits: resolvedPrecision, maximumFractionDigits: resolvedPrecision };
    if (format === 'currency') {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyMissing ? 'USD' : currency!, ...digits });
    }
    if (format === 'percent') {
      return new Intl.NumberFormat(undefined, { style: 'percent', ...digits });
    }
    if (unitValid) {
      return new Intl.NumberFormat(undefined, { style: 'unit', unit: unit!, ...digits });
    }
    return new Intl.NumberFormat(undefined, digits);
  }, [format, currency, currencyMissing, unit, unitValid, resolvedPrecision]);
  const formatNumber = (num: number): string => formatter.format(format === 'percent' ? num / 100 : num);

  const prefixText = format === 'currency' || leadingText === '' ? undefined : leadingText;
  const suffixText = trailingText !== undefined && trailingText !== '' ? trailingText : unitFallback ? unit : undefined;

  // A controlled value that moves away from what is typed takes over the display.
  React.useEffect(() => {
    if (typeof value !== 'number') {
      return;
    }
    const raw = rawRef.current;
    if (raw !== null && parseTyped(raw) !== value) {
      setRawText(null);
    }
  }, [value]);

  const validateValue = (candidate: number | undefined, nonNumeric: boolean, rangeMessage: string | null): string | null => {
    // Precedence: `error` prop, then `required`, then `invalid` (prop or committed text with no digits), then the clamp.
    if (error !== undefined && error !== '') {
      return error;
    }
    if (required && candidate === undefined && !nonNumeric) {
      return COPY.required(label);
    }
    if (invalid || nonNumeric) {
      return COPY.invalid(label);
    }
    return rangeMessage;
  };

  // Read by the stable Form handle and by Enter-then-submit in the same call stack,
  // so it is written synchronously on every commit as well as every render.
  const latest = React.useRef({ value: currentValue, textInvalid, clampMessage, validateValue });
  latest.current.value = currentValue;
  latest.current.textInvalid = textInvalid;
  latest.current.clampMessage = clampMessage;
  latest.current.validateValue = validateValue;

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      getValue: () => (latest.current.value === undefined ? undefined : String(latest.current.value)),
      validate: () => latest.current.validateValue(latest.current.value, latest.current.textInvalid, latest.current.clampMessage),
      focus: () => {
        const input = inputRef.current;
        if (input === null) {
          return;
        }
        input.focus();
        const node = findNodeHandle(input);
        if (node != null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    [label],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, handle);
    return () => unregister(name);
  }, [register, unregister, name, handle, isDisabled]);

  // The Form marks a failing field by putting an entry under its name; the entry's presence is the
  // mark, and an entry with an empty message falls through to the derived copy (as Input).
  const formErrors = form?.errors;
  const formMarked = formErrors !== undefined && Object.prototype.hasOwnProperty.call(formErrors, name);
  const formError = formErrors?.[name];
  const ownError = error !== undefined && error !== '' ? error : undefined;
  const markedInvalid = invalid || formMarked;
  // What the errorMessage part draws: `error`, else the Form's message, else — only while the field is
  // marked invalid — the derived copy, else committed non-numeric text, else the clamp. An untouched
  // empty required field is never flagged, so `copy.required` needs the mark too.
  const derivedError = markedInvalid
    ? required && currentValue === undefined
      ? COPY.required(label)
      : COPY.invalid(label)
    : textInvalid
      ? COPY.invalid(label)
      : (clampMessage ?? undefined);
  const displayedError = ownError ?? (formError !== undefined && formError !== '' ? formError : derivedError);
  const isInvalid = markedInvalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const setNumber = (next: number | undefined, nonNumeric: boolean, rangeMessage: string | null): void => {
    const previous = latest.current.value;
    latest.current.value = next;
    latest.current.textInvalid = nonNumeric;
    latest.current.clampMessage = rangeMessage;
    if (!controlled) {
      setInternalValue(next);
    }
    setTextInvalid(nonNumeric);
    setClampMessage(rangeMessage);
    if (next !== previous) {
      onChangeText?.(next);
    }
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(next, nonNumeric, rangeMessage));
    }
  };

  /** Moves to `target` (rounded and clamped); the display then follows the value. */
  const stepTo = (target: number): void => {
    if (isDisabled) {
      return;
    }
    dirtyRef.current = false;
    setNumber(clampValue(roundToPrecision(target, resolvedPrecision), min, max), false, null);
    setRawText(null);
  };

  /** `count` steps in `direction`; from empty, up goes to `min ?? 0` and down to `max ?? 0`. */
  const stepBy = (direction: 1 | -1, count = 1): void => {
    const from = latest.current.value;
    stepTo(from === undefined ? (direction === 1 ? (min ?? 0) : (max ?? 0)) : from + step * count * direction);
  };

  /** Rounds and clamps what was typed; a clamp that changed it is reported, never silent. */
  const commitTyped = (): void => {
    if (!dirtyRef.current) {
      return;
    }
    dirtyRef.current = false;
    const raw = rawRef.current ?? '';
    const parsed = parseTyped(raw);
    let final: number | undefined;
    let rangeMessage: string | null = null;
    if (parsed !== undefined) {
      const rounded = roundToPrecision(parsed, resolvedPrecision);
      final = clampValue(rounded, min, max);
      if (final !== rounded) {
        if (min !== undefined && max !== undefined) {
          rangeMessage = COPY.outOfRange(label, formatNumber(min), formatNumber(max));
        } else if (min !== undefined) {
          rangeMessage = COPY.outOfRangeMin(label, formatNumber(min));
        } else if (max !== undefined) {
          rangeMessage = COPY.outOfRangeMax(label, formatNumber(max));
        }
      }
    }
    const nonNumeric = raw !== '' && parsed === undefined;
    setNumber(final, nonNumeric, rangeMessage);
    // Committed text with no digits ("-", ".") stays in the field as typed until the next edit, so the
    // user sees what was invalid; anything else hands the display back to the formatted value.
    setRawText(nonNumeric ? raw : null);
  };

  const currentMessage = (): string | null =>
    latest.current.validateValue(latest.current.value, latest.current.textInvalid, latest.current.clampMessage);

  const handleChangeText = (text: string): void => {
    const sanitized = sanitizeTyped(text);
    dirtyRef.current = true;
    setRawText(sanitized);
    const parsed = parseTyped(sanitized);
    // An in-progress entry ("-", ".") keeps the last valid number and fires nothing.
    if (parsed === undefined && sanitized !== '') {
      return;
    }
    setNumber(parsed, false, null);
  };

  const handleFocus = (): void => {
    setFocused(true);
  };

  const handleBlur = (): void => {
    setFocused(false);
    commitTyped();
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, currentMessage());
    }
  };

  const handleKeyPress = (event: TextInputKeyPressEvent): void => {
    const key = event.nativeEvent.key;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'PageUp' || key === 'PageDown') {
      event.preventDefault();
      stepBy(key === 'ArrowUp' || key === 'PageUp' ? 1 : -1, key === 'PageUp' || key === 'PageDown' ? PAGE_STEPS : 1);
      return;
    }
    // Home/End jump to a defined bound; otherwise the key stays with the caret.
    const bound = key === 'Home' ? min : key === 'End' ? max : undefined;
    if (bound !== undefined) {
      event.preventDefault();
      stepTo(bound);
    }
  };

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment') {
      stepBy(1);
    } else if (event.nativeEvent.actionName === 'decrement') {
      stepBy(-1);
    }
  };

  const handleSubmitEditing = (): void => {
    commitTyped();
    form?.submit();
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const accessibleName = fieldset !== null ? `${fieldset.legend}, ${visibleLabel}` : visibleLabel;

  const borderInvalidColor = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const affixGap = overrides?.affixGap ? (resolveToken(t, overrides.affixGap) as number) : t.layoutGapTight;
  const stepperGap = overrides?.stepperGap ? (resolveToken(t, overrides.stepperGap) as number) : t.layoutGapNone;
  const stepperDividerColor = overrides?.stepperDivider ? (resolveToken(t, overrides.stepperDivider) as string) : t.colorBorder;
  const stepperDividerWidth = overrides?.stepperDividerWidth
    ? (resolveToken(t, overrides.stepperDividerWidth) as number)
    : t.borderWidthThin;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  // `labelWeight` and `helperSize` are realised by the composed label and helper Texts, which take
  // them through their own `overrides` below rather than a style this component resolves for them.
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const partOpacity = isDisabled ? disabledOpacity : 1;

  // The border is the focus ring: focus widens it to the locked `focusRingWidth` and the
  // padding shrinks by the difference so nothing shifts. Invalid keeps its color while focused.
  const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
  const inset = activeBorderWidth - borderWidth;
  const borderColor = isInvalid ? borderInvalidColor : focused ? t.colorBorderFocus : t.colorBorderStrong;

  const allowsNegative = min === undefined || min < 0;
  const keyboardType: KeyboardTypeOptions = Platform.OS === 'ios' && allowsNegative ? 'numbers-and-punctuation' : 'decimal-pad';

  const atMin = currentValue !== undefined && min !== undefined && currentValue <= min;
  const atMax = currentValue !== undefined && max !== undefined && currentValue >= max;

  const formattedValue = currentValue === undefined ? undefined : formatNumber(currentValue);
  const valueText =
    formattedValue === undefined ? undefined : `${prefixText ?? ''}${formattedValue}${suffixText !== undefined ? ` ${suffixText}` : ''}`;
  // Typed text wins while it exists (focused, or held after a non-numeric commit); focusing an
  // untouched field shows the plain number so editing never fights the formatting.
  const displayValue =
    rawText ?? (focused ? (currentValue === undefined ? '' : String(currentValue)) : (formattedValue ?? ''));

  const containerStyle: ViewStyle = { flexDirection: 'column', gap: partGap };

  const fieldStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: t[MIN_TARGET_TOKEN[size]],
    backgroundColor: t.colorBackground,
    borderWidth: activeBorderWidth,
    borderColor,
    borderRadius: radius,
    overflow: 'hidden',
  };

  // The stepper Buttons sit flush at the end, so the inline-end padding applies only without them.
  const contentStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: affixGap,
    paddingStart: Math.max(0, paddingInline - inset),
    paddingEnd: hideSteppers ? Math.max(0, paddingInline - inset) : 0,
    paddingVertical: Math.max(0, paddingBlock - inset),
    opacity: partOpacity,
  };

  const lineHeight = toLineHeight(fontSize, lineHeightMultiplier);

  const affixStyle: TextStyle = { color: t.colorForegroundMuted, fontFamily, fontSize, lineHeight };

  const inputStyle: TextStyle = {
    flex: 1,
    padding: 0,
    color: t.colorForeground,
    fontFamily,
    fontSize,
    lineHeight,
  };

  const steppersStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: stepperGap,
    borderStartWidth: stepperDividerWidth,
    borderStartColor: stepperDividerColor,
  };

  // The root bindings the composed Texts realise: the label follows `size` and `labelWeight`, the
  // helpers are `size="sm"` with `helperSize` on top. Each override reaches the child's own
  // `overrides` under the child's binding name; the helpers' colors stay their locked `tone`.
  const labelOverrides = {
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };
  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };

  return (
    // react-native-web 0.21 drops `accessibilityState`, so the disabled state is mirrored as
    // `aria-disabled` here and on the TextInput (as Input). The group is what tells a web
    // accessibility checker that the label and value dimmed by `disabledOpacity` belong to an
    // inactive control, which WCAG 1.4.3 exempts from the contrast floor.
    <View ref={ref} style={containerStyle} testID="NumberInput" aria-disabled={isDisabled}>
      {hideLabel ? null : (
        // Text takes no testID, so the part name lives on a wrapper View (as in Input).
        <View testID="NumberInput.label" style={{ opacity: partOpacity }}>
          <Text size={size} weight="medium" overrides={labelOverrides}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description !== undefined && description !== '' ? (
        <View testID="NumberInput.description" style={{ opacity: partOpacity }}>
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={fieldStyle} testID="NumberInput.field">
        <View style={contentStyle}>
          {prefixText !== undefined ? (
            <NativeText testID="NumberInput.prefix" style={affixStyle} accessibilityElementsHidden importantForAccessibility="no">
              {prefixText}
            </NativeText>
          ) : null}
          <TextInput
            ref={inputRef}
            testID="NumberInput.input"
            accessibilityRole="adjustable"
            accessibilityLabel={accessibleName}
            accessibilityHint={description === '' ? undefined : description}
            accessibilityState={{ disabled: isDisabled }}
            aria-disabled={isDisabled}
            // Only `text`: Android takes integers in min/max/now and the value may be fractional.
            accessibilityValue={{ text: valueText }}
            accessibilityActions={STEP_ACTIONS}
            onAccessibilityAction={handleAccessibilityAction}
            keyboardType={keyboardType}
            autoComplete="off"
            autoCorrect={false}
            allowFontScaling
            editable={!isDisabled}
            value={displayValue}
            placeholder={placeholder}
            placeholderTextColor={t.colorForegroundMuted}
            returnKeyType={form === null ? undefined : 'done'}
            submitBehavior={form === null ? 'submit' : 'blurAndSubmit'}
            onSubmitEditing={handleSubmitEditing}
            onChangeText={handleChangeText}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
          {suffixText !== undefined ? (
            <NativeText testID="NumberInput.suffix" style={affixStyle} accessibilityElementsHidden importantForAccessibility="no">
              {suffixText}
            </NativeText>
          ) : null}
        </View>
        {hideSteppers ? null : (
          // The doc hides this wrapper from assistive technology (the adjustable actions cover it), but
          // `no-hide-descendants` over a View holding Buttons takes tappable, focusable controls out of
          // the accessibility tree — the RN spelling of axe's `aria-hidden-focus`. The steppers stay in
          // the tree, labelled with the stepper copy; only their glyphs are hidden, inside the Buttons.
          <View style={steppersStyle}>
            <View testID="NumberInput.decrementButton">
              <Button
                label={COPY.decrement}
                variant="ghost"
                size="sm"
                iconOnly
                leadingIcon={<Icon name="minus" color={t.colorActionGhostForeground} />}
                disabled={isDisabled || atMin}
                onPress={() => stepBy(-1)}
              />
            </View>
            <View testID="NumberInput.incrementButton">
              <Button
                label={COPY.increment}
                variant="ghost"
                size="sm"
                iconOnly
                leadingIcon={<Icon name="plus" color={t.colorActionGhostForeground} />}
                disabled={isDisabled || atMax}
                onPress={() => stepBy(1)}
              />
            </View>
          </View>
        )}
      </View>
      {displayedError !== undefined ? (
        // Android announces through the live region, iOS through the effect above; a Form with its own
        // error summary announces instead, so both are silenced there. The error is never dimmed.
        <View testID="NumberInput.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
