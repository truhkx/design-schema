/**
 * Input — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/input.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Input.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Input, type InputProps } from './Input';
import meta from './Input.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<InputProps> = {}) {
  const onChange = vi.fn();
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  const props = { ...meta.args, ...given, onChange, onFocus, onBlur } as ComponentProps<typeof Input>;
  const utils = render(<Input {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onFocus,
    onBlur,
    props,
    control: () => screen.getByLabelText(props.label, { exact: false }) as HTMLInputElement,
  };
}

describe('Input', () => {
  it('typing-reports-the-new-value', async () => {
    const s = setup();
    await s.user.type(s.control(), 'a');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('a');
  });

  it('focus-is-reported', async () => {
    const s = setup();
    await s.user.tab();
    expect(s.control()).toHaveFocus();
    expect(s.onFocus).toHaveBeenCalledTimes(1);
  });

  it('required-is-shown-in-the-label', () => {
    const s = setup({ required: true });
    const label = s.container.querySelector('label');
    expect(label?.textContent).toBe(`${s.props.label} (required)`);
    expect(s.control()).toHaveAttribute('aria-required', 'true');
  });

  it('error-is-announced-when-it-appears', () => {
    setup({ error: 'Enter an email address like name@example.com' });
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an email address like name@example.com');
  });

  it('disabled-stays-focusable-and-is-announced', () => {
    const s = setup({ disabled: true });
    expect(s.control()).toHaveAttribute('aria-disabled', 'true');
    expect(s.control()).not.toHaveAttribute('disabled');
    act(() => s.control().focus());
    expect(s.control()).toHaveFocus();
  });

  it('renders', () => {
    const s = setup();
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-text', () => {
    const s = setup({ type: 'text' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-email', () => {
    const s = setup({ type: 'email' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-password', () => {
    const s = setup({ type: 'password' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-number', () => {
    const s = setup({ type: 'number' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-search', () => {
    const s = setup({ type: 'search' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-tel', () => {
    const s = setup({ type: 'tel' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-type-url', () => {
    const s = setup({ type: 'url' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.control()).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.control()).toBeInTheDocument();
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.control().focus());
    expect(s.control()).toHaveFocus();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
  });
});
