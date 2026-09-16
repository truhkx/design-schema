import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeGrid } from './TreeGrid';
import type { TreeGridRow } from './TreeGrid';
import type { DataGridColumn } from './DataGrid';
import { withTheme } from './decorators';

const columns: DataGridColumn[] = [
  { key: 'account', header: 'Account', isRowHeader: true, width: 240 },
  { key: 'balance', header: 'Balance', align: 'end', sortable: true },
];

const data: TreeGridRow[] = [
  {
    id: 'assets',
    account: 'Assets',
    balance: 1400,
    children: [
      { id: 'cash', account: 'Cash', balance: 400 },
      { id: 'stock', account: 'Stock', balance: 1000 },
    ],
  },
  { id: 'liabilities', account: 'Liabilities', balance: 300, children: 'lazy' },
  { id: 'equity', account: 'Equity', balance: 1400 },
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
    stickyHeader: true,
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
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const HiddenCaption: Story = { args: { hideCaption: true } };
export const Resizable: Story = { args: { columns: columns.map((column) => ({ ...column, resizable: true })) } };
export const WithOverrides: Story = { args: { overrides: { guideLine: 'color.border.strong', parentWeight: 'font.weight.semibold' } } };

/** Expanded, with the expand button, row checkboxes, sort button and editable cells all focusable — for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    selectable: 'row',
    editable: true,
    defaultExpanded: ['assets'],
    columns: [
      { key: 'account', header: 'Account', isRowHeader: true, width: 240 },
      { key: 'balance', header: 'Balance', align: 'end', sortable: true, editable: true, editor: 'number' },
    ],
  },
};

// examples
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
