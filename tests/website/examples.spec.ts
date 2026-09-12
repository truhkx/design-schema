// Job 507's gate: every story module in `packages/react/src` reaches the docs site, through
// Storybook's own manifest, and the examples render with no Storybook running. Run with
// `pnpm gates:website`.
//
// Nothing here is a list. The story modules are re-listed from `packages/react/src`, the expected
// story ids come from `packages/react/storybook-static/index.json` — Storybook's own output, which
// is the whole point of the cross-reference the job asks for — and the tab count per page is the
// entry count in `generated/examples/<Name>.json`. So the gate keeps meaning something as stories
// are added, and it fails when the projection drifts from the manifest rather than when a number
// written here goes stale.
//
// "With Storybook's dev server stopped" is not a special case to arrange: this config's only server
// is `astro preview` over `dist/`, and playwright.config.ts (the one that starts the Storybooks) is
// a different run. A request to any Storybook origin would therefore fail — and the third test
// below asserts the page makes none.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

import { audit, describe } from './axe';

const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');
const list = (path: string) => readdirSync(fileURLToPath(new URL(path, ROOT)));

/** Every `<Name>.stories.tsx` in `packages/react/src`, recomputed — the job's "every" is this list. */
const MODULES = list('packages/react/src')
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => file.slice(0, -'.stories.tsx'.length))
  .sort();

/** `generated/components.json`'s name → slug, so a module maps to the route its page is at. */
const SLUGS = new Map<string, string>(
  (JSON.parse(read('generated/components.json')) as { id: string; component: { name: string } }[]).map((entry) => [
    entry.component.name,
    entry.id,
  ]),
);

/** Storybook's own story ids, keyed `<importPath>#<exportName>` — the manifest, not a derivation. */
const MANIFEST = new Set(
  Object.values(
    (JSON.parse(read('packages/react/storybook-static/index.json')) as { entries: Record<string, { type: string; id: string }> })
      .entries,
  )
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id),
);

interface Example {
  title: string;
  args: Record<string, unknown>;
  sourceText: string;
  storyId: string;
}

const examples = (name: string) => JSON.parse(read(`generated/examples/${name}.json`)) as Example[];

test.describe('the examples pipeline', () => {
  test('the manifest itself has stories to cross-reference against', () => {
    expect(MODULES.length).toBeGreaterThan(0);
    expect(MANIFEST.size).toBeGreaterThan(MODULES.length);
  });

  for (const name of MODULES) {
    test(`${name}: every story is projected, with an id Storybook assigned`, () => {
      const entries = examples(name);

      // At least one entry, and "Default" at minimum — website-plan.md's floor for a component page.
      expect(entries.length, 'entries').toBeGreaterThan(0);
      expect(entries.map((entry) => entry.title)).toContain('Default');

      for (const entry of entries) {
        // The id is Storybook's, not one this repo derived: it has to be in Storybook's manifest.
        expect(MANIFEST, `${name}/${entry.title} storyId`).toContain(entry.storyId);
        // And the source slice is the story's own text, so an example always traces back to one.
        expect(entry.sourceText).toContain('export const');
      }

      // No duplicate ids: they are the tab ids and the deep-link targets on the page below.
      expect(new Set(entries.map((entry) => entry.storyId)).size).toBe(entries.length);
    });
  }

  for (const name of MODULES) {
    const slug = SLUGS.get(name);
    // Every story module is a component in the schema; if that ever stops being true the loop above
    // still runs and this one says which module has no page.
    test(`${name}: the docs page renders one tab per example`, async ({ page }) => {
      expect(slug, `${name} has a page`).toBeDefined();
      const response = await page.goto(`/docs/components/${slug}`);
      expect(response?.status()).toBe(200);

      const entries = examples(name);
      const tablist = page.getByRole('tablist', { name: `${name} examples` });
      await expect(tablist.getByRole('tab')).toHaveCount(entries.length);
      for (const entry of entries) {
        await expect(tablist.getByRole('tab', { name: entry.title, exact: true })).toBeVisible();
      }
    });
  }
});

test.describe('an example panel', () => {
  /** A component whose stories are plain args, so every panel is a live render. */
  const LIVE = { name: 'Button', slug: 'button' };

  test('the first example is live in the static HTML, before any island hydrates', async ({ page }) => {
    const response = await page.goto(`/docs/components/${LIVE.slug}`);
    const html = await response!.text();
    const first = examples(LIVE.name)[0]!;

    expect(html, 'the live render').toContain(`data-example="${first.storyId}"`);
    // Rendered with the story's own args: Button's meta labels its default story "Save changes".
    expect(html, 'the args').toContain(String(first.args['label']));
    expect(html, 'the highlighted source').toContain('class="shiki');
  });

  test('switching tabs renders that story live, with no Storybook running', async ({ page }) => {
    const entries = examples(LIVE.name);
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`/docs/components/${LIVE.slug}`);

    // `client:visible`: the island loads when the section is on screen, and the tab is dead until it has.
    const tablist = page.getByRole('tablist', { name: `${LIVE.name} examples` });
    await tablist.scrollIntoViewIfNeeded();
    await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);

    // A story a few tabs along, so this is the island rendering rather than the build's first panel.
    const later = entries.find((entry) => entry.title === 'Disabled') ?? entries[1]!;
    await tablist.getByRole('tab', { name: later.title, exact: true }).click();
    await expect(page.locator(`[data-example="${later.storyId}"]`)).toBeVisible();
    await expect(page.locator(`[data-example="${later.storyId}"]`)).toContainText(String(later.args['label']));

    // The whole page, start to finish, without asking Storybook or Chromatic for anything.
    expect(requests.filter((url) => /storybook|chromatic/i.test(url))).toEqual([]);
  });

  test('a code block is one tab stop, scrolls, and does not trap focus', async ({ page }) => {
    await page.goto(`/docs/components/${LIVE.slug}`);
    // Scoped to the open panel: job 508 put the Basic Usage snippets in the same `.ds-code` frame
    // higher up the page, and this is the examples' gate. Those two are code.spec.ts's.
    const block = page.getByRole('tabpanel').locator('.ds-code');
    const pre = block.locator('pre');
    await block.scrollIntoViewIfNeeded();

    // Shiki's `<pre>` is the scroller and the only tab stop; the wrapper is the frame around it.
    await expect(pre).toHaveAttribute('tabindex', '0');
    await expect(block).not.toHaveAttribute('tabindex', '0');
    expect(await pre.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');

    await pre.focus();
    await expect(pre).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(pre).not.toBeFocused();
  });

  test('axe is clean on a page full of examples', async ({ page }) => {
    await page.goto(`/docs/components/${LIVE.slug}`);
    await page.getByRole('tablist', { name: `${LIVE.name} examples` }).scrollIntoViewIfNeeded();
    await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});
