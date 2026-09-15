#!/usr/bin/env node
/**
 * Deterministic gate: generated components may not carry design literals.
 *
 * Scans packages/{react,lit,rn}/src and packages/swiftui/Sources/DesignSchema for hard-coded
 * colors, pixel sizes, durations and font stacks. Everything visual must come from a token (CSS
 * custom property, the RN token object, or the SwiftUI `Theme`). This is the rule the prompts
 * state; this script is what enforces it.
 *
 * Sanctioned literals (documented in the templates):
 *   - 0, 1em / 1lh style relative units, percentages, `currentColor`, `transparent`, `inherit`
 *   - the visually-hidden clip pattern (1px / -1px), only on a line that also says "visually"/"hidden"/"clip"
 *   - opacity values 0..1 and unitless numbers (line-height multipliers are tokens, but math on them is not)
 *   - anything on a line ending with `// literal-ok: <reason>` or `/* literal-ok: <reason> *\/`
 *
 * Usage:  node tools/lint_literals.ts [--platform web|lit|rn|swiftui] [--files a.tsx b.css ...]
 * Exit 1 on any finding.
 *
 * Port of tools/lint_literals.py: same flags, same findings, same lines on stdout, same exit codes,
 * plus the SwiftUI rule below, which the Python version never had (there was no iOS package then).
 * The character classes are spelled `\p{L}\p{N}_` rather than `\w` because Python's `\w` is
 * Unicode-aware on `str` and JavaScript's is ASCII-only. Runs under Node's type stripping.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isPlatform, PLATFORMS, sourceDir } from '../schema/platforms.ts';
import { pyLstrip, pyReEscape, pySplitlines, pyStrip, readText, sortedNames } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = { ROOT: REPO_ROOT };

const W = '\\p{L}\\p{N}_'; // Python's `\w` on str

export const RULES: [string, RegExp][] = [
  ['hex color', new RegExp(`(?<![${W}&])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b`, 'gu')],
  ['rgb/hsl/oklch color', /\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/gu],
  ['pixel literal', new RegExp(`(?<![${W}.-])-?\\d+(?:\\.\\d+)?px\\b`, 'gu')],
  ['duration literal', new RegExp(`(?<![${W}.-])\\d+(?:\\.\\d+)?m?s\\b`, 'gu')],
  // A quoted value that names a custom property (`'--ds-text-font-family'`, the override-hook lookup tables) or
  // a var() call is a token reference, not a font stack.
  ['font stack literal', /font-family\s*:(?!\s*(?:var\(|inherit))[^;]+;|fontFamily\s*:\s*['"](?!--|var\()/gu],
  ['named color', new RegExp(`(?<![${W}-])(?:white|black|red|blue|green|gray|grey|silver|orange|yellow)(?![${W}-])`, 'gu')],
];
// Numbers that look like sizes in RN style objects: `width: 20,` `padding: 8` — but not 0/1/-1, indices, or opacity.
const RN_NUMBER = /\b(?:width|height|min(?:Width|Height)|max(?:Width|Height)|padding\w*|margin\w*|gap|borderRadius|borderWidth|fontSize|lineHeight|top|left|right|bottom|size)\s*:\s*(-?\d+(?:\.\d+)?)\b/gu;
export const ALLOWED_NUMBERS: Set<string> = new Set(['0', '1', '-1', '2', '-2']); // 1/2 for hairlines and half-offsets in math; everything else is a token
const OK_MARK = /literal-ok:/u;

const HIDDEN_CONTEXT = /visually|hidden|clip/iu;
const COLOR_MIX_OK = /color-mix\([^;]*?var\(--/su; // mixing tokens (with transparent) is fine

/** `[line number, rule name, the matched text]`, in the order Python's nested loops found them. */
export type Finding = [number, string, string];

export function scanFile(path: string): Finding[] {
  // Swift has its own rule and none of the CSS ones: `Color(red:green:blue:)` is argument labels,
  // not three named colors.
  if (extname(path) === '.swift') return scanSwift(readText(path));
  const findings: Finding[] = [];
  const isRn = path.replaceAll(sep, '/').includes('packages/rn/');
  const name = basename(path);
  let inComment = false;
  const lines = pySplitlines(readText(path));
  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    const line = lines[i] as string;
    const stripped = pyStrip(line);
    const context = lines.slice(Math.max(0, n - 8), n + 3).join('\n'); // the surrounding rule, for the clip-pattern and color-mix exemptions
    if (stripped.startsWith('/*')) {
      inComment = !stripped.includes('*/');
      continue;
    }
    if (inComment) {
      inComment = !stripped.includes('*/');
      continue;
    }
    if (stripped.startsWith('//') || stripped.startsWith('*') || OK_MARK.test(line)) continue;
    const code = pyLstrip(line).startsWith('http') ? line : (line.split('//')[0] as string);
    for (const [ruleName, rx] of RULES) {
      for (const m of code.matchAll(rx)) {
        const tok = m[0];
        if (ruleName === 'pixel literal' && tok.replace(/^-+/, '') === '1px' && HIDDEN_CONTEXT.test(context)) continue;
        if (ruleName === 'pixel literal' && tok === '0px') continue;
        if (ruleName === 'rgb/hsl/oklch color' && tok.startsWith('color-mix') && COLOR_MIX_OK.test(context)) continue;
        if (ruleName === 'named color' && new RegExp(`['"\`][^'"\`]*\\b${pyReEscape(tok)}\\b[^'"\`]*['"\`]`, 'u').test(code) && !code.toLowerCase().includes('color')) {
          continue; // a word in a label string, not a color
        }
        if (ruleName === 'duration literal' && /\d+(?:ms|s)\b/u.test(tok) && (code.includes('import') || name.includes('story'))) continue;
        findings.push([n, ruleName, tok]);
      }
    }
    if (isRn && !name.includes('.stories.')) {
      for (const m of code.matchAll(RN_NUMBER)) {
        if (!ALLOWED_NUMBERS.has(m[1] as string)) findings.push([n, 'RN size literal', m[0]]);
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------- SwiftUI

/**
 * The modifiers whose arguments are dimensions, colors, durations or depths — in a generated
 * component every one of them must read a `theme.*` token (`.padding(theme.spaceMd)`), never a
 * number. `.font(` on its own is fine (`.font(theme.fontBody)`); only the `.system(size:)` escape
 * hatch carries a size, so that is what is listed.
 */
export const SWIFT_CALLS: string[] = [
  '.padding(',
  '.frame(',
  '.cornerRadius(',
  '.lineSpacing(',
  '.font(.system(size:',
  'Color(',
  '.opacity(',
  '.animation(',
  '.zIndex(',
];
// A number literal, matched where the walker stands. `_` is Swift's digit separator, so `1_000` is
// one number rather than an allowed `1`, and a radix literal (`0xFF3B30`) is one number rather than
// an allowed `0` followed by an identifier.
const SWIFT_NUMBER = /-?(?:0[xXoObB][0-9a-fA-F_]+|\d[\d_]*(?:\.\d[\d_]*)?)/y;
const IDENT_CHAR = new RegExp(`[${W}]`, 'u');
/** `0`, `1`, `2` (and their negatives) as on the other platforms, plus a fraction: an opacity or a scale factor. */
const SWIFT_FRACTION = /^-?0\.\d+$/u;

/** The call opening at `i`, if one does. `MyColor(` is not `Color(`; a `.`-prefixed call can never start mid-identifier. */
function swiftCallAt(line: string, i: number): string | undefined {
  if (i > 0 && IDENT_CHAR.test(line[i - 1] as string)) return undefined;
  return SWIFT_CALLS.find((call) => line.startsWith(call, i));
}

/** One past the closing quote of the string literal starting at `i`, or the end of the line if it is unterminated. */
function skipSwiftString(line: string, i: number): number {
  for (let j = i + 1; j < line.length; j++) {
    const c = line[j] as string;
    if (c === '\\') j += 1; // an escape, `\(interpolation)` included — its contents are not design literals
    else if (c === '"') return j + 1;
  }
  return line.length;
}

/**
 * The SwiftUI rule: a bare number anywhere inside one of the SWIFT_CALLS argument lists, unless the
 * line carries `// literal-ok: <reason>`.
 *
 * Walks the file once, keeping one stack entry per open paren, so a call spread over several lines —
 * the usual SwiftUI formatting — is covered as well as a one-liner:
 *
 *     .frame(          // pushes `.frame(`
 *         width: 44,   // reported: inside `.frame(`
 *     )                // pops
 *
 * A number is attributed to the innermost call enclosing it, so in
 * `.frame(width: box(Color(.red), 0.9), height: 44)` the `44` reads as a `.frame(` finding and the
 * `Color(` arguments as `Color(` ones. Comments and string literals are skipped whole — parens in
 * prose never reach the stack — and a `literal-ok` line is still walked, only silenced, so a waived
 * line in the middle of a multi-line call cannot desynchronise it. A block comment ends at the first
 * `*\/` (Swift nests them; generated components do not).
 */
export function scanSwift(text: string): Finding[] {
  const findings: Finding[] = [];
  const stack: (string | null)[] = []; // per open paren: the call it opened, or null for every other paren
  let inBlock = false;
  const lines = pySplitlines(text);
  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    const line = lines[i] as string;
    const marked = OK_MARK.test(line); // the mark waives its own line, not the whole call
    let j = 0;
    while (j < line.length) {
      const rest = line.slice(j);
      if (inBlock) {
        const end = rest.indexOf('*/');
        if (end === -1) break;
        inBlock = false;
        j += end + 2;
        continue;
      }
      const c = line[j] as string;
      const call = swiftCallAt(line, j);
      if (c === '"') {
        j = skipSwiftString(line, j);
      } else if (rest.startsWith('//')) {
        break;
      } else if (rest.startsWith('/*')) {
        inBlock = true;
        j += 2;
      } else if (call !== undefined) {
        for (const ch of call) if (ch === '(') stack.push(call); // `.font(.system(size:` opens two, both its own
        j += call.length;
      } else if (c === '(') {
        stack.push(null);
        j += 1;
      } else if (c === ')') {
        stack.pop();
        j += 1;
      } else if (isNumberStart(line, j)) {
        SWIFT_NUMBER.lastIndex = j;
        const tok = (SWIFT_NUMBER.exec(line) as RegExpExecArray)[0];
        const inside = stack.findLast((k) => k !== null) ?? null;
        if (inside !== null && !marked && !ALLOWED_NUMBERS.has(tok) && !SWIFT_FRACTION.test(tok)) {
          findings.push([n, `SwiftUI literal in ${inside}`, tok]);
        }
        j += tok.length;
      } else {
        j += 1;
      }
    }
  }
  return findings;
}

/** A number literal begins at `i` — not the tail of an identifier (`space2`) or of a member (`.h1`). */
function isNumberStart(line: string, i: number): boolean {
  const c = line[i] as string;
  if (!/\d/u.test(c) && !(c === '-' && /\d/u.test(line[i + 1] ?? ''))) return false;
  const prev = line[i - 1];
  return prev === undefined || !(IDENT_CHAR.test(prev) || prev === '.');
}

export type Args = { platform: string | null; files: string[] | null };

/** argparse's `--platform {web,lit,rn,swiftui}` and `--files [F ...]`, including its exit code 2 on a bad flag. */
export function parseArgs(argv: string[], prog: string = 'lint_literals.ts'): Args {
  const usage = `usage: ${prog} [-h] [--platform {${PLATFORMS.join(',')}}] [--files [FILES ...]]`;
  // The annotation is on the binding, not just the arrow: that is what lets TypeScript treat a `die(...)`
  // call as terminating the branch.
  const die: (message: string) => never = (message) => {
    process.stderr.write(`${usage}\n${prog}: error: ${message}\n`);
    throw Object.assign(new Error(message), { exitCode: 2 });
  };
  const args: Args = { platform: null, files: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(`${usage}\n`);
      throw Object.assign(new Error('help'), { exitCode: 0 });
    } else if (arg === '--platform' || arg.startsWith('--platform=')) {
      const value = arg.startsWith('--platform=') ? arg.slice('--platform='.length) : argv[++i];
      if (value === undefined) die('argument --platform: expected one argument');
      if (!isPlatform(value)) die(`argument --platform: invalid choice: '${value}' (choose from ${PLATFORMS.join(', ')})`);
      args.platform = value;
    } else if (arg === '--files') {
      args.files = [];
      while (i + 1 < argv.length && !(argv[i + 1] as string).startsWith('--')) args.files.push(argv[++i] as string);
    } else {
      die(`unrecognized arguments: ${arg}`);
    }
  }
  return args;
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let a: Args;
  try {
    a = parseArgs(argv);
  } catch (e) {
    return (e as { exitCode?: number }).exitCode ?? 2;
  }
  const ROOT = paths.ROOT;
  let files: string[] = [];
  if (a.files !== null && a.files.length > 0) {
    files = a.files.map((f) => (isAbsolute(f) ? normalize(f) : join(ROOT, f)));
  } else {
    for (const plat of PLATFORMS) {
      if (a.platform !== null && plat !== a.platform) continue;
      files = files.concat(listSources(sourceDir(ROOT, plat), plat === 'swiftui'));
    }
  }
  let total = 0;
  for (const f of files) {
    if (!(existsSync(f) && statSync(f).isFile())) continue;
    if (!['.ts', '.tsx', '.css', '.swift'].includes(extname(f)) || basename(f).endsWith('.d.ts')) continue;
    for (const [n, name, tok] of scanFile(f)) {
      const rel = isRelativeTo(f, ROOT) ? relative(ROOT, f) : f;
      process.stdout.write(`✖ ${rel}:${n}: ${name} \`${tok}\` — use a token (or mark \`literal-ok: <reason>\`)\n`);
      total += 1;
    }
  }
  process.stdout.write(`${total ? '✖' : '✔'} lint_literals: ${total} finding(s) in ${files.length} file(s)\n`);
  return total ? 1 : 0;
}

/** A source directory's files, sorted; `deep` also descends into subdirectories (SwiftUI keeps `Support/` under its own). */
function listSources(dir: string, deep: boolean): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const name of sortedNames(readdirSync(dir))) {
    const path = join(dir, name);
    if (deep && statSync(path).isDirectory()) files.push(...listSources(path, deep));
    else files.push(path);
  }
  return files;
}

/** `Path.is_relative_to(other)` — case-insensitive on Windows, as `PureWindowsPath` is. */
function isRelativeTo(path: string, other: string): boolean {
  const rel = relative(other, path);
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
