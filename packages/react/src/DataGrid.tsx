import {
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  type UIEvent, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DatePicker, type DatePickerValue } from './DatePicker';
import { Heading, type HeadingOverridableBinding } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text } from './Text';
import './DataGrid.css';

export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/** A data row. `id` must be stable — selection, focus and React keys all use it. */
export type DataGridRow = { id: string; [key: string]: unknown };

/** Controlled sort state; the grid sorts `data` itself when `rowCount` is not set. */
export interface DataGridSortState {
  column: string;
  direction: DataGridSortDirection;
}

export interface DataGridColumnOption {
  value: string;
  label: string;
}

/** One column definition, in display order. Exactly one column should set `isRowHeader`. */
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
export type DataGridSelectionChangeDetail = string[] | DataGridCellRef | DataGridRangeRef;

export interface DataGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

export interface DataGridEditStartDetail {
  rowId: string;
  column: string;
}

export interface DataGridRangeNeededDetail {
  start: number;
  end: number;
}

export interface DataGridColumnResizeDetail {
  column: string;
  width: number;
}

/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY = {
  sortAscending: 'Sort by {column}, ascending',
  sortDescending: 'Sort by {column}, descending',
  sortedAnnouncement: 'Sorted by {column}, {direction}',
  selectAll: 'Select all rows',
  selectRow: 'Select {rowName}',
  selectedRows: '{count} of {total} rows selected',
  selectedRange: '{rows} rows by {columns} columns selected',
  copied: 'Copied {cells} cells',
  editing: 'Editing {column}. Enter to save, Escape to cancel.',
  invalid: '{message}',
  rowCount: '{count} rows',
  position: 'Row {row}, {column}',
  resize: 'Resize {column}',
  loading: 'Loading',
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
};

/** A column with no explicit `width`/`minWidth` still needs a pixel size for the CSS-grid layout
 * and virtualization math; the schema's own example (160) is the fallback. */
const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 40;
/** Fallback keyboard resize step before the `resizeStep` token (space.4) is measured. */
const DEFAULT_RESIZE_STEP_PX = 16;
/** Announcements revert to the persistent summary after this long. */
const ANNOUNCEMENT_TIMEOUT_MS = 5000;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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
  | 'resizeStep'
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

/** `captionSize`/`captionWeight` are forwarded to the composed caption Heading's own overrides
 * (it already owns `fontSize`/`fontWeight`); every other binding is a root CSS hook. */
const ROOT_OVERRIDE_HOOK: Partial<Record<DataGridOverridableBinding, string | undefined>> = {
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
  resizeStep: '--ds-data-grid-resize-step',
  statusBarSize: '--ds-data-grid-status-bar-size',
  statusBarPadding: '--ds-data-grid-status-bar-padding',
  captionGap: '--ds-data-grid-caption-gap',
  fixedHeight: '--ds-data-grid-fixed-height',
  fontFamily: '--ds-data-grid-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-data-grid-font-size',
  lineHeight: '--ds-data-grid-line-height',
  numericFont: '--ds-data-grid-numeric-font', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-data-grid-transition',
};

function overridesToStyle(overrides: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>): {
  rootStyle: CSSProperties;
  captionOverrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>>;
} {
  const rootStyle: Record<string, string> = {};
  const captionOverrides: Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> = { marginBlockEnd: 'space.0' };
  for (const binding of Object.keys(overrides) as DataGridOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) {
      rootStyle[hook] = cssVar(ref);
    } else if (binding === 'captionSize') {
      captionOverrides.fontSize = ref;
    } else if (binding === 'captionWeight') {
      captionOverrides.fontWeight = ref;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, captionOverrides };
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}

/** localeCompare for strings, numeric otherwise. */
function compareRowValues(a: unknown, b: unknown): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, undefined, { numeric: true });
  return Number(a) - Number(b);
}

function cellValue(column: DataGridColumn, row: DataGridRow): unknown {
  return row[column.key];
}

function cellText(column: DataGridColumn, row: DataGridRow): string {
  const value = cellValue(column, row);
  return value === undefined || value === null ? '' : String(value);
}

function rowName(row: DataGridRow, rowHeaderColumn: DataGridColumn | undefined): string {
  if (!rowHeaderColumn) return row.id;
  return cellText(rowHeaderColumn, row) || row.id;
}

function nextSortDirection(activeSort: DataGridSortState | undefined, columnKey: string): DataGridSortDirection {
  if (activeSort?.column === columnKey) return activeSort.direction === 'ascending' ? 'descending' : 'ascending';
  return 'ascending';
}

function sortButtonLabel(column: DataGridColumn, activeSort: DataGridSortState | undefined): string {
  const next = nextSortDirection(activeSort, column.key);
  const template = next === 'ascending' ? COPY.sortAscending : COPY.sortDescending;
  return interpolate(template, { column: column.header });
}

function alignClass(column: DataGridColumn): string | null {
  return column.align === 'end' ? 'ds-data-grid__cell--align-end' : column.align === 'center' ? 'ds-data-grid__cell--align-center' : null;
}

/** Focusable descendants of a cell's custom `render` output (a Link, a Button) — the "focus inside
 * the cell" APG mode. */
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DataGridProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. Exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Large arrays are fine; only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Sets aria-rowcount;
   * `onRangeNeeded` asks for more. */
  rowCount?: number | undefined;
  /** Controlled sort state. */
  sort?: DataGridSortState | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSortState | undefined;
  /** `row` adds a checkbox column and Shift/Ctrl row selection; `cell` selects one cell; `range`
   * allows Shift+arrow / drag rectangles (copy as TSV). Selection is separate from focus. */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized. */
  stickyHeader?: boolean | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for editors that open a popup (Select, DatePicker). Defaults to `document.body`.
   * Not part of the schema; added so those composed editors can be portaled per their own contract. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: DataGridSortState) => void) | undefined;
  /** Fired with the selection: row ids, one cell, or a range. */
  onSelectionChange?: ((selection: DataGridSelectionChangeDetail) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((detail: DataGridCellChangeDetail) => void) | undefined;
  /** Fired when an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((detail: DataGridEditStartDetail) => boolean | void) | undefined;
  /** Fired when the visible window approaches the end of `data` and `rowCount` says there is more. */
  onRangeNeeded?: ((range: DataGridRangeNeededDetail) => void) | undefined;
  /** Fired with the new width when the user finishes dragging a resizable column edge. */
  onColumnResize?: ((detail: DataGridColumnResizeDetail) => void) | undefined;
}

type ActiveCell = { row: number; col: number };

/**
 * DataGrid — Design Schema, category: data.
 *
 * When to use:
 * Use a DataGrid when people navigate cell by cell, edit values in place, select ranges, or scroll
 * through more rows than fit in memory as DOM: price lists, inventory counts, timesheets, admin
 * views over large sets, anything a spreadsheet would otherwise be used for. Set `editable` and
 * mark the columns that may change; give every editable column a `validate`. Use `height: viewport`
 * (the default) so the grid, not the page, scrolls.
 */
export const DataGrid = function DataGrid({
  ref,
  caption,
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
  className,
  style,
  ...rest
}: DataGridProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const baseId = `ds-data-grid${generatedId}`;
  const captionId = `${baseId}-caption`;
  const statusBarId = `${baseId}-status`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);
  const sizerRef = useRef<HTMLDivElement | null>(null);
  const resizeStepSizerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());

  const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);

  if (isDev) {
    const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
    if (rowHeaderCount !== 1) {
      console.warn(`DataGrid: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
    }
  }

  /* ---------- sort ---------- */
  const isSortControlled = sort !== undefined;
  const [internalSort, setInternalSort] = useState<DataGridSortState | undefined>(defaultSort);
  const activeSort = isSortControlled ? sort : internalSort;

  const sortedData = useMemo(() => {
    if (isSortControlled || !activeSort || rowCount !== undefined) return data;
    const column = activeSort.column;
    const factor = activeSort.direction === 'ascending' ? 1 : -1;
    return [...data].sort((a, b) => compareRowValues(a[column], b[column]) * factor);
  }, [data, isSortControlled, activeSort, rowCount]);

  /* ---------- announcements / status bar (one element serves both, per the web notes) ---------- */
  const [announcement, setAnnouncement] = useState('');
  const announcementTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const announce = (message: string, sticky = false) => {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement(message);
    if (!sticky) {
      announcementTimer.current = setTimeout(() => setAnnouncement(''), ANNOUNCEMENT_TIMEOUT_MS);
    }
  };
  useEffect(() => () => clearTimeout(announcementTimer.current), []);

  const handleSort = (column: DataGridColumn) => {
    const direction = nextSortDirection(activeSort, column.key);
    const next: DataGridSortState = { column: column.key, direction };
    if (!isSortControlled) setInternalSort(next);
    onSortChange?.(next);
    announce(interpolate(COPY.sortedAnnouncement, { column: column.header, direction }));
  };

  /* ---------- selection ---------- */
  const isSelectionControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const selectedIds = isSelectionControlled ? (selected as string[]) : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const [cellSelection, setCellSelection] = useState<DataGridCellRef | undefined>();
  const [rangeSelection, setRangeSelection] = useState<DataGridRangeRef | undefined>();
  const anchorRef = useRef<DataGridCellRef | null>(null);

  const commitRowSelection = (next: string[]) => {
    if (!isSelectionControlled) setInternalSelected(next);
    onSelectionChange?.(next);
    announce(interpolate(COPY.selectedRows, { count: next.length, total: sortedData.length }));
  };

  const toggleRow = (id: string) => {
    commitRowSelection(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  };

  const allIds = useMemo(() => sortedData.map((row) => row.id), [sortedData]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const handleToggleAll = () => commitRowSelection(allSelected ? [] : allIds);

  const commitRangeSelection = (range: DataGridRangeRef) => {
    setRangeSelection(range);
    const fromRow = sortedData.findIndex((row) => row.id === range.from.rowId);
    const toRow = sortedData.findIndex((row) => row.id === range.to.rowId);
    const fromCol = columns.findIndex((column) => column.key === range.from.column);
    const toCol = columns.findIndex((column) => column.key === range.to.column);
    onSelectionChange?.(range);
    announce(
      interpolate(COPY.selectedRange, {
        rows: Math.abs(toRow - fromRow) + 1,
        columns: Math.abs(toCol - fromCol) + 1,
      }),
    );
  };

  /* ---------- editing ---------- */
  const [editing, setEditing] = useState<DataGridCellRef | undefined>();
  const [editingValue, setEditingValue] = useState<unknown>();
  const [editingError, setEditingError] = useState<string | undefined>();
  const editingValueRef = useRef<unknown>(undefined);
  const isEditingRef = useRef(false);
  isEditingRef.current = editing !== undefined;

  const focusGrid = () => scrollRegionRef.current?.focus();

  const openEditor = (rowId: string, columnKey: string, seedValue?: unknown) => {
    const column = columns.find((entry) => entry.key === columnKey);
    const row = sortedData.find((entry) => entry.id === rowId);
    if (!column || !row) return;
    const allowed = onEditStart?.({ rowId, column: columnKey });
    if (allowed === false) return;
    const initial = seedValue !== undefined ? seedValue : cellValue(column, row);
    editingValueRef.current = initial;
    setEditing({ rowId, column: columnKey });
    setEditingValue(initial);
    setEditingError(undefined);
    announce(interpolate(COPY.editing, { column: column.header }), true);
  };

  const updateEditingValue = (value: unknown) => {
    editingValueRef.current = value;
    setEditingValue(value);
  };

  const cancelEdit = () => {
    isEditingRef.current = false;
    setEditing(undefined);
    setEditingValue(undefined);
    setEditingError(undefined);
    focusGrid();
  };

  const commitEditWithValue = (value: unknown, moveDown: boolean) => {
    if (!editing) return;
    const column = columns.find((entry) => entry.key === editing.column);
    const row = sortedData.find((entry) => entry.id === editing.rowId);
    if (!column || !row) return;
    const error = column.validate?.(value, row);
    if (error) {
      setEditingError(error);
      announce(interpolate(COPY.invalid, { message: error }), true);
      return;
    }
    const previous = cellValue(column, row);
    isEditingRef.current = false;
    setEditing(undefined);
    setEditingValue(undefined);
    setEditingError(undefined);
    onCellChange?.({ rowId: editing.rowId, column: editing.column, value, previous });
    if (moveDown) moveActiveCell(1, 0);
    focusGrid();
  };

  /* ---------- column widths, order, pinning ---------- */
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const column of columns) initial[column.key] = column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH;
    return initial;
  });
  useEffect(() => {
    setColumnWidths((current) => {
      let changed = false;
      const next = { ...current };
      for (const column of columns) {
        if (next[column.key] === undefined) {
          next[column.key] = column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [columns]);

  const hasSelectColumn = selectable === 'row';
  const colCount = (hasSelectColumn ? 1 : 0) + columns.length;
  const gridTemplateColumns = [
    hasSelectColumn ? 'var(--size-target-min)' : null,
    ...columns.map((column) => `${columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH}px`),
  ]
    .filter(Boolean)
    .join(' ');

  /** Pinned columns are assumed contiguous from the start/end of `columns`; the auto-added select
   * column never pins (the schema has no such switch for it). */
  const leftOffset = (key: string): number => {
    let sum = 0;
    for (const column of columns) {
      if (column.key === key) break;
      if (column.pinned === 'start') sum += columnWidths[column.key] ?? 0;
    }
    return sum;
  };
  const rightOffset = (key: string): number => {
    let sum = 0;
    for (let i = columns.length - 1; i >= 0; i -= 1) {
      const column = columns[i];
      if (column!.key === key) break;
      if (column!.pinned === 'end') sum += columnWidths[column!.key] ?? 0;
    }
    return sum;
  };
  const pinnedStyle = (column: DataGridColumn): CSSProperties | undefined => {
    if (!column.pinned) return undefined;
    return column.pinned === 'start'
      ? { position: 'sticky', insetInlineStart: leftOffset(column.key), zIndex: 'var(--layer-raised)' as unknown as number }
      : { position: 'sticky', insetInlineEnd: rightOffset(column.key), zIndex: 'var(--layer-raised)' as unknown as number };
  };

  const startResize = (column: DataGridColumn, event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH;
    const handleMove = (moveEvent: MouseEvent) => {
      const width = Math.max(column.minWidth ?? MIN_COLUMN_WIDTH, startWidth + (moveEvent.clientX - startX));
      setColumnWidths((current) => ({ ...current, [column.key]: width }));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      onColumnResize?.({ column: column.key, width: columnWidths[column.key] ?? startWidth });
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const resizeByKeyboard = (column: DataGridColumn, delta: number) => {
    const width = Math.max(column.minWidth ?? MIN_COLUMN_WIDTH, (columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH) + delta);
    setColumnWidths((current) => ({ ...current, [column.key]: width }));
    onColumnResize?.({ column: column.key, width });
  };

  /* ---------- row height measurement (density is CSS-driven; JS needs the resolved pixel value
     for virtualization arithmetic, so it is measured rather than assumed) ---------- */
  const [rowHeightPx, setRowHeightPx] = useState(32);
  useLayoutEffect(() => {
    const sizer = sizerRef.current;
    if (!sizer || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setRowHeightPx(entry!.contentRect.height || 32));
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [density]);

  /* ---------- resize step measurement (resizeStep is a token/overridable binding, not a JS
     constant; measured the same way as row height so `overrides.resizeStep` takes effect) ---------- */
  const [resizeStepPx, setResizeStepPx] = useState(DEFAULT_RESIZE_STEP_PX);
  useLayoutEffect(() => {
    const sizer = resizeStepSizerRef.current;
    if (!sizer || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setResizeStepPx(entry!.contentRect.width || DEFAULT_RESIZE_STEP_PX));
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [overrides]);

  /* ---------- virtualization ---------- */
  const virtualize = height !== 'content';
  const totalRows = rowCount ?? sortedData.length;
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  useLayoutEffect(() => {
    const region = scrollRegionRef.current;
    if (!region || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setViewportHeight(entry!.contentRect.height));
    observer.observe(region);
    return () => observer.disconnect();
  }, []);

  const pageSize = Math.max(1, Math.ceil((viewportHeight || rowHeightPx * 10) / rowHeightPx));
  const startIndex = virtualize ? Math.max(0, Math.floor(scrollTop / rowHeightPx) - pageSize) : 0;
  const endIndex = virtualize
    ? Math.min(sortedData.length - 1, Math.floor(scrollTop / rowHeightPx) + pageSize * 2)
    : sortedData.length - 1;

  const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
  const [scrolledHorizontally, setScrolledHorizontally] = useState(false);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    setScrolledUnderHeader(event.currentTarget.scrollTop > 0);
    setScrolledHorizontally(event.currentTarget.scrollLeft > 0);
  };

  const requestedRangeRef = useRef(-1);
  useEffect(() => {
    if (!onRangeNeeded || rowCount === undefined || rowCount <= sortedData.length) return;
    if (endIndex >= sortedData.length - 1 && requestedRangeRef.current < sortedData.length) {
      requestedRangeRef.current = sortedData.length;
      onRangeNeeded({ start: sortedData.length, end: Math.min(rowCount, sortedData.length + pageSize) });
    }
  }, [endIndex, sortedData.length, rowCount, pageSize, onRangeNeeded]);

  /* ---------- focus (roving via aria-activedescendant; real focus only for controls/editors) ---------- */
  const [activeCell, setActiveCell] = useState<ActiveCell>({ row: -1, col: 0 });

  const cellId = (row: number, col: number) => (row === -1 ? `${baseId}-header-cell-${col}` : `${baseId}-cell-${row}-${col}`);
  const activeDescendantId = editing ? undefined : cellId(activeCell.row, activeCell.col);

  const columnAtIndex = (col: number): DataGridColumn | 'select' | undefined => {
    if (hasSelectColumn && col === 0) return 'select';
    return columns[col - (hasSelectColumn ? 1 : 0)];
  };

  const scrollRowIntoView = (rowIndex: number) => {
    const region = scrollRegionRef.current;
    if (!region || !virtualize) return;
    const top = rowIndex * rowHeightPx;
    const bottom = top + rowHeightPx;
    if (top < region.scrollTop) region.scrollTop = top;
    else if (bottom > region.scrollTop + region.clientHeight) region.scrollTop = bottom - region.clientHeight;
  };

  const applyFocusForSelectable = (row: number, col: number) => {
    if (row < 0) return;
    const column = columnAtIndex(col);
    if (!column || column === 'select') return;
    const rowId = sortedData[row]?.id;
    if (!rowId) return;
    if (selectable === 'cell') {
      const next = { rowId, column: column.key };
      setCellSelection(next);
      onSelectionChange?.(next);
    } else if (selectable === 'range') {
      const next = { rowId, column: column.key };
      anchorRef.current = next;
      commitRangeSelection({ from: next, to: next });
    }
  };

  const moveActiveCell = (deltaRow: number, deltaCol: number, extend = false) => {
    setActiveCell((current) => {
      const nextRow = Math.max(-1, Math.min(sortedData.length - 1, current.row + deltaRow));
      const nextCol = Math.max(0, Math.min(colCount - 1, current.col + deltaCol));
      if (extend && selectable === 'range' && anchorRef.current) {
        const column = columnAtIndex(nextCol);
        if (nextRow >= 0 && column && column !== 'select') {
          const rowId = sortedData[nextRow]?.id;
          if (rowId) commitRangeSelection({ from: anchorRef.current, to: { rowId, column: column.key } });
        }
      } else {
        applyFocusForSelectable(nextRow, nextCol);
      }
      if (nextRow >= 0) scrollRowIntoView(nextRow);
      return { row: nextRow, col: nextCol };
    });
  };

  const setActiveCellTo = (row: number, col: number, extend = false) => {
    if (extend && selectable === 'range' && anchorRef.current) {
      const column = columnAtIndex(col);
      if (row >= 0 && column && column !== 'select') {
        const rowId = sortedData[row]?.id;
        if (rowId) commitRangeSelection({ from: anchorRef.current, to: { rowId, column: column.key } });
      }
    } else {
      applyFocusForSelectable(row, col);
    }
    if (row >= 0) scrollRowIntoView(row);
    setActiveCell({ row, col });
  };

  /* ---------- copy / clear ---------- */
  const copySelectionAsTsv = async () => {
    if (selectable !== 'range' || !rangeSelection) return;
    const fromRow = sortedData.findIndex((row) => row.id === rangeSelection.from.rowId);
    const toRow = sortedData.findIndex((row) => row.id === rangeSelection.to.rowId);
    const fromCol = columns.findIndex((column) => column.key === rangeSelection.from.column);
    const toCol = columns.findIndex((column) => column.key === rangeSelection.to.column);
    const rowStart = Math.min(fromRow, toRow);
    const rowEnd = Math.max(fromRow, toRow);
    const colStart = Math.min(fromCol, toCol);
    const colEnd = Math.max(fromCol, toCol);
    if (rowStart < 0 || colStart < 0) return;
    const spanColumns = columns.slice(colStart, colEnd + 1);
    const wholeColumns = rowStart === 0 && rowEnd === sortedData.length - 1;
    const lines: string[] = [];
    if (wholeColumns) lines.push(spanColumns.map((column) => column.header).join('\t'));
    for (let r = rowStart; r <= rowEnd; r += 1) {
      const row = sortedData[r];
      if (!row) continue;
      lines.push(spanColumns.map((column) => cellText(column, row)).join('\t'));
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      // Clipboard API can be unavailable (insecure context, permissions); nothing further to do.
    }
    announce(interpolate(COPY.copied, { cells: (rowEnd - rowStart + 1) * (colEnd - colStart + 1) }));
  };

  const clearSelectionValues = () => {
    if (!editable) return;
    const targets: DataGridCellRef[] = [];
    if (selectable === 'row') {
      for (const id of selectedIds) for (const column of columns) if (column.editable) targets.push({ rowId: id, column: column.key });
    } else if (selectable === 'cell' && cellSelection) {
      targets.push(cellSelection);
    } else if (selectable === 'range' && rangeSelection) {
      const fromRow = sortedData.findIndex((row) => row.id === rangeSelection.from.rowId);
      const toRow = sortedData.findIndex((row) => row.id === rangeSelection.to.rowId);
      const fromCol = columns.findIndex((column) => column.key === rangeSelection.from.column);
      const toCol = columns.findIndex((column) => column.key === rangeSelection.to.column);
      for (let r = Math.min(fromRow, toRow); r <= Math.max(fromRow, toRow); r += 1) {
        for (let c = Math.min(fromCol, toCol); c <= Math.max(fromCol, toCol); c += 1) {
          const column = columns[c];
          const row = sortedData[r];
          if (column?.editable && row) targets.push({ rowId: row.id, column: column.key });
        }
      }
    }
    for (const target of targets) {
      const column = columns.find((entry) => entry.key === target.column);
      const row = sortedData.find((entry) => entry.id === target.rowId);
      if (!column || !row) continue;
      onCellChange?.({ rowId: target.rowId, column: target.column, value: undefined, previous: cellValue(column, row) });
    }
  };

  /* ---------- keyboard model ---------- */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (editing) return; // the open editor owns its own keys (see the editor wrapper below)
    const { row, col } = activeCell;
    const column = columnAtIndex(col);

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        moveActiveCell(0, 1, event.shiftKey);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        moveActiveCell(0, -1, event.shiftKey);
        return;
      case 'ArrowDown':
        event.preventDefault();
        moveActiveCell(1, 0, event.shiftKey);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveActiveCell(-1, 0, event.shiftKey);
        return;
      case 'Home':
        // Only Shift+Arrow is in the keyboard model's extend list; Home/End always just move.
        event.preventDefault();
        if (event.ctrlKey) setActiveCellTo(-1, 0);
        else setActiveCellTo(row, 0);
        return;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) setActiveCellTo(sortedData.length - 1, colCount - 1);
        else setActiveCellTo(row, colCount - 1);
        return;
      case 'PageDown':
        event.preventDefault();
        moveActiveCell(pageSize, 0);
        return;
      case 'PageUp':
        event.preventDefault();
        moveActiveCell(-pageSize, 0);
        return;
      case 'Enter':
        event.preventDefault();
        if (row === -1) {
          if (column && column !== 'select' && column.sortable) handleSort(column);
          return;
        }
        if (column && column !== 'select') {
          if (editable && column.editable) {
            openEditor(sortedData[row]!.id, column.key);
          } else {
            activateCellControl(row, col);
          }
        }
        return;
      case 'F2':
        event.preventDefault();
        if (row >= 0 && column && column !== 'select' && editable && column.editable) {
          openEditor(sortedData[row]!.id, column.key);
        }
        return;
      case 'Escape':
        if (selectable === 'range' && rangeSelection) {
          event.preventDefault();
          setRangeSelection(undefined);
          onSelectionChange?.([]);
        }
        return;
      case ' ':
        if (selectable === 'row' || selectable === 'range') {
          event.preventDefault();
          if (row < 0) return;
          const rowId = sortedData[row]?.id;
          if (!rowId) return;
          if (selectable === 'row') {
            if (event.shiftKey && anchorRef.current) {
              const anchorRow = sortedData.findIndex((entry) => entry.id === anchorRef.current!.rowId);
              const lo = Math.min(anchorRow, row);
              const hi = Math.max(anchorRow, row);
              commitRowSelection(sortedData.slice(lo, hi + 1).map((entry) => entry.id));
            } else {
              anchorRef.current = { rowId, column: column && column !== 'select' ? column.key : columns[0]?.key ?? '' };
              toggleRow(rowId);
            }
          } else if (event.ctrlKey && column && column !== 'select') {
            commitRangeSelection({ from: { rowId: sortedData[0]!.id, column: column.key }, to: { rowId: sortedData[sortedData.length - 1]!.id, column: column.key } });
          }
        }
        return;
      case 'a':
      case 'A':
        if (event.ctrlKey && (selectable === 'row' || selectable === 'range')) {
          event.preventDefault();
          if (selectable === 'row') commitRowSelection(allIds);
          else if (columns.length > 0 && sortedData.length > 0) {
            commitRangeSelection({
              from: { rowId: sortedData[0]!.id, column: columns[0]!.key },
              to: { rowId: sortedData[sortedData.length - 1]!.id, column: columns[columns.length - 1]!.key },
            });
          }
        }
        return;
      case 'c':
      case 'C':
        if (event.ctrlKey && selectable === 'range') {
          event.preventDefault();
          void copySelectionAsTsv();
        }
        return;
      case 'Delete':
      case 'Backspace':
        if (editable && (selectedIds.length > 0 || cellSelection || rangeSelection)) {
          event.preventDefault();
          clearSelectionValues();
        }
        return;
      default:
    }
  };

  const activateCellControl = (row: number, col: number) => {
    const element = cellRefs.current.get(`${sortedData[row]?.id}:${columnAtIndex(col) !== 'select' ? (columnAtIndex(col) as DataGridColumn)?.key : ''}`);
    const control = element?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    control?.focus();
    control?.click();
  };

  /* ---------- editor wrapper: owns Enter/F2/Escape while editing, stops the rest from reaching
     the grid's own keyboard model ---------- */
  const handleEditorWrapperKeyDown = (column: DataGridColumn) => (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitEditWithValue(editingValueRef.current, true);
    } else if (event.key === 'F2') {
      event.preventDefault();
      commitEditWithValue(editingValueRef.current, false);
    } else if (event.key === 'Escape' && (column.editor === 'text' || column.editor === 'number' || column.editor === undefined)) {
      event.preventDefault();
      cancelEdit();
    }
    event.stopPropagation();
  };

  const handleEditorBlur = () => {
    if (isEditingRef.current) commitEditWithValue(editingValueRef.current, false);
  };

  /* ---------- range overlay ---------- */
  const [overlayRect, setOverlayRect] = useState<CSSProperties | undefined>();
  useLayoutEffect(() => {
    if (selectable !== 'range' || !rangeSelection) {
      setOverlayRect(undefined);
      return;
    }
    const scrollEl = scrollRegionRef.current;
    const fromEl = cellRefs.current.get(`${rangeSelection.from.rowId}:${rangeSelection.from.column}`);
    const toEl = cellRefs.current.get(`${rangeSelection.to.rowId}:${rangeSelection.to.column}`);
    if (!scrollEl || !fromEl || !toEl) {
      setOverlayRect(undefined);
      return;
    }
    const scrollRect = scrollEl.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const left = Math.min(a.left, b.left) - scrollRect.left + scrollEl.scrollLeft;
    const top = Math.min(a.top, b.top) - scrollRect.top + scrollEl.scrollTop;
    const right = Math.max(a.right, b.right) - scrollRect.left + scrollEl.scrollLeft;
    const bottom = Math.max(a.bottom, b.bottom) - scrollRect.top + scrollEl.scrollTop;
    setOverlayRect({ insetInlineStart: left, insetBlockStart: top, inlineSize: right - left, blockSize: bottom - top });
    // Recomputed on every render of the visible window (rows recycle under virtualization).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectable, rangeSelection, startIndex, endIndex, scrollTop]);

  /* ---------- mouse selection (range drag) ---------- */
  const draggingRef = useRef(false);
  useEffect(() => {
    const handleUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, []);

  const handleCellMouseDown = (rowIndex: number, colIndex: number) => {
    focusGrid();
    setActiveCell({ row: rowIndex, col: colIndex });
    const column = columnAtIndex(colIndex);
    if (!column || column === 'select') return;
    const rowId = sortedData[rowIndex]?.id;
    if (!rowId) return;
    if (selectable === 'cell') {
      const next = { rowId, column: column.key };
      setCellSelection(next);
      onSelectionChange?.(next);
    } else if (selectable === 'range') {
      anchorRef.current = { rowId, column: column.key };
      draggingRef.current = true;
      commitRangeSelection({ from: anchorRef.current, to: anchorRef.current });
    }
  };

  const handleCellMouseEnter = (rowIndex: number, colIndex: number) => {
    if (!draggingRef.current || selectable !== 'range' || !anchorRef.current) return;
    const column = columnAtIndex(colIndex);
    if (!column || column === 'select') return;
    const rowId = sortedData[rowIndex]?.id;
    if (!rowId) return;
    commitRangeSelection({ from: anchorRef.current, to: { rowId, column: column.key } });
  };

  /* ---------- editors ---------- */
  const renderEditor = (column: DataGridColumn, row: DataGridRow) => {
    const editorName = `${baseId}-editor-${row.id}-${column.key}`;
    switch (column.editor) {
      case 'number':
        return (
          <NumberInput
            label={column.header}
            name={editorName}
            value={typeof editingValue === 'number' ? editingValue : undefined}
            error={editingError}
            autoFocus
            onChange={(value) => updateEditingValue(value)}
          />
        );
      case 'select':
        return (
          <Select
            label={column.header}
            name={editorName}
            options={column.options ?? []}
            value={typeof editingValue === 'string' ? editingValue : ''}
            error={editingError}
            container={container}
            onChange={(value) => {
              updateEditingValue(value);
              commitEditWithValue(value, true);
            }}
          />
        );
      case 'date':
        return (
          <DatePicker
            label={column.header}
            name={editorName}
            value={typeof editingValue === 'string' ? (editingValue as DatePickerValue) : undefined}
            error={editingError}
            container={container}
            onChange={(value) => {
              updateEditingValue(value);
              if (value !== undefined) commitEditWithValue(value, true);
            }}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={column.header}
            name={editorName}
            checked={Boolean(editingValue)}
            onChange={(checked) => {
              updateEditingValue(checked);
              commitEditWithValue(checked, true);
            }}
          />
        );
      case 'text':
      default:
        return (
          <Input
            label={column.header}
            name={editorName}
            value={typeof editingValue === 'string' ? editingValue : ''}
            error={editingError}
            autoFocus
            onChange={(value) => updateEditingValue(value)}
          />
        );
    }
  };

  /* ---------- render: header ---------- */
  const renderResizeHandle = (column: DataGridColumn) => (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(columnWidths[column.key] ?? DEFAULT_COLUMN_WIDTH)}
      aria-label={interpolate(COPY.resize, { column: column.header })}
      tabIndex={-1}
      className="ds-data-grid__resize-handle"
      data-part="resizeHandle"
      onMouseDown={(event) => startResize(column, event)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          resizeByKeyboard(column, -resizeStepPx);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          resizeByKeyboard(column, resizeStepPx);
        } else if (event.key === 'Escape') {
          focusGrid();
        }
        event.stopPropagation();
      }}
    />
  );

  const renderHeaderCell = (column: DataGridColumn, index: number) => {
    const colIndex = index + (hasSelectColumn ? 1 : 0);
    const isActive = activeCell.row === -1 && activeCell.col === colIndex;
    const sorted = column.sortable ? activeSort?.column === column.key : undefined;
    const classes = [
      'ds-data-grid__cell',
      'ds-data-grid__cell--header',
      alignClass(column),
      column.pinned ? `ds-data-grid__cell--pinned-${column.pinned}` : null,
      column.pinned && scrolledHorizontally ? 'ds-data-grid__cell--pinned-shadow' : null,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        key={column.key}
        id={cellId(-1, colIndex)}
        role="columnheader"
        aria-colindex={colIndex + 1}
        aria-sort={column.sortable ? (sorted ? (activeSort as DataGridSortState).direction : 'none') : undefined}
        data-part="columnHeader"
        data-active={isActive ? 'true' : undefined}
        className={classes}
        style={pinnedStyle(column)}
        onMouseDown={() => {
          focusGrid();
          setActiveCell({ row: -1, col: colIndex });
        }}
      >
        {column.sortable ? (
          <Button
            variant="ghost"
            size="sm"
            label={sortButtonLabel(column, activeSort)}
            trailingIcon={<Icon name={sorted && activeSort?.direction === 'descending' ? 'chevron-down' : 'chevron-up'} inline />}
            className="ds-data-grid__sort-button"
            data-part="sortButton"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleSort(column)}
          />
        ) : column.abbr ? (
          <>
            <span aria-hidden="true">{column.abbr}</span>
            <span className="ds-data-grid__visually-hidden">{column.header}</span>
          </>
        ) : (
          column.header
        )}
        {column.resizable ? renderResizeHandle(column) : null}
      </div>
    );
  };

  /* ---------- render: body ---------- */
  const renderCell = (row: DataGridRow, rowIndex: number, column: DataGridColumn, colIndex: number) => {
    const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
    const isEditingThis = editing?.rowId === row.id && editing.column === column.key;
    const isSelected =
      selectable === 'cell'
        ? cellSelection?.rowId === row.id && cellSelection.column === column.key
        : selectable === 'range' && rangeSelection
          ? isWithinRange(sortedData, columns, rangeSelection, row.id, column.key)
          : false;
    const classes = [
      'ds-data-grid__cell',
      alignClass(column),
      column.pinned ? `ds-data-grid__cell--pinned-${column.pinned}` : null,
      column.pinned && scrolledHorizontally ? 'ds-data-grid__cell--pinned-shadow' : null,
      isSelected ? 'ds-data-grid__cell--selected' : null,
      isEditingThis ? 'ds-data-grid__cell--editing' : null,
      isEditingThis && editingError ? 'ds-data-grid__cell--invalid' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const role = column.isRowHeader ? 'rowheader' : 'gridcell';
    return (
      <div
        key={column.key}
        id={cellId(rowIndex, colIndex)}
        ref={(node) => {
          if (node) cellRefs.current.set(`${row.id}:${column.key}`, node);
          else cellRefs.current.delete(`${row.id}:${column.key}`);
        }}
        role={role}
        aria-colindex={colIndex + 1}
        aria-selected={selectable === 'cell' || selectable === 'range' ? (isSelected ? 'true' : 'false') : undefined}
        tabIndex={-1}
        data-part={column.isRowHeader ? 'rowHeader' : 'cell'}
        data-active={isActive ? 'true' : undefined}
        className={classes}
        style={pinnedStyle(column)}
        onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
        onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
        onDoubleClick={() => {
          if (editable && column.editable) openEditor(row.id, column.key);
        }}
      >
        {isEditingThis ? (
          <div
            className="ds-data-grid__editor"
            data-part="editor"
            onKeyDown={handleEditorWrapperKeyDown(column)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) handleEditorBlur();
            }}
          >
            {renderEditor(column, row)}
          </div>
        ) : column.render ? (
          <div className="ds-data-grid__cell-content" data-part="cellContent">
            {column.render(row)}
          </div>
        ) : (
          <span className="ds-data-grid__cell-content" data-part="cellContent">
            {cellText(column, row)}
          </span>
        )}
      </div>
    );
  };

  const renderRow = (row: DataGridRow, rowIndex: number) => {
    const isSelected = selectable === 'row' && selectedSet.has(row.id);
    const style: CSSProperties = { gridTemplateColumns };
    if (virtualize) {
      style.position = 'absolute';
      style.insetBlockStart = 0;
      style.insetInlineStart = 0;
      style.inlineSize = '100%';
      style.transform = `translateY(${rowIndex * rowHeightPx}px)`;
    }
    return (
      <div
        key={row.id}
        role="row"
        aria-rowindex={rowIndex + 2}
        aria-selected={selectable === 'row' ? (isSelected ? 'true' : 'false') : undefined}
        className={['ds-data-grid__row', isSelected ? 'ds-data-grid__row--selected' : null].filter(Boolean).join(' ')}
        data-part="row"
        style={style}
      >
        {hasSelectColumn ? (
          <div role="gridcell" aria-colindex={1} className="ds-data-grid__cell ds-data-grid__cell--select" data-part="selectCell">
            <Checkbox
              label={interpolate(COPY.selectRow, { rowName: rowName(row, rowHeaderColumn) })}
              name={`${baseId}-select-${row.id}`}
              checked={isSelected}
              onChange={() => toggleRow(row.id)}
            />
          </div>
        ) : null}
        {columns.map((column, index) => renderCell(row, rowIndex, column, index + (hasSelectColumn ? 1 : 0)))}
      </div>
    );
  };

  const classes = [
    'ds-data-grid',
    `ds-data-grid--density-${density}`,
    `ds-data-grid--height-${height}`,
    stickyHeader ? 'ds-data-grid--sticky-header' : null,
    scrolledUnderHeader ? 'ds-data-grid--scrolled-under-header' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const { rootStyle, captionOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, captionOverrides: { marginBlockEnd: 'space.0' } as Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const visibleRows = sortedData.slice(startIndex, endIndex + 1);

  const statusText = loading
    ? COPY.loading
    : editingError
      ? interpolate(COPY.invalid, { message: editingError })
      : announcement ||
        (selectable === 'row' && selectedIds.length > 0
          ? interpolate(COPY.selectedRows, { count: selectedIds.length, total: sortedData.length })
          : selectable === 'range' && rangeSelection
            ? announcement
            : interpolate(COPY.rowCount, { count: totalRows }));

  return (
    <div {...rest} ref={rootRef} data-ds="DataGrid" data-part="container" className={classes} style={mergedStyle}>
      <div
        id={captionId}
        data-part="caption"
        className={hideCaption ? 'ds-data-grid__visually-hidden' : 'ds-data-grid__caption'}
      >
        <Heading level={2} size="md" overrides={captionOverrides}>
          {caption}
        </Heading>
      </div>
      <div
        ref={scrollRegionRef}
        role="grid"
        data-part="scrollRegion"
        className="ds-data-grid__scroll-region"
        aria-labelledby={captionId}
        aria-rowcount={totalRows + 1}
        aria-colcount={colCount}
        aria-multiselectable={selectable === 'row' || selectable === 'range' ? 'true' : undefined}
        aria-readonly={!editable ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={statusBarId}
        tabIndex={0}
        aria-activedescendant={activeDescendantId}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
      >
        <div ref={sizerRef} aria-hidden="true" className="ds-data-grid__row-sizer" />
        <div ref={resizeStepSizerRef} aria-hidden="true" className="ds-data-grid__resize-step-sizer" />
        <div
          role="rowgroup"
          data-part="header"
          className={stickyHeader ? 'ds-data-grid__header ds-data-grid__header--sticky' : 'ds-data-grid__header'}
        >
          <div role="row" aria-rowindex={1} className="ds-data-grid__row ds-data-grid__row--header" data-part="headerRow" style={{ gridTemplateColumns }}>
            {hasSelectColumn ? (
              <div
                role="columnheader"
                aria-colindex={1}
                id={cellId(-1, 0)}
                data-part="selectAllCell"
                data-active={activeCell.row === -1 && activeCell.col === 0 ? 'true' : undefined}
                className="ds-data-grid__cell ds-data-grid__cell--header ds-data-grid__cell--select"
                onMouseDown={() => {
                  focusGrid();
                  setActiveCell({ row: -1, col: 0 });
                }}
              >
                <Checkbox
                  label={COPY.selectAll}
                  name={`${baseId}-select-all`}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={handleToggleAll}
                />
              </div>
            ) : null}
            {columns.map((column, index) => renderHeaderCell(column, index))}
          </div>
        </div>
        <div role="rowgroup" data-part="body" className="ds-data-grid__body">
          {sortedData.length === 0 ? (
            <div role="row" className="ds-data-grid__row">
              <div role="gridcell" className="ds-data-grid__empty" style={{ gridColumn: `1 / span ${colCount}` }}>
                <Text element="p" tone="muted" data-part="emptyState">
                  {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
                </Text>
              </div>
            </div>
          ) : virtualize ? (
            <div className="ds-data-grid__spacer" style={{ position: 'relative', blockSize: totalRows * rowHeightPx }}>
              {visibleRows.map((row, i) => renderRow(row, startIndex + i))}
            </div>
          ) : (
            visibleRows.map((row, i) => renderRow(row, i))
          )}
          {overlayRect ? <div aria-hidden="true" className="ds-data-grid__range-overlay" data-part="rangeOverlay" style={overlayRect} /> : null}
        </div>
      </div>
      {showStatusBar ? (
        <div id={statusBarId} role="status" aria-live="polite" className="ds-data-grid__status-bar" data-part="statusBar">
          <Text size="xs" tone="muted">
            {statusText}
          </Text>
        </div>
      ) : (
        <span id={statusBarId} role="status" aria-live="polite" className="ds-data-grid__visually-hidden">
          {announcement}
        </span>
      )}
    </div>
  );
};

function isWithinRange(
  data: DataGridRow[],
  columns: DataGridColumn[],
  range: DataGridRangeRef,
  rowId: string,
  columnKey: string,
): boolean {
  const rowIndex = data.findIndex((row) => row.id === rowId);
  const fromRow = data.findIndex((row) => row.id === range.from.rowId);
  const toRow = data.findIndex((row) => row.id === range.to.rowId);
  const colIndex = columns.findIndex((column) => column.key === columnKey);
  const fromCol = columns.findIndex((column) => column.key === range.from.column);
  const toCol = columns.findIndex((column) => column.key === range.to.column);
  if (rowIndex < 0 || fromRow < 0 || toRow < 0 || colIndex < 0 || fromCol < 0 || toCol < 0) return false;
  return (
    rowIndex >= Math.min(fromRow, toRow) &&
    rowIndex <= Math.max(fromRow, toRow) &&
    colIndex >= Math.min(fromCol, toCol) &&
    colIndex <= Math.max(fromCol, toCol)
  );
}
