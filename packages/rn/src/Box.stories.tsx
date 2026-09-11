import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Box> = {
  title: 'Box/React Native',
  component: Box,
  decorators: [withTheme()],
  args: {
    children: <Text>Box content</Text>,
    inset: 'none',
    insetBlock: undefined,
    insetInline: undefined,
    surface: 'none',
    border: false,
    radius: 'none',
  },
};

export default meta;

type Story = StoryObj<typeof Box>;

export const Default: Story = { args: { inset: 'md', surface: 'subtle' } };

// inset
export const InsetNone: Story = { args: { inset: 'none' } };
export const InsetSm: Story = { args: { inset: 'sm', surface: 'subtle' } };
export const InsetMd: Story = { args: { inset: 'md', surface: 'subtle' } };
export const InsetLg: Story = { args: { inset: 'lg', surface: 'subtle' } };
export const InsetXl: Story = { args: { inset: 'xl', surface: 'subtle' } };

// insetBlock
export const InsetBlockNone: Story = { args: { insetBlock: 'none', insetInline: 'md', surface: 'subtle' } };
export const InsetBlockSm: Story = { args: { insetBlock: 'sm', insetInline: 'md', surface: 'subtle' } };
export const InsetBlockMd: Story = { args: { insetBlock: 'md', insetInline: 'md', surface: 'subtle' } };
export const InsetBlockLg: Story = { args: { insetBlock: 'lg', insetInline: 'md', surface: 'subtle' } };
export const InsetBlockXl: Story = { args: { insetBlock: 'xl', insetInline: 'md', surface: 'subtle' } };

// insetInline
export const InsetInlineNone: Story = { args: { insetInline: 'none', insetBlock: 'md', surface: 'subtle' } };
export const InsetInlineSm: Story = { args: { insetInline: 'sm', insetBlock: 'md', surface: 'subtle' } };
export const InsetInlineMd: Story = { args: { insetInline: 'md', insetBlock: 'md', surface: 'subtle' } };
export const InsetInlineLg: Story = { args: { insetInline: 'lg', insetBlock: 'md', surface: 'subtle' } };
export const InsetInlineXl: Story = { args: { insetInline: 'xl', insetBlock: 'md', surface: 'subtle' } };

// surface
export const SurfaceNone: Story = { args: { surface: 'none', inset: 'md' } };
export const SurfaceDefault: Story = { args: { surface: 'default', inset: 'md' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle', inset: 'md' } };
export const SurfaceStrong: Story = { args: { surface: 'strong', inset: 'md' } };

// radius
export const RadiusNone: Story = { args: { radius: 'none', inset: 'md', surface: 'subtle' } };
export const RadiusSm: Story = { args: { radius: 'sm', inset: 'md', surface: 'subtle' } };
export const RadiusMd: Story = { args: { radius: 'md', inset: 'md', surface: 'subtle' } };
export const RadiusLg: Story = { args: { radius: 'lg', inset: 'md', surface: 'subtle' } };
export const RadiusFull: Story = { args: { radius: 'full', inset: 'md', surface: 'subtle' } };

// notable states
export const Border: Story = { args: { border: true, inset: 'md' } };
export const WithOverrides: Story = {
  args: {
    inset: 'md',
    surface: 'subtle',
    radius: 'sm',
    overrides: { background: 'color.status.info.background', radius: 'radius.lg' },
  },
};
