/**
 * Combobox — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/combobox.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Combobox, type ComboboxProps } from './Combobox';
import meta from './Combobox.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<ComboboxProps> = {}) {
  const onChange = vi.fn();
  const onInputChange = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...given, onChange, onInputChange, onOpenChange } as ComponentProps<typeof Combobox>;
  const utils = render(<Combobox {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onInputChange,
    onOpenChange,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Combobox"]')!,
    input: () => utils.container.querySelector<HTMLInputElement>('[data-part="input"]')!,
    part: (name: string) => utils.container.querySelector<HTMLElement>(`[data-part="${name}"]`)!,
    /** A composed Button part: Button owns its own data-part, so the anatomy name is on its wrapper. */
    button: (name: string) => utils.container.querySelector<HTMLElement>(`[data-part="${name}"] button`)!,
  };
}

describe('Combobox', () => {
  it('typing-reports-the-input-text', async () => {
    const s = setup({ open: false });
    await s.user.type(s.input(), 'ap');
    expect(s.onInputChange).toHaveBeenCalled();
    expect(s.onInputChange).toHaveBeenLastCalledWith('ap');
  });

  it('the-toggle-button-opens-the-list', async () => {
    const s = setup({ open: false });
    await s.user.click(s.button('toggleButton'));
    expect(s.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('a-closed-combobox-is-not-expanded', () => {
    const s = setup({ open: false });
    expect(s.input()).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-open-list-reports-the-expanded-state', () => {
    const s = setup({ open: true });
    expect(s.input()).toHaveAttribute('aria-expanded', 'true');
  });

  it('enter-commits-the-active-option', async () => {
    const s = setup({ open: true });
    act(() => s.input().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
  });

  it('escape-closes-the-list', async () => {
    const s = setup({ open: true });
    act(() => s.input().focus());
    await s.user.keyboard('{Escape}');
    expect(s.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('the-clear-button-clears-the-value', async () => {
    const s = setup({ open: false, defaultValue: 'apple', clearable: true });
    await s.user.click(s.button('clearButton'));
    expect(s.onChange).toHaveBeenCalled();
  });

  it('multiple-shows-the-selection-as-chips', () => {
    const s = setup({ open: false, multiple: true, defaultValue: ['apple'] });
    expect(s.part('chip')).toHaveTextContent('Apple');
  });

  it('removing-a-chip-reports-the-new-value', async () => {
    const s = setup({ open: false, multiple: true, defaultValue: ['apple'] });
    await s.user.click(s.button('chipRemove'));
    expect(s.onChange).toHaveBeenCalledWith([]);
  });

  it('a-disabled-combobox-does-not-open', async () => {
    const s = setup({ open: false, disabled: true });
    await s.user.click(s.button('toggleButton'));
    expect(s.onOpenChange).not.toHaveBeenCalled();
    expect(s.input()).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-filter-starts-with', () => {
    const s = setup({ filter: 'startsWith' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-filter-contains', () => {
    const s = setup({ filter: 'contains' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-filter-none', () => {
    const s = setup({ filter: 'none' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-filter-async', () => {
    const s = setup({ filter: 'async' });
    expect(s.root()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.getByRole('combobox', { name: /Fruit/ })).toBe(s.input());
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.input().focus());
    expect(s.input()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(s.root()).toHaveTextContent('Fix this before continuing.');
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });
});
