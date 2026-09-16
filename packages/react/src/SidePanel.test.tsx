/**
 * SidePanel — behavior scenarios from the component doc, one test each, in the doc's order.
 * `given` overrides the Default story's args; the doc
 * (site/src/content/docs/components/side-panel.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { SidePanel } from './SidePanel';
import meta from './SidePanel.stories';

type Props = ComponentProps<typeof SidePanel>;

function setup(given: Partial<Props> = {}) {
  const onOpenChange = vi.fn();
  const props = { ...meta.args, onOpenChange, ...given } as Props;
  const utils = render(<SidePanel {...props} />);
  const panel = (): HTMLElement | null => document.body.querySelector('[data-ds="SidePanel"]');
  const part = (name: string): HTMLElement | null => document.body.querySelector(`[data-part="${name}"]`);
  return { ...utils, onOpenChange, props, panel, part };
}

describe('SidePanel', () => {
  it('close-button-fires-on-open-change', () => {
    const d = setup({ open: true });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('the-close-button-works-without-the-swipe', () => {
    const d = setup({ open: true, swipeable: false });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('non-dismissible-still-reports-escape', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.keyDown(d.part('surface')!, { key: 'Escape' });
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });

  it('non-dismissible-scrim-tap-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    const scrim = d.part('scrim');
    expect(scrim).not.toBeNull();
    fireEvent.pointerDown(scrim!);
    fireEvent.click(scrim!);
    expect(d.onOpenChange).not.toHaveBeenCalled();
  });

  it('the-heading-is-rendered', () => {
    setup({ open: true, heading: 'Your cart' });
    expect(screen.getByText('Your cart')).not.toBeNull();
  });

  it('renders', () => {
    const d = setup();
    expect(d.panel()).not.toBeNull();
  });

  it('renders-side-start', () => {
    const d = setup({ side: 'start' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-side-end', () => {
    const d = setup({ side: 'end' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-width-narrow', () => {
    const d = setup({ width: 'narrow' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-width-default', () => {
    const d = setup({ width: 'default' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-width-wide', () => {
    const d = setup({ width: 'wide' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-persistent-never', () => {
    const d = setup({ persistent: 'never' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-persistent-content', () => {
    const d = setup({ persistent: 'content' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-persistent-page', () => {
    const d = setup({ persistent: 'page' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-role-complementary', () => {
    const d = setup({ role: 'complementary' });
    expect(d.panel()).not.toBeNull();
  });

  it('renders-role-navigation', () => {
    const d = setup({ role: 'navigation' });
    expect(d.panel()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const d = setup();
    // Closed, the region is `hidden`; its name still comes from the heading.
    expect(screen.getByRole('complementary', { name: d.props.heading, hidden: true })).not.toBeNull();
  });

  it('escape-fires-on-open-change', () => {
    const d = setup({ open: true });
    fireEvent.keyDown(d.part('surface')!, { key: 'Escape' });
    expect(d.onOpenChange).toHaveBeenCalledWith(false, 'escape');
  });
});
