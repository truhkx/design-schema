import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
export const TriggerIconEllipsis: Story = { args: { triggerIcon: 'ellipsis' } };
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

/**
 * Renders the menu open through a wrapper that owns `open`, starting true, and writes
 * onOpenChange back, acting as the consumer.
 */
const renderOpen: NonNullable<Story['render']> =(args) => {
  function Open(): React.JSX.Element {
    const [open, setOpen] = React.useState(true);
    return <Menu {...args} open={open} onOpenChange={(next) => setOpen(next)} />;
  }
  return <Open />;
};

// placement — rendered open: a closed story shows nothing of the placement rule.
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' }, render: renderOpen };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' }, render: renderOpen };
export const PlacementTopStart: Story = { args: { placement: 'top-start' }, render: renderOpen };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' }, render: renderOpen };

// examples
/** The icon-only overflow button on a row, with the destructive action last after a separator. */
export const RowOverflow: Story = {
  args: {
    label: 'More actions',
    iconOnly: true,
    triggerIcon: 'ellipsis',
    items: [
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { separator: true },
      { id: 'delete', label: 'Delete file', tone: 'danger' },
    ],
  },
};

/** A labelled dropdown of view options, anchored under a secondary trigger. */
export const SortBy: Story = {
  args: {
    label: 'Sort by',
    triggerVariant: 'secondary',
    triggerIcon: 'chevron-down',
    items: [
      { id: 'name', label: 'Name' },
      { id: 'modified', label: 'Last modified' },
      { id: 'size', label: 'Size' },
    ],
  },
};

/** More than about six items, so they are grouped with labels; aligned to the end of the trigger. */
export const GroupedAccountMenu: Story = {
  args: {
    label: 'Account',
    placement: 'bottom-end',
    items: [
      {
        group: 'Account',
        items: [
          { id: 'profile', label: 'Profile' },
          { id: 'billing', label: 'Billing' },
        ],
      },
      {
        group: 'Workspace',
        items: [
          { id: 'members', label: 'Members' },
          { id: 'settings', label: 'Settings' },
        ],
      },
      { separator: true },
      { id: 'sign-out', label: 'Sign out' },
    ],
  },
};

/** Display-only shortcut hints beside the items the app binds elsewhere. */
export const WithShortcuts: Story = {
  args: {
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z' },
    ],
  },
};

// notable states
export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.lg', border: 'color.border.strong' },
  },
};

/**
 * Open with its trigger and several focusable items, for the axe gate and manual keyboard
 * checks. A wrapper owns `open`, starting true, and writes onOpenChange back.
 */
export const Keyboard: Story = { render: renderOpen };
