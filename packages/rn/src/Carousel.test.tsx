/**
 * Carousel — behavior scenarios from the component doc, one test each, in the doc's order.
 * `the-region-is-announced-as-a-carousel` is web-only (the parser narrows it). A click on
 * "pickerItem" is a press on the first picker item.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Carousel } from './Carousel';
import type { CarouselProps } from './Carousel';
import meta from './Carousel.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<CarouselProps> = {}) {
  const onChange = jest.fn();
  const props: CarouselProps = { ...(meta.args as CarouselProps), ...given, onChange };
  const utils = render(
    <ThemeProvider mode="light">
      <Carousel {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    props,
    prevButton: () => screen.getByLabelText('Previous slide'),
    nextButton: () => screen.getByLabelText('Next slide'),
    firstPickerItem: () => screen.getAllByTestId('Carousel.pickerItem')[0]!,
  };
}

describe('Carousel', () => {
  it('next-advances-a-slide', () => {
    const s = setup();
    fireEvent.press(s.nextButton());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(1, 'next');
  });

  it('previous-at-the-first-slide-does-nothing', () => {
    const s = setup();
    fireEvent.press(s.prevButton());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('loop-wraps-backwards-from-the-first-slide', () => {
    const s = setup({ loop: true });
    fireEvent.press(s.prevButton());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(3, 'prev');
  });

  it('the-picker-jumps-straight-to-a-slide', () => {
    const s = setup({ activeIndex: 1, picker: 'dots' });
    fireEvent.press(s.firstPickerItem());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(0, 'picker');
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Carousel')).toBeOnTheScreen();
  });

  it.each(['dots', 'tabs', 'none'] as const)('renders-picker-%s', (picker) => {
    setup({ picker });
    expect(screen.getByTestId('Carousel')).toBeOnTheScreen();
  });

  it('has-accessible-name', () => {
    const s = setup();
    // The region is deliberately not `accessible` (its controls must stay reachable), so
    // getByRole cannot match it; assert the role and name on the root itself.
    const region = screen.getByTestId('Carousel');
    expect(region).toHaveProp('role', 'region');
    expect(region).toHaveAccessibleName(s.props.label);
  });
});
