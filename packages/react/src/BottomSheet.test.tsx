/**
 * BottomSheet — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/bottom-sheet.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { BottomSheet } from './BottomSheet';
import meta from './BottomSheet.stories';

type Props = ComponentProps<typeof BottomSheet>;

function setup(given: Partial<Props> = {}) {
  const onClose = vi.fn();
  const props = { ...meta.args, onClose, ...given } as Props;
  const utils = render(<BottomSheet {...props} />);
  const sheet = (): HTMLElement | null => document.body.querySelector('[data-ds="BottomSheet"]');
  return { ...utils, onClose, props, sheet };
}

describe('BottomSheet', () => {
  it('close-button-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onClose).toHaveBeenCalledWith('close-button');
  });

  it('the-close-button-works-without-the-drag-gesture', () => {
    const d = setup({ open: true, dragToDismiss: false });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onClose).toHaveBeenCalledWith('close-button');
  });

  it('non-dismissible-still-reports-escape', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.keyDown(document.activeElement ?? d.sheet()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });

  it('non-dismissible-scrim-tap-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    const scrim = d.sheet()!;
    fireEvent.pointerDown(scrim);
    fireEvent.click(scrim);
    expect(d.onClose).not.toHaveBeenCalled();
  });

  it('hidden-heading-is-still-the-accessible-name', () => {
    const d = setup({ open: true, hideHeading: true });
    expect(screen.getByRole('dialog', { name: d.props.heading })).toBe(d.sheet());
  });

  it('closed-sheet-renders-nothing', () => {
    const d = setup({ open: false });
    expect(d.sheet()).toBeNull();
  });

  it('renders', () => {
    const d = setup();
    expect(d.sheet()).not.toBeNull();
  });

  it('renders-height-content', () => {
    const d = setup({ height: 'content' });
    expect(d.sheet()).not.toBeNull();
  });

  it('renders-height-half', () => {
    const d = setup({ height: 'half' });
    expect(d.sheet()).not.toBeNull();
  });

  it('renders-height-full', () => {
    const d = setup({ height: 'full' });
    expect(d.sheet()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByRole('dialog', { name: d.props.heading })).toBe(d.sheet());
  });

  it('escape-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? d.sheet()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });
});
