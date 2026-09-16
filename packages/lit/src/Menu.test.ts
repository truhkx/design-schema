/**
 * <ds-menu> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus and the
 * Popover API, neither of which jsdom implements.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Menu.js';
import type { DsMenu, MenuActionDetail, MenuOpenChangeDetail } from './Menu.js';
import meta from './Menu.stories.js';

type Given = Partial<Pick<DsMenu, 'label' | 'items' | 'triggerVariant' | 'triggerIcon' | 'iconOnly' | 'placement' | 'open'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const before = document.createElement('button');
  before.textContent = 'Before';
  document.body.append(before);

  const el = document.createElement('ds-menu');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const events: string[] = [];
  const action = vi.fn<(event: CustomEvent<MenuActionDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<MenuOpenChangeDetail>) => void>();
  el.addEventListener('action', ((event: CustomEvent<MenuActionDetail>) => {
    events.push('action');
    action(event);
  }) as EventListener);
  el.addEventListener('open-change', ((event: CustomEvent<MenuOpenChangeDetail>) => {
    events.push('open-change');
    openChange(event);
  }) as EventListener);

  document.body.append(el);
  await el.updateComplete;
  await settle();

  const root = el.shadowRoot!;
  return {
    el,
    props,
    events,
    action,
    openChange,
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
    parts: <T extends Element = HTMLElement>(name: string) => [...root.querySelectorAll<T>(`[data-part="${name}"]`)],
    nativeTrigger: () => root.querySelector('ds-button')!.shadowRoot!.querySelector<HTMLButtonElement>('button')!,
  };
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 50));

const TWO_ITEMS = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
];

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-menu', () => {
  it('choosing-an-item-reports-the-action-and-the-close', async () => {
    const m = await setup({ open: true, label: 'More actions', items: TWO_ITEMS });
    await userEvent.click(m.parts('item')[0]!);
    expect(m.action).toHaveBeenCalledTimes(1);
    expect(m.action.mock.calls[0]![0].detail).toEqual({ id: 'rename' });
    expect(m.openChange).toHaveBeenCalledTimes(1);
    expect(m.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'action' });
    expect(m.events).toEqual(['open-change', 'action']);
  });

  it('a-disabled-item-does-nothing', async () => {
    const m = await setup({
      open: true,
      label: 'More actions',
      items: [
        { id: 'rename', label: 'Rename', disabled: true },
        { id: 'duplicate', label: 'Duplicate' },
      ],
    });
    const item = m.parts('item')[0]!;
    expect(item).toBeVisible();
    expect(item).toHaveAttribute('aria-disabled', 'true');
    // Playwright's actionability check refuses aria-disabled targets; the click must still land.
    await userEvent.click(item, { force: true });
    expect(m.action).not.toHaveBeenCalled();
  });

  it('escape-closes-without-choosing', async () => {
    const m = await setup({ open: true, label: 'More actions', items: TWO_ITEMS });
    await userEvent.keyboard('{Escape}');
    expect(m.action).not.toHaveBeenCalled();
    expect(m.el.shadowRoot!.activeElement).toBe(m.part('trigger'));
  });

  it('the-popup-is-a-menu', async () => {
    const m = await setup({ open: true, label: 'More actions', items: [{ id: 'rename', label: 'Rename' }] });
    const menu = m.el.shadowRoot!.querySelector<HTMLElement>('[role="menu"]');
    expect(menu).not.toBeNull();
    expect(menu).toHaveAccessibleName('More actions');
    expect(menu!.querySelectorAll('[role="menuitem"]')).toHaveLength(1);
    expect(menu!.querySelector('button')).toBeNull();
  });

  /* derived: anatomy */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.triggerVariant */
  it('renders-trigger-variant-ghost', async () => {
    const { el } = await setup({ triggerVariant: 'ghost' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-trigger-variant-secondary', async () => {
    const { el } = await setup({ triggerVariant: 'secondary' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-trigger-variant-primary', async () => {
    const { el } = await setup({ triggerVariant: 'primary' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.triggerIcon */
  it('renders-trigger-icon-ellipsis', async () => {
    const { el } = await setup({ triggerIcon: 'ellipsis' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-trigger-icon-chevron-down', async () => {
    const { el } = await setup({ triggerIcon: 'chevron-down' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-trigger-icon-none', async () => {
    const { el } = await setup({ triggerIcon: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', async () => {
    const { el } = await setup({ placement: 'bottom-start' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-bottom-end', async () => {
    const { el } = await setup({ placement: 'bottom-end' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-top-start', async () => {
    const { el } = await setup({ placement: 'top-start' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-top-end', async () => {
    const { el } = await setup({ placement: 'top-end' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const { nativeTrigger, props } = await setup();
    expect(nativeTrigger()).toHaveAccessibleName(props.label);
  });

  /* derived: overlay.dismiss escape */
  it('escape-fires-on-open-change', async () => {
    const m = await setup({ open: true });
    await userEvent.keyboard('{Escape}');
    expect(m.openChange).toHaveBeenCalledTimes(1);
    expect(m.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'escape' });
  });
});
