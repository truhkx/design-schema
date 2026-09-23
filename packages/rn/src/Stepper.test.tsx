/**
 * Stepper — behavior scenarios from the component doc, one test each, in the doc's order.
 * On native a click is `fireEvent.press`; pressing an indicator bubbles to its step's Pressable.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Stepper } from './Stepper';
import type { StepperProps } from './Stepper';
import meta from './Stepper.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<StepperProps> = {}) {
  const onStepSelect = jest.fn();
  const props: StepperProps = { ...(meta.args as StepperProps), ...given, onStepSelect };
  const utils = render(
    <ThemeProvider mode="light">
      <Stepper {...props} />
    </ThemeProvider>,
  );
  // React Native has no navigation landmark, so the name sits on the list View inside the root.
  return { ...utils, onStepSelect, props, container: () => screen.getByTestId('Stepper.list') };
}

const firstIndicator = () => screen.getAllByTestId('Stepper.indicator', { includeHiddenElements: true })[0]!;

describe('Stepper', () => {
  it('click-on-a-completed-step-reports-it', () => {
    const s = setup({
      navigable: 'completed',
      current: 'payment',
      steps: [
        { id: 'shipping', label: 'Shipping address' },
        { id: 'payment', label: 'Payment' },
        { id: 'review', label: 'Review order' },
        { id: 'confirm', label: 'Confirmation' },
      ],
    });
    fireEvent.press(firstIndicator());
    expect(s.onStepSelect).toHaveBeenCalledTimes(1);
    expect(s.onStepSelect).toHaveBeenCalledWith('shipping');
  });

  it('the-current-step-is-not-navigable', () => {
    const s = setup({
      navigable: 'completed',
      current: 'shipping',
      steps: [
        { id: 'shipping', label: 'Shipping address' },
        { id: 'payment', label: 'Payment' },
        { id: 'review', label: 'Review order' },
      ],
    });
    fireEvent.press(firstIndicator());
    expect(s.onStepSelect).not.toHaveBeenCalled();
  });

  it('display-only-steps-report-nothing', () => {
    const s = setup({
      navigable: 'none',
      current: 'payment',
      steps: [
        { id: 'shipping', label: 'Shipping address' },
        { id: 'payment', label: 'Payment' },
        { id: 'review', label: 'Review order' },
      ],
    });
    fireEvent.press(firstIndicator());
    expect(s.onStepSelect).not.toHaveBeenCalled();
  });

  it('compact-shows-the-step-count', () => {
    setup({
      compact: true,
      current: 'payment',
      steps: [
        { id: 'shipping', label: 'Shipping address' },
        { id: 'payment', label: 'Payment' },
        { id: 'review', label: 'Review order' },
        { id: 'confirm', label: 'Confirmation' },
      ],
    });
    expect(screen.getByText('Step 2 of 4')).toBeTruthy();
  });

  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-navigable-none', () => {
    const s = setup({ navigable: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-navigable-completed', () => {
    const s = setup({ navigable: 'completed' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-navigable-all', () => {
    const s = setup({ navigable: 'all' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup({ label: 'Accessible name' });
    expect(s.container()).toHaveAccessibleName('Accessible name');
  });

  // The status-word scenarios are scoped to web and Lit; on native the word lives in each step's accessibilityLabel.
  it('step-status-is-said-in-words (native accessibilityLabel)', () => {
    setup({
      navigable: 'none',
      current: 'payment',
      steps: [
        { id: 'shipping', label: 'Shipping address' },
        { id: 'payment', label: 'Payment' },
        { id: 'review', label: 'Review order' },
      ],
    });
    expect(screen.getByLabelText('Step 1: Shipping address, completed')).toBeTruthy();
    expect(screen.getByLabelText('Step 2: Payment, current step')).toBeTruthy();
    expect(screen.getByLabelText('Step 3: Review order')).toBeTruthy();
  });

  it('an-errored-step-says-so (native accessibilityLabel)', () => {
    setup({
      navigable: 'none',
      current: 'review',
      steps: [
        { id: 'shipping', label: 'Shipping address', status: 'complete' },
        { id: 'payment', label: 'Payment', status: 'error' },
        { id: 'review', label: 'Review order' },
      ],
    });
    expect(screen.getByLabelText('Step 2: Payment, has an error')).toBeTruthy();
  });
});
