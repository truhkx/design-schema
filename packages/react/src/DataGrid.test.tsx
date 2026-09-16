/**
 * DataGrid — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { DataGrid } from './DataGrid';
import meta from './DataGrid.stories';

type Props = ComponentProps<typeof DataGrid>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const utils = render(<DataGrid {...props} />);
  return { ...utils, props, grid: () => screen.getByRole('grid') };
}

describe('DataGrid', () => {
  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = vi.fn();
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
    const sortButton = document.querySelector('[data-part="sortButton"]');
    expect(sortButton).not.toBeNull();
    fireEvent.click(sortButton!);
    expect(onSortChange).toHaveBeenCalled();
  });

  it('enter-on-a-sortable-header-sorts', () => {
    const onSortChange = vi.fn();
    const s = setup({
      columns: [
        { key: 'sku', header: 'SKU', isRowHeader: true, sortable: true },
        { key: 'price', header: 'Price', align: 'end' },
      ],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
      onSortChange,
    });
    s.grid().focus();
    fireEvent.keyDown(s.grid(), { key: 'Enter' });
    expect(onSortChange).toHaveBeenCalled();
  });

  it('selecting-a-row-reports-the-selection', () => {
    const onSelectionChange = vi.fn();
    setup({
      selectable: 'row',
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
      onSelectionChange,
    });
    const selectCell = document.querySelector('[data-part="selectCell"]');
    expect(selectCell).not.toBeNull();
    fireEvent.click(selectCell!);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('a-selected-row-is-marked-selected', () => {
    setup({
      selectable: 'row',
      selected: ['a'],
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
    });
    const row = document.querySelector('[data-part="row"]');
    expect(row).toHaveAttribute('aria-selected', 'true');
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeInTheDocument();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ emptyMessage: 'No prices loaded.', columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }], data: [] });
    expect(screen.getByText('No prices loaded.')).toBeInTheDocument();
  });

  it('loading-marks-the-grid-busy', () => {
    const s = setup({ loading: true, columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }], data: [{ id: 'a', sku: 'A-1' }] });
    expect(s.grid()).toHaveAttribute('aria-busy', 'true');
  });

  /* derived */
  it('renders', () => {
    expect(setup().grid()).toBeInTheDocument();
  });

  it('renders-selectable-none', () => {
    expect(setup({ selectable: 'none' }).grid()).toBeInTheDocument();
  });

  it('renders-selectable-row', () => {
    expect(setup({ selectable: 'row' }).grid()).toBeInTheDocument();
  });

  it('renders-selectable-cell', () => {
    expect(setup({ selectable: 'cell' }).grid()).toBeInTheDocument();
  });

  it('renders-selectable-range', () => {
    expect(setup({ selectable: 'range' }).grid()).toBeInTheDocument();
  });

  it('renders-density-compact', () => {
    expect(setup({ density: 'compact' }).grid()).toBeInTheDocument();
  });

  it('renders-density-comfortable', () => {
    expect(setup({ density: 'comfortable' }).grid()).toBeInTheDocument();
  });

  it('renders-height-content', () => {
    expect(setup({ height: 'content' }).grid()).toBeInTheDocument();
  });

  it('renders-height-viewport', () => {
    expect(setup({ height: 'viewport' }).grid()).toBeInTheDocument();
  });

  it('renders-height-fixed', () => {
    expect(setup({ height: 'fixed' }).grid()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.grid()).toHaveAccessibleName(s.props.caption);
  });
});
