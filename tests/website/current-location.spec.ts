// Job 552's guard (process/website-audit-2.md, "Current location"): the page being read is marked in
// the docs sidebar and the header, its group is open, and the sidebar — not the window — is scrolled
// so the current entry is on screen. Every published theme × light and dark. Run with
// `pnpm gates:website`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

import { contrastFailures } from './contrast';

/** Must match THEME_STORAGE_KEY in apps/website/src/theme-switch.ts. */
const THEME_STORAGE_KEY = 'design-schema:theme';
/** Must match MODE_STORAGE_KEY in apps/website/src/mode-switch.ts. */
const MODE_STORAGE_KEY = 'design-schema:mode';

const THEMES = (
  JSON.parse(readFileSync(fileURLToPath(new URL('../../generated/themes.json', import.meta.url)), 'utf8')) as {
    id: string;
    published: boolean;
  }[]
)
  .filter((theme) => theme.published)
  .map((theme) => theme.id);
const MODES = ['light', 'dark'] as const;
type Mode = (typeof MODES)[number];

/**
 * First in the list, the one the audit measured off screen, the last of the Grids, and the last in
 * the list. The job named TreeGrid as last; generated/nav.json has Streams (Feed) after Grids, so
 * both are here.
 */
const PAGES = [
  { route: '/docs/components/icon/', name: 'Icon' },
  { route: '/docs/components/bottomsheet/', name: 'BottomSheet' },
  { route: '/docs/components/treegrid/', name: 'TreeGrid' },
  { route: '/docs/components/feed/', name: 'Feed' },
];

type Tokens = {
  colorBackground: string;
  colorBackgroundSubtle: string;
  colorForegroundStrong: string;
  colorControlSelectedBackground: string;
};
const fromWebsite = createRequire(new URL('../../apps/website/package.json', import.meta.url));
const tokens = async (theme: string, mode: Mode) =>
  (await import(pathToFileURL(fromWebsite.resolve(`@design-schema/tokens/${theme}/${mode}`)).href)) as Tokens;

const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};
const ratio = (a: string, b: string) => {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
};

const sidebar = (page: Page) => page.getByRole('navigation', { name: 'Component docs' });
const scroller = (page: Page) => page.locator('.ds-docs-nav__sidebar');
const mainNav = (page: Page) => page.getByRole('banner').getByRole('navigation', { name: 'Main' });

async function visit(page: Page, theme: string, mode: Mode, route: string) {
  await page.addInitScript(
    ([themeKey, modeKey, t, m]) => {
      localStorage.setItem(themeKey!, t!);
      localStorage.setItem(modeKey!, m!);
      // The sidebar's scroll offset once the inline script's last pass (at `load`) has run, to prove
      // nothing after it — hydration included — moves it. A task later, so it reads after that pass.
      window.addEventListener('load', () =>
        setTimeout(() => {
          const box = document.querySelector('.ds-docs-nav__sidebar');
          (window as unknown as { scrollAtLoad?: number }).scrollAtLoad = box ? box.scrollTop : -1;
        }),
      );
    },
    [THEME_STORAGE_KEY, MODE_STORAGE_KEY, theme, mode],
  );
  await page.goto(route);
  await expect(page.locator('html')).toHaveAttribute('data-ds-theme', theme);
  await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
  await expect(page.locator('astro-island[ssr][component-url*="DocsNav"]')).toHaveCount(0);
  await expect(page.locator('astro-island[ssr][component-url*="HeaderNav"]')).toHaveCount(0);
}

test.use({ viewport: { width: 1280, height: 900 } });

for (const theme of THEMES) {
  for (const mode of MODES) {
    test.describe(`current location — ${theme} / ${mode}`, () => {
      for (const { route, name } of PAGES) {
        test(`${route}: the sidebar marks ${name}, shows it, and leaves the window alone`, async ({ page }) => {
          await visit(page, theme, mode, route);
          const t = await tokens(theme, mode);
          const current = sidebar(page).getByRole('link', { name, exact: true });

          await expect(current).toHaveAttribute('aria-current', 'page');
          await expect(sidebar(page).locator('[aria-current="page"]')).toHaveCount(1);
          // The theme sheet swap settles a moment after load; wait for the bar's token before measuring.
          await expect
            .poll(() => current.evaluate((el) => getComputedStyle(el).borderInlineStartColor))
            .toBe(rgb(t.colorControlSelectedBackground));
          expect(await current.evaluate((el) => getComputedStyle(el).color)).toBe(rgb(t.colorForegroundStrong));
          expect(await current.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(t.colorBackgroundSubtle));

          // Heavier than every other link in its list — the mark that is not colour.
          const weights = await current.evaluate((el) => {
            const list = el.parentElement!.closest('[data-ds="Stack"]') ?? el.parentElement!;
            const others = Array.from(list.querySelectorAll('a')).filter((a) => a !== el);
            return { own: Number(getComputedStyle(el).fontWeight), others: others.map((a) => Number(getComputedStyle(a).fontWeight)) };
          });
          expect(weights.others.length).toBeGreaterThan(0);
          expect(weights.own).toBeGreaterThan(Math.max(...weights.others));

          // Text 4.5:1 on its fill, the bar 3:1 against the fill and the sidebar beside it.
          expect(ratio(t.colorForegroundStrong, t.colorBackgroundSubtle)).toBeGreaterThanOrEqual(4.5);
          expect(ratio(t.colorControlSelectedBackground, t.colorBackgroundSubtle)).toBeGreaterThanOrEqual(3);
          expect(ratio(t.colorControlSelectedBackground, t.colorBackground)).toBeGreaterThanOrEqual(3);
          const failures = (await contrastFailures(page)).filter((f) => f.text === name);
          expect(failures).toEqual([]);

          // Inside the scroller's visible box, and the window never scrolled to get it there.
          const placement = await current.evaluate((el) => {
            const box = el.closest('.ds-docs-nav__sidebar')!;
            const outer = box.getBoundingClientRect();
            const inner = el.getBoundingClientRect();
            return { top: inner.top - outer.top, bottom: inner.bottom - outer.top, height: box.clientHeight };
          });
          expect(placement.top).toBeGreaterThanOrEqual(0);
          expect(placement.bottom).toBeLessThanOrEqual(placement.height);
          expect(await page.evaluate(() => window.scrollY)).toBe(0);

          // Hydration kept the offset the inline script set.
          const atLoad = await page.evaluate(() => (window as unknown as { scrollAtLoad?: number }).scrollAtLoad);
          expect(await scroller(page).evaluate((el) => el.scrollTop)).toBe(atLoad);
          // And nothing took focus to get there.
          expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
        });
      }

      test('/docs/foundations/: the header marks Docs, with weight and an underline at rest', async ({ page }) => {
        await visit(page, theme, mode, '/docs/foundations/');
        const docs = mainNav(page).getByRole('link', { name: 'Docs', exact: true });
        await expect(docs).toHaveAttribute('aria-current', 'page');
        await expect(mainNav(page).locator('[aria-current]')).toHaveCount(1);
        await page.mouse.move(0, 0);
        const style = await docs.evaluate((el) => ({
          decoration: getComputedStyle(el).textDecorationLine,
          weight: Number(getComputedStyle(el).fontWeight),
        }));
        expect(style.decoration).toBe('underline');
        const about = mainNav(page).getByRole('link', { name: 'About', exact: true });
        expect(style.weight).toBeGreaterThan(await about.evaluate((el) => Number(getComputedStyle(el).fontWeight)));
        await expect(about).not.toHaveAttribute('aria-current', /.*/);
        // The sidebar marks the same page, through the same helper.
        await expect(sidebar(page).getByRole('link', { name: 'Foundations', exact: true })).toHaveAttribute('aria-current', 'page');
      });
    });
  }
}

test('current location — a theme sheet that arrives late still ends with the link in view', async ({ page }) => {
  // A remembered non-default theme loads without blocking render; until it lands the sidebar's
  // tokens are undefined and it does not scroll. Hold every token sheet back to make that certain.
  await page.route('**/_astro/tokens.*.css', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await visit(page, THEMES[THEMES.length - 1]!, 'light', '/docs/components/bottomsheet/');
  const inView = await sidebar(page)
    .getByRole('link', { name: 'BottomSheet', exact: true })
    .evaluate((el) => {
      const outer = el.closest('.ds-docs-nav__sidebar')!.getBoundingClientRect();
      const inner = el.getBoundingClientRect();
      return inner.top >= outer.top && inner.bottom <= outer.bottom;
    });
  expect(inView).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('current location — About is current on /about, Docs is not', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('astro-island[ssr][component-url*="HeaderNav"]')).toHaveCount(0);
  await expect(mainNav(page).getByRole('link', { name: 'About', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(mainNav(page).getByRole('link', { name: 'Docs', exact: true })).not.toHaveAttribute('aria-current', /.*/);
});

test('current location — the current page’s group is open', async ({ page }) => {
  await page.goto('/docs/components/treegrid/');
  const link = sidebar(page).getByRole('link', { name: 'TreeGrid', exact: true });
  await expect(link).toBeVisible();
  await expect(sidebar(page).getByRole('button', { name: 'Grids', exact: true })).toHaveAttribute('aria-expanded', 'true');
});
