import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';
import { withTheme } from './decorators';

const meta: Meta<typeof Meter> = {
  title: 'Meter/React Native',
  component: Meter,
  decorators: [withTheme()],
  args: {
    label: 'Storage used',
    value: 32,
    min: 0,
    max: 100,
    valueText: '3.2 GB of 10 GB',
    tone: 'info',
    hideValue: false,
  },
};

export default meta;

type Story = StoryObj<typeof Meter>;

export const Default: Story = {};

// tone
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success', label: 'Password strength', value: 4, max: 4, valueText: 'Strong' } };
export const ToneWarning: Story = { args: { tone: 'warning', value: 82, valueText: '8.2 GB of 10 GB' } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 95, valueText: '9.5 GB of 10 GB' } };

/** Without `valueText` the percentage is shown and announced. */
export const Percentage: Story = { args: { valueText: undefined, value: 64 } };

export const HideValue: Story = { args: { hideValue: true } };

export const CustomRange: Story = { args: { label: 'Score', value: 7, min: 0, max: 10, valueText: '7 of 10', tone: 'success' } };

/** Values outside the range are clamped for both the bar and the accessible value. */
export const Overflow: Story = { args: { value: 140, valueText: undefined, tone: 'danger' } };

// examples

/** A quota whose value text is what a person would say aloud, not a percentage. */
export const StorageQuota: Story = { args: { label: 'Storage used', value: 32, valueText: '3.2 GB of 10 GB' } };

/** The consumer raises the tone from a threshold it owns and says why in the value text. */
export const NearlyFull: Story = { args: { label: 'Storage used', value: 95, tone: 'danger', valueText: '9.5 GB of 10 GB' } };

/** A word rather than a number, on a short scale of its own. */
export const PasswordStrength: Story = {
  args: { label: 'Password strength', value: 3, min: 0, max: 4, valueText: 'Strong', tone: 'success' },
};

/** A meter in a dense row, where the value text would repeat the copy beside it. */
export const BarOnly: Story = { args: { label: 'Battery', value: 64, hideValue: true } };
