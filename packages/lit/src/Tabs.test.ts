/**
 * <ds-tabs> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Tabs.js';
import type { DsTabs, TabsActivation, TabsChangeDetail, TabsFit, TabsOrientation } from './Tabs.js';
import meta from './Tabs.stories.js';

type Given = Partial<Pick<DsTabs, 'tabs' | 'label' | 'defaultValue' | 'activation' | 'orientation' | 'fit' | 'keepMounted'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with one panel per tab. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-tabs');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const tab of el.tabs) {
    const panel = document.createElement('ds-tab-panel');
    panel.id = tab.id;
    panel.textContent = tab.label;
    el.append(panel);
  }
  const change = vi.fn<(event: CustomEvent<TabsChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    props,
    tablist: () => root.querySelector<HTMLElement>('[data-part=tablist]')!,
    tabs: () => Array.from(root.querySelectorAll<HTMLButtonElement>('[data-part=tab]')),
    tab: () => root.querySelector<HTMLButtonElement>('[data-part=tab]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-tabs', () => {
  it('click-selects-a-tab', async () => {
    const s = await setup({ defaultValue: 'activity' });
    await userEvent.click(s.tab());
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: s.el.tabs[0]!.id });
    expect(s.tab()).toHaveAttribute('aria-selected', 'true');
  });

  it('clicking-the-selected-tab-changes-nothing', async () => {
    const s = await setup({ defaultValue: 'overview' });
    await userEvent.click(s.tab());
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
  });

  it('arrow-selects-under-automatic-activation', async () => {
    const s = await setup({ activation: 'automatic' });
    s.tab().focus();
    await userEvent.keyboard('{ArrowRight}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: s.el.tabs[1]!.id });
  });

  it('manual-activation-does-not-select-on-arrow', async () => {
    const s = await setup({ activation: 'manual' });
    s.tab().focus();
    await userEvent.keyboard('{ArrowRight}');
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
    expect(s.el.shadowRoot!.activeElement).toBe(s.tabs()[1]);
  });

  it('a-disabled-tab-cannot-be-selected', async () => {
    const s = await setup({
      tabs: [
        { id: 'overview', label: 'Overview', disabled: true },
        { id: 'activity', label: 'Activity' },
      ],
      defaultValue: 'activity',
    });
    // Playwright will not click an aria-disabled control on its own; a person can.
    await userEvent.click(s.tab(), { force: true });
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
    expect(s.tab()).toHaveAttribute('aria-selected', 'false');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.tablist()).not.toBeNull();
    expect(s.tabs()).toHaveLength(s.el.tabs.length);
  });

  for (const activation of ['automatic', 'manual'] as TabsActivation[]) {
    it(`renders-activation-${activation}`, async () => {
      const s = await setup({ activation });
      expect(s.tablist()).not.toBeNull();
    });
  }

  for (const orientation of ['horizontal', 'vertical'] as TabsOrientation[]) {
    it(`renders-orientation-${orientation}`, async () => {
      const s = await setup({ orientation });
      expect(s.tablist()).toHaveAttribute('aria-orientation', orientation);
    });
  }

  for (const fit of ['start', 'fill'] as TabsFit[]) {
    it(`renders-fit-${fit}`, async () => {
      const s = await setup({ fit });
      expect(s.tablist()).not.toBeNull();
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.tablist()).toHaveAccessibleName(s.props.label);
  });
});
