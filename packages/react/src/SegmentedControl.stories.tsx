import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl, type SegmentedControlOption } from './SegmentedControl';

const OPTIONS: SegmentedControlOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const meta: Meta<typeof SegmentedControl> = {
  title: 'SegmentedControl/React',
  component: SegmentedControl,
  args: {
    label: 'Range',
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
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    options: [
      { value: 'list', label: 'List view', icon: 'list' },
      { value: 'grid', label: 'Grid view', icon: 'grid' },
      { value: 'files', label: 'File view', icon: 'file', disabled: true },
    ],
  },
};
export const Controlled: Story = { args: { value: 'week' } };
export const DisabledSegment: Story = {
  args: { options: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week', disabled: true }, { value: 'month', label: 'Month' }] },
};

/* examples */
export const ViewMode: Story = {
  args: {
    label: 'View mode',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
    ],
    defaultValue: 'list',
  },
};

export const IconOnlyToolbar: Story = {
  args: {
    label: 'View mode',
    options: [
      { value: 'list', label: 'List view', icon: 'list' },
      { value: 'grid', label: 'Grid view', icon: 'grid' },
    ],
    iconOnly: true,
    size: 'sm',
  },
};

export const FilledRangeSwitch: Story = {
  args: {
    label: 'Range',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ],
    defaultValue: 'week',
    fill: true,
  },
};

/** Present with three enabled segments and no decorators, for the keyboard gate. */
export const Keyboard: Story = {};
