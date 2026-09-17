/**
 * <ds-checkbox> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Checkbox.js';
import type { CheckboxChangeDetail, DsCheckbox } from './Checkbox.js';
import meta from './Checkbox.stories.js';

type Given = Partial<
  Pick<DsCheckbox, 'label' | 'name' | 'defaultChecked' | 'indeterminate' | 'disabled' | 'required' | 'description' | 'error' | 'hideLabel'>
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-checkbox');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<CheckboxChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    props,
    control: () => root.querySelector<HTMLInputElement>('[data-part=control]')!,
    label: () => root.querySelector<HTMLLabelElement>('[data-part=label]')!,
    description: () => root.querySelector<HTMLElement>('[data-part=description]')!,
    detail: () => change.mock.calls[0]?.[0].detail.checked,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-checkbox', () => {
  it('click-on-control-toggles-on', async () => {
    const s = await setup();
    await userEvent.click(s.control());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.el.checked).toBe(true);
    expect(s.control().checked).toBe(true);
  });

  it('click-on-label-toggles', async () => {
    const s = await setup();
    await userEvent.click(s.label());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.control().checked).toBe(true);
  });

  it('click-on-description-toggles', async () => {
    const s = await setup({ description: 'One email a month about new features.' });
    await userEvent.click(s.description());
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.control().checked).toBe(true);
  });

  it('space-toggles', async () => {
    const s = await setup();
    s.el.focus();
    await userEvent.keyboard(' ');
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.detail()).toBe(true);
    expect(s.control().checked).toBe(true);
  });

  it('enter-is-ignored', async () => {
    const s = await setup();
    s.el.focus();
    await userEvent.keyboard('{Enter}');
    expect(s.change).not.toHaveBeenCalled();
    expect(s.control().checked).toBe(false);
  });

  it('toggles-back-off', async () => {
    const s = await setup({ defaultChecked: true });
    await userEvent.click(s.control());
    expect(s.detail()).toBe(false);
    expect(s.control().checked).toBe(false);
  });

  it('indeterminate-is-announced-as-mixed', async () => {
    const s = await setup({ indeterminate: true });
    expect(s.control()).toHaveAttribute('aria-checked', 'mixed');
    expect(s.control().indeterminate).toBe(true);
  });

  it('disabled-does-not-toggle', async () => {
    const s = await setup({ disabled: true });
    // Playwright will not click an aria-disabled control on its own; a person can.
    await userEvent.click(s.control(), { force: true });
    expect(s.change).not.toHaveBeenCalled();
    expect(s.control().checked).toBe(false);
    expect(s.control()).toHaveAttribute('aria-disabled', 'true');
    expect(s.el).toHaveAttribute('disabled');
  });

  it('disabled-stays-focusable', async () => {
    const s = await setup({ disabled: true });
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.control());
  });

  it('required-is-shown-in-the-label', async () => {
    const s = await setup({ required: true });
    expect(s.label().textContent).toContain(' (required)');
  });

  it('error-marks-invalid-and-is-announced', async () => {
    const s = await setup({ error: 'Accept the terms to continue.' });
    const alert = s.el.shadowRoot!.querySelector('[role=alert]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain('Accept the terms to continue.');
    expect(s.el.invalid).toBe(true);
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
  });

  it('hidden-label-is-still-the-accessible-name', async () => {
    const s = await setup({ hideLabel: true });
    expect(s.control()).toHaveAccessibleName(s.props.label);
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.control()).not.toBeNull();
  });

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.control());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.el.shadowRoot!.querySelector('[data-part=errorMessage]')!.textContent).toContain('Fix this before continuing.');
    expect(s.el.invalid).toBe(true);
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
  });
});
