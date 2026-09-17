/**
 * ActionSheet — behavior scenarios from the component doc, one test each, in the doc's
 * order. `non-dismissible-still-reports-escape` is scoped to web and lit, so it has no
 * test here. See generated/prompts/ActionSheet.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { ActionSheet } from './ActionSheet';
import type { ActionSheetProps } from './ActionSheet';
import meta from './ActionSheet.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ActionSheetProps> = {}) {
  const onAction = jest.fn();
  const onClose = jest.fn();
  const props: ActionSheetProps = { ...(meta.args as ActionSheetProps), onAction, onClose, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <ActionSheet {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onAction, onClose };
}

describe('ActionSheet', () => {
  it('choosing-an-action-fires-on-action', () => {
    const d = setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
        { id: 'delete', label: 'Delete photo', tone: 'danger' },
      ],
    });
    fireEvent.press(screen.getAllByTestId('ActionSheet.item')[0]!);
    expect(d.onAction).toHaveBeenCalledWith('share');
  });

  it('the-cancel-row-fires-on-close', () => {
    const d = setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    fireEvent.press(within(screen.getByTestId('ActionSheet.cancelButton')).getByRole('button'));
    expect(d.onClose).toHaveBeenCalledWith('cancel');
    expect(d.onAction).not.toHaveBeenCalled();
  });

  it('the-cancel-row-is-named-from-copy', () => {
    setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    expect(within(screen.getByTestId('ActionSheet.cancelButton')).getByLabelText('Cancel')).toBeTruthy();
  });

  it('the-list-is-a-menu', () => {
    setup({
      open: true,
      heading: 'Photo.jpg',
      actions: [
        { id: 'share', label: 'Share' },
        { id: 'rename', label: 'Rename' },
      ],
    });
    // The surface must not be `accessible` (that would merge its rows into one element),
    // so RNTL's role query skips it; assert the role prop on the surface instead.
    expect(screen.getByTestId('ActionSheet').props.role).toBe('menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('closed-sheet-renders-nothing', () => {
    setup({ open: false, actions: [{ id: 'share', label: 'Share' }] });
    expect(screen.queryByTestId('ActionSheet')).toBeNull();
    expect(screen.queryByText('Share')).toBeNull();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('ActionSheet')).toBeTruthy();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByTestId('ActionSheet').props.accessibilityLabel).toBe(d.props.heading);
  });
});
