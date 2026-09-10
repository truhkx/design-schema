import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeGrid } from './TreeGrid';
import type { TreeGridRow } from './TreeGrid';
import type { DataGridColumn } from './DataGrid';
import { withTheme } from './decorators';

const columns: DataGridColumn[] = [
  { key: 'name', header: 'Account', isRowHeader: true, width: 220, editable: true, editor: 'text' },
  { key: 'code', header: 'Code', width: 100 },
  { key: 'balance', header: 'Balance (USD)', align: 'end', sortable: true, width: 140, editable: true, editor: 'number' },
];

const data: TreeGridRow[] = [
  {
    id: 'assets',
    name: 'Assets',
    code: '1000',
    balance: '184,300.00',
    children: [
      { id: 'cash', name: 'Cash', code: '1010', balance: '42,000.00' },
      {
        id: 'receivables',
        name: 'Receivables',
        code: '1020',
        balance: '61,300.00',
        children: [
          { id: 'trade', name: 'Trade receivables', code: '1021', balance: '58,000.00' },
          { id: 'other-receivables', name: 'Other receivables', code: '1022', balance: '3,300.00' },
        ],
      },
      { id: 'inventory', name: 'Inventory', code: '1030', balance: '81,000.00', children: 'lazy' },
    ],
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    code: '2000',
    balance: '73,500.00',
    children: [
      { id: 'payables', name: 'Payables', code: '2010', balance: '48,500.00' },
      { id: 'loans', name: 'Loans', code: '2020', balance: '25,000.00' },
    ],
  },
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
    selectChildren: false,
    editable: false,
    density: 'compact',
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
export const SelectChildren: Story = {
  args: { selectable: 'row', selectChildren: true, defaultExpanded: ['assets', 'receivables'] },
};

export const Editable: Story = { args: { editable: true, selectable: 'cell' } };

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { data: [] } };

export const HiddenCaption: Story = { args: { hideCaption: true } };

export const ExpandAll: Story = { args: { defaultExpanded: ['*'] } };

export const WithOverrides: Story = {
  args: {
    overrides: { indent: 'space.6', guideLine: 'color.border.strong', parentWeight: 'font.weight.bold' },
  },
};

/** Open with three rows expanded and focusable (two expand buttons, a leaf cell), for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    defaultExpanded: ['assets', 'receivables'],
    selectable: 'row',
    editable: true,
    height: 'content',
  },
};
