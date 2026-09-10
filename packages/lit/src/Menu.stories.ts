import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Menu.js';
import type { MenuItem, MenuPlacement, MenuTriggerIcon, MenuTriggerVariant } from './Menu.js';

interface MenuArgs {
  label: string;
  items: MenuItem[];
  triggerVariant: MenuTriggerVariant;
  triggerIcon: MenuTriggerIcon;
  iconOnly: boolean;
  placement: MenuPlacement;
  open?: boolean;
}

const ITEMS: MenuItem[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive' },
  { separator: true },
  { id: 'delete', label: 'Delete', tone: 'danger' },
];

const GROUPED_ITEMS: MenuItem[] = [
  {
    group: 'View',
    items: [
      { id: 'sort-name', label: 'Sort by name' },
      { id: 'sort-date', label: 'Sort by date' },
    ],
  },
  {
    group: 'Actions',
    items: [
      { id: 'export', label: 'Export' },
      { id: 'archive', label: 'Archive' },
    ],
  },
  { separator: true },
  { id: 'delete', label: 'Delete', tone: 'danger' },
];

const ICON_SHORTCUT_ITEMS: MenuItem[] = [
  { id: 'search', label: 'Search', icon: 'search', shortcut: '⌘F' },
  { id: 'export', label: 'Export', icon: 'external', shortcut: '⌘E' },
  { separator: true },
  { id: 'delete', label: 'Delete', icon: 'close', shortcut: '⌘⌫', tone: 'danger' },
];

const DISABLED_ITEMS: MenuItem[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate', disabled: true },
  { id: 'archive', label: 'Archive' },
];

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
      ?open=${args.open}
    ></ds-menu>
  `,
};

export default meta;
type Story = StoryObj<MenuArgs>;

export const Default: Story = {};

/* triggerVariant */
export const TriggerVariantGhost: Story = { args: { triggerVariant: 'ghost', open: true } };
export const TriggerVariantSecondary: Story = { args: { triggerVariant: 'secondary', open: true } };
export const TriggerVariantPrimary: Story = { args: { triggerVariant: 'primary', open: true } };

/* triggerIcon */
export const TriggerIconEllipsis: Story = {
  args: { triggerIcon: 'ellipsis', iconOnly: true, label: 'More actions', open: true },
};
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down', open: true } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none', open: true } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start', open: true } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end', open: true } };
export const PlacementTopStart: Story = { args: { placement: 'top-start', open: true } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end', open: true } };

export const Grouped: Story = {
  args: { label: 'Sort by', items: GROUPED_ITEMS, open: true },
};

export const IconsAndShortcuts: Story = {
  args: { label: 'File actions', items: ICON_SHORTCUT_ITEMS, open: true },
};

export const DisabledItem: Story = {
  args: { items: DISABLED_ITEMS, open: true },
};

/**
 * Renders open with its trigger and at least three focusable children so the
 * keyboard gate can verify arrow navigation, Home/End, typeahead, Enter/Space,
 * Escape and Tab.
 */
export const Keyboard: Story = {
  args: { open: true, items: ITEMS },
};
