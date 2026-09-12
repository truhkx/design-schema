/**
 * The slice of JSON Schema draft 2020-12 that `schema/theme.schema.json` uses, with the error messages,
 * instance paths and error order of Python's `jsonschema.Draft202012Validator.iter_errors` (4.26) — the
 * validator `tools/theme.py` used, so a bad theme doc still fails with the same text.
 *
 * Keywords: $ref, type, enum, const, pattern, minimum, maximum, exclusiveMinimum, exclusiveMaximum,
 * minItems, maxItems, items, prefixItems, properties, required, additionalProperties. Annotation-only
 * keywords ($schema, $id, title, description, default, $defs, examples) are ignored, as they are there.
 *
 * Order matters twice over: within one schema object the keywords run in the order the JSON file lists
 * them, and `properties` descends in the order the schema declares — `iter_errors` iterates `schema.items()`.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { pyRepr, pySorted } from './py.ts';

export type SchemaError = { path: (string | number)[]; message: string; validator: string };
type Schema = Record<string, any>;
/** A subschema may be the boolean `true`/`false` forms as well as an object. */
type SubSchema = Schema | boolean;

const ANNOTATIONS = new Set(['$schema', '$id', '$comment', 'title', 'description', 'default', 'examples', '$defs', 'definitions', 'deprecated']);

/** `jsonschema`'s `is_type`: a bool is never a number, and `integer` accepts a float with no fraction. */
function isType(value: unknown, type: string): boolean {
  switch (type) {
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !Number.isNaN(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return true;
  }
}

/**
 * `re.search(pattern, string)`. The patterns in our schemas are plain ASCII, so the one Python/JavaScript
 * difference that can bite is `$`, which in Python also matches just before a trailing newline.
 */
function pySearch(pattern: string, s: string): boolean {
  const re = new RegExp(pattern);
  return re.test(s) || (s.endsWith('\n') && re.test(s.slice(0, -1)));
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => Object.hasOwn(b, k) && deepEqual((a as Schema)[k], (b as Schema)[k]));
  }
  return false;
}

/** `#/$defs/hex` and friends, resolved against the root schema. Only local pointers occur here. */
function resolveRef(root: Schema, ref: string): Schema {
  if (!ref.startsWith('#/')) throw new Error(`Unresolvable: ${ref}`);
  let node: any = root;
  for (const raw of ref.slice(2).split('/')) {
    const token = decodeURIComponent(raw).replace(/~1/g, '/').replace(/~0/g, '~');
    if (node === undefined || !Object.hasOwn(node, token)) throw new Error(`Unresolvable: ${ref}`);
    node = node[token];
  }
  return node as Schema;
}

/** Every validation error, in `iter_errors` order (schema-keyword order, depth first). */
export function iterErrors(schema: SubSchema, instance: unknown, root?: Schema): SchemaError[] {
  const out: SchemaError[] = [];
  const at = (path: (string | number)[], errs: SchemaError[]): void => {
    for (const e of errs) out.push({ ...e, path: [...path, ...e.path] });
  };
  const yieldError = (validator: string, message: string): void => {
    out.push({ path: [], message, validator });
  };

  if (schema === true || schema === undefined) return out;
  if (schema === false) return [{ path: [], message: `${pyRepr(instance)} is not allowed for ${pyRepr(instance)}`, validator: 'false' }];
  root ??= schema;

  for (const [keyword, value] of Object.entries(schema)) {
    if (ANNOTATIONS.has(keyword)) continue;
    switch (keyword) {
      case '$ref':
        at([], iterErrors(resolveRef(root, value as string), instance, root));
        break;
      case 'type': {
        const types: string[] = Array.isArray(value) ? value : [value];
        if (!types.some((t) => isType(instance, t))) {
          yieldError('type', `${pyRepr(instance)} is not of type ${types.map((t) => pyRepr(t)).join(', ')}`);
        }
        break;
      }
      case 'enum':
        if (!(value as unknown[]).some((each) => deepEqual(each, instance))) {
          yieldError('enum', `${pyRepr(instance)} is not one of ${pyRepr(value)}`);
        }
        break;
      case 'const':
        if (!deepEqual(value, instance)) yieldError('const', `${pyRepr(value)} was expected`);
        break;
      case 'pattern':
        if (isType(instance, 'string') && !pySearch(value as string, instance as string)) {
          yieldError('pattern', `${pyRepr(instance)} does not match ${pyRepr(value)}`);
        }
        break;
      case 'minimum':
        if (isType(instance, 'number') && (instance as number) < (value as number)) {
          yieldError('minimum', `${pyRepr(instance)} is less than the minimum of ${pyRepr(value)}`);
        }
        break;
      case 'maximum':
        if (isType(instance, 'number') && (instance as number) > (value as number)) {
          yieldError('maximum', `${pyRepr(instance)} is greater than the maximum of ${pyRepr(value)}`);
        }
        break;
      case 'exclusiveMinimum':
        if (isType(instance, 'number') && (instance as number) <= (value as number)) {
          yieldError('exclusiveMinimum', `${pyRepr(instance)} is less than or equal to the minimum of ${pyRepr(value)}`);
        }
        break;
      case 'exclusiveMaximum':
        if (isType(instance, 'number') && (instance as number) >= (value as number)) {
          yieldError('exclusiveMaximum', `${pyRepr(instance)} is greater than or equal to the maximum of ${pyRepr(value)}`);
        }
        break;
      case 'minItems':
        if (isType(instance, 'array') && (instance as unknown[]).length < (value as number)) {
          yieldError('minItems', `${pyRepr(instance)} ${value === 1 ? 'should be non-empty' : 'is too short'}`);
        }
        break;
      case 'maxItems':
        if (isType(instance, 'array') && (instance as unknown[]).length > (value as number)) {
          yieldError('maxItems', `${pyRepr(instance)} ${value === 0 ? 'is expected to be empty' : 'is too long'}`);
        }
        break;
      case 'prefixItems':
        if (isType(instance, 'array')) {
          (value as Schema[]).forEach((sub, i) => {
            if (i < (instance as unknown[]).length) at([i], iterErrors(sub, (instance as unknown[])[i], root));
          });
        }
        break;
      case 'items':
        if (isType(instance, 'array')) {
          const prefix = (schema.prefixItems as unknown[] | undefined)?.length ?? 0;
          for (let i = prefix; i < (instance as unknown[]).length; i++) at([i], iterErrors(value as Schema, (instance as unknown[])[i], root));
        }
        break;
      case 'properties':
        if (isType(instance, 'object')) {
          for (const [name, sub] of Object.entries(value as Record<string, Schema>)) {
            if (Object.hasOwn(instance as Schema, name)) at([name], iterErrors(sub, (instance as Schema)[name], root));
          }
        }
        break;
      case 'required':
        if (isType(instance, 'object')) {
          for (const name of value as string[]) {
            if (!Object.hasOwn(instance as Schema, name)) yieldError('required', `${pyRepr(name)} is a required property`);
          }
        }
        break;
      case 'additionalProperties': {
        if (!isType(instance, 'object')) break;
        const declared = new Set(Object.keys((schema.properties as Schema | undefined) ?? {}));
        const patterns = Object.keys((schema.patternProperties as Schema | undefined) ?? {});
        const extras = Object.keys(instance as Schema).filter((k) => !declared.has(k) && !patterns.some((p) => pySearch(p, k)));
        if (value === false) {
          if (extras.length) {
            const verb = extras.length === 1 ? 'was' : 'were';
            yieldError('additionalProperties', `Additional properties are not allowed (${pySorted(extras).map((e) => pyRepr(e)).join(', ')} ${verb} unexpected)`);
          }
        } else if (typeof value === 'object' && value !== null) {
          for (const extra of extras) at([extra], iterErrors(value as Schema, (instance as Schema)[extra], root));
        }
        break;
      }
      default:
        break; // an unimplemented keyword is an unenforced one; `pnpm check` would not notice, the tests would
    }
  }
  return out;
}

/**
 * `sorted(validator.iter_errors(fm), key=lambda e: list(e.path))`. Python's sort is stable, so errors that
 * share a path keep `iter_errors` order. A path position is either a property name or an array index, never
 * both, so the string/number branch below is only there to keep the comparator total.
 */
export function sortedErrors(errors: SchemaError[]): SchemaError[] {
  const cmp = (a: (string | number)[], b: (string | number)[]): number => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const x = a[i] as string | number;
      const y = b[i] as string | number;
      if (x === y) continue;
      if (typeof x === 'number' && typeof y === 'number') return x - y;
      if (typeof x === 'number') return -1;
      if (typeof y === 'number') return 1;
      return x < y ? -1 : 1;
    }
    return a.length - b.length;
  };
  return errors.map((e, i) => [e, i] as const)
    .sort((p, q) => cmp(p[0].path, q[0].path) || p[1] - q[1])
    .map(([e]) => e);
}

/** The `  - theme.density: 'cavernous' is not one of [...]` line `tools/theme.ts` reports. */
export function errorLine(e: SchemaError): string {
  return `  - ${e.path.map((p) => String(p)).join('.') || '(root)'}: ${e.message}`;
}
