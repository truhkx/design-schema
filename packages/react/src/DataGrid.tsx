import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button, type ButtonOverridableBinding } from './Button';
import { Checkbox } from './Checkbox';
import { DatePicker, type DatePickerValue } from './DatePicker';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text } from './Text';
import './DataGrid.css';

export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';
/** Heading level of the caption. Accepts the schema's string values and their numeric equivalents. */
export type DataGridCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/** A row. `id` must be stable. */
export type DataGridRow = { id: string; [key: string]: unknown };

/** `{ column: string; direction: "ascending" | "descending" }` */
export interface DataGridSortState {
  column: string;
  direction: DataGridSortDirection;
}

export interface DataGridColumnOption {
  value: string;
  label: string;
}

/** One entry of `columns`, in display order. */
export interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  render?: ((row: DataGridRow) => ReactNode) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}

export type DataGridCellRef = { rowId: string; column: string };
export type DataGridRangeRef = { from: DataGridCellRef; to: DataGridCellRef };
/** Row ids, one cell, or a range, matching `selectable`. */
export type DataGridSelection = string[] | DataGridCellRef | DataGridRangeRef;
/** A committed or previous cell value, as the column editor produces it. */
export type DataGridCellValue = string | number | boolean;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are locked. */
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

/** Root CSS hooks, one per overridable binding. The bindings a composed child draws are also
 * forwarded to its own `overrides`: `captionSize`/`captionWeight` to the caption Heading,
 * `statusBarSize` to the status bar Texts, `headerSize`/`headerWeight` to the sort Button. */
const OVERRIDE_HOOKS: Record<DataGridOverridableBinding, string> = {
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
  fontFamily: '--ds-data-grid-font-family', // literal-ok: custom-property hook name, not a font stack
  fontSize: '--ds-data-grid-font-size',
  lineHeight: '--ds-data-grid-line-height',
  numericFont: '--ds-data-grid-numeric-font', // literal-ok: custom-property hook name, not a font stack
  transition: '--ds-data-grid-transition',
};

/** copy.* — verbatim. */
const COPY = {
  sortAscending: 'Sort by {column}, ascending',
  sortDescending: 'Sort by {column}, descending',
  sortedAnnouncement: 'Sorted by {column}, {direction}',
  selectAll: 'Select all rows',
  selectRow: 'Select {rowName}',
  selectedRows: '{count} of {total} rows selected',
  selectedRange: '{rows} rows by {columns} columns selected',
  copied: { one: 'Copied {cells} cell', other: 'Copied {cells} cells' },
  editing: 'Editing {column}. Enter to save, Escape to cancel.',
  invalid: '{message}',
  rowCount: { one: '{count} row', other: '{count} rows' },
  position: 'Row {row}, {column}',
  resize: 'Resize {column}',
  loading: 'Loading',
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
} as const;

/** The width of a column that sets no `width`: the columnWidth binding, `calc(hook * 2)` in the rule. */
const DEFAULT_COLUMN_SIZE = 'var(--ds-data-grid-column-size)';
/** Rows rendered before one row has been measured (a row count, not a size). */
const UNMEASURED_ROW_LIMIT = 50;
/** The selection column: a minimum target plus the cell's own inline padding on both sides. */
const SELECT_COLUMN_SIZE = 'calc(var(--size-target-min) + 2 * var(--ds-data-grid-cell-padding-inline))';
/** The row block size, from the locked rowHeight / rowHeightComfortable bindings (set per density in CSS). */
const ROW_SIZE = 'var(--ds-data-grid-row-size)';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Interactive content a cell's `render` may hold, whatever its tabindex. */
const CONTROL_SELECTOR = 'a[href], button, input, select, textarea, [contenteditable="true"]';
const NAVIGATION_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp']);

declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function interpolate(template: string, values: Record<string, string | number>): string {
  let text = template;
  for (const [key, value] of Object.entries(values)) text = text.replaceAll(`{${key}}`, String(value));
  return text;
}

function pluralForm(forms: { one: string; other: string }, count: number): string {
  const locale = typeof document !== 'undefined' ? document.documentElement.lang || undefined : undefined;
  return new Intl.PluralRules(locale).select(count) === 'one' ? forms.one : forms.other;
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
}

function textOf(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function toCellValue(value: unknown): DataGridCellValue | undefined {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return value === undefined || value === null ? undefined : String(value);
}

function joinClasses(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export interface DataGridProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is captionSize regardless, as Table. */
  captionLevel?: DataGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Table's column model plus grid concerns: pixel `width` (the columnWidth binding when omitted), `resizable`, `pinned`
   * columns (contiguous at the start or end), `editable` with an `editor` kind and `validate`. Exactly
   * one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount;
   * `onRangeNeeded` asks for more. `data` is always a contiguous prefix starting at row 0. */
  rowCount?: number | undefined;
  /** Controlled sort state; as Table. */
  sort?: DataGridSortState | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSortState | undefined;
  /** `row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects the focused cell;
   * `range` allows Shift+arrow / pointer-drag rectangles (copy as TSV). */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited with Enter, F2, typing, or double-click. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized. */
  stickyHeader?: boolean | undefined;
  /** `viewport` sets the grid height to `100vh − 2 × layout.gap.section`; `content` grows with rows
   * (no virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for the composed Select and DatePicker editors (default `document.body`). Platform prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides; each entry sets the matching `--ds-data-grid-*` hook to that token. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** As Table. */
  onSortChange?: ((column: string, direction: DataGridSortDirection) => void) | undefined;
  /** Fired with the selection: row ids, one cell `{ rowId, column }`, or a range `{ from, to }`. */
  onSelectionChange?: ((selection: DataGridSelection) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?:
    | ((rowId: string, column: string, value: DataGridCellValue | undefined, previous: DataGridCellValue | undefined) => void)
    | undefined;
  /** Fired when an editor opens; return false to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired when the visible window comes within one page of the end of `data` and `rowCount` says there is more. */
  onRangeNeeded?: ((start: number, end: number) => void) | undefined;
  /** Fired when the user finishes resizing a resizable column. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
}

type Position = { row: number; col: number };
type Editing = { rowId: string; column: string; seed: string | undefined };

/**
 * DataGrid — Design Schema, category: data. APG grid built from `<div>`s with explicit roles.
 *
 * When to use: Use a DataGrid when people navigate cell by cell, edit values in place, select ranges,
 * or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets,
 * admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and
 * mark the columns that may change; give every editable column a `validate`. Use `height: viewport`
 * (the default) so the grid, not the page, scrolls.
 */
export function DataGrid({
  ref,
  caption,
  captionLevel = '2',
  hideCaption = false,
  columns,
  data,
  rowCount,
  sort,
  defaultSort,
  selectable = 'none',
  selected,
  editable = false,
  density = 'compact',
  stickyHeader = true,
  height = 'viewport',
  loading = false,
  emptyMessage,
  showStatusBar = true,
  container,
  overrides,
  onSortChange,
  onSelectionChange,
  onCellChange,
  onEditStart,
  onRangeNeeded,
  onColumnResize,
  ...rest
}: DataGridProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = `ds-data-grid-${useId()}`;
  const captionId = `${baseId}-caption`;
  const statusId = `${baseId}-status`;
  const cellPrefix = `${baseId}-cell-`;
  const cellId = (row: number, col: number): string => `${cellPrefix}${row < 0 ? 'h' : row}_${col}`;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const stepSizerRef = useRef<HTMLSpanElement | null>(null);
  const targetSizerRef = useRef<HTMLSpanElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  /* ---------- development warnings (once) ---------- */
  const warnedRef = useRef(false);
  if (isDev && !warnedRef.current) {
    warnedRef.current = true;
    const rowHeaders = columns.filter((column) => column.isRowHeader).length;
    if (rowHeaders !== 1) console.warn(`DataGrid: exactly one column may be \`isRowHeader\`; found ${rowHeaders}.`);
    const pins = columns.map((column) => column.pinned);
    const stray = pins.some(
      (pin, i) =>
        (pin === 'start' && pins.slice(0, i).some((p) => p !== 'start')) ||
        (pin === 'end' && pins.slice(i + 1).some((p) => p !== 'end')),
    );
    if (stray) console.warn('DataGrid: pinned columns must be contiguous at the start or end of `columns`.');
  }

  /* ---------- columns ---------- */
  const hasSelectColumn = selectable === 'row';
  const colOffset = hasSelectColumn ? 1 : 0;
  const colCount = colOffset + columns.length;
  const dataColumnAt = (col: number): DataGridColumn | undefined => (col < colOffset ? undefined : columns[col - colOffset]);
  const rowHeaderColumn = columns.find((column) => column.isRowHeader);

  const [resizedWidths, setResizedWidths] = useState<Record<string, number>>({});
  /** The column's width in pixels, or undefined while it takes the columnWidth binding. */
  const widthOf = (column: DataGridColumn): number | undefined => resizedWidths[column.key] ?? column.width;
  const widthCss = (column: DataGridColumn): string => {
    const width = widthOf(column);
    return width === undefined ? DEFAULT_COLUMN_SIZE : `${width}px`;
  };
  /** The width of `columns[from..to)` as one CSS length: the pixel widths plus the default columns. */
  const widthSpan = (from: number, to: number): string => {
    let pixels = 0;
    let defaults = 0;
    for (let i = from; i < to; i += 1) {
      const width = widthOf(columns[i]!);
      if (width === undefined) defaults += 1;
      else pixels += width;
    }
    return defaults === 0 ? `${pixels}px` : `calc(${pixels}px + ${defaults} * ${DEFAULT_COLUMN_SIZE})`;
  };
  const gridTemplateColumns = [hasSelectColumn ? SELECT_COLUMN_SIZE : null, ...columns.map(widthCss)]
    .filter(Boolean)
    .join(' ');

  const pinnedStyle = (column: DataGridColumn, index: number): CSSProperties | undefined => {
    if (column.pinned === 'start') {
      const before = widthSpan(0, index);
      return { insetInlineStart: hasSelectColumn ? `calc(${SELECT_COLUMN_SIZE} + ${before})` : before };
    }
    if (column.pinned === 'end') return { insetInlineEnd: widthSpan(index + 1, columns.length) };
    return undefined;
  };

  /* ---------- sort ---------- */
  const sortControlled = sort !== undefined;
  const [internalSort, setInternalSort] = useState<DataGridSortState | undefined>(defaultSort);
  const activeSort = sortControlled ? sort : internalSort;

  const rows = useMemo(() => {
    if (sortControlled || !activeSort || rowCount !== undefined) return data;
    const factor = activeSort.direction === 'ascending' ? 1 : -1;
    return [...data].sort((a, b) => compareValues(a[activeSort.column], b[activeSort.column]) * factor);
  }, [data, sortControlled, activeSort, rowCount]);
  const loaded = rows.length;
  const total = rowCount !== undefined ? Math.max(rowCount, loaded) : loaded;
  const rowIndexById = useMemo(() => new Map(rows.map((row, i) => [row.id, i])), [rows]);

  const [announcement, setAnnouncement] = useState('');

  const activateSort = (column: DataGridColumn): void => {
    const direction: DataGridSortDirection =
      activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (!sortControlled) setInternalSort({ column: column.key, direction });
    onSortChange?.(column.key, direction);
    setAnnouncement(interpolate(COPY.sortedAnnouncement, { column: column.header, direction }));
  };

  /* ---------- selection ---------- */
  const selectedControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selectedIds = selectedControlled ? selected : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [range, setRange] = useState<DataGridRangeRef | null>(null);
  const anchorRef = useRef<DataGridCellRef | null>(null);
  const rowAnchorRef = useRef<string | null>(null);

  const commitRows = (ids: string[]): void => {
    if (!selectedControlled) setInternalSelected(ids);
    onSelectionChange?.(ids);
    setAnnouncement(interpolate(COPY.selectedRows, { count: ids.length, total }));
  };
  const toggleRow = (id: string): void => {
    rowAnchorRef.current = id;
    commitRows(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  };
  const extendRows = (id: string): void => {
    const anchor = rowAnchorRef.current !== null ? rowIndexById.get(rowAnchorRef.current) : undefined;
    const target = rowIndexById.get(id);
    if (anchor === undefined || target === undefined) return toggleRow(id);
    const span = rows.slice(Math.min(anchor, target), Math.max(anchor, target) + 1).map((row) => row.id);
    commitRows([...selectedIds.filter((existing) => !span.includes(existing)), ...span]);
  };
  const allIds = rows.map((row) => row.id);
  const allSelected = loaded > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitRows(allSelected ? [] : allIds);

  /** Row/column index bounds of a range, or null when an endpoint is no longer loaded. */
  const rangeBounds = (value: DataGridRangeRef | null) => {
    if (!value) return null;
    const r1 = rowIndexById.get(value.from.rowId);
    const r2 = rowIndexById.get(value.to.rowId);
    const c1 = columns.findIndex((column) => column.key === value.from.column);
    const c2 = columns.findIndex((column) => column.key === value.to.column);
    if (r1 === undefined || r2 === undefined || c1 < 0 || c2 < 0) return null;
    return { top: Math.min(r1, r2), bottom: Math.max(r1, r2), left: Math.min(c1, c2), right: Math.max(c1, c2) };
  };
  const bounds = selectable === 'range' ? rangeBounds(range) : null;

  const commitRange = (next: DataGridRangeRef): void => {
    const b = rangeBounds(next);
    setRange(next);
    onSelectionChange?.(next);
    if (b) setAnnouncement(interpolate(COPY.selectedRange, { rows: b.bottom - b.top + 1, columns: b.right - b.left + 1 }));
  };
  const rowRange = (fromRow: number, toRow: number): DataGridRangeRef | null => {
    const first = columns[0];
    const last = columns[columns.length - 1];
    const a = rows[fromRow];
    const b = rows[toRow];
    if (!first || !last || !a || !b) return null;
    return { from: { rowId: a.id, column: first.key }, to: { rowId: b.id, column: last.key } };
  };

  /* ---------- measurement: one rendered row, the scroll region, horizontal overflow ---------- */
  const [rowHeightPx, setRowHeightPx] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrolledX, setScrolledX] = useState(false);
  const [overflowX, setOverflowX] = useState(false);

  const virtualize = height !== 'content';
  const measured = rowHeightPx > 0 && viewportHeight > 0;
  const pageSize = measured ? Math.max(1, Math.floor(viewportHeight / rowHeightPx) - 1) : 1;
  let windowStart = 0;
  let windowEnd = loaded - 1;
  if (virtualize) {
    if (measured) {
      const first = Math.floor(scrollTop / rowHeightPx);
      windowStart = Math.max(0, Math.min(first, loaded) - pageSize);
      windowEnd = Math.min(loaded - 1, first + 2 * pageSize + 1);
    } else {
      windowEnd = Math.min(loaded, UNMEASURED_ROW_LIMIT) - 1;
    }
  }

  useLayoutEffect(() => {
    const region = scrollRef.current;
    if (!region) return undefined;
    const measure = (): void => {
      const viewport = region.clientHeight;
      setViewportHeight((prev) => (prev === viewport ? prev : viewport));
      const rowEl = region.querySelector<HTMLElement>('[data-part="body"] > [data-part="row"]');
      const rowHeight = rowEl ? rowEl.getBoundingClientRect().height : 0;
      if (rowHeight > 0) setRowHeightPx((prev) => (prev === rowHeight ? prev : rowHeight));
      const overflow = region.scrollWidth > region.clientWidth;
      setOverflowX((prev) => (prev === overflow ? prev : overflow));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    const rowEl = region.querySelector<HTMLElement>('[data-part="body"] > [data-part="row"]');
    if (rowEl) observer.observe(rowEl);
    return () => observer.disconnect();
  }, [density, windowStart, loaded === 0, height, colCount]);

  /* ---------- paging in (onRangeNeeded) ---------- */
  const requestedEndRef = useRef(-1);
  const checkRangeNeeded = (lastVisibleRow: number): void => {
    if (!onRangeNeeded || rowCount === undefined || rowCount <= loaded) return;
    if (lastVisibleRow < loaded - pageSize) return;
    const end = Math.min(rowCount - 1, loaded + pageSize - 1);
    if (requestedEndRef.current === end) return;
    requestedEndRef.current = end;
    onRangeNeeded(loaded, end);
  };

  const handleScroll = (): void => {
    const region = scrollRef.current;
    if (!region) return;
    setScrollTop((prev) => (prev === region.scrollTop ? prev : region.scrollTop));
    const x = region.scrollLeft !== 0;
    setScrolledX((prev) => (prev === x ? prev : x));
    if (measured) checkRangeNeeded(Math.floor((region.scrollTop + viewportHeight) / rowHeightPx));
  };

  /* ---------- active cell (aria-activedescendant) ---------- */
  const [active, setActive] = useState<Position>({ row: -1, col: 0 });
  const activeRow = Math.min(active.row, loaded - 1);
  const activeCol = Math.min(active.col, colCount - 1);
  const activeRendered = activeRow === -1 || (activeRow >= windowStart && activeRow <= windowEnd);
  const keyboardMoveRef = useRef(false);

  useLayoutEffect(() => {
    if (!keyboardMoveRef.current) return;
    keyboardMoveRef.current = false;
    const el = typeof document !== 'undefined' ? document.getElementById(cellId(activeRow, activeCol)) : null;
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });

  const focusGrid = (): void => gridRef.current?.focus();

  const moveTo = (row: number, col: number, extend = false): void => {
    const r = Math.max(-1, Math.min(row, loaded - 1));
    const c = Math.max(0, Math.min(col, colCount - 1));
    const extending = extend && selectable === 'range' && activeRow >= 0 && r >= 0 && anchorRef.current !== null;
    keyboardMoveRef.current = true;
    setActive({ row: r, col: c });
    setAnnouncement('');
    const region = scrollRef.current;
    if (region && virtualize && rowHeightPx > 0 && r >= 0) {
      const top = r * rowHeightPx;
      if (top < region.scrollTop) region.scrollTop = top;
      else if (top + rowHeightPx > region.scrollTop + viewportHeight - rowHeightPx) {
        region.scrollTop = top + 2 * rowHeightPx - viewportHeight;
      }
    }
    if (r >= 0) checkRangeNeeded(r);
    const column = dataColumnAt(c);
    const rowData = r >= 0 ? rows[r] : undefined;
    if (!column || !rowData) return;
    const ref: DataGridCellRef = { rowId: rowData.id, column: column.key };
    if (selectable === 'cell') onSelectionChange?.(ref);
    if (selectable === 'range') {
      if (extending) commitRange({ from: anchorRef.current!, to: ref });
      else {
        anchorRef.current = ref;
        if (range) commitRange({ from: ref, to: ref });
      }
    }
  };

  /* ---------- editing ---------- */
  const [editing, setEditingState] = useState<Editing | null>(null);
  const editingRef = useRef<Editing | null>(null);
  const setEditing = (next: Editing | null): void => {
    editingRef.current = next;
    setEditingState(next);
  };
  const editValueRef = useRef<unknown>(undefined);
  const pickerOpenRef = useRef(false);
  const [editError, setEditError] = useState<string | undefined>(undefined);

  const openEditor = (rowIndex: number, col: number, seed?: string): boolean => {
    const column = dataColumnAt(col);
    const row = rows[rowIndex];
    if (!editable || !column?.editable || !row) return false;
    if (onEditStart?.(row.id, column.key) === false) return false;
    const kind = column.editor ?? 'text';
    const seeded = seed !== undefined && (kind === 'text' || kind === 'number');
    editValueRef.current = seeded ? (kind === 'number' ? (Number.isFinite(Number(seed)) ? Number(seed) : undefined) : seed) : row[column.key];
    pickerOpenRef.current = false;
    setActive({ row: rowIndex, col });
    setEditing({ rowId: row.id, column: column.key, seed: seeded ? seed : undefined });
    setEditError(undefined);
    setAnnouncement(interpolate(COPY.editing, { column: column.header }));
    return true;
  };

  const closeEditor = (): void => {
    setEditing(null);
    setEditError(undefined);
    setAnnouncement('');
  };

  const cancelEdit = (): void => {
    closeEditor();
    focusGrid();
  };

  /** Validates and commits the open editor; false when validation kept it open. */
  const commitEdit = (): boolean => {
    const current = editingRef.current;
    if (!current) return true;
    const rowIndex = rowIndexById.get(current.rowId);
    const row = rowIndex !== undefined ? rows[rowIndex] : undefined;
    const column = columns.find((entry) => entry.key === current.column);
    if (!row || !column) {
      closeEditor();
      return true;
    }
    const value = editValueRef.current;
    const message = column.validate?.(value, row);
    if (message) {
      setEditError(message);
      setAnnouncement(interpolate(COPY.invalid, { message }));
      return false;
    }
    const previous = row[column.key];
    closeEditor();
    if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, toCellValue(value), toCellValue(previous));
    return true;
  };

  const editableCols = (): number[] =>
    columns.flatMap((column, i) => (column.editable ? [i + colOffset] : []));

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, column: DataGridColumn): void => {
    const kind = column.editor ?? 'text';
    event.stopPropagation();
    if (event.key === 'Escape') {
      if (pickerOpenRef.current) return;
      event.preventDefault();
      cancelEdit();
    } else if (event.key === 'Enter') {
      if (kind === 'select' || (kind === 'date' && pickerOpenRef.current)) return;
      event.preventDefault();
      if (commitEdit()) {
        focusGrid();
        moveTo(activeRow + 1, activeCol);
      }
    } else if (event.key === 'F2') {
      event.preventDefault();
      if (commitEdit()) focusGrid();
    } else if (event.key === 'Tab') {
      const row = activeRow;
      const cols = editableCols();
      const next = event.shiftKey ? [...cols].reverse().find((c) => c < activeCol) : cols.find((c) => c > activeCol);
      if (!commitEdit()) {
        event.preventDefault();
        return;
      }
      focusGrid();
      if (next !== undefined) {
        event.preventDefault();
        if (!openEditor(row, next)) setActive({ row, col: next });
      }
      // From the last (or first) editable cell the default Tab now leaves the grid.
    }
  };

  const handleEditorBlur = (event: ReactFocusEvent<HTMLDivElement>, cell: Editing): void => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null) || pickerOpenRef.current) return;
    const current = editingRef.current;
    if (!current || current.rowId !== cell.rowId || current.column !== cell.column) return;
    const kind = columns.find((column) => column.key === cell.column)?.editor ?? 'text';
    if (kind === 'text' || kind === 'number' || kind === 'date') commitEdit();
  };

  useEffect(() => {
    if (!editing) return;
    const target = editorRef.current?.querySelector<HTMLElement>('input, button, select, textarea, [tabindex]');
    target?.focus();
    if (target instanceof HTMLInputElement && editing.seed !== undefined) {
      try {
        target.setSelectionRange(target.value.length, target.value.length);
      } catch {
        // number inputs do not support selection ranges
      }
    }
  }, [editing]);

  /* ---------- keep controls inside cells out of the tab order (the grid is one tab stop) ---------- */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const el of grid.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) {
      if (el === grid || el.closest('[data-part="editor"]')) continue;
      if (el.tabIndex !== -1) el.tabIndex = -1;
    }
  });

  /* ---------- column resize ---------- */
  const pendingResizeRef = useRef<{ column: string; width: number } | null>(null);
  /** The floor for both resize paths: the column's own `minWidth`, never below size.target.min. */
  const minWidthOf = (column: DataGridColumn): number =>
    Math.max(column.minWidth ?? 0, targetSizerRef.current?.getBoundingClientRect().width ?? 0);
  /** Where a resize starts from: the set width, or the rendered width of a default-width column. */
  const currentWidth = (column: DataGridColumn, index: number): number => {
    const width = widthOf(column);
    if (width !== undefined) return width;
    const header = typeof document !== 'undefined' ? document.getElementById(cellId(-1, index + colOffset)) : null;
    return header ? header.getBoundingClientRect().width : 0;
  };
  const resizeTo = (column: DataGridColumn, width: number): number => {
    const next = Math.round(Math.max(minWidthOf(column), width));
    setResizedWidths((prev) => (prev[column.key] === next ? prev : { ...prev, [column.key]: next }));
    return next;
  };

  const startPointerResize = (event: ReactPointerEvent<HTMLDivElement>, column: DataGridColumn, index: number): void => {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = currentWidth(column, index);
    const rtl = typeof getComputedStyle === 'function' && getComputedStyle(handle).direction === 'rtl';
    let width = startWidth;
    handle.setPointerCapture?.(event.pointerId);
    const move = (e: PointerEvent): void => {
      width = resizeTo(column, startWidth + (rtl ? startX - e.clientX : e.clientX - startX));
    };
    const up = (e: PointerEvent): void => {
      handle.releasePointerCapture?.(e.pointerId);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
      onColumnResize?.(column.key, width);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };

  /* ---------- copy / clear ---------- */
  const copyRange = (): void => {
    if (!bounds) return;
    const span = columns.slice(bounds.left, bounds.right + 1);
    const lines: string[] = [];
    if (bounds.top === 0 && bounds.bottom === loaded - 1) lines.push(span.map((column) => column.header).join('\t'));
    for (let r = bounds.top; r <= bounds.bottom; r += 1) {
      const row = rows[r];
      if (row) lines.push(span.map((column) => textOf(row[column.key])).join('\t'));
    }
    const cells = (bounds.bottom - bounds.top + 1) * span.length;
    void navigator.clipboard
      ?.writeText(lines.join('\n'))
      .then(() => setAnnouncement(interpolate(pluralForm(COPY.copied, cells), { cells })))
      .catch(() => undefined);
  };

  const clearSelection = (): boolean => {
    const targets: [DataGridRow, DataGridColumn][] = [];
    if (selectable === 'row') {
      for (const row of rows) if (selectedSet.has(row.id)) for (const column of columns) if (column.editable) targets.push([row, column]);
    } else if (selectable === 'cell') {
      const row = rows[activeRow];
      const column = dataColumnAt(activeCol);
      if (row && column?.editable) targets.push([row, column]);
    } else if (selectable === 'range' && bounds) {
      for (let r = bounds.top; r <= bounds.bottom; r += 1) {
        for (let c = bounds.left; c <= bounds.right; c += 1) {
          const row = rows[r];
          const column = columns[c];
          if (row && column?.editable) targets.push([row, column]);
        }
      }
    }
    for (const [row, column] of targets) onCellChange?.(row.id, column.key, undefined, toCellValue(row[column.key]));
    return targets.length > 0;
  };

  /* ---------- keyboard model ---------- */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (editingRef.current) return;
    const grid = gridRef.current;
    if (!grid) return;
    if (event.target !== grid) {
      // Real focus is inside a cell's control (APG "focus inside the cell").
      if (event.key === 'Escape' || event.key === 'F2') {
        event.preventDefault();
        focusGrid();
        return;
      }
      if (event.key === 'Tab' && event.shiftKey) {
        focusGrid();
        return;
      }
      if (!NAVIGATION_KEYS.has(event.key)) return;
      focusGrid();
    }
    const row = activeRow;
    const col = activeCol;
    const column = dataColumnAt(col);
    const ctrl = event.ctrlKey || event.metaKey;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        if (event.shiftKey && row === -1 && column?.resizable) {
          const step = stepSizerRef.current?.getBoundingClientRect().width ?? 0;
          const rtl = getComputedStyle(grid).direction === 'rtl';
          const width = resizeTo(column, currentWidth(column, col - colOffset) + (rtl ? -delta : delta) * step);
          pendingResizeRef.current = { column: column.key, width };
          return;
        }
        moveTo(row, col + delta, event.shiftKey);
        return;
      }
      case 'ArrowDown':
        event.preventDefault();
        moveTo(row + 1, col, event.shiftKey);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(row - 1, col, event.shiftKey);
        return;
      case 'Home':
        event.preventDefault();
        moveTo(ctrl ? -1 : row, 0);
        return;
      case 'End':
        event.preventDefault();
        moveTo(ctrl ? loaded - 1 : row, colCount - 1);
        return;
      case 'PageDown':
        event.preventDefault();
        moveTo(row + pageSize, col);
        return;
      case 'PageUp':
        event.preventDefault();
        moveTo(row < 0 ? row : Math.max(0, row - pageSize), col);
        return;
      case 'Enter': {
        event.preventDefault();
        if (row === -1) {
          if (hasSelectColumn && col === 0) toggleAll();
          else if (column?.sortable) activateSort(column);
          return;
        }
        const rowData = rows[row];
        if (!rowData) return;
        if (hasSelectColumn && col === 0) {
          toggleRow(rowData.id);
          return;
        }
        if (openEditor(row, col)) return;
        const control = document.getElementById(cellId(row, col))?.querySelector<HTMLElement>(CONTROL_SELECTOR);
        if (control) {
          control.focus();
          control.click();
        }
        return;
      }
      case 'F2':
        event.preventDefault();
        if (row >= 0) openEditor(row, col);
        return;
      case 'Escape':
        if (selectable === 'range' && range) {
          event.preventDefault();
          setRange(null);
        }
        return;
      case ' ': {
        if (selectable !== 'row' && selectable !== 'range') break;
        event.preventDefault();
        const rowData = rows[row];
        if (!rowData) return;
        if (selectable === 'row') {
          if (event.shiftKey) extendRows(rowData.id);
          else toggleRow(rowData.id);
          return;
        }
        if (ctrl && column && rows[0]) {
          const last = rows[loaded - 1]!;
          anchorRef.current = { rowId: rows[0].id, column: column.key };
          commitRange({ from: anchorRef.current, to: { rowId: last.id, column: column.key } });
          return;
        }
        const anchorRow = event.shiftKey && rowAnchorRef.current !== null ? rowIndexById.get(rowAnchorRef.current) : undefined;
        if (anchorRow === undefined) rowAnchorRef.current = rowData.id;
        const next = rowRange(anchorRow ?? row, row);
        if (next) {
          anchorRef.current = next.from;
          commitRange(next);
        }
        return;
      }
      case 'Delete':
      case 'Backspace':
        if (editable && clearSelection()) event.preventDefault();
        return;
      default:
    }

    if (ctrl && event.code === 'KeyA' && (selectable === 'row' || selectable === 'range')) {
      event.preventDefault();
      if (selectable === 'row') commitRows(allIds);
      else {
        const all = rowRange(0, loaded - 1);
        if (all) {
          anchorRef.current = all.from;
          commitRange(all);
        }
      }
      return;
    }
    if (ctrl && event.code === 'KeyC' && selectable === 'range') {
      event.preventDefault();
      copyRange();
      return;
    }
    // Typing a printable character opens the editor with it as the value. Space is never an edit trigger.
    if (event.key.length === 1 && event.key !== ' ' && !ctrl && !event.altKey && row >= 0 && openEditor(row, col, event.key)) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Shift' || !pendingResizeRef.current) return;
    const { column, width } = pendingResizeRef.current;
    pendingResizeRef.current = null;
    onColumnResize?.(column, width);
  };

  /* ---------- pointer ---------- */
  const positionOf = (target: EventTarget | null): Position | null => {
    const cell = target instanceof Element ? target.closest<HTMLElement>('[role="gridcell"], [role="rowheader"], [role="columnheader"]') : null;
    if (!cell || !cell.id.startsWith(cellPrefix) || !gridRef.current?.contains(cell)) return null;
    const [r, c] = cell.id.slice(cellPrefix.length).split('_');
    return { row: r === 'h' ? -1 : Number(r), col: Number(c) };
  };
  const draggingRef = useRef(false);
  /** The cell the drag last extended to, so a move within one cell does not re-fire the selection. */
  const lastDragRef = useRef<DataGridCellRef | null>(null);

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as Element;
    if (target.closest('[data-part="editor"]') || target.closest(CONTROL_SELECTOR)) return;
    if (!positionOf(target)) return;
    event.preventDefault();
    focusGrid();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest('[data-part="editor"]')) return;
    const pos = positionOf(target);
    if (!pos) return;
    setActive(pos);
    setAnnouncement('');
    const column = dataColumnAt(pos.col);
    const row = pos.row >= 0 ? rows[pos.row] : undefined;
    if (!row || !column) return;
    const ref: DataGridCellRef = { rowId: row.id, column: column.key };
    const ctrl = event.ctrlKey || event.metaKey;
    if (selectable === 'cell') onSelectionChange?.(ref);
    else if (selectable === 'row') {
      if (event.shiftKey) extendRows(row.id);
      else if (ctrl) toggleRow(row.id);
    } else if (selectable === 'range') {
      if (!(event.shiftKey && anchorRef.current)) anchorRef.current = ref;
      commitRange({ from: anchorRef.current!, to: ref });
      draggingRef.current = true;
      lastDragRef.current = ref;
      gridRef.current?.setPointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current || !anchorRef.current || typeof document.elementFromPoint !== 'function') return;
    const pos = positionOf(document.elementFromPoint(event.clientX, event.clientY));
    const column = pos ? dataColumnAt(pos.col) : undefined;
    const row = pos && pos.row >= 0 ? rows[pos.row] : undefined;
    if (!pos || !row || !column) return;
    const last = lastDragRef.current;
    if (last && last.rowId === row.id && last.column === column.key) return;
    lastDragRef.current = { rowId: row.id, column: column.key };
    setActive(pos);
    commitRange({ from: anchorRef.current, to: { rowId: row.id, column: column.key } });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    gridRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const pos = positionOf(event.target);
    if (pos && pos.row >= 0 && !editingRef.current) openEditor(pos.row, pos.col);
  };

  /* ---------- overrides ---------- */
  const rootStyle: Record<string, string> = {};
  for (const [binding, hook] of Object.entries(OVERRIDE_HOOKS) as [DataGridOverridableBinding, string][]) {
    const token = overrides?.[binding];
    if (token) rootStyle[hook] = cssVar(token);
  }
  const headerTextOverrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {
    paddingInline: 'space.0',
    fontSize: overrides?.headerSize ?? 'font.size.sm',
    fontWeight: overrides?.headerWeight ?? 'font.weight.semibold',
  };

  /* ---------- render: editors ---------- */
  const renderEditor = (column: DataGridColumn, row: DataGridRow, cell: Editing): ReactElement => {
    const name = `${baseId}-editor`;
    const current = row[column.key];
    const setValue = (value: unknown): void => {
      editValueRef.current = value;
    };
    const commitOnChange = (value: unknown): void => {
      setValue(value);
      if (commitEdit()) focusGrid();
    };
    const zeroInset = { paddingInline: 'space.0', paddingBlock: 'space.0' } as const;
    switch (column.editor ?? 'text') {
      case 'number':
        return (
          <NumberInput
            label={column.header}
            hideLabel
            size="sm"
            name={name}
            defaultValue={cell.seed !== undefined ? (editValueRef.current as number | undefined) : typeof current === 'number' ? current : undefined}
            overrides={zeroInset}
            onChange={setValue}
          />
        );
      case 'select':
        return (
          <Select
            label={column.header}
            hideLabel
            size="sm"
            name={name}
            options={column.options ?? []}
            defaultValue={textOf(current)}
            container={container}
            overrides={{ triggerPaddingInline: 'space.0', triggerPaddingBlock: 'space.0' }}
            onOpenChange={(open) => {
              pickerOpenRef.current = open;
            }}
            onChange={(value) => commitOnChange(Array.isArray(value) ? value[0] : value)}
          />
        );
      case 'date':
        return (
          <DatePicker
            label={column.header}
            hideLabel
            size="sm"
            name={name}
            defaultValue={typeof current === 'string' ? (current as DatePickerValue) : undefined}
            container={container}
            overrides={zeroInset}
            onOpenChange={(open) => {
              pickerOpenRef.current = open;
            }}
            onChange={(value) => setValue(typeof value === 'string' ? value : undefined)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox label={column.header} hideLabel name={name} checked={Boolean(current)} onChange={commitOnChange} />
        );
      default:
        return (
          <Input
            label={column.header}
            hideLabel
            size="sm"
            name={name}
            defaultValue={cell.seed ?? textOf(current)}
            overrides={zeroInset}
            onChange={setValue}
          />
        );
    }
  };

  /* ---------- render: header ---------- */
  const headerCell = (column: DataGridColumn, index: number): ReactElement => {
    const col = index + colOffset;
    const sorted = activeSort?.column === column.key ? activeSort.direction : undefined;
    const next = sorted === 'ascending' ? 'descending' : 'ascending';
    const width = widthOf(column);
    return (
      <div
        key={column.key}
        id={cellId(-1, col)}
        role="columnheader"
        aria-colindex={col + 1}
        aria-sort={column.sortable ? sorted : undefined}
        tabIndex={-1}
        data-part="columnHeader"
        className={joinClasses(
          'ds-data-grid__cell',
          'ds-data-grid__cell--header',
          column.align && column.align !== 'start' && `ds-data-grid__cell--align-${column.align}`,
          column.pinned && 'ds-data-grid__cell--pinned',
          activeRow === -1 && activeCol === col && 'ds-data-grid__cell--active',
        )}
        style={pinnedStyle(column, index)}
      >
        {column.sortable ? (
          <span className="ds-data-grid__sort" data-part="sortButton" onClick={() => activateSort(column)}>
            <Button
              variant="ghost"
              size="sm"
              label={column.header}
              accessibleName={interpolate(next === 'ascending' ? COPY.sortAscending : COPY.sortDescending, { column: column.header })}
              trailingIcon={sorted ? <Icon name={sorted === 'ascending' ? 'chevron-up' : 'chevron-down'} inline /> : undefined}
              overrides={headerTextOverrides}
              tabIndex={-1}
            />
          </span>
        ) : column.abbr ? (
          <>
            <span aria-hidden="true">{column.header}</span>
            <span className="ds-data-grid__visually-hidden">{column.abbr}</span>
          </>
        ) : (
          column.header
        )}
        {column.resizable ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={width}
            aria-valuemin={column.minWidth}
            aria-label={interpolate(COPY.resize, { column: column.header })}
            data-part="resizeHandle"
            className="ds-data-grid__resize-handle"
            onPointerDown={(event) => startPointerResize(event, column, index)}
          />
        ) : null}
      </div>
    );
  };

  /* ---------- render: body ---------- */
  const bodyCell = (row: DataGridRow, rowIndex: number, column: DataGridColumn, index: number): ReactElement => {
    const col = index + colOffset;
    const isEditing = editing?.rowId === row.id && editing.column === column.key;
    const inRange = bounds !== null && rowIndex >= bounds.top && rowIndex <= bounds.bottom && index >= bounds.left && index <= bounds.right;
    const cellSelected =
      selectable === 'cell' ? activeRow === rowIndex && activeCol === col : selectable === 'range' ? inRange : undefined;
    return (
      <div
        key={column.key}
        id={cellId(rowIndex, col)}
        role={column.isRowHeader ? 'rowheader' : 'gridcell'}
        aria-colindex={col + 1}
        aria-selected={cellSelected}
        aria-readonly={editable && !column.editable ? true : undefined}
        aria-describedby={isEditing && editError ? statusId : undefined}
        tabIndex={-1}
        data-part={column.isRowHeader ? 'rowHeader' : 'cell'}
        className={joinClasses(
          'ds-data-grid__cell',
          column.align && column.align !== 'start' && `ds-data-grid__cell--align-${column.align}`,
          column.pinned && 'ds-data-grid__cell--pinned',
          activeRow === rowIndex && activeCol === col && 'ds-data-grid__cell--active',
          isEditing && 'ds-data-grid__cell--editing',
          isEditing && editError && 'ds-data-grid__cell--invalid',
        )}
        style={pinnedStyle(column, index)}
      >
        {isEditing && editing ? (
          <div
            ref={editorRef}
            className="ds-data-grid__editor"
            data-part="editor"
            onKeyDown={(event) => handleEditorKeyDown(event, column)}
            onBlur={(event) => handleEditorBlur(event, editing)}
          >
            {renderEditor(column, row, editing)}
          </div>
        ) : (
          <span className="ds-data-grid__cell-content" data-part="cellContent">
            {column.render ? column.render(row) : textOf(row[column.key])}
          </span>
        )}
      </div>
    );
  };

  const bodyRow = (row: DataGridRow, rowIndex: number): ReactElement => {
    const isSelected = selectedSet.has(row.id);
    const name = rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;
    const style: CSSProperties = { gridTemplateColumns };
    if (virtualize) style.transform = `translateY(calc(${rowIndex} * ${ROW_SIZE}))`;
    return (
      <div
        key={row.id}
        role="row"
        aria-rowindex={rowIndex + 2}
        aria-selected={hasSelectColumn ? isSelected : undefined}
        data-part="row"
        className="ds-data-grid__row"
        style={style}
      >
        {hasSelectColumn ? (
          <div
            id={cellId(rowIndex, 0)}
            role="gridcell"
            aria-colindex={1}
            tabIndex={-1}
            data-part="selectCell"
            className={joinClasses(
              'ds-data-grid__cell',
              'ds-data-grid__cell--select',
              'ds-data-grid__cell--pinned',
              activeRow === rowIndex && activeCol === 0 && 'ds-data-grid__cell--active',
            )}
            style={{ insetInlineStart: 0 }}
            onClick={(event) => {
              if (!(event.target as Element).closest('[data-ds="Checkbox"]')) toggleRow(row.id);
            }}
          >
            <Checkbox
              label={interpolate(COPY.selectRow, { rowName: name })}
              hideLabel
              name={`${baseId}-select`}
              value={row.id}
              checked={isSelected}
              tabIndex={-1}
              onChange={() => toggleRow(row.id)}
            />
          </div>
        ) : null}
        {columns.map((column, index) => bodyCell(row, rowIndex, column, index))}
      </div>
    );
  };

  const visibleRows: ReactElement[] = [];
  for (let i = Math.max(0, windowStart); i <= windowEnd; i += 1) {
    const row = rows[i];
    if (row) visibleRows.push(bodyRow(row, i));
  }

  /* ---------- range overlay (clipped to the rendered window) ---------- */
  let overlay: ReactElement | null = null;
  if (bounds) {
    const top = Math.max(bounds.top, windowStart);
    const bottom = Math.min(bounds.bottom, windowEnd);
    if (top <= bottom) {
      const rect: CSSProperties = {
        insetBlockStart: `calc(${top} * ${ROW_SIZE})`,
        blockSize: `calc(${bottom - top + 1} * ${ROW_SIZE})`,
        insetInlineStart: widthSpan(0, bounds.left),
        inlineSize: widthSpan(bounds.left, bounds.right + 1),
      };
      overlay = (
        <div aria-hidden="true" className="ds-data-grid__range-overlay" data-part="rangeOverlay">
          <div className="ds-data-grid__range-fill" style={rect} />
          <div className="ds-data-grid__range-border" style={rect} />
        </div>
      );
    }
  }

  /* ---------- status bar ---------- */
  const summary = [interpolate(pluralForm(COPY.rowCount, total), { count: total })];
  if (selectable === 'row' && selectedIds.length > 0) {
    summary.push(interpolate(COPY.selectedRows, { count: selectedIds.length, total }));
  }
  if (bounds) {
    summary.push(interpolate(COPY.selectedRange, { rows: bounds.bottom - bounds.top + 1, columns: bounds.right - bounds.left + 1 }));
  }
  const liveText = loading ? COPY.loading : editError ? interpolate(COPY.invalid, { message: editError }) : announcement;
  const activeColumn = dataColumnAt(activeCol);
  const position = activeRow >= 0 && activeColumn ? interpolate(COPY.position, { row: activeRow + 1, column: activeColumn.header }) : '';
  const statusTextOverrides = overrides?.statusBarSize ? { fontSize: overrides.statusBarSize } : undefined;

  const empty = loaded === 0 && !loading;

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="DataGrid"
      data-part="container"
      className={joinClasses(
        'ds-data-grid',
        `ds-data-grid--density-${density}`,
        `ds-data-grid--height-${height}`,
        virtualize && 'ds-data-grid--virtual',
        (stickyHeader || virtualize) && 'ds-data-grid--sticky-header',
        scrollTop > 0 && 'ds-data-grid--scrolled-y',
        scrolledX && 'ds-data-grid--scrolled-x',
        loading && 'ds-data-grid--loading',
      )}
      style={rootStyle as CSSProperties}
    >
      <span ref={stepSizerRef} aria-hidden="true" className="ds-data-grid__sizer ds-data-grid__sizer--step" />
      <span ref={targetSizerRef} aria-hidden="true" className="ds-data-grid__sizer ds-data-grid__sizer--target" />
      <div data-part="caption" className={hideCaption ? 'ds-data-grid__visually-hidden' : 'ds-data-grid__caption'}>
        <Heading
          id={captionId}
          level={captionLevel}
          size="md"
          overrides={{
            marginBlockEnd: 'space.0',
            fontSize: overrides?.captionSize ?? 'font.size.md',
            fontWeight: overrides?.captionWeight ?? 'font.weight.semibold',
          }}
        >
          {caption}
        </Heading>
      </div>
      <div ref={scrollRef} data-part="scrollRegion" className="ds-data-grid__scroll-region" onScroll={handleScroll}>
        <div
          ref={gridRef}
          role="grid"
          data-part="grid"
          className="ds-data-grid__grid"
          tabIndex={0}
          aria-labelledby={captionId}
          aria-describedby={showStatusBar ? statusId : undefined}
          aria-rowcount={total + 1}
          aria-colcount={colCount}
          aria-multiselectable={selectable === 'row' || selectable === 'range' ? true : undefined}
          aria-readonly={!editable}
          aria-busy={loading ? true : undefined}
          aria-activedescendant={activeRendered && colCount > 0 ? cellId(activeRow, activeCol) : undefined}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onMouseDown={handleMouseDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={handleDoubleClick}
        >
          <div role="rowgroup" data-part="header" className="ds-data-grid__header">
            <div role="row" aria-rowindex={1} data-part="headerRow" className="ds-data-grid__row" style={{ gridTemplateColumns }}>
              {hasSelectColumn ? (
                <div
                  id={cellId(-1, 0)}
                  role="columnheader"
                  aria-colindex={1}
                  tabIndex={-1}
                  data-part="selectAllCell"
                  className={joinClasses(
                    'ds-data-grid__cell',
                    'ds-data-grid__cell--header',
                    'ds-data-grid__cell--select',
                    'ds-data-grid__cell--pinned',
                    activeRow === -1 && activeCol === 0 && 'ds-data-grid__cell--active',
                  )}
                  style={{ insetInlineStart: 0 }}
                  onClick={(event) => {
                    if (!(event.target as Element).closest('[data-ds="Checkbox"]')) toggleAll();
                  }}
                >
                  <Checkbox
                    label={COPY.selectAll}
                    hideLabel
                    name={`${baseId}-select-all`}
                    checked={allSelected}
                    indeterminate={someSelected}
                    tabIndex={-1}
                    onChange={toggleAll}
                  />
                </div>
              ) : null}
              {columns.map(headerCell)}
            </div>
          </div>
          <div
            role="rowgroup"
            data-part="body"
            className="ds-data-grid__body"
            style={virtualize ? { blockSize: `calc(${empty ? 0 : total} * ${ROW_SIZE})` } : undefined}
          >
            {overlay}
            {empty ? (
              <div role="row" aria-rowindex={2} className="ds-data-grid__empty-row">
                <div role="gridcell" aria-colindex={1} className="ds-data-grid__empty" style={{ gridColumn: '1 / -1' }}>
                  <Text element="p" tone="muted" data-part="emptyState">
                    {emptyMessage ?? COPY.empty}
                  </Text>
                </div>
              </div>
            ) : (
              visibleRows
            )}
          </div>
        </div>
      </div>
      <div
        data-part="statusBar"
        className={showStatusBar ? 'ds-data-grid__status-bar' : 'ds-data-grid__visually-hidden'}
      >
        <span className="ds-data-grid__status-group">
          {showStatusBar
            ? summary.map((text) => (
                <Text key={text} element="span" size="xs" tone="muted" overrides={statusTextOverrides}>
                  {text}
                </Text>
              ))
            : null}
          <Text id={statusId} element="span" size="xs" tone="muted" role="status" aria-live="polite" overrides={statusTextOverrides}>
            {liveText}
          </Text>
        </span>
        {showStatusBar ? (
          <span className="ds-data-grid__status-group">
            {overflowX && !scrolledX ? (
              <Text element="span" size="xs" tone="muted" overrides={statusTextOverrides}>
                {COPY.scrollHint}
              </Text>
            ) : null}
            {position ? (
              <Text element="span" size="xs" tone="muted" overrides={statusTextOverrides}>
                {position}
              </Text>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
