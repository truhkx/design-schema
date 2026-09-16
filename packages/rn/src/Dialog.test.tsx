/**
 * Dialog — behavior scenarios from the component doc, one test each, in the doc's
 * order. `non-dismissible-still-reports-escape` and `initial-focus-lands-on-the-close-button`
 * are scoped to web and lit, so they have no test here.
 * See generated/prompts/Dialog.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Dialog } from './Dialog';
import type { DialogProps } from './Dialog';
import meta from './Dialog.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<DialogProps> = {}) {
  const onClose = jest.fn();
  const props: DialogProps = { ...(meta.args as DialogProps), onClose, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Dialog {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onClose };
}

describe('Dialog', () => {
  it('close-button-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.press(screen.getByLabelText('Close'));
    expect(d.onClose).toHaveBeenCalled();
  });

  it('non-dismissible-scrim-click-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.press(screen.getByTestId('Dialog.scrim'));
    expect(d.onClose).not.toHaveBeenCalled();
  });

  it('hidden-heading-is-still-the-accessible-name', () => {
    const d = setup({ open: true, hideHeading: true });
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });

  it('closed-dialog-renders-nothing', () => {
    const d = setup({ open: false });
    expect(screen.queryByTestId('Dialog')).toBeNull();
    expect(screen.queryByText(d.props.heading)).toBeNull();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    setup({ size: 'sm' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  it('renders-size-md', () => {
    setup({ size: 'md' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  it('renders-size-lg', () => {
    setup({ size: 'lg' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  /* derived: props.initialFocus */
  it('renders-initial-focus-first', () => {
    setup({ initialFocus: 'first' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  it('renders-initial-focus-title', () => {
    setup({ initialFocus: 'title' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  it('renders-initial-focus-close', () => {
    setup({ initialFocus: 'close' });
    expect(screen.getByTestId('Dialog')).toBeTruthy();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });
});
