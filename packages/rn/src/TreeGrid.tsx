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
import type { DataGridColumn } from './DataGrid';
import { DatePicker } from './DatePicker';
import { Heading } from './Heading';
import { Icon } from './Icon';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { Select } from './Select';
import { Text, TextForegroundContext } from './Text';
import { toEasing, useReducedMotion, useTheme } from './theme';
import type { Tokens } from './theme';

export type TreeGridSortDirection = 'ascending' | 'descending';
export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';
/** Position of the caption in the page outline. The schema declares the values as strings; numbers are accepted too. */
export type TreeGridCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;

/**
 * A nested record. `id` must be stable; it is what expansion and selection use.
 * `children: "lazy"` marks a subtree loaded on expand through `onExpand`; `children: []`
 * is a leaf (no expand control, no expanded state).
 */
export interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | 'lazy' | undefined;
  [key: string]: unknown;
}

/** Sort state: which column, and which way. Applies within each level; the hierarchy is kept. */
export type TreeGridSort = { column: string; direction: 'ascending' | 'descending' };

/** One cell, in `selectable="cell"` mode. */
export type TreeGridCellSelection = { rowId: string; column: string };

/** Row ids, or one cell, matching `selectable`. */
export type TreeGridSelection = string[] | TreeGridCellSelection;

/** A cell value as an editor produces it; `undefined` when the cell has none. */
export type TreeGridCellValue = string | number | boolean | undefined;

/** The style bindings a caller may replace with a different token; locked bindings are excluded. */
export type TreeGridOverridableBinding =
  | 'indent'
  | 'expandGap'
  | 'guideLine'
  | 'guideLineWidth'
  | 'cellPaddingInline'
  | 'fixedHeight'
  | 'parentWeight'
  | 'transition';

export interface TreeGridProps {
  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is the caption size regardless, as DataGrid. */
  captionLevel?: TreeGridCaptionLevel | undefined;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** DataGrid's column model. The `isRowHeader` column is required — it carries the indent and the expand control — and comes first after the selection column. */
  columns: DataGridColumn[];
  /** Nested rows. `children: "lazy"` loads on expand through `onExpand`; `children: []` is a leaf. */
  data: TreeGridRow[];
  /** Controlled ids of expanded rows. `["*"]` is honoured as in `defaultExpanded`. */
  expanded?: string[] | undefined;
  /**
   * Initially expanded ids. `["*"]` expands every row whose `children` is a non-empty array,
   * rows loaded later included, and never a `"lazy"` row (that would fire `onExpand` without a
   * user act); the first user toggle resolves it to the concrete ids `onExpandChange` reports.
   * A lazy id listed explicitly stays collapsed until the user opens it.
   */
  defaultExpanded?: string[] | undefined;
  /** Controlled sort; the caller orders siblings within each level. */
  sort?: TreeGridSort | undefined;
  /** Initial sort when uncontrolled; the grid orders siblings within each level itself. */
  defaultSort?: TreeGridSort | undefined;
  /** `row` adds a checkbox column; `cell` selects the tapped cell. Select-all covers every loaded row at every level. */
  selectable?: TreeGridSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected row ids. */
  defaultSelected?: string[] | undefined;
  /** Toggling a row sets or clears its own id and every loaded descendant; a parent's shown state derives from its loaded descendants. */
  selectChildren?: boolean | undefined;
  /** Master switch: cells whose column is `editable` open their editor when tapped. */
  editable?: boolean | undefined;
  /** Row height: `compact` is the minimum target, `comfortable` the touch target. */
  density?: TreeGridDensity | undefined;
  /** `viewport`: window height minus twice the section gap; `content`: grows with rows; `fixed`: `overrides.fixedHeight`. */
  height?: TreeGridHeight | undefined;
  /** Marks the grid busy and shows `copy.loading` in the status bar; existing rows stay, their text muted. */
  loading?: boolean | undefined;
  /** A footer line with row count, selection count and, while editing, the validation message. */
  showStatusBar?: boolean | undefined;
  /** The header stays visible while the body scrolls. Always true when virtualized (`height` is not `content`). */
  stickyHeader?: boolean | undefined;
  /** Shown when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop. */
  overrides?: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired with every expanded id, as a bare array. */
  onExpandChange?: ((ids: string[]) => void) | undefined;
  /** Fired with its id each time a row whose `children` is still `"lazy"` opens, so a failed load can retry. Precedes the `onExpandChange` of the same act. */
  onExpand?: ((id: string) => void) | undefined;
  /** Fired when a sortable header is activated: ascending on a new column, then toggling. */
  onSortChange?: ((column: string, direction: 'ascending' | 'descending') => void) | undefined;
  /** Fired with the selection: row ids (row mode) or one cell (cell mode). */
  onSelectionChange?: ((selection: string[] | { rowId: string; column: string }) => void) | undefined;
  /** Fired when an edit commits. The caller updates `data`; the cell shows the old value until it does. */
  onCellChange?: ((rowId: string, column: string, value: TreeGridCellValue, previous: TreeGridCellValue) => void) | undefined;
  /** Fired before an editor opens; return `false` to refuse editing that cell. */
  onEditStart?: ((rowId: string, column: string) => boolean | void) | undefined;
  /** Fired with the column key and its new width when a drag on the header edge ends, or per resize accessibility action. */
  onColumnResize?: ((column: string, width: number) => void) | undefined;
  /** The root view. */
  ref?: React.Ref<ViewInstance> | undefined;
}

/** The component's user-facing strings, from the doc's `copy` block. */
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
  /** DataGrid's cell name and edit hint: the column model, the editors and the touch affordances are shared. */
  cellLabel: (column: string, value: string): string => `${column}: ${value}`,
  editHint: 'Double tap to edit',
} as const;

const JUSTIFY = { start: 'flex-start', center: 'center', end: 'flex-end' } as const;

/** Clips content to one point while keeping it in the accessibility tree (hidden caption, the live region when the bar is off). */
const HIDDEN_STYLE: ViewStyle = { position: 'absolute', width: 1, height: 1, overflow: 'hidden' };

const PARENT_WEIGHT: TokenRef = 'font.weight.medium';
const HEADER_WEIGHT: TokenRef = 'font.weight.semibold';
const HEADER_SIZE: TokenRef = 'font.size.sm';
const CAPTION_SIZE: TokenRef = 'font.size.md';
const CAPTION_WEIGHT: TokenRef = 'font.weight.semibold';
const CAPTION_GAP: TokenRef = 'space.2';
const LINE_HEIGHT: TokenRef = 'font.lineHeight.tight';
const NUMERIC_FONT: TokenRef = 'font.family.mono';
const INSET_ZERO: TokenRef = 'space.0';

type Shadow = Tokens['shadowRaised'];

function tokenOr<T>(t: Tokens, ref: TokenRef | undefined, fallback: T): T {
  return ref === undefined ? fallback : (resolveToken(t, ref) as T);
}

/** One entry of the flattened, virtualized visible-row list; collapsed subtrees never appear in it. */
interface FlatRow {
  key: string;
  level: number;
  /** A `"lazy"` row's busy placeholder child, not its own row. */
  placeholder: boolean;
  row: TreeGridRow;
}

function cellText(row: TreeGridRow, key: string): string {
  const raw = row[key];
  return raw === undefined || raw === null ? '' : String(raw);
}

function cellValue(row: TreeGridRow, key: string): TreeGridCellValue {
  const raw = row[key];
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  return raw === undefined || raw === null ? undefined : String(raw);
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

/** Orders siblings within each level and keeps the hierarchy. */
function sortTree(rows: TreeGridRow[], sort: TreeGridSort): TreeGridRow[] {
  return [...rows]
    .sort((a, b) => compareRows(a, b, sort))
    .map((row) => (Array.isArray(row.children) ? { ...row, children: sortTree(row.children, sort) } : row));
}

function hasChildren(row: TreeGridRow): boolean {
  return row.children === 'lazy' || (Array.isArray(row.children) && row.children.length > 0);
}

/** The visible rows, in order: a collapsed subtree contributes nothing, so it costs nothing. */
function flattenTree(rows: TreeGridRow[], expanded: Set<string>, level: number, out: FlatRow[] = []): FlatRow[] {
  for (const row of rows) {
    out.push({ key: row.id, level, placeholder: false, row });
    if (!hasChildren(row) || !expanded.has(row.id)) {
      continue;
    }
    if (row.children === 'lazy') {
      out.push({ key: `${row.id}::placeholder`, level: level + 1, placeholder: true, row });
    } else if (Array.isArray(row.children)) {
      flattenTree(row.children, expanded, level + 1, out);
    }
  }
  return out;
}

/** Every loaded row with a non-empty array of children — what `"*"` expands; never a `"lazy"` row. */
function expandableIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    if (Array.isArray(row.children) && row.children.length > 0) {
      out.push(row.id);
      expandableIds(row.children, out);
    }
  }
  return out;
}

/** Every loaded row that can open, `"lazy"` rows included — what the expandAll action covers. */
function openableIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    if (hasChildren(row)) {
      out.push(row.id);
    }
    if (Array.isArray(row.children)) {
      openableIds(row.children, out);
    }
  }
  return out;
}

/** Every row whose children are still `"lazy"`, at any depth. */
function lazyIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    if (row.children === 'lazy') {
      out.push(row.id);
    } else if (Array.isArray(row.children)) {
      lazyIds(row.children, out);
    }
  }
  return out;
}

/** Every loaded row id at any depth, expanded or not — the select-all set and `copy.rowCount`. */
function loadedIds(rows: TreeGridRow[], out: string[] = []): string[] {
  for (const row of rows) {
    out.push(row.id);
    if (Array.isArray(row.children)) {
      loadedIds(row.children, out);
    }
  }
  return out;
}

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

/**
 * With `selectChildren`, a row's shown state is derived from its loaded descendants: checked when
 * all of them are (even if its own id is absent), indeterminate when some are, otherwise its own
 * id decides. A `"lazy"` subtree contributes nothing until it loads.
 */
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

/** The expand control's chevron, rotated over `transition` with the standard easing; instant under reduced motion. */
function Chevron({ expanded, color, duration }: { expanded: boolean; color: string; duration: number }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const reducedMotion = useReducedMotion();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const wasExpanded = React.useRef(expanded);
  React.useEffect(() => {
    const toValue = expanded ? 1 : 0;
    // A row scrolled into view is drawn in its current state; only a toggle rotates.
    const toggled = wasExpanded.current !== expanded;
    wasExpanded.current = expanded;
    if (reducedMotion || !toggled) {
      rotation.setValue(toValue);
      return;
    }
    const animation = Animated.timing(rotation, { toValue, duration, easing: toEasing(t.motionEasingStandard), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
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
      testID="TreeGrid.resizeHandle"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      hitSlop={{ left: hitSlop, right: hitSlop }}
      style={{ width: handleWidth, alignSelf: 'stretch', backgroundColor: color }}
    />
  );
}

/**
 * TreeGrid — a DataGrid whose rows have rows inside them. The hierarchy lives in the row-header
 * column (indent, a chevron, an announced level); every other column is DataGrid's, down to the
 * editors, the status bar and the column model.
 *
 * When to use: records that nest and each hold several comparable fields — a chart of accounts
 * with balances, folders with sizes, a bill of materials with quantities. `children: "lazy"`
 * keeps the first paint cheap for deep trees; `selectChildren` makes selecting a row mean "this
 * and everything in it". Not for one field per node (Tree), flat data (DataGrid), or content
 * read row by row (Table).
 *
 * Native structure follows DataGrid: a caption `Heading` at `captionLevel` (clipped but still
 * the accessible name with `hideCaption`), a horizontal `ScrollView` holding a `FlatList` with
 * `role="grid"`, the caption as its `accessibilityLabel` and a fixed `getItemLayout` over the
 * flattened visible rows — a collapsed subtree is absent from that list, which is what gets
 * virtualized. The header row is the sticky list header; pinned columns keep their place in
 * `columns` and cast `pinnedShadow` once the region has moved sideways, as DataGrid.
 *
 * Expansion is the tree part. Each row header is a `Pressable` announcing "{name}, Level {n},
 * {count} items" with `accessibilityState.expanded` and its own `expand`/`collapse` actions when
 * it has children; pressing it toggles, long-pressing edits it when the column is editable. The
 * visible chevron is a ghost, icon-only `Button` at `size.target.min`, hidden from assistive
 * technology (the row header's actions are the screen-reader path) and rotated over `transition`.
 * The root view carries `expandAll`/`collapseAll` actions over every loaded row — the native
 * stand-in for `*`, which core React Native cannot reach, along with Shift+Space and Control+A.
 * `indent` is a spacer per level beyond the first, and one guide line per ancestor level runs the
 * full row height, centred on that ancestor's chevron. A `"lazy"` row fires `onExpand` every time
 * it opens while still lazy and shows one busy placeholder row reading `copy.loading` — a row
 * that is navigable but neither selectable nor editable — until `children` arrives. Native has no
 * position in set: only the level and the child count are conveyed.
 *
 * Everything else is DataGrid's model: a sortable header is a `Button` (sorting orders siblings
 * within each level and keeps the tree), `selectable="row"` adds `Checkbox` cells and a select-all
 * that covers every loaded row at every level, `cell` selects the tapped cell, and an editable
 * cell opens `Input`, `NumberInput`, `DatePicker`, `Select` or `Checkbox` after `onEditStart`
 * allows it, with `activate` committing and `escape` cancelling. A failing `validate` keeps the
 * editor open with the cell ringed in danger and the message in the status bar's live region.
 */
export function TreeGrid({
  caption,
  captionLevel = '2',
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

  const [internalSort, setInternalSort] = React.useState<TreeGridSort | undefined>(defaultSort);
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(defaultExpanded ?? []);
  const [openedByUser, setOpenedByUser] = React.useState<ReadonlySet<string>>(() => new Set<string>());
  const [internalSelected, setInternalSelected] = React.useState<string[]>(defaultSelected ?? []);
  const [activeCell, setActiveCell] = React.useState<TreeGridCellSelection | null>(null);
  const [focusedCell, setFocusedCell] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<TreeGridCellSelection | null>(null);
  const [draft, setDraft] = React.useState<TreeGridCellValue>(undefined);
  const [editError, setEditError] = React.useState<string | undefined>(undefined);
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const [headerScrolled, setHeaderScrolled] = React.useState(false);
  const [scrolledX, setScrolledX] = React.useState(false);
  const [regionWidth, setRegionWidth] = React.useState<number | null>(null);
  const [announcement, setAnnouncement] = React.useState('');

  const columnByKey = React.useMemo(() => new Map(columns.map((column) => [column.key, column] as const)), [columns]);
  const rowHeaderColumn = columns.find((column) => column.isRowHeader === true);

  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (rowHeaderColumn === undefined) {
      console.warn('TreeGrid: one column must set `isRowHeader`; it carries the indent and the expand control.');
    } else if (columns[0] !== rowHeaderColumn) {
      console.warn('TreeGrid: the `isRowHeader` column must come first, after the selection column.');
    }
  }, [columns, rowHeaderColumn]);

  /** Puts a message in the status bar's live region, and speaks it on iOS, which has no live regions. */
  const announce = (message: string): void => {
    setAnnouncement(message);
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  // ---- Bindings ----
  const indent = tokenOr<number>(t, overrides?.indent, t.space5);
  const expandButtonSize = t.sizeTargetMin;
  const expandGap = tokenOr<number>(t, overrides?.expandGap, t.layoutGapTight);
  const guideLine = tokenOr<string>(t, overrides?.guideLine, t.colorBorder);
  const guideLineWidth = tokenOr<number>(t, overrides?.guideLineWidth, t.borderWidthThin);
  const cellPaddingInline = tokenOr<number>(t, overrides?.cellPaddingInline, t.space2);
  const fixedHeight = tokenOr<number>(t, overrides?.fixedHeight, t.space20);
  const parentWeight = overrides?.parentWeight ?? PARENT_WEIGHT;
  const transition = tokenOr<number>(t, overrides?.transition, t.motionDurationFast);
  // DataGrid's own bindings, at DataGrid's defaults: not overridable on TreeGrid.
  const gridLine = t.colorBorder;
  const gridLineWidth = t.borderWidthThin;
  const columnWidth = t.space20 * 2;
  const resizeHandleWidth = t.space1;
  const resizeStep = t.space4;
  const rowHeight = density === 'comfortable' ? t.sizeTargetComfortable : t.sizeTargetMin;
  // The select column holds a minimum target plus the cell's own inline padding on both sides.
  const selectColumnWidth = t.sizeTargetMin + 2 * cellPaddingInline;

  const bodyText = { lineHeight: LINE_HEIGHT };
  const numericText = { lineHeight: LINE_HEIGHT, fontFamily: NUMERIC_FONT };
  const headerText = { lineHeight: LINE_HEIGHT, fontSize: HEADER_SIZE, fontWeight: HEADER_WEIGHT };
  const editorInset = { paddingInline: INSET_ZERO, paddingBlock: INSET_ZERO };

  // ---- Sorting ----

  const activeSort = sort ?? internalSort;
  const tree = React.useMemo(
    () => (sort === undefined && internalSort !== undefined ? sortTree(data, internalSort) : data),
    [data, sort, internalSort],
  );

  const sortKey = activeSort === undefined ? '' : `${activeSort.column}:${activeSort.direction}`;
  const lastSortKey = React.useRef(sortKey);
  React.useEffect(() => {
    if (lastSortKey.current === sortKey || activeSort === undefined) {
      lastSortKey.current = sortKey;
      return;
    }
    lastSortKey.current = sortKey;
    const header = columnByKey.get(activeSort.column)?.header ?? activeSort.column;
    announce(COPY.sortedAnnouncement(header, activeSort.direction));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortKey]);

  const handleSortPress = (column: DataGridColumn): void => {
    commitOpenEdit();
    const direction: TreeGridSortDirection = activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (sort === undefined) {
      setInternalSort({ column: column.key, direction });
    }
    onSortChange?.(column.key, direction);
  };

  // ---- Expansion ----

  const lazySet = React.useMemo(() => new Set(lazyIds(tree)), [tree]);
  const expandedIds = expanded ?? internalExpanded;
  /** `"*"` resolved against the tree as it stands, so rows loaded later open too. */
  const resolvedExpanded = React.useMemo(
    () => (expandedIds.includes('*') ? Array.from(new Set([...expandedIds.filter((id) => id !== '*'), ...expandableIds(tree)])) : expandedIds),
    [expandedIds, tree],
  );
  /** What is actually open: a lazy row listed by the caller stays shut until the user opens it, so `onExpand` follows a user act. */
  const expandedSet = React.useMemo(
    () => new Set(resolvedExpanded.filter((id) => !lazySet.has(id) || openedByUser.has(id))),
    [resolvedExpanded, lazySet, openedByUser],
  );

  const commitExpanded = (next: string[]): void => {
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandChange?.(next);
  };

  const toggleExpand = (row: TreeGridRow): void => {
    if (expandedSet.has(row.id)) {
      setOpenedByUser((previous) => {
        const next = new Set(previous);
        next.delete(row.id);
        return next;
      });
      commitExpanded(resolvedExpanded.filter((id) => id !== row.id));
      return;
    }
    if (row.children === 'lazy') {
      onExpand?.(row.id);
    }
    setOpenedByUser((previous) => new Set(previous).add(row.id));
    commitExpanded(resolvedExpanded.includes(row.id) ? resolvedExpanded : [...resolvedExpanded, row.id]);
  };

  const rows = React.useMemo(() => flattenTree(tree, expandedSet, 1), [tree, expandedSet]);
  const allIds = React.useMemo(() => loadedIds(tree), [tree]);
  const total = allIds.length;

  /** The root's stand-in for `*`: every loaded row that can open, one `onExpand` per lazy row, then one `onExpandChange`. */
  const handleRootAction = (event: AccessibilityActionEvent): void => {
    const action = event.nativeEvent.actionName;
    if (action === 'expandAll') {
      const openable = openableIds(tree);
      const opening = openable.filter((id) => !expandedSet.has(id));
      if (opening.length === 0) {
        return;
      }
      opening.filter((id) => lazySet.has(id)).forEach((id) => onExpand?.(id));
      setOpenedByUser((previous) => {
        const next = new Set(previous);
        opening.forEach((id) => next.add(id));
        return next;
      });
      commitExpanded(Array.from(new Set([...resolvedExpanded, ...openable])));
    } else if (action === 'collapseAll') {
      if (resolvedExpanded.length === 0) {
        return;
      }
      setOpenedByUser(new Set<string>());
      commitExpanded([]);
    }
  };

  // ---- Selection ----

  const selectedIds = selected ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitRows = (next: string[]): void => {
    if (selected === undefined) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
    announce(COPY.selectedRows(next.length, total));
  };

  const checkStateOf = (row: TreeGridRow): CheckState =>
    selectChildren ? derivedCheckState(row, selectedSet) : selectedSet.has(row.id) ? 'checked' : 'unchecked';

  /** A row's own toggle: with `selectChildren` it carries its loaded descendants; a row shown checked clears, any other state sets. */
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

  const rowName = (row: TreeGridRow): string => (rowHeaderColumn === undefined ? row.id : cellText(row, rowHeaderColumn.key) || row.id);

  // ---- Editing ----

  const closeEditor = (): void => {
    setEditing(null);
    setDraft(undefined);
    setEditError(undefined);
  };

  const commitEdit = (row: TreeGridRow, column: DataGridColumn, value: TreeGridCellValue): boolean => {
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
    const row = rows.find((flat) => !flat.placeholder && flat.row.id === editing.rowId)?.row;
    const column = columnByKey.get(editing.column);
    if (row === undefined || column === undefined) {
      closeEditor();
      return true;
    }
    return commitEdit(row, column, draft);
  }

  const canEdit = (column: DataGridColumn): boolean => editable && column.editable === true;

  const startEdit = (row: TreeGridRow, column: DataGridColumn): void => {
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

  const editorFor = (row: TreeGridRow, column: DataGridColumn): React.ReactNode => {
    const label = column.header;
    const name = `${baseId}-${row.id}-${column.key}`;
    // Editors are never told about validity: the cell carries the danger ring and the status bar the message.
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
        return <Checkbox label={label} hideLabel name={name} checked={draft === true} onChange={(checked) => commitEdit(row, column, checked)} />;
      default:
        return (
          <Input
            label={label}
            hideLabel
            name={name}
            size="sm"
            value={draft === undefined ? '' : String(draft)}
            overrides={editorInset}
            onChange={(value) => setDraft(value)}
            onBlur={() => commitEdit(row, column, draft)}
          />
        );
    }
  };

  // ---- Columns ----

  const widthFor = (column: DataGridColumn): number => widths[column.key] ?? column.width ?? columnWidth;
  const minWidthFor = (column: DataGridColumn): number => column.minWidth ?? t.sizeTargetMin;
  const resizeTo = (column: DataGridColumn, width: number): void => {
    setWidths((previous) => ({ ...previous, [column.key]: Math.max(minWidthFor(column), width) }));
  };

  const selectColumnStyle: ViewStyle = { width: selectColumnWidth, alignItems: 'center', justifyContent: 'center' };
  const pinnedCellStyle = (column: DataGridColumn | null): ViewStyle | null =>
    scrolledX && (column === null || column.pinned !== undefined) ? { zIndex: 1, ...t.shadowRaised } : null;

  const cellFrame = (column: DataGridColumn): ViewStyle => ({
    width: widthFor(column),
    justifyContent: 'center',
    paddingHorizontal: cellPaddingInline,
    borderEndWidth: gridLineWidth,
    borderEndColor: gridLine,
  });

  // ---- Header ----

  const headerRow = (
    <View
      testID="TreeGrid.header"
      role="rowgroup"
      style={{ backgroundColor: t.colorBackgroundSubtle, ...(headerScrolled ? t.shadowRaised : null) }}
    >
      <View
        testID="TreeGrid.headerRow"
        role="row"
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          minHeight: rowHeight,
          borderBottomWidth: t.borderWidthThin,
          borderBottomColor: t.colorBorderStrong,
        }}
      >
        {selectable === 'row' ? (
          <View
            testID="TreeGrid.selectAllCell"
            role="columnheader"
            style={[
              selectColumnStyle,
              { backgroundColor: t.colorBackgroundSubtle, borderEndWidth: gridLineWidth, borderEndColor: gridLine },
              pinnedCellStyle(null),
            ]}
          >
            <Checkbox label={COPY.selectAll} hideLabel name={`${baseId}-all`} checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
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
              testID="TreeGrid.columnHeader"
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
                  <View testID="TreeGrid.sortButton">
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
                      overrides={{ fontWeight: HEADER_WEIGHT, fontSize: HEADER_SIZE, paddingInline: INSET_ZERO }}
                      onPress={() => handleSortPress(column)}
                    />
                  </View>
                ) : (
                  // `abbr` is the spoken name; the visible header is hidden behind it, as on web.
                  <View accessible accessibilityLabel={column.abbr ?? column.header}>
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

  /** One full-height line per ancestor level, centred on that ancestor's expand control. Decorative: the level is announced. */
  const guideLines = (level: number): React.JSX.Element | null =>
    level > 1 ? (
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
      >
        {Array.from({ length: level - 1 }, (_unused, ancestor) => (
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

  const cellValueNode = (row: TreeGridRow, column: DataGridColumn, weight?: TokenRef | undefined): React.ReactNode => {
    if (column.render !== undefined) {
      return column.render(row);
    }
    const numeric = typeof row[column.key] === 'number';
    return (
      <Text
        size="sm"
        align={column.align ?? 'start'}
        tone={loading ? 'muted' : 'default'}
        truncate
        overrides={weight === undefined ? (numeric ? numericText : bodyText) : { ...(numeric ? numericText : bodyText), fontWeight: weight }}
      >
        {cellText(row, column.key)}
      </Text>
    );
  };

  const editorActions = (row: TreeGridRow, column: DataGridColumn): ((event: AccessibilityActionEvent) => void) => (event) => {
    if (event.nativeEvent.actionName === 'activate') {
      commitEdit(row, column, draft);
    } else if (event.nativeEvent.actionName === 'escape') {
      closeEditor();
    }
  };

  const renderDataCell = (row: TreeGridRow, column: DataGridColumn): React.JSX.Element => {
    const key = `${row.id} ${column.key}`;
    const isEditing = sameCell(editing, row.id, column.key);
    const invalid = isEditing && editError !== undefined;
    const cellSelected = selectable === 'cell' && sameCell(activeCell, row.id, column.key);
    const background = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : cellSelected ? t.colorBackgroundSubtle : 'transparent';
    const style: ViewStyle[] = [cellFrame(column), { alignItems: isEditing ? 'stretch' : JUSTIFY[column.align ?? 'start'], backgroundColor: background }];
    const pinned = pinnedCellStyle(column);
    if (pinned !== null) {
      style.push({ ...pinned, backgroundColor: background === 'transparent' ? t.colorBackground : background });
    }
    const ring = invalid ? (
      <CellRing color={t.colorBorderDanger} width={t.borderWidthFocus} />
    ) : isEditing || focusedCell === key || cellSelected ? (
      <CellRing color={t.colorBorderFocus} width={t.borderWidthFocus} />
    ) : null;

    if (isEditing) {
      return (
        <View
          key={column.key}
          testID="TreeGrid.cell"
          role="cell"
          accessibilityActions={[{ name: 'activate' }, { name: 'escape' }]}
          onAccessibilityAction={editorActions(row, column)}
          style={style}
        >
          <View testID="TreeGrid.editor">{editorFor(row, column)}</View>
          {ring}
        </View>
      );
    }

    const editableHere = canEdit(column);
    const interactive = editableHere || selectable === 'cell' || editing !== null;
    return (
      <Pressable
        key={column.key}
        testID="TreeGrid.cell"
        role="cell"
        accessibilityLabel={COPY.cellLabel(column.header, cellText(row, column.key))}
        accessibilityHint={editableHere ? COPY.editHint : undefined}
        accessibilityState={selectable === 'cell' ? { selected: cellSelected } : undefined}
        onPress={
          interactive
            ? () => {
                if (selectable === 'cell' && !cellSelected) {
                  selectCell(row.id, column.key);
                }
                if (editableHere) {
                  startEdit(row, column);
                } else {
                  commitOpenEdit();
                }
              }
            : undefined
        }
        onFocus={() => setFocusedCell(key)}
        onBlur={() => setFocusedCell((current) => (current === key ? null : current))}
        style={style}
      >
        <View testID="TreeGrid.cellContent" style={{ alignItems: JUSTIFY[column.align ?? 'start'] }}>
          {cellValueNode(row, column)}
        </View>
        {ring}
      </Pressable>
    );
  };

  const renderRowHeader = (flat: FlatRow, column: DataGridColumn): React.JSX.Element => {
    const { row, level } = flat;
    const name = rowName(row);
    const parent = hasChildren(row);
    const isExpanded = parent && expandedSet.has(row.id);
    const key = `${row.id} ${column.key}`;
    const isEditing = sameCell(editing, row.id, column.key);
    const invalid = isEditing && editError !== undefined;
    const cellSelected = selectable === 'cell' && sameCell(activeCell, row.id, column.key);
    const editableHere = canEdit(column);
    // The count is left out for leaves and for lazy rows whose children have not arrived.
    const childCount = Array.isArray(row.children) ? row.children.length : 0;
    const label = [name, COPY.level(level), ...(childCount > 0 ? [COPY.childCount(childCount)] : [])].join(', ');

    const expandActions = parent
      ? [
          { name: 'expand', label: COPY.expand(name) },
          { name: 'collapse', label: COPY.collapse(name) },
        ]
      : undefined;
    const handleAction = (event: AccessibilityActionEvent): void => {
      const action = event.nativeEvent.actionName;
      if ((action === 'expand' && !isExpanded) || (action === 'collapse' && isExpanded)) {
        toggleExpand(row);
      }
    };
    /** Pressing a parent toggles it; a leaf takes DataGrid's order — edit if editable, else select the cell. */
    const activate = (): void => {
      if (parent) {
        commitOpenEdit();
        toggleExpand(row);
        return;
      }
      if (selectable === 'cell' && !cellSelected) {
        selectCell(row.id, column.key);
      }
      if (editableHere) {
        startEdit(row, column);
      } else {
        commitOpenEdit();
      }
    };

    const background = invalid ? t.colorStatusDangerBackground : isEditing ? t.colorControlBackground : cellSelected ? t.colorBackgroundSubtle : 'transparent';
    const style: ViewStyle[] = [cellFrame(column), { flexDirection: 'row', alignItems: 'center', backgroundColor: background }];
    const pinned = pinnedCellStyle(column);
    if (pinned !== null) {
      style.push({ ...pinned, backgroundColor: background === 'transparent' ? t.colorBackground : background });
    }
    const ring = invalid ? (
      <CellRing color={t.colorBorderDanger} width={t.borderWidthFocus} />
    ) : isEditing || focusedCell === key || cellSelected ? (
      <CellRing color={t.colorBorderFocus} width={t.borderWidthFocus} />
    ) : null;

    const state = parent
      ? { expanded: isExpanded, ...(selectable === 'cell' ? { selected: cellSelected } : null) }
      : selectable === 'cell'
        ? { selected: cellSelected }
        : undefined;

    return (
      <Pressable
        key={column.key}
        testID="TreeGrid.rowHeader"
        role="rowheader"
        accessibilityLabel={label}
        accessibilityHint={editableHere ? COPY.editHint : undefined}
        accessibilityState={state}
        accessibilityActions={expandActions}
        onAccessibilityAction={expandActions !== undefined ? handleAction : undefined}
        onPress={activate}
        onLongPress={parent && editableHere ? () => startEdit(row, column) : undefined}
        onFocus={() => setFocusedCell(key)}
        onBlur={() => setFocusedCell((current) => (current === key ? null : current))}
        style={style}
      >
        {guideLines(level)}
        {level > 1 ? <View testID="TreeGrid.indent" style={{ width: (level - 1) * indent }} /> : null}
        <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: expandGap }}>
          {/* A real touch target, and hidden from assistive technology: the row header's actions are the screen-reader path. */}
          <View
            testID="TreeGrid.expandButton"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ width: expandButtonSize, minHeight: t.sizeTargetMin, alignItems: 'center', justifyContent: 'center' }}
          >
            {parent ? (
              <Button
                label={isExpanded ? COPY.collapse(name) : COPY.expand(name)}
                variant="ghost"
                size="sm"
                iconOnly
                expanded={isExpanded}
                leadingIcon={<Chevron expanded={isExpanded} color={t.colorActionGhostForeground} duration={transition} />}
                overrides={{ paddingInline: INSET_ZERO, paddingBlock: INSET_ZERO }}
                onPress={() => toggleExpand(row)}
              />
            ) : null}
          </View>
          <View testID="TreeGrid.cellContent" style={{ flexGrow: 1, flexShrink: 1, alignItems: JUSTIFY[column.align ?? 'start'] }}>
            {isEditing ? (
              <View testID="TreeGrid.editor" style={{ alignSelf: 'stretch' }}>
                {editorFor(row, column)}
              </View>
            ) : (
              cellValueNode(row, column, parent ? parentWeight : undefined)
            )}
          </View>
        </View>
        {ring}
      </Pressable>
    );
  };

  /** A `"lazy"` row's child while its children load: navigable, one level deeper, neither selectable nor editable. */
  const renderPlaceholder = (flat: FlatRow): React.JSX.Element => (
    <View
      testID="TreeGrid.row"
      role="row"
      accessibilityState={{ busy: true }}
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        height: rowHeight,
        backgroundColor: t.colorBackground,
        borderBottomWidth: gridLineWidth,
        borderBottomColor: gridLine,
      }}
    >
      {selectable === 'row' ? (
        <View style={[selectColumnStyle, { borderEndWidth: gridLineWidth, borderEndColor: gridLine }]} />
      ) : null}
      {columns.map((column) =>
        column === rowHeaderColumn ? (
          <View
            key={column.key}
            testID="TreeGrid.rowHeader"
            role="rowheader"
            accessibilityLabel={[COPY.loading, COPY.level(flat.level)].join(', ')}
            style={[cellFrame(column), { flexDirection: 'row', alignItems: 'center' }]}
          >
            {guideLines(flat.level)}
            {flat.level > 1 ? <View testID="TreeGrid.indent" style={{ width: (flat.level - 1) * indent }} /> : null}
            <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: expandGap }}>
              <View style={{ width: expandButtonSize }} />
              <View testID="TreeGrid.cellContent" style={{ flexGrow: 1, flexShrink: 1 }}>
                <Text size="sm" tone="muted" overrides={bodyText}>
                  {COPY.loading}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View key={column.key} testID="TreeGrid.cell" role="cell" style={cellFrame(column)} />
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
    // An indeterminate row is not selected.
    const rowSelected = selectable === 'row' && checkState === 'checked';
    const background = rowSelected ? t.colorBackgroundSubtle : t.colorBackground;
    const busy = row.children === 'lazy' && expandedSet.has(row.id);
    return (
      <View
        testID="TreeGrid.row"
        role="row"
        accessibilityState={selectable === 'row' ? { selected: rowSelected, busy } : busy ? { busy } : undefined}
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
        {selectable === 'row' ? (
          <View
            testID="TreeGrid.selectCell"
            role="cell"
            style={[
              selectColumnStyle,
              { backgroundColor: background, borderEndWidth: gridLineWidth, borderEndColor: gridLine },
              pinnedCellStyle(null),
            ]}
          >
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
        {columns.map((column) => (column === rowHeaderColumn ? renderRowHeader(item, column) : renderDataCell(row, column)))}
      </View>
    );
  };

  // ---- Layout ----

  const contentWidth = columns.reduce((sum, column) => sum + widthFor(column), selectable === 'row' ? selectColumnWidth : 0) + t.borderWidthFocus;
  const overflows = regionWidth !== null && contentWidth > regionWidth;
  const bounded = height !== 'content';
  const flexStyle: ViewStyle = { flexGrow: 1, flexShrink: 1 };

  const emptyState = (
    <View testID="TreeGrid.emptyState" style={{ paddingHorizontal: cellPaddingInline, minHeight: rowHeight, justifyContent: 'center' }}>
      <Text size="sm" tone="muted" overrides={bodyText}>
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
  const activeIndex = activeCell === null ? -1 : rows.findIndex((flat) => !flat.placeholder && flat.row.id === activeCell.rowId);

  const list = (
    <FlatList
      testID="TreeGrid.grid"
      role="grid"
      accessibilityLabel={caption}
      accessibilityState={{ busy: loading }}
      data={rows}
      extraData={[selectedIds, resolvedExpanded, openedByUser, activeSort, activeCell, focusedCell, editing, draft, editError, widths, scrolledX, density, loading]}
      keyExtractor={(flat) => flat.key}
      renderItem={renderRow}
      getItemLayout={(_items, index) => ({ length: rowHeight, offset: rowHeight * index, index })}
      ListHeaderComponent={headerRow}
      ListEmptyComponent={emptyState}
      stickyHeaderIndices={stickyHeader || bounded ? [0] : undefined}
      scrollEnabled={bounded}
      initialNumToRender={bounded ? undefined : rows.length}
      onScroll={(event) => setHeaderScrolled(event.nativeEvent.contentOffset.y > 0)}
      scrollEventThrottle={16} // literal-ok: one frame between the header shadow and the scroll position
      style={bounded ? flexStyle : undefined}
    />
  );

  return (
    <View
      ref={ref}
      testID="TreeGrid"
      accessibilityActions={[
        { name: 'expandAll', label: COPY.expandAll },
        { name: 'collapseAll', label: COPY.collapseAll },
      ]}
      onAccessibilityAction={handleRootAction}
      style={{
        backgroundColor: t.colorBackground,
        // `viewport` sizes the whole component; the scroll region takes what the caption and status bar leave.
        ...(height === 'viewport' ? { height: viewport.height - 2 * t.layoutGapSection } : null),
      }}
    >
      <View testID="TreeGrid.caption" style={hideCaption ? HIDDEN_STYLE : undefined}>
        <Heading level={captionLevel} size="md" overrides={{ fontSize: CAPTION_SIZE, fontWeight: CAPTION_WEIGHT, marginBlockEnd: CAPTION_GAP }}>
          {caption}
        </Heading>
      </View>
      <View
        testID="TreeGrid.container"
        style={{
          borderStartWidth: gridLineWidth,
          borderTopWidth: gridLineWidth,
          borderColor: gridLine,
          ...(height === 'viewport' ? flexStyle : height === 'fixed' ? { height: fixedHeight } : null),
        }}
      >
        <ScrollView
          testID="TreeGrid.scrollRegion"
          horizontal
          accessibilityHint={COPY.scrollHint}
          onScroll={(event) => setScrolledX(event.nativeEvent.contentOffset.x > 0)}
          scrollEventThrottle={16} // literal-ok: one frame between the pinned shadow and the scroll position
          onLayout={(event: LayoutChangeEvent) => setRegionWidth(event.nativeEvent.layout.width)}
          contentContainerStyle={{ minWidth: contentWidth, flexGrow: 1 }}
          style={bounded ? flexStyle : undefined}
        >
          <View style={[{ width: contentWidth }, bounded ? flexStyle : null]}>{list}</View>
        </ScrollView>
      </View>
      <View
        testID="TreeGrid.statusBar"
        style={
          showStatusBar
            ? { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space2, padding: t.space2, backgroundColor: t.colorBackgroundSubtle }
            : HIDDEN_STYLE
        }
      >
        {/* The live region: what a screen reader hears. Everything beside it is shown, never announced. */}
        <View role="status" accessibilityLiveRegion="polite">
          {editError !== undefined && !loading ? (
            <View style={{ backgroundColor: t.colorStatusDangerBackground }}>
              <TextForegroundContext.Provider value={t.colorStatusDangerForeground}>
                <Text size="xs" overrides={bodyText}>
                  {live}
                </Text>
              </TextForegroundContext.Provider>
            </View>
          ) : (
            <Text size="xs" tone="muted" overrides={bodyText}>
              {live}
            </Text>
          )}
        </View>
        {showStatusBar ? (
          <>
            <Text size="xs" tone="muted" overrides={bodyText}>
              {COPY.rowCount(total)}
            </Text>
            {selectable === 'row' && selectedIds.length > 0 ? (
              <Text size="xs" tone="muted" overrides={bodyText}>
                {COPY.selectedRows(selectedIds.length, total)}
              </Text>
            ) : null}
            {overflows && !scrolledX ? (
              <Text size="xs" tone="muted" overrides={bodyText}>
                {COPY.scrollHint}
              </Text>
            ) : null}
            {activeIndex >= 0 && activeCell !== null ? (
              <Text size="xs" tone="muted" overrides={bodyText}>
                {COPY.position(activeIndex + 1, columnByKey.get(activeCell.column)?.header ?? activeCell.column)}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}
