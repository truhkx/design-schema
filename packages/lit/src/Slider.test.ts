/**
 * <ds-slider> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Slider.js';
import type { DsSlider, SliderChangeDetail } from './Slider.js';
import meta from './Slider.stories.js';

type Given = Partial<
  Pick<DsSlider, 'defaultValue' | 'step' | 'min' | 'max' | 'range' | 'showValue' | 'disabled' | 'invalid' | 'error'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-slider');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<SliderChangeDetail>) => void>();
  const changeEnd = vi.fn<(event: CustomEvent<SliderChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  el.addEventListener('change-end', changeEnd as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    changeEnd,
    props,
    thumbs: () => [...root.querySelectorAll<HTMLElement>('[data-part=thumb]')],
    thumb: () => root.querySelector<HTMLElement>('[data-part=thumb]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`),
    detail: () => change.mock.calls.at(-1)?.[0].detail.value,
    endDetail: () => changeEnd.mock.calls.at(-1)?.[0].detail.value,
  };
}

async function press(key: string) {
  await userEvent.keyboard(`{${key}}`);
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-slider', () => {
  it('arrow-increases-by-one-step', async () => {
    const s = await setup({ defaultValue: 50, step: 5 });
    s.el.focus();
    await press('ArrowRight');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(55);
  });

  it('arrow-decreases-by-one-step', async () => {
    const s = await setup({ defaultValue: 50, step: 5 });
    s.el.focus();
    await press('ArrowLeft');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(45);
  });

  it('page-up-changes-by-ten-steps', async () => {
    const s = await setup({ defaultValue: 50 });
    s.el.focus();
    await press('PageUp');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(60);
  });

  it('home-sets-the-minimum', async () => {
    const s = await setup({ defaultValue: 50, min: 0, max: 100 });
    s.el.focus();
    await press('Home');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(0);
  });

  it('end-sets-the-maximum', async () => {
    const s = await setup({ defaultValue: 50, min: 0, max: 100 });
    s.el.focus();
    await press('End');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(100);
  });

  it('a-key-press-is-a-complete-interaction', async () => {
    const s = await setup({ defaultValue: 50 });
    s.el.focus();
    await press('ArrowRight');
    expect(s.changeEnd).toHaveBeenCalledTimes(1);
    expect(s.endDetail()).toBe(51);
  });

  it('a-disabled-slider-does-not-move', async () => {
    const s = await setup({ disabled: true, defaultValue: 50 });
    s.el.focus();
    await press('ArrowRight');
    expect(s.change).not.toHaveBeenCalled();
    expect(s.thumb()).toHaveAttribute('aria-valuenow', '50');
  });

  it('the-thumb-is-the-slider', async () => {
    const s = await setup();
    expect(s.thumb()).toHaveAttribute('role', 'slider');
    expect(s.part('track')).not.toHaveAttribute('role');
  });

  it('invalid-renders-the-invalid-copy', async () => {
    const s = await setup({ invalid: true });
    expect(s.part('errorMessage')).toHaveTextContent(`${s.props.label} is not valid.`);
  });

  it('renders', async () => {
    const s = await setup();
    expect(s.part('track')).toBeTruthy();
    expect(s.thumb()).toBeVisible();
  });

  it('renders-show-value-always', async () => {
    const s = await setup({ showValue: 'always' });
    expect(s.part('valueText')).toBeVisible();
    expect(s.part('bubble')).toBeNull();
  });

  it('renders-show-value-hover', async () => {
    const s = await setup({ showValue: 'hover' });
    expect(s.part('valueText')).toBeNull();
    expect(s.part('bubble')).toBeTruthy();
  });

  it('renders-show-value-never', async () => {
    const s = await setup({ showValue: 'never' });
    expect(s.part('valueText')).toBeNull();
    expect(s.part('bubble')).toBeNull();
    expect(s.thumb()).toBeVisible();
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.thumb()).toHaveAccessibleName(s.props.label);
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(s.el.shadowRoot!.activeElement).toBe(s.thumb());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.part('errorMessage')).toHaveTextContent('Fix this before continuing.');
    // `error` never changes the `invalid` prop; the invalid state is carried by aria-invalid.
    expect(s.thumb()).toHaveAttribute('aria-invalid', 'true');
  });

  /* The range form: two thumbs, each a tab stop, named from the minimum/maximum copy. */
  it('a-range-names-each-thumb', async () => {
    const s = await setup({ range: true, defaultValue: [20, 80] });
    const low = s.thumbs()[0]!;
    const high = s.thumbs()[1]!;
    expect(s.thumbs()).toHaveLength(2);
    expect(low).toHaveAccessibleName(`${s.props.label} minimum`);
    expect(high).toHaveAccessibleName(`${s.props.label} maximum`);
    expect(low).toHaveAttribute('aria-valuemax', '80');
    expect(high).toHaveAttribute('aria-valuemin', '20');
  });

  it('range-thumbs-cannot-cross', async () => {
    const s = await setup({ range: true, defaultValue: [20, 20] });
    s.el.focus();
    await press('ArrowRight');
    expect(s.change).not.toHaveBeenCalled();
  });
});
