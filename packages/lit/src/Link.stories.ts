import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Link.js';
import './Text.js';
import type { LinkTone } from './Link.js';

interface LinkArgs {
  href: string;
  label: string;
  external: boolean;
  tone: LinkTone;
  download: boolean;
  current: boolean;
}

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
    current: { control: 'boolean' },
  },
  args: {
    href: '/billing/history',
    label: 'View the billing history',
    external: false,
    tone: 'default',
    download: false,
    current: false,
  },
  render: (args) =>
    html`<ds-link
      href=${args.href}
      label=${args.label}
      tone=${args.tone}
      ?external=${args.external}
      ?download=${args.download}
      ?current=${args.current}
    ></ds-link>`,
};

export default meta;
type Story = StoryObj<LinkArgs>;

export const Default: Story = {};

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };

/** The inherited color is only visible inside muted text, so this uses the same wrapper as InsideMutedText. */
export const ToneInherit: Story = {
  args: { tone: 'inherit' },
  render: (args) =>
    html`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=${args.href}
        label=${args.label}
        tone=${args.tone}
        ?external=${args.external}
        ?download=${args.download}
        ?current=${args.current}
      ></ds-link
      >.</ds-text
    >`,
};

/* examples */
export const InlineInAParagraph: Story = {
  args: { href: '/billing/history', label: 'View the billing history' },
  render: (args) =>
    html`<ds-text
      >Invoices from the last twelve months are kept.
      <ds-link
        href=${args.href}
        label=${args.label}
        tone=${args.tone}
        ?external=${args.external}
        ?download=${args.download}
        ?current=${args.current}
      ></ds-link
      >.</ds-text
    >`,
};

/** The `external` state story; renders standalone. */
export const ExternalDestination: Story = {
  args: { href: 'https://status.example.com', label: 'Status page', external: true },
};

export const InsideMutedText: Story = {
  args: { href: '/help/billing', label: 'the billing guide', tone: 'inherit' },
  render: (args) =>
    html`<ds-text tone="muted"
      >For how charges are calculated, read
      <ds-link
        href=${args.href}
        label=${args.label}
        tone=${args.tone}
        ?external=${args.external}
        ?download=${args.download}
        ?current=${args.current}
      ></ds-link
      >.</ds-text
    >`,
};

/** The `download` state story; renders standalone. */
export const DownloadableFile: Story = {
  args: { href: '/invoices/2026-09.pdf', label: 'Download the September invoice', download: true },
};
