import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';
import { Text } from './Text';

const content = <Text element="p">Box content.</Text>;

const meta: Meta<typeof Box> = {
  title: 'Box/React',
  component: Box,
  tags: ['autodocs'],
  args: {
    inset: 'md',
    surface: 'subtle',
    border: false,
    radius: 'md',
    element: 'div',
    children: content,
  },
};

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
