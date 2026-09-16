import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, PanResponder, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import type { AccessibilityActionEvent, ListRenderItemInfo, TextInputKeyPressEvent, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import type { DataGridColumn } from './DataGrid';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import { Text } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type TreeGridSortDirection = 'ascending' | 'descending';
export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';

/** A nested record. `id` must be stable. `children: "lazy"` marks a subtree not yet loaded. */
export interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | 'lazy' | undefined;
  [key: string]: unknown;
}

/** Sort state; sorts siblings within each level and keeps the hierarchy. */
export type TreeGridSort = { column: string; direction: 'ascending' | 'descending' };

/** A single selected cell, in `selectable="cell"` mode. */
export type TreeGridCellSelection = { rowId: string; column: string };

/** Row ids, or one cell, matching `selectable`. */
export type TreeGridSelection = string[] | TreeGridCellSelection;

/** A committed cell value, as the column editor produces it. */
export type TreeGridCellValue = string | number | boolean;

/** The style bindings a caller may replace with a different token; locked bindings are excluded. */
export type TreeGridOverridableBinding = 'indent' | 'expandGap' | 'guideLine' | 'guideLineWidth' | 'parentWeight' | 'transition';

export interface TreeGridProps {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required and carries the indent and expand button; it must come first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` marks a row whose children load on first expand through `onExpand`. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[] | undefined;
  /** Initially expanded ids. `["*"]` expands every loaded row. */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort; the caller orders siblings within each level. */
  sort?: TreeGridSort | undefined;
  /** Initial sort when uncontrolled; the grid orders siblings within each level itself. */
  defaultSort?: TreeGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects one cell. */
  selectable?: TreeGridSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a parent sets or clears its own id and every loaded descendant; a parent's shown state derives from its loaded descendants. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` can be edited. */
  editable?: boolean | undefined;
  /** Row height. */
  density?: TreeGridDensity | undefined;
  /** `viewport` fills the window height; `content` grows with rows; `fixed` uses a fixed height. */
  height?: TreeGridHeight | undefined;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** The header stays visible while the body scrolls. Always true unless `height="content"`. */
  stickyHeader?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids (bare array). */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id each time a row whose `children` is still `"lazy"` is expanded, so a failed load can retry. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated. */
  onSortChange?: ((column: string, direction: 'ascending' | 'descending') => void) | undefined;
  /** Fired with the new selection: row ids or one cell. */
  onSelectionChange?: ((selection: string[] | { rowId: string; column: string }) => void) | undefined;
  /** Fired when an edit commits; the caller updates `data`. */
  onCellChange?: ((rowId: string, column: string, value: string | number | boolean, previous: string | number | boolean) => void) | undefined;
  /** Fired before an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired with the column and its new width when a resize commits. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  expand: (rowName: string): string => `Expand ${rowName}`,
  collapse: (rowName: string): string => `Collapse ${rowName}`,
  level: (level: number): string => `Level ${level}`,
  childCount: (count: number): string => (new Intl.PluralRules().select(count) === 'one' ? `${count} item` : `${count} items`),
  loading: 'Loading',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  empty: 'Nothing to show.',
  sortAscending: (column: string): string => `Sort by ${column}, ascending`,
  sortDescending: (column: string): string => `Sort by ${column}, descending`,
  sortedAnnouncement: (column: string, direction: string): string => `Sorted by ${column}, ${direction}`,
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedRows: (count: number, total: number): string => `${count} of ${total} rows selected`,
  editing: (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`,
  invalid: (message: string): string => `${message}`,
  rowCount: (count: number): string => (new Intl.PluralRules().select(count) === 'one' ? `${count} row` : `${count} rows`),
  position: (row: number, column: string): string => `Row ${row}, ${column}`,
  resize: (column: string): string => `Resize ${column}`,
  scrollHint: 'Scroll sideways to see more columns',
} as const;

/** Schema default for a column without `width` (DataGrid's). */
const DEFAULT_COLUMN_WIDTH = 160; // literal-ok: the column model's documented default width

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** Clips content to one point while keeping it in the accessibility tree (hidden caption, live regions). */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const PARENT_WEIGHT: TokenRef = 'font.weight.medium';

function tokenOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref === undefined ? fallback : (resolveToken(t, ref) as T);
}

/** One entry of the flattened, virtualized visible-row list; collapsed subtrees never appear here. */
interface FlatRow {
  key: string;
  level: number;
  /** A `"lazy"` row's placeholder child. */
  placeholder: boolean;
  row: TreeGridRow;
}

function cellText(row: TreeGridRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function cellValue(row: TreeGridRow, key: string): TreeGridCellValue {
  const raw = row[key];
  return typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean' ? raw : cellText(row, key);
}

function compareRows(a: TreeGridRow, b: TreeGridRow, sort: TreeGridSort): number {
  const factor = sort.direction === 'ascending' ? 1 : -1;
  const av = a[sort.column];
  const bv = b[sort.column];
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * factor;
  }
  return cellText(a, sort.column).localeCompare(cellText(b, sort.column), undefined, { numeric: true }) * factor;
}

function sortTree(rows: TreeGridRow[], sort: TreeGridSort): TreeGridRow[] {
  return [...rows].sort((a, b) => compareRows(a, b, sort)).map((row) => (Array.isArray(row.children) ? { ...row, children: sortTree(row.children, sort) } : row));
}

function hasChildren(row: TreeGridRow): boolean {
  return row.children === 'lazy' || (Array.isArray(row.children) && row.children.length > 0);
}

function flattenTree(rows: TreeGridRow[], expanded: Set<string>, level: number, out: FlatRow[] = []): FlatRow[] {
  for (const row of rows) {
    out.push({ key: row.id, level, placeholder: false, row });
    if (hasChildren(row) && expanded.has(row.id)) {
      if (row.children === 'lazy') {
        out.push({ key: `${row.id}::placeholder`, level: level + 1, placeholder: true, row });
      } else if (Array.isArray(row.children)) {
        flattenTree(row.children, expanded, level + 1, out);
      }
    }
  }
  return out;
}

/** Every loaded row that has children, at any depth — for `["*"]` and the expandAll action. */
function expandableIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    if (Array.isArray(row.children) && row.children.length > 0) {
      out.push(row.id);
      expandableIds(row.children, out);
    }
  }
  return out;
}

/** Every loaded row id at any depth. */
function loadedIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    out.push(row.id);
    if (Array.isArray(row.children)) {
      loadedIds(row.children, out);
    }
  }
  return out;
}

function findRow(rows: TreeGridRow[], id: string): TreeGridRow | null {
  for (const row of rows) {
    if (row.id === id) {
      return row;
    }
    if (Array.isArray(row.children)) {
      const found = findRow(row.children, id);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
}

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

/** Checked when every loaded descendant is selected, indeterminate when some are, otherwise the row's own id decides. */
function derivedCheckState(row: TreeGridRow, selected: Set<string>): CheckState {
  const descendants = Array.isArray(row.children) ? loadedIds(row.children) : [];
  const count = descendants.filter((id) => selected.has(id)).length;
  if (descendants.length > 0 && count === descendants.length) {
    return 'checked';
  }
  if (count > 0) {
    return 'indeterminate';
  }
  return selected.has(row.id) ? 'checked' : 'unchecked';
}

function sameCell(a: TreeGridCellSelection | null, rowId: string, column: string): boolean {
  return a !== null && a.rowId === rowId && a.column === column;
}

/** The expand control's chevron, rotated over `transition`; instant under reduced motion. */
function Chevron({ expanded, color, duration }: { expanded: boolean; color: string; duration: number }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, { toValue, duration, easing: toEasing(t.motionEasingStandard), useNativeDriver: false }).start();
  }, [expanded, reducedMotion, duration, rotation, t.motionEasingStandard]);
  const style: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
  };
  return (
    <Animated.View style={style}>
      <Icon name="chevron-right" size="sm" color={color} />
    </Animated.View>
  );
}

interface ResizeHandleProps {
  width: number;
  minWidth: number;
  color: string;
  handleWidth: number;
  hitSlop: number;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
}

/** The draggable edge of a resizable column header, on core `PanResponder` (no gesture-handler dependency). */
function ResizeHandle({ width, minWidth, color, handleWidth, hitSlop, onResize, onResizeEnd }: ResizeHandleProps): React.JSX.Element {
  const widthRef = React.useRef(width);
  widthRef.current = width;
  const startRef = React.useRef(width);
  const callbacks = React.useRef({ onResize, onResizeEnd, minWidth });
  callbacks.current = { onResize, onResizeEnd, minWidth };
  const responder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startRef.current = widthRef.current;
      },
      onPanResponderMove: (_event, gesture) => callbacks.current.onResize(Math.max(callbacks.current.minWidth, startRef.current + gesture.dx)),
      onPanResponderRelease: () => callbacks.current.onResizeEnd(widthRef.current),
      onPanResponderTerminate: () => callbacks.current.onResizeEnd(widthRef.current),
    }),
  ).current;
  return (
    <View
      {...responder.panHandlers}
      testID="TreeGrid.resizeHandle"
      accessibilityElementsHidden
      importantForAccessibility="no"
      hitSlop={{ left: hitSlop, right: hitSlop }}
      style={{ width: handleWidth, alignSelf: 'stretch', backgroundColor: color }}
    />
  );
}

/**
 * TreeGrid — a DataGrid whose rows nest, the hierarchy carried in the row-header
 * column (indent, an expand control, an announced level) while every other column
 * behaves as DataGrid.
 *
 * When to use: records that nest and each have several comparable fields — a chart
 * of accounts with balances, a bill of materials with quantities. `children: "lazy"`
 * keeps the first paint fast for deep trees; `selectChildren` makes selecting a row
 * mean "this and everything in it". Not for one field per node (Tree) or flat data
 * (DataGrid).
 *
 * Native structure follows DataGrid: a caption `Heading` (clipped, still announced,
 * with `hideCaption`), a horizontal `ScrollView` holding a `FlatList` with
 * `role="grid"` and the caption as its label over the flattened visible rows —
 * collapsed subtrees are absent from that list, which is what gets virtualized. The
 * root view offers `expandAll`/`collapseAll` accessibility actions (the touch
 * stand-in for `*`). Each row header is a focusable `Pressable` announcing
 * "{name}, Level {n}, {count} items" with `accessibilityState.expanded` and
 * `expand`/`collapse` actions when it has children; activating it (tap, hardware
 * Enter) toggles expansion, or edits/selects a leaf. A ghost `Button` with a
 * rotating chevron is the visible, minimum-target expand control. Indent is
 * `indent` per level beyond the first, and one guide line per ancestor level runs the
 * full row height, centred on that ancestor's expand button. A `"lazy"` row fires
 * `onExpand` every time it opens while still lazy, and shows one busy placeholder
 * row reading `copy.loading` until `children` is supplied.
 *
 * Hardware arrow, Home/End, `*`, F2, Space and Control+A handling is not available
 * on a React Native `View`; the editor's `TextInput` honours Enter (save) and
 * Escape (cancel).
 */
export function TreeGrid({
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
  overrides,
  onExpandChange,
  onExpand,
  onSortChange,
  onSelectionChange,
  onCellChange,
  onEditStart,
  onColumnResize,
  ref,
}: TreeGridProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const viewport = useWindowDimensions();
  const baseId = React.useId();

  const columnByKey = React.useMemo(() => new Map(columns.map((column) => [column.key, column] as const)), [columns]);
  const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
  const rowName = (row: TreeGridRow): string => (rowHeaderColumn !== undefined ? cellText(row, rowHeaderColumn.key) : '') || row.id;

  // ---- Bindings ----
  const indent = tokenOr<number>(t, overrides?.indent, t.space5);
  const expandButtonSize = t.sizeTargetMin;
  const expandGap = tokenOr<number>(t, overrides?.expandGap, t.layoutGapTight);
  const guideLine = tokenOr<string>(t, overrides?.guideLine, t.colorBorder);
  const guideLineWidth = tokenOr<number>(t, overrides?.guideLineWidth, t.borderWidthThin);
  const parentWeight = overrides?.parentWeight ?? PARENT_WEIGHT;
  const transition = tokenOr<number>(t, overrides?.transition, t.motionDurationFast);
  const gridLine = t.colorBorder;
  const gridLineWidth = t.borderWidthThin;
  const cellPaddingInline = t.space2;
  const rowHeight = density === 'comfortable' ? t.sizeTargetComfortable : t.sizeTargetMin;
  const resizeHandleWidth = t.space1;
  const resizeStep = t.space4;

  // ---- Sort ----
  const [internalSort, setInternalSort] = React.useState<TreeGridSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;
  const tree = React.useMemo(() => (sort === undefined && internalSort !== undefined ? sortTree(data, internalSort) : data), [data, sort, internalSort]);

  const [sortAnnouncement, setSortAnnouncement] = React.useState('');
  const handleSort = (column: DataGridColumn): void => {
    const direction: TreeGridSortDirection = activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (sort === undefined) {
      setInternalSort({ column: column.key, direction });
    }
    onSortChange?.(column.key, direction);
    const message = COPY.sortedAnnouncement(column.header, direction);
    setSortAnnouncement(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  // ---- Expansion ----
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() => (defaultExpanded?.includes('*') ? expandableIds(data) : (defaultExpanded ?? [])));
  const expandedIds = expanded ?? internalExpanded;
  const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);

  const commitExpanded = (next: string[]): void => {
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandChange?.(next);
  };

  const toggleExpand = (row: TreeGridRow): void => {
    if (expandedSet.has(row.id)) {
      commitExpanded(expandedIds.filter((id) => id !== row.id));
      return;
    }
    if (row.children === 'lazy') {
      onExpand?.(row.id);
    }
    commitExpanded([...expandedIds, row.id]);
  };

  const handleRootAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'expandAll') {
      commitExpanded(expandableIds(tree));
    } else if (event.nativeEvent.actionName === 'collapseAll') {
      commitExpanded([]);
    }
  };

  const rows = React.useMemo(() => flattenTree(tree, expandedSet, 1), [tree, expandedSet]);
  const allIds = React.useMemo(() => loadedIds(tree), [tree]);
  const total = allIds.length;

  // ---- Selection ----
  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const [activeCell, setActiveCell] = React.useState<TreeGridCellSelection | null>(null);

  const commitRows = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };

  const checkStateOf = (row: TreeGridRow): CheckState => (selectChildren ? derivedCheckState(row, selectedSet) : selectedSet.has(row.id) ? 'checked' : 'unchecked');

  const toggleRow = (row: TreeGridRow): void => {
    const ids = selectChildren && Array.isArray(row.children) ? [row.id, ...loadedIds(row.children)] : [row.id];
    const clear = checkStateOf(row) === 'checked';
    const next = new Set(selectedSet);
    ids.forEach((id) => (clear ? next.delete(id) : next.add(id)));
    commitRows(Array.from(next));
  };

  const allSelected = total > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitRows(allSelected ? [] : allIds);

  const selectCell = (rowId: string, column: string): void => {
    const next: TreeGridCellSelection = { rowId, column };
    setActiveCell(next);
    onSelectionChange?.(next);
  };

  // ---- Editing ----
  const [editing, setEditing] = React.useState<TreeGridCellSelection | null>(null);
  const [draft, setDraft] = React.useState('');
  const [editError, setEditError] = React.useState<string | undefined>(undefined);
  const [selectEditor, setSelectEditor] = React.useState<TreeGridCellSelection | null>(null);

  const commitEdit = (row: TreeGridRow, column: DataGridColumn, value: TreeGridCellValue): void => {
    const message = column.validate?.(value, row);
    if (message !== undefined) {
      setEditError(message);
      return;
    }
    onCellChange?.(row.id, column.key, value, cellValue(row, column.key));
    setEditing(null);
    setEditError(undefined);
    setSelectEditor(null);
  };

  const cancelEdit = (): void => {
    setEditing(null);
    setEditError(undefined);
  };

  const canEdit = (column: DataGridColumn): boolean => editable && column.editable === true;

  const startEdit = (row: TreeGridRow, column: DataGridColumn): void => {
    if (!canEdit(column) || onEditStart?.(row.id, column.key) === false) {
      return;
    }
    if (column.editor === 'checkbox') {
      commitEdit(row, column, !row[column.key]);
    } else if (column.editor === 'select') {
      setSelectEditor({ rowId: row.id, column: column.key });
    } else {
      setEditing({ rowId: row.id, column: column.key });
      setDraft(cellText(row, column.key));
      setEditError(undefined);
    }
  };

  const draftValue = (column: DataGridColumn): TreeGridCellValue => {
    if (column.editor === 'number' && draft.trim() !== '' && !Number.isNaN(Number(draft))) {
      return Number(draft);
    }
    return draft;
  };

  // ---- Columns ----
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const widthFor = (column: DataGridColumn): number => widths[column.key] ?? column.width ?? DEFAULT_COLUMN_WIDTH;
  const minWidthFor = (column: DataGridColumn): number => column.minWidth ?? t.sizeTargetMin;
  const resizeTo = (column: DataGridColumn, width: number): void => setWidths((prev) => ({ ...prev, [column.key]: width }));

  const [focused, setFocused] = React.useState<string | null>(null);

  const selectColumnStyle: ViewStyle = { width: t.sizeTargetComfortable, alignItems: 'center', justifyContent: 'center' };
  const cellFrame = (column: DataGridColumn): ViewStyle => ({
    width: widthFor(column),
    paddingHorizontal: cellPaddingInline,
    justifyContent: 'center',
    borderEndWidth: gridLineWidth,
    borderEndColor: gridLine,
  });
  const focusRing = (visible: boolean): React.JSX.Element | null =>
    visible ? (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[StyleSheet.absoluteFill, { borderWidth: t.borderWidthFocus, borderColor: t.colorBorderFocus, pointerEvents: 'none' }]}
      />
    ) : null;

  // ---- Header ----
  const headerRow = (
    <View testID="TreeGrid.header" role="rowgroup" style={{ backgroundColor: t.colorBackgroundSubtle }}>
      <View testID="TreeGrid.headerRow" role="row" style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: rowHeight, borderBottomWidth: gridLineWidth, borderBottomColor: t.colorBorderStrong }}>
        {selectable === 'row' ? (
          <View testID="TreeGrid.selectAllCell" role="columnheader" style={[selectColumnStyle, { borderEndWidth: gridLineWidth, borderEndColor: gridLine }]}>
            <Checkbox label={COPY.selectAll} hideLabel name={`${baseId}-all`} checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
          </View>
        ) : null}
        {columns.map((column) => {
          const width = widthFor(column);
          const sorted = activeSort?.column === column.key;
          const handleAction = (event: AccessibilityActionEvent): void => {
            const delta = event.nativeEvent.actionName === 'increment' ? resizeStep : event.nativeEvent.actionName === 'decrement' ? -resizeStep : 0;
            if (delta === 0) {
              return;
            }
            const next = Math.max(minWidthFor(column), width + delta);
            resizeTo(column, next);
            onColumnResize?.(column.key, next);
          };
          return (
            <View
              key={column.key}
              testID="TreeGrid.columnHeader"
              role="columnheader"
              accessibilityActions={
                column.resizable === true
                  ? [
                      { name: 'increment', label: COPY.resize(column.header) },
                      { name: 'decrement', label: COPY.resize(column.header) },
                    ]
                  : undefined
              }
              onAccessibilityAction={column.resizable === true ? handleAction : undefined}
              style={[cellFrame(column), { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
            >
              {column.sortable === true ? (
                <View testID="TreeGrid.sortButton" style={{ flex: 1, alignItems: JUSTIFY[column.align ?? 'start'] }}>
                  <Button
                    label={column.abbr ?? column.header}
                    variant="ghost"
                    size="sm"
                    accessibilityHint={sorted && activeSort.direction === 'ascending' ? COPY.sortDescending(column.header) : COPY.sortAscending(column.header)}
                    trailingIcon={sorted ? <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} size="sm" color={t.colorForeground} /> : undefined}
                    onPress={() => handleSort(column)}
                  />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  <Text size="sm" weight="semibold" align={column.align ?? 'start'} truncate>
                    {column.header}
                  </Text>
                </View>
              )}
              {column.resizable === true ? (
                <ResizeHandle
                  width={width}
                  minWidth={minWidthFor(column)}
                  color={t.colorBorderStrong}
                  handleWidth={resizeHandleWidth}
                  hitSlop={(t.sizeTargetMin - resizeHandleWidth) / 2}
                  onResize={(next) => resizeTo(column, next)}
                  onResizeEnd={(next) => onColumnResize?.(column.key, next)}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );

  // ---- Body ----
  const renderEditor = (row: TreeGridRow, column: DataGridColumn): React.JSX.Element => {
    const handleKeyPress = (event: TextInputKeyPressEvent): void => {
      if (event.nativeEvent.key === 'Enter') {
        commitEdit(row, column, draftValue(column));
      } else if (event.nativeEvent.key === 'Escape') {
        cancelEdit();
      }
    };
    return (
      <TextInput
        testID="TreeGrid.editor"
        autoFocus
        value={draft}
        onChangeText={setDraft}
        onKeyPress={handleKeyPress}
        onSubmitEditing={() => commitEdit(row, column, draftValue(column))}
        onBlur={() => commitEdit(row, column, draftValue(column))}
        keyboardType={column.editor === 'number' ? 'numeric' : 'default'}
        accessibilityLabel={COPY.editing(column.header)}
        accessibilityHint={editError !== undefined ? COPY.invalid(editError) : undefined}
        style={{
          flex: 1,
          color: t.colorForeground,
          fontFamily: column.editor === 'number' ? t.fontFamilyMono : t.fontFamilyBody,
          fontSize: t.fontSizeSm,
          lineHeight: toLineHeight(t.fontLineHeightTight, t.fontSizeSm),
          textAlign: column.align === 'end' ? 'right' : column.align === 'center' ? 'center' : 'left',
          backgroundColor: editError !== undefined ? t.colorStatusDangerBackground : t.colorControlBackground,
          borderWidth: gridLineWidth,
          borderColor: editError !== undefined ? t.colorBorderDanger : t.colorBorderFocus,
        }}
      />
    );
  };

  const renderValue = (row: TreeGridRow, column: DataGridColumn, weight?: TokenRef | undefined): React.ReactNode => {
    if (column.render !== undefined) {
      return column.render(row);
    }
    return (
      <Text size="sm" align={column.align ?? 'start'} truncate overrides={{ lineHeight: 'font.lineHeight.tight', fontFamily: column.editor === 'number' ? 'font.family.mono' : undefined, fontWeight: weight }}>
        {cellText(row, column.key)}
      </Text>
    );
  };

  const renderDataCell = (row: TreeGridRow, column: DataGridColumn): React.JSX.Element => {
    const cellKey = `${row.id}:${column.key}`;
    const isEditing = sameCell(editing, row.id, column.key);
    const isSelected = selectable === 'cell' && sameCell(activeCell, row.id, column.key);
    if (isEditing) {
      return (
        <View key={column.key} testID="TreeGrid.cell" role="cell" style={[cellFrame(column), { alignItems: 'stretch' }]}>
          {renderEditor(row, column)}
        </View>
      );
    }
    if (canEdit(column) && column.editor === 'checkbox') {
      return (
        <View key={column.key} testID="TreeGrid.cell" role="cell" style={[cellFrame(column), { alignItems: JUSTIFY[column.align ?? 'start'] }]}>
          <Checkbox label={column.header} hideLabel name={`${baseId}-${row.id}-${column.key}`} checked={Boolean(row[column.key])} onChange={() => startEdit(row, column)} />
        </View>
      );
    }
    const interactive = canEdit(column) || selectable === 'cell';
    return (
      <Pressable
        key={column.key}
        testID="TreeGrid.cell"
        role="cell"
        focusable={interactive}
        accessibilityLabel={`${column.header}, ${cellText(row, column.key)}`}
        accessibilityState={selectable === 'cell' ? { selected: isSelected } : undefined}
        onPress={interactive ? () => (canEdit(column) ? startEdit(row, column) : selectCell(row.id, column.key)) : undefined}
        onFocus={() => setFocused(cellKey)}
        onBlur={() => setFocused((prev) => (prev === cellKey ? null : prev))}
        style={[cellFrame(column), { alignItems: JUSTIFY[column.align ?? 'start'], backgroundColor: isSelected ? t.colorBackgroundSubtle : undefined }]}
      >
        <View testID="TreeGrid.cellContent" style={{ alignSelf: 'stretch' }}>
          {renderValue(row, column)}
        </View>
        {focusRing(focused === cellKey)}
      </Pressable>
    );
  };

  /** One full-height line per ancestor level, centred on that ancestor's expand button. */
  const guideLines = (level: number): React.JSX.Element | null =>
    level > 1 ? (
      <View testID="TreeGrid.indent" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {Array.from({ length: level - 1 }, (_, ancestor) => (
          <View
            key={ancestor}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              start: cellPaddingInline + ancestor * indent + (expandButtonSize - guideLineWidth) / 2,
              width: guideLineWidth,
              backgroundColor: guideLine,
            }}
          />
        ))}
      </View>
    ) : null;

  const renderRowHeader = (flat: FlatRow, column: DataGridColumn): React.JSX.Element => {
    const { row, level } = flat;
    const name = rowName(row);
    const parent = hasChildren(row);
    const isExpanded = parent && expandedSet.has(row.id);
    const isEditing = sameCell(editing, row.id, column.key);
    const isSelected = selectable === 'cell' && sameCell(activeCell, row.id, column.key);
    const cellKey = `${row.id}:${column.key}`;
    const childCount = Array.isArray(row.children) ? row.children.length : undefined;
    const label = [name, COPY.level(level), ...(childCount !== undefined && childCount > 0 ? [COPY.childCount(childCount)] : [])].join(', ');

    const handleAction = (event: AccessibilityActionEvent): void => {
      const action = event.nativeEvent.actionName;
      if ((action === 'expand' && !isExpanded) || (action === 'collapse' && isExpanded)) {
        toggleExpand(row);
      }
    };
    const activate = (): void => {
      if (parent) {
        toggleExpand(row);
      } else if (canEdit(column)) {
        startEdit(row, column);
      } else if (selectable === 'cell') {
        selectCell(row.id, column.key);
      }
    };

    return (
      <Pressable
        key={column.key}
        testID="TreeGrid.rowHeader"
        role="rowheader"
        accessibilityLabel={label}
        accessibilityState={parent ? { expanded: isExpanded, selected: selectable === 'cell' ? isSelected : undefined } : selectable === 'cell' ? { selected: isSelected } : undefined}
        accessibilityActions={
          parent
            ? [
                { name: 'expand', label: COPY.expand(name) },
                { name: 'collapse', label: COPY.collapse(name) },
              ]
            : undefined
        }
        onAccessibilityAction={parent ? handleAction : undefined}
        onPress={activate}
        onLongPress={parent && canEdit(column) ? () => startEdit(row, column) : undefined}
        onFocus={() => setFocused(cellKey)}
        onBlur={() => setFocused((prev) => (prev === cellKey ? null : prev))}
        style={[
          cellFrame(column),
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingStart: cellPaddingInline + (level - 1) * indent,
            gap: expandGap,
            backgroundColor: isSelected ? t.colorBackgroundSubtle : undefined,
          },
        ]}
      >
        {guideLines(level)}
        <View testID="TreeGrid.expandButton" style={{ width: expandButtonSize, minHeight: t.sizeTargetMin, alignItems: 'center', justifyContent: 'center' }}>
          {parent ? (
            <Button
              label={isExpanded ? COPY.collapse(name) : COPY.expand(name)}
              variant="ghost"
              size="sm"
              iconOnly
              expanded={isExpanded}
              leadingIcon={<Chevron expanded={isExpanded} color={t.colorForeground} duration={transition} />}
              onPress={() => toggleExpand(row)}
            />
          ) : null}
        </View>
        <View testID="TreeGrid.cellContent" style={{ flex: 1, alignSelf: 'stretch', justifyContent: 'center' }}>
          {isEditing ? renderEditor(row, column) : renderValue(row, column, parent ? parentWeight : undefined)}
        </View>
        {focusRing(focused === cellKey)}
      </Pressable>
    );
  };

  const renderPlaceholder = (flat: FlatRow): React.JSX.Element => (
    <View testID="TreeGrid.row" role="row" accessibilityState={{ busy: true }} style={{ flexDirection: 'row', alignItems: 'stretch', height: rowHeight, borderBottomWidth: gridLineWidth, borderBottomColor: gridLine }}>
      {selectable === 'row' ? <View style={[selectColumnStyle, { borderEndWidth: gridLineWidth, borderEndColor: gridLine }]} /> : null}
      {columns.map((column) =>
        column.isRowHeader === true ? (
          <View key={column.key} role="rowheader" style={[cellFrame(column), { flexDirection: 'row', alignItems: 'center', paddingStart: cellPaddingInline + (flat.level - 1) * indent, gap: expandGap }]}>
            {guideLines(flat.level)}
            <View style={{ width: expandButtonSize }} />
            <Text size="sm" tone="muted" overrides={{ lineHeight: 'font.lineHeight.tight' }}>
              {COPY.loading}
            </Text>
          </View>
        ) : (
          <View key={column.key} role="cell" style={cellFrame(column)} />
        ),
      )}
    </View>
  );

  const renderRow = ({ item }: ListRenderItemInfo<FlatRow>): React.JSX.Element => {
    if (item.placeholder) {
      return renderPlaceholder(item);
    }
    const { row } = item;
    const checkState = checkStateOf(row);
    const rowSelected = selectable === 'row' && checkState === 'checked';
    return (
      <View
        testID="TreeGrid.row"
        role="row"
        accessibilityState={{ selected: selectable === 'row' ? rowSelected : undefined, busy: row.children === 'lazy' && expandedSet.has(row.id) ? true : undefined }}
        style={{ flexDirection: 'row', alignItems: 'stretch', height: rowHeight, borderBottomWidth: gridLineWidth, borderBottomColor: gridLine, backgroundColor: rowSelected ? t.colorBackgroundSubtle : t.colorBackground }}
      >
        {selectable === 'row' ? (
          <View testID="TreeGrid.selectCell" role="cell" style={[selectColumnStyle, { borderEndWidth: gridLineWidth, borderEndColor: gridLine }]}>
            <Checkbox
              label={COPY.selectRow(rowName(row))}
              hideLabel
              name={`${baseId}-${row.id}`}
              checked={checkState === 'checked'}
              indeterminate={checkState === 'indeterminate'}
              onChange={() => toggleRow(row)}
            />
          </View>
        ) : null}
        {columns.map((column) => (column.isRowHeader === true ? renderRowHeader(item, column) : renderDataCell(row, column)))}
      </View>
    );
  };

  // ---- Status ----
  let status: string;
  if (loading) {
    status = COPY.loading;
  } else if (editError !== undefined) {
    status = COPY.invalid(editError);
  } else if (editing !== null) {
    status = COPY.editing(columnByKey.get(editing.column)?.header ?? editing.column);
  } else if (selectable === 'row' && selectedIds.length > 0) {
    status = COPY.selectedRows(selectedIds.length, total);
  } else if (selectable === 'cell' && activeCell !== null) {
    const index = rows.findIndex((flat) => !flat.placeholder && flat.row.id === activeCell.rowId);
    status = COPY.position(index + 1, columnByKey.get(activeCell.column)?.header ?? activeCell.column);
  } else {
    status = COPY.rowCount(total);
  }

  const emptyState = (
    <View testID="TreeGrid.emptyState" style={{ paddingHorizontal: cellPaddingInline, minHeight: rowHeight, justifyContent: 'center' }}>
      <Text size="sm" tone="muted" overrides={{ lineHeight: 'font.lineHeight.tight' }}>
        {emptyMessage ?? COPY.empty}
      </Text>
    </View>
  );

  const listHeightStyle: ViewStyle | undefined = height === 'viewport' ? { height: viewport.height - 2 * t.layoutGapSection } : height === 'fixed' ? { height: t.space20 } : undefined;
  const contentWidth = columns.reduce((sum, column) => sum + widthFor(column), selectable === 'row' ? t.sizeTargetComfortable : 0) + t.borderWidthFocus;

  const selectEditorRow = selectEditor !== null ? findRow(tree, selectEditor.rowId) : null;
  const selectEditorColumn = selectEditor !== null ? columnByKey.get(selectEditor.column) : undefined;

  return (
    <View
      ref={ref}
      testID="TreeGrid"
      style={{ backgroundColor: t.colorBackground }}
      accessibilityActions={[
        { name: 'expandAll', label: COPY.expandAll },
        { name: 'collapseAll', label: COPY.collapseAll },
      ]}
      onAccessibilityAction={handleRootAction}
    >
      <View testID="TreeGrid.caption" style={hideCaption ? HIDDEN_STYLE : undefined}>
        <Heading level="2" size="md" overrides={{ marginBlockEnd: 'space.2' }}>
          {caption}
        </Heading>
      </View>
      <View testID="TreeGrid.container" style={{ borderStartWidth: gridLineWidth, borderTopWidth: gridLineWidth, borderColor: gridLine }}>
        <ScrollView testID="TreeGrid.scrollRegion" horizontal accessibilityHint={COPY.scrollHint} contentContainerStyle={{ minWidth: contentWidth, flexGrow: 1 }}>
          <View style={{ width: contentWidth }}>
            <FlatList
              testID="TreeGrid.grid"
              role="grid"
              accessibilityLabel={caption}
              accessibilityState={{ busy: loading }}
              data={rows}
              extraData={[selectedIds, activeSort, activeCell, focused, editing, draft, editError, widths, density, expandedIds]}
              keyExtractor={(flat) => flat.key}
              renderItem={renderRow}
              getItemLayout={(_items, index) => ({ length: rowHeight, offset: rowHeight * index, index })}
              ListHeaderComponent={headerRow}
              ListEmptyComponent={emptyState}
              stickyHeaderIndices={height !== 'content' || stickyHeader ? [0] : undefined}
              scrollEnabled={height !== 'content'}
              initialNumToRender={height === 'content' ? rows.length : undefined}
              style={listHeightStyle}
            />
          </View>
        </ScrollView>
      </View>
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text size="sm">{sortAnnouncement}</Text>
      </View>
      <View
        testID="TreeGrid.statusBar"
        role="status"
        accessibilityLiveRegion="polite"
        style={showStatusBar ? { padding: t.space2, backgroundColor: t.colorBackgroundSubtle } : HIDDEN_STYLE}
      >
        <Text size="xs" tone="muted" overrides={{ lineHeight: 'font.lineHeight.tight' }}>
          {status}
        </Text>
      </View>
      <BottomSheet open={selectEditor !== null} heading={selectEditorColumn?.header ?? ''} onClose={() => setSelectEditor(null)}>
        {selectEditorColumn !== undefined && selectEditorRow !== null ? (
          <Listbox
            label={selectEditorColumn.header}
            options={(selectEditorColumn.options ?? []).map((option) => ({ value: option.value, label: option.label }))}
            value={cellText(selectEditorRow, selectEditorColumn.key)}
            onChange={(value) => commitEdit(selectEditorRow, selectEditorColumn, String(value))}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}
