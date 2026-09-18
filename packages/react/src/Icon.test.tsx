/**
 * Icon — behavior scenarios from the component doc, one test each, in the doc's order.
 * Icon has no interaction, focus or animation, so the derived scenarios only assert render.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Icon, type IconProps } from './Icon';
import meta from './Icon.stories';
import type { ComponentProps } from 'react';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<IconProps> = {}) {
  const props = { ...meta.args, ...given };
  const result = render(<Icon {...(props as ComponentProps<typeof Icon>)} />);
  const root = result.container.querySelector('[data-ds="Icon"]');
  return { ...result, root };
}

describe('Icon', () => {
  /**
   * Decorative icons carry no information the adjacent text does not, so "Save" is announced as
   * "Save", not "check mark Save" (WCAG 1.1.1).
   */
  it('unlabelled-icon-is-hidden-from-assistive-technology', () => {
    const { root } = setup();
    expect(root).not.toBeNull();
    expect(root?.getAttribute('aria-hidden')).toBe('true');
  });

  /** When set, the icon is exposed as an image with this name; the aria-hidden of the decorative case is gone. */
  it('label-makes-the-icon-meaningful', () => {
    const { root, getByRole } = setup({ name: 'warning', label: 'Warning: over quota' });
    expect(root?.getAttribute('role')).toBe('img');
    expect(root?.getAttribute('aria-hidden')).toBeNull();
    expect(getByRole('img', { name: 'Warning: over quota' })).toBe(root);
  });

  /** An empty string is the decorative case, not an authoring error: the icon stays hidden. */
  it('empty-label-is-decorative', () => {
    const { root } = setup({ name: 'check', label: '' });
    expect(root).not.toBeNull();
    expect(root?.getAttribute('aria-hidden')).toBe('true');
  });

  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.name */
  it('renders-name-check', () => {
    const { container } = setup({ name: 'check' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-dash', () => {
    const { container } = setup({ name: 'dash' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-chevron-right', () => {
    const { container } = setup({ name: 'chevron-right' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-chevron-down', () => {
    const { container } = setup({ name: 'chevron-down' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-chevron-up', () => {
    const { container } = setup({ name: 'chevron-up' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-chevron-left', () => {
    const { container } = setup({ name: 'chevron-left' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-close', () => {
    const { container } = setup({ name: 'close' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-plus', () => {
    const { container } = setup({ name: 'plus' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-minus', () => {
    const { container } = setup({ name: 'minus' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-info', () => {
    const { container } = setup({ name: 'info' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-success', () => {
    const { container } = setup({ name: 'success' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-warning', () => {
    const { container } = setup({ name: 'warning' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-danger', () => {
    const { container } = setup({ name: 'danger' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-external', () => {
    const { container } = setup({ name: 'external' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-ellipsis', () => {
    const { container } = setup({ name: 'ellipsis' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-search', () => {
    const { container } = setup({ name: 'search' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-arrow-right', () => {
    const { container } = setup({ name: 'arrow-right' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-arrow-left', () => {
    const { container } = setup({ name: 'arrow-left' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-calendar', () => {
    const { container } = setup({ name: 'calendar' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-menu', () => {
    const { container } = setup({ name: 'menu' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-list', () => {
    const { container } = setup({ name: 'list' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-grid', () => {
    const { container } = setup({ name: 'grid' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-play', () => {
    const { container } = setup({ name: 'play' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-pause', () => {
    const { container } = setup({ name: 'pause' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-folder', () => {
    const { container } = setup({ name: 'folder' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-name-file', () => {
    const { container } = setup({ name: 'file' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-xs', () => {
    const { container } = setup({ size: 'xs' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const { container } = setup({ size: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-md', () => {
    const { container } = setup({ size: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const { container } = setup({ size: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const { container } = setup({ size: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', () => {
    const { root, getByRole } = setup({ label: 'Accessible name' });
    expect(getByRole('img', { name: 'Accessible name' })).toBe(root);
  });
});
