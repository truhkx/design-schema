import * as React from 'react';
import { Animated, FlatList, PanResponder, Pressable, ScrollView, TextInput, View } from 'react-native';
import type { AccessibilityActionEvent, ListRenderItemInfo, TextInputKeyPressEvent, TextStyle, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import type { DataGridColumn, DataGridColumnResize } from './DataGrid';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import { Text } from './Text';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

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

/** Controlled sort state; sorts siblings within each level and keeps the hierarchy. */
export interface TreeGridSort {
  column: string;
  direction: TreeGridSortDirection;
}

/** A single selected cell, in `selectable="cell"` mode. */
export interface TreeGridCellSelection {
  rowId: string;
  column: string;
}

export type TreeGridSelection = string[] | TreeGridCellSelection;

/** Payload of a committed edit. */
export interface TreeGridCellChange {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TreeGridOverridableBinding = 'indent' | 'expandButtonSize' | 'expandGap' | 'guideLine' | 'guideLineWidth' | 'parentWeight' | 'transition';

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
  /** Initially expanded ids. `["*"]` expands every loaded (non-lazy) row with children. */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort state; the caller sorts `data`. Applies within each level. */
  sort?: TreeGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself. */
  defaultSort?: TreeGridSort | undefined;
  /** `row` adds a checkbox column and toggles rows; `cell` selects one cell. */
  selectable?: TreeGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a parent sets or clears its own id and every loaded descendant; a parent's shown state derives from its loaded descendants. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` can be edited by tapping them. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: TreeGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true unless `height="content"`. */
  stickyHeader?: boolean | undefined;
  /** `viewport` fills the height available under the header; `content` grows with rows; `fixed` uses a fixed height. */
  height?: TreeGridHeight | undefined;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with the new array of expanded ids. */
  onExpandChange?: ((expanded: string[]) => void) | undefined;
  /** Fired with its id each time a row whose `children` is still `"lazy"` is expanded, so a failed load can retry. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TreeGridSort) => void) | undefined;
  /** Fired with the new selection: row ids or one cell. */
  onSelectionChange?: ((selection: TreeGridSelection) => void) | undefined;
  /** Fired when an edit commits, with the new and previous value. The caller updates `data`. */
  onCellChange?: ((change: TreeGridCellChange) => void) | undefined;
  /** Fired when an editor is about to open; return `false` to refuse editing that cell. */
  onEditStart?: ((target: TreeGridCellSelection) => boolean | void) | undefined;
  /** Fired with the column and its new width when a resizable column finishes being dragged. */
  onColumnResize?: ((resize: DataGridColumnResize) => void) | undefined;
}

const COPY = {
  expand: (rowName: string): string => `Expand ${rowName}`,
  collapse: (rowName: string): string => `Collapse ${rowName}`,
  level: (level: number): string => `Level ${level}`,
  childCount: (count: number): string => `${count} items`,
  loading: 'Loading',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  sortAscending: (column: string): string => `Sort by ${column}, ascending`,
  sortDescending: (column: string): string => `Sort by ${column}, descending`,
  sortedAnnouncement: (column: string, direction: TreeGridSortDirection): string => `Sorted by ${column}, ${direction}`,
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedRows: (count: number, total: number): string => `${count} of ${total} rows selected`,
  editing: (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`,
  invalid: (message: string): string => message,
  rowCount: (count: number): string => `${count} rows`,
  position: (row: number, column: string): string => `Row ${row}, ${column}`,
  resize: (column: string): string => `Resize ${column}`,
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
} as const;

const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

/** One row in the flattened, virtualizable visible-row list; collapsed subtrees never appear here. */
interface FlatRow {
  key: string;
  level: number;
  hasChildren: boolean;
  loading?: boolean | undefined;
  row?: TreeGridRow | undefined;
}

function cellValue(row: TreeGridRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareRows(a: TreeGridRow, b: TreeGridRow, column: string, direction: TreeGridSortDirection): number {
  const factor = direction === 'ascending' ? 1 : -1;
  const av = a[column];
  const bv = b[column];
  if (typeof av === 'string' && typeof bv === 'string') {
    return av.localeCompare(bv, undefined, { numeric: true }) * factor;
  }
  const an = Number(av);
  const bn = Number(bv);
  if (Number.isNaN(an) || Number.isNaN(bn)) {
    return 0;
  }
  return (an - bn) * factor;
}

function sortTree(rows: TreeGridRow[], sort: TreeGridSort): TreeGridRow[] {
  const sorted = [...rows].sort((a, b) => compareRows(a, b, sort.column, sort.direction));
  return sorted.map((row) => (Array.isArray(row.children) ? { ...row, children: sortTree(row.children, sort) } : row));
}

function rowHasChildren(row: TreeGridRow): boolean {
  return row.children === 'lazy' || (Array.isArray(row.children) && row.children.length > 0);
}

function flattenTree(rows: TreeGridRow[], expandedSet: Set<string>, level: number): FlatRow[] {
  const out: FlatRow[] = [];
  for (const row of rows) {
    const hasChildren = rowHasChildren(row);
    out.push({ key: row.id, level, hasChildren, row });
    if (hasChildren && expandedSet.has(row.id)) {
      if (row.children === 'lazy') {
        out.push({ key: `${row.id}::loading`, level: level + 1, hasChildren: false, loading: true });
      } else if (Array.isArray(row.children)) {
        out.push(...flattenTree(row.children, expandedSet, level + 1));
      }
    }
  }
  return out;
}

/** Every row that has loaded (array) children, at any depth — used for `["*"]` and expand-all. */
function collectExpandableIds(rows: TreeGridRow[]): string[] {
  const ids: string[] = [];
  for (const row of rows) {
    if (Array.isArray(row.children) && row.children.length > 0) {
      ids.push(row.id);
      ids.push(...collectExpandableIds(row.children));
    }
  }
  return ids;
}

/** Every loaded row id at any depth — used by select-all. */
function collectAllLoadedIds(rows: TreeGridRow[]): string[] {
  const ids: string[] = [];
  for (const row of rows) {
    ids.push(row.id);
    if (Array.isArray(row.children)) {
      ids.push(...collectAllLoadedIds(row.children));
    }
  }
  return ids;
}

function collectLoadedDescendantIds(row: TreeGridRow): string[] {
  if (!Array.isArray(row.children)) {
    return [];
  }
  const ids: string[] = [];
  for (const child of row.children) {
    ids.push(child.id);
    ids.push(...collectLoadedDescendantIds(child));
  }
  return ids;
}

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

function computeRowCheckState(row: TreeGridRow, selectedSet: Set<string>): CheckState {
  const descendantIds = collectLoadedDescendantIds(row);
  if (descendantIds.length === 0) {
    return selectedSet.has(row.id) ? 'checked' : 'unchecked';
  }
  if (descendantIds.every((id) => selectedSet.has(id))) {
    return 'checked';
  }
  if (descendantIds.every((id) => !selectedSet.has(id))) {
    return selectedSet.has(row.id) ? 'checked' : 'unchecked';
  }
  return 'indeterminate';
}

interface TreeGridChevronProps {
  expanded: boolean;
  color: string;
  duration: number;
  easing: readonly number[];
}

/** The row header's expand control, rotating a chevron over `transition`, skipped under reduced motion. */
function TreeGridChevron({ expanded, color, duration, easing }: TreeGridChevronProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const rotate = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    if (reducedMotion) {
      rotate.setValue(toValue);
      return;
    }
    Animated.timing(rotate, { toValue, duration, easing: toEasing(easing), useNativeDriver: false }).start();
  }, [expanded, reducedMotion, rotate, duration, easing]);

  const style: Animated.WithAnimatedValue<ViewStyle> = {
    transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) }],
  };

  return (
    <Animated.View style={style}>
      <Icon name="chevron-right" size="sm" color={color} />
    </Animated.View>
  );
}

interface TreeGridResizeHandleProps {
  width: number;
  minWidth: number;
  color: string;
  handleWidth: number;
  label: string;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
}

/** The draggable edge of a resizable column header, built on core `PanResponder` (the package permits no gesture-handler dependency). */
function TreeGridResizeHandle({ width, minWidth, color, handleWidth, label, onResize, onResizeEnd }: TreeGridResizeHandleProps): React.JSX.Element {
  const widthRef = React.useRef(width);
  widthRef.current = width;
  const startWidthRef = React.useRef(width);

  const responder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startWidthRef.current = widthRef.current;
      },
      onPanResponderMove: (_event, gesture) => {
        onResize(Math.max(minWidth, startWidthRef.current + gesture.dx));
      },
      onPanResponderRelease: () => onResizeEnd(widthRef.current),
      onPanResponderTerminate: () => onResizeEnd(widthRef.current),
    }),
  ).current;

  return (
    <View
      {...responder.panHandlers}
      role="separator"
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      style={{ width: handleWidth, alignSelf: 'stretch', backgroundColor: color }}
      testID="TreeGrid.resizeHandle"
    />
  );
}

/**
 * TreeGrid — a DataGrid whose rows nest, the hierarchy carried entirely in the row
 * header column (indent, an expand control, an announced level) while every other
 * column, cell and interaction behaves as DataGrid.
 *
 * When to use: Use a TreeGrid when records nest and each has several comparable
 * fields — a chart of accounts with balances, a bill of materials with quantities.
 * Use `children: "lazy"` for deep or large trees so the first paint is fast, and
 * `selectChildren` when selecting a row means "this and everything in it." Do not
 * use it for a hierarchy with one field per node (Tree) or flat data (DataGrid).
 *
 * There is no grid element on native, so this follows DataGrid's own approximation:
 * a caption (`Heading`, or hidden when `hideCaption`, though the caption always
 * remains the accessible name via `accessibilityLabel`), a horizontal `ScrollView`
 * (`role="grid"`) containing a `FlatList` over the rows visible after collapsing —
 * collapsed subtrees are simply absent from that list, which is also what gets
 * virtualized, so a large collapsed tree costs nothing. The root view exposes
 * `expandAll`/`collapseAll` accessibility actions named from `copy` (there being no
 * hardware `*` key on a touchscreen); each row header cell carries
 * `accessibilityState.expanded` when it has children, an accessibilityLabel of
 * "{name}, {copy.level}, {copy.childCount}" (the only place those two copy strings
 * are used, since the web platform relies on `aria-level`/`aria-setsize` instead),
 * and its own `expand`/`collapse` accessibility actions; a real, minimum-target
 * `Button` (rotating chevron) sits alongside it as a pointer/touch control, since
 * there are no arrow keys to fall back on. Indent is `space.5` per level as leading
 * padding; one full-height guide line per ancestor level is drawn beside it. A
 * `"lazy"` row fires `onExpand` on every expand while still lazy (so a failed load
 * can retry) and shows one placeholder child row reading `copy.loading` until the
 * caller replaces `children`.
 *
 * Sorting orders siblings within each level and keeps the hierarchy; a controlled
 * `sort` leaves ordering to the caller, otherwise the grid sorts `data` itself from
 * `defaultSort`. `selectable="row"` adds a `Checkbox` column; with `selectChildren`,
 * toggling a parent sets or clears itself and every loaded descendant, and a
 * parent's shown state (checked/indeterminate) is derived live from its loaded
 * descendants each render rather than only from its own stored id. `selectable="cell"`
 * tracks one active cell. `editable` columns open the same editors as DataGrid:
 * `checkbox` commits immediately, `select` opens a `BottomSheet` `Listbox`, `text`/
 * `number`/`date` open an inline `TextInput` committing on blur or hardware Enter
 * and cancelling on hardware Escape. The status bar doubles as the polite live
 * region for loading, editing and selection state; sort changes get their own
 * hidden live region.
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
  stickyHeader = true,
  height = 'viewport',
  loading = false,
  emptyMessage,
  showStatusBar = true,
  overrides,
  onExpandChange,
  onExpand,
  onSortChange,
  onSelectionChange,
  onCellChange,
  onEditStart,
  onColumnResize,
}: TreeGridProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  // ---- sort ----

  const [internalSort, setInternalSort] = React.useState<TreeGridSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;

  const sortedData = React.useMemo(() => {
    if (sort !== undefined || internalSort === undefined) {
      return data;
    }
    return sortTree(data, internalSort);
  }, [data, sort, internalSort]);

  const commitSort = (next: TreeGridSort): void => {
    if (sort === undefined) {
      setInternalSort(next);
    }
    onSortChange?.(next);
  };

  const handleSort = (columnKey: string): void => {
    const next: TreeGridSort =
      activeSort?.column === columnKey
        ? { column: columnKey, direction: activeSort.direction === 'ascending' ? 'descending' : 'ascending' }
        : { column: columnKey, direction: 'ascending' };
    commitSort(next);
  };

  const [sortAnnouncement, setSortAnnouncement] = React.useState('');
  const columnByKey = React.useMemo(() => new Map(columns.map((c) => [c.key, c] as const)), [columns]);
  const isFirstSort = React.useRef(true);
  React.useEffect(() => {
    if (isFirstSort.current) {
      isFirstSort.current = false;
      return;
    }
    if (activeSort === undefined) {
      return;
    }
    setSortAnnouncement(COPY.sortedAnnouncement(columnByKey.get(activeSort.column)?.header ?? activeSort.column, activeSort.direction));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSort?.column, activeSort?.direction]);

  // ---- expansion ----

  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() =>
    defaultExpanded?.includes('*') ? collectExpandableIds(data) : (defaultExpanded ?? []),
  );
  const expandedIds = expanded ?? internalExpanded;
  const expandedSet = React.useMemo(() => new Set(expandedIds), [expandedIds]);

  const commitExpanded = (next: string[]): void => {
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandChange?.(next);
  };

  const toggleExpand = (row: TreeGridRow): void => {
    const isExpanded = expandedSet.has(row.id);
    if (!isExpanded && row.children === 'lazy') {
      onExpand?.(row.id);
    }
    commitExpanded(isExpanded ? expandedIds.filter((id) => id !== row.id) : [...expandedIds, row.id]);
  };

  // ---- selection ----

  const effectiveSelectable = selectable;
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<string[]>(defaultSelected ?? []);
  const selectedRowIds = selected ?? internalSelectedRows;
  const selectedSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds]);

  const [activeCell, setActiveCell] = React.useState<TreeGridCellSelection | null>(null);
  const [focusedCellKey, setFocusedCellKey] = React.useState<string | null>(null);

  const commitRowSelection = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelectedRows(next);
    }
    onSelectionChange?.(next);
  };

  const toggleRow = (row: TreeGridRow): void => {
    if (selectChildren) {
      const ids = [row.id, ...collectLoadedDescendantIds(row)];
      const checked = computeRowCheckState(row, selectedSet) === 'checked';
      const next = new Set(selectedSet);
      ids.forEach((id) => (checked ? next.delete(id) : next.add(id)));
      commitRowSelection(Array.from(next));
      return;
    }
    const next = new Set(selectedSet);
    if (next.has(row.id)) {
      next.delete(row.id);
    } else {
      next.add(row.id);
    }
    commitRowSelection(Array.from(next));
  };

  const allLoadedIds = React.useMemo(() => collectAllLoadedIds(sortedData), [sortedData]);
  const allSelected = allLoadedIds.length > 0 && allLoadedIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allLoadedIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitRowSelection(allSelected ? [] : allLoadedIds);

  const selectCellTarget = (rowId: string, column: string): void => {
    const next: TreeGridCellSelection = { rowId, column };
    setActiveCell(next);
    onSelectionChange?.(next);
  };

  const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
  const rowName = (row: TreeGridRow): string => (rowHeaderColumn ? cellValue(row, rowHeaderColumn.key) || row.id : row.id);

  // ---- editing ----

  const [editingCell, setEditingCell] = React.useState<TreeGridCellSelection | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [editingError, setEditingError] = React.useState<string | undefined>(undefined);
  const [selectEditorTarget, setSelectEditorTarget] = React.useState<TreeGridCellSelection | null>(null);

  const startEdit = (row: TreeGridRow, column: DataGridColumn): void => {
    if (!editable || column.editable !== true) {
      return;
    }
    const allowed = onEditStart?.({ rowId: row.id, column: column.key });
    if (allowed === false) {
      return;
    }
    if (column.editor === 'checkbox') {
      commitEdit(row, column, !row[column.key]);
      return;
    }
    if (column.editor === 'select') {
      setSelectEditorTarget({ rowId: row.id, column: column.key });
      return;
    }
    setEditingCell({ rowId: row.id, column: column.key });
    setEditingValue(cellValue(row, column.key));
    setEditingError(undefined);
  };

  const commitEdit = (row: TreeGridRow, column: DataGridColumn, value: unknown): void => {
    const validationError = column.validate?.(value, row);
    if (validationError !== undefined) {
      setEditingError(validationError);
      return;
    }
    const previous = row[column.key];
    onCellChange?.({ rowId: row.id, column: column.key, value, previous });
    setEditingCell(null);
    setEditingError(undefined);
    setSelectEditorTarget(null);
  };

  const cancelEdit = (): void => {
    setEditingCell(null);
    setEditingError(undefined);
  };

  // ---- tokens ----

  const gridLineColor = t.colorBorder;
  const gridLineWidth = t.borderWidthThin;
  const headerBorderColor = t.colorBorderStrong;
  const headerBorderWidth = t.borderWidthThin;
  const cellPaddingInline = t.space2;
  const cellFocusRingWidth = t.borderWidthFocus;
  const rowHeightValue = t.sizeTargetMin;
  const rowHeightComfortableValue = t.sizeTargetComfortable;
  const activeRowHeight = density === 'compact' ? rowHeightValue : rowHeightComfortableValue;
  const fixedHeightValue = t.space20;

  const indentSize = overrides?.indent ? (resolveToken(t, overrides.indent) as number) : t.space5;
  const expandButtonSize = overrides?.expandButtonSize ? (resolveToken(t, overrides.expandButtonSize) as number) : t.sizeTargetMin;
  const expandGap = overrides?.expandGap ? (resolveToken(t, overrides.expandGap) as number) : t.layoutGapTight;
  const guideLineColor = overrides?.guideLine ? (resolveToken(t, overrides.guideLine) as string) : t.colorBorder;
  const guideLineWidth = overrides?.guideLineWidth ? (resolveToken(t, overrides.guideLineWidth) as number) : t.borderWidthThin;
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;
  const parentWeightRef = overrides?.parentWeight ?? ('font.weight.medium' as TokenRef);

  const widthFor = (column: DataGridColumn): number => columnWidths[column.key] ?? column.width ?? column.minWidth ?? t.space20;
  const minWidthFor = (column: DataGridColumn): number => column.minWidth ?? t.sizeTargetMin;

  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

  const orderedColumns = React.useMemo(() => {
    const pinnedStart = columns.filter((c) => c.pinned === 'start');
    const pinnedEnd = columns.filter((c) => c.pinned === 'end');
    const middle = columns.filter((c) => c.pinned !== 'start' && c.pinned !== 'end');
    return [...pinnedStart, ...middle, ...pinnedEnd];
  }, [columns]);

  const flatRows = React.useMemo(() => flattenTree(sortedData, expandedSet, 1), [sortedData, expandedSet]);
  const visibleRowCount = flatRows.filter((r) => !r.loading).length;

  const selectCellStyle: ViewStyle = { width: t.sizeTargetComfortable, alignItems: 'center', justifyContent: 'center' };

  const showEmpty = flatRows.length === 0;
  const emptyText = loading && showEmpty ? COPY.loading : (emptyMessage ?? COPY.empty);

  // ---- header ----

  const stickyHeaderEffective = height === 'content' ? stickyHeader : true;

  const renderColumnHeader = (column: DataGridColumn): React.JSX.Element => {
    const width = widthFor(column);
    const isSorted = activeSort?.column === column.key;
    const headerCellStyle: ViewStyle = {
      width,
      paddingHorizontal: cellPaddingInline,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRightWidth: gridLineWidth,
      borderRightColor: gridLineColor,
      backgroundColor: t.colorBackgroundSubtle,
    };

    return (
      <View key={column.key} style={headerCellStyle} role="columnheader" accessibilityRole="header" testID="TreeGrid.columnHeader">
        {column.sortable ? (
          <View style={{ flex: 1 }} testID="TreeGrid.sortButton">
            <Button
              label={column.abbr ?? column.header}
              variant="ghost"
              size="sm"
              trailingIcon={
                isSorted ? <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorForeground} /> : undefined
              }
              onPress={() => handleSort(column.key)}
            />
            {isSorted ? (
              <View style={HIDDEN_STYLE}>
                <Text>{activeSort.direction === 'ascending' ? COPY.sortAscending(column.header) : COPY.sortDescending(column.header)}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text size="sm" weight="semibold" truncate>
            {column.header}
          </Text>
        )}
        {column.resizable ? (
          <TreeGridResizeHandle
            width={width}
            minWidth={minWidthFor(column)}
            color={t.colorBorderStrong}
            handleWidth={t.space1}
            label={COPY.resize(column.header)}
            onResize={(next) => setColumnWidths((prev) => ({ ...prev, [column.key]: next }))}
            onResizeEnd={(next) => onColumnResize?.({ column: column.key, width: next })}
          />
        ) : null}
      </View>
    );
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: t.colorBackgroundSubtle,
    borderBottomWidth: headerBorderWidth,
    borderBottomColor: headerBorderColor,
  };

  const renderHeader = (): React.JSX.Element => (
    <View role="rowgroup" testID="TreeGrid.header">
      <View style={headerRowStyle} role="row" testID="TreeGrid.headerRow">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="TreeGrid.selectAllCell">
            <Checkbox label={COPY.selectAll} name="tree-grid-select-all" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
          </View>
        ) : null}
        {orderedColumns.map((column) => renderColumnHeader(column))}
      </View>
    </View>
  );

  // ---- body ----

  const renderEditor = (row: TreeGridRow, column: DataGridColumn): React.JSX.Element => {
    const editorStyle: TextStyle = {
      minHeight: t.sizeTargetMin,
      color: t.colorForeground,
      fontFamily: column.editor === 'number' ? t.fontFamilyMono : t.fontFamilyBody,
      fontSize: t.fontSizeSm,
      lineHeight: toLineHeight(t.fontSizeSm, t.fontLineHeightTight),
      paddingVertical: t.space1,
    };

    const handleKeyPress = (event: TextInputKeyPressEvent): void => {
      if (event.nativeEvent.key === 'Enter') {
        commitEdit(row, column, editingValue);
      } else if (event.nativeEvent.key === 'Escape') {
        cancelEdit();
      }
    };

    return (
      <TextInput
        autoFocus
        value={editingValue}
        onChangeText={setEditingValue}
        onKeyPress={handleKeyPress}
        onBlur={() => commitEdit(row, column, editingValue)}
        keyboardType={column.editor === 'number' ? 'numeric' : 'default'}
        accessibilityLabel={COPY.editing(column.header)}
        accessibilityHint={editingError}
        style={editorStyle}
        testID="TreeGrid.editor"
      />
    );
  };

  const renderDataCell = (flatRow: FlatRow, column: DataGridColumn): React.JSX.Element => {
    const row = flatRow.row as TreeGridRow;
    const width = widthFor(column);
    const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
    const cellKey = `${row.id}:${column.key}`;
    const isFocused = focusedCellKey === cellKey;
    const isCellSelected = effectiveSelectable === 'cell' && activeCell?.rowId === row.id && activeCell.column === column.key;
    const hasError = isEditingThis && editingError !== undefined;
    const canEdit = editable && column.editable === true;
    const isCheckboxEditor = canEdit && column.editor === 'checkbox';

    const cellOuterStyle: ViewStyle = {
      width,
      paddingHorizontal: cellPaddingInline,
      justifyContent: 'center',
      borderRightWidth: gridLineWidth,
      borderRightColor: gridLineColor,
      backgroundColor: hasError ? t.colorStatusDangerBackground : isEditingThis ? t.colorControlBackground : isCellSelected ? t.colorBackgroundSubtle : 'transparent',
      borderWidth: isFocused ? cellFocusRingWidth : hasError ? gridLineWidth : 0,
      borderColor: isFocused ? t.colorBorderFocus : hasError ? t.colorBorderDanger : 'transparent',
    };

    let content: React.ReactNode;
    if (isEditingThis) {
      content = renderEditor(row, column);
    } else if (isCheckboxEditor) {
      content = (
        <Checkbox
          label={`${column.header}: ${row[column.key] ? 'checked' : 'unchecked'}`}
          name={`tree-grid-${row.id}-${column.key}`}
          checked={Boolean(row[column.key])}
          onChange={(next) => commitEdit(row, column, next)}
        />
      );
    } else if (column.render) {
      content = column.render(row);
    } else {
      content = (
        <Text size="sm" align={column.align ?? 'start'} truncate>
          {cellValue(row, column.key)}
        </Text>
      );
    }

    if (isEditingThis || isCheckboxEditor) {
      return (
        <View key={column.key} style={cellOuterStyle} role="cell" testID="TreeGrid.cell">
          {content}
        </View>
      );
    }

    return (
      <Pressable
        key={column.key}
        style={cellOuterStyle}
        onPress={() => {
          if (canEdit) {
            startEdit(row, column);
          } else if (effectiveSelectable === 'cell') {
            selectCellTarget(row.id, column.key);
          }
        }}
        onFocus={() => setFocusedCellKey(cellKey)}
        onBlur={() => setFocusedCellKey((prev) => (prev === cellKey ? null : prev))}
        accessibilityLabel={`${column.header}: ${cellValue(row, column.key)}`}
        accessibilityHint={canEdit ? 'double tap to edit' : undefined}
        accessibilityState={isCellSelected ? { selected: true } : undefined}
        role="cell"
        testID="TreeGrid.cell"
      >
        {content}
      </Pressable>
    );
  };

  const renderGuideLines = (level: number): React.JSX.Element[] =>
    Array.from({ length: level - 1 }, (_, index) => (
      <View key={index} style={{ width: indentSize, alignSelf: 'stretch', alignItems: 'center' }} testID="TreeGrid.indent">
        <View style={{ width: guideLineWidth, flex: 1, backgroundColor: guideLineColor }} />
      </View>
    ));

  const renderRowHeaderCell = (flatRow: FlatRow, column: DataGridColumn): React.JSX.Element => {
    const row = flatRow.row as TreeGridRow;
    const width = widthFor(column);
    const isExpanded = expandedSet.has(row.id);
    const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
    const canEdit = editable && column.editable === true;
    const name = rowName(row);
    const childCount = Array.isArray(row.children) ? row.children.length : undefined;
    const label = flatRow.hasChildren
      ? `${name}, ${COPY.level(flatRow.level)}${childCount !== undefined ? `, ${COPY.childCount(childCount)}` : ''}`
      : `${name}, ${COPY.level(flatRow.level)}`;

    const handleAction = (event: AccessibilityActionEvent): void => {
      if (event.nativeEvent.actionName === 'expand' && !isExpanded) {
        toggleExpand(row);
      } else if (event.nativeEvent.actionName === 'collapse' && isExpanded) {
        toggleExpand(row);
      }
    };

    const cellOuterStyle: ViewStyle = {
      width,
      paddingHorizontal: cellPaddingInline,
      flexDirection: 'row',
      alignItems: 'center',
      borderRightWidth: gridLineWidth,
      borderRightColor: gridLineColor,
    };

    return (
      <View
        key={column.key}
        style={cellOuterStyle}
        role="rowheader"
        accessible
        accessibilityLabel={label}
        accessibilityState={flatRow.hasChildren ? { expanded: isExpanded } : undefined}
        accessibilityActions={flatRow.hasChildren ? [{ name: 'expand', label: COPY.expand(name) }, { name: 'collapse', label: COPY.collapse(name) }] : undefined}
        onAccessibilityAction={flatRow.hasChildren ? handleAction : undefined}
        testID="TreeGrid.rowHeader"
      >
        {renderGuideLines(flatRow.level)}
        <View style={{ width: expandButtonSize, alignItems: 'center', justifyContent: 'center' }} testID="TreeGrid.expandButton">
          {flatRow.hasChildren ? (
            <Button
              label={isExpanded ? COPY.collapse(name) : COPY.expand(name)}
              variant="ghost"
              size="sm"
              iconOnly
              expanded={isExpanded}
              leadingIcon={<TreeGridChevron expanded={isExpanded} color={t.colorForeground} duration={transitionDuration} easing={t.motionEasingStandard} />}
              onPress={() => toggleExpand(row)}
            />
          ) : null}
        </View>
        <View style={{ width: expandGap }} />
        <View style={{ flex: 1 }} testID="TreeGrid.cellContent">
          {isEditingThis ? (
            renderEditor(row, column)
          ) : canEdit ? (
            <Pressable onPress={() => startEdit(row, column)} accessibilityHint="double tap to edit">
              <Text size="sm" truncate overrides={flatRow.hasChildren ? { fontWeight: parentWeightRef } : undefined}>
                {name}
              </Text>
            </Pressable>
          ) : (
            <Text size="sm" truncate overrides={flatRow.hasChildren ? { fontWeight: parentWeightRef } : undefined}>
              {name}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderLoadingRow = (flatRow: FlatRow): React.JSX.Element => {
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: activeRowHeight,
      borderBottomWidth: gridLineWidth,
      borderBottomColor: gridLineColor,
      backgroundColor: t.colorBackground,
      paddingHorizontal: cellPaddingInline,
    };
    return (
      <View style={rowStyle} role="row" accessibilityState={{ busy: true }} testID="TreeGrid.row">
        {effectiveSelectable === 'row' ? <View style={selectCellStyle} /> : null}
        {renderGuideLines(flatRow.level)}
        <View style={{ width: expandButtonSize }} />
        <View style={{ width: expandGap }} />
        <Text size="sm" tone="muted">
          {COPY.loading}
        </Text>
      </View>
    );
  };

  const renderRow = ({ item: flatRow }: ListRenderItemInfo<FlatRow>): React.JSX.Element => {
    if (flatRow.loading) {
      return renderLoadingRow(flatRow);
    }
    const row = flatRow.row as TreeGridRow;
    const checkState: CheckState = selectChildren ? computeRowCheckState(row, selectedSet) : selectedSet.has(row.id) ? 'checked' : 'unchecked';
    const isRowSelected = effectiveSelectable === 'row' && checkState === 'checked';
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: activeRowHeight,
      borderBottomWidth: gridLineWidth,
      borderBottomColor: gridLineColor,
      backgroundColor: isRowSelected ? t.colorBackgroundSubtle : t.colorBackground,
    };

    return (
      <View style={rowStyle} role="row" accessibilityState={effectiveSelectable !== 'none' ? { selected: isRowSelected } : undefined} testID="TreeGrid.row">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="TreeGrid.selectCell">
            <Checkbox
              label={COPY.selectRow(rowName(row))}
              name={`tree-grid-row-${row.id}`}
              checked={checkState === 'checked'}
              indeterminate={checkState === 'indeterminate'}
              onChange={() => toggleRow(row)}
            />
          </View>
        ) : null}
        {orderedColumns.map((column) => (column.isRowHeader ? renderRowHeaderCell(flatRow, column) : renderDataCell(flatRow, column)))}
      </View>
    );
  };

  const getItemLayout = (_listData: ArrayLike<FlatRow> | null | undefined, index: number): { length: number; offset: number; index: number } => ({
    length: activeRowHeight,
    offset: activeRowHeight * index,
    index,
  });

  const containerHeightStyle: ViewStyle = height === 'fixed' ? { height: fixedHeightValue } : height === 'viewport' ? { flex: 1 } : {};
  const totalContentWidth = orderedColumns.reduce((sum, column) => sum + widthFor(column), 0) + (effectiveSelectable === 'row' ? t.sizeTargetComfortable : 0);

  const grid = (
    <FlatList
      data={flatRows}
      keyExtractor={(item) => item.key}
      renderItem={renderRow}
      extraData={[expandedIds, selectedRowIds, activeCell, editingCell, editingError, columnWidths, focusedCellKey, activeSort]}
      ListHeaderComponent={renderHeader}
      stickyHeaderIndices={stickyHeaderEffective ? [0] : undefined}
      getItemLayout={getItemLayout}
      scrollEnabled={height !== 'content'}
      style={height === 'content' ? undefined : { flex: 1 }}
      accessibilityState={{ busy: loading }}
      ListEmptyComponent={
        <View style={{ padding: cellPaddingInline }} accessible accessibilityLabel={emptyText} testID="TreeGrid.emptyState">
          <Text tone="muted">{emptyText}</Text>
        </View>
      }
      testID="TreeGrid.grid"
    />
  );

  const scrollRegion = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      contentContainerStyle={{ minWidth: totalContentWidth, flexGrow: 1 }}
      accessibilityLabel={caption}
      accessibilityHint={COPY.scrollHint}
      accessibilityState={{ busy: loading }}
      role="grid"
      testID="TreeGrid.scrollRegion"
    >
      <View style={[{ flex: 1 }, containerHeightStyle]}>{grid}</View>
    </ScrollView>
  );

  // ---- status bar ----

  let statusText: string;
  if (loading) {
    statusText = COPY.loading;
  } else if (editingError !== undefined) {
    statusText = COPY.invalid(editingError);
  } else if (editingCell !== null) {
    statusText = COPY.editing(columnByKey.get(editingCell.column)?.header ?? editingCell.column);
  } else if (effectiveSelectable === 'row' && selectedRowIds.length > 0) {
    statusText = COPY.selectedRows(selectedRowIds.length, visibleRowCount);
  } else if (effectiveSelectable === 'cell' && activeCell !== null) {
    const activeRowIndex = flatRows.findIndex((fr) => !fr.loading && fr.row?.id === activeCell.rowId);
    const activeColumn = columnByKey.get(activeCell.column);
    statusText = COPY.position(activeRowIndex + 1, activeColumn?.header ?? activeCell.column);
  } else {
    statusText = COPY.rowCount(visibleRowCount);
  }

  // ---- select editor (BottomSheet) ----

  const findRow = (rows: TreeGridRow[], id: string): TreeGridRow | null => {
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
  };

  const selectEditorRow = selectEditorTarget ? findRow(sortedData, selectEditorTarget.rowId) : null;
  const selectEditorColumn = selectEditorTarget ? (columnByKey.get(selectEditorTarget.column) ?? null) : null;

  const handleRootAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'expandAll') {
      commitExpanded(collectExpandableIds(sortedData));
    } else if (event.nativeEvent.actionName === 'collapseAll') {
      commitExpanded([]);
    }
  };

  return (
    <View
      testID="TreeGrid"
      accessibilityActions={[
        { name: 'expandAll', label: COPY.expandAll },
        { name: 'collapseAll', label: COPY.collapseAll },
      ]}
      onAccessibilityAction={handleRootAction}
    >
      {!hideCaption ? (
        <View testID="TreeGrid.caption">
          <Heading level="2">{caption}</Heading>
        </View>
      ) : null}
      <View style={containerHeightStyle} testID="TreeGrid.container">
        {scrollRegion}
      </View>
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text>{sortAnnouncement}</Text>
      </View>
      {showStatusBar ? (
        <View style={{ paddingHorizontal: t.space2, paddingVertical: t.space2, backgroundColor: t.colorBackgroundSubtle }} role="status" accessibilityLiveRegion="polite" testID="TreeGrid.statusBar">
          <Text size="xs" tone="muted">
            {statusText}
          </Text>
        </View>
      ) : null}
      <BottomSheet open={selectEditorTarget !== null} heading={selectEditorColumn?.header ?? ''} onClose={() => setSelectEditorTarget(null)}>
        {selectEditorColumn && selectEditorRow ? (
          <Listbox
            label={selectEditorColumn.header}
            options={(selectEditorColumn.options ?? []).map((option) => ({ value: option.value, label: option.label }))}
            value={cellValue(selectEditorRow, selectEditorColumn.key)}
            onChange={(value) => commitEdit(selectEditorRow, selectEditorColumn, value)}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}
