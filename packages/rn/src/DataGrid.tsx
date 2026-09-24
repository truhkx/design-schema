import * as React from 'react';
import {
  AccessibilityInfo,
  Animated,
  FlatList,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import type { AccessibilityActionEvent, LayoutChangeEvent, ListRenderItemInfo, Role, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { DatePicker } from './DatePicker';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text, TextForegroundContext } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type DataGridColumnAlign = 'start' | 'end' | 'center';
export type DataGridColumnPinned = 'start' | 'end';
export type DataGridEditorKind = 'text' | 'number' | 'select' | 'date' | 'checkbox';
export type DataGridSortDirection = 'ascending' | 'descending';
export type DataGridSelectable = 'none' | 'row' | 'cell' | 'range';
export type DataGridDensity = 'compact' | 'comfortable';
export type DataGridHeight = 'content' | 'viewport' | 'fixed';
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
export type DataGridCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** A single record. `id` must be stable; it is what selection and keys use. */
export type DataGridRow = { id: string; [key: string]: unknown };

/** One option for a `select` editor. */
export type DataGridColumnOption = { value: string; label: string };

/** One column: Table's column model plus grid concerns (width, resizing, pinning, editing). */
export type DataGridColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: 'start' | 'end' | 'center';
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  isRowHeader?: boolean;
  pinned?: 'start' | 'end';
  editable?: boolean;
  editor?: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: { value: string; label: string }[];
  render?: (row: DataGridRow) => React.ReactNode;
  validate?: (value: unknown, row: DataGridRow) => string | undefined;
};

/** Sort state: which column, and which way. */
export type DataGridSort = { column: string; direction: 'ascending' | 'descending' };

/** One cell, in `selectable="cell"` mode. */
export type DataGridCellSelection = { rowId: string; column: string };

/** A rectangle of cells. `selectable="range"` degrades to `row` on this platform, so the grid never reports one here. */
export type DataGridRangeSelection = { from: { rowId: string; column: string }; to: { rowId: string; column: string } };

export type DataGridSelection = string[] | DataGridCellSelection | DataGridRangeSelection;

/** A cell value as an editor produces it; `undefined` when the cell has none. */
export type DataGridCellValue = string | number | boolean | undefined;

/** `{ column, width }` of a finished column resize (kept for TreeGrid, which shares the column model). */
export type DataGridColumnResize = { column: string; width: number };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
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

export interface DataGridProps {
  /** What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless, as Table. */
  captionLevel?: DataGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column model. `width` is pixels (the `columnWidth` binding when omitted); exactly one column may be `isRowHeader`. */
  columns: DataGridColumn[];
  /** The rows. `id` must be stable. Only visible rows are rendered. */
  data: DataGridRow[];
  /** Total rows when `data` is a prefix of a larger set (server paging); `onEndReached` asks for more. A whole number. */
  rowCount?: number | undefined;
  /** Controlled sort state; the caller sorts `data`. */
  sort?: DataGridSort | undefined;
  /** Initial sort; the grid sorts `data` itself when `rowCount` is not set. */
  defaultSort?: DataGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the tapped cell. `range` has no touch model here and degrades to `row`. */
  selectable?: DataGridSelectable | undefined;
  /** Controlled selected row ids (row mode). */
  selected?: string[] | undefined;
  /** Master switch: cells whose column is `editable` open their editor when tapped. */
  editable?: boolean | undefined;
  /** Row height: `compact` is the minimum target, `comfortable` the touch target. */
  density?: DataGridDensity | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized (`height` is not `content`). */
  stickyHeader?: boolean | undefined;
  /** `viewport`: window height minus twice the section gap; `content`: grows with rows; `fixed`: `overrides.fixedHeight`. */
  height?: DataGridHeight | undefined;
  /** Marks the grid busy and shows `copy.loading` in the status bar; existing rows stay, their text muted. */
  loading?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then toggling. */
  onSortChange?: ((column: string, direction: 'ascending' | 'descending') => void) | undefined;
  /** Fired with the selection: row ids (row mode) or one cell (cell mode). */
  onSelectionChange?:
    | ((
        selection: string[] | { rowId: string; column: string } | { from: { rowId: string; column: string }; to: { rowId: string; column: string } },
      ) => void)
    | undefined;
  /** Fired when an edit commits. The caller updates `data`; the cell shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: DataGridCellValue, previous: DataGridCellValue) => void) | undefined;
  /** Fired before an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** `onRangeNeeded` on this platform: the list came within one page of the end of `data` and `rowCount` says there is more. */
  onEndReached?: ((start: number, end: number) => void) | undefined;
  /** Fired with the column key and its new width when a drag on the header edge ends, or per resize accessibility action. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
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
  loading: 'Loading',
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
  cellLabel: (column: string, value: string): string => `${column}: ${value}`,
  editHint: 'Opens the cell editor',
} as const;

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** Clips content to one point while keeping it in the accessibility tree (hidden caption, the live region when the bar is off). */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const HEADER_WEIGHT: TokenRef = 'font.weight.semibold';
const HEADER_SIZE: TokenRef = 'font.size.sm';
const CAPTION_SIZE: TokenRef = 'font.size.md';
const CAPTION_WEIGHT: TokenRef = 'font.weight.semibold';
const LINE_HEIGHT: TokenRef = 'font.lineHeight.tight';
const NUMERIC_FONT: TokenRef = 'font.family.mono';
const INSET_ZERO: TokenRef = 'space.0';
/** minTarget, forwarded to the select Checkboxes' `controlSize` (locked, so never an override). */
const MIN_TARGET: TokenRef = 'size.target.min';

type Shadow = Tokens['shadowRaised'];

function tokenOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref === undefined ? fallback : (resolveToken(t, ref) as T);
}

function cellText(row: DataGridRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function cellValue(row: DataGridRow, key: string): DataGridCellValue {
  const raw = row[key];
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  return raw === undefined || raw === null ? undefined : String(raw);
}

function compareRows(a: DataGridRow, b: DataGridRow, sort: DataGridSort): number {
  const factor = sort.direction === 'ascending' ? 1 : -1;
  const av = a[sort.column];
  const bv = b[sort.column];
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * factor;
  }
  return cellText(a, sort.column).localeCompare(cellText(b, sort.column), undefined, { numeric: true }) * factor;
}

function sameCell(a: DataGridCellSelection | null, rowId: string, column: string): boolean {
  return a !== null && a.rowId === rowId && a.column === column;
}

/** The row hover tint, faded over `transition` (instant under reduced motion). */
function RowTint({ visible, color, duration }: { visible: boolean; color: string; duration: number }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const opacity = React.useRef(new Animated.Value(visible ? 1 : 0)).current;
  React.useEffect(() => {
    const toValue = visible ? 1 : 0;
    if (reducedMotion) {
      opacity.setValue(toValue);
      return;
    }
    Animated.timing(opacity, { toValue, duration, easing: toEasing(t.motionEasingStandard), useNativeDriver: false }).start();
  }, [visible, reducedMotion, duration, opacity, t.motionEasingStandard]);
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity, pointerEvents: 'none' }]}
    />
  );
}

/** An inset ring drawn over a cell, so neighbours and the scroll region never clip it. */
function CellRing({ color, width }: { color: string; width: number }): React.JSX.Element {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { borderColor: color, borderWidth: width, pointerEvents: 'none' }]}
    />
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

/**
 * The draggable edge of a resizable header cell, on core `PanResponder`. Native has no hover,
 * so it is always visible and hit-slopped out to `size.target.min`. Callbacks go through refs
 * so the responder is created once.
 */
function ResizeHandle({ width, minWidth, color, handleWidth, hitSlop, onResize, onResizeEnd }: ResizeHandleProps): React.JSX.Element {
  const latest = React.useRef({ width, minWidth, onResize, onResizeEnd });
  latest.current = { width, minWidth, onResize, onResizeEnd };
  const startWidth = React.useRef(width);

  const responder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        startWidth.current = latest.current.width;
      },
      onPanResponderMove: (_event, gesture) => {
        latest.current.onResize(Math.max(latest.current.minWidth, Math.round(startWidth.current + gesture.dx)));
      },
      onPanResponderRelease: () => {
        latest.current.onResizeEnd(latest.current.width);
      },
      onPanResponderTerminate: () => {
        latest.current.onResizeEnd(latest.current.width);
      },
    }),
  ).current;

  return (
    <View
      {...responder.panHandlers}
      testID="DataGrid.resizeHandle"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      hitSlop={{ left: hitSlop, right: hitSlop }}
      style={{ width: handleWidth, alignSelf: 'stretch', backgroundColor: color }}
    />
  );
}

/**
 * DataGrid — for working in data, not reading it: many rows, cell-level selection, values
 * edited in place. Shares Table's column and data model; a different role and contract.
 *
 * When to use: price lists, inventory counts, timesheets, admin views over large sets. Set
 * `editable` and mark the editable columns, each with a `validate`. Not for records read and
 * acted on by row (Table), a handful of fields (Form), or phone-first screens (Table with
 * `responsive: stack`).
 *
 * There is no grid element on native. The caption is a `Heading` at `captionLevel` (visually
 * hidden with `hideCaption`). A horizontal `ScrollView` (the scroll region) holds a `FlatList`
 * with `role="grid"`, the caption followed by `copy.rowCount` as its `accessibilityLabel`
 * (native has no aria-rowcount, so the total is at least spoken on focus), and a fixed `getItemLayout`
 * from the density's row height, so rows virtualize; the header row (`role="rowgroup"` >
 * `row` > `columnheader`) is its sticky list header, sharing the horizontal scroll with the
 * body and casting `headerShadow` once the body scrolls beneath it. `FlatList` gives the body
 * rows no wrapper, so the `body` rowgroup part has no element here. Rows are `role="row"`
 * Views of fixed-width `role="cell"` / `"rowheader"` Pressables named `copy.cellLabel`.
 * Pinned columns keep their place in `columns` and scroll with the rest (native has no
 * `position: sticky`), casting `pinnedShadow` once the region has moved sideways.
 *
 * The web keyboard model has no equivalent in core React Native (View and Pressable have no
 * key events), so touch replaces it: a sortable header is a `Button`; `selectable="row"`
 * (and `range`, which degrades to it with a `__DEV__` warning) adds `Checkbox` cells and a
 * select-all Checkbox that stands in for Ctrl+A; `cell` selects the tapped cell, where selection
 * follows focus and the inset `cellFocusRing` is its only visual. The scroll region draws
 * `focusRing` while a cell inside it reports focus, so the region's overflow never clips it
 * (react-native-web only — core RN gives View and Pressable no focus events). An editable
 * cell opens its editor on tap (`copy.editHint`), after `onEditStart` allows it: `Input`
 * (commits on blur), `NumberInput` and `DatePicker` (commit when another cell or a sort header
 * is pressed, or through the cell's `activate` accessibility action), `Select` (opens at once
 * and commits on change; closing it cancels) and `Checkbox` (commits on change). The `escape`
 * accessibility action cancels. A failing `validate` keeps the editor open with the cell in
 * cellInvalid* and the message in the status bar. Column resize is a `PanResponder` drag on
 * the always-visible header edge plus increment/decrement accessibility actions on the header
 * cell by `resizeStep`. Copying (Ctrl+C) is not offered: core RN has no clipboard API.
 *
 * The status bar holds one polite live region (loading, validation, editing, sort and
 * selection announcements, with `AccessibilityInfo.announceForAccessibility` on iOS) beside
 * the row count, the selection count, `copy.scrollHint` while columns overflow unscrolled, and
 * `copy.position` for the active cell — which is shown but never announced. With
 * `showStatusBar` false the bar is visually hidden and keeps only the live region.
 */
export function DataGrid({
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
  // Every `height` but `content` virtualizes (always sticky) and `content` lets the page scroll
  // (never sticky), so the prop changes nothing here: accepted for parity, `false` not warned about.
  stickyHeader: _stickyHeader = true,
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
  ref,
}: DataGridProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const viewport = useWindowDimensions();
  const baseId = React.useId();

  const mode: 'none' | 'row' | 'cell' = selectable === 'range' ? 'row' : selectable;

  const [internalSort, setInternalSort] = React.useState<DataGridSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;
  const [internalSelected, setInternalSelected] = React.useState<string[]>([]);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const [activeCell, setActiveCell] = React.useState<DataGridCellSelection | null>(null);
  const [focusedCell, setFocusedCell] = React.useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);
  // rowHover is the pressed fill on native (and the pointer hover on react-native-web).
  const [pressedRow, setPressedRow] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<DataGridCellSelection | null>(null);
  const [draft, setDraft] = React.useState<DataGridCellValue>(undefined);
  const [editError, setEditError] = React.useState<string | undefined>(undefined);
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [scrolledX, setScrolledX] = React.useState(false);
  const [regionWidth, setRegionWidth] = React.useState<number | null>(null);
  const [listHeight, setListHeight] = React.useState<number | null>(null);
  const [announcement, setAnnouncement] = React.useState('');
  const [headerHeight, setHeaderHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (caption === '') {
      console.warn('DataGrid: `caption` is required; the grid falls back to an empty accessible name.');
    }
    // The two column rules with no runtime consequence — exactly one `isRowHeader`, pinned columns
    // contiguous at one end — are development warnings, never thrown errors.
    if (columns.filter((column) => column.isRowHeader === true).length > 1) {
      console.warn('DataGrid: only one column may set `isRowHeader`; the first one is used.');
    }
    const pinnedStart = columns.filter((column) => column.pinned === 'start').length;
    const pinnedEnd = columns.filter((column) => column.pinned === 'end').length;
    const contiguous =
      columns.slice(0, pinnedStart).every((column) => column.pinned === 'start') &&
      columns.slice(columns.length - pinnedEnd).every((column) => column.pinned === 'end');
    if (!contiguous) {
      console.warn('DataGrid: pinned columns must be contiguous at the start or the end of `columns`, in their order there.');
    }
  }, [caption, columns]);

  /** Puts a message in the status bar's live region, and speaks it on iOS, which has no live regions. */
  const announce = (message: string): void => {
    setAnnouncement(message);
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  const sortKey = activeSort === undefined ? '' : `${activeSort.column}:${activeSort.direction}`;
  const lastSortKey = React.useRef(sortKey);
  React.useEffect(() => {
    if (lastSortKey.current === sortKey || activeSort === undefined) {
      lastSortKey.current = sortKey;
      return;
    }
    lastSortKey.current = sortKey;
    const header = columns.find((column) => column.key === activeSort.column)?.header ?? activeSort.column;
    announce(COPY.sortedAnnouncement(header, activeSort.direction));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey]);

  const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
  const columnByKey = React.useMemo(() => new Map(columns.map((column) => [column.key, column] as const)), [columns]);

  const rows = React.useMemo(
    () => (sort === undefined && rowCount === undefined && internalSort !== undefined ? [...data].sort((a, b) => compareRows(a, b, internalSort)) : data),
    [data, sort, rowCount, internalSort],
  );
  const total = rowCount ?? data.length;

  // Bindings
  const headerWeight = overrides?.headerWeight ?? HEADER_WEIGHT;
  const headerSize = overrides?.headerSize ?? HEADER_SIZE;
  const headerBorder = tokenOr<string>(t, overrides?.headerBorder, t.colorBorderStrong);
  const headerBorderWidth = tokenOr<number>(t, overrides?.headerBorderWidth, t.borderWidthThin);
  const headerShadow = tokenOr<Shadow>(t, overrides?.headerShadow, t.shadowRaised);
  const gridLine = tokenOr<string>(t, overrides?.gridLine, t.colorBorder);
  const gridLineWidth = tokenOr<number>(t, overrides?.gridLineWidth, t.borderWidthThin);
  const rowHover = tokenOr<string>(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
  const cellPaddingInline = tokenOr<number>(t, overrides?.cellPaddingInline, t.space2);
  // The × 2 stays in the rule: an override replaces the base token, not the doubling.
  const columnWidth = tokenOr<number>(t, overrides?.columnWidth, t.space20) * 2;
  const pinnedShadow = tokenOr<Shadow>(t, overrides?.pinnedShadow, t.shadowRaised);
  const resizeHandle = tokenOr<string>(t, overrides?.resizeHandle, t.colorBorderStrong);
  const resizeHandleWidth = tokenOr<number>(t, overrides?.resizeHandleWidth, t.space1);
  const resizeStep = tokenOr<number>(t, overrides?.resizeStep, t.space4);
  const statusBarPadding = tokenOr<number>(t, overrides?.statusBarPadding, t.space2);
  const statusBarGap = tokenOr<number>(t, overrides?.statusBarGap, t.space2);
  const fixedHeight = tokenOr<number>(t, overrides?.fixedHeight, t.space20);
  const captionGap = tokenOr<number>(t, overrides?.captionGap, t.space2);
  const transition = tokenOr<number>(t, overrides?.transition, t.motionDurationFast);
  // Locked: the scroll region's ring, drawn by the region so its own overflow cannot clip it.
  const focusRing = t.colorBorderFocus;
  const focusRingWidth = t.borderWidthFocus;
  const densityRowHeight = density === 'comfortable' ? t.sizeTargetComfortable : t.sizeTargetMin;
  // The select Checkbox is a full minTarget, and a compact row — the same minimum, less its grid
  // lines — cannot hold one. So a selection column gives comfortable rows at both densities rather
  // than a clipped or overlapping target, and the virtualizer is told the same height.
  const rowHeight = mode === 'row' ? Math.max(densityRowHeight, t.sizeTargetComfortable) : densityRowHeight;
  // selectColumnWidth plus the cell's own inline padding on both sides.
  const selectColumnWidth = t.sizeTargetMin + 2 * cellPaddingInline;

  const bodyText = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight ?? LINE_HEIGHT };
  const numericText = { ...bodyText, fontFamily: overrides?.numericFont ?? NUMERIC_FONT };
  const headerText = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight ?? LINE_HEIGHT, fontSize: headerSize, fontWeight: headerWeight };
  // The statusBar part forwards statusBarSize → fontSize and nothing else.
  const statusBarText = { fontSize: overrides?.statusBarSize };
  const editorInset = { paddingInline: INSET_ZERO, paddingBlock: INSET_ZERO };

  const widthFor = (column: DataGridColumn): number => widths[column.key] ?? column.width ?? columnWidth;
  const minWidthFor = (column: DataGridColumn): number => column.minWidth ?? t.sizeTargetMin;

  // ---- Sorting ----

  const handleSortPress = (column: string): void => {
    commitOpenEdit();
    const direction: DataGridSortDirection = activeSort?.column === column && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (sort === undefined) {
      setInternalSort({ column, direction });
    }
    onSortChange?.(column, direction);
  };

  // ---- Selection ----

  const commitRows = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
    announce(COPY.selectedRows(next.length, total));
  };
  const toggleRow = (id: string): void => {
    commitRows(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
  };
  const loadedIds = rows.map((row) => row.id);
  const allSelected = loadedIds.length > 0 && loadedIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && loadedIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitRows(allSelected ? [] : loadedIds);

  const rowName = (row: DataGridRow): string => (rowHeaderColumn === undefined ? row.id : cellText(row, rowHeaderColumn.key) || row.id);

  // ---- Editing ----

  const closeEditor = (): void => {
    setEditing(null);
    setDraft(undefined);
    setEditError(undefined);
  };

  const commitEdit = (row: DataGridRow, column: DataGridColumn, value: DataGridCellValue): boolean => {
    // `validate` runs on every commit, unchanged ones included; only the report is skipped.
    const message = column.validate?.(value, row);
    if (message !== undefined) {
      setEditError(message);
      announce(COPY.invalid(message));
      return false;
    }
    const previous = cellValue(row, column.key);
    closeEditor();
    if (!Object.is(value, previous)) {
      onCellChange?.(row.id, column.key, value, previous);
    }
    return true;
  };

  /** Commits the open draft editor (text, number, date), if any; true when nothing is left open. */
  function commitOpenEdit(): boolean {
    if (editing === null) {
      return true;
    }
    const row = rows.find((candidate) => candidate.id === editing.rowId);
    const column = columnByKey.get(editing.column);
    if (row === undefined || column === undefined) {
      closeEditor();
      return true;
    }
    return commitEdit(row, column, draft);
  }

  // An open editor whose row leaves `data` drops its draft silently: no onCellChange, as a cancel.
  const editingRowLoaded = editing === null || rows.some((row) => row.id === editing.rowId);
  React.useEffect(() => {
    if (!editingRowLoaded) {
      closeEditor();
    }
  }, [editingRowLoaded]);

  const startEdit = (row: DataGridRow, column: DataGridColumn): void => {
    if (sameCell(editing, row.id, column.key) || !commitOpenEdit()) {
      return;
    }
    if (onEditStart?.(row.id, column.key) === false) {
      return;
    }
    setEditing({ rowId: row.id, column: column.key });
    setDraft(cellValue(row, column.key));
    setEditError(undefined);
    announce(COPY.editing(column.header));
  };

  const editorFor = (row: DataGridRow, column: DataGridColumn): React.ReactNode => {
    const label = column.header;
    const name = `${baseId}-${row.id}-${column.key}`;
    // Editors are never told about validity: the cell carries cellInvalid* and the status bar the message.
    switch (column.editor) {
      case 'number':
        return (
          <NumberInput
            label={label}
            hideLabel
            name={name}
            size="sm"
            value={typeof draft === 'number' ? draft : draft === undefined || draft === '' ? undefined : Number(draft)}
            overrides={editorInset}
            onChangeText={(value) => setDraft(value)}
          />
        );
      case 'select':
        return (
          <Select
            label={label}
            hideLabel
            name={name}
            size="sm"
            open
            options={column.options ?? []}
            value={typeof draft === 'string' ? draft : undefined}
            overrides={{ triggerPaddingInline: INSET_ZERO, triggerPaddingBlock: INSET_ZERO }}
            onChange={(value) => commitEdit(row, column, Array.isArray(value) ? value[0] : value)}
            onOpenChange={(open) => {
              if (!open) {
                closeEditor();
              }
            }}
          />
        );
      case 'date':
        return (
          <DatePicker
            label={label}
            hideLabel
            name={name}
            size="sm"
            value={typeof draft === 'string' && draft !== '' ? draft : undefined}
            overrides={editorInset}
            onChange={(value) => setDraft(typeof value === 'string' ? value : undefined)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox label={label} hideLabel name={name} checked={draft === true} onChange={(checked) => commitEdit(row, column, checked)} />
        );
      default:
        return (
          <Input
            label={label}
            hideLabel
            name={name}
            size="sm"
            value={draft === undefined ? '' : String(draft)}
            overrides={editorInset}
            onChangeText={(value) => setDraft(value)}
            onBlur={() => commitEdit(row, column, draft)}
          />
        );
    }
  };

  // ---- Header ----

  const selectColumnStyle: ViewStyle = { width: selectColumnWidth, alignItems: 'center', justifyContent: 'center' };
  const pinnedCellStyle = (column: DataGridColumn | null): ViewStyle | null =>
    scrolledX && (column === null || column.pinned !== undefined) ? { zIndex: 1, ...pinnedShadow } : null;

  const resizeTo = (column: DataGridColumn, width: number): void => {
    setWidths((previous) => ({ ...previous, [column.key]: Math.max(minWidthFor(column), width) }));
  };

  const headerRow = (
    <View
      testID="DataGrid.header"
      role="rowgroup"
      onLayout={(event: LayoutChangeEvent) => setHeaderHeight(event.nativeEvent.layout.height)}
      style={{ backgroundColor: t.colorBackgroundSubtle, ...(headerScrolled ? headerShadow : null) }}
    >
      <View
        testID="DataGrid.headerRow"
        role="row"
        style={{ flexDirection: 'row', alignItems: 'stretch', minHeight: rowHeight, borderBottomWidth: headerBorderWidth, borderBottomColor: headerBorder }}
      >
        {mode === 'row' ? (
          <View
            testID="DataGrid.selectAllCell"
            role="columnheader"
            style={[
              selectColumnStyle,
              { backgroundColor: t.colorBackgroundSubtle, borderEndWidth: gridLineWidth, borderEndColor: gridLine },
              pinnedCellStyle(null),
            ]}
          >
            <Checkbox
              label={COPY.selectAll}
              hideLabel
              name={`${baseId}-all`}
              checked={allSelected}
              indeterminate={someSelected}
              overrides={{ controlSize: MIN_TARGET }}
              onChange={toggleAll}
            />
          </View>
        ) : null}
        {columns.map((column) => {
          const width = widthFor(column);
          const sorted = activeSort?.column === column.key;
          const resizeActions =
            column.resizable === true
              ? [
                  { name: 'increment', label: COPY.resize(column.header) },
                  { name: 'decrement', label: COPY.resize(column.header) },
                ]
              : undefined;
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
              testID="DataGrid.columnHeader"
              role="columnheader"
              accessibilityActions={resizeActions}
              onAccessibilityAction={resizeActions !== undefined ? handleAction : undefined}
              style={[
                {
                  width,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: JUSTIFY[column.align ?? 'start'],
                  paddingStart: cellPaddingInline,
                  paddingEnd: column.resizable === true ? 0 : cellPaddingInline,
                  backgroundColor: t.colorBackgroundSubtle,
                  borderEndWidth: gridLineWidth,
                  borderEndColor: gridLine,
                },
                pinnedCellStyle(column),
              ]}
            >
              <View style={{ flexGrow: 1, flexShrink: 1, alignItems: JUSTIFY[column.align ?? 'start'] }}>
                {column.sortable === true ? (
                  // The sortButton part is the grid's own wrapper around the Button and takes the press
                  // too; `accessible={false}` keeps the Button its own accessibility element.
                  <Pressable testID="DataGrid.sortButton" accessible={false} onPress={() => handleSortPress(column.key)}>
                    <Button
                      label={column.header}
                      accessibleName={sorted && activeSort.direction === 'ascending' ? COPY.sortDescending(column.header) : COPY.sortAscending(column.header)}
                      variant="ghost"
                      size="sm"
                      trailingIcon={
                        sorted ? (
                          <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorActionGhostForeground} />
                        ) : undefined
                      }
                      overrides={{ fontWeight: headerWeight, fontSize: headerSize, paddingInline: INSET_ZERO }}
                      onPress={() => handleSortPress(column.key)}
                    />
                  </Pressable>
                ) : (
                  // `abbr` is the spoken name; the visible header is hidden behind it, as on web.
                  <View accessible accessibilityLabel={column.abbr ?? column.header} aria-label={column.abbr ?? column.header}>
                    <Text size="sm" weight="semibold" align={column.align ?? 'start'} overrides={headerText}>
                      {column.header}
                    </Text>
                  </View>
                )}
              </View>
              {column.resizable === true ? (
                <ResizeHandle
                  width={width}
                  minWidth={minWidthFor(column)}
                  color={resizeHandle}
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

  const renderRow = ({ item: row }: ListRenderItemInfo<DataGridRow>): React.JSX.Element => {
    const rowSelected = mode === 'row' && selectedSet.has(row.id);
    const background = rowSelected ? t.colorBackgroundSubtle : t.colorBackground;
    return (
      <View
        testID="DataGrid.row"
        role="row"
        accessibilityState={mode === 'row' ? { selected: rowSelected } : undefined}
        aria-selected={mode === 'row' ? rowSelected : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          height: rowHeight,
          backgroundColor: background,
          borderBottomWidth: gridLineWidth,
          borderBottomColor: gridLine,
          borderStartWidth: t.borderWidthFocus,
          borderStartColor: rowSelected ? t.colorControlSelectedBackground : background,
        }}
      >
        {/* A selected row keeps rowSelected: the hover/pressed tint is not drawn over it. */}
        <RowTint visible={!rowSelected && (hoveredRow === row.id || pressedRow === row.id)} color={rowHover} duration={transition} />
        {mode === 'row' ? (
          // The selectCell part is the cell holding the Checkbox, so a press anywhere on it toggles
          // the row; `accessible={false}` leaves the Checkbox its own accessibility element.
          <Pressable
            testID="DataGrid.selectCell"
            role="cell"
            accessible={false}
            onPress={() => toggleRow(row.id)}
            onPressIn={() => setPressedRow(row.id)}
            onPressOut={() => setPressedRow((current) => (current === row.id ? null : current))}
            onHoverIn={() => setHoveredRow(row.id)}
            onHoverOut={() => setHoveredRow((current) => (current === row.id ? null : current))}
            style={[
              selectColumnStyle,
              // Transparent so the row tint shows through, opaque only while it casts the pinned shadow.
              { backgroundColor: scrolledX ? background : 'transparent', borderEndWidth: gridLineWidth, borderEndColor: gridLine },
              pinnedCellStyle(null),
            ]}
          >
            <Checkbox
              label={COPY.selectRow(rowName(row))}
              hideLabel
              name={`${baseId}-${row.id}`}
              checked={rowSelected}
              overrides={{ controlSize: MIN_TARGET }}
              onChange={() => toggleRow(row.id)}
            />
          </Pressable>
        ) : null}
        {columns.map((column) => {
          const key = `${row.id} ${column.key}`;
          const isRowHeader = column === rowHeaderColumn;
          const role: Role = isRowHeader ? 'rowheader' : 'cell';
          const canEdit = editable && column.editable === true;
          const isEditing = sameCell(editing, row.id, column.key);
          const invalid = isEditing && editError !== undefined;
          const cellSelected = mode === 'cell' && sameCell(activeCell, row.id, column.key);
          // In `cell` mode selection follows focus and the focus ring is its only visual —
          // a selected cell takes no fill of its own.
          const cellBackground = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : 'transparent';
          const style: ViewStyle[] = [
            {
              width: widthFor(column),
              paddingHorizontal: cellPaddingInline,
              justifyContent: 'center',
              alignItems: isEditing ? 'stretch' : JUSTIFY[column.align ?? 'start'],
              backgroundColor: cellBackground,
              borderEndWidth: gridLineWidth,
              borderEndColor: gridLine,
            },
          ];
          const pinned = pinnedCellStyle(column);
          if (pinned !== null) {
            style.push({ ...pinned, backgroundColor: cellBackground === 'transparent' ? background : cellBackground });
          }
          const ring = invalid ? (
            <CellRing color={t.colorBorderDanger} width={t.borderWidthFocus} />
          ) : isEditing ? (
            <CellRing color={t.colorBorderFocus} width={t.borderWidthFocus} />
          ) : focusedCell === key || cellSelected ? (
            <CellRing color={t.colorBorderFocus} width={t.borderWidthFocus} />
          ) : null;

          if (isEditing) {
            const handleEditorAction = (event: AccessibilityActionEvent): void => {
              if (event.nativeEvent.actionName === 'activate') {
                commitOpenEdit();
              } else if (event.nativeEvent.actionName === 'escape') {
                closeEditor();
              }
            };
            return (
              <View
                key={column.key}
                testID={isRowHeader ? 'DataGrid.rowHeader' : 'DataGrid.cell'}
                role={role}
                accessibilityActions={[{ name: 'activate' }, { name: 'escape' }]}
                onAccessibilityAction={handleEditorAction}
                style={style}
              >
                <View testID="DataGrid.editor">{editorFor(row, column)}</View>
                {ring}
              </View>
            );
          }

          const value = cellText(row, column.key);
          const numeric = typeof row[column.key] === 'number';
          const content =
            column.render !== undefined ? (
              column.render(row)
            ) : (
              <Text
                size="sm"
                align={column.align ?? 'start'}
                tone={loading ? 'muted' : 'default'}
                truncate
                overrides={numeric ? numericText : bodyText}
              >
                {value}
              </Text>
            );
          const interactive = canEdit || mode === 'cell' || editing !== null;
          return (
            <Pressable
              key={column.key}
              testID={isRowHeader ? 'DataGrid.rowHeader' : 'DataGrid.cell'}
              role={role}
              accessibilityLabel={COPY.cellLabel(column.header, value)}
              aria-label={COPY.cellLabel(column.header, value)}
              accessibilityHint={canEdit ? COPY.editHint : undefined}
              accessibilityState={mode === 'cell' ? { selected: cellSelected } : undefined}
              // ARIA allows aria-selected on rowheader but not on `cell` (RN's Role has no gridcell), so
              // a plain cell carries the native state only.
              aria-selected={mode === 'cell' && isRowHeader ? cellSelected : undefined}
              onPress={
                interactive
                  ? () => {
                      if (mode === 'cell' && !cellSelected) {
                        const next = { rowId: row.id, column: column.key };
                        setActiveCell(next);
                        onSelectionChange?.(next);
                      }
                      if (canEdit) {
                        startEdit(row, column);
                      } else {
                        commitOpenEdit();
                      }
                    }
                  : undefined
              }
              onPressIn={interactive ? () => setPressedRow(row.id) : undefined}
              onPressOut={interactive ? () => setPressedRow((current) => (current === row.id ? null : current)) : undefined}
              onFocus={() => setFocusedCell(key)}
              onBlur={() => setFocusedCell((current) => (current === key ? null : current))}
              onHoverIn={() => setHoveredRow(row.id)}
              onHoverOut={() => setHoveredRow((current) => (current === row.id ? null : current))}
              style={style}
            >
              <View testID="DataGrid.cellContent" style={{ alignItems: JUSTIFY[column.align ?? 'start'] }}>
                {content}
              </View>
              {ring}
            </Pressable>
          );
        })}
      </View>
    );
  };

  // ---- Paging ----

  const requestedEnd = React.useRef<number | null>(null);
  // Checked on scroll only, never on mount: FlatList calls onEndReached for a list that is
  // shorter than its region as soon as it lays out, and a page request there is not a user's.
  const hasScrolled = React.useRef(false);
  React.useEffect(() => {
    requestedEnd.current = null;
  }, [data.length]);
  // One visible page, the sticky header's row left out so a paged request keeps a row of context.
  const rowsPerPage = Math.max(1, Math.floor((listHeight ?? viewport.height) / rowHeight) - 1);
  const handleEndReached = (): void => {
    if (!hasScrolled.current || rowCount === undefined || data.length >= rowCount) {
      return;
    }
    const end = Math.min(rowCount - 1, data.length + rowsPerPage - 1);
    if (requestedEnd.current === end) {
      return;
    }
    requestedEnd.current = end;
    onEndReached?.(data.length, end);
  };

  // ---- Layout ----

  const contentWidth = columns.reduce((sum, column) => sum + widthFor(column), mode === 'row' ? selectColumnWidth : 0) + t.borderWidthFocus;
  const overflows = regionWidth !== null && contentWidth > regionWidth;
  const bounded = height !== 'content';
  // "The grid inside the region has focus": a cell that reported focus (react-native-web only —
  // core RN gives View and Pressable no focus events) or an open editor.
  const gridFocused = focusedCell !== null || editing !== null;
  const flexStyle: ViewStyle = { flexGrow: 1, flexShrink: 1 };

  const emptyState = (
    <View testID="DataGrid.emptyState" style={{ paddingHorizontal: cellPaddingInline, minHeight: rowHeight, justifyContent: 'center' }}>
      {/* emptyState composes Text with no forwards. */}
      <Text size="sm" tone="muted">
        {emptyMessage ?? COPY.empty}
      </Text>
    </View>
  );

  // The one live message: the state that most needs saying, in the order the doc lists it.
  const live = loading
    ? COPY.loading
    : editError !== undefined
      ? COPY.invalid(editError)
      : editing !== null
        ? COPY.editing(columnByKey.get(editing.column)?.header ?? editing.column)
        : announcement;
  const activeIndex = activeCell === null ? -1 : rows.findIndex((row) => row.id === activeCell.rowId);
  const gridLabel = `${caption}, ${COPY.rowCount(total)}`;

  const list = (
    <FlatList
      testID="DataGrid.grid"
      role="grid"
      // Native has no aria-rowcount, so the total is spoken with the name.
      accessibilityLabel={gridLabel}
      aria-label={gridLabel}
      accessibilityState={{ busy: loading }}
      aria-busy={loading}
      data={rows}
      extraData={[selectedIds, activeSort, activeCell, focusedCell, hoveredRow, pressedRow, editing, draft, editError, widths, scrolledX, density, loading]}
      keyExtractor={(row) => row.id}
      renderItem={renderRow}
      // Offsets start below the list header (the header row), measured once laid out.
      getItemLayout={(_items, index) => ({ length: rowHeight, offset: (headerHeight ?? rowHeight + headerBorderWidth) + rowHeight * index, index })}
      ListHeaderComponent={headerRow}
      // Suppressed while loading: a first page in flight shows copy.loading and no empty message.
      ListEmptyComponent={loading ? undefined : emptyState}
      // Always sticky when virtualized; with `height: content` the page scrolls, so it has no effect.
      stickyHeaderIndices={bounded ? [0] : undefined}
      scrollEnabled={bounded}
      initialNumToRender={bounded ? undefined : data.length}
      onScroll={(event) => {
        hasScrolled.current = true;
        setHeaderScrolled(event.nativeEvent.contentOffset.y > 0);
      }}
      scrollEventThrottle={16} // literal-ok: one frame between the header shadow and the scroll position
      onEndReached={rowCount !== undefined ? handleEndReached : undefined}
      onEndReachedThreshold={1}
      onLayout={(event: LayoutChangeEvent) => setListHeight(event.nativeEvent.layout.height)}
      style={bounded ? flexStyle : undefined}
    />
  );

  return (
    <View
      ref={ref}
      testID="DataGrid"
      style={{
        backgroundColor: t.colorBackground,
        // `viewport` and `fixed` size the whole component; the scroll region takes what the caption
        // and status bar leave. Without an `overrides.fixedHeight` a fixed grid has no room for rows.
        ...(height === 'viewport'
          ? { height: viewport.height - 2 * t.layoutGapSection }
          : height === 'fixed'
            ? { height: fixedHeight }
            : null),
      }}
    >
      {/* captionGap is the grid's own inset below the caption; the Heading's margin is turned off, as Table. */}
      <View testID="DataGrid.caption" style={hideCaption ? HIDDEN_STYLE : { paddingBottom: captionGap }}>
        <Heading
          level={captionLevel}
          size="md"
          // Exactly the parts contract's forwards, plus the margin reset the captionGap binding asks for.
          overrides={{
            fontSize: overrides?.captionSize ?? CAPTION_SIZE,
            fontWeight: overrides?.captionWeight ?? CAPTION_WEIGHT,
            marginBlockEnd: INSET_ZERO,
          }}
        >
          {caption}
        </Heading>
      </View>
      <View
        testID="DataGrid.container"
        style={{
          borderStartWidth: gridLineWidth,
          borderTopWidth: gridLineWidth,
          borderColor: gridLine,
          ...(bounded ? flexStyle : null),
        }}
      >
        <ScrollView
          testID="DataGrid.scrollRegion"
          horizontal
          onScroll={(event) => setScrolledX(event.nativeEvent.contentOffset.x > 0)}
          scrollEventThrottle={16} // literal-ok: one frame between the pinned shadow and the scroll position
          onLayout={(event: LayoutChangeEvent) => setRegionWidth(event.nativeEvent.layout.width)}
          contentContainerStyle={{ minWidth: contentWidth, flexGrow: 1 }}
          // The ring is the scroll region's, not the cell's, so the region's own overflow never
          // clips it; it is always laid out and only coloured, so focus shifts nothing.
          style={[
            { borderWidth: focusRingWidth, borderColor: gridFocused ? focusRing : 'transparent' },
            bounded ? flexStyle : null,
          ]}
        >
          <View style={[{ width: contentWidth }, bounded ? flexStyle : null]}>{list}</View>
        </ScrollView>
      </View>
      {/* The bar element the grid owns carries no part of its own: `statusBar` stays on the live Text. */}
      <View
        style={
          showStatusBar
            ? {
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: statusBarGap,
                padding: statusBarPadding,
                backgroundColor: t.colorBackgroundSubtle,
              }
            : HIDDEN_STYLE
        }
      >
        {/* The live region: what a screen reader hears. Everything beside it is shown, never announced. */}
        <View testID="DataGrid.statusBar" role="status" accessibilityLiveRegion="polite">
          {editError !== undefined && !loading ? (
            <View style={{ backgroundColor: t.colorStatusDangerBackground }}>
              <TextForegroundContext.Provider value={t.colorStatusDangerForeground}>
                <Text size="xs" overrides={statusBarText}>
                  {live}
                </Text>
              </TextForegroundContext.Provider>
            </View>
          ) : (
            <Text size="xs" tone="muted" overrides={statusBarText}>
              {live}
            </Text>
          )}
        </View>
        {showStatusBar ? (
          <>
            <Text size="xs" tone="muted" overrides={statusBarText}>
              {COPY.rowCount(total)}
            </Text>
            {mode === 'row' && selectedIds.length > 0 ? (
              <Text size="xs" tone="muted" overrides={statusBarText}>
                {COPY.selectedRows(selectedIds.length, total)}
              </Text>
            ) : null}
            {overflows && !scrolledX ? (
              <Text size="xs" tone="muted" overrides={statusBarText}>
                {COPY.scrollHint}
              </Text>
            ) : null}
            {activeIndex >= 0 && activeCell !== null ? (
              <Text size="xs" tone="muted" overrides={statusBarText}>
                {COPY.position(activeIndex + 1, columnByKey.get(activeCell.column)?.header ?? activeCell.column)}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}
