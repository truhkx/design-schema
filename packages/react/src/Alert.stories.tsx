import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Link } from './Link';

const meta = {
  title: 'Alert/React',
  component: Alert,
  args: {
    tone: 'info',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.',
    live: 'status',
    dismissible: false,
  },
  argTypes: {
    onDismiss: { action: 'onDismiss' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '36rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = {
  args: { tone: 'info', heading: 'Trial ends in 3 days', children: 'Add a payment method to keep your workspace.' },
};
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = {
  args: { tone: 'warning', heading: 'Storage almost full', children: 'You have used 9.5 GB of 10 GB.' },
};
export const ToneDanger: Story = {
  args: {
    tone: 'danger',
    heading: 'Payment failed',
    live: 'alert',
    children: (
      <>
        Your card was declined. <Link href="/billing" label="Update your payment method" tone="inherit" /> to keep
        your plan.
      </>
    ),
  },
};

/* live */
export const LiveStatus: Story = { args: { live: 'status' } };
export const LiveAlert: Story = { args: { live: 'alert', tone: 'danger', heading: 'Payment failed', children: 'Your card was declined.' } };
export const LiveOff: Story = { args: { live: 'off' } };

/* states */
export const Dismissible: Story = { args: { dismissible: true } };
export const WithoutHeading: Story = { args: { heading: undefined, children: 'Some features are unavailable offline.' } };
