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
    content: 'Bold',
    // The icon table has no `bold` glyph yet; `plus` stands in.
    children: <Button iconOnly label="Bold" leadingIcon={<Icon name="plus" />} />,
    describes: false,
  },
};

/** A clarification on a labelled control in dense UI. */
export const ColumnHeaderHint: Story = {
  args: {
    content: 'Includes archived items',
    children: <Button variant="ghost" size="sm" label="Items" />,
    describes: true,
  },
};

/** A toolbar where a sibling tooltip is already open, so the next one shows instantly. */
export const WarmToolbar: Story = {
  args: {
    content: 'Italic',
    children: <Button iconOnly variant="ghost" label="Italic" leadingIcon={<Icon name="minus" />} />,
    delay: 'none',
  },
  render: (args) => (
    <Toolbar label="Formatting">
      <Tooltip content="Bold" describes={false} delay="none">
        <Button iconOnly variant="ghost" label="Bold" leadingIcon={<Icon name="plus" />} />
      </Tooltip>
      <Tooltip {...args} describes={false} />
    </Toolbar>
  ),
};

/** A trigger at the top of the page, where the bubble reads better underneath. */
export const BelowTheTrigger: Story = {
  args: {
    content: 'Copy link',
    children: <Button iconOnly label="Copy link" leadingIcon={<Icon name="external" />} />,
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
      <Tooltip content="Remove item" describes={false}>
        <Button iconOnly variant="ghost" label="Remove item" leadingIcon={<Icon name="minus" />} />
      </Tooltip>
      <Tooltip content="Search" describes={false}>
        <Button iconOnly variant="ghost" label="Search" leadingIcon={<Icon name="search" />} />
      </Tooltip>
    </Stack>
  ),
};
