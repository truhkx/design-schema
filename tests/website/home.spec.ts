// Job 504's gate: the home page's accessibility audit, and the promise that its hero is readable
// with no JavaScript at all. Run with `pnpm gates:website`.
//
// On Lighthouse: the job's gate is "Lighthouse accessibility >= 95", and Lighthouse's accessibility
// category *is* axe-core — its audits are axe rules, weighted. Lighthouse itself is not a dependency
// of this repo (and pulling it in would add a headless-Chrome driver next to the one Playwright
// already runs), so the gate here runs the same engine over the same rule set: every axe rule
// Lighthouse scores, at both viewports. Zero violations is a 100; the threshold is cleared with the
// whole margin to spare, and a failure names the rule Lighthouse would have named.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const NARROW = { width: 390, height: 844 };
const WIDE = { width: 1280, height: 800 };

const HEADING = 'Design Schema: An Agentic Design System';
/** A distinctive clause of the hero statement, so a reworded sentence does not fail the gate. */
const STATEMENT = 'every component is specified once, in plain language';
const PILLARS = ['Schema-driven', 'Every platform', 'Zero-token theming', 'Accessible by construction'];

/**
 * The rule set Lighthouse's accessibility category scores: the WCAG tags plus axe's best-practice
 * rules, which is where `heading-order`, `region` and `landmark-one-main` live — all three are
 * Lighthouse audits, and none of them is tagged WCAG.
 */
const audit = (page: Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']);

/** The header island is the only client JS on the page; wait for it before auditing the final DOM. */
async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

test.describe('home page — the hero needs no JavaScript', () => {
  test('the heading and the statement are in the served HTML', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const html = await response.text();

    // View-source: the text itself, not a props blob for an island to render later.
    expect(html).toContain(HEADING);
    expect(html).toContain(STATEMENT);
    for (const pillar of PILLARS) expect(html).toContain(pillar);
  });

  test.describe('with scripting off', () => {
    test.use({ javaScriptEnabled: false, viewport: WIDE });

    test('the hero and the feature cards still render and read', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1, name: HEADING })).toBeVisible();
      await expect(page.getByText(STATEMENT, { exact: false })).toBeVisible();

      // Both calls to action are real destinations, not script-driven buttons.
      await expect(page.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '/docs');
      const github = page.getByRole('link', { name: /^View on GitHub/ });
      await expect(github).toHaveAttribute('href', /^https:\/\/github\.com\//);
      await expect(github).toHaveAttribute('target', '_blank');

      for (const pillar of PILLARS) {
        await expect(page.getByRole('heading', { level: 3, name: pillar })).toBeVisible();
      }
    });
  });
});

test.describe('home page — page art is decorative', () => {
  test.use({ viewport: WIDE });

  test('the backdrop and the logo mark are hidden from assistive technology', async ({ page }) => {
    await openHome(page);
    // Present on screen…
    await expect(page.locator('.ds-home-hero__backdrop')).toBeVisible();
    await expect(page.locator('.ds-home-hero__logo')).toBeVisible();
    // …and absent from the accessibility tree, so neither is announced before the h1.
    for (const selector of ['.ds-home-hero__backdrop', '.ds-home-hero__logo', '.ds-site-header__mark']) {
      await expect(page.locator(selector)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  test('the mark takes its color from the theme, not from the file', async ({ page }) => {
    await openHome(page);
    const stroke = await page
      .locator('.ds-home-hero__logo')
      .evaluate((svg) => getComputedStyle(svg).getPropertyValue('stroke'));
    const foreground = await page
      .locator('.ds-home-hero__logo')
      .evaluate((svg) => getComputedStyle(svg).getPropertyValue('color'));
    // `currentColor` resolves to whatever the page's foreground is; the two agree or the mark has a
    // color of its own, which is the thing the asset is not allowed to have.
    expect(stroke).toBe(foreground);
  });
});

/**
 * The one rule apps/website/src/styles/home.css adds for the feature section, guarded: a wrapped
 * Stack with no column width collapses the four cards into four slivers at every viewport (see
 * generated/gaps/Stack.web.md). This asserts the outcome — a row on a desktop, a column on a phone —
 * rather than the CSS, so a real grid primitive can replace the rule without touching this test.
 */
test.describe('home page — the feature cards form columns', () => {
  const cardTops = (page: Page) =>
    page.locator('.ds-home-pillars > * > *').evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().top)));

  test('one row on a wide viewport', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await openHome(page);
    const tops = await cardTops(page);
    expect(tops).toHaveLength(PILLARS.length);
    expect(new Set(tops).size).toBe(1);
  });

  test('one per row on a narrow viewport', async ({ page }) => {
    await page.setViewportSize(NARROW);
    await openHome(page);
    const tops = await cardTops(page);
    expect(new Set(tops).size).toBe(PILLARS.length);
  });
});

test.describe('home page — axe over Lighthouse’s accessibility rule set', () => {
  for (const [name, viewport] of [
    ['wide', WIDE],
    ['narrow', NARROW],
  ] as const) {
    test(`clean at ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openHome(page);
      const results = await audit(page).analyze();
      expect(describe(results.violations)).toEqual([]);
    });
  }
});

/** Violations as readable one-liners, so a failure names the rule and the node instead of dumping JSON. */
function describe(violations: { id: string; help: string; nodes: { target: unknown[] }[] }[]): string[] {
  return violations.map((v) => `${v.id} — ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join('; ')})`);
}
