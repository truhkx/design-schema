#!/usr/bin/env node
/**
 * swiftui_gate.ts — the remote half of the `swiftui` gates.
 *
 * SwiftUI compiles only on macOS (process/ios-platform.md, "Gates, and the Mac problem"), so the
 * typecheck/behavior half of the gate for a generated Swift file runs in GitHub Actions:
 *
 *   1. `start()`  puts the working tree's Swift inputs on a `gen/swiftui/<Name>` branch — in a git
 *      worktree, so the main checkout is never touched — pushes it, and dispatches
 *      `.github/workflows/swiftui-gates.yml` with `-f target=<Name>`.
 *   2. `waitAll()` watches every run of a batch at once (`gh run watch` for one, polling for several),
 *      downloads each `gates/<Name>.swiftui.json` artifact and turns it into the same
 *      `GateResult[]` the local gates produce, so tools/generate.ts feeds the errors to round 2
 *      exactly as it does a `tsc` failure.
 *   3. `fold()`   copies the gated bytes back into the main checkout and deletes the branch;
 *      `discard()` leaves the branch alone (it is the only trace of a failed round) and removes
 *      the worktree.
 *
 * Everything a run costs is wall-clock, not dollars, and one CI round trip covers a whole phase:
 * the batch is dispatched in one pass and waited on in one pass.
 *
 * The report the workflow uploads is
 *   { build: { ok, errors[] }, tests: { ok, failures[] }, audit: { ok, issues[] } }
 * and a section may add `"skipped": true` for a half the workflow could not run (the XCUITest audit, when
 * the gallery app or the simulator never got far enough) — a skipped section never fails a round, it is
 * only printed.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { GateResult } from './checks.ts';
import { which } from './lib/proc.ts';
import { pySplitlines, pyStrip, readText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

export const WORKFLOW = 'swiftui-gates.yml';
export const BRANCH_PREFIX = 'gen/swiftui/';

/** What the macOS runner compiles: the working tree's state of these paths is what the branch carries,
 *  so the remote gate judges the files on disk, the way a local `tsc` does. Mirrors the workflow's own
 *  path filters — anything the gate reads has to be here or the run tests the wrong bytes. */
export const GATE_INPUTS: readonly string[] = [
  'packages/swiftui',
  'apps/ios-gallery',
  'tools/icon-paths.json',
  'tests/icon-snapshots',
  // The keyboard rules the XCUITest checks, derived by tools/keyboard_tests.ts. Generated and therefore
  // gitignored, which is why the commit below force-adds: the macOS job never runs `pnpm install`, so
  // there is no way for it to derive them itself, and a component whose rules did not travel would be
  // gated on its audit alone.
  'generated/keyboard',
  '.github/workflows/swiftui-gates.yml',
];

/** Build products and dependency folders never travel to the runner (it has its own cache). */
const NEVER_COPY: ReadonlySet<string> = new Set(['.build', '.git', 'node_modules', 'DerivedData', '.swiftpm']);

/** Nothing the macOS runner does is Playwright's, and `generated/keyboard` holds both gates' output. */
function copyable(src: string): boolean {
  return !NEVER_COPY.has(basename(src)) && !src.endsWith('.spec.ts');
}

// Polling: a `swift build` on a cold macOS runner is minutes, so a 15 s tick is free and the cap is
// generous enough for a queued run on a busy public-repo pool.
export const POLL_S = 15;
export const RUN_TIMEOUT_S = 45 * 60;
export const DISPATCH_LOOKUP_TRIES = 20; // `gh workflow run` returns nothing; the run shows up in the list a moment later

export type Section = { ok: boolean; errors?: string[]; failures?: string[]; issues?: string[]; skipped?: boolean; note?: string };
export type Report = { build?: Section; tests?: Section; audit?: Section };

/** One component's branch, worktree and workflow run. */
export type RemoteRun = { name: string; branch: string; worktree: string; sha: string; id: string; files: string[] };

export type CmdResult = { status: number; stdout: string; stderr: string; output: string };

/** The tooling this gate needs is missing, or the model's file never reached a runner: neither is the
 *  spec's fault, so generate.ts records it the way it records a dead API call. */
export class GateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GateError';
  }
}

function print(line: string): void {
  process.stdout.write(line + '\n');
}

/** The seams the tests replace: nothing here may spawn `git` or `gh` in a unit test. */
export const hooks = {
  run(argv: string[], cwd: string = REPO_ROOT): CmdResult {
    const exe = which(argv[0] as string) ?? (argv[0] as string);
    const p = spawnSync(exe, argv.slice(1), {
      cwd,
      env: { ...process.env, GH_PROMPT_DISABLED: '1', GIT_TERMINAL_PROMPT: '0' },
      encoding: 'buffer',
      timeout: 30 * 60_000,
      maxBuffer: 64 * 1024 * 1024,
    });
    const text = (b: Buffer | null): string => (b ?? Buffer.alloc(0)).toString('utf8').replace(/\r\n?/g, '\n');
    const stdout = text(p.stdout);
    const stderr = text(p.stderr);
    if (p.error) return { status: 127, stdout, stderr: `${stderr}${(p.error as Error).message}`, output: pyStrip(stdout + stderr + (p.error as Error).message) };
    return { status: p.status ?? 1, stdout, stderr, output: pyStrip(stdout + stderr) };
  },
  sleep(seconds: number): Promise<void> {
    return new Promise((done) => {
      setTimeout(done, seconds * 1000);
    });
  },
  now(): number {
    return Date.now() / 1000;
  },
};

function must(argv: string[], cwd: string, what: string): CmdResult {
  const r = hooks.run(argv, cwd);
  if (r.status !== 0) throw new GateError(`${what} failed (${argv.slice(0, 3).join(' ')} … exit ${r.status}): ${lastLines(r.output, 6)}`);
  return r;
}

function lastLines(text: string, n: number): string {
  return pySplitlines(pyStrip(text)).slice(-n).join('\n');
}

export function branchFor(name: string): string {
  return `${BRANCH_PREFIX}${name}`;
}

/** `git`, `gh`, an authenticated account and an `origin` to push to: without all four the remote gate
 *  cannot run at all, and saying so before the first model call is worth more than failing after it. */
export function preflight(root: string = REPO_ROOT): void {
  for (const exe of ['git', 'gh']) {
    if (which(exe) === null) {
      throw new GateError(
        `\`${exe}\` is not on PATH — the swiftui gates run on GitHub Actions (process/ios-platform.md, ` +
          '"Gates, and the Mac problem"). Install the GitHub CLI and `gh auth login`, or generate a platform whose gates are local.',
      );
    }
  }
  const remote = hooks.run(['git', 'remote', 'get-url', 'origin'], root);
  if (remote.status !== 0 || pyStrip(remote.stdout) === '') {
    throw new GateError('no `origin` remote — the swiftui gates push a gen/swiftui/<Name> branch and read the workflow run it starts.');
  }
  const auth = hooks.run(['gh', 'auth', 'status'], root);
  if (auth.status !== 0) throw new GateError(`gh is not authenticated: ${lastLines(auth.output, 3)}`);
}

// ---------------------------------------------------------------- staging

function copyInto(worktree: string, root: string): string[] {
  const copied: string[] = [];
  for (const rel of GATE_INPUTS) {
    const from = join(root, rel);
    if (!existsSync(from)) continue;
    const to = join(worktree, rel);
    if (statSync(from).isDirectory()) {
      rmSync(to, { recursive: true, force: true }); // a file the working tree deleted must not survive on the branch
      cpSync(from, to, { recursive: true, filter: copyable });
    } else {
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
    copied.push(rel);
  }
  return copied;
}

/**
 * Put the working tree's Swift inputs on `gen/swiftui/<Name>` and push it. The worktree is created at
 * HEAD outside the repository, so the main checkout — including anything else the generator is in the
 * middle of writing — is untouched, and a batch's branches never collide.
 *
 * Every component of a batch is on every branch: they are all on disk, they compose each other, and the
 * package has to compile as a whole anyway. The branch is what the target's file gets judged *in*.
 */
export function start(name: string, files: string[], root: string = REPO_ROOT): RemoteRun {
  const branch = branchFor(name);
  const worktree = mkdtempSync(join(tmpdir(), `ds-swiftui-${name}-`));
  rmSync(worktree, { recursive: true, force: true }); // `git worktree add` wants to create the folder itself
  // -B: the branch is the generator's own namespace, so an abandoned run's branch is simply reset to HEAD.
  must(['git', 'worktree', 'add', '--force', '-B', branch, worktree, 'HEAD'], root, `git worktree for ${name}`);
  try {
    const paths = copyInto(worktree, root);
    // -f: `generated/keyboard` is gitignored (it is derived output) and the gate cannot derive it itself.
    // The pathspec is exactly what copyInto just wrote, so nothing else is forced onto the branch.
    must(['git', 'add', '-A', '-f', '--', ...paths], worktree, `git add for ${name}`);
    // --allow-empty: a fix round that changed nothing still has to reach a runner, and the empty commit
    // is what gives it a fresh sha to find the run by.
    must(['git', 'commit', '--allow-empty', '-m', `gen(swiftui): ${name}`], worktree, `git commit for ${name}`);
    const sha = pyStrip(must(['git', 'rev-parse', 'HEAD'], worktree, 'git rev-parse').stdout);
    // --force, not --force-with-lease: `gen/swiftui/*` belongs to the generator, the previous round's
    // commit on it is exactly what this one replaces, and there is no remote-tracking ref to lease.
    must(['git', 'push', '--force', 'origin', `HEAD:refs/heads/${branch}`], worktree, `git push for ${name}`);
    print(`  ↑ ${name}: ${branch} ${sha.slice(0, 8)}`);
    return { name, branch, worktree, sha, id: '', files: [...files] };
  } catch (e) {
    // A worktree left behind would block the next run of the same component.
    hooks.run(['git', 'worktree', 'remove', '--force', worktree], root);
    throw e;
  }
}

/** Dispatch the workflow against the branch and find the run it created (by the sha we pushed). */
export async function dispatch(run: RemoteRun, root: string = REPO_ROOT): Promise<RemoteRun> {
  must(['gh', 'workflow', 'run', WORKFLOW, '--ref', run.branch, '-f', `target=${run.name}`], root, `gh workflow run for ${run.name}`);
  for (let tryNo = 0; tryNo < DISPATCH_LOOKUP_TRIES; tryNo++) {
    const r = hooks.run(
      ['gh', 'run', 'list', '--workflow', WORKFLOW, '--branch', run.branch, '--event', 'workflow_dispatch',
        '--limit', '20', '--json', 'databaseId,headSha,status,conclusion'],
      root,
    );
    if (r.status === 0) {
      for (const entry of parseJsonList(r.stdout)) {
        if (String(entry['headSha'] ?? '') === run.sha) {
          const id = String(entry['databaseId'] ?? '');
          print(`  ▸ ${run.name}: run ${id}`);
          return { ...run, id };
        }
      }
    }
    await hooks.sleep(POLL_S / 3);
  }
  throw new GateError(`the workflow was dispatched for ${run.name} but no run for ${run.sha.slice(0, 8)} appeared on ${run.branch}`);
}

function parseJsonList(text: string): Record<string, unknown>[] {
  try {
    const parsed: unknown = JSON.parse(pyStrip(text) || '[]');
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------- waiting

/** Completed runs, by name. One run is watched (`gh run watch` prints the steps as they finish); a
 *  batch is polled, so a phase waits once rather than once per component. */
export async function waitAll(runs: RemoteRun[], root: string = REPO_ROOT): Promise<Map<string, Report>> {
  if (runs.length === 1) {
    const only = runs[0] as RemoteRun;
    // --exit-status is nonzero when the run failed, which the report says in more detail; the artifact
    // is what decides, so the status is only interesting when there is no artifact at all.
    hooks.run(['gh', 'run', 'watch', only.id, '--exit-status'], root);
  } else if (runs.length > 1) {
    await pollAll(runs, root);
  }
  const reports = new Map<string, Report>();
  for (const run of runs) reports.set(run.name, download(run, root));
  return reports;
}

async function pollAll(runs: RemoteRun[], root: string): Promise<void> {
  const pending = new Map(runs.map((r) => [r.id, r]));
  const deadline = hooks.now() + RUN_TIMEOUT_S;
  print(`  … waiting on ${runs.length} runs (${runs.map((r) => r.name).join(', ')})`);
  while (pending.size > 0) {
    if (hooks.now() > deadline) {
      throw new GateError(`the swiftui workflow did not finish within ${Math.round(RUN_TIMEOUT_S / 60)} min for ${[...pending.values()].map((r) => r.name).join(', ')}`);
    }
    await hooks.sleep(POLL_S);
    for (const [id, run] of [...pending]) {
      const r = hooks.run(['gh', 'run', 'view', id, '--json', 'status,conclusion'], root);
      if (r.status !== 0) continue; // a transient gh/network error: ask again on the next tick
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(pyStrip(r.stdout)) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (String(data['status'] ?? '') !== 'completed') continue;
      pending.delete(id);
      print(`  ${data['conclusion'] === 'success' ? '✔' : '✖'} ${run.name}: run ${id} ${String(data['conclusion'] ?? '')} (${pending.size} left)`);
    }
  }
}

/** `gates/<Name>.swiftui.json`, as the workflow uploaded it. */
export function download(run: RemoteRun, root: string = REPO_ROOT): Report {
  const dir = mkdtempSync(join(tmpdir(), `ds-gates-${run.name}-`));
  try {
    const r = hooks.run(['gh', 'run', 'download', run.id, '--name', `gates-${run.name}`, '--dir', dir], root);
    const file = join(dir, `${run.name}.swiftui.json`);
    if (r.status !== 0 || !existsSync(file)) {
      // No artifact: the job died before the report step (a runner image change, a cancelled run). That is
      // the gate failing to run, not the component failing — the caller records it and retries next pass.
      throw new GateError(
        `no gates/${run.name}.swiftui.json from run ${run.id}: ${lastLines(r.output, 4) || 'the artifact was not uploaded'}\n` +
          `    gh run view ${run.id} --log-failed`,
      );
    }
    return JSON.parse(readText(file)) as Report;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- results

const SECTIONS: readonly [key: 'build' | 'tests' | 'audit', gate: string, field: 'errors' | 'failures' | 'issues'][] = [
  ['build', 'swift-build', 'errors'],
  ['tests', 'swift-test', 'failures'],
  ['audit', 'swift-audit', 'issues'],
];

/**
 * The remote report as gate results — the same shape tools/checks.ts produces, so the fix round is
 * assembled from a `swift build` error exactly as it is from a `tsc` one. A section the workflow marked
 * `skipped` passes with a note: it says nothing about the component either way.
 */
export function results(name: string, report: Report): GateResult[] {
  const out: GateResult[] = [];
  for (const [key, gate, field] of SECTIONS) {
    const section = report[key];
    if (section === undefined) {
      out.push({ name: gate, ok: true, output: `(the workflow reported no "${key}" section for ${name})` });
      continue;
    }
    const lines = (section[field] ?? []).map((l) => pyStrip(String(l))).filter((l) => l !== '');
    if (section.skipped) {
      out.push({ name: gate, ok: true, output: `skipped on the runner: ${section.note ?? 'not run'}` });
      continue;
    }
    out.push({ name: gate, ok: section.ok === true && lines.length === 0, output: lines.join('\n') });
  }
  return out;
}

// ---------------------------------------------------------------- folding back

/** The bytes that passed, into the main checkout — then the branch and the worktree go. The files are
 *  usually identical (the branch was made from this working tree); copying is what makes "what passed"
 *  and "what is committed" the same thing even when a later round touched the checkout. */
export function fold(run: RemoteRun, root: string = REPO_ROOT): string[] {
  const changed: string[] = [];
  for (const rel of run.files) {
    const from = join(run.worktree, rel);
    const to = join(root, rel);
    if (!existsSync(from)) continue;
    const before = existsSync(to) ? readFileSync(to) : null;
    const after = readFileSync(from);
    if (before === null || !before.equals(after)) {
      mkdirSync(dirname(to), { recursive: true });
      writeFileSync(to, after);
      changed.push(rel);
    }
  }
  removeWorktree(run, root);
  hooks.run(['git', 'branch', '-D', run.branch], root);
  hooks.run(['git', 'push', 'origin', '--delete', run.branch], root);
  return changed;
}

/** A failed round keeps its branch — it is the only place the exact code the runner rejected exists. */
export function discard(run: RemoteRun, root: string = REPO_ROOT): void {
  removeWorktree(run, root);
  print(`  ↳ ${run.name}: ${run.branch} kept for inspection (gh run view ${run.id} --log-failed)`);
}

function removeWorktree(run: RemoteRun, root: string): void {
  hooks.run(['git', 'worktree', 'remove', '--force', run.worktree], root);
  rmSync(run.worktree, { recursive: true, force: true });
}

/** Worktrees a killed run left behind, removed before a new one starts: `git worktree list --porcelain`
 *  reports each one's folder, and the generator's own live under the temp folder with our prefix. */
export function pruneWorktrees(root: string = REPO_ROOT): void {
  hooks.run(['git', 'worktree', 'prune'], root);
}

// ---------------------------------------------------------------- the gate, as generate.ts uses it

export type Batch = { run: RemoteRun; results: GateResult[] };

/**
 * One CI round trip for a whole phase: every component's branch is pushed and dispatched, then all of
 * the runs are waited on together, then each report becomes gate results. The caller folds or discards.
 */
export async function runBatch(targets: { name: string; files: string[] }[], root: string = REPO_ROOT): Promise<Batch[]> {
  pruneWorktrees(root);
  const started: RemoteRun[] = [];
  for (const t of targets) started.push(start(t.name, t.files, root));
  const dispatched: RemoteRun[] = [];
  try {
    for (const run of started) dispatched.push(await dispatch(run, root));
  } catch (e) {
    for (const run of started) if (!dispatched.some((d) => d.name === run.name)) removeWorktree(run, root);
    throw e;
  }
  const reports = await waitAll(dispatched, root);
  return dispatched.map((run) => ({ run, results: results(run.name, reports.get(run.name) ?? {}) }));
}

// ---------------------------------------------------------------- command line

const USAGE = 'usage: swiftui_gate.ts [-h] --component NAME [--keep]';

/** Standalone, the gate is a way to ask the Mac about the Swift on disk without calling a model:
 *
 *     node --import tsx tools/swiftui_gate.ts --component Button
 */
export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let name = '';
  let keep = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${USAGE}\n`);
      return 0;
    } else if (arg === '--component' || arg.startsWith('--component=')) {
      name = arg.startsWith('--component=') ? arg.slice('--component='.length) : ((argv[++i] as string) ?? '');
    } else if (arg === '--keep') {
      keep = true;
    } else {
      process.stderr.write(`${USAGE}\nswiftui_gate.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }
  if (!name) {
    process.stderr.write(`${USAGE}\nswiftui_gate.ts: error: the following arguments are required: --component\n`);
    return 2;
  }
  try {
    preflight();
    const [batch] = await runBatch([{ name, files: [`packages/swiftui/Sources/DesignSchema/${name}.swift`] }]);
    const b = batch as Batch;
    for (const r of b.results) print(`  ${r.ok ? '✔' : '✖'} ${r.name} ${lastLines(r.output, 1)}`);
    const ok = b.results.every((r) => r.ok);
    if (ok && !keep) fold(b.run);
    else discard(b.run);
    return ok ? 0 : 1;
  } catch (e) {
    process.stderr.write(`${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = await main();
