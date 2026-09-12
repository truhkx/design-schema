// Job 505's gate: the docs section's navigation swaps at layout.breakpoint.md, and each rendering is
// the only docs nav its viewport gets. Run with `pnpm gates:website`.
//
// The heart of it is the plan's own wording (website-plan.md, "Docs section"): below the breakpoint
// the sidebar `Landmark` is *replaced by* the `Select` — not hidden beside it — so this asserts the
// accessibility tree, not the pixels. Playwright's role locators match only what is in that tree, so
// a sidebar that were merely moved off-screen would still be found here.
import { test, expect, type Page } from '@playwright/test';

import { audit, describe } from './axe';

/** Below layout.breakpoint.md (768px), where the sidebar becomes one Select. */
const NARROW = { width: 390, height: 844 };
/** Above it, where the sidebar is a persistent column. */
const WIDE = { width: 1280, height: 800 };

/** A component to navigate to, and the phase group it belongs to in generated/nav.json. */
const TARGET = { name: 'Switch', slug: 'switch', phase: 'Controls' };
/** The page the nav is exercised from, and the group its own entry sits in. */
const START = { route: '/docs/components/button', name: 'Button', phase: 'Core' };

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Component docs' });
const picker = (page: Page) => page.getByRole('combobox');

/**
 * Opens the Select and waits for its popup to have finished fading in.
 *
 * Neither visibility nor the `--entered` state class is enough: the popup enters from `opacity: 0`,
 * both are true the moment the transition *starts*, and axe reading a label at opacity 0.4 measures
 * its color against whatever is behind the popup and reports a contrast failure the settled popup
 * does not have. So the wait is on the opacity the transition is heading for.
 */
async function openPicker(page: Page) {
  await picker(page).click();
  const popup = page.locator('.ds-select__popup');
  await expect(popup).toBeVisible();
  await expect.poll(() => popup.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
}

/**
 * The nav is an island — its Disclosures collapse and its Select navigates only once it has
 * hydrated. Astro drops the `ssr` attribute from an island when it does; wait for that rather than
 * for a timeout.
 *
 * Scoped to *this* island by its bundle name, not "no island is still `ssr`": a component page also
 * carries the accessibility accordion, which is `client:visible` and stays `ssr` on purpose until it
 * is scrolled to (job 506). Waiting on that one would be waiting for something that should not
 * happen yet.
 */
async function openDocs(page: Page, route = START.route) {
  await page.goto(route);
  await expect(page.locator('astro-island[ssr][component-url*="DocsNav"]')).toHaveCount(0);
}

test.describe('docs nav — below the breakpoint', () => {
  test.use({ viewport: NARROW });

  test('the sidebar landmark is gone and the Select is the docs nav', async ({ page }) => {
    await openDocs(page);
    await expect(sidebar(page)).toHaveCount(0);
    await expect(picker(page)).toBeVisible();
    // The sidebar's links are not tab stops here either — the whole rendering is display:none.
    await expect(page.getByRole('link', { name: TARGET.name, exact: true })).toHaveCount(0);
  });

  test('the options are grouped by phase, the same groups the sidebar uses', async ({ page }) => {
    await openDocs(page);
    await openPicker(page);
    const listbox = page.getByRole('listbox');

    for (const phase of [TARGET.phase, START.phase, 'Primitives', 'Streams']) {
      await expect(listbox.getByRole('group', { name: phase })).toHaveCount(1);
    }
    // Foundations and Patterns are options too, ungrouped, so the mobile nav reaches every
    // destination the sidebar does.
    for (const section of ['Foundations', 'Patterns']) {
      await expect(listbox.getByRole('option', { name: section, exact: true })).toBeVisible();
    }
    // The page being read is the chosen option, not the placeholder.
    await expect(listbox.getByRole('option', { name: START.name, exact: true })).toHaveAttribute('aria-selected', 'true');
  });

  test('choosing an option navigates to that component’s page', async ({ page }) => {
    await openDocs(page);
    await openPicker(page);
    await page.getByRole('listbox').getByRole('option', { name: TARGET.name, exact: true }).click();

    await page.waitForURL(new RegExp(`/docs/components/${TARGET.slug}/?$`));
    await expect(page.getByRole('heading', { level: 1, name: TARGET.name })).toBeVisible();
    // And the Select on the page it landed on shows where it is.
    await expect(picker(page)).toContainText(TARGET.name);
  });

  test('a page the nav does not list shows the placeholder, not a raw route', async ({ page }) => {
    await openDocs(page, '/docs');
    await expect(picker(page)).toContainText('Jump to a page…');
  });

  test('axe is clean, closed and open', async ({ page }) => {
    await openDocs(page);
    expect(describe((await audit(page).analyze()).violations), 'closed').toEqual([]);

    await openPicker(page);
    expect(describe((await audit(page).analyze()).violations), 'open').toEqual([]);
  });
});

test.describe('docs nav — above the breakpoint', () => {
  test.use({ viewport: WIDE });

  test('the sidebar is the docs nav and the Select is gone', async ({ page }) => {
    await openDocs(page);
    await expect(sidebar(page)).toBeVisible();
    await expect(picker(page)).toHaveCount(0);
  });

  test('every phase group is a Disclosure, open, with its components linked', async ({ page }) => {
    await openDocs(page);
    const nav = sidebar(page);

    // The ten roadmap phases, in the order the generator composes them.
    const phases = ['Primitives', 'Core', 'Controls', 'Focus', 'Overlays', 'Selection', 'Numeric', 'Rows', 'Grids', 'Streams'];
    await expect(nav.getByRole('button')).toHaveText(phases);
    for (const phase of phases) {
      await expect(nav.getByRole('button', { name: phase, exact: true })).toHaveAttribute('aria-expanded', 'true');
    }

    // Foundations and Patterns sit above the groups, as links rather than Disclosures.
    for (const section of ['Foundations', 'Patterns']) {
      await expect(nav.getByRole('link', { name: section, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: TARGET.name, exact: true })).toHaveAttribute(
      'href',
      `/docs/components/${TARGET.slug}`,
    );
    // The page being read is marked, so the sidebar says where you are.
    await expect(nav.getByRole('link', { name: START.name, exact: true })).toHaveAttribute('aria-current', 'page');
  });

  test('a group collapses and its links leave the tree', async ({ page }) => {
    await openDocs(page);
    const nav = sidebar(page);
    const group = nav.getByRole('button', { name: TARGET.phase, exact: true });

    await group.click();
    await expect(group).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: TARGET.name, exact: true })).toHaveCount(0);

    await group.click();
    await expect(group).toHaveAttribute('aria-expanded', 'true');
    await expect(nav.getByRole('link', { name: TARGET.name, exact: true })).toBeVisible();
  });

  test('a sidebar link goes to that component’s page', async ({ page }) => {
    await openDocs(page);
    await sidebar(page).getByRole('link', { name: TARGET.name, exact: true }).click();
    await page.waitForURL(new RegExp(`/docs/components/${TARGET.slug}/?$`));
    await expect(page.getByRole('heading', { level: 1, name: TARGET.name })).toBeVisible();
  });

  test('axe is clean', async ({ page }) => {
    await openDocs(page);
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});

test.describe('docs nav — with scripting off', () => {
  test.use({ javaScriptEnabled: false, viewport: WIDE });

  test('the sidebar is server-rendered: every link works without the island', async ({ page }) => {
    await page.goto(START.route);
    const nav = sidebar(page);
    await expect(nav.getByRole('link', { name: TARGET.name, exact: true })).toBeVisible();
    // Open by default, so nothing is behind a toggle that cannot be pressed.
    await expect(nav.getByRole('button', { name: TARGET.phase, exact: true })).toHaveAttribute('aria-expanded', 'true');
  });
});
