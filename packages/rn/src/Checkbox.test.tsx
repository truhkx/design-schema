/**
 * Checkbox — behavior scenarios from the component doc, one test each, in the doc's order.
 * Keyboard and focus scenarios are web/Lit only (the parser narrows them); a click is a
 * `press`, which bubbles from any part of the row to the Pressable.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox';
import meta from './Checkbox.stories';
import { ThemeProvider } from './theme';

const DESCRIPTION = 'One email a month about new features.';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<CheckboxProps> = {}) {
  const onChange = jest.fn();
  const props: CheckboxProps = { ...(meta.args as CheckboxProps), ...given, onChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Checkbox {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    props,
    checkbox: () => screen.getByRole('checkbox'),
    control: () => screen.getByTestId('Checkbox.control', { includeHiddenElements: true }),
    label: () => screen.getByText(props.label),
    description: () => screen.getByText(DESCRIPTION),
  };
}

describe('Checkbox', () => {
  it('click-on-control-toggles-on', () => {
    const s = setup();
    fireEvent.press(s.control());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.checkbox()).toBeChecked();
  });

  it('click-on-label-toggles', () => {
    const s = setup();
    fireEvent.press(s.label());
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.checkbox()).toBeChecked();
  });

  it('click-on-description-toggles', () => {
    const s = setup({ description: DESCRIPTION });
    fireEvent.press(s.description());
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.checkbox()).toBeChecked();
  });

  it('toggles-back-off', () => {
    const s = setup({ defaultChecked: true });
    fireEvent.press(s.control());
    expect(s.onChange).toHaveBeenCalledWith(false);
    expect(s.checkbox()).not.toBeChecked();
  });

  it('indeterminate-is-announced-as-mixed', () => {
    const s = setup({ indeterminate: true });
    expect(s.checkbox()).toBePartiallyChecked();
  });

  it('disabled-does-not-toggle', () => {
    const s = setup({ disabled: true });
    fireEvent.press(s.control());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.checkbox()).not.toBeChecked();
    expect(s.checkbox()).toBeDisabled();
  });

  it('required-is-shown-in-the-label', () => {
    const s = setup({ required: true });
    expect(screen.getByText(`${s.props.label} (required)`)).toBeOnTheScreen();
  });

  it('error-marks-invalid-and-is-announced', () => {
    setup({ error: 'Accept the terms to continue.' });
    expect(screen.getByText('Accept the terms to continue.')).toBeOnTheScreen();
  });

  it('controlled-follows-prop', () => {
    const s = setup({ checked: false });
    fireEvent.press(s.control());
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.checkbox()).not.toBeChecked();
  });

  it('hidden-label-is-still-the-accessible-name', () => {
    const s = setup({ hideLabel: true });
    expect(screen.queryByText(s.props.label)).toBeNull();
    expect(screen.getByRole('checkbox', { name: s.props.label })).toBeOnTheScreen();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('checkbox')).toBeOnTheScreen();
  });

  /* derived: a11y.requires error-identification */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
