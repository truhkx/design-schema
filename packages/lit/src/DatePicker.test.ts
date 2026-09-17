/**
 * <ds-date-picker> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './DatePicker.js';
import type { DatePickerChangeDetail, DatePickerOpenChangeDetail, DatePickerSize, DsDatePicker } from './DatePicker.js';
import meta from './DatePicker.stories.js';

type Given = Partial<Pick<DsDatePicker, 'open' | 'disabled' | 'defaultValue' | 'size' | 'error'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-date-picker');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<DatePickerChangeDetail>) => void>();
  const openChange = vi.fn<(event: CustomEvent<DatePickerOpenChangeDetail>) => void>();
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
    root,
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

describe('ds-date-picker', () => {
  it('the-calendar-button-opens-the-calendar', async () => {
    const s = await setup({ open: false });
    await userEvent.click(s.part('calendarButton'));
    expect(s.openChange).toHaveBeenCalled();
    expect(s.openChange.mock.calls.at(-1)?.[0].detail).toEqual({ open: true });
  });

  it('a-disabled-field-does-not-open-the-calendar', async () => {
    const s = await setup({ open: false, disabled: true });
    await userEvent.click(s.part('calendarButton'));
    expect(s.openChange).not.toHaveBeenCalled();
  });

  it('choosing-a-day-reports-the-iso-date-and-closes', async () => {
    const s = await setup({ open: true });
    await userEvent.click(s.part('day'));
    expect(s.change).toHaveBeenCalled();
    expect(s.change.mock.calls.at(-1)?.[0].detail.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.openChange).toHaveBeenCalled();
    expect(s.openChange.mock.calls.at(-1)?.[0].detail).toEqual({ open: false });
  });

  it('the-today-button-selects-today', async () => {
    const s = await setup({ open: true });
    await userEvent.click(s.part('todayButton'));
    expect(s.change).toHaveBeenCalled();
  });

  it('the-clear-button-clears-the-value', async () => {
    const s = await setup({ open: true, defaultValue: '2026-09-10' });
    await userEvent.click(s.part('clearButton'));
    expect(s.change).toHaveBeenCalled();
    expect(s.change.mock.calls.at(-1)?.[0].detail).toEqual({ value: undefined });
  });

  it('arrow-down-in-the-input-opens-the-calendar', async () => {
    const s = await setup({ open: false });
    s.input().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(s.openChange).toHaveBeenCalled();
  });

  it('the-calendar-is-a-month-grid', async () => {
    const s = await setup({ open: true });
    expect(s.root.querySelector('[role=grid]')).not.toBeNull();
    expect(s.root.querySelectorAll('[role=gridcell]').length).toBeGreaterThan(0);
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'DatePicker');
    expect(s.input()).not.toBeNull();
  });

  for (const size of ['sm', 'md'] as DatePickerSize[]) {
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

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.part('errorMessage')).toHaveTextContent('Fix this before continuing.');
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });
});
