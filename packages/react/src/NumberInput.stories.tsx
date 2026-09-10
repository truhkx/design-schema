import type { Meta, StoryObj } from '@storybook/react';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'NumberInput/React',
  component: NumberInput,
  args: {
    label: 'Quantity',
    name: 'quantity',
    defaultValue: 1,
    min: 0,
    max: 10,
    step: 1,
    format: 'decimal',
    size: 'md',
    hideSteppers: false,
    required: false,
    hideLabel: false,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '20rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* format */
export const FormatDecimal: Story = {
  args: { format: 'decimal', label: 'Quantity', name: 'quantity', defaultValue: 1234.5, precision: 1, min: undefined, max: undefined },
};
export const FormatCurrency: Story = {
  args: { format: 'currency', currency: 'USD', label: 'Price', name: 'price', defaultValue: 19.99, precision: 2, min: 0 },
};
export const FormatPercent: Story = {
  args: { format: 'percent', label: 'Discount', name: 'discount', defaultValue: 25, min: 0, max: 100 },
};
export const FormatUnit: Story = {
  args: { format: 'unit', unit: 'kilogram', label: 'Weight', name: 'weight', defaultValue: 3.5, precision: 1, min: 0 },
};

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

/* hideSteppers */
export const HideSteppersFalse: Story = { args: { hideSteppers: false } };
export const HideSteppersTrue: Story = { args: { hideSteppers: true } };

/* affixes */
export const WithLeadingText: Story = {
  args: { label: 'Budget', name: 'budget', leadingText: '$', defaultValue: 500, min: 0, format: 'decimal' },
};
export const WithTrailingText: Story = {
  args: { label: 'Duration', name: 'duration', trailingText: 'min', defaultValue: 30, min: 0, format: 'decimal' },
};

/* states */
export const Required: Story = { args: { required: true } };
export const HideLabel: Story = {
  args: { label: 'Quantity', hideLabel: true },
};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithDescription: Story = {
  args: { description: 'Whole units only.' },
};
export const WithError: Story = {
  args: { error: 'Quantity must be between 0 and 10.' },
};

export const Keyboard: Story = {
  args: {
    label: 'Quantity',
    name: 'quantity',
    defaultValue: 5,
    min: 0,
    max: 10,
    step: 1,
  },
};
