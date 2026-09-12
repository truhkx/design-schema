/**
 * tools/lib/jsonschema.ts — the draft 2020-12 subset schema/theme.schema.json needs, with Python
 * `jsonschema` 4.26's messages, paths and error order. Every expectation here was taken from a run of
 * Draft202012Validator over the same instance (logs/port304/probe-schema.py).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { errorLine, iterErrors, sortedErrors } from '../lib/jsonschema.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { theme as themeFixture } from './fixtures.ts';

type Dict = Record<string, any>;

const THEME_SCHEMA = JSON.parse(readFileSync(join(REPO_ROOT, 'schema', 'theme.schema.json'), 'utf8')) as Dict;

/** The lines `tools/theme.ts` would report for a frontmatter. */
function lines(fm: unknown, schema: Dict = THEME_SCHEMA): string[] {
  return sortedErrors(iterErrors(schema, fm)).map(errorLine);
}

const fm = (mutate: (t: Dict) => void): Dict => {
  const t = themeFixture();
  mutate(t);
  return { title: 'Test', theme: t };
};

describe('theme.schema.json', () => {
  test('a valid theme reports nothing', () => {
    expect(lines(fm(() => {}))).toEqual([]);
  });

  test('a missing theme key', () => {
    expect(lines({ title: 'Test' })).toEqual(["  - (root): 'theme' is a required property"]);
  });

  test('a non-object root', () => {
    expect(lines(['not', 'an', 'object'])).toEqual(["  - (root): ['not', 'an', 'object'] is not of type 'object'"]);
  });

  test('required properties are reported in schema order', () => {
    expect(lines(fm((t) => { for (const k of Object.keys(t)) delete t[k]; }))).toEqual([
      "  - theme: 'id' is a required property",
      "  - theme: 'tone' is a required property",
      "  - theme: 'not' is a required property",
      "  - theme: 'seed' is a required property",
      "  - theme: 'scale' is a required property",
      "  - theme: 'radius' is a required property",
      "  - theme: 'density' is a required property",
      "  - theme: 'modes' is a required property",
    ]);
  });

  test('enum', () => {
    expect(lines(fm((t) => { t.density = 'cavernous'; }))).toEqual(
      ["  - theme.density: 'cavernous' is not one of ['compact', 'comfortable', 'roomy']"]);
  });

  test('pattern, through a $ref and directly', () => {
    expect(lines(fm((t) => { t.id = 'Test_Theme'; }))).toEqual(
      ["  - theme.id: 'Test_Theme' does not match '^[a-z][a-z0-9-]*$'"]);
    expect(lines(fm((t) => { t.seed.color = '#GG0000'; }))).toEqual(
      ["  - theme.seed.color: '#GG0000' does not match '^#[0-9a-fA-F]{6}$'"]);
  });

  test('type, including inside a $ref', () => {
    expect(lines(fm((t) => { t.seed = '#fff'; }))).toEqual(["  - theme.seed: '#fff' is not of type 'object'"]);
    expect(lines(fm((t) => { t.seed.color = 3; }))).toEqual(["  - theme.seed.color: 3 is not of type 'string'"]);
    expect(lines(fm((t) => { t.neutralTint = 'lots'; }))).toEqual(["  - theme.neutralTint: 'lots' is not of type 'number'"]);
  });

  test('minimum and maximum', () => {
    expect(lines(fm((t) => { t.scale.base = 10; }))).toEqual(['  - theme.scale.base: 10 is less than the minimum of 12']);
    expect(lines(fm((t) => { t.scale.base = 30; }))).toEqual(['  - theme.scale.base: 30 is greater than the maximum of 20']);
    expect(lines(fm((t) => { t.neutralTint = 2; }))).toEqual(['  - theme.neutralTint: 2 is greater than the maximum of 1']);
    expect(lines(fm((t) => { t.layout = { contentWidth: 100 }; }))).toEqual(['  - theme.layout.contentWidth: 100 is less than the minimum of 480']);
  });

  test('minItems says "is too short" above 1 and "should be non-empty" at 1', () => {
    expect(lines(fm((t) => { t.tone = ['calm']; }))).toEqual(["  - theme.tone: ['calm'] is too short"]);
    expect(lines(fm((t) => { t.modes.supports = []; }))).toEqual(['  - theme.modes.supports: [] should be non-empty']);
  });

  test('maxItems', () => {
    expect(lines(fm((t) => { t.tone = ['a', 'b', 'c', 'd', 'e', 'f']; }))).toEqual(
      ["  - theme.tone: ['a', 'b', 'c', 'd', 'e', 'f'] is too long"]);
  });

  test('items descends with an integer path segment', () => {
    expect(lines(fm((t) => { t.tone = ['calm', 7]; }))).toEqual(["  - theme.tone.1: 7 is not of type 'string'"]);
    expect(lines(fm((t) => { t.modes.supports = ['light', 'sepia']; }))).toEqual(
      ["  - theme.modes.supports.1: 'sepia' is not one of ['light', 'dark']"]);
  });

  test('additionalProperties names the extras, sorted, with the right verb', () => {
    expect(lines(fm((t) => { t.wibble = 1; }))).toEqual(
      ["  - theme: Additional properties are not allowed ('wibble' was unexpected)"]);
    expect(lines(fm((t) => { t.wobble = 2; t.wibble = 1; }))).toEqual(
      ["  - theme: Additional properties are not allowed ('wibble', 'wobble' were unexpected)"]);
    expect(lines(fm((t) => { t.seed.tertiary = '#fff'; }))).toEqual(
      ["  - theme.seed: Additional properties are not allowed ('tertiary' was unexpected)"]);
  });

  test('a null info hue is allowed by the number-or-null type', () => {
    expect(lines(fm((t) => { t.statusHues = { info: null }; }))).toEqual([]);
    expect(lines(fm((t) => { t.statusHues = { danger: 'red' }; }))).toEqual(
      ["  - theme.statusHues.danger: 'red' is not of type 'number'"]);
  });

  test('errors are sorted by instance path, shallowest first', () => {
    expect(lines(fm((t) => { Object.assign(t, { density: 'cavernous', radius: 'round', id: 'X', wibble: 1 }); }))).toEqual([
      "  - theme: Additional properties are not allowed ('wibble' was unexpected)",
      "  - theme.density: 'cavernous' is not one of ['compact', 'comfortable', 'roomy']",
      "  - theme.id: 'X' does not match '^[a-z][a-z0-9-]*$'",
      "  - theme.radius: 'round' is not one of ['none', 'sm', 'md', 'lg', 'full']",
    ]);
  });
});

describe('keywords the theme schema does not use', () => {
  test('const', () => {
    expect(lines(2, { const: 1 })).toEqual(['  - (root): 1 was expected']);
  });

  test('exclusive bounds', () => {
    expect(lines(1, { exclusiveMinimum: 1 })).toEqual(['  - (root): 1 is less than or equal to the minimum of 1']);
    expect(lines(1, { exclusiveMaximum: 1 })).toEqual(['  - (root): 1 is greater than or equal to the maximum of 1']);
  });

  test('a type list', () => {
    expect(lines('x', { type: ['number', 'null'] })).toEqual(["  - (root): 'x' is not of type 'number', 'null'"]);
  });

  test('a boolean is not a number and an integral float is an integer', () => {
    expect(lines(true, { type: 'number' })).toEqual(['  - (root): True is not of type \'number\'']);
    expect(lines(2.0, { type: 'integer' })).toEqual([]);
    expect(lines(2.5, { type: 'integer' })).toEqual(['  - (root): 2.5 is not of type \'integer\'']);
  });

  test('prefixItems, then items for the tail', () => {
    const schema = { prefixItems: [{ type: 'string' }], items: { type: 'number' } };
    expect(lines([1, 'x'], schema)).toEqual([
      "  - 0: 1 is not of type 'string'",
      "  - 1: 'x' is not of type 'number'",
    ]);
  });

  test('a schema-valued additionalProperties validates the extras', () => {
    const schema = { properties: { a: { type: 'string' } }, additionalProperties: { type: 'number' } };
    expect(lines({ a: 'ok', b: 'nope' }, schema)).toEqual(["  - b: 'nope' is not of type 'number'"]);
  });
});
