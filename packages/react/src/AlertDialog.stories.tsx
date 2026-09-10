import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog, type AlertDialogProps } from './AlertDialog';
import { Button } from './Button';

/** AlertDialog is fully controlled; the harness owns `open` and a trigger, like a real consumer would. */
function AlertDialogHarness({ onConfirm, onCancel, ...rest }: Partial<AlertDialogProps>) {
  const [open, setOpen] = useState(rest.open ?? false);

  return (
    <>
      <Button label="Delete files" variant="danger" onClick={() => setOpen(true)} />
      <AlertDialog
        heading="Delete 3 files?"
        description="They will be removed from all shared folders. This cannot be undone."
        confirmLabel="Delete files"
        {...rest}
        open={open}
        onConfirm={() => {
          onConfirm?.();
          setOpen(false);
        }}
        onCancel={(reason) => {
          onCancel?.(reason);
          setOpen(false);
        }}
      />
    </>
  );
}

const meta = {
  title: 'AlertDialog/React',
  component: AlertDialog,
  args: {
    open: false,
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    tone: 'danger',
    confirmLabel: 'Delete files',
    confirmDisabled: false,
  },
  render: (args) => <AlertDialogHarness {...args} />,
  tags: ['autodocs'],
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = {
  args: {
    tone: 'warning',
    heading: 'Discard unsaved changes?',
    description: 'Your edits since the last save will be lost.',
    confirmLabel: 'Discard changes',
  },
};
export const ToneInfo: Story = {
  args: {
    tone: 'info',
    heading: 'Leave this page?',
    description: 'Filters you set here will not be kept.',
    confirmLabel: 'Leave page',
  },
};

/* notable states */
export const CustomCancelLabel: Story = {
  args: {
    tone: 'warning',
    heading: 'Discard unsaved changes?',
    description: 'Your edits since the last save will be lost.',
    confirmLabel: 'Discard changes',
    cancelLabel: 'Keep editing',
  },
};

export const ConfirmDisabled: Story = {
  args: {
    heading: 'Delete your account?',
    description: 'Type the account name below to confirm. This cannot be undone.',
    confirmLabel: 'Delete account',
    confirmDisabled: true,
  },
};

/** Open/present with its trigger and its three focusable children (Cancel, Confirm, and the trigger left behind), for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => <AlertDialogHarness {...args} />,
};
