/**
 * Disclosure — behavior scenarios from the component doc, one test each, in the doc's order.
 * `disabled-trigger-stays-focusable` is web/Lit only (the parser narrows it). A click on the
 * trigger is a press on the `Pressable`, which natively always reports reason `pointer`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Disclosure } from './Disclosure';
import type { DisclosureProps } from './Disclosure';
import meta from './Disclosure.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<DisclosureProps> = {}) {
  const onToggle = jest.fn();
  const props: DisclosureProps = { ...(meta.args as DisclosureProps), ...given, onToggle };
  const utils = render(
    <ThemeProvider mode="light">
      <Disclosure {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onToggle,
    props,
    trigger: () => screen.getByRole('button', { name: props.summary }),
  };
}

describe('Disclosure', () => {
  it('click-on-trigger-expands', () => {
    const s = setup();
    fireEvent.press(s.trigger());
    expect(s.onToggle).toHaveBeenCalledTimes(1);
    expect(s.onToggle).toHaveBeenCalledWith(true, 'pointer');
    expect(s.trigger()).toBeExpanded();
  });

  it('open-disclosure-collapses-on-click', () => {
    const s = setup({ defaultOpen: true });
    fireEvent.press(s.trigger());
    expect(s.onToggle).toHaveBeenCalledTimes(1);
    expect(s.onToggle).toHaveBeenCalledWith(false, 'pointer');
    expect(s.trigger()).toBeCollapsed();
  });

  it('disabled-trigger-does-not-toggle', () => {
    const s = setup({ disabled: true });
    fireEvent.press(s.trigger());
    expect(s.onToggle).not.toHaveBeenCalled();
    expect(s.trigger()).toBeCollapsed();
    expect(s.trigger()).toBeDisabled();
  });

  it('controlled-open-change-reports-controlled', () => {
    const onToggle = jest.fn();
    const props: DisclosureProps = { ...(meta.args as DisclosureProps), open: false, onToggle };
    const view = render(
      <ThemeProvider mode="light">
        <Disclosure {...props} />
      </ThemeProvider>,
    );
    expect(onToggle).not.toHaveBeenCalled();
    view.rerender(
      <ThemeProvider mode="light">
        <Disclosure {...props} open />
      </ThemeProvider>,
    );
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(true, 'controlled');
    expect(screen.getByRole('button', { name: props.summary })).toBeExpanded();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Disclosure')).toBeOnTheScreen();
  });

  // Native has no heading levels: the summary Text carries the header role, not a level.
  it.each(['2', '3', '4', '5', '6'] as const)('renders-heading-level-%s', (headingLevel) => {
    const s = setup({ headingLevel });
    expect(screen.getByTestId('Disclosure')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: s.props.summary })).toBeOnTheScreen();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('button', { name: s.props.summary })).toBeOnTheScreen();
  });
});
