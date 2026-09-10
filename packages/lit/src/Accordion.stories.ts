import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Accordion.js';
import './Text.js';
import type { AccordionHeadingLevel, AccordionItem } from './Accordion.js';

interface AccordionArgs {
  headingLevel: AccordionHeadingLevel;
  exclusive: boolean;
  divided: boolean;
  keepMounted: boolean;
  defaultValue?: string | string[];
}

const FAQ = [
  { id: 'plans', summary: 'Can I change plans later?', body: 'Upgrades apply immediately; downgrades apply at the next renewal.' },
  { id: 'refunds', summary: 'Do you offer refunds?', body: 'Annual plans can be refunded within 14 days of purchase.' },
  { id: 'cancel', summary: 'What happens if I cancel?', body: 'Your workspace becomes read-only at the end of the billing period.' },
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
    headingLevel: '3',
    exclusive: false,
    divided: true,
    keepMounted: false,
    defaultValue: undefined,
  },
  render: (args) => html`
    <ds-accordion
      heading-level=${args.headingLevel}
      ?exclusive=${args.exclusive}
      ?divided=${args.divided}
      ?keep-mounted=${args.keepMounted}
      .defaultValue=${args.defaultValue}
    >
      ${FAQ.map(
        (item) => html`
          <ds-disclosure id=${item.id} summary=${item.summary}>
            <ds-text>${item.body}</ds-text>
          </ds-disclosure>
        `,
      )}
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

/* boolean states */
export const ExclusiveTrue: Story = { args: { exclusive: true, defaultValue: 'plans' } };
export const DividedFalse: Story = { args: { divided: false } };
export const KeepMountedTrue: Story = { args: { keepMounted: true } };

export const WithDefaultValue: Story = { args: { defaultValue: ['plans', 'refunds'] } };

const ITEMS: AccordionItem[] = FAQ.map(({ id, summary }) => ({ id, summary }));

/**
 * `items` renders the `<ds-disclosure>` elements itself; each entry's panel
 * content is provided as a light-DOM child slotted by the item's `id`.
 */
export const ItemsProp: Story = {
  render: () => html`
    <ds-accordion .items=${ITEMS}>
      ${FAQ.map((item) => html`<div slot=${item.id}><ds-text>${item.body}</ds-text></div>`)}
    </ds-accordion>
  `,
};

/**
 * Three enabled triggers so the keyboard gate can verify ArrowUp/ArrowDown
 * wrapping and Home/End, with every trigger still a regular Tab stop.
 */
export const Keyboard: Story = {
  render: () => html`
    <ds-accordion>
      ${FAQ.map(
        (item) => html`
          <ds-disclosure id=${item.id} summary=${item.summary}>
            <ds-text>${item.body}</ds-text>
          </ds-disclosure>
        `,
      )}
    </ds-accordion>
  `,
};
