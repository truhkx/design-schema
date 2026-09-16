import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertDialog } from './AlertDialog';
import { Button } from './Button';
import { Input } from './Input';
import { Stack } from './Stack';
import { withTheme } from './decorators';

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
};

export default meta;

type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {};

// tone
export const ToneDanger: Story = { args: { tone: 'danger' } };
export const ToneWarning: Story = {
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes to this draft will be lost.',
    confirmLabel: 'Leave',
  },
};
export const ToneInfo: Story = {
  args: {
    tone: 'info',
    heading: 'Publish to the team?',
    description: 'Everyone in the workspace will be able to see this page.',
    confirmLabel: 'Publish',
  },
};

// examples
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

// notable states
export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.sm', footerGap: 'layout.gap.normal' },
  },
};

/** Open with its trigger and several focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return (
        <Stack gap="loose" align="start">
          <Button label="Delete files" variant="danger" onPress={() => setOpen(true)} />
          <Input label="Project name" name="name" defaultValue="Marketing site" />
          <Input label="Description" name="description" />
          <AlertDialog
            {...args}
            open={open}
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
          />
        </Stack>
      );
    }
    return <Open />;
  },
};
