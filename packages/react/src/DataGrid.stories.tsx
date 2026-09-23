import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid, type DataGridColumn, type DataGridRow } from './DataGrid';

const columns: DataGridColumn[] = [
  { key: 'sku', header: 'SKU', isRowHeader: true, width: 160, pinned: 'start' },
  { key: 'name', header: 'Name', sortable: true, resizable: true },
  { key: 'category', header: 'Category', sortable: true },
  { key: 'price', header: 'Price (USD)', abbr: 'Price in US dollars', align: 'end' },
  { key: 'stock', header: 'Qty', abbr: 'Quantity in stock', align: 'end' },
];

const names = ['Widget', 'Sprocket', 'Gear', 'Flange', 'Bracket', 'Hinge', 'Spring', 'Valve'];
const categories = ['Hardware', 'Fittings', 'Motion'];

const data: DataGridRow[] = Array.from({ length: 200 }, (_, index) => ({
  id: `row-${index}`,
  sku: `A-${1000 + index}`,
  name: `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`,
  category: categories[index % categories.length],
  price: ((index * 37) % 500) + 10,
  stock: (index * 13) % 90,
}));

const meta: Meta<typeof DataGrid> = {
  title: 'DataGrid/React',
  component: DataGrid,
  tags: ['autodocs'],
  args: {
    caption: 'Price list',
    columns,
    data,
  },
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {};

export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };
export const SelectableRange: Story = { args: { selectable: 'range' } };

export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

export const HeightContent: Story = { args: { height: 'content', data: data.slice(0, 8) } };
export const HeightViewport: Story = { args: { height: 'viewport' } };
export const HeightFixed: Story = { args: { height: 'fixed', overrides: { fixedHeight: 'layout.maxWidth.prose' } } };

export const HiddenCaption: Story = { args: { hideCaption: true } };
export const Loading: Story = { args: { loading: true } };
export const LoadingFirstPage: Story = { args: { loading: true, data: [] } };
export const Empty: Story = { args: { data: [] } };
export const EmptyWithMessage: Story = { args: { data: [], emptyMessage: 'No prices loaded.' } };
export const WithoutStatusBar: Story = { args: { showStatusBar: false } };
export const Editable: Story = {
  args: {
    editable: true,
    columns: [
      { key: 'sku', header: 'SKU', isRowHeader: true },
      { key: 'name', header: 'Name', editable: true, editor: 'text' },
      {
        key: 'category',
        header: 'Category',
        editable: true,
        editor: 'select',
        options: categories.map((category) => ({ value: category, label: category })),
      },
      {
        key: 'price',
        header: 'Price (USD)',
        align: 'end',
        editable: true,
        editor: 'number',
        validate: (value) => (typeof value === 'number' && value < 0 ? 'Price cannot be negative.' : undefined),
      },
    ],
  },
};

/** Keyboard gate: the grid is present with sortable headers and select checkboxes inside it. */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    data: data.slice(0, 20),
  },
};

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
