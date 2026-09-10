/**
 * <ds-button> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus, which
 * jsdom does not implement. See generated/prompts/Button.lit.md.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from '@vitest/browser/context';
import './Button.js';
import type { ButtonPressDetail, ButtonTrackDetail, DsButton } from './Button.js';
import meta from './Button.stories.js';

type Given = Partial<
  Pick<DsButton, 'label' | 'variant' | 'size' | 'type' | 'disabled' | 'iconOnly' | 'loading' | 'inverse' | 'track'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-button');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const press = vi.fn<(event: CustomEvent<ButtonPressDetail>) => void>();
  const track = vi.fn<(event: CustomEvent<ButtonTrackDetail>) => void>();
  el.addEventListener('press', press as unknown as EventListener);
  el.addEventListener('track', track as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    press,
    track,
    props,
    container: () => root.querySelector<HTMLButtonElement>('[part=container]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-button', () => {
  it('press-tracks', async () => {
    const b = await setup({ track: 'signup', label: 'Sign up' });
    await userEvent.click(b.container());
    expect(b.track).toHaveBeenCalledTimes(1);
    expect(b.track.mock.calls[0]?.[0].detail).toEqual({ name: 'signup', label: 'Sign up' });
  });

  /* derived: a11y.role */
  it('renders', async () => {
    const b = await setup();
    expect(b.container()).not.toBeNull();
  });

  /* derived: props.variant */
  it('renders-variant-primary', async () => {
    const b = await setup({ variant: 'primary' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-variant-secondary', async () => {
    const b = await setup({ variant: 'secondary' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-variant-ghost', async () => {
    const b = await setup({ variant: 'ghost' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-variant-danger', async () => {
    const b = await setup({ variant: 'danger' });
    expect(b.container()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-sm', async () => {
    const b = await setup({ size: 'sm' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-size-md', async () => {
    const b = await setup({ size: 'md' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-size-lg', async () => {
    const b = await setup({ size: 'lg' });
    expect(b.container()).not.toBeNull();
  });

  /* derived: props.type */
  it('renders-type-button', async () => {
    const b = await setup({ type: 'button' });
    expect(b.container()).not.toBeNull();
  });

  it('renders-type-submit', async () => {
    const b = await setup({ type: 'submit' });
    expect(b.container()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const b = await setup();
    expect(b.container()).toHaveAccessibleName(b.props.label);
  });

  it('control-is-focusable', async () => {
    const b = await setup();
    b.el.focus();
    expect(document.activeElement).toBe(b.el);
    expect(b.el.shadowRoot!.activeElement).toBe(b.container());
  });
});
