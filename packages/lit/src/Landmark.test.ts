/**
 * <ds-landmark> — behavior scenarios from the component doc, one test each, in the doc's order.
 * The element has no shadow root: the host carries `role` and `aria-label` itself.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import './Landmark.js';
import type { DsLandmark, LandmarkRole } from './Landmark.js';
import meta from './Landmark.stories.js';

interface Given {
  role?: LandmarkRole | undefined;
  label?: string | undefined;
}

/**
 * The label each role is rendered with: none for the roles that refuse one (`banner`, `main`,
 * `contentinfo`) or do not need one (`complementary`, `search`), and a name for `region` and
 * `form`, which are landmarks only when named. The Default story's label does not carry over.
 */
const ROLE_LABEL: Readonly<Record<LandmarkRole, string | undefined>> = {
  banner: undefined,
  navigation: 'Main',
  main: undefined,
  complementary: undefined,
  contentinfo: undefined,
  region: 'Related articles',
  search: undefined,
  form: 'Sign in',
};

const ROLES = ['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'region', 'search', 'form'] as const;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}): Promise<DsLandmark> {
  const props = { ...meta.args, ...given };
  const el = document.createElement('ds-landmark');
  if (props.role !== undefined) el.landmark = props.role;
  if (props.label !== undefined) el.label = props.label;
  el.textContent = props.children ?? '';
  document.body.append(el);
  await el.updateComplete;
  return el;
}

/** The element is what a role query finds. */
function expectRole(el: DsLandmark, role: LandmarkRole): void {
  expect(page.getByRole(role).elements()).toContain(el);
}

async function expectRenders(given: Given = {}): Promise<void> {
  const el = await setup(given);
  expect(el.isConnected).toBe(true);
  expect(el.shadowRoot).toBeNull();
  expect(el).toHaveAttribute('data-ds', 'Landmark');
  expect(el).toBeVisible();
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-landmark', () => {
  it('the-role-prop-chooses-the-landmark', async () => {
    const el = await setup({ role: 'navigation', label: ROLE_LABEL.navigation });
    expectRole(el, 'navigation');
  });

  it('search-is-the-search-landmark', async () => {
    const el = await setup({ role: 'search', label: ROLE_LABEL.search });
    expectRole(el, 'search');
  });

  it('main-is-the-primary-content-landmark', async () => {
    const el = await setup({ role: 'main', label: ROLE_LABEL.main });
    expectRole(el, 'main');
  });

  it('a-region-is-named-by-its-label', async () => {
    const el = await setup({ role: 'region', label: 'Related articles' });
    expectRole(el, 'region');
    expect(el).toHaveAttribute('aria-label', 'Related articles');
  });

  /* derived */
  it('renders', async () => {
    await expectRenders();
  });

  for (const role of ROLES) {
    it(`renders-role-${role}`, async () => {
      await expectRenders({ role, label: ROLE_LABEL[role] });
    });
  }

  it('has-accessible-name', async () => {
    const el = await setup({ label: 'Accessible name' });
    expect(el).toHaveAccessibleName('Accessible name');
  });
});
