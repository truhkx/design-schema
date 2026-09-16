/**
 * AlertDialog — behavior scenarios from the component doc, one test each, in the
 * doc's order. `focus-starts-on-the-cancel-button` and
 * `escape-cancels-while-confirm-is-disabled` are scoped to web and lit, so they have
 * no test here. See generated/prompts/AlertDialog.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { AlertDialog } from './AlertDialog';
import type { AlertDialogProps } from './AlertDialog';
import meta from './AlertDialog.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<AlertDialogProps> = {}) {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const props: AlertDialogProps = { ...(meta.args as AlertDialogProps), onConfirm, onCancel, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <AlertDialog {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onConfirm, onCancel };
}

/** The composed Button inside an AlertDialog part wrapper. */
function part(name: 'cancelButton' | 'confirmButton') {
  return within(screen.getByTestId(`AlertDialog.${name}`)).getByTestId('Button');
}

describe('AlertDialog', () => {
  it('confirm-button-fires-on-confirm', () => {
    const d = setup({ open: true });
    fireEvent.press(part('confirmButton'));
    expect(d.onConfirm).toHaveBeenCalledWith();
  });

  it('cancel-button-fires-on-cancel', () => {
    const d = setup({ open: true });
    fireEvent.press(part('cancelButton'));
    expect(d.onCancel).toHaveBeenCalledWith('cancel');
  });

  it('a-scrim-click-does-nothing', () => {
    const d = setup({ open: true });
    fireEvent.press(screen.getByTestId('AlertDialog.scrim'));
    expect(d.onCancel).not.toHaveBeenCalled();
    expect(d.onConfirm).not.toHaveBeenCalled();
  });

  it('confirm-disabled-does-not-confirm', () => {
    const d = setup({ open: true, confirmDisabled: true });
    fireEvent.press(part('confirmButton'));
    expect(d.onConfirm).not.toHaveBeenCalled();
  });

  it('cancel-works-while-confirm-is-disabled', () => {
    const d = setup({ open: true, confirmDisabled: true });
    fireEvent.press(part('cancelButton'));
    expect(d.onCancel).toHaveBeenCalledWith('cancel');
  });

  it('the-cancel-button-is-named-from-copy', () => {
    setup({ open: true, cancelLabel: undefined });
    expect(within(screen.getByTestId('AlertDialog.cancelButton')).getByText('Cancel')).toBeTruthy();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('AlertDialog')).toBeTruthy();
  });

  /* derived: props.tone */
  it('renders-tone-danger', () => {
    setup({ tone: 'danger' });
    expect(screen.getByTestId('AlertDialog')).toBeTruthy();
  });

  it('renders-tone-warning', () => {
    setup({ tone: 'warning' });
    expect(screen.getByTestId('AlertDialog')).toBeTruthy();
  });

  it('renders-tone-info', () => {
    setup({ tone: 'info' });
    expect(screen.getByTestId('AlertDialog')).toBeTruthy();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });
});
