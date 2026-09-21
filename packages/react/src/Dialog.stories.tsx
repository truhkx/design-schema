import { useEffect, useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dialog, type DialogProps } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';
import { Stack } from './Stack';
import { Text } from './Text';

/** Dialog is controlled; the harness owns `open` and the trigger, as a real consumer would. */
function DialogHarness({ open: initialOpen, onClose, ...rest }: DialogProps): ReactElement {
  const [open, setOpen] = useState(initialOpen);
  useEffect(() => setOpen(initialOpen), [initialOpen]);

  return (
    <>
      <Button label={rest.heading} onClick={() => setOpen(true)} />
      <Dialog
        {...rest}
        open={open}
        onClose={(reason) => {
          onClose?.(reason);
          setOpen(false);
        }}
      />
    </>
  );
}

const renameFooter = (
  <>
    <Button label="Rename" variant="primary" />
    <Button label="Cancel" variant="secondary" />
  </>
);

const meta: Meta<typeof Dialog> = {
  title: 'Dialog/React',
  component: Dialog,
  args: {
    open: true,
    heading: 'Rename project',
    children: <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />,
    footer: renameFooter,
    hideHeading: false,
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    initialFocus: { control: 'inline-radio', options: ['first', 'title', 'close'] },
    children: { control: false },
    footer: { control: false },
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
export const HideHeading: Story = { args: { hideHeading: true } };

/** The description is one sentence of consequence under the title, and the accessible description. */
export const WithDescription: Story = {
  args: { description: 'Everyone with access will see the new name.' },
};

export const NotDismissible: Story = { args: { dismissible: false } };

export const Closed: Story = { args: { open: false } };

/** Open with its trigger and more than three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    children: (
      <Stack gap="normal">
        <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />
        <Input label="Slug" name="slug" defaultValue="q3-roadmap" />
      </Stack>
    ),
  },
};

/* examples */
export const RenameProject: Story = {
  args: {
    open: true,
    heading: 'Rename project',
    children: <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />,
    footer: renameFooter,
  },
};

export const InvitePeople: Story = {
  args: {
    open: true,
    heading: 'Invite people',
    children: (
      <Stack gap="normal">
        <Input label="Email" name="email" type="email" />
        <Select
          label="Role"
          name="role"
          defaultValue="member"
          options={[
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      </Stack>
    ),
    footer: (
      <>
        <Button label="Send invites" variant="primary" />
        <Button label="Cancel" variant="secondary" />
      </>
    ),
    size: 'sm',
  },
};

export const MustBeAnswered: Story = {
  args: {
    open: true,
    heading: 'Choose a plan',
    description: 'You need a plan before you can invite anyone.',
    children: (
      <RadioGroup
        label="Plan"
        name="plan"
        options={[
          { value: 'starter', label: 'Starter' },
          { value: 'team', label: 'Team' },
          { value: 'business', label: 'Business' },
        ]}
      />
    ),
    footer: <Button label="Continue" variant="primary" />,
    dismissible: false,
  },
};

export const ReadingDialog: Story = {
  args: {
    open: true,
    heading: 'Terms of service',
    children: (
      <Stack gap="normal">
        <Text>These terms govern your use of the service and any content you create with it.</Text>
        <Text>You keep ownership of your content. You grant us the rights needed to host and display it to the people you share it with.</Text>
        <Text>We may update these terms. When we do, we will tell you before the changes take effect.</Text>
        <Text>You can close your account at any time. Your content is deleted thirty days after closure.</Text>
      </Stack>
    ),
    footer: undefined,
    size: 'lg',
    initialFocus: 'title',
  },
};
