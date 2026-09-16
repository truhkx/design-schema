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
    role: 'main',
    children: 'The page content.',
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

/* role */
export const RoleBanner: Story = { args: { role: 'banner' } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main' } };
export const RoleMain: Story = { args: { role: 'main' } };
export const RoleComplementary: Story = { args: { role: 'complementary', label: 'Related' } };
export const RoleContentinfo: Story = { args: { role: 'contentinfo' } };
export const RoleRegion: Story = { args: { role: 'region', label: 'Related articles' } };
export const RoleSearch: Story = { args: { role: 'search' } };
export const RoleForm: Story = { args: { role: 'form', label: 'Newsletter' } };

/* examples */
export const PageMain: Story = { args: { role: 'main', children: 'The page content.' } };
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: 'Footer links.' },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};
