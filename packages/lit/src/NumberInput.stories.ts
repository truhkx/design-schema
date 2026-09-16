import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './NumberInput.js';
import type { NumberInputFormat, NumberInputSize } from './NumberInput.js';

interface NumberInputArgs {
  label: string;
  name: string;
  value?: number | null | undefined;
  defaultValue?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step: number;
  precision?: number | undefined;
  format: NumberInputFormat;
  currency?: string | undefined;
  unit?: string | undefined;
  leadingText?: string | undefined;
  trailingText?: string | undefined;
  hideSteppers: boolean;
  placeholder?: string | undefined;
  description?: string | undefined;
  required: boolean;
  hideLabel: boolean;
  size: NumberInputSize;
  disabled: boolean;
  invalid: boolean;
  error?: string | undefined;
}

const meta: Meta<NumberInputArgs> = {
  title: 'NumberInput/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    format: { control: 'select', options: ['decimal', 'currency', 'percent', 'unit'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    hideSteppers: { control: 'boolean' },
    hideLabel: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Quantity',
    name: 'quantity',
    step: 1,
    format: 'decimal',
    hideSteppers: false,
    required: false,
    hideLabel: false,
    size: 'md',
    disabled: false,
    invalid: false,
  },
  render: (args) => html`
    <ds-number-input
      label=${args.label}
      name=${args.name}
      .value=${args.value}
      .defaultValue=${args.defaultValue}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      .precision=${args.precision}
      format=${args.format}
      currency=${ifDefined(args.currency)}
      unit=${ifDefined(args.unit)}
      leading-text=${ifDefined(args.leadingText)}
      trailing-text=${ifDefined(args.trailingText)}
      ?hide-steppers=${args.hideSteppers}
      placeholder=${ifDefined(args.placeholder)}
      description=${ifDefined(args.description)}
      ?required=${args.required}
      ?hide-label=${args.hideLabel}
      size=${args.size}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
      error=${ifDefined(args.error)}
    ></ds-number-input>
  `,
};

export default meta;
type Story = StoryObj<NumberInputArgs>;

export const Default: Story = {};

/* format */
export const FormatDecimal: Story = { args: { format: 'decimal', defaultValue: 1234.5, step: 0.1 } };
export const FormatCurrency: Story = { args: { format: 'currency', currency: 'USD', step: 0.01, defaultValue: 19.99 } };
export const FormatPercent: Story = { args: { format: 'percent', min: 0, max: 100, step: 5, defaultValue: 10 } };
export const FormatUnit: Story = { args: { format: 'unit', unit: 'kilogram', step: 0.5, defaultValue: 2.5 } };

/* size */
export const SizeSm: Story = { args: { size: 'sm', defaultValue: 3 } };
export const SizeMd: Story = { args: { size: 'md', defaultValue: 3 } };

/* states */
export const WithDescription: Story = { args: { description: 'How many to order.', defaultValue: 3 } };
export const WithLeadingText: Story = { args: { label: 'Budget', name: 'budget', leadingText: '$', defaultValue: 50 } };
export const HideSteppers: Story = { args: { hideSteppers: true, defaultValue: 5 } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 5 } };
export const Invalid: Story = { args: { invalid: true, defaultValue: 5 } };
export const WithError: Story = { args: { error: 'Fix this before continuing.', defaultValue: 5 } };

/* examples */
export const Quantity: Story = {
  args: { label: 'Quantity', name: 'quantity', min: 1, max: 99, defaultValue: 1 },
};
export const PriceInCurrency: Story = {
  args: { label: 'Price', name: 'price', format: 'currency', currency: 'USD', step: 0.01, defaultValue: 19.99 },
};
export const Percentage: Story = {
  args: { label: 'Discount', name: 'discount', format: 'percent', min: 0, max: 100, step: 5, defaultValue: 10 },
};
export const CompactCellEditor: Story = {
  args: {
    label: 'Weight',
    name: 'weight',
    size: 'sm',
    hideLabel: true,
    hideSteppers: true,
    trailingText: 'kg',
    defaultValue: 2,
  },
};

/**
 * The keyboard model on the single tab stop: ArrowUp/Down, PageUp/Down,
 * Home/End (bounds are set) and Enter.
 */
export const Keyboard: Story = {
  args: { min: 0, max: 20, defaultValue: 5 },
};
