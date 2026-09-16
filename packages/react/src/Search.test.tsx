/**
 * Search — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/search.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Search, type SearchProps } from './Search';
import meta from './Search.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SearchProps> = {}) {
  const onChange = vi.fn();
  const onSubmit = vi.fn();
  const onClear = vi.fn();
  const props = { ...meta.args, ...given, onChange, onSubmit, onClear } as ComponentProps<typeof Search>;
  const utils = render(<Search {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onSubmit,
    onClear,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Search"]')!,
    input: () => utils.container.querySelector<HTMLInputElement>('[data-part="input"]')!,
    /** A composed Button part: Button owns its own data-part, so the anatomy name is on its wrapper. */
    button: (name: string) => utils.container.querySelector<HTMLElement>(`[data-part="${name}"] button`)!,
  };
}

describe('Search', () => {
  it('typing-fires-onchange-with-the-query', async () => {
    const s = setup();
    await s.user.type(s.input(), 'invoices');
    expect(s.onChange).toHaveBeenCalledTimes('invoices'.length);
    expect(s.onChange).toHaveBeenLastCalledWith('invoices');
  });

  it('enter-submits-the-query', async () => {
    const s = setup({ defaultValue: 'invoices' });
    act(() => s.input().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onSubmit).toHaveBeenCalledTimes(1);
    expect(s.onSubmit).toHaveBeenCalledWith('invoices');
  });

  it('an-empty-query-is-not-submitted', async () => {
    const s = setup();
    act(() => s.input().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onSubmit).not.toHaveBeenCalled();
  });

  it('the-submit-button-submits-the-query', async () => {
    const s = setup({ defaultValue: 'invoices', action: '/search' });
    // jsdom cannot navigate; stop the native GET after the component has handled the submit.
    s.root().addEventListener('submit', (event) => event.preventDefault());
    await s.user.click(s.button('submitButton'));
    expect(s.onSubmit).toHaveBeenCalledTimes(1);
    expect(s.onSubmit).toHaveBeenCalledWith('invoices');
  });

  it('the-clear-button-empties-the-field', async () => {
    const s = setup({ defaultValue: 'invoices' });
    await s.user.click(s.button('clearButton'));
    expect(s.onClear).toHaveBeenCalledTimes(1);
    expect(s.input()).toHaveValue('');
  });

  it('escape-clears-the-field-when-no-list-is-open', async () => {
    const s = setup({ defaultValue: 'invoices' });
    act(() => s.input().focus());
    await s.user.keyboard('{Escape}');
    expect(s.onClear).toHaveBeenCalledTimes(1);
    expect(s.input()).toHaveValue('');
  });

  it('the-field-is-inside-the-search-landmark', () => {
    setup();
    const landmark = screen.getByRole('search');
    expect(landmark).toHaveAttribute('data-ds', 'Search');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.root()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('searchbox')).toHaveAccessibleName(meta.args!.label!);
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.input().focus());
    expect(s.input()).toHaveFocus();
  });
});
