/**
 * Landmark — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Landmark, type LandmarkProps, type LandmarkRole } from './Landmark';
import meta from './Landmark.stories';
import type { ComponentProps } from 'react';

const ROLES = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'] as const;
const ELEMENTS = ['header', 'nav', 'main', 'aside', 'footer', 'section', 'form', 'div'] as const;

/**
 * A scenario for another role does not inherit the Default story's label: the roles that refuse
 * one get none, `region` and `form` get the label that makes them a landmark.
 */
const LABEL_FOR_ROLE: Record<LandmarkRole, string | undefined> = {
  banner: undefined,
  navigation: 'Main',
  main: undefined,
  complementary: undefined,
  contentinfo: undefined,
  region: 'Related articles',
  search: undefined,
  form: 'Sign in',
};

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<LandmarkProps> = {}) {
  const label = 'label' in given ? given.label : given.role ? LABEL_FOR_ROLE[given.role] : meta.args?.label;
  const props = { ...meta.args, ...given, label };
  return render(<Landmark {...(props as ComponentProps<typeof Landmark>)} />);
}

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
    const region = getByRole('region');
    expect(region.getAttribute('aria-label')).toBe('Related articles');
    expect(region.getAttribute('data-ds')).toBe('Landmark');
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
