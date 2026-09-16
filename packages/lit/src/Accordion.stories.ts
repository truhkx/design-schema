import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Accordion.js';
import './Disclosure.js';
import './Text.js';
import type { AccordionHeadingLevel } from './Accordion.js';

/** A story item: the schema's item shape, with `content` rendered as the light-DOM child slotted by `id`. */
interface StoryItem {
  id: string;
  summary: string;
  content: string;
  disabled?: boolean | undefined;
}

interface AccordionArgs {
  items: StoryItem[];
  headingLevel: AccordionHeadingLevel;
  exclusive: boolean;
  divided: boolean;
  keepMounted: boolean;
  defaultValue?: string | string[] | undefined;
}

const FAQ: StoryItem[] = [
  { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' },
  { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.' },
];

const meta: Meta<AccordionArgs> = {
  title: 'Accordion/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'open-change'] },
  },
  argTypes: {
    headingLevel: { control: 'select', options: ['2', '3', '4', '5', '6'] },
    exclusive: { control: 'boolean' },
    divided: { control: 'boolean' },
    keepMounted: { control: 'boolean' },
  },
  args: {
    items: FAQ,
    headingLevel: '3',
    exclusive: false,
    divided: true,
    keepMounted: false,
  },
  render: (args) => html`
    <ds-accordion
      .items=${args.items.map(({ id, summary, disabled }) => ({ id, summary, disabled }))}
      heading-level=${args.headingLevel}
      ?exclusive=${args.exclusive}
      .divided=${args.divided}
      ?keep-mounted=${args.keepMounted}
      .defaultValue=${args.defaultValue}
    >
      ${args.items.map((item) => html`<div slot=${item.id}><ds-text>${item.content}</ds-text></div>`)}
    </ds-accordion>
  `,
};

export default meta;
type Story = StoryObj<AccordionArgs>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/* examples */
export const Faq: Story = {
  args: {
    items: [
      { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' },
      { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.' },
    ],
  },
};

export const OneOpenAtATime: Story = {
  args: {
    exclusive: true,
    items: [
      { id: 'free', summary: 'Free', content: 'One project and community support.' },
      { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' },
    ],
  },
};

export const FormSections: Story = {
  args: {
    keepMounted: true,
    headingLevel: '2',
    items: [
      { id: 'contact', summary: 'Contact details', content: 'Name and email fields.' },
      { id: 'billing', summary: 'Billing address', content: 'Street and city fields.' },
    ],
  },
};

export const Undivided: Story = {
  args: {
    divided: false,
    items: [
      { id: 'shipping', summary: 'Shipping', content: 'Orders ship within two business days.' },
      { id: 'returns', summary: 'Returns', content: 'Items can be returned within 30 days.' },
    ],
  },
};

/* notable states */
export const WithDefaultValue: Story = { args: { defaultValue: ['cancel', 'refunds'] } };

export const DisabledItem: Story = {
  args: {
    items: [
      { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' },
      { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.', disabled: true },
    ],
  },
};

/**
 * Light-DOM `<ds-disclosure>` children, the primary Lit form: three enabled
 * triggers so the keyboard gate can verify ArrowUp/ArrowDown wrapping and
 * Home/End, with every trigger still a Tab stop.
 */
export const Keyboard: Story = {
  render: () => html`
    <ds-accordion>
      <ds-disclosure id="cancel" summary="What happens if I cancel?">
        <ds-text>You keep access until the end of the billing period.</ds-text>
      </ds-disclosure>
      <ds-disclosure id="refunds" summary="Do you offer refunds?">
        <ds-text>Within 14 days of a charge, in full.</ds-text>
      </ds-disclosure>
      <ds-disclosure id="shipping" summary="Shipping">
        <ds-text>Orders ship within two business days.</ds-text>
      </ds-disclosure>
    </ds-accordion>
  `,
};
