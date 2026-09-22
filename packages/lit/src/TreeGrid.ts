import { LitElement, css, html, nothing, type CSSResult, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cssVar, type TokenRef } from '@design-schema/tokens';
import './Button.js';
import './Checkbox.js';
import './DatePicker.js';
import './Heading.js';
import './Icon.js';
import './Input.js';
import './NumberInput.js';
import './Select.js';
import './Text.js';
import type { ButtonOverridableBinding } from './Button.js';
import type { CheckboxChangeDetail, DsCheckbox } from './Checkbox.js';
import type { DataGridColumn } from './DataGrid.js';
import type { DatePickerOverridableBinding, DsDatePicker } from './DatePicker.js';
import type { DsInput, InputOverridableBinding } from './Input.js';
import type { DsNumberInput, NumberInputOverridableBinding } from './NumberInput.js';
import type { DsSelect, SelectOverridableBinding } from './Select.js';

/**
 * A node. `id` must be stable across renders. `children: "lazy"` marks a row whose children are loaded on expand
 * through the `expand` event; the row shows the expand button and a loading row until `data` is updated.
 * `children: []` is a leaf: no expand button and no aria-expanded.
 */
export interface TreeGridRow {
  id: string;
  children?: TreeGridRow[] | 'lazy' | undefined;
  [key: string]: unknown;
}

export type TreeGridSortDirection = 'ascending' | 'descending';

export interface TreeGridSort {
  column: string;
  direction: TreeGridSortDirection;
}

export type TreeGridSelectable = 'none' | 'row' | 'cell';
export type TreeGridDensity = 'compact' | 'comfortable';
export type TreeGridHeight = 'content' | 'viewport' | 'fixed';
/** Heading level of the caption in the page outline; its size stays DataGrid's caption size regardless. */
export type TreeGridCaptionLevel = '2' | '3' | '4';

export interface TreeGridCellRef {
  rowId: string;
  column: string;
}

/** Row ids (`row`) or one cell (`cell`), matching `selectable`. */
export type TreeGridSelection = string[] | TreeGridCellRef;

/** A committed cell value; `undefined` when Delete/Backspace clears the cell or the row had none. */
export type TreeGridCellValue = string | number | boolean | undefined;

/** Detail carried by the `expand-change` CustomEvent: every expanded id, as a bare array. */
export type TreeGridExpandChangeDetail = string[];

/** Detail carried by the `expand` CustomEvent: the id of the `children: "lazy"` row being expanded, bare. */
export type TreeGridExpandDetail = string;

/** Detail carried by the `sort-change` CustomEvent. */
export interface TreeGridSortChangeDetail {
  column: string;
  direction: TreeGridSortDirection;
}

/** Detail carried by the `selection-change` CustomEvent. */
export interface TreeGridSelectionChangeDetail {
  selection: TreeGridSelection;
}

/** Detail carried by the `cell-change` CustomEvent. The caller updates `data`; the grid shows the old value until then. */
export interface TreeGridCellChangeDetail {
  rowId: string;
  column: string;
  value: TreeGridCellValue;
  previous: TreeGridCellValue;
}

/** Detail carried by the cancelable `edit-start` CustomEvent: `preventDefault()` refuses the edit. */
export interface TreeGridEditStartDetail {
  rowId: string;
  column: string;
}

/** Detail carried by the `column-resize` CustomEvent. */
export interface TreeGridColumnResizeDetail {
  column: string;
  width: number;
}

/* copy.* — used verbatim. `level`, `childCount`, `expandAll` and `collapseAll` belong to the native platforms. */
const COPY_EXPAND = (rowName: string): string => `Expand ${rowName}`;
const COPY_COLLAPSE = (rowName: string): string => `Collapse ${rowName}`;
const COPY_LOADING = 'Loading';
const COPY_EMPTY = 'Nothing to show.';
const COPY_SORT_ASCENDING = (column: string): string => `Sort by ${column}, ascending`;
const COPY_SORT_DESCENDING = (column: string): string => `Sort by ${column}, descending`;
const COPY_SORTED_ANNOUNCEMENT = (column: string, direction: string): string => `Sorted by ${column}, ${direction}`;
const COPY_SELECT_ALL = 'Select all rows';
const COPY_SELECT_ROW = (rowName: string): string => `Select ${rowName}`;
const COPY_SELECTED_ROWS = (count: number, total: number): string => `${count} of ${total} rows selected`;
const COPY_EDITING = (column: string): string => `Editing ${column}. Enter to save, Escape to cancel.`;
const COPY_INVALID = (message: string): string => `${message}`;
const COPY_ROW_COUNT = {
  one: (count: number): string => `${count} row`,
  other: (count: number): string => `${count} rows`,
};
const COPY_POSITION = (row: number, column: string): string => `Row ${row}, ${column}`;
const COPY_RESIZE = (column: string): string => `Resize ${column}`;
const COPY_SCROLL_HINT = 'Scroll sideways to see more columns';

/** DataGrid's column width when `width` is omitted (literal-ok: the doc's pixel default, a multiple of space.1). */
const DEFAULT_COLUMN_WIDTH = 160;

/** Rows rendered before one has been measured; they are positioned from the row-size token (literal-ok: the doc's cap). */
const UNMEASURED_ROW_CAP = 50;

/** Selects `one`/`other` with the document locale's plural rules. */
function pluralForm(count: number): 'one' | 'other' {
  return new Intl.PluralRules(document.documentElement.lang || undefined).select(count) === 'one' ? 'one' : 'other';
}

/** `showStatusBar`/`stickyHeader` default true, so their attributes are the negated `no-status-bar`/`no-sticky-header`. */
const NEGATED_BOOLEAN = {
  fromAttribute(value: string | null): boolean {
    return value === null;
  },
  toAttribute(value: boolean): string | null {
    return value ? null : '';
  },
};

/**
 * Overridable style hooks; see the `overrides` property. `expandButtonSize`, `loadingColor`, `focusRing`,
 * `focusRingWidth` and `minTarget` are accessibility-bearing and locked, and DataGrid's own bindings (header, grid
 * lines, row height, status bar, caption, resize handle, resizeStep) apply at DataGrid's defaults and are not
 * overridable here.
 */
export type TreeGridOverridableBinding =
  | 'indent'
  | 'expandGap'
  | 'guideLine'
  | 'guideLineWidth'
  | 'cellPaddingInline'
  | 'fixedHeight'
  | 'parentWeight'
  | 'transition';

const HOOKS: Record<TreeGridOverridableBinding, string> = {
  indent: '--ds-tree-grid-indent',
  expandGap: '--ds-tree-grid-expand-gap',
  guideLine: '--ds-tree-grid-guide-line',
  guideLineWidth: '--ds-tree-grid-guide-line-width',
  cellPaddingInline: '--ds-tree-grid-cell-padding-inline',
  fixedHeight: '--ds-tree-grid-fixed-height',
  parentWeight: '--ds-tree-grid-parent-weight',
  transition: '--ds-tree-grid-transition',
};

/* Editors are composed with their inset zeroed through their own overrides. */
const INPUT_INSET: Partial<Record<InputOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
const NUMBER_INSET: Partial<Record<NumberInputOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
const SELECT_INSET: Partial<Record<SelectOverridableBinding, TokenRef | undefined>> = {
  triggerPaddingBlock: 'space.0',
  triggerPaddingInline: 'space.0',
};
const DATE_INSET: Partial<Record<DatePickerOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};
/** The sort Button's text lines up with the cells. */
const SORT_BUTTON_INSET: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {
  paddingInline: 'space.0',
};
/** The expand Button fills the reserved `expandButtonSize` square, so its own inset is zeroed. */
const EXPAND_BUTTON_INSET: Partial<Record<ButtonOverridableBinding, TokenRef | undefined>> = {
  paddingBlock: 'space.0',
  paddingInline: 'space.0',
};

/** Content that takes focus inside a cell; demoted to `tabindex="-1"` so the grid stays one tab stop. */
const CELL_CONTROLS = 'a[href], button, input, select, textarea, [tabindex], ds-button, ds-link, ds-checkbox';

/**
 * The key suffix of the loading placeholder row under an expanded lazy row; no real id contains a NUL, and the
 * character is built rather than written so the source file stays plain ASCII.
 */
const PLACEHOLDER_SUFFIX = `${String.fromCharCode(0)}loading`;

/** One entry of the flattened visible-row list: what is virtualized and counted by aria-rowindex. */
interface VisibleRow {
  key: string;
  /** Undefined for the loading placeholder row. */
  row: TreeGridRow | undefined;
  parentId: string | undefined;
  level: number;
  posinset: number;
  setsize: number;
  hasChildren: boolean;
  expanded: boolean;
  lazy: boolean;
}

interface SelectState {
  checked: boolean;
  indeterminate: boolean;
}

interface EditingState {
  rowId: string;
  column: string;
  /** A typed character that opened a text or number editor; replaces the value. */
  seed?: string | undefined;
  error?: string | undefined;
}

/** A data value as `cell-change` reports it; a cell with no value reports `undefined`. */
function cellValue(raw: unknown): TreeGridCellValue {
  if (raw === undefined || raw === null) {
    return undefined;
  }
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return raw;
  }
  return String(raw);
}

function textOf(raw: unknown): string {
  return raw === undefined || raw === null ? '' : String(raw);
}

function compareValues(left: unknown, right: unknown): number {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return textOf(left).localeCompare(textOf(right), undefined, { numeric: true });
}

/** An IDREF-safe token for a row key. */
function idToken(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadedChildren(row: TreeGridRow): TreeGridRow[] {
  return Array.isArray(row.children) ? row.children : [];
}

/** Every loaded descendant of `row`, in tree order. */
function descendantsOf(row: TreeGridRow): TreeGridRow[] {
  const out: TreeGridRow[] = [];
  const walk = (rows: TreeGridRow[]): void => {
    for (const child of rows) {
      out.push(child);
      walk(loadedChildren(child));
    }
  };
  walk(loadedChildren(row));
  return out;
}

/**
 * `<ds-tree-grid>` — TreeGrid (category: data, APG pattern: treegrid).
 *
 * `<ds-tree-grid caption="Chart of accounts" .columns=${columns} .data=${tree} .expanded=${['assets']}>` follows
 * `ds-data-grid`'s structure: `div`s with explicit `treegrid`/`rowgroup`/`row`/`columnheader`/`rowheader`/`gridcell`
 * roles, the grid element as the one tab stop pointing `aria-activedescendant` at the current cell, and the body
 * virtualized over the flattened visible rows for `height: viewport` and `fixed`. Each row carries `aria-level`,
 * `aria-setsize`, `aria-posinset`, and `aria-expanded` when it has children. The row header holds the indent (with
 * one guide line per ancestor level), the `aria-hidden` expand `ds-button` and the cell content.
 *
 * @fires expand-change - Expansion changed; detail is the bare array of expanded ids.
 * @fires expand - A `children: "lazy"` row opened; detail is its bare id.
 * @fires sort-change - A sortable header was activated, with `{ column, direction }`.
 * @fires selection-change - The selection changed, with `{ selection }` (row ids or one cell).
 * @fires cell-change - An edit committed, with `{ rowId, column, value, previous }`.
 * @fires edit-start - An editor is about to open, with `{ rowId, column }`; cancelable.
 * @fires column-resize - A column resize finished, with `{ column, width }`.
 */
@customElement('ds-tree-grid')
export class DsTreeGrid extends LitElement {
  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static override styles: CSSResult = css`
    :host {
      display: block;
      --ds-tree-grid-indent: var(--space-5);
      --ds-tree-grid-expand-gap: var(--layout-gap-tight);
      --ds-tree-grid-guide-line: var(--color-border);
      --ds-tree-grid-guide-line-width: var(--border-width-thin);
      --ds-tree-grid-cell-padding-inline: var(--space-2);
      --ds-tree-grid-fixed-height: var(--space-20);
      --ds-tree-grid-parent-weight: var(--font-weight-medium);
      --ds-tree-grid-transition: var(--motion-duration-fast);
      /* minTarget (locked): the row-height floor. Virtualization measures a rendered row instead. */
      --ds-tree-grid-row-size: var(--size-target-min);
      font-family: var(--font-family-body);
      font-size: var(--font-size-sm);
      line-height: var(--font-line-height-tight);
      color: var(--color-foreground);
    }

    :host([density='comfortable']) {
      --ds-tree-grid-row-size: var(--size-target-comfortable);
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

    [data-part='container'] {
      position: relative;
    }
    /*
     * viewport and fixed size the whole component; the scroll region takes what the caption and status bar leave,
     * so the grid scrolls rather than the page.
     */
    :host([height='viewport']) [data-part='container'],
    :host([height='fixed']) [data-part='container'] {
      display: flex;
      flex-direction: column;
    }
    :host([height='viewport']) [data-part='container'] {
      block-size: calc(100vh - 2 * var(--layout-gap-section));
    }
    :host([height='fixed']) [data-part='container'] {
      block-size: var(--ds-tree-grid-fixed-height);
    }

    [data-part='caption'] {
      padding-block-end: var(--space-2);
    }
    [data-part='caption'] ds-heading {
      --ds-heading-font-size: var(--font-size-md);
      --ds-heading-font-weight: var(--font-weight-semibold);
      --ds-heading-margin-block-end: var(--space-0);
    }

    [data-part='scrollRegion'] {
      position: relative;
      overflow: auto;
      background: var(--color-background);
      border: var(--border-width-thin) solid var(--color-border);
    }
    :host([height='viewport']) [data-part='scrollRegion'],
    :host([height='fixed']) [data-part='scrollRegion'] {
      flex: 1 1 auto;
      min-block-size: 0;
    }
    /* focusRing / focusRingWidth (locked): the grid is the tab stop */
    [data-part='scrollRegion']:has([data-part='grid']:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    [data-part='grid'] {
      position: relative;
      outline: none;
    }

    [data-part='header'] {
      z-index: 3;
    }
    [data-part='header'].sticky {
      position: sticky;
      inset-block-start: 0;
    }
    [data-part='header'].raised {
      box-shadow: var(--shadow-raised);
    }

    .row-layout {
      display: grid;
      box-sizing: border-box;
    }

    [data-part='headerRow'],
    [data-part='row'] {
      block-size: var(--ds-tree-grid-row-size);
    }

    [data-part='body'] {
      position: relative;
    }

    /* Rows appear instantly: no height animation in a virtualized grid. */
    [data-part='row'] {
      position: relative;
      z-index: 1;
    }
    [data-part='row'].virtual {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
    }
    [data-part='row']:hover {
      background: var(--color-action-ghost-background-hover);
    }
    [data-part='row'][aria-selected='true'] {
      background: var(--color-background-subtle);
    }
    /* A start-edge bar, so selection is not fill alone */
    [data-part='row'][aria-selected='true'] > :first-child {
      box-shadow: inset var(--border-width-focus) 0 0 0 var(--color-control-selected-background);
    }
    [data-part='row'][aria-selected='true'] > :first-child:dir(rtl) {
      box-shadow: inset calc(-1 * var(--border-width-focus)) 0 0 0 var(--color-control-selected-background);
    }

    /* cellPaddingInline: the cells' own inset, and the base of the guide-line offset */
    .cell {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      min-inline-size: 0;
      padding-inline: var(--ds-tree-grid-cell-padding-inline);
      border-inline-end: var(--border-width-thin) solid var(--color-border);
      border-block-end: var(--border-width-thin) solid var(--color-border);
      overflow: hidden;
      white-space: nowrap;
      outline: none;
    }
    [data-part='cellContent'] {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    [data-part='columnHeader'],
    .select-all-cell {
      background: var(--color-background-subtle);
      color: var(--color-foreground);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      border-block-end: var(--border-width-thin) solid var(--color-border-strong);
    }
    [data-part='sortButton'] {
      --ds-button-font-weight: var(--font-weight-semibold);
      --ds-button-font-size: var(--font-size-sm);
    }

    [data-part='rowHeader'],
    [data-part='cell'] {
      color: var(--color-foreground);
    }
    /* Existing rows stay while loading, but read as stale */
    .cell.muted {
      color: var(--color-foreground-muted);
    }
    .cell.numeric {
      font-family: var(--font-family-mono);
      font-variant-numeric: tabular-nums;
    }
    .cell.align-end {
      justify-content: flex-end;
      text-align: end;
    }
    .cell.align-center {
      justify-content: center;
      text-align: center;
    }

    /* indent: per level, on the row header's indent part; guide lines hang from it */
    [data-part='indent'] {
      flex: none;
      align-self: stretch;
    }
    .guide {
      position: absolute;
      inset-block: 0;
      inline-size: var(--ds-tree-grid-guide-line-width);
      background: var(--ds-tree-grid-guide-line);
      pointer-events: none;
    }

    /* expandGap: between the expand control and the row header text */
    .node {
      display: flex;
      align-items: center;
      gap: var(--ds-tree-grid-expand-gap);
      min-inline-size: 0;
      block-size: 100%;
    }

    /* expandButtonSize (locked): the reserved square the guide lines align to */
    .expand-chevron,
    .expand-spacer {
      flex: none;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: var(--size-target-min);
    }
    [data-part='expandButton'] ds-button {
      inline-size: var(--size-target-min);
      block-size: var(--size-target-min);
    }
    /* transition: the chevron rotation, on the span around the Button and never on the Icon */
    .expand-chevron {
      transition: transform var(--ds-tree-grid-transition) var(--motion-easing-standard);
    }
    .expand-chevron[data-expanded] {
      transform: rotate(90deg);
    }
    .expand-chevron:dir(rtl) {
      transform: scaleX(-1);
    }
    .expand-chevron[data-expanded]:dir(rtl) {
      transform: scaleX(-1) rotate(90deg);
    }

    /* parentWeight: row headers of rows with children */
    .cell.parent [data-part='cellContent'] {
      font-weight: var(--ds-tree-grid-parent-weight);
    }
    /* loadingColor (locked): the lazy-loading placeholder text */
    .loading-text {
      color: var(--color-foreground-muted);
    }

    /* minTarget (locked) */
    .select-cell,
    .select-all-cell {
      justify-content: center;
      padding-inline: 0;
      min-inline-size: var(--size-target-min);
    }

    .pinned-start,
    .pinned-end {
      position: sticky;
      z-index: 2;
      background: var(--color-background);
    }
    [data-part='columnHeader'].pinned-start,
    [data-part='columnHeader'].pinned-end,
    .select-all-cell.pinned-start {
      z-index: 4;
      background: var(--color-background-subtle);
    }
    .x-scrolled .pinned-start,
    .x-scrolled .pinned-end {
      box-shadow: var(--shadow-raised);
    }

    /* focusRing / focusRingWidth (locked): inset, so neighbors and the scroll region never clip it */
    [data-part='grid']:focus-within .cell.active::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-focus);
    }

    .cell.editing {
      background: var(--color-control-background);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-focus);
    }
    [data-part='cell'].editing {
      padding-inline: 0;
    }
    .cell.invalid {
      background: var(--color-status-danger-background);
      box-shadow: inset 0 0 0 var(--border-width-focus) var(--color-border-danger);
    }
    /* The status-bar message re-scopes the foreground around a default-tone Text */
    .invalid-message {
      display: inline-flex;
      background: var(--color-status-danger-background);
      --color-foreground: var(--color-status-danger-foreground);
    }
    .editor-frame {
      display: flex;
      align-items: center;
      inline-size: 100%;
      block-size: 100%;
    }
    .editor-frame > * {
      inline-size: 100%;
    }

    .resize-handle {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      inline-size: var(--space-1);
      cursor: col-resize;
      touch-action: none;
      z-index: 5;
    }
    [data-part='columnHeader']:hover .resize-handle,
    [data-part='grid']:focus-within [data-part='columnHeader'].active .resize-handle,
    .resize-handle.dragging {
      background: var(--color-border-strong);
    }

    .empty-row {
      display: flex;
      align-items: center;
      justify-content: center;
      min-block-size: var(--size-target-comfortable);
      padding-inline: var(--ds-tree-grid-cell-padding-inline);
    }

    .status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      /* Between items; no separator characters */
      gap: var(--space-2);
      padding: var(--space-2);
      background: var(--color-background-subtle);
      border: var(--border-width-thin) solid var(--color-border);
      border-block-start: 0;
    }
    .status-bar ds-text {
      --ds-text-font-size: var(--font-size-xs);
    }
    /* The position sits at the trailing edge; everything else reads from the start. */
    .status-bar .trailing {
      margin-inline-start: auto;
    }

    /* minTarget (locked) and DataGrid's resizeStep read as lengths, never as numbers in code. */
    .probe {
      position: absolute;
      visibility: hidden;
      pointer-events: none;
      block-size: var(--size-target-min);
    }
    .probe-step {
      display: block;
      inline-size: var(--space-4);
    }

    @media (prefers-reduced-motion: reduce) {
      .expand-chevron {
        transition: none;
      }
    }
  `;

  /** What the tree grid holds ("Chart of accounts"). The accessible name; visually hidden with `hideCaption`. */
  @property() accessor caption = '';

  /** Heading level of the caption in the page outline; its size stays the caption size, as DataGrid. */
  @property({ type: String, reflect: true, attribute: 'caption-level' })
  accessor captionLevel: TreeGridCaptionLevel = '2';

  /** Visually hide the caption; it remains the accessible name. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-caption' }) accessor hideCaption = false;

  /** DataGrid's column model; the `isRowHeader` column must exist and come first. A property, not an attribute. */
  @property({ attribute: false }) accessor columns: DataGridColumn[] = [];

  /** Nested rows. A property, not an attribute. */
  @property({ attribute: false }) accessor data: TreeGridRow[] = [];

  /** Controlled ids of expanded rows. */
  @property({ attribute: false }) accessor expanded: string[] | undefined;

  /** Initially expanded ids. `["*"]` expands every row with loaded children, never a `"lazy"` one. */
  @property({ attribute: false }) accessor defaultExpanded: string[] | undefined;

  /** Controlled sort; applies within each level and the caller orders `data`. */
  @property({ attribute: false }) accessor sort: TreeGridSort | undefined;

  /** Initial sort; the grid orders siblings itself. */
  @property({ attribute: false }) accessor defaultSort: TreeGridSort | undefined;

  /** `row` adds a checkbox column; `cell` selects the focused cell. */
  @property({ type: String, reflect: true }) accessor selectable: TreeGridSelectable = 'none';

  /** Controlled selected row ids. */
  @property({ attribute: false }) accessor selected: string[] | undefined;

  /** Initially selected row ids. */
  @property({ attribute: false }) accessor defaultSelected: string[] | undefined;

  /** A parent row's checkbox sets or clears it and every loaded descendant; parents show derived state. */
  @property({ type: Boolean, reflect: true, attribute: 'select-children' }) accessor selectChildren = false;

  /** Master switch: cells whose column is `editable` can be edited. */
  @property({ type: Boolean, reflect: true }) accessor editable = false;

  /** Row height. */
  @property({ type: String, reflect: true }) accessor density: TreeGridDensity = 'compact';

  /** `viewport`: 100vh − 2 × layout.gap.section; `content`: grows with rows, not virtualized; `fixed`: `overrides.fixedHeight`. */
  @property({ type: String, reflect: true }) accessor height: TreeGridHeight = 'viewport';

  /** Sets aria-busy and shows `copy.loading` in the status bar; existing rows stay. */
  @property({ type: Boolean, reflect: true }) accessor loading = false;

  /** The footer status line. Attribute: `no-status-bar`. */
  @property({ attribute: 'no-status-bar', reflect: true, converter: NEGATED_BOOLEAN })
  accessor showStatusBar = true;

  /** The header stays visible while the body scrolls; always true when virtualized. Attribute: `no-sticky-header`. */
  @property({ attribute: 'no-sticky-header', reflect: true, converter: NEGATED_BOOLEAN })
  accessor stickyHeader = true;

  /** Shown when there are no rows. Defaults to `copy.empty`. */
  @property({ attribute: 'empty-message' }) accessor emptyMessage: string | undefined;

  /** Per-instance style overrides: `{ indent: 'space.4' }`. Locked bindings are not accepted. */
  @property({ attribute: false }) accessor overrides:
    | Partial<Record<TreeGridOverridableBinding, TokenRef | undefined>>
    | undefined;

  @state() private accessor internalExpanded: string[] = [];
  /**
   * The `"lazy"` rows the user has opened. A lazy row cannot be opened programmatically: its id in `expanded` or
   * `defaultExpanded` (or a `"*"` there) is held collapsed until a user act, and the id still travels in the
   * caller's array and in what `expand-change` reports.
   */
  @state() private accessor lazyOpened: string[] = [];
  @state() private accessor internalSort: TreeGridSort | undefined;
  @state() private accessor internalSelected: string[] = [];
  /** The active cell: row -1 is the header row; col 0 is the selection column in row mode. */
  @state() private accessor activeRow = -1;
  @state() private accessor activeCol = 0;
  @state() private accessor editing: EditingState | undefined;
  @state() private accessor columnWidths: Record<string, number> = {};
  @state() private accessor message = '';
  @state() private accessor bodyScrollTop = 0;
  @state() private accessor scrolledX = false;
  @state() private accessor overflowX = false;
  @state() private accessor viewportHeight = 0;
  @state() private accessor headerHeight = 0;
  @state() private accessor rowHeightPx = 0;
  @state() private accessor draggingColumn: string | undefined;

  @query('[data-part="scrollRegion"]') private accessor scrollEl!: HTMLElement | null;
  @query('[data-part="grid"]') private accessor gridEl!: HTMLElement | null;
  @query('.probe') private accessor probeEl!: HTMLElement | null;
  @query('.probe-step') private accessor probeStepEl!: HTMLElement | null;

  private visibleCache:
    | {
        data: TreeGridRow[];
        expanded: string[];
        lazyOpened: string[];
        sort: TreeGridSort | undefined;
        rows: VisibleRow[];
      }
    | undefined;
  private indexCache:
    | { data: TreeGridRow[]; byId: Map<string, { row: TreeGridRow; parentId: string | undefined }>; loaded: TreeGridRow[] }
    | undefined;
  /** The visible rows of the last render, so the active cell follows its row when the list changes. */
  private renderedRows: VisibleRow[] | undefined;
  private rowAnchorId: string | undefined;
  private resizeDrag: { column: string; startX: number; startWidth: number; rtl: boolean } | undefined;
  private keyboardResize: string | undefined;
  private scrollActivePending = false;
  private resizeObserver: ResizeObserver | undefined;
  private readonly warned = new Set<string>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'TreeGrid');
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (!this.hasUpdated) {
      this.internalExpanded = this.defaultExpanded ?? [];
      this.internalSort = this.defaultSort;
      this.internalSelected = this.defaultSelected ?? [];
    }
    if (changed.has('overrides')) {
      this.applyOverrides();
    }
    const rows = this.visible;
    const previous = this.renderedRows;
    const active = previous && this.activeRow >= 0 ? previous[this.activeRow] : undefined;
    if (previous && previous !== rows && active && rows[this.activeRow]?.key !== active.key) {
      // Rows moved above the active one (expand, `*`, sort) or its subtree collapsed: follow the row, else its nearest visible ancestor.
      let index = rows.findIndex((candidate) => candidate.key === active.key);
      let id = active.parentId;
      const byId = this.index.byId;
      while (index === -1 && id !== undefined) {
        const ancestor = id;
        index = rows.findIndex((candidate) => candidate.key === ancestor);
        id = byId.get(ancestor)?.parentId;
      }
      if (index !== -1) {
        this.activeRow = index;
      }
    }
    this.activeRow = clamp(this.activeRow, -1, rows.length - 1);
    this.activeCol = clamp(this.activeCol, 0, Math.max(0, this.colCount - 1));
  }

  protected override firstUpdated(): void {
    const region = this.scrollEl;
    if (region && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(region);
    }
    this.measure();
  }

  protected override updated(): void {
    this.renderedRows = this.visible;
    this.demoteCellControls();
    this.measure();
    if (this.scrollActivePending) {
      this.scrollActivePending = false;
      this.scrollActiveIntoView();
    }
    this.warnInDev();
  }

  protected override render(): TemplateResult {
    const rows = this.visible;
    const virtual = this.height !== 'content';
    const rowH = this.rowHeightPx;
    const layout = this.rowLayout();
    const states = this.selectable === 'row' ? this.selectionStates() : new Map<string, SelectState>();
    /* The spacer sets the scroll height for the whole list; before a row is measured it falls back to the token. */
    const bodyStyle: Record<string, string | undefined> = {
      blockSize:
        virtual && rows.length > 0
          ? rowH
            ? `${rows.length * rowH}px`
            : `calc(${Math.min(rows.length, UNMEASURED_ROW_CAP)} * var(--ds-tree-grid-row-size))`
          : undefined,
    };

    return html`
      <div data-part="container">
        <div data-part="caption" class=${classMap({ 'visually-hidden': this.hideCaption })}>
          <ds-heading id="caption" level=${this.captionLevel} size="md">${this.caption}</ds-heading>
        </div>
        <div
          data-part="scrollRegion"
          class=${classMap({ 'x-scrolled': this.scrolledX })}
          @scroll=${this.handleScroll}
        >
          <div
            data-part="grid"
            role="treegrid"
            tabindex="0"
            style=${styleMap({ inlineSize: `max(100%, ${layout.width})` })}
            aria-labelledby="caption"
            aria-describedby=${ifDefined(this.overflowX && !this.scrolledX ? 'scroll-hint' : undefined)}
            aria-rowcount=${rows.length + 1}
            aria-colcount=${this.colCount}
            aria-multiselectable=${ifDefined(
              this.selectable === 'none' ? undefined : String(this.selectable === 'row'),
            )}
            aria-readonly=${this.editable ? 'false' : 'true'}
            aria-busy=${ifDefined(this.loading ? 'true' : undefined)}
            aria-activedescendant=${ifDefined(this.activeDescendantId(rows))}
            @keydown=${this.handleKeydown}
            @keyup=${this.handleKeyup}
            @focusout=${this.handleGridFocusout}
            @pointerdown=${this.handlePointerdown}
            @dblclick=${this.handleDblclick}
          >
            ${this.renderHeader(layout)}
            <div role="rowgroup" data-part="body" style=${styleMap(bodyStyle)}>
              ${rows.length === 0 ? this.renderEmpty() : nothing}
              ${repeat(
                this.windowIndexes(rows.length),
                (index) => rows[index]!.key,
                (index) => this.renderRow(rows[index]!, index, layout, states),
              )}
            </div>
          </div>
        </div>
        ${this.renderStatusBar()}
        <span class="probe" aria-hidden="true"><span class="probe-step"></span></span>
      </div>
    `;
  }

  /* ---------- rendering ---------- */

  private renderHeader(layout: { columns: string; width: string }): TemplateResult {
    const sticky = this.stickyHeader || this.height !== 'content';
    return html`<div
      role="rowgroup"
      data-part="header"
      class=${classMap({ sticky, raised: sticky && this.bodyScrollTop > 0 })}
    >
      <div
        role="row"
        data-part="headerRow"
        class="row-layout"
        aria-rowindex="1"
        style=${styleMap({ gridTemplateColumns: layout.columns, inlineSize: layout.width })}
      >
        ${this.hasSelectColumn ? this.renderSelectAllCell() : nothing}
        ${this.columns.map((column, index) => this.renderColumnHeader(column, index + this.colOffset))}
      </div>
    </div>`;
  }

  /** Select-all covers every loaded row at every level, expanded or not. */
  private renderSelectAllCell(): TemplateResult {
    const loaded = this.index.loaded;
    const selected = new Set(this.currentSelected);
    const allSelected = loaded.length > 0 && loaded.every((row) => selected.has(row.id));
    const someSelected = !allSelected && loaded.some((row) => selected.has(row.id));
    return html`<div
      role="columnheader"
      id="h-0"
      data-row="-1"
      data-col="0"
      tabindex="-1"
      aria-colindex="1"
      class=${classMap({ cell: true, 'select-all-cell': true, 'pinned-start': true, active: this.isActive(-1, 0) })}
      style=${styleMap({ insetInlineStart: '0' })}
    >
      <ds-checkbox
        data-part="selectAllCell"
        tabindex="-1"
        label=${COPY_SELECT_ALL}
        hide-label
        .checked=${live(allSelected)}
        .indeterminate=${live(someSelected)}
        @change=${(event: CustomEvent<CheckboxChangeDetail>) => {
          event.stopPropagation();
          this.activeRow = -1;
          this.activeCol = 0;
          this.toggleAll();
          this.focusGrid();
        }}
      ></ds-checkbox>
    </div>`;
  }

  private renderColumnHeader(column: DataGridColumn, col: number): TemplateResult {
    const active = this.currentSort;
    const sorted = active?.column === column.key ? active.direction : undefined;
    const next: TreeGridSortDirection = sorted === 'ascending' ? 'descending' : 'ascending';
    const width = this.widthOf(column);
    return html`<div
      role="columnheader"
      id="h-${col}"
      data-part="columnHeader"
      data-row="-1"
      data-col=${col}
      tabindex="-1"
      aria-colindex=${col + 1}
      aria-sort=${ifDefined(column.sortable ? (sorted ?? 'none') : undefined)}
      class=${classMap({ ...this.cellClasses(column), active: this.isActive(-1, col) })}
      style=${styleMap(this.pinStyle(column))}
    >
      ${column.sortable
        ? html`<ds-button
            data-part="sortButton"
            tabindex="-1"
            variant="ghost"
            size="sm"
            label=${column.header}
            accessible-name=${next === 'ascending' ? COPY_SORT_ASCENDING(column.header) : COPY_SORT_DESCENDING(column.header)}
            .overrides=${SORT_BUTTON_INSET}
            @press=${(event: Event) => {
              event.stopPropagation();
              this.activeRow = -1;
              this.activeCol = col;
              this.sortBy(column);
              this.focusGrid();
            }}
          >
            ${sorted
              ? html`<ds-icon slot="trailing-icon" name=${sorted === 'ascending' ? 'chevron-up' : 'chevron-down'} inline></ds-icon>`
              : nothing}
          </ds-button>`
        : column.abbr
          ? // The visible header is aria-hidden beside the spoken `abbr`.
            html`<span data-part="cellContent" aria-hidden="true">${column.header}</span>
              <span class="visually-hidden">${column.abbr}</span>`
          : html`<span data-part="cellContent">${column.header}</span>`}
      ${column.resizable
        ? html`<div
            class=${classMap({ 'resize-handle': true, dragging: this.draggingColumn === column.key })}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow=${width}
            aria-label=${COPY_RESIZE(column.header)}
            @pointerdown=${(event: PointerEvent) => this.handleResizeDown(event, column)}
            @pointermove=${this.handleResizeMove}
            @pointerup=${this.handleResizeUp}
            @pointercancel=${this.handleResizeUp}
          ></div>`
        : nothing}
    </div>`;
  }

  private renderEmpty(): TemplateResult {
    return html`<div role="row" aria-rowindex="2" class="empty-row">
      <div role="gridcell" aria-colindex="1">
        <ds-text data-part="emptyState" element="p" tone="muted">${this.emptyMessage ?? COPY_EMPTY}</ds-text>
      </div>
    </div>`;
  }

  private renderRow(
    entry: VisibleRow,
    index: number,
    layout: { columns: string; width: string },
    states: Map<string, SelectState>,
  ): TemplateResult {
    const rowMode = this.selectable === 'row';
    const selectState = entry.row && rowMode ? states.get(entry.row.id) : undefined;
    const virtual = this.height !== 'content';
    return html`<div
      role="row"
      data-part="row"
      class=${classMap({ 'row-layout': true, virtual })}
      aria-rowindex=${index + 2}
      aria-level=${entry.level}
      aria-setsize=${entry.setsize}
      aria-posinset=${entry.posinset}
      aria-expanded=${ifDefined(entry.hasChildren ? String(entry.expanded) : undefined)}
      aria-busy=${ifDefined(entry.lazy && entry.expanded ? 'true' : undefined)}
      aria-selected=${ifDefined(rowMode && entry.row ? String(selectState?.checked ?? false) : undefined)}
      style=${styleMap({
        gridTemplateColumns: layout.columns,
        inlineSize: layout.width,
        /* Until a row has been measured, offsets come from the row-size token. */
        transform: virtual
          ? this.rowHeightPx
            ? `translateY(${index * this.rowHeightPx}px)`
            : `translateY(calc(${index} * var(--ds-tree-grid-row-size)))`
          : undefined,
      })}
    >
      ${rowMode ? this.renderSelectCell(entry, index, selectState) : nothing}
      ${this.columns.map((column, i) => this.renderCell(entry, index, column, i + this.colOffset))}
    </div>`;
  }

  private renderSelectCell(entry: VisibleRow, index: number, selectState: SelectState | undefined): TemplateResult {
    const row = entry.row;
    return html`<div
      role="gridcell"
      id=${this.cellId(entry.key, 0)}
      data-row=${index}
      data-col="0"
      tabindex="-1"
      aria-colindex="1"
      class=${classMap({ cell: true, 'select-cell': true, 'pinned-start': true, active: this.isActive(index, 0) })}
      style=${styleMap({ insetInlineStart: '0' })}
    >
      ${row
        ? html`<ds-checkbox
            data-part="selectCell"
            tabindex="-1"
            label=${COPY_SELECT_ROW(this.rowName(row))}
            hide-label
            .checked=${live(selectState?.checked ?? false)}
            .indeterminate=${live(selectState?.indeterminate ?? false)}
            @change=${(event: CustomEvent<CheckboxChangeDetail>) => {
              event.stopPropagation();
              this.activeRow = index;
              this.activeCol = 0;
              this.toggleRow(row.id, true);
              this.focusGrid();
            }}
          ></ds-checkbox>`
        : nothing}
    </div>`;
  }

  private renderCell(entry: VisibleRow, index: number, column: DataGridColumn, col: number): TemplateResult {
    const isRowHeader = column.isRowHeader === true;
    const row = entry.row;
    const editing =
      row && this.editing?.rowId === row.id && this.editing.column === column.key ? this.editing : undefined;
    const raw = row?.[column.key];
    const content = !row
      ? isRowHeader
        ? html`<span data-part="cellContent" class="loading-text">${COPY_LOADING}</span>`
        : nothing
      : editing
        ? this.renderEditor(column, row, editing)
        : html`<span data-part="cellContent">${column.render ? column.render(row) : textOf(raw)}</span>`;
    return html`<div
      role=${isRowHeader ? 'rowheader' : 'gridcell'}
      id=${this.cellId(entry.key, col)}
      data-part=${isRowHeader ? 'rowHeader' : 'cell'}
      data-row=${index}
      data-col=${col}
      tabindex="-1"
      aria-colindex=${col + 1}
      aria-selected=${ifDefined(this.selectable === 'cell' && row ? String(this.isActive(index, col)) : undefined)}
      aria-readonly=${ifDefined(this.editable && row ? String(!column.editable) : undefined)}
      aria-describedby=${ifDefined(editing?.error ? 'status' : undefined)}
      class=${classMap({
        ...this.cellClasses(column),
        active: this.isActive(index, col),
        parent: isRowHeader && entry.hasChildren,
        muted: this.loading,
        numeric: typeof raw === 'number' && !column.render,
        editing: editing !== undefined,
        invalid: Boolean(editing?.error),
      })}
      style=${styleMap(this.pinStyle(column))}
    >
      ${isRowHeader ? this.renderTreeColumn(entry, content) : content}
    </div>`;
  }

  /**
   * The row header's indent (with one guide line per ancestor level), expand button and content. The `expandButton`
   * part is the span this element owns around the composed Button: it is the pointer target and carries the
   * rotation, never the Icon.
   *
   * Neither the span nor the Button is `aria-hidden`. The Button is a real, focusable control — `tabindex="-1"`
   * only takes it out of the tab order — so hiding either would be axe's `aria-hidden-focus`. It stays exposed
   * under `copy.expand`/`copy.collapse`; ArrowLeft/Right remain the keyboard path, and the row's own
   * `aria-expanded` is what conveys the state.
   */
  private renderTreeColumn(entry: VisibleRow, content: TemplateResult | typeof nothing): TemplateResult {
    const row = entry.row;
    const guides = Array.from(
      { length: entry.level - 1 },
      (_, depth) =>
        html`<span
          class="guide"
          style=${styleMap({
            insetInlineStart: `calc(var(--ds-tree-grid-cell-padding-inline) + var(--ds-tree-grid-indent) * ${depth} + var(--size-target-min) / 2 - var(--ds-tree-grid-guide-line-width) / 2)`,
          })}
        ></span>`,
    );
    const name = row ? this.rowName(row) : '';
    return html`<span
        data-part="indent"
        aria-hidden="true"
        style=${styleMap({ paddingInlineStart: `calc(var(--ds-tree-grid-indent) * ${entry.level - 1})` })}
        >${guides}</span
      ><span class="node">
        ${row && entry.hasChildren
          ? html`<span
              class="expand-chevron"
              data-part="expandButton"
              data-expanded=${ifDefined(entry.expanded ? '' : undefined)}
              @click=${(event: MouseEvent) => {
                event.stopPropagation();
                this.setExpanded([row], !entry.expanded);
                this.focusGrid();
              }}
            >
              <ds-button
                variant="ghost"
                size="sm"
                icon-only
                tabindex="-1"
                label=${entry.expanded ? COPY_COLLAPSE(name) : COPY_EXPAND(name)}
                .overrides=${EXPAND_BUTTON_INSET}
                @press=${(event: Event) => event.stopPropagation()}
              >
                <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
              </ds-button>
            </span>`
          : html`<span class="expand-spacer" aria-hidden="true"></span>`}
        ${content}
      </span>`;
  }

  private renderEditor(column: DataGridColumn, row: TreeGridRow, editing: EditingState): TemplateResult {
    const value = cellValue(row[column.key]);
    let editor: TemplateResult;
    switch (column.editor ?? 'text') {
      case 'number': {
        const seeded = editing.seed !== undefined ? Number(editing.seed) : undefined;
        editor = html`<ds-number-input
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${seeded !== undefined && Number.isFinite(seeded) ? seeded : typeof value === 'number' ? value : undefined}
          .overrides=${NUMBER_INSET}
        ></ds-number-input>`;
        break;
      }
      case 'select':
        editor = html`<ds-select
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .options=${column.options ?? []}
          .defaultValue=${value === undefined ? undefined : String(value)}
          .overrides=${SELECT_INSET}
          @change=${(event: Event) => {
            event.stopPropagation();
            this.commitAndReturn(0);
          }}
        ></ds-select>`;
        break;
      case 'date':
        editor = html`<ds-date-picker
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${typeof value === 'string' ? value : undefined}
          .overrides=${DATE_INSET}
          @change=${(event: Event) => event.stopPropagation()}
        ></ds-date-picker>`;
        break;
      case 'checkbox':
        editor = html`<ds-checkbox
          data-part="editor"
          label=${column.header}
          hide-label
          .defaultChecked=${value === true}
          @change=${(event: Event) => {
            event.stopPropagation();
            this.commitAndReturn(0);
          }}
        ></ds-checkbox>`;
        break;
      default:
        editor = html`<ds-input
          data-part="editor"
          label=${column.header}
          hide-label
          size="sm"
          .defaultValue=${editing.seed ?? (value === undefined ? '' : String(value))}
          .overrides=${INPUT_INSET}
          @change=${(event: Event) => event.stopPropagation()}
        ></ds-input>`;
    }
    return html`<div
      class="editor-frame"
      @keydown=${(event: KeyboardEvent) => this.handleEditorKeydown(event, column)}
      @focusout=${(event: FocusEvent) => this.handleEditorFocusout(event, column)}
    >
      ${editor}
    </div>`;
  }

  /**
   * The visible counterpart of the live region. Only the leading span is `role="status"`, so the row count,
   * `copy.scrollHint` and `copy.position` are shown but never announced — `aria-rowindex` and `aria-colindex`
   * already carry position, and a polite region on every arrow press would be noise. The selection count is shown
   * here and announced through the live region when it changes, as DataGrid.
   */
  private renderStatusBar(): TemplateResult {
    const total = this.index.loaded.length;
    const error = this.editing?.error;
    const live = html`<ds-text
      id="status"
      data-part="statusBar"
      role="status"
      element="span"
      size="xs"
      tone=${error ? 'default' : 'muted'}
      >${this.announcement()}</ds-text
    >`;
    const selection = this.selectionText(total);
    const position = this.positionText();
    return html`<div class=${classMap({ 'status-bar': true, 'visually-hidden': !this.showStatusBar })}>
      ${error ? html`<span class="invalid-message">${live}</span>` : live}
      ${this.showStatusBar
        ? html`<ds-text element="span" size="xs" tone="muted">${COPY_ROW_COUNT[pluralForm(total)](total)}</ds-text>
            ${selection ? html`<ds-text element="span" size="xs" tone="muted">${selection}</ds-text>` : nothing}`
        : nothing}
      ${this.overflowX && !this.scrolledX
        ? html`<ds-text id="scroll-hint" element="span" size="xs" tone="muted">${COPY_SCROLL_HINT}</ds-text>`
        : nothing}
      ${this.showStatusBar && position
        ? html`<ds-text class="trailing" element="span" size="xs" tone="muted">${position}</ds-text>`
        : nothing}
    </div>`;
  }

  /* ---------- model ---------- */

  private get hasSelectColumn(): boolean {
    return this.selectable === 'row';
  }

  private get colOffset(): number {
    return this.hasSelectColumn ? 1 : 0;
  }

  private get colCount(): number {
    return this.columns.length + this.colOffset;
  }

  /** The grid column of the row header, or -1 when no column is marked. */
  private get rowHeaderCol(): number {
    const index = this.columns.findIndex((column) => column.isRowHeader);
    return index === -1 ? -1 : index + this.colOffset;
  }

  private get currentSort(): TreeGridSort | undefined {
    return this.sort ?? this.internalSort;
  }

  private get currentSelected(): string[] {
    return this.selected ?? this.internalSelected;
  }

  private get rawExpanded(): string[] {
    return this.expanded ?? this.internalExpanded;
  }

  /** Every loaded row by id with its parent, and all loaded rows in tree order; O(n), cached per `data`. */
  private get index(): {
    byId: Map<string, { row: TreeGridRow; parentId: string | undefined }>;
    loaded: TreeGridRow[];
  } {
    const cache = this.indexCache;
    if (cache && cache.data === this.data) {
      return cache;
    }
    const byId = new Map<string, { row: TreeGridRow; parentId: string | undefined }>();
    const loaded: TreeGridRow[] = [];
    const walk = (rows: TreeGridRow[], parentId: string | undefined): void => {
      for (const row of rows) {
        byId.set(row.id, { row, parentId });
        loaded.push(row);
        walk(loadedChildren(row), row.id);
      }
    };
    walk(this.data, undefined);
    this.indexCache = { data: this.data, byId, loaded };
    return this.indexCache;
  }

  /** The flattened visible rows: siblings ordered by an uncontrolled sort, collapsed subtrees left out. */
  private get visible(): VisibleRow[] {
    const expanded = this.rawExpanded;
    const lazyOpened = this.lazyOpened;
    const sort = this.sort === undefined ? this.internalSort : undefined;
    const cache = this.visibleCache;
    if (
      cache &&
      cache.data === this.data &&
      cache.expanded === expanded &&
      cache.lazyOpened === lazyOpened &&
      cache.sort === sort
    ) {
      return cache.rows;
    }
    const open = new Set(expanded);
    /* A lazy row opens only by a user act, so its shown state is this set and never `expanded`. */
    const openLazy = new Set(lazyOpened);
    /* `*` opens every row with loaded children, including ones loaded later, and never a lazy row. */
    const all = open.has('*');
    const rows: VisibleRow[] = [];
    const walk = (siblings: TreeGridRow[], level: number, parentId: string | undefined): void => {
      let ordered = siblings;
      if (sort) {
        const factor = sort.direction === 'ascending' ? 1 : -1;
        ordered = [...siblings].sort((a, b) => compareValues(a[sort.column], b[sort.column]) * factor);
      }
      ordered.forEach((row, i) => {
        const lazy = row.children === 'lazy';
        const children = loadedChildren(row);
        const hasChildren = lazy || children.length > 0;
        const isOpen = hasChildren && (lazy ? openLazy.has(row.id) : open.has(row.id) || all);
        rows.push({
          key: row.id,
          row,
          parentId,
          level,
          posinset: i + 1,
          setsize: ordered.length,
          hasChildren,
          expanded: isOpen,
          lazy,
        });
        if (isOpen && lazy) {
          /* One navigable placeholder child: not selectable, not editable, no children of its own. */
          rows.push({
            key: `${row.id}${PLACEHOLDER_SUFFIX}`,
            row: undefined,
            parentId: row.id,
            level: level + 1,
            posinset: 1,
            setsize: 1,
            hasChildren: false,
            expanded: false,
            lazy: false,
          });
        } else if (isOpen) {
          walk(children, level + 1, row.id);
        }
      });
    };
    walk(this.data, 1, undefined);
    this.visibleCache = { data: this.data, expanded, lazyOpened, sort, rows };
    return rows;
  }

  /** The expanded ids with `"*"` resolved against the loaded rows; the first user toggle commits these. */
  private expandedIds(): string[] {
    const raw = this.rawExpanded;
    if (!raw.includes('*')) {
      return raw;
    }
    const ids = new Set(raw.filter((id) => id !== '*'));
    for (const row of this.index.loaded) {
      if (loadedChildren(row).length > 0) {
        ids.add(row.id);
      }
    }
    return [...ids];
  }

  /** Checked/indeterminate per loaded row; with `selectChildren` a parent derives it from its loaded descendants. */
  private selectionStates(): Map<string, SelectState> {
    const selected = new Set(this.currentSelected);
    const states = new Map<string, SelectState>();
    const visit = (row: TreeGridRow): { count: number; total: number } => {
      let count = 0;
      let total = 0;
      for (const child of loadedChildren(row)) {
        const below = visit(child);
        count += below.count + (selected.has(child.id) ? 1 : 0);
        total += below.total + 1;
      }
      if (!this.selectChildren || total === 0 || count === 0) {
        states.set(row.id, { checked: selected.has(row.id), indeterminate: false });
      } else if (count === total) {
        states.set(row.id, { checked: true, indeterminate: false });
      } else {
        /* An indeterminate row reports aria-selected="false". */
        states.set(row.id, { checked: false, indeterminate: true });
      }
      return { count, total };
    };
    this.data.forEach(visit);
    return states;
  }

  private columnAt(col: number): DataGridColumn | undefined {
    return col < this.colOffset ? undefined : this.columns[col - this.colOffset];
  }

  private widthOf(column: DataGridColumn): number {
    const width = this.columnWidths[column.key] ?? column.width ?? DEFAULT_COLUMN_WIDTH;
    return Math.max(width, this.minWidthOf(column));
  }

  /** The floor for both resize paths: never below `size.target.min`. */
  private minWidthOf(column: DataGridColumn): number {
    return Math.max(column.minWidth ?? 0, this.probeEl?.offsetHeight ?? 0);
  }

  private rowLayout(): { columns: string; width: string } {
    const widths = this.columns.map((column) => this.widthOf(column));
    const sum = widths.reduce((total, width) => total + width, 0);
    const tracks = widths.map((width) => `${width}px`);
    if (this.hasSelectColumn) {
      return {
        columns: ['var(--size-target-min)', ...tracks].join(' '),
        width: `calc(var(--size-target-min) + ${sum}px)`,
      };
    }
    return { columns: tracks.join(' '), width: `${sum}px` };
  }

  private cellClasses(column: DataGridColumn): Record<string, boolean> {
    return {
      cell: true,
      'align-end': column.align === 'end',
      'align-center': column.align === 'center',
      'pinned-start': column.pinned === 'start',
      'pinned-end': column.pinned === 'end',
    };
  }

  /** Sticky offsets for pinned columns; the selection column counts toward the start offset. */
  private pinStyle(column: DataGridColumn): Record<string, string> {
    const index = this.columns.indexOf(column);
    if (column.pinned === 'start') {
      let offset = 0;
      for (let i = 0; i < index; i += 1) {
        const other = this.columns[i]!;
        if (other.pinned === 'start') {
          offset += this.widthOf(other);
        }
      }
      return {
        insetInlineStart: this.hasSelectColumn ? `calc(var(--size-target-min) + ${offset}px)` : `${offset}px`,
      };
    }
    if (column.pinned === 'end') {
      let offset = 0;
      for (let i = index + 1; i < this.columns.length; i += 1) {
        const other = this.columns[i]!;
        if (other.pinned === 'end') {
          offset += this.widthOf(other);
        }
      }
      return { insetInlineEnd: `${offset}px` };
    }
    return {};
  }

  private rowName(row: TreeGridRow): string {
    const header = this.columns.find((column) => column.isRowHeader);
    return (header ? textOf(row[header.key]) : '') || row.id;
  }

  private cellId(key: string, col: number): string {
    return `c-${col}-${idToken(key)}`;
  }

  private isActive(row: number, col: number): boolean {
    return this.activeRow === row && this.activeCol === col;
  }

  private activeDescendantId(rows: VisibleRow[]): string | undefined {
    if (this.colCount === 0) {
      return undefined;
    }
    if (this.activeRow === -1) {
      return `h-${this.activeCol}`;
    }
    const entry = rows[this.activeRow];
    return entry ? this.cellId(entry.key, this.activeCol) : undefined;
  }

  private get activeCellEl(): HTMLElement | null {
    const id = this.activeDescendantId(this.visible);
    return id ? this.renderRoot.querySelector<HTMLElement>(`#${id}`) : null;
  }

  /** Visible rows per page, excluding the sticky header. */
  private pageRows(): number {
    const rowH = this.rowHeightPx;
    if (!rowH) {
      return 1;
    }
    const space = this.height === 'content' ? window.innerHeight : this.viewportHeight - this.headerHeight;
    return Math.max(1, Math.floor(space / rowH));
  }

  /** Rendered row indexes: the visible window plus one page of overscan each way, and the active row. */
  private windowIndexes(count: number): number[] {
    if (count === 0) {
      return [];
    }
    if (this.height === 'content') {
      return Array.from({ length: count }, (_, i) => i);
    }
    const rowH = this.rowHeightPx;
    let start = 0;
    let end = Math.min(count, UNMEASURED_ROW_CAP);
    if (rowH) {
      const page = this.pageRows();
      const first = Math.floor(this.bodyScrollTop / rowH);
      start = Math.max(0, first - page);
      end = Math.min(count, first + 2 * page + 1);
    }
    const indexes: number[] = [];
    for (let i = start; i < end; i += 1) {
      indexes.push(i);
    }
    if (this.activeRow >= 0 && this.activeRow < count && (this.activeRow < start || this.activeRow >= end)) {
      indexes.push(this.activeRow);
    }
    return indexes;
  }

  /** The live region's text: loading, invalid, sort, selection and editing announcements only. */
  private announcement(): string {
    if (this.editing?.error) {
      return COPY_INVALID(this.editing.error);
    }
    if (this.editing) {
      return this.message;
    }
    if (this.loading) {
      return COPY_LOADING;
    }
    return this.message;
  }

  /** The shown selection count over every loaded row; empty when nothing is selected. */
  private selectionText(total: number): string {
    if (this.selectable === 'row' && this.currentSelected.length > 0) {
      return COPY_SELECTED_ROWS(this.currentSelected.length, total);
    }
    return '';
  }

  /** `copy.position` for the active body cell; shown, never announced. */
  private positionText(): string {
    const column = this.columnAt(this.activeCol);
    if (this.activeRow < 0 || !column) {
      return '';
    }
    return COPY_POSITION(this.activeRow + 1, column.header);
  }

  /* ---------- expansion, selection, sort and events ---------- */

  private emit<T>(name: string, detail: T, cancelable = false): boolean {
    return this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true, cancelable }));
  }

  /**
   * Opens or closes `targets`, from each row's shown state: a lazy row's is `lazyOpened`, so its id already sitting
   * in `expanded` neither opens it nor suppresses this act. Each lazy row that opens from collapsed fires `expand`
   * (every time, so a failed load can retry), then one `expand-change` carries the whole new set of ids.
   */
  private setExpanded(targets: TreeGridRow[], open: boolean): void {
    const ids = new Set(this.expandedIds());
    const lazy = new Set(this.lazyOpened);
    const opened: string[] = [];
    let changed = false;
    for (const row of targets) {
      const isLazy = row.children === 'lazy';
      const shown = isLazy ? lazy.has(row.id) : ids.has(row.id);
      if (open === shown) {
        continue;
      }
      changed = true;
      if (open) {
        ids.add(row.id);
        if (isLazy) {
          lazy.add(row.id);
          opened.push(row.id);
        }
      } else {
        ids.delete(row.id);
        lazy.delete(row.id);
      }
    }
    if (!changed) {
      return;
    }
    const next = [...ids];
    this.lazyOpened = [...lazy];
    for (const id of opened) {
      this.emit<TreeGridExpandDetail>('expand', id);
    }
    if (this.expanded === undefined) {
      this.internalExpanded = next;
    }
    this.emit<TreeGridExpandChangeDetail>('expand-change', next);
  }

  /** `*`: every expandable sibling of the focused row under the same parent, the focused row included. */
  private expandSiblings(entry: VisibleRow): void {
    const parent = entry.parentId === undefined ? undefined : this.index.byId.get(entry.parentId)?.row;
    const siblings = parent ? loadedChildren(parent) : this.data;
    this.setExpanded(
      siblings.filter((row) => row.children === 'lazy' || loadedChildren(row).length > 0),
      true,
    );
  }

  private sortBy(column: DataGridColumn): void {
    const active = this.currentSort;
    const direction: TreeGridSortDirection =
      active?.column === column.key && active.direction === 'ascending' ? 'descending' : 'ascending';
    if (this.sort === undefined) {
      this.internalSort = { column: column.key, direction };
    }
    this.message = COPY_SORTED_ANNOUNCEMENT(column.header, direction);
    this.emit<TreeGridSortChangeDetail>('sort-change', { column: column.key, direction });
  }

  private commitRows(next: string[]): void {
    if (this.selected === undefined) {
      this.internalSelected = next;
    }
    /* The live region announces the selection count, as DataGrid; the total is every loaded row at every level. */
    this.message = COPY_SELECTED_ROWS(next.length, this.index.loaded.length);
    this.emit<TreeGridSelectionChangeDetail>('selection-change', { selection: next });
  }

  /** A row's own toggle; with `selectChildren` and `cascade` it sets or clears the row and its loaded descendants. */
  private toggleRow(id: string, cascade: boolean): void {
    const current = this.currentSelected;
    this.rowAnchorId = id;
    const entry = this.index.byId.get(id);
    if (!this.selectChildren || !cascade || !entry) {
      this.commitRows(current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]);
      return;
    }
    const shownChecked = this.selectionStates().get(id)?.checked ?? false;
    const next = new Set(current);
    for (const target of [id, ...descendantsOf(entry.row).map((row) => row.id)]) {
      if (shownChecked) {
        next.delete(target);
      } else {
        next.add(target);
      }
    }
    this.commitRows([...next]);
  }

  /** Select-all covers every loaded row at every level, with or without `selectChildren`. */
  private toggleAll(): void {
    const loaded = this.index.loaded;
    const selected = new Set(this.currentSelected);
    const allSelected = loaded.length > 0 && loaded.every((row) => selected.has(row.id));
    this.commitRows(allSelected ? [] : loaded.map((row) => row.id));
  }

  /** Shift+Space: adds the visible rows from the last plain-Space anchor through `index`; never cascades. */
  private extendRows(index: number): void {
    const rows = this.visible;
    const target = rows[index]?.row;
    if (!target) {
      return;
    }
    const anchor = rows.findIndex((entry) => entry.key === this.rowAnchorId);
    if (anchor === -1) {
      this.toggleRow(target.id, false);
      return;
    }
    const next = new Set(this.currentSelected);
    for (let i = Math.min(anchor, index); i <= Math.max(anchor, index); i += 1) {
      const row = rows[i]?.row;
      if (row) {
        next.add(row.id);
      }
    }
    this.commitRows([...next]);
  }

  private emitCellSelection(): void {
    const row = this.visible[this.activeRow]?.row;
    const column = this.columnAt(this.activeCol);
    if (row && column) {
      this.emit<TreeGridSelectionChangeDetail>('selection-change', { selection: { rowId: row.id, column: column.key } });
    }
  }

  /** Moves the active cell (clamped to the visible rows) and scrolls it into view. */
  private moveTo(row: number, col: number): void {
    const next = { row: clamp(row, -1, this.visible.length - 1), col: clamp(col, 0, Math.max(0, this.colCount - 1)) };
    const changed = next.row !== this.activeRow || next.col !== this.activeCol;
    this.activeRow = next.row;
    this.activeCol = next.col;
    this.scrollRowIntoView(next.row);
    this.scrollActivePending = true;
    if (changed && this.selectable === 'cell' && next.row >= 0) {
      this.emitCellSelection();
    }
  }

  /* ---------- editing ---------- */

  private startEdit(rowIndex: number, col: number, seed?: string): void {
    const column = this.columnAt(col);
    const row = this.visible[rowIndex]?.row;
    if (!this.editable || !column?.editable || !row) {
      return;
    }
    if (!this.emit<TreeGridEditStartDetail>('edit-start', { rowId: row.id, column: column.key }, true)) {
      return;
    }
    const kind = column.editor ?? 'text';
    this.editing = {
      rowId: row.id,
      column: column.key,
      seed: kind === 'text' || kind === 'number' ? seed : undefined,
    };
    this.message = COPY_EDITING(column.header);
    void this.updateComplete.then(() => {
      this.renderRoot.querySelector<HTMLElement>('[data-part="editor"]')?.focus();
    });
  }

  private readEditorValue(column: DataGridColumn): TreeGridCellValue {
    const el = this.renderRoot.querySelector('[data-part="editor"]');
    if (!el) {
      return undefined;
    }
    switch (column.editor ?? 'text') {
      case 'number':
        return (el as DsNumberInput).valueAsNumber;
      case 'select': {
        const value = (el as DsSelect).currentValue;
        return value === null ? undefined : Array.isArray(value) ? value.join(',') : value;
      }
      case 'date':
        return (el as DsDatePicker).currentValue ?? undefined;
      case 'checkbox':
        return (el as DsCheckbox).checked;
      default:
        return (el as DsInput).currentValue;
    }
  }

  /** Validates and commits the open edit. Returns false (editor stays open) when `validate` rejects it. */
  private commitEdit(): boolean {
    const editing = this.editing;
    if (!editing) {
      return true;
    }
    const row = this.index.byId.get(editing.rowId)?.row;
    const column = this.columns.find((candidate) => candidate.key === editing.column);
    if (!row || !column) {
      this.editing = undefined;
      return true;
    }
    const value = this.readEditorValue(column);
    const error = column.validate?.(value, row);
    if (error) {
      this.editing = { ...editing, error };
      return false;
    }
    const previous = cellValue(row[column.key]);
    this.editing = undefined;
    this.message = '';
    /* Reported only when the committed value differs; `validate` still ran on an unchanged commit. */
    if (!Object.is(value, previous)) {
      this.emit<TreeGridCellChangeDetail>('cell-change', { rowId: row.id, column: column.key, value, previous });
    }
    return true;
  }

  private cancelEdit(): void {
    this.editing = undefined;
    this.message = '';
    this.focusGrid();
  }

  /** Commits, then returns focus to the grid `rowDelta` rows down. */
  private commitAndReturn(rowDelta: number): void {
    if (!this.commitEdit()) {
      return;
    }
    if (rowDelta !== 0) {
      this.moveTo(this.activeRow + rowDelta, this.activeCol);
    }
    this.focusGrid();
  }

  private handleEditorKeydown(event: KeyboardEvent, column: DataGridColumn): void {
    const kind = column.editor ?? 'text';
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        this.cancelEdit();
        return;
      case 'Enter': {
        const fromField = event.composedPath()[0] instanceof HTMLInputElement;
        if (kind === 'select' || (kind === 'date' && !fromField)) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.commitAndReturn(1);
        return;
      }
      case 'F2':
        event.preventDefault();
        event.stopPropagation();
        this.commitAndReturn(0);
        return;
      case 'Tab': {
        event.stopPropagation();
        if (!this.commitEdit()) {
          event.preventDefault();
          return;
        }
        const step = event.shiftKey ? -1 : 1;
        let col = this.activeCol + step;
        while (col >= this.colOffset && col < this.colCount && !this.columnAt(col)?.editable) {
          col += step;
        }
        if (col >= this.colOffset && col < this.colCount) {
          event.preventDefault();
          this.moveTo(this.activeRow, col);
          this.focusGrid();
          this.startEdit(this.activeRow, col);
          return;
        }
        // The last editable cell: focus the grid and remove the editor now, so Tab leaves the grid.
        this.gridEl?.focus({ preventScroll: true });
        this.performUpdate();
        return;
      }
      default:
        event.stopPropagation();
    }
  }

  private handleEditorFocusout(event: FocusEvent, column: DataGridColumn): void {
    const frame = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && frame.contains(next)) {
      return;
    }
    const kind = column.editor ?? 'text';
    if (this.editing && (kind === 'text' || kind === 'number' || kind === 'date')) {
      this.commitEdit();
    }
  }

  private focusGrid(): void {
    this.gridEl?.focus({ preventScroll: true });
  }

  /* ---------- keyboard ---------- */

  private handleKeydown(event: KeyboardEvent): void {
    if (this.editing) {
      return;
    }
    if (event.target !== this.gridEl) {
      this.handleCellControlKeydown(event);
      return;
    }
    const rows = this.visible;
    const lastRow = rows.length - 1;
    const lastCol = this.colCount - 1;
    const { key, shiftKey, altKey, metaKey } = event;
    /* Control in every chord of the keyboard table means Control or Meta (Cmd on macOS). */
    const ctrlKey = event.ctrlKey || metaKey;
    const inBody = this.activeRow >= 0;
    const column = this.columnAt(this.activeCol);
    const entry = inBody ? rows[this.activeRow] : undefined;
    const onRowHeader = entry !== undefined && this.activeCol === this.rowHeaderCol;
    let handled = true;

    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft': {
        const step = key === 'ArrowRight' ? 1 : -1;
        /* Shift+arrows resize a header cell's column; in the body they keep their navigation meaning. */
        if (shiftKey && !inBody && column?.resizable) {
          this.resizeByKey(column, step);
        } else if (onRowHeader && key === 'ArrowRight' && entry.row && entry.hasChildren && !entry.expanded) {
          this.setExpanded([entry.row], true);
        } else if (onRowHeader && key === 'ArrowLeft' && entry.row && entry.hasChildren && entry.expanded) {
          this.setExpanded([entry.row], false);
        } else if (onRowHeader && key === 'ArrowLeft' && entry.parentId !== undefined) {
          /* A collapsed row, a leaf or the loading placeholder: focus moves to the parent's row header. */
          const parent = rows.findIndex((candidate) => candidate.key === entry.parentId);
          if (parent !== -1) {
            this.moveTo(parent, this.rowHeaderCol);
          }
        } else {
          this.moveTo(this.activeRow, this.activeCol + step);
        }
        break;
      }
      case 'ArrowDown':
        this.moveTo(this.activeRow + 1, this.activeCol);
        break;
      case 'ArrowUp':
        this.moveTo(this.activeRow - 1, this.activeCol);
        break;
      case 'Home':
        this.moveTo(ctrlKey ? -1 : this.activeRow, 0);
        break;
      case 'End':
        this.moveTo(ctrlKey ? lastRow : this.activeRow, lastCol);
        break;
      case 'PageDown':
        this.moveTo(Math.min(lastRow, this.activeRow + this.pageRows()), this.activeCol);
        break;
      case 'PageUp':
        this.moveTo(inBody ? Math.max(0, this.activeRow - this.pageRows()) : -1, this.activeCol);
        break;
      case 'Enter':
        if (onRowHeader && entry.row && entry.hasChildren) {
          this.setExpanded([entry.row], !entry.expanded);
        } else {
          this.activateCell();
        }
        break;
      case '*':
        if (entry) {
          this.expandSiblings(entry);
        }
        break;
      case 'F2':
        if (inBody) {
          this.startEdit(this.activeRow, this.activeCol);
        }
        break;
      case ' ':
        handled = this.handleSpace(shiftKey);
        break;
      case 'Delete':
      case 'Backspace':
        handled = this.editable;
        if (handled) {
          this.clearSelection();
        }
        break;
      default:
        if (ctrlKey && event.code === 'KeyA' && this.selectable === 'row') {
          this.commitRows(this.index.loaded.map((row) => row.id));
        } else if (key.length === 1 && !ctrlKey && !metaKey && !altKey && inBody && column?.editable) {
          this.startEdit(this.activeRow, this.activeCol, key);
        } else {
          handled = false;
        }
    }
    if (handled) {
      event.preventDefault();
    }
  }

  /** Real focus is on a control inside a cell: Escape hands it back; Shift+Tab leaves the grid. */
  private handleCellControlKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.focusGrid();
    } else if (event.key === 'Tab' && event.shiftKey) {
      this.focusGrid();
    }
  }

  private handleKeyup(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.flushKeyboardResize();
    }
  }

  private handleGridFocusout(event: FocusEvent): void {
    const grid = this.gridEl;
    const next = event.relatedTarget as Node | null;
    if (grid && (!next || !grid.contains(next))) {
      this.flushKeyboardResize();
    }
  }

  private activateCell(): void {
    const column = this.columnAt(this.activeCol);
    if (this.activeRow === -1) {
      if (this.hasSelectColumn && this.activeCol === 0) {
        this.toggleAll();
      } else if (column?.sortable) {
        this.sortBy(column);
      }
      return;
    }
    const row = this.visible[this.activeRow]?.row;
    if (!row) {
      return;
    }
    if (this.hasSelectColumn && this.activeCol === 0) {
      this.toggleRow(row.id, true);
      return;
    }
    if (this.editable && column?.editable) {
      this.startEdit(this.activeRow, this.activeCol);
      return;
    }
    const control = this.activeCellEl?.querySelector<HTMLElement>(`[data-part="cellContent"] :is(${CELL_CONTROLS})`);
    if (control) {
      control.focus();
      (control.shadowRoot?.querySelector<HTMLElement>('a[href], button, input') ?? control).click();
    }
  }

  private handleSpace(shiftKey: boolean): boolean {
    if (this.selectable !== 'row') {
      return false;
    }
    const row = this.visible[this.activeRow]?.row;
    if (row) {
      if (shiftKey) {
        this.extendRows(this.activeRow);
      } else {
        this.toggleRow(row.id, true);
      }
    }
    return true;
  }

  /** Delete/Backspace: `cell-change` with `value: undefined` for each editable cell in the selection. */
  private clearSelection(): void {
    const rows = this.visible;
    const targets: { row: TreeGridRow; column: DataGridColumn }[] = [];
    const add = (rowIndex: number, col: number): void => {
      const row = rows[rowIndex]?.row;
      const column = this.columnAt(col);
      if (row && column?.editable) {
        targets.push({ row, column });
      }
    };
    if (this.selectable === 'row') {
      const selected = new Set(this.currentSelected);
      rows.forEach((entry, r) => {
        if (entry.row && selected.has(entry.row.id)) {
          for (let c = this.colOffset; c < this.colCount; c += 1) {
            add(r, c);
          }
        }
      });
    } else {
      add(this.activeRow, this.activeCol);
    }
    for (const { row, column } of targets) {
      this.emit<TreeGridCellChangeDetail>('cell-change', {
        rowId: row.id,
        column: column.key,
        value: undefined,
        previous: cellValue(row[column.key]),
      });
    }
  }

  /* ---------- pointer ---------- */

  private cellFromTarget(event: Event): { row: number; col: number; inControl: boolean } | undefined {
    let inControl = false;
    for (const node of event.composedPath()) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      if (node.dataset['row'] !== undefined && node.dataset['col'] !== undefined) {
        return { row: Number(node.dataset['row']), col: Number(node.dataset['col']), inControl };
      }
      if (node.matches(`${CELL_CONTROLS}, .editor-frame, .resize-handle`)) {
        inControl = true;
      }
      if (node === this.gridEl) {
        return undefined;
      }
    }
    return undefined;
  }

  private handlePointerdown(event: PointerEvent): void {
    const hit = this.cellFromTarget(event);
    if (!hit || event.button !== 0) {
      return;
    }
    const rows = this.visible;
    if (this.editing) {
      const row = rows[hit.row]?.row;
      const column = this.columnAt(hit.col);
      if (row?.id === this.editing.rowId && column?.key === this.editing.column) {
        return;
      }
    }
    const moved = hit.row !== this.activeRow || hit.col !== this.activeCol;
    this.activeRow = hit.row;
    this.activeCol = hit.col;
    if (hit.inControl) {
      return;
    }
    const row = hit.row >= 0 ? rows[hit.row]?.row : undefined;
    if (this.selectable === 'cell' && row && moved) {
      this.emitCellSelection();
    } else if (this.selectable === 'row' && row && hit.col > 0) {
      if (event.ctrlKey || event.metaKey) {
        this.toggleRow(row.id, true);
      } else if (event.shiftKey) {
        event.preventDefault();
        this.extendRows(hit.row);
      }
    } else if (this.selectable === 'row' && row && hit.col === 0) {
      this.toggleRow(row.id, true);
    }
    this.focusGrid();
  }

  private handleDblclick(event: MouseEvent): void {
    const hit = this.cellFromTarget(event);
    if (hit && !hit.inControl && hit.row >= 0) {
      this.startEdit(hit.row, hit.col);
    }
  }

  /* ---------- column resize ---------- */

  private handleResizeDown(event: PointerEvent, column: DataGridColumn): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.resizeDrag = {
      column: column.key,
      startX: event.clientX,
      startWidth: this.widthOf(column),
      rtl: getComputedStyle(this).direction === 'rtl',
    };
    this.draggingColumn = column.key;
  }

  private readonly handleResizeMove = (event: PointerEvent): void => {
    const drag = this.resizeDrag;
    const column = drag ? this.columns.find((candidate) => candidate.key === drag.column) : undefined;
    if (!drag || !column) {
      return;
    }
    const delta = (event.clientX - drag.startX) * (drag.rtl ? -1 : 1);
    const width = Math.max(this.minWidthOf(column), Math.round(drag.startWidth + delta));
    if (this.columnWidths[column.key] !== width) {
      this.columnWidths = { ...this.columnWidths, [column.key]: width };
    }
  };

  private readonly handleResizeUp = (event: PointerEvent): void => {
    const drag = this.resizeDrag;
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    this.resizeDrag = undefined;
    this.draggingColumn = undefined;
    const column = drag ? this.columns.find((candidate) => candidate.key === drag.column) : undefined;
    if (drag && column && this.widthOf(column) !== drag.startWidth) {
      this.emit<TreeGridColumnResizeDetail>('column-resize', { column: column.key, width: this.widthOf(column) });
    }
  };

  /** Shift+ArrowRight/Left on a resizable header cell; the step is DataGrid's resizeStep, read as a length. */
  private resizeByKey(column: DataGridColumn, step: number): void {
    const resizeStep = this.probeStepEl?.offsetWidth ?? 0;
    const width = Math.max(this.minWidthOf(column), this.widthOf(column) + step * resizeStep);
    this.columnWidths = { ...this.columnWidths, [column.key]: width };
    this.keyboardResize = column.key;
  }

  /** `column-resize` on release of Shift (or when focus leaves the grid), never on every press. */
  private flushKeyboardResize(): void {
    const key = this.keyboardResize;
    this.keyboardResize = undefined;
    const column = key ? this.columns.find((candidate) => candidate.key === key) : undefined;
    if (column) {
      this.emit<TreeGridColumnResizeDetail>('column-resize', { column: column.key, width: this.widthOf(column) });
    }
  }

  /* ---------- scrolling and measurement ---------- */

  private handleScroll(): void {
    const region = this.scrollEl;
    if (!region) {
      return;
    }
    if (this.bodyScrollTop !== region.scrollTop) {
      this.bodyScrollTop = region.scrollTop;
    }
    const scrolledX = region.scrollLeft !== 0;
    if (this.scrolledX !== scrolledX) {
      this.scrolledX = scrolledX;
    }
  }

  private scrollRowIntoView(row: number): void {
    const region = this.scrollEl;
    const rowH = this.rowHeightPx;
    if (!region || !rowH || row < 0 || this.height === 'content') {
      return;
    }
    const top = row * rowH;
    const visible = this.viewportHeight - this.headerHeight;
    if (top < region.scrollTop) {
      region.scrollTop = top;
    } else if (top + rowH > region.scrollTop + visible) {
      region.scrollTop = top + rowH - visible;
    }
    this.bodyScrollTop = region.scrollTop;
  }

  /** Horizontal (and, for `height: content`, vertical) reveal of the active cell past any pinned columns. */
  private scrollActiveIntoView(): void {
    const cell = this.activeCellEl;
    const region = this.scrollEl;
    if (!cell || !region) {
      return;
    }
    if (this.height === 'content') {
      cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return;
    }
    if (cell.classList.contains('pinned-start') || cell.classList.contains('pinned-end')) {
      return;
    }
    const row = cell.parentElement;
    let startInset = 0;
    let endInset = 0;
    row?.querySelectorAll<HTMLElement>('.pinned-start').forEach((el) => (startInset += el.offsetWidth));
    row?.querySelectorAll<HTMLElement>('.pinned-end').forEach((el) => (endInset += el.offsetWidth));
    const cellRect = cell.getBoundingClientRect();
    const regionRect = region.getBoundingClientRect();
    if (cellRect.left < regionRect.left + startInset) {
      region.scrollLeft -= regionRect.left + startInset - cellRect.left;
    } else if (cellRect.right > regionRect.right - endInset) {
      region.scrollLeft += cellRect.right - (regionRect.right - endInset);
    }
  }

  private measure(): void {
    const region = this.scrollEl;
    if (!region) {
      return;
    }
    const row =
      this.renderRoot.querySelector<HTMLElement>('[data-part="row"]') ??
      this.renderRoot.querySelector<HTMLElement>('[data-part="headerRow"]');
    const header = this.renderRoot.querySelector<HTMLElement>('[data-part="header"]');
    const rowH = row?.getBoundingClientRect().height ?? 0;
    const headerH = header?.getBoundingClientRect().height ?? 0;
    if (rowH && rowH !== this.rowHeightPx) {
      this.rowHeightPx = rowH;
    }
    if (headerH !== this.headerHeight) {
      this.headerHeight = headerH;
    }
    if (region.clientHeight !== this.viewportHeight) {
      this.viewportHeight = region.clientHeight;
    }
    const overflowX = region.scrollWidth > region.clientWidth;
    if (overflowX !== this.overflowX) {
      this.overflowX = overflowX;
    }
  }

  /** Controls a column's `render` returns are reachable by Enter, not Tab: the grid stays one tab stop. */
  private demoteCellControls(): void {
    this.renderRoot.querySelectorAll<HTMLElement>(`[data-part="cellContent"] :is(${CELL_CONTROLS})`).forEach((el) => {
      if (el.getAttribute('tabindex') !== '-1') {
        el.setAttribute('tabindex', '-1');
      }
    });
  }

  /* ---------- overrides and dev warnings ---------- */

  private applyOverrides(): void {
    for (const binding of Object.keys(HOOKS) as TreeGridOverridableBinding[]) {
      const ref = this.overrides?.[binding];
      if (ref === undefined) {
        this.style.removeProperty(HOOKS[binding]);
      } else {
        this.style.setProperty(HOOKS[binding], cssVar(ref));
      }
    }
  }

  private warnOnce(key: string, message: string): void {
    if (!this.warned.has(key)) {
      this.warned.add(key);
      console.warn(`<ds-tree-grid> ${message}`, this);
    }
  }

  private warnInDev(): void {
    if (!import.meta.env.DEV) {
      return;
    }
    if (!this.caption) {
      this.warnOnce('caption', 'requires a `caption`; it is the accessible name.');
    }
    if (this.columns.length > 0 && (this.columns.filter((column) => column.isRowHeader).length !== 1 || !this.columns[0]?.isRowHeader)) {
      this.warnOnce('row-header', 'needs exactly one `isRowHeader` column, first after the selection column.');
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-tree-grid': DsTreeGrid;
  }
}
