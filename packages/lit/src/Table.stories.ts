import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Table.js';
import './Button.js';
import './Icon.js';
import './Text.js';
import type {
  TableCaptionLevel,
  TableColumn,
  TableDensity,
  TableMaxHeight,
  TableResponsive,
  TableRow,
  TableSelectable,
  TableSort,
} from './Table.js';

interface TableArgs {
  caption: string;
  captionLevel: TableCaptionLevel;
  hideCaption: boolean;
  columns: TableColumn[];
  data: TableRow[];
  sort?: TableSort | undefined;
  defaultSort?: TableSort | undefined;
  selectable: TableSelectable;
  selected?: string[] | undefined;
  defaultSelected?: string[] | undefined;
  responsive: TableResponsive;
  stickyHeader: boolean;
  maxHeight: TableMaxHeight;
  density: TableDensity;
  striped: boolean;
  emptyMessage?: string | undefined;
  loading: boolean;
  rowActions?: ((row: TableRow) => unknown) | undefined;
}

const invoiceColumns: TableColumn[] = [
  { key: 'invoice', header: 'Invoice', isRowHeader: true },
  { key: 'customer', header: 'Customer' },
  { key: 'due', header: 'Due', hideBelow: 'content' },
  { key: 'amount', header: 'Amount (USD)', align: 'end', sortable: true },
];

const invoiceRows: TableRow[] = [
  { id: 'a', invoice: 'INV-1001', customer: 'Acme Co.', due: '12 Sep', amount: 1240 },
  { id: 'b', invoice: 'INV-1002', customer: 'Globex', due: '19 Sep', amount: 860.5 },
  { id: 'c', invoice: 'INV-1003', customer: 'Initech', due: '26 Sep', amount: 3020 },
  { id: 'd', invoice: 'INV-1004', customer: 'Umbrella Corp.', due: '3 Oct', amount: 412.75 },
];

const editAction = (row: TableRow): unknown => html`
  <ds-button variant="ghost" size="sm" icon-only label="Edit ${String(row.invoice ?? row.id)}">
    <ds-icon slot="leading-icon" name="chevron-right" inline></ds-icon>
  </ds-button>
`;

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
    emptyMessage: { control: 'text' },
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
      .sort=${args.sort}
      .defaultSort=${args.defaultSort}
      selectable=${args.selectable}
      .selected=${args.selected}
      .defaultSelected=${args.defaultSelected}
      responsive=${args.responsive}
      ?no-sticky-header=${!args.stickyHeader}
      max-height=${args.maxHeight}
      density=${args.density}
      ?striped=${args.striped}
      .emptyMessage=${args.emptyMessage}
      ?loading=${args.loading}
      .rowActions=${args.rowActions}
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
export const ResponsiveScroll: Story = { args: { responsive: 'scroll' } };

/* maxHeight */
export const MaxHeightNone: Story = { args: { maxHeight: 'none' } };
export const MaxHeightViewport: Story = { args: { maxHeight: 'viewport' } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const NoStickyHeader: Story = { args: { stickyHeader: false } };
export const Striped: Story = { args: { striped: true } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { data: [] } };
export const RowActions: Story = { args: { rowActions: editAction } };

export const RowPress: Story = {
  render: (args) => html`
    <ds-table caption=${args.caption} .columns=${args.columns} .data=${args.data} pressable-rows></ds-table>
  `,
};

export const WithFooter: Story = {
  render: (args) => html`
    <ds-table caption=${args.caption} .columns=${args.columns} .data=${args.data}>
      <ds-text slot="footer" tone="muted" size="sm">4 rows</ds-text>
    </ds-table>
  `,
};

/* examples */
export const OpenInvoices: Story = {
  args: {
    caption: 'Open invoices',
    columns: [
      { key: 'invoice', header: 'Invoice', isRowHeader: true },
      { key: 'due', header: 'Due' },
      { key: 'amount', header: 'Amount', align: 'end', sortable: true },
    ],
    data: [
      { id: 'a', invoice: 'INV-1', due: '12 Sep', amount: 100 },
      { id: 'b', invoice: 'INV-2', due: '19 Sep', amount: 200 },
    ],
  },
};

export const SelectableRows: Story = {
  args: {
    caption: 'Members',
    selectable: 'multiple',
    defaultSelected: ['a'],
    columns: [
      { key: 'person', header: 'Person', isRowHeader: true },
      { key: 'role', header: 'Role' },
    ],
    data: [
      { id: 'a', person: 'Ana Souza', role: 'Admin' },
      { id: 'b', person: 'Bo Lin', role: 'Editor' },
    ],
  },
};

export const DenseDataTableThatScrolls: Story = {
  args: {
    caption: 'Daily traffic',
    responsive: 'scroll',
    density: 'compact',
    maxHeight: 'viewport',
    columns: [
      { key: 'day', header: 'Day', isRowHeader: true },
      { key: 'visits', header: 'Visits', align: 'end' },
      { key: 'signups', header: 'Signups', align: 'end' },
    ],
    data: [
      { id: 'a', day: 'Monday', visits: 1200, signups: 30 },
      { id: 'b', day: 'Tuesday', visits: 1450, signups: 41 },
    ],
  },
};

export const NothingToShow: Story = {
  args: {
    caption: 'Open invoices',
    emptyMessage: 'No invoices yet.',
    columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
    data: [],
  },
};

/** Select-all, a sort button, row checkboxes and row actions: Tab moves through them in reading order. */
export const Keyboard: Story = {
  args: { selectable: 'multiple', rowActions: editAction },
};
