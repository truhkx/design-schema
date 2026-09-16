import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';
import type { StepperStep } from './Stepper';
import { withTheme } from './decorators';

const steps: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
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

/** Every step navigable, so Tab reaches four Pressables in order on react-native-web. */
export const Keyboard: Story = { args: { navigable: 'all', current: 'review' } };

/** The usual horizontal flow, where a completed step can be revisited. */
export const Checkout: Story = {
  args: {
    current: 'payment',
    steps: [
      { id: 'shipping', label: 'Shipping address' },
      { id: 'payment', label: 'Payment' },
      { id: 'review', label: 'Review order' },
    ],
  },
};

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
export const DisplayOnly: Story = {
  args: {
    navigable: 'none',
    current: 'payment',
    steps: [
      { id: 'shipping', label: 'Shipping address' },
      { id: 'payment', label: 'Payment' },
      { id: 'review', label: 'Review order' },
    ],
  },
};

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
