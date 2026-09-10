import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BottomSheet, type BottomSheetProps } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';
import { Stack } from './Stack';
import { Text } from './Text';

/** BottomSheet is fully controlled; the harness owns `open` and a trigger, like a real consumer would. */
function BottomSheetHarness({ children, footer, onClose, ...rest }: Partial<BottomSheetProps>) {
  const [open, setOpen] = useState(rest.open ?? false);

  return (
    <>
      <Button label="Filters" onClick={() => setOpen(true)} />
      <BottomSheet
        title="Filters"
        {...rest}
        open={open}
        onClose={(reason) => {
          onClose?.(reason);
          setOpen(false);
        }}
        footer={
          footer === undefined ? (
            <>
              <Button label="Apply" variant="primary" size="sm" onClick={() => setOpen(false)} />
              <Button label="Cancel" variant="secondary" size="sm" onClick={() => setOpen(false)} />
            </>
          ) : (
            footer || undefined
          )
        }
      >
        {children}
      </BottomSheet>
    </>
  );
}

const defaultBody = (
  <Stack gap="normal">
    <Text size="sm">Show items updated in the last:</Text>
    <Input label="Days" name="days" defaultValue="30" />
  </Stack>
);

const meta = {
  title: 'BottomSheet/React',
  component: BottomSheet,
  args: {
    open: false,
    title: 'Filters',
    hideTitle: false,
    children: defaultBody,
    height: 'content',
    dismissible: true,
    draggable: true,
  },
  render: (args) => <BottomSheetHarness {...args} />,
  tags: ['autodocs'],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightHalf: Story = { args: { height: 'half' } };
export const HeightFull: Story = { args: { height: 'full' } };

/* notable states */
export const HideTitleTrue: Story = {
  args: {
    hideTitle: true,
    title: 'Share',
    children: (
      <Stack direction="horizontal" gap="normal">
        <Button label="Copy link" variant="secondary" size="sm" />
        <Button label="Email" variant="secondary" size="sm" />
        <Button label="Message" variant="secondary" size="sm" />
      </Stack>
    ),
    footer: null,
  },
};

export const NotDismissible: Story = {
  args: {
    dismissible: false,
    draggable: false,
    children: <Text>Use the footer actions to close this sheet — the scrim, Escape reporting aside, and drag are disabled.</Text>,
  },
};

export const DraggableFalse: Story = {
  args: { draggable: false },
};

export const WithoutFooter: Story = {
  args: {
    footer: null,
    children: <Text>Use the close button, Escape, a scrim tap, or a drag to dismiss this sheet.</Text>,
  },
};

/** Open/present with its trigger and at least three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => (
    <BottomSheetHarness {...args}>
      <Stack gap="normal">
        <Input label="Search term" name="search" defaultValue="roadmap" />
        <Input label="Owner" name="owner" defaultValue="Anyone" />
      </Stack>
    </BottomSheetHarness>
  ),
};
