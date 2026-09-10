import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetAction } from './ActionSheet';
import { Button } from './Button';
import { Stack } from './Stack';
import { withTheme } from './decorators';

const ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete photo', tone: 'danger' },
];

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React Native',
  component: ActionSheet,
  decorators: [withTheme()],
  args: {
    open: true,
    title: 'Photo.jpg',
    actions: ACTIONS,
  },
};

export default meta;

type Story = StoryObj<typeof ActionSheet>;

export const Default: Story = {};

// notable states
export const NoTitle: Story = { args: { title: undefined } };

export const CustomCancelLabel: Story = { args: { cancelLabel: 'Not now' } };

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
          <Button label="More actions" onPress={() => setOpen(true)} />
          <ActionSheet {...args} open={open} onClose={() => setOpen(false)} onAction={() => setOpen(false)} />
        </Stack>
      );
    }
    return <Open />;
  },
};
