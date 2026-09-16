/**
 * <ds-stepper> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Stepper.js';
import type { DsStepper, StepperStep, StepperStepSelectDetail } from './Stepper.js';
import meta from './Stepper.stories.js';

type Given = Partial<Pick<DsStepper, 'label' | 'steps' | 'current' | 'orientation' | 'navigable' | 'compact'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-stepper');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const selected: string[] = [];
  el.addEventListener('step-select', (event) => {
    selected.push((event as CustomEvent<StepperStepSelectDetail>).detail.id);
  });
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    selected,
    nav: () => root.querySelector<HTMLElement>('nav')!,
    indicator: () => root.querySelector<HTMLElement>('[data-part=indicator]')!,
    text: () => root.textContent ?? '',
  };
}

const three: StepperStep[] = [
  { id: 'shipping', label: 'Shipping address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review order' },
];

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-stepper', () => {
  it('click-on-a-completed-step-reports-it', async () => {
    const s = await setup({
      navigable: 'completed',
      current: 'payment',
      steps: [...three, { id: 'confirm', label: 'Confirmation' }],
    });
    await userEvent.click(s.indicator());
    expect(s.selected).toEqual(['shipping']);
  });

  it('the-current-step-is-not-navigable', async () => {
    const s = await setup({ navigable: 'completed', current: 'shipping', steps: three });
    await userEvent.click(s.indicator());
    expect(s.selected).toEqual([]);
  });

  it('display-only-steps-report-nothing', async () => {
    const s = await setup({ navigable: 'none', current: 'payment', steps: three });
    await userEvent.click(s.indicator());
    expect(s.selected).toEqual([]);
  });

  it('step-status-is-said-in-words', async () => {
    const s = await setup({ navigable: 'none', current: 'payment', steps: three });
    expect(s.text()).toContain('completed');
    expect(s.text()).toContain('current step');
  });

  it('an-errored-step-says-so', async () => {
    const s = await setup({
      navigable: 'none',
      current: 'review',
      steps: [
        { id: 'shipping', label: 'Shipping address', status: 'complete' },
        { id: 'payment', label: 'Payment', status: 'error' },
        { id: 'review', label: 'Review order' },
      ],
    });
    expect(s.text()).toContain('has an error');
  });

  it('compact-shows-the-step-count', async () => {
    const s = await setup({
      compact: true,
      current: 'payment',
      steps: [...three, { id: 'confirm', label: 'Confirmation' }],
    });
    const count = s.el.shadowRoot!.querySelector<HTMLElement>('.count')!;
    expect(count).toHaveTextContent('Step 2 of 4');
    expect(count).toBeVisible();
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'Stepper');
    expect(s.nav()).not.toBeNull();
  });

  it('renders-orientation-horizontal', async () => {
    const s = await setup({ orientation: 'horizontal' });
    expect(s.nav()).not.toBeNull();
    expect(s.el).toHaveAttribute('orientation', 'horizontal');
  });

  it('renders-orientation-vertical', async () => {
    const s = await setup({ orientation: 'vertical' });
    expect(s.nav()).not.toBeNull();
    expect(s.el).toHaveAttribute('orientation', 'vertical');
  });

  it('renders-navigable-none', async () => {
    const s = await setup({ navigable: 'none' });
    expect(s.nav()).not.toBeNull();
    expect(s.el).toHaveAttribute('navigable', 'none');
  });

  it('renders-navigable-completed', async () => {
    const s = await setup({ navigable: 'completed' });
    expect(s.nav()).not.toBeNull();
    expect(s.el).toHaveAttribute('navigable', 'completed');
  });

  it('renders-navigable-all', async () => {
    const s = await setup({ navigable: 'all' });
    expect(s.nav()).not.toBeNull();
    expect(s.el).toHaveAttribute('navigable', 'all');
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.nav()).toHaveAccessibleName('Progress');
  });
});
