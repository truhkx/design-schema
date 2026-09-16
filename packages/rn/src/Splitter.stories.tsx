import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Splitter } from './Splitter';
import { withTheme } from './decorators';

const meta: Meta<typeof Splitter> = {
  title: 'Splitter/React Native',
  component: Splitter,
  decorators: [
    withTheme(),
    (Story) => (
      <View style={{ height: 320 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    label: 'Sidebar width',
    orientation: 'horizontal',
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    stackBelow: 'prose',
    primary: 'Navigation',
    secondary: 'Content',
  },
};

export default meta;

type Story = StoryObj<typeof Splitter>;

export const Default: Story = {};

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical', label: 'Preview height' } };

// stackBelow
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

export const Collapsible: Story = { args: { collapsible: true } };
export const Collapsed: Story = { args: { collapsible: true, defaultCollapsed: true } };

// examples
export const SidebarAndContent: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar',
  },
};
export const CollapsibleNavigation: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    collapsible: true,
    minSize: 15,
  },
};
export const EditorOverPreview: Story = {
  args: {
    label: 'Editor height',
    primary: 'The editor',
    secondary: 'The preview',
    orientation: 'vertical',
    defaultSize: 60,
  },
};
export const NeverStackingWorkbench: Story = {
  args: {
    label: 'List width',
    primary: 'The result list',
    secondary: 'The detail view',
    stackBelow: 'never',
    step: 5,
  },
};

/** Both panes with focusable content around the separator and collapse Button, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  args: {
    collapsible: true,
    stackBelow: 'never',
    primary: <Button label="First action" variant="secondary" />,
    secondary: <Button label="Second action" variant="secondary" />,
  },
};
