/**
 * <ds-carousel> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Carousel.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Carousel.js';
import type { CarouselChangeDetail, DsCarousel } from './Carousel.js';
import meta from './Carousel.stories.js';

type Given = Partial<Pick<DsCarousel, 'label' | 'perView' | 'loop' | 'autoplay' | 'interval' | 'picker' | 'activeIndex' | 'snap'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with the Default story's four slides. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-carousel');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const label of ['Product 1', 'Product 2', 'Product 3', 'Product 4']) {
    const slide = document.createElement('ds-carousel-slide');
    slide.label = label;
    slide.textContent = label;
    el.append(slide);
  }
  document.body.append(el);
  await el.updateComplete;
  await el.updateComplete;
  const events: CarouselChangeDetail[] = [];
  el.addEventListener('change', (event) => events.push((event as CustomEvent<CarouselChangeDetail>).detail));
  const part = (name: string) => el.shadowRoot!.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
  return { el, props, events, part };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-carousel', () => {
  it('next-advances-a-slide', async () => {
    const { part, events } = await setup();
    await userEvent.click(part('nextButton'));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ index: 1, reason: 'next' });
  });

  it('previous-at-the-first-slide-does-nothing', async () => {
    const { part, events } = await setup();
    await userEvent.click(part('prevButton'));
    expect(events).toHaveLength(0);
  });

  it('loop-wraps-backwards-from-the-first-slide', async () => {
    const { part, events } = await setup({ loop: true });
    await userEvent.click(part('prevButton'));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ index: 3, reason: 'prev' });
  });

  it('the-picker-jumps-straight-to-a-slide', async () => {
    const { part, events } = await setup({ activeIndex: 1, picker: 'dots' });
    await userEvent.click(part('pickerItem'));
    expect(events.at(-1)).toEqual({ index: 0, reason: 'picker' });
  });

  /* derived */
  it('renders', async () => {
    const { el } = await setup();
    expect(el).toHaveAttribute('data-ds', 'Carousel');
    expect(el).toHaveAttribute('role', 'region');
    expect(el).toHaveAttribute('aria-roledescription', 'carousel');
    expect(el.shadowRoot).not.toBeNull();
  });

  /* derived: props.picker */
  it('renders-picker-dots', async () => {
    const { el, part } = await setup({ picker: 'dots' });
    expect(el).toHaveAttribute('picker', 'dots');
    expect(part('picker')).toHaveAttribute('role', 'group');
  });

  it('renders-picker-tabs', async () => {
    const { el, part } = await setup({ picker: 'tabs' });
    expect(el).toHaveAttribute('picker', 'tabs');
    expect(part('picker')).toHaveAttribute('role', 'tablist');
  });

  it('renders-picker-none', async () => {
    const { el, part } = await setup({ picker: 'none' });
    expect(el).toHaveAttribute('picker', 'none');
    expect(part('picker')).toBeNull();
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const { el, props } = await setup();
    expect(el).toHaveAccessibleName(props.label);
  });
});
