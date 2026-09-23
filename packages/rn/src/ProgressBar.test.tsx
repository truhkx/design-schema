/**
 * ProgressBar — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import * as React from 'react';
import { AccessibilityInfo } from 'react-native';
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

/** The announcement state machine (Behavior › Announcements); not a gate scenario, so it lives here. */
describe('ProgressBar announcements', () => {
  let announceSpy: jest.SpyInstance;
  beforeEach(() => {
    announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  });
  afterEach(() => {
    announceSpy.mockRestore();
  });

  function bar(props: Partial<ProgressBarProps>) {
    return (
      <ThemeProvider mode="light">
        <ProgressBar label="Importing" {...props} />
      </ThemeProvider>
    );
  }
  const spoken = (): string[] => announceSpy.mock.calls.map((call) => call[0] as string);

  it('records the state at mount silently', () => {
    render(bar({ value: 60, announce: 'milestones' }));
    render(bar({ value: 100, announce: 'milestones' }));
    expect(spoken()).toEqual([]);
  });

  it('announces the highest milestone crossed, then completion', () => {
    const s = render(bar({ value: 10, announce: 'milestones' }));
    s.rerender(bar({ value: 60, announce: 'milestones' }));
    s.rerender(bar({ value: 70, announce: 'milestones' }));
    s.rerender(bar({ value: 100, announce: 'milestones' }));
    expect(spoken()).toEqual(['Importing: 60%', 'Importing: complete']);
  });

  it('announces only completion by default, and again after a drop below max', () => {
    const s = render(bar({ value: 10 }));
    s.rerender(bar({ value: 80 }));
    s.rerender(bar({ value: 100 }));
    s.rerender(bar({ value: 40 }));
    s.rerender(bar({ value: 100 }));
    expect(spoken()).toEqual(['Importing: complete', 'Importing: complete']);
  });

  it('re-arms tiers above a backward move without repeating the ones below', () => {
    const s = render(bar({ value: 80, announce: 'milestones' }));
    s.rerender(bar({ value: 60, announce: 'milestones' }));
    s.rerender(bar({ value: 76, announce: 'milestones' }));
    expect(spoken()).toEqual(['Importing: 76%']);
  });

  it('announces entering the indeterminate state, at mount and later', () => {
    const s = render(bar({ value: undefined }));
    s.rerender(bar({ value: 30 }));
    s.rerender(bar({ value: null }));
    expect(spoken()).toEqual(['Importing: in progress', 'Importing: in progress']);
  });

  it('tracks tiers under none, so switching announce does not replay them', () => {
    const s = render(bar({ value: 10, announce: 'none' }));
    s.rerender(bar({ value: 60, announce: 'none' }));
    s.rerender(bar({ value: 60, announce: 'milestones' }));
    s.rerender(bar({ value: 80, announce: 'milestones' }));
    expect(spoken()).toEqual(['Importing: 80%']);
  });

  it('is silent across an invalid range and records the first valid value silently', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const s = render(bar({ value: 50, min: 100, max: 0, announce: 'milestones' }));
    s.rerender(bar({ value: 50, min: 0, max: 100, announce: 'milestones' }));
    s.rerender(bar({ value: 80, min: 0, max: 100, announce: 'milestones' }));
    expect(spoken()).toEqual(['Importing: 80%']);
    warn.mockRestore();
  });

  it('exposes bounds only and busy while indeterminate, and never calls formatValue', () => {
    const formatValue = jest.fn(() => 'x');
    const s = render(bar({ value: undefined, formatValue }));
    const root = s.getByTestId('ProgressBar');
    expect(root.props.accessibilityValue).toEqual({ min: 0, max: 100 });
    expect(root.props['aria-busy']).toBe(true);
    expect(root.props['aria-valuenow']).toBeUndefined();
    expect(formatValue).not.toHaveBeenCalled();
    expect(s.queryByTestId('ProgressBar.valueText')).toBeNull();
  });
});
