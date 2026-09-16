/**
 * <ds-side-panel> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the panel uses delegatesFocus and a native
 * <dialog> in modal mode, which jsdom does not implement. `given` is applied as properties on top
 * of the Default story's args; the doc's `role` is the Lit `landmark` property.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './SidePanel.js';
import './Input.js';
import './Button.js';
import type { DsSidePanel, SidePanelOpenChangeDetail } from './SidePanel.js';
import meta from './SidePanel.stories.js';

type Given = Partial<
  Pick<
    DsSidePanel,
    'open' | 'heading' | 'hideHeading' | 'side' | 'width' | 'persistent' | 'landmark' | 'modal' | 'scrim' | 'dismissible' | 'swipeable'
  >
>;

/** The Default story's args plus the scenario's `given`, on a fresh element with a trigger, a body control and a footer. */
async function setup(given: Given = {}) {
  // A focusable before the panel, so a restore that falls back to the first focusable cannot pass by accident.
  const before = document.createElement('button');
  before.textContent = 'Before';
  document.body.append(before);

  const el = document.createElement('ds-side-panel');
  const props = { ...meta.args, ...given } as Given & { heading: string };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const trigger = document.createElement('ds-button') as HTMLElement & { label: string };
  trigger.slot = 'trigger';
  trigger.label = 'Menu';
  const input = document.createElement('ds-input') as HTMLElement & { label: string; name: string };
  input.label = 'Keyword';
  input.name = 'keyword';
  const apply = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  apply.slot = 'footer';
  apply.label = 'Apply';
  apply.variant = 'primary';
  el.append(trigger, input, apply);

  const openChange = vi.fn<(event: CustomEvent<SidePanelOpenChangeDetail>) => void>();
  el.addEventListener('open-change', openChange as unknown as EventListener);

  document.body.append(el);
  await el.updateComplete;
  const scope = el.shadowRoot!.querySelector<HTMLElement & { updateComplete: Promise<boolean> }>('[data-part="focusScope"]');
  await scope?.updateComplete;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const root = el.shadowRoot!;
  return {
    el,
    props,
    trigger,
    input,
    openChange,
    part: <T extends Element = HTMLElement>(name: string) => root.querySelector<T>(`[data-part="${name}"]`),
  };
}

function expectRendered(surface: HTMLElement | null): void {
  expect(surface).not.toBeNull();
  expect(surface!.hidden).toBe(false);
  expect(surface!.getBoundingClientRect().height).toBeGreaterThan(0);
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-side-panel', () => {
  it('close-button-fires-on-open-change', async () => {
    const d = await setup({ open: true });
    await userEvent.click(d.part('closeButton')!);
    await expect.poll(() => d.openChange.mock.calls.length).toBe(1);
    expect(d.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'close-button' });
    // Controlled: the panel waits for the consumer to flip `open`.
    expect(d.el.open).toBe(true);
  });

  it('the-close-button-works-without-the-swipe', async () => {
    const d = await setup({ open: true, swipeable: false });
    await userEvent.click(d.part('closeButton')!);
    await expect.poll(() => d.openChange.mock.calls.length).toBe(1);
    expect(d.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'close-button' });
  });

  it('non-dismissible-still-reports-escape', async () => {
    const d = await setup({ open: true, dismissible: false });
    expect(d.part('closeButton')).toBeNull();
    d.input.focus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.openChange.mock.calls.length).toBe(1);
    expect(d.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'escape' });
  });

  it('non-dismissible-scrim-tap-does-nothing', async () => {
    const d = await setup({ open: true, dismissible: false });
    const scrim = d.part('scrim')!;
    const rect = scrim.getBoundingClientRect();
    // The strip beside the panel, clear of the scrollbar gutter.
    await userEvent.click(scrim, { position: { x: Math.round(rect.width) - 20, y: 20 } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(d.openChange).not.toHaveBeenCalled();
    expectRendered(d.part('surface'));
  });

  it('the-heading-is-rendered', async () => {
    const d = await setup({ open: true, heading: 'Your cart' });
    const heading = d.part('heading')!;
    expect(heading.textContent?.trim()).toBe('Your cart');
    expect(heading.getBoundingClientRect().width).toBeGreaterThan(1);
  });

  /* derived */
  it('renders', async () => {
    const d = await setup();
    expectRendered(d.part('surface'));
  });

  it('renders-side-start', async () => {
    const d = await setup({ side: 'start' });
    expectRendered(d.part('surface'));
  });

  it('renders-side-end', async () => {
    const d = await setup({ side: 'end' });
    expectRendered(d.part('surface'));
  });

  it('renders-width-narrow', async () => {
    const d = await setup({ width: 'narrow' });
    expectRendered(d.part('surface'));
  });

  it('renders-width-default', async () => {
    const d = await setup({ width: 'default' });
    expectRendered(d.part('surface'));
  });

  it('renders-width-wide', async () => {
    const d = await setup({ width: 'wide' });
    expectRendered(d.part('surface'));
  });

  it('renders-persistent-never', async () => {
    const d = await setup({ persistent: 'never' });
    expectRendered(d.part('surface'));
  });

  it('renders-persistent-content', async () => {
    const d = await setup({ persistent: 'content' });
    expectRendered(d.part('surface'));
  });

  it('renders-persistent-page', async () => {
    const d = await setup({ persistent: 'page' });
    expectRendered(d.part('surface'));
  });

  it('renders-role-complementary', async () => {
    const d = await setup({ landmark: 'complementary' });
    expectRendered(d.part('surface'));
    expect(d.part('surface')!.tagName).toBe('ASIDE');
  });

  it('renders-role-navigation', async () => {
    const d = await setup({ landmark: 'navigation' });
    expectRendered(d.part('surface'));
    expect(d.part('surface')!.tagName).toBe('NAV');
  });

  it('has-accessible-name', async () => {
    const d = await setup();
    expect(d.part('surface')).toHaveAccessibleName(d.props.heading);
  });

  it('escape-fires-on-open-change', async () => {
    const d = await setup({ open: true });
    d.input.focus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => d.openChange.mock.calls.length).toBe(1);
    expect(d.openChange.mock.calls[0]![0].detail).toEqual({ open: false, reason: 'escape' });
  });
});
