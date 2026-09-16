/**
 * ProgressBar — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from './ProgressBar';
import type { ProgressBarProps } from './ProgressBar';
import meta from './ProgressBar.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ProgressBarProps> = {}) {
  const props: ProgressBarProps = { ...(meta.args as ProgressBarProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <ProgressBar {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('ProgressBar', () => {
  it('a-hidden-label-is-still-the-accessible-name', () => {
    const s = setup({ hideLabel: true });
    expect(s.queryByTestId('ProgressBar.label')).toBeNull();
    expect(s.getByTestId('ProgressBar').props.accessibilityLabel).toBe(s.props.label);
    expect(s.getByLabelText(s.props.label)).toBeTruthy();
  });

  it('the-label-names-the-task', () => {
    const s = setup({ label: 'Importing contacts' });
    expect(s.getByText('Importing contacts')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-neutral', () => {
    const s = setup({ tone: 'neutral' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-success', () => {
    const s = setup({ tone: 'success' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-danger', () => {
    const s = setup({ tone: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.announce */
  it('renders-announce-none', () => {
    const s = setup({ announce: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.announce */
  it('renders-announce-milestones', () => {
    const s = setup({ announce: 'milestones' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.announce */
  it('renders-announce-complete', () => {
    const s = setup({ announce: 'complete' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.getByTestId('ProgressBar').props.accessibilityLabel).toBe(s.props.label);
    expect(s.getByLabelText(s.props.label)).toBeTruthy();
  });
});
