// Job 544: at phone width the example tab row outgrows its column. It must scroll with a visible
// affordance (the native scrollbar Tabs hides, and a shaded edge — examples.css), and every tab has
// to be reachable — each one, arrowed to from the first, ends fully inside the row's visible box.
//
// The pages are every `scenarios` layout in `generated/examples/`; the sweep grid has no strip.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator } from '@playwright/test';

const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');

const SLUGS = new Map<string, string>(
  (JSON.parse(read('generated/components.json')) as { id: string; component: { name: string } }[]).map((entry) => [
    entry.component.name,
    entry.id,
  ]),
);

const TABBED = readdirSync(fileURLToPath(new URL('generated/examples', ROOT)))
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.slice(0, -'.json'.length))
  .filter((name) => SLUGS.has(name) && (JSON.parse(read(`generated/examples/${name}.json`)) as { layout: string }).layout === 'scenarios')
  .sort();

/** Whether `tab` lies wholly inside the visible part of `list`, to the pixel. */
async function inView(list: Locator, tab: Locator): Promise<boolean> {
  const [outer, inner] = await Promise.all([list.boundingBox(), tab.boundingBox()]);
  if (outer === null || inner === null) return false;
  return inner.x >= outer.x - 1 && inner.x + inner.width <= outer.x + outer.width + 1;
}

test.use({ viewport: { width: 390, height: 844 } });

test.describe('the example tab row at 390px', () => {
  test('Popover: the row overflows, and says so with a scrollbar and a shaded edge', async ({ page }) => {
    await page.goto(`/docs/components/${SLUGS.get('Popover')}`);
    const list = page.getByRole('tablist', { name: 'Popover examples', exact: true });
    await list.scrollIntoViewIfNeeded();
    const metrics = await list.evaluate((el) => ({
      overflows: el.scrollWidth > el.clientWidth,
      scrollbar: getComputedStyle(el).scrollbarWidth,
      overflowX: getComputedStyle(el).overflowX,
      // Overlay scrollbars (phones) show only mid-scroll, so the edge shade is the affordance there.
      shaded: getComputedStyle(el).backgroundImage.includes('radial-gradient'),
    }));
    expect(metrics).toEqual({ overflows: true, scrollbar: 'thin', overflowX: 'auto', shaded: true });
  });

  for (const name of TABBED) {
    test(`${name}: every tab in the strip scrolls into view as the arrow keys reach it`, async ({ page }) => {
      await page.goto(`/docs/components/${SLUGS.get(name)}`);
      // `client:visible`: the island hydrates once it is on screen. Retried, as in example-audit.spec.ts:
      // hydration can re-render the heading out from under the scroll.
      await expect(() => page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded({ timeout: 2000 })).toPass();
      await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);
      const list = page.getByRole('tablist', { name: `${name} examples`, exact: true });
      await list.scrollIntoViewIfNeeded();
      const tabs = list.getByRole('tab');
      const count = await tabs.count();
      // A click, not `focus()`: some first examples take focus as they mount (FocusScope's
      // `autoFocus`), and a visitor starts arrowing from a tab they clicked after the page settled.
      await tabs.first().click();
      for (let index = 0; index < count; index++) {
        const tab = tabs.nth(index);
        if (index > 0) {
          // Arrowed to while the row holds focus. An example that takes focus as it mounts (Combobox
          // "Open" focuses its input; FocusScope "Default" is a live trap) leaves the row behind, and
          // the walk goes on by click — selection has to scroll the tab into view either way.
          const previous = tabs.nth(index - 1);
          if (await previous.evaluate((el) => el === document.activeElement)) await page.keyboard.press('ArrowRight');
          else await tab.evaluate((el) => (el as HTMLElement).click());
        }
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expect.poll(() => inView(list, tab), `${await tab.textContent()} in view`).toBe(true);
      }
    });
  }
});
