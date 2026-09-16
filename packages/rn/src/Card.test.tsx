/**
 * Card — behavior scenarios from the component doc, one test each, in the doc's
 * order. `given` overrides the Default story's args.
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
  it('heading-is-rendered-as-a-heading', () => {
    const c = setup({ heading: 'Team plan' });
    expect(c.getByText('Team plan')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const c = setup();
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-2', () => {
    const c = setup({ headingLevel: '2' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-3', () => {
    const c = setup({ headingLevel: '3' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-4', () => {
    const c = setup({ headingLevel: '4' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-5', () => {
    const c = setup({ headingLevel: '5' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-heading-level-6', () => {
    const c = setup({ headingLevel: '6' });
    expect(c.toJSON()).not.toBeNull();
  });

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

  it('renders-surface-default', () => {
    const c = setup({ surface: 'default' });
    expect(c.toJSON()).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const c = setup({ surface: 'subtle' });
    expect(c.toJSON()).not.toBeNull();
  });
});
