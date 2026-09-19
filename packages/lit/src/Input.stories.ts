import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Input.js';
import type { InputSize, InputType } from './Input.js';

interface InputArgs {
  label: string;
  name: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  placeholder?: string | undefined;
  description?: string | undefined;
  type?: InputType | undefined;
  size?: InputSize | undefined;
  required?: boolean | undefined;
  hideLabel?: boolean | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  error?: string | undefined;
  autocomplete?: string | undefined;
}

const meta: Meta<InputArgs> = {
  title: 'Input/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change', 'focus', 'blur'] },
  },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] },
    size: { control: 'select', options: ['sm', 'md'] },
    required: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Email address',
    name: 'email',
  },
  render: (args) => html`
    <ds-input
      label=${args.label}
      name=${args.name}
      type=${ifDefined(args.type)}
      size=${ifDefined(args.size)}
      .value=${args.value}
      default-value=${ifDefined(args.defaultValue)}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      autocomplete=${ifDefined(args.autocomplete)}
      ?required=${args.required ?? false}
      ?hide-label=${args.hideLabel ?? false}
      ?disabled=${args.disabled ?? false}
      ?invalid=${args.invalid ?? false}
    ></ds-input>
  `,
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {};

/* type */
export const TypeText: Story = { args: { type: 'text' } };
export const TypeEmail: Story = { args: { type: 'email' } };
export const TypePassword: Story = { args: { type: 'password' } };
export const TypeNumber: Story = { args: { type: 'number' } };
export const TypeSearch: Story = { args: { type: 'search' } };
export const TypeTel: Story = { args: { type: 'tel' } };
export const TypeUrl: Story = { args: { type: 'url' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* states */
export const Required: Story = { args: { required: true } };
export const HideLabel: Story = { args: { hideLabel: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const InvalidRequiredEmpty: Story = { args: { invalid: true, required: true } };
export const WithPlaceholder: Story = { args: { placeholder: 'name@example.com' } };

/* examples */
export const EmailWithADescription: Story = {
  args: {
    label: 'Email address',
    name: 'email',
    type: 'email',
    description: 'Use the email you signed up with.',
  },
};

export const RequiredField: Story = {
  args: { label: 'Full name', name: 'name', required: true },
};

export const FieldWithAnError: Story = {
  args: {
    label: 'Email address',
    name: 'email',
    type: 'email',
    error: 'Enter an email address like name@example.com',
  },
};

export const DenseGridEditor: Story = {
  args: { label: 'Quantity', name: 'quantity', type: 'number', size: 'sm', hideLabel: true },
};
