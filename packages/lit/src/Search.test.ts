/**
 * <ds-search> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Search.js';
import type { DsSearch, SearchChangeDetail, SearchSize, SearchSubmitDetail } from './Search.js';
import meta from './Search.stories.js';

type Given = Partial<Pick<DsSearch, 'defaultValue' | 'action' | 'size'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-search');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<SearchChangeDetail>) => void>();
  const submit = vi.fn<(event: CustomEvent<SearchSubmitDetail>) => void>();
  const clear = vi.fn<(event: CustomEvent) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('submit', submit as unknown as EventListener);
  el.addEventListener('clear', clear as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    submit,
    clear,
    props,
    input: () => root.querySelector<HTMLInputElement>('[data-part=input]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`)!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ds-search', () => {
  it('typing-fires-onchange-with-the-query', async () => {
    const s = await setup();
    await userEvent.type(s.input(), 'invoices');
    expect(s.change).toHaveBeenCalled();
    expect(s.change.mock.calls.at(-1)?.[0].detail).toEqual({ value: 'invoices' });
  });

  it('enter-submits-the-query', async () => {
    const s = await setup({ defaultValue: 'invoices' });
    s.input().focus();
    await userEvent.keyboard('{Enter}');
    expect(s.submit).toHaveBeenCalledTimes(1);
    expect(s.submit.mock.calls[0]?.[0].detail).toEqual({ value: 'invoices' });
  });

  it('an-empty-query-is-not-submitted', async () => {
    const s = await setup();
    s.input().focus();
    await userEvent.keyboard('{Enter}');
    expect(s.submit).not.toHaveBeenCalled();
  });

  it('the-submit-button-submits-the-query', async () => {
    // With `action` the element submits a real GET form; keep the test page where it is.
    const navigate = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
    const s = await setup({ defaultValue: 'invoices', action: '/search' });
    await userEvent.click(s.part('submitButton'));
    expect(s.submit).toHaveBeenCalledTimes(1);
    expect(s.submit.mock.calls[0]?.[0].detail).toEqual({ value: 'invoices' });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('the-clear-button-empties-the-field', async () => {
    const s = await setup({ defaultValue: 'invoices' });
    await userEvent.click(s.part('clearButton'));
    await s.el.updateComplete;
    expect(s.clear).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls.at(-1)?.[0].detail).toEqual({ value: '' });
    expect(s.change.mock.invocationCallOrder.at(-1)!).toBeLessThan(s.clear.mock.invocationCallOrder[0]!);
    expect(s.input()).toHaveValue('');
  });

  it('escape-clears-the-field-when-no-list-is-open', async () => {
    const s = await setup({ defaultValue: 'invoices' });
    s.input().focus();
    await userEvent.keyboard('{Escape}');
    await s.el.updateComplete;
    expect(s.clear).toHaveBeenCalledTimes(1);
    expect(s.input()).toHaveValue('');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.input()).not.toBeNull();
  });

  for (const size of ['md', 'lg'] as SearchSize[]) {
    it(`renders-size-${size}`, async () => {
      const s = await setup({ size });
      expect(s.input()).not.toBeNull();
      expect(s.el).toHaveAttribute('size', size);
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.input()).toHaveAccessibleName(expect.stringContaining(s.props.label!));
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(s.el.shadowRoot!.activeElement).toBe(s.input());
  });
});
