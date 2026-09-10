/**
 * AlertDialog — behavior scenarios from the component doc, one test each, in the
 * doc's order. Every scenario in the spec is a `renders: true` or accessible-name
 * check, so each test only asserts the tree renders or that the accessible name is
 * set. See generated/prompts/AlertDialog.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AlertDialog } from './AlertDialog';
import type { AlertDialogProps } from './AlertDialog';
import meta from './AlertDialog.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<AlertDialogProps> = {}) {
  const props: AlertDialogProps = { ...(meta.args as AlertDialogProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <AlertDialog {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('AlertDialog', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const d = setup();
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-danger', () => {
    const d = setup({ tone: 'danger' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const d = setup({ tone: 'warning' });
    expect(d.toJSON()).not.toBeNull();
  });

  it('renders-tone-info', () => {
    const d = setup({ tone: 'info' });
    expect(d.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });
});
