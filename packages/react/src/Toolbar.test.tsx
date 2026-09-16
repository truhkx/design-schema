/**
 * Toolbar — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Toolbar } from './Toolbar';
import meta from './Toolbar.stories';

type Props = ComponentProps<typeof Toolbar>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  const utils = render(<Toolbar {...props} />);
  return { ...utils, props, toolbar: () => screen.getByRole('toolbar') };
}

describe('Toolbar', () => {
  it('horizontal-is-the-reported-orientation', () => {
    const s = setup();
    expect(s.toolbar()).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('vertical-toolbar-reports-its-orientation', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toolbar()).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('the-toolbar-is-one-tab-stop', () => {
    const s = setup();
    const toolbar = s.toolbar();
    expect(toolbar).not.toHaveAttribute('tabindex');
    toolbar.focus();
    expect(toolbar).not.toHaveFocus();
    // Exactly one control inside is a tab stop.
    const stops = Array.from(toolbar.querySelectorAll<HTMLElement>('button, select, input, [tabindex]')).filter(
      (element) => element.tabIndex === 0,
    );
    expect(stops).toHaveLength(1);
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toolbar()).toBeInTheDocument();
  });

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

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-density-compact', () => {
    const s = setup({ density: 'compact' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('renders-density-comfortable', () => {
    const s = setup({ density: 'comfortable' });
    expect(s.toolbar()).toBeInTheDocument();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.toolbar()).toHaveAccessibleName(s.props.label);
  });
});
