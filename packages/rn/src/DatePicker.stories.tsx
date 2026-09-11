import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker } from './DatePicker';
import { withTheme } from './decorators';

const meta: Meta<typeof DatePicker> = {
  title: 'DatePicker/React Native',
  component: DatePicker,
  decorators: [withTheme()],
  args: {
    label: 'Start date',
    name: 'start-date',
    required: false,
    hideLabel: false,
    size: 'md',
    disabled: false,
    range: false,
    showWeekNumbers: false,
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const WithValue: Story = { args: { defaultValue: '2026-09-10' } };

export const Range: Story = {
  args: { label: 'Report period', name: 'report-period', range: true, defaultValue: { start: '2026-09-01', end: '2026-09-10' } },
};

export const ShowWeekNumbers: Story = { args: { defaultValue: '2026-09-10', showWeekNumbers: true } };

export const WithMinMax: Story = { args: { defaultValue: '2026-09-10', min: '2026-09-01', max: '2026-09-30' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: '2026-09-10' } };

export const WithError: Story = { args: { error: 'Date of birth is required.' } };

/**
 * At least three focusable elements with the calendar open, for the axe gate and
 * manual keyboard checks on react-native-web: the previous/next month buttons and the
 * month/year Selects (the day grid and Today/Clear buttons add more beyond that).
 */
export const Keyboard: Story = {
  args: { defaultValue: '2026-09-10', open: true },
};
