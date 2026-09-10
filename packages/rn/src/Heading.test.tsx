/**
 * Heading — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario here is a `renders: true` check; see generated/prompts/Heading.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from './Heading';
import type { HeadingProps } from './Heading';
import meta from './Heading.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<HeadingProps> = {}) {
  const props: HeadingProps = { ...(meta.args as HeadingProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Heading {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Heading', () => {
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.level */
  it('renders-level-1', () => {
    const s = setup({ level: '1' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-2', () => {
    const s = setup({ level: '2' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-3', () => {
    const s = setup({ level: '3' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-4', () => {
    const s = setup({ level: '4' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-5', () => {
    const s = setup({ level: '5' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-6', () => {
    const s = setup({ level: '6' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-4xl', () => {
    const s = setup({ size: '4xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-3xl', () => {
    const s = setup({ size: '3xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-2xl', () => {
    const s = setup({ size: '2xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const s = setup({ size: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
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
});
