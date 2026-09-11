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
    role: 'main',
    label: undefined,
  },
  render: (args) => (
    <Landmark {...args}>
      <Heading level={2} size="lg">
        {args.label ?? args.role}
      </Heading>
      <Text tone="muted">Landmark has no visual bindings; it only gives this region a role and a name.</Text>
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
