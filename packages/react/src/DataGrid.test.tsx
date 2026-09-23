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

const skuHeader = { key: 'sku', header: 'SKU', isRowHeader: true };

describe('DataGrid', () => {
  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = vi.fn();
    const s = setup({
      columns: [skuHeader, { key: 'price', header: 'Price', align: 'end', sortable: true }],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
      onSortChange,
    });
    const part = s.container.querySelector('[data-part="sortButton"]');
    expect(part).not.toBeNull();
    fireEvent.click(part!);
    expect(onSortChange).toHaveBeenCalledWith('price', 'ascending');
  });

  it('enter-on-a-sortable-header-sorts', () => {
    const onSortChange = vi.fn();
    const s = setup({
      columns: [{ ...skuHeader, sortable: true }, { key: 'price', header: 'Price', align: 'end' }],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
      onSortChange,
    });
    const grid = s.grid();
    grid.focus();
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onSortChange).toHaveBeenCalledWith('sku', 'ascending');
  });

  it('selecting-a-row-reports-the-selection', () => {
    const onSelectionChange = vi.fn();
    const s = setup({
      selectable: 'row',
      columns: [skuHeader],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
      onSelectionChange,
    });
    const part = s.container.querySelector('[data-part="selectCell"]');
    expect(part).not.toBeNull();
    fireEvent.click(part!);
    expect(onSelectionChange).toHaveBeenCalledWith(['a']);
  });

  it('a-selected-row-is-marked-selected', () => {
    const s = setup({
      selectable: 'row',
      selected: ['a'],
      columns: [skuHeader],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
    });
    const row = s.container.querySelector('[data-part="row"]');
    expect(row).not.toBeNull();
    expect(row!.getAttribute('aria-selected')).toBe('true');
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [skuHeader], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeTruthy();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ emptyMessage: 'No prices loaded.', columns: [skuHeader], data: [] });
    expect(screen.getByText('No prices loaded.')).toBeTruthy();
  });

  it('loading-marks-the-grid-busy', () => {
    const s = setup({ loading: true, columns: [skuHeader], data: [{ id: 'a', sku: 'A-1' }] });
    expect(s.grid().getAttribute('aria-busy')).toBe('true');
  });

  it('renders', () => {
    const s = setup();
    expect(s.grid()).toBeTruthy();
  });

  it.each([
    ['renders-caption-level-2', { captionLevel: '2' }],
    ['renders-caption-level-3', { captionLevel: '3' }],
    ['renders-caption-level-4', { captionLevel: '4' }],
    ['renders-selectable-none', { selectable: 'none' }],
    ['renders-selectable-row', { selectable: 'row' }],
    ['renders-selectable-cell', { selectable: 'cell' }],
    ['renders-selectable-range', { selectable: 'range' }],
    ['renders-density-compact', { density: 'compact' }],
    ['renders-density-comfortable', { density: 'comfortable' }],
    ['renders-height-content', { height: 'content' }],
    ['renders-height-viewport', { height: 'viewport' }],
    ['renders-height-fixed', { height: 'fixed' }],
  ] as [string, Partial<Props>][])('%s', (_name, given) => {
    const s = setup(given);
    expect(s.grid()).toBeTruthy();
  });

  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('grid', { name: meta.args!.caption as string })).toBeTruthy();
  });
});
