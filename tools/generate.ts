#!/usr/bin/env node
/**
 * generate.ts — turn a component doc into platform code, with the model in one place and
 * deterministic gates everywhere else.
 *
 *     node tools/generate.ts --platform web --component Icon              # one component, one platform
 *     node tools/generate.ts --platform web,lit,rn --component Icon       # three platforms, sequentially
 *     node tools/generate.ts --platform swiftui --component Button,Icon   # one branch each, one CI round trip
 *     node tools/generate.ts --stale                                      # everything whose prompt changed
 *     node tools/generate.ts --check                                      # list stale entries, generate nothing
 *     node tools/generate.ts ... --runner api                             # Messages API instead of Claude Code
 *     node tools/generate.ts ... --skip typecheck                         # when node_modules is not available
 *
 * How it works
 *   1. The prompt is generated/prompts/<Name>.<platform>.md (tools/parse.ts builds it from the doc).
 *      Its sha256 is the identity of the spec. generated/generate.lock.<platform>.json remembers the hash
 *      that produced the committed code, so generation only runs when the doc changed.
 *   2. Round 1: the model gets the prompt plus a short task wrapper (read these files for
 *      conventions, write these files, report gaps as JSON). Runner `cli` drives Claude Code
 *      headless (`claude -p`, tools enabled, cwd = repo); runner `api` calls the Messages API and
 *      expects files back in a fenced format, which this script writes.
 *   3. Gates (tools/checks.ts): parse, contrast, literals, typecheck. Failures are handed back to
 *      the model verbatim as a fix round, up to --max-rounds. The model never sees the gate code.
 *      `swiftui` compiles only on macOS, so its build/test/audit gates run in GitHub Actions
 *      (tools/swiftui_gate.ts): the file goes on a `gen/swiftui/<Name>` branch, the workflow answers with
 *      the same GateResult shape, and a phase is generated as one batch so it waits on CI once.
 *   4. Gaps the model reported land in generated/gaps/<Name>.<platform>.md for the doc pass.
 *      The lockfile records hash, files, rounds, gate results and cost.
 *   5. `--naming <brand>` (or DS_NAMING) resolves themes/<brand>/naming.md once and renames the written
 *      output: the file name, the exported identifier, the prop names, the CSS / type prefix
 *      (tools/naming.ts). The model still reads the canonical prompt and writes canonical code, and
 *      every gate still runs on canonical code — so the package tree is normalized back to canonical
 *      names before the round loop and left in the brand's names after it. Without the flag there is no
 *      naming step at all, and the output is byte-identical to a run of this tool before it existed.
 *
 * Generation is a code-mod, not a compile step: run it, review the diff, commit. The deploy
 * build never calls a model; it runs the same gates on committed code.
 *
 * Port of tools/generate.py: same flags, same exit codes, same stdout wording, the same lock format,
 * gap files and preflight. Two things the language moved rather than changed: the gates are called in
 * process (`runAll` from checks.ts) instead of through `node --import tsx tools/checks.ts --json`, and
 * the `api` runner talks to `@anthropic-ai/sdk` (an optional install, as `anthropic` was for Python)
 * instead of the Python SDK. Runs under Node's type stripping: annotations only.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { demoDir, isPlatform, PACKAGE_DIR, PLATFORM_LABEL, PLATFORMS, sourceDir } from '../schema/platforms.ts';
import { failuresAsPrompt, runAll } from './checks.ts';
import type { GateResult } from './checks.ts';
import { which, winQuote } from './lib/proc.ts';
import * as naming from './naming.ts';
import {
  appendText,
  pyFixed,
  pyJsonDumps,
  pyRoundTo,
  pySorted,
  pySplitlines,
  pyStr,
  pyStrip,
  readText,
  sortedNames,
  truthy,
  writeText,
  writeTextAtomic,
} from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import * as swiftui from './swiftui_gate.ts';

export type Dict = Record<string, unknown>;
export type Lock = Record<string, Dict>;
export type Target = [name: string, platform: string];

/** Every path the tool reads or writes. The tests point these at a sandbox, the way the Python tests
 *  monkeypatched the module globals. */
export const paths = {
  ROOT: REPO_ROOT,
  PROMPTS: join(REPO_ROOT, 'generated', 'prompts'),
  LOCK_DIR: join(REPO_ROOT, 'generated'),
  // the single file used before the per-platform split; migrated on first load
  LEGACY_LOCK: join(REPO_ROOT, 'generated', 'generate.lock.json'),
  LOGS: join(REPO_ROOT, 'logs'),
  GAPS: join(REPO_ROOT, 'generated', 'gaps'),
  CONVENTIONS: join(REPO_ROOT, 'prompts', 'conventions'), // one-page digest per platform, inlined into the task prompt
  COMPONENTS: join(REPO_ROOT, 'generated', 'components.json'), // which (component, platform) pairs a doc marks unsupported
};

/** Platforms whose build gates cannot run on this machine. SwiftUI compiles only on macOS
 *  (process/ios-platform.md, "Gates, and the Mac problem"), so the file is pushed on a `gen/<platform>/<Name>`
 *  branch and a workflow answers with the same gate results a local typecheck would have produced —
 *  minutes rather than seconds per round, which is why these platforms generate a phase as one batch. */
export const REMOTE_GATE: ReadonlySet<string> = new Set(['swiftui']);
// a precise spec + hard gates is where a cheaper model is enough; --model fable for the hard ones
export const DEFAULT_MODEL: string = process.env['DS_MODEL'] ?? 'sonnet';
// the brand whose naming.md renames the output, for a fork that would rather not pass --naming every run
export const DEFAULT_NAMING: string | null = process.env['DS_NAMING'] ?? null;

// Files the model MAY open if the digest leaves a detail out. Reading all of these every run was ~40% of
// the tokens of a generation, so the digest replaces them and these are the fallback for the api runner.
export const CONVENTION_FILES: Record<string, string[]> = {
  web: ['packages/react/src/index.ts', 'packages/react/src/Button.tsx', 'packages/react/src/Button.css',
        'packages/react/src/Button.stories.tsx', 'packages/react/src/Input.tsx', 'packages/react/src/FormContext.ts',
        'packages/react/src/css.d.ts', 'packages/tokens/dist/calm-precise/css/tokens.css'],
  lit: ['packages/lit/src/index.ts', 'packages/lit/src/Button.ts', 'packages/lit/src/Button.stories.ts',
        'packages/lit/src/Input.ts', 'packages/lit/src/Form.ts', 'packages/lit/tsconfig.json',
        'packages/tokens/dist/calm-precise/css/tokens.css'],
  rn: ['packages/rn/src/index.ts', 'packages/rn/src/Button.tsx', 'packages/rn/src/Button.stories.tsx',
       'packages/rn/src/Input.tsx', 'packages/rn/src/FormContext.ts', 'packages/rn/src/theme.tsx',
       'packages/rn/src/decorators.tsx', 'packages/tokens/dist/calm-precise/rn/tokens.light.d.ts'],
  // Swift has no index file: what a new component registers itself with is a gallery screen, so
  // Gallery.swift takes index.ts's place as the first file (the one the task prompt says to open).
  swiftui: ['packages/swiftui/Sources/DesignSchema/Support/Gallery.swift',
            'packages/swiftui/Sources/DesignSchema/Button.swift',
            'packages/swiftui/Sources/DesignSchema/Support/SVGPath.swift',
            'packages/swiftui/Sources/DesignSchema/Support/FocusScope.swift',
            'packages/swiftui/Sources/DesignSchemaTokens/Theme.swift',
            'packages/swiftui/Package.swift'],
};

/** Where a platform's generated component files live: `packages/react/src/`, and for the Swift package
 *  `packages/swiftui/Sources/DesignSchema/` (SwiftPM's layout, not `src/`). */
export function srcDir(platform: string): string {
  return sourceDir(paths.ROOT, platform);
}

// ---------------------------------------------------------------- naming (tools/naming.ts)

/** Every folder of a platform this tool writes generated code into: the package source, and the demo
 *  pages a `--pattern` target lands in. What a rename covers, therefore, is exactly what this writes. */
export function generatedDirs(platform: string): string[] {
  const dirs = [srcDir(platform)];
  const demo = demoDir(paths.ROOT, platform);
  if (demo !== null) dirs.push(demo);
  return dirs.filter((d) => existsSync(d));
}

/** The run's naming doc, resolved once (the flag is fixed for a run, so the memo is the "once"). The
 *  collisions a brand's own prop names cause are printed here, where they are printed exactly once. */
let resolved: { ref: string | null; res: naming.Resolution } | null = null;

export function namingFor(args: Args): naming.Resolution {
  const ref = args.naming ?? null;
  if (resolved !== null && resolved.ref === ref) return resolved.res;
  const res = naming.resolve(ref);
  resolved = { ref, res };
  if (!naming.isNoop(res)) {
    print(`naming ${relative(paths.ROOT, res.source as string).replaceAll('\\', '/')}: ` +
      `${Object.keys(res.components).length} component(s), ${Object.keys(res.props).length} prop(s), --${res.cssPrefix}- prefix`);
    for (const platform of PLATFORMS) {
      for (const warning of naming.collisions(res, platform)) print(`  ! naming ${platform}: ${warning}`);
    }
  }
  return res;
}

/** Forget the memo, for a test (and for a second `main()` in the same process). */
export function resetNaming(): void {
  resolved = null;
}

/**
 * Rename a platform's generated folders, in either direction. `canonical` runs before the model and the
 * gates — they only ever see Design Schema's own names — and `brand` runs after the last gate, as the
 * final write of the target. Both are no-ops when no naming doc is active.
 */
export function renameTree(platform: string, res: naming.Resolution, direction: naming.Direction): naming.Applied {
  const all: naming.Applied = { edited: [], renames: [] };
  if (naming.isNoop(res)) return all;
  for (const dir of generatedDirs(platform)) {
    const applied = naming.rename(dir, res, direction, platform);
    all.edited.push(...applied.edited);
    all.renames.push(...applied.renames);
  }
  return all;
}

/** What the rename did, as one line — or nothing at all when it found nothing to do. */
function printRename(key: string, applied: naming.Applied, direction: naming.Direction): void {
  if (applied.edited.length === 0 && applied.renames.length === 0) return;
  const arrow = direction === 'brand' ? '↻' : '↺';
  const what = direction === 'brand' ? 'brand names applied to' : 'canonical names restored in';
  print(`  ${arrow} ${key}: naming — ${what} ${applied.edited.length} file(s), ${applied.renames.length} renamed`);
}

export const REPORT_INSTRUCTIONS = `
## Reporting (mandatory)

When the files are written, end your reply with exactly one fenced block:

\`\`\`json
{"files": ["packages/<pkg>/src/<Name>.<ext>", "..."], "gaps": ["<component>: <what was ambiguous, missing or contradictory, and what you chose>", "..."]}
\`\`\`

\`gaps\` is the most valuable output: every place the spec made you guess. Be specific. An empty list means the doc was complete.
Do not edit anything under site/, schema/, prompts/ or generated/ — the docs are fixed from your gap list by a separate pass.
Do not add dependencies. Do not write README files.
`;

/** The tools the cli runner hands Claude Code. A generation writes package code and runs the gates itself. */
const ALLOWED_TOOLS =
  'Read,Write,Edit,MultiEdit,Glob,Grep,Bash(pnpm *),Bash(npm run *),Bash(npx tsc *),Bash(npx vitest *),Bash(npx jest *),' +
  'Bash(npx eslint *),Bash(node tools/*),Bash(python3 *),Bash(python *),Bash(py *),Bash(grep *),Bash(find *),Bash(cat *),' +
  'Bash(head *),Bash(tail *),Bash(awk *),Bash(which *),Bash(where *),PowerShell(pnpm *),PowerShell(npm run *),' +
  'PowerShell(npx *),PowerShell(py *),PowerShell(node tools/*),mcp__design-schema__*';

function print(line: string): void {
  process.stdout.write(line + '\n');
}

/** `sys.exit(message)`: the message on stderr, exit code 1. */
export class ExitError extends Error {
  code: number;
  constructor(message: string, code: number = 1) {
    super(message);
    this.name = 'ExitError';
    this.code = code;
  }
}

function die(message: string): never {
  throw new ExitError(message);
}

/**
 * The gates, run by tools/checks.ts — in process now that both are TypeScript, so the printed line and
 * the results are the gate runner's own.
 */
export function runGates(platform: string, skip?: Set<string>, verbose: boolean = true, extra?: Set<string>): GateResult[] {
  return runAll(platform, skip ?? new Set(), verbose, extra ?? new Set());
}

/** Seconds, the way `time.sleep` takes them. */
function sleep(seconds: number): Promise<void> {
  return new Promise((done) => {
    setTimeout(done, seconds * 1000);
  });
}

export function sha(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

/** One lockfile per platform, so three generators (one per platform) never write the same file. */
export function lockPath(platform: string): string {
  return join(paths.LOCK_DIR, `generate.lock.${platform}.json`);
}

// `json.dumps(..., indent=2, ensure_ascii=False)` is `JSON.stringify(..., null, 2)` for every value a
// lock entry holds but one: a whole-number float, which Python spells `0.0` and JavaScript `0`. The cost
// is the only float in the file, so it is the only key that needs telling.
const FLOAT_KEYS: ReadonlySet<string> = new Set(['costUsd']);

function dumpJson(value: unknown, level: number, key: string): string {
  const pad = '  '.repeat(level);
  const inner = '  '.repeat(level + 1);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return Number.isInteger(value) && FLOAT_KEYS.has(key) ? value.toFixed(1) : JSON.stringify(value);
  if (typeof value !== 'object') return JSON.stringify(value) as string;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[\n${value.map((v) => inner + dumpJson(v, level + 1, '')).join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(value as Dict);
  if (entries.length === 0) return '{}';
  return `{\n${entries.map(([k, v]) => `${inner}${JSON.stringify(k)}: ${dumpJson(v, level + 1, k)}`).join(',\n')}\n${pad}}`;
}

export function readJson(path: string): Lock {
  return existsSync(path) ? (JSON.parse(readText(path)) as Lock) : {};
}

/** Atomic: write beside the target, then replace, so a reader never sees a half-written file. */
export function writeJson(path: string, data: Lock): void {
  const sorted: Lock = {};
  for (const key of pySorted(Object.keys(data))) sorted[key] = data[key] as Dict;
  writeTextAtomic(path, dumpJson(sorted, 0, '') + '\n');
}

/** `a == b` on two dicts: by value, whatever order the keys were inserted in. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => sameValue(x, b[i]));
  const x = a as Dict;
  const y = b as Dict;
  const keys = Object.keys(x);
  return keys.length === Object.keys(y).length && keys.every((k) => Object.hasOwn(y, k) && sameValue(x[k], y[k]));
}

// a log without its end marker that has not moved in half an hour was abandoned, not paused
export const RUNNING_LOG_MAX_AGE_S = 30 * 60;

/** True while another generator run appears to be in progress: a regen.ps1 log without its end marker that
 *  was written to recently. A killed window leaves a log without the marker forever; its age tells. */
export function generatorRunning(): boolean {
  let names: string[];
  try {
    names = readdirSync(paths.LOGS);
  } catch {
    return false; // no logs folder: nothing is running
  }
  const logs = names.filter((n) => n.startsWith('regen') && n.endsWith('.log'));
  for (const name of logs) {
    const log = join(paths.LOGS, name);
    let text: string;
    let age: number;
    try {
      text = readFileSync(log, 'utf8'); // errors="replace" is Node's default for utf8
      age = Date.now() / 1000 - statSync(log).mtimeMs / 1000;
    } catch {
      continue;
    }
    if (!text.includes('== done ==') && !text.includes('queue complete') && age < RUNNING_LOG_MAX_AGE_S) return true;
  }
  return false;
}

/** Split generated/generate.lock.json into the per-platform files. Entries already in a per-platform
 *  file win (they were written by the new code). The legacy file is deleted afterwards unless another
 *  generator run still appears to be active — an older process would rewrite it at its next save — in
 *  which case it is left in place and merged on every load until the run ends. */
export function migrateLegacyLock(): void {
  if (!existsSync(paths.LEGACY_LOCK)) return;
  const legacy = readJson(paths.LEGACY_LOCK);
  for (const platform of PLATFORMS) {
    const current = readJson(lockPath(platform));
    const merged: Lock = {};
    for (const [k, v] of Object.entries(legacy)) if (k.endsWith(`.${platform}`)) merged[k] = v;
    Object.assign(merged, current);
    if (!sameValue(merged, current) || !existsSync(lockPath(platform))) writeJson(lockPath(platform), merged);
  }
  if (generatorRunning()) {
    print(`  note: ${basename(paths.LEGACY_LOCK)} kept — a generator run is still active; it is merged on load and removed on the next run after it finishes`);
    return;
  }
  unlinkSync(paths.LEGACY_LOCK);
}

/** The merged view over every platform's lockfile (plus the legacy file while it still exists). */
export function loadLock(): Lock {
  migrateLegacyLock();
  const lock: Lock = {};
  if (existsSync(paths.LEGACY_LOCK)) Object.assign(lock, readJson(paths.LEGACY_LOCK));
  for (const platform of PLATFORMS) Object.assign(lock, readJson(lockPath(platform)));
  return lock;
}

/** Write only this platform's entries, merged over what is on disk for it, so concurrent runs of the
 *  other platforms are never overwritten and a stale in-memory copy never drops a newer entry. */
export function saveLock(lock: Lock, platform: string): void {
  const onDisk = readJson(lockPath(platform));
  for (const [k, v] of Object.entries(lock)) if (k.endsWith(`.${platform}`)) onDisk[k] = v;
  writeJson(lockPath(platform), onDisk);
}

export function promptPath(name: string, platform: string): string {
  return join(paths.PROMPTS, `${name}.${platform}.md`);
}

/** `<Name>.<platform>` for every pair whose doc says `platforms.<platform>.supported: false`. The parser writes
 *  no prompt for those, but a prompt from before the doc said so can still be on disk, and `--component` names
 *  pairs directly: neither may generate code for a platform the doc rules out. */
export function unsupportedTargets(): Set<string> {
  const out = new Set<string>();
  if (!existsSync(paths.COMPONENTS)) return out;
  type Entry = { component: { name: string; platforms?: Record<string, { supported?: boolean }> } };
  for (const { component: c } of JSON.parse(readText(paths.COMPONENTS)) as Entry[]) {
    for (const [platform, notes] of Object.entries(c.platforms ?? {})) if (notes.supported === false) out.add(`${c.name}.${platform}`);
  }
  return out;
}

export function allTargets(): Target[] {
  let names: string[];
  try {
    names = readdirSync(paths.PROMPTS);
  } catch {
    return [];
  }
  const unsupported = unsupportedTargets();
  const out: Target[] = [];
  for (const file of sortedNames(names.filter((n) => n.endsWith('.md')))) {
    if (file.startsWith('theme.')) continue;
    const stem = file.slice(0, -'.md'.length);
    const cut = stem.lastIndexOf('.'); // `Pattern.<Name>.<platform>` keeps its dot in the name
    if (cut === -1) continue;
    const [name, platform] = [stem.slice(0, cut), stem.slice(cut + 1)];
    if (isPlatform(platform) && !unsupported.has(stem)) out.push([name, platform]);
  }
  return out;
}

export function staleTargets(lock: Lock): Target[] {
  return allTargets().filter(([n, p]) => (lock[`${n}.${p}`] ?? {})['hash'] !== sha(readText(promptPath(n, p))));
}

// ---------------------------------------------------------------- task prompts

/** The generator needs the theme's judgment sections, not its resolved token table (the tokens file is on disk
 *  and the literal gate enforces names). Keep from 'How to make decisions' up to 'When to use'. */
export function feelOnly(skill: string): string {
  const start = skill.indexOf('## How to make decisions');
  const end = skill.indexOf('## When to use');
  if (start === -1) return skill;
  return pyStrip(end > start ? skill.slice(start, end) : skill.slice(start));
}

export function taskPrompt(name: string, platform: string): string {
  const spec = readText(promptPath(name, platform));
  const themeFile = join(paths.PROMPTS, 'theme.calm-precise.md');
  const theme = feelOnly(existsSync(themeFile) ? readText(themeFile) : '');
  const digestFile = join(paths.CONVENTIONS, `${platform}.md`);
  const digest = existsSync(digestFile) ? readText(digestFile) : '';
  const files = CONVENTION_FILES[platform] as string[];
  const exemplar = files[1] as string;
  let task: string;
  if (name.startsWith('Pattern.')) {
    const short = name.slice(name.indexOf('.') + 1);
    task =
      `Then generate the pattern page **${short}** from the specification below into \`packages/${PACKAGE_DIR[platform] as string}/demo/\` ` +
      `(the page and its \`Patterns/${short}\` story). Do not touch \`src/index.ts\`; compose only the package's existing ` +
      `components and never re-implement or restyle them.`;
  } else if (platform === 'swiftui') {
    // No index.ts: a Swift package exports every `public` symbol, and what makes a component appear in
    // the gallery app is its own screen file. `Gallery+Generated.swift` is the generator's to rewrite.
    task =
      `Then generate **${name}** from the specification below, and beside it ` +
      `\`packages/swiftui/Sources/DesignSchema/Gallery+${name}.swift\` — \`public extension Gallery { static var ` +
      `${galleryEntryName(name)}: GalleryEntry { GalleryEntry("${name}") { … } } }\`, one screen showing the component in its ` +
      `states, in the style of the existing \`Gallery+*.swift\` files. Never edit \`Support/Gallery+Generated.swift\`: the ` +
      `generator rewrites it from the screen files. If the spec's Related section names components that exist in the ` +
      `package, compose them; never re-implement or restyle them.`;
  } else {
    task =
      `Then generate **${name}** from the specification below. Also add the export(s) to the package's \`index.ts\` in its ` +
      `existing style. If the spec's Related section names components that exist in the package, compose them; never ` +
      `re-implement or restyle them.`;
  }
  const open = platform === 'swiftui' ? 'for the gallery screen type' : 'to add the export';
  return `You are the ${PLATFORM_LABEL[platform] as string} generator for the Design Schema repository (cwd is the repo root).

The package conventions are summarised below; follow them exactly. Do not read the whole package — open \`${files[0] as string}\` ${open}, and at most one existing component (\`${exemplar}\` or the one closest to what you are writing) if the digest leaves a detail out.

${digest}

${task}

${REPORT_INSTRUCTIONS}

---

${spec}

---

## Theme feel (for judgment calls the spec leaves open)

${theme}
`;
}

export function fixPrompt(name: string, platform: string, failures: string, roundNo: number): string {
  return `Round ${roundNo}: the build gates rejected the generated **${name}** for ${PLATFORM_LABEL[platform] as string}. Fix the code so every gate passes. Do not weaken the spec to make a gate pass; if a gate and the spec conflict, fix the code to the spec and report the conflict as a gap.

${failures}

Rules reminder: tokens only (no hex/px/ms/font literals — mark a sanctioned one with \`literal-ok: <reason>\`), no new dependencies, do not edit docs.
${REPORT_INSTRUCTIONS}`;
}

// ---------------------------------------------------------------- runners

// A runner failure is the API or the CLI, not the spec, so it never counts against the target's rounds. An API
// hiccup (`is_error` with an empty result, a rate limit, an overload, a dropped connection) is retried with a
// backoff; any other runner error gets one retry; an error the model itself reported is recorded straight away.
const TRANSIENT = /rate.?limit|overloaded|\b529\b|ECONNRESET/i;
const TRANSIENT_BACKOFF_S: readonly number[] = [30, 90];
const RUNNER_RETRY_S: readonly number[] = [30];

/** What Python caught as `(RuntimeError, subprocess.SubprocessError, OSError)`: the runner failing rather
 *  than the model answering. JavaScript has no such hierarchy, so the loop treats anything thrown by a
 *  runner as one of these — job 190's rule is that one dead call must never abort the phase. */
export class RunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RunnerError';
  }
}

/** `claude -p` returned is_error. Empty text or a rate-limit / overload message is the API failing, not the task. */
export class ModelError extends RunnerError {
  transient: boolean;
  constructor(result: string | null | undefined) {
    const text = result ?? '';
    const head = [...pyStrip(text)].slice(0, 500).join('');
    super(`claude reported an error: ${head || '(empty result)'}`);
    this.name = 'ModelError';
    this.transient = pyStrip(text) === '' || TRANSIENT.test(text);
  }
}

function errorText(exc: unknown): string {
  return exc instanceof Error ? exc.message : String(exc);
}

export function errorLine(exc: unknown): string {
  const text = pyStrip(errorText(exc));
  if (!text) return exc instanceof Error ? exc.constructor.name : typeof exc;
  return [...(pySplitlines(text)[0] as string)].slice(0, 300).join('');
}

/** Seconds to wait before each further attempt at the same round; empty means record and move on. */
export function retrySchedule(exc: unknown): readonly number[] {
  if (exc instanceof ModelError) return exc.transient ? TRANSIENT_BACKOFF_S : [];
  return TRANSIENT.test(errorText(exc)) ? TRANSIENT_BACKOFF_S : RUNNER_RETRY_S;
}

export type RunResult = [text: string, session: string | null, cost: number];

export type Runner = {
  /** → (result_text, session_id, cost_usd) */
  run(prompt: string, resume: string | null): Promise<RunResult>;
};

/** One model call, repeated on the schedule its error earns. Re-raises the last error once that is exhausted. */
export async function runWithRetry(runner: Runner, prompt: string, resume: string | null, key: string, roundNo: number): Promise<RunResult> {
  let attempt = 0;
  for (;;) {
    try {
      return await runner.run(prompt, resume);
    } catch (e) {
      if (e instanceof ExitError) throw e;
      const delays = retrySchedule(e);
      if (attempt >= delays.length) throw e;
      const wait = delays[attempt] as number;
      attempt += 1;
      print(`  round ${roundNo}: runner error — ${errorLine(e)} — retrying ${key} in ${wait} s (${attempt}/${delays.length})`);
      await hooks.sleep(wait);
    }
  }
}

/** Text mode: utf-8 in, universal newlines out, as `subprocess.run(text=True, encoding="utf-8")` gives. */
function decode(buffer: Buffer | null): string {
  return (buffer ?? Buffer.alloc(0)).toString('utf8').replace(/\r\n?/g, '\n');
}

/** Python's `text[-n:]`, by code point. */
function tail(text: string, n: number): string {
  return [...text].slice(-n).join('');
}

/** Claude Code headless. Tools on, edits auto-accepted, cwd = repo root. */
export class CliRunner implements Runner {
  model: string;
  maxTurns: number;
  exe: string;

  constructor(model: string, maxTurns: number) {
    this.model = model;
    this.maxTurns = maxTurns;
    const exe = which('claude') ?? which('claude.cmd');
    if (!exe) die('✖ `claude` CLI not found on PATH — install Claude Code, or use --runner api');
    this.exe = exe;
  }

  async run(prompt: string, resume: string | null): Promise<RunResult> {
    const argv = [this.exe, '-p', '--output-format', 'json', '--permission-mode', 'acceptEdits',
      '--model', this.model, '--max-turns', String(this.maxTurns),
      '--allowedTools', ALLOWED_TOOLS];
    if (resume) argv.push('--resume', resume);
    const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
    const options = { cwd: paths.ROOT, env, input: Buffer.from(prompt, 'utf8'), encoding: 'buffer' as const, timeout: 3_600_000, maxBuffer: 64 * 1024 * 1024 };
    // Windows: `claude` is a `.cmd`, which Node will not spawn without a shell — so the command goes
    // through cmd.exe pre-quoted. POSIX spawns the argv directly, as subprocess.run(list) does.
    const p =
      process.platform === 'win32'
        ? spawnSync(argv.map(winQuote).join(' '), { ...options, shell: true })
        : spawnSync(argv[0] as string, argv.slice(1), options);
    if (p.error && (p.error as NodeJS.ErrnoException).code === 'ETIMEDOUT') throw new RunnerError('claude timed out after 3600 s');
    if (p.error) throw new RunnerError(`claude could not be started: ${(p.error as Error).message}`);
    const stdout = decode(p.stdout);
    const stderr = decode(p.stderr);
    if (p.status !== 0 && !pyStrip(stdout)) throw new RunnerError(`claude exited ${p.status}: ${tail(stderr, 2000)}`);
    let data: Dict;
    try {
      const lines = pySplitlines(pyStrip(stdout));
      const parsed: unknown = JSON.parse(lines[lines.length - 1] ?? '');
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not a JSON object');
      data = parsed as Dict;
    } catch {
      throw new RunnerError(`unexpected claude output: ${tail(stdout, 2000)}\n${tail(stderr, 1000)}`);
    }
    if (truthy(data['is_error'])) throw new ModelError(truthy(data['result']) ? pyStr(data['result']) : '');
    const denials = data['permission_denials'];
    if (Array.isArray(denials) && denials.length > 0) {
      print(`  ! ${denials.length} tool call(s) were denied — widen --allowedTools if the model needed them:`);
      for (const d of denials.slice(0, 8)) {
        const entry = (d ?? {}) as Dict;
        const inp = (truthy(entry['tool_input']) ? entry['tool_input'] : {}) as Dict;
        const what = truthy(inp['command'])
          ? inp['command']
          : truthy(inp['file_path'])
            ? inp['file_path']
            : truthy(inp['pattern'])
              ? inp['pattern']
              : [...pyJsonDumps(inp)].slice(0, 120).join('');
        print(`      ${pyStr(entry['tool_name'] ?? null)}: ${[...pyStr(what)].slice(0, 140).join('')}`);
      }
    }
    const reason = data['terminal_reason'] ?? null;
    if (reason !== null && reason !== 'success' && reason !== 'end_turn') {
      print(`  ! run ended with terminal_reason=${pyStr(reason)} after ${pyStr(data['num_turns'] ?? null)} turns`);
    }
    const result = data['result'];
    const cost = truthy(data['total_cost_usd']) ? Number(data['total_cost_usd']) : 0;
    return [result === undefined ? '' : pyStr(result), (data['session_id'] as string | null) ?? null, cost];
  }
}

const FILE_BLOCK = /^===== FILE: ([\s\S]+?) =====\n([\s\S]*?)(?=^===== (?:FILE|END) )/gm;

const ANTHROPIC_SDK: string = '@anthropic-ai/sdk';

/** Anthropic Messages API. No tools: convention files are inlined and files come back in a fenced format. */
export class ApiRunner implements Runner {
  model: string;
  platform: string;
  messages: Dict[];

  constructor(model: string, platform: string) {
    try {
      createRequire(import.meta.url).resolve(ANTHROPIC_SDK);
    } catch {
      die('✖ pnpm add -D @anthropic-ai/sdk  (or use --runner cli)');
    }
    this.model = model;
    this.platform = platform;
    this.messages = [];
  }

  async run(prompt: string, _resume: string | null): Promise<RunResult> {
    const sdk = (await import(ANTHROPIC_SDK)) as { default: new () => Dict };
    const client = new sdk.default() as { messages: { create(body: Dict): Promise<{ content: Dict[] }> } };
    if (this.messages.length === 0) {
      // first round: inline the conventions, since there is no Read tool
      const ctx: string[] = [];
      for (const f of CONVENTION_FILES[this.platform] as string[]) {
        const fp = join(paths.ROOT, f);
        if (existsSync(fp)) ctx.push(`===== ${f} =====\n${[...readText(fp)].slice(0, 12000).join('')}`);
      }
      prompt = 'Repository files for conventions (read-only):\n\n' + ctx.join('\n\n') + '\n\n' + prompt;
    }
    prompt +=
      '\n\n## Output format (no tools available)\nFor every file, emit:\n===== FILE: packages/<pkg>/src/<Name>.<ext> =====\n<full file content>\n' +
      'and after the last file a line `===== END =====`. For `index.ts`, emit the complete new file. Then the JSON report block.';
    this.messages.push({ role: 'user', content: prompt });
    const r = await client.messages.create({
      model: this.model,
      max_tokens: 32000,
      messages: this.messages,
      system: 'You write production TypeScript for a design system. Follow the specification exactly.',
    });
    const text = r.content.map((b) => (typeof b['text'] === 'string' ? b['text'] : '')).join('');
    this.messages.push({ role: 'assistant', content: text });
    let written = 0;
    for (const m of (text + '\n===== END =====\n').matchAll(FILE_BLOCK)) {
      const rel = pyStrip(m[1] as string);
      const body = m[2] as string;
      if (!rel.startsWith('packages/')) continue;
      mkdirSync(dirname(join(paths.ROOT, rel)), { recursive: true });
      writeText(join(paths.ROOT, rel), body.replace(/\n+$/, '') + '\n');
      written += 1;
    }
    print(`  api runner wrote ${written} file(s)`);
    return [text, null, 0];
  }
}

// ---------------------------------------------------------------- report parsing

const REPORT = /```json\s*(\{[\s\S]*?\})\s*```/g;

export const NO_REPORT = '(model did not return the JSON report block)';
export const REPORT_NUDGE = `Your reply did not end with the JSON report block. Do not change any file. Reply with only that block now:

\`\`\`json
{"files": ["<every file you wrote or edited, repo-relative>"], "gaps": ["<every place the spec made you guess>"]}
\`\`\``;

export type Report = { files: string[]; gaps: string[] };

/** `[str(x) for x in value]`: a list as it is, a string character by character, anything else as nothing. */
function pyList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(pyStr);
  if (typeof value === 'string') return [...value];
  return [];
}

export function parseReport(text: string): Report {
  const blocks = [...text.matchAll(REPORT)].map((m) => m[1] as string);
  for (const b of blocks.reverse()) {
    let d: unknown;
    try {
      d = JSON.parse(b);
    } catch {
      continue;
    }
    if (d !== null && typeof d === 'object' && !Array.isArray(d) && Object.hasOwn(d, 'files')) {
      return { files: pyList((d as Dict)['files']), gaps: pyList((d as Dict)['gaps']) };
    }
  }
  return { files: [], gaps: [NO_REPORT] };
}

export function customDir(platform: string): string {
  return join(srcDir(platform), 'custom');
}

/** Every file under packages/<pkg>/src/custom/ with its content. The folder is hand-written (extension modules);
 *  the model may import from it but never write there, and allowedTools cannot express a deny, so the run is
 *  checked against this snapshot afterwards. */
export function customSnapshot(platform: string): Record<string, Buffer> {
  const d = customDir(platform);
  if (!existsSync(d)) return {};
  const out: Record<string, Buffer> = {};
  const walk = (dir: string, prefix: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), rel);
      else out[rel] = readFileSync(join(dir, e.name));
    }
  };
  walk(d, '');
  return out;
}

/** Put custom/ back exactly as snapshotted; returns the files that had been changed, added or removed. */
export function restoreCustom(platform: string, snapshot: Record<string, Buffer>): string[] {
  const d = customDir(platform);
  const now = customSnapshot(platform);
  const same = (a: Buffer | undefined, b: Buffer | undefined): boolean => (a === undefined || b === undefined ? a === b : a.equals(b));
  const changed = pySorted([...new Set([...Object.keys(snapshot), ...Object.keys(now)])].filter((k) => !same(snapshot[k], now[k])));
  for (const rel of changed) {
    const f = join(d, rel);
    if (Object.hasOwn(snapshot, rel)) {
      mkdirSync(dirname(f), { recursive: true });
      writeFileSync(f, snapshot[rel] as Buffer);
    } else if (existsSync(f)) {
      unlinkSync(f);
    }
  }
  return changed;
}

// ---------------------------------------------------------------- the swiftui gallery registry

/** `Button` → `buttonScreen`: the symbol a component's `Gallery+<Name>.swift` declares. */
export function galleryEntryName(name: string): string {
  const stem = name.startsWith('Pattern.') ? name.slice(name.indexOf('.') + 1) : name;
  return (stem.charAt(0).toLowerCase() + stem.slice(1)) + 'Screen';
}

export const GALLERY_REGISTRY = join('Support', 'Gallery+Generated.swift');

/**
 * Rewrite `Support/Gallery+Generated.swift` from the `Gallery+<Name>.swift` files on disk. The gallery app
 * renders `Gallery.entries` and never names a component, so this one generated list is what makes a new
 * component appear in it — and it has to be written before the gate runs, or the branch compiles code the
 * runner cannot see the point of.
 */
export function writeGalleryRegistry(platform: string = 'swiftui'): string | null {
  const dir = srcDir(platform);
  if (!existsSync(dir)) return null;
  const names = sortedNames(
    readdirSync(dir)
      .filter((n) => n.startsWith('Gallery+') && n.endsWith('.swift') && n !== 'Gallery+Generated.swift')
      .map((n) => n.slice('Gallery+'.length, -'.swift'.length)),
  );
  const body = names.length === 0 ? '[]' : `[\n${names.map((n) => `            Self.${galleryEntryName(n)},`).join('\n')}\n        ]`;
  const text = `//  Gallery+Generated.swift
//
//  Generated by tools/generate.ts after every swiftui generation round: one entry per
//  Sources/DesignSchema/Gallery+<Name>.swift. Do not edit by hand — the next generation overwrites it.

import SwiftUI

public extension Gallery {
    /// The generated component screens; \`Gallery.entries\` sorts them by name.
    static var generated: [GalleryEntry] {
        ${body}
    }
}
`;
  const file = join(dir, GALLERY_REGISTRY);
  if (existsSync(file) && readText(file) === text) return null;
  mkdirSync(dirname(file), { recursive: true });
  writeText(file, text);
  return relative(paths.ROOT, file).replaceAll('\\', '/');
}

/** `datetime.now().strftime("%Y-%m-%d %H:%M")`, local time. */
function stamp(now: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** `datetime.now(timezone.utc).isoformat(timespec="seconds")`. */
function utcNow(): string {
  return new Date().toISOString().replace(/\.\d+Z$/, '+00:00');
}

export function recordGaps(name: string, platform: string, gaps: string[], roundNo: number): void {
  if (gaps.length === 0) return;
  mkdirSync(paths.GAPS, { recursive: true });
  const f = join(paths.GAPS, `${name}.${platform}.md`);
  const body = `\n## ${stamp(new Date())} — round ${roundNo}\n\n` + gaps.map((g) => `- ${g}`).join('\n') + '\n';
  if (!existsSync(f)) {
    writeText(
      f,
      `# Gaps reported while generating ${name} for ${platform}\n\nEach entry is a place the doc made the generator guess. Fix the doc, re-run parse, regenerate.\n`,
    );
  }
  appendText(f, body);
}

// ---------------------------------------------------------------- main loop

/** What the preamble decided about a target: generate it (with its prompt hash), or not, and why. */
export type Ready = { go: boolean; hash: string; ok: boolean };

/** The prompt has to exist, the hash has to be stale (unless --force), and --dry-run stops here. Shared by
 *  the local driver and the batch one, so a swiftui target is skipped, printed and dry-run identically. */
function ready(name: string, platform: string, args: Args, lock: Lock): Ready {
  const key = `${name}.${platform}`;
  const pp = promptPath(name, platform);
  if (!existsSync(pp)) {
    print(`✖ ${key}: no prompt at ${relative(paths.ROOT, pp)} (run tools/parse.ts)`);
    return { go: false, hash: '', ok: false };
  }
  const h = sha(readText(pp));
  if (!args.force && (lock[key] ?? {})['hash'] === h) {
    print(`= ${key}: up to date (${h})`);
    return { go: false, hash: h, ok: true };
  }
  print(`\n== ${key}  prompt ${h}  model ${args.model}  runner ${args.runner}`);
  if (args.dryRun) {
    print([...hooks.taskPrompt(name, platform)].slice(0, 1500).join('') + '\n…');
    return { go: false, hash: h, ok: true };
  }
  return { go: true, hash: h, ok: true };
}

/**
 * Preflight: gates that do not depend on the generated code must already pass, or every fix round
 * would be spent on something the model cannot change (a doc elsewhere failing to parse, a contrast
 * pair in another component). Costs nothing; saves the whole run when the docs are the problem.
 */
function preflight(platform: string, skip: Set<string>, what: string): boolean {
  const preSkip = new Set([...skip, 'typecheck', 'literals', 'keyboard', 'keyboard-run', 'axe']);
  const pre = hooks.runGates(platform, preSkip, false).filter((r) => !r.ok);
  if (pre.length === 0) return true;
  print(`  ✖ ${what}: preflight failed before any model call — fix the docs and re-run tools/parse.ts:`);
  for (const r of pre) print('    ' + pySplitlines(pyStrip(r.output)).slice(-6).join('\n    '));
  return false;
}

/** Session and cost carried across a target's rounds; `modelRound` updates it in place so a call that
 *  throws halfway (the report nudge, say) still leaves what was already spent in the lock. */
type CallState = { session: string | null; cost: number };

/** One model call for one target: the retries, the missing-report nudge and the custom/ guard. */
async function modelRound(
  state: CallState, runner: Runner, prompt: string, platform: string, key: string, roundNo: number, args: Args,
): Promise<{ report: Report; customChanged: string[]; roundCost: number }> {
  const customBefore = hooks.customSnapshot(platform);
  try {
    const [text, s, roundCost] = await runWithRetry(runner, prompt, args.runner === 'cli' ? state.session : null, key, roundNo);
    state.session = s;
    const customChanged = hooks.restoreCustom(platform, customBefore);
    state.cost += roundCost;
    let rep = parseReport(text);
    if (rep.files.length === 0 && rep.gaps.includes(NO_REPORT) && args.runner === 'cli' && state.session) {
      // The model finished without the trailing report (Text.lit did). One cheap resumed turn asks for it, so
      // the files it touched reach the lock; the original gap line stays if the second reply has none either.
      print(`  round ${roundNo}: no JSON report — asking once more for it`);
      const [text2, s2, c2] = await runWithRetry(runner, REPORT_NUDGE, state.session, key, roundNo);
      state.session = s2;
      state.cost += c2;
      const rep2 = parseReport(text2);
      if (rep2.files.length > 0 || !rep2.gaps.includes(NO_REPORT)) {
        rep = { files: rep2.files, gaps: [...rep2.gaps, '(report recovered after a second request)'] };
      }
    }
    return { report: rep, customChanged, roundCost };
  } catch (e) {
    hooks.restoreCustom(platform, customBefore);
    throw e;
  }
}

/** The gate that says the model wrote where it may not: custom/ is hand-written and was put back. */
function customGate(platform: string, customChanged: string[]): GateResult {
  print('  ✖ custom     restored ' + customChanged.join(', '));
  return {
    name: 'custom',
    ok: false,
    output:
      relative(paths.ROOT, customDir(platform)).replaceAll('\\', '/') + "/ is hand-written and never the generator's to change; these files were " +
      'restored: ' + customChanged.join(', ') + '. Import the modules the Extensions section names and call them where ' +
      '`wire` says; do not create, edit or copy anything under custom/.',
  };
}

/** The runner, not the spec, gave up: no hash (stays stale for the next pass), the message in the lock,
 *  and on to the next target — one dead API call must not abort the phase. */
function recordRunnerError(
  key: string, platform: string, h: string, message: string, state: CallState, files: string[], gaps: number, roundNo: number, args: Args, lock: Lock,
): void {
  lock[key] = {
    hash: null, lastAttemptHash: h, error: message,
    generatedAt: utcNow(),
    model: args.model, runner: args.runner, rounds: roundNo, costUsd: pyRoundTo(state.cost, 4),
    files, gaps, gates: {},
  };
  saveLock(lock, platform);
  print(`  ? ${key}: runner error, will retry on the next pass\n    ${message}`);
}

function recordResult(
  key: string, platform: string, h: string, results: GateResult[], state: CallState, files: string[], gaps: number, roundNo: number, args: Args, lock: Lock,
  extra: Dict = {},
): boolean {
  const ok = results.every((r) => r.ok);
  lock[key] = {
    hash: ok ? h : ((lock[key] ?? {})['hash'] ?? null), // a failed run does not claim the hash → stays stale
    lastAttemptHash: h,
    generatedAt: utcNow(),
    model: args.model, runner: args.runner, rounds: roundNo, costUsd: pyRoundTo(state.cost, 4),
    files, gaps,
    gates: Object.fromEntries(results.map((r) => [r.name, r.ok])),
    ...extra,
  };
  saveLock(lock, platform);
  print(`  ${ok ? '✔' : '✖'} ${key}: ${files.length} file(s), ${gaps} gap(s), ${roundNo} round(s), $${pyFixed(state.cost, 3)}`);
  return ok;
}

export async function generateOne(
  name: string, platform: string, args: Args, lock: Lock, names: naming.Resolution = hooks.namingFor(args),
): Promise<boolean> {
  const key = `${name}.${platform}`;
  const start = ready(name, platform, args, lock);
  if (!start.go) return start.ok;
  const h = start.hash;

  // A fork's tree is committed in its brand's names; the model and every gate work in canonical ones.
  printRename(key, hooks.renameTree(platform, names, 'canonical'), 'canonical');
  const skip = new Set(args.skip);
  if (!preflight(platform, skip, key)) {
    printRename(key, hooks.renameTree(platform, names, 'brand'), 'brand');
    return false;
  }

  const runner: Runner = args.runner === 'cli' ? hooks.CliRunner(args.model, args.maxTurns) : hooks.ApiRunner(args.model, platform);
  const state: CallState = { session: null, cost: 0 };
  let files: string[] = [];
  const allGaps: string[] = [];
  let results: GateResult[] = [];
  let prompt = hooks.taskPrompt(name, platform);
  let roundNo = 1;
  for (; roundNo <= args.maxRounds; roundNo++) {
    print(`  round ${roundNo}: model …`);
    let round: { report: Report; customChanged: string[]; roundCost: number };
    try {
      round = await modelRound(state, runner, prompt, platform, key, roundNo, args);
    } catch (e) {
      if (e instanceof ExitError) throw e;
      recordRunnerError(key, platform, h, errorLine(e), state, namedFiles(files, names, platform), allGaps.length, roundNo, args, lock);
      printRename(key, hooks.renameTree(platform, names, 'brand'), 'brand');
      return false;
    }
    const rep = round.report;
    files = pySorted([...new Set([...files, ...rep.files])]); // union across rounds: fix rounds often touch other files
    allGaps.push(...rep.gaps);
    recordGaps(name, platform, rep.gaps, roundNo);
    print(`  round ${roundNo}: ${rep.files.length} file(s), ${rep.gaps.length} gap(s), $${pyFixed(round.roundCost, 3)}`);
    results = hooks.runGates(platform, skip, true, new Set(args.extra));
    if (round.customChanged.length > 0) results.push(customGate(platform, round.customChanged));
    const bad = results.filter((r) => !r.ok);
    if (bad.length === 0) break;
    if (roundNo === args.maxRounds) {
      print(`  ✖ gates still failing after ${roundNo} round(s): ${bad.map((r) => r.name).join(', ')}`);
      break;
    }
    prompt = hooks.fixPrompt(name, platform, hooks.failuresAsPrompt(results), roundNo + 1);
  }

  // The last write of the target: the gates have had their canonical tree, the brand gets its names.
  printRename(key, hooks.renameTree(platform, names, 'brand'), 'brand');
  return recordResult(key, platform, h, results, state, namedFiles(files, names, platform), allGaps.length, roundNo, args, lock, namingEntry(names));
}

/** The model reports canonical paths; the lock records what is actually on disk afterwards. */
function namedFiles(files: string[], names: naming.Resolution, platform: string): string[] {
  return naming.isNoop(names) ? files : files.map((f) => naming.renamePath(f, names, platform));
}

/** The brand a lock entry's code was written under, so a `git log` of the lockfile says which. */
function namingEntry(names: naming.Resolution): Dict {
  return naming.isNoop(names) ? {} : { naming: relative(paths.ROOT, names.source as string).replaceAll('\\', '/') };
}

// ---------------------------------------------------------------- the batch loop (remote gates)

/** One target inside a batch: everything generateOne keeps in locals, for several targets at once. */
type Job = {
  name: string;
  key: string;
  hash: string;
  runner: Runner;
  state: CallState;
  prompt: string;
  files: string[];
  gaps: string[];
  results: GateResult[];
  rounds: number;
  live: boolean; // still being worked on: not passed, not failed, not abandoned
  recorded: boolean; // its lock entry is already written (a runner or gate error wrote it)
};

/** The files of a target the remote gate carries and folds back: what the model reported, kept to the
 *  Swift package, plus the registry the generator rewrote. */
function gateFiles(job: Job, platform: string): string[] {
  const pkg = `packages/${PACKAGE_DIR[platform] as string}/`;
  const reported = job.files.map((f) => f.replaceAll('\\', '/')).filter((f) => f.startsWith(pkg));
  const registry = relative(paths.ROOT, join(srcDir(platform), GALLERY_REGISTRY)).replaceAll('\\', '/');
  return pySorted([...new Set([...reported, registry])]);
}

/**
 * A whole phase against a remote gate, one CI round trip per round: every target's model call happens
 * locally and in order (one Claude Code at a time), then all of the branches are pushed and dispatched,
 * then all of the runs are waited on together. Ten components cost one wait, not ten.
 *
 * Otherwise this is generateOne's loop: the same preflight, the same lock entries, the same fix prompt
 * built from the failing gates — a `swift build` error reaches the model exactly as a `tsc` one does.
 */
export async function generateBatch(
  names: string[], platform: string, args: Args, lock: Lock, brand: naming.Resolution = hooks.namingFor(args),
): Promise<boolean> {
  let ok = true;
  const jobs: Job[] = [];
  for (const name of names) {
    const start = ready(name, platform, args, lock);
    if (!start.go) {
      ok = ok && start.ok;
      continue;
    }
    jobs.push({
      name, key: `${name}.${platform}`, hash: start.hash,
      runner: args.runner === 'cli' ? hooks.CliRunner(args.model, args.maxTurns) : hooks.ApiRunner(args.model, platform),
      state: { session: null, cost: 0 }, prompt: hooks.taskPrompt(name, platform),
      files: [], gaps: [], results: [], rounds: 0, live: true, recorded: false,
    });
  }
  if (jobs.length === 0) return ok;

  const batchKey = jobs.map((j) => j.key).join(', ');
  // As in generateOne: canonical names for the model and the gates, brand names as the last write.
  printRename(batchKey, hooks.renameTree(platform, brand, 'canonical'), 'canonical');
  const finish = (): void => printRename(batchKey, hooks.renameTree(platform, brand, 'brand'), 'brand');
  const skip = new Set(args.skip);
  if (!preflight(platform, skip, batchKey)) {
    finish();
    return false;
  }
  const gate = hooks.remoteGate(platform);
  try {
    gate.preflight();
  } catch (e) {
    print(`  ✖ ${platform}: the remote gate cannot run — ${errorLine(e)}`);
    finish();
    return false;
  }

  for (let roundNo = 1; roundNo <= args.maxRounds; roundNo++) {
    const live = jobs.filter((j) => j.live);
    if (live.length === 0) break;
    for (const job of live) {
      job.rounds = roundNo;
      print(`  round ${roundNo}: ${job.name} model …`);
      let round: { report: Report; customChanged: string[]; roundCost: number };
      try {
        round = await modelRound(job.state, job.runner, job.prompt, platform, job.key, roundNo, args);
      } catch (e) {
        if (e instanceof ExitError) throw e;
        recordRunnerError(job.key, platform, job.hash, errorLine(e), job.state, job.files, job.gaps.length, roundNo, args, lock);
        job.live = false;
        job.recorded = true;
        ok = false;
        continue;
      }
      const rep = round.report;
      job.files = pySorted([...new Set([...job.files, ...rep.files])]);
      job.gaps.push(...rep.gaps);
      recordGaps(job.name, platform, rep.gaps, roundNo);
      print(`  round ${roundNo}: ${job.name}: ${rep.files.length} file(s), ${rep.gaps.length} gap(s), $${pyFixed(round.roundCost, 3)}`);
      job.results = round.customChanged.length > 0 ? [customGate(platform, round.customChanged)] : [];
    }

    const staged = jobs.filter((j) => j.live);
    if (staged.length === 0) break;
    // The registry lists every gallery screen on disk, so it is written once, after the round's model
    // calls and before anything is pushed.
    const registry = writeGalleryRegistry(platform);
    if (registry) print(`  ↻ ${registry}`);
    // The local gates are doc-level and repo-wide: one run answers for the whole batch.
    const local = hooks.runGates(platform, skip, true, new Set(args.extra));
    let batches: GateBatch[];
    try {
      batches = await gate.runBatch(staged.map((j) => ({ name: j.name, files: gateFiles(j, platform) })));
    } catch (e) {
      if (e instanceof ExitError) throw e;
      // The gate never answered (no `gh`, a dead network, a cancelled run): that is not the spec's
      // fault, so every target of this round is recorded the way a dead model call is.
      const message = errorLine(e);
      for (const job of staged) {
        recordRunnerError(job.key, platform, job.hash, message, job.state, namedFiles(job.files, brand, platform), job.gaps.length, roundNo, args, lock);
        job.live = false;
        job.recorded = true;
      }
      finish();
      return false;
    }

    for (const batch of batches) {
      const job = staged.find((j) => j.name === batch.run.name) as Job;
      job.results = [...job.results, ...local, ...batch.results];
      const bad = job.results.filter((r) => !r.ok);
      if (bad.length === 0) {
        const folded = gate.fold(batch.run);
        if (folded.length > 0) print(`  ⇣ ${job.name}: ${folded.join(', ')}`);
        job.live = false;
        continue;
      }
      gate.discard(batch.run);
      if (roundNo === args.maxRounds) {
        print(`  ✖ ${job.name}: gates still failing after ${roundNo} round(s): ${bad.map((r) => r.name).join(', ')}`);
        job.live = false;
        continue;
      }
      job.prompt = hooks.fixPrompt(job.name, platform, hooks.failuresAsPrompt(job.results), roundNo + 1);
    }
  }

  finish();
  for (const job of jobs) {
    if (job.recorded) {
      ok = false; // its lock entry says why; recording it twice would claim the hash it never earned
      continue;
    }
    const passed = recordResult(
      job.key, platform, job.hash, job.results, job.state, namedFiles(job.files, brand, platform), job.gaps.length, job.rounds, args, lock, namingEntry(brand),
    );
    ok = ok && passed;
  }
  return ok;
}

/** One component's branch, its workflow run and what the run said about it. */
export type GateBatch = swiftui.Batch;

/** The gate that lives somewhere else: tools/swiftui_gate.ts, behind the seam the tests replace so no
 *  suite ever pushes a branch. `runBatch` is one CI round trip for as many components as are handed to it. */
export type RemoteGate = {
  preflight(): void;
  runBatch(targets: { name: string; files: string[] }[]): Promise<GateBatch[]>;
  fold(run: swiftui.RemoteRun): string[];
  discard(run: swiftui.RemoteRun): void;
};

export function remoteGate(platform: string): RemoteGate {
  if (platform === 'swiftui') return swiftui;
  throw new ExitError(`no remote gate for platform ${platform}`);
}

/** The seams the tests replace, the way the Python tests monkeypatched the module globals. */
export const hooks = {
  runGates,
  sleep,
  taskPrompt,
  fixPrompt,
  failuresAsPrompt,
  customSnapshot,
  restoreCustom,
  remoteGate,
  namingFor,
  renameTree,
  CliRunner: (model: string, maxTurns: number): Runner => new CliRunner(model, maxTurns),
  ApiRunner: (model: string, platform: string): Runner => new ApiRunner(model, platform),
};

// ---------------------------------------------------------------- command line

export type Args = {
  platform: string;
  component: string | null;
  pattern: string | null;
  stale: boolean;
  check: boolean;
  adopt: boolean;
  force: boolean;
  runner: string;
  model: string;
  maxRounds: number;
  maxTurns: number;
  skip: string[];
  extra: string[];
  dryRun: boolean;
  /** A brand under themes/, or a path to a naming doc; null is Design Schema's own vocabulary. */
  naming: string | null;
};

const USAGE = `usage: generate.ts [-h] [--platform PLATFORM] [--component COMPONENT]
                   [--pattern PATTERN] [--stale] [--check] [--adopt] [--force]
                   [--naming NAMING] [--runner {cli,api}] [--model MODEL]
                   [--max-rounds MAX_ROUNDS] [--max-turns MAX_TURNS]
                   [--skip SKIP] [--with EXTRA] [--dry-run]`;

// argparse's help: the module docstring verbatim (RawDescriptionHelpFormatter) and one line per option.
const HELP = `${USAGE}

generate.ts — turn a component doc into platform code, with the model in one place and
deterministic gates everywhere else.

    node tools/generate.ts --platform web --component Icon              # one component, one platform
    node tools/generate.ts --platform web,lit,rn --component Icon       # three platforms, sequentially
    node tools/generate.ts --platform swiftui --component Button,Icon   # one branch each, one CI round trip
    node tools/generate.ts --stale                                      # everything whose prompt changed
    node tools/generate.ts --check                                      # list stale entries, generate nothing
    node tools/generate.ts ... --runner api                             # Messages API instead of Claude Code
    node tools/generate.ts ... --skip typecheck                         # when node_modules is not available

How it works
  1. The prompt is generated/prompts/<Name>.<platform>.md (tools/parse.ts builds it from the doc).
     Its sha256 is the identity of the spec. generated/generate.lock.<platform>.json remembers the hash
     that produced the committed code, so generation only runs when the doc changed.
  2. Round 1: the model gets the prompt plus a short task wrapper (read these files for
     conventions, write these files, report gaps as JSON). Runner \`cli\` drives Claude Code
     headless (\`claude -p\`, tools enabled, cwd = repo); runner \`api\` calls the Messages API and
     expects files back in a fenced format, which this script writes.
  3. Gates (tools/checks.ts): parse, contrast, literals, typecheck. Failures are handed back to
     the model verbatim as a fix round, up to --max-rounds. The model never sees the gate code.
     \`swiftui\` compiles only on macOS, so its build/test/audit gates run in GitHub Actions
     (tools/swiftui_gate.ts) and a phase is generated as one batch: one CI round trip per round.
  4. Gaps the model reported land in generated/gaps/<Name>.<platform>.md for the doc pass.
     The lockfile records hash, files, rounds, gate results and cost.

Generation is a code-mod, not a compile step: run it, review the diff, commit. The deploy
build never calls a model; it runs the same gates on committed code.

options:
  -h, --help            show this help message and exit
  --platform PLATFORM   comma-separated: web,lit,rn,swiftui
  --component COMPONENT
                        comma-separated component names (as in the doc
                        frontmatter)
  --pattern PATTERN     comma-separated pattern names (the doc title without
                        spaces, e.g. SettingsPage); targets
                        Pattern.<Name>.<platform>
  --stale               generate every target whose prompt hash changed
  --check               list stale targets and exit 1 if any
  --adopt               record current prompt hashes for targets whose code
                        already exists (hand-written or generated elsewhere),
                        without calling a model
  --force               regenerate even when the hash matches
  --naming NAMING       brand under themes/ (or a path to a naming doc) whose
                        naming.md renames the written output; env DS_NAMING
  --runner {cli,api}
  --model MODEL         alias (fable, opus, sonnet) or full model id; env
                        DS_MODEL
  --max-rounds MAX_ROUNDS
                        model rounds per target (1 generate + fixes)
  --max-turns MAX_TURNS
                        agent turns per round (cli runner)
  --skip SKIP           gate to skip, e.g. --skip typecheck (repeatable)
  --with EXTRA          browser gate to add after the fast ones: keyboard, axe
                        (needs \`pnpm exec playwright install chromium\`)
  --dry-run             print the task prompt head, call nothing
`;

/** argparse's exits: 0 for --help, 2 for a usage error. */
class ArgvExit extends Error {
  exitCode: number;
  constructor(exitCode: number) {
    super('argv');
    this.name = 'ArgvExit';
    this.exitCode = exitCode;
  }
}

export function argError(message: string, prog: string = 'generate.ts'): never {
  process.stderr.write(`${USAGE}\n${prog}: error: ${message}\n`);
  throw new ArgvExit(2);
}

export function parseArgs(argv: string[], prog: string = 'generate.ts'): Args {
  const args: Args = {
    platform: 'web,lit,rn', component: null, pattern: null, stale: false, check: false, adopt: false, force: false,
    runner: 'cli', model: DEFAULT_MODEL, maxRounds: 3, maxTurns: 80, skip: [], extra: [], dryRun: false,
    naming: DEFAULT_NAMING,
  };
  const i = { n: 0 };
  const unrecognized: string[] = [];
  const value = (arg: string, flag: string): string => {
    const v = arg.startsWith(`${flag}=`) ? arg.slice(flag.length + 1) : argv[++i.n];
    if (v === undefined) argError(`argument ${flag}: expected one argument`, prog);
    return v as string;
  };
  const int = (flag: string, v: string): number => {
    // argparse's `type=int`: `int(v)`, which takes surrounding whitespace and a sign but nothing else.
    if (!/^[+-]?\d+$/.test(pyStrip(v))) argError(`argument ${flag}: invalid int value: '${v}'`, prog);
    return Number(pyStrip(v));
  };
  const matches = (arg: string, flag: string): boolean => arg === flag || arg.startsWith(`${flag}=`);
  for (; i.n < argv.length; i.n++) {
    const arg = argv[i.n] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(HELP);
      throw new ArgvExit(0);
    } else if (matches(arg, '--platform')) {
      args.platform = value(arg, '--platform');
    } else if (matches(arg, '--component')) {
      args.component = value(arg, '--component');
    } else if (matches(arg, '--pattern')) {
      args.pattern = value(arg, '--pattern');
    } else if (arg === '--stale') {
      args.stale = true;
    } else if (arg === '--check') {
      args.check = true;
    } else if (arg === '--adopt') {
      args.adopt = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (matches(arg, '--runner')) {
      const v = value(arg, '--runner');
      if (v !== 'cli' && v !== 'api') argError(`argument --runner: invalid choice: '${v}' (choose from cli, api)`, prog);
      args.runner = v;
    } else if (matches(arg, '--naming')) {
      args.naming = value(arg, '--naming');
    } else if (matches(arg, '--model')) {
      args.model = value(arg, '--model');
    } else if (matches(arg, '--max-rounds')) {
      args.maxRounds = int('--max-rounds', value(arg, '--max-rounds'));
    } else if (matches(arg, '--max-turns')) {
      args.maxTurns = int('--max-turns', value(arg, '--max-turns'));
    } else if (matches(arg, '--skip')) {
      args.skip.push(value(arg, '--skip'));
    } else if (matches(arg, '--with')) {
      args.extra.push(value(arg, '--with'));
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    } else {
      unrecognized.push(arg); // argparse collects these and reports them after the rest of the line parsed
    }
  }
  if (unrecognized.length > 0) argError(`unrecognized arguments: ${unrecognized.join(' ')}`, prog);
  return args;
}

/** argparse's exits and `sys.exit(message)` become the process exit code, wherever they were raised. */
export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  try {
    return await run(argv);
  } catch (e) {
    if (e instanceof ArgvExit) return e.exitCode;
    if (e instanceof ExitError) {
      process.stderr.write(e.message + '\n');
      return e.code;
    }
    throw e;
  }
}

async function run(argv: string[]): Promise<number> {
  const args = parseArgs(argv);
  const lock = loadLock();
  if (args.check) {
    const stale = staleTargets(lock);
    for (const [n, p] of stale) print(`stale  ${n}.${p}`);
    print(`${stale.length} stale of ${allTargets().length} targets`);
    return stale.length > 0 ? 1 : 0;
  }

  if (args.adopt) {
    let nAdopted = 0;
    const brand = hooks.namingFor(args);
    for (const [n, p] of allTargets()) {
      const pattern = n.startsWith('Pattern.');
      const folder = pattern ? demoDir(paths.ROOT, p) : srcDir(p);
      const canonical = pattern ? n.slice(n.indexOf('.') + 1) : n;
      // a fork's file is on disk under its brand name, which is what `--adopt` has to find
      const stem = naming.isNoop(brand) ? canonical : naming.renameFileName(canonical, naming.vocab(brand, p, 'brand'));
      if (folder === null || !anyFileNamed(folder, stem)) continue;
      const h = sha(readText(promptPath(n, p)));
      const entry = (lock[`${n}.${p}`] ??= {});
      entry['hash'] = h;
      entry['adoptedAt'] = utcNow();
      entry['runner'] = 'adopted';
      nAdopted += 1;
    }
    for (const platform of PLATFORMS) saveLock(lock, platform);
    // `Path.relative_to` spells "the same folder" as `.`, which `path.relative` spells as the empty string.
    print(`✔ adopted ${nAdopted} target(s) → ${relative(paths.ROOT, paths.LOCK_DIR) || '.'}/generate.lock.<platform>.json`);
    return 0;
  }

  const platforms = args.platform.split(',').map(pyStrip).filter((p) => p !== '');
  for (const p of platforms) {
    if (!isPlatform(p)) throw new ExitError(`unknown platform ${p}`);
  }
  let targets: Target[];
  if (args.stale) {
    targets = staleTargets(lock).filter(([, p]) => platforms.includes(p));
  } else if (truthy(args.component) || truthy(args.pattern)) {
    targets = [];
    const unsupported = unsupportedTargets();
    for (const raw of (args.component ?? '').split(',')) {
      const n = pyStrip(raw);
      if (!n) continue;
      for (const p of platforms) {
        if (unsupported.has(`${n}.${p}`)) print(`skip   ${n}.${p}: platforms.${p}.supported is false`);
        else targets.push([n, p]);
      }
    }
    for (const raw of (args.pattern ?? '').split(',')) {
      const n = pyStrip(raw);
      if (n) for (const p of platforms) targets.push([`Pattern.${n}`, p]);
    }
  } else {
    argError('give --component NAME[,NAME], --pattern NAME[,NAME], --stale or --check');
  }
  if (targets.length === 0) {
    print('nothing to do');
    return 0;
  }
  print(`targets: ${targets.map(([n, p]) => `${n}.${p}`).join(', ')}`);
  const brand = hooks.namingFor(args); // resolved once for the whole run, before any target starts
  let ok = true;
  // Platforms whose gates are local run target by target, as they always have. A remote-gate platform's
  // targets are collected and generated as one batch at the end, so the phase waits on CI once.
  const batched = new Map<string, string[]>();
  for (const [n, p] of targets) {
    if (REMOTE_GATE.has(p)) {
      const names = batched.get(p) ?? [];
      names.push(n);
      batched.set(p, names);
      continue;
    }
    const passed = await generateOne(n, p, args, lock, brand);
    ok = ok && passed;
  }
  for (const [p, names] of batched) {
    const passed = await generateBatch(names, p, args, lock, brand);
    ok = ok && passed;
  }
  return ok ? 0 : 1;
}

/** `any(folder.glob(f"{stem}.*"))`: a file (or folder) whose name starts `<stem>.`, case-insensitively on Windows. */
function anyFileNamed(folder: string, stem: string): boolean {
  let names: string[];
  try {
    names = readdirSync(folder);
  } catch {
    return false;
  }
  const head = stem + '.';
  const key = (s: string): string => (process.platform === 'win32' ? s.toLowerCase() : s);
  return names.some((n) => key(n).startsWith(key(head)));
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  process.exitCode = await main();
}
