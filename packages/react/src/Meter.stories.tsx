import type { Meta, StoryObj } from '@storybook/react-vite';
import { Meter } from './Meter';

const meta: Meta<typeof Meter> = {
  title: 'Meter/React',
  component: Meter,
  tags: ['autodocs'],
  args: {
    label: 'Storage used',
    value: 32,
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning', value: 82 } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 95 } };

/* examples */
export const StorageQuota: Story = {
  args: { label: 'Storage used', value: 32, valueText: '3.2 GB of 10 GB' },
};
export const NearlyFull: Story = {
  args: { label: 'Storage used', value: 95, tone: 'danger', valueText: '9.5 GB of 10 GB' },
};
export const PasswordStrength: Story = {
  args: { label: 'Password strength', value: 3, min: 0, max: 4, valueText: 'Strong', tone: 'success' },
};
export const BarOnly: Story = { args: { label: 'Battery', value: 64, hideValue: true } };

/* notable states */
export const Empty: Story = { args: { value: 0 } };
export const Full: Story = { args: { value: 100 } };
export const AboveMaximum: Story = { args: { value: 150 } };
