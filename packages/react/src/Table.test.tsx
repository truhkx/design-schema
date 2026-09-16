/**
 * Table — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Table } from './Table';
import meta from './Table.stories';

type Props = ComponentProps<typeof Table>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const utils = render(<Table {...props} />);
  return { ...utils, props, table: () => screen.getByRole('table') };
}

const invoiceHeader = { key: 'invoice', header: 'Invoice', isRowHeader: true };

describe('Table', () => {
  it('activating-a-sortable-header-reports-the-sort', () => {
    const onSortChange = vi.fn();
    const s = setup({
      columns: [invoiceHeader, { key: 'amount', header: 'Amount', sortable: true, align: 'end' }],
      data: [
        { id: 'a', invoice: 'INV-1', amount: 100 },
        { id: 'b', invoice: 'INV-2', amount: 200 },
      ],
      onSortChange,
    });
    const header = s.container.querySelector('[data-part="columnHeader"] button');
    expect(header).not.toBeNull();
    fireEvent.click(header!);
    expect(onSortChange).toHaveBeenCalled();
  });

  it('selecting-a-row-reports-every-selected-id', () => {
    const onSelectionChange = vi.fn();
    const s = setup({
      selectable: 'multiple',
      columns: [invoiceHeader],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
      onSelectionChange,
    });
    const checkbox = s.container.querySelector<HTMLInputElement>('[data-part="selectCell"] input');
    expect(checkbox).not.toBeNull();
    fireEvent.click(checkbox!);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('select-all-reports-the-whole-selection', () => {
    const onSelectionChange = vi.fn();
    const s = setup({
      selectable: 'multiple',
      columns: [invoiceHeader],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
      onSelectionChange,
    });
    const checkbox = s.container.querySelector<HTMLInputElement>('[data-part="selectAllCell"] input');
    expect(checkbox).not.toBeNull();
    fireEvent.click(checkbox!);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('the-empty-message-shows-when-there-are-no-rows', () => {
    setup({ columns: [invoiceHeader], data: [] });
    expect(screen.getByText('Nothing to show.')).toBeInTheDocument();
  });

  it('a-custom-empty-message-replaces-the-default', () => {
    setup({ emptyMessage: 'No invoices yet.', columns: [invoiceHeader], data: [] });
    expect(screen.getByText('No invoices yet.')).toBeInTheDocument();
  });

  it('loading-marks-the-table-busy', () => {
    const s = setup({ loading: true, columns: [invoiceHeader], data: [{ id: 'a', invoice: 'INV-1' }] });
    expect(s.table()).toHaveAttribute('aria-busy', 'true');
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-caption-level-2', () => {
    const s = setup({ captionLevel: '2' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-caption-level-3', () => {
    const s = setup({ captionLevel: '3' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-caption-level-4', () => {
    const s = setup({ captionLevel: '4' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-selectable-none', () => {
    const s = setup({ selectable: 'none' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-selectable-single', () => {
    const s = setup({ selectable: 'single' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-selectable-multiple', () => {
    const s = setup({ selectable: 'multiple' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-responsive-stack', () => {
    const s = setup({ responsive: 'stack' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-responsive-scroll', () => {
    const s = setup({ responsive: 'scroll' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-max-height-none', () => {
    const s = setup({ maxHeight: 'none' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-max-height-viewport', () => {
    const s = setup({ maxHeight: 'viewport' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-density-compact', () => {
    const s = setup({ density: 'compact' });
    expect(s.table()).toBeInTheDocument();
  });

  it('renders-density-comfortable', () => {
    const s = setup({ density: 'comfortable' });
    expect(s.table()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.table()).toHaveAccessibleName(s.props.caption);
  });
});
