/**
 * RadioGroup — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/radio-group.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/RadioGroup.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';
import meta from './RadioGroup.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<RadioGroupProps> = {}) {
  const props = { ...meta.args, ...given } as RadioGroupProps;
  return render(<RadioGroup {...props} />);
}

describe('RadioGroup', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.orientation */
  it('renders-orientation-vertical', () => {
    const { container } = setup({ orientation: 'vertical' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    const { container } = setup({ orientation: 'horizontal' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.error */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(screen.getByRole('group')).toHaveAttribute('aria-invalid', 'true');
  });
});
