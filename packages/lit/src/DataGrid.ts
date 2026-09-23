import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Checkbox.js';
import './DatePicker.js';
import './Heading.js';
import './Icon.js';
import './Input.js';
import './NumberInput.js';
import './Select.js';
import './Text.js';
import type { ButtonOverridableBinding } from './Button.js';
import type { CheckboxChangeDetail, CheckboxOverridableBinding, DsCheckbox } from './Checkbox.js';
import type { DatePickerOverridableBinding, DsDatePicker } from './DatePicker.js';
import type { DsInput, InputOverridableBinding } from './Input.js';
import type { DsNumberInput, NumberInputOverridableBinding } from './NumberInput.js';
import type { DsSelect, SelectOpenChangeDetail, SelectOverridableBinding } from './Select.js';

/** A single record. `id` must be stable across renders. */
export interface DataGridRow {
  id: string;
  [key: string]: unknown;
}

export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';

export interface DataGridColumnOption {
  value: string;
  label: string;
}

/** A column definition. Exactly one column may set `isRowHeader`. */
export interface DataGridColumn {
  key: string;
  header: string;
  /** The spoken form of a short header ("Quantity" for "Qty"). */
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  /** Pixel width, a multiple of space.1; 160 when omitted. Grid columns do not auto-size. */
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  /** Pinned columns must be contiguous at the start or end of `columns`. */
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  /** Cell content: a lit `TemplateResult`, string or number. */
  render?: ((row: DataGridRow) => unknown) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}

export type DataGridSortDirection = 'ascending' | 'descending';

export interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}

export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';
/** Heading level of the caption in the page outline; its size stays `captionSize` regardless. */
export type DataGridCaptionLevel = '2' | '3' | '4';

export interface DataGridCellRef {
  rowId: string;
  column: string;
}

export interface DataGridRangeRef {
  from: DataGridCellRef;
  to: DataGridCellRef;
}

/** Row ids (`row`), one cell (`cell`) or a range (`range`), matching `selectable`. */
export type DataGridSelection = string[] | DataGridCellRef | DataGridRangeRef;

/** A committed cell value; `undefined` when Delete/Backspace clears the cell. */
export type DataGridCellValue = string | number | boolean | undefined;

/** Detail carried by the `sort-change` CustomEvent. */
export interface DataGridSortChangeDetail {
  column: string;
  direction: DataGridSortDirection;
}

/** Detail carried by the `selection-change` CustomEvent. */
export interface DataGridSelectionChangeDetail {
  selection: DataGridSelection;
}

/** Detail carried by the `cell-change` CustomEvent. The caller updates `data`; the grid shows the old value until then. */
export interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: DataGridCellValue;
  previous: DataGridCellValue;
}

/** Detail carried by the cancelable `edit-start` CustomEvent: `preventDefault()` refuses the edit. */
export interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}

/** Detail carried by the `range-needed` CustomEvent: inclusive row indexes to load. */
export interface DataGridRangeNeededDetail {
  start: number;
  end: number;
}

/** Detail carried by the `column-resize` CustomEvent. */
export interface DataGridColumnResizeDetail {
  column: string;
  width: number;
}

/* copy.* — used verbatim */
const COPY_SORT_ASCENDING = (column: string): string => `Sort by ${column}, ascending`;
const COPY_SORT_DESCENDING = (column: string): string => `Sort by ${column}, descending`;
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: string): string => `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_ROWS = (count: number, total: number): string => `${count} of ${total} rows selected`;
const COPY_SELECTED_RANGE = (rows: number, columns: number): string => `${rows} rows by ${columns} columns selected`;
const COPY_COPIED = {
  one: (cells: number): string => `Copied ${cells} cell`,
  other: (cells: number): string => `Copied ${cells} cells`,
};
const COPY_EDITING = (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`;
const COPY_INVALID = (message: string): string => `${message}`;
const COPY_ROW_COUNT = {
  one: (count: number): string => `${count} row`,
  other: (count: number): string => `${count} rows`,
};
const COPY_POSITION = (row: number, column: string): string => `Row ${row}, ${column}`;
const COPY_RESIZE = (column: string): string => `Resize ${column}`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing to show.';
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';

/** Rows rendered before one has been measured; they are positioned from the row-size token (literal-ok: the doc's cap). */
const UNMEASURED_ROW_CAP = 50;

/** Selects `one`/`other` with the document locale's plural rules. */
function pluralForm(count: number): 'one' | 'other' {
  return new Intl.PluralRules(document.documentElement.lang || undefined).select(count) === 'one' ? 'one' : 'other';
}

/** `showStatusBar`/`stickyHeader` default true, so their attributes are the negated `no-status-bar`/`no-sticky-header`. */
const NEGATED_BOOLEAN = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * Overridable style hooks; see the `overrides` property. Accessibility-bearing bindings (`surface`, `headerSurface`,
 * `headerColor`, `rowHeight`, `rowHeightComfortable`, `rowSelected*`, `cellColor`, `cellMutedColor`, `cellFocusRing*`,
 * `cellEditing*`, `cellInvalid*`, `range*`, `statusBarSurface`, `statusBarColor`, `minTarget`, `focusRing*`) are locked.
 */
export type DataGridOverridableBinding =
  | 'headerWeight'
  | 'headerSize'
  | 'headerBorder'
  | 'headerBorderWidth'
  | 'headerShadow'
  | 'gridLine'
  | 'gridLineWidth'
  | 'rowHover'
  | 'cellPaddingInline'
  | 'columnWidth'
  | 'pinnedShadow'
  | 'resizeHandle'
  | 'resizeHandleWidth'
  | 'resizeStep'
  | 'statusBarSize'
  | 'statusBarPadding'
  | 'statusBarGap'
  | 'captionSize'
  | 'captionWeight'
  | 'captionGap'
  | 'fixedHeight'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'numericFont'
  | 'transition';

const HOOKS: Record<DataGridOverridableBinding, string> = {
  headerWeight: '--ds-data-grid-header-weight',
  headerSize: '--ds-data-grid-header-size',
  headerBorder: '--ds-data-grid-header-border',
  headerBorderWidth: '--ds-data-grid-header-border-width',
  headerShadow: '--ds-data-grid-header-shadow',
  gridLine: '--ds-data-grid-grid-line',
  gridLineWidth: '--ds-data-grid-grid-line-width',
  rowHover: '--ds-data-grid-row-hover',
  cellPaddingInline: '--ds-data-grid-cell-padding-inline',
  columnWidth: '--ds-data-grid-column-width',
  pinnedShadow: '--ds-data-grid-pinned-shadow',
  resizeHandle: '--ds-data-grid-resize-handle',
  resizeHandleWidth: '--ds-data-grid-resize-handle-width',
  resizeStep: '--ds-data-grid-resize-step',
  statusBarSize: '--ds-data-grid-status-bar-size',
  statusBarPadding: '--ds-data-grid-status-bar-padding',
  statusBarGap: '--ds-data-grid-status-bar-gap',
  captionSize: '--ds-data-grid-caption-size',
  captionWeight: '--ds-data-grid-caption-weight',
  captionGap: '--ds-data-grid-caption-gap',
  fixedHeight: '--ds-data-grid-fixed-height',
  fontFamily: '--ds-data-grid-font-family',
  fontSize: '--ds-data-grid-font-size',
  lineHeight: '--ds-data-grid-line-height',
  numericFont: '--ds-data-grid-numeric-font',
  transition: '--ds-data-grid-transition',
};

/* Editors are composed with their inset zeroed through their own overrides. */
const INPUT_INSET: Partial<Record<InputOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
const NUMBER_INSET: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
const SELECT_INSET: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> = {
  triggerPaddingBlock: 'space.0',
  triggerPaddingInline: 'space.0',
};
const DATE_INSET: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
/** minTarget (locked), forwarded to the select Checkboxes: a select cell is a full minimum target. */
const SELECT_CHECKBOX: Partial<Record<CheckboxOverridableBinding, TokenRef | undefined>> = {
  controlSize: 'size.target.min',
};
/** The sort Button's text lines up with the cells; `headerWeight`/`headerSize` reach it through its own hooks. */
const SORT_BUTTON_INSET: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {
  paddingInline: 'space.0',
};

/** Content that takes focus inside a cell; demoted to `tabindex="-1"` so the grid stays one tab stop. */
const CELL_CONTROLS = 'a[href], button, input, select, textarea, [tabindex], ds-button, ds-link, ds-checkbox';

interface CellPos {
  row: number;
  col: number;
}

interface RangeState {
  anchor: CellPos;
  focus: CellPos;
}

interface EditingState {
  rowId: string;
  column: string;
  /** A typed character that opened a text or number editor; replaces the value. */
  seed?: string | undefined;
  error?: string | undefined;
}

/** A data value as `cell-change` reports it. */
function cellValue(raw: unknown): DataGridCellValue {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  return String(raw);
}

function textOf(raw: unknown): string {
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return textOf(left).localeCompare(textOf(right), undefined, { numeric: true });
}

/** An IDREF-safe token for a row id. */
function idToken(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * `<ds-data-grid>` — DataGrid (category: data, APG pattern: grid).
 *
 * `<ds-data-grid caption="Price list" .columns=${columns} .data=${rows} editable selectable="range">` builds an APG
 * grid in its shadow root from `div`s with explicit `grid`/`rowgroup`/`row`/`columnheader`/`rowheader`/`gridcell`
 * roles. The grid element is the one tab stop and points `aria-activedescendant` at the current cell; real focus
 * moves into a cell only for an open editor or a control the cell renders, and returns on Escape or commit.
 * `height: viewport` and `fixed` virtualize the body: one measured row height, a spacer sized to the whole set,
 * rows translated into place with one page of overscan, `repeat` keyed by row id.
 *
 * Editors are the composed `ds-input`, `ds-number-input`, `ds-select`, `ds-date-picker` and `ds-checkbox` with a
 * visually hidden label, `size="sm"` and a zero inset. The status bar is the visible counterpart of the live region.
 *
 * @fires sort-change - A sortable header was activated, with `{ column, direction }`.
 * @fires selection-change - The selection changed, with `{ selection }` (row ids, a cell or a range).
 * @fires cell-change - An edit committed, with `{ rowId, column, value, previous }`.
 * @fires edit-start - An editor is about to open, with `{ rowId, column }`; cancelable.
 * @fires range-needed - The window neared the end of loaded `data`, with `{ start, end }` row indexes to load.
 * @fires column-resize - A column resize finished, with `{ column, width }`.
 */
@customElement('ds-data-grid')
export class DsDataGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-data-grid-header-weight: var(--font-weight-semibold);
      --ds-data-grid-header-size: var(--font-size-sm);
      --ds-data-grid-header-border: var(--color-border-strong);
      --ds-data-grid-header-border-width: var(--border-width-thin);
      --ds-data-grid-header-shadow: var(--shadow-raised);
      --ds-data-grid-grid-line: var(--color-border);
      --ds-data-grid-grid-line-width: var(--border-width-thin);
      --ds-data-grid-row-hover: var(--color-action-ghost-background-hover);
      --ds-data-grid-cell-padding-inline: var(--space-2);
      --ds-data-grid-column-width: var(--space-20);
      --ds-data-grid-pinned-shadow: var(--shadow-raised);
      --ds-data-grid-resize-handle: var(--color-border-strong);
      --ds-data-grid-resize-handle-width: var(--space-1);
      --ds-data-grid-resize-step: var(--space-4);
      --ds-data-grid-status-bar-size: var(--font-size-xs);
      --ds-data-grid-status-bar-padding: var(--space-2);
      --ds-data-grid-status-bar-gap: var(--space-2);
      --ds-data-grid-caption-size: var(--font-size-md);
      --ds-data-grid-caption-weight: var(--font-weight-semibold);
      --ds-data-grid-caption-gap: var(--space-2);
      --ds-data-grid-fixed-height: var(--space-20);
      --ds-data-grid-font-family: var(--font-family-body);
      --ds-data-grid-font-size: var(--font-size-sm);
      --ds-data-grid-line-height: var(--font-line-height-tight);
      --ds-data-grid-numeric-font: var(--font-family-mono);
      --ds-data-grid-transition: var(--motion-duration-fast);
      /* rowHeight / rowHeightComfortable / selectColumnWidth (locked): hooks, read into the internal sizes below */
      --ds-data-grid-row-height: var(--size-target-min);
      --ds-data-grid-row-height-comfortable: var(--size-target-comfortable);
      --ds-data-grid-select-column-width: var(--size-target-min);
      /* minTarget (locked): the resize floor; the select Checkboxes receive it through their own overrides. */
      --ds-data-grid-min-target: var(--size-target-min);
      /* The other locked bindings: themeable from page CSS, never through the overrides property. */
      --ds-data-grid-surface: var(--color-background);
      --ds-data-grid-header-surface: var(--color-background-subtle);
      --ds-data-grid-header-color: var(--color-foreground);
      --ds-data-grid-row-selected: var(--color-background-subtle);
      --ds-data-grid-row-selected-border: var(--color-control-selected-background);
      --ds-data-grid-row-selected-border-width: var(--border-width-focus);
      --ds-data-grid-cell-color: var(--color-foreground);
      --ds-data-grid-cell-muted-color: var(--color-foreground-muted);
      --ds-data-grid-cell-focus-ring: var(--color-border-focus);
      --ds-data-grid-cell-focus-ring-width: var(--border-width-focus);
      --ds-data-grid-cell-editing-background: var(--color-control-background);
      --ds-data-grid-cell-editing-border: var(--color-border-focus);
      --ds-data-grid-cell-invalid-border: var(--color-border-danger);
      --ds-data-grid-cell-invalid-background: var(--color-status-danger-background);
      --ds-data-grid-cell-invalid-foreground: var(--color-status-danger-foreground);
      --ds-data-grid-range-background: var(--color-background-strong);
      --ds-data-grid-range-border: var(--color-control-selected-background);
      --ds-data-grid-range-border-width: var(--border-width-focus);
      --ds-data-grid-status-bar-surface: var(--color-background-subtle);
      --ds-data-grid-status-bar-color: var(--color-foreground-muted);
      --ds-data-grid-focus-ring: var(--color-border-focus);
      --ds-data-grid-focus-ring-width: var(--border-width-focus);
      font-family: var(--ds-data-grid-font-family);
      font-size: var(--ds-data-grid-font-size);
      line-height: var(--ds-data-grid-line-height);
      /* cellColor (locked) */
      color: var(--ds-data-grid-cell-color);
    }

    :host([hidden]) {
      display: none;
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

    /* surface (locked) */
    [data-part='container'] {
      position: relative;
      background: var(--ds-data-grid-surface);
      /*
       * Internal sizes the consumer cannot set, resolved from the hooks on :host. The density-selected row height
       * (virtualization measures a rendered row instead, once one exists); columnWidth doubled, so the hook keeps
       * the bare token; the selection column's total inline size, selectColumnWidth plus 2 × cellPaddingInline —
       * the cell carries no inline padding of its own, and pinned-start offsets add the same total.
       */
      --ds-data-grid-row-size: var(--ds-data-grid-row-height);
      --ds-data-grid-column-size: calc(var(--ds-data-grid-column-width) * 2);
      --ds-data-grid-select-column-size: calc(
        var(--ds-data-grid-select-column-width) + 2 * var(--ds-data-grid-cell-padding-inline)
      );
    }
    /* A grid with a selection column is comfortable at both densities: a compact row cannot hold a minTarget Checkbox. */
    :host([density='comfortable']) [data-part='container'],
    :host([selectable='row']) [data-part='container'] {
      --ds-data-grid-row-size: var(--ds-data-grid-row-height-comfortable);
    }
    /*
     * viewport and fixed size the whole component; the scroll region takes what the caption and status bar leave,
     * so the grid scrolls rather than the page.
     */
    :host([height='viewport']) [data-part='container'],
    :host([height='fixed']) [data-part='container'] {
      display: flex;
      flex-direction: column;
    }
    :host([height='viewport']) [data-part='container'] {
      block-size: calc(100vh - 2 * var(--layout-gap-section));
    }
    :host([height='fixed']) [data-part='container'] {
      block-size: var(--ds-data-grid-fixed-height);
    }

    /* captionSize / captionWeight reach the composed Heading through its documented hooks; captionGap separates it. */
    [data-part='caption'] {
      display: block;
      padding-block-end: var(--ds-data-grid-caption-gap);
    }
    [data-part='caption'] ds-heading {
      --ds-heading-font-size: var(--ds-data-grid-caption-size);
      --ds-heading-font-weight: var(--ds-data-grid-caption-weight);
      --ds-heading-margin-block-end: var(--space-0);
    }

    [data-part='scrollRegion'] {
      position: relative;
      overflow: auto;
      /* surface is on the container, which paints behind this region. */
      border: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
    }
    :host([height='viewport']) [data-part='scrollRegion'],
    :host([height='fixed']) [data-part='scrollRegion'] {
      flex: 1 1 auto;
      min-block-size: 0;
    }
    /* focusRing / focusRingWidth (locked): the grid is the tab stop */
    [data-part='scrollRegion']:has([data-part='grid']:focus-visible) {
      outline: var(--ds-data-grid-focus-ring-width) solid var(--ds-data-grid-focus-ring);
      outline-offset: calc(-1 * var(--ds-data-grid-focus-ring-width));
    }

    [data-part='grid'] {
      position: relative;
      outline: none;
    }

    /*
     * The header sticks to the grid's own scroll region, never to the page: always when virtualized, and with
     * height content the region does not scroll vertically, so stickyHeader changes nothing either way.
     */
    [data-part='header'] {
      position: sticky;
      inset-block-start: 0;
      z-index: 3;
    }
    /* headerShadow: once the body has scrolled */
    [data-part='header'].raised {
      box-shadow: var(--ds-data-grid-header-shadow);
    }

    /* Tracks and the row width are internal variables the grid sets on its grid element from the column model. */
    .row-layout {
      display: grid;
      box-sizing: border-box;
      grid-template-columns: var(--ds-data-grid-tracks);
      inline-size: var(--ds-data-grid-row-width);
    }

    /* rowHeight / rowHeightComfortable (locked) */
    [data-part='headerRow'],
    [data-part='row'] {
      block-size: var(--ds-data-grid-row-size);
    }

    [data-part='body'] {
      position: relative;
    }

    [data-part='row'] {
      position: relative;
      z-index: 1;
      transition: background-color var(--ds-data-grid-transition) var(--motion-easing-standard);
    }
    [data-part='row'].virtual {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
    }
    /* rowHover */
    [data-part='row']:hover {
      background: var(--ds-data-grid-row-hover);
    }
    /* rowSelected (locked) */
    [data-part='row'][aria-selected='true'] {
      background: var(--ds-data-grid-row-selected);
    }
    /* rowSelectedBorder / rowSelectedBorderWidth (locked): a start-edge bar, so selection is not fill alone */
    [data-part='row'][aria-selected='true'] > :first-child {
      box-shadow: inset var(--ds-data-grid-row-selected-border-width) 0 0 0 var(--ds-data-grid-row-selected-border);
    }
    [data-part='row'][aria-selected='true'] > :first-child:dir(rtl) {
      box-shadow: inset calc(-1 * var(--ds-data-grid-row-selected-border-width)) 0 0 0
        var(--ds-data-grid-row-selected-border);
    }

    .cell {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      min-inline-size: 0;
      padding-inline: var(--ds-data-grid-cell-padding-inline);
      /* gridLine / gridLineWidth: cell borders on both axes */
      border-inline-end: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
      border-block-end: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
      overflow: hidden;
      white-space: nowrap;
      outline: none;
    }
    [data-part='cellContent'] {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* headerSurface / headerColor (locked); headerWeight / headerSize / headerBorder / headerBorderWidth */
    [data-part='columnHeader'],
    .select-all-cell {
      background: var(--ds-data-grid-header-surface);
      color: var(--ds-data-grid-header-color);
      font-weight: var(--ds-data-grid-header-weight);
      font-size: var(--ds-data-grid-header-size);
      border-block-end: var(--ds-data-grid-header-border-width) solid var(--ds-data-grid-header-border);
    }
    /* headerWeight / headerSize forwarded to the composed sort Button through its own hooks */
    [data-part='sortButton'] {
      display: inline-flex;
      min-inline-size: 0;
    }
    [data-part='sortButton'] ds-button {
      --ds-button-font-weight: var(--ds-data-grid-header-weight);
      --ds-button-font-size: var(--ds-data-grid-header-size);
    }

    [data-part='rowHeader'],
    [data-part='cell'] {
      color: var(--ds-data-grid-cell-color);
    }
    /* cellMutedColor (locked): existing rows stay while loading, but read as stale */
    .cell.muted {
      color: var(--ds-data-grid-cell-muted-color);
    }
    .cell.numeric {
      font-family: var(--ds-data-grid-numeric-font);
      font-variant-numeric: tabular-nums;
    }
    .cell.align-end {
      justify-content: flex-end;
      text-align: end;
    }
    .cell.align-center {
      justify-content: center;
      text-align: center;
    }

    /* selectColumnWidth / minTarget (locked) */
    .select-cell,
    .select-all-cell {
      justify-content: center;
      padding-inline: 0;
      min-inline-size: var(--ds-data-grid-select-column-size);
    }
    /*
     * minTarget (locked) is forwarded to each select Checkbox's own overrides.controlSize, which sets the hook on
     * the ds-checkbox element itself (a declaration on the cell would lose to Checkbox's :host default).
     */

    .pinned-start,
    .pinned-end {
      position: sticky;
      z-index: 2;
      background: var(--ds-data-grid-surface);
    }
    [data-part='columnHeader'].pinned-start,
    [data-part='columnHeader'].pinned-end,
    .select-all-cell.pinned-start {
      z-index: 4;
      background: var(--ds-data-grid-header-surface);
    }
    /* rowHover over opaque pinned cells (the select cell included), layered on the surface they must keep */
    [data-part='row']:hover > .pinned-start,
    [data-part='row']:hover > .pinned-end {
      background-color: var(--ds-data-grid-surface);
      background-image: linear-gradient(var(--ds-data-grid-row-hover), var(--ds-data-grid-row-hover));
    }
    /* a selected row keeps rowSelected, pinned cells included */
    [data-part='row'][aria-selected='true'] > .pinned-start,
    [data-part='row'][aria-selected='true'] > .pinned-end {
      background: var(--ds-data-grid-row-selected);
    }
    /* pinnedShadow: once the body has scrolled sideways */
    .x-scrolled .pinned-start,
    .x-scrolled .pinned-end {
      box-shadow: var(--ds-data-grid-pinned-shadow);
    }
    .x-scrolled [data-part='row'][aria-selected='true'] > .pinned-start:first-child {
      box-shadow:
        inset var(--ds-data-grid-row-selected-border-width) 0 0 0 var(--ds-data-grid-row-selected-border),
        var(--ds-data-grid-pinned-shadow);
    }

    /* cellFocusRing / cellFocusRingWidth (locked): inset, so neighbors and the scroll region never clip it */
    [data-part='grid']:focus-within .cell.active::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      box-shadow: inset 0 0 0 var(--ds-data-grid-cell-focus-ring-width) var(--ds-data-grid-cell-focus-ring);
    }

    /* cellEditingBackground / cellEditingBorder (locked) */
    .cell.editing {
      background: var(--ds-data-grid-cell-editing-background);
      box-shadow: inset 0 0 0 var(--ds-data-grid-cell-focus-ring-width) var(--ds-data-grid-cell-editing-border);
      padding-inline: 0;
      transition: background-color var(--ds-data-grid-transition) var(--motion-easing-standard);
    }
    /* cellInvalidBackground / cellInvalidBorder (locked): the cell holds the untouched editor and nothing else */
    .cell.invalid {
      background: var(--ds-data-grid-cell-invalid-background);
      box-shadow: inset 0 0 0 var(--ds-data-grid-cell-focus-ring-width) var(--ds-data-grid-cell-invalid-border);
    }
    /* cellInvalidForeground (locked): the status-bar message re-scopes the foreground around a default-tone Text */
    .invalid-message {
      display: inline-flex;
      background: var(--ds-data-grid-cell-invalid-background);
      --color-foreground: var(--ds-data-grid-cell-invalid-foreground);
    }
    .editor-frame {
      display: flex;
      align-items: center;
      inline-size: 100%;
      block-size: 100%;
    }
    .editor-frame > * {
      inline-size: 100%;
    }

    /* resizeHandle / resizeHandleWidth: visible on hover or focus of the header cell */
    .resize-handle {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: var(--ds-data-grid-resize-handle-width);
      cursor: col-resize;
      touch-action: none;
      z-index: 5;
    }
    [data-part='columnHeader']:hover .resize-handle,
    [data-part='grid']:focus-within [data-part='columnHeader'].active .resize-handle,
    .resize-handle.dragging {
      background: var(--ds-data-grid-resize-handle);
    }

    /* rangeBackground / rangeBorder / rangeBorderWidth (locked): one overlay under the transparent cells */
    [data-part='rangeOverlay'] {
      position: absolute;
      z-index: 0;
      pointer-events: none;
      box-sizing: border-box;
      background: var(--ds-data-grid-range-background);
      border: var(--ds-data-grid-range-border-width) solid var(--ds-data-grid-range-border);
    }

    .empty-row {
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: var(--ds-data-grid-row-size);
      padding-inline: var(--ds-data-grid-cell-padding-inline);
    }

    /* statusBarSurface / statusBarColor (locked); statusBarSize / statusBarPadding / statusBarGap */
    .status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      /* statusBarGap: between items; no separator characters */
      gap: var(--ds-data-grid-status-bar-gap);
      padding: var(--ds-data-grid-status-bar-padding);
      background: var(--ds-data-grid-status-bar-surface);
      color: var(--ds-data-grid-status-bar-color);
      border: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
      border-block-start: 0;
    }
    .status-bar ds-text {
      --ds-text-font-size: var(--ds-data-grid-status-bar-size);
    }

    /*
     * minTarget (locked) and the overridable resizeStep, measured as lengths from a hidden probe, never hard-coded
     * as numbers in code, so an override still moves them.
     */
    .probe {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      block-size: var(--ds-data-grid-min-target);
    }
    .probe-step {
      display: block;
      block-size: var(--space-0);
      inline-size: var(--ds-data-grid-resize-step);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='row'],
      .cell.editing {
        transition: none;
      }
    }
  `;

  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  @property() accessor caption = '';

  /** Heading level of the caption in the page outline; its size is `captionSize` regardless, as Table. */
  @property({ type: String, reflect: true, attribute: 'caption-level' })
  accessor captionLevel: DataGridCaptionLevel = '2';

  /** Visually hide the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) accessor hideCaption = false;

  /** The column model. A property, not an attribute. */
  @property({ attribute: false }) accessor columns: DataGridColumn[] = [];

  /** The rows. `id` must be stable; only visible rows are rendered. A property, not an attribute. */
  @property({ attribute: false }) accessor data: DataGridRow[] = [];

  /** Total rows when `data` is a contiguous prefix of a larger set (server paging). Sets aria-rowcount. */
  @property({ type: Number, attribute: 'row-count' }) accessor rowCount: number | undefined;

  /** Controlled sort state; the caller sorts `data`. */
  @property({ attribute: false }) accessor sort: DataGridSort | undefined;

  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  @property({ attribute: false }) accessor defaultSort: DataGridSort | undefined;

  /** `row` adds a checkbox column; `cell` selects the focused cell; `range` selects rectangles. */
  @property({ type: String, reflect: true }) accessor selectable: DataGridSelectable = 'none';

  /** Controlled selected row ids (row mode). */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Master switch: cells whose column is `editable` can be edited. */
  @property({ type: Boolean, reflect: true }) accessor editable = false;

  /** Row height. */
  @property({ type: String, reflect: true }) accessor density: DataGridDensity = 'compact';

  /** The header stays visible while the body scrolls; always true when virtualized. Attribute: `no-sticky-header`. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN })
  accessor stickyHeader = true;

  /** `viewport`: 100vh − 2 × layout.gap.section; `content`: grows with rows, not virtualized; `fixed`: `overrides.fixedHeight`. */
  @property({ type: String, reflect: true }) accessor height: DataGridHeight = 'viewport';

  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) accessor emptyMessage: string | undefined;

  /** The footer status line. Attribute: `no-status-bar`. */
  @property({ attribute: 'no-status-bar', reflect: true, converter: NEGATED_BOOLEAN })
  accessor showStatusBar = true;

  /** Per-instance style overrides: `{ fixedHeight: 'space.40' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>
    | undefined;

  @state() private accessor internalSort: DataGridSort | undefined;
  @state() private accessor internalSelected: string[] = [];
  /** The active cell: row -1 is the header row; col 0 is the selection column in row mode. */
  @state() private accessor activeRow = -1;
  @state() private accessor activeCol = 0;
  @state() private accessor range: RangeState | null = null;
  /** The range anchor survives Escape: with the range cleared, plain navigation keys only move it. */
  @state() private accessor rangeAnchor: CellPos | null = null;
  @state() private accessor editing: EditingState | undefined;
  /** A select editor's popup, which the grid opens with the editor. */
  @state() private accessor selectOpen = false;
  @state() private accessor columnWidths: Record<string, number> = {};
  @state() private accessor message = '';
  @state() private accessor bodyScrollTop = 0;
  @state() private accessor scrolledX = false;
  @state() private accessor overflowX = false;
  @state() private accessor viewportHeight = 0;
  @state() private accessor headerHeight = 0;
  @state() private accessor rowHeightPx = 0;
  @state() private accessor draggingColumn: string | undefined;

  @query('[data-part="scrollRegion"]') private accessor scrollEl!: HTMLElement | null;
  @query('[data-part="grid"]') private accessor gridEl!: HTMLElement | null;
  @query('.probe') private accessor probeEl!: HTMLElement | null;
  @query('.probe-step') private accessor probeStepEl!: HTMLElement | null;

  private sortCache: { data: DataGridRow[]; sort: DataGridSort; rows: DataGridRow[] } | undefined;
  private rowAnchorId: string | undefined;
  private rangeDragging = false;
  private rangeDragMoved = false;
  private resizeDrag: { column: string; startX: number; startWidth: number; rtl: boolean } | undefined;
  private keyboardResize: string | undefined;
  private requestedEnds = new Set<number>();
  private scrollActivePending = false;
  private resizeObserver: ResizeObserver | undefined;
  private readonly warned = new Set<string>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'DataGrid');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    /* An open editor whose grid unmounts drops its draft silently, as if cancelled. */
    this.editing = undefined;
    this.selectOpen = false;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalSort = this.defaultSort;
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('data')) {
      const previous = changed.get('data') as DataGridRow[] | undefined;
      if (!previous || this.data.length !== previous.length) {
        this.requestedEnds.clear();
      }
      /* An open editor whose row leaves `data` drops its draft silently: no cell-change, as if cancelled. */
      const editing = this.editing;
      if (editing && !this.data.some((row) => row.id === editing.rowId)) {
        this.editing = undefined;
        this.selectOpen = false;
        this.message = '';
      }
    }
    if (changed.has('data') || changed.has('columns') || changed.has('selectable')) {
      this.activeRow = clamp(this.activeRow, -1, this.data.length - 1);
      this.activeCol = clamp(this.activeCol, 0, Math.max(0, this.colCount - 1));
      if (changed.has('selectable') || changed.has('columns')) {
        this.range = null;
        this.rangeAnchor = null;
      }
    }
  }

  protected override firstUpdated(): void {
    const region = this.scrollEl;
    if (region && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(region);
    }
    this.measure();
  }

  protected override updated(): void {
    this.demoteCellControls();
    this.measure();
    if (this.scrollActivePending) {
      this.scrollActivePending = false;
      this.scrollActiveIntoView();
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const rows = this.rows;
    const total = this.rowCount ?? rows.length;
    const virtual = this.height !== 'content';
    const rowH = this.rowHeightPx;
    /* The spacer sets the scroll height for the whole set; before a row is measured it falls back to the token. */
    const bodyStyle: Record<string, string | undefined> = {
      blockSize:
        virtual && rows.length > 0
          ? rowH
            ? `${total * rowH}px`
            : `calc(${Math.min(total, UNMEASURED_ROW_CAP)} * var(--ds-data-grid-row-size))`
          : undefined,
    };
    const layout = this.rowLayout();

    return html`
      <div data-part="container">
        <span data-part="caption" class=${classMap({ 'visually-hidden': this.hideCaption })}>
          <ds-heading id="caption" level=${this.captionLevel} size="md">${this.caption}</ds-heading>
        </span>
        <div
          data-part="scrollRegion"
          class=${classMap({ 'x-scrolled': this.scrolledX })}
          @scroll=${this.handleScroll}
        >
          <div
            data-part="grid"
            role="grid"
            tabindex="0"
            style=${styleMap({
              '--ds-data-grid-tracks': layout.columns,
              '--ds-data-grid-row-width': layout.width,
              inlineSize: `max(100%, ${layout.width})`,
            })}
            aria-labelledby="caption"
            aria-describedby=${ifDefined(
              this.showStatusBar && this.overflowX && !this.scrolledX ? 'scroll-hint' : undefined,
            )}
            aria-rowcount=${total + 1}
            aria-colcount=${this.colCount}
            aria-multiselectable=${ifDefined(
              this.selectable === 'none' ? undefined : String(this.selectable !== 'cell'),
            )}
            aria-readonly=${this.editable ? 'false' : 'true'}
            aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
            aria-activedescendant=${ifDefined(this.activeDescendantId(rows))}
            @keydown=${this.handleKeydown}
            @keyup=${this.handleKeyup}
            @focusout=${this.handleGridFocusout}
            @pointerdown=${this.handlePointerdown}
            @pointermove=${this.handlePointermove}
            @pointerup=${this.handlePointerup}
            @pointercancel=${this.handlePointerup}
            @dblclick=${this.handleDblclick}
          >
            ${this.renderHeader()}
            <div role="rowgroup" data-part="body" style=${styleMap(bodyStyle)}>
              ${rows.length === 0 && !this.loading ? this.renderEmpty() : nothing} ${this.renderRangeOverlay(rows)}
              ${repeat(
                this.windowIndexes(rows.length),
                (index) => rows[index]!.id,
                (index) => this.renderRow(rows[index]!, index),
              )}
            </div>
          </div>
        </div>
        ${this.renderStatusBar(rows, total)}
        <span class="probe" aria-hidden="true"><span class="probe-step"></span></span>
      </div>
    `;
  }

  /* ---------- rendering ---------- */

  private renderHeader(): TemplateResult {
    return html`<div role="rowgroup" data-part="header" class=${classMap({ raised: this.bodyScrollTop > 0 })}>
      <div role="row" data-part="headerRow" class="row-layout" aria-rowindex="1">
        ${this.hasSelectColumn ? this.renderSelectAllCell() : nothing}
        ${this.columns.map((column, index) => this.renderColumnHeader(column, index + this.colOffset))}
      </div>
    </div>`;
  }

  private renderSelectAllCell(): TemplateResult {
    const rows = this.rows;
    const selected = new Set(this.currentSelected);
    const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
    const someSelected = !allSelected && rows.some((row) => selected.has(row.id));
    return html`<div
      role="columnheader"
      id="h-0"
      data-part="selectAllCell"
      data-row="-1"
      data-col="0"
      tabindex="-1"
      aria-colindex="1"
      class=${classMap({ cell: true, 'select-all-cell': true, 'pinned-start': true, active: this.isActive(-1, 0) })}
      style=${styleMap({ insetInlineStart: '0' })}
    >
      <ds-checkbox
        tabindex="-1"
        label=${COPY_SELECT_ALL}
        hide-label
        .overrides=${SELECT_CHECKBOX}
        .checked=${live(allSelected)}
        .indeterminate=${live(someSelected)}
        @change=${(event: CustomEvent<CheckboxChangeDetail>) => {
          event.stopPropagation();
          this.activeRow = -1;
          this.activeCol = 0;
          this.toggleAll();
          this.focusGrid();
        }}
      ></ds-checkbox>
    </div>`;
  }

  private renderColumnHeader(column: DataGridColumn, col: number): TemplateResult {
    const active = this.currentSort;
    const sorted = active?.column === column.key ? active.direction : undefined;
    const next: DataGridSortDirection = sorted === 'ascending' ? 'descending' : 'ascending';
    /*
     * aria-valuenow is set only once the column has a pixel width — an explicit `width` or one the user has
     * resized — and omitted while it sits at the columnWidth token, whose pixel value is not known at render.
     */
    const pixelWidth = this.pixelWidthOf(column);
    return html`<div
      role="columnheader"
      id="h-${col}"
      data-part="columnHeader"
      data-row="-1"
      data-col=${col}
      tabindex="-1"
      aria-colindex=${col + 1}
      aria-sort=${ifDefined(column.sortable ? (sorted ?? 'none') : undefined)}
      class=${classMap({ ...this.cellClasses(column), active: this.isActive(-1, col) })}
      style=${styleMap(this.pinStyle(column))}
    >
      ${column.sortable
        ? html`<span data-part="sortButton"><ds-button
            tabindex="-1"
            variant="ghost"
            size="sm"
            label=${column.header}
            accessible-name=${next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header)}
            .overrides=${SORT_BUTTON_INSET}
            @press=${(event: Event) => {
              event.stopPropagation();
              this.activeRow = -1;
              this.activeCol = col;
              this.sortBy(column);
              this.focusGrid();
            }}
          >
            ${sorted
              ? html`<ds-icon slot="trailing-icon" name=${sorted === 'ascending' ? 'chevron-up' : 'chevron-down'} inline></ds-icon>`
              : nothing}
          </ds-button></span>`
        : column.abbr
          ? // The visible header is aria-hidden beside the spoken `abbr`.
            html`<span data-part="cellContent" aria-hidden="true">${column.header}</span>
              <span class="visually-hidden">${column.abbr}</span>`
          : html`<span data-part="cellContent">${column.header}</span>`}
      ${column.resizable
        ? html`<div
            class=${classMap({ 'resize-handle': true, dragging: this.draggingColumn === column.key })}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow=${ifDefined(pixelWidth)}
            aria-valuemin=${this.minWidthOf(column)}
            aria-label=${COPY_RESIZE(column.header)}
            @pointerdown=${(event: PointerEvent) => this.handleResizeDown(event, column)}
            @pointermove=${this.handleResizeMove}
            @pointerup=${this.handleResizeUp}
            @pointercancel=${this.handleResizeUp}
          ></div>`
        : nothing}
    </div>`;
  }

  private renderEmpty(): TemplateResult {
    return html`<div role="row" aria-rowindex="2" class="empty-row">
      <div role="gridcell" aria-colindex="1">
        <ds-text data-part="emptyState" element="p" tone="muted">${this.emptyMessage ?? COPY_EMPTY}</ds-text>
      </div>
    </div>`;
  }

  private renderRow(row: DataGridRow, index: number): TemplateResult {
    const rowMode = this.selectable === 'row';
    const isSelected = rowMode && this.currentSelected.includes(row.id);
    const virtual = this.height !== 'content';
    return html`<div
      role="row"
      data-part="row"
      class=${classMap({ 'row-layout': true, virtual })}
      aria-rowindex=${index + 2}
      aria-selected=${ifDefined(rowMode ? String(isSelected) : undefined)}
      style=${styleMap({
        /* Until a row has been measured, offsets come from the row-size token. */
        transform: virtual
          ? this.rowHeightPx
            ? `translateY(${index * this.rowHeightPx}px)`
            : `translateY(calc(${index} * var(--ds-data-grid-row-size)))`
          : undefined,
      })}
    >
      ${rowMode ? this.renderSelectCell(row, index, isSelected) : nothing}
      ${this.columns.map((column, i) => this.renderCell(row, index, column, i + this.colOffset))}
    </div>`;
  }

  private renderSelectCell(row: DataGridRow, index: number, isSelected: boolean): TemplateResult {
    return html`<div
      role="gridcell"
      id=${this.cellId(row.id, 0)}
      data-part="selectCell"
      data-row=${index}
      data-col="0"
      tabindex="-1"
      aria-colindex="1"
      class=${classMap({ cell: true, 'select-cell': true, 'pinned-start': true, active: this.isActive(index, 0) })}
      style=${styleMap({ insetInlineStart: '0' })}
    >
      <ds-checkbox
        tabindex="-1"
        label=${COPY_SELECT_ROW(this.rowName(row))}
        hide-label
        .overrides=${SELECT_CHECKBOX}
        .checked=${live(isSelected)}
        @change=${(event: CustomEvent<CheckboxChangeDetail>) => {
          event.stopPropagation();
          this.activeRow = index;
          this.activeCol = 0;
          this.toggleRow(row.id);
          this.focusGrid();
        }}
      ></ds-checkbox>
    </div>`;
  }

  private renderCell(row: DataGridRow, index: number, column: DataGridColumn, col: number): TemplateResult {
    const isRowHeader = column.isRowHeader === true;
    const editing = this.editing?.rowId === row.id && this.editing.column === column.key ? this.editing : undefined;
    const raw = row[column.key];
    let selected: boolean | undefined;
    if (this.selectable === 'cell') {
      selected = this.isActive(index, col);
    } else if (this.selectable === 'range') {
      selected = this.inRange(index, col);
    }
    return html`<div
      role=${isRowHeader ? 'rowheader' : 'gridcell'}
      id=${this.cellId(row.id, col)}
      data-part=${isRowHeader ? 'rowHeader' : 'cell'}
      data-row=${index}
      data-col=${col}
      tabindex="-1"
      aria-colindex=${col + 1}
      aria-selected=${ifDefined(selected === undefined ? undefined : String(selected))}
      aria-readonly=${ifDefined(this.editable ? String(!column.editable) : undefined)}
      aria-describedby=${ifDefined(editing?.error ? 'status' : undefined)}
      class=${classMap({
        ...this.cellClasses(column),
        active: this.isActive(index, col),
        muted: this.loading,
        numeric: typeof raw === 'number' && !column.render,
        editing: editing !== undefined,
        invalid: Boolean(editing?.error),
      })}
      style=${styleMap(this.pinStyle(column))}
    >
      ${editing
        ? this.renderEditor(column, row, editing)
        : html`<span data-part="cellContent">${column.render ? column.render(row) : textOf(raw)}</span>`}
    </div>`;
  }

  private renderEditor(column: DataGridColumn, row: DataGridRow, editing: EditingState): TemplateResult {
    const value = cellValue(row[column.key]);
    let editor: TemplateResult;
    switch (column.editor ?? 'text') {
      case 'number': {
        const seeded = editing.seed !== undefined ? Number(editing.seed) : undefined;
        editor = html`<ds-number-input
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${seeded !== undefined && Number.isFinite(seeded) ? seeded : typeof value === 'number' ? value : undefined}
          .overrides=${NUMBER_INSET}
        ></ds-number-input>`;
        break;
      }
      case 'select':
        /* The popup opens at once, and closing it without a choice cancels the edit. */
        editor = html`<ds-select
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .options=${column.options ?? []}
          .defaultValue=${value === undefined ? undefined : String(value)}
          .open=${this.selectOpen}
          .overrides=${SELECT_INSET}
          @open-change=${(event: CustomEvent<SelectOpenChangeDetail>) => {
            event.stopPropagation();
            if (event.detail.open) {
              return;
            }
            this.selectOpen = false;
            /* A choice commits on `change` first, so by here the edit is already closed. */
            if (this.editing) {
              this.cancelEdit();
            }
          }}
          @change=${(event: Event) => {
            event.stopPropagation();
            this.commitAndReturn(0);
          }}
        ></ds-select>`;
        break;
      case 'date':
        editor = html`<ds-date-picker
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${typeof value === 'string' ? value : undefined}
          .overrides=${DATE_INSET}
          @change=${(event: Event) => event.stopPropagation()}
        ></ds-date-picker>`;
        break;
      case 'checkbox':
        editor = html`<ds-checkbox
          data-part="editor"
          label=${column.header}
          hide-label
          .defaultChecked=${value === true}
          @change=${(event: Event) => {
            event.stopPropagation();
            this.commitAndReturn(0);
          }}
        ></ds-checkbox>`;
        break;
      default:
        editor = html`<ds-input
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${editing.seed ?? (value === undefined ? '' : String(value))}
          .overrides=${INPUT_INSET}
          @change=${(event: Event) => event.stopPropagation()}
        ></ds-input>`;
    }
    return html`<div
      class="editor-frame"
      @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column)}
      @focusout=${(event: FocusEvent) => this.handleEditorFocusout(event, column)}
    >
      ${editor}
    </div>`;
  }

  private renderRangeOverlay(rows: DataGridRow[]): TemplateResult | typeof nothing {
    const rect = this.rangeRect();
    const rowH = this.rowHeightPx;
    if (this.selectable !== 'range' || !rect || !rowH || rows.length === 0) {
      return nothing;
    }
    let first = 0;
    let last = rows.length - 1;
    if (this.height !== 'content') {
      const indexes = this.windowIndexes(rows.length);
      first = Math.min(...indexes);
      last = Math.max(...indexes);
    }
    const top = Math.max(rect.rowStart, first);
    const bottom = Math.min(rect.rowEnd, last);
    if (bottom < top) {
      return nothing;
    }
    const before: DataGridColumn[] = [];
    const spanned: DataGridColumn[] = [];
    this.columns.forEach((column, i) => {
      const col = i + this.colOffset;
      if (col < rect.colStart) {
        before.push(column);
      } else if (col <= rect.colEnd) {
        spanned.push(column);
      }
    });
    return html`<div
      data-part="rangeOverlay"
      aria-hidden="true"
      style=${styleMap({
        insetBlockStart: `${top * rowH}px`,
        insetInlineStart: this.sumOf(before),
        inlineSize: this.sumOf(spanned),
        blockSize: `${(bottom - top + 1) * rowH}px`,
      })}
    ></div>`;
  }

  /**
   * The visible counterpart of the live region. Only the leading span is `role="status"`, so the row count, the
   * selection count, `copy.scrollHint` and `copy.position` are shown but never announced — `aria-rowindex` and
   * `aria-colindex` already carry position, and a polite region on every arrow press would be noise.
   *
   * The items follow in this order and no other, with no separator characters between them. With `showStatusBar`
   * false the bar stays in the DOM, visually hidden, holding only the live span.
   */
  private renderStatusBar(rows: DataGridRow[], total: number): TemplateResult {
    const error = this.editing?.error;
    const live = html`<ds-text
      id="status"
      data-part="statusBar"
      role="status"
      element="span"
      size="xs"
      tone=${error ? 'default' : 'muted'}
      >${this.announcement()}</ds-text
    >`;
    const selection = this.selectionText(rows, total);
    const position = this.positionText();
    return html`<div class=${classMap({ 'status-bar': true, 'visually-hidden': !this.showStatusBar })}>
      ${error ? html`<span class="invalid-message">${live}</span>` : live}
      ${this.showStatusBar
        ? html`<ds-text element="span" size="xs" tone="muted">${COPY_ROW_COUNT[pluralForm(total)](total)}</ds-text>
            ${selection ? html`<ds-text element="span" size="xs" tone="muted">${selection}</ds-text>` : nothing}`
        : nothing}
      ${this.showStatusBar && this.overflowX && !this.scrolledX
        ? html`<ds-text id="scroll-hint" element="span" size="xs" tone="muted">${COPY_SCROLL_HINT}</ds-text>`
        : nothing}
      ${this.showStatusBar && position
        ? html`<ds-text element="span" size="xs" tone="muted">${position}</ds-text>`
        : nothing}
    </div>`;
  }

  /* ---------- model ---------- */

  private get hasSelectColumn(): boolean {
    return this.selectable === 'row';
  }

  private get colOffset(): number {
    return this.hasSelectColumn ? 1 : 0;
  }

  private get colCount(): number {
    return this.columns.length + this.colOffset;
  }

  private get currentSort(): DataGridSort | undefined {
    return this.sort ?? this.internalSort;
  }

  private get currentSelected(): string[] {
    return this.selected ?? this.internalSelected;
  }

  /** `data` in display order: sorted here only for an uncontrolled sort over a fully loaded set. */
  private get rows(): DataGridRow[] {
    const active = this.internalSort;
    if (this.sort !== undefined || this.rowCount !== undefined || !active) {
      return this.data;
    }
    const cache = this.sortCache;
    if (cache && cache.data === this.data && cache.sort === active) {
      return cache.rows;
    }
    const factor = active.direction === 'ascending' ? 1 : -1;
    const rows = [...this.data].sort((a, b) => compareValues(a[active.column], b[active.column]) * factor);
    this.sortCache = { data: this.data, sort: active, rows };
    return rows;
  }

  private columnAt(col: number): DataGridColumn | undefined {
    return col < this.colOffset ? undefined : this.columns[col - this.colOffset];
  }

  /**
   * The column's width in pixels once it has one — an explicit `width` or one the user has resized — floored at
   * its `minWidth`; undefined while it sits at the columnWidth token, whose pixel value is not known at render.
   */
  private pixelWidthOf(column: DataGridColumn): number | undefined {
    const width = this.columnWidths[column.key] ?? column.width;
    return width === undefined ? undefined : Math.max(width, this.minWidthOf(column));
  }

  /** The column's rendered width in pixels: its pixel width, else its header cell measured. */
  private widthOf(column: DataGridColumn): number {
    const pixel = this.pixelWidthOf(column);
    if (pixel !== undefined) {
      return pixel;
    }
    const col = this.columns.indexOf(column) + this.colOffset;
    const header = this.renderRoot.querySelector<HTMLElement>(`#h-${col}`);
    return Math.max(header?.offsetWidth ?? 0, this.minWidthOf(column));
  }

  /** The floor for both resize paths: never below minTarget, which is also the default. */
  private minWidthOf(column: DataGridColumn): number {
    return Math.max(column.minWidth ?? 0, this.probeEl?.offsetHeight ?? 0);
  }

  /**
   * The column's track as CSS: its pixel width, else the columnWidth binding (doubled in the internal
   * `--ds-data-grid-column-size`), never below minTarget or its own `minWidth`.
   */
  private trackOf(column: DataGridColumn): string {
    const width = this.columnWidths[column.key] ?? column.width;
    const base = width === undefined ? 'var(--ds-data-grid-column-size)' : `${width}px`;
    const floor = column.minWidth === undefined ? '' : `, ${column.minWidth}px`;
    return `max(${base}, var(--ds-data-grid-min-target)${floor})`;
  }

  /** The summed width of `columns` as one CSS length, with `lead` (the selection column) first. */
  private sumOf(columns: DataGridColumn[], lead?: string): string {
    const parts = columns.map((column) => this.trackOf(column));
    if (lead) {
      parts.unshift(lead);
    }
    return parts.length === 0 ? 'var(--space-0)' : `calc(${parts.join(' + ')})`;
  }

  private rowLayout(): { columns: string; width: string } {
    const lead = this.hasSelectColumn ? 'var(--ds-data-grid-select-column-size)' : undefined;
    const tracks = this.columns.map((column) => this.trackOf(column));
    return {
      columns: (lead ? [lead, ...tracks] : tracks).join(' '),
      width: this.sumOf(this.columns, lead),
    };
  }

  private cellClasses(column: DataGridColumn): Record<string, boolean> {
    return {
      cell: true,
      'align-end': column.align === 'end',
      'align-center': column.align === 'center',
      'pinned-start': column.pinned === 'start',
      'pinned-end': column.pinned === 'end',
    };
  }

  /** Sticky offsets for pinned columns; the selection column counts toward the start offset. */
  private pinStyle(column: DataGridColumn): Record<string, string> {
    const index = this.columns.indexOf(column);
    if (column.pinned === 'start') {
      const before = this.columns.slice(0, index).filter((other) => other.pinned === 'start');
      const lead = this.hasSelectColumn ? 'var(--ds-data-grid-select-column-size)' : undefined;
      return { insetInlineStart: this.sumOf(before, lead) };
    }
    if (column.pinned === 'end') {
      const after = this.columns.slice(index + 1).filter((other) => other.pinned === 'end');
      return { insetInlineEnd: this.sumOf(after) };
    }
    return {};
  }

  private rowName(row: DataGridRow): string {
    const header = this.columns.find((column) => column.isRowHeader);
    return (header ? textOf(row[header.key]) : '') || row.id;
  }

  private cellId(rowId: string, col: number): string {
    return `c-${col}-${idToken(rowId)}`;
  }

  private isActive(row: number, col: number): boolean {
    return this.activeRow === row && this.activeCol === col;
  }

  private activeDescendantId(rows: DataGridRow[]): string | undefined {
    if (this.colCount === 0) {
      return undefined;
    }
    if (this.activeRow === -1) {
      return `h-${this.activeCol}`;
    }
    const row = rows[this.activeRow];
    return row ? this.cellId(row.id, this.activeCol) : undefined;
  }

  private get activeCellEl(): HTMLElement | null {
    const id = this.activeDescendantId(this.rows);
    return id ? this.renderRoot.querySelector<HTMLElement>(`#${id}`) : null;
  }

  /**
   * rowsPerPage: floor(the scroll region's height ÷ the row height) − 1, the sticky header's row left out, so a
   * paged move or request keeps one row of context.
   */
  private pageRows(): number {
    const rowH = this.rowHeightPx;
    if (!rowH) {
      return 1;
    }
    const space = this.height === 'content' ? window.innerHeight : this.viewportHeight;
    return Math.max(1, Math.floor(space / rowH) - 1);
  }

  /** Rendered row indexes: the visible window plus one page of overscan each way, and the active row. */
  private windowIndexes(count: number): number[] {
    if (count === 0) {
      return [];
    }
    if (this.height === 'content') {
      return Array.from({ length: count }, (_, i) => i);
    }
    const rowH = this.rowHeightPx;
    let start = 0;
    let end = Math.min(count, UNMEASURED_ROW_CAP);
    if (rowH) {
      const page = this.pageRows();
      const first = Math.floor(this.bodyScrollTop / rowH);
      start = Math.max(0, first - page);
      end = Math.min(count, first + 2 * page + 1);
    }
    const indexes: number[] = [];
    for (let i = start; i < end; i += 1) {
      indexes.push(i);
    }
    if (this.activeRow >= 0 && this.activeRow < count && (this.activeRow < start || this.activeRow >= end)) {
      indexes.push(this.activeRow);
    }
    return indexes;
  }

  private rangeRect(): { rowStart: number; rowEnd: number; colStart: number; colEnd: number } | undefined {
    const range = this.range;
    if (!range) {
      return undefined;
    }
    return {
      rowStart: Math.min(range.anchor.row, range.focus.row),
      rowEnd: Math.max(range.anchor.row, range.focus.row),
      colStart: Math.min(range.anchor.col, range.focus.col),
      colEnd: Math.max(range.anchor.col, range.focus.col),
    };
  }

  private inRange(row: number, col: number): boolean {
    const rect = this.rangeRect();
    return rect !== undefined && row >= rect.rowStart && row <= rect.rowEnd && col >= rect.colStart && col <= rect.colEnd;
  }

  /** The live region's text: loading, invalid, sort, selection, copy and editing announcements only. */
  private announcement(): string {
    if (this.editing?.error) {
      return COPY_INVALID(this.editing.error);
    }
    if (this.editing) {
      return this.message;
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    return this.message;
  }

  /** The shown selection count; empty when nothing is selected. */
  private selectionText(rows: DataGridRow[], total: number): string {
    if (this.selectable === 'row' && this.currentSelected.length > 0) {
      return COPY_SELECTED_ROWS(this.currentSelected.length, total);
    }
    const rect = this.rangeRect();
    if (this.selectable === 'range' && rect && rows.length > 0) {
      return COPY_SELECTED_RANGE(rect.rowEnd - rect.rowStart + 1, rect.colEnd - rect.colStart + 1);
    }
    return '';
  }

  /** `copy.position` for the active body cell; shown, never announced. */
  private positionText(): string {
    const column = this.columnAt(this.activeCol);
    if (this.activeRow < 0 || !column) {
      return '';
    }
    return COPY_POSITION(this.activeRow + 1, column.header);
  }

  /* ---------- selection, sort and events ---------- */

  private emit<T>(name: string, detail: T, cancelable = false): boolean {
    return this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true, cancelable }));
  }

  private sortBy(column: DataGridColumn): void {
    const active = this.currentSort;
    const direction: DataGridSortDirection =
      active?.column === column.key && active.direction === 'ascending' ? 'descending' : 'ascending';
    if (this.sort === undefined) {
      this.internalSort = { column: column.key, direction };
    }
    this.range = null;
    this.message = COPY_SORTED_ANNOUNCEMENT(column.header, direction);
    this.emit<DataGridSortChangeDetail>('sort-change', { column: column.key, direction });
  }

  private commitRows(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelected = next;
    }
    this.message = COPY_SELECTED_ROWS(next.length, this.rowCount ?? this.data.length);
    this.emit<DataGridSelectionChangeDetail>('selection-change', { selection: next });
  }

  private toggleRow(id: string): void {
    const current = this.currentSelected;
    this.rowAnchorId = id;
    this.commitRows(current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]);
  }

  private toggleAll(): void {
    const rows = this.rows;
    const selected = new Set(this.currentSelected);
    const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));
    this.commitRows(allSelected ? [] : rows.map((row) => row.id));
  }

  /** Adds every row from the anchor (the last row toggled) through `index`. */
  private extendRows(index: number): void {
    const rows = this.rows;
    const anchor = rows.findIndex((row) => row.id === this.rowAnchorId);
    const target = rows[index];
    if (!target) {
      return;
    }
    if (anchor === -1) {
      this.toggleRow(target.id);
      return;
    }
    const next = new Set(this.currentSelected);
    for (let i = Math.min(anchor, index); i <= Math.max(anchor, index); i += 1) {
      next.add(rows[i]!.id);
    }
    this.commitRows([...next]);
  }

  private cellRef(pos: CellPos): DataGridCellRef | undefined {
    const row = this.rows[pos.row];
    const column = this.columnAt(pos.col);
    return row && column ? { rowId: row.id, column: column.key } : undefined;
  }

  /** Sets the range and reports it, but only when the selected rectangle actually changed. */
  private setRange(range: RangeState): void {
    const before = this.rangeRect();
    this.range = range;
    this.rangeAnchor = range.anchor;
    const rect = this.rangeRect()!;
    this.message = COPY_SELECTED_RANGE(rect.rowEnd - rect.rowStart + 1, rect.colEnd - rect.colStart + 1);
    if (
      before &&
      before.rowStart === rect.rowStart &&
      before.rowEnd === rect.rowEnd &&
      before.colStart === rect.colStart &&
      before.colEnd === rect.colEnd
    ) {
      return;
    }
    const from = this.cellRef(range.anchor);
    const to = this.cellRef(range.focus);
    if (from && to) {
      this.emit<DataGridSelectionChangeDetail>('selection-change', { selection: { from, to } });
    }
  }

  private emitCellSelection(): void {
    const ref = this.cellRef({ row: this.activeRow, col: this.activeCol });
    if (ref) {
      this.emit<DataGridSelectionChangeDetail>('selection-change', { selection: ref });
    }
  }

  /** Moves the active cell (clamped to the loaded rows) and scrolls it into view. */
  private moveTo(row: number, col: number): void {
    const next = { row: clamp(row, -1, this.rows.length - 1), col: clamp(col, 0, Math.max(0, this.colCount - 1)) };
    const changed = next.row !== this.activeRow || next.col !== this.activeCol;
    this.activeRow = next.row;
    this.activeCol = next.col;
    this.scrollRowIntoView(next.row);
    this.scrollActivePending = true;
    if (changed && this.selectable === 'cell' && next.row >= 0) {
      this.emitCellSelection();
    }
    this.maybeRequestRange(next.row);
  }

  /* ---------- editing ---------- */

  private startEdit(rowIndex: number, col: number, seed?: string): void {
    const column = this.columnAt(col);
    const row = this.rows[rowIndex];
    if (!this.editable || !column?.editable || !row) {
      return;
    }
    if (!this.emit<DataGridEditStartDetail>('edit-start', { rowId: row.id, column: column.key }, true)) {
      return;
    }
    const kind = column.editor ?? 'text';
    this.editing = {
      rowId: row.id,
      column: column.key,
      seed: kind === 'text' || kind === 'number' ? seed : undefined,
    };
    this.selectOpen = kind === 'select';
    this.message = COPY_EDITING(column.header);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>('[data-part="editor"]')?.focus();
    });
  }

  private readEditorValue(column: DataGridColumn): DataGridCellValue {
    const el = this.renderRoot.querySelector('[data-part="editor"]');
    if (!el) {
      return undefined;
    }
    switch (column.editor ?? 'text') {
      case 'number':
        return (el as DsNumberInput).valueAsNumber;
      case 'select': {
        const value = (el as DsSelect).currentValue;
        return value === null ? undefined : Array.isArray(value) ? value.join(',') : value;
      }
      case 'date':
        return (el as DsDatePicker).currentValue ?? undefined;
      case 'checkbox':
        return (el as DsCheckbox).checked;
      default:
        return (el as DsInput).currentValue;
    }
  }

  /** Validates and commits the open edit. Returns false (editor stays open) when `validate` rejects it. */
  private commitEdit(): boolean {
    const editing = this.editing;
    if (!editing) {
      return true;
    }
    const row = this.data.find((candidate) => candidate.id === editing.rowId);
    const column = this.columns.find((candidate) => candidate.key === editing.column);
    if (!row || !column) {
      this.editing = undefined;
      return true;
    }
    const value = this.readEditorValue(column);
    const error = column.validate?.(value, row);
    if (error) {
      this.editing = { ...editing, error };
      return false;
    }
    const previous = cellValue(row[column.key]);
    this.editing = undefined;
    this.selectOpen = false;
    this.message = '';
    /* Reported only when the committed value differs; `validate` still ran on an unchanged commit. */
    if (!Object.is(value, previous)) {
      this.emit<DataGridCellChangeDetail>('cell-change', { rowId: row.id, column: column.key, value, previous });
    }
    return true;
  }

  private cancelEdit(): void {
    this.editing = undefined;
    this.selectOpen = false;
    this.message = '';
    this.focusGrid();
  }

  /** Commits, then returns focus to the grid `rowDelta` rows down. */
  private commitAndReturn(rowDelta: number): void {
    if (!this.commitEdit()) {
      return;
    }
    if (rowDelta !== 0) {
      this.moveTo(this.activeRow + rowDelta, this.activeCol);
    }
    this.focusGrid();
  }

  private handleEditorKeydown(event: KeyboardEvent, column: DataGridColumn): void {
    const kind = column.editor ?? 'text';
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.cancelEdit();
        return;
      case 'Enter': {
        const fromField = event.composedPath()[0] instanceof HTMLInputElement;
        if (kind === 'select' || (kind === 'date' && !fromField)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.commitAndReturn(1);
        return;
      }
      case 'F2':
        event.preventDefault();
        event.stopPropagation();
        this.commitAndReturn(0);
        return;
      case 'Tab': {
        event.stopPropagation();
        if (!this.commitEdit()) {
          event.preventDefault();
          return;
        }
        const step = event.shiftKey ? -1 : 1;
        let col = this.activeCol + step;
        while (col >= this.colOffset && col < this.colCount && !this.columnAt(col)?.editable) {
          col += step;
        }
        if (col >= this.colOffset && col < this.colCount) {
          event.preventDefault();
          this.moveTo(this.activeRow, col);
          this.focusGrid();
          this.startEdit(this.activeRow, col);
          return;
        }
        // The last editable cell: focus the grid and remove the editor now, so Tab leaves the grid.
        this.gridEl?.focus({ preventScroll: true });
        this.performUpdate();
        return;
      }
      default:
        event.stopPropagation();
    }
  }

  private handleEditorFocusout(event: FocusEvent, column: DataGridColumn): void {
    const frame = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && frame.contains(next)) {
      return;
    }
    const kind = column.editor ?? 'text';
    if (this.editing && (kind === 'text' || kind === 'number' || kind === 'date')) {
      this.commitEdit();
    }
  }

  private focusGrid(): void {
    this.gridEl?.focus({ preventScroll: true });
  }

  /* ---------- keyboard ---------- */

  private handleKeydown(event: KeyboardEvent): void {
    if (this.editing) {
      return;
    }
    if (event.target !== this.gridEl) {
      this.handleCellControlKeydown(event);
      return;
    }
    const rows = this.rows;
    const lastRow = rows.length - 1;
    const lastCol = this.colCount - 1;
    const { key, shiftKey, altKey, metaKey } = event;
    /* Control in every chord of the keyboard table means Control or Meta (Cmd on macOS). */
    const ctrlKey = event.ctrlKey || metaKey;
    const inBody = this.activeRow >= 0;
    const column = this.columnAt(this.activeCol);
    let handled = true;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const step = key === 'ArrowRight' ? 1 : -1;
        if (shiftKey && !inBody && column?.resizable) {
          this.resizeByKey(column, step);
        } else if (shiftKey && inBody && this.selectable === 'range') {
          this.extendRange(0, step);
        } else {
          this.arrowTo(this.activeRow, this.activeCol + step);
        }
        break;
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        const step = key === 'ArrowDown' ? 1 : -1;
        if (shiftKey && inBody && this.selectable === 'range') {
          this.extendRange(step, 0);
        } else {
          this.arrowTo(this.activeRow + step, this.activeCol);
        }
        break;
      }
      case 'Home':
        this.arrowTo(ctrlKey ? -1 : this.activeRow, 0);
        break;
      case 'End':
        this.arrowTo(ctrlKey ? lastRow : this.activeRow, lastCol);
        break;
      case 'PageDown':
        this.arrowTo(Math.min(lastRow, this.activeRow + this.pageRows()), this.activeCol);
        break;
      case 'PageUp':
        this.arrowTo(inBody ? Math.max(0, this.activeRow - this.pageRows()) : -1, this.activeCol);
        break;
      case 'Enter':
        this.activateCell();
        break;
      case 'F2':
        if (inBody) {
          this.startEdit(this.activeRow, this.activeCol);
        }
        break;
      case 'Escape':
        if (this.range) {
          /* Clearing a range reports nothing: the selection union has no empty range. */
          this.rangeAnchor = this.range.focus;
          this.range = null;
          this.message = '';
        } else {
          handled = false;
        }
        break;
      case ' ':
        handled = this.handleSpace(shiftKey, ctrlKey);
        break;
      case 'Delete':
      case 'Backspace':
        /* Clearing needs both `editable` and a selection; `none` mode clears nothing and keeps the key. */
        handled = this.editable && this.selectable !== 'none';
        if (handled) {
          this.clearSelection();
        }
        break;
      default:
        if (ctrlKey && event.code === 'KeyA' && (this.selectable === 'row' || this.selectable === 'range')) {
          this.selectAll();
        } else if (ctrlKey && event.code === 'KeyC' && this.selectable === 'range') {
          this.copyRange();
        } else if (key.length === 1 && !ctrlKey && !metaKey && !altKey && inBody && column?.editable) {
          this.startEdit(this.activeRow, this.activeCol, key);
        } else {
          handled = false;
        }
    }
    if (handled) {
      event.preventDefault();
    }
  }

  /** Real focus is on a control inside a cell: Escape hands it back; Shift+Tab leaves the grid. */
  private handleCellControlKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.focusGrid();
    } else if (event.key === 'Tab' && event.shiftKey) {
      this.focusGrid();
    }
  }

  private handleKeyup(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.flushKeyboardResize();
    }
  }

  private handleGridFocusout(event: FocusEvent): void {
    const grid = this.gridEl;
    const next = event.relatedTarget as Node | null;
    if (grid && (!next || !grid.contains(next))) {
      this.flushKeyboardResize();
    }
  }

  /**
   * A plain navigation key (arrows, Home/End, Page keys). In range mode it collapses the range to the newly focused
   * body cell and makes it the anchor; once Escape has cleared the range, it only moves the anchor.
   */
  private arrowTo(row: number, col: number): void {
    this.moveTo(row, col);
    if (this.selectable !== 'range' || this.activeRow < 0) {
      return;
    }
    const pos = { row: this.activeRow, col: this.activeCol };
    if (this.range) {
      this.setRange({ anchor: pos, focus: pos });
    } else {
      this.rangeAnchor = pos;
    }
  }

  private extendRange(rowStep: number, colStep: number): void {
    const anchor = this.range?.anchor ?? this.rangeAnchor ?? { row: this.activeRow, col: this.activeCol };
    this.moveTo(clamp(this.activeRow + rowStep, 0, this.rows.length - 1), this.activeCol + colStep);
    this.setRange({ anchor, focus: { row: this.activeRow, col: this.activeCol } });
  }

  private activateCell(): void {
    const column = this.columnAt(this.activeCol);
    if (this.activeRow === -1) {
      if (this.hasSelectColumn && this.activeCol === 0) {
        this.toggleAll();
      } else if (column?.sortable) {
        this.sortBy(column);
      }
      return;
    }
    const row = this.rows[this.activeRow];
    if (!row) {
      return;
    }
    if (this.hasSelectColumn && this.activeCol === 0) {
      this.toggleRow(row.id);
      return;
    }
    if (this.editable && column?.editable) {
      this.startEdit(this.activeRow, this.activeCol);
      return;
    }
    const control = this.activeCellEl?.querySelector<HTMLElement>(`[data-part="cellContent"] :is(${CELL_CONTROLS})`);
    if (control) {
      control.focus();
      (control.shadowRoot?.querySelector<HTMLElement>('a[href], button, input') ?? control).click();
    }
  }

  private handleSpace(shiftKey: boolean, ctrlKey: boolean): boolean {
    const row = this.rows[this.activeRow];
    if (!row) {
      return this.selectable === 'row' || this.selectable === 'range';
    }
    if (this.selectable === 'row') {
      if (shiftKey) {
        this.extendRows(this.activeRow);
      } else {
        this.toggleRow(row.id);
      }
      return true;
    }
    if (this.selectable === 'range') {
      const lastCol = this.colCount - 1;
      if (ctrlKey) {
        this.setRange({
          anchor: { row: 0, col: this.activeCol },
          focus: { row: this.rows.length - 1, col: this.activeCol },
        });
      } else if (shiftKey && this.range) {
        this.setRange({ anchor: { row: this.range.anchor.row, col: 0 }, focus: { row: this.activeRow, col: lastCol } });
      } else {
        this.setRange({ anchor: { row: this.activeRow, col: 0 }, focus: { row: this.activeRow, col: lastCol } });
      }
      return true;
    }
    return false;
  }

  private selectAll(): void {
    const rows = this.rows;
    if (this.selectable === 'row') {
      this.commitRows(rows.map((row) => row.id));
    } else if (rows.length > 0 && this.colCount > 0) {
      this.setRange({ anchor: { row: 0, col: 0 }, focus: { row: rows.length - 1, col: this.colCount - 1 } });
    }
  }

  private copyRange(): void {
    const rect = this.rangeRect();
    const rows = this.rows;
    if (!rect || rows.length === 0) {
      return;
    }
    const columns: DataGridColumn[] = [];
    for (let col = rect.colStart; col <= rect.colEnd; col += 1) {
      const column = this.columnAt(col);
      if (column) {
        columns.push(column);
      }
    }
    const lines: string[] = [];
    if (rect.rowStart === 0 && rect.rowEnd === rows.length - 1) {
      lines.push(columns.map((column) => column.header).join('\t'));
    }
    for (let r = rect.rowStart; r <= rect.rowEnd; r += 1) {
      const row = rows[r];
      if (row) {
        lines.push(columns.map((column) => textOf(row[column.key])).join('\t'));
      }
    }
    const cells = (rect.rowEnd - rect.rowStart + 1) * columns.length;
    void navigator.clipboard?.writeText(lines.join('\n')).then(
      () => {
        this.message = COPY_COPIED[pluralForm(cells)](cells);
      },
      () => undefined,
    );
  }

  /** Delete/Backspace: `cell-change` with `value: undefined` for each editable cell in the selection. */
  private clearSelection(): void {
    const rows = this.rows;
    const targets: { row: DataGridRow; column: DataGridColumn }[] = [];
    const add = (rowIndex: number, col: number): void => {
      const row = rows[rowIndex];
      const column = this.columnAt(col);
      if (row && column?.editable) {
        targets.push({ row, column });
      }
    };
    const rect = this.rangeRect();
    if (this.selectable === 'range' && rect) {
      for (let r = rect.rowStart; r <= rect.rowEnd; r += 1) {
        for (let c = rect.colStart; c <= rect.colEnd; c += 1) {
          add(r, c);
        }
      }
    } else if (this.selectable === 'row') {
      const selected = new Set(this.currentSelected);
      rows.forEach((row, r) => {
        if (selected.has(row.id)) {
          for (let c = this.colOffset; c < this.colCount; c += 1) {
            add(r, c);
          }
        }
      });
    } else if (this.selectable === 'cell') {
      add(this.activeRow, this.activeCol);
    }
    for (const { row, column } of targets) {
      this.emit<DataGridCellChangeDetail>('cell-change', {
        rowId: row.id,
        column: column.key,
        value: undefined,
        previous: cellValue(row[column.key]),
      });
    }
  }

  /* ---------- pointer ---------- */

  private cellFromTarget(event: Event): { pos: CellPos; el: HTMLElement; inControl: boolean } | undefined {
    let inControl = false;
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      if (node.dataset['row'] !== undefined && node.dataset['col'] !== undefined) {
        return { pos: { row: Number(node.dataset['row']), col: Number(node.dataset['col']) }, el: node, inControl };
      }
      if (node.matches(`${CELL_CONTROLS}, .editor-frame, .resize-handle`)) {
        inControl = true;
      }
      if (node === this.gridEl) {
        return undefined;
      }
    }
    return undefined;
  }

  private handlePointerdown(event: PointerEvent): void {
    const hit = this.cellFromTarget(event);
    if (!hit || event.button !== 0) {
      return;
    }
    const { pos, inControl } = hit;
    if (this.editing) {
      const row = this.rows[pos.row];
      const column = this.columnAt(pos.col);
      if (row?.id === this.editing.rowId && column?.key === this.editing.column) {
        return;
      }
    }
    const previous = { row: this.activeRow, col: this.activeCol };
    this.activeRow = pos.row;
    this.activeCol = pos.col;
    if (inControl) {
      return;
    }
    const body = pos.row >= 0;
    if (this.selectable === 'range' && body) {
      event.preventDefault();
      const anchor = event.shiftKey ? (this.range?.anchor ?? this.rangeAnchor ?? pos) : pos;
      this.setRange({ anchor, focus: pos });
      this.rangeDragging = true;
      this.rangeDragMoved = false;
      this.gridEl?.setPointerCapture(event.pointerId);
    } else if (this.selectable === 'cell' && body && (previous.row !== pos.row || previous.col !== pos.col)) {
      this.emitCellSelection();
    } else if (this.selectable === 'row' && body && pos.col > 0) {
      const row = this.rows[pos.row];
      if (row && (event.ctrlKey || event.metaKey)) {
        this.toggleRow(row.id);
      } else if (event.shiftKey) {
        event.preventDefault();
        this.extendRows(pos.row);
      }
    } else if (this.selectable === 'row' && body && pos.col === 0) {
      const row = this.rows[pos.row];
      if (row) {
        this.toggleRow(row.id);
      }
    } else if (this.hasSelectColumn && !body && pos.col === 0) {
      /* A click anywhere on the selectAllCell toggles its Checkbox, as one on a selectCell does. */
      this.toggleAll();
    }
    this.focusGrid();
  }

  private handlePointermove(event: PointerEvent): void {
    if (!this.rangeDragging || !this.range) {
      return;
    }
    const target = (this.renderRoot as ShadowRoot).elementFromPoint(event.clientX, event.clientY);
    const cell = target?.closest<HTMLElement>('[data-row][data-col]');
    if (!cell) {
      return;
    }
    const row = Number(cell.dataset['row']);
    const col = Number(cell.dataset['col']);
    if (row < 0 || (row === this.range.focus.row && col === this.range.focus.col)) {
      return;
    }
    this.activeRow = row;
    this.activeCol = col;
    this.range = { anchor: this.range.anchor, focus: { row, col } };
    this.rangeDragMoved = true;
  }

  private handlePointerup(event: PointerEvent): void {
    if (!this.rangeDragging) {
      return;
    }
    this.rangeDragging = false;
    if (this.gridEl?.hasPointerCapture(event.pointerId)) {
      this.gridEl.releasePointerCapture(event.pointerId);
    }
    if (this.rangeDragMoved && this.range) {
      this.setRange(this.range);
    }
  }

  private handleDblclick(event: MouseEvent): void {
    const hit = this.cellFromTarget(event);
    if (hit && !hit.inControl && hit.pos.row >= 0) {
      this.startEdit(hit.pos.row, hit.pos.col);
    }
  }

  /* ---------- column resize ---------- */

  private handleResizeDown(event: PointerEvent, column: DataGridColumn): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeDrag = {
      column: column.key,
      startX: event.clientX,
      startWidth: this.widthOf(column),
      rtl: getComputedStyle(this).direction === 'rtl',
    };
    this.draggingColumn = column.key;
  }

  private readonly handleResizeMove = (event: PointerEvent): void => {
    const drag = this.resizeDrag;
    const column = drag ? this.columns.find((candidate) => candidate.key === drag.column) : undefined;
    if (!drag || !column) {
      return;
    }
    const delta = (event.clientX - drag.startX) * (drag.rtl ? -1 : 1);
    const width = Math.max(this.minWidthOf(column), Math.round(drag.startWidth + delta));
    if (this.columnWidths[column.key] !== width) {
      this.columnWidths = { ...this.columnWidths, [column.key]: width };
    }
  };

  private readonly handleResizeUp = (event: PointerEvent): void => {
    const drag = this.resizeDrag;
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    this.resizeDrag = undefined;
    this.draggingColumn = undefined;
    const column = drag ? this.columns.find((candidate) => candidate.key === drag.column) : undefined;
    if (drag && column && this.widthOf(column) !== drag.startWidth) {
      this.emit<DataGridColumnResizeDetail>('column-resize', { column: column.key, width: this.widthOf(column) });
    }
  };

  private resizeByKey(column: DataGridColumn, step: number): void {
    const resizeStep = this.probeStepEl?.offsetWidth ?? 0;
    const width = Math.max(this.minWidthOf(column), this.widthOf(column) + step * resizeStep);
    this.columnWidths = { ...this.columnWidths, [column.key]: width };
    this.keyboardResize = column.key;
  }

  private flushKeyboardResize(): void {
    const key = this.keyboardResize;
    this.keyboardResize = undefined;
    const column = key ? this.columns.find((candidate) => candidate.key === key) : undefined;
    if (column) {
      this.emit<DataGridColumnResizeDetail>('column-resize', { column: column.key, width: this.widthOf(column) });
    }
  }

  /* ---------- scrolling and measurement ---------- */

  private handleScroll(): void {
    const region = this.scrollEl;
    if (!region) {
      return;
    }
    if (this.bodyScrollTop !== region.scrollTop) {
      this.bodyScrollTop = region.scrollTop;
    }
    const scrolledX = region.scrollLeft !== 0;
    if (this.scrolledX !== scrolledX) {
      this.scrolledX = scrolledX;
    }
    if (this.rowHeightPx) {
      this.maybeRequestRange(Math.ceil((region.scrollTop + this.viewportHeight) / this.rowHeightPx));
    }
  }

  /** `range-needed` when `index` is within one page of the end of `data` and `rowCount` says there is more. */
  private maybeRequestRange(index: number): void {
    const total = this.rowCount;
    const loaded = this.data.length;
    if (total === undefined || total <= loaded) {
      return;
    }
    const page = this.pageRows();
    if (index < loaded - page) {
      return;
    }
    /* One visible page: start = data.length, end = min(rowCount − 1, data.length + rowsPerPage − 1). */
    const end = Math.min(total - 1, loaded + page - 1);
    if (end < loaded) {
      return;
    }
    if (this.requestedEnds.has(end)) {
      return;
    }
    this.requestedEnds.add(end);
    this.emit<DataGridRangeNeededDetail>('range-needed', { start: loaded, end });
  }

  private scrollRowIntoView(row: number): void {
    const region = this.scrollEl;
    const rowH = this.rowHeightPx;
    if (!region || !rowH || row < 0 || this.height === 'content') {
      return;
    }
    const top = row * rowH;
    const visible = this.viewportHeight - this.headerHeight;
    if (top < region.scrollTop) {
      region.scrollTop = top;
    } else if (top + rowH > region.scrollTop + visible) {
      region.scrollTop = top + rowH - visible;
    }
    this.bodyScrollTop = region.scrollTop;
  }

  /** Horizontal (and, for `height: content`, vertical) reveal of the active cell past any pinned columns. */
  private scrollActiveIntoView(): void {
    const cell = this.activeCellEl;
    const region = this.scrollEl;
    if (!cell || !region) {
      return;
    }
    if (this.height === 'content') {
      cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return;
    }
    if (cell.classList.contains('pinned-start') || cell.classList.contains('pinned-end')) {
      return;
    }
    const row = cell.parentElement;
    let startInset = 0;
    let endInset = 0;
    row?.querySelectorAll<HTMLElement>('.pinned-start').forEach((el) => (startInset += el.offsetWidth));
    row?.querySelectorAll<HTMLElement>('.pinned-end').forEach((el) => (endInset += el.offsetWidth));
    const cellRect = cell.getBoundingClientRect();
    const regionRect = region.getBoundingClientRect();
    if (cellRect.left < regionRect.left + startInset) {
      region.scrollLeft -= regionRect.left + startInset - cellRect.left;
    } else if (cellRect.right > regionRect.right - endInset) {
      region.scrollLeft += cellRect.right - (regionRect.right - endInset);
    }
  }

  private measure(): void {
    const region = this.scrollEl;
    if (!region) {
      return;
    }
    const row =
      this.renderRoot.querySelector<HTMLElement>('[data-part="row"]') ??
      this.renderRoot.querySelector<HTMLElement>('[data-part="headerRow"]');
    const header = this.renderRoot.querySelector<HTMLElement>('[data-part="header"]');
    const rowH = row?.getBoundingClientRect().height ?? 0;
    const headerH = header?.getBoundingClientRect().height ?? 0;
    if (rowH && rowH !== this.rowHeightPx) {
      this.rowHeightPx = rowH;
    }
    if (headerH !== this.headerHeight) {
      this.headerHeight = headerH;
    }
    if (region.clientHeight !== this.viewportHeight) {
      this.viewportHeight = region.clientHeight;
    }
    const overflowX = region.scrollWidth > region.clientWidth;
    if (overflowX !== this.overflowX) {
      this.overflowX = overflowX;
    }
  }

  /** Controls a column's `render` returns are reachable by Enter, not Tab: the grid stays one tab stop. */
  private demoteCellControls(): void {
    this.renderRoot.querySelectorAll<HTMLElement>(`[data-part="cellContent"] :is(${CELL_CONTROLS})`).forEach((el) => {
      if (el.getAttribute('tabindex') !== '-1') {
        el.setAttribute('tabindex', '-1');
      }
    });
  }

  /* ---------- overrides and dev warnings ---------- */

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DataGridOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) {
        this.style.removeProperty(HOOKS[binding]);
      } else {
        this.style.setProperty(HOOKS[binding], cssVar(ref));
      }
    }
  }

  private warnOnce(key: string, message: string): void {
    if (!this.warned.has(key)) {
      this.warned.add(key);
      console.warn(`<ds-data-grid> ${message}`, this);
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.caption) {
      this.warnOnce('caption', 'requires a `caption`; it is the accessible name.');
    }
    if (this.columns.length > 0 && this.columns.filter((column) => column.isRowHeader).length !== 1) {
      this.warnOnce('row-header', 'needs exactly one column with `isRowHeader: true`.');
    }
    const pins = this.columns.map((column) => column.pinned);
    const firstUnpinnedStart = pins.findIndex((pin) => pin !== 'start');
    const lastUnpinnedEnd = pins.map((pin) => pin !== 'end').lastIndexOf(true);
    const strayStart = firstUnpinnedStart !== -1 && pins.slice(firstUnpinnedStart).includes('start');
    const strayEnd = lastUnpinnedEnd !== -1 && pins.slice(0, lastUnpinnedEnd + 1).includes('end');
    if (strayStart || strayEnd) {
      this.warnOnce('pinned', 'pinned columns must be contiguous at the start or end of `columns`.');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-data-grid': DsDataGrid;
  }
}
