// Job 523's gate: /docs/naming-demo renders three components twice — Design Schema's build and Demo
// Brand's renamed one — and the two have to differ in identifiers and nothing else. Run with
// `pnpm gates:website`.
//
// `pnpm demo:naming:check` already proves that about the *source*: same tokens in the same positions,
// every differing name explained by themes/demo-brand/naming.md. This is the half a source diff
// cannot reach — what the browser actually builds out of that source:
//
//   - the same DOM, element for element and attribute for attribute;
//   - the same accessibility tree, which is the thing a person using the two would experience;
//   - the same behaviour, driven through both halves of every interaction on the page;
//   - and the canonical gate hooks (`data-ds`, `data-part`) still on the renamed markup, which is
//     what lets the derived behavior and keyboard gates stay brand-agnostic.
//
// The comparison is deliberately mechanical. The brand's markup is normalised back to the canonical
// vocabulary using `packages/react/demo-brand/renames.json` — the file `pnpm demo:naming` writes from
// the diff it computed — so this gate cannot be satisfied by a rename the naming doc does not
// describe: anything else that differed would survive the normalisation and fail the comparison.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect, type Locator, type Page } from '@playwright/test';

import { audit, describe } from './axe';

const ROOT = new URL('../../', import.meta.url);
const renames = JSON.parse(readFileSync(fileURLToPath(new URL('packages/react/demo-brand/renames.json', ROOT)), 'utf8')) as {
  namespace: { cssPrefix: string };
  components: Record<string, string>;
};

const ROUTE = '/docs/naming-demo';
/** Design Schema's own CSS prefix — what the brand's one is normalised back to. */
const CANONICAL_PREFIX = 'ds';

const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Brand spelling → canonical spelling, longest first.
 *
 * A class or custom-element name carries both halves — the namespace prefix and the component's own
 * name — so `demo-cta-button` has to become `ds-button` before the bare prefix rule runs. Everything
 * else the prefix covers on its own: `demo-icon` (a component the doc does not rename), `demo-text`,
 * and every `--demo-*` custom property, whose remainder is the canonical binding name already.
 */
const NORMALISE: [string, string][] = [
  ...Object.entries(renames.components).map(([canonical, brand]): [string, string] => [
    `${renames.namespace.cssPrefix}-${kebab(brand)}`,
    `${CANONICAL_PREFIX}-${kebab(canonical)}`,
  ]),
  [`${renames.namespace.cssPrefix}-`, `${CANONICAL_PREFIX}-`],
].sort((a, b) => b[0].length - a[0].length);

/**
 * One rendered subtree, as a string both sides can be compared through.
 *
 * Two things are neutralised before anything is compared, and neither is a name the naming doc can
 * move: the `data-demo` hook this gate locates the subtree with, and React's generated ids — `useId`
 * counts instances per page, so two renders of the same component are always going to disagree about
 * them. Ids are renumbered in order of appearance and rewritten everywhere they are referenced, so an
 * `aria-labelledby` that pointed at the wrong element would still fail.
 */
function normalise(html: string, side: 'canonical' | 'brand'): string {
  let out = html.replace(/ data-demo="[^"]*"/g, '');
  const ids: string[] = [];
  for (const m of out.matchAll(/ id="([^"]*)"/g)) if (!ids.includes(m[1] as string)) ids.push(m[1] as string);
  // Longest first: one generated id can be a prefix of another (`…_2lj_` and `…_2ljH1_`).
  for (const id of [...ids].sort((a, b) => b.length - a.length)) out = out.split(id).join(`id-${ids.indexOf(id)}`);
  if (side === 'brand') for (const [from, to] of NORMALISE) out = out.split(from).join(to);
  return out;
}

const box = (page: Page, side: 'canonical' | 'brand', name: string): Locator => page.locator(`[data-demo="${side}:${name}"]`);

/** The island is `client:load`; Astro drops `ssr` from it when it has hydrated. */
async function open(page: Page) {
  await page.goto(ROUTE);
  await expect(page.locator('astro-island[ssr][component-url*="NamingDemo"]')).toHaveCount(0);
}

const markup = (locator: Locator) => locator.evaluate((el) => el.outerHTML);

const COMPONENTS = ['Button', 'Disclosure', 'Alert'];

test.describe('naming demo — the two builds render the same thing', () => {
  for (const name of COMPONENTS) {
    test(`${name}: same DOM, once the brand’s identifiers are read as the canonical ones`, async ({ page }) => {
      await open(page);
      const canonical = normalise(await markup(box(page, 'canonical', name)), 'canonical');
      const brand = normalise(await markup(box(page, 'brand', name)), 'brand');
      expect(brand).toBe(canonical);
      // Not vacuous: the two really were different before normalising.
      expect(await markup(box(page, 'brand', name))).not.toBe(await markup(box(page, 'canonical', name)));
    });

    test(`${name}: same accessibility tree`, async ({ page }) => {
      await open(page);
      expect(await box(page, 'brand', name).ariaSnapshot()).toBe(await box(page, 'canonical', name).ariaSnapshot());
    });
  }

  test('the renamed markup still carries the canonical gate hooks', async ({ page }) => {
    await open(page);
    // `data-ds="Button"` on a component the brand calls CtaButton, inside a component it calls
    // Callout — this is what keeps tools/behavior_tests.ts and tools/keyboard_tests.ts able to find a
    // component without knowing any brand's vocabulary.
    await expect(box(page, 'brand', 'Button').locator('[data-ds="Button"]')).toHaveCount(1);
    await expect(box(page, 'brand', 'Button').locator('[data-part="leadingIcon"]')).toHaveCount(1);
    await expect(box(page, 'brand', 'Alert').locator('[data-ds="Alert"]')).toHaveCount(1);
    await expect(box(page, 'brand', 'Alert').locator('[data-ds="Button"]')).toHaveCount(1);
    await expect(box(page, 'brand', 'Disclosure').locator('[data-ds="Disclosure"]')).toHaveCount(1);
    // And the brand's own names really are on the same markup.
    await expect(box(page, 'brand', 'Button').locator('.demo-cta-button')).toHaveCount(1);
    await expect(box(page, 'canonical', 'Button').locator('.ds-button')).toHaveCount(1);
  });

  test('a component the naming doc does not rename keeps its name and takes the prefix', async ({ page }) => {
    await open(page);
    // Icon is in the demo tree because Callout composes it, and it is not in the components map: the
    // namespace belongs to the whole generated surface, a component name to one entry in a map.
    await expect(box(page, 'brand', 'Alert').locator('.demo-icon')).toHaveCount(2);
    await expect(box(page, 'brand', 'Alert').locator('[data-ds="Icon"]')).toHaveCount(2);
  });
});

test.describe('naming demo — the two builds behave the same', () => {
  test('pressing either button reports the same press', async ({ page }) => {
    await open(page);
    for (const side of ['canonical', 'brand'] as const) {
      await box(page, side, 'Button').getByRole('button', { name: 'Save changes' }).click();
      await expect(box(page, side, 'Button')).toContainText('1 press');
    }
    // Same state on both, so the subtrees are comparable again — an interaction that changed one
    // build's markup differently from the other's would fail here rather than go unnoticed.
    expect(normalise(await markup(box(page, 'brand', 'Button')), 'brand')).toBe(
      normalise(await markup(box(page, 'canonical', 'Button')), 'canonical'),
    );
  });

  test('either disclosure opens, and both trees say so the same way', async ({ page }) => {
    await open(page);
    for (const side of ['canonical', 'brand'] as const) {
      const trigger = box(page, side, 'Disclosure').getByRole('button', { name: 'Delivery options' });
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await trigger.click();
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(box(page, side, 'Disclosure')).toContainText('Standard delivery');
    }
    expect(await box(page, 'brand', 'Disclosure').ariaSnapshot()).toBe(await box(page, 'canonical', 'Disclosure').ariaSnapshot());
  });

  test('either notice dismisses, through the button its own build composes', async ({ page }) => {
    await open(page);
    for (const side of ['canonical', 'brand'] as const) {
      await box(page, side, 'Alert').getByRole('button', { name: 'Dismiss' }).click();
      await expect(box(page, side, 'Alert')).toHaveText('Dismissed.');
    }
    expect(normalise(await markup(box(page, 'brand', 'Alert')), 'brand')).toBe(
      normalise(await markup(box(page, 'canonical', 'Alert')), 'canonical'),
    );
  });

  test('keyboard: the renamed disclosure is reachable and operable like the canonical one', async ({ page }) => {
    await open(page);
    for (const side of ['canonical', 'brand'] as const) {
      const trigger = box(page, side, 'Disclosure').getByRole('button', { name: 'Delivery options' });
      await trigger.focus();
      await expect(trigger).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Space');
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
  });
});

test.describe('naming demo — the page itself', () => {
  test('the rename tables are rendered from the demo tree’s own diff', async ({ page }) => {
    await open(page);
    const map = page.locator('[data-table="naming-demo-map"]');
    // One row per entry in the naming doc, plus the two namespace rows.
    const rows = Object.keys(renames.components).length + 1 + 2;
    await expect(map.getByRole('row')).toHaveCount(rows + 1); // + the header row
    for (const [canonical, brand] of Object.entries(renames.components)) {
      await expect(map.getByRole('rowheader', { name: canonical, exact: true })).toBeVisible();
      await expect(map.getByRole('cell', { name: brand, exact: true })).toBeVisible();
    }
  });

  test('axe is clean', async ({ page }) => {
    await open(page);
    expect(describe((await audit(page).analyze()).violations)).toEqual([]);
  });
});
