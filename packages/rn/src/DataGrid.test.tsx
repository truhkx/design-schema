/**
 * DataGrid — behavior scenarios from the component doc, one test each, in the doc's order.
 * `enter-on-a-sortable-header-sorts`, `a-selected-row-is-marked-selected` and
 * `loading-marks-the-grid-busy` are web/Lit only (the parser narrows them). A click is a `press`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DataGrid } from './DataGrid';
import type { DataGridProps } from './DataGrid';
import meta from './DataGrid.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<DataGridProps> = {}) {
  const props: DataGridProps = { ...(meta.args as DataGridProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <DataGrid {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe('DataGrid', () => {
  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = jest.fn();
    setup({
      columns: [
        { key: 'sku', header: 'SKU', isRowHeader: true },
        { key: 'price', header: 'Price', align: 'end', sortable: true },
      ],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
      onSortChange,
    });
    fireEvent.press(screen.getAllByTestId('DataGrid.sortButton')[0]!);
    expect(onSortChange).toHaveBeenCalledWith('price', 'ascending');
  });

  it('selecting-a-row-reports-the-selection', () => {
    const onSelectionChange = jest.fn();
    setup({
      selectable: 'row',
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
      onSelectionChange,
    });
    fireEvent.press(screen.getAllByTestId('DataGrid.selectCell')[0]!);
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeTruthy();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ emptyMessage: 'No prices loaded.', columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }], data: [] });
    expect(screen.getByText('No prices loaded.')).toBeTruthy();
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
  it('renders-selectable-range', () => {
    const s = setup({ selectable: 'range' });
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
    const grid = screen.getByTestId('DataGrid.grid');
    expect(grid.props.role).toBe('grid');
    // The caption followed by copy.rowCount: native has no aria-rowcount.
    expect(grid.props.accessibilityLabel).toBe(`${s.props.caption}, 2 rows`);
  });
});
