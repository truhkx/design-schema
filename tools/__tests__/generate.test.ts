/**
 * tools/generate.ts — the runner, the per-platform lockfiles, gap capture, the preflight and the
 * resilience rules of job 190 (port of tests/test_generate_lock.py, test_generate_report.py and
 * test_generate_retry.py, plus the command line and the two runners the Python tests could not reach).
 *
 * Nothing here calls a model: the runner is a fake that replies from a list, and `claude` itself is
 * exercised through a mocked `spawnSync` so the argv, the JSON envelope and every error path are covered.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PACKAGE_DIR, PLATFORM_LABEL } from '../../schema/platforms.ts';
import type { GateResult } from '../checks.ts';
import * as g from '../generate.ts';
import { readText } from '../lib/py.ts';
import * as nm from '../naming.ts';
import { useStd, useTmp, write } from './fixtures.ts';

// `claude` is not on PATH in CI, and no test may spawn it anyway: both seams are replaced here.
const mocked = vi.hoisted(() => ({ spawn: null as null | ((...args: unknown[]) => unknown) }));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return { ...actual, spawnSync: (...args: unknown[]) => (mocked.spawn ? mocked.spawn(...args) : actual.spawnSync(args[0] as string)) };
});

vi.mock('../lib/proc.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/proc.ts')>();
  return { ...actual, which: (cmd: string) => (cmd === 'claude' ? '/usr/bin/claude' : actual.which(cmd)) };
});

const tmp = useTmp();
const std = useStd();

const savedPaths = { ...g.paths };
const savedHooks = { ...g.hooks };
const savedNamingPaths = { ...nm.paths };

let dir = '';

beforeEach(() => {
  dir = tmp();
  Object.assign(g.paths, {
    ROOT: dir,
    PROMPTS: join(dir, 'prompts'),
    LOCK_DIR: dir,
    LEGACY_LOCK: join(dir, 'generate.lock.json'),
    LOGS: join(dir, 'logs'),
    GAPS: join(dir, 'gaps'),
    CONVENTIONS: join(dir, 'conventions'),
    COMPONENTS: join(dir, 'components.json'),
  });
  mkdirSync(g.paths.PROMPTS, { recursive: true });
  // The gates are the previous job's tests; every case here stubs them out.
  g.hooks.runGates = () => [];
});

afterEach(() => {
  Object.assign(g.paths, savedPaths);
  Object.assign(g.hooks, savedHooks);
  Object.assign(nm.paths, savedNamingPaths);
  g.resetNaming(); // the run's naming doc is resolved once and memoized
  mocked.spawn = null;
});

const entry = (hash: string): g.Dict => ({ hash, runner: 'test' });
const readLock = (platform: string): g.Lock => JSON.parse(readFileSync(g.lockPath(platform), 'utf8')) as g.Lock;
const gate = (name: string, ok: boolean, output: string = ''): GateResult => ({ name, ok, output });

const args = (over: Partial<g.Args> = {}): g.Args => ({
  platform: 'lit', component: null, pattern: null, stale: false, check: false, adopt: false, force: false,
  runner: 'cli', model: 'sonnet', maxRounds: 1, maxTurns: 1, skip: [], extra: [], dryRun: false, naming: null, ...over,
});

const REPORT = '```json\n{"files": ["packages/lit/src/Text.ts"], "gaps": ["Text: guessed the default size"]}\n```';
const NO_GAPS = '```json\n{"files": ["packages/lit/src/Text.ts"], "gaps": []}\n```';

/** Replies in order; records every prompt and the session it was resumed with. An Error is thrown, not returned. */
class FakeRunner implements g.Runner {
  replies: unknown[];
  calls: [string, string | null][] = [];

  constructor(replies: unknown[]) {
    this.replies = [...replies];
  }

  async run(prompt: string, resume: string | null): Promise<g.RunResult> {
    this.calls.push([prompt, resume]);
    const reply = this.replies.shift();
    if (reply instanceof Error) throw reply;
    return [reply as string, 'session-1', 0.01];
  }
}

/** A sandbox with the two prompts the round-loop cases use, a fake runner and a recorded sleep. */
function loop(replies: unknown[], gates: GateResult[][] = []): { runner: FakeRunner; slept: number[] } {
  write(join(g.paths.PROMPTS, 'Text.lit.md'), 'spec');
  write(join(g.paths.PROMPTS, 'Other.lit.md'), 'other spec');
  const runner = new FakeRunner(replies);
  const slept: number[] = [];
  g.hooks.taskPrompt = () => 'task';
  g.hooks.fixPrompt = () => 'fix';
  g.hooks.CliRunner = () => runner;
  g.hooks.ApiRunner = () => runner;
  g.hooks.sleep = async (seconds: number) => {
    slept.push(seconds);
  };
  const rounds = [...gates];
  // The preflight asks with verbose=false and must pass, or no model is called at all.
  g.hooks.runGates = (_platform, _skip, verbose = true) => (verbose ? (rounds.length > 0 ? (rounds.shift() as GateResult[]) : []) : []);
  return { runner, slept };
}

describe('saveLock', () => {
  test('each platform writes only its own file', () => {
    g.saveLock({ 'Button.web': entry('aaa'), 'Button.rn': entry('bbb') }, 'web');
    expect(readLock('web')).toEqual({ 'Button.web': entry('aaa') });
    expect(existsSync(g.lockPath('rn'))).toBe(false);
  });

  test('alternating saves from two platforms lose nothing', () => {
    // Two processes, each with its own stale in-memory copy of the merged lock.
    const web = g.loadLock();
    const rn = g.loadLock();
    web['Button.web'] = entry('w1');
    g.saveLock(web, 'web');
    rn['Button.rn'] = entry('r1');
    g.saveLock(rn, 'rn');
    web['Input.web'] = entry('w2');
    g.saveLock(web, 'web');
    rn['Input.rn'] = entry('r2');
    g.saveLock(rn, 'rn');
    expect(g.loadLock()).toEqual({
      'Button.web': entry('w1'), 'Input.web': entry('w2'), 'Button.rn': entry('r1'), 'Input.rn': entry('r2'),
    });
  });

  test('a stale in-memory copy does not drop a newer entry on disk', () => {
    g.saveLock({ 'Button.web': entry('first') }, 'web');
    g.saveLock({ 'Input.web': entry('x') }, 'web'); // a process that loaded before Button.web existed
    expect(Object.keys(g.loadLock()).sort()).toEqual(['Button.web', 'Input.web']);
  });

  test('writes are atomic', () => {
    g.saveLock({ 'Button.web': entry('a') }, 'web');
    expect(readdirSync(dir).filter((n) => n.endsWith('.tmp'))).toEqual([]);
  });

  test('the file is sorted, two-space indented, and keeps the cost a float', () => {
    g.saveLock({ 'B.web': { costUsd: 0, gates: {}, files: [] }, 'A.web': { costUsd: 1.5 } }, 'web');
    expect(readFileSync(g.lockPath('web'), 'utf8').replace(/\r\n/g, '\n')).toBe(
      '{\n  "A.web": {\n    "costUsd": 1.5\n  },\n  "B.web": {\n    "costUsd": 0.0,\n    "gates": {},\n    "files": []\n  }\n}\n',
    );
  });
});

describe('loadLock', () => {
  test('merges every platform file', () => {
    for (const [platform, h] of [['web', 'w'], ['lit', 'l'], ['rn', 'r']] as const) {
      g.writeJson(g.lockPath(platform), { [`Button.${platform}`]: entry(h) });
    }
    expect(Object.keys(g.loadLock()).sort()).toEqual(['Button.lit', 'Button.rn', 'Button.web']);
  });

  test('is empty when nothing exists', () => {
    expect(g.loadLock()).toEqual({});
  });
});

describe('the legacy lockfile', () => {
  test('is split and removed', () => {
    write(g.paths.LEGACY_LOCK, JSON.stringify({ 'Button.web': entry('w'), 'Button.lit': entry('l'), 'Button.rn': entry('r') }));
    expect(Object.keys(g.loadLock()).sort()).toEqual(['Button.lit', 'Button.rn', 'Button.web']);
    expect(existsSync(g.paths.LEGACY_LOCK)).toBe(false);
    for (const platform of ['web', 'lit', 'rn']) {
      expect(readLock(platform)).toEqual({ [`Button.${platform}`]: entry(platform[0] as string) });
    }
  });

  test('loses to a per-platform entry for the same target', () => {
    write(g.paths.LEGACY_LOCK, JSON.stringify({ 'Button.web': entry('old') }));
    g.writeJson(g.lockPath('web'), { 'Button.web': entry('new') });
    expect(g.loadLock()['Button.web']).toEqual(entry('new'));
  });

  test('is kept while a generator run is active, then removed', () => {
    mkdirSync(g.paths.LOGS, { recursive: true });
    write(join(g.paths.LOGS, 'regen.log'), '== regen ==\nround 1: model');
    write(g.paths.LEGACY_LOCK, JSON.stringify({ 'Button.rn': entry('r') }));
    expect(g.loadLock()['Button.rn']).toEqual(entry('r'));
    expect(existsSync(g.paths.LEGACY_LOCK), 'an older process would rewrite it; merge instead of delete').toBe(true);
    expect(std.out()).toContain('kept');
    write(join(g.paths.LOGS, 'regen.log'), '== regen ==\n== done ==');
    g.loadLock();
    expect(existsSync(g.paths.LEGACY_LOCK)).toBe(false);
  });
});

describe('generatorRunning', () => {
  test('a stale log without its end marker does not count as running', () => {
    mkdirSync(g.paths.LOGS, { recursive: true });
    const log = join(g.paths.LOGS, 'regen.log');
    write(log, '== regen ==\nround 1: model');
    const old = Date.now() / 1000 - g.RUNNING_LOG_MAX_AGE_S - 60;
    utimesSync(log, old, old);
    expect(g.generatorRunning()).toBe(false);
    write(log, '== regen ==\nround 2: model'); // touched now
    expect(g.generatorRunning()).toBe(true);
  });

  test('either end marker, a per-platform regen log, or no logs folder at all', () => {
    expect(g.generatorRunning()).toBe(false); // no logs/
    mkdirSync(g.paths.LOGS, { recursive: true });
    write(join(g.paths.LOGS, 'regen.log'), 'queue complete');
    expect(g.generatorRunning()).toBe(false);
    write(join(g.paths.LOGS, 'regen-web.log'), '== regen ==\nround 1');
    expect(g.generatorRunning()).toBe(true);
  });
});

describe('targets', () => {
  beforeEach(() => {
    for (const name of ['Button.web.md', 'Pattern.SettingsPage.rn.md', 'theme.calm-precise.md', 'Ignored.compose.md', 'notes.txt']) {
      write(join(g.paths.PROMPTS, name), `spec for ${name}\n`);
    }
  });

  test('every prompt but the theme becomes a target, the platform split off the end', () => {
    expect(g.allTargets()).toEqual([['Button', 'web'], ['Pattern.SettingsPage', 'rn']]);
  });

  test('a pair the doc marks supported: false is never a target, from a leftover prompt or from --component', async () => {
    write(join(g.paths.PROMPTS, 'Button.rn.md'), 'spec for Button.rn.md\n'); // written before the doc ruled rn out
    write(g.paths.COMPONENTS, JSON.stringify([{ component: { name: 'Button', platforms: { web: {}, rn: { supported: false } } } }]));
    expect(g.unsupportedTargets()).toEqual(new Set(['Button.rn']));
    expect(g.allTargets()).toEqual([['Button', 'web'], ['Pattern.SettingsPage', 'rn']]);
    g.hooks.taskPrompt = () => 'task';
    expect(await g.main(['--platform', 'web,rn', '--component', 'Button', '--dry-run'])).toBe(0);
    expect(std.out()).toContain('skip   Button.rn: platforms.rn.supported is false\n');
    expect(std.out()).toContain('targets: Button.web\n');
  });

  test('a target is stale until its lock entry carries the prompt hash', () => {
    const lock = { 'Button.web': entry(g.sha('spec for Button.web.md\n')) };
    expect(g.staleTargets(lock)).toEqual([['Pattern.SettingsPage', 'rn']]);
  });

  test('--check lists the stale ones over the merged view and exits 1', async () => {
    g.saveLock({ 'Button.web': entry(g.sha('spec for Button.web.md\n')) }, 'web');
    g.saveLock({ 'Pattern.SettingsPage.rn': entry('stale') }, 'rn');
    expect(await g.main(['--check'])).toBe(1);
    expect(std.out()).toContain('stale  Pattern.SettingsPage.rn');
    expect(std.out()).not.toContain('Button.web');
    expect(std.out()).toContain('1 stale of 2 targets');
  });

  test('--check exits 0 when nothing is stale', async () => {
    g.saveLock({ 'Button.web': entry(g.sha('spec for Button.web.md\n')) }, 'web');
    g.saveLock({ 'Pattern.SettingsPage.rn': entry(g.sha('spec for Pattern.SettingsPage.rn.md\n')) }, 'rn');
    expect(await g.main(['--check'])).toBe(0);
    expect(std.out()).toContain('0 stale of 2 targets');
  });
});

describe('--adopt', () => {
  test('records the prompt hash for every target whose code already exists', async () => {
    write(join(g.paths.PROMPTS, 'Button.web.md'), 'button web');
    write(join(g.paths.PROMPTS, 'Missing.rn.md'), 'missing rn');
    write(join(g.paths.PROMPTS, 'Pattern.SettingsPage.rn.md'), 'pattern rn');
    write(join(dir, 'packages', 'react', 'src', 'Button.tsx'), 'x');
    write(join(dir, 'packages', 'rn', 'demo', 'SettingsPage.tsx'), 'x'); // a pattern lives in demo/, not src/
    expect(await g.main(['--adopt'])).toBe(0);
    expect(std.out()).toContain('✔ adopted 2 target(s)');
    expect(readLock('web')['Button.web']).toMatchObject({ hash: g.sha('button web'), runner: 'adopted' });
    expect(readLock('rn')['Pattern.SettingsPage.rn']).toMatchObject({ runner: 'adopted' });
    expect(readLock('rn')['Missing.rn']).toBeUndefined();
  });
});

describe('gaps', () => {
  test('recordGaps writes only the target file, with a header and one round per append', () => {
    g.recordGaps('Button', 'web', ['a'], 1);
    g.recordGaps('Button', 'web', ['b'], 2);
    g.recordGaps('Button', 'rn', ['c'], 1);
    expect(readdirSync(g.paths.GAPS).sort()).toEqual(['Button.rn.md', 'Button.web.md']);
    const text = readText(join(g.paths.GAPS, 'Button.web.md')); // written in text mode: CRLF on Windows
    expect(text).toContain('# Gaps reported while generating Button for web');
    expect(text).toMatch(/— round 1\n\n- a\n/);
    expect(text).toMatch(/— round 2\n\n- b\n/);
  });

  test('an empty gap list writes nothing at all', () => {
    g.recordGaps('Button', 'lit', [], 1);
    expect(existsSync(g.paths.GAPS)).toBe(false);
  });
});

describe('the prompts', () => {
  test('feelOnly keeps the judgment section and drops the token table', () => {
    const skill = '# Theme\n\nintro\n\n## How to make decisions\n\nbody\n\n## When to use\n\ntail\n';
    expect(g.feelOnly(skill)).toBe('## How to make decisions\n\nbody');
    expect(g.feelOnly(skill.replace('## When to use', '## Later'))).toBe('## How to make decisions\n\nbody\n\n## Later\n\ntail');
    expect(g.feelOnly('no headings at all')).toBe('no headings at all');
  });

  test('a component task names the component, the package index and an exemplar', () => {
    write(join(g.paths.PROMPTS, 'Text.lit.md'), 'THE SPEC');
    write(join(g.paths.CONVENTIONS, 'lit.md'), 'THE DIGEST');
    const prompt = g.taskPrompt('Text', 'lit');
    expect(prompt).toContain('You are the Lit web components generator');
    expect(prompt).toContain('Then generate **Text** from the specification below.');
    expect(prompt).toContain('open `packages/lit/src/index.ts`');
    expect(prompt).toContain('(`packages/lit/src/Button.ts` or the one closest');
    expect(prompt).toContain('THE DIGEST');
    expect(prompt).toContain('THE SPEC');
    expect(prompt).toContain(g.REPORT_INSTRUCTIONS.trim());
    expect(prompt.endsWith('\n')).toBe(true);
  });

  test('a pattern task targets demo/ and forbids touching index.ts', () => {
    write(join(g.paths.PROMPTS, 'Pattern.SettingsPage.web.md'), 'spec');
    const prompt = g.taskPrompt('Pattern.SettingsPage', 'web');
    expect(prompt).toContain('Then generate the pattern page **SettingsPage**');
    expect(prompt).toContain('into `packages/react/demo/`');
    expect(prompt).toContain('Do not touch `src/index.ts`');
  });

  test('a missing conventions digest or theme leaves the section empty rather than failing', () => {
    write(join(g.paths.PROMPTS, 'Text.rn.md'), 'spec');
    expect(g.taskPrompt('Text', 'rn')).toContain('## Theme feel (for judgment calls the spec leaves open)\n\n\n');
  });

  test('the fix prompt names the round, the gate output and the rules reminder', () => {
    const prompt = g.fixPrompt('Text', 'lit', '### Gate `typecheck` FAILED', 2);
    expect(prompt.startsWith('Round 2: the build gates rejected the generated **Text** for Lit web components.')).toBe(true);
    expect(prompt).toContain('### Gate `typecheck` FAILED');
    expect(prompt).toContain('Rules reminder: tokens only');
    expect(prompt.endsWith(g.REPORT_INSTRUCTIONS)).toBe(true);
  });
});

describe('parseReport', () => {
  test('the last complete block wins', () => {
    const text = 'first\n```json\n{"files": ["a"], "gaps": ["one"]}\n```\nsecond\n```json\n{"files": ["b"], "gaps": []}\n```';
    expect(g.parseReport(text)).toEqual({ files: ['b'], gaps: [] });
  });

  test('a reply without a block reports the miss as a gap', () => {
    expect(g.parseReport('nothing here')).toEqual({ files: [], gaps: [g.NO_REPORT] });
  });

  test('a block without "files" is not a report', () => {
    expect(g.parseReport('```json\n{"gaps": []}\n```')).toEqual({ files: [], gaps: [g.NO_REPORT] });
  });

  test('invalid JSON is skipped and an earlier block still counts', () => {
    const text = '```json\n{"files": ["ok.ts"], "gaps": []}\n```\n```json\n{"files": ["bad"],}\n```';
    expect(g.parseReport(text)).toEqual({ files: ['ok.ts'], gaps: [] });
  });

  test('values are stringified and a missing gaps key is empty', () => {
    expect(g.parseReport('```json\n{"files": [1, true, null], "gaps": ["✔"]}\n```')).toEqual({
      files: ['1', 'True', 'None'], gaps: ['✔'],
    });
    expect(g.parseReport('```json\n{"files": ["a.ts"]}\n```')).toEqual({ files: ['a.ts'], gaps: [] });
  });
});

describe('custom/', () => {
  test('a snapshot is taken, tampering is undone and the changed files are named', () => {
    const custom = g.customDir('web');
    mkdirSync(join(custom, 'nested'), { recursive: true });
    writeFileSync(join(custom, 'keep.ts'), 'export const keep = 1;\n');
    writeFileSync(join(custom, 'nested', 'deep.ts'), 'deep\n');
    const snapshot = g.customSnapshot('web');
    expect(Object.keys(snapshot).sort()).toEqual(['keep.ts', 'nested/deep.ts']);

    writeFileSync(join(custom, 'keep.ts'), 'tampered\n');
    writeFileSync(join(custom, 'added.ts'), 'new\n');
    unlinkSync(join(custom, 'nested', 'deep.ts'));
    expect(g.restoreCustom('web', snapshot)).toEqual(['added.ts', 'keep.ts', 'nested/deep.ts']);
    expect(readFileSync(join(custom, 'keep.ts'), 'utf8')).toBe('export const keep = 1;\n');
    expect(readFileSync(join(custom, 'nested', 'deep.ts'), 'utf8')).toBe('deep\n');
    expect(existsSync(join(custom, 'added.ts'))).toBe(false);
    expect(g.restoreCustom('web', snapshot)).toEqual([]);
  });

  test('a package without a custom folder snapshots to nothing', () => {
    expect(g.customSnapshot('lit')).toEqual({});
    expect(g.restoreCustom('lit', {})).toEqual([]);
  });

  test('a changed custom/ fails the round as its own gate', async () => {
    const { runner } = loop(['Done.\n' + NO_GAPS]);
    const custom = g.customDir('lit');
    mkdirSync(custom, { recursive: true });
    writeFileSync(join(custom, 'hand.ts'), 'original\n');
    g.hooks.restoreCustom = () => ['hand.ts'];
    expect(await g.generateOne('Text', 'lit', args(), {})).toBe(false);
    expect(runner.calls).toHaveLength(1);
    expect(std.out()).toContain('✖ custom     restored hand.ts');
    expect(std.out()).toContain('✖ gates still failing after 1 round(s): custom');
  });
});

describe('a missing report', () => {
  test('is asked for once and its files reach the lock', async () => {
    const { runner } = loop(['I wrote the component and stories.', 'Here you go:\n' + REPORT]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(true);
    expect(runner.calls).toHaveLength(2);
    expect(runner.calls[1], 'the nudge resumes the same session').toEqual([g.REPORT_NUDGE, 'session-1']);
    expect((lock['Text.lit'] as g.Dict)['files']).toEqual(['packages/lit/src/Text.ts']);
    const gaps = readFileSync(join(g.paths.GAPS, 'Text.lit.md'), 'utf8');
    expect(gaps).toContain('Text: guessed the default size');
    expect(gaps).toContain('recovered after a second request');
    expect(gaps).not.toContain(g.NO_REPORT);
  });

  test('a reply with the report is not nudged', async () => {
    const { runner } = loop(['Done.\n' + REPORT]);
    await g.generateOne('Text', 'lit', args(), {});
    expect(runner.calls).toHaveLength(1);
  });

  test('a second miss keeps the original gap and no files', async () => {
    const { runner } = loop(['no report', 'still no report']);
    const lock: g.Lock = {};
    await g.generateOne('Text', 'lit', args(), lock);
    expect(runner.calls).toHaveLength(2);
    expect((lock['Text.lit'] as g.Dict)['files']).toEqual([]);
    expect(readFileSync(join(g.paths.GAPS, 'Text.lit.md'), 'utf8')).toContain(g.NO_REPORT);
  });

  test('the api runner is not nudged — there is no session to resume', async () => {
    const { runner } = loop(['no report']);
    await g.generateOne('Text', 'lit', args({ runner: 'api' }), {});
    expect(runner.calls).toHaveLength(1);
  });

  test('the nudge cost is counted', async () => {
    loop(['no report', REPORT]);
    const lock: g.Lock = {};
    await g.generateOne('Text', 'lit', args(), lock);
    expect((lock['Text.lit'] as g.Dict)['costUsd']).toBeCloseTo(0.02, 10);
  });
});

describe('runner errors', () => {
  test('a runner that raises once then succeeds passes', async () => {
    const { runner, slept } = loop([new g.RunnerError('claude exited 1: boom'), 'Done.\n' + REPORT]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(true);
    expect(runner.calls).toHaveLength(2);
    expect(runner.calls[0]?.[0], 'the same round is retried').toBe(runner.calls[1]?.[0]);
    expect(slept).toEqual([30]);
    expect(lock['Text.lit']).toMatchObject({ hash: g.sha('spec') });
    expect(lock['Text.lit']).not.toHaveProperty('error');
  });

  test('a runner that raises twice records the failure and stays stale', async () => {
    const { runner, slept } = loop([new g.RunnerError('claude exited 1: boom'), new g.RunnerError('claude exited 1: boom again')]);
    const lock: g.Lock = { 'Text.lit': { hash: 'previous' } };
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(false);
    expect(runner.calls).toHaveLength(2);
    expect(slept).toEqual([30]);
    const e = lock['Text.lit'] as g.Dict;
    expect(e['hash']).toBeNull();
    expect(e['lastAttemptHash']).toBe(g.sha('spec'));
    expect(e['error']).toBe('claude exited 1: boom again');
    expect(e['rounds']).toBe(1);
    expect(e['gates']).toEqual({});
    expect((readLock('lit')['Text.lit'] as g.Dict)['error']).toBe(e['error']);
    expect(std.out()).toContain('? Text.lit: runner error, will retry on the next pass');
    expect(g.staleTargets(lock)).toContainEqual(['Text', 'lit']);
  });

  test('a failed target does not abort the run', async () => {
    const { runner } = loop([new g.RunnerError('dead'), new g.RunnerError('dead'), 'Done.\n' + REPORT]);
    expect(await g.main(['--platform', 'lit', '--component', 'Text,Other']), 'the phase still reports a failure').toBe(1);
    expect(runner.calls, 'Other.lit ran after Text.lit gave up').toHaveLength(3);
    const lock = g.loadLock();
    expect((lock['Text.lit'] as g.Dict)['hash']).toBeNull();
    expect((lock['Other.lit'] as g.Dict)['hash']).toBe(g.sha('other spec'));
    expect(std.out()).toContain('? Text.lit: runner error');
    expect(std.out()).toContain('✔ Other.lit');
  });

  test('a runner error in a fix round keeps the earlier files', async () => {
    const { runner } = loop(['Done.\n' + REPORT, new g.RunnerError('dead'), new g.RunnerError('dead')], [[gate('typecheck', false, 'nope')]]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args({ maxRounds: 2 }), lock)).toBe(false);
    expect(runner.calls).toHaveLength(3);
    expect((lock['Text.lit'] as g.Dict)['files']).toEqual(['packages/lit/src/Text.ts']);
    expect((lock['Text.lit'] as g.Dict)['rounds']).toBe(2);
  });
});

describe('transient model errors', () => {
  test.each(['', '   ', null, 'Rate limit exceeded', 'API overloaded', 'Error 529', 'read ECONNRESET'])(
    'an empty or API message is transient (%j)',
    (result) => {
      expect(new g.ModelError(result).transient).toBe(true);
    },
  );

  test('a real model error is not', () => {
    expect(new g.ModelError('Reached max turns without finishing').transient).toBe(false);
  });

  test('transient errors back off twice', async () => {
    const { runner, slept } = loop([new g.ModelError(''), new g.ModelError('rate limit'), 'Done.\n' + REPORT]);
    expect(await g.generateOne('Text', 'lit', args(), {})).toBe(true);
    expect(runner.calls).toHaveLength(3);
    expect(slept).toEqual([30, 90]);
  });

  test('a third transient failure is recorded', async () => {
    const { slept } = loop([new g.ModelError('overloaded'), new g.ModelError('overloaded'), new g.ModelError('overloaded')]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(false);
    expect(slept).toEqual([30, 90]);
    expect(String((lock['Text.lit'] as g.Dict)['error'])).toContain('overloaded');
  });

  test('a non-transient model error is recorded without a retry', async () => {
    const { runner, slept } = loop([new g.ModelError('Reached max turns'), 'Done.\n' + REPORT]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(false);
    expect(runner.calls).toHaveLength(1);
    expect(slept).toEqual([]);
    expect((lock['Text.lit'] as g.Dict)['error']).toBe('claude reported an error: Reached max turns');
  });

  test('a transient message from the cli exit path backs off too', async () => {
    const { slept } = loop([new g.RunnerError('claude exited 1: Error: read ECONNRESET'), 'Done.\n' + REPORT]);
    expect(await g.generateOne('Text', 'lit', args(), {})).toBe(true);
    expect(slept).toEqual([30]);
  });

  test('the schedule is two backoffs for transient, one retry otherwise, none for a reported error', () => {
    expect(g.retrySchedule(new g.ModelError('overloaded'))).toEqual([30, 90]);
    expect(g.retrySchedule(new g.ModelError('Reached max turns'))).toEqual([]);
    expect(g.retrySchedule(new g.RunnerError('boom'))).toEqual([30]);
    expect(g.retrySchedule(new g.RunnerError('429 rate_limit'))).toEqual([30, 90]);
  });

  test('errorLine is the first line, trimmed to 300 characters', () => {
    expect(g.errorLine(new g.RunnerError('  first line\nsecond line  '))).toBe('first line');
    expect(g.errorLine(new g.RunnerError('y'.repeat(400)))).toHaveLength(300);
    expect(g.errorLine(new g.RunnerError(''))).toBe('RunnerError');
  });
});

describe('the round loop', () => {
  test('a clean round records the hash, the files, the gates and the cost', async () => {
    loop(['Done.\n' + REPORT], [[gate('parse', true), gate('typecheck', true)]]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(true);
    expect(lock['Text.lit']).toMatchObject({
      hash: g.sha('spec'), lastAttemptHash: g.sha('spec'), model: 'sonnet', runner: 'cli', rounds: 1,
      costUsd: 0.01, files: ['packages/lit/src/Text.ts'], gaps: 1, gates: { parse: true, typecheck: true },
    });
    expect(std.out()).toContain('✔ Text.lit: 1 file(s), 1 gap(s), 1 round(s), $0.010');
  });

  test('a failing gate is handed back as a fix round and the files union across rounds', async () => {
    const { runner } = loop(['Done.\n' + REPORT, '```json\n{"files": ["packages/lit/src/index.ts"], "gaps": []}\n```'],
      [[gate('typecheck', false, 'error TS2322')], [gate('typecheck', true)]]);
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args({ maxRounds: 2 }), lock)).toBe(true);
    expect(runner.calls[1]?.[0], 'the second round gets the fix prompt').toBe('fix');
    expect((lock['Text.lit'] as g.Dict)['files']).toEqual(['packages/lit/src/Text.ts', 'packages/lit/src/index.ts'].sort());
    expect((lock['Text.lit'] as g.Dict)['rounds']).toBe(2);
  });

  test('a run that never goes green does not claim the hash', async () => {
    loop(['Done.\n' + REPORT], [[gate('typecheck', false, 'error TS2322')]]);
    const lock: g.Lock = { 'Text.lit': { hash: 'previous' } };
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(false);
    expect((lock['Text.lit'] as g.Dict)['hash'], 'stays stale for the next pass').toBe('previous');
    expect(std.out()).toContain('✖ gates still failing after 1 round(s): typecheck');
  });

  test('an up-to-date target is skipped, and --force regenerates it', async () => {
    const { runner } = loop(['Done.\n' + REPORT]);
    const lock: g.Lock = { 'Text.lit': entry(g.sha('spec')) };
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(true);
    expect(runner.calls).toHaveLength(0);
    expect(std.out()).toContain(`= Text.lit: up to date (${g.sha('spec')})`);
    expect(await g.generateOne('Text', 'lit', args({ force: true }), lock)).toBe(true);
    expect(runner.calls).toHaveLength(1);
  });

  test('a missing prompt fails the target without calling anything', async () => {
    loop([]);
    expect(await g.generateOne('Nope', 'lit', args(), {})).toBe(false);
    expect(std.out()).toContain('✖ Nope.lit: no prompt at');
    expect(std.out()).toContain('(run tools/parse.ts)');
  });

  test('a failing preflight stops before the first model call and prints the last six lines', async () => {
    const { runner } = loop(['Done.\n' + REPORT]);
    const output = [...Array(9).keys()].map((i) => `doc error ${i}`).join('\n');
    g.hooks.runGates = (_platform, _skip, verbose = true) => (verbose ? [] : [gate('parse', false, output)]);
    expect(await g.generateOne('Text', 'lit', args(), {})).toBe(false);
    expect(runner.calls).toHaveLength(0);
    expect(std.out()).toContain('✖ Text.lit: preflight failed before any model call');
    expect(std.out()).toContain('    doc error 3');
    expect(std.out()).not.toContain('doc error 2');
  });

  test('the preflight skips the gates the model is about to change', async () => {
    loop(['Done.\n' + REPORT]);
    const asked: string[][] = [];
    g.hooks.runGates = (_platform, skip, verbose = true) => {
      asked.push([...(skip ?? new Set<string>())].sort());
      return verbose ? [] : [];
    };
    await g.generateOne('Text', 'lit', args({ skip: ['deps'] }), {});
    // `hooks` is in the list for the same reason as the rest: it reads the generated stylesheet, and
    // unscoped it would fail every target over hook debt owned by components the model may not edit.
    expect(asked[0]).toEqual(['axe', 'deps', 'hooks', 'keyboard', 'keyboard-run', 'literals', 'typecheck']);
    expect(asked[1], 'the real round skips only what --skip asked for').toEqual(['deps']);
  });

  test('--dry-run prints the head of the task prompt and calls nothing', async () => {
    const { runner } = loop([]);
    g.hooks.taskPrompt = () => 'x'.repeat(2000);
    expect(await g.generateOne('Text', 'lit', args({ dryRun: true }), {})).toBe(true);
    expect(runner.calls).toHaveLength(0);
    expect(std.out()).toContain('x'.repeat(1500) + '\n…\n');
    expect(std.out()).not.toContain('x'.repeat(1501));
  });
});

describe('--naming', () => {
  /** The naming doc the sandbox resolves, and the folder the runner writes into. */
  function brand(frontmatter: string = '  namespace:\n    cssPrefix: acme\n  components:\n    Text: Body\n'): string {
    Object.assign(nm.paths, { ROOT: dir, THEMES: join(dir, 'themes'), COMPONENTS: join(dir, 'components.json') });
    write(join(dir, 'themes', 'acme', 'naming.md'), `---\ntitle: acme\nnaming:\n${frontmatter}---\n\nProse.\n`);
    return g.srcDir('lit');
  }

  /** A runner that writes what the model would write: canonical names, every round. */
  function writes(text: string): string[] {
    const seen: string[] = [];
    g.hooks.CliRunner = () => ({
      run: async (): Promise<g.RunResult> => {
        write(join(g.srcDir('lit'), 'Text.ts'), text);
        return [REPORT, 'session-1', 0.01];
      },
    });
    g.hooks.runGates = (_platform, _skip, verbose = true) => {
      // what the gates see on disk, which must always be the canonical tree
      if (verbose) seen.push(readdirSync(g.srcDir('lit')).join(','));
      return [];
    };
    return seen;
  }

  test('the written output takes the brand names; the gates never see them', async () => {
    loop(['unused']);
    const src = brand();
    const seen = writes("export const Text = 'ds-text';\n");
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args({ naming: 'acme' }), lock)).toBe(true);
    expect(seen, 'the gates ran on the canonical file').toEqual(['Text.ts']);
    expect(readdirSync(src)).toEqual(['Body.ts']);
    expect(readText(join(src, 'Body.ts'))).toBe("export const Body = 'acme-body';\n");
    expect(lock['Text.lit']).toMatchObject({
      files: ['packages/lit/src/Body.ts'],
      naming: 'themes/acme/naming.md',
    });
    expect(std.out()).toContain('naming themes/acme/naming.md: 1 component(s), 0 prop(s), --acme- prefix');
    expect(std.out()).toContain('↻ Text.lit: naming — brand names applied to 1 file(s), 1 renamed');
  });

  test('without the flag there is no naming step at all', async () => {
    loop(['unused']);
    const src = brand();
    writes("export const Text = 'ds-text';\n");
    const lock: g.Lock = {};
    expect(await g.generateOne('Text', 'lit', args(), lock)).toBe(true);
    expect(readdirSync(src)).toEqual(['Text.ts']);
    expect(readText(join(src, 'Text.ts')), 'byte for byte what the model wrote').toBe("export const Text = 'ds-text';\n");
    expect(lock['Text.lit']).toMatchObject({ files: ['packages/lit/src/Text.ts'] });
    expect(lock['Text.lit']).not.toHaveProperty('naming');
    expect(std.out()).not.toContain('naming');
  });

  test("a fork's renamed tree is normalized before the round and renamed after it", async () => {
    loop(['unused']);
    const src = brand();
    // what a fork has committed: the brand's names, and a composite that renders the renamed component
    write(join(src, 'Body.ts'), "export const Body = 'acme-body';\n");
    write(join(src, 'Card.ts'), "import './Body.js';\nconst x: BodyProps = {};\n");
    const seen = writes("export const Text = 'ds-text';\n");
    expect(await g.generateOne('Text', 'lit', args({ naming: 'acme' }), {})).toBe(true);
    expect(seen[0], 'the model and the gates worked on canonical names').toBe('Card.ts,Text.ts');
    expect(readdirSync(src).sort()).toEqual(['Body.ts', 'Card.ts']);
    expect(readText(join(src, 'Card.ts')), 'the composite still points at the brand name').toBe(
      "import './Body.js';\nconst x: BodyProps = {};\n",
    );
    expect(std.out()).toContain('↺ Text.lit: naming — canonical names restored in 2 file(s), 1 renamed');
  });

  test('a run that fails still leaves the tree in the brand names', async () => {
    loop(['unused']);
    const src = brand();
    write(join(src, 'Body.ts'), "export const Body = 'acme-body';\n");
    g.hooks.runGates = (_platform, _skip, verbose = true) => (verbose ? [] : [gate('parse', false, 'doc error')]);
    expect(await g.generateOne('Text', 'lit', args({ naming: 'acme' }), {})).toBe(false);
    expect(std.out()).toContain('preflight failed before any model call');
    expect(readdirSync(src), 'not left half-renamed').toEqual(['Body.ts']);
  });

  test('a naming doc that renames nothing is the same as none', async () => {
    loop(['unused']);
    const src = brand('  components:\n    Text: Text\n');
    writes("export const Text = 'ds-text';\n");
    expect(await g.generateOne('Text', 'lit', args({ naming: 'acme' }), {})).toBe(true);
    expect(readdirSync(src)).toEqual(['Text.ts']);
    expect(std.out()).not.toContain('naming themes/acme');
  });

  test('a collision between a brand prop name and a platform one is warned about', async () => {
    loop(['unused']);
    brand('  props:\n    variant: style\n');
    writes("export const Text = 'ds-text';\n");
    await g.generateOne('Text', 'lit', args({ naming: 'acme' }), {});
    expect(std.out()).toContain('! naming web: variant → style collides with web\'s own `style` prop');
  });

  test('a ref that names no doc stops the run before any model call', async () => {
    loop(['unused']);
    brand();
    const seen = writes("export const Text = 'ds-text';\n");
    await expect(g.generateOne('Text', 'lit', args({ naming: 'nope' }), {})).rejects.toThrow(/no naming doc for 'nope'/);
    expect(seen).toEqual([]);
  });

  test('--adopt finds the file under its brand name', async () => {
    brand();
    write(join(g.paths.PROMPTS, 'Text.lit.md'), 'spec');
    write(join(g.srcDir('lit'), 'Body.ts'), 'export const Body = null;\n');
    expect(await g.main(['--platform', 'lit', '--adopt', '--naming', 'acme'])).toBe(0);
    expect(Object.keys(readLock('lit'))).toEqual(['Text.lit']);
    expect(readLock('lit')['Text.lit']).toMatchObject({ hash: g.sha('spec'), runner: 'adopted' });
  });
});

describe('the cli runner', () => {
  const reply = (data: unknown, over: Record<string, unknown> = {}): Record<string, unknown> => ({
    status: 0, stdout: Buffer.from(typeof data === 'string' ? data : JSON.stringify(data), 'utf8'), stderr: Buffer.alloc(0), ...over,
  });

  test('the argv carries the headless flags, the model, the turn cap and the allowedTools', async () => {
    let seen: string[] = [];
    mocked.spawn = (...call: unknown[]) => {
      const first = call[0] as string;
      seen = process.platform === 'win32' ? first.split(' ') : [first, ...(call[1] as string[])];
      return reply({ result: 'ok', session_id: 's', total_cost_usd: 0.5 });
    };
    const [text, session, cost] = await new g.CliRunner('fable', 40).run('the prompt', null);
    expect(text).toBe('ok');
    expect(session).toBe('s');
    expect(cost).toBe(0.5);
    const argv = seen.join(' ');
    expect(argv).toContain('-p --output-format json --permission-mode acceptEdits');
    expect(argv).toContain('--model fable --max-turns 40');
    expect(argv).toContain('mcp__design-schema__*');
    expect(argv).not.toContain('--resume');
  });

  test('a session id is resumed when one is given', async () => {
    let argv = '';
    mocked.spawn = (...call: unknown[]) => {
      argv = process.platform === 'win32' ? (call[0] as string) : (call[1] as string[]).join(' ');
      return reply({ result: 'ok' });
    };
    await new g.CliRunner('sonnet', 1).run('p', 'session-9');
    expect(argv).toContain('--resume session-9');
  });

  test('is_error becomes a ModelError, and an empty result is transient', async () => {
    mocked.spawn = () => reply({ type: 'result', is_error: true, result: '' });
    await expect(new g.CliRunner('sonnet', 1).run('task', null)).rejects.toMatchObject({ transient: true });
    await expect(new g.CliRunner('sonnet', 1).run('task', null)).rejects.toThrow('(empty result)');
  });

  test('a non-zero exit with no stdout is a runner error carrying stderr', async () => {
    mocked.spawn = () => reply('', { status: 1, stderr: Buffer.from('boom', 'utf8') });
    await expect(new g.CliRunner('sonnet', 1).run('task', null)).rejects.toThrow('claude exited 1: boom');
  });

  test('output that is not the JSON envelope is a runner error', async () => {
    mocked.spawn = () => reply('not json at all');
    await expect(new g.CliRunner('sonnet', 1).run('task', null)).rejects.toThrow('unexpected claude output');
  });

  test('only the last line of stdout has to be the envelope', async () => {
    mocked.spawn = () => reply('chatter\n' + JSON.stringify({ result: 'done', total_cost_usd: null }));
    expect(await new g.CliRunner('sonnet', 1).run('task', null)).toEqual(['done', null, 0]);
  });

  test('denied tools and an odd terminal reason are reported', async () => {
    mocked.spawn = () =>
      reply({
        result: 'ok',
        permission_denials: [{ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } }, { tool_name: 'Read', tool_input: { file_path: 'x.ts' } }],
        terminal_reason: 'max_turns',
        num_turns: 80,
      });
    await new g.CliRunner('sonnet', 1).run('task', null);
    expect(std.out()).toContain('! 2 tool call(s) were denied');
    expect(std.out()).toContain('Bash: rm -rf /');
    expect(std.out()).toContain('Read: x.ts');
    expect(std.out()).toContain('! run ended with terminal_reason=max_turns after 80 turns');
  });

  test('a successful terminal reason says nothing', async () => {
    mocked.spawn = () => reply({ result: 'ok', terminal_reason: 'end_turn' });
    await new g.CliRunner('sonnet', 1).run('task', null);
    expect(std.out()).toBe('');
  });

  test('a timeout is a runner error, not a crash', async () => {
    mocked.spawn = () => ({ status: null, stdout: null, stderr: null, error: Object.assign(new Error('timed out'), { code: 'ETIMEDOUT' }) });
    await expect(new g.CliRunner('sonnet', 1).run('task', null)).rejects.toThrow('claude timed out after 3600 s');
  });
});

describe('the api runner', () => {
  test('says how to install the SDK rather than failing later', () => {
    // @anthropic-ai/sdk is an optional install, as `anthropic` was for the Python runner.
    let caught: unknown;
    try {
      new g.ApiRunner('sonnet', 'web');
    } catch (e) {
      caught = e;
    }
    if (caught === undefined) return; // the SDK is installed here: nothing to assert
    expect(caught).toBeInstanceOf(g.ExitError);
    expect((caught as Error).message).toContain('@anthropic-ai/sdk');
  });
});

describe('the command line', () => {
  test('the defaults match the Python argparse ones', () => {
    const a = g.parseArgs([]);
    expect(a).toEqual({
      platform: 'web,lit,rn', component: null, pattern: null, stale: false, check: false, adopt: false, force: false,
      runner: 'cli', model: g.DEFAULT_MODEL, maxRounds: 3, maxTurns: 80, skip: [], extra: [], dryRun: false,
      naming: g.DEFAULT_NAMING,
    });
  });

  test('every flag, in both the space and the equals form', () => {
    const a = g.parseArgs(['--platform=web,rn', '--component', 'Icon,Text', '--pattern=SettingsPage', '--stale', '--check',
      '--adopt', '--force', '--runner', 'api', '--model=opus', '--max-rounds', '5', '--max-turns=120',
      '--skip', 'typecheck', '--skip=deps', '--with', 'keyboard', '--with=axe', '--dry-run', '--naming=nimbus']);
    expect(a).toEqual({
      platform: 'web,rn', component: 'Icon,Text', pattern: 'SettingsPage', stale: true, check: true, adopt: true,
      force: true, runner: 'api', model: 'opus', maxRounds: 5, maxTurns: 120, skip: ['typecheck', 'deps'],
      extra: ['keyboard', 'axe'], dryRun: true, naming: 'nimbus',
    });
  });

  test('a bad choice, a bad int and a missing value all exit 2 with argparse wording', async () => {
    expect(await g.main(['--runner', 'nope'])).toBe(2);
    expect(std.err()).toContain("argument --runner: invalid choice: 'nope' (choose from cli, api)");
    expect(await g.main(['--max-rounds', 'x'])).toBe(2);
    expect(std.err()).toContain("argument --max-rounds: invalid int value: 'x'");
    expect(await g.main(['--skip'])).toBe(2);
    expect(std.err()).toContain('argument --skip: expected one argument');
    expect(await g.main(['--bogus'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --bogus');
    expect(std.err()).toContain('usage: generate.ts [-h] [--platform PLATFORM] [--component COMPONENT]');
  });

  test('no target flag is a usage error', async () => {
    expect(await g.main([])).toBe(2);
    expect(std.err()).toContain('generate.ts: error: give --component NAME[,NAME], --pattern NAME[,NAME], --stale or --check');
  });

  test('an unknown platform exits 1 with the message on stderr', async () => {
    // `compose` was a reserved platform id until job 607 dropped it from the table.
    expect(await g.main(['--platform', 'compose', '--component', 'Icon'])).toBe(1);
    expect(std.err()).toBe('unknown platform compose\n');
  });

  test('--help prints the description and the options, and exits 0', async () => {
    expect(await g.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: generate.ts [-h] [--platform PLATFORM] [--component COMPONENT]');
    expect(std.out()).toContain('node tools/generate.ts --stale');
    expect(std.out()).toContain('  --dry-run             print the task prompt head, call nothing\n');
  });

  test('--component and --pattern make one target per platform, components first', async () => {
    for (const name of ['Icon.web', 'Icon.lit', 'Text.web', 'Text.lit', 'Pattern.SettingsPage.web', 'Pattern.SettingsPage.lit']) {
      write(join(g.paths.PROMPTS, `${name}.md`), 'spec');
    }
    const seen: string[] = [];
    g.hooks.taskPrompt = (name, platform) => {
      seen.push(`${name}.${platform}`);
      return 'task';
    };
    await g.main(['--platform', 'web,lit', '--component', 'Icon, Text ', '--pattern', 'SettingsPage', '--dry-run']);
    expect(seen).toEqual(['Icon.web', 'Icon.lit', 'Text.web', 'Text.lit', 'Pattern.SettingsPage.web', 'Pattern.SettingsPage.lit']);
    expect(std.out()).toContain('targets: Icon.web, Icon.lit, Text.web, Text.lit, Pattern.SettingsPage.web, Pattern.SettingsPage.lit');
  });

  test('an empty component list is nothing to do, not an error', async () => {
    expect(await g.main(['--platform', 'web', '--pattern', ' , '])).toBe(0);
    expect(std.out()).toBe('nothing to do\n');
  });

  test('--stale is filtered to the platforms asked for', async () => {
    write(join(g.paths.PROMPTS, 'Text.lit.md'), 'spec');
    write(join(g.paths.PROMPTS, 'Text.web.md'), 'spec');
    g.hooks.taskPrompt = () => 'task';
    expect(await g.main(['--platform', 'lit', '--stale', '--dry-run'])).toBe(0);
    expect(std.out()).toContain('targets: Text.lit\n');
  });
});

describe('the swiftui platform', () => {
  const SWIFT_REPORT = '```json\n{"files": ["packages/swiftui/Sources/DesignSchema/Button.swift",' +
    ' "packages/swiftui/Sources/DesignSchema/Gallery+Button.swift"], "gaps": []}\n```';

  /** A remote gate that answers from a list of results per round and records what it was asked. */
  function fakeGate(rounds: GateResult[][] = []): { batches: string[][]; folded: string[]; discarded: string[]; preflights: number } {
    const seen = { batches: [] as string[][], folded: [] as string[], discarded: [] as string[], preflights: 0 };
    const queue = [...rounds];
    g.hooks.remoteGate = () => ({
      preflight: () => {
        seen.preflights += 1;
      },
      runBatch: async (targets) => {
        seen.batches.push(targets.map((t) => t.name));
        const results = queue.length > 0 ? (queue.shift() as GateResult[]) : [gate('swift-build', true)];
        return targets.map((t) => ({
          run: { name: t.name, branch: `gen/swiftui/${t.name}`, worktree: 'w', sha: 's', id: '1', files: t.files },
          results,
        }));
      },
      fold: (run) => {
        seen.folded.push(run.name);
        return run.files;
      },
      discard: (run) => {
        seen.discarded.push(run.name);
      },
    });
    return seen;
  }

  /** Prompts for two swiftui targets, a fake model and the gates stubbed to green. */
  function swiftLoop(replies: unknown[]): FakeRunner {
    write(join(g.paths.PROMPTS, 'Button.swiftui.md'), 'button spec');
    write(join(g.paths.PROMPTS, 'Icon.swiftui.md'), 'icon spec');
    const runner = new FakeRunner(replies);
    g.hooks.taskPrompt = () => 'task';
    g.hooks.fixPrompt = (_n, _p, failures) => `fix: ${failures}`;
    g.hooks.failuresAsPrompt = (results) => results.filter((r) => !r.ok).map((r) => `${r.name}: ${r.output}`).join('\n');
    g.hooks.CliRunner = () => runner;
    g.hooks.sleep = async () => {};
    g.hooks.runGates = () => [];
    return runner;
  }

  test('the platform is known, labelled, and points at the Swift package', () => {
    expect(PACKAGE_DIR['swiftui']).toBe('swiftui');
    expect(PLATFORM_LABEL['swiftui']).toBe('SwiftUI (iOS)');
    expect(g.REMOTE_GATE.has('swiftui')).toBe(true);
    expect(g.CONVENTION_FILES['swiftui']?.[0]).toBe('packages/swiftui/Sources/DesignSchema/Support/Gallery.swift');
    expect(g.CONVENTION_FILES['swiftui']?.[1]).toBe('packages/swiftui/Sources/DesignSchema/Button.swift');
    expect(g.srcDir('swiftui').replaceAll('\\', '/')).toMatch(/packages\/swiftui\/Sources\/DesignSchema$/);
    expect(g.srcDir('web').replaceAll('\\', '/')).toMatch(/packages\/react\/src$/);
  });

  test('the task prompt asks for the file, the gallery screen, and nothing under Gallery+Generated', () => {
    write(join(g.paths.PROMPTS, 'Button.swiftui.md'), '# spec');
    const prompt = g.taskPrompt('Button', 'swiftui');
    expect(prompt).toContain('You are the SwiftUI (iOS) generator');
    expect(prompt).toContain('packages/swiftui/Sources/DesignSchema/Gallery+Button.swift');
    expect(prompt).toContain('static var buttonScreen: GalleryEntry');
    expect(prompt).toContain('Never edit `Support/Gallery+Generated.swift`');
    expect(prompt, 'a Swift package has no index to export from').not.toContain('index.ts');
  });

  test('the gallery registry is written from the screen files on disk', () => {
    const dir = g.srcDir('swiftui');
    mkdirSync(dir, { recursive: true });
    expect(g.writeGalleryRegistry()).toContain('Gallery+Generated.swift');
    expect(readText(join(dir, g.GALLERY_REGISTRY))).toContain('static var generated: [GalleryEntry] {\n        []\n    }');
    write(join(dir, 'Gallery+Icon.swift'), 'screen');
    write(join(dir, 'Gallery+Button.swift'), 'screen');
    write(join(dir, 'Button.swift'), 'component'); // not a screen
    g.writeGalleryRegistry();
    const text = readText(join(dir, g.GALLERY_REGISTRY));
    expect(text).toContain('            Self.buttonScreen,\n            Self.iconScreen,'); // sorted, not generation order
    expect(text).not.toContain('Self.buttonSwiftScreen');
    expect(g.writeGalleryRegistry(), 'unchanged: nothing is rewritten').toBeNull();
  });

  test('a batch is one CI round trip: both branches, one runBatch, then the fold', async () => {
    const runner = swiftLoop([SWIFT_REPORT, SWIFT_REPORT]);
    const seen = fakeGate();
    const lock: g.Lock = {};
    expect(await g.generateBatch(['Button', 'Icon'], 'swiftui', args({ platform: 'swiftui' }), lock)).toBe(true);
    expect(runner.calls).toHaveLength(2); // both models ran before anything was pushed
    expect(seen.preflights).toBe(1);
    expect(seen.batches).toEqual([['Button', 'Icon']]);
    expect(seen.folded).toEqual(['Button', 'Icon']);
    expect(seen.discarded).toEqual([]);
    expect(lock['Button.swiftui']).toMatchObject({ hash: g.sha('button spec'), gates: { 'swift-build': true } });
    expect(lock['Icon.swiftui']).toMatchObject({ hash: g.sha('icon spec') });
    expect(readLock('swiftui')['Button.swiftui']).toBeDefined();
  });

  test('the registry is rewritten before the branch is pushed', async () => {
    swiftLoop([SWIFT_REPORT]);
    mkdirSync(g.srcDir('swiftui'), { recursive: true });
    write(join(g.srcDir('swiftui'), 'Gallery+Button.swift'), 'screen');
    fakeGate();
    await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui' }), {});
    expect(readText(join(g.srcDir('swiftui'), g.GALLERY_REGISTRY))).toContain('Self.buttonScreen');
  });

  test('a swift build error is round 2, exactly as a typecheck failure is', async () => {
    const runner = swiftLoop([SWIFT_REPORT, SWIFT_REPORT]);
    const failure = gate('swift-build', false, 'Button.swift:31:9: error: cannot find `theme` in scope');
    const seen = fakeGate([[failure], [gate('swift-build', true)]]);
    const lock: g.Lock = {};
    expect(await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui', maxRounds: 2 }), lock)).toBe(true);
    expect(runner.calls).toHaveLength(2);
    expect(runner.calls[1]?.[0]).toBe('fix: swift-build: Button.swift:31:9: error: cannot find `theme` in scope');
    expect(seen.batches).toEqual([['Button'], ['Button']]); // a second round trip, for the one that failed
    expect(seen.discarded, 'the failing round keeps its branch').toEqual(['Button']);
    expect(seen.folded).toEqual(['Button']);
    expect(lock['Button.swiftui']).toMatchObject({ rounds: 2 });
  });

  test('a target still failing at the last round stays stale and keeps its branch', async () => {
    swiftLoop([SWIFT_REPORT]);
    const seen = fakeGate([[gate('swift-test', false, 'IconSnapshotTests: 4% of pixels differ')]]);
    const lock: g.Lock = {};
    expect(await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui' }), lock)).toBe(false);
    expect(seen.folded).toEqual([]);
    expect(seen.discarded).toEqual(['Button']);
    expect(lock['Button.swiftui']).toMatchObject({ hash: null, gates: { 'swift-test': false } });
    expect(std.out()).toContain('✖ Button: gates still failing after 1 round(s): swift-test');
  });

  test('a gate that never answers is recorded like a dead model call, not as a pass', async () => {
    swiftLoop([SWIFT_REPORT]);
    fakeGate();
    g.hooks.remoteGate = () => ({
      preflight: () => {},
      runBatch: () => Promise.reject(new Error('no gates/Button.swiftui.json from run 12')),
      fold: () => [],
      discard: () => {},
    });
    const lock: g.Lock = {};
    expect(await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui' }), lock)).toBe(false);
    const e = lock['Button.swiftui'] as g.Dict;
    expect(e['hash']).toBeNull();
    expect(e['error']).toBe('no gates/Button.swiftui.json from run 12');
    expect(e['gates']).toEqual({});
  });

  test('a gate that cannot run at all stops before the first model call', async () => {
    const runner = swiftLoop([SWIFT_REPORT]);
    g.hooks.remoteGate = () => ({
      preflight: () => {
        throw new Error('`gh` is not on PATH');
      },
      runBatch: () => Promise.reject(new Error('never reached')),
      fold: () => [],
      discard: () => {},
    });
    expect(await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui' }), {})).toBe(false);
    expect(runner.calls).toHaveLength(0);
    expect(std.out()).toContain('✖ swiftui: the remote gate cannot run — `gh` is not on PATH');
  });

  test('--platform swiftui routes the whole component list into one batch', async () => {
    swiftLoop([SWIFT_REPORT, SWIFT_REPORT]);
    const seen = fakeGate();
    expect(await g.main(['--platform', 'swiftui', '--component', 'Button,Icon'])).toBe(0);
    expect(seen.batches).toEqual([['Button', 'Icon']]);
  });

  test('an up-to-date target is skipped and never reaches the gate', async () => {
    swiftLoop([SWIFT_REPORT]);
    const seen = fakeGate();
    const lock: g.Lock = { 'Button.swiftui': entry(g.sha('button spec')) };
    expect(await g.generateBatch(['Button'], 'swiftui', args({ platform: 'swiftui' }), lock)).toBe(true);
    expect(seen.batches).toEqual([]);
    expect(std.out()).toContain('= Button.swiftui: up to date');
  });

  test('--dry-run prints the prompt and pushes nothing', async () => {
    swiftLoop([]);
    const seen = fakeGate();
    expect(await g.main(['--platform', 'swiftui', '--component', 'Button', '--dry-run'])).toBe(0);
    expect(seen.batches).toEqual([]);
    expect(seen.preflights).toBe(0);
    expect(std.out()).toContain('task');
  });
});

describe('the tool as a script', () => {
  test('the lock directory and the prompts folder are the committed ones', () => {
    expect(savedPaths.PROMPTS.replaceAll('\\', '/')).toMatch(/generated\/prompts$/);
    expect(savedPaths.LOCK_DIR.replaceAll('\\', '/')).toMatch(/\/generated$/);
    expect(savedPaths.GAPS.replaceAll('\\', '/')).toMatch(/generated\/gaps$/);
    expect(join(savedPaths.LOCK_DIR, 'generate.lock.web.json').replaceAll('\\', '/')).toMatch(/generated\/generate\.lock\.web\.json$/);
  });

  test('the real lockfiles on disk still parse and carry a hash per target', () => {
    for (const platform of ['web', 'lit', 'rn']) {
      const path = join(savedPaths.LOCK_DIR, `generate.lock.${platform}.json`);
      if (!existsSync(path)) continue;
      expect(statSync(path).size).toBeGreaterThan(0);
      const lock = JSON.parse(readFileSync(path, 'utf8')) as g.Lock;
      for (const [key, e] of Object.entries(lock)) {
        expect(key.endsWith(`.${platform}`), `${key} is in the ${platform} lockfile`).toBe(true);
        expect(e).toHaveProperty('hash');
      }
    }
  });
});
