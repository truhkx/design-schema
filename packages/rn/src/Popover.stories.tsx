import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Form } from './Form';
import { Icon } from './Icon';
import { Input } from './Input';
import { Link } from './Link';
import { Popover } from './Popover';
import type { PopoverProps } from './Popover';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';
import { useTheme } from './theme';

const meta: Meta<typeof Popover> = {
  title: 'Popover/React Native',
  component: Popover,
  decorators: [withTheme({ fit: true })],
  // The filter-panel example's args.
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: (
      <Form actions={<Button label="Apply" type="submit" />}>
        <Checkbox label="Open" name="open" />
        <Checkbox label="Closed" name="closed" />
      </Form>
    ),
    heading: 'Filters',
    placement: 'bottom-start',
    headingLevel: '3',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

/** Acts as the consumer: owns `open`, starting true, and writes `onOpenChange` back into it. */
function OpenPopover(props: PopoverProps): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  return (
    <Popover
      {...props}
      open={open}
      onOpenChange={(next, reason) => {
        setOpen(next);
        props.onOpenChange?.(next, reason);
      }}
    />
  );
}

const renderOpen: Story['render'] = (args) => <OpenPopover {...(args as PopoverProps)} />;

export const Default: Story = { render: renderOpen };

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' }, render: renderOpen };
export const HeadingLevel3: Story = { args: { headingLevel: '3' }, render: renderOpen };
export const HeadingLevel4: Story = { args: { headingLevel: '4' }, render: renderOpen };

// placement
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

// notable states
export const Modal: Story = { args: { modal: true }, render: renderOpen };
export const ShowArrow: Story = { args: { showArrow: true }, render: renderOpen };
export const NotDismissible: Story = { args: { dismissible: false }, render: renderOpen };
export const NoHeading: Story = { args: { heading: undefined }, render: renderOpen };

// examples
export const FilterPanel: Story = {
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: (
      <Form actions={<Button label="Apply" type="submit" />}>
        <Checkbox label="Open" name="open" />
        <Checkbox label="Closed" name="closed" />
      </Form>
    ),
    heading: 'Filters',
    placement: 'bottom-start',
  },
};

function CalendarIcon(): React.JSX.Element {
  const { tokens: t } = useTheme();
  return <Icon name="calendar" color={t.colorActionSecondaryForeground} />;
}

export const DatePickerPanel: Story = {
  args: {
    trigger: <Button label="17 September 2026" variant="secondary" leadingIcon={<CalendarIcon />} />,
    children: (
      <Stack gap="tight" align="start">
        <Button label="Today" variant="ghost" />
        <Button label="Tomorrow" variant="ghost" />
        <Button label="Next week" variant="ghost" />
      </Stack>
    ),
    heading: undefined,
  },
};

export const RequiredStep: Story = {
  args: {
    trigger: <Button label="Add member" />,
    children: (
      <Stack gap="normal" align="start">
        <Input label="Email" name="email" type="email" />
        <Button label="Save" />
      </Stack>
    ),
    heading: 'Add member',
    modal: true,
  },
};

function HelpIcon(): React.JSX.Element {
  const { tokens: t } = useTheme();
  return <Icon name="info" color={t.colorActionGhostForeground} />;
}

export const ContextualHelp: Story = {
  args: {
    trigger: <Button label="Help" variant="ghost" iconOnly leadingIcon={<HelpIcon />} />,
    children: (
      <Text>
        Filters apply to every view in this project. <Link href="https://example.com/guide" label="Read the guide" />
      </Text>
    ),
    heading: undefined,
    showArrow: true,
    placement: 'end',
  },
};

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. Accepts `modal` as an arg. */
export const Keyboard: Story = {
  args: {
    modal: false,
    children: (
      <Stack gap="normal" align="start">
        <Input label="Search" name="search" />
        <Link href="https://example.com/filters" label="Reset filters" />
        <Button label="Apply" />
      </Stack>
    ),
  },
  render: renderOpen,
};
