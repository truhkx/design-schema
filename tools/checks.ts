#!/usr/bin/env node
/**
 * The deterministic gates a generated component must pass. Used by tools/generate.py after
 * every model round, and runnable on its own as a build step:
 *
 *     node tools/checks.ts --platform web            # all gates for one platform
 *     node tools/checks.ts --platform rn --skip typecheck
 *
 * Each gate is a (name, argv, cwd) triple. A gate passes when its process exits 0. The
 * model never sees the gate definitions, only their output — the docs are the spec, these
 * are the rubric.
 *
 * Gates today:
 *   literals   tools/lint_literals.ts            no hex/px/ms/font literals in the package
 *   typecheck  pnpm --filter <pkg> typecheck     the real TypeScript typings (needs node_modules)
 *   deps       tools/check_deps.py                the package gained no runtime dependency outside the allowed set
 *   modules    tools/check_modules.py             every module an extension declares exists, exports its name and matches its signature stub
 *   keyboard   tools/keyboard_tests.ts + Playwright   every `keyboard` rule with an `expect`, against the Keyboard story  (--with keyboard)
 *   axe        tests/gates/axe.spec.ts + Playwright   axe over every story, light and dark                                (--with axe)
 *   behavior   tools/behavior_tests.ts + pnpm test    every `behavior` scenario, against the real component module        (--with behavior)
 *   contrast   tools/check_contrast.ts           every declared pair, every theme × mode (doc-level, cheap, run anyway)
 *   parse      tools/parse.ts                    the docs still validate (a generator may not edit docs, but be sure)
 *
 * Planned (see process/generation-pipeline.md): axe over Storybook stories; Playwright keyboard tests
 * derived from a11y.requires; a "no new dependencies" diff on package.json.
 *
 * Port of tools/checks.py: same flags, same gates, same lines on stdout, same exit codes. `--json`
 * is the one addition — the machine-readable results tools/generate.py reads until step 5 of
 * process/typescript-and-currency.md ports the generator itself. Runs under Node's type stripping:
 * annotations only.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ljust, pySplitlines, pyStrip } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

export const ROOT: string = REPO_ROOT;
export const PKG: Record<string, string> = { web: 'react', lit: 'lit', rn: 'rn' };

export type Gate = { name: string; argv: string[]; cwd: string };
export type GateResult = { name: string; ok: boolean; output: string };

/** `shutil.which(cmd)`: the first PATH entry that exists, trying every PATHEXT suffix on Windows. */
function which(cmd: string): string | null {
  const exts = process.platform === 'win32' ? (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';') : [''];
  const dirs = (process.env.PATH ?? '').split(delimiter);
  if (process.platform === 'win32') dirs.unshift(process.cwd());
  for (const dir of dirs) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = join(dir, cmd + (cmd.toLowerCase().endsWith(ext.toLowerCase()) ? '' : ext));
      try {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
      } catch {
        // an unreadable PATH entry is not a match
      }
    }
  }
  return null;
}

export function pnpm(): string {
  return which('pnpm') ?? which('pnpm.cmd') ?? 'pnpm';
}

export function node(): string {
  return which('node') ?? 'node';
}

let pythonCache: string[] | null = null;

/** `sys.executable` in the Python original: the interpreter tools/py.mjs would have launched. */
export function python(): string[] {
  if (pythonCache) return pythonCache;
  const candidates = process.platform === 'win32' ? [['py', '-3'], ['python'], ['python3']] : [['python3'], ['python'], ['py', '-3']];
  for (const candidate of candidates) {
    const found = which(candidate[0] as string);
    if (!found) continue;
    const probe = spawnSync(found, [...candidate.slice(1), '--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) return (pythonCache = [found, ...candidate.slice(1)]);
  }
  return (pythonCache = [process.platform === 'win32' ? 'py' : 'python3', ...(process.platform === 'win32' ? ['-3'] : [])]);
}

export const BROWSER_GATES: ReadonlySet<string> = new Set(['keyboard', 'axe']); // need Playwright + browsers; opt in with --with

export function gatesFor(platform: string, skip: Set<string> = new Set(), extra: Set<string> = new Set()): Gate[] {
  const pkg = PKG[platform] as string;
  const gate = (name: string, argv: string[]): Gate => ({ name, argv, cwd: ROOT });
  const tool = (file: string, ...args: string[]): string[] => [node(), '--import', 'tsx', join(ROOT, 'tools', file), ...args];
  const allGates: Gate[] = [
    // The parser, the contrast gate and the literals gate are TypeScript: `--import tsx` runs the
    // .ts file on any Node ≥ 22 (native type stripping needs 22.18+).
    gate('parse', tool('parse.ts')),
    gate('contrast', tool('check_contrast.ts')),
    gate('literals', tool('lint_literals.ts', '--platform', platform)),
    gate('typecheck', [pnpm(), '--filter', `@design-schema/${pkg}`, 'typecheck']),
    gate('deps', [...python(), join(ROOT, 'tools', 'check_deps.py'), '--platform', platform]),
    gate('modules', [...python(), join(ROOT, 'tools', 'check_modules.py'), '--platform', platform]),
  ];
  if (extra.has('keyboard') && (platform === 'web' || platform === 'lit')) {
    allGates.push(gate('keyboard', tool('keyboard_tests.ts')));
    allGates.push(gate('keyboard-run', [pnpm(), 'exec', 'playwright', 'test', `--project=keyboard-${platform}`]));
  }
  if (extra.has('axe')) {
    allGates.push(gate('axe', [pnpm(), 'exec', 'playwright', 'test', `--project=axe-${platform}`]));
  }
  if (extra.has('behavior')) {
    allGates.push(gate('behavior', tool('behavior_tests.ts')));
    // `pnpm --filter <pkg> test -- <pattern>` forwards a literal "--" into vitest/jest on this
    // pnpm (10.17), which then ignores the pattern and runs every test file; `run test <pattern>`
    // (no "--") forwards the pattern alone and filters correctly on all three runners.
    allGates.push(gate('behavior-run', [pnpm(), '--filter', `@design-schema/${pkg}`, 'run', 'test', 'generated/behavior']));
  }
  return allGates.filter((g) => !skip.has(g.name));
}

/** cmd.exe needs the quoting `subprocess` does for us on POSIX; the repo path has a space in it. */
function winQuote(arg: string): string {
  if (arg === '') return '""'; // an unquoted empty argument would vanish on the command line
  return /[\s"^&|<>()]/.test(arg) ? `"${arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1')}"` : arg;
}

export function runGate(g: Gate): GateResult {
  const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', FORCE_COLOR: '0' };
  const options = { cwd: g.cwd, env, encoding: 'buffer' as const, timeout: 900_000, maxBuffer: 64 * 1024 * 1024 };
  // Windows: `pnpm` is a `.cmd`, which Node will not spawn without a shell — so the command goes
  // through cmd.exe pre-quoted. POSIX spawns the argv directly, as subprocess.run(list) does.
  const p =
    process.platform === 'win32'
      ? spawnSync(g.argv.map(winQuote).join(' '), { ...options, shell: true })
      : spawnSync(g.argv[0] as string, g.argv.slice(1), options);
  if (p.error && (p.error as NodeJS.ErrnoException).code === 'ETIMEDOUT') return { name: g.name, ok: false, output: 'timed out after 900s' };
  if (p.error && (p.error as NodeJS.ErrnoException).code === 'ENOENT') {
    return { name: g.name, ok: false, output: `${g.argv[0] as string} not found: ${(p.error as Error).message}` };
  }
  const text = (b: Buffer | null): string => (b ?? Buffer.alloc(0)).toString('utf8').replace(/\r\n?/g, '\n'); // text mode: universal newlines
  const out = text(p.stdout) + text(p.stderr);
  return { name: g.name, ok: p.status === 0, output: pyStrip(out) };
}

export function runAll(platform: string, skip: Set<string> = new Set(), verbose: boolean = true, extra: Set<string> = new Set()): GateResult[] {
  const results: GateResult[] = [];
  for (const g of gatesFor(platform, skip, extra)) {
    const r = runGate(g);
    results.push(r);
    if (verbose) {
      const lines = pySplitlines(r.output);
      const tail = r.output ? (lines[lines.length - 1] as string) : '';
      process.stdout.write(`  ${r.ok ? '✔' : '✖'} ${ljust(r.name, 10)} ${[...tail].slice(0, 110).join('')}\n`);
    }
  }
  return results;
}

/** The text handed back to the model: only failing gates, trimmed. */
export function failuresAsPrompt(results: GateResult[], limit: number = 6000): string {
  const parts: string[] = [];
  for (const r of results) {
    if (r.ok) continue;
    const chars = [...r.output];
    const out = chars.length > limit ? chars.slice(-limit).join('') : r.output;
    parts.push(`### Gate \`${r.name}\` FAILED\n\`\`\`\n${out}\n\`\`\``);
  }
  return parts.join('\n\n');
}

export type Args = { platform: string; skip: string[]; extra: string[]; json: boolean };

/**
 * argparse's `--platform {web,lit,rn}` (required), `--skip` and `--with` (both repeatable), plus `--json`,
 * which stays out of the usage line the way an `argparse.SUPPRESS` help does.
 */
export function parseArgs(argv: string[], prog: string = 'checks.ts'): Args {
  const usage = `usage: ${prog} [-h] --platform {web,lit,rn} [--skip SKIP] [--with EXTRA]`;
  const die: (message: string) => never = (message) => {
    process.stderr.write(`${usage}\n${prog}: error: ${message}\n`);
    throw Object.assign(new Error(message), { exitCode: 2 });
  };
  const args: Args = { platform: '', skip: [], extra: [], json: false };
  const value = (arg: string, flag: string, i: { n: number }): string => {
    const v = arg.startsWith(`${flag}=`) ? arg.slice(flag.length + 1) : argv[++i.n];
    if (v === undefined) die(`argument ${flag}: expected one argument`);
    return v as string;
  };
  const i = { n: 0 };
  const unrecognized: string[] = [];
  for (; i.n < argv.length; i.n++) {
    const arg = argv[i.n] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${usage}\n`);
      throw Object.assign(new Error('help'), { exitCode: 0 });
    } else if (arg === '--platform' || arg.startsWith('--platform=')) {
      const v = value(arg, '--platform', i);
      if (!Object.hasOwn(PKG, v)) die(`argument --platform: invalid choice: '${v}' (choose from ${Object.keys(PKG).join(', ')})`);
      args.platform = v;
    } else if (arg === '--skip' || arg.startsWith('--skip=')) {
      args.skip.push(value(arg, '--skip', i));
    } else if (arg === '--with' || arg.startsWith('--with=')) {
      args.extra.push(value(arg, '--with', i));
    } else if (arg === '--json') {
      args.json = true;
    } else {
      unrecognized.push(arg); // argparse collects these and reports them *after* the required-argument check
    }
  }
  if (!args.platform) die('the following arguments are required: --platform');
  if (unrecognized.length > 0) die(`unrecognized arguments: ${unrecognized.join(' ')}`);
  return args;
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let a: Args;
  try {
    a = parseArgs(argv);
  } catch (e) {
    return (e as { exitCode?: number }).exitCode ?? 2;
  }
  if (a.json) {
    // Machine-readable: the results only, so the caller can print them its own way.
    const results = runAll(a.platform, new Set(a.skip), false, new Set(a.extra));
    process.stdout.write(JSON.stringify(results) + '\n');
    return results.every((r) => r.ok) ? 0 : 1;
  }
  process.stdout.write(`== gates for ${a.platform}\n`);
  const results = runAll(a.platform, new Set(a.skip), true, new Set(a.extra));
  const bad = results.filter((r) => !r.ok);
  for (const r of bad) process.stdout.write(`\n--- ${r.name}\n${[...r.output].slice(-3000).join('')}\n`);
  return bad.length > 0 ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
