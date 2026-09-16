import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
import { withTheme } from './decorators';

const meta: Meta<typeof Alert> = {
  title: 'Alert/React Native',
  component: Alert,
  decorators: [withTheme()],
  args: {
    tone: 'info',
    live: 'status',
    dismissible: false,
    children: 'Some features are unavailable while you are offline.',
  },
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {};

// tone
export const ToneInfo: Story = { args: { tone: 'info' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

// live
export const LiveStatus: Story = { args: { live: 'status' } };
export const LiveAlert: Story = { args: { live: 'alert' } };
export const LiveOff: Story = { args: { live: 'off' } };

// examples
/** An error that blocks the user, announced immediately above the form it belongs to. */
export const BlockingError: Story = {
  args: {
    tone: 'danger',
    live: 'alert',
    heading: 'Payment failed',
    children: 'Your card was declined. Try another card or contact your bank.',
  },
};

/** A polite success confirmation after a submit. */
export const Saved: Story = {
  args: {
    tone: 'success',
    heading: 'Changes saved',
    children: 'Your notification preferences apply from the next digest.',
  },
};

/** A message the user can safely put away. */
export const DismissibleNotice: Story = {
  args: {
    tone: 'info',
    dismissible: true,
    children: 'Some features are unavailable while you are offline.',
  },
};

/** A warning already on the page when it loads, so it is read in sequence rather than announced. */
export const PresentAtLoad: Story = {
  args: {
    tone: 'warning',
    live: 'off',
    heading: 'Trial ends in three days',
    children: 'Add a payment method to keep your workspace.',
  },
};
