import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table, type TableColumn, type TableRow } from './Table';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

interface Invoice extends TableRow {
  customer: string;
  status: string;
  amount: number;
  due: string;
}

const DATA: Invoice[] = [
  { id: 'inv-1001', customer: 'Aster Studio', status: 'Open', amount: 420, due: '2026-09-30' },
  { id: 'inv-1002', customer: 'Bramble & Co', status: 'Overdue', amount: 1280, due: '2026-08-15' },
  { id: 'inv-1003', customer: 'Cedar Analytics', status: 'Open', amount: 96, due: '2026-10-04' },
  { id: 'inv-1004', customer: 'Driftwood Supply', status: 'Paid', amount: 640, due: '2026-09-01' },
];

const COLUMNS: TableColumn[] = [
  { key: 'customer', header: 'Customer', isRowHeader: true },
  { key: 'status', header: 'Status' },
  {
    key: 'amount',
    header: 'Amount (USD)',
    abbr: 'Amount',
    align: 'end',
    sortable: true,
    render: (row) => `$${(row as Invoice).amount.toFixed(2)}`,
  },
  { key: 'due', header: 'Due date', hideBelow: 'prose' },
];

const meta: Meta<typeof Table> = {
  title: 'Table/React',
  component: Table,
  args: {
    caption: 'Open invoices',
    columns: COLUMNS,
    data: DATA,
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
export const SelectableSingle: Story = { args: { selectable: 'single' } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple' } };

/* responsive */
export const ResponsiveStack: Story = { args: { responsive: 'stack' } };
export const ResponsiveScroll: Story = { args: { responsive: 'scroll' } };

/* maxHeight */
export const MaxHeightNone: Story = { args: { maxHeight: 'none' } };
export const MaxHeightViewport: Story = { args: { maxHeight: 'viewport', data: [...DATA, ...DATA, ...DATA] } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/* notable states */
export const HideCaption: Story = { args: { hideCaption: true } };

export const NoStickyHeader: Story = { args: { stickyHeader: false } };

export const Striped: Story = { args: { striped: true } };

export const Empty: Story = { args: { data: [] } };

export const EmptyWithMessage: Story = { args: { data: [], emptyMessage: 'No invoices match these filters.' } };

export const Loading: Story = { args: { loading: true } };

export const LoadingEmpty: Story = { args: { loading: true, data: [] } };

export const DefaultSort: Story = { args: { defaultSort: { column: 'amount', direction: 'descending' } } };

export const WithRowActions: Story = {
  args: {
    rowActions: (row) => (
      <Button variant="ghost" size="sm" iconOnly label={`Open ${(row as Invoice).customer}`} leadingIcon={<Icon name="ellipsis" inline />} />
    ),
  },
};

export const InteractiveRows: Story = {
  args: { onRowPress: () => undefined },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <Text element="p" size="sm" tone="muted">
        Showing {DATA.length} of {DATA.length} invoices.
      </Text>
    ),
  },
};

/**
 * Open/present with at least three focusable children, for the keyboard gate: the sortable
 * header's Button, the select-all Checkbox plus one per row, and a trailing action Button per row.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'multiple',
    rowActions: (row) => <Button variant="ghost" size="sm" label={`View ${(row as Invoice).customer}`} />,
  },
};
