import * as React from 'react';
import { AccessibilityInfo, Platform, TextInput, View, findNodeHandle } from 'react-native';
import type { AccessibilityActionEvent, KeyboardTypeOptions, ReturnKeyTypeOptions, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Icon } from './Icon';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type NumberInputFormat = 'decimal' | 'currency' | 'percent' | 'unit';
export type NumberInputSize = 'sm' | 'md';

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type NumberInputOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockSm'
  | 'paddingInlineSm'
  | 'affixGap'
  | 'stepperGap'
  | 'stepperDivider'
  | 'partGap'
  | 'labelWeight'
  | 'helperSize'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'minTargetSm'
  | 'disabledOpacity';

export interface NumberInputProps {
  /** Visible label. Also the field's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. The collected value is the number, stringified (`FormFieldValue` has no numeric variant). */
  name: string;
  /** Controlled numeric value. `undefined` means empty. */
  value?: number;
  /** Initial value for an uncontrolled field. */
  defaultValue?: number;
  /** Lower bound; values are clamped on blur and the decrement button disables at it. */
  min?: number;
  /** Upper bound; the increment button disables at it. */
  max?: number;
  /** Increment for the buttons and accessibility step actions. Also the rounding granularity when `precision` is omitted. */
  step?: number;
  /** Decimal places to keep and display. Defaults to the decimals in `step`. */
  precision?: number;
  /** Locale formatting of the displayed value via `Intl.NumberFormat`. The underlying value is always a plain number. */
  format?: NumberInputFormat;
  /** ISO 4217 code for `format: currency` (e.g. USD). */
  currency?: string;
  /** Intl unit identifier for `format: unit` (e.g. kilogram, hour), or a literal shown as `suffix` when not a valid Intl unit. */
  unit?: string;
  /** Static text before the value inside the field ("$"), when `format` cannot express it. */
  leadingText?: string;
  /** Static text after the value inside the field ("kg", "%"). Also the literal shown when `unit` is not a valid Intl unit. */
  trailingText?: string;
  /** Hide the increment/decrement buttons. The accessibility step actions still work. */
  hideSteppers?: boolean;
  /** Example value shown while empty. */
  placeholder?: string;
  /** Helper text below the label. Also the field's `accessibilityHint`. */
  description?: string;
  /** Must have a value to submit. */
  required?: boolean;
  /** Visually hide the label (it remains the field's `accessibilityLabel`). Only for a field whose context already names it. */
  hideLabel?: boolean;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type, `sm` stepper buttons. */
  size?: NumberInputSize;
  /** Not editable, not submitted, still readable. */
  disabled?: boolean;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<NumberInputOverridableBinding, TokenRef>>;
  /** Fired when the numeric value changes (on each valid keystroke, step, and on blur after clamping/rounding), with the number or undefined. */
  onChangeText?: (value: number | undefined) => void;
}

const FONT_SIZE_TOKEN = { sm: 'fontSizeSm', md: 'fontSizeMd' } as const satisfies Record<NumberInputSize, keyof Tokens>;

const COPY = {
  increment: 'Increase',
  decrement: 'Decrease',
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string): string => `${label} must be a number.`,
  outOfRange: (label: string, min: number, max: number): string => `${label} must be between ${min} and ${max}.`,
  currencyMissing: 'format "currency" needs a currency code.',
  requiredIndicator: ' (required)',
} as const;

/** Accessibility actions standing in for the keyboard's ArrowUp/Down, PageUp/Down and Home/End, since a hardware keyboard rarely reaches a touch field. */
const STEP_ACTIONS = [
  { name: 'increment', label: 'Increment' },
  { name: 'decrement', label: 'Decrement' },
  { name: 'pageup', label: 'Increase by ten steps' },
  { name: 'pagedown', label: 'Decrease by ten steps' },
  { name: 'home', label: 'Set to minimum' },
  { name: 'end', label: 'Set to maximum' },
] as const;

function decimalPlaces(n: number): number {
  const s = n.toString();
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

/** Keeps a leading minus, digits, and a single decimal point; drops everything else, so a locale keyboard's stray characters are ignored rather than rejected loudly. */
function sanitizeTyped(raw: string): string {
  let out = '';
  let seenDot = false;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '-' && i === 0) {
      out += ch;
    } else if (ch === '.' && !seenDot) {
      seenDot = true;
      out += ch;
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
  return Number.isNaN(n) ? undefined : n;
}

function isValidUnit(unit: string): boolean {
  try {
    const formatter = new Intl.NumberFormat(undefined, { style: 'unit', unit });
    return formatter !== undefined;
  } catch {
    return false;
  }
}

/**
 * NumberInput — collects a number people type exactly, with step buttons and
 * accessibility step actions for the small adjustments, and locale formatting so
 * 1,234.5 reads the way the user expects.
 *
 * When to use: Use for quantities, amounts, measurements and other exact numeric
 * values. Choose `format` so the field reads as the thing it holds. Set `min`, `max`
 * and `step` whenever they exist; they drive the buttons, the accessibility step
 * actions and the out-of-range message.
 *
 * Renders a label, optional description, a bordered field row (optional leading
 * text, the `TextInput`, optional trailing text, and — unless `hideSteppers` —
 * two system `Button`s separated from the field by a hairline), and an error
 * message. The field shows the raw typed digits while focused and the
 * `Intl.NumberFormat`-formatted value once blurred, when it is also rounded to
 * `precision` and clamped to `min`/`max` (reporting `copy.outOfRange` when that
 * changed what was typed and both bounds are set). The `TextInput` carries
 * `accessibilityRole="adjustable"`, `accessibilityValue`, and increment/decrement/
 * pageup/pagedown/home/end accessibility actions so a screen reader can step
 * without the buttons; the buttons themselves are hidden from assistive technology
 * (`accessibilityElementsHidden`) since those actions cover the same ground, and
 * disable at `min`/`max`. `format: percent` stores the number as typed and divides
 * by 100 only for display; `format: unit` falls back to a plain number plus
 * `unit` shown as literal trailing text when `unit` is not a valid Intl unit
 * identifier; `format: currency` without `currency` is a dev warning that falls
 * back to USD. `disabled` dims the whole group with `disabledOpacity`. Inside a
 * Form the field registers the number, stringified.
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
  onChangeText,
}: NumberInputProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const inputRef = React.useRef<TextInput>(null);

  const [internalValue, setInternalValueState] = React.useState<number | undefined>(defaultValue);
  const [rawText, setRawText] = React.useState<string>('');
  const [focused, setFocused] = React.useState(false);
  const [clampMessage, setClampMessageState] = React.useState<string | null>(null);

  const isDisabled = disabled || (form?.disabled ?? false);
  const currentValue = value ?? internalValue;
  const resolvedPrecision = precision ?? decimalPlaces(step);

  // Mutated directly (not only via the per-render reassignment below) so an
  // Enter key that commits and immediately triggers `form.submit()` in the same
  // call stack reads the just-committed value rather than last render's, and so
  // the memoized `handle` below always validates with the latest `label`/
  // `required`/`invalid`/`error`.
  const latest = React.useRef({
    value: currentValue,
    clampMessage,
    validateValue: (_val: number | undefined, _outOfRangeMessage: string | null): string | null => null,
  });
  latest.current.value = currentValue;
  latest.current.clampMessage = clampMessage;

  const setUncontrolled = (next: number | undefined): void => {
    latest.current.value = next;
    if (value === undefined) {
      setInternalValueState(next);
    }
  };

  const setClampMessage = (next: string | null): void => {
    latest.current.clampMessage = next;
    setClampMessageState(next);
  };

  const currencyMissing = format === 'currency' && (currency === undefined || currency === '');
  React.useEffect(() => {
    if (__DEV__ && currencyMissing) {
      console.warn(`NumberInput: ${COPY.currencyMissing}`);
    }
  }, [currencyMissing]);

  const unitInvalid = format === 'unit' && unit !== undefined && !isValidUnit(unit);

  const formatDisplay = (num: number): string => {
    const digits = { minimumFractionDigits: resolvedPrecision, maximumFractionDigits: resolvedPrecision };
    if (format === 'currency') {
      const code = currencyMissing ? 'USD' : (currency as string);
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, ...digits }).format(num);
    }
    if (format === 'percent') {
      return new Intl.NumberFormat(undefined, { style: 'percent', ...digits }).format(num / 100);
    }
    if (format === 'unit' && unit !== undefined && !unitInvalid) {
      return new Intl.NumberFormat(undefined, { style: 'unit', unit, ...digits }).format(num);
    }
    return new Intl.NumberFormat(undefined, digits).format(num);
  };

  const suffixText = trailingText ?? (unitInvalid ? unit : undefined);

  const validateValue = (val: number | undefined, outOfRangeMessage: string | null): string | null => {
    // Precedence: `error` prop, then the out-of-range clamp message, then `required`, then `invalid`.
    if (error !== undefined && error !== '') {
      return error;
    }
    if (outOfRangeMessage !== null) {
      return outOfRangeMessage;
    }
    if (required && val === undefined) {
      return COPY.required(label);
    }
    if (invalid) {
      return COPY.invalid(label);
    }
    return null;
  };
  latest.current.validateValue = validateValue;

  const handle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => (latest.current.value !== undefined ? String(latest.current.value) : undefined),
      validate: () => latest.current.validateValue(latest.current.value, latest.current.clampMessage),
      focus: () => {
        const input = inputRef.current;
        if (input === null) {
          return;
        }
        input.focus();
        const node = findNodeHandle(input);
        if (node !== null) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      },
    }),
    // Reads everything through `latest`, which is kept current every render (and
    // mutated synchronously on commit), so the Form never needs to re-register
    // this field just because `error`/`required`/`invalid`/`label` changed.
    [],
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
  const displayedError = error !== undefined && error !== '' ? error : (clampMessage ?? formError);
  const isInvalid = invalid || displayedError !== undefined;
  const summarised = form !== null && form.errorSummary;

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  /** Sets the value, clears any out-of-range message, and syncs the raw text while focused. */
  const commitValue = (next: number): void => {
    setUncontrolled(next);
    setClampMessage(null);
    if (focused) {
      setRawText(String(next));
    }
    onChangeText?.(next);
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(next, null));
    }
  };

  /** One `step` (or ten, for Page actions) in `direction`; from an empty field, jumps straight to `min ?? 0` / `max ?? 0` instead. */
  const stepValue = (direction: 1 | -1, multiplier = 1): void => {
    if (isDisabled) {
      return;
    }
    if (currentValue === undefined) {
      commitValue(clampValue(roundToPrecision(direction === 1 ? (min ?? 0) : (max ?? 0), resolvedPrecision), min, max));
      return;
    }
    const next = clampValue(roundToPrecision(currentValue + step * multiplier * direction, resolvedPrecision), min, max);
    commitValue(next);
  };

  /** Rounds and clamps the typed text on blur/Enter, reporting `copy.outOfRange` when a clamp changed what was typed and both bounds are set. */
  const commitTyped = (): string | null => {
    const parsed = parseTyped(rawText);
    let final: number | undefined;
    let outOfRangeMessage: string | null = null;
    if (parsed === undefined) {
      final = undefined;
    } else {
      const rounded = roundToPrecision(parsed, resolvedPrecision);
      const clamped = clampValue(rounded, min, max);
      if (clamped !== rounded && min !== undefined && max !== undefined) {
        outOfRangeMessage = COPY.outOfRange(label, min, max);
      }
      final = clamped;
    }
    setUncontrolled(final);
    setClampMessage(outOfRangeMessage);
    onChangeText?.(final);
    return validateValue(final, outOfRangeMessage);
  };

  const handleChangeText = (raw: string): void => {
    const sanitized = sanitizeTyped(raw);
    setRawText(sanitized);
    setClampMessage(null);
    const parsed = parseTyped(sanitized);
    setUncontrolled(parsed);
    onChangeText?.(parsed);
    if (form !== null && form.validateMode === 'change') {
      form.reportValidity(name, validateValue(parsed, null));
    }
  };

  const handleFocus = (): void => {
    setFocused(true);
    setRawText(currentValue !== undefined ? String(currentValue) : '');
  };

  const handleBlur = (): void => {
    setFocused(false);
    const message = commitTyped();
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, message);
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

  const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (isDisabled) {
      return;
    }
    switch (event.nativeEvent.actionName) {
      case 'increment':
        stepValue(1);
        break;
      case 'decrement':
        stepValue(-1);
        break;
      case 'pageup':
        stepValue(1, 10);
        break;
      case 'pagedown':
        stepValue(-1, 10);
        break;
      case 'home':
        if (min !== undefined) {
          commitValue(min);
        }
        break;
      case 'end':
        if (max !== undefined) {
          commitValue(max);
        }
        break;
      default:
        break;
    }
  };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;

  const borderFocusColor = overrides?.borderFocus ? (resolveToken(t, overrides.borderFocus) as string) : t.colorBorderFocus;
  const borderInvalidColor = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline =
    size === 'sm'
      ? overrides?.paddingInlineSm
        ? (resolveToken(t, overrides.paddingInlineSm) as number)
        : t.space2
      : overrides?.paddingInline
        ? (resolveToken(t, overrides.paddingInline) as number)
        : t.spaceMd;
  const paddingBlock =
    size === 'sm'
      ? overrides?.paddingBlockSm
        ? (resolveToken(t, overrides.paddingBlockSm) as number)
        : t.space1
      : overrides?.paddingBlock
        ? (resolveToken(t, overrides.paddingBlock) as number)
        : t.spaceSm;
  const minTarget =
    size === 'sm'
      ? overrides?.minTargetSm
        ? (resolveToken(t, overrides.minTargetSm) as number)
        : t.sizeTargetMin
      : t.sizeTargetComfortable;
  const affixGap = overrides?.affixGap ? (resolveToken(t, overrides.affixGap) as number) : t.layoutGapTight;
  const stepperGap = overrides?.stepperGap ? (resolveToken(t, overrides.stepperGap) as number) : t.layoutGapNone;
  const stepperDividerColor = overrides?.stepperDivider ? (resolveToken(t, overrides.stepperDivider) as string) : t.colorBorder;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;

  // The focus ring is drawn by widening the border to the locked `focusRingWidth`;
  // padding shrinks by the same amount so the field never shifts when it gains focus.
  const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
  const inset = t.borderWidthFocus - borderWidth;

  const allowsNegative = min === undefined || min < 0;
  const keyboardType: KeyboardTypeOptions = Platform.OS === 'ios' && allowsNegative ? 'numbers-and-punctuation' : 'decimal-pad';

  const atMin = currentValue !== undefined && min !== undefined && currentValue <= min;
  const atMax = currentValue !== undefined && max !== undefined && currentValue >= max;

  const displayValue = focused ? rawText : currentValue !== undefined ? formatDisplay(currentValue) : '';
  const accessibilityValueText = currentValue !== undefined ? formatDisplay(currentValue) : undefined;

  const containerStyle: ViewStyle = {
    flexDirection: 'column',
    gap: partGap,
    opacity: isDisabled ? disabledOpacity : 1,
  };

  const fieldStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: minTarget,
    backgroundColor: t.colorBackground,
    borderWidth: activeBorderWidth,
    borderColor: focused ? borderFocusColor : isInvalid ? borderInvalidColor : t.colorBorderStrong,
    borderRadius: radius,
  };

  const contentRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: affixGap,
    paddingHorizontal: paddingInline + inset,
    paddingVertical: paddingBlock + inset,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    padding: 0,
    fontFamily,
    fontSize,
    lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    color: t.colorForeground,
  };

  const stepperRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: stepperGap,
    borderLeftWidth: t.borderWidthThin,
    borderLeftColor: stepperDividerColor,
  };

  const typographyOverrides = { fontFamily: overrides?.fontFamily };
  const helperOverrides = { ...typographyOverrides, fontSize: overrides?.helperSize };

  return (
    <View style={containerStyle} testID="NumberInput">
      {hideLabel ? null : (
        <View testID="NumberInput.label">
          <Text
            weight="medium"
            overrides={{ ...typographyOverrides, fontSize: overrides?.fontSize, fontWeight: overrides?.labelWeight, lineHeight: overrides?.lineHeight }}
          >
            {visibleLabel}
          </Text>
        </View>
      )}
      {description !== undefined ? (
        <View testID="NumberInput.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={fieldStyle} testID="NumberInput.field">
        <View style={contentRowStyle}>
          {leadingText !== undefined ? (
            <View testID="NumberInput.prefix">
              <Text tone="muted" overrides={{ ...typographyOverrides, fontSize: overrides?.fontSize }}>
                {leadingText}
              </Text>
            </View>
          ) : null}
          <TextInput
            ref={inputRef}
            testID="NumberInput.input"
            accessibilityLabel={visibleLabel}
            accessibilityHint={description}
            accessibilityRole="adjustable"
            accessibilityState={{ disabled: isDisabled }}
            accessibilityValue={{ min, max, now: currentValue, text: accessibilityValueText }}
            accessibilityActions={STEP_ACTIONS}
            onAccessibilityAction={handleAccessibilityAction}
            keyboardType={keyboardType}
            allowFontScaling
            editable={!isDisabled}
            value={displayValue}
            placeholder={placeholder}
            placeholderTextColor={t.colorForegroundMuted}
            returnKeyType={returnKeyType}
            blurOnSubmit={isLast}
            onSubmitEditing={handleSubmitEditing}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={textInputStyle}
          />
          {suffixText !== undefined ? (
            <View testID="NumberInput.suffix">
              <Text tone="muted" overrides={{ ...typographyOverrides, fontSize: overrides?.fontSize }}>
                {suffixText}
              </Text>
            </View>
          ) : null}
        </View>
        {hideSteppers ? null : (
          <View style={stepperRowStyle}>
            <View testID="NumberInput.decrementButton" accessibilityElementsHidden importantForAccessibility="no">
              <Button
                label={COPY.decrement}
                variant="ghost"
                size={size}
                iconOnly
                leadingIcon={<Icon name="minus" color={t.colorActionGhostForeground} />}
                disabled={isDisabled || atMin}
                onPress={() => stepValue(-1)}
              />
            </View>
            <View testID="NumberInput.incrementButton" accessibilityElementsHidden importantForAccessibility="no">
              <Button
                label={COPY.increment}
                variant="ghost"
                size={size}
                iconOnly
                leadingIcon={<Icon name="plus" color={t.colorActionGhostForeground} />}
                disabled={isDisabled || atMax}
                onPress={() => stepValue(1)}
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
