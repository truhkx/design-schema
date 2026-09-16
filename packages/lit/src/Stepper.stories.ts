import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Stepper.js';
import type { StepperNavigable, StepperOrientation, StepperStep } from './Stepper.js';

interface StepperArgs {
  label?: string | undefined;
  steps: StepperStep[];
  current: string;
  orientation?: StepperOrientation | undefined;
  navigable?: StepperNavigable | undefined;
  compact?: boolean | undefined;
}

const checkout: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
];

const meta: Meta<StepperArgs> = {
  title: 'Stepper/Lit',
  component: 'ds-stepper',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['step-select'] },
  },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    navigable: { control: 'radio', options: ['none', 'completed', 'all'] },
    compact: { control: 'boolean' },
  },
  args: {
    steps: [...checkout, { id: 'confirm', label: 'Confirmation' }],
    current: 'payment',
  },
  render: (args) => html`
    <ds-stepper
      label=${ifDefined(args.label)}
      .steps=${args.steps}
      current=${args.current}
      orientation=${ifDefined(args.orientation)}
      navigable=${ifDefined(args.navigable)}
      ?compact=${args.compact ?? false}
    ></ds-stepper>
  `,
};

export default meta;
type Story = StoryObj<StepperArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* navigable */
export const NavigableNone: Story = { args: { navigable: 'none' } };
export const NavigableCompleted: Story = { args: { navigable: 'completed' } };
export const NavigableAll: Story = { args: { navigable: 'all' } };

/* states */
export const Compact: Story = { args: { compact: true } };

/** Every step is a navigable native button: Tab moves between them, Enter or Space selects. */
export const Keyboard: Story = { args: { navigable: 'all' } };

/* examples */
export const Checkout: Story = {
  args: { current: 'payment', steps: checkout },
};

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

export const DisplayOnly: Story = {
  args: { navigable: 'none', current: 'payment', steps: checkout },
};

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
