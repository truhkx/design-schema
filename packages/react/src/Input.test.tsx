/**
 * Input — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/input.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Input.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, type InputProps } from './Input';
import meta from './Input.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<InputProps> = {}) {
  const onChange = vi.fn();
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  const props = { ...meta.args, ...given, onChange, onFocus, onBlur } as InputProps;
  const utils = render(<Input {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    onFocus,
    onBlur,
    props,
    control: () => screen.getByLabelText(props.label) as HTMLInputElement,
  };
}

describe('Input', () => {
  /* derived: true */
  it('renders', () => {
    const s = setup();
    expect(s.control()).toBeInTheDocument();
  });

  /* derived: props.type */
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

  /* derived: keyboard-operable */
  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.control().focus());
    expect(s.control()).toHaveFocus();
  });

  /* derived: error-identification */
  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.control()).toHaveAttribute('aria-invalid', 'true');
  });
});
