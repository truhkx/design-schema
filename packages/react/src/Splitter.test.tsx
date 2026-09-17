/**
 * Splitter — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/splitter.md) is the source of truth.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Splitter } from './Splitter';
import meta from './Splitter.stories';

type Props = ComponentProps<typeof Splitter>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const result = render(<Splitter {...props} />);
  return { ...result, props };
}

function separator(): HTMLElement {
  return screen.getByRole('separator');
}

describe('Splitter', () => {
  it('arrow-grows-the-primary-pane', () => {
    const onSizeChange = vi.fn();
    const onSizeChangeEnd = vi.fn();
    setup({ defaultSize: 50, stackBelow: 'never', onSizeChange, onSizeChangeEnd });
    fireEvent.keyDown(separator(), { key: 'ArrowRight' });
    expect(onSizeChange).toHaveBeenCalled();
    expect(onSizeChangeEnd).toHaveBeenCalled();
  });

  it('arrow-shrinks-the-primary-pane', () => {
    const onSizeChange = vi.fn();
    const onSizeChangeEnd = vi.fn();
    setup({ defaultSize: 50, stackBelow: 'never', onSizeChange, onSizeChangeEnd });
    fireEvent.keyDown(separator(), { key: 'ArrowLeft' });
    expect(onSizeChange).toHaveBeenCalled();
    expect(onSizeChangeEnd).toHaveBeenCalled();
  });

  it('home-sets-the-primary-pane-to-its-minimum', () => {
    const onSizeChange = vi.fn();
    setup({ defaultSize: 50, minSize: 20, stackBelow: 'never', onSizeChange });
    fireEvent.keyDown(separator(), { key: 'Home' });
    expect(onSizeChange).toHaveBeenCalled();
  });

  it('end-sets-the-primary-pane-to-its-maximum', () => {
    const onSizeChange = vi.fn();
    setup({ defaultSize: 50, maxSize: 80, stackBelow: 'never', onSizeChange });
    fireEvent.keyDown(separator(), { key: 'End' });
    expect(onSizeChange).toHaveBeenCalled();
  });

  it('enter-collapses-a-collapsible-pane', () => {
    const onCollapseChange = vi.fn();
    setup({ collapsible: true, defaultSize: 40, stackBelow: 'never', onCollapseChange });
    fireEvent.keyDown(separator(), { key: 'Enter' });
    expect(onCollapseChange).toHaveBeenCalled();
  });

  it('enter-does-nothing-when-the-pane-cannot-collapse', () => {
    const onCollapseChange = vi.fn();
    setup({ stackBelow: 'never', onCollapseChange });
    fireEvent.keyDown(separator(), { key: 'Enter' });
    expect(onCollapseChange).not.toHaveBeenCalled();
  });

  it('the-collapse-button-collapses-the-pane', () => {
    const onCollapseChange = vi.fn();
    setup({ collapsible: true, defaultSize: 40, stackBelow: 'never', onCollapseChange });
    const part = document.querySelector<HTMLElement>('[data-part="collapseButton"]');
    expect(part).not.toBeNull();
    fireEvent.click(part!);
    expect(onCollapseChange).toHaveBeenCalled();
  });

  it('a-collapsed-pane-ignores-the-arrow-keys', () => {
    const onSizeChange = vi.fn();
    setup({ collapsible: true, defaultCollapsed: true, stackBelow: 'never', onSizeChange });
    fireEvent.keyDown(separator(), { key: 'ArrowRight' });
    expect(onSizeChange).not.toHaveBeenCalled();
  });

  it('the-separator-reports-its-size-and-bounds', () => {
    setup({ defaultSize: 40, minSize: 15, maxSize: 85, stackBelow: 'never' });
    expect(separator()).toHaveAttribute('aria-valuenow', '40');
    expect(separator()).toHaveAttribute('aria-valuemin', '15');
    expect(separator()).toHaveAttribute('aria-valuemax', '85');
  });

  it('the-separator-is-a-focusable-widget', () => {
    setup({ stackBelow: 'never' });
    const el = separator();
    expect(el.tabIndex).toBe(0);
    el.focus();
    expect(el).toHaveFocus();
  });

  /* derived */
  it('renders', () => {
    const { container } = setup();
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    const { container } = setup({ orientation: 'horizontal' });
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const { container } = setup({ orientation: 'vertical' });
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('renders-stack-below-prose', () => {
    const { container } = setup({ stackBelow: 'prose' });
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('renders-stack-below-content', () => {
    const { container } = setup({ stackBelow: 'content' });
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('renders-stack-below-never', () => {
    const { container } = setup({ stackBelow: 'never' });
    expect(container.querySelector('[data-ds="Splitter"]')).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const { props } = setup();
    expect(screen.getByRole('separator', { name: props.label })).toHaveAccessibleName(props.label);
  });
});
