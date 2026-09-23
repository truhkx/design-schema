/**
 * <ds-tree-grid> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './TreeGrid.js';
import type {
  DsTreeGrid,
  TreeGridExpandChangeDetail,
  TreeGridExpandDetail,
  TreeGridSelectionChangeDetail,
  TreeGridSortChangeDetail,
} from './TreeGrid.js';
import meta from './TreeGrid.stories.js';

type Given = Partial<
  Pick<
    DsTreeGrid,
    | 'caption'
    | 'captionLevel'
    | 'columns'
    | 'data'
    | 'defaultExpanded'
    | 'selectable'
    | 'selected'
    | 'density'
    | 'height'
  >
>;

type Updatable = HTMLElement & { updateComplete: Promise<boolean> };

/**
 * The `expandButton` part is the span around the composed Button, so the click goes to the Button's own
 * `<button>`; its composed native click is what reaches the span's handler.
 */
function clickExpand(part: HTMLElement): void {
  part.querySelector('ds-button')!.shadowRoot!.querySelector('button')!.click();
}

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-tree-grid');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const expandChange = vi.fn<(event: CustomEvent<TreeGridExpandChangeDetail>) => void>();
  const expand = vi.fn<(event: CustomEvent<TreeGridExpandDetail>) => void>();
  const sortChange = vi.fn<(event: CustomEvent<TreeGridSortChangeDetail>) => void>();
  const selectionChange = vi.fn<(event: CustomEvent<TreeGridSelectionChangeDetail>) => void>();
  const order: string[] = [];
  el.addEventListener('expand-change', ((event: CustomEvent<TreeGridExpandChangeDetail>) => {
    order.push('expand-change');
    expandChange(event);
  }) as EventListener);
  el.addEventListener('expand', ((event: CustomEvent<TreeGridExpandDetail>) => {
    order.push('expand');
    expand(event);
  }) as EventListener);
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
    order,
    expandChange,
    expand,
    sortChange,
    selectionChange,
    part: <T extends Element = HTMLElement>(name: string): T | null => root.querySelector<T>(`[data-part="${name}"]`),
    parts: (name: string): HTMLElement[] => [...root.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)],
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-tree-grid', () => {
  it('the-expand-button-expands-a-row', async () => {
    const s = await setup({
      defaultExpanded: [],
      columns: [
        { key: 'account', header: 'Account', isRowHeader: true },
        { key: 'balance', header: 'Balance', align: 'end' },
      ],
      data: [
        { id: 'assets', account: 'Assets', balance: 100, children: [{ id: 'cash', account: 'Cash', balance: 40 }] },
      ],
    });
    clickExpand(s.part('expandButton')!);
    await s.el.updateComplete;
    expect(s.expandChange).toHaveBeenCalledTimes(1);
    expect(s.expandChange.mock.calls[0]![0].detail).toEqual(['assets']);
  });

  it('expanding-a-lazy-row-asks-for-its-children', async () => {
    const s = await setup({
      defaultExpanded: [],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: 'lazy' }],
    });
    clickExpand(s.part('expandButton')!);
    await s.el.updateComplete;
    expect(s.expand).toHaveBeenCalledTimes(1);
    expect(s.expand.mock.calls[0]![0].detail).toBe('assets');
    expect(s.expandChange).toHaveBeenCalledTimes(1);
    expect(s.expandChange.mock.calls[0]![0].detail).toEqual(['assets']);
    expect(s.order).toEqual(['expand', 'expand-change']);
  });

  /* A lazy row cannot be opened programmatically: its id in `defaultExpanded`/`expanded` waits for a user act. */
  it('a-lazy-id-in-default-expanded-is-held-collapsed', async () => {
    const s = await setup({
      defaultExpanded: ['assets'],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: 'lazy' }],
    });
    expect(s.parts('row')).toHaveLength(1);
    expect(s.parts('row')[0]!).toHaveAttribute('aria-expanded', 'false');
    expect(s.expand).not.toHaveBeenCalled();
    clickExpand(s.part('expandButton')!);
    await s.el.updateComplete;
    expect(s.expand.mock.calls[0]![0].detail).toBe('assets');
    expect(s.expandChange.mock.calls[0]![0].detail).toEqual(['assets']);
    expect(s.parts('row')).toHaveLength(2);
  });

  /* web-only doc scenarios: Lit renders the web DOM, so they apply here too */
  it('a-collapsed-parent-row-reports-it', async () => {
    const s = await setup({
      defaultExpanded: [],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: [{ id: 'cash', account: 'Cash' }] }],
    });
    expect(s.parts('row')[0]!).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-expanded-parent-row-reports-it', async () => {
    const s = await setup({
      defaultExpanded: ['assets'],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [{ id: 'assets', account: 'Assets', children: [{ id: 'cash', account: 'Cash' }] }],
    });
    expect(s.parts('row')[0]!).toHaveAttribute('aria-expanded', 'true');
    expect(s.parts('row')[1]!).not.toHaveAttribute('aria-expanded');
  });

  it('a-selected-row-is-marked-selected', async () => {
    const s = await setup({
      selectable: 'row',
      selected: ['assets'],
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [
        { id: 'assets', account: 'Assets' },
        { id: 'equity', account: 'Equity' },
      ],
    });
    expect(s.parts('row')[0]!).toHaveAttribute('aria-selected', 'true');
    expect(s.parts('row')[1]!).toHaveAttribute('aria-selected', 'false');
  });

  it('activating-a-sortable-header-reports-the-sort', async () => {
    const s = await setup({
      columns: [
        { key: 'account', header: 'Account', isRowHeader: true },
        { key: 'balance', header: 'Balance', align: 'end', sortable: true },
      ],
      data: [
        { id: 'assets', account: 'Assets', balance: 100 },
        { id: 'equity', account: 'Equity', balance: 50 },
      ],
    });
    s.part('sortButton')!.shadowRoot!.querySelector('button')!.click();
    await s.el.updateComplete;
    expect(s.sortChange).toHaveBeenCalledTimes(1);
    expect(s.sortChange.mock.calls[0]![0].detail).toEqual({ column: 'balance', direction: 'ascending' });
  });

  it('selecting-a-row-reports-the-selection', async () => {
    const s = await setup({
      selectable: 'row',
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [
        { id: 'assets', account: 'Assets' },
        { id: 'equity', account: 'Equity' },
      ],
    });
    s.parts('selectCell')[0]!.shadowRoot!.querySelector('input')!.click();
    await s.el.updateComplete;
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual({ selection: ['assets'] });
  });

  it('the-empty-message-shows-when-there-are-no-rows', async () => {
    const s = await setup({
      columns: [{ key: 'account', header: 'Account', isRowHeader: true }],
      data: [],
    });
    expect(s.part('emptyState')).toHaveTextContent('Nothing to show.');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'TreeGrid');
    expect(s.part('grid')).toHaveAttribute('role', 'treegrid');
    expect(s.parts('row').length).toBeGreaterThan(0);
  });

  /* derived: props.captionLevel */
  it('renders-caption-level-2', async () => {
    const s = await setup({ captionLevel: '2' });
    expect(s.el).toHaveAttribute('caption-level', '2');
    expect(s.part('caption')!.querySelector('ds-heading')!.shadowRoot!.querySelector('h2')).not.toBeNull();
  });

  it('renders-caption-level-3', async () => {
    const s = await setup({ captionLevel: '3' });
    expect(s.el).toHaveAttribute('caption-level', '3');
    expect(s.part('caption')!.querySelector('ds-heading')!.shadowRoot!.querySelector('h3')).not.toBeNull();
  });

  it('renders-caption-level-4', async () => {
    const s = await setup({ captionLevel: '4' });
    expect(s.el).toHaveAttribute('caption-level', '4');
    expect(s.part('caption')!.querySelector('ds-heading')!.shadowRoot!.querySelector('h4')).not.toBeNull();
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
    expect(s.parts('row').length).toBeGreaterThan(0);
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
