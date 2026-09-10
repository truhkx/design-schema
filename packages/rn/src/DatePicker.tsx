import * as React from 'react';
import { AccessibilityInfo, Pressable, TextInput, View, findNodeHandle } from 'react-native';
import type { NativeSyntheticEvent, TextInputKeyPressEventData, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import { Select } from './Select';
import type { ListboxItem, ListboxValue } from './Listbox';
import { Stack } from './Stack';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';
import type { Tokens } from './theme';

export type DatePickerSize = 'sm' | 'md';
/** A single ISO date, or a `{ start, end }` pair of them when `range` is set. Never a `Date`: a calendar date has no time zone. */
export type DatePickerValue = string | { start: string; end: string };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type DatePickerOverridableBinding =
  | 'borderFocus'
  | 'borderInvalid'
  | 'borderWidth'
  | 'radius'
  | 'paddingInline'
  | 'paddingBlock'
  | 'paddingBlockSm'
  | 'paddingInlineSm'
  | 'calendarInset'
  | 'calendarGap'
  | 'daySize'
  | 'dayGap'
  | 'dayRadius'
  | 'dayHover'
  | 'dayTodayBorderWidth'
  | 'weekdaySize'
  | 'weekdayWeight'
  | 'monthTitleSize'
  | 'monthTitleWeight'
  | 'partGap'
  | 'fieldGap'
  | 'dayFontSize'
  | 'fontFamily'
  | 'lineHeight'
  | 'labelWeight'
  | 'helperSize'
  | 'minTargetSm'
  | 'disabledOpacity'
  | 'transition';

export interface DatePickerProps {
  /** Visible label ("Start date", "Date of birth"). Also the input's `accessibilityLabel`. */
  label: string;
  /** Field name for the Form. A range registers two fields, `name` and `name-end`. */
  name: string;
  /** Controlled value (ISO date, or a range). */
  value?: DatePickerValue;
  /** Initial value. */
  defaultValue?: DatePickerValue;
  /** Controlled calendar state, for programmatic use and for stories and tests. Omit for the button-driven default. */
  open?: boolean;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string;
  /** Latest selectable date (ISO). */
  max?: string;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden. */
  isDateDisabled?: (isoDate: string) => boolean;
  /** BCP 47 locale for month/weekday names, the first day of the week, and the typed format. Defaults to the device locale. */
  locale?: string;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string;
  /** Helper text. */
  description?: string;
  /** Must have a value to submit. */
  required?: boolean;
  /** Visually hide the label (it remains the accessible name). */
  hideLabel?: boolean;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize;
  /** Not editable, still readable. */
  disabled?: boolean;
  /** Error message; implies invalid. */
  error?: string;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef>>;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with `undefined` when cleared. */
  onChange?: (value: DatePickerValue | undefined) => void;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
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
  rangeOrder: 'End date must be after the start date.',
  requiredIndicator: ' (required)',
} as const;

const WEEKDAYS_PER_ROW = 7;
const GRID_ROWS = 6; // literal-ok: fixed month-grid size (6 weeks always covers a month)
const MS_PER_DAY = 86400000; // literal-ok: fixed unit conversion, not a size/color token
const MS_PER_WEEK = MS_PER_DAY * 7; // literal-ok: fixed unit conversion

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
    const info = (new Intl.Locale(locale ?? 'en-US') as unknown as { getWeekInfo?: () => { firstDay: number } }).getWeekInfo?.();
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
  const tokens: Record<'year' | 'month' | 'day', string> = { year: 'YYYY', month: 'MM', day: 'DD' };
  return getPatternOrder(locale)
    .map((part) => tokens[part])
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
  const values: Partial<Record<'year' | 'month' | 'day', number>> = {};
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

/**
 * DatePicker — two ways to say the same date: type it, or find it on a calendar.
 * Both produce a plain ISO date (or a `{ start, end }` range), never a timestamp.
 *
 * When to use: Use for any date the user chooses — due dates, bookings, dates of
 * birth, report periods (`range`). Set `min`/`max` and `isDateDisabled` whenever they
 * exist so the calendar shows what is possible instead of validating after the fact.
 * Do not use it for a date-and-time, a month/year alone (Select), or relative choices.
 *
 * Renders the `TextInput`(s) (locale pattern, `keyboardType="number-pad"`) and a
 * ghost, icon-only calendar `Button` that opens a `BottomSheet` (there is no core
 * native date picker) holding: a header of prev/next `Button`s and month/year
 * `Select`s (`hideLabel`, `size: sm`); a 7-column grid of day `Pressable`s
 * (`accessibilityRole="button"`, `accessibilityState={{ selected, disabled }}`,
 * `accessibilityLabel` from the full formatted date plus "today"/"selected"); and a
 * footer of Today/Clear `Button`s. The month is announced
 * (`AccessibilityInfo.announceForAccessibility`) when it changes. Typing parses the
 * locale pattern leniently and fires `onChange` only once a value is complete;
 * selecting a day closes the sheet for a single date, or sets the start then the end
 * for a range (picking before the start restarts). Escape and the Android back
 * gesture close the sheet without changing the value (`BottomSheet`'s own
 * `onRequestClose`/dismiss handling); `ArrowDown` opens the calendar from the input
 * when a hardware keyboard or react-native-web supplies key events — on-screen
 * keyboards do not. Validation follows `error` → `required` → unparseable
 * (`copy.invalid`) → `tooEarly` → `tooLate` → `rangeOrder`. `size: sm` swaps padding
 * and the target height floor for their `Sm` bindings and the field text to
 * `font.size.sm`; the calendar `Button` becomes `size: sm` too. `disabled` dims the
 * whole label/description/field/error group with `disabledOpacity`.
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
  onChange,
  onOpenChange,
}: DatePickerProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const form = useFormContext();
  const singleInputRef = React.useRef<TextInput>(null);
  const startInputRef = React.useRef<TextInput>(null);
  const endInputRef = React.useRef<TextInput>(null);

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

  const anchorDate = (): { y: number; m: number } => {
    const anchorIso = range ? (currentEnd ?? currentStart) : currentSingle;
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
    if (isDisabled) {
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
    (candidate: DatePickerValue | undefined): string | null => {
      if (error !== undefined && error !== '') {
        return error;
      }
      if (required && candidate === undefined) {
        return COPY.required(label);
      }
      if (candidate === undefined) {
        return null;
      }
      const isos = typeof candidate === 'string' ? [candidate] : [candidate.start, candidate.end];
      for (const iso of isos) {
        if (parseISO(iso) === null) {
          return COPY.invalid(label, patternPlaceholder);
        }
      }
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

  const commitValue = (next: DatePickerValue | undefined): void => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (form !== null && form.validateMode !== 'submit') {
      form.reportValidity(name, validateValue(next));
    }
  };

  const latest = React.useRef({ currentValue, currentSingle, currentStart, currentEnd, validateValue });
  latest.current = { currentValue, currentSingle, currentStart, currentEnd, validateValue };

  const focusInput = (ref: { current: TextInput | null }): void => {
    const input = ref.current;
    if (input === null) {
      return;
    }
    input.focus();
    const node = findNodeHandle(input);
    if (node !== null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  };

  const singleHandle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.currentSingle,
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => focusInput(singleInputRef),
    }),
    [],
  );
  const startHandle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.currentStart,
      // The pair's combined message is reported once, under `name`; `name-end` only
      // contributes its value (no schema guidance on splitting one message in two).
      validate: () => latest.current.validateValue(latest.current.currentValue),
      focus: () => focusInput(startInputRef),
    }),
    [],
  );
  const endHandle = React.useMemo<FormFieldHandle>(
    () => ({
      getValue: () => latest.current.currentEnd,
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

  const handleSingleChangeText = (text: string): void => {
    setSingleText(text);
    if (text === '') {
      commitValue(undefined);
      return;
    }
    const parsed = parseTyped(text, locale);
    if (parsed !== null) {
      commitValue(parsed);
      const anchor = parseISO(parsed)!;
      setViewYear(anchor.y);
      setViewMonth(anchor.m);
    }
  };

  const handleSingleBlur = (): void => {
    setSingleFocused(false);
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue));
    }
  };

  const handleStartChangeText = (text: string): void => {
    setStartText(text);
    if (text === '') {
      if (currentEnd === undefined) {
        commitValue(undefined);
      }
      return;
    }
    const parsed = parseTyped(text, locale);
    if (parsed === null) {
      return;
    }
    if (currentEnd !== undefined) {
      commitValue({ start: parsed, end: currentEnd });
    }
  };

  const handleEndChangeText = (text: string): void => {
    setEndText(text);
    if (text === '') {
      if (currentStart === undefined) {
        commitValue(undefined);
      }
      return;
    }
    const parsed = parseTyped(text, locale);
    if (parsed === null) {
      return;
    }
    if (currentStart !== undefined) {
      commitValue({ start: currentStart, end: parsed });
    }
  };

  const handleRangeBlur = (): void => {
    if (form !== null && form.validateMode === 'blur') {
      form.reportValidity(name, validateValue(currentValue));
    }
  };

  // ArrowDown is only reachable via a hardware keyboard or react-native-web; on-screen
  // keyboards do not emit it, so opening the calendar from the field is otherwise done
  // with the calendar button (see the platform notes' acknowledged limit).
  const handleInputKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
    if (event.nativeEvent.key === 'ArrowDown') {
      changeOpen(true);
    }
  };

  const handleSheetClose = (): void => {
    changeOpen(false);
  };

  const handleDaySelect = (iso: string): void => {
    if (isDayDisabled(iso)) {
      return;
    }
    if (!range) {
      commitValue(iso);
      changeOpen(false);
      return;
    }
    if (pendingStart === undefined) {
      setPendingStart(iso);
      return;
    }
    if (iso < pendingStart) {
      setPendingStart(iso);
      return;
    }
    setPendingStart(undefined);
    commitValue({ start: pendingStart, end: iso });
    changeOpen(false);
  };

  const handleTodayPress = (): void => {
    handleDaySelect(todayISO());
  };

  const handleClearPress = (): void => {
    setPendingStart(undefined);
    commitValue(undefined);
    changeOpen(false);
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
    const minYear = min !== undefined ? (parseISO(min)?.y ?? currentYear - 100) : currentYear - 100;
    const maxYear = max !== undefined ? (parseISO(max)?.y ?? currentYear + 10) : currentYear + 10;
    return Array.from({ length: Math.max(1, maxYear - minYear + 1) }, (_, i) => {
      const y = minYear + i;
      return { value: String(y), label: String(y) };
    });
  }, [min, max]);

  const firstDay = React.useMemo(() => getLocaleFirstDay(locale), [locale]);
  const gridDays = React.useMemo(() => {
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
    const rows: (typeof gridDays)[] = [];
    for (let i = 0; i < gridDays.length; i += WEEKDAYS_PER_ROW) {
      rows.push(gridDays.slice(i, i + WEEKDAYS_PER_ROW));
    }
    return rows;
  }, [gridDays]);

  const weekdayLabels = React.useMemo(
    () => Array.from({ length: WEEKDAYS_PER_ROW }, (_, i) => weekdayName(locale, (firstDay + i) % 7, 'short')),
    [locale, firstDay],
  );

  const todayIso = todayISO();
  const displayStart = range ? (pendingStart ?? currentStart) : undefined;
  const displayEnd = range ? (pendingStart !== undefined ? undefined : currentEnd) : undefined;

  const isSelected = (iso: string): boolean => (range ? iso === displayStart || iso === displayEnd : iso === currentSingle);
  const isInRange = (iso: string): boolean =>
    range && displayStart !== undefined && displayEnd !== undefined ? iso > displayStart && iso < displayEnd : false;

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
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fieldGap = overrides?.fieldGap ? (resolveToken(t, overrides.fieldGap) as number) : t.space2;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const fontSize = t[FONT_SIZE_TOKEN[size]];
  const lineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const calendarInset = overrides?.calendarInset ?? ('layout.inset.md' as TokenRef);
  const daySize = overrides?.daySize ? (resolveToken(t, overrides.daySize) as number) : t.sizeTargetComfortable;
  const dayGap = overrides?.dayGap ? (resolveToken(t, overrides.dayGap) as number) : t.space0;
  const dayRadius = overrides?.dayRadius ? (resolveToken(t, overrides.dayRadius) as number) : t.radiusMd;
  const dayHoverColor = overrides?.dayHover ? (resolveToken(t, overrides.dayHover) as string) : t.colorActionGhostBackgroundHover;
  const dayTodayBorderWidth = overrides?.dayTodayBorderWidth ? (resolveToken(t, overrides.dayTodayBorderWidth) as number) : t.borderWidthFocus;

  const daySlop = Math.max(0, Math.ceil((t.sizeTargetMin - daySize) / 2));
  const dayHitSlop = { top: daySlop, bottom: daySlop, left: daySlop, right: daySlop };

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;

  const containerStyle: ViewStyle = { flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 };
  const fieldRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: fieldGap };

  const fieldTextStyle = (focused: boolean, invalid: boolean): TextStyle => {
    const activeBorderWidth = focused ? t.borderWidthFocus : borderWidth;
    const inset = t.borderWidthFocus - borderWidth;
    return {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minHeight: minTarget,
      backgroundColor: t.colorBackground,
      color: t.colorForeground,
      borderWidth: activeBorderWidth,
      borderColor: focused ? borderFocusColor : invalid ? borderInvalidColor : t.colorBorderStrong,
      borderRadius: radius,
      paddingHorizontal: paddingInline + inset,
      paddingVertical: paddingBlock + inset,
      fontFamily,
      fontSize,
      lineHeight: toLineHeight(fontSize, lineHeightMultiplier),
    };
  };

  const helperOverrides = { fontFamily: overrides?.fontFamily, fontSize: overrides?.helperSize, lineHeight: overrides?.lineHeight };
  const labelOverrides = {
    fontFamily: overrides?.fontFamily,
    fontWeight: overrides?.labelWeight,
    lineHeight: overrides?.lineHeight,
  };

  const headerRowStyle: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: t.space1 };
  const weekdayRowStyle: ViewStyle = { flexDirection: 'row', gap: dayGap };
  const weekRowStyle: ViewStyle = { flexDirection: 'row', gap: dayGap };
  const weekCellStyle: ViewStyle = { width: daySize, alignItems: 'center', justifyContent: 'center' };

  const dayCellStyle = (cell: (typeof gridDays)[number], pressed: boolean): ViewStyle => {
    const selected = isSelected(cell.iso);
    const inRange = isInRange(cell.iso);
    const today = cell.iso === todayIso;
    const dis = isDayDisabled(cell.iso);
    return {
      width: daySize,
      height: daySize,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: dayRadius,
      backgroundColor: selected ? t.colorControlSelectedBackground : inRange ? t.colorBackgroundStrong : pressed && !dis ? dayHoverColor : 'transparent',
      borderWidth: today && !selected ? dayTodayBorderWidth : 0,
      borderColor: t.colorControlSelectedBackground,
      opacity: dis ? disabledOpacity : 1,
    };
  };

  const dayTextColor = (cell: (typeof gridDays)[number]): TokenRef | undefined => {
    if (isSelected(cell.iso)) {
      return 'color.control.selectedForeground';
    }
    if (cell.outsideMonth) {
      return 'color.foreground.muted';
    }
    return undefined;
  };

  const field = range ? (
    <>
      <TextInput
        ref={startInputRef}
        accessibilityLabel={`${visibleLabel}, ${COPY.startLabel}`}
        accessibilityHint={description}
        accessibilityState={{ disabled: isDisabled }}
        keyboardType="number-pad"
        editable={!isDisabled}
        value={startText}
        placeholder={placeholder ?? patternPlaceholder}
        placeholderTextColor={t.colorForegroundMuted}
        onChangeText={handleStartChangeText}
        onFocus={() => setStartFocused(true)}
        onBlur={() => {
          setStartFocused(false);
          handleRangeBlur();
        }}
        onKeyPress={handleInputKeyPress}
        style={fieldTextStyle(startFocused, displayedError !== undefined)}
        testID="DatePicker.input"
      />
      <Text overrides={{ color: 'color.foreground.muted' as TokenRef }}>{'–'}</Text>
      <TextInput
        ref={endInputRef}
        accessibilityLabel={`${visibleLabel}, ${COPY.endLabel}`}
        accessibilityHint={description}
        accessibilityState={{ disabled: isDisabled }}
        keyboardType="number-pad"
        editable={!isDisabled}
        value={endText}
        placeholder={placeholder ?? patternPlaceholder}
        placeholderTextColor={t.colorForegroundMuted}
        onChangeText={handleEndChangeText}
        onFocus={() => setEndFocused(true)}
        onBlur={() => {
          setEndFocused(false);
          handleRangeBlur();
        }}
        onKeyPress={handleInputKeyPress}
        style={fieldTextStyle(endFocused, displayedError !== undefined)}
        testID="DatePicker.input"
      />
    </>
  ) : (
    <TextInput
      ref={singleInputRef}
      accessibilityLabel={visibleLabel}
      accessibilityHint={description}
      accessibilityState={{ disabled: isDisabled }}
      keyboardType="number-pad"
      editable={!isDisabled}
      value={singleText}
      placeholder={placeholder ?? patternPlaceholder}
      placeholderTextColor={t.colorForegroundMuted}
      onChangeText={handleSingleChangeText}
      onFocus={() => setSingleFocused(true)}
      onBlur={handleSingleBlur}
      onKeyPress={handleInputKeyPress}
      style={fieldTextStyle(singleFocused, displayedError !== undefined)}
      testID="DatePicker.input"
    />
  );

  return (
    <View style={containerStyle} testID="DatePicker">
      {hideLabel ? null : (
        <Text weight="medium" overrides={labelOverrides}>
          {visibleLabel}
        </Text>
      )}
      {description !== undefined ? (
        <Text size="sm" tone="muted" overrides={helperOverrides}>
          {description}
        </Text>
      ) : null}
      <View style={fieldRowStyle} testID="DatePicker.field">
        {field}
        <Button
          label={range ? COPY.openRange : COPY.open}
          variant="ghost"
          size={size}
          iconOnly
          disabled={isDisabled}
          leadingIcon={<Icon name="calendar" color={t.colorActionGhostForeground} />}
          onPress={() => changeOpen(!isOpen)}
        />
      </View>
      {displayedError !== undefined ? (
        <View accessibilityLiveRegion={summarised ? 'none' : 'assertive'}>
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      ) : null}
      <BottomSheet
        open={isOpen}
        heading={gridLabel}
        height="content"
        onClose={handleSheetClose}
        overrides={{ inset: calendarInset }}
        footer={
          <>
            <Button label={COPY.today} variant="ghost" size="sm" onPress={handleTodayPress} />
            <Button label={COPY.clear} variant="ghost" size="sm" onPress={handleClearPress} />
          </>
        }
      >
        <Stack direction="vertical" gap="normal" overrides={{ gap: overrides?.calendarGap }}>
          <View style={headerRowStyle} testID="DatePicker.header">
            <Button
              label={COPY.previousMonth}
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={<Icon name="chevron-left" size="sm" color={t.colorActionGhostForeground} />}
              onPress={handlePrevMonth}
            />
            <Select
              label={COPY.month}
              name={`${name}-month`}
              hideLabel
              size="sm"
              options={monthOptions}
              value={String(viewMonth)}
              onChange={handleMonthChange}
              overrides={{ fontSize: overrides?.monthTitleSize ?? ('font.size.md' as TokenRef) }}
            />
            <Select
              label={COPY.year}
              name={`${name}-year`}
              hideLabel
              size="sm"
              options={yearOptions}
              value={String(viewYear)}
              onChange={handleYearChange}
              overrides={{ fontSize: overrides?.monthTitleSize ?? ('font.size.md' as TokenRef) }}
            />
            <Button
              label={COPY.nextMonth}
              variant="ghost"
              size="sm"
              iconOnly
              leadingIcon={<Icon name="chevron-right" size="sm" color={t.colorActionGhostForeground} />}
              onPress={handleNextMonth}
            />
          </View>
          <View testID="DatePicker.grid" accessibilityLabel={gridLabel}>
            <View style={weekdayRowStyle} testID="DatePicker.weekdayHeader">
              {showWeekNumbers ? (
                <View style={weekCellStyle}>
                  <Text size="xs" tone="muted" overrides={{ fontSize: overrides?.weekdaySize, fontWeight: overrides?.weekdayWeight }}>
                    {COPY.weekNumber}
                  </Text>
                </View>
              ) : null}
              {weekdayLabels.map((wd, i) => (
                <View key={i} style={weekCellStyle}>
                  <Text size="xs" tone="muted" overrides={{ fontSize: overrides?.weekdaySize, fontWeight: overrides?.weekdayWeight }}>
                    {wd}
                  </Text>
                </View>
              ))}
            </View>
            {weeks.map((week, wi) => (
              <View key={wi} style={weekRowStyle}>
                {showWeekNumbers && week[0] !== undefined ? (
                  <View style={weekCellStyle} testID="DatePicker.weekNumber">
                    <Text size="xs" tone="muted" overrides={{ fontSize: overrides?.weekdaySize }}>
                      {getISOWeek(week[0].y, week[0].m, week[0].d)}
                    </Text>
                  </View>
                ) : null}
                {week.map((cell) => (
                  <Pressable
                    key={cell.iso}
                    accessibilityRole="button"
                    accessibilityLabel={dayAccessibilityLabel(cell.iso)}
                    accessibilityState={{ selected: isSelected(cell.iso), disabled: isDayDisabled(cell.iso) }}
                    hitSlop={dayHitSlop}
                    onPress={() => handleDaySelect(cell.iso)}
                    style={({ pressed }) => dayCellStyle(cell, pressed)}
                    testID="DatePicker.day"
                  >
                    <Text size="sm" overrides={{ fontSize: overrides?.dayFontSize, color: dayTextColor(cell) }}>
                      {cell.d}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </Stack>
      </BottomSheet>
    </View>
  );
}
