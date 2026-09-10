import type { Meta, StoryObj } from '@storybook/react';
import { Stepper } from './Stepper';
import type { StepperStep } from './Stepper';
import { withTheme } from './decorators';

const steps: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address', description: 'Where we send your order' },
  { id: 'payment', label: 'Payment', description: 'Takes about a minute' },
  { id: 'review', label: 'Review order', description: 'Check everything before you confirm' },
  { id: 'confirm', label: 'Confirmation' },
];

const meta: Meta<typeof Stepper> = {
  title: 'Stepper/React Native',
  component: Stepper,
  decorators: [withTheme()],
  args: {
    steps,
    current: 'payment',
    orientation: 'horizontal',
    navigable: 'completed',
    compact: false,
  },
};

export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {};

export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };

export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

export const NavigableNone: Story = { args: { navigable: 'none' } };

export const NavigableCompleted: Story = { args: { navigable: 'completed' } };

export const NavigableAll: Story = { args: { navigable: 'all' } };

export const CompactTrue: Story = { args: { compact: true } };

/** A step left with a failed validation still shows its error and stays navigable, since it sits before `current`. */
export const WithError: Story = {
  args: {
    steps: [
      { id: 'shipping', label: 'Shipping address', status: 'error' },
      { id: 'payment', label: 'Payment' },
      { id: 'review', label: 'Review order' },
    ],
    current: 'payment',
  },
};

export const FirstStep: Story = { args: { current: 'shipping' } };

export const LastStep: Story = { args: { current: 'confirm' } };
