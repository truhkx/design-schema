import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Landmark.js';
import './Text.js';
import type { LandmarkRole } from './Landmark.js';

interface LandmarkArgs {
  role: LandmarkRole;
  label?: string | undefined;
  children?: string | undefined;
}

const meta: Meta<LandmarkArgs> = {
  title: 'Landmark/Lit',
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'],
    },
    label: { control: 'text' },
    children: { control: 'text' },
  },
  args: {
    role: 'navigation',
    label: 'Main',
    children: 'Primary links.',
  },
  render: (args) => html`
    <ds-landmark role=${args.role} .label=${args.label}>
      <ds-text>${args.children}</ds-text>
    </ds-landmark>
  `,
};

export default meta;
type Story = StoryObj<LandmarkArgs>;

export const Default: Story = {};

/* role — banner, main and contentinfo never take a label, so the Default label is cleared. */
export const RoleBanner: Story = { args: { role: 'banner', label: undefined, children: 'Site header' } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main' } };
export const RoleMain: Story = { args: { role: 'main', label: undefined, children: 'The page content.' } };
export const RoleComplementary: Story = {
  args: { role: 'complementary', label: 'Help', children: 'Sidebar content' },
};
export const RoleContentinfo: Story = { args: { role: 'contentinfo', label: undefined, children: 'Site footer' } };
export const RoleRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};
export const RoleSearch: Story = { args: { role: 'search', label: 'Site', children: 'Search form' } };
export const RoleForm: Story = { args: { role: 'form', label: 'Feedback', children: 'Form fields' } };

/* examples */
export const PageMain: Story = { args: { role: 'main', label: undefined, children: 'The page content.' } };
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: 'Footer links.' },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};
