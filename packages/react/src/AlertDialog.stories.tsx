import { useEffect, useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog, type AlertDialogProps } from './AlertDialog';
import { Button } from './Button';

/**
 * AlertDialog is controlled; the harness owns `open` and the trigger, as a real consumer would.
 * The trigger is labelled with the `heading` text, never `confirmLabel`, so no second button on the
 * page shares Confirm's accessible name.
 */
function AlertDialogHarness({ open: initialOpen, onConfirm, onCancel, ...rest }: AlertDialogProps): ReactElement {
  const [open, setOpen] = useState(initialOpen);
  useEffect(() => setOpen(initialOpen), [initialOpen]);

  return (
    <>
      <Button label={rest.heading} onClick={() => setOpen(true)} />
      <AlertDialog
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

const meta: Meta<typeof AlertDialog> = {
  title: 'AlertDialog/React',
  component: AlertDialog,
  args: {
    open: true,
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    tone: 'danger',
    confirmLabel: 'Delete files',
    confirmDisabled: false,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['danger', 'warning', 'info'] },
  },
  render: (args) => <AlertDialogHarness {...args} />,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneInfo: Story = { args: { tone: 'info' } };

/* notable states */
export const ConfirmDisabled: Story = { args: { confirmDisabled: true } };

export const Closed: Story = { args: { open: false } };

/**
 * Open with its trigger. The dialog has exactly two focusable children, Cancel and Confirm — there
 * is no slot for more — so Tab wraps across those two and the trigger sits behind the inert page.
 */
export const Keyboard: Story = { args: { open: true } };

/* examples */
export const DeleteFiles: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files',
  },
};

export const LeaveWithoutSaving: Story = {
  args: {
    open: true,
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
    cancelLabel: 'Keep editing',
  },
};

export const TypedConfirmation: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    confirmDisabled: true,
  },
};

export const PublishToTheTeam: Story = {
  args: {
    open: true,
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish',
  },
};
