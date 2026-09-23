import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './Stack';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';
import { Text } from './Text';

/* A container capped at `layout.maxWidth.prose × 0.5`, narrow enough that the eight filters wrap in
   every theme (`Wrap`, `WrappingFilters`). A story decorator, not an arg. */
const proseWidth: Decorator = (Story) => (
  <div style={{ maxInlineSize: 'calc(var(--layout-max-width-prose) * 0.5)' }}>
    <Story />
  </div>
);

/* A row of filters: eight small secondary Buttons, per the doc. Story scaffolding, not copy. */
const filters = ['All', 'Open', 'Closed', 'Mine', 'Unassigned', 'Urgent', 'This week', 'Archived'].map((label) => (
  <Button key={label} label={label} variant="secondary" size="sm" />
));

/* Three Text children, per the doc. An array rather than a fragment: `element="ul"` wraps each child
   in an `li`, and React counts a fragment as one child, so a fragment would render one list item. */
const items = [
  <Text key="first">First item</Text>,
  <Text key="second">Second item</Text>,
  <Text key="third">Third item</Text>,
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
  args: { direction: 'horizontal', align: 'start', wrap: true, children: filters },
  decorators: [proseWidth],
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
      <Input key="email" label="Email" name="email" type="email" />,
      <Input key="password" label="Password" name="password" type="password" />,
    ],
  },
};

/** A row of actions at the end of a form or card, tightly spaced and pushed to the end. */
export const ButtonRow: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    justify: 'end',
    align: 'center',
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
      <Box key="summary" surface="subtle" inset="md">
        <Text>Summary</Text>
      </Box>,
      <Box key="details" surface="subtle" inset="md">
        <Text>Details</Text>
      </Box>,
      <Box key="history" surface="subtle" inset="md">
        <Text>History</Text>
      </Box>,
    ],
  },
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true,
    align: 'center',
    children: filters,
  },
  decorators: [proseWidth],
};
