import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Button } from './Button';
import { Input } from './Input';
import { Text } from './Text';

/* An array rather than a fragment: `element="ul"` wraps each child in an `li`, and React counts a
   fragment as one child, so a fragment here would render one list item holding all three. */
const items = [
  <Button key="save" label="Save changes" />,
  <Button key="cancel" label="Cancel" variant="secondary" />,
  <Button key="delete" label="Delete file" variant="danger" />,
];

const meta: Meta<typeof Stack> = {
  title: 'Stack/React',
  component: Stack,
  tags: ['autodocs'],
  args: {
    direction: 'vertical',
    gap: 'normal',
    align: 'stretch',
    justify: 'start',
    wrap: false,
    element: 'div',
    children: items,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

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

/* examples from the component doc */

/** The usual vertical rhythm between fields in a form. */
export const FormFields: Story = {
  args: {
    direction: 'vertical',
    gap: 'normal',
    children: [
      <Input key="name" label="Full name" name="name" type="text" />,
      <Input key="email" label="Email address" name="email" type="email" />,
      <Input key="phone" label="Phone number" name="phone" type="tel" />,
    ],
  },
};

/** A row of actions at the end of a form or card, tightly spaced and pushed to the end. */
export const ButtonRow: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    justify: 'end',
    children: [
      <Button key="cancel" label="Cancel" variant="secondary" />,
      <Button key="submit" label="Submit" type="submit" />,
    ],
  },
};

/** The section rhythm between the regions of a page. */
export const PageSections: Story = {
  args: {
    direction: 'vertical',
    gap: 'section',
    children: [
      <Text key="first">The first region of the page</Text>,
      <Text key="second">The second region of the page</Text>,
      <Text key="third">The third region of the page</Text>,
    ],
  },
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true,
    children: [
      <Button key="all" label="All" variant="secondary" size="sm" />,
      <Button key="open" label="Open" variant="ghost" size="sm" />,
      <Button key="in-review" label="In review" variant="ghost" size="sm" />,
      <Button key="merged" label="Merged" variant="ghost" size="sm" />,
      <Button key="closed" label="Closed" variant="ghost" size="sm" />,
      <Button key="archived" label="Archived" variant="ghost" size="sm" />,
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '16rem' }}>
        <Story />
      </div>
    ),
  ],
};
