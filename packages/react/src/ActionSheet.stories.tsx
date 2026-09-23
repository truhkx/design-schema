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

/**
 * Acts as the consumer: owns `open` (starting from the arg) and sets it false on onAction and
 * onClose, calling the story's own handlers first. It renders no trigger — there is no copy key
 * for one — so the sheet's focusable children are the only ones on the page.
 */
function Consumer(args: ComponentProps<typeof ActionSheet>): ReactElement {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
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
  );
}

/**
 * The Keyboard story's consumer: as Consumer, plus the one trigger any story renders — an overflow
 * Button labelled "More actions", which gives the wide presentation a real anchor.
 */
function KeyboardConsumer(args: ComponentProps<typeof ActionSheet>): ReactElement {
  const [open, setOpen] = useState(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  return (
    <>
      <Button
        variant="secondary"
        iconOnly
        label="More actions"
        leadingIcon={<Icon name="ellipsis" />}
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

/** Open, with the photo-actions example's args. */
export const Default: Story = {};

/** Contextual actions on an item, with the destructive one last. */
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

/** A sheet with no heading, named by copy.defaultLabel for assistive technology. */
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

/** An action that is shown but cannot be used here, announced as disabled rather than hidden. */
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

/** The controlled sheet with `open` false renders nothing. */
export const Closed: Story = {
  args: { open: false },
};

/** Open with its "More actions" trigger, four focusable actions and the Cancel row, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true, heading: 'Photo.jpg', actions: PHOTO_ACTIONS },
  render: (args) => <KeyboardConsumer {...args} />,
};
