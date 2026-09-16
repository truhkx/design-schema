import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'RadioGroup/React',
  component: RadioGroup,
  tags: ['autodocs'],
  args: {
    label: 'Shipping method',
    name: 'shipping',
    options: [
      { value: 'standard', label: 'Standard', description: 'Free, 3 to 5 business days' },
      { value: 'express', label: 'Express', description: 'Next business day' },
      { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' },
    ],
    orientation: 'vertical',
    required: false,
    invalid: false,
    disabled: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };
export const OrientationHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    label: 'Send a receipt',
    name: 'receipt',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
};

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

/* keyboard: one tab stop, native arrows move and select across three radios. */
export const Keyboard: Story = {};

/* states */
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'standard' } };
export const WithDescription: Story = {
  args: { description: 'Delivery times are estimates from the day the order ships.' },
};
export const Controlled: Story = { args: { value: 'express' } };
