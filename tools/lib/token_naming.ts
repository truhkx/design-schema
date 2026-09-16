/**
 * A naming doc's `tokens` block (job 628): the names a brand's token build emits, and the checks that keep them
 * unambiguous. tokens/build.mjs and tools/naming.ts both resolve `tokens` through this module, so a brand path is
 * refused by the same rule whichever of the two meets it first.
 *
 * The dotted path stays canonical everywhere a tool reads it; only the emitted CSS variable and JS/RN/Swift key
 * change. A `rename` key is therefore checked against schema/tokens.ts's manifest, the public names every theme
 * derives, and never against a build.
 *
 * Imports only schema/ and tools/lib/. The token build must never load tools/parse.ts, and tools/naming.ts imports
 * it, so the doc is read here: frontmatter through pyyaml.ts's `load`, the reader parse.ts itself uses.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, statSync } from 'node:fs';
import { join, relative, resolve as resolvePath } from 'node:path';

import { namingFrontmatter } from '../../schema/naming.ts';
import type { NamingDef } from '../../schema/naming.ts';
import { TOKEN_NAMES, tokenPublicName } from '../../schema/tokens.ts';
import { readText } from './py.ts';
import { load } from './pyyaml.ts';
import { REPO_ROOT } from './root.ts';
import { emittedCamelName, emittedCssName, THEME_MEMBERS } from './tokens.ts';

export { emittedCamelName, emittedCssName };

/** A `tokens` block with every entry that renames nothing dropped: `Resolution.tokens`, and what the build emits from. */
export type TokenRenames = { cssPrefix?: string | undefined; rename: Record<string, string> };

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n/;

/** `Button` → `button`, `AlertDialog` → `alert-dialog`: parse.ts's `kebab`, which this module cannot import. */
function kebab(name: string): string {
  return name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();
}

export function tokenRenames(tokens: NamingDef['tokens']): TokenRenames {
  const rename: Record<string, string> = {};
  for (const [from, to] of Object.entries(tokens.rename ?? {})) if (from !== to) rename[from] = to;
  return tokens.cssPrefix === undefined ? { rename } : { cssPrefix: tokens.cssPrefix, rename };
}

/** Whether a resolved block changes any emitted name; when it does not, the build takes its default path. */
export function renamesTokens(tokens: TokenRenames): boolean {
  return Object.keys(tokens.rename).length > 0 || tokens.cssPrefix !== undefined;
}

/** `rename` keys that name no token. A key is the public name, so a pull that renames or drops a token strands it
 *  exactly as it strands a component key. */
export function unknownTokenKeys(tokens: NamingDef['tokens']): string[] {
  const out: string[] = [];
  for (const key of Object.keys(tokens.rename ?? {}).sort()) {
    if (TOKEN_NAMES.has(key)) continue;
    const name = tokenPublicName(key);
    out.push(
      name !== key && TOKEN_NAMES.has(name)
        ? `tokens.rename.${key}: a key is the token's public name, without the trailing .default: ${name}`
        : `tokens.rename.${key}: no token is called ${key}`,
    );
  }
  return out;
}

/**
 * What a `tokens` block would emit ambiguously, one message per problem, each naming its key. `components` is the
 * canonical component list; the doc's brand names are added here. They matter only when the token prefix is the
 * namespace's, where a token variable and a component hook share one `--<prefix>-` space.
 */
export function tokenProblems(naming: NamingDef, components: readonly string[]): string[] {
  const t = tokenRenames(naming.tokens);
  const out: string[] = [];
  const keyOf = (name: string): string => (Object.hasOwn(t.rename, name) ? `tokens.rename.${name}` : 'tokens.cssPrefix');

  // A brand path that is another token's canonical path reads as that token, unless that token moves out of the way.
  const shadowing = new Set<string>();
  for (const [from, to] of Object.entries(t.rename)) {
    if (!TOKEN_NAMES.has(to) || Object.hasOwn(t.rename, to)) continue;
    out.push(`tokens.rename.${from}: ${from} renames to ${to}, which is already a token — rename ${to} too, or pick another path`);
    shadowing.add(from).add(to);
  }

  // Two paths that differ only in where a word breaks emit one name: color.brandPrimary and color.brand.primary.
  const seenCss = new Map<string, string>();
  const seenCamel = new Map<string, string>();
  const collide = (seen: Map<string, string>, name: string, emitted: string, what: string): void => {
    const first = seen.get(emitted);
    if (first === undefined) {
      seen.set(emitted, name);
      return;
    }
    if (shadowing.has(name) && shadowing.has(first)) return; // reported above
    out.push(`${Object.hasOwn(t.rename, name) ? keyOf(name) : keyOf(first)}: ${first} and ${name} both emit the ${what} ${emitted}`);
  };
  for (const name of TOKEN_NAMES) {
    collide(seenCss, name, emittedCssName(name, t), 'CSS variable');
    collide(seenCamel, name, emittedCamelName(name, t), 'JS key');
  }

  for (const name of TOKEN_NAMES) {
    const key = emittedCamelName(name, t);
    if (THEME_MEMBERS.has(key)) out.push(`${keyOf(name)}: ${name} emits the Swift name ${key}, which would shadow Theme.${key}`);
  }

  const prefix = t.cssPrefix;
  if (prefix !== undefined && prefix === naming.namespace.cssPrefix) {
    const owners = [...new Set([...components, ...Object.values(naming.components)])];
    for (const name of TOKEN_NAMES) {
      const emitted = emittedCssName(name, t);
      const owner = owners.find((c) => emitted === `--${prefix}-${kebab(c)}` || emitted.startsWith(`--${prefix}-${kebab(c)}-`));
      if (owner !== undefined) {
        out.push(`${keyOf(name)}: ${name} emits ${emitted}, a name inside ${owner}'s component hooks (--${prefix}-${kebab(owner)}-…), because tokens.cssPrefix is namespace.cssPrefix`);
      }
    }
  }
  return out;
}

/** `nimbus` → `<themes>/nimbus/naming.md`; a path to a file, relative to `root`, is taken as written. Null when neither exists. */
export function findNamingDoc(ref: string, root: string = REPO_ROOT, themes: string = join(root, 'themes')): string | null {
  const direct = resolvePath(root, ref);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  const byBrand = join(themes, ref, 'naming.md');
  return existsSync(byBrand) ? byBrand : null;
}

/** generated/components.json's component names, or none when tools/parse.ts has not run. */
function componentNames(file: string): string[] {
  if (!existsSync(file)) return [];
  const entries = JSON.parse(readText(file)) as { component?: { name?: string } }[];
  return entries.map((e) => e.component?.name ?? '').filter((n) => n !== '');
}

/**
 * The token build's view of a naming doc: its `tokens` block, checked and resolved, or null when the doc changes no
 * emitted name, in which case the build takes its default path and writes the default bytes. Every problem throws an
 * `Error` whose message names the file and the key, the way the build reports any other problem.
 */
export function loadTokenNaming(ref: string, root: string = REPO_ROOT): { file: string; tokens: TokenRenames } | null {
  const file = findNamingDoc(ref, root);
  if (file === null) throw new Error(`✖ no naming doc for '${ref}' — expected a file, or themes/${ref}/naming.md`);
  const where = (relative(root, file) || file).replaceAll('\\', '/');
  const m = FRONTMATTER.exec(readText(file));
  if (m === null) throw new Error(`✖ ${where}: missing YAML frontmatter block`);
  let fm: unknown;
  try {
    fm = load(m[1] as string);
  } catch (e) {
    throw new Error(`✖ ${where}: invalid YAML frontmatter: ${e instanceof Error ? e.message : String(e)}`);
  }
  const parsed = namingFrontmatter.safeParse(fm !== null && typeof fm === 'object' ? fm : {});
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `    ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new Error(`✖ ${where} does not match schema/naming.ts:\n${issues}`);
  }
  const naming = parsed.data.naming;
  const problems = [...unknownTokenKeys(naming.tokens), ...tokenProblems(naming, componentNames(join(root, 'generated', 'components.json')))];
  if (problems.length > 0) throw new Error(`✖ ${where}: ${problems.length} token name problem(s):\n${problems.map((p) => `    ${p}`).join('\n')}`);
  const tokens = tokenRenames(naming.tokens);
  return renamesTokens(tokens) ? { file, tokens } : null;
}
