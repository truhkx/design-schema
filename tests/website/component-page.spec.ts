// Job 506's gate: `/docs/components/[slug]` is the same template for all 51 components, and every
// thing on it is read from the schema rather than authored. Run with `pnpm gates:website`.
//
// The three assertions the job names are checked against the schema on disk, not against a list
// written here: the props table's row count is compared to the doc's own prop count, the keyboard
// section's presence to whether `generated/keyboard/<Name>.json` exists, and the "not yet generated"
// alert to a fresh listing of `packages/react/src`. So the gate keeps meaning something as the
// generator catches up — which it already has: all 51 components have a file there today, and the
// plan's "36 not yet generated" is history. The alert is expected on exactly none of them, and this
// gate is what would notice if that ever stopped being true in either direction.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page } from '@playwright/test';

import { audit, describe } from './axe';

/** The repo root, from this file rather than from `process.cwd()`, so the gate can be run from anywhere. */
const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');
const list = (path: string) => readdirSync(fileURLToPath(new URL(path, ROOT)));

interface SchemaEntry {
  id: string;
  title: string;
  description: string;
  component: {
    name: string;
    anatomy: string[];
    props: Record<string, { required?: boolean }>;
    events?: Record<string, unknown>;
    a11y: { role: string; requires: string[]; contrast?: unknown[] };
  };
}

const COMPONENTS: SchemaEntry[] = JSON.parse(read('generated/components.json'));

/** The keyboard specs that exist. 29 of the 51 today; the rest omit the keyboard section entirely. */
const KEYBOARD = new Set(
  list('generated/keyboard')
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.slice(0, -'.json'.length)),
);

/**
 * The components with no file in `packages/react/src` — recomputed here, never hard-coded, because
 * that list is the whole point of the "not yet generated" branch and it shrinks with every
 * generation pass.
 */
const REACT_SOURCES = new Set(list('packages/react/src'));
const NOT_GENERATED = new Set(
  COMPONENTS.filter((entry) => !REACT_SOURCES.has(`${entry.component.name}.tsx`)).map((entry) => entry.id),
);

const route = (slug: string) => `/docs/components/${slug}`;

/** The rows of one of the page's tables, located by the marker the page puts on each `Table` root. */
const rows = (page: Page, table: string) => page.locator(`[data-table="${table}"] tbody tr`);

/**
 * Scrolls the accessibility accordion into view and waits for its island to hydrate.
 *
 * It is `client:visible`, so nothing loads until it is on screen — which is the point, and which
 * means "wait for hydration" here has to make it visible first. Astro drops the `ssr` attribute when
 * an island hydrates; the wait is on that rather than on a timeout.
 */
async function hydrate(page: Page, inside: Locator) {
  await inside.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr][component-url*="AccessibilityContract"]')).toHaveCount(0);
}

test.describe('component page template', () => {
  test('every component in the schema has a page', () => {
    expect(COMPONENTS).toHaveLength(51);
  });

  for (const entry of COMPONENTS) {
    const { id, component } = entry;
    const name = component.name;

    test(`${id}: header, props table and accessibility contract`, async ({ page }) => {
      const response = await page.goto(route(id));
      expect(response?.status(), 'the page is built').toBe(200);

      // 1 — the header block: Breadcrumb, the name as the h1, the doc's own description below it.
      // `.first()`: since job 507 the examples section renders live stories, so Breadcrumb's own
      // page has a second Breadcrumb below this one. The page's own crumb is the one at the top.
      const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' }).first();
      await expect(crumbs.getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
      await expect(crumbs).toContainText('Components');
      await expect(crumbs).toContainText(name);
      await expect(page.getByRole('heading', { level: 1, name, exact: true })).toBeVisible();
      await expect(page.locator('main')).toContainText(entry.description.slice(0, 60));

      // 2 — the examples section job 507 put where job 506's placeholder was. What is *in* it is
      // examples.spec.ts's gate; here it only has to be between the header block and the props table.
      await expect(page.getByRole('heading', { level: 2, name: 'Examples', exact: true })).toBeVisible();

      // 3 — the props table has exactly one row per prop the doc declares.
      await expect(rows(page, `${name}-props`)).toHaveCount(Object.keys(component.props).length);
      const eventCount = Object.keys(component.events ?? {}).length;
      await expect(rows(page, `${name}-events`)).toHaveCount(eventCount);

      // 4 — the accessibility accordion: role and structure and contrast always, keyboard only for
      // the components that have a spec.
      await expect(page.getByRole('button', { name: 'Role & structure' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Contrast & motion' })).toBeVisible();
      const hasKeyboard = KEYBOARD.has(name);
      await expect(page.getByRole('button', { name: 'Keyboard support' })).toHaveCount(hasKeyboard ? 1 : 0);
      if (hasKeyboard) {
        const spec = JSON.parse(read(`generated/keyboard/${name}.json`)) as { rules: unknown[] };
        await expect(rows(page, `${name}-keyboard`)).toHaveCount(spec.rules.length);
      }

      // 5 — the "not yet generated" notice, on exactly the components missing from packages/react/src.
      await expect(page.getByText('Not yet generated')).toHaveCount(NOT_GENERATED.has(id) ? 1 : 0);
    });
  }
});

test.describe('the accessibility contract itself', () => {
  /** A component with a keyboard model, contrast pairs and an accessible-name requirement. */
  const RICH = { id: 'select', name: 'Select' };
  /** A component with no keyboard model at all, so the accordion has two sections, not three. */
  const PLAIN = { id: 'text', name: 'Text' };

  test('the whole contract is in the static HTML, before any island hydrates', async ({ page }) => {
    // The response body, not the live DOM: this is what the server sent, so it is the contract a
    // reader gets with the island's JavaScript slow, blocked or still in flight.
    const response = await page.goto(route(RICH.id));
    expect(response?.status()).toBe(200);
    const html = await response!.text();

    expect(html, 'the role sentence').toContain('Implicit ARIA role');
    expect(html, 'the anatomy parts').toContain('trigger');
    expect(html, 'the keyboard table').toContain(`data-table="${RICH.name}-keyboard"`);
    expect(html, 'the contrast table').toContain(`data-table="${RICH.name}-contrast"`);
  });

  test('a component with no keyboard spec omits the section rather than emptying it', async ({ page }) => {
    await page.goto(route(PLAIN.id));
    await expect(page.getByRole('button', { name: 'Keyboard support' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Role & structure' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contrast & motion' })).toBeVisible();
  });

  test('the info Alert names the decisions the consumer has to make', async ({ page }) => {
    await page.goto(route(RICH.id));
    // Select requires an accessible name and a label association, so both lines are expected.
    await expect(page.getByText('Decisions this component leaves to you')).toBeVisible();
    await expect(page.locator('main')).toContainText('Supply an accessible name');
  });

  test('the sections fold once the island has hydrated', async ({ page }) => {
    await page.goto(route(RICH.id));
    const trigger = page.getByRole('button', { name: 'Role & structure' });
    await hydrate(page, trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('axe is clean on a component page', async ({ page }) => {
    await page.goto(route(RICH.id));
    await hydrate(page, page.getByRole('button', { name: 'Role & structure' }));
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});
