import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Checkbox.js';
import './Stack.js';

interface CheckboxArgs {
  label: string;
  name: string;
  value: string;
  defaultChecked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  description?: string;
  error?: string;
}

const meta: Meta<CheckboxArgs> = {
  title: 'Checkbox/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    defaultChecked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Send me product updates',
    name: 'updates',
    value: 'on',
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    description: undefined,
    error: undefined,
  },
  render: (args) => html`
    <ds-checkbox
      label=${args.label}
      name=${args.name}
      value=${args.value}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      ?default-checked=${args.defaultChecked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></ds-checkbox>
  `,
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {};

/* boolean states */
export const DefaultCheckedTrue: Story = { args: { defaultChecked: true } };
export const IndeterminateTrue: Story = {
  args: { indeterminate: true, label: 'Select all', name: 'all' },
};
export const DisabledTrue: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const RequiredTrue: Story = {
  args: { required: true, label: 'I agree to the terms', name: 'terms' },
};

export const WithDescription: Story = {
  args: { description: 'About one email a month. Unsubscribe any time.' },
};

export const ErrorSet: Story = {
  args: {
    required: true,
    label: 'I agree to the terms',
    name: 'terms',
    error: 'Accept the terms to create your account.',
  },
};

export const MultiSelect: Story = {
  render: () => html`
    <ds-stack gap="0">
      <ds-checkbox name="channels" value="email" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channels" value="sms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channels" value="push" label="Push notification"></ds-checkbox>
    </ds-stack>
  `,
};
