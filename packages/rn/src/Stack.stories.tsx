import * as React from 'react';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';
import { Button } from './Button';
import { Input } from './Input';
import { Stack } from './Stack';
import { View } from 'react-native';
import { Text } from './Text';
import { useTheme } from './theme';
import { withTheme } from './decorators';

const meta: Meta<typeof Stack> = {
  title: 'Stack/React Native',
  component: Stack,
  decorators: [withTheme()],
  args: {
    children: (
      <>
        <Text>First item</Text>
        <Text>Second item</Text>
        <Text>Third item</Text>
      </>
    ),
    direction: 'vertical',
    gap: 'normal',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
};

export default meta;

type Story = StoryObj<typeof Stack>;

export const Default: Story = {};

// direction
export const DirectionVertical: Story = { args: { direction: 'vertical' } };
export const DirectionHorizontal: Story = { args: { direction: 'horizontal', align: 'start' } };

// gap
export const GapNone: Story = { args: { gap: 'none' } };
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };
export const GapSection: Story = { args: { gap: 'section' } };

// align (cross axis)
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };
export const AlignStretch: Story = { args: { align: 'stretch' } };

// justify (main axis; shown on a horizontal stack so distribution is visible)
export const JustifyStart: Story = { args: { direction: 'horizontal', align: 'start', justify: 'start' } };
export const JustifyCenter: Story = { args: { direction: 'horizontal', align: 'start', justify: 'center' } };
export const JustifyEnd: Story = { args: { direction: 'horizontal', align: 'start', justify: 'end' } };
export const JustifyBetween: Story = { args: { direction: 'horizontal', align: 'start', justify: 'between' } };

/** Bounds the story's width to the prose measure so a wrapping row visibly reflows. */
function BoundedWidth({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { tokens: t } = useTheme();
  return <View style={{ maxWidth: t.layoutMaxWidthProse }}>{children}</View>;
}

const boundedWidth: Decorator = (Story) => (
  <BoundedWidth>
    <Story />
  </BoundedWidth>
);

/** The row of filters from the doc: eight small secondary Buttons (story scaffolding, not copy). */
const filters = (
  <>
    <Button label="All" variant="secondary" size="sm" />
    <Button label="Open" variant="secondary" size="sm" />
    <Button label="Closed" variant="secondary" size="sm" />
    <Button label="Mine" variant="secondary" size="sm" />
    <Button label="Unassigned" variant="secondary" size="sm" />
    <Button label="Urgent" variant="secondary" size="sm" />
    <Button label="This week" variant="secondary" size="sm" />
    <Button label="Archived" variant="secondary" size="sm" />
  </>
);

// wrap (horizontal, in the same width-bounded decorator as `WrappingFilters`, so the row visibly wraps)
export const Wrap: Story = {
  decorators: [boundedWidth],
  args: { direction: 'horizontal', wrap: true, align: 'start', children: filters },
};
export const WithOverrides: Story = { args: { overrides: { gap: 'space.lg' } } };

// examples from the component doc
/** The usual vertical rhythm between fields in a form. */
export const FormFields: Story = {
  args: {
    direction: 'vertical',
    gap: 'normal',
    children: (
      <>
        <Input label="Full name" name="name" />
        <Input label="Email" name="email" type="email" />
        <Input label="Password" name="password" type="password" />
      </>
    ),
  },
};

/** A row of actions at the end of a form or card, tightly spaced and pushed to the end. */
export const ButtonRow: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    justify: 'end',
    align: 'center',
    children: (
      <>
        <Button label="Cancel" variant="secondary" />
        <Button label="Submit" type="submit" />
      </>
    ),
  },
};

/** The section rhythm between the regions of a page. */
export const PageSections: Story = {
  args: {
    direction: 'vertical',
    gap: 'section',
    children: (
      <>
        <Box surface="subtle" inset="md">
          <Text>Summary</Text>
        </Box>
        <Box surface="subtle" inset="md">
          <Text>Details</Text>
        </Box>
        <Box surface="subtle" inset="md">
          <Text>History</Text>
        </Box>
      </>
    ),
  },
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  decorators: [boundedWidth],
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true,
    align: 'center',
    children: filters,
  },
};
