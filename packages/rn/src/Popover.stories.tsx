import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Input } from './Input';
import { Link } from './Link';
import { Popover } from './Popover';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Popover> = {
  title: 'Popover/React Native',
  component: Popover,
  decorators: [withTheme({ fit: true })],
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    heading: 'Filters',
    children: <Text>Filter results by status and date.</Text>,
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {};

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

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
export const Modal: Story = { args: { modal: true, open: true } };
export const ShowArrow: Story = { args: { showArrow: true, open: true } };
export const NotDismissible: Story = { args: { dismissible: false, open: true } };
export const NoHeading: Story = { args: { heading: undefined, open: true } };

export const WithOverrides: Story = {
  args: {
    open: true,
    overrides: { radius: 'radius.full', border: 'color.border.strong' },
  },
};

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return (
        <Popover
          {...args}
          trigger={<Button label="Filters" variant="secondary" />}
          open={open}
          onOpenChange={(next) => setOpen(next)}
        >
          <Stack gap="normal" align="start">
            <Input label="Search" name="search" />
            <Link href="https://example.com/filters" label="Reset filters" />
            <Button label="Apply" onPress={() => setOpen(false)} />
          </Stack>
        </Popover>
      );
    }
    return <Open />;
  },
};
