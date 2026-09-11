import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeGrid } from './TreeGrid';
import type { TreeGridRow } from './TreeGrid';
import type { DataGridColumn } from './DataGrid';
import { withTheme } from './decorators';

const columns: DataGridColumn[] = [
  { key: 'name', header: 'Account', isRowHeader: true, sortable: true, width: 220 },
  { key: 'balance', header: 'Balance', align: 'end', width: 140 },
];

const data: TreeGridRow[] = [
  {
    id: 'assets',
    name: 'Assets',
    balance: '$120,000',
    children: [
      { id: 'cash', name: 'Cash', balance: '$40,000' },
      { id: 'ar', name: 'Accounts Receivable', balance: '$80,000' },
    ],
  },
  { id: 'liabilities', name: 'Liabilities', balance: '$45,000', children: 'lazy' },
  { id: 'equity', name: 'Equity', balance: '$75,000', children: [] },
];

const meta: Meta<typeof TreeGrid> = {
  title: 'TreeGrid/React Native',
  component: TreeGrid,
  decorators: [withTheme()],
  args: {
    caption: 'Chart of accounts',
    hideCaption: false,
    columns,
    data,
    defaultExpanded: ['assets'],
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

type Story = StoryObj<typeof TreeGrid>;

export const Default: Story = {};

// selectable
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };

// density
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

// height
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightViewport: Story = { args: { height: 'viewport' } };
export const HeightFixed: Story = { args: { height: 'fixed' } };

// notable states
export const SelectChildren: Story = { args: { selectable: 'row', selectChildren: true } };

export const Editable: Story = { args: { editable: true, selectable: 'cell' } };

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { data: [], emptyMessage: 'No accounts match these filters.' } };

export const HiddenCaption: Story = { args: { hideCaption: true } };

export const ExpandAll: Story = { args: { defaultExpanded: ['*'] } };

export const Resizable: Story = { args: { columns: columns.map((column) => ({ ...column, resizable: true })) } };

export const WithOverrides: Story = {
  args: {
    overrides: { guideLine: 'color.border.strong', parentWeight: 'font.weight.bold' },
  },
};

/** Expanded with selection and editing reachable — the expand button, the select checkboxes and the cells are all focusable, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    height: 'content',
    defaultExpanded: ['assets'],
  },
};
