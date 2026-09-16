import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper, type StepperStep } from './Stepper';

const checkoutSteps: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
];

const meta: Meta<typeof Stepper> = {
  title: 'Stepper/React',
  component: Stepper,
  tags: ['autodocs'],
  args: {
    steps: [
      { id: 'shipping', label: 'Shipping address' },
      { id: 'payment', label: 'Payment' },
      { id: 'review', label: 'Review order' },
      { id: 'confirm', label: 'Confirmation' },
    ],
    current: 'payment',
    orientation: 'horizontal',
    navigable: 'completed',
    compact: false,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    navigable: { control: 'inline-radio', options: ['none', 'completed', 'all'] },
    onStepSelect: { action: 'onStepSelect' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

export const NavigableNone: Story = { args: { navigable: 'none' } };
export const NavigableCompleted: Story = { args: { navigable: 'completed' } };
export const NavigableAll: Story = { args: { navigable: 'all' } };

export const Compact: Story = { args: { compact: true } };

/** The current step also carries `status: 'error'`: the error indicator wins, the selection stays. */
export const CurrentStepWithError: Story = {
  args: {
    current: 'payment',
    steps: [
      { id: 'shipping', label: 'Shipping address' },
      { id: 'payment', label: 'Payment', status: 'error' },
      { id: 'review', label: 'Review order' },
    ],
  },
};

/* Examples from the doc — each has exactly its `given` as args. */

/** The usual horizontal flow, where a completed step can be revisited. */
export const Checkout: Story = { args: { current: 'payment', steps: checkoutSteps } };

/** A vertical stepper whose steps each need a line of explanation. */
export const OnboardingWithDescriptions: Story = {
  args: {
    orientation: 'vertical',
    current: 'verify',
    steps: [
      { id: 'account', label: 'Create account', description: 'Takes about a minute.' },
      { id: 'verify', label: 'Verify identity', description: 'Takes about 2 minutes.' },
      { id: 'plan', label: 'Choose a plan', description: 'Compare features and pricing.' },
    ],
  },
};

/** A flow the user cannot jump around in. */
export const DisplayOnly: Story = { args: { navigable: 'none', current: 'payment', steps: checkoutSteps } };

/** Validation failed on a step the user has already left. */
export const AStepWithAnError: Story = {
  args: {
    current: 'review',
    steps: [
      { id: 'shipping', label: 'Shipping address', status: 'complete' },
      { id: 'payment', label: 'Payment', status: 'error' },
      { id: 'review', label: 'Review order' },
    ],
  },
};

/** Tab moves between the navigable steps (four here, with `navigable: all`); Enter and Space select. */
export const Keyboard: Story = { args: { navigable: 'all' } };
