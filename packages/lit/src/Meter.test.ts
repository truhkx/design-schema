/**
 * <ds-meter> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Meter.js';
import type { DsMeter } from './Meter.js';
import meta from './Meter.stories.js';

type Given = Partial<Pick<DsMeter, 'value' | 'min' | 'max' | 'label' | 'valueText' | 'tone' | 'hideValue'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-meter');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    meter: () => root.querySelector<HTMLElement>('[role=meter]')!,
    container: () => root.querySelector<HTMLElement>('[data-part=container]')!,
    label: () => root.querySelector<HTMLElement>('[data-part=label]')!,
    valueText: () => root.querySelector<HTMLElement>('[data-part=valueText]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-meter', () => {
  it('the-meter-reports-its-value-and-range', async () => {
    const s = await setup({ value: 25, min: 0, max: 50 });
    expect(s.meter()).not.toBeNull();
    expect(s.meter()).toHaveAttribute('aria-valuenow', '25');
    expect(s.meter()).toHaveAttribute('aria-valuemin', '0');
    expect(s.meter()).toHaveAttribute('aria-valuemax', '50');
  });

  it('a-value-above-the-maximum-is-clamped', async () => {
    const s = await setup({ value: 150, min: 0, max: 100 });
    expect(s.meter()).toHaveAttribute('aria-valuenow', '100');
  });

  it('value-text-is-shown-and-announced', async () => {
    const s = await setup({ valueText: '3.2 GB of 10 GB' });
    expect(s.valueText()).toHaveTextContent('3.2 GB of 10 GB');
    expect(s.meter()).toHaveAttribute('aria-valuetext', '3.2 GB of 10 GB');
  });

  it('the-label-names-the-measurement', async () => {
    const s = await setup({ label: 'Password strength' });
    expect(s.label()).toHaveTextContent('Password strength');
    expect(s.meter()).toHaveAccessibleName('Password strength');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.meter()).not.toBeNull();
  });

  it('renders-tone-info', async () => {
    const s = await setup({ tone: 'info' });
    expect(s.meter()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'info');
  });

  it('renders-tone-success', async () => {
    const s = await setup({ tone: 'success' });
    expect(s.meter()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'success');
  });

  it('renders-tone-warning', async () => {
    const s = await setup({ tone: 'warning' });
    expect(s.meter()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'warning');
  });

  it('renders-tone-danger', async () => {
    const s = await setup({ tone: 'danger' });
    expect(s.meter()).not.toBeNull();
    expect(s.el).toHaveAttribute('tone', 'danger');
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.meter()).toHaveAccessibleName(s.props.label);
  });
});
