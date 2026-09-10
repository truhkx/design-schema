/**
 * Toast — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` or accessible-name check,
 * so each test only asserts the tree renders or that the accessible name is set.
 * See generated/prompts/Toast.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
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

describe('Toast', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const t = setup();
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-neutral', () => {
    const t = setup({ tone: 'neutral' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const t = setup({ tone: 'success' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const t = setup({ tone: 'warning' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const t = setup({ tone: 'danger' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.duration */
  it('renders-duration-short', () => {
    const t = setup({ duration: 'short' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-duration-long', () => {
    const t = setup({ duration: 'long' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-duration-persistent', () => {
    const t = setup({ duration: 'persistent' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const t = setup();
    expect(screen.getByLabelText(t.props.message)).toBeTruthy();
  });
});
