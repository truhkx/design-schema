import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
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

/** Box slots its children, so the content is part of the render, never an arg. */
function renderBox(args: BoxArgs, content: TemplateResult): TemplateResult {
  return html`
    <ds-box
      inset=${args.inset}
      inset-block=${ifDefined(args.insetBlock)}
      inset-inline=${ifDefined(args.insetInline)}
      surface=${args.surface}
      ?border=${args.border}
      radius=${args.radius}
      element=${args.element}
    >
      ${content}
    </ds-box>
  `;
}

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
  render: (args) => renderBox(args, html`<ds-text>Box content</ds-text>`),
};

export default meta;
type Story = StoryObj<BoxArgs>;

export const Default: Story = {};

/* inset — shown on a subtle surface so the padding is visible */
const insetStory = (inset: BoxInset): Story => ({ args: { inset, surface: 'subtle' } });
export const InsetNone: Story = insetStory('none');
export const InsetSm: Story = insetStory('sm');
export const InsetMd: Story = insetStory('md');
export const InsetLg: Story = insetStory('lg');
export const InsetXl: Story = insetStory('xl');

/* insetBlock — overrides inset on the vertical axis */
const insetBlockStory = (insetBlock: BoxInset): Story => ({ args: { inset: 'md', insetBlock, surface: 'subtle' } });
export const InsetBlockNone: Story = insetBlockStory('none');
export const InsetBlockSm: Story = insetBlockStory('sm');
export const InsetBlockMd: Story = insetBlockStory('md');
export const InsetBlockLg: Story = insetBlockStory('lg');
export const InsetBlockXl: Story = insetBlockStory('xl');

/* insetInline — overrides inset on the horizontal axis */
const insetInlineStory = (insetInline: BoxInset): Story => ({ args: { inset: 'md', insetInline, surface: 'subtle' } });
export const InsetInlineNone: Story = insetInlineStory('none');
export const InsetInlineSm: Story = insetInlineStory('sm');
export const InsetInlineMd: Story = insetInlineStory('md');
export const InsetInlineLg: Story = insetInlineStory('lg');
export const InsetInlineXl: Story = insetInlineStory('xl');

/* surface */
const surfaceStory = (surface: BoxSurface): Story => ({ args: { surface, inset: 'md' } });
export const SurfaceNone: Story = surfaceStory('none');
export const SurfaceDefault: Story = surfaceStory('default');
export const SurfaceSubtle: Story = surfaceStory('subtle');
export const SurfaceStrong: Story = surfaceStory('strong');

/* border */
export const Border: Story = { args: { border: true, inset: 'md' } };

/* radius — on a tinted surface so the corners read */
const radiusStory = (radius: BoxRadius): Story => ({ args: { radius, surface: 'subtle', inset: 'md' } });
export const RadiusNone: Story = radiusStory('none');
export const RadiusSm: Story = radiusStory('sm');
export const RadiusMd: Story = radiusStory('md');
export const RadiusLg: Story = radiusStory('lg');
export const RadiusFull: Story = radiusStory('full');

/* element — the host is the element; sectioning values set the matching role */
const elementStory = (element: BoxElement): Story => ({ args: { element, inset: 'md', surface: 'subtle' } });
export const ElementDiv: Story = elementStory('div');
export const ElementSection: Story = elementStory('section');
export const ElementArticle: Story = elementStory('article');
export const ElementAside: Story = elementStory('aside');
export const ElementHeader: Story = elementStory('header');
export const ElementFooter: Story = elementStory('footer');
export const ElementMain: Story = elementStory('main');
export const ElementNav: Story = elementStory('nav');

/* examples from the component doc */

/** A panel lifted off the page with a tinted surface, rounded corners and the usual inset. */
export const HighlightedPanel: Story = {
  args: { inset: 'md', surface: 'subtle', radius: 'md' },
  render: (args) => renderBox(args, html`<ds-text>A panel of settings</ds-text>`),
};

/** A dense row bounded by a thin border rather than a fill. */
export const BorderedRow: Story = {
  args: { inset: 'sm', border: true },
  render: (args) => renderBox(args, html`<ds-text>A row of data</ds-text>`),
};

/** A full-width band with more vertical than horizontal padding, on the strongest surface. */
export const HeroBand: Story = {
  args: { insetBlock: 'xl', insetInline: 'lg', surface: 'strong' },
  render: (args) => renderBox(args, html`<ds-text>A hero band</ds-text>`),
};

/** A padded region whose element makes it a navigation landmark on web. */
export const NavigationRegion: Story = {
  args: { element: 'nav', inset: 'md' },
  render: (args) => renderBox(args, html`<ds-text>The sidebar links</ds-text>`),
};
