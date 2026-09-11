/** tools/lib/pyyaml.ts — the dumper must write what PyYAML's `safe_dump(sort_keys=False)` wrote, because the
 *  generation lock hashes the prompts that embed it; the loader must read a doc the way `safe_load` did. */
import { describe, expect, test } from 'vitest';

import { dump, load, plainIsString, pyFloatRepr } from '../lib/pyyaml.ts';

describe('dump', () => {
  test('block mappings and indentless sequences', () => {
    expect(dump({ a: 1, b: 'x', l: ['a', 'b'], m: { k: 'v' } })).toBe('a: 1\nb: x\nl:\n- a\n- b\nm:\n  k: v\n');
  });

  test('a top-level list of mappings', () => {
    expect(dump([{ name: 'renders', then: [{ renders: true }], derived: true }])).toBe('- name: renders\n  then:\n  - renders: true\n  derived: true\n');
  });

  test('empty collections use flow style', () => {
    expect(dump({ e: [], m: {} })).toBe('e: []\nm: {}\n');
    expect(dump({})).toBe('{}\n');
  });

  test('strings a reader would take for something else are quoted', () => {
    expect(dump({ s: 'true' })).toBe("s: 'true'\n");
    expect(dump({ s: 'yes' })).toBe("s: 'yes'\n");
    expect(dump({ s: '1' })).toBe("s: '1'\n");
    expect(dump({ s: '1.5' })).toBe("s: '1.5'\n");
    expect(dump({ s: '' })).toBe("s: ''\n");
    expect(dump({ s: 'null' })).toBe("s: 'null'\n");
    expect(dump({ s: '~' })).toBe("s: '~'\n");
    expect(dump({ s: '2026-09-10' })).toBe("s: '2026-09-10'\n");
    expect(dump({ s: '1e3' })).toBe('s: 1e3\n');
    expect(dump({ '1': 'x', on: 'y' })).toBe("'1': x\n'on': y\n");
  });

  test('indicators force quotes; an apostrophe inside a word does not', () => {
    expect(dump({ s: 'a: b' })).toBe("s: 'a: b'\n");
    expect(dump({ s: '#x' })).toBe("s: '#x'\n");
    expect(dump({ s: '- x' })).toBe("s: '- x'\n");
    expect(dump({ s: '{ a }' })).toBe("s: '{ a }'\n");
    expect(dump({ s: "it's" })).toBe("s: it's\n");
    expect(dump({ s: "'q'" })).toBe("s: '''q'''\n");
    expect(dump({ s: '`submit` submits the form.' })).toBe("s: '`submit` submits the form.'\n");
    expect(dump({ s: 'a, b' })).toBe('s: a, b\n');
    expect(dump({ s: 'color.action.{variant}.background' })).toBe("s: color.action.{variant}.background\n");
  });

  test('line breaks and tabs', () => {
    expect(dump({ s: 'line1\nline2' })).toBe("s: 'line1\n\n  line2'\n");
    expect(dump({ s: 'a\tb' })).toBe('s: "a\\tb"\n');
    expect(dump({ s: 'trailing ' })).toBe("s: 'trailing '\n");
  });

  test('unicode is written raw with allow_unicode and escaped without', () => {
    expect(dump({ s: 'a — b' }, true)).toBe('s: a — b\n');
    expect(dump({ s: 'a — b' }, false)).toBe('s: "a \\u2014 b"\n');
    expect(dump({ s: 'Delete account…' }, true)).toBe('s: Delete account…\n');
  });

  test('long plain scalars fold at the space after the word that passes column 80', () => {
    const notes = 'Use aria-disabled rather than the disabled attribute so the button remains discoverable by keyboard and screen readers.';
    expect(dump({ notes })).toBe('notes: Use aria-disabled rather than the disabled attribute so the button remains\n  discoverable by keyboard and screen readers.\n');
    // Deeper indentation moves the fold: at indent 6 the same sentence breaks after "which" (column 82), at indent 2 after "is".
    const description = 'What kind of message this is. Sets the colors and the icon, which is why it is here.';
    expect(dump({ p: { description } })).toBe('p:\n  description: What kind of message this is. Sets the colors and the icon, which is\n    why it is here.\n');
    expect(dump({ p: { q: { r: { description } } } })).toBe('p:\n  q:\n    r:\n      description: What kind of message this is. Sets the colors and the icon, which\n        is why it is here.\n');
  });

  test('long quoted scalars fold too', () => {
    const s = "`submit` submits the enclosing Form and everything else is a plain `button` that does nothing on its own.";
    expect(dump({ s })).toBe("s: '`submit` submits the enclosing Form and everything else is a plain `button` that\n  does nothing on its own.'\n");
  });

  test('a list or object that appears twice gets an anchor and aliases', () => {
    const platforms = ['web', 'lit'];
    expect(dump([{ a: platforms }, { b: platforms }, { c: platforms }])).toBe('- a: &id001\n  - web\n  - lit\n- b: *id001\n- c: *id001\n');
    const p1 = ['web'];
    const p2 = ['lit'];
    expect(dump([{ a: p1 }, { b: p2 }, { c: p2 }, { d: p1 }])).toBe('- a: &id002\n  - web\n- b: &id001\n  - lit\n- c: *id001\n- d: *id002\n');
  });

  test('equal but distinct objects are not aliased', () => {
    expect(dump([{ a: ['web'] }, { b: ['web'] }])).toBe('- a:\n  - web\n- b:\n  - web\n');
  });

  test('numbers, booleans and null', () => {
    expect(dump({ i: 16, f: 0.25, r: 1.2, t: true, n: null })).toBe('i: 16\nf: 0.25\nr: 1.2\nt: true\nn: null\n');
    expect(dump({ f: 0.00001 })).toBe('f: 1.0e-05\n');
    expect(dump({ f: -3.5 })).toBe('f: -3.5\n');
    // Known limit: a JavaScript number carries no int/float flag, so a whole-number float (`2.0`, `1e20`) is
    // written as an integer. No doc has one; the byte-for-byte comparison with the Python output covers the rest.
    expect(dump({ f: 2 })).toBe('f: 2\n');
  });

  test('a string as the whole document is open-ended', () => {
    expect(dump('abc')).toBe('abc\n...\n');
  });
});

describe('pyFloatRepr', () => {
  test('matches repr(float)', () => {
    expect(pyFloatRepr(0.25)).toBe('0.25');
    expect(pyFloatRepr(1)).toBe('1.0');
    expect(pyFloatRepr(100)).toBe('100.0');
    expect(pyFloatRepr(1e16)).toBe('1e+16');
    expect(pyFloatRepr(1234567890123456)).toBe('1234567890123456.0');
    expect(pyFloatRepr(0.0001)).toBe('0.0001');
    expect(pyFloatRepr(0.00001)).toBe('1e-05');
    expect(pyFloatRepr(1.5e-7)).toBe('1.5e-07');
    expect(pyFloatRepr(-2.5)).toBe('-2.5');
  });
});

describe('load', () => {
  test('YAML 1.1 scalars resolve as PyYAML resolves them', () => {
    expect(load('a: yes\nb: no\nc: on\nd: off\ne: true\nf: False')).toEqual({ a: true, b: false, c: true, d: false, e: true, f: false });
    expect(load('a: 1_000\nb: 017\nc: 0x1f\nd: 0b101\ne: -3\nf: 1:30')).toEqual({ a: 1000, b: 15, c: 31, d: 5, e: -3, f: 90 });
    expect(load('a: 1.5\nb: .5\nc: 1.0e+3\nd: .inf\ne: -.inf')).toEqual({ a: 1.5, b: 0.5, c: 1000, d: Infinity, e: -Infinity });
    expect(load('a: 1e3\nb: 0o17\nc: y\nd: n\ne: 2026-09-10')).toEqual({ a: '1e3', b: '0o17', c: 'y', d: 'n', e: '2026-09-10' });
    expect(load('a: ~\nb: null\nc:\nd: Null')).toEqual({ a: null, b: null, c: null, d: null });
  });

  test('flow collections, quotes and block scalars', () => {
    expect(load("a: [x, 'y', \"z\"]\nb: { k: v, n: 1 }\nc: |\n  line\n  two\nd: >-\n  folded\n  text\n")).toEqual({ a: ['x', 'y', 'z'], b: { k: 'v', n: 1 }, c: 'line\ntwo\n', d: 'folded text' });
  });

  test('an empty document is null', () => {
    expect(load('')).toBeNull();
    expect(load('# only a comment\n')).toBeNull();
  });

  test('a later duplicate key wins', () => {
    expect(load('a: 1\na: 2')).toEqual({ a: 2 });
  });

  test('bad YAML throws', () => {
    expect(() => load('a: [1, 2')).toThrow();
  });

  test('dump then load round-trips a component-shaped value', () => {
    const value = { name: 'Widget', props: { label: { type: 'string', required: true, description: "It's the label: yes." } }, values: ['1', 'on', ''], n: null, f: 0.25 };
    expect(load(dump(value, true))).toEqual(value);
    expect(load(dump(value, false))).toEqual(value);
  });
});

describe('plainIsString', () => {
  test('reports what a plain scalar would resolve to', () => {
    expect(plainIsString('hello')).toBe(true);
    expect(plainIsString('true')).toBe(false);
    expect(plainIsString('12')).toBe(false);
    expect(plainIsString('=')).toBe(false);
    expect(plainIsString('<<')).toBe(false);
    expect(plainIsString('')).toBe(false);
  });
});
