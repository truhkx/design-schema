/**
 * RadioGroup — behavior scenarios from the component doc, one test each, in the doc's order.
 * A click is a `press`, which bubbles from any part of the option row to its Pressable;
 * `radio` is the first option row, `radioLabel` its label text.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RadioGroup } from './RadioGroup';
import type { RadioGroupProps } from './RadioGroup';
import meta from './RadioGroup.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<RadioGroupProps> = {}) {
  const onChange = jest.fn();
  const props: RadioGroupProps = { ...(meta.args as RadioGroupProps), ...given, onChange };
  const utils = render(
    <ThemeProvider mode="light">
      <RadioGroup {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    props,
    radio: () => screen.getAllByRole('radio')[0]!,
    radioLabel: () => screen.getByText(props.options[0]!.label),
  };
}

describe('RadioGroup', () => {
  it('click-on-an-option-reports-its-value', () => {
    const s = setup();
    fireEvent.press(s.radio());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('standard');
    expect(s.radio()).toBeChecked();
  });

  it('click-on-an-option-label-selects-it', () => {
    const s = setup();
    fireEvent.press(s.radioLabel());
    expect(s.onChange).toHaveBeenCalledWith('standard');
    expect(s.radio()).toBeChecked();
  });

  it('disabled-option-cannot-be-selected', () => {
    const s = setup({
      options: [
        { value: 'standard', label: 'Standard', disabled: true },
        { value: 'express', label: 'Express' },
      ],
    });
    fireEvent.press(s.radio());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.radio()).not.toBeChecked();
  });

  it('disabled-group-is-inert', () => {
    const s = setup({ disabled: true });
    fireEvent.press(s.radio());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.radio()).not.toBeChecked();
  });

  it('required-is-shown-in-the-legend', () => {
    const s = setup({ required: true });
    expect(screen.getByText(`${s.props.label} (required)`)).toBeOnTheScreen();
  });

  it('invalid-renders-the-invalid-copy', () => {
    const s = setup({ invalid: true });
    expect(screen.getByText(`${s.props.label} is not valid.`)).toBeOnTheScreen();
  });

  /* derived */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('RadioGroup')).toBeOnTheScreen();
  });

  /* derived */
  it('renders-orientation-vertical', () => {
    setup({ orientation: 'vertical' });
    expect(screen.getByTestId('RadioGroup')).toBeOnTheScreen();
  });

  /* derived */
  it('renders-orientation-horizontal', () => {
    setup({ orientation: 'horizontal' });
    expect(screen.getByTestId('RadioGroup')).toBeOnTheScreen();
  });

  /* derived */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
