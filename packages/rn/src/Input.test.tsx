/**
 * Input — behavior scenarios from the component doc, one test each, in the doc's order.
 * On native a keystroke is `fireEvent.changeText` and focus is `fireEvent(field, 'focus')`;
 * the aria-required and role=alert expectations are web/Lit only (the parser narrows them).
 * See generated/prompts/Input.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Input } from './Input';
import type { InputProps } from './Input';
import meta, { Default } from './Input.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<InputProps> = {}) {
  const onChange = jest.fn();
  const onFocus = jest.fn();
  const onBlur = jest.fn();
  const props: InputProps = { ...(meta.args as InputProps), ...(Default.args as Partial<InputProps>), ...given, onChange, onFocus, onBlur };
  const utils = render(
    <ThemeProvider mode="light">
      <Input {...props} />
    </ThemeProvider>,
  );
  return { ...utils, onChange, onFocus, onBlur, props, field: () => screen.getByTestId('Input.field') };
}

describe('Input', () => {
  it('typing-reports-the-new-value', () => {
    const s = setup();
    fireEvent.changeText(s.field(), 'a');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('a');
  });

  it('focus-is-reported', () => {
    const s = setup();
    fireEvent(s.field(), 'focus', { nativeEvent: {} });
    expect(s.onFocus).toHaveBeenCalledTimes(1);
  });

  it('required-is-shown-in-the-label', () => {
    const s = setup({ required: true });
    expect(screen.getByText(`${s.props.label} (required)`)).toBeOnTheScreen();
  });

  it('disabled-stays-focusable-and-is-announced', () => {
    const s = setup({ disabled: true });
    expect(s.field().props.accessibilityState).toEqual({ disabled: true });
    expect(s.field()).toBeDisabled();
  });

  /* derived: true */
  it('renders', () => {
    const s = setup();
    expect(s.field()).toBeOnTheScreen();
  });

  /* derived: props.type */
  it('renders-type-text', () => {
    const s = setup({ type: 'text' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-email', () => {
    const s = setup({ type: 'email' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-password', () => {
    const s = setup({ type: 'password' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-number', () => {
    const s = setup({ type: 'number' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-search', () => {
    const s = setup({ type: 'search' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-tel', () => {
    const s = setup({ type: 'tel' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-type-url', () => {
    const s = setup({ type: 'url' });
    expect(s.field()).toBeOnTheScreen();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.field()).toBeOnTheScreen();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.field()).toBeOnTheScreen();
  });

  /* derived: error-identification */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
