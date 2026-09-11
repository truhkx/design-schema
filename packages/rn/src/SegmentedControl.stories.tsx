import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl } from './SegmentedControl';
import type { SegmentedControlOption } from './SegmentedControl';
import { withTheme } from './decorators';

const OPTIONS: SegmentedControlOption[] = [
  { value: 'list', label: 'List', icon: 'external' },
  { value: 'grid', label: 'Grid', icon: 'check' },
  { value: 'map', label: 'Map', icon: 'info', disabled: true },
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

// fill
export const Fill: Story = { args: { fill: true } };

// iconOnly
export const IconOnly: Story = {
  args: {
    iconOnly: true,
    options: OPTIONS.map((option) => ({ ...option, icon: option.icon ?? 'info' })),
  },
};

// notable states
export const WithOverrides: Story = {
  args: { overrides: { groupRadius: 'radius.full', segmentRadius: 'radius.full' } },
};

/** At least three focusable segments, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {};
