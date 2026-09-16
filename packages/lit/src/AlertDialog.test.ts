/**
 * <ds-alert-dialog> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element wraps a native <dialog> and
 * uses delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './AlertDialog.js';
import type { AlertDialogCancelDetail, DsAlertDialog } from './AlertDialog.js';
import meta from './AlertDialog.stories.js';

/** Every element on the focus chain, from `document.activeElement` down through shadow roots. */
function activeChain(): Element[] {
  const chain: Element[] = [];
  let el: Element | null = document.activeElement;
  while (el) {
    chain.push(el);
    el = el.shadowRoot?.activeElement ?? null;
  }
  return chain;
}

type Given = Partial<
  Pick<DsAlertDialog, 'open' | 'heading' | 'description' | 'tone' | 'confirmLabel' | 'cancelLabel' | 'confirmDisabled'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  // A focusable before the opener, so a restore that falls back to the first focusable cannot pass by accident.
  const before = document.createElement('button');
  before.textContent = 'Before';
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  document.body.append(before, opener);
  opener.focus();

  const el = document.createElement('ds-alert-dialog');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const confirm = vi.fn<(event: CustomEvent<void>) => void>();
  const cancel = vi.fn<(event: CustomEvent<AlertDialogCancelDetail>) => void>();
  el.addEventListener('confirm', confirm as unknown as EventListener);
  el.addEventListener('cancel', cancel as unknown as EventListener);

  document.body.append(el);
  await el.updateComplete;
  const scope = el.shadowRoot!.querySelector<HTMLElement & { updateComplete: Promise<boolean> }>('[data-part="focusScope"]');
  await scope?.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const root = el.shadowRoot!;
  return {
    el,
    props,
    confirm,
    cancel,
    dialog: () => root.querySelector('dialog'),
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
  };
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-alert-dialog', () => {
  it('confirm-button-fires-on-confirm', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('confirmButton')!);
    await expect.poll(() => d.confirm.mock.calls.length).toBe(1);
  });

  it('cancel-button-fires-on-cancel', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('cancelButton')!);
    await expect.poll(() => d.cancel.mock.calls.length).toBe(1);
    expect(d.cancel.mock.calls[0]![0].detail).toEqual({ reason: 'cancel' });
  });

  it('focus-starts-on-the-cancel-button', async () => {
    const d = await setup({ open: true });
    await expect.poll(() => activeChain()).toContain(d.part('cancelButton'));
  });

  it('a-scrim-click-does-nothing', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('scrim')!, { position: { x: 12, y: 12 } });
    await settle();
    expect(d.cancel).not.toHaveBeenCalled();
    expect(d.confirm).not.toHaveBeenCalled();
    expect(d.dialog()!.open).toBe(true);
  });

  it('confirm-disabled-does-not-confirm', async () => {
    const d = await setup({ open: true, confirmDisabled: true });
    await userEvent.click(d.part('confirmButton')!);
    await settle();
    expect(d.confirm).not.toHaveBeenCalled();
  });

  it('cancel-works-while-confirm-is-disabled', async () => {
    const d = await setup({ open: true, confirmDisabled: true });
    await userEvent.click(d.part('cancelButton')!);
    await expect.poll(() => d.cancel.mock.calls.length).toBe(1);
  });

  it('escape-cancels-while-confirm-is-disabled', async () => {
    const d = await setup({ open: true, confirmDisabled: true });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.cancel.mock.calls.length).toBe(1);
    expect(d.cancel.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });

  it('the-cancel-button-is-named-from-copy', async () => {
    const d = await setup({ open: true });
    const cancelButton = d.part('cancelButton')!;
    const inner = cancelButton.shadowRoot!.querySelector('button')!;
    expect(inner).toHaveAccessibleName('Cancel');
  });

  /* derived */
  it('renders', async () => {
    const d = await setup();
    expect(d.dialog()).not.toBeNull();
    expect(d.dialog()!.open).toBe(true);
  });

  it('renders-tone-danger', async () => {
    const d = await setup({ tone: 'danger' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-warning', async () => {
    const d = await setup({ tone: 'warning' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-info', async () => {
    const d = await setup({ tone: 'info' });
    expect(d.dialog()).not.toBeNull();
  });

  it('has-accessible-name', async () => {
    const d = await setup();
    expect(d.dialog()).toHaveAccessibleName(d.props.heading);
  });

  it('escape-fires-on-cancel', async () => {
    const d = await setup({ open: true });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.cancel.mock.calls.length).toBe(1);
    expect(d.cancel.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });
});
