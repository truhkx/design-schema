import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, type DialogProps } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { Stack } from './Stack';
import { Text } from './Text';

/** Dialog is fully controlled; the harness owns `open` and a trigger, like a real consumer would. */
function DialogHarness({ children, footer, onClose, ...rest }: Partial<DialogProps>) {
  const [open, setOpen] = useState(rest.open ?? false);

  return (
    <>
      <Button label="Rename project" onClick={() => setOpen(true)} />
      <Dialog
        heading="Rename project"
        {...rest}
        open={open}
        onClose={(reason) => {
          onClose?.(reason);
          setOpen(false);
        }}
        footer={
          footer === undefined ? (
            <>
              <Button label="Rename" variant="primary" size="sm" onClick={() => setOpen(false)} />
              <Button label="Cancel" variant="secondary" size="sm" onClick={() => setOpen(false)} />
            </>
          ) : (
            footer || undefined
          )
        }
      >
        {children}
      </Dialog>
    </>
  );
}

const defaultBody = (
  <Stack gap="normal">
    <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />
  </Stack>
);

const meta: Meta<typeof Dialog> = {
  title: 'Dialog/React',
  component: Dialog,
  args: {
    open: false,
    heading: 'Rename project',
    description: 'Choose a new name. Existing links keep working.',
    children: defaultBody,
    hideHeading: false,
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
  render: (args) => <DialogHarness {...args} />,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* initialFocus */
export const InitialFocusFirst: Story = { args: { initialFocus: 'first' } };
export const InitialFocusTitle: Story = { args: { initialFocus: 'title' } };
export const InitialFocusClose: Story = { args: { initialFocus: 'close' } };

/* notable states */
export const NotDismissible: Story = {
  args: {
    dismissible: false,
    description: 'This account and all of its projects will be permanently deleted.',
    footer: (
      <>
        <Button label="Delete account" variant="danger" size="sm" />
        <Button label="Keep account" variant="secondary" size="sm" />
      </>
    ),
  },
};

export const WithoutFooter: Story = {
  args: {
    footer: null,
    children: <Text>Use the close button or Escape to dismiss this dialog.</Text>,
  },
};

export const HideHeading: Story = {
  args: {
    hideHeading: true,
    description: undefined,
  },
};

/** Open/present with its trigger and at least three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => (
    <DialogHarness {...args}>
      <Stack gap="normal">
        <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />
        <Input label="Slug" name="slug" defaultValue="q3-roadmap" />
      </Stack>
    </DialogHarness>
  ),
};
