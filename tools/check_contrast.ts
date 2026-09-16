#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for every `a11y.contrast` pair declared in component docs,
 * evaluated against every theme × mode. Fails the build if a pair misses its level.
 *
 *     AA:  4.5:1 normal text, 3:1 large text     AAA: 7:1 normal, 4.5:1 large
 *     non-text (WCAG 1.4.11, AA only): 3:1
 *
 * Usage: node tools/check_contrast.ts            (Node 22.18+/24 type stripping; `node --import tsx` on older Node)
 *
 * Port of tools/check_contrast.py: same lines on stdout, same exit code. Runs under Node's type stripping:
 * annotations only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expand } from '../schema/lib.ts';
import { has, ljust, product, pyFixed, pyGet, truthy } from './lib/py.ts';
import { pyFloatRepr } from './lib/pyyaml.ts';
import { REPO_ROOT } from './lib/root.ts';
import { loadTheme, modes, publicName, themes } from './lib/tokens.ts';
import { contrast, luminance } from './oklch.ts';

export type Dict = Record<string, unknown>;

export const paths = {
  ROOT: REPO_ROOT,
  GENERATED: join(REPO_ROOT, 'generated', 'components.json'),
};

/** The token resolver the checker reads palettes through; the tests swap in a palette they control. */
export const hooks = { themes, modes, loadTheme };

export const THRESHOLDS: Readonly<Record<string, number>> = { 'AA': 4.5, 'AA/large': 3.0, 'AAA': 7.0, 'AAA/large': 4.5, 'AA/non-text': 3.0 };

/** `THRESHOLDS[(level, large)]`: the ratio a pair needs; a KeyError for a level the schema does not know. A non-text
 *  pair has one threshold whatever `large` says, and none at AAA. */
export function threshold(level: string, large: boolean, nonText = false): number {
  const key = nonText ? `${level}/non-text` : large ? `${level}/large` : level;
  if (!Object.hasOwn(THRESHOLDS, key)) throw new Error(nonText ? `KeyError: ('${level}', 'non-text')` : `KeyError: ('${level}', ${large ? 'True' : 'False'})`);
  return THRESHOLDS[key] as number;
}

export { contrast, luminance };

// color.action.{variant}.background → one path per enum value of `variant`; lives in schema/lib.ts so the
// schema package can publish without tools/.
export { expand };

function print(line: string): void {
  process.stdout.write(line + '\n');
}

export function main(): number {
  if (!existsSync(paths.GENERATED)) {
    process.stderr.write('✖ generated/components.json missing — run tools/parse.ts first\n');
    return 1;
  }
  const components = JSON.parse(readFileSync(paths.GENERATED, 'utf8')) as Dict[];
  const palettes: Record<string, Record<string, unknown>> = {};
  for (const t of hooks.themes()) {
    for (const m of hooks.modes(t)) {
      const palette: Record<string, unknown> = {};
      for (const [p, e] of Object.entries(hooks.loadTheme(t, m))) palette[publicName(p)] = e.$value;
      palettes[`${t}/${m}`] = palette;
    }
  }
  let failures = 0;
  let checked = 0;
  for (const comp of components) {
    const c = comp.component as Dict;
    const a11y = pyGet(c, 'a11y', {}) as Dict;
    const pairs = pyGet(a11y, 'contrast', []) as Dict[] | null;
    for (const pair of truthy(pairs) ? (pairs as Dict[]) : []) {
      const level = pyGet(pair, 'level', 'AA') as string;
      const large = pyGet(pair, 'large', false) as boolean;
      const nonText = pair.nonText === true;
      const state = pair.state as string | undefined;
      const surface = pair.surface as string | undefined;
      const only = pair.only as Record<string, string[]> | undefined;
      const need = threshold(level, large, nonText);
      const needs = `${level}${nonText ? ' non-text' : ''}${state === undefined ? '' : `, ${state}`}`;
      // `only` narrows each slot before the same-slot zip below.
      const fgs = expand(pair.foreground as string, c.props as Dict, only);
      const bgs = expand(pair.background as string, c.props as Dict, only);
      // Pairs expanded from the same prop slot are zipped (variant↔variant), not crossed.
      const combos: string[][] = fgs.length === bgs.length && fgs.length > 1 ? fgs.map((fg, i) => [fg, bgs[i] as string]) : product([fgs, bgs]);
      for (const [fgRef, bgRef] of combos as [string, string][]) {
        for (const [theme, tokens] of Object.entries(palettes)) {
          const fg: unknown = tokens[fgRef] ?? null;
          let bg: unknown = tokens[bgRef] ?? null;
          if (fg === null || bg === null) {
            print(`✖ ${c.name as string}: unknown token ${fg === null ? fgRef : bgRef}`);
            failures += 1;
            continue;
          }
          if (bg === 'transparent' && surface !== undefined) {
            // ghost etc. — check against the surface the pair declares it sits on.
            bg = tokens[surface] ?? null;
            if (bg === null) {
              print(`✖ ${c.name as string}: unknown token ${surface}`);
              failures += 1;
              continue;
            }
          } else if (bg === 'transparent') {
            // ghost etc. — check against page background instead. Subscripting, not `.get`: a theme
            // without the token is a KeyError, as it was in Python.
            if (!has(tokens, 'color.background')) throw new Error("KeyError: 'color.background'");
            bg = tokens['color.background'];
          }
          const ratio = contrast(fg as string, bg as string);
          checked += 1;
          const ok = ratio >= need;
          failures += ok ? 0 : 1;
          const mark = ok ? '✔' : '✖';
          print(`${mark} ${ljust(c.name as string, 8)} ${ljust(theme, 18)} ${fgRef} on ${bgRef}: ${pyFixed(ratio, 2)}:1 (needs ${pyFloatRepr(need)} for ${needs})`);
        }
      }
    }
  }
  print(`\n${checked} pairs checked, ${failures} failures`);
  return failures ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  process.exitCode = main();
}
