#!/usr/bin/env node
/**
 * The docs site's example gallery — Storybook's own stories, projected into JSON
 * (site/src/content/docs/process/website-plan.md, "Content pipeline" and "Component page template"
 * step 4).
 *
 * Nothing here authors an example. Every entry traces back to a `packages/react/src/*.stories.tsx`
 * export that Storybook already renders, so the docs site shows the same example set Storybook does
 * and a new story reaches the website with `pnpm docs:examples` and nothing else.
 *
 * Two sources, and neither is executed:
 *
 * 1. `packages/react/src/<Name>.stories.tsx` — parsed with the TypeScript compiler API, never
 *    imported. A story module pulls in React, the component and its CSS; importing it into a Node
 *    tool would need a bundler and a DOM, and would make a tool that reads source depend on source
 *    that runs. The parse walks the named exports that sit beside `export default meta`, merges
 *    each one's `args` over the meta's (Storybook's own precedence), and keeps the export's source
 *    slice for display.
 * 2. `packages/react/storybook-static/index.json` — the manifest `storybook build` writes, which
 *    is where `storyId` comes from. Storybook's ID algorithm (title + export name, sluggified, with
 *    its own collision rules) is Storybook's to change; re-deriving it here would produce deep links
 *    that break quietly. Each export is matched by `importPath` + `exportName`, and the id is read
 *    off the manifest entry. Build it with `pnpm --filter @design-schema/react build-storybook`.
 *
 * Writes `generated/examples/<Name>.json`:
 *
 *   [{ "title": "Default", "args": {...}, "sourceText": "export const Default…", "storyId": "button-react--default" }, …]
 *
 * `args` is JSON, because the website renders it in a React island built from the JSON alone — the
 * examples must work with every Storybook instance unreachable. Story args are ordinary data most of
 * the time; where they are not, this encoder covers two more shapes rather than giving up:
 *
 *   - module-level `const`s referenced by name (`args: { columns: COLUMNS }`), resolved by walking
 *     the declaration, so the JSON holds the value the story actually renders with;
 *   - JSX (`children: <TabPanel id="a">…</TabPanel>`), encoded as `{ "$element", "props",
 *     "children" }` descriptors the island rebuilds with `createElement`.
 *
 * What is genuinely code — an arrow function, a call this tool cannot evaluate — is encoded as
 * `{ "$unsupported": "<source text>" }` and dropped by the island. That is deliberate: the entry
 * stays honest about what it could not carry rather than omitting the story, the example still
 * renders (a `render` callback missing from a Table column means a plain cell, not a blank page),
 * and the source slice beside it shows the reader the real thing. `--report` lists them.
 *
 * Usage:  node tools/docs_examples.ts [--check] [--report]
 *
 * Runs under tsx.
 */
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// TypeScript 7 ships no JS API, so the parse uses the 6.x compiler the site and apps/website
// already alias for the same reason (see site/package.json).
import ts from 'typescript6';

import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads or writes. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  STORIES: join(REPO_ROOT, 'packages', 'react', 'src'),
  INDEX: join(REPO_ROOT, 'packages', 'react', 'storybook-static', 'index.json'),
  OUT: join(REPO_ROOT, 'generated', 'examples'),
};

/** The command that writes `paths.INDEX`, named in every error that needs it rebuilt. */
export const BUILD_COMMAND = 'pnpm --filter @design-schema/react build-storybook';

/** Raised for a bad input: a missing manifest, an unreadable story module, a story with no id. */
export class ExamplesError extends Error {}

/* ------------------------------------------------------------------ encoded values */

/** A JSX element in `args`, rebuilt by the website's island with `createElement`. */
export type ElementValue = { $element: string; props: Record<string, Value>; children: Value[] };
/** An expression this tool cannot turn into data, kept with its source so the JSON stays honest. */
export type UnsupportedValue = { $unsupported: string };
export type Value =
  | string
  | number
  | boolean
  | null
  | Value[]
  | { [key: string]: Value }
  | ElementValue
  | UnsupportedValue;

export function isUnsupported(value: Value): value is UnsupportedValue {
  return typeof value === 'object' && value !== null && '$unsupported' in value;
}

/** One story, as the website reads it. */
export interface Example {
  /** Storybook's own display name for the story ("Heading Level 2"), the tab's label. */
  title: string;
  /** The story's args merged over the meta's — what Storybook renders it with. */
  args: Record<string, Value>;
  /** The export's source slice, shown beside the live example. */
  sourceText: string;
  /** The id Storybook assigned, read from its manifest. Never derived here. */
  storyId: string;
}

/* ------------------------------------------------------------------ the manifest */

type IndexEntry = { type?: unknown; id?: unknown; name?: unknown; importPath?: unknown; exportName?: unknown };

/** One story in `storybook-static/index.json`, narrowed to what this tool needs. */
export type ManifestStory = { id: string; name: string; importPath: string; exportName: string };

/**
 * The manifest's stories, keyed `<importPath>#<exportName>`.
 *
 * Docs entries (`type: 'docs'`) are the autodocs page Storybook generates per module, not a story
 * anyone can open as an example, so they are skipped.
 */
export function manifestStories(manifest: unknown): Map<string, ManifestStory> {
  const entries = (manifest as { entries?: unknown } | null)?.entries;
  if (typeof entries !== 'object' || entries === null) {
    throw new ExamplesError(`storybook-static/index.json: no \`entries\` map — rebuild it with \`${BUILD_COMMAND}\``);
  }
  const stories = new Map<string, ManifestStory>();
  for (const entry of Object.values(entries as Record<string, IndexEntry>)) {
    if (entry.type !== 'story') continue;
    const { id, name, importPath, exportName } = entry;
    if (typeof id !== 'string' || typeof name !== 'string' || typeof importPath !== 'string' || typeof exportName !== 'string') {
      throw new ExamplesError(`storybook-static/index.json: a story entry is missing id/name/importPath/exportName (${JSON.stringify(entry).slice(0, 80)})`);
    }
    stories.set(`${importPath}#${exportName}`, { id, name, importPath, exportName });
  }
  if (stories.size === 0) {
    throw new ExamplesError(`storybook-static/index.json lists no stories — rebuild it with \`${BUILD_COMMAND}\``);
  }
  return stories;
}

/* ------------------------------------------------------------------ the parse */

/** Peels the wrappers that carry no value: `x as T`, `x satisfies T`, `(x)`, `x!`, `<T>x`. */
function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  for (;;) {
    if (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isTypeAssertionExpression(current)) current = current.expression;
    else if (ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current)) current = current.expression;
    else return current;
  }
}

/**
 * Whether an expression is the literal `undefined`.
 *
 * An arg set to `undefined` is Storybook's way of unsetting one the meta supplies, and JSON already
 * has a spelling for it: the property is not there. So the property is dropped rather than encoded,
 * which is both the right merge result and one less thing for the island to interpret.
 */
function isUndefinedExpression(node: ts.Expression): boolean {
  const expression = unwrap(node);
  return ts.isIdentifier(expression) && expression.text === 'undefined';
}

/** The module's top-level `const name = …` initializers, so `args: { columns: COLUMNS }` resolves. */
function moduleScope(source: ts.SourceFile): Map<string, ts.Expression> {
  const scope = new Map<string, ts.Expression>();
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer !== undefined) {
        scope.set(declaration.name.text, declaration.initializer);
      }
    }
  }
  return scope;
}

/** Array methods safe to evaluate on an already-encoded array: no callback, no mutation. */
const PURE_ARRAY_METHODS: Record<string, (array: Value[], args: Value[]) => Value | undefined> = {
  slice: (array, args) => (args.every((a) => typeof a === 'number') ? array.slice(...(args as number[])) : undefined),
  concat: (array, args) => (args.every((a) => Array.isArray(a)) ? array.concat(...(args as Value[][])) : undefined),
  at: (array, args) => (args.length === 1 && typeof args[0] === 'number' ? (array.at(args[0]) ?? null) : undefined),
};

/**
 * One expression as JSON, or `{ $unsupported }` when it is code rather than data.
 *
 * `seen` guards the identifier walk: `const a = b; const b = a;` is not valid module init order,
 * but a parse has no evaluator to notice, and a cycle here would be a hang rather than an error.
 */
function encodeValue(node: ts.Expression, source: ts.SourceFile, scope: Map<string, ts.Expression>, seen: ReadonlySet<string> = new Set()): Value {
  const expression = unwrap(node);
  const unsupported = (): UnsupportedValue => ({ $unsupported: expression.getText(source) });

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;
  // `undefined` reaches here only where it cannot be dropped (an array slot); `null` is JSON's
  // nearest spelling for an empty one.
  if (isUndefinedExpression(expression)) return null;

  if (ts.isPrefixUnaryExpression(expression)) {
    const operand = encodeValue(expression.operand, source, scope, seen);
    if (typeof operand === 'number' && expression.operator === ts.SyntaxKind.MinusToken) return -operand;
    if (typeof operand === 'number' && expression.operator === ts.SyntaxKind.PlusToken) return operand;
    return unsupported();
  }

  if (ts.isIdentifier(expression)) {
    const declaration = scope.get(expression.text);
    if (declaration === undefined || seen.has(expression.text)) return unsupported();
    return encodeValue(declaration, source, scope, new Set([...seen, expression.text]));
  }

  if (ts.isArrayLiteralExpression(expression)) {
    const items: Value[] = [];
    for (const element of expression.elements) {
      if (ts.isSpreadElement(element)) {
        const spread = encodeValue(element.expression, source, scope, seen);
        if (!Array.isArray(spread)) return unsupported();
        items.push(...spread);
      } else if (ts.isOmittedExpression(element)) {
        items.push(null);
      } else {
        items.push(encodeValue(element, source, scope, seen));
      }
    }
    return items;
  }

  if (ts.isObjectLiteralExpression(expression)) return encodeObject(expression, source, scope, seen);
  if (ts.isJsxElement(expression) || ts.isJsxSelfClosingElement(expression) || ts.isJsxFragment(expression)) {
    return encodeJsx(expression, source, scope, seen);
  }

  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      const part = encodeValue(span.expression, source, scope, seen);
      if (typeof part !== 'string' && typeof part !== 'number' && typeof part !== 'boolean') return unsupported();
      text += String(part) + span.literal.text;
    }
    return text;
  }

  // Arithmetic on encoded primitives, which is what an index like `COLUMNS.length - 1` is. No
  // comparison or logical operator: those are decisions a story makes, not data it holds.
  if (ts.isBinaryExpression(expression)) {
    const left = encodeValue(expression.left, source, scope, seen);
    const right = encodeValue(expression.right, source, scope, seen);
    if (typeof left === 'string' && typeof right === 'string' && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) return left + right;
    if (typeof left === 'number' && typeof right === 'number') {
      switch (expression.operatorToken.kind) {
        case ts.SyntaxKind.PlusToken: return left + right;
        case ts.SyntaxKind.MinusToken: return left - right;
        case ts.SyntaxKind.AsteriskToken: return left * right;
        case ts.SyntaxKind.SlashToken: return left / right;
        default: return unsupported();
      }
    }
    return unsupported();
  }

  // `ICONS.external`, `DATA[0]` — a lookup into data the module already declares.
  if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    const target = encodeValue(expression.expression, source, scope, seen);
    const key = ts.isPropertyAccessExpression(expression)
      ? expression.name.text
      : encodeValue(expression.argumentExpression, source, scope, seen);
    if (Array.isArray(target) && typeof key === 'number') return target[key] ?? null;
    if (Array.isArray(target) && key === 'length') return target.length;
    if (typeof target === 'object' && target !== null && !Array.isArray(target) && typeof key === 'string' && !isUnsupported(target)) {
      return (target as Record<string, Value>)[key] ?? null;
    }
    return unsupported();
  }

  // `TABS.slice(0, 3)`, `DATA.concat(MORE)` — the story narrowing its own data. Evaluated on the
  // encoded array, so only the methods above are reachable and none of them can run story code.
  if (ts.isCallExpression(expression) && ts.isPropertyAccessExpression(expression.expression)) {
    const method = PURE_ARRAY_METHODS[expression.expression.name.text];
    const target = method === undefined ? undefined : encodeValue(expression.expression.expression, source, scope, seen);
    if (method !== undefined && Array.isArray(target)) {
      const args = expression.arguments.map((argument) => encodeValue(argument, source, scope, seen));
      const result = method(target, args);
      if (result !== undefined) return result;
    }
    return unsupported();
  }

  return unsupported();
}

function encodeObject(expression: ts.ObjectLiteralExpression, source: ts.SourceFile, scope: Map<string, ts.Expression>, seen: ReadonlySet<string>): Value {
  // `Value | undefined`: an object literal can hold `{ heading: undefined }`, which is data about
  // the merge rather than a value. The cast on return is safe because `normalizeArgs` drops them.
  const object: Record<string, Value | undefined> = {};
  for (const property of expression.properties) {
    if (ts.isSpreadAssignment(property)) {
      const spread = encodeValue(property.expression, source, scope, seen);
      if (typeof spread !== 'object' || spread === null || Array.isArray(spread) || isUnsupported(spread)) {
        return { $unsupported: expression.getText(source) };
      }
      Object.assign(object, spread);
      continue;
    }
    if (ts.isShorthandPropertyAssignment(property)) {
      object[property.name.text] = encodeValue(property.name, source, scope, seen);
      continue;
    }
    if (!ts.isPropertyAssignment(property)) {
      // A method or accessor: code, and named, so it can be reported rather than swallowed.
      object[property.name?.getText(source) ?? '?'] = { $unsupported: property.getText(source) };
      continue;
    }
    const name = property.name;
    const key = ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)
      ? name.text
      : ts.isComputedPropertyName(name)
        ? encodeValue(name.expression, source, scope, seen)
        : undefined;
    if (typeof key !== 'string' && typeof key !== 'number') return { $unsupported: expression.getText(source) };
    // Present-but-undefined, not deleted: the key still has to beat the meta's value when the two
    // arg sets merge. `normalizeArgs` is what turns it back into an absent property.
    object[String(key)] = isUndefinedExpression(property.initializer) ? undefined : encodeValue(property.initializer, source, scope, seen);
  }
  return object as Record<string, Value>;
}

/** A JSX node as an element descriptor. A fragment is an element named `Fragment`. */
function encodeJsx(node: ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment, source: ts.SourceFile, scope: Map<string, ts.Expression>, seen: ReadonlySet<string>): Value {
  const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxFragment(node) ? undefined : node;
  const tag = opening === undefined ? 'Fragment' : opening.tagName.getText(source);
  const props: Record<string, Value> = {};
  if (opening !== undefined) {
    for (const attribute of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(attribute)) {
        const spread = encodeValue(attribute.expression, source, scope, seen);
        if (typeof spread !== 'object' || spread === null || Array.isArray(spread) || isUnsupported(spread)) {
          return { $unsupported: node.getText(source) };
        }
        Object.assign(props, spread);
        continue;
      }
      const name = attribute.name.getText(source);
      const value = attribute.initializer;
      if (value === undefined) props[name] = true; // `<input disabled />`
      else if (ts.isStringLiteral(value)) props[name] = value.text;
      else if (ts.isJsxExpression(value)) props[name] = value.expression === undefined ? true : encodeValue(value.expression, source, scope, seen);
      else props[name] = encodeValue(value, source, scope, seen);
    }
  }

  const children: Value[] = [];
  for (const child of ts.isJsxSelfClosingElement(node) ? [] : node.children) {
    if (ts.isJsxText(child)) {
      // JSX drops whitespace-only text between elements and collapses the indentation around it,
      // the same way the compiler does — otherwise every descriptor carries its own source layout.
      if (child.containsOnlyTriviaWhiteSpaces) continue;
      children.push(child.text.replace(/\s*\n\s*/g, ' '));
    } else if (ts.isJsxExpression(child)) {
      if (child.expression === undefined) continue; // `{/* a comment */}`
      const value = encodeValue(child.expression, source, scope, seen);
      if (Array.isArray(value)) children.push(...value);
      else children.push(value);
    } else {
      children.push(encodeJsx(child, source, scope, seen));
    }
  }
  return { $element: tag, props, children };
}

/** `{ args: … }` off a `meta` or a story object, encoded. Absent args are an empty set, not an error. */
function argsOf(object: ts.Expression | undefined, source: ts.SourceFile, scope: Map<string, ts.Expression>): Record<string, Value | undefined> {
  if (object === undefined) return {};
  const expression = unwrap(object);
  if (!ts.isObjectLiteralExpression(expression)) return {};
  for (const property of expression.properties) {
    if (ts.isPropertyAssignment(property) && property.name.getText(source) === 'args') {
      const encoded = encodeValue(property.initializer, source, scope);
      if (typeof encoded === 'object' && encoded !== null && !Array.isArray(encoded) && !isUnsupported(encoded)) {
        return encoded as Record<string, Value>;
      }
      return {};
    }
  }
  return {};
}

/**
 * The merged args exactly as the JSON will hold them.
 *
 * A round-trip rather than a walk: the file is the contract with the website, so the in-memory
 * value and the written one must not be able to disagree. It also drops the present-but-undefined
 * keys that `encodeObject` leaves behind to win the merge, which is what makes
 * `args: { heading: undefined }` mean "no heading" rather than "the meta's heading".
 */
export function normalizeArgs(args: Record<string, Value | undefined>): Record<string, Value> {
  return JSON.parse(JSON.stringify(args)) as Record<string, Value>;
}

/** One named export of a story module, before the manifest says whether it is a story. */
export interface StoryExport {
  /** The export name, which is how the manifest identifies it. */
  exportName: string;
  /** The story's own args merged over the meta's — Storybook's precedence. */
  args: Record<string, Value>;
  /** The whole `export const … ;` statement, verbatim. */
  sourceText: string;
}

/**
 * The named exports beside `export default meta`, in source order.
 *
 * The default export is followed to its declaration for the meta args every story inherits; a module
 * whose default is not a resolvable object literal simply contributes no shared args, because a
 * missing `args` block is a story that passes none, not a broken module.
 */
export function parseStories(fileName: string, text: string): StoryExport[] {
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const scope = moduleScope(source);

  let metaArgs: Record<string, Value | undefined> = {};
  for (const statement of source.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals === true) continue;
    const target = unwrap(statement.expression);
    metaArgs = argsOf(ts.isIdentifier(target) ? scope.get(target.text) : target, source, scope);
  }

  const exports: StoryExport[] = [];
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue;
      exports.push({
        exportName: declaration.name.text,
        args: normalizeArgs({ ...metaArgs, ...argsOf(declaration.initializer, source, scope) }),
        // The statement, not the declaration: a reader wants `export const Disabled: Story = {…};`,
        // which is what they would find in the story module itself.
        sourceText: statement.getText(source),
      });
    }
  }
  return exports;
}

/* ------------------------------------------------------------------ the run */

/** `Name` for every `packages/react/src/<Name>.stories.tsx`, sorted. */
export function storyModules(directory: string): string[] {
  if (!existsSync(directory)) throw new ExamplesError(`${directory} missing — there are no stories to read`);
  return readdirSync(directory)
    .filter((file) => file.endsWith('.stories.tsx'))
    .map((file) => file.slice(0, -'.stories.tsx'.length))
    .sort();
}

/**
 * The examples for one module: every named export the manifest knows as a story, with its id.
 *
 * The manifest decides what counts. An export it does not list is either not a story or a story
 * added since the last `storybook build`; both are the same mistake to ship (an example the docs
 * site would show that Storybook would not), so both are an error naming the rebuild.
 */
export function examplesFor(name: string, exports: StoryExport[], stories: Map<string, ManifestStory>): Example[] {
  const importPath = `./src/${name}.stories.tsx`;
  const examples: Example[] = [];
  for (const story of exports) {
    const entry = stories.get(`${importPath}#${story.exportName}`);
    if (entry === undefined) {
      throw new ExamplesError(
        `${name}.stories.tsx exports \`${story.exportName}\`, which storybook-static/index.json does not list — rebuild it with \`${BUILD_COMMAND}\``,
      );
    }
    examples.push({ title: entry.name, args: story.args, sourceText: story.sourceText, storyId: entry.id });
  }
  if (examples.length === 0) throw new ExamplesError(`${name}.stories.tsx exports no stories — the docs page would have nothing to show`);
  // website-plan.md's floor, and the gate's: a component page always has a default example.
  if (!examples.some((example) => example.title === 'Default')) {
    throw new ExamplesError(`${name}.stories.tsx has no \`Default\` story — every component page opens on one`);
  }
  return examples;
}

/** The bytes of one `<Name>.json`: deterministic, so re-running on unchanged stories is a no-op. */
export function render(examples: Example[]): string {
  return JSON.stringify(examples, null, 2) + '\n';
}

/** Every `{ $unsupported }` in a value, as `path -> source`, for `--report`. */
export function unsupportedIn(value: Value, path = ''): [string, string][] {
  if (typeof value !== 'object' || value === null) return [];
  if (isUnsupported(value)) return [[path, value.$unsupported]];
  if (Array.isArray(value)) return value.flatMap((item, index) => unsupportedIn(item, `${path}[${index}]`));
  return Object.entries(value).flatMap(([key, item]) => unsupportedIn(item, path === '' ? key : `${path}.${key}`));
}

function relToRoot(file: string): string {
  return relative(paths.ROOT, file).replaceAll(sep, '/');
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let check = false;
  let report = false;
  for (const arg of argv) {
    if (arg === '--check') check = true;
    else if (arg === '--report') report = true;
    else if (arg === '-h' || arg === '--help') {
      process.stdout.write(
        'usage: docs_examples.ts [--check] [--report]\n\n' +
          'Writes generated/examples/<Name>.json from packages/react/src/*.stories.tsx and\n' +
          'packages/react/storybook-static/index.json.\n',
      );
      return 0;
    } else {
      process.stderr.write(`docs_examples.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }

  const written = new Map<string, string>();
  let total = 0;
  const gaps: string[] = [];
  try {
    if (!existsSync(paths.INDEX)) {
      throw new ExamplesError(`${relToRoot(paths.INDEX)} missing — build Storybook first: \`${BUILD_COMMAND}\``);
    }
    const stories = manifestStories(JSON.parse(readText(paths.INDEX)));
    for (const name of storyModules(paths.STORIES)) {
      const file = join(paths.STORIES, `${name}.stories.tsx`);
      const examples = examplesFor(name, parseStories(file, readText(file)), stories);
      written.set(join(paths.OUT, `${name}.json`), render(examples));
      total += examples.length;
      for (const example of examples) {
        for (const [path, text] of unsupportedIn(example.args)) {
          gaps.push(`${name}/${example.title}: ${path} = ${text.replace(/\s+/g, ' ').slice(0, 100)}`);
        }
      }
    }
  } catch (e) {
    if (!(e instanceof ExamplesError)) throw e;
    process.stderr.write(`✖ ${e.message}\n`);
    return 1;
  }

  const out = relToRoot(paths.OUT);
  if (check) {
    const stale: string[] = [];
    for (const [file, text] of written) {
      if (!existsSync(file)) stale.push(`${relToRoot(file)} is missing`);
      else if (readText(file) !== text) stale.push(`${relToRoot(file)} is stale`);
    }
    for (const extra of existsSync(paths.OUT) ? readdirSync(paths.OUT) : []) {
      if (extra.endsWith('.json') && !written.has(join(paths.OUT, extra))) stale.push(`${out}/${extra} has no story module`);
    }
    if (stale.length === 0) {
      process.stdout.write(`✔ ${out}/ is current (${written.size} components, ${total} examples)\n`);
      return 0;
    }
    process.stderr.write(`✖ ${stale.join('\n✖ ')}\n✖ run \`pnpm docs:examples\`\n`);
    return 1;
  }

  mkdirSync(paths.OUT, { recursive: true });
  for (const [file, text] of written) {
    if (!existsSync(file) || readText(file) !== text) writeTextAtomic(file, text);
  }
  // A renamed or deleted story module must not leave a page's examples behind for the website to
  // keep rendering — the directory is the output, not the individual files.
  for (const extra of readdirSync(paths.OUT)) {
    if (extra.endsWith('.json') && !written.has(join(paths.OUT, extra))) rmSync(join(paths.OUT, extra));
  }

  if (report && gaps.length > 0) process.stdout.write(`${gaps.map((gap) => `  · ${gap}`).join('\n')}\n`);
  const note = gaps.length === 0 ? '' : `, ${gaps.length} arg${gaps.length === 1 ? '' : 's'} not encodable${report ? '' : ' (--report lists them)'}`;
  process.stdout.write(`✔ examples: ${total} stories across ${written.size} components${note} → ${out}/\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
