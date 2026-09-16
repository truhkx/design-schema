import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Breadcrumb.js';
import type { BreadcrumbItem, BreadcrumbNavigateDetail } from './Breadcrumb.js';

interface BreadcrumbArgs {
  items: BreadcrumbItem[];
  label: string;
  collapse: boolean;
}

const meta: Meta<BreadcrumbArgs> = {
  title: 'Breadcrumb/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['navigate'] },
  },
  argTypes: {
    collapse: { control: 'boolean' },
  },
  args: {
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Breadcrumb' },
    ],
    label: 'Breadcrumb',
    collapse: true,
  },
  render: (args) => html`
    <ds-breadcrumb
      .items=${args.items}
      label=${args.label}
      ?no-collapse=${!args.collapse}
      @navigate=${(event: CustomEvent<BreadcrumbNavigateDetail>) => event.preventDefault()}
    ></ds-breadcrumb>
  `,
};

export default meta;
type Story = StoryObj<BreadcrumbArgs>;

export const Default: Story = {};

/* examples */
export const SettingsTrail: Story = {
  args: {
    items: [
      { label: 'Settings', href: '/settings' },
      { label: 'Notifications', href: '/settings/notifications' },
      { label: 'Email digest' },
    ],
  },
};

export const DeepTrailCollapsed: Story = {
  args: {
    collapse: true,
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Components', href: '/docs/components' },
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
      { label: 'Keyboard' },
    ],
  },
};

export const AlwaysInFull: Story = {
  args: {
    collapse: false,
    items: [
      { label: 'Catalogue', href: '/catalogue' },
      { label: 'Outdoor', href: '/catalogue/outdoor' },
      { label: 'Tents' },
    ],
  },
};

export const SecondBreadcrumbOnAPage: Story = {
  args: {
    label: 'Catalogue breadcrumb',
    items: [{ label: 'Catalogue', href: '/catalogue' }, { label: 'Tents' }],
  },
};
