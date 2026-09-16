/**
 * <ds-select> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Select.js';
import type { DsSelect, SelectChangeDetail, SelectNative, SelectOpenChangeDetail, SelectSize } from './Select.js';
import meta from './Select.stories.js';

type Given = Partial<Pick<DsSelect, 'open' | 'placeholder' | 'disabled' | 'required' | 'invalid' | 'size' | 'native' | 'error'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-select');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<SelectChangeDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<SelectOpenChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('open-change', openChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    openChange,
    props,
    trigger: () => root.querySelector<HTMLElement>('[data-part=trigger]')!,
    label: () => root.querySelector<HTMLElement>('[data-part=label]')!,
    text: () => root.textContent ?? '',
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-select', () => {
  it('the-trigger-opens-the-popup', async () => {
    const s = await setup({ open: false });
    await userEvent.click(s.trigger());
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ open: true });
  });

  it('a-closed-select-is-not-expanded', async () => {
    const s = await setup({ open: false });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-open-select-reports-the-expanded-state', async () => {
    const s = await setup({ open: true });
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('enter-commits-the-active-option-and-closes', async () => {
    const s = await setup({ open: true });
    s.trigger().focus();
    await userEvent.keyboard('{Enter}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'ca' });
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ open: false });
  });

  it('escape-closes-without-changing-the-value', async () => {
    const s = await setup({ open: true });
    s.trigger().focus();
    await userEvent.keyboard('{Escape}');
    await s.el.updateComplete;
    expect(s.openChange).toHaveBeenCalledTimes(1);
    expect(s.openChange.mock.calls[0]?.[0].detail).toEqual({ open: false });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.el.shadowRoot!.activeElement).toBe(s.trigger());
  });

  it('the-placeholder-shows-when-nothing-is-selected', async () => {
    const s = await setup({ open: false });
    expect(s.trigger()).toHaveTextContent('Select…');
  });

  it('a-custom-placeholder-replaces-the-default', async () => {
    const s = await setup({ open: false, placeholder: 'Choose a country' });
    expect(s.text()).toContain('Choose a country');
  });

  it('a-disabled-select-does-not-open', async () => {
    const s = await setup({ open: false, disabled: true });
    // Playwright will not click an aria-disabled control on its own; a person can.
    await userEvent.click(s.trigger(), { force: true });
    expect(s.openChange).not.toHaveBeenCalled();
    expect(s.el).toHaveAttribute('disabled');
    expect(s.trigger()).toHaveAttribute('aria-disabled', 'true');
  });

  it('required-is-shown-in-the-label', async () => {
    const s = await setup({ required: true });
    expect(s.label().textContent).toContain(' (required)');
  });

  it('invalid-is-reported-on-the-trigger', async () => {
    const s = await setup({ invalid: true });
    expect(s.el).toHaveAttribute('invalid');
    expect(s.trigger()).toHaveAttribute('aria-invalid', 'true');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.trigger()).not.toBeNull();
  });

  for (const size of ['sm', 'md'] as SelectSize[]) {
    it(`renders-size-${size}`, async () => {
      const s = await setup({ size });
      expect(s.trigger()).not.toBeNull();
      expect(s.el).toHaveAttribute('size', size);
    });
  }

  for (const native of ['auto', 'always', 'never'] as SelectNative[]) {
    it(`renders-native-${native}`, async () => {
      const s = await setup({ native });
      expect(s.trigger()).not.toBeNull();
      expect(s.el).toHaveAttribute('native', native);
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.trigger()).toHaveAccessibleName(expect.stringContaining(s.props.label!));
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(s.el.shadowRoot!.activeElement).toBe(s.trigger());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.text()).toContain('Fix this before continuing.');
    expect(s.el).toHaveAttribute('invalid');
    expect(s.trigger()).toHaveAttribute('aria-invalid', 'true');
  });
});
