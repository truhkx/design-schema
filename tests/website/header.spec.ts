// Job 503's gate: the site header's keyboard-only pass and an axe audit of both the closed and the
// open state of the mobile drawer. Run with `pnpm gates:website`.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Below layout.breakpoint.md (768px), where the nav row is replaced by the hamburger. */
const NARROW = { width: 390, height: 844 };
/** Above it, where the nav row and the theme control are the header. */
const WIDE = { width: 1280, height: 800 };

const audit = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']);

const hamburger = (page: Page) => page.getByRole('button', { name: 'Open menu' });
const drawer = (page: Page) => page.getByRole('dialog', { name: 'Menu' });
/** The logo lockup: the header's only link to `/`, named by its wordmark. */
const homeLink = (page: Page) => page.getByRole('banner').getByRole('link', { name: 'Design Schema', exact: true });

/**
 * The header's markup is server-rendered, so it is on screen well before its island hydrates and a
 * key press would do nothing. Astro drops the `ssr` attribute from an island once it has hydrated;
 * wait for that rather than for a timeout.
 */
async function openHome(page: Page) {
  await page.goto('/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

/**
 * Opens the drawer from the keyboard and waits for it to have settled.
 *
 * The wait is on SidePanel's own `--visible` state class rather than on visibility alone: the panel
 * unmounts on its exit transition's `transitionend`, so closing it in the very frame it opened —
 * which only a script is quick enough to do — can leave it with no transition to end and no way to
 * unmount. A visitor is never that fast; a parallel test run is.
 */
async function openDrawer(page: Page, key: string) {
  await hamburger(page).focus();
  await page.keyboard.press(key);
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page)).toHaveClass(/ds-side-panel--visible/);
}

test.describe('site header — below the breakpoint', () => {
  test.use({ viewport: NARROW });

  test('Tab reaches the hamburger, and it is the only nav control', async ({ page }) => {
    await openHome(page);
    await expect(hamburger(page)).toBeVisible();
    // The nav row and its theme control are display:none here, so they are not tab stops either.
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeHidden();

    // Tab from the top of the document: the logo link, then the hamburger. Nothing in between.
    await page.keyboard.press('Tab');
    await expect(homeLink(page)).toBeFocused();
    await expect(homeLink(page)).toHaveAttribute('href', '/');
    await page.keyboard.press('Tab');
    await expect(hamburger(page)).toBeFocused();
    await expect(hamburger(page)).toHaveAttribute('aria-expanded', 'false');
  });

  for (const key of ['Enter', ' '] as const) {
    test(`${key === ' ' ? 'Space' : key} opens the drawer, Escape closes it and returns focus`, async ({ page }) => {
      await openHome(page);
      await openDrawer(page, key === ' ' ? 'Space' : key);
      await expect(hamburger(page)).toHaveAttribute('aria-expanded', 'true');

      // Focus moved inside the panel, not left behind on the trigger.
      await expect
        .poll(async () => drawer(page).evaluate((panel) => panel.contains(document.activeElement)))
        .toBe(true);

      await page.keyboard.press('Escape');
      await expect(drawer(page)).toHaveCount(0);
      await expect(hamburger(page)).toHaveAttribute('aria-expanded', 'false');
      await expect(hamburger(page)).toBeFocused();
    });
  }

  test('the drawer traps Tab and repeats the generated nav links', async ({ page }) => {
    await openHome(page);
    await openDrawer(page, 'Enter');

    const panel = drawer(page);
    for (const label of ['Docs', 'About']) {
      await expect(panel.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    // The logo is the home link, so the generated list has no Homepage entry to repeat.
    await expect(panel.getByRole('link', { name: 'Homepage' })).toHaveCount(0);
    await expect(panel.getByRole('link', { name: /GitHub/ })).toHaveAttribute('target', '_blank');
    // The theme control is repeated at the bottom of the panel.
    await expect(panel.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();

    // Tabbing all the way round stays inside the dialog.
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
  });

  test('axe is clean closed and open', async ({ page }) => {
    await openHome(page);
    const closed = await audit(page).analyze();
    expect(describe(closed.violations), 'closed state').toEqual([]);

    await openDrawer(page, 'Enter');
    const open = await audit(page).analyze();
    expect(describe(open.violations), 'open state').toEqual([]);
  });
});

test.describe('site header — above the breakpoint', () => {
  test.use({ viewport: WIDE });

  test('shows the generated nav row and the theme control, and no hamburger', async ({ page }) => {
    await openHome(page);
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav).toBeVisible();
    for (const label of ['Docs', 'About']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Homepage' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: /GitHub/ })).toHaveAttribute('target', '_blank');
    await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();
    await expect(hamburger(page)).toBeHidden();
    await expect(homeLink(page)).toHaveAttribute('href', '/');
  });

  test('groups the nav links and holds the theme control at the end', async ({ page }) => {
    await openHome(page);
    const nav = page.getByRole('navigation', { name: 'Main' });
    const navBox = await nav.boundingBox();
    const linkBoxes = await nav.getByRole('link').evaluateAll((links) =>
      links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { left: rect.left, right: rect.right };
      }),
    );
    expect(navBox).not.toBeNull();
    expect(linkBoxes.length).toBeGreaterThan(1);
    // One group: every gap between the links is the same single `layout.gap.loose` (16px calm-precise,
    // 30px warm-friendly), not the ~170px that `space-evenly` across the whole row used to leave.
    const gaps: number[] = [];
    for (let i = 1; i < linkBoxes.length; i += 1) gaps.push(linkBoxes[i]!.left - linkBoxes[i - 1]!.right);
    for (const gap of gaps) {
      expect(gap).toBeLessThanOrEqual(40);
      expect(Math.abs(gap - gaps[0]!)).toBeLessThanOrEqual(2);
    }
    // The group sits at the start of the nav, beside the lockup...
    expect(linkBoxes[0]!.left - navBox!.x).toBeLessThanOrEqual(2);
    // ...and the nav still takes the row's slack, which is what keeps the theme control hard right.
    const linksWidth = linkBoxes.reduce((sum, box) => sum + (box.right - box.left), 0);
    expect(navBox!.width).toBeGreaterThan(linksWidth * 2);
  });

  test('the header is dark on a light page', async ({ page }) => {
    await openHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
    await expect(page.getByRole('banner')).toHaveAttribute('data-mode', 'dark');
    const [header, body] = await Promise.all([
      page.getByRole('banner').evaluate((el) => getComputedStyle(el).backgroundColor),
      page.locator('html').evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(header).not.toEqual(body);
  });

  test('links are not underlined until hovered or focused', async ({ page }) => {
    await openHome(page);
    const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Docs', exact: true });
    const decoration = () => link.evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(await decoration()).toBe('none');
    await link.hover();
    await expect.poll(decoration).toBe('underline');
    await page.mouse.move(0, 700);
    await expect.poll(decoration).toBe('none');
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect.poll(decoration).toBe('underline');
  });

  test('the theme control swaps which token stylesheet is enabled', async ({ page }) => {
    await openHome(page);
    const enabled = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLLinkElement>('link[data-ds-theme]'))
          .filter((link) => link.media === 'all')
          .map((link) => link.getAttribute('data-ds-theme')),
      );
    expect(await enabled()).toEqual(['calm-precise']);

    await page.getByRole('radio', { name: 'Warm & friendly' }).click();
    await expect.poll(enabled).toEqual(['warm-friendly']);
    await expect(page.locator('html')).toHaveAttribute('data-ds-theme', 'warm-friendly');

    // Remembered, so a theme survives following one of those nav links.
    await page.reload();
    await expect.poll(enabled).toEqual(['warm-friendly']);
  });

  test('axe is clean', async ({ page }) => {
    await openHome(page);
    const results = await audit(page).analyze();
    expect(describe(results.violations)).toEqual([]);
  });
});

/** Violations as readable one-liners, so a failure names the rule and the node instead of dumping JSON. */
function describe(violations: { id: string; help: string; nodes: { target: unknown[] }[] }[]): string[] {
  return violations.map((v) => `${v.id} — ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join('; ')})`);
}
