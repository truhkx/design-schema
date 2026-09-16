/**
 * Toast — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Toast } from './Toast';
import meta from './Toast.stories';

type Props = ComponentProps<typeof Toast>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const onAction = vi.fn();
  const onDismiss = vi.fn();
  const props = { ...meta.args, onAction, onDismiss, ...given } as Props;
  const utils = render(<Toast {...props} />);
  return {
    ...utils,
    props,
    onAction,
    onDismiss,
    user: userEvent.setup(),
    toast: () => document.querySelector<HTMLElement>('[data-ds="Toast"]'),
    button: (name: string) => document.querySelector<HTMLElement>(`[data-part="${name}"] button`),
  };
}

describe('Toast', () => {
  it('the-dismiss-button-fires-on-dismiss', async () => {
    const s = setup({ dismissible: true });
    await s.user.click(s.button('dismissButton')!);
    expect(s.onDismiss).toHaveBeenCalledWith('dismiss-button');
  });

  it('the-action-button-fires-on-action', async () => {
    const s = setup({ actionLabel: 'Undo' });
    await s.user.click(s.button('actionButton')!);
    expect(s.onAction).toHaveBeenCalledTimes(1);
    expect(s.onDismiss).toHaveBeenCalledWith('action');
    expect(s.onAction.mock.invocationCallOrder[0]!).toBeLessThan(s.onDismiss.mock.invocationCallOrder[0]!);
  });

  it('escape-dismisses-the-focused-toast', async () => {
    const s = setup();
    s.button('dismissButton')!.focus();
    await s.user.keyboard('{Escape}');
    expect(s.onDismiss).toHaveBeenCalledWith('escape');
  });

  it('danger-toasts-are-announced-assertively', () => {
    const s = setup({ tone: 'danger' });
    expect(screen.getByRole('alert')).toBe(s.toast());
  });

  it('the-message-is-rendered', () => {
    const s = setup({ message: '3 files moved to Archive' });
    expect(s.toast()).toHaveTextContent('3 files moved to Archive');
  });

  /* derived */
  it('renders', () => {
    expect(setup().toast()).not.toBeNull();
  });

  it('renders-tone-neutral', () => {
    expect(setup({ tone: 'neutral' }).toast()).not.toBeNull();
  });

  it('renders-tone-success', () => {
    expect(setup({ tone: 'success' }).toast()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    expect(setup({ tone: 'warning' }).toast()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    expect(setup({ tone: 'danger' }).toast()).not.toBeNull();
  });

  it('renders-duration-short', () => {
    expect(setup({ duration: 'short' }).toast()).not.toBeNull();
  });

  it('renders-duration-long', () => {
    expect(setup({ duration: 'long' }).toast()).not.toBeNull();
  });

  it('renders-duration-persistent', () => {
    expect(setup({ duration: 'persistent' }).toast()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('status')).toBe(s.toast());
    expect(s.toast()).toHaveTextContent(s.props.message);
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });
});
