import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toolbar, ToolbarGroup } from './Toolbar';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import { Icon } from './Icon';

const meta: Meta<typeof Toolbar> = {
  title: 'Toolbar/React',
  component: Toolbar,
  args: {
    label: 'Formatting',
    children: (
      <>
        <ToolbarGroup label="Text style">
          <Button variant="ghost" iconOnly label="Bold" leadingIcon={<Icon name="check" inline />} />
          <Button variant="ghost" iconOnly label="Italic" leadingIcon={<Icon name="check" inline />} />
        </ToolbarGroup>
        <ToolbarGroup label="Alignment">
          <SegmentedControl
            label="Alignment"
            size="sm"
            iconOnly
            options={[
              { value: 'left', label: 'Left', icon: 'chevron-left' },
              { value: 'center', label: 'Center', icon: 'dash' },
              { value: 'right', label: 'Right', icon: 'chevron-right' },
            ]}
          />
        </ToolbarGroup>
        <Button variant="ghost" label="Insert link" />
        <Button variant="ghost" label="Insert image" />
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

/** Open/present with its trigger (none — Toolbar has no overlay) and more than three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    overflow: 'wrap',
    children: (
      <>
        <Button variant="ghost" label="Bold" />
        <Button variant="ghost" label="Italic" />
        <Button variant="ghost" label="Underline" />
        <Button variant="ghost" label="Strikethrough" />
      </>
    ),
  },
};
