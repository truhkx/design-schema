/**
 * ActionSheet — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/action-sheet.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  // The sheet's own keyboard model: the browser gate runs at a desktop viewport (the wide Menu).
  it('arrow keys rove over enabled actions, wrapping, with danger grouped last', () => {
    setup({
      open: true,
      actions: [
        { id: 'delete', label: 'Delete photo', tone: 'danger' },
        { id: 'share', label: 'Share' },
        { id: 'void', label: 'Void', disabled: true },
      ],
    });
    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Share', 'Void', 'Delete photo']);
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[2]);
    fireEvent.keyDown(items[2]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0]!, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[2]);
    fireEvent.keyDown(items[2]!, { key: 'Home' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0]!, { key: 'End' });
    expect(document.activeElement).toBe(items[2]);
  });

  it('a scrim click dismisses, a click that bubbles to the scrim does not', () => {
    const d = setup({ open: true });
    const scrim = d.sheet()!.querySelector<HTMLElement>('[data-part="scrim"]')!;
    const child = document.createElement('span');
    scrim.appendChild(child);
    fireEvent.click(child);
    expect(d.onClose).not.toHaveBeenCalled();
    fireEvent.click(scrim);
    expect(d.onClose).toHaveBeenCalledWith('scrim');
  });

  it('the focusScope part is present inside the sheet', () => {
    const d = setup({ open: true });
    expect(d.sheet()!.querySelector('[data-part="focusScope"] [data-part="surface"]')).not.toBeNull();
  });

  it('a sheet closed before its enter frame unmounts instead of staying modal', async () => {
    const d = setup({ open: true });
    d.rerender(<ActionSheet {...d.props} open={false} />);
    await waitFor(() => expect(d.sheet()).toBeNull());
  });
});
