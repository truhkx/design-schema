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
  type: InputType;
  size: InputSize;
  required: boolean;
  hideLabel: boolean;
  disabled: boolean;
  invalid: boolean;
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
    type: 'text',
    size: 'md',
    required: false,
    hideLabel: false,
    disabled: false,
    invalid: false,
    description: undefined,
    placeholder: undefined,
    error: undefined,
    autocomplete: undefined,
  },
  render: (args) => html`
    <ds-input
      label=${args.label}
      name=${args.name}
      type=${args.type}
      size=${args.size}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      autocomplete=${ifDefined(args.autocomplete)}
      ?required=${args.required}
      ?hide-label=${args.hideLabel}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    ></ds-input>
  `,
};

export default meta;
type Story = StoryObj<InputArgs>;

export const Default: Story = {};

/* type */
export const TypeText: Story = { args: { type: 'text', label: 'Full name', name: 'name', autocomplete: 'name' } };
export const TypeEmail: Story = { args: { type: 'email', label: 'Email address', name: 'email', autocomplete: 'email' } };
export const TypePassword: Story = {
  args: { type: 'password', label: 'Password', name: 'password', autocomplete: 'current-password' },
};
export const TypeNumber: Story = { args: { type: 'number', label: 'Seats', name: 'seats' } };
export const TypeSearch: Story = { args: { type: 'search', label: 'Search', name: 'q', placeholder: 'Search projects' } };
export const TypeTel: Story = { args: { type: 'tel', label: 'Phone number', name: 'tel', autocomplete: 'tel' } };
export const TypeUrl: Story = { args: { type: 'url', label: 'Website', name: 'url', autocomplete: 'url' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* states */
export const WithDescription: Story = {
  args: { type: 'email', description: 'Use the email you signed up with.', autocomplete: 'email' },
};
export const Required: Story = { args: { required: true } };
export const HideLabel: Story = { args: { hideLabel: true, placeholder: 'Search projects', type: 'search' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'name@example.com' } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = {
  args: { type: 'email', error: 'Enter an email address like name@example.com' },
};
