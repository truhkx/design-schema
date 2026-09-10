import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Checkbox.js';
import './Icon.js';
import './Text.js';
import './Input.js';
import './NumberInput.js';
import './Select.js';
import './DatePicker.js';
import type { CheckboxChangeDetail } from './Checkbox.js';
import type { InputChangeDetail } from './Input.js';
import type { NumberInputChangeDetail } from './NumberInput.js';
import type { SelectChangeDetail, SelectValue } from './Select.js';
import type { DatePickerChangeDetail, DatePickerValue } from './DatePicker.js';
import type { HeadingOverridableBinding } from './Heading.js';

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

/** A column definition. Exactly one column should set `isRowHeader`. */
export interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string;
  align?: DataGridColumnAlign;
  sortable?: boolean;
  /** Pixel width; a multiple of space.1 (e.g. 160). Grid columns do not auto-size. */
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  isRowHeader?: boolean;
  pinned?: DataGridColumnPinned;
  editable?: boolean;
  editor?: DataGridEditorKind;
  options?: DataGridColumnOption[];
  render?: (row: DataGridRow) => unknown;
  validate?: (value: unknown, row: DataGridRow) => string | undefined;
}

export type DataGridSortDirection = 'ascending' | 'descending';

export interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}

export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';

export interface DataGridCellRef {
  rowId: string;
  column: string;
}

export interface DataGridRangeRef {
  from: DataGridCellRef;
  to: DataGridCellRef;
}

/** Detail carried by the `sort-change` CustomEvent. */
export interface DataGridSortChangeDetail {
  column: string;
  direction: DataGridSortDirection;
}

/** Detail carried by the `selection-change` CustomEvent; exactly one of `rows`/`cell`/`range` is set, matching `selectable`. */
export interface DataGridSelectionChangeDetail {
  rows?: string[];
  cell?: DataGridCellRef | null;
  range?: DataGridRangeRef | null;
}

/** Detail carried by the `cell-change` CustomEvent. */
export interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

/** Detail carried by the `edit-start` CustomEvent. Cancelable: `preventDefault()` refuses the edit. */
export interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}

/** Detail carried by the `range-needed` CustomEvent. */
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
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: DataGridSortDirection): string =>
  `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_ROWS = (count: number, total: number): string => `${count} of ${total} rows selected`;
const COPY_SELECTED_RANGE = (rows: number, columns: number): string => `${rows} rows by ${columns} columns selected`;
const COPY_COPIED = (cells: number): string => `Copied ${cells} cells`;
const COPY_EDITING = (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`;
const COPY_INVALID = (message: string): string => message;
const COPY_ROW_COUNT = (count: number): string => `${count} rows`;
const COPY_POSITION = (row: number, column: string): string => `Row ${row}, ${column}`;
const COPY_RESIZE = (column: string): string => `Resize ${column}`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing to show.';
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 64;
const SELECT_COLUMN_KEY = '__select__';

/** Negates a boolean attribute: `no-sticky-header`/`no-status-bar` present means the property is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. Accessibility-bearing bindings (`surface`, `headerSurface`,
    `headerColor`, `rowSelected`, `rowSelectedBorder`, `cellColor`, `cellMutedColor`, `cellFocusRing`,
    `cellEditingBackground`, `cellEditingBorder`, `cellInvalidBorder`, `cellInvalidBackground`,
    `cellInvalidForeground`, `rangeBackground`, `rangeBorder`, `statusBarSurface`, `statusBarColor`, `minTarget`,
    `focusRing`, `focusRingWidth`) are locked and excluded. */
export type DataGridOverridableBinding =
  | 'headerWeight'
  | 'headerSize'
  | 'headerBorder'
  | 'headerBorderWidth'
  | 'headerShadow'
  | 'gridLine'
  | 'gridLineWidth'
  | 'rowHeight'
  | 'rowHeightComfortable'
  | 'rowHover'
  | 'rowSelectedBorderWidth'
  | 'cellPaddingInline'
  | 'cellFocusRingWidth'
  | 'rangeBorderWidth'
  | 'pinnedShadow'
  | 'resizeHandle'
  | 'resizeHandleWidth'
  | 'statusBarSize'
  | 'statusBarPadding'
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
  rowHeight: '--ds-data-grid-row-height',
  rowHeightComfortable: '--ds-data-grid-row-height-comfortable',
  rowHover: '--ds-data-grid-row-hover',
  rowSelectedBorderWidth: '--ds-data-grid-row-selected-border-width',
  cellPaddingInline: '--ds-data-grid-cell-padding-inline',
  cellFocusRingWidth: '--ds-data-grid-cell-focus-ring-width',
  rangeBorderWidth: '--ds-data-grid-range-border-width',
  pinnedShadow: '--ds-data-grid-pinned-shadow',
  resizeHandle: '--ds-data-grid-resize-handle',
  resizeHandleWidth: '--ds-data-grid-resize-handle-width',
  statusBarSize: '--ds-data-grid-status-bar-size',
  statusBarPadding: '--ds-data-grid-status-bar-padding',
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

let idCounter = 0;
function nextDataGridId(): string {
  idCounter += 1;
  return `ds-data-grid-${idCounter}`;
}

interface EditingState {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
  error?: string;
}

/**
 * `<ds-data-grid>` — DataGrid (category: data, APG pattern: grid).
 *
 * `<ds-data-grid caption="Price list" .columns=${columns} .data=${rows}>` builds an APG grid from `div`s with
 * explicit `role="grid"`/`"rowgroup"`/`"row"`/`"columnheader"`/`"rowheader"`/`"gridcell"` (never a native `<table>`,
 * since virtualization renders only the visible window). The grid is one tab stop: focus moves between cells with
 * `aria-activedescendant` while a fixed roving tabindex stays on the scroll region itself. `height: "viewport"` and
 * `"fixed"` virtualize the body (a fixed row height, a spacer sized to the row count, rows translated into place);
 * `height: "content"` renders every row in normal flow.
 *
 * ## When to use
 *
 * Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll through more
 * rows than fit in memory as DOM. Set `editable` and mark the columns that may change; give every editable column
 * a `validate`. Prefer a `Table` when rows are read and acted on as a whole, not a phone-first screen.
 *
 * @fires sort-change - Fired when a sortable header is activated, with `{ column, direction }`.
 * @fires selection-change - Fired with the selection matching `selectable`: `{ rows }`, `{ cell }`, or `{ range }`.
 * @fires cell-change - Fired when an edit commits, with `{ rowId, column, value, previous }`.
 * @fires edit-start - Fired when an editor is about to open, with `{ rowId, column }`; cancelable.
 * @fires range-needed - Fired with `{ start, end }` row indexes when the visible window nears the end of loaded `data`.
 * @fires column-resize - Fired with `{ column, width }` when a resizable column edge drag ends.
 * @csspart container - The wrapper (anatomy: container).
 * @csspart scroll-region - The scrolling grid element (anatomy: scrollRegion; same element as `grid`).
 * @csspart grid - The `role="grid"` element (anatomy: grid; same element as `scroll-region`).
 * @csspart caption - The caption (anatomy: caption).
 * @csspart header - The sticky header `rowgroup` (anatomy: header).
 * @csspart header-row - The header `row` (anatomy: headerRow).
 * @csspart column-header - Each `columnheader` (anatomy: columnHeader).
 * @csspart sort-button - The composed `<ds-button>` inside a sortable header (anatomy: sortButton).
 * @csspart body - The body `rowgroup` (anatomy: body).
 * @csspart row - Each body `row` (anatomy: row).
 * @csspart row-header - A row's `rowheader` cell (anatomy: rowHeader).
 * @csspart cell - A body `gridcell` (anatomy: cell).
 * @csspart cell-content - The rendered value inside a cell (anatomy: cellContent).
 * @csspart editor - The composed editor field (anatomy: editor).
 * @csspart select-cell - A row's selection `gridcell` (anatomy: selectCell).
 * @csspart select-all-cell - The header's select-all cell (anatomy: selectAllCell).
 * @csspart range-overlay - The selected-range overlay (anatomy: rangeOverlay).
 * @csspart empty-state - The composed `<ds-text>` shown when `data` is empty (anatomy: emptyState).
 * @csspart status-bar - The footer status line (anatomy: statusBar).
 */
@customElement('ds-data-grid')
export class DsDataGrid extends LitElement {
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles = css`
    :host {
      display: block;
      font-family: var(--ds-data-grid-font-family);
      font-size: var(--ds-data-grid-font-size);
      line-height: var(--ds-data-grid-line-height);
      /* cellColor: color.foreground, locked */
      color: var(--color-foreground);
      --ds-data-grid-header-weight: var(--font-weight-semibold);
      --ds-data-grid-header-size: var(--font-size-sm);
      --ds-data-grid-header-border: var(--color-border-strong);
      --ds-data-grid-header-border-width: var(--border-width-thin);
      --ds-data-grid-header-shadow: var(--shadow-raised);
      --ds-data-grid-grid-line: var(--color-border);
      --ds-data-grid-grid-line-width: var(--border-width-thin);
      --ds-data-grid-row-height: var(--size-target-min);
      --ds-data-grid-row-height-comfortable: var(--size-target-comfortable);
      --ds-data-grid-row-hover: var(--color-action-ghost-background-hover);
      --ds-data-grid-row-selected-border-width: var(--border-width-focus);
      --ds-data-grid-cell-padding-inline: var(--space-2);
      --ds-data-grid-cell-focus-ring-width: var(--border-width-focus);
      --ds-data-grid-range-border-width: var(--border-width-focus);
      --ds-data-grid-pinned-shadow: var(--shadow-raised);
      --ds-data-grid-resize-handle: var(--color-border-strong);
      --ds-data-grid-resize-handle-width: var(--space-1);
      --ds-data-grid-status-bar-size: var(--font-size-xs);
      --ds-data-grid-status-bar-padding: var(--space-2);
      --ds-data-grid-caption-size: var(--font-size-md);
      --ds-data-grid-caption-weight: var(--font-weight-semibold);
      --ds-data-grid-caption-gap: var(--space-2);
      --ds-data-grid-fixed-height: var(--space-20);
      --ds-data-grid-font-family: var(--font-family-body);
      --ds-data-grid-font-size: var(--font-size-sm);
      --ds-data-grid-line-height: var(--font-line-height-tight);
      --ds-data-grid-numeric-font: var(--font-family-mono);
      --ds-data-grid-transition: var(--motion-duration-fast);
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

    .container {
      position: relative;
    }

    .caption {
      padding-block-end: var(--ds-data-grid-caption-gap);
    }

    .grid-scroll {
      position: relative;
      overflow: auto;
      outline: none;
      /* surface: color.background, locked */
      background: var(--color-background);
      border: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
    }

    :host([height='content']) .grid-scroll {
      block-size: auto;
      overflow-y: visible;
    }

    :host([height='viewport']) .grid-scroll {
      /* the section rhythm on both ends, not specified further by the doc */
      block-size: calc(100vh - var(--layout-gap-section) * 2);
    }

    :host([height='fixed']) .grid-scroll {
      block-size: var(--ds-data-grid-fixed-height);
    }

    .grid-scroll:focus-visible {
      /* focusRing / focusRingWidth: locked */
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .header {
      position: sticky;
      inset-block-start: 0;
      z-index: 3;
    }

    :host([height='content'][no-sticky-header]) .header {
      position: static;
    }

    :host([data-header-scrolled]) .header {
      box-shadow: var(--ds-data-grid-header-shadow);
    }

    .row-grid {
      display: grid;
      align-items: stretch;
    }

    .header-row {
      block-size: var(--ds-data-grid-row-height);
    }

    :host([density='comfortable']) .header-row {
      block-size: var(--ds-data-grid-row-height-comfortable);
    }

    .body {
      position: relative;
    }

    .row {
      block-size: var(--ds-data-grid-row-height);
      transition: background-color var(--ds-data-grid-transition) var(--motion-easing-standard);
    }

    :host([density='comfortable']) .row {
      block-size: var(--ds-data-grid-row-height-comfortable);
    }

    @media (prefers-reduced-motion: reduce) {
      .row {
        transition: none;
      }
    }

    :host(:not([height='content'])) .row {
      position: absolute;
      inset-inline: 0;
    }

    .row:hover {
      background: var(--ds-data-grid-row-hover);
    }

    .row[aria-selected='true'] {
      /* rowSelected: color.background.subtle, locked */
      background: var(--color-background-subtle);
    }

    .row[aria-selected='true'] .row-header {
      /* rowSelectedBorder: color.control.selectedBackground, locked; a start-edge bar */
      box-shadow: inset var(--ds-data-grid-row-selected-border-width) 0 0 0 var(--color-control-selected-background);
    }

    .column-header,
    .row-header,
    .cell,
    .select-cell,
    .select-all-cell {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding-inline: var(--ds-data-grid-cell-padding-inline);
      border-inline-end: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
      border-block-end: var(--ds-data-grid-grid-line-width) solid var(--ds-data-grid-grid-line);
      overflow: hidden;
      position: relative;
    }

    .column-header,
    .select-all-cell {
      /* headerSurface / headerColor: locked */
      background: var(--color-background-subtle);
      color: var(--color-foreground);
      font-weight: var(--ds-data-grid-header-weight);
      font-size: var(--ds-data-grid-header-size);
      border-block-end: var(--ds-data-grid-header-border-width) solid var(--ds-data-grid-header-border);
    }

    .row-header {
      font-weight: var(--ds-data-grid-header-weight);
    }

    .cell,
    .row-header {
      /* cellColor: color.foreground, locked */
      color: var(--color-foreground);
    }

    .cell.muted {
      /* cellMutedColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    .align-end {
      justify-content: flex-end;
      text-align: end;
    }
    .align-center {
      justify-content: center;
      text-align: center;
    }
    .numeric {
      font-family: var(--ds-data-grid-numeric-font);
      font-variant-numeric: tabular-nums;
    }

    .pinned-start,
    .pinned-end {
      position: sticky;
      z-index: 2;
      background: var(--color-background);
    }
    .column-header.pinned-start,
    .column-header.pinned-end,
    .select-all-cell.pinned-start {
      z-index: 4;
      background: var(--color-background-subtle);
    }

    :host([data-x-scrolled]) .pinned-start,
    :host([data-x-scrolled]) .pinned-end {
      box-shadow: var(--ds-data-grid-pinned-shadow);
    }

    .cell[data-active],
    .row-header[data-active],
    .column-header[data-active] {
      /* cellFocusRing: color.border.focus, locked */
      box-shadow: inset 0 0 0 var(--ds-data-grid-cell-focus-ring-width) var(--color-border-focus);
      z-index: 1;
    }

    .cell.editing {
      /* cellEditingBackground / cellEditingBorder: locked */
      background: var(--color-control-background);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-focus);
      padding-inline: 0;
      align-items: stretch;
    }

    .cell.invalid {
      /* cellInvalidBorder / cellInvalidBackground / cellInvalidForeground: locked */
      background: var(--color-status-danger-background);
      color: var(--color-status-danger-foreground);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-danger);
    }

    .editor {
      inline-size: 100%;
      block-size: 100%;
    }
    .editor ds-input,
    .editor ds-number-input,
    .editor ds-select,
    .editor ds-date-picker {
      inline-size: 100%;
    }

    .sort-button {
      --ds-button-padding-inline: 0;
      --ds-button-padding-block: 0;
    }

    .resize-handle {
      position: absolute;
      inset-block: 0;
      inset-inline-end: calc(var(--ds-data-grid-resize-handle-width) / -2);
      inline-size: var(--ds-data-grid-resize-handle-width);
      cursor: col-resize;
      touch-action: none;
      z-index: 5;
    }
    .resize-handle:hover,
    .resize-handle.active {
      background: var(--ds-data-grid-resize-handle);
    }

    .range-overlay {
      position: absolute;
      pointer-events: none;
      /* rangeBackground / rangeBorder: locked */
      background: color-mix(in srgb, var(--color-background-strong) 100%, transparent);
      box-shadow: inset 0 0 0 var(--ds-data-grid-range-border-width) var(--color-control-selected-background);
      z-index: 2;
      display: none;
    }
    .range-overlay.visible {
      display: block;
    }

    .empty-row {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-block: var(--layout-inset-md, var(--space-6));
      block-size: 100%;
    }

    .status-bar {
      /* statusBarSurface / statusBarColor: locked */
      background: var(--color-background-subtle);
      color: var(--color-foreground-muted);
      font-size: var(--ds-data-grid-status-bar-size);
      padding: var(--ds-data-grid-status-bar-padding);
    }
  `;

  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  @property() caption!: string;

  /** Visually hides the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) hideCaption = false;

  /** Column definitions in display order. A property, not an attribute. */
  @property({ attribute: false }) columns: DataGridColumn[] = [];

  /** The rows. `id` must be stable. A property, not an attribute. */
  @property({ attribute: false }) data: DataGridRow[] = [];

  /** Total rows when `data` is a window of a larger set (server paging). */
  @property({ type: Number, attribute: 'row-count' }) rowCount?: number;

  /** Controlled sort state. */
  @property({ attribute: false }) sort?: DataGridSort;

  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  @property({ attribute: false }) defaultSort?: DataGridSort;

  /** `row` adds a checkbox column; `cell` selects one cell; `range` allows rectangle selection. */
  @property({ reflect: true }) selectable: DataGridSelectable = 'none';

  /** Controlled selected row ids (row mode). */
  @property({ attribute: false }) selected?: string[];

  /** Master switch: cells whose column is `editable` can be edited. */
  @property({ type: Boolean, reflect: true }) editable = false;

  /** Row height. */
  @property({ reflect: true }) density: DataGridDensity = 'compact';

  /** The header stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute;
      always true when `height` is `viewport` or `fixed`. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  stickyHeader = true;

  /** `viewport` fills the height under the header and scrolls internally; `content` grows with rows;
      `fixed` uses `overrides.fixedHeight`. */
  @property({ reflect: true }) height: DataGridHeight = 'viewport';

  /** Data is being fetched: sets `aria-busy` and shows `copy.loading` in the status bar. Existing rows stay. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) emptyMessage?: string;

  /** A footer line with row count, selection count and validation messages. Exposed as the negated
      `no-status-bar` attribute. */
  @property({ attribute: 'no-status-bar', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  showStatusBar = true;

  /** Per-instance style overrides: `{ captionSize: 'font.size.lg' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<DataGridOverridableBinding, TokenRef>>;

  @state() private internalSort?: DataGridSort;
  @state() private internalSelectedRows: string[] = [];
  @state() private internalSelectedCell: DataGridCellRef | null = null;
  @state() private internalRange: DataGridRangeRef | null = null;
  @state() private activeRowIndex = -1;
  @state() private activeColKey = '';
  @state() private editing?: EditingState;
  @state() private columnWidths: Record<string, number> = {};
  @state() private bodyScrollTop = 0;
  @state() private bodyScrollLeft = 0;
  @state() private viewportPx = 0;
  @state() private liveMessage = '';

  private readonly instanceId = nextDataGridId();
  private rowHeightPx = 0;
  private resizeObserver?: ResizeObserver;
  private lastRequestedEnd = -1;
  private activeDrag?: { column: string; pointerId: number; startX: number; startWidth: number };
  private rangeAnchor?: { rowIndex: number; colKey: string };

  @query('.grid-scroll') private readonly gridEl?: HTMLElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'DataGrid');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    this.internalSort = this.defaultSort;
    if (this.gridEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.viewportPx = this.gridEl?.clientHeight ?? 0;
        this.measureRowHeight();
      });
      this.resizeObserver.observe(this.gridEl);
      this.viewportPx = this.gridEl.clientHeight;
      this.measureRowHeight();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('density')) {
      this.measureRowHeight();
    }
  }

  protected override updated(): void {
    this.warnInDev();
  }

  protected override render() {
    const rows = this.sortedRows();
    const total = this.rowCount ?? rows.length;
    const columnKeys = this.effectiveColumnKeys();
    const colCount = columnKeys.length;
    const activeCell = this.activeCellRef(rows);
    const visibleRange = this.visibleRowRange(rows.length);
    const visibleRows = rows.slice(visibleRange.start, visibleRange.end + 1);

    return html`
      <div class="container" part="container">
        <div
          id="${this.instanceId}-caption"
          class=${classMap({ caption: true, 'visually-hidden': this.hideCaption })}
          part="caption"
        >
          <ds-heading level="2" size="md" .overrides=${this.captionOverrides}>${this.caption}</ds-heading>
        </div>

        <div
          class="grid-scroll"
          part="scroll-region grid"
          role="grid"
          tabindex="0"
          aria-labelledby="${this.instanceId}-caption"
          aria-describedby="${this.instanceId}-row-count ${this.instanceId}-position ${this.instanceId}-scroll-hint"
          aria-rowcount=${total + 1}
          aria-colcount=${colCount}
          aria-multiselectable=${ifDefined(this.selectable === 'none' ? undefined : 'true')}
          aria-readonly=${this.editable ? 'false' : 'true'}
          aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
          aria-activedescendant=${ifDefined(this.activeDescendantId(rows))}
          @keydown=${this.handleGridKeydown}
          @scroll=${this.handleScroll}
          @click=${this.handleGridClick}
          @dblclick=${this.handleGridDblClick}
        >
          <div class="header" part="header" role="rowgroup">
            <div class="row-grid header-row" part="header-row" role="row" aria-rowindex="1" style=${this.gridTemplate()}>
              ${this.selectable === 'row' ? this.renderSelectAllCell(rows) : nothing}
              ${this.columns.map((column, index) => this.renderColumnHeader(column, index))}
            </div>
          </div>

          <div
            class="body"
            part="body"
            role="rowgroup"
            style=${styleMap({ blockSize: this.height === 'content' ? 'auto' : `${total * this.rowHeightPx}px` })}
          >
            ${rows.length === 0
              ? this.renderEmptyState()
              : visibleRows.map((row, i) => this.renderRow(row, visibleRange.start + i, activeCell))}
            <div class=${classMap({ 'range-overlay': true, visible: this.selectable === 'range' && Boolean(this.internalRange) })}
              part="range-overlay" aria-hidden="true" style=${styleMap(this.rangeOverlayStyle(rows))}
            ></div>
          </div>
        </div>

        ${this.showStatusBar
          ? html`<div class="status-bar" part="status-bar" role="status">
              <ds-text size="xs" tone="muted">${this.statusText(rows.length, total)}</ds-text>
            </div>`
          : html`<div class="visually-hidden" role="status">${this.liveMessage}</div>`}

        <span id="${this.instanceId}-row-count" class="visually-hidden">${COPY_ROW_COUNT(total)}</span>
        <span id="${this.instanceId}-position" class="visually-hidden">${this.positionText(rows)}</span>
        <span id="${this.instanceId}-scroll-hint" class="visually-hidden">${COPY_SCROLL_HINT}</span>
      </div>
    `;
  }

  private renderSelectAllCell(rows: DataGridRow[]) {
    const selected = this.currentSelectedRows();
    const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));
    const someSelected = !allSelected && rows.some((row) => selected.includes(row.id));
    return html`
      <div
        id="${this.instanceId}-h-${SELECT_COLUMN_KEY}"
        class=${classMap({ 'select-all-cell': true, pinned: false })}
        part="select-all-cell"
        role="columnheader"
        aria-colindex="1"
        data-active=${ifDefined(this.activeRowIndex === -1 && this.activeColKey === SELECT_COLUMN_KEY ? '' : undefined)}
        data-ds-cell-key=${SELECT_COLUMN_KEY}
      >
        <ds-checkbox
          tabindex="-1"
          label=${COPY_SELECT_ALL}
          .checked=${allSelected}
          .indeterminate=${someSelected}
          @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectAllChange(event, rows)}
        ></ds-checkbox>
      </div>
    `;
  }

  private renderColumnHeader(column: DataGridColumn, index: number) {
    const currentSort = this.currentSort();
    const direction = currentSort?.column === column.key ? currentSort.direction : undefined;
    const colIndex = index + 1 + (this.selectable === 'row' ? 1 : 0);
    const pin = this.pinnedStyle(column);
    return html`
      <div
        id="${this.instanceId}-h-${column.key}"
        class=${classMap({
          'column-header': true,
          'align-end': column.align === 'end',
          'align-center': column.align === 'center',
          'pinned-start': column.pinned === 'start',
          'pinned-end': column.pinned === 'end',
        })}
        part="column-header"
        role="columnheader"
        aria-colindex=${colIndex}
        aria-sort=${ifDefined(column.sortable ? (direction ?? 'none') : undefined)}
        aria-describedby="${this.instanceId}-position"
        data-active=${ifDefined(this.activeRowIndex === -1 && this.activeColKey === column.key ? '' : undefined)}
        data-ds-cell-key=${column.key}
        style=${styleMap(pin)}
      >
        ${column.sortable
          ? html`<ds-button
              class="sort-button"
              part="sort-button"
              variant="ghost"
              size="sm"
              tabindex="-1"
              label=${this.sortButtonLabel(column, direction)}
              @press=${(event: Event) => this.handleSort(event, column.key)}
            >
              <ds-icon slot="trailing-icon" name=${direction === 'descending' ? 'chevron-down' : 'chevron-up'} inline></ds-icon>
            </ds-button>`
          : column.abbr
            ? html`<abbr title=${column.header}>${column.abbr}</abbr>`
            : column.header}
        ${column.resizable ? this.renderResizeHandle(column) : nothing}
      </div>
    `;
  }

  private renderResizeHandle(column: DataGridColumn) {
    return html`<div
      class=${classMap({ 'resize-handle': true, active: this.activeDrag?.column === column.key })}
      part="resize-handle"
      aria-label=${COPY_RESIZE(column.header)}
      @pointerdown=${(event: PointerEvent) => this.handleResizeStart(event, column)}
    ></div>`;
  }

  private renderEmptyState() {
    const message = this.emptyMessage ?? COPY_EMPTY;
    return html`<div class="empty-row" part="empty-state">
      <ds-text tone="muted">${message}</ds-text>
    </div>`;
  }

  private renderRow(row: DataGridRow, index: number, activeCell: DataGridCellRef | undefined) {
    const selectedRows = this.currentSelectedRows();
    const rowSelected =
      this.selectable === 'row'
        ? selectedRows.includes(row.id)
        : this.selectable === 'cell'
          ? this.currentSelectedCell()?.rowId === row.id
          : false;
    const rowHeaderColumn = this.columns.find((column) => column.isRowHeader);
    const rowName = rowHeaderColumn ? String(row[rowHeaderColumn.key] ?? row.id) : row.id;
    const offset = this.height === 'content' ? undefined : `${index * this.rowHeightPx}px`;

    return html`
      <div
        class="row-grid row"
        part="row"
        role="row"
        aria-rowindex=${index + 2}
        aria-selected=${ifDefined(this.selectable === 'row' || this.selectable === 'cell' ? String(rowSelected) : undefined)}
        style=${styleMap({ transform: offset ? `translateY(${offset})` : undefined, ...this.gridTemplateObj() })}
      >
        ${this.selectable === 'row' ? this.renderSelectCell(row, rowName, selectedRows.includes(row.id)) : nothing}
        ${this.columns.map((column, colIndex) => this.renderCell(column, row, index, colIndex, activeCell))}
      </div>
    `;
  }

  private renderSelectCell(row: DataGridRow, rowName: string, selected: boolean) {
    return html`
      <div
        id="${this.instanceId}-c-${row.id}-${SELECT_COLUMN_KEY}"
        class="select-cell"
        part="select-cell"
        role="gridcell"
        aria-colindex="1"
        data-active=${ifDefined(this.activeColKey === SELECT_COLUMN_KEY && this.rowIdAtActive() === row.id ? '' : undefined)}
        data-ds-cell-row=${row.id}
        data-ds-cell-key=${SELECT_COLUMN_KEY}
      >
        <ds-checkbox
          tabindex="-1"
          label=${COPY_SELECT_ROW(rowName)}
          .checked=${selected}
          @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectRowChange(event, row.id)}
        ></ds-checkbox>
      </div>
    `;
  }

  private renderCell(
    column: DataGridColumn,
    row: DataGridRow,
    rowIndex: number,
    colIndex: number,
    activeCell: DataGridCellRef | undefined,
  ) {
    const id = this.cellId(row.id, column.key);
    const isActive = this.activeRowIndex === rowIndex && this.activeColKey === column.key;
    const isEditing = this.editing?.rowId === row.id && this.editing.column === column.key;
    const invalid = isEditing && Boolean(this.editing?.error);
    const inRange = this.cellInRange(rowIndex, column.key);
    const cellSelected =
      this.selectable === 'cell' &&
      this.currentSelectedCell()?.rowId === row.id &&
      this.currentSelectedCell()?.column === column.key;
    const colAriaIndex = colIndex + 1 + (this.selectable === 'row' ? 1 : 0);
    const pin = this.pinnedStyle(column);

    const content = column.render ? column.render(row) : String(row[column.key] ?? '');

    const classes = {
      cell: !column.isRowHeader,
      'row-header': Boolean(column.isRowHeader),
      'align-end': column.align === 'end',
      'align-center': column.align === 'center',
      numeric: column.align === 'end',
      'pinned-start': column.pinned === 'start',
      'pinned-end': column.pinned === 'end',
      editing: isEditing,
      invalid,
      selected: cellSelected || inRange,
    };

    return html`
      <div
        id=${id}
        class=${classMap(classes)}
        part=${column.isRowHeader ? 'row-header' : 'cell'}
        role=${column.isRowHeader ? 'rowheader' : 'gridcell'}
        aria-colindex=${colAriaIndex}
        aria-selected=${ifDefined(this.selectable === 'cell' || this.selectable === 'range' ? String(cellSelected || inRange) : undefined)}
        aria-describedby="${this.instanceId}-position"
        data-active=${ifDefined(isActive ? '' : undefined)}
        data-ds-cell-row=${row.id}
        data-ds-cell-key=${column.key}
        style=${styleMap(pin)}
      >
        ${isEditing ? this.renderEditor(column, row) : html`<span part="cell-content" class="cell-content">${content}</span>`}
      </div>
    `;
  }

  private renderEditor(column: DataGridColumn, row: DataGridRow) {
    const editing = this.editing;
    if (!editing) {
      return nothing;
    }
    const kind = column.editor ?? 'text';
    const commit = (value: unknown) => this.commitEdit(column, row, value);
    switch (kind) {
      case 'number':
        return html`<div class="editor" part="editor">
          <ds-number-input
            label=${column.header}
            name=${column.key}
            .value=${typeof editing.value === 'number' ? editing.value : undefined}
            @change=${(event: CustomEvent<NumberInputChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-number-input>
        </div>`;
      case 'select':
        return html`<div class="editor" part="editor">
          <ds-select
            label=${column.header}
            name=${column.key}
            .options=${column.options ?? []}
            .value=${editing.value as SelectValue}
            @change=${(event: CustomEvent<SelectChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-select>
        </div>`;
      case 'date':
        return html`<div class="editor" part="editor">
          <ds-date-picker
            label=${column.header}
            name=${column.key}
            .value=${editing.value as DatePickerValue}
            @change=${(event: CustomEvent<DatePickerChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-date-picker>
        </div>`;
      case 'checkbox':
        return html`<div class="editor" part="editor">
          <ds-checkbox
            label=${column.header}
            name=${column.key}
            .checked=${Boolean(editing.value)}
            @change=${(event: CustomEvent<CheckboxChangeDetail>) => commit(event.detail.checked)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-checkbox>
        </div>`;
      default:
        return html`<div class="editor" part="editor">
          <ds-input
            label=${column.header}
            name=${column.key}
            .value=${editing.value === undefined || editing.value === null ? '' : String(editing.value)}
            @change=${(event: CustomEvent<InputChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-input>
        </div>`;
    }
  }

  /* ---------- layout ---------- */

  private columnWidth(column: DataGridColumn): number {
    return this.columnWidths[column.key] ?? column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH;
  }

  private gridTemplate() {
    return styleMap(this.gridTemplateObj());
  }

  private gridTemplateObj(): Record<string, string> {
    const parts: string[] = [];
    if (this.selectable === 'row') {
      parts.push('var(--size-target-min)');
    }
    for (const column of this.columns) {
      parts.push(`${this.columnWidth(column)}px`);
    }
    return { gridTemplateColumns: parts.join(' ') };
  }

  /** Sticky offsets for pinned columns; simplified to ignore the select column's own width when combined with pinning. */
  private pinnedStyle(column: DataGridColumn): Record<string, string> {
    if (!column.pinned) {
      return {};
    }
    const index = this.columns.findIndex((candidate) => candidate.key === column.key);
    if (column.pinned === 'start') {
      let left = 0;
      for (let i = 0; i < index; i += 1) {
        if (this.columns[i]?.pinned === 'start') {
          left += this.columnWidth(this.columns[i]!);
        }
      }
      return { insetInlineStart: `${left}px` };
    }
    let right = 0;
    for (let i = this.columns.length - 1; i > index; i -= 1) {
      if (this.columns[i]?.pinned === 'end') {
        right += this.columnWidth(this.columns[i]!);
      }
    }
    return { insetInlineEnd: `${right}px` };
  }

  private measureRowHeight(): void {
    const varName =
      this.density === 'comfortable' ? '--ds-data-grid-row-height-comfortable' : '--ds-data-grid-row-height';
    const raw = getComputedStyle(this).getPropertyValue(varName).trim();
    this.rowHeightPx = Number.parseFloat(raw) || 32;
  }

  /* ---------- data ---------- */

  private effectiveColumnKeys(): string[] {
    const keys = this.columns.map((column) => column.key);
    return this.selectable === 'row' ? [SELECT_COLUMN_KEY, ...keys] : keys;
  }

  private sortedRows(): DataGridRow[] {
    if (this.sort !== undefined) {
      return this.data;
    }
    const sortState = this.internalSort;
    if (!sortState) {
      return this.data;
    }
    const factor = sortState.direction === 'ascending' ? 1 : -1;
    return [...this.data].sort((a, b) => {
      const left = a[sortState.column];
      const right = b[sortState.column];
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right, undefined, { numeric: true }) * factor;
      }
      return (Number(left) - Number(right)) * factor;
    });
  }

  private currentSort(): DataGridSort | undefined {
    return this.sort ?? this.internalSort;
  }

  private currentSelectedRows(): string[] {
    return this.selected ?? this.internalSelectedRows;
  }

  private currentSelectedCell(): DataGridCellRef | null {
    return this.internalSelectedCell;
  }

  private cellId(rowId: string, column: string): string {
    return `${this.instanceId}-c-${rowId}-${column}`;
  }

  private rowIdAtActive(): string | undefined {
    return this.sortedRows()[this.activeRowIndex]?.id;
  }

  private activeCellRef(rows: DataGridRow[]): DataGridCellRef | undefined {
    const row = rows[this.activeRowIndex];
    return row ? { rowId: row.id, column: this.activeColKey } : undefined;
  }

  private activeDescendantId(rows: DataGridRow[]): string | undefined {
    if (this.activeRowIndex === -1) {
      return this.activeColKey ? `${this.instanceId}-h-${this.activeColKey}` : undefined;
    }
    const row = rows[this.activeRowIndex];
    return row && this.activeColKey ? this.cellId(row.id, this.activeColKey) : undefined;
  }

  private positionText(rows: DataGridRow[]): string {
    if (this.activeRowIndex === -1) {
      const column = this.columns.find((c) => c.key === this.activeColKey);
      return column ? COPY_POSITION(1, column.header) : '';
    }
    const row = rows[this.activeRowIndex];
    const column = this.columns.find((c) => c.key === this.activeColKey);
    if (!row || !column) {
      return '';
    }
    return COPY_POSITION(this.activeRowIndex + 2, column.header);
  }

  private statusText(loadedRows: number, total: number): string {
    if (this.editing?.error) {
      return COPY_INVALID(this.editing.error);
    }
    if (this.editing) {
      const column = this.columns.find((c) => c.key === this.editing?.column);
      return COPY_EDITING(column?.header ?? this.editing.column);
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    if (this.selectable === 'row') {
      const count = this.currentSelectedRows().length;
      if (count > 0) {
        return COPY_SELECTED_ROWS(count, total);
      }
    }
    if (this.selectable === 'range' && this.internalRange) {
      const rect = this.rangeRect(this.sortedRows());
      if (rect) {
        return COPY_SELECTED_RANGE(rect.rowEnd - rect.rowStart + 1, rect.colEnd - rect.colStart + 1);
      }
    }
    return COPY_ROW_COUNT(total);
  }

  /* ---------- range selection ---------- */

  private rangeRect(rows: DataGridRow[]): { rowStart: number; rowEnd: number; colStart: number; colEnd: number } | undefined {
    const range = this.internalRange;
    if (!range) {
      return undefined;
    }
    const fromRow = rows.findIndex((row) => row.id === range.from.rowId);
    const toRow = rows.findIndex((row) => row.id === range.to.rowId);
    if (fromRow === -1 || toRow === -1) {
      return undefined;
    }
    const colKeys = this.columns.map((c) => c.key);
    const fromCol = colKeys.indexOf(range.from.column);
    const toCol = colKeys.indexOf(range.to.column);
    if (fromCol === -1 || toCol === -1) {
      return undefined;
    }
    return {
      rowStart: Math.min(fromRow, toRow),
      rowEnd: Math.max(fromRow, toRow),
      colStart: Math.min(fromCol, toCol),
      colEnd: Math.max(fromCol, toCol),
    };
  }

  private cellInRange(rowIndex: number, colKey: string): boolean {
    if (this.selectable !== 'range' || !this.internalRange) {
      return false;
    }
    const rect = this.rangeRect(this.sortedRows());
    if (!rect) {
      return false;
    }
    const colIndex = this.columns.findIndex((c) => c.key === colKey);
    return rowIndex >= rect.rowStart && rowIndex <= rect.rowEnd && colIndex >= rect.colStart && colIndex <= rect.colEnd;
  }

  /** Positions the range overlay by measuring the two corner cells; hidden if either is not currently rendered
      (outside the virtualized window). Not the primary visual signal — cells in range also carry `.selected`. */
  private rangeOverlayStyle(rows: DataGridRow[]): Record<string, string> {
    if (this.selectable !== 'range' || !this.internalRange || !this.gridEl) {
      return {};
    }
    const rect = this.rangeRect(rows);
    if (!rect) {
      return {};
    }
    const startRow = rows[rect.rowStart];
    const endRow = rows[rect.rowEnd];
    const startColKey = this.columns[rect.colStart]?.key;
    const endColKey = this.columns[rect.colEnd]?.key;
    if (!startRow || !endRow || !startColKey || !endColKey) {
      return {};
    }
    const startEl = this.renderRoot.querySelector(`#${CSS.escape(this.cellId(startRow.id, startColKey))}`) as HTMLElement | null;
    const endEl = this.renderRoot.querySelector(`#${CSS.escape(this.cellId(endRow.id, endColKey))}`) as HTMLElement | null;
    if (!startEl || !endEl) {
      return {};
    }
    const containerRect = this.gridEl.getBoundingClientRect();
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const top = Math.min(startRect.top, endRect.top) - containerRect.top + this.gridEl.scrollTop;
    const left = Math.min(startRect.left, endRect.left) - containerRect.left + this.gridEl.scrollLeft;
    const bottom = Math.max(startRect.bottom, endRect.bottom) - containerRect.top + this.gridEl.scrollTop;
    const right = Math.max(startRect.right, endRect.right) - containerRect.left + this.gridEl.scrollLeft;
    return {
      top: `${top}px`,
      left: `${left}px`,
      inlineSize: `${right - left}px`,
      blockSize: `${bottom - top}px`,
    };
  }

  /* ---------- events: sort / selection ---------- */

  private sortButtonLabel(column: DataGridColumn, direction: DataGridSortDirection | undefined): string {
    const next = direction === 'ascending' ? 'descending' : 'ascending';
    return next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header);
  }

  private handleSort(event: Event, column: string): void {
    event.stopPropagation();
    const current = this.currentSort();
    const direction: DataGridSortDirection =
      current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending';
    const next: DataGridSort = { column, direction };
    if (this.sort === undefined) {
      this.internalSort = next;
    }
    const columnDef = this.columns.find((c) => c.key === column);
    this.liveMessage = COPY_SORTED_ANNOUNCEMENT(columnDef?.header ?? column, direction);
    this.dispatchEvent(new CustomEvent<DataGridSortChangeDetail>('sort-change', { detail: next, bubbles: true, composed: true }));
  }

  private handleSelectAllChange(event: CustomEvent<CheckboxChangeDetail>, rows: DataGridRow[]): void {
    event.stopPropagation();
    const next = event.detail.checked ? rows.map((row) => row.id) : [];
    this.commitRowSelection(next);
  }

  private handleSelectRowChange(event: CustomEvent<CheckboxChangeDetail>, id: string): void {
    event.stopPropagation();
    const current = this.currentSelectedRows();
    const next = event.detail.checked ? [...current, id] : current.filter((existing) => existing !== id);
    this.commitRowSelection(next);
  }

  private commitRowSelection(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelectedRows = next;
    }
    this.liveMessage = COPY_SELECTED_ROWS(next.length, this.rowCount ?? this.data.length);
    this.dispatchEvent(
      new CustomEvent<DataGridSelectionChangeDetail>('selection-change', {
        detail: { rows: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private commitCellSelection(cell: DataGridCellRef | null): void {
    this.internalSelectedCell = cell;
    this.dispatchEvent(
      new CustomEvent<DataGridSelectionChangeDetail>('selection-change', {
        detail: { cell },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private commitRangeSelection(range: DataGridRangeRef | null): void {
    this.internalRange = range;
    if (range) {
      const rect = this.rangeRect(this.sortedRows());
      if (rect) {
        this.liveMessage = COPY_SELECTED_RANGE(rect.rowEnd - rect.rowStart + 1, rect.colEnd - rect.colStart + 1);
      }
    }
    this.dispatchEvent(
      new CustomEvent<DataGridSelectionChangeDetail>('selection-change', {
        detail: { range },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---------- editing ---------- */

  private startEdit(column: DataGridColumn, row: DataGridRow): void {
    if (!this.editable || !column.editable || column.isRowHeader) {
      return;
    }
    const allowed = this.dispatchEvent(
      new CustomEvent<DataGridEditStartDetail>('edit-start', {
        detail: { rowId: row.id, column: column.key },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!allowed) {
      return;
    }
    const value = row[column.key];
    this.editing = { rowId: row.id, column: column.key, value, previous: value };
    this.liveMessage = COPY_EDITING(column.header);
    this.requestUpdate();
    this.updateComplete.then(() => this.focusEditor());
  }

  private focusEditor(): void {
    const el = this.renderRoot.querySelector('.editor > *') as HTMLElement | null;
    el?.focus();
  }

  private commitEdit(column: DataGridColumn, row: DataGridRow, value: unknown): void {
    if (!this.editing) {
      return;
    }
    const error = column.validate?.(value, row);
    if (error) {
      this.editing = { ...this.editing, value, error };
      this.liveMessage = COPY_INVALID(error);
      return;
    }
    const previous = this.editing.previous;
    this.editing = undefined;
    this.dispatchEvent(
      new CustomEvent<DataGridCellChangeDetail>('cell-change', {
        detail: { rowId: row.id, column: column.key, value, previous },
        bubbles: true,
        composed: true,
      }),
    );
    this.focusGrid();
  }

  private cancelEdit(): void {
    this.editing = undefined;
    this.focusGrid();
  }

  private focusGrid(): void {
    this.updateComplete.then(() => this.gridEl?.focus());
  }

  private handleEditorKeydown(event: KeyboardEvent, column: DataGridColumn, row: DataGridRow): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.cancelEdit();
      return;
    }
    if (event.key === 'Enter') {
      event.stopPropagation();
      const value = this.editing?.value;
      this.commitEdit(column, row, value);
      if (!this.editing) {
        this.moveActive(1, 0);
      }
      return;
    }
    if (event.key === 'F2') {
      event.stopPropagation();
      const value = this.editing?.value;
      this.commitEdit(column, row, value);
    }
  }

  /* ---------- column resize ---------- */

  private handleResizeStart(event: PointerEvent, column: DataGridColumn): void {
    event.stopPropagation();
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.activeDrag = { column: column.key, pointerId: event.pointerId, startX: event.clientX, startWidth: this.columnWidth(column) };
    target.addEventListener('pointermove', this.handleResizeMove);
    target.addEventListener('pointerup', this.handleResizeEnd);
  }

  private readonly handleResizeMove = (event: PointerEvent): void => {
    if (!this.activeDrag) {
      return;
    }
    const column = this.columns.find((c) => c.key === this.activeDrag?.column);
    const minWidth = column?.minWidth ?? MIN_COLUMN_WIDTH;
    const delta = event.clientX - this.activeDrag.startX;
    const width = Math.max(minWidth, this.activeDrag.startWidth + delta);
    this.columnWidths = { ...this.columnWidths, [this.activeDrag.column]: width };
  };

  private readonly handleResizeEnd = (event: PointerEvent): void => {
    const target = event.currentTarget as HTMLElement;
    target.removeEventListener('pointermove', this.handleResizeMove);
    target.removeEventListener('pointerup', this.handleResizeEnd);
    const drag = this.activeDrag;
    this.activeDrag = undefined;
    if (!drag) {
      return;
    }
    const width = this.columnWidths[drag.column];
    if (width !== undefined) {
      this.dispatchEvent(
        new CustomEvent<DataGridColumnResizeDetail>('column-resize', {
          detail: { column: drag.column, width },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.requestUpdate();
  };

  /* ---------- scrolling / virtualization ---------- */

  private handleScroll(): void {
    const el = this.gridEl;
    if (!el) {
      return;
    }
    this.bodyScrollTop = el.scrollTop;
    this.bodyScrollLeft = el.scrollLeft;
    this.toggleAttribute('data-x-scrolled', el.scrollLeft > 0);
    this.toggleAttribute('data-header-scrolled', el.scrollTop > 0);
    this.maybeRequestMoreRows();
  }

  private maybeRequestMoreRows(): void {
    if (this.height === 'content' || !this.rowCount || this.rowCount <= this.data.length || this.rowHeightPx === 0) {
      return;
    }
    const lastVisibleIndex = Math.ceil((this.bodyScrollTop + this.viewportPx) / this.rowHeightPx);
    if (lastVisibleIndex < this.data.length - 5) {
      return;
    }
    const start = this.data.length;
    const end = Math.min(this.rowCount, start + Math.max(20, Math.ceil(this.viewportPx / this.rowHeightPx)));
    if (end <= start || this.lastRequestedEnd >= end) {
      return;
    }
    this.lastRequestedEnd = end;
    this.dispatchEvent(
      new CustomEvent<DataGridRangeNeededDetail>('range-needed', { detail: { start, end }, bubbles: true, composed: true }),
    );
  }

  private visibleRowRange(total: number): { start: number; end: number } {
    if (this.height === 'content' || this.rowHeightPx === 0) {
      return { start: 0, end: total - 1 };
    }
    const overscan = Math.max(1, Math.ceil(this.viewportPx / this.rowHeightPx));
    const start = Math.max(0, Math.floor(this.bodyScrollTop / this.rowHeightPx) - overscan);
    const end = Math.min(total - 1, Math.ceil((this.bodyScrollTop + this.viewportPx) / this.rowHeightPx) + overscan);
    return { start, end };
  }

  private ensureRowVisible(rowIndex: number): void {
    if (this.height === 'content' || !this.gridEl || this.rowHeightPx === 0) {
      return;
    }
    const top = rowIndex * this.rowHeightPx;
    const bottom = top + this.rowHeightPx;
    if (top < this.gridEl.scrollTop) {
      this.gridEl.scrollTop = top;
    } else if (bottom > this.gridEl.scrollTop + this.viewportPx) {
      this.gridEl.scrollTop = bottom - this.viewportPx;
    }
  }

  /* ---------- keyboard / focus / click ---------- */

  private handleGridClick(event: MouseEvent): void {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && el.dataset.dsCellKey) as
      | HTMLElement
      | undefined;
    if (!target) {
      return;
    }
    const rowId = target.dataset.dsCellRow;
    const colKey = target.dataset.dsCellKey!;
    const rows = this.sortedRows();
    const rowIndex = rowId === undefined ? -1 : rows.findIndex((row) => row.id === rowId);
    this.setActive(rowIndex, colKey);
    if (rowIndex === -1) {
      return;
    }
    if (this.selectable === 'cell') {
      this.commitCellSelection({ rowId: rowId!, column: colKey });
    } else if (this.selectable === 'range') {
      if (event.shiftKey && this.rangeAnchor) {
        this.commitRangeSelection({
          from: { rowId: rows[this.rangeAnchor.rowIndex]!.id, column: this.rangeAnchor.colKey },
          to: { rowId: rowId!, column: colKey },
        });
      } else {
        this.rangeAnchor = { rowIndex, colKey };
        this.commitRangeSelection({ from: { rowId: rowId!, column: colKey }, to: { rowId: rowId!, column: colKey } });
      }
    }
  }

  private handleGridDblClick(event: MouseEvent): void {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && el.dataset.dsCellKey) as
      | HTMLElement
      | undefined;
    if (!target?.dataset.dsCellRow) {
      return;
    }
    const rows = this.sortedRows();
    const row = rows.find((r) => r.id === target.dataset.dsCellRow);
    const column = this.columns.find((c) => c.key === target.dataset.dsCellKey);
    if (row && column) {
      this.startEdit(column, row);
    }
  }

  private setActive(rowIndex: number, colKey: string): void {
    this.activeRowIndex = rowIndex;
    this.activeColKey = colKey;
  }

  private moveActive(rowDelta: number, colDelta: number): void {
    const rows = this.sortedRows();
    const keys = this.effectiveColumnKeys();
    let colIndex = Math.max(0, keys.indexOf(this.activeColKey) + colDelta);
    colIndex = Math.min(colIndex, keys.length - 1);
    const rowIndex = Math.max(-1, Math.min(rows.length - 1, this.activeRowIndex + rowDelta));
    this.setActive(rowIndex, keys[colIndex] ?? keys[0]!);
    if (rowIndex >= 0) {
      this.ensureRowVisible(rowIndex);
    }
  }

  private handleGridKeydown(event: KeyboardEvent): void {
    if (this.editing) {
      return;
    }
    const rows = this.sortedRows();
    if (this.activeColKey === '') {
      this.setActive(-1, this.effectiveColumnKeys()[0] ?? '');
    }
    const keys = this.effectiveColumnKeys();
    const colIndex = keys.indexOf(this.activeColKey);
    const currentColumn = this.columns.find((c) => c.key === this.activeColKey);
    const activeRow = rows[this.activeRowIndex];

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveActive(0, 1);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveActive(0, -1);
        return;
      case 'ArrowDown':
        event.preventDefault();
        if (event.shiftKey && this.selectable === 'range' && this.activeRowIndex >= 0) {
          this.extendRange(1, 0);
          return;
        }
        this.moveActive(1, 0);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (event.shiftKey && this.selectable === 'range' && this.activeRowIndex >= 0) {
          this.extendRange(-1, 0);
          return;
        }
        this.moveActive(-1, 0);
        return;
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          this.setActive(-1, keys[0]!);
        } else {
          this.setActive(this.activeRowIndex, keys[0]!);
        }
        return;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          this.setActive(rows.length - 1, keys[keys.length - 1]!);
          this.ensureRowVisible(rows.length - 1);
        } else {
          this.setActive(this.activeRowIndex, keys[keys.length - 1]!);
        }
        return;
      case 'PageDown': {
        event.preventDefault();
        const page = Math.max(1, Math.floor(this.viewportPx / (this.rowHeightPx || 1)));
        this.moveActive(page, 0);
        return;
      }
      case 'PageUp': {
        event.preventDefault();
        const page = Math.max(1, Math.floor(this.viewportPx / (this.rowHeightPx || 1)));
        this.moveActive(-page, 0);
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (this.activeRowIndex === -1) {
          if (currentColumn?.sortable) {
            this.handleSort(event, currentColumn.key);
          }
          return;
        }
        if (activeRow && currentColumn?.editable) {
          this.startEdit(currentColumn, activeRow);
          return;
        }
        this.activateCellControl(activeRow, currentColumn);
        return;
      case 'F2':
        event.preventDefault();
        if (activeRow && currentColumn?.editable) {
          this.startEdit(currentColumn, activeRow);
        }
        return;
      case 'Escape':
        if (this.selectable === 'range' && this.internalRange) {
          event.preventDefault();
          this.commitRangeSelection(null);
        }
        return;
      case ' ':
        if (this.selectable === 'row' || this.selectable === 'range') {
          event.preventDefault();
          this.handleSpace(event, rows, colIndex);
        }
        return;
      case 'a':
      case 'A':
        if (event.ctrlKey && (this.selectable === 'row' || this.selectable === 'range')) {
          event.preventDefault();
          this.selectAll(rows);
        }
        return;
      case 'c':
      case 'C':
        if (event.ctrlKey && this.selectable === 'range') {
          event.preventDefault();
          this.copyRange(rows);
        }
        return;
      case 'Delete':
      case 'Backspace':
        if (this.editable) {
          event.preventDefault();
          this.clearSelectionValues(rows);
        }
        return;
      default:
        if (
          activeRow &&
          currentColumn?.editable &&
          !currentColumn.isRowHeader &&
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          // Typing a character opens the editor (APG grid "type ahead" convention); the character itself is not
          // seeded into the editor — forwarding a keystroke into five different composed field components'
          // internal value/selection state isn't implementable generically. See gaps.
          this.startEdit(currentColumn, activeRow);
        }
        return;
    }
  }

  private extendRange(rowDelta: number, colDelta: number): void {
    const rows = this.sortedRows();
    if (!this.rangeAnchor) {
      this.rangeAnchor = { rowIndex: this.activeRowIndex, colKey: this.activeColKey };
    }
    this.moveActive(rowDelta, colDelta);
    const anchorRow = rows[this.rangeAnchor.rowIndex];
    const focusRow = rows[this.activeRowIndex];
    if (anchorRow && focusRow) {
      this.commitRangeSelection({
        from: { rowId: anchorRow.id, column: this.rangeAnchor.colKey },
        to: { rowId: focusRow.id, column: this.activeColKey },
      });
    }
  }

  private handleSpace(event: KeyboardEvent, rows: DataGridRow[], colIndex: number): void {
    const row = rows[this.activeRowIndex];
    if (!row) {
      return;
    }
    if (this.selectable === 'row') {
      const current = this.currentSelectedRows();
      const next = current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id];
      this.commitRowSelection(next);
      return;
    }
    if (this.selectable === 'range') {
      if (event.ctrlKey) {
        const first = rows[0];
        const last = rows[rows.length - 1];
        if (first && last) {
          this.commitRangeSelection({
            from: { rowId: first.id, column: this.activeColKey },
            to: { rowId: last.id, column: this.activeColKey },
          });
        }
        return;
      }
      const lastColumn = this.columns[this.columns.length - 1];
      if (lastColumn) {
        this.commitRangeSelection({
          from: { rowId: row.id, column: this.columns[0]?.key ?? this.activeColKey },
          to: { rowId: row.id, column: lastColumn.key },
        });
      }
    }
  }

  private selectAll(rows: DataGridRow[]): void {
    if (this.selectable === 'row') {
      this.commitRowSelection(rows.map((row) => row.id));
      return;
    }
    if (this.selectable === 'range') {
      const first = rows[0];
      const last = rows[rows.length - 1];
      const firstColumn = this.columns[0];
      const lastColumn = this.columns[this.columns.length - 1];
      if (first && last && firstColumn && lastColumn) {
        this.commitRangeSelection({
          from: { rowId: first.id, column: firstColumn.key },
          to: { rowId: last.id, column: lastColumn.key },
        });
      }
    }
  }

  private copyRange(rows: DataGridRow[]): void {
    const rect = this.rangeRect(rows);
    if (!rect) {
      return;
    }
    const columns = this.columns.slice(rect.colStart, rect.colEnd + 1);
    const includeHeader = rect.colStart === 0 && rect.colEnd === this.columns.length - 1;
    const lines: string[] = [];
    if (includeHeader) {
      lines.push(columns.map((column) => column.header).join('\t'));
    }
    for (let r = rect.rowStart; r <= rect.rowEnd; r += 1) {
      const row = rows[r];
      if (!row) {
        continue;
      }
      lines.push(columns.map((column) => (column.render ? String(row[column.key] ?? '') : String(row[column.key] ?? ''))).join('\t'));
    }
    const text = lines.join('\n');
    const cellCount = (rect.rowEnd - rect.rowStart + 1) * columns.length;
    navigator.clipboard?.writeText(text).then(
      () => {
        this.liveMessage = COPY_COPIED(cellCount);
      },
      () => undefined,
    );
  }

  private clearSelectionValues(rows: DataGridRow[]): void {
    const targets: { row: DataGridRow; column: DataGridColumn }[] = [];
    if (this.selectable === 'range' && this.internalRange) {
      const rect = this.rangeRect(rows);
      if (rect) {
        for (let r = rect.rowStart; r <= rect.rowEnd; r += 1) {
          const row = rows[r];
          if (!row) {
            continue;
          }
          for (let c = rect.colStart; c <= rect.colEnd; c += 1) {
            const column = this.columns[c];
            if (column?.editable) {
              targets.push({ row, column });
            }
          }
        }
      }
    } else if (this.selectable === 'cell' && this.internalSelectedCell) {
      const row = rows.find((r) => r.id === this.internalSelectedCell?.rowId);
      const column = this.columns.find((c) => c.key === this.internalSelectedCell?.column);
      if (row && column?.editable) {
        targets.push({ row, column });
      }
    } else {
      const row = rows[this.activeRowIndex];
      const column = this.columns.find((c) => c.key === this.activeColKey);
      if (row && column?.editable) {
        targets.push({ row, column });
      }
    }
    for (const { row, column } of targets) {
      const previous = row[column.key];
      const error = column.validate?.(undefined, row);
      if (error) {
        continue;
      }
      this.dispatchEvent(
        new CustomEvent<DataGridCellChangeDetail>('cell-change', {
          detail: { rowId: row.id, column: column.key, value: undefined, previous },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /** Best-effort activation of a control rendered by `column.render` (Link, Button, Checkbox); the doc names this
      case but a consumer-rendered cell's DOM shape isn't known ahead of time. */
  private activateCellControl(row: DataGridRow | undefined, column: DataGridColumn | undefined): void {
    if (!row || !column) {
      return;
    }
    const cellEl = this.renderRoot.querySelector(`#${CSS.escape(this.cellId(row.id, column.key))}`);
    const control = cellEl?.querySelector('ds-button, ds-link, ds-checkbox, button, a[href], [role="button"]') as
      | HTMLElement
      | undefined;
    control?.click();
  }

  /* ---------- overrides / dev warnings ---------- */

  private get captionOverrides(): Partial<Record<HeadingOverridableBinding, TokenRef>> {
    const result: Partial<Record<HeadingOverridableBinding, TokenRef>> = { marginBlockEnd: 'space.0' };
    if (this.overrides?.captionSize) {
      result.fontSize = this.overrides.captionSize;
    }
    if (this.overrides?.captionWeight) {
      result.fontWeight = this.overrides.captionWeight;
    }
    return result;
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as DataGridOverridableBinding[]) {
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
    if (!this.caption) {
      console.warn('<ds-data-grid> requires a `caption`.', this);
    }
    if (this.columns.length > 0 && !this.columns.some((column) => column.isRowHeader)) {
      console.warn('<ds-data-grid> has no column with `isRowHeader: true`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-data-grid': DsDataGrid;
  }
}
