/**
 * DatePicker — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/date-picker.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { DatePicker, type DatePickerProps } from './DatePicker';
import { Form } from './Form';
import meta from './DatePicker.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<DatePickerProps> = {}) {
  const onChange = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...given, onChange, onOpenChange } as ComponentProps<typeof DatePicker>;
  const utils = render(<DatePicker {...props} />);
  const user = userEvent.setup();
  const root = utils.container.querySelector<HTMLElement>('[data-ds="DatePicker"]');
  // The calendar is portaled, so parts are looked up in the whole document.
  const part = (name: string) => document.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
  const button = (name: string) => within(part(name)).getByRole('button');
  const input = () => screen.getByRole('textbox');
  return { ...utils, user, onChange, onOpenChange, root, part, button, input };
}

describe('DatePicker', () => {
  it('the-calendar-button-opens-the-calendar', async () => {
    const s = setup({ open: false });
    await s.user.click(s.button('calendarButton'));
    expect(s.onOpenChange).toHaveBeenCalled();
  });

  it('a-disabled-field-does-not-open-the-calendar', async () => {
    const s = setup({ open: false, disabled: true });
    await s.user.click(s.button('calendarButton'));
    expect(s.onOpenChange).not.toHaveBeenCalled();
  });

  it('choosing-a-day-reports-the-iso-date-and-closes', async () => {
    const s = setup({ open: true });
    await s.user.click(s.part('day'));
    expect(s.onChange).toHaveBeenCalled();
    expect(s.onOpenChange).toHaveBeenCalled();
  });

  it('the-today-button-selects-today', async () => {
    const s = setup({ open: true });
    await s.user.click(s.button('todayButton'));
    expect(s.onChange).toHaveBeenCalled();
  });

  it('the-clear-button-clears-the-value', async () => {
    const s = setup({ open: true, defaultValue: '2026-09-10' });
    await s.user.click(s.button('clearButton'));
    expect(s.onChange).toHaveBeenCalled();
  });

  it('arrow-down-in-the-input-opens-the-calendar', async () => {
    const s = setup({ open: false });
    act(() => s.input().focus());
    await s.user.keyboard('{ArrowDown}');
    expect(s.onOpenChange).toHaveBeenCalled();
  });

  it('the-calendar-is-a-month-grid', () => {
    setup({ open: true });
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders', () => {
    const s = setup();
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
    expect(screen.getByRole('textbox', { name: 'Due date' })).toBeInTheDocument();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.input()).toHaveAttribute('aria-invalid', 'true');
  });

  /*
   * Platform test, not a scenario: under `validate: submit` a failed submission makes the field
   * re-validate on change and blur, so a picked date clears the required error (the Form's `submitFailed`).
   */
  it('clears-its-error-once-corrected-after-a-failed-submit', async () => {
    const user = userEvent.setup();
    render(
      <Form validate="submit" errorSummary={false} actions={<button type="submit">Save</button>}>
        <DatePicker label="Due date" name="due" required />
      </Form>,
    );
    const input = screen.getByRole('textbox', { name: /Due date/ });
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    // Type a date in the input's own pattern (its placeholder: `MM/DD/YYYY`, `DD.MM.YYYY`, …).
    const typed = input
      .getAttribute('placeholder')!
      .replace(/Y+/i, '2026')
      .replace(/M+/, '09')
      .replace(/D+/i, '15');
    await user.type(input, typed);
    await user.tab();
    expect(input).not.toHaveAttribute('aria-invalid');
  });
});
