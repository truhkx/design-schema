import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Fieldset.js';
import './Input.js';
import './Checkbox.js';
import type { FieldsetGap } from './Fieldset.js';

interface FieldsetArgs {
  legend: string;
  description?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  gap?: FieldsetGap | undefined;
  /** The examples' `children`, worded as the doc words them; rendered as the fields they describe. */
  children?: string | undefined;
}

/** The `children` each example describes, keyed by the doc's own wording. */
const ADDRESS = 'An Input name=street label=Street and an Input name=city label=City';
const REQUIRED_ADDRESS = 'A required Input name=street label=Street and a required Input name=city label=City';
const NOTIFICATIONS =
  'A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and a Checkbox name=push label=Push';
const DATE_RANGE = 'An Input name=startDate label=Start date and an Input name=endDate label=End date';

const addressFields = (): TemplateResult => html`
  <ds-input name="street" label="Street"></ds-input>
  <ds-input name="city" label="City"></ds-input>
`;

const CHILDREN: Record<string, () => TemplateResult> = {
  [ADDRESS]: addressFields,
  [REQUIRED_ADDRESS]: () => html`
    <ds-input name="street" label="Street" required></ds-input>
    <ds-input name="city" label="City" required></ds-input>
  `,
  [NOTIFICATIONS]: () => html`
    <ds-checkbox name="email" label="Email"></ds-checkbox>
    <ds-checkbox name="sms" label="SMS"></ds-checkbox>
    <ds-checkbox name="push" label="Push"></ds-checkbox>
  `,
  [DATE_RANGE]: () => html`
    <ds-input name="startDate" label="Start date"></ds-input>
    <ds-input name="endDate" label="End date"></ds-input>
  `,
};

const meta: Meta<FieldsetArgs> = {
  title: 'Fieldset/Lit',
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: ['tight', 'normal', 'loose'] },
    disabled: { control: 'boolean' },
    children: { control: 'select', options: Object.keys(CHILDREN) },
  },
  args: {
    legend: 'Shipping address',
    gap: 'normal',
    disabled: false,
    children: ADDRESS,
  },
  render: (args) => html`
    <ds-fieldset
      legend=${args.legend}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      gap=${args.gap ?? 'normal'}
      ?disabled=${args.disabled ?? false}
    >
      ${(CHILDREN[args.children ?? ''] ?? addressFields)()}
    </ds-fieldset>
  `,
};

export default meta;
type Story = StoryObj<FieldsetArgs>;

export const Default: Story = {};

/* gap */
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };

/* states */
export const WithDescription: Story = { args: { description: 'We only ship within the EU.' } };
export const RequiredIndicator: Story = { args: { children: REQUIRED_ADDRESS } };
export const WithError: Story = {
  args: { error: 'End date must be after start date.', children: DATE_RANGE },
};
export const Disabled: Story = { args: { disabled: true } };

/* examples */
export const ShippingAddress: Story = {
  args: { legend: 'Shipping address', children: ADDRESS },
};

export const NotificationPreferences: Story = {
  args: {
    legend: 'Notification preferences',
    description: 'You can change these at any time.',
    children: NOTIFICATIONS,
    gap: 'tight',
  },
};

export const DateRangeWithAGroupError: Story = {
  args: { legend: 'Reporting period', error: 'End date must be after start date.', children: DATE_RANGE },
};

export const DisabledGroup: Story = {
  args: { legend: 'Billing address', disabled: true, children: ADDRESS },
};
