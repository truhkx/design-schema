import * as React from 'react';
import {
  AccessibilityInfo,
  FlatList,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import type {
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInputKeyPressEvent,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Listbox } from './Listbox';
import { Text } from './Text';
import { toLineHeight, useTheme } from './theme';

export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';

/** A single record. `id` must be stable; it is what selection and keys use. */
export interface DataGridRow {
  id: string;
  [key: string]: unknown;
}

/** One option for a `select` editor. */
export interface DataGridColumnOption {
  value: string;
  label: string;
}

/** One column definition, in display order (subject to `pinned`). */
export interface DataGridColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: DataGridColumnAlign | undefined;
  sortable?: boolean | undefined;
  /** Pixel width, a multiple of `space.1` (e.g. 160). Columns do not auto-size. */
  width?: number | undefined;
  minWidth?: number | undefined;
  resizable?: boolean | undefined;
  isRowHeader?: boolean | undefined;
  /** Keeps the column in place while the grid scrolls sideways. */
  pinned?: DataGridColumnPinned | undefined;
  editable?: boolean | undefined;
  editor?: DataGridEditorKind | undefined;
  options?: DataGridColumnOption[] | undefined;
  render?: ((row: DataGridRow) => React.ReactNode) | undefined;
  validate?: ((value: unknown, row: DataGridRow) => string | undefined) | undefined;
}

/** Controlled sort state. */
export interface DataGridSort {
  column: string;
  direction: DataGridSortDirection;
}

/** A single selected cell, in `selectable="cell"` mode. */
export interface DataGridCellSelection {
  rowId: string;
  column: string;
}

/** A rectangular selection, in `selectable="range"` mode. Not reachable on this platform; see the generation gap notes. */
export interface DataGridRangeSelection {
  from: DataGridCellSelection;
  to: DataGridCellSelection;
}

export type DataGridSelection = string[] | DataGridCellSelection | DataGridRangeSelection;

/** Payload of a committed edit. */
export interface DataGridCellChange {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

/** The row window the caller should load next, for server paging. */
export interface DataGridRangeNeeded {
  start: number;
  end: number;
}

/** Payload fired when a resizable column finishes being dragged. */
export interface DataGridColumnResize {
  column: string;
  width: number;
}

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
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

export interface DataGridProps {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions plus grid concerns (width, pinning, editing). Exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a window of a larger set (server paging). Drives `onEndReached`. */
  rowCount?: number | undefined;
  /** Controlled sort state; the caller sorts `data`. */
  sort?: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSort | undefined;
  /**
   * `row` adds a checkbox column and toggles rows; `cell` selects one cell.
   * `range` has no touch or hardware-keyboard equivalent on this platform and degrades to `row`
   * (a `__DEV__` warning notes this); see the generation gap notes.
   */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` can be edited by tapping them. */
  editable?: boolean | undefined;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true unless `height="content"`. */
  stickyHeader?: boolean | undefined;
  /**
   * `viewport` fills the height available under the header; `content` grows with rows (no
   * virtualization, small grids); `fixed` uses `overrides.fixedHeight`.
   */
  height?: DataGridHeight | undefined;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: DataGridSort) => void) | undefined;
  /** Fired with the new selection: row ids, one cell, or (web/lit only) a range. */
  onSelectionChange?: ((selection: DataGridSelection) => void) | undefined;
  /** Fired when an edit commits, with the new and previous value. The caller updates `data`. */
  onCellChange?: ((change: DataGridCellChange) => void) | undefined;
  /** Fired when an editor is about to open; return `false` to refuse editing that cell. */
  onEditStart?: ((target: DataGridCellSelection) => boolean | void) | undefined;
  /** Fired (as `FlatList`'s `onEndReached`) when the visible window nears the end of `data` and `rowCount` says there is more. */
  onEndReached?: ((range: DataGridRangeNeeded) => void) | undefined;
  /** Fired with the column and its new width when a resizable column finishes being dragged. */
  onColumnResize?: ((resize: DataGridColumnResize) => void) | undefined;
}

const COPY = {
  sortAscending: (column: string): string => `Sort by ${column}, ascending`,
  sortDescending: (column: string): string => `Sort by ${column}, descending`,
  sortedAnnouncement: (column: string, direction: DataGridSortDirection): string => `Sorted by ${column}, ${direction}`,
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedRows: (count: number, total: number): string => `${count} of ${total} rows selected`,
  editing: (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`,
  invalid: (message: string): string => message,
  rowCount: (count: number): string => `${count} rows`,
  position: (row: number, column: string): string => `Row ${row}, ${column}`,
  resize: (column: string): string => `Resize ${column}`,
  loading: 'Loading',
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
} as const;

/**
 * Visually clips content to 1x1 while keeping it in the accessibility tree, for
 * live-region announcements.
 */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

/** Rows requested from the caller each time the visible window nears the end of `data`. */
const DEFAULT_PAGE_SIZE = 50;

function cellValue(row: DataGridRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareRows(a: DataGridRow, b: DataGridRow, column: string, direction: DataGridSortDirection): number {
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

interface DataGridResizeHandleProps {
  width: number;
  minWidth: number;
  color: string;
  handleWidth: number;
  label: string;
  onResize: (width: number) => void;
  onResizeEnd: (width: number) => void;
}

/**
 * The draggable edge of a resizable column header. Built on core `PanResponder`
 * (the package permits no gesture-handler dependency); reads and reports width
 * through refs so dragging never lags behind the parent's re-renders.
 */
function DataGridResizeHandle({ width, minWidth, color, handleWidth, label, onResize, onResizeEnd }: DataGridResizeHandleProps): React.JSX.Element {
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
      onPanResponderRelease: () => {
        onResizeEnd(widthRef.current);
      },
      onPanResponderTerminate: () => {
        onResizeEnd(widthRef.current);
      },
    }),
  ).current;

  const style: ViewStyle = { width: handleWidth, alignSelf: 'stretch', backgroundColor: color };

  return (
    <View
      {...responder.panHandlers}
      role="separator"
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      style={style}
      testID="DataGrid.resizeHandle"
    />
  );
}

/**
 * DataGrid — hundreds or thousands of rows navigated cell by cell, edited in place,
 * selected in blocks; the different-keyboard-model sibling of Table, which shares
 * its column and data model but is for reading and acting on records by row.
 *
 * When to use: Use a DataGrid for price lists, inventory, timesheets and admin
 * views over large sets — anything a spreadsheet would otherwise be used for. Set
 * `editable` and mark the columns that may change; give every editable column a
 * `validate`. Do not use it for content read and acted on by row (Table), a
 * handful of fields (Form), or phone-first screens — its keyboard model has no
 * touch equivalent, which is why `selectable="range"` degrades to `"row"` here.
 *
 * There is no grid element on native. Renders a caption (`Heading`, or hidden when
 * `hideCaption`), then a horizontal `ScrollView` (`role="grid"`, the accessible
 * name from `caption`) containing a `FlatList` whose fixed `getItemLayout` comes
 * from `density`'s row-height token, giving virtualization for free; the header
 * row is its `ListHeaderComponent`, sticky whenever the grid is virtualized
 * (`height` is not `"content"`) and gaining `headerShadow` once the body has
 * scrolled beneath it. `columns` order to `pinned: "start"` first, then unpinned,
 * then `pinned: "end"`; native has no `position: sticky` and the package permits no
 * gesture-handler/reanimated dependency for a second synced list, so — like
 * Table's approximation of a sticky row-header column — pinned columns scroll with
 * the rest and only gain `pinnedShadow` once the region has moved horizontally.
 * Resizable columns drag on core `PanResponder` (an allowed dependency-free API),
 * committing `onColumnResize` on release.
 *
 * Each cell's `accessibilityLabel` is "{column}: {value}"; an editable cell adds
 * the hint "double tap to edit" and opens its editor on a single tap, since native
 * has no double-click and Enter/F2 have no hardware-keyboard equivalent on a
 * touchscreen. `checkbox` editors are always live (no separate edit mode);
 * `select` opens a `BottomSheet` with a `Listbox` of `options`; `text`, `number`
 * and (absent a package `DatePicker` to compose — see the gap notes) `date` open
 * an inline `TextInput`, which commits on blur or the hardware Enter key and
 * cancels on the hardware Escape key where one exists (react-native-web, an
 * attached keyboard). A failed `column.validate` keeps the editor open with the
 * message surfaced in the status bar and `cellInvalidBorder`/`cellInvalidBackground`
 * on the cell; a successful edit fires `onCellChange` and waits for `data` to
 * change, reverting visibly if the caller rejects it.
 *
 * `selectable="row"` adds a `Checkbox` select column with select-all
 * (indeterminate when some rows are selected); `"cell"` tracks one active cell and
 * reports it through `onSelectionChange`. Sorting follows Table: a controlled
 * `sort` leaves ordering to the caller; otherwise the grid sorts `data` itself from
 * `defaultSort`, except when `rowCount` is set (server paging, where only the
 * caller's window is ever shown). `rowCount` beyond `data.length` drives
 * `onEndReached` (the platform name for `onRangeNeeded`) as the list nears its end.
 * The status bar doubles as the polite live region for loading, editing and
 * selection state, matching what is shown; sort changes get their own hidden live
 * region, as in Table.
 */
export function DataGrid({
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
  overrides,
  onSortChange,
  onSelectionChange,
  onCellChange,
  onEditStart,
  onEndReached,
  onColumnResize,
}: DataGridProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  const effectiveSelectable: DataGridSelectable = selectable === 'range' ? 'row' : selectable;

  const [internalSort, setInternalSort] = React.useState<DataGridSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;

  const [internalSelectedRows, setInternalSelectedRows] = React.useState<string[]>([]);
  const selectedRowIds = selected ?? internalSelectedRows;
  const selectedSet = React.useMemo(() => new Set(selectedRowIds), [selectedRowIds]);

  const [activeCell, setActiveCell] = React.useState<DataGridCellSelection | null>(null);
  const [focusedCellKey, setFocusedCellKey] = React.useState<string | null>(null);
  const [editingCell, setEditingCell] = React.useState<DataGridCellSelection | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [editingError, setEditingError] = React.useState<string | undefined>(undefined);
  const [selectEditorTarget, setSelectEditorTarget] = React.useState<DataGridCellSelection | null>(null);
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [bodyScrolledX, setBodyScrolledX] = React.useState(false);
  const [sortAnnouncement, setSortAnnouncement] = React.useState('');

  React.useEffect(() => {
    if (__DEV__ && selectable === 'range') {
      // eslint-disable-next-line no-console
      console.warn('DataGrid: `selectable="range"` has no touch or hardware-keyboard equivalent on React Native and degrades to `"row"`.');
    }
  }, [selectable]);

  const isFirstSort = React.useRef(true);
  React.useEffect(() => {
    if (isFirstSort.current) {
      isFirstSort.current = false;
      return;
    }
    if (activeSort === undefined) {
      return;
    }
    const column = columns.find((c) => c.key === activeSort.column);
    const message = COPY.sortedAnnouncement(column?.header ?? activeSort.column, activeSort.direction);
    setSortAnnouncement(message);
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSort?.column, activeSort?.direction]);

  const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
  const orderedColumns = React.useMemo(() => {
    const pinnedStart = columns.filter((c) => c.pinned === 'start');
    const pinnedEnd = columns.filter((c) => c.pinned === 'end');
    const middle = columns.filter((c) => c.pinned !== 'start' && c.pinned !== 'end');
    return [...pinnedStart, ...middle, ...pinnedEnd];
  }, [columns]);

  const columnByKey = React.useMemo(() => new Map(columns.map((c) => [c.key, c] as const)), [columns]);

  const sortedData = React.useMemo(() => {
    if (sort !== undefined || rowCount !== undefined || internalSort === undefined) {
      return data;
    }
    return [...data].sort((a, b) => compareRows(a, b, internalSort.column, internalSort.direction));
  }, [data, sort, rowCount, internalSort]);

  const commitSort = (next: DataGridSort): void => {
    if (sort === undefined) {
      setInternalSort(next);
    }
    onSortChange?.(next);
  };

  const handleSort = (columnKey: string): void => {
    const next: DataGridSort =
      activeSort?.column === columnKey
        ? { column: columnKey, direction: activeSort.direction === 'ascending' ? 'descending' : 'ascending' }
        : { column: columnKey, direction: 'ascending' };
    commitSort(next);
  };

  const commitRowSelection = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelectedRows(next);
    }
    onSelectionChange?.(next);
  };

  const toggleRow = (id: string): void => {
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    commitRowSelection(Array.from(next));
  };

  const allIds = sortedData.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => {
    commitRowSelection(allSelected ? [] : allIds);
  };

  const selectCellTarget = (rowId: string, column: string): void => {
    const next: DataGridCellSelection = { rowId, column };
    setActiveCell(next);
    onSelectionChange?.(next);
  };

  const rowName = (row: DataGridRow): string => (rowHeaderColumn ? cellValue(row, rowHeaderColumn.key) || row.id : row.id);

  // ---- editing ----

  const startEdit = (row: DataGridRow, column: DataGridColumn): void => {
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

  const commitEdit = (row: DataGridRow, column: DataGridColumn, value: unknown): void => {
    const validationError = column.validate?.(value, row);
    if (validationError !== undefined) {
      setEditingError(validationError);
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(COPY.invalid(validationError));
      }
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

  const headerBorderColor = overrides?.headerBorder ? (resolveToken(t, overrides.headerBorder) as string) : t.colorBorderStrong;
  const headerBorderWidth = overrides?.headerBorderWidth ? (resolveToken(t, overrides.headerBorderWidth) as number) : t.borderWidthThin;
  const headerShadow = overrides?.headerShadow ? (resolveToken(t, overrides.headerShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const gridLineColor = overrides?.gridLine ? (resolveToken(t, overrides.gridLine) as string) : t.colorBorder;
  const gridLineWidth = overrides?.gridLineWidth ? (resolveToken(t, overrides.gridLineWidth) as number) : t.borderWidthThin;
  const rowHeightValue = overrides?.rowHeight ? (resolveToken(t, overrides.rowHeight) as number) : t.sizeTargetMin;
  const rowHeightComfortableValue = overrides?.rowHeightComfortable ? (resolveToken(t, overrides.rowHeightComfortable) as number) : t.sizeTargetComfortable;
  const activeRowHeight = density === 'compact' ? rowHeightValue : rowHeightComfortableValue;
  const rowSelectedBorderWidth = overrides?.rowSelectedBorderWidth ? (resolveToken(t, overrides.rowSelectedBorderWidth) as number) : t.borderWidthFocus;
  const cellPaddingInline = overrides?.cellPaddingInline ? (resolveToken(t, overrides.cellPaddingInline) as number) : t.space2;
  const cellFocusRingWidth = overrides?.cellFocusRingWidth ? (resolveToken(t, overrides.cellFocusRingWidth) as number) : t.borderWidthFocus;
  const pinnedShadow = overrides?.pinnedShadow ? (resolveToken(t, overrides.pinnedShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const resizeHandleColor = overrides?.resizeHandle ? (resolveToken(t, overrides.resizeHandle) as string) : t.colorBorderStrong;
  const resizeHandleWidth = overrides?.resizeHandleWidth ? (resolveToken(t, overrides.resizeHandleWidth) as number) : t.space1;
  const statusBarPadding = overrides?.statusBarPadding ? (resolveToken(t, overrides.statusBarPadding) as number) : t.space2;
  const fixedHeightValue = overrides?.fixedHeight ? (resolveToken(t, overrides.fixedHeight) as number) : t.space20;
  const editorFontFamily = overrides?.fontFamily ? (resolveToken(t, overrides.fontFamily) as string) : t.fontFamilyBody;
  const editorFontSize = overrides?.fontSize ? (resolveToken(t, overrides.fontSize) as number) : t.fontSizeSm;
  const editorLineHeightMultiplier = overrides?.lineHeight ? (resolveToken(t, overrides.lineHeight) as number) : t.fontLineHeightTight;
  const numericFontFamily = overrides?.numericFont ? (resolveToken(t, overrides.numericFont) as string) : t.fontFamilyMono;

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const headerTypographyOverrides = { ...typographyOverrides, fontWeight: overrides?.headerWeight, fontSize: overrides?.headerSize };
  const cellTypographyOverrides = (align: DataGridColumnAlign | undefined) => ({
    ...typographyOverrides,
    fontFamily: align === 'end' ? (overrides?.numericFont ?? ('font.family.mono' as TokenRef)) : overrides?.fontFamily,
    fontSize: overrides?.fontSize,
  });

  const widthFor = (column: DataGridColumn): number => columnWidths[column.key] ?? column.width ?? column.minWidth ?? t.space20;
  const minWidthFor = (column: DataGridColumn): number => column.minWidth ?? t.sizeTargetMin;

  const showEmpty = sortedData.length === 0;
  const emptyText = loading && showEmpty ? COPY.loading : (emptyMessage ?? COPY.empty);

  const selectCellStyle: ViewStyle = {
    width: t.sizeTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
  };

  // ---- header ----

  const handleHeaderScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    setHeaderScrolled(event.nativeEvent.contentOffset.y > 0);
  };

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
      ...(column.pinned === 'start' && bodyScrolledX ? pinnedShadow : null),
    };

    return (
      <View key={column.key} style={headerCellStyle} role="columnheader" accessibilityRole="header" testID="DataGrid.columnHeader">
        {column.sortable ? (
          <View style={{ flex: 1 }} testID="DataGrid.sortButton">
            <Button
              label={column.abbr ?? column.header}
              variant="ghost"
              size="sm"
              trailingIcon={
                isSorted ? <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorForeground} /> : undefined
              }
              overrides={{ fontWeight: overrides?.headerWeight ?? ('font.weight.semibold' as TokenRef), fontSize: overrides?.headerSize }}
              onPress={() => handleSort(column.key)}
            />
            {isSorted ? (
              <View style={HIDDEN_STYLE}>
                <Text>{activeSort.direction === 'ascending' ? COPY.sortAscending(column.header) : COPY.sortDescending(column.header)}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <Text size="sm" weight="semibold" truncate overrides={headerTypographyOverrides}>
            {column.header}
          </Text>
        )}
        {column.resizable ? (
          <DataGridResizeHandle
            width={width}
            minWidth={minWidthFor(column)}
            color={resizeHandleColor}
            handleWidth={resizeHandleWidth}
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
    ...(stickyHeaderEffective && headerScrolled ? headerShadow : null),
  };

  const renderHeader = (): React.JSX.Element => (
    <View role="rowgroup" testID="DataGrid.header">
      <View style={headerRowStyle} role="row" testID="DataGrid.headerRow">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="DataGrid.selectAllCell">
            <Checkbox label={COPY.selectAll} name="data-grid-select-all" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
          </View>
        ) : null}
        {orderedColumns.map((column) => renderColumnHeader(column))}
      </View>
    </View>
  );

  // ---- body ----

  const renderEditor = (row: DataGridRow, column: DataGridColumn): React.JSX.Element => {
    const editorStyle: TextStyle = {
      minHeight: t.sizeTargetMin,
      color: t.colorForeground,
      fontFamily: column.editor === 'number' ? numericFontFamily : editorFontFamily,
      fontSize: editorFontSize,
      lineHeight: toLineHeight(editorFontSize, editorLineHeightMultiplier),
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
        testID="DataGrid.editor"
      />
    );
  };

  const renderBodyCell = (row: DataGridRow, column: DataGridColumn): React.JSX.Element => {
    const width = widthFor(column);
    const isHeaderCell = column.isRowHeader === true;
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
      ...(column.pinned === 'start' && bodyScrolledX ? pinnedShadow : null),
    };

    let content: React.ReactNode;
    if (isEditingThis) {
      content = renderEditor(row, column);
    } else if (isCheckboxEditor) {
      content = (
        <Checkbox
          label={`${column.header}: ${row[column.key] ? 'checked' : 'unchecked'}`}
          name={`data-grid-${row.id}-${column.key}`}
          checked={Boolean(row[column.key])}
          onChange={(next) => commitEdit(row, column, next)}
        />
      );
    } else if (column.render) {
      content = column.render(row);
    } else {
      content = (
        <Text size="sm" align={column.align ?? 'start'} truncate overrides={cellTypographyOverrides(column.align)}>
          {cellValue(row, column.key)}
        </Text>
      );
    }

    const testId = isHeaderCell ? 'DataGrid.rowHeader' : 'DataGrid.cell';
    const role = isHeaderCell ? 'rowheader' : 'cell';

    if (isEditingThis || isCheckboxEditor) {
      return (
        <View key={column.key} style={cellOuterStyle} role={role} testID={testId}>
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
        role={role}
        testID={testId}
      >
        {content}
      </Pressable>
    );
  };

  const renderRow = ({ item: row }: ListRenderItemInfo<DataGridRow>): React.JSX.Element => {
    const isRowSelected = effectiveSelectable === 'row' && selectedSet.has(row.id);
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: activeRowHeight,
      borderBottomWidth: gridLineWidth,
      borderBottomColor: gridLineColor,
      backgroundColor: isRowSelected ? t.colorBackgroundSubtle : t.colorBackground,
      borderLeftWidth: isRowSelected ? rowSelectedBorderWidth : 0,
      borderLeftColor: isRowSelected ? t.colorControlSelectedBackground : 'transparent',
    };

    return (
      <View style={rowStyle} role="row" accessibilityState={effectiveSelectable !== 'none' ? { selected: isRowSelected } : undefined} testID="DataGrid.row">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="DataGrid.selectCell">
            <Checkbox label={COPY.selectRow(rowName(row))} name={`data-grid-row-${row.id}`} checked={isRowSelected} onChange={() => toggleRow(row.id)} />
          </View>
        ) : null}
        {orderedColumns.map((column) => renderBodyCell(row, column))}
      </View>
    );
  };

  const getItemLayout = (_listData: ArrayLike<DataGridRow> | null | undefined, index: number): { length: number; offset: number; index: number } => ({
    length: activeRowHeight,
    offset: activeRowHeight * index,
    index,
  });

  const handleEndReached = (): void => {
    if (rowCount === undefined || rowCount <= sortedData.length) {
      return;
    }
    const start = sortedData.length;
    const end = Math.min(rowCount, start + DEFAULT_PAGE_SIZE);
    onEndReached?.({ start, end });
  };

  const containerHeightStyle: ViewStyle = height === 'fixed' ? { height: fixedHeightValue } : height === 'viewport' ? { flex: 1 } : {};

  const totalContentWidth = orderedColumns.reduce((sum, column) => sum + widthFor(column), 0) + (effectiveSelectable === 'row' ? t.sizeTargetComfortable : 0);

  const grid = (
    <FlatList
      data={sortedData}
      keyExtractor={(row) => row.id}
      renderItem={renderRow}
      ListHeaderComponent={renderHeader}
      stickyHeaderIndices={stickyHeaderEffective ? [0] : undefined}
      getItemLayout={getItemLayout}
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
      scrollEnabled={height !== 'content'}
      style={height === 'content' ? undefined : { flex: 1 }}
      onEndReached={rowCount !== undefined ? handleEndReached : undefined}
      onEndReachedThreshold={0.5}
      accessibilityState={{ busy: loading }}
      ListEmptyComponent={
        <View style={{ padding: cellPaddingInline }} accessible accessibilityLabel={emptyText} testID="DataGrid.emptyState">
          <Text tone="muted">{emptyText}</Text>
        </View>
      }
      testID="DataGrid.grid"
    />
  );

  const scrollRegion = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator
      onScroll={(event) => setBodyScrolledX(event.nativeEvent.contentOffset.x > 0)}
      scrollEventThrottle={16}
      contentContainerStyle={{ minWidth: totalContentWidth, flexGrow: 1 }}
      accessibilityLabel={caption}
      accessibilityHint={COPY.scrollHint}
      accessibilityState={{ busy: loading }}
      role="grid"
      testID="DataGrid.scrollRegion"
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
    statusText = COPY.selectedRows(selectedRowIds.length, sortedData.length);
  } else if (effectiveSelectable === 'cell' && activeCell !== null) {
    const activeRowIndex = sortedData.findIndex((row) => row.id === activeCell.rowId);
    const activeColumn = columnByKey.get(activeCell.column);
    statusText = COPY.position(activeRowIndex + 1, activeColumn?.header ?? activeCell.column);
  } else {
    statusText = COPY.rowCount(rowCount ?? sortedData.length);
  }

  // ---- select editor (BottomSheet) ----

  const selectEditorRow = selectEditorTarget ? (sortedData.find((row) => row.id === selectEditorTarget.rowId) ?? null) : null;
  const selectEditorColumn = selectEditorTarget ? (columnByKey.get(selectEditorTarget.column) ?? null) : null;

  return (
    <View testID="DataGrid">
      {!hideCaption ? (
        <View testID="DataGrid.caption">
          <Heading level="2" overrides={{ fontSize: overrides?.captionSize, fontWeight: overrides?.captionWeight, marginBlockEnd: overrides?.captionGap ?? ('space.2' as TokenRef) }}>
            {caption}
          </Heading>
        </View>
      ) : null}
      <View style={containerHeightStyle} testID="DataGrid.container">
        {scrollRegion}
      </View>
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text>{sortAnnouncement}</Text>
      </View>
      {showStatusBar ? (
        <View
          style={{ paddingHorizontal: statusBarPadding, paddingVertical: statusBarPadding, backgroundColor: t.colorBackgroundSubtle }}
          role="status"
          accessibilityLiveRegion="polite"
          testID="DataGrid.statusBar"
        >
          <Text size="xs" tone="muted" overrides={{ ...typographyOverrides, fontSize: overrides?.statusBarSize }}>
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
