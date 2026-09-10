/**
 * Toast — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/toast.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Toast.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toast, type ToastProps } from './Toast';
import meta from './Toast.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ToastProps> = {}) {
  const props = { ...meta.args, ...given } as ToastProps;
  const utils = render(<Toast {...props} />);
  return {
    ...utils,
    props,
    toast: () => document.querySelector('[data-ds="Toast"]') as HTMLElement,
  };
}

describe('Toast', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const t = setup();
    expect(t.toast()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-neutral', () => {
    const t = setup({ tone: 'neutral' });
    expect(t.toast()).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const t = setup({ tone: 'success' });
    expect(t.toast()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const t = setup({ tone: 'warning' });
    expect(t.toast()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const t = setup({ tone: 'danger' });
    expect(t.toast()).not.toBeNull();
  });

  /* derived: props.duration */
  it('renders-duration-short', () => {
    const t = setup({ duration: 'short' });
    expect(t.toast()).not.toBeNull();
  });

  it('renders-duration-long', () => {
    const t = setup({ duration: 'long' });
    expect(t.toast()).not.toBeNull();
  });

  it('renders-duration-persistent', () => {
    const t = setup({ duration: 'persistent' });
    expect(t.toast()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const t = setup();
    expect(screen.getByText(t.props.message)).toBeInTheDocument();
    expect(t.toast()).toHaveAttribute('role', 'status');
  });

  it('control-is-focusable', () => {
    setup();
    const dismiss = screen.getByRole('button', { name: 'Dismiss' });
    dismiss.focus();
    expect(dismiss).toHaveFocus();
  });
});
