import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar, ToolbarGroup } from './Toolbar';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { Select } from './Select';

const meta: Meta<typeof Toolbar> = {
  title: 'Toolbar/React',
  component: Toolbar,
  args: {
    label: 'Formatting',
    children: (
      <>
        <ToolbarGroup label="Text style">
          <Button variant="ghost" label="Bold" overflowLabel="Bold" />
          <Button variant="ghost" label="Italic" overflowLabel="Italic" />
          <Button variant="ghost" label="Underline" overflowLabel="Underline" />
        </ToolbarGroup>
        <ToolbarGroup label="Alignment">
          <SegmentedControl
            label="Alignment"
            iconOnly
            options={[
              { value: 'left', label: 'Align left', icon: 'chevron-left' },
              { value: 'center', label: 'Align center', icon: 'dash' },
              { value: 'right', label: 'Align right', icon: 'chevron-right' },
            ]}
          />
        </ToolbarGroup>
        <ToolbarGroup label="Insert">
          <Button variant="ghost" label="Insert link" overflowLabel="Insert link" />
          <Button variant="ghost" label="Insert image" overflowLabel="Insert image" />
        </ToolbarGroup>
      </>
    ),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* overflow */
export const OverflowWrap: Story = { args: { overflow: 'wrap' } };
export const OverflowMenu: Story = { args: { overflow: 'menu' } };
export const OverflowScroll: Story = { args: { overflow: 'scroll' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* density */
export const DensityCompact: Story = { args: { density: 'compact' } };
export const DensityComfortable: Story = { args: { density: 'comfortable' } };

/** Present with more than three focusable controls and nothing else focusable, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    overflow: 'wrap',
    children: (
      <>
        <Button variant="ghost" label="Bold" overflowLabel="Bold" />
        <Button variant="ghost" label="Italic" overflowLabel="Italic" />
        <Button variant="ghost" label="Underline" overflowLabel="Underline" />
        <Button variant="ghost" label="Strikethrough" overflowLabel="Strikethrough" />
      </>
    ),
  },
};

/* examples */

/** The default row of ghost formatting buttons, named by what it controls. */
export const FormattingToolbar: Story = {
  args: {
    label: 'Formatting',
    children: (
      <>
        <Button variant="ghost" label="Bold" overflowLabel="Bold" />
        <Button variant="ghost" label="Italic" overflowLabel="Italic" />
        <Button variant="ghost" label="Underline" overflowLabel="Underline" />
      </>
    ),
  },
};

/** A tool palette beside a canvas, where arrows move up and down. */
export const VerticalToolPalette: Story = {
  args: {
    label: 'Drawing tools',
    children: (
      <>
        <Button variant="ghost" label="Select" overflowLabel="Select" />
        <Button variant="ghost" label="Draw" overflowLabel="Draw" />
        <Button variant="ghost" label="Erase" overflowLabel="Erase" />
      </>
    ),
    orientation: 'vertical',
  },
};

/** A dense table-action row at toolbar height that folds trailing buttons into a More menu. */
export const CompactActionsWithOverflow: Story = {
  args: {
    label: 'Table actions',
    children: (
      <>
        <Button variant="ghost" label="Filter" overflowLabel="Filter" />
        <Button variant="ghost" label="Sort" overflowLabel="Sort" />
        <Button variant="ghost" label="Export" overflowLabel="Export" />
        <Button variant="danger" label="Delete" overflowLabel="Delete" />
      </>
    ),
    overflow: 'menu',
    density: 'compact',
    size: 'sm',
  },
};

/** A filter row that scrolls horizontally with faded edges instead of collapsing. */
export const ScrollingFilterRow: Story = {
  args: {
    label: 'Filters',
    children: (
      <>
        <SegmentedControl
          label="Status"
          options={[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ]}
        />
        <Select
          label="Owner"
          name="owner"
          options={[
            { value: 'anyone', label: 'Anyone' },
            { value: 'me', label: 'Me' },
          ]}
        />
        <Select
          label="Priority"
          name="priority"
          options={[
            { value: 'any', label: 'Any' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
          ]}
        />
      </>
    ),
    overflow: 'scroll',
  },
};
