/**
 * Accordion — behavior scenarios from the component doc, one test each, in the doc's order.
 * A click on a trigger is a press on the first Disclosure's `Pressable`, which natively
 * always reports reason `trigger`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Accordion } from './Accordion';
import type { AccordionProps } from './Accordion';
import meta from './Accordion.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<AccordionProps> = {}) {
  const onChange = jest.fn();
  const onOpenChange = jest.fn();
  const props: AccordionProps = { ...(meta.args as AccordionProps), ...given, onChange, onOpenChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Accordion {...props} />
    </ThemeProvider>,
  );
  const first = props.items[0]!;
  return {
    ...utils,
    onChange,
    onOpenChange,
    first,
    trigger: () => screen.getByRole('button', { name: first.summary }),
  };
}

describe('Accordion', () => {
  it('click-on-a-trigger-reports-the-open-set', () => {
    const s = setup();
    fireEvent.press(s.trigger());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith([s.first.id]);
    expect(s.onOpenChange).toHaveBeenCalledTimes(1);
    expect(s.onOpenChange).toHaveBeenCalledWith(s.first.id, true, 'trigger');
    expect(s.trigger()).toBeExpanded();
  });

  it('exclusive-still-reports-both-events', () => {
    const s = setup({ exclusive: true });
    fireEvent.press(s.trigger());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith([s.first.id]);
    expect(s.onOpenChange).toHaveBeenCalledWith(s.first.id, true, 'trigger');
    expect(s.trigger()).toBeExpanded();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Accordion')).toBeOnTheScreen();
  });

  it.each(['2', '3', '4', '5', '6'] as const)('renders-heading-level-%s', (headingLevel) => {
    setup({ headingLevel });
    expect(screen.getByTestId('Accordion')).toBeOnTheScreen();
  });
});
