/**
 * Splitter — behavior scenarios from the component doc, one test each, in the doc's order.
 * Keyboard scenarios are web/Lit only (the parser narrows them); on native the
 * adjustable accessibility actions are the non-gesture path.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Splitter } from './Splitter';
import type { SplitterProps } from './Splitter';
import meta from './Splitter.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SplitterProps> = {}) {
  const onSizeChange = jest.fn();
  const onSizeChangeEnd = jest.fn();
  const onCollapseChange = jest.fn();
  const props: SplitterProps = {
    ...(meta.args as SplitterProps),
    ...given,
    onSizeChange,
    onSizeChangeEnd,
    onCollapseChange,
  };
  const utils = render(
    <ThemeProvider mode="light">
      <Splitter {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onSizeChange, onSizeChangeEnd, onCollapseChange };
}

describe('Splitter', () => {
  it('the-collapse-button-collapses-the-pane', () => {
    const s = setup({ collapsible: true, defaultSize: 40, stackBelow: 'never' });
    fireEvent.press(screen.getByRole('button', { name: `Collapse ${s.props.label}` }));
    expect(s.onCollapseChange).toHaveBeenCalled();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    setup({ orientation: 'horizontal' });
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  it('renders-orientation-vertical', () => {
    setup({ orientation: 'vertical' });
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  /* derived: props.stackBelow */
  it('renders-stack-below-prose', () => {
    setup({ stackBelow: 'prose' });
    expect(screen.getByTestId('Splitter')).toBeOnTheScreen();
  });

  it('renders-stack-below-content', () => {
    setup({ stackBelow: 'content' });
    expect(screen.getByTestId('Splitter')).toBeOnTheScreen();
  });

  it('renders-stack-below-never', () => {
    setup({ stackBelow: 'never' });
    expect(screen.getByTestId('Splitter')).toBeOnTheScreen();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('adjustable', { name: s.props.label })).toBeOnTheScreen();
  });
});
