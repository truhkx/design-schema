import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';
import { Text } from './Text';

const meta: Meta<typeof Box> = {
  title: 'Box/React',
  component: Box,
  tags: ['autodocs'],
  // Only schema defaults live here; the `highlighted-panel` props go on Default alone.
  args: {
    border: false,
    element: 'div',
  },
  // A string given as `children` is wrapped in the system Text at its defaults.
  render: ({ children, ...args }) => (
    <Box {...args}>{typeof children === 'string' ? <Text>{children}</Text> : children}</Box>
  ),
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The `highlighted-panel` example: a Box at its schema defaults draws nothing. */
export const Default: Story = {
  args: { children: 'A panel of settings', inset: 'md', surface: 'subtle', radius: 'md' },
};

/* inset */
export const InsetNone: Story = { args: { ...Default.args, inset: 'none' } };
export const InsetSm: Story = { args: { ...Default.args, inset: 'sm' } };
export const InsetMd: Story = { args: { ...Default.args, inset: 'md' } };
export const InsetLg: Story = { args: { ...Default.args, inset: 'lg' } };
export const InsetXl: Story = { args: { ...Default.args, inset: 'xl' } };

/* insetBlock */
export const InsetBlockNone: Story = { args: { ...Default.args, insetBlock: 'none' } };
export const InsetBlockSm: Story = { args: { ...Default.args, insetBlock: 'sm' } };
export const InsetBlockMd: Story = { args: { ...Default.args, insetBlock: 'md' } };
export const InsetBlockLg: Story = { args: { ...Default.args, insetBlock: 'lg' } };
export const InsetBlockXl: Story = { args: { ...Default.args, insetBlock: 'xl' } };

/* insetInline */
export const InsetInlineNone: Story = { args: { ...Default.args, insetInline: 'none' } };
export const InsetInlineSm: Story = { args: { ...Default.args, insetInline: 'sm' } };
export const InsetInlineMd: Story = { args: { ...Default.args, insetInline: 'md' } };
export const InsetInlineLg: Story = { args: { ...Default.args, insetInline: 'lg' } };
export const InsetInlineXl: Story = { args: { ...Default.args, insetInline: 'xl' } };

/* surface */
export const SurfaceNone: Story = { args: { ...Default.args, surface: 'none' } };
export const SurfaceDefault: Story = { args: { ...Default.args, surface: 'default' } };
export const SurfaceSubtle: Story = { args: { ...Default.args, surface: 'subtle' } };
export const SurfaceStrong: Story = { args: { ...Default.args, surface: 'strong' } };

/* border */
export const Border: Story = { args: { ...Default.args, border: true } };

/* radius */
export const RadiusNone: Story = { args: { ...Default.args, radius: 'none' } };
export const RadiusSm: Story = { args: { ...Default.args, radius: 'sm' } };
export const RadiusMd: Story = { args: { ...Default.args, radius: 'md' } };
export const RadiusLg: Story = { args: { ...Default.args, radius: 'lg' } };
export const RadiusFull: Story = { args: { ...Default.args, radius: 'full' } };

/* element */
export const ElementDiv: Story = { args: { ...Default.args, element: 'div' } };
export const ElementSection: Story = { args: { ...Default.args, element: 'section' } };
export const ElementArticle: Story = { args: { ...Default.args, element: 'article' } };
export const ElementAside: Story = { args: { ...Default.args, element: 'aside' } };
export const ElementHeader: Story = { args: { ...Default.args, element: 'header' } };
export const ElementFooter: Story = { args: { ...Default.args, element: 'footer' } };
export const ElementMain: Story = { args: { ...Default.args, element: 'main' } };
export const ElementNav: Story = { args: { ...Default.args, element: 'nav' } };

/** Per-instance overrides: more block padding, a stronger border colour, a smaller radius. */
export const WithOverrides: Story = {
  args: {
    ...Default.args,
    border: true,
    overrides: {
      paddingBlock: 'layout.inset.lg',
      border: 'color.border.strong',
      radius: 'radius.sm',
    },
  },
};

/* examples from the component doc */

/** A panel lifted off the page with a tinted surface, rounded corners and the usual inset. */
export const HighlightedPanel: Story = {
  args: { children: 'A panel of settings', inset: 'md', surface: 'subtle', radius: 'md' },
};

/** A dense row bounded by a thin border rather than a fill. */
export const BorderedRow: Story = {
  args: { children: 'A row of data', inset: 'sm', border: true },
};

/** A full-width band with more vertical than horizontal padding, on the strongest surface. */
export const HeroBand: Story = {
  args: { children: 'A hero band', insetBlock: 'xl', insetInline: 'lg', surface: 'strong' },
};

/** A padded region whose element makes it a navigation landmark on web. */
export const NavigationRegion: Story = {
  args: { children: 'The sidebar links', element: 'nav', inset: 'md' },
};
