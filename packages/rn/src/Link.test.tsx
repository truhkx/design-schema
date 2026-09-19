/**
 * Link — behavior scenarios from the component doc, one test each, in the doc's order.
 * The new-tab and download scenarios are web/Lit only (the parser narrows them); on
 * native a press is `fireEvent.press` and the external name is the accessibilityLabel.
 */
import * as React from 'react';
import { Linking } from 'react-native';
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

  it('external-link-announces-that-it-leaves', () => {
    const s = setup({ external: true, label: 'View the billing history' });
    expect(s.container()).toHaveAccessibleName('View the billing history (opens in new tab)');
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

/* Platform-own: the Linking fallback and external hand-off, which the scenarios cannot express. */
describe('Link — Linking hand-off', () => {
  let openURL: jest.SpyInstance;
  beforeEach(() => {
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });
  afterEach(() => openURL.mockRestore());

  function renderLink(props: Partial<LinkProps>) {
    render(
      <ThemeProvider mode="light">
        <Link href="/billing/history" label="View the billing history" {...props} />
      </ThemeProvider>,
    );
    fireEvent.press(screen.getByTestId('Link'));
  }

  it('opens the URL with Linking when there is no handler', () => {
    renderLink({});
    expect(openURL).toHaveBeenCalledWith('/billing/history');
  });

  it('leaves navigation to the handler for a non-external link', () => {
    renderLink({ onPress: jest.fn() });
    expect(openURL).not.toHaveBeenCalled();
  });

  it('hands an external link to Linking after the handler', () => {
    const onPress = jest.fn();
    renderLink({ external: true, onPress });
    expect(onPress).toHaveBeenCalledWith('/billing/history');
    expect(openURL).toHaveBeenCalledWith('/billing/history');
  });

  it('skips the hand-off when the handler returns false', () => {
    renderLink({ external: true, onPress: () => false });
    expect(openURL).not.toHaveBeenCalled();
  });

  it('swallows a rejected openURL', async () => {
    openURL.mockRejectedValue(new Error('unsupported'));
    renderLink({});
    await Promise.resolve();
    expect(openURL).toHaveBeenCalledTimes(1);
  });
});
