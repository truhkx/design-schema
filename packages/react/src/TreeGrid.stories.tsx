import type { Meta, StoryObj } from '@storybook/react';
import type { DataGridColumn } from './DataGrid';
import { TreeGrid, type TreeGridRow } from './TreeGrid';

const DATA: TreeGridRow[] = [
  {
    id: 'assets',
    name: 'Assets',
    balance: 128400,
    children: [
      { id: 'assets-cash', name: 'Cash', balance: 42000 },
      { id: 'assets-receivable', name: 'Accounts receivable', balance: 31400 },
      {
        id: 'assets-equipment',
        name: 'Equipment',
        balance: 55000,
        children: [
          { id: 'assets-equipment-office', name: 'Office equipment', balance: 20000 },
          { id: 'assets-equipment-vehicles', name: 'Vehicles', balance: 35000 },
        ],
      },
    ],
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    balance: 41200,
    children: [
      { id: 'liabilities-payable', name: 'Accounts payable', balance: 18200 },
      { id: 'liabilities-loans', name: 'Loans payable', balance: 23000 },
    ],
  },
  { id: 'equity', name: "Owner's equity", balance: 87200 },
];

const LAZY_DATA: TreeGridRow[] = [
  { id: 'assets', name: 'Assets', balance: 128400, children: 'lazy' },
  { id: 'liabilities', name: 'Liabilities', balance: 41200, children: 'lazy' },
];

const COLUMNS: DataGridColumn[] = [
  { key: 'name', header: 'Account', isRowHeader: true, width: 260 },
  {
    key: 'balance',
    header: 'Balance (USD)',
    abbr: 'Balance',
    align: 'end',
    width: 160,
    sortable: true,
    editable: true,
    editor: 'number',
    render: (row) => `$${(row.balance as number).toLocaleString()}`,
  },
];

const meta = {
  title: 'TreeGrid/React',
  component: TreeGrid,
  args: {
    caption: 'Chart of accounts',
    columns: COLUMNS,
    data: DATA,
    defaultExpanded: ['assets', 'liabilities'],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableRowSelectChildren: Story = { args: { selectable: 'row', selectChildren: true } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };

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

export const Editable: Story = { args: { editable: true, selectable: 'cell' } };

export const Loading: Story = { args: { loading: true } };

export const Empty: Story = { args: { data: [] } };

export const HideStatusBar: Story = { args: { showStatusBar: false } };

export const DefaultExpandAll: Story = { args: { defaultExpanded: ['*'] } };

export const Collapsed: Story = { args: { defaultExpanded: [] } };

/**
 * `children: "lazy"` rows show the expand control and a loading placeholder until the caller
 * supplies real children through `onExpand`.
 */
export const LazyChildren: Story = {
  args: {
    data: LAZY_DATA,
    defaultExpanded: ['assets'],
    onExpand: () => undefined,
  },
};

/**
 * Open/present with at least three focusable children, for the keyboard gate: the select-all
 * Checkbox plus one per top-level row.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
  },
};
