import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Stack.js';
import './Button.js';
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
  render: (args) => html`
    <ds-stack
      direction=${args.direction}
      gap=${args.gap}
      align=${args.align}
      justify=${args.justify}
      ?wrap=${args.wrap}
      .element=${args.element}
    >
      <ds-button label="Save changes"></ds-button>
      <ds-button variant="secondary" label="Preview"></ds-button>
      <ds-button variant="ghost" label="Cancel"></ds-button>
    </ds-stack>
  `,
};

export default meta;
type Story = StoryObj<StackArgs>;

export const Default: Story = {};

/* direction */
export const Vertical: Story = { args: { direction: 'vertical' } };
export const Horizontal: Story = { args: { direction: 'horizontal', align: 'center' } };

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
  render: (args) => html`
    <div style="max-inline-size: 20rem">
      <ds-stack direction=${args.direction} gap=${args.gap} align=${args.align} justify=${args.justify} ?wrap=${args.wrap} .element=${args.element}>
        <ds-button label="Save changes"></ds-button>
        <ds-button variant="secondary" label="Preview"></ds-button>
        <ds-button variant="secondary" label="Duplicate"></ds-button>
        <ds-button variant="ghost" label="Cancel"></ds-button>
      </ds-stack>
    </div>
  `,
};

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementNav: Story = { args: { element: 'nav', direction: 'horizontal', align: 'center' } };
export const ElementUl: Story = { args: { element: 'ul' } };
export const ElementOl: Story = { args: { element: 'ol' } };
