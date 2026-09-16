import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Text.js';
import type { TextAlign, TextElement, TextSize, TextTone, TextWeight } from './Text.js';

interface TextArgs {
  size: TextSize;
  weight: TextWeight;
  tone: TextTone;
  align: TextAlign;
  truncate: boolean;
  element: TextElement;
  text: string;
}

function renderText(args: TextArgs): TemplateResult {
  return html`
    <ds-text
      size=${args.size}
      weight=${args.weight}
      tone=${args.tone}
      align=${args.align}
      ?truncate=${args.truncate}
      .element=${args.element}
      >${args.text}</ds-text
    >
  `;
}

const meta: Meta<TextArgs> = {
  title: 'Text/Lit',
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    weight: { control: 'select', options: ['regular', 'medium', 'semibold', 'bold'] },
    tone: { control: 'select', options: ['default', 'strong', 'muted', 'danger', 'onAction'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    truncate: { control: 'boolean' },
    element: { control: 'select', options: ['p', 'span'] },
  },
  args: {
    size: 'md',
    weight: 'regular',
    tone: 'default',
    align: 'start',
    truncate: false,
    element: 'p',
    text: 'Changes are saved automatically. You can undo any change for 30 days.',
  },
  render: renderText,
};

export default meta;
type Story = StoryObj<TextArgs>;

export const Default: Story = {};

/* size */
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeXl: Story = { args: { size: 'xl' } };

/* weight */
export const WeightRegular: Story = { args: { weight: 'regular' } };
export const WeightMedium: Story = { args: { weight: 'medium' } };
export const WeightSemibold: Story = { args: { weight: 'semibold' } };
export const WeightBold: Story = { args: { weight: 'bold' } };

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneStrong: Story = { args: { tone: 'strong' } };
export const ToneMuted: Story = { args: { tone: 'muted' } };
export const ToneDanger: Story = {
  args: { tone: 'danger', text: 'Error: enter an email address like name@example.com' },
};
export const ToneOnAction: Story = {
  args: { tone: 'onAction', text: 'Text on an action background' },
  render: (args) => html`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">${renderText(args)}</div>
  `,
};

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };

/* element */
export const ElementP: Story = { args: { element: 'p' } };
export const ElementSpan: Story = { args: { element: 'span' } };

/* examples from the component doc */

/** The default paragraph — body size, regular weight, default tone. */
export const BodyCopy: Story = {
  args: { text: 'Changes are saved automatically. You can undo any change for 30 days.' },
};

/** Secondary metadata at the smallest readable size, muted so it sits behind the content it annotates. */
export const Caption: Story = {
  args: { text: 'Last updated 2 minutes ago.', size: 'xs', tone: 'muted' },
};

/** Error copy where the danger tone is paired with explicit words, so color alone never carries the meaning. */
export const InlineErrorWording: Story = {
  args: { text: 'Error: enter an email address like name@example.com', tone: 'danger', element: 'span' },
};

/** One line of text in a dense cell, with the full string still reachable. */
export const TruncatedCell: Story = {
  args: { text: 'Quarterly revenue summary for the EMEA region.', truncate: true },
  render: (args) => html`<div style="max-inline-size: 16rem">${renderText(args)}</div>`,
};
