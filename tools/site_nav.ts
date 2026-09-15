#!/usr/bin/env node
/**
 * Site navigation data — the website's top-level nav and its docs sidebar groups, generated
 * rather than hand-maintained (site/src/content/docs/process/website-plan.md, "Content pipeline").
 *
 * Reads generated/components.json for the component list (name + slug) and regen.ps1 for the
 * phase -> component mapping, so the sidebar's groups and their order are literally the order the
 * generator composes components in (Primitives -> Core -> Controls -> Focus -> Overlays ->
 * Selection -> Numeric -> Rows -> Grids -> Streams). regen.ps1 is the source of that order instead
 * of a second copy here: a phase list that drifts from the one the generator runs would put a
 * component in the wrong sidebar group, and nobody would notice.
 *
 * Writes generated/nav.json:
 *
 *   { "top":  [{ "label": "Docs", "href": "/docs" }, ..., { ..., "external": true }],
 *     "docs": [{ "phase": "Primitives", "components": [{ "name": "Icon", "slug": "icon" }, ...] }, ...] }
 *
 * Every component in components.json must belong to exactly one phase and every phase component
 * must exist in components.json; either mismatch is an error, not a silently smaller sidebar.
 *
 * Usage:  node tools/site_nav.ts [--check]
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads or writes. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  COMPONENTS: join(REPO_ROOT, 'generated', 'components.json'),
  REGEN: join(REPO_ROOT, 'regen.ps1'),
  OUT: join(REPO_ROOT, 'generated', 'nav.json'),
};

export type TopItem = { label: string; href: string; external?: true };
export type NavComponent = { name: string; slug: string };
export type NavGroup = { phase: string; components: NavComponent[] };
export type Nav = { top: TopItem[]; docs: NavGroup[] };

/** The repository, for the GitHub entry (vision-and-decisions.md #1). */
export const REPO_URL = 'https://github.com/design-schema/design-schema';

/** Top-level nav: fixed pages, not schema-derived. GitHub is an external link, never a route.
 *  No entry for `/`: the header's logo lockup is the home link (Tony's review, 2026-09-15). */
export const TOP: readonly TopItem[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'GitHub', href: REPO_URL, external: true },
  { label: 'About', href: '/about' },
];

/** Raised for a bad input (a missing file, an unparseable regen.ps1, a component in no phase). */
export class NavError extends Error {}

const PHASES_BLOCK = /^\$phases\s*=\s*@\(([\s\S]*?)^\)/m;
const PHASE_ENTRY = /@\{([^}]*)\}/g;
const FIELD = (name: string): RegExp => new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`);

/** The phases regen.ps1 composes in, in order: [name, component names]. Entries with no
 *  `components` (the trailing `Patterns` phase, which names a pattern) are not sidebar groups. */
export function parsePhases(text: string): [string, string[]][] {
  const block = PHASES_BLOCK.exec(text);
  if (!block) throw new NavError('regen.ps1: no `$phases = @(...)` block — the phase order cannot be read');
  const phases: [string, string[]][] = [];
  for (const entry of (block[1] as string).matchAll(PHASE_ENTRY)) {
    const body = entry[1] as string;
    const name = FIELD('name').exec(body);
    if (!name) throw new NavError(`regen.ps1: a phase entry has no name: ${body.trim()}`);
    const components = FIELD('components').exec(body);
    if (!components) continue;
    phases.push([name[1] as string, (components[1] as string).split(',').map((c) => c.trim()).filter((c) => c !== '')]);
  }
  if (phases.length === 0) throw new NavError('regen.ps1: the `$phases` block lists no components');
  return phases;
}

export type Entry = { id?: unknown; component?: { name?: unknown } };

/** name -> slug from components.json, in the order the parser emitted them. */
export function slugsByName(components: Entry[]): Map<string, string> {
  const slugs = new Map<string, string>();
  for (const entry of components) {
    const name = entry.component?.name;
    const slug = entry.id;
    if (typeof name !== 'string' || name === '' || typeof slug !== 'string' || slug === '') {
      throw new NavError(`generated/components.json: an entry has no component.name / id (${JSON.stringify(entry).slice(0, 80)})`);
    }
    if (slugs.has(name)) throw new NavError(`generated/components.json: ${name} appears twice`);
    slugs.set(name, slug);
  }
  return slugs;
}

/** The nav data. Throws when a phase names a component the schema does not have, or the schema has
 *  a component no phase claims — both would ship a sidebar that silently omits a page. */
export function buildNav(components: Entry[], phases: [string, string[]][]): Nav {
  const slugs = slugsByName(components);
  const placed = new Map<string, string>();
  const docs: NavGroup[] = [];
  for (const [phase, names] of phases) {
    const group: NavComponent[] = [];
    for (const name of names) {
      const slug = slugs.get(name);
      if (slug === undefined) {
        throw new NavError(`regen.ps1 phase ${phase} names ${name}, which is not in generated/components.json`);
      }
      const already = placed.get(name);
      if (already !== undefined) throw new NavError(`${name} is in two phases: ${already} and ${phase}`);
      placed.set(name, phase);
      group.push({ name, slug });
    }
    docs.push({ phase, components: group });
  }
  const orphans = [...slugs.keys()].filter((name) => !placed.has(name));
  if (orphans.length > 0) {
    throw new NavError(`no regen.ps1 phase composes ${orphans.join(', ')} — add them to a phase so the docs sidebar lists them`);
  }
  return { top: TOP.map((item) => ({ ...item })), docs };
}

/** The bytes of nav.json: deterministic, so re-running on an unchanged components.json is a no-op. */
export function render(nav: Nav): string {
  return JSON.stringify(nav, null, 2) + '\n';
}

function relToRoot(file: string): string {
  return relative(paths.ROOT, file).replaceAll(sep, '/');
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let check = false;
  for (const arg of argv) {
    if (arg === '--check') check = true;
    else if (arg === '-h' || arg === '--help') {
      process.stdout.write('usage: site_nav.ts [--check]\n\nWrites generated/nav.json from generated/components.json and regen.ps1.\n');
      return 0;
    } else {
      process.stderr.write(`site_nav.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }

  let text: string;
  try {
    if (!existsSync(paths.COMPONENTS)) {
      throw new NavError(`${relToRoot(paths.COMPONENTS)} missing — run \`pnpm parse\` first`);
    }
    if (!existsSync(paths.REGEN)) throw new NavError(`${relToRoot(paths.REGEN)} missing — it holds the phase order`);
    const components = JSON.parse(readText(paths.COMPONENTS)) as Entry[];
    if (!Array.isArray(components)) throw new NavError(`${relToRoot(paths.COMPONENTS)}: expected a list of components`);
    text = render(buildNav(components, parsePhases(readText(paths.REGEN))));
  } catch (e) {
    if (!(e instanceof NavError)) throw e;
    process.stderr.write(`✖ ${e.message}\n`);
    return 1;
  }

  const out = relToRoot(paths.OUT);
  const current = existsSync(paths.OUT) ? readText(paths.OUT) : null;
  if (check) {
    if (current === text) {
      process.stdout.write(`✔ ${out} is current\n`);
      return 0;
    }
    process.stderr.write(`✖ ${out} is ${current === null ? 'missing' : 'stale'} — run \`pnpm nav\`\n`);
    return 1;
  }
  if (current !== text) writeTextAtomic(paths.OUT, text);
  const nav = JSON.parse(text) as Nav;
  const total = nav.docs.reduce((n, group) => n + group.components.length, 0);
  process.stdout.write(`✔ nav: ${total} components in ${nav.docs.length} phases, ${nav.top.length} top-level links → ${out}\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
