/**
 * Tree — behavior scenarios from the component doc, one test each, in the doc's order.
 * Keyboard and aria-* scenarios are web/lit only (the parser narrows them). A click is a `press`.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Tree } from './Tree';
import type { TreeProps } from './Tree';
import meta from './Tree.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TreeProps> = {}) {
  const props: TreeProps = { ...(meta.args as TreeProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Tree {...props} />
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

describe('Tree', () => {
  it('the-expand-button-expands-a-node', () => {
    const onExpandChange = jest.fn();
    setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: [{ id: 'invoices', label: 'Invoices' }] }],
      onExpandChange,
    });
    const expandButton = screen.getAllByTestId('Tree.expandButton')[0]!;
    fireEvent.press(within(expandButton).getByRole('button'));
    expect(onExpandChange).toHaveBeenCalledWith(['docs']);
  });

  it('expanding-a-lazy-node-asks-for-its-children', () => {
    const calls: string[] = [];
    const onExpand = jest.fn(() => calls.push('onExpand'));
    const onExpandChange = jest.fn(() => calls.push('onExpandChange'));
    setup({
      defaultExpanded: [],
      nodes: [{ id: 'docs', label: 'Documents', children: 'lazy' }],
      onExpand,
      onExpandChange,
    });
    const expandButton = screen.getAllByTestId('Tree.expandButton')[0]!;
    fireEvent.press(within(expandButton).getByRole('button'));
    expect(onExpand).toHaveBeenCalledWith('docs');
    expect(onExpandChange).toHaveBeenCalledWith(['docs']);
    expect(calls).toEqual(['onExpand', 'onExpandChange']);
  });

  it('clicking-a-node-selects-it', () => {
    const onSelectionChange = jest.fn();
    setup({
      selectable: 'single',
      nodes: [
        { id: 'docs', label: 'Documents' },
        { id: 'media', label: 'Media' },
      ],
      onSelectionChange,
    });
    fireEvent.press(screen.getAllByTestId('Tree.nodeRow')[0]!);
    expect(onSelectionChange).toHaveBeenCalledWith(['docs']);
  });

  it('the-empty-message-shows-when-there-are-no-nodes', () => {
    setup({ nodes: [] });
    expect(screen.getByText('Nothing here.')).toBeTruthy();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-heading-level-2', () => {
    const s = setup({ headingLevel: '2' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-heading-level-3', () => {
    const s = setup({ headingLevel: '3' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-heading-level-4', () => {
    const s = setup({ headingLevel: '4' });
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
  it('has-accessible-name', () => {
    const s = setup();
    const tree = screen.getByLabelText(s.props.label);
    expect(tree.props.accessibilityRole).toBe('list');
  });
});
