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

const GAPS: StackGap[] = ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12'];

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
    gap: '4',
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
export const Gap0: Story = gapStory('0');
export const Gap1: Story = gapStory('1');
export const Gap2: Story = gapStory('2');
export const Gap3: Story = gapStory('3');
export const Gap4: Story = gapStory('4');
export const Gap5: Story = gapStory('5');
export const Gap6: Story = gapStory('6');
export const Gap8: Story = gapStory('8');
export const Gap10: Story = gapStory('10');
export const Gap12: Story = gapStory('12');

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
