/**
 * Listbox — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/listbox.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Listbox, type ListboxProps } from './Listbox';
import meta from './Listbox.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<ListboxProps> = {}) {
  const onChange = vi.fn();
  const onActiveChange = vi.fn();
  const props = { ...meta.args, ...given, onChange, onActiveChange } as ComponentProps<typeof Listbox>;
  const utils = render(<Listbox {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onActiveChange,
    props,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Listbox"]')!,
    list: () => utils.container.querySelector<HTMLElement>('[data-ds="Listbox"] [data-part="list"]')!,
    option: () => utils.container.querySelector<HTMLElement>('[data-part="option"]')!,
  };
}

describe('Listbox', () => {
  it('click-on-an-option-selects-it', async () => {
    const s = setup();
    await s.user.click(s.option());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('apple');
  });

  it('arrow-selects-as-it-moves-when-selection-follows-focus', async () => {
    const s = setup({ selectionFollowsFocus: true });
    act(() => s.list().focus());
    await s.user.keyboard('{ArrowDown}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('banana');
  });

  it('arrows-only-move-when-selection-does-not-follow-focus', async () => {
    const s = setup({ selectionFollowsFocus: false });
    act(() => s.list().focus());
    s.onActiveChange.mockClear();
    await s.user.keyboard('{ArrowDown}');
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.onActiveChange).toHaveBeenCalledWith('banana');
  });

  it('space-selects-the-active-option', async () => {
    const s = setup({ selectionFollowsFocus: false });
    act(() => s.list().focus());
    await s.user.keyboard(' ');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('apple');
  });

  it('a-disabled-option-cannot-be-selected', async () => {
    const s = setup({
      options: [
        { value: 'apple', label: 'Apple', disabled: true },
        { value: 'banana', label: 'Banana' },
      ],
    });
    await s.user.click(s.option());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('multiple-marks-the-list-multiselectable', () => {
    const s = setup({ multiple: true });
    expect(s.list()).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('a-selected-option-is-marked-selected', () => {
    const s = setup({ defaultValue: 'apple' });
    expect(s.option()).toHaveAttribute('aria-selected', 'true');
  });

  it('the-empty-message-shows-when-there-are-no-options', () => {
    setup({ options: [] });
    expect(screen.getByText('No options')).toBeInTheDocument();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ options: [], emptyMessage: 'No fruit matches that.' });
    expect(screen.getByText('No fruit matches that.')).toBeInTheDocument();
  });

  it('loading-replaces-the-empty-message', () => {
    const s = setup({ options: [], loading: true });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByText('No options')).not.toBeInTheDocument();
    expect(s.list()).toHaveAttribute('aria-busy', 'true');
  });

  it('invalid-renders-the-invalid-copy', () => {
    const s = setup({ invalid: true });
    expect(screen.getByText('Fruit is not valid.')).toBeInTheDocument();
    expect(s.list()).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
    expect(s.list()).toHaveAttribute('role', 'listbox');
  });

  it.each(['5', '8', '12', 'all'] as const)('renders-max-visible-%s', (maxVisible) => {
    const s = setup({ maxVisible });
    expect(s.list()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('listbox', { name: 'Fruit' })).toBeInTheDocument();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.list()).toHaveAttribute('aria-invalid', 'true');
  });
});
