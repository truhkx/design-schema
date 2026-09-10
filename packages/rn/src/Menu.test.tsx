/**
 * Menu — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` or accessible-name check,
 * so each test only asserts the tree renders or that the accessible name is set.
 * See generated/prompts/Menu.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Menu } from './Menu';
import type { MenuProps } from './Menu';
import meta from './Menu.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<MenuProps> = {}) {
  const props: MenuProps = { ...(meta.args as MenuProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Menu {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Menu', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const m = setup();
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.triggerVariant */
  it('renders-triggerVariant-ghost', () => {
    const m = setup({ triggerVariant: 'ghost' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-triggerVariant-secondary', () => {
    const m = setup({ triggerVariant: 'secondary' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-triggerVariant-primary', () => {
    const m = setup({ triggerVariant: 'primary' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.triggerIcon */
  it('renders-triggerIcon-ellipsis', () => {
    const m = setup({ triggerIcon: 'ellipsis' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-triggerIcon-chevron-down', () => {
    const m = setup({ triggerIcon: 'chevron-down' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-triggerIcon-none', () => {
    const m = setup({ triggerIcon: 'none' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', () => {
    const m = setup({ placement: 'bottom-start' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-bottom-end', () => {
    const m = setup({ placement: 'bottom-end' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-top-start', () => {
    const m = setup({ placement: 'top-start' });
    expect(m.toJSON()).not.toBeNull();
  });

  it('renders-placement-top-end', () => {
    const m = setup({ placement: 'top-end' });
    expect(m.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const m = setup();
    expect(screen.getByLabelText(m.props.label)).toBeTruthy();
  });
});
