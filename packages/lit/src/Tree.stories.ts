import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Tree.js';
import type { TreeHeadingLevel, TreeNode, TreeSelectable } from './Tree.js';

interface TreeArgs {
  label: string;
  showLabel: boolean;
  headingLevel: TreeHeadingLevel;
  nodes: TreeNode[];
  selectable: TreeSelectable;
  selectChildren: boolean;
  selectOnFocus: boolean;
  showGuides: boolean;
  expanded?: string[] | undefined;
  defaultExpanded?: string[] | undefined;
  selected?: string[] | undefined;
  defaultSelected?: string[] | undefined;
}

const NODES: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    icon: 'folder',
    badge: '3',
    children: [
      { id: 'invoices', label: 'Invoices', icon: 'file' },
      { id: 'contracts', label: 'Contracts', icon: 'file' },
      { id: 'archive', label: 'Archive', icon: 'file', disabled: true },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: 'folder',
    children: [
      { id: 'photos', label: 'Photos', icon: 'folder', children: [{ id: 'holiday', label: 'Holiday', icon: 'file' }] },
      { id: 'videos', label: 'Videos', icon: 'folder', children: 'lazy' },
    ],
  },
  { id: 'notes', label: 'Notes', icon: 'file' },
];

const meta: Meta<TreeArgs> = {
  title: 'Tree/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['selection-change', 'expand-change', 'expand', 'activate'] },
  },
  argTypes: {
    selectable: { control: 'select', options: ['none', 'single', 'multiple'] },
    headingLevel: { control: 'select', options: ['2', '3', '4'] },
  },
  args: {
    label: 'Folders',
    nodes: NODES,
    showLabel: false,
    headingLevel: '2',
    selectable: 'single',
    selectChildren: false,
    selectOnFocus: false,
    showGuides: true,
  },
  render: (args) => html`
    <ds-tree
      label=${args.label}
      ?show-label=${args.showLabel}
      heading-level=${args.headingLevel}
      .nodes=${args.nodes}
      selectable=${args.selectable}
      ?select-children=${args.selectChildren}
      ?select-on-focus=${args.selectOnFocus}
      ?hide-guides=${!args.showGuides}
      .expanded=${args.expanded}
      .defaultExpanded=${args.defaultExpanded}
      .selected=${args.selected}
      .defaultSelected=${args.defaultSelected}
    ></ds-tree>
  `,
};

export default meta;
type Story = StoryObj<TreeArgs>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none', defaultExpanded: ['docs'] } };
export const SelectableSingle: Story = {
  args: { selectable: 'single', defaultExpanded: ['docs'], defaultSelected: ['invoices'] },
};
export const SelectableMultiple: Story = {
  args: { selectable: 'multiple', defaultExpanded: ['docs'], defaultSelected: ['invoices', 'notes'] },
};

/* headingLevel — visible with showLabel */
export const HeadingLevel2: Story = { args: { showLabel: true, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { showLabel: true, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { showLabel: true, headingLevel: '4' } };

/* notable states */
export const SelectChildren: Story = {
  args: { selectable: 'multiple', selectChildren: true, defaultExpanded: ['*'], defaultSelected: ['invoices'] },
};
export const GuidesHidden: Story = { args: { showGuides: false, defaultExpanded: ['*'] } };
/**
 * A `children: "lazy"` branch. `videos` is listed in `defaultExpanded` but stays closed — a lazy id only opens
 * on a user act, which is what fires `expand`; open it to see the placeholder and the parent's `aria-busy`.
 */
export const LazyLoading: Story = { args: { defaultExpanded: ['media', 'videos'] } };
export const Empty: Story = { args: { nodes: [] } };

/** Keyboard gate: present with the first branch open — Documents, Invoices, Contracts, Media, Notes are focusable. */
export const Keyboard: Story = { args: { defaultExpanded: ['docs'] } };

/* examples */

/** The everyday file tree, one branch open, each node with its glyph. */
export const FolderTree: Story = {
  args: {
    label: 'Folders',
    defaultExpanded: ['docs'],
    nodes: [
      {
        id: 'docs',
        label: 'Documents',
        icon: 'folder',
        children: [
          { id: 'invoices', label: 'Invoices', icon: 'file' },
          { id: 'contracts', label: 'Contracts', icon: 'file' },
        ],
      },
      { id: 'media', label: 'Media', icon: 'folder', children: 'lazy' },
    ],
  },
};

/** A settings sidebar whose visible heading names it and whose selection drives the panel beside it. */
export const NavigationSidebar: Story = {
  args: {
    label: 'Settings sections',
    showLabel: true,
    headingLevel: '2',
    selectOnFocus: true,
    nodes: [
      { id: 'account', label: 'Account', href: '/settings/account' },
      { id: 'billing', label: 'Billing', href: '/settings/billing' },
    ],
  },
};

/** Multi-select categories where choosing a parent chooses everything under it. */
export const CategoryPickerWithCascade: Story = {
  args: {
    label: 'Categories',
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    nodes: [
      {
        id: 'clothing',
        label: 'Clothing',
        children: [
          { id: 'shirts', label: 'Shirts' },
          { id: 'shoes', label: 'Shoes' },
        ],
      },
    ],
  },
};

/** A tree that only expands and collapses, with counts after each branch. */
export const ReadOnlySiteMap: Story = {
  args: {
    label: 'Site map',
    selectable: 'none',
    nodes: [
      { id: 'guides', label: 'Guides', badge: '12', children: [{ id: 'start', label: 'Getting started' }] },
      { id: 'api', label: 'API', badge: '48', children: 'lazy' },
    ],
  },
};
