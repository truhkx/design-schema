import { useEffect, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastRegion, dismiss, toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Toast/React',
  component: Toast,
  tags: ['autodocs'],
  args: {
    message: 'Message sent',
    tone: 'neutral',
    dismissible: true,
  },
  argTypes: {
    onAction: { action: 'onAction' },
    onDismiss: { action: 'onDismiss' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneNeutral: Story = { args: { tone: 'neutral' } };
export const ToneSuccess: Story = { args: { tone: 'success' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneDanger: Story = { args: { tone: 'danger' } };

/* duration */
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent' } };

/* examples */
export const UndoADelete: Story = {
  args: { message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' },
};
export const Saved: Story = { args: { message: 'Changes saved', tone: 'success' } };
/* No `duration`: an action already makes the toast persistent, and passing `short`/`long` would warn. */
export const BackgroundResult: Story = { args: { message: 'Export ready', actionLabel: 'View' } };
export const FailedUpload: Story = {
  args: { message: 'Upload failed', tone: 'danger', actionLabel: 'Retry', duration: 'persistent' },
};

/* notable states */
export const NotDismissible: Story = { args: { dismissible: false } };

/**
 * The region with two persistent action toasts: four focusable buttons, reached with F6 and left
 * with Escape or Tab.
 *
 * The first is the toast the keyboard rules act on; the second is `danger`, so it announces through
 * `role="alert"` rather than `status`. That keeps exactly one `role="status"` on the page: Escape
 * dismisses the toast holding focus and only that one, which a `getByRole('status')` locator can
 * only observe when no other status toast is left to take its place.
 */
function ToastKeyboardHarness(): ReactElement {
  useEffect(() => {
    void toast({ toastId: 'keyboard-undo', message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' });
    void toast({
      toastId: 'keyboard-retry',
      message: 'Upload failed',
      tone: 'danger',
      actionLabel: 'Retry',
      duration: 'persistent',
    });
    return () => dismiss();
  }, []);
  return <ToastRegion />;
}

export const Keyboard: Story = {
  render: () => <ToastKeyboardHarness />,
};
