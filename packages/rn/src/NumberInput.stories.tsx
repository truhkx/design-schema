import * as React from 'react';
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
  },
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {};

// format
export const FormatDecimal: Story = { args: { format: 'decimal', defaultValue: 1234.5, step: 0.1 } };
export const FormatCurrency: Story = { args: { format: 'currency', currency: 'USD', defaultValue: 19.99, step: 0.01 } };
export const FormatPercent: Story = { args: { format: 'percent', defaultValue: 25 } };
export const FormatUnit: Story = { args: { format: 'unit', unit: 'kilogram', defaultValue: 2.5, step: 0.1 } };

// size
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };

// examples
export const Quantity: Story = { args: { label: 'Quantity', name: 'quantity', min: 1, max: 99, defaultValue: 1 } };
export const PriceInCurrency: Story = {
  args: { label: 'Price', name: 'price', format: 'currency', currency: 'USD', step: 0.01, defaultValue: 19.99 },
};
export const Percentage: Story = {
  args: { label: 'Discount', name: 'discount', format: 'percent', min: 0, max: 100, step: 5, defaultValue: 10 },
};
export const CompactCellEditor: Story = {
  args: { label: 'Weight', name: 'weight', size: 'sm', hideLabel: true, hideSteppers: true, trailingText: 'kg', defaultValue: 2 },
};

// notable states
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 5 } };
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = { args: { error: 'Quantity must be a number.' } };
export const WithDescription: Story = { args: { description: 'Up to 99 per order.', min: 1, max: 99, defaultValue: 1 } };
export const HideSteppers: Story = { args: { hideSteppers: true, defaultValue: 5 } };
export const WithAffixes: Story = { args: { label: 'Amount', name: 'amount', leadingText: '$', trailingText: 'kg', defaultValue: 2 } };

/**
 * One field with bounds so Home and End have somewhere to go: ArrowUp/Down step, PageUp/Down step by
 * ten, Home/End jump to the bounds on a hardware keyboard, Enter commits. The field is a single tab
 * stop, so the three-focusable-children rule does not apply here.
 */
export const Keyboard: Story = {
  args: { min: 0, max: 20, defaultValue: 5 },
};
