#!/usr/bin/env node
/**
 * Keyboard gate — derive Playwright tests from each component's `keyboard` block.
 *
 * Nobody writes a keyboard test per component. The doc says "Escape closes" as data
 * (`{ keys: [Escape], expect: closes }`), and this script turns every such rule into a test
 * against the component's `Keyboard` Storybook story, for React (web) and Lit:
 *
 *     generated/keyboard/<Name>.<platform>.spec.ts
 *
 * Conventions the generated code must follow (they are in the platform templates):
 *   - every component with a `keyboard` block ships a story named `Keyboard` (id `<title-id>--keyboard`)
 *     that renders the component OPEN / present with at least three focusable children, and the
 *     trigger (if any) in the same story;
 *   - the component root carries the schema's a11y.role (or `data-ds="<Name>"` when role is none).
 *
 * Rules whose `expect` is `manual` are listed in the spec as `test.skip` so the report shows
 * coverage, not silence.
 *
 * The same block is also written out as data — `generated/keyboard/<Name>.json` — because the fourth
 * platform's keyboard gate is not Playwright: it is an XCUITest driving an iPad simulator with a hardware
 * keyboard (.github/workflows/swiftui-gates.yml, job 440). Swift cannot read a Markdown doc on the runner
 * and the macOS job never runs `pnpm install`, so the rules travel to it as JSON, derived here where the
 * `keyboard` block is already parsed. One derivation, two consumers: a rule that changes in the doc changes
 * both gates.
 *
 * Usage:  node tools/keyboard_tests.ts          # writes generated/keyboard/*.spec.ts and *.json
 *         pnpm gates:keyboard                    # runs them (Playwright starts the Storybooks)
 *
 * Port of tools/keyboard_tests.py: same specs byte for byte, same line on stdout, same exit code.
 * Runs under Node's type stripping (22.18+ / 24): annotations only.
 */
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { freshOutDir, readComponents } from './lib/components.ts';
import type { Dict } from './lib/components.ts';
import { pyGet, truthy, writeText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

export type { Dict };

/** Every path the tool reads or writes. The tests point these at a sandbox, the way the Python tests
 *  monkeypatched the module globals. */
export const paths = {
  ROOT: REPO_ROOT,
  GENERATED: join(REPO_ROOT, 'generated'),
  OUT: join(REPO_ROOT, 'generated', 'keyboard'),
};

export const PLATFORMS: Record<string, { suffix: string; port: number }> = {
  web: { suffix: 'React', port: 6007 },
  lit: { suffix: 'Lit', port: 6008 },
};

const KEY_MAP: Record<string, string> = { ' ': 'Space', 'Shift+Tab': 'Shift+Tab' }; // Playwright key names; everything else passes through
const LETTERS = /^[a-z]-[a-z]$/;

/** Storybook's id for title '<Name>/<Suffix>' and export 'Keyboard'. */
export function storyId(name: string, suffix: string): string {
  const title = `${name}/${suffix}`.toLowerCase().replaceAll('/', '-');
  return `${title}--keyboard`;
}

export function rootLocator(c: Dict): string {
  const role = c.a11y.role as string;
  if (['none', 'landmark', 'img'].includes(role)) return `page.locator('[data-ds="${c.name as string}"]').first()`;
  return `page.getByRole('${role}').first()`;
}

const EXPECT_BLOCKS: Record<string, string> = {
  'closes': 'await expect(root).toBeHidden();',
  'opens': 'await expect(root).toBeVisible();',
  'focus-next': 'expect(await focusIndex(page, root)).toBe(before + 1);',
  'focus-prev': 'expect(await focusIndex(page, root)).toBe(before - 1);',
  'focus-first': 'expect(await focusIndex(page, root)).toBe(0);',
  'focus-last': 'expect(await focusIndex(page, root)).toBe(await focusableCount(page, root) - 1);',
  'focus-wraps-to-first': 'expect(await focusIndex(page, root)).toBe(0);',
  'focus-wraps-to-last': 'expect(await focusIndex(page, root)).toBe(await focusableCount(page, root) - 1);',
  'focus-trigger': 'await expect(trigger(page)).toBeFocused();',
  'focus-unchanged': 'expect(await focusIndex(page, root)).toBe(before);',
  'toggles': 'expect(await ariaState(page)).not.toBe(stateBefore);',
  'selects': 'expect(await ariaState(page)).toMatch(/true/);',
};

/** The assertion for one `expect` value; an `expect` the schema does not know is a KeyError, as the
 *  Python dict lookup was (`manual` never reaches here — it becomes a `test.skip`). */
export function expectBlock(exp: string): string {
  if (!Object.hasOwn(EXPECT_BLOCKS, exp)) throw new Error(`KeyError: '${exp}'`);
  return EXPECT_BLOCKS[exp] as string;
}

const FROM_BLOCKS: Record<string, string> = {
  trigger: 'await trigger(page).focus();',
  first: 'await focusAt(page, root, 0);',
  last: 'await focusAt(page, root, await focusableCount(page, root) - 1);',
  inside: 'await focusAt(page, root, 1);',
  any: '',
};

export function fromBlock(frm: string): string {
  if (!Object.hasOwn(FROM_BLOCKS, frm)) throw new Error(`KeyError: '${frm}'`);
  return FROM_BLOCKS[frm] as string;
}

export const HELPERS = `
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([data-focus-sentinel]), [role="menuitem"], [role="option"], [role="radio"]';

/** Focusable elements inside the root, in DOM order, crossing shadow roots. */
async function focusables(page: Page, root: Locator): Promise<number> {
  return root.evaluate((el, sel) => {
    const out: Element[] = [];
    const walk = (n: Element | ShadowRoot) => {
      for (const c of Array.from(n.querySelectorAll(sel))) out.push(c);
      for (const c of Array.from(n.querySelectorAll('*'))) if ((c as HTMLElement).shadowRoot) walk((c as HTMLElement).shadowRoot!);
    };
    walk(el);
    (window as any).__dsFocusables = out;
    return out.length;
  }, FOCUSABLE);
}
async function focusableCount(page: Page, root: Locator): Promise<number> { return focusables(page, root); }
async function focusAt(page: Page, root: Locator, i: number): Promise<void> {
  await focusables(page, root);
  await page.evaluate((i) => {
    const el = (window as any).__dsFocusables[i] as HTMLElement | undefined;
    if (!el) return;
    if (el.getAttribute('role') === 'option') {
      // activedescendant composite: focus the listbox and point it at the option via a click (sets active)
      const list = el.closest('[role="listbox"]') as HTMLElement | null;
      list?.focus();
      el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true }));
    } else {
      el.focus();
    }
  }, i);
}
/** Index of the deep active element among the root's focusables, or -1. Composites that keep DOM focus on a
 *  container and point at the active item with aria-activedescendant (Listbox, Combobox) resolve to that item. */
async function focusIndex(page: Page, root: Locator): Promise<number> {
  await focusables(page, root);
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const desc = a?.getAttribute('aria-activedescendant');
    if (desc) {
      const scope = (a!.getRootNode() as Document | ShadowRoot);
      const target = scope.getElementById ? scope.getElementById(desc) : null;
      if (target) a = target;
    }
    return ((window as any).__dsFocusables as Element[]).indexOf(a as Element);
  });
}
function trigger(page: Page): Locator {
  return page.locator('[aria-haspopup], [aria-expanded], [aria-controls]').first();
}
/** aria-expanded / aria-checked / aria-selected of the deep active element (or the trigger), for toggles/selects. */
async function ariaState(page: Page): Promise<string> {
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const el = a ?? document.querySelector('[aria-haspopup], [aria-expanded]');
    return [el?.getAttribute('aria-expanded'), el?.getAttribute('aria-checked'), el?.getAttribute('aria-selected')].join('|');
  });
}
`;

export function specFor(c: Dict, platform: string): string {
  const name = c.name as string;
  const cfg = PLATFORMS[platform] as { suffix: string; port: number };
  const sid = storyId(name, cfg.suffix);
  const lines: string[] = [
    '// Generated by tools/keyboard_tests.ts from the `keyboard` block of the ' + name + ' doc. Do not edit.',
    "import { test, expect, type Page, type Locator } from '@playwright/test';",
    HELPERS,
    `test.describe('${name} (${platform}) keyboard', () => {`,
    '  test.beforeEach(async ({ page }) => {',
    `    await page.goto('/iframe.html?id=${sid}&viewMode=story');`,
    `    await expect(${rootLocator(c)}).toBeVisible();`,
    '  });',
  ];
  const rules = truthy(c.keyboard) ? (c.keyboard as Dict[]) : [];
  for (const rule of rules) {
    const exp = pyGet(rule, 'expect', 'manual') as string;
    const frm = pyGet(rule, 'from', 'inside') as string;
    for (const key of rule.keys as string[]) {
      const [keyName, label] = LETTERS.test(key) ? ['a', 'typeahead letter'] : [Object.hasOwn(KEY_MAP, key) ? (KEY_MAP[key] as string) : key, key];
      const title = `${label}: ${rule.action as string}`.replaceAll("'", "\\'");
      const when = truthy(pyGet(rule, 'when', null)) ? ` (${rule.when as string})` : '';
      if (exp === 'manual') {
        lines.push(`  test.skip('${title}${when} — manual', async () => {});`);
        continue;
      }
      lines.push(
        `  test('${title}${when}', async ({ page }) => {`,
        `    const root = ${rootLocator(c)};`,
        `    ${fromBlock(frm)}`,
        '    const before = await focusIndex(page, root);',
        '    const stateBefore = await ariaState(page);',
        '    void before; void stateBefore;',
        `    await page.keyboard.press('${keyName}');`,
        `    ${expectBlock(exp)}`,
        '  });',
      );
    }
  }
  lines.push('});');
  return lines.join('\n') + '\n';
}

/** One rule as the XCUITest reads it: the doc's own fields, with the defaults already applied so the
 *  Swift side never has to know what `from` means when it is absent. */
export type KeyboardRule = { keys: string[]; action: string; from: string; expect: string; when?: string };
export type KeyboardSpec = { name: string; role: string; identifier: string; rules: KeyboardRule[] };

/**
 * The `keyboard` block as data, for a consumer that is not Playwright.
 *
 * `identifier` is the component root's `.accessibilityIdentifier` (process/ios-platform.md, "Testability
 * hook": the root carries `<Name>`), which is how XCUITest finds what the web spec finds by role.
 */
export function specData(c: Dict): KeyboardSpec {
  const rules: KeyboardRule[] = [];
  for (const rule of (truthy(c.keyboard) ? (c.keyboard as Dict[]) : [])) {
    const when = pyGet(rule, 'when', null);
    rules.push({
      keys: [...(rule.keys as string[])],
      action: rule.action as string,
      from: pyGet(rule, 'from', 'inside') as string,
      expect: pyGet(rule, 'expect', 'manual') as string,
      ...(truthy(when) ? { when: when as string } : {}),
    });
  }
  return { name: c.name as string, role: c.a11y.role as string, identifier: c.name as string, rules };
}

export function main(): number {
  const comps = readComponents(join(paths.GENERATED, 'components.json'));
  freshOutDir(paths.OUT, (n) => n.endsWith('.spec.ts') || n.endsWith('.json'));
  let nSpecs = 0;
  let nTests = 0;
  let nManual = 0;
  let nData = 0;
  for (const entry of comps) {
    const c = entry.component as Dict;
    if (!truthy(pyGet(c, 'keyboard', null))) continue;
    for (const platform of Object.keys(PLATFORMS)) {
      const declared = pyGet(c.platforms as Dict, platform, {}) as Dict;
      if (!truthy(pyGet(declared, 'supported', true)) || !Object.hasOwn(c.platforms as Dict, platform)) continue;
      writeText(join(paths.OUT, `${c.name as string}.${platform}.spec.ts`), specFor(c, platform));
      nSpecs += 1;
    }
    // Platform-neutral: the block is the doc's, not a platform's, and the swiftui gate reads it for any
    // component whose screen the gallery can open.
    writeText(join(paths.OUT, `${c.name as string}.json`), JSON.stringify(specData(c), null, 2) + '\n');
    nData += 1;
    for (const r of c.keyboard as Dict[]) {
      for (const _key of r.keys as string[]) {
        void _key;
        if (pyGet(r, 'expect', 'manual') === 'manual') nManual += 1;
        else nTests += 1;
      }
    }
  }
  const out = relative(paths.ROOT, paths.OUT);
  process.stdout.write(
    `✔ keyboard gate: ${nSpecs} spec(s), ${nTests} auto-tested rule(s) per platform, ${nManual} manual, ` +
      `${nData} rule set(s) for the swiftui gate → ${out}/\n`,
  );
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
