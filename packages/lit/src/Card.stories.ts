import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import './Card.js';
import './Text.js';
import './Button.js';
import './Link.js';
import type { CardHeadingLevel, CardInset, CardSurface } from './Card.js';

interface CardArgs {
  heading: string;
  headingLevel: CardHeadingLevel;
  inset: CardInset;
  surface: CardSurface;
  interactive: boolean;
  focusable: boolean;
  children: string;
  /** Slots the two-button action row. Not a Card prop — the stories' stand-in for React's `footer` content. */
  footer: boolean;
}

const meta: Meta<CardArgs> = {
  title: 'Card/Lit',
  tags: ['autodocs'],
  argTypes: {
    headingLevel: { control: 'select', options: ['2', '3', '4', '5', '6'] },
    inset: { control: 'select', options: ['sm', 'md', 'lg'] },
    surface: { control: 'select', options: ['default', 'subtle'] },
    interactive: { control: 'boolean' },
    focusable: { control: 'boolean' },
    footer: { control: 'boolean' },
  },
  args: {
    heading: 'Team plan',
    headingLevel: '3',
    inset: 'md',
    surface: 'default',
    interactive: false,
    focusable: false,
    children: 'What the plan includes',
    footer: false,
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${args.heading}
        heading-level=${args.headingLevel}
        inset=${args.inset}
        surface=${args.surface}
        ?interactive=${args.interactive}
        ?focusable=${args.focusable}
      >
        ${args.interactive
          ? html`<ds-link href="#invoice" label=${args.children}></ds-link>`
          : html`<ds-text element="p">${args.children}</ds-text>`}
        ${args.footer
          ? html`<ds-button slot="footer" label="Choose plan" variant="primary" size="sm"></ds-button>
              <ds-button slot="footer" label="Compare plans" variant="secondary" size="sm"></ds-button>`
          : nothing}
      </ds-card>
    </div>
  `,
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = { args: { footer: true } };

/* headingLevel */
export const HeadingLevel2: Story = { args: { ...Default.args, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { ...Default.args, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { ...Default.args, headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { ...Default.args, headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { ...Default.args, headingLevel: '6' } };

/* inset */
export const InsetSm: Story = { args: { ...Default.args, inset: 'sm' } };
export const InsetMd: Story = { args: { ...Default.args, inset: 'md' } };
export const InsetLg: Story = { args: { ...Default.args, inset: 'lg' } };

/* surface */
export const SurfaceDefault: Story = { args: { ...Default.args, surface: 'default' } };
export const SurfaceSubtle: Story = { args: { ...Default.args, surface: 'subtle' } };

/* notable states */
export const WithHeaderActions: Story = {
  args: { ...Default.args },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${args.heading}
        heading-level=${args.headingLevel}
        inset=${args.inset}
        surface=${args.surface}
      >
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-text element="p">${args.children}</ds-text>
        <ds-button slot="footer" label="Choose plan" variant="primary" size="sm"></ds-button>
        <ds-button slot="footer" label="Compare plans" variant="secondary" size="sm"></ds-button>
      </ds-card>
    </div>
  `,
};

export const Interactive: Story = {
  args: { heading: 'September invoice', interactive: true, children: 'View the September invoice' },
};

export const InteractiveSubtle: Story = {
  args: { ...Interactive.args, surface: 'subtle' },
};

/* The target is found among the body's top-level children, so a Link beside Text still extends. */
export const InteractiveWithText: Story = {
  args: { heading: 'September invoice', interactive: true, children: 'View the September invoice' },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${args.heading} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface} interactive>
        <ds-button slot="header-actions" label="Download" variant="ghost" size="sm"></ds-button>
        <ds-text element="p" tone="muted">Due 30 September.</ds-text>
        <ds-link href="#invoice" label=${args.children}></ds-link>
      </ds-card>
    </div>
  `,
};

/* A nested template adds no wrapper element, so the Link inside one still counts as a top-level child. */
export const InteractiveInFragment: Story = {
  args: { heading: 'September invoice', interactive: true, children: 'View the September invoice' },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${args.heading} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface} interactive>
        ${html`<ds-text element="p" tone="muted">Due 30 September.</ds-text>
          <ds-link href="#invoice" label=${args.children}></ds-link>`}
      </ds-card>
    </div>
  `,
};

export const InteractiveDisabledButton: Story = {
  args: { heading: 'Archived plan', interactive: true, children: 'Choose plan' },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${args.heading} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface} interactive>
        <ds-button label=${args.children} variant="secondary" disabled></ds-button>
      </ds-card>
    </div>
  `,
};

/* Zero or several targets: the card stays non-interactive, but still reserves the ring's border
   width, so its geometry does not change with its content. */
export const InteractiveWithoutTarget: Story = {
  args: {
    heading: 'September invoice',
    interactive: true,
    children: 'Nothing here is a link, so the card is not a target.',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${args.heading} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface} interactive>
        <ds-text element="p">${args.children}</ds-text>
      </ds-card>
    </div>
  `,
};

/* examples */
export const PlanCard: Story = {
  args: { heading: 'Team plan', headingLevel: '3', children: 'What the plan includes' },
};

/* No heading: an empty string counts as omitted, so this clears the Default heading. */
export const DenseGridCard: Story = {
  args: { heading: '', children: 'A search result', inset: 'sm', surface: 'subtle' },
};

export const WholeCardIsALink: Story = {
  args: { heading: 'September invoice', children: 'A Link to the invoice', interactive: true },
};

export const CardFocusedByAFeed: Story = {
  args: { heading: 'New comment', children: 'The comment body', focusable: true },
};
