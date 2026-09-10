import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './RadioGroup.js';
import type { RadioGroupOption, RadioGroupOrientation } from './RadioGroup.js';

interface RadioGroupArgs {
  label: string;
  name: string;
  options: RadioGroupOption[];
  defaultValue?: string;
  orientation: RadioGroupOrientation;
  required: boolean;
  disabled: boolean;
  description?: string;
  error?: string;
}

const shippingOptions: RadioGroupOption[] = [
  { value: 'standard', label: 'Standard', description: 'Arrives in 3–5 business days' },
  { value: 'express', label: 'Express', description: 'Arrives in 1–2 business days' },
  { value: 'pickup', label: 'Store pickup', description: 'Ready today' },
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
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: shippingOptions,
    defaultValue: undefined,
    orientation: 'vertical',
    required: false,
    disabled: false,
    description: undefined,
    error: undefined,
  },
  render: (args) => html`
    <ds-radio-group
      label=${args.label}
      name=${args.name}
      .options=${args.options}
      default-value=${ifDefined(args.defaultValue)}
      orientation=${args.orientation}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      ?required=${args.required}
      ?disabled=${args.disabled}
    ></ds-radio-group>
  `,
};

export default meta;
type Story = StoryObj<RadioGroupArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };
export const OrientationHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    label: 'Units',
    name: 'units',
    options: [
      { value: 'metric', label: 'Metric' },
      { value: 'imperial', label: 'Imperial' },
    ],
    defaultValue: 'metric',
  },
};

/* boolean states */
export const WithDefaultValue: Story = { args: { defaultValue: 'standard' } };
export const RequiredTrue: Story = { args: { required: true } };
export const DisabledTrue: Story = { args: { disabled: true, defaultValue: 'standard' } };
export const DisabledOption: Story = {
  args: {
    options: [
      ...shippingOptions.slice(0, 2),
      { value: 'pickup', label: 'Store pickup', description: 'Not available in your area', disabled: true },
    ],
  },
};

export const WithDescription: Story = {
  args: { description: 'Delivery times are estimates.' },
};

export const ErrorSet: Story = {
  args: { required: true, error: 'Shipping method is required.' },
};
