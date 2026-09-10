import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type UIEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { Text } from './Text';
import './Table.css';

export type TableSelectable = 'none' | 'single' | 'multiple';
export type TableResponsive = 'stack' | 'scroll';
export type TableMaxHeight = 'none' | 'viewport';
export type TableDensity = 'compact' | 'comfortable';
export type TableSortDirection = 'ascending' | 'descending';
export type TableColumnAlign = 'start' | 'end' | 'center';
export type TableColumnWidth = 'auto' | 'min' | 'fill';
export type TableColumnHideBelow = 'prose' | 'content';

/** A data row. `id` must be stable — selection and React keys use it. */
export type TableRow = { id: string; [key: string]: unknown };

/** Controlled or initial sort state; the caller sorts `data` for the controlled form. */
export interface TableSortState {
  column: string;
  direction: TableSortDirection;
}

/** One column definition, in display order. */
export interface TableColumn {
  key: string;
  header: string;
  abbr?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  width?: TableColumnWidth;
  isRowHeader?: boolean;
  hideBelow?: TableColumnHideBelow;
  render?: (row: TableRow) => ReactNode;
}

/** copy.* — used verbatim; placeholders are replaced with the running values. */
const COPY = {
  sortAscending: 'Sort by {column}, ascending',
  sortDescending: 'Sort by {column}, descending',
  sortedAnnouncement: 'Sorted by {column}, {direction}',
  selectAll: 'Select all rows',
  selectRow: 'Select {rowName}',
  selectedCount: '{count} of {total} selected',
  actions: 'Actions',
  empty: 'Nothing to show.',
  loading: 'Loading',
  scrollHint: 'Scroll sideways to see more columns',
  rowCount: '{count} rows',
};

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
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

const OVERRIDE_HOOK: Record<TableOverridableBinding, string> = {
  headerWeight: '--ds-table-header-weight',
  headerSize: '--ds-table-header-size',
  headerBorder: '--ds-table-header-border',
  headerBorderWidth: '--ds-table-header-border-width',
  headerShadow: '--ds-table-header-shadow',
  rowBorder: '--ds-table-row-border',
  rowBorderWidth: '--ds-table-row-border-width',
  rowHover: '--ds-table-row-hover',
  rowSelectedBorderWidth: '--ds-table-row-selected-border-width',
  cellPaddingInline: '--ds-table-cell-padding-inline',
  cellPaddingInlineCompact: '--ds-table-cell-padding-inline-compact',
  cellPaddingBlock: '--ds-table-cell-padding-block',
  cellGap: '--ds-table-cell-gap',
  captionSize: '--ds-table-caption-size',
  captionWeight: '--ds-table-caption-weight',
  captionGap: '--ds-table-caption-gap',
  stackedRowInset: '--ds-table-stacked-row-inset',
  stackedRowGap: '--ds-table-stacked-row-gap',
  stackedLabelSize: '--ds-table-stacked-label-size',
  stackedLabelWeight: '--ds-table-stacked-label-weight',
  stackedRowRadius: '--ds-table-stacked-row-radius',
  stickyColumnShadow: '--ds-table-sticky-column-shadow',
  scrollFade: '--ds-table-scroll-fade',
  fontFamily: '--ds-table-font-family', // literal-ok: CSS custom-property hook name, not a font stack
  fontSize: '--ds-table-font-size',
  lineHeight: '--ds-table-line-height',
  numericFont: '--ds-table-numeric-font', // literal-ok: CSS custom-property hook name, not a font stack
  transition: '--ds-table-transition',
};

function overridesToStyle(overrides: Partial<Record<TableOverridableBinding, TokenRef>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TableOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

/* Only declared when the bundler defines it; never assumed. */
declare const process: { env: Record<string, string | undefined> } | undefined;
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

/** jsdom (and older browsers) have no `matchMedia`; treat that as "no preference". */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/** localeCompare for strings, numeric subtraction otherwise — the uncontrolled-sort rule verbatim. */
function compareRowValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true });
}

function cellText(column: TableColumn, row: TableRow): ReactNode {
  if (column.render) return column.render(row);
  const value = row[column.key];
  return value === undefined || value === null ? '' : String(value);
}

/** Plain-text stand-in for the row header value, for aria-labels that need a string. A custom
 * `render` on the row-header column cannot be reduced to text, so this falls back to the raw value. */
function rowName(row: TableRow, rowHeaderColumn: TableColumn | undefined): string {
  if (!rowHeaderColumn) return row.id;
  const value = row[rowHeaderColumn.key];
  return value === undefined || value === null ? row.id : String(value);
}

function nextSortDirection(activeSort: TableSortState | undefined, columnKey: string): TableSortDirection {
  if (activeSort?.column === columnKey) return activeSort.direction === 'ascending' ? 'descending' : 'ascending';
  return 'ascending';
}

export interface TableProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the table lists ("Open invoices"). Rendered as the `<caption>` and the table's accessible name. */
  caption: string;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean;
  /** Column definitions in display order. Exactly one should set `isRowHeader`. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  sort?: TableSortState;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  defaultSort?: TableSortState;
  /** Adds a selection column: `single` (radio-like) or `multiple` (with select-all). */
  selectable?: TableSelectable;
  /** Controlled selected row ids. */
  selected?: string[];
  /** Initially selected ids. */
  defaultSelected?: string[];
  /** Below the prose width: `stack` turns rows into labelled blocks, `scroll` keeps columns and scrolls horizontally. */
  responsive?: TableResponsive;
  /** The header row stays visible while the body scrolls. */
  stickyHeader?: boolean;
  /** `viewport` caps the table at the viewport height and scrolls the body. */
  maxHeight?: TableMaxHeight;
  /** Cell padding: comfortable or compact. */
  density?: TableDensity;
  /** Alternate row backgrounds. */
  striped?: boolean;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string;
  /** Data is being fetched: the body shows `copy.loading` and `aria-busy` is set. Existing rows stay visible. */
  loading?: boolean;
  /** Renders a trailing actions cell for each row (Buttons or a Menu). */
  rowActions?: (row: TableRow) => ReactNode;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef>>;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: (sort: TableSortState) => void;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: (selected: string[]) => void;
  /** Fired when a row is activated, with its id. Only meaningful when the row has no other interactive content. */
  onRowPress?: (id: string) => void;
}

/**
 * Table — Design Schema, category: data.
 *
 * When to use:
 * Use a Table for a list of records with three or more comparable fields: orders, invoices,
 * members, inventory, results. Use `stack` (the default) when each row is a thing a person reads —
 * a person, an order — and `scroll` when the columns are what matters — figures across months, a
 * comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions
 * exist (put them in a Toolbar above the table that appears with the selection count). Put the
 * row's identity in the `isRowHeader` column, usually as a Link to its detail page.
 */
export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  {
    caption,
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
    className,
    style,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const baseId = `ds-table${generatedId}`;
  const captionId = `${baseId}-caption`;
  const rowCountId = `${baseId}-row-count`;
  const scrollHintId = `${baseId}-scroll-hint`;
  const sortLiveId = `${baseId}-sort-live`;
  const selectionLiveId = `${baseId}-selection-live`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);

  const rowHeaderColumn = useMemo(() => columns.find((column) => column.isRowHeader), [columns]);

  if (isDev) {
    const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
    if (rowHeaderCount !== 1) {
      console.warn(`Table: exactly one column should set \`isRowHeader\`; found ${rowHeaderCount}.`);
    }
  }

  const isSortControlled = sort !== undefined;
  const [internalSort, setInternalSort] = useState<TableSortState | undefined>(defaultSort);
  const activeSort = isSortControlled ? sort : internalSort;

  const [sortAnnouncement, setSortAnnouncement] = useState('');
  const [selectionAnnouncement, setSelectionAnnouncement] = useState('');

  const sortedData = useMemo(() => {
    if (isSortControlled || !activeSort) return data;
    const column = activeSort.column;
    const factor = activeSort.direction === 'ascending' ? 1 : -1;
    return [...data].sort((a, b) => compareRowValues(a[column], b[column]) * factor);
  }, [data, isSortControlled, activeSort]);

  const handleSort = (column: TableColumn) => {
    const direction = nextSortDirection(activeSort, column.key);
    const next: TableSortState = { column: column.key, direction };
    if (!isSortControlled) setInternalSort(next);
    onSortChange?.(next);
    setSortAnnouncement(COPY.sortedAnnouncement.replace('{column}', column.header).replace('{direction}', direction));
  };

  const isSelectionControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = isSelectionControlled ? (selected as string[]) : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitSelection = (next: string[]) => {
    if (!isSelectionControlled) setInternalSelected(next);
    onSelectionChange?.(next);
    setSelectionAnnouncement(COPY.selectedCount.replace('{count}', String(next.length)).replace('{total}', String(sortedData.length)));
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    if (selectable === 'single') {
      commitSelection(checked ? [id] : []);
      return;
    }
    commitSelection(checked ? [...selectedIds, id] : selectedIds.filter((existing) => existing !== id));
  };

  const allIds = useMemo(() => sortedData.map((row) => row.id), [sortedData]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = !allSelected && allIds.some((id) => selectedSet.has(id));
  const handleToggleAll = () => commitSelection(allSelected ? [] : allIds);

  const handleRowPress = (row: TableRow) => onRowPress?.(row.id);

  // Sticky-header shadow: shown once the sentinel placed just above the table scrolls out of view.
  const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
  useEffect(() => {
    if (!stickyHeader) return undefined;
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledUnderHeader(!entry.isIntersecting),
      { root: maxHeight === 'viewport' ? rootRef.current : null, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyHeader, maxHeight]);

  // Sticky-column shadow (`responsive: scroll`) and the arrow-key horizontal scroll.
  const [scrolledHorizontally, setScrolledHorizontally] = useState(false);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => setScrolledHorizontally(event.currentTarget.scrollLeft > 0);
  const handleScrollKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const el = event.currentTarget;
    const step = Math.max(el.clientWidth * 0.8, 1);
    el.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const totalColumnCount = (selectable !== 'none' ? 1 : 0) + columns.length + (rowActions ? 1 : 0);

  const classes = [
    'ds-table',
    `ds-table--${responsive}`,
    `ds-table--density-${density}`,
    stickyHeader ? 'ds-table--sticky-header' : null,
    maxHeight === 'viewport' ? 'ds-table--max-height-viewport' : null,
    striped ? 'ds-table--striped' : null,
    scrolledUnderHeader ? 'ds-table--scrolled-under-header' : null,
    className ?? null,
  ]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  const alignClass = (column: TableColumn) => `ds-table__cell--align-${column.align ?? 'start'}`;

  const renderColumnHeaderContent = (column: TableColumn) => {
    if (!column.sortable) return column.header;
    const hintId = `${baseId}-sort-hint-${column.key}`;
    const sorted = activeSort?.column === column.key;
    const sortIconName = sorted ? (activeSort?.direction === 'ascending' ? 'chevron-up' : 'chevron-down') : undefined;
    return (
      <span className="ds-table__sort">
        <Button
          variant="ghost"
          size="sm"
          label={column.header}
          trailingIcon={sortIconName ? <Icon name={sortIconName} inline /> : undefined}
          aria-describedby={hintId}
          data-part="sortButton"
          onClick={() => handleSort(column)}
        />
        <span id={hintId} className="ds-table__visually-hidden">
          {(nextSortDirection(activeSort, column.key) === 'ascending' ? COPY.sortAscending : COPY.sortDescending).replace(
            '{column}',
            column.header,
          )}
        </span>
      </span>
    );
  };

  const renderRow = (row: TableRow) => {
    const isSelected = selectedSet.has(row.id);
    const interactive = Boolean(onRowPress);
    const trClasses = [
      'ds-table__tr',
      interactive ? 'ds-table__tr--interactive' : null,
      isSelected ? 'ds-table__tr--selected' : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <tr key={row.id} className={trClasses} data-part="row" aria-selected={selectable !== 'none' ? (isSelected ? 'true' : 'false') : undefined}>
        {selectable !== 'none' ? (
          <td className="ds-table__td ds-table__td--select" data-part="selectCell">
            <Checkbox
              label={COPY.selectRow.replace('{rowName}', rowName(row, rowHeaderColumn))}
              name={`${baseId}-select-${row.id}`}
              checked={isSelected}
              onChange={(checked) => handleToggleRow(row.id, checked)}
            />
          </td>
        ) : null}
        {columns.map((column) => {
          const sharedProps = {
            key: column.key,
            className: ['ds-table__cell', alignClass(column)].join(' '),
            'data-hide-below': column.hideBelow,
          } as const;
          if (column.isRowHeader) {
            return (
              <th scope="row" {...sharedProps} data-part="rowHeader">
                {interactive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    label={rowName(row, rowHeaderColumn)}
                    className="ds-table__row-button"
                    onClick={() => handleRowPress(row)}
                  />
                ) : (
                  cellText(column, row)
                )}
              </th>
            );
          }
          return (
            <td {...sharedProps} data-part="cell" data-label={column.header}>
              {cellText(column, row)}
            </td>
          );
        })}
        {rowActions ? (
          <td className="ds-table__td ds-table__td--actions" data-part="cell" data-label={COPY.actions}>
            {rowActions(row)}
          </td>
        ) : null}
      </tr>
    );
  };

  const tableElement = (
    <table
      className="ds-table__table"
      data-part="table"
      role="table"
      aria-rowcount={sortedData.length + 1}
      aria-colcount={totalColumnCount}
      aria-busy={loading ? 'true' : undefined}
      aria-describedby={rowCountId}
    >
      <caption
        id={captionId}
        data-part="caption"
        className={hideCaption ? 'ds-table__visually-hidden' : 'ds-table__caption'}
      >
        {caption}
      </caption>
      <thead className="ds-table__thead" data-part="header">
        <tr className="ds-table__tr ds-table__tr--header" data-part="headerRow">
          {selectable === 'multiple' ? (
            <th scope="col" className="ds-table__th ds-table__th--select" data-part="selectAllCell">
              <Checkbox
                label={COPY.selectAll}
                name={`${baseId}-select-all`}
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleAll}
              />
            </th>
          ) : selectable === 'single' ? (
            <th scope="col" className="ds-table__th ds-table__th--select" aria-hidden="true" />
          ) : null}
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              abbr={column.abbr}
              aria-sort={activeSort?.column === column.key ? activeSort.direction : undefined}
              data-hide-below={column.hideBelow}
              data-part="columnHeader"
              className={['ds-table__th', alignClass(column)].join(' ')}
            >
              {renderColumnHeaderContent(column)}
            </th>
          ))}
          {rowActions ? (
            <th scope="col" className="ds-table__th ds-table__th--actions" data-part="columnHeader">
              <span className="ds-table__visually-hidden">{COPY.actions}</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="ds-table__tbody" data-part="body">
        {sortedData.length === 0 ? (
          <tr className="ds-table__tr">
            <td colSpan={totalColumnCount} className="ds-table__empty" data-part="emptyState">
              <Text element="p" tone="muted">
                {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
              </Text>
            </td>
          </tr>
        ) : (
          sortedData.map((row) => renderRow(row))
        )}
      </tbody>
    </table>
  );

  return (
    <div {...rest} ref={rootRef} data-ds="Table" data-part="container" className={classes} style={mergedStyle}>
      <div ref={sentinelRef} aria-hidden="true" className="ds-table__sentinel" />
      {responsive === 'scroll' ? (
        <div
          ref={scrollRegionRef}
          className={['ds-table__scroll-region', scrolledHorizontally ? 'ds-table__scroll-region--scrolled' : null]
            .filter(Boolean)
            .join(' ')}
          data-part="scrollRegion"
          role="region"
          aria-labelledby={captionId}
          aria-describedby={scrollHintId}
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={handleScrollKeyDown}
        >
          <span id={scrollHintId} className="ds-table__visually-hidden">
            {COPY.scrollHint}
          </span>
          {tableElement}
        </div>
      ) : (
        tableElement
      )}
      <span id={rowCountId} className="ds-table__visually-hidden">
        {COPY.rowCount.replace('{count}', String(sortedData.length))}
      </span>
      <div id={sortLiveId} className="ds-table__visually-hidden" role="status" aria-live="polite">
        {sortAnnouncement}
      </div>
      <div id={selectionLiveId} className="ds-table__visually-hidden" role="status" aria-live="polite">
        {selectionAnnouncement}
      </div>
    </div>
  );
});
