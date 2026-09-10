import type { Meta, StoryObj } from '@storybook/react';
import { Menu, type MenuItem } from './Menu';

const ITEMS: MenuItem[] = [
  { id: 'open', label: 'Open', icon: 'external' },
  { id: 'rename', label: 'Rename', shortcut: 'Ctrl+R' },
  { id: 'duplicate', label: 'Duplicate' },
  {
    group: 'Sort by',
    items: [
      { id: 'sort-name', label: 'Name' },
      { id: 'sort-date', label: 'Date modified' },
    ],
  },
  { separator: true },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete', tone: 'danger' },
];

const meta = {
  title: 'Menu/React',
  component: Menu,
  args: {
    label: 'More actions',
    items: ITEMS,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* triggerVariant */
export const TriggerVariantGhost: Story = { args: { triggerVariant: 'ghost' } };
export const TriggerVariantSecondary: Story = { args: { triggerVariant: 'secondary' } };
export const TriggerVariantPrimary: Story = { args: { triggerVariant: 'primary' } };

/* triggerIcon */
export const TriggerIconEllipsis: Story = {
  args: { triggerIcon: 'ellipsis', iconOnly: true, label: 'More actions' },
};
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };

/* notable states */
export const IconOnlyOverflow: Story = {
  args: { label: 'More actions', triggerIcon: 'ellipsis', iconOnly: true },
};

/** Open/present with its trigger and more than three focusable items, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
};
