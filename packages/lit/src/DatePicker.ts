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

/** `value`/`defaultValue` shape: an ISO calendar date, or `{ start, end }` of them with `range`. Never a `Date` — a calendar date has no time zone. */
export type DatePickerValue = string | { start: string; end: string };

export type DatePickerSize = 'sm' | 'md';

/** Detail carried by the `change` CustomEvent. `undefined` when the value is cleared. */
export interface DatePickerChangeDetail {
  value: DatePickerValue | undefined;
}

/** Detail carried by the `open-change` CustomEvent. */
export interface DatePickerOpenChangeDetail {
  open: boolean;
}

/**
 * Overridable style hooks; see the `overrides` property. `background`,
 * `foreground`, `placeholder`, `border`, `rangeSeparatorColor`,
 * `calendarSurface`, `daySelectedBackground`, `daySelectedForeground`,
 * `dayInRangeBackground`, `dayTodayBorder`, `dayOutsideMonthColor`,
 * `weekdayColor`, `descriptionText`, `errorText`, `minTarget` and
 * `focusRingWidth` are locked and excluded.
 */
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

const HOOKS: Record<DatePickerOverridableBinding, string> = {
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
  fontFamily: '--ds-date-picker-font-family', // literal-ok: CSS custom-property name, not a font stack
  lineHeight: '--ds-date-picker-line-height',
  labelWeight: '--ds-date-picker-label-weight',
  helperSize: '--ds-date-picker-helper-size',
  minTargetSm: '--ds-date-picker-min-target-sm',
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
const COPY_RANGE_ORDER = 'End date must be after the start date.';
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

function addYears(iso: string, delta: number): string {
  return addMonths(iso, delta * 12);
}

function clampDayIntoMonth(year: number, month: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toISO(year, month, Math.min(day, lastDay));
}

/** "Today" is the user's local wall-clock date, not a UTC one. */
function todayISO(): string {
  const now = new Date();
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function weekdayOf(iso: string): number {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m, d)).getUTCDay();
}

/** ISO 8601 week number, independent of the locale's first day of week. */
function isoWeekNumber(iso: string): number {
  const { y, m, d } = parseISO(iso);
  const date = new Date(Date.UTC(y, m, d));
  const dayIndex = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayIndex + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstThursdayIndex = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstThursdayIndex + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
}

/** 0 = Sunday … 6 = Saturday. `Intl.Locale.prototype.getWeekInfo` where supported, else Sunday. */
function firstDayOfWeek(locale: string | undefined): number {
  try {
    const resolved = new Intl.Locale(locale ?? navigator.language) as Intl.Locale & {
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
function weekdayShort(locale: string | undefined, weekday: number): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + weekday)));
}

function weekdayLong(locale: string | undefined, weekday: number): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + weekday)));
}

function formatDateForDisplay(iso: string, locale: string | undefined): string {
  const { y, m, d } = parseISO(iso);
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m, d)),
  );
}

function formatFullDate(iso: string, locale: string | undefined): string {
  const { y, m, d } = parseISO(iso);
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m, d)),
  );
}

/** The locale's numeric date field order, read from `Intl.DateTimeFormat().formatToParts`. */
function dateFieldOrder(locale: string | undefined): Array<'day' | 'month' | 'year'> {
  const dtf = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
  const parts = dtf.formatToParts(new Date(Date.UTC(2030, 0, 5)));
  const order: Array<'day' | 'month' | 'year'> = [];
  for (const part of parts) {
    if (part.type === 'day' || part.type === 'month' || part.type === 'year') {
      order.push(part.type);
    }
  }
  return order;
}

/** e.g. "MM/DD/YYYY" or "DD.MM.YYYY". */
function patternPlaceholder(locale: string | undefined): string {
  const dtf = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' });
  const parts = dtf.formatToParts(new Date(Date.UTC(2030, 0, 5)));
  const map: Record<string, string> = { day: 'DD', month: 'MM', year: 'YYYY' };
  return parts.map((part) => map[part.type] ?? part.value).join('');
}

/** Lenient separators, a real calendar date, and a four-digit year (two-digit years are refused). */
function parseTypedDate(text: string, locale: string | undefined): string | null {
  const groups = text.trim().split(/[^0-9]+/).filter(Boolean);
  if (groups.length !== 3) {
    return null;
  }
  const order = dateFieldOrder(locale);
  const values: Partial<Record<'day' | 'month' | 'year', number | undefined>> = {};
  for (let i = 0; i < 3; i += 1) {
    const raw = groups[i];
    if (order[i] === 'year' && raw!.length !== 4) {
      return null;
    }
    values[order[i]!] = Number(raw);
  }
  const { day, month, year } = values;
  if (!day || !month || !year || month < 1 || month > 12) {
    return null;
  }
  const iso = toISO(year, month - 1, day);
  if (parseISO(iso).m !== month - 1) {
    // The day overflowed into the next month (e.g. Feb 30) — not a real date.
    return null;
  }
  return iso;
}

/** Every day cell for the visible month, in 7-day weeks, including the leading/trailing days of adjacent months needed to fill the grid. */
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

/**
 * `<ds-date-picker>` — DatePicker (category: input, APG pattern: dialog-modal).
 *
 * `<ds-date-picker label="Due date" name="due" min="2026-01-01">`. Input's
 * wrapper (label, description, error) around a
 * `<input type="text" inputmode="numeric" autocomplete="off">` (two, joined
 * by an en dash, when `range`), parsed leniently with the locale pattern from
 * `Intl.DateTimeFormat().formatToParts`; a ghost icon-only `<ds-button>`
 * opens a shadow `<ds-popover>` holding the header (prev/next `<ds-button>`s,
 * month/year `<ds-select>`s), a `<table role="grid">` with a roving-tabindex
 * day grid, and a footer of Today/Clear `<ds-button>`s. The element is
 * form-associated (`setFormValue`; two `FormData` entries, `name` and
 * `name-end`, for a range) and implements the `DsFormField` shape. Dates are
 * computed with plain `Date.UTC` arithmetic on `YYYY-MM-DD` parts, never `new
 * Date(string)`. Dispatches composed `change` (`{ value }`, `undefined` when
 * cleared) and `open-change` (`{ open }`) CustomEvents.
 *
 * ## When to use
 *
 * Use a DatePicker for any date the user chooses: due dates, bookings, dates
 * of birth (typing is faster — the calendar is still there), report periods
 * (`range`). Set `min`/`max` and `isDateDisabled` whenever they apply.
 *
 * ## When not to use
 *
 * Not for a date-and-time, a month/year alone (Select), or a relative choice
 * ("next 7 days": SegmentedControl/Select). Not a display-only Calendar view.
 *
 * @fires change - Fired when a complete valid date (or range) is typed or picked, with `{ value }` in `detail`; `value` is `undefined` when cleared.
 * @fires open-change - Fired when the calendar opens or closes, with `{ open }` in `detail`.
 * @csspart label - The visible label (anatomy: label).
 * @csspart description - The helper text under the label (anatomy: description).
 * @csspart field - The bordered wrapper around the input(s) and calendar button (anatomy: field).
 * @csspart input - Each date `<input>` (anatomy: input).
 * @csspart calendarButton - The `<ds-button>` that opens the calendar (anatomy: calendarButton).
 * @csspart popover - The composed `<ds-popover>` (anatomy: popover).
 * @csspart header - The month/year navigation row (anatomy: header).
 * @csspart prevMonthButton - The previous-month `<ds-button>` (anatomy: prevMonthButton).
 * @csspart nextMonthButton - The next-month `<ds-button>` (anatomy: nextMonthButton).
 * @csspart monthSelect - The composed month `<ds-select>` (anatomy: monthSelect).
 * @csspart yearSelect - The composed year `<ds-select>` (anatomy: yearSelect).
 * @csspart grid - The `role="grid"` `<table>` (anatomy: grid).
 * @csspart weekdayHeader - Each weekday `<th>` (anatomy: weekdayHeader).
 * @csspart day - Each day `<button>` (anatomy: day).
 * @csspart footer - The Today/Clear row (anatomy: footer).
 * @csspart todayButton - The Today `<ds-button>` (anatomy: todayButton).
 * @csspart clearButton - The Clear `<ds-button>` (anatomy: clearButton).
 * @csspart errorMessage - The `role="alert"` error message region (anatomy: errorMessage).
 */
@customElement('ds-date-picker')
export class DsDatePicker extends LitElement {
  static formAssociated = true;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-date-picker-border-focus: var(--color-border-focus);
      --ds-date-picker-border-invalid: var(--color-border-danger);
      --ds-date-picker-border-width: var(--border-width-thin);
      --ds-date-picker-radius: var(--radius-md);
      --ds-date-picker-padding-inline: var(--space-md);
      --ds-date-picker-padding-block: var(--space-sm);
      --ds-date-picker-padding-inline-sm: var(--space-2);
      --ds-date-picker-padding-block-sm: var(--space-1);
      --ds-date-picker-min-target-sm: var(--size-target-min);
      --ds-date-picker-part-gap: var(--space-1);
      --ds-date-picker-field-gap: var(--space-2);
      --ds-date-picker-calendar-inset: var(--layout-inset-md);
      --ds-date-picker-calendar-gap: var(--layout-gap-normal);
      --ds-date-picker-day-size: var(--size-target-comfortable);
      --ds-date-picker-day-gap: var(--space-0);
      --ds-date-picker-day-radius: var(--radius-md);
      --ds-date-picker-day-hover: var(--color-action-ghost-background-hover);
      --ds-date-picker-day-today-border-width: var(--border-width-focus);
      --ds-date-picker-weekday-size: var(--font-size-xs);
      --ds-date-picker-weekday-weight: var(--font-weight-medium);
      --ds-date-picker-month-title-size: var(--font-size-md);
      --ds-date-picker-month-title-weight: var(--font-weight-semibold);
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

    .label {
      display: block;
      font-size: var(--font-size-md);
      font-weight: var(--ds-date-picker-label-weight);
      line-height: var(--ds-date-picker-line-height);
    }

    /* descriptionText: color.foreground.muted, locked (set on ds-text via tone="muted") */
    .description {
      margin-block-start: var(--ds-date-picker-part-gap);
    }

    /* background / foreground / border: color.background / color.foreground / color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-date-picker-field-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-date-picker-part-gap);
      padding-block: var(--ds-date-picker-padding-block);
      padding-inline: var(--ds-date-picker-padding-inline);
      border: var(--ds-date-picker-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-date-picker-radius);
      background: var(--color-background);
      font-family: var(--ds-date-picker-font-family);
      transition:
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        padding var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field,
      .day {
        transition: none;
      }
    }

    /*
     * focusRingWidth (locked) replaces borderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-within {
      border-color: var(--ds-date-picker-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-date-picker-padding-inline) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
      padding-block: calc(
        var(--ds-date-picker-padding-block) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
    }

    :host([invalid]) .field {
      border-color: var(--ds-date-picker-border-invalid);
    }
    :host([invalid]) .field:focus-within {
      border-color: var(--ds-date-picker-border-invalid);
    }

    .field.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
    }
    .field.disabled .input {
      cursor: not-allowed;
    }

    /* paddingBlockSm / paddingInlineSm / minTargetSm replace the md bindings at size sm */
    :host([size='sm']) .field {
      min-block-size: var(--ds-date-picker-min-target-sm);
      padding-block: var(--ds-date-picker-padding-block-sm);
      padding-inline: var(--ds-date-picker-padding-inline-sm);
    }

    :host([size='sm']) .field:focus-within {
      padding-inline: calc(
        var(--ds-date-picker-padding-inline-sm) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
      padding-block: calc(
        var(--ds-date-picker-padding-block-sm) - (var(--border-width-focus) - var(--ds-date-picker-border-width))
      );
    }

    /* placeholder: color.foreground.muted, locked */
    .input {
      flex: 1 1 8ch;
      min-inline-size: 8ch;
      box-sizing: border-box;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      background: transparent;
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--font-size-md);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground);
    }

    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /* rangeSeparatorColor: color.foreground.muted, locked */
    .separator {
      color: var(--color-foreground-muted);
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

    .calendar {
      display: flex;
      flex-direction: column;
      gap: var(--ds-date-picker-calendar-gap);
      font-family: var(--ds-date-picker-font-family);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--layout-gap-tight);
    }

    .month-select,
    .year-select {
      flex: 1;
      min-inline-size: 0;
      font-size: var(--ds-date-picker-month-title-size);
      font-weight: var(--ds-date-picker-month-title-weight);
    }

    .grid {
      inline-size: 100%;
      border-collapse: separate;
      border-spacing: var(--ds-date-picker-day-gap);
    }

    .weekday {
      font-size: var(--ds-date-picker-weekday-size);
      font-weight: var(--ds-date-picker-weekday-weight);
      color: var(--color-foreground-muted);
      text-align: center;
      padding-block-end: var(--space-1);
    }

    .week-number {
      font-size: var(--ds-date-picker-weekday-size);
      color: var(--color-foreground-muted);
      text-align: center;
    }

    .day {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--ds-date-picker-day-size);
      block-size: var(--ds-date-picker-day-size);
      border: none;
      border-radius: var(--ds-date-picker-day-radius);
      background: transparent;
      color: var(--color-foreground);
      font-family: var(--ds-date-picker-font-family);
      font-size: var(--ds-date-picker-day-font-size);
      cursor: pointer;
      transition:
        background-color var(--ds-date-picker-transition) var(--motion-easing-standard),
        border-color var(--ds-date-picker-transition) var(--motion-easing-standard);
    }

    .day:not(.disabled):hover {
      background: var(--ds-date-picker-day-hover);
    }

    .day:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* dayOutsideMonthColor: color.foreground.muted, locked */
    .day.outside {
      color: var(--color-foreground-muted);
    }

    /* dayTodayBorder: color.control.selectedBackground, locked */
    .day.today {
      border: var(--ds-date-picker-day-today-border-width) solid var(--color-control-selected-background);
    }

    /* dayInRangeBackground: color.background.strong, locked */
    .day.in-range {
      background: var(--color-background-strong);
      border-radius: 0;
    }

    /* daySelectedBackground / daySelectedForeground: color.control.selectedBackground / selectedForeground, locked */
    .day.selected {
      background: var(--color-control-selected-background);
      color: var(--color-control-selected-foreground);
    }

    .day.disabled {
      opacity: var(--ds-date-picker-disabled-opacity);
      cursor: not-allowed;
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--layout-gap-tight);
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-date-picker-helper-size);
      line-height: var(--ds-date-picker-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-date-picker-part-gap);
    }
  `;

  /** Visible label. Always rendered. */
  @property() accessor label!: string;

  /** Field name for the Form. The value is an ISO date string, or (`range`) `{ start, end }` of them. */
  @property() accessor name!: string;

  /** Controlled value (ISO date, or a range). Omit for uncontrolled. */
  @property({ attribute: false }) accessor value: DatePickerValue | undefined;

  /** Initial value for an uncontrolled field. */
  @property({ attribute: false }) accessor defaultValue: DatePickerValue | undefined;

  /**
   * Controlled calendar state, for programmatic use and for stories and
   * tests. Omit for the button-driven default. Not listed under this
   * component's `platforms.lit.reflect`, but reflected anyway, matching
   * Popover's `open`.
   */
  @property({ type: Boolean, reflect: true }) accessor open: boolean | undefined;

  /** Pick a start and an end date in one calendar; two inputs in the field. */
  @property({ type: Boolean, reflect: true }) accessor range = false;

  /** Earliest selectable date (ISO). Earlier days are disabled; the error uses `copy.tooEarly`. */
  @property() accessor min: string | undefined;

  /** Latest selectable date (ISO). */
  @property() accessor max: string | undefined;

  /** Disable specific days (weekends, holidays, booked). Disabled days are shown, not hidden, and are skipped by keyboard movement. */
  @property({ attribute: false }) accessor isDateDisabled: ((isoDate: string) => boolean) | undefined;

  /** BCP 47 locale for month/weekday names, the first day of the week, and the typed format. Defaults to the device locale. */
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

  /**
   * `sm` for fields inside grid cells and toolbars: minimum target height,
   * tighter padding, small type. Not listed under this component's
   * `platforms.lit.reflect`, but reflected anyway since the size variant is
   * expressed as a CSS attribute selector, matching Input's `size`.
   */
  @property({ reflect: true }) accessor size: DatePickerSize = 'md';

  /** Not editable, still readable. */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Marks the field invalid. Usually set by the Form. */
  @property({ type: Boolean, reflect: true }) accessor invalid = false;

  private errorValue?: string | undefined;

  /** Error message; implies invalid. */
  get error(): string | undefined {
    return this.errorValue;
  }
  @property()
  set error(value: string | undefined) {
    const old = this.errorValue;
    this.errorValue = value;
    // Setting `error` implies `invalid`, synchronously so `checkValidity()`
    // right after an assignment is already correct.
    this.invalid = Boolean(value);
    this.requestUpdate('error', old);
  }

  /** Per-instance style overrides: `{ radius: 'radius.sm' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> | undefined;

  /** Uncontrolled value / start (seeded from `value` ?? `defaultValue`, and re-seeded whenever a controlled `value` changes). */
  @state() private accessor internalStart: string | undefined;

  /** Uncontrolled range end. Unused outside `range`. */
  @state() private accessor internalEnd: string | undefined;

  /** Raw typed text of the start (or single) input. */
  @state() private accessor textStart = '';

  /** Raw typed text of the end input. `range` only. */
  @state() private accessor textEnd = '';

  /** Uncontrolled open state, used when `open` is omitted. */
  @state() private accessor internalOpen = false;

  /** The visible month, 0-based. */
  @state() private accessor viewYear = new Date().getFullYear();

  @state() private accessor viewMonth = new Date().getMonth();

  /** The roving-tabindex day. Cleared on close so the next open recomputes it. */
  @state() private accessor focusedDate = '';

  /** Disabled by an owning native form / fieldset (via `formDisabledCallback`). */
  @state() private accessor formDisabled = false;

  @query('#input') private accessor startInputEl!: HTMLInputElement | null;
  @query('#input-end') private accessor endInputEl!: HTMLInputElement | null;
  @query('#popover') private accessor popoverEl!: DsPopover | null;
  @query('#calendar-button') private accessor calendarButtonEl!: HTMLElement | null;

  private wasOpen = false;
  /** The last value a `change` event was fired for, so a no-op mutation never re-dispatches it. */
  private lastEmittedValue: DatePickerValue | null = null;

  private readonly internals: ElementInternals;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  private get isDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** Whether the calendar is currently open, controlled or not. */
  private get isOpen(): boolean {
    return this.open ?? this.internalOpen;
  }

  /** Routes an open-state change through the controlled `open` prop or `internalOpen`, and fires `open-change` when it actually changes. */
  private setOpen(next: boolean): void {
    if (this.isOpen === next) {
      return;
    }
    if (this.open !== undefined) {
      this.open = next;
    } else {
      this.internalOpen = next;
    }
    this.dispatchEvent(
      new CustomEvent<DatePickerOpenChangeDetail>('open-change', { detail: { open: next }, bubbles: true, composed: true }),
    );
  }

  /** The committed value: the ISO date, `{ start, end }` once both are set (`range`), or `null`. */
  get currentValue(): DatePickerValue | null {
    if (this.range) {
      return this.internalStart !== undefined && this.internalEnd !== undefined
        ? { start: this.internalStart, end: this.internalEnd }
        : null;
    }
    return this.internalStart ?? null;
  }

  /** The owning native form, if any (from `ElementInternals`). */
  get form(): HTMLFormElement | null {
    return this.internals.form;
  }

  get validationMessage(): string {
    return this.internals.validationMessage;
  }

  private get monthOptions(): ListboxOption[] {
    return Array.from({ length: 12 }, (_, m) => ({ value: String(m), label: monthName(this.locale, m) }));
  }

  private get yearRange(): [number, number] {
    const currentYear = new Date().getFullYear();
    const minYear = this.min ? parseISO(this.min).y : currentYear - 100;
    const maxYear = this.max ? parseISO(this.max).y : currentYear + 10;
    return [minYear, maxYear];
  }

  private get yearOptions(): ListboxOption[] {
    const [minYear, maxYear] = this.yearRange;
    const options: ListboxOption[] = [];
    for (let y = minYear; y <= maxYear; y += 1) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }

  private get weekdayLabels(): Array<{ short: string; full: string }> {
    const start = firstDayOfWeek(this.locale);
    return Array.from({ length: 7 }, (_, i) => {
      const weekday = (start + i) % 7;
      return { short: weekdayShort(this.locale, weekday), full: weekdayLong(this.locale, weekday) };
    });
  }

  private get calendarWeeks(): string[][] {
    return getCalendarWeeks(this.viewYear, this.viewMonth, firstDayOfWeek(this.locale));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'DatePicker');
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
    this.value = undefined;
    this.seedFromValue(this.defaultValue);
    this.lastEmittedValue = this.currentValue;
    if (this.open === undefined) {
      this.internalOpen = false;
    }
  }

  formStateRestoreCallback(state: File | string | FormData | null): void {
    if (typeof state === 'string' && !this.range) {
      this.internalStart = state;
      this.textStart = formatDateForDisplay(state, this.locale);
    }
  }

  private seedFromValue(value: DatePickerValue | undefined): void {
    if (this.range) {
      const obj = value && typeof value === 'object' ? value : undefined;
      this.internalStart = obj?.start;
      this.internalEnd = obj?.end;
    } else {
      this.internalStart = typeof value === 'string' ? value : undefined;
      this.internalEnd = undefined;
    }
    this.textStart = this.internalStart ? formatDateForDisplay(this.internalStart, this.locale) : '';
    this.textEnd = this.internalEnd ? formatDateForDisplay(this.internalEnd, this.locale) : '';
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.seedFromValue(this.value ?? this.defaultValue);
      this.lastEmittedValue = this.currentValue;
      const anchor = this.internalStart ?? todayISO();
      this.viewYear = parseISO(anchor).y;
      this.viewMonth = parseISO(anchor).m;
    } else if (changed.has('value') && this.value !== undefined) {
      this.seedFromValue(this.value);
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.syncInternals();
    if (this.isOpen !== this.wasOpen) {
      this.wasOpen = this.isOpen;
      if (this.isOpen) {
        void this.focusSelectedOrToday();
      } else {
        this.focusedDate = '';
      }
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const isDisabled = this.isDisabled;
    const describedBy =
      [this.description ? 'description' : '', this.error ? 'error-message' : '']
        .filter((id) => id !== '')
        .join(' ') || undefined;
    const pattern = patternPlaceholder(this.locale);
    const placeholder = this.placeholder || pattern;
    const gridLabel = COPY_GRID_LABEL(this.label, monthName(this.locale, this.viewMonth), String(this.viewYear));
    const weekdays = this.weekdayLabels;

    return html`
      <ds-text
        id="label"
        part="label"
        class=${classMap({ label: true, 'visually-hidden': this.hideLabel })}
        element="p"
        weight="medium"
        >${this.label}${this.required
          ? html`<span aria-hidden="true">${COPY_REQUIRED_INDICATOR}</span>`
          : nothing}</ds-text
      >
      ${this.description
        ? html`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`
        : nothing}
      <div class=${classMap({ field: true, disabled: isDisabled })} part="field">
        ${this.range ? html`<span id="start-label" class="visually-hidden">${COPY_START_LABEL}</span>` : nothing}
        <input
          id="input"
          part="input"
          class="input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          name=${this.name}
          placeholder=${placeholder}
          .value=${live(this.textStart)}
          aria-labelledby=${this.range ? 'label start-label' : 'label'}
          aria-describedby=${ifDefined(describedBy)}
          aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
          aria-required=${ifDefined(this.required ? 'true' : undefined)}
          aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
          ?readonly=${isDisabled}
          @input=${(event: Event) => this.handleTextInput(event, 'start')}
          @keydown=${(event: KeyboardEvent) => this.handleInputKeydown(event, 'start')}
        />
        ${this.range
          ? html`
              <span class="separator" part="separator" aria-hidden="true">–</span>
              <span id="end-label" class="visually-hidden">${COPY_END_LABEL}</span>
              <input
                id="input-end"
                part="input"
                class="input"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                name="${this.name}-end"
                placeholder=${placeholder}
                .value=${live(this.textEnd)}
                aria-labelledby="label end-label"
                aria-describedby=${ifDefined(describedBy)}
                aria-invalid=${ifDefined(this.invalid ? 'true' : undefined)}
                aria-disabled=${ifDefined(isDisabled ? 'true' : undefined)}
                ?readonly=${isDisabled}
                @input=${(event: Event) => this.handleTextInput(event, 'end')}
                @keydown=${(event: KeyboardEvent) => this.handleInputKeydown(event, 'end')}
              />
            `
          : nothing}
        <ds-popover
          id="popover"
          part="popover"
          placement="bottom-start"
          no-dismiss
          .open=${this.isOpen}
          .overrides=${{ inset: this.overrides?.calendarInset }}
          @open-change=${this.handlePopoverOpenChange}
        >
          <ds-button
            slot="trigger"
            id="calendar-button"
            part="calendarButton"
            variant="ghost"
            size=${this.size}
            icon-only
            label=${this.range ? COPY_OPEN_RANGE : COPY_OPEN}
            ?disabled=${isDisabled}
            @press=${(event: Event) => event.stopPropagation()}
          >
            <ds-icon slot="leading-icon" name="calendar"></ds-icon>
          </ds-button>
          <div class="calendar">
            <div class="header" part="header">
              <ds-button
                part="prevMonthButton"
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
                class="month-select"
                label=${COPY_MONTH}
                name="month"
                .options=${this.monthOptions}
                .value=${String(this.viewMonth)}
                ?disabled=${isDisabled}
                @change=${this.handleMonthChange}
              ></ds-select>
              <ds-select
                part="yearSelect"
                class="year-select"
                label=${COPY_YEAR}
                name="year"
                .options=${this.yearOptions}
                .value=${String(this.viewYear)}
                ?disabled=${isDisabled}
                @change=${this.handleYearChange}
              ></ds-select>
              <ds-button
                part="nextMonthButton"
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
            <div id="grid-label" class="visually-hidden">${gridLabel}</div>
            <table role="grid" part="grid" class="grid" aria-labelledby="grid-label" @keydown=${this.handleGridKeydown}>
              <thead>
                <tr>
                  ${this.showWeekNumbers
                    ? html`<th class="weekday" scope="col">${COPY_WEEK_NUMBER}</th>`
                    : nothing}
                  ${weekdays.map(
                    (day) => html`<th class="weekday" part="weekdayHeader" scope="col" abbr=${day.full}>${day.short}</th>`,
                  )}
                </tr>
              </thead>
              <tbody>
                ${this.calendarWeeks.map(
                  (week) => html`
                    <tr>
                      ${this.showWeekNumbers ? html`<td class="week-number">${isoWeekNumber(week[0]!)}</td>` : nothing}
                      ${week.map((iso) => this.renderDay(iso))}
                    </tr>
                  `,
                )}
              </tbody>
            </table>
            <div class="footer" part="footer">
              <ds-button
                part="todayButton"
                variant="ghost"
                size="sm"
                label=${COPY_TODAY}
                ?disabled=${isDisabled}
                @press=${this.handleTodayPress}
              ></ds-button>
              <ds-button
                part="clearButton"
                variant="ghost"
                size="sm"
                label=${COPY_CLEAR}
                ?disabled=${isDisabled}
                @press=${this.handleClearPress}
              ></ds-button>
            </div>
          </div>
        </ds-popover>
      </div>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error ?? ''}</div>
    `;
  }

  private renderDay(iso: string) {
    const { m, d } = parseISO(iso);
    const inMonth = m === this.viewMonth;
    const isToday = iso === todayISO();
    const isDayDisabledValue = this.isDayDisabled(iso);
    const isSelected = iso === this.internalStart || iso === this.internalEnd;
    const isInRange =
      this.range &&
      this.internalStart !== undefined &&
      this.internalEnd !== undefined &&
      iso > this.internalStart &&
      iso < this.internalEnd;
    const tabIndex = iso === this.focusedDate ? 0 : -1;

    let label = formatFullDate(iso, this.locale);
    if (isToday) {
      label += ` ${COPY_TODAY_LABEL}`;
    }
    if (isSelected) {
      label += ` ${COPY_SELECTED}`;
    }

    return html`
      <td role="gridcell">
        <button
          type="button"
          part="day"
          class=${classMap({
            day: true,
            outside: !inMonth,
            today: isToday,
            selected: isSelected,
            'in-range': isInRange,
            disabled: isDayDisabledValue,
          })}
          data-iso=${iso}
          tabindex=${tabIndex}
          aria-selected=${isSelected ? 'true' : 'false'}
          aria-current=${isToday ? 'date' : nothing}
          aria-disabled=${isDayDisabledValue ? 'true' : nothing}
          aria-label=${label}
          @click=${() => this.handleDayClick(iso)}
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

  private isDayDisabled(iso: string): boolean {
    if (this.min && iso < this.min) {
      return true;
    }
    if (this.max && iso > this.max) {
      return true;
    }
    if (this.isDateDisabled?.(iso)) {
      return true;
    }
    return false;
  }

  private nextEnabledDate(iso: string, deltaDays: number): string {
    let candidate = iso;
    for (let i = 0; i < 366; i += 1) {
      candidate = addDays(candidate, deltaDays);
      if (!this.isDayDisabled(candidate)) {
        return candidate;
      }
    }
    return candidate;
  }

  private startOfWeek(iso: string): string {
    const start = firstDayOfWeek(this.locale);
    const dow = weekdayOf(iso);
    return addDays(iso, -((dow - start + 7) % 7));
  }

  private endOfWeek(iso: string): string {
    return addDays(this.startOfWeek(iso), 6);
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
    this.renderRoot.querySelector<HTMLButtonElement>(`button[data-iso="${iso}"]`)?.focus();
  }

  private readonly handleGridKeydown = (event: KeyboardEvent): void => {
    if (this.isDisabled) {
      return;
    }
    const current = this.focusedDate || todayISO();
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        void this.moveFocusTo(this.nextEnabledDate(current, 1));
        return;
      case 'ArrowLeft':
        event.preventDefault();
        void this.moveFocusTo(this.nextEnabledDate(current, -1));
        return;
      case 'ArrowDown':
        event.preventDefault();
        void this.moveFocusTo(this.nextEnabledDate(current, 7));
        return;
      case 'ArrowUp':
        event.preventDefault();
        void this.moveFocusTo(this.nextEnabledDate(current, -7));
        return;
      case 'Home':
        event.preventDefault();
        void this.moveFocusTo(this.startOfWeek(current));
        return;
      case 'End':
        event.preventDefault();
        void this.moveFocusTo(this.endOfWeek(current));
        return;
      case 'PageUp':
        event.preventDefault();
        void this.moveFocusTo(event.shiftKey ? addYears(current, -1) : addMonths(current, -1));
        return;
      case 'PageDown':
        event.preventDefault();
        void this.moveFocusTo(event.shiftKey ? addYears(current, 1) : addMonths(current, 1));
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.handleDayClick(current);
        return;
      default:
        return;
    }
  };

  private handleDayClick(iso: string): void {
    if (this.isDisabled || this.isDayDisabled(iso)) {
      return;
    }
    this.focusedDate = iso;
    if (!this.range) {
      this.internalStart = iso;
      this.textStart = formatDateForDisplay(iso, this.locale);
      this.maybeEmitChange();
      this.closeCalendar();
      return;
    }
    const start = this.internalStart;
    if (start !== undefined && this.internalEnd === undefined && iso >= start) {
      this.internalEnd = iso;
      this.textEnd = formatDateForDisplay(iso, this.locale);
      this.maybeEmitChange();
      this.closeCalendar();
    } else {
      // First pick, or picking before the current start: (re)starts the range.
      this.internalStart = iso;
      this.internalEnd = undefined;
      this.textStart = formatDateForDisplay(iso, this.locale);
      this.textEnd = '';
      this.maybeEmitChange();
    }
  }

  private closeCalendar(): void {
    this.setOpen(false);
    void this.focusCalendarButton();
  }

  private async focusCalendarButton(): Promise<void> {
    await this.updateComplete;
    this.calendarButtonEl?.focus();
  }

  private async focusSelectedOrToday(): Promise<void> {
    const target = this.focusedDate !== '' ? this.focusedDate : (this.internalStart ?? this.internalEnd ?? todayISO());
    this.moveViewTo(target);
    await this.updateComplete;
    await this.popoverEl?.updateComplete;
    this.renderRoot.querySelector<HTMLButtonElement>(`button[data-iso="${target}"]`)?.focus();
  }

  private readonly handlePrevMonthPress = (event: Event): void => {
    event.stopPropagation();
    this.shiftView(-1);
  };

  private readonly handleNextMonthPress = (event: Event): void => {
    event.stopPropagation();
    this.shiftView(1);
  };

  private shiftView(deltaMonths: number): void {
    const next = addMonths(toISO(this.viewYear, this.viewMonth, 1), deltaMonths);
    this.viewYear = parseISO(next).y;
    this.viewMonth = parseISO(next).m;
  }

  private readonly handleMonthChange = (event: CustomEvent<SelectChangeDetail>): void => {
    event.stopPropagation();
    const month = Number(event.detail.value);
    const anchor = this.focusedDate || toISO(this.viewYear, this.viewMonth, 1);
    const next = clampDayIntoMonth(this.viewYear, month, parseISO(anchor).d);
    this.moveViewTo(next);
  };

  private readonly handleYearChange = (event: CustomEvent<SelectChangeDetail>): void => {
    event.stopPropagation();
    const year = Number(event.detail.value);
    const anchor = this.focusedDate || toISO(this.viewYear, this.viewMonth, 1);
    const next = clampDayIntoMonth(year, this.viewMonth, parseISO(anchor).d);
    this.moveViewTo(next);
  };

  private readonly handleTodayPress = (event: Event): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.handleDayClick(todayISO());
  };

  private readonly handleClearPress = (event: Event): void => {
    event.stopPropagation();
    if (this.isDisabled) {
      return;
    }
    this.internalStart = undefined;
    this.internalEnd = undefined;
    this.textStart = '';
    this.textEnd = '';
    this.maybeEmitChange();
    this.moveViewTo(todayISO());
  };

  private handleTextInput(event: Event, which: 'start' | 'end'): void {
    const text = (event.currentTarget as HTMLInputElement).value;
    if (which === 'start') {
      this.textStart = text;
    } else {
      this.textEnd = text;
    }
    if (text.trim() === '') {
      if (which === 'start') {
        this.internalStart = undefined;
      } else {
        this.internalEnd = undefined;
      }
      this.maybeEmitChange();
      return;
    }
    const parsed = parseTypedDate(text, this.locale);
    if (parsed === null) {
      // Left incomplete/unparseable; the last committed value stands until this resolves to a real date.
      return;
    }
    if (which === 'start') {
      this.internalStart = parsed;
    } else {
      this.internalEnd = parsed;
    }
    if (this.isOpen) {
      this.moveViewTo(parsed);
    }
    this.maybeEmitChange();
  }

  private handleInputKeydown(event: KeyboardEvent, which: 'start' | 'end'): void {
    if (this.isDisabled) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const anchor = (which === 'start' ? this.internalStart : this.internalEnd) ?? this.internalStart ?? todayISO();
      this.moveViewTo(anchor);
      this.setOpen(true);
    }
  }

  private readonly handlePopoverOpenChange = (event: CustomEvent<PopoverOpenChangeDetail>): void => {
    this.setOpen(event.detail.open);
  };

  private valuesEqual(a: DatePickerValue | null, b: DatePickerValue | null): boolean {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    if (typeof a === 'string' || typeof b === 'string') {
      return a === b;
    }
    return a.start === b.start && a.end === b.end;
  }

  private maybeEmitChange(): void {
    const next = this.currentValue;
    if (this.valuesEqual(next, this.lastEmittedValue)) {
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
  }

  /** Mirrors value and validity into ElementInternals. */
  private syncInternals(): void {
    const value = this.currentValue;
    const isDisabled = this.isDisabled;

    if (this.range) {
      if (isDisabled || value === null) {
        this.internals.setFormValue(null);
      } else {
        const range = value as { start: string; end: string };
        const formData = new FormData();
        formData.append(this.name, range.start);
        formData.append(`${this.name}-end`, range.end);
        this.internals.setFormValue(formData);
      }
    } else {
      this.internals.setFormValue(isDisabled || value === null ? null : (value as string));
    }

    if (isDisabled) {
      this.internals.setValidity({});
      return;
    }

    const anchor = this.startInputEl;
    const pattern = patternPlaceholder(this.locale);
    const startText = this.textStart.trim();
    const endText = this.textEnd.trim();

    if (this.error) {
      this.internals.setValidity({ customError: true }, this.error, anchor!);
    } else if (this.invalid) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label, pattern), anchor!);
    } else if (this.required && value === null) {
      this.internals.setValidity({ valueMissing: true }, COPY_REQUIRED(this.label), anchor!);
    } else if (startText !== '' && parseTypedDate(this.textStart, this.locale) === null) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label, pattern), anchor!);
    } else if (this.range && endText !== '' && parseTypedDate(this.textEnd, this.locale) === null) {
      this.internals.setValidity({ customError: true }, COPY_INVALID(this.label, pattern), anchor!);
    } else if (this.min && this.internalStart !== undefined && this.internalStart < this.min) {
      this.internals.setValidity({ rangeUnderflow: true }, COPY_TOO_EARLY(this.label, this.min), anchor!);
    } else if (this.max && ((this.range ? this.internalEnd : this.internalStart) ?? '') > this.max) {
      this.internals.setValidity({ rangeOverflow: true }, COPY_TOO_LATE(this.label, this.max), anchor!);
    } else if (
      this.range &&
      this.internalStart !== undefined &&
      this.internalEnd !== undefined &&
      this.internalEnd < this.internalStart
    ) {
      this.internals.setValidity({ customError: true }, COPY_RANGE_ORDER, anchor!);
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

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.label) {
      console.warn('<ds-date-picker> requires a `label`.', this);
    }
    if (!this.name) {
      console.warn('<ds-date-picker> requires a `name`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-date-picker': DsDatePicker;
  }
}
