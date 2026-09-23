import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { FormContext, useFormContext } from './FormContext';
import { Icon } from './Icon';
import type { ListboxOption } from './Listbox';
import { Popover, type PopoverOverridableBinding } from './Popover';
import { Select, type SelectOverridableBinding } from './Select';
import { Text, type TextOverridableBinding } from './Text';
import './DatePicker.css';

/** A range value: two ISO calendar dates. */
export type DatePickerRangeValue = { start: string; end: string };
/** An ISO calendar date (`2026-09-10`), or a range of them. Never a Date object. */
export type DatePickerValue = string | DatePickerRangeValue;
export type DatePickerSize = 'sm' | 'md';

/** copy.* — used verbatim; `{label}`, `{month}`, `{year}`, `{pattern}`, `{min}` and `{max}` are the only interpolations. */
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
  rangeOrder: 'End date must be on or after the start date.',
  requiredIndicator: ' (required)',
};

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => params[key] ?? match);
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

/**
 * Hooks set inline on the root and on the portaled calendar (which the root's custom properties
 * cannot reach). Not here: `helperSize` (the description and error Text `fontSize`),
 * `monthTitleSize`/`monthTitleWeight` (the month and year Selects' `fontSize`/`fontWeight`) and
 * `calendarInset` (the composed Popover's `inset`, which pads the calendar panel).
 */
const OVERRIDE_HOOK: Partial<Record<DatePickerOverridableBinding, string>> = {
  borderInvalid: '--ds-date-picker-border-invalid',
  borderWidth: '--ds-date-picker-border-width',
  radius: '--ds-date-picker-radius',
  paddingInline: '--ds-date-picker-padding-inline',
  paddingBlock: '--ds-date-picker-padding-block',
  fontSize: '--ds-date-picker-font-size',
  calendarGap: '--ds-date-picker-calendar-gap',
  headerGap: '--ds-date-picker-header-gap',
  footerGap: '--ds-date-picker-footer-gap',
  dayGap: '--ds-date-picker-day-gap',
  dayRadius: '--ds-date-picker-day-radius',
  dayHover: '--ds-date-picker-day-hover',
  weekdaySize: '--ds-date-picker-weekday-size',
  weekdayWeight: '--ds-date-picker-weekday-weight',
  weekNumberSize: '--ds-date-picker-week-number-size',
  weekNumberWeight: '--ds-date-picker-week-number-weight',
  partGap: '--ds-date-picker-part-gap',
  fieldGap: '--ds-date-picker-field-gap',
  dayFontSize: '--ds-date-picker-day-font-size',
  fontFamily: '--ds-date-picker-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  lineHeight: '--ds-date-picker-line-height',
  labelWeight: '--ds-date-picker-label-weight',
  disabledOpacity: '--ds-date-picker-disabled-opacity',
  transition: '--ds-date-picker-transition',
};

type TextOverrides = Partial<Record<TextOverridableBinding, TokenRef | undefined>>;
type SelectOverrides = Partial<Record<SelectOverridableBinding, TokenRef | undefined>>;
type PopoverOverrides = Partial<Record<PopoverOverridableBinding, TokenRef | undefined>>;

function resolveOverrides(overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>>): {
  style: CSSProperties;
  helperOverrides: TextOverrides;
  selectOverrides: SelectOverrides;
  popoverOverrides: PopoverOverrides | undefined;
} {
  const style: Record<string, string> = {};
  const helperOverrides: TextOverrides = {};
  const selectOverrides: SelectOverrides = {};
  let popoverOverrides: PopoverOverrides | undefined;
  for (const binding of Object.keys(overrides) as DatePickerOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    // The description and error Text take exactly the two declared forwards, and nothing else.
    if (binding === 'helperSize') helperOverrides.fontSize = ref;
    if (binding === 'fontFamily') helperOverrides.fontFamily = ref;
    if (binding === 'monthTitleSize') selectOverrides.fontSize = ref;
    if (binding === 'monthTitleWeight') selectOverrides.fontWeight = ref;
    if (binding === 'calendarInset') popoverOverrides = { inset: ref };
    // Locked bindings have no entry here, so they are ignored if passed.
    const hook = OVERRIDE_HOOK[binding];
    if (hook) style[hook] = cssVar(ref);
  }
  return { style: style as CSSProperties, helperOverrides, selectOverrides, popoverOverrides };
}

/* --- Calendar dates: `YYYY-MM-DD` strings and Date.UTC arithmetic, never `new Date(string)`. --- */

type DateParts = { year: number; month: number; day: number };

function pad(num: number, length: number): string {
  return String(num).padStart(length, '0');
}

/** `YYYY-MM-DD` → parts (month 0-based), rejecting dates that do not exist (`2026-02-30`). */
function parseISO(iso: string | undefined): DateParts | null {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month || check.getUTCDate() !== day) return null;
  return { year, month, day };
}

function toISO(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(year, month, day));
  date.setUTCFullYear(year, month, day); // years 0–99 are not remapped to 1900s
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1, 2)}-${pad(date.getUTCDate(), 2)}`;
}

function partsOf(iso: string): DateParts {
  return parseISO(iso) ?? { year: 1970, month: 0, day: 1 };
}

function utcDate(iso: string): Date {
  const p = partsOf(iso);
  return new Date(Date.UTC(p.year, p.month, p.day));
}

function addDays(iso: string, delta: number): string {
  const p = partsOf(iso);
  return toISO(p.year, p.month, p.day + delta);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Same day `delta` months away, clamped to the target month's length (Jan 31 → Feb 28). */
function addMonths(iso: string, delta: number): string {
  const p = partsOf(iso);
  const total = p.month + delta;
  const year = p.year + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  return toISO(year, month, Math.min(p.day, daysInMonth(year, month)));
}

/** The device's calendar date today. */
function todayISO(): string {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}

/** First day of the week as `getUTCDay()` (0 = Sunday): `Intl.Locale.prototype.getWeekInfo()` where available, else Sunday. */
function firstDayOfWeek(locale: string | undefined): number {
  try {
    const info = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: (() => { firstDay: number }) | undefined;
      weekInfo?: { firstDay: number } | undefined;
    };
    const firstDay = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
    if (typeof firstDay === 'number') return firstDay % 7;
  } catch {
    // No Intl.Locale week data in this engine.
  }
  return 0;
}

/** ISO 8601 week number. */
function isoWeek(iso: string): number {
  const date = utcDate(iso);
  const weekday = (date.getUTCDay() + 6) % 7; // Monday = 0
  date.setUTCDate(date.getUTCDate() - weekday + 3); // the Thursday of this week decides its year
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

/* --- Typed text: the locale's numeric pattern from formatToParts. --- */

const FIELD_FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };

type Segment = 'year' | 'month' | 'day';
type Pattern = { order: Segment[]; text: string };

function localePattern(locale: string | undefined): Pattern {
  const order: Segment[] = [];
  let text = '';
  for (const part of new Intl.DateTimeFormat(locale, FIELD_FORMAT).formatToParts(new Date(Date.UTC(2000, 0, 2)))) {
    if (part.type === 'year' || part.type === 'month' || part.type === 'day') {
      order.push(part.type);
      text += part.type === 'year' ? 'YYYY' : part.type === 'month' ? 'MM' : 'DD';
    } else if (part.type === 'literal') {
      text += part.value;
    }
  }
  return { order, text };
}

function formatField(iso: string | undefined, locale: string | undefined): string {
  return iso && parseISO(iso) ? new Intl.DateTimeFormat(locale, FIELD_FORMAT).format(utcDate(iso)) : '';
}

/**
 * Lenient parse: any non-digit separates the parts (or none at all, as one run of 8 digits in the
 * pattern's order); two-digit years are refused. `undefined` for anything incomplete or not a real date.
 */
function parseTyped(raw: string, pattern: Pattern): string | undefined {
  const groups = raw.split(/\D+/).filter(Boolean);
  const found: Partial<Record<Segment, string>> = {};
  if (groups.length === 3) {
    pattern.order.forEach((segment, i) => {
      const group = groups[i];
      if (group !== undefined) found[segment] = group;
    });
  } else if (groups.length === 1 && groups[0]!.length === 8) {
    let cursor = 0;
    for (const segment of pattern.order) {
      const length = segment === 'year' ? 4 : 2;
      found[segment] = groups[0]!.slice(cursor, cursor + length);
      cursor += length;
    }
  } else {
    return undefined;
  }
  const { year, month, day } = found;
  if (!year || !month || !day || year.length !== 4 || month.length > 2 || day.length > 2) return undefined;
  const parsed = parseISO(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return parsed ? toISO(parsed.year, parsed.month, parsed.day) : undefined;
}

/** `''` is a controlled empty field: no date. */
function startOf(value: DatePickerValue | undefined): string | undefined {
  return value === undefined || value === '' ? undefined : typeof value === 'string' ? value : value.start || undefined;
}

function endOf(value: DatePickerValue | undefined): string | undefined {
  return value !== undefined && typeof value !== 'string' ? value.end || undefined : undefined;
}

function sameValue(a: DatePickerValue | undefined, b: DatePickerValue | undefined): boolean {
  return startOf(a) === startOf(b) && endOf(a) === endOf(b);
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
    | 'inputMode'
    | 'autoComplete'
    | 'readOnly'
    | 'aria-describedby'
    | 'aria-invalid'
    | 'aria-required'
    | 'aria-disabled'
    | 'className'
    | 'style'
    | 'children'
  > {
  /** Visible label ("Start date", "Date of birth"). */
  label: string;
  /**
   * Field name for the Form. The value is an ISO calendar date string (`2026-09-10`) or, for a
   * range, `{ start, end }` of them in `value` and `onChange`. The Form holds strings only, so a
   * range registers two fields, `name` (start) and `name-end` (end). Never a Date object: a
   * calendar date has no time zone.
   */
  name: string;
  /**
   * Controlled value (ISO date, or a range). Pass `''` for a controlled empty field; `undefined`
   * means uncontrolled. In a range the first pick is an internal draft shown only in the calendar:
   * `value` and the inputs keep showing the old value until the end is picked, then onChange
   * reports the range and the field returns to `value`.
   */
  value?: DatePickerValue | undefined;
  /** Initial value. */
  defaultValue?: DatePickerValue | undefined;
  /**
   * Controlled calendar state, for programmatic use and for stories and tests. Omit for the
   * button-driven default. Every change to open, by the user or by the parent, aims the calendar at
   * the value's month (or today's) and focuses the selected day (or today).
   */
  open?: boolean | undefined;
  /** Pick a start and an end date in one calendar; two inputs in the field. */
  range?: boolean | undefined;
  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  min?: string | undefined;
  /** Latest selectable date (ISO). */
  max?: string | undefined;
  /**
   * Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are
   * skipped by the Arrow keys (moving on in the same direction to the next enabled day, turning
   * pages, and staying put when none is left before min/max); Home, End, PageUp and PageDown land on
   * the computed day even when it is disabled. A disabled day can take focus but not be selected.
   */
  isDateDisabled?: ((isoDate: string) => boolean) | undefined;
  /**
   * BCP 47 locale for month and weekday names, the first day of the week, and the typed format.
   * Defaults to `document.documentElement.lang` when set, then the
   * `Intl.DateTimeFormat().resolvedOptions().locale` default. The typed pattern comes from
   * `formatToParts` with 2-digit month and day and a numeric year, so en-US is MM/DD/YYYY.
   */
  locale?: string | undefined;
  /** An ISO week-number column at the start of each row. */
  showWeekNumbers?: boolean | undefined;
  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  placeholder?: string | undefined;
  /** Helper text. */
  description?: string | undefined;
  /** Must have a value to submit. */
  required?: boolean | undefined;
  /**
   * Visually hide the label (it remains the accessible name). Only for a field whose context already
   * names it: a DataGrid cell editor, a Search. Hidden with the visually-hidden clip pattern.
   */
  hideLabel?: boolean | undefined;
  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type (`fontSize` at font.size.sm). */
  size?: DatePickerSize | undefined;
  /** Not editable, still readable. */
  disabled?: boolean | undefined;
  /** Error message; implies invalid. */
  error?: string | undefined;
  /** Portal target for the calendar. Defaults to `document.body`. Platform prop; never affects semantics. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a complete valid date (or range) is typed or picked, with the ISO value; with undefined when cleared. */
  onChange?: ((value: string | { start: string; end: string } | undefined) => void) | undefined;
  /** Fired when the calendar opens or closes. */
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * DatePicker — Design Schema, category: input.
 *
 * When to use:
 * Use a DatePicker for any date the user chooses: due dates, bookings, dates of birth (typing is
 * faster — the calendar is still there), report periods (`range`). Set `min` and `max` whenever they
 * exist and `isDateDisabled` for days that cannot be chosen, so the calendar shows what is possible
 * instead of validating after the fact.
 *
 * The root (`data-ds="DatePicker"`, and `ref`) wraps the label, field and error; the calendar is a
 * non-modal Popover portaled to `container`.
 */
export function DatePicker({
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
  locale: localeProp,
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
  onKeyDown,
  onBlur,
  ...rest
}: DatePickerProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const form = useFormContext();
  const generatedId = useId();
  const id = idProp ?? (form?.idBase ? `${form.idBase}-${name}` : `ds-date-picker${generatedId}`);
  const endId = `${id}-end`;
  const labelId = `${id}-label`;
  const startLabelId = `${id}-start-label`;
  const endLabelId = `${id}-end-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const gridLabelId = `${id}-grid-label`;

  // `document.documentElement.lang` is read after mount, never in render: the server has no document,
  // so the first client render must use the same default the server did.
  const [documentLang, setDocumentLang] = useState<string | undefined>(undefined);
  useLayoutEffect(() => {
    const lang = document.documentElement.lang;
    setDocumentLang(lang ? lang : undefined);
  }, []);
  const locale = localeProp ?? documentLang;
  const pattern = localePattern(locale);
  const isDisabled = disabled || (form?.disabled ?? false);

  /* --- Value ------------------------------------------------------------------------------------ */
  const isValueControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<DatePickerValue | undefined>(defaultValue);
  const committed = isValueControlled ? value : internalValue;
  const committedStart = startOf(committed);
  const committedEnd = endOf(committed);
  /** Advanced synchronously by `report`, so Form validation in the same event sees the new value. */
  const valueRef = useRef<DatePickerValue | undefined>(committed);
  valueRef.current = committed;

  const [startText, setStartText] = useState<string>(() => formatField(committedStart, locale));
  const [endText, setEndText] = useState<string>(() => formatField(committedEnd, locale));
  const textsRef = useRef({ start: startText, end: endText });
  textsRef.current = { start: startText, end: endText };

  // Reformat when the value or locale changes, except for the echo of the user's own complete typing.
  const synced = useRef({ start: committedStart, end: committedEnd, locale });
  useEffect(() => {
    const prev = synced.current;
    if (prev.start === committedStart && prev.end === committedEnd && prev.locale === locale) return;
    synced.current = { start: committedStart, end: committedEnd, locale };
    const keep = (text: string, iso: string | undefined): boolean =>
      prev.locale === locale && iso !== undefined && parseTyped(text, pattern) === iso;
    setStartText((text) => (keep(text, committedStart) ? text : formatField(committedStart, locale)));
    setEndText((text) => (keep(text, committedEnd) ? text : formatField(committedEnd, locale)));
  }, [committedStart, committedEnd, locale]);

  // The Form's mode decides when the field re-validates; after a failed submission every mode
  // re-validates on blur and on change, so a fixed field stops being flagged as the user types.
  const validateMode = form ? (form.validateMode ?? form.validate) : undefined;
  const afterFailedSubmit = form?.submitFailed ?? false;
  const validatesOnChange = validateMode === 'change' || afterFailedSubmit;
  const validatesOnBlur = validateMode === 'blur' || validateMode === 'change' || afterFailedSubmit;

  function report(next: DatePickerValue | undefined): void {
    valueRef.current = next;
    if (!isValueControlled) setInternalValue(next);
    onChange?.(next);
    if (form && validatesOnChange) form.validateField(name);
  }

  const dayDisabled = (iso: string): boolean =>
    (min !== undefined && iso < min) || (max !== undefined && iso > max) || (isDateDisabled?.(iso) ?? false);

  /* --- Calendar state --------------------------------------------------------------------------- */
  const isOpenControlled = openProp !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpenControlled ? openProp : internalOpen;

  const initialFocus = committedStart ?? todayISO();
  const [view, setView] = useState<{ year: number; month: number }>(() => partsOf(initialFocus));
  const [focusedDate, setFocusedDate] = useState<string>(initialFocus);
  /** The first pick of a range, until the second completes it. Not a value: nothing is reported. */
  const [pendingStart, setPendingStart] = useState<string | undefined>(undefined);
  /** Set by ArrowDown in the end input, so the calendar opens on the end date; reset after use. */
  const openedFrom = useRef<'start' | 'end'>('start');

  // Every change to `open`, by the user or by the parent, aims the calendar at the value's month (or
  // today's) and discards a pending range pick. Adjusted during render, so the first open frame is right.
  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    setPendingStart(undefined);
    const fromEnd = range && openedFrom.current === 'end';
    openedFrom.current = 'start';
    const target = (fromEnd ? committedEnd : undefined) ?? committedStart ?? todayISO();
    const p = partsOf(target);
    setView((prev) => (prev.year === p.year && prev.month === p.month ? prev : { year: p.year, month: p.month }));
    setFocusedDate(target);
  }

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const calendarButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusDayPending = useRef(false);
  const wasOpen = useRef(false);

  // Focus the roving day on open and after keyboard movement. The Popover opens with
  // `initialFocus="none"`, so this is the only focus move on open; it stays pending until the
  // portaled grid exists (the panel renders only once hydrated).
  useEffect(() => {
    if (open && !wasOpen.current) focusDayPending.current = true;
    wasOpen.current = open;
    if (!open) {
      focusDayPending.current = false;
      return;
    }
    if (!focusDayPending.current) return;
    const day = calendarRef.current?.querySelector<HTMLElement>('[data-part="day"][tabindex="0"]');
    if (!day) return;
    focusDayPending.current = false;
    day.focus();
  });

  function showDate(iso: string): void {
    const p = partsOf(iso);
    setView((prev) => (prev.year === p.year && prev.month === p.month ? prev : { year: p.year, month: p.month }));
    setFocusedDate(iso);
  }

  function moveFocusTo(iso: string): void {
    showDate(iso);
    focusDayPending.current = true;
  }

  function requestOpen(next: boolean): void {
    if (next === open || (next && isDisabled)) return;
    if (!isOpenControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  /** A pick, Today or Clear: reports, and rewrites the inputs even when the value is unchanged. */
  function commitPick(next: DatePickerValue | undefined): void {
    if (!isValueControlled || sameValue(next, valueRef.current)) {
      setStartText(formatField(startOf(next), locale));
      setEndText(formatField(endOf(next), locale));
    }
    report(next);
  }

  function showMonth(year: number, month: number): void {
    setView({ year, month });
    setFocusedDate((prev) => toISO(year, month, Math.min(partsOf(prev).day, daysInMonth(year, month))));
  }

  function selectDay(iso: string): void {
    if (isDisabled || dayDisabled(iso)) return;
    if (!range) {
      commitPick(iso);
      requestOpen(false);
      return;
    }
    // The first pick (or a pick before the pending start) starts a new range; the end may equal the start.
    if (pendingStart === undefined || iso < pendingStart) {
      setPendingStart(iso);
      moveFocusTo(iso);
      return;
    }
    commitPick({ start: pendingStart, end: iso });
    setPendingStart(undefined);
    requestOpen(false);
  }

  /** Empties the value (both ends), fires onChange(undefined) even when already empty, and stays open. */
  function clear(): void {
    if (isDisabled) return;
    setPendingStart(undefined);
    commitPick(undefined);
  }

  /* --- Typing ----------------------------------------------------------------------------------- */
  function handleTextChange(which: 'start' | 'end', event: ChangeEvent<HTMLInputElement>): void {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    const raw = event.target.value;
    if (which === 'start') setStartText(raw);
    else setEndText(raw);
    const texts = { ...textsRef.current, [which]: raw };
    textsRef.current = texts;

    const current = valueRef.current;
    if (!range) {
      if (raw.trim() === '') {
        if (current !== undefined) report(undefined);
        return;
      }
      const iso = parseTyped(raw, pattern);
      if (iso === undefined || iso === current) return;
      report(iso);
      showDate(iso);
      return;
    }

    if (texts.start.trim() === '' && texts.end.trim() === '') {
      if (current !== undefined) report(undefined);
      return;
    }
    const start = parseTyped(texts.start, pattern);
    const end = parseTyped(texts.end, pattern);
    const typed = which === 'start' ? start : end;
    if (typed !== undefined) showDate(typed);
    // A partial range changes nothing.
    if (start === undefined || end === undefined) return;
    if (startOf(current) === start && endOf(current) === end) return;
    report({ start, end });
  }

  function handleInputKeyDown(which: 'start' | 'end', event: ReactKeyboardEvent<HTMLInputElement>): void {
    onKeyDown?.(event);
    if (event.defaultPrevented || isDisabled || event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (open) {
      // Already open: move focus to that day — the pending range start, else the value, else today.
      const target =
        pendingStart ?? (which === 'end' ? (committedEnd ?? committedStart) : committedStart) ?? todayISO();
      moveFocusTo(target);
      return;
    }
    openedFrom.current = which;
    requestOpen(true);
  }

  /**
   * On blur the inputs show the formatted committed value, so a controlled owner that did not take
   * the typed date sees the text revert. Text that does not parse, and one end of an incomplete
   * range, are kept: they are what `copy.invalid` and `copy.required` report.
   */
  function handleInputBlur(event: FocusEvent<HTMLInputElement>): void {
    onBlur?.(event);
    const texts = textsRef.current;
    const current = valueRef.current;
    if (!range) {
      if (parseTyped(texts.start, pattern) !== undefined) setStartText(formatField(startOf(current), locale));
    } else if (parseTyped(texts.start, pattern) !== undefined && parseTyped(texts.end, pattern) !== undefined) {
      setStartText(formatField(startOf(current), locale));
      setEndText(formatField(endOf(current), locale));
    }
    if (form && validatesOnBlur) form.validateField(name);
  }

  /* --- Calendar keyboard ------------------------------------------------------------------------ */
  const weekStart = firstDayOfWeek(locale);

  /**
   * Arrow movement: steps by `delta` days until an enabled day, turning pages as needed. `undefined`
   * (stay put) once the step passes min or max; with no bound in that direction, after 3660 days
   * (about ten years) of disabled days.
   */
  function stepEnabled(from: string, delta: number): string | undefined {
    const bound = delta < 0 ? min : max;
    let candidate = from;
    for (let travelled = 0; bound !== undefined || travelled < 3660; travelled += Math.abs(delta)) {
      candidate = addDays(candidate, delta);
      if ((min !== undefined && candidate < min) || (max !== undefined && candidate > max)) return undefined;
      if (!dayDisabled(candidate)) return candidate;
    }
    return undefined;
  }

  function handleGridKeyDown(event: ReactKeyboardEvent<HTMLTableElement>): void {
    const iso = (event.target as HTMLElement).getAttribute('data-date');
    if (!iso || event.altKey || event.ctrlKey || event.metaKey) return;
    const offset = (utcDate(iso).getUTCDay() - weekStart + 7) % 7;
    let next: string | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = stepEnabled(iso, 1);
        break;
      case 'ArrowLeft':
        next = stepEnabled(iso, -1);
        break;
      case 'ArrowDown':
        next = stepEnabled(iso, 7);
        break;
      case 'ArrowUp':
        next = stepEnabled(iso, -7);
        break;
      // Home, End, PageUp and PageDown land on the computed day, even a disabled one.
      case 'Home':
        next = addDays(iso, -offset);
        break;
      case 'End':
        next = addDays(iso, 6 - offset);
        break;
      case 'PageUp':
        next = addMonths(iso, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(iso, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    moveFocusTo(next ?? iso);
  }

  // Tab cycles within the calendar (month/year controls, the grid's one stop, Today, Clear). Handled
  // before the Popover's own Tab-out, which skips an event whose default is already prevented.
  function handleCalendarKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    const calendar = calendarRef.current;
    const target = event.target;
    // React events bubble through portals: ignore Tab from a Select's own popup.
    if (!calendar || !(target instanceof HTMLElement) || !calendar.contains(target)) return;
    const stops = Array.from(calendar.querySelectorAll<HTMLElement>('button, input, select, [tabindex]')).filter(
      (element) => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[hidden], [inert]'),
    );
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (!first || !last) return;
    const index = stops.findIndex((element) => element === target || element.contains(target));
    const next = event.shiftKey
      ? index <= 0
        ? last
        : stops[index - 1]
      : index === -1 || index === stops.length - 1
        ? first
        : stops[index + 1];
    event.preventDefault();
    next?.focus();
  }

  /**
   * Escape closes the calendar wherever the focus is. The Popover only hears the key when focus is
   * inside its portaled panel (and then returns focus to the calendar button itself, once the state
   * changes); from the field — an input, or the calendar button, which is the trigger and so never
   * inside the panel — the keydown reaches this root instead, and focus stays where it is, since
   * Escape only takes back focus the calendar took. Popover stops propagation on the Escape it
   * handles, so exactly one of the two runs.
   */
  function handleRootKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Escape' || !open || event.defaultPrevented) return;
    event.preventDefault();
    requestOpen(false);
  }

  /* --- Form registration ------------------------------------------------------------------------ */
  const latest = useRef({ label, required, disabled: isDisabled, error, min, max, range, locale, pattern });
  latest.current = { label, required, disabled: isDisabled, error, min, max, range, locale, pattern };

  useEffect(() => {
    if (!form) return undefined;
    const unregisterStart = form.register({
      name,
      id,
      get label() {
        return latest.current.label;
      },
      getValue: () => (latest.current.disabled ? undefined : startOf(valueRef.current)),
      isDisabled: () => latest.current.disabled,
      // Only `name` reports the message, range included: one message must not be read twice.
      // error → required (every input empty) → invalid (any non-empty input unparseable) → required
      // (a range with one end empty; without `required` a partial range reports nothing) → tooEarly,
      // tooLate, rangeOrder. {min}/{max} are shown in the input's own pattern.
      validate: () => {
        const c = latest.current;
        if (c.error !== undefined && c.error !== '') return c.error;
        const texts = c.range ? [textsRef.current.start, textsRef.current.end] : [textsRef.current.start];
        const empty = texts.map((text) => text.trim() === '');
        if (empty.every(Boolean)) return c.required ? interpolate(COPY.required, { label: c.label }) : null;
        if (texts.some((text, i) => !empty[i] && parseTyped(text, c.pattern) === undefined)) {
          return interpolate(COPY.invalid, { label: c.label, pattern: c.pattern.text });
        }
        if (empty.some(Boolean)) return c.required ? interpolate(COPY.required, { label: c.label }) : null;
        const current = valueRef.current;
        const start = startOf(current);
        const end = endOf(current);
        if (c.min !== undefined && ((start !== undefined && start < c.min) || (end !== undefined && end < c.min))) {
          return interpolate(COPY.tooEarly, { label: c.label, min: formatField(c.min, c.locale) || c.min });
        }
        if (c.max !== undefined && ((start !== undefined && start > c.max) || (end !== undefined && end > c.max))) {
          return interpolate(COPY.tooLate, { label: c.label, max: formatField(c.max, c.locale) || c.max });
        }
        if (start !== undefined && end !== undefined && end < start) return COPY.rangeOrder;
        return null;
      },
      focus: () => document.getElementById(id)?.focus(),
    });
    const unregisterEnd = range
      ? form.register({
          name: `${name}-end`,
          id: endId,
          get label() {
            return `${latest.current.label}, ${COPY.endLabel}`;
          },
          getValue: () => (latest.current.disabled ? undefined : endOf(valueRef.current)),
          isDisabled: () => latest.current.disabled,
          validate: () => null,
          focus: () => document.getElementById(endId)?.focus(),
        })
      : undefined;
    return () => {
      unregisterStart();
      unregisterEnd?.();
    };
  }, [form, name, id, endId, range]);

  const warnedLabel = useRef(false);
  useEffect(() => {
    if (isDev && !label && !warnedLabel.current) {
      warnedLabel.current = true;
      console.warn('DatePicker: `label` is required; it is the field’s accessible name.');
    }
  }, [label]);

  /* --- Render ----------------------------------------------------------------------------------- */
  const resolvedError = error ?? form?.errors[name];
  const hasError = resolvedError !== undefined && resolvedError !== '';
  const describedBy = [description ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(' ') || undefined;

  const resolved = overrides ? resolveOverrides(overrides) : undefined;

  const classes = ['ds-date-picker', `ds-date-picker--${size}`, hasError ? 'ds-date-picker--invalid' : null, isDisabled ? 'ds-date-picker--disabled' : null]
    .filter(Boolean)
    .join(' ');

  const today = todayISO();
  const monthNameFormat = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const monthNames = Array.from({ length: 12 }, (_, month) => monthNameFormat.format(new Date(Date.UTC(2000, month, 1))));
  const shortWeekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const longWeekday = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  // 2000-01-02 was a Sunday.
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.UTC(2000, 0, 2 + ((weekStart + i) % 7)));
    return { short: shortWeekday.format(date), long: longWeekday.format(date) };
  });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' });

  const monthOptions: ListboxOption[] = monthNames.map((monthName, month) => ({ value: String(month), label: monthName }));
  const currentYear = partsOf(today).year;
  const minYear = Math.min(min && parseISO(min) ? partsOf(min).year : currentYear - 100, view.year);
  const maxYear = Math.max(max && parseISO(max) ? partsOf(max).year : currentYear + 10, view.year);
  const yearOptions: ListboxOption[] = Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: String(minYear + i),
    label: String(minYear + i),
  }));

  const firstOfMonth = toISO(view.year, view.month, 1);
  const gridStart = addDays(firstOfMonth, -((utcDate(firstOfMonth).getUTCDay() - weekStart + 7) % 7));
  const gridDays = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const rovingDate = gridDays.includes(focusedDate) ? focusedDate : firstOfMonth;

  // In a range, the pending first pick replaces the committed range while the calendar is open.
  const selectionStart = range ? (pendingStart ?? committedStart) : committedStart;
  const selectionEnd = range ? (pendingStart !== undefined ? undefined : committedEnd) : undefined;

  const gridLabel = interpolate(COPY.gridLabel, {
    label,
    month: monthNames[view.month] ?? '',
    year: String(view.year),
  });

  const inputProps = {
    type: 'text',
    inputMode: 'numeric',
    autoComplete: 'off',
    placeholder: placeholder ?? pattern.text,
    className: 'ds-date-picker__input',
    'data-part': 'input',
    'aria-describedby': describedBy,
    'aria-invalid': hasError ? 'true' : undefined,
    'aria-required': required ? 'true' : undefined,
    'aria-disabled': isDisabled ? 'true' : undefined,
    readOnly: isDisabled,
    onBlur: handleInputBlur,
  } as const;

  const calendarButton = (
    <Button
      ref={calendarButtonRef}
      variant="ghost"
      size={size}
      iconOnly
      label={range ? COPY.openRange : COPY.open}
      leadingIcon={<Icon name="calendar" inline />}
      disabled={isDisabled}
    />
  );

  return (
    <div
      ref={ref}
      className={classes}
      data-ds="DatePicker"
      data-ds-field=""
      style={resolved?.style}
      onKeyDown={handleRootKeyDown}
    >
      <label
        id={labelId}
        htmlFor={id}
        className={['ds-date-picker__label', hideLabel ? 'ds-date-picker__visually-hidden' : null].filter(Boolean).join(' ')}
        data-part="label"
      >
        {label}
        {required ? COPY.requiredIndicator : null}
      </label>
      {description ? (
        <Text
          element="p"
          id={descriptionId}
          size="sm"
          tone="muted"
          data-part="description"
          overrides={resolved?.helperOverrides}
        >
          {description}
        </Text>
      ) : null}
      <div className="ds-date-picker__field" data-part="field">
        {range ? (
          <>
            <span id={startLabelId} className="ds-date-picker__visually-hidden">
              {COPY.startLabel}
            </span>
            <input
              {...rest}
              {...inputProps}
              id={id}
              name={name}
              value={startText}
              aria-labelledby={`${labelId} ${startLabelId}`}
              onChange={(event) => handleTextChange('start', event)}
              onKeyDown={(event) => handleInputKeyDown('start', event)}
            />
            <span className="ds-date-picker__separator" aria-hidden="true">
              –
            </span>
            <span id={endLabelId} className="ds-date-picker__visually-hidden">
              {COPY.endLabel}
            </span>
            <input
              {...inputProps}
              id={endId}
              name={`${name}-end`}
              value={endText}
              aria-labelledby={`${labelId} ${endLabelId}`}
              onChange={(event) => handleTextChange('end', event)}
              onKeyDown={(event) => handleInputKeyDown('end', event)}
            />
          </>
        ) : (
          <input
            {...rest}
            {...inputProps}
            id={id}
            name={name}
            value={startText}
            onChange={(event) => handleTextChange('start', event)}
            onKeyDown={(event) => handleInputKeyDown('start', event)}
          />
        )}
        <span className="ds-date-picker__calendar-button" data-part="calendarButton">
          <Popover
            trigger={calendarButton}
            open={open}
            placement="bottom-start"
            initialFocus="none"
            dismissible={false}
            container={container}
            overrides={resolved?.popoverOverrides}
            onOpenChange={(next) => requestOpen(next)}
          >
            {/* Internal controls, not fields: the month and year Selects never register with a Form. */}
            <FormContext.Provider value={null}>
              <div
                ref={calendarRef}
                className="ds-date-picker__calendar"
                data-part="popover"
                style={resolved?.style}
                onKeyDown={handleCalendarKeyDown}
              >
                <div className="ds-date-picker__header" data-part="header">
                  <span data-part="prevMonthButton">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      label={COPY.previousMonth}
                      leadingIcon={<Icon name="chevron-left" inline />}
                      onClick={() => showMonth(view.month === 0 ? view.year - 1 : view.year, (view.month + 11) % 12)}
                    />
                  </span>
                  <span className="ds-date-picker__select" data-part="monthSelect">
                    <Select
                      label={COPY.month}
                      name={`${name}-month`}
                      hideLabel
                      size="sm"
                      options={monthOptions}
                      value={String(view.month)}
                      overrides={resolved?.selectOverrides}
                      onChange={(next) => showMonth(view.year, Number(next))}
                    />
                  </span>
                  <span className="ds-date-picker__select" data-part="yearSelect">
                    <Select
                      label={COPY.year}
                      name={`${name}-year`}
                      hideLabel
                      size="sm"
                      options={yearOptions}
                      value={String(view.year)}
                      overrides={resolved?.selectOverrides}
                      onChange={(next) => showMonth(Number(next), view.month)}
                    />
                  </span>
                  <span data-part="nextMonthButton">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      label={COPY.nextMonth}
                      leadingIcon={<Icon name="chevron-right" inline />}
                      onClick={() => showMonth(view.month === 11 ? view.year + 1 : view.year, (view.month + 1) % 12)}
                    />
                  </span>
                </div>
                <span id={gridLabelId} className="ds-date-picker__visually-hidden">
                  {gridLabel}
                </span>
                <table
                  role="grid"
                  aria-labelledby={gridLabelId}
                  className="ds-date-picker__grid"
                  data-part="grid"
                  onKeyDown={handleGridKeyDown}
                >
                  <thead>
                    <tr>
                      {showWeekNumbers ? (
                        <th scope="col" abbr={COPY.weekNumber} className="ds-date-picker__weekday">
                          <span className="ds-date-picker__visually-hidden">{COPY.weekNumber}</span>
                        </th>
                      ) : null}
                      {weekdays.map((weekday) => (
                        <th
                          key={weekday.long}
                          scope="col"
                          abbr={weekday.long}
                          className="ds-date-picker__weekday"
                          data-part="weekdayHeader"
                        >
                          {weekday.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }, (_, week) => {
                      const days = gridDays.slice(week * 7, week * 7 + 7);
                      const firstDay = days[0]!;
                      return (
                        <tr key={firstDay}>
                          {showWeekNumbers ? (
                            <th scope="row" className="ds-date-picker__week-number" data-part="weekNumber">
                              {isoWeek(firstDay)}
                            </th>
                          ) : null}
                          {days.map((iso) => {
                            const p = partsOf(iso);
                            const outside = p.month !== view.month;
                            const isToday = iso === today;
                            const isEndpoint = iso === selectionStart || iso === selectionEnd;
                            const inRange =
                              selectionStart !== undefined && selectionEnd !== undefined && iso > selectionStart && iso < selectionEnd;
                            const isSelected = isEndpoint || inRange;
                            const unavailable = dayDisabled(iso);
                            const status = [isToday ? COPY.todayLabel : null, isSelected ? COPY.selected : null]
                              .filter(Boolean)
                              .join(', ');
                            const dayClasses = [
                              'ds-date-picker__day',
                              outside ? 'ds-date-picker__day--outside' : null,
                              isEndpoint ? 'ds-date-picker__day--selected' : null,
                              inRange ? 'ds-date-picker__day--in-range' : null,
                              isToday ? 'ds-date-picker__day--today' : null,
                            ]
                              .filter(Boolean)
                              .join(' ');
                            return (
                              <td key={iso} role="gridcell" aria-selected={isSelected ? 'true' : undefined}>
                                <button
                                  type="button"
                                  className={dayClasses}
                                  data-part="day"
                                  data-date={iso}
                                  tabIndex={iso === rovingDate ? 0 : -1}
                                  aria-current={isToday ? 'date' : undefined}
                                  aria-disabled={unavailable ? 'true' : undefined}
                                  aria-label={status ? `${fullDate.format(utcDate(iso))}, ${status}` : fullDate.format(utcDate(iso))}
                                  onClick={() => {
                                    setFocusedDate(iso);
                                    selectDay(iso);
                                  }}
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
                  <span data-part="todayButton">
                    <Button
                      variant="ghost"
                      size="sm"
                      label={COPY.today}
                      disabled={dayDisabled(today)}
                      onClick={() => selectDay(today)}
                    />
                  </span>
                  <span data-part="clearButton">
                    <Button variant="ghost" size="sm" label={COPY.clear} onClick={clear} />
                  </span>
                </div>
              </div>
            </FormContext.Provider>
          </Popover>
        </span>
      </div>
      {hasError ? (
        <Text
          element="p"
          id={errorId}
          role="alert"
          size="sm"
          tone="danger"
          data-part="errorMessage"
          overrides={resolved?.helperOverrides}
        >
          {resolvedError}
        </Text>
      ) : null}
    </div>
  );
}
