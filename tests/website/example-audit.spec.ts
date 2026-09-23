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
// notice instead of its overlay — job 544's: no example is `empty`, none paints past its card
// (`overflowX`), and the page logs no React key warning — and job 546's: an example whose args carry
// content shows it (`CONTENT`), and the `{ $unsupported }` args that remain across
// `generated/examples/*.json` are function props only, listed with their stories at the end of this
// file. The other notices are reported, not failed.
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

const SCHEMA = JSON.parse(read('generated/components.json')) as {
  id: string;
  component: { name: string; props: Record<string, { required?: boolean }> };
}[];

const SLUGS = new Map<string, string>(SCHEMA.map((entry) => [entry.component.name, entry.id]));

/** Each component's required props, for the `$unsupported` gate below. */
const REQUIRED = new Map<string, string[]>(
  SCHEMA.map((entry) => [
    entry.component.name,
    Object.entries(entry.component.props)
      .filter(([, prop]) => prop.required === true)
      .map(([prop]) => prop),
  ]),
);

type Value = string | number | boolean | null | Value[] | { [key: string]: Value };

interface Example {
  title: string;
  storyId: string;
  args: Record<string, Value>;
  harness?: 'trigger' | null;
}
const exampleSet = (name: string) => JSON.parse(read(`generated/examples/${name}.json`)) as { layout: 'sweep' | 'scenarios'; examples: Example[] };

/**
 * What an example has to *show*, per component, and the arg that says it has something to show.
 *
 * Job 546's regression class: `tools/docs_examples.ts` parsed the stories instead of evaluating
 * them, so `children: slides([…])` became `{ $unsupported }`, the island dropped it, and every
 * Carousel example rendered as two arrow buttons around a 0px track — visible, so the `empty` check
 * above passed it, and useless. The fix is in the extractor; this is what holds it fixed.
 *
 * The rule is the same for all four: an example whose args carry a non-empty `arg` must paint at
 * least one `selector` inside its card. Tied to the args rather than applied flatly, so DataGrid's
 * "Empty" and "Loading" stories — which carry no rows on purpose — are not failures.
 */
const CONTENT: Record<string, { arg: string; selector: string; what: string; shows?: (example: Example) => boolean }> = {
  Carousel: { arg: 'children', selector: '[data-part="slide"]', what: 'a slide' },
  Tabs: { arg: 'children', selector: '[role="tabpanel"]', what: 'a tab panel', shows: opensOnAPanel },
  Table: { arg: 'data', selector: '[data-part="body"] [data-part="row"]', what: 'a body row' },
  DataGrid: { arg: 'data', selector: '[data-part="body"] [data-part="row"]', what: 'a body row' },
  Stack: { arg: 'children', selector: '[data-part="container"] > *', what: 'a child' },
};

/**
 * Whether the tab a Tabs story opens on has a panel among its children.
 *
 * "Tab Without Panel" opens on `files` and supplies panels for the first two tabs only — a tab with
 * no panel is the thing it is demonstrating, so showing none is the correct render, not a hollow one.
 */
function opensOnAPanel(example: Example): boolean {
  const open = example.args['defaultValue'] ?? example.args['value'];
  const children = example.args['children'];
  if (typeof open !== 'string' || !Array.isArray(children)) return true;
  return children.some((child) => {
    if (typeof child !== 'object' || child === null || Array.isArray(child)) return false;
    const props = (child as { props?: Record<string, Value> }).props;
    return props !== undefined && props['id'] === open;
  });
}

/** Whether an example carries content in the arg its component shows it through. */
function carriesContent(name: string, example: Example): boolean {
  const rule = CONTENT[name];
  if (rule === undefined) return false;
  const value = example.args[rule.arg];
  const carries = Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null;
  return carries && (rule.shows?.(example) ?? true);
}

type Status = 'live' | 'harness' | 'empty' | 'notice-only' | 'source-note';
interface Row {
  title: string;
  storyId: string;
  status: Status;
  overflowX: boolean;
  /** How many `CONTENT[name].selector` elements the card paints, or `null` where the component has no rule. */
  content: number | null;
}

const LABEL = process.env['EXAMPLE_AUDIT_LABEL'] ?? 'latest';
const OUT = fileURLToPath(new URL(`logs/example-audit/${LABEL}/`, ROOT));

/**
 * What one panel or tile shows. Arrow-only on purpose: the body is serialized into the page, and a
 * named declaration can drag a transform helper along with it.
 */
async function classify(container: Locator, selector: string | null = null): Promise<Omit<Row, 'title' | 'storyId'>> {
  return container.evaluate((root, contentSelector) => {
    const card = root.querySelector('[data-example]');
    if (card === null) {
      const text = root.textContent ?? '';
      const notice =
        text.includes('does not render from its args alone') ||
        text.includes('frames the component in a decorator') ||
        text.includes('built in code rather than data');
      return { status: notice ? 'notice-only' : 'source-note', overflowX: false, content: null } as const;
    }
    // Job 546: what the example is supposed to be showing, counted where its component has a rule.
    const content = contentSelector === null ? null : card.querySelectorAll(contentSelector).length;
    if (card.hasAttribute('data-example-harness')) {
      return { status: 'harness', overflowX: card.scrollWidth > card.clientWidth + 1, content } as const;
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
    return { status: visible ? 'live' : 'empty', overflowX, content } as const;
  }, selector);
}

/** Every tab in one strip, selected in turn, and its panel classified. */
async function walkStrip(page: Page, strip: Locator, rows: Row[], selector: string | null) {
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
    rows.push({ title: (await tab.textContent()) ?? '', storyId, ...(await classify(panel, selector)) });
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
      const selector = CONTENT[name]?.selector ?? null;
      const rows: Row[] = [];
      if (layout === 'sweep') {
        for (const example of examples) {
          rows.push({
            title: example.title,
            storyId: example.storyId,
            ...(await classify(page.locator(`[data-example-tile="${example.storyId}"]`), selector)),
          });
        }
      } else {
        await walkStrip(page, page.getByRole('tablist', { name: `${name} examples`, exact: true }), rows, selector);
        const more = page.getByRole('button', { name: /^More examples \(\d+\)$/ });
        if ((await more.count()) > 0) {
          await more.evaluate((el) => (el as HTMLElement).click());
          await walkStrip(page, page.getByRole('tablist', { name: `More ${name} examples`, exact: true }), rows, selector);
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

      // Job 546: an example whose args carry content shows it. `empty` above only asks whether
      // *something* painted, and a Carousel with no slides paints its arrows.
      const byId = new Map(examples.map((example) => [example.storyId, example]));
      const hollow = rows.filter((row) => {
        const example = byId.get(row.storyId);
        return example !== undefined && carriesContent(name, example) && row.status !== 'notice-only' && (row.content ?? 0) === 0;
      });
      expect(hollow.map((row) => row.title), `examples showing no ${CONTENT[name]?.what ?? 'content'}`).toEqual([]);
    });
  }
});

/**
 * The `{ $unsupported }` residue, which is job 546's other half.
 *
 * `tools/docs_examples.ts` evaluates the story modules, so an arg is only a marker when it is
 * genuinely not data. What survives must therefore be a function — a column's `validate`, a
 * `formatValue` — named rather than quoted, and never the thing the example is *for*: not its
 * `children`, and not a prop the schema marks required. Both of those render as a working-looking
 * shell, and the extractor going back to guessing at values is exactly how that comes back.
 *
 * The listing is the `grep -c '$unsupported' generated/examples/*.json` the job asks the summary to
 * carry, with each survivor named with its story rather than counted.
 */
test.describe('the args the extractor could not carry', () => {
  /** Every marker in a value, as `path -> name`. Mirrors `unsupportedIn` in tools/docs_examples.ts. */
  const markers = (value: Value, path = ''): [string, string][] => {
    if (typeof value !== 'object' || value === null) return [];
    if (Array.isArray(value)) return value.flatMap((item, index) => markers(item, `${path}[${index}]`));
    const text = (value as { $unsupported?: unknown })['$unsupported'];
    if (typeof text === 'string') return [[path, text]];
    return Object.entries(value).flatMap(([key, item]) => markers(item, path === '' ? key : `${path}.${key}`));
  };

  test('every one of them is a function prop, and none of them is the example’s content', () => {
    const counts: Record<string, number> = {};
    const survivors: { component: string; story: string; path: string; name: string }[] = [];
    for (const name of MODULES) {
      const { examples } = exampleSet(name);
      for (const example of examples) {
        for (const [path, text] of markers(example.args)) {
          counts[name] = (counts[name] ?? 0) + 1;
          survivors.push({ component: name, story: example.title, path, name: text });
        }
      }
    }
    mkdirSync(OUT, { recursive: true });
    writeFileSync(`${OUT}unsupported.json`, JSON.stringify({ counts, survivors }, null, 2) + '\n');
    for (const [component, count] of Object.entries(counts).sort()) console.log(`  generated/examples/${component}.json: ${count}`);
    for (const row of survivors) console.log(`  · ${row.component}/${row.story}: ${row.path} = ${row.name}`);

    // A function serializes to its own name; source text, a call, anything with a space in it is the
    // parse having stood in for an evaluation that did not happen.
    const notFunctions = survivors.filter((row) => !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(row.name));
    expect(notFunctions, 'markers that are not a function’s name').toEqual([]);

    // The two places a dropped arg is not survivable — see apps/website/src/example-args.ts. Under
    // `children` the whole subtree counts: every element there is content. A required prop counts
    // only when the *prop itself* is the marker, because a marker inside one leaves the prop standing
    // (DataGrid's `columns` keeps all five columns when the fourth loses its `validate`).
    const content = survivors.filter((row) => row.path === 'children' || row.path.startsWith('children.') || row.path.startsWith('children['));
    expect(content, 'markers under `children`').toEqual([]);
    const requiredGaps = survivors.filter((row) => (REQUIRED.get(row.component) ?? []).includes(row.path));
    expect(requiredGaps, 'markers that are a required prop').toEqual([]);
  });
});
