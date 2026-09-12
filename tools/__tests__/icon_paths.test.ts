/**
 * tools/icon-paths.ts — the shared glyph table and the Swift it generates.
 *
 * The table itself is data the real files must agree on, so this suite checks both: the pure functions
 * against fixtures in a temp folder, and then the repository's own tools/icon-paths.json against the Icon
 * doc and the committed Icon+Paths.swift.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import * as icons from '../icon-paths.ts';
import type { Table } from '../icon-paths.ts';
import { readText } from '../lib/py.ts';
import { useTmp, write } from './fixtures.ts';

const tmp = useTmp();

const savedPaths = { ...icons.paths };
afterEach(() => {
  Object.assign(icons.paths, savedPaths);
});

const TABLE: Table = {
  grid: 16,
  strokeWidth: 2,
  strokeWidthToken: 'border.width.focus',
  glyphs: {
    check: { d: 'M3 8.5l3.5 3.5L13 5', filled: false },
    info: { d: 'M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1z', filled: true, note: 'circle-i' },
  },
};

/** A doc whose `name` enum is `names`, in a temp folder icons.paths points at. */
function useDoc(names: string[]): void {
  icons.paths.DOC = write(
    join(tmp(), 'icon.md'),
    ['---', 'component:', '  props:', '    name:', '      type: enum', `      values: [${names.join(', ')}]`, '---', ''].join('\n'),
  );
}

describe('the doc enum', () => {
  test('is read in document order', () => {
    useDoc(['check', 'dash', 'chevron-right']);
    expect(icons.docNames()).toEqual(['check', 'dash', 'chevron-right']);
  });

  test('a doc with no enum is an error, not an empty table', () => {
    icons.paths.DOC = write(join(tmp(), 'icon.md'), '---\ncomponent:\n  name: Icon\n---\n');
    expect(() => icons.docNames()).toThrow(/values/);
  });
});

describe('validate', () => {
  test('accepts a table that is the doc enum', () => {
    expect(() => icons.validate(TABLE, ['check', 'info'])).not.toThrow();
  });

  test('rejects a glyph the doc does not name', () => {
    expect(() => icons.validate(TABLE, ['check'])).toThrow(/unknown info/);
  });

  test('rejects a name with no glyph', () => {
    expect(() => icons.validate(TABLE, ['check', 'info', 'menu'])).toThrow(/missing menu/);
  });

  test('rejects the same names in a different order', () => {
    expect(() => icons.validate(TABLE, ['info', 'check'])).toThrow(/different order/);
  });

  test('rejects a command Support/SVGPath.swift cannot parse', () => {
    const table: Table = { ...TABLE, glyphs: { check: { d: 'M3 3S6 6 9 9', filled: false } } };
    expect(() => icons.validate(table, ['check'])).toThrow(/"S" is not one of/);
  });

  test('allows an exponent in a coordinate', () => {
    const table: Table = { ...TABLE, glyphs: { check: { d: 'M3 3l1e1 0', filled: false } } };
    expect(() => icons.validate(table, ['check'])).not.toThrow();
  });

  test('rejects empty path data', () => {
    const table: Table = { ...TABLE, glyphs: { check: { d: '  ', filled: false } } };
    expect(() => icons.validate(table, ['check'])).toThrow(/empty path data/);
  });
});

describe('the emitted Swift', () => {
  const swift = icons.swift(TABLE, ['check', 'info']);

  test('maps every name to a (path, filled) tuple', () => {
    expect(swift).toContain('public static let table: [String: (path: String, filled: Bool)] = [');
    expect(swift).toContain('(path: "M3 8.5l3.5 3.5L13 5", filled: false),');
    expect(swift).toContain('filled: true), // circle-i');
  });

  test('keeps the doc order in `names`', () => {
    const names = /public static let names: \[String\] = \[([^\]]*)\]/.exec(swift)?.[1] as string;
    expect(names.match(/"[^"]+"/g)).toEqual(['"check"', '"info"']);
  });

  test('says it is generated', () => {
    expect(swift.split('\n')[2]).toContain('GENERATED');
  });
});

describe('the repository table', () => {
  const table = icons.readTable();
  const names = icons.docNames();

  test('is the Icon doc\'s name enum', () => {
    expect(() => icons.validate(table, names)).not.toThrow();
    expect(names.length).toBeGreaterThan(0);
  });

  test('committed Icon+Paths.swift is what the table generates', () => {
    expect(readText(icons.paths.SWIFT)).toBe(icons.swift(table, names));
  });

  test('every glyph has a reference PNG and an index entry', () => {
    const dir = join(icons.paths.ROOT, 'tests', 'icon-snapshots');
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) as {
      glyphs: { name: string; file: string; filled: boolean; d: string }[];
    };
    expect(index.glyphs.map((g) => g.name)).toEqual(names);
    for (const glyph of index.glyphs) {
      expect(glyph.d).toBe(table.glyphs[glyph.name]?.d);
      expect(glyph.filled).toBe(table.glyphs[glyph.name]?.filled);
      expect(readFileSync(join(dir, glyph.file)).subarray(1, 4).toString()).toBe('PNG');
    }
  });
});
