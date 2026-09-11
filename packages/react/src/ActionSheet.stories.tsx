import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionSheet, type ActionSheetAction } from './ActionSheet';
import { Button } from './Button';
import { Icon } from './Icon';

const meta: Meta<typeof ActionSheet> = {
  title: 'ActionSheet/React',
  component: ActionSheet,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActionSheet>;

const PHOTO_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
];

function ActionSheetDemo(props: Partial<ComponentProps<typeof ActionSheet>>) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <Button label="More actions" iconOnly leadingIcon={<Icon name="ellipsis" inline />} onClick={() => setOpen(true)} />
      <ActionSheet
        open={open}
        heading="Photo.jpg"
        actions={PHOTO_ACTIONS}
        onAction={() => setOpen(false)}
        onClose={() => setOpen(false)}
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <ActionSheetDemo />,
};

export const WithoutHeading: Story = {
  render: () => <ActionSheetDemo heading={undefined} />,
};

export const NotDismissible: Story = {
  render: () => <ActionSheetDemo dismissible={false} />,
};

export const DisabledAction: Story = {
  render: () => (
    <ActionSheetDemo
      actions={[
        { id: 'share', label: 'Share', icon: 'external' },
        { id: 'rename', label: 'Rename', disabled: true },
        { id: 'duplicate', label: 'Duplicate' },
        { id: 'delete', label: 'Delete photo', icon: 'danger', tone: 'danger' },
      ]}
    />
  ),
};

export const Keyboard: Story = {
  render: () => (
    <ActionSheet
      open
      heading="Photo.jpg"
      actions={PHOTO_ACTIONS}
      onAction={() => {}}
      onClose={() => {}}
    />
  ),
};
