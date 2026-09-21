import { LitElement, css, html, nothing, unsafeCSS, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Checkbox.js';
import './Icon.js';
import './Text.js';
import type { CheckboxChangeDetail } from './Checkbox.js';

/** A single record. `id` must be stable; it is what selection and keys use. */
export interface TableRow {
  id: string;
  [key: string]: unknown;
}

export type TableColumnAlign = 'start' | 'end' | 'center';
export type TableColumnWidth = 'auto' | 'min' | 'fill';
export type TableColumnHideBelow = 'prose' | 'content';

/** A column definition, in display order. Exactly one column may set `isRowHeader`. */
export interface TableColumn {
  key: string;
  header: string;
  abbr?: string | undefined;
  align?: TableColumnAlign | undefined;
  sortable?: boolean | undefined;
  width?: TableColumnWidth | undefined;
  isRowHeader?: boolean | undefined;
  hideBelow?: TableColumnHideBelow | undefined;
  /** Formats the cell as a lit template (a `ds-text`, `ds-link`, `ds-meter` or `ds-button`), never raw HTML. */
  render?: ((row: TableRow) => unknown) | undefined;
}

export type TableSortDirection = 'ascending' | 'descending';

export interface TableSort {
  column: string;
  direction: TableSortDirection;
}

export type TableCaptionLevel = '2' | '3' | '4';
export type TableSelectable = 'none' | 'single' | 'multiple';
export type TableResponsive = 'stack' | 'scroll';
export type TableMaxHeight = 'none' | 'viewport';
export type TableDensity = 'compact' | 'comfortable';

/** Detail of the `sort-change` event. */
export interface TableSortChangeDetail {
  column: string;
  direction: TableSortDirection;
}

/** Detail of the `selection-change` event. */
export interface TableSelectionChangeDetail {
  selected: string[];
}

/** Detail of the `row-press` event. */
export interface TableRowPressDetail {
  id: string;
}

/* copy.* — verbatim */
const COPY_SORT_ASCENDING = (column: string): string => `Sort by ${column}, ascending`;
const COPY_SORT_DESCENDING = (column: string): string => `Sort by ${column}, descending`;
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: string): string => `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_COUNT = (count: number, total: number): string => `${count} of ${total} selected`;
const COPY_ACTIONS = 'Actions';
const COPY_EMPTY = 'Nothing to show.';
const COPY_LOADING = 'Loading';
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';
const COPY_ROW_COUNT: Record<'one' | 'other', (count: number) => string> = {
  one: (count) => `${count} row`,
  other: (count) => `${count} rows`,
};

/** layout.maxWidth.prose / layout.maxWidth.content from the built token JSON: `@container` conditions cannot read
    custom properties. literal-ok: breakpoint from layout.maxWidth.* */
const PROSE_BREAKPOINT = 572;
const CONTENT_BREAKPOINT = 960;

/** `stickyHeader` defaults to true, so it is exposed as the negated `no-sticky-header` attribute. */
const NEGATED_BOOLEAN = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable bindings; the locked ones (surface, header surface/color, stripe, selection, cell colors, stacked
    label color, target size, focus ring) are excluded. */
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

const HOOKS: Record<TableOverridableBinding, string> = {
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
  captionSize: '--ds-table-caption-size',
  captionWeight: '--ds-table-caption-weight',
  captionGap: '--ds-table-caption-gap',
  stackedRowInset: '--ds-table-stacked-row-inset',
  stackedRowGap: '--ds-table-stacked-row-gap',
  stackedBlockGap: '--ds-table-stacked-block-gap',
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

function textOf(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/** Uncontrolled sort: `localeCompare` (numeric) for strings, subtraction for numbers. */
function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return textOf(left).localeCompare(textOf(right), undefined, { numeric: true });
}

/**
 * `<ds-table>` — Table (category: data, APG pattern: table).
 *
 * `<ds-table caption="Open invoices" .columns=${columns} .data=${rows}>` builds a native `<table>` inside its
 * shadow root from the properties; rows are never slotted. Every table role is stated explicitly, because both
 * responsive layouts change `display` and browsers then drop the implicit roles. The caption is a composed
 * `ds-heading` above the table that names it through `aria-labelledby`.
 *
 * Sort and selection are controlled (`sort`, `selected`) or uncontrolled (`defaultSort`, `defaultSelected`); the
 * table fires `sort-change` and `selection-change` in both modes. Rows become interactive (the row header turns
 * into a Button) only with the `pressable-rows` attribute.
 *
 * @fires sort-change - A sortable header was activated: `{ column, direction }`.
 * @fires selection-change - The selection changed: `{ selected }`.
 * @fires row-press - A row was activated: `{ id }`.
 * @slot footer - Content below the table: a row count, pagination, a total.
 */
@customElement('ds-table')
export class DsTable extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      --ds-table-header-weight: var(--font-weight-semibold);
      --ds-table-header-size: var(--font-size-sm);
      --ds-table-header-border: var(--color-border-strong);
      --ds-table-header-border-width: var(--border-width-thin);
      --ds-table-header-shadow: var(--shadow-raised);
      --ds-table-row-border: var(--color-border);
      --ds-table-row-border-width: var(--border-width-thin);
      --ds-table-row-hover: var(--color-action-ghost-background-hover);
      --ds-table-cell-padding-inline: var(--layout-inset-md);
      --ds-table-cell-padding-block: var(--space-sm);
      --ds-table-cell-gap: var(--layout-gap-tight);
      --ds-table-caption-size: var(--font-size-md);
      --ds-table-caption-weight: var(--font-weight-semibold);
      --ds-table-caption-gap: var(--space-2);
      --ds-table-stacked-row-inset: var(--layout-inset-md);
      --ds-table-stacked-row-gap: var(--layout-gap-tight);
      --ds-table-stacked-block-gap: var(--layout-gap-tight);
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

      display: block;
      container-type: inline-size;
      font-family: var(--ds-table-font-family);
      font-size: var(--ds-table-font-size);
      line-height: var(--ds-table-line-height);
      /* cellColor: color.foreground (locked) */
      color: var(--color-foreground);
    }

    /* cellPaddingInline by density */
    :host([density='compact']) {
      --ds-table-cell-padding-inline: var(--layout-inset-sm);
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

    .frame {
      position: relative;
    }

    :host([max-height='viewport']) .frame {
      overflow-y: auto;
      /* the viewport height minus two layout.gap.section */
      max-block-size: calc(100vh - 2 * var(--layout-gap-section));
    }

    .sentinel {
      block-size: 0;
    }

    [data-part='scrollRegion'] {
      overflow-x: auto;
    }

    /* scrollFade: an edge fades only while columns are hidden past it */
    :host([data-fade-left]) [data-part='scrollRegion'] {
      mask-image: linear-gradient(to right, transparent, black var(--ds-table-scroll-fade)); /* literal-ok: mask alpha stops, not a rendered color */
    }
    :host([data-fade-right]) [data-part='scrollRegion'] {
      mask-image: linear-gradient(to left, transparent, black var(--ds-table-scroll-fade)); /* literal-ok: mask alpha stops, not a rendered color */
    }
    :host([data-fade-left][data-fade-right]) [data-part='scrollRegion'] {
      mask-image: linear-gradient(to right, transparent, black var(--ds-table-scroll-fade), black calc(100% - var(--ds-table-scroll-fade)), transparent); /* literal-ok: mask alpha stops, not a rendered color */
    }

    /* focusRing / focusRingWidth (locked). The ring is drawn on the wrapper, which the mask
       above does not cover, so it stays whole at a faded edge. */
    .region {
      position: relative;
    }
    .region:has([data-part='scrollRegion']:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }
    [data-part='scrollRegion']:focus-visible {
      outline: none;
    }

    table {
      inline-size: 100%;
      border-collapse: collapse;
      /* surface: color.background (locked) */
      background: var(--color-background);
    }

    th,
    td {
      box-sizing: border-box;
      padding-inline: var(--ds-table-cell-padding-inline);
      padding-block: var(--ds-table-cell-padding-block);
      text-align: start;
      vertical-align: middle;
      font-weight: inherit;
    }

    [data-part='columnHeader'],
    [data-part='selectAllCell'],
    .header-select {
      /* headerSurface / headerColor (locked) */
      background: var(--color-background-subtle);
      color: var(--color-foreground);
      font-weight: var(--ds-table-header-weight);
      font-size: var(--ds-table-header-size);
      border-block-end: var(--ds-table-header-border-width) solid var(--ds-table-header-border);
    }

    :host(:not([no-sticky-header])) thead th,
    :host(:not([no-sticky-header])) thead td {
      position: sticky;
      inset-block-start: 0;
      z-index: 2;
    }

    :host(:not([no-sticky-header])[data-header-scrolled]) thead th,
    :host(:not([no-sticky-header])[data-header-scrolled]) thead td {
      box-shadow: var(--ds-table-header-shadow);
    }

    [data-part='row'] {
      background: var(--color-background);
    }

    [data-part='row'] > th,
    [data-part='row'] > td {
      color: var(--color-foreground);
      border-block-end: var(--ds-table-row-border-width) solid var(--ds-table-row-border);
    }

    /* rowStripe (locked) */
    :host([striped]) [data-part='row']:nth-child(even) {
      background: var(--color-background-subtle);
    }

    /* rowSelected (locked): the same tint as a stripe */
    [data-part='row'][aria-selected='true'] {
      background: var(--color-background-subtle);
    }

    /* rowSelectedBorder / rowSelectedBorderWidth (locked): a start-edge bar, so selection is not fill alone */
    [data-part='row'][aria-selected='true'] > :first-child {
      box-shadow: inset var(--border-width-focus) 0 0 0 var(--color-control-selected-background);
    }
    [data-part='row'][aria-selected='true'] > :first-child:dir(rtl) {
      box-shadow: inset calc(-1 * var(--border-width-focus)) 0 0 0 var(--color-control-selected-background);
    }

    /* rowHover: interactive rows only. A render function's output cannot be inspected, so a
       Link in the row-header cell is found with :has() — hover alone there, with neither the
       pointer cursor nor the row press that pressable rows get. */
    [data-part='row'].interactive,
    [data-part='row']:has([data-part='rowHeader'] ds-link) {
      transition: background-color var(--ds-table-transition) var(--motion-easing-standard);
    }
    [data-part='row'].interactive {
      cursor: pointer;
    }
    [data-part='row'].interactive:hover,
    [data-part='row']:has([data-part='rowHeader'] ds-link):hover {
      background: var(--ds-table-row-hover);
    }
    @media (prefers-reduced-motion: reduce) {
      [data-part='row'].interactive,
      [data-part='row']:has([data-part='rowHeader'] ds-link) {
        transition: none;
      }
    }

    [data-part='selectCell'],
    [data-part='selectAllCell'],
    .header-select {
      /* minTarget (locked) */
      inline-size: var(--size-target-min);
    }

    .align-end {
      text-align: end;
    }
    .align-center {
      text-align: center;
    }
    /* numericFont: body cells of align-end columns, the row header included; never the header row */
    tbody .align-end {
      font-family: var(--ds-table-numeric-font);
      font-variant-numeric: tabular-nums;
    }
    .width-min {
      inline-size: 1%;
      white-space: nowrap;
    }
    .width-fill {
      inline-size: 100%;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: var(--ds-table-cell-gap);
    }

    .empty {
      text-align: center;
    }

    :host([responsive='scroll']) [data-part='rowHeader'] {
      position: sticky;
      inset-inline-start: 0;
      z-index: 1;
      background: inherit;
    }
    :host([responsive='scroll'][data-column-scrolled]) [data-part='rowHeader'] {
      box-shadow: var(--ds-table-sticky-column-shadow);
    }

    .footer {
      font: inherit;
    }

    /* hideBelow applies to responsive: stack only; scrolling tables keep every column */
    @container (max-width: ${unsafeCSS(CONTENT_BREAKPOINT)}px) {
      :host([responsive='stack']) .hide-below-content {
        display: none;
      }
    }

    @container (max-width: ${unsafeCSS(PROSE_BREAKPOINT)}px) {
      :host([responsive='stack']) .hide-below-prose {
        display: none;
      }

      :host([responsive='stack']) thead {
        display: block;
      }
      :host([responsive='stack']:not([no-sticky-header])) thead {
        position: sticky;
        inset-block-start: 0;
        z-index: 2;
      }

      /* select-all and sortable headers stay visible as a wrapping row, so no focusable control is invisible */
      :host([responsive='stack']) [data-part='headerRow'] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ds-table-stacked-row-gap);
      }
      :host([responsive='stack']) thead th,
      :host([responsive='stack']) thead td {
        position: static;
        display: block;
      }

      /* plain column headers: visually hidden, not display none, so the columnheaders stay in the tree */
      :host([responsive='stack']) thead .plain {
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

      /* stackedBlockGap: between stacked row blocks */
      :host([responsive='stack']) tbody {
        display: grid;
        gap: var(--ds-table-stacked-block-gap);
      }

      :host([responsive='stack']) [data-part='row'] {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--ds-table-stacked-row-gap);
        padding: var(--ds-table-stacked-row-inset);
        border: var(--ds-table-row-border-width) solid var(--ds-table-row-border);
        border-radius: var(--ds-table-stacked-row-radius);
      }

      :host([responsive='stack']) [data-part='row'] > th,
      :host([responsive='stack']) [data-part='row'] > td {
        display: block;
        padding: 0;
        border: 0;
        box-shadow: none;
      }

      :host([responsive='stack']) [data-part='row'][aria-selected='true'] {
        box-shadow: inset var(--border-width-focus) 0 0 0 var(--color-control-selected-background);
      }
      :host([responsive='stack']) [data-part='row'][aria-selected='true']:dir(rtl) {
        box-shadow: inset calc(-1 * var(--border-width-focus)) 0 0 0 var(--color-control-selected-background);
      }

      /* stackedLabel, drawn as a pseudo-element with empty alternative text: the roles already associate the header */
      :host([responsive='stack']) td[data-label]::before {
        content: attr(data-label);
        content: attr(data-label) / '';
        display: block;
        /* stackedLabelColor (locked) */
        color: var(--color-foreground-muted);
        font-size: var(--ds-table-stacked-label-size);
        font-weight: var(--ds-table-stacked-label-weight);
      }
    }
  `;

  /** What the table lists ("Open invoices"): the caption and the accessible name. */
  @property() accessor caption = '';

  /** Heading level of the caption in the page outline; its size is `captionSize` regardless. */
  @property({ attribute: 'caption-level' }) accessor captionLevel: TableCaptionLevel = '2';

  /** Visually hide the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) accessor hideCaption = false;

  /** Column definitions in display order. */
  @property({ attribute: false }) accessor columns: TableColumn[] = [];

  /** The rows. `id` must be stable. */
  @property({ attribute: false }) accessor data: TableRow[] = [];

  /** Controlled sort state. The table shows it; the caller sorts `data`. */
  @property({ attribute: false }) accessor sort: TableSort | undefined;

  /** Initial sort for uncontrolled use; the table then sorts `data` itself. */
  @property({ attribute: false }) accessor defaultSort: TableSort | undefined;

  /** Adds a first column of Checkboxes, and a select-all in the header for `multiple`. */
  @property({ type: String, reflect: true }) accessor selectable: TableSelectable = 'none';

  /** Controlled selected row ids. */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** Below `layout.maxWidth.prose`: `stack` turns rows into labelled blocks; `scroll` scrolls the columns. */
  @property({ type: String, reflect: true }) accessor responsive: TableResponsive = 'stack';

  /** The header row stays visible while the body scrolls. Attribute: `no-sticky-header`. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN })
  accessor stickyHeader = true;

  /** `viewport` caps the table at the viewport height and scrolls the body; `none` lets the page scroll. */
  @property({ type: String, reflect: true, attribute: 'max-height' }) accessor maxHeight: TableMaxHeight = 'none';

  /** Cell padding: `layout.inset.sm` or `layout.inset.md`. */
  @property({ type: String, reflect: true }) accessor density: TableDensity = 'comfortable';

  /** Alternate row backgrounds. */
  @property({ type: Boolean, reflect: true }) accessor striped = false;

  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) accessor emptyMessage: string | undefined;

  /** Data is being fetched: `copy.loading` shows and `aria-busy` is set; existing rows stay visible. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Renders a trailing actions cell (ghost sm icon-only Buttons with Tooltip, or a Menu). */
  @property({ attribute: false }) accessor rowActions: ((row: TableRow) => unknown) | undefined;

  /**
   * Rows fire `row-press` (the row header becomes a Button and the row is styled interactive). Lit cannot see
   * whether anyone listens, so this is the element's stand-in for `onRowPress` being set.
   */
  @property({ type: Boolean, reflect: true, attribute: 'pressable-rows' }) accessor pressableRows = false;

  /** Per-instance token overrides. Locked bindings are not in the type. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined;

  @state() private accessor internalSort: TableSort | undefined;
  @state() private accessor internalSelected: string[] = [];
  @state() private accessor announcement = '';
  @state() private accessor hasFooter = false;

  @query('.sentinel') private accessor sentinelEl!: HTMLElement | null;
  @query('.frame') private accessor frameEl!: HTMLElement | null;
  @query('[data-part="scrollRegion"]') private accessor scrollRegionEl!: HTMLElement | null;

  private headerObserver: IntersectionObserver | undefined;
  private observedFor = '';
  private regionObserver: ResizeObserver | undefined;
  private observedRegion: HTMLElement | null = null;
  private readonly warned = new Set<string>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Table');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.headerObserver?.disconnect();
    this.headerObserver = undefined;
    this.observedFor = '';
    this.regionObserver?.disconnect();
    this.regionObserver = undefined;
    this.observedRegion = null;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalSort = this.defaultSort;
      this.internalSelected = this.defaultSelected ?? [];
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
  }

  protected override updated(): void {
    this.observeHeader();
    this.observeScrollRegion();
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const rows = this.sortedRows();
    const rowHeaderColumn = this.rowHeaderColumn;
    const rowsInteractive = this.pressableRows && rowHeaderColumn !== undefined && !rowHeaderColumn.render;
    const columnCount = (this.selectable !== 'none' ? 1 : 0) + this.columns.length + (this.rowActions ? 1 : 0);
    const pluralForm = new Intl.PluralRules(document.documentElement.lang || undefined).select(this.data.length);
    const rowCountText = COPY_ROW_COUNT[pluralForm === 'one' ? 'one' : 'other'](this.data.length);

    const table = html`
      <table
        role="table"
        data-part="table"
        aria-labelledby="caption"
        aria-describedby="row-count"
        aria-rowcount=${this.data.length + 1}
        aria-colcount=${columnCount}
        aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
      >
        <thead role="rowgroup" data-part="header">
          <tr role="row" data-part="headerRow">
            ${this.renderSelectionHeader()} ${this.columns.map((column) => this.renderColumnHeader(column))}
            ${this.rowActions
              ? html`<th role="columnheader" scope="col" data-part="columnHeader" class="plain">
                  <span class="visually-hidden">${COPY_ACTIONS}</span>
                </th>`
              : nothing}
          </tr>
        </thead>
        <tbody role="rowgroup" data-part="body">
          ${rows.length === 0
            ? html`<tr role="row">
                <td role="cell" class="empty" colspan=${columnCount}>
                  <ds-text data-part="emptyState" element="p" tone="muted"
                    >${this.loading ? COPY_LOADING : (this.emptyMessage ?? COPY_EMPTY)}</ds-text
                  >
                </td>
              </tr>`
            : rows.map((row) => this.renderRow(row, rowHeaderColumn, rowsInteractive))}
        </tbody>
      </table>
    `;

    const sentinel = html`<div class="sentinel" aria-hidden="true"></div>`;

    return html`
      <div data-part="container">
        <ds-heading
          id="caption"
          data-part="caption"
          class=${classMap({ 'visually-hidden': this.hideCaption })}
          level=${this.captionLevel}
          .overrides=${{
            fontSize: this.overrides?.captionSize ?? 'font.size.md',
            fontWeight: this.overrides?.captionWeight ?? 'font.weight.semibold',
            /* The caption part is the Heading itself, with no wrapper, so a hidden caption
               sends space.0 in place of captionGap and leaves no gap above the header. */
            marginBlockEnd: this.hideCaption ? 'space.0' : (this.overrides?.captionGap ?? 'space.2'),
          }}
          >${this.caption}</ds-heading
        >
        <span id="row-count" class="visually-hidden">${rowCountText}</span>
        ${this.responsive === 'scroll'
          ? html`<div class="region">
                <div
                  class="frame"
                  data-part="scrollRegion"
                  role="region"
                  aria-labelledby="caption"
                  aria-describedby="scroll-hint"
                  tabindex="0"
                  @scroll=${this.handleRegionScroll}
                  @keydown=${this.handleRegionKeydown}
                >
                  ${sentinel}${table}
                </div>
              </div>
              <span id="scroll-hint" class="visually-hidden">${COPY_SCROLL_HINT}</span>`
          : html`<div class="frame">${sentinel}${table}</div>`}
        <div aria-live="polite">
          ${this.loading && rows.length > 0
            ? html`<ds-text element="p" tone="muted" size="sm">${COPY_LOADING}</ds-text>`
            : nothing}
        </div>
        <div
          class="footer"
          data-part=${ifDefined(this.hasFooter ? 'footer' : undefined)}
          ?hidden=${!this.hasFooter}
        >
          <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
        </div>
        <div class="visually-hidden" role="status" aria-live="polite">${this.announcement}</div>
      </div>
    `;
  }

  private renderSelectionHeader(): TemplateResult | typeof nothing {
    if (this.selectable === 'none') {
      return nothing;
    }
    if (this.selectable === 'single') {
      return html`<td role="cell" class="header-select"></td>`;
    }
    const selected = new Set(this.currentSelected);
    const allSelected = this.data.length > 0 && this.data.every((row) => selected.has(row.id));
    const someSelected = !allSelected && this.data.some((row) => selected.has(row.id));
    return html`<th role="columnheader" scope="col" data-part="selectAllCell">
      <ds-checkbox
        label=${COPY_SELECT_ALL}
        hide-label
        .checked=${live(allSelected)}
        .indeterminate=${live(someSelected)}
        @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectAll(event, allSelected)}
      ></ds-checkbox>
    </th>`;
  }

  private renderColumnHeader(column: TableColumn): TemplateResult {
    const active = this.currentSort;
    const sorted = active?.column === column.key ? active.direction : undefined;
    const next: TableSortDirection = sorted === 'ascending' ? 'descending' : 'ascending';
    return html`<th
      role="columnheader"
      scope="col"
      data-part="columnHeader"
      class=${classMap({ ...this.cellClasses(column), plain: !column.sortable })}
      abbr=${ifDefined(column.abbr)}
      aria-sort=${ifDefined(sorted)}
    >
      ${column.sortable
        ? html`<ds-button
            data-part="sortButton"
            variant="ghost"
            size="sm"
            .overrides=${{
              fontWeight: this.overrides?.headerWeight ?? 'font.weight.semibold',
              iconGap: this.overrides?.cellGap ?? 'layout.gap.tight',
            }}
            label=${column.header}
            accessible-name=${next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header)}
            @press=${(event: Event) => this.handleSort(event, column)}
          >
            ${sorted
              ? html`<ds-icon
                  slot="trailing-icon"
                  name=${sorted === 'ascending' ? 'chevron-up' : 'chevron-down'}
                  inline
                ></ds-icon>`
              : nothing}
          </ds-button>`
        : column.header}
    </th>`;
  }

  private renderRow(row: TableRow, rowHeaderColumn: TableColumn | undefined, rowsInteractive: boolean): TemplateResult {
    const isSelected = this.selectable !== 'none' && this.currentSelected.includes(row.id);
    const name = rowHeaderColumn ? textOf(row[rowHeaderColumn.key]) || row.id : row.id;
    return html`<tr
      role="row"
      data-part="row"
      class=${classMap({ interactive: rowsInteractive })}
      aria-selected=${ifDefined(this.selectable !== 'none' ? String(isSelected) : undefined)}
      @click=${rowsInteractive ? (event: MouseEvent) => this.handleRowClick(event, row.id) : nothing}
    >
      ${this.selectable !== 'none'
        ? html`<td role="cell" data-part="selectCell">
            <ds-checkbox
              label=${COPY_SELECT_ROW(name)}
              hide-label
              value=${row.id}
              .checked=${live(isSelected)}
              @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectRow(event, row.id)}
            ></ds-checkbox>
          </td>`
        : nothing}
      ${this.columns.map((column) =>
        column === rowHeaderColumn
          ? html`<th role="rowheader" scope="row" data-part="rowHeader" class=${classMap(this.cellClasses(column))}>
              ${rowsInteractive
                ? html`<ds-button
                    variant="ghost"
                    size="sm"
                    label=${name}
                    @press=${(event: Event) => this.handleRowPress(event, row.id)}
                  ></ds-button>`
                : column.render
                  ? column.render(row)
                  : textOf(row[column.key])}
            </th>`
          : html`<td
              role="cell"
              data-part="cell"
              data-label=${column.header}
              class=${classMap(this.cellClasses(column))}
            >
              ${column.render ? column.render(row) : textOf(row[column.key])}
            </td>`,
      )}
      ${this.rowActions
        ? html`<td role="cell" data-part="cell" data-label=${COPY_ACTIONS}>
            <div class="actions">${this.rowActions(row)}</div>
          </td>`
        : nothing}
    </tr>`;
  }

  private cellClasses(column: TableColumn): Record<string, boolean> {
    return {
      'align-end': column.align === 'end',
      'align-center': column.align === 'center',
      'width-min': column.width === 'min',
      'width-fill': column.width === 'fill',
      'hide-below-prose': column.hideBelow === 'prose',
      'hide-below-content': column.hideBelow === 'content',
    };
  }

  private get rowHeaderColumn(): TableColumn | undefined {
    return this.columns.find((column) => column.isRowHeader);
  }

  private get currentSort(): TableSort | undefined {
    return this.sort ?? this.internalSort;
  }

  private get currentSelected(): string[] {
    return this.selected ?? this.internalSelected;
  }

  /** A controlled `sort` means the caller already sorted `data`. */
  private sortedRows(): TableRow[] {
    const active = this.internalSort;
    if (this.sort !== undefined || !active) {
      return this.data;
    }
    const factor = active.direction === 'ascending' ? 1 : -1;
    return [...this.data].sort((a, b) => compareValues(a[active.column], b[active.column]) * factor);
  }

  private handleSort(event: Event, column: TableColumn): void {
    event.stopPropagation();
    const active = this.currentSort;
    const direction: TableSortDirection =
      active?.column === column.key && active.direction === 'ascending' ? 'descending' : 'ascending';
    if (this.sort === undefined) {
      this.internalSort = { column: column.key, direction };
    }
    this.announcement = COPY_SORTED_ANNOUNCEMENT(column.header, direction);
    this.dispatchEvent(
      new CustomEvent<TableSortChangeDetail>('sort-change', {
        detail: { column: column.key, direction },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleSelectAll(event: CustomEvent<CheckboxChangeDetail>, allSelected: boolean): void {
    event.stopPropagation();
    this.commitSelection(allSelected ? [] : this.data.map((row) => row.id));
  }

  private handleSelectRow(event: CustomEvent<CheckboxChangeDetail>, id: string): void {
    event.stopPropagation();
    const checked = event.detail.checked;
    const current = this.currentSelected.filter((existing) => existing !== id);
    if (this.selectable === 'single') {
      this.commitSelection(checked ? [id] : []);
    } else {
      this.commitSelection(checked ? [...current, id] : current);
    }
  }

  private commitSelection(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelected = next;
    } else {
      // Controlled: the Checkboxes toggled themselves; re-render so they show the property until it changes.
      this.requestUpdate();
    }
    this.announcement = COPY_SELECTED_COUNT(next.length, this.data.length);
    this.dispatchEvent(
      new CustomEvent<TableSelectionChangeDetail>('selection-change', {
        detail: { selected: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleRowPress(event: Event, id: string): void {
    event.stopPropagation();
    this.dispatchRowPress(id);
  }

  /** Pointer convenience: a press on an interactive row outside its own controls activates it. */
  private handleRowClick(event: MouseEvent, id: string): void {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('ds-button, ds-checkbox, ds-link, ds-menu, a, button, input, select, textarea, label, [tabindex]')
    ) {
      return;
    }
    this.dispatchRowPress(id);
  }

  private dispatchRowPress(id: string): void {
    this.dispatchEvent(
      new CustomEvent<TableRowPressDetail>('row-press', { detail: { id }, bubbles: true, composed: true }),
    );
  }

  private handleRegionScroll(event: Event): void {
    const scrolled = Math.abs((event.currentTarget as HTMLElement).scrollLeft) > 0;
    if (this.hasAttribute('data-column-scrolled') !== scrolled) {
      this.toggleAttribute('data-column-scrolled', scrolled);
    }
    this.updateScrollEdges();
  }

  /** Marks which physical edges have columns hidden past them, for `scrollFade`. Writes only on a change. */
  private updateScrollEdges(): void {
    const region = this.scrollRegionEl;
    let left = false;
    let right = false;
    if (region) {
      const max = region.scrollWidth - region.clientWidth;
      const rtl = getComputedStyle(region).direction === 'rtl';
      // In RTL, scrollLeft runs from 0 (start, at the right) down to -max.
      left = rtl ? region.scrollLeft + max >= 1 : region.scrollLeft >= 1;
      right = rtl ? -region.scrollLeft >= 1 : max - region.scrollLeft >= 1;
    }
    if (this.hasAttribute('data-fade-left') !== left) {
      this.toggleAttribute('data-fade-left', left);
    }
    if (this.hasAttribute('data-fade-right') !== right) {
      this.toggleAttribute('data-fade-right', right);
    }
  }

  private observeScrollRegion(): void {
    const region = this.scrollRegionEl;
    if (region !== this.observedRegion) {
      this.regionObserver?.disconnect();
      this.regionObserver = undefined;
      this.observedRegion = region;
      if (region && typeof ResizeObserver !== 'undefined') {
        this.regionObserver = new ResizeObserver(() => this.updateScrollEdges());
        this.regionObserver.observe(region);
      }
    }
    this.updateScrollEdges();
  }

  /** Arrow keys scroll the focused region by `space.10`. */
  private handleRegionKeydown(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')) {
      return;
    }
    const region = event.currentTarget as HTMLElement;
    const raw = getComputedStyle(region).getPropertyValue('--space-10').trim();
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) {
      return;
    }
    // A theme may build the scale in rem; a custom property is handed over unresolved either way.
    const step = raw.endsWith('rem')
      ? value * parseFloat(getComputedStyle(document.documentElement).fontSize)
      : value;
    if (!Number.isFinite(step)) {
      return;
    }
    event.preventDefault();
    region.scrollBy({ left: event.key === 'ArrowRight' ? step : -step });
  }

  private handleFooterSlotChange(event: Event): void {
    this.hasFooter = (event.target as HTMLSlotElement).assignedNodes({ flatten: true }).length > 0;
  }

  /** `headerShadow` appears once the sentinel above the table has scrolled out past the top of its root. */
  private observeHeader(): void {
    const key = `${this.stickyHeader}|${this.maxHeight}|${this.responsive}`;
    const sentinel = this.sentinelEl;
    if (key === this.observedFor && this.headerObserver) {
      return;
    }
    this.headerObserver?.disconnect();
    this.headerObserver = undefined;
    this.observedFor = key;
    if (!this.stickyHeader || !sentinel || typeof IntersectionObserver === 'undefined') {
      if (this.hasAttribute('data-header-scrolled')) {
        this.removeAttribute('data-header-scrolled');
      }
      return;
    }
    this.headerObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) {
          return;
        }
        const rootTop = entry.rootBounds?.top ?? 0;
        const next = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
        if (this.hasAttribute('data-header-scrolled') !== next) {
          this.toggleAttribute('data-header-scrolled', next);
        }
      },
      { root: this.maxHeight === 'viewport' ? this.frameEl : null },
    );
    this.headerObserver.observe(sentinel);
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TableOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) {
        this.style.removeProperty(HOOKS[binding]);
      } else {
        this.style.setProperty(HOOKS[binding], cssVar(ref));
      }
    }
  }

  private warnOnce(message: string): void {
    if (this.warned.has(message)) {
      return;
    }
    this.warned.add(message);
    console.warn(message, this);
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.caption) {
      this.warnOnce('<ds-table>: `caption` is required; it is the table\'s accessible name.');
    }
    if (this.columns.filter((column) => column.isRowHeader).length > 1) {
      this.warnOnce('<ds-table>: exactly one column may set `isRowHeader`; the first is used.');
    }
    if (this.pressableRows && !this.rowHeaderColumn) {
      this.warnOnce('<ds-table>: `pressable-rows` needs an `isRowHeader` column; rows stay inert.');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-table': DsTable;
  }
}
