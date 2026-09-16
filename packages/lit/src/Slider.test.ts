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
  Pick<
    DsSlider,
    'label' | 'name' | 'min' | 'max' | 'step' | 'defaultValue' | 'disabled' | 'invalid' | 'error' | 'showValue'
  >
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
    thumb: () => root.querySelector<HTMLElement>('[role=slider]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`),
    detail: () => change.mock.calls.at(-1)?.[0].detail.value,
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
    expect(s.changeEnd.mock.calls[0]?.[0].detail.value).toBe(51);
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
    expect(s.thumb()).toBeTruthy();
    expect(s.thumb()).toBe(s.part('thumb'));
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
    expect(s.part('track')).toBeTruthy();
    expect(s.part('valueText')).toBeTruthy();
  });

  it('renders-show-value-hover', async () => {
    const s = await setup({ showValue: 'hover' });
    expect(s.part('track')).toBeTruthy();
    expect(s.part('valueText')).toBeNull();
  });

  it('renders-show-value-never', async () => {
    const s = await setup({ showValue: 'never' });
    expect(s.part('track')).toBeTruthy();
    expect(s.part('valueText')).toBeNull();
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
    expect(s.el.invalid).toBe(true);
    expect(s.thumb()).toHaveAttribute('aria-invalid', 'true');
  });
});
