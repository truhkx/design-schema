/**
 * Tooltip — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip, type TooltipProps } from './Tooltip';
import meta from './Tooltip.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TooltipProps> = {}) {
  const props = { ...meta.args, ...given } as TooltipProps;
  const utils = render(<Tooltip {...props} />);
  return {
    ...utils,
    props,
    tooltip: () => screen.getByRole('tooltip'),
    trigger: () => screen.getByRole('button'),
    bubble: () => document.querySelector('[data-ds="Tooltip"]'),
  };
}

describe('Tooltip', () => {
  it('the-visible-tooltip-carries-the-tooltip-role', () => {
    const s = setup({ open: true });
    const tooltip = s.tooltip();
    expect(tooltip).toHaveTextContent(s.props.content);
    expect(s.trigger()).toHaveAttribute('aria-describedby', tooltip.id);
    expect(s.bubble()).not.toBeNull();
  });

  it('the-text-stays-in-the-tree-while-hidden', () => {
    const s = setup({ open: false });
    expect(s.bubble()).toBeNull();
    const tooltip = s.tooltip();
    expect(tooltip).toHaveTextContent(s.props.content);
    expect(s.trigger()).toHaveAttribute('aria-describedby', tooltip.id);
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.trigger()).toBeInTheDocument();
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-placement-top', () => {
    const s = setup({ placement: 'top' });
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-placement-bottom', () => {
    const s = setup({ placement: 'bottom' });
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-placement-start', () => {
    const s = setup({ placement: 'start' });
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-placement-end', () => {
    const s = setup({ placement: 'end' });
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-delay-default', () => {
    const s = setup({ delay: 'default' });
    expect(s.tooltip()).toBeInTheDocument();
  });

  it('renders-delay-none', () => {
    const s = setup({ delay: 'none' });
    expect(s.tooltip()).toBeInTheDocument();
  });
});
