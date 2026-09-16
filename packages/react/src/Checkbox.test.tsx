/**
 * Checkbox — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/checkbox.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Checkbox, type CheckboxProps } from './Checkbox';
import meta from './Checkbox.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<CheckboxProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as ComponentProps<typeof Checkbox>;
  const utils = render(<Checkbox {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    props,
    control: () => screen.getByRole('checkbox') as HTMLInputElement,
  };
}

describe('Checkbox', () => {
  it('click-on-control-toggles-on', async () => {
    const s = setup();
    await s.user.click(s.control());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.control().checked).toBe(true);
  });

  it('click-on-label-toggles', async () => {
    const s = setup();
    const label = s.container.querySelector('[data-part="label"]') as HTMLElement;
    await s.user.click(label);
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.control().checked).toBe(true);
  });

  it('click-on-description-toggles', async () => {
    const s = setup({ description: 'One email a month about new features.' });
    await s.user.click(screen.getByText('One email a month about new features.'));
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.control().checked).toBe(true);
  });

  it('space-toggles', async () => {
    const s = setup();
    s.control().focus();
    await s.user.keyboard(' ');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.control().checked).toBe(true);
  });

  it('enter-is-ignored', async () => {
    const s = setup();
    s.control().focus();
    await s.user.keyboard('{Enter}');
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.control().checked).toBe(false);
  });

  it('toggles-back-off', async () => {
    const s = setup({ defaultChecked: true });
    await s.user.click(s.control());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(false);
    expect(s.control().checked).toBe(false);
  });

  it('indeterminate-is-announced-as-mixed', () => {
    const s = setup({ indeterminate: true });
    expect(s.control()).toHaveAttribute('aria-checked', 'mixed');
    expect(s.control().indeterminate).toBe(true);
  });

  it('disabled-does-not-toggle', async () => {
    const s = setup({ disabled: true });
    await s.user.click(s.control());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.control().checked).toBe(false);
    expect(s.control()).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled-stays-focusable', () => {
    const s = setup({ disabled: true });
    s.control().focus();
    expect(s.control()).toHaveFocus();
  });

  it('required-is-shown-in-the-label', () => {
    const s = setup({ required: true });
    const label = s.container.querySelector('label');
    expect(label?.textContent).toBe(`${s.props.label} (required)`);
  });

  it('error-marks-invalid-and-is-announced', () => {
    const s = setup({ error: 'Accept the terms to continue.' });
    expect(screen.getByText('Accept the terms to continue.')).toBeInTheDocument();
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Accept the terms to continue.');
  });

  it('controlled-follows-prop', async () => {
    const s = setup({ checked: false });
    await s.user.click(s.control());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true);
    expect(s.control().checked).toBe(false);
  });

  it('hidden-label-is-still-the-accessible-name', () => {
    const s = setup({ hideLabel: true });
    expect(screen.getByRole('checkbox', { name: s.props.label })).toBeInTheDocument();
  });

  it('renders', () => {
    const s = setup();
    expect(s.container.querySelector('[data-ds="Checkbox"]')).not.toBeNull();
  });

  it('control-is-focusable', () => {
    const s = setup();
    s.control().focus();
    expect(s.control()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
  });
});
