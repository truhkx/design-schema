/**
 * TreeGrid — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { TreeGrid } from './TreeGrid';
import meta from './TreeGrid.stories';

type Props = ComponentProps<typeof TreeGrid>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const utils = render(<TreeGrid {...props} />);
  return { ...utils, props, grid: () => screen.getByRole('treegrid') };
}

const part = (name: string): Element | null => document.querySelector(`[data-part="${name}"]`);

describe('TreeGrid', () => {
  it('the-expand-button-expands-a-row', () => {
    const onExpandChange = vi.fn();
    setup({
      defaultExpanded: [],
      columns: [
        { key: 'account', header: 'Account', isRowHeader: true },
        { key: 'balance', header: 'Balance', align: 'end' },
      ],
      data: [{ id: 'assets', account: 'Assets', balance: 100, children: [{ id: 'cash', account: 'Cash', balance: 40 }] }],
      onExpandChange,
    });
    expect(part('expandButton')).not.toBeNull();
    fireEvent.click(part('expandButton')!);
    expect(onExpandChange).toHaveBeenCalledWith(['assets']);
  });

  it('expanding-a-lazy-row-asks-for-its-children', () => {
    const onExpand = vi.fn();
    const onExpandChange = vi.fn();
    setup({
      defaultExpanded: [],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: 'lazy' }],
      onExpand,
      onExpandChange,
    });
    expect(part('expandButton')).not.toBeNull();
    fireEvent.click(part('expandButton')!);
    expect(onExpand).toHaveBeenCalledWith('assets');
    expect(onExpandChange).toHaveBeenCalledWith(['assets']);
  });

  it('a-collapsed-parent-row-reports-it', () => {
    setup({
      defaultExpanded: [],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: [{ id: 'cash', account: 'Cash' }] }],
    });
    expect(part('row')).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-expanded-parent-row-reports-it', () => {
    setup({
      defaultExpanded: ['assets'],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: [{ id: 'cash', account: 'Cash' }] }],
    });
    expect(part('row')).toHaveAttribute('aria-expanded', 'true');
  });

  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = vi.fn();
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
    expect(part('sortButton')).not.toBeNull();
    fireEvent.click(part('sortButton')!);
    expect(onSortChange).toHaveBeenCalledWith('balance', 'ascending');
  });

  it('selecting-a-row-reports-the-selection', () => {
    const onSelectionChange = vi.fn();
    setup({
      selectable: 'row',
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [
        { id: 'assets', account: 'Assets' },
        { id: 'equity', account: 'Equity' },
      ],
      onSelectionChange,
    });
    expect(part('selectCell')).not.toBeNull();
    fireEvent.click(part('selectCell')!);
    expect(onSelectionChange).toHaveBeenCalledWith(['assets']);
  });

  it('a-selected-row-is-marked-selected', () => {
    setup({
      selectable: 'row',
      selected: ['assets'],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [
        { id: 'assets', account: 'Assets' },
        { id: 'equity', account: 'Equity' },
      ],
    });
    expect(part('row')).toHaveAttribute('aria-selected', 'true');
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [{ key: 'account', header: 'Account', isRowHeader: true }], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeInTheDocument();
  });

  /* derived */
  it('renders', () => {
    expect(setup().grid()).toBeInTheDocument();
  });

  it('renders-caption-level-2', () => {
    expect(setup({ captionLevel: '2' }).grid()).toBeInTheDocument();
  });

  it('renders-caption-level-3', () => {
    expect(setup({ captionLevel: '3' }).grid()).toBeInTheDocument();
  });

  it('renders-caption-level-4', () => {
    expect(setup({ captionLevel: '4' }).grid()).toBeInTheDocument();
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
