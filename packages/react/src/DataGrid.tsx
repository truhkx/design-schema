import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { FormContext } from './FormContext';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text } from './Text';
import './DataGrid.css';

export type DataGridCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;
export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/** A data row. `id` must be stable. */
export type DataGridRow = { id: string; [key: string]: unknown };

/** Sort state: the column key and its direction. */
export type DataGridSortState = { column: string; direction: DataGridSortDirection };

/** One choice of a `select` editor. */
export type DataGridColumnOption = { value: string; label: string };

/** A committed cell value, as the column editor produces it; undefined when cleared. */
export type DataGridCellValue = string | number | boolean | undefined;

/** One column definition, in display order. */
export type DataGridColumn = {
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
};

/** One cell: its row id and column key. */
export type DataGridCellRef = { rowId: string; column: string };

/** A rectangle from the anchor cell to the focus cell. */
export type DataGridRangeRef = { from: DataGridCellRef; to: DataGridCellRef };

/** Row ids, one cell, or a range, matching `selectable`. */
export type DataGridSelection = string[] | DataGridCellRef | DataGridRangeRef;

/** copy.* — used verbatim. */
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

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

type DataGridOverrides = Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>;

/**
 * Root CSS hooks. captionSize/captionWeight (Heading) and statusBarSize (the status Texts) are
 * forwarded to the composed children's overrides instead and declare no hook; headerWeight and
 * headerSize are forwarded to the sort Button and also style the plain header text, so they keep one.
 */
const OVERRIDE_HOOK: Partial<Record<DataGridOverridableBinding, string>> = {
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
  statusBarPadding: '--ds-data-grid-status-bar-padding',
  statusBarGap: '--ds-data-grid-status-bar-gap',
  captionGap: '--ds-data-grid-caption-gap',
  fixedHeight: '--ds-data-grid-fixed-height',
  fontFamily: '--ds-data-grid-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-data-grid-font-size',
  lineHeight: '--ds-data-grid-line-height',
  numericFont: '--ds-data-grid-numeric-font', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-data-grid-transition',
};

function overridesToStyle(overrides: DataGridOverrides | undefined): Record<string, string> {
  const style: Record<string, string> = {};
  if (!overrides) return style;
  for (const binding of Object.keys(overrides) as DataGridOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style;
}

declare const process: { env: { NODE_ENV?: string | undefined } };
const warned = new Set<string>();
function warnOnce(message: string): void {
  if (process.env.NODE_ENV !== 'production' && !warned.has(message)) {
    warned.add(message);
    console.warn(message);
  }
}

/** Until a row has been measured (and always in jsdom) at most this many rows render. */
const MAX_UNMEASURED_ROWS = 50; // literal-ok: render cap from the rowHeight binding description

/** What Enter reaches and what is demoted to tabindex=-1 inside a cell. */
const CONTROL_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

/** localeCompare (numeric) for strings, subtraction for numbers; missing values sort last. */
function compareValues(a: unknown, b: unknown): number {
  if (a === undefined || a === null) return b === undefined || b === null ? 0 : 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function textOf(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function joinClasses(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

function subscribeNothing(): () => void {
  return () => undefined;
}
function readPageLocale(): string {
  return document.documentElement.lang;
}
function serverPageLocale(): string {
  return '';
}

/** A press on a part wrapper that misses its composed control runs the control's own action. */
function forwardPress(event: ReactMouseEvent<HTMLElement>, selector: string): void {
  const control = event.currentTarget.querySelector<HTMLElement>(selector);
  const target = event.target as Element;
  if (!control || control.contains(target) || target.closest('label')) return;
  control.click();
}

type CellPos = { row: number; col: number };
type RangeState = { anchor: CellPos; focus: CellPos };
type EditingState = { rowId: string; column: string; initial: string | undefined; session: number };

export interface DataGridProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style' | 'onSelect'> {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. Required: a grid built without one falls back to an empty caption and warns in development. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is captionSize regardless, as Table. */
  captionLevel?: DataGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Table's column model plus grid concerns: pixel `width`, `minWidth`, `resizable`, `pinned`, `editable` with an `editor` kind and `validate`. Exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount; `onRangeNeeded` asks for more. */
  rowCount?: number | undefined;
  /** Controlled sort state; as Table. */
  sort?: DataGridSortState | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set and the sort is uncontrolled. */
  defaultSort?: DataGridSortState | undefined;
  /** `row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects the focused cell; `range` allows Shift+arrow / pointer-drag rectangles (copy as TSV). */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). Left undefined, the grid keeps the selection itself. */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited with Enter, F2, typing, or double-click. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the grid's own scroll region scrolls. Accepted for parity; every virtualized height keeps it sticky. */
  stickyHeader?: boolean | undefined;
  /** `viewport` fills the viewport less 2 × layout.gap.section; `content` grows with rows (no virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay, their text in cellMutedColor. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for the composed Select and DatePicker editors. Defaults to document.body. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: DataGridOverrides | undefined;
  /** As Table. */
  onSortChange?: ((column: string, direction: DataGridSortDirection) => void) | undefined;
  /** Fired with the selection: row ids, one cell, or a range. Fired only when the selection actually changes. */
  onSelectionChange?: ((selection: DataGridSelection) => void) | undefined;
  /** Fired when an edit commits, only when the committed value differs from the cell's (Object.is). The caller updates `data`. */
  onCellChange?:
    | ((rowId: string, column: string, value: DataGridCellValue, previous: DataGridCellValue) => void)
    | undefined;
  /** Fired when an editor opens; return false to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired when the visible window comes within one page of the end of `data` and `rowCount` says there is more. */
  onRangeNeeded?: ((start: number, end: number) => void) | undefined;
  /** Fired when the user finishes dragging a resizable column edge, or on keyup of Shift after Shift+ArrowLeft/Right resizing. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
}

/**
 * DataGrid — Design Schema, category: data.
 *
 * When to use:
 * Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and mark the columns that may change; give every editable column a `validate`. Use `height: viewport` (the default) so the grid, not the page, scrolls.
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
  const id = useId();
  const captionId = `${id}-caption`;
  const liveId = `${id}-live`;
  const cellId = (pos: CellPos): string => `${id}-r${pos.row}-c${pos.col}`;

  const regionRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const stepProbeRef = useRef<HTMLSpanElement | null>(null);
  const minProbeRef = useRef<HTMLSpanElement | null>(null);

  /* Development-time column rules (never thrown). */
  if (!caption) warnOnce('DataGrid: `caption` is required; it is the grid\'s accessible name.');
  const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
  if (rowHeaderCount !== 1) warnOnce('DataGrid: exactly one column must set `isRowHeader`.');
  {
    const startPins = columns.map((c, i) => (c.pinned === 'start' ? i : -1)).filter((i) => i >= 0);
    const endPins = columns.map((c, i) => (c.pinned === 'end' ? i : -1)).filter((i) => i >= 0);
    const startOk = startPins.every((index, n) => index === n);
    const endOk = endPins.every((index, n) => index === columns.length - endPins.length + n);
    if (!startOk || !endOk) warnOnce('DataGrid: pinned columns must be contiguous at the start or end of `columns`.');
  }
  const rowHeaderColumn = columns.find((column) => column.isRowHeader);

  /* Display columns: the selection column (row mode) is always first and pinned start. */
  const hasSelectColumn = selectable === 'row';
  const selectOffset = hasSelectColumn ? 1 : 0;
  const colCount = columns.length + selectOffset;
  const colAt = (col: number): DataGridColumn | undefined => columns[col - selectOffset];

  /* Sort — controlled by `sort`, uncontrolled from `defaultSort`. */
  const [internalSort, setInternalSort] = useState<DataGridSortState | undefined>(defaultSort);
  const sortControlled = sort !== undefined;
  const activeSort = sortControlled ? sort : internalSort;
  const rows = useMemo(() => {
    if (sortControlled || rowCount !== undefined || !activeSort) return data;
    const factor = activeSort.direction === 'ascending' ? 1 : -1;
    return [...data].sort((a, b) => compareValues(a[activeSort.column], b[activeSort.column]) * factor);
  }, [data, sortControlled, rowCount, activeSort]);
  const lastRow = rows.length - 1;
  const totalRows = rowCount ?? data.length;

  const [announcement, setAnnouncement] = useState('');

  const activateSort = (column: DataGridColumn): void => {
    const direction: DataGridSortDirection =
      activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (!sortControlled) setInternalSort({ column: column.key, direction });
    onSortChange?.(column.key, direction);
    setAnnouncement(fill(COPY.sortedAnnouncement, { column: column.header, direction }));
  };

  /* Focus: the active cell (row -1 is the header row). */
  const [active, setActive] = useState<CellPos>({ row: -1, col: 0 });
  const scrollPendingRef = useRef(false);

  /* Row selection — controlled by `selected`, else kept locally. */
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = new Set(selectedIds);
  const rowAnchorRef = useRef<number | null>(null);

  const selectedRowsText = (count: number): string => fill(COPY.selectedRows, { count, total: totalRows });

  const commitRows = (next: string[]): void => {
    const same = next.length === selectedIds.length && next.every((rowId) => selectedSet.has(rowId));
    if (same) return;
    if (selected === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
    setAnnouncement(selectedRowsText(next.length));
  };
  const toggleRow = (rowIndex: number): void => {
    const row = rows[rowIndex];
    if (!row) return;
    rowAnchorRef.current = rowIndex;
    commitRows(selectedSet.has(row.id) ? selectedIds.filter((x) => x !== row.id) : [...selectedIds, row.id]);
  };
  const addRowsThrough = (rowIndex: number): void => {
    const anchor = rowAnchorRef.current ?? rowIndex;
    const from = Math.min(anchor, rowIndex);
    const to = Math.max(anchor, rowIndex);
    const next = [...selectedIds];
    for (let i = from; i <= to; i += 1) {
      const row = rows[i];
      if (row && !selectedSet.has(row.id)) next.push(row.id);
    }
    commitRows(next);
  };
  const allSelected = rows.length > 0 && rows.every((row) => selectedSet.has(row.id));
  const someSelected = !allSelected && rows.some((row) => selectedSet.has(row.id));
  const toggleAll = (): void => commitRows(allSelected ? [] : rows.map((row) => row.id));

  /* Cell selection — the focused body data cell is the selection. */
  const lastCellRef = useRef<string | null>(null);
  const selectCell = (pos: CellPos): void => {
    const row = rows[pos.row];
    const column = colAt(pos.col);
    if (pos.row < 0 || !row || !column) return;
    const key = `${row.id}\u0000${column.key}`;
    if (lastCellRef.current === key) return;
    lastCellRef.current = key;
    onSelectionChange?.({ rowId: row.id, column: column.key });
  };

  /* Range selection — anchor and focus in body coordinates (no selection column in range mode). */
  const [range, setRange] = useState<RangeState | null>(null);
  const rangeAnchorRef = useRef<CellPos | null>(null);
  const lastRangeRef = useRef<string | null>(null);
  const rangeRef = (pos: CellPos): DataGridCellRef | null => {
    const row = rows[pos.row];
    const column = colAt(pos.col);
    return row && column ? { rowId: row.id, column: column.key } : null;
  };
  const emitRange = (next: RangeState): void => {
    setRange(next);
    const from = rangeRef(next.anchor);
    const to = rangeRef(next.focus);
    if (!from || !to) return;
    const key = `${from.rowId}\u0000${from.column}\u0000${to.rowId}\u0000${to.column}`;
    if (lastRangeRef.current === key) return;
    lastRangeRef.current = key;
    onSelectionChange?.({ from, to });
    setAnnouncement(
      fill(COPY.selectedRange, {
        rows: Math.abs(next.focus.row - next.anchor.row) + 1,
        columns: Math.abs(next.focus.col - next.anchor.col) + 1,
      }),
    );
  };
  const clearRange = (): void => {
    setRange(null);
    lastRangeRef.current = null;
  };

  /* Measurements, corrected after mount (the server renders the unmeasured window). */
  const [rowPx, setRowPx] = useState(0);
  const [regionPx, setRegionPx] = useState(0);
  const [minTargetPx, setMinTargetPx] = useState(0);
  const [firstIndex, setFirstIndex] = useState(0);
  const [scrolledX, setScrolledX] = useState(false);
  const [scrolledY, setScrolledY] = useState(false);
  const [everScrolledX, setEverScrolledX] = useState(false);
  const [overflowX, setOverflowX] = useState(false);
  const rowsPerPage = rowPx > 0 && regionPx > 0 ? Math.max(1, Math.floor(regionPx / rowPx) - 1) : 1;

  /* Paging requests: once per `end` until `data` grows. */
  const requestedEndRef = useRef<number | null>(null);
  useEffect(() => {
    requestedEndRef.current = null;
  }, [data.length]);
  const requestMore = (lastVisible: number): void => {
    if (rowCount === undefined || data.length >= rowCount) return;
    if (lastVisible < data.length - 1 - rowsPerPage) return;
    const end = Math.min(rowCount - 1, data.length + rowsPerPage - 1);
    if (requestedEndRef.current === end) return;
    requestedEndRef.current = end;
    onRangeNeeded?.(data.length, end);
  };

  /* Column widths: explicit, resized, or the columnWidth binding. */
  const [widths, setWidths] = useState<Record<string, number>>({});
  const pixelWidth = (column: DataGridColumn): number | undefined => widths[column.key] ?? column.width;
  const colVar = (col: number): string => `var(--ds-data-grid-col-${col})`;
  const sumVars = (from: number, to: number): string => {
    const parts: string[] = [];
    for (let c = from; c < to; c += 1) parts.push(colVar(c));
    return parts.length ? `calc(${parts.join(' + ')})` : '0';
  };
  const gridStyle: Record<string, string> = {};
  if (hasSelectColumn) {
    gridStyle['--ds-data-grid-col-0'] =
      'calc(var(--ds-data-grid-select-column-width) + 2 * var(--ds-data-grid-cell-padding-inline))';
  }
  columns.forEach((column, index) => {
    const px = pixelWidth(column);
    gridStyle[`--ds-data-grid-col-${index + selectOffset}`] =
      px !== undefined ? `${px}px` : 'var(--ds-data-grid-column-width-computed)';
  });
  const pinStyle = (col: number): CSSProperties | undefined => {
    if (hasSelectColumn && col === 0) return { insetInlineStart: '0' };
    const column = colAt(col);
    if (column?.pinned === 'start') return { insetInlineStart: sumVars(0, col) };
    if (column?.pinned === 'end') return { insetInlineEnd: sumVars(col + 1, colCount) };
    return undefined;
  };
  const lastStartPin = (() => {
    let last = hasSelectColumn ? 0 : -1;
    columns.forEach((column, index) => {
      if (column.pinned === 'start') last = index + selectOffset;
    });
    return last;
  })();
  const firstEndPin = columns.findIndex((column) => column.pinned === 'end');

  /* A length binding in pixels, measured from a hidden zero-height probe so an override still moves it. */
  const probePx = (probe: HTMLSpanElement | null): number => (probe ? probe.getBoundingClientRect().width : 0);
  const floorFor = (column: DataGridColumn): number => Math.max(column.minWidth ?? 0, probePx(minProbeRef.current));

  /* The visible window. `content` renders every row; the others virtualize. */
  const virtualized = height !== 'content';
  let windowFirst = 0;
  let windowLast = lastRow;
  if (virtualized) {
    if (rowPx > 0 && regionPx > 0) {
      const visible = Math.ceil(regionPx / rowPx);
      windowFirst = Math.max(0, firstIndex - rowsPerPage);
      windowLast = Math.min(lastRow, firstIndex + visible + rowsPerPage);
    } else {
      windowFirst = Math.min(Math.max(0, firstIndex), Math.max(0, lastRow));
      windowLast = Math.min(lastRow, windowFirst + MAX_UNMEASURED_ROWS - 1);
    }
  }

  /* Editing. */
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [editError, setEditError] = useState<string | undefined>(undefined);
  const draftRef = useRef<DataGridCellValue>(undefined);
  const editorClosedRef = useRef(true);
  const sessionRef = useRef(0);
  const unmountedRef = useRef(false);
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);
  const editingRowIndex = editing ? rows.findIndex((row) => row.id === editing.rowId) : -1;
  const editingColIndex = editing ? columns.findIndex((column) => column.key === editing.column) + selectOffset : -1;

  /* An open editor whose row leaves `data` drops its draft silently. */
  useEffect(() => {
    if (editing && editingRowIndex < 0) {
      editorClosedRef.current = true;
      setEditing(null);
      setEditError(undefined);
    }
  }, [editing, editingRowIndex]);

  const editorKind = (column: DataGridColumn, row: DataGridRow): DataGridEditorKind =>
    column.editor ?? (typeof row[column.key] === 'number' ? 'number' : 'text');

  const canEdit = (pos: CellPos): boolean => {
    const column = colAt(pos.col);
    return editable && pos.row >= 0 && Boolean(rows[pos.row]) && Boolean(column?.editable);
  };

  const openEditor = (pos: CellPos, initial?: string): boolean => {
    const row = rows[pos.row];
    const column = colAt(pos.col);
    if (!row || !column || !canEdit(pos)) return false;
    if (onEditStart?.(row.id, column.key) === false) return false;
    sessionRef.current += 1;
    editorClosedRef.current = false;
    const kind = editorKind(column, row);
    const current = row[column.key];
    if (initial !== undefined && kind === 'text') draftRef.current = initial;
    else if (initial !== undefined && kind === 'number') {
      const typed = Number(initial);
      draftRef.current = Number.isFinite(typed) ? typed : undefined;
    } else draftRef.current = current as DataGridCellValue;
    setActive(pos);
    setEditError(undefined);
    setEditing({ rowId: row.id, column: column.key, initial, session: sessionRef.current });
    setAnnouncement(fill(COPY.editing, { column: column.header }));
    return true;
  };

  const focusGrid = (): void => gridRef.current?.focus({ preventScroll: true });

  const closeEditor = (refocus: boolean): void => {
    editorClosedRef.current = true;
    setEditing(null);
    setEditError(undefined);
    if (refocus) focusGrid();
  };

  const cancelEdit = (refocus = true): void => {
    if (editorClosedRef.current) return;
    closeEditor(refocus);
  };

  /** Validate and commit the draft; false (editor stays open) when `validate` rejects it. */
  const commitEdit = (value: DataGridCellValue, refocus: boolean): boolean => {
    if (!editing || editorClosedRef.current) return false;
    const row = rows.find((r) => r.id === editing.rowId);
    const column = columns.find((c) => c.key === editing.column);
    if (!row || !column) {
      closeEditor(refocus);
      return true;
    }
    const message = column.validate?.(value, row);
    if (message) {
      setEditError(message);
      setAnnouncement(fill(COPY.invalid, { message }));
      return false;
    }
    const previous = row[column.key] as DataGridCellValue;
    closeEditor(refocus);
    if (!Object.is(value, previous)) onCellChange?.(row.id, column.key, value, previous);
    return true;
  };

  const editableColsInRow = (): number[] => {
    const list: number[] = [];
    columns.forEach((column, index) => {
      if (column.editable) list.push(index + selectOffset);
    });
    return list;
  };

  const onEditorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();
    const wrapper = event.currentTarget;
    // Keys raised inside a portaled popup (the Select listbox, the DatePicker calendar) belong to it.
    if (!(event.target instanceof Node) || !wrapper.contains(event.target)) return;
    if (!editing) return;
    const column = columns.find((c) => c.key === editing.column);
    const row = rows.find((r) => r.id === editing.rowId);
    if (!column || !row) return;
    const kind = editorKind(column, row);
    const pos: CellPos = { row: editingRowIndex, col: editingColIndex };
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
      return;
    }
    if (event.key === 'F2') {
      event.preventDefault();
      commitEdit(draftRef.current, true);
      return;
    }
    if (event.key === 'Enter' && (kind === 'text' || kind === 'number' || kind === 'date')) {
      event.preventDefault();
      if (commitEdit(draftRef.current, true)) {
        const next = { row: Math.min(pos.row + 1, lastRow), col: pos.col };
        setActive(next);
        scrollPendingRef.current = true;
      }
      return;
    }
    if (event.key === 'Tab') {
      const list = editableColsInRow();
      const at = list.indexOf(pos.col);
      const target = list[event.shiftKey ? at - 1 : at + 1];
      let ok = false;
      flushSync(() => {
        ok = commitEdit(draftRef.current, true);
      });
      if (!ok) {
        event.preventDefault();
        return;
      }
      if (target !== undefined) {
        event.preventDefault();
        const nextPos = { row: pos.row, col: target };
        if (!openEditor(nextPos)) setActive(nextPos);
        scrollPendingRef.current = true;
      }
      // From the last editable cell the editor is already gone and the grid focused, so the browser's own Tab leaves.
    }
  };

  const onEditorBlur = (event: ReactFocusEvent<HTMLDivElement>): void => {
    if (unmountedRef.current || editorClosedRef.current || !editing) return;
    const next = event.relatedTarget as Element | null;
    if (next && event.currentTarget.contains(next)) return;
    const column = columns.find((c) => c.key === editing.column);
    const row = rows.find((r) => r.id === editing.rowId);
    if (!column || !row) return;
    const kind = editorKind(column, row);
    if (kind === 'select' || kind === 'checkbox') return;
    // Focus moving into the editor's own popup (the DatePicker calendar) is not a blur of the edit.
    if (next && !gridRef.current?.contains(next) && next.closest('[role="dialog"], [role="listbox"], [popover]')) return;
    commitEdit(draftRef.current, false);
  };

  /* Move the editor's focus in when it opens; put the caret after a typed character. */
  useLayoutEffect(() => {
    if (!editing) return;
    const control = editorRef.current?.querySelector<HTMLElement>('input, select, textarea, button');
    if (!control) return;
    control.focus();
    if (editing.initial !== undefined && control instanceof HTMLInputElement) {
      try {
        const end = control.value.length;
        control.setSelectionRange(end, end);
      } catch {
        /* number inputs have no selection range */
      }
    }
  }, [editing]);

  /* Controls inside cells are demoted after every update so the grid stays one tab stop. */
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    for (const control of grid.querySelectorAll<HTMLElement>(
      `.ds-data-grid__cell :is(${CONTROL_SELECTOR})`,
    )) {
      if (control.closest('.ds-data-grid__editor')) continue;
      if (control.tabIndex !== -1) control.tabIndex = -1;
    }
  });

  /* Keep the active cell in view after a keyboard move (the active row is always rendered). */
  useLayoutEffect(() => {
    if (!scrollPendingRef.current) return;
    scrollPendingRef.current = false;
    const region = regionRef.current;
    const cell = region?.ownerDocument.getElementById(cellId(active));
    if (!region || !cell) return;
    const regionRect = region.getBoundingClientRect();
    const rect = cell.getBoundingClientRect();
    const headerHeight = active.row >= 0 ? (headerRef.current?.getBoundingClientRect().height ?? 0) : 0;
    const top = regionRect.top + region.clientTop + headerHeight;
    const bottom = regionRect.top + region.clientTop + region.clientHeight;
    if (rect.top < top) region.scrollTop -= top - rect.top;
    else if (rect.bottom > bottom) region.scrollTop += rect.bottom - bottom;
    if (cell.classList.contains('ds-data-grid__cell--pinned')) return;
    const left = regionRect.left + region.clientLeft;
    const right = left + region.clientWidth;
    if (rect.left < left) region.scrollLeft -= left - rect.left;
    else if (rect.right > right) region.scrollLeft += rect.right - right;
  });

  /* Measure one rendered row, the region and the probe; write only when a value changes. */
  const rowsEmpty = rows.length === 0;
  const widthsKey = columns.map((column) => pixelWidth(column) ?? '').join(',');
  useLayoutEffect(() => {
    const region = regionRef.current;
    const grid = gridRef.current;
    if (!region || !grid) return undefined;
    const measure = (): void => {
      const row = bodyRef.current?.querySelector<HTMLElement>('[role="row"]');
      const nextRow = row ? row.getBoundingClientRect().height : 0;
      setRowPx((current) => (current === nextRow ? current : nextRow));
      const nextRegion = region.clientHeight;
      setRegionPx((current) => (current === nextRegion ? current : nextRegion));
      const nextOverflow = region.scrollWidth - region.clientWidth >= 1;
      setOverflowX((current) => (current === nextOverflow ? current : nextOverflow));
      const nextMin = probePx(minProbeRef.current);
      setMinTargetPx((current) => (current === nextMin ? current : nextMin));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(region);
    observer.observe(grid);
    const row = bodyRef.current?.querySelector('[role="row"]');
    if (row) observer.observe(row);
    return () => observer.disconnect();
  }, [rowsEmpty, density, selectable, height, widthsKey, windowFirst]);

  const onRegionScroll = (event: UIEvent<HTMLDivElement>): void => {
    const region = event.currentTarget;
    const nextX = Math.abs(region.scrollLeft) >= 1;
    setScrolledX((current) => (current === nextX ? current : nextX));
    if (nextX) setEverScrolledX(true);
    const nextY = region.scrollTop >= 1;
    setScrolledY((current) => (current === nextY ? current : nextY));
    if (rowPx > 0) {
      const next = Math.floor(region.scrollTop / rowPx);
      setFirstIndex((current) => (current === next ? current : next));
      requestMore(Math.min(lastRow, next + Math.ceil(region.clientHeight / rowPx)));
    }
  };

  /* Navigation: move the active cell, applying the mode's selection rules. */
  const navigate = (target: CellPos, extend: boolean): void => {
    setActive(target);
    scrollPendingRef.current = true;
    if (selectable === 'cell') selectCell(target);
    if (selectable === 'range' && target.row >= 0) {
      if (extend) {
        const anchor = rangeAnchorRef.current ?? (active.row >= 0 ? active : target);
        rangeAnchorRef.current = anchor;
        emitRange({ anchor, focus: target });
      } else {
        rangeAnchorRef.current = target;
        if (range) emitRange({ anchor: target, focus: target });
      }
    }
    if (target.row >= 0) requestMore(target.row);
  };

  /* Keyboard resize of a header cell; onColumnResize fires on the release of Shift. */
  const pendingResizeRef = useRef<{ column: string; width: number } | null>(null);
  const resizeBy = (column: DataGridColumn, col: number, direction: 1 | -1): void => {
    const step = probePx(stepProbeRef.current);
    const cell = regionRef.current?.ownerDocument.getElementById(cellId({ row: -1, col }));
    const current = pixelWidth(column) ?? (cell ? cell.getBoundingClientRect().width : 0);
    const width = Math.round(Math.max(floorFor(column), current + step * direction));
    setWidths((prev) => ({ ...prev, [column.key]: width }));
    pendingResizeRef.current = { column: column.key, width };
  };

  const rangeBounds = (r: RangeState): { r0: number; r1: number; c0: number; c1: number } => ({
    r0: Math.min(r.anchor.row, r.focus.row),
    r1: Math.max(r.anchor.row, r.focus.row),
    c0: Math.min(r.anchor.col, r.focus.col),
    c1: Math.max(r.anchor.col, r.focus.col),
  });

  const pageLocale = useSyncExternalStore(subscribeNothing, readPageLocale, serverPageLocale);
  const plural = (count: number): 'one' | 'other' =>
    new Intl.PluralRules(pageLocale || undefined).select(count) === 'one' ? 'one' : 'other';

  const copyRange = (): void => {
    if (!range) return;
    const { r0, r1, c0, c1 } = rangeBounds(range);
    const lines: string[] = [];
    if (r0 === 0 && r1 === lastRow) {
      const headers: string[] = [];
      for (let c = c0; c <= c1; c += 1) headers.push(colAt(c)?.header ?? '');
      lines.push(headers.join('\t'));
    }
    for (let r = r0; r <= r1; r += 1) {
      const row = rows[r];
      const cells: string[] = [];
      for (let c = c0; c <= c1; c += 1) {
        const column = colAt(c);
        cells.push(row && column ? textOf(row[column.key]) : '');
      }
      lines.push(cells.join('\t'));
    }
    const cells = (r1 - r0 + 1) * (c1 - c0 + 1);
    const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
    if (!clipboard) return;
    clipboard.writeText(lines.join('\n')).then(
      () => setAnnouncement(fill(COPY.copied[plural(cells)], { cells })),
      () => undefined,
    );
  };

  const clearCells = (): void => {
    if (!editable) return;
    const targets: CellPos[] = [];
    const editableCols = editableColsInRow();
    if (selectable === 'row') {
      rows.forEach((row, index) => {
        if (selectedSet.has(row.id)) for (const col of editableCols) targets.push({ row: index, col });
      });
    } else if (selectable === 'range' && range) {
      const { r0, r1, c0, c1 } = rangeBounds(range);
      for (let r = r0; r <= r1; r += 1) for (const col of editableCols) if (col >= c0 && col <= c1) targets.push({ row: r, col });
    } else if (selectable === 'cell' && canEdit(active)) {
      targets.push(active);
    }
    for (const pos of targets) {
      const row = rows[pos.row];
      const column = colAt(pos.col);
      if (!row || !column) continue;
      const previous = row[column.key] as DataGridCellValue;
      if (!Object.is(previous, undefined)) onCellChange?.(row.id, column.key, undefined, previous);
    }
  };

  const onGridKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    const grid = event.currentTarget;
    if (event.target !== grid) {
      // Real focus is inside a cell's control: Escape hands it back to the cell.
      if (event.key === 'Escape') {
        event.preventDefault();
        grid.focus();
      }
      return;
    }
    const ctrl = event.ctrlKey || event.metaKey;
    const { key, shiftKey } = event;
    const rtl = getComputedStyle(grid).direction === 'rtl';
    const column = colAt(active.col);
    const inBody = active.row >= 0;
    const lastCol = colCount - 1;
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';

    // Shift+ArrowLeft/Right on a resizable header cell resizes it.
    if (shiftKey && !inBody && column?.resizable && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      event.preventDefault();
      resizeBy(column, active.col, key === forward ? 1 : -1);
      return;
    }

    let target: CellPos | null = null;
    switch (key) {
      case forward:
        target = { row: active.row, col: Math.min(active.col + 1, lastCol) };
        break;
      case backward:
        target = { row: active.row, col: Math.max(active.col - 1, 0) };
        break;
      case 'ArrowDown':
        target = { row: Math.min(active.row + 1, lastRow), col: active.col };
        break;
      case 'ArrowUp':
        target = { row: Math.max(active.row - 1, selectable === 'range' && shiftKey ? 0 : -1), col: active.col };
        break;
      case 'Home':
        target = ctrl ? { row: -1, col: 0 } : { row: active.row, col: 0 };
        break;
      case 'End':
        target = ctrl ? { row: lastRow, col: lastCol } : { row: active.row, col: lastCol };
        break;
      case 'PageDown':
        target = { row: Math.min(active.row + rowsPerPage, lastRow), col: active.col };
        break;
      case 'PageUp':
        target = { row: inBody ? Math.max(active.row - rowsPerPage, 0) : -1, col: active.col };
        break;
      default:
        break;
    }
    if (target) {
      event.preventDefault();
      const extend = shiftKey && selectable === 'range' && inBody && target.row >= 0 && key.startsWith('Arrow');
      if (ctrl && key === 'End') requestMore(lastRow);
      navigate(target, extend);
      return;
    }

    if (key === 'Enter') {
      if (!inBody) {
        if (hasSelectColumn && active.col === 0) {
          event.preventDefault();
          toggleAll();
        } else if (column?.sortable) {
          event.preventDefault();
          activateSort(column);
        }
        return;
      }
      if (hasSelectColumn && active.col === 0) {
        event.preventDefault();
        toggleRow(active.row);
        return;
      }
      if (canEdit(active)) {
        event.preventDefault();
        openEditor(active);
        return;
      }
      const cell = grid.ownerDocument.getElementById(cellId(active));
      const control = cell?.querySelector<HTMLElement>(CONTROL_SELECTOR);
      if (control) {
        event.preventDefault();
        control.focus();
        control.click();
      }
      return;
    }

    if (key === 'F2') {
      if (canEdit(active)) {
        event.preventDefault();
        openEditor(active);
      }
      return;
    }

    if (key === 'Escape') {
      if (range) {
        event.preventDefault();
        clearRange();
      }
      return;
    }

    if (key === ' ' && inBody && (selectable === 'row' || selectable === 'range')) {
      event.preventDefault();
      if (selectable === 'row') {
        if (shiftKey) addRowsThrough(active.row);
        else toggleRow(active.row);
        return;
      }
      if (ctrl) {
        if (lastRow < 0) return;
        rangeAnchorRef.current = { row: 0, col: active.col };
        emitRange({ anchor: { row: 0, col: active.col }, focus: { row: lastRow, col: active.col } });
        return;
      }
      const anchorRow = shiftKey && range ? range.anchor.row : active.row;
      rangeAnchorRef.current = { row: anchorRow, col: 0 };
      emitRange({ anchor: { row: anchorRow, col: 0 }, focus: { row: active.row, col: lastCol } });
      return;
    }

    if (ctrl && (event.code === 'KeyA' || key === 'a') && (selectable === 'row' || selectable === 'range')) {
      event.preventDefault();
      if (selectable === 'row') commitRows(rows.map((row) => row.id));
      else if (lastRow >= 0) {
        rangeAnchorRef.current = { row: 0, col: 0 };
        emitRange({ anchor: { row: 0, col: 0 }, focus: { row: lastRow, col: lastCol } });
      }
      return;
    }

    if (ctrl && (event.code === 'KeyC' || key === 'c') && selectable === 'range') {
      if (range) {
        event.preventDefault();
        copyRange();
      }
      return;
    }

    if ((key === 'Delete' || key === 'Backspace') && editable && selectable !== 'none') {
      event.preventDefault();
      clearCells();
      return;
    }

    // A printable character opens the editor; text and number editors start from it.
    if (key.length === 1 && key !== ' ' && !ctrl && !event.altKey && canEdit(active)) {
      const row = rows[active.row];
      const kind = row && column ? editorKind(column, row) : 'text';
      event.preventDefault();
      openEditor(active, kind === 'text' || kind === 'number' ? key : undefined);
    }
  };

  const onGridKeyUp = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Shift' || !pendingResizeRef.current) return;
    const { column, width } = pendingResizeRef.current;
    pendingResizeRef.current = null;
    onColumnResize?.(column, width);
  };

  /* Pointer: cells report their coordinates through data attributes. */
  const cellFromTarget = (target: EventTarget | null): CellPos | null => {
    const cell = target instanceof Element ? target.closest<HTMLElement>('[data-grid-row]') : null;
    if (!cell || !gridRef.current?.contains(cell)) return null;
    return { row: Number(cell.dataset.gridRow), col: Number(cell.dataset.gridCol) };
  };
  const draggingRef = useRef(false);

  const onGridPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (selectable !== 'range' || event.button !== 0) return;
    if ((event.target as Element).closest('.ds-data-grid__editor, [data-part="resizeHandle"]')) return;
    const pos = cellFromTarget(event.target);
    if (!pos || pos.row < 0) return;
    if (event.shiftKey && rangeAnchorRef.current) {
      emitRange({ anchor: rangeAnchorRef.current, focus: pos });
    } else {
      rangeAnchorRef.current = pos;
      emitRange({ anchor: pos, focus: pos });
    }
    draggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onGridPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current || !rangeAnchorRef.current) return;
    const doc = event.currentTarget.ownerDocument;
    const under = typeof doc.elementFromPoint === 'function' ? doc.elementFromPoint(event.clientX, event.clientY) : null;
    const pos = cellFromTarget(under);
    if (!pos || pos.row < 0) return;
    if (pos.row === active.row && pos.col === active.col) return;
    setActive(pos);
    emitRange({ anchor: rangeAnchorRef.current, focus: pos });
  };
  const onGridPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const onGridClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as Element;
    if (target.closest('.ds-data-grid__editor')) return;
    const pos = cellFromTarget(target);
    if (!pos) return;
    setActive(pos);
    if (editing) cancelEdit(false);
    if (pos.row >= 0) {
      if (selectable === 'cell') selectCell(pos);
      if (selectable === 'row' && !(hasSelectColumn && pos.col === 0)) {
        if (event.shiftKey) addRowsThrough(pos.row);
        else if (event.ctrlKey || event.metaKey) toggleRow(pos.row);
      }
    }
    // A control rendered in a data cell keeps the focus a click gave it; everything else returns to the grid.
    const control = target.closest(CONTROL_SELECTOR);
    const isOwnControl =
      control && !control.classList.contains('ds-data-grid__cell') && !target.closest('[data-part="selectCell"], [data-part="selectAllCell"], [data-part="sortButton"]');
    if (!isOwnControl) focusGrid();
  };

  const onGridDoubleClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const pos = cellFromTarget(event.target);
    if (pos && canEdit(pos)) openEditor(pos);
  };

  /* Pointer resize on the header edge. */
  const onResizePointerDown = (event: ReactPointerEvent<HTMLDivElement>, column: DataGridColumn): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const cell = handle.parentElement;
    const startWidth = pixelWidth(column) ?? (cell ? cell.getBoundingClientRect().width : 0);
    const startX = event.clientX;
    const sign = getComputedStyle(handle).direction === 'rtl' ? -1 : 1;
    let width = startWidth;
    handle.setPointerCapture?.(event.pointerId);
    const onMove = (move: PointerEvent): void => {
      width = Math.round(Math.max(floorFor(column), startWidth + (move.clientX - startX) * sign));
      setWidths((prev) => (prev[column.key] === width ? prev : { ...prev, [column.key]: width }));
    };
    const onUp = (): void => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
      onColumnResize?.(column.key, width);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  };

  /* Rendering. */
  const rowNameOf = (row: DataGridRow): string =>
    rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;

  const cellClasses = (base: string, col: number, extra?: string | false): string => {
    const column = colAt(col);
    const pinned = (hasSelectColumn && col === 0) || column?.pinned !== undefined;
    return joinClasses(
      'ds-data-grid__cell',
      base,
      column?.align && column.align !== 'start' && `ds-data-grid__cell--align-${column.align}`,
      pinned && 'ds-data-grid__cell--pinned',
      col === lastStartPin && 'ds-data-grid__cell--pinned-start-edge',
      firstEndPin >= 0 && col === firstEndPin + selectOffset && 'ds-data-grid__cell--pinned-end-edge',
      extra,
    );
  };

  const isActive = (pos: CellPos): boolean => pos.row === active.row && pos.col === active.col;

  const headerCell = (column: DataGridColumn, index: number): ReactElement => {
    const col = index + selectOffset;
    const pos = { row: -1, col };
    const sorted = activeSort?.column === column.key ? activeSort.direction : undefined;
    const nextDirection = sorted === 'ascending' ? 'descending' : 'ascending';
    const px = pixelWidth(column);
    const minWidth = column.minWidth ?? (minTargetPx > 0 ? Math.round(minTargetPx) : undefined);
    return (
      <div
        key={column.key}
        id={cellId(pos)}
        role="columnheader"
        aria-colindex={col + 1}
        aria-sort={sorted}
        tabIndex={-1}
        data-part="columnHeader"
        data-grid-row={-1}
        data-grid-col={col}
        className={cellClasses('ds-data-grid__column-header', col, isActive(pos) && 'ds-data-grid__cell--active')}
        style={{ inlineSize: colVar(col), ...pinStyle(col) }}
      >
        {column.sortable ? (
          /* Button writes its own part hook, so the sortButton part is this wrapper around it. */
          <span data-part="sortButton" className="ds-data-grid__sort" onClick={(event) => forwardPress(event, 'button')}>
            <Button
              variant="ghost"
              size="sm"
              label={column.header}
              accessibleName={fill(nextDirection === 'ascending' ? COPY.sortAscending : COPY.sortDescending, {
                column: column.header,
              })}
              trailingIcon={sorted ? <Icon name={sorted === 'ascending' ? 'chevron-up' : 'chevron-down'} inline /> : undefined}
              overrides={{
                paddingInline: 'space.0',
                fontWeight: overrides?.headerWeight ?? 'font.weight.semibold',
                fontSize: overrides?.headerSize ?? 'font.size.sm',
              }}
              onClick={() => activateSort(column)}
            />
          </span>
        ) : column.abbr ? (
          <>
            <span aria-hidden="true">{column.header}</span>
            <span className="ds-data-grid__visually-hidden">{column.abbr}</span>
          </>
        ) : (
          <span className="ds-data-grid__header-text">{column.header}</span>
        )}
        {column.resizable ? (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={fill(COPY.resize, { column: column.header })}
            aria-valuenow={px}
            aria-valuemin={minWidth}
            data-part="resizeHandle"
            className="ds-data-grid__resize-handle"
            onPointerDown={(event) => onResizePointerDown(event, column)}
          />
        ) : null}
      </div>
    );
  };

  const renderEditor = (column: DataGridColumn, row: DataGridRow): ReactElement => {
    const kind = editorKind(column, row);
    const current = row[column.key];
    const name = `${id}-edit-${column.key}`;
    const initial = editing?.initial;
    const setDraft = (value: DataGridCellValue): void => {
      draftRef.current = value;
    };
    const inset = { paddingInline: 'space.0', paddingBlock: 'space.0' } as const;
    let control: ReactElement;
    if (kind === 'number') {
      control = (
        <NumberInput
          label={column.header}
          hideLabel
          name={name}
          size="sm"
          defaultValue={typeof draftRef.current === 'number' ? draftRef.current : undefined}
          overrides={inset}
          onChange={(value) => setDraft(value)}
        />
      );
    } else if (kind === 'select') {
      control = (
        <Select
          label={column.header}
          hideLabel
          name={name}
          size="sm"
          options={column.options ?? []}
          defaultValue={textOf(current) || undefined}
          open
          container={container}
          overrides={{ triggerPaddingInline: 'space.0', triggerPaddingBlock: 'space.0' }}
          onChange={(value) => {
            commitEdit(Array.isArray(value) ? value[0] : value, true);
          }}
          onOpenChange={(open) => {
            if (!open) cancelEdit();
          }}
        />
      );
    } else if (kind === 'date') {
      control = (
        <DatePicker
          label={column.header}
          hideLabel
          name={name}
          size="sm"
          defaultValue={textOf(current) || undefined}
          container={container}
          overrides={inset}
          onChange={(value) => setDraft(typeof value === 'string' ? value : undefined)}
        />
      );
    } else if (kind === 'checkbox') {
      control = (
        <Checkbox
          label={column.header}
          hideLabel
          name={name}
          defaultChecked={Boolean(current)}
          onChange={(checked) => {
            commitEdit(checked, true);
          }}
        />
      );
    } else {
      control = (
        <Input
          label={column.header}
          hideLabel
          name={name}
          size="sm"
          defaultValue={initial ?? textOf(current)}
          overrides={inset}
          onChange={(value) => setDraft(value)}
        />
      );
    }
    return (
      <div
        ref={editorRef}
        data-part="editor"
        className="ds-data-grid__editor"
        onKeyDown={onEditorKeyDown}
        onBlur={onEditorBlur}
      >
        {/* An editor is not a form field of an enclosing Form. */}
        <FormContext value={null}>{control}</FormContext>
      </div>
    );
  };

  const bodyRow = (row: DataGridRow, rowIndex: number): ReactElement => {
    const isSelected = selectedSet.has(row.id);
    const rowSelected = selectable === 'row' ? isSelected : undefined;
    const bounds = selectable === 'range' && range ? rangeBounds(range) : null;
    return (
      <div
        key={row.id}
        role="row"
        aria-rowindex={rowIndex + 2}
        aria-selected={rowSelected}
        data-part="row"
        className={joinClasses('ds-data-grid__row', selectable === 'row' && isSelected && 'ds-data-grid__row--selected')}
        style={{ '--ds-data-grid-row-index': rowIndex } as CSSProperties}
      >
        {hasSelectColumn ? (
          <div
            id={cellId({ row: rowIndex, col: 0 })}
            role="gridcell"
            aria-colindex={1}
            tabIndex={-1}
            data-part="selectCell"
            data-grid-row={rowIndex}
            data-grid-col={0}
            className={cellClasses('ds-data-grid__select', 0, isActive({ row: rowIndex, col: 0 }) && 'ds-data-grid__cell--active')}
            style={{ inlineSize: colVar(0), ...pinStyle(0) }}
            onClick={(event) => forwardPress(event, 'input')}
          >
            {/* Selection is not a form value: the Checkbox must not register with an enclosing Form. */}
            <FormContext value={null}>
              <Checkbox
                label={fill(COPY.selectRow, { rowName: rowNameOf(row) })}
                hideLabel
                name={`${id}-select`}
                value={row.id}
                checked={isSelected}
                overrides={{ controlSize: 'size.target.min' }}
                onChange={() => toggleRow(rowIndex)}
              />
            </FormContext>
          </div>
        ) : null}
        {columns.map((column, index) => {
          const col = index + selectOffset;
          const pos = { row: rowIndex, col };
          const value = row[column.key];
          const isRowHeader = column === rowHeaderColumn;
          const isEditing = editing !== null && editing.rowId === row.id && editing.column === column.key;
          const numeric = typeof value === 'number' && !column.render;
          const inRange = bounds
            ? rowIndex >= bounds.r0 && rowIndex <= bounds.r1 && col >= bounds.c0 && col <= bounds.c1
            : false;
          const ariaSelected =
            selectable === 'range'
              ? inRange
              : selectable === 'cell'
                ? lastCellRef.current === `${row.id}\u0000${column.key}`
                : undefined;
          return (
            <div
              key={column.key}
              id={cellId(pos)}
              role={isRowHeader ? 'rowheader' : 'gridcell'}
              aria-colindex={col + 1}
              aria-selected={ariaSelected}
              aria-describedby={isEditing && editError ? liveId : undefined}
              tabIndex={-1}
              data-part={isRowHeader ? 'rowHeader' : 'cell'}
              data-grid-row={rowIndex}
              data-grid-col={col}
              className={cellClasses(
                'ds-data-grid__body-cell',
                col,
                joinClasses(
                  isActive(pos) && 'ds-data-grid__cell--active',
                  numeric && 'ds-data-grid__cell--numeric',
                  isEditing && 'ds-data-grid__cell--editing',
                  isEditing && editError !== undefined && 'ds-data-grid__cell--invalid',
                ),
              )}
              style={{ inlineSize: colVar(col), ...pinStyle(col) }}
            >
              {isEditing ? (
                renderEditor(column, row)
              ) : (
                <span data-part="cellContent" className="ds-data-grid__cell-content">
                  {column.render ? column.render(row) : textOf(value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* The rendered set: the window plus the active and editing rows, in index order. */
  const rendered: number[] = [];
  for (let i = windowFirst; i <= windowLast; i += 1) rendered.push(i);
  for (const extra of [active.row, editingRowIndex]) {
    if (extra >= 0 && extra <= lastRow && !rendered.includes(extra)) rendered.push(extra);
  }
  rendered.sort((a, b) => a - b);

  /* The range overlay, clipped to the rendered window. */
  let rangeOverlay: ReactElement | null = null;
  if (selectable === 'range' && range && rows.length > 0) {
    const { r0, r1, c0, c1 } = rangeBounds(range);
    const top = Math.max(r0, windowFirst);
    const bottom = Math.min(r1, windowLast);
    if (top <= bottom) {
      rangeOverlay = (
        <div
          aria-hidden="true"
          data-part="rangeOverlay"
          className="ds-data-grid__range"
          style={
            {
              '--ds-data-grid-range-first': top,
              '--ds-data-grid-range-rows': bottom - top + 1,
              insetInlineStart: sumVars(0, c0),
              inlineSize: sumVars(c0, c1 + 1),
            } as CSSProperties
          }
        />
      );
    }
  }

  /* Status bar content. */
  const rowCountText = fill(COPY.rowCount[plural(totalRows)], { count: totalRows });
  let selectionText: string | undefined;
  if (selectable === 'row' && selectedIds.length > 0) selectionText = selectedRowsText(selectedIds.length);
  if (selectable === 'range' && range) {
    const { r0, r1, c0, c1 } = rangeBounds(range);
    selectionText = fill(COPY.selectedRange, { rows: r1 - r0 + 1, columns: c1 - c0 + 1 });
  }
  const activeColumn = colAt(active.col);
  const positionText =
    active.row >= 0 && rows[active.row] && activeColumn
      ? fill(COPY.position, { row: active.row + 1, column: activeColumn.header })
      : undefined;
  const showScrollHint = overflowX && !everScrolledX;
  const statusOverrides = { fontSize: overrides?.statusBarSize ?? 'font.size.xs' } as const;
  const liveContent: ReactNode =
    editError !== undefined ? (
      <span className="ds-data-grid__invalid">
        <Text element="span" size="xs" overrides={statusOverrides}>
          {fill(COPY.invalid, { message: editError })}
        </Text>
      </span>
    ) : loading ? (
      COPY.loading
    ) : (
      announcement
    );

  const isEmpty = rows.length === 0 && !loading;
  const rowSize = hasSelectColumn || density === 'comfortable' ? 'comfortable' : 'compact';

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="DataGrid"
      data-part="container"
      className={joinClasses(
        'ds-data-grid',
        `ds-data-grid--height-${height}`,
        `ds-data-grid--rows-${rowSize}`,
        stickyHeader && 'ds-data-grid--sticky-header',
        hideCaption && 'ds-data-grid--hide-caption',
        loading && 'ds-data-grid--loading',
        scrolledX && 'ds-data-grid--scrolled-x',
        scrolledY && 'ds-data-grid--scrolled-y',
      )}
      style={overridesToStyle(overrides) as CSSProperties}
    >
      {/* Heading writes its own data-part, so the caption part is a span the grid owns around it. */}
      <span data-part="caption" className="ds-data-grid__caption">
        <Heading
          id={captionId}
          level={captionLevel}
          size="md"
          overrides={{
            fontSize: overrides?.captionSize ?? 'font.size.md',
            fontWeight: overrides?.captionWeight ?? 'font.weight.semibold',
            marginBlockEnd: 'space.0',
          }}
        >
          {caption ?? ''}
        </Heading>
      </span>
      <div ref={regionRef} data-part="scrollRegion" className="ds-data-grid__scroll-region" onScroll={onRegionScroll}>
        <div
          ref={gridRef}
          role="grid"
          aria-labelledby={captionId}
          aria-rowcount={totalRows + 1}
          aria-colcount={colCount}
          aria-multiselectable={
            selectable === 'row' || selectable === 'range' ? true : selectable === 'cell' ? false : undefined
          }
          aria-readonly={editable ? undefined : true}
          aria-busy={loading ? true : undefined}
          aria-activedescendant={cellId(active)}
          tabIndex={0}
          data-part="grid"
          className="ds-data-grid__grid"
          style={gridStyle as CSSProperties}
          onKeyDown={onGridKeyDown}
          onKeyUp={onGridKeyUp}
          onClick={onGridClick}
          onDoubleClick={onGridDoubleClick}
          onPointerDown={onGridPointerDown}
          onPointerMove={onGridPointerMove}
          onPointerUp={onGridPointerUp}
        >
          <div ref={headerRef} role="rowgroup" data-part="header" className="ds-data-grid__header">
            <div role="row" aria-rowindex={1} data-part="headerRow" className="ds-data-grid__header-row">
              {hasSelectColumn ? (
                <div
                  id={cellId({ row: -1, col: 0 })}
                  role="columnheader"
                  aria-colindex={1}
                  tabIndex={-1}
                  data-part="selectAllCell"
                  data-grid-row={-1}
                  data-grid-col={0}
                  className={cellClasses(
                    'ds-data-grid__column-header ds-data-grid__select',
                    0,
                    isActive({ row: -1, col: 0 }) && 'ds-data-grid__cell--active',
                  )}
                  style={{ inlineSize: colVar(0), ...pinStyle(0) }}
                  onClick={(event) => forwardPress(event, 'input')}
                >
                  <FormContext value={null}>
                    <Checkbox
                      label={COPY.selectAll}
                      hideLabel
                      name={`${id}-select-all`}
                      checked={allSelected}
                      indeterminate={someSelected}
                      overrides={{ controlSize: 'size.target.min' }}
                      onChange={toggleAll}
                    />
                  </FormContext>
                </div>
              ) : null}
              {columns.map(headerCell)}
            </div>
          </div>
          <div
            ref={bodyRef}
            role="rowgroup"
            data-part="body"
            className="ds-data-grid__body"
            style={{ '--ds-data-grid-row-total': rows.length > 0 ? totalRows : 0 } as CSSProperties}
          >
            {rangeOverlay}
            {rendered.map((index) => {
              const row = rows[index];
              return row ? bodyRow(row, index) : null;
            })}
          </div>
        </div>
        {isEmpty ? (
          <div className="ds-data-grid__empty">
            <Text element="p" tone="muted" data-part="emptyState">
              {emptyMessage ?? COPY.empty}
            </Text>
          </div>
        ) : null}
      </div>
      <div className={joinClasses('ds-data-grid__status', !showStatusBar && 'ds-data-grid__visually-hidden')}>
        <Text
          id={liveId}
          element="span"
          tone="muted"
          size="xs"
          role="status"
          data-part="statusBar"
          overrides={statusOverrides}
        >
          {liveContent}
        </Text>
        {showStatusBar ? (
          <>
            <Text element="span" tone="muted" size="xs" overrides={statusOverrides}>
              {rowCountText}
            </Text>
            {selectionText !== undefined ? (
              <Text element="span" tone="muted" size="xs" overrides={statusOverrides}>
                {selectionText}
              </Text>
            ) : null}
            {showScrollHint ? (
              <Text element="span" tone="muted" size="xs" overrides={statusOverrides}>
                {COPY.scrollHint}
              </Text>
            ) : null}
            {positionText !== undefined ? (
              <Text element="span" tone="muted" size="xs" overrides={statusOverrides}>
                {positionText}
              </Text>
            ) : null}
          </>
        ) : null}
      </div>
      <span ref={stepProbeRef} aria-hidden="true" className="ds-data-grid__probe ds-data-grid__probe--step" />
      <span ref={minProbeRef} aria-hidden="true" className="ds-data-grid__probe ds-data-grid__probe--min" />
    </div>
  );
}
