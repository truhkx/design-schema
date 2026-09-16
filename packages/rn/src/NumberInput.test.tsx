/**
 * NumberInput — behavior scenarios from the component doc, one test each, in the doc's order.
 * `onChange` is emitted as `onChangeText`; a click is `fireEvent.press` on the stepper's
 * Button, found with `includeHiddenElements` because the steppers are hidden from assistive
 * technology (the adjustable actions cover them). Arrow-key and aria-value* scenarios are
 * web/Lit only (the parser narrows them). See generated/prompts/NumberInput.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { NumberInput } from './NumberInput';
import type { NumberInputProps } from './NumberInput';
import meta, { Default } from './NumberInput.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<NumberInputProps> = {}) {
  const onChangeText = jest.fn();
  const props: NumberInputProps = { ...(meta.args as NumberInputProps), ...(Default.args as Partial<NumberInputProps>), ...given, onChangeText };
  const utils = render(
    <ThemeProvider mode="light">
      <NumberInput {...props} />
    </ThemeProvider>,
  );
  const part = (name: string) => screen.getByTestId(`NumberInput.${name}`, { includeHiddenElements: true });
  const button = (name: 'incrementButton' | 'decrementButton') => within(part(name)).getByTestId('Button', { includeHiddenElements: true });
  return { ...utils, onChangeText, props, input: () => part('input'), button };
}

describe('NumberInput', () => {
  it('the-increment-button-steps-up', () => {
    const s = setup({ defaultValue: 5, step: 1 });
    fireEvent.press(s.button('incrementButton'));
    expect(s.onChangeText).toHaveBeenCalledTimes(1);
    expect(s.onChangeText).toHaveBeenCalledWith(6);
  });

  it('the-decrement-button-steps-down', () => {
    const s = setup({ defaultValue: 5, step: 1 });
    fireEvent.press(s.button('decrementButton'));
    expect(s.onChangeText).toHaveBeenCalledTimes(1);
    expect(s.onChangeText).toHaveBeenCalledWith(4);
  });

  it('typing-a-number-reports-it', () => {
    const s = setup();
    fireEvent.changeText(s.input(), '7');
    expect(s.onChangeText).toHaveBeenCalledTimes(1);
    expect(s.onChangeText).toHaveBeenCalledWith(7);
  });

  it('decrement-does-nothing-at-the-minimum', () => {
    const s = setup({ defaultValue: 0, min: 0, max: 10 });
    fireEvent.press(s.button('decrementButton'));
    expect(s.onChangeText).not.toHaveBeenCalled();
  });

  it('a-disabled-field-does-not-step', () => {
    const s = setup({ disabled: true, defaultValue: 5 });
    fireEvent.press(s.button('incrementButton'));
    expect(s.onChangeText).not.toHaveBeenCalled();
  });

  /* derived: true */
  it('renders', () => {
    const s = setup();
    expect(s.input()).toBeOnTheScreen();
  });

  /* derived: props.format */
  it('renders-format-decimal', () => {
    const s = setup({ format: 'decimal' });
    expect(s.input()).toBeOnTheScreen();
  });

  it('renders-format-currency', () => {
    // Without `currency` the doc asks for a development warning (and a USD fallback).
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const s = setup({ format: 'currency' });
    expect(s.input()).toBeOnTheScreen();
    warn.mockRestore();
  });

  it('renders-format-percent', () => {
    const s = setup({ format: 'percent' });
    expect(s.input()).toBeOnTheScreen();
  });

  it('renders-format-unit', () => {
    const s = setup({ format: 'unit' });
    expect(s.input()).toBeOnTheScreen();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.input()).toBeOnTheScreen();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.input()).toBeOnTheScreen();
  });

  /* derived: accessible-name */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.input().props.accessibilityLabel).toBe(s.props.label);
  });

  /* derived: error-identification */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
