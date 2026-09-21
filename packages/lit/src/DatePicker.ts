import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Text.js';
import './Icon.js';
import './Button.js';
import './Select.js';
import './Popover.js';
import type { DsPopover, PopoverOpenChangeDetail } from './Popover.js';
import type { SelectChangeDetail } from './Select.js';
import type { ListboxOption } from './Listbox.js';
import type { DsFormField } from './Form.js';

/** `value`/`defaultValue` shape: an ISO calendar date, or `{ start, end }` of them with `range`. Never a `Date` — a calendar date has no time zone. */
export type DatePickerValue = string | { start: string; end: string };

export type DatePickerSize = 'sm' | 'md';

/** Detail carried by the `change` CustomEvent. `undefined` when the value is cleared. */
export interface DatePickerChangeDetail {
  value: string | { start: string; end: string } | undefined;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface DatePickerOpenChangeDetail {
  open: boolean;
}

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `borderFocus`,
 * `rangeSeparatorColor`, `calendarSurface`, `daySize`,
 * `daySelectedBackground`, `daySelectedForeground`, `dayInRangeBackground`,
 * `dayTodayBorder`, `dayTodayBorderWidth`, `dayOutsideMonthColor`,
 * `weekdayColor`, `descriptionText`, `errorText`, `minTarget`, `minTargetSm`,
 * `focusRing` and `focusRingWidth` are locked and excluded.
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

const HOOKS: Record<DatePickerOverridableBinding, string> = {
  borderInvalid: '--ds-date-picker-border-invalid',
  borderWidth: '--ds-date-picker-border-width',
  radius: '--ds-date-picker-radius',
  paddingInline: '--ds-date-picker-padding-inline',
  paddingBlock: '--ds-date-picker-padding-block',
  fontSize: '--ds-date-picker-font-size',
  calendarInset: '--ds-date-picker-calendar-inset',
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
  monthTitleSize: '--ds-date-picker-month-title-size',
  monthTitleWeight: '--ds-date-picker-month-title-weight',
  partGap: '--ds-date-picker-part-gap',
  fieldGap: '--ds-date-picker-field-gap',
  dayFontSize: '--ds-date-picker-day-font-size',
  fontFamily: '--ds-date-picker-font-family', // literal-ok: CSS custom-property name, not a font stack
  lineHeight: '--ds-date-picker-line-height',
  labelWeight: '--ds-date-picker-label-weight',
  helperSize: '--ds-date-picker-helper-size',
  disabledOpacity: '--ds-date-picker-disabled-opacity',
  transition: '--ds-date-picker-transition',
};

/* copy.* — used verbatim */
const COPY_OPEN = 'Choose date';
const COPY_OPEN_RANGE = 'Choose dates';
const COPY_PREVIOUS_MONTH = 'Previous month';
const COPY_NEXT_MONTH = 'Next month';
const COPY_MONTH = 'Month';
const COPY_YEAR = 'Year';
const COPY_TODAY = 'Today';
const COPY_CLEAR = 'Clear';
const COPY_WEEK_NUMBER = 'Week';
const COPY_GRID_LABEL = (label: string, month: string, year: string): string => `${label}, ${month} ${year}`;
const COPY_SELECTED = 'selected';
const COPY_TODAY_LABEL = 'today';
const COPY_START_LABEL = 'Start date';
const COPY_END_LABEL = 'End date';
const COPY_REQUIRED = (label: string): string => `${label} is required.`;
const COPY_INVALID = (label: string, pattern: string): string => `${label} must be a valid date (${pattern}).`;
const COPY_TOO_EARLY = (label: string, min: string): string => `${label} must be on or after ${min}.`;
const COPY_TOO_LATE = (label: string, max: string): string => `${label} must be on or before ${max}.`;
const COPY_RANGE_ORDER = 'End date must be on or after the start date.';
const COPY_REQUIRED_INDICATOR = ' (required)';

/* ---- Pure calendar-date helpers. Always Date.UTC arithmetic on Y/M/D parts, never `new Date(string)`. ---- */

function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number);
  return { y: y!, m: m! - 1, d: d! };
}

function toISO(y: number, m: number, d: number): string {
  const date = new Date(Date.UTC(y, m, d));
  const yy = String(date.getUTCFullYear()).padStart(4, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function addDays(iso: string, delta: number): string {
  const { y, m, d } = parseISO(iso);
  return toISO(y, m, d + delta);
}

function addMonths(iso: string, delta: number): string {
  const { y, m, d } = parseISO(iso);
  const target = new Date(Date.UTC(y, m + delta, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return toISO(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d, lastDay));
}

function clampDayIntoMonth(year: number, month: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toISO(year, month, Math.min(day, lastDay));
}

/** "Today" is the user's local wall-clock date, not a UTC one. */
function todayISO(): string {
  const now = new Date();
  return toISO(now.getFullYear(), now.getMonth(), now.getDate());
}

function weekdayOf(iso: string): number {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m, d)).getUTCDay();
}

function utcDate(iso: string): Date {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m, d));
}

/** ISO 8601 week number, independent of the locale's first day of week. */
function isoWeekNumber(iso: string): number {
  const date = utcDate(iso);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - yearStart) / 86400000 / 7) + 1;
}

/** A usable BCP 47 tag, or `undefined` for the runtime default. */
function validLocale(tag: string | null | undefined): string | undefined {
  if (!tag) {
    return undefined;
  }
  try {
    return Intl.getCanonicalLocales(tag)[0];
  } catch {
    return undefined;
  }
}

/** 0 = Sunday … 6 = Saturday. `Intl.Locale.prototype.getWeekInfo` where supported, else Sunday. */
function firstDayOfWeek(locale: string | undefined): number {
  try {
    const resolved = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: (() => { firstDay: number }) | undefined;
      weekInfo?: { firstDay: number } | undefined;
    };
    const info = resolved.getWeekInfo?.() ?? resolved.weekInfo;
    if (info?.firstDay) {
      return info.firstDay % 7;
    }
  } catch {
    /* unsupported locale or API; fall through to the default */
  }
  return 0;
}

function monthName(locale: string | undefined, month: number): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, month, 1)));
}

/** `weekday` is 0 = Sunday … 6 = Saturday. 2023-01-01 (UTC) was a Sunday. */
function weekdayName(locale: string | undefined, weekday: number, width: 'short' | 'long'): string {
  return new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + weekday)));
}

const NUMERIC_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };

/** The typed format: the locale's numeric date. */
function formatNumeric(iso: string, locale: string | undefined): string {
  return new Intl.DateTimeFormat(locale, NUMERIC_OPTIONS).format(utcDate(iso));
}

/** A day's accessible name: the full date. */
function formatFullDate(iso: string, locale: string | undefined): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(utcDate(iso));
}

function localeParts(locale: string | undefined): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat(locale, NUMERIC_OPTIONS).formatToParts(new Date(Date.UTC(2030, 0, 5)));
}

/** e.g. "MM/DD/YYYY" or "DD.MM.YYYY", from `formatToParts`. */
function patternPlaceholder(locale: string | undefined): string {
  const map: Partial<Record<string, string>> = { day: 'DD', month: 'MM', year: 'YYYY' };
  return localeParts(locale)
    .map((part) => map[part.type] ?? part.value)
    .join('');
}

/** Lenient separators (optional), a real calendar date, and a four-digit year (two-digit years are refused). */
function parseTypedDate(text: string, locale: string | undefined): string | null {
  const order = localeParts(locale)
    .map((part) => part.type)
    .filter((type): type is 'day' | 'month' | 'year' => type === 'day' || type === 'month' || type === 'year');
  const trimmed = text.trim();
  let groups = trimmed.split(/[^0-9]+/).filter(Boolean);
  if (groups.length === 1 && /^[0-9]{8}$/.test(trimmed)) {
    // No separators: split by the locale's field widths (2/2/4 in its order).
    let offset = 0;
    groups = order.map((type) => {
      const width = type === 'year' ? 4 : 2;
      const group = trimmed.slice(offset, offset + width);
      offset += width;
      return group;
    });
  }
  if (groups.length !== 3 || order.length !== 3) {
    return null;
  }
  const values: Partial<Record<'day' | 'month' | 'year', number>> = {};
  for (let i = 0; i < 3; i += 1) {
    const raw = groups[i]!;
    const type = order[i]!;
    if (type === 'year' && raw.length !== 4) {
      return null;
    }
    values[type] = Number(raw);
  }
  const { day, month, year } = values;
  if (!day || !month || !year || month < 1 || month > 12) {
    return null;
  }
  const iso = toISO(year, month - 1, day);
  // A day that overflowed into the next month (Feb 30) is not a real date.
  return parseISO(iso).m === month - 1 ? iso : null;
}

/** Every day cell for the visible month in 7-day weeks, including the adjacent months' days that fill the grid. */
function getCalendarWeeks(year: number, month: number, weekStart: number): string[][] {
  const firstOfMonth = toISO(year, month, 1);
  const offset = (weekdayOf(firstOfMonth) - weekStart + 7) % 7;
  const start = addDays(firstOfMonth, -offset);
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const weeks: string[][] = [];
  for (let i = 0; i < totalCells; i += 7) {
    weeks.push(Array.from({ length: 7 }, (_, j) => addDays(start, i + j)));
  }
  return weeks;
}

function sameValue(a: DatePickerValue | null, b: DatePickerValue | null): boolean {
  if (a === null || b === null || typeof a === 'string' || typeof b === 'string') {
    return a === b;
  }
  return a.start === b.start && a.end === b.end;
}

/** What the `name-end` Form entry reads from its picker. */
interface EndFieldSource {
  name(): string;
  label(): string;
  required(): boolean;
  disabled(): boolean;
  value(): string | null;
  focus(): void;
}

/**
 * The range's second `<ds-form>` entry, `name-end`: a hidden light-DOM child
 * of the picker carrying `data-ds-field`. It always validates clean, since
 * `name` reports the combined message.
 */
class DsDatePickerEndField extends HTMLElement implements DsFormField {
  source: EndFieldSource | null = null;

  get name(): string {
    return this.source ? `${this.source.name()}-end` : '';
  }
  set name(_value: string) {
    /* derived from the picker's name */
  }

  get label(): string {
    return this.source?.label() ?? '';
  }
  set label(_value: string) {
    /* derived from the picker's label */
  }

  get required(): boolean {
    return this.source?.required() ?? false;
  }
  set required(_value: boolean) {
    /* derived from the picker */
  }

  get disabled(): boolean {
    return this.source?.disabled() ?? false;
  }
  set disabled(_value: boolean) {
    /* derived from the picker */
  }

  get currentValue(): string | null {
    return this.source?.value() ?? null;
  }

  readonly validationMessage: string = '';

  connectedCallback(): void {
    this.hidden = true;
    this.setAttribute('data-ds-field', '');
  }

  override focus(): void {
    this.source?.focus();
  }

  checkValidity(): boolean {
    return true;
  }
}

if (!customElements.get('ds-date-picker-end-field')) {
  customElements.define('ds-date-picker-end-field', DsDatePickerEndField);
}

/**
 * `<ds-date-picker>` — DatePicker (category: input, APG pattern: grid).
 *
 * `<ds-date-picker label="Due date" name="due" min="2026-01-01">`. Input's
 * wrapper (native `<label for>`, description `<ds-text>`, error message)
 * around a `<input type="text" inputmode="numeric" autocomplete="off">` (two,
 * joined by an en dash, with `range`), parsed leniently with the locale
 * pattern from `Intl.DateTimeFormat().formatToParts`. A ghost icon-only
 * `<ds-button>` opens a non-modal `<ds-popover>` (bottom-start) holding the
 * header (prev/next `<ds-button>`s, month/year `<ds-select>`s), a
 * `<table role="grid">` of roving-tabindex day buttons, and a footer of
 * Today/Clear `<ds-button>`s. Form-associated (`setFormValue`; two entries,
 * `name` and `name-end`, for a range) and carries `data-ds-field` for
 * `<ds-form>`; a range adds a hidden `name-end` field child. Dates are
 * computed with `Date.UTC` arithmetic on `YYYY-MM-DD` parts, never
 * `new Date(string)`.
 *
 * ## When to use
 *
 * Any date the user chooses: due dates, bookings, dates of birth, report
 * periods (`range`). Set `min`/`max` and `isDateDisabled` whenever they apply.
 *
 * ## When not to use
 *
 * Not for a date-and-time, a month or year alone (Select), a relative choice
 * (SegmentedControl or Select), or a display-only calendar of events.
 *
 * @fires change - A complete valid date (or range) was typed or picked, or the value was cleared: `{ value }`, `undefined` when cleared.
 * @fires open-change - The calendar opened or closed: `{ open }`.
 */
@customElement('ds-date-picker')
export class DsDatePicker extends LitElement {
  static formAssociated: boolean = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-date-picker-border-invalid: var(--color-border-danger);
      --ds-date-picker-border-width: var(--border-width-thin);
      --ds-date-picker-radius: var(--radius-md);
      --ds-date-picker-padding-inline: var(--space-md);
      --ds-date-picker-padding-block: var(--space-sm);
      --ds-date-picker-font-size: var(--font-size-md);
      --ds-date-picker-calendar-inset: var(--layout-inset-md);
      --ds-date-picker-calendar-gap: var(--layout-gap-normal);
      --ds-date-picker-header-gap: var(--layout-gap-tight);
      --ds-date-picker-footer-gap: var(--layout-gap-tight);
      --ds-date-picker-day-gap: var(--space-0);
      --ds-date-picker-day-radius: var(--radius-md);
      --ds-date-picker-day-hover: var(--color-action-ghost-background-hover);
      --ds-date-picker-weekday-size: var(--font-size-xs);
      --ds-date-picker-weekday-weight: var(--font-weight-medium);
      --ds-date-picker-week-number-size: var(--font-size-xs);
      --ds-date-picker-week-number-weight: var(--font-weight-regular);
      --ds-date-picker-month-title-size: var(--font-size-md);
      --ds-date-picker-month-title-weight: var(--font-weight-semibold);
      --ds-date-picker-part-gap: var(--space-1);
      --ds-date-picker-field-gap: var(--space-2);
      --ds-date-picker-day-font-size: var(--font-size-sm);
      --ds-date-picker-font-family: var(--font-family-body);
      --ds-date-picker-line-height: var(--font-line-height-normal);
      --ds-date-picker-label-weight: var(--font-weight-medium);
      --ds-date-picker-helper-size: var(--font-size-sm);
      --ds-date-picker-disabled-opacity: var(--opacity-disabled);
      --ds-date-picker-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock / fontSize by size */
    :host([size='sm']) {
      --ds-date-picker-padding-inline: var(--space-2);
      --ds-date-picker-padding-block: var(--space-1);
      --ds-date-picker-font-size: var(--font-size-sm);
    }

    /* partGap: between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-date-picker-part-gap);
      position: relative;
      font-family: var(--ds-date-picker-font-family);
      line-height: var(--ds-date-picker-line-height);
    }

    /* disabledOpacity: the whole field group dims */
    .group.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    /* labelWeight, fontSize on the label part */
    [data-part='label'] {
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-font-size);
      font-weight: var(--ds-date-picker-label-weight);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    /* background / foreground / border (locked); minTarget, minTargetSm (locked); fieldGap */
    [data-part='field'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-date-picker-field-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      padding-block: var(--ds-date-picker-padding-block);
      padding-inline: var(--ds-date-picker-padding-inline);
      border: var(--ds-date-picker-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-date-picker-radius);
      background: var(--color-background);
      color: var(--color-foreground);
    }
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--size-target-min);
    }

    /* borderFocus / focusRing / focusRingWidth (locked): the ring follows focus in the typed input(s) */
    [data-part='field']:has([data-part='input']:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--ds-date-picker-border-width));
    }

    /* borderInvalid */
    [data-part='field'].invalid {
      border-color: var(--ds-date-picker-border-invalid);
    }

    /* fontSize; placeholder (locked) */
    [data-part='input'] {
      flex: 1 1 8ch;
      min-inline-size: 8ch;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      color: inherit;
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-font-size);
      line-height: var(--ds-date-picker-line-height);
    }
    [data-part='input']::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }
    .group.disabled [data-part='input'] {
      cursor: not-allowed;
    }

    /* rangeSeparatorColor (locked) */
    .separator {
      color: var(--color-foreground-muted);
    }

    /* errorText (locked) and helperSize come from the composed ds-text (tone="danger", the
       helperSize / fontFamily forwards); the role="alert" wrapper only carries the part. */
    [data-part='errorMessage'] {
      margin: 0;
    }

    /* calendarGap: between header, grid and footer. This is the popover part — the calendar
       content wrapper, not the ds-popover host, which also holds the always-visible trigger. */
    .calendar {
      display: flex;
      flex-direction: column;
      gap: var(--ds-date-picker-calendar-gap);
      font-family: var(--ds-date-picker-font-family);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    /* headerGap */
    [data-part='header'] {
      display: flex;
      align-items: center;
      gap: var(--ds-date-picker-header-gap);
    }

    /* footerGap */
    [data-part='footer'] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ds-date-picker-footer-gap);
    }

    [data-part='monthSelect'],
    [data-part='yearSelect'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    /* dayGap: cells touch so a range reads as one bar */
    [data-part='grid'] {
      border-collapse: separate;
      border-spacing: var(--ds-date-picker-day-gap);
    }
    [data-part='grid'] td,
    [data-part='grid'] th {
      padding: 0;
    }

    /* weekdayColor (locked), weekdaySize, weekdayWeight */
    [data-part='grid'] thead th {
      font-size: var(--ds-date-picker-weekday-size);
      font-weight: var(--ds-date-picker-weekday-weight);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    /* weekNumberSize / weekNumberWeight, in weekdayColor (locked) */
    [data-part='weekNumber'] {
      font-size: var(--ds-date-picker-week-number-size);
      font-weight: var(--ds-date-picker-week-number-weight);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    /* daySize, dayTodayBorderWidth (locked); dayRadius, dayFontSize; transition */
    [data-part='day'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--size-target-comfortable);
      block-size: var(--size-target-comfortable);
      margin: 0;
      padding: 0;
      border: var(--border-width-focus) solid transparent;
      border-radius: var(--ds-date-picker-day-radius);
      background: transparent;
      color: var(--color-foreground);
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-day-font-size);
      cursor: pointer;
      transition:
        background-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        color var(--ds-date-picker-transition) var(--motion-easing-standard),
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    /* dayHover */
    [data-part='day']:hover:not([aria-disabled='true']) {
      background: var(--ds-date-picker-day-hover);
    }

    /* dayOutsideMonthColor (locked) */
    [data-part='day'].outside {
      color: var(--color-foreground-muted);
    }

    /* dayTodayBorder (locked): a ring, distinct in shape from the selected fill */
    [data-part='day'][aria-current='date'] {
      border-color: var(--color-control-selected-background);
    }

    /* dayInRangeBackground (locked) */
    [data-part='day'].in-range {
      background: var(--color-background-strong);
      border-radius: 0;
    }

    /* daySelectedBackground / daySelectedForeground (locked) */
    [data-part='day'].selected,
    [data-part='day'].selected:hover {
      background: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    /* focusRing / focusRingWidth (locked): replaces the today ring while the day has focus */
    [data-part='day']:focus-visible {
      outline: none;
      border-color: var(--color-border-focus);
    }

    [data-part='day'][aria-disabled='true'] {
      opacity: var(--ds-date-picker-disabled-opacity);
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='day'] {
        transition: none;
      }
    }
  `;

  /** Visible label ("Start date", "Date of birth"). */
  @property() accessor label: string = '';

  /**
   * Field name for the Form. The value is an ISO date string, or (`range`)
   * `{ start, end }` of them; a range registers `name` (start) and `name-end` (end).
   */
  @property() accessor name: string = '';

  /** Controlled value (ISO date, or a range). `''` is a controlled empty field; `undefined` means uncontrolled. */
  @property({ attribute: false }) accessor value: DatePickerValue | undefined;

  /** Initial value. */
  @property({ attribute: false }) accessor defaultValue: DatePickerValue | undefined;

  /**
   * Controlled calendar state, for programmatic use and for stories and tests.
   * Omit for the button-driven default. A property only, not a reflected
   * attribute: bind `.open`; setting it to `false` keeps it controlled.
   */
  @property({ attribute: false }) accessor open: boolean | undefined;

  /** Pick a start and an end date in one calendar; two inputs in the field. */
  @property({ type: Boolean, reflect: true }) accessor range = false;

  /** Earliest selectable date (ISO). Earlier days are disabled and the error uses `copy.tooEarly`. */
  @property() accessor min: string | undefined;

  /** Latest selectable date (ISO). */
  @property() accessor max: string | undefined;

  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by the Arrow keys. */
  @property({ attribute: false }) accessor isDateDisabled: ((isoDate: string) => boolean) | undefined;

  /** BCP 47 locale for month and weekday names, the first day of the week, and the typed format. Defaults to `<html lang>`, then the runtime locale. */
  @property({ reflect: true }) accessor locale: string | undefined;

  /** An ISO week-number column at the start of each row. */
  @property({ type: Boolean, reflect: true, attribute: 'show-week-numbers' }) accessor showWeekNumbers = false;

  /** Defaults to the locale's pattern ("MM/DD/YYYY", "DD.MM.YYYY"). */
  @property() accessor placeholder: string | undefined;

  /** Helper text. */
  @property() accessor description: string | undefined;

  /** Must have a value to submit. */
  @property({ type: Boolean, reflect: true }) accessor required = false;

  /** Visually hide the label (it remains the accessible name). Only for a field whose context already names it. */
  @property({ type: Boolean, attribute: 'hide-label' }) accessor hideLabel = false;

  /** sm for fields inside grid cells and toolbars: minimum target height, tighter padding, small type. */
  @property({ type: String, reflect: true }) accessor size: DatePickerSize = 'md';

  /** Not editable, still readable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Error message; implies invalid. */
  @property() accessor error: string | undefined;

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;

  /** The committed start (or single) date. */
  @state() private accessor internalStart: string | undefined;

  /** The committed range end. Unused outside `range`. */
  @state() private accessor internalEnd: string | undefined;

  /** A range's pending first pick: shown only in the calendar, discarded on close. */
  @state() private accessor draftStart: string | undefined;

  /** Raw text of the start (or single) input. */
  @state() private accessor textStart = '';

  /** Raw text of the end input (`range`). */
  @state() private accessor textEnd = '';

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** The visible month (0-based) and year. */
  @state() private accessor viewYear = new Date().getFullYear();
  @state() private accessor viewMonth = new Date().getMonth();

  /** The roving-tabindex day. Cleared on close so the next open recomputes it. */
  @state() private accessor focusedDate = '';

  /** Disabled by an owning native form or fieldset. */
  @state() private accessor formDisabled = false;

  @query('#input') private accessor startInputEl!: HTMLInputElement | null;
  @query('#input-end') private accessor endInputEl!: HTMLInputElement | null;
  @query('#popover') private accessor popoverEl!: DsPopover | null;
  @query('#calendar-button') private accessor calendarButtonEl!: HTMLElement | null;

  /** The open state the last `willUpdate` saw, so every change aims and focuses the calendar once. */
  private openSeen = false;
  private focusOnOpen = false;
  /** The last value a `change` reported (or the seed), so typing the same date never re-dispatches. */
  private lastEmittedValue: DatePickerValue | null = null;
  private readonly internals: ElementInternals;
  private readonly endField: DsDatePickerEndField;

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.endField = document.createElement('ds-date-picker-end-field') as DsDatePickerEndField;
    this.endField.source = {
      name: () => this.name,
      label: () => this.label,
      required: () => this.required,
      disabled: () => this.isDisabled,
      value: () => {
        const value = this.committedValue;
        return value !== null && typeof value === 'object' ? value.end : null;
      },
      focus: () => this.endInputEl?.focus(),
    };
  }

  /** The committed value for `<ds-form>`: the ISO date, or with `range` the start date once both ends are set; `null` when empty. */
  get currentValue(): string | null {
    const value = this.committedValue;
    if (value === null) {
      return null;
    }
    return typeof value === 'string' ? value : value.start;
  }

  /** The owning native form, if any. */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validity(): ValidityState {
    this.syncInternals();
    return this.internals.validity;
  }

  /** The field's own message by the doc's precedence (combined for a range); empty when valid. */
  get validationMessage(): string {
    this.syncInternals();
    return this.internals.validationMessage;
  }

  checkValidity(): boolean {
    this.syncInternals();
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    this.syncInternals();
    return this.internals.reportValidity();
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }

  formResetCallback(): void {
    this.seedFromValue(this.value ?? this.defaultValue);
    this.lastEmittedValue = this.committedValue;
  }

  formStateRestoreCallback(restored: File | string | FormData | null): void {
    if (this.value !== undefined) {
      return;
    }
    if (typeof restored === 'string' && !this.range) {
      this.seedFromValue(restored);
    } else if (restored instanceof FormData && this.range) {
      const start = restored.get(this.name);
      const end = restored.get(`${this.name}-end`);
      if (typeof start === 'string' && typeof end === 'string') {
        this.seedFromValue({ start, end });
      }
    }
    this.lastEmittedValue = this.committedValue;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'DatePicker');
    this.setAttribute('data-ds-field', '');
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private get isOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  /** `locale`, else `<html lang>`, else the runtime default (`undefined`). */
  private get resolvedLocale(): string | undefined {
    return validLocale(this.locale) ?? validLocale(document.documentElement.lang);
  }

  private get committedValue(): DatePickerValue | null {
    if (this.range) {
      return this.internalStart !== undefined && this.internalEnd !== undefined
        ? { start: this.internalStart, end: this.internalEnd }
        : null;
    }
    return this.internalStart ?? null;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.seedFromValue(this.value ?? this.defaultValue);
      this.lastEmittedValue = this.committedValue;
      const anchor = parseISO(this.internalStart ?? todayISO());
      this.viewYear = anchor.y;
      this.viewMonth = anchor.m;
    } else if ((changed.has('value') || changed.has('range')) && this.value !== undefined) {
      this.seedFromValue(this.value);
      this.lastEmittedValue = this.committedValue;
    } else if (changed.has('locale')) {
      const locale = this.resolvedLocale;
      this.textStart = this.internalStart ? formatNumeric(this.internalStart, locale) : this.textStart;
      this.textEnd = this.internalEnd ? formatNumeric(this.internalEnd, locale) : this.textEnd;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    const isOpen = this.isOpen;
    if (isOpen !== this.openSeen) {
      this.openSeen = isOpen;
      if (isOpen) {
        // Aim at the value's month (or today's); opened from the end input, focusedDate already holds the end.
        this.moveViewTo(this.focusedDate || this.internalStart || todayISO());
        this.focusOnOpen = true;
      } else {
        this.draftStart = undefined;
        this.focusedDate = '';
        this.focusOnOpen = false;
      }
    }
  }

  protected override firstUpdated(): void {
    if (import.meta.env.DEV) {
      if (!this.label) {
        console.warn('<ds-date-picker> requires a `label`.', this);
      }
      if (!this.name) {
        console.warn('<ds-date-picker> requires a `name`.', this);
      }
    }
  }

  protected override updated(): void {
    this.syncInternals();
    this.syncEndField();
    if (this.focusOnOpen) {
      this.focusOnOpen = false;
      void this.focusDayAfterOpen();
    }
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const invalid = Boolean(this.error);
    const describedBy = [this.description ? 'description' : '', invalid ? 'error' : ''].filter(Boolean).join(' ') || undefined;
    const placeholder = this.placeholder || patternPlaceholder(this.resolvedLocale);
    // The description and error Texts take exactly the two declared forwards, and nothing else.
    const helperOverrides = {
      fontSize: this.overrides?.helperSize ?? 'font.size.sm',
      fontFamily: this.overrides?.fontFamily ?? 'font.family.body',
    } satisfies Record<string, TokenRef>;

    return html`
      <div class=${classMap({ group: true, disabled: isDisabled })} @keydown=${this.handleRootKeydown}>
        <label
          id="label"
          class=${classMap({ 'visually-hidden': this.hideLabel })}
          part="label"
          data-part="label"
          for="input"
          >${this.label}${this.required ? COPY_REQUIRED_INDICATOR : nothing}</label
        >
        ${this.description
          ? html`<ds-text
              id="description"
              part="description"
              data-part="description"
              element="p"
              size="sm"
              tone="muted"
              .overrides=${helperOverrides}
              >${this.description}</ds-text
            >`
          : nothing}
        <div class=${classMap({ invalid })} part="field" data-part="field">
          ${this.renderInput('start', placeholder, describedBy, invalid, isDisabled)}
          ${this.range
            ? html`<span class="separator" aria-hidden="true">–</span>
                ${this.renderInput('end', placeholder, describedBy, invalid, isDisabled)}`
            : nothing}
          <ds-popover
            id="popover"
            placement="bottom-start"
            no-dismiss
            .open=${this.isOpen}
            .overrides=${{ inset: this.overrides?.calendarInset ?? 'layout.inset.md' }}
            @open-change=${this.handlePopoverOpenChange}
          >
            <ds-button
              slot="trigger"
              id="calendar-button"
              part="calendarButton"
              data-part="calendarButton"
              variant="ghost"
              size=${this.size}
              icon-only
              label=${this.range ? COPY_OPEN_RANGE : COPY_OPEN}
              ?disabled=${isDisabled}
              @press=${this.stopPress}
            >
              <ds-icon slot="leading-icon" name="calendar"></ds-icon>
            </ds-button>
            ${this.renderCalendar(isDisabled)}
          </ds-popover>
        </div>
        ${invalid
          ? html`<div id="error" role="alert" part="errorMessage" data-part="errorMessage">
              <ds-text element="p" size="sm" tone="danger" .overrides=${helperOverrides}>${this.error}</ds-text>
            </div>`
          : nothing}
      </div>
    `;
  }

  private renderInput(
    which: 'start' | 'end',
    placeholder: string,
    describedBy: string | undefined,
    invalid: boolean,
    isDisabled: boolean,
  ): TemplateResult {
    const isStart = which === 'start';
    return html`
      ${this.range
        ? html`<span id=${isStart ? 'start-label' : 'end-label'} class="visually-hidden"
            >${isStart ? COPY_START_LABEL : COPY_END_LABEL}</span
          >`
        : nothing}
      <input
        id=${isStart ? 'input' : 'input-end'}
        part="input"
        data-part="input"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        placeholder=${placeholder}
        .value=${live(isStart ? this.textStart : this.textEnd)}
        aria-labelledby=${ifDefined(this.range ? (isStart ? 'label start-label' : 'label end-label') : undefined)}
        aria-describedby=${ifDefined(describedBy)}
        aria-invalid=${ifDefined(invalid ? 'true' : undefined)}
        aria-required=${ifDefined(this.required ? 'true' : undefined)}
        aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
        ?readonly=${isDisabled}
        @input=${(event: Event) => this.handleTextInput(event, which)}
        @keydown=${(event: KeyboardEvent) => this.handleInputKeydown(event, which)}
      />
    `;
  }

  private renderCalendar(isDisabled: boolean): TemplateResult {
    const locale = this.resolvedLocale;
    const weekStart = firstDayOfWeek(locale);
    const today = todayISO();
    const month = monthName(locale, this.viewMonth);
    const year = String(this.viewYear);
    const titleOverrides = {
      fontSize: this.overrides?.monthTitleSize ?? 'font.size.md',
      fontWeight: this.overrides?.monthTitleWeight ?? 'font.weight.semibold',
    } satisfies Record<string, TokenRef>;
    const weekdays = Array.from({ length: 7 }, (_, i) => (weekStart + i) % 7);

    return html`
      <div class="calendar" part="popover" data-part="popover" @keydown=${this.handleCalendarKeydown}>
        <div part="header" data-part="header">
          <ds-button
            part="prevMonthButton"
            data-part="prevMonthButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_PREVIOUS_MONTH}
            ?disabled=${isDisabled}
            @press=${this.handlePrevMonthPress}
          >
            <ds-icon slot="leading-icon" name="chevron-left"></ds-icon>
          </ds-button>
          <ds-select
            part="monthSelect"
            data-part="monthSelect"
            label=${COPY_MONTH}
            name="month"
            hide-label
            size="sm"
            .options=${this.monthOptions(locale)}
            .value=${String(this.viewMonth)}
            .overrides=${titleOverrides}
            ?disabled=${isDisabled}
            @change=${this.handleMonthChange}
          ></ds-select>
          <ds-select
            part="yearSelect"
            data-part="yearSelect"
            label=${COPY_YEAR}
            name="year"
            hide-label
            size="sm"
            .options=${this.yearOptions}
            .value=${year}
            .overrides=${titleOverrides}
            ?disabled=${isDisabled}
            @change=${this.handleYearChange}
          ></ds-select>
          <ds-button
            part="nextMonthButton"
            data-part="nextMonthButton"
            variant="ghost"
            size="sm"
            icon-only
            label=${COPY_NEXT_MONTH}
            ?disabled=${isDisabled}
            @press=${this.handleNextMonthPress}
          >
            <ds-icon slot="leading-icon" name="chevron-right"></ds-icon>
          </ds-button>
        </div>
        <span id="grid-label" class="visually-hidden">${COPY_GRID_LABEL(this.label, month, year)}</span>
        <table role="grid" part="grid" data-part="grid" aria-labelledby="grid-label" @keydown=${this.handleGridKeydown}>
          <thead>
            <tr>
              ${this.showWeekNumbers
                ? html`<th scope="col" abbr=${COPY_WEEK_NUMBER}><span class="visually-hidden">${COPY_WEEK_NUMBER}</span></th>`
                : nothing}
              ${weekdays.map(
                (weekday) =>
                  html`<th scope="col" part="weekdayHeader" data-part="weekdayHeader" abbr=${weekdayName(locale, weekday, 'long')}>
                    ${weekdayName(locale, weekday, 'short')}
                  </th>`,
              )}
            </tr>
          </thead>
          <tbody>
            ${getCalendarWeeks(this.viewYear, this.viewMonth, weekStart).map(
              (week) => html`
                <tr>
                  ${this.showWeekNumbers
                    ? html`<th scope="row" part="weekNumber" data-part="weekNumber">${isoWeekNumber(week[0]!)}</th>`
                    : nothing}
                  ${week.map((iso) => this.renderDay(iso, today, locale))}
                </tr>
              `,
            )}
          </tbody>
        </table>
        <div part="footer" data-part="footer">
          <ds-button
            part="todayButton"
            data-part="todayButton"
            variant="ghost"
            size="sm"
            label=${COPY_TODAY}
            ?disabled=${isDisabled || this.isDayDisabled(today)}
            @press=${this.handleTodayPress}
          ></ds-button>
          <ds-button
            part="clearButton"
            data-part="clearButton"
            variant="ghost"
            size="sm"
            label=${COPY_CLEAR}
            ?disabled=${isDisabled}
            @press=${this.handleClearPress}
          ></ds-button>
        </div>
      </div>
    `;
  }

  private renderDay(iso: string, today: string, locale: string | undefined): TemplateResult {
    const { m, d } = parseISO(iso);
    const isToday = iso === today;
    const dayDisabled = this.isDayDisabled(iso);
    const draft = this.draftStart;
    const start = draft ?? this.internalStart;
    const end = draft === undefined && this.range ? this.internalEnd : undefined;
    // Only the ends take the selected fill; in a range every day from start to end is selected.
    const isEnd = iso === start || (end !== undefined && iso === end);
    const within = start !== undefined && end !== undefined && iso > start && iso < end;
    const selected = isEnd || within;
    const roving = this.focusedDate || this.defaultFocusDate;
    const name = [formatFullDate(iso, locale), isToday ? COPY_TODAY_LABEL : '', selected ? COPY_SELECTED : '']
      .filter(Boolean)
      .join(', ');

    return html`
      <td role="gridcell" aria-selected=${selected ? 'true' : 'false'}>
        <button
          type="button"
          part="day"
          data-part="day"
          class=${classMap({ outside: m !== this.viewMonth, selected: isEnd, 'in-range': within })}
          data-iso=${iso}
          tabindex=${iso === roving ? 0 : -1}
          aria-current=${ifDefined(isToday ? 'date' : undefined)}
          aria-disabled=${ifDefined(dayDisabled ? 'true' : undefined)}
          aria-label=${name}
          @click=${() => this.selectDay(iso)}
          @focus=${() => {
            if (this.focusedDate !== iso) {
              this.focusedDate = iso;
            }
          }}
        >
          ${d}
        </button>
      </td>
    `;
  }

  /** The roving stop before any day has had focus: the selected day, else today, else the visible month's first day. */
  private get defaultFocusDate(): string {
    const inView = (iso: string | undefined): iso is string => {
      if (!iso) {
        return false;
      }
      const { y, m } = parseISO(iso);
      return y === this.viewYear && m === this.viewMonth;
    };
    const selected = this.draftStart ?? this.internalStart;
    if (inView(selected)) {
      return selected;
    }
    const today = todayISO();
    return inView(today) ? today : toISO(this.viewYear, this.viewMonth, 1);
  }

  private monthOptions(locale: string | undefined): ListboxOption[] {
    return Array.from({ length: 12 }, (_, m) => ({ value: String(m), label: monthName(locale, m) }));
  }

  /** The `min`/`max` years when given, else the current year − 100 to + 10, each on its own; always includes the visible year. */
  private get yearOptions(): ListboxOption[] {
    const currentYear = new Date().getFullYear();
    const first = Math.min(this.min ? parseISO(this.min).y : currentYear - 100, this.viewYear);
    const last = Math.max(this.max ? parseISO(this.max).y : currentYear + 10, this.viewYear);
    const options: ListboxOption[] = [];
    for (let y = first; y <= last; y += 1) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }

  /* ---- value ---- */

  private seedFromValue(value: DatePickerValue | undefined): void {
    if (this.range) {
      const pair = value !== undefined && typeof value === 'object' ? value : undefined;
      this.internalStart = pair?.start || undefined;
      this.internalEnd = pair?.end || undefined;
    } else {
      this.internalStart = typeof value === 'string' && value !== '' ? value : undefined;
      this.internalEnd = undefined;
    }
    const locale = this.resolvedLocale;
    this.textStart = this.internalStart ? formatNumeric(this.internalStart, locale) : '';
    this.textEnd = this.internalEnd ? formatNumeric(this.internalEnd, locale) : '';
  }

  private isDayDisabled(iso: string): boolean {
    return Boolean((this.min && iso < this.min) || (this.max && iso > this.max) || this.isDateDisabled?.(iso));
  }

  /**
   * Applies a new start/end and reports it when it is a complete value (a
   * date, both ends of a range, or empty). `force` reports even an unchanged
   * value (every pick, every Clear). Controlled: the element returns to
   * `value` after reporting, and shows the change once the property follows.
   */
  private commit(start: string | undefined, end: string | undefined, force: boolean): void {
    this.internalStart = start;
    this.internalEnd = this.range ? end : undefined;
    const complete = !this.range || (start !== undefined) === (end !== undefined);
    if (!complete) {
      return;
    }
    const next = this.committedValue;
    if (!force && sameValue(next, this.lastEmittedValue)) {
      return;
    }
    this.lastEmittedValue = next;
    this.dispatchEvent(
      new CustomEvent<DatePickerChangeDetail>('change', {
        detail: { value: next ?? undefined },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.value !== undefined) {
      this.seedFromValue(this.value);
      this.lastEmittedValue = this.committedValue;
    }
  }

  private selectDay(iso: string): void {
    if (this.isDisabled || this.isDayDisabled(iso)) {
      return;
    }
    this.focusedDate = iso;
    const locale = this.resolvedLocale;
    if (!this.range) {
      this.textStart = formatNumeric(iso, locale);
      this.commit(iso, undefined, true);
      this.closeCalendar();
      return;
    }
    const draft = this.draftStart;
    if (draft === undefined || iso < draft) {
      // First pick, or a pick before the pending start: (re)starts the range, shown only in the calendar.
      this.draftStart = iso;
      return;
    }
    this.draftStart = undefined;
    this.textStart = formatNumeric(draft, locale);
    this.textEnd = formatNumeric(iso, locale);
    this.commit(draft, iso, true);
    this.closeCalendar();
  }

  private handleTextInput(event: Event, which: 'start' | 'end'): void {
    if (this.isDisabled) {
      return;
    }
    const text = (event.currentTarget as HTMLInputElement).value;
    if (which === 'start') {
      this.textStart = text;
    } else {
      this.textEnd = text;
    }
    let parsed: string | undefined;
    if (text.trim() !== '') {
      const result = parseTypedDate(text, this.resolvedLocale);
      if (result === null) {
        // A partial or unparseable date changes nothing.
        return;
      }
      parsed = result;
      if (this.isOpen) {
        this.moveViewTo(parsed);
      }
    }
    if (which === 'start') {
      this.commit(parsed, this.internalEnd, false);
    } else {
      this.commit(this.internalStart, parsed, false);
    }
  }

  /* ---- open state ---- */

  /** Uncontrolled: applies the change, then reports it. Controlled: reports it only. */
  private requestOpen(next: boolean): void {
    if (this.isOpen === next || (next && this.isDisabled)) {
      return;
    }
    if (this.open === undefined) {
      this.internalOpen = next;
    }
    this.dispatchEvent(
      new CustomEvent<DatePickerOpenChangeDetail>('open-change', { detail: { open: next }, bubbles: true, composed: true }),
    );
  }

  private closeCalendar(): void {
    this.requestOpen(false);
    void this.updateComplete.then(() => {
      if (!this.isOpen) {
        this.calendarButtonEl?.focus();
      }
    });
  }

  private async focusDayAfterOpen(): Promise<void> {
    await this.popoverEl?.updateComplete;
    // Popover moves focus to its first focusable once the slotted controls have updated; land on the day after that.
    await new Promise<void>((resolve) => setTimeout(resolve));
    if (!this.isOpen) {
      return;
    }
    // Popover measures its panel when it opens, which can precede the calendar's layout; its window scroll
    // listener (capture) repositions it against the rendered size. Dispatched on the host, since a
    // non-composed event from inside the shadow root never reaches window.
    this.dispatchEvent(new Event('scroll'));
    this.dayButton(this.focusedDate || this.defaultFocusDate)?.focus();
  }

  private readonly handlePopoverOpenChange = (event: CustomEvent<PopoverOpenChangeDetail>): void => {
    // Popover's (and the month/year Selects') open-change stays inside; this element reports its own.
    event.stopPropagation();
    if (event.target !== event.currentTarget) {
      return;
    }
    this.requestOpen(event.detail.open);
  };

  private readonly stopPress = (event: Event): void => {
    event.stopPropagation();
  };

  /**
   * Escape closes the calendar wherever the focus is, and returns it to the
   * calendar button. `ds-popover` only hears the key when focus is inside its
   * panel — from the field itself (an input, or the calendar button, which is
   * the trigger and so outside the panel) the keydown reaches this root
   * instead. The popover stops propagation on the Escape it handles, so
   * exactly one of the two runs.
   */
  private readonly handleRootKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.isOpen || event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    this.closeCalendar();
  };

  private handleInputKeydown(event: KeyboardEvent, which: 'start' | 'end'): void {
    if (event.key !== 'ArrowDown' || this.isDisabled) {
      return;
    }
    event.preventDefault();
    // Opened from the end input, focus lands on the end date.
    const anchor = (which === 'end' ? this.internalEnd : undefined) ?? this.internalStart ?? todayISO();
    if (this.isOpen) {
      void this.moveFocusTo(this.draftStart ?? anchor);
      return;
    }
    this.focusedDate = anchor;
    this.requestOpen(true);
  }

  /* ---- calendar navigation ---- */

  private dayButton(iso: string): HTMLButtonElement | null {
    return this.renderRoot.querySelector<HTMLButtonElement>(`[data-part="day"][data-iso="${iso}"]`);
  }

  private moveViewTo(iso: string): void {
    const { y, m } = parseISO(iso);
    this.viewYear = y;
    this.viewMonth = m;
    this.focusedDate = iso;
  }

  private async moveFocusTo(iso: string): Promise<void> {
    this.moveViewTo(iso);
    await this.updateComplete;
    this.dayButton(iso)?.focus();
  }

  /**
   * Steps `delta` days at a time from `iso`, skipping disabled days and turning
   * pages as needed; stays put when no enabled day is left before `min`/`max`
   * (or, unbounded, within ten years).
   */
  private stepEnabled(iso: string, delta: number): string {
    let candidate = iso;
    for (let i = 0; i < 3660; i += 1) {
      candidate = addDays(candidate, delta);
      if ((this.min && candidate < this.min) || (this.max && candidate > this.max)) {
        return iso;
      }
      if (!this.isDayDisabled(candidate)) {
        return candidate;
      }
    }
    return iso;
  }

  private readonly handleGridKeydown = (event: KeyboardEvent): void => {
    if (!(event.target instanceof HTMLElement) || event.target.dataset.part !== 'day' || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const current = this.focusedDate || this.defaultFocusDate;
    const weekStart = firstDayOfWeek(this.resolvedLocale);
    let next: string | undefined;
    switch (event.key) {
      case 'ArrowRight':
        next = this.stepEnabled(current, 1);
        break;
      case 'ArrowLeft':
        next = this.stepEnabled(current, -1);
        break;
      case 'ArrowDown':
        next = this.stepEnabled(current, 7);
        break;
      case 'ArrowUp':
        next = this.stepEnabled(current, -7);
        break;
      case 'Home':
        next = addDays(current, -((weekdayOf(current) - weekStart + 7) % 7));
        break;
      case 'End':
        next = addDays(current, 6 - ((weekdayOf(current) - weekStart + 7) % 7));
        break;
      case 'PageUp':
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDay(current);
        return;
      default:
        return;
    }
    event.preventDefault();
    void this.moveFocusTo(next);
  };

  /**
   * Tab cycles within the calendar: previous month, month Select, year Select,
   * next month, the grid's one stop, Today, Clear, and back. Tab inside a
   * Select belongs to the Select.
   */
  private readonly handleCalendarKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || event.defaultPrevented) {
      return;
    }
    if (event.composedPath().some((node) => node instanceof HTMLElement && node.tagName === 'DS-SELECT')) {
      return;
    }
    const root = this.renderRoot as ShadowRoot;
    const stops = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[data-part="prevMonthButton"], [data-part="monthSelect"], [data-part="yearSelect"], [data-part="nextMonthButton"], [data-part="day"][tabindex="0"], [data-part="todayButton"], [data-part="clearButton"]',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (!first || !last) {
      return;
    }
    const active = root.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private readonly handlePrevMonthPress = (event: Event): void => {
    event.stopPropagation();
    this.shiftView(-1);
  };

  private readonly handleNextMonthPress = (event: Event): void => {
    event.stopPropagation();
    this.shiftView(1);
  };

  /** A month change keeps the focused day number, clamped into the new month. */
  private shiftView(deltaMonths: number): void {
    const anchor = this.focusedDate || toISO(this.viewYear, this.viewMonth, 1);
    this.moveViewTo(addMonths(anchor, deltaMonths));
  }

  private readonly handleMonthChange = (event: CustomEvent<SelectChangeDetail>): void => {
    event.stopPropagation();
    const anchor = this.focusedDate || toISO(this.viewYear, this.viewMonth, 1);
    this.moveViewTo(clampDayIntoMonth(this.viewYear, Number(event.detail.value), parseISO(anchor).d));
  };

  private readonly handleYearChange = (event: CustomEvent<SelectChangeDetail>): void => {
    event.stopPropagation();
    const anchor = this.focusedDate || toISO(this.viewYear, this.viewMonth, 1);
    this.moveViewTo(clampDayIntoMonth(Number(event.detail.value), this.viewMonth, parseISO(anchor).d));
  };

  /** Exactly like picking today's cell. */
  private readonly handleTodayPress = (event: Event): void => {
    event.stopPropagation();
    const today = todayISO();
    if (this.isDayDisabled(today)) {
      return;
    }
    this.moveViewTo(today);
    this.selectDay(today);
  };

  /** Empties the value (both ends), fires `change` with `undefined` even when already empty, and leaves the calendar open. */
  private readonly handleClearPress = (event: Event): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.draftStart = undefined;
    this.textStart = '';
    this.textEnd = '';
    this.commit(undefined, undefined, true);
  };

  /* ---- form ---- */

  /** Keeps the `name-end` Form entry present exactly while `range` is on. Moves only when out of place. */
  private syncEndField(): void {
    const wanted = this.range && this.name !== '';
    if (wanted && this.endField.parentElement !== this) {
      this.append(this.endField);
    } else if (!wanted && this.endField.parentElement === this) {
      this.endField.remove();
    }
  }

  /**
   * Mirrors value and validity into ElementInternals. Precedence: `error`;
   * required (every input empty); invalid (a non-empty input does not parse);
   * required (a range with one end empty); tooEarly; tooLate; rangeOrder.
   */
  private syncInternals(): void {
    const value = this.committedValue;
    if (this.isDisabled || value === null) {
      this.internals.setFormValue(null);
    } else if (typeof value === 'string') {
      this.internals.setFormValue(value);
    } else {
      const data = new FormData();
      data.append(this.name, value.start);
      data.append(`${this.name}-end`, value.end);
      this.internals.setFormValue(data);
    }

    if (this.isDisabled) {
      this.internals.setValidity({});
      return;
    }
    const anchor = this.startInputEl ?? undefined;
    const label = this.label;
    const locale = this.resolvedLocale;
    const texts = this.range ? [this.textStart, this.textEnd] : [this.textStart];
    const blank = (text: string): boolean => text.trim() === '';
    const unparseable = (text: string): boolean => !blank(text) && parseTypedDate(text, locale) === null;
    const start = this.internalStart;
    const end = this.range ? this.internalEnd : start;
    const complete = start !== undefined && end !== undefined;

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor);
    } else if (this.required && texts.every(blank)) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(label), anchor);
    } else if (texts.some(unparseable)) {
      this.internals.setValidity({ badInput: true }, COPY_INVALID(label, patternPlaceholder(locale)), anchor);
    } else if (this.required && !complete) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(label), anchor);
    } else if (complete && this.min && (start < this.min || end < this.min)) {
      this.internals.setValidity({ rangeUnderflow: true }, COPY_TOO_EARLY(label, formatNumeric(this.min, locale)), anchor);
    } else if (complete && this.max && (start > this.max || end > this.max)) {
      this.internals.setValidity({ rangeOverflow: true }, COPY_TOO_LATE(label, formatNumeric(this.max, locale)), anchor);
    } else if (this.range && complete && end < start) {
      this.internals.setValidity({ customError: true }, COPY_RANGE_ORDER, anchor);
    } else {
      this.internals.setValidity({});
    }
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DatePickerOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-date-picker': DsDatePicker;
  }
}
