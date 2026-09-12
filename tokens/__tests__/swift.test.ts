/**
 * The `swift` platform's contract: packages/swiftui/Sources/DesignSchemaTokens must list every token the
 * resolved JSON lists, per theme and per mode, and TokenRef must have exactly one case per token.
 *
 * A missing token is invisible on this machine — SwiftUI compiles only on macOS, so nothing here is
 * typechecked before .github/workflows/swiftui-gates.yml runs — and at runtime `Theme`'s subscript falls
 * back rather than trapping. Counting against json/tokens.light.json is what catches a dropped `$type`
 * mapping or a name collision the same day it lands.
 *
 * Run `pnpm tokens` first: this reads the build's output, it does not run the build.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..', '..');
const DIST = join(ROOT, 'packages', 'tokens', 'dist');
const SWIFT = join(ROOT, 'packages', 'swiftui', 'Sources', 'DesignSchemaTokens');

const themes = readdirSync(join(ROOT, 'tokens', 'themes'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

/** `calm-precise` → `CalmPrecise`, the same mapping tokens/build.mjs uses for the file name. */
const pascal = (id: string) =>
  id.split(/[^A-Za-z0-9]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');

const jsonNames = (theme: string, mode: string) =>
  Object.keys(JSON.parse(readFileSync(join(DIST, theme, 'json', `tokens.${mode}.json`), 'utf8')));

/** The `(.spaceMd, .dimension(spaceMd)),` rows of one mode's `TokenTable`. */
function tableEntries(source: string, mode: 'Light' | 'Dark'): string[] {
  const start = source.indexOf(`    public enum ${mode} {`);
  expect(start, `${mode} enum`).toBeGreaterThan(-1);
  const other = source.indexOf(`    public enum ${mode === 'Light' ? 'Dark' : 'Light'} {`);
  const end = other > start ? other : source.length;
  return [...source.slice(start, end).matchAll(/^ {12}\(\.(\w+), \.\w+\(/gm)].map((m) => m[1]);
}

/** The `public static let spaceMd: CGFloat = 12` declarations of one mode. */
function constants(source: string, mode: 'Light' | 'Dark'): string[] {
  const start = source.indexOf(`    public enum ${mode} {`);
  const other = source.indexOf(`    public enum ${mode === 'Light' ? 'Dark' : 'Light'} {`);
  const end = other > start ? other : source.length;
  return [...source.slice(start, end).matchAll(/^ {8}public static let (\w+): /gm)].map((m) => m[1]);
}

/** `space.md` → `spaceMd`, the `name/camel-no-default` transform. */
const camel = (ref: string) =>
  ref.split('.').map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('').replace(/[^A-Za-z0-9]/g, '');

describe.each(themes)('%s.swift', (theme) => {
  const source = readFileSync(join(SWIFT, `${pascal(theme)}.swift`), 'utf8');

  it.each(['light', 'dark'] as const)('lists exactly as many tokens as json/tokens.%s.json', (mode) => {
    const expected = jsonNames(theme, mode);
    const enumName = mode === 'light' ? 'Light' : 'Dark';

    expect(tableEntries(source, enumName)).toEqual(expected.map(camel));
    expect(constants(source, enumName)).toHaveLength(expected.length);
  });

  it('declares the theme id and the doc title', () => {
    expect(source).toContain(`id: ${JSON.stringify(theme)},`);
    expect(source).toMatch(/^ {8}title: ".+",$/m);
  });
});

describe('TokenRef.swift', () => {
  const source = readFileSync(join(SWIFT, 'TokenRef.swift'), 'utf8');
  const cases = [...source.matchAll(/^ {4}case (`?\w+`?) = "([^"]+)"$/gm)];

  it('has one case per token, keyed by the dotted name', () => {
    // Every theme carries the same names, so the light JSON of any of them is the whole set.
    expect(cases.map((m) => m[2])).toEqual(jsonNames(themes[0], 'light'));
  });

  it('resolves every case on Theme for the active mode', () => {
    const accessors = [...source.matchAll(/^ {4}var (`?\w+`?): [\w.]+ \{ \w+\(\.\w+\) \}$/gm)];
    expect(accessors.map((m) => m[1])).toEqual(cases.map((m) => m[1]));
  });

  it('is consistent across themes', () => {
    for (const theme of themes) expect(jsonNames(theme, 'light')).toEqual(jsonNames(themes[0], 'light'));
  });
});
