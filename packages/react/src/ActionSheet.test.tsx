/**
 * ActionSheet — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/action-sheet.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { ActionSheet } from './ActionSheet';
import meta from './ActionSheet.stories';

type Props = ComponentProps<typeof ActionSheet>;

function setup(given: Partial<Props> = {}) {
  const onAction = vi.fn();
  const onClose = vi.fn();
  const props = { ...meta.args, onAction, onClose, ...given } as Props;
  const utils = render(<ActionSheet {...props} />);
  const sheet = (): HTMLElement | null => document.body.querySelector('[data-ds="ActionSheet"]');
  return { ...utils, onAction, onClose, props, sheet };
}

const TWO_ACTIONS = [
  { id: 'share', label: 'Share' },
  { id: 'rename', label: 'Rename' },
];

describe('ActionSheet', () => {
  it('choosing-an-action-fires-on-action', () => {
    const d = setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [...TWO_ACTIONS, { id: 'delete', label: 'Delete photo', tone: 'danger' }],
    });
    fireEvent.click(screen.getAllByRole('menuitem')[0]!);
    expect(d.onAction).toHaveBeenCalledWith('share');
  });

  it('the-cancel-row-fires-on-close', () => {
    const d = setup({ open: true, heading: 'Photo.jpg', actions: TWO_ACTIONS });
    fireEvent.click(d.sheet()!.querySelector('[data-part="cancelButton"] button')!);
    expect(d.onClose).toHaveBeenCalledWith('cancel');
    expect(d.onAction).not.toHaveBeenCalled();
  });

  it('non-dismissible-still-reports-escape', () => {
    const d = setup({ open: true, heading: 'Photo.jpg', dismissible: false, actions: TWO_ACTIONS });
    fireEvent.keyDown(document.activeElement ?? d.sheet()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });

  it('the-cancel-row-is-named-from-copy', () => {
    setup({ open: true, heading: 'Photo.jpg', actions: TWO_ACTIONS });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });

  it('the-list-is-a-menu', () => {
    setup({ open: true, heading: 'Photo.jpg', actions: TWO_ACTIONS });
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('closed-sheet-renders-nothing', () => {
    const d = setup({ open: false, actions: [{ id: 'share', label: 'Share' }] });
    expect(d.sheet()).toBeNull();
  });

  it('renders', () => {
    const d = setup();
    expect(d.sheet()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('menu', { name: 'Photo.jpg' })).toBeTruthy();
  });

  it('escape-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? d.sheet()!, { key: 'Escape' });
    expect(d.onClose).toHaveBeenCalledWith('escape');
  });
});
