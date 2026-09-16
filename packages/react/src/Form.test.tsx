/**
 * Form — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/form.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Form.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form, type FormProps } from './Form';
import meta from './Form.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FormProps> = {}) {
  const props = { ...meta.args, ...given } as FormProps;
  return { ...render(<Form {...props} />), props };
}

describe('Form', () => {
  it('label-names-the-form-landmark', () => {
    setup({ label: 'Sign in' });
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
  });

  /* derived */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-validate-submit', () => {
    const { container } = setup({ validate: 'submit' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-validate-blur', () => {
    const { container } = setup({ validate: 'blur' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-validate-change', () => {
    const { container } = setup({ validate: 'change' });
    expect(container.firstChild).not.toBeNull();
  });
});
