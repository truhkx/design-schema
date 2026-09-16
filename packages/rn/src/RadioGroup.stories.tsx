import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup } from './RadioGroup';
import { withTheme } from './decorators';

const meta: Meta<typeof RadioGroup> = {
  title: 'RadioGroup/React Native',
  component: RadioGroup,
  decorators: [withTheme()],
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
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {};

// orientation
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };
export const OrientationHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
};

/** Three radios, each its own focus stop on native (no roving tabindex): Tab/Shift+Tab move, Space/Enter select. */
export const Keyboard: Story = {};

export const Required: Story = { args: { required: true } };

export const Invalid: Story = { args: { invalid: true } };

export const WithDescription: Story = { args: { description: 'Delivery times are estimates.' } };

export const Disabled: Story = { args: { disabled: true, defaultValue: 'standard' } };

// examples
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
