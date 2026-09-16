import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { Link } from './Link';
import { SidePanel } from './SidePanel';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof SidePanel> = {
  title: 'SidePanel/React Native',
  component: SidePanel,
  decorators: [withTheme()],
  args: {
    open: true,
    heading: 'Menu',
    children: (
      <Stack gap="tight" align="start">
        <Link href="#" label="Home" />
        <Link href="#" label="Products" />
        <Link href="#" label="About" />
      </Stack>
    ),
    side: 'start',
    width: 'default',
    persistent: 'never',
    role: 'complementary',
    modal: false,
    scrim: true,
    dismissible: true,
    swipeable: true,
  },
};

export default meta;

type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {};

// side
export const SideStart: Story = { args: { side: 'start' } };
export const SideEnd: Story = { args: { side: 'end', heading: 'Your cart', children: <Text>Cart contents go here.</Text> } };

// width
export const WidthNarrow: Story = { args: { width: 'narrow' } };
export const WidthDefault: Story = { args: { width: 'default' } };
export const WidthWide: Story = {
  args: {
    width: 'wide',
    heading: 'Filters',
    children: <Text>A wider panel for a form of filters.</Text>,
  },
};

// persistent
export const PersistentNever: Story = { args: { persistent: 'never' } };
export const PersistentContent: Story = { args: { persistent: 'content' } };
export const PersistentPage: Story = { args: { persistent: 'page' } };

// role
export const RoleComplementary: Story = { args: { role: 'complementary' } };
export const RoleNavigation: Story = { args: { role: 'navigation' } };

// notable states
export const Modal: Story = { args: { modal: true } };
export const NoScrim: Story = { args: { scrim: false } };
export const NotDismissible: Story = { args: { dismissible: false } };
export const NotSwipeable: Story = { args: { swipeable: false } };
export const HideHeading: Story = {
  args: {
    heading: 'Menu',
    hideHeading: true,
  },
};
export const WithFooter: Story = {
  args: {
    heading: 'Filters',
    children: <Text>Narrow results by price, distance and rating.</Text>,
    footer: (
      <>
        <Button label="Apply" variant="primary" />
        <Button label="Clear" variant="secondary" />
      </>
    ),
  },
};

export const WithOverrides: Story = {
  args: {
    overrides: { width: 'layout.maxWidth.content', scrim: 'color.overlay.scrim' },
  },
};

// examples

/** The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list. */
export const NavigationDrawer: Story = {
  args: {
    open: undefined,
    trigger: <Button label="Menu" variant="ghost" iconOnly leadingIcon={<Icon name="menu" />} />,
    heading: 'Menu',
    children: (
      <Stack gap="tight" align="start">
        <Link href="#" label="Home" />
        <Link href="#" label="Products" />
        <Link href="#" label="About" />
      </Stack>
    ),
    hideHeading: true,
    role: 'navigation',
    persistent: 'content',
  },
};

/** A wide filter panel beside a results page, ending in an action row. */
export const Filters: Story = {
  args: {
    open: undefined,
    trigger: <Button label="Filters" variant="secondary" />,
    heading: 'Filters',
    children: (
      <Stack gap="normal">
        <Checkbox name="inStock" label="In stock" />
        <Checkbox name="freeShipping" label="Free shipping" />
      </Stack>
    ),
    footer: (
      <>
        <Button label="Clear" variant="secondary" />
        <Button label="Apply" variant="primary" />
      </>
    ),
    width: 'wide',
  },
};

/** A checkout panel from the end edge that must be finished or dismissed, so it is modal. */
export const Cart: Story = {
  args: {
    open: true,
    heading: 'Your cart',
    children: (
      <Stack gap="normal">
        <Card heading="Desk lamp">
          <Text>1 × $48.00</Text>
        </Card>
        <Card heading="Notebook">
          <Text>2 × $12.00</Text>
        </Card>
      </Stack>
    ),
    footer: <Button label="Checkout" variant="primary" />,
    side: 'end',
    modal: true,
  },
};

/** A narrow detail panel that should feel like part of the page, so it has no scrim. */
export const DetailPanel: Story = {
  args: {
    open: true,
    heading: 'Order details',
    children: (
      <Stack gap="tight">
        <Text>Order: 10482</Text>
        <Text>Status: Shipped</Text>
        <Text>Total: $72.00</Text>
      </Stack>
    ),
    side: 'end',
    width: 'narrow',
    scrim: false,
  },
};

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return (
        <SidePanel
          {...args}
          trigger={<Button label="Menu" variant="secondary" />}
          open={open}
          onOpenChange={(next) => setOpen(next)}
        >
          <Stack gap="tight" align="start">
            <Link href="#" label="Home" />
            <Link href="#" label="Products" />
            <Button label="Sign out" variant="secondary" onPress={() => setOpen(false)} />
          </Stack>
        </SidePanel>
      );
    }
    return <Open />;
  },
};
