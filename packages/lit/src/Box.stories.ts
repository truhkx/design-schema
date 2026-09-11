import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Box.js';
import './Text.js';
import type { BoxElement, BoxInset, BoxRadius, BoxSurface } from './Box.js';

interface BoxArgs {
  inset: BoxInset;
  insetBlock?: BoxInset | undefined;
  insetInline?: BoxInset | undefined;
  surface: BoxSurface;
  border: boolean;
  radius: BoxRadius;
  element: BoxElement;
}

const INSETS: BoxInset[] = ['none', 'sm', 'md', 'lg', 'xl'];
const SURFACES: BoxSurface[] = ['none', 'default', 'subtle', 'strong'];
const RADII: BoxRadius[] = ['none', 'sm', 'md', 'lg', 'full'];
const ELEMENTS: BoxElement[] = ['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'];

const meta: Meta<BoxArgs> = {
  title: 'Box/Lit',
  tags: ['autodocs'],
  argTypes: {
    inset: { control: 'select', options: INSETS },
    insetBlock: { control: 'select', options: [undefined, ...INSETS] },
    insetInline: { control: 'select', options: [undefined, ...INSETS] },
    surface: { control: 'select', options: SURFACES },
    border: { control: 'boolean' },
    radius: { control: 'select', options: RADII },
    element: { control: 'select', options: ELEMENTS },
  },
  args: {
    inset: 'none',
    insetBlock: undefined,
    insetInline: undefined,
    surface: 'none',
    border: false,
    radius: 'none',
    element: 'div',
  },
  render: (args) => html`
    <ds-box
      inset=${args.inset}
      inset-block=${ifDefined(args.insetBlock)}
      inset-inline=${ifDefined(args.insetInline)}
      surface=${args.surface}
      ?border=${args.border}
      radius=${args.radius}
      element=${args.element}
    >
      <ds-text>Box content</ds-text>
    </ds-box>
  `,
};

export default meta;
type Story = StoryObj<BoxArgs>;

export const Default: Story = {};

/* inset */
export const InsetNone: Story = { args: { inset: 'none' } };
export const InsetSm: Story = { args: { inset: 'sm' } };
export const InsetMd: Story = { args: { inset: 'md' } };
export const InsetLg: Story = { args: { inset: 'lg' } };
export const InsetXl: Story = { args: { inset: 'xl' } };

/* insetBlock (overrides inset on the vertical axis) */
export const InsetBlockSm: Story = { args: { inset: 'lg', insetBlock: 'sm' } };

/* insetInline (overrides inset on the horizontal axis) */
export const InsetInlineSm: Story = { args: { inset: 'lg', insetInline: 'sm' } };

/* surface */
export const SurfaceNone: Story = { args: { surface: 'none' } };
export const SurfaceDefault: Story = { args: { surface: 'default', inset: 'md' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle', inset: 'md' } };
export const SurfaceStrong: Story = { args: { surface: 'strong', inset: 'md' } };

/* border */
export const BorderTrue: Story = { args: { border: true, inset: 'md' } };

/* radius */
export const RadiusNone: Story = { args: { radius: 'none', surface: 'subtle', inset: 'md' } };
export const RadiusSm: Story = { args: { radius: 'sm', surface: 'subtle', inset: 'md' } };
export const RadiusMd: Story = { args: { radius: 'md', surface: 'subtle', inset: 'md' } };
export const RadiusLg: Story = { args: { radius: 'lg', surface: 'subtle', inset: 'md' } };
export const RadiusFull: Story = { args: { radius: 'full', surface: 'subtle', inset: 'md' } };

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementSection: Story = { args: { element: 'section' } };
export const ElementArticle: Story = { args: { element: 'article' } };
export const ElementAside: Story = { args: { element: 'aside' } };
export const ElementHeader: Story = { args: { element: 'header' } };
export const ElementFooter: Story = { args: { element: 'footer' } };
export const ElementMain: Story = { args: { element: 'main' } };
export const ElementNav: Story = { args: { element: 'nav' } };
