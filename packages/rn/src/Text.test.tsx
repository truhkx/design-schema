/**
 * Text — behavior scenarios from the component doc, one test each, in the doc's order.
 * Every scenario here is a `renders: true` check (Text has no a11y role, no events, and
 * no interaction); see generated/prompts/Text.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from './Text';
import type { TextProps } from './Text';
import meta from './Text.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TextProps> = {}) {
  const props: TextProps = { ...(meta.args as TextProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Text {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Text', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-xs', () => {
    const s = setup({ size: 'xs' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const s = setup({ size: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.weight */
  it('renders-weight-regular', () => {
    const s = setup({ weight: 'regular' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-weight-medium', () => {
    const s = setup({ weight: 'medium' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-weight-semibold', () => {
    const s = setup({ weight: 'semibold' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-weight-bold', () => {
    const s = setup({ weight: 'bold' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-default', () => {
    const s = setup({ tone: 'default' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-strong', () => {
    const s = setup({ tone: 'strong' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-muted', () => {
    const s = setup({ tone: 'muted' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const s = setup({ tone: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-on-action', () => {
    const s = setup({ tone: 'onAction' });
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
