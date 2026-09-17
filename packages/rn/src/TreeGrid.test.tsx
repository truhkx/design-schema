/**
 * TreeGrid — behavior scenarios from the component doc, one test each, in the doc's order.
 * The aria-expanded and aria-selected scenarios are web only (the parser narrows them). A click is a `press`.
 * The expand control is hidden from assistive technology on this platform (the row header's
 * accessibility actions are the screen-reader path), so its queries opt hidden elements back in.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { TreeGrid } from './TreeGrid';
import type { TreeGridProps } from './TreeGrid';
import meta from './TreeGrid.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TreeGridProps> = {}) {
  const props: TreeGridProps = { ...(meta.args as TreeGridProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <TreeGrid {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

/** The expand control of the row at `index`, reached through the accessibility-hidden part. */
function pressExpandButton(index: number): void {
  const part = screen.getAllByTestId('TreeGrid.expandButton', { includeHiddenElements: true })[index]!;
  fireEvent.press(within(part).getByRole('button', { includeHiddenElements: true }));
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe('TreeGrid', () => {
  it('the-expand-button-expands-a-row', () => {
    const onExpandChange = jest.fn();
    setup({
      defaultExpanded: [],
      columns: [
        { key: 'account', header: 'Account', isRowHeader: true },
        { key: 'balance', header: 'Balance', align: 'end' },
      ],
      data: [{ id: 'assets', account: 'Assets', balance: 100, children: [{ id: 'cash', account: 'Cash', balance: 40 }] }],
      onExpandChange,
    });
    pressExpandButton(0);
    expect(onExpandChange).toHaveBeenCalledWith(['assets']);
  });

  it('expanding-a-lazy-row-asks-for-its-children', () => {
    const onExpand = jest.fn();
    const onExpandChange = jest.fn();
    setup({
      defaultExpanded: [],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: 'lazy' }],
      onExpand,
      onExpandChange,
    });
    pressExpandButton(0);
    expect(onExpand).toHaveBeenCalledWith('assets');
    expect(onExpandChange).toHaveBeenCalledWith(['assets']);
    // The placeholder child stands in until `children` arrives.
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = jest.fn();
    setup({
      columns: [
        { key: 'account', header: 'Account', isRowHeader: true },
        { key: 'balance', header: 'Balance', align: 'end', sortable: true },
      ],
      data: [
        { id: 'assets', account: 'Assets', balance: 100 },
        { id: 'equity', account: 'Equity', balance: 50 },
      ],
      onSortChange,
    });
    const sortButton = screen.getAllByTestId('TreeGrid.sortButton')[0]!;
    fireEvent.press(within(sortButton).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith('balance', 'ascending');
  });

  it('selecting-a-row-reports-the-selection', () => {
    const onSelectionChange = jest.fn();
    setup({
      selectable: 'row',
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [
        { id: 'assets', account: 'Assets' },
        { id: 'equity', account: 'Equity' },
      ],
      onSelectionChange,
    });
    const selectCell = screen.getAllByTestId('TreeGrid.selectCell')[0]!;
    fireEvent.press(within(selectCell).getByRole('checkbox'));
    expect(onSelectionChange).toHaveBeenCalledWith(['assets']);
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [{ key: 'account', header: 'Account', isRowHeader: true }], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-caption-level-2', () => {
    const s = setup({ captionLevel: '2' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-caption-level-3', () => {
    const s = setup({ captionLevel: '3' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-caption-level-4', () => {
    const s = setup({ captionLevel: '4' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-selectable-none', () => {
    const s = setup({ selectable: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-selectable-row', () => {
    const s = setup({ selectable: 'row' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-selectable-cell', () => {
    const s = setup({ selectable: 'cell' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-density-compact', () => {
    const s = setup({ density: 'compact' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-density-comfortable', () => {
    const s = setup({ density: 'comfortable' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-height-content', () => {
    const s = setup({ height: 'content' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-height-viewport', () => {
    const s = setup({ height: 'viewport' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-height-fixed', () => {
    const s = setup({ height: 'fixed' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('has-accessible-name', () => {
    const s = setup();
    const grid = screen.getByTestId('TreeGrid.grid');
    expect(grid.props.role).toBe('grid');
    expect(grid.props.accessibilityLabel).toBe(s.props.caption);
  });
});
