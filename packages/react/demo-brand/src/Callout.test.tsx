/**
 * Callout — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/alert.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Callout.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Callout } from './Callout';
import meta from './Callout.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ComponentProps<typeof Callout>> = {}) {
  const props = { ...meta.args, ...given };
  const result = render(<Callout {...(props as ComponentProps<typeof Callout>)} />);
  const root = result.container.querySelector<HTMLElement>('[data-ds="Alert"]');
  return { ...result, root };
}

describe('Callout', () => {
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

  it('an-empty-heading-falls-back-to-the-body', () => {
    const { root } = setup({ heading: '', children: 'Your card was declined.' });
    expect(screen.getByText('Your card was declined.')).toBeTruthy();
    expect(root!.querySelector('[data-part="heading"]')).toBeNull();
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

describe('Callout focus-onward on dismiss', () => {
  function renderBetween(onDismiss: () => void) {
    render(
      <div>
        <button type="button">Before</button>
        <Callout dismissible onDismiss={onDismiss}>
          Body
        </Callout>
        <button type="button" disabled>
          Disabled
        </button>
        <button type="button">After</button>
      </div>,
    );
    return screen.getByRole('button', { name: 'Dismiss' });
  }

  it('moves focus to the next focusable after the alert before onDismiss fires', () => {
    let focusedInHandler: Element | null = null;
    const dismiss = renderBetween(() => {
      focusedInHandler = document.activeElement;
    });
    dismiss.focus();
    fireEvent.click(dismiss);
    expect(focusedInHandler).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('leaves focus alone when focus was not inside the alert', () => {
    const dismiss = renderBetween(() => {});
    const before = screen.getByRole('button', { name: 'Before' });
    before.focus();
    fireEvent.click(dismiss);
    expect(document.activeElement).toBe(before);
  });
});
