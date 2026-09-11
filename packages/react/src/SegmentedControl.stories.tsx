import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl';

const OPTIONS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month', disabled: true },
];

/* No dedicated list/grid glyphs exist yet; dash/ellipsis stand in for the doc's list/grid example. */
const ICON_OPTIONS: SegmentedControlOption[] = [
  { value: 'list', label: 'List view', icon: 'dash' },
  { value: 'grid', label: 'Grid view', icon: 'ellipsis' },
];

const meta: Meta<typeof SegmentedControl> = {
  title: 'SegmentedControl/React',
  component: SegmentedControl,
  args: {
    label: 'View range',
    options: OPTIONS,
    iconOnly: false,
    size: 'md',
    fill: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* notable states */
export const Fill: Story = { args: { fill: true } };
export const IconOnly: Story = { args: { label: 'View mode', options: ICON_OPTIONS, iconOnly: true } };
export const Controlled: Story = { args: { value: 'week' } };

/** Present with its trigger-less radiogroup and three segments (two enabled), for the keyboard gate. */
export const Keyboard: Story = {};
