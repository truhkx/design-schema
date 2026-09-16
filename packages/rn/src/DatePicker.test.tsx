/**
 * DatePicker — behavior scenarios from the component doc, one test each, in the doc's order.
 * The ArrowDown-in-the-input and month-grid-role scenarios are web/Lit only (the parser
 * narrows them). Buttons take no testID, so a click on `calendarButton`, `todayButton` or
 * `clearButton` presses the Button by its copy label; a click on `day` presses a
 * mid-month `DatePicker.day`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DatePicker } from './DatePicker';
import type { DatePickerProps } from './DatePicker';
import meta from './DatePicker.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<DatePickerProps> = {}) {
  const onChange = jest.fn();
  const onOpenChange = jest.fn();
  const props: DatePickerProps = { ...(meta.args as DatePickerProps), ...given, onChange, onOpenChange };
  const utils = render(
    <ThemeProvider mode="light">
      <DatePicker {...props} />
    </ThemeProvider>,
  );
  return { ...utils, onChange, onOpenChange, props };
}

describe('DatePicker', () => {
  it('the-calendar-button-opens-the-calendar', () => {
    const s = setup({ open: false });
    fireEvent.press(screen.getByLabelText('Choose date'));
    expect(s.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('a-disabled-field-does-not-open-the-calendar', () => {
    const s = setup({ open: false, disabled: true });
    fireEvent.press(screen.getByLabelText('Choose date'));
    expect(s.onOpenChange).not.toHaveBeenCalled();
  });

  it('choosing-a-day-reports-the-iso-date-and-closes', () => {
    const s = setup({ open: true });
    // Row 3 of 6 is always inside the displayed month.
    const day = screen.getAllByTestId('DatePicker.day')[17]!;
    fireEvent.press(day);
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange.mock.calls[0]![0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(s.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('the-today-button-selects-today', () => {
    const s = setup({ open: true });
    fireEvent.press(screen.getByLabelText('Today'));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange.mock.calls[0]![0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('the-clear-button-clears-the-value', () => {
    const s = setup({ open: true, defaultValue: '2026-09-10' });
    fireEvent.press(screen.getByLabelText('Clear'));
    expect(s.onChange).toHaveBeenCalledWith(undefined);
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('DatePicker')).toBeTruthy();
  });

  it('renders-size-sm', () => {
    setup({ size: 'sm' });
    expect(screen.getByTestId('DatePicker')).toBeTruthy();
  });

  it('renders-size-md', () => {
    setup({ size: 'md' });
    expect(screen.getByTestId('DatePicker')).toBeTruthy();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByTestId('DatePicker.input').props.accessibilityLabel).toBe(s.props.label);
  });

  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeTruthy();
  });
});
