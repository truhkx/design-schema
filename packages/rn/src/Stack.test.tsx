/**
 * Stack — behavior scenarios from the component doc, one test each, in the doc's order.
 * Every scenario here is a `renders: true` check (Stack has no a11y role, no events, and
 * no interaction); see generated/prompts/Stack.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Stack } from './Stack';
import type { StackProps } from './Stack';
import meta from './Stack.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<StackProps> = {}) {
  const props: StackProps = { ...(meta.args as StackProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Stack {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Stack', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.direction */
  it('renders-direction-vertical', () => {
    const s = setup({ direction: 'vertical' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-direction-horizontal', () => {
    const s = setup({ direction: 'horizontal' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.gap */
  it('renders-gap-none', () => {
    const s = setup({ gap: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gap-tight', () => {
    const s = setup({ gap: 'tight' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gap-normal', () => {
    const s = setup({ gap: 'normal' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gap-loose', () => {
    const s = setup({ gap: 'loose' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gap-section', () => {
    const s = setup({ gap: 'section' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.align */
  it('renders-align-start', () => {
    const s = setup({ align: 'start' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-center', () => {
    const s = setup({ align: 'center' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-end', () => {
    const s = setup({ align: 'end' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-stretch', () => {
    const s = setup({ align: 'stretch' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.justify */
  it('renders-justify-start', () => {
    const s = setup({ justify: 'start' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-justify-center', () => {
    const s = setup({ justify: 'center' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-justify-end', () => {
    const s = setup({ justify: 'end' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-justify-between', () => {
    const s = setup({ justify: 'between' });
    expect(s.toJSON()).not.toBeNull();
  });
});
