import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Heading } from './Heading';
import { Input } from './Input';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Stack> = {
  title: 'Stack/React Native',
  component: Stack,
  decorators: [withTheme()],
  args: {
    children: (
      <>
        <Button label="Save changes" />
        <Button label="Cancel" variant="secondary" />
        <Button label="Forgot password?" variant="ghost" />
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

// notable states
export const Wrap: Story = { args: { direction: 'horizontal', wrap: true, align: 'start' } };
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
        <Heading level="2">Profile</Heading>
        <Heading level="2">Billing</Heading>
        <Heading level="2">Notifications</Heading>
      </>
    ),
  },
};

/** A horizontal group that reflows onto new lines on narrow viewports instead of overflowing. */
export const WrappingFilters: Story = {
  args: {
    direction: 'horizontal',
    gap: 'tight',
    wrap: true,
    align: 'center',
    children: (
      <>
        <Button label="All" variant="secondary" />
        <Button label="Open" variant="secondary" />
        <Button label="In review" variant="secondary" />
        <Button label="Merged" variant="secondary" />
        <Button label="Closed" variant="secondary" />
        <Text>6 results</Text>
      </>
    ),
  },
};
