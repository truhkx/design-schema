/**
 * Combobox — behavior scenarios from the component doc, one test each, in the doc's order.
 * The Enter/Escape key scenarios and the disabled attribute state are web/Lit only (the
 * parser narrows them). A click on a Button part (`toggleButton`, `clearButton`,
 * `chipRemove`) is a press on the Button inside that part's `Combobox.<part>` view; the
 * expanded state is the input's `accessibilityState.expanded`. Jest's default window is
 * wider than the phone breakpoint, so the anchored (non-sheet) field renders.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Combobox } from './Combobox';
import type { ComboboxProps } from './Combobox';
import meta from './Combobox.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<ComboboxProps> = {}) {
  const onChange = jest.fn();
  const onInputChange = jest.fn();
  const onOpenChange = jest.fn();
  const props: ComboboxProps = { ...(meta.args as ComboboxProps), ...given, onChange, onInputChange, onOpenChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Combobox {...props} />
    </ThemeProvider>,
  );
  const pressPart = (part: string, label: string): void => {
    fireEvent.press(within(screen.getAllByTestId(`Combobox.${part}`)[0]!).getByLabelText(label));
  };
  return {
    ...utils,
    onChange,
    onInputChange,
    onOpenChange,
    props,
    pressPart,
    input: () => screen.getByTestId('Combobox.input'),
  };
}

describe('Combobox', () => {
  it('typing-reports-the-input-text', () => {
    const s = setup({ open: false });
    fireEvent.changeText(s.input(), 'ap');
    expect(s.onInputChange).toHaveBeenCalledWith('ap');
  });

  it('the-toggle-button-opens-the-list', () => {
    const s = setup({ open: false });
    s.pressPart('toggleButton', 'Show options');
    expect(s.onOpenChange).toHaveBeenCalledWith(true);
  });

  it('a-closed-combobox-is-not-expanded', () => {
    const s = setup({ open: false });
    expect(s.input().props.accessibilityState?.expanded).toBe(false);
  });

  it('an-open-list-reports-the-expanded-state', () => {
    const s = setup({ open: true });
    expect(s.input().props.accessibilityState?.expanded).toBe(true);
  });

  it('the-clear-button-clears-the-value', () => {
    const s = setup({ open: false, defaultValue: 'apple', clearable: true });
    s.pressPart('clearButton', 'Clear');
    expect(s.onChange).toHaveBeenCalledWith('');
  });

  it('multiple-shows-the-selection-as-chips', () => {
    setup({ open: false, multiple: true, defaultValue: ['apple'] });
    expect(screen.getByText('Apple')).toBeTruthy();
  });

  it('removing-a-chip-reports-the-new-value', () => {
    const s = setup({ open: false, multiple: true, defaultValue: ['apple'] });
    s.pressPart('chipRemove', 'Remove Apple');
    expect(s.onChange).toHaveBeenCalledWith([]);
  });

  it('a-disabled-combobox-does-not-open', () => {
    const s = setup({ open: false, disabled: true });
    s.pressPart('toggleButton', 'Show options');
    expect(s.onOpenChange).not.toHaveBeenCalled();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Combobox')).toBeTruthy();
  });

  it('renders-filter-starts-with', () => {
    setup({ filter: 'startsWith' });
    expect(screen.getByTestId('Combobox')).toBeTruthy();
  });

  it('renders-filter-contains', () => {
    setup({ filter: 'contains' });
    expect(screen.getByTestId('Combobox')).toBeTruthy();
  });

  it('renders-filter-none', () => {
    setup({ filter: 'none' });
    expect(screen.getByTestId('Combobox')).toBeTruthy();
  });

  it('renders-filter-async', () => {
    setup({ filter: 'async' });
    expect(screen.getByTestId('Combobox')).toBeTruthy();
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
