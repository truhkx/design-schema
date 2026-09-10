import type { Meta, StoryObj } from '@storybook/react';
import { Fieldset } from './Fieldset';
import { Input } from './Input';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Fieldset/React',
  component: Fieldset,
  args: {
    legend: 'Shipping address',
    gap: 'normal',
    disabled: false,
  },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

/* gap */
export const GapTight: Story = {
  args: { gap: 'tight' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};
export const GapNormal: Story = {
  args: { gap: 'normal' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};
export const GapLoose: Story = {
  args: { gap: 'loose' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

/* states */
export const WithDescription: Story = {
  args: { description: 'We only ship within the EU.' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

export const RequiredIndicator: Story = {
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" required />
      <Input label="City" name="city" required />
    </Fieldset>
  ),
};

export const WithError: Story = {
  args: { error: 'End date must be after start date.', legend: 'Trip dates' },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Start date" name="startDate" />
      <Input label="End date" name="endDate" />
    </Fieldset>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Fieldset {...args}>
      <Input label="Street" name="street" />
      <Input label="City" name="city" />
    </Fieldset>
  ),
};

export const NotificationPreferences: Story = {
  args: { legend: 'Notification preferences' },
  render: (args) => (
    <Fieldset {...args}>
      <Checkbox label="Email" name="notifyEmail" />
      <Checkbox label="SMS" name="notifySms" />
      <Checkbox label="Push" name="notifyPush" />
    </Fieldset>
  ),
};
