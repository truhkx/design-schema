import { useEffect, useState, type ComponentProps, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionSheet, type ActionSheetAction, type ActionSheetCloseReason } from './ActionSheet';
import { Button } from './Button';
import { Icon } from './Icon';

const PHOTO_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

/** Acts as the consumer: owns `open` (starting from the arg) and closes on onAction and onClose. */
function Consumer(args: ComponentProps<typeof ActionSheet>): ReactElement {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
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
        {...args}
        open={open}
        onAction={(id: string) => {
          args.onAction?.(id);
          setOpen(false);
        }}
        onClose={(reason: ActionSheetCloseReason) => {
          args.onClose?.(reason);
          setOpen(false);
        }}
      />
    </>
  );
}

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React',
  component: ActionSheet,
  tags: ['autodocs'],
  render: (args) => <Consumer {...args} />,
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

/** No Cancel row, no handle; the scrim does nothing and Escape still reports through onClose. */
export const DismissibleFalse: Story = {
  args: { dismissible: false },
};

export const Closed: Story = {
  args: { open: false },
};

/** Open with its trigger and four focusable actions, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true, heading: 'Photo.jpg', actions: PHOTO_ACTIONS },
};
