import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Icon } from './Icon';
import { Table } from './Table';
import { Text } from './Text';
import type { TableColumn, TableRow } from './Table';
import { withTheme } from './decorators';

const columns: TableColumn[] = [
  { key: 'invoice', header: 'Invoice', isRowHeader: true },
  { key: 'customer', header: 'Customer', hideBelow: 'prose' },
  { key: 'due', header: 'Due' },
  { key: 'amount', header: 'Amount (USD)', align: 'end', sortable: true, width: 'fill' },
];

const data: TableRow[] = [
  { id: 'a', invoice: 'INV-1', customer: 'Acme Co', due: '12 Sep', amount: 1204 },
  { id: 'b', invoice: 'INV-2', customer: 'Globex', due: '19 Sep', amount: 389.5 },
  { id: 'c', invoice: 'INV-3', customer: 'Initech', due: '26 Sep', amount: 2050 },
];

const meta: Meta<typeof Table> = {
  title: 'Table/React Native',
  component: Table,
  decorators: [withTheme()],
  args: {
    caption: 'Open invoices',
    columns,
    data,
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

// examples
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

// notable states
export const Striped: Story = { args: { striped: true } };

export const Loading: Story = { args: { loading: true } };

export const HiddenCaption: Story = { args: { hideCaption: true } };

export const DefaultSort: Story = { args: { defaultSort: { column: 'amount', direction: 'descending' } } };

export const WithRowPress: Story = { args: { onRowPress: () => undefined } };

export const WithRowActions: Story = {
  args: {
    rowActions: (row) => (
      <Button label={`More actions for ${String(row.invoice)}`} variant="ghost" size="sm" iconOnly leadingIcon={<Icon name="ellipsis" />} />
    ),
  },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <Text size="sm" tone="muted">
        3 rows
      </Text>
    ),
  },
};

/** Sort button, select-all, a checkbox per row and an actions Button per row: every focus stop in reading order. */
export const Keyboard: Story = {
  args: {
    selectable: 'multiple',
    rowActions: (row) => <Button label={`Open ${String(row.invoice)}`} variant="ghost" size="sm" />,
  },
};
