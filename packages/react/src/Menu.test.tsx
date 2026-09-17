/**
 * Menu — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/menu.md) is the source of truth. A scenario that gives `open`
 * renders through a wrapper that owns it and writes onOpenChange back, acting as the consumer.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState, type ComponentProps, type ReactElement } from 'react';
import { Menu, type MenuOpenChangeReason } from './Menu';
import meta from './Menu.stories';

type Props = ComponentProps<typeof Menu>;

function Consumer(props: Props): ReactElement {
  const [open, setOpen] = useState(props.open ?? false);
  return (
    <Menu
      {...props}
      open={open}
      onOpenChange={(next: boolean, reason: MenuOpenChangeReason) => {
        setOpen(next);
        props.onOpenChange?.(next, reason);
      }}
    />
  );
}

function setup(given: Partial<Props> = {}) {
  const onAction = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, onAction, onOpenChange, ...given } as Props;
  const utils = render(given.open !== undefined ? <Consumer {...props} /> : <Menu {...props} />);
  const root = (): HTMLElement | null => document.querySelector('[data-ds="Menu"]');
  const items = (): HTMLElement[] => screen.getAllByRole('menuitem');
  return { ...utils, onAction, onOpenChange, props, root, items };
}

describe('Menu', () => {
  it('choosing-an-item-reports-the-action-and-the-close', () => {
    const m = setup({
      open: true,
      label: 'More actions',
      items: [
        { id: 'rename', label: 'Rename' },
        { id: 'duplicate', label: 'Duplicate' },
      ],
    });
    fireEvent.click(m.items()[0]!);
    expect(m.onAction).toHaveBeenCalledWith('rename');
    expect(m.onOpenChange).toHaveBeenCalledWith(false, 'action');
    expect(m.onOpenChange.mock.invocationCallOrder[0]!).toBeLessThan(m.onAction.mock.invocationCallOrder[0]!);
  });

  it('a-disabled-item-does-nothing', () => {
    const m = setup({
      open: true,
      label: 'More actions',
      items: [
        { id: 'rename', label: 'Rename', disabled: true },
        { id: 'duplicate', label: 'Duplicate' },
      ],
    });
    const item = m.items()[0]!;
    expect(item).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(item);
    expect(m.onAction).not.toHaveBeenCalled();
  });

  it('escape-closes-without-choosing', () => {
    const m = setup({
      open: true,
      label: 'More actions',
      items: [
        { id: 'rename', label: 'Rename' },
        { id: 'duplicate', label: 'Duplicate' },
      ],
    });
    fireEvent.keyDown(document.activeElement ?? screen.getByRole('menu'), { key: 'Escape' });
    expect(m.onAction).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'More actions' }));
  });

  it('the-popup-is-a-menu', () => {
    setup({ open: true, label: 'More actions', items: [{ id: 'rename', label: 'Rename' }] });
    expect(screen.getByRole('menu', { name: 'More actions' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
  });

  it('renders', () => {
    const m = setup();
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-variant-ghost', () => {
    const m = setup({ triggerVariant: 'ghost' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-variant-secondary', () => {
    const m = setup({ triggerVariant: 'secondary' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-variant-primary', () => {
    const m = setup({ triggerVariant: 'primary' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-icon-ellipsis', () => {
    const m = setup({ triggerIcon: 'ellipsis' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-icon-chevron-down', () => {
    const m = setup({ triggerIcon: 'chevron-down' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-trigger-icon-none', () => {
    const m = setup({ triggerIcon: 'none' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-bottom-start', () => {
    const m = setup({ placement: 'bottom-start' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-bottom-end', () => {
    const m = setup({ placement: 'bottom-end' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-top-start', () => {
    const m = setup({ placement: 'top-start' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-top-end', () => {
    const m = setup({ placement: 'top-end' });
    expect(m.root()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const m = setup();
    expect(screen.getByRole('button', { name: m.props.label })).toHaveAccessibleName(m.props.label);
  });

  it('escape-fires-on-open-change', () => {
    const m = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? screen.getByRole('menu'), { key: 'Escape' });
    expect(m.onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });
});
