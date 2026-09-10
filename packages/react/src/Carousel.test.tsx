/**
 * Carousel — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Carousel, type CarouselProps } from './Carousel';
import meta from './Carousel.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<CarouselProps> = {}) {
  const props = { ...meta.args, ...given } as CarouselProps;
  const utils = render(<Carousel {...props} />);
  return { ...utils, props, region: () => screen.getByRole('region') };
}

describe('Carousel', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.region()).toBeInTheDocument();
  });

  /* derived: props.picker */
  it('renders-picker-dots', () => {
    const s = setup({ picker: 'dots' });
    expect(s.region()).toBeInTheDocument();
  });

  it('renders-picker-tabs', () => {
    const s = setup({ picker: 'tabs' });
    expect(s.region()).toBeInTheDocument();
  });

  it('renders-picker-none', () => {
    const s = setup({ picker: 'none' });
    expect(s.region()).toBeInTheDocument();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('region', { name: s.props.label })).toHaveAccessibleName();
  });
});
