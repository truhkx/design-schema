/**
 * <ds-dialog> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element wraps a native <dialog> and
 * uses delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Dialog.js';
import './Input.js';
import './Button.js';
import type { DialogCloseDetail, DsDialog } from './Dialog.js';
import meta from './Dialog.stories.js';

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
  Pick<DsDialog, 'open' | 'heading' | 'description' | 'hideHeading' | 'size' | 'dismissible' | 'initialFocus'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with a body control and a footer. */
async function setup(given: Given = {}) {
  // A focusable before the opener, so a restore that falls back to the first focusable cannot pass by accident.
  const before = document.createElement('button');
  before.textContent = 'Before';
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  document.body.append(before, opener);
  opener.focus();

  const el = document.createElement('ds-dialog');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const input = document.createElement('ds-input') as HTMLElement & { label: string; name: string; value: string };
  input.label = 'Project name';
  input.name = 'projectName';
  input.value = 'Untitled project';
  const primary = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  primary.slot = 'footer';
  primary.label = 'Rename';
  primary.variant = 'primary';
  const cancel = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  cancel.slot = 'footer';
  cancel.label = 'Cancel';
  cancel.variant = 'secondary';
  el.append(input, primary, cancel);

  const close = vi.fn<(event: CustomEvent<DialogCloseDetail>) => void>();
  el.addEventListener('close', close as unknown as EventListener);

  document.body.append(el);
  await el.updateComplete;
  // The scope resolves its updateComplete only once the slotted ds-input and ds-buttons have
  // rendered their focusable internals, which is what initial focus waits for too.
  const scope = el.shadowRoot!.querySelector<HTMLElement & { updateComplete: Promise<boolean> }>('ds-focus-scope');
  await scope?.updateComplete;
  // Initial focus is placed once the scope's slotted children have rendered.
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

describe('ds-dialog', () => {
  it('close-button-fires-on-close', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('closeButton')!);
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'close-button' });
    // The dialog never closes itself.
    expect(d.el.open).toBe(true);
    expect(d.dialog()!.open).toBe(true);
  });

  it('non-dismissible-still-reports-escape', async () => {
    const d = await setup({ open: true, dismissible: false });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.close.mock.calls.length).toBe(1);
    expect(d.close.mock.calls[0]![0].detail).toEqual({ reason: 'escape' });
  });

  it('non-dismissible-scrim-click-does-nothing', async () => {
    const d = await setup({ open: true, dismissible: false });
    const scrim = d.part('scrim')!;
    await userEvent.click(scrim, { position: { x: 12, y: 12 } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(d.close).not.toHaveBeenCalled();
    expect(d.dialog()!.open).toBe(true);
  });

  it('initial-focus-lands-on-the-close-button', async () => {
    const d = await setup({ open: true, initialFocus: 'close' });
    // closeButton is the Dialog-owned wrapper around <ds-button>: focus rests inside it.
    const wrapper = d.part('closeButton')!;
    await expect.poll(() => activeChain().some((el) => el !== wrapper && wrapper.contains(el))).toBe(true);
  });

  it('hidden-heading-is-still-the-accessible-name', async () => {
    const d = await setup({ open: true, hideHeading: true });
    expect(d.dialog()).toHaveAccessibleName(d.props.heading);
  });

  it('closed-dialog-renders-nothing', async () => {
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

  it('renders-size-sm', async () => {
    const d = await setup({ size: 'sm' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-md', async () => {
    const d = await setup({ size: 'md' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-lg', async () => {
    const d = await setup({ size: 'lg' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-first', async () => {
    const d = await setup({ initialFocus: 'first' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-title', async () => {
    const d = await setup({ initialFocus: 'title' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-close', async () => {
    const d = await setup({ initialFocus: 'close' });
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
