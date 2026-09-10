import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';
import { Text } from './Text';

const content = <Text element="p">Box content.</Text>;

const meta = {
  title: 'Box/React',
  component: Box,
  args: {
    inset: 'md',
    surface: 'subtle',
    border: false,
    radius: 'md',
    element: 'div',
    children: content,
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* inset */
export const InsetNone: Story = { args: { inset: 'none' } };
export const InsetSm: Story = { args: { inset: 'sm' } };
export const InsetMd: Story = { args: { inset: 'md' } };
export const InsetLg: Story = { args: { inset: 'lg' } };
export const InsetXl: Story = { args: { inset: 'xl' } };

/* insetBlock */
export const InsetBlockNone: Story = { args: { insetBlock: 'none' } };
export const InsetBlockSm: Story = { args: { insetBlock: 'sm' } };
export const InsetBlockMd: Story = { args: { insetBlock: 'md' } };
export const InsetBlockLg: Story = { args: { insetBlock: 'lg' } };
export const InsetBlockXl: Story = { args: { insetBlock: 'xl' } };

/* insetInline */
export const InsetInlineNone: Story = { args: { insetInline: 'none' } };
export const InsetInlineSm: Story = { args: { insetInline: 'sm' } };
export const InsetInlineMd: Story = { args: { insetInline: 'md' } };
export const InsetInlineLg: Story = { args: { insetInline: 'lg' } };
export const InsetInlineXl: Story = { args: { insetInline: 'xl' } };

/* surface */
export const SurfaceNone: Story = { args: { surface: 'none' } };
export const SurfaceDefault: Story = { args: { surface: 'default' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle' } };
export const SurfaceStrong: Story = { args: { surface: 'strong' } };

/* border */
export const Border: Story = { args: { border: true } };

/* radius */
export const RadiusNone: Story = { args: { radius: 'none' } };
export const RadiusSm: Story = { args: { radius: 'sm' } };
export const RadiusMd: Story = { args: { radius: 'md' } };
export const RadiusLg: Story = { args: { radius: 'lg' } };
export const RadiusFull: Story = { args: { radius: 'full' } };

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementArticle: Story = { args: { element: 'article' } };
export const ElementAside: Story = { args: { element: 'aside' } };
export const ElementHeader: Story = { args: { element: 'header' } };
export const ElementFooter: Story = { args: { element: 'footer' } };
export const ElementMain: Story = { args: { element: 'main' } };
export const ElementNav: Story = { args: { element: 'nav' } };
