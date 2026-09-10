import type { Meta, StoryObj } from '@storybook/react';
import { SidePanel } from './SidePanel';
import { Button } from './Button';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';

const defaultBody = (
  <Stack element="nav" gap="tight">
    <Link href="#" label="Dashboard" />
    <Link href="#" label="Projects" />
    <Link href="#" label="Settings" />
  </Stack>
);

const meta = {
  title: 'SidePanel/React',
  component: SidePanel,
  args: {
    trigger: <Button label="Open menu" variant="secondary" />,
    title: 'Menu',
    hideTitle: false,
    children: defaultBody,
    side: 'start',
    width: 'default',
    persistent: 'never',
    modal: false,
    scrim: true,
    dismissible: true,
    swipeable: true,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* side */
export const SideStart: Story = { args: { side: 'start' } };
export const SideEnd: Story = { args: { side: 'end', trigger: <Button label="Open cart" variant="secondary" />, title: 'Your cart' } };

/* width */
export const WidthNarrow: Story = { args: { width: 'narrow' } };
export const WidthDefault: Story = { args: { width: 'default' } };
export const WidthWide: Story = {
  args: {
    width: 'wide',
    title: 'Filters',
    trigger: <Button label="Filters" variant="secondary" />,
    children: (
      <Stack gap="normal">
        <Text size="sm">Show items updated in the last:</Text>
        <Stack direction="horizontal" gap="tight">
          <Button label="7 days" variant="secondary" size="sm" />
          <Button label="30 days" variant="secondary" size="sm" />
        </Stack>
      </Stack>
    ),
    footer: (
      <>
        <Button label="Apply" variant="primary" size="sm" />
        <Button label="Clear" variant="secondary" size="sm" />
      </>
    ),
  },
};

/* persistent */
export const PersistentNever: Story = { args: { persistent: 'never' } };
export const PersistentContent: Story = { args: { persistent: 'content' } };
export const PersistentPage: Story = { args: { persistent: 'page' } };

/* notable states */
export const ModalTrue: Story = {
  args: {
    modal: true,
    side: 'end',
    title: 'Checkout',
    trigger: <Button label="Checkout" variant="primary" />,
    children: <Text>Review your order before continuing.</Text>,
    footer: <Button label="Continue" variant="primary" size="sm" />,
  },
};

export const ScrimFalse: Story = { args: { scrim: false } };

export const DismissibleFalse: Story = {
  args: {
    dismissible: false,
    swipeable: false,
    children: <Text>Use the trigger or a footer action to close this panel — Escape, the close button, and the scrim are disabled.</Text>,
    footer: <Button label="Done" variant="primary" size="sm" />,
  },
};

export const SwipeableFalse: Story = { args: { swipeable: false } };

export const HideTitleTrue: Story = {
  args: { hideTitle: true, title: 'Navigation' },
};

export const WithoutFooter: Story = { args: { footer: undefined } };

/** Open/present with its trigger and at least three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    children: (
      <Stack element="nav" gap="tight">
        <Link href="#" label="Dashboard" />
        <Link href="#" label="Projects" />
        <Link href="#" label="Settings" />
      </Stack>
    ),
  },
};
