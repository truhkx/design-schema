/**
 * Toast — behavior scenarios from the component doc, one test each, in the doc's
 * order. See generated/prompts/Toast.rn.md.
 */
import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Toast } from './Toast';
import type { ToastProps } from './Toast';
import meta from './Toast.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ToastProps> = {}) {
  const props: ToastProps = { ...(meta.args as ToastProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Toast {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

/** Lets the exit transition finish so the toast is removed. */
function flushExit(): void {
  act(() => {
    jest.advanceTimersByTime(5000);
  });
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the-dismiss-button-fires-on-dismiss', () => {
    const onDismiss = jest.fn();
    setup({ dismissible: true, onDismiss });
    fireEvent.press(screen.getByLabelText('Dismiss'));
    // after-change: fires as the exit transition starts, not when it ends.
    expect(onDismiss).toHaveBeenCalledWith('dismiss-button');
    flushExit();
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('Toast')).toBeNull();
  });

  it('the-action-button-fires-on-action', () => {
    const calls: string[] = [];
    const onAction = jest.fn(() => calls.push('action'));
    const onDismiss = jest.fn((reason: string) => calls.push(`dismiss:${reason}`));
    setup({ actionLabel: 'Undo', onAction, onDismiss });
    fireEvent.press(screen.getByLabelText('Undo'));
    expect(onAction).toHaveBeenCalledTimes(1);
    flushExit();
    expect(calls).toEqual(['action', 'dismiss:action']);
  });

  it('danger-toasts-are-announced-assertively', () => {
    setup({ tone: 'danger' });
    const root = screen.getByTestId('Toast');
    expect(root.props.accessibilityRole).toBe('alert');
    expect(root.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('the-message-is-rendered', () => {
    setup({ message: '3 files moved to Archive' });
    expect(screen.getByText('3 files moved to Archive')).toBeTruthy();
  });

  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-neutral', () => {
    const s = setup({ tone: 'neutral' });
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

  /* derived: props.duration */
  it('renders-duration-short', () => {
    const s = setup({ duration: 'short' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-duration-long', () => {
    const s = setup({ duration: 'long' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-duration-persistent', () => {
    const s = setup({ duration: 'persistent' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByLabelText(s.props.message)).toBeTruthy();
  });
});
