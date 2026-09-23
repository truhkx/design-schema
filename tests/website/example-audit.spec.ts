// The example-render audit from site/src/content/docs/process/website-audit.md (2026-09-23), as a
// spec rather than a one-off walk: every component page, every example — the primary strip, the
// strip behind "More examples", and every grid tile — classified by what a visitor actually sees.
//
//   live         the example card renders something visible
//   harness      the card holds the site's trigger harness (job 542) — an overlay a visitor opens
//   empty        a card is there, and nothing in it is visible (Dialog "Closed" was a 0px card)
//   notice-only  no card at all, only the "does not render from its args alone" notice
//   source-note  a deliberate note instead of a render (a level-1 heading, a skipped level)
//
// plus `overflowX` where the card's content is wider than the card. Each page's result is written to
// `logs/example-audit/<label>/<Name>.json` (`EXAMPLE_AUDIT_LABEL`, default `latest`), so two runs —
// before and after a change — can be compared; `node logs/542-audit-summary.mjs <label>…` tabulates.
//
// What it gates: job 542's — no component the examples pipeline gives a trigger harness may show a
// notice instead of its overlay — and job 544's: no example is `empty`, none paints past its card
// (`overflowX`), and the page logs no React key warning. The other notices are reported, not failed.
// The key warning only has teeth against a dev server (production React does not emit it): point
// WEBSITE_GATE_PORT at a running `astro dev` to check it.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page } from '@playwright/test';

const ROOT = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(fileURLToPath(new URL(path, ROOT)), 'utf8');

const MODULES = readdirSync(fileURLToPath(new URL('packages/react/src', ROOT)))
  .filter((file) => file.endsWith('.stories.tsx'))
  .map((file) => file.slice(0, -'.stories.tsx'.length))
  .sort();

const SLUGS = new Map<string, string>(
  (JSON.parse(read('generated/components.json')) as { id: string; component: { name: string } }[]).map((entry) => [
    entry.component.name,
    entry.id,
  ]),
);

interface Example {
  title: string;
  storyId: string;
  harness?: 'trigger' | null;
}
const exampleSet = (name: string) => JSON.parse(read(`generated/examples/${name}.json`)) as { layout: 'sweep' | 'scenarios'; examples: Example[] };

type Status = 'live' | 'harness' | 'empty' | 'notice-only' | 'source-note';
interface Row {
  title: string;
  storyId: string;
  status: Status;
  overflowX: boolean;
}

const LABEL = process.env['EXAMPLE_AUDIT_LABEL'] ?? 'latest';
const OUT = fileURLToPath(new URL(`logs/example-audit/${LABEL}/`, ROOT));

/**
 * What one panel or tile shows. Arrow-only on purpose: the body is serialized into the page, and a
 * named declaration can drag a transform helper along with it.
 */
async function classify(container: Locator): Promise<Omit<Row, 'title' | 'storyId'>> {
  return container.evaluate((root) => {
    const card = root.querySelector('[data-example]');
    if (card === null) {
      const text = root.textContent ?? '';
      const notice = text.includes('does not render from its args alone') || text.includes('frames the component in a decorator');
      return { status: notice ? 'notice-only' : 'source-note', overflowX: false } as const;
    }
    if (card.hasAttribute('data-example-harness')) {
      return { status: 'harness', overflowX: card.scrollWidth > card.clientWidth + 1 } as const;
    }
    const shown = (el: Element) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
    const sized = (rect: DOMRect) => rect.width > 1 && rect.height > 1;
    let visible = [...card.querySelectorAll('*')].some((el) => shown(el) && sized(el.getBoundingClientRect()));
    if (!visible) {
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node !== null && !visible; node = walker.nextNode()) {
        if ((node.textContent ?? '').trim() === '' || node.parentElement === null || !shown(node.parentElement)) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        visible = sized(range.getBoundingClientRect());
      }
    }
    // The card's own box scrolls nothing, so content wider than it spills past its edge — but only
    // what paints counts. Three things have a box past the edge and show nothing there: content
    // inside a scroll viewport or a clip within the card (DataGrid's grid, a visually hidden label
    // clipped to 1px by `clip-path`), and a box with no paint of its own (Slider's 44px hit target
    // around a 20px knob). An element paints if it has a background, border or shadow, is a replaced
    // element, or has its own text — measured by the text's range, not the element's box.
    const edge = card.getBoundingClientRect().right + 1;
    const opaque = (color: string) => color !== 'transparent' && !/[,/]\s*0(\.0+)?\s*\)$/.test(color);
    const clipped = (el: Element) => {
      for (let node: Element | null = el; node !== null && node !== card; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.clipPath !== 'none' || (node !== el && style.overflowX !== 'visible')) return true;
      }
      return false;
    };
    const overflowX = [...card.querySelectorAll('*')].some((el) => {
      if (!shown(el) || clipped(el) || (el.parentElement?.closest('svg') ?? null) !== null) return false;
      const style = getComputedStyle(el);
      const paintsBox =
        ['svg', 'img', 'canvas', 'video', 'input', 'select', 'textarea', 'progress', 'meter'].includes(el.tagName.toLowerCase()) ||
        opaque(style.backgroundColor) ||
        style.backgroundImage !== 'none' ||
        style.boxShadow !== 'none' ||
        (['Top', 'Right', 'Bottom', 'Left'] as const).some(
          (side) => parseFloat(style[`border${side}Width`]) > 0 && style[`border${side}Style`] !== 'none' && opaque(style[`border${side}Color`]),
        );
      if (paintsBox && el.getBoundingClientRect().right > edge) return true;
      return [...el.childNodes].some((node) => {
        if (node.nodeType !== Node.TEXT_NODE || (node.textContent ?? '').trim() === '') return false;
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().right > edge;
      });
    });
    return { status: visible ? 'live' : 'empty', overflowX } as const;
  });
}

/** Every tab in one strip, selected in turn, and its panel classified. */
async function walkStrip(page: Page, strip: Locator, rows: Row[]) {
  const tabs = strip.getByRole('tab');
  const count = await tabs.count();
  for (let index = 0; index < count; index++) {
    const tab = tabs.nth(index);
    // A programmatic click, not a pointer one: an example that renders an overlay open (SidePanel's
    // "Open" before job 542) covers the strip, and the audit's job is to record that, not stall on it.
    await tab.evaluate((el) => (el as HTMLElement).click());
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    const storyId = (await tab.getAttribute('data-tab-id')) ?? '';
    const panel = page.locator(`[role="tabpanel"][aria-labelledby="${await tab.getAttribute('id')}"]`);
    await expect(panel).toBeVisible();
    rows.push({ title: (await tab.textContent()) ?? '', storyId, ...(await classify(panel)) });
  }
}

test.describe('the example-render audit', () => {
  for (const name of MODULES) {
    test(`${name}: every example shows something`, async ({ page }) => {
      const slug = SLUGS.get(name);
      expect(slug, `${name} has a page`).toBeDefined();
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await page.goto(`/docs/components/${slug}`);
      // Retried: the island can re-render the heading out from under the scroll while it hydrates.
      await expect(() => page.getByRole('heading', { name: 'Examples', level: 2, exact: true }).scrollIntoViewIfNeeded({ timeout: 2000 })).toPass();
      await expect(page.locator('astro-island[ssr][component-url*="Examples"]')).toHaveCount(0);

      const { layout, examples } = exampleSet(name);
      const rows: Row[] = [];
      if (layout === 'sweep') {
        for (const example of examples) {
          rows.push({ title: example.title, storyId: example.storyId, ...(await classify(page.locator(`[data-example-tile="${example.storyId}"]`))) });
        }
      } else {
        await walkStrip(page, page.getByRole('tablist', { name: `${name} examples`, exact: true }), rows);
        const more = page.getByRole('button', { name: /^More examples \(\d+\)$/ });
        if ((await more.count()) > 0) {
          await more.evaluate((el) => (el as HTMLElement).click());
          await walkStrip(page, page.getByRole('tablist', { name: `More ${name} examples`, exact: true }), rows);
        }
      }

      const counts: Record<string, number> = {};
      for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
      counts['overflowX'] = rows.filter((row) => row.overflowX).length;
      mkdirSync(OUT, { recursive: true });
      writeFileSync(`${OUT}${name}.json`, JSON.stringify({ name, counts, errors, rows }, null, 2) + '\n');

      // Every example in the JSON was walked: the strips are the whole set.
      expect(rows.map((row) => row.storyId).sort()).toEqual(examples.map((example) => example.storyId).sort());

      // Job 542: an overlay the pipeline gives a harness is never a notice.
      const harnessed = new Set(examples.filter((example) => example.harness === 'trigger').map((example) => example.storyId));
      expect(rows.filter((row) => harnessed.has(row.storyId) && row.status === 'notice-only').map((row) => row.title)).toEqual([]);

      // Job 544: every card shows something, nothing spills out of one, and no list repeats a key.
      expect(rows.filter((row) => row.status === 'empty').map((row) => row.title), 'empty examples').toEqual([]);
      expect(rows.filter((row) => row.overflowX).map((row) => row.title), 'examples painting past their card').toEqual([]);
      expect(errors.filter((error) => /same key/.test(error)), 'React key warnings').toEqual([]);
    });
  }
});
