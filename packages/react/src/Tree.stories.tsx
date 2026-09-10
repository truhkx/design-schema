import type { Meta, StoryObj } from '@storybook/react';
import { Tree, type TreeNode } from './Tree';

const NODES: TreeNode[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    badge: '12',
    children: [
      { id: 'inbox-updates', label: 'Updates' },
      { id: 'inbox-forums', label: 'Forums' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    children: [
      { id: 'projects-design-schema', label: 'Design Schema' },
      { id: 'projects-archive', label: 'Archive', disabled: true },
    ],
  },
  { id: 'starred', label: 'Starred', badge: '3' },
  { id: 'docs', label: 'Documentation', href: '/docs' },
];

const LAZY_NODES: TreeNode[] = [
  { id: 'shared', label: 'Shared with me', children: 'lazy' },
  { id: 'recent', label: 'Recent', children: 'lazy' },
];

const meta = {
  title: 'Tree/React',
  component: Tree,
  args: {
    label: 'Folders',
    nodes: NODES,
    defaultExpanded: ['inbox'],
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* selectable */
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single', defaultSelected: ['starred'] } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple', defaultSelected: ['starred', 'inbox-updates'] } };

/* notable states */
export const ShowLabel: Story = { args: { showLabel: true } };

export const GuidesHidden: Story = { args: { showGuides: false } };

export const SelectChildren: Story = {
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['inbox', 'projects'],
    defaultSelected: ['inbox-updates'],
  },
};

export const SelectOnFocus: Story = { args: { selectable: 'single', selectOnFocus: true } };

export const DefaultExpandAll: Story = { args: { defaultExpanded: ['*'] } };

export const Collapsed: Story = { args: { defaultExpanded: [] } };

export const Empty: Story = { args: { nodes: [] } };

/**
 * `children: "lazy"` nodes show the expand control and a loading placeholder until the caller
 * supplies real children through `onExpand`.
 */
export const LazyChildren: Story = {
  args: {
    nodes: LAZY_NODES,
    defaultExpanded: ['shared'],
    onExpand: () => undefined,
  },
};

/**
 * Open/present with at least three focusable children, for the keyboard gate: Inbox and its two
 * children (expanded by default), plus Projects, Starred and Documentation.
 */
export const Keyboard: Story = {
  args: {
    selectable: 'multiple',
    defaultExpanded: ['inbox', 'projects'],
  },
};
