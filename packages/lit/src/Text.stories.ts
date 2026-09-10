import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
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
  render: (args) => html`
    <ds-text
      size=${args.size}
      weight=${args.weight}
      tone=${args.tone}
      align=${args.align}
      ?truncate=${args.truncate}
      .element=${args.element}
      >${args.text}</ds-text
    >
  `,
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
export const ToneDanger: Story = { args: { tone: 'danger', text: 'Error: enter an email address like name@example.com' } };
export const ToneOnAction: Story = {
  args: { tone: 'onAction', text: 'Text on an action background' },
  render: (args) => html`
    <div style="background: var(--color-action-primary-background); padding: var(--space-md)">
      <ds-text size=${args.size} weight=${args.weight} tone=${args.tone} align=${args.align} ?truncate=${args.truncate} .element=${args.element}
        >${args.text}</ds-text
      >
    </div>
  `,
};

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };

/* element */
export const ElementP: Story = { args: { element: 'p' } };
export const ElementSpan: Story = { args: { element: 'span' } };

/* truncate */
export const Truncate: Story = {
  args: { truncate: true },
  render: (args) => html`
    <div style="max-inline-size: 16rem">
      <ds-text size=${args.size} weight=${args.weight} tone=${args.tone} align=${args.align} ?truncate=${args.truncate} .element=${args.element}
        >${args.text}</ds-text
      >
    </div>
  `,
};
