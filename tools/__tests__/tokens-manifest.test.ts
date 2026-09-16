/** schema/tokens.ts against tools/theme.ts, its authority: every committed theme, and each derivation branch, derives
 *  exactly the manifest's paths, types and layers, and its public names are the built JSON's. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { isToken, NO_TOKEN_VALUES, TOKEN_NAMES, TOKEN_TYPES, tokenPublicName, TOKENS } from '../../schema/tokens.ts';
import type { TokenInfo, TokenType } from '../../schema/tokens.ts';
import { pyGet, pyJsonDumps } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { flatten } from '../lib/tokens.ts';
import { deriveBase, deriveMode, ELEVATION, isInk } from '../theme.ts';
import type { Dict } from '../theme.ts';
import { theme } from './fixtures.ts';

const THEMES = join(REPO_ROOT, 'tokens', 'themes');

/** Path → type and layer for one mode of a theme, as tools/theme.ts derives it, with inherited `$type`. The trees go
 *  through the JSON the tool writes, so its numbered `Map` groups flatten like any other. */
function derived(t: Dict, mode: string): Record<string, TokenInfo> {
  const base = deriveBase(t);
  const tree = deriveMode(base, mode, ELEVATION[pyGet(t, 'elevation', 'subtle') as string] as number, isInk(t.seed.color as string));
  const out: Record<string, TokenInfo> = {};
  for (const [layer, layerTree] of [['base', base], ['mode', tree]] as const) {
    for (const [path, entry] of Object.entries(flatten(JSON.parse(pyJsonDumps(layerTree, 2)) as Dict))) {
      expect(Object.hasOwn(out, path), `${path} derived in both layers`).toBe(false);
      out[path] = { type: entry.$type as TokenType, layer };
    }
  }
  return out;
}

function expectManifest(t: Dict, mode: string): void {
  const d = derived(t, mode);
  expect(Object.keys(d)).toEqual(Object.keys(TOKENS));
  expect(d).toEqual(TOKENS);
}

const committed = readdirSync(THEMES).filter((id) => existsSync(join(THEMES, id, 'theme.json'))).sort();

test('the manifest has 138 base tokens, 62 mode tokens and 200 public names', () => {
  const layers = Object.values(TOKENS).map((info) => info.layer);
  expect(layers.filter((l) => l === 'base')).toHaveLength(138);
  expect(layers.filter((l) => l === 'mode')).toHaveLength(62);
  expect(TOKEN_NAMES.size).toBe(200);
  expect([...new Set(Object.values(TOKENS).map((info) => info.type))].sort()).toEqual([...TOKEN_TYPES].sort());
});

describe.each(committed)('the committed theme %s', (id) => {
  const t = JSON.parse(readFileSync(join(THEMES, id, 'theme.json'), 'utf8')) as Dict;
  test.each(t.modes.supports as string[])('%s derives exactly TOKENS', (mode) => {
    expectManifest(t, mode);
  });
});

test('three themes are committed', () => {
  expect(committed).toEqual(['calm-precise', 'warm-friendly', 'warm-sleek']);
});

describe('every derivation branch derives the same names', () => {
  test.each(['light', 'dark'])('an ink brand (isInk), %s', (mode) => {
    const t = theme();
    t.seed.color = '#1C1C1E';
    expect(isInk(t.seed.color)).toBe(true);
    expectManifest(t, mode);
  });

  test.each(['light', 'dark'])('a second neutral seed (seed.neutral), %s', (mode) => {
    const t = theme();
    delete t.neutralTint;
    t.seed.neutral = '#EDE6DA';
    expect(isInk(t.seed.color)).toBe(false);
    expectManifest(t, mode);
  });
});

test('TOKEN_NAMES is the key set of the built calm-precise light JSON', () => {
  const built = JSON.parse(readFileSync(join(REPO_ROOT, 'packages', 'tokens', 'dist', 'calm-precise', 'json', 'tokens.light.json'), 'utf8')) as Dict;
  expect([...TOKEN_NAMES].sort()).toEqual(Object.keys(built).sort());
});

test('tokenPublicName drops only a trailing .default; isToken takes a public name or a full path', () => {
  expect(tokenPublicName('color.foreground.default')).toBe('color.foreground');
  expect(tokenPublicName('layout.gutter.default')).toBe('layout.gutter');
  expect(tokenPublicName('color.background.subtle')).toBe('color.background.subtle');
  expect(isToken('color.foreground')).toBe(true);
  expect(isToken('color.foreground.default')).toBe(true);
  expect(isToken('shadow.raised')).toBe(true);
  expect(isToken('color.foregroud.strong')).toBe(false);
  expect(isToken('color.palette')).toBe(false);
  expect([...NO_TOKEN_VALUES].sort()).toEqual(['full', 'none']);
});
