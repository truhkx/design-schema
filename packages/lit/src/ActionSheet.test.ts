/**
 * <ds-action-sheet> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the sheet wraps a native <dialog>. The browser
 * viewport is narrower than layout.maxWidth.prose, so every scenario exercises the sheet presentation.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './ActionSheet.js';
import type { ActionSheetActionDetail, ActionSheetCloseDetail, DsActionSheet } from './ActionSheet.js';
import meta from './ActionSheet.stories.js';

type Given = Partial<Pick<DsActionSheet, 'open' | 'heading' | 'actions' | 'dismissible' | 'cancelLabel'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  // A focusable before the opener, so a restore that falls back to the first focusable cannot pass by accident.
  const before = document.createElement('button');
  before.textContent = 'Before';
  const opener = document.createElement('button');
  opener.textContent = 'More actions';
  document.body.append(before, opener);
  opener.focus();

  const el = document.createElement('ds-action-sheet');
  const props = { ...meta.args, ...given } as Given & { heading?: string | undefined };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const action = vi.fn<(event: CustomEvent<ActionSheetActionDetail>) => void>();
  const close = vi.fn<(event: CustomEvent<ActionSheetCloseDetail>) => void>();
  el.addEventListener('action', action as unknown as EventListener);
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
    action,
    close,
    dialog: () => root.querySelector('dialog'),
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
    parts: (name: string) => Array.from(root.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-action-sheet', () => {
  it('choosing-an-action-fires-on-action', async () => {
    const d = await setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
        { id: 'delete', label: 'Delete photo', tone: 'danger' },
      ],
    });
    await userEvent.click(d.part('item')!);
    await expect.poll(() => d.action.mock.calls.length).toBe(1);
    expect(d.action.mock.calls[0]![0].detail).toEqual({ id: 'share' });
    expect(d.close).not.toHaveBeenCalled();
  });

  it('the-cancel-row-fires-on-close', async () => {
    const d = await setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    await userEvent.click(d.part('cancelButton')!);
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'cancel' });
    expect(d.action).not.toHaveBeenCalled();
  });

  it('non-dismissible-still-reports-escape', async () => {
    const d = await setup({
      open: true,
      heading: 'Photo.jpg',
      dismissible: false,
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });

  it('the-cancel-row-is-named-from-copy', async () => {
    const d = await setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    const cancel = d.part<HTMLElement & { label: string; updateComplete: Promise<boolean> }>('cancelButton')!;
    await cancel.updateComplete;
    expect(cancel.label).toBe('Cancel');
    expect(cancel.shadowRoot!.querySelector('button')).toHaveAccessibleName('Cancel');
  });

  it('the-list-is-a-menu', async () => {
    const d = await setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    const list = d.part('list')!;
    expect(list.getAttribute('role')).toBe('menu');
    expect(list).toHaveAccessibleName('Photo.jpg');
    const items = d.parts('item');
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.getAttribute('role')).toBe('menuitem');
    }
  });

  it('closed-sheet-renders-nothing', async () => {
    const d = await setup({ open: false, actions: [{ id: 'share', label: 'Share' }] });
    expect(d.dialog()).toBeNull();
    expect(d.el.shadowRoot!.childElementCount).toBe(0);
  });

  /* derived */
  it('renders', async () => {
    const d = await setup();
    expect(d.dialog()).not.toBeNull();
    expect(d.dialog()!.open).toBe(true);
  });

  it('has-accessible-name', async () => {
    const d = await setup();
    expect(d.part('list')).toHaveAccessibleName(d.props.heading ?? 'Actions');
  });

  it('escape-fires-on-close', async () => {
    const d = await setup({ open: true });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });
});
