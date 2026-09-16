import type { Meta, StoryObj } from '@storybook/react-vite';
import { Fieldset } from './Fieldset';
import { Input } from './Input';
import { Checkbox } from './Checkbox';

const addressFields = [<Input key="street" label="Street" name="street" />, <Input key="city" label="City" name="city" />];

const requiredAddressFields = [
  <Input key="street" label="Street" name="street" required />,
  <Input key="city" label="City" name="city" required />,
];

const dateFields = [<Input key="start" label="Start date" name="startDate" />, <Input key="end" label="End date" name="endDate" />];

const notificationFields = [
  <Checkbox key="email" label="Email" name="notifyEmail" />,
  <Checkbox key="sms" label="SMS" name="notifySms" />,
  <Checkbox key="push" label="Push" name="notifyPush" />,
];

const meta: Meta<typeof Fieldset> = {
  title: 'Fieldset/React',
  component: Fieldset,
  tags: ['autodocs'],
  args: {
    legend: 'Shipping address',
    gap: 'normal',
    disabled: false,
    children: addressFields,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* gap */
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };

/* states */
export const WithDescription: Story = { args: { description: 'We only ship within the EU.' } };
export const RequiredIndicator: Story = { args: { children: requiredAddressFields } };
export const WithError: Story = { args: { error: 'End date must be after start date.', children: dateFields } };
export const Disabled: Story = { args: { disabled: true } };

/* examples */
export const ShippingAddress: Story = {
  args: { legend: 'Shipping address', children: addressFields },
};

export const NotificationPreferences: Story = {
  args: {
    legend: 'Notification preferences',
    description: 'You can change these at any time.',
    children: notificationFields,
    gap: 'tight',
  },
};

export const DateRangeWithAGroupError: Story = {
  args: { legend: 'Reporting period', error: 'End date must be after start date.', children: dateFields },
};

export const DisabledGroup: Story = {
  args: { legend: 'Billing address', disabled: true, children: addressFields },
};
