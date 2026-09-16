import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Input } from './Input';
import { RadioGroup } from './RadioGroup';
import { Select } from './Select';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Dialog> = {
  title: 'Dialog/React Native',
  component: Dialog,
  decorators: [withTheme()],
  args: {
    open: true,
    heading: 'Rename project',
    description: 'This changes the name everywhere it appears.',
    children: <Text>The project name is visible to everyone with access.</Text>,
    footer: (
      <>
        <Button label="Rename" variant="primary" />
        <Button label="Cancel" variant="secondary" />
      </>
    ),
    size: 'md',
    dismissible: true,
    initialFocus: 'first',
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

// initialFocus
export const InitialFocusFirst: Story = { args: { initialFocus: 'first' } };
export const InitialFocusTitle: Story = { args: { initialFocus: 'title' } };
export const InitialFocusClose: Story = { args: { initialFocus: 'close' } };

// notable states
export const NoDescription: Story = { args: { description: undefined } };

export const NoFooter: Story = { args: { footer: undefined } };

export const HideHeading: Story = { args: { hideHeading: true } };

// examples
export const RenameProject: Story = {
  args: {
    open: true,
    heading: 'Rename project',
    children: <Input label="Project name" name="name" defaultValue="Marketing site" />,
    footer: (
      <>
        <Button label="Rename" variant="primary" />
        <Button label="Cancel" variant="secondary" />
      </>
    ),
  },
};

export const InvitePeople: Story = {
  args: {
    open: true,
    heading: 'Invite people',
    children: (
      <Stack gap="normal">
        <Input label="Email address" name="email" type="email" />
        <Select
          label="Role"
          name="role"
          options={[
            { value: 'viewer', label: 'Viewer' },
            { value: 'editor', label: 'Editor' },
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
          { value: 'free', label: 'Free' },
          { value: 'team', label: 'Team' },
          { value: 'enterprise', label: 'Enterprise' },
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
        <Text>We may change these terms. When we do, we will tell you before the change takes effect.</Text>
        <Text>You can close your account at any time. Your content is deleted within thirty days of closing.</Text>
      </Stack>
    ),
    size: 'lg',
    initialFocus: 'title',
  },
};

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
          <Button label="Open dialog" onPress={() => setOpen(true)} />
          <Dialog
            {...args}
            open={open}
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button label="Rename" variant="primary" />
                <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} />
              </>
            }
          >
            <Stack gap="loose">
              <Input label="Project name" name="name" defaultValue="Marketing site" />
              <Input label="Description" name="description" />
            </Stack>
          </Dialog>
        </Stack>
      );
    }
    return <Open />;
  },
};
