import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Breadcrumb.js';
import type { BreadcrumbItem, BreadcrumbNavigateDetail } from './Breadcrumb.js';

interface BreadcrumbArgs {
  items: BreadcrumbItem[];
  label: string;
  collapse: boolean;
}

const shortTrail: BreadcrumbItem[] = [
  { label: 'Docs', href: '#docs' },
  { label: 'Components', href: '#components' },
  { label: 'Breadcrumb' },
];

const longTrail: BreadcrumbItem[] = [
  { label: 'Catalogue', href: '#catalogue' },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Storage', href: '#storage' },
  { label: 'Solid state', href: '#ssd' },
  { label: 'NVMe', href: '#nvme' },
  { label: '2 TB' },
];

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
    items: shortTrail,
    label: 'Breadcrumb',
    collapse: true,
  },
  render: (args) => html`
    <ds-breadcrumb
      .items=${args.items}
      label=${args.label}
      ?collapse=${args.collapse}
      @navigate=${(event: CustomEvent<BreadcrumbNavigateDetail>) => event.detail.originalEvent.preventDefault()}
    ></ds-breadcrumb>
  `,
};

export default meta;
type Story = StoryObj<BreadcrumbArgs>;

export const Default: Story = {};

/* boolean states */
export const CollapseTrue: Story = { args: { items: longTrail, collapse: true } };
export const CollapseFalse: Story = { args: { items: longTrail, collapse: false } };

export const TwoLevels: Story = {
  args: { items: [{ label: 'Settings', href: '#settings' }, { label: 'Notifications' }] },
};

export const CustomLabel: Story = {
  args: { label: 'Catalogue location', items: longTrail },
};
