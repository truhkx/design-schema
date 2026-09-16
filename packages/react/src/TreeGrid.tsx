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
  type Ref,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button, type ButtonOverridableBinding } from './Button';
import { Checkbox } from './Checkbox';
import type { DataGridColumn } from './DataGrid';
import { DatePicker, type DatePickerValue } from './DatePicker';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text } from './Text';
import './TreeGrid.css';

export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';
export type TreeGridSortDirection = 'ascending' | 'descending';

/** A row's children: a loaded subtree, or `"lazy"` (loaded on first expand through `onExpand`). */
export type TreeGridChildren = TreeGridRow[] | 'lazy';

/** `TreeRow = { id: string; children?: TreeRow[] | "lazy"; [key: string]: unknown }` */
export interface TreeGridRow {
  id: string;
  children?: TreeGridChildren | undefined;
  [key: string]: unknown;
}

/** `{ column: string; direction: "ascending" | "descending" }` */
export interface TreeGridSortState {
  column: string;
  direction: TreeGridSortDirection;
}

export type TreeGridCellRef = { rowId: string; column: string };
/** Row ids, or one cell, matching `selectable`. */
export type TreeGridSelection = string[] | TreeGridCellRef;
/** A committed or previous cell value, as the column editor produces it. */
export type TreeGridCellValue = string | number | boolean;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are locked. */
export type TreeGridOverridableBinding = 'indent' | 'expandGap' | 'guideLine' | 'guideLineWidth' | 'parentWeight' | 'transition';

const OVERRIDE_HOOKS: Record<TreeGridOverridableBinding, string> = {
  indent: '--ds-tree-grid-indent',
  expandGap: '--ds-tree-grid-expand-gap',
  guideLine: '--ds-tree-grid-guide-line',
  guideLineWidth: '--ds-tree-grid-guide-line-width',
  parentWeight: '--ds-tree-grid-parent-weight',
  transition: '--ds-tree-grid-transition',
};

/** copy.* — verbatim. */
const COPY = {
  expand: 'Expand {rowName}',
  collapse: 'Collapse {rowName}',
  loading: 'Loading',
  empty: 'Nothing to show.',
  sortAscending: 'Sort by {column}, ascending',
  sortDescending: 'Sort by {column}, descending',
  sortedAnnouncement: 'Sorted by {column}, {direction}',
  selectAll: 'Select all rows',
  selectRow: 'Select {rowName}',
  selectedRows: '{count} of {total} rows selected',
  editing: 'Editing {column}. Enter to save, Escape to cancel.',
  invalid: '{message}',
  rowCount: { one: '{count} row', other: '{count} rows' },
  position: 'Row {row}, {column}',
  resize: 'Resize {column}',
  scrollHint: 'Scroll sideways to see more columns',
} as const;

/** The column width when `width` is omitted (DataGrid's schema default). */
const DEFAULT_COLUMN_WIDTH = 160; // literal-ok: schema default column width, in CSS pixels
/** Rows rendered before one row has been measured (a row count, not a size). */
const UNMEASURED_ROW_LIMIT = 50;
/** The selection column: a minimum target plus the cell's own inline padding on both sides. */
const SELECT_COLUMN_SIZE = 'calc(var(--size-target-min) + 2 * var(--ds-tree-grid-cell-padding-inline))';
/** The row block size for the density (set in CSS from size.target.min / size.target.comfortable). */
const ROW_SIZE = 'var(--ds-tree-grid-row-size)';
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Interactive content a cell's `render` may hold, whatever its tabindex. */
const CONTROL_SELECTOR = 'a[href], button, input, select, textarea, [contenteditable="true"]';
const NAVIGATION_KEYS = new Set(['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']);
const PLACEHOLDER_PREFIX = 'ds-tree-grid-loading:';

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

function toCellValue(value: unknown): TreeGridCellValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return value === undefined || value === null ? '' : String(value);
}

function joinClasses(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** A row shows the expand control when its children are lazy or a non-empty loaded list. */
function hasChildren(row: TreeGridRow): boolean {
  return row.children === 'lazy' || (Array.isArray(row.children) && row.children.length > 0);
}

/** Every loaded descendant id (a `"lazy"` subtree contributes nothing). O(subtree). */
function descendantIds(row: TreeGridRow): string[] {
  if (!Array.isArray(row.children)) return [];
  const ids: string[] = [];
  const walk = (list: TreeGridRow[]): void => {
    for (const child of list) {
      ids.push(child.id);
      if (Array.isArray(child.children)) walk(child.children);
    }
  };
  walk(row.children);
  return ids;
}

/** `["*"]` stands for every loaded row that has loaded children. */
function resolveExpanded(ids: string[], data: TreeGridRow[]): string[] {
  if (!ids.includes('*')) return ids;
  const resolved = ids.filter((id) => id !== '*');
  const walk = (list: TreeGridRow[]): void => {
    for (const row of list) {
      if (Array.isArray(row.children) && row.children.length > 0) {
        if (!resolved.includes(row.id)) resolved.push(row.id);
        walk(row.children);
      }
    }
  };
  walk(data);
  return resolved;
}

type VisibleRow = {
  key: string;
  row: TreeGridRow;
  level: number;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  parentId: string | null;
  placeholder: boolean;
};

export interface TreeGridProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the tree grid holds ("Chart of accounts"). The accessible name. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required here: it carries the indent and the expand
   * button, so it must exist and come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row whose children are loaded on first expand through `onExpand`;
   * the row shows the expand button and a loading state until `data` is updated. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded row. */
  defaultExpanded?: string[] | undefined;
  /** Sort applies within each level; siblings are ordered, hierarchy is kept. */
  sort?: TreeGridSortState | undefined;
  /** As DataGrid. */
  defaultSort?: TreeGridSortState | undefined;
  /** As DataGrid without `range` (rectangles across levels are not meaningful). `row` selection of a parent does
   * not select its children unless `selectChildren`. */
  selectable?: TreeGridSelectable | undefined;
  /** As DataGrid. */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a parent row sets or clears its own id and every loaded descendant; a parent's shown state is
   * derived from its loaded descendants (checked when all, indeterminate when some, else its own id). A `"lazy"`
   * subtree contributes nothing until loaded. Select-all covers every loaded row at every level. */
  selectChildren?: boolean | undefined;
  /** As DataGrid. */
  editable?: boolean | undefined;
  /** As DataGrid. */
  density?: TreeGridDensity | undefined;
  /** As DataGrid. */
  height?: TreeGridHeight | undefined;
  /** As DataGrid. */
  loading?: boolean | undefined;
  /** As DataGrid. */
  showStatusBar?: boolean | undefined;
  /** As DataGrid. */
  stickyHeader?: boolean | undefined;
  /** As DataGrid. */
  emptyMessage?: string | undefined;
  /** Portal target for the composed Select and DatePicker editors (default `document.body`). Platform prop. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides; each entry sets the matching `--ds-tree-grid-*` hook to that token. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids (the bare array, as Tree; not wrapped in an object). */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id (bare string) each time a row whose `children` is still `"lazy"` is expanded, so a failed
   * load can retry; once the caller replaces `children` it never fires again for that row. */
  onExpand?: ((id: string) => void) | undefined;
  /** As DataGrid. */
  onSortChange?: ((column: string, direction: TreeGridSortDirection) => void) | undefined;
  /** As DataGrid (row ids or one cell). */
  onSelectionChange?: ((selection: TreeGridSelection) => void) | undefined;
  /** As DataGrid. */
  onCellChange?: ((rowId: string, column: string, value: TreeGridCellValue, previous: TreeGridCellValue) => void) | undefined;
  /** As DataGrid; return false to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** As DataGrid. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
}

type Active = { key: string | null; col: number };
type Editing = { rowId: string; column: string };

/**
 * TreeGrid — Design Schema, category: data. APG treegrid built on DataGrid's structure.
 *
 * When to use: Use a TreeGrid when records nest and each record has several comparable fields: a chart of
 * accounts with balances, folders and files with sizes and dates, a bill of materials with quantities and costs,
 * an org chart with headcount. Use `children: "lazy"` for deep or large trees so the first paint is fast. Use
 * `selectChildren` when selection means "this and everything in it" (a folder to export).
 */
export function TreeGrid({
  ref,
  caption,
  hideCaption = false,
  columns,
  data,
  expanded,
  defaultExpanded,
  sort,
  defaultSort,
  selectable = 'none',
  selected,
  defaultSelected,
  selectChildren = false,
  editable = false,
  density = 'compact',
  height = 'viewport',
  loading = false,
  showStatusBar = true,
  stickyHeader = true,
  emptyMessage,
  container,
  overrides,
  onExpandChange,
  onExpand,
  onSortChange,
  onSelectionChange,
  onCellChange,
  onEditStart,
  onColumnResize,
  ...rest
}: TreeGridProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const baseId = `ds-tree-grid-${useId()}`;
  const captionId = `${baseId}-caption`;
  const statusId = `${baseId}-status`;
  const cellPrefix = `${baseId}-cell-`;
  const cellId = (row: number, col: number): string => `${cellPrefix}${row < 0 ? 'h' : row}_${col}`;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const targetSizerRef = useRef<HTMLSpanElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  /* ---------- development warnings (once) ---------- */
  const warnedRef = useRef(false);
  if (isDev && !warnedRef.current) {
    warnedRef.current = true;
    const rowHeaders = columns.filter((column) => column.isRowHeader).length;
    if (rowHeaders !== 1) console.warn(`TreeGrid: exactly one column must be \`isRowHeader\`; found ${rowHeaders}.`);
    else if (!columns[0]?.isRowHeader) console.warn('TreeGrid: the `isRowHeader` column must come first.');
  }

  /* ---------- columns ---------- */
  const hasSelectColumn = selectable === 'row';
  const colOffset = hasSelectColumn ? 1 : 0;
  const colCount = colOffset + columns.length;
  const dataColumnAt = (col: number): DataGridColumn | undefined => (col < colOffset ? undefined : columns[col - colOffset]);
  const rowHeaderIndex = columns.findIndex((column) => column.isRowHeader);
  const rowHeaderColumn = columns[rowHeaderIndex];
  const rowHeaderCol = rowHeaderIndex < 0 ? -1 : rowHeaderIndex + colOffset;

  const [resizedWidths, setResizedWidths] = useState<Record<string, number>>({});
  const widthOf = (column: DataGridColumn): number => resizedWidths[column.key] ?? column.width ?? DEFAULT_COLUMN_WIDTH;
  const gridTemplateColumns = [hasSelectColumn ? SELECT_COLUMN_SIZE : null, ...columns.map((column) => `${widthOf(column)}px`)]
    .filter(Boolean)
    .join(' ');

  const pinnedStyle = (column: DataGridColumn, index: number): CSSProperties | undefined => {
    if (column.pinned === 'start') {
      let before = 0;
      for (let i = 0; i < index; i += 1) before += widthOf(columns[i]!);
      return { insetInlineStart: hasSelectColumn ? `calc(${SELECT_COLUMN_SIZE} + ${before}px)` : `${before}px` };
    }
    if (column.pinned === 'end') {
      let after = 0;
      for (let i = index + 1; i < columns.length; i += 1) after += widthOf(columns[i]!);
      return { insetInlineEnd: `${after}px` };
    }
    return undefined;
  };

  /* ---------- tree lookups (O(n) walks of data) ---------- */
  const { rowById, parentById, loadedIds } = useMemo(() => {
    const byId = new Map<string, TreeGridRow>();
    const parents = new Map<string, string | null>();
    const ids: string[] = [];
    const walk = (list: TreeGridRow[], parentId: string | null): void => {
      for (const row of list) {
        byId.set(row.id, row);
        parents.set(row.id, parentId);
        ids.push(row.id);
        if (Array.isArray(row.children)) walk(row.children, row.id);
      }
    };
    walk(data, null);
    return { rowById: byId, parentById: parents, loadedIds: ids };
  }, [data]);
  const total = loadedIds.length;

  const [announcement, setAnnouncement] = useState('');

  /* ---------- expansion ---------- */
  const expandedControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(() => resolveExpanded(defaultExpanded ?? [], data));
  const expandedIds = useMemo(
    () => (expandedControlled ? resolveExpanded(expanded, data) : internalExpanded),
    [expandedControlled, expanded, data, internalExpanded],
  );
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  /* ---------- sort ---------- */
  const sortControlled = sort !== undefined;
  const [internalSort, setInternalSort] = useState<TreeGridSortState | undefined>(defaultSort);
  const activeSort = sortControlled ? sort : internalSort;

  const activateSort = (column: DataGridColumn): void => {
    const direction: TreeGridSortDirection =
      activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (!sortControlled) setInternalSort({ column: column.key, direction });
    onSortChange?.(column.key, direction);
    setAnnouncement(interpolate(COPY.sortedAnnouncement, { column: column.header, direction }));
  };

  /* ---------- the flattened visible-row list (what is virtualized and indexed) ---------- */
  const visible = useMemo(() => {
    const localSort = sortControlled ? undefined : activeSort;
    const list: VisibleRow[] = [];
    const walk = (rows: TreeGridRow[], level: number, parentId: string | null): void => {
      const siblings = localSort
        ? [...rows].sort(
            (a, b) => compareValues(a[localSort.column], b[localSort.column]) * (localSort.direction === 'ascending' ? 1 : -1),
          )
        : rows;
      siblings.forEach((row, index) => {
        const parent = hasChildren(row);
        list.push({ key: row.id, row, level, posinset: index + 1, setsize: siblings.length, hasChildren: parent, parentId, placeholder: false });
        if (!parent || !expandedSet.has(row.id)) return;
        if (row.children === 'lazy') {
          list.push({
            key: `${PLACEHOLDER_PREFIX}${row.id}`,
            row,
            level: level + 1,
            posinset: 1,
            setsize: 1,
            hasChildren: false,
            parentId: row.id,
            placeholder: true,
          });
        } else if (Array.isArray(row.children)) walk(row.children, level + 1, row.id);
      });
    };
    walk(data, 1, null);
    return list;
  }, [data, expandedSet, sortControlled, activeSort]);
  const visibleCount = visible.length;
  const indexByKey = useMemo(() => new Map(visible.map((entry, i) => [entry.key, i])), [visible]);

  /* ---------- active cell (aria-activedescendant), tracked by row so collapsing never moves it sideways ---------- */
  const [active, setActiveState] = useState<Active>({ key: null, col: 0 });
  const resolveIndex = (key: string | null): number => {
    let current = key;
    while (current !== null) {
      const index = indexByKey.get(current);
      if (index !== undefined) return index;
      current = current.startsWith(PLACEHOLDER_PREFIX)
        ? current.slice(PLACEHOLDER_PREFIX.length)
        : (parentById.get(current) ?? null);
    }
    return -1;
  };
  const activeRow = Math.min(resolveIndex(active.key), visibleCount - 1);
  const activeCol = Math.max(0, Math.min(active.col, colCount - 1));
  const activeEntry = activeRow >= 0 ? visible[activeRow] : undefined;
  const keyboardMoveRef = useRef(false);

  const commitExpanded = (next: string[], opened: string[]): void => {
    if (!expandedControlled) setInternalExpanded(next);
    for (const id of opened) if (rowById.get(id)?.children === 'lazy') onExpand?.(id);
    onExpandChange?.(next);
  };

  const toggleExpand = (id: string): void => {
    if (expandedSet.has(id)) {
      // Focus inside the collapsing subtree moves up to the collapsed row.
      let current = active.key;
      while (current !== null && current !== id) {
        current = current.startsWith(PLACEHOLDER_PREFIX) ? current.slice(PLACEHOLDER_PREFIX.length) : (parentById.get(current) ?? null);
      }
      if (current === id && active.key !== id) setActiveState({ key: id, col: active.col });
      commitExpanded(
        expandedIds.filter((existing) => existing !== id),
        [],
      );
    } else {
      commitExpanded([...expandedIds, id], [id]);
    }
  };

  const expandLevel = (entry: VisibleRow): void => {
    const siblings = entry.parentId === null ? data : rowById.get(entry.parentId)?.children;
    if (!Array.isArray(siblings)) return;
    const opened = siblings.filter((row) => hasChildren(row) && !expandedSet.has(row.id)).map((row) => row.id);
    if (opened.length > 0) commitExpanded([...expandedIds, ...opened], opened);
  };

  /* ---------- selection ---------- */
  const selectedControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = selectedControlled ? selected : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const rowAnchorRef = useRef<string | null>(null);

  const shownState = (row: TreeGridRow): 'checked' | 'mixed' | 'unchecked' => {
    if (selectChildren) {
      const descendants = descendantIds(row);
      if (descendants.length > 0) {
        const count = descendants.filter((id) => selectedSet.has(id)).length;
        if (count === descendants.length) return 'checked';
        if (count > 0) return 'mixed';
      }
    }
    return selectedSet.has(row.id) ? 'checked' : 'unchecked';
  };

  const commitRows = (ids: string[]): void => {
    if (!selectedControlled) setInternalSelected(ids);
    onSelectionChange?.(ids);
    setAnnouncement(interpolate(COPY.selectedRows, { count: ids.length, total }));
  };
  const toggleRow = (row: TreeGridRow): void => {
    rowAnchorRef.current = row.id;
    const ids = selectChildren ? [row.id, ...descendantIds(row)] : [row.id];
    const drop = new Set(ids);
    const kept = selectedIds.filter((id) => !drop.has(id));
    commitRows(shownState(row) === 'checked' ? kept : [...kept, ...ids]);
  };
  /** Shift+Space / Shift+click: anchor through target over the visible rows; never cascades. */
  const extendRows = (target: number): void => {
    const anchor = rowAnchorRef.current !== null ? indexByKey.get(rowAnchorRef.current) : undefined;
    const entry = visible[target];
    if (!entry || entry.placeholder) return;
    if (anchor === undefined) return toggleRow(entry.row);
    const span = visible
      .slice(Math.min(anchor, target), Math.max(anchor, target) + 1)
      .filter((item) => !item.placeholder)
      .map((item) => item.key);
    const inSpan = new Set(span);
    commitRows([...selectedIds.filter((id) => !inSpan.has(id)), ...span]);
  };
  const allSelected = total > 0 && loadedIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && loadedIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitRows(allSelected ? [] : loadedIds);

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
  let windowEnd = visibleCount - 1;
  if (virtualize) {
    if (measured) {
      const first = Math.floor(scrollTop / rowHeightPx);
      windowStart = Math.max(0, Math.min(first, visibleCount) - pageSize);
      windowEnd = Math.min(visibleCount - 1, first + 2 * pageSize + 1);
    } else {
      windowEnd = Math.min(visibleCount, UNMEASURED_ROW_LIMIT) - 1;
    }
  }
  const activeRendered = activeRow === -1 || (activeRow >= windowStart && activeRow <= windowEnd);

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
  }, [density, windowStart, visibleCount === 0, height, colCount]);

  const handleScroll = (): void => {
    const region = scrollRef.current;
    if (!region) return;
    setScrollTop((prev) => (prev === region.scrollTop ? prev : region.scrollTop));
    const x = region.scrollLeft !== 0;
    setScrolledX((prev) => (prev === x ? prev : x));
  };

  useLayoutEffect(() => {
    if (!keyboardMoveRef.current) return;
    keyboardMoveRef.current = false;
    const el = typeof document !== 'undefined' ? document.getElementById(cellId(activeRow, activeEntry?.placeholder ? 0 : activeCol)) : null;
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  });

  const focusGrid = (): void => gridRef.current?.focus();

  const moveTo = (row: number, col: number): void => {
    const r = Math.max(-1, Math.min(row, visibleCount - 1));
    const c = Math.max(0, Math.min(col, colCount - 1));
    const entry = r >= 0 ? visible[r] : undefined;
    keyboardMoveRef.current = true;
    setActiveState({ key: entry ? entry.key : null, col: c });
    setAnnouncement('');
    const region = scrollRef.current;
    if (region && virtualize && rowHeightPx > 0 && r >= 0) {
      const top = r * rowHeightPx;
      if (top < region.scrollTop) region.scrollTop = top;
      else if (top + rowHeightPx > region.scrollTop + viewportHeight - rowHeightPx) {
        region.scrollTop = top + 2 * rowHeightPx - viewportHeight;
      }
    }
    const column = dataColumnAt(c);
    if (selectable === 'cell' && column && entry && !entry.placeholder) onSelectionChange?.({ rowId: entry.key, column: column.key });
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

  const openEditor = (rowIndex: number, col: number): boolean => {
    const column = dataColumnAt(col);
    const entry = visible[rowIndex];
    if (!editable || !column?.editable || !entry || entry.placeholder) return false;
    if (onEditStart?.(entry.key, column.key) === false) return false;
    editValueRef.current = entry.row[column.key];
    pickerOpenRef.current = false;
    setActiveState({ key: entry.key, col });
    setEditing({ rowId: entry.key, column: column.key });
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
    const row = rowById.get(current.rowId);
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

  const editableCols = (): number[] => columns.flatMap((column, i) => (column.editable ? [i + colOffset] : []));

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
        if (!openEditor(row, next)) setActiveState({ key: visible[row]?.key ?? null, col: next });
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
    editorRef.current?.querySelector<HTMLElement>('input, button, select, textarea, [tabindex]')?.focus();
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

  /* ---------- column resize (pointer) ---------- */
  const minWidthOf = (column: DataGridColumn): number => column.minWidth ?? targetSizerRef.current?.getBoundingClientRect().width ?? 0;
  const resizeTo = (column: DataGridColumn, width: number): number => {
    const next = Math.round(Math.max(minWidthOf(column), width));
    setResizedWidths((prev) => (prev[column.key] === next ? prev : { ...prev, [column.key]: next }));
    return next;
  };

  const startPointerResize = (event: ReactPointerEvent<HTMLDivElement>, column: DataGridColumn): void => {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = widthOf(column);
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
    const entry = activeEntry;
    const column = dataColumnAt(col);
    const ctrl = event.ctrlKey || event.metaKey;
    const onRowHeader = entry !== undefined && !entry.placeholder && col === rowHeaderCol;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (onRowHeader && entry.hasChildren && !expandedSet.has(entry.key)) toggleExpand(entry.key);
        else moveTo(row, col + 1);
        return;
      case 'ArrowLeft': {
        event.preventDefault();
        if (onRowHeader && entry.hasChildren && expandedSet.has(entry.key)) {
          toggleExpand(entry.key);
          return;
        }
        if (entry && (onRowHeader || entry.placeholder)) {
          const parent = entry.parentId !== null ? indexByKey.get(entry.parentId) : undefined;
          if (parent !== undefined) moveTo(parent, rowHeaderCol);
          return;
        }
        moveTo(row, col - 1);
        return;
      }
      case 'ArrowDown':
        event.preventDefault();
        moveTo(row + 1, col);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(row - 1, col);
        return;
      case 'Home':
        event.preventDefault();
        moveTo(ctrl ? Math.min(0, visibleCount - 1) : row, 0);
        return;
      case 'End':
        event.preventDefault();
        moveTo(ctrl ? visibleCount - 1 : row, colCount - 1);
        return;
      case 'Enter': {
        event.preventDefault();
        if (row === -1) {
          if (hasSelectColumn && col === 0) toggleAll();
          else if (column?.sortable) activateSort(column);
          return;
        }
        if (!entry || entry.placeholder) return;
        if (hasSelectColumn && col === 0) {
          toggleRow(entry.row);
          return;
        }
        if (onRowHeader && entry.hasChildren) {
          toggleExpand(entry.key);
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
      case '*':
        event.preventDefault();
        if (entry && !entry.placeholder) expandLevel(entry);
        return;
      case 'F2':
        event.preventDefault();
        if (row >= 0) openEditor(row, col);
        return;
      case ' ': {
        if (selectable !== 'row') return;
        event.preventDefault();
        if (!entry || entry.placeholder) return;
        if (event.shiftKey) extendRows(row);
        else toggleRow(entry.row);
        return;
      }
      default:
    }

    if (ctrl && event.key.toLowerCase() === 'a' && selectable === 'row') {
      event.preventDefault();
      commitRows(loadedIds);
    }
  };

  /* ---------- pointer ---------- */
  const positionOf = (target: EventTarget | null): { row: number; col: number } | null => {
    const cell =
      target instanceof Element ? target.closest<HTMLElement>('[role="gridcell"], [role="rowheader"], [role="columnheader"]') : null;
    if (!cell || !cell.id.startsWith(cellPrefix) || !gridRef.current?.contains(cell)) return null;
    const [r, c] = cell.id.slice(cellPrefix.length).split('_');
    return { row: r === 'h' ? -1 : Number(r), col: Number(c) };
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    const target = event.target as Element;
    if (target.closest('[data-part="expandButton"]')) {
      // The chevron is a pointer convenience; focus stays on the grid.
      event.preventDefault();
      focusGrid();
      return;
    }
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
    const entry = pos.row >= 0 ? visible[pos.row] : undefined;
    setActiveState({ key: entry ? entry.key : null, col: pos.col });
    setAnnouncement('');
    const column = dataColumnAt(pos.col);
    if (!entry || entry.placeholder || !column) return;
    if (selectable === 'cell') onSelectionChange?.({ rowId: entry.key, column: column.key });
    else if (selectable === 'row') {
      if (event.shiftKey) extendRows(pos.row);
      else if (event.ctrlKey || event.metaKey) toggleRow(entry.row);
    }
  };

  const handleDoubleClick = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if ((event.target as Element).closest('[data-part="expandButton"]')) return;
    const pos = positionOf(event.target);
    if (pos && pos.row >= 0 && !editingRef.current) openEditor(pos.row, pos.col);
  };

  /* ---------- overrides ---------- */
  const rootStyle: Record<string, string> = {};
  for (const [binding, hook] of Object.entries(OVERRIDE_HOOKS) as [TreeGridOverridableBinding, string][]) {
    const token = overrides?.[binding];
    if (token) rootStyle[hook] = cssVar(token);
  }
  const headerTextOverrides: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {
    paddingInline: 'space.0',
    fontSize: 'font.size.sm',
    fontWeight: 'font.weight.semibold',
  };

  /* ---------- render: editors ---------- */
  const renderEditor = (column: DataGridColumn, row: TreeGridRow): ReactElement => {
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
            defaultValue={typeof current === 'number' ? current : undefined}
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
        return <Checkbox label={column.header} hideLabel name={name} checked={Boolean(current)} onChange={commitOnChange} />;
      default:
        return (
          <Input label={column.header} hideLabel size="sm" name={name} defaultValue={textOf(current)} overrides={zeroInset} onChange={setValue} />
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
          'ds-tree-grid__cell',
          'ds-tree-grid__cell--header',
          column.align && column.align !== 'start' && `ds-tree-grid__cell--align-${column.align}`,
          column.pinned && 'ds-tree-grid__cell--pinned',
          activeRow === -1 && activeCol === col && 'ds-tree-grid__cell--active',
        )}
        style={pinnedStyle(column, index)}
      >
        {column.sortable ? (
          <span className="ds-tree-grid__sort" data-part="sortButton" onClick={() => activateSort(column)}>
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
            <span className="ds-tree-grid__visually-hidden">{column.abbr}</span>
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
            className="ds-tree-grid__resize-handle"
            onPointerDown={(event) => startPointerResize(event, column)}
          />
        ) : null}
      </div>
    );
  };

  /* ---------- render: body ---------- */
  const rowHeaderContent = (entry: VisibleRow, column: DataGridColumn, name: string): ReactElement => {
    const isExpanded = expandedSet.has(entry.key);
    return (
      <>
        <span aria-hidden="true" className="ds-tree-grid__indent" data-part="indent" />
        <span className="ds-tree-grid__row-header">
          {entry.hasChildren ? (
            <span className="ds-tree-grid__expand" data-part="expandButton" onClick={() => toggleExpand(entry.key)}>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                label={interpolate(isExpanded ? COPY.collapse : COPY.expand, { rowName: name })}
                leadingIcon={
                  <span className={joinClasses('ds-tree-grid__chevron', isExpanded && 'ds-tree-grid__chevron--expanded')}>
                    <Icon name="chevron-right" inline />
                  </span>
                }
                overrides={{ paddingInline: 'space.0', paddingBlock: 'space.0' }}
                tabIndex={-1}
                aria-hidden="true"
              />
            </span>
          ) : (
            <span aria-hidden="true" className="ds-tree-grid__expand" />
          )}
          <span
            className={joinClasses('ds-tree-grid__cell-content', entry.hasChildren && 'ds-tree-grid__cell-content--parent')}
            data-part="cellContent"
          >
            {column.render ? column.render(entry.row) : textOf(entry.row[column.key])}
          </span>
        </span>
      </>
    );
  };

  const bodyCell = (entry: VisibleRow, rowIndex: number, column: DataGridColumn, index: number, name: string): ReactElement => {
    const col = index + colOffset;
    const isEditing = editing?.rowId === entry.key && editing.column === column.key;
    const isActive = activeRow === rowIndex && activeCol === col;
    return (
      <div
        key={column.key}
        id={cellId(rowIndex, col)}
        role={column.isRowHeader ? 'rowheader' : 'gridcell'}
        aria-colindex={col + 1}
        aria-selected={selectable === 'cell' ? isActive : undefined}
        aria-readonly={editable && !column.editable ? true : undefined}
        aria-describedby={isEditing && editError ? statusId : undefined}
        tabIndex={-1}
        data-part={column.isRowHeader ? 'rowHeader' : 'cell'}
        className={joinClasses(
          'ds-tree-grid__cell',
          column.isRowHeader && 'ds-tree-grid__cell--row-header',
          column.align && column.align !== 'start' && `ds-tree-grid__cell--align-${column.align}`,
          column.pinned && 'ds-tree-grid__cell--pinned',
          isActive && 'ds-tree-grid__cell--active',
          isEditing && 'ds-tree-grid__cell--editing',
          isEditing && editError && 'ds-tree-grid__cell--invalid',
        )}
        style={pinnedStyle(column, index)}
      >
        {isEditing && editing ? (
          <div
            ref={editorRef}
            className="ds-tree-grid__editor"
            data-part="editor"
            onKeyDown={(event) => handleEditorKeyDown(event, column)}
            onBlur={(event) => handleEditorBlur(event, editing)}
          >
            {renderEditor(column, entry.row)}
          </div>
        ) : column.isRowHeader ? (
          rowHeaderContent(entry, column, name)
        ) : (
          <span className="ds-tree-grid__cell-content" data-part="cellContent">
            {column.render ? column.render(entry.row) : textOf(entry.row[column.key])}
          </span>
        )}
      </div>
    );
  };

  const bodyRow = (entry: VisibleRow, rowIndex: number): ReactElement => {
    const style: Record<string, string> = { gridTemplateColumns, '--ds-tree-grid-depth': String(entry.level - 1) };
    if (virtualize) style.transform = `translateY(calc(${rowIndex} * ${ROW_SIZE}))`;
    const rowClass = joinClasses('ds-tree-grid__row', entry.level > 1 && 'ds-tree-grid__row--nested');

    if (entry.placeholder) {
      return (
        <div
          key={entry.key}
          role="row"
          aria-rowindex={rowIndex + 2}
          aria-level={entry.level}
          aria-setsize={entry.setsize}
          aria-posinset={entry.posinset}
          data-part="row"
          className={rowClass}
          style={style as CSSProperties}
        >
          <div
            id={cellId(rowIndex, 0)}
            role="gridcell"
            aria-colindex={1}
            tabIndex={-1}
            className={joinClasses('ds-tree-grid__cell', 'ds-tree-grid__cell--placeholder', activeRow === rowIndex && 'ds-tree-grid__cell--active')}
            style={{ gridColumn: '1 / -1' }}
          >
            {hasSelectColumn ? <span aria-hidden="true" className="ds-tree-grid__select-spacer" /> : null}
            <span aria-hidden="true" className="ds-tree-grid__indent" />
            <span className="ds-tree-grid__row-header">
              <span aria-hidden="true" className="ds-tree-grid__expand" />
              <Text element="span" size="sm" tone="muted">
                {COPY.loading}
              </Text>
            </span>
          </div>
        </div>
      );
    }

    const row = entry.row;
    const name = rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;
    const isExpanded = expandedSet.has(entry.key);
    const state = hasSelectColumn ? shownState(row) : 'unchecked';
    return (
      <div
        key={entry.key}
        role="row"
        aria-rowindex={rowIndex + 2}
        aria-level={entry.level}
        aria-setsize={entry.setsize}
        aria-posinset={entry.posinset}
        aria-expanded={entry.hasChildren ? isExpanded : undefined}
        aria-busy={entry.hasChildren && isExpanded && row.children === 'lazy' ? true : undefined}
        aria-selected={hasSelectColumn ? state === 'checked' : undefined}
        data-part="row"
        className={rowClass}
        style={style as CSSProperties}
      >
        {hasSelectColumn ? (
          <div
            id={cellId(rowIndex, 0)}
            role="gridcell"
            aria-colindex={1}
            tabIndex={-1}
            data-part="selectCell"
            className={joinClasses(
              'ds-tree-grid__cell',
              'ds-tree-grid__cell--select',
              'ds-tree-grid__cell--pinned',
              activeRow === rowIndex && activeCol === 0 && 'ds-tree-grid__cell--active',
            )}
            style={{ insetInlineStart: 0 }}
            onClick={(event) => {
              if (!(event.target as Element).closest('[data-ds="Checkbox"]')) toggleRow(row);
            }}
          >
            <Checkbox
              label={interpolate(COPY.selectRow, { rowName: name })}
              hideLabel
              name={`${baseId}-select`}
              value={row.id}
              checked={state === 'checked'}
              indeterminate={state === 'mixed'}
              tabIndex={-1}
              onChange={() => toggleRow(row)}
            />
          </div>
        ) : null}
        {columns.map((column, index) => bodyCell(entry, rowIndex, column, index, name))}
      </div>
    );
  };

  const renderedRows: ReactElement[] = [];
  for (let i = Math.max(0, windowStart); i <= windowEnd; i += 1) {
    const entry = visible[i];
    if (entry) renderedRows.push(bodyRow(entry, i));
  }

  /* ---------- status bar ---------- */
  const summary = [interpolate(pluralForm(COPY.rowCount, total), { count: total })];
  if (selectable === 'row' && selectedIds.length > 0) summary.push(interpolate(COPY.selectedRows, { count: selectedIds.length, total }));
  const liveText = loading ? COPY.loading : editError ? interpolate(COPY.invalid, { message: editError }) : announcement;
  const activeColumn = activeEntry?.placeholder ? rowHeaderColumn : dataColumnAt(activeCol);
  const position = activeRow >= 0 && activeColumn ? interpolate(COPY.position, { row: activeRow + 1, column: activeColumn.header }) : '';

  const empty = visibleCount === 0 && !loading;
  const activeDescendant =
    activeRendered && colCount > 0 && !empty ? cellId(activeRow, activeEntry?.placeholder ? 0 : activeCol) : undefined;

  return (
    <div
      {...rest}
      ref={ref}
      data-ds="TreeGrid"
      data-part="container"
      className={joinClasses(
        'ds-tree-grid',
        `ds-tree-grid--density-${density}`,
        `ds-tree-grid--height-${height}`,
        hasSelectColumn && 'ds-tree-grid--selectable-row',
        virtualize && 'ds-tree-grid--virtual',
        (stickyHeader || virtualize) && 'ds-tree-grid--sticky-header',
        scrollTop > 0 && 'ds-tree-grid--scrolled-y',
        scrolledX && 'ds-tree-grid--scrolled-x',
        loading && 'ds-tree-grid--loading',
      )}
      style={rootStyle as CSSProperties}
    >
      <span ref={targetSizerRef} aria-hidden="true" className="ds-tree-grid__sizer" />
      <div data-part="caption" className={hideCaption ? 'ds-tree-grid__visually-hidden' : 'ds-tree-grid__caption'}>
        <Heading id={captionId} level={2} size="md" overrides={{ marginBlockEnd: 'space.0' }}>
          {caption}
        </Heading>
      </div>
      <div ref={scrollRef} data-part="scrollRegion" className="ds-tree-grid__scroll-region" onScroll={handleScroll}>
        <div
          ref={gridRef}
          role="treegrid"
          data-part="grid"
          className="ds-tree-grid__grid"
          tabIndex={0}
          aria-labelledby={captionId}
          aria-describedby={showStatusBar ? statusId : undefined}
          aria-rowcount={visibleCount + 1}
          aria-colcount={colCount}
          aria-multiselectable={selectable === 'row' ? true : undefined}
          aria-readonly={!editable}
          aria-busy={loading ? true : undefined}
          aria-activedescendant={activeDescendant}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
        >
          <div role="rowgroup" data-part="header" className="ds-tree-grid__header">
            <div role="row" aria-rowindex={1} data-part="headerRow" className="ds-tree-grid__row" style={{ gridTemplateColumns }}>
              {hasSelectColumn ? (
                <div
                  id={cellId(-1, 0)}
                  role="columnheader"
                  aria-colindex={1}
                  tabIndex={-1}
                  data-part="selectAllCell"
                  className={joinClasses(
                    'ds-tree-grid__cell',
                    'ds-tree-grid__cell--header',
                    'ds-tree-grid__cell--select',
                    'ds-tree-grid__cell--pinned',
                    activeRow === -1 && activeCol === 0 && 'ds-tree-grid__cell--active',
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
            className="ds-tree-grid__body"
            style={virtualize ? { blockSize: `calc(${empty ? 0 : visibleCount} * ${ROW_SIZE})` } : undefined}
          >
            {empty ? (
              <div role="row" aria-rowindex={2} className="ds-tree-grid__empty-row">
                <div role="gridcell" aria-colindex={1} className="ds-tree-grid__empty" style={{ gridColumn: '1 / -1' }}>
                  <Text element="p" tone="muted" data-part="emptyState">
                    {emptyMessage ?? COPY.empty}
                  </Text>
                </div>
              </div>
            ) : (
              renderedRows
            )}
          </div>
        </div>
      </div>
      <div data-part="statusBar" className={showStatusBar ? 'ds-tree-grid__status-bar' : 'ds-tree-grid__visually-hidden'}>
        <span className="ds-tree-grid__status-group">
          {showStatusBar
            ? summary.map((text) => (
                <Text key={text} element="span" size="xs" tone="muted">
                  {text}
                </Text>
              ))
            : null}
          <Text id={statusId} element="span" size="xs" tone="muted" role="status" aria-live="polite">
            {liveText}
          </Text>
        </span>
        {showStatusBar ? (
          <span className="ds-tree-grid__status-group">
            {overflowX && !scrolledX ? (
              <Text element="span" size="xs" tone="muted">
                {COPY.scrollHint}
              </Text>
            ) : null}
            {position ? (
              <Text element="span" size="xs" tone="muted">
                {position}
              </Text>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
