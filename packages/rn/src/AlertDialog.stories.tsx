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
export const ToneDanger: Story = { args: { tone: 'danger', confirmLabel: 'Delete files' } };
export const ToneWarning: Story = {
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost. This cannot be undone.',
    confirmLabel: 'Leave page',
  },
};
export const ToneInfo: Story = {
  args: {
    tone: 'info',
    heading: 'Switch workspaces?',
    description: 'You will be moved to the Marketing workspace.',
    confirmLabel: 'Switch workspace',
  },
};

// notable states
export const CustomCancelLabel: Story = {
  args: {
    tone: 'warning',
    heading: 'Leave without saving?',
    description: 'Your changes will be lost. This cannot be undone.',
    confirmLabel: 'Leave page',
    cancelLabel: 'Keep editing',
  },
};

export const ConfirmDisabled: Story = { args: { confirmDisabled: true } };

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.full', border: 'color.border.strong' },
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
