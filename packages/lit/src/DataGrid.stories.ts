import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './DataGrid.js';
import type {
  DataGridCellChangeDetail,
  DataGridColumn,
  DataGridColumnResizeDetail,
  DataGridDensity,
  DataGridEditStartDetail,
  DataGridHeight,
  DataGridRangeNeededDetail,
  DataGridRow,
  DataGridSelectable,
  DataGridSelectionChangeDetail,
  DataGridSortChangeDetail,
} from './DataGrid.js';

interface DataGridArgs {
  caption: string;
  hideCaption: boolean;
  columns: DataGridColumn[];
  data: DataGridRow[];
  rowCount?: number;
  selectable: DataGridSelectable;
  editable: boolean;
  density: DataGridDensity;
  stickyHeader: boolean;
  height: DataGridHeight;
  loading: boolean;
  emptyMessage?: string;
  showStatusBar: boolean;
}

const priceListColumns: DataGridColumn[] = [
  { key: 'name', header: 'Item', isRowHeader: true, resizable: true, width: 180 },
  { key: 'sku', header: 'SKU', width: 120 },
  {
    key: 'price',
    header: 'Price (USD)',
    align: 'end',
    sortable: true,
    editable: true,
    editor: 'number',
    width: 120,
    validate: (value) => (typeof value === 'number' && value >= 0 ? undefined : 'Enter a positive amount.'),
  },
  {
    key: 'quantity',
    header: 'Qty',
    abbr: 'Quantity',
    align: 'end',
    sortable: true,
    editable: true,
    editor: 'number',
    width: 100,
  },
  {
    key: 'category',
    header: 'Category',
    editable: true,
    editor: 'select',
    width: 160,
    options: [
      { value: 'hardware', label: 'Hardware' },
      { value: 'software', label: 'Software' },
      { value: 'services', label: 'Services' },
    ],
  },
  { key: 'inStock', header: 'In stock', editable: true, editor: 'checkbox', width: 100 },
];

const priceListRows: DataGridRow[] = [
  { id: 'sku-1001', name: 'USB-C cable', sku: 'CBL-1001', price: 12.5, quantity: 240, category: 'hardware', inStock: true },
  { id: 'sku-1002', name: 'Wireless mouse', sku: 'MSE-1002', price: 24.0, quantity: 85, category: 'hardware', inStock: true },
  { id: 'sku-1003', name: 'Design Schema license', sku: 'LIC-1003', price: 199.0, quantity: 12, category: 'software', inStock: false },
  { id: 'sku-1004', name: 'Onboarding session', sku: 'SVC-1004', price: 450.0, quantity: 4, category: 'services', inStock: true },
  { id: 'sku-1005', name: 'Mechanical keyboard', sku: 'KEY-1005', price: 89.0, quantity: 32, category: 'hardware', inStock: true },
  { id: 'sku-1006', name: 'Cloud storage plan', sku: 'LIC-1006', price: 15.0, quantity: 500, category: 'software', inStock: true },
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
    hideCaption: { control: 'boolean' },
    editable: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    loading: { control: 'boolean' },
    showStatusBar: { control: 'boolean' },
  },
  args: {
    caption: 'Price list',
    hideCaption: false,
    columns: priceListColumns,
    data: priceListRows,
    selectable: 'none',
    editable: false,
    density: 'compact',
    stickyHeader: true,
    height: 'viewport',
    loading: false,
    showStatusBar: true,
  },
  render: (args) => html`
    <ds-data-grid
      caption=${args.caption}
      ?hide-caption=${args.hideCaption}
      .columns=${args.columns}
      .data=${args.data}
      selectable=${args.selectable}
      ?editable=${args.editable}
      density=${args.density}
      ?no-sticky-header=${!args.stickyHeader}
      height=${args.height}
      ?loading=${args.loading}
      empty-message=${args.emptyMessage ?? ''}
      ?no-status-bar=${!args.showStatusBar}
      @sort-change=${(event: CustomEvent<DataGridSortChangeDetail>) => console.log('sort-change', event.detail)}
      @selection-change=${(event: CustomEvent<DataGridSelectionChangeDetail>) =>
        console.log('selection-change', event.detail)}
      @cell-change=${(event: CustomEvent<DataGridCellChangeDetail>) => console.log('cell-change', event.detail)}
      @edit-start=${(event: CustomEvent<DataGridEditStartDetail>) => console.log('edit-start', event.detail)}
      @range-needed=${(event: CustomEvent<DataGridRangeNeededDetail>) => console.log('range-needed', event.detail)}
      @column-resize=${(event: CustomEvent<DataGridColumnResizeDetail>) => console.log('column-resize', event.detail)}
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
export const Editable: Story = { args: { editable: true, selectable: 'range' } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const EmptyMessage: Story = { args: { data: [], emptyMessage: 'No items match these filters.' } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };

export const ServerPaged: Story = {
  args: { data: priceListRows.slice(0, 3), rowCount: 200, height: 'fixed' },
  render: (args) => html`
    <ds-data-grid
      caption=${args.caption}
      .columns=${args.columns}
      .data=${args.data}
      row-count=${args.rowCount ?? ''}
      height="fixed"
      @range-needed=${(event: CustomEvent<DataGridRangeNeededDetail>) => console.log('range-needed', event.detail)}
    ></ds-data-grid>
  `,
};

/**
 * A grid with a sortable, editable price list and range selection — enough focusable structure (header sort
 * button, resizable column, several editable cells) to exercise arrow navigation, Enter/F2 editing and Escape.
 */
export const Keyboard: Story = {
  args: { selectable: 'range', editable: true },
};
