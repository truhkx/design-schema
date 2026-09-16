/**
 * Dialog — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/dialog.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Dialog } from './Dialog';
import meta from './Dialog.stories';

type Props = ComponentProps<typeof Dialog>;

function setup(given: Partial<Props> = {}) {
  const onClose = vi.fn();
  const props = { ...meta.args, onClose, ...given } as Props;
  const utils = render(<Dialog {...props} />);
  const dialog = (): HTMLElement | null => document.body.querySelector('[data-ds="Dialog"]');
  return { ...utils, onClose, props, dialog };
}

describe('Dialog', () => {
  it('close-button-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onClose).toHaveBeenCalledWith('close-button');
  });

  it('non-dismissible-still-reports-escape', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.keyDown(document.activeElement ?? d.dialog()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });

  it('non-dismissible-scrim-click-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    const scrim = d.dialog()!;
    fireEvent.pointerDown(scrim);
    fireEvent.click(scrim);
    expect(d.onClose).not.toHaveBeenCalled();
  });

  it('initial-focus-lands-on-the-close-button', () => {
    setup({ open: true, initialFocus: 'close' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('hidden-heading-is-still-the-accessible-name', () => {
    const d = setup({ open: true, hideHeading: true });
    expect(screen.getByRole('dialog', { name: d.props.heading })).toBe(d.dialog());
  });

  it('closed-dialog-renders-nothing', () => {
    const d = setup({ open: false });
    expect(d.dialog()).toBeNull();
  });

  it('renders', () => {
    const d = setup();
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const d = setup({ size: 'sm' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const d = setup({ size: 'md' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const d = setup({ size: 'lg' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-first', () => {
    const d = setup({ initialFocus: 'first' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-title', () => {
    const d = setup({ initialFocus: 'title' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initial-focus-close', () => {
    const d = setup({ initialFocus: 'close' });
    expect(d.dialog()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByRole('dialog', { name: d.props.heading })).toBe(d.dialog());
  });

  it('escape-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? d.dialog()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });
});
