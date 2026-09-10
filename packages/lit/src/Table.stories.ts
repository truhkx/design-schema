import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Table.js';
import './Button.js';
import './Icon.js';
import type {
  TableCaptionLevel,
  TableColumn,
  TableDensity,
  TableMaxHeight,
  TableResponsive,
  TableRow,
  TableRowPressDetail,
  TableSelectable,
  TableSelectionChangeDetail,
  TableSortChangeDetail,
} from './Table.js';

interface TableArgs {
  caption: string;
  captionLevel: TableCaptionLevel;
  hideCaption: boolean;
  columns: TableColumn[];
  data: TableRow[];
  selectable: TableSelectable;
  responsive: TableResponsive;
  stickyHeader: boolean;
  maxHeight: TableMaxHeight;
  density: TableDensity;
  striped: boolean;
  loading: boolean;
  emptyMessage?: string;
}

const invoiceColumns: TableColumn[] = [
  { key: 'id', header: 'Invoice', isRowHeader: true },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount (USD)', align: 'end', sortable: true },
  { key: 'status', header: 'Status', hideBelow: 'content' },
];

const invoiceRows: TableRow[] = [
  { id: 'INV-1001', customer: 'Acme Co.', amount: '$1,240.00', status: 'Open' },
  { id: 'INV-1002', customer: 'Globex', amount: '$860.50', status: 'Open' },
  { id: 'INV-1003', customer: 'Initech', amount: '$3,020.00', status: 'Overdue' },
  { id: 'INV-1004', customer: 'Umbrella Corp.', amount: '$412.75', status: 'Paid' },
];

const wideColumns: TableColumn[] = [
  { key: 'month', header: 'Month', isRowHeader: true },
  { key: 'q1', header: 'Region A', align: 'end' },
  { key: 'q2', header: 'Region B', align: 'end' },
  { key: 'q3', header: 'Region C', align: 'end' },
  { key: 'q4', header: 'Region D', align: 'end' },
  { key: 'q5', header: 'Region E', align: 'end' },
];

const wideRows: TableRow[] = [
  { id: 'jan', month: 'January', q1: '1,204', q2: '980', q3: '760', q4: '1,102', q5: '640' },
  { id: 'feb', month: 'February', q1: '1,410', q2: '1,020', q3: '812', q4: '990', q5: '705' },
  { id: 'mar', month: 'March', q1: '1,330', q2: '1,105', q3: '890', q4: '1,240', q5: '812' },
];

const meta: Meta<TableArgs> = {
  title: 'Table/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['sort-change', 'selection-change', 'row-press'] },
  },
  argTypes: {
    captionLevel: { control: 'select', options: ['2', '3', '4'] },
    selectable: { control: 'select', options: ['none', 'single', 'multiple'] },
    responsive: { control: 'select', options: ['stack', 'scroll'] },
    maxHeight: { control: 'select', options: ['none', 'viewport'] },
    density: { control: 'select', options: ['compact', 'comfortable'] },
    hideCaption: { control: 'boolean' },
    stickyHeader: { control: 'boolean' },
    striped: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    caption: 'Open invoices',
    captionLevel: '2',
    hideCaption: false,
    columns: invoiceColumns,
    data: invoiceRows,
    selectable: 'none',
    responsive: 'stack',
    stickyHeader: true,
    maxHeight: 'none',
    density: 'comfortable',
    striped: false,
    loading: false,
  },
  render: (args) => html`
    <ds-table
      caption=${args.caption}
      caption-level=${args.captionLevel}
      ?hide-caption=${args.hideCaption}
      .columns=${args.columns}
      .data=${args.data}
      selectable=${args.selectable}
      responsive=${args.responsive}
      ?no-sticky-header=${!args.stickyHeader}
      max-height=${args.maxHeight}
      density=${args.density}
      ?striped=${args.striped}
      ?loading=${args.loading}
      empty-message=${args.emptyMessage ?? ''}
      @sort-change=${(event: CustomEvent<TableSortChangeDetail>) => console.log('sort-change', event.detail)}
      @selection-change=${(event: CustomEvent<TableSelectionChangeDetail>) =>
        console.log('selection-change', event.detail)}
      @row-press=${(event: CustomEvent<TableRowPressDetail>) => console.log('row-press', event.detail)}
    ></ds-table>
  `,
};

export default meta;
type Story = StoryObj<TableArgs>;

export const Default: Story = {};

/* captionLevel */
export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single' } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple' } };

/* responsive */
export const ResponsiveStack: Story = { args: { responsive: 'stack' } };
export const ResponsiveScroll: Story = {
  args: { responsive: 'scroll', columns: wideColumns, data: wideRows, caption: 'Revenue by region' },
};

/* maxHeight */
export const MaxHeightNone: Story = { args: { maxHeight: 'none' } };
export const MaxHeightViewport: Story = {
  args: {
    maxHeight: 'viewport',
    data: [...invoiceRows, ...invoiceRows.map((row) => ({ ...row, id: `${row.id}-B` }))],
  },
};

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const NoStickyHeader: Story = { args: { stickyHeader: false } };
export const Striped: Story = { args: { striped: true } };
export const Loading: Story = { args: { loading: true } };
export const LoadingEmpty: Story = { args: { loading: true, data: [] } };
export const Empty: Story = { args: { data: [] } };
export const EmptyMessage: Story = { args: { data: [], emptyMessage: 'No invoices match these filters.' } };

export const RowActions: Story = {
  render: (args) => html`
    <ds-table
      caption=${args.caption}
      .columns=${args.columns}
      .data=${args.data}
      .rowActions=${(row: TableRow) => html`
        <ds-button variant="ghost" size="sm" icon-only label="Edit ${row.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      `}
    ></ds-table>
  `,
};

/**
 * `selectable="multiple"` with a sortable column and row actions gives select-all, a sort button, per-row
 * checkboxes and per-row action buttons — every kind of focusable content Tab moves through in reading order.
 */
export const Keyboard: Story = {
  render: () => html`
    <ds-table
      caption="Open invoices"
      selectable="multiple"
      .columns=${invoiceColumns}
      .data=${invoiceRows}
      .rowActions=${(row: TableRow) => html`
        <ds-button variant="ghost" size="sm" icon-only label="Edit ${row.id}">
          <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
        </ds-button>
      `}
    ></ds-table>
  `,
};
