import type { Meta, StoryObj } from '@storybook/react';
import { Fieldset } from './Fieldset';
import { Input } from './Input';
import { Checkbox } from './Checkbox';

const addressFields = (
  <>
    <Input label="Street" name="street" />
    <Input label="City" name="city" />
  </>
);

const requiredAddressFields = (
  <>
    <Input label="Street" name="street" required />
    <Input label="City" name="city" required />
  </>
);

const dateFields = (
  <>
    <Input label="Start date" name="startDate" />
    <Input label="End date" name="endDate" />
  </>
);

const notificationFields = (
  <>
    <Checkbox label="Email" name="notifyEmail" />
    <Checkbox label="SMS" name="notifySms" />
    <Checkbox label="Push" name="notifyPush" />
  </>
);

const meta = {
  title: 'Fieldset/React',
  component: Fieldset,
  args: {
    legend: 'Shipping address',
    gap: 'normal',
    disabled: false,
    children: addressFields,
  },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* gap */
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };

/* states */
export const WithDescription: Story = {
  args: { description: 'We only ship within the EU.' },
};

export const RequiredIndicator: Story = {
  args: { children: requiredAddressFields },
};

export const WithError: Story = {
  args: { legend: 'Trip dates', error: 'End date must be after start date.', children: dateFields },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const NotificationPreferences: Story = {
  args: { legend: 'Notification preferences', children: notificationFields },
};
