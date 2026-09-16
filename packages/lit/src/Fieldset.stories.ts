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
  /** The examples' `children`, as the doc words them; rendered as the fields they describe. */
  children?: string | undefined;
}

const addressFields = (): TemplateResult => html`
  <ds-input name="street" label="Street"></ds-input>
  <ds-input name="city" label="City"></ds-input>
`;

/** Real fields for each `children` description the examples give. */
const CHILDREN: Record<string, () => TemplateResult> = {
  'Street and city Inputs.': addressFields,
  'Email, SMS and Push Checkboxes.': () => html`
    <ds-checkbox name="email" label="Email"></ds-checkbox>
    <ds-checkbox name="sms" label="SMS"></ds-checkbox>
    <ds-checkbox name="push" label="Push"></ds-checkbox>
  `,
  'Start date and End date Inputs.': () => html`
    <ds-input name="start" label="Start date"></ds-input>
    <ds-input name="end" label="End date"></ds-input>
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
    disabled: false,
    gap: 'normal',
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

/* notable states */
export const WithDescription: Story = { args: { description: 'We only ship within the EU.' } };
export const ErrorSet: Story = { args: { error: 'End date must be after start date.' } };
export const DisabledTrue: Story = { args: { disabled: true } };
export const AllFieldsRequired: Story = {
  render: (args) => html`
    <ds-fieldset legend=${args.legend} gap=${args.gap ?? 'normal'}>
      <ds-input name="street" label="Street" required></ds-input>
      <ds-input name="city" label="City" required></ds-input>
    </ds-fieldset>
  `,
};

/* examples */
export const ShippingAddress: Story = {
  args: { legend: 'Shipping address', children: 'Street and city Inputs.' },
};

export const NotificationPreferences: Story = {
  args: {
    legend: 'Notification preferences',
    description: 'You can change these at any time.',
    children: 'Email, SMS and Push Checkboxes.',
    gap: 'tight',
  },
};

export const DateRangeWithAGroupError: Story = {
  args: {
    legend: 'Reporting period',
    error: 'End date must be after start date.',
    children: 'Start date and End date Inputs.',
  },
};

export const DisabledGroup: Story = {
  args: { legend: 'Billing address', disabled: true, children: 'Street and city Inputs.' },
};
