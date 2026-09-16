/**
 * Slider — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/slider.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Slider, type SliderProps } from './Slider';
import meta from './Slider.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SliderProps> = {}) {
  const onChange = vi.fn();
  const onChangeEnd = vi.fn();
  const props = { ...meta.args, ...given, onChange, onChangeEnd } as ComponentProps<typeof Slider>;
  const utils = render(<Slider {...props} />);
  const user = userEvent.setup();
  const thumb = () => screen.getByRole('slider');
  const press = async (key: string) => {
    act(() => thumb().focus());
    await user.keyboard(`{${key}}`);
  };
  return { ...utils, user, onChange, onChangeEnd, thumb, press };
}

describe('Slider', () => {
  it('arrow-increases-by-one-step', async () => {
    const s = setup({ defaultValue: 50, step: 5 });
    await s.press('ArrowRight');
    expect(s.onChange).toHaveBeenCalledWith(55);
  });

  it('arrow-decreases-by-one-step', async () => {
    const s = setup({ defaultValue: 50, step: 5 });
    await s.press('ArrowLeft');
    expect(s.onChange).toHaveBeenCalledWith(45);
  });

  it('page-up-changes-by-ten-steps', async () => {
    const s = setup({ defaultValue: 50 });
    await s.press('PageUp');
    expect(s.onChange).toHaveBeenCalledWith(60);
  });

  it('home-sets-the-minimum', async () => {
    const s = setup({ defaultValue: 50, min: 0, max: 100 });
    await s.press('Home');
    expect(s.onChange).toHaveBeenCalledWith(0);
  });

  it('end-sets-the-maximum', async () => {
    const s = setup({ defaultValue: 50, min: 0, max: 100 });
    await s.press('End');
    expect(s.onChange).toHaveBeenCalledWith(100);
  });

  it('a-key-press-is-a-complete-interaction', async () => {
    const s = setup({ defaultValue: 50 });
    await s.press('ArrowRight');
    expect(s.onChangeEnd).toHaveBeenCalledTimes(1);
    expect(s.onChangeEnd).toHaveBeenCalledWith(51);
  });

  it('a-disabled-slider-does-not-move', async () => {
    const s = setup({ disabled: true, defaultValue: 50 });
    await s.press('ArrowRight');
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.thumb()).toHaveAttribute('aria-valuenow', '50');
  });

  it('the-thumb-reports-its-value-and-bounds', () => {
    const s = setup({ defaultValue: 4, min: 0, max: 10 });
    expect(s.thumb()).toHaveAttribute('aria-valuenow', '4');
    expect(s.thumb()).toHaveAttribute('aria-valuemin', '0');
    expect(s.thumb()).toHaveAttribute('aria-valuemax', '10');
  });

  it('the-thumb-is-the-slider', () => {
    const s = setup();
    expect(s.thumb()).toHaveAttribute('data-part', 'thumb');
  });

  it('invalid-renders-the-invalid-copy', () => {
    setup({ invalid: true });
    expect(screen.getByText('Volume is not valid.')).toBeInTheDocument();
  });

  it('renders', () => {
    const s = setup();
    expect(s.container.querySelector('[data-ds="Slider"]')).toBeInTheDocument();
  });

  it('renders-show-value-always', () => {
    const s = setup({ showValue: 'always' });
    expect(s.container.querySelector('[data-ds="Slider"]')).toBeInTheDocument();
  });

  it('renders-show-value-hover', () => {
    const s = setup({ showValue: 'hover' });
    expect(s.container.querySelector('[data-ds="Slider"]')).toBeInTheDocument();
  });

  it('renders-show-value-never', () => {
    const s = setup({ showValue: 'never' });
    expect(s.container.querySelector('[data-ds="Slider"]')).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.thumb().focus());
    expect(s.thumb()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.thumb()).toHaveAttribute('aria-invalid', 'true');
  });
});
