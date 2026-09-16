import { useEffect, useState, type ComponentProps, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidePanel } from './SidePanel';
import { Button } from './Button';
import { Card } from './Card';
import { Checkbox } from './Checkbox';
import { Icon } from './Icon';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';

type SidePanelArgs = ComponentProps<typeof SidePanel>;

/** Mirrors `open` into local state so a story given `open: true` still closes when the panel asks. */
function StatefulSidePanel(args: SidePanelArgs): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>(args.open);
  useEffect(() => setOpen(args.open), [args.open]);
  if (open === undefined) return <SidePanel {...args} />;
  return (
    <SidePanel
      {...args}
      open={open}
      onOpenChange={(next, reason) => {
        setOpen(next);
        args.onOpenChange?.(next, reason);
      }}
    />
  );
}

const menuTrigger = <Button variant="ghost" iconOnly label="Menu" leadingIcon={<Icon name="menu" inline />} />;

const navigationLinks = (
  <Stack gap="tight">
    <Link href="#dashboard" label="Dashboard" aria-current="page" />
    <Link href="#projects" label="Projects" />
    <Link href="#settings" label="Settings" />
  </Stack>
);

const meta: Meta<typeof SidePanel> = {
  title: 'SidePanel/React',
  component: SidePanel,
  render: (args) => <StatefulSidePanel {...args} />,
  args: {
    trigger: menuTrigger,
    heading: 'Menu',
    children: navigationLinks,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* side */
export const SideStart: Story = { args: { side: 'start' } };
export const SideEnd: Story = { args: { side: 'end' } };

/* width */
export const WidthNarrow: Story = { args: { width: 'narrow' } };
export const WidthDefault: Story = { args: { width: 'default' } };
export const WidthWide: Story = { args: { width: 'wide' } };

/* persistent */
export const PersistentNever: Story = { args: { persistent: 'never' } };
export const PersistentContent: Story = { args: { persistent: 'content' } };
export const PersistentPage: Story = { args: { persistent: 'page' } };

/* role */
export const RoleComplementary: Story = { args: { role: 'complementary' } };
export const RoleNavigation: Story = { args: { role: 'navigation' } };

/* notable states */
export const Open: Story = { args: { open: true } };
export const Modal: Story = { args: { open: true, modal: true } };
export const NoScrim: Story = { args: { open: true, scrim: false } };
export const NotDismissible: Story = { args: { open: true, dismissible: false } };
export const HiddenHeading: Story = { args: { open: true, hideHeading: true } };

/* examples */
export const NavigationDrawer: Story = {
  args: {
    trigger: menuTrigger,
    heading: 'Menu',
    children: navigationLinks,
    hideHeading: true,
    role: 'navigation',
    persistent: 'content',
  },
};

export const Filters: Story = {
  args: {
    trigger: <Button variant="secondary" label="Filters" />,
    heading: 'Filters',
    children: (
      <Stack gap="normal">
        <Checkbox name="in-stock" label="In stock" />
        <Checkbox name="free-shipping" label="Free shipping" />
        <Checkbox name="on-sale" label="On sale" />
      </Stack>
    ),
    footer: (
      <>
        <Button variant="secondary" label="Clear" />
        <Button variant="primary" label="Apply" />
      </>
    ),
    width: 'wide',
  },
};

export const Cart: Story = {
  args: {
    open: true,
    heading: 'Your cart',
    children: (
      <Stack gap="normal">
        <Card heading="Linen shirt">
          <Text>1 × $48.00</Text>
        </Card>
        <Card heading="Canvas tote">
          <Text>2 × $22.00</Text>
        </Card>
      </Stack>
    ),
    footer: <Button variant="primary" label="Checkout" />,
    side: 'end',
    modal: true,
  },
};

export const DetailPanel: Story = {
  args: {
    open: true,
    heading: 'Order details',
    children: (
      <Stack gap="tight">
        <Text tone="muted">Order</Text>
        <Text>#10482</Text>
        <Text tone="muted">Status</Text>
        <Text>Shipped</Text>
      </Stack>
    ),
    side: 'end',
    width: 'narrow',
    scrim: false,
  },
};

/** Open with its trigger and three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    children: navigationLinks,
  },
};
