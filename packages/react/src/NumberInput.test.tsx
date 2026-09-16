/**
 * NumberInput — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/number-input.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { NumberInput, type NumberInputProps } from './NumberInput';
import meta from './NumberInput.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<NumberInputProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as ComponentProps<typeof NumberInput>;
  const utils = render(<NumberInput {...props} />);
  const user = userEvent.setup();
  const root = utils.container.querySelector<HTMLElement>('[data-ds="NumberInput"]');
  const input = () => screen.getByRole('spinbutton');
  const part = (name: string) => root!.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
  const press = async (key: string) => {
    act(() => input().focus());
    await user.keyboard(`{${key}}`);
  };
  return { ...utils, user, onChange, root, input, part, press };
}

describe('NumberInput', () => {
  it('the-increment-button-steps-up', async () => {
    const s = setup({ defaultValue: 5, step: 1 });
    await s.user.click(s.part('incrementButton'));
    expect(s.onChange).toHaveBeenCalledWith(6);
  });

  it('the-decrement-button-steps-down', async () => {
    const s = setup({ defaultValue: 5, step: 1 });
    await s.user.click(s.part('decrementButton'));
    expect(s.onChange).toHaveBeenCalledWith(4);
  });

  it('arrow-up-increases-by-one-step', async () => {
    const s = setup({ defaultValue: 5 });
    await s.press('ArrowUp');
    expect(s.onChange).toHaveBeenCalledWith(6);
  });

  it('arrow-down-decreases-by-one-step', async () => {
    const s = setup({ defaultValue: 5 });
    await s.press('ArrowDown');
    expect(s.onChange).toHaveBeenCalledWith(4);
  });

  it('page-up-changes-by-ten-steps', async () => {
    const s = setup({ defaultValue: 5 });
    await s.press('PageUp');
    expect(s.onChange).toHaveBeenCalledWith(15);
  });

  it('arrow-keys-work-without-the-steppers', async () => {
    const s = setup({ defaultValue: 5, hideSteppers: true });
    expect(s.root!.querySelector('[data-part="incrementButton"]')).toBeNull();
    await s.press('ArrowUp');
    expect(s.onChange).toHaveBeenCalledWith(6);
  });

  it('typing-a-number-reports-it', async () => {
    const s = setup();
    await s.user.type(s.input(), '7');
    expect(s.onChange).toHaveBeenCalledWith(7);
  });

  it('decrement-does-nothing-at-the-minimum', async () => {
    const s = setup({ defaultValue: 0, min: 0, max: 10 });
    await s.user.click(s.part('decrementButton'));
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('a-disabled-field-does-not-step', async () => {
    const s = setup({ disabled: true, defaultValue: 5 });
    await s.user.click(s.part('incrementButton'));
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('the-field-reports-its-value-and-bounds', () => {
    const s = setup({ defaultValue: 4, min: 0, max: 10 });
    expect(s.input()).toHaveAttribute('aria-valuenow', '4');
    expect(s.input()).toHaveAttribute('aria-valuemin', '0');
    expect(s.input()).toHaveAttribute('aria-valuemax', '10');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root).toBeInTheDocument();
  });

  it('renders-format-decimal', () => {
    const s = setup({ format: 'decimal' });
    expect(s.root).toBeInTheDocument();
  });

  it('renders-format-currency', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const s = setup({ format: 'currency' });
    expect(s.root).toBeInTheDocument();
    warn.mockRestore();
  });

  it('renders-format-percent', () => {
    const s = setup({ format: 'percent' });
    expect(s.root).toBeInTheDocument();
  });

  it('renders-format-unit', () => {
    const s = setup({ format: 'unit' });
    expect(s.root).toBeInTheDocument();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.root).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.root).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeInTheDocument();
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.input().focus());
    expect(s.input()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });
});
