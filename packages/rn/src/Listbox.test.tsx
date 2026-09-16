/**
 * Listbox — behavior scenarios from the component doc, one test each, in the doc's order.
 * The arrow/Space scenarios and the aria-* attribute scenarios are web/Lit only (the parser
 * narrows them). A click on "option" is a press on the first option. There is no listbox
 * role on native, so the list is found by its accessible label.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Listbox } from './Listbox';
import type { ListboxProps } from './Listbox';
import meta from './Listbox.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<ListboxProps> = {}) {
  const onChange = jest.fn();
  const onActiveChange = jest.fn();
  const props: ListboxProps = { ...(meta.args as ListboxProps), ...given, onChange, onActiveChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Listbox {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    onActiveChange,
    props,
    firstOption: () => screen.getAllByTestId('Listbox.option')[0]!,
  };
}

describe('Listbox', () => {
  it('click-on-an-option-selects-it', () => {
    const s = setup();
    fireEvent.press(s.firstOption());
    expect(s.onChange).toHaveBeenCalledTimes(1);
  });

  it('a-disabled-option-cannot-be-selected', () => {
    const s = setup({
      options: [
        { value: 'apple', label: 'Apple', disabled: true },
        { value: 'banana', label: 'Banana' },
      ],
    });
    fireEvent.press(s.firstOption());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('the-empty-message-shows-when-there-are-no-options', () => {
    setup({ options: [] });
    expect(screen.getByText('No options')).toBeTruthy();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ options: [], emptyMessage: 'No fruit matches that.' });
    expect(screen.getByText('No fruit matches that.')).toBeTruthy();
  });

  it('loading-replaces-the-empty-message', () => {
    setup({ options: [], loading: true });
    expect(screen.getByText('Loading…')).toBeTruthy();
    expect(screen.queryByText('No options')).toBeNull();
  });

  it('invalid-renders-the-invalid-copy', () => {
    const s = setup({ invalid: true });
    expect(screen.getByText(`${s.props.label} is not valid.`)).toBeTruthy();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Listbox')).toBeTruthy();
  });

  it('renders-max-visible-5', () => {
    setup({ maxVisible: '5' });
    expect(screen.getByTestId('Listbox')).toBeTruthy();
  });

  it('renders-max-visible-8', () => {
    setup({ maxVisible: '8' });
    expect(screen.getByTestId('Listbox')).toBeTruthy();
  });

  it('renders-max-visible-12', () => {
    setup({ maxVisible: '12' });
    expect(screen.getByTestId('Listbox')).toBeTruthy();
  });

  it('renders-max-visible-all', () => {
    setup({ maxVisible: 'all' });
    expect(screen.getByTestId('Listbox')).toBeTruthy();
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
