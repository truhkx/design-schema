/**
 * tools/lib/tokens.ts — the DTCG resolver (theme × mode) every TypeScript tool reads tokens through.
 * Port of tests/test_tokens.py.
 *
 * The camelCase *contract* is written by tokens/build.mjs (step 4 of process/typescript-and-currency.md)
 * into packages/tokens/dist/names.{js,d.ts}; `camelName` here is the function that derives one name, which
 * mcp/server.ts needs for token paths that are not in the contract — the `{slot}` bindings of lookup_code.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import {
  camelName,
  cssName,
  deepMerge,
  flatten,
  loadTheme,
  loadTree,
  modes,
  publicName,
  resolve,
  THEMES_DIR,
  themes,
} from '../lib/tokens.ts';
import type { TokenEntry, Tree } from '../lib/tokens.ts';

/** `{...}` as the resolver sees a flat table, so the tests read like the Python ones. */
const flat = (entries: Record<string, TokenEntry>): Record<string, TokenEntry> => entries;

describe('deepMerge', () => {
  test('later wins at the leaf', () => {
    const a: Tree = { color: { fg: { $value: '#000' } } };
    deepMerge(a, { color: { fg: { $value: '#fff' } } });
    expect((a.color as Tree).fg).toEqual({ $value: '#fff' });
  });

  test('nested branches are merged, not replaced', () => {
    const a: Tree = { color: { fg: { $value: '#000' } } };
    deepMerge(a, { color: { bg: { $value: '#fff' } } });
    expect(Object.keys(a.color as Tree).sort()).toEqual(['bg', 'fg']);
  });

  test('a non-tree replaces a tree', () => {
    const a: Tree = { x: { y: 1 } };
    deepMerge(a, { x: 5 });
    expect(a.x).toBe(5);
  });

  test('returns the mutated target', () => {
    const a: Tree = {};
    expect(deepMerge(a, { k: 1 })).toBe(a);
  });

  test('an array value replaces rather than merges', () => {
    // Python's isinstance(v, dict) is false for a list; isTree() excludes arrays for the same reason.
    const a: Tree = { easing: { $value: [0.2, 0, 0, 1] } };
    deepMerge(a, { easing: { $value: [0, 0, 1, 1] } });
    expect((a.easing as Tree).$value).toEqual([0, 0, 1, 1]);
  });
});

describe('flatten', () => {
  test('paths are dotted and values kept', () => {
    const out = flatten({ color: { $type: 'color', foreground: { default: { $value: '#111' } } } });
    expect(out['color.foreground.default']).toEqual({ $value: '#111', $type: 'color' });
  });

  test('type is inherited from the nearest ancestor', () => {
    const out = flatten({
      space: { $type: 'dimension', sm: { $value: '8px' } },
      font: { $type: 'dimension', weight: { $type: 'fontWeight', bold: { $value: 700 } } },
    });
    expect(out['space.sm']?.$type).toBe('dimension');
    expect(out['font.weight.bold']?.$type).toBe('fontWeight');
  });

  test('untyped tokens get null', () => {
    expect(flatten({ a: { b: { $value: 1 } } })['a.b']?.$type).toBeNull();
  });

  test('reserved keys are not walked into', () => {
    const out = flatten({
      color: { $description: 'note', $extensions: { x: { $value: 'nope' } }, fg: { $value: '#000' } },
    });
    expect(Object.keys(out)).toEqual(['color.fg']);
  });

  test('non-tree branches are skipped', () => {
    expect(flatten({ a: { junk: 'string', b: { $value: 1 } } })).toEqual({ 'a.b': { $value: 1, $type: null } });
  });

  test('a group that has a value stops descending', () => {
    expect(Object.keys(flatten({ a: { $value: '#000', b: { $value: '#fff' } } }))).toEqual(['a']);
  });

  test('an explicit $value of null or false still ends the walk', () => {
    // Python's `"$value" in node` is a key test, not a truth test; Object.hasOwn is the same.
    expect(flatten({ a: { $value: null } })).toEqual({ a: { $value: null, $type: null } });
    expect(flatten({ a: { $value: false } })).toEqual({ a: { $value: false, $type: null } });
  });
});

describe('resolve', () => {
  test('plain values pass through with raw preserved', () => {
    const out = resolve(flat({ 'space.sm': { $value: '8px', $type: 'dimension' } }));
    expect(out['space.sm']).toEqual({ $value: '8px', $type: 'dimension', raw: '8px' });
  });

  test('a reference is followed', () => {
    const out = resolve(flat({ a: { $value: '#111', $type: 'color' }, b: { $value: '{a}', $type: 'color' } }));
    expect(out.b?.$value).toBe('#111');
    expect(out.b?.raw, 'the unresolved reference stays available').toBe('{a}');
  });

  test('reference chains are followed to the end', () => {
    const table: Record<string, TokenEntry> = {};
    for (const [n, v] of [['a', '#111'], ['b', '{a}'], ['c', '{b}'], ['d', '{c}']] as const) {
      table[n] = { $value: v, $type: 'color' };
    }
    expect(resolve(table).d?.$value).toBe('#111');
  });

  test('an unknown reference throws, naming the token and the referrer', () => {
    expect(() => resolve(flat({ a: { $value: '{missing.token}', $type: 'color' } }))).toThrow(
      'Unknown token reference {missing.token} (referenced from a)',
    );
  });

  test('a circular reference throws with the cycle in the message', () => {
    expect(() => resolve(flat({ a: { $value: '{b}', $type: 'color' }, b: { $value: '{a}', $type: 'color' } }))).toThrow(
      /Circular token reference: a -> b -> a/,
    );
  });

  test('a self reference throws', () => {
    expect(() => resolve(flat({ a: { $value: '{a}', $type: 'color' } }))).toThrow(/Circular/);
  });

  test('non-string values are never treated as references', () => {
    const out = resolve(flat({ e: { $value: [0.2, 0, 0, 1], $type: 'cubicBezier' } }));
    expect(out.e?.$value).toEqual([0.2, 0, 0, 1]);
  });

  test('a string that merely contains braces is not a reference', () => {
    const out = resolve(flat({ a: { $value: 'calc({x} + 1)', $type: 'dimension' } }));
    expect(out.a?.$value).toBe('calc({x} + 1)');
  });

  test('the referring token keeps its own $type, not the target one', () => {
    const out = resolve(flat({ a: { $value: '#111', $type: 'color' }, b: { $value: '{a}', $type: null } }));
    expect(out.b).toEqual({ $value: '#111', $type: null, raw: '{a}' });
  });
});

describe('names', () => {
  test.each([
    ['color.foreground.default', 'color.foreground'],
    ['color.background.default', 'color.background'],
    ['color.foreground.muted', 'color.foreground.muted'],
    ['space.default.sm', 'space.default.sm'],
  ])('publicName drops only a trailing default: %s', (path, expected) => {
    expect(publicName(path)).toBe(expected);
  });

  test.each([
    ['color.foreground.default', '--color-foreground'],
    ['color.action.primary.backgroundHover', '--color-action-primary-background-hover'],
    ['font.size.2xl', '--font-size-2xl'],
    ['motion.duration.fast', '--motion-duration-fast'],
  ])('cssName: %s', (path, expected) => {
    expect(cssName(path)).toBe(expected);
  });

  test.each([
    ['color.foreground.default', 'colorForeground'],
    ['color.action.primary.backgroundHover', 'colorActionPrimaryBackgroundHover'],
    ['size.target.min', 'sizeTargetMin'],
    ['font.size.2xl', 'fontSize2xl'],
  ])('camelName: %s', (path, expected) => {
    expect(camelName(path)).toBe(expected);
  });

  test('css and camel names are unique across a real theme', () => {
    const paths = Object.keys(loadTheme('calm-precise', 'light'));
    for (const [label, namer] of [['cssName', cssName], ['camelName', camelName]] as const) {
      const names = paths.map(namer);
      expect(new Set(names).size, `${label} collides`).toBe(names.length);
    }
  });
});

describe('a real theme', () => {
  test('themes and modes are discovered', () => {
    expect(themes()).toContain('calm-precise');
    expect(modes('calm-precise')).toEqual(['light', 'dark']);
  });

  test('an underived theme has no modes', () => {
    expect(modes('no-such-theme')).toEqual([]);
  });

  test('every token resolves in every theme and mode', () => {
    for (const theme of themes()) {
      for (const mode of modes(theme)) {
        const resolved = loadTheme(theme, mode);
        expect(Object.keys(resolved).length, `${theme}/${mode} resolved to nothing`).toBeGreaterThan(0);
        for (const [path, entry] of Object.entries(resolved)) {
          expect(
            typeof entry.$value === 'string' && entry.$value.startsWith('{'),
            `${theme}/${mode} ${path} still holds a reference`,
          ).toBe(false);
        }
      }
    }
  });

  test('light and dark expose the same token names', () => {
    const light = Object.keys(loadTheme('calm-precise', 'light')).sort();
    const dark = Object.keys(loadTheme('calm-precise', 'dark')).sort();
    expect(light).toEqual(dark);
  });

  test('the mode layer overrides the base layer', () => {
    // base.json has no color.foreground; the mode file supplies it.
    const base = flatten(JSON.parse(readFileSync(join(THEMES_DIR, 'calm-precise', 'base.json'), 'utf8')) as Tree);
    expect(base['color.foreground.default']).toBeUndefined();
    expect(loadTheme('calm-precise', 'light')['color.foreground.default']).toBeDefined();
  });

  test('loadTree merges base under the mode file', () => {
    const tree = loadTree('calm-precise', 'dark');
    const both = flatten(tree);
    expect(both['color.palette.neutral.0'], 'base layer').toBeDefined();
    expect(both['color.foreground.default'], 'mode layer').toBeDefined();
  });

  test('loadTree throws ENOENT for a theme that was never derived', () => {
    expect(() => loadTree('no-such-theme', 'light')).toThrow(/ENOENT/);
  });
});
