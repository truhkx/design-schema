/**
 * Meter — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/meter.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Meter.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Meter, type MeterProps } from './Meter';
import meta from './Meter.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<MeterProps> = {}) {
  const props = { ...meta.args, ...given } as MeterProps;
  return { ...render(<Meter {...props} />), props };
}

describe('Meter', () => {
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
    expect(screen.getByRole('meter', { name: props.label })).toHaveAccessibleName();
  });
});
