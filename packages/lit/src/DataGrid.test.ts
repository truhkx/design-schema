/**
 * <ds-data-grid> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './DataGrid.js';
import type { DataGridSelectionChangeDetail, DataGridSortChangeDetail, DsDataGrid } from './DataGrid.js';
import meta from './DataGrid.stories.js';

type Given = Partial<
  Pick<DsDataGrid, 'caption' | 'columns' | 'data' | 'selectable' | 'selected' | 'density' | 'height' | 'emptyMessage' | 'loading'>
>;

type Updatable = HTMLElement & { updateComplete: Promise<boolean> };

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-data-grid');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const sortChange = vi.fn<(event: CustomEvent<DataGridSortChangeDetail>) => void>();
  const selectionChange = vi.fn<(event: CustomEvent<DataGridSelectionChangeDetail>) => void>();
  el.addEventListener('sort-change', sortChange as unknown as EventListener);
  el.addEventListener('selection-change', selectionChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  await el.updateComplete;
  const root = el.shadowRoot!;
  await Promise.all(
    [...root.querySelectorAll<Updatable>('ds-button, ds-checkbox, ds-heading, ds-text')].map((child) => child.updateComplete),
  );
  return {
    el,
    props,
    sortChange,
    selectionChange,
    part: <T extends Element = HTMLElement>(name: string): T | null => root.querySelector<T>(`[data-part="${name}"]`),
    parts: (name: string): HTMLElement[] => [...root.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)],
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-data-grid', () => {
  it('activating-a-sortable-header-reports-the-sort', async () => {
    const s = await setup({
      columns: [
        { key: 'sku', header: 'SKU', isRowHeader: true },
        { key: 'price', header: 'Price', align: 'end', sortable: true },
      ],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
    });
    s.part('sortButton')!.shadowRoot!.querySelector('button')!.click();
    await s.el.updateComplete;
    expect(s.sortChange).toHaveBeenCalledTimes(1);
    expect(s.sortChange.mock.calls[0]![0].detail).toEqual({ column: 'price', direction: 'ascending' });
  });

  it('enter-on-a-sortable-header-sorts', async () => {
    const s = await setup({
      columns: [
        { key: 'sku', header: 'SKU', isRowHeader: true, sortable: true },
        { key: 'price', header: 'Price', align: 'end' },
      ],
      data: [
        { id: 'a', sku: 'A-1', price: 10 },
        { id: 'b', sku: 'B-2', price: 20 },
      ],
    });
    s.el.focus();
    await userEvent.keyboard('{Enter}');
    await s.el.updateComplete;
    expect(s.sortChange).toHaveBeenCalledTimes(1);
    expect(s.sortChange.mock.calls[0]![0].detail).toEqual({ column: 'sku', direction: 'ascending' });
  });

  it('selecting-a-row-reports-the-selection', async () => {
    const s = await setup({
      selectable: 'row',
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [
        { id: 'a', sku: 'A-1' },
        { id: 'b', sku: 'B-2' },
      ],
    });
    s.parts('selectCell')[0]!.querySelector('ds-checkbox')!.shadowRoot!.querySelector('input')!.click();
    await s.el.updateComplete;
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual({ selection: ['a'] });
  });

  it('the-empty-message-shows-when-there-are-no-rows', async () => {
    const s = await setup({
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [],
    });
    expect(s.part('emptyState')).toHaveTextContent('Nothing to show.');
  });

  it('a-custom-empty-message-replaces-the-default', async () => {
    const s = await setup({
      emptyMessage: 'No prices loaded.',
      columns: [{ key: 'sku', header: 'SKU', isRowHeader: true }],
      data: [],
    });
    expect(s.part('emptyState')).toHaveTextContent('No prices loaded.');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'DataGrid');
    expect(s.part('grid')).toHaveAttribute('role', 'grid');
    expect(s.parts('row').length).toBeGreaterThan(0);
  });

  /* derived: props.selectable */
  it('renders-selectable-none', async () => {
    const s = await setup({ selectable: 'none' });
    expect(s.el).toHaveAttribute('selectable', 'none');
    expect(s.parts('selectCell')).toHaveLength(0);
  });

  it('renders-selectable-row', async () => {
    const s = await setup({ selectable: 'row' });
    expect(s.el).toHaveAttribute('selectable', 'row');
    expect(s.part('selectAllCell')).not.toBeNull();
    expect(s.parts('selectCell').length).toBeGreaterThan(0);
  });

  it('renders-selectable-cell', async () => {
    const s = await setup({ selectable: 'cell' });
    expect(s.el).toHaveAttribute('selectable', 'cell');
    expect(s.part('grid')).toHaveAttribute('aria-multiselectable', 'false');
  });

  it('renders-selectable-range', async () => {
    const s = await setup({ selectable: 'range' });
    expect(s.el).toHaveAttribute('selectable', 'range');
    expect(s.part('grid')).toHaveAttribute('aria-multiselectable', 'true');
  });

  /* derived: props.density */
  it('renders-density-compact', async () => {
    const s = await setup({ density: 'compact' });
    expect(s.el).toHaveAttribute('density', 'compact');
  });

  it('renders-density-comfortable', async () => {
    const s = await setup({ density: 'comfortable' });
    expect(s.el).toHaveAttribute('density', 'comfortable');
  });

  /* derived: props.height */
  it('renders-height-content', async () => {
    const s = await setup({ height: 'content' });
    expect(s.el).toHaveAttribute('height', 'content');
    expect(s.parts('row')).toHaveLength(s.props.data!.length);
  });

  it('renders-height-viewport', async () => {
    const s = await setup({ height: 'viewport' });
    expect(s.el).toHaveAttribute('height', 'viewport');
  });

  it('renders-height-fixed', async () => {
    const s = await setup({ height: 'fixed' });
    expect(s.el).toHaveAttribute('height', 'fixed');
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.part('grid')).toHaveAccessibleName(s.props.caption);
  });
});
