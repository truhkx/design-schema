import * as React from 'react';
import { AccessibilityInfo, Animated, FlatList, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import type {
  AccessibilityActionEvent,
  ListRenderItemInfo,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
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
import type { DataGridCellSelection, DataGridColumn, DataGridSort, DataGridSortDirection } from './DataGrid';
import { toEasing, toLineHeight, useReducedMotion, useTheme } from './theme';

export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';
export type TreeGridSortDirection = DataGridSortDirection;
export type TreeGridSort = DataGridSort;
export type TreeGridCellSelection = DataGridCellSelection;
export type TreeGridSelection = string[] | TreeGridCellSelection;

/** A nested record. `children: "lazy"` marks a row whose children load on first expand, through `onExpand`. */
export interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | 'lazy';
  [key: string]: unknown;
}

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
  hideCaption?: boolean;
  /** Column definitions. Exactly one column may be `isRowHeader`; it carries the indent and the expand button. */
  columns: DataGridColumn[];
  /** Nested rows. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. */
  expanded?: string[];
  /** Initially expanded ids. `["*"]` expands every loaded row. */
  defaultExpanded?: string[];
  /** Sort applies within each level; siblings are ordered, hierarchy is kept. Fully caller-controlled — the caller re-sorts `data`. */
  sort?: TreeGridSort;
  /** `row` adds a checkbox column and toggles rows; `cell` selects one cell. */
  selectable?: TreeGridSelectable;
  /** Selecting a parent row selects its (loaded) descendants; the parent shows indeterminate when only some are selected. */
  selectChildren?: boolean;
  /** Master switch: cells whose column is `editable` can be edited by tapping them. */
  editable?: boolean;
  /** Row height: compact suits the grid's purpose; comfortable for touch. */
  density?: TreeGridDensity;
  /** `viewport` fills the height available under the header; `content` grows with rows; `fixed` uses a fixed height. */
  height?: TreeGridHeight;
  /** Data is being fetched: existing rows stay, `copy.loading` shows in the status bar. */
  loading?: boolean;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef>>;
  /** Fired with the new array of expanded ids. */
  onExpandChange?: (expanded: string[]) => void;
  /** Fired when a `children: "lazy"` row is expanded for the first time, with its id; the caller loads and replaces `children`. */
  onExpand?: (rowId: string) => void;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: (sort: TreeGridSort) => void;
  /** Fired with the new selection: row ids, or one cell. */
  onSelectionChange?: (selection: TreeGridSelection) => void;
  /** Fired when an edit commits, with the new and previous value. The caller updates `data`. */
  onCellChange?: (change: TreeGridCellChange) => void;
}

/**
 * `copy.*` from the component schema, used verbatim. The `select*` and status-bar
 * strings below them are not part of the schema (TreeGrid, unlike DataGrid, defines
 * no copy for selection or status text) and were authored to match DataGrid's own
 * phrasing; see the generation gap notes.
 */
const COPY = {
  expand: (rowName: string): string => `Expand ${rowName}`,
  collapse: (rowName: string): string => `Collapse ${rowName}`,
  level: (level: number): string => `Level ${level}`,
  childCount: (count: number): string => `${count} items`,
  loading: 'Loading',
  expandAll: 'Expand all',
  collapseAll: 'Collapse all',
  selectAll: 'Select all rows',
  selectRow: (rowName: string): string => `Select ${rowName}`,
  selectedRows: (count: number, total: number): string => `${count} of ${total} rows selected`,
  editing: (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`,
  rowCount: (count: number): string => `${count} rows`,
  empty: 'Nothing to show.',
  scrollHint: 'Scroll sideways to see more columns',
} as const;

/** Visually clips content to 1x1 while keeping it in the accessibility tree, for live-region announcements. */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

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

/** Sorts siblings within each level, recursively, keeping the hierarchy intact. */
function sortTree(rows: TreeGridRow[], sort: TreeGridSort | undefined): TreeGridRow[] {
  if (sort === undefined) {
    return rows;
  }
  const sorted = [...rows].sort((a, b) => compareRows(a, b, sort.column, sort.direction));
  return sorted.map((row) => (row.children !== undefined && row.children !== 'lazy' ? { ...row, children: sortTree(row.children, sort) } : row));
}

function collectAllIds(rows: TreeGridRow[]): string[] {
  const ids: string[] = [];
  for (const row of rows) {
    ids.push(row.id);
    if (row.children !== undefined && row.children !== 'lazy') {
      ids.push(...collectAllIds(row.children));
    }
  }
  return ids;
}

function collectLoadedDescendantIds(row: TreeGridRow): string[] {
  if (row.children === undefined || row.children === 'lazy') {
    return [];
  }
  const ids: string[] = [];
  for (const child of row.children) {
    ids.push(child.id);
    ids.push(...collectLoadedDescendantIds(child));
  }
  return ids;
}

interface TreeGridVisibleRow {
  key: string;
  row: TreeGridRow;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  placeholder: boolean;
}

/** Flattens the tree into the visible-row list: what gets rendered, virtualized and counted. Collapsed descendants are not rendered at all. */
function flattenTree(rows: TreeGridRow[], expandedSet: Set<string>, level: number): TreeGridVisibleRow[] {
  const result: TreeGridVisibleRow[] = [];
  for (const row of rows) {
    const hasChildren = row.children !== undefined && (row.children === 'lazy' || row.children.length > 0);
    const isExpanded = hasChildren && expandedSet.has(row.id);
    result.push({ key: row.id, row, level, hasChildren, isExpanded, placeholder: false });
    if (isExpanded) {
      if (row.children === 'lazy') {
        result.push({ key: `${row.id}::loading`, row: { id: `${row.id}::loading` }, level: level + 1, hasChildren: false, isExpanded: false, placeholder: true });
      } else if (row.children !== undefined) {
        result.push(...flattenTree(row.children, expandedSet, level + 1));
      }
    }
  }
  return result;
}

interface TreeGridExpandButtonProps {
  expanded: boolean;
  label: string;
  transitionDuration: number;
  color: string;
  onPress: () => void;
}

/** The expand/collapse control for a row header. Its own component so the chevron rotation can hold an `Animated.Value` per row. */
function TreeGridExpandButton({ expanded, label, transitionDuration, color, onPress }: TreeGridExpandButtonProps): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    if (reducedMotion) {
      rotation.setValue(toValue);
      return;
    }
    Animated.timing(rotation, {
      toValue,
      duration: transitionDuration,
      easing: toEasing(t.motionEasingStandard),
      useNativeDriver: false,
    }).start();
  }, [expanded, reducedMotion, rotation, transitionDuration, t.motionEasingStandard]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

  return (
    <Button
      label={label}
      variant="ghost"
      size="sm"
      iconOnly
      leadingIcon={
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Icon name="chevron-right" inline color={color} />
        </Animated.View>
      }
      onPress={onPress}
    />
  );
}

/**
 * TreeGrid — a DataGrid whose rows nest. The hierarchy lives in the row-header
 * column (indent, a chevron, a level announced to assistive technology); every
 * other concern — columns, cell navigation, editors, selection, virtualization —
 * matches DataGrid. Collapsing a parent removes its descendants from the visible
 * list, which is also the virtualized `FlatList` list, so deep or wide trees stay
 * cheap until opened.
 *
 * When to use: records that nest and carry several comparable fields per record —
 * a chart of accounts, folders and files, a bill of materials. Use `children:
 * "lazy"` on a row to defer loading its children until first expand. Use
 * `selectChildren` when selecting a row means "this and everything in it".
 *
 * There is no `treegrid` element on native. Renders a caption (`Heading`, or
 * hidden when `hideCaption` — the horizontal `ScrollView` region keeps
 * `accessibilityLabel={caption}` regardless, so the accessible name survives),
 * then that `ScrollView` around a `FlatList` (`role="grid"`) over the
 * flattened visible rows, with a fixed `getItemLayout` from `density`'s row-height
 * token. Each row header `Pressable` carries `accessibilityState={{ expanded }}`
 * when it has children, an `accessibilityLabel` combining `copy.level` and
 * `copy.childCount`, and its own `expand`/`collapse` `accessibilityActions` —
 * the visible expand `Button` (chevron rotated over `transition`, skipped under
 * reduced motion) is a real touch target since there are no hardware arrow keys.
 * Indent is padding reserved per level; a vertical guide line is drawn for every
 * open ancestor, aligned with that ancestor's expand button, so deep trees stay
 * legible. A `"lazy"` row shows one placeholder child row in `copy.loading` (and
 * fires `onExpand`) until the caller replaces its `children`.
 *
 * Sorting (`sort`) is fully caller-controlled — there is no uncontrolled default —
 * and is applied recursively within each level so the hierarchy survives.
 * `selectable="row"` adds a `Checkbox` select column; with `selectChildren` it
 * cascades to loaded descendants and shows indeterminate on a partly-selected
 * parent. `"cell"` tracks one active cell. Editing (`text`/`number`/`date` via an
 * inline `TextInput`, `checkbox` live, `select` through a `BottomSheet` +
 * `Listbox`) matches DataGrid. The status bar doubles as the polite live region
 * for loading, editing and selection state; sort changes get their own hidden
 * live region.
 */
export function TreeGrid({
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
  overrides,
  onExpandChange,
  onExpand,
  onSortChange,
  onSelectionChange,
  onCellChange,
}: TreeGridProps): React.JSX.Element {
  const { tokens: t } = useTheme();

  // ---- tokens ----

  const indentValue = overrides?.indent ? (resolveToken(t, overrides.indent) as number) : t.space5;
  const expandButtonSizeValue = overrides?.expandButtonSize ? (resolveToken(t, overrides.expandButtonSize) as number) : t.sizeTargetMin;
  const expandGapValue = overrides?.expandGap ? (resolveToken(t, overrides.expandGap) as number) : t.layoutGapTight;
  const guideLineColor = overrides?.guideLine ? (resolveToken(t, overrides.guideLine) as string) : t.colorBorder;
  const guideLineWidthValue = overrides?.guideLineWidth ? (resolveToken(t, overrides.guideLineWidth) as number) : t.borderWidthThin;
  const parentWeightRef: TokenRef = overrides?.parentWeight ?? ('font.weight.medium' as TokenRef);
  const transitionDuration = overrides?.transition ? (resolveToken(t, overrides.transition) as number) : t.motionDurationFast;

  const activeRowHeight = density === 'compact' ? t.sizeTargetMin : t.sizeTargetComfortable;
  const fixedHeightValue = t.space20;

  // ---- expansion ----

  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(() =>
    defaultExpanded?.includes('*') ? collectAllIds(data) : (defaultExpanded ?? []),
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
    const isExpandedNow = expandedSet.has(row.id);
    const next = isExpandedNow ? expandedIds.filter((id) => id !== row.id) : [...expandedIds, row.id];
    commitExpanded(next);
    if (!isExpandedNow && row.children === 'lazy') {
      onExpand?.(row.id);
    }
  };

  const allRowIds = React.useMemo(() => collectAllIds(data), [data]);
  const expandAll = (): void => commitExpanded(allRowIds);
  const collapseAll = (): void => commitExpanded([]);

  const handleRootAccessibilityAction = (event: AccessibilityActionEvent): void => {
    if (event.nativeEvent.actionName === 'expandAll') {
      expandAll();
    } else if (event.nativeEvent.actionName === 'collapseAll') {
      collapseAll();
    }
  };

  // ---- sort ----

  React.useEffect(() => {
    if (__DEV__ && columns.some((c) => c.resizable === true)) {
      // eslint-disable-next-line no-console
      console.warn('TreeGrid: `column.resizable` has no drag-resize implementation on React Native — the schema defines no `onColumnResize` event for this component — so columns render at a fixed width.');
    }
  }, [columns]);

  const [sortAnnouncement, setSortAnnouncement] = React.useState('');
  const isFirstSort = React.useRef(true);
  React.useEffect(() => {
    if (isFirstSort.current) {
      isFirstSort.current = false;
      return;
    }
    if (sort === undefined) {
      return;
    }
    const column = columns.find((c) => c.key === sort.column);
    const message = `Sorted by ${column?.header ?? sort.column}, ${sort.direction}`;
    setSortAnnouncement(message);
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort?.column, sort?.direction]);

  const handleSort = (columnKey: string): void => {
    const next: TreeGridSort =
      sort?.column === columnKey ? { column: columnKey, direction: sort.direction === 'ascending' ? 'descending' : 'ascending' } : { column: columnKey, direction: 'ascending' };
    onSortChange?.(next);
  };

  const sortedData = React.useMemo(() => sortTree(data, sort), [data, sort]);
  const visibleRows = React.useMemo(() => flattenTree(sortedData, expandedSet, 1), [sortedData, expandedSet]);
  const rowById = React.useMemo(() => new Map(visibleRows.filter((v) => !v.placeholder).map((v) => [v.row.id, v.row] as const)), [visibleRows]);

  // ---- columns ----

  const rowHeaderColumn = columns.find((c) => c.isRowHeader === true) ?? null;
  const orderedColumns = React.useMemo(() => {
    const pinnedStart = columns.filter((c) => c.pinned === 'start');
    const pinnedEnd = columns.filter((c) => c.pinned === 'end');
    const middle = columns.filter((c) => c.pinned !== 'start' && c.pinned !== 'end');
    return [...pinnedStart, ...middle, ...pinnedEnd];
  }, [columns]);

  const widthFor = (column: DataGridColumn): number => column.width ?? column.minWidth ?? t.space20;
  const rowName = (row: TreeGridRow): string => (rowHeaderColumn ? cellValue(row, rowHeaderColumn.key) || row.id : row.id);

  // ---- selection ----

  const effectiveSelectable = selectable;
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);
  const [activeCell, setActiveCell] = React.useState<TreeGridCellSelection | null>(null);

  const commitSelection = (next: string[]): void => {
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const toggleRowSelection = (row: TreeGridRow): void => {
    const next = new Set(selectedSet);
    const ids = selectChildren ? [row.id, ...collectLoadedDescendantIds(row)] : [row.id];
    const willSelect = !next.has(row.id);
    ids.forEach((id) => {
      if (willSelect) {
        next.add(id);
      } else {
        next.delete(id);
      }
    });
    commitSelection(Array.from(next));
  };

  const rowCheckState = (row: TreeGridRow, hasChildren: boolean): { checked: boolean; indeterminate: boolean } => {
    const isSelected = selectedSet.has(row.id);
    if (!selectChildren || !hasChildren) {
      return { checked: isSelected, indeterminate: false };
    }
    const descendantIds = collectLoadedDescendantIds(row);
    if (descendantIds.length === 0) {
      return { checked: isSelected, indeterminate: false };
    }
    const selectedDescendants = descendantIds.filter((id) => selectedSet.has(id)).length;
    const allSelected = isSelected && selectedDescendants === descendantIds.length;
    const someSelected = isSelected || selectedDescendants > 0;
    return { checked: allSelected, indeterminate: !allSelected && someSelected };
  };

  const allSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedSet.has(id));
  const someRowsSelected = !allSelected && allRowIds.some((id) => selectedSet.has(id));
  const toggleAll = (): void => commitSelection(allSelected ? [] : allRowIds);

  const selectCellTarget = (rowId: string, column: string): void => {
    const next: TreeGridCellSelection = { rowId, column };
    setActiveCell(next);
    onSelectionChange?.(next);
  };

  // ---- editing ----

  const [editingCell, setEditingCell] = React.useState<TreeGridCellSelection | null>(null);
  const [editingValue, setEditingValue] = React.useState('');
  const [editingError, setEditingError] = React.useState<string | undefined>(undefined);
  const [selectEditorTarget, setSelectEditorTarget] = React.useState<TreeGridCellSelection | null>(null);
  const [focusedCellKey, setFocusedCellKey] = React.useState<string | null>(null);

  const startEdit = (row: TreeGridRow, column: DataGridColumn): void => {
    if (!editable || column.editable !== true) {
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
      if (Platform.OS === 'ios') {
        AccessibilityInfo.announceForAccessibility(validationError);
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

  const renderEditor = (row: TreeGridRow, column: DataGridColumn): React.JSX.Element => {
    const editorFontSize = t.fontSizeSm;
    const editorStyle: TextStyle = {
      minHeight: t.sizeTargetMin,
      color: t.colorForeground,
      fontFamily: column.editor === 'number' ? t.fontFamilyMono : t.fontFamilyBody,
      fontSize: editorFontSize,
      lineHeight: toLineHeight(editorFontSize, t.fontLineHeightTight),
      paddingVertical: t.space1,
    };

    const handleKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>): void => {
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

  // ---- cells ----

  const selectCellStyle: ViewStyle = { width: t.sizeTargetComfortable, alignItems: 'center', justifyContent: 'center' };

  const renderCell = (visible: TreeGridVisibleRow, column: DataGridColumn): React.JSX.Element => {
    const { row, level, hasChildren, isExpanded } = visible;
    const width = widthFor(column);
    const isRowHeaderCol = column.isRowHeader === true;
    const isEditingThis = editingCell !== null && editingCell.rowId === row.id && editingCell.column === column.key;
    const cellKey = `${row.id}:${column.key}`;
    const isFocused = focusedCellKey === cellKey;
    const isCellSelected = effectiveSelectable === 'cell' && activeCell?.rowId === row.id && activeCell.column === column.key;
    const hasError = isEditingThis && editingError !== undefined;
    const canEdit = editable && column.editable === true;
    const isCheckboxEditor = canEdit && column.editor === 'checkbox';
    const name = rowName(row);

    const cellOuterStyle: ViewStyle = {
      width,
      paddingHorizontal: t.space2,
      justifyContent: 'center',
      borderRightWidth: t.borderWidthThin,
      borderRightColor: t.colorBorder,
      backgroundColor: hasError ? t.colorStatusDangerBackground : isEditingThis ? t.colorControlBackground : isCellSelected ? t.colorBackgroundSubtle : 'transparent',
      borderWidth: isFocused ? t.borderWidthFocus : hasError ? t.borderWidthThin : 0,
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
    } else if (isRowHeaderCol) {
      const guideOffsets = Array.from({ length: level - 1 }, (_, i) => indentValue * i + expandButtonSizeValue / 2);
      const indentContainerWidth = indentValue * (level - 1) + expandButtonSizeValue;
      content = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: indentContainerWidth, height: activeRowHeight }}>
            {guideOffsets.map((offset) => (
              <View
                key={offset}
                style={{ position: 'absolute', left: offset, top: 0, bottom: 0, width: guideLineWidthValue, backgroundColor: guideLineColor }}
                testID="TreeGrid.indent"
              />
            ))}
            {hasChildren ? (
              <View style={{ position: 'absolute', left: indentValue * (level - 1), top: 0, bottom: 0, justifyContent: 'center' }}>
                <TreeGridExpandButton
                  expanded={isExpanded}
                  label={isExpanded ? COPY.collapse(name) : COPY.expand(name)}
                  transitionDuration={transitionDuration}
                  color={t.colorForeground}
                  onPress={() => toggleExpand(row)}
                />
              </View>
            ) : null}
          </View>
          <View style={{ width: expandGapValue }} />
          <Text size="sm" truncate overrides={hasChildren ? { fontWeight: parentWeightRef } : undefined}>
            {name}
          </Text>
        </View>
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

    const testId = isRowHeaderCol ? 'TreeGrid.rowHeader' : 'TreeGrid.cell';
    const role = isRowHeaderCol ? 'rowheader' : 'cell';

    if (isEditingThis || isCheckboxEditor) {
      return (
        <View key={column.key} style={cellOuterStyle} role={role} testID={testId}>
          {content}
        </View>
      );
    }

    const handleAccessibilityAction = (event: AccessibilityActionEvent): void => {
      if (event.nativeEvent.actionName === 'expand' && !isExpanded) {
        toggleExpand(row);
      } else if (event.nativeEvent.actionName === 'collapse' && isExpanded) {
        toggleExpand(row);
      }
    };

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
        accessibilityLabel={
          isRowHeaderCol
            ? hasChildren
              ? `${name}, ${COPY.level(level)}, ${COPY.childCount(collectLoadedDescendantIds(row).length)}`
              : `${name}, ${COPY.level(level)}`
            : `${column.header}: ${cellValue(row, column.key)}`
        }
        accessibilityHint={canEdit ? 'double tap to edit' : undefined}
        accessibilityState={isRowHeaderCol ? (hasChildren ? { expanded: isExpanded } : undefined) : isCellSelected ? { selected: true } : undefined}
        accessibilityActions={isRowHeaderCol && hasChildren ? [{ name: 'expand', label: COPY.expand(name) }, { name: 'collapse', label: COPY.collapse(name) }] : undefined}
        onAccessibilityAction={isRowHeaderCol && hasChildren ? handleAccessibilityAction : undefined}
        role={role}
        testID={testId}
      >
        {content}
      </Pressable>
    );
  };

  const renderRow = ({ item: visible }: ListRenderItemInfo<TreeGridVisibleRow>): React.JSX.Element => {
    if (visible.placeholder) {
      const placeholderIndent = indentValue * (visible.level - 1) + expandButtonSizeValue + expandGapValue;
      return (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', minHeight: activeRowHeight, paddingLeft: placeholderIndent, borderBottomWidth: t.borderWidthThin, borderBottomColor: t.colorBorder }}
          role="row"
          accessibilityState={{ busy: true }}
          testID="TreeGrid.row"
        >
          <Text size="sm" tone="muted">
            {COPY.loading}
          </Text>
        </View>
      );
    }

    const { row, hasChildren } = visible;
    const isRowSelected = effectiveSelectable === 'row' && rowCheckState(row, hasChildren).checked;
    const rowStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: activeRowHeight,
      borderBottomWidth: t.borderWidthThin,
      borderBottomColor: t.colorBorder,
      backgroundColor: isRowSelected ? t.colorBackgroundSubtle : t.colorBackground,
    };

    return (
      <View style={rowStyle} role="row" accessibilityState={effectiveSelectable !== 'none' ? { selected: isRowSelected } : undefined} testID="TreeGrid.row">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="TreeGrid.selectCell">
            <Checkbox
              label={COPY.selectRow(rowName(row))}
              name={`tree-grid-row-${row.id}`}
              checked={rowCheckState(row, hasChildren).checked}
              indeterminate={rowCheckState(row, hasChildren).indeterminate}
              onChange={() => toggleRowSelection(row)}
            />
          </View>
        ) : null}
        {orderedColumns.map((column) => renderCell(visible, column))}
      </View>
    );
  };

  const getItemLayout = (_listData: ArrayLike<TreeGridVisibleRow> | null | undefined, index: number): { length: number; offset: number; index: number } => ({
    length: activeRowHeight,
    offset: activeRowHeight * index,
    index,
  });

  // ---- header ----

  const renderColumnHeader = (column: DataGridColumn): React.JSX.Element => {
    const width = widthFor(column);
    const isSorted = sort?.column === column.key;
    const headerCellStyle: ViewStyle = {
      width,
      paddingHorizontal: t.space2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRightWidth: t.borderWidthThin,
      borderRightColor: t.colorBorder,
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
              trailingIcon={isSorted ? <Icon name={sort.direction === 'ascending' ? 'chevron-up' : 'chevron-down'} inline color={t.colorForeground} /> : undefined}
              onPress={() => handleSort(column.key)}
            />
          </View>
        ) : (
          <Text size="sm" weight="semibold" truncate>
            {column.header}
          </Text>
        )}
      </View>
    );
  };

  const headerRowStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: t.colorBackgroundSubtle,
    borderBottomWidth: t.borderWidthThin,
    borderBottomColor: t.colorBorderStrong,
  };

  const renderHeader = (): React.JSX.Element => (
    <View role="rowgroup" testID="TreeGrid.header">
      <View style={headerRowStyle} role="row" testID="TreeGrid.headerRow">
        {effectiveSelectable === 'row' ? (
          <View style={selectCellStyle} testID="TreeGrid.selectAllCell">
            <Checkbox label={COPY.selectAll} name="tree-grid-select-all" checked={allSelected} indeterminate={someRowsSelected} onChange={toggleAll} />
          </View>
        ) : null}
        {orderedColumns.map((column) => renderColumnHeader(column))}
      </View>
    </View>
  );

  // ---- layout ----

  const showEmpty = visibleRows.length === 0;
  const containerHeightStyle: ViewStyle = height === 'fixed' ? { height: fixedHeightValue } : height === 'viewport' ? { flex: 1 } : {};
  const totalContentWidth = orderedColumns.reduce((sum, column) => sum + widthFor(column), 0) + (effectiveSelectable === 'row' ? t.sizeTargetComfortable : 0);

  const grid = (
    <FlatList
      data={visibleRows}
      keyExtractor={(item) => item.key}
      renderItem={renderRow}
      ListHeaderComponent={renderHeader}
      stickyHeaderIndices={height !== 'content' ? [0] : undefined}
      getItemLayout={getItemLayout}
      scrollEnabled={height !== 'content'}
      style={height === 'content' ? undefined : { flex: 1 }}
      role="grid"
      accessibilityLabel={caption}
      accessibilityState={{ busy: loading }}
      ListEmptyComponent={
        <View style={{ padding: t.space2 }} accessible accessibilityLabel={loading ? COPY.loading : COPY.empty} testID="TreeGrid.emptyState">
          <Text tone="muted">{loading ? COPY.loading : COPY.empty}</Text>
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
      role="treegrid"
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
    statusText = editingError;
  } else if (editingCell !== null) {
    const column = columns.find((c) => c.key === editingCell.column);
    statusText = COPY.editing(column?.header ?? editingCell.column);
  } else if (effectiveSelectable === 'row' && selectedIds.length > 0) {
    statusText = COPY.selectedRows(selectedIds.length, allRowIds.length);
  } else {
    statusText = COPY.rowCount(showEmpty ? 0 : visibleRows.length);
  }

  // ---- select editor (BottomSheet) ----

  const selectEditorRow = selectEditorTarget ? (rowById.get(selectEditorTarget.rowId) ?? null) : null;
  const selectEditorColumn = selectEditorTarget ? (columns.find((c) => c.key === selectEditorTarget.column) ?? null) : null;

  return (
    <View
      testID="TreeGrid"
      accessibilityActions={[
        { name: 'expandAll', label: COPY.expandAll },
        { name: 'collapseAll', label: COPY.collapseAll },
      ]}
      onAccessibilityAction={handleRootAccessibilityAction}
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
