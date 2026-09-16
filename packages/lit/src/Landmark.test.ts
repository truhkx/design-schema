/**
 * <ds-landmark> — behavior scenarios from the component doc, one test each, in the doc's order.
 * The element has no shadow root: the host carries `role` and `aria-label` itself.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Landmark.js';
import type { DsLandmark, LandmarkRole } from './Landmark.js';
import meta from './Landmark.stories.js';

interface Given {
  role?: LandmarkRole | undefined;
  label?: string | undefined;
}

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

async function expectRendersRole(role: LandmarkRole | undefined): Promise<void> {
  const el = await setup(role === undefined ? {} : { role });
  expect(el.isConnected).toBe(true);
  expect(el.shadowRoot).toBeNull();
  expect(el).toHaveAttribute('data-ds', 'Landmark');
  expect(el).toHaveAttribute('role', role ?? meta.args?.role);
  expect(el).toBeVisible();
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-landmark', () => {
  it('renders', async () => {
    await expectRendersRole(undefined);
  });

  it('renders-role-banner', async () => {
    await expectRendersRole('banner');
  });

  it('renders-role-navigation', async () => {
    await expectRendersRole('navigation');
  });

  it('renders-role-main', async () => {
    await expectRendersRole('main');
  });

  it('renders-role-complementary', async () => {
    await expectRendersRole('complementary');
  });

  it('renders-role-contentinfo', async () => {
    await expectRendersRole('contentinfo');
  });

  it('renders-role-region', async () => {
    await expectRendersRole('region');
  });

  it('renders-role-search', async () => {
    await expectRendersRole('search');
  });

  it('renders-role-form', async () => {
    await expectRendersRole('form');
  });

  it('has-accessible-name', async () => {
    const el = await setup({ label: 'Accessible name' });
    expect(el).toHaveAttribute('aria-label', 'Accessible name');
    expect(el).toHaveAccessibleName('Accessible name');
  });
});
