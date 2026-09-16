import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar } from './Toolbar';
import { Button } from './Button';
import { Divider } from './Divider';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
import { Switch } from './Switch';
import { withTheme } from './decorators';

function formattingControls(): React.ReactNode {
  return (
    <>
      <Button label="Bold" variant="ghost" />
      <Button label="Italic" variant="ghost" />
      <Button label="Underline" variant="ghost" />
      <Divider />
      <Button label="Insert link" variant="ghost" />
      <Divider />
      <Switch label="Preview" defaultChecked={false} />
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
  render: (args) => <Toolbar {...args}>{formattingControls()}</Toolbar>,
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {};

// orientation
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

// overflow
export const OverflowWrap: Story = { args: { overflow: 'wrap' } };
export const OverflowMenu: Story = { args: { overflow: 'menu' } };
export const OverflowScroll: Story = { args: { overflow: 'scroll' } };

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// density
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

// examples

/** The default row of ghost formatting buttons, named by what it controls. */
export const FormattingToolbar: Story = {
  args: { label: 'Formatting' },
  render: (args) => (
    <Toolbar {...args}>
      <Button label="Bold" variant="ghost" />
      <Button label="Italic" variant="ghost" />
      <Button label="Underline" variant="ghost" />
    </Toolbar>
  ),
};

/** A tool palette beside a canvas, where arrows move up and down. */
export const VerticalToolPalette: Story = {
  args: { label: 'Drawing tools', orientation: 'vertical' },
  render: (args) => (
    <Toolbar {...args}>
      <Button label="Select" variant="ghost" />
      <Button label="Draw" variant="ghost" />
      <Button label="Erase" variant="ghost" />
    </Toolbar>
  ),
};

/** A dense table-action row at toolbar height that folds trailing buttons into a More menu (scrolls on React Native). */
export const CompactActionsWithOverflow: Story = {
  args: { label: 'Table actions', overflow: 'menu', density: 'compact', size: 'sm' },
  render: (args) => (
    <Toolbar {...args}>
      <Button label="Filter" variant="ghost" />
      <Button label="Sort" variant="ghost" />
      <Button label="Export" variant="ghost" />
      <Button label="Delete" variant="danger" />
    </Toolbar>
  ),
};

/** A filter row that scrolls horizontally with faded edges instead of collapsing. */
export const ScrollingFilterRow: Story = {
  args: { label: 'Filters', overflow: 'scroll' },
  render: (args) => (
    <Toolbar {...args}>
      <SegmentedControl
        label="Status"
        defaultValue="open"
        options={[
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
          { value: 'all', label: 'All' },
        ]}
      />
      <Select
        name="owner"
        label="Owner"
        hideLabel
        options={[
          { value: 'anyone', label: 'Anyone' },
          { value: 'me', label: 'Me' },
        ]}
      />
      <Select
        name="sort"
        label="Sort by"
        hideLabel
        options={[
          { value: 'updated', label: 'Recently updated' },
          { value: 'created', label: 'Newest' },
        ]}
      />
    </Toolbar>
  ),
};

export const WithOverrides: Story = {
  args: { overrides: { itemGap: 'layout.gap.tight', groupGap: 'layout.gap.loose' } },
};

/** At least three focusable controls, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {};
