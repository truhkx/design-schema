import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { withTheme } from './decorators';

const meta: Meta<typeof Tooltip> = {
  title: 'Tooltip/React Native',
  component: Tooltip,
  decorators: [withTheme({ fit: true })],
  args: {
    content: 'Add item',
    children: <Button iconOnly label="Add item" leadingIcon={<Icon name="plus" />} />,
    placement: 'top',
    describes: false,
    delay: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

// placement
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

// delay
export const DelayDefault: Story = { args: { delay: 'default' } };
export const DelayNone: Story = { args: { delay: 'none' } };

// describes
export const DescribesClarification: Story = {
  args: {
    content: 'Includes archived items',
    describes: true,
    children: <Button label="Search" />,
  },
};

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.full', maxWidth: 'space.16' },
  },
};

/**
 * Three focusable triggers in a row, each with its own tooltip — the toolbar shape
 * the "warm" delay behavior is written for. Focus or long-press a trigger to open
 * its tooltip for the axe gate and manual keyboard checks on react-native-web; there
 * is no `open` prop on this component (there is nothing to control — visibility is
 * entirely hover/focus/long-press driven), so it cannot be rendered pre-opened here.
 */
export const Keyboard: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Tooltip content="Add item" describes={false}>
        <Button iconOnly label="Add item" leadingIcon={<Icon name="plus" />} variant="ghost" />
      </Tooltip>
      <Tooltip content="Remove item" describes={false}>
        <Button iconOnly label="Remove item" leadingIcon={<Icon name="minus" />} variant="ghost" />
      </Tooltip>
      <Tooltip content="Search" describes={false}>
        <Button iconOnly label="Search" leadingIcon={<Icon name="search" />} variant="ghost" />
      </Tooltip>
    </View>
  ),
};
