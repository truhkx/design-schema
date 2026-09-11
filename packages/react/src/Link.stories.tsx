import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';
import { Text } from './Text';

const meta: Meta<typeof Link> = {
  title: 'Link/React',
  component: Link,
  args: {
    href: '/billing/history',
    label: 'View the billing history',
    external: false,
    tone: 'default',
    download: false,
  },
  argTypes: {
    onClick: { action: 'onClick' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneInherit: Story = {
  args: { tone: 'inherit', label: 'privacy policy', href: '/privacy' },
  render: (args) => (
    <Text tone="muted" size="sm">
      By continuing you agree to the <Link {...args} />.
    </Text>
  ),
};

/* booleans */
export const External: Story = {
  args: { external: true, href: 'https://example.com/docs', label: 'Example documentation' },
};
export const Download: Story = { args: { download: true, href: '/invoices/2026-09.pdf', label: 'Invoice for September' } };

/* inline in body text */
export const Inline: Story = {
  render: (args) => (
    <Text>
      Your plan renews on 1 October. <Link {...args} /> to see previous charges.
    </Text>
  ),
};
