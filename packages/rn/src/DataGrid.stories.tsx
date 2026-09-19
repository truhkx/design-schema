import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataGrid } from './DataGrid';
import type { DataGridColumn, DataGridRow } from './DataGrid';
import { withTheme } from './decorators';

const columns: DataGridColumn[] = [
  { key: 'sku', header: 'SKU', isRowHeader: true, width: 160 },
  { key: 'name', header: 'Name' },
  { key: 'price', header: 'Price', align: 'end', sortable: true },
];

const data: DataGridRow[] = [
  { id: 'a', sku: 'A-1', name: 'Widget', price: 10 },
  { id: 'b', sku: 'B-2', name: 'Sprocket', price: 20 },
];

const meta: Meta<typeof DataGrid> = {
  title: 'DataGrid/React Native',
  component: DataGrid,
  decorators: [withTheme()],
  args: {
    caption: 'Price list',
    captionLevel: '2',
    hideCaption: false,
    columns,
    data,
    selectable: 'none',
    editable: false,
    density: 'compact',
    stickyHeader: true,
    height: 'viewport',
    loading: false,
    showStatusBar: true,
  },
};

export default meta;

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {};

// captionLevel
export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

// selectable
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };
export const SelectableRange: Story = { args: { selectable: 'range' } };

// density
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

// height
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightViewport: Story = { args: { height: 'viewport' } };
export const HeightFixed: Story = { args: { height: 'fixed' } };

// notable states
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const HiddenCaption: Story = { args: { hideCaption: true } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const ResizableAndPinned: Story = {
  args: {
    columns: [
      { key: 'sku', header: 'SKU', isRowHeader: true, width: 160, pinned: 'start', resizable: true },
      { key: 'name', header: 'Name', resizable: true },
      { key: 'price', header: 'Price', align: 'end', sortable: true, resizable: true },
    ],
  },
};

// examples
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

/** Sortable header, select-all, row checkboxes and editable cells, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    height: 'content',
    columns: [
      { key: 'sku', header: 'SKU', isRowHeader: true, width: 160 },
      { key: 'name', header: 'Name', editable: true, editor: 'text' },
      { key: 'price', header: 'Price', align: 'end', sortable: true, editable: true, editor: 'number' },
    ],
  },
};
