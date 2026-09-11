import * as React from 'react';
import { AccessibilityInfo, FlatList, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import type { ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, ViewStyle } from 'react-native';
import { resolveToken } from '@design-schema/tokens';
import type { TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Text } from './Text';
import { Toolbar } from './Toolbar';
import { useTheme } from './theme';

export type TableColumnAlign = 'start' | 'end' | 'center';
export type TableColumnWidth = 'auto' | 'min' | 'fill';
export type TableHideBelow = 'prose' | 'content';
export type TableSortDirection = 'ascending' | 'descending';
export type TableSelectable = 'none' | 'single' | 'multiple';
export type TableResponsive = 'stack' | 'scroll';
export type TableMaxHeight = 'none' | 'viewport';
export type TableDensity = 'compact' | 'comfortable';
export type TableCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;

/** A single record. `id` must be stable; it is what selection and keys use. */
export interface TableRow {
  id: string;
  [key: string]: unknown;
}

/** One column definition, in display order. */
export interface TableColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: TableColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: TableColumnWidth | undefined;
  isRowHeader?: boolean | undefined;
  hideBelow?: TableHideBelow | undefined;
  render?: ((row: TableRow) => React.ReactNode) | undefined;
}

/** Sort state: which column, and which way. */
export interface TableSort {
  column: string;
  direction: TableSortDirection;
}

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
  | 'rowSelectedBorderWidth'
  | 'cellPaddingInline'
  | 'cellPaddingInlineCompact'
  | 'cellPaddingBlock'
  | 'cellGap'
  | 'captionSize'
  | 'captionWeight'
  | 'captionGap'
  | 'stackedRowInset'
  | 'stackedRowGap'
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
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /** Visually hides the caption; it remains the accessible name. Use when a Heading directly above already says it. */
  hideCaption?: boolean | undefined;
  /** Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font. */
  footer?: React.ReactNode;
  /** Column definitions in display order. Exactly one column may be `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  sort?: TableSort | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  defaultSort?: TableSort | undefined;
  /** Adds a selection column: a Checkbox per row (radio-like for `single`), plus select-all for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below the prose width: `stack` repeats the column header as a label before each value; `scroll` keeps every column and scrolls horizontally. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: compact or comfortable. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: existing rows stay visible, `copy.loading` is shown when there is nothing yet. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell for each row. */
  rowActions?: ((row: TableRow) => React.ReactNode) | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: ((sort: TableSort) => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated (its row-header cell), with its id. */
  onRowPress?: ((id: string) => void) | undefined;
}

const COPY = {
  sortAscending: (column: string): string => `Sort by ${column}, ascending`,
  sortDescending: (column: string): string => `Sort by ${column}, descending`,
  sortedAnnouncement: (column: string, direction: TableSortDirection): string => `Sorted by ${column}, ${direction}`,
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedCount: (count: number, total: number): string => `${count} of ${total} selected`,
  actions: 'Actions',
  empty: 'Nothing to show.',
  loading: 'Loading',
  scrollHint: 'Scroll sideways to see more columns',
  rowCount: (count: number): string => `${count} rows`,
} as const;

/** Visually clips content to 1x1 while keeping it in the accessibility tree, for live-region announcements. */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

function cellValue(row: TableRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareRows(a: TableRow, b: TableRow, column: string, direction: TableSortDirection): number {
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

/**
 * Table — the honest way to show records that share fields: every row the same
 * shape, every column a comparable thing.
 *
 * When to use: Use a Table for a list of records with three or more comparable
 * fields. Use `responsive: stack` (the default) when each row is a thing a person
 * reads, and `scroll` when the columns are what matters. Do not use it for layout,
 * for one or two fields, or for cell-level editing/arrow navigation — that is
 * DataGrid.
 *
 * There is no table element on native. Below `layout.maxWidth.prose` (treated here
 * as "phone") the table always renders as a virtualised `FlatList` of accessible,
 * card-like blocks — one per row — whose `accessibilityLabel` joins "{header}:
 * {value}" for every visible column, row header first; the selection `Checkbox` and
 * `rowActions` are separate accessibility stops inside the block. Sortable columns
 * render as a `Toolbar` of `Button`s above the list instead of a header row, since
 * there is no room for one. At or above that width (tablets, react-native-web) the
 * table renders a header row plus fixed-width column cells; `stickyHeader` uses
 * `stickyHeaderIndices`, and the header grows `headerShadow` once the body has
 * scrolled beneath it. `responsive: scroll` at that width wraps the table in a
 * horizontal `ScrollView`; the row-header cells grow `stickyColumnShadow` once the
 * region has scrolled horizontally (an approximation of a sticky column: RN has no
 * position-sticky and the package permits no gesture-handler/reanimated dependency
 * for a synced second list, so the whole table scrolls together rather than pinning
 * the row-header column in place). `responsive` has no effect at true phone widths;
 * phones are always stacked (a `__DEV__` warning notes this for `scroll`).
 *
 * Sorting: with a controlled `sort` prop the caller owns ordering (server-side
 * sorting works the same way); otherwise the table sorts `data` itself from
 * `defaultSort` with `localeCompare`/numeric comparison. Selection is row identity:
 * `single` behaves like a set of radios (selecting one clears any other, and
 * re-selecting the same row clears it); `multiple` adds a select-all control
 * (indeterminate when some rows are selected). Both post their new state to a
 * visually-hidden, accessible live region (`copy.sortedAnnouncement` /
 * `copy.selectedCount`), plus `AccessibilityInfo.announceForAccessibility` on iOS.
 */
export function Table({
  caption,
  captionLevel = '2',
  hideCaption = false,
  footer,
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
}: TableProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const { width, height } = useWindowDimensions();
  const isCompact = width < t.layoutMaxWidthProse;

  const [internalSort, setInternalSort] = React.useState<TableSort | undefined>(defaultSort);
  const activeSort = sort ?? internalSort;

  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [columnScrolled, setColumnScrolled] = React.useState(false);
  const [sortAnnouncement, setSortAnnouncement] = React.useState('');
  const [selectionAnnouncement, setSelectionAnnouncement] = React.useState('');

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

  const isFirstSelection = React.useRef(true);
  React.useEffect(() => {
    if (isFirstSelection.current) {
      isFirstSelection.current = false;
      return;
    }
    if (selectable === 'none') {
      return;
    }
    const message = COPY.selectedCount(selectedIds.length, data.length);
    setSelectionAnnouncement(message);
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.length]);

  React.useEffect(() => {
    if (__DEV__ && isCompact && responsive === 'scroll') {
      console.warn(
        'Table: `responsive="scroll"` has no effect at phone widths — there is no room for columns, so the table always renders the stacked form there.',
      );
    }
  }, [isCompact, responsive]);

  const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;

  const visibleColumns = React.useMemo(
    () =>
      columns.filter((column) => {
        if (column.hideBelow === 'prose') {
          return width >= t.layoutMaxWidthProse;
        }
        if (column.hideBelow === 'content') {
          return width >= t.layoutMaxWidthContent;
        }
        return true;
      }),
    [columns, width, t.layoutMaxWidthProse, t.layoutMaxWidthContent],
  );

  const orderedColumns = React.useMemo(
    () => (rowHeaderColumn ? [rowHeaderColumn, ...visibleColumns.filter((c) => c !== rowHeaderColumn)] : visibleColumns),
    [rowHeaderColumn, visibleColumns],
  );

  const sortedData = React.useMemo(() => {
    if (sort !== undefined || internalSort === undefined) {
      return data;
    }
    return [...data].sort((a, b) => compareRows(a, b, internalSort.column, internalSort.direction));
  }, [data, sort, internalSort]);

  const commitSort = (next: TableSort): void => {
    if (sort === undefined) {
      setInternalSort(next);
    }
    onSortChange?.(next);
  };

  const handleSortPress = (columnKey: string): void => {
    const next: TableSort =
      activeSort?.column === columnKey
        ? { column: columnKey, direction: activeSort.direction === 'ascending' ? 'descending' : 'ascending' }
        : { column: columnKey, direction: 'ascending' };
    commitSort(next);
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
      const next = new Set(selectedSet);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      commitSelection(Array.from(next));
    }
  };

  const allIds = sortedData.map((row) => row.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => {
    commitSelection(allSelected ? [] : allIds);
  };

  const rowName = (row: TableRow): string => (rowHeaderColumn ? cellValue(row, rowHeaderColumn.key) || row.id : row.id);

  // Tokens
  const cellPaddingInline = density === 'compact'
    ? overrides?.cellPaddingInlineCompact
      ? (resolveToken(t, overrides.cellPaddingInlineCompact) as number)
      : t.layoutInsetSm
    : overrides?.cellPaddingInline
      ? (resolveToken(t, overrides.cellPaddingInline) as number)
      : t.layoutInsetMd;
  const cellPaddingBlock = overrides?.cellPaddingBlock ? (resolveToken(t, overrides.cellPaddingBlock) as number) : t.spaceSm;
  const cellGap = overrides?.cellGap ? (resolveToken(t, overrides.cellGap) as number) : t.layoutGapTight;
  const headerBorderColor = overrides?.headerBorder ? (resolveToken(t, overrides.headerBorder) as string) : t.colorBorderStrong;
  const headerBorderWidth = overrides?.headerBorderWidth ? (resolveToken(t, overrides.headerBorderWidth) as number) : t.borderWidthThin;
  const headerShadow = overrides?.headerShadow ? (resolveToken(t, overrides.headerShadow) as typeof t.shadowRaised) : t.shadowRaised;
  const rowBorderColor = overrides?.rowBorder ? (resolveToken(t, overrides.rowBorder) as string) : t.colorBorder;
  const rowBorderWidth = overrides?.rowBorderWidth ? (resolveToken(t, overrides.rowBorderWidth) as number) : t.borderWidthThin;
  const rowHover = overrides?.rowHover ? (resolveToken(t, overrides.rowHover) as string) : t.colorActionGhostBackgroundHover;
  const rowSelectedBorderWidth = overrides?.rowSelectedBorderWidth
    ? (resolveToken(t, overrides.rowSelectedBorderWidth) as number)
    : t.borderWidthFocus;
  const stackedRowInset = overrides?.stackedRowInset ? (resolveToken(t, overrides.stackedRowInset) as number) : t.layoutInsetMd;
  const stackedRowGap = overrides?.stackedRowGap ? (resolveToken(t, overrides.stackedRowGap) as number) : t.layoutGapTight;
  const stackedRowRadius = overrides?.stackedRowRadius ? (resolveToken(t, overrides.stackedRowRadius) as number) : t.radiusMd;
  const stickyColumnShadow = overrides?.stickyColumnShadow
    ? (resolveToken(t, overrides.stickyColumnShadow) as typeof t.shadowRaised)
    : t.shadowRaised;
  const scrollFade = overrides?.scrollFade ? (resolveToken(t, overrides.scrollFade) as number) : t.space6;

  const typographyOverrides = { fontFamily: overrides?.fontFamily, lineHeight: overrides?.lineHeight };
  const headerTypographyOverrides = {
    ...typographyOverrides,
    fontWeight: overrides?.headerWeight,
    fontSize: overrides?.headerSize,
  };
  const cellTypographyOverrides = (align: TableColumnAlign | undefined) => ({
    ...typographyOverrides,
    fontFamily: align === 'end' ? (overrides?.numericFont ?? ('font.family.mono' as TokenRef)) : overrides?.fontFamily,
    fontSize: overrides?.fontSize,
  });

  const viewportMaxHeight = maxHeight === 'viewport' ? Math.max(0, height - t.layoutSectionMd) : undefined;

  const showEmpty = sortedData.length === 0;
  const emptyText = loading ? COPY.loading : (emptyMessage ?? COPY.empty);

  const columnStyle = (column: TableColumn): ViewStyle =>
    column.width === 'fill' ? { flex: 1, flexShrink: 1 } : { flexGrow: 0, flexShrink: 0, width: t.space20 };

  const cellStyle: ViewStyle = {
    paddingHorizontal: cellPaddingInline,
    paddingVertical: cellPaddingBlock,
    justifyContent: 'center',
  };

  const selectCellStyle: ViewStyle = {
    width: t.sizeTargetComfortable,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cellPaddingBlock,
  };

  const footerStyle: ViewStyle = {
    paddingHorizontal: cellPaddingInline,
    paddingVertical: cellPaddingBlock,
  };

  const actionsCellStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: cellGap,
    paddingHorizontal: cellPaddingInline,
    paddingVertical: cellPaddingBlock,
  };

  function renderCellText(row: TableRow, column: TableColumn): React.ReactNode {
    if (column.render) {
      return column.render(row);
    }
    return (
      <Text size="sm" align={column.align ?? 'start'} truncate overrides={cellTypographyOverrides(column.align)}>
        {cellValue(row, column.key)}
      </Text>
    );
  }

  // ---- Wide (tablet / react-native-web) layout: header row + fixed-width cells ----

  const handleHeaderScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    setHeaderScrolled(event.nativeEvent.contentOffset.y > 0);
  };
  const handleColumnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    setColumnScrolled(event.nativeEvent.contentOffset.x > 0);
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: t.colorBackgroundSubtle,
    borderBottomWidth: headerBorderWidth,
    borderBottomColor: headerBorderColor,
    ...(stickyHeader && headerScrolled ? headerShadow : null),
  };

  const renderWideHeader = (): React.JSX.Element => (
    <View style={headerRowStyle} testID="Table.headerRow">
      {selectable === 'multiple' ? (
        <View style={selectCellStyle} testID="Table.selectAllCell">
          <Checkbox label={COPY.selectAll} name="table-select-all" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
        </View>
      ) : selectable === 'single' ? (
        <View style={selectCellStyle} />
      ) : null}
      {visibleColumns.map((column) => {
        const active = activeSort?.column === column.key;
        return (
          <View key={column.key} style={[cellStyle, columnStyle(column)]} accessibilityRole="header" testID="Table.columnHeader">
            {column.sortable ? (
              <>
                <Button
                  label={column.header}
                  variant="ghost"
                  size="sm"
                  trailingIcon={active ? <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorForeground} /> : undefined}
                  overrides={{
                    fontWeight: overrides?.headerWeight ?? ('font.weight.semibold' as TokenRef),
                    fontSize: overrides?.headerSize,
                    iconGap: overrides?.cellGap,
                  }}
                  onPress={() => handleSortPress(column.key)}
                />
                {active ? (
                  <View style={HIDDEN_STYLE}>
                    <Text>{activeSort.direction === 'ascending' ? COPY.sortAscending(column.header) : COPY.sortDescending(column.header)}</Text>
                  </View>
                ) : null}
              </>
            ) : (
              <Text size="sm" weight="semibold" truncate overrides={headerTypographyOverrides}>
                {column.header}
              </Text>
            )}
          </View>
        );
      })}
      {rowActions ? (
        <View style={[cellStyle, actionsCellStyle]} accessibilityRole="header" testID="Table.columnHeader">
          <View style={HIDDEN_STYLE}>
            <Text>{COPY.actions}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderWideRow = ({ item: row, index }: ListRenderItemInfo<TableRow>): React.JSX.Element => {
    const isSelected = selectable !== 'none' && selectedSet.has(row.id);
    const isStriped = striped && index % 2 === 1;
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderBottomWidth: rowBorderWidth,
      borderBottomColor: rowBorderColor,
      backgroundColor: isSelected || isStriped ? t.colorBackgroundSubtle : t.colorBackground,
      borderLeftWidth: isSelected ? rowSelectedBorderWidth : 0,
      borderLeftColor: isSelected ? t.colorControlSelectedBackground : 'transparent',
    };

    return (
      <View style={rowStyle} accessibilityState={selectable !== 'none' ? { selected: isSelected } : undefined} testID="Table.row">
        {selectable !== 'none' ? (
          <View style={selectCellStyle} testID="Table.selectCell">
            <Checkbox label={COPY.selectRow(rowName(row))} name={`table-row-${row.id}`} checked={isSelected} onChange={() => toggleRow(row.id)} />
          </View>
        ) : null}
        {visibleColumns.map((column) => {
          const isHeaderCell = column.isRowHeader === true;
          if (isHeaderCell && onRowPress) {
            return (
              <Pressable
                key={column.key}
                style={({ pressed }) => [cellStyle, columnStyle(column), { backgroundColor: pressed ? rowHover : 'transparent' }]}
                accessibilityRole="button"
                accessibilityLabel={rowName(row)}
                onPress={() => onRowPress(row.id)}
                testID="Table.rowHeader"
              >
                {renderCellText(row, column)}
              </Pressable>
            );
          }
          return (
            <View key={column.key} style={[cellStyle, columnStyle(column), isHeaderCell && columnScrolled && responsive === 'scroll' ? stickyColumnShadow : null]} testID={isHeaderCell ? 'Table.rowHeader' : 'Table.cell'}>
              {renderCellText(row, column)}
            </View>
          );
        })}
        {rowActions ? (
          <View style={[cellStyle, actionsCellStyle]} testID="Table.cell">
            {rowActions(row)}
          </View>
        ) : null}
      </View>
    );
  };

  const wideList = (
    <FlatList
      data={sortedData}
      keyExtractor={(row) => row.id}
      renderItem={renderWideRow}
      ListHeaderComponent={renderWideHeader}
      stickyHeaderIndices={stickyHeader ? [0] : undefined}
      onScroll={handleHeaderScroll}
      scrollEventThrottle={16}
      scrollEnabled={maxHeight === 'viewport'}
      style={{ maxHeight: viewportMaxHeight }}
      accessibilityRole="list"
      accessibilityLabel={caption}
      accessibilityHint={COPY.rowCount(data.length)}
      accessibilityState={{ busy: loading }}
      ListEmptyComponent={
        <View style={cellStyle} accessible accessibilityLabel={emptyText} testID="Table.emptyState">
          <Text tone="muted">{emptyText}</Text>
        </View>
      }
      testID="Table.table"
    />
  );

  const wideBody =
    responsive === 'scroll' ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        onScroll={handleColumnScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: scrollFade, minWidth: orderedColumns.length * t.space20 + (selectable !== 'none' ? t.sizeTargetComfortable : 0) }}
        accessibilityLabel={caption}
        accessibilityHint={COPY.scrollHint}
        testID="Table.scrollRegion"
      >
        <View style={{ flex: 1 }}>{wideList}</View>
      </ScrollView>
    ) : (
      wideList
    );

  // ---- Compact (phone) layout: stacked FlatList of accessible blocks ----

  const sortableColumns = visibleColumns.filter((column) => column.sortable === true);

  const stackedRowStyle: ViewStyle = {
    marginBottom: stackedRowGap,
    borderRadius: stackedRowRadius,
    padding: stackedRowInset,
  };

  const stackedPairStyle: ViewStyle = { marginBottom: stackedRowGap };

  const renderStackedRow = ({ item: row, index }: ListRenderItemInfo<TableRow>): React.JSX.Element => {
    const isSelected = selectable !== 'none' && selectedSet.has(row.id);
    const isStriped = striped && index % 2 === 1;
    const blockStyle: ViewStyle = {
      ...stackedRowStyle,
      backgroundColor: isSelected || isStriped ? t.colorBackgroundSubtle : t.colorBackground,
      borderLeftWidth: isSelected ? rowSelectedBorderWidth : 0,
      borderLeftColor: isSelected ? t.colorControlSelectedBackground : 'transparent',
    };
    const summaryLabel = orderedColumns.map((column) => `${column.header}: ${cellValue(row, column.key)}`).join('. ');

    const pairs = (
      <View accessibilityElementsHidden importantForAccessibility="no">
        {orderedColumns.map((column) => (
          <View key={column.key} style={stackedPairStyle}>
            <View testID="Table.stackedLabel">
              <Text size="xs" weight="medium" tone="muted" overrides={{ ...typographyOverrides, fontSize: overrides?.stackedLabelSize, fontWeight: overrides?.stackedLabelWeight }}>
                {column.header}
              </Text>
            </View>
            {renderCellText(row, column)}
          </View>
        ))}
      </View>
    );

    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} testID="Table.row">
        {selectable !== 'none' ? (
          <View style={selectCellStyle} testID="Table.selectCell">
            <Checkbox label={COPY.selectRow(rowName(row))} name={`table-row-${row.id}`} checked={isSelected} onChange={() => toggleRow(row.id)} />
          </View>
        ) : null}
        {onRowPress ? (
          <Pressable
            style={[blockStyle, { flex: 1 }]}
            accessibilityRole="button"
            accessibilityLabel={summaryLabel}
            accessibilityState={{ selected: selectable !== 'none' ? isSelected : undefined }}
            onPress={() => onRowPress(row.id)}
          >
            {pairs}
          </Pressable>
        ) : (
          <View style={[blockStyle, { flex: 1 }]} accessible accessibilityLabel={summaryLabel} accessibilityState={{ selected: selectable !== 'none' ? isSelected : undefined }}>
            {pairs}
          </View>
        )}
        {rowActions ? (
          <View style={actionsCellStyle} testID="Table.cell">
            {rowActions(row)}
          </View>
        ) : null}
      </View>
    );
  };

  const compactHeader = (
    <View testID="Table.header">
      {selectable === 'multiple' ? (
        <View style={{ paddingHorizontal: cellPaddingInline, paddingBottom: cellPaddingBlock }} testID="Table.selectAllCell">
          <Checkbox label={COPY.selectAll} name="table-select-all" checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
        </View>
      ) : null}
      {sortableColumns.length > 0 ? (
        <Toolbar label={`Sort ${caption}`} density={density}>
          {sortableColumns.map((column) => {
            const active = activeSort?.column === column.key;
            return (
              <Button
                key={column.key}
                label={column.header}
                variant="ghost"
                size="sm"
                trailingIcon={active ? <Icon name={activeSort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorForeground} /> : undefined}
                onPress={() => handleSortPress(column.key)}
              />
            );
          })}
        </Toolbar>
      ) : null}
    </View>
  );

  const compactList = (
    <FlatList
      data={sortedData}
      keyExtractor={(row) => row.id}
      renderItem={renderStackedRow}
      ListHeaderComponent={compactHeader}
      scrollEnabled={maxHeight === 'viewport'}
      style={{ maxHeight: viewportMaxHeight }}
      accessibilityRole="list"
      accessibilityLabel={caption}
      accessibilityHint={COPY.rowCount(data.length)}
      accessibilityState={{ busy: loading }}
      ListEmptyComponent={
        <View accessible accessibilityLabel={emptyText} style={{ padding: stackedRowInset }} testID="Table.emptyState">
          <Text tone="muted">{emptyText}</Text>
        </View>
      }
      testID="Table.table"
    />
  );

  return (
    <View testID="Table">
      {!hideCaption ? (
        <View testID="Table.caption">
          <Heading level={captionLevel} overrides={{ fontSize: overrides?.captionSize, fontWeight: overrides?.captionWeight, marginBlockEnd: overrides?.captionGap ?? ('space.2' as TokenRef) }}>
            {caption}
          </Heading>
        </View>
      ) : null}
      <View testID="Table.container">
        {loading && !showEmpty ? (
          <View accessibilityLiveRegion="polite">
            <Text size="sm" tone="muted">
              {COPY.loading}
            </Text>
          </View>
        ) : null}
        {isCompact ? compactList : wideBody}
      </View>
      {footer !== undefined ? (
        <View style={footerStyle} testID="Table.footer">
          {footer}
        </View>
      ) : null}
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text>{sortAnnouncement}</Text>
      </View>
      <View accessibilityLiveRegion="polite" style={HIDDEN_STYLE}>
        <Text>{selectionAnnouncement}</Text>
      </View>
    </View>
  );
}
