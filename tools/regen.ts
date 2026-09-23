#!/usr/bin/env node
/**
 * Full regeneration of every component from the docs, in composition order (tools/regen-phases.json), with a
 * pause for gap folding between phases. The cross-platform port of regen.ps1, which stays the Windows
 * equivalent with the same flags in PascalCase (`-From`, `-NoPause`, ...).
 *
 *   pnpm regen                                  all phases, platforms web,lit,rn, pausing after each phase
 *   pnpm regen --platform web                   one platform (log: logs/regen-web.log)
 *   pnpm regen --platform swiftui               iOS: its gates run in GitHub Actions, so `gh` must be on PATH
 *   pnpm regen --from Overlays                  resume from a phase
 *   pnpm regen --phase Overlays                 exactly one phase (wins over --from)
 *   pnpm regen --no-pause                       do not stop between phases for gap folding
 *   pnpm regen --force                          regenerate even targets whose prompt hash is current
 *   pnpm regen --gates                          also run keyboard + axe (installs Playwright's chromium first)
 *   pnpm regen --dry-run                        print the plan and every command, start nothing, write nothing
 *   pnpm regen --auto-fold                      after each phase Claude Code folds the gaps (prompts/fold-gaps.md),
 *                                                 parse must pass, then the next phase starts without a pause
 *   pnpm regen --auto-fold --fold-model opus    the model that folds (default sonnet)
 *   pnpm regen --model opus                     the generating model: sets DS_MODEL for every child process
 *
 * `--flag=value` works, and a bare `--` is ignored. A second pass needs no flag: targets whose gates failed, or
 * whose docs changed, are stale by prompt hash and rerun.
 *
 * Exit codes
 *   0  done (or --dry-run, or --help)
 *   1  bad platform, swiftui without gh, unknown --from/--phase, `pnpm themes` or `pnpm parse` failed,
 *      or --auto-fold without `claude` on PATH
 *   2  unknown flag or a flag missing its value
 *   3  paused between phases for gap folding; the log ends with the resume command
 *   4  auto-fold left the docs unparseable
 *
 * The log. A real run writes logs/regen.log, or logs/regen-<platforms joined by ->.log when the platform list
 * is not the default, and every line goes to stdout as well. Its last line is exactly `== done ==` when the
 * run completed. tools/generate.ts `generatorRunning` treats a logs/regen*.log without that marker, changed in
 * the last 30 minutes, as a live run, which is why --dry-run creates no log at all (regen.ps1 -DryRun does).
 *
 * Every process starts through `hooks`, which the tests replace; `paths` points at the files the run writes.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { spawn } from 'node:child_process';
import type { SpawnOptions } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { Readable } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
import { fileURLToPath } from 'node:url';

import { isPlatform, PLATFORMS } from '../schema/platforms.ts';
import { PhasesError, readPhases } from './lib/phases.ts';
import type { Phase } from './lib/phases.ts';
import { which, winQuote } from './lib/proc.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path a real run writes or reads besides the phases file. The tests point these at a temp folder. */
export const paths = {
  ROOT: REPO_ROOT,
  LOGS: join(REPO_ROOT, 'logs'),
  FOLD_LOCK: join(REPO_ROOT, 'generated', 'fold.lock'),
  FOLD_PROMPT: join(REPO_ROOT, 'prompts', 'fold-gaps.md'),
};

/** What the folding model may use: exactly the commands prompts/fold-gaps.md names, plus read-only git and the
 *  shell readers folds reached for (T31/T32). No network, no rm, no git commit or push (`pnpm commit` does
 *  the commit). regen.ps1's AutoFold passes the same string. */
export const FOLD_ALLOWED_TOOLS = [
  'Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep',
  'Bash(node tools/*)', 'Bash(node --import tsx tools/*)', 'Bash(node logs/*.mjs)',
  'Bash(pnpm parse)', 'Bash(pnpm check)', 'Bash(pnpm commit*)', 'Bash(pnpm test:tools*)',
  'Bash(git diff *)', 'Bash(git log *)', 'Bash(git status*)',
  'Bash(grep:*)', 'Bash(ls:*)', 'Bash(awk:*)',
].join(',');

/** What the folding model may never use. acceptEdits auto-approves in-repo filesystem commands such as `rm`
 *  whatever the allow list says; a deny rule outranks that. regen.ps1's AutoFold passes the same string. */
export const FOLD_DISALLOWED_TOOLS = [
  'WebFetch', 'WebSearch',
  'Bash(rm:*)', 'Bash(rmdir:*)', 'Bash(git push:*)', 'Bash(curl:*)', 'Bash(wget:*)',
].join(',');

export const DEFAULT_PLATFORM = 'web,lit,rn';
export const DEFAULT_FOLD_MODEL = 'sonnet';

/** A lock older than this is left alone and the fold skipped, as regen.ps1 does. */
const FOLD_LOCK_WAIT_S = 1800;
const FOLD_LOCK_STEP_S = 15;

export type RunOptions = { input?: string };

let logFile: string | null = null;

/** One line to stdout and, during a real run, to the log. */
function log(line: string): void {
  process.stdout.write(`${line}\n`);
  if (logFile !== null) appendFileSync(logFile, `${line}\n`, 'utf8');
}

/** Every chunk of `stream`, logged a line at a time as it arrives. */
function logLines(stream: Readable | null): void {
  if (stream === null) return;
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  stream.on('data', (chunk: Buffer) => {
    buffer += decoder.write(chunk);
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) log(line.replace(/\r$/, ''));
  });
  stream.on('end', () => {
    buffer += decoder.end();
    if (buffer !== '') log(buffer.replace(/\r$/, ''));
    buffer = '';
  });
}

/**
 * Start `cmd args` in the repository root, stream its output to the log, and resolve to its exit status.
 * Windows: `pnpm` and `claude` are `.cmd` shims, which Node will not spawn without a shell, so the command
 * goes through cmd.exe pre-quoted, as tools/generate.ts `CliRunner.run` does. Node itself starts directly.
 */
function runProcess(cmd: string, args: string[], options: RunOptions = {}): Promise<number> {
  return new Promise((done) => {
    const spawnOptions: SpawnOptions = {
      cwd: paths.ROOT,
      env: process.env,
      windowsHide: true,
      stdio: [options.input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    };
    const child =
      process.platform === 'win32' && cmd !== process.execPath
        ? spawn([cmd, ...args].map(winQuote).join(' '), { ...spawnOptions, shell: true })
        : spawn(cmd, args, spawnOptions);
    let settled = false;
    const settle = (code: number): void => {
      if (!settled) done(code);
      settled = true;
    };
    logLines(child.stdout);
    logLines(child.stderr);
    child.on('error', (e) => {
      log(`${cmd} could not be started: ${e.message}`);
      settle(127);
    });
    child.on('close', (code) => settle(code ?? 1));
    if (options.input !== undefined && child.stdin !== null) {
      child.stdin.on('error', () => {}); // a child that exits before reading its stdin is reported by its exit code
      child.stdin.end(options.input, 'utf8');
    }
  });
}

/** Stage everything and commit through tools/commit.ts, which adds any configured trailer lines. */
function commitAll(message: string): Promise<number> {
  return hooks.run(process.execPath, ['--import', 'tsx', 'tools/commit.ts', '-m', message]);
}

/** The seams the tests replace. */
export const hooks = {
  run: runProcess,
  which,
  sleep: (seconds: number): Promise<void> => new Promise((done) => setTimeout(done, seconds * 1000)),
  commit: commitAll,
  now: (): Date => new Date(),
};

// ---------------------------------------------------------------- command line

export type Options = {
  from: string;
  phase: string;
  platform: string;
  noPause: boolean;
  force: boolean;
  gates: boolean;
  dryRun: boolean;
  autoFold: boolean;
  foldModel: string;
  model: string;
};

type ValueKey = 'from' | 'phase' | 'platform' | 'foldModel' | 'model';
type SwitchKey = 'noPause' | 'force' | 'gates' | 'dryRun' | 'autoFold';

const VALUE_FLAGS: Record<string, ValueKey> = {
  '--from': 'from',
  '--phase': 'phase',
  '--platform': 'platform',
  '--fold-model': 'foldModel',
  '--model': 'model',
};
const SWITCH_FLAGS: Record<string, SwitchKey> = {
  '--no-pause': 'noPause',
  '--force': 'force',
  '--gates': 'gates',
  '--dry-run': 'dryRun',
  '--auto-fold': 'autoFold',
};

/** Every flag but --help: regen.ps1's parameters in kebab-case. */
export const FLAGS: string[] = [...Object.keys(VALUE_FLAGS), ...Object.keys(SWITCH_FLAGS)];

/** A usage error (code 2) or a failed check (code 1). */
export class RegenError extends Error {
  readonly code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

const USAGE =
  'usage: regen.ts [-h] [--from PHASE] [--phase PHASE] [--platform PLATFORMS] [--no-pause] [--force]\n' +
  '                [--gates] [--dry-run] [--auto-fold] [--fold-model MODEL] [--model MODEL]\n';

const HELP = `${USAGE}
Regenerate every component from the docs in composition order (tools/regen-phases.json).
The cross-platform port of regen.ps1.

options:
  -h, --help            show this help message and exit
  --from PHASE          start at this phase
  --phase PHASE         run exactly this phase (wins over --from)
  --platform PLATFORMS  comma-separated: web,lit,rn,swiftui (default ${DEFAULT_PLATFORM})
  --no-pause            do not stop between phases for gap folding
  --force               regenerate even targets whose prompt hash is current
  --gates               also run the keyboard and axe gates (installs Playwright's chromium)
  --dry-run             print the plan and every command; start nothing, write nothing
  --auto-fold           fold the gaps with Claude Code between phases instead of pausing
  --fold-model MODEL    the folding model (default ${DEFAULT_FOLD_MODEL})
  --model MODEL         the generating model, passed to every child as DS_MODEL

exit codes: 0 done, 1 failed check or preparation, 2 usage, 3 paused for gap folding,
4 auto-fold left the docs unparseable. A completed run's log ends with \`== done ==\`.
`;

/** The parsed command line, or `'help'`. Throws a `RegenError` with code 2 for anything else. */
export function parseArgs(argv: string[]): Options | 'help' {
  const options: Options = {
    from: '', phase: '', platform: DEFAULT_PLATFORM, noPause: false, force: false, gates: false,
    dryRun: false, autoFold: false, foldModel: DEFAULT_FOLD_MODEL, model: '',
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '--') continue;
    if (arg === '-h' || arg === '--help') return 'help';
    const switchKey = SWITCH_FLAGS[arg];
    if (switchKey !== undefined) {
      options[switchKey] = true;
      continue;
    }
    const eq = arg.startsWith('--') ? arg.indexOf('=') : -1;
    const flag = eq === -1 ? arg : arg.slice(0, eq);
    const valueKey = VALUE_FLAGS[flag];
    if (valueKey === undefined) throw new RegenError(`unrecognized arguments: ${arg}`, 2);
    if (eq !== -1) {
      options[valueKey] = arg.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next === undefined) throw new RegenError(`argument ${flag}: expected one argument`, 2);
      options[valueKey] = next;
      i++;
    }
  }
  return options;
}

/** The platforms asked for, trimmed and without blanks. */
export function requestedPlatforms(platform: string): string[] {
  return platform.split(',').map((p) => p.trim()).filter((p) => p !== '');
}

/** `--phase` alone, or every phase from `--from` on (all of them when `--from` is empty). */
export function selectPlan(phases: Phase[], from: string, phase: string): Phase[] {
  const names = phases.map((p) => p.name).join(', ');
  if (phase !== '') {
    const plan = phases.filter((p) => p.name === phase);
    if (plan.length === 0) throw new RegenError(`No phase named '${phase}'. Phases: ${names}`, 1);
    return plan;
  }
  const start = from === '' ? 0 : phases.findIndex((p) => p.name === from);
  if (start === -1) throw new RegenError(`No phase matches --from '${from}'. Phases: ${names}`, 1);
  return phases.slice(start);
}

// ---------------------------------------------------------------- the commands a run executes

type Command = { cmd: string; args: string[] };

/** Everything a run needs once the checks passed. `platform` is the normalised list, e.g. `web,lit`. */
type Run = Options & { platform: string; plan: Phase[]; browser: boolean };

const tsx = (script: string, ...args: string[]): Command => ({ cmd: process.execPath, args: ['--import', 'tsx', script, ...args] });
const pnpm = (...args: string[]): Command => ({ cmd: 'pnpm', args });

const what = (phase: Phase): string => (phase.pattern !== undefined ? `pattern ${phase.pattern}` : (phase.components ?? []).join(','));

function generateCommand(phase: Phase, r: Run): Command {
  const args = ['--platform', r.platform];
  if (phase.pattern !== undefined) args.push('--pattern', phase.pattern);
  else args.push('--component', (phase.components ?? []).join(','));
  if (r.force) args.push('--force');
  if (r.gates && r.browser) args.push('--with', 'keyboard', '--with', 'axe');
  return tsx('tools/generate.ts', ...args);
}

const digestCommand = (phaseName: string): Command => tsx('tools/gap_digest.ts', '--phase', phaseName);

const foldArgs = (r: Run): string[] =>
  ['-p', '--model', r.foldModel, '--permission-mode', 'acceptEdits', '--allowedTools', FOLD_ALLOWED_TOOLS,
    '--disallowedTools', FOLD_DISALLOWED_TOOLS];

function prepCommands(r: Run): Command[] {
  const commands = [pnpm('themes'), pnpm('parse')];
  if (r.gates && r.browser) commands.push(pnpm('exec', 'playwright', 'install', 'chromium'));
  return commands;
}

const phaseMessage = (phase: Phase, r: Run, code: string): string => `regen: phase ${phase.name} (${r.platform}) exit ${code}`;
const resumeLine = (next: Phase, r: Run): string => `pnpm regen --from ${next.name} --platform ${r.platform}`;

function planLine(r: Run): string {
  return `Plan: ${r.plan.map((p) => p.name).join(' -> ')}  platforms=${r.platform} force=${r.force} gates=${r.gates} pause=${!r.noPause}`;
}

/** `Get-Date -Format s`: local time to the second. */
function stamp(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const shellWord = (arg: string): string => (/^[\w@%+=:,./-]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`);

const show = (c: Command): string => [c.cmd === process.execPath ? 'node' : c.cmd, ...c.args].map(shellWord).join(' ');

/** A file under the root, spelled with forward slashes. */
const repoPath = (file: string): string => relative(paths.ROOT, file).split(sep).join('/');

// ---------------------------------------------------------------- dry run

function dryRun(r: Run): number {
  const out = (line: string): void => {
    process.stdout.write(`${line}\n`);
  };
  const command = (text: string): void => out(`  $ ${text}`);
  out(planLine(r));
  for (const phase of r.plan) out(`  ${phase.name}: ${what(phase)}`);
  out('');
  out('Commands, in order (dry run: nothing is started, no log or lock is written):');
  if (r.model !== '') out(`  DS_MODEL=${r.model} for every command below`);
  for (const c of prepCommands(r)) command(show(c));
  r.plan.forEach((phase, i) => {
    command(show(generateCommand(phase, r)));
    command(show(pnpm('commit', '-m', phaseMessage(phase, r, '<code>'))));
    const next = r.plan[i + 1];
    if (next === undefined) return;
    if (r.autoFold) {
      command(show(digestCommand(phase.name)));
      command(`${show({ cmd: 'claude', args: foldArgs(r) })} < ${repoPath(paths.FOLD_PROMPT)}`);
      command(show(pnpm('parse')));
    } else if (!r.noPause) {
      command(show(digestCommand(phase.name)));
      out(`  stops here (exit 3); resume with: ${resumeLine(next, r)}`);
    }
  });
  command(show(pnpm('mcp:index')));
  command(show(tsx('tools/generate.ts', '--check')));
  command(show(digestCommand('final')));
  command(show(pnpm('commit', '-m', `regen: complete (${r.platform})`)));
  return 0;
}

// ---------------------------------------------------------------- real run

const start = (c: Command, options: RunOptions = {}): Promise<number> => hooks.run(c.cmd, c.args, options);

/** One window folds at a time. Others wait (up to 30 min), then fold whatever is still newer than folded.json.
 *  Resolves to an exit code when the run must stop, else null. */
async function autoFold(r: Run, phaseName: string): Promise<number | null> {
  let waited = 0;
  while (existsSync(paths.FOLD_LOCK) && waited < FOLD_LOCK_WAIT_S) {
    await hooks.sleep(FOLD_LOCK_STEP_S);
    waited += FOLD_LOCK_STEP_S;
  }
  if (existsSync(paths.FOLD_LOCK)) {
    log(`fold lock held for 30 min; skipping auto-fold for ${phaseName}`);
    return null;
  }
  const claude = hooks.which('claude') ?? hooks.which('claude.cmd');
  if (claude === null) {
    log('`claude` CLI not found on PATH: install Claude Code, or run without --auto-fold');
    return 1;
  }
  mkdirSync(dirname(paths.FOLD_LOCK), { recursive: true });
  writeFileSync(paths.FOLD_LOCK, `${r.platform} ${phaseName} ${stamp(hooks.now())}\n`, 'utf8');
  try {
    log(`== auto-fold (${r.foldModel}) after ${phaseName} ==`);
    const prompt = readFileSync(paths.FOLD_PROMPT, 'utf8');
    await hooks.run(claude, foldArgs(r), { input: prompt });
    if ((await start(pnpm('parse'))) !== 0) {
      log('auto-fold left the docs unparseable: stopping so a human can look (git diff site/src/content/docs).');
      return 4;
    }
    return null;
  } finally {
    rmSync(paths.FOLD_LOCK, { force: true });
  }
}

async function realRun(r: Run): Promise<number> {
  const suffix = r.platform === DEFAULT_PLATFORM ? '' : `-${r.platform.replaceAll(',', '-')}`;
  mkdirSync(paths.LOGS, { recursive: true });
  logFile = join(paths.LOGS, `regen${suffix}.log`);
  writeFileSync(logFile, '', 'utf8');
  try {
    log(`== regen ${stamp(hooks.now())} platforms=${r.platform} ==`);
    if (r.model !== '') process.env.DS_MODEL = r.model;
    log(planLine(r));

    // Preparation: tokens, prompts, and a parse that must be clean before any model call.
    log('== pnpm themes ==');
    if ((await start(pnpm('themes'))) !== 0) {
      log('themes failed');
      return 1;
    }
    log('== parse ==');
    if ((await start(pnpm('parse'))) !== 0) {
      log('parse failed: fix the docs above before regenerating');
      return 1;
    }
    if (r.gates && r.browser) await start(pnpm('exec', 'playwright', 'install', 'chromium'));

    for (const [i, phase] of r.plan.entries()) {
      log('');
      log(`==== Phase ${phase.name} (${i + 1} of ${r.plan.length}): ${what(phase)} ====`);
      const code = await start(generateCommand(phase, r));
      await hooks.commit(phaseMessage(phase, r, String(code)));
      if (code !== 0) {
        log(`Phase ${phase.name} finished with failures (exit ${code}). Failed targets stay stale; they rerun on the next pass after the gaps are folded (no flag needed).`);
      } else {
        log(`Phase ${phase.name} passed.`);
      }
      const next = r.plan[i + 1];
      if (next === undefined) continue; // the last phase never pauses or folds
      if (r.autoFold) {
        await start(digestCommand(phase.name));
        const stop = await autoFold(r, phase.name);
        if (stop !== null) return stop;
        continue;
      }
      if (!r.noPause) {
        await start(digestCommand(phase.name));
        log('');
        log('Paused for gap folding. Read generated/gaps/SUMMARY.md, fix the docs, run `pnpm parse`, then resume:');
        log(`  ${resumeLine(next, r)}`);
        return 3;
      }
    }

    log('');
    log('== all phases done: re-index MCP, check ==');
    await start(pnpm('mcp:index'));
    await start(tsx('tools/generate.ts', '--check')); // stale targets are reported, not fatal
    await start(digestCommand('final'));
    await hooks.commit(`regen: complete (${r.platform})`);
    log('== done ==');
    return 0;
  } finally {
    logFile = null;
  }
}

// ---------------------------------------------------------------- main

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  try {
    const options = parseArgs(argv);
    if (options === 'help') {
      process.stdout.write(HELP);
      return 0;
    }
    // Every check before any process starts: a typo should cost a second, not a minute.
    const requested = requestedPlatforms(options.platform);
    const unknown = requested.filter((p) => !isPlatform(p));
    if (requested.length === 0 || unknown.length > 0) {
      throw new RegenError(`Unknown platform '${unknown.join(', ')}'. Known: ${PLATFORMS.join(', ')}`, 1);
    }
    // swiftui's build gates are a GitHub Actions workflow on macOS: without gh there is nothing to ask.
    if (requested.includes('swiftui') && hooks.which('gh') === null) {
      throw new RegenError('swiftui needs the GitHub CLI on PATH (gh auth login): its gates run on macOS in GitHub Actions.', 1);
    }
    let phases: Phase[];
    try {
      phases = readPhases();
    } catch (e) {
      if (e instanceof PhasesError) throw new RegenError(e.message, 1);
      throw e;
    }
    const run: Run = {
      ...options,
      platform: requested.join(','),
      plan: selectPlan(phases, options.from, options.phase),
      // The browser gates are a Playwright project per TypeScript platform; there is none for swiftui.
      browser: requested.some((p) => p !== 'swiftui'),
    };
    return options.dryRun ? dryRun(run) : await realRun(run);
  } catch (e) {
    if (!(e instanceof RegenError)) throw e;
    process.stderr.write(`${e.code === 2 ? USAGE : ''}regen.ts: error: ${e.message}\n`);
    return e.code;
  }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = await main();
