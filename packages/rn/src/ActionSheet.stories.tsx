import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetAction } from './ActionSheet';
import { Button } from './Button';
import { Stack } from './Stack';
import { withTheme } from './decorators';

const ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React Native',
  component: ActionSheet,
  decorators: [withTheme()],
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: ACTIONS,
  },
};

export default meta;

type Story = StoryObj<typeof ActionSheet>;

export const Default: Story = {};

// examples
export const PhotoActions: Story = {
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [
      { id: 'share', label: 'Share', icon: 'external' },
      { id: 'rename', label: 'Rename' },
      { id: 'duplicate', label: 'Duplicate' },
      { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
    ],
  },
};

export const UnnamedSheet: Story = {
  args: {
    open: true,
    heading: undefined,
    actions: [
      { id: 'copy', label: 'Copy link' },
      { id: 'open', label: 'Open in new tab' },
    ],
  },
};

export const WithAnUnavailableAction: Story = {
  args: {
    open: true,
    heading: 'Invoice 4821',
    cancelLabel: 'Not now',
    actions: [
      { id: 'download', label: 'Download' },
      { id: 'void', label: 'Void invoice', tone: 'danger', disabled: true },
    ],
  },
};

// notable states
export const NotDismissible: Story = { args: { dismissible: false } };

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.md', itemPaddingBlock: 'space.md', headerGap: 'layout.gap.normal' },
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
