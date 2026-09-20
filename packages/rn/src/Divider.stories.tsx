import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';
import { Stack } from './Stack';
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

/** A vertical divider needs a row with a height to stretch to. */
const renderInRow: Story['render'] = (args) => (
  <Stack direction="horizontal" gap="tight" align="stretch">
    <Text>Bold Italic</Text>
    <Divider {...args} />
    <Text>Align left</Text>
  </Stack>
);

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' }, render: renderInRow };

// spacing
export const SpacingNone: Story = { args: { spacing: 'none' } };
export const SpacingTight: Story = { args: { spacing: 'tight' } };
export const SpacingNormal: Story = { args: { spacing: 'normal' } };
export const SpacingLoose: Story = { args: { spacing: 'loose' } };

// examples
export const OrBetweenAlternatives: Story = { args: { label: 'or', spacing: 'normal' } };
export const ListFurniture: Story = { args: { orientation: 'horizontal' } };
export const ToolbarGroups: Story = { args: { orientation: 'vertical' }, render: renderInRow };
export const SectionBoundary: Story = {
  args: { semantic: true, spacing: 'loose' },
  render: (args) => (
    <Stack gap="none">
      <Text>Today</Text>
      <Divider {...args} />
      <Text>Earlier</Text>
    </Stack>
  ),
};

// notable states
export const Label: Story = { args: { label: 'Earlier today' } };
export const SemanticLabelled: Story = { args: { semantic: true, label: 'or' } };
export const WithOverrides: Story = {
  args: {
    label: 'or',
    overrides: { color: 'color.status.info.border', thickness: 'border.width.focus' },
  },
};
