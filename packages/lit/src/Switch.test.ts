/**
 * <ds-switch> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Switch.js';
import type { DsSwitch, SwitchChangeDetail } from './Switch.js';
import meta from './Switch.stories.js';

const DESCRIPTION = 'Sends a daily summary at 9:00.';

type Given = Partial<
  Pick<DsSwitch, 'label' | 'name' | 'checked' | 'defaultChecked' | 'disabled' | 'description' | 'labelPosition'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-switch');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<SwitchChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    props,
    track: () => root.querySelector<HTMLInputElement>('[data-part=track]')!,
    label: () => root.querySelector<HTMLLabelElement>('[data-part=label]')!,
    description: () => root.querySelector<HTMLElement>('[data-part=description]')!,
    detail: () => change.mock.calls[0]?.[0].detail.checked,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-switch', () => {
  it('click-on-track-toggles-on', async () => {
    const s = await setup();
    await userEvent.click(s.track());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
    expect(s.track()).toHaveAttribute('aria-checked', 'true');
  });

  it('click-on-label-toggles', async () => {
    const s = await setup();
    await userEvent.click(s.label());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
  });

  it('click-on-description-toggles', async () => {
    const s = await setup({ description: DESCRIPTION });
    await userEvent.click(s.description());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
  });

  it('space-toggles', async () => {
    const s = await setup();
    s.el.focus();
    await userEvent.keyboard(' ');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
  });

  it('enter-is-ignored', async () => {
    const s = await setup();
    s.el.focus();
    await userEvent.keyboard('{Enter}');
    expect(s.change).not.toHaveBeenCalled();
    expect(s.el.checked).toBe(false);
  });

  it('toggles-back-off', async () => {
    const s = await setup({ defaultChecked: true });
    await userEvent.click(s.track());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(false);
    expect(s.el.checked).toBe(false);
  });

  it('disabled-does-not-toggle', async () => {
    const s = await setup({ disabled: true });
    // Playwright will not click an aria-disabled control on its own; a person can.
    await userEvent.click(s.track(), { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.el.checked).toBe(false);
    expect(s.el.disabled).toBe(true);
    expect(s.track()).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled-stays-focusable', async () => {
    const s = await setup({ disabled: true });
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.track());
  });

  it('controlled-updates-on-set', async () => {
    const s = await setup({ checked: false });
    s.el.checked = true;
    await s.el.updateComplete;
    expect(s.el.checked).toBe(true);
    expect(s.track().checked).toBe(true);
    expect(s.track()).toHaveAttribute('aria-checked', 'true');
  });

  it('description-is-rendered', async () => {
    const s = await setup({ description: DESCRIPTION });
    expect(s.description()).toHaveTextContent(DESCRIPTION);
  });

  it('label-at-the-end-still-toggles-the-row', async () => {
    const s = await setup({ labelPosition: 'end' });
    await userEvent.click(s.label());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.track()).not.toBeNull();
  });

  it('renders-label-position-start', async () => {
    const s = await setup({ labelPosition: 'start' });
    expect(s.track()).not.toBeNull();
    expect(s.el).toHaveAttribute('label-position', 'start');
  });

  it('renders-label-position-end', async () => {
    const s = await setup({ labelPosition: 'end' });
    expect(s.track()).not.toBeNull();
    expect(s.el).toHaveAttribute('label-position', 'end');
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.track()).toHaveAccessibleName(s.props.label);
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.track());
  });
});
