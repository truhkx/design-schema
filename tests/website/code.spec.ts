// Job 508's gate: the site's two code-presentation spots are syntax-coloured from the *active
// theme's* tokens, in both published themes and both modes, and a code block is keyboard-scrollable
// without trapping focus. Run with `pnpm gates:website`.
//
// Nothing here is a list of colours. Asserting a hex would be asserting the theme, which is the one
// thing this job made re-themeable; so every check is about *relationships* — more than one colour
// inside a block, a different set of colours after switching theme or mode — which stay true when a
// palette is retuned and fail when a code block stops following the theme at all.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page } from '@playwright/test';

import { audit, describe } from './axe';

/** A component whose page has both spots: the Basic Usage snippets and a live example's source. */
const PAGE = '/docs/components/button';

/** The themes the site publishes, re-read rather than typed out — the same source the switcher uses. */
const THEMES = (
  JSON.parse(
    readFileSync(fileURLToPath(new URL('../../generated/themes.json', import.meta.url)), 'utf8'),
  ) as { id: string; title: string; published: boolean }[]
).filter((theme) => theme.published);

/** Every colour actually painted inside one block: the `<pre>`'s own, plus each span's. */
async function palette(block: Locator): Promise<string[]> {
  return block.locator('pre').evaluate((pre) => {
    const colours = new Set<string>([getComputedStyle(pre).color]);
    for (const span of pre.querySelectorAll('span')) colours.add(getComputedStyle(span).color);
    return [...colours].sort();
  });
}

/** The block's background, which is a token too — it is what every colour above is read against. */
const background = (block: Locator) =>
  block.locator('pre').evaluate((pre) => getComputedStyle(pre).backgroundColor);

/**
 * Opens the page and waits for the header to be able to answer a click.
 *
 * The theme control is server-rendered, so it is on screen well before its island hydrates and a
 * click on it would do nothing. Astro drops the `ssr` attribute from an island once it has
 * hydrated — but only the header's is waited on here: the page's other islands are `client:visible`
 * and stay `ssr` until they are scrolled to, which is the examples' own business.
 */
async function open(page: Page) {
  await page.goto(PAGE);
  await expect(page.locator('astro-island[ssr][component-url*="HeaderNav"]')).toHaveCount(0);
}

/** Switches the site to a theme through the header's own control, the way a visitor would. */
async function useTheme(page: Page, theme: { id: string; title: string }) {
  await page.getByRole('radio', { name: theme.title }).click();
  await expect(page.locator('html')).toHaveAttribute('data-ds-theme', theme.id);
}

/** Light/dark is one attribute on <html> (Layout.astro); mode.spec.ts drives the header's switch itself. */
const useMode = (page: Page, mode: 'light' | 'dark') =>
  page.evaluate((value) => document.documentElement.setAttribute('data-mode', value), mode);

test.describe('code presentation', () => {
  test('the theme list itself has two themes to compare', () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(2);
  });

  test('both spots are on the page, and both are Shiki output', async ({ page }) => {
    const response = await page.goto(PAGE);
    const html = await response!.text();

    // The Basic Usage snippets are literal `<Code>` — Astro renames Shiki's class to `astro-code`.
    expect(html, 'the install snippet').toContain('class="astro-code');
    // Read off the DOM, not the source: Shiki splits a line into one span per token, so the command
    // is never a contiguous string in the markup. Its text is still the command.
    await expect(page.locator('.ds-code').first(), 'the install command').toHaveText(
      'pnpm add @design-schema/react @design-schema/tokens',
    );
    // A theme's tokens first: the component stylesheet alone renders nothing but undefined properties.
    await expect(page.locator('.ds-code').nth(1), 'the theme import').toContainText(
      "import '@design-schema/tokens/calm-precise/css';",
    );
    await expect(page.locator('.ds-code').nth(1), 'the import lines').toContainText(
      "import { Button } from '@design-schema/react';",
    );
    // The example source goes through the same Shiki from the page frontmatter (src/highlight.ts).
    expect(html, 'the example source').toContain('class="shiki');
    // Both from the same theme, and it is the one bound to tokens — never a bundled Shiki preset.
    expect(html, 'the theme').toContain('design-schema');
    expect(html, 'token-bound colours').toContain('var(--ds-code-token-keyword)');
    expect(html, 'no bundled preset').not.toContain('--shiki-');

    // Every block on the page is in the frame that binds those variables; an unframed one would
    // inherit nothing and render as undifferentiated body text.
    const blocks = await page.locator('.ds-code').count();
    const pres = await page.locator('pre').count();
    expect(pres, 'every <pre> is inside a .ds-code frame').toBe(blocks);
    expect(blocks).toBeGreaterThanOrEqual(3);
  });

  for (const theme of THEMES) {
    for (const mode of ['light', 'dark'] as const) {
      test(`${theme.id} / ${mode}: an example's source is syntax-coloured`, async ({ page }) => {
        await open(page);
        await useTheme(page, theme);
        await useMode(page, mode);

        const example = page.locator('[data-platform-panel] .ds-code');
        await example.scrollIntoViewIfNeeded();
        const colours = await palette(example);

        // More than one colour in the block *is* syntax colour: Shiki paints keywords, strings and
        // the rest apart from the body text, and a block that had lost its theme would be all one.
        expect(colours.length, `colours in ${theme.id}/${mode}`).toBeGreaterThan(2);
        // Nothing is painted the background, which is how an unresolved custom property would look
        // if it ever resolved at all.
        expect(colours).not.toContain(await background(example));
      });
    }
  }

  test('the colours are the theme’s: they change with the theme and with the mode', async ({ page }) => {
    await open(page);
    const example = page.locator('[data-platform-panel] .ds-code');
    await example.scrollIntoViewIfNeeded();

    const [first, second] = THEMES;
    await useTheme(page, first!);
    await useMode(page, 'light');
    const firstLight = await palette(example);
    const firstLightBg = await background(example);

    await useMode(page, 'dark');
    expect(await palette(example), 'light vs dark').not.toEqual(firstLight);
    expect(await background(example), 'the surface flips too').not.toEqual(firstLightBg);

    await useMode(page, 'light');
    await useTheme(page, second!);
    expect(await palette(example), `${first!.id} vs ${second!.id}`).not.toEqual(firstLight);

    // And the Basic Usage `<Code>` re-themes with it — same variables, same sheet, different spot.
    const install = page.locator('.ds-code').first();
    await useTheme(page, first!);
    const installFirst = await palette(install);
    await useTheme(page, second!);
    expect(await palette(install), 'the install snippet follows the theme').not.toEqual(installFirst);
  });

  test('a `<Code>` block is keyboard-scrollable and does not trap focus', async ({ page }) => {
    await page.goto(PAGE);
    // The Basic Usage import snippet: the literal `<Code>`, which is the half of the job the
    // examples gate does not cover.
    const block = page.locator('.ds-code').nth(1);
    const pre = block.locator('pre.astro-code');
    await block.scrollIntoViewIfNeeded();

    // Shiki's own `tabindex` is what makes an overflowing snippet reachable at all (axe's
    // `scrollable-region-focusable`); the frame around it must not add a second stop.
    await expect(pre).toHaveAttribute('tabindex', '0');
    await expect(block).not.toHaveAttribute('tabindex', '0');
    expect(await pre.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');

    // Scrollable by keyboard once focused, with a snippet narrowed until it has somewhere to go.
    await pre.evaluate((el) => {
      el.style.width = '6rem';
    });
    await pre.focus();
    await expect(pre).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => pre.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

    // And Tab leaves it — a scroller that swallowed Tab would be a trap.
    await page.keyboard.press('Tab');
    await expect(pre).not.toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(pre).toBeFocused();
  });

  test('axe is clean in dark mode, where the code colours are the other half of the sheet', async ({ page }) => {
    await page.goto(PAGE);
    await useMode(page, 'dark');
    await page.getByRole('tablist', { name: 'Button examples' }).scrollIntoViewIfNeeded();
    await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});
