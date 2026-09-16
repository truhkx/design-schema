/**
 * <ds-combobox> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Combobox.js';
import type {
  ComboboxChangeDetail,
  ComboboxFilter,
  ComboboxInputChangeDetail,
  ComboboxOpenChangeDetail,
  DsCombobox,
} from './Combobox.js';
import meta from './Combobox.stories.js';

type Given = Partial<
  Pick<DsCombobox, 'open' | 'defaultValue' | 'clearable' | 'multiple' | 'disabled' | 'filter' | 'error'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-combobox');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<ComboboxChangeDetail>) => void>();
  const inputChange = vi.fn<(event: CustomEvent<ComboboxInputChangeDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<ComboboxOpenChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('input-change', inputChange as unknown as EventListener);
  el.addEventListener('open-change', openChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    inputChange,
    openChange,
    props,
    input: () => root.querySelector<HTMLInputElement>('[data-part=input]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`)!,
    text: () => root.textContent ?? '',
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-combobox', () => {
  it('typing-reports-the-input-text', async () => {
    const s = await setup({ open: false });
    await userEvent.type(s.input(), 'ap');
    expect(s.inputChange).toHaveBeenCalled();
    expect(s.inputChange.mock.calls.at(-1)?.[0].detail).toEqual({ value: 'ap' });
  });

  it('the-toggle-button-opens-the-list', async () => {
    const s = await setup({ open: false });
    await userEvent.click(s.part('toggleButton'));
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ open: true });
  });

  it('a-closed-combobox-is-not-expanded', async () => {
    const s = await setup({ open: false });
    expect(s.input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-open-list-reports-the-expanded-state', async () => {
    const s = await setup({ open: true });
    expect(s.input()).toHaveAttribute('aria-expanded', 'true');
  });

  it('enter-commits-the-active-option', async () => {
    const s = await setup({ open: true });
    s.input().focus();
    await userEvent.keyboard('{Enter}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'apple' });
  });

  it('escape-closes-the-list', async () => {
    const s = await setup({ open: true });
    s.input().focus();
    await userEvent.keyboard('{Escape}');
    await s.el.updateComplete;
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ open: false });
  });

  it('the-clear-button-clears-the-value', async () => {
    const s = await setup({ open: false, defaultValue: 'apple', clearable: true });
    await userEvent.click(s.part('clearButton'));
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: '' });
  });

  it('multiple-shows-the-selection-as-chips', async () => {
    const s = await setup({ open: false, multiple: true, defaultValue: ['apple'] });
    expect(s.part('chip')).toHaveTextContent('Apple');
  });

  it('removing-a-chip-reports-the-new-value', async () => {
    const s = await setup({ open: false, multiple: true, defaultValue: ['apple'] });
    await userEvent.click(s.part('chipRemove'));
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: [] });
  });

  it('a-disabled-combobox-does-not-open', async () => {
    const s = await setup({ open: false, disabled: true });
    // Playwright will not click a disabled control on its own; a person can try.
    await userEvent.click(s.part('toggleButton'), { force: true });
    expect(s.openChange).not.toHaveBeenCalled();
    expect(s.el).toHaveAttribute('disabled');
    expect(s.input()).toHaveAttribute('aria-disabled', 'true');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.input()).not.toBeNull();
  });

  for (const filter of ['startsWith', 'contains', 'none', 'async'] as ComboboxFilter[]) {
    it(`renders-filter-${filter.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, async () => {
      const s = await setup({ filter });
      expect(s.input()).not.toBeNull();
      expect(s.el).toHaveAttribute('filter', filter);
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

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.text()).toContain('Fix this before continuing.');
    expect(s.el).toHaveAttribute('invalid');
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });
});
