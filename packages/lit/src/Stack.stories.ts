import type { Decorator, Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Stack.js';
import './Box.js';
import './Button.js';
import './Input.js';
import './Text.js';
import type { StackAlign, StackDirection, StackElement, StackGap, StackJustify } from './Stack.js';

interface StackArgs {
  direction: StackDirection;
  gap: StackGap;
  align: StackAlign;
  justify: StackJustify;
  wrap: boolean;
  element: StackElement;
}

/* A container capped at `layout.maxWidth.prose × 0.5`, narrow enough that the eight filters wrap in every theme (`Wrap`, `WrappingFilters`). */
const proseWidth: Decorator = (story) =>
  html`<div style="max-inline-size: calc(var(--layout-max-width-prose) * 0.5)">${story()}</div>`;

/* Three Text children, per the doc. Story scaffolding, not copy. */
const items: TemplateResult = html`
  <ds-text>First item</ds-text>
  <ds-text>Second item</ds-text>
  <ds-text>Third item</ds-text>
`;

/* A row of filters: eight small secondary Buttons, per the doc. Story scaffolding, not copy. */
const filters: TemplateResult[] = ['All', 'Open', 'Closed', 'Mine', 'Unassigned', 'Urgent', 'This week', 'Archived'].map(
  (label) => html`<ds-button variant="secondary" size="sm" label=${label}></ds-button>`,
);

const meta: Meta<StackArgs> = {
  title: 'Stack/Lit',
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: ['none', 'tight', 'normal', 'loose', 'section'] },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch'] },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between'] },
    wrap: { control: 'boolean' },
    element: { control: 'select', options: ['div', 'section', 'nav', 'ul', 'ol'] },
  },
  args: {
    direction: 'vertical',
    gap: 'normal',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    element: 'div',
  },
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      ${items}
    </ds-stack>
  `,
};

export default meta;
type Story = StoryObj<StackArgs>;

export const Default: Story = {};

/* direction */
export const DirectionVertical: Story = { args: { direction: 'vertical' } };
export const DirectionHorizontal: Story = { args: { direction: 'horizontal', align: 'start' } };

/* gap */
export const GapNone: Story = { args: { gap: 'none' } };
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };
export const GapSection: Story = { args: { gap: 'section' } };

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
export const AlignStretch: Story = { args: { align: 'stretch' } };

/* justify: horizontal, so the main axis has room for the value to show */
export const JustifyStart: Story = { args: { direction: 'horizontal', align: 'start', justify: 'start' } };
export const JustifyCenter: Story = { args: { direction: 'horizontal', align: 'start', justify: 'center' } };
export const JustifyEnd: Story = { args: { direction: 'horizontal', align: 'start', justify: 'end' } };
export const JustifyBetween: Story = { args: { direction: 'horizontal', align: 'start', justify: 'between' } };

/* wrap */
export const Wrap: Story = {
  args: { direction: 'horizontal', align: 'start', wrap: true },
  decorators: [proseWidth],
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      ${filters}
    </ds-stack>
  `,
};

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementNav: Story = { args: { element: 'nav', direction: 'horizontal', align: 'start' } };
export const ElementUl: Story = { args: { element: 'ul' } };
export const ElementOl: Story = { args: { element: 'ol' } };

/* examples from the component doc */

/** The usual vertical rhythm between fields in a form. */
export const FormFields: Story = {
  args: { direction: 'vertical', gap: 'normal' },
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      <ds-input label="Full name" name="name" type="text"></ds-input>
      <ds-input label="Email" name="email" type="email"></ds-input>
      <ds-input label="Password" name="password" type="password"></ds-input>
    </ds-stack>
  `,
};

/** A row of actions at the end of a form or card, tightly spaced and pushed to the end. */
export const ButtonRow: Story = {
  args: { direction: 'horizontal', gap: 'tight', justify: 'end', align: 'center' },
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      <ds-button variant="secondary" label="Cancel"></ds-button>
      <ds-button type="submit" label="Submit"></ds-button>
    </ds-stack>
  `,
};

/** The section rhythm between the regions of a page. */
export const PageSections: Story = {
  args: { direction: 'vertical', gap: 'section' },
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      <ds-box surface="subtle" inset="md"><ds-text>Summary</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>Details</ds-text></ds-box>
      <ds-box surface="subtle" inset="md"><ds-text>History</ds-text></ds-box>
    </ds-stack>
  `,
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  args: { direction: 'horizontal', gap: 'tight', wrap: true, align: 'center' },
  decorators: [proseWidth],
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      element=${args.element}
    >
      ${filters}
    </ds-stack>
  `,
};
