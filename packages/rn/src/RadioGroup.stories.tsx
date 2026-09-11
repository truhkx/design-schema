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
      { value: 'standard', label: 'Standard', description: 'Free, 3–5 business days' },
      { value: 'express', label: 'Express', description: '$9, next business day' },
      { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' },
    ],
    defaultValue: 'standard',
    orientation: 'vertical',
    required: false,
    invalid: false,
    disabled: false,
    description: undefined,
    error: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {};

// orientation
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };
export const OrientationHorizontal: Story = {
  args: {
    label: 'Units',
    name: 'units',
    orientation: 'horizontal',
    options: [
      { value: 'metric', label: 'Metric' },
      { value: 'imperial', label: 'Imperial' },
    ],
    defaultValue: 'metric',
  },
};

/** Nothing selected until the user chooses; required shows in the legend. */
export const Required: Story = { args: { defaultValue: undefined, required: true } };

export const WithError: Story = { args: { defaultValue: undefined, required: true, error: 'Choose a shipping method.' } };

export const Invalid: Story = { args: { invalid: true } };

export const WithDescription: Story = { args: { description: 'Delivery times are estimates.' } };

export const OptionDisabled: Story = {
  args: {
    options: [
      { value: 'standard', label: 'Standard', description: 'Free, 3–5 business days' },
      { value: 'express', label: 'Express', description: 'Not available for this address', disabled: true },
      { value: 'pickup', label: 'Pick up in store', description: 'Ready in 2 hours' },
    ],
  },
};

export const Disabled: Story = { args: { disabled: true } };
