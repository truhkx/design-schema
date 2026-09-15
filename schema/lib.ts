/**
 * The helpers the schema's own checks need, kept here so schema/ imports nothing but `zod` and `node:` modules
 * and can be published on its own (`pnpm schema:publish`). tools/lib/py.ts, tools/lib/pyyaml.ts and
 * tools/check_contrast.ts re-export these, so every tool still reads one implementation.
 *
 * Python semantics, because the ported tools' error messages and prompts must stay byte-identical: `repr()` of
 * the values a schema issue quotes, `float.__repr__`, truthiness, `dict.get` and `itertools.product`.
 *
 * Runs under Node's type stripping: annotations only.
 */

export type Dict = Record<string, unknown>;

/** Python truthiness: None, False, 0, '' and empty containers are falsy. */
export function truthy(v: unknown): boolean {
  if (v === null || v === undefined || v === false || v === 0 || v === '') return false;
  if (Number.isNaN(v)) return true;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v as object).length > 0;
  return true;
}

/** `dict.get(key, default)`: only own keys count. */
export function pyGet<T>(obj: Record<string, unknown> | null | undefined, key: string, dflt: T): unknown | T {
  return obj && Object.hasOwn(obj, key) ? obj[key] : dflt;
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

/** `float.__repr__`: the shortest round-trip digits, positional between 1e-4 and 1e16, `1e+16` style outside. */
export function pyFloatRepr(n: number): string {
  if (Number.isNaN(n)) return 'nan';
  if (n === Infinity) return 'inf';
  if (n === -Infinity) return '-inf';
  if (n === 0) return Object.is(n, -0) ? '-0.0' : '0.0';
  const [mant = '', expStr = '0'] = n.toExponential().split('e');
  const exp = Number(expStr);
  const neg = mant.startsWith('-');
  const digits = mant.replace('-', '').replace('.', '');
  let out: string;
  if (exp >= -4 && exp < 16) {
    if (exp >= 0) {
      const intPart = digits.slice(0, exp + 1).padEnd(exp + 1, '0');
      const frac = digits.slice(exp + 1);
      out = `${intPart}.${frac || '0'}`;
    } else {
      out = `0.${'0'.repeat(-exp - 1)}${digits}`;
    }
  } else {
    const frac = digits.slice(1);
    const e = `${exp < 0 ? '-' : '+'}${String(Math.abs(exp)).padStart(2, '0')}`;
    out = `${digits[0]}${frac ? '.' + frac : ''}e${e}`;
  }
  return neg ? `-${out}` : out;
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

/** `repr(value)` for the JSON-shaped values a doc can hold. */
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

/** color.action.{variant}.background → one path per enum value of `variant`. */
export function expand(tokenRef: string, props: Dict): string[] {
  const slots = [...tokenRef.matchAll(/\{([a-zA-Z]+)\}/g)].map((m) => m[1] as string);
  if (slots.length === 0) return [tokenRef];
  const choices: string[][] = [];
  for (const s of slots) {
    const p = pyGet(props, s, null) as Dict | null;
    if (!truthy(p) || pyGet(p as Dict, 'type', null) !== 'enum') throw new Error(`${tokenRef}: '{${s}}' must name an enum prop`);
    choices.push((p as Dict).values as string[]);
  }
  const out: string[] = [];
  for (const combo of product(choices)) {
    let ref = tokenRef;
    slots.forEach((s, i) => {
      ref = ref.replaceAll(`{${s}}`, combo[i] as string);
    });
    out.push(ref.endsWith('.default') ? ref.slice(0, -'.default'.length) : ref); // public names drop a trailing .default
  }
  return out;
}
