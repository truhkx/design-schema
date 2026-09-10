import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { Button } from './Button';

const items = (
  <>
    <Button label="Save changes" />
    <Button label="Cancel" variant="secondary" />
    <Button label="Delete file" variant="danger" />
  </>
);

const meta = {
  title: 'Stack/React',
  component: Stack,
  args: {
    direction: 'vertical',
    gap: '4',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    element: 'div',
    children: items,
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* direction */
export const DirectionVertical: Story = { args: { direction: 'vertical' } };
export const DirectionHorizontal: Story = { args: { direction: 'horizontal', align: 'start' } };

/* gap */
export const Gap0: Story = { args: { gap: '0' } };
export const Gap1: Story = { args: { gap: '1' } };
export const Gap2: Story = { args: { gap: '2' } };
export const Gap3: Story = { args: { gap: '3' } };
export const Gap4: Story = { args: { gap: '4' } };
export const Gap5: Story = { args: { gap: '5' } };
export const Gap6: Story = { args: { gap: '6' } };
export const Gap8: Story = { args: { gap: '8' } };
export const Gap10: Story = { args: { gap: '10' } };
export const Gap12: Story = { args: { gap: '12' } };

/* align */
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
export const AlignStretch: Story = { args: { align: 'stretch' } };

/* justify (shown on a horizontal stack so distribution is visible) */
export const JustifyStart: Story = { args: { direction: 'horizontal', align: 'start', justify: 'start' } };
export const JustifyCenter: Story = { args: { direction: 'horizontal', align: 'start', justify: 'center' } };
export const JustifyEnd: Story = { args: { direction: 'horizontal', align: 'start', justify: 'end' } };
export const JustifyBetween: Story = { args: { direction: 'horizontal', align: 'start', justify: 'between' } };

/* wrap */
export const Wrap: Story = {
  args: { direction: 'horizontal', align: 'start', wrap: true },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
};

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementNav: Story = { args: { element: 'nav', direction: 'horizontal', align: 'start' } };
export const ElementUl: Story = { args: { element: 'ul' } };
export const ElementOl: Story = { args: { element: 'ol' } };
