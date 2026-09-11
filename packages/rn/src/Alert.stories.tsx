import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
import { withTheme } from './decorators';

const meta: Meta<typeof Alert> = {
  title: 'Alert/React Native',
  component: Alert,
  decorators: [withTheme()],
  args: {
    tone: 'info',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.',
    live: 'status',
    dismissible: false,
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

// tone
export const ToneInfo: Story = { args: { tone: 'info', heading: 'Maintenance on Saturday', children: 'Sync pauses from 02:00 to 03:00 UTC.' } };
export const ToneSuccess: Story = { args: { tone: 'success', heading: 'Changes saved' } };
export const ToneWarning: Story = {
  args: { tone: 'warning', heading: 'Trial ends in 3 days', children: 'Add a payment method to keep your projects.' },
};
export const ToneDanger: Story = {
  args: { tone: 'danger', heading: 'Payment failed', children: 'The card ending 4242 was declined. Update it to continue.', live: 'alert' },
};

// live
export const LiveStatus: Story = { args: { live: 'status' } };
export const LiveAlert: Story = { args: { live: 'alert', tone: 'danger', heading: 'Payment failed', children: 'Update your card to continue.' } };
export const LiveOff: Story = { args: { live: 'off' } };

/** A dismiss button at the end; the consumer removes the alert on `onDismiss`. */
export const Dismissible: Story = {
  args: { dismissible: true },
  render: (args) => {
    const [visible, setVisible] = React.useState(true);
    return visible ? <Alert {...args} onDismiss={() => setVisible(false)} /> : <></>;
  },
};

export const WithoutHeading: Story = { args: { heading: undefined, children: 'Some features are unavailable while offline.' } };
