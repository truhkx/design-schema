/**
 * <ds-focus-scope> — behavior scenarios from the component doc, one test each, in the doc's order,
 * plus the keyboard model. Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './FocusScope.js';
import type { DsFocusScope, FocusScopeEscapeAttemptDetail } from './FocusScope.js';
import meta from './FocusScope.stories.js';

/** Focus inside nested shadow roots shows up as a chain of hosts. */
function activeChain(): Element[] {
  const chain: Element[] = [];
  let el: Element | null = document.activeElement;
  while (el) {
    chain.push(el);
    el = el.shadowRoot?.activeElement ?? null;
  }
  return chain;
}

type Given = Partial<Pick<DsFocusScope, 'trapped' | 'autoFocus' | 'restoreFocus' | 'active'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with three buttons. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-focus-scope');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const buttons = ['One', 'Two', 'Three'].map((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    return button;
  });
  el.append(...buttons);
  const escapeAttempt = vi.fn<(event: CustomEvent<FocusScopeEscapeAttemptDetail>) => void>();
  el.addEventListener('escape-attempt', escapeAttempt as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  return { el, buttons, escapeAttempt, scope: el.shadowRoot!.querySelector<HTMLElement>('[data-part="scope"]')! };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-focus-scope', () => {
  it('auto-focus-container-focuses-the-wrapper', async () => {
    const { scope } = await setup({ autoFocus: 'container' });
    expect(activeChain()).toContain(scope);
  });

  it('auto-focus-none-moves-focus-nowhere', async () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    const { el } = await setup({ autoFocus: 'none' });
    expect(document.activeElement).toBe(outside);
    expect(activeChain()).not.toContain(el);
  });

  it('the-wrapper-is-not-focusable', async () => {
    const { el, scope } = await setup({ autoFocus: 'none' });
    expect(scope).not.toHaveAttribute('tabindex');
    el.focus();
    scope.focus();
    expect(activeChain()).not.toContain(el);
    expect(activeChain()).not.toContain(scope);
  });

  it('the-scope-adds-no-role', async () => {
    const { el, scope } = await setup();
    expect(el).not.toHaveAttribute('role');
    expect(scope).not.toHaveAttribute('role');
  });

  /* derived */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  for (const autoFocus of ['first', 'last', 'container', 'none'] as const) {
    it(`renders-auto-focus-${autoFocus}`, async () => {
      const { el } = await setup({ autoFocus });
      expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
    });
  }

  /* keyboard */
  it('tab from the last wraps to the first', async () => {
    const { buttons, escapeAttempt } = await setup({ autoFocus: 'last' });
    expect(document.activeElement).toBe(buttons[2]);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(buttons[0]);
    expect(escapeAttempt).toHaveBeenCalledTimes(1);
    expect(escapeAttempt.mock.calls[0]?.[0]?.detail).toEqual({ direction: 'forward' });
  });

  it('shift+tab from the first wraps to the last', async () => {
    const { buttons, escapeAttempt } = await setup({ autoFocus: 'first' });
    expect(document.activeElement).toBe(buttons[0]);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(buttons[2]);
    expect(escapeAttempt.mock.calls[0]?.[0]?.detail).toEqual({ direction: 'backward' });
  });

  it('tab moves forward inside the scope', async () => {
    const { buttons, escapeAttempt } = await setup({ autoFocus: 'first' });
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(buttons[1]);
    expect(escapeAttempt).not.toHaveBeenCalled();
  });

  it('shift+tab from the container wraps to the last', async () => {
    const { buttons, escapeAttempt } = await setup({ autoFocus: 'container' });
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(buttons[2]);
    expect(escapeAttempt.mock.calls[0]?.[0]?.detail).toEqual({ direction: 'backward' });
  });

  it('only the top active scope has tab-stop sentinels', async () => {
    const { el: outer } = await setup();
    const inner = document.createElement('ds-focus-scope');
    inner.append(document.createElement('button'));
    outer.append(inner);
    await inner.updateComplete;
    await outer.updateComplete;
    const sentinelTabIndex = (scope: DsFocusScope) =>
      scope.shadowRoot!.querySelector('[data-focus-sentinel="start"]')!.getAttribute('tabindex');
    expect(sentinelTabIndex(inner)).toBe('0');
    expect(sentinelTabIndex(outer)).toBe('-1');
    inner.remove();
    await outer.updateComplete;
    expect(sentinelTabIndex(outer)).toBe('0');
  });

  it('restores focus to the opener on unmount', async () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { el, buttons } = await setup();
    expect(document.activeElement).toBe(buttons[0]);
    el.remove();
    expect(document.activeElement).toBe(opener);
  });
});
