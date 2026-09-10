/**
 * Card — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` check (no click, focus or
 * set scenarios are declared for this component), so each test only asserts the
 * tree renders. See generated/prompts/Card.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from './Card';
import type { CardProps } from './Card';
import meta from './Card.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<CardProps> = {}) {
  const props: CardProps = { ...(meta.args as CardProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Card {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Card', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const c = setup();
    expect(c.toJSON()).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-headinglevel-2', () => {
    const c = setup({ headingLevel: '2' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-headinglevel-3', () => {
    const c = setup({ headingLevel: '3' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-headinglevel-4', () => {
    const c = setup({ headingLevel: '4' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-headinglevel-5', () => {
    const c = setup({ headingLevel: '5' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-headinglevel-6', () => {
    const c = setup({ headingLevel: '6' });
    expect(c.toJSON()).not.toBeNull();
  });

  /* derived: props.inset */
  it('renders-inset-sm', () => {
    const c = setup({ inset: 'sm' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-inset-md', () => {
    const c = setup({ inset: 'md' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-inset-lg', () => {
    const c = setup({ inset: 'lg' });
    expect(c.toJSON()).not.toBeNull();
  });

  /* derived: props.surface */
  it('renders-surface-default', () => {
    const c = setup({ surface: 'default' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const c = setup({ surface: 'subtle' });
    expect(c.toJSON()).not.toBeNull();
  });
});
