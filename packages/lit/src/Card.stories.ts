import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Card.js';
import './Text.js';
import './Button.js';
import './Link.js';
import type { CardHeadingLevel, CardInset, CardSurface } from './Card.js';

interface CardArgs {
  heading?: string;
  headingLevel: CardHeadingLevel;
  inset: CardInset;
  surface: CardSurface;
  interactive: boolean;
  body: string;
}

const meta: Meta<CardArgs> = {
  title: 'Card/Lit',
  tags: ['autodocs'],
  argTypes: {
    headingLevel: { control: 'select', options: ['2', '3', '4', '5', '6'] },
    inset: { control: 'select', options: ['sm', 'md', 'lg'] },
    surface: { control: 'select', options: ['default', 'subtle'] },
    interactive: { control: 'boolean' },
  },
  args: {
    heading: 'Notification settings',
    headingLevel: '3',
    inset: 'md',
    surface: 'default',
    interactive: false,
    body: 'Choose which updates you want to hear about, and how.',
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card
        heading=${ifDefined(args.heading)}
        heading-level=${args.headingLevel}
        inset=${args.inset}
        surface=${args.surface}
        ?interactive=${args.interactive}
      >
        <ds-text>${args.body}</ds-text>
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

export const SingleContent: Story = {
  args: { heading: undefined, body: 'Your plan renews on the 12th of every month.' },
};

export const WithHeaderActions: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${ifDefined(args.heading)} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface}>
        <ds-link slot="header-actions" href="#details" label="Details"></ds-link>
        <ds-button slot="header-actions" variant="ghost" size="sm" icon-only label="More options">
          <svg slot="leading-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="1em" height="1em" fill="currentColor">
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </ds-button>
        <ds-text>${args.body}</ds-text>
      </ds-card>
    </div>
  `,
};

export const WithFooter: Story = {
  render: (args) => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading=${ifDefined(args.heading)} heading-level=${args.headingLevel} inset=${args.inset} surface=${args.surface}>
        <ds-text>${args.body}</ds-text>
        <ds-button slot="footer" variant="primary" size="sm" label="Save"></ds-button>
        <ds-button slot="footer" variant="ghost" size="sm" label="Cancel"></ds-button>
      </ds-card>
    </div>
  `,
};

export const InteractiveTrue: Story = {
  render: () => html`
    <div style="inline-size: min(100%, 24rem)">
      <ds-card heading="Storage plan" heading-level="3" interactive>
        <ds-text>2 TB, billed annually.</ds-text>
        <ds-link href="#plan" label="Manage plan"></ds-link>
      </ds-card>
    </div>
  `,
};
