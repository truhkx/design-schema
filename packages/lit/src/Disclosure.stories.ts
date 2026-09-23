import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Disclosure.js';
import './Text.js';
import './Stack.js';
import type { DisclosureHeadingLevel } from './Disclosure.js';

interface DisclosureArgs {
  summary: string;
  children: string;
  defaultOpen: boolean;
  disabled: boolean;
  keepMounted: boolean;
  fullWidth: boolean;
  /** Controlled open state. Bound as a property: a missing `open` attribute means uncontrolled. */
  open?: boolean | undefined;
  headingLevel?: DisclosureHeadingLevel | undefined;
}

const meta: Meta<DisclosureArgs> = {
  title: 'Disclosure/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['toggle'] },
  },
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    keepMounted: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    open: { control: 'boolean' },
    headingLevel: { control: 'select', options: [undefined, '2', '3', '4', '5', '6'] },
  },
  args: {
    summary: 'What happens if I cancel?',
    children:
      'You keep access until the end of the current billing period. Your data is kept for 30 days after that, then deleted.',
    defaultOpen: false,
    disabled: false,
    keepMounted: false,
    fullWidth: false,
    open: undefined,
    headingLevel: undefined,
  },
  decorators: [(story) => html`<div style="max-inline-size: 32rem">${story()}</div>`],
  render: (args) => html`
    <ds-disclosure
      summary=${args.summary}
      heading-level=${ifDefined(args.headingLevel)}
      .open=${args.open}
      ?default-open=${args.defaultOpen}
      ?disabled=${args.disabled}
      ?keep-mounted=${args.keepMounted}
      ?full-width=${args.fullWidth}
    >
      <ds-text>${args.children}</ds-text>
    </ds-disclosure>
  `,
};

export default meta;
type Story = StoryObj<DisclosureArgs>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/* examples — exactly their `given` as args */
export const FaqAnswer: Story = {
  args: {
    summary: 'What happens if I cancel?',
    children: 'You keep access until the end of the current billing period.',
    headingLevel: '3',
  },
};

export const AdvancedOptions: Story = {
  args: {
    summary: 'Advanced options',
    children: 'Retry limit, timeout and proxy settings.',
  },
};

export const OpenWithFormFields: Story = {
  args: {
    summary: 'Billing address',
    children: 'Street, city and postcode fields.',
    defaultOpen: true,
    keepMounted: true,
  },
};

export const Disabled: Story = {
  args: {
    summary: 'Shipping details',
    children: 'Choose a delivery address first.',
    disabled: true,
  },
};

/* states */
export const Open: Story = { args: { defaultOpen: true } };
export const Controlled: Story = { args: { open: true } };
export const KeepMounted: Story = { args: { keepMounted: true } };
export const FullWidth: Story = { args: { fullWidth: true } };

/* accordion: independent disclosures stacked; nothing closes its siblings. */
export const Accordion: Story = {
  render: (args) => html`
    <ds-stack gap="none">
      <ds-disclosure summary="What happens if I cancel?" heading-level="3" ?disabled=${args.disabled}>
        <ds-text>${args.children}</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Can I change plans later?" heading-level="3" ?disabled=${args.disabled}>
        <ds-text>Yes. Changes take effect at the next billing date.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3" ?disabled=${args.disabled}>
        <ds-text>Within 14 days of a charge, in full.</ds-text>
      </ds-disclosure>
    </ds-stack>
  `,
};
