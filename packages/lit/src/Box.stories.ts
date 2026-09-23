import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Box.js';
import './Text.js';
import type { TokenRef } from '@design-schema/tokens';
import type { BoxElement, BoxInset, BoxOverridableBinding, BoxRadius, BoxSurface } from './Box.js';

interface BoxArgs {
  /** Slotted as text inside a `<ds-text>`; not an element property. */
  children: string;
  inset: BoxInset;
  insetBlock?: BoxInset | undefined;
  insetInline?: BoxInset | undefined;
  surface: BoxSurface;
  border: boolean;
  radius: BoxRadius;
  element: BoxElement;
  overrides?: Partial<Record<BoxOverridableBinding, TokenRef | undefined>> | undefined;
}

const INSETS: BoxInset[] = ['none', 'sm', 'md', 'lg', 'xl'];
const SURFACES: BoxSurface[] = ['none', 'default', 'subtle', 'strong'];
const RADII: BoxRadius[] = ['none', 'sm', 'md', 'lg', 'full'];
const ELEMENTS: BoxElement[] = ['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav'];

/** Meta args are the schema defaults, so each example story carries exactly its `given`. */
const meta: Meta<BoxArgs> = {
  title: 'Box/Lit',
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    inset: { control: 'select', options: INSETS },
    insetBlock: { control: 'select', options: [undefined, ...INSETS] },
    insetInline: { control: 'select', options: [undefined, ...INSETS] },
    surface: { control: 'select', options: SURFACES },
    border: { control: 'boolean' },
    radius: { control: 'select', options: RADII },
    element: { control: 'select', options: ELEMENTS },
    overrides: { control: 'object' },
  },
  args: {
    children: 'Box content',
    inset: 'none',
    insetBlock: undefined,
    insetInline: undefined,
    surface: 'none',
    border: false,
    radius: 'none',
    element: 'div',
  },
  /* Slotted content cannot be an arg, so the string `children` is wrapped in a Text at its defaults. */
  render: (args) => html`
    <ds-box
      inset=${args.inset}
      inset-block=${ifDefined(args.insetBlock)}
      inset-inline=${ifDefined(args.insetInline)}
      surface=${args.surface}
      ?border=${args.border}
      radius=${args.radius}
      element=${args.element}
      .overrides=${args.overrides}
    >
      <ds-text>${args.children}</ds-text>
    </ds-box>
  `,
};

export default meta;
type Story = StoryObj<BoxArgs>;

/** A Box at its schema defaults draws nothing, so Default uses the `highlighted-panel` example's props. */
export const Default: Story = {
  args: { children: 'A panel of settings', inset: 'md', surface: 'subtle', radius: 'md' },
};

/* Per-value stories vary one prop over Default's args, as the React stories do over theirs. */

/* inset */
export const InsetNone: Story = { args: { ...Default.args, inset: 'none' } };
export const InsetSm: Story = { args: { ...Default.args, inset: 'sm' } };
export const InsetMd: Story = { args: { ...Default.args, inset: 'md' } };
export const InsetLg: Story = { args: { ...Default.args, inset: 'lg' } };
export const InsetXl: Story = { args: { ...Default.args, inset: 'xl' } };

/* insetBlock — overrides inset on the vertical axis */
export const InsetBlockNone: Story = { args: { ...Default.args, insetBlock: 'none' } };
export const InsetBlockSm: Story = { args: { ...Default.args, insetBlock: 'sm' } };
export const InsetBlockMd: Story = { args: { ...Default.args, insetBlock: 'md' } };
export const InsetBlockLg: Story = { args: { ...Default.args, insetBlock: 'lg' } };
export const InsetBlockXl: Story = { args: { ...Default.args, insetBlock: 'xl' } };

/* insetInline — overrides inset on the horizontal axis */
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

/* overrides — a border so the colour and width overrides are in effect, and a radius that is not none */
export const WithOverrides: Story = {
  args: {
    ...Default.args,
    border: true,
    overrides: {
      paddingBlock: 'layout.inset.lg',
      border: 'color.border.focus',
      borderWidth: 'border.width.focus',
      radius: 'radius.lg',
    },
  },
};

/* radius */
export const RadiusNone: Story = { args: { ...Default.args, radius: 'none' } };
export const RadiusSm: Story = { args: { ...Default.args, radius: 'sm' } };
export const RadiusMd: Story = { args: { ...Default.args, radius: 'md' } };
export const RadiusLg: Story = { args: { ...Default.args, radius: 'lg' } };
export const RadiusFull: Story = { args: { ...Default.args, radius: 'full' } };

/* element — the host is the element; article, aside, main and nav set the matching role */
export const ElementDiv: Story = { args: { ...Default.args, element: 'div' } };
export const ElementSection: Story = { args: { ...Default.args, element: 'section' } };
export const ElementArticle: Story = { args: { ...Default.args, element: 'article' } };
export const ElementAside: Story = { args: { ...Default.args, element: 'aside' } };
export const ElementHeader: Story = { args: { ...Default.args, element: 'header' } };
export const ElementFooter: Story = { args: { ...Default.args, element: 'footer' } };
export const ElementMain: Story = { args: { ...Default.args, element: 'main' } };
export const ElementNav: Story = { args: { ...Default.args, element: 'nav' } };

/* examples from the component doc — exactly their `given`, over the schema defaults */

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
