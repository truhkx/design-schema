/**
 * Link — behavior scenarios from the component doc, one test each, in the doc's order.
 * The external-name, new-tab and download scenarios are web/Lit only (the parser narrows
 * them); on native a press is `fireEvent.press`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Link } from './Link';
import type { LinkProps } from './Link';
import meta from './Link.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<LinkProps> = {}) {
  const onPress = jest.fn();
  const props: LinkProps = { ...(meta.args as LinkProps), ...given, onPress };
  const utils = render(
    <ThemeProvider mode="light">
      <Link {...props} />
    </ThemeProvider>,
  );
  return { ...utils, onPress, props, container: () => screen.getByTestId('Link') };
}

describe('Link', () => {
  it('click-fires-on-press', () => {
    const s = setup();
    fireEvent.press(s.container());
    expect(s.onPress).toHaveBeenCalledTimes(1);
    expect(s.onPress).toHaveBeenCalledWith(s.props.href);
  });

  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-default', () => {
    const s = setup({ tone: 'default' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-inherit', () => {
    const s = setup({ tone: 'inherit' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.container()).toHaveAccessibleName(s.props.label);
  });
});
