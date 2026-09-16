/**
 * Alert — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/alert.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Alert.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Alert } from './Alert';
import meta from './Alert.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ComponentProps<typeof Alert>> = {}) {
  const props = { ...meta.args, ...given };
  const result = render(<Alert {...(props as ComponentProps<typeof Alert>)} />);
  const root = result.container.querySelector<HTMLElement>('[data-ds="Alert"]');
  return { ...result, root };
}

describe('Alert', () => {
  it('dismiss-fires-on-dismiss', () => {
    const onDismiss = vi.fn();
    const { root } = setup({ dismissible: true, onDismiss });
    const part = root!.querySelector<HTMLElement>('[data-part="dismissButton"]');
    const button = part!.querySelector('button') ?? part!;
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('live-alert-renders-the-alert-role', () => {
    setup({ live: 'alert' });
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('live-status-renders-the-status-role', () => {
    setup({ live: 'status' });
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('live-off-renders-no-role', () => {
    const { root } = setup({ live: 'off' });
    expect(root!.getAttribute('role')).toBeNull();
  });

  it('the-heading-is-rendered', () => {
    setup({ heading: 'Payment failed' });
    expect(screen.getByText('Payment failed')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const { root } = setup();
    expect(root).not.toBeNull();
  });

  it('renders-tone-info', () => {
    const { root } = setup({ tone: 'info' });
    expect(root).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const { root } = setup({ tone: 'success' });
    expect(root).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const { root } = setup({ tone: 'warning' });
    expect(root).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const { root } = setup({ tone: 'danger' });
    expect(root).not.toBeNull();
  });

  it('renders-live-status', () => {
    const { root } = setup({ live: 'status' });
    expect(root).not.toBeNull();
  });

  it('renders-live-alert', () => {
    const { root } = setup({ live: 'alert' });
    expect(root).not.toBeNull();
  });

  it('renders-live-off', () => {
    const { root } = setup({ live: 'off' });
    expect(root).not.toBeNull();
  });
});
