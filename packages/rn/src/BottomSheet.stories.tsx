import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof BottomSheet> = {
  title: 'BottomSheet/React Native',
  component: BottomSheet,
  decorators: [withTheme()],
  args: {
    open: true,
    heading: 'Filters',
    children: <Text>Narrow results by price, distance and rating.</Text>,
    footer: (
      <>
        <Button label="Apply" variant="primary" />
        <Button label="Reset" variant="secondary" />
      </>
    ),
    height: 'content',
    dismissible: true,
    dragToDismiss: true,
  },
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {};

// height
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightHalf: Story = { args: { height: 'half' } };
export const HeightFull: Story = { args: { height: 'full' } };

// notable states
export const HideHeading: Story = {
  args: {
    heading: 'Share to',
    hideHeading: true,
    children: (
      <Stack direction="horizontal" gap="loose" justify="center">
        <Text>Messages</Text>
        <Text>Mail</Text>
        <Text>Copy link</Text>
      </Stack>
    ),
  },
};

export const NoFooter: Story = { args: { footer: undefined } };

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

export const DragToDismissFalse: Story = { args: { dragToDismiss: false } };

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.full', scrim: 'color.overlay.scrim' },
  },
};

/** Open with its trigger and several focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return (
        <Stack gap="loose" align="start">
          <Button label="Open filters" onPress={() => setOpen(true)} />
          <BottomSheet
            {...args}
            open={open}
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button label="Apply" variant="primary" onPress={() => setOpen(false)} />
                <Button label="Reset" variant="secondary" onPress={() => setOpen(false)} />
              </>
            }
          >
            <Stack gap="loose">
              <Input label="Minimum price" name="min-price" />
              <Input label="Maximum price" name="max-price" />
              <Link href="#" label="Clear all filters" />
            </Stack>
          </BottomSheet>
        </Stack>
      );
    }
    return <Open />;
  },
};
