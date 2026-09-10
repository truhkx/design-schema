import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid } from './DataGrid';
import type { DataGridColumn, DataGridRow } from './DataGrid';
import { withTheme } from './decorators';

const columns: DataGridColumn[] = [
  { key: 'name', header: 'Product', isRowHeader: true, width: 160 },
  { key: 'sku', header: 'SKU', width: 120 },
  { key: 'price', header: 'Price (USD)', align: 'end', sortable: true, width: 120, editable: true, editor: 'number' },
  { key: 'status', header: 'Status', sortable: true, width: 140, editable: true, editor: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ] },
  { key: 'inStock', header: 'In stock', width: 100, editable: true, editor: 'checkbox' },
];

const data: DataGridRow[] = [
  { id: '1', name: 'Desk lamp', sku: 'DL-100', price: '24.00', status: 'active', inStock: true },
  { id: '2', name: 'Standing desk', sku: 'SD-220', price: '389.50', status: 'active', inStock: true },
  { id: '3', name: 'Office chair', sku: 'OC-330', price: '210.00', status: 'draft', inStock: false },
  { id: '4', name: 'Monitor arm', sku: 'MA-410', price: '75.00', status: 'archived', inStock: false },
];

const meta: Meta<typeof DataGrid> = {
  title: 'DataGrid/React Native',
  component: DataGrid,
  decorators: [withTheme()],
  args: {
    caption: 'Price list',
    hideCaption: false,
    columns,
    data,
    selectable: 'none',
    editable: false,
    density: 'compact',
    stickyHeader: true,
    height: 'content',
    loading: false,
    showStatusBar: true,
  },
};

export default meta;

type Story = StoryObj<typeof DataGrid>;

export const Default: Story = {};

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
export const Editable: Story = { args: { editable: true, selectable: 'cell' } };

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { data: [], emptyMessage: 'No products match these filters.' } };

export const HiddenCaption: Story = { args: { hideCaption: true } };

export const Resizable: Story = {
  args: {
    columns: columns.map((column) => ({ ...column, resizable: true })),
  },
};

export const Pinned: Story = {
  args: {
    columns: [{ ...columns[0], pinned: 'start' }, ...columns.slice(1)],
  },
};

export const WithOverrides: Story = {
  args: {
    overrides: { headerBorder: 'color.border.strong', captionWeight: 'font.weight.bold' },
  },
};

/** Open with editing and selection both reachable, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    height: 'content',
  },
};
