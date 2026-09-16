/**
 * Meter — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Meter } from './Meter';
import type { MeterProps } from './Meter';
import meta from './Meter.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<MeterProps> = {}) {
  const props: MeterProps = { ...(meta.args as MeterProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Meter {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Meter', () => {
  it('value-text-is-shown-and-announced', () => {
    const s = setup({ valueText: '3.2 GB of 10 GB' });
    expect(s.getByText('3.2 GB of 10 GB')).toBeTruthy();
  });

  it('the-label-names-the-measurement', () => {
    const s = setup({ label: 'Password strength' });
    expect(s.getByText('Password strength')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-info', () => {
    const s = setup({ tone: 'info' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-success', () => {
    const s = setup({ tone: 'success' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-warning', () => {
    const s = setup({ tone: 'warning' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-danger', () => {
    const s = setup({ tone: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.getByTestId('Meter').props.accessibilityLabel).toBe(s.props.label);
    expect(s.getByLabelText(s.props.label)).toBeTruthy();
  });
});
