import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableColumn, type TableRow } from './Table';
import { Button } from './Button';
import { Icon } from './Icon';
import { Link } from './Link';
import { Text } from './Text';

const INVOICE_COLUMNS: TableColumn[] = [
  { key: 'invoice', header: 'Invoice', isRowHeader: true },
  { key: 'due', header: 'Due' },
  { key: 'amount', header: 'Amount', align: 'end', sortable: true },
];

const INVOICES: TableRow[] = [
  { id: 'a', invoice: 'INV-1', due: '12 Sep', amount: 100 },
  { id: 'b', invoice: 'INV-2', due: '19 Sep', amount: 200 },
];

const meta: Meta<typeof Table> = {
  title: 'Table/React',
  component: Table,
  tags: ['autodocs'],
  args: {
    caption: 'Open invoices',
    columns: INVOICE_COLUMNS,
    data: INVOICES,
  },
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

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };
export const NoStickyHeader: Story = { args: { stickyHeader: false } };
export const Striped: Story = { args: { striped: true } };
export const Empty: Story = { args: { data: [] } };
export const Loading: Story = { args: { loading: true } };
export const DefaultSortDescending: Story = { args: { defaultSort: { column: 'amount', direction: 'descending' } } };

export const LinkInRowHeader: Story = {
  args: {
    columns: [
      { key: 'invoice', header: 'Invoice', isRowHeader: true, render: (row) => <Link href={`#${row.id}`} label={String(row['invoice'])} /> },
      { key: 'due', header: 'Due', hideBelow: 'prose' },
      { key: 'amount', header: 'Amount', align: 'end', sortable: true },
    ],
  },
};

export const InteractiveRows: Story = { args: { onRowPress: () => undefined } };

export const WithRowActions: Story = {
  args: {
    rowActions: (row) => (
      <Button variant="ghost" size="sm" iconOnly label={`More for ${String(row['invoice'])}`} leadingIcon={<Icon name="ellipsis" />} />
    ),
  },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <Text element="p" size="sm" tone="muted">
        2 rows
      </Text>
    ),
  },
};

/** Present with more than three focusable children: select-all, a sort button, and a Checkbox per row. */
export const Keyboard: Story = {
  args: { selectable: 'multiple' },
};
