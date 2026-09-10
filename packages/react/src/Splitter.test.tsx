/**
 * Splitter — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/splitter.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Splitter.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Splitter, type SplitterProps } from './Splitter';
import meta from './Splitter.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<SplitterProps> = {}) {
  const props = { ...meta.args, ...given } as SplitterProps;
  return render(<Splitter {...props} />);
}

describe('Splitter', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    const { container } = setup({ orientation: 'horizontal' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const { container } = setup({ orientation: 'vertical' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.stackBelow */
  it('renders-stackBelow-prose', () => {
    const { container } = setup({ stackBelow: 'prose' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-stackBelow-content', () => {
    const { container } = setup({ stackBelow: 'content' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-stackBelow-never', () => {
    const { container } = setup({ stackBelow: 'never' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const props = { ...meta.args } as SplitterProps;
    setup();
    expect(screen.getByRole('separator', { name: props.label })).toHaveAccessibleName();
  });
});
