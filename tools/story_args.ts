#!/usr/bin/env node
/**
 * A story module's `args`, as the values Storybook actually renders it with.
 *
 * tools/docs_examples.ts reads `packages/react/src/<Name>.stories.tsx` with the TypeScript compiler
 * API, which is the right tool for everything about a story that is *written* — whether it has a
 * `render`, whether it has `decorators`, what its source text is. It is the wrong tool for a story's
 * values, because a story is allowed to compute them:
 *
 *     const meta = { args: { children: slides(['Product 1', 'Product 2', 'Product 3']) } };
 *
 * A parse cannot call `slides`, so it wrote `{ "$unsupported": "slides([…])" }`, the website dropped
 * the prop, and every Carousel example on the docs site was two arrow buttons around a 0px track — a
 * working-looking shell with nothing in it. The same for Tabs (`panelsFor(TABS)`), Stack's wrap
 * examples (`[…].map(…)`) and DataGrid's "Many Rows" (`Array.from(…)`).
 *
 * So the values are read the only way that is always right: by evaluating the module. It is imported
 * with the same `node --import tsx` loader the tools already run under, in a child process, and each
 * named export's `args` is merged over the default export's and serialized into the same JSON shapes
 * the parse already targeted — primitives as themselves, arrays and objects recursively, React
 * elements as `{ $element, props, children }` descriptors the website rebuilds with `createElement`.
 * A helper call is then just a function call, and `slides()` resolves to the element tree it returns.
 *
 * What stays `{ $unsupported }` is what genuinely cannot be data: a function (a column's `validate`,
 * a `formatValue`), a class instance, a cycle. Those are named rather than quoted — `"validate"`,
 * not the arrow's source — because the source is already beside the example in its code panel.
 *
 * **A child process, not an import here.** Importing fifty story modules pulls React, every generated
 * component and every one of their stylesheets into the process. A tool that writes files has no
 * business holding that (or a component's module-level side effects), and `main()` in
 * ./docs_examples.ts is synchronous by design, so the evaluation happens in a child that writes its
 * result to a file and exits. Stylesheets are answered by ./story_css_loader.mjs; Node has no `.css`
 * loader and does not need one to read an object literal.
 *
 * **Where it does not run.** The stories import React and their own components, so they can only be
 * evaluated where the package's dependencies are installed beside them (`packages/react/node_modules`).
 * Without that — the tool's own tests build a story module in a sandbox — `evaluateStoryArgs` returns
 * `null` and ./docs_examples.ts falls back to the parse, which is what it did for everything before.
 *
 * Usage:  node --import tsx tools/story_args.ts <stories-directory> <out.json>
 *
 * Runs under tsx.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { register } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

// Type-only, so nothing here imports ./docs_examples.ts at runtime: this module is also a program,
// and a program that starts by parsing TypeScript to read a value it is about to evaluate is a
// program that does twice the work.
import type { Value } from './docs_examples.ts';

/** What the child evaluated: `<Name>` → export name → that story's args, serialized. */
export interface RuntimeArgs {
  modules: Map<string, Map<string, Record<string, Value>>>;
  /** A module that could not be imported, with the reason. Its examples fall back to the parse. */
  problems: string[];
}

/* ------------------------------------------------------------------ the serializer */

/**
 * React's element tags. Two: `react.transitional.element` is what React 19 stamps on an element,
 * and `react.element` is what everything before it did (and what a second, older copy of React in
 * the tree would still produce).
 */
const ELEMENT_TAGS: ReadonlySet<symbol> = new Set([Symbol.for('react.transitional.element'), Symbol.for('react.element')]);
const FRAGMENT = Symbol.for('react.fragment');

/** A React element, structurally — the shape, not `isValidElement`, so no React import is needed here. */
function isElement(value: object): value is { type: unknown; key: string | null; props: Record<string, unknown> } {
  const tag = (value as { $$typeof?: unknown }).$$typeof;
  return typeof tag === 'symbol' && ELEMENT_TAGS.has(tag) && 'props' in value;
}

/** Whether an object is a plain one — an object literal or `Object.create(null)`, not a Date or a Map. */
function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value) as unknown;
  return prototype === Object.prototype || prototype === null;
}

/**
 * The name the website can resolve an element's type by.
 *
 * `createElement` needs either an intrinsic tag (`svg`, `path`) or an export of
 * `@design-schema/react`, which is what apps/website/src/example-args.ts looks the name up in. A
 * generated component is a named function declaration, so its `name` is its export name; `memo` and
 * `forwardRef` wrappers are followed to the function they wrap.
 */
function tagOf(type: unknown): string | null {
  if (typeof type === 'string') return type;
  if (type === FRAGMENT) return 'Fragment';
  if (typeof type === 'function') {
    const named = type as { displayName?: unknown; name?: unknown };
    if (typeof named.displayName === 'string' && named.displayName !== '') return named.displayName;
    return typeof named.name === 'string' && named.name !== '' ? named.name : null;
  }
  if (typeof type === 'object' && type !== null) {
    const wrapper = type as { displayName?: unknown; render?: unknown; type?: unknown };
    if (typeof wrapper.displayName === 'string' && wrapper.displayName !== '') return wrapper.displayName;
    if (typeof wrapper.render === 'function') return tagOf(wrapper.render); // forwardRef
    if (wrapper.type !== undefined) return tagOf(wrapper.type); // memo, lazy
  }
  return null;
}

/** An `{ $unsupported }`, named rather than quoted — the story's source is already in its code panel. */
function unsupported(what: string): Value {
  return { $unsupported: what };
}

/** What a function is called, for the marker that stands in for it. */
function functionName(value: (...args: unknown[]) => unknown): string {
  // A property initializer gets the property's name (`validate: (v) => …` is named `validate`); an
  // arrow inside an array gets none, and has nothing better to be called.
  return value.name === '' ? '(anonymous function)' : value.name;
}

/** An element's children, flattened the way React flattens them, with the empties JSX ignores dropped. */
function childrenOf(children: unknown, seen: Set<object>): Value[] {
  if (children === undefined || children === null || typeof children === 'boolean') return [];
  if (Array.isArray(children)) return children.flatMap((child) => childrenOf(child, seen));
  const value = serialize(children, seen);
  return value === undefined ? [] : [value];
}

/**
 * One value as JSON, or `undefined` for one that is not there at all.
 *
 * `undefined` is the caller's signal to leave the key out, which is both what JSON does with it and
 * what Storybook means by `args: { label: undefined }` — unset the meta's, rather than pass one.
 */
export function serialize(value: unknown, seen: Set<object> = new Set()): Value | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : unsupported(String(value));
  if (typeof value === 'function') return unsupported(functionName(value as (...args: unknown[]) => unknown));
  if (typeof value === 'bigint') return unsupported(`${value}n`);
  if (typeof value === 'symbol') return unsupported(value.toString());
  if (typeof value !== 'object') return unsupported(typeof value);

  const object = value as object;
  // A story's args are data, and data has no cycles; one here would be a hang rather than an error.
  if (seen.has(object)) return unsupported('(circular reference)');
  const nested = new Set(seen).add(object);

  if (isElement(object)) {
    const tag = tagOf(object.type);
    if (tag === null) return unsupported('(an unnamed component)');
    const props: Record<string, Value> = {};
    // The key is React's, hoisted out of the props it was written in. It goes back: an args value is
    // very often a list of elements, and `createElement` reads a key from the props it is given.
    if (object.key !== null) props['key'] = object.key;
    for (const [name, item] of Object.entries(object.props)) {
      if (name === 'children') continue;
      const encoded = serialize(item, nested);
      if (encoded !== undefined) props[name] = encoded;
    }
    return { $element: tag, props, children: childrenOf(object.props['children'], nested) };
  }

  if (Array.isArray(object)) {
    // A hole or an `undefined` slot has no JSON spelling of its own; `null` is the nearest, and is
    // what the parse already wrote for one.
    return object.map((item) => serialize(item, nested) ?? null);
  }

  if (!isPlainObject(object)) {
    const name = (object.constructor as { name?: unknown } | undefined)?.name;
    return unsupported(typeof name === 'string' && name !== '' ? `(a ${name})` : '(a class instance)');
  }

  const encoded: Record<string, Value> = {};
  for (const [name, item] of Object.entries(object as Record<string, unknown>)) {
    const item2 = serialize(item, nested);
    if (item2 !== undefined) encoded[name] = item2;
  }
  return encoded;
}

/* ------------------------------------------------------------------ the child */

/** `{ args: … }` off a meta or a story object, as written. Anything else is a story that passes none. */
function argsOf(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return {};
  const args = (value as { args?: unknown }).args;
  if (typeof args !== 'object' || args === null || Array.isArray(args)) return {};
  return args as Record<string, unknown>;
}

/** One module's exports: each story's args merged over the meta's, in Storybook's own precedence. */
async function evaluateModule(file: string): Promise<Record<string, Record<string, Value>>> {
  const module = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  const meta = argsOf(module['default']);
  const stories: Record<string, Record<string, Value>> = {};
  for (const [name, value] of Object.entries(module)) {
    if (name === 'default' || typeof value !== 'object' || value === null) continue;
    const merged: Record<string, Value> = {};
    for (const [key, item] of Object.entries({ ...meta, ...argsOf(value) })) {
      const encoded = serialize(item);
      if (encoded !== undefined) merged[key] = encoded;
    }
    stories[name] = merged;
  }
  return stories;
}

/** The child half: evaluate every `<Name>.stories.tsx` in `directory` and write the result to `out`. */
async function run(directory: string, out: string): Promise<number> {
  register('./story_css_loader.mjs', import.meta.url);
  const modules: Record<string, Record<string, Record<string, Value>>> = {};
  const problems: string[] = [];
  for (const file of readdirSync(directory).sort()) {
    if (!file.endsWith('.stories.tsx')) continue;
    const name = file.slice(0, -'.stories.tsx'.length);
    try {
      modules[name] = await evaluateModule(join(directory, file));
    } catch (e) {
      problems.push(`${name}.stories.tsx could not be evaluated: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  writeTextAtomic(out, JSON.stringify({ modules, problems }));
  return 0;
}

/* ------------------------------------------------------------------ the parent */

/**
 * Whether the story modules can be evaluated where they are.
 *
 * They import React and their own components, so the package's dependencies have to be installed
 * beside them. The tool's tests write a story module into a sandbox with no `node_modules`, which is
 * not a failure to report — it is a directory where the parse is the whole answer.
 */
export function canEvaluate(directory: string): boolean {
  return existsSync(join(dirname(directory), 'node_modules', 'react'));
}

/** Raised when the evaluation could have run and did not. */
export class StoryArgsError extends Error {}

/**
 * Every story's args, evaluated, or `null` where they cannot be (see `canEvaluate`).
 *
 * The child writes to a file rather than to stdout: a story module may import a component that logs,
 * and one stray line would make the result unparseable. A module that throws on import is a problem
 * in the result, not a failure of the run — its examples fall back to the parse, and ./docs_examples.ts
 * says so.
 */
export function evaluateStoryArgs(directory: string): RuntimeArgs | null {
  if (!canEvaluate(directory)) return null;
  const scratch = mkdtempSync(join(tmpdir(), 'ds-story-args-'));
  const out = join(scratch, 'args.json');
  try {
    const result = spawnSync(process.execPath, ['--import', 'tsx', fileURLToPath(import.meta.url), directory, out], {
      // The package's own root, so tsx compiles the stories with the package's `tsconfig.json` —
      // `"jsx": "react-jsx"`. Compiled from the repository root instead, every one of them is
      // `React.createElement` against a `React` nobody imported.
      cwd: dirname(directory),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (result.error !== undefined) throw new StoryArgsError(`could not evaluate the story modules: ${result.error.message}`);
    if (result.status !== 0 || !existsSync(out)) {
      const detail = (result.stderr ?? '').trim().split('\n').slice(-5).join('\n');
      throw new StoryArgsError(`evaluating the story modules failed (exit ${String(result.status)})\n${detail}`);
    }
    const parsed = JSON.parse(readText(out)) as {
      modules: Record<string, Record<string, Record<string, Value>>>;
      problems: string[];
    };
    return {
      modules: new Map(
        Object.entries(parsed.modules).map(([name, stories]) => [name, new Map(Object.entries(stories))]),
      ),
      problems: parsed.problems,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const [directory, out] = process.argv.slice(2);
  if (directory === undefined || out === undefined) {
    process.stderr.write('usage: story_args.ts <stories-directory> <out.json>\n');
    process.exitCode = 2;
  } else {
    process.exitCode = await run(directory, out);
  }
}
