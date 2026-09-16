/**
 * <ds-table> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './Table.js';
import type {
  DsTable,
  TableSelectionChangeDetail,
  TableSortChangeDetail,
} from './Table.js';
import meta from './Table.stories.js';

type Given = Partial<
  Pick<
    DsTable,
    | 'caption'
    | 'captionLevel'
    | 'columns'
    | 'data'
    | 'selectable'
    | 'responsive'
    | 'maxHeight'
    | 'density'
    | 'emptyMessage'
    | 'loading'
  >
>;

type Updatable = HTMLElement & { updateComplete: Promise<boolean> };

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-table');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const sortChange = vi.fn<(event: CustomEvent<TableSortChangeDetail>) => void>();
  const selectionChange = vi.fn<(event: CustomEvent<TableSelectionChangeDetail>) => void>();
  el.addEventListener('sort-change', sortChange as unknown as EventListener);
  el.addEventListener('selection-change', selectionChange as unknown as EventListener);
  document.body.append(el);
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
    table: (): HTMLTableElement => root.querySelector('table')!,
  };
}

/** The native checkbox inside a selection cell's ds-checkbox. */
function checkboxIn(cell: HTMLElement | null | undefined): HTMLInputElement {
  return cell!.querySelector('ds-checkbox')!.shadowRoot!.querySelector<HTMLInputElement>('input')!;
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-table', () => {
  it('activating-a-sortable-header-reports-the-sort', async () => {
    const s = await setup({
      columns: [
        { key: 'invoice', header: 'Invoice', isRowHeader: true },
        { key: 'amount', header: 'Amount', sortable: true, align: 'end' },
      ],
      data: [
        { id: 'a', invoice: 'INV-1', amount: 100 },
        { id: 'b', invoice: 'INV-2', amount: 200 },
      ],
    });
    const sortButton = s.part('sortButton')!;
    sortButton.shadowRoot!.querySelector('button')!.click();
    await s.el.updateComplete;
    expect(s.sortChange).toHaveBeenCalledTimes(1);
    expect(s.sortChange.mock.calls[0]![0].detail).toEqual({ column: 'amount', direction: 'ascending' });
  });

  it('selecting-a-row-reports-every-selected-id', async () => {
    const s = await setup({
      selectable: 'multiple',
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
    });
    checkboxIn(s.parts('selectCell')[0]).click();
    await s.el.updateComplete;
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual({ selected: ['a'] });
  });

  it('select-all-reports-the-whole-selection', async () => {
    const s = await setup({
      selectable: 'multiple',
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [
        { id: 'a', invoice: 'INV-1' },
        { id: 'b', invoice: 'INV-2' },
      ],
    });
    checkboxIn(s.part('selectAllCell')).click();
    await s.el.updateComplete;
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual({ selected: ['a', 'b'] });
  });

  it('the-empty-message-shows-when-there-are-no-rows', async () => {
    const s = await setup({
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [],
    });
    expect(s.part('emptyState')).toHaveTextContent('Nothing to show.');
  });

  it('a-custom-empty-message-replaces-the-default', async () => {
    const s = await setup({
      emptyMessage: 'No invoices yet.',
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [],
    });
    expect(s.part('emptyState')).toHaveTextContent('No invoices yet.');
  });

  it('loading-marks-the-table-busy', async () => {
    const s = await setup({
      loading: true,
      columns: [{ key: 'invoice', header: 'Invoice', isRowHeader: true }],
      data: [{ id: 'a', invoice: 'INV-1' }],
    });
    expect(s.table()).toHaveAttribute('aria-busy', 'true');
    expect(s.parts('row')).toHaveLength(1);
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'Table');
    expect(s.table()).toHaveAttribute('role', 'table');
  });

  /* derived: props.captionLevel */
  it('renders-caption-level-2', async () => {
    const s = await setup({ captionLevel: '2' });
    expect(s.part('caption')!.querySelector('ds-heading')).toHaveAttribute('level', '2');
  });

  it('renders-caption-level-3', async () => {
    const s = await setup({ captionLevel: '3' });
    expect(s.part('caption')!.querySelector('ds-heading')).toHaveAttribute('level', '3');
  });

  it('renders-caption-level-4', async () => {
    const s = await setup({ captionLevel: '4' });
    expect(s.part('caption')!.querySelector('ds-heading')).toHaveAttribute('level', '4');
  });

  /* derived: props.selectable */
  it('renders-selectable-none', async () => {
    const s = await setup({ selectable: 'none' });
    expect(s.el).toHaveAttribute('selectable', 'none');
    expect(s.parts('selectCell')).toHaveLength(0);
  });

  it('renders-selectable-single', async () => {
    const s = await setup({ selectable: 'single' });
    expect(s.el).toHaveAttribute('selectable', 'single');
    expect(s.part('selectAllCell')).toBeNull();
    expect(s.parts('selectCell').length).toBeGreaterThan(0);
  });

  it('renders-selectable-multiple', async () => {
    const s = await setup({ selectable: 'multiple' });
    expect(s.el).toHaveAttribute('selectable', 'multiple');
    expect(s.part('selectAllCell')).not.toBeNull();
  });

  /* derived: props.responsive */
  it('renders-responsive-stack', async () => {
    const s = await setup({ responsive: 'stack' });
    expect(s.el).toHaveAttribute('responsive', 'stack');
    expect(s.part('scrollRegion')).toBeNull();
  });

  it('renders-responsive-scroll', async () => {
    const s = await setup({ responsive: 'scroll' });
    expect(s.el).toHaveAttribute('responsive', 'scroll');
    expect(s.part('scrollRegion')).toHaveAttribute('role', 'region');
  });

  /* derived: props.maxHeight */
  it('renders-max-height-none', async () => {
    const s = await setup({ maxHeight: 'none' });
    expect(s.el).toHaveAttribute('max-height', 'none');
  });

  it('renders-max-height-viewport', async () => {
    const s = await setup({ maxHeight: 'viewport' });
    expect(s.el).toHaveAttribute('max-height', 'viewport');
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

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.table()).toHaveAccessibleName(s.props.caption);
  });
});
