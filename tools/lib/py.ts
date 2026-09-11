/**
 * Python semantics the ported tools depend on for byte-identical output: text-mode file I/O (universal
 * newlines in, the platform line separator out), `str.splitlines()`, `str.strip()`, `repr()`/`str()` of
 * values that end up in error messages, and `sorted()` of paths.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { pyFloatRepr } from './pyyaml.ts';

const LINESEP = process.platform === 'win32' ? '\r\n' : '\n';

/** `Path.read_text(encoding="utf-8")`: UTF-8, `\r\n` and lone `\r` become `\n`, a BOM stays. */
export function readText(file: string): string {
  return readFileSync(file, 'utf8').replace(/\r\n?/g, '\n');
}

/** `Path.write_text(text, encoding="utf-8")`: `\n` becomes the platform line separator (`\r\n` on Windows). */
export function writeText(file: string, text: string): void {
  writeFileSync(file, LINESEP === '\n' ? text : text.replace(/\n/g, LINESEP), 'utf8');
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

/** `str.ljust(width)`. */
export function ljust(s: string, width: number): string {
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

/** Python truthiness: `None`, `False`, `0`, `''`, `[]`, `{}` are false. */
export function truthy(v: unknown): boolean {
  if (v === null || v === undefined || v === false || v === 0 || v === '') return false;
  if (Number.isNaN(v)) return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

/** `dict.get(key, default)`: the stored value (even `None`) when the key exists, else the default. */
export function pyGet<T>(obj: Record<string, unknown> | null | undefined, key: string, dflt: T): unknown | T {
  return obj && Object.hasOwn(obj, key) ? obj[key] : dflt;
}

/** `key in dict`. */
export function has(obj: unknown, key: string): boolean {
  return typeof obj === 'object' && obj !== null && Object.hasOwn(obj, key);
}

function reprString(s: string): string {
  const quote = s.includes("'") && !s.includes('"') ? '"' : "'";
  let out = quote;
  for (const ch of s) {
    const cp = ch.codePointAt(0) as number;
    if (ch === quote || ch === '\\') out += '\\' + ch;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\r') out += '\\r';
    else if (ch === '\t') out += '\\t';
    else if (cp < 0x20 || cp === 0x7f) out += '\\x' + cp.toString(16).padStart(2, '0');
    else out += ch;
  }
  return out + quote;
}

/** `repr(value)` for the JSON-like values that reach an error message. */
export function pyRepr(v: unknown): string {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'number') return Number.isInteger(v) && !Object.is(v, -0) ? String(v) : pyFloatRepr(v);
  if (typeof v === 'string') return reprString(v);
  if (Array.isArray(v)) return '[' + v.map(pyRepr).join(', ') + ']';
  if (typeof v === 'object') return '{' + Object.entries(v as Record<string, unknown>).map(([k, x]) => `${reprString(k)}: ${pyRepr(x)}`).join(', ') + '}';
  return String(v);
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

/** `itertools.product(*lists)`: the rightmost list varies fastest. */
export function product<T>(lists: T[][]): T[][] {
  let out: T[][] = [[]];
  for (const list of lists) {
    const next: T[][] = [];
    for (const prefix of out) for (const item of list) next.push([...prefix, item]);
    out = next;
  }
  return out;
}
