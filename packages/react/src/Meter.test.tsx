/**
 * Meter — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/meter.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Meter.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Meter } from './Meter';
import meta from './Meter.stories';

type Props = ComponentProps<typeof Meter>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  return { ...render(<Meter {...props} />), props };
}

describe('Meter', () => {
  it('the-meter-reports-its-value-and-range', () => {
    setup({ value: 25, min: 0, max: 50 });
    const meter = screen.getByRole('meter');
    expect(meter.getAttribute('aria-valuenow')).toBe('25');
    expect(meter.getAttribute('aria-valuemin')).toBe('0');
    expect(meter.getAttribute('aria-valuemax')).toBe('50');
  });

  it('a-value-above-the-maximum-is-clamped', () => {
    setup({ value: 150, min: 0, max: 100 });
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100');
  });

  it('value-text-is-shown-and-announced', () => {
    setup({ valueText: '3.2 GB of 10 GB' });
    expect(screen.getByText('3.2 GB of 10 GB')).toBeTruthy();
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('3.2 GB of 10 GB');
  });

  it('the-label-names-the-measurement', () => {
    setup({ label: 'Password strength' });
    expect(screen.getByText('Password strength')).toBeTruthy();
  });

  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-info', () => {
    const { container } = setup({ tone: 'info' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const { container } = setup({ tone: 'success' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const { container } = setup({ tone: 'warning' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const { container } = setup({ tone: 'danger' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const { props } = setup();
    expect(screen.getByRole('meter', { name: props.label })).toBeTruthy();
  });
});
