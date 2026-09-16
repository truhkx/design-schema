import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Menu.js';
import type { DsMenu, MenuItem, MenuOpenChangeDetail, MenuPlacement, MenuTriggerIcon, MenuTriggerVariant } from './Menu.js';

interface MenuArgs {
  label: string;
  items: MenuItem[];
  triggerVariant: MenuTriggerVariant;
  triggerIcon: MenuTriggerIcon;
  iconOnly: boolean;
  placement: MenuPlacement;
  open?: boolean | undefined;
}

const ITEMS: MenuItem[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive' },
  { separator: true },
  { id: 'delete', label: 'Delete', tone: 'danger' },
];

/** A controlled story flips `open` from `open-change`, as a consuming parent would. */
function followOpenChange(event: Event): void {
  const menu = event.currentTarget as DsMenu;
  if (menu.open !== undefined) menu.open = (event as CustomEvent<MenuOpenChangeDetail>).detail.open;
}

const meta: Meta<MenuArgs> = {
  title: 'Menu/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['action', 'open-change'] },
  },
  argTypes: {
    triggerVariant: { control: 'select', options: ['ghost', 'secondary', 'primary'] },
    triggerIcon: { control: 'select', options: ['ellipsis', 'chevron-down', 'none'] },
    placement: { control: 'select', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
  },
  args: {
    label: 'More actions',
    items: ITEMS,
    triggerVariant: 'ghost',
    triggerIcon: 'chevron-down',
    iconOnly: false,
    placement: 'bottom-start',
  },
  render: (args) => html`
    <ds-menu
      label=${args.label}
      .items=${args.items}
      trigger-variant=${args.triggerVariant}
      trigger-icon=${args.triggerIcon}
      ?icon-only=${args.iconOnly}
      placement=${args.placement}
      .open=${args.open}
      @open-change=${followOpenChange}
    ></ds-menu>
  `,
};

export default meta;
type Story = StoryObj<MenuArgs>;

export const Default: Story = {};

/* triggerVariant */
export const TriggerVariantGhost: Story = { args: { triggerVariant: 'ghost' } };
export const TriggerVariantSecondary: Story = { args: { triggerVariant: 'secondary' } };
export const TriggerVariantPrimary: Story = { args: { triggerVariant: 'primary' } };

/* triggerIcon */
export const TriggerIconEllipsis: Story = { args: { triggerIcon: 'ellipsis', iconOnly: true } };
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start', open: true } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end', open: true } };
export const PlacementTopStart: Story = { args: { placement: 'top-start', open: true } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end', open: true } };

/* notable states */
export const DisabledItem: Story = {
  args: {
    open: true,
    items: [
      { id: 'rename', label: 'Rename', disabled: true },
      { id: 'duplicate', label: 'Duplicate' },
    ],
  },
};

/* examples */
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

export const WithShortcuts: Story = {
  args: {
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z' },
    ],
  },
};

/** Open with its trigger and more than three focusable items, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true, items: ITEMS },
};
