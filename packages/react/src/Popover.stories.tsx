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

const filterForm = (
  <Form label="Filters" actions={<Button label="Apply" type="submit" size="sm" />}>
    <Stack gap="normal">
      <Switch label="Only open items" name="openOnly" />
      <Switch label="Assigned to me" name="mine" />
    </Stack>
  </Form>
);

/**
 * Acts as the consumer: owns `open`, starting from the `open` arg (true when omitted), and writes
 * `onOpenChange` back into it. The uncontrolled popover itself always starts closed.
 */
function OpenHarness(props: PopoverProps): ReactElement {
  const [open, setOpen] = useState(props.open ?? true);
  const handleOpenChange = (next: boolean, reason: PopoverOpenChangeReason): void => {
    setOpen(next);
    props.onOpenChange?.(next, reason);
  };
  return <Popover {...props} open={open} onOpenChange={handleOpenChange} />;
}

/** Every story but the examples renders through the consumer wrapper; there is no meta-level one. */
const controlled = (args: Partial<PopoverProps>): ReactElement => <OpenHarness {...(args as PopoverProps)} />;

/** The examples render the popover itself — closed and uncontrolled, as a page first shows it. */
const uncontrolled = (args: Partial<PopoverProps>): ReactElement => <Popover {...(args as PopoverProps)} />;

const meta: Meta<typeof Popover> = {
  title: 'Popover/React',
  component: Popover,
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: filterForm,
    heading: 'Filters',
    headingLevel: '3',
    placement: 'bottom-start',
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

/** Open, with the filter-panel example's args. */
export const Default: Story = { args: { open: true }, render: controlled };

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' }, render: controlled };
export const HeadingLevel3: Story = { args: { headingLevel: '3' }, render: controlled };
export const HeadingLevel4: Story = { args: { headingLevel: '4' }, render: controlled };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' }, render: controlled };
export const PlacementBottom: Story = { args: { placement: 'bottom' }, render: controlled };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' }, render: controlled };
export const PlacementTopStart: Story = { args: { placement: 'top-start' }, render: controlled };
export const PlacementTop: Story = { args: { placement: 'top' }, render: controlled };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' }, render: controlled };
export const PlacementStart: Story = { args: { placement: 'start' }, render: controlled };
export const PlacementEnd: Story = { args: { placement: 'end' }, render: controlled };

/* notable states */
export const NotDismissible: Story = { args: { dismissible: false }, render: controlled };
export const WithArrow: Story = { args: { showArrow: true }, render: controlled };
export const Modal: Story = { args: { modal: true }, render: controlled };

/*
 * Examples. Each one starts from blank args rather than Default's or meta's: every prop the example
 * does not give is written out at its own default, so the four render closed and uncontrolled.
 */
export const FilterPanel: Story = {
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: filterForm,
    heading: 'Filters',
    headingLevel: '3',
    placement: 'bottom-start',
    modal: false,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: uncontrolled,
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
    heading: undefined,
    headingLevel: '3',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: uncontrolled,
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
    headingLevel: '3',
    placement: 'bottom',
    modal: true,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: uncontrolled,
};

export const ContextualHelp: Story = {
  args: {
    trigger: <Button label="Help" variant="ghost" iconOnly leadingIcon={<Icon name="info" inline />} />,
    children: (
      <Text size="sm">
        Filters apply to every view in this project. <Link href="#" label="Read the guide" />
      </Text>
    ),
    heading: undefined,
    headingLevel: '3',
    placement: 'end',
    modal: false,
    showArrow: true,
    dismissible: true,
    open: undefined,
  },
  render: uncontrolled,
};

/** Open with its trigger and three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    children: (
      <Stack gap="normal">
        <Button label="7 days" variant="secondary" size="sm" />
        <Button label="30 days" variant="secondary" size="sm" />
        <Button label="90 days" variant="secondary" size="sm" />
      </Stack>
    ),
  },
  render: controlled,
};
