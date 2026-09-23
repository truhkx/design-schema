/**
 * Container — behavior scenarios from the component doc, one test each, in the doc's order.
 * Every scenario here is a `renders: true` check (Container has no a11y role, no events, and
 * no interaction); see generated/prompts/Container.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import type { ContainerProps } from './Container';
import meta, { Default } from './Container.stories';
import { ThemeProvider } from './theme';

/**
 * The Default story's args plus the scenario's `given`, rendered through the meta-level
 * render so the story's string children are wrapped in a Text, as native requires.
 */
function setup(given: Partial<ContainerProps> = {}) {
  const props: ContainerProps = { ...(meta.args as ContainerProps), ...(Default.args as Partial<ContainerProps>), ...given };
  const utils = render(<ThemeProvider mode="light">{meta.render!(props, {} as never)}</ThemeProvider>);
  return { ...utils, props };
}

describe('Container', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.width */
  it('renders-width-prose', () => {
    const s = setup({ width: 'prose' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-width-content', () => {
    const s = setup({ width: 'content' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-width-page', () => {
    const s = setup({ width: 'page' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-width-full', () => {
    const s = setup({ width: 'full' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.gutter */
  it('renders-gutter-narrow', () => {
    const s = setup({ gutter: 'narrow' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gutter-default', () => {
    const s = setup({ gutter: 'default' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gutter-wide', () => {
    const s = setup({ gutter: 'wide' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-gutter-none', () => {
    const s = setup({ gutter: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.align */
  it('renders-align-center', () => {
    const s = setup({ align: 'center' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-start', () => {
    const s = setup({ align: 'start' });
    expect(s.toJSON()).not.toBeNull();
  });
});
