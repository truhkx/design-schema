#!/usr/bin/env node
/**
 * naming_demo.ts — the worked example that proves the naming mechanism (job 523).
 *
 *     node tools/naming_demo.ts            # rebuild packages/react/demo-brand/ and its DIFF.md
 *     node tools/naming_demo.ts --check    # the committed tree is current, and the diff is identifiers only
 *     node tools/naming_demo.ts --gates    # every gate, against the renamed tree
 *
 * `themes/demo-brand/naming.md` renames three components (Button → CtaButton, Disclosure → Expander,
 * Alert → Callout), one prop (Button.variant → emphasis) and the namespace (`ds` → `demo`,
 * `@design-schema` → `@demo`). This tool takes those three components out of `packages/react/src`,
 * follows their imports until the set closes, copies the closure and the derived behavior tests into
 * `packages/react/demo-brand/`, and applies the rename — the same `tools/naming.ts` step
 * `tools/generate.ts --naming` runs as the last thing a generation does. The canonical build is not
 * touched: `packages/react/src` and `generated/` are read, never written.
 *
 * Then it answers the question the demo exists to answer, in `packages/react/demo-brand/DIFF.md`:
 * *is every difference an identifier?* Each renamed file is tokenized beside the canonical file it
 * came from, and the comparison is deliberately structural —
 *
 *   1. the two files must produce the **same number of tokens** separated by **byte-identical gaps**,
 *      so the punctuation, the nesting, the JSX shape and the whitespace are provably unchanged;
 *   2. every token that differs must be explained by an entry in the naming doc — a component name, a
 *      prop name, the CSS prefix, the package scope — by a rule derived here from the *doc*, not
 *      borrowed from the rewriter, so this is a second opinion rather than a tautology;
 *   3. the canonical vocabulary the gates key off (`data-ds`, `data-part`, `part`, `role`, every
 *      `aria-*`, every `var(--token)` that is not a component hook, every HTML element name) must
 *      appear in the renamed file exactly as it appears in the canonical one.
 *
 * An unexplained token, a differing gap or a missing hook is a finding, and `--check` exits 1 on it.
 *
 * `--gates` runs the rest of the job's gate, the part a diff cannot see:
 *
 *   diff        this file's classification: zero unexplained differences
 *   round-trip  reverting the renamed tree reproduces the canonical bytes exactly
 *   contrast    tools/check_contrast.ts — doc-level, and so brand-agnostic by construction
 *   keyboard    tools/keyboard_tests.ts into a scratch directory, byte-compared with generated/keyboard
 *   literals    tools/lint_literals.ts over the *renamed* files
 *   typecheck   tsc over the *renamed* tree, under its own names
 *   behavior    the derived scenarios run twice — canonical and renamed — and every test has to
 *               reach the same verdict on both builds
 *
 * The two doc-level gates are run rather than argued about: a naming doc is not an input to either
 * tool, so "unaffected" is a claim that costs one process to check. The last three see brand names
 * and nothing else. Behaviour in a browser — same DOM, same accessibility tree, same interactions —
 * is `tests/website/naming-demo.spec.ts`, against the page at /docs/naming-demo.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { which, winQuote } from './lib/proc.ts';
import { ljust, pySorted, readText, sortedNames } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import * as naming from './naming.ts';
import { kebab } from './parse.ts';

export const paths = {
  ROOT: REPO_ROOT,
  SRC: join(REPO_ROOT, 'packages', 'react', 'src'),
  BEHAVIOR: join(REPO_ROOT, 'generated', 'behavior'),
  KEYBOARD: join(REPO_ROOT, 'generated', 'keyboard'),
  OUT: join(REPO_ROOT, 'packages', 'react', 'demo-brand'),
};

/** The brand whose naming.md this demo applies: themes/demo-brand/naming.md. */
export const BRAND = 'demo-brand';

/** The components the demo regenerates. All three are renamed by the doc, and Alert composes both a
 *  renamed component (Button) and an unrenamed one (Icon), which is the case worth seeing. */
export const SEEDS: readonly string[] = ['Alert', 'Button', 'Disclosure'];

/** Everything a generated file can import from its own package, as it is written today. */
const LOCAL_IMPORT = /(?:from|import)\s+'\.\/([A-Za-z0-9_+./-]+)'/g;

/** A generated test's import of the package under test, rewritten to the demo tree's own layout.
 *  The behavior tests are shared across packages, so they reach their component by relative path. */
const BEHAVIOR_IMPORT = '../../packages/react/src/';

export class DemoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DemoError';
  }
}

// ---------------------------------------------------------------- choosing the files

/** `./Button` → `Button.tsx`, `./Button.css` → `Button.css`, `./custom/analytics` → `custom/analytics.ts`.
 *  The result is the path relative to the package source, which is also the key the rename reports
 *  its moves under. */
function resolveLocal(spec: string): string | null {
  const name = spec.replace(/^\.\//, '');
  for (const candidate of [name, `${name}.tsx`, `${name}.ts`]) {
    if (existsSync(join(paths.SRC, candidate))) return candidate;
  }
  return null;
}

/**
 * The demo's file set: the three seeds with their stylesheets, stories and hand-written tests, then
 * the transitive closure of everything they import from the package.
 *
 * The closure is the point, not a convenience: a rename that stopped at the three mapped names would
 * leave `Callout` importing a `Button` that is not there. What comes back is a mix — components the
 * doc renames, components it does not (`Icon`, `Text`), a context module, and one hand-written
 * `custom/` module the rename is required to leave alone.
 */
export function fileSet(): string[] {
  const chosen = new Set<string>();
  const queue: string[] = [];
  const add = (rel: string | null): void => {
    if (rel === null || chosen.has(rel)) return;
    chosen.add(rel);
    queue.push(rel);
  };
  for (const seed of SEEDS) {
    add(resolveLocal(`./${seed}`));
    add(resolveLocal(`./${seed}.stories`));
    add(resolveLocal(`./${seed}.test`));
  }
  while (queue.length > 0) {
    const file = queue.shift() as string;
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const text = readText(join(paths.SRC, file));
    for (const m of text.matchAll(LOCAL_IMPORT)) add(resolveLocal(`./${m[1] as string}`));
  }
  return pySorted([...chosen]);
}

// ---------------------------------------------------------------- building the tree

/** One file of the demo tree: where it came from, and what it is called now. */
export type Pairing = { canonical: string; brand: string; dir: 'src' | 'behavior' };

/** `compat` is what the rename wrote into `src/naming-compat/` from the doc's aliases, as `naming-compat/<file>`:
 *  files with no canonical original, so never a pairing. */
export type Built = { out: string; pairs: Pairing[]; resolution: naming.Resolution; compat: string[] };

function freshDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function copyFile(from: string, to: string, transform?: (text: string) => string): void {
  mkdirSync(dirname(to), { recursive: true });
  if (transform === undefined) cpSync(from, to);
  else writeFileSync(to, transform(readFileSync(from, 'utf8')), 'utf8');
}

/**
 * Copy the closure and the derived behavior tests into `out`, then rename the whole tree with
 * tools/naming.ts — canonical in, brand out, exactly the step a generation runs last.
 */
export function build(out: string = paths.OUT): Built {
  const res = naming.resolve(BRAND);
  if (naming.isNoop(res)) throw new DemoError(`✖ themes/${BRAND}/naming.md renames nothing — there is no demo to build`);
  const src = join(out, 'src');
  const behavior = join(out, 'behavior');
  freshDir(src);
  freshDir(behavior);

  const files = fileSet();
  for (const file of files) copyFile(join(paths.SRC, file), join(src, file));
  const scenarios: string[] = [];
  for (const seed of SEEDS) {
    const from = join(paths.BEHAVIOR, `${seed}.web.test.tsx`);
    if (!existsSync(from)) continue;
    // The shared behavior test reaches packages/react/src by relative path; in the demo tree its
    // component is one directory over. Rewritten before the rename, so the rename moves the name
    // inside the new path the same way it moves it everywhere else.
    copyFile(from, join(behavior, `${seed}.web.test.tsx`), (text) => text.replaceAll(BEHAVIOR_IMPORT, '../src/'));
    scenarios.push(`${seed}.web.test.tsx`);
  }

  // The compatibility layer is the package source's, so `src` gets one and the derived tests do not.
  const applied = {
    src: naming.rename(src, res, 'brand', 'web'),
    behavior: naming.rename(behavior, res, 'brand', 'web', false, { compat: false }),
  };
  const moved = (a: naming.Applied): Map<string, string> => new Map(a.renames);
  const pairs: Pairing[] = [
    ...files.map((f): Pairing => ({ canonical: f, brand: moved(applied.src).get(f) ?? f, dir: 'src' })),
    ...scenarios.map((f): Pairing => ({ canonical: f, brand: moved(applied.behavior).get(f) ?? f, dir: 'behavior' })),
  ];
  return { out, pairs, resolution: res, compat: applied.src.compat ?? [] };
}

/** One alias the compatibility layer keeps working on web, for DIFF.md and renames.json. */
export type AliasRow = { kind: 'component' | 'prop' | 'value'; name: string; now: string; component: string; since: string | null; file: string | null; keeps: string };

export function aliasRows(built: Built): AliasRow[] {
  const rows: AliasRow[] = [];
  const onWeb = (use: naming.AliasUse): boolean => use.entry.platforms === undefined || (use.entry.platforms as readonly string[]).includes('web');
  for (const component of pySorted(Object.keys(built.resolution.aliases))) {
    const a = built.resolution.aliases[component] as naming.CompatAliases;
    const module = `${naming.COMPAT_DIR}/${a.current}.ts`;
    const file = built.compat.includes(module) ? `src/${module}` : null;
    const row = (kind: AliasRow['kind'], use: naming.AliasUse, now: string, keeps: string): AliasRow => ({
      kind, name: use.entry.name, now, component: a.current, since: use.entry.since ?? use.entry.deprecated?.since ?? null, file, keeps,
    });
    for (const use of a.components.filter(onWeb)) rows.push(row('component', use, a.current, `\`import { ${use.entry.name} }\` and \`${use.entry.name}Props\`, as \`${a.current}\``));
    for (const p of a.props) {
      for (const use of p.aliases.filter(onWeb)) rows.push(row('prop', use, p.current, `\`<${a.current} ${use.entry.name}=…>\`, passed on as \`${p.current}\``));
    }
    for (const x of a.values) {
      for (const use of x.aliases.filter(onWeb)) rows.push(row('value', use, x.current, `\`${x.currentProp}="${use.entry.name}"\`, passed on as \`${x.currentProp}="${x.current}"\``));
    }
  }
  return rows;
}

/** The canonical text a demo file is compared against: the package source, or the derived behavior
 *  test with its import path pointed at the demo tree (the one edit that is not a rename). */
export function canonicalText(pair: Pairing): string {
  if (pair.dir === 'src') return readFileSync(join(paths.SRC, pair.canonical), 'utf8');
  return readFileSync(join(paths.BEHAVIOR, pair.canonical), 'utf8').replaceAll(BEHAVIOR_IMPORT, '../src/');
}

// ---------------------------------------------------------------- the naming doc as a lexicon

/**
 * The naming doc's maps, re-expressed as the rules this file checks differences against.
 *
 * Derived from the resolved doc, deliberately *not* from tools/naming.ts's rewriter: the whole value
 * of the diff is that it is an independent reading of the same document. If the rewriter renames
 * something the doc does not describe, this is what notices.
 */
export type Lexicon = {
  components: [string, string][];
  kebabs: [string, string][];
  props: Map<string, string>;
  /** Every emitted event name the doc renames, on any platform and for any component: `onClick` → `onActivate`, `press` → `activate`. */
  events: Map<string, string>;
  /** Anatomy part → brand part, camelCase. */
  anatomy: Map<string, string>;
  cssFrom: string;
  cssTo: string;
  pascalFrom: string;
  pascalTo: string;
  camelFrom: string;
  camelTo: string;
  pkgFrom: string;
  pkgTo: string;
};

export function lexicon(res: naming.Resolution): Lexicon {
  const byLength = (a: [string, string], b: [string, string]): number => b[0].length - a[0].length;
  const components = Object.entries(res.components).sort(byLength);
  const props = new Map<string, string>();
  for (const [key, brand] of Object.entries(res.props)) props.set(key.includes('.') ? (key.split('.')[1] as string) : key, brand);
  const events = new Map<string, string>();
  for (const scopes of Object.values(res.events)) for (const renames of Object.values(scopes)) for (const [from, to] of Object.entries(renames)) events.set(from, to);
  const anatomy = new Map<string, string>();
  for (const parts of Object.values(res.anatomy)) for (const [from, to] of Object.entries(parts)) anatomy.set(from, to);
  const canonical = naming.resolve(null);
  return {
    components,
    kebabs: components.map(([from, to]): [string, string] => [kebab(from), kebab(to)]).sort(byLength),
    props,
    events,
    anatomy,
    cssFrom: canonical.cssPrefix,
    cssTo: res.cssPrefix,
    pascalFrom: naming.pascalPrefix(canonical.cssPrefix),
    pascalTo: naming.pascalPrefix(res.cssPrefix),
    camelFrom: lower(naming.pascalPrefix(canonical.cssPrefix)),
    camelTo: lower(naming.pascalPrefix(res.cssPrefix)),
    pkgFrom: canonical.package,
    pkgTo: res.package,
  };
}

function lower(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

// ---------------------------------------------------------------- classifying one difference

/** What kind of identifier a difference is. Every category is a name the doc can move; there is no
 *  category for anything else, which is the point — an unexplained difference has nowhere to go. */
export type Category =
  | 'file name'
  | 'component name'
  | 'prop name'
  | 'event name'
  | 'attribute name'
  | 'anatomy part'
  | 'CSS custom-property prefix'
  | 'class or custom-element name'
  | 'package scope'
  | 'namespace identifier';

/** The longest component stem whose remainder starts a new word: `ButtonProps` → `CtaButtonProps`. */
function stemmed(id: string, stems: [string, string][]): string | null {
  for (const [from, to] of stems) {
    if (id === from) return to;
    if (id.startsWith(from) && /^[A-Z]/.test(id.charAt(from.length))) return to + id.slice(from.length);
  }
  return null;
}

/** A dashed class name under the namespace prefix: `button__label` → `cta-button__label`. */
function dashedName(rest: string, lex: Lexicon): string {
  const modifier = rest.indexOf('--');
  const head = modifier === -1 ? rest : rest.slice(0, modifier);
  const tail = modifier === -1 ? '' : rest.slice(modifier);
  const under = head.indexOf('__');
  let stem = under === -1 ? head : head.slice(0, under);
  const part = under === -1 ? '' : head.slice(under + 2);
  for (const [from, to] of lex.kebabs) {
    if (stem === from || stem.startsWith(`${from}-`)) {
      stem = to + stem.slice(from.length);
      break;
    }
  }
  // naming.md: an `anatomy` key renames the part's class segment, and a `props` key still does where none does
  const renamed = part === '' ? '' : `__${kebabName(part, lex.anatomy) ?? kebabProp(part, lex) ?? part}`;
  return `${stem}${renamed}${tail}`;
}

function kebabProp(name: string, lex: Lexicon): string | null {
  return kebabName(name, lex.props);
}

function kebabName(name: string, map: Map<string, string>): string | null {
  const camel = name.replace(/-([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
  const renamed = map.get(camel);
  return renamed === undefined ? null : kebab(renamed);
}

/**
 * Why one token became another, or `null` if the naming doc does not account for it.
 *
 * Scope is deliberately not modelled here: `tools/naming.ts` is what decides whether a dotted prop
 * key reaches a given position, and this asks the looser question — is this pair a rename the doc
 * asks for *at all*. A classifier that re-implemented the scope rules would agree with the rewriter
 * by construction, which is exactly the agreement that would prove nothing.
 */
export function explain(from: string, to: string, lex: Lexicon): Category | null {
  if (from === to) return null;
  if (`@${from}` === lex.pkgFrom && `@${to}` === lex.pkgTo) return 'package scope';
  if (from.startsWith('--') || to.startsWith('--')) {
    if (!(from.startsWith('--') && to.startsWith('--'))) return null;
    const a = from.slice(2);
    const b = to.slice(2);
    if (a.startsWith(`${lex.cssFrom}-`) && b === `${lex.cssTo}-${a.slice(lex.cssFrom.length + 1)}`) return 'CSS custom-property prefix';
    return null;
  }
  if (from.startsWith(`${lex.cssFrom}-`) && to.startsWith(`${lex.cssTo}-`)) {
    const a = from.slice(lex.cssFrom.length + 1);
    const b = to.slice(lex.cssTo.length + 1);
    return b === dashedName(a, lex) ? 'class or custom-element name' : null;
  }
  if (/^[A-Z]/.test(from)) {
    if (from.startsWith(lex.pascalFrom) && /^[A-Z]/.test(from.charAt(lex.pascalFrom.length))) {
      const rest = from.slice(lex.pascalFrom.length);
      if (to === lex.pascalTo + (stemmed(rest, lex.components) ?? rest)) return 'namespace identifier';
    }
    return stemmed(from, lex.components) === to ? 'component name' : null;
  }
  // an emitted event name is spelled whole: `onClick`, or Lit's `press` and `open-change`
  if (lex.events.get(from) === to) return 'event name';
  if (from.includes('-')) {
    if (kebabProp(from, lex) === to) return 'attribute name';
    return kebabName(from, lex.anatomy) === to ? 'anatomy part' : null;
  }
  if (lex.props.get(from) === to) return 'prop name';
  if (lex.anatomy.get(from) === to) return 'anatomy part';
  if (from.startsWith(lex.camelFrom) && /^[A-Z]/.test(from.charAt(lex.camelFrom.length))) {
    const rest = from.slice(lex.camelFrom.length);
    if (to === lex.camelTo + (stemmed(rest, lex.components) ?? rest)) return 'namespace identifier';
  }
  return null;
}

// ---------------------------------------------------------------- comparing two files

/** A name-shaped run of characters — an identifier, a CSS custom property, a class name, a kebab
 *  attribute — and everything between two of them. The dashed continuation excludes `$` on purpose:
 *  a class name is built in a template literal (`` `ds-disclosure${…}` ``), and a token that ate the
 *  `$` would be a name neither file actually contains. */
const TOKEN = /(?:--)?[A-Za-z_$][A-Za-z0-9_$]*(?:[-_][A-Za-z0-9_]+)*/g;

export function tokenize(text: string): { tokens: string[]; gaps: string[] } {
  const tokens: string[] = [];
  const gaps: string[] = [];
  let at = 0;
  for (const m of text.matchAll(TOKEN)) {
    gaps.push(text.slice(at, m.index));
    tokens.push(m[0]);
    at = (m.index as number) + m[0].length;
  }
  gaps.push(text.slice(at));
  return { tokens, gaps };
}

/**
 * The canonical vocabulary, extracted from a file's text: the hooks the behavior and keyboard gates
 * find a component through, the accessibility attributes, the element names, and every token
 * reference that is not one of the component's own prefixed hooks.
 *
 * None of it may move, so both sides are extracted the same way and the two lists are compared. The
 * component hooks are excluded by prefix — they are the one kind of custom property the doc *does*
 * rename — and the prefix is passed in so each side is read in its own vocabulary.
 */
export function protectedVocabulary(text: string, cssPrefix: string): string[] {
  const out: string[] = [];
  const push = (kind: string, value: string): void => {
    out.push(`${kind} ${value}`);
  };
  for (const m of text.matchAll(/\b(data-ds|data-part|part|testID)\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|\{([^{}\n]*)\})/g)) {
    push('hook', `${m[1] as string}=${m[2] ?? m[3] ?? m[4] ?? ''}`);
  }
  for (const m of text.matchAll(/::part\(([^)\n]*)\)/g)) push('hook', `::part(${m[1] as string})`);
  for (const m of text.matchAll(/\baria-[a-z-]+/g)) push('aria', m[0]);
  for (const m of text.matchAll(/\brole\s*=\s*(?:"([^"\n]*)"|'([^'\n]*)'|\{([^{}\n]*)\})/g)) push('role', m[1] ?? m[2] ?? m[3] ?? '');
  for (const m of text.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
    const name = m[1] as string;
    if (!name.startsWith(`--${cssPrefix}-`)) push('token', name);
  }
  for (const m of text.matchAll(/<\/?([a-z][a-z0-9]*)[\s/>]/g)) push('element', m[1] as string);
  return pySorted(out);
}

export type Difference = { category: Category; from: string; to: string; count: number };

export type FileDiff = {
  pair: Pairing;
  tokens: number;
  changed: number;
  differences: Difference[];
  findings: string[];
};

/** One renamed file against the canonical file it was generated from. */
export function compare(pair: Pairing, brandText: string, canonical: string, lex: Lexicon): FileDiff {
  const findings: string[] = [];
  const counts = new Map<string, Difference>();
  const a = tokenize(canonical);
  const b = tokenize(brandText);
  const where = `${pair.dir}/${pair.brand}`;

  if (pair.brand !== pair.canonical) {
    const expected = pair.canonical.replace(/[A-Za-z0-9]+/g, (id) => (/^[A-Z]/.test(id) ? (stemmed(id, lex.components) ?? id) : id));
    if (expected !== pair.brand) findings.push(`${where}: file name is not ${expected}, which is all the component map accounts for`);
    else counts.set(`file name ${pair.canonical}`, { category: 'file name', from: pair.canonical, to: pair.brand, count: 1 });
  }
  if (a.tokens.length !== b.tokens.length) {
    findings.push(`${where}: ${a.tokens.length} name(s) in the canonical file, ${b.tokens.length} in the renamed one — a rename cannot add or drop one`);
    return { pair, tokens: a.tokens.length, changed: -1, differences: [...counts.values()], findings };
  }
  for (let i = 0; i < a.gaps.length; i++) {
    if (a.gaps[i] !== b.gaps[i]) {
      findings.push(`${where}: the text between names differs around \`${(a.tokens[i - 1] ?? '') + (a.gaps[i] as string)}\` — structure, not an identifier`);
      break;
    }
  }
  let changed = 0;
  for (let i = 0; i < a.tokens.length; i++) {
    const from = a.tokens[i] as string;
    const to = b.tokens[i] as string;
    if (from === to) continue;
    changed += 1;
    const category = explain(from, to, lex);
    if (category === null) {
      findings.push(`${where}: \`${from}\` → \`${to}\` is not a rename themes/${BRAND}/naming.md asks for`);
      continue;
    }
    const key = `${category} ${from}`;
    const seen = counts.get(key);
    if (seen === undefined) counts.set(key, { category, from, to, count: 1 });
    else seen.count += 1;
  }
  const before = protectedVocabulary(canonical, lex.cssFrom);
  const after = protectedVocabulary(brandText, lex.cssTo);
  for (const entry of before) {
    if (!after.includes(entry)) findings.push(`${where}: the canonical \`${entry}\` is not in the renamed file`);
  }
  for (const entry of after) {
    if (!before.includes(entry)) findings.push(`${where}: the renamed file grew \`${entry}\`, which the canonical file does not have`);
  }
  return { pair, tokens: a.tokens.length, changed, differences: [...counts.values()], findings };
}

/** Every file of a built tree, compared with its canonical original. */
export function compareAll(built: Built): FileDiff[] {
  const lex = lexicon(built.resolution);
  return built.pairs.map((pair) => compare(pair, readFileSync(join(built.out, pair.dir, pair.brand), 'utf8'), canonicalText(pair), lex));
}

// ---------------------------------------------------------------- the report

const CATEGORY_ORDER: Category[] = [
  'file name',
  'component name',
  'prop name',
  'event name',
  'attribute name',
  'anatomy part',
  'class or custom-element name',
  'CSS custom-property prefix',
  'namespace identifier',
  'package scope',
];

function table(rows: string[][]): string {
  const widths = rows[0]?.map((_c, i) => Math.max(...rows.map((r) => (r[i] as string).length))) ?? [];
  const line = (r: string[]): string => `| ${r.map((c, i) => ljust(c, widths[i] as number)).join(' | ')} |`;
  const rule = `| ${widths.map((w) => '-'.repeat(w)).join(' | ')} |`;
  return [line(rows[0] as string[]), rule, ...rows.slice(1).map(line)].join('\n');
}

export function report(built: Built, diffs: FileDiff[], collisions: { pair: Pairing; canonical: string; reverted: string }[] = []): string {
  const res = built.resolution;
  const total = diffs.reduce((n, d) => n + Math.max(d.changed, 0), 0);
  const findings = diffs.flatMap((d) => d.findings);
  const byCategory = new Map<Category, number>();
  for (const d of diffs) for (const diff of d.differences) byCategory.set(diff.category, (byCategory.get(diff.category) ?? 0) + diff.count);

  const lines: string[] = [
    '# The renamed tree, against the canonical one',
    '',
    `Generated by \`pnpm demo:naming\` (tools/naming_demo.ts) from \`themes/${BRAND}/naming.md\`. Do not edit.`,
    '',
    'Every file in `src/` and `behavior/` is tokenized beside the file in `packages/react/src` or',
    '`generated/behavior` it was generated from. The comparison has three parts, and all three have to',
    'hold for the mechanism to be what it claims to be:',
    '',
    '1. **Same shape.** The two files produce the same number of names, separated by byte-identical',
    '   text. Nothing about the JSX, the nesting, the order of props, the comments or the whitespace',
    '   can differ without failing here.',
    '2. **Every differing name is one the naming doc moves**, classified below. The classifier reads',
    '   the doc, not `tools/naming.ts`, so the two are independent readings of the same map.',
    '3. **The canonical vocabulary is untouched**: every `data-ds` / `data-part` / `part` hook, every',
    '   `role` and `aria-*`, every `var(--token)` that is not one of the component’s own prefixed',
    '   hooks, and every HTML element name appears in the renamed file exactly as it does in the',
    '   canonical one.',
    '',
    `**Result: ${total} name(s) differ across ${diffs.length} file(s), ${findings.length} of them unexplained.**`,
    '',
    '## What moved, by kind',
    '',
    table([
      ['Kind of identifier', 'Occurrences'],
      ...CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => [c, String(byCategory.get(c) as number)]),
    ]),
    '',
    '## File by file',
    '',
    table([
      ['Canonical', 'Renamed', 'Names', 'Differ', 'Kinds'],
      ...diffs.map((d) => [
        `${d.pair.dir}/${d.pair.canonical}`,
        d.pair.brand === d.pair.canonical ? '(same name)' : d.pair.brand,
        String(d.tokens),
        String(Math.max(d.changed, 0)),
        pySorted([...new Set(d.differences.map((x) => x.category))]).join(', ') || '—',
      ]),
    ]),
    '',
    '## Every rename, spelled out',
    '',
    table([
      ['Canonical', 'Demo Brand', 'Kind', 'Occurrences'],
      ...pySorted([
        ...new Set(
          diffs.flatMap((d) => d.differences.map((x) => `${x.from} ${x.to} ${x.category}`)),
        ),
      ]).map((key) => {
        const [from, to, category] = key.split(' ') as [string, string, string];
        const count = diffs.reduce((n, d) => n + d.differences.filter((x) => x.from === from && x.to === to).reduce((m, x) => m + x.count, 0), 0);
        return [`\`${from}\``, `\`${to}\``, category, String(count)];
      }),
    ]),
    '',
  ];
  if (findings.length > 0) {
    lines.push('## Unexplained differences', '');
    for (const f of findings) lines.push(`- ${f}`);
    lines.push('');
  }
  lines.push(
    '## Prose collisions',
    '',
    'A rename runs in both directions: a generation renames a fork’s committed tree back to canonical',
    'names so the gates never see a brand name, and renames it forward again afterwards. That trip —',
    'brand → canonical → brand — is byte-for-byte exact, and `pnpm demo:naming:gates` checks it.',
    '',
    'The other direction is not exact, and this is where it is not. A brand name that is *also an',
    'ordinary word in the canonical prose* is read as the brand’s name on the way back, so a comment',
    'changes wording. It never reaches the fork’s disk (the forward pass restores it) and no gate reads',
    'English, but it is worth knowing when choosing a brand name.',
    '',
    collisions.length === 0
      ? 'None: no brand name in this doc is a word the canonical files already use.'
      : table([
          ['File', 'Canonical', 'After a revert'],
          ...collisions.map((c) => [`${c.pair.dir}/${c.pair.canonical}`, c.canonical, c.reverted]),
        ]),
    '',
    '## Compatibility layer',
    '',
    `The \`aliases\` in \`themes/${BRAND}/naming.md\` keep Demo Brand's old names working beside the new ones.`,
    'The model never writes these: `tools/naming.ts` does, when it applies the rename, into `src/naming-compat/`,',
    'and a revert deletes the folder before it renames anything back.',
    '',
    aliasRows(built).length === 0
      ? 'None: the doc has no aliases.'
      : table([
          ['Alias', 'Kind', 'Since', 'File', 'Keeps working'],
          ...aliasRows(built).map((r) => [`\`${r.name}\``, r.kind, r.since ?? '—', r.file === null ? '(not written)' : `\`${r.file}\``, r.keeps]),
        ]),
    '',
    ...(built.compat.includes(`${naming.COMPAT_DIR}/index.ts`) ? [`\`src/${naming.COMPAT_DIR}/index.ts\` re-exports every module in the folder; exposing it is the fork’s own manifest edit.`, ''] : []),
    'These files are not in the file-by-file comparison above because they have no canonical original to be',
    'compared with: nothing in `packages/react/src` is their source. What checks them instead is the demo’s',
    '`tsc -p demo-brand`, whose `include: ["src"]` reaches subfolders, so the wrapper typechecks against the',
    'renamed component it wraps under the package’s own compiler options, and `lint-literals`, whose',
    '`sourceFiles` walk is recursive. The round-trip gate checks that a revert deletes the folder and a',
    're-apply writes every file back byte for byte.',
    '',
    '## What a reader should check by hand',
    '',
    `- \`src/${renamed('Button', res)}.tsx\` still writes \`data-ds="Button"\` and \`data-part="leadingIcon"\`.`,
    `  Those are how the derived gates find it, and they are canonical everywhere.`,
    `- \`src/${renamed('Alert', res)}.tsx\` composes \`<${renamed('Button', res)} …>\` and \`<Icon …>\`: the rename reaches a`,
    '  composite without the map saying anything about it, and leaves the component it does not name alone.',
    `- \`src/${renamed('Button', res)}.css\` still reads \`var(--color-action-primary-background)\`. A token path is`,
    `  canonical schema; only the component’s own \`--${res.cssPrefix}-button-*\` hooks take the brand prefix.`,
    '',
  );
  return lines.join('\n');
}

function renamed(name: string, res: naming.Resolution): string {
  return res.components[name] ?? name;
}

/**
 * The same result as data, for the comparison page at /docs/naming-demo.
 *
 * The website renders the rename tables from this rather than from a second copy of the maps typed
 * into a page: what a reader sees beside the two live components is what the diff actually found.
 */
export function summary(built: Built, diffs: FileDiff[]): unknown {
  const res = built.resolution;
  const identifiers = new Map<string, { from: string; to: string; category: Category; count: number }>();
  for (const d of diffs) {
    for (const diff of d.differences) {
      if (diff.category === 'file name') continue; // the file table below says these
      const seen = identifiers.get(`${diff.from} ${diff.to}`);
      if (seen === undefined) identifiers.set(`${diff.from} ${diff.to}`, { ...diff });
      else seen.count += diff.count;
    }
  }
  return {
    source: relative(paths.ROOT, res.source as string).replaceAll('\\', '/'),
    namespace: { package: res.package, cssPrefix: res.cssPrefix },
    components: Object.fromEntries(pySorted(Object.keys(res.components)).map((k) => [k, res.components[k] as string])),
    props: Object.fromEntries(pySorted(Object.keys(res.props)).map((k) => [k, res.props[k] as string])),
    unexplained: diffs.flatMap((d) => d.findings),
    files: diffs.map((d) => ({ dir: d.pair.dir, canonical: d.pair.canonical, brand: d.pair.brand, names: d.tokens, differ: Math.max(d.changed, 0) })),
    identifiers: [...identifiers.values()].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || (a.from < b.from ? -1 : a.from > b.from ? 1 : 0),
    ),
    aliases: aliasRows(built).map(({ kind, name, now, component, since, file }) => ({ kind, name, now, component, since, file })),
    compat: built.compat.map((f) => `src/${f}`),
  };
}

// ---------------------------------------------------------------- gates

type GateResult = { name: string; ok: boolean; detail: string };

/** One child process, the way tools/checks.ts spawns them: a `.cmd` on Windows needs a shell, and
 *  the argv is pre-quoted for it. */
function capture(argv: string[], cwd: string): { status: number; output: string } {
  const options = { cwd, env: { ...process.env, FORCE_COLOR: '0' }, encoding: 'buffer' as const, timeout: 900_000, maxBuffer: 64 * 1024 * 1024 };
  const p =
    process.platform === 'win32'
      ? spawnSync(argv.map(winQuote).join(' '), { ...options, shell: true })
      : spawnSync(argv[0] as string, argv.slice(1), options);
  const text = (b: Buffer | null): string => (b ?? Buffer.alloc(0)).toString('utf8').replace(/\r\n?/g, '\n').trim();
  return { status: p.status ?? 1, output: `${text(p.stdout)}\n${text(p.stderr)}`.trim() };
}

function run(name: string, argv: string[], cwd: string = paths.ROOT): GateResult {
  const { status, output } = capture(argv, cwd);
  const lines = output.split('\n').filter((l) => l.trim() !== '');
  return { name, ok: status === 0, detail: status === 0 ? (lines[lines.length - 1] ?? '') : output };
}

function node(): string {
  return which('node') ?? 'node';
}

function pnpm(): string {
  return which('pnpm') ?? which('pnpm.cmd') ?? 'pnpm';
}

function tool(file: string, ...args: string[]): string[] {
  return [node(), '--import', 'tsx', join(paths.ROOT, 'tools', file), ...args];
}

/**
 * The property a fork actually depends on: **brand → canonical → brand is the identity**.
 *
 * A generation with `--naming` starts by renaming a fork's committed tree back to canonical names so
 * the gates never see a brand name, and ends by renaming it forward again. So what has to be exact is
 * the trip the fork's own files take: revert, re-apply, and every byte is where it was — otherwise a
 * fork gets a diff in its working tree for having run the generator.
 *
 * The *other* direction is not an identity, and this reports where it is not: a brand name that is
 * also an ordinary word in the canonical prose comes back as the canonical name it was mapped from.
 * `Button.variant: emphasis` is exactly that case — Button's own JSDoc already says "Visual
 * emphasis", so the revert reads it as the brand's `emphasis` and writes "Visual variant". It costs
 * a reworded sentence in the canonical tree a gate sees for one round and never reaches disk in the
 * fork, which is why it is reported here rather than failed on. See DIFF.md, "Prose collisions".
 */
export function roundTrip(built: Built): GateResult {
  const scratch = mkdtempSync(join(tmpdir(), 'ds-naming-demo-'));
  const options = (sub: string): naming.RenameOptions => ({ compat: sub === 'src' });
  try {
    for (const sub of ['src', 'behavior']) cpSync(join(built.out, sub), join(scratch, sub), { recursive: true });
    for (const sub of ['src', 'behavior']) naming.rename(join(scratch, sub), built.resolution, 'canonical', 'web', false, options(sub));
    const bad: string[] = [];
    const reworded: string[] = [];
    if (existsSync(join(scratch, 'src', naming.COMPAT_DIR))) bad.push(`src/${naming.COMPAT_DIR} survives the revert`);
    for (const pair of built.pairs) {
      const back = join(scratch, pair.dir, pair.canonical);
      if (!existsSync(back)) bad.push(`${pair.dir}/${pair.brand} reverts to a name that is not ${pair.canonical}`);
      else if (readFileSync(back, 'utf8') !== canonicalText(pair)) reworded.push(`${pair.dir}/${pair.canonical}`);
    }
    for (const sub of ['src', 'behavior']) naming.rename(join(scratch, sub), built.resolution, 'brand', 'web', false, options(sub));
    for (const pair of built.pairs) {
      const there = join(scratch, pair.dir, pair.brand);
      if (!existsSync(there)) bad.push(`${pair.dir}/${pair.brand} does not survive a revert and a re-apply`);
      else if (readFileSync(there, 'utf8') !== readFileSync(join(built.out, pair.dir, pair.brand), 'utf8')) {
        bad.push(`${pair.dir}/${pair.brand} does not come back byte for byte`);
      }
    }
    for (const file of built.compat) {
      const there = join(scratch, 'src', file);
      if (!existsSync(there)) bad.push(`src/${file} is not written again by the re-apply`);
      else if (readFileSync(there, 'utf8') !== readFileSync(join(built.out, 'src', file), 'utf8')) bad.push(`src/${file} does not come back byte for byte`);
    }
    const note = reworded.length === 0 ? '' : `; ${reworded.length} file(s) whose canonical prose the revert rewords (${reworded.join(', ')})`;
    const layer = built.compat.length === 0 ? '' : `, ${built.compat.length} compat file(s) deleted and rewritten`;
    return { name: 'round-trip', ok: bad.length === 0, detail: bad.length === 0 ? `${built.pairs.length} file(s) revert and re-apply byte for byte${layer}${note}` : bad.join('; ') };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** The files whose canonical text the revert does not reproduce exactly — see `roundTrip`. */
export function proseCollisions(built: Built): { pair: Pairing; canonical: string; reverted: string }[] {
  const scratch = mkdtempSync(join(tmpdir(), 'ds-naming-prose-'));
  try {
    for (const sub of ['src', 'behavior']) cpSync(join(built.out, sub), join(scratch, sub), { recursive: true });
    for (const sub of ['src', 'behavior']) naming.rename(join(scratch, sub), built.resolution, 'canonical', 'web', false, { compat: sub === 'src' });
    const out: { pair: Pairing; canonical: string; reverted: string }[] = [];
    for (const pair of built.pairs) {
      const back = join(scratch, pair.dir, pair.canonical);
      if (!existsSync(back)) continue;
      const before = canonicalText(pair).split('\n');
      const after = readFileSync(back, 'utf8').split('\n');
      for (let i = 0; i < Math.max(before.length, after.length); i++) {
        if (before[i] !== after[i]) out.push({ pair, canonical: (before[i] ?? '').trim(), reverted: (after[i] ?? '').trim() });
      }
    }
    return out;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/**
 * The keyboard gate's derivation, run into a scratch directory and byte-compared with the committed
 * `generated/keyboard`. A naming doc is not an input to tools/keyboard_tests.ts — it reads the
 * component docs and nothing else — so the specs cannot move; this is what makes that a check rather
 * than an assertion, and it does it without writing to the canonical output.
 */
async function keyboardSpecs(): Promise<GateResult> {
  const kb = await import('./keyboard_tests.ts');
  const scratch = mkdtempSync(join(tmpdir(), 'ds-naming-kb-'));
  const before = kb.paths.OUT;
  const write = process.stdout.write.bind(process.stdout);
  try {
    kb.paths.OUT = scratch;
    process.stdout.write = (() => true) as typeof process.stdout.write; // its summary line is not this gate's output
    kb.main();
    process.stdout.write = write;
    const names = sortedNames(readdirSync(scratch));
    const bad = names.filter((n) => !existsSync(join(paths.KEYBOARD, n)) || readFileSync(join(scratch, n), 'utf8') !== readFileSync(join(paths.KEYBOARD, n), 'utf8'));
    return { name: 'keyboard', ok: bad.length === 0, detail: bad.length === 0 ? `${names.length} derived spec(s) unchanged by the naming doc` : `differs: ${bad.slice(0, 4).join(', ')}` };
  } finally {
    process.stdout.write = write;
    kb.paths.OUT = before;
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** One test's result, keyed so the two builds can be lined up: `<file> :: <describe> > <test>`. */
type Outcomes = Map<string, string>;

/** A brand name back to the canonical one, in any text: `CtaButton.web.test.tsx` and the
 *  `describe('CtaButton')` it contains both become what the canonical build calls them. */
function toCanonicalNames(text: string, res: naming.Resolution): string {
  let out = text;
  for (const [canonical, brand] of Object.entries(res.components).sort((a, b) => b[1].length - a[1].length)) {
    out = out.replaceAll(new RegExp(String.raw`(?<![A-Za-z0-9])${brand}(?![A-Za-z0-9])`, 'g'), canonical);
  }
  return out;
}

function vitest(argv: string[], res: naming.Resolution): { outcomes: Outcomes; output: string } {
  const scratch = mkdtempSync(join(tmpdir(), 'ds-naming-vitest-'));
  const file = join(scratch, 'results.json');
  try {
    const { output } = capture([...argv, '--reporter=json', `--outputFile=${file}`], join(paths.ROOT, 'packages', 'react'));
    if (!existsSync(file)) return { outcomes: new Map(), output };
    const report = JSON.parse(readFileSync(file, 'utf8')) as {
      testResults?: { name: string; assertionResults?: { fullName: string; status: string }[] }[];
    };
    const outcomes: Outcomes = new Map();
    for (const suite of report.testResults ?? []) {
      const where = toCanonicalNames(basename(suite.name), res);
      for (const t of suite.assertionResults ?? []) outcomes.set(`${where} :: ${toCanonicalNames(t.fullName, res)}`, t.status);
    }
    return { outcomes, output };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/**
 * The behavior gate, as a *parity* check rather than a green one.
 *
 * The derived scenarios are run twice — the canonical files against `packages/react/src`, and their
 * renamed copies against the renamed tree — and every test has to reach the same verdict in both.
 * The job's gate is "the renamed build passes every gate exactly as the canonical build does", and
 * that is the stronger reading as well as the honest one: `Button`'s `press-tracks` scenario fails
 * on the canonical build today (the doc says `onTrack` takes an object, the component passes two
 * arguments — a generation bug, not a naming one), and a gate that demanded green here would be
 * reporting on that instead of on the rename. A rename that changed *any* verdict, in either
 * direction, fails.
 */
function behaviorParity(built: Built): GateResult {
  const res = built.resolution;
  const pkg = relative(join(paths.ROOT, 'packages', 'react'), built.out).replaceAll('\\', '/');
  const filters = built.pairs
    .filter((p) => p.canonical.endsWith('.test.tsx'))
    .map((p) => (p.dir === 'src' ? `src/${p.canonical}` : `../../generated/behavior/${p.canonical}`));
  const canonical = vitest([pnpm(), 'exec', 'vitest', 'run', ...filters], res);
  const brand = vitest([pnpm(), 'exec', 'vitest', 'run', '--config', `${pkg}/vitest.config.ts`], res);
  if (canonical.outcomes.size === 0 || brand.outcomes.size === 0) {
    return { name: 'behavior', ok: false, detail: `no results:\n${canonical.outcomes.size === 0 ? canonical.output : brand.output}` };
  }
  const differ: string[] = [];
  for (const [key, status] of canonical.outcomes) {
    const other = brand.outcomes.get(key);
    if (other === undefined) differ.push(`${key}: the renamed build has no such test`);
    else if (other !== status) differ.push(`${key}: ${status} canonically, ${other} renamed`);
  }
  for (const key of brand.outcomes.keys()) if (!canonical.outcomes.has(key)) differ.push(`${key}: only the renamed build has it`);
  const failed = [...canonical.outcomes.values()].filter((s) => s !== 'passed').length;
  return {
    name: 'behavior',
    ok: differ.length === 0,
    detail:
      differ.length === 0
        ? `${canonical.outcomes.size} scenario(s), same verdict on both builds` + (failed === 0 ? '' : ` (${failed} failing on both — see the note in tools/naming_demo.ts)`)
        : differ.join('; '),
  };
}

function sourceFiles(built: Built): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of sortedNames(readdirSync(dir))) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(paths.ROOT, full));
    }
  };
  walk(join(built.out, 'src'));
  return out;
}

export async function gates(built: Built, diffs: FileDiff[]): Promise<GateResult[]> {
  const findings = diffs.flatMap((d) => d.findings);
  const changed = diffs.reduce((n, d) => n + Math.max(d.changed, 0), 0);
  const pkg = relative(join(paths.ROOT, 'packages', 'react'), built.out).replaceAll('\\', '/');
  return [
    { name: 'diff', ok: findings.length === 0, detail: findings.length === 0 ? `${changed} difference(s), every one an identifier` : findings.slice(0, 4).join('; ') },
    roundTrip(built),
    run('contrast', tool('check_contrast.ts')),
    await keyboardSpecs(),
    run('literals', tool('lint_literals.ts', '--files', ...sourceFiles(built))),
    run('typecheck', [pnpm(), '--filter', '@design-schema/react', 'exec', 'tsc', '-p', pkg]),
    behaviorParity(built),
  ];
}

// ---------------------------------------------------------------- command line

const USAGE = 'usage: naming_demo.ts [--check | --gates] [--out DIR]';

const HELP = `${USAGE}

Rebuild packages/react/demo-brand from packages/react/src under themes/${BRAND}/naming.md, and
diff the result against the canonical components it came from.

options:
  -h, --help    show this help message and exit
  --check       rebuild into a scratch directory and compare: the committed tree must be current,
                and every difference from the canonical build must be an identifier
  --gates       run every gate against the renamed tree
  --out DIR     build somewhere else (default: packages/react/demo-brand)
`;

/** The two files the build writes beside the tree: the diff for a reader, and the same result as
 *  data for the website's comparison page. */
function derived(built: Built, diffs: FileDiff[], collisions: { pair: Pairing; canonical: string; reverted: string }[]): [string, string][] {
  return [
    ['DIFF.md', report(built, diffs, collisions)],
    ['renames.json', `${JSON.stringify(summary(built, diffs), null, 2)}\n`],
  ];
}

function treeFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (at: string): void => {
    for (const name of sortedNames(readdirSync(at))) {
      const full = join(at, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.push(relative(dir, full).replaceAll('\\', '/'));
    }
  };
  for (const sub of ['src', 'behavior']) if (existsSync(join(dir, sub))) walk(join(dir, sub));
  return out;
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let mode: 'write' | 'check' | 'gates' = 'write';
  let out = paths.OUT;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(HELP);
      return 0;
    } else if (arg === '--check') mode = 'check';
    else if (arg === '--gates') mode = 'gates';
    else if (arg === '--out') {
      const v = argv[++i];
      if (v === undefined) throw new DemoError(`${USAGE}\nnaming_demo.ts: error: argument --out: expected one argument`);
      out = resolve(paths.ROOT, v);
    } else {
      process.stderr.write(`${USAGE}\nnaming_demo.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }

  if (mode === 'check') {
    const scratch = mkdtempSync(join(tmpdir(), 'ds-naming-demo-'));
    try {
      const built = build(scratch);
      const diffs = compareAll(built);
      const findings = diffs.flatMap((d) => d.findings);
      const stale: string[] = [];
      const committed = treeFiles(out);
      const fresh = treeFiles(scratch);
      for (const file of fresh) {
        if (!committed.includes(file)) stale.push(`missing: ${file}`);
        else if (readFileSync(join(scratch, file), 'utf8') !== readFileSync(join(out, file), 'utf8')) stale.push(`differs: ${file}`);
      }
      for (const file of committed) if (!fresh.includes(file)) stale.push(`not generated any more: ${file}`);
      for (const [name, text] of derived({ ...built, out }, diffs, proseCollisions(built))) {
        if (!existsSync(join(out, name)) || readText(join(out, name)) !== text) stale.push(`differs: ${name}`);
      }
      for (const f of findings) process.stdout.write(`✖ ${f}\n`);
      for (const s of stale) process.stdout.write(`✖ ${s}\n`);
      if (findings.length + stale.length > 0) {
        process.stdout.write(`✖ naming demo: ${findings.length} unexplained difference(s), ${stale.length} stale file(s) — re-run \`pnpm demo:naming\`\n`);
        return 1;
      }
      const changed = diffs.reduce((n, d) => n + d.changed, 0);
      process.stdout.write(`✔ naming demo: ${fresh.length} file(s) current, ${changed} difference(s) from the canonical build, every one an identifier\n`);
      return 0;
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  }

  const built = build(out);
  const diffs = compareAll(built);
  for (const [name, text] of derived(built, diffs, proseCollisions(built))) writeFileSync(join(out, name), text, 'utf8');
  const findings = diffs.flatMap((d) => d.findings);
  for (const f of findings) process.stdout.write(`✖ ${f}\n`);
  const changed = diffs.reduce((n, d) => n + Math.max(d.changed, 0), 0);
  process.stdout.write(
    `${findings.length ? '✖' : '✔'} naming demo: ${built.pairs.length} file(s) → ${relative(paths.ROOT, out).replaceAll('\\', '/')}, ` +
      `${changed} difference(s) from the canonical build, ${findings.length} unexplained\n`,
  );
  if (mode !== 'gates') return findings.length > 0 ? 1 : 0;

  process.stdout.write('== gates against the renamed tree\n');
  const results = await gates(built, diffs);
  for (const r of results) process.stdout.write(`  ${r.ok ? '✔' : '✖'} ${ljust(r.name, 10)} ${[...(r.detail.split('\n')[0] ?? '')].slice(0, 110).join('')}\n`);
  const bad = results.filter((r) => !r.ok);
  for (const r of bad) process.stdout.write(`\n--- ${r.name}\n${[...r.detail].slice(-3000).join('')}\n`);
  return bad.length > 0 ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    process.exitCode = await main();
  } catch (e) {
    process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
    process.exitCode = 1;
  }
}
