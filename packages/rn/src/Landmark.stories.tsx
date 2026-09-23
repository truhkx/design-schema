import type { Meta, StoryObj } from '@storybook/react-vite';
import { Landmark } from './Landmark';
import { withTheme } from './decorators';

const meta: Meta<typeof Landmark> = {
  title: 'Landmark/React Native',
  component: Landmark,
  decorators: [withTheme()],
  // Landmark wraps string children in the package Text itself.
  args: {
    role: 'navigation',
    label: 'Main',
    children: 'Primary links.',
  },
};

export default meta;

type Story = StoryObj<typeof Landmark>;

export const Default: Story = {};

// role
export const RoleBanner: Story = { args: { role: 'banner', label: undefined } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Primary' } };
export const RoleMain: Story = { args: { role: 'main', label: undefined } };
// complementary and search drop the label on React Native; it is kept for parity with web.
export const RoleComplementary: Story = { args: { role: 'complementary', label: 'Related links' } };
export const RoleContentinfo: Story = { args: { role: 'contentinfo', label: undefined } };
export const RoleRegion: Story = { args: { role: 'region', label: 'Related articles' } };
export const RoleSearch: Story = { args: { role: 'search', label: 'Site search' } };
export const RoleForm: Story = { args: { role: 'form', label: 'Sign in' } };

// examples
export const PageMain: Story = { args: { role: 'main', label: undefined, children: 'The page content.' } };
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: 'Footer links.' },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};
