/**
 * Button — behavior scenarios from the component doc, one test each, in the doc's order.
 * The Enter/Space and "disabled stays focusable" scenarios are web/Lit only (the parser
 * narrows them); on native a press is `fireEvent.press`. See generated/prompts/Button.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from './Button';
import type { ButtonProps } from './Button';
import meta from './Button.stories';
import { ThemeProvider } from './theme';
import { trackPress } from './custom/analytics';

// The analytics seam is hand-written and owned by the adopter; the test asserts that
// Button calls it, never what its body does.
jest.mock('./custom/analytics', () => ({ trackPress: jest.fn() }));
const trackPressMock = trackPress as jest.MockedFunction<typeof trackPress>;

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<ButtonProps> = {}) {
  const onPress = jest.fn();
  const onTrack = jest.fn();
  const props: ButtonProps = { ...(meta.args as ButtonProps), ...given, onPress, onTrack };
  const utils = render(
    <ThemeProvider mode="light">
      <Button {...props} />
    </ThemeProvider>,
  );
  return { ...utils, onPress, onTrack, props, container: () => screen.getByTestId('Button') };
}

beforeEach(() => {
  trackPressMock.mockClear();
});

describe('Button', () => {
  it('click-fires-on-press', () => {
    const s = setup();
    fireEvent.press(s.container());
    expect(s.onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled-does-not-fire', () => {
    const s = setup({ disabled: true });
    fireEvent.press(s.container());
    expect(s.onPress).not.toHaveBeenCalled();
    expect(s.container()).toBeDisabled();
  });

  it('loading-announces-busy-and-ignores-activation', () => {
    const s = setup({ loading: true });
    fireEvent.press(s.container());
    expect(s.onPress).not.toHaveBeenCalled();
    expect(s.container()).toBeBusy();
  });

  it('expanded-is-reported', () => {
    const s = setup({ expanded: true });
    expect(s.container()).toBeExpanded();
  });

  it('icon-only-keeps-its-name', () => {
    const s = setup({ iconOnly: true, accessibleName: 'Open menu' });
    expect(screen.queryByText(s.props.label)).toBeNull();
    expect(s.container()).toHaveAccessibleName('Open menu');
  });

  /* source: extensions/Button.analytics.md */
  it('press-tracks', () => {
    const s = setup({ track: 'signup', label: 'Sign up' });
    fireEvent.press(s.container());
    expect(s.onTrack).toHaveBeenCalledTimes(1);
    expect(s.onTrack).toHaveBeenCalledWith('signup', 'Sign up');
    expect(trackPressMock).toHaveBeenCalledTimes(1);
    expect(trackPressMock).toHaveBeenCalledWith('signup', 'Sign up');
  });

  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.variant */
  it('renders-variant-primary', () => {
    const s = setup({ variant: 'primary' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-variant-secondary', () => {
    const s = setup({ variant: 'secondary' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-variant-ghost', () => {
    const s = setup({ variant: 'ghost' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-variant-danger', () => {
    const s = setup({ variant: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
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

  /* derived: props.type */
  it('renders-type-button', () => {
    const s = setup({ type: 'button' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-type-submit', () => {
    const s = setup({ type: 'submit' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.container()).toHaveAccessibleName(s.props.label);
  });
});
