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
import { Heading, type HeadingOverridableBinding } from './Heading';
import { Icon } from './Icon';
import { Text } from './Text';
import './Table.css';

export type TableCaptionLevel = '2' | '3' | '4' | 2 | 3 | 4;
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

/** `captionSize`/`captionWeight` are forwarded to the composed caption Heading's own overrides
 * (it already owns `fontSize`/`fontWeight`); every other binding is a root CSS hook. */
const ROOT_OVERRIDE_HOOK: Partial<Record<TableOverridableBinding, string>> = {
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

function overridesToStyle(overrides: Partial<Record<TableOverridableBinding, TokenRef>>): {
  rootStyle: CSSProperties;
  captionOverrides: Partial<Record<HeadingOverridableBinding, TokenRef>>;
} {
  const rootStyle: Record<string, string> = {};
  const captionOverrides: Partial<Record<HeadingOverridableBinding, TokenRef>> = { marginBlockEnd: 'space.0' };
  for (const binding of Object.keys(overrides) as TableOverridableBinding[]) {
    const ref = overrides[binding];
    if (!ref) continue;
    const hook = ROOT_OVERRIDE_HOOK[binding];
    if (hook) {
      rootStyle[hook] = cssVar(ref);
    } else if (binding === 'captionSize') {
      captionOverrides.fontSize = ref;
    } else if (binding === 'captionWeight') {
      captionOverrides.fontWeight = ref;
    }
  }
  return { rootStyle: rootStyle as CSSProperties, captionOverrides };
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

/** localeCompare for strings, numeric otherwise — the uncontrolled-sort rule verbatim. */
function compareRowValues(a: unknown, b: unknown): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, undefined, { numeric: true });
  return Number(a) - Number(b);
}

function cellContent(column: TableColumn, row: TableRow): ReactNode {
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

/** The sort Button's visible label doubles as the action description ("Sort by Amount, ascending"). */
function sortButtonLabel(column: TableColumn, activeSort: TableSortState | undefined): string {
  const next = nextSortDirection(activeSort, column.key);
  const template = next === 'ascending' ? COPY.sortAscending : COPY.sortDescending;
  return template.replace('{column}', column.header);
}

function hideBelowClass(column: TableColumn): string | null {
  return column.hideBelow ? `ds-table__cell--hide-below-${column.hideBelow}` : null;
}

function alignClass(column: TableColumn): string | null {
  return column.align === 'end' ? 'ds-table__cell--align-end' : column.align === 'center' ? 'ds-table__cell--align-center' : null;
}

export interface TableProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the table lists ("Open invoices"). Rendered as the `<caption>` and the table's accessible name. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  captionLevel?: TableCaptionLevel;
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
  /** Content below the table (pagination, a summary row). The schema names a `footer` anatomy part
   * without further contract; this is its React slot. */
  footer?: ReactNode;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<TableOverridableBinding, TokenRef>>;
  /** Fired when a sortable header is activated, with the new sort state. */
  onSortChange?: (sort: TableSortState) => void;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: (selected: string[]) => void;
  /** Fired when a row is activated, with its id. Only when the row-header column has no custom `render`. */
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
    captionLevel = '2',
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
    footer,
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

  const [liveMessage, setLiveMessage] = useState('');

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
    setLiveMessage(COPY.sortedAnnouncement.replace('{column}', column.header).replace('{direction}', direction));
  };

  const isSelectionControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectedIds = isSelectionControlled ? (selected as string[]) : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const commitSelection = (next: string[]) => {
    if (!isSelectionControlled) setInternalSelected(next);
    onSelectionChange?.(next);
    setLiveMessage(COPY.selectedCount.replace('{count}', String(next.length)).replace('{total}', String(sortedData.length)));
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

  // Sticky-header shadow: shown once the sentinel placed just above the table scrolls out of view.
  const [scrolledUnderHeader, setScrolledUnderHeader] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!stickyHeader || !sentinel || typeof IntersectionObserver === 'undefined') {
      setScrolledUnderHeader(false);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setScrolledUnderHeader(!entry.isIntersecting), {
      root: maxHeight === 'viewport' ? rootRef.current : null,
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stickyHeader, maxHeight]);

  // Sticky-column shadow (`responsive: scroll`) and the arrow-key horizontal scroll.
  const [scrolledHorizontally, setScrolledHorizontally] = useState(false);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => setScrolledHorizontally(event.currentTarget.scrollLeft > 0);
  const handleScrollKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const region = scrollRegionRef.current;
    if (!region) return;
    event.preventDefault();
    const step = 40; // Horizontal distance per key press; not specified further by the doc.
    region.scrollBy({ left: event.key === 'ArrowRight' ? step : -step, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
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

  const { rootStyle, captionOverrides } = overrides
    ? overridesToStyle(overrides)
    : { rootStyle: undefined, captionOverrides: { marginBlockEnd: 'space.0' } as Partial<Record<HeadingOverridableBinding, TokenRef>> };
  const mergedStyle = rootStyle || style ? { ...rootStyle, ...style } : undefined;

  const renderColumnHeaderContent = (column: TableColumn) => {
    if (!column.sortable) return column.header;
    const sorted = activeSort?.column === column.key;
    const direction = sorted ? activeSort?.direction : undefined;
    return (
      <Button
        variant="ghost"
        size="sm"
        label={sortButtonLabel(column, activeSort)}
        trailingIcon={<Icon name={direction === 'descending' ? 'chevron-down' : 'chevron-up'} inline />}
        className="ds-table__sort-button"
        data-part="sortButton"
        onClick={() => handleSort(column)}
      />
    );
  };

  const renderRow = (row: TableRow) => {
    const isSelected = selectedSet.has(row.id);
    const interactive = Boolean(onRowPress) && Boolean(rowHeaderColumn) && !rowHeaderColumn?.render;
    const trClasses = [
      'ds-table__tr',
      interactive ? 'ds-table__tr--interactive' : null,
      isSelected ? 'ds-table__tr--selected' : null,
    ]
      .filter(Boolean)
      .join(' ');
    const name = rowName(row, rowHeaderColumn);

    return (
      <tr
        key={row.id}
        role="row"
        className={trClasses}
        data-part="row"
        aria-selected={selectable !== 'none' ? (isSelected ? 'true' : 'false') : undefined}
      >
        {selectable !== 'none' ? (
          <td role="cell" className="ds-table__td ds-table__td--select" data-part="selectCell">
            <Checkbox
              label={COPY.selectRow.replace('{rowName}', name)}
              name={`${baseId}-select-${row.id}`}
              checked={isSelected}
              onChange={(checked) => handleToggleRow(row.id, checked)}
            />
          </td>
        ) : null}
        {columns.map((column) => {
          const classes = ['ds-table__cell', alignClass(column), hideBelowClass(column)].filter(Boolean).join(' ');
          if (column.isRowHeader) {
            return (
              <th key={column.key} scope="row" role="rowheader" className={classes} data-part="rowHeader">
                {interactive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    label={name}
                    className="ds-table__row-button"
                    onClick={() => onRowPress?.(row.id)}
                  />
                ) : (
                  cellContent(column, row)
                )}
              </th>
            );
          }
          return (
            <td key={column.key} role="cell" className={classes} data-part="cell" data-label={column.header}>
              {cellContent(column, row)}
            </td>
          );
        })}
        {rowActions ? (
          <td role="cell" className="ds-table__td ds-table__td--actions" data-part="cell" data-label={COPY.actions}>
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
      <caption id={captionId} data-part="caption" className={hideCaption ? 'ds-table__visually-hidden' : 'ds-table__caption'}>
        <Heading level={captionLevel} size="md" overrides={captionOverrides}>
          {caption}
        </Heading>
      </caption>
      <colgroup>
        {selectable !== 'none' ? <col style={{ inlineSize: 'var(--size-target-min)' }} /> : null}
        {columns.map((column) => (
          <col
            key={column.key}
            style={column.width === 'min' ? { inlineSize: '1%' } : column.width === 'fill' ? { inlineSize: '100%' } : undefined}
          />
        ))}
        {rowActions ? <col /> : null}
      </colgroup>
      <thead className="ds-table__thead" role="rowgroup" data-part="header">
        <tr role="row" className="ds-table__tr ds-table__tr--header" data-part="headerRow">
          {selectable === 'multiple' ? (
            <th scope="col" role="columnheader" className="ds-table__th ds-table__th--select" data-part="selectAllCell">
              <Checkbox
                label={COPY.selectAll}
                name={`${baseId}-select-all`}
                checked={allSelected}
                indeterminate={someSelected}
                onChange={handleToggleAll}
              />
            </th>
          ) : selectable === 'single' ? (
            <th scope="col" role="columnheader" className="ds-table__th ds-table__th--select" data-part="selectAllCell" />
          ) : null}
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              role="columnheader"
              abbr={column.abbr}
              aria-sort={column.sortable ? (activeSort?.column === column.key ? activeSort.direction : 'none') : undefined}
              data-part="columnHeader"
              className={['ds-table__th', alignClass(column), hideBelowClass(column)].filter(Boolean).join(' ')}
            >
              {renderColumnHeaderContent(column)}
            </th>
          ))}
          {rowActions ? (
            <th scope="col" role="columnheader" className="ds-table__th ds-table__th--actions" data-part="columnHeader">
              <span className="ds-table__visually-hidden">{COPY.actions}</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="ds-table__tbody" role="rowgroup" data-part="body">
        {sortedData.length === 0 ? (
          <tr role="row" className="ds-table__tr">
            <td role="cell" colSpan={totalColumnCount} className="ds-table__empty">
              <Text element="p" tone="muted" data-part="emptyState">
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
      <span id={rowCountId} className="ds-table__visually-hidden">
        {COPY.rowCount.replace('{count}', String(sortedData.length))}
      </span>
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
          {tableElement}
          <span id={scrollHintId} className="ds-table__visually-hidden">
            {COPY.scrollHint}
          </span>
        </div>
      ) : (
        tableElement
      )}
      {footer !== undefined ? (
        <div className="ds-table__footer" data-part="footer">
          {footer}
        </div>
      ) : null}
      <div className="ds-table__visually-hidden" role="status" aria-live="polite">
        {liveMessage}
      </div>
    </div>
  );
});
