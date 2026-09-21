import * as React from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text as RNText, TextInput, View, findNodeHandle } from 'react-native';
import type { TextInputInstance, TextInputKeyPressEvent, TextStyle, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { useFieldsetContext } from './Fieldset';
import { FormContext, useFormContext } from './FormContext';
import type { FormFieldHandle } from './FormContext';
import { Icon } from './Icon';
import type { ListboxItem } from './Listbox';
import { Select } from './Select';
import { Text } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type DatePickerSize = 'sm' | 'md';

/** A single ISO calendar date, or both ends of a range. Never a `Date`: a calendar date has no time zone. */
export type DatePickerValue = string | { start: string; end: string };

/**
 * The style bindings a caller may replace with a different token; see the component's
 * overrides contract. The locked bindings (`background`, `foreground`, `placeholder`,
 * `border`, `borderFocus`, `rangeSeparatorColor`, `calendarSurface`, `daySize`,
 * `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`,
 * `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`, `weekdayColor`,
 * `descriptionText`, `errorText`, `minTarget`, `minTargetSm`, `focusRing`,
 * `focusRingWidth`) carry contrast or target guarantees and are not in the union.
 */
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
  | 'weekNumberWeight'
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
  /** Visible label ("Start date", "Date of birth"). Also the input's accessible name and the calendar sheet's heading. */
  label: string;
  /**
   * Field name for the Form. The value is an ISO calendar date string (`2026-09-10`)
   * or, for a range, `{ start, end }` of them. The Form holds strings only, so a range
   * registers two fields, `name` (start) and `name-end` (end).
   */
  name: string;
  /**
   * Controlled value (ISO date, or a range). Pass `''` for a controlled empty field
   * (`{ start: '', end: '' }` for a range). While an input has focus it keeps the typed
   * text; on blur, and at once after a pick or Clear, the inputs show the formatted
   * `value`, so a controlled owner that does not update `value` sees the text revert.
   * In a range the first pick is an internal draft shown only in the calendar.
   */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and tests. Omit for
   * the button-driven default. Every change aims the calendar at the committed value's
   * month (or today's) — its end when opened by ArrowDown in the end input, its start
   * otherwise; uncommitted typed text is ignored.
   */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and can take focus but not be selected. */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /**
   * BCP 47 locale for month and weekday names, the first day of the week, and the typed
   * format. Defaults to the device locale. The typed pattern comes from `formatToParts`
   * with 2-digit month and day and a numeric year, so en-US is MM/DD/YYYY.
   */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. Also the input's `accessibilityHint`. */
  description?: string | undefined;
  /** Must have a value to submit. `copy.requiredIndicator` is appended to the visible label, so it is part of the accessible name. */
  required?: boolean | undefined;
  /** Do not render the label Text; `label` stays the accessible name. Only for a field whose context already names it. */
  hideLabel?: boolean | undefined;
  /** `sm` for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. The calendar does not open. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** The root group `View`, so a parent can measure the field group. */
  ref?: React.Ref<ViewInstance> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, and with `undefined` on Clear. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/** The component's user-facing strings, from the doc's `copy` block. */
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

/** Six rows always, so the grid's height does not change with the month. */
const WEEKS_SHOWN = 6; // literal-ok: the calendar's fixed row count, not a size
const DAYS_PER_WEEK = 7; // literal-ok: days in a week
/** The year Select's span when `min`/`max` give no bound of their own. */
const YEARS_BACK = 100; // literal-ok: the doc's "current year − 100"
const YEARS_FORWARD = 10; // literal-ok: the doc's "current year + 10"
const MS_PER_DAY = 86400000; // literal-ok: milliseconds in a day
/** The en dash between the start and end inputs. */
const RANGE_SEPARATOR = '–';

/** `font.size.{size}` — the field text and the label, so the label follows `size`. */
const FONT_SIZE_TOKEN = {
  sm: 'fontSizeSm',
  md: 'fontSizeMd',
} as const satisfies Record<DatePickerSize, keyof Tokens>;

const PADDING_INLINE_TOKEN = {
  sm: 'space2',
  md: 'spaceMd',
} as const satisfies Record<DatePickerSize, keyof Tokens>;

const PADDING_BLOCK_TOKEN = {
  sm: 'space1',
  md: 'spaceSm',
} as const satisfies Record<DatePickerSize, keyof Tokens>;

/** `minTarget` / `minTargetSm`: both locked, so the sm floor is always `size.target.min`. */
const MIN_TARGET_TOKEN = {
  sm: 'sizeTargetMin',
  md: 'sizeTargetComfortable',
} as const satisfies Record<DatePickerSize, keyof Tokens>;

/** A calendar date as its three numbers; `month` is 1-12. Never a `Date`, which carries a time zone. */
interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/u;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toUtc(date: CalendarDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function fromUtc(ms: number): CalendarDate {
  const d = new Date(ms);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function toIso(date: CalendarDate): string {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

/** Parses an ISO calendar date, rejecting impossible days (`2026-02-30`). */
function parseIso(iso: string): CalendarDate | null {
  const match = ISO.exec(iso);
  if (match === null) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

function addDays(date: CalendarDate, days: number): CalendarDate {
  return fromUtc(toUtc(date) + days * MS_PER_DAY);
}

/** 0 = Sunday, as `Date.prototype.getUTCDay`. */
function weekdayOf(date: CalendarDate): number {
  return new Date(toUtc(date)).getUTCDay();
}

/** The ISO-8601 week of the given day: the week whose Thursday names the year. */
function isoWeekOf(date: CalendarDate): number {
  const mondayIndex = (weekdayOf(date) + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK;
  const thursday = addDays(date, 3 - mondayIndex); // literal-ok: Thursday's index in a Monday-first week
  const january1 = { year: thursday.year, month: 1, day: 1 };
  return Math.floor((toUtc(thursday) - toUtc(january1)) / MS_PER_DAY / DAYS_PER_WEEK) + 1;
}

/** Today in the device's own calendar; `new Date()` is read for its local parts only. */
function todayIso(): string {
  const now = new Date();
  return toIso({ year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() });
}

/** The device locale, since React Native has no `document.documentElement.lang`. */
function deviceLocale(): string {
  return new Intl.DateTimeFormat().resolvedOptions().locale;
}

type PatternField = 'year' | 'month' | 'day';

const FIELD_PLACEHOLDER = { year: 'YYYY', month: 'MM', day: 'DD' } as const satisfies Record<PatternField, string>;
const FIELD_DIGITS = { year: 4, month: 2, day: 2 } as const satisfies Record<PatternField, number>;

function isPatternField(type: string): type is PatternField {
  return type === 'year' || type === 'month' || type === 'day';
}

/** The numeric formatter every typed value is read and written through. */
function numericFormat(locale: string): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
}

/** A reference date whose parts are all unambiguous, used only to read the locale's pattern. */
const PATTERN_SAMPLE = Date.UTC(2026, 10, 22); // literal-ok: 2026-11-22, a fixed sample date

/** The locale's typed pattern ("MM/DD/YYYY", "DD.MM.YYYY"), which is also the default placeholder. */
function localePattern(locale: string): string {
  return numericFormat(locale)
    .formatToParts(PATTERN_SAMPLE)
    .map((part) => (isPatternField(part.type) ? FIELD_PLACEHOLDER[part.type] : part.value))
    .join('');
}

/** The pattern's field order, which is how a typed string's numbers are assigned. */
function patternOrder(locale: string): PatternField[] {
  const order: PatternField[] = [];
  for (const part of numericFormat(locale).formatToParts(PATTERN_SAMPLE)) {
    if (isPatternField(part.type)) {
      order.push(part.type);
    }
  }
  return order;
}

/**
 * Reads typed text against the locale pattern, leniently: any non-digit run separates
 * the fields, and the separators may be left out entirely. Two-digit years are refused —
 * "10/11/26" is a typo, not the year 2026 — and an impossible day is not a date.
 */
function parseTyped(text: string, locale: string): string | null {
  const order = patternOrder(locale);
  if (order.length !== 3) {
    return null; // literal-ok: a pattern always has year, month and day
  }
  const groups = text.split(/\D+/u).filter((group) => group !== '');
  let digits: string[];
  if (groups.length === order.length) {
    digits = groups;
  } else if (groups.length === 1) {
    // Separators left out: slice the run by each field's own width, in pattern order.
    const run = groups[0] as string;
    const total = order.reduce((sum, field) => sum + FIELD_DIGITS[field], 0);
    if (run.length !== total) {
      return null;
    }
    let at = 0;
    digits = order.map((field) => {
      const slice = run.slice(at, at + FIELD_DIGITS[field]);
      at += FIELD_DIGITS[field];
      return slice;
    });
  } else {
    return null;
  }

  const date: CalendarDate = { year: 0, month: 0, day: 0 };
  for (let i = 0; i < order.length; i++) {
    const field = order[i] as PatternField;
    const digit = digits[i] as string;
    // A year is always written in full; month and day may be one or two digits.
    if (field === 'year' ? digit.length !== FIELD_DIGITS.year : digit.length > FIELD_DIGITS[field]) {
      return null;
    }
    date[field] = Number(digit);
  }
  return parseIso(toIso(date)) === null ? null : toIso(date);
}

/** The typed text for an ISO date, in the locale's numeric pattern. */
function formatTyped(iso: string, locale: string): string {
  const date = parseIso(iso);
  return date === null ? '' : numericFormat(locale).format(toUtc(date));
}

/**
 * The locale's first day of the week through `Intl.Locale`'s week info where the engine
 * has it (Hermes often does not), else Sunday, as the doc says.
 */
function firstDayOfWeek(locale: string): number {
  type WeekInfo = { firstDay: number };
  type WithWeekInfo = Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };
  try {
    const resolved = new Intl.Locale(locale) as WithWeekInfo;
    const info = typeof resolved.getWeekInfo === 'function' ? resolved.getWeekInfo() : resolved.weekInfo;
    if (info !== undefined) {
      // Week info counts Monday as 1 and Sunday as 7; `getUTCDay` counts Sunday as 0.
      return info.firstDay % DAYS_PER_WEEK;
    }
  } catch {
    // An unparseable locale tag falls through to the default.
  }
  return 0;
}

function startOf(value: DatePickerValue | undefined): string {
  if (value === undefined) {
    return '';
  }
  return typeof value === 'string' ? value : value.start;
}

function endOf(value: DatePickerValue | undefined): string {
  if (value === undefined) {
    return '';
  }
  return typeof value === 'string' ? value : value.end;
}

interface DayCellProps {
  iso: string;
  /** The number shown in the cell. */
  day: number;
  /** The full date plus "today" and/or "selected" — the cell's whole accessible name. */
  label: string;
  outsideMonth: boolean;
  /** An end of the range, or the single picked date: the cell takes the selected fill. */
  selected: boolean;
  /** Between the two ends of a range: the weaker in-range fill. */
  inRange: boolean;
  today: boolean;
  disabled: boolean;
  daySize: number;
  dayRadius: number;
  dayFontSize: number;
  dayHover: string;
  fontFamily: string;
  lineHeight: number;
  duration: number;
  onPress: (iso: string) => void;
}

/**
 * One day of the grid. `Pressable` sees no key events on native, so there is no roving
 * tabindex here: every day is its own focus stop, reached by swipe. The fill is a layer
 * whose opacity animates over `transition` (react-native-web has no native driver, so
 * `useNativeDriver` stays false), which is how "background-color animates" reads on this
 * platform; the today ring is an inset ring and switches at once.
 */
function DayCell({
  iso,
  day,
  label,
  outsideMonth,
  selected,
  inRange,
  today,
  disabled,
  daySize,
  dayRadius,
  dayFontSize,
  dayHover,
  fontFamily,
  lineHeight,
  duration,
  onPress,
}: DayCellProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const fill = selected
    ? t.colorControlSelectedBackground
    : inRange
      ? t.colorBackgroundStrong
      : hovered && !disabled
        ? dayHover
        : undefined;

  // The fill fades in and out; its colour, when one fill replaces another, switches at
  // once. Mounting is not a state change, so the first frame is set, never animated.
  const target = fill === undefined ? 0 : 1;
  const fillOpacity = React.useRef(new Animated.Value(target)).current;
  const shown = React.useRef(target);
  React.useEffect(() => {
    if (shown.current === target) {
      return;
    }
    shown.current = target;
    if (reducedMotion || duration === 0) {
      fillOpacity.setValue(target);
      return;
    }
    Animated.timing(fillOpacity, {
      toValue: target,
      duration,
      easing: toEasing(t.motionEasingStandard),
      // react-native-web has no native driver, and this is a layout-adjacent prop either way.
      useNativeDriver: false,
    }).start();
  }, [target, fillOpacity, reducedMotion, duration, t]);

  const cellStyle = React.useMemo<ViewStyle>(
    () => ({
      width: daySize,
      height: daySize,
      borderRadius: dayRadius,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? t.opacityDisabled : 1,
    }),
    [daySize, dayRadius, disabled, t],
  );

  // The focus ring replaces the today ring while the day has focus, so only one draws.
  const ringColor = focused ? t.colorBorderFocus : today ? t.colorControlSelectedBackground : undefined;

  return (
    <Pressable
      testID="DatePicker.day"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      // react-native-web 0.21 drops `accessibilityState.disabled`; this mirror is what reaches the DOM.
      aria-disabled={disabled}
      style={cellStyle}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      // A disabled day still takes focus and is announced; only the press is guarded.
      onPress={() => {
        if (!disabled) {
          onPress(iso);
        }
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: fill, borderRadius: dayRadius, opacity: fillOpacity }]}
      />
      {ringColor === undefined ? null : (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { borderWidth: t.borderWidthFocus, borderColor: ringColor, borderRadius: dayRadius }]}
        />
      )}
      <RNText
        style={{
          color: selected ? t.colorControlSelectedForeground : outsideMonth ? t.colorForegroundMuted : t.colorForeground,
          fontFamily,
          fontSize: dayFontSize,
          lineHeight: toLineHeight(dayFontSize, lineHeight),
        }}
      >
        {day}
      </RNText>
    </Pressable>
  );
}

/**
 * DatePicker — two ways to say the same date: type it, or find it on a calendar. Both
 * produce a plain ISO date (`2026-09-10`), never a timestamp, because a delivery date or
 * a birthday has no time zone to get wrong.
 *
 * When to use: any date the user chooses — due dates, bookings, dates of birth, report
 * periods (`range`). Set `min`, `max` and `isDateDisabled` whenever they exist, so the
 * calendar shows what is possible instead of validating after the fact. Not for a
 * date-and-time, a month or year alone (Select), or relative choices.
 *
 * React Native has no core date picker and the package takes no date dependency (only
 * `react-native-svg`, for Icon), so the calendar is the system's own grid here as on
 * every other platform: a `TextInput` (`keyboardType="number-pad"`) parsed against the
 * locale's pattern, a ghost `Button` with the "calendar" glyph, and a `BottomSheet`
 * (`height="content"`, `heading={label}`) holding the header, the 7-column grid of
 * `daySize` `Pressable` days and the Today/Clear footer. The `popover` part is that
 * sheet: only `calendarInset` is forwarded (to its `inset` override) and `calendarSurface`
 * is realised by the sheet's own locked surface.
 *
 * Native has no grid or gridcell role and `Pressable` sees no keys, so there is no roving
 * tabindex and no Arrow, Page, Home or End handling: every day is its own focus stop
 * reached by swipe, and the prev/next month Buttons stand in for PageUp/PageDown.
 * `TextInputKeyPressEvent` carries no modifier flags, so Alt+ArrowDown cannot be told
 * from ArrowDown and both simply open the calendar. Focus on open lands on the sheet's
 * first focusable element rather than the selected day, and focus on close returns
 * through BottomSheet's own FocusScope, since Button exposes no node handle to focus by
 * hand; only the displayed month follows the value.
 *
 * There is no native invalid state, so the error is appended to the input's
 * `accessibilityHint` after `description` and announced through an assertive live region
 * (Android) with `AccessibilityInfo.announceForAccessibility` on iOS. The label is a
 * `Text` — React Native has no `<label>` — and `hideLabel` drops it, leaving the name in
 * `accessibilityLabel`. Button and Select take no `testID`, so each composed part is
 * wrapped in a `View` this component owns carrying `testID="DatePicker.<part>"`.
 *
 * Inside a Form the field registers by `name` with the start's ISO string; a range adds
 * a second field, `name-end`, holding the end, and only `name` reports the combined
 * message so one message is never read twice.
 */
export function DatePicker({
  label,
  name,
  value,
  defaultValue,
  open,
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
  const fieldset = useFieldsetContext();

  const resolvedLocale = locale ?? deviceLocale();
  const pattern = React.useMemo(() => localePattern(resolvedLocale), [resolvedLocale]);
  const weekStart = React.useMemo(() => firstDayOfWeek(resolvedLocale), [resolvedLocale]);
  const fullFormat = React.useMemo(
    () => new Intl.DateTimeFormat(resolvedLocale, { dateStyle: 'full', timeZone: 'UTC' }),
    [resolvedLocale],
  );
  const monthFormat = React.useMemo(
    () => new Intl.DateTimeFormat(resolvedLocale, { month: 'long', timeZone: 'UTC' }),
    [resolvedLocale],
  );
  const weekdayFormat = React.useMemo(
    () => new Intl.DateTimeFormat(resolvedLocale, { weekday: 'short', timeZone: 'UTC' }),
    [resolvedLocale],
  );

  const startInputRef = React.useRef<TextInputInstance>(null);
  const endInputRef = React.useRef<TextInputInstance>(null);

  const [internalValue, setInternalValue] = React.useState<DatePickerValue | undefined>(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState<'start' | 'end' | null>(null);
  /** The first pick of a range: shown only in the calendar until the end is picked. */
  const [pendingStart, setPendingStart] = React.useState<string | null>(null);

  const currentValue = value ?? internalValue;
  const startIso = startOf(currentValue);
  const endIso = endOf(currentValue);
  const isOpen = open ?? internalOpen;
  const isDisabled = disabled || (form?.disabled ?? false) || (fieldset?.disabled ?? false);

  const [startText, setStartText] = React.useState(() => formatTyped(startOf(defaultValue ?? value), resolvedLocale));
  const [endText, setEndText] = React.useState(() => formatTyped(endOf(defaultValue ?? value), resolvedLocale));

  // An unfocused input always shows the committed value; a focused one keeps what was typed.
  React.useEffect(() => {
    if (focusedInput !== 'start') {
      setStartText(formatTyped(startIso, resolvedLocale));
    }
  }, [startIso, focusedInput, resolvedLocale]);
  React.useEffect(() => {
    if (focusedInput !== 'end') {
      setEndText(formatTyped(endIso, resolvedLocale));
    }
  }, [endIso, focusedInput, resolvedLocale]);

  const today = todayIso();
  const [viewMonth, setViewMonth] = React.useState<CalendarDate>(() => {
    const anchor = parseIso(startOf(defaultValue ?? value)) ?? (parseIso(today) as CalendarDate);
    return { year: anchor.year, month: anchor.month, day: 1 };
  });

  /** Which input a keyboard open came from; the calendar Button always opens on the start. */
  const openAnchor = React.useRef<'start' | 'end'>('start');

  const isDayDisabled = React.useCallback(
    (iso: string): boolean => {
      if (min !== undefined && min !== '' && iso < min) {
        return true;
      }
      if (max !== undefined && max !== '' && iso > max) {
        return true;
      }
      return isDateDisabled?.(iso) ?? false;
    },
    [min, max, isDateDisabled],
  );

  const changeOpen = (next: boolean): void => {
    if (next === isOpen || (next && isDisabled)) {
      return;
    }
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  // Every change to `open`, by the user or by the parent, aims the calendar at the
  // committed value's month (or today's) and drops any pending range draft.
  const anchorMonth = React.useRef({ startIso, endIso, today });
  anchorMonth.current = { startIso, endIso, today };
  React.useEffect(() => {
    if (!isOpen) {
      setPendingStart(null);
      return;
    }
    const current = anchorMonth.current;
    const anchor =
      parseIso(openAnchor.current === 'end' ? current.endIso : current.startIso) ?? (parseIso(current.today) as CalendarDate);
    setViewMonth({ year: anchor.year, month: anchor.month, day: 1 });
    openAnchor.current = 'start';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const monthName = monthFormat.format(toUtc(viewMonth));
  const yearName = String(viewMonth.year);
  const gridLabel = COPY.gridLabel(label, monthName, yearName);

  // The header month is announced on change, since the grid's own name is not re-read.
  const announced = React.useRef(gridLabel);
  React.useEffect(() => {
    if (isOpen && announced.current !== gridLabel) {
      AccessibilityInfo.announceForAccessibility(gridLabel);
    }
    announced.current = gridLabel;
  }, [isOpen, gridLabel]);

  // ---- validation -------------------------------------------------------------------

  const ownError = error !== undefined && error !== '' ? error : undefined;

  const validateTexts = React.useCallback(
    (start: string, end: string): string | null => {
      if (isDisabled) {
        return null;
      }
      if (ownError !== undefined) {
        return ownError;
      }
      const startEmpty = start.trim() === '';
      const endEmpty = end.trim() === '';
      const bothEmpty = range ? startEmpty && endEmpty : startEmpty;
      if (required && bothEmpty) {
        return COPY.required(label);
      }
      const startDate = startEmpty ? null : parseTyped(start, resolvedLocale);
      const endDate = range && !endEmpty ? parseTyped(end, resolvedLocale) : null;
      if ((!startEmpty && startDate === null) || (range && !endEmpty && endDate === null)) {
        return COPY.invalid(label, pattern);
      }
      if (range && (startEmpty !== endEmpty)) {
        // A half-filled range is only an error when the field is required; otherwise it reports nothing.
        return required ? COPY.required(label) : null;
      }
      if (startDate === null) {
        return null;
      }
      const ends = range && endDate !== null ? [startDate, endDate] : [startDate];
      if (min !== undefined && min !== '' && ends.some((iso) => iso < min)) {
        return COPY.tooEarly(label, formatTyped(min, resolvedLocale));
      }
      if (max !== undefined && max !== '' && ends.some((iso) => iso > max)) {
        return COPY.tooLate(label, formatTyped(max, resolvedLocale));
      }
      if (range && endDate !== null && endDate < startDate) {
        return COPY.rangeOrder;
      }
      return null;
    },
    [isDisabled, ownError, range, required, label, resolvedLocale, pattern, min, max],
  );

  // The Form marks a failing field by putting an entry under its name; an entry with an
  // empty message falls through to the derived copy. `error` is the consumer's.
  const formErrors = form?.errors;
  const formMarked = formErrors !== undefined && Object.prototype.hasOwnProperty.call(formErrors, name);
  const formError = formErrors?.[name];
  const derivedError = formMarked ? (validateTexts(startText, endText) ?? undefined) : undefined;
  const displayedError = ownError ?? (formError !== undefined && formError !== '' ? formError : derivedError);
  const summarised = form !== null && form.errorSummary;
  const isInvalid = displayedError !== undefined;

  const focusField = React.useCallback((): void => {
    startInputRef.current?.focus();
    const node = startInputRef.current === null ? null : findNodeHandle(startInputRef.current);
    if (node != null) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const latest = React.useRef({ startIso, endIso, startText, endText, isDisabled, validateTexts, focusField });
  latest.current = { startIso, endIso, startText, endText, isDisabled, validateTexts, focusField };

  // The Form holds strings only: a single date is one field, a range is `name` (start)
  // and `name-end` (end), and only `name` reports the combined message.
  const startHandle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      getValue: () => (latest.current.isDisabled || latest.current.startIso === '' ? undefined : latest.current.startIso),
      validate: () => latest.current.validateTexts(latest.current.startText, latest.current.endText),
      focus: () => latest.current.focusField(),
    }),
    [label],
  );
  const endHandle = React.useMemo<FormFieldHandle>(
    () => ({
      label,
      getValue: () => (latest.current.isDisabled || latest.current.endIso === '' ? undefined : latest.current.endIso),
      // Always clean: the combined message is reported once, under `name`.
      validate: () => null,
      focus: () => endInputRef.current?.focus(),
    }),
    [label],
  );

  const register = form?.register;
  const unregister = form?.unregister;
  const endName = `${name}-end`;
  React.useEffect(() => {
    if (register === undefined || unregister === undefined || isDisabled) {
      return undefined;
    }
    register(name, startHandle);
    if (range) {
      register(endName, endHandle);
    }
    return () => {
      unregister(name);
      if (range) {
        unregister(endName);
      }
    };
  }, [register, unregister, name, endName, range, startHandle, endHandle, isDisabled]);

  React.useEffect(() => {
    if (Platform.OS === 'ios' && !summarised && displayedError !== undefined) {
      AccessibilityInfo.announceForAccessibility(displayedError);
    }
  }, [displayedError, summarised]);

  const reportValidity = (start: string, end: string, on: 'change' | 'blur'): void => {
    if (form !== null && (form.validateMode === on || form.validateMode === 'change' || form.submitFailed)) {
      form.reportValidity(name, validateTexts(start, end));
    }
  };

  // ---- committing -------------------------------------------------------------------

  const commit = (next: DatePickerValue | undefined): void => {
    if (value === undefined) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  /** A pick or Clear shows the formatted value at once, whether or not an input has focus. */
  const showValue = (start: string, end: string): void => {
    setStartText(formatTyped(start, resolvedLocale));
    setEndText(formatTyped(end, resolvedLocale));
  };

  const pickDay = (iso: string): void => {
    if (isDayDisabled(iso)) {
      return;
    }
    if (!range) {
      showValue(iso, '');
      commit(iso);
      changeOpen(false);
      return;
    }
    // The first pick clears any old range and shows only in the calendar; picking before
    // the pending start restarts from there.
    if (pendingStart === null || iso < pendingStart) {
      setPendingStart(iso);
      return;
    }
    const next = { start: pendingStart, end: iso };
    setPendingStart(null);
    showValue(next.start, next.end);
    commit(next);
    changeOpen(false);
  };

  const handleClear = (): void => {
    setPendingStart(null);
    showValue('', '');
    // Clear fires `undefined` even when the field is already empty, and leaves the calendar open.
    commit(undefined);
    reportValidity('', '', 'change');
  };

  const handleTyped = (next: string, which: 'start' | 'end'): void => {
    const nextStart = which === 'start' ? next : startText;
    const nextEnd = which === 'end' ? next : endText;
    if (which === 'start') {
      setStartText(next);
    } else {
      setEndText(next);
    }
    reportValidity(nextStart, nextEnd, 'change');

    const typed = parseTyped(next, resolvedLocale);
    if (typed === null) {
      return;
    }
    // The calendar, when open, follows the typed date.
    const parsed = parseIso(typed) as CalendarDate;
    setViewMonth({ year: parsed.year, month: parsed.month, day: 1 });
    if (!range) {
      // Typing text that parses to the current value changes nothing.
      if (typed !== startIso) {
        commit(typed);
      }
      return;
    }
    const other = which === 'start' ? parseTyped(nextEnd, resolvedLocale) : parseTyped(nextStart, resolvedLocale);
    if (other === null) {
      return; // A partial range changes nothing.
    }
    const value2 = which === 'start' ? { start: typed, end: other } : { start: other, end: typed };
    if (value2.start !== startIso || value2.end !== endIso) {
      commit(value2);
    }
  };

  const handleInputKeyPress = (event: TextInputKeyPressEvent, which: 'start' | 'end'): void => {
    // `TextInputKeyPressEvent` carries no modifier flags, so Alt+ArrowDown and ArrowDown
    // are the same event here and both simply open the calendar.
    if (event.nativeEvent.key === 'ArrowDown' && !isOpen) {
      openAnchor.current = which;
      changeOpen(true);
    }
  };

  // ---- the month grid ---------------------------------------------------------------

  const gridStart = React.useMemo(() => {
    const first: CalendarDate = { year: viewMonth.year, month: viewMonth.month, day: 1 };
    const offset = (weekdayOf(first) - weekStart + DAYS_PER_WEEK) % DAYS_PER_WEEK;
    return addDays(first, -offset);
  }, [viewMonth, weekStart]);

  const weeks = React.useMemo(() => {
    const rows: CalendarDate[][] = [];
    for (let week = 0; week < WEEKS_SHOWN; week++) {
      const row: CalendarDate[] = [];
      for (let index = 0; index < DAYS_PER_WEEK; index++) {
        row.push(addDays(gridStart, week * DAYS_PER_WEEK + index));
      }
      rows.push(row);
    }
    return rows;
  }, [gridStart]);

  const weekdayNames = React.useMemo(
    () => Array.from({ length: DAYS_PER_WEEK }, (_unused, index) => weekdayFormat.format(toUtc(addDays(gridStart, index)))),
    [weekdayFormat, gridStart],
  );

  // While a range draft is pending only that day shows; the committed value waits.
  const shownStart = range && pendingStart !== null ? pendingStart : startIso;
  const shownEnd = range && pendingStart !== null ? '' : range ? endIso : '';

  const monthOptions = React.useMemo<ListboxItem[]>(
    () =>
      Array.from({ length: 12 }, (_unused, index) => ({
        value: String(index + 1),
        label: monthFormat.format(toUtc({ year: viewMonth.year, month: index + 1, day: 1 })),
      })),
    [monthFormat, viewMonth.year],
  );

  const yearOptions = React.useMemo<ListboxItem[]>(() => {
    const currentYear = (parseIso(today) as CalendarDate).year;
    // Each bound falls back on its own, and the span always includes the displayed year
    // so the controlled Select has a matching option.
    const lowest = Math.min(parseIso(min ?? '')?.year ?? currentYear - YEARS_BACK, viewMonth.year);
    const highest = Math.max(parseIso(max ?? '')?.year ?? currentYear + YEARS_FORWARD, viewMonth.year);
    return Array.from({ length: highest - lowest + 1 }, (_unused, index) => ({
      value: String(lowest + index),
      label: String(lowest + index),
    }));
  }, [today, min, max, viewMonth.year]);

  const goToMonth = (year: number, month: number): void => {
    // Clamp the day away: the header only ever names a month.
    setViewMonth(fromUtc(Date.UTC(year, month - 1, 1)));
  };

  // ---- resolved bindings ------------------------------------------------------------

  const borderWidth = overrides?.borderWidth ? (resolveToken(t, overrides.borderWidth) as number) : t.borderWidthThin;
  const borderInvalid = overrides?.borderInvalid ? (resolveToken(t, overrides.borderInvalid) as string) : t.colorBorderDanger;
  const radius = overrides?.radius ? (resolveToken(t, overrides.radius) as number) : t.radiusMd;
  const paddingInline = overrides?.paddingInline ? (resolveToken(t, overrides.paddingInline) as number) : t[PADDING_INLINE_TOKEN[size]];
  const paddingBlock = overrides?.paddingBlock ? (resolveToken(t, overrides.paddingBlock) as number) : t[PADDING_BLOCK_TOKEN[size]];
  const fontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t[FONT_SIZE_TOKEN[size]];
  const calendarGap = overrides?.calendarGap ? (resolveToken(t, overrides.calendarGap) as number) : t.layoutGapNormal;
  const headerGap = overrides?.headerGap ? (resolveToken(t, overrides.headerGap) as number) : t.layoutGapTight;
  const footerGap = overrides?.footerGap ? (resolveToken(t, overrides.footerGap) as number) : t.layoutGapTight;
  const dayGap = overrides?.dayGap ? (resolveToken(t, overrides.dayGap) as number) : t.space0;
  const dayRadius = overrides?.dayRadius ? (resolveToken(t, overrides.dayRadius) as number) : t.radiusMd;
  const dayHover = overrides?.dayHover ? (resolveToken(t, overrides.dayHover) as string) : t.colorActionGhostBackgroundHover;
  const partGap = overrides?.partGap ? (resolveToken(t, overrides.partGap) as number) : t.space1;
  const fieldGap = overrides?.fieldGap ? (resolveToken(t, overrides.fieldGap) as number) : t.space2;
  const dayFontSize = overrides?.dayFontSize ? (resolveToken(t, overrides.dayFontSize) as number) : t.fontSizeSm;
  const fontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const lineHeight = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightNormal;
  const disabledOpacity = overrides?.disabledOpacity ? (resolveToken(t, overrides.disabledOpacity) as number) : t.opacityDisabled;
  const transition = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  // `daySize` is locked: every day cell is a comfortable square target.
  const daySize = t.sizeTargetComfortable;

  // The composed children realise the root's own bindings through their `overrides`; a
  // token is never resolved on a child's behalf.
  const helperOverrides = {
    fontSize: overrides?.helperSize,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };
  const labelOverrides = {
    fontSize: overrides?.fontSize,
    fontWeight: overrides?.labelWeight,
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
  };
  const titleOverrides = {
    fontSize: overrides?.monthTitleSize,
    fontWeight: overrides?.monthTitleWeight,
  };
  const weekdayOverrides = {
    fontSize: overrides?.weekdaySize,
    fontWeight: overrides?.weekdayWeight,
    fontFamily: overrides?.fontFamily,
  };
  const weekNumberOverrides = {
    fontSize: overrides?.weekNumberSize,
    fontWeight: overrides?.weekNumberWeight,
    fontFamily: overrides?.fontFamily,
  };
  const sheetOverrides = overrides?.calendarInset === undefined ? undefined : { inset: overrides.calendarInset };

  // The field's border is its focus ring: on focus it widens and the padding gives back
  // exactly the difference, so nothing shifts.
  const focusRingWidth = t.borderWidthFocus;

  const inputStyle = (which: 'start' | 'end'): TextStyle => {
    const focused = focusedInput === which;
    const currentBorderWidth = focused ? focusRingWidth : borderWidth;
    const growth = currentBorderWidth - borderWidth;
    return {
      flex: 1,
      minHeight: t[MIN_TARGET_TOKEN[size]],
      paddingHorizontal: Math.max(0, paddingInline - growth),
      paddingVertical: Math.max(0, paddingBlock - growth),
      borderWidth: currentBorderWidth,
      borderColor: isInvalid ? borderInvalid : focused ? t.colorBorderFocus : t.colorBorderStrong,
      borderRadius: radius,
      backgroundColor: t.colorBackground,
      color: t.colorForeground,
      fontFamily,
      fontSize,
      lineHeight: toLineHeight(fontSize, lineHeight),
    };
  };

  const groupStyle = React.useMemo<ViewStyle>(
    () => ({ flexDirection: 'column', gap: partGap, opacity: isDisabled ? disabledOpacity : 1 }),
    [partGap, isDisabled, disabledOpacity],
  );

  const visibleLabel = required ? `${label}${COPY.requiredIndicator}` : label;
  const accessibleName = fieldset === null ? visibleLabel : `${fieldset.legend}, ${visibleLabel}`;
  const hint = [description, displayedError].filter((part) => part !== undefined && part !== '').join(' ');
  const fieldPlaceholder = placeholder ?? pattern;
  const buttonSize = size === 'sm' ? 'sm' : 'md';

  const dayLabel = (iso: string, selected: boolean): string => {
    const parts = [fullFormat.format(toUtc(parseIso(iso) as CalendarDate))];
    if (iso === today) {
      parts.push(COPY.todayLabel);
    }
    if (selected) {
      parts.push(COPY.selected);
    }
    return parts.join(', ');
  };

  const renderInput = (which: 'start' | 'end'): React.JSX.Element => {
    const isEnd = which === 'end';
    const name2 = range ? `${accessibleName}, ${isEnd ? COPY.endLabel : COPY.startLabel}` : accessibleName;
    return (
      <TextInput
        ref={isEnd ? endInputRef : startInputRef}
        testID="DatePicker.input"
        style={inputStyle(which)}
        value={isEnd ? endText : startText}
        placeholder={fieldPlaceholder}
        placeholderTextColor={t.colorForegroundMuted}
        editable={!isDisabled}
        keyboardType="number-pad"
        accessibilityLabel={name2}
        accessibilityHint={hint === '' ? undefined : hint}
        accessibilityState={{ disabled: isDisabled }}
        // react-native-web 0.21 drops `accessibilityState`; this mirror is what reaches the DOM.
        aria-disabled={isDisabled}
        onChangeText={(next) => handleTyped(next, which)}
        onKeyPress={(event) => handleInputKeyPress(event, which)}
        onFocus={() => setFocusedInput(which)}
        onBlur={() => {
          setFocusedInput(null);
          // The inputs show the formatted value again, so a controlled owner that did not
          // update `value` sees the text revert.
          showValue(startIso, endIso);
          reportValidity(startText, endText, 'blur');
        }}
      />
    );
  };

  const footer = (
    <View testID="DatePicker.footer" style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: footerGap }}>
      <View testID="DatePicker.todayButton">
        <Button
          label={COPY.today}
          variant="ghost"
          size="sm"
          disabled={isDayDisabled(today)}
          onPress={() => pickDay(today)}
        />
      </View>
      <View testID="DatePicker.clearButton">
        <Button label={COPY.clear} variant="ghost" size="sm" onPress={handleClear} />
      </View>
    </View>
  );

  return (
    <View ref={ref} testID="DatePicker" style={groupStyle} aria-disabled={isDisabled}>
      {hideLabel ? null : (
        // Text takes no testID, so the part name lives on a wrapper View (as in Input).
        <View testID="DatePicker.label">
          <Text size={size} weight="medium" overrides={labelOverrides}>
            {visibleLabel}
          </Text>
        </View>
      )}
      {description === undefined || description === '' ? null : (
        <View testID="DatePicker.description">
          <Text size="sm" tone="muted" overrides={helperOverrides}>
            {description}
          </Text>
        </View>
      )}

      <View testID="DatePicker.field" style={{ flexDirection: 'row', alignItems: 'center', gap: fieldGap }}>
        {renderInput('start')}
        {range ? (
          <>
            <RNText
              accessibilityElementsHidden
              importantForAccessibility="no"
              style={{ color: t.colorForegroundMuted, fontFamily, fontSize }}
            >
              {RANGE_SEPARATOR}
            </RNText>
            {renderInput('end')}
          </>
        ) : null}
        <View testID="DatePicker.calendarButton">
          <Button
            label={range ? COPY.openRange : COPY.open}
            variant="ghost"
            iconOnly
            size={buttonSize}
            expanded={isOpen}
            disabled={isDisabled}
            leadingIcon={<Icon name="calendar" color={t.colorActionGhostForeground} />}
            onPress={() => changeOpen(true)}
          />
        </View>
      </View>

      {displayedError === undefined ? null : (
        <View
          testID="DatePicker.errorMessage"
          // Android announces through the live region; iOS through the effect above. A Form
          // with its own error summary announces instead, so both are silenced there.
          accessibilityLiveRegion={summarised ? 'none' : 'assertive'}
        >
          <Text size="sm" tone="danger" overrides={helperOverrides}>
            {displayedError}
          </Text>
        </View>
      )}

      {isOpen ? (
        <View testID="DatePicker.popover">
          <BottomSheet
            open
            heading={label}
            height="content"
            footer={footer}
            onClose={() => changeOpen(false)}
            overrides={sheetOverrides}
          >
            <View style={{ gap: calendarGap }}>
              <View testID="DatePicker.header" style={{ flexDirection: 'row', alignItems: 'center', gap: headerGap }}>
                <View testID="DatePicker.prevMonthButton">
                  <Button
                    label={COPY.previousMonth}
                    variant="ghost"
                    iconOnly
                    size="sm"
                    leadingIcon={<Icon name="chevron-left" color={t.colorActionGhostForeground} />}
                    onPress={() => goToMonth(viewMonth.year, viewMonth.month - 1)}
                  />
                </View>
                {/*
                  The month and year Selects are internal controls, not fields: the Form
                  context is cut here so they never register with an enclosing Form.
                */}
                <FormContext.Provider value={null}>
                  <View testID="DatePicker.monthSelect" style={{ flex: 1 }}>
                    <Select
                      label={COPY.month}
                      name="month"
                      hideLabel
                      size="sm"
                      options={monthOptions}
                      value={String(viewMonth.month)}
                      overrides={titleOverrides}
                      onChange={(next) => {
                        if (typeof next === 'string') {
                          goToMonth(viewMonth.year, Number(next));
                        }
                      }}
                    />
                  </View>
                  <View testID="DatePicker.yearSelect" style={{ flex: 1 }}>
                    <Select
                      label={COPY.year}
                      name="year"
                      hideLabel
                      size="sm"
                      options={yearOptions}
                      value={String(viewMonth.year)}
                      overrides={titleOverrides}
                      onChange={(next) => {
                        if (typeof next === 'string') {
                          goToMonth(Number(next), viewMonth.month);
                        }
                      }}
                    />
                  </View>
                </FormContext.Provider>
                <View testID="DatePicker.nextMonthButton">
                  <Button
                    label={COPY.nextMonth}
                    variant="ghost"
                    iconOnly
                    size="sm"
                    leadingIcon={<Icon name="chevron-right" color={t.colorActionGhostForeground} />}
                    onPress={() => goToMonth(viewMonth.year, viewMonth.month + 1)}
                  />
                </View>
              </View>

              <View testID="DatePicker.grid" accessibilityLabel={gridLabel} style={{ gap: dayGap }}>
                <View style={{ flexDirection: 'row', gap: dayGap }}>
                  {showWeekNumbers ? (
                    // The week column's header carries no part name, as on web.
                    <View style={{ width: daySize, alignItems: 'center' }}>
                      <Text size="xs" tone="muted" weight="medium" overrides={weekdayOverrides}>
                        {COPY.weekNumber}
                      </Text>
                    </View>
                  ) : null}
                  {weekdayNames.map((weekday) => (
                    <View key={weekday} testID="DatePicker.weekdayHeader" style={{ width: daySize, alignItems: 'center' }}>
                      <Text size="xs" tone="muted" weight="medium" overrides={weekdayOverrides}>
                        {weekday}
                      </Text>
                    </View>
                  ))}
                </View>
                {weeks.map((week) => {
                  const first = week[0] as CalendarDate;
                  return (
                    <View key={toIso(first)} style={{ flexDirection: 'row', gap: dayGap }}>
                      {showWeekNumbers ? (
                        // Text takes no accessibilityLabel, so the name sits on an accessible wrapper.
                        <View
                          testID="DatePicker.weekNumber"
                          accessible
                          accessibilityLabel={`${COPY.weekNumber} ${isoWeekOf(first)}`}
                          style={{ width: daySize, alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text size="xs" tone="muted" weight="regular" overrides={weekNumberOverrides}>
                            {isoWeekOf(first)}
                          </Text>
                        </View>
                      ) : null}
                      {week.map((date) => {
                        const iso = toIso(date);
                        // In a range every day from start to end is "selected" for assistive
                        // technology, but only the two ends take the selected fill.
                        const isEnd = iso === shownStart || (shownEnd !== '' && iso === shownEnd);
                        const between = shownStart !== '' && shownEnd !== '' && iso > shownStart && iso < shownEnd;
                        return (
                          <DayCell
                            key={iso}
                            iso={iso}
                            day={date.day}
                            label={dayLabel(iso, isEnd || between)}
                            outsideMonth={date.month !== viewMonth.month}
                            selected={isEnd}
                            inRange={between}
                            today={iso === today}
                            disabled={isDayDisabled(iso)}
                            daySize={daySize}
                            dayRadius={dayRadius}
                            dayFontSize={dayFontSize}
                            dayHover={dayHover}
                            fontFamily={fontFamily}
                            lineHeight={lineHeight}
                            duration={transition}
                            onPress={pickDay}
                          />
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </View>
          </BottomSheet>
        </View>
      ) : null}
    </View>
  );
}
