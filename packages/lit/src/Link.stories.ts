import type { Meta, StoryObj } from '@storybook/web-components';
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
  },
  args: {
    href: '#billing',
    label: 'View the billing history',
    external: false,
    tone: 'default',
    download: false,
  },
  render: (args) => html`
    <ds-link
      href=${args.href}
      label=${args.label}
      tone=${args.tone}
      ?external=${args.external}
      ?download=${args.download}
    ></ds-link>
  `,
};

export default meta;
type Story = StoryObj<LinkArgs>;

export const Default: Story = {};

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneInherit: Story = {
  args: { tone: 'inherit' },
  render: (args) => html`
    <ds-text tone="muted"
      >Your trial ends in 3 days.
      <ds-link
        href=${args.href}
        label="Compare plans"
        tone=${args.tone}
        ?external=${args.external}
        ?download=${args.download}
      ></ds-link
      >.</ds-text
    >
  `,
};

/* boolean states */
export const ExternalTrue: Story = {
  args: { external: true, href: 'https://www.w3.org/WAI/ARIA/apg/', label: 'ARIA Authoring Practices Guide' },
};
export const DownloadTrue: Story = {
  args: { download: true, href: '/invoice-2026-09.pdf', label: 'Download invoice (PDF)' },
};

export const Inline: Story = {
  render: (args) => html`
    <ds-text
      >Screen-reader users navigate by pulling up a list of links, so
      <ds-link href=${args.href} label="link text should describe the destination"></ds-link>
      and make sense out of context.</ds-text
    >
  `,
};
