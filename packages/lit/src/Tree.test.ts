/**
 * <ds-tree> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './Tree.js';
import type {
  DsTree,
  TreeActivateDetail,
  TreeExpandChangeDetail,
  TreeExpandDetail,
  TreeSelectionChangeDetail,
} from './Tree.js';
import meta from './Tree.stories.js';

type Given = Partial<
  Pick<DsTree, 'label' | 'nodes' | 'defaultExpanded' | 'selectable' | 'selected' | 'selectOnFocus' | 'headingLevel'>
>;

type Updatable = HTMLElement & { updateComplete: Promise<boolean> };

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-tree');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const order: string[] = [];
  const expandChange = vi.fn<(event: CustomEvent<TreeExpandChangeDetail>) => void>();
  const expand = vi.fn<(event: CustomEvent<TreeExpandDetail>) => void>();
  const selectionChange = vi.fn<(event: CustomEvent<TreeSelectionChangeDetail>) => void>();
  const activate = vi.fn<(event: CustomEvent<TreeActivateDetail>) => void>();
  el.addEventListener('expand-change', ((event: CustomEvent<TreeExpandChangeDetail>) => {
    order.push('expand-change');
    expandChange(event);
  }) as EventListener);
  el.addEventListener('expand', ((event: CustomEvent<TreeExpandDetail>) => {
    order.push('expand');
    expand(event);
  }) as EventListener);
  el.addEventListener('selection-change', selectionChange as unknown as EventListener);
  el.addEventListener('activate', activate as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  await Promise.all(
    [...root.querySelectorAll<Updatable>('ds-button, ds-heading, ds-icon, ds-text, ds-link')].map(
      (child) => child.updateComplete,
    ),
  );
  const part = <T extends Element = HTMLElement>(name: string): T | null => root.querySelector<T>(`[data-part="${name}"]`);
  /** The chevron's native button, inside the Button the `expandButton` wrapper owns. */
  const chevron = (): HTMLButtonElement =>
    part('expandButton')!.querySelector('ds-button')!.shadowRoot!.querySelector('button')!;
  /** Focuses the first treeitem and dispatches one keydown on it. */
  const press = async (key: string): Promise<void> => {
    const item = part('node')!;
    item.focus();
    item.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }));
    await el.updateComplete;
  };
  return { el, props, root, order, expandChange, expand, selectionChange, activate, part, chevron, press };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-tree', () => {
  it('the-expand-button-expands-a-node', async () => {
    const s = await setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }],
    });
    s.chevron().click();
    await s.el.updateComplete;
    expect(s.expandChange).toHaveBeenCalledTimes(1);
    expect(s.expandChange.mock.calls[0]![0].detail).toEqual(['docs']);
    expect(s.selectionChange).not.toHaveBeenCalled();
  });

  it('expanding-a-lazy-node-asks-for-its-children', async () => {
    const s = await setup({ defaultExpanded: [], nodes: [{ id: 'docs', label: 'Documents', children: 'lazy' }] });
    s.chevron().click();
    await s.el.updateComplete;
    expect(s.expand).toHaveBeenCalledTimes(1);
    expect(s.expand.mock.calls[0]![0].detail).toBe('docs');
    expect(s.expandChange).toHaveBeenCalledTimes(1);
    expect(s.expandChange.mock.calls[0]![0].detail).toEqual(['docs']);
    // `expand` fires before the `expand-change` of the same act.
    expect(s.order).toEqual(['expand', 'expand-change']);
  });

  it('clicking-a-node-selects-it', async () => {
    const s = await setup({
      selectable: 'single',
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
    });
    s.part('nodeRow')!.click();
    await s.el.updateComplete;
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual(['docs']);
  });

  it('space-selects-the-focused-node', async () => {
    const s = await setup({
      selectable: 'single',
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
    });
    await s.press(' ');
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual(['docs']);
  });

  it('enter-activates-a-node', async () => {
    const s = await setup({
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
    });
    await s.press('Enter');
    expect(s.activate).toHaveBeenCalledTimes(1);
    expect(s.activate.mock.calls[0]![0].detail).toBe('docs');
  });

  it('arrow-movement-does-not-select-by-default', async () => {
    const s = await setup({
      selectable: 'single',
      selectOnFocus: false,
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
    });
    await s.press('ArrowDown');
    expect(s.selectionChange).not.toHaveBeenCalled();
  });

  it('select-on-focus-selects-as-focus-moves', async () => {
    const s = await setup({
      selectable: 'single',
      selectOnFocus: true,
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
    });
    await s.press('ArrowDown');
    expect(s.selectionChange).toHaveBeenCalledTimes(1);
    expect(s.selectionChange.mock.calls[0]![0].detail).toEqual(['media']);
  });

  it('the-empty-message-shows-when-there-are-no-nodes', async () => {
    const s = await setup({ nodes: [] });
    expect(s.part('emptyState')).toHaveTextContent('Nothing here.');
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.el).toHaveAttribute('data-ds', 'Tree');
    expect(s.root.querySelector('[role="tree"]')).not.toBeNull();
    expect(s.part('node')).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-heading-level-2', async () => {
    const s = await setup({ headingLevel: '2' });
    expect(s.el).toHaveAttribute('heading-level', '2');
  });

  it('renders-heading-level-3', async () => {
    const s = await setup({ headingLevel: '3' });
    expect(s.el).toHaveAttribute('heading-level', '3');
  });

  it('renders-heading-level-4', async () => {
    const s = await setup({ headingLevel: '4' });
    expect(s.el).toHaveAttribute('heading-level', '4');
  });

  /* derived: props.selectable */
  it('renders-selectable-none', async () => {
    const s = await setup({ selectable: 'none' });
    expect(s.el).toHaveAttribute('selectable', 'none');
    expect(s.part('node')).not.toHaveAttribute('aria-selected');
    expect(s.part('node')).not.toHaveAttribute('aria-checked');
  });

  it('renders-selectable-single', async () => {
    const s = await setup({ selectable: 'single' });
    expect(s.el).toHaveAttribute('selectable', 'single');
    expect(s.part('node')).toHaveAttribute('aria-selected', 'false');
  });

  it('renders-selectable-multiple', async () => {
    const s = await setup({ selectable: 'multiple' });
    expect(s.el).toHaveAttribute('selectable', 'multiple');
    expect(s.root.querySelector('[role="tree"]')).toHaveAttribute('aria-multiselectable', 'true');
    expect(s.part('node')).toHaveAttribute('aria-checked', 'false');
    expect(s.part('checkbox')).not.toBeNull();
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.root.querySelector('[role="tree"]')).toHaveAccessibleName(s.props.label);
  });
});
