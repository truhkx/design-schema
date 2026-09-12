/**
 * tools/checks.ts — the gate table and the process runner behind `pnpm gates`.
 *
 * The gates themselves are covered by their own tests (parse, contrast, literals, …); what matters here
 * is the table (which gate runs for which platform, with which argv), the argparse-compatible flags and
 * what `runGate` makes of a process's exit code and output. The runner is exercised against `node -e`
 * rather than a real gate so the suite stays fast and needs no browsers.
 */
import { describe, expect, test } from 'vitest';

import * as checks from '../checks.ts';
import type { Gate } from '../checks.ts';
import { useStd } from './fixtures.ts';

const std = useStd();

const names = (platform: string, skip: string[] = [], extra: string[] = []): string[] =>
  checks.gatesFor(platform, new Set(skip), new Set(extra)).map((g) => g.name);

const gate = (name: string, argv: string[]): Gate => ({ name, argv, cwd: checks.ROOT });
const nodeGate = (code: string): Gate => gate('probe', [process.execPath, '-e', code]);

describe('the gate table', () => {
  test('every platform runs the six cheap gates in order', () => {
    for (const platform of ['web', 'lit', 'rn']) {
      expect(names(platform)).toEqual(['parse', 'contrast', 'literals', 'typecheck', 'deps', 'modules']);
    }
  });

  test('swiftui runs the doc gates only — its build half is the macOS workflow', () => {
    expect(names('swiftui')).toEqual(['parse', 'contrast']);
    // No pnpm gate may be pointed at a Swift package: there is no @design-schema/swiftui to filter.
    expect(checks.gatesFor('swiftui', new Set(), new Set(['keyboard', 'axe', 'behavior']))).toEqual(checks.gatesFor('swiftui'));
  });

  test('--skip removes a gate by name', () => {
    expect(names('web', ['typecheck', 'deps'])).toEqual(['parse', 'contrast', 'literals', 'modules']);
  });

  test('the browser gates are opt-in and keyboard is web/lit only', () => {
    expect(names('web', [], ['keyboard'])).toContain('keyboard');
    expect(names('web', [], ['keyboard'])).toContain('keyboard-run');
    expect(names('lit', [], ['keyboard'])).toContain('keyboard');
    expect(names('rn', [], ['keyboard'])).not.toContain('keyboard'); // no Playwright project for RN
    expect(names('rn', [], ['axe'])).toContain('axe');
    expect(names('web', [], ['behavior'])).toEqual(expect.arrayContaining(['behavior', 'behavior-run']));
  });

  test('the TypeScript gates run through Node with the tsx fallback', () => {
    const parse = checks.gatesFor('web').find((g) => g.name === 'parse') as Gate;
    expect(parse.argv.slice(1, 3)).toEqual(['--import', 'tsx']);
    expect(parse.argv[3]?.replaceAll('\\', '/')).toMatch(/tools\/parse\.ts$/);
    expect(parse.cwd).toBe(checks.ROOT);
  });

  test('the literals gate is scoped to the platform and the package gates to its package', () => {
    const literals = checks.gatesFor('rn').find((g) => g.name === 'literals') as Gate;
    expect(literals.argv.slice(-2)).toEqual(['--platform', 'rn']);
    const typecheck = checks.gatesFor('rn').find((g) => g.name === 'typecheck') as Gate;
    expect(typecheck.argv.slice(1)).toEqual(['--filter', '@design-schema/rn', 'typecheck']);
  });

  test('the deps and modules gates are TypeScript too — no interpreter but Node', () => {
    for (const [name, file] of [['deps', 'check_deps.ts'], ['modules', 'check_modules.ts']] as const) {
      const g = checks.gatesFor('lit').find((x) => x.name === name) as Gate;
      expect(g.argv.slice(0, 3)).toEqual([checks.node(), '--import', 'tsx']);
      expect(g.argv[3]?.replaceAll('\\', '/')).toMatch(new RegExp(`tools/${file.replace('.', '\\.')}$`));
      expect(g.argv.slice(-2)).toEqual(['--platform', 'lit']);
    }
  });
});

describe('runGate', () => {
  test('exit 0 passes and stdout and stderr are merged and stripped', () => {
    const r = checks.runGate(nodeGate('console.log("  out  "); console.error("err")'));
    expect(r).toEqual({ name: 'probe', ok: true, output: 'out  \nerr' });
  });

  test('a non-zero exit fails the gate but keeps its output', () => {
    const r = checks.runGate(nodeGate('console.log("nope"); process.exit(3)'));
    expect(r.ok).toBe(false);
    expect(r.output).toBe('nope');
  });

  test('an empty run is a pass with no output', () => {
    expect(checks.runGate(nodeGate(''))).toEqual({ name: 'probe', ok: true, output: '' });
  });

  test('a command that does not exist fails rather than throwing', () => {
    const r = checks.runGate(gate('missing', ['definitely-not-a-real-command-303']));
    expect(r.ok).toBe(false);
    expect(r.output).not.toBe('');
  });
});

describe('runAll', () => {
  test('skipping everything runs nothing and prints nothing', () => {
    const skip = ['parse', 'contrast', 'literals', 'typecheck', 'deps', 'modules'];
    expect(checks.runAll('web', new Set(skip))).toEqual([]);
    expect(std.out()).toBe('');
  });
});

describe('failuresAsPrompt', () => {
  test('only failing gates reach the model, fenced and named', () => {
    const results = [
      { name: 'parse', ok: true, output: 'fine' },
      { name: 'typecheck', ok: false, output: 'error TS2322' },
    ];
    expect(checks.failuresAsPrompt(results)).toBe('### Gate `typecheck` FAILED\n```\nerror TS2322\n```');
  });

  test('long output is trimmed from the front, keeping the end', () => {
    const out = 'x'.repeat(20) + 'END';
    expect(checks.failuresAsPrompt([{ name: 'g', ok: false, output: out }], 5)).toContain('\nxxEND\n');
  });

  test('all green is the empty string', () => {
    expect(checks.failuresAsPrompt([{ name: 'parse', ok: true, output: '' }])).toBe('');
  });
});

describe('the command line', () => {
  test('--platform is required and validated', () => {
    expect(checks.main([])).toBe(2);
    expect(std.err()).toContain('the following arguments are required: --platform');
    expect(checks.main(['--platform', 'nope'])).toBe(2);
    expect(std.err()).toContain("invalid choice: 'nope' (choose from web, lit, rn, swiftui)");
  });

  test('--skip and --with are repeatable', () => {
    const a = checks.parseArgs(['--platform', 'web', '--skip', 'typecheck', '--skip', 'deps', '--with', 'axe', '--with', 'behavior']);
    expect(a).toEqual({ platform: 'web', skip: ['typecheck', 'deps'], extra: ['axe', 'behavior'], json: false });
  });

  test('--json is accepted and stays out of the usage line', () => {
    expect(checks.parseArgs(['--platform', 'lit', '--json']).json).toBe(true);
    expect(checks.main(['--bogus'])).toBe(2);
    expect(std.err()).toContain('usage: checks.ts [-h] --platform {web,lit,rn,swiftui} [--skip SKIP] [--with EXTRA]\n');
    expect(std.err()).not.toContain('[--json]');
  });

  test('a missing required argument is reported before an unrecognized one, as argparse does', () => {
    expect(checks.main(['--bogus'])).toBe(2);
    expect(std.err()).toContain('the following arguments are required: --platform');
  });

  test('--help exits 0 with the usage line', () => {
    expect(checks.main(['--help'])).toBe(0);
    expect(std.out()).toBe('usage: checks.ts [-h] --platform {web,lit,rn,swiftui} [--skip SKIP] [--with EXTRA]\n');
  });
});
