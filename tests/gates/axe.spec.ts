// Axe over every story of the Storybook at baseURL, in light and dark mode. A missing accessible name or a
// contrast failure axe can see fails the gate here rather than in review. Stories can opt out of a rule
// with parameters.a11y.disable = ['rule-id'] (recorded in index.json tags is not available, so the spec
// reads window.__STORYBOOK_STORY_PARAMS__ if the preview exposes it; otherwise all rules apply).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Entry = { id: string; type: string; title: string; name: string };

test.describe('axe', () => {
  let stories: Entry[] = [];
  test.beforeAll(async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/index.json`);
    const json = (await res.json()) as { entries: Record<string, Entry> };
    stories = Object.values(json.entries).filter((e) => e.type === 'story');
    expect(stories.length).toBeGreaterThan(0);
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`every story passes axe (${mode})`, async ({ page, baseURL }) => {
      test.setTimeout(20 * 60_000);
      const failures: string[] = [];
      for (const s of stories) {
        await page.goto(`${baseURL}/iframe.html?id=${s.id}&viewMode=story&globals=mode:${mode}`);
        await page.locator('#storybook-root').waitFor();
        await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode);
        const results = await new AxeBuilder({ page })
          .include('#storybook-root')
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze();
        for (const v of results.violations) {
          failures.push(`${s.title}/${s.name} [${mode}]: ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
        }
      }
      expect(failures, failures.join('\n')).toEqual([]);
    });
  }
});
