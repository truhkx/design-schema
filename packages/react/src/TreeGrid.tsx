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
  type Ref,
  type UIEvent, type ReactElement,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DatePicker, type DatePickerValue } from './DatePicker';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text } from './Text';
import type { DataGridColumn } from './DataGrid';
import './TreeGrid.css';

export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';
export type TreeGridSortDirection = 'ascending' | 'descending';

/** A row's children: a loaded subtree, `"lazy"` (loaded on first expand through `onExpand`), or
 * absent (a leaf). */
export type TreeGridChildren = TreeGridRow[] | 'lazy';

/** A nested row. `id` must be stable — expansion, selection and React keys all use it. */
export interface TreeGridRow {
  id: string;
  children?: TreeGridChildren | undefined;
  [key: string]: unknown;
}

/** Controlled sort state. Sorting orders siblings within each level; hierarchy is kept. */
export interface TreeGridSortState {
  column: string;
  direction: TreeGridSortDirection;
}

/** One cell, referenced by row id and column key. */
export interface TreeGridCellRef {
  rowId: string;
  column: string;
}

export type TreeGridSelectionChangeDetail = string[] | TreeGridCellRef;

export interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY = {
  expand: 'Expand {rowName}',
  collapse: 'Collapse {rowName}',
  level: 'Level {level}',
  childCount: '{count} items',
  loading: 'Loading',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
};

/**
 * The schema's own copy block has no strings for the sort button, the selection summary, or the
 * empty state — all behaviors this component reuses "as DataGrid" verbatim. Borrowed from
 * DataGrid's copy block (see the gap list) rather than invented.
 */
const BORROWED_COPY = {
  sortAscending: 'Sort by {column}, ascending',
  sortDescending: 'Sort by {column}, descending',
  sortedAnnouncement: 'Sorted by {column}, {direction}',
  selectAll: 'Select all rows',
  selectRow: 'Select {rowName}',
  selectedRows: '{count} of {total} rows selected',
  rowCount: '{count} rows',
  editing: 'Editing {column}. Enter to save, Escape to cancel.',
  invalid: '{message}',
  empty: 'Nothing to show.',
};

const DEFAULT_COLUMN_WIDTH = 160;
const ANNOUNCEMENT_TIMEOUT_MS = 5000;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type TreeGridOverridableBinding =
  | 'indent'
  | 'expandButtonSize'
  | 'expandGap'
  | 'guideLine'
  | 'guideLineWidth'
  | 'parentWeight'
  | 'transition';

const ROOT_OVERRIDE_HOOK: Record<TreeGridOverridableBinding, string> = {
  indent: '--ds-tree-grid-indent',
  expandButtonSize: '--ds-tree-grid-expand-button-size',
  expandGap: '--ds-tree-grid-expand-gap',
  guideLine: '--ds-tree-grid-guide-line',
  guideLineWidth: '--ds-tree-grid-guide-line-width',
  parentWeight: '--ds-tree-grid-parent-weight',
  transition: '--ds-tree-grid-transition',
};

function overridesToStyle(overrides: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TreeGridOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[ROOT_OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

function interpolate(template: string, values: Record<string, string | number>): string {
  return Object.keys(values).reduce((text, key) => text.replaceAll(`{${key}}`, String(values[key])), template);
}

function compareRowValues(a: unknown, b: unknown): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, undefined, { numeric: true });
  return Number(a) - Number(b);
}

function cellValue(column: DataGridColumn, row: TreeGridRow): unknown {
  return row[column.key];
}

function cellText(column: DataGridColumn, row: TreeGridRow): string {
  const value = cellValue(column, row);
  return value === undefined || value === null ? '' : String(value);
}

function rowName(row: TreeGridRow, rowHeaderColumn: DataGridColumn | undefined): string {
  if (!rowHeaderColumn) return row.id;
  return cellText(rowHeaderColumn, row) || row.id;
}

function hasLoadedOrLazyChildren(row: TreeGridRow): boolean {
  return row.children === 'lazy' || (Array.isArray(row.children) && row.children.length > 0);
}

function sortSiblings(rows: TreeGridRow[], sort: TreeGridSortState | undefined): TreeGridRow[] {
  if (!sort) return rows;
  const factor = sort.direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => compareRowValues(a[sort.column], b[sort.column]) * factor);
}

interface VisibleRow {
  id: string;
  row: TreeGridRow;
  level: number;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  parentId: string | null;
  isPlaceholder?: boolean | undefined;
}

function flattenTree(rows: TreeGridRow[], expandedSet: Set<string>, sort: TreeGridSortState | undefined): VisibleRow[] {
  const result: VisibleRow[] = [];
  const walk = (list: TreeGridRow[], level: number, parentId: string | null) => {
    const siblings = sortSiblings(list, sort);
    siblings.forEach((row, index) => {
      const hasChildren = hasLoadedOrLazyChildren(row);
      result.push({ id: row.id, row, level, posinset: index + 1, setsize: siblings.length, hasChildren, parentId });
      if (hasChildren && expandedSet.has(row.id)) {
        if (row.children === 'lazy') {
          result.push({
            id: `${row.id}__loading`,
            row,
            level: level + 1,
            posinset: 1,
            setsize: 1,
            hasChildren: false,
            parentId: row.id,
            isPlaceholder: true,
          });
        } else if (Array.isArray(row.children)) {
          walk(row.children, level + 1, row.id);
        }
      }
    });
  };
  walk(rows, 1, null);
  return result;
}

/** O(n) per call — fine for interaction-driven lookups; only rendering is windowed for scale. */
function findRowAndParent(rows: TreeGridRow[], id: string, parent: TreeGridRow | null = null): { row: TreeGridRow; parent: TreeGridRow | null } | undefined {
  for (const row of rows) {
    if (row.id === id) return { row, parent };
    if (Array.isArray(row.children)) {
      const found = findRowAndParent(row.children, id, row);
      if (found) return found;
    }
  }
  return undefined;
}

function collectDescendantIds(row: TreeGridRow): string[] {
  if (!Array.isArray(row.children)) return [];
  const ids: string[] = [];
  for (const child of row.children) {
    ids.push(child.id, ...collectDescendantIds(child));
  }
  return ids;
}

function collectAllIds(rows: TreeGridRow[]): string[] {
  const ids: string[] = [];
  for (const row of rows) {
    ids.push(row.id);
    if (Array.isArray(row.children)) ids.push(...collectAllIds(row.children));
  }
  return ids;
}

function collectExpandableIds(rows: TreeGridRow[]): string[] {
  const ids: string[] = [];
  for (const row of rows) {
    if (hasLoadedOrLazyChildren(row)) ids.push(row.id);
    if (Array.isArray(row.children)) ids.push(...collectExpandableIds(row.children));
  }
  return ids;
}

function rowCheckedState(row: TreeGridRow, selectedSet: Set<string>, selectChildren: boolean): 'checked' | 'unchecked' | 'indeterminate' {
  if (!selectChildren) return selectedSet.has(row.id) ? 'checked' : 'unchecked';
  const descendants = collectDescendantIds(row);
  if (descendants.length === 0) return selectedSet.has(row.id) ? 'checked' : 'unchecked';
  const allIds = [row.id, ...descendants];
  const selectedCount = allIds.filter((id) => selectedSet.has(id)).length;
  if (selectedCount === 0) return 'unchecked';
  if (selectedCount === allIds.length) return 'checked';
  return 'indeterminate';
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface TreeGridProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. The `isRowHeader` column is required: it carries the indent and expand button,
   * and must come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row loaded on first expand through `onExpand`. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded row. */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort state. Sorting orders siblings within each level; hierarchy is kept. */
  sort?: TreeGridSortState | undefined;
  /** `row` adds a checkbox column; `cell` selects one cell. `row` selection of a parent does not
   * select its descendants unless `selectChildren`. */
  selectable?: TreeGridSelectable | undefined;
  /** Selecting a parent row selects its descendants; the parent shows indeterminate when only some
   * are selected. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: TreeGridDensity | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization); `fixed` uses `overrides.fixedHeight`. */
  height?: TreeGridHeight | undefined;
  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  loading?: boolean | undefined;
  /** A footer line with row count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Portal target for editors that open a popup (Select, DatePicker). Defaults to `document.body`.
   * Not part of the schema; added so those composed editors can be portaled per their own contract. */
  container?: HTMLElement | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids. */
  onExpandChange?: ((expanded: string[]) => void) | undefined;
  /** Fired when a `children: "lazy"` row is expanded for the first time, with its id; the caller
   * loads and replaces `children`. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TreeGridSortState) => void) | undefined;
  /** Fired with the selection: row ids, or one cell. */
  onSelectionChange?: ((selection: TreeGridSelectionChangeDetail) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the grid shows the old value until it does. */
  onCellChange?: ((detail: TreeGridCellChangeDetail) => void) | undefined;
}

type ActiveCell = { row: number; col: number };

/**
 * TreeGrid — Design Schema, category: data.
 *
 * When to use:
 * Use a TreeGrid when records nest and each record has several comparable fields: a chart of
 * accounts with balances, folders and files with sizes and dates, a bill of materials with
 * quantities and costs, an org chart with headcount. Use `children: "lazy"` for deep or large
 * trees so the first paint is fast. Use `selectChildren` when selection means "this and everything
 * in it" (a folder to export).
 */
export const TreeGrid = function TreeGrid({
  ref,
  caption,
  hideCaption = false,
  columns,
  data,
  expanded,
  defaultExpanded,
  sort,
  selectable = 'none',
  selectChildren = false,
  editable = false,
  density = 'compact',
  height = 'viewport',
  loading = false,
  showStatusBar = true,
  container,
  overrides,
  onExpandChange,
  onExpand,
  onSortChange,
  onSelectionChange,
  onCellChange,
  className,
  style,
  ...rest
}: TreeGridProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const generatedId = useId();
  const baseId = `ds-tree-grid${generatedId}`;
  const captionId = `${baseId}-caption`;
  const statusBarId = `${baseId}-status`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);
  const sizerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef(new Map<string, HTMLDivElement>());

  const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);
  const rowHeaderIndex = useMemo(() => columns.findIndex((column) => column.isRowHeader), [columns]);

  if (isDev) {
    const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
    if (rowHeaderCount !== 1) {
      console.warn(`TreeGrid: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
    } else if (rowHeaderIndex !== 0) {
      console.warn('TreeGrid: the `isRowHeader` column should come first (immediately after the selection column).');
    }
  }

  /* ---------- expansion ---------- */
  const isExpandedControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<string[]>(() =>
    defaultExpanded?.includes('*') ? collectExpandableIds(data) : (defaultExpanded ?? []),
  );
  const expandedIds = isExpandedControlled ? (expanded as string[]) : internalExpanded;
  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  const setExpanded = (next: string[]) => {
    if (!isExpandedControlled) setInternalExpanded(next);
    onExpandChange?.(next);
  };

  const toggleExpand = (id: string) => {
    const next = expandedSet.has(id) ? expandedIds.filter((existing) => existing !== id) : [...expandedIds, id];
    setExpanded(next);
  };

  const expandSiblings = (visRow: VisibleRow) => {
    const siblingList = visRow.parentId ? findRowAndParent(data, visRow.parentId)?.row.children : data;
    if (!Array.isArray(siblingList)) return;
    const ids = siblingList.filter(hasLoadedOrLazyChildren).map((sibling) => sibling.id);
    setExpanded(Array.from(new Set([...expandedIds, ...ids])));
  };

  /* Lazy rows fire `onExpand` exactly once per expand transition, including ids expanded up front
     through `defaultExpanded={['*']}` or a controlled `expanded` prop. */
  const requestedLazyRef = useRef(new Set<string>());
  useEffect(() => {
    for (const id of expandedIds) {
      if (requestedLazyRef.current.has(id)) continue;
      const found = findRowAndParent(data, id);
      if (found?.row.children === 'lazy') {
        requestedLazyRef.current.add(id);
        onExpand?.(id);
      }
    }
  }, [expandedIds, data, onExpand]);

  const visible = useMemo(() => flattenTree(data, expandedSet, sort), [data, expandedSet, sort]);
  const allIds = useMemo(() => collectAllIds(data), [data]);

  /* ---------- sort (fully controlled — the schema gives TreeGrid `sort` but no `defaultSort`) ---------- */
  const nextSortDirection = (columnKey: string): TreeGridSortDirection =>
    sort?.column === columnKey && sort.direction === 'ascending' ? 'descending' : 'ascending';

  const handleSort = (column: DataGridColumn) => {
    const next: TreeGridSortState = { column: column.key, direction: nextSortDirection(column.key) };
    onSortChange?.(next);
    announce(interpolate(BORROWED_COPY.sortedAnnouncement, { column: column.header, direction: next.direction }));
  };

  const sortButtonLabel = (column: DataGridColumn): string => {
    const next = nextSortDirection(column.key);
    const template = next === 'ascending' ? BORROWED_COPY.sortAscending : BORROWED_COPY.sortDescending;
    return interpolate(template, { column: column.header });
  };

  /* ---------- announcements / status bar ---------- */
  const [announcement, setAnnouncement] = useState('');
  const announcementTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const announce = (message: string, sticky = false) => {
    if (announcementTimer.current) clearTimeout(announcementTimer.current);
    setAnnouncement(message);
    if (!sticky) announcementTimer.current = setTimeout(() => setAnnouncement(''), ANNOUNCEMENT_TIMEOUT_MS);
  };
  useEffect(() => () => clearTimeout(announcementTimer.current), []);

  /* ---------- selection (uncontrolled only — the schema gives no `selected` prop) ---------- */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const [cellSelection, setCellSelection] = useState<TreeGridCellRef | undefined>();
  const anchorRef = useRef<string | null>(null);

  const commitRowSelection = (next: string[]) => {
    setSelectedIds(next);
    onSelectionChange?.(next);
    announce(interpolate(BORROWED_COPY.selectedRows, { count: next.length, total: allIds.length }));
  };

  const toggleRowSelection = (row: TreeGridRow) => {
    const ids = selectChildren ? [row.id, ...collectDescendantIds(row)] : [row.id];
    const shouldSelect = rowCheckedState(row, selectedSet, selectChildren) !== 'checked';
    if (shouldSelect) {
      commitRowSelection(Array.from(new Set([...selectedIds, ...ids])));
    } else {
      const remove = new Set(ids);
      commitRowSelection(selectedIds.filter((id) => !remove.has(id)));
    }
  };

  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const handleToggleAll = () => commitRowSelection(allSelected ? [] : allIds);

  /* ---------- editing ---------- */
  const [editing, setEditing] = useState<TreeGridCellRef | undefined>();
  const [editingValue, setEditingValue] = useState<unknown>();
  const [editingError, setEditingError] = useState<string | undefined>();
  const editingValueRef = useRef<unknown>(undefined);
  const isEditingRef = useRef(false);
  isEditingRef.current = editing !== undefined;

  const focusGrid = () => scrollRegionRef.current?.focus();

  const openEditor = (rowId: string, columnKey: string) => {
    const column = columns.find((entry) => entry.key === columnKey);
    const found = findRowAndParent(data, rowId);
    if (!column || !found) return;
    const initial = cellValue(column, found.row);
    editingValueRef.current = initial;
    setEditing({ rowId, column: columnKey });
    setEditingValue(initial);
    setEditingError(undefined);
    announce(interpolate(BORROWED_COPY.editing, { column: column.header }), true);
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
    const found = findRowAndParent(data, editing.rowId);
    if (!column || !found) return;
    const error = column.validate?.(value, found.row);
    if (error) {
      setEditingError(error);
      announce(interpolate(BORROWED_COPY.invalid, { message: error }), true);
      return;
    }
    const previous = cellValue(column, found.row);
    isEditingRef.current = false;
    setEditing(undefined);
    setEditingValue(undefined);
    setEditingError(undefined);
    onCellChange?.({ rowId: editing.rowId, column: editing.column, value, previous });
    if (moveDown) moveActiveCell(1, 0);
    focusGrid();
  };

  /* ---------- column widths ---------- */
  const hasSelectColumn = selectable === 'row';
  const colCount = (hasSelectColumn ? 1 : 0) + columns.length;
  const gridTemplateColumns = [
    hasSelectColumn ? 'var(--size-target-min)' : null,
    ...columns.map((column) => `${column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH}px`),
  ]
    .filter(Boolean)
    .join(' ');

  /* ---------- row height measurement (mirrors DataGrid: density is CSS-driven, virtualization
     arithmetic needs the resolved pixel value) ---------- */
  const [rowHeightPx, setRowHeightPx] = useState(32);
  useLayoutEffect(() => {
    const sizer = sizerRef.current;
    if (!sizer || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => setRowHeightPx(entry!.contentRect.height || 32));
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [density]);

  /* ---------- virtualization over the flattened, visible-row list ---------- */
  const virtualize = height !== 'content';
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
  const endIndex = virtualize ? Math.min(visible.length - 1, Math.floor(scrollTop / rowHeightPx) + pageSize * 2) : visible.length - 1;

  const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    setScrolledUnderHeader(event.currentTarget.scrollTop > 0);
  };

  /* ---------- focus (roving via aria-activedescendant, as DataGrid) ---------- */
  const [activeCell, setActiveCell] = useState<ActiveCell>({ row: -1, col: 0 });
  const cellId = (row: number, col: number) => (row === -1 ? `${baseId}-header-cell-${col}` : `${baseId}-cell-${row}-${col}`);
  const activeDescendantId = editing ? undefined : cellId(activeCell.row, activeCell.col);

  const columnAtIndex = (col: number): DataGridColumn | 'select' | undefined => {
    if (hasSelectColumn && col === 0) return 'select';
    return columns[col - (hasSelectColumn ? 1 : 0)];
  };
  const rowHeaderColIndex = rowHeaderIndex + (hasSelectColumn ? 1 : 0);

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
    if (!column || column === 'select' || selectable !== 'cell') return;
    const visRow = visible[row];
    if (!visRow || visRow.isPlaceholder) return;
    const next = { rowId: visRow.id, column: column.key };
    setCellSelection(next);
    onSelectionChange?.(next);
  };

  const setActiveCellTo = (row: number, col: number) => {
    const clampedRow = Math.max(-1, Math.min(visible.length - 1, row));
    const clampedCol = Math.max(0, Math.min(colCount - 1, col));
    applyFocusForSelectable(clampedRow, clampedCol);
    if (clampedRow >= 0) scrollRowIntoView(clampedRow);
    setActiveCell({ row: clampedRow, col: clampedCol });
  };

  const moveActiveCell = (deltaRow: number, deltaCol: number) => {
    setActiveCellTo(activeCell.row + deltaRow, activeCell.col + deltaCol);
  };

  /* ---------- editor wrapper: owns Enter/F2/Escape while editing ---------- */
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

  const activateCellControl = (visRow: VisibleRow, col: number) => {
    const column = columnAtIndex(col);
    if (!column || column === 'select') return;
    const element = cellRefs.current.get(`${visRow.id}:${column.key}`);
    const control = element?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    control?.focus();
    control?.click();
  };

  /* ---------- keyboard model ---------- */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (editing) return; // the open editor owns its own keys
    const { row, col } = activeCell;
    const column = columnAtIndex(col);
    const visRow = row >= 0 ? visible[row] : undefined;
    const onRowHeader = col === rowHeaderColIndex && visRow && !visRow.isPlaceholder;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActiveCell(1, 0);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveActiveCell(-1, 0);
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (onRowHeader && visRow.hasChildren && !expandedSet.has(visRow.id)) {
          toggleExpand(visRow.id);
        } else {
          moveActiveCell(0, 1);
        }
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (onRowHeader && visRow.hasChildren && expandedSet.has(visRow.id)) {
          toggleExpand(visRow.id);
        } else if (onRowHeader && visRow.parentId) {
          const parentIndex = visible.findIndex((entry) => entry.id === visRow.parentId);
          if (parentIndex >= 0) setActiveCellTo(parentIndex, rowHeaderColIndex);
        } else {
          moveActiveCell(0, -1);
        }
        return;
      case 'Home':
        event.preventDefault();
        setActiveCellTo(event.ctrlKey ? 0 : row, 0);
        return;
      case 'End':
        event.preventDefault();
        setActiveCellTo(event.ctrlKey ? visible.length - 1 : row, colCount - 1);
        return;
      case 'Enter':
        event.preventDefault();
        if (row === -1) {
          if (column && column !== 'select' && column.sortable) handleSort(column);
          return;
        }
        if (!visRow || visRow.isPlaceholder) return;
        if (onRowHeader) {
          if (visRow.hasChildren) toggleExpand(visRow.id);
          return;
        }
        if (column && column !== 'select') {
          if (editable && column.editable) openEditor(visRow.id, column.key);
          else activateCellControl(visRow, col);
        }
        return;
      case '*':
        event.preventDefault();
        if (visRow && !visRow.isPlaceholder) expandSiblings(visRow);
        return;
      case 'F2':
        event.preventDefault();
        if (visRow && !visRow.isPlaceholder && column && column !== 'select' && editable && column.editable) {
          openEditor(visRow.id, column.key);
        }
        return;
      case ' ':
        if (selectable === 'row') {
          event.preventDefault();
          if (!visRow || visRow.isPlaceholder) return;
          if (event.shiftKey && anchorRef.current) {
            const anchorIndex = visible.findIndex((entry) => entry.id === anchorRef.current);
            const lo = Math.min(anchorIndex, row);
            const hi = Math.max(anchorIndex, row);
            commitRowSelection(visible.slice(lo, hi + 1).filter((entry) => !entry.isPlaceholder).map((entry) => entry.id));
          } else {
            anchorRef.current = visRow.id;
            toggleRowSelection(visRow.row);
          }
        }
        return;
      case 'a':
      case 'A':
        if (event.ctrlKey && selectable === 'row') {
          event.preventDefault();
          commitRowSelection(allIds);
        }
        return;
      default:
    }
  };

  /* ---------- editors ---------- */
  const renderEditor = (column: DataGridColumn, row: TreeGridRow) => {
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
  const renderHeaderCell = (column: DataGridColumn, index: number) => {
    const colIndex = index + (hasSelectColumn ? 1 : 0);
    const isActive = activeCell.row === -1 && activeCell.col === colIndex;
    const sorted = column.sortable ? sort?.column === column.key : undefined;
    const classes = [
      'ds-tree-grid__cell',
      'ds-tree-grid__cell--header',
      column.align === 'end' ? 'ds-tree-grid__cell--align-end' : column.align === 'center' ? 'ds-tree-grid__cell--align-center' : null,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        key={column.key}
        id={cellId(-1, colIndex)}
        role="columnheader"
        aria-colindex={colIndex + 1}
        aria-sort={column.sortable ? (sorted ? (sort as TreeGridSortState).direction : 'none') : undefined}
        data-part="columnHeader"
        data-active={isActive ? 'true' : undefined}
        className={classes}
        onMouseDown={() => {
          focusGrid();
          setActiveCell({ row: -1, col: colIndex });
        }}
      >
        {column.sortable ? (
          <Button
            variant="ghost"
            size="sm"
            label={sortButtonLabel(column)}
            trailingIcon={<Icon name={sorted && sort?.direction === 'descending' ? 'chevron-down' : 'chevron-up'} inline />}
            className="ds-tree-grid__sort-button"
            data-part="sortButton"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleSort(column)}
          />
        ) : column.abbr ? (
          <>
            <span aria-hidden="true">{column.abbr}</span>
            <span className="ds-tree-grid__visually-hidden">{column.header}</span>
          </>
        ) : (
          column.header
        )}
      </div>
    );
  };

  /* ---------- render: cells ---------- */
  const renderRowHeaderContent = (visRow: VisibleRow, column: DataGridColumn) => {
    const expandedState = expandedSet.has(visRow.id);
    const name = rowName(visRow.row, rowHeaderColumn);
    return (
      <div
        className="ds-tree-grid__row-header-inner"
        style={{ paddingInlineStart: `calc(var(--ds-tree-grid-indent) * ${visRow.level - 1})` }}
      >
        {Array.from({ length: visRow.level - 1 }).map((_, ancestorIndex) => (
          <span
            key={ancestorIndex}
            aria-hidden="true"
            className="ds-tree-grid__guide"
            style={{ insetInlineStart: `calc(var(--ds-tree-grid-indent) * ${ancestorIndex} + var(--ds-tree-grid-expand-button-size) / 2)` }}
          />
        ))}
        {visRow.hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            label={interpolate(expandedState ? COPY.collapse : COPY.expand, { rowName: name })}
            leadingIcon={
              <Icon
                name="chevron-right"
                inline
                className={expandedState ? 'ds-tree-grid__expand-icon ds-tree-grid__expand-icon--expanded' : 'ds-tree-grid__expand-icon'}
              />
            }
            className="ds-tree-grid__expand-button"
            tabIndex={-1}
            aria-hidden="true"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => toggleExpand(visRow.id)}
          />
        ) : (
          <span className="ds-tree-grid__expand-spacer" aria-hidden="true" />
        )}
        <span className={visRow.hasChildren ? 'ds-tree-grid__row-header-text ds-tree-grid__row-header-text--parent' : 'ds-tree-grid__row-header-text'}>
          {column.render ? column.render(visRow.row) : name}
        </span>
      </div>
    );
  };

  const renderCell = (visRow: VisibleRow, rowIndex: number, column: DataGridColumn, colIndex: number) => {
    const isActive = activeCell.row === rowIndex && activeCell.col === colIndex;
    const isEditingThis = editing?.rowId === visRow.id && editing.column === column.key;
    const isSelected = selectable === 'cell' && cellSelection?.rowId === visRow.id && cellSelection.column === column.key;
    const classes = [
      'ds-tree-grid__cell',
      column.align === 'end' ? 'ds-tree-grid__cell--align-end' : column.align === 'center' ? 'ds-tree-grid__cell--align-center' : null,
      isSelected ? 'ds-tree-grid__cell--selected' : null,
      isEditingThis ? 'ds-tree-grid__cell--editing' : null,
      isEditingThis && editingError ? 'ds-tree-grid__cell--invalid' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const role = column.isRowHeader ? 'rowheader' : 'gridcell';
    return (
      <div
        key={column.key}
        id={cellId(rowIndex, colIndex)}
        ref={(node) => {
          if (node) cellRefs.current.set(`${visRow.id}:${column.key}`, node);
          else cellRefs.current.delete(`${visRow.id}:${column.key}`);
        }}
        role={role}
        aria-colindex={colIndex + 1}
        aria-selected={selectable === 'cell' ? (isSelected ? 'true' : 'false') : undefined}
        tabIndex={-1}
        data-part={column.isRowHeader ? 'rowHeader' : 'cell'}
        data-active={isActive ? 'true' : undefined}
        className={classes}
        onMouseDown={() => {
          focusGrid();
          setActiveCellTo(rowIndex, colIndex);
        }}
        onDoubleClick={() => {
          if (editable && column.editable) openEditor(visRow.id, column.key);
        }}
      >
        {isEditingThis ? (
          <div
            className="ds-tree-grid__editor"
            data-part="editor"
            onKeyDown={handleEditorWrapperKeyDown(column)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) handleEditorBlur();
            }}
          >
            {renderEditor(column, visRow.row)}
          </div>
        ) : column.isRowHeader ? (
          renderRowHeaderContent(visRow, column)
        ) : column.render ? (
          <div className="ds-tree-grid__cell-content" data-part="cellContent">
            {column.render(visRow.row)}
          </div>
        ) : (
          <span className="ds-tree-grid__cell-content" data-part="cellContent">
            {cellText(column, visRow.row)}
          </span>
        )}
      </div>
    );
  };

  const renderRow = (visRow: VisibleRow, rowIndex: number) => {
    const style: CSSProperties = { gridTemplateColumns };
    if (virtualize) {
      style.position = 'absolute';
      style.insetBlockStart = 0;
      style.insetInlineStart = 0;
      style.inlineSize = '100%';
      style.transform = `translateY(${rowIndex * rowHeightPx}px)`;
    }

    if (visRow.isPlaceholder) {
      return (
        <div
          key={visRow.id}
          role="row"
          aria-level={visRow.level}
          aria-rowindex={rowIndex + 2}
          className="ds-tree-grid__row"
          data-part="row"
          style={style}
        >
          <div
            role="gridcell"
            className="ds-tree-grid__cell ds-tree-grid__loading-cell"
            style={{
              gridColumn: `1 / span ${colCount}`,
              paddingInlineStart: `calc(var(--ds-tree-grid-indent) * ${visRow.level - 1})`,
            }}
          >
            <Text size="sm" className="ds-tree-grid__loading-text">
              {COPY.loading}
            </Text>
          </div>
        </div>
      );
    }

    const isSelected = selectable === 'row' && selectedSet.has(visRow.id);
    const checkedState = selectable === 'row' ? rowCheckedState(visRow.row, selectedSet, selectChildren) : 'unchecked';
    return (
      <div
        key={visRow.id}
        role="row"
        aria-level={visRow.level}
        aria-setsize={visRow.setsize}
        aria-posinset={visRow.posinset}
        aria-expanded={visRow.hasChildren ? (expandedSet.has(visRow.id) ? 'true' : 'false') : undefined}
        aria-busy={visRow.hasChildren && expandedSet.has(visRow.id) && visRow.row.children === 'lazy' ? 'true' : undefined}
        aria-rowindex={rowIndex + 2}
        aria-selected={selectable === 'row' ? (isSelected ? 'true' : 'false') : undefined}
        className={['ds-tree-grid__row', isSelected ? 'ds-tree-grid__row--selected' : null].filter(Boolean).join(' ')}
        data-part="row"
        style={style}
      >
        {hasSelectColumn ? (
          <div role="gridcell" aria-colindex={1} className="ds-tree-grid__cell ds-tree-grid__cell--select" data-part="selectCell">
            <Checkbox
              label={interpolate(BORROWED_COPY.selectRow, { rowName: rowName(visRow.row, rowHeaderColumn) })}
              name={`${baseId}-select-${visRow.id}`}
              checked={checkedState === 'checked'}
              indeterminate={checkedState === 'indeterminate'}
              onChange={() => toggleRowSelection(visRow.row)}
            />
          </div>
        ) : null}
        {columns.map((column, index) => renderCell(visRow, rowIndex, column, index + (hasSelectColumn ? 1 : 0)))}
      </div>
    );
  };

  const classes = [
    'ds-tree-grid',
    `ds-tree-grid--density-${density}`,
    `ds-tree-grid--height-${height}`,
    scrolledUnderHeader ? 'ds-tree-grid--scrolled-under-header' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const visibleRows = visible.slice(startIndex, endIndex + 1);

  const statusText = loading
    ? COPY.loading
    : editingError
      ? interpolate(BORROWED_COPY.invalid, { message: editingError })
      : announcement ||
        (selectable === 'row' && selectedIds.length > 0
          ? interpolate(BORROWED_COPY.selectedRows, { count: selectedIds.length, total: allIds.length })
          : interpolate(BORROWED_COPY.rowCount, { count: visible.length }));

  return (
    <div {...rest} ref={rootRef} data-ds="TreeGrid" data-part="container" className={classes} style={mergedStyle}>
      <div id={captionId} data-part="caption" className={hideCaption ? 'ds-tree-grid__visually-hidden' : 'ds-tree-grid__caption'}>
        <Heading level={2} size="md">
          {caption}
        </Heading>
      </div>
      <div
        ref={scrollRegionRef}
        role="treegrid"
        data-part="scrollRegion"
        className="ds-tree-grid__scroll-region"
        aria-labelledby={captionId}
        aria-rowcount={visible.length + 1}
        aria-colcount={colCount}
        aria-multiselectable={selectable === 'row' ? 'true' : undefined}
        aria-readonly={!editable ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-describedby={statusBarId}
        tabIndex={0}
        aria-activedescendant={activeDescendantId}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
      >
        <div ref={sizerRef} aria-hidden="true" className="ds-tree-grid__row-sizer" />
        <div role="rowgroup" data-part="header" className="ds-tree-grid__header">
          <div role="row" aria-rowindex={1} className="ds-tree-grid__row ds-tree-grid__row--header" data-part="headerRow" style={{ gridTemplateColumns }}>
            {hasSelectColumn ? (
              <div
                role="columnheader"
                aria-colindex={1}
                id={cellId(-1, 0)}
                data-part="selectAllCell"
                data-active={activeCell.row === -1 && activeCell.col === 0 ? 'true' : undefined}
                className="ds-tree-grid__cell ds-tree-grid__cell--header ds-tree-grid__cell--select"
                onMouseDown={() => {
                  focusGrid();
                  setActiveCell({ row: -1, col: 0 });
                }}
              >
                <Checkbox
                  label={BORROWED_COPY.selectAll}
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
        <div role="rowgroup" data-part="body" className="ds-tree-grid__body">
          {visible.length === 0 ? (
            <div role="row" className="ds-tree-grid__row">
              <div role="gridcell" className="ds-tree-grid__empty" style={{ gridColumn: `1 / span ${colCount}` }}>
                <Text element="p" tone="muted" data-part="emptyState">
                  {loading ? COPY.loading : BORROWED_COPY.empty}
                </Text>
              </div>
            </div>
          ) : virtualize ? (
            <div className="ds-tree-grid__spacer" style={{ position: 'relative', blockSize: visible.length * rowHeightPx }}>
              {visibleRows.map((visRow, i) => renderRow(visRow, startIndex + i))}
            </div>
          ) : (
            visibleRows.map((visRow, i) => renderRow(visRow, i))
          )}
        </div>
      </div>
      {showStatusBar ? (
        <div id={statusBarId} role="status" aria-live="polite" className="ds-tree-grid__status-bar" data-part="statusBar">
          <Text size="xs" tone="muted">
            {statusText}
          </Text>
        </div>
      ) : (
        <span id={statusBarId} role="status" aria-live="polite" className="ds-tree-grid__visually-hidden">
          {announcement}
        </span>
      )}
    </div>
  );
};
