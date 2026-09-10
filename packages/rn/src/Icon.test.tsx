/**
 * Icon — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario is a `renders: true` check (Icon has no interaction, no
 * focus, no animation); see generated/prompts/Icon.rn.md. `has-accessible-name` has
 * no `given` in the doc even though Icon is decorative (no accessible name) by
 * default, so it is exercised with an explicit `label` — see the gap note in the
 * generation report.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Icon } from './Icon';
import type { IconProps } from './Icon';
import meta from './Icon.stories';
import { ThemeProvider } from './theme';

function setup(given: Partial<IconProps> = {}) {
  const props: IconProps = { ...(meta.args as IconProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Icon {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Icon', () => {
  /* derived: renders */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.name */
  it('renders-name-check', () => {
    const s = setup({ name: 'check' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-dash', () => {
    const s = setup({ name: 'dash' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-chevron-right', () => {
    const s = setup({ name: 'chevron-right' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-chevron-down', () => {
    const s = setup({ name: 'chevron-down' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-chevron-up', () => {
    const s = setup({ name: 'chevron-up' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-chevron-left', () => {
    const s = setup({ name: 'chevron-left' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-close', () => {
    const s = setup({ name: 'close' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-plus', () => {
    const s = setup({ name: 'plus' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-minus', () => {
    const s = setup({ name: 'minus' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-info', () => {
    const s = setup({ name: 'info' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-success', () => {
    const s = setup({ name: 'success' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-warning', () => {
    const s = setup({ name: 'warning' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-danger', () => {
    const s = setup({ name: 'danger' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-external', () => {
    const s = setup({ name: 'external' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-ellipsis', () => {
    const s = setup({ name: 'ellipsis' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-search', () => {
    const s = setup({ name: 'search' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-arrow-right', () => {
    const s = setup({ name: 'arrow-right' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-arrow-left', () => {
    const s = setup({ name: 'arrow-left' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-calendar', () => {
    const s = setup({ name: 'calendar' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* the doc header claims 33 scenarios but its embedded yaml lists only 26, stopping
     at "calendar"; these 7 follow the same derived pattern for the remaining `name`
     enum values — see the gap note in the generation report */
  it('renders-name-menu', () => {
    const s = setup({ name: 'menu' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-list', () => {
    const s = setup({ name: 'list' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-grid', () => {
    const s = setup({ name: 'grid' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-play', () => {
    const s = setup({ name: 'play' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-pause', () => {
    const s = setup({ name: 'pause' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-folder', () => {
    const s = setup({ name: 'folder' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-name-file', () => {
    const s = setup({ name: 'file' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-xs', () => {
    const s = setup({ size: 'xs' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const s = setup({ size: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires — exercised with an explicit label; see the gap note */
  it('has-accessible-name', () => {
    setup({ label: 'Warning: over quota' });
    expect(screen.getByRole('image', { name: 'Warning: over quota' })).toBeOnTheScreen();
  });
});
