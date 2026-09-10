import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
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
