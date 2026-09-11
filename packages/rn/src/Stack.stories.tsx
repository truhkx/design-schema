import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Stack } from './Stack';
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
