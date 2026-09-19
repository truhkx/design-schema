import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Box.js';
import './Text.js';
import type { TextAlign, TextElement, TextSize, TextTone, TextWeight } from './Text.js';

interface TextArgs {
  size: TextSize;
  weight: TextWeight;
  tone: TextTone;
  align: TextAlign;
  truncate: boolean;
  element: TextElement;
  /** The slotted text content (the doc's `children`). */
  children: string;
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
    children: { control: 'text' },
  },
  args: {
    children: 'Use the email you signed up with.',
    size: 'md',
    weight: 'regular',
    tone: 'default',
    align: 'start',
    truncate: false,
    element: 'p',
  },
  render: (args) => html`<ds-text
    size=${args.size}
    weight=${args.weight}
    tone=${args.tone}
    align=${args.align}
    ?truncate=${args.truncate}
    element=${args.element}
    >${args.children}</ds-text
  >`,
};

export default meta;
type Story = StoryObj<TextArgs>;

/* Story scaffolding, not a binding: a column narrow enough that a truncated line clips. */
const column: NonNullable<Story['decorators']> = [
  (story) => html`<div style="max-inline-size: 24ch">${story()}</div>`,
];

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
  args: { tone: 'danger', children: 'Error: enter an email address like name@example.com.' },
};
/** `onAction` is only for text on an action background, so the story paints color.action.primary.background behind it. */
export const ToneOnAction: Story = {
  args: { tone: 'onAction', children: 'Text on an action background' },
  decorators: [
    (story) => html`<div style="background: var(--color-action-primary-background)">
      <ds-box inset="md">${story()}</ds-box>
    </div>`,
  ],
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
  args: { truncate: true, children: 'A sentence long enough to be clipped by its column.' },
  decorators: column,
};
export const TruncateInline: Story = {
  args: { truncate: true, element: 'span', children: 'A sentence long enough to be clipped by its column.' },
  decorators: column,
};

/* examples from the component doc */

/** The default paragraph - body size, regular weight, default tone. */
export const BodyCopy: Story = {
  args: { children: 'Changes are saved automatically. You can undo any change for 30 days.' },
};

/** Secondary metadata at the smallest readable size, muted so it sits behind the content it annotates. */
export const Caption: Story = {
  args: { children: 'Last updated 2 minutes ago.', size: 'xs', tone: 'muted' },
};

/** Error copy where the danger tone is paired with explicit words, so color alone never carries the meaning. */
export const InlineErrorWording: Story = {
  args: { children: 'Error: enter an email address like name@example.com', tone: 'danger', element: 'span' },
};

/** One line of text in a dense cell, with the full string still reachable (on React Native only to a screen reader; see `truncate`). */
export const TruncatedCell: Story = {
  args: { children: 'Quarterly revenue summary for the EMEA region.', truncate: true },
  decorators: column,
};
