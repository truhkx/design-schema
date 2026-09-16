import { useState, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, type PopoverOpenChangeReason, type PopoverProps } from './Popover';
import { Button } from './Button';
import { Form } from './Form';
import { Icon } from './Icon';
import { Input } from './Input';
import { Link } from './Link';
import { Stack } from './Stack';
import { Switch } from './Switch';
import { Text } from './Text';

const defaultBody = (
  <Stack gap="normal">
    <Text size="sm">Show items updated in the last:</Text>
    <Stack direction="horizontal" gap="tight">
      <Button label="7 days" variant="secondary" size="sm" />
      <Button label="30 days" variant="secondary" size="sm" />
      <Button label="90 days" variant="secondary" size="sm" />
    </Stack>
  </Stack>
);

const meta: Meta<typeof Popover> = {
  title: 'Popover/React',
  component: Popover,
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: defaultBody,
    headingLevel: '3',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
  argTypes: {
    trigger: { control: false },
    children: { control: false },
    headingLevel: { control: 'inline-radio', options: ['2', '3', '4'] },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { heading: 'Filters', headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { heading: 'Filters', headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { heading: 'Filters', headingLevel: '4' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

/* notable states */
export const NotDismissible: Story = { args: { heading: 'Filters', dismissible: false } };

/* examples */
export const FilterPanel: Story = {
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: (
      <Form label="Filters" actions={<Button label="Apply" type="submit" size="sm" />}>
        <Stack gap="normal">
          <Switch label="Only open items" name="openOnly" />
          <Switch label="Assigned to me" name="mine" />
        </Stack>
      </Form>
    ),
    heading: 'Filters',
    placement: 'bottom-start',
  },
};

export const DatePickerPanel: Story = {
  args: {
    trigger: <Button label="16 September 2026" variant="secondary" leadingIcon={<Icon name="calendar" inline />} />,
    children: (
      <Stack gap="tight">
        <Button label="Today" variant="ghost" size="sm" />
        <Button label="Tomorrow" variant="ghost" size="sm" />
        <Button label="Next week" variant="ghost" size="sm" />
      </Stack>
    ),
  },
};

export const RequiredStep: Story = {
  args: {
    trigger: <Button label="Add member" variant="secondary" />,
    children: (
      <Form label="Add member" actions={<Button label="Save" type="submit" size="sm" />}>
        <Input label="Email" name="email" type="email" required />
      </Form>
    ),
    heading: 'Add member',
    modal: true,
  },
};

export const ContextualHelp: Story = {
  args: {
    trigger: <Button label="Help" variant="ghost" iconOnly leadingIcon={<Icon name="info" inline />} />,
    children: (
      <Text size="sm">
        Filters apply to every view in this project. <Link href="#" label="Read the guide" />
      </Text>
    ),
    showArrow: true,
    placement: 'end',
  },
};

/** Starts open and owns its state, so Escape and Tab visibly close it. */
function KeyboardHarness(props: PopoverProps): ReactElement {
  const [open, setOpen] = useState(props.open ?? true);
  const handleOpenChange = (next: boolean, reason: PopoverOpenChangeReason): void => {
    setOpen(next);
    props.onOpenChange?.(next, reason);
  };
  return <Popover {...props} open={open} onOpenChange={handleOpenChange} />;
}

/** Open with its trigger and three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    heading: 'Filters',
    children: (
      <Stack gap="normal">
        <Button label="7 days" variant="secondary" size="sm" />
        <Button label="30 days" variant="secondary" size="sm" />
        <Button label="90 days" variant="secondary" size="sm" />
      </Stack>
    ),
  },
  render: (args) => <KeyboardHarness {...(args as PopoverProps)} />,
};
