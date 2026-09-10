import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Splitter } from './Splitter';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Splitter> = {
  title: 'Splitter/React Native',
  component: Splitter,
  decorators: [withTheme()],
  args: {
    label: 'Sidebar width',
    orientation: 'horizontal',
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    stackBelow: 'prose',
    primary: (
      <View style={{ height: 240 }}>
        <Text>Navigation</Text>
      </View>
    ),
    secondary: (
      <View style={{ height: 240 }}>
        <Text>Content</Text>
      </View>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof Splitter>;

export const Default: Story = {};

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: {
    orientation: 'vertical',
    label: 'Preview height',
    primary: (
      <View style={{ height: 120 }}>
        <Text>Editor</Text>
      </View>
    ),
    secondary: (
      <View style={{ height: 120 }}>
        <Text>Preview</Text>
      </View>
    ),
  },
};

// stackBelow
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

export const Collapsible: Story = { args: { collapsible: true } };

export const Collapsed: Story = { args: { collapsible: true, collapsed: true } };

export const WithPersistKey: Story = { args: { persistKey: 'demo-sidebar' } };

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  args: {
    collapsible: true,
    primary: (
      <View style={{ height: 240 }}>
        <Button label="First action" variant="secondary" />
      </View>
    ),
    secondary: (
      <View style={{ height: 240 }}>
        <Button label="Second action" variant="secondary" />
      </View>
    ),
  },
};
