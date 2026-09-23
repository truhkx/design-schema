import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar, ToolbarGroup } from './Toolbar';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';
import { withTheme } from './decorators';

function formattingControls(): React.ReactNode {
  return (
    <>
      <ToolbarGroup label="Text style">
        <Button label="Bold" variant="ghost" overflowLabel="Bold" />
        <Button label="Italic" variant="ghost" overflowLabel="Italic" />
        <Button label="Underline" variant="ghost" overflowLabel="Underline" />
      </ToolbarGroup>
      <ToolbarGroup label="Insert">
        <Button label="Link" variant="ghost" overflowLabel="Link" />
        <Button label="Image" variant="ghost" overflowLabel="Image" />
        <Button label="Table" variant="ghost" overflowLabel="Table" />
      </ToolbarGroup>
    </>
  );
}

const meta: Meta<typeof Toolbar> = {
  title: 'Toolbar/React Native',
  component: Toolbar,
  decorators: [withTheme()],
  // `overflow` is left to the schema default (`menu`, rendered as `scroll` without a warning).
  args: {
    label: 'Formatting',
    orientation: 'horizontal',
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
      <Button label="Filter" variant="ghost" overflowLabel="Filter" />
      <Button label="Sort" variant="ghost" overflowLabel="Sort" />
      <Button label="Export" variant="ghost" overflowLabel="Export" />
      <Button label="Delete" variant="ghost" overflowLabel="Delete" />
    </Toolbar>
  ),
};

/** A filter row that scrolls horizontally with faded edges instead of collapsing. */
export const ScrollingFilterRow: Story = {
  args: { label: 'Filters', overflow: 'scroll' },
  render: (args) => (
    <Toolbar {...args}>
      <SegmentedControl
        label="View"
        defaultValue="list"
        options={[
          { value: 'list', label: 'List' },
          { value: 'board', label: 'Board' },
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
        label="Sort"
        hideLabel
        options={[
          { value: 'newest', label: 'Newest' },
          { value: 'oldest', label: 'Oldest' },
        ]}
      />
    </Toolbar>
  ),
};

export const WithOverrides: Story = {
  args: { overrides: { itemGap: 'layout.gap.tight', groupGap: 'layout.gap.loose' } },
};

/** The Default toolbar with `overflow: wrap` pinned, so every control stays rendered at a narrow gate viewport. */
export const Keyboard: Story = { args: { overflow: 'wrap' } };
