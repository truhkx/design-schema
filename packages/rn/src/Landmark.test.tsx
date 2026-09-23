/**
 * Landmark — behavior scenarios from the component doc, one test each, in the doc's order.
 * Native has no landmark query, so role scenarios check the `role` / `accessibilityRole`
 * and `accessibilityLabel` props on the root View.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Landmark } from './Landmark';
import type { LandmarkProps } from './Landmark';
import meta from './Landmark.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<LandmarkProps> = {}) {
  const props: LandmarkProps = {
    ...(meta.args as LandmarkProps),
    ...given,
  };
  const utils = render(
    <ThemeProvider mode="light">
      <Landmark {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Landmark', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    warn.mockRestore();
  });

  it('the-role-prop-chooses-the-landmark', () => {
    const s = setup({ role: 'navigation' });
    expect(s.getByTestId('Landmark').props.role).toBe('navigation');
  });

  it('search-is-the-search-landmark', () => {
    const s = setup({ role: 'search' });
    expect(s.getByTestId('Landmark').props.accessibilityRole).toBe('search');
  });

  it('a-label-is-dropped-on-a-role-that-refuses-one', () => {
    const s = setup({ role: 'banner', label: 'Site header' });
    const root = s.getByTestId('Landmark');
    expect(root.props.accessibilityLabel).toBeUndefined();
    expect(root.props['aria-label']).toBeUndefined();
  });

  it('a-region-is-named-by-its-label', () => {
    const s = setup({ role: 'region', label: 'Related articles' });
    expect(s.getByTestId('Landmark').props.accessibilityLabel).toBe('Related articles');
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  // Per-role scenarios use the doc's per-role labels, never Default's "Main".
  it('renders-role-banner', () => {
    const s = setup({ role: 'banner', label: undefined });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-navigation', () => {
    const s = setup({ role: 'navigation', label: 'Primary' });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-main', () => {
    const s = setup({ role: 'main', label: undefined });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-complementary', () => {
    const s = setup({ role: 'complementary', label: 'Related links' });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-contentinfo', () => {
    const s = setup({ role: 'contentinfo', label: undefined });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-region', () => {
    const s = setup({ role: 'region', label: 'Related articles' });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-search', () => {
    const s = setup({ role: 'search', label: 'Site search' });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('renders-role-form', () => {
    const s = setup({ role: 'form', label: 'Sign in' });
    expect(s.getByTestId('Landmark')).toBeTruthy();
  });

  it('has-accessible-name', () => {
    const s = setup({ label: 'Accessible name' });
    const root = s.getByTestId('Landmark');
    expect(root.props.accessibilityLabel).toBe('Accessible name');
    expect(root.props['aria-label']).toBe('Accessible name');
  });
});
