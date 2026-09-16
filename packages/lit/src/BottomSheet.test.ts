/**
 * <ds-bottom-sheet> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element wraps a native <dialog> and uses
 * delegatesFocus, which jsdom does not implement. The browser viewport is narrower than
 * layout.maxWidth.prose, so every scenario exercises the sheet presentation.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './BottomSheet.js';
import './Input.js';
import './Button.js';
import type { BottomSheetCloseDetail, DsBottomSheet } from './BottomSheet.js';
import meta from './BottomSheet.stories.js';

type Given = Partial<Pick<DsBottomSheet, 'open' | 'heading' | 'hideHeading' | 'height' | 'dismissible' | 'dragToDismiss'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with a body control and a footer. */
async function setup(given: Given = {}) {
  // A focusable before the opener, so a restore that falls back to the first focusable cannot pass by accident.
  const before = document.createElement('button');
  before.textContent = 'Before';
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  document.body.append(before, opener);
  opener.focus();

  const el = document.createElement('ds-bottom-sheet');
  const props = { ...meta.args, ...given } as Given & { heading: string };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const input = document.createElement('ds-input') as HTMLElement & { label: string; name: string };
  input.label = 'Keyword';
  input.name = 'keyword';
  const apply = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  apply.slot = 'footer';
  apply.label = 'Apply';
  apply.variant = 'primary';
  const clear = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  clear.slot = 'footer';
  clear.label = 'Clear';
  clear.variant = 'secondary';
  el.append(input, apply, clear);

  const close = vi.fn<(event: CustomEvent<BottomSheetCloseDetail>) => void>();
  el.addEventListener('close', close as unknown as EventListener);

  document.body.append(el);
  await el.updateComplete;
  const scope = el.shadowRoot!.querySelector<HTMLElement & { updateComplete: Promise<boolean> }>('[data-part="focusScope"]');
  await scope?.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const root = el.shadowRoot!;
  return {
    el,
    props,
    opener,
    close,
    dialog: () => root.querySelector('dialog'),
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-bottom-sheet', () => {
  it('close-button-fires-on-close', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('closeButton')!);
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'close-button' });
    // The sheet never closes itself.
    expect(d.el.open).toBe(true);
    expect(d.dialog()!.open).toBe(true);
  });

  it('the-close-button-works-without-the-drag-gesture', async () => {
    const d = await setup({ open: true, dragToDismiss: false });
    await userEvent.click(d.part('closeButton')!);
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'close-button' });
  });

  it('non-dismissible-still-reports-escape', async () => {
    const d = await setup({ open: true, dismissible: false });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });

  it('non-dismissible-scrim-tap-does-nothing', async () => {
    const d = await setup({ open: true, dismissible: false });
    await userEvent.click(d.part('scrim')!, { position: { x: 12, y: 12 } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(d.close).not.toHaveBeenCalled();
    expect(d.dialog()!.open).toBe(true);
  });

  it('hidden-heading-is-still-the-accessible-name', async () => {
    const d = await setup({ open: true, hideHeading: true });
    expect(d.dialog()).toHaveAccessibleName(d.props.heading);
  });

  it('closed-sheet-renders-nothing', async () => {
    const d = await setup({ open: false });
    expect(d.dialog()).toBeNull();
    expect(d.el.shadowRoot!.childElementCount).toBe(0);
  });

  /* derived */
  it('renders', async () => {
    const d = await setup();
    expect(d.dialog()).not.toBeNull();
    expect(d.dialog()!.open).toBe(true);
  });

  it('renders-height-content', async () => {
    const d = await setup({ height: 'content' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-height-half', async () => {
    const d = await setup({ height: 'half' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-height-full', async () => {
    const d = await setup({ height: 'full' });
    expect(d.dialog()).not.toBeNull();
  });

  it('has-accessible-name', async () => {
    const d = await setup();
    expect(d.dialog()).toHaveAccessibleName(d.props.heading);
  });

  it('escape-fires-on-close', async () => {
    const d = await setup({ open: true });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });
});
