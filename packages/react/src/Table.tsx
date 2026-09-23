import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
} from 'react';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { FormContext } from './FormContext';
import { Heading } from './Heading';
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

/** A data row. `id` must be stable; it is what selection and keys use. */
export type TableRow = { id: string; [key: string]: unknown };

/** Sort state: the column key and its direction. */
export type TableSortState = { column: string; direction: TableSortDirection };

/** One column definition, in display order. */
export type TableColumn = {
  key: string;
  header: string;
  abbr?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  width?: TableColumnWidth;
  isRowHeader?: boolean;
  hideBelow?: TableColumnHideBelow;
  render?: (row: TableRow) => ReactNode;
};

/** copy.* — used verbatim. `sortToolbarLabel` and `cellLabel` belong to the native stacked form. */
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
  rowCount: { one: '{count} row', other: '{count} rows' },
} as const;

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

type TableOverrides = Partial<Record<TableOverridableBinding, TokenRef | undefined>>;

/** Root CSS hooks. The caption bindings are forwarded to the composed Heading's own overrides instead. */
const OVERRIDE_HOOK: Partial<Record<TableOverridableBinding, string>> = {
  headerWeight: '--ds-table-header-weight',
  headerSize: '--ds-table-header-size',
  headerBorder: '--ds-table-header-border',
  headerBorderWidth: '--ds-table-header-border-width',
  headerShadow: '--ds-table-header-shadow',
  rowBorder: '--ds-table-row-border',
  rowBorderWidth: '--ds-table-row-border-width',
  rowHover: '--ds-table-row-hover',
  cellPaddingInline: '--ds-table-cell-padding-inline',
  cellPaddingBlock: '--ds-table-cell-padding-block',
  cellGap: '--ds-table-cell-gap',
  stackedRowInset: '--ds-table-stacked-row-inset',
  stackedRowGap: '--ds-table-stacked-row-gap',
  stackedBlockGap: '--ds-table-stacked-block-gap',
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

function overridesToStyle(overrides: TableOverrides): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as TableOverridableBinding[]) {
    const hook = OVERRIDE_HOOK[binding];
    const ref = overrides[binding];
    if (hook && ref) style[hook] = cssVar(ref);
  }
  return style as CSSProperties;
}

declare const process: { env: { NODE_ENV?: string | undefined } };
const warned = new Set<string>();
function warnOnce(message: string): void {
  if (process.env.NODE_ENV !== 'production' && !warned.has(message)) {
    warned.add(message);
    console.warn(message);
  }
}

/** localeCompare (numeric) for strings, subtraction for numbers; missing values sort last. */
function compareValues(a: unknown, b: unknown): number {
  if (a === undefined || a === null) return b === undefined || b === null ? 0 : 1;
  if (b === undefined || b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function textOf(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function joinClasses(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

/**
 * The document language for plural selection; the runtime default when the page declares none.
 * Read through useSyncExternalStore so the server and the hydrating client both start from the
 * runtime default and the page's language is applied after mount.
 */
function subscribeNothing(): () => void {
  return () => undefined;
}
function readPageLocale(): string {
  return document.documentElement.lang;
}
function serverPageLocale(): string {
  return '';
}

/**
 * A press on a part wrapper that misses its composed control runs the control's own action, so the
 * part is the thing a test or assistive technology can press. A click on the control, or on a
 * label that already activates it, is left alone.
 */
function forwardPress(event: ReactMouseEvent<HTMLElement>, selector: string): void {
  const control = event.currentTarget.querySelector<HTMLElement>(selector);
  const target = event.target as Element;
  if (!control || control.contains(target) || target.closest('label')) return;
  control.click();
}

/**
 * A built length token in pixels. The arrow-key scroll step reads `space.10` from the stylesheet,
 * and a theme may build its space scale in either unit, so px and rem are both parsed.
 */
function lengthToPixels(value: string, element: Element): number {
  const text = value.trim();
  const amount = Number.parseFloat(text);
  if (!Number.isFinite(amount)) return Number.NaN;
  if (!text.endsWith('rem')) return amount;
  const root = Number.parseFloat(getComputedStyle(element.ownerDocument.documentElement).fontSize);
  return Number.isFinite(root) ? amount * root : Number.NaN;
}

export interface TableProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'style'> {
  /** What the table lists ("Open invoices"). Rendered as the caption and the accessible name; visually hidden with `hideCaption` when a Heading directly above already says it. */
  caption: string;
  /** Heading level of the caption in the page outline; its size is captionSize regardless. */
  captionLevel?: TableCaptionLevel | undefined;
  /** Content below the table: a row count, pagination, a total. Rendered in the `footer` part with the table's font: a string footer renders in Text with the `fontFamily`/`fontSize`/`lineHeight` bindings; other content brings its own typography. */
  footer?: ReactNode;
  /** Visually hide the caption; it remains the accessible name. */
  hideCaption?: boolean | undefined;
  /** Column definitions in display order. `header` is the visible heading; `align: end` for numbers; `sortable` adds the sort button; exactly one column may be `isRowHeader`; `hideBelow` drops a column below a layout width; `render` formats the cell. */
  columns: TableColumn[];
  /** The rows. `id` must be stable; it is what selection and keys use. */
  data: TableRow[];
  /** Controlled sort state. The table shows it; the caller sorts the data (so server-side sorting works the same way). */
  sort?: TableSortState | undefined;
  /** Initial sort for uncontrolled use; the table then sorts `data` itself by the column value (localeCompare for strings, numeric otherwise). */
  defaultSort?: TableSortState | undefined;
  /** Adds a first column of Checkboxes (radio-like behavior for `single`) and a select-all in the header for `multiple`. */
  selectable?: TableSelectable | undefined;
  /** Controlled selected row ids. */
  selected?: string[] | undefined;
  /** Initially selected ids. */
  defaultSelected?: string[] | undefined;
  /** Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally inside a labelled region with the row-header column sticky. */
  responsive?: TableResponsive | undefined;
  /** The header row stays visible while the body scrolls (the page, or `maxHeight`). */
  stickyHeader?: boolean | undefined;
  /** `viewport` caps the table at the viewport height minus two `layout.gap.section` and scrolls a frame around the table (the scroll region itself in `responsive: scroll`); `none` lets the page scroll. */
  maxHeight?: TableMaxHeight | undefined;
  /** Cell padding: layout.inset.sm or layout.inset.md. */
  density?: TableDensity | undefined;
  /** Alternate row backgrounds. Useful past about eight columns; borders are the default row separator. */
  striped?: boolean | undefined;
  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  emptyMessage?: string | undefined;
  /** Data is being fetched: aria-busy is set on the table and `copy.loading` shows — with no rows, in the emptyState; with rows, as muted Text in a polite live region below the table. Existing rows stay visible while re-sorting. */
  loading?: boolean | undefined;
  /** Renders a trailing actions cell: Buttons (ghost, sm, iconOnly with Tooltip) or a Menu. */
  rowActions?: ((row: TableRow) => ReactNode) | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: TableOverrides | undefined;
  /** Fired when a sortable header is activated (ascending → descending on the same column, ascending on a new one). */
  onSortChange?: ((column: string, direction: TableSortDirection) => void) | undefined;
  /** Fired with the new array of selected ids. */
  onSelectionChange?: ((selected: string[]) => void) | undefined;
  /** Fired when a row is activated, with its id. The row-header cell becomes a Button and the row is styled interactive. */
  onRowPress?: ((id: string) => void) | undefined;
}

/**
 * Table — Design Schema, category: data.
 *
 * When to use:
 * Use a Table for a list of records with three or more comparable fields: orders, invoices, members, inventory, results. Use `stack` (the default) when each row is a thing a person reads — a person, an order — and `scroll` when the columns are what matters — figures across months, a comparison. Add `sortable` to columns people compare by; `selectable: multiple` when bulk actions exist (put them in a Toolbar above the table that appears with the selection count). Put the row's identity in the `isRowHeader` column, usually as a Link to its detail page.
 */
export function Table({
  ref,
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
  ...rest
}: TableProps & { ref?: Ref<HTMLDivElement> | undefined }): ReactElement {
  const id = useId();
  const captionId = `${id}-caption`;
  const rowCountId = `${id}-row-count`;
  const scrollHintId = `${id}-scroll-hint`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const rowHeaderColumn = columns.find((column) => column.isRowHeader);
  const rowHeaderCount = columns.filter((column) => column.isRowHeader).length;
  if (rowHeaderCount > 1) warnOnce('Table: exactly one column may set `isRowHeader`; the first is used.');
  if (onRowPress && !rowHeaderColumn) warnOnce('Table: `onRowPress` needs an `isRowHeader` column; rows stay inert.');
  const rowsInteractive = Boolean(onRowPress && rowHeaderColumn && !rowHeaderColumn.render);

  /* Sort — controlled by `sort`, uncontrolled from `defaultSort`. */
  const [internalSort, setInternalSort] = useState<TableSortState | undefined>(defaultSort);
  const sortControlled = sort !== undefined;
  const activeSort = sortControlled ? sort : internalSort;
  const rows = useMemo(() => {
    if (sortControlled || !activeSort) return data;
    const factor = activeSort.direction === 'ascending' ? 1 : -1;
    return [...data].sort((a, b) => compareValues(a[activeSort.column], b[activeSort.column]) * factor);
  }, [data, sortControlled, activeSort]);

  const [announcement, setAnnouncement] = useState('');

  const activateSort = (column: TableColumn): void => {
    const direction: TableSortDirection =
      activeSort?.column === column.key && activeSort.direction === 'ascending' ? 'descending' : 'ascending';
    if (!sortControlled) setInternalSort({ column: column.key, direction });
    onSortChange?.(column.key, direction);
    setAnnouncement(COPY.sortedAnnouncement.replace('{column}', column.header).replace('{direction}', direction));
  };

  /* Selection — controlled by `selected`, uncontrolled from `defaultSelected`. */
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelected ?? []);
  const selectionControlled = selected !== undefined;
  const selectedIds = selectionControlled ? selected : internalSelected;
  const selectedSet = new Set(selectedIds);

  const commitSelection = (next: string[]): void => {
    if (!selectionControlled) setInternalSelected(next);
    onSelectionChange?.(next);
    setAnnouncement(
      COPY.selectedCount.replace('{count}', String(next.length)).replace('{total}', String(data.length)),
    );
  };

  const toggleRow = (rowId: string, checked: boolean): void => {
    if (selectable === 'single') commitSelection(checked ? [rowId] : []);
    else commitSelection(checked ? [...selectedIds.filter((x) => x !== rowId), rowId] : selectedIds.filter((x) => x !== rowId));
  };

  const allSelected = data.length > 0 && data.every((row) => selectedSet.has(row.id));
  const someSelected = !allSelected && data.some((row) => selectedSet.has(row.id));
  const toggleAll = (): void => commitSelection(allSelected ? [] : data.map((row) => row.id));

  /* Sticky header shadow: on once the sentinel above the table has scrolled out past the top of its root.
     In `responsive: scroll` the region is the sticky container, so the header sticks only with `maxHeight: viewport`. */
  const headerSticks = stickyHeader && (responsive !== 'scroll' || maxHeight === 'viewport');
  const [scrolledUnder, setScrolledUnder] = useState(false);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!headerSticks || !sentinel || typeof IntersectionObserver === 'undefined') {
      setScrolledUnder(false);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        const rootTop = entry.rootBounds?.top ?? 0;
        const next = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
        setScrolledUnder((current) => (current === next ? current : next));
      },
      { root: maxHeight === 'viewport' ? frameRef.current : null },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [headerSticks, maxHeight, responsive]);

  /* `responsive: scroll` — an edge fades only while columns are hidden past it; the sticky column casts its
     shadow once scrolled; arrow keys scroll by space.10. Writes only when an edge actually changes. */
  const [fadeStart, setFadeStart] = useState(false);
  const [fadeEnd, setFadeEnd] = useState(false);
  const measureEdges = (region: HTMLDivElement): void => {
    const hidden = region.scrollWidth - region.clientWidth;
    const offset = Math.abs(region.scrollLeft);
    // Both edges use the same 1px tolerance, so a sub-pixel scroll position never fades an edge
    // that has nothing hidden past it.
    const nextStart = offset >= 1;
    const nextEnd = hidden - offset >= 1;
    setFadeStart((current) => (current === nextStart ? current : nextStart));
    setFadeEnd((current) => (current === nextEnd ? current : nextEnd));
  };
  const onRegionScroll = (event: UIEvent<HTMLDivElement>): void => measureEdges(event.currentTarget);
  useEffect(() => {
    const region = frameRef.current;
    if (responsive !== 'scroll' || !region || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => measureEdges(region));
    observer.observe(region);
    const table = region.querySelector('table');
    if (table) observer.observe(table);
    return () => observer.disconnect();
  }, [responsive]);
  const onRegionKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const region = event.currentTarget;
    const step = lengthToPixels(getComputedStyle(region).getPropertyValue('--space-10'), region);
    if (!Number.isFinite(step)) return;
    event.preventDefault();
    region.scrollBy({ left: event.key === 'ArrowRight' ? step : -step });
  };

  /* Pointer convenience: a press anywhere on an interactive row that is not on its own control activates it.
     Keyboard and assistive technology use the row-header Button. */
  const onRowClick = (event: ReactMouseEvent<HTMLTableRowElement>, rowId: string): void => {
    if (!rowsInteractive) return;
    // A press in a selection cell toggles its Checkbox (forwardPress) and never also activates the row.
    const control = (event.target as Element).closest(
      'button, a, input, select, textarea, label, [tabindex], [data-part="selectCell"]',
    );
    if (control && event.currentTarget.contains(control)) return;
    onRowPress?.(rowId);
  };

  const columnCount = (selectable !== 'none' ? 1 : 0) + columns.length + (rowActions ? 1 : 0);
  const pageLocale = useSyncExternalStore(subscribeNothing, readPageLocale, serverPageLocale);
  const pluralForm = new Intl.PluralRules(pageLocale || undefined).select(data.length) === 'one' ? 'one' : 'other';
  const rowCountText = COPY.rowCount[pluralForm].replace('{count}', String(data.length));

  const cellClasses = (base: string, column: TableColumn): string =>
    joinClasses(
      base,
      column.align && column.align !== 'start' && `ds-table__cell--align-${column.align}`,
      column.width && column.width !== 'auto' && `ds-table__cell--width-${column.width}`,
      column.hideBelow && `ds-table__cell--hide-below-${column.hideBelow}`,
      column.isRowHeader && 'ds-table__cell--row-header',
    );

  const headerCell = (column: TableColumn): ReactElement => {
    const sorted = activeSort?.column === column.key ? activeSort.direction : undefined;
    const nextDirection = sorted === 'ascending' ? 'descending' : 'ascending';
    return (
      <th
        key={column.key}
        role="columnheader"
        scope="col"
        abbr={column.abbr}
        aria-sort={sorted}
        data-part="columnHeader"
        className={cellClasses('ds-table__column-header', column)}
      >
        {column.sortable ? (
          /* Button writes its own part hook, so the sortButton part is this wrapper around it. */
          <span data-part="sortButton" className="ds-table__sort" onClick={(event) => forwardPress(event, 'button')}>
            <Button
              variant="ghost"
              size="sm"
              label={column.header}
              accessibleName={(nextDirection === 'ascending' ? COPY.sortAscending : COPY.sortDescending).replace(
                '{column}',
                column.header,
              )}
              trailingIcon={sorted ? <Icon name={sorted === 'ascending' ? 'chevron-up' : 'chevron-down'} inline /> : undefined}
              overrides={{
                fontWeight: overrides?.headerWeight ?? 'font.weight.semibold',
                iconGap: overrides?.cellGap ?? 'layout.gap.tight',
              }}
              onClick={() => activateSort(column)}
            />
          </span>
        ) : (
          column.header
        )}
      </th>
    );
  };

  const bodyRow = (row: TableRow): ReactElement => {
    const isSelected = selectedSet.has(row.id);
    const name = rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;
    return (
      <tr
        key={row.id}
        role="row"
        aria-selected={selectable !== 'none' ? isSelected : undefined}
        data-part="row"
        className={joinClasses(
          'ds-table__row',
          isSelected && 'ds-table__row--selected',
          rowsInteractive && 'ds-table__row--interactive',
        )}
        onClick={rowsInteractive ? (event) => onRowClick(event, row.id) : undefined}
      >
        {selectable !== 'none' ? (
          <td
            role="cell"
            data-part="selectCell"
            className="ds-table__select"
            onClick={(event) => forwardPress(event, 'input')}
          >
            {/* Selection is not a form value: the Checkbox must not register with an enclosing Form. */}
            <FormContext value={null}>
              <Checkbox
                label={COPY.selectRow.replace('{rowName}', name)}
                hideLabel
                name={`${id}-select`}
                value={row.id}
                checked={isSelected}
                onChange={(checked) => toggleRow(row.id, checked)}
              />
            </FormContext>
          </td>
        ) : null}
        {columns.map((column) => {
          if (column === rowHeaderColumn) {
            return (
              <th key={column.key} role="rowheader" scope="row" data-part="rowHeader" className={cellClasses('ds-table__row-header', column)}>
                {rowsInteractive ? (
                  <Button variant="ghost" size="sm" label={name} onClick={() => onRowPress?.(row.id)} />
                ) : column.render ? (
                  column.render(row)
                ) : (
                  textOf(row[column.key])
                )}
              </th>
            );
          }
          return (
            <td key={column.key} role="cell" data-part="cell" data-label={column.header} className={cellClasses('ds-table__cell', column)}>
              {column.render ? column.render(row) : textOf(row[column.key])}
            </td>
          );
        })}
        {rowActions ? (
          <td role="cell" data-part="cell" data-label={COPY.actions} className="ds-table__cell ds-table__cell--actions">
            <div className="ds-table__actions">{rowActions(row)}</div>
          </td>
        ) : null}
      </tr>
    );
  };

  const table = (
    <table
      role="table"
      aria-labelledby={captionId}
      aria-describedby={rowCountId}
      aria-rowcount={data.length + 1}
      aria-colcount={columnCount}
      aria-busy={loading ? true : undefined}
      data-part="table"
      className="ds-table__table"
    >
      <thead role="rowgroup" data-part="header" className="ds-table__header">
        <tr role="row" data-part="headerRow" className="ds-table__header-row">
          {selectable === 'multiple' ? (
            <th
              role="columnheader"
              scope="col"
              data-part="selectAllCell"
              className="ds-table__select"
              onClick={(event) => forwardPress(event, 'input')}
            >
              <FormContext value={null}>
                <Checkbox
                  label={COPY.selectAll}
                  hideLabel
                  name={`${id}-select-all`}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </FormContext>
            </th>
          ) : selectable === 'single' ? (
            <td role="cell" className="ds-table__select" />
          ) : null}
          {columns.map(headerCell)}
          {rowActions ? (
            <th role="columnheader" scope="col" data-part="columnHeader" className="ds-table__column-header">
              <span className="ds-table__visually-hidden">{COPY.actions}</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody role="rowgroup" data-part="body" className="ds-table__body">
        {rows.length === 0 ? (
          <tr role="row" className="ds-table__row ds-table__row--empty">
            <td role="cell" colSpan={columnCount} className="ds-table__empty">
              <Text element="p" tone="muted" data-part="emptyState">
                {loading ? COPY.loading : (emptyMessage ?? COPY.empty)}
              </Text>
            </td>
          </tr>
        ) : (
          rows.map(bodyRow)
        )}
      </tbody>
    </table>
  );

  const frameClass = joinClasses('ds-table__frame', fadeStart && 'ds-table__frame--scrolled');
  const sentinel = <div ref={sentinelRef} aria-hidden="true" className="ds-table__sentinel" />;

  return (
    <div
      {...rest}
      ref={rootRef}
      data-ds="Table"
      data-part="container"
      className={joinClasses(
        'ds-table',
        `ds-table--${responsive}`,
        `ds-table--${density}`,
        `ds-table--max-height-${maxHeight}`,
        stickyHeader && 'ds-table--sticky-header',
        striped && 'ds-table--striped',
        scrolledUnder && 'ds-table--scrolled-under',
        hideCaption && 'ds-table--hide-caption',
      )}
      style={overrides ? overridesToStyle(overrides) : undefined}
    >
      {/* The caption part is the composed Heading itself — no wrapper — so `hideCaption` clips that
          element (from the root modifier, since Heading owns its own className) and sends space.0
          in place of captionGap, leaving no gap above the header. */}
      <Heading
        id={captionId}
        data-part="caption"
        level={captionLevel}
        size="md"
        overrides={{
          fontSize: overrides?.captionSize ?? 'font.size.md',
          fontWeight: overrides?.captionWeight ?? 'font.weight.semibold',
          marginBlockEnd: hideCaption ? 'space.0' : (overrides?.captionGap ?? 'space.2'),
        }}
      >
        {caption}
      </Heading>
      <span id={rowCountId} className="ds-table__visually-hidden">
        {rowCountText}
      </span>
      {responsive === 'scroll' ? (
        /* The fade is a mask, and a mask clips everything its element paints — the focus ring
           included. So the mask stays on the scrolling region and the ring is drawn by this
           unmasked wrapper around it, whole at a faded edge. */
        <div className="ds-table__scroll-outline">
          <div
            ref={frameRef}
            role="region"
            aria-labelledby={captionId}
            aria-describedby={scrollHintId}
            tabIndex={0}
            data-part="scrollRegion"
            className={joinClasses(
              frameClass,
              'ds-table__scroll-region',
              fadeStart && 'ds-table__scroll-region--fade-start',
              fadeEnd && 'ds-table__scroll-region--fade-end',
            )}
            onScroll={onRegionScroll}
            onKeyDown={onRegionKeyDown}
          >
            {sentinel}
            {table}
          </div>
        </div>
      ) : (
        <div ref={frameRef} className={frameClass}>
          {sentinel}
          {table}
        </div>
      )}
      {responsive === 'scroll' ? (
        <span id={scrollHintId} className="ds-table__visually-hidden">
          {COPY.scrollHint}
        </span>
      ) : null}
      <div aria-live="polite" className="ds-table__loading">
        {loading && rows.length > 0 ? (
          <Text element="p" tone="muted" size="sm">
            {COPY.loading}
          </Text>
        ) : null}
      </div>
      {footer !== undefined && footer !== null && footer !== false ? (
        <div data-part="footer" className="ds-table__footer">
          {typeof footer === 'string' ? (
            <Text
              element="p"
              overrides={{
                fontFamily: overrides?.fontFamily ?? 'font.family.body',
                fontSize: overrides?.fontSize ?? 'font.size.sm',
                lineHeight: overrides?.lineHeight ?? 'font.lineHeight.normal',
              }}
            >
              {footer}
            </Text>
          ) : (
            footer
          )}
        </div>
      ) : null}
      <div role="status" aria-live="polite" className="ds-table__visually-hidden">
        {announcement}
      </div>
    </div>
  );
}
