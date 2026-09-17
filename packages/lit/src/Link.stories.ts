import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Link.js';
import './Text.js';
import type { LinkTone } from './Link.js';

interface LinkArgs {
  href: string;
  label: string;
  external: boolean;
  tone: LinkTone;
  download: boolean;
}

const link = (args: LinkArgs): TemplateResult => html`<ds-link
  href=${args.href}
  label=${args.label}
  tone=${args.tone}
  ?external=${args.external}
  ?download=${args.download}
></ds-link>`;

const meta: Meta<LinkArgs> = {
  title: 'Link/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['click'] },
  },
  argTypes: {
    tone: { control: 'select', options: ['default', 'inherit'] },
    external: { control: 'boolean' },
    download: { control: 'boolean' },
  },
  args: {
    href: '#billing',
    label: 'View the billing history',
    external: false,
    tone: 'default',
    download: false,
  },
  render: link,
};

export default meta;
type Story = StoryObj<LinkArgs>;

export const Default: Story = {};

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneInherit: Story = {
  args: { tone: 'inherit' },
  render: (args) => html`<ds-text tone="muted">See ${link(args)}.</ds-text>`,
};

/* examples */
export const InlineInAParagraph: Story = {
  args: { href: '/billing/history', label: 'View the billing history' },
  render: (args) => html`<ds-text>Invoices from the last twelve months are kept. ${link(args)}.</ds-text>`,
};

export const ExternalDestination: Story = {
  args: { href: 'https://status.example.com', label: 'Status page', external: true },
};

export const InsideMutedText: Story = {
  args: { href: '/help/billing', label: 'the billing guide', tone: 'inherit' },
  render: (args) => html`<ds-text tone="muted">For how charges are calculated, read ${link(args)}.</ds-text>`,
};

export const DownloadableFile: Story = {
  args: { href: '/invoices/2026-09.pdf', label: 'Download the September invoice', download: true },
};
