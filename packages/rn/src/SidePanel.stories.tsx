import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonProps } from './Button';
import type { SidePanelProps } from './SidePanel';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { Link } from './Link';
import { SidePanel } from './SidePanel';
import { Stack } from './Stack';
import { Text } from './Text';
import { useTheme } from './theme';
import { withTheme } from './decorators';

/**
 * Acts as the consumer: with an `open` arg it owns `open`, starting from the arg, and writes
 * `onOpenChange` back; without one the panel is uncontrolled and its trigger opens it.
 */
function Controlled(args: SidePanelProps): React.JSX.Element {
  const [open, setOpen] = React.useState(args.open);
  React.useEffect(() => setOpen(args.open), [args.open]);
  return (
    <SidePanel
      {...args}
      open={open}
      onOpenChange={(next, reason) => {
        if (open !== undefined) {
          setOpen(next);
        }
        args.onOpenChange?.(next, reason);
      }}
    />
  );
}

/** The icon-only `menu` trigger. It forwards the props SidePanel clones onto it (`onPress`, `expanded`). */
function MenuTrigger(props: Partial<ButtonProps>): React.JSX.Element {
  const { tokens: t } = useTheme();
  return (
    <Button
      {...props}
      label="Menu"
      variant="ghost"
      iconOnly
      leadingIcon={<Icon name="menu" color={t.colorActionGhostForeground} />}
    />
  );
}

const navLinks = (
  <Stack gap="tight" align="start">
    <Link href="#" label="Home" current />
    <Link href="#" label="Products" />
    <Link href="#" label="About" />
  </Stack>
);

const meta: Meta<typeof SidePanel> = {
  title: 'SidePanel/React Native',
  component: SidePanel,
  decorators: [withTheme()],
  render: (args) => <Controlled {...args} />,
  // The resting state: closed behind its trigger, uncontrolled.
  args: {
    trigger: <MenuTrigger />,
    heading: 'Menu',
    children: navLinks,
    side: 'start',
    width: 'default',
    persistent: 'never',
    role: 'complementary',
    modal: false,
    scrim: true,
    dismissible: true,
    swipeable: true,
    hideHeading: false,
  },
};

export default meta;

type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {};

// side
export const SideStart: Story = { args: { side: 'start' } };
export const SideEnd: Story = { args: { side: 'end' } };

// width
export const WidthNarrow: Story = { args: { width: 'narrow' } };
export const WidthDefault: Story = { args: { width: 'default' } };
export const WidthWide: Story = { args: { width: 'wide' } };

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
export const HideHeading: Story = { args: { hideHeading: true } };
export const WithOverrides: Story = {
  args: { overrides: { width: 'layout.maxWidth.content', partGap: 'layout.gap.normal' } },
};

// examples — each restates its `given` and the defaults it relies on, as if from blank args.

/** The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list. */
export const NavigationDrawer: Story = {
  args: {
    open: undefined,
    trigger: <MenuTrigger />,
    heading: 'Menu',
    children: navLinks,
    footer: undefined,
    hideHeading: true,
    role: 'navigation',
    persistent: 'content',
    side: 'start',
    width: 'default',
    modal: false,
    scrim: true,
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
    hideHeading: false,
    role: 'complementary',
    persistent: 'never',
    side: 'start',
    modal: false,
    scrim: true,
  },
};

/** A checkout panel from the end edge that must be finished or dismissed, so it is modal. */
export const Cart: Story = {
  args: {
    open: true,
    trigger: undefined,
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
    width: 'default',
    persistent: 'never',
    hideHeading: false,
    scrim: true,
  },
};

/** A narrow detail panel that should feel like part of the page, so it has no scrim. */
export const DetailPanel: Story = {
  args: {
    open: true,
    trigger: undefined,
    heading: 'Order details',
    children: (
      <Stack gap="tight">
        <Text>Order: 10482</Text>
        <Text>Status: Shipped</Text>
        <Text>Total: $72.00</Text>
      </Stack>
    ),
    footer: undefined,
    side: 'end',
    width: 'narrow',
    scrim: false,
    modal: false,
    persistent: 'never',
    hideHeading: false,
  },
};

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return (
        <SidePanel {...args} trigger={<MenuTrigger />} open={open} onOpenChange={(next) => setOpen(next)}>
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
