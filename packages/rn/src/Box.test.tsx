/**
 * Box — behavior scenarios from the component doc, one test each, in the doc's order.
 * Every scenario here is a `renders: true` check (Box has no a11y role, no events, and
 * no interaction); see generated/prompts/Box.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Box } from './Box';
import type { BoxProps } from './Box';
import meta from './Box.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<BoxProps> = {}) {
  const props: BoxProps = { ...(meta.args as BoxProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Box {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Box', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.inset */
  it('renders-inset-none', () => {
    const s = setup({ inset: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-inset-sm', () => {
    const s = setup({ inset: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-inset-md', () => {
    const s = setup({ inset: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-inset-lg', () => {
    const s = setup({ inset: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-inset-xl', () => {
    const s = setup({ inset: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.insetBlock */
  it('renders-insetblock-none', () => {
    const s = setup({ insetBlock: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetblock-sm', () => {
    const s = setup({ insetBlock: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetblock-md', () => {
    const s = setup({ insetBlock: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetblock-lg', () => {
    const s = setup({ insetBlock: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetblock-xl', () => {
    const s = setup({ insetBlock: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.insetInline */
  it('renders-insetinline-none', () => {
    const s = setup({ insetInline: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetinline-sm', () => {
    const s = setup({ insetInline: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetinline-md', () => {
    const s = setup({ insetInline: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetinline-lg', () => {
    const s = setup({ insetInline: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-insetinline-xl', () => {
    const s = setup({ insetInline: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.surface */
  it('renders-surface-none', () => {
    const s = setup({ surface: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-surface-default', () => {
    const s = setup({ surface: 'default' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const s = setup({ surface: 'subtle' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-surface-strong', () => {
    const s = setup({ surface: 'strong' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.radius */
  it('renders-radius-none', () => {
    const s = setup({ radius: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-radius-sm', () => {
    const s = setup({ radius: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-radius-md', () => {
    const s = setup({ radius: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-radius-lg', () => {
    const s = setup({ radius: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-radius-full', () => {
    const s = setup({ radius: 'full' });
    expect(s.toJSON()).not.toBeNull();
  });
});
