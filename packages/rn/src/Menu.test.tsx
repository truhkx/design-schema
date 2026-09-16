/**
 * Menu — behavior scenarios from the component doc, one test each, in the doc's
 * order. On native a click is `fireEvent.press`; the test renderer's window is wider
 * than `layout.maxWidth.prose`, so the anchored popup (not ActionSheet) is what renders.
 * See generated/prompts/Menu.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Menu } from './Menu';
import type { MenuProps } from './Menu';
import meta from './Menu.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with every event spied. */
function setup(given: Partial<MenuProps> = {}) {
  const onAction = jest.fn();
  const onOpenChange = jest.fn();
  const props: MenuProps = { ...(meta.args as MenuProps), onAction, onOpenChange, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Menu {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onAction, onOpenChange, item: () => screen.getAllByRole('menuitem')[0]! };
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
    fireEvent.press(m.item());
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
    expect(m.item()).toBeDisabled();
    fireEvent.press(m.item());
    expect(m.onAction).not.toHaveBeenCalled();
  });

  it('the-popup-is-a-menu', () => {
    setup({ open: true, label: 'More actions', items: [{ id: 'rename', label: 'Rename' }] });
    const popup = screen.getByTestId('Menu.popup');
    expect(popup.props.role).toBe('menu');
    expect(popup.props.accessibilityLabel).toBe('More actions');
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeOnTheScreen();
  });

  /* derived: a11y.role */
  it('renders', () => {
    const m = setup();
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.triggerVariant */
  it('renders-trigger-variant-ghost', () => {
    const m = setup({ triggerVariant: 'ghost' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-trigger-variant-secondary', () => {
    const m = setup({ triggerVariant: 'secondary' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-trigger-variant-primary', () => {
    const m = setup({ triggerVariant: 'primary' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.triggerIcon */
  it('renders-trigger-icon-ellipsis', () => {
    const m = setup({ triggerIcon: 'ellipsis' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-trigger-icon-chevron-down', () => {
    const m = setup({ triggerIcon: 'chevron-down' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-trigger-icon-none', () => {
    const m = setup({ triggerIcon: 'none' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', () => {
    const m = setup({ placement: 'bottom-start' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-bottom-end', () => {
    const m = setup({ placement: 'bottom-end' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-top-start', () => {
    const m = setup({ placement: 'top-start' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-top-end', () => {
    const m = setup({ placement: 'top-end' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const m = setup();
    expect(screen.getByLabelText(m.props.label)).toBeOnTheScreen();
  });
});
