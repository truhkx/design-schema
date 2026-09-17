/**
 * Stepper — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/stepper.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Stepper, type StepperProps } from './Stepper';
import meta from './Stepper.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<StepperProps> = {}) {
  const onStepSelect = vi.fn();
  const props = { ...meta.args, ...given, onStepSelect } as StepperProps;
  const utils = render(<Stepper {...props} />);
  const user = userEvent.setup();
  const indicator = (): HTMLElement => utils.container.querySelector<HTMLElement>('[data-part="indicator"]')!;
  return { ...utils, user, onStepSelect, indicator };
}

const three: StepperProps['steps'] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
];

describe('Stepper', () => {
  /* A navigable step fires onStepSelect with its id; the container decides whether to move. */
  it('click-on-a-completed-step-reports-it', async () => {
    const s = setup({
      navigable: 'completed',
      current: 'payment',
      steps: [...three, { id: 'confirm', label: 'Confirmation' }],
    });
    await s.user.click(s.indicator());
    expect(s.onStepSelect).toHaveBeenCalledTimes(1);
    expect(s.onStepSelect).toHaveBeenCalledWith('shipping');
  });

  /* navigable completed means every step before the current one, so the current step itself reports nothing. */
  it('the-current-step-is-not-navigable', async () => {
    const s = setup({ navigable: 'completed', current: 'shipping', steps: three });
    await s.user.click(s.indicator());
    expect(s.onStepSelect).not.toHaveBeenCalled();
  });

  /* With navigable none the steps are inert text. */
  it('display-only-steps-report-nothing', async () => {
    const s = setup({ navigable: 'none', current: 'payment', steps: three });
    await s.user.click(s.indicator());
    expect(s.onStepSelect).not.toHaveBeenCalled();
  });

  /* The status is carried by a word from copy, not by color or glyph alone. */
  it('step-status-is-said-in-words', () => {
    setup({ navigable: 'none', current: 'payment', steps: three });
    // The status word joins the plain label after ", " as visually-hidden text.
    expect(screen.getByText(', completed')).toBeTruthy();
    expect(screen.getByText(', current step')).toBeTruthy();
  });

  /* A step marked error is named with copy.error, so the danger glyph is not the only signal. */
  it('an-errored-step-says-so', () => {
    setup({
      navigable: 'none',
      current: 'review',
      steps: [
        { id: 'shipping', label: 'Shipping address', status: 'complete' },
        { id: 'payment', label: 'Payment', status: 'error' },
        { id: 'review', label: 'Review order' },
      ],
    });
    expect(screen.getByText(', has an error')).toBeTruthy();
  });

  /* Below the prose width the stepper shows only the current label and "Step n of m". */
  it('compact-shows-the-step-count', () => {
    setup({
      compact: true,
      current: 'payment',
      steps: [...three, { id: 'confirm', label: 'Confirmation' }],
    });
    expect(screen.getByText('Step 2 of 4')).toBeTruthy();
  });

  it('renders', () => {
    const s = setup();
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('renders-navigable-none', () => {
    const s = setup({ navigable: 'none' });
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('renders-navigable-completed', () => {
    const s = setup({ navigable: 'completed' });
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('renders-navigable-all', () => {
    const s = setup({ navigable: 'all' });
    expect(s.container.querySelector('[data-ds="Stepper"]')).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup({ label: 'Accessible name' });
    expect(screen.getByRole('navigation', { name: 'Accessible name' })).toBeTruthy();
  });
});
