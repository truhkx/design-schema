import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid, type DataGridColumn, type DataGridRow } from './DataGrid';

const COLUMNS: DataGridColumn[] = [
  { key: 'sku', header: 'SKU', isRowHeader: true, width: 120, pinned: 'start' },
  { key: 'name', header: 'Name', width: 200, resizable: true },
  {
    key: 'category',
    header: 'Category',
    editable: true,
    editor: 'select',
    options: [
      { value: 'Lighting', label: 'Lighting' },
      { value: 'Furniture', label: 'Furniture' },
      { value: 'Decor', label: 'Decor' },
    ],
  },
  {
    key: 'qty',
    header: 'Qty',
    align: 'end',
    width: 80,
    sortable: true,
    editable: true,
    editor: 'number',
    validate: (value) => (typeof value === 'number' && value >= 0 ? undefined : 'Qty must be zero or more.'),
  },
  { key: 'price', header: 'Price (USD)', abbr: 'Price in US dollars', align: 'end', sortable: true },
];

const DATA: DataGridRow[] = [
  { id: 'a', sku: 'A-1', name: 'Aster desk lamp', category: 'Lighting', qty: 42, price: 39 },
  { id: 'b', sku: 'B-2', name: 'Bramble side table', category: 'Furniture', qty: 8, price: 129 },
  { id: 'c', sku: 'C-3', name: 'Cedar wall clock', category: 'Decor', qty: 15, price: 54.5 },
  { id: 'd', sku: 'D-4', name: 'Driftwood shelf', category: 'Furniture', qty: 23, price: 89 },
  { id: 'e', sku: 'E-5', name: 'Ember candle set', category: 'Decor', qty: 60, price: 24 },
];

const meta: Meta<typeof DataGrid> = {
  title: 'DataGrid/React',
  component: DataGrid,
  args: {
    caption: 'Price list',
    columns: COLUMNS,
    data: DATA,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* captionLevel */
export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

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

export const RangeSelection: Story = {
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

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const EmptyMessage: Story = { args: { data: [], emptyMessage: 'No prices loaded.' } };
export const DefaultSort: Story = { args: { defaultSort: { column: 'price', direction: 'descending' } } };
export const Editable: Story = { args: { editable: true } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const ServerPaged: Story = {
  args: {
    rowCount: 500,
    onRangeNeeded: () => undefined,
  },
};
export const ManyRows: Story = {
  args: {
    data: Array.from({ length: 2000 }, (_, i) => ({
      id: `r${i}`,
      sku: `S-${i + 1}`,
      name: `Item ${i + 1}`,
      category: 'Decor',
      qty: i % 50,
      price: (i % 40) + 1,
    })),
  },
};

/**
 * The grid present with a sortable header, the select-all Checkbox and one Checkbox per row — well over
 * three focusable children — for the keyboard gate. No decorators.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
  },
};
