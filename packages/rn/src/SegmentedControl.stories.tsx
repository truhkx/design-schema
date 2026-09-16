import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';
import type { SegmentedControlOption } from './SegmentedControl';
import { withTheme } from './decorators';

const OPTIONS: SegmentedControlOption[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'board', label: 'Board' },
];

const meta: Meta<typeof SegmentedControl> = {
  title: 'SegmentedControl/React Native',
  component: SegmentedControl,
  decorators: [withTheme({ fit: true })],
  args: {
    label: 'View mode',
    options: OPTIONS,
  },
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const Fill: Story = { args: { fill: true } };

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    options: [
      { value: 'list', label: 'List view', icon: 'list' },
      { value: 'grid', label: 'Grid view', icon: 'grid' },
    ],
  },
};

export const DisabledSegment: Story = {
  args: {
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'board', label: 'Board', disabled: true },
    ],
  },
};

export const WithOverrides: Story = {
  args: { overrides: { segmentPaddingInline: 'space.lg', transition: 'motion.duration.base' } },
};

/** Three focusable segments, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {};

// examples
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
