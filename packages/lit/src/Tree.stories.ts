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

const FOLDER_NODES: TreeNode[] = [
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
    showLabel: false,
    headingLevel: '2',
    nodes: FOLDER_NODES,
    selectable: 'single',
    selectChildren: false,
    selectOnFocus: false,
    showGuides: true,
    defaultExpanded: ['docs'],
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

/* headingLevel */
export const HeadingLevel2: Story = { args: { showLabel: true, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { showLabel: true, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { showLabel: true, headingLevel: '4' } };

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single', defaultSelected: ['invoices'] } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple', defaultSelected: ['invoices'] } };

export const SelectChildren: Story = {
  args: { selectable: 'multiple', selectChildren: true, defaultSelected: ['invoices'] },
};
export const SelectOnFocus: Story = { args: { selectOnFocus: true } };
export const HideGuides: Story = { args: { showGuides: false } };
export const DisabledNode: Story = {
  args: {
    nodes: [
      { id: 'docs', label: 'Documents', icon: 'folder', children: [{ id: 'invoices', label: 'Invoices', disabled: true }] },
      { id: 'media', label: 'Media', icon: 'folder' },
    ],
  },
};
export const Empty: Story = { args: { nodes: [] } };

/* examples */
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

/** Present with at least three focusable treeitems for the keyboard gate. */
export const Keyboard: Story = {
  args: { defaultExpanded: ['docs'] },
};
