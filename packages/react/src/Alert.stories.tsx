import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
import { Link } from './Link';

const meta: Meta<typeof Alert> = {
  title: 'Alert/React',
  component: Alert,
  tags: ['autodocs'],
  args: {
    tone: 'info',
    live: 'status',
    dismissible: false,
    children: 'Some features are unavailable while you are offline.',
  },
  argTypes: {
    onDismiss: { action: 'onDismiss' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

/* live */
export const LiveStatus: Story = { args: { live: 'status' } };
export const LiveAlert: Story = { args: { live: 'alert' } };
export const LiveOff: Story = { args: { live: 'off' } };

/* states */
export const Dismissible: Story = { args: { dismissible: true } };
export const WithHeading: Story = { args: { heading: 'Changes saved' } };
export const WithLink: Story = {
  args: {
    tone: 'danger',
    heading: 'Payment failed',
    children: (
      <>
        Your card was declined. <Link href="/billing" label="Update your payment method" tone="inherit" /> to keep
        your plan.
      </>
    ),
  },
};

/* examples */
export const BlockingError: Story = {
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    children: 'Your card was declined. Try another card or contact your bank.',
  },
};
export const Saved: Story = {
  args: {
    tone: 'success',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.',
  },
};
export const DismissibleNotice: Story = {
  args: {
    tone: 'info',
    dismissible: true,
    children: 'Some features are unavailable while you are offline.',
  },
};
export const PresentAtLoad: Story = {
  args: {
    tone: 'warning',
    live: 'off',
    heading: 'Trial ends in three days',
    children: 'Add a payment method to keep your workspace.',
  },
};
