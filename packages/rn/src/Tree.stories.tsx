import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tree } from './Tree';
import type { TreeNode } from './Tree';
import { withTheme } from './decorators';

const nodes: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    icon: 'folder',
    children: [
      { id: 'invoices', label: 'Invoices', icon: 'file' },
      { id: 'contracts', label: 'Contracts', icon: 'file', badge: '3' },
      { id: 'archive', label: 'Archive', icon: 'folder', disabled: true },
    ],
  },
  { id: 'media', label: 'Media', icon: 'folder', children: 'lazy' },
  { id: 'notes', label: 'Notes', icon: 'file' },
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
    selectable: 'single',
    selectChildren: false,
    selectOnFocus: false,
    showGuides: true,
  },
  argTypes: {
    headingLevel: { control: 'inline-radio', options: ['2', '3', '4'] },
    selectable: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
  },
};

export default meta;

type Story = StoryObj<typeof Tree>;

export const Default: Story = {};

// headingLevel
export const HeadingLevel2: Story = { args: { showLabel: true, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { showLabel: true, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { showLabel: true, headingLevel: '4' } };

// selectable
export const SelectableNone: Story = { args: { selectable: 'none' } };
export const SelectableSingle: Story = { args: { selectable: 'single', defaultExpanded: ['docs'], defaultSelected: ['invoices'] } };
export const SelectableMultiple: Story = { args: { selectable: 'multiple', defaultExpanded: ['docs'] } };

// notable states
export const HiddenGuides: Story = { args: { showGuides: false, defaultExpanded: ['docs'] } };
/** A lazy node the caller lists stays closed until the user opens it: press Media's chevron to fire `onExpand` and reveal the `Loading` placeholder. */
export const LazyLoading: Story = { args: { defaultExpanded: ['media'] } };
export const Empty: Story = { args: { nodes: [] } };

// examples
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

/** Open, with the expand buttons and rows as focusable children, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: { showLabel: true, defaultExpanded: ['docs'], selectable: 'single' },
};
