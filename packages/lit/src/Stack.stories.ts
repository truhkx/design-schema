import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Stack.js';
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

const GAPS: StackGap[] = ['none', 'tight', 'normal', 'loose', 'section'];

/** Stack slots its children, so the content is part of the render, never an arg. */
function renderStack(args: StackArgs, content: TemplateResult): TemplateResult {
  return html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      .element=${args.element}
    >
      ${content}
    </ds-stack>
  `;
}

/** The Default story renders three Text children, per the doc. */
const texts: TemplateResult = html`
  <ds-text>First item</ds-text>
  <ds-text>Second item</ds-text>
  <ds-text>Third item</ds-text>
`;

const meta: Meta<StackArgs> = {
  title: 'Stack/Lit',
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: ['vertical', 'horizontal'] },
    gap: { control: 'select', options: GAPS },
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
  render: (args) => renderStack(args, texts),
};

export default meta;
type Story = StoryObj<StackArgs>;

export const Default: Story = {};

/* direction */
export const DirectionVertical: Story = { args: { direction: 'vertical' } };
export const DirectionHorizontal: Story = { args: { direction: 'horizontal', align: 'center' } };

/* gap */
const gapStory = (gap: StackGap): Story => ({ args: { gap, direction: 'horizontal', align: 'center' } });
export const GapNone: Story = gapStory('none');
export const GapTight: Story = gapStory('tight');
export const GapNormal: Story = gapStory('normal');
export const GapLoose: Story = gapStory('loose');
export const GapSection: Story = gapStory('section');

/* align (cross axis; shown on a vertical stack so widths differ) */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
export const AlignStretch: Story = { args: { align: 'stretch' } };

/* justify (main axis; shown on a horizontal stack) */
const justifyStory = (justify: StackJustify): Story => ({
  args: { justify, direction: 'horizontal', align: 'center' },
});
export const JustifyStart: Story = justifyStory('start');
export const JustifyCenter: Story = justifyStory('center');
export const JustifyEnd: Story = justifyStory('end');
export const JustifyBetween: Story = justifyStory('between');

/* wrap */
export const Wrap: Story = {
  args: { direction: 'horizontal', align: 'center', wrap: true },
  render: (args) => html`<div style="max-inline-size: 16rem">${renderStack(args, texts)}</div>`,
};

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementNav: Story = { args: { element: 'nav', direction: 'horizontal', align: 'center' } };
export const ElementUl: Story = { args: { element: 'ul' } };
export const ElementOl: Story = { args: { element: 'ol' } };

/* examples from the component doc */

/** The usual vertical rhythm between fields in a form. */
export const FormFields: Story = {
  args: { direction: 'vertical', gap: 'normal' },
  render: (args) =>
    renderStack(
      args,
      html`
        <ds-input label="Full name" name="name" type="text"></ds-input>
        <ds-input label="Email address" name="email" type="email"></ds-input>
        <ds-input label="Phone number" name="phone" type="tel"></ds-input>
      `,
    ),
};

/** A row of actions at the end of a form or card, tightly spaced and pushed to the end. */
export const ButtonRow: Story = {
  args: { direction: 'horizontal', gap: 'tight', justify: 'end', align: 'center' },
  render: (args) =>
    renderStack(
      args,
      html`
        <ds-button variant="secondary" label="Cancel"></ds-button>
        <ds-button type="submit" label="Submit"></ds-button>
      `,
    ),
};

/** The section rhythm between the regions of a page. */
export const PageSections: Story = {
  args: { direction: 'vertical', gap: 'section' },
  render: (args) =>
    renderStack(
      args,
      html`
        <ds-text>The first region of the page</ds-text>
        <ds-text>The second region of the page</ds-text>
        <ds-text>The third region of the page</ds-text>
      `,
    ),
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  args: { direction: 'horizontal', gap: 'tight', wrap: true, align: 'center' },
  /* the width bound is a decorator, not an arg, so the wrap shows */
  decorators: [(story) => html`<div style="max-inline-size: 16rem">${story()}</div>`],
  render: (args) =>
    renderStack(
      args,
      html`
        <ds-button variant="secondary" size="sm" label="All"></ds-button>
        <ds-button variant="ghost" size="sm" label="Open"></ds-button>
        <ds-button variant="ghost" size="sm" label="In review"></ds-button>
        <ds-button variant="ghost" size="sm" label="Merged"></ds-button>
        <ds-button variant="ghost" size="sm" label="Closed"></ds-button>
        <ds-button variant="ghost" size="sm" label="Archived"></ds-button>
      `,
    ),
};
