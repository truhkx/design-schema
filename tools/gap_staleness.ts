#!/usr/bin/env node
/**
 * Gap staleness — which gap files have rounds that were never folded.
 *
 * generated/gaps/folded.json maps each gap file name to the mtime it was last folded at (local time,
 * `YYYY-MM-DDTHH:MM:SS`). A gap file is stale when it has a `## <when> — round <n>` heading newer than its
 * entry, or rounds and no entry at all. prompts/fold-gaps.md runs this instead of comparing `ls` output against
 * folded.json by hand.
 *
 * The round headings decide, not the file's mtime: a checkout, merge or `git stash pop` rewrites every gap file
 * without adding a round, and an mtime comparison would then call all of them stale. Headings are written to
 * the minute, so the entry is cut to the minute before comparing (the round a fold read is not stale for the
 * seconds the heading dropped).
 *
 * Only `<Name>.<platform>.md` files are gap files; SUMMARY.md, TOOLING.md, CODE.md, FOLDS.md and the other
 * ledgers are not.
 *
 * Usage:  node --import tsx tools/gap_staleness.ts [--json]
 *
 *   (default)  one line per stale file, then a count; exit 0 whether or not anything is stale
 *   --json     the stale files as `{ "<file>": "<current mtime>" }`, ready to merge into folded.json
 *
 * Reads only; never writes folded.json.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readText, sortedNames } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = { ROOT: REPO_ROOT, GAPS: join(REPO_ROOT, 'generated', 'gaps') };

const GAP_FILE = /^[A-Za-z0-9]+\.[a-z]+\.md$/;
const ROUND = /^## (\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}).* — round \d+\s*$/gm;
const MINUTE = 'YYYY-MM-DDTHH:MM'.length;

export type Stale = { file: string; rounds: number; newest: string; folded: string | null; mtime: string };

/** A local-time `YYYY-MM-DDTHH:MM:SS`, the format folded.json is written in. */
export function localStamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Every round heading's time as `YYYY-MM-DDTHH:MM`, in file order. */
export function roundTimes(text: string): string[] {
  return [...text.matchAll(ROUND)].map((m) => `${m[1]}T${m[2]}`);
}

/** The rounds newer than the entry, compared to the minute; with no entry, every round. */
export function unfolded(rounds: string[], folded: string | null): string[] {
  return folded === null ? rounds : rounds.filter((r) => r > folded.slice(0, MINUTE));
}

export function readFolded(gapsDir: string): Record<string, string> {
  const file = join(gapsDir, 'folded.json');
  if (!existsSync(file)) return {};
  const raw = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(raw).filter((e): e is [string, string] => !e[0].startsWith('_') && typeof e[1] === 'string'));
}

/** Every gap file with an unfolded round, in name order, and how many gap files there are. */
export function staleGapFiles(gapsDir: string = paths.GAPS): { stale: Stale[]; total: number } {
  const names = existsSync(gapsDir) ? sortedNames(readdirSync(gapsDir).filter((n) => GAP_FILE.test(n))) : [];
  const folded = readFolded(gapsDir);
  const stale: Stale[] = [];
  for (const file of names) {
    const path = join(gapsDir, file);
    const entry = folded[file] ?? null;
    const open = unfolded(roundTimes(readText(path)), entry);
    if (!open.length) continue;
    stale.push({ file, rounds: open.length, newest: open.reduce((a, b) => (b > a ? b : a)), folded: entry, mtime: localStamp(statSync(path).mtime) });
  }
  return { stale, total: names.length };
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const usage = 'usage: gap_staleness.ts [-h] [--json]';
  const unknown = argv.find((a) => !['--json', '-h', '--help'].includes(a));
  if (unknown !== undefined) {
    process.stderr.write(`${usage}\ngap_staleness.ts: error: unrecognized arguments: ${unknown}\n`);
    return 2;
  }
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write(`${usage}\n`);
    return 0;
  }
  const { stale, total } = staleGapFiles(paths.GAPS);
  if (argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(Object.fromEntries(stale.map((s) => [s.file, s.mtime])), null, 2)}\n`);
    return 0;
  }
  const width = Math.max(0, ...stale.map((s) => s.file.length));
  for (const s of stale) {
    const since = s.folded === null ? 'never folded' : `folded ${s.folded}`;
    process.stdout.write(`stale  ${s.file.padEnd(width)}  ${s.rounds} round(s), newest ${s.newest}  (${since})\n`);
  }
  const shown = relative(paths.ROOT, join(paths.GAPS, 'folded.json')).replaceAll('\\', '/');
  process.stdout.write(`✔ gap staleness: ${stale.length} of ${total} gap file(s) have rounds newer than ${shown}\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
