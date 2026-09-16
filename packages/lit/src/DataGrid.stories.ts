import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './DataGrid.js';
import type {
  DataGridColumn,
  DataGridDensity,
  DataGridHeight,
  DataGridRow,
  DataGridSelectable,
  DataGridSort,
} from './DataGrid.js';

interface DataGridArgs {
  caption: string;
  hideCaption?: boolean | undefined;
  columns: DataGridColumn[];
  data: DataGridRow[];
  rowCount?: number | undefined;
  sort?: DataGridSort | undefined;
  defaultSort?: DataGridSort | undefined;
  selectable?: DataGridSelectable | undefined;
  selected?: string[] | undefined;
  editable?: boolean | undefined;
  density?: DataGridDensity | undefined;
  stickyHeader?: boolean | undefined;
  height?: DataGridHeight | undefined;
  loading?: boolean | undefined;
  emptyMessage?: string | undefined;
  showStatusBar?: boolean | undefined;
}

const columns: DataGridColumn[] = [
  { key: 'sku', header: 'SKU', isRowHeader: true, width: 120, pinned: 'start' },
  { key: 'name', header: 'Name', width: 200, resizable: true, editable: true, editor: 'text' },
  {
    key: 'price',
    header: 'Price (USD)',
    align: 'end',
    sortable: true,
    editable: true,
    editor: 'number',
    width: 120,
    validate: (value) => (typeof value === 'number' && value >= 0 ? undefined : 'Enter a price of 0 or more.'),
  },
  { key: 'qty', header: 'Qty', abbr: 'Quantity', align: 'end', sortable: true, width: 80 },
  {
    key: 'category',
    header: 'Category',
    width: 160,
    editable: true,
    editor: 'select',
    options: [
      { value: 'hardware', label: 'Hardware' },
      { value: 'software', label: 'Software' },
    ],
  },
  { key: 'inStock', header: 'In stock', width: 96, editable: true, editor: 'checkbox' },
];

const data: DataGridRow[] = [
  { id: 'a', sku: 'A-1', name: 'Widget', price: 10, qty: 240, category: 'hardware', inStock: true },
  { id: 'b', sku: 'B-2', name: 'Sprocket', price: 20, qty: 85, category: 'hardware', inStock: true },
  { id: 'c', sku: 'C-3', name: 'License', price: 199, qty: 12, category: 'software', inStock: false },
  { id: 'd', sku: 'D-4', name: 'Gear', price: 45, qty: 4, category: 'hardware', inStock: true },
  { id: 'e', sku: 'E-5', name: 'Plan', price: 15, qty: 500, category: 'software', inStock: true },
];

const meta: Meta<DataGridArgs> = {
  title: 'DataGrid/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: {
      handles: ['sort-change', 'selection-change', 'cell-change', 'edit-start', 'range-needed', 'column-resize'],
    },
  },
  argTypes: {
    selectable: { control: 'select', options: ['none', 'row', 'cell', 'range'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
    height: { control: 'select', options: ['content', 'viewport', 'fixed'] },
  },
  args: {
    caption: 'Price list',
    columns,
    data,
  },
  render: (args) => html`
    <ds-data-grid
      caption=${args.caption}
      ?hide-caption=${args.hideCaption ?? false}
      .columns=${args.columns}
      .data=${args.data}
      .rowCount=${args.rowCount}
      .sort=${args.sort}
      .defaultSort=${args.defaultSort}
      selectable=${args.selectable ?? 'none'}
      .selected=${args.selected}
      ?editable=${args.editable ?? false}
      density=${args.density ?? 'compact'}
      ?no-sticky-header=${args.stickyHeader === false}
      height=${args.height ?? 'viewport'}
      ?loading=${args.loading ?? false}
      empty-message=${ifDefined(args.emptyMessage)}
      ?no-status-bar=${args.showStatusBar === false}
    ></ds-data-grid>
  `,
};

export default meta;
type Story = StoryObj<DataGridArgs>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };
export const SelectableRange: Story = { args: { selectable: 'range' } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightViewport: Story = { args: { height: 'viewport' } };
export const HeightFixed: Story = { args: { height: 'fixed' } };

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const DefaultSort: Story = { args: { defaultSort: { column: 'price', direction: 'descending' } } };
export const ServerPaged: Story = { args: { rowCount: 200, height: 'fixed' } };

/* examples */
export const PriceList: Story = {
  args: {
    caption: 'Price list',
    columns: [
      { key: 'sku', header: 'SKU', isRowHeader: true, width: 160 },
      { key: 'name', header: 'Name' },
      { key: 'price', header: 'Price', align: 'end', sortable: true },
    ],
    data: [
      { id: 'a', sku: 'A-1', name: 'Widget', price: 10 },
      { id: 'b', sku: 'B-2', name: 'Sprocket', price: 20 },
    ],
  },
};

export const EditableCells: Story = {
  args: {
    caption: 'Stock levels',
    editable: true,
    columns: [
      { key: 'sku', header: 'SKU', isRowHeader: true },
      { key: 'onHand', header: 'On hand', align: 'end', editable: true, editor: 'number' },
    ],
    data: [
      { id: 'a', sku: 'A-1', onHand: 12 },
      { id: 'b', sku: 'B-2', onHand: 4 },
    ],
  },
};

export const RowSelectionForBulkActions: Story = {
  args: {
    caption: 'Orders',
    selectable: 'row',
    density: 'comfortable',
    columns: [
      { key: 'order', header: 'Order', isRowHeader: true },
      { key: 'customer', header: 'Customer' },
    ],
    data: [
      { id: 'a', order: '1001', customer: 'Ana Souza' },
      { id: 'b', order: '1002', customer: 'Bo Lin' },
    ],
  },
};

export const RangeSelectionInAFixedHeightGrid: Story = {
  args: {
    caption: 'Daily figures',
    selectable: 'range',
    height: 'fixed',
    columns: [
      { key: 'day', header: 'Day', isRowHeader: true },
      { key: 'visits', header: 'Visits', align: 'end' },
      { key: 'signups', header: 'Signups', align: 'end' },
    ],
    data: [
      { id: 'a', day: 'Monday', visits: 1200, signups: 30 },
      { id: 'b', day: 'Tuesday', visits: 1450, signups: 41 },
    ],
  },
};

/** The grid present with sortable headers, a resizable column and editable cells to navigate between. */
export const Keyboard: Story = {
  args: { selectable: 'range', editable: true, height: 'content' },
};
