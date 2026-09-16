import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DataGridColumn } from './DataGrid';
import { TreeGrid, type TreeGridRow } from './TreeGrid';

const COLUMNS: DataGridColumn[] = [
  { key: 'account', header: 'Account', isRowHeader: true, width: 240 },
  { key: 'balance', header: 'Balance', align: 'end', sortable: true, editable: true, editor: 'number' },
];

const DATA: TreeGridRow[] = [
  {
    id: 'assets',
    account: 'Assets',
    balance: 1400,
    children: [
      { id: 'cash', account: 'Cash', balance: 400 },
      {
        id: 'stock',
        account: 'Stock',
        balance: 1000,
        children: [
          { id: 'raw', account: 'Raw materials', balance: 600 },
          { id: 'finished', account: 'Finished goods', balance: 400 },
        ],
      },
    ],
  },
  {
    id: 'liabilities',
    account: 'Liabilities',
    balance: 0,
    children: [{ id: 'payable', account: 'Accounts payable', balance: 0 }],
  },
  { id: 'equity', account: 'Equity', balance: 1400 },
];

const meta: Meta<typeof TreeGrid> = {
  title: 'TreeGrid/React',
  component: TreeGrid,
  args: {
    caption: 'Chart of accounts',
    columns: COLUMNS,
    data: DATA,
    defaultExpanded: ['assets'],
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableRow: Story = { args: { selectable: 'row' } };
export const SelectableCell: Story = { args: { selectable: 'cell' } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightViewport: Story = { args: { height: 'viewport' } };
export const HeightFixed: Story = { args: { height: 'fixed' } };

/* examples */
export const ChartOfAccounts: Story = {
  args: {
    caption: 'Chart of accounts',
    defaultExpanded: ['assets'],
    columns: [
      { key: 'account', header: 'Account', isRowHeader: true, width: 240 },
      { key: 'balance', header: 'Balance', align: 'end' },
    ],
    data: [
      {
        id: 'assets',
        account: 'Assets',
        balance: 1400,
        children: [
          { id: 'cash', account: 'Cash', balance: 400 },
          { id: 'stock', account: 'Stock', balance: 1000 },
        ],
      },
      { id: 'equity', account: 'Equity', balance: 1400 },
    ],
  },
};

export const LazyFolders: Story = {
  args: {
    caption: 'Files',
    columns: [
      { key: 'name', header: 'Name', isRowHeader: true },
      { key: 'size', header: 'Size', align: 'end' },
    ],
    data: [
      { id: 'docs', name: 'Documents', size: 0, children: 'lazy' },
      { id: 'media', name: 'Media', size: 0, children: 'lazy' },
    ],
  },
};

export const CascadingSelection: Story = {
  args: {
    caption: 'Bill of materials',
    selectable: 'row',
    selectChildren: true,
    defaultExpanded: ['*'],
    columns: [
      { key: 'part', header: 'Part', isRowHeader: true },
      { key: 'quantity', header: 'Quantity', align: 'end' },
    ],
    data: [{ id: 'frame', part: 'Frame', quantity: 1, children: [{ id: 'bolt', part: 'Bolt', quantity: 8 }] }],
  },
};

export const EditableQuantities: Story = {
  args: {
    caption: 'Bill of materials',
    editable: true,
    defaultExpanded: ['*'],
    columns: [
      { key: 'part', header: 'Part', isRowHeader: true },
      { key: 'quantity', header: 'Quantity', align: 'end', editable: true, editor: 'number' },
    ],
    data: [{ id: 'frame', part: 'Frame', quantity: 1, children: [{ id: 'bolt', part: 'Bolt', quantity: 8 }] }],
  },
};

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const Collapsed: Story = { args: { defaultExpanded: [] } };
export const ExpandAll: Story = { args: { defaultExpanded: ['*'] } };
export const LazyLoading: Story = {
  args: { data: [{ id: 'assets', account: 'Assets', balance: 1400, children: 'lazy' }], defaultExpanded: ['assets'] },
};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const EmptyMessage: Story = { args: { data: [], emptyMessage: 'No accounts yet.' } };
export const DefaultSort: Story = { args: { defaultSort: { column: 'balance', direction: 'descending' } } };
export const Editable: Story = { args: { editable: true } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const NoStickyHeader: Story = { args: { height: 'content', stickyHeader: false } };

/**
 * The tree grid present and expanded, with a sortable header, the select-all Checkbox and one Checkbox per
 * visible row — well over three focusable children — for the keyboard gate. No decorators.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    defaultExpanded: ['*'],
  },
};
