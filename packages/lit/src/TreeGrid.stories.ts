import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './TreeGrid.js';
import type {
  TreeGridCellChangeDetail,
  TreeGridDensity,
  TreeGridExpandChangeDetail,
  TreeGridExpandDetail,
  TreeGridHeight,
  TreeGridRow,
  TreeGridSelectable,
  TreeGridSelectionChangeDetail,
  TreeGridSortChangeDetail,
} from './TreeGrid.js';
import type { DataGridColumn } from './DataGrid.js';

interface TreeGridArgs {
  caption: string;
  hideCaption: boolean;
  columns: DataGridColumn[];
  data: TreeGridRow[];
  defaultExpanded?: string[];
  selectable: TreeGridSelectable;
  selectChildren: boolean;
  editable: boolean;
  density: TreeGridDensity;
  height: TreeGridHeight;
  loading: boolean;
  showStatusBar: boolean;
}

const accountColumns: DataGridColumn[] = [
  { key: 'name', header: 'Account', isRowHeader: true, width: 220 },
  { key: 'code', header: 'Code', width: 100 },
  {
    key: 'balance',
    header: 'Balance (USD)',
    align: 'end',
    sortable: true,
    editable: true,
    editor: 'number',
    width: 140,
  },
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
  {
    id: 'equity',
    name: 'Equity',
    code: '3000',
    balance: 83000,
    children: 'lazy',
  },
];

const meta: Meta<TreeGridArgs> = {
  title: 'TreeGrid/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['expand-change', 'expand', 'sort-change', 'selection-change', 'cell-change'] },
  },
  argTypes: {
    selectable: { control: 'select', options: ['none', 'row', 'cell'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
    height: { control: 'select', options: ['content', 'viewport', 'fixed'] },
    hideCaption: { control: 'boolean' },
    selectChildren: { control: 'boolean' },
    editable: { control: 'boolean' },
    loading: { control: 'boolean' },
    showStatusBar: { control: 'boolean' },
  },
  args: {
    caption: 'Chart of accounts',
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
  },
  render: (args) => html`
    <ds-tree-grid
      caption=${args.caption}
      ?hide-caption=${args.hideCaption}
      .columns=${args.columns}
      .data=${args.data}
      .defaultExpanded=${args.defaultExpanded ?? []}
      selectable=${args.selectable}
      ?select-children=${args.selectChildren}
      ?editable=${args.editable}
      density=${args.density}
      height=${args.height}
      ?loading=${args.loading}
      ?no-status-bar=${!args.showStatusBar}
      @expand-change=${(event: CustomEvent<TreeGridExpandChangeDetail>) => console.log('expand-change', event.detail)}
      @expand=${(event: CustomEvent<TreeGridExpandDetail>) => console.log('expand', event.detail)}
      @sort-change=${(event: CustomEvent<TreeGridSortChangeDetail>) => console.log('sort-change', event.detail)}
      @selection-change=${(event: CustomEvent<TreeGridSelectionChangeDetail>) =>
        console.log('selection-change', event.detail)}
      @cell-change=${(event: CustomEvent<TreeGridCellChangeDetail>) => console.log('cell-change', event.detail)}
    ></ds-tree-grid>
  `,
};

export default meta;
type Story = StoryObj<TreeGridArgs>;

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

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const SelectChildren: Story = { args: { selectable: 'row', selectChildren: true } };
export const Editable: Story = { args: { editable: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const NoStatusBar: Story = { args: { showStatusBar: false } };
export const AllExpanded: Story = { args: { defaultExpanded: ['*'] } };
export const Lazy: Story = { args: { defaultExpanded: ['equity'] } };

/**
 * A fully expanded tree with a sortable, editable balance column — enough focusable structure (several row
 * headers with children, several leaves) to exercise ArrowLeft/ArrowRight/`*` expansion and Enter/F2 editing.
 */
export const Keyboard: Story = {
  args: { defaultExpanded: ['*'], editable: true },
};
