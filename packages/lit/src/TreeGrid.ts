import { LitElement, css, html, nothing, type PropertyValues, type CSSResult, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Heading.js';
import './Button.js';
import './Checkbox.js';
import './Icon.js';
import './Text.js';
import './Input.js';
import './NumberInput.js';
import './Select.js';
import './DatePicker.js';
import type { CheckboxChangeDetail } from './Checkbox.js';
import type { InputChangeDetail } from './Input.js';
import type { NumberInputChangeDetail } from './NumberInput.js';
import type { SelectChangeDetail, SelectValue } from './Select.js';
import type { DatePickerChangeDetail, DatePickerValue } from './DatePicker.js';
import type { HeadingOverridableBinding } from './Heading.js';
import type { DataGridColumn, DataGridSortDirection, DataGridCellRef } from './DataGrid.js';

/** A node in the tree. `id` must be stable across renders. `children: "lazy"` marks a node whose children are
    loaded on first expand through `onExpand`; the row shows the expand button and a loading state until `data`
    is updated with a real array. */
export interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | 'lazy' | undefined;
  [key: string]: unknown;
}

export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';

export interface TreeGridSort {
  column: string;
  direction: DataGridSortDirection;
}

/** Detail carried by the `selection-change` CustomEvent; exactly one of `rows`/`cell` is set, matching `selectable`. */
export interface TreeGridSelectionChangeDetail {
  rows?: string[] | undefined;
  cell?: DataGridCellRef | null | undefined;
}

/** Detail carried by the `cell-change` CustomEvent. */
export interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
}

/** Detail carried by the `sort-change` CustomEvent. */
export type TreeGridSortChangeDetail = TreeGridSort;

/** Detail carried by the `expand-change` CustomEvent: the new array of expanded ids. */
export type TreeGridExpandChangeDetail = string[];

/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` row being expanded. */
export type TreeGridExpandDetail = string;

/** Detail carried by the `column-resize` CustomEvent. */
export interface TreeGridColumnResizeDetail {
  column: string;
  width: number;
}

/* copy.* — used verbatim */
const COPY_EXPAND = (rowName: string): string => `Expand ${rowName}`;
const COPY_COLLAPSE = (rowName: string): string => `Collapse ${rowName}`;
const COPY_LOADING = 'Loading';

/* Reused from DataGrid's copy set for the behaviors this doc marks "as DataGrid" (select-all/select-row labels,
   sort announcements, editing/invalid/row-count text, the empty state). DataGrid.ts doesn't export these
   constants, so the identical strings are duplicated here rather than changing DataGrid's public surface. */
const COPY_SORT_ASCENDING = (column: string): string => `Sort by ${column}, ascending`;
const COPY_SORT_DESCENDING = (column: string): string => `Sort by ${column}, descending`;
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: DataGridSortDirection): string =>
  `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_ROWS = (count: number, total: number): string => `${count} of ${total} rows selected`;
const COPY_EDITING = (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`;
const COPY_INVALID = (message: string): string => message;
const COPY_ROW_COUNT = (count: number): string => `${count} rows`;
const COPY_POSITION = (row: number, column: string): string => `Row ${row}, ${column}`;
const COPY_RESIZE = (column: string): string => `Resize ${column}`;
const COPY_EMPTY = 'Nothing to show.';
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';

const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 64;
const SELECT_COLUMN_KEY = '__select__';

/** Negates a boolean attribute: `no-status-bar` present means the property is `false`. */
const NEGATED_BOOLEAN_CONVERTER = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/** Overridable style hooks; see the `overrides` property. `loadingColor`, `focusRing`, `focusRingWidth` and
    `minTarget` are accessibility-bearing and locked (excluded). */
export type TreeGridOverridableBinding =
  | 'indent'
  | 'expandButtonSize'
  | 'expandGap'
  | 'guideLine'
  | 'guideLineWidth'
  | 'parentWeight'
  | 'transition';

const HOOKS: Record<TreeGridOverridableBinding, string> = {
  indent: '--ds-tree-grid-indent',
  expandButtonSize: '--ds-tree-grid-expand-button-size',
  expandGap: '--ds-tree-grid-expand-gap',
  guideLine: '--ds-tree-grid-guide-line',
  guideLineWidth: '--ds-tree-grid-guide-line-width',
  parentWeight: '--ds-tree-grid-parent-weight',
  transition: '--ds-tree-grid-transition',
};

let idCounter = 0;
function nextTreeGridId(): string {
  idCounter += 1;
  return `ds-tree-grid-${idCounter}`;
}

interface EditingState {
  rowId: string;
  column: string;
  value: unknown;
  previous: unknown;
  error?: string | undefined;
}

/** A row flattened out of the tree for rendering: its ancestry position plus whether it has (loadable) children. */
interface VisibleRow {
  row: TreeGridRow;
  level: number;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  lazy: boolean;
  parentId?: string | undefined;
  /** A synthetic loading placeholder rendered under a `children: "lazy"` row that was just expanded. */
  placeholder?: boolean | undefined;
}

/**
 * `<ds-tree-grid>` — TreeGrid (category: data, APG pattern: treegrid).
 *
 * `<ds-tree-grid caption="Chart of accounts" .columns=${columns} .data=${tree} .expanded=${['assets']}>` extends
 * DataGrid's rendering and keyboard model with a hierarchy carried in the `isRowHeader` column: indent, an expand
 * chevron, and a level announced through `aria-level`/`aria-setsize`/`aria-posinset`. Collapsing a parent removes
 * its descendants from the flattened, virtualized visible-row list.
 *
 * ## When to use
 *
 * Use a TreeGrid when records nest and each record has several comparable fields (a chart of accounts, a bill of
 * materials, an org chart). Use `children: "lazy"` for deep or large trees so first paint is fast. Use
 * `selectChildren` when selecting a row means "this and everything inside it."
 *
 * @fires expand-change - Fired with the new array of expanded ids.
 * @fires expand - Fired with the id of a `children: "lazy"` row being expanded; the caller loads and replaces `children`.
 * @fires sort-change - Fired when a sortable header is activated, with `{ column, direction }`.
 * @fires selection-change - Fired with the selection matching `selectable`: `{ rows }` or `{ cell }`.
 * @fires cell-change - Fired when an edit commits, with `{ rowId, column, value, previous }`.
 * @fires column-resize - Fired with `{ column, width }` when a resizable column edge drag ends.
 * @csspart container - The wrapper (anatomy: container).
 * @csspart scroll-region - The scrolling grid element (anatomy: scrollRegion; same element as `grid`).
 * @csspart grid - The `role="treegrid"` element (anatomy: grid; same element as `scroll-region`).
 * @csspart caption - The caption (anatomy: caption).
 * @csspart header - The sticky header `rowgroup` (anatomy: header).
 * @csspart header-row - The header `row` (anatomy: headerRow).
 * @csspart column-header - Each `columnheader` (anatomy: columnHeader).
 * @csspart sort-button - The composed `<ds-button>` inside a sortable header (anatomy: sortButton).
 * @csspart body - The body `rowgroup` (anatomy: body).
 * @csspart row - Each body `row` (anatomy: row).
 * @csspart row-header - A row's `rowheader` cell; carries the indent and the guide line (anatomy: rowHeader, indent).
 * @csspart expand-button - The composed `<ds-button>` toggling a row's children (anatomy: expandButton).
 * @csspart cell - A body `gridcell` (anatomy: cell).
 * @csspart cell-content - The rendered value inside a cell (anatomy: cellContent).
 * @csspart editor - The composed editor field (anatomy: editor).
 * @csspart select-cell - A row's selection `gridcell` (anatomy: selectCell).
 * @csspart select-all-cell - The header's select-all cell (anatomy: selectAllCell).
 * @csspart empty-state - The composed `<ds-text>` shown when `data` is empty (anatomy: emptyState).
 * @csspart status-bar - The footer status line (anatomy: statusBar).
 */
@customElement('ds-tree-grid')
export class DsTreeGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-tight);
      /* cellColor: color.foreground, as DataGrid, locked */
      color: var(--color-foreground);
      --ds-tree-grid-indent: var(--space-5);
      --ds-tree-grid-expand-button-size: var(--size-target-min);
      --ds-tree-grid-expand-gap: var(--layout-gap-tight);
      --ds-tree-grid-guide-line: var(--color-border);
      --ds-tree-grid-guide-line-width: var(--border-width-thin);
      --ds-tree-grid-parent-weight: var(--font-weight-medium);
      --ds-tree-grid-transition: var(--motion-duration-fast);
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

    .container {
      position: relative;
    }

    .caption {
      padding-block-end: var(--space-2);
    }

    .grid-scroll {
      position: relative;
      overflow: auto;
      outline: none;
      /* surface: color.background, as DataGrid, locked */
      background: var(--color-background);
      border: var(--border-width-thin) solid var(--color-border);
    }

    :host([height='content']) .grid-scroll {
      block-size: auto;
      overflow-y: visible;
    }

    :host([height='viewport']) .grid-scroll {
      block-size: calc(100vh - var(--layout-gap-section) * 2);
    }

    :host([height='fixed']) .grid-scroll {
      block-size: var(--space-20);
    }

    .grid-scroll:focus-visible {
      /* focusRing / focusRingWidth: locked */
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .header {
      position: sticky;
      inset-block-start: 0;
      z-index: 3;
    }

    :host([height='content'][no-sticky-header]) .header {
      position: static;
    }

    :host([data-header-scrolled]) .header {
      box-shadow: var(--shadow-raised);
    }

    .row-grid {
      display: grid;
      align-items: stretch;
    }

    .header-row {
      block-size: var(--size-target-min);
    }

    :host([density='comfortable']) .header-row {
      block-size: var(--size-target-comfortable);
    }

    .body {
      position: relative;
    }

    .row {
      block-size: var(--size-target-min);
      /* minTarget: locked floor so a row can never render shorter than the accessible touch target */
      min-block-size: var(--size-target-min);
      transition: background-color var(--ds-tree-grid-transition) var(--motion-easing-standard);
    }

    :host([density='comfortable']) .row {
      block-size: var(--size-target-comfortable);
    }

    @media (prefers-reduced-motion: reduce) {
      .row,
      .expand-icon {
        transition: none;
      }
    }

    :host(:not([height='content'])) .row {
      position: absolute;
      inset-inline: 0;
    }

    .row:hover {
      background: var(--color-action-ghost-background-hover);
    }

    .row[aria-selected='true'] {
      /* rowSelected: color.background.subtle, as DataGrid, locked */
      background: var(--color-background-subtle);
    }

    .row[aria-selected='true'] .row-header {
      box-shadow: inset var(--border-width-focus) 0 0 0 var(--color-control-selected-background);
    }

    .column-header,
    .row-header,
    .cell,
    .select-cell,
    .select-all-cell {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding-inline: var(--space-2);
      border-inline-end: var(--border-width-thin) solid var(--color-border);
      border-block-end: var(--border-width-thin) solid var(--color-border);
      overflow: hidden;
      position: relative;
    }

    .column-header,
    .select-all-cell {
      background: var(--color-background-subtle);
      color: var(--color-foreground);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      border-block-end: var(--border-width-focus) solid var(--color-border-strong);
    }

    .row-header {
      gap: var(--ds-tree-grid-expand-gap);
      padding-inline-start: calc(var(--space-2) + (var(--_level, 1) - 1) * var(--ds-tree-grid-indent));
    }

    .row-header.has-children {
      font-weight: var(--ds-tree-grid-parent-weight);
    }

    .cell,
    .row-header {
      color: var(--color-foreground);
    }

    .align-end {
      justify-content: flex-end;
      text-align: end;
    }
    .align-center {
      justify-content: center;
      text-align: center;
    }
    .numeric {
      font-family: var(--font-family-mono);
      font-variant-numeric: tabular-nums;
    }

    .pinned-start,
    .pinned-end {
      position: sticky;
      z-index: 2;
      background: var(--color-background);
    }
    .column-header.pinned-start,
    .column-header.pinned-end,
    .select-all-cell.pinned-start {
      z-index: 4;
      background: var(--color-background-subtle);
    }

    .cell[data-active],
    .row-header[data-active],
    .column-header[data-active] {
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-focus);
      z-index: 1;
    }

    .cell.editing {
      background: var(--color-control-background);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-focus);
      padding-inline: 0;
      align-items: stretch;
    }

    .cell.invalid {
      background: var(--color-status-danger-background);
      color: var(--color-status-danger-foreground);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-danger);
    }

    .editor {
      inline-size: 100%;
      block-size: 100%;
    }
    .editor ds-input,
    .editor ds-number-input,
    .editor ds-select,
    .editor ds-date-picker {
      inline-size: 100%;
    }

    .sort-button {
      --ds-button-padding-inline: 0;
      --ds-button-padding-block: 0;
    }

    .resize-handle {
      position: absolute;
      inset-block: 0;
      /* resizeHandle / resizeHandleWidth: not overridable bindings on TreeGrid (unlike DataGrid); fixed tokens */
      inset-inline-end: calc(var(--space-1) / -2);
      inline-size: var(--space-1);
      cursor: col-resize;
      touch-action: none;
      z-index: 5;
    }
    .resize-handle:hover,
    .resize-handle.active {
      background: var(--color-border-strong);
    }

    .expand-button {
      --ds-button-padding-inline: 0;
      --ds-button-padding-block: 0;
      inline-size: var(--ds-tree-grid-expand-button-size);
      block-size: var(--ds-tree-grid-expand-button-size);
      flex: none;
    }

    .expand-spacer {
      inline-size: var(--ds-tree-grid-expand-button-size);
      flex: none;
    }

    .expand-icon {
      transition: transform var(--ds-tree-grid-transition) var(--motion-easing-standard);
    }
    .expand-icon[data-expanded] {
      transform: rotate(90deg);
    }

    .row-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .loading-cell {
      /* loadingColor: color.foreground.muted, locked */
      color: var(--color-foreground-muted);
    }

    .empty-row {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-block: var(--space-6);
      block-size: 100%;
    }

    .status-bar {
      background: var(--color-background-subtle);
      color: var(--color-foreground-muted);
      font-size: var(--font-size-xs);
      padding: var(--space-2);
    }
  `;

  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  @property() accessor caption!: string;

  /** Visually hides the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) accessor hideCaption = false;

  /** DataGrid's column model. The `isRowHeader` column is required: it carries the indent and expand button. */
  @property({ attribute: false }) accessor columns: DataGridColumn[] = [];

  /** Nested rows. A property, not an attribute. */
  @property({ attribute: false }) accessor data: TreeGridRow[] = [];

  /** Controlled ids of expanded rows. */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids. `["*"]` expands every loaded row with children. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** Controlled sort; applies within each level, siblings ordered, hierarchy kept. */
  @property({ attribute: false }) accessor sort: TreeGridSort | undefined;

  /** Initial sort; the grid sorts `data` itself when `sort` is not supplied. */
  @property({ attribute: false }) accessor defaultSort: TreeGridSort | undefined;

  /** `row` adds a checkbox column; `cell` selects one cell. */
  @property({ reflect: true }) accessor selectable: TreeGridSelectable = 'none';

  /** Controlled selected row ids (row mode). */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected row ids (row mode), when `selected` is not supplied. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** Selecting a parent row selects its loaded descendants; the parent shows indeterminate when only some are selected. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** Master switch: cells whose column is `editable` can be edited. */
  @property({ type: Boolean, reflect: true }) accessor editable = false;

  /** Row height. */
  @property({ reflect: true }) accessor density: TreeGridDensity = 'compact';

  /** The header stays visible while the body scrolls. Exposed as the negated `no-sticky-header` attribute;
      always true when `height` is `viewport` or `fixed`. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor stickyHeader = true;

  /** `viewport` fills the height under the header and scrolls internally; `content` grows with rows; `fixed`
      uses a fixed block size. */
  @property({ reflect: true }) accessor height: TreeGridHeight = 'viewport';

  /** Data is being fetched: sets `aria-busy` and shows `copy.loading` in the status bar. Existing rows stay. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** Shown in place of the body when `data` is empty. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) accessor emptyMessage: string | undefined;

  /** A footer line with row count and selection count. Exposed as the negated `no-status-bar` attribute
      (the doc's default is `true`, so per the negated-boolean-attribute convention this can't be a positively
      named attribute — see gaps). */
  @property({ attribute: 'no-status-bar', reflect: true, converter: NEGATED_BOOLEAN_CONVERTER })
  accessor showStatusBar = true;

  /** Per-instance style overrides: `{ indent: 'space.6' }`. Locked bindings are ignored. */
  @property({ attribute: false }) accessor overrides: Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>> | undefined;

  @state() private accessor internalSelectedRows: string[] = [];
  @state() private accessor internalSelectedCell: DataGridCellRef | null = null;
  @state() private accessor internalExpanded: string[] = [];
  @state() private accessor internalSort: TreeGridSort | undefined;
  @state() private accessor activeRowIndex = -1;
  @state() private accessor activeColKey = '';
  @state() private accessor editing: EditingState | undefined;
  @state() private accessor columnWidths: Record<string, number> = {};
  @state() private accessor bodyScrollTop = 0;
  @state() private accessor viewportPx = 0;
  @state() private accessor liveMessage = '';

  private readonly instanceId = nextTreeGridId();
  private rowHeightPx = 0;
  private resizeObserver?: ResizeObserver | undefined;
  private activeDrag?: { column: string; pointerId: number; startX: number; startWidth: number } | undefined;
  private selectionAnchorId?: string | undefined;

  @query('.grid-scroll') private accessor gridEl!: HTMLElement | null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'TreeGrid');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override firstUpdated(): void {
    if (this.expanded === undefined) {
      this.internalExpanded = this.defaultExpanded?.includes('*')
        ? this.allIdsWithChildren(this.data)
        : (this.defaultExpanded ?? []);
    }
    if (this.sort === undefined) {
      this.internalSort = this.defaultSort;
    }
    if (this.selected === undefined) {
      this.internalSelectedRows = this.defaultSelected ?? [];
    }
    if (this.gridEl) {
      this.resizeObserver = new ResizeObserver(() => {
        this.viewportPx = this.gridEl?.clientHeight ?? 0;
        this.measureRowHeight();
      });
      this.resizeObserver.observe(this.gridEl);
      this.viewportPx = this.gridEl.clientHeight;
      this.measureRowHeight();
    }
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    if (changed.has('density')) {
      this.measureRowHeight();
    }
  }

  protected override updated(): void {
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const rows = this.visibleRows();
    const total = rows.length;
    const columnKeys = this.effectiveColumnKeys();
    const colCount = columnKeys.length;
    const visibleRange = this.visibleRowRange(total);
    const windowRows = rows.slice(visibleRange.start, visibleRange.end + 1);

    return html`
      <div class="container" part="container">
        <div
          id="${this.instanceId}-caption"
          class=${classMap({ caption: true, 'visually-hidden': this.hideCaption })}
          part="caption"
        >
          <ds-heading level="2" size="md" .overrides=${this.captionOverrides}>${this.caption}</ds-heading>
        </div>

        <div
          class="grid-scroll"
          part="scroll-region grid"
          role="treegrid"
          tabindex="0"
          aria-labelledby="${this.instanceId}-caption"
          aria-describedby="${this.instanceId}-row-count ${this.instanceId}-position ${this.instanceId}-scroll-hint"
          aria-rowcount=${total + 1}
          aria-colcount=${colCount}
          aria-multiselectable=${ifDefined(this.selectable === 'none' ? undefined : 'true')}
          aria-readonly=${this.editable ? 'false' : 'true'}
          aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
          aria-activedescendant=${ifDefined(this.activeDescendantId(rows))}
          @keydown=${this.handleGridKeydown}
          @scroll=${this.handleScroll}
          @click=${this.handleGridClick}
          @dblclick=${this.handleGridDblClick}
        >
          <div class="header" part="header" role="rowgroup">
            <div class="row-grid header-row" part="header-row" role="row" aria-rowindex="1" style=${this.gridTemplate()}>
              ${this.selectable === 'row' ? this.renderSelectAllCell(rows) : nothing}
              ${this.columns.map((column, index) => this.renderColumnHeader(column, index))}
            </div>
          </div>

          <div
            class="body"
            part="body"
            role="rowgroup"
            style=${styleMap({ blockSize: this.height === 'content' ? 'auto' : `${total * this.rowHeightPx}px` })}
          >
            ${total === 0
              ? this.renderEmptyState()
              : windowRows.map((vr, i) => this.renderRow(vr, visibleRange.start + i))}
          </div>
        </div>

        ${this.showStatusBar
          ? html`<div class="status-bar" part="status-bar" role="status">
              <ds-text size="xs" tone="muted">${this.statusText(total)}</ds-text>
            </div>`
          : html`<div class="visually-hidden" role="status">${this.liveMessage}</div>`}

        <span id="${this.instanceId}-row-count" class="visually-hidden">${COPY_ROW_COUNT(total)}</span>
        <span id="${this.instanceId}-position" class="visually-hidden">${this.positionText(rows)}</span>
        <span id="${this.instanceId}-scroll-hint" class="visually-hidden">${COPY_SCROLL_HINT}</span>
      </div>
    `;
  }

  private renderSelectAllCell(rows: VisibleRow[]) {
    const selectableRows = rows.filter((vr) => !vr.placeholder);
    const allSelected = selectableRows.length > 0 && selectableRows.every((vr) => this.rowCheckedState(vr).checked);
    const someSelected =
      !allSelected &&
      selectableRows.some((vr) => {
        const state = this.rowCheckedState(vr);
        return state.checked || state.indeterminate;
      });
    return html`
      <div
        id="${this.instanceId}-h-${SELECT_COLUMN_KEY}"
        class="select-all-cell"
        part="select-all-cell"
        role="columnheader"
        aria-colindex="1"
        data-active=${ifDefined(this.activeRowIndex === -1 && this.activeColKey === SELECT_COLUMN_KEY ? '' : undefined)}
        data-ds-cell-key=${SELECT_COLUMN_KEY}
      >
        <ds-checkbox
          tabindex="-1"
          label=${COPY_SELECT_ALL}
          .checked=${allSelected}
          .indeterminate=${someSelected}
          @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectAllChange(event, selectableRows)}
        ></ds-checkbox>
      </div>
    `;
  }

  private renderColumnHeader(column: DataGridColumn, index: number) {
    const currentSort = this.sort ?? this.internalSort;
    const direction = currentSort?.column === column.key ? currentSort.direction : undefined;
    const colIndex = index + 1 + (this.selectable === 'row' ? 1 : 0);
    const pin = this.pinnedStyle(column);
    return html`
      <div
        id="${this.instanceId}-h-${column.key}"
        class=${classMap({
          'column-header': true,
          'align-end': column.align === 'end',
          'align-center': column.align === 'center',
          'pinned-start': column.pinned === 'start',
          'pinned-end': column.pinned === 'end',
        })}
        part="column-header"
        role="columnheader"
        aria-colindex=${colIndex}
        aria-sort=${ifDefined(column.sortable ? (direction ?? 'none') : undefined)}
        aria-describedby="${this.instanceId}-position"
        data-active=${ifDefined(this.activeRowIndex === -1 && this.activeColKey === column.key ? '' : undefined)}
        data-ds-cell-key=${column.key}
        style=${styleMap(pin)}
      >
        ${column.sortable
          ? html`<ds-button
              class="sort-button"
              part="sort-button"
              variant="ghost"
              size="sm"
              tabindex="-1"
              label=${this.sortButtonLabel(column, direction)}
              @press=${(event: Event) => {
                event.stopPropagation();
                this.handleSort(column.key);
              }}
            >
              <ds-icon slot="trailing-icon" name=${direction === 'descending' ? 'chevron-down' : 'chevron-up'} inline></ds-icon>
            </ds-button>`
          : column.abbr
            ? html`<abbr title=${column.header}>${column.abbr}</abbr>`
            : column.header}
        ${column.resizable ? this.renderResizeHandle(column) : nothing}
      </div>
    `;
  }

  private renderResizeHandle(column: DataGridColumn) {
    return html`<div
      class=${classMap({ 'resize-handle': true, active: this.activeDrag?.column === column.key })}
      part="resize-handle"
      aria-label=${COPY_RESIZE(column.header)}
      @pointerdown=${(event: PointerEvent) => this.handleResizeStart(event, column)}
    ></div>`;
  }

  private renderEmptyState() {
    const message = this.emptyMessage ?? COPY_EMPTY;
    return html`<div class="empty-row" part="empty-state">
      <ds-text tone="muted">${message}</ds-text>
    </div>`;
  }

  private renderRow(vr: VisibleRow, index: number) {
    const checkedState = this.selectable === 'row' && !vr.placeholder ? this.rowCheckedState(vr) : undefined;
    const rowSelected =
      this.selectable === 'row'
        ? Boolean(checkedState?.checked)
        : this.selectable === 'cell'
          ? this.internalSelectedCell?.rowId === vr.row.id
          : false;
    const rowName = this.rowName(vr.row);
    const offset = this.height === 'content' ? undefined : `${index * this.rowHeightPx}px`;
    const expanded = vr.hasChildren && this.isExpanded(vr.row.id);

    return html`
      <div
        class="row-grid row"
        part="row"
        role="row"
        aria-rowindex=${index + 2}
        aria-level=${vr.level}
        aria-setsize=${vr.setsize}
        aria-posinset=${vr.posinset}
        aria-expanded=${ifDefined(vr.hasChildren ? String(expanded) : undefined)}
        aria-selected=${ifDefined(this.selectable === 'row' || this.selectable === 'cell' ? String(rowSelected) : undefined)}
        aria-busy=${ifDefined(expanded && vr.lazy ? 'true' : undefined)}
        style=${styleMap({ transform: offset ? `translateY(${offset})` : undefined, ...this.gridTemplateObj() })}
      >
        ${this.selectable === 'row' && !vr.placeholder ? this.renderSelectCell(vr, rowName, checkedState!) : nothing}
        ${this.columns.map((column, colIndex) => this.renderCell(column, vr, index, colIndex))}
      </div>
    `;
  }

  private renderSelectCell(vr: VisibleRow, rowName: string, state: { checked: boolean; indeterminate: boolean }) {
    return html`
      <div
        id="${this.instanceId}-c-${vr.row.id}-${SELECT_COLUMN_KEY}"
        class="select-cell"
        part="select-cell"
        role="gridcell"
        aria-colindex="1"
        data-active=${ifDefined(this.activeColKey === SELECT_COLUMN_KEY && this.rowIdAtActive() === vr.row.id ? '' : undefined)}
        data-ds-cell-row=${vr.row.id}
        data-ds-cell-key=${SELECT_COLUMN_KEY}
      >
        <ds-checkbox
          tabindex="-1"
          label=${COPY_SELECT_ROW(rowName)}
          .checked=${state.checked}
          .indeterminate=${state.indeterminate}
          @change=${(event: CustomEvent<CheckboxChangeDetail>) => this.handleSelectRowChange(event, vr)}
        ></ds-checkbox>
      </div>
    `;
  }

  private renderCell(column: DataGridColumn, vr: VisibleRow, rowIndex: number, colIndex: number) {
    const isRowHeader = Boolean(column.isRowHeader);
    const id = this.cellId(vr.row.id, column.key);
    const isActive = this.activeRowIndex === rowIndex && this.activeColKey === column.key;
    const colAriaIndex = colIndex + 1 + (this.selectable === 'row' ? 1 : 0);
    const pin = this.pinnedStyle(column);

    if (vr.placeholder) {
      return html`
        <div
          id=${id}
          class=${classMap({ cell: !isRowHeader, 'row-header': isRowHeader })}
          part=${isRowHeader ? 'row-header' : 'cell'}
          role=${isRowHeader ? 'rowheader' : 'gridcell'}
          aria-colindex=${colAriaIndex}
          data-active=${ifDefined(isActive ? '' : undefined)}
          data-ds-cell-row=${vr.row.id}
          data-ds-cell-key=${column.key}
          style=${styleMap(isRowHeader ? { ...pin, '--_level': String(vr.level) } : pin)}
        >
          ${isRowHeader ? html`<span class="loading-cell" part="cell-content">${COPY_LOADING}</span>` : nothing}
        </div>
      `;
    }

    const row = vr.row;
    const isEditing = this.editing?.rowId === row.id && this.editing.column === column.key;
    const invalid = isEditing && Boolean(this.editing?.error);
    const classes = {
      cell: !isRowHeader,
      'row-header': isRowHeader,
      'has-children': isRowHeader && vr.hasChildren,
      'align-end': column.align === 'end',
      'align-center': column.align === 'center',
      numeric: column.align === 'end',
      'pinned-start': column.pinned === 'start',
      'pinned-end': column.pinned === 'end',
      editing: isEditing,
      invalid,
    };
    const style = isRowHeader ? { ...pin, '--_level': String(vr.level), ...this.guideLayers(vr.level) } : pin;
    const content = column.render ? column.render(row) : String(row[column.key] ?? '');

    return html`
      <div
        id=${id}
        class=${classMap(classes)}
        part=${isRowHeader ? 'row-header' : 'cell'}
        role=${isRowHeader ? 'rowheader' : 'gridcell'}
        aria-colindex=${colAriaIndex}
        aria-describedby="${this.instanceId}-position"
        data-active=${ifDefined(isActive ? '' : undefined)}
        data-ds-cell-row=${row.id}
        data-ds-cell-key=${column.key}
        style=${styleMap(style)}
      >
        ${isRowHeader
          ? this.renderRowHeaderContent(vr, content)
          : isEditing
            ? this.renderEditor(column, row)
            : html`<span part="cell-content" class="cell-content">${content}</span>`}
      </div>
    `;
  }

  private renderRowHeaderContent(vr: VisibleRow, content: unknown) {
    const rowName = this.rowName(vr.row);
    const expanded = vr.hasChildren && this.isExpanded(vr.row.id);
    return html`
      ${vr.hasChildren
        ? html`<ds-button
            class="expand-button"
            part="expand-button"
            variant="ghost"
            size="sm"
            icon-only
            tabindex="-1"
            aria-hidden="true"
            label=${expanded ? COPY_COLLAPSE(rowName) : COPY_EXPAND(rowName)}
            @press=${(event: Event) => {
              event.stopPropagation();
              this.toggleExpand(vr);
            }}
          >
            <ds-icon
              slot="leading-icon"
              class="expand-icon"
              data-expanded=${ifDefined(expanded ? '' : undefined)}
              name="chevron-right"
              inline
            ></ds-icon>
          </ds-button>`
        : html`<span class="expand-spacer" aria-hidden="true"></span>`}
      <span part="cell-content" class="cell-content row-name">${content}</span>
    `;
  }

  private renderEditor(column: DataGridColumn, row: TreeGridRow) {
    const editing = this.editing;
    if (!editing) {
      return nothing;
    }
    const kind = column.editor ?? 'text';
    const commit = (value: unknown) => this.commitEdit(column, row, value);
    switch (kind) {
      case 'number':
        return html`<div class="editor" part="editor">
          <ds-number-input
            label=${column.header}
            name=${column.key}
            .value=${typeof editing.value === 'number' ? editing.value : undefined}
            @change=${(event: CustomEvent<NumberInputChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-number-input>
        </div>`;
      case 'select':
        return html`<div class="editor" part="editor">
          <ds-select
            label=${column.header}
            name=${column.key}
            .options=${column.options ?? []}
            .value=${editing.value as SelectValue}
            @change=${(event: CustomEvent<SelectChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-select>
        </div>`;
      case 'date':
        return html`<div class="editor" part="editor">
          <ds-date-picker
            label=${column.header}
            name=${column.key}
            .value=${editing.value as DatePickerValue}
            @change=${(event: CustomEvent<DatePickerChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-date-picker>
        </div>`;
      case 'checkbox':
        return html`<div class="editor" part="editor">
          <ds-checkbox
            label=${column.header}
            name=${column.key}
            .checked=${Boolean(editing.value)}
            @change=${(event: CustomEvent<CheckboxChangeDetail>) => commit(event.detail.checked)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-checkbox>
        </div>`;
      default:
        return html`<div class="editor" part="editor">
          <ds-input
            label=${column.header}
            name=${column.key}
            .value=${editing.value === undefined || editing.value === null ? '' : String(editing.value)}
            @change=${(event: CustomEvent<InputChangeDetail>) => commit(event.detail.value)}
            @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column, row)}
          ></ds-input>
        </div>`;
    }
  }

  /* ---------- tree flattening ---------- */

  private isExpanded(id: string): boolean {
    return (this.expanded ?? this.internalExpanded).includes(id);
  }

  private sortSiblings(rows: TreeGridRow[]): TreeGridRow[] {
    const sortState = this.sort ?? this.internalSort;
    if (!sortState) {
      return rows;
    }
    const factor = sortState.direction === 'ascending' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = a[sortState.column];
      const right = b[sortState.column];
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right, undefined, { numeric: true }) * factor;
      }
      return (Number(left) - Number(right)) * factor;
    });
  }

  private flatten(rows: TreeGridRow[], level: number, parentId: string | undefined, expandedIds: Set<string>): VisibleRow[] {
    const ordered = this.sortSiblings(rows);
    const result: VisibleRow[] = [];
    ordered.forEach((row, index) => {
      const lazy = row.children === 'lazy';
      const hasChildren = lazy || (Array.isArray(row.children) && row.children.length > 0);
      result.push({ row, level, posinset: index + 1, setsize: ordered.length, hasChildren, lazy, parentId });
      if (hasChildren && expandedIds.has(row.id)) {
        if (lazy) {
          result.push({
            row: { id: `${row.id}__loading` },
            level: level + 1,
            posinset: 1,
            setsize: 1,
            hasChildren: false,
            lazy: false,
            parentId: row.id,
            placeholder: true,
          });
        } else if (Array.isArray(row.children)) {
          result.push(...this.flatten(row.children, level + 1, row.id, expandedIds));
        }
      }
    });
    return result;
  }

  private visibleRows(): VisibleRow[] {
    return this.flatten(this.data, 1, undefined, new Set(this.expanded ?? this.internalExpanded));
  }

  private allIdsWithChildren(rows: TreeGridRow[]): string[] {
    const ids: string[] = [];
    const walk = (list: TreeGridRow[]) => {
      for (const row of list) {
        if (row.children === 'lazy') {
          ids.push(row.id);
        } else if (Array.isArray(row.children) && row.children.length > 0) {
          ids.push(row.id);
          walk(row.children);
        }
      }
    };
    walk(rows);
    return ids;
  }

  private collectDescendantIds(row: TreeGridRow): string[] {
    const ids: string[] = [];
    const walk = (children: TreeGridRow[] | 'lazy' | undefined) => {
      if (!Array.isArray(children)) {
        return;
      }
      for (const child of children) {
        ids.push(child.id);
        walk(child.children);
      }
    };
    walk(row.children);
    return ids;
  }

  private rowHeaderColumn(): DataGridColumn | undefined {
    return this.columns.find((column) => column.isRowHeader);
  }

  private rowName(row: TreeGridRow): string {
    const column = this.rowHeaderColumn();
    return column ? String(row[column.key] ?? row.id) : row.id;
  }

  /* ---------- expand / collapse ---------- */

  private commitExpanded(next: string[]): void {
    if (this.expanded === undefined) {
      this.internalExpanded = next;
    }
    this.dispatchEvent(
      new CustomEvent<TreeGridExpandChangeDetail>('expand-change', { detail: next, bubbles: true, composed: true }),
    );
  }

  private toggleExpand(vr: VisibleRow): void {
    if (!vr.hasChildren) {
      return;
    }
    const current = this.expanded ?? this.internalExpanded;
    const wasExpanded = current.includes(vr.row.id);
    const next = wasExpanded ? current.filter((id) => id !== vr.row.id) : [...current, vr.row.id];
    this.commitExpanded(next);
    const rowName = this.rowName(vr.row);
    this.liveMessage = wasExpanded ? COPY_COLLAPSE(rowName) : COPY_EXPAND(rowName);
    if (!wasExpanded && vr.lazy) {
      this.dispatchEvent(new CustomEvent<TreeGridExpandDetail>('expand', { detail: vr.row.id, bubbles: true, composed: true }));
    }
  }

  private expandSiblings(vr: VisibleRow): void {
    const rows = this.visibleRows();
    const siblings = rows.filter((r) => r.parentId === vr.parentId && r.hasChildren);
    const current = new Set(this.expanded ?? this.internalExpanded);
    const newlyLazy: string[] = [];
    let changed = false;
    for (const sibling of siblings) {
      if (!current.has(sibling.row.id)) {
        current.add(sibling.row.id);
        changed = true;
        if (sibling.lazy) {
          newlyLazy.push(sibling.row.id);
        }
      }
    }
    if (!changed) {
      return;
    }
    this.commitExpanded([...current]);
    for (const id of newlyLazy) {
      this.dispatchEvent(new CustomEvent<TreeGridExpandDetail>('expand', { detail: id, bubbles: true, composed: true }));
    }
  }

  /* ---------- selection ---------- */

  private currentSelectedRows(): string[] {
    return this.selected ?? this.internalSelectedRows;
  }

  private rowCheckedState(vr: VisibleRow): { checked: boolean; indeterminate: boolean } {
    const selected = this.currentSelectedRows();
    if (selected.includes(vr.row.id)) {
      return { checked: true, indeterminate: false };
    }
    if (!this.selectChildren || !vr.hasChildren) {
      return { checked: false, indeterminate: false };
    }
    const descendantIds = this.collectDescendantIds(vr.row);
    if (descendantIds.length === 0) {
      return { checked: false, indeterminate: false };
    }
    const selectedCount = descendantIds.filter((id) => selected.includes(id)).length;
    if (selectedCount === 0) {
      return { checked: false, indeterminate: false };
    }
    if (selectedCount === descendantIds.length) {
      return { checked: true, indeterminate: false };
    }
    return { checked: false, indeterminate: true };
  }

  private toggleRowSelection(vr: VisibleRow): void {
    const current = this.currentSelectedRows();
    const wasChecked = this.rowCheckedState(vr).checked;
    let next: string[];
    if (this.selectChildren && vr.hasChildren) {
      const ids = [vr.row.id, ...this.collectDescendantIds(vr.row)];
      next = wasChecked ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])];
    } else {
      next = current.includes(vr.row.id) ? current.filter((id) => id !== vr.row.id) : [...current, vr.row.id];
    }
    this.commitRowSelection(next);
  }

  /** Shift+Space: extends the row selection from the last plain-Space anchor through the focused row, inclusive
      (visible-row order); with `selectChildren` each row added to the range cascades its loaded descendants. */
  private extendRowSelection(activeVr: VisibleRow, rows: VisibleRow[]): void {
    const anchorId = this.selectionAnchorId ?? activeVr.row.id;
    const anchorIndex = rows.findIndex((vr) => vr.row.id === anchorId);
    const activeIndex = rows.findIndex((vr) => vr.row.id === activeVr.row.id);
    if (anchorIndex === -1 || activeIndex === -1) {
      return;
    }
    const [start, end] = anchorIndex <= activeIndex ? [anchorIndex, activeIndex] : [activeIndex, anchorIndex];
    const next = new Set(this.currentSelectedRows());
    for (const vr of rows.slice(start, end + 1)) {
      if (vr.placeholder) {
        continue;
      }
      next.add(vr.row.id);
      if (this.selectChildren) {
        for (const id of this.collectDescendantIds(vr.row)) {
          next.add(id);
        }
      }
    }
    this.commitRowSelection([...next]);
  }

  private commitRowSelection(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelectedRows = next;
    }
    const total = this.visibleRows().filter((vr) => !vr.placeholder).length;
    this.liveMessage = COPY_SELECTED_ROWS(next.length, total);
    this.dispatchEvent(
      new CustomEvent<TreeGridSelectionChangeDetail>('selection-change', {
        detail: { rows: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleSelectAllChange(event: CustomEvent<CheckboxChangeDetail>, rows: VisibleRow[]): void {
    event.stopPropagation();
    let next: string[] = [];
    if (event.detail.checked) {
      for (const vr of rows) {
        next.push(vr.row.id);
        if (this.selectChildren) {
          next.push(...this.collectDescendantIds(vr.row));
        }
      }
      next = [...new Set(next)];
    }
    this.commitRowSelection(next);
  }

  private handleSelectRowChange(event: CustomEvent<CheckboxChangeDetail>, vr: VisibleRow): void {
    event.stopPropagation();
    this.toggleRowSelection(vr);
    this.selectionAnchorId = vr.row.id;
  }

  private commitCellSelection(cell: DataGridCellRef | null): void {
    this.internalSelectedCell = cell;
    this.dispatchEvent(
      new CustomEvent<TreeGridSelectionChangeDetail>('selection-change', {
        detail: { cell },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---------- sorting ---------- */

  private sortButtonLabel(column: DataGridColumn, direction: DataGridSortDirection | undefined): string {
    const next = direction === 'ascending' ? 'descending' : 'ascending';
    return next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header);
  }

  private handleSort(column: string): void {
    const current = this.sort ?? this.internalSort;
    const direction: DataGridSortDirection =
      current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending';
    const next: TreeGridSort = { column, direction };
    if (this.sort === undefined) {
      this.internalSort = next;
    }
    const columnDef = this.columns.find((c) => c.key === column);
    this.liveMessage = COPY_SORTED_ANNOUNCEMENT(columnDef?.header ?? column, direction);
    this.dispatchEvent(new CustomEvent<TreeGridSortChangeDetail>('sort-change', { detail: next, bubbles: true, composed: true }));
  }

  /* ---------- column resize ---------- */

  private handleResizeStart(event: PointerEvent, column: DataGridColumn): void {
    event.stopPropagation();
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.activeDrag = { column: column.key, pointerId: event.pointerId, startX: event.clientX, startWidth: this.columnWidth(column) };
    target.addEventListener('pointermove', this.handleResizeMove);
    target.addEventListener('pointerup', this.handleResizeEnd);
  }

  private readonly handleResizeMove = (event: PointerEvent): void => {
    if (!this.activeDrag) {
      return;
    }
    const column = this.columns.find((c) => c.key === this.activeDrag?.column);
    const minWidth = column?.minWidth ?? MIN_COLUMN_WIDTH;
    const delta = event.clientX - this.activeDrag.startX;
    const width = Math.max(minWidth, this.activeDrag.startWidth + delta);
    this.columnWidths = { ...this.columnWidths, [this.activeDrag.column]: width };
  };

  private readonly handleResizeEnd = (event: PointerEvent): void => {
    const target = event.currentTarget as HTMLElement;
    target.removeEventListener('pointermove', this.handleResizeMove);
    target.removeEventListener('pointerup', this.handleResizeEnd);
    const drag = this.activeDrag;
    this.activeDrag = undefined;
    if (!drag) {
      return;
    }
    const width = this.columnWidths[drag.column];
    if (width !== undefined) {
      this.dispatchEvent(
        new CustomEvent<TreeGridColumnResizeDetail>('column-resize', {
          detail: { column: drag.column, width },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.requestUpdate();
  };

  /* ---------- editing ---------- */

  private startEdit(column: DataGridColumn, row: TreeGridRow): void {
    if (!this.editable || !column.editable || column.isRowHeader) {
      return;
    }
    const value = row[column.key];
    this.editing = { rowId: row.id, column: column.key, value, previous: value };
    this.liveMessage = COPY_EDITING(column.header);
    this.requestUpdate();
    this.updateComplete.then(() => this.focusEditor());
  }

  private focusEditor(): void {
    const el = this.renderRoot.querySelector('.editor > *') as HTMLElement | null;
    el?.focus();
  }

  private commitEdit(column: DataGridColumn, row: TreeGridRow, value: unknown): void {
    if (!this.editing) {
      return;
    }
    const error = column.validate?.(value, row);
    if (error) {
      this.editing = { ...this.editing, value, error };
      this.liveMessage = COPY_INVALID(error);
      return;
    }
    const previous = this.editing.previous;
    this.editing = undefined;
    this.dispatchEvent(
      new CustomEvent<TreeGridCellChangeDetail>('cell-change', {
        detail: { rowId: row.id, column: column.key, value, previous },
        bubbles: true,
        composed: true,
      }),
    );
    this.focusGrid();
  }

  private cancelEdit(): void {
    this.editing = undefined;
    this.focusGrid();
  }

  private focusGrid(): void {
    this.updateComplete.then(() => this.gridEl?.focus());
  }

  private handleEditorKeydown(event: KeyboardEvent, column: DataGridColumn, row: TreeGridRow): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.cancelEdit();
      return;
    }
    if (event.key === 'Enter') {
      event.stopPropagation();
      const value = this.editing?.value;
      this.commitEdit(column, row, value);
      return;
    }
    if (event.key === 'F2') {
      event.stopPropagation();
      const value = this.editing?.value;
      this.commitEdit(column, row, value);
    }
  }

  /* ---------- layout ---------- */

  private columnWidth(column: DataGridColumn): number {
    return this.columnWidths[column.key] ?? column.width ?? column.minWidth ?? DEFAULT_COLUMN_WIDTH;
  }

  private effectiveColumnKeys(): string[] {
    const keys = this.columns.map((column) => column.key);
    return this.selectable === 'row' ? [SELECT_COLUMN_KEY, ...keys] : keys;
  }

  private gridTemplate() {
    return styleMap(this.gridTemplateObj());
  }

  private gridTemplateObj(): Record<string, string> {
    const parts: string[] = [];
    if (this.selectable === 'row') {
      parts.push('var(--size-target-min)');
    }
    for (const column of this.columns) {
      parts.push(`${this.columnWidth(column)}px`);
    }
    return { gridTemplateColumns: parts.join(' ') };
  }

  private pinnedStyle(column: DataGridColumn): Record<string, string> {
    if (!column.pinned) {
      return {};
    }
    const index = this.columns.findIndex((candidate) => candidate.key === column.key);
    if (column.pinned === 'start') {
      let left = 0;
      for (let i = 0; i < index; i += 1) {
        if (this.columns[i]?.pinned === 'start') {
          left += this.columnWidth(this.columns[i]!);
        }
      }
      return { insetInlineStart: `${left}px` };
    }
    let right = 0;
    for (let i = this.columns.length - 1; i > index; i -= 1) {
      if (this.columns[i]?.pinned === 'end') {
        right += this.columnWidth(this.columns[i]!);
      }
    }
    return { insetInlineEnd: `${right}px` };
  }

  /** One vertical guide line per ancestor level, aligned to each level's expand-button center. */
  private guideLayers(level: number): Record<string, string> {
    if (level <= 1) {
      return {};
    }
    const count = level - 1;
    const image = new Array(count)
      .fill('linear-gradient(var(--ds-tree-grid-guide-line), var(--ds-tree-grid-guide-line))')
      .join(', ');
    const size = new Array(count).fill('var(--ds-tree-grid-guide-line-width) 100%').join(', ');
    const repeat = new Array(count).fill('no-repeat').join(', ');
    const position = Array.from(
      { length: count },
      (_, i) => `calc(var(--space-2) + ${i} * var(--ds-tree-grid-indent) + var(--ds-tree-grid-expand-button-size) / 2) 0`,
    ).join(', ');
    return { backgroundImage: image, backgroundSize: size, backgroundRepeat: repeat, backgroundPosition: position };
  }

  private measureRowHeight(): void {
    const varName = this.density === 'comfortable' ? '--size-target-comfortable' : '--size-target-min';
    const raw = getComputedStyle(this).getPropertyValue(varName).trim();
    this.rowHeightPx = Number.parseFloat(raw) || 32;
  }

  /* ---------- text ---------- */

  private cellId(rowId: string, column: string): string {
    return `${this.instanceId}-c-${rowId}-${column}`;
  }

  private rowIdAtActive(): string | undefined {
    return this.visibleRows()[this.activeRowIndex]?.row.id;
  }

  private activeDescendantId(rows: VisibleRow[]): string | undefined {
    if (this.activeRowIndex === -1) {
      return this.activeColKey ? `${this.instanceId}-h-${this.activeColKey}` : undefined;
    }
    const vr = rows[this.activeRowIndex];
    return vr && this.activeColKey ? this.cellId(vr.row.id, this.activeColKey) : undefined;
  }

  private positionText(rows: VisibleRow[]): string {
    const column = this.columns.find((c) => c.key === this.activeColKey);
    if (this.activeRowIndex === -1) {
      return column ? COPY_POSITION(1, column.header) : '';
    }
    const vr = rows[this.activeRowIndex];
    if (!vr || !column) {
      return '';
    }
    return COPY_POSITION(this.activeRowIndex + 2, column.header);
  }

  private statusText(total: number): string {
    if (this.editing?.error) {
      return COPY_INVALID(this.editing.error);
    }
    if (this.editing) {
      const column = this.columns.find((c) => c.key === this.editing?.column);
      return COPY_EDITING(column?.header ?? this.editing.column);
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    if (this.selectable === 'row') {
      const count = this.currentSelectedRows().length;
      if (count > 0) {
        return COPY_SELECTED_ROWS(count, total);
      }
    }
    return COPY_ROW_COUNT(total);
  }

  /* ---------- scrolling / virtualization ---------- */

  private handleScroll(): void {
    const el = this.gridEl;
    if (!el) {
      return;
    }
    this.bodyScrollTop = el.scrollTop;
    this.toggleAttribute('data-header-scrolled', el.scrollTop > 0);
  }

  private visibleRowRange(total: number): { start: number; end: number } {
    if (this.height === 'content' || this.rowHeightPx === 0) {
      return { start: 0, end: total - 1 };
    }
    const overscan = Math.max(1, Math.ceil(this.viewportPx / this.rowHeightPx));
    const start = Math.max(0, Math.floor(this.bodyScrollTop / this.rowHeightPx) - overscan);
    const end = Math.min(total - 1, Math.ceil((this.bodyScrollTop + this.viewportPx) / this.rowHeightPx) + overscan);
    return { start, end };
  }

  private ensureRowVisible(rowIndex: number): void {
    if (this.height === 'content' || !this.gridEl || this.rowHeightPx === 0) {
      return;
    }
    const top = rowIndex * this.rowHeightPx;
    const bottom = top + this.rowHeightPx;
    if (top < this.gridEl.scrollTop) {
      this.gridEl.scrollTop = top;
    } else if (bottom > this.gridEl.scrollTop + this.viewportPx) {
      this.gridEl.scrollTop = bottom - this.viewportPx;
    }
  }

  /* ---------- keyboard / focus / click ---------- */

  private handleGridClick(event: MouseEvent): void {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && el.dataset.dsCellKey) as
      | HTMLElement
      | undefined;
    if (!target) {
      return;
    }
    const rowId = target.dataset.dsCellRow;
    const colKey = target.dataset.dsCellKey!;
    const rows = this.visibleRows();
    const rowIndex = rowId === undefined ? -1 : rows.findIndex((vr) => vr.row.id === rowId);
    this.setActive(rowIndex, colKey);
    if (rowIndex === -1 || !rowId) {
      return;
    }
    if (this.selectable === 'cell') {
      this.commitCellSelection({ rowId, column: colKey });
    }
  }

  private handleGridDblClick(event: MouseEvent): void {
    const target = event.composedPath().find((el) => el instanceof HTMLElement && el.dataset.dsCellKey) as
      | HTMLElement
      | undefined;
    if (!target?.dataset.dsCellRow) {
      return;
    }
    const rows = this.visibleRows();
    const vr = rows.find((r) => r.row.id === target.dataset.dsCellRow);
    const column = this.columns.find((c) => c.key === target.dataset.dsCellKey);
    if (vr && !vr.placeholder && column) {
      this.startEdit(column, vr.row);
    }
  }

  private setActive(rowIndex: number, colKey: string): void {
    this.activeRowIndex = rowIndex;
    this.activeColKey = colKey;
  }

  private moveActiveRow(delta: number, rows: VisibleRow[]): void {
    const rowIndex = Math.max(-1, Math.min(rows.length - 1, this.activeRowIndex + delta));
    this.setActive(rowIndex, this.activeColKey || this.effectiveColumnKeys()[0]!);
    if (rowIndex >= 0) {
      this.ensureRowVisible(rowIndex);
    }
  }

  private moveActiveCol(delta: number): void {
    const keys = this.effectiveColumnKeys();
    let colIndex = Math.max(0, keys.indexOf(this.activeColKey) + delta);
    colIndex = Math.min(colIndex, keys.length - 1);
    this.setActive(this.activeRowIndex, keys[colIndex] ?? keys[0]!);
  }

  private handleGridKeydown(event: KeyboardEvent): void {
    if (this.editing) {
      return;
    }
    const rows = this.visibleRows();
    if (this.activeColKey === '') {
      this.setActive(-1, this.effectiveColumnKeys()[0] ?? '');
    }
    const currentColumn = this.columns.find((c) => c.key === this.activeColKey);
    const isRowHeaderCol = Boolean(currentColumn?.isRowHeader);
    const activeVr = rows[this.activeRowIndex];

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActiveRow(1, rows);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActiveRow(-1, rows);
        return;
      case 'ArrowRight':
        event.preventDefault();
        if (isRowHeaderCol && activeVr?.hasChildren && !this.isExpanded(activeVr.row.id)) {
          this.toggleExpand(activeVr);
          return;
        }
        this.moveActiveCol(1);
        return;
      case 'ArrowLeft':
        event.preventDefault();
        if (isRowHeaderCol && activeVr) {
          if (activeVr.hasChildren && this.isExpanded(activeVr.row.id)) {
            this.toggleExpand(activeVr);
            return;
          }
          if (activeVr.parentId) {
            const parentIndex = rows.findIndex((r) => r.row.id === activeVr.parentId);
            if (parentIndex !== -1) {
              this.setActive(parentIndex, this.activeColKey);
              this.ensureRowVisible(parentIndex);
            }
          }
          return;
        }
        this.moveActiveCol(-1);
        return;
      case 'Home': {
        event.preventDefault();
        const keys = this.effectiveColumnKeys();
        if (event.ctrlKey) {
          this.setActive(-1, keys[0]!);
        } else {
          this.setActive(this.activeRowIndex, keys[0]!);
        }
        return;
      }
      case 'End': {
        event.preventDefault();
        const keys = this.effectiveColumnKeys();
        if (event.ctrlKey) {
          this.setActive(rows.length - 1, keys[keys.length - 1]!);
          this.ensureRowVisible(rows.length - 1);
        } else {
          this.setActive(this.activeRowIndex, keys[keys.length - 1]!);
        }
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (this.activeRowIndex === -1) {
          if (currentColumn?.sortable) {
            this.handleSort(currentColumn.key);
          }
          return;
        }
        if (!activeVr || activeVr.placeholder) {
          return;
        }
        if (isRowHeaderCol) {
          if (activeVr.hasChildren) {
            this.toggleExpand(activeVr);
            return;
          }
          this.activateCellControl(activeVr, currentColumn);
          return;
        }
        if (currentColumn?.editable) {
          this.startEdit(currentColumn, activeVr.row);
          return;
        }
        this.activateCellControl(activeVr, currentColumn);
        return;
      case '*':
        event.preventDefault();
        if (activeVr) {
          this.expandSiblings(activeVr);
        }
        return;
      case 'F2':
        event.preventDefault();
        if (activeVr && !activeVr.placeholder && currentColumn?.editable) {
          this.startEdit(currentColumn, activeVr.row);
        }
        return;
      case 'Escape':
        return;
      case ' ':
        if (this.selectable === 'row') {
          event.preventDefault();
          if (activeVr && !activeVr.placeholder) {
            if (event.shiftKey) {
              this.extendRowSelection(activeVr, rows);
            } else {
              this.toggleRowSelection(activeVr);
              this.selectionAnchorId = activeVr.row.id;
            }
          }
        }
        return;
      case 'a':
      case 'A':
        if (event.ctrlKey && this.selectable === 'row') {
          event.preventDefault();
          const selectableRows = rows.filter((r) => !r.placeholder);
          let ids: string[] = [];
          for (const vr of selectableRows) {
            ids.push(vr.row.id);
            if (this.selectChildren) {
              ids.push(...this.collectDescendantIds(vr.row));
            }
          }
          this.commitRowSelection([...new Set(ids)]);
        }
        return;
    }
  }

  /** Best-effort activation of a control rendered by `column.render` (Link, Button, Checkbox); the doc names this
      case but a consumer-rendered cell's DOM shape isn't known ahead of time. */
  private activateCellControl(vr: VisibleRow | undefined, column: DataGridColumn | undefined): void {
    if (!vr || !column || vr.placeholder) {
      return;
    }
    const cellEl = this.renderRoot.querySelector(`#${CSS.escape(this.cellId(vr.row.id, column.key))}`);
    const control = cellEl?.querySelector('ds-button, ds-link, ds-checkbox, button, a[href], [role="button"]') as
      | HTMLElement
      | undefined;
    control?.click();
  }

  /* ---------- overrides / dev warnings ---------- */

  private get captionOverrides(): Partial<Record<HeadingOverridableBinding, TokenRef | undefined>> {
    return { marginBlockEnd: 'space.0' };
  }

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TreeGridOverridableBinding[]) {
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
      console.warn('<ds-tree-grid> requires a `caption`.', this);
    }
    if (this.columns.length > 0 && !this.columns.some((column) => column.isRowHeader)) {
      console.warn('<ds-tree-grid> has no column with `isRowHeader: true`.', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tree-grid': DsTreeGrid;
  }
}
