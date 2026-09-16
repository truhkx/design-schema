/**
 * <ds-number-input> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './NumberInput.js';
import type { DsNumberInput, NumberInputChangeDetail } from './NumberInput.js';
import meta from './NumberInput.stories.js';

type Given = Partial<
  Pick<
    DsNumberInput,
    'defaultValue' | 'step' | 'min' | 'max' | 'hideSteppers' | 'disabled' | 'format' | 'size' | 'error'
  >
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-number-input');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<NumberInputChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    props,
    input: () => root.querySelector<HTMLInputElement>('[role=spinbutton]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`),
    detail: () => change.mock.calls.at(-1)?.[0].detail.value,
  };
}

async function press(key: string) {
  await userEvent.keyboard(`{${key}}`);
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-number-input', () => {
  it('the-increment-button-steps-up', async () => {
    const s = await setup({ defaultValue: 5, step: 1 });
    await userEvent.click(s.part('incrementButton')!);
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(6);
  });

  it('the-decrement-button-steps-down', async () => {
    const s = await setup({ defaultValue: 5, step: 1 });
    await userEvent.click(s.part('decrementButton')!);
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(4);
  });

  it('arrow-up-increases-by-one-step', async () => {
    const s = await setup({ defaultValue: 5 });
    s.el.focus();
    await press('ArrowUp');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(6);
  });

  it('arrow-down-decreases-by-one-step', async () => {
    const s = await setup({ defaultValue: 5 });
    s.el.focus();
    await press('ArrowDown');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(4);
  });

  it('page-up-changes-by-ten-steps', async () => {
    const s = await setup({ defaultValue: 5 });
    s.el.focus();
    await press('PageUp');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(15);
  });

  it('arrow-keys-work-without-the-steppers', async () => {
    const s = await setup({ defaultValue: 5, hideSteppers: true });
    expect(s.part('incrementButton')).toBeNull();
    s.el.focus();
    await press('ArrowUp');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(6);
  });

  it('typing-a-number-reports-it', async () => {
    const s = await setup();
    s.el.focus();
    await userEvent.keyboard('7');
    expect(s.change).toHaveBeenCalled();
    expect(s.detail()).toBe(7);
  });

  it('decrement-does-nothing-at-the-minimum', async () => {
    const s = await setup({ defaultValue: 0, min: 0, max: 10 });
    await userEvent.click(s.part('decrementButton')!, { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.input()).toHaveAttribute('aria-valuenow', '0');
  });

  it('a-disabled-field-does-not-step', async () => {
    const s = await setup({ disabled: true, defaultValue: 5 });
    await userEvent.click(s.part('incrementButton')!, { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.input()).toHaveAttribute('aria-valuenow', '5');
  });

  it('renders', async () => {
    const s = await setup();
    expect(s.part('field')).toBeTruthy();
    expect(s.input()).toBeVisible();
  });

  it('renders-format-decimal', async () => {
    const s = await setup({ format: 'decimal' });
    expect(s.input()).toBeVisible();
  });

  it('renders-format-currency', async () => {
    const s = await setup({ format: 'currency' });
    expect(s.input()).toBeVisible();
  });

  it('renders-format-percent', async () => {
    const s = await setup({ format: 'percent' });
    expect(s.input()).toBeVisible();
  });

  it('renders-format-unit', async () => {
    const s = await setup({ format: 'unit' });
    expect(s.input()).toBeVisible();
  });

  it('renders-size-sm', async () => {
    const s = await setup({ size: 'sm' });
    expect(s.el).toHaveAttribute('size', 'sm');
    expect(s.input()).toBeVisible();
  });

  it('renders-size-md', async () => {
    const s = await setup({ size: 'md' });
    expect(s.el).toHaveAttribute('size', 'md');
    expect(s.input()).toBeVisible();
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.input()).toHaveAccessibleName(s.props.label);
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(s.el.shadowRoot!.activeElement).toBe(s.input());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.part('errorMessage')).toHaveTextContent('Fix this before continuing.');
    expect(s.el.invalid).toBe(true);
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });
});
