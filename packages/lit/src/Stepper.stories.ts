import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Stepper.js';
import type { StepperNavigable, StepperOrientation, StepperStep, StepperStepSelectDetail } from './Stepper.js';

interface StepperArgs {
  steps: StepperStep[];
  current: string;
  orientation: StepperOrientation;
  navigable: StepperNavigable;
  compact: boolean;
}

const steps: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address', description: 'Where the order will arrive' },
  { id: 'payment', label: 'Payment', description: 'Card or bank details' },
  { id: 'review', label: 'Review order', description: 'Check items and totals' },
  { id: 'confirm', label: 'Confirmation', description: 'Takes about a minute' },
];

const stepsWithError: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address', status: 'error', description: 'Postal code could not be verified' },
  { id: 'payment', label: 'Payment', description: 'Card or bank details' },
  { id: 'review', label: 'Review order', description: 'Check items and totals' },
  { id: 'confirm', label: 'Confirmation', description: 'Takes about a minute' },
];

const meta: Meta<StepperArgs> = {
  title: 'Stepper/Lit',
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
    steps,
    current: 'payment',
    orientation: 'horizontal',
    navigable: 'completed',
    compact: false,
  },
  render: (args) => html`
    <ds-stepper
      .steps=${args.steps}
      current=${args.current}
      orientation=${args.orientation}
      navigable=${args.navigable}
      ?compact=${args.compact}
      @step-select=${(event: CustomEvent<StepperStepSelectDetail>) => console.log('step-select', event.detail)}
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

/* boolean states */
export const CompactTrue: Story = { args: { compact: true } };
export const CompactFalse: Story = { args: { compact: false } };

export const ErrorStep: Story = { args: { steps: stepsWithError, current: 'payment' } };

/** Every step is a focusable control, for keyboard testing (Tab between them, Enter/Space to select). */
export const Keyboard: Story = {
  args: { navigable: 'all', current: 'payment' },
};
