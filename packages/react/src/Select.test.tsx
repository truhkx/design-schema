/**
 * Select — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/select.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Select, type SelectProps } from './Select';
import meta from './Select.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SelectProps> = {}) {
  const onChange = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...given, onChange, onOpenChange } as ComponentProps<typeof Select>;
  const utils = render(<Select {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onOpenChange,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Select"]')!,
    trigger: () => utils.container.querySelector<HTMLElement>('[data-part="trigger"]')!,
  };
}

describe('Select', () => {
  it('the-trigger-opens-the-popup', async () => {
    const s = setup({ open: false });
    await s.user.click(s.trigger());
    expect(s.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('a-closed-select-is-not-expanded', () => {
    const s = setup({ open: false });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-open-select-reports-the-expanded-state', () => {
    const s = setup({ open: true });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('enter-commits-the-active-option-and-closes', async () => {
    const s = setup({ open: true });
    act(() => s.trigger().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('escape-closes-without-changing-the-value', async () => {
    const s = setup({ open: true });
    act(() => s.trigger().focus());
    await s.user.keyboard('{Escape}');
    expect(s.onOpenChange).toHaveBeenCalledWith(false);
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.trigger()).toHaveFocus();
  });

  it('the-placeholder-shows-when-nothing-is-selected', () => {
    const s = setup({ open: false });
    expect(s.trigger()).toHaveTextContent('Select…');
  });

  it('a-custom-placeholder-replaces-the-default', () => {
    const s = setup({ open: false, placeholder: 'Choose a country' });
    expect(s.root()).toHaveTextContent('Choose a country');
  });

  it('a-disabled-select-does-not-open', async () => {
    const s = setup({ open: false, disabled: true });
    await s.user.click(s.trigger());
    expect(s.onOpenChange).not.toHaveBeenCalled();
    expect(s.trigger()).toHaveAttribute('aria-disabled', 'true');
  });

  it('required-is-shown-in-the-label', () => {
    const s = setup({ required: true });
    expect(s.root().querySelector('[data-part="label"]')!.textContent).toContain(' (required)');
  });

  it('invalid-is-reported-on-the-trigger', () => {
    const s = setup({ invalid: true });
    expect(s.trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(s.root().querySelector('[data-part="errorMessage"]')).toHaveTextContent('Country is not valid.');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-native-auto', () => {
    const s = setup({ native: 'auto' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-native-always', () => {
    const s = setup({ native: 'always' });
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-native-never', () => {
    const s = setup({ native: 'never' });
    expect(s.root()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.getByRole('combobox', { name: /Country/ })).toBe(s.trigger());
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.trigger().focus());
    expect(s.trigger()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(s.root()).toHaveTextContent('Fix this before continuing.');
    expect(s.trigger()).toHaveAttribute('aria-invalid', 'true');
  });
});
