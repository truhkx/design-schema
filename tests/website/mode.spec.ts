// Job 541's guard (process/website-audit.md, "No dark mode"): the site follows a light / dark /
// system choice from the header, defaults to `prefers-color-scheme`, applies it before first paint,
// and every published theme passes AA text contrast in both modes on the pages the audit measured.
// Run with `pnpm gates:website`.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

import { contrastFailures } from './contrast';

/** Must match THEME_STORAGE_KEY in apps/website/src/theme-switch.ts. */
const THEME_STORAGE_KEY = 'design-schema:theme';
/** Must match MODE_STORAGE_KEY in apps/website/src/mode-switch.ts. */
const MODE_STORAGE_KEY = 'design-schema:mode';

/** The themes the site publishes, re-read rather than typed out — the same source the switcher uses. */
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

/** The home page, the docs index, and three component pages — the audit's contrast set. */
const ROUTES = ['/', '/docs/', '/docs/components/button/', '/docs/components/card/', '/docs/components/datagrid/'];

const fromWebsite = createRequire(new URL('../../apps/website/package.json', import.meta.url));
async function colorLink(theme: string, mode: Mode): Promise<string> {
  const tokens = (await import(pathToFileURL(fromWebsite.resolve(`@design-schema/tokens/${theme}/${mode}`)).href)) as {
    colorLink: string;
  };
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(tokens.colorLink);
  if (!match) throw new Error(`Expected a #rrggbb color.link, got ${tokens.colorLink}`);
  const [r, g, b] = match.slice(1).map((pair) => parseInt(pair, 16));
  return `rgb(${r}, ${g}, ${b})`;
}

const html = (page: Page) => page.locator('html');
const pageMode = (page: Page) => page.evaluate(() => document.documentElement.dataset.mode);
const appearance = (page: Page) => page.getByRole('radiogroup', { name: 'Appearance' });
/** A footer link: it follows the page's mode (the header's links are always dark). */
const footerLink = (page: Page) => page.getByRole('contentinfo').getByRole('link').first();

/** Seeds storage before any page script runs — the path a returning visitor takes. */
async function remember(page: Page, entries: Record<string, string>) {
  await page.addInitScript((pairs) => {
    for (const [key, value] of Object.entries(pairs)) localStorage.setItem(key, value);
  }, entries);
}

/** Records `data-mode` as it stands at DOMContentLoaded, on every document the page loads. */
async function recordModeAtDomContentLoaded(page: Page) {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as unknown as { modeAtDcl?: string }).modeAtDcl = document.documentElement.dataset.mode;
    });
  });
}
const modeAtDcl = (page: Page) => page.evaluate(() => (window as unknown as { modeAtDcl?: string }).modeAtDcl);

async function waitForHeader(page: Page) {
  await expect(page.locator('astro-island[ssr][component-url*="HeaderNav"]')).toHaveCount(0);
}

test.describe('mode — contrast in every theme × mode', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      for (const route of ROUTES) {
        test(`${theme} / ${mode}: ${route} has no AA text-contrast failures`, async ({ page }) => {
          await remember(page, { [THEME_STORAGE_KEY]: theme, [MODE_STORAGE_KEY]: mode });
          await page.goto(route);
          await expect(html(page)).toHaveAttribute('data-ds-theme', theme);
          await expect(html(page)).toHaveAttribute('data-mode', mode);
          // The theme sheet swap takes a moment to settle (website-audit.md, "Theme switching"); a
          // walk before it would measure the default theme's colours.
          const expected = await colorLink(theme, mode);
          await expect.poll(() => footerLink(page).evaluate((el) => getComputedStyle(el).color)).toBe(expected);
          const failures = await contrastFailures(page);
          expect(failures.map((f) => `${f.ratio}:1 < ${f.required}:1  ${f.fg} on ${f.bg}  "${f.text}"  (${f.path})`)).toEqual([]);
        });
      }
    }
  }
});

test('mode — the contrast walk catches a planted failure, and lets a large one through at 3:1', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const planted = (text: string, style: string) => {
      const p = document.createElement('p');
      p.textContent = text;
      p.setAttribute('style', style);
      document.querySelector('main')!.append(p);
    };
    // #767676 on #ffffff is 4.54:1 (passes); #808080 is 3.95:1 — fails normal text, passes large.
    planted('planted-normal', 'color:#808080;background:#ffffff;font-size:16px');
    planted('planted-large', 'color:#808080;background:#ffffff;font-size:24px');
    planted('planted-pass', 'color:#767676;background:#ffffff;font-size:16px');
  });
  const planted = (await contrastFailures(page)).filter((f) => f.text.startsWith('planted'));
  expect(planted.map((f) => f.text)).toEqual(['planted-normal']);
});

test.describe('mode — what decides it', () => {
  for (const scheme of MODES) {
    test.describe(`with prefers-color-scheme: ${scheme}`, () => {
      test.use({ colorScheme: scheme });

      test('nothing stored follows the system preference, and keeps following it', async ({ page }) => {
        await page.goto('/');
        expect(await pageMode(page)).toBe(scheme);
        const other: Mode = scheme === 'light' ? 'dark' : 'light';
        await page.emulateMedia({ colorScheme: other });
        await expect.poll(() => pageMode(page)).toBe(other);
      });

      for (const stored of MODES) {
        test(`a stored "${stored}" wins, and ignores later system changes`, async ({ page }) => {
          await remember(page, { [MODE_STORAGE_KEY]: stored });
          await page.goto('/');
          expect(await pageMode(page)).toBe(stored);
          await page.emulateMedia({ colorScheme: scheme === 'light' ? 'dark' : 'light' });
          // Give a (wrong) listener every chance to fire before asserting nothing changed.
          await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          expect(await pageMode(page)).toBe(stored);
        });
      }

      test('a stored "system" behaves as nothing stored', async ({ page }) => {
        await remember(page, { [MODE_STORAGE_KEY]: 'system' });
        await page.goto('/');
        expect(await pageMode(page)).toBe(scheme);
      });
    });
  }

  test('the server emits no data-mode; with scripts off the page is light', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(html(page)).not.toHaveAttribute('data-mode', /.*/);
    await expect
      .poll(() => footerLink(page).evaluate((el) => getComputedStyle(el).color))
      .toBe(await colorLink(THEMES[0]!, 'light'));
    await context.close();
  });
});

test.describe('mode — the header control', () => {
  test.use({ viewport: { width: 1280, height: 800 }, colorScheme: 'light' });

  test('Light / Dark / System, next to the theme control, defaulting to System', async ({ page }) => {
    await page.goto('/');
    await waitForHeader(page);
    const group = appearance(page);
    await expect(group).toBeVisible();
    await expect(group.getByRole('radio')).toHaveText(['Light', 'Dark', 'System']);
    await expect(group.getByRole('radio', { name: 'System' })).toBeChecked();
  });

  test('choosing writes storage and data-mode, and the header band stays dark', async ({ page }) => {
    await page.goto('/');
    await waitForHeader(page);
    const band = page.getByRole('banner').locator('> .ds-site-header');

    await appearance(page).getByRole('radio', { name: 'Dark' }).click();
    await expect(html(page)).toHaveAttribute('data-mode', 'dark');
    expect(await page.evaluate((key) => localStorage.getItem(key), MODE_STORAGE_KEY)).toBe('dark');
    await expect(band).toHaveAttribute('data-mode', 'dark');

    await appearance(page).getByRole('radio', { name: 'Light' }).click();
    await expect(html(page)).toHaveAttribute('data-mode', 'light');
    await expect(band).toHaveAttribute('data-mode', 'dark');

    // System: resolves through the media query now, and follows it afterwards.
    await page.emulateMedia({ colorScheme: 'dark' });
    await appearance(page).getByRole('radio', { name: 'System' }).click();
    await expect(html(page)).toHaveAttribute('data-mode', 'dark');
    expect(await page.evaluate((key) => localStorage.getItem(key), MODE_STORAGE_KEY)).toBe('system');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).toHaveAttribute('data-mode', 'light');
  });

  test('the choice survives a reload and a navigation, already applied at DOMContentLoaded', async ({ page }) => {
    await recordModeAtDomContentLoaded(page);
    await page.goto('/');
    await waitForHeader(page);
    await appearance(page).getByRole('radio', { name: 'Dark' }).click();
    await expect(html(page)).toHaveAttribute('data-mode', 'dark');

    await page.reload();
    expect(await modeAtDcl(page)).toBe('dark');
    await waitForHeader(page);
    await expect(appearance(page).getByRole('radio', { name: 'Dark' })).toBeChecked();

    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Docs', exact: true }).click();
    await page.waitForURL(/\/docs\/?$/);
    expect(await modeAtDcl(page)).toBe('dark');
  });
});

test.describe('mode — the narrow drawer', () => {
  test.use({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });

  test('repeats the Appearance control, and it works there too', async ({ page }) => {
    await page.goto('/');
    await waitForHeader(page);
    await expect(appearance(page)).toBeHidden();
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await expect(drawer).toHaveClass(/ds-side-panel--visible/);
    const group = drawer.getByRole('radiogroup', { name: 'Appearance' });
    await expect(group).toBeVisible();
    await group.getByRole('radio', { name: 'Dark' }).click();
    await expect(html(page)).toHaveAttribute('data-mode', 'dark');
  });
});
