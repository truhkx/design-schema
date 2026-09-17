/**
 * <ds-alert> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Alert.js';
import type { AlertDismissDetail, DsAlert } from './Alert.js';
import meta from './Alert.stories.js';

type Given = Partial<Pick<DsAlert, 'tone' | 'heading' | 'live' | 'dismissible'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-alert');
  const { children, ...props } = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  if (children !== undefined) el.append(children);
  const dismiss = vi.fn<(event: CustomEvent<AlertDismissDetail>) => void>();
  el.addEventListener('dismiss', dismiss as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    dismiss,
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-alert', () => {
  it('dismiss-fires-on-dismiss', async () => {
    const a = await setup({ dismissible: true });
    await userEvent.click(a.part('dismissButton')!.querySelector('ds-button')!);
    expect(a.dismiss).toHaveBeenCalledTimes(1);
  });

  it('live-alert-renders-the-alert-role', async () => {
    const a = await setup({ live: 'alert' });
    expect(a.el.getAttribute('role')).toBe('alert');
  });

  it('live-status-renders-the-status-role', async () => {
    const a = await setup({ live: 'status' });
    expect(a.el.getAttribute('role')).toBe('status');
  });

  it('live-off-renders-no-role', async () => {
    const a = await setup({ live: 'off' });
    expect(a.el.getAttribute('role')).toBeNull();
  });

  it('the-heading-is-rendered', async () => {
    const a = await setup({ heading: 'Payment failed' });
    expect(a.part('heading')?.textContent?.trim()).toBe('Payment failed');
  });

  /* derived */
  it('renders', async () => {
    const a = await setup();
    expect(a.part('container')).not.toBeNull();
  });

  for (const tone of ['info', 'success', 'warning', 'danger'] as const) {
    it(`renders-tone-${tone}`, async () => {
      const a = await setup({ tone });
      expect(a.part('container')).not.toBeNull();
    });
  }

  for (const live of ['status', 'alert', 'off'] as const) {
    it(`renders-live-${live}`, async () => {
      const a = await setup({ live });
      expect(a.part('container')).not.toBeNull();
    });
  }
});
