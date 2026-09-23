/** tools/keyboard_tests.ts — Playwright specs derived from a component's `keyboard` block
 *  (port of tests/test_keyboard_tests.py). */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as kt from '../keyboard_tests.ts';
import type { Dict } from '../keyboard_tests.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const DIALOG: Dict = {
  name: 'Dialog',
  a11y: { role: 'dialog', requires: ['keyboard-operable', 'escape-dismiss'] },
  platforms: { web: { element: 'dialog' }, lit: { tag: 'ds-dialog' }, rn: { element: 'Modal' } },
  keyboard: [
    { keys: ['Escape'], action: 'Requests close.', from: 'inside', expect: 'closes' },
    { keys: ['Tab'], action: 'Moves to the next focusable element.', from: 'first', expect: 'focus-next' },
    { keys: ['Shift+Tab'], action: 'From the first element, wraps to the last.', from: 'first', expect: 'focus-wraps-to-last' },
    { keys: ['Enter', ' '], action: 'Activates the focused button.', expect: 'manual' },
  ],
};

const dialog = (): Dict => structuredClone(DIALOG);

function titlesOf(spec: string): string[] {
  return [...spec.matchAll(/^ {2}test\('(.*?)', async/gm)].map((m) => m[1] as string);
}

function skipsOf(spec: string): string[] {
  return [...spec.matchAll(/^ {2}test\.skip\('(.*?)', async/gm)].map((m) => m[1] as string);
}

const tmp = useTmp();
const std = useStd();

const savedPaths = { ...kt.paths };
afterEach(() => {
  Object.assign(kt.paths, savedPaths);
});

describe('storyId', () => {
  test("follows Storybook's title and export convention", () => {
    expect(kt.storyId('Dialog', 'React')).toBe('dialog-react--keyboard');
    expect(kt.storyId('ActionSheet', 'Lit')).toBe('actionsheet-lit--keyboard');
  });
});

describe('storyUrl', () => {
  test('without given it is the story URL the beforeEach has always used', () => {
    expect(kt.storyUrl('dialog-react--keyboard')).toBe('/iframe.html?id=dialog-react--keyboard&viewMode=story');
    expect(kt.storyUrl('dialog-react--keyboard', {})).toBe('/iframe.html?id=dialog-react--keyboard&viewMode=story');
  });

  test('given becomes Storybook URL args: booleans as !true/!false, numbers as digits, spaces as +', () => {
    expect(kt.storyUrl('tree-react--keyboard', { multiple: true, collapsible: false, level: 2, label: 'Two words', orientation: 'vertical' })).toBe(
      '/iframe.html?id=tree-react--keyboard&viewMode=story&args=multiple:!true;collapsible:!false;level:2;label:Two+words;orientation:vertical',
    );
  });
});

describe('rootLocator', () => {
  test('a role locates by role', () => {
    expect(kt.rootLocator(DIALOG)).toBe("page.getByRole('dialog').first()");
  });

  test.each(['none', 'presentation', 'generic'])('the role %s cannot be queried and falls back to the data attribute', (role) => {
    const c = { ...DIALOG, name: 'Stack', a11y: { role, requires: [] } };
    expect(kt.rootLocator(c)).toBe('page.locator(\'[data-ds="Stack"]\').first()');
  });

  test('Landmark: a roleFrom prop with no default has no role to query, so the spec locates by data-ds', () => {
    const props = { role: { type: 'enum', values: ['navigation', 'main'], required: true, description: 'Which landmark.' } };
    const c = { ...DIALOG, name: 'Landmark', props, a11y: { roleFrom: 'role', requires: [] } };
    const spec = kt.specFor(c, 'web');
    expect(spec).toContain('await expect(page.locator(\'[data-ds="Landmark"]\').first()).toBeVisible({ timeout: 15_000 });');
    expect(spec).not.toContain('getByRole');
    expect(kt.specData(c).role).toBeNull();
  });

  test('a roleFrom prop with a default locates by that role', () => {
    const props = { role: { type: 'enum', values: ['navigation', 'main'], default: 'navigation', description: 'Which landmark.' } };
    expect(kt.rootLocator({ ...DIALOG, props, a11y: { roleFrom: 'role', requires: [] } })).toBe("page.getByRole('navigation').first()");
  });

  test("a platform's own role is queried on that platform", () => {
    const c = { ...DIALOG, platforms: { ...(DIALOG.platforms as Dict), lit: { tag: 'ds-dialog', role: 'alertdialog' } } };
    expect(kt.rootLocator(c, null, 'lit')).toBe("page.getByRole('alertdialog').first()");
    expect(kt.rootLocator(c, null, 'web')).toBe("page.getByRole('dialog').first()");
  });
});

describe('playwrightKey', () => {
  test.each([
    [' ', 'Space'],
    ['Space', 'Space'],
    ['Shift+Space', 'Shift+Space'],
    ['Shift+Tab', 'Shift+Tab'],
    ['Control+a', 'Control+a'],
    ['Control+Home', 'Control+Home'],
    ['ArrowDown', 'ArrowDown'],
  ])('%j is pressed as %s', (chord, pressed) => {
    expect(kt.playwrightKey(chord)).toBe(pressed);
  });
});

describe('blocks', () => {
  test.each([
    ['trigger', 'await trigger(page).focus();'],
    ['first', 'await focusAt(page, root, 0);'],
    ['last', 'await focusAt(page, root, await focusableCount(page, root) - 1);'],
    ['inside', 'await focusAt(page, root, 1);'],
    ['any', ''],
  ])('every `from` value has setup code: %s', (frm, code) => {
    expect(kt.fromBlock(frm)).toBe(code);
  });

  test.each([
    ['closes', 'toBeHidden()'],
    ['opens', 'toBeVisible()'],
    ['focus-next', 'toBe(before + 1)'],
    ['focus-prev', 'toBe(before - 1)'],
    ['focus-first', 'toBe(0)'],
    ['focus-last', 'focusableCount(page, root) - 1'],
    ['focus-wraps-to-first', 'toBe(0)'],
    ['focus-wraps-to-last', 'focusableCount(page, root) - 1'],
    ['focus-trigger', 'trigger(page)).toBeFocused()'],
    ['focus-unchanged', 'expect(await focusHeld(page)).toBe(true)'],
    ['toggles', 'not.toBe(stateBefore)'],
    ['selects', 'toMatch(/true/)'],
  ])('every machine-checkable `expect` has an assertion: %s', (exp, fragment) => {
    expect(kt.expectBlock(exp)).toContain(fragment);
  });

  test('manual has no assertion block', () => {
    expect(() => kt.expectBlock('manual')).toThrow('KeyError');
  });
});

describe('specFor', () => {
  const spec = (): string => kt.specFor(DIALOG, 'web');

  test('one test per key with the action as its title', () => {
    expect(titlesOf(spec())).toEqual([
      'Escape: Requests close.',
      'Tab: Moves to the next focusable element.',
      'Shift+Tab: From the first element, wraps to the last.',
    ]);
  });

  test('manual rules become skips, one per key', () => {
    expect(skipsOf(spec())).toEqual([
      'Enter: Activates the focused button. — manual',
      ' : Activates the focused button. — manual',
    ]);
  });

  test('each test carries its `from` and `expect` code', () => {
    const s = spec();
    const escape = s.slice(s.indexOf("test('Escape"), s.indexOf("test('Tab"));
    expect(escape).toContain(kt.fromBlock('inside'));
    expect(escape).toContain("await page.keyboard.press('Escape');");
    expect(escape).toContain(kt.expectBlock('closes'));
    const wrap = s.slice(s.indexOf("test('Shift+Tab"), s.indexOf('test.skip'));
    expect(wrap).toContain(kt.fromBlock('first'));
    expect(wrap).toContain("press('Shift+Tab')");
    expect(wrap).toContain(kt.expectBlock('focus-wraps-to-last'));
  });

  test('the root locator and story are wired into beforeEach', () => {
    const s = spec();
    expect(s).toContain("page.goto('/iframe.html?id=dialog-react--keyboard&viewMode=story')");
    // The precondition waits longer than the default: it only asks whether the Vite dev server has
    // compiled and rendered the story yet, which a full-suite run can push past 5s. The behavior
    // assertions below (`opens`, `closes`) keep the default timeout.
    expect(s).toContain("await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 15_000 });");
    expect(s).toContain("const root = await subject(page, page.getByRole('dialog').first());");
  });

  test('the subject is pinned once per test, not re-resolved by .first() after a dismissal', () => {
    const s = spec();
    expect(s).toContain("await root.evaluate((el) => el.setAttribute('data-ds-keyboard-subject', ''));");
    expect(s).not.toMatch(/const root = page\./);
  });

  test('focus-unchanged pins the focused element before the press and fails when nothing holds focus', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Escape'], action: 'Hides without moving focus.', from: 'any', expect: ['closes', 'focus-unchanged'] }];
    const s = kt.specFor(c, 'web');
    const body = s.slice(s.indexOf("test('Escape"));
    expect(body.indexOf('const held = await holdFocus(page);')).toBeGreaterThan(-1);
    expect(body.indexOf('const held = await holdFocus(page);')).toBeLessThan(body.indexOf("press('Escape')"));
    expect(body).toContain("expect(held, 'nothing to hold focus').toBe(true);");
    expect(spec()).not.toContain('holdFocus(page);\n');
  });

  test('FOCUSABLE counts tab stops and composite items, not tabindex=-1, hidden or display:none controls', () => {
    const s = spec();
    for (const clause of [
      "'input:not([disabled]):not([type=\"hidden\"])'",
      "s + ':not([hidden])'",
      "s + ':not([tabindex=\"-1\"])'",
      '\'[role="treeitem"]:not([aria-disabled="true"])\'',
      '\'[role="tab"]\'',
      '\'[role="gridcell"][tabindex]\'',
      '\'[role="row"][tabindex]\'',
      'n.checkVisibility()',
      "role === 'toolbar'",
    ]) expect(s).toContain(clause);
  });

  test('lit uses its own story suffix', () => {
    expect(kt.specFor(DIALOG, 'lit')).toContain('id=dialog-lit--keyboard');
  });

  test("space is translated to Playwright's key name", () => {
    const c = dialog();
    c.keyboard = [{ keys: [' '], action: 'Toggles.', expect: 'toggles' }];
    expect(kt.specFor(c, 'web')).toContain("press('Space')");
  });

  test('a letter range becomes a typeahead press', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['a-z'], action: 'Moves to the next item starting with the letter.', expect: 'focus-next' }];
    const s = kt.specFor(c, 'web');
    expect(titlesOf(s)).toEqual(['typeahead letter: Moves to the next item starting with the letter.']);
    expect(s).toContain("press('a')");
  });

  test('`when` is appended to the title', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['ArrowDown'], action: 'Opens the menu.', when: 'focus on trigger', from: 'trigger', expect: 'opens' }];
    const s = kt.specFor(c, 'web');
    expect(titlesOf(s)).toEqual(['ArrowDown: Opens the menu. (focus on trigger)']);
    expect(s).toContain(kt.fromBlock('trigger'));
  });

  test('a missing `expect` is manual by default', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Home'], action: 'Moves to the first item.' }];
    const s = kt.specFor(c, 'web');
    expect(titlesOf(s)).toEqual([]);
    expect(skipsOf(s)).toEqual(['Home: Moves to the first item. — manual']);
  });

  test('apostrophes in actions are escaped', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Escape'], action: "Doesn't close when not dismissible.", expect: 'closes' }];
    expect(kt.specFor(c, 'web')).toContain("test('Escape: Doesn\\'t close when not dismissible.'");
  });

  test('a rule scoped by platforms is emitted only on those platforms', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['F6'], action: 'Moves between panes.', expect: 'focus-next', platforms: ['web'] }];
    expect(titlesOf(kt.specFor(c, 'web'))).toEqual(['F6: Moves between panes.']);
    expect(titlesOf(kt.specFor(c, 'lit'))).toEqual([]);
    expect(skipsOf(kt.specFor(c, 'lit'))).toEqual([]);
  });

  test('given navigates to the story with those args before the rule runs; beforeEach keeps the plain URL', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Control+a'], action: 'Selects all.', expect: 'selects', given: { multiple: true } }];
    const s = kt.specFor(c, 'web');
    const body = s.slice(s.indexOf("test('Control+a"));
    expect(s).toContain("test.beforeEach(async ({ page }) => {\n    await page.goto('/iframe.html?id=dialog-react--keyboard&viewMode=story');");
    expect(body).toContain("await page.goto('/iframe.html?id=dialog-react--keyboard&viewMode=story&args=multiple:!true');");
    expect(body.indexOf('page.goto')).toBeLessThan(body.indexOf("press('Control+a')"));
  });

  test('target asserts closes and opens on the data-part, not the root', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Escape'], action: 'Closes the list.', expect: 'closes', target: 'listbox' }];
    const s = kt.specFor(c, 'web');
    expect(s).toContain('await expect(page.locator(\'[data-part="listbox"]\').first()).toBeHidden();');
    expect(s).not.toContain('await expect(root).toBeHidden();');
    expect(kt.expectBlock('opens', 1, 'listbox')).toBe('await expect(page.locator(\'[data-part="listbox"]\').first()).toBeVisible();');
  });

  test('repeat presses the chord N times and focus-next / focus-prev expect a move of N', () => {
    const c = dialog();
    c.keyboard = [
      { keys: ['ArrowDown'], action: 'Moves down.', expect: 'focus-next', repeat: 3 },
      { keys: ['ArrowUp'], action: 'Moves up.', expect: 'focus-prev', repeat: 2 },
    ];
    const s = kt.specFor(c, 'web');
    expect(s).toContain("    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');");
    expect(s).toContain('expect(await focusIndex(page, root)).toBe(before + 3);');
    expect(s).toContain("    for (let i = 0; i < 2; i++) await page.keyboard.press('ArrowUp');");
    expect(s).toContain('expect(await focusIndex(page, root)).toBe(before - 2);');
  });

  test('an expect list emits one assertion per outcome, in order', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Escape'], action: 'Closes and returns focus.', expect: ['closes', 'focus-trigger'] }];
    const s = kt.specFor(c, 'web');
    const closes = s.indexOf(kt.expectBlock('closes'));
    expect(closes).toBeGreaterThan(s.indexOf("press('Escape')"));
    expect(s.indexOf(kt.expectBlock('focus-trigger'))).toBeGreaterThan(closes);
  });

  test('a manual native rule is skipped as native; a native rule with an expect is still asserted', () => {
    const c = dialog();
    c.keyboard = [
      { keys: ['Enter'], action: 'Activates the focused control.', native: true },
      { keys: ['Home'], action: 'Moves the caret to the start.', native: true, expect: 'focus-unchanged' },
    ];
    const s = kt.specFor(c, 'web');
    expect(skipsOf(s)).toEqual(['Enter: Activates the focused control. — native']);
    expect(titlesOf(s)).toEqual(['Home: Moves the caret to the start.']);
  });

  test('the helpers and imports are present once', () => {
    const s = spec();
    expect(s.split("import { test, expect, type Page, type Locator } from '@playwright/test';")).toHaveLength(2);
    expect(s.split('async function focusIndex(')).toHaveLength(2);
    expect(s.startsWith('// Generated by tools/keyboard_tests.ts')).toBe(true);
  });
});

describe('specData', () => {
  test('the block as data, with the defaults the Swift side should not have to know', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Home'], action: 'Moves to the first item.' }];
    expect(kt.specData(c)).toEqual({
      name: 'Dialog',
      role: 'dialog',
      identifier: 'Dialog',
      rules: [{ keys: ['Home'], action: 'Moves to the first item.', from: 'inside', expect: 'manual' }],
    });
  });

  test('`when` is carried through, and absent when the doc omits it', () => {
    const rules = kt.specData(DIALOG).rules;
    expect(rules.map((r) => r.expect)).toEqual(['closes', 'focus-next', 'focus-wraps-to-last', 'manual']);
    expect(rules.every((r) => !('when' in r))).toBe(true);
    const c = dialog();
    c.keyboard = [{ keys: ['ArrowDown'], action: 'Opens.', when: 'focus on trigger', from: 'trigger', expect: 'opens' }];
    expect(kt.specData(c).rules[0]?.when).toBe('focus on trigger');
  });

  test('expect stays a string, the first outcome, and a list is also written as expectAll', () => {
    const c = dialog();
    c.keyboard = [{ keys: ['Escape'], action: 'Closes and returns focus.', expect: ['closes', 'focus-trigger'] }];
    expect(kt.specData(c).rules).toEqual([
      { keys: ['Escape'], action: 'Closes and returns focus.', from: 'inside', expect: 'closes', expectAll: ['closes', 'focus-trigger'] },
    ]);
  });

  test('rules scoped away from swiftui are dropped, and given, target or repeat make a rule manual there', () => {
    const c = dialog();
    c.keyboard = [
      { keys: ['F6'], action: 'Moves between panes.', expect: 'focus-next', platforms: ['web', 'lit'] },
      { keys: ['Escape'], action: 'Closes the list.', expect: 'closes', target: 'listbox', platforms: ['swiftui'] },
      { keys: ['Control+a'], action: 'Selects all.', expect: 'selects', given: { multiple: true } },
      { keys: ['ArrowDown'], action: 'Moves down.', expect: 'focus-next', repeat: 3, native: false },
    ];
    expect(kt.specData(c).rules).toEqual([
      { keys: ['Escape'], action: 'Closes the list.', from: 'inside', expect: 'manual', target: 'listbox', platforms: ['swiftui'] },
      { keys: ['Control+a'], action: 'Selects all.', from: 'inside', expect: 'manual', given: { multiple: true } },
      { keys: ['ArrowDown'], action: 'Moves down.', from: 'inside', expect: 'manual', repeat: 3, native: false },
    ]);
  });

  test('the identifier is the component root`s testability hook, not its role', () => {
    const c = { ...DIALOG, name: 'Stack', a11y: { role: 'none', requires: [] } };
    expect(kt.specData(c).identifier).toBe('Stack');
    expect(kt.specData(c).role).toBe('none');
  });
});

describe('main', () => {
  let generated = '';
  let out = '';

  /** The Python tests' `sandbox` fixture: point the tool at tmp_path and write a components.json. */
  function writeComponents(components: Dict[]): void {
    write(join(generated, 'components.json'), JSON.stringify(components.map((c) => ({ component: c }))));
  }

  function specs(): string[] {
    return readdirSync(out).filter((n) => n.endsWith('.spec.ts')).sort();
  }

  beforeEach(() => {
    generated = join(tmp(), 'generated');
    out = join(generated, 'keyboard');
    mkdirSync(generated, { recursive: true });
    Object.assign(kt.paths, { ROOT: tmp(), GENERATED: generated, OUT: out });
  });

  test('writes one spec per supported browser platform', () => {
    writeComponents([DIALOG]);
    expect(kt.main()).toBe(0);
    expect(specs()).toEqual(['Dialog.lit.spec.ts', 'Dialog.web.spec.ts']); // React Native never gets a keyboard spec
  });

  test('counts auto and manual rules per key', () => {
    writeComponents([DIALOG]);
    kt.main();
    expect(std.out()).toContain('2 spec(s), 3 auto-tested rule(s) per platform, 2 manual');
  });

  test('native manual rules are counted apart, and the count only appears when there are some', () => {
    const c = dialog();
    c.keyboard = [...DIALOG.keyboard, { keys: ['Home', 'End'], action: 'Moves the caret.', native: true }];
    writeComponents([c]);
    kt.main();
    expect(std.out()).toContain('3 auto-tested rule(s) per platform, 2 manual, 2 native, 1 rule set(s)');
  });

  test('components without a keyboard block are skipped', () => {
    writeComponents([{ ...DIALOG, name: 'Text', keyboard: [] }]);
    kt.main();
    expect(specs()).toEqual([]);
  });

  test('an unsupported or undeclared platform gets no spec', () => {
    const c = dialog();
    c.platforms = { web: { element: 'dialog' }, lit: { supported: false, notes: 'later' } };
    writeComponents([c]);
    kt.main();
    expect(specs()).toEqual(['Dialog.web.spec.ts']);
  });

  test('stale specs are removed on every run', () => {
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'Gone.web.spec.ts'), '// old', 'utf8');
    writeFileSync(join(out, 'Gone.json'), '{}', 'utf8');
    writeComponents([DIALOG]);
    kt.main();
    expect(readdirSync(out)).not.toContain('Gone.web.spec.ts');
    expect(readdirSync(out)).not.toContain('Gone.json');
  });

  // The swiftui gate's XCUITest cannot read a Markdown doc on a macOS runner, and that job never runs
  // `pnpm install` — the rules reach it as this file (tools/swiftui_gate.ts ships it with the branch).
  test('the rules are written out as data beside the specs', () => {
    writeComponents([DIALOG]);
    kt.main();
    expect(readdirSync(out).filter((n) => n.endsWith('.json'))).toEqual(['Dialog.json']);
    expect(JSON.parse(readFileSync(join(out, 'Dialog.json'), 'utf8'))).toEqual(kt.specData(DIALOG));
    expect(std.out()).toContain('1 rule set(s) for the swiftui gate');
  });

  test('the data is written even where no browser platform wants a spec', () => {
    const c = dialog();
    c.platforms = { rn: { element: 'Modal' }, swiftui: {} };
    writeComponents([c]);
    kt.main();
    expect(specs()).toEqual([]);
    expect(readdirSync(out)).toEqual(['Dialog.json']);
  });
});

/** The phase 3 doc migration is the first user of `given`, `target`, an `expect` array and `native`. One case per
 *  field over the real doc that now carries it, so the spec text a migrated rule generates is pinned. */
describe('the migrated docs', () => {
  const corpus = JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as { component: Dict }[];
  const doc = (name: string): Dict => {
    const found = corpus.find((entry) => entry.component.name === name);
    if (found === undefined) throw new Error(`no ${name} in generated/components.json`);
    return found.component;
  };
  /** One `test(...)` block of a generated spec, by the start of its title. */
  const testFor = (spec: string, title: string): string => {
    const at = spec.indexOf(`test('${title}`);
    expect(at, title).toBeGreaterThan(-1);
    return spec.slice(at, spec.indexOf('\n  });', at));
  };

  test('the vertical arrow rules of tabs.md render the story with given as Storybook args', () => {
    const block = testFor(kt.specFor(doc('Tabs'), 'web'), 'ArrowDown: Moves to the next tab, wrapping; selects it under automatic activation. (vertical)');
    expect(block).toContain("await page.goto('/iframe.html?id=tabs-react--keyboard&viewMode=story&args=orientation:vertical');");
    expect(block).toContain(kt.expectBlock('focus-next'));
  });

  test("the Escape rule of select.md asserts both outcomes, in the doc's order, on the popup part", () => {
    const block = testFor(kt.specFor(doc('Select'), 'web'), 'Escape: Closes the popup without changing the value and returns focus to the trigger. (popup open)');
    expect(block).toContain(`await expect(${kt.partLocator('popup')}).toBeHidden();`);
    expect(block).toContain(kt.expectBlock('focus-trigger'));
    expect(block.indexOf('toBeHidden')).toBeLessThan(block.indexOf('toBeFocused'));
    // The root it no longer asserts on: Select resolves to `combobox`, the trigger, which stays visible.
    expect(block).not.toContain(`await expect(${kt.rootLocator(doc('Select'))}).toBeHidden();`);
  });

  test('the Escape and Tab rules of combobox.md both close the same part', () => {
    const s = kt.specFor(doc('Combobox'), 'lit');
    for (const title of ['Escape: Closes the list if open', 'Tab: Closes the list and moves focus on']) {
      expect(testFor(s, title)).toContain(`await expect(${kt.partLocator('popup')}).toBeHidden();`);
    }
  });

  test('the Enter rule of toolbar.md is skipped as native, not as manual', () => {
    const s = kt.specFor(doc('Toolbar'), 'web');
    expect(s).toContain("test.skip('Enter: Activates the focused control (its own behavior). — native', async () => {});");
    expect(s).not.toContain('Activates the focused control (its own behavior). — manual');
  });

  test('specData writes a rule with given or target as manual for the XCUITest, and keeps an expect list in expectAll', () => {
    const escape = kt.specData(doc('Select')).rules.find((r) => r.keys[0] === 'Escape');
    expect(escape).toMatchObject({ expect: 'manual', expectAll: ['closes', 'focus-trigger'], target: 'popup' });
    const vertical = kt.specData(doc('Tabs')).rules.filter((r) => r.when === 'vertical');
    expect(vertical.map((r) => r.expect)).toEqual(['manual', 'manual']);
    expect(vertical.map((r) => r.given)).toEqual([{ orientation: 'vertical' }, { orientation: 'vertical' }]);
    // splitter.md scopes F6 away from the native platforms, so the swiftui gate never sees it.
    expect(kt.specData(doc('Splitter')).rules.map((r) => r.keys[0])).not.toContain('F6');
  });
});
