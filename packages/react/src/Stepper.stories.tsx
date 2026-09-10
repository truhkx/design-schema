import type { Meta, StoryObj } from '@storybook/react';
import { Stepper, type StepperStep } from './Stepper';

const steps: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
  { id: 'confirm', label: 'Confirmation' },
];

const stepsWithDescriptions: StepperStep[] = [
  { id: 'account', label: 'Create account', description: 'Takes about a minute.' },
  { id: 'verify', label: 'Verify identity', description: 'Takes about 2 minutes.' },
  { id: 'plan', label: 'Choose a plan', description: 'Compare features and pricing.' },
  { id: 'done', label: 'Done', description: 'Review and confirm.' },
];

const stepsWithError: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address', status: 'complete' },
  { id: 'payment', label: 'Payment', status: 'error' },
  { id: 'review', label: 'Review order' },
  { id: 'confirm', label: 'Confirmation' },
];

const meta = {
  title: 'Stepper/React',
  component: Stepper,
  args: {
    steps,
    current: 'payment',
    orientation: 'horizontal',
    navigable: 'completed',
    compact: false,
    label: 'Progress',
  },
  argTypes: {
    onStepSelect: { action: 'onStepSelect' },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: { orientation: 'vertical', steps: stepsWithDescriptions, current: 'verify' },
};

/* navigable */
export const NavigableNone: Story = { args: { navigable: 'none' } };
export const NavigableCompleted: Story = { args: { navigable: 'completed' } };
export const NavigableAll: Story = { args: { navigable: 'all' } };

/* compact */
export const Compact: Story = { args: { compact: true } };

/* other states */
export const WithDescriptions: Story = {
  args: { orientation: 'vertical', steps: stepsWithDescriptions, current: 'verify' },
};
export const WithError: Story = { args: { steps: stepsWithError, current: 'payment' } };
export const CustomLabel: Story = { args: { label: 'Checkout progress' } };

/**
 * Every step is a Button (navigable: 'all'), giving at least three focusable controls to tab
 * through and activate with Enter/Space, per the component's keyboard model.
 */
export const Keyboard: Story = {
  args: { navigable: 'all' },
};
