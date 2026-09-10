import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Toolbar } from './Toolbar';
import type { ToolbarOrientation } from './Toolbar';
import { Button } from './Button';
import { Divider } from './Divider';
import { Switch } from './Switch';
import { withTheme } from './decorators';

function buildChildren(orientation: ToolbarOrientation): React.ReactNode {
  const dividerOrientation = orientation === 'vertical' ? 'horizontal' : 'vertical';
  return (
    <>
      <Button label="Bold" variant="ghost" iconOnly />
      <Button label="Italic" variant="ghost" iconOnly />
      <Button label="Underline" variant="ghost" iconOnly />
      <Divider orientation={dividerOrientation} />
      <Button label="Insert link" variant="secondary" />
      <Divider orientation={dividerOrientation} />
      <Switch label="Preview" checked={false} />
    </>
  );
}

const meta: Meta<typeof Toolbar> = {
  title: 'Toolbar/React Native',
  component: Toolbar,
  decorators: [withTheme()],
  args: {
    label: 'Formatting',
    orientation: 'horizontal',
    overflow: 'menu',
    size: 'md',
    density: 'comfortable',
  },
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: (args) => <Toolbar {...args}>{buildChildren(args.orientation ?? 'horizontal')}</Toolbar>,
};

// orientation
export const OrientationHorizontal: Story = { ...Default, args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { ...Default, args: { orientation: 'vertical' } };

// overflow
export const OverflowWrap: Story = { ...Default, args: { overflow: 'wrap' } };
export const OverflowMenu: Story = { ...Default, args: { overflow: 'menu' } };
export const OverflowScroll: Story = { ...Default, args: { overflow: 'scroll' } };

// size
export const SizeSm: Story = { ...Default, args: { size: 'sm' } };
export const SizeMd: Story = { ...Default, args: { size: 'md' } };

// density
export const DensityCompact: Story = { ...Default, args: { density: 'compact' } };
export const DensityComfortable: Story = { ...Default, args: { density: 'comfortable' } };

export const WithOverrides: Story = {
  ...Default,
  args: { overrides: { radius: 'radius.full', groupGap: 'layout.gap.loose' } },
};

/** At least three focusable controls, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = { ...Default };
