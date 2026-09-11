/**
 * PyYAML-compatible YAML for the TypeScript tools.
 *
 * `dump()` is a port of PyYAML's SafeDumper (`yaml.safe_dump(data, sort_keys=False, allow_unicode=…)`): the same
 * scalar analysis, the same plain/single/double-quoted choice, the same 80-column folding, indentless sequences
 * under mapping keys, `&id001`/`*id001` anchors for a list or object that appears twice. The generated prompts
 * embed this YAML, and the generation lock hashes the prompts, so the bytes must not move when the Python tool
 * is retired.
 *
 * `load()` parses with the `yaml` package but resolves plain scalars with PyYAML's YAML 1.1 rules (`yes`/`no`/`on`/
 * `off` are booleans, `1_000` and `0o17`-style octals are integers, `1e3` is a string) so a doc reads the same as
 * it did under `yaml.safe_load`.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { parse as yamlParse, type ScalarTag } from 'yaml';

// ---------------------------------------------------------------- PyYAML implicit resolvers (resolver.py)
// The dumper quotes a string that a reader would take for something else; the loader turns the same forms
// into values. `$` in Python also matches before a trailing newline, hence `matches()`.
const BOOL = /^(?:yes|Yes|YES|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF)$/;
const FLOAT = /^(?:[-+]?(?:[0-9][0-9_]*)\.[0-9_]*(?:[eE][-+][0-9]+)?|\.[0-9][0-9_]*(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/;
const INT = /^(?:[-+]?0b[0-1_]+|[-+]?0[0-7_]+|[-+]?(?:0|[1-9][0-9_]*)|[-+]?0x[0-9a-fA-F_]+|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+)$/;
const NULL = /^(?:~|null|Null|NULL|)$/;
const MERGE = /^(?:<<)$/;
const TIMESTAMP = /^(?:[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]|[0-9][0-9][0-9][0-9]-[0-9][0-9]?-[0-9][0-9]?(?:[Tt]|[ \t]+)[0-9][0-9]?:[0-9][0-9]:[0-9][0-9](?:\.[0-9]*)?(?:[ \t]*(?:Z|[-+][0-9][0-9]?(?::[0-9][0-9])?))?)$/;
const VALUE = /^(?:=)$/;
const IMPLICIT = [BOOL, FLOAT, INT, MERGE, NULL, TIMESTAMP, VALUE];

function matches(re: RegExp, s: string): boolean {
  return re.test(s) || (s.endsWith('\n') && re.test(s.slice(0, -1)));
}

/** True when a plain (unquoted) scalar with this text would be read back as a string. */
export function plainIsString(s: string): boolean {
  return !IMPLICIT.some((re) => matches(re, s));
}

// ---------------------------------------------------------------- loader
function sexagesimal(text: string, toNumber: (s: string) => number): number {
  let sign = 1;
  if (text.startsWith('-')) { sign = -1; text = text.slice(1); } else if (text.startsWith('+')) text = text.slice(1);
  const digits = text.split(':').reverse();
  let value = 0;
  let base = 1;
  for (const d of digits) { value += toNumber(d) * base; base *= 60; }
  return sign * value;
}

function constructInt(raw: string): number {
  let value = raw.replace(/_/g, '');
  let sign = 1;
  if (value.startsWith('-')) { sign = -1; value = value.slice(1); } else if (value.startsWith('+')) value = value.slice(1);
  if (value === '0') return 0;
  if (value.startsWith('0b')) return sign * parseInt(value.slice(2), 2);
  if (value.startsWith('0x')) return sign * parseInt(value.slice(2), 16);
  if (value.startsWith('0')) return sign * parseInt(value, 8);
  if (value.includes(':')) return sign * sexagesimal(value, (s) => parseInt(s, 10));
  return sign * parseInt(value, 10);
}

function constructFloat(raw: string): number {
  let value = raw.replace(/_/g, '').toLowerCase();
  let sign = 1;
  if (value.startsWith('-')) { sign = -1; value = value.slice(1); } else if (value.startsWith('+')) value = value.slice(1);
  if (value === '.inf') return sign * Infinity;
  if (value === '.nan') return NaN;
  if (value.includes(':')) return sign * sexagesimal(value, Number);
  return sign * Number(value);
}

const nullTag: ScalarTag = { identify: (v) => v == null, tag: 'tag:yaml.org,2002:null', test: NULL, default: true, resolve: () => null };
const boolTag: ScalarTag = { identify: (v) => typeof v === 'boolean', tag: 'tag:yaml.org,2002:bool', test: BOOL, default: true, resolve: (s) => /^(?:yes|Yes|YES|true|True|TRUE|on|On|ON)$/.test(s) };
const intTag: ScalarTag = { identify: (v) => typeof v === 'number', tag: 'tag:yaml.org,2002:int', test: INT, default: true, resolve: constructInt };
const floatTag: ScalarTag = { identify: (v) => typeof v === 'number', tag: 'tag:yaml.org,2002:float', test: FLOAT, default: true, resolve: constructFloat };

/** `yaml.safe_load(text)`: null for an empty document, plain objects and arrays otherwise. Throws on bad YAML. */
export function load(text: string): unknown {
  return yamlParse(text, {
    schema: 'failsafe',
    customTags: [nullTag, boolTag, intTag, floatTag],
    merge: true,
    uniqueKeys: false,
    logLevel: 'error', // no warnings on stderr; errors still throw
    version: '1.1',
  });
}

// ---------------------------------------------------------------- representer (representer.py)
type Node = ScalarNode | CollectionNode;
type ScalarNode = { kind: 'scalar'; tag: string; value: string; implicit: [boolean, boolean] };
type CollectionNode = { kind: 'seq'; items: Node[]; anchor: string | null; obj: object } | { kind: 'map'; items: [Node, Node][]; anchor: string | null; obj: object };

/** Python's `repr(float)`: shortest round-trip digits, exponent form outside 1e-4 ≤ |x| < 1e16, always a `.` or `e`. */
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

class Representer {
  private represented = new Map<object, CollectionNode>();

  represent(data: unknown): Node {
    if (data === null || data === undefined) return scalar('tag:yaml.org,2002:null', 'null');
    if (typeof data === 'boolean') return scalar('tag:yaml.org,2002:bool', data ? 'true' : 'false');
    if (typeof data === 'number') {
      if (Number.isInteger(data) && !Object.is(data, -0)) return scalar('tag:yaml.org,2002:int', String(data));
      let value: string;
      if (Number.isNaN(data)) value = '.nan';
      else if (data === Infinity) value = '.inf';
      else if (data === -Infinity) value = '-.inf';
      else {
        value = pyFloatRepr(data).toLowerCase();
        if (!value.includes('.') && value.includes('e')) value = value.replace('e', '.0e');
      }
      return scalar('tag:yaml.org,2002:float', value);
    }
    if (typeof data === 'string') return scalar('tag:yaml.org,2002:str', data);
    if (typeof data === 'object') {
      const seen = this.represented.get(data);
      if (seen) return seen;
      if (Array.isArray(data)) {
        const node: CollectionNode = { kind: 'seq', items: [], anchor: null, obj: data };
        this.represented.set(data, node);
        for (const item of data) node.items.push(this.represent(item));
        return node;
      }
      const node: CollectionNode = { kind: 'map', items: [], anchor: null, obj: data };
      this.represented.set(data, node);
      for (const [k, v] of Object.entries(data as Record<string, unknown>)) node.items.push([this.represent(k), this.represent(v)]);
      return node;
    }
    throw new TypeError(`cannot represent an object of type ${typeof data}`);
  }
}

function scalar(tag: string, value: string): ScalarNode {
  // Serializer: implicit = (plain resolution gives this tag, non-plain resolution gives this tag).
  const plainTag = plainResolve(value);
  return { kind: 'scalar', tag, value, implicit: [plainTag === tag, tag === 'tag:yaml.org,2002:str'] };
}

function plainResolve(value: string): string {
  if (matches(BOOL, value)) return 'tag:yaml.org,2002:bool';
  if (matches(FLOAT, value)) return 'tag:yaml.org,2002:float';
  if (matches(INT, value)) return 'tag:yaml.org,2002:int';
  if (matches(MERGE, value)) return 'tag:yaml.org,2002:merge';
  if (matches(NULL, value)) return 'tag:yaml.org,2002:null';
  if (matches(TIMESTAMP, value)) return 'tag:yaml.org,2002:timestamp';
  if (matches(VALUE, value)) return 'tag:yaml.org,2002:value';
  return 'tag:yaml.org,2002:str';
}

// ---------------------------------------------------------------- serializer anchors (serializer.py)
function anchorNodes(root: Node): void {
  const anchors = new Map<CollectionNode, string | null>();
  let last = 0;
  const visit = (node: Node): void => {
    if (node.kind === 'scalar') return;
    if (anchors.has(node)) {
      if (anchors.get(node) === null) {
        last += 1;
        const id = `id${String(last).padStart(3, '0')}`;
        anchors.set(node, id);
        node.anchor = id;
      }
      return;
    }
    anchors.set(node, null);
    if (node.kind === 'seq') for (const item of node.items) visit(item);
    else for (const [k, v] of node.items) { visit(k); visit(v); }
  };
  visit(root);
}

// ---------------------------------------------------------------- emitter (emitter.py)
type Analysis = {
  scalar: string;
  empty: boolean;
  multiline: boolean;
  allowFlowPlain: boolean;
  allowBlockPlain: boolean;
  allowSingleQuoted: boolean;
  allowDoubleQuoted: boolean;
  allowBlock: boolean;
};

const BREAKS = '\n\x85\u2028\u2029';
const SPACE_BREAKS = ' \n\x85\u2028\u2029';
const WS_BREAKS = '\0 \t\r\n\x85\u2028\u2029';
const BOM = '\uFEFF';
const ESCAPE_REPLACEMENTS: Record<string, string> = {
  '\0': '0', '\x07': 'a', '\x08': 'b', '\x09': 't', '\x0A': 'n', '\x0B': 'v', '\x0C': 'f', '\x0D': 'r', '\x1B': 'e',
  '"': '"', '\\': '\\', '\x85': 'N', '\xA0': '_', '\u2028': 'L', '\u2029': 'P',
};

function between(ch: string, lo: number, hi: number): boolean {
  const c = ch.codePointAt(0) as number;
  return c >= lo && c <= hi;
}

class Emitter {
  private out: string[] = [];
  private indent: number | null = null;
  private indents: (number | null)[] = [];
  private flowLevel = 0;
  private rootContext = false;
  private sequenceContext = false;
  private mappingContext = false;
  private simpleKeyContext = false;
  private column = 0;
  private whitespace = true;
  private indention = true;
  private openEnded = false;
  private emitted = new Set<CollectionNode>();
  private readonly bestIndent = 2;
  private readonly bestWidth = 80;
  private readonly bestLineBreak = '\n';

  private readonly allowUnicode: boolean;

  constructor(allowUnicode: boolean) {
    this.allowUnicode = allowUnicode;
  }

  emitDocument(root: Node): string {
    // Implicit document start (no `---`): safe_dump of a collection or non-empty scalar.
    this.expectNode(root, true, false, false, false);
    // Document end, then stream end.
    this.writeIndent();
    if (this.openEnded) {
      this.writeIndicator('...', true);
      this.writeIndent();
    }
    return this.out.join('');
  }

  private write(data: string): void {
    this.out.push(data);
  }

  private expectNode(node: Node, root: boolean, sequence: boolean, mapping: boolean, simpleKey: boolean): void {
    this.rootContext = root;
    this.sequenceContext = sequence;
    this.mappingContext = mapping;
    this.simpleKeyContext = simpleKey;
    if (node.kind !== 'scalar' && this.emitted.has(node)) {
      // AliasEvent: expect_alias → process_anchor('*')
      this.writeIndicator('*' + node.anchor, true);
      return;
    }
    if (node.kind !== 'scalar') {
      this.emitted.add(node);
      if (node.anchor) this.writeIndicator('&' + node.anchor, true);
    }
    if (node.kind === 'scalar') {
      const analysis = analyzeScalar(node.value, this.allowUnicode);
      const style = this.chooseScalarStyle(node, analysis);
      // process_tag: a non-plain style needs the tag to be implicit for non-plain scalars (only str is), else
      // PyYAML would write an explicit `!!int`-style tag. Every non-string value we emit is plain-safe.
      if (!((style === '' && node.implicit[0]) || (style !== '' && node.implicit[1]))) {
        throw new Error(`pyyaml: cannot emit ${JSON.stringify(node.value)} with tag ${node.tag} without an explicit tag`);
      }
      this.expectScalar(analysis, style);
    } else if (node.kind === 'seq') {
      if (this.flowLevel || node.items.length === 0) this.expectFlowSequence(node);
      else this.expectBlockSequence(node);
    } else {
      if (this.flowLevel || node.items.length === 0) this.expectFlowMapping(node);
      else this.expectBlockMapping(node);
    }
  }

  private expectScalar(analysis: Analysis, style: string): void {
    this.increaseIndent(true, false);
    this.processScalar(analysis, style);
    this.indent = this.indents.pop() as number | null;
  }

  private expectFlowSequence(node: CollectionNode & { kind: 'seq' }): void {
    this.writeIndicator('[', true, true, false);
    this.flowLevel += 1;
    this.increaseIndent(true, false);
    let first = true;
    for (const item of node.items) {
      if (!first) this.writeIndicator(',', false);
      if (this.column > this.bestWidth) this.writeIndent();
      first = false;
      this.expectNode(item, false, true, false, false);
    }
    this.indent = this.indents.pop() as number | null;
    this.flowLevel -= 1;
    this.writeIndicator(']', false);
  }

  private expectFlowMapping(node: CollectionNode & { kind: 'map' }): void {
    this.writeIndicator('{', true, true, false);
    this.flowLevel += 1;
    this.increaseIndent(true, false);
    let first = true;
    for (const [k, v] of node.items) {
      if (!first) this.writeIndicator(',', false);
      if (this.column > this.bestWidth) this.writeIndent();
      first = false;
      if (this.checkSimpleKey(k)) {
        this.expectNode(k, false, false, true, true);
        this.writeIndicator(':', false);
        this.expectNode(v, false, false, true, false);
      } else {
        this.writeIndicator('?', true);
        this.expectNode(k, false, false, true, false);
        if (this.column > this.bestWidth) this.writeIndent();
        this.writeIndicator(':', true);
        this.expectNode(v, false, false, true, false);
      }
    }
    this.indent = this.indents.pop() as number | null;
    this.flowLevel -= 1;
    this.writeIndicator('}', false);
  }

  private expectBlockSequence(node: CollectionNode & { kind: 'seq' }): void {
    const indentless = this.mappingContext && !this.indention;
    this.increaseIndent(false, indentless);
    for (const item of node.items) {
      this.writeIndent();
      this.writeIndicator('-', true, false, true);
      this.expectNode(item, false, true, false, false);
    }
    this.indent = this.indents.pop() as number | null;
  }

  private expectBlockMapping(node: CollectionNode & { kind: 'map' }): void {
    this.increaseIndent(false, false);
    for (const [k, v] of node.items) {
      this.writeIndent();
      if (this.checkSimpleKey(k)) {
        this.expectNode(k, false, false, true, true);
        // expect_block_mapping_simple_value
        this.writeIndicator(':', false);
        this.expectNode(v, false, false, true, false);
      } else {
        this.writeIndicator('?', true, false, true);
        this.expectNode(k, false, false, true, false);
        // expect_block_mapping_value
        this.writeIndent();
        this.writeIndicator(':', true, false, true);
        this.expectNode(v, false, false, true, false);
      }
    }
    this.indent = this.indents.pop() as number | null;
  }

  private checkSimpleKey(node: Node): boolean {
    let length = 0;
    if (node.kind !== 'scalar' && node.anchor) length += node.anchor.length;
    if (node.kind === 'scalar') {
      const analysis = analyzeScalar(node.value, this.allowUnicode);
      length += Array.from(analysis.scalar).length;
      return length < 128 && !analysis.empty && !analysis.multiline;
    }
    return length < 128 && node.items.length === 0;
  }

  private increaseIndent(flow: boolean, indentless: boolean): void {
    this.indents.push(this.indent);
    if (this.indent === null) this.indent = flow ? this.bestIndent : 0;
    else if (!indentless) this.indent += this.bestIndent;
  }

  private chooseScalarStyle(node: ScalarNode, analysis: Analysis): string {
    if (node.implicit[0]) {
      if (!(this.simpleKeyContext && (analysis.empty || analysis.multiline))
        && ((this.flowLevel && analysis.allowFlowPlain) || (!this.flowLevel && analysis.allowBlockPlain))) {
        return '';
      }
    }
    if (analysis.allowSingleQuoted && !(this.simpleKeyContext && analysis.multiline)) return "'";
    return '"';
  }

  private processScalar(analysis: Analysis, style: string): void {
    const split = !this.simpleKeyContext;
    if (style === '"') this.writeDoubleQuoted(analysis.scalar, split);
    else if (style === "'") this.writeSingleQuoted(analysis.scalar, split);
    else this.writePlain(analysis.scalar, split);
  }

  private writeIndicator(indicator: string, needWhitespace: boolean, whitespace = false, indention = false): void {
    const data = this.whitespace || !needWhitespace ? indicator : ' ' + indicator;
    this.whitespace = whitespace;
    this.indention = this.indention && indention;
    this.column += data.length;
    this.openEnded = false;
    this.write(data);
  }

  private writeIndent(): void {
    const indent = this.indent ?? 0;
    if (!this.indention || this.column > indent || (this.column === indent && !this.whitespace)) this.writeLineBreak();
    if (this.column < indent) {
      this.whitespace = true;
      this.write(' '.repeat(indent - this.column));
      this.column = indent;
    }
  }

  private writeLineBreak(data?: string): void {
    this.whitespace = true;
    this.indention = true;
    this.column = 0;
    this.write(data ?? this.bestLineBreak);
  }

  private writeSingleQuoted(text: string, split: boolean): void {
    this.writeIndicator("'", true);
    const chars = Array.from(text);
    let spaces = false;
    let breaks = false;
    let start = 0;
    let end = 0;
    while (end <= chars.length) {
      const ch: string | null = end < chars.length ? (chars[end] as string) : null;
      if (spaces) {
        if (ch === null || ch !== ' ') {
          if (start + 1 === end && this.column > this.bestWidth && split && start !== 0 && end !== chars.length) {
            this.writeIndent();
          } else {
            const data = chars.slice(start, end).join('');
            this.column += data.length;
            this.write(data);
          }
          start = end;
        }
      } else if (breaks) {
        if (ch === null || !BREAKS.includes(ch)) {
          if (chars[start] === '\n') this.writeLineBreak();
          for (const br of chars.slice(start, end)) {
            if (br === '\n') this.writeLineBreak();
            else this.writeLineBreak(br);
          }
          this.writeIndent();
          start = end;
        }
      } else if (ch === null || SPACE_BREAKS.includes(ch) || ch === "'") {
        if (start < end) {
          const data = chars.slice(start, end).join('');
          this.column += data.length;
          this.write(data);
          start = end;
        }
      }
      if (ch === "'") {
        this.column += 2;
        this.write("''");
        start = end + 1;
      }
      if (ch !== null) {
        spaces = ch === ' ';
        breaks = BREAKS.includes(ch);
      }
      end += 1;
    }
    this.writeIndicator("'", false);
  }

  private writeDoubleQuoted(text: string, split: boolean): void {
    this.writeIndicator('"', true);
    const chars = Array.from(text);
    let start = 0;
    let end = 0;
    while (end <= chars.length) {
      const ch: string | null = end < chars.length ? (chars[end] as string) : null;
      if (ch === null || ('"\\' + BREAKS.slice(1) + BOM).includes(ch)
        || !(between(ch, 0x20, 0x7e) || (this.allowUnicode && (between(ch, 0xa0, 0xd7ff) || between(ch, 0xe000, 0xfffd))))) {
        if (start < end) {
          const data = chars.slice(start, end).join('');
          this.column += data.length;
          this.write(data);
          start = end;
        }
        if (ch !== null) {
          const cp = ch.codePointAt(0) as number;
          let data: string;
          if (ch in ESCAPE_REPLACEMENTS) data = '\\' + (ESCAPE_REPLACEMENTS[ch] as string);
          else if (cp <= 0xff) data = '\\x' + cp.toString(16).toUpperCase().padStart(2, '0');
          else if (cp <= 0xffff) data = '\\u' + cp.toString(16).toUpperCase().padStart(4, '0');
          else data = '\\U' + cp.toString(16).toUpperCase().padStart(8, '0');
          this.column += data.length;
          this.write(data);
          start = end + 1;
        }
      }
      if (end > 0 && end < chars.length - 1 && (ch === ' ' || start >= end) && this.column + (end - start) > this.bestWidth && split) {
        const data = chars.slice(start, end).join('') + '\\';
        if (start < end) start = end;
        this.column += data.length;
        this.write(data);
        this.writeIndent();
        this.whitespace = false;
        this.indention = false;
        if (chars[start] === ' ') {
          this.column += 1;
          this.write('\\');
        }
      }
      end += 1;
    }
    this.writeIndicator('"', false);
  }

  private writePlain(text: string, split: boolean): void {
    if (this.rootContext) this.openEnded = true;
    if (!text) return;
    if (!this.whitespace) {
      this.column += 1;
      this.write(' ');
    }
    this.whitespace = false;
    this.indention = false;
    const chars = Array.from(text);
    let spaces = false;
    let breaks = false;
    let start = 0;
    let end = 0;
    while (end <= chars.length) {
      const ch: string | null = end < chars.length ? (chars[end] as string) : null;
      if (spaces) {
        if (ch !== ' ') {
          if (start + 1 === end && this.column > this.bestWidth && split) {
            this.writeIndent();
            this.whitespace = false;
            this.indention = false;
          } else {
            const data = chars.slice(start, end).join('');
            this.column += data.length;
            this.write(data);
          }
          start = end;
        }
      } else if (breaks) {
        if (ch === null || !BREAKS.includes(ch)) {
          if (chars[start] === '\n') this.writeLineBreak();
          for (const br of chars.slice(start, end)) {
            if (br === '\n') this.writeLineBreak();
            else this.writeLineBreak(br);
          }
          this.writeIndent();
          this.whitespace = false;
          this.indention = false;
          start = end;
        }
      } else if (ch === null || SPACE_BREAKS.includes(ch)) {
        const data = chars.slice(start, end).join('');
        this.column += data.length;
        this.write(data);
        start = end;
      }
      if (ch !== null) {
        spaces = ch === ' ';
        breaks = BREAKS.includes(ch);
      }
      end += 1;
    }
  }
}

function analyzeScalar(text: string, allowUnicode: boolean): Analysis {
  if (!text) {
    return { scalar: text, empty: true, multiline: false, allowFlowPlain: false, allowBlockPlain: true, allowSingleQuoted: true, allowDoubleQuoted: true, allowBlock: false };
  }
  const chars = Array.from(text);
  let blockIndicators = false;
  let flowIndicators = false;
  let lineBreaks = false;
  let specialCharacters = false;
  let leadingSpace = false;
  let leadingBreak = false;
  let trailingSpace = false;
  let trailingBreak = false;
  let breakSpace = false;
  let spaceBreak = false;
  if (text.startsWith('---') || text.startsWith('...')) {
    blockIndicators = true;
    flowIndicators = true;
  }
  let precededByWhitespace = true;
  let followedByWhitespace = chars.length === 1 || WS_BREAKS.includes(chars[1] as string);
  let previousSpace = false;
  let previousBreak = false;
  let index = 0;
  while (index < chars.length) {
    const ch = chars[index] as string;
    if (index === 0) {
      if ('#,[]{}&*!|>\'"%@`'.includes(ch)) {
        flowIndicators = true;
        blockIndicators = true;
      }
      if (ch === '?' || ch === ':') {
        flowIndicators = true;
        if (followedByWhitespace) blockIndicators = true;
      }
      if (ch === '-' && followedByWhitespace) {
        flowIndicators = true;
        blockIndicators = true;
      }
    } else {
      if (',?[]{}'.includes(ch)) flowIndicators = true;
      if (ch === ':') {
        flowIndicators = true;
        if (followedByWhitespace) blockIndicators = true;
      }
      if (ch === '#' && precededByWhitespace) {
        flowIndicators = true;
        blockIndicators = true;
      }
    }
    if (BREAKS.includes(ch)) lineBreaks = true;
    if (!(ch === '\n' || between(ch, 0x20, 0x7e))) {
      if ((ch === '\x85' || between(ch, 0xa0, 0xd7ff) || between(ch, 0xe000, 0xfffd) || between(ch, 0x10000, 0x10fffe)) && ch !== BOM) {
        if (!allowUnicode) specialCharacters = true;
      } else {
        specialCharacters = true;
      }
    }
    if (ch === ' ') {
      if (index === 0) leadingSpace = true;
      if (index === chars.length - 1) trailingSpace = true;
      if (previousBreak) breakSpace = true;
      previousSpace = true;
      previousBreak = false;
    } else if (BREAKS.includes(ch)) {
      if (index === 0) leadingBreak = true;
      if (index === chars.length - 1) trailingBreak = true;
      if (previousSpace) spaceBreak = true;
      previousSpace = false;
      previousBreak = true;
    } else {
      previousSpace = false;
      previousBreak = false;
    }
    index += 1;
    precededByWhitespace = WS_BREAKS.includes(ch);
    followedByWhitespace = index + 1 >= chars.length || WS_BREAKS.includes(chars[index + 1] as string);
  }
  let allowFlowPlain = true;
  let allowBlockPlain = true;
  let allowSingleQuoted = true;
  const allowDoubleQuoted = true;
  let allowBlock = true;
  if (leadingSpace || leadingBreak || trailingSpace || trailingBreak) allowFlowPlain = allowBlockPlain = false;
  if (trailingSpace) allowBlock = false;
  if (breakSpace) allowFlowPlain = allowBlockPlain = allowSingleQuoted = false;
  if (spaceBreak || specialCharacters) allowFlowPlain = allowBlockPlain = allowSingleQuoted = allowBlock = false;
  if (lineBreaks) allowFlowPlain = allowBlockPlain = false;
  if (flowIndicators) allowFlowPlain = false;
  if (blockIndicators) allowBlockPlain = false;
  return { scalar: text, empty: false, multiline: lineBreaks, allowFlowPlain, allowBlockPlain, allowSingleQuoted, allowDoubleQuoted, allowBlock };
}

/** `yaml.safe_dump(data, sort_keys=False, allow_unicode=allowUnicode)`. Block style, width 80, indent 2. */
export function dump(data: unknown, allowUnicode = false): string {
  const root = new Representer().represent(data);
  anchorNodes(root);
  return new Emitter(allowUnicode).emitDocument(root);
}
