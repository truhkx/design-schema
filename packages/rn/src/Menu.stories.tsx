import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';
import type { MenuItem } from './Menu';
import { withTheme } from './decorators';

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

const meta: Meta<typeof Menu> = {
  title: 'Menu/React Native',
  component: Menu,
  decorators: [withTheme({ fit: true })],
  args: {
    label: 'More actions',
    items: ITEMS,
  },
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {};

// triggerVariant
export const TriggerVariantGhost: Story = { args: { triggerVariant: 'ghost' } };
export const TriggerVariantSecondary: Story = { args: { triggerVariant: 'secondary' } };
export const TriggerVariantPrimary: Story = { args: { triggerVariant: 'primary' } };

// triggerIcon
export const TriggerIconEllipsis: Story = { args: { triggerIcon: 'ellipsis', iconOnly: true } };
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

// placement
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };

// notable states
export const IconOnlyOverflow: Story = { args: { triggerIcon: 'ellipsis', iconOnly: true } };

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.full', border: 'color.border.strong' },
  },
};

/** Open with its trigger and several focusable items, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  args: { open: true },
};
