/**
 * Python semantics the ported tools depend on for byte-identical output: text-mode file I/O (universal
 * newlines in, the platform line separator out), `str.splitlines()`, `str.strip()`, `repr()`/`str()` of
 * values that end up in error messages, and `sorted()` of paths.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { product, pyGet, pyRepr, truthy } from '../../schema/lib.ts';
import { pyFloatRepr } from './pyyaml.ts';

// Truthiness, `dict.get`, `repr()` and `itertools.product` live in schema/lib.ts, which the schema's own checks
// import; re-exported so the tools keep one implementation.
export { product, pyGet, pyRepr, truthy };

const LINESEP = process.platform === 'win32' ? '\r\n' : '\n';

/** `Path.read_text(encoding="utf-8")`: UTF-8, `\r\n` and lone `\r` become `\n`, a BOM stays. */
export function readText(file: string): string {
  return readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
}

/** `Path.write_text(text, encoding="utf-8")`: `\n` becomes the platform line separator (`\r\n` on Windows). */
export function writeText(file: string, text: string): void {
  writeFileSync(file, LINESEP === '\n' ? text : text.replace(/\n/g, LINESEP), 'utf8');
}

/** `open(file, "a", encoding="utf-8").write(text)`: the same line-separator translation, appended. */
export function appendText(file: string, text: string): void {
  appendFileSync(file, LINESEP === '\n' ? text : text.replace(/\n/g, LINESEP), 'utf8');
}

/** Write via `<file>.tmp` + rename (`os.replace`), creating parent folders. */
export function writeTextAtomic(file: string, text: string): void {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  writeText(tmp, text);
  renameSync(tmp, file);
}

// `str.splitlines()` boundaries and `str.isspace()` characters.
const LINE_BREAK = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/;
const SPACE = '[ \\t\\n\\r\\v\\f\\x1c-\\x1f\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000]';
const STRIP = new RegExp(`^${SPACE}+|${SPACE}+$`, 'g');
const LSTRIP = new RegExp(`^${SPACE}+`);
const RSTRIP = new RegExp(`${SPACE}+$`);
const SPLIT = new RegExp(`${SPACE}+`);

/** `str.splitlines()`: every Unicode line boundary splits; no trailing empty element. */
export function pySplitlines(s: string): string[] {
  if (!s) return [];
  const parts = s.split(LINE_BREAK);
  if (parts[parts.length - 1] === '') parts.pop();
  return parts;
}

export function pyStrip(s: string): string {
  return s.replace(STRIP, '');
}

export function pyLstrip(s: string): string {
  return s.replace(LSTRIP, '');
}

export function pyRstrip(s: string): string {
  return s.replace(RSTRIP, '');
}

/** `str.split()` with no separator: runs of whitespace, no empty items. */
export function pySplit(s: string): string[] {
  return pyStrip(s).split(SPLIT).filter((w) => w !== '');
}

/**
 * `f"{x:.{digits}f}"`: correctly rounded, ties to even on the exact binary value (`toFixed` rounds ties up).
 * Exact for the magnitudes that reach a report (|x| ≥ 2⁻⁸); `nan`/`inf` spell as Python spells them.
 */
export function pyFixed(x: number, digits: number): string {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : '-inf';
  const neg = x < 0 || Object.is(x, -0);
  const exact = Math.abs(x).toFixed(Math.min(100, digits + 60)); // the exact decimal expansion of the double
  const dot = exact.indexOf('.');
  let kept = exact.slice(0, dot + 1 + digits);
  const rest = exact.slice(dot + 1 + digits);
  const tie = /^50*$/.test(rest);
  const lastDigit = Number(kept[kept.length - 1]);
  const up = rest.length > 0 && (tie ? lastDigit % 2 === 1 : rest > '5');
  if (up) {
    const chars = [...kept];
    let i = chars.length - 1;
    while (i >= 0) {
      if (chars[i] === '.') { i--; continue; }
      if (chars[i] === '9') { chars[i] = '0'; i--; continue; }
      chars[i] = String(Number(chars[i]) + 1);
      break;
    }
    kept = (i < 0 ? '1' : '') + chars.join('');
  }
  if (digits === 0) kept = kept.replace(/\.$/, '');
  return (neg ? '-' : '') + kept;
}

/** Python's `round(x)`: half to even, returning an integer. */
export function pyRound(x: number): number {
  const f = Math.floor(x);
  const diff = x - f;
  if (diff > 0.5) return f + 1;
  if (diff < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

/**
 * Python's `round(x, digits)`: the double nearest the correctly-rounded (ties to even) decimal.
 * `pyFixed` produces that decimal exactly, so parsing it back lands on the same double CPython returns.
 */
export function pyRoundTo(x: number, digits: number): number {
  if (!Number.isFinite(x)) return x;
  return Number(pyFixed(x, digits));
}

// `re.escape()`'s table (Python 3.7+): only these are backslash-escaped, space and the ASCII
// whitespace controls among them.
const RE_SPECIAL = new Set([...'()[]{}?*+-|^$\\.&~# \t\n\r\v\f']);

/** `re.escape(pattern)`. */
export function pyReEscape(pattern: string): string {
  let out = '';
  for (const ch of pattern) out += RE_SPECIAL.has(ch) ? '\\' + ch : ch;
  return out;
}

function jsonString(s: string): string {
  let out = '"';
  for (const unit of s) {
    // `ensure_ascii=True`: everything above `~` becomes `\uXXXX`, astral planes as a surrogate pair.
    if (unit === '"' || unit === '\\') out += '\\' + unit;
    else if (unit === '\n') out += '\\n';
    else if (unit === '\r') out += '\\r';
    else if (unit === '\t') out += '\\t';
    else if (unit === '\b') out += '\\b';
    else if (unit === '\f') out += '\\f';
    else {
      const cp = unit.codePointAt(0) as number;
      if (cp < 0x20 || cp > 0x7e) for (const code of unit.split('').map((u) => u.charCodeAt(0))) out += '\\u' + code.toString(16).padStart(4, '0');
      else out += unit;
    }
  }
  return out + '"';
}

/**
 * `json.dumps(value, indent=indent)`: `ensure_ascii=True`, the `', '` / `': '` separators JSON.stringify
 * omits when compact, and `,\n` / `': '` when indented (empty containers still collapse to `{}` / `[]`).
 * A `Map` is dumped as an object, which is how the ported tools keep Python's key order for the groups
 * whose keys are numbers — JavaScript hoists `"0"`, `"1"`, … to the front of a plain object.
 */
export function pyJsonDumps(value: unknown, indent?: number): string {
  const pad = indent === undefined ? '' : ' '.repeat(indent);
  const dump = (v: unknown, level: number): string => {
    if (v === null || v === undefined) return 'null';
    if (v === true) return 'true';
    if (v === false) return 'false';
    if (typeof v === 'number') {
      if (Number.isNaN(v)) return 'NaN';
      if (!Number.isFinite(v)) return v > 0 ? 'Infinity' : '-Infinity';
      return Number.isInteger(v) ? String(v) : pyFloatRepr(v);
    }
    if (typeof v === 'string') return jsonString(v);
    const items: string[] = Array.isArray(v)
      ? v.map((x) => dump(x, level + 1))
      : [...(v instanceof Map ? v : new Map(Object.entries(v as Record<string, unknown>)))].map(
          ([k, x]) => `${jsonString(String(k))}: ${dump(x, level + 1)}`,
        );
    const [open, close] = Array.isArray(v) ? ['[', ']'] : ['{', '}'];
    if (!items.length) return open + close;
    if (indent === undefined) return open + items.join(', ') + close;
    const inner = pad.repeat(level + 1);
    return `${open}\n${inner}${items.join(`,\n${inner}`)}\n${pad.repeat(level)}${close}`;
  };
  return dump(value, 0);
}

/** `sorted(strings)`: Python compares strings by code point, `Array.sort` by UTF-16 code unit. */
export function pySorted(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const x = [...a];
    const y = [...b];
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
      const d = (x[i] as string).codePointAt(0) as number;
      const e = (y[i] as string).codePointAt(0) as number;
      if (d !== e) return d - e;
    }
    return x.length - y.length;
  });
}

/** `str.ljust(width)`. */
export function ljust(s: string, width: number): string {
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

/** `key in dict`. */
export function has(obj: unknown, key: string): boolean {
  return typeof obj === 'object' && obj !== null && Object.hasOwn(obj, key);
}

/** `str(value)`: a string as is, anything else as `repr()` would show it. */
export function pyStr(v: unknown): string {
  return typeof v === 'string' ? v : pyRepr(v);
}

/** Python's `sorted()` over paths on this platform: `PureWindowsPath` compares case-insensitively. */
export function sortedNames(names: string[]): string[] {
  const key = (s: string): string => (process.platform === 'win32' ? s.toLowerCase() : s);
  return [...names].sort((a, b) => {
    const x = key(a);
    const y = key(b);
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

