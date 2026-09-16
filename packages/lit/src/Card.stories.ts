import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Card.js';
import './Text.js';
import './Button.js';
import './Link.js';
import './Icon.js';
import type { CardHeadingLevel, CardInset, CardSurface } from './Card.js';

interface CardArgs {
  heading?: string | undefined;
  headingLevel: CardHeadingLevel;
  inset: CardInset;
  surface: CardSurface;
  interactive: boolean;
  focusable: boolean;
  children: string;
}

/** An interactive card's body is its single link; otherwise the body is text. */
const body = (args: CardArgs): TemplateResult =>
  args.interactive
    ? html`<ds-link href="#card" label=${args.children}></ds-link>`
    : html`<ds-text>${args.children}</ds-text>`;

const meta: Meta<CardArgs> = {
  title: 'Card/Lit',
  tags: ['autodocs'],
  argTypes: {
    headingLevel: { control: 'select', options: ['2', '3', '4', '5', '6'] },
    inset: { control: 'select', options: ['sm', 'md', 'lg'] },
    surface: { control: 'select', options: ['default', 'subtle'] },
    interactive: { control: 'boolean' },
    focusable: { control: 'boolean' },
  },
  args: {
    heading: 'Notification settings',
    headingLevel: '3',
    inset: 'md',
    surface: 'default',
    interactive: false,
    focusable: false,
    children: 'Choose which updates you want to hear about, and how.',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${ifDefined(args.heading)}
        heading-level=${args.headingLevel}
        inset=${args.inset}
        surface=${args.surface}
        ?interactive=${args.interactive}
        ?focusable=${args.focusable}
      >
        ${body(args)}
      </ds-card>
    </div>
  `,
};

export default meta;
type Story = StoryObj<CardArgs>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/* inset */
export const InsetSm: Story = { args: { inset: 'sm' } };
export const InsetMd: Story = { args: { inset: 'md' } };
export const InsetLg: Story = { args: { inset: 'lg' } };

/* surface */
export const SurfaceDefault: Story = { args: { surface: 'default' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle' } };

/* booleans */
export const Interactive: Story = { args: { interactive: true, children: 'Manage plan' } };
export const Focusable: Story = { args: { focusable: true } };

/* examples */
export const PlanCard: Story = {
  args: { heading: 'Team plan', headingLevel: '3', children: 'What the plan includes' },
};
export const DenseGridCard: Story = {
  args: { children: 'A search result', inset: 'sm', surface: 'subtle' },
};
export const WholeCardIsALink: Story = {
  args: { heading: 'September invoice', children: 'A Link to the invoice', interactive: true },
};
export const CardFocusedByAFeed: Story = {
  args: { heading: 'New comment', children: 'The comment body', focusable: true },
};

/* notable states */
export const WithHeaderActions: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${ifDefined(args.heading)} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <ds-icon slot="leading-icon" name="ellipsis"></ds-icon>
        </ds-button>
        <ds-text>${args.children}</ds-text>
      </ds-card>
    </div>
  `,
};

export const WithFooter: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${ifDefined(args.heading)} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface}>
        <ds-text>${args.children}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  `,
};
