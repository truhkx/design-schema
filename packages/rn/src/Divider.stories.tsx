import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from './Divider';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Divider> = {
  title: 'Divider/React Native',
  component: Divider,
  decorators: [withTheme({ fit: true })],
  args: {
    orientation: 'horizontal',
    semantic: false,
    spacing: 'none',
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {};

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', height: 48, gap: 12 }}>
      <Text>Left</Text>
      <Divider {...args} />
      <Text>Right</Text>
    </View>
  ),
};

// spacing
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

// notable states
export const Label: Story = { args: { label: 'or' } };
export const Semantic: Story = { args: { label: 'Earlier today', semantic: true } };
export const WithOverrides: Story = {
  args: {
    label: 'or',
    overrides: { color: 'color.status.info.border', thickness: 'border.width.focus' },
  },
};
