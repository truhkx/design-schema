/**
 * Toolbar — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toolbar, type ToolbarProps } from './Toolbar';
import meta from './Toolbar.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ToolbarProps> = {}) {
  const props = { ...meta.args, ...given } as ToolbarProps;
  const utils = render(<Toolbar {...props} />);
  return { ...utils, props, toolbar: () => screen.getByRole('toolbar') };
}

describe('Toolbar', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const s = setup();
    expect(s.toolbar()).toBeInTheDocument();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.toolbar()).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toolbar()).toHaveAttribute('aria-orientation', 'vertical');
  });

  /* derived: props.overflow */
  it('renders-overflow-wrap', () => {
    const s = setup({ overflow: 'wrap' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-overflow-menu', () => {
    const s = setup({ overflow: 'menu' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-overflow-scroll', () => {
    const s = setup({ overflow: 'scroll' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  /* derived: props.density */
  it('renders-density-compact', () => {
    const s = setup({ density: 'compact' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-density-comfortable', () => {
    const s = setup({ density: 'comfortable' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('toolbar', { name: s.props.label })).toHaveAccessibleName();
  });
});
