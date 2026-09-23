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
 *   - the component root carries the schema's resolved role (or `data-ds="<Name>"` when that role is unresolved,
 *     one of NON_QUERYABLE_ROLES, or one of LEAF_CONTROL_ROLES — a role that names a control inside the
 *     component rather than its root).
 *
 * Rules whose `expect` is `manual` are listed in the spec as `test.skip` so the report shows
 * coverage, not silence (`— native` when the rule is the rendered element's own behavior, `— manual`
 * otherwise). A rule scoped by `platforms` is emitted only on those platforms; `given` renders the story with
 * those args, `target` asserts closes/opens on a `data-part`, and `repeat` presses the chord that many times.
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
import { expectList, NON_QUERYABLE_ROLES, normalizeKey, resolveRole, roleIn } from '../schema/component.ts';

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

const KEY_MAP: Record<string, string> = { ' ': 'Space' }; // Playwright's name for the space key; every other KeyboardEvent.key passes through
const LETTERS = /^[a-z]-[a-z]$/;

/** A `keyChord` as `page.keyboard.press` spells it: the `Space` alias normalized, then each key through KEY_MAP. */
export function playwrightKey(chord: string): string {
  return normalizeKey(chord)
    .split('+')
    .map((k) => (Object.hasOwn(KEY_MAP, k) ? (KEY_MAP[k] as string) : k))
    .join('+');
}

/** Storybook's id for title '<Name>/<Suffix>' and export 'Keyboard'. */
export function storyId(name: string, suffix: string): string {
  const title = `${name}/${suffix}`.toLowerCase().replaceAll('/', '-');
  return `${title}--keyboard`;
}

/** The story's iframe URL. A rule's `given` rides along as Storybook URL args (`&args=key:value;flag:!true`), which
 *  the schema already restricted to booleans, numbers and strings Storybook accepts; a space is spelled `+`. */
export function storyUrl(id: string, given?: Dict | null): string {
  const base = `/iframe.html?id=${id}&viewMode=story`;
  const entries = Object.entries(given ?? {});
  if (!entries.length) return base;
  const arg = (value: unknown): string => (typeof value === 'boolean' ? `!${String(value)}` : String(value).replaceAll(' ', '+'));
  return `${base}&args=${entries.map(([key, value]) => `${key}:${arg(value)}`).join(';')}`;
}

/** Roles that name a single control *inside* the component, not the component root. The generated
 *  tests walk the root for the component's focusables, so anchoring one to a leaf control finds
 *  nothing: an `<input role="searchbox">` and a slider thumb have no focusable descendants, so
 *  `focusables` returns 0 and every focus-order assertion resolves to -1 no matter what the key does
 *  (Search's Tab across input → clear → submit, Slider's Tab between the two thumbs). A leaf role is
 *  also not stable — Search's input becomes `combobox` once `suggestions` is set, so the `searchbox`
 *  probe cannot even find the field. Anchor to `data-ds`, the component root, as an unresolved role
 *  already does. */
const LEAF_CONTROL_ROLES = ['searchbox', 'slider'] as const;

export function rootLocator(c: Dict, given?: Dict | null, platform?: string): string {
  const role = resolveRole(c, given ?? undefined, platform);
  if (role === null || roleIn(NON_QUERYABLE_ROLES, role) || roleIn(LEAF_CONTROL_ROLES, role))
    return `page.locator('[data-ds="${c.name as string}"]').first()`;
  return `page.getByRole('${role}').first()`;
}

/** An anatomy part, by the `data-part` hook the web and Lit conventions put on it. */
export function partLocator(part: string): string {
  return `page.locator('[data-part="${part}"]').first()`;
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
  // Not an index: a root with no focusables (Tooltip, whose focus stays on its trigger) reads -1 before and after,
  // which passed whatever the key did. `held` is the focused element pinned before the press (holdFocus).
  'focus-unchanged': "expect(held, 'nothing to hold focus').toBe(true); expect(await focusHeld(page)).toBe(true);",
  'toggles': 'expect(await ariaState(page)).not.toBe(stateBefore);',
  'selects': 'expect(await ariaState(page)).toMatch(/true/);',
};

/** The assertion for one `expect` value; an `expect` the schema does not know is a KeyError, as the
 *  Python dict lookup was (`manual` never reaches here — it becomes a `test.skip`). `repeat` scales the move
 *  focus-next and focus-prev expect, and `target` is the part closes and opens assert on instead of the root. */
export function expectBlock(exp: string, repeat = 1, target?: string | null): string {
  if (!Object.hasOwn(EXPECT_BLOCKS, exp)) throw new Error(`KeyError: '${exp}'`);
  let block = EXPECT_BLOCKS[exp] as string;
  if ((exp === 'closes' || exp === 'opens') && target !== undefined && target !== null) block = block.replace('expect(root)', `expect(${partLocator(target)})`);
  if ((exp === 'focus-next' || exp === 'focus-prev') && repeat !== 1) block = block.replace(/before ([+-]) 1\)/, `before $1 ${repeat})`);
  return block;
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
/** What the keyboard reaches: native controls that are tab stops (not tabindex=-1, not hidden, not a hidden
 *  input), explicit tab stops, and the items of a composite, which rove whatever their tabindex. A composite item
 *  carries \`:not([aria-disabled="true"])\` only where its keyboard block says disabled items are skipped (Tree).
 *  A grid's cells and rows rove with a tabindex; a table's rows carry the role too but are no stop at all. */
const NATIVE = ['a[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])', 'select:not([disabled])', 'textarea:not([disabled])']
  .map((s) => s + ':not([hidden])');
const FOCUSABLE = NATIVE.map((s) => s + ':not([tabindex="-1"])').concat(
  '[tabindex]:not([tabindex="-1"]):not([data-focus-sentinel])',
  '[role="menuitem"]', '[role="option"]', '[role="radio"]', '[role="treeitem"]:not([aria-disabled="true"])', '[role="tab"]',
  '[role="gridcell"][tabindex]', '[role="row"][tabindex]',
).join(', ');
/** A toolbar is the one roving composite whose items have no role of their own: its controls are plain buttons,
 *  and every one but the current carries tabindex=-1. They count while the nearest composite around them is the
 *  toolbar — a tabindex=-1 control inside a composite item (Tree's chevron, inside its treeitem) does not. */
const TOOLBAR_ITEM = NATIVE.join(', ');
const COMPOSITE = /^(tree|treegrid|grid|tablist|menu|menubar|listbox|radiogroup|treeitem|row|gridcell|tab|menuitem|option|radio)$/;

/** Focusable elements inside the root, in flat-tree order: light DOM, open shadow roots, and the
 *  elements a <slot> renders. Following slots is what makes a component whose content is slotted
 *  report the order the browser actually tabs in — a walk that stops at the <slot> sees only the
 *  component's own shadow-side controls, so \`first\` and \`last\` collapse onto the same element and
 *  demand opposite behavior of it. React output has neither shadow roots nor slots: it walks as
 *  before, element for element. A match under a display:none ancestor is not rendered, which no
 *  selector can see, so each match must also pass checkVisibility(). */
async function focusables(page: Page, root: Locator): Promise<number> {
  return root.evaluate((el, [sel, toolbarItem, composite]) => {
    const out: Element[] = [];
    const isComposite = new RegExp(composite);
    const walk = (n: Element, inToolbar: boolean) => {
      const role = n.getAttribute('role') ?? '';
      if (role === 'toolbar') inToolbar = true;
      else if (isComposite.test(role)) inToolbar = false;
      if (n !== el && (n.matches(sel) || (inToolbar && n.matches(toolbarItem))) && n.checkVisibility()) out.push(n);
      if (n instanceof HTMLSlotElement) {
        for (const assigned of n.assignedElements({ flatten: true })) walk(assigned, inToolbar);
        return;
      }
      const scope: Element | ShadowRoot = (n as HTMLElement).shadowRoot ?? n;
      for (const c of Array.from(scope.children)) walk(c, inToolbar);
    };
    walk(el, false);
    (window as any).__dsFocusables = out;
    return out.length;
  }, [FOCUSABLE, TOOLBAR_ITEM, COMPOSITE.source] as const);
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
/** The test's subject, resolved once: the root locator ends in \`.first()\`, which re-resolves on every use, so
 *  after a key dismisses one instance (a Toast) it would promote the next and assert against that. Stamping the
 *  element pins it; once it leaves the DOM the stamped locator matches nothing, which reads as hidden. */
async function subject(page: Page, root: Locator): Promise<Locator> {
  await root.evaluate((el) => el.setAttribute('data-ds-keyboard-subject', ''));
  return page.locator('[data-ds-keyboard-subject]');
}
/** Pins the element that holds focus — the deep active element, or the item its aria-activedescendant points at,
 *  as focusIndex resolves it — and says whether anything does (the page body holding it is nothing).
 *  focusHeld then says whether that same element still holds it. */
async function holdFocus(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const desc = a?.getAttribute('aria-activedescendant');
    const scope = a?.getRootNode() as Document | ShadowRoot | undefined;
    const item = desc && scope?.getElementById ? scope.getElementById(desc) : null;
    const held = item ?? a;
    (window as any).__dsHeld = held;
    return !!held && held !== document.body && held !== document.documentElement;
  });
}
async function focusHeld(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const desc = a?.getAttribute('aria-activedescendant');
    const scope = a?.getRootNode() as Document | ShadowRoot | undefined;
    const item = desc && scope?.getElementById ? scope.getElementById(desc) : null;
    return (item ?? a) === (window as any).__dsHeld;
  });
}
function trigger(page: Page): Locator {
  return page.locator('[aria-haspopup], [aria-expanded], [aria-controls]').first();
}
/** aria-expanded / aria-checked / aria-selected of the deep active element (or the trigger), for toggles/selects,
 *  followed by the same three of its aria-activedescendant item. A composite that keeps DOM focus on a container
 *  and points at the active item (Listbox, Combobox) carries the selected state on that item, never on the focused
 *  container — the same resolution focusIndex already does. The item's state is appended rather than substituted
 *  because the container is what holds aria-expanded: a Combobox input is both at once. Appending can only add a
 *  state, so it never turns a passing toggles/selects assertion red. */
async function ariaState(page: Page): Promise<string> {
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const el = a ?? document.querySelector('[aria-haspopup], [aria-expanded]');
    const desc = el?.getAttribute('aria-activedescendant');
    const scope = (el?.getRootNode() ?? document) as Document | ShadowRoot;
    const item = desc && scope.getElementById ? scope.getElementById(desc) : null;
    const read = (n: Element | null | undefined): (string | null | undefined)[] =>
      [n?.getAttribute('aria-expanded'), n?.getAttribute('aria-checked'), n?.getAttribute('aria-selected')];
    return [...read(el), ...read(item)].join('|');
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
    `    await page.goto('${storyUrl(sid)}');`,
    // Precondition, not an assertion about behavior: it only asks whether the story has rendered yet.
    // The Storybooks are Vite dev servers that compile a story's module on first request, which under a
    // full-suite run (one worker per core, three Storybooks) routinely passes 5s — and a story that never
    // rendered fails every test in the file with "element(s) not found", reported against whichever
    // component the job happens to be generating. The behavior assertions keep the default timeout.
    // 15s is above a cold compile and below Playwright's 30s test timeout, so a root that renders but
    // stays hidden still fails as a readable expect ("Received: hidden") rather than a hook timeout.
    `    await expect(${rootLocator(c, null, platform)}).toBeVisible({ timeout: 15_000 });`,
    '  });',
  ];
  const rules = truthy(c.keyboard) ? (c.keyboard as Dict[]) : [];
  for (const rule of rules) {
    if (!appliesOn(rule, platform)) continue;
    const outcomes = expectList(rule);
    const frm = pyGet(rule, 'from', 'inside') as string;
    const given = (rule.given ?? null) as Dict | null;
    const target = (rule.target ?? null) as string | null;
    const repeat = (rule.repeat ?? 1) as number;
    for (const key of rule.keys as string[]) {
      const [keyName, label] = LETTERS.test(key) ? ['a', 'typeahead letter'] : [playwrightKey(key), key];
      const title = `${label}: ${rule.action as string}`.replaceAll("'", "\\'");
      const when = truthy(pyGet(rule, 'when', null)) ? ` (${rule.when as string})` : '';
      if (outcomes.includes('manual')) {
        lines.push(`  test.skip('${title}${when} — ${rule.native === true ? 'native' : 'manual'}', async () => {});`);
        continue;
      }
      lines.push(`  test('${title}${when}', async ({ page }) => {`);
      // Same precondition after a re-goto with the rule's `given` args.
      if (given !== null) lines.push(`    await page.goto('${storyUrl(sid, given)}');`, `    await expect(${rootLocator(c, given, platform)}).toBeVisible({ timeout: 15_000 });`);
      const press = `await page.keyboard.press('${keyName}');`;
      lines.push(
        `    const root = await subject(page, ${rootLocator(c, given, platform)});`,
        `    ${fromBlock(frm)}`,
        '    const before = await focusIndex(page, root);',
        '    const stateBefore = await ariaState(page);',
        '    void before; void stateBefore;',
        ...(outcomes.includes('focus-unchanged') ? ['    const held = await holdFocus(page);'] : []),
        repeat > 1 ? `    for (let i = 0; i < ${repeat}; i++) ${press}` : `    ${press}`,
        ...outcomes.map((exp) => `    ${expectBlock(exp, repeat, target)}`),
        '  });',
      );
    }
  }
  lines.push('});');
  return lines.join('\n') + '\n';
}

/** True when the rule applies on `platform`: it names no platforms, or names this one. */
export function appliesOn(rule: Dict, platform: string): boolean {
  return rule.platforms === undefined || rule.platforms === null || (rule.platforms as string[]).includes(platform);
}

/** One rule as the XCUITest reads it: the doc's own fields, with the defaults already applied so the
 *  Swift side never has to know what `from` means when it is absent. `expect` is always one string (the Swift
 *  decoder reads no other form); `expectAll` carries an outcome list, which that decoder ignores. */
export type KeyboardRule = {
  keys: string[]; action: string; from: string; expect: string; when?: string;
  expectAll?: string[]; given?: Dict; target?: string; repeat?: number; platforms?: string[]; native?: boolean;
};
export type KeyboardSpec = { name: string; role: string | null; identifier: string; rules: KeyboardRule[] };

/**
 * The `keyboard` block as data, for a consumer that is not Playwright.
 *
 * `identifier` is the component root's `.accessibilityIdentifier` (process/ios-platform.md, "Testability
 * hook": the root carries `<Name>`), which is how XCUITest finds what the web spec finds by role.
 *
 * Rules scoped away from swiftui are dropped. The XCUITest can neither render with props nor find a part, and it
 * presses each key once, so a rule with `given`, `target` or `repeat` above 1 is written as `manual` there.
 */
export function specData(c: Dict): KeyboardSpec {
  const rules: KeyboardRule[] = [];
  for (const rule of (truthy(c.keyboard) ? (c.keyboard as Dict[]) : [])) {
    if (!appliesOn(rule, 'swiftui')) continue;
    const when = pyGet(rule, 'when', null);
    const unreachable = rule.given !== undefined || rule.target !== undefined || ((rule.repeat ?? 1) as number) > 1;
    rules.push({
      keys: [...(rule.keys as string[])],
      action: rule.action as string,
      from: pyGet(rule, 'from', 'inside') as string,
      expect: unreachable ? 'manual' : (expectList(rule)[0] as string),
      ...(truthy(when) ? { when: when as string } : {}),
      ...(Array.isArray(rule.expect) ? { expectAll: [...(rule.expect as string[])] } : {}),
      ...(rule.given !== undefined ? { given: rule.given as Dict } : {}),
      ...(rule.target !== undefined ? { target: rule.target as string } : {}),
      ...(rule.repeat !== undefined ? { repeat: rule.repeat as number } : {}),
      ...(rule.platforms !== undefined ? { platforms: [...(rule.platforms as string[])] } : {}),
      ...(rule.native !== undefined ? { native: rule.native as boolean } : {}),
    });
  }
  return { name: c.name as string, role: resolveRole(c, undefined, 'swiftui'), identifier: c.name as string, rules };
}

export function main(): number {
  const comps = readComponents(join(paths.GENERATED, 'components.json'));
  freshOutDir(paths.OUT, (n) => n.endsWith('.spec.ts') || n.endsWith('.json'));
  let nSpecs = 0;
  let nTests = 0;
  let nManual = 0;
  let nNative = 0;
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
      if (!Object.keys(PLATFORMS).some((platform) => appliesOn(r, platform))) continue;
      const keys = (r.keys as string[]).length;
      if (!expectList(r).includes('manual')) nTests += keys;
      else if (r.native === true) nNative += keys;
      else nManual += keys;
    }
  }
  const out = relative(paths.ROOT, paths.OUT);
  process.stdout.write(
    `✔ keyboard gate: ${nSpecs} spec(s), ${nTests} auto-tested rule(s) per platform, ${nManual} manual${nNative > 0 ? `, ${nNative} native` : ''}, ` +
      `${nData} rule set(s) for the swiftui gate → ${out}/\n`,
  );
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
