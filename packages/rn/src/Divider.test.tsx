/**
 * Divider — behavior scenarios from the component doc, one test each, in the doc's order.
 * The separator-role and aria-orientation expectations are web/Lit only (the parser
 * narrows them); native has no separator role.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Divider } from './Divider';
import type { DividerProps } from './Divider';
import meta from './Divider.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<DividerProps> = {}) {
  const props: DividerProps = { ...(meta.args as DividerProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Divider {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, container: () => screen.getByTestId('Divider', { includeHiddenElements: true }) };
}

describe('Divider', () => {
  it('decorative-divider-is-hidden-from-assistive-technology', () => {
    const s = setup();
    expect(s.container().props.accessibilityElementsHidden).toBe(true);
  });

  it('label-is-read-and-makes-the-divider-semantic', () => {
    setup({ label: 'or' });
    expect(screen.getByText('or')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.spacing */
  it('renders-spacing-none', () => {
    const s = setup({ spacing: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-spacing-tight', () => {
    const s = setup({ spacing: 'tight' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-spacing-normal', () => {
    const s = setup({ spacing: 'normal' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-spacing-loose', () => {
    const s = setup({ spacing: 'loose' });
    expect(s.toJSON()).not.toBeNull();
  });
});
