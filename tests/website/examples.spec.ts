// Job 507's gate: every story module in `packages/react/src` reaches the docs site, through
// Storybook's own manifest, and the examples render with no Storybook running. Job 531 added the two
// layouts — a sweep grid, and a tab strip split behind "More examples" — and the check that every
// story is still reachable through them. Run with `pnpm gates:website`.
//
// Nothing here is a list. The story modules are re-listed from `packages/react/src`, the expected
// story ids come from `packages/react/storybook-static/index.json` — Storybook's own output, which
// is the whole point of the cross-reference the job asks for — and the tab and tile counts per page
// come from `generated/examples/<Name>.json`, as do the layout and the primary set. Caption values
// are read from the built token JSON. So the gate keeps meaning something as stories are added, and
// it fails when the projection drifts rather than when a number written here goes stale.
//
// "With Storybook's dev server stopped" is not a special case to arrange: this config's only server
// is `astro preview` over `dist/`, and playwright.config.ts (the one that starts the Storybooks) is
// a different run. A request to any Storybook origin would therefore fail — and a test below asserts
// the page makes none.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Page } from '@playwright/test';

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

/** The published theme ids, in the site's order — `generated/themes.json`, as the header's switcher reads it. */
const THEMES = (JSON.parse(read('generated/themes.json')) as { id: string; published?: boolean }[])
  .filter((theme) => theme.published === true)
  .map((theme) => theme.id);

type Platform = 'react' | 'lit' | 'rn' | 'swift';

interface Example {
  title: string;
  args: Record<string, unknown>;
  snippets: Record<Platform, string | null>;
  stories: Record<Platform, string | null>;
  storyId: string;
  sweep: { prop: string; value: string | boolean } | null;
  decorated: boolean;
  primary: boolean;
}

interface ExampleSet {
  layout: 'sweep' | 'scenarios';
  platforms: Record<Platform, boolean>;
  examples: Example[];
}

/**
 * Where each platform's snippet has to come from, recomputed: the platform's own story module, or for
 * Swift the generated view. `null` is "that platform has no source for this component".
 */
const PLATFORM_SOURCE: Record<Platform, (name: string) => string> = {
  react: (name) => `packages/react/src/${name}.stories.tsx`,
  lit: (name) => `packages/lit/src/${name}.stories.ts`,
  rn: (name) => `packages/rn/src/${name}.stories.tsx`,
  swift: (name) => `packages/swiftui/Sources/DesignSchema/${name}.swift`,
};
const sourceText = (name: string, platform: Platform) => {
  const path = fileURLToPath(new URL(PLATFORM_SOURCE[platform](name), ROOT));
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
};

const exampleSet = (name: string) => JSON.parse(read(`generated/examples/${name}.json`)) as ExampleSet;
const examples = (name: string) => exampleSet(name).examples;

/** A token's built value in one theme's light mode, from the same JSON the site build reads. */
const tokenValue = (theme: string, token: string) =>
  (JSON.parse(read(`packages/tokens/dist/${theme}/json/tokens.light.json`)) as Record<string, string>)[token];

/** `23px` → `23px / 1.4375rem`, the caption's own spelling. */
const pxAndRem = (px: string) => `${px} / ${Number((parseFloat(px) / 16).toFixed(4))}rem`;

/** The primary strip, and the second strip that only exists once "More examples" is open. */
const strip = (page: Page, name: string) => page.getByRole('tablist', { name: `${name} examples`, exact: true });
const moreStrip = (page: Page, name: string) => page.getByRole('tablist', { name: `More ${name} examples`, exact: true });
const moreButton = (page: Page, count: number) => page.getByRole('button', { name: `More examples (${count})`, exact: true });

/** `client:visible`: the island hydrates once the section is on screen, and its controls are dead until it has. */
async function hydrateExamples(page: Page) {
  await page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
}

test.describe('the examples pipeline', () => {
  test('the manifest itself has stories to cross-reference against', () => {
    expect(MODULES.length).toBeGreaterThan(0);
    expect(MANIFEST.size).toBeGreaterThan(MODULES.length);
  });

  for (const name of MODULES) {
    test(`${name}: every story is projected, with an id Storybook assigned`, () => {
      const { layout, examples: entries } = exampleSet(name);

      // At least one entry, and "Default" at minimum — website-plan.md's floor for a component page.
      expect(entries.length, 'entries').toBeGreaterThan(0);
      expect(entries.map((entry) => entry.title)).toContain('Default');
      expect(['sweep', 'scenarios']).toContain(layout);
      // The page opens on Default, so it is never the one behind the disclosure.
      expect(entries.find((entry) => entry.title === 'Default')?.primary, 'Default is primary').toBe(true);

      // Job 532: every platform is in the map, and a platform has source exactly when its file exists —
      // so the Swift entry turns on by itself the day `<Name>.swift` is generated.
      const sources = Object.fromEntries((['react', 'lit', 'rn', 'swift'] as const).map((p) => [p, sourceText(name, p)])) as Record<Platform, string | null>;
      for (const platform of ['react', 'lit', 'rn', 'swift'] as const) {
        expect(exampleSet(name).platforms[platform], `${name}: ${platform} source present`).toBe(sources[platform] !== null);
      }

      for (const entry of entries) {
        // The id is Storybook's, not one this repo derived: it has to be in Storybook's manifest.
        expect(MANIFEST, `${name}/${entry.title} storyId`).toContain(entry.storyId);
        expect(Object.keys(entry.snippets), `${name}/${entry.title} snippet map`).toEqual(['react', 'lit', 'rn', 'swift']);
        // React always has one: the example *is* a React story.
        expect(entry.snippets.react, `${name}/${entry.title} React snippet`).not.toBeNull();
        for (const platform of ['react', 'lit', 'rn', 'swift'] as const) {
          const snippet = entry.snippets[platform];
          const story = entry.stories[platform];
          // A snippet and the story it names come together, and that story is in the platform's own
          // file — no snippet is ever invented, and none is ever shown for a platform with no source.
          expect(snippet === null, `${name}/${entry.title} ${platform}: snippet iff story`).toBe(story === null);
          if (story === null) continue;
          const text = sources[platform];
          expect(text, `${name}/${entry.title} ${platform}: source exists`).not.toBeNull();
          if (platform === 'swift') expect(text).toMatch(story === '#Preview' ? /#Preview\s*\{/ : new RegExp(`#Preview\\("${story}"`));
          else expect(text).toMatch(new RegExp(`export const ${story}\\b`));
        }
      }

      // No duplicate ids: they are the tab ids, the tile ids and the deep-link targets on the page below.
      expect(new Set(entries.map((entry) => entry.storyId)).size).toBe(entries.length);
    });
  }

  for (const name of MODULES) {
    const slug = SLUGS.get(name);
    // Every story module is a component in the schema; if that ever stops being true the loop above
    // still runs and this one says which module has no page.
    test(`${name}: every example is reachable on the docs page`, async ({ page }) => {
      expect(slug, `${name} has a page`).toBeDefined();
      const response = await page.goto(`/docs/components/${slug}`);
      expect(response?.status()).toBe(200);

      const { layout, examples: entries } = exampleSet(name);
      if (layout === 'sweep') {
        // One tile per story, and no strip at all.
        await expect(strip(page, name)).toHaveCount(0);
        await expect(page.locator('[data-example-tile]')).toHaveCount(entries.length);
        for (const entry of entries) await expect(page.locator(`[data-example-tile="${entry.storyId}"]`)).toBeVisible();
        return;
      }

      const primary = entries.filter((entry) => entry.primary);
      const rest = entries.filter((entry) => !entry.primary);
      await expect(strip(page, name).getByRole('tab')).toHaveCount(primary.length);
      for (const entry of primary) {
        await expect(strip(page, name).getByRole('tab', { name: entry.title, exact: true })).toBeVisible();
      }
      if (rest.length === 0) {
        await expect(page.getByRole('button', { name: /^More examples/ })).toHaveCount(0);
        return;
      }

      // The rest is hidden, not removed: one click opens a strip holding exactly the stories left.
      await hydrateExamples(page);
      await moreButton(page, rest.length).click();
      await expect(moreStrip(page, name).getByRole('tab')).toHaveCount(rest.length);
      for (const entry of rest) {
        await expect(moreStrip(page, name).getByRole('tab', { name: entry.title, exact: true })).toBeVisible();
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
    await hydrateExamples(page);

    // A story a few tabs along, so this is the island rendering rather than the build's first panel.
    const later = entries.find((entry) => entry.title === 'Disabled' && entry.primary) ?? entries[1]!;
    await strip(page, LIVE.name).getByRole('tab', { name: later.title, exact: true }).click();
    await expect(page.locator(`[data-example="${later.storyId}"]`)).toBeVisible();
    await expect(page.locator(`[data-example="${later.storyId}"]`)).toContainText(String(later.args['label']));

    // The whole page, start to finish, without asking Storybook or Chromatic for anything.
    expect(requests.filter((url) => /storybook|chromatic/i.test(url))).toEqual([]);
  });

  test('each scenario switches between React, React Native, Lit and Swift without leaving the scenario', async ({ page }) => {
    const entries = examples(LIVE.name);
    const scenario = entries.find((entry) => entry.title === 'Disabled' && entry.primary) ?? entries[1]!;
    const next = entries.find((entry) => entry.primary && entry !== scenario && entry.snippets.lit !== null)!;
    // Job 532's gate needs a scenario all three story platforms cover, with distinct code on each.
    for (const platform of ['react', 'rn', 'lit'] as const) expect(scenario.snippets[platform], platform).not.toBeNull();

    await page.goto(`/docs/components/${LIVE.slug}`);
    await hydrateExamples(page);
    const scenarioTab = strip(page, LIVE.name).getByRole('tab', { name: scenario.title, exact: true });
    await scenarioTab.click();

    const byPlatform = page.getByRole('tablist', { name: `${scenario.title}: code by platform`, exact: true });
    await expect(byPlatform.getByRole('tab')).toHaveText(['React', 'React Native', 'Lit', 'Swift']);
    const block = page.locator('[data-platform-panel] .ds-code');

    const seen: string[] = [];
    for (const [label, platform] of [['React', 'react'], ['React Native', 'rn'], ['Lit', 'lit']] as const) {
      await byPlatform.getByRole('tab', { name: label, exact: true }).click();
      await expect(block).toHaveAttribute('data-platform-code', platform);
      // The code on screen is that platform's snippet, whole: Shiki splits tokens into spans, but the text is the code.
      await expect(block).toHaveText(scenario.snippets[platform]!);
      seen.push(scenario.snippets[platform]!);
      // Picking a platform never moves the scenario.
      await expect(scenarioTab).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`[data-example="${scenario.storyId}"]`)).toBeVisible();
    }
    expect(new Set(seen).size, 'distinct source per platform').toBe(3);

    // Swift is a tab that says where it stands, not a tab that is missing.
    await byPlatform.getByRole('tab', { name: 'Swift', exact: true }).click();
    const swift = page.locator('[data-platform-panel="swift"]');
    if (exampleSet(LIVE.name).platforms.swift) await expect(swift.locator('.ds-code')).toBeVisible();
    else await expect(swift).toContainText('SwiftUI example ships once this component is generated for iOS — see the iOS platform plan');
    await expect(scenarioTab).toHaveAttribute('aria-selected', 'true');

    // The choice follows the reader to the next scenario.
    await byPlatform.getByRole('tab', { name: 'Lit', exact: true }).click();
    await strip(page, LIVE.name).getByRole('tab', { name: next.title, exact: true }).click();
    const nextPlatforms = page.getByRole('tablist', { name: `${next.title}: code by platform`, exact: true });
    await expect(nextPlatforms.getByRole('tab', { name: 'Lit', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(block).toHaveText(next.snippets.lit!);
  });

  test('a code block is one tab stop, scrolls, and does not trap focus', async ({ page }) => {
    await page.goto(`/docs/components/${LIVE.slug}`);
    // Scoped to the open platform panel: job 508 put the Basic Usage snippets in the same `.ds-code`
    // frame higher up the page, and this is the examples' gate. Those two are code.spec.ts's.
    const block = page.locator('[data-platform-panel] .ds-code');
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
    await hydrateExamples(page);
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});

test.describe('the sweep grid', () => {
  // Heading's level 2 reads `font.size.3xl`: Heading picks the size for a level itself, and the
  // caption asks the component rather than a table — so this is the value Heading.tsx chooses.
  const SWEEPS = [
    { name: 'Text', slug: 'text', step: 'Size Xl', token: 'font.size.xl' },
    { name: 'Heading', slug: 'heading', step: 'Level 2', token: 'font.size.3xl' },
  ];

  for (const { name, slug, step, token } of SWEEPS) {
    test(`${name}: one small-multiple grid with px/rem and token captions, instead of a tab strip`, async ({ page }) => {
      const { layout, examples: entries } = exampleSet(name);
      expect(layout, `${name} is classified as a sweep`).toBe('sweep');

      await page.goto(`/docs/components/${slug}`);
      await expect(strip(page, name)).toHaveCount(0);
      await expect(page.locator('ul.ds-example-grid [data-example-tile]')).toHaveCount(entries.length);

      const entry = entries.find((candidate) => candidate.title === step)!;
      const caption = page.locator(`[data-example-tile="${entry.storyId}"] [data-caption="${token}"]`);
      // The caption follows the theme: each published theme's own built value, and only that one.
      for (const theme of THEMES) {
        await page.evaluate((id) => document.documentElement.setAttribute('data-ds-theme', id), theme);
        await expect(caption).toHaveText(`${pxAndRem(tokenValue(theme, token)!)} · ${token}`, { useInnerText: true });
      }

      // An enum's `default` value reads the base token (`color.foreground`, not a `.default` path no
      // theme builds), and every caption on the grid names a token that has a value.
      for (const path of await page.locator('[data-caption]').evaluateAll((els) => els.map((el) => el.getAttribute('data-caption')))) {
        expect(tokenValue(THEMES[0]!, path!), `${name}: ${path} is a built token`).toBeDefined();
      }
    });

    test(`${name}: axe is clean on the grid`, async ({ page }) => {
      await page.goto(`/docs/components/${slug}`);
      await hydrateExamples(page);
      expect(describe((await audit(page).analyze()).violations)).toEqual([]);
    });
  }
});

test.describe('a dense example set', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  /** The tab-layout component with the most stories, read off generated/examples/ rather than named. */
  const DENSE = MODULES.filter((name) => exampleSet(name).layout === 'scenarios').sort(
    (a, b) => examples(b).length - examples(a).length || a.localeCompare(b),
  )[0]!;

  test(`${DENSE}: a short primary strip, and every other story intact behind "More examples"`, async ({ page }) => {
    const entries = examples(DENSE);
    const primary = entries.filter((entry) => entry.primary);
    const rest = entries.filter((entry) => !entry.primary);
    expect(rest.length, 'something is behind the disclosure').toBeGreaterThan(0);

    await page.goto(`/docs/components/${SLUGS.get(DENSE)}`);
    await hydrateExamples(page);
    await expect(strip(page, DENSE).getByRole('tab')).toHaveCount(primary.length);

    const more = moreButton(page, rest.length);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    // The second strip is a column, so however many stories are behind the disclosure, none is
    // scrolled out of sight the way a long horizontal strip hides them.
    await expect(moreStrip(page, DENSE)).toHaveAttribute('aria-orientation', 'vertical');
    expect(await moreStrip(page, DENSE).evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);

    // The two strips together are the whole set, each story exactly once.
    const labels = [
      ...(await strip(page, DENSE).getByRole('tab').allTextContents()),
      ...(await moreStrip(page, DENSE).getByRole('tab').allTextContents()),
    ];
    expect(labels.sort()).toEqual(entries.map((entry) => entry.title).sort());

    // A story from behind the disclosure is a working panel, not just a label.
    const last = rest.at(-1)!;
    await moreStrip(page, DENSE).getByRole('tab', { name: last.title, exact: true }).click();
    await expect(moreStrip(page, DENSE).getByRole('tab', { name: last.title, exact: true })).toHaveAttribute('aria-selected', 'true');

    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });

  // The threshold's evidence: the pages that prompted the split keep their primary strip on one row,
  // where the hidden-scrollbar strip used to push most of their tabs out of sight.
  for (const name of ['Button', 'Select', 'DataGrid', DENSE]) {
    test(`${name}: the primary strip fits the docs column at desktop width`, async ({ page }) => {
      await page.goto(`/docs/components/${SLUGS.get(name)}`);
      const tablist = strip(page, name);
      await tablist.scrollIntoViewIfNeeded();
      expect(await tablist.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(1);
    });
  }
});
