#!/usr/bin/env node
/**
 * WCAG 2.2 contrast check for every `a11y.contrast` pair declared in component docs,
 * evaluated against every theme × mode. Fails the build if a pair misses its level.
 *
 *     AA:  4.5:1 normal text, 3:1 large text     AAA: 7:1 normal, 4.5:1 large
 *
 * Usage: node tools/check_contrast.ts            (Node 22.18+/24 type stripping; `node --import tsx` on older Node)
 *
 * Port of tools/check_contrast.py: same lines on stdout, same exit code. Runs under Node's type stripping:
 * annotations only.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const THRESHOLDS: Readonly<Record<string, number>> = { 'AA': 4.5, 'AA/large': 3.0, 'AAA': 7.0, 'AAA/large': 4.5 };

/** `THRESHOLDS[(level, large)]`: the ratio a pair needs; a KeyError for a level the schema does not know. */
export function threshold(level: string, large: boolean): number {
  const key = large ? `${level}/large` : level;
  if (!Object.hasOwn(THRESHOLDS, key)) throw new Error(`KeyError: ('${level}', ${large ? 'True' : 'False'})`);
  return THRESHOLDS[key] as number;
}

export { contrast, luminance };

/** color.action.{variant}.background → one path per enum value of `variant`. */
export function expand(tokenRef: string, props: Dict): string[] {
  const slots = [...tokenRef.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1] as string);
  if (slots.length === 0) return [tokenRef];
  const choices: string[][] = [];
  for (const s of slots) {
    const p = pyGet(props, s, null) as Dict | null;
    if (!truthy(p) || pyGet(p as Dict, 'type', null) !== 'enum') throw new Error(`${tokenRef}: '{${s}}' must name an enum prop`);
    choices.push((p as Dict).values as string[]);
  }
  const out: string[] = [];
  for (const combo of product(choices)) {
    let ref = tokenRef;
    slots.forEach((s, i) => {
      ref = ref.replaceAll(`{${s}}`, combo[i] as string);
    });
    out.push(ref.endsWith('.default') ? ref.slice(0, -'.default'.length) : ref); // public names drop a trailing .default
  }
  return out;
}

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
      const need = threshold(level, large);
      const fgs = expand(pair.foreground as string, c.props as Dict);
      const bgs = expand(pair.background as string, c.props as Dict);
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
          if (bg === 'transparent') {
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
          print(`${mark} ${ljust(c.name as string, 8)} ${ljust(theme, 18)} ${fgRef} on ${bgRef}: ${pyFixed(ratio, 2)}:1 (needs ${pyFloatRepr(need)} for ${level})`);
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
