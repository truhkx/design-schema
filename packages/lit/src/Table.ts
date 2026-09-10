import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Checkbox.js';
import './Icon.js';
import './Text.js';
import type { CheckboxChangeDetail } from './Checkbox.js';

/** A single record. `id` must be stable across renders; it is what selection and keys use. */
export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export type TableColumnAlign = 'start' | 'end' | 'center';
export type TableColumnWidth = 'auto' | 'min' | 'fill';
export type TableColumnHideBelow = 'prose' | 'content';

/** A column definition. Exactly one column in `columns` should set `isRowHeader`. */
export interface TableColumn {
  key: string;
  header: string;
  abbr?: string;
  align?: TableColumnAlign;
  sortable?: boolean;
  width?: TableColumnWidth;
  isRowHeader?: boolean;
  hideBelow?: TableColumnHideBelow;
  /** Formats the cell. Lit templates (never raw HTML). Omitted on the row-header column enables the built-in row Button that fires `row-press`. */
  render?: (row: TableRow) => unknown;
}

export type TableSortDirection = 'ascending' | 'descending';

export interface TableSort {
  column: string;
  direction: TableSortDirection;
}

export type TableSelectable = 'none' | 'single' | 'multiple';
export type TableResponsive = 'stack' | 'scroll';
export type TableMaxHeight = 'none' | 'viewport';
export type TableDensity = 'compact' | 'comfortable';

/** Detail carried by the `sort-change` CustomEvent. */
export interface TableSortChangeDetail {
  column: string;
  direction: TableSortDirection;
}

/** Detail carried by the `selection-change` CustomEvent. */
export interface TableSelectionChangeDetail {
  selected: string[];
}

/** Detail carried by the `row-press` CustomEvent. */
export interface TableRowPressDetail {
  id: string;
}

/* copy.* — used verbatim */
const COPY_SORT_ASCENDING = (column: string): string => `Sort by ${column}, ascending`;
const COPY_SORT_DESCENDING = (column: string): string => `Sort by ${column}, descending`;
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: TableSortDirection): string =>
  `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_COUNT = (count: number, total: number): string => `${count} of ${total} selected`;
const COPY_ACTIONS = 'Actions';
const COPY_EMPTY = 'Nothing to show.';
const COPY_LOADING = 'Loading';
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';
const COPY_ROW_COUNT = (count: number): string => `${count} rows`;

/** layout.maxWidth.prose / layout.maxWidth.content: `@container` conditions cannot read custom properties, so the
    built breakpoints are duplicated here as literals. literal-ok: breakpoint from layout.maxWidth.* */
const PROSE_BREAKPOINT_PX = 572;
const CONTENT_BREAKPOINT_PX = 960;

/** Horizontal distance covered by one ArrowLeft/ArrowRight press in the scroll region. Not specified by the doc. */
const SCROLL_STEP_PX = 40;

/** Negates a boolean attribute: `no-sticky-header` present means `stickyHeader` is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `surface`, `headerSurface`, `headerColor`, `rowStripe`,
    `rowSelected`, `rowSelectedBorder`, `cellColor`, `cellMutedColor`, `stackedLabelColor`, `minTarget`, `focusRing`
    and `focusRingWidth` are locked and excluded. */
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

const HOOKS: Record<TableOverridableBinding, string> = {
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
  fontFamily: '--ds-table-font-family',
  fontSize: '--ds-table-font-size',
  lineHeight: '--ds-table-line-height',
  numericFont: '--ds-table-numeric-font',
  transition: '--ds-table-transition',
};

/**
 * `<ds-table>` — Table (category: data, APG pattern: table).
 *
 * `<ds-table caption="Open invoices" .columns=${columns} .data=${rows}>` builds
 * a native `<table>` inside its shadow root from the `columns`/`data`
 * properties — rows are never slotted, since crossing the shadow boundary
 * would break table semantics. Every role is stated explicitly
 * (`role="table"`, `"rowgroup"`, `"row"`, `"columnheader"`, `"rowheader"`,
 * `"cell"`) because CSS that changes `display` — which both responsive modes
 * do — strips the implicit native table roles. Sorting and selection can be
 * controlled (`sort`/`selected`) or uncontrolled (`defaultSort`/`defaultSelected`,
 * with the table sorting `data` itself); either way the table only ever
 * fires `sort-change`/`selection-change`, composed and bubbling.
 *
 * ## When to use
 *
 * Use a Table for a list of records with three or more comparable fields.
 * Use `responsive: "stack"` (the default) when each row is a thing a person
 * reads, and `responsive: "scroll"` when the columns themselves are what
 * matters. Add `sortable` to columns people compare by; `selectable: "multiple"`
 * when bulk actions exist. Put the row's identity in the `isRowHeader` column.
 *
 * @fires sort-change - Fired when a sortable header is activated, with `{ column, direction }`.
 * @fires selection-change - Fired with `{ selected }`, the new array of selected row ids.
 * @fires row-press - Fired when a row is activated (its `isRowHeader` column has no `render`), with `{ id }`.
 * @csspart container - The wrapper around the table (anatomy: container).
 * @csspart scroll-region - The focusable, horizontally-scrolling region (`responsive: "scroll"` only; anatomy: scrollRegion).
 * @csspart table - The native `<table>` (anatomy: table).
 * @csspart caption - The `<caption>` (anatomy: caption).
 * @csspart header - The `<thead>` (anatomy: header).
 * @csspart header-row - The header `<tr>` (anatomy: headerRow).
 * @csspart column-header - Each `<th>` in the header row (anatomy: columnHeader).
 * @csspart sort-button - The composed `<ds-button>` inside a sortable header (anatomy: sortButton).
 * @csspart select-all-cell - The header's select-all `<th>` (anatomy: selectAllCell).
 * @csspart body - The `<tbody>` (anatomy: body).
 * @csspart row - Each body `<tr>` (anatomy: row).
 * @csspart row-header - The row's `<th scope="row">` (anatomy: rowHeader).
 * @csspart select-cell - A row's selection `<td>` (anatomy: selectCell).
 * @csspart cell - A body `<td>` (anatomy: cell).
 * @csspart empty-state - The composed `<ds-text>` shown when `data` is empty (anatomy: emptyState).
 * @csspart footer - The slot below the table (anatomy: footer).
 * @slot footer - Content below the table (pagination, a summary row). No styling contract is defined for it in the schema.
 */
@customElement('ds-table')
export class DsTable extends LitElement {
  static override styles = css`
    :host {
      display: block;
      container-type: inline-size;
      font-family: var(--ds-table-font-family);
      font-size: var(--ds-table-font-size);
      line-height: var(--ds-table-line-height);
      /* cellColor: color.foreground, locked */
      color: var(--color-foreground);
      --ds-table-header-weight: var(--font-weight-semibold);
      --ds-table-header-size: var(--font-size-sm);
      --ds-table-header-border: var(--color-border-strong);
      --ds-table-header-border-width: var(--border-width-thin);
      --ds-table-header-shadow: var(--shadow-raised);
      --ds-table-row-border: var(--color-border);
      --ds-table-row-border-width: var(--border-width-thin);
      --ds-table-row-hover: var(--color-action-ghost-background-hover);
      --ds-table-row-selected-border-width: var(--border-width-focus);
      --ds-table-cell-padding-inline: var(--layout-inset-md);
      --ds-table-cell-padding-inline-compact: var(--layout-inset-sm);
      --ds-table-cell-padding-block: var(--space-sm);
      --ds-table-cell-gap: var(--layout-gap-tight);
      --ds-table-caption-size: var(--font-size-md);
      --ds-table-caption-weight: var(--font-weight-semibold);
      --ds-table-caption-gap: var(--space-2);
      --ds-table-stacked-row-inset: var(--layout-inset-md);
      --ds-table-stacked-row-gap: var(--layout-gap-tight);
      --ds-table-stacked-label-size: var(--font-size-xs);
      --ds-table-stacked-label-weight: var(--font-weight-medium);
      --ds-table-stacked-row-radius: var(--radius-md);
      --ds-table-sticky-column-shadow: var(--shadow-raised);
      --ds-table-scroll-fade: var(--space-6);
      --ds-table-font-family: var(--font-family-body);
      --ds-table-font-size: var(--font-size-sm);
      --ds-table-line-height: var(--font-line-height-normal);
      --ds-table-numeric-font: var(--font-family-mono);
      --ds-table-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .wrapper {
      position: relative;
    }

    .sentinel {
      block-size: 1px;
    }

    :host([max-height='viewport']) .wrapper {
      overflow-y: auto;
      /* the section rhythm on both ends, not specified further by the doc */
      max-block-size: calc(100vh - var(--layout-gap-section) * 2);
    }

    .scroll-region {
      overflow-x: auto;
      scrollbar-width: none;
      /* mask-image alpha channel: opaque/transparent stops, not a color. literal-ok: mask alpha marker, not a color */
      mask-image: linear-gradient(
        to right,
        transparent,
        black var(--ds-table-scroll-fade),
        black calc(100% - var(--ds-table-scroll-fade)),
        transparent
      ); /* literal-ok: mask alpha marker, not a color */
    }
    .scroll-region::-webkit-scrollbar {
      display: none;
    }
    .scroll-region:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      /* surface: color.background, locked */
      background: var(--color-background);
    }

    caption {
      padding-block-end: var(--ds-table-caption-gap);
      text-align: start;
    }

    th,
    td {
      box-sizing: border-box;
      padding-inline: var(--ds-table-cell-padding-inline);
      padding-block: var(--ds-table-cell-padding-block);
      border-block-end: var(--ds-table-row-border-width) solid var(--ds-table-row-border);
      text-align: start;
      vertical-align: middle;
    }

    :host([density='compact']) th,
    :host([density='compact']) td {
      padding-inline: var(--ds-table-cell-padding-inline-compact);
    }

    thead th {
      /* headerSurface / headerColor: locked */
      background: var(--color-background-subtle);
      color: var(--color-foreground);
      font-weight: var(--ds-table-header-weight);
      font-size: var(--ds-table-header-size);
      border-block-end: var(--ds-table-header-border-width) solid var(--ds-table-header-border);
    }

    :host(:not([no-sticky-header])) thead th {
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
    }

    :host(:not([no-sticky-header])[data-header-scrolled]) thead th {
      box-shadow: var(--ds-table-header-shadow);
    }

    :host([responsive='scroll']) tbody th[scope='row'] {
      position: sticky;
      inset-inline-start: 0;
      background: var(--color-background);
      z-index: 1;
    }

    :host([responsive='scroll'][data-column-scrolled]) tbody th[scope='row'] {
      box-shadow: var(--ds-table-sticky-column-shadow);
    }

    :host([striped]) tbody tr:nth-child(even) td,
    :host([striped]) tbody tr:nth-child(even) th[scope='row'] {
      /* rowStripe: color.background.subtle, locked */
      background: var(--color-background-subtle);
    }

    tbody tr[aria-selected='true'] td,
    tbody tr[aria-selected='true'] th[scope='row'] {
      /* rowSelected: color.background.subtle, locked, same tint as a stripe */
      background: var(--color-background-subtle);
    }

    tbody tr[aria-selected='true'] th[scope='row'] {
      /* rowSelectedBorder: color.control.selectedBackground, locked; a start-edge bar, not color-fill alone */
      box-shadow: inset var(--ds-table-row-selected-border-width) 0 0 0 var(--color-control-selected-background);
    }

    tbody tr.interactive {
      cursor: pointer;
      transition: background-color var(--ds-table-transition) var(--motion-easing-standard);
    }
    tbody tr.interactive:hover td,
    tbody tr.interactive:hover th[scope='row'] {
      background: var(--ds-table-row-hover);
    }
    @media (prefers-reduced-motion: reduce) {
      tbody tr.interactive {
        transition: none;
      }
    }

    .row-header-button {
      display: inline;
    }

    .sort-button {
      --ds-button-padding-inline: 0;
      --ds-button-padding-block: 0;
    }

    .align-end {
      text-align: end;
      font-family: var(--ds-table-numeric-font);
      font-variant-numeric: tabular-nums;
    }
    .align-center {
      text-align: center;
    }

    .cell-muted {
      /* cellMutedColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    .empty-cell {
      padding-block: var(--ds-table-stacked-row-inset);
      text-align: center;
    }

    /* focusRing / focusRingWidth: locked */
    th :focus-visible,
    td :focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* stackedLabel is drawn from a ::before, with no separate part hook */
    @container (max-width: ${unsafeCSS(CONTENT_BREAKPOINT_PX)}px) {
      th.hide-below-content,
      td.hide-below-content {
        display: none;
      }
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT_PX)}px) {
      th.hide-below-prose,
      td.hide-below-prose {
        display: none;
      }

      :host([responsive='stack']) thead {
        position: absolute;
        inline-size: 1px;
        block-size: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
        border: 0;
      }

      :host([responsive='stack']) tbody tr {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--ds-table-stacked-row-gap);
        padding: var(--ds-table-stacked-row-inset);
        border: var(--ds-table-row-border-width) solid var(--ds-table-row-border);
        border-radius: var(--ds-table-stacked-row-radius);
      }

      :host([responsive='stack']) tbody th,
      :host([responsive='stack']) tbody td {
        display: block;
        padding: 0;
        border: 0;
        box-shadow: none;
      }

      :host([responsive='stack']) tbody td[data-label]::before {
        content: attr(data-label);
        display: block;
        /* stackedLabelColor: color.foreground.muted, locked */
        color: var(--color-foreground-muted);
        font-size: var(--ds-table-stacked-label-size);
        font-weight: var(--ds-table-stacked-label-weight);
      }
    }

    .footer {
      padding-block-start: var(--ds-table-cell-gap);
    }
    .footer:empty {
      display: none;
    }
  `;

  /** What the table lists ("Open invoices"). Rendered as the `<caption>` and the accessible name. */
  @property() caption!: string;

  /** Visually hides the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) hideCaption = false;

  /** Column definitions in display order. A property, not an attribute. */
  @property({ attribute: false }) columns: TableColumn[] = [];

  /** The rows. `id` must be stable. A property, not an attribute. */
  @property({ attribute: false }) data: TableRow[] = [];

  /** Controlled sort state. When set, the table shows it but never sorts `data` itself. */
  @property({ attribute: false }) sort?: TableSort;

  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  @property({ attribute: false }) defaultSort?: TableSort;

  /** Adds a selection column: a Checkbox per row (radio-like for `single`) and, for `multiple`, a select-all in the header. */
  @property({ reflect: true }) selectable: TableSelectable = 'none';

  /** Controlled selected row ids. */
  @property({ attribute: false }) selected?: string[];

  /** Initially selected ids, for uncontrolled use. */
  @property({ attribute: false }) defaultSelected: string[] = [];

  /** `stack` turns each row into a labelled block below the prose width; `scroll` keeps columns and scrolls horizontally. */
  @property({ reflect: true }) responsive: TableResponsive = 'stack';

  /** The header row stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  stickyHeader = true;

  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  @property({ reflect: true, attribute: 'max-height' }) maxHeight: TableMaxHeight = 'none';

  /** Cell padding. */
  @property({ reflect: true }) density: TableDensity = 'comfortable';

  /** Alternate row backgrounds. */
  @property({ type: Boolean, reflect: true }) striped = false;

  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) emptyMessage?: string;

  /** Data is being fetched: the body shows `copy.loading` and `aria-busy` is set. Existing rows stay visible. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Renders a trailing actions cell per row. Kept out of `columns` so the header can be a visually-hidden "Actions". */
  @property({ attribute: false }) rowActions?: (row: TableRow) => unknown;

  /** Per-instance style overrides: `{ captionSize: 'font.size.lg' }`. Locked bindings are ignored. */
  @property({ attribute: false }) overrides?: Partial<Record<TableOverridableBinding, TokenRef>>;

  /** Uncontrolled sort state, seeded from `defaultSort`. */
  @state() private internalSort?: TableSort;

  /** Uncontrolled selection, seeded from `defaultSelected`. */
  @state() private internalSelected: string[] = [];

  /** Text announced through the shared live region (sort or selection changes). */
  @state() private liveMessage = '';

  @query('.sentinel') private readonly sentinelEl?: HTMLElement;
  @query('.wrapper') private readonly wrapperEl?: HTMLElement;
  @query('.scroll-region') private readonly scrollRegionEl?: HTMLElement;

  private headerObserver?: IntersectionObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Table');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.headerObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    this.internalSort = this.defaultSort;
    this.internalSelected = this.defaultSelected;
    this.setupHeaderObserver();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has('stickyHeader') || changed.has('maxHeight')) {
      this.setupHeaderObserver();
    }
    this.warnInDev();
  }

  protected override render() {
    const rows = this.sortedRows();
    const colCount = this.columns.length + (this.selectable !== 'none' ? 1 : 0) + (this.rowActions ? 1 : 0);

    const tableTpl = html`
      <table
        part="table"
        role="table"
        aria-describedby="row-count"
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
        aria-rowcount=${rows.length + 1}
        aria-colcount=${colCount}
      >
        <caption id="caption" part="caption" class=${this.hideCaption ? 'visually-hidden' : ''}>
          <ds-heading
            part="caption-heading"
            level="2"
            .overrides=${{ fontSize: 'font.size.md', fontWeight: 'font.weight.semibold', marginBlockEnd: 'space.0' } as const}
            >${this.caption}</ds-heading
          >
        </caption>
        ${this.renderColgroup()}
        <thead part="header" role="rowgroup">
          <tr part="header-row" role="row">
            ${this.renderSelectionHeaderCell(rows)} ${this.columns.map((column) => this.renderColumnHeader(column))}
            ${this.rowActions
              ? html`<th role="columnheader" scope="col" class="visually-hidden">${COPY_ACTIONS}</th>`
              : nothing}
          </tr>
        </thead>
        <tbody part="body" role="rowgroup">
          ${rows.length === 0 ? this.renderEmptyRow(colCount) : rows.map((row) => this.renderRow(row))}
        </tbody>
      </table>
    `;

    return html`
      <div class="wrapper" part="container">
        <div class="sentinel"></div>
        <span id="row-count" class="visually-hidden">${COPY_ROW_COUNT(rows.length)}</span>
        ${this.responsive === 'scroll'
          ? html`
              <div
                class="scroll-region"
                part="scroll-region"
                role="region"
                aria-labelledby="caption"
                aria-describedby="scroll-hint"
                tabindex="0"
                @keydown=${this.handleScrollKeydown}
                @scroll=${this.handleScroll}
              >
                ${tableTpl}
                <span id="scroll-hint" class="visually-hidden">${COPY_SCROLL_HINT}</span>
              </div>
            `
          : tableTpl}
        <div class="footer" part="footer"><slot name="footer"></slot></div>
      </div>
      <div class="visually-hidden" role="status" aria-live="polite">${this.liveMessage}</div>
    `;
  }

  private renderColgroup() {
    return html`
      <colgroup>
        ${this.selectable !== 'none' ? html`<col style="inline-size: var(--size-target-min)" />` : nothing}
        ${this.columns.map(
          (column) =>
            html`<col
              style=${column.width === 'min' ? 'inline-size: 1%' : column.width === 'fill' ? 'inline-size: 100%' : ''}
            />`,
        )}
        ${this.rowActions ? html`<col />` : nothing}
      </colgroup>
    `;
  }

  private renderSelectionHeaderCell(rows: TableRow[]) {
    if (this.selectable === 'none') {
      return nothing;
    }
    if (this.selectable === 'single') {
      return html`<th role="columnheader" scope="col" part="select-all-cell">
        <span class="visually-hidden">${COPY_SELECT_ALL}</span>
      </th>`;
    }
    const selected = this.currentSelected();
    const allSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));
    const someSelected = !allSelected && rows.some((row) => selected.includes(row.id));
    return html`<th role="columnheader" scope="col" part="select-all-cell">
      <ds-checkbox
        label=${COPY_SELECT_ALL}
        .checked=${allSelected}
        .indeterminate=${someSelected}
        @change=${this.handleSelectAllChange}
      ></ds-checkbox>
    </th>`;
  }

  private renderColumnHeader(column: TableColumn) {
    const currentSort = this.currentSort();
    const direction = currentSort?.column === column.key ? currentSort.direction : undefined;
    const hideBelow = column.hideBelow ? `hide-below-${column.hideBelow}` : '';
    const align = column.align ? `align-${column.align === 'start' ? 'start' : column.align}` : '';
    return html`
      <th
        role="columnheader"
        scope="col"
        part="column-header"
        class=${classMap({ [hideBelow]: Boolean(hideBelow), [align]: Boolean(align) })}
        abbr=${ifDefined(column.abbr)}
        aria-sort=${ifDefined(column.sortable ? (direction ?? 'none') : undefined)}
      >
        ${column.sortable
          ? html`<ds-button
              class="sort-button"
              part="sort-button"
              variant="ghost"
              size="sm"
              label=${this.sortButtonLabel(column, direction)}
              @press=${(event: Event) => this.handleSort(event, column.key)}
            >
              <ds-icon
                slot="trailing-icon"
                name=${direction === 'descending' ? 'chevron-down' : 'chevron-up'}
                inline
              ></ds-icon>
            </ds-button>`
          : column.header}
      </th>
    `;
  }

  private renderEmptyRow(colCount: number) {
    const message = this.data.length === 0 && this.loading ? COPY_LOADING : (this.emptyMessage ?? COPY_EMPTY);
    return html`
      <tr role="row">
        <td role="cell" class="empty-cell" colspan=${colCount}>
          <ds-text part="empty-state" tone="muted">${message}</ds-text>
        </td>
      </tr>
    `;
  }

  private renderRow(row: TableRow) {
    const rowHeaderColumn = this.columns.find((column) => column.isRowHeader);
    const rowPressEnabled = Boolean(rowHeaderColumn) && rowHeaderColumn?.render === undefined;
    const selected = this.selectable !== 'none' ? this.currentSelected().includes(row.id) : false;
    const rowName = rowHeaderColumn ? String(row[rowHeaderColumn.key] ?? row.id) : row.id;

    return html`
      <tr
        part="row"
        role="row"
        class=${classMap({ interactive: rowPressEnabled })}
        aria-selected=${ifDefined(this.selectable !== 'none' ? String(selected) : undefined)}
      >
        ${this.renderSelectionCell(row, rowName, selected)}
        ${this.columns.map((column) => this.renderCell(column, row, rowName, rowPressEnabled))}
        ${this.rowActions ? html`<td role="cell" part="cell">${this.rowActions(row)}</td>` : nothing}
      </tr>
    `;
  }

  private renderSelectionCell(row: TableRow, rowName: string, selected: boolean) {
    if (this.selectable === 'none') {
      return nothing;
    }
    return html`<td role="cell" part="select-cell">
      <ds-checkbox
        label=${COPY_SELECT_ROW(rowName)}
        .checked=${selected}
        @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectRow(event, row.id)}
      ></ds-checkbox>
    </td>`;
  }

  private renderCell(column: TableColumn, row: TableRow, rowName: string, rowPressEnabled: boolean) {
    const hideBelow = column.hideBelow ? `hide-below-${column.hideBelow}` : '';
    const align = column.align ? `align-${column.align === 'start' ? 'start' : column.align}` : '';
    const content = column.render ? column.render(row) : String(row[column.key] ?? '');

    if (column.isRowHeader) {
      return html`
        <th
          role="rowheader"
          scope="row"
          part="row-header"
          class=${classMap({ [hideBelow]: Boolean(hideBelow), [align]: Boolean(align) })}
        >
          ${rowPressEnabled
            ? html`<ds-button
                class="row-header-button"
                variant="ghost"
                size="sm"
                label=${rowName}
                @press=${(event: Event) => this.handlePress(event, row.id)}
              ></ds-button>`
            : content}
        </th>
      `;
    }

    return html`
      <td
        role="cell"
        part="cell"
        class=${classMap({ [hideBelow]: Boolean(hideBelow), [align]: Boolean(align) })}
        data-label=${column.header}
      >
        ${content}
      </td>
    `;
  }

  private sortButtonLabel(column: TableColumn, direction: TableSortDirection | undefined): string {
    const next = direction === 'ascending' ? 'descending' : 'ascending';
    return next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header);
  }

  private currentSort(): TableSort | undefined {
    return this.sort ?? this.internalSort;
  }

  private currentSelected(): string[] {
    return this.selected ?? this.internalSelected;
  }

  /** Sorted for uncontrolled use only; a controlled `sort` means the caller already sorted `data`. */
  private sortedRows(): TableRow[] {
    if (this.sort !== undefined) {
      return this.data;
    }
    const state = this.internalSort;
    if (!state) {
      return this.data;
    }
    const factor = state.direction === 'ascending' ? 1 : -1;
    return [...this.data].sort((a, b) => {
      const left = a[state.column];
      const right = b[state.column];
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right, undefined, { numeric: true }) * factor;
      }
      return (Number(left) - Number(right)) * factor;
    });
  }

  private handleSort(event: Event, column: string): void {
    // The inner ds-button is internal; consumers see only sort-change.
    event.stopPropagation();
    const current = this.currentSort();
    const direction: TableSortDirection =
      current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending';
    const next: TableSort = { column, direction };
    if (this.sort === undefined) {
      this.internalSort = next;
    }
    const columnDef = this.columns.find((c) => c.key === column);
    this.liveMessage = COPY_SORTED_ANNOUNCEMENT(columnDef?.header ?? column, direction);
    this.dispatchEvent(
      new CustomEvent<TableSortChangeDetail>('sort-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private handleSelectAllChange(event: CustomEvent<CheckboxChangeDetail>): void {
    event.stopPropagation();
    const rows = this.sortedRows();
    const next = event.detail.checked ? rows.map((row) => row.id) : [];
    this.commitSelection(next);
  }

  private handleSelectRow(event: CustomEvent<CheckboxChangeDetail>, id: string): void {
    event.stopPropagation();
    const checked = event.detail.checked;
    let next: string[];
    if (this.selectable === 'single') {
      next = checked ? [id] : [];
    } else {
      const current = this.currentSelected();
      next = checked ? [...current, id] : current.filter((existing) => existing !== id);
    }
    this.commitSelection(next);
  }

  private commitSelection(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelected = next;
    }
    this.liveMessage = COPY_SELECTED_COUNT(next.length, this.data.length);
    this.dispatchEvent(
      new CustomEvent<TableSelectionChangeDetail>('selection-change', {
        detail: { selected: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handlePress(event: Event, id: string): void {
    // The inner ds-button is internal; consumers see only row-press.
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<TableRowPressDetail>('row-press', { detail: { id }, bubbles: true, composed: true }),
    );
  }

  private handleScrollKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }
    const region = this.scrollRegionEl;
    if (!region) {
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? SCROLL_STEP_PX : -SCROLL_STEP_PX;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    region.scrollBy({ left: delta, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  private handleScroll(): void {
    const region = this.scrollRegionEl;
    if (!region) {
      return;
    }
    this.toggleAttribute('data-column-scrolled', region.scrollLeft > 0);
  }

  /** Toggles `data-header-scrolled` once the body has scrolled beneath the sticky header. */
  private setupHeaderObserver(): void {
    this.headerObserver?.disconnect();
    this.headerObserver = undefined;
    if (!this.stickyHeader || !this.sentinelEl) {
      this.removeAttribute('data-header-scrolled');
      return;
    }
    const root = this.maxHeight === 'viewport' ? (this.wrapperEl ?? null) : null;
    this.headerObserver = new IntersectionObserver(
      ([entry]) => {
        this.toggleAttribute('data-header-scrolled', !entry.isIntersecting);
      },
      { root, threshold: 0 },
    );
    this.headerObserver.observe(this.sentinelEl);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TableOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      const hook = HOOKS[binding];
      if (ref === undefined) {
        this.style.removeProperty(hook);
      } else {
        this.style.setProperty(hook, cssVar(ref));
      }
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.caption) {
      console.warn('<ds-table> requires a `caption`.', this);
    }
    if (this.columns.length > 0 && !this.columns.some((column) => column.isRowHeader)) {
      console.warn('<ds-table> has no column with `isRowHeader: true`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-table': DsTable;
  }
}
