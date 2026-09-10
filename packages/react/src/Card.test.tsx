/**
 * Card — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/card.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Card.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Card, type CardProps } from './Card';
import meta from './Card.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<CardProps> = {}) {
  const props = { ...meta.args, ...given } as CardProps;
  return render(<Card {...props} />);
}

describe('Card', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-headinglevel-2', () => {
    const { container } = setup({ headingLevel: '2' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headinglevel-3', () => {
    const { container } = setup({ headingLevel: '3' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headinglevel-4', () => {
    const { container } = setup({ headingLevel: '4' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headinglevel-5', () => {
    const { container } = setup({ headingLevel: '5' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headinglevel-6', () => {
    const { container } = setup({ headingLevel: '6' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.inset */
  it('renders-inset-sm', () => {
    const { container } = setup({ inset: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-md', () => {
    const { container } = setup({ inset: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-lg', () => {
    const { container } = setup({ inset: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.surface */
  it('renders-surface-default', () => {
    const { container } = setup({ surface: 'default' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const { container } = setup({ surface: 'subtle' });
    expect(container.firstChild).not.toBeNull();
  });
});
