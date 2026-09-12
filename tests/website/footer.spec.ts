// Job 509's gate for the site footer: it is on every kind of page, it is a top-level landmark, its
// three links go where the repository says they go, and its copyright line is the LICENSE's own.
// Run with `pnpm gates:website`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');

const WIDE = { width: 1280, height: 800 };
const NARROW = { width: 390, height: 844 };

/** The repository, from the generated nav — the same file the footer reads it from. */
const REPO: string = (() => {
  const nav = JSON.parse(read('generated/nav.json')) as { top: { href: string; external?: boolean }[] };
  const github = nav.top.find((item) => item.external && item.href.includes('github.com'));
  if (!github) throw new Error('generated/nav.json has no external GitHub entry — re-run `pnpm nav`.');
  return github.href;
})();

/** The npm organisation is the published package's scope, which is where the footer derives it. */
const SCOPE: string = (() => {
  const manifest = JSON.parse(read('packages/react/package.json')) as { name: string };
  const scope = /^@([^/]+)\//.exec(manifest.name)?.[1];
  if (!scope) throw new Error(`packages/react is published unscoped (${manifest.name}); it has no npm org.`);
  return scope;
})();

/** The one copyright line in the repository. The footer renders it; nothing re-types it. */
const COPYRIGHT: string = (() => {
  const line = /^Copyright \(c\) (.+)$/m.exec(read('LICENSE'))?.[1]?.trim();
  if (!line) throw new Error('LICENSE has no `Copyright (c) …` line.');
  return line;
})();

/** label → the destination it must have. */
const LINKS: [string, string][] = [
  ['GitHub', REPO],
  ['npm', `https://www.npmjs.com/org/${SCOPE}`],
  ['License', `${REPO}/blob/main/LICENSE`],
];

/** One of each kind of page the site builds: a content page, the home page, and a docs page. */
const PAGES = ['/', '/about', '/docs', '/docs/components/button'];

const footer = (page: Page) => page.getByRole('contentinfo');

test.describe('site footer — on every page, with no JavaScript', () => {
  for (const path of PAGES) {
    test(`is in the served HTML of ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain('role="contentinfo"');
      // The footer carries no island, so its links and its copyright are text in the document.
      for (const [label] of LINKS) expect(html).toContain(`>${label}<`);
      expect(html).toContain(COPYRIGHT);
    });
  }

  test.describe('with scripting off', () => {
    test.use({ javaScriptEnabled: false, viewport: WIDE });

    test('the three links and the copyright line render', async ({ page }) => {
      await page.goto('/');
      for (const [label, href] of LINKS) {
        const link = footer(page).getByRole('link', { name: new RegExp(`^${label}`) });
        await expect(link).toHaveAttribute('href', href);
        // All three leave the product, so all three open in a new tab and say so in their name.
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
      await expect(footer(page).getByText(`© ${COPYRIGHT}`)).toBeVisible();
    });
  });
});

test.describe('site footer — a landmark of its own', () => {
  test.use({ viewport: WIDE });

  test('is a sibling of main, not a region inside it', async ({ page }) => {
    await page.goto('/about');
    await expect(footer(page)).toHaveCount(1);
    // A `footer` descended from `main` is not a `contentinfo` landmark at all, so this is the
    // difference between the page having a footer landmark and only appearing to.
    await expect(page.getByRole('main').getByRole('contentinfo')).toHaveCount(0);
    expect(await footer(page).evaluate((el) => el.parentElement?.tagName)).toBe('BODY');
  });

  test('sits below the content, not partway up a short page', async ({ page }) => {
    await page.goto('/docs/foundations');
    const box = await footer(page).boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    // The shortest page on the site still pushes the footer to the fold or past it.
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThanOrEqual(viewport?.height ?? 0);
  });

  test('is reachable and readable on a phone too', async ({ page }) => {
    await page.setViewportSize(NARROW);
    await page.goto('/');
    // The row wraps rather than overflowing: no page-level horizontal scroll at 390px.
    await expect(footer(page)).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
