// Job 509's gate for the About page: it is served, it reads without JavaScript, and it is clean
// under the same axe rule set the rest of the site is held to. Run with `pnpm gates:website`.
import { test, expect, type Page } from '@playwright/test';

import { audit, describe } from './axe';

const NARROW = { width: 390, height: 844 };
const WIDE = { width: 1280, height: 800 };

/** The page's outline: one h1, then the two audiences and what they share. */
const HEADINGS = [
  'The adopter: “I have an idea of what I want my site to feel like”',
  'The owner: “I want to change the rules and own it”',
  'What both paths share',
];

/** A distinctive clause from each section, so rewording a sentence does not fail the gate. */
const PHRASES = [
  'without generating a single component',
  'it customises the schema',
  'there is no second place where the truth lives',
];

/** The header island is the only client JS on the page; wait for it before auditing the final DOM. */
async function openAbout(page: Page) {
  await page.goto('/about');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

test.describe('about page — a plain content page', () => {
  test('is served, and its content is in the HTML', async ({ request }) => {
    const response = await request.get('/about');
    expect(response.status()).toBe(200);
    const html = await response.text();

    // View-source: the words themselves, not a props blob for an island to render later.
    for (const heading of HEADINGS) expect(html).toContain(heading);
    for (const phrase of PHRASES) expect(html).toContain(phrase);
  });

  test.describe('with scripting off', () => {
    test.use({ javaScriptEnabled: false, viewport: WIDE });

    test('the outline reads h1 → h2 and both links are real destinations', async ({ page }) => {
      await page.goto('/about');
      await expect(page.getByRole('heading', { level: 1, name: 'About' })).toBeVisible();
      for (const heading of HEADINGS) {
        await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
      }

      const main = page.getByRole('main');
      await expect(main.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '/docs');
      const github = main.getByRole('link', { name: /^View the source on GitHub/ });
      await expect(github).toHaveAttribute('href', /^https:\/\/github\.com\//);
      await expect(github).toHaveAttribute('target', '_blank');
    });
  });

  test('the copy sits in the prose measure the plan asks for', async ({ page }) => {
    await page.setViewportSize(WIDE);
    await openAbout(page);
    // `Container(width="prose")` — the 65-character measure, not the page width, because this is
    // a page to read rather than a layout to scan.
    await expect(page.getByRole('main').locator('.ds-container--width-prose')).toHaveCount(1);
  });

  /**
   * The header's GitHub entry is an external link, never a route (website-plan.md, "About and
   * GitHub"). `tools/__tests__/site_nav.test.ts` asserts the same thing about the generated data;
   * this is the rendered half — and it asserts the absence of a `/github` page, which is the part
   * only a built site can answer.
   */
  test('GitHub in the top nav is an external link, and there is no page behind it', async ({ page, request }) => {
    await page.setViewportSize(WIDE);
    await openAbout(page);
    const github = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /GitHub/ });
    await expect(github).toHaveAttribute('href', /^https:\/\/github\.com\//);
    await expect(github).toHaveAttribute('target', '_blank');
    await expect(github).toHaveAttribute('rel', /noopener/);

    expect((await request.get('/github')).status()).toBe(404);
  });
});

test.describe('about page — axe over Lighthouse’s accessibility rule set', () => {
  for (const [name, viewport] of [
    ['wide', WIDE],
    ['narrow', NARROW],
  ] as const) {
    test(`clean at ${name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openAbout(page);
      const results = await audit(page).analyze();
      expect(describe(results.violations)).toEqual([]);
    });
  }
});
