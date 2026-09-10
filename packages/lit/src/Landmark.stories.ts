import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Landmark.js';
import './Heading.js';
import './Text.js';
import './Stack.js';
import './Link.js';
import type { LandmarkRole } from './Landmark.js';

interface LandmarkArgs {
  role: LandmarkRole;
  label?: string;
}

const meta: Meta<LandmarkArgs> = {
  title: 'Landmark/Lit',
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'],
    },
  },
  args: {
    role: 'region',
    label: 'Related articles',
  },
  render: (args) => html`
    <ds-landmark role=${args.role} .label=${args.label}>
      <ds-stack gap="2">
        <ds-heading level="2">${args.label ?? args.role}</ds-heading>
        <ds-text tone="muted"
          >This element is a <code>${args.role}</code> landmark with no shadow root; inspect it to see
          the role and name on the host.</ds-text
        >
      </ds-stack>
    </ds-landmark>
  `,
};

export default meta;
type Story = StoryObj<LandmarkArgs>;

export const Default: Story = {};

/* role */
export const RoleBanner: Story = { args: { role: 'banner', label: undefined } };
export const RoleNavigation: Story = {
  args: { role: 'navigation', label: 'Main' },
  render: (args) => html`
    <ds-landmark role=${args.role} .label=${args.label}>
      <ds-stack element="ul" direction="horizontal" gap="4">
        <ds-link href="#docs" label="Docs"></ds-link>
        <ds-link href="#pricing" label="Pricing"></ds-link>
        <ds-link href="#changelog" label="Changelog"></ds-link>
      </ds-stack>
    </ds-landmark>
  `,
};
export const RoleMain: Story = { args: { role: 'main', label: undefined } };
export const RoleComplementary: Story = { args: { role: 'complementary', label: 'Related' } };
export const RoleContentinfo: Story = { args: { role: 'contentinfo', label: undefined } };
export const RoleRegion: Story = { args: { role: 'region', label: 'Related articles' } };
export const RoleSearch: Story = { args: { role: 'search', label: undefined } };
export const RoleForm: Story = { args: { role: 'form', label: 'Newsletter' } };

export const PageStructure: Story = {
  render: () => html`
    <ds-stack gap="4">
      <ds-landmark role="banner">
        <ds-text weight="semibold">Acme Console</ds-text>
      </ds-landmark>
      <ds-landmark role="navigation" aria-label="Main">
        <ds-stack element="ul" direction="horizontal" gap="4">
          <ds-link href="#overview" label="Overview"></ds-link>
          <ds-link href="#settings" label="Settings"></ds-link>
        </ds-stack>
      </ds-landmark>
      <ds-landmark role="main">
        <ds-heading level="1">Overview</ds-heading>
        <ds-text>Main content of the page.</ds-text>
      </ds-landmark>
      <ds-landmark role="complementary" aria-label="Tips">
        <ds-text tone="muted">Press ? for keyboard shortcuts.</ds-text>
      </ds-landmark>
      <ds-landmark role="contentinfo">
        <ds-text size="sm" tone="muted">© Acme</ds-text>
      </ds-landmark>
    </ds-stack>
  `,
};
