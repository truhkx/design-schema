import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FormContext, useFormContext } from './FormContext';
import { Icon } from './Icon';
import type { ListboxOption } from './Listbox';
import { Popover, type PopoverOpenChangeReason } from './Popover';
import { Select, type SelectOverridableBinding } from './Select';
import { Stack } from './Stack';
import { Text, type TextOverridableBinding } from './Text';
import './DatePicker.css';

export type DatePickerRangeValue = { start: string; end: string };
export type DatePickerValue = string | DatePickerRangeValue;
export type DatePickerSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}`/`{month}`/`{year}`/`{pattern}`/`{min}`/`{max}` are replaced as noted. */
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
  gridLabel: '{label}, {month} {year}',
  selected: 'selected',
  todayLabel: 'today',
  startLabel: 'Start date',
  endLabel: 'End date',
  required: '{label} is required.',
  invalid: '{label} must be a valid date ({pattern}).',
  tooEarly: '{label} must be on or after {min}.',
  tooLate: '{label} must be on or before {max}.',
  rangeOrder: 'End date must be after the start date.',
  requiredIndicator: ' (required)',
};

function interpolate(template: string, vars: Record<string, string>): string {
  return Object.keys(vars).reduce((acc, key) => acc.split(`{${key}}`).join(vars[key]), template);
}

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/**
 * labelWeight/helperSize forward into the composed label/description Text's own overrides, like
 * Select and NumberInput; monthTitleSize forwards into the composed month/year Select's own
 * `fontSize` override — Select has no `fontWeight` override to forward monthTitleWeight into, so
 * that binding only ever reaches the (non-rendering) root hook.
 */
const ROOT_OVERRIDE_HOOK: Partial<Record<DatePickerOverridableBinding, string | undefined>> = {
  borderFocus: '--ds-date-picker-border-focus',
  borderInvalid: '--ds-date-picker-border-invalid',
  borderWidth: '--ds-date-picker-border-width',
  radius: '--ds-date-picker-radius',
  paddingInline: '--ds-date-picker-padding-inline',
  paddingBlock: '--ds-date-picker-padding-block',
  paddingBlockSm: '--ds-date-picker-padding-block-sm',
  paddingInlineSm: '--ds-date-picker-padding-inline-sm',
  calendarInset: '--ds-date-picker-calendar-inset',
  calendarGap: '--ds-date-picker-calendar-gap',
  daySize: '--ds-date-picker-day-size',
  dayGap: '--ds-date-picker-day-gap',
  dayRadius: '--ds-date-picker-day-radius',
  dayHover: '--ds-date-picker-day-hover',
  dayTodayBorderWidth: '--ds-date-picker-day-today-border-width',
  weekdaySize: '--ds-date-picker-weekday-size',
  weekdayWeight: '--ds-date-picker-weekday-weight',
  monthTitleSize: '--ds-date-picker-month-title-size',
  monthTitleWeight: '--ds-date-picker-month-title-weight',
  partGap: '--ds-date-picker-part-gap',
  fieldGap: '--ds-date-picker-field-gap',
  dayFontSize: '--ds-date-picker-day-font-size',
  minTargetSm: '--ds-date-picker-min-target-sm',
  disabledOpacity: '--ds-date-picker-disabled-opacity',
  transition: '--ds-date-picker-transition',
};

function resolveOverrides(overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
  monthSelectOverrides: Partial<Record<SelectOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const labelOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const descriptionOverrides: Partial<Record<TextOverridableBinding, TokenRef | undefined>> = {};
  const monthSelectOverrides: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> = {};

  for (const binding of Object.keys(overrides) as DatePickerOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    if (binding === 'labelWeight') {
      labelOverrides.fontWeight = ref;
      continue;
    }
    if (binding === 'helperSize') {
      descriptionOverrides.fontSize = ref;
      continue;
    }
    if (binding === 'monthTitleSize') {
      monthSelectOverrides.fontSize = ref;
      rootStyle[ROOT_OVERRIDE_HOOK.monthTitleSize!] = cssVar(ref);
      continue;
    }
    if (binding === 'fontFamily') {
      rootStyle['--ds-date-picker-font-family'] = cssVar(ref); // literal-ok: CSS custom-property hook name, not a font stack
      labelOverrides.fontFamily = ref;
      descriptionOverrides.fontFamily = ref;
      continue;
    }
    if (binding === 'lineHeight') {
      rootStyle['--ds-date-picker-line-height'] = cssVar(ref);
      labelOverrides.lineHeight = ref;
      descriptionOverrides.lineHeight = ref;
      continue;
    }
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) rootStyle[hook] = cssVar(ref);
  }

  return { rootStyle: rootStyle as CSSProperties, labelOverrides, descriptionOverrides, monthSelectOverrides };
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

type ISODate = string;
type YearMonth = { year: number; month: number };

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/** Parses `YYYY-MM-DD`, rejecting out-of-range values (e.g. `2026-02-30`). */
function parseISO(iso: ISODate | undefined): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

function toISO(year: number, month: number, day: number): ISODate {
  const date = new Date(Date.UTC(year, month, day));
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function addDays(iso: ISODate, delta: number): ISODate {
  const p = parseISO(iso)!;
  return toISO(p.year, p.month, p.day + delta);
}

function addMonths(iso: ISODate, delta: number): ISODate {
  const p = parseISO(iso)!;
  return toISO(p.year, p.month + delta, p.day);
}

function addYears(iso: ISODate, delta: number): ISODate {
  const p = parseISO(iso)!;
  return toISO(p.year + delta, p.month, p.day);
}

function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function todayISO(): ISODate {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** ISO 8601 firstDay (1=Monday…7=Sunday) → JS getDay() convention (0=Sunday…6=Saturday). */
function getFirstDayOfWeek(locale: string | undefined): number {
  try {
    const resolvedLocale = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
    const localeObject = new Intl.Locale(resolvedLocale) as Intl.Locale & {
      getWeekInfo?: (() => { firstDay: number }) | undefined;
      weekInfo?: { firstDay: number } | undefined;
    };
    const firstDay = localeObject.getWeekInfo?.().firstDay ?? localeObject.weekInfo?.firstDay;
    if (typeof firstDay === 'number') return firstDay % 7;
  } catch {
    // Intl.Locale / getWeekInfo unsupported in this engine — Sunday is the documented fallback.
  }
  return 0;
}

function getMonthNames(locale: string | undefined): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(Date.UTC(2000, month, 1))));
}

/** 2000-01-02 is a Sunday (UTC); walking forward from it yields every weekday in order. */
function getWeekdayNames(locale: string | undefined, firstDayOfWeek: number): { short: string; full: string }[] {
  const shortFormatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const fullFormatter = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.UTC(2000, 0, 2 + ((firstDayOfWeek + i) % 7)));
    return { short: shortFormatter.format(date), full: fullFormatter.format(date) };
  });
}

function isoWeekNumber(iso: ISODate): number {
  const p = parseISO(iso)!;
  const date = new Date(Date.UTC(p.year, p.month, p.day));
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday=0…Sunday=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

function buildGridDays(year: number, month: number, firstDayOfWeek: number): ISODate[] {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const offset = (firstWeekday - firstDayOfWeek + 7) % 7;
  const start = addDays(toISO(year, month, 1), -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

type PatternToken = { kind: 'month' | 'day' | 'year' } | { kind: 'literal'; value: string };

function getPatternTokens(locale: string | undefined): PatternToken[] {
  const parts = new Intl.DateTimeFormat(locale).formatToParts(new Date(2000, 0, 2));
  const tokens: PatternToken[] = [];
  for (const part of parts) {
    if (part.type === 'month') tokens.push({ kind: 'month' });
    else if (part.type === 'day') tokens.push({ kind: 'day' });
    else if (part.type === 'year') tokens.push({ kind: 'year' });
    else if (part.type === 'literal') tokens.push({ kind: 'literal', value: part.value });
  }
  return tokens;
}

function tokenText(token: PatternToken): string {
  if (token.kind === 'literal') return token.value;
  if (token.kind === 'month') return 'MM';
  if (token.kind === 'day') return 'DD';
  return 'YYYY';
}

function patternPlaceholder(tokens: PatternToken[]): string {
  return tokens.map(tokenText).join('');
}

/**
 * Lenient typed-date parsing: separators are optional (either the pattern's own literals, typed
 * verbatim, or one unbroken run of digits), and two-digit years are refused. Returns `undefined`
 * for anything incomplete or invalid rather than throwing, so callers can treat it as "not yet".
 */
function parseTypedDate(raw: string, tokens: PatternToken[]): ISODate | undefined {
  const order = tokens.filter((t): t is Extract<PatternToken, { kind: 'month' | 'day' | 'year' }> => t.kind !== 'literal');
  const groups = raw.split(/[^0-9]+/).filter(Boolean);
  let month: string | undefined;
  let day: string | undefined;
  let year: string | undefined;

  if (groups.length === order.length) {
    order.forEach((token, i) => {
      if (token.kind === 'month') month = groups[i];
      else if (token.kind === 'day') day = groups[i];
      else year = groups[i];
    });
  } else if (groups.length === 1) {
    const lengths = order.map((t) => (t.kind === 'year' ? 4 : 2));
    if (groups[0]!.length !== lengths.reduce((a, b) => a + b, 0)) return undefined;
    let cursor = 0;
    order.forEach((token, i) => {
      const slice = groups[0]!.slice(cursor, cursor + lengths[i]!);
      cursor += lengths[i]!;
      if (token.kind === 'month') month = slice;
      else if (token.kind === 'day') day = slice;
      else year = slice;
    });
  } else {
    return undefined;
  }

  if (!month || !day || !year || year.length !== 4) return undefined;
  const parsed = parseISO(`${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return parsed ? toISO(parsed.year, parsed.month, parsed.day) : undefined;
}

function formatTypedDate(iso: ISODate | undefined, locale: string | undefined): string {
  const p = parseISO(iso);
  return p ? new Intl.DateTimeFormat(locale).format(new Date(Date.UTC(p.year, p.month, p.day))) : '';
}

function formatFullDate(iso: ISODate, locale: string | undefined): string {
  const p = parseISO(iso)!;
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(p.year, p.month, p.day)),
  );
}

function isDayDisabled(
  iso: ISODate,
  min: string | undefined,
  max: string | undefined,
  isDateDisabled: ((isoDate: string) => boolean) | undefined,
): boolean {
  if (min && compareISO(iso, min) < 0) return true;
  if (max && compareISO(iso, max) > 0) return true;
  return isDateDisabled?.(iso) ?? false;
}

/** Steps in `delta`'s direction until an enabled day is found — "disabled days are skipped by keyboard movement". */
function stepToEnabled(from: ISODate, delta: (iso: ISODate) => ISODate, disabled: (iso: ISODate) => boolean, maxSteps = 1000): ISODate {
  let candidate = delta(from);
  let steps = 0;
  while (disabled(candidate) && steps < maxSteps) {
    candidate = delta(candidate);
    steps += 1;
  }
  return candidate;
}

export interface DatePickerProps
  extends Omit<
    ComponentPropsWithoutRef<'input'>,
    | 'type'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'placeholder'
    | 'min'
    | 'max'
    | 'required'
    | 'disabled'
    | 'size'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'children'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
  > {
  /** Visible label ("Start date", "Date of birth"). */
  label: string;
  /** Field name for the Form. The value is an ISO calendar date string, or `{ start, end }` for a range. */
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
  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by keyboard movement. */
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
  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it: a DataGrid cell editor, a Search. */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Portal target for the calendar's DOM node. Defaults to `document.body`. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with undefined when cleared. */
  onChange?: ((value: DatePickerValue | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * DatePicker — Design Schema, category: input.
 *
 * When to use:
 * Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is
 * faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever
 * they exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is
 * possible instead of validating after the fact.
 */
export const DatePicker = function DatePicker({
  ref,
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
  container,
  overrides,
  onChange,
  onOpenChange,
  id: idProp,
  className,
  style,
  ...rest
}: DatePickerProps & { ref?: Ref<HTMLInputElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-date-picker${generatedId}`);
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const gridLabelId = `${id}-grid-label`;
  const startHiddenLabelId = `${id}-start-label`;
  const endHiddenLabelId = `${id}-end-label`;

  const isDisabled = disabled || (form?.disabled ?? false);
  const resolvedError = error ?? form?.errors[name];
  const isInvalid = resolvedError !== undefined;

  const patternTokens = useMemo(() => getPatternTokens(locale), [locale]);
  const resolvedPlaceholder = placeholder ?? patternPlaceholder(patternTokens);
  const firstDayOfWeek = useMemo(() => getFirstDayOfWeek(locale), [locale]);
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);
  const weekdayNames = useMemo(() => getWeekdayNames(locale, firstDayOfWeek), [locale, firstDayOfWeek]);

  const startInputRef = useRef<HTMLInputElement | null>(null);
  const endInputRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => startInputRef.current as HTMLInputElement, []);

  const isControlled = value !== undefined;
  const initialStart = defaultValue !== undefined ? (typeof defaultValue === 'string' ? defaultValue : defaultValue.start) : undefined;
  const initialEnd = defaultValue !== undefined && typeof defaultValue !== 'string' ? defaultValue.end : undefined;
  const [internalStart, setInternalStart] = useState<ISODate | undefined>(initialStart);
  const [internalEnd, setInternalEnd] = useState<ISODate | undefined>(initialEnd);

  const committedStart = isControlled ? (typeof value === 'string' ? value : value?.start) : internalStart;
  const committedEnd = isControlled ? (typeof value === 'string' ? undefined : value?.end) : internalEnd;

  const latestStartRef = useRef(committedStart);
  latestStartRef.current = committedStart;
  const latestEndRef = useRef(committedEnd);
  latestEndRef.current = committedEnd;

  function applyStart(next: ISODate | undefined) {
    if (!isControlled) setInternalStart(next);
    latestStartRef.current = next;
  }
  function applyEnd(next: ISODate | undefined) {
    if (!isControlled) setInternalEnd(next);
    latestEndRef.current = next;
  }
  function fireChange() {
    const s = latestStartRef.current;
    const e = latestEndRef.current;
    const logical: DatePickerValue | undefined = range ? (s && e ? { start: s, end: e } : undefined) : s;
    onChange?.(logical);
    if (form && form.validate === 'change') {
      form.validateField(name);
      if (range) form.validateField(`${name}-end`);
    }
  }

  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpenControlled ? openProp : internalOpen;
  const [pendingRangeStart, setPendingRangeStart] = useState<ISODate | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState<YearMonth>(() => {
    const p = parseISO(committedStart) ?? parseISO(todayISO())!;
    return { year: p.year, month: p.month };
  });
  const [focusedDate, setFocusedDate] = useState<ISODate>(() => committedStart ?? todayISO());

  const dayRefs = useRef(new Map<ISODate, HTMLButtonElement>());
  const pendingFocusRef = useRef(open);

  function disabledCheck(iso: ISODate): boolean {
    return isDayDisabled(iso, min, max, isDateDisabled);
  }

  function retargetFocusedDate(nextYear: number, nextMonth: number) {
    setDisplayedMonth({ year: nextYear, month: nextMonth });
    setFocusedDate((prev) => {
      const p = parseISO(prev)!;
      const day = Math.min(p.day, daysInMonth(nextYear, nextMonth));
      return toISO(nextYear, nextMonth, day);
    });
  }

  function moveFocusTo(iso: ISODate) {
    const p = parseISO(iso)!;
    setFocusedDate(iso);
    setDisplayedMonth((prev) => (prev.year === p.year && prev.month === p.month ? prev : { year: p.year, month: p.month }));
    pendingFocusRef.current = true;
  }

  useLayoutEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    dayRefs.current.get(focusedDate)?.focus();
  });

  function openCalendar(focusTarget?: ISODate) {
    const target = focusTarget ?? committedStart ?? todayISO();
    const p = parseISO(target) ?? parseISO(todayISO())!;
    setDisplayedMonth({ year: p.year, month: p.month });
    setFocusedDate(toISO(p.year, p.month, p.day));
    pendingFocusRef.current = true;
    setPendingRangeStart(null);
    if (!isOpenControlled) setInternalOpen(true);
    onOpenChange?.(true);
  }

  function closeCalendar() {
    if (!isOpenControlled) setInternalOpen(false);
    setPendingRangeStart(null);
    onOpenChange?.(false);
  }

  function handlePopoverOpenChange(next: boolean, _reason: PopoverOpenChangeReason) {
    if (next) openCalendar();
    else closeCalendar();
  }

  function handleSelectDay(iso: ISODate) {
    if (disabledCheck(iso)) return;
    if (!range) {
      applyStart(iso);
      applyEnd(undefined);
      fireChange();
      closeCalendar();
      return;
    }
    if (pendingRangeStart === null) {
      setPendingRangeStart(iso);
      moveFocusTo(iso);
    } else if (compareISO(iso, pendingRangeStart) < 0) {
      setPendingRangeStart(iso);
      moveFocusTo(iso);
    } else {
      applyStart(pendingRangeStart);
      applyEnd(iso);
      fireChange();
      closeCalendar();
    }
  }

  function handleDayClick(iso: ISODate) {
    moveFocusTo(iso);
    handleSelectDay(iso);
  }

  function handleToday() {
    handleDayClick(todayISO());
  }

  function handleClear() {
    applyStart(undefined);
    applyEnd(undefined);
    setPendingRangeStart(null);
    fireChange();
  }

  function handleDayKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, iso: ISODate) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveFocusTo(stepToEnabled(iso, (d) => addDays(d, 1), disabledCheck));
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocusTo(stepToEnabled(iso, (d) => addDays(d, -1), disabledCheck));
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocusTo(stepToEnabled(iso, (d) => addDays(d, 7), disabledCheck));
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocusTo(stepToEnabled(iso, (d) => addDays(d, -7), disabledCheck));
        break;
      case 'Home': {
        event.preventDefault();
        const weekday = new Date(Date.UTC(parseISO(iso)!.year, parseISO(iso)!.month, parseISO(iso)!.day)).getUTCDay();
        const target = addDays(iso, -((weekday - firstDayOfWeek + 7) % 7));
        moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, 1), disabledCheck, 6) : target);
        break;
      }
      case 'End': {
        event.preventDefault();
        const weekday = new Date(Date.UTC(parseISO(iso)!.year, parseISO(iso)!.month, parseISO(iso)!.day)).getUTCDay();
        const target = addDays(iso, 6 - ((weekday - firstDayOfWeek + 7) % 7));
        moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, -1), disabledCheck, 6) : target);
        break;
      }
      case 'PageUp': {
        event.preventDefault();
        const target = event.shiftKey ? addYears(iso, -1) : addMonths(iso, -1);
        moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, -1), disabledCheck) : target);
        break;
      }
      case 'PageDown': {
        event.preventDefault();
        const target = event.shiftKey ? addYears(iso, 1) : addMonths(iso, 1);
        moveFocusTo(disabledCheck(target) ? stepToEnabled(target, (d) => addDays(d, 1), disabledCheck) : target);
        break;
      }
      default:
        break;
    }
  }

  function handleFieldKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (isDisabled || open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openCalendar();
    }
  }

  // --- Typed text state -----------------------------------------------------------------------
  const [startText, setStartText] = useState(() => formatTypedDate(committedStart, locale));
  const [endText, setEndText] = useState(() => formatTypedDate(committedEnd, locale));
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);
  const startTextInvalidRef = useRef(false);
  const endTextInvalidRef = useRef(false);

  useEffect(() => {
    if (startFocused) return;
    setStartText(formatTypedDate(committedStart, locale));
  }, [committedStart, locale, startFocused]);

  useEffect(() => {
    if (endFocused) return;
    setEndText(formatTypedDate(committedEnd, locale));
  }, [committedEnd, locale, endFocused]);

  function handleStartTextChange(event: ChangeEvent<HTMLInputElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    const raw = event.target.value;
    setStartText(raw);
    if (raw.trim() === '') {
      startTextInvalidRef.current = false;
      applyStart(undefined);
      fireChange();
      return;
    }
    const parsed = parseTypedDate(raw, patternTokens);
    startTextInvalidRef.current = parsed === undefined;
    if (parsed && !disabledCheck(parsed)) {
      applyStart(parsed);
      if (!range) {
        fireChange();
        if (open) retargetFocusedDate(parseISO(parsed)!.year, parseISO(parsed)!.month);
      } else if (committedEnd !== undefined) {
        fireChange();
      }
    }
  }

  function handleEndTextChange(event: ChangeEvent<HTMLInputElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    const raw = event.target.value;
    setEndText(raw);
    if (raw.trim() === '') {
      endTextInvalidRef.current = false;
      applyEnd(undefined);
      fireChange();
      return;
    }
    const parsed = parseTypedDate(raw, patternTokens);
    endTextInvalidRef.current = parsed === undefined;
    if (parsed && !disabledCheck(parsed) && committedStart !== undefined) {
      applyEnd(parsed);
      fireChange();
      if (open) retargetFocusedDate(parseISO(parsed)!.year, parseISO(parsed)!.month);
    }
  }

  function handleStartBlur(event: FocusEvent<HTMLInputElement>) {
    setStartFocused(false);
    onBlurNative(event, name);
  }
  function handleEndBlur(event: FocusEvent<HTMLInputElement>) {
    setEndFocused(false);
    onBlurNative(event, `${name}-end`);
  }
  function onBlurNative(_event: FocusEvent<HTMLInputElement>, fieldName: string) {
    if (form && (form.validate === 'blur' || form.validate === 'change')) form.validateField(fieldName);
  }

  // --- Form registration ------------------------------------------------------------------------
  const latest = useRef({ label, required, disabled: isDisabled, error, min, max });
  latest.current = { label, required, disabled: isDisabled, error, min, max };

  useEffect(() => {
    if (!form) return undefined;
    return form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => latestStartRef.current,
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, error: errorProp, min: currentMin, max: currentMax } = latest.current;
        if (errorProp !== undefined) return errorProp;
        const current = latestStartRef.current;
        if (isRequired && current === undefined) return interpolate(COPY.required, { label: currentLabel });
        if (current !== undefined && startTextInvalidRef.current) {
          return interpolate(COPY.invalid, { label: currentLabel, pattern: patternPlaceholder(patternTokens) });
        }
        if (current !== undefined && currentMin && compareISO(current, currentMin) < 0) {
          return interpolate(COPY.tooEarly, { label: currentLabel, min: formatTypedDate(currentMin, locale) });
        }
        if (current !== undefined && currentMax && compareISO(current, currentMax) > 0) {
          return interpolate(COPY.tooLate, { label: currentLabel, max: formatTypedDate(currentMax, locale) });
        }
        return null;
      },
      focus: () => startInputRef.current?.focus(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, name, id]);

  useEffect(() => {
    if (!form || !range) return undefined;
    return form.register({
      name: `${name}-end`,
      id: `${id}-end`,
      get label() {
        return `${latest.current.label} ${COPY.endLabel}`;
      },
      getValue: () => latestEndRef.current,
      isDisabled: () => latest.current.disabled,
      validate: () => {
        const { label: currentLabel, required: isRequired, error: errorProp, max: currentMax } = latest.current;
        if (errorProp !== undefined) return errorProp;
        const current = latestEndRef.current;
        if (isRequired && current === undefined) return interpolate(COPY.required, { label: currentLabel });
        if (current !== undefined && endTextInvalidRef.current) {
          return interpolate(COPY.invalid, { label: currentLabel, pattern: patternPlaceholder(patternTokens) });
        }
        if (current !== undefined && latestStartRef.current !== undefined && compareISO(current, latestStartRef.current) < 0) {
          return COPY.rangeOrder;
        }
        if (current !== undefined && currentMax && compareISO(current, currentMax) > 0) {
          return interpolate(COPY.tooLate, { label: currentLabel, max: formatTypedDate(currentMax, locale) });
        }
        return null;
      },
      focus: () => endInputRef.current?.focus(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, range, name, id]);

  if (isDev && !label) {
    console.warn('DatePicker: `label` is required and becomes the field’s accessible name.');
  }

  // --- Rendering ----------------------------------------------------------------------------------
  const { rootStyle, labelOverrides, descriptionOverrides, monthSelectOverrides } = overrides
    ? resolveOverrides(overrides)
    : { rootStyle: undefined, labelOverrides: undefined, descriptionOverrides: undefined, monthSelectOverrides: undefined };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const classes = ['ds-date-picker', `ds-date-picker--${size}`, isDisabled ? 'ds-date-picker--disabled' : null, className ?? null]
    .filter(Boolean)
    .join(' ');
  const labelClasses = ['ds-date-picker__label', hideLabel ? 'ds-date-picker__visually-hidden' : null].filter(Boolean).join(' ');

  const describedBy = [description ? descriptionId : null, resolvedError ? errorId : null].filter(Boolean).join(' ');

  const gridLabelText = interpolate(COPY.gridLabel, { label, month: monthNames[displayedMonth.month]!, year: String(displayedMonth.year) });

  const monthOptions: ListboxOption[] = monthNames.map((monthName, index) => ({ value: String(index), label: monthName }));
  const yearNow = todayISO().slice(0, 4);
  const minYear = min ? parseISO(min)!.year : Number(yearNow) - 100;
  const maxYear = max ? parseISO(max)!.year : Number(yearNow) + 50;
  const yearOptions: ListboxOption[] = Array.from({ length: Math.max(maxYear - minYear + 1, 1) }, (_, i) => {
    const y = minYear + i;
    return { value: String(y), label: String(y) };
  });

  const gridDays = buildGridDays(displayedMonth.year, displayedMonth.month, firstDayOfWeek);
  const today = todayISO();
  const rangeStartDisplay = range ? pendingRangeStart ?? committedStart : undefined;
  const rangeEndDisplay = range ? (pendingRangeStart ? undefined : committedEnd) : undefined;
  const todayDisabled = disabledCheck(today);

  dayRefs.current.clear();

  const calendarButton = (
    <Button
      variant="ghost"
      size={size}
      iconOnly
      label={range ? COPY.openRange : COPY.open}
      leadingIcon={<Icon name="calendar" inline />}
      disabled={isDisabled}
      data-part="calendarButton"
    />
  );

  return (
    <div className={classes} data-ds="DatePicker" data-ds-field style={mergedStyle}>
      {range ? (
        <span id={id} className={labelClasses} data-part="label">
          <Text element="span" weight="medium" overrides={labelOverrides}>
            {label}
            {required ? <span className="ds-date-picker__required">{COPY.requiredIndicator}</span> : null}
          </Text>
        </span>
      ) : (
        <label htmlFor={id} className={labelClasses} data-part="label">
          <Text element="span" weight="medium" overrides={labelOverrides}>
            {label}
            {required ? <span className="ds-date-picker__required">{COPY.requiredIndicator}</span> : null}
          </Text>
        </label>
      )}
      {description ? (
        <Text element="p" id={descriptionId} data-part="description" size="sm" tone="muted" overrides={descriptionOverrides}>
          {description}
        </Text>
      ) : null}
      <div className="ds-date-picker__field" data-part="field">
        {range ? (
          <>
            <span id={startHiddenLabelId} className="ds-date-picker__visually-hidden">
              {COPY.startLabel}
            </span>
            <input
              ref={startInputRef}
              id={`${id}-start`}
              name={name}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={startText}
              placeholder={resolvedPlaceholder}
              data-part="input"
              className="ds-date-picker__input"
              aria-labelledby={`${id} ${startHiddenLabelId}`}
              aria-describedby={describedBy || undefined}
              aria-invalid={isInvalid ? 'true' : undefined}
              aria-required={required ? 'true' : undefined}
              aria-disabled={isDisabled ? 'true' : undefined}
              readOnly={isDisabled}
              onChange={handleStartTextChange}
              onFocus={() => setStartFocused(true)}
              onBlur={handleStartBlur}
              onKeyDown={handleFieldKeyDown}
            />
            <span aria-hidden="true" className="ds-date-picker__separator" data-part="rangeSeparator">
              –
            </span>
            <span id={endHiddenLabelId} className="ds-date-picker__visually-hidden">
              {COPY.endLabel}
            </span>
            <input
              ref={endInputRef}
              id={`${id}-end`}
              name={`${name}-end`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={endText}
              placeholder={resolvedPlaceholder}
              data-part="input"
              className="ds-date-picker__input"
              aria-labelledby={`${id} ${endHiddenLabelId}`}
              aria-describedby={describedBy || undefined}
              aria-invalid={isInvalid ? 'true' : undefined}
              aria-required={required ? 'true' : undefined}
              aria-disabled={isDisabled ? 'true' : undefined}
              readOnly={isDisabled}
              onChange={handleEndTextChange}
              onFocus={() => setEndFocused(true)}
              onBlur={handleEndBlur}
              onKeyDown={handleFieldKeyDown}
            />
          </>
        ) : (
          <input
            {...rest}
            ref={startInputRef}
            id={id}
            name={name}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={startText}
            placeholder={resolvedPlaceholder}
            data-part="input"
            className="ds-date-picker__input"
            aria-describedby={describedBy || undefined}
            aria-invalid={isInvalid ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-disabled={isDisabled ? 'true' : undefined}
            readOnly={isDisabled}
            onChange={handleStartTextChange}
            onFocus={() => setStartFocused(true)}
            onBlur={handleStartBlur}
            onKeyDown={handleFieldKeyDown}
          />
        )}
        <Popover
          trigger={calendarButton}
          open={open}
          placement="bottom-start"
          dismissible={false}
          container={container}
          onOpenChange={handlePopoverOpenChange}
          overrides={{ inset: 'space.0' }}
        >
          <FormContext.Provider value={null}>
            <div className="ds-date-picker__calendar" data-part="popover">
              <span id={gridLabelId} className="ds-date-picker__visually-hidden">
                {gridLabelText}
              </span>
              <div className="ds-date-picker__header" data-part="header">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  label={COPY.previousMonth}
                  leadingIcon={<Icon name="chevron-left" inline />}
                  disabled={isDisabled}
                  data-part="prevMonthButton"
                  onClick={() => retargetFocusedDate(displayedMonth.month === 0 ? displayedMonth.year - 1 : displayedMonth.year, (displayedMonth.month + 11) % 12)}
                />
                <span className="ds-date-picker__header-select" data-part="monthSelect">
                  <Select
                    label={COPY.month}
                    hideLabel
                    size="sm"
                    name={`${id}-month`}
                    options={monthOptions}
                    value={String(displayedMonth.month)}
                    disabled={isDisabled}
                    overrides={monthSelectOverrides}
                    onChange={(v) => retargetFocusedDate(displayedMonth.year, Number(v as string))}
                  />
                </span>
                <span className="ds-date-picker__header-select" data-part="yearSelect">
                  <Select
                    label={COPY.year}
                    hideLabel
                    size="sm"
                    name={`${id}-year`}
                    options={yearOptions}
                    value={String(displayedMonth.year)}
                    disabled={isDisabled}
                    overrides={monthSelectOverrides}
                    onChange={(v) => retargetFocusedDate(Number(v as string), displayedMonth.month)}
                  />
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  label={COPY.nextMonth}
                  leadingIcon={<Icon name="chevron-right" inline />}
                  disabled={isDisabled}
                  data-part="nextMonthButton"
                  onClick={() => retargetFocusedDate(displayedMonth.month === 11 ? displayedMonth.year + 1 : displayedMonth.year, (displayedMonth.month + 1) % 12)}
                />
              </div>
              <table role="grid" aria-labelledby={gridLabelId} className="ds-date-picker__grid" data-part="grid">
                <thead>
                  <tr>
                    {showWeekNumbers ? (
                      <th scope="col" className="ds-date-picker__week-number-header">
                        <span className="ds-date-picker__visually-hidden">{COPY.weekNumber}</span>
                      </th>
                    ) : null}
                    {weekdayNames.map((weekday) => (
                      <th key={weekday.full} scope="col" abbr={weekday.full} data-part="weekdayHeader" className="ds-date-picker__weekday">
                        {weekday.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody key={`${displayedMonth.year}-${displayedMonth.month}`}>
                  {Array.from({ length: 6 }, (_, week) => {
                    const weekDays = gridDays.slice(week * 7, week * 7 + 7);
                    return (
                      <tr key={weekDays[0]}>
                        {showWeekNumbers ? (
                          <td className="ds-date-picker__week-number" data-part="weekNumber">
                            {isoWeekNumber(weekDays[0]!)}
                          </td>
                        ) : null}
                        {weekDays.map((iso) => {
                          const p = parseISO(iso)!;
                          const outsideMonth = p.month !== displayedMonth.month || p.year !== displayedMonth.year;
                          const isToday = iso === today;
                          const isSelected = iso === rangeStartDisplay || iso === rangeEndDisplay || (!range && iso === committedStart);
                          const isInRange =
                            range && rangeStartDisplay !== undefined && rangeEndDisplay !== undefined && compareISO(iso, rangeStartDisplay) > 0 && compareISO(iso, rangeEndDisplay) < 0;
                          const dayDisabled = disabledCheck(iso);
                          const dayClasses = [
                            'ds-date-picker__day',
                            outsideMonth ? 'ds-date-picker__day--outside' : null,
                            isSelected ? 'ds-date-picker__day--selected' : null,
                            isInRange ? 'ds-date-picker__day--in-range' : null,
                            isToday ? 'ds-date-picker__day--today' : null,
                          ]
                            .filter(Boolean)
                            .join(' ');
                          const status = [isToday ? COPY.todayLabel : null, isSelected ? COPY.selected : null].filter(Boolean).join(', ');
                          return (
                            <td key={iso} role="gridcell">
                              <button
                                ref={(node) => {
                                  if (node) dayRefs.current.set(iso, node);
                                }}
                                type="button"
                                tabIndex={iso === focusedDate ? 0 : -1}
                                className={dayClasses}
                                data-part="day"
                                aria-selected={isSelected ? 'true' : undefined}
                                aria-current={isToday ? 'date' : undefined}
                                aria-disabled={dayDisabled ? 'true' : undefined}
                                aria-label={status ? `${formatFullDate(iso, locale)}, ${status}` : formatFullDate(iso, locale)}
                                onClick={() => handleDayClick(iso)}
                                onKeyDown={(event) => handleDayKeyDown(event, iso)}
                              >
                                {p.day}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="ds-date-picker__footer" data-part="footer">
                <Stack direction="horizontal" gap="tight">
                  <Button variant="ghost" size="sm" label={COPY.today} disabled={isDisabled || todayDisabled} data-part="todayButton" onClick={handleToday} />
                  <Button variant="ghost" size="sm" label={COPY.clear} disabled={isDisabled} data-part="clearButton" onClick={handleClear} />
                </Stack>
              </div>
            </div>
          </FormContext.Provider>
        </Popover>
      </div>
      {resolvedError ? (
        <Text element="p" id={errorId} role="alert" data-part="errorMessage" size="sm" tone="danger">
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
};
