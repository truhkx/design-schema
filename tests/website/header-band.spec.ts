// Job 540's guard (process/website-audit.md, "The header lost its styling"): the header's dark band
// is painted from the active theme's *dark* tokens in every published theme, at a desktop and a
// phone width, and the nav row is centred between the lockup and the theme control.
//
// The regression this catches: the regenerated Landmark drops `className`, so a class passed to it
// never reaches the DOM and header.css matched nothing — a transparent banner in the body's text
// colour. The band is now a plain div inside the Landmark; if anything moves it back, this fails.
// Run with `pnpm gates:website`.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

/** Must match THEME_STORAGE_KEY in apps/website/src/theme-switch.ts. */
const THEME_STORAGE_KEY = 'design-schema:theme';

/** The published themes (generated/themes.json). */
const THEMES = ['calm-precise', 'warm-friendly'];

type ThemeTokens = { colorBackground: string; colorForeground: string; colorLink: string };

/**
 * A theme's built values, from `@design-schema/tokens/<theme>/<mode>` — resolved as the website
 * resolves it (the workspace root does not depend on the tokens package), through its export map.
 */
const fromWebsite = createRequire(new URL('../../apps/website/package.json', import.meta.url));
async function tokens(theme: string, mode: 'light' | 'dark'): Promise<ThemeTokens> {
  return import(pathToFileURL(fromWebsite.resolve(`@design-schema/tokens/${theme}/${mode}`)).href);
}

const VIEWPORTS = [
  { name: 'wide', width: 1280, height: 900 },
  { name: 'narrow', width: 390, height: 844 },
];

/** `#rrggbb` → the `rgb(r, g, b)` that getComputedStyle reports. */
function rgb(hex: string): string {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Expected a #rrggbb token value, got ${hex}`);
  const [r, g, b] = match.slice(1).map((pair) => parseInt(pair, 16));
  return `rgb(${r}, ${g}, ${b})`;
}

const banner = (page: Page) => page.getByRole('banner');
/** The band: the banner Landmark's one child, which carries `data-mode="dark"` and header.css. */
const band = (page: Page) => banner(page).locator('> .ds-site-header');
/** A nav link in the header row. Below the breakpoint the row is `display: none`, but its links
 *  still compute the colour they would paint, and it must be the band's, not the page's. A CSS
 *  locator, because role queries skip `display: none`. */
const navLink = (page: Page) => band(page).locator('.ds-site-header__wide nav a').first();
const homeLink = (page: Page) => band(page).getByRole('link', { name: 'Design Schema', exact: true });
const computed = (page: Page, loc: ReturnType<Page['locator']>, prop: 'backgroundColor' | 'color') =>
  loc.evaluate((el, p) => getComputedStyle(el)[p], prop);

async function openHome(page: Page, theme: string) {
  // Layout.astro's pre-paint script applies the remembered theme, the same path a returning visitor takes.
  await page.addInitScript(([key, id]) => localStorage.setItem(key!, id!), [THEME_STORAGE_KEY, theme]);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ds-theme', theme);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    test.describe(`header band — ${theme}, ${viewport.width}×${viewport.height}`, () => {
      test.use({ viewport: { width: viewport.width, height: viewport.height } });

      test('is painted from the dark tokens, whatever the page mode', async ({ page }) => {
        const dark = await tokens(theme, 'dark');
        await openHome(page, theme);
        await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
        await expect(band(page)).toHaveAttribute('data-mode', 'dark');

        // The band fills the banner: the dark surface *is* the banner, not a strip inside it.
        const [bannerBox, bandBox] = await Promise.all([banner(page).boundingBox(), band(page).boundingBox()]);
        expect(bandBox).toEqual(bannerBox);

        // Polled: the theme sheet swap can take a moment to settle (website-audit.md, "Theme switching").
        await expect.poll(() => computed(page, band(page), 'backgroundColor')).toBe(rgb(dark.colorBackground));
        await expect.poll(() => computed(page, band(page), 'color')).toBe(rgb(dark.colorForeground));
        await expect.poll(() => computed(page, navLink(page), 'color')).toBe(rgb(dark.colorLink));
        // The lockup's text is the band's foreground, not the body's.
        await expect.poll(() => computed(page, homeLink(page), 'color')).toBe(rgb(dark.colorForeground));
      });

      if (viewport.name === 'wide') {
        test('centres the nav links between the lockup and the theme control', async ({ page }) => {
          await openHome(page, theme);
          const row = await page.evaluate(() => {
            const header = document.querySelector('[role="banner"], header')!;
            const home = header.querySelector('.ds-site-header__home')!.getBoundingClientRect();
            const control = header.querySelector('.ds-site-header__wide [role="radiogroup"]')!.getBoundingClientRect();
            const links = Array.from(header.querySelectorAll('.ds-site-header__wide nav a')).map((a) => a.getBoundingClientRect());
            return {
              count: links.length,
              rowMid: (home.right + control.left) / 2,
              linksMid: (Math.min(...links.map((r) => r.left)) + Math.max(...links.map((r) => r.right))) / 2,
            };
          });
          expect(row.count).toBe(3);
          expect(Math.abs(row.linksMid - row.rowMid)).toBeLessThanOrEqual(8);
        });
      } else {
        test("the drawer keeps the page's mode, not the header's", async ({ page }) => {
          await openHome(page, theme);
          await page.getByRole('button', { name: 'Open menu' }).click();
          const drawer = page.getByRole('dialog', { name: 'Menu' });
          await expect(drawer).toHaveCount(1);
          // Portaled to <body>: the nearest mode is the page's own, never the band's.
          expect(await drawer.evaluate((el) => el.closest('[data-mode]')?.tagName)).toBe('HTML');
          const link = drawer.getByRole('link', { name: 'Docs', exact: true });
          await expect.poll(() => computed(page, link, 'color')).toBe(rgb((await tokens(theme, 'light')).colorLink));
        });
      }
    });
  }
}
