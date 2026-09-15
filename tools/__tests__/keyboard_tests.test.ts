/** tools/keyboard_tests.ts — Playwright specs derived from a component's `keyboard` block
 *  (port of tests/test_keyboard_tests.py). */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as kt from '../keyboard_tests.ts';
import type { Dict } from '../keyboard_tests.ts';
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
    expect(spec).toContain('await expect(page.locator(\'[data-ds="Landmark"]\').first()).toBeVisible();');
    expect(spec).not.toContain('getByRole');
    expect(kt.specData(c).role).toBeNull();
  });

  test('a roleFrom prop with a default locates by that role', () => {
    const props = { role: { type: 'enum', values: ['navigation', 'main'], default: 'navigation', description: 'Which landmark.' } };
    expect(kt.rootLocator({ ...DIALOG, props, a11y: { roleFrom: 'role', requires: [] } })).toBe("page.getByRole('navigation').first()");
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
    ['focus-unchanged', 'toBe(before)'],
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
    expect(s).toContain("await expect(page.getByRole('dialog').first()).toBeVisible();");
    expect(s).toContain("const root = page.getByRole('dialog').first();");
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
