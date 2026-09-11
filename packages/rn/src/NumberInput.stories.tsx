import type { Meta, StoryObj } from '@storybook/react-vite';
import { NumberInput } from './NumberInput';
import { withTheme } from './decorators';

const meta: Meta<typeof NumberInput> = {
  title: 'NumberInput/React Native',
  component: NumberInput,
  decorators: [withTheme()],
  args: {
    label: 'Quantity',
    name: 'quantity',
    defaultValue: 1,
    min: 0,
    max: 99,
    step: 1,
    format: 'decimal',
    required: false,
    disabled: false,
    invalid: false,
  },
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {};

// format
export const FormatDecimal: Story = { args: { format: 'decimal' } };
export const FormatCurrency: Story = {
  args: { format: 'currency', currency: 'USD', label: 'Price', name: 'price', defaultValue: 19.99, min: 0, max: undefined, step: 0.01 },
};
export const FormatPercent: Story = {
  args: { format: 'percent', label: 'Discount', name: 'discount', defaultValue: 25, min: 0, max: 100, step: 1 },
};
export const FormatUnit: Story = {
  args: { format: 'unit', unit: 'kilogram', label: 'Weight', name: 'weight', defaultValue: 2.5, min: 0, max: undefined, step: 0.1 },
};

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// notable states
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Quantity must be a number.' } };
export const HideLabel: Story = { args: { hideLabel: true } };
export const HideSteppers: Story = { args: { hideSteppers: true } };
export const WithAffixes: Story = {
  args: { leadingText: '$', trailingText: 'kg', label: 'Amount', name: 'amount', min: undefined, max: undefined },
};
