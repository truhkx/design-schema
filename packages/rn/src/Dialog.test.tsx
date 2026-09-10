/**
 * Dialog — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` or accessible-name check,
 * so each test only asserts the tree renders or that the accessible name is set.
 * See generated/prompts/Dialog.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Dialog } from './Dialog';
import type { DialogProps } from './Dialog';
import meta from './Dialog.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<DialogProps> = {}) {
  const props: DialogProps = { ...(meta.args as DialogProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Dialog {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Dialog', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const d = setup();
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const d = setup({ size: 'sm' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const d = setup({ size: 'md' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const d = setup({ size: 'lg' });
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: props.initialFocus */
  it('renders-initialFocus-first', () => {
    const d = setup({ initialFocus: 'first' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-initialFocus-title', () => {
    const d = setup({ initialFocus: 'title' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-initialFocus-close', () => {
    const d = setup({ initialFocus: 'close' });
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.title)).toBeTruthy();
  });
});
