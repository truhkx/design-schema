/**
 * Slider — behavior scenarios from the component doc, one test each, in the doc's order.
 * Keyboard scenarios are web/Lit only (the parser narrows them); on native the
 * adjustable accessibility actions are the non-gesture path. See generated/prompts/Slider.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Slider } from './Slider';
import type { SliderProps } from './Slider';
import meta from './Slider.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SliderProps> = {}) {
  const onValueChange = jest.fn();
  const onSlidingComplete = jest.fn();
  const props: SliderProps = { ...(meta.args as SliderProps), ...given, onValueChange, onSlidingComplete };
  const utils = render(
    <ThemeProvider mode="light">
      <Slider {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onValueChange, onSlidingComplete };
}

describe('Slider', () => {
  it('invalid-renders-the-invalid-copy', () => {
    const s = setup({ invalid: true });
    expect(screen.getByText(`${s.props.label} is not valid.`)).toBeOnTheScreen();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  /* derived: props.showValue */
  it('renders-show-value-always', () => {
    setup({ showValue: 'always' });
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  it('renders-show-value-hover', () => {
    setup({ showValue: 'hover' });
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  it('renders-show-value-never', () => {
    setup({ showValue: 'never' });
    expect(screen.getByRole('adjustable')).toBeOnTheScreen();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('adjustable', { name: s.props.label })).toBeOnTheScreen();
  });

  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
