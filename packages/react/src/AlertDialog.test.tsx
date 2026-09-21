/**
 * AlertDialog — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/alert-dialog.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { AlertDialog } from './AlertDialog';
import meta from './AlertDialog.stories';

type Props = ComponentProps<typeof AlertDialog>;

function setup(given: Partial<Props> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const props = { ...meta.args, onConfirm, onCancel, ...given } as Props;
  const utils = render(<AlertDialog {...props} />);
  const dialog = (): HTMLElement | null => document.body.querySelector('[data-ds="AlertDialog"]');
  const cancelButton = (): HTMLElement => screen.getByRole('button', { name: props.cancelLabel ?? 'Cancel' });
  const confirmButton = (): HTMLElement => screen.getByRole('button', { name: props.confirmLabel });
  return { ...utils, onConfirm, onCancel, props, dialog, cancelButton, confirmButton };
}

describe('AlertDialog', () => {
  it('confirm-button-fires-on-confirm', () => {
    const d = setup({ open: true });
    fireEvent.click(d.confirmButton());
    expect(d.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('cancel-button-fires-on-cancel', () => {
    const d = setup({ open: true });
    fireEvent.click(d.cancelButton());
    expect(d.onCancel).toHaveBeenCalledWith('cancel');
  });

  it('focus-starts-on-the-cancel-button', () => {
    const d = setup({ open: true });
    expect(document.activeElement).toBe(d.cancelButton());
  });

  it('a-scrim-click-does-nothing', () => {
    // The scrim is a real element inside the full-viewport <dialog>, with no click listener.
    const d = setup({ open: true });
    const scrim = d.dialog()!.querySelector<HTMLElement>('[data-part="scrim"]')!;
    expect(scrim).not.toBeNull();
    fireEvent.pointerDown(scrim);
    fireEvent.click(scrim);
    expect(d.onCancel).not.toHaveBeenCalled();
    expect(d.onConfirm).not.toHaveBeenCalled();
  });

  it('confirm-disabled-does-not-confirm', () => {
    const d = setup({ open: true, confirmDisabled: true });
    fireEvent.click(d.confirmButton());
    expect(d.onConfirm).not.toHaveBeenCalled();
  });

  it('cancel-works-while-confirm-is-disabled', () => {
    const d = setup({ open: true, confirmDisabled: true });
    fireEvent.click(d.cancelButton());
    expect(d.onCancel).toHaveBeenCalledWith('cancel');
  });

  it('escape-cancels-while-confirm-is-disabled', () => {
    const d = setup({ open: true, confirmDisabled: true });
    fireEvent.keyDown(document.activeElement ?? d.dialog()!, { key: 'Escape' });
    expect(d.onCancel).toHaveBeenCalledWith('escape');
  });

  it('the-cancel-button-is-named-from-copy', () => {
    const d = setup({ open: true, cancelLabel: undefined });
    const button = d.dialog()!.querySelector<HTMLElement>('[data-part="cancelButton"] button');
    expect(button).not.toBeNull();
    expect(button).toHaveTextContent('Cancel');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBe(button);
  });

  it('renders', () => {
    const d = setup();
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const d = setup({ tone: 'danger' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const d = setup({ tone: 'warning' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-info', () => {
    const d = setup({ tone: 'info' });
    expect(d.dialog()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByRole('alertdialog', { name: d.props.heading })).toBe(d.dialog());
  });

  it('escape-fires-on-cancel', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? d.dialog()!, { key: 'Escape' });
    expect(d.onCancel).toHaveBeenCalledWith('escape');
  });
});
