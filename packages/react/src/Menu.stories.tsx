import { useRef, useState, type ComponentProps, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Menu, type MenuItem, type MenuOpenChangeReason } from './Menu';

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

/**
 * Acts as the consumer for stories that need the menu open: owns `open`, starting from the `open`
 * arg, and writes onOpenChange back.
 */
function OpenMenu(args: ComponentProps<typeof Menu>): ReactElement {
  const [open, setOpen] = useState(args.open ?? true);
  return (
    <Menu
      {...args}
      open={open}
      onOpenChange={(next: boolean, reason: MenuOpenChangeReason) => {
        setOpen(next);
        args.onOpenChange?.(next, reason);
      }}
    />
  );
}

const meta: Meta<typeof Menu> = {
  title: 'Menu/React',
  component: Menu,
  args: {
    label: 'More actions',
    items: ITEMS,
  },
  argTypes: {
    onAction: { action: 'onAction' },
    onOpenChange: { action: 'onOpenChange' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* triggerVariant */
export const TriggerVariantGhost: Story = { args: { triggerVariant: 'ghost' } };
export const TriggerVariantSecondary: Story = { args: { triggerVariant: 'secondary' } };
export const TriggerVariantPrimary: Story = { args: { triggerVariant: 'primary' } };

/* triggerIcon */
export const TriggerIconEllipsis: Story = { args: { triggerIcon: 'ellipsis' } };
export const TriggerIconChevronDown: Story = { args: { triggerIcon: 'chevron-down' } };
export const TriggerIconNone: Story = { args: { triggerIcon: 'none' } };

/* placement — rendered open: a closed story would show nothing of the rule it illustrates. */
export const PlacementBottomStart: Story = {
  args: { placement: 'bottom-start', open: true },
  render: (args) => <OpenMenu {...args} />,
};
export const PlacementBottomEnd: Story = {
  args: { placement: 'bottom-end', open: true },
  render: (args) => <OpenMenu {...args} />,
};
export const PlacementTopStart: Story = {
  args: { placement: 'top-start', open: true },
  render: (args) => <OpenMenu {...args} />,
};
export const PlacementTopEnd: Story = {
  args: { placement: 'top-end', open: true },
  render: (args) => <OpenMenu {...args} />,
};

/* notable states */
export const IconOnly: Story = { args: { iconOnly: true, triggerIcon: 'ellipsis' } };

/** Open with its trigger and more than three enabled items, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => <OpenMenu {...args} />,
};

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
  render: (args) => {
    const anchor = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={anchor}
        style={{ display: 'inline-block', padding: '2rem', border: '1px dashed currentColor' }} // literal-ok: Storybook canvas decoration, not a component style
      >
        Anchor element
        <OpenMenu {...args} anchor={anchor} open />
      </div>
    );
  },
};
