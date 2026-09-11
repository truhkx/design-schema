import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastRegion, toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Toast/React',
  component: Toast,
  args: {
    message: 'Message sent',
    tone: 'neutral',
    duration: 'short',
    dismissible: true,
  },
  argTypes: {
    onAction: { action: 'onAction' },
    onDismiss: { action: 'onDismiss' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '28rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral', message: 'Message sent' } };
export const ToneSuccess: Story = { args: { tone: 'success', message: 'Changes saved' } };
export const ToneWarning: Story = { args: { tone: 'warning', message: 'Storage almost full' } };
export const ToneDanger: Story = { args: { tone: 'danger', message: 'Upload failed', duration: 'persistent' } };

/* duration */
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent' } };

/* notable states */
export const WithAction: Story = {
  args: { message: '3 files deleted', actionLabel: 'Undo', duration: 'persistent' },
};
export const NotDismissible: Story = { args: { dismissible: false } };

/** Populates the region with two persistent, action-bearing toasts: 4 focusable buttons for the keyboard gate. */
function ToastKeyboardHarness() {
  useEffect(() => {
    toast({ message: '3 files deleted', actionLabel: 'Undo', duration: 'persistent' });
    toast({ message: 'Export ready', actionLabel: 'View', duration: 'persistent' });
  }, []);
  return <ToastRegion />;
}

export const Keyboard: Story = {
  render: () => <ToastKeyboardHarness />,
};
