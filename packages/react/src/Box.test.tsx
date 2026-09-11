/**
 * Box — behavior scenarios from the component doc, one test each, in the doc's order.
 * Box has no interactive behavior (a11y.role: none), so every scenario only asserts render.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Box, type BoxProps } from './Box';
import meta from './Box.stories';
import type { ComponentProps } from 'react';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<BoxProps> = {}) {
  const props = { ...meta.args, ...given };
  return render(<Box {...(props as ComponentProps<typeof Box>)} />);
}

describe('Box', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.inset */
  it('renders-inset-none', () => {
    const { container } = setup({ inset: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-sm', () => {
    const { container } = setup({ inset: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-md', () => {
    const { container } = setup({ inset: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-lg', () => {
    const { container } = setup({ inset: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-inset-xl', () => {
    const { container } = setup({ inset: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.insetBlock */
  it('renders-insetblock-none', () => {
    const { container } = setup({ insetBlock: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetblock-sm', () => {
    const { container } = setup({ insetBlock: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetblock-md', () => {
    const { container } = setup({ insetBlock: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetblock-lg', () => {
    const { container } = setup({ insetBlock: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetblock-xl', () => {
    const { container } = setup({ insetBlock: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.insetInline */
  it('renders-insetinline-none', () => {
    const { container } = setup({ insetInline: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetinline-sm', () => {
    const { container } = setup({ insetInline: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetinline-md', () => {
    const { container } = setup({ insetInline: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetinline-lg', () => {
    const { container } = setup({ insetInline: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-insetinline-xl', () => {
    const { container } = setup({ insetInline: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.surface */
  it('renders-surface-none', () => {
    const { container } = setup({ surface: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-surface-default', () => {
    const { container } = setup({ surface: 'default' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const { container } = setup({ surface: 'subtle' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-surface-strong', () => {
    const { container } = setup({ surface: 'strong' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.radius */
  it('renders-radius-none', () => {
    const { container } = setup({ radius: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-radius-sm', () => {
    const { container } = setup({ radius: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-radius-md', () => {
    const { container } = setup({ radius: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-radius-lg', () => {
    const { container } = setup({ radius: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-radius-full', () => {
    const { container } = setup({ radius: 'full' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.element */
  it('renders-element-div', () => {
    const { container } = setup({ element: 'div' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-section', () => {
    const { container } = setup({ element: 'section' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-article', () => {
    const { container } = setup({ element: 'article' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-aside', () => {
    const { container } = setup({ element: 'aside' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-header', () => {
    const { container } = setup({ element: 'header' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-footer', () => {
    const { container } = setup({ element: 'footer' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-main', () => {
    const { container } = setup({ element: 'main' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-nav', () => {
    const { container } = setup({ element: 'nav' });
    expect(container.firstChild).not.toBeNull();
  });
});
