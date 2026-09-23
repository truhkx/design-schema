/**
 * <ds-toast> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 *
 * `dismiss` fires synchronously when the toast begins to leave (the doc's timing); the element is
 * removed only after the exit transition, so the assertions read the mock straight away.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Toast.js';
import type { DsToast, ToastDismissDetail } from './Toast.js';
import meta from './Toast.stories.js';

type Given = Partial<Pick<DsToast, 'message' | 'tone' | 'actionLabel' | 'duration' | 'dismissible' | 'toastId'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-toast');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const calls: string[] = [];
  const action = vi.fn<(event: CustomEvent<void>) => void>(() => calls.push('action'));
  const dismiss = vi.fn<(event: CustomEvent<ToastDismissDetail>) => void>(() => calls.push('dismiss'));
  el.addEventListener('action', action as unknown as EventListener);
  el.addEventListener('dismiss', dismiss as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    calls,
    action,
    dismiss,
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-toast', () => {
  it('the-dismiss-button-fires-on-dismiss', async () => {
    const t = await setup({ dismissible: true });
    await userEvent.click(t.part('dismissButton')!);
    expect(t.dismiss).toHaveBeenCalledTimes(1);
    expect(t.dismiss.mock.calls[0]![0].detail).toEqual({ reason: 'dismiss-button' });
  });

  it('the-action-button-fires-on-action', async () => {
    const t = await setup({ actionLabel: 'Undo' });
    await userEvent.click(t.part('actionButton')!);
    expect(t.action).toHaveBeenCalledTimes(1);
    expect(t.dismiss).toHaveBeenCalledTimes(1);
    expect(t.dismiss.mock.calls[0]![0].detail).toEqual({ reason: 'action' });
    expect(t.calls).toEqual(['action', 'dismiss']);
  });

  it('escape-dismisses-the-focused-toast', async () => {
    const t = await setup();
    // Focus delegates to the first control, the dismiss button: Escape acts only from inside a toast.
    t.el.focus();
    expect(t.el.matches(':focus-within')).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(t.dismiss).toHaveBeenCalledTimes(1);
    expect(t.dismiss.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });

  it('danger-toasts-are-announced-assertively', async () => {
    const t = await setup({ tone: 'danger' });
    expect(t.part('toast')!.getAttribute('role')).toBe('alert');
  });

  it('the-message-is-rendered', async () => {
    const t = await setup({ message: '3 files moved to Archive' });
    expect(t.part('message')).toHaveTextContent('3 files moved to Archive');
  });

  /* derived */
  it('renders', async () => {
    const t = await setup();
    expect(t.part('toast')).not.toBeNull();
  });

  for (const tone of ['neutral', 'success', 'warning', 'danger'] as const) {
    it(`renders-tone-${tone}`, async () => {
      const t = await setup({ tone });
      expect(t.part('toast')).not.toBeNull();
    });
  }

  for (const duration of ['short', 'long', 'persistent'] as const) {
    it(`renders-duration-${duration}`, async () => {
      const t = await setup({ duration });
      expect(t.part('toast')).not.toBeNull();
    });
  }

  it('has-accessible-name', async () => {
    const t = await setup();
    expect(t.part('toast')).toHaveAccessibleName(t.props.message);
    expect(t.part('toast')!.getAttribute('role')).toBe('status');
  });
});
