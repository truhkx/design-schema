import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DataGridColumn } from './DataGrid';
import { TreeGrid, type TreeGridRow } from './TreeGrid';

const COLUMNS: DataGridColumn[] = [
  { key: 'account', header: 'Account', isRowHeader: true, width: 240 },
  { key: 'code', header: 'Code', width: 100 },
  { key: 'balance', header: 'Balance', align: 'end', sortable: true },
];

const DATA: TreeGridRow[] = [
  {
    id: 'assets',
    account: 'Assets',
    code: '1000',
    balance: 1400,
    children: [
      { id: 'cash', account: 'Cash', code: '1010', balance: 400 },
      {
        id: 'stock',
        account: 'Stock',
        code: '1020',
        balance: 1000,
        children: [
          { id: 'raw', account: 'Raw materials', code: '1021', balance: 600 },
          { id: 'finished', account: 'Finished goods', code: '1022', balance: 400 },
        ],
      },
    ],
  },
  {
    id: 'liabilities',
    account: 'Liabilities',
    code: '2000',
    balance: 300,
    children: [{ id: 'payable', account: 'Accounts payable', code: '2010', balance: 300 }],
  },
  { id: 'equity', account: 'Equity', code: '3000', balance: 1100 },
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

/* captionLevel */
export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

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

/** Nested accounts with their balances, the top level expanded. */
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

/** A deep tree whose children are fetched the first time a row is expanded. */
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

/** Selection that means "this row and everything in it", with indeterminate parents. */
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

/** A nested grid that is worked in, where the quantity column takes a number editor. */
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
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const EmptyMessage: Story = { args: { data: [], emptyMessage: 'No accounts loaded.' } };
export const DefaultSort: Story = { args: { defaultSort: { column: 'balance', direction: 'descending' } } };
export const Editable: Story = { args: { editable: true } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const NoStickyHeader: Story = { args: { stickyHeader: false } };
export const SelectChildren: Story = { args: { selectable: 'row', selectChildren: true, defaultExpanded: ['*'] } };

/**
 * The tree grid present with expanded rows, a sortable header, the select-all Checkbox and one Checkbox
 * per row — well over three focusable children — for the keyboard gate. No decorators.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    defaultExpanded: ['*'],
  },
};
