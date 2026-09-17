import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './TreeGrid.js';
import type { DataGridColumn } from './DataGrid.js';
import type {
  TreeGridCaptionLevel,
  TreeGridDensity,
  TreeGridHeight,
  TreeGridRow,
  TreeGridSelectable,
  TreeGridSort,
} from './TreeGrid.js';

interface TreeGridArgs {
  caption: string;
  captionLevel: TreeGridCaptionLevel;
  hideCaption: boolean;
  columns: DataGridColumn[];
  data: TreeGridRow[];
  expanded?: string[] | undefined;
  defaultExpanded?: string[] | undefined;
  sort?: TreeGridSort | undefined;
  defaultSort?: TreeGridSort | undefined;
  selectable: TreeGridSelectable;
  selected?: string[] | undefined;
  defaultSelected?: string[] | undefined;
  selectChildren: boolean;
  editable: boolean;
  density: TreeGridDensity;
  height: TreeGridHeight;
  loading: boolean;
  showStatusBar: boolean;
  stickyHeader: boolean;
  emptyMessage?: string | undefined;
}

const accountColumns: DataGridColumn[] = [
  { key: 'name', header: 'Account', isRowHeader: true, width: 240, resizable: true },
  { key: 'code', header: 'Code', width: 96 },
  { key: 'balance', header: 'Balance', align: 'end', sortable: true, editable: true, editor: 'number', width: 144 },
];

const accountsData: TreeGridRow[] = [
  {
    id: 'assets',
    name: 'Assets',
    code: '1000',
    balance: 125000,
    children: [
      {
        id: 'current-assets',
        name: 'Current assets',
        code: '1100',
        balance: 85000,
        children: [
          { id: 'cash', name: 'Cash', code: '1110', balance: 50000 },
          { id: 'receivables', name: 'Accounts receivable', code: '1120', balance: 35000 },
        ],
      },
      {
        id: 'fixed-assets',
        name: 'Fixed assets',
        code: '1200',
        balance: 40000,
        children: [{ id: 'equipment', name: 'Equipment', code: '1210', balance: 40000 }],
      },
    ],
  },
  {
    id: 'liabilities',
    name: 'Liabilities',
    code: '2000',
    balance: 42000,
    children: [{ id: 'payables', name: 'Accounts payable', code: '2100', balance: 42000 }],
  },
  { id: 'equity', name: 'Equity', code: '3000', balance: 83000, children: 'lazy' },
];

const meta: Meta<TreeGridArgs> = {
  title: 'TreeGrid/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: {
      handles: ['expand-change', 'expand', 'sort-change', 'selection-change', 'cell-change', 'edit-start', 'column-resize'],
    },
  },
  argTypes: {
    captionLevel: { control: 'select', options: ['2', '3', '4'] },
    selectable: { control: 'select', options: ['none', 'row', 'cell'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
    height: { control: 'select', options: ['content', 'viewport', 'fixed'] },
    hideCaption: { control: 'boolean' },
    selectChildren: { control: 'boolean' },
    editable: { control: 'boolean' },
    loading: { control: 'boolean' },
    showStatusBar: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    emptyMessage: { control: 'text' },
  },
  args: {
    caption: 'Chart of accounts',
    captionLevel: '2',
    hideCaption: false,
    columns: accountColumns,
    data: accountsData,
    defaultExpanded: ['assets', 'current-assets'],
    selectable: 'none',
    selectChildren: false,
    editable: false,
    density: 'compact',
    height: 'viewport',
    loading: false,
    showStatusBar: true,
    stickyHeader: true,
  },
  render: (args) => html`
    <ds-tree-grid
      caption=${args.caption}
      caption-level=${args.captionLevel}
      ?hide-caption=${args.hideCaption}
      .columns=${args.columns}
      .data=${args.data}
      .expanded=${args.expanded}
      .defaultExpanded=${args.defaultExpanded}
      .sort=${args.sort}
      .defaultSort=${args.defaultSort}
      selectable=${args.selectable}
      .selected=${args.selected}
      .defaultSelected=${args.defaultSelected}
      ?select-children=${args.selectChildren}
      ?editable=${args.editable}
      density=${args.density}
      height=${args.height}
      ?loading=${args.loading}
      ?no-status-bar=${!args.showStatusBar}
      ?no-sticky-header=${!args.stickyHeader}
      empty-message=${ifDefined(args.emptyMessage)}
    ></ds-tree-grid>
  `,
};

export default meta;
type Story = StoryObj<TreeGridArgs>;

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

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const SelectChildren: Story = { args: { selectable: 'row', selectChildren: true, defaultExpanded: ['*'] } };
export const Editable: Story = { args: { editable: true } };
export const Loading: Story = { args: { loading: true } };
export const LazyRowLoading: Story = { args: { defaultExpanded: ['equity'] } };
export const Empty: Story = { args: { data: [] } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const NoStickyHeader: Story = { args: { stickyHeader: false, height: 'content' } };

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

/**
 * Fully expanded, sortable and editable: several parent row headers and leaves to exercise ArrowLeft/ArrowRight,
 * `*`, Enter and F2. The grid is one tab stop; its cells are reached with the arrows.
 */
export const Keyboard: Story = {
  args: { defaultExpanded: ['*'], editable: true, selectable: 'row', height: 'content' },
};
