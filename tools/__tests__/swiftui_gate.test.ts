/**
 * tools/swiftui_gate.ts — the remote gate client: the branch it pushes, the run it finds, the report it
 * turns into gate results, and what it folds back.
 *
 * Nothing here runs `git` or `gh`: the one seam every command goes through (`hooks.run`) is replaced by a
 * recorder, so the whole contract with GitHub is asserted as argv and JSON.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as gate from '../swiftui_gate.ts';
import { useStd, useTmp, write } from './fixtures.ts';

// `git` and `gh` are looked up on PATH before anything is run; neither is guaranteed here (and `gh` is
// not on this machine at all), so the lookup is the one thing mocked at the module level.
const onPath = vi.hoisted(() => ({ missing: '' }));

vi.mock('../lib/proc.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/proc.ts')>();
  return {
    ...actual,
    which: (cmd: string) => (cmd === onPath.missing ? null : cmd === 'git' || cmd === 'gh' ? `/usr/bin/${cmd}` : actual.which(cmd)),
  };
});

const tmp = useTmp();
const std = useStd();

const savedHooks = { ...gate.hooks };

type Call = { argv: string[]; cwd: string };

/** Answers commands from a table of prefix → result; everything else succeeds with no output. */
function fakeShell(answers: Record<string, Partial<gate.CmdResult>> = {}): Call[] {
  const calls: Call[] = [];
  gate.hooks.run = (argv: string[], cwd: string = ''): gate.CmdResult => {
    calls.push({ argv, cwd });
    const key = Object.keys(answers).find((k) => argv.join(' ').includes(k));
    const answer = key === undefined ? {} : (answers[key] as Partial<gate.CmdResult>);
    // A repository with a remote is the uninteresting case, so it is the default.
    const stdout = answer.stdout ?? (key === undefined && argv[1] === 'remote' ? 'git@github.com:acme/design-schema.git\n' : '');
    const stderr = answer.stderr ?? '';
    return { status: answer.status ?? 0, stdout, stderr, output: (stdout + stderr).trim() };
  };
  return calls;
}

const argvOf = (calls: Call[], head: string): string[] | undefined => calls.find((c) => c.argv.join(' ').startsWith(head))?.argv;

beforeEach(() => {
  gate.hooks.sleep = async () => {};
  onPath.missing = '';
});

afterEach(() => {
  Object.assign(gate.hooks, savedHooks);
  vi.restoreAllMocks();
});

describe('preflight', () => {
  test('says which of git, gh, a remote and a login is missing', () => {
    fakeShell();
    onPath.missing = 'gh';
    expect(() => gate.preflight()).toThrow(/`gh` is not on PATH/);
    onPath.missing = '';
    fakeShell({ 'git remote': { status: 1 } });
    expect(() => gate.preflight()).toThrow(/no `origin` remote/);
    fakeShell({ 'gh auth status': { status: 1, stderr: 'not logged in' } });
    expect(() => gate.preflight()).toThrow(/gh is not authenticated: not logged in/);
    fakeShell();
    expect(() => gate.preflight()).not.toThrow();
  });
});

describe('start', () => {
  test('the branch is a worktree at HEAD, the inputs are copied, committed and force-pushed', () => {
    const root = tmp();
    write(join(root, 'packages', 'swiftui', 'Sources', 'DesignSchema', 'Button.swift'), 'struct Button {}');
    write(join(root, 'tools', 'icon-paths.json'), '{}');
    write(join(root, 'packages', 'swiftui', '.build', 'debug', 'leftover.o'), 'binary');
    const calls = fakeShell({ 'rev-parse': { stdout: 'abc123def456\n' } });

    const run = gate.start('Button', ['packages/swiftui/Sources/DesignSchema/Button.swift'], root);

    expect(run.branch).toBe('gen/swiftui/Button');
    expect(run.sha).toBe('abc123def456');
    expect(argvOf(calls, 'git worktree add')).toEqual(['git', 'worktree', 'add', '--force', '-B', 'gen/swiftui/Button', run.worktree, 'HEAD']);
    expect(argvOf(calls, 'git commit')?.slice(0, 4)).toEqual(['git', 'commit', '--allow-empty', '-m']);
    expect(argvOf(calls, 'git push')).toEqual(['git', 'push', '--force', 'origin', 'HEAD:refs/heads/gen/swiftui/Button']);
    // Everything after `git worktree add` happens in the worktree, never in the main checkout.
    for (const c of calls.filter((x) => x.argv[1] !== 'worktree')) expect(c.cwd).toBe(run.worktree);
    expect(readFileSync(join(run.worktree, 'packages/swiftui/Sources/DesignSchema/Button.swift'), 'utf8')).toBe('struct Button {}');
    expect(readFileSync(join(run.worktree, 'tools/icon-paths.json'), 'utf8')).toBe('{}');
    expect(existsSync(join(run.worktree, 'packages/swiftui/.build')), '.build never travels').toBe(false);
  });

  test('the keyboard rules travel, force-added, without their Playwright half', () => {
    const root = tmp();
    write(join(root, 'packages', 'swiftui', 'Package.swift'), 'x');
    write(join(root, 'generated', 'keyboard', 'Tabs.json'), '{"name":"Tabs"}');
    write(join(root, 'generated', 'keyboard', 'Tabs.web.spec.ts'), 'import { test } from "@playwright/test";');
    const calls = fakeShell();

    const run = gate.start('Tabs', [], root);

    // generated/ is gitignored — the macOS job never runs `pnpm install` and so cannot derive the rules
    // itself, and a rule set that did not travel would be a gate silently checking nothing.
    expect(argvOf(calls, 'git add')?.slice(0, 4)).toEqual(['git', 'add', '-A', '-f']);
    expect(argvOf(calls, 'git add')).toContain('generated/keyboard');
    expect(readFileSync(join(run.worktree, 'generated/keyboard/Tabs.json'), 'utf8')).toBe('{"name":"Tabs"}');
    expect(existsSync(join(run.worktree, 'generated/keyboard/Tabs.web.spec.ts')), 'Playwright is not the Mac`s business').toBe(false);
  });

  test('a failed push takes the worktree with it, so the next round can start', () => {
    const root = tmp();
    write(join(root, 'packages', 'swiftui', 'Package.swift'), 'x');
    const calls = fakeShell({ 'git push': { status: 128, stderr: 'no upstream' } });
    expect(() => gate.start('Button', [], root)).toThrow(/git push for Button failed/);
    expect(argvOf(calls, 'git worktree remove')).toBeDefined();
  });
});

describe('dispatch', () => {
  const pushed: gate.RemoteRun = { name: 'Button', branch: 'gen/swiftui/Button', worktree: 'w', sha: 'sha-2', id: '', files: [] };

  test('the workflow is run against the branch with the target input, and the run is found by sha', async () => {
    const calls = fakeShell({
      'gh run list': { stdout: JSON.stringify([{ databaseId: 7, headSha: 'sha-1' }, { databaseId: 9, headSha: 'sha-2' }]) },
    });
    const run = await gate.dispatch(pushed, 'root');
    expect(argvOf(calls, 'gh workflow run')).toEqual(['gh', 'workflow', 'run', 'swiftui-gates.yml', '--ref', 'gen/swiftui/Button', '-f', 'target=Button']);
    expect(run.id).toBe('9'); // not the older run of the same branch
  });

  test('a run that never appears is a gate error, not a wait forever', async () => {
    fakeShell({ 'gh run list': { stdout: '[]' } });
    await expect(gate.dispatch(pushed, 'root')).rejects.toThrow(/no run for sha-2 appeared/);
  });
});

describe('waitAll', () => {
  const runs = (n: number): gate.RemoteRun[] =>
    Array.from({ length: n }, (_, i) => ({ name: `C${i}`, branch: `gen/swiftui/C${i}`, worktree: 'w', sha: `s${i}`, id: String(i), files: [] }));

  /** `gh run download` writes the artifact into --dir; the fake shell has to do the same. */
  function fakeDownloads(report: unknown): Call[] {
    const calls: Call[] = [];
    gate.hooks.run = (argv: string[], cwd = ''): gate.CmdResult => {
      calls.push({ argv, cwd });
      if (argv[1] === 'run' && argv[2] === 'download') {
        const dir = argv[argv.indexOf('--dir') + 1] as string;
        const name = (argv[argv.indexOf('--name') + 1] as string).replace('gates-', '');
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `${name}.swiftui.json`), JSON.stringify(report));
      }
      const stdout = argv.includes('--json') ? JSON.stringify({ status: 'completed', conclusion: 'success' }) : '';
      return { status: 0, stdout, stderr: '', output: stdout };
    };
    return calls;
  }

  test('one run is watched; several are polled once each and downloaded', async () => {
    const one = fakeDownloads({ build: { ok: true, errors: [] } });
    await gate.waitAll(runs(1), 'root');
    expect(argvOf(one, 'gh run watch')).toEqual(['gh', 'run', 'watch', '0', '--exit-status']);

    const many = fakeDownloads({ build: { ok: true, errors: [] } });
    const reports = await gate.waitAll(runs(3), 'root');
    expect(argvOf(many, 'gh run watch'), 'a batch never blocks on one run').toBeUndefined();
    expect(many.filter((c) => c.argv[2] === 'view')).toHaveLength(3);
    expect([...reports.keys()]).toEqual(['C0', 'C1', 'C2']);
    expect(std.out()).toContain('waiting on 3 runs (C0, C1, C2)');
  });

  test('a run that uploaded no report is a gate error naming the run', async () => {
    fakeShell({ 'gh run download': { status: 1, stderr: 'no artifact matches gates-C0' } });
    await expect(gate.waitAll(runs(1), 'root')).rejects.toThrow(/no gates\/C0\.swiftui\.json from run 0/);
  });
});

describe('results', () => {
  test('each section becomes a gate carrying the runner`s own lines', () => {
    const out = gate.results('Button', {
      build: { ok: false, errors: ['Sources/DesignSchema/Button.swift:31:9: error: cannot find `theme` in scope'] },
      tests: { ok: true, failures: [] },
      audit: { ok: false, issues: ['Button.label: element has no accessibility label'] },
    });
    expect(out.map((r) => [r.name, r.ok])).toEqual([['swift-build', false], ['swift-test', true], ['swift-audit', false]]);
    expect(out[0]?.output).toContain('cannot find `theme` in scope');
  });

  test('ok with errors listed is still a failure, and a skipped section never is', () => {
    const out = gate.results('Button', {
      build: { ok: true, errors: ['error: this contradicts ok'] },
      tests: { ok: false, failures: [], skipped: true, note: 'no simulator' },
    });
    expect(out[0]?.ok).toBe(false);
    expect(out[1]?.ok).toBe(true);
    expect(out[1]?.output).toContain('no simulator');
    expect(out[2], 'a missing section is reported, not invented').toMatchObject({ name: 'swift-audit', ok: true });
  });
});

describe('fold and discard', () => {
  test('fold copies the gated bytes into the checkout and deletes the branch', () => {
    const root = tmp();
    const worktree = join(root, 'wt');
    write(join(worktree, 'packages', 'swiftui', 'Sources', 'DesignSchema', 'Button.swift'), 'gated bytes');
    write(join(root, 'packages', 'swiftui', 'Sources', 'DesignSchema', 'Button.swift'), 'older bytes');
    const run: gate.RemoteRun = {
      name: 'Button', branch: 'gen/swiftui/Button', worktree, sha: 's', id: '4',
      files: ['packages/swiftui/Sources/DesignSchema/Button.swift'],
    };
    const calls = fakeShell();
    expect(gate.fold(run, root)).toEqual(['packages/swiftui/Sources/DesignSchema/Button.swift']);
    expect(readFileSync(join(root, 'packages/swiftui/Sources/DesignSchema/Button.swift'), 'utf8')).toBe('gated bytes');
    expect(argvOf(calls, 'git branch -D')).toEqual(['git', 'branch', '-D', 'gen/swiftui/Button']);
    expect(argvOf(calls, 'git push origin --delete')).toBeDefined();
    expect(argvOf(calls, 'git worktree remove')).toBeDefined();
  });

  test('discard keeps the branch — it is the only copy of what the runner rejected', () => {
    const run: gate.RemoteRun = { name: 'Button', branch: 'gen/swiftui/Button', worktree: join(tmp(), 'gone'), sha: 's', id: '5', files: [] };
    const calls = fakeShell();
    gate.discard(run, tmp());
    expect(argvOf(calls, 'git worktree remove')).toBeDefined();
    expect(argvOf(calls, 'git branch -D')).toBeUndefined();
    expect(std.out()).toContain('gh run view 5 --log-failed');
  });
});

describe('runBatch', () => {
  test('every branch is pushed and dispatched before anything is waited on', async () => {
    const root = tmp();
    write(join(root, 'packages', 'swiftui', 'Package.swift'), 'x');
    const order: string[] = [];
    let branch = ''; // the worktree the commands are talking about, from the last `git worktree add -B`
    gate.hooks.run = (argv: string[]): gate.CmdResult => {
      const head = argv.slice(0, 3).join(' ');
      if (['git push', 'gh workflow run', 'gh run view', 'gh run download'].some((k) => head.startsWith(k))) order.push(head.split(' ').slice(0, 2).join(' '));
      if (argv.includes('-B')) branch = argv[argv.indexOf('-B') + 1] as string;
      let stdout = '';
      if (head.startsWith('git rev-parse')) stdout = `sha-${branch}\n`;
      if (head.startsWith('gh run list')) {
        const asked = argv[argv.indexOf('--branch') + 1] as string;
        stdout = JSON.stringify([{ databaseId: asked.endsWith('A') ? 1 : 2, headSha: `sha-${asked}` }]);
      }
      if (argv[2] === 'view') stdout = JSON.stringify({ status: 'completed', conclusion: 'success' });
      if (argv[2] === 'download') {
        const dir = argv[argv.indexOf('--dir') + 1] as string;
        const name = (argv[argv.indexOf('--name') + 1] as string).replace('gates-', '');
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, `${name}.swiftui.json`), JSON.stringify({ build: { ok: true, errors: [] }, tests: { ok: true, failures: [] } }));
      }
      return { status: 0, stdout, stderr: '', output: stdout };
    };

    const batches = await gate.runBatch([{ name: 'A', files: [] }, { name: 'B', files: [] }], root);

    expect(batches.map((b) => b.run.name)).toEqual(['A', 'B']);
    expect(batches.every((b) => b.results.every((r) => r.ok))).toBe(true);
    // The shape of a batch: every branch pushed, then every run dispatched — then the waiting, once.
    expect(order.slice(0, 4)).toEqual(['git push', 'git push', 'gh workflow', 'gh workflow']);
    expect(order.filter((o) => o === 'gh run').length).toBeGreaterThanOrEqual(2);
    for (const b of batches) gate.fold(b.run, root);
  });
});
