/**
 * Menu — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/menu.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Menu.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Menu, type MenuProps } from './Menu';
import meta from './Menu.stories';

function setup(given: Partial<MenuProps> = {}) {
  const onAction = vi.fn();
  const onOpenChange = vi.fn();
  const props = { ...meta.args, ...given, onAction, onOpenChange } as MenuProps;
  const utils = render(<Menu {...props} />);
  return {
    ...utils,
    onAction,
    onOpenChange,
    props,
    root: () => document.querySelector('[data-ds="Menu"]') as HTMLElement,
    trigger: () => screen.getByRole('button', { name: props.label }),
  };
}

describe('Menu', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const m = setup();
    expect(m.root()).not.toBeNull();
  });

  /* derived: props.triggerVariant */
  it('renders-triggerVariant-ghost', () => {
    const m = setup({ triggerVariant: 'ghost' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-triggerVariant-secondary', () => {
    const m = setup({ triggerVariant: 'secondary' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-triggerVariant-primary', () => {
    const m = setup({ triggerVariant: 'primary' });
    expect(m.root()).not.toBeNull();
  });

  /* derived: props.triggerIcon */
  it('renders-triggerIcon-ellipsis', () => {
    const m = setup({ triggerIcon: 'ellipsis' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-triggerIcon-chevron-down', () => {
    const m = setup({ triggerIcon: 'chevron-down' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-triggerIcon-none', () => {
    const m = setup({ triggerIcon: 'none' });
    expect(m.root()).not.toBeNull();
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', () => {
    const m = setup({ placement: 'bottom-start' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-bottom-end', () => {
    const m = setup({ placement: 'bottom-end' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-top-start', () => {
    const m = setup({ placement: 'top-start' });
    expect(m.root()).not.toBeNull();
  });

  it('renders-placement-top-end', () => {
    const m = setup({ placement: 'top-end' });
    expect(m.root()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const m = setup();
    expect(m.trigger()).toHaveAccessibleName(m.props.label as string);
  });

  it('control-is-focusable', () => {
    const m = setup();
    m.trigger().focus();
    expect(m.trigger()).toHaveFocus();
  });
});
