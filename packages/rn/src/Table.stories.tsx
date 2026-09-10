import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Table } from './Table';
import { Text } from './Text';
import type { TableColumn, TableRow } from './Table';
import { withTheme } from './decorators';

const columns: TableColumn[] = [
  { key: 'name', header: 'Customer', isRowHeader: true },
  { key: 'invoice', header: 'Invoice', hideBelow: 'content' },
  { key: 'amount', header: 'Amount (USD)', align: 'end', sortable: true, width: 'fill' },
  { key: 'status', header: 'Status', sortable: true },
];

const data: TableRow[] = [
  { id: '1', name: 'Acme Co', invoice: 'INV-1001', amount: '1,204.00', status: 'Paid' },
  { id: '2', name: 'Globex', invoice: 'INV-1002', amount: '389.50', status: 'Overdue' },
  { id: '3', name: 'Initech', invoice: 'INV-1003', amount: '2,050.00', status: 'Paid' },
  { id: '4', name: 'Umbrella Corp', invoice: 'INV-1004', amount: '75.00', status: 'Draft' },
];

const meta: Meta<typeof Table> = {
  title: 'Table/React Native',
  component: Table,
  decorators: [withTheme()],
  args: {
    caption: 'Open invoices',
    hideCaption: false,
    columns,
    data,
    selectable: 'none',
    responsive: 'stack',
    stickyHeader: true,
    maxHeight: 'none',
    density: 'comfortable',
    striped: false,
    loading: false,
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {};

// captionLevel
export const CaptionLevel2: Story = { args: { captionLevel: '2' } };
export const CaptionLevel3: Story = { args: { captionLevel: '3' } };
export const CaptionLevel4: Story = { args: { captionLevel: '4' } };

// selectable
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single' } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple' } };

// responsive
export const ResponsiveStack: Story = { args: { responsive: 'stack' } };
export const ResponsiveScroll: Story = { args: { responsive: 'scroll' } };

// maxHeight
export const MaxHeightNone: Story = { args: { maxHeight: 'none' } };
export const MaxHeightViewport: Story = { args: { maxHeight: 'viewport' } };

// density
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

// notable states
export const Striped: Story = { args: { striped: true } };

export const Loading: Story = { args: { loading: true, data: [] } };

export const Empty: Story = { args: { data: [], emptyMessage: 'No invoices match these filters.' } };

export const HiddenCaption: Story = { args: { hideCaption: true } };

export const WithRowActions: Story = {
  args: {
    rowActions: () => <Button label="View" variant="ghost" size="sm" />,
  },
};

export const WithRowPress: Story = {
  args: {
    onRowPress: () => undefined,
  },
};

export const WithFooter: Story = {
  args: {
    footer: <Text size="sm" tone="muted">4 rows</Text>,
  },
};

export const WithOverrides: Story = {
  args: {
    overrides: { stackedRowRadius: 'radius.lg', headerBorder: 'color.border.strong' },
  },
};
