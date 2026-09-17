/**
 * Landmark — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Landmark, type LandmarkProps } from './Landmark';
import meta from './Landmark.stories';
import type { ComponentProps } from 'react';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<LandmarkProps> = {}) {
  const props = { ...meta.args, ...given };
  return render(<Landmark {...(props as ComponentProps<typeof Landmark>)} />);
}

const ROLES = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'] as const;
const ELEMENTS = ['header', 'nav', 'main', 'aside', 'footer', 'section', 'form', 'div'] as const;

describe('Landmark', () => {
  it('the-role-prop-chooses-the-landmark', () => {
    const { getByRole } = setup({ role: 'navigation' });
    expect(getByRole('navigation').getAttribute('data-ds')).toBe('Landmark');
  });

  it('search-is-the-search-landmark', () => {
    const { getByRole } = setup({ role: 'search' });
    expect(getByRole('search').getAttribute('data-ds')).toBe('Landmark');
  });

  it('main-is-the-primary-content-landmark', () => {
    const { getByRole } = setup({ role: 'main' });
    expect(getByRole('main').getAttribute('data-ds')).toBe('Landmark');
  });

  it('a-region-is-named-by-its-label', () => {
    const { getByRole } = setup({ role: 'region', label: 'Related articles' });
    expect(getByRole('region').getAttribute('aria-label')).toBe('Related articles');
  });

  it('an-overridden-element-still-carries-its-role', () => {
    const { container, getByRole } = setup({ role: 'banner', as: 'div' });
    const root = container.querySelector('[data-ds="Landmark"]');
    expect(root?.getAttribute('role')).toBe('banner');
    expect(getByRole('banner')).toBe(root);
  });

  /* derived */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  for (const role of ROLES) {
    it(`renders-role-${role}`, () => {
      const { container } = setup({ role });
      expect(container.firstChild).not.toBeNull();
    });
  }

  for (const as of ELEMENTS) {
    it(`renders-as-${as}`, () => {
      const { container } = setup({ as });
      expect(container.firstChild).not.toBeNull();
    });
  }

  it('has-accessible-name', () => {
    const { getByRole } = setup({ label: 'Accessible name' });
    expect(getByRole('navigation', { name: 'Accessible name' })).toBeTruthy();
  });
});
