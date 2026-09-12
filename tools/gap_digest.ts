#!/usr/bin/env node
/**
 * Gap digest — what the generator had to guess, sorted by who has to act on it.
 *
 * regen.ps1 pauses between phases so the gaps can be folded into the docs before the next phase composes
 * those components. This reads every generated/gaps/<Name>.<platform>.md (the per-round bullet lists the
 * generator reports) and every generated/generate.lock*.json (gate results) and writes
 * generated/gaps/SUMMARY.md: one section per component, newest round first, each line classified as
 *
 *   DOC      the doc was ambiguous or silent — fix site/src/content/docs/components/<name>.md
 *   CODE     a pre-existing bug the model fixed or worked around — review the fix, then encode the rule
 *   TOOLING  the environment got in the way (permission denied, missing node_modules, a gate that could not run)
 *   NOISE    a repeat of an earlier line in the same file, or "no changes were needed" — collapsed to a count
 *
 * DOC lines come first, with the doc path the fix belongs in. The digest ends with a checklist of every
 * target whose gates failed, and which gate, from the lockfiles.
 *
 * Usage:  node tools/gap_digest.ts [--phase Core] [--out generated/gaps/SUMMARY.md]
 *
 * Port of tools/gap_digest.py: same flags, same digest, same line on stdout, same exit code.
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pySorted, pySplit, pySplitlines, pyStrip, readText, sortedNames, truthy, writeText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads or writes. The tests point these at a sandbox. */
export const paths = { ROOT: REPO_ROOT, GAPS: join(REPO_ROOT, 'generated', 'gaps'), LOCK_DIR: join(REPO_ROOT, 'generated') };

const DOCS_REL = 'site/src/content/docs/components';

const ROUND = /^## (.+?) — round (\d+)\s*$/gm;
const KEYWORDS: Record<string, string[]> = {
  TOOLING: ['denied', 'could not run', 'no node_modules', 'typecheck could not', 'not installed', 'permission'],
  CODE: ['pre-existing', 'already existed', 'bug'],
  DOC: ['spec does not say', 'unspecified', 'ambiguous', 'chose', 'assumed', 'not stated', 'not specified',
    'spec is silent', 'does not specify', 'interpretation', 'guess'],
};
const NOISE_PHRASES = ['no changes were needed', 'no changes needed', 'nothing to change', 'no gaps'];
const ORDER = ['DOC', 'CODE', 'TOOLING'];

export type Round = { when: string; round: number; lines: [string, string][] };
export type GapFile = { component: string; platform: string; rounds: Round[] };

/** One category per line. A repeat of an earlier line in the same file is NOISE regardless of its words. */
export function classify(line: string, seen: Set<string>): string {
  const key = pySplit(pyStrip(line).toLowerCase()).join(' ');
  if (seen.has(key)) return 'NOISE';
  seen.add(key);
  if (NOISE_PHRASES.some((p) => key.includes(p))) return 'NOISE';
  for (const cat of ['TOOLING', 'CODE', 'DOC']) {
    if ((KEYWORDS[cat] as string[]).some((k) => key.includes(k))) return cat;
  }
  return 'DOC'; // the doc is the default owner of an unexplained guess
}

/** Python's `sorted(key=..., reverse=True)`: descending by (when, round), ties keeping document order. */
function byNewest<T>(items: T[], key: (item: T) => Round): T[] {
  return [...items].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x.when !== y.when) return x.when < y.when ? 1 : -1;
    return y.round - x.round;
  });
}

/** `{component, platform, rounds}` newest round first. */
export function parseGapFile(file: string): GapFile {
  const stem = (file.split(/[\\/]/).pop() as string).replace(/\.[^.]*$/, '');
  const cut = stem.lastIndexOf('.');
  const [component, platform] = cut === -1 ? [stem, ''] : [stem.slice(0, cut), stem.slice(cut + 1)];
  const text = readText(file);
  const seen = new Set<string>();
  const rounds: Round[] = [];
  const matches = [...text.matchAll(ROUND)];
  matches.forEach((m, i) => {
    const start = (m.index as number) + m[0].length;
    const body = text.slice(start, i + 1 < matches.length ? (matches[i + 1] as RegExpMatchArray).index : text.length);
    const lines = pySplitlines(body)
      .filter((ln) => ln.startsWith('- '))
      .map((ln) => [classify(ln.slice(2), seen), pyStrip(ln.slice(2))] as [string, string]);
    rounds.push({ when: pyStrip(m[1] as string), round: Number(m[2]), lines });
  });
  return { component, platform, rounds: byNewest(rounds, (r) => r) };
}

/** `[target, [gate, ...]]` for every lock entry with a gate that is false, across every lockfile. */
export function failedGates(lockDir: string): [string, string[]][] {
  const out = new Map<string, string[]>();
  const names = existsSync(lockDir) ? readdirSync(lockDir).filter((n) => n.startsWith('generate.lock') && n.endsWith('.json')) : [];
  for (const name of sortedNames(names)) {
    const entries = JSON.parse(readFileSync(join(lockDir, name), 'utf8')) as Record<string, { gates?: Record<string, unknown> }>;
    for (const [target, entry] of Object.entries(entries)) {
      const gates = truthy(entry.gates) ? (entry.gates as Record<string, unknown>) : {};
      const bad = pySorted(Object.entries(gates).filter(([, ok]) => ok === false).map(([g]) => g));
      if (bad.length) out.set(target, bad);
    }
  }
  return pySorted([...out.keys()]).map((t) => [t, out.get(t) as string[]]);
}

export function digest(gapFiles: GapFile[], failures: [string, string[]][], phase: string | null, now: string): string {
  const title = phase ? `# Gap digest — phase ${phase}` : '# Gap digest';
  const lines = [title, '', `Generated ${now} by tools/gap_digest.ts. DOC lines belong in the named doc; fold them, run \`pnpm parse\`, and the affected targets become stale by prompt hash.`, ''];
  const byComponent = new Map<string, GapFile[]>();
  for (const g of gapFiles) {
    if (!byComponent.has(g.component)) byComponent.set(g.component, []);
    (byComponent.get(g.component) as GapFile[]).push(g);
  }
  const totals = new Map<string, number>([...ORDER, 'NOISE'].map((c) => [c, 0]));
  for (const component of pySorted([...byComponent.keys()])) {
    const doc = `${DOCS_REL}/${component.toLowerCase()}.md`;
    lines.push(`## ${component}`, '', `Doc: \`${doc}\``, '');
    const flat = (byComponent.get(component) as GapFile[]).flatMap((g) => g.rounds.map((r) => [r, g.platform] as [Round, string]));
    for (const [r, platform] of byNewest(flat, ([round]) => round)) {
      let noise = 0;
      for (const [cat] of r.lines) {
        if (cat === 'NOISE') noise += 1;
        totals.set(cat, (totals.get(cat) as number) + 1);
      }
      lines.push(`### ${r.when} — ${platform} round ${r.round}`, '');
      for (const cat of ORDER) {
        for (const [c, t] of r.lines) {
          if (c !== cat) continue;
          lines.push(`- **${cat}** ${t}${cat === 'DOC' ? ` → \`${doc}\`` : ''}`);
        }
      }
      if (noise) lines.push(`- NOISE: ${noise} repeated or empty line(s) collapsed`);
      if (!r.lines.length) lines.push('- (no gaps reported)');
      lines.push('');
    }
  }
  lines.push('## Totals', '', [...totals].map(([c, n]) => `${c}: ${n}`).join(' · '), '');
  lines.push('## Gates to fix', '');
  if (failures.length) lines.push(...failures.map(([target, gates]) => `- [ ] ${target} — ${gates.join(', ')}`));
  else lines.push('- none: every recorded target passed its gates');
  lines.push('');
  return lines.join('\n');
}

/** `datetime.now().isoformat(timespec="minutes")`: local time, to the minute. */
function nowToMinutes(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function build(gapsDir: string = paths.GAPS, lockDir: string = paths.LOCK_DIR, phase: string | null = null, now: string | null = null): string {
  const names = existsSync(gapsDir) ? sortedNames(readdirSync(gapsDir).filter((n) => n.endsWith('.md') && n !== 'SUMMARY.md')) : [];
  return digest(names.map((n) => parseGapFile(join(gapsDir, n))), failedGates(lockDir), phase, now ?? nowToMinutes());
}

export type Args = { phase: string | null; out: string | null };

/** argparse's `--phase` and `--out` (default generated/gaps/SUMMARY.md). */
export function parseArgs(argv: string[], prog: string = 'gap_digest.ts'): Args {
  const usage = `usage: ${prog} [-h] [--phase PHASE] [--out OUT]`;
  const die: (message: string) => never = (message) => {
    process.stderr.write(`${usage}\n${prog}: error: ${message}\n`);
    throw Object.assign(new Error(message), { exitCode: 2 });
  };
  const args: Args = { phase: null, out: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const value = (flag: string): string => {
      const v = arg.startsWith(`${flag}=`) ? arg.slice(flag.length + 1) : argv[++i];
      if (v === undefined) die(`argument ${flag}: expected one argument`);
      return v as string;
    };
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${usage}\n`);
      throw Object.assign(new Error('help'), { exitCode: 0 });
    } else if (arg === '--phase' || arg.startsWith('--phase=')) {
      args.phase = value('--phase');
    } else if (arg === '--out' || arg.startsWith('--out=')) {
      args.out = value('--out');
    } else {
      die(`unrecognized arguments: ${arg}`);
    }
  }
  return args;
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let a: Args;
  try {
    a = parseArgs(argv);
  } catch (e) {
    return (e as { exitCode?: number }).exitCode ?? 2;
  }
  const text = build(paths.GAPS, paths.LOCK_DIR, a.phase);
  const out = a.out ?? join(paths.GAPS, 'SUMMARY.md');
  mkdirSync(dirname(out), { recursive: true });
  writeText(out, text);
  const nDoc = text.split('- **DOC**').length - 1;
  const nGates = pySplitlines(text).filter((ln) => ln.startsWith('- [ ] ')).length;
  const shown = resolve(out).startsWith(resolve(paths.ROOT)) ? relative(paths.ROOT, out) : out;
  process.stdout.write(`✔ gap digest: ${nDoc} DOC line(s), ${nGates} failed target(s) → ${shown}\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
