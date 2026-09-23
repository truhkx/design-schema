import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { Toolbar } from './Toolbar';
import { Tooltip } from './Tooltip';
import { withTheme } from './decorators';

const meta: Meta<typeof Tooltip> = {
  title: 'Tooltip/React Native',
  component: Tooltip,
  decorators: [withTheme({ fit: true })],
  args: {
    content: 'Includes archived items',
    children: <Button variant="secondary" label="Items" />,
    placement: 'top',
    describes: true,
    delay: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

// placement — rendered open, since a hover-driven bubble is otherwise invisible and the four would look identical
export const PlacementTop: Story = { args: { placement: 'top', open: true } };
export const PlacementBottom: Story = { args: { placement: 'bottom', open: true } };
export const PlacementStart: Story = { args: { placement: 'start', open: true } };
export const PlacementEnd: Story = { args: { placement: 'end', open: true } };

// delay
export const DelayDefault: Story = { args: { delay: 'default' } };
export const DelayNone: Story = { args: { delay: 'none' } };

// states
export const Open: Story = { args: { open: true } };

export const WithOverrides: Story = {
  args: {
    open: true,
    overrides: { radius: 'radius.md', maxWidth: 'space.20' },
  },
};

// examples

/** The tooltip is the control's name, not a second announcement, so it is linked as the label. */
export const IconOnlyButtonName: Story = {
  args: {
    content: 'Add item',
    children: <Button iconOnly label="Add item" leadingIcon={<Icon name="plus" />} />,
    describes: false,
  },
};

/** A clarification on a labelled control in dense UI. */
export const ColumnHeaderHint: Story = {
  args: {
    content: 'Includes archived items',
    children: <Button variant="ghost" size="sm" label="Items" />,
  },
};

/** A toolbar where a sibling tooltip is already open, so the next one shows instantly. */
export const WarmToolbar: Story = {
  args: {
    content: 'Grid view',
    children: <Button iconOnly variant="ghost" label="Grid view" leadingIcon={<Icon name="grid" />} />,
    delay: 'none',
  },
  render: (args) => (
    <Toolbar label="View">
      <Tooltip {...args} />
    </Toolbar>
  ),
};

/** A trigger at the top of the page, where the bubble reads better underneath. */
export const BelowTheTrigger: Story = {
  args: {
    content: 'Open in new tab',
    children: <Button iconOnly label="Open in new tab" leadingIcon={<Icon name="external" />} />,
    placement: 'bottom',
  },
};

/**
 * Rendered open (the `open` prop) on the first of three focusable triggers, for the axe
 * gate and manual keyboard checks on react-native-web: Escape hides it without moving
 * focus; focusing any trigger shows its own tooltip.
 */
export const Keyboard: Story = {
  render: () => (
    <Stack direction="horizontal" gap="tight">
      <Tooltip content="Add item" describes={false} open>
        <Button iconOnly variant="ghost" label="Add item" leadingIcon={<Icon name="plus" />} />
      </Tooltip>
      <Tooltip content="Grid view" describes={false}>
        <Button iconOnly variant="ghost" label="Grid view" leadingIcon={<Icon name="grid" />} />
      </Tooltip>
      <Tooltip content="Open in new tab" describes={false}>
        <Button iconOnly variant="ghost" label="Open in new tab" leadingIcon={<Icon name="external" />} />
      </Tooltip>
    </Stack>
  ),
};
