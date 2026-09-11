import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tree } from './Tree';
import type { TreeNode } from './Tree';
import { withTheme } from './decorators';

const nodes: TreeNode[] = [
  {
    id: 'documents',
    label: 'Documents',
    icon: 'calendar',
    children: [
      { id: 'proposal', label: 'Proposal.docx', badge: 'New' },
      {
        id: 'reports',
        label: 'Reports',
        icon: 'calendar',
        children: [
          { id: 'q1', label: 'Q1.pdf' },
          { id: 'q2', label: 'Q2.pdf' },
        ],
      },
      { id: 'archive', label: 'Archive', icon: 'calendar', children: 'lazy' },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: 'calendar',
    badge: '128',
    children: [
      { id: 'vacation', label: 'Vacation', icon: 'calendar' },
      { id: 'family', label: 'Family', icon: 'calendar', disabled: true },
    ],
  },
  { id: 'trash', label: 'Trash', icon: 'calendar' },
];

const meta: Meta<typeof Tree> = {
  title: 'Tree/React Native',
  component: Tree,
  decorators: [withTheme()],
  args: {
    label: 'Folders',
    showLabel: false,
    headingLevel: '2',
    nodes,
    defaultExpanded: ['documents'],
    selectable: 'single',
    selectChildren: false,
    selectOnFocus: false,
    showGuides: true,
  },
};

export default meta;

type Story = StoryObj<typeof Tree>;

export const Default: Story = {};

// selectable
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single' } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple' } };

// headingLevel
export const HeadingLevel2: Story = { args: { showLabel: true, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { showLabel: true, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { showLabel: true, headingLevel: '4' } };

// notable states
export const ShowLabel: Story = { args: { showLabel: true } };

export const HiddenGuides: Story = { args: { showGuides: false } };

export const SelectChildren: Story = {
  args: { selectable: 'multiple', selectChildren: true, defaultExpanded: ['documents', 'photos'] },
};

export const SelectOnFocus: Story = { args: { selectOnFocus: true } };

export const NavigationTree: Story = {
  args: {
    nodes: [
      { id: 'home', label: 'Home', href: '/home' },
      { id: 'docs', label: 'Docs', href: '/docs' },
      { id: 'settings', label: 'Settings', href: '/settings' },
    ],
    defaultExpanded: [],
  },
};

export const ExpandAll: Story = { args: { defaultExpanded: ['*'] } };

export const Empty: Story = { args: { nodes: [] } };

export const WithOverrides: Story = {
  args: {
    overrides: { indent: 'space.6', guideLine: 'color.border.strong', labelSelectedWeight: 'font.weight.bold' },
  },
};

/** Open with three focusable rows (two expand buttons, a leaf), for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    defaultExpanded: ['documents', 'reports'],
    selectable: 'single',
  },
};
