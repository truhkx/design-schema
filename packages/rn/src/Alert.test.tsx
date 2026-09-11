/**
 * Alert — behavior scenarios from the component doc, one test each, in the doc's order.
 * Every scenario here is a `renders: true` check; see generated/prompts/Alert.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Alert } from './Alert';
import type { AlertProps } from './Alert';
import meta from './Alert.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<AlertProps> = {}) {
  const props: AlertProps = { ...(meta.args as AlertProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Alert {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Alert', () => {
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-info', () => {
    const s = setup({ tone: 'info' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const s = setup({ tone: 'success' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const s = setup({ tone: 'warning' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const s = setup({ tone: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.live */
  it('renders-live-status', () => {
    const s = setup({ live: 'status' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-live-alert', () => {
    const s = setup({ live: 'alert' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-live-off', () => {
    const s = setup({ live: 'off' });
    expect(s.toJSON()).not.toBeNull();
  });
});
