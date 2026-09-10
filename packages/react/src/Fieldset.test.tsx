/**
 * Fieldset — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/fieldset.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Fieldset.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Fieldset, type FieldsetProps } from './Fieldset';
import meta from './Fieldset.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FieldsetProps> = {}) {
  const props = { ...meta.args, ...given } as FieldsetProps;
  return { ...render(<Fieldset {...props} />), props };
}

describe('Fieldset', () => {
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.gap */
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

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const { props } = setup();
    expect(screen.getByRole('group', { name: props.legend })).toHaveAccessibleName();
  });

  /* derived: props.error */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  });
});
