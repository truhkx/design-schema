import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid, type DataGridColumn, type DataGridRow } from './DataGrid';

interface Product extends DataGridRow {
  name: string;
  category: string;
  qty: number;
  price: number;
  active: boolean;
}

const DATA: Product[] = [
  { id: 'sku-1001', name: 'Aster desk lamp', category: 'Lighting', qty: 42, price: 39.0, active: true },
  { id: 'sku-1002', name: 'Bramble side table', category: 'Furniture', qty: 8, price: 129.0, active: true },
  { id: 'sku-1003', name: 'Cedar wall clock', category: 'Decor', qty: 15, price: 54.5, active: false },
  { id: 'sku-1004', name: 'Driftwood shelf', category: 'Furniture', qty: 23, price: 89.0, active: true },
  { id: 'sku-1005', name: 'Ember candle set', category: 'Decor', qty: 60, price: 24.0, active: true },
];

const CATEGORY_OPTIONS = [
  { value: 'Lighting', label: 'Lighting' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Decor', label: 'Decor' },
];

const COLUMNS: DataGridColumn[] = [
  { key: 'name', header: 'Name', isRowHeader: true, width: 200, resizable: true },
  { key: 'category', header: 'Category', width: 160, editable: true, editor: 'select', options: CATEGORY_OPTIONS },
  {
    key: 'qty',
    header: 'Qty',
    align: 'end',
    width: 100,
    sortable: true,
    editable: true,
    editor: 'number',
    validate: (value) => (typeof value === 'number' && value >= 0 ? undefined : 'Qty must be zero or more.'),
  },
  {
    key: 'price',
    header: 'Price (USD)',
    abbr: 'Price',
    align: 'end',
    width: 140,
    sortable: true,
    editable: true,
    editor: 'number',
    render: (row) => `$${(row as Product).price.toFixed(2)}`,
  },
];

const meta = {
  title: 'DataGrid/React',
  component: DataGrid,
  args: {
    caption: 'Price list',
    columns: COLUMNS,
    data: DATA,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

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
export const HeightViewport: Story = {
  args: { height: 'viewport' },
  decorators: [(Story) => <div style={{ blockSize: '400px' }}><Story /></div>], // literal-ok: Storybook canvas height, not a component style
};
export const HeightFixed: Story = { args: { height: 'fixed' } };

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };

export const NoStickyHeader: Story = { args: { stickyHeader: false } };

export const Empty: Story = { args: { data: [] } };

export const EmptyWithMessage: Story = { args: { data: [], emptyMessage: 'No products match these filters.' } };

export const Loading: Story = { args: { loading: true } };

export const DefaultSort: Story = { args: { defaultSort: { column: 'price', direction: 'descending' } } };

export const Editable: Story = { args: { editable: true, selectable: 'cell' } };

export const PinnedColumns: Story = {
  args: {
    columns: [
      { ...COLUMNS[0], pinned: 'start' },
      ...COLUMNS.slice(1, -1),
      { ...COLUMNS[COLUMNS.length - 1], pinned: 'end' },
    ],
  },
};

export const ServerPaged: Story = {
  args: {
    data: DATA.slice(0, 2),
    rowCount: 500,
    onRangeNeeded: () => undefined,
  },
};

export const HideStatusBar: Story = { args: { showStatusBar: false } };

/**
 * Open/present with at least three focusable children, for the keyboard gate: the sortable
 * headers' Buttons and the select-all Checkbox plus one per row.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
  },
};
