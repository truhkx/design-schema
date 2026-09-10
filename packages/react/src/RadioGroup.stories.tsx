import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup } from './RadioGroup';

const shipping = [
  { value: 'standard', label: 'Standard', description: 'Free, 3–5 business days' },
  { value: 'express', label: 'Express', description: '$9, next business day' },
  { value: 'pickup', label: 'Pick up in store', description: 'Free, ready in 2 hours' },
];

const meta = {
  title: 'RadioGroup/React',
  component: RadioGroup,
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: shipping,
    orientation: 'vertical',
    required: false,
    invalid: false,
    disabled: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

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
  },
};

/* states */
export const WithDefaultValue: Story = { args: { defaultValue: 'standard' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'standard' } };
export const DisabledOption: Story = {
  args: {
    options: [
      ...shipping.slice(0, 2),
      { value: 'pickup', label: 'Pick up in store', description: 'Not available in your area', disabled: true },
    ],
  },
};
export const WithDescription: Story = {
  args: { description: 'Delivery times are estimates from the day the order ships.' },
};
export const Invalid: Story = { args: { invalid: true } };
export const WithError: Story = {
  args: { required: true, error: 'Shipping method is required.' },
};
export const Controlled: Story = { args: { value: 'express' } };
