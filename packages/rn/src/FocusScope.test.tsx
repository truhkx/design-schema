/**
 * FocusScope — behavior scenarios from the component doc, one test each, in the doc's
 * order. `children` is required but absent from the Default story's args (the story
 * renders its own panel), so setup supplies a focusable child.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import type { FocusScopeProps } from './FocusScope';
import meta from './FocusScope.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FocusScopeProps> = {}) {
  const props: FocusScopeProps = {
    ...(meta.args as Partial<FocusScopeProps>),
    children: <Button label="First action" />,
    ...given,
  };
  const utils = render(
    <ThemeProvider mode="light">
      <FocusScope {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('FocusScope', () => {
  it('the-scope-adds-no-role', () => {
    setup();
    const scope = screen.getByTestId('FocusScope');
    expect(scope.props.role).toBeUndefined();
    expect(scope.props.accessibilityRole).toBeUndefined();
    expect(scope.props.accessibilityLabel).toBeUndefined();
  });

  /* derived */
  it('renders', () => {
    const d = setup();
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: props.autoFocus */
  it('renders-auto-focus-first', () => {
    const d = setup({ autoFocus: 'first' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-auto-focus-last', () => {
    const d = setup({ autoFocus: 'last' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-auto-focus-container', () => {
    const d = setup({ autoFocus: 'container' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-auto-focus-none', () => {
    const d = setup({ autoFocus: 'none' });
    expect(d.toJSON()).not.toBeNull();
  });
});
