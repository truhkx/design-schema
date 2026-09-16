/**
 * Fieldset — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/fieldset.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Fieldset.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Fieldset } from './Fieldset';
import meta from './Fieldset.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ComponentProps<typeof Fieldset>> = {}) {
  const props = { ...meta.args, ...given } as ComponentProps<typeof Fieldset>;
  return { ...render(<Fieldset {...props} />), props };
}

describe('Fieldset', () => {
  it('the-legend-names-the-group', () => {
    setup({ legend: 'Delivery window' });
    expect(screen.getByText('Delivery window')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Delivery window' })).toBeInTheDocument();
  });

  it('the-description-is-rendered', () => {
    setup({ description: 'We only ship within the EU.' });
    expect(screen.getByText('We only ship within the EU.')).toBeInTheDocument();
  });

  it('a-group-error-is-announced', () => {
    setup({ error: 'End date must be after start date.' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('a-disabled-group-is-marked-disabled', () => {
    setup({ disabled: true });
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true');
  });

  /* derived */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-tight', () => {
    const { container } = setup({ gap: 'tight' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-normal', () => {
    const { container } = setup({ gap: 'normal' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-loose', () => {
    const { container } = setup({ gap: 'loose' });
    expect(container.firstChild).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('group')).toHaveAccessibleName();
  });

  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  });
});
