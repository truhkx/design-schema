import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Link> = {
  title: 'Link/React Native',
  component: Link,
  decorators: [withTheme({ fit: true })],
  args: {
    href: 'https://example.com/billing',
    label: 'View the billing history',
    external: false,
    tone: 'default',
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {};

// tone
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneInherit: Story = {
  args: { tone: 'inherit' },
  render: (args) => (
    <Text tone="muted">
      Read the <Link {...args} label="terms of service" /> before you continue.
    </Text>
  ),
};

// examples

/** The default link inside body text, underlined and taking the paragraph's typography. */
export const InlineInAParagraph: Story = {
  args: { href: '/billing/history', label: 'View the billing history' },
  render: (args) => (
    <Text>
      Your plan renews on 1 October. <Link {...args} /> to see past invoices.
    </Text>
  ),
};

/** A link that leaves the product, so the name says so before it is activated. */
export const ExternalDestination: Story = {
  args: { href: 'https://status.example.com', label: 'Status page', external: true },
};

/** A link in muted or on-action text, where the color is inherited and the underline alone marks it. */
export const InsideMutedText: Story = {
  args: { href: '/help/billing', label: 'the billing guide', tone: 'inherit' },
  render: (args) => (
    <Text tone="muted">
      For refunds, read <Link {...args} /> first.
    </Text>
  ),
};
