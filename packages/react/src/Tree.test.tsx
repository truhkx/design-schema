/**
 * Tree — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Tree } from './Tree';
import meta from './Tree.stories';

type Props = ComponentProps<typeof Tree>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const utils = render(<Tree {...props} />);
  return { ...utils, props, tree: () => screen.getByRole('tree') };
}

const part = (name: string): Element | null => document.querySelector(`[data-part="${name}"]`);

/** The treeitem holding the roving tab stop, where keyboard interaction lands. */
const tabStop = (): HTMLElement => {
  const item = document.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]');
  expect(item).not.toBeNull();
  item!.focus();
  return item!;
};

const TWO_LEAVES = [
  { id: 'docs', label: 'Documents' },
  { id: 'media', label: 'Media' },
];

describe('Tree', () => {
  it('the-expand-button-expands-a-node', () => {
    const onExpandChange = vi.fn();
    setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }],
      onExpandChange,
    });
    expect(part('expandButton')).not.toBeNull();
    fireEvent.click(part('expandButton')!);
    expect(onExpandChange).toHaveBeenCalled();
  });

  it('expanding-a-lazy-node-asks-for-its-children', () => {
    const onExpand = vi.fn();
    const onExpandChange = vi.fn();
    setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: 'lazy' }],
      onExpand,
      onExpandChange,
    });
    expect(part('expandButton')).not.toBeNull();
    fireEvent.click(part('expandButton')!);
    expect(onExpand).toHaveBeenCalled();
    expect(onExpandChange).toHaveBeenCalled();
  });

  it('clicking-a-node-selects-it', () => {
    const onSelectionChange = vi.fn();
    setup({ selectable: 'single', nodes: TWO_LEAVES, onSelectionChange });
    expect(part('nodeRow')).not.toBeNull();
    fireEvent.click(part('nodeRow')!);
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('space-selects-the-focused-node', () => {
    const onSelectionChange = vi.fn();
    setup({ selectable: 'single', nodes: TWO_LEAVES, onSelectionChange });
    fireEvent.keyDown(tabStop(), { key: ' ', code: 'Space' });
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('enter-activates-a-node', () => {
    const onActivate = vi.fn();
    setup({ nodes: TWO_LEAVES, onActivate });
    fireEvent.keyDown(tabStop(), { key: 'Enter', code: 'Enter' });
    expect(onActivate).toHaveBeenCalled();
  });

  it('arrow-movement-does-not-select-by-default', () => {
    const onSelectionChange = vi.fn();
    setup({ selectable: 'single', selectOnFocus: false, nodes: TWO_LEAVES, onSelectionChange });
    fireEvent.keyDown(tabStop(), { key: 'ArrowDown', code: 'ArrowDown' });
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('select-on-focus-selects-as-focus-moves', () => {
    const onSelectionChange = vi.fn();
    setup({ selectable: 'single', selectOnFocus: true, nodes: TWO_LEAVES, onSelectionChange });
    fireEvent.keyDown(tabStop(), { key: 'ArrowDown', code: 'ArrowDown' });
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('a-collapsed-parent-reports-it', () => {
    setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }],
    });
    expect(part('node')).toHaveAttribute('aria-expanded', 'false');
  });

  it('an-expanded-parent-reports-it', () => {
    setup({
      defaultExpanded: ['docs'],
      nodes: [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }],
    });
    expect(part('node')).toHaveAttribute('aria-expanded', 'true');
  });

  it('a-selected-node-is-marked-selected', () => {
    setup({ selectable: 'single', selected: ['docs'], nodes: TWO_LEAVES });
    expect(part('node')).toHaveAttribute('aria-selected', 'true');
  });

  it('the-empty-message-shows-when-there-are-no-nodes', () => {
    setup({ nodes: [] });
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('renders', () => {
    const { container } = setup();
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-heading-level-2', () => {
    const { container } = setup({ headingLevel: '2' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-heading-level-3', () => {
    const { container } = setup({ headingLevel: '3' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-heading-level-4', () => {
    const { container } = setup({ headingLevel: '4' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-selectable-none', () => {
    const { container } = setup({ selectable: 'none' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-selectable-single', () => {
    const { container } = setup({ selectable: 'single' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('renders-selectable-multiple', () => {
    const { container } = setup({ selectable: 'multiple' });
    expect(container.querySelector('[data-ds="Tree"]')).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const { tree } = setup();
    expect(tree()).toHaveAccessibleName();
  });
});

describe('Tree (platform notes)', () => {
  it('names each treeitem from its label and badge, not its contents', () => {
    setup({ nodes: [{ id: 'docs', label: 'Documents', badge: '3', children: [{ id: 'a', label: 'A' }] }] });
    expect(screen.getByRole('treeitem')).toHaveAccessibleName('Documents, 3');
  });

  it('moves focus to the ancestor a controlled collapse hides', () => {
    const nodes = [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }];
    const { rerender } = render(<Tree label="Folders" nodes={nodes} expanded={['docs']} />);
    const child = screen.getByRole('treeitem', { name: 'Invoices' });
    child.focus();
    fireEvent.focus(child);
    rerender(<Tree label="Folders" nodes={nodes} expanded={[]} />);
    expect(screen.getByRole('treeitem', { name: 'Documents' })).toHaveFocus();
  });

  it('Enter on an href node in multiple mode follows the link without toggling', () => {
    const onSelectionChange = vi.fn();
    const onActivate = vi.fn();
    setup({
      selectable: 'multiple',
      nodes: [{ id: 'account', label: 'Account', href: '#account' }],
      onSelectionChange,
      onActivate,
    });
    fireEvent.keyDown(tabStop(), { key: 'Enter', code: 'Enter' });
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });
});
