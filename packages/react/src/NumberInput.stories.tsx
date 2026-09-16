import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'NumberInput/React',
  component: NumberInput,
  tags: ['autodocs'],
  args: {
    label: 'Quantity',
    name: 'quantity',
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
    format: { control: 'inline-radio', options: ['decimal', 'currency', 'percent', 'unit'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    onChange: { action: 'onChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* format */
export const FormatDecimal: Story = { args: { format: 'decimal', defaultValue: 1234.5, precision: 1 } };
export const FormatCurrency: Story = {
  args: { format: 'currency', currency: 'USD', label: 'Price', name: 'price', step: 0.01, defaultValue: 19.99 },
};
export const FormatPercent: Story = {
  args: { format: 'percent', label: 'Discount', name: 'discount', min: 0, max: 100, step: 5, defaultValue: 25 },
};
export const FormatUnit: Story = {
  args: { format: 'unit', unit: 'kilogram', label: 'Weight', name: 'weight', step: 0.5, defaultValue: 3.5 },
};

/* size */
export const SizeSm: Story = { args: { size: 'sm', defaultValue: 3 } };
export const SizeMd: Story = { args: { size: 'md', defaultValue: 3 } };

/* states */
export const HideSteppers: Story = { args: { hideSteppers: true, defaultValue: 3 } };
export const WithLeadingText: Story = {
  args: { label: 'Budget', name: 'budget', leadingText: '$', min: 0, defaultValue: 500 },
};
export const WithTrailingText: Story = {
  args: { label: 'Duration', name: 'duration', trailingText: 'min', min: 0, defaultValue: 30 },
};
export const WithDescription: Story = { args: { description: 'Whole units only.', defaultValue: 1 } };
export const Placeholder: Story = { args: { label: 'Weight (kg)', name: 'weight', placeholder: '12.5', step: 0.1 } };
export const Required: Story = { args: { required: true } };
export const HideLabel: Story = { args: { hideLabel: true, defaultValue: 1 } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 5 } };
export const Invalid: Story = { args: { invalid: true, defaultValue: 5 } };
export const WithError: Story = { args: { error: 'Quantity must be between 1 and 99.', defaultValue: 120 } };

/* keyboard: ArrowUp/Down, PageUp/Down, Home/End (bounds set), Enter commits. */
export const Keyboard: Story = { args: { defaultValue: 5, min: 0, max: 10, step: 1 } };

/* examples */
export const Quantity: Story = { args: { label: 'Quantity', name: 'quantity', min: 1, max: 99, defaultValue: 1 } };
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
