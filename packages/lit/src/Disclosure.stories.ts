import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Disclosure.js';
import './Text.js';
import './Stack.js';
import type { DisclosureHeadingLevel } from './Disclosure.js';

interface DisclosureArgs {
  summary: string;
  defaultOpen: boolean;
  disabled: boolean;
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
    headingLevel: { control: 'select', options: [undefined, '2', '3', '4', '5', '6'] },
  },
  args: {
    summary: 'What happens if I cancel?',
    defaultOpen: false,
    disabled: false,
    headingLevel: undefined,
  },
  render: (args) => html`
    <ds-disclosure
      summary=${args.summary}
      heading-level=${ifDefined(args.headingLevel)}
      ?default-open=${args.defaultOpen}
      ?disabled=${args.disabled}
    >
      <ds-text
        >Your plan stays active until the end of the billing period. After that, your
        workspace becomes read-only and you can export your data at any time.</ds-text
      >
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

/* boolean states */
export const DefaultOpenTrue: Story = { args: { defaultOpen: true } };
export const DisabledTrue: Story = { args: { disabled: true } };
export const DisabledOpen: Story = { args: { disabled: true, defaultOpen: true } };

export const Accordion: Story = {
  render: () => html`
    <ds-stack gap="0">
      <ds-disclosure summary="Can I change plans later?" heading-level="3">
        <ds-text>Yes. Upgrades apply immediately; downgrades apply at the next renewal.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3">
        <ds-text>Annual plans can be refunded within 14 days of purchase.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="What happens if I cancel?" heading-level="3">
        <ds-text>Your workspace becomes read-only at the end of the billing period.</ds-text>
      </ds-disclosure>
    </ds-stack>
  `,
};

export const KeepMountedTrue: Story = {
  render: () => html`
    <ds-disclosure summary="Advanced options" keep-mounted>
      <ds-text>Rendered while closed (hidden), so form fields inside are still collected.</ds-text>
    </ds-disclosure>
  `,
};
