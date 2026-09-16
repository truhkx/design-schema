import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type {
  AccessibilityActionEvent,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
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
  /** Field name for the Form. The collected value is the number, stringified (the Form's value type has no numeric variant), or nothing when empty. */
  name: string;
  /** Controlled numeric value. `undefined` means empty. */
  value?: number | undefined;
  /** Initial value. */
  defaultValue?: number | undefined;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number | undefined;
  /** Upper bound. */
  max?: number | undefined;
  /** Increment for the buttons, arrow keys and accessibility actions. Also the rounding granularity when `precision` is omitted. */
  step?: number | undefined;
  /** Decimal places to keep and display (a whole number). Defaults to the decimals in `step`. */
  precision?: number | undefined;
  /** Locale formatting of the displayed value via `Intl.NumberFormat`. The underlying value is always a plain number. */
  format?: NumberInputFormat | undefined;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string | undefined;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as the suffix. */
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
const PAGE_STEPS = 10; // literal-ok: the keyboard contract's "ten steps", not a design token

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

/** Keeps a leading minus, digits and one decimal separator (the locale's or "."), dropping everything else rather than rejecting it loudly. */
function sanitizeTyped(raw: string): string {
  let out = '';
  let seenDecimal = false;
  for (const ch of raw) {
    if (ch === '-' && out === '') {
      out += ch;
    } else if ((ch === '.' || ch === LOCALE_DECIMAL) && !seenDecimal) {
      seenDecimal = true;
      out += '.';
    } else if (ch >= '0' && ch <= '9') {
      out += ch;
    }
  }
  return out;
}

function parseTyped(text: string): number | undefined {
  if (text === '' || text === '-' || text === '.' || text === '-.') {
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
 * unless `hideSteppers`, two system `Button`s (ghost, iconOnly, minus/plus) behind a
 * hairline. The `TextInput` has `accessibilityRole="adjustable"`,
 * `accessibilityValue` with the formatted text, and increment/decrement accessibility
 * actions, so the steppers are hidden from assistive technology; they step once per
 * tap and disable at the bounds. While focused the field shows what was typed; on
 * blur or Enter the value is rounded to `precision`, clamped to `min`/`max` (reporting
 * `copy.outOfRange`, `outOfRangeMin` or `outOfRangeMax` when the clamp changed it) and
 * shown through `Intl.NumberFormat`. On a hardware keyboard that reports them,
 * ArrowUp/Down step and PageUp/Down step by ten. `format: percent` stores the number as
 * typed and divides by 100 for display; `format: currency` without `currency` warns
 * under `__DEV__` and uses USD, and ignores `leadingText`; an unknown `unit` formats
 * as a plain decimal with the unit shown as trailing text. Inside a Form the field
 * registers the number (stringified); inside a Fieldset the group's `disabled` and
 * legend apply. `disabled` dims the whole group with `disabledOpacity`.
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
  const [rawText, setRawText] = React.useState<string>('');
  const [focused, setFocused] = React.useState(false);
  const [clampMessage, setClampMessage] = React.useState<string | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);
  const currentValue = value !== undefined ? value : internalValue;
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

  const prefixText = format === 'currency' ? undefined : leadingText;
  const suffixText = trailingText ?? (unitFallback ? unit : undefined);

  const validateValue = (candidate: number | undefined, rangeMessage: string | null): string | null => {
    // Precedence: `error` prop, then `required`, then `invalid`, then the out-of-range clamp.
    if (error !== undefined && error !== '') {
      return error;
    }
    if (required && candidate === undefined) {
      return COPY.required(label);
    }
    if (invalid) {
      return COPY.invalid(label);
    }
    return rangeMessage;
  };

  // Read by the stable Form handle and by Enter-then-submit in the same call stack,
  // so it is written synchronously on every commit as well as every render.
  const latest = React.useRef({ value: currentValue, clampMessage, validateValue });
  latest.current.value = currentValue;
  latest.current.clampMessage = clampMessage;
  latest.current.validateValue = validateValue;

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      getValue: () => (latest.current.value === undefined ? undefined : String(latest.current.value)),
      validate: () => latest.current.validateValue(latest.current.value, latest.current.clampMessage),
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

  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : (formError ?? clampMessage ?? undefined);
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const setNumber = (next: number | undefined, rangeMessage: string | null): void => {
    const previous = latest.current.value;
    latest.current.value = next;
    latest.current.clampMessage = rangeMessage;
    if (value === undefined) {
      setInternalValue(next);
    }
    setClampMessage(rangeMessage);
    if (next !== previous) {
      onChangeText?.(next);
    }
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(next, rangeMessage));
    }
  };

  /** One step (or `multiplier` steps) in `direction`; from empty, up goes to `min ?? 0` and down to `max ?? 0`. */
  const stepBy = (direction: 1 | -1, multiplier = 1): void => {
    if (isDisabled) {
      return;
    }
    const from = latest.current.value;
    const target = from === undefined ? (direction === 1 ? (min ?? 0) : (max ?? 0)) : from + step * multiplier * direction;
    const next = clampValue(roundToPrecision(target, resolvedPrecision), min, max);
    setNumber(next, null);
    if (focused) {
      setRawText(String(next));
    }
  };

  /** Rounds and clamps what was typed; a clamp that changed it is reported, never silent. */
  const commitTyped = (): string | null => {
    const parsed = parseTyped(rawText);
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
    setNumber(final, rangeMessage);
    setRawText(final === undefined ? '' : String(final));
    return validateValue(final, rangeMessage);
  };

  const handleChangeText = (raw: string): void => {
    const sanitized = sanitizeTyped(raw);
    setRawText(sanitized);
    const parsed = parseTyped(sanitized);
    // An in-progress entry ("-", "1.") keeps the last valid number rather than reporting empty.
    if (parsed === undefined && sanitized !== '') {
      return;
    }
    setNumber(parsed, null);
  };

  const handleFocus = (): void => {
    setFocused(true);
    setRawText(currentValue === undefined ? '' : String(currentValue));
  };

  const handleBlur = (): void => {
    setFocused(false);
    const message = commitTyped();
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, message);
    }
  };

  const handleKeyPress = (event: TextInputKeyPressEvent): void => {
    const key = event.nativeEvent.key;
    const move =
      key === 'ArrowUp' ? ([1, 1] as const)
      : key === 'ArrowDown' ? ([-1, 1] as const)
      : key === 'PageUp' ? ([1, PAGE_STEPS] as const)
      : key === 'PageDown' ? ([-1, PAGE_STEPS] as const)
      : null;
    if (move === null) {
      return;
    }
    event.preventDefault();
    stepBy(move[0], move[1]);
  };

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'increment') {
      stepBy(1);
    } else if (event.nativeEvent.actionName === 'decrement') {
      stepBy(-1);
    }
  };

  const position = form === null ? -1 : form.order.indexOf(name);
  const isLast = form !== null && position !== -1 && position === form.order.length - 1;
  const nextName = form !== null && position !== -1 ? form.order[position + 1] : undefined;
  const returnKeyType: ReturnKeyTypeOptions | undefined = form === null ? undefined : isLast ? 'done' : 'next';

  const handleSubmitEditing = (): void => {
    commitTyped();
    if (form === null) {
      return;
    }
    if (isLast) {
      form.submit();
    } else if (nextName !== undefined) {
      form.focusField(nextName);
    }
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
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

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
  const displayValue = focused ? rawText : (formattedValue ?? '');

  const containerStyle: ViewStyle = { flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 };

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

  const contentStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: affixGap,
    paddingHorizontal: Math.max(0, paddingInline - inset),
    paddingVertical: Math.max(0, paddingBlock - inset),
  };

  const inputStyle: TextStyle = {
    flex: 1,
    padding: 0,
    color: t.colorForeground,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
  };

  const steppersStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: stepperGap,
    borderLeftWidth: borderWidth,
    borderLeftColor: stepperDividerColor,
  };

  const textOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };
  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };

  return (
    <View ref={ref} style={containerStyle} testID="NumberInput">
      {hideLabel ? null : (
        <View testID="NumberInput.label">
          <Text size={size} weight="medium" overrides={{ ...textOverrides, fontWeight: overrides?.labelWeight }}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description !== undefined && description !== '' ? (
        <View testID="NumberInput.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={fieldStyle} testID="NumberInput.field">
        <View style={contentStyle}>
          {prefixText !== undefined && prefixText !== '' ? (
            <View testID="NumberInput.prefix" accessibilityElementsHidden importantForAccessibility="no">
              <Text size={size} tone="muted" overrides={textOverrides}>
                {prefixText}
              </Text>
            </View>
          ) : null}
          <TextInput
            ref={inputRef}
            testID="NumberInput.input"
            accessibilityRole="adjustable"
            accessibilityLabel={accessibleName}
            accessibilityHint={description}
            accessibilityState={{ disabled: isDisabled }}
            accessibilityValue={{ min, max, now: currentValue, text: formattedValue }}
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
            returnKeyType={returnKeyType}
            submitBehavior={isLast ? 'blurAndSubmit' : 'submit'}
            onSubmitEditing={handleSubmitEditing}
            onChangeText={handleChangeText}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />
          {suffixText !== undefined && suffixText !== '' ? (
            <View testID="NumberInput.suffix" accessibilityElementsHidden importantForAccessibility="no">
              <Text size={size} tone="muted" overrides={textOverrides}>
                {suffixText}
              </Text>
            </View>
          ) : null}
        </View>
        {hideSteppers ? null : (
          <View style={steppersStyle} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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
        <View testID="NumberInput.errorMessage" accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
