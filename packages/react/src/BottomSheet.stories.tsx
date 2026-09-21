import { useEffect, useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BottomSheet, type BottomSheetProps } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';
import { Stack } from './Stack';
import { Text } from './Text';

/** BottomSheet is controlled; the harness owns `open` and a trigger, as a real consumer would. */
function BottomSheetHarness({ open: openArg, onClose, ...args }: BottomSheetProps): ReactElement {
  const [open, setOpen] = useState(openArg);
  useEffect(() => setOpen(openArg), [openArg]);

  return (
    <>
      <Button label={args.heading} onClick={() => setOpen(true)} />
      <BottomSheet
        {...args}
        open={open}
        onClose={(reason) => {
          onClose?.(reason);
          // A non-dismissible sheet reports Escape; this consumer keeps it open until a footer action.
          if (reason === 'escape' && args.dismissible === false) return;
          setOpen(false);
        }}
      />
    </>
  );
}

const meta: Meta<typeof BottomSheet> = {
  title: 'BottomSheet/React',
  component: BottomSheet,
  args: {
    open: true,
    heading: 'Filters',
    hideHeading: false,
    children: (
      <Stack gap="normal">
        <Text size="sm">Show items updated in the last:</Text>
        <Input label="Days" name="days" defaultValue="30" />
      </Stack>
    ),
    height: 'content',
    dismissible: true,
    dragToDismiss: true,
  },
  render: (args) => <BottomSheetHarness {...args} />,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightHalf: Story = { args: { height: 'half' } };
export const HeightFull: Story = { args: { height: 'full' } };

/* notable states */
export const HideHeading: Story = { args: { hideHeading: true } };

export const NotDismissible: Story = {
  args: {
    dismissible: false,
    children: <Text>Only the footer actions close this sheet; Escape still reports.</Text>,
    footer: <Button label="Done" variant="primary" size="sm" />,
  },
};

export const DragToDismissOff: Story = { args: { dragToDismiss: false } };

/** Nothing left for the header to hold — no visible heading, no handle, no close button — so it is not rendered. */
export const HiddenHeadingNotDismissible: Story = {
  args: {
    hideHeading: true,
    dismissible: false,
    footer: <Button label="Done" variant="primary" size="sm" />,
  },
};

/* examples */
export const Filters: Story = {
  args: {
    open: true,
    heading: 'Filters',
    children: 'A Form of filter controls',
    footer: 'Clear and Apply Buttons',
  },
};

export const HalfHeightResults: Story = {
  args: {
    open: true,
    heading: 'Nearby places',
    children: 'A scrolling list of results',
    height: 'half',
  },
};

export const ShareSheet: Story = {
  args: {
    open: true,
    heading: 'Share to',
    children: 'A row of share targets',
    hideHeading: true,
  },
};

export const FullScreenTask: Story = {
  args: {
    open: true,
    heading: 'New expense',
    children: 'A Form of a few fields',
    footer: 'Cancel and Save Buttons',
    height: 'full',
    dragToDismiss: false,
  },
};

/** Open with its trigger and at least three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    children: (
      <Stack gap="normal">
        <Input label="Search term" name="search" defaultValue="roadmap" />
        <Input label="Owner" name="owner" defaultValue="Anyone" />
        <Input label="Days" name="days" defaultValue="30" />
      </Stack>
    ),
  },
};
