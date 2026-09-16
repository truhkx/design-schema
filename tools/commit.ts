#!/usr/bin/env node
/**
 * Stage and commit: the one implementation behind `commit.ps1`, `pnpm commit` and the per-phase
 * snapshots of a regen run.
 *
 *   node --import tsx tools/commit.ts -m "regen: phase Core"                       stage everything
 *   node --import tsx tools/commit.ts -m "fold: Button" --paths a.ts,b.ts --paths c.ts   only these paths
 *
 * `pnpm commit -m <message>` is the same command. A bare `--` is ignored, so `pnpm commit -- -m x`
 * works too.
 *
 * Trailers. The commit message is `-m` alone unless trailer lines are configured; configured lines
 * follow it after a blank line. The default is none, because everyone's regen calls this helper and
 * it must not put one person's attribution on another person's commits. The first source that is set
 * wins:
 *
 *   DS_COMMIT_TRAILERS   one run. Split on newlines and on the two characters `\n`, so a one-line
 *                        variable can hold several trailers. Set but empty means none, which turns
 *                        the git config setting off for that run. (PowerShell deletes a variable
 *                        assigned '', so do that from a POSIX shell: `DS_COMMIT_TRAILERS= pnpm commit`.)
 *   ds.commitTrailer     git config, one value per line, read in order with `git config --get-all`.
 *
 * Every line must look like `Token: value`, or the tool exits 2 before staging anything. To sign
 * every commit in one clone (the repository owner restores their old attribution this way, one
 * `git config --local --add ds.commitTrailer "<line>"` per line):
 *
 *   git config --local --add ds.commitTrailer "Signed-off-by: Name <email>"
 *   git config --local --add ds.commitTrailer "Session: https://example.com/session/123"
 *
 * `git config --local --unset-all ds.commitTrailer` removes them.
 *
 * Git runs from the repository root, spawned with an argv array and no shell. The message goes to
 * `commit -F -` on stdin, so Windows argument quoting never touches it. Every git call goes through
 * `hooks.git`, which the tests replace.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT } from './lib/root.ts';

/** What one git call returned: its exit code and output. */
export type GitResult = { status: number; stdout: string; stderr: string };

/** Raised for a bad argument, a malformed trailer or a failed config read; `code` is the exit code. */
export class CommitError extends Error {
  readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export const TRAILERS_ENV = 'DS_COMMIT_TRAILERS';
export const TRAILER_KEY = 'ds.commitTrailer';

/** `Token: value`, the shape `git interpret-trailers` recognises. */
const TRAILER_LINE = /^[A-Za-z0-9-]+: \S/;

const USAGE = 'usage: commit.ts -m <message> [--paths a,b] [--paths c]\n';

function runGit(args: string[], input?: string): GitResult {
  const result = spawnSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    windowsHide: true,
    ...(input === undefined ? {} : { input }),
  });
  if (result.error) return { status: 127, stdout: '', stderr: `commit.ts: cannot run git: ${result.error.message}\n` };
  return { status: result.status ?? 1, stdout: result.stdout, stderr: result.stderr };
}

/** The seams the tests replace. */
export const hooks = { git: runGit };

/** Trailer lines from a variable or config output: split on newlines and literal `\n`, trimmed, blanks dropped. */
export function trailerLines(text: string): string[] {
  return text
    .split(/\n|\\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/**
 * The trailers for this commit. `DS_COMMIT_TRAILERS` wins whenever it is defined, even when empty.
 * Otherwise every `ds.commitTrailer` value in order; git exits 1 when the key is unset, which means none.
 */
export function resolveTrailers(env: Record<string, string | undefined>, readConfig: () => GitResult): string[] {
  let lines: string[];
  let source: string;
  const fromEnv = env[TRAILERS_ENV];
  if (fromEnv !== undefined) {
    lines = trailerLines(fromEnv);
    source = TRAILERS_ENV;
  } else {
    const config = readConfig();
    if (config.status === 1) return [];
    if (config.status !== 0) {
      throw new CommitError(`git config --get-all ${TRAILER_KEY} failed with exit code ${config.status}`, config.status);
    }
    lines = trailerLines(config.stdout);
    source = `git config ${TRAILER_KEY}`;
  }
  const bad = lines.find((line) => !TRAILER_LINE.test(line));
  if (bad !== undefined) {
    throw new CommitError(`malformed trailer from ${source}: ${JSON.stringify(bad)}\n  expected "Token: value", e.g. "Signed-off-by: Name <email>"`, 2);
  }
  return lines;
}

/** `m` alone, or `m`, a blank line and the trailers. */
export function commitMessage(m: string, trailers: string[]): string {
  return trailers.length === 0 ? m : `${m}\n\n${trailers.join('\n')}`;
}

type Args = { message: string; paths: string[] };

/** The parsed command line, or `'help'`. Throws a `CommitError` (exit 2) for anything else. */
export function parseArgs(argv: string[]): Args | 'help' {
  let message: string | undefined;
  const paths: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '--') continue;
    if (arg === '-h' || arg === '--help') return 'help';
    const eq = arg.startsWith('--') ? arg.indexOf('=') : -1;
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    if (flag !== '-m' && flag !== '--message' && flag !== '--paths') {
      throw new CommitError(`unrecognized arguments: ${arg}`, 2);
    }
    let value: string;
    if (eq !== -1) {
      value = arg.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next === undefined) throw new CommitError(`argument ${flag}: expected one argument`, 2);
      value = next;
      i++;
    }
    if (flag === '--paths') paths.push(...value.split(',').filter((path) => path !== ''));
    else message = value;
  }
  if (message === undefined) throw new CommitError('the following arguments are required: -m/--message', 2);
  if (message.trim() === '') throw new CommitError('argument -m/--message: the message is empty', 2);
  return { message, paths };
}

/** One git call, with git's stderr passed through. */
function git(args: string[], input?: string): GitResult {
  const result = input === undefined ? hooks.git(args) : hooks.git(args, input);
  if (result.stderr !== '') process.stderr.write(result.stderr);
  return result;
}

export function main(argv: string[] = process.argv.slice(2), env: Record<string, string | undefined> = process.env): number {
  try {
    const args = parseArgs(argv);
    if (args === 'help') {
      process.stdout.write(
        USAGE +
          '\nStages the given paths (or everything) and commits with the message on stdin.\n' +
          `Trailer lines come from ${TRAILERS_ENV} or git config ${TRAILER_KEY}; none by default.\n`,
      );
      return 0;
    }
    // Trailers first: a malformed one stops the run before the index changes.
    const message = commitMessage(args.message, resolveTrailers(env, () => git(['config', '--get-all', TRAILER_KEY])));

    const add = git(args.paths.length > 0 ? ['add', '--', ...args.paths] : ['add', '-A']);
    if (add.status !== 0) return add.status;
    const staged = git(['diff', '--cached', '--name-only']);
    if (staged.status !== 0) return staged.status;
    if (staged.stdout.trim() === '') {
      process.stdout.write('nothing to commit\n');
      return 0;
    }
    const commit = git(['-c', 'core.safecrlf=false', 'commit', '-q', '-F', '-'], message);
    if (commit.status !== 0) return commit.status;
    process.stdout.write(git(['log', '--oneline', '-1']).stdout);
    return 0;
  } catch (e) {
    if (!(e instanceof CommitError)) throw e;
    process.stderr.write(`${e.code === 2 ? USAGE : ''}commit.ts: error: ${e.message}\n`);
    return e.code;
  }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
