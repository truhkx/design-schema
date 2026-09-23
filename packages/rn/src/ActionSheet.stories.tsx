import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetAction, ActionSheetProps } from './ActionSheet';
import { Button } from './Button';
import { Icon } from './Icon';
import { Stack } from './Stack';
import { withTheme } from './decorators';
import { useTheme } from './theme';

const PHOTO_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

/**
 * Acts as the consumer: owns `open` (starting from the args), calls the story's own
 * handler first and then closes, on both `onAction` and `onClose`. Only `Keyboard`
 * renders a trigger — there is no copy key for one elsewhere.
 */
function ActionSheetConsumer({ trigger = false, ...args }: ActionSheetProps & { trigger?: boolean }): React.JSX.Element {
  const { tokens: t } = useTheme();
  const [open, setOpen] = React.useState(args.open);
  React.useEffect(() => setOpen(args.open), [args.open]);
  const sheet = (
    <ActionSheet
      {...args}
      open={open}
      onAction={(id) => {
        args.onAction?.(id);
        setOpen(false);
      }}
      onClose={(reason) => {
        args.onClose?.(reason);
        setOpen(false);
      }}
    />
  );
  if (!trigger) {
    return sheet;
  }
  return (
    <Stack gap="loose" align="start">
      <Button
        label="More actions"
        variant="secondary"
        iconOnly
        leadingIcon={<Icon name="ellipsis" color={t.colorActionSecondaryForeground} />}
        onPress={() => setOpen(true)}
      />
      {sheet}
    </Stack>
  );
}

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React Native',
  component: ActionSheet,
  decorators: [withTheme()],
  render: (args) => <ActionSheetConsumer {...args} />,
  // The photo-actions example.
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS,
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
export const Closed: Story = { args: { open: false } };

export const DismissibleFalse: Story = { args: { dismissible: false } };

/** Open with its trigger, four rows and the Cancel row, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => <ActionSheetConsumer {...args} trigger />,
};
