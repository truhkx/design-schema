import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Checkbox.js';
import './Stack.js';

interface CheckboxArgs {
  label: string;
  hideLabel: boolean;
  name: string;
  value: string;
  defaultChecked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  invalid: boolean;
  description?: string | undefined;
  error?: string | undefined;
}

const meta: Meta<CheckboxArgs> = {
  title: 'Checkbox/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    hideLabel: { control: 'boolean' },
    defaultChecked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Send me product updates',
    hideLabel: false,
    name: 'updates',
    value: 'on',
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    invalid: false,
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
      ?hide-label=${args.hideLabel}
      ?default-checked=${args.defaultChecked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
      ?required=${args.required}
      ?invalid=${args.invalid}
    ></ds-checkbox>
  `,
};

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Default: Story = {};

/* states */
export const DefaultCheckedTrue: Story = { args: { defaultChecked: true } };
export const IndeterminateTrue: Story = { args: { indeterminate: true } };
export const DisabledTrue: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };
export const RequiredTrue: Story = { args: { required: true } };
export const InvalidTrue: Story = { args: { invalid: true } };
export const HideLabelTrue: Story = { args: { hideLabel: true } };
export const ErrorSet: Story = { args: { error: 'Accept the terms to continue.' } };

/* examples */
export const Consent: Story = {
  args: { label: 'I accept the terms of service', name: 'terms', required: true },
};

export const SelectAllParent: Story = {
  args: { label: 'Select all', name: 'selectAll', indeterminate: true },
};

export const WithDescription: Story = {
  args: {
    label: 'Send me product updates',
    name: 'updates',
    description: 'One email a month about new features.',
  },
};

export const SelectionColumn: Story = {
  args: { label: 'Select row', name: 'select', hideLabel: true },
};

export const MultiSelect: Story = {
  render: () => html`
    <ds-stack>
      <ds-checkbox name="channelEmail" label="Email" default-checked></ds-checkbox>
      <ds-checkbox name="channelSms" label="Text message"></ds-checkbox>
      <ds-checkbox name="channelPush" label="Push notification"></ds-checkbox>
    </ds-stack>
  `,
};
