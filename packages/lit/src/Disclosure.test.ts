/**
 * <ds-disclosure> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus, which jsdom
 * does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Disclosure.js';
import type { DisclosureHeadingLevel, DisclosureToggleDetail, DsDisclosure } from './Disclosure.js';
import meta from './Disclosure.stories.js';

type Given = Partial<
  Pick<DsDisclosure, 'summary' | 'open' | 'defaultOpen' | 'disabled' | 'keepMounted' | 'headingLevel'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-disclosure');
  const { children, ...args } = meta.args!;
  const props = { ...args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  el.append(children ?? '');
  const toggle = vi.fn<(event: CustomEvent<DisclosureToggleDetail>) => void>();
  el.addEventListener('toggle', toggle as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    toggle,
    props,
    trigger: () => root.querySelector<HTMLButtonElement>('[data-part=trigger]')!,
    panel: () => root.querySelector<HTMLElement>('[data-part=panel]'),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-disclosure', () => {
  it('click-on-trigger-expands', async () => {
    const s = await setup();
    await userEvent.click(s.trigger());
    await s.el.updateComplete;
    expect(s.toggle).toHaveBeenCalledTimes(1);
    expect(s.toggle.mock.calls[0]?.[0].detail).toEqual({ open: true, reason: 'pointer' });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(s.el.currentOpen).toBe(true);
    expect(s.panel()).not.toBeNull();
  });

  it('open-disclosure-collapses-on-click', async () => {
    const s = await setup({ defaultOpen: true });
    await userEvent.click(s.trigger());
    await s.el.updateComplete;
    expect(s.toggle).toHaveBeenCalledTimes(1);
    expect(s.toggle.mock.calls[0]?.[0].detail.open).toBe(false);
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(s.el.currentOpen).toBe(false);
    expect(s.panel()).toBeNull();
  });

  it('disabled-trigger-does-not-toggle', async () => {
    const s = await setup({ disabled: true });
    // Playwright will not click an aria-disabled control on its own; a person can.
    await userEvent.click(s.trigger(), { force: true });
    await s.el.updateComplete;
    expect(s.toggle).not.toHaveBeenCalled();
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(s.el.currentOpen).toBe(false);
    expect(s.trigger()).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled-trigger-stays-focusable', async () => {
    const s = await setup({ disabled: true });
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.trigger());
  });

  it('controlled-open-change-reports-controlled', async () => {
    const s = await setup({ open: false });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
    s.el.open = true;
    await s.el.updateComplete;
    expect(s.toggle).toHaveBeenCalledTimes(1);
    expect(s.toggle.mock.calls[0]?.[0].detail).toEqual({ open: true, reason: 'controlled' });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(s.el.currentOpen).toBe(true);
    expect(s.panel()).not.toBeNull();
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.trigger()).not.toBeNull();
  });

  for (const level of ['2', '3', '4', '5', '6'] as DisclosureHeadingLevel[]) {
    it(`renders-heading-level-${level}`, async () => {
      const s = await setup({ headingLevel: level });
      expect(s.trigger()).not.toBeNull();
      expect(s.trigger().parentElement?.localName).toBe(`h${level}`);
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.trigger()).toHaveAccessibleName(s.props.summary);
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.trigger());
  });
});
