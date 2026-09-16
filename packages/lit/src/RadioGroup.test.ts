/**
 * <ds-radio-group> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './RadioGroup.js';
import type { DsRadioGroup, RadioGroupChangeDetail } from './RadioGroup.js';
import meta from './RadioGroup.stories.js';

type Given = Partial<
  Pick<DsRadioGroup, 'label' | 'name' | 'options' | 'defaultValue' | 'orientation' | 'required' | 'invalid' | 'disabled' | 'description' | 'error'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-radio-group');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<RadioGroupChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    group: () => root.querySelector<HTMLFieldSetElement>('[data-part=group]')!,
    legend: () => root.querySelector<HTMLLegendElement>('[data-part=legend]')!,
    radio: () => root.querySelector<HTMLInputElement>('[data-part=radio]')!,
    radioLabel: () => root.querySelector<HTMLLabelElement>('[data-part=radioLabel]')!,
    detail: () => change.mock.calls[0]?.[0].detail.value,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-radio-group', () => {
  it('click-on-an-option-reports-its-value', async () => {
    const s = await setup();
    await userEvent.click(s.radio());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe('standard');
  });

  it('click-on-an-option-label-selects-it', async () => {
    const s = await setup();
    await userEvent.click(s.radioLabel());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe('standard');
  });

  it('disabled-option-cannot-be-selected', async () => {
    const s = await setup({
      options: [
        { value: 'standard', label: 'Standard', disabled: true },
        { value: 'express', label: 'Express' },
      ],
    });
    // Playwright will not click a disabled control on its own; a person can try.
    await userEvent.click(s.radio(), { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.radio().checked).toBe(false);
  });

  it('disabled-group-is-inert', async () => {
    const s = await setup({ disabled: true });
    await userEvent.click(s.radio(), { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.radio().checked).toBe(false);
    expect(s.el).toHaveAttribute('disabled');
    expect(s.group()).toHaveAttribute('aria-disabled', 'true');
  });

  it('required-is-shown-in-the-legend', async () => {
    const s = await setup({ required: true });
    expect(s.legend().textContent).toContain(' (required)');
  });

  it('invalid-renders-the-invalid-copy', async () => {
    const s = await setup({ invalid: true });
    expect(s.el.shadowRoot!.textContent).toContain('Shipping method is not valid.');
    expect(s.el.invalid).toBe(true);
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.group()).not.toBeNull();
  });

  it('renders-orientation-vertical', async () => {
    const s = await setup({ orientation: 'vertical' });
    expect(s.group()).not.toBeNull();
  });

  it('renders-orientation-horizontal', async () => {
    const s = await setup({ orientation: 'horizontal' });
    expect(s.group()).not.toBeNull();
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.el.shadowRoot!.textContent).toContain('Fix this before continuing.');
    expect(s.el.invalid).toBe(true);
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });
});
