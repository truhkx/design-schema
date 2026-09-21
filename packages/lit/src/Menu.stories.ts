import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ref } from 'lit/directives/ref.js';
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

/** A controlled story flips `open` from `open-change`, as a consuming parent would. */
function followOpenChange(event: Event): void {
  const menu = event.currentTarget as DsMenu;
  if (menu.open !== undefined) menu.open = (event as CustomEvent<MenuOpenChangeDetail>).detail.open;
}

/** Lit has no RefObject, so the anchored demo points the menu at the element that contains it. */
function anchorToParent(element?: Element): void {
  const menu = element as DsMenu | undefined;
  if (menu?.parentElement) menu.anchor = menu.parentElement;
}

const ANCHOR_STYLE = 'display: inline-block; padding: 2rem; border: 1px dashed currentColor'; // literal-ok: Storybook canvas decoration, not a component style

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
export const TriggerIconEllipsis: Story = { args: { triggerIcon: 'ellipsis' } };
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };

/* notable states */
export const IconOnly: Story = { args: { iconOnly: true, triggerIcon: 'ellipsis' } };

/** Open with its trigger and more than three enabled items, for the keyboard gate. */
export const Keyboard: Story = { args: { open: true } };

/* examples */
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

/** `anchor` positions the popup on an arbitrary element instead of rendering a trigger — a context menu. */
export const AnchorPositioned: Story = {
  args: { open: true },
  render: (args) => html`
    <div style=${ANCHOR_STYLE}>
      Anchor element
      <ds-menu
        ${ref(anchorToParent)}
        label=${args.label}
        .items=${args.items}
        placement=${args.placement}
        .open=${args.open}
        @open-change=${followOpenChange}
      ></ds-menu>
    </div>
  `,
};
