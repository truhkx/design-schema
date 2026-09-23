import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog } from './AlertDialog';
import type { AlertDialogProps } from './AlertDialog';
import { Button } from './Button';
import { Stack } from './Stack';
import { withTheme } from './decorators';

/**
 * AlertDialog is controlled; the harness owns `open` and the trigger, as a real consumer
 * would. The trigger is labelled with the `heading` text, never `confirmLabel`, so no
 * second control shares Confirm's accessible name.
 */
function AlertDialogHarness({ open: initialOpen, onConfirm, onCancel, ...rest }: AlertDialogProps): React.JSX.Element {
  const [open, setOpen] = React.useState(initialOpen);
  React.useEffect(() => setOpen(initialOpen), [initialOpen]);

  return (
    <Stack gap="loose" align="start">
      <Button label={rest.heading} onPress={() => setOpen(true)} />
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
    </Stack>
  );
}

const meta: Meta<typeof AlertDialog> = {
  title: 'AlertDialog/React Native',
  component: AlertDialog,
  decorators: [withTheme()],
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
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = { args: { tone: 'warning' } };
export const ToneInfo: Story = { args: { tone: 'info' } };

/* notable states */
export const Closed: Story = { args: { open: false } };

/**
 * Open with its trigger, for the axe gate and manual keyboard checks. The dialog has
 * exactly two focusable children, Cancel and Confirm — there is no slot for more — so Tab
 * wraps across those two and the trigger sits behind the modal.
 */
export const Keyboard: Story = { args: { open: true } };

/*
 * examples — Storybook merges meta.args into every story, so each example also sets the
 * props it relies on being at their defaults, and renders as if from blank args.
 */
export const DeleteFiles: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files',
    cancelLabel: undefined,
    confirmDisabled: false,
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
    confirmDisabled: false,
  },
};

export const TypedConfirmation: Story = {
  args: {
    open: true,
    tone: 'danger',
    heading: 'Cancel your subscription?',
    description: 'Your workspace stays read-only after the current billing period ends.',
    confirmLabel: 'Cancel subscription',
    cancelLabel: undefined,
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
    cancelLabel: undefined,
    confirmDisabled: false,
  },
};
