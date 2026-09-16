import { useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionSheet, type ActionSheetAction } from './ActionSheet';
import { Button } from './Button';
import { Icon } from './Icon';

const PHOTO_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React',
  component: ActionSheet,
  tags: ['autodocs'],
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS,
  },
  argTypes: {
    onAction: { action: 'action' },
    onClose: { action: 'close' },
  },
};

export default meta;
type Story = StoryObj<typeof ActionSheet>;

export const Default: Story = {};

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

export const NotDismissible: Story = {
  args: { dismissible: false },
};

function KeyboardDemo(): ReactElement {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button
        label="More actions"
        iconOnly
        leadingIcon={<Icon name="ellipsis" inline />}
        aria-haspopup="menu"
        onClick={() => setOpen(true)}
      />
      <ActionSheet
        open={open}
        heading="Photo.jpg"
        actions={PHOTO_ACTIONS}
        onAction={() => setOpen(false)}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Open with its trigger and four focusable actions, for the keyboard gate. */
export const Keyboard: Story = {
  render: () => <KeyboardDemo />,
};
