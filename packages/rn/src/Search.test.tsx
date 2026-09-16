/**
 * Search — behavior scenarios from the component doc, one test each, in the doc's order.
 * The Enter and Escape key scenarios are web/Lit only (the parser narrows them). A click on
 * a Button part (`clearButton`, `submitButton`) is a press on the Button inside that part's
 * `Search.<part>` view.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Search } from './Search';
import type { SearchProps } from './Search';
import meta from './Search.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SearchProps> = {}) {
  const onChangeText = jest.fn();
  const onSubmitEditing = jest.fn();
  const onClear = jest.fn();
  const props: SearchProps = { ...(meta.args as SearchProps), ...given, onChangeText, onSubmitEditing, onClear };
  const utils = render(
    <ThemeProvider mode="light">
      <Search {...props} />
    </ThemeProvider>,
  );
  const pressPart = (part: string, label: string): void => {
    fireEvent.press(within(screen.getByTestId(`Search.${part}`)).getByLabelText(label));
  };
  return {
    ...utils,
    onChangeText,
    onSubmitEditing,
    onClear,
    props,
    pressPart,
    root: () => screen.getByTestId('Search'),
    input: () => screen.getByTestId('Search.input'),
  };
}

describe('Search', () => {
  it('typing-fires-onchange-with-the-query', () => {
    const s = setup();
    fireEvent.changeText(s.input(), 'invoices');
    expect(s.onChangeText).toHaveBeenCalledWith('invoices');
  });

  it('the-submit-button-submits-the-query', () => {
    // `action` has no native meaning and warns in development.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const s = setup({ defaultValue: 'invoices', action: '/search' });
    s.pressPart('submitButton', 'Search');
    expect(s.onSubmitEditing).toHaveBeenCalledWith('invoices');
    warn.mockRestore();
  });

  it('the-clear-button-empties-the-field', () => {
    const s = setup({ defaultValue: 'invoices' });
    s.pressPart('clearButton', 'Clear search');
    expect(s.onClear).toHaveBeenCalledTimes(1);
    expect(s.input().props.value).toBe('');
  });

  it('the-field-is-inside-the-search-landmark', () => {
    const s = setup();
    expect(s.root().props.accessibilityRole).toBe('search');
    expect(within(s.root()).getByTestId('Search.input')).toBeOnTheScreen();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeOnTheScreen();
  });

  /* derived: props.size */
  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.root()).toBeOnTheScreen();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.root()).toBeOnTheScreen();
  });

  /* derived */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.input()).toHaveAccessibleName(s.props.label);
  });
});
