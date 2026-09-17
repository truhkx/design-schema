/**
 * Popover — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/popover.md) is the source of truth.
 *
 * The Default story is open with the filter-panel example's args (heading "Filters"), so the
 * `renders-*` scenarios find the panel, and `has-accessible-name` reads the panel's name.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { Popover } from './Popover';
import meta, { Default } from './Popover.stories';

type Props = ComponentProps<typeof Popover>;

function setup(given: Partial<Props> = {}) {
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...Default.args, onOpenChange, ...given } as Props;
  const utils = render(<Popover {...props} />);
  const panel = (): HTMLElement | null => document.body.querySelector('[data-ds="Popover"]');
  const trigger = (): HTMLElement => screen.getByRole('button', { name: 'Filters' });
  return { ...utils, onOpenChange, props, panel, trigger };
}

function expectRendered(d: ReturnType<typeof setup>): void {
  expect(d.trigger().getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByRole('dialog')).toBe(d.panel());
}

describe('Popover', () => {
  it('close-button-fires-on-open-change', () => {
    const d = setup({ open: true });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('escape-closes-a-modal-popover', () => {
    const d = setup({ open: true, modal: true });
    fireEvent.keyDown(document.activeElement ?? d.panel()!, { key: 'Escape' });
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });

  it('the-panel-is-named-by-its-heading', () => {
    const d = setup({ open: true, heading: 'Filters' });
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(d.panel());
  });

  it('renders', () => {
    expectRendered(setup());
  });

  it('renders-heading-level-2', () => {
    expectRendered(setup({ headingLevel: '2' }));
  });

  it('renders-heading-level-3', () => {
    expectRendered(setup({ headingLevel: '3' }));
  });

  it('renders-heading-level-4', () => {
    expectRendered(setup({ headingLevel: '4' }));
  });

  it('renders-placement-bottom-start', () => {
    expectRendered(setup({ placement: 'bottom-start' }));
  });

  it('renders-placement-bottom', () => {
    expectRendered(setup({ placement: 'bottom' }));
  });

  it('renders-placement-bottom-end', () => {
    expectRendered(setup({ placement: 'bottom-end' }));
  });

  it('renders-placement-top-start', () => {
    expectRendered(setup({ placement: 'top-start' }));
  });

  it('renders-placement-top', () => {
    expectRendered(setup({ placement: 'top' }));
  });

  it('renders-placement-top-end', () => {
    expectRendered(setup({ placement: 'top-end' }));
  });

  it('renders-placement-start', () => {
    expectRendered(setup({ placement: 'start' }));
  });

  it('renders-placement-end', () => {
    expectRendered(setup({ placement: 'end' }));
  });

  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBe(d.panel());
  });

  it('escape-fires-on-open-change', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(document.activeElement ?? d.panel()!, { key: 'Escape' });
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });
});
