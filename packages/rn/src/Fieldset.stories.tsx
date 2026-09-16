import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';
import { Fieldset } from './Fieldset';
import { Input } from './Input';
import { withTheme } from './decorators';

const meta: Meta<typeof Fieldset> = {
  title: 'Fieldset/React Native',
  component: Fieldset,
  decorators: [withTheme()],
  args: {
    legend: 'Shipping address',
    gap: 'normal',
    disabled: false,
    description: undefined,
    error: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof Fieldset>;

export const Default: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

// gap
export const GapTight: Story = { ...Default, args: { gap: 'tight' } };
export const GapNormal: Story = { ...Default, args: { gap: 'normal' } };
export const GapLoose: Story = { ...Default, args: { gap: 'loose' } };

export const WithDescription: Story = { ...Default, args: { description: 'We only ship within the EU.' } };

export const WithError: Story = { ...Default, args: { error: 'End date must be after start date.' } };

export const Required: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" required />
      <Input label="City" name="city" required />
    </Fieldset>
  ),
};

export const Disabled: Story = { ...Default, args: { disabled: true } };

// examples
export const ShippingAddress: Story = {
  args: { legend: 'Shipping address' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

export const NotificationPreferences: Story = {
  args: { legend: 'Notification preferences', description: 'You can change these at any time.', gap: 'tight' },
  render: (args) => (
    <Fieldset {...args}>
      <Checkbox label="Email" name="email" />
      <Checkbox label="SMS" name="sms" />
      <Checkbox label="Push" name="push" />
    </Fieldset>
  ),
};

export const DateRangeWithAGroupError: Story = {
  args: { legend: 'Reporting period', error: 'End date must be after start date.' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Start date" name="start" />
      <Input label="End date" name="end" />
    </Fieldset>
  ),
};

export const DisabledGroup: Story = {
  args: { legend: 'Billing address', disabled: true },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};
