import * as React from 'react';
import { AccessibilityInfo, Animated, Pressable, TextInput, View, findNodeHandle } from 'react-native';
import type { TextInputInstance, TextInputKeyPressEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { FormContext, useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Select } from './Select';
import type { ListboxItem, ListboxValue } from './Listbox';
import { Stack } from './Stack';
import { Text, TextForegroundContext } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type DatePickerSize = 'sm' | 'md';
/** A single ISO date, or a `{ start, end }` pair of them when `range` is set. Never a `Date`: a calendar date has no time zone. */
export type DatePickerValue = string | { start: string; end: string };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DatePickerOverridableBinding =
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'fontSize'
  | 'calendarInset'
  | 'calendarGap'
  | 'headerGap'
  | 'footerGap'
  | 'dayGap'
  | 'dayRadius'
  | 'dayHover'
  | 'weekdaySize'
  | 'weekdayWeight'
  | 'weekNumberSize'
  | 'monthTitleSize'
  | 'monthTitleWeight'
  | 'partGap'
  | 'fieldGap'
  | 'dayFontSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'labelWeight'
  | 'helperSize'
  | 'disabledOpacity'
  | 'transition';

export interface DatePickerProps {
  /** Visible label ("Start date", "Date of birth"). Also the input's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. The value is an ISO date string; a range registers two fields, `name` and `name-end`. */
  name: string;
  /** Controlled value (ISO date, or a range). */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /** Controlled calendar state, for programmatic use and for stories and tests. Omit for the button-driven default. */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden. */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /** BCP 47 locale for month/weekday names, the first day of the week, and the typed format. Defaults to the device locale. */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with `undefined` when cleared. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

const COPY = {
  open: 'Choose date',
  openRange: 'Choose dates',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  month: 'Month',
  year: 'Year',
  today: 'Today',
  clear: 'Clear',
  weekNumber: 'Week',
  gridLabel: (label: string, month: string, year: string): string => `${label}, ${month} ${year}`,
  selected: 'selected',
  todayLabel: 'today',
  startLabel: 'Start date',
  endLabel: 'End date',
  required: (label: string): string => `${label} is required.`,
  invalid: (label: string, pattern: string): string => `${label} must be a valid date (${pattern}).`,
  tooEarly: (label: string, min: string): string => `${label} must be on or after ${min}.`,
  tooLate: (label: string, max: string): string => `${label} must be on or before ${max}.`,
  rangeOrder: 'End date must be on or after the start date.',
  requiredIndicator: ' (required)',
} as const;

const WEEKDAYS_PER_ROW = 7;
const GRID_ROWS = 6; // literal-ok: fixed month-grid size (6 weeks always covers a month)
const MS_PER_DAY = 86400000; // literal-ok: fixed unit conversion, not a size/color token
const MS_PER_WEEK = MS_PER_DAY * 7; // literal-ok: fixed unit conversion
const YEARS_BACK = 100; // literal-ok: documented default year span (current − 100)
const YEARS_AHEAD = 10; // literal-ok: documented default year span (current + 10)

// ---- Plain-date helpers. Always Date.UTC on Y/M/D parts, never `new Date(string)`. ----

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toISO(y: number, m: number, d: number): string {
  return `${y.toString().padStart(4, '0')}-${pad2(m)}-${pad2(d)}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined) {
    return null;
  }
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

function todayISO(): string {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function addMonths(y: number, m: number, delta: number): { y: number; m: number } {
  const total = y * 12 + (m - 1) + delta;
  return { y: Math.floor(total / 12), m: ((total % 12) + 12) % 12 + 1 };
}

function getISOWeek(y: number, m: number, d: number): number {
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - weekday + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstWeekday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstWeekday + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / MS_PER_WEEK);
}

// `Intl.Locale.prototype.getWeekInfo` is missing from TypeScript's lib and from some
// engines; falls back to Sunday, matching the web generator's own fallback.
function getLocaleFirstDay(locale: string | undefined): number {
  try {
    const info = (new Intl.Locale(locale ?? 'en-US') as unknown as { getWeekInfo?: (() => { firstDay: number }) | undefined }).getWeekInfo?.();
    if (info) {
      return info.firstDay % 7;
    }
  } catch {
    // Falls through to Sunday.
  }
  return 0;
}

function monthName(locale: string | undefined, month: number, format: 'long' | 'short'): string {
  return new Intl.DateTimeFormat(locale, { month: format, timeZone: 'UTC' }).format(new Date(Date.UTC(2020, month - 1, 1)));
}

function weekdayName(locale: string | undefined, weekday: number, format: 'long' | 'short'): string {
  // 2023-01-01 is a Sunday in UTC; offsetting by `weekday` walks the week from there.
  return new Intl.DateTimeFormat(locale, { weekday: format, timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + weekday)));
}

function formatDisplay(iso: string, locale: string | undefined): string {
  const parsed = parseISO(iso);
  if (parsed === null) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(
    new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)),
  );
}

function formatFull(iso: string, locale: string | undefined): string {
  const parsed = parseISO(iso);
  if (parsed === null) {
    return iso;
  }
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)),
  );
}

// The order `year`/`month`/`day` appear in the locale's numeric date format, used both
// for the typed placeholder ("MM/DD/YYYY") and for lenient parsing.
function getPatternOrder(locale: string | undefined): Array<'year' | 'month' | 'day'> {
  const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).formatToParts(
    new Date(Date.UTC(2020, 0, 1)),
  );
  const order = parts.map((part) => part.type).filter((type): type is 'year' | 'month' | 'day' => type === 'year' || type === 'month' || type === 'day');
  return order.length === 3 ? order : ['month', 'day', 'year'];
}

function getPatternPlaceholder(locale: string | undefined): string {
  const names: Record<'year' | 'month' | 'day', string> = { year: 'YYYY', month: 'MM', day: 'DD' };
  return getPatternOrder(locale)
    .map((part) => names[part])
    .join('/');
}

// Lenient: separators (any punctuation) are optional; a two-digit year is refused
// rather than assumed.
function parseTyped(text: string, locale: string | undefined): string | null {
  const digitGroups = text.match(/\d+/g);
  if (digitGroups === null) {
    return null;
  }
  const digits = digitGroups.join('');
  if (digits.length !== 8) {
    return null;
  }
  const order = getPatternOrder(locale);
  const values: Partial<Record<'year' | 'month' | 'day', number | undefined>> = {};
  let cursor = 0;
  for (const part of order) {
    const length = part === 'year' ? 4 : 2;
    values[part] = Number(digits.slice(cursor, cursor + length));
    cursor += length;
  }
  if (values.year === undefined || values.month === undefined || values.day === undefined) {
    return null;
  }
  const parsed = parseISO(toISO(values.year, values.month, values.day));
  return parsed === null ? null : toISO(parsed.y, parsed.m, parsed.d);
}

const FONT_SIZE_TOKEN = { sm: 'fontSizeSm', md: 'fontSizeMd' } as const satisfies Record<DatePickerSize, keyof Tokens>;
const PADDING_INLINE_TOKEN = { sm: 'space2', md: 'spaceMd' } as const satisfies Record<DatePickerSize, keyof Tokens>;
const PADDING_BLOCK_TOKEN = { sm: 'space1', md: 'spaceSm' } as const satisfies Record<DatePickerSize, keyof Tokens>;
const MIN_TARGET_TOKEN = { sm: 'sizeTargetMin', md: 'sizeTargetComfortable' } as const satisfies Record<DatePickerSize, keyof Tokens>;

interface DayCell {
  iso: string;
  y: number;
  m: number;
  d: number;
  outsideMonth: boolean;
}

interface DayButtonProps {
  cell: DayCell;
  label: string;
  /** Announced as selected: the day, or in a range every day from start to end. */
  selected: boolean;
  /** Carries the selected fill: the day, or in a range only its two ends. */
  rangeEnd: boolean;
  inRange: boolean;
  today: boolean;
  disabled: boolean;
  size: number;
  radius: number;
  hoverColor: string;
  fontSizeOverride: TokenRef | undefined;
  disabledOpacity: number;
  duration: number;
  onSelect: (iso: string) => void;
}

/**
 * One day. The fill cross-fades over the `transition` duration when the day's
 * hover/selection state changes (instant under reduced motion). Hover and focus are
 * tracked by hand; focus draws the `focusRing` border, today the `dayTodayBorder` ring.
 */
function DayButton({
  cell,
  label,
  selected,
  rangeEnd,
  inRange,
  today,
  disabled,
  size,
  radius,
  hoverColor,
  fontSizeOverride,
  disabledOpacity,
  duration,
  onSelect,
}: DayButtonProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const fill = rangeEnd
    ? t.colorControlSelectedBackground
    : inRange
      ? t.colorBackgroundStrong
      : hovered && !disabled
        ? hoverColor
        : 'transparent';

  const progress = React.useRef(new Animated.Value(1)).current;
  const [colors, setColors] = React.useState<{ from: string; to: string }>({ from: fill, to: fill });
  React.useEffect(() => {
    if (fill === colors.to) {
      return;
    }
    setColors({ from: colors.to, to: fill });
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
    // Reacts to the target fill only; `colors` is read to find where the fade starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill]);

  const backgroundColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.from, colors.to] });

  const slop = Math.max(0, Math.ceil((t.sizeTargetMin - size) / 2));
  // The today ring stays on a selected or in-range today; focus replaces it.
  const ringWidth = focused || today ? t.borderWidthFocus : 0;
  const ringColor = focused ? t.colorBorderFocus : t.colorControlSelectedBackground;

  const surfaceStyle: Animated.WithAnimatedValue<ViewStyle> = {
    width: size,
    height: size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius,
    backgroundColor,
    borderWidth: ringWidth,
    borderColor: ringColor,
    opacity: disabled ? disabledOpacity : 1,
  };

  const foreground = rangeEnd ? t.colorControlSelectedForeground : cell.outsideMonth ? t.colorForegroundMuted : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={{ top: slop, bottom: slop, left: slop, right: slop }}
      onPress={() => {
        if (!disabled) {
          onSelect(cell.iso);
        }
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      testID="DatePicker.day"
    >
      <Animated.View style={surfaceStyle}>
        <TextForegroundContext.Provider value={foreground}>
          <Text size="sm" overrides={{ fontSize: fontSizeOverride }}>
            {cell.d}
          </Text>
        </TextForegroundContext.Provider>
      </Animated.View>
    </Pressable>
  );
}

/**
 * DatePicker — two ways to say the same date: type it, or find it on a calendar.
 * Both produce a plain ISO date (or a `{ start, end }` range), never a timestamp.
 *
 * When to use: any date the user chooses — due dates, bookings, dates of birth, report
 * periods (`range`). Set `min`/`max` and `isDateDisabled` whenever they exist so the
 * calendar shows what is possible instead of validating after the fact. Not for a
 * date-and-time, a month/year alone (Select), or relative choices (SegmentedControl).
 *
 * Renders the `TextInput`(s) (locale pattern, `keyboardType="number-pad"`) and a ghost,
 * icon-only calendar `Button` that opens a `BottomSheet` (`height="content"`; there is no
 * core native date picker) holding: a header of prev/next `Button`s and month/year
 * `Select`s (`hideLabel`, `size: sm`, outside any Form so they never register); a
 * 7-column grid of day `Pressable`s (`accessibilityRole="button"`,
 * `accessibilityState={{ selected, disabled }}`, `accessibilityLabel` from the full date
 * plus "today"/"selected"); and a footer of Today/Clear `Button`s. The month is announced
 * when it changes. Native has no grid role and no key events on `Pressable`, so there is
 * no roving tabindex or arrow/Page/Home/End handling: every day is its own focus stop and
 * the prev/next month Buttons stand in for PageUp/PageDown. Escape and the Android back
 * gesture close the sheet without changing the value through BottomSheet, whose own
 * FocusScope returns focus. ArrowDown (and Alt+ArrowDown, indistinguishable here) in the
 * input opens the calendar when a hardware keyboard or react-native-web supplies it.
 *
 * Selecting a day closes for a single date; for a range the first pick sets the start
 * (clearing the old range), the second sets the end and closes, and a pick before the
 * start restarts. Today acts like pressing today's cell; Clear wipes the value (both
 * ends) and leaves the sheet open. Validation: `error` → `required` → unparseable
 * (`copy.invalid`) → `tooEarly` → `tooLate` → `rangeOrder`; a range reports its message
 * only under `name`, while `name-end` always validates clean.
 */
export function DatePicker({
  label,
  name,
  value,
  defaultValue,
  open: openProp,
  range = false,
  min,
  max,
  isDateDisabled,
  locale,
  showWeekNumbers = false,
  placeholder,
  description,
  required = false,
  hideLabel = false,
  size = 'md',
  disabled = false,
  error,
  overrides,
  ref,
  onChange,
  onOpenChange,
}: DatePickerProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const singleInputRef = React.useRef<TextInputInstance>(null);
  const startInputRef = React.useRef<TextInputInstance>(null);
  const endInputRef = React.useRef<TextInputInstance>(null);

  const [internalValue, setInternalValue] = React.useState<DatePickerValue | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const currentSingle = !range && typeof currentValue === 'string' ? currentValue : undefined;
  const currentStart = range && typeof currentValue === 'object' ? currentValue.start : undefined;
  const currentEnd = range && typeof currentValue === 'object' ? currentValue.end : undefined;

  const isDisabled = disabled || (form?.disabled ?? false);
  const formError = form?.errors[name];
  const displayedError = error !== undefined && error !== '' ? error : formError;
  const summarised = form !== null && form.errorSummary;

  const patternPlaceholder = React.useMemo(() => getPatternPlaceholder(locale), [locale]);

  const [singleText, setSingleText] = React.useState<string>(currentSingle !== undefined ? formatDisplay(currentSingle, locale) : '');
  const [startText, setStartText] = React.useState<string>(currentStart !== undefined ? formatDisplay(currentStart, locale) : '');
  const [endText, setEndText] = React.useState<string>(currentEnd !== undefined ? formatDisplay(currentEnd, locale) : '');
  React.useEffect(() => {
    setSingleText(currentSingle !== undefined ? formatDisplay(currentSingle, locale) : '');
  }, [currentSingle, locale]);
  React.useEffect(() => {
    setStartText(currentStart !== undefined ? formatDisplay(currentStart, locale) : '');
  }, [currentStart, locale]);
  React.useEffect(() => {
    setEndText(currentEnd !== undefined ? formatDisplay(currentEnd, locale) : '');
  }, [currentEnd, locale]);

  const [singleFocused, setSingleFocused] = React.useState(false);
  const [startFocused, setStartFocused] = React.useState(false);
  const [endFocused, setEndFocused] = React.useState(false);

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = isOpenControlled ? openProp : internalOpen;
  const [pendingStart, setPendingStart] = React.useState<string | undefined>(undefined);

  // Reopening a range aims at the start date, or the end's when opened from the end input.
  const openedFromEndRef = React.useRef(false);
  const anchorDate = (): { y: number; m: number } => {
    const anchorIso = range ? (openedFromEndRef.current ? (currentEnd ?? currentStart) : currentStart) : currentSingle;
    const parsed = anchorIso !== undefined ? parseISO(anchorIso) : null;
    return parsed ?? parseISO(todayISO())!;
  };
  const initialAnchor = anchorDate();
  const [viewYear, setViewYear] = React.useState<number>(initialAnchor.y);
  const [viewMonth, setViewMonth] = React.useState<number>(initialAnchor.m);

  const prevOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      const anchor = anchorDate();
      setViewYear(anchor.y);
      setViewMonth(anchor.m);
      setPendingStart(undefined);
    }
    prevOpenRef.current = isOpen;
    // Only reacts to the open transition; `anchorDate` reads current props/state fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const changeOpen = (next: boolean): void => {
    if (isDisabled || next === isOpen) {
      return;
    }
    if (!isOpenControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const isDayDisabled = React.useCallback(
    (iso: string): boolean => {
      if (min !== undefined && iso < min) {
        return true;
      }
      if (max !== undefined && iso > max) {
        return true;
      }
      return isDateDisabled?.(iso) ?? false;
    },
    [min, max, isDateDisabled],
  );

  const validateValue = React.useCallback(
    (candidate: DatePickerValue | undefined, texts: readonly string[]): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      // `required` only when every input is empty.
      if (texts.every((text) => text === '')) {
        return required ? COPY.required(label) : null;
      }
      // Any non-empty input that does not parse to a real date.
      if (texts.some((text) => text !== '' && parseTyped(text, locale) === null)) {
        return COPY.invalid(label, patternPlaceholder);
      }
      // A range with one end empty: `required` reports it; otherwise a partial range reports nothing.
      if (texts.some((text) => text === '')) {
        return required ? COPY.required(label) : null;
      }
      if (candidate === undefined) {
        return null;
      }
      const isos = typeof candidate === 'string' ? [candidate] : [candidate.start, candidate.end];
      if (min !== undefined && isos.some((iso) => iso < min)) {
        return COPY.tooEarly(label, formatDisplay(min, locale));
      }
      if (max !== undefined && isos.some((iso) => iso > max)) {
        return COPY.tooLate(label, formatDisplay(max, locale));
      }
      if (typeof candidate === 'object' && candidate.end < candidate.start) {
        return COPY.rangeOrder;
      }
      return null;
    },
    [error, required, label, min, max, locale, patternPlaceholder],
  );

  const texts = range ? [startText, endText] : [singleText];

  const commitValue = (next: DatePickerValue | undefined, nextTexts: readonly string[]): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next, nextTexts));
    }
  };

  const latest = React.useRef({ currentValue, currentSingle, currentStart, currentEnd, texts, validateValue, label });
  latest.current = { currentValue, currentSingle, currentStart, currentEnd, texts, validateValue, label };

  const focusInput = (inputRef: { current: TextInputInstance | null }): void => {
    const input = inputRef.current;
    if (input === null) {
      return;
    }
    input.focus();
    const node = findNodeHandle(input);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

  const singleHandle = React.useMemo<FormFieldHandle>(
    () => ({
      get label() {
        return latest.current.label;
      },
      getValue: () => latest.current.currentSingle,
      validate: () => latest.current.validateValue(latest.current.currentValue, latest.current.texts),
      focus: () => focusInput(singleInputRef),
    }),
    [],
  );
  const startHandle = React.useMemo<FormFieldHandle>(
    () => ({
      get label() {
        return latest.current.label;
      },
      getValue: () => latest.current.currentStart,
      // The pair's combined message is reported once, under `name`.
      validate: () => latest.current.validateValue(latest.current.currentValue, latest.current.texts),
      focus: () => focusInput(startInputRef),
    }),
    [],
  );
  const endHandle = React.useMemo<FormFieldHandle>(
    () => ({
      get label() {
        return latest.current.label;
      },
      getValue: () => latest.current.currentEnd,
      // Always clean: one message must not be read twice.
      validate: () => null,
      focus: () => focusInput(endInputRef),
    }),
    [],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    if (range) {
      register(name, startHandle);
      register(`${name}-end`, endHandle);
      return () => {
        unregister(name);
        unregister(`${name}-end`);
      };
    }
    register(name, singleHandle);
    return () => unregister(name);
  }, [register, unregister, name, range, singleHandle, startHandle, endHandle, isDisabled]);

  React.useEffect(() => {
    if (!summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const showMonthOf = (iso: string): void => {
    const anchor = parseISO(iso);
    if (anchor !== null) {
      setViewYear(anchor.y);
      setViewMonth(anchor.m);
    }
  };

  const handleSingleChangeText = (text: string): void => {
    if (isDisabled) {
      return;
    }
    setSingleText(text);
    if (text === '') {
      if (currentSingle !== undefined) {
        commitValue(undefined, [text]);
      }
      return;
    }
    const parsed = parseTyped(text, locale);
    if (parsed !== null && parsed !== currentSingle) {
      commitValue(parsed, [text]);
      showMonthOf(parsed);
    }
  };

  const handleRangeChangeText = (which: 'start' | 'end', text: string): void => {
    if (isDisabled) {
      return;
    }
    const nextStartText = which === 'start' ? text : startText;
    const nextEndText = which === 'end' ? text : endText;
    if (which === 'start') {
      setStartText(text);
    } else {
      setEndText(text);
    }
    if (nextStartText === '' && nextEndText === '') {
      if (currentValue !== undefined) {
        commitValue(undefined, [nextStartText, nextEndText]);
      }
      return;
    }
    const start = parseTyped(nextStartText, locale);
    const end = parseTyped(nextEndText, locale);
    const typed = which === 'start' ? start : end;
    if (typed !== null) {
      showMonthOf(typed);
    }
    // A partial range changes nothing.
    if (start !== null && end !== null && (start !== currentStart || end !== currentEnd)) {
      commitValue({ start, end }, [nextStartText, nextEndText]);
    }
  };

  const handleBlur = (): void => {
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue, texts));
    }
  };

  // ArrowDown only arrives from a hardware keyboard or react-native-web; the event
  // carries no modifier flags, so Alt+ArrowDown opens the calendar the same way.
  const handleInputKeyPress = (event: TextInputKeyPressEvent, fromEnd = false): void => {
    if (event.nativeEvent.key === 'ArrowDown') {
      openedFromEndRef.current = fromEnd;
      changeOpen(true);
    }
  };

  const handleDaySelect = (iso: string): void => {
    if (isDisabled || isDayDisabled(iso)) {
      return;
    }
    if (!range) {
      commitValue(iso, [formatDisplay(iso, locale)]);
      changeOpen(false);
      return;
    }
    if (pendingStart === undefined || iso < pendingStart) {
      setPendingStart(iso);
      return;
    }
    setPendingStart(undefined);
    commitValue({ start: pendingStart, end: iso }, [formatDisplay(pendingStart, locale), formatDisplay(iso, locale)]);
    changeOpen(false);
  };

  const handleTodayPress = (): void => {
    const today = todayISO();
    showMonthOf(today);
    handleDaySelect(today);
  };

  const handleClearPress = (): void => {
    if (isDisabled) {
      return;
    }
    setPendingStart(undefined);
    setSingleText('');
    setStartText('');
    setEndText('');
    commitValue(undefined, range ? ['', ''] : ['']);
  };

  const handlePrevMonth = (): void => {
    const next = addMonths(viewYear, viewMonth, -1);
    setViewYear(next.y);
    setViewMonth(next.m);
  };

  const handleNextMonth = (): void => {
    const next = addMonths(viewYear, viewMonth, 1);
    setViewYear(next.y);
    setViewMonth(next.m);
  };

  const handleMonthChange = (next: ListboxValue): void => {
    if (typeof next === 'string') {
      setViewMonth(Number(next));
    }
  };

  const handleYearChange = (next: ListboxValue): void => {
    if (typeof next === 'string') {
      setViewYear(Number(next));
    }
  };

  const monthOptions: ListboxItem[] = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: monthName(locale, i + 1, 'long') })),
    [locale],
  );

  const yearOptions: ListboxItem[] = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = (min !== undefined ? parseISO(min)?.y : undefined) ?? currentYear - YEARS_BACK;
    const maxYear = (max !== undefined ? parseISO(max)?.y : undefined) ?? currentYear + YEARS_AHEAD;
    const first = Math.min(minYear, viewYear);
    const last = Math.max(maxYear, viewYear);
    return Array.from({ length: last - first + 1 }, (_, i) => {
      const y = first + i;
      return { value: String(y), label: String(y) };
    });
  }, [min, max, viewYear]);

  const firstDay = React.useMemo(() => getLocaleFirstDay(locale), [locale]);
  const gridDays = React.useMemo<DayCell[]>(() => {
    const firstOfMonthWeekday = new Date(Date.UTC(viewYear, viewMonth - 1, 1)).getUTCDay();
    const leading = (firstOfMonthWeekday - firstDay + 7) % 7;
    const gridStart = Date.UTC(viewYear, viewMonth - 1, 1 - leading);
    return Array.from({ length: GRID_ROWS * WEEKDAYS_PER_ROW }, (_, i) => {
      const date = new Date(gridStart + i * MS_PER_DAY);
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth() + 1;
      const d = date.getUTCDate();
      return { iso: toISO(y, m, d), y, m, d, outsideMonth: m !== viewMonth || y !== viewYear };
    });
  }, [viewYear, viewMonth, firstDay]);

  const weeks = React.useMemo(() => {
    const rows: DayCell[][] = [];
    for (let i = 0; i < gridDays.length; i += WEEKDAYS_PER_ROW) {
      rows.push(gridDays.slice(i, i + WEEKDAYS_PER_ROW));
    }
    return rows;
  }, [gridDays]);

  const weekdayLabels = React.useMemo(
    () =>
      Array.from({ length: WEEKDAYS_PER_ROW }, (_, i) => ({
        short: weekdayName(locale, (firstDay + i) % 7, 'short'),
        long: weekdayName(locale, (firstDay + i) % 7, 'long'),
      })),
    [locale, firstDay],
  );

  const todayIso = todayISO();
  const displayStart = range ? (pendingStart ?? currentStart) : undefined;
  const displayEnd = range ? (pendingStart !== undefined ? undefined : currentEnd) : undefined;
  const todayDisabled = isDisabled || isDayDisabled(todayIso);

  // Only the ends carry the selected fill; in a range every day from start to end is selected.
  const isRangeEnd = (iso: string): boolean => (range ? iso === displayStart || iso === displayEnd : iso === currentSingle);
  const isInRange = (iso: string): boolean =>
    range && displayStart !== undefined && displayEnd !== undefined ? iso > displayStart && iso < displayEnd : false;
  const isSelected = (iso: string): boolean => isRangeEnd(iso) || isInRange(iso);

  const dayAccessibilityLabel = (iso: string): string => {
    const bits = [formatFull(iso, locale)];
    if (iso === todayIso) {
      bits.push(COPY.todayLabel);
    }
    if (isSelected(iso)) {
      bits.push(COPY.selected);
    }
    return bits.join(', ');
  };

  const monthLabel = monthName(locale, viewMonth, 'long');
  const gridLabel = COPY.gridLabel(label, monthLabel, String(viewYear));
  const prevGridLabelRef = React.useRef(gridLabel);
  React.useEffect(() => {
    if (isOpen && gridLabel !== prevGridLabelRef.current) {
      AccessibilityInfo.announceForAccessibility(gridLabel);
    }
    prevGridLabelRef.current = gridLabel;
  }, [gridLabel, isOpen]);

  // ---- Tokens ----
  const borderInvalidColor = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const minTarget = t[MIN_TARGET_TOKEN[size]];
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fieldGap = overrides?.fieldGap ? (resolveToken(t, overrides.fieldGap) as number) : t.space2;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapTight;
  const footerGap = overrides?.footerGap ? (resolveToken(t, overrides.footerGap) as number) : t.layoutGapTight;
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const calendarInset: TokenRef = overrides?.calendarInset ?? 'layout.inset.md';
  const monthTitleSize: TokenRef = overrides?.monthTitleSize ?? 'font.size.md';
  const monthTitleWeight: TokenRef = overrides?.monthTitleWeight ?? 'font.weight.semibold';
  const dayGap = overrides?.dayGap ? (resolveToken(t, overrides.dayGap) as number) : t.space0;
  const dayRadius = overrides?.dayRadius ? (resolveToken(t, overrides.dayRadius) as number) : t.radiusMd;
  const dayHoverColor = overrides?.dayHover ? (resolveToken(t, overrides.dayHover) as string) : t.colorActionGhostBackgroundHover;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const daySize = t.sizeTargetComfortable;

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const invalid = displayedError !== undefined;
  const hint = [description, displayedError].filter((part): part is string => part !== undefined && part !== '').join('. ');

  const containerStyle: ViewStyle = { flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 };
  const fieldRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: fieldGap };

  const fieldTextStyle = (focused: boolean): TextStyle => {
    // The focus border is thicker; padding absorbs the difference so the text does not shift.
    const inset = t.borderWidthFocus - borderWidth;
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minHeight: minTarget,
      backgroundColor: t.colorBackground,
      color: t.colorForeground,
      borderWidth: focused ? t.borderWidthFocus : borderWidth,
      borderColor: focused ? t.colorBorderFocus : invalid ? borderInvalidColor : t.colorBorderStrong,
      borderRadius: radius,
      paddingHorizontal: focused ? paddingInline : paddingInline + inset,
      paddingVertical: focused ? paddingBlock : paddingBlock + inset,
      fontFamily,
      fontSize,
      lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    };
  };

  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };
  const labelOverrides = {
    fontFamily: overrides?.fontFamily,
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };
  const weekdayOverrides = { fontSize: overrides?.weekdaySize, fontWeight: overrides?.weekdayWeight };

  const headerRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: headerGap };
  const footerRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: footerGap };
  const rowStyle: ViewStyle = { flexDirection: 'row', gap: dayGap };
  const gridStyle: ViewStyle = { flexDirection: 'column', gap: dayGap };
  const headerCellStyle: ViewStyle = { width: daySize, alignItems: 'center', justifyContent: 'center' };

  const inputProps = {
    accessibilityHint: hint !== '' ? hint : undefined,
    accessibilityState: { disabled: isDisabled },
    keyboardType: 'number-pad',
    editable: !isDisabled,
    placeholder: placeholder ?? patternPlaceholder,
    placeholderTextColor: t.colorForegroundMuted,
    onKeyPress: handleInputKeyPress,
    testID: 'DatePicker.input',
  } as const;

  const field = range ? (
    <>
      <TextInput
        {...inputProps}
        ref={startInputRef}
        accessibilityLabel={`${visibleLabel}, ${COPY.startLabel}`}
        value={startText}
        onChangeText={(text) => handleRangeChangeText('start', text)}
        onFocus={() => setStartFocused(true)}
        onBlur={() => {
          setStartFocused(false);
          handleBlur();
        }}
        style={fieldTextStyle(startFocused)}
      />
      <View accessibilityElementsHidden importantForAccessibility="no">
        <Text tone="muted">{'–'}</Text>
      </View>
      <TextInput
        {...inputProps}
        ref={endInputRef}
        accessibilityLabel={`${visibleLabel}, ${COPY.endLabel}`}
        value={endText}
        onKeyPress={(event) => handleInputKeyPress(event, true)}
        onChangeText={(text) => handleRangeChangeText('end', text)}
        onFocus={() => setEndFocused(true)}
        onBlur={() => {
          setEndFocused(false);
          handleBlur();
        }}
        style={fieldTextStyle(endFocused)}
      />
    </>
  ) : (
    <TextInput
      {...inputProps}
      ref={singleInputRef}
      accessibilityLabel={visibleLabel}
      value={singleText}
      onChangeText={handleSingleChangeText}
      onFocus={() => setSingleFocused(true)}
      onBlur={() => {
        setSingleFocused(false);
        handleBlur();
      }}
      style={fieldTextStyle(singleFocused)}
    />
  );

  return (
    <View ref={ref} style={containerStyle} testID="DatePicker">
      {hideLabel ? null : (
        <View testID="DatePicker.label">
          <Text size={size} weight="medium" overrides={labelOverrides}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description !== undefined ? (
        <View testID="DatePicker.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      ) : null}
      <View style={fieldRowStyle} testID="DatePicker.field">
        {field}
        <View testID="DatePicker.calendarButton">
          <Button
            label={range ? COPY.openRange : COPY.open}
            variant="ghost"
            size={size}
            iconOnly
            expanded={isOpen}
            disabled={isDisabled}
            leadingIcon={<Icon name="calendar" color={t.colorActionGhostForeground} />}
            onPress={() => changeOpen(!isOpen)}
          />
        </View>
      </View>
      {invalid ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'} testID="DatePicker.errorMessage">
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
      <BottomSheet
        open={isOpen}
        heading={label}
        height="content"
        onClose={() => changeOpen(false)}
        overrides={{ inset: calendarInset }}
        footer={
          <View style={footerRowStyle} testID="DatePicker.footer">
            <View testID="DatePicker.todayButton">
              <Button label={COPY.today} variant="ghost" size="sm" disabled={todayDisabled} onPress={handleTodayPress} />
            </View>
            <View testID="DatePicker.clearButton">
              <Button label={COPY.clear} variant="ghost" size="sm" disabled={isDisabled} onPress={handleClearPress} />
            </View>
          </View>
        }
      >
        <View testID="DatePicker.popover">
          <Stack direction="vertical" gap="normal" overrides={{ gap: overrides?.calendarGap }}>
            <View style={headerRowStyle} testID="DatePicker.header">
              <View testID="DatePicker.prevMonthButton">
                <Button
                  label={COPY.previousMonth}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  leadingIcon={<Icon name="chevron-left" size="sm" color={t.colorActionGhostForeground} />}
                  onPress={handlePrevMonth}
                />
              </View>
              {/* Internal controls, not fields: kept out of the enclosing Form. */}
              <FormContext.Provider value={null}>
                <View testID="DatePicker.monthSelect">
                  <Select
                    label={COPY.month}
                    name={`${name}-month`}
                    hideLabel
                    size="sm"
                    options={monthOptions}
                    value={String(viewMonth)}
                    onChange={handleMonthChange}
                    overrides={{ fontSize: monthTitleSize, fontWeight: monthTitleWeight }}
                  />
                </View>
                <View testID="DatePicker.yearSelect">
                  <Select
                    label={COPY.year}
                    name={`${name}-year`}
                    hideLabel
                    size="sm"
                    options={yearOptions}
                    value={String(viewYear)}
                    onChange={handleYearChange}
                    overrides={{ fontSize: monthTitleSize, fontWeight: monthTitleWeight }}
                  />
                </View>
              </FormContext.Provider>
              <View testID="DatePicker.nextMonthButton">
                <Button
                  label={COPY.nextMonth}
                  variant="ghost"
                  size="sm"
                  iconOnly
                  leadingIcon={<Icon name="chevron-right" size="sm" color={t.colorActionGhostForeground} />}
                  onPress={handleNextMonth}
                />
              </View>
            </View>
            <View style={gridStyle} testID="DatePicker.grid" accessibilityLabel={gridLabel}>
              <View style={rowStyle} testID="DatePicker.weekdayHeader">
                {showWeekNumbers ? (
                  <View style={headerCellStyle}>
                    <Text size="xs" tone="muted" overrides={weekdayOverrides}>
                      {COPY.weekNumber}
                    </Text>
                  </View>
                ) : null}
                {weekdayLabels.map((weekday) => (
                  <View key={weekday.long} style={headerCellStyle} accessibilityLabel={weekday.long}>
                    <Text size="xs" tone="muted" overrides={weekdayOverrides}>
                      {weekday.short}
                    </Text>
                  </View>
                ))}
              </View>
              {weeks.map((week) => {
                const first = week[0]!;
                const weekNumber = getISOWeek(first.y, first.m, first.d);
                return (
                  <View key={first.iso} style={rowStyle}>
                    {showWeekNumbers ? (
                      <View
                        style={headerCellStyle}
                        accessible
                        accessibilityLabel={`${COPY.weekNumber} ${weekNumber}`}
                        testID="DatePicker.weekNumber"
                      >
                        <Text size="xs" tone="muted" overrides={{ fontSize: overrides?.weekNumberSize }}>
                          {weekNumber}
                        </Text>
                      </View>
                    ) : null}
                    {week.map((cell) => (
                      <DayButton
                        key={cell.iso}
                        cell={cell}
                        label={dayAccessibilityLabel(cell.iso)}
                        selected={isSelected(cell.iso)}
                        rangeEnd={isRangeEnd(cell.iso)}
                        inRange={isInRange(cell.iso)}
                        today={cell.iso === todayIso}
                        disabled={isDisabled || isDayDisabled(cell.iso)}
                        size={daySize}
                        radius={dayRadius}
                        hoverColor={dayHoverColor}
                        fontSizeOverride={overrides?.dayFontSize}
                        disabledOpacity={disabledOpacity}
                        duration={transitionDuration}
                        onSelect={handleDaySelect}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </Stack>
        </View>
      </BottomSheet>
    </View>
  );
}
