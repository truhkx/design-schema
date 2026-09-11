/**
 * Input — behavior scenarios from the component doc, one test each, in the doc's
 * order. Keyboard/focus and controlled-value scenarios are web/Lit only (the parser
 * narrows them for rn), so every scenario here is a `renders: true` check except the
 * error case. See generated/prompts/Input.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Input } from './Input';
import type { InputProps } from './Input';
import meta from './Input.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<InputProps> = {}) {
  const props: InputProps = { ...(meta.args as InputProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Input {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, control: () => screen.getByLabelText(props.label) };
}

describe('Input', () => {
  /* derived: true */
  it('renders', () => {
    const s = setup();
    expect(s.control()).toBeTruthy();
  });

  /* derived: props.type */
  it('renders-type-text', () => {
    const s = setup({ type: 'text' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-email', () => {
    const s = setup({ type: 'email' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-password', () => {
    const s = setup({ type: 'password' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-number', () => {
    const s = setup({ type: 'number' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-search', () => {
    const s = setup({ type: 'search' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-tel', () => {
    const s = setup({ type: 'tel' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-type-url', () => {
    const s = setup({ type: 'url' });
    expect(s.control()).toBeTruthy();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.control()).toBeTruthy();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.control()).toBeTruthy();
  });

  /* derived: error-identification */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
