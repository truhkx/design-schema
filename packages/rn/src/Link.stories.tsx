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

/** Appends the external suffix to the accessible name and shows the decorative icon. */
export const External: Story = { args: { external: true, label: 'Status page', href: 'https://status.example.com' } };

/** Inline inside a paragraph of body Text. */
export const Inline: Story = {
  render: (args) => (
    <Text>
      Your plan renews on 1 October. <Link {...args} label="Manage your subscription" /> to change it.
    </Text>
  ),
};
