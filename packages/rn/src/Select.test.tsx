/**
 * Select — behavior scenarios from the component doc, one test each, in the doc's order.
 * The Enter/Escape key scenarios and the disabled/invalid attribute states are web/Lit only
 * (the parser narrows them). A click on "trigger" is a press on `Select.trigger`; the
 * expanded state is the trigger's `accessibilityState.expanded`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Select } from './Select';
import type { SelectProps } from './Select';
import meta from './Select.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SelectProps> = {}) {
  const onChange = jest.fn();
  const onOpenChange = jest.fn();
  const props: SelectProps = { ...(meta.args as SelectProps), ...given, onChange, onOpenChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Select {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    onOpenChange,
    props,
    trigger: () => screen.getByTestId('Select.trigger'),
  };
}

describe('Select', () => {
  it('the-trigger-opens-the-popup', () => {
    const s = setup({ open: false });
    fireEvent.press(s.trigger());
    expect(s.onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('a-closed-select-is-not-expanded', () => {
    const s = setup({ open: false });
    expect(s.trigger().props.accessibilityState?.expanded).toBe(false);
  });

  it('an-open-select-reports-the-expanded-state', () => {
    const s = setup({ open: true });
    expect(s.trigger().props.accessibilityState?.expanded).toBe(true);
  });

  it('the-placeholder-shows-when-nothing-is-selected', () => {
    setup({ open: false });
    expect(screen.getByText('Select…')).toBeTruthy();
  });

  it('a-custom-placeholder-replaces-the-default', () => {
    setup({ open: false, placeholder: 'Choose a country' });
    expect(screen.getByText('Choose a country')).toBeTruthy();
  });

  it('a-disabled-select-does-not-open', () => {
    const s = setup({ open: false, disabled: true });
    fireEvent.press(s.trigger());
    expect(s.onOpenChange).not.toHaveBeenCalled();
  });

  it('required-is-shown-in-the-label', () => {
    setup({ required: true });
    expect(screen.getByText(' (required)', { exact: false })).toBeTruthy();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('renders-size-sm', () => {
    setup({ size: 'sm' });
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('renders-size-md', () => {
    setup({ size: 'md' });
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('renders-native-auto', () => {
    setup({ native: 'auto' });
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('renders-native-always', () => {
    setup({ native: 'always' });
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('renders-native-never', () => {
    setup({ native: 'never' });
    expect(screen.getByTestId('Select')).toBeTruthy();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByLabelText(s.props.label)).toBeTruthy();
  });

  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeTruthy();
  });
});
