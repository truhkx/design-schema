import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';
import { Landmark } from './Landmark';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Landmark> = {
  title: 'Landmark/React Native',
  component: Landmark,
  decorators: [withTheme()],
  args: {
    role: 'navigation',
    label: undefined,
  },
  render: ({ children, ...args }) => (
    <Landmark {...args}>
      {children === undefined ? (
        <>
          <Heading level={2} size="lg">
            {args.label ?? args.role}
          </Heading>
          <Text tone="muted">Landmark has no visual bindings; it only gives this region a role and a name.</Text>
        </>
      ) : typeof children === 'string' ? (
        // A raw string cannot be a View child on native.
        <Text>{children}</Text>
      ) : (
        children
      )}
    </Landmark>
  ),
};

export default meta;

type Story = StoryObj<typeof Landmark>;

export const Default: Story = {};

// role
export const RoleBanner: Story = { args: { role: 'banner' } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main' } };
export const RoleMain: Story = { args: { role: 'main' } };
export const RoleComplementary: Story = { args: { role: 'complementary' } };
export const RoleContentinfo: Story = { args: { role: 'contentinfo' } };
export const RoleRegion: Story = { args: { role: 'region', label: 'Related articles' } };
export const RoleSearch: Story = { args: { role: 'search' } };
export const RoleForm: Story = { args: { role: 'form', label: 'Sign in' } };

// examples
export const PageMain: Story = { args: { role: 'main', children: 'The page content.' } };
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: 'Footer links.' },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};
