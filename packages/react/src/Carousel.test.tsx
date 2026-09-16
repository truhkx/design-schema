/**
 * Carousel — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/carousel.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Carousel, type CarouselProps } from './Carousel';
import meta from './Carousel.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<CarouselProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as CarouselProps;
  const utils = render(<Carousel {...props} />);
  const user = userEvent.setup();
  const part = (name: string): HTMLElement => utils.container.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
  const root = (): HTMLElement => utils.container.querySelector<HTMLElement>('[data-ds="Carousel"]')!;
  return { ...utils, props, user, onChange, part, root };
}

describe('Carousel', () => {
  /* Previous and Next move one page of perView slides, and onChange reports the change with its reason. */
  it('next-advances-a-slide', async () => {
    const s = setup();
    await s.user.click(s.part('nextButton'));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(1, 'next');
  });

  /* The arrows are disabled at the ends unless loop, so users can tell where the end is. */
  it('previous-at-the-first-slide-does-nothing', async () => {
    const s = setup();
    await s.user.click(s.part('prevButton'));
    expect(s.onChange).not.toHaveBeenCalled();
  });

  /* With loop, Next from the last returns to the first, and Previous from the first to the last. */
  it('loop-wraps-backwards-from-the-first-slide', async () => {
    const s = setup({ loop: true });
    await s.user.click(s.part('prevButton'));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(2, 'prev');
  });

  it('the-picker-jumps-straight-to-a-slide', async () => {
    const s = setup({ activeIndex: 1, picker: 'dots' });
    await s.user.click(s.part('pickerItem'));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(0, 'picker');
  });

  /* A region named for its content, with aria-roledescription so it is announced as a carousel. */
  it('the-region-is-announced-as-a-carousel', () => {
    const s = setup();
    expect(s.root().getAttribute('aria-roledescription')).toBe('carousel');
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).not.toBeNull();
  });

  it('renders-picker-dots', () => {
    const s = setup({ picker: 'dots' });
    expect(s.root()).not.toBeNull();
  });

  it('renders-picker-tabs', () => {
    const s = setup({ picker: 'tabs' });
    expect(s.root()).not.toBeNull();
  });

  it('renders-picker-none', () => {
    const s = setup({ picker: 'none' });
    expect(s.root()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup({ label: 'Accessible name' });
    expect(screen.getByRole('region', { name: 'Accessible name' })).toBeTruthy();
  });
});
