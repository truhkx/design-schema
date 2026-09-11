import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './NumberInput.js';
import type { NumberInputFormat } from './NumberInput.js';

interface NumberInputArgs {
  label: string;
  name: string;
  min?: number | undefined;
  max?: number | undefined;
  step: number;
  precision?: number | undefined;
  format: NumberInputFormat;
  currency?: string | undefined;
  unit?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  showSteppers: boolean;
  placeholder?: string | undefined;
  description?: string | undefined;
  value?: number | undefined;
  defaultValue?: number | undefined;
  required: boolean;
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
    showSteppers: { control: 'boolean' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: {
    label: 'Quantity',
    name: 'qty',
    min: 1,
    max: 99,
    step: 1,
    precision: undefined,
    format: 'decimal',
    currency: undefined,
    unit: undefined,
    prefix: undefined,
    suffix: undefined,
    showSteppers: true,
    placeholder: undefined,
    description: undefined,
    value: undefined,
    defaultValue: undefined,
    required: false,
    disabled: false,
    invalid: false,
    error: undefined,
  },
  render: (args) => html`
    <div style="inline-size: min(100%, 20rem)">
      <ds-number-input
        label=${args.label}
        name=${args.name}
        min=${ifDefined(args.min)}
        max=${ifDefined(args.max)}
        step=${args.step}
        precision=${ifDefined(args.precision)}
        format=${args.format}
        currency=${ifDefined(args.currency)}
        unit=${ifDefined(args.unit)}
        .prefix=${args.prefix ?? null}
        suffix=${ifDefined(args.suffix)}
        .showSteppers=${args.showSteppers}
        placeholder=${ifDefined(args.placeholder)}
        description=${ifDefined(args.description)}
        .value=${args.value}
        .defaultValue=${args.defaultValue}
        ?required=${args.required}
        ?disabled=${args.disabled}
        ?invalid=${args.invalid}
        error=${ifDefined(args.error)}
      ></ds-number-input>
    </div>
  `,
};

export default meta;
type Story = StoryObj<NumberInputArgs>;

export const Default: Story = {};

/* format */
export const FormatDecimal: Story = { args: { format: 'decimal', defaultValue: 1234.5, min: undefined, max: undefined } };
export const FormatCurrency: Story = {
  args: { label: 'Price', name: 'price', format: 'currency', currency: 'USD', defaultValue: 19.99, min: 0, max: undefined, precision: 2 },
};
export const FormatPercent: Story = {
  args: { label: 'Discount', name: 'discount', format: 'percent', defaultValue: 15, min: 0, max: 100 },
};
export const FormatUnit: Story = {
  args: { label: 'Weight', name: 'weight', format: 'unit', unit: 'kilogram', defaultValue: 2.5, min: 0, max: undefined, precision: 1 },
};

export const WithPrefixAndSuffix: Story = {
  args: { label: 'Budget', name: 'budget', prefix: '$', suffix: '/mo', defaultValue: 50, min: 0, max: undefined },
};

export const HiddenSteppers: Story = { args: { showSteppers: false, defaultValue: 5 } };

export const WithDescription: Story = {
  args: { description: 'How many to order.', defaultValue: 3 },
};

export const RequiredField: Story = { args: { required: true } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 5 } };

export const Invalid: Story = { args: { invalid: true, defaultValue: 5 } };

export const ErrorState: Story = {
  args: { error: 'Fix this before continuing.', defaultValue: 5 },
};

/**
 * Renders the field with its steppers, so the keyboard gate can verify arrow
 * keys, Page Up/Down, Home/End and Enter on the single tab stop.
 */
export const Keyboard: Story = {
  args: { defaultValue: 5 },
};
