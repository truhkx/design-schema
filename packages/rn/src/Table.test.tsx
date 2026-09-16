/**
 * Table — behavior scenarios from the component doc, one test each, in the doc's order.
 * `loading-marks-the-table-busy` is web-only (the parser narrows it); on native the list
 * carries `accessibilityState.busy` instead of aria-busy.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Table } from './Table';
import type { TableProps } from './Table';
import meta from './Table.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TableProps> = {}) {
  const props: TableProps = { ...(meta.args as TableProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Table {...props} />
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

describe('Table', () => {
  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = jest.fn();
    setup({
      columns: [
        { key: 'invoice', header: 'Invoice', isRowHeader: true },
        { key: 'amount', header: 'Amount', sortable: true, align: 'end' },
      ],
      data: [
        { id: 'a', invoice: 'INV-1', amount: 100 },
        { id: 'b', invoice: 'INV-2', amount: 200 },
      ],
      onSortChange,
    });
    const sortButton = screen.getAllByTestId('Table.sortButton')[0]!;
    fireEvent.press(within(sortButton).getByRole('button'));
    expect(onSortChange).toHaveBeenCalledWith('amount', 'ascending');
  });

  it('selecting-a-row-reports-every-selected-id', () => {
    const onSelectionChange = jest.fn();
    setup({
      selectable: 'multiple',
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
      onSelectionChange,
    });
    const selectCell = screen.getAllByTestId('Table.selectCell')[0]!;
    fireEvent.press(within(selectCell).getByRole('checkbox'));
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
  });

  it('select-all-reports-the-whole-selection', () => {
    const onSelectionChange = jest.fn();
    setup({
      selectable: 'multiple',
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
      onSelectionChange,
    });
    const selectAllCell = screen.getAllByTestId('Table.selectAllCell')[0]!;
    fireEvent.press(within(selectAllCell).getByRole('checkbox'));
    expect(onSelectionChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeTruthy();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ emptyMessage: 'No invoices yet.', columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }], data: [] });
    expect(screen.getByText('No invoices yet.')).toBeTruthy();
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
  it('renders-selectable-single', () => {
    const s = setup({ selectable: 'single' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-selectable-multiple', () => {
    const s = setup({ selectable: 'multiple' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-responsive-stack', () => {
    const s = setup({ responsive: 'stack' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-responsive-scroll', () => {
    const s = setup({ responsive: 'scroll' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-max-height-none', () => {
    const s = setup({ maxHeight: 'none' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-max-height-viewport', () => {
    const s = setup({ maxHeight: 'viewport' });
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
  it('has-accessible-name', () => {
    const s = setup();
    const list = screen.getByTestId('Table.table');
    expect(list.props.accessibilityRole).toBe('list');
    expect(list.props.accessibilityLabel).toBe(s.props.caption);
  });
});
