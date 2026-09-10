import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Input } from './Input';
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

export const NotDismissible: Story = {
  args: {
    dismissible: false,
    footer: (
      <>
        <Button label="Delete account" variant="danger" />
        <Button label="Keep account" variant="secondary" />
      </>
    ),
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
