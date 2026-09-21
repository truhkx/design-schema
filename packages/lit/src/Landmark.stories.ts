import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Landmark.js';
import './Text.js';
import './Heading.js';
import './Stack.js';
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

/*
 * role — banner, main, contentinfo, complementary and search carry no label here, so no story
 * models a label on a role that refuses it or trips the missing-label warning by accident.
 */
export const RoleBanner: Story = { args: { role: 'banner', label: undefined, children: 'Site header' } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main' } };
export const RoleMain: Story = { args: { role: 'main', label: undefined, children: 'Page content' } };
export const RoleComplementary: Story = {
  args: { role: 'complementary', label: undefined, children: 'Sidebar content' },
};
export const RoleContentinfo: Story = { args: { role: 'contentinfo', label: undefined, children: 'Site footer' } };
export const RoleRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'Section content' },
};
export const RoleSearch: Story = { args: { role: 'search', label: undefined, children: 'Search form' } };
export const RoleForm: Story = { args: { role: 'form', label: 'Sign in', children: 'Form fields' } };

/* examples */
export const PageMain: Story = { args: { role: 'main', label: undefined, children: 'The page content.' } };
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: 'Footer links.' },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: 'A list of related articles.' },
};

/* a page skeleton: one of each, with two labelled navigations. */
export const PageSkeleton: Story = {
  render: () => html`
    <ds-stack gap="section">
      <ds-landmark role="banner">
        <ds-landmark role="navigation" aria-label="Main">
          <ds-text>Main navigation</ds-text>
        </ds-landmark>
      </ds-landmark>
      <ds-landmark role="main">
        <ds-heading level="1">Notifications</ds-heading>
      </ds-landmark>
      <ds-landmark role="complementary" aria-label="Help">
        <ds-text>Help panel</ds-text>
      </ds-landmark>
      <ds-landmark role="contentinfo">
        <ds-landmark role="navigation" aria-label="Footer">
          <ds-text>Footer navigation</ds-text>
        </ds-landmark>
      </ds-landmark>
    </ds-stack>
  `,
};
