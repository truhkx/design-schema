import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent, ListRenderItemInfo, ViewInstance, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Text } from './Text';
import { Toolbar } from './Toolbar';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type TableColumnAlign = 'start' | 'end' | 'center';
export type TableColumnWidth = 'auto' | 'min' | 'fill';
export type TableHideBelow = 'prose' | 'content';
export type TableSortDirection = 'ascending' | 'descending';
export type TableSelectable = 'none' | 'single' | 'multiple';
export type TableResponsive = 'stack' | 'scroll';
export type TableMaxHeight = 'none' | 'viewport';
export type TableDensity = 'compact' | 'comfortable';
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
export type TableCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** A single record. `id` must be stable; it is what selection and keys use. */
export type TableRow = { id: string; [key: string]: unknown };

/** One column definition, in display order. */
export type TableColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: 'start' | 'end' | 'center';
  sortable?: boolean;
  width?: 'auto' | 'min' | 'fill';
  isRowHeader?: boolean;
  hideBelow?: 'prose' | 'content';
  render?: (row: TableRow) => React.ReactNode;
};

/** Sort state: which column, and which way. */
export type TableSort = { column: string; direction: 'ascending' | 'descending' };

/** The style bindings a caller may replace with a different token; see the component's overrides contract. */
export type TableOverridableBinding =
  | 'headerWeight'
  | 'headerSize'
  | 'headerBorder'
  | 'headerBorderWidth'
  | 'headerShadow'
  | 'rowBorder'
  | 'rowBorderWidth'
  | 'rowHover'
  | 'cellPaddingInline'
  | 'cellPaddingBlock'
  | 'cellGap'
  | 'captionSize'
  | 'captionWeight'
  | 'captionGap'
  | 'stackedRowInset'
  | 'stackedRowGap'
  | 'stackedBlockGap'
  | 'stackedLabelSize'
  | 'stackedLabelWeight'
  | 'stackedRowRadius'
  | 'stickyColumnShadow'
  | 'scrollFade'
  | 'fontFamily'
  | 'fontSize'
  | 'lineHeight'
  | 'numericFont'
  | 'transition';

export interface TableProps {
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name; never omitted. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /**
   * Content below the table: a row count, pagination, a total. Rendered in the `footer` part; a string
   * renders in Text with the table's `fontFamily`/`fontSize`/`lineHeight`, other content brings its own typography.
   */
  footer?: React.ReactNode | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions in display order. Exactly one column may be `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts the data. */
  sort?: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself by the column value. */
  defaultSort?: TableSort | undefined;
  /** Adds a first column of Checkboxes (radio-like for `single`) and a select-all for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height minus the section rhythm and scrolls the body; `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: `layout.inset.sm` or `layout.inset.md`. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: the list is busy and shows `copy.loading`; existing rows stay visible. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell: Buttons (ghost, sm, iconOnly) or a Menu. */
  rowActions?: ((row: TableRow) => React.ReactNode) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then descending on the same one. */
  onSortChange?: ((column: string, direction: 'ascending' | 'descending') => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated (its row-header cell), with its id. */
  onRowPress?: ((id: string) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

const COPY = {
  sortToolbarLabel: (caption: string): string => `Sort ${caption}`,
  sortAscending: (column: string): string => `Sort by ${column}, ascending`,
  sortDescending: (column: string): string => `Sort by ${column}, descending`,
  sortedAnnouncement: (column: string, direction: string): string => `Sorted by ${column}, ${direction}`,
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedCount: (count: number, total: number): string => `${count} of ${total} selected`,
  cellLabel: (column: string, value: string): string => `${column}: ${value}`,
  actions: 'Actions',
  empty: 'Nothing to show.',
  loading: 'Loading',
  scrollHint: 'Scroll sideways to see more columns',
  rowCount: (count: number): string => {
    const form = new Intl.PluralRules().select(count);
    return form === 'one' ? `${count} row` : `${count} rows`;
  },
} as const;

const PADDING_INLINE = { compact: 'layoutInsetSm', comfortable: 'layoutInsetMd' } as const;

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** Clips content to one point while keeping it in the accessibility tree (visually hidden caption, header text, live regions). */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const NUMERIC_FONT: TokenRef = 'font.family.mono';
const HEADER_WEIGHT: TokenRef = 'font.weight.semibold';
const CELL_GAP: TokenRef = 'layout.gap.tight';
const CAPTION_SIZE: TokenRef = 'font.size.md';
const CAPTION_WEIGHT: TokenRef = 'font.weight.semibold';
const CAPTION_GAP: TokenRef = 'space.2';

type Shadow = Tokens['shadowRaised'];

function tokenOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref === undefined ? fallback : (resolveToken(t, ref) as T);
}

function cellValue(row: TableRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareRows(a: TableRow, b: TableRow, sort: TableSort): number {
  const factor = sort.direction === 'ascending' ? 1 : -1;
  const av = a[sort.column];
  const bv = b[sort.column];
  if (typeof av === 'number' && typeof bv === 'number') {
    return (av - bv) * factor;
  }
  return cellValue(a, sort.column).localeCompare(cellValue(b, sort.column), undefined, { numeric: true }) * factor;
}

/** The interactive-row hover tint, faded over `transition` (instant under reduced motion). */
function HoverTint({ visible, color, duration }: { visible: boolean; color: string; duration: number }): React.JSX.Element {
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

/** One edge fade over the scroll region: opaque `color` at the edge to transparent inward, `scrollFade` long. */
function ScrollFade({ edge, inset, length, color }: { edge: 'start' | 'end'; inset: number; length: number; color: string }): React.JSX.Element {
  // useId's colons are not valid in an SVG `url(#…)` reference on react-native-web.
  const gradientId = `table-fade-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const position: ViewStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: length,
    pointerEvents: 'none',
    ...(edge === 'start' ? { start: inset } : { end: inset }),
  };
  const from = edge === 'start' ? '0%' : '100%';
  const to = edge === 'start' ? '100%' : '0%';
  return (
    <View style={position} accessibilityElementsHidden importantForAccessibility="no">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1={from} y1="0%" x2={to} y2="0%">
            <Stop offset="0" stopColor={color} stopOpacity={1} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

/**
 * Table — the honest way to show records that share fields: every row the same shape,
 * every column a comparable thing.
 *
 * When to use: a list of records with three or more comparable fields (orders, invoices,
 * members). `responsive: stack` when each row is a thing a person reads, `scroll` when
 * the columns are the point. Not for layout, one- or two-field lists, key–value pairs, or
 * cells edited in place or navigated with arrows (that is DataGrid).
 *
 * There is no table element on native. The layout follows the table's own measured width
 * (a container query, not the window): below `layout.maxWidth.prose` a `stack` table is a
 * `FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) of bordered
 * blocks whose accessible summary joins `copy.cellLabel` for every visible column, row
 * header first, with the selected state; the selection Checkbox and `rowActions` are
 * separate stops beside it, and sortable columns become a `Toolbar` of Buttons above the
 * list (`copy.sortToolbarLabel`). At or above that width (tablets, react-native-web) the
 * same list renders a header row (`accessibilityRole="header"` cells) and rows of
 * fixed-width cells: `width: fill` flexes, `auto` and `min` are both `space.20`.
 * `responsive: scroll` keeps the columns at every width inside a horizontal scroll region
 * named by the caption with `copy.scrollHint` as its hint; the row-header cells are
 * translated by the horizontal offset so they stay pinned, and cast `stickyColumnShadow`
 * once scrolled, with a `scrollFade` gradient over each edge that still hides columns
 * (react-native-svg, as Toolbar does; the start fade begins where the pinned column ends). `stickyHeader` pins the list header (`stickyHeaderIndices`), which casts
 * `headerShadow` once the body has scrolled beneath it; with `maxHeight: none` the list
 * does not scroll itself, so the page does. `abbr` has no effect on native.
 *
 * Sorting with a controlled `sort` leaves ordering to the caller; otherwise the table
 * sorts `data` from its own state (numbers numerically, anything else with
 * `localeCompare`, numeric collation). Sort Buttons show the header text and carry
 * `copy.sortAscending`/`copy.sortDescending` — what the press will do — as their name.
 * `single` selection behaves like radios, and pressing the selected row again clears it;
 * `multiple` adds select-all, indeterminate when some rows are selected. Sort and
 * selection changes post `copy.sortedAnnouncement` / `copy.selectedCount` to a polite
 * live region (Android) and `AccessibilityInfo.announceForAccessibility` (iOS).
 * `onRowPress` turns the row-header cell into the row's Button and tints the whole row on
 * hover over `transition`; it needs an `isRowHeader` column without a custom `render`
 * (a `__DEV__` warning otherwise, and rows stay inert). Arrow-key scrolling of the scroll
 * region is left to the platform: native hardware keyboards have no equivalent.
 */
export function Table({
  caption,
  captionLevel = '2',
  footer,
  hideCaption = false,
  columns,
  data,
  sort,
  defaultSort,
  selectable = 'none',
  selected,
  defaultSelected,
  responsive = 'stack',
  stickyHeader = true,
  maxHeight = 'none',
  density = 'comfortable',
  striped = false,
  emptyMessage,
  loading = false,
  rowActions,
  overrides,
  onSortChange,
  onSelectionChange,
  onRowPress,
  ref,
}: TableProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const viewport = useWindowDimensions();
  const baseId = React.useId();

  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);
  const width = measuredWidth ?? viewport.width;
  const narrow = width < t.layoutMaxWidthProse;
  const layout: 'stack' | 'table' | 'scroll' = responsive === 'scroll' ? 'scroll' : narrow ? 'stack' : 'table';

  const [internalSort, setInternalSort] = React.useState<TableSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;

  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [columnScrolled, setColumnScrolled] = React.useState(false);
  const [sortAnnouncement, setSortAnnouncement] = React.useState('');
  const [selectionAnnouncement, setSelectionAnnouncement] = React.useState('');

  const scrollX = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const id = scrollX.addListener(({ value }) => setColumnScrolled(value > 0));
    return () => scrollX.removeListener(id);
  }, [scrollX]);

  // Which edges of the scroll region have columns hidden past them, so a fade only covers hidden content.
  // The start fade begins where the pinned row-header column ends, so it never covers the pinned cells.
  const [fadeEdges, setFadeEdges] = React.useState({ start: false, end: false });
  const [pinnedEnd, setPinnedEnd] = React.useState(0);
  const scrollMetrics = React.useRef({ offset: 0, viewport: 0, content: 0 });
  const updateFadeEdges = (): void => {
    const { offset, viewport: visible, content } = scrollMetrics.current;
    const start = offset > 1;
    const end = offset + visible < content - 1;
    setFadeEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  };

  const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);
  const rowPressEnabled = onRowPress !== undefined && rowHeaderColumn !== undefined && rowHeaderColumn.render === undefined;

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (columns.filter((column) => column.isRowHeader === true).length > 1) {
      console.warn('Table: only one column may set `isRowHeader`; the first one is used.');
    }
    if (onRowPress !== undefined && rowHeaderColumn === undefined) {
      console.warn('Table: `onRowPress` needs an `isRowHeader` column to become the row\'s Button; rows stay inert.');
    } else if (onRowPress !== undefined && rowHeaderColumn?.render !== undefined) {
      console.warn('Table: `onRowPress` is ignored when the row-header column has a custom `render`; put a Link in it instead.');
    }
  }, [columns, onRowPress, rowHeaderColumn]);

  // Announce sort and selection once the shown state changes (a controlled table only
  // changes when its prop does), never on mount.
  const announce = (message: string, setMessage: (message: string) => void): void => {
    setMessage(message);
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
    announce(COPY.sortedAnnouncement(header, activeSort.direction), setSortAnnouncement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey]);
  const selectionKey = selectedIds.join(' ');
  const lastSelectionKey = React.useRef(selectionKey);
  React.useEffect(() => {
    if (lastSelectionKey.current === selectionKey || selectable === 'none') {
      lastSelectionKey.current = selectionKey;
      return;
    }
    lastSelectionKey.current = selectionKey;
    announce(COPY.selectedCount(selectedIds.length, data.length), setSelectionAnnouncement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey]);

  const visibleColumns = columns.filter((column) => {
    if (layout === 'scroll' || column.hideBelow === undefined) {
      return true;
    }
    return width >= (column.hideBelow === 'prose' ? t.layoutMaxWidthProse : t.layoutMaxWidthContent);
  });
  const summaryColumns = rowHeaderColumn !== undefined && visibleColumns.includes(rowHeaderColumn)
    ? [rowHeaderColumn, ...visibleColumns.filter((column) => column !== rowHeaderColumn)]
    : visibleColumns;

  const rows = React.useMemo(
    () => (sort === undefined && internalSort !== undefined ? [...data].sort((a, b) => compareRows(a, b, internalSort)) : data),
    [data, sort, internalSort],
  );

  const handleSortPress = (column: string): void => {
    const direction: TableSortDirection =
      activeSort?.column === column && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (sort === undefined) {
      setInternalSort({ column, direction });
    }
    onSortChange?.(column, direction);
  };

  const commitSelection = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };
  const toggleRow = (id: string): void => {
    if (selectable === 'single') {
      commitSelection(selectedSet.has(id) ? [] : [id]);
    } else if (selectable === 'multiple') {
      commitSelection(selectedSet.has(id) ? selectedIds.filter((existing) => existing !== id) : [...selectedIds, id]);
    }
  };
  const allIds = rows.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitSelection(allSelected ? [] : allIds);

  const rowName = (row: TableRow): string =>
    rowHeaderColumn === undefined ? row.id : cellValue(row, rowHeaderColumn.key) || row.id;

  // Bindings
  const headerBorder = tokenOr<string>(t, overrides?.headerBorder, t.colorBorderStrong);
  const headerBorderWidth = tokenOr<number>(t, overrides?.headerBorderWidth, t.borderWidthThin);
  const headerShadow = tokenOr<Shadow>(t, overrides?.headerShadow, t.shadowRaised);
  const rowBorder = tokenOr<string>(t, overrides?.rowBorder, t.colorBorder);
  const rowBorderWidth = tokenOr<number>(t, overrides?.rowBorderWidth, t.borderWidthThin);
  const rowHover = tokenOr<string>(t, overrides?.rowHover, t.colorActionGhostBackgroundHover);
  const cellPaddingInline = tokenOr<number>(t, overrides?.cellPaddingInline, t[PADDING_INLINE[density]]);
  const cellPaddingBlock = tokenOr<number>(t, overrides?.cellPaddingBlock, t.spaceSm);
  const cellGap = tokenOr<number>(t, overrides?.cellGap, t.layoutGapTight);
  const stackedRowInset = tokenOr<number>(t, overrides?.stackedRowInset, t.layoutInsetMd);
  const stackedRowGap = tokenOr<number>(t, overrides?.stackedRowGap, t.layoutGapTight);
  const stackedBlockGap = tokenOr<number>(t, overrides?.stackedBlockGap, t.layoutGapTight);
  const stackedRowRadius = tokenOr<number>(t, overrides?.stackedRowRadius, t.radiusMd);
  const scrollFade = tokenOr<number>(t, overrides?.scrollFade, t.space6);
  const stickyColumnShadow = tokenOr<Shadow>(t, overrides?.stickyColumnShadow, t.shadowRaised);
  const transition = tokenOr<number>(t, overrides?.transition, t.motionDurationFast);

  const bodyText = { fontFamily: overrides?.fontFamily, fontSize: overrides?.fontSize, lineHeight: overrides?.lineHeight };
  const numericText = { ...bodyText, fontFamily: overrides?.numericFont ?? NUMERIC_FONT };
  const headerText = {
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
    fontSize: overrides?.headerSize,
    fontWeight: overrides?.headerWeight,
  };
  const stackedLabelText = {
    fontFamily: overrides?.fontFamily,
    lineHeight: overrides?.lineHeight,
    fontSize: overrides?.stackedLabelSize,
    fontWeight: overrides?.stackedLabelWeight,
  };

  const rowBackground = (row: TableRow, index: number): string =>
    (selectable !== 'none' && selectedSet.has(row.id)) || (striped && index % 2 === 1) ? t.colorBackgroundSubtle : t.colorBackground;

  const cellStyle: ViewStyle = { paddingHorizontal: cellPaddingInline, paddingVertical: cellPaddingBlock, justifyContent: 'center' };
  const selectCellStyle: ViewStyle = { width: t.sizeTargetComfortable, alignItems: 'center', justifyContent: 'center' };
  const columnBox = (column: TableColumn): ViewStyle =>
    column.width === 'fill'
      ? { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: t.space20, alignItems: JUSTIFY[column.align ?? 'start'] }
      : { width: t.space20, alignItems: JUSTIFY[column.align ?? 'start'] };

  const renderValue = (row: TableRow, column: TableColumn): React.ReactNode =>
    column.render !== undefined ? (
      column.render(row)
    ) : (
      <Text size="sm" align={column.align ?? 'start'} overrides={column.align === 'end' ? numericText : bodyText}>
        {cellValue(row, column.key)}
      </Text>
    );

  const sortIcon = (column: TableColumn): React.ReactNode =>
    activeSort?.column === column.key ? (
      <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorActionGhostForeground} />
    ) : undefined;

  const sortButton = (column: TableColumn): React.JSX.Element => (
    <Button
      key={column.key}
      label={column.header}
      accessibleName={
        activeSort?.column === column.key && activeSort.direction === 'ascending'
          ? COPY.sortDescending(column.header)
          : COPY.sortAscending(column.header)
      }
      variant="ghost"
      size="sm"
      trailingIcon={sortIcon(column)}
      overrides={{ fontWeight: overrides?.headerWeight ?? HEADER_WEIGHT, iconGap: overrides?.cellGap ?? CELL_GAP }}
      onPress={() => handleSortPress(column.key)}
    />
  );

  const selectAll =
    selectable === 'multiple' ? (
      <Checkbox
        label={COPY.selectAll}
        hideLabel
        name={`${baseId}-all`}
        checked={allSelected}
        indeterminate={someSelected}
        onChange={toggleAll}
      />
    ) : null;

  const rowCheckbox = (row: TableRow): React.JSX.Element => (
    <View style={selectCellStyle} testID="Table.selectCell">
      <Checkbox
        label={COPY.selectRow(rowName(row))}
        hideLabel
        name={`${baseId}-${row.id}`}
        checked={selectedSet.has(row.id)}
        onChange={() => toggleRow(row.id)}
      />
    </View>
  );

  // ---- Columns: a header row and rows of fixed-width cells (table and scroll) ----

  const pinned = (column: TableColumn): boolean => layout === 'scroll' && column === rowHeaderColumn;
  const pinnedStyle = (background: string): Animated.WithAnimatedValue<ViewStyle> => ({
    transform: [{ translateX: scrollX }],
    zIndex: 1,
    backgroundColor: background,
    ...(columnScrolled ? stickyColumnShadow : null),
  });

  const headerRow = (
    <View
      testID="Table.header"
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: t.colorBackgroundSubtle,
        borderBottomWidth: headerBorderWidth,
        borderBottomColor: headerBorder,
        ...(stickyHeader && headerScrolled ? headerShadow : null),
      }}
    >
      <View testID="Table.headerRow" style={{ flexDirection: 'row', alignItems: 'stretch', flexGrow: 1 }}>
        {selectable !== 'none' ? (
          <View style={selectCellStyle} testID="Table.selectAllCell">
            {selectAll}
          </View>
        ) : null}
        {visibleColumns.map((column) => {
          const content = column.sortable === true ? (
            <View testID="Table.sortButton">{sortButton(column)}</View>
          ) : (
            <Text size="sm" weight="semibold" align={column.align ?? 'start'} overrides={headerText}>
              {column.header}
            </Text>
          );
          const style = [cellStyle, columnBox(column)];
          return pinned(column) ? (
            <Animated.View
              key={column.key}
              testID="Table.columnHeader"
              accessibilityRole="header"
              onLayout={(event: LayoutChangeEvent) => {
                const box = event.nativeEvent.layout;
                setPinnedEnd(box.x + box.width);
              }}
              style={[...style, pinnedStyle(t.colorBackgroundSubtle)]}
            >
              {content}
            </Animated.View>
          ) : (
            <View key={column.key} testID="Table.columnHeader" accessibilityRole="header" style={style}>
              {content}
            </View>
          );
        })}
        {rowActions !== undefined ? (
          <View testID="Table.columnHeader" accessibilityRole="header" style={[cellStyle, { flexShrink: 0 }]}>
            <View style={HIDDEN_STYLE}>
              <Text size="sm">{COPY.actions}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderColumnsRow = ({ item: row, index }: ListRenderItemInfo<TableRow>): React.JSX.Element => {
    const isSelected = selectable !== 'none' && selectedSet.has(row.id);
    const background = rowBackground(row, index);
    return (
      <View
        testID="Table.row"
        accessibilityState={selectable !== 'none' ? { selected: isSelected } : undefined}
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          backgroundColor: background,
          borderBottomWidth: rowBorderWidth,
          borderBottomColor: rowBorder,
          borderStartWidth: t.borderWidthFocus,
          borderStartColor: isSelected ? t.colorControlSelectedBackground : background,
        }}
      >
        {rowPressEnabled ? <HoverTint visible={hoveredId === row.id} color={rowHover} duration={transition} /> : null}
        {selectable !== 'none' ? rowCheckbox(row) : null}
        {visibleColumns.map((column) => {
          const isRowHeader = column === rowHeaderColumn;
          const style = [cellStyle, columnBox(column)];
          if (isRowHeader && rowPressEnabled) {
            const focused = focusedId === row.id;
            return (
              <Pressable
                key={column.key}
                testID="Table.rowHeader"
                accessibilityRole="button"
                accessibilityLabel={rowName(row)}
                accessibilityState={selectable !== 'none' ? { selected: isSelected } : undefined}
                onPress={() => onRowPress?.(row.id)}
                onHoverIn={() => setHoveredId(row.id)}
                onHoverOut={() => setHoveredId((current) => (current === row.id ? null : current))}
                onFocus={() => setFocusedId(row.id)}
                onBlur={() => setFocusedId((current) => (current === row.id ? null : current))}
                style={[
                  ...style,
                  {
                    minHeight: t.sizeTargetMin,
                    borderWidth: t.borderWidthFocus,
                    borderColor: focused ? t.colorBorderFocus : 'transparent',
                  },
                ]}
              >
                {renderValue(row, column)}
              </Pressable>
            );
          }
          const testID = isRowHeader ? 'Table.rowHeader' : 'Table.cell';
          return pinned(column) ? (
            <Animated.View key={column.key} testID={testID} style={[...style, pinnedStyle(background)]}>
              {renderValue(row, column)}
            </Animated.View>
          ) : (
            <View key={column.key} testID={testID} style={style}>
              {renderValue(row, column)}
            </View>
          );
        })}
        {rowActions !== undefined ? (
          <View testID="Table.cell" style={[cellStyle, { flexDirection: 'row', alignItems: 'center', gap: cellGap, flexShrink: 0 }]}>
            {rowActions(row)}
          </View>
        ) : null}
      </View>
    );
  };

  // ---- Stacked: one labelled block per row ----

  const sortableColumns = visibleColumns.filter((column) => column.sortable === true);

  const stackedHeader = (
    <View testID="Table.header" style={{ backgroundColor: t.colorBackground, paddingBottom: cellPaddingBlock, ...(stickyHeader && headerScrolled ? headerShadow : null) }}>
      {selectAll !== null ? <View testID="Table.selectAllCell">{selectAll}</View> : null}
      {sortableColumns.length > 0 ? (
        <Toolbar label={COPY.sortToolbarLabel(caption)} density={density}>
          {sortableColumns.map(sortButton)}
        </Toolbar>
      ) : null}
    </View>
  );

  const renderStackedRow = ({ item: row, index }: ListRenderItemInfo<TableRow>): React.JSX.Element => {
    const isSelected = selectable !== 'none' && selectedSet.has(row.id);
    const background = rowBackground(row, index);
    const summary = summaryColumns.map((column) => COPY.cellLabel(column.header, cellValue(row, column.key))).join(', ');
    const pairs = summaryColumns.map((column) => (
      <View key={column.key} testID={column === rowHeaderColumn ? 'Table.rowHeader' : 'Table.cell'}>
        <View testID="Table.stackedLabel">
          <Text size="xs" weight="medium" tone="muted" overrides={stackedLabelText}>
            {column.header}
          </Text>
        </View>
        {renderValue(row, column)}
      </View>
    ));
    const summaryStyle: ViewStyle = { flexGrow: 1, flexShrink: 1, gap: stackedRowGap };
    const focused = focusedId === row.id;
    return (
      <View
        testID="Table.row"
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: cellGap,
          padding: stackedRowInset,
          borderRadius: stackedRowRadius,
          overflow: 'hidden',
          backgroundColor: background,
          borderWidth: rowBorderWidth,
          borderColor: rowBorder,
          borderStartWidth: t.borderWidthFocus,
          borderStartColor: isSelected ? t.colorControlSelectedBackground : rowBorder,
        }}
      >
        {rowPressEnabled ? <HoverTint visible={hoveredId === row.id} color={rowHover} duration={transition} /> : null}
        {selectable !== 'none' ? rowCheckbox(row) : null}
        {rowPressEnabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={summary}
            accessibilityState={selectable !== 'none' ? { selected: isSelected } : undefined}
            onPress={() => onRowPress?.(row.id)}
            onHoverIn={() => setHoveredId(row.id)}
            onHoverOut={() => setHoveredId((current) => (current === row.id ? null : current))}
            onFocus={() => setFocusedId(row.id)}
            onBlur={() => setFocusedId((current) => (current === row.id ? null : current))}
            style={[summaryStyle, { minHeight: t.sizeTargetMin, borderWidth: t.borderWidthFocus, borderColor: focused ? t.colorBorderFocus : 'transparent' }]}
          >
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ gap: stackedRowGap }}>
              {pairs}
            </View>
          </Pressable>
        ) : (
          <View
            accessible
            accessibilityLabel={summary}
            accessibilityState={selectable !== 'none' ? { selected: isSelected } : undefined}
            style={summaryStyle}
          >
            {pairs}
          </View>
        )}
        {rowActions !== undefined ? (
          <View testID="Table.cell" style={{ flexDirection: 'row', alignItems: 'center', gap: cellGap }}>
            {rowActions(row)}
          </View>
        ) : null}
      </View>
    );
  };

  // ---- The list ----

  const emptyState = (
    <View testID="Table.emptyState" style={cellStyle}>
      <Text size="sm" tone="muted" overrides={bodyText}>
        {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
      </Text>
    </View>
  );

  const list = (
    <FlatList
      testID="Table.table"
      data={rows}
      extraData={[selectedIds, activeSort, hoveredId, focusedId, columnScrolled, layout, width]}
      keyExtractor={(row) => row.id}
      renderItem={layout === 'stack' ? renderStackedRow : renderColumnsRow}
      ListHeaderComponent={layout === 'stack' ? stackedHeader : headerRow}
      ListEmptyComponent={emptyState}
      stickyHeaderIndices={stickyHeader ? [0] : undefined}
      contentContainerStyle={layout === 'stack' ? { gap: stackedBlockGap } : undefined}
      scrollEnabled={maxHeight === 'viewport'}
      style={maxHeight === 'viewport' ? { maxHeight: viewport.height - 2 * t.layoutGapSection } : undefined}
      onScroll={(event) => setHeaderScrolled(event.nativeEvent.contentOffset.y > 0)}
      scrollEventThrottle={16}
      accessibilityRole="list"
      accessibilityLabel={caption}
      accessibilityHint={COPY.rowCount(data.length)}
      accessibilityState={{ busy: loading }}
    />
  );

  const handleLayout = (event: LayoutChangeEvent): void => {
    setMeasuredWidth(event.nativeEvent.layout.width);
  };

  return (
    <View ref={ref} testID="Table" onLayout={handleLayout} style={{ backgroundColor: t.colorBackground }}>
      <View testID="Table.caption" style={hideCaption ? HIDDEN_STYLE : undefined}>
        <Heading
          level={captionLevel}
          size="md"
          overrides={{
            fontSize: overrides?.captionSize ?? CAPTION_SIZE,
            fontWeight: overrides?.captionWeight ?? CAPTION_WEIGHT,
            marginBlockEnd: overrides?.captionGap ?? CAPTION_GAP,
          }}
        >
          {caption}
        </Heading>
      </View>
      <View testID="Table.container">
        {layout === 'scroll' ? (
          <View>
            <Animated.ScrollView
              testID="Table.scrollRegion"
              horizontal
              accessibilityLabel={caption}
              accessibilityHint={COPY.scrollHint}
              onLayout={(event: LayoutChangeEvent) => {
                scrollMetrics.current.viewport = event.nativeEvent.layout.width;
                updateFadeEdges();
              }}
              onContentSizeChange={(contentWidth: number) => {
                scrollMetrics.current.content = contentWidth;
                updateFadeEdges();
              }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: false,
                listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
                  scrollMetrics.current.offset = event.nativeEvent.contentOffset.x;
                  updateFadeEdges();
                },
              })}
              scrollEventThrottle={16} // literal-ok: one frame between pin and fade updates
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={{ flexGrow: 1 }}>{list}</View>
            </Animated.ScrollView>
            {fadeEdges.start ? <ScrollFade edge="start" inset={pinnedEnd} length={scrollFade} color={t.colorBackground} /> : null}
            {fadeEdges.end ? <ScrollFade edge="end" inset={0} length={scrollFade} color={t.colorBackground} /> : null}
          </View>
        ) : (
          list
        )}
      </View>
      {loading && rows.length > 0 ? (
        <View accessibilityLiveRegion="polite" style={cellStyle}>
          <Text size="sm" tone="muted" overrides={bodyText}>
            {COPY.loading}
          </Text>
        </View>
      ) : null}
      {footer !== undefined && footer !== null ? (
        <View testID="Table.footer" style={cellStyle}>
          {typeof footer === 'string' ? (
            <Text size="sm" overrides={bodyText}>
              {footer}
            </Text>
          ) : (
            footer
          )}
        </View>
      ) : null}
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text size="sm">{sortAnnouncement}</Text>
      </View>
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text size="sm">{selectionAnnouncement}</Text>
      </View>
    </View>
  );
}
