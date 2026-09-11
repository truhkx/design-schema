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
  defaultExpanded?: string[] | undefined;
  defaultSelected?: string[] | undefined;
}

const FOLDER_NODES: TreeNode[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: 'external',
    children: [
      { id: 'resume', label: 'Resume.pdf', badge: '2' },
      { id: 'taxes', label: 'Taxes', children: [{ id: 'taxes-2025', label: '2025.pdf' }] },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    children: [
      { id: 'vacation', label: 'Vacation', badge: '48' },
      { id: 'family', label: 'Family', disabled: true },
    ],
  },
  { id: 'downloads', label: 'Downloads', badge: '3' },
];

const NAVIGATION_NODES: TreeNode[] = [
  {
    id: 'guides',
    label: 'Guides',
    children: [
      { id: 'getting-started', label: 'Getting started', href: '#getting-started' },
      { id: 'installation', label: 'Installation', href: '#installation' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    children: [
      { id: 'button', label: 'Button', href: '#button' },
      { id: 'tree', label: 'Tree', href: '#tree' },
    ],
  },
];

const LAZY_NODES: TreeNode[] = [
  { id: 'root', label: 'Project', children: 'lazy' },
  { id: 'sibling', label: 'Other project', children: [{ id: 'sibling-child', label: 'README.md' }] },
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
    defaultExpanded: ['documents'],
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
      .defaultExpanded=${args.defaultExpanded}
      .defaultSelected=${args.defaultSelected}
    ></ds-tree>
  `,
};

export default meta;
type Story = StoryObj<TreeArgs>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single', defaultSelected: ['resume'] } };
export const SelectableMultiple: Story = {
  args: { selectable: 'multiple', selectChildren: true, defaultSelected: ['resume'] },
};

export const ShowLabel: Story = { args: { showLabel: true } };

/* headingLevel */
export const HeadingLevel2: Story = { args: { showLabel: true, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { showLabel: true, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { showLabel: true, headingLevel: '4' } };

export const NoGuides: Story = { args: { showGuides: false } };

export const SelectOnFocus: Story = {
  args: { selectOnFocus: true, defaultSelected: ['resume'] },
};

export const NavigationTree: Story = {
  args: { label: 'Site sections', nodes: NAVIGATION_NODES, defaultExpanded: ['guides', 'components'] },
};

export const LazyLoading: Story = {
  args: { label: 'Projects', nodes: LAZY_NODES },
};

export const DisabledNode: Story = {
  args: { defaultExpanded: ['photos'] },
};

export const Empty: Story = { args: { nodes: [] } };

/**
 * Renders open with at least three focusable nodes so the keyboard gate can
 * verify arrow navigation, Home/End, type-ahead, expand/collapse, Enter/Space
 * and Tab.
 */
export const Keyboard: Story = {
  args: { nodes: FOLDER_NODES, defaultExpanded: ['documents', 'photos'] },
};
