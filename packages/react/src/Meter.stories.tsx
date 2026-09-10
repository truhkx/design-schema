import type { Meta, StoryObj } from '@storybook/react';
import { Meter } from './Meter';

const meta = {
  title: 'Meter/React',
  component: Meter,
  args: {
    label: 'Storage used',
    value: 32,
    min: 0,
    max: 100,
    valueText: '3.2 GB of 10 GB',
    tone: 'info',
    hideValue: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = {
  args: { tone: 'success', label: 'Password strength', value: 4, max: 4, valueText: 'Strong' },
};
export const ToneWarning: Story = { args: { tone: 'warning', value: 82, valueText: '8.2 GB of 10 GB' } };
export const ToneDanger: Story = { args: { tone: 'danger', value: 95, valueText: '9.5 GB of 10 GB' } };

/* other props */
export const PercentValue: Story = { args: { valueText: undefined, value: 64 } };
export const HiddenValue: Story = { args: { hideValue: true } };
export const CustomRange: Story = {
  args: { label: 'Score', value: 7, min: 0, max: 10, valueText: '7 of 10' },
};
export const Empty: Story = { args: { value: 0, valueText: '0 GB of 10 GB' } };
export const Full: Story = { args: { value: 100, valueText: '10 GB of 10 GB', tone: 'danger' } };
