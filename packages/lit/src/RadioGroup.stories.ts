import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './RadioGroup.js';
import type { RadioGroupOption, RadioGroupOrientation } from './RadioGroup.js';

interface RadioGroupArgs {
  label: string;
  name: string;
  options: RadioGroupOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  orientation: RadioGroupOrientation;
  required: boolean;
  invalid: boolean;
  disabled: boolean;
  description?: string | undefined;
  error?: string | undefined;
}

const shippingOptions: RadioGroupOption[] = [
  { value: 'standard', label: 'Standard', description: 'Free, 3 to 5 business days' },
  { value: 'express', label: 'Express', description: 'Next business day' },
  { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' },
];

const meta: Meta<RadioGroupArgs> = {
  title: 'RadioGroup/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: shippingOptions,
    value: undefined,
    defaultValue: undefined,
    orientation: 'vertical',
    required: false,
    invalid: false,
    disabled: false,
    description: undefined,
    error: undefined,
  },
  render: (args) => html`
    <ds-radio-group
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      value=${ifDefined(args.value)}
      default-value=${ifDefined(args.defaultValue)}
      orientation=${args.orientation}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      ?required=${args.required}
      ?invalid=${args.invalid}
      ?disabled=${args.disabled}
    ></ds-radio-group>
  `,
};

export default meta;
type Story = StoryObj<RadioGroupArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };

/* states */
export const RequiredTrue: Story = { args: { required: true } };
export const InvalidTrue: Story = { args: { invalid: true } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'standard' } };
export const WithDescription: Story = { args: { description: 'Delivery times are estimates.' } };
export const ErrorSet: Story = { args: { error: 'Choose a shipping method to continue.' } };

/* keyboard: one tab stop, three radios moved between with the arrows */
export const Keyboard: Story = {};

/* examples */
export const ShippingMethod: Story = {
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: [
      { value: 'standard', label: 'Standard', description: 'Free, 3 to 5 business days' },
      { value: 'express', label: 'Express', description: 'Next business day' },
      { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' },
    ],
  },
};

export const HorizontalPair: Story = {
  args: {
    label: 'Send a receipt',
    name: 'receipt',
    orientation: 'horizontal',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
};

export const RequiredWithAGroupError: Story = {
  args: {
    label: 'Plan',
    name: 'plan',
    required: true,
    error: 'Choose a plan to continue.',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
    ],
  },
};

export const WithADisabledOption: Story = {
  args: {
    label: 'Delivery window',
    name: 'window',
    defaultValue: 'morning',
    options: [
      { value: 'morning', label: 'Morning' },
      { value: 'evening', label: 'Evening', disabled: true },
    ],
  },
};
