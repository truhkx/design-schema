/** tools/regen.ts — the cross-platform regen.ps1. Every process-starting hook is a fake; nothing here runs a model. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { readPhases } from '../lib/phases.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as regen from '../regen.ts';
import type { RunOptions } from '../regen.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

type Call = { cmd: string; args: string[]; input: string | undefined };
let calls: Call[] = [];
let sleeps = 0;

const PHASES = readPhases();
const NAMES = PHASES.map((p) => p.name);

const savedPaths = { ...regen.paths };
const savedHooks = { ...regen.hooks };
const savedModel = process.env.DS_MODEL;

beforeEach(() => {
  calls = [];
  sleeps = 0;
  const dir = tmp();
  Object.assign(regen.paths, {
    ROOT: dir,
    LOGS: join(dir, 'logs'),
    FOLD_LOCK: join(dir, 'generated', 'fold.lock'),
    FOLD_PROMPT: join(dir, 'prompts', 'fold-gaps.md'),
  });
  regen.hooks.run = async (cmd: string, args: string[]): Promise<number> => {
    throw new Error(`process started without a fake: ${cmd} ${args.join(' ')}`);
  };
  regen.hooks.commit = async (message: string): Promise<number> => {
    throw new Error(`commit without a fake: ${message}`);
  };
  regen.hooks.which = () => null;
  regen.hooks.sleep = async () => {
    sleeps += 1;
  };
});

afterEach(() => {
  Object.assign(regen.paths, savedPaths);
  Object.assign(regen.hooks, savedHooks);
  if (savedModel === undefined) delete process.env.DS_MODEL;
  else process.env.DS_MODEL = savedModel;
});

/** Record every process and commit; `exit` picks each process's exit code (0 by default). */
function fake(exit: (call: Call) => number = () => 0): void {
  regen.hooks.run = async (cmd: string, args: string[], options: RunOptions = {}): Promise<number> => {
    const call = { cmd, args, input: options.input };
    calls.push(call);
    return exit(call);
  };
  regen.hooks.commit = async (message: string): Promise<number> => {
    calls.push({ cmd: 'commit', args: [message], input: undefined });
    return 0;
  };
}

const shown = (call: Call): string => [call.cmd === process.execPath ? 'node' : call.cmd, ...call.args].join(' ');
const lines = (): string[] => calls.map(shown);
const logText = (name = 'regen.log'): string => readFileSync(join(tmp(), 'logs', name), 'utf8');
const isParse = (call: Call): boolean => shown(call) === 'pnpm parse';
const generateFor = (name: string): string => {
  const phase = PHASES.find((p) => p.name === name);
  if (phase === undefined) throw new Error(`no phase ${name}`);
  return phase.pattern !== undefined ? `--pattern ${phase.pattern}` : `--component ${(phase.components ?? []).join(',')}`;
};

describe('arguments', () => {
  test('defaults match regen.ps1', () => {
    expect(regen.parseArgs([])).toEqual({
      from: '', phase: '', platform: 'web,lit,rn', noPause: false, force: false, gates: false,
      dryRun: false, autoFold: false, foldModel: 'sonnet', model: '',
    });
  });

  test('every flag', () => {
    expect(
      regen.parseArgs(['--from', 'Core', '--phase', 'Focus', '--platform', 'web', '--no-pause', '--force', '--gates',
        '--dry-run', '--auto-fold', '--fold-model', 'opus', '--model', 'fable']),
    ).toEqual({
      from: 'Core', phase: 'Focus', platform: 'web', noPause: true, force: true, gates: true,
      dryRun: true, autoFold: true, foldModel: 'opus', model: 'fable',
    });
  });

  test('--flag=value', () => {
    expect(regen.parseArgs(['--from=Core', '--phase=Focus', '--platform=web,lit', '--fold-model=opus', '--model=fable'])).toMatchObject({
      from: 'Core', phase: 'Focus', platform: 'web,lit', foldModel: 'opus', model: 'fable',
    });
  });

  test('a bare -- is ignored', () => {
    expect(regen.parseArgs(['--', '--force', '--', '--from', 'Core'])).toMatchObject({ force: true, from: 'Core' });
  });

  test('an unknown flag exits 2', async () => {
    expect(await regen.main(['--dry-run', '--bogus'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --bogus');
    expect(await regen.main(['--dry-run', '--force=yes'])).toBe(2);
    expect(await regen.main(['--dry-run', '--from'])).toBe(2);
    expect(std.err()).toContain('argument --from: expected one argument');
    expect(std.out()).toBe('');
  });

  test('--help exits 0', async () => {
    expect(await regen.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: regen.ts');
    expect(await regen.main(['-h'])).toBe(0);
  });
});

describe('plan', () => {
  test('all phases by default', async () => {
    expect(await regen.main(['--dry-run'])).toBe(0);
    expect(std.out()).toContain(`Plan: ${NAMES.join(' -> ')}  platforms=web,lit,rn force=false gates=false pause=true\n`);
    expect(regen.selectPlan(PHASES, '', '').map((p) => p.name)).toEqual(NAMES);
  });

  test('--from Overlays runs Overlays through Patterns', () => {
    const plan = regen.selectPlan(PHASES, 'Overlays', '').map((p) => p.name);
    expect(plan).toEqual(NAMES.slice(NAMES.indexOf('Overlays')));
    expect(plan[0]).toBe('Overlays');
    expect(plan.at(-1)).toBe('Patterns');
  });

  test('--phase Overlays runs exactly one, and wins over --from', async () => {
    expect(regen.selectPlan(PHASES, '', 'Overlays').map((p) => p.name)).toEqual(['Overlays']);
    expect(await regen.main(['--dry-run', '--from', 'Core', '--phase', 'Overlays'])).toBe(0);
    expect(std.out()).toContain('Plan: Overlays  platforms=');
  });

  test('an unknown --from or --phase exits 1 and lists the phases', async () => {
    expect(await regen.main(['--dry-run', '--phase', 'Nope'])).toBe(1);
    expect(std.err()).toContain(`No phase named 'Nope'. Phases: ${NAMES.join(', ')}`);
    expect(await regen.main(['--dry-run', '--from', 'Nope'])).toBe(1);
    expect(std.err()).toContain(`No phase matches --from 'Nope'. Phases: ${NAMES.join(', ')}`);
    expect(std.out()).toBe('');
  });

  test('an unknown platform exits 1', async () => {
    expect(await regen.main(['--dry-run', '--platform', 'web,android'])).toBe(1);
    expect(std.err()).toContain("Unknown platform 'android'. Known: web, lit, rn, swiftui");
    expect(await regen.main(['--dry-run', '--platform', ' , '])).toBe(1);
  });

  test('swiftui without gh exits 1', async () => {
    const which = vi.fn(() => null);
    regen.hooks.which = which;
    expect(await regen.main(['--platform', 'web,swiftui'])).toBe(1);
    expect(which).toHaveBeenCalledWith('gh');
    expect(std.err()).toContain('swiftui needs the GitHub CLI');
    expect(existsSync(regen.paths.LOGS)).toBe(false);
  });
});

describe('dry run', () => {
  test('names every phase, the pattern, the pause and the resume line', async () => {
    expect(await regen.main(['--dry-run'])).toBe(0);
    const out = std.out();
    for (const phase of PHASES) {
      expect(out).toContain(`  ${phase.name}: `);
      expect(out).toContain(`  $ node --import tsx tools/generate.ts --platform web,lit,rn ${generateFor(phase.name)}\n`);
      expect(out).toContain(`  $ pnpm commit -m "regen: phase ${phase.name} (web,lit,rn) exit <code>"`);
    }
    expect(out).toContain('  Patterns: pattern SettingsPage');
    expect(out).toContain('--pattern SettingsPage');
    expect(out).toContain('  $ pnpm themes\n  $ pnpm parse\n');
    expect(out).toContain('  $ node --import tsx tools/gap_digest.ts --phase Primitives\n  stops here (exit 3); resume with: pnpm regen --from Core --platform web,lit,rn\n');
    expect(out.split('stops here').length - 1).toBe(PHASES.length - 1); // the last phase never pauses
    expect(out).toContain('  $ pnpm mcp:index\n  $ node --import tsx tools/generate.ts --check\n  $ node --import tsx tools/gap_digest.ts --phase final\n  $ pnpm commit -m "regen: complete (web,lit,rn)"\n');
    expect(out).not.toContain('claude');
    expect(out).not.toContain('playwright');
    expect(out).not.toContain('DS_MODEL');
  });

  test('--auto-fold shows the claude argv instead of the pause', async () => {
    expect(await regen.main(['--dry-run', '--auto-fold'])).toBe(0);
    const out = std.out();
    expect(out).toContain(
      `  $ node --import tsx tools/gap_digest.ts --phase Primitives\n` +
        `  $ claude -p --model sonnet --permission-mode acceptEdits --allowedTools "${regen.FOLD_ALLOWED_TOOLS}" --disallowedTools "${regen.FOLD_DISALLOWED_TOOLS}" < prompts/fold-gaps.md\n` +
        '  $ pnpm parse\n',
    );
    expect(out).not.toContain('stops here');
    expect(out.split('$ claude ').length - 1).toBe(PHASES.length - 1);
  });

  test('--no-pause neither pauses nor folds', async () => {
    expect(await regen.main(['--dry-run', '--no-pause'])).toBe(0);
    expect(std.out()).not.toContain('stops here');
    expect(std.out()).not.toContain('gap_digest.ts --phase Primitives');
    expect(std.out()).toContain('pause=false');
  });

  test('--gates adds the browser gates and the Playwright install; --force adds --force; --model shows DS_MODEL', async () => {
    expect(await regen.main(['--dry-run', '--gates', '--force', '--model', 'opus', '--phase', 'Core'])).toBe(0);
    const out = std.out();
    expect(out).toContain('  $ pnpm exec playwright install chromium\n');
    expect(out).toContain(`tools/generate.ts --platform web,lit,rn ${generateFor('Core')} --force --with keyboard --with axe\n`);
    expect(out).toContain('DS_MODEL=opus');
  });

  test('--gates for swiftui alone adds no install', async () => {
    regen.hooks.which = (name: string) => (name === 'gh' ? '/usr/bin/gh' : null);
    expect(await regen.main(['--dry-run', '--gates', '--platform', 'swiftui'])).toBe(0);
    expect(std.out()).not.toContain('playwright');
    expect(std.out()).not.toContain('--with');
    expect(std.out()).toContain('gates=true');
  });

  test('starts nothing, commits nothing, looks for no claude, writes no log or lock', async () => {
    const run = vi.fn(regen.hooks.run);
    const commit = vi.fn(regen.hooks.commit);
    const which = vi.fn(() => '/usr/bin/tool');
    Object.assign(regen.hooks, { run, commit, which });
    expect(await regen.main(['--dry-run', '--auto-fold', '--gates', '--model', 'opus', '--platform', 'web'])).toBe(0);
    expect(run).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    expect(which).not.toHaveBeenCalledWith('claude');
    expect(which).not.toHaveBeenCalledWith('claude.cmd');
    expect(existsSync(join(tmp(), 'logs'))).toBe(false);
    expect(existsSync(regen.paths.FOLD_LOCK)).toBe(false);
    expect(process.env.DS_MODEL).toBe(savedModel);
  });
});

describe('real run with fakes', () => {
  test('pauses after the first phase by default', async () => {
    fake();
    expect(await regen.main([])).toBe(3);
    expect(lines()).toEqual([
      'pnpm themes',
      'pnpm parse',
      `node --import tsx tools/generate.ts --platform web,lit,rn ${generateFor('Primitives')}`,
      'commit regen: phase Primitives (web,lit,rn) exit 0',
      'node --import tsx tools/gap_digest.ts --phase Primitives',
    ]);
    const log = logText();
    expect(log.startsWith('== regen ')).toBe(true);
    expect(log.split('\n')[0]).toMatch(/^== regen \d{4}-\d\d-\d\dT\d\d:\d\d:\d\d platforms=web,lit,rn ==$/);
    expect(log).toContain('  pnpm regen --from Core --platform web,lit,rn\n');
    expect(log).not.toContain('== done ==');
    expect(std.out()).toContain('Paused for gap folding.');
  });

  test('a parse failure exits 1 before any generate', async () => {
    fake((call) => (isParse(call) ? 1 : 0));
    expect(await regen.main(['--no-pause'])).toBe(1);
    expect(lines()).toEqual(['pnpm themes', 'pnpm parse']);
    expect(logText()).toContain('parse failed: fix the docs above before regenerating');
  });

  test('a themes failure exits 1', async () => {
    fake((call) => (shown(call) === 'pnpm themes' ? 1 : 0));
    expect(await regen.main([])).toBe(1);
    expect(lines()).toEqual(['pnpm themes']);
  });

  test('a failed phase still commits its exit code and the run continues', async () => {
    fake((call) => (call.args.includes('--component') && call.args.includes('Splitter,Feed') ? 1 : 0));
    expect(await regen.main(['--from', 'Streams', '--no-pause'])).toBe(0);
    expect(lines()).toContain('commit regen: phase Streams (web,lit,rn) exit 1');
    expect(lines()).toContain('node --import tsx tools/generate.ts --platform web,lit,rn --pattern SettingsPage');
    expect(logText()).toContain('Phase Streams finished with failures (exit 1).');
  });

  test('--no-pause runs every phase and the final steps, and the log ends with == done ==', async () => {
    fake();
    expect(await regen.main(['--no-pause'])).toBe(0);
    const ran = lines();
    for (const phase of PHASES) {
      expect(ran).toContain(`node --import tsx tools/generate.ts --platform web,lit,rn ${generateFor(phase.name)}`);
      expect(ran).toContain(`commit regen: phase ${phase.name} (web,lit,rn) exit 0`);
    }
    expect(ran.slice(-4)).toEqual([
      'pnpm mcp:index',
      'node --import tsx tools/generate.ts --check',
      'node --import tsx tools/gap_digest.ts --phase final',
      'commit regen: complete (web,lit,rn)',
    ]);
    expect(ran.filter((l) => l.includes('gap_digest'))).toEqual(['node --import tsx tools/gap_digest.ts --phase final']);
    expect(logText().endsWith('== done ==\n')).toBe(true);
  });

  test('the final --check exit is ignored', async () => {
    fake((call) => (call.args.includes('--check') ? 1 : 0));
    expect(await regen.main(['--phase', 'Patterns'])).toBe(0);
    expect(logText().endsWith('== done ==\n')).toBe(true);
  });

  test('--platform web logs to regen-web.log; --gates installs Playwright first; --model reaches the children', async () => {
    const seen: (string | undefined)[] = [];
    fake(() => {
      seen.push(process.env.DS_MODEL);
      return 0;
    });
    expect(await regen.main(['--platform', 'web', '--phase', 'Core', '--gates', '--model', 'opus'])).toBe(0);
    expect(existsSync(join(tmp(), 'logs', 'regen-web.log'))).toBe(true);
    expect(existsSync(join(tmp(), 'logs', 'regen.log'))).toBe(false);
    expect(logText('regen-web.log')).toContain('platforms=web ==');
    expect(lines().slice(0, 4)).toEqual([
      'pnpm themes',
      'pnpm parse',
      'pnpm exec playwright install chromium',
      `node --import tsx tools/generate.ts --platform web ${generateFor('Core')} --with keyboard --with axe`,
    ]);
    expect(lines()).toContain('commit regen: complete (web)');
    expect(seen.every((m) => m === 'opus')).toBe(true);
  });
});

describe('auto-fold with fakes', () => {
  const withClaude = (name: string): string | null => (name === 'claude' ? '/fake/bin/claude' : null);

  test('claude gets prompts/fold-gaps.md on stdin and FOLD_ALLOWED_TOOLS, under the lock', async () => {
    regen.paths.FOLD_PROMPT = join(REPO_ROOT, 'prompts', 'fold-gaps.md');
    regen.hooks.which = withClaude;
    let lockedDuringFold = false;
    fake((call) => {
      if (call.cmd === '/fake/bin/claude') lockedDuringFold = existsSync(regen.paths.FOLD_LOCK);
      return 0;
    });
    expect(await regen.main(['--from', 'Streams', '--auto-fold'])).toBe(0);
    const claude = calls.find((c) => c.cmd === '/fake/bin/claude');
    expect(claude?.args).toEqual(['-p', '--model', 'sonnet', '--permission-mode', 'acceptEdits', '--allowedTools', regen.FOLD_ALLOWED_TOOLS, '--disallowedTools', regen.FOLD_DISALLOWED_TOOLS]);
    expect(claude?.input).toBe(readFileSync(join(REPO_ROOT, 'prompts', 'fold-gaps.md'), 'utf8'));
    expect(lockedDuringFold).toBe(true);
    expect(existsSync(regen.paths.FOLD_LOCK)).toBe(false);
    const ran = lines();
    const at = ran.indexOf(shown(claude as Call));
    expect(ran[at - 1]).toBe('node --import tsx tools/gap_digest.ts --phase Streams');
    expect(ran[at + 1]).toBe('pnpm parse');
    expect(ran).toContain('node --import tsx tools/generate.ts --platform web,lit,rn --pattern SettingsPage');
    expect(logText()).toContain('== auto-fold (sonnet) after Streams ==');
    expect(logText().endsWith('== done ==\n')).toBe(true);
  });

  test('a parse failure after the fold exits 4 and removes the lock', async () => {
    write(regen.paths.FOLD_PROMPT, 'fold them\n');
    regen.hooks.which = withClaude;
    let parses = 0;
    fake((call) => (isParse(call) && ++parses === 2 ? 1 : 0));
    expect(await regen.main(['--from', 'Streams', '--auto-fold'])).toBe(4);
    expect(existsSync(regen.paths.FOLD_LOCK)).toBe(false);
    expect(lines().at(-1)).toBe('pnpm parse');
    expect(lines().some((l) => l.includes('SettingsPage'))).toBe(false);
    expect(logText()).toContain('auto-fold left the docs unparseable: stopping so a human can look (git diff site/src/content/docs).');
  });

  test('a lock held past 1800 s skips the fold', async () => {
    write(regen.paths.FOLD_LOCK, 'web Core 2026-09-15T00:00:00\n');
    const which = vi.fn(withClaude);
    regen.hooks.which = which;
    fake();
    expect(await regen.main(['--from', 'Streams', '--auto-fold'])).toBe(0);
    expect(sleeps).toBe(1800 / 15);
    expect(which).not.toHaveBeenCalled();
    expect(calls.some((c) => c.cmd === '/fake/bin/claude')).toBe(false);
    expect(logText()).toContain('fold lock held for 30 min; skipping auto-fold for Streams');
    expect(existsSync(regen.paths.FOLD_LOCK)).toBe(true); // another window's lock is not ours to remove
  });

  test('no claude on PATH exits 1 without taking the lock', async () => {
    write(regen.paths.FOLD_PROMPT, 'fold them\n');
    fake();
    expect(await regen.main(['--from', 'Streams', '--auto-fold'])).toBe(1);
    expect(existsSync(regen.paths.FOLD_LOCK)).toBe(false);
    expect(logText()).toContain('`claude` CLI not found on PATH');
  });
});

describe('parity with regen.ps1', () => {
  const ps1 = readFileSync(join(REPO_ROOT, 'regen.ps1'), 'utf8');

  test('every parameter maps to a flag with the same default', () => {
    const block = /param\(([\s\S]*?)\n\)/.exec(ps1)?.[1] ?? '';
    const params = [...block.matchAll(/\[(string|switch)\]\$(\w+)(?:\s*=\s*"([^"]*)")?/g)];
    expect(params.map((m) => m[2])).toEqual(['From', 'Phase', 'Platform', 'NoPause', 'Force', 'Gates', 'DryRun', 'AutoFold', 'FoldModel', 'Model']);
    const defaults = regen.parseArgs([]) as unknown as Record<string, string | boolean>;
    for (const [, type, name, value] of params) {
      const n = name as string;
      const flag = `--${n.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
      expect(regen.FLAGS).toContain(flag);
      const key = n[0]?.toLowerCase() + n.slice(1);
      expect(defaults[key]).toEqual(type === 'switch' ? false : (value ?? ''));
    }
    expect(regen.FLAGS).toHaveLength(params.length);
  });

  test('the auto-fold --allowedTools string is FOLD_ALLOWED_TOOLS', () => {
    const allowed = [...ps1.matchAll(/--allowedTools "([^"]+)"/g)].map((m) => m[1]);
    expect(allowed).toEqual([regen.FOLD_ALLOWED_TOOLS]);
    const denied = [...ps1.matchAll(/--disallowedTools "([^"]+)"/g)].map((m) => m[1]);
    expect(denied).toEqual([regen.FOLD_DISALLOWED_TOOLS]);
  });

  test('the fold allow list covers the fold prompt and nothing that deletes, pushes or installs', () => {
    const entries = regen.FOLD_ALLOWED_TOOLS.split(',');
    for (const need of ['Bash(node --import tsx tools/*)', 'Bash(node logs/*.mjs)', 'Bash(pnpm parse)', 'Bash(pnpm commit*)', 'Bash(grep:*)', 'Bash(ls:*)', 'Bash(awk:*)']) {
      expect(entries).toContain(need);
    }
    for (const broad of ['Bash(pnpm *)', 'Bash(git *)', 'Bash(*)', 'Bash']) expect(entries).not.toContain(broad);
    expect(entries.filter((e) => /\b(rm|push|install|add|dlx|npx|curl|wget)\b/.test(e))).toEqual([]);
    const denied = regen.FOLD_DISALLOWED_TOOLS.split(',');
    for (const deny of ['WebFetch', 'WebSearch', 'Bash(rm:*)', 'Bash(git push:*)']) expect(denied).toContain(deny);
  });
});

describe('package.json', () => {
  const scripts = (JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }).scripts;

  test('generate parses before it generates', () => {
    const generate = scripts.generate ?? '';
    expect(generate).toContain('tools/parse.ts');
    expect(generate.indexOf('tools/parse.ts')).toBeLessThan(generate.indexOf('tools/generate.ts'));
    expect(generate.endsWith('tools/generate.ts')).toBe(true); // forwarded arguments reach generate.ts
    expect(scripts['generate:check']).not.toContain('parse');
  });

  test('regen runs tools/regen.ts', () => {
    expect(scripts.regen).toContain('tools/regen.ts');
  });
});
