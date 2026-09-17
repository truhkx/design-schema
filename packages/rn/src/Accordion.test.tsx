/**
 * Accordion — behavior scenarios from the component doc, one test each, in the doc's order.
 * A click on a trigger is a press on the first Disclosure's `Pressable`, which natively
 * always reports reason `trigger`. Native has no heading levels, so the heading-level
 * scenarios check the header role, not a level.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Accordion } from './Accordion';
import type { AccordionProps } from './Accordion';
import meta from './Accordion.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<AccordionProps> = {}) {
  const calls: unknown[][] = [];
  const onChange = jest.fn((...args: unknown[]) => calls.push(['onChange', ...args]));
  const onOpenChange = jest.fn((...args: unknown[]) => calls.push(['onOpenChange', ...args]));
  const props: AccordionProps = { ...(meta.args as AccordionProps), ...given, onChange, onOpenChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Accordion {...props} />
    </ThemeProvider>,
  );
  const first = props.items[0]!;
  return {
    ...utils,
    props,
    calls,
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
    expect(s.calls).toEqual([
      ['onChange', [s.first.id]],
      ['onOpenChange', s.first.id, true, 'trigger'],
    ]);
    expect(s.trigger()).toBeExpanded();
  });

  it('exclusive-still-reports-both-events', () => {
    const s = setup({
      exclusive: true,
      defaultValue: 'pro',
      items: [
        { id: 'free', summary: 'Free', content: 'One project and community support.' },
        { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' },
      ],
    });
    fireEvent.press(s.trigger());
    expect(s.calls).toEqual([
      ['onChange', ['free']],
      ['onOpenChange', 'free', true, 'trigger'],
      ['onOpenChange', 'pro', false, 'exclusive'],
    ]);
    expect(s.trigger()).toBeExpanded();
    expect(screen.getByRole('button', { name: 'Pro' })).not.toBeExpanded();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Accordion')).toBeOnTheScreen();
  });

  it.each(['2', '3', '4', '5', '6'] as const)('renders-heading-level-%s', (headingLevel) => {
    const s = setup({ headingLevel });
    expect(screen.getByTestId('Accordion')).toBeOnTheScreen();
    expect(screen.getAllByRole('header')).toHaveLength(s.props.items.length);
  });
});
