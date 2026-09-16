/** tools/commit.ts — stage and commit, with trailer lines only when someone configured them. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as commit from '../commit.ts';
import type { GitResult } from '../commit.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useStd } from './fixtures.ts';

const std = useStd();

// Built by concatenation so the repository-wide attribution sweep does not find this file.
const COAUTHOR = 'Co-Authored' + '-By';
const SESSION_URL = 'claude.ai/code/' + 'session_';

type Call = { args: string[]; input: string | undefined };
let calls: Call[] = [];

const saved = { ...commit.hooks };
beforeEach(() => {
  calls = [];
  commit.hooks.git = (args: string[]): GitResult => {
    throw new Error(`git started without a fake: git ${args.join(' ')}`);
  };
});
afterEach(() => {
  Object.assign(commit.hooks, saved);
});

const result = (status: number, stdout = ''): GitResult => ({ status, stdout, stderr: '' });

/**
 * Record every git call. Each subcommand (the word after any `-c k=v`) answers from `answers`, else
 * with a repository that has one staged file and no trailer config.
 */
function fakeGit(answers: Record<string, GitResult> = {}): void {
  commit.hooks.git = (args: string[], input?: string): GitResult => {
    calls.push({ args, input });
    const sub = (args[0] === '-c' ? args[2] : args[0]) ?? '';
    const answer = answers[sub];
    if (answer !== undefined) return answer;
    if (sub === 'config') return result(1);
    if (sub === 'diff') return result(0, 'a.ts\n');
    if (sub === 'log') return result(0, 'abc1234 msg\n');
    return result(0);
  };
}

const subcommands = (): string[] => calls.map((call) => (call.args[0] === '-c' ? call.args[2] : call.args[0]) ?? '');
const commitCall = (): Call | undefined => calls.find((call) => call.args.includes('commit'));

describe('trailerLines', () => {
  test('splits on real newlines and on a literal \\n', () => {
    expect(commit.trailerLines('A: x\nB: y')).toEqual(['A: x', 'B: y']);
    expect(commit.trailerLines('A: x\\nB: y')).toEqual(['A: x', 'B: y']);
    expect(commit.trailerLines('A: x\r\nB: y\\nC: z')).toEqual(['A: x', 'B: y', 'C: z']);
  });

  test('trims each line and drops blanks', () => {
    expect(commit.trailerLines('  A: x  \n\n   \n\\n B: y\n')).toEqual(['A: x', 'B: y']);
    expect(commit.trailerLines('')).toEqual([]);
  });
});

describe('resolveTrailers', () => {
  const unset = (): GitResult => result(1);

  test('neither set gives no trailers', () => {
    expect(commit.resolveTrailers({}, unset)).toEqual([]);
  });

  test('the environment variable beats git config', () => {
    let read = false;
    const config = (): GitResult => {
      read = true;
      return result(0, 'Config: yes\n');
    };
    expect(commit.resolveTrailers({ DS_COMMIT_TRAILERS: 'Env: yes' }, config)).toEqual(['Env: yes']);
    expect(read).toBe(false);
  });

  test('an empty variable gives no trailers even with config set', () => {
    expect(commit.resolveTrailers({ DS_COMMIT_TRAILERS: '' }, () => result(0, 'Config: yes\n'))).toEqual([]);
  });

  test('several config values stay in order', () => {
    const config = (): GitResult => result(0, 'Signed-off-by: Name <email>\nSession: https://example.com/s/1\nZ-Last: 3\n');
    expect(commit.resolveTrailers({}, config)).toEqual(['Signed-off-by: Name <email>', 'Session: https://example.com/s/1', 'Z-Last: 3']);
  });

  test('a malformed line exits 2, naming the line and where it came from', () => {
    const fromEnv = (): string[] => commit.resolveTrailers({ DS_COMMIT_TRAILERS: 'A: x\\nnot a trailer' }, unset);
    expect(fromEnv).toThrow(commit.CommitError);
    try {
      fromEnv();
    } catch (e) {
      expect((e as commit.CommitError).code).toBe(2);
      expect((e as Error).message).toContain('DS_COMMIT_TRAILERS');
      expect((e as Error).message).toContain('"not a trailer"');
    }
    expect(() => commit.resolveTrailers({}, () => result(0, 'NoSpace:x\n'))).toThrow(/git config ds\.commitTrailer: "NoSpace:x"/);
  });
});

describe('commitMessage', () => {
  test('no trailers gives exactly the message', () => {
    expect(commit.commitMessage('regen: complete', [])).toBe('regen: complete');
  });

  test('trailers follow a blank line', () => {
    expect(commit.commitMessage('m', ['A: x', 'B: y'])).toBe('m\n\nA: x\nB: y');
  });
});

describe('main', () => {
  test('no paths stages everything', () => {
    fakeGit();
    expect(commit.main(['-m', 'regen: phase Core'], {})).toBe(0);
    expect(calls[1]?.args).toEqual(['add', '-A']);
    expect(subcommands()).toEqual(['config', 'add', 'diff', 'commit', 'log']);
    expect(calls[2]?.args).toEqual(['diff', '--cached', '--name-only']);
    expect(std.out()).toBe('abc1234 msg\n');
  });

  test('--paths repeats and splits on commas', () => {
    fakeGit();
    expect(commit.main(['-m', 'x', '--paths', 'a,b', '--paths', 'c'], {})).toBe(0);
    expect(calls.find((call) => call.args[0] === 'add')?.args).toEqual(['add', '--', 'a', 'b', 'c']);
  });

  test('--flag=value works and empty path entries are dropped', () => {
    fakeGit();
    expect(commit.main(['--message=x', '--paths=a,,b,'], {})).toBe(0);
    expect(calls.find((call) => call.args[0] === 'add')?.args).toEqual(['add', '--', 'a', 'b']);
    expect(commitCall()?.input).toBe('x');
  });

  test('an empty stage prints nothing to commit and never commits', () => {
    fakeGit({ diff: result(0, '') });
    expect(commit.main(['-m', 'x'], {})).toBe(0);
    expect(std.out()).toBe('nothing to commit\n');
    expect(commitCall()).toBeUndefined();
  });

  test('commits with the message and trailers on stdin', () => {
    fakeGit({ config: result(0, 'A: x\nB: y\n') });
    expect(commit.main(['-m', 'm'], {})).toBe(0);
    expect(commitCall()?.args).toEqual(['-c', 'core.safecrlf=false', 'commit', '-q', '-F', '-']);
    expect(commitCall()?.input).toBe('m\n\nA: x\nB: y');
  });

  test('the environment variable reaches the message without reading config', () => {
    fakeGit();
    expect(commit.main(['-m', 'm'], { DS_COMMIT_TRAILERS: 'Signed-off-by: Name <email>' })).toBe(0);
    expect(subcommands()).not.toContain('config');
    expect(commitCall()?.input).toBe('m\n\nSigned-off-by: Name <email>');
  });

  test('a git commit failure passes its exit code through', () => {
    fakeGit({ commit: { status: 128, stdout: '', stderr: 'fatal: boom\n' } });
    expect(commit.main(['-m', 'x'], {})).toBe(128);
    expect(std.err()).toContain('fatal: boom');
    expect(subcommands()).not.toContain('log');
  });

  test('a malformed trailer exits 2 before anything is staged', () => {
    fakeGit({ config: result(0, 'bad trailer\n') });
    expect(commit.main(['-m', 'x'], {})).toBe(2);
    expect(subcommands()).toEqual(['config']);
    expect(std.err()).toContain('"bad trailer"');
  });

  test('--help exits 0 without git', () => {
    expect(commit.main(['--help'], {})).toBe(0);
    expect(commit.main(['-h'], {})).toBe(0);
    expect(std.out()).toContain('usage: commit.ts -m <message>');
    expect(calls).toEqual([]);
  });

  test('a missing -m, a missing value or an unknown flag exits 2 without git', () => {
    expect(commit.main([], {})).toBe(2);
    expect(commit.main(['--paths', 'a'], {})).toBe(2);
    expect(commit.main(['-m'], {})).toBe(2);
    expect(commit.main(['-m', '  '], {})).toBe(2);
    expect(commit.main(['--bogus'], {})).toBe(2);
    expect(commit.main(['-m', 'x', 'stray'], {})).toBe(2);
    expect(std.err()).toContain('-m/--message');
    expect(std.err()).toContain('unrecognized arguments: --bogus');
    expect(calls).toEqual([]);
  });

  test('a bare -- is ignored', () => {
    fakeGit();
    expect(commit.main(['--', '-m', 'x'], {})).toBe(0);
    expect(commitCall()?.input).toBe('x');
  });
});

describe('callers', () => {
  test('commit.ps1 wraps tools/commit.ts and carries no attribution of its own', () => {
    const ps1 = readFileSync(join(REPO_ROOT, 'commit.ps1'), 'utf8');
    expect(ps1).toContain('tools/commit.ts');
    expect(ps1).not.toContain(SESSION_URL);
    expect(ps1.toLowerCase()).not.toContain(COAUTHOR.toLowerCase());
    expect(ps1).toMatch(/^[\x00-\x7f]*$/);
  });

  test('fold-gaps.md commits with pnpm commit', () => {
    const prompt = readFileSync(join(REPO_ROOT, 'prompts', 'fold-gaps.md'), 'utf8');
    expect(prompt).not.toContain('commit.ps1');
    expect(prompt).toContain('pnpm commit -m "fold: <components>"');
  });
});
