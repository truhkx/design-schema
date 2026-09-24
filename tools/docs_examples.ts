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
 * Two sources:
 *
 * 1. `packages/react/src/<Name>.stories.tsx` — read twice, because a story has two halves. Everything
 *    about how it is *written* (whether it has a `render` or `decorators`, its source text, which
 *    args it sets itself) is parsed with the TypeScript compiler API. Its `args` *values* are
 *    evaluated: the module is imported in a child process by ./story_args.ts, and each named export's
 *    `args` is read merged over the meta's (Storybook's own precedence). A parse cannot call
 *    `slides(['Product 1', …])`, and a Carousel example without its slides is two arrow buttons
 *    around a 0px track — see ./story_args.ts for why that is the whole reason the second read exists.
 *    Where the modules cannot be evaluated (no `packages/react/node_modules` beside them, which is
 *    the tool's own tests in a sandbox) the parse's own encoding of the args stands in.
 * 2. `packages/react/storybook-static/index.json` — the manifest `storybook build` writes, which
 *    is where `storyId` comes from. Storybook's ID algorithm (title + export name, sluggified, with
 *    its own collision rules) is Storybook's to change; re-deriving it here would produce deep links
 *    that break quietly. Each export is matched by `importPath` + `exportName`, and the id is read
 *    off the manifest entry. Build it with `pnpm --filter @design-schema/react build-storybook`.
 *
 * Writes `generated/examples/<Name>.json`:
 *
 *   { "layout": "scenarios",
 *     "platforms": { "react": true, "lit": true, "rn": true, "swift": false },
 *     "harnessEvents": null, "floating": false,
 *     "examples": [{ "title": "Default", "args": {...},
 *                    "snippets": { "react": "import { Button } …", "lit": "<ds-button …>", "rn": "…", "swift": null },
 *                    "stories": { "react": "Default", "lit": "Default", "rn": "Default", "swift": null },
 *                    "storyId": "button-react--default", "sweep": null, "decorated": false, "harness": null,
 *                    "primary": true }, …] }
 *
 * `harness`, `harnessEvents` and `floating` are for components with a boolean `open`. For overlays a
 * consumer opens from elsewhere (Dialog, BottomSheet) the page renders a button that opens the example
 * and wires the listed events to close it; for ones with an opener of their own (Menu, Select,
 * Disclosure) it only holds the state — see `harnessOf`. Stories titled `Closed` or `Keyboard` are
 * Storybook's and are not projected at all (`SITE_EXCLUDED_TITLES`), and neither are a floating
 * component's `Open` stories (`OPEN_TITLES`).
 *
 * `snippets` is the copy/paste code for each platform, rendered by ./docs_snippets.ts from that
 * platform's own story module (`packages/{react,rn}/src/<Name>.stories.tsx`,
 * `packages/lit/src/<Name>.stories.ts`) and, for SwiftUI, from the `#Preview`s of
 * `packages/swiftui/Sources/DesignSchema/<Name>.swift` once generation writes it. `stories` names the
 * export each snippet came from. `platforms` is whether each platform has that source at all, so the
 * page can tell "not generated for iOS yet" from "no story for this scenario".
 *
 * `layout`, `sweep` and `primary` are how the page presents the set, decided here from the stories
 * and `generated/components.json` so the island renders a layout rather than re-deriving one:
 *
 *   - `sweep` is the one prop a story sets, when it sets exactly one enum or boolean prop (copy props
 *     like `label` aside) and no code — `SizeXl: { args: { size: 'xl' } }` is `{ prop: 'size', value: 'xl' }`.
 *   - `layout` is `sweep` when most stories but Default are one, and the component is typography: a type
 *     sample reads the same in a small tile as in a full panel, where a layout wrapper (Box, Container)
 *     is shown by the room it takes and a control (Toolbar) by the width it has to overflow. The page
 *     renders a sweep as one small-multiple grid. Everything else is `scenarios`, and renders as tabs.
 *   - `primary` marks the tabs a `scenarios` page shows before its "More examples" disclosure. See
 *     `MAX_TABS`.
 *
 * `args` is JSON, because the website renders it in a React island built from the JSON alone — the
 * examples must work with every Storybook instance unreachable. Primitives, arrays and objects are
 * themselves; a React element is a `{ "$element", "props", "children" }` descriptor the island
 * rebuilds with `createElement`.
 *
 * What is genuinely code — a function prop: a column's `validate`, a `formatValue` — is encoded as
 * `{ "$unsupported": "<name>" }` and dropped by the island. That is deliberate: the entry stays
 * honest about what it could not carry rather than omitting the story, the example still renders (a
 * `render` callback missing from a Table column means a plain cell, not a blank page), and the
 * snippet beside it shows the reader the real thing. The island does draw a line at an example whose
 * *content* is what went missing — see apps/website/src/components/Examples.tsx. `--report` lists
 * every marker, and every scenario a Lit or RN story does not cover.
 *
 * The parse's own encoder (`encodeValue`) is the fallback for a directory whose modules cannot be
 * imported, and covers the two shapes a story module reaches for most: module-level `const`s
 * referenced by name (`args: { columns: COLUMNS }`) and inline JSX. It encodes anything else —
 * including the helper calls the evaluation exists to resolve — as `{ "$unsupported": "<source>" }`.
 *
 * Usage:  node tools/docs_examples.ts [--check] [--report]
 *
 * Runs under tsx.
 */
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// TypeScript 7 ships no JS API, so the parse uses the 6.x compiler the site and apps/website
// already alias for the same reason (see site/package.json).
import ts from 'typescript6';

import {
  exampleCode,
  litProperties,
  parseStoryModule,
  swiftPreviews,
  type ExampleCode,
  type Platform,
  type PlatformSources,
  type SnippetOptions,
  type SnippetSources,
  type Snippets,
} from './docs_snippets.ts';
import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { evaluateStoryArgs, StoryArgsError } from './story_args.ts';

/** Every path the tool reads or writes. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  STORIES: join(REPO_ROOT, 'packages', 'react', 'src'),
  /** Lit's and React Native's own story modules, for their snippets. Absent is "no stories on that platform". */
  LIT_STORIES: join(REPO_ROOT, 'packages', 'lit', 'src'),
  RN_STORIES: join(REPO_ROOT, 'packages', 'rn', 'src'),
  /** Where generation writes `<Name>.swift`. Its presence, per component, is what turns the Swift tab on. */
  SWIFT: join(REPO_ROOT, 'packages', 'swiftui', 'Sources', 'DesignSchema'),
  INDEX: join(REPO_ROOT, 'packages', 'react', 'storybook-static', 'index.json'),
  COMPONENTS: join(REPO_ROOT, 'generated', 'components.json'),
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

/** The one prop a story varies, and the value it sets it to. */
export interface Sweep {
  prop: string;
  value: string | boolean;
}

/** How a component page lays its examples out: one small-multiple grid, or tabs. */
export type Layout = 'sweep' | 'scenarios';

/**
 * Whether the page has to supply what opens the example. `trigger`: the component is an overlay the
 * consumer opens from elsewhere — it has a boolean `open`, a close event, and no opener of its own — so
 * a story's `open: true` is Storybook's fixture, not something a page can mount. `state`: the
 * component has a boolean `open` and its own opener (Menu's trigger, Select's field, Disclosure's
 * summary), so the page adds no button and only owns the state the story's `open` would have pinned.
 * See `harnessOf`.
 */
export type Harness = 'trigger' | 'state' | null;

/** Which of a harnessed component's events the page's harness listens to. See `harnessEventsOf`. */
export interface HarnessEvents {
  /** Request-phase events: the consumer is asked to close, and the harness does (Dialog `onClose`, AlertDialog `onConfirm`). */
  close: string[];
  /** Events whose first argument is the new boolean `open` (SidePanel `onOpenChange`), which the harness applies as given. */
  change: string[];
}

/** One story, as the website reads it. */
export interface Example {
  /** Storybook's own display name for the story ("Heading Level 2"), the tab's label. */
  title: string;
  /** The story's args merged over the meta's — what Storybook renders it with. */
  args: Record<string, Value>;
  /** Copy/paste code per platform, each from that platform's own stories — see ./docs_snippets.ts. */
  snippets: Snippets;
  /** The story export (or SwiftUI preview) each snippet was rendered from. */
  stories: SnippetSources;
  /** The id Storybook assigned, read from its manifest. Never derived here. */
  storyId: string;
  /** The single enum or boolean prop this story sets, or `null` when it is a scenario rather than a step. */
  sweep: Sweep | null;
  /**
   * Whether the story wraps the component in `decorators` — a background, a width — that the website
   * cannot run. A grid tile shows such a story's source instead of a render stripped of its frame
   * (Text's `ToneOnAction` is white text, and without its action background it is white on white).
   */
  decorated: boolean;
  /** The component's `Harness`, which the page renders around this example instead of the story's own `open`. */
  harness: Harness;
  /** Whether the tab is in the always-visible set rather than behind "More examples". */
  primary: boolean;
}

/** One `<Name>.json`. */
export interface ExampleSet {
  layout: Layout;
  /** Whether each platform has source for this component at all: a story module, or the generated Swift view. */
  platforms: Record<Platform, boolean>;
  /** The events a harness wires, or `null` when the component has no harness. */
  harnessEvents: HarnessEvents | null;
  /**
   * Whether a harnessed component's open state is a panel above the page rather than part of it —
   * see `floatingOf`. A floating `state` example starts closed; an inline one (Disclosure) starts
   * where its story says. Always `false` without a harness.
   */
  floating: boolean;
  examples: Example[];
}

/** A component as `generated/components.json` holds it, narrowed to what the layout and snippets read. */
export interface ComponentInfo {
  category: string;
  props: Record<string, { type: string; default?: unknown }>;
  /** Absent reads as `null`: the tests' components are not overlays. */
  harness?: Harness;
  harnessEvents?: HarnessEvents | null;
  /** Absent reads as `false`. See `ExampleSet.floating`. */
  floating?: boolean;
}

/** Where an example's code comes from. The tests' default is React-only with no snippets. */
export interface CodeSource {
  platforms: Record<Platform, boolean>;
  forStory(exportName: string, title: string): ExampleCode;
}

const NO_CODE: CodeSource = {
  platforms: { react: true, lit: false, rn: false, swift: false },
  forStory: () => ({
    snippets: { react: null, lit: null, rn: null, swift: null },
    stories: { react: null, lit: null, rn: null, swift: null },
    problems: [],
  }),
};

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
  /** The arg keys the story sets itself, before the merge — including ones it sets to `undefined`. */
  set: string[];
  /** Whether the story carries code this tool cannot see through: `render`, `play`, a spread. */
  code: boolean;
  /** Whether the story has `decorators`. */
  decorated: boolean;
}

/** Story keys that make the story more than "the component with these args". */
const STORY_CODE_KEYS: ReadonlySet<string> = new Set(['render', 'play', 'loaders', 'beforeEach']);

/** An object literal member's key as written, or `undefined` for a spread or a computed key. */
function keyOf(property: ts.ObjectLiteralElementLike): string | undefined {
  if (ts.isSpreadAssignment(property)) return undefined;
  const name = property.name;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return undefined;
}

/**
 * What a story object sets itself, before the merge. A story that is not an object literal
 * (`Template.bind({})`) or spreads one in is `code`: there is no telling what it sets.
 */
function storyShape(initializer: ts.Expression | undefined): Pick<StoryExport, 'set' | 'code' | 'decorated'> {
  const shape = { set: [] as string[], code: false, decorated: false };
  const expression = initializer === undefined ? undefined : unwrap(initializer);
  if (expression === undefined || !ts.isObjectLiteralExpression(expression)) return { ...shape, code: true };
  for (const property of expression.properties) {
    const key = keyOf(property);
    if (key === undefined || STORY_CODE_KEYS.has(key)) shape.code = true;
    if (key === 'decorators') shape.decorated = true;
    if (key !== 'args') continue;
    const args = ts.isPropertyAssignment(property) ? unwrap(property.initializer) : undefined;
    if (args === undefined || !ts.isObjectLiteralExpression(args)) {
      shape.code = true;
      continue;
    }
    for (const arg of args.properties) {
      const name = keyOf(arg);
      if (name === undefined) shape.code = true;
      else shape.set.push(name);
    }
  }
  return shape;
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
        ...storyShape(declaration.initializer),
      });
    }
  }
  return exports;
}

/**
 * The parsed exports with their `args` replaced by the evaluated ones.
 *
 * Only `args`. Everything else a `StoryExport` carries — `set`, `code`, `decorated` — is a fact about
 * how the story is written, which the parse is the right reader for and a running module has thrown
 * away: a story that sets `label` and one that inherits it from the meta have the same value at
 * runtime, and only one of them is a step in a sweep.
 *
 * An export the evaluation has no entry for keeps the parse's args. That is a story whose module
 * exported something other than an object, which the manifest will not list as a story anyway.
 */
export function withRuntimeArgs(exports: StoryExport[], evaluated: Map<string, Record<string, Value>> | undefined): StoryExport[] {
  if (evaluated === undefined) return exports;
  return exports.map((story) => {
    const args = evaluated.get(story.exportName);
    return args === undefined ? story : { ...story, args: normalizeArgs(args) };
  });
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
export function examplesFor(
  name: string,
  exports: StoryExport[],
  stories: Map<string, ManifestStory>,
  component: ComponentInfo,
  code: CodeSource = NO_CODE,
): ExampleSet & { problems: string[] } {
  const importPath = `./src/${name}.stories.tsx`;
  const examples: Example[] = [];
  const problems: string[] = [];
  for (const story of exports) {
    const entry = stories.get(`${importPath}#${story.exportName}`);
    if (entry === undefined) {
      throw new ExamplesError(
        `${name}.stories.tsx exports \`${story.exportName}\`, which storybook-static/index.json does not list — rebuild it with \`${BUILD_COMMAND}\``,
      );
    }
    if (SITE_EXCLUDED_TITLES.has(entry.name)) continue;
    if (component.floating === true && (component.harness ?? null) !== null && OPEN_TITLES.has(entry.name)) continue;
    const { snippets, stories: from, problems: gaps } = code.forStory(story.exportName, entry.name);
    problems.push(...gaps.map((gap) => `${name}/${entry.name}: ${gap}`));
    examples.push({
      title: entry.name,
      args: story.args,
      snippets,
      stories: from,
      storyId: entry.id,
      sweep: sweepOf(story, component),
      decorated: story.decorated,
      harness: component.harness ?? null,
      primary: true,
    });
  }
  if (examples.length === 0) throw new ExamplesError(`${name}.stories.tsx exports no stories — the docs page would have nothing to show`);
  // website-plan.md's floor, and the gate's: a component page always has a default example.
  if (!examples.some((example) => example.title === 'Default')) {
    throw new ExamplesError(`${name}.stories.tsx has no \`Default\` story — every component page opens on one`);
  }
  const layout = layoutOf(component, examples);
  const primary = primaryFlags(layout, examples);
  return {
    layout,
    platforms: code.platforms,
    harnessEvents: (component.harness ?? null) !== null ? (component.harnessEvents ?? null) : null,
    floating: (component.harness ?? null) !== null && component.floating === true,
    examples: examples.map((example, index) => ({ ...example, primary: primary[index] === true })),
    problems,
  };
}

/**
 * Story titles Storybook keeps and the docs site does not.
 *
 * `Closed` is an overlay rendered shut — on a page, an empty card; the harness already shows the
 * closed state, which is the button. `Keyboard` is the keyboard gate's fixture (open, with enough
 * focusable children to walk), there for the gate's play and not for a reader. Both stay in
 * Storybook, and in the manifest check above: an excluded story still has to exist there.
 */
export const SITE_EXCLUDED_TITLES: ReadonlySet<string> = new Set(['Closed', 'Keyboard']);

/**
 * Story titles a harnessed floating component (see `floatingOf`) keeps in Storybook and not on the
 * site. The page starts every floating panel closed, so a story that exists to show it open renders
 * the same closed trigger as its neighbour (`Open` beside `Default`, `Disabled Open` beside
 * `Disabled`). Placement stories stay: their trigger opens the panel where the story says.
 */
export const OPEN_TITLES: ReadonlySet<string> = new Set(['Open', 'Disabled Open']);

/** A package's name from its manifest beside `src/`, or the workspace's own name when the sandbox has none. */
function packageName(sourceDirectory: string, fallback: string): string {
  const manifest = join(dirname(sourceDirectory), 'package.json');
  if (!existsSync(manifest)) return fallback;
  const name = (JSON.parse(readText(manifest)) as { name?: unknown }).name;
  return typeof name === 'string' ? name : fallback;
}

/** The names a package's `src/index.ts` exports, or `undefined` when it cannot say (no index, or an `export *`). */
function packageExports(sourceDirectory: string): ReadonlySet<string> | undefined {
  const index = join(sourceDirectory, 'index.ts');
  if (!existsSync(index)) return undefined;
  const names = new Set<string>();
  for (const statement of ts.createSourceFile(index, readText(index), ts.ScriptTarget.Latest, false).statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    const clause = statement.exportClause;
    if (clause === undefined || !ts.isNamedExports(clause)) return undefined;
    for (const element of clause.elements) names.add(element.name.text);
  }
  return names;
}

/** The facts every component's snippets share, read once per run. */
export function snippetOptions(): SnippetOptions {
  const exports: SnippetOptions['exports'] = {};
  for (const [platform, directory] of [['react', paths.STORIES], ['lit', paths.LIT_STORIES], ['rn', paths.RN_STORIES]] as const) {
    const names = packageExports(directory);
    if (names !== undefined) exports[platform] = names;
  }
  return {
    packages: {
      react: packageName(paths.STORIES, '@design-schema/react'),
      lit: packageName(paths.LIT_STORIES, '@design-schema/lit'),
      rn: packageName(paths.RN_STORIES, '@design-schema/rn'),
    },
    exports,
    litProperties: litProperties(paths.LIT_STORIES),
    copyTypes: COPY_TYPES,
  };
}

/** One component's code sources: its React stories (already read) and whatever the other platforms have. */
export function codeSource(name: string, reactText: string, component: ComponentInfo, options: SnippetOptions): CodeSource {
  const read = (file: string) => (existsSync(file) ? readText(file) : undefined);
  const litText = read(join(paths.LIT_STORIES, `${name}.stories.ts`));
  const rnText = read(join(paths.RN_STORIES, `${name}.stories.tsx`));
  const swiftText = read(join(paths.SWIFT, `${name}.swift`));
  const sources: PlatformSources = {
    react: parseStoryModule(`${name}.stories.tsx`, reactText),
    lit: litText === undefined ? null : parseStoryModule(`${name}.stories.ts`, litText),
    rn: rnText === undefined ? null : parseStoryModule(`${name}.stories.tsx`, rnText),
    swift: swiftText === undefined ? null : swiftPreviews(swiftText),
  };
  return {
    platforms: { react: true, lit: sources.lit !== null, rn: sources.rn !== null, swift: sources.swift !== null },
    forStory: (exportName, title) => exampleCode(exportName, title, sources, component, options),
  };
}

/* ------------------------------------------------------------------ the layout */

/** Prop types that are copy rather than configuration: `VariantDanger` relabelling its button "Delete file" is still a variant. */
const COPY_TYPES: ReadonlySet<string> = new Set(['string', 'content']);

/**
 * The one prop a story steps through, or `null` when the story is a scenario.
 *
 * Read off what the story sets itself rather than off a diff of the merged args: `Level2` sets
 * `level: '2'`, which is also the meta's value, and is still a step in the level sweep.
 */
export function sweepOf(story: StoryExport, component: ComponentInfo): Sweep | null {
  if (story.code) return null;
  const typeOf = (prop: string): string | undefined => (Object.hasOwn(component.props, prop) ? component.props[prop]?.type : undefined);
  const configured = story.set.filter((prop) => !COPY_TYPES.has(typeOf(prop) ?? ''));
  if (configured.length !== 1) return null;
  const prop = configured[0] as string;
  const value = story.args[prop];
  if (typeOf(prop) === 'enum' && typeof value === 'string') return { prop, value };
  if (typeOf(prop) === 'boolean' && typeof value === 'boolean') return { prop, value };
  return null;
}

/**
 * Categories whose sweeps can be shown as small multiples. Typography only: a type sample reads the
 * same in a tile as in a panel. Box and Container sweeps are all single props too, but they are shown
 * by the space they take (and `element: main` twenty times over is twenty main landmarks), and a
 * Toolbar's overflow sweep needs the width it overflows.
 */
export const SWEEP_CATEGORIES: ReadonlySet<string> = new Set(['typography']);

/**
 * `sweep` when a tileable component's stories are mostly prop steps.
 *
 * It was "every story but Default" until the docs grew scenarios: Text is 21 steps beside four
 * (Body Copy, Caption, Inline Error Wording, Truncate Inline) and Heading 17 beside one
 * (Subsection Sized Up), each setting two props rather than one, so each was a single story that
 * turned a 21-tile type specimen into a 25-tab strip. A grid is the right reading for a set that is
 * overwhelmingly steps, so the minority rides along: the renderer already groups a story with no
 * sweep under "Default" and captions it with whatever tokens its own args resolve.
 */
export function layoutOf(component: ComponentInfo, examples: readonly Pick<Example, 'title' | 'sweep'>[]): Layout {
  if (!SWEEP_CATEGORIES.has(component.category)) return 'scenarios';
  const steps = examples.filter((example) => example.title !== 'Default');
  const swept = steps.filter((example) => example.sweep !== null);
  return swept.length > steps.length - swept.length ? 'sweep' : 'scenarios';
}

/**
 * The most tabs a page shows in one strip before it splits into a primary set and "More examples".
 *
 * Checked against the dense pages rather than picked: at desktop width the docs column holds about
 * eight of Storybook's own titles ("Variant Secondary", "Selectable Range") in one row, and the
 * horizontal strip scrolls with its scrollbar hidden — a tab past the edge is a tab nobody sees.
 * Button (15), Select (15) and DataGrid (21) all overflowed it; the gate measures the split strip.
 */
export const MAX_TABS = 8;

/** The tabs a split strip keeps in view, Default included. */
export const PRIMARY_TABS = 6;

/**
 * Which examples stay in the tab strip.
 *
 * Everything, when the set fits or is a grid. Otherwise Default plus the first scenarios in story
 * order: a story that sets a boolean (`Disabled`, `Loading`) or several props is a distinct situation
 * a reader looks for, while a step along an enum (`Size Sm`, `Size Md`, `Size Lg`) is volume, and is
 * what goes behind the disclosure. Nothing is dropped — the rest is one click away.
 */
export function primaryFlags(layout: Layout, examples: readonly Pick<Example, 'title' | 'sweep'>[]): boolean[] {
  if (layout === 'sweep' || examples.length <= MAX_TABS) return examples.map(() => true);
  let room = PRIMARY_TABS - 1;
  return examples.map((example) => {
    if (example.title === 'Default') return true;
    const scenario = example.sweep === null || typeof example.sweep.value === 'boolean';
    if (!scenario || room === 0) return false;
    room -= 1;
    return true;
  });
}

/** A component's schema, narrowed to what `harnessOf` reads. */
export interface OverlaySchema {
  props: Record<string, { type?: unknown; required?: unknown }>;
  events?: Record<string, { timing?: { phase?: unknown }; payload?: { name?: unknown; type?: unknown }[] }> | undefined;
  overlay?: { closeEvent?: unknown; anchor?: unknown } | undefined;
  form?: unknown;
  styles?: Record<string, unknown> | undefined;
  composition?: Record<string, unknown> | undefined;
}

/** The event names that close an overlay by convention, beside whatever `overlay.closeEvent` names. */
const CLOSE_EVENTS: readonly string[] = ['onClose', 'onOpenChange'];

/**
 * `trigger` when the page has to supply the opener, read off the schema rather than a list — so an
 * overlay added tomorrow gets a working example the day its docs page is built.
 *
 * Three facts, all required:
 *
 *   - a boolean `open` prop: there is a state to drive;
 *   - a close event — `onClose`, `onOpenChange`, or whatever `overlay.closeEvent` names (AlertDialog's
 *     is `onCancel`): there is a way for the harness to hear "close";
 *   - no opener of its own. A component anchored to a trigger (`overlay.anchor`: Popover, Menu,
 *     Tooltip), one that requires a `trigger` prop, or a form field whose control is the opener
 *     (Select, Combobox, DatePicker) already renders what a visitor presses; a second button beside
 *     it would be a second way to do one thing. SidePanel's `trigger` is optional, so it qualifies,
 *     and an example that passes one keeps it (the page's harness steps aside).
 *
 * Everything else with a boolean `open` it can drive is `state`: a component with an opener of its
 * own, or one with an event that reports the new `open` (Disclosure's `onToggle` — its summary is the
 * opener). The page adds no button there; it holds the `open` a story pins, so the component's own
 * trigger and dismissals work. Tooltip has an anchor and no event at all — `open` is for stories only,
 * and hover and focus are ignored while it is set — so its harness drops the story's `open` instead.
 */
export function harnessOf(component: OverlaySchema): Harness {
  if (component.props['open']?.type !== 'boolean') return null;
  const events = component.events ?? {};
  const closeEvent = component.overlay?.closeEvent;
  const closes = [...CLOSE_EVENTS, ...(typeof closeEvent === 'string' ? [closeEvent] : [])].some((event) => Object.hasOwn(events, event));
  const ownOpener = component.overlay?.anchor !== undefined || component.props['trigger']?.required === true || component.form !== undefined;
  if (closes && !ownOpener) return 'trigger';
  if (ownOpener || harnessEventsOf(component).change.length > 0) return 'state';
  return null;
}

/** Whether a schema paints on a layer above the page: an `overlay` block, or a style bound to a `layer.*` token. */
function layered(component: OverlaySchema): boolean {
  if (component.overlay !== undefined) return true;
  return Object.values(component.styles ?? {}).some((style) => {
    const token = (style as { token?: unknown } | null)?.token;
    return typeof token === 'string' && token.startsWith('layer.');
  });
}

/**
 * Whether a component's open state floats above the page, read off the schema: it has an `overlay`
 * block (Menu, Popover, Tooltip, the dialogs), its popup is bound to a `layer.*` token (Select's and
 * Combobox's `layer.dropdown`), or it composes a part from a component that does (DatePicker's
 * `popover` is a Popover). Disclosure is none of these: its panel is part of the page.
 */
export function floatingOf(component: OverlaySchema, schemas: ReadonlyMap<string, OverlaySchema>): boolean {
  if (layered(component)) return true;
  return Object.values(component.composition ?? {}).some((part) => {
    const name = typeof part === 'string' ? part : (part as { component?: unknown } | null)?.component;
    const composed = typeof name === 'string' ? schemas.get(name) : undefined;
    return composed !== undefined && layered(composed);
  });
}

/**
 * The events a harness wires, from the same schema: every request-phase event closes (the schema's
 * "the consumer performs it and closes" — Dialog `onClose`, AlertDialog `onConfirm` and `onCancel`,
 * ActionSheet `onAction`), and an event whose first argument is the boolean `open` is applied as given.
 */
export function harnessEventsOf(component: OverlaySchema): HarnessEvents {
  const close: string[] = [];
  const change: string[] = [];
  for (const [event, spec] of Object.entries(component.events ?? {})) {
    const first = spec.payload?.[0];
    if (first?.name === 'open' && first.type === 'boolean') change.push(event);
    else if (spec.timing?.phase === 'request') close.push(event);
  }
  return { close, change };
}

/** `generated/components.json`, by component name, narrowed to `ComponentInfo`. */
export function componentInfo(json: unknown): Map<string, ComponentInfo> {
  if (!Array.isArray(json)) throw new ExamplesError('generated/components.json is not an array — re-run `pnpm parse`');
  const schemas = new Map<string, OverlaySchema & { category: string }>();
  for (const entry of json as { component?: { name?: unknown; category?: unknown; props?: unknown } & Omit<OverlaySchema, 'props'> }[]) {
    const { name, category, props } = entry.component ?? {};
    if (typeof name !== 'string' || typeof category !== 'string' || typeof props !== 'object' || props === null) {
      throw new ExamplesError('generated/components.json has an entry without component.name/category/props — re-run `pnpm parse`');
    }
    schemas.set(name, { ...entry.component, category, props: props as OverlaySchema['props'] });
  }
  // A second pass: whether a component floats can depend on a component it composes.
  const components = new Map<string, ComponentInfo>();
  for (const [name, schema] of schemas) {
    const harness = harnessOf(schema);
    components.set(name, {
      category: schema.category,
      props: schema.props as ComponentInfo['props'],
      harness,
      harnessEvents: harness === null ? null : harnessEventsOf(schema),
      floating: harness !== null && floatingOf(schema, schemas),
    });
  }
  return components;
}

/** The bytes of one `<Name>.json`: deterministic, so re-running on unchanged stories is a no-op. */
export function render(set: ExampleSet): string {
  const { layout, platforms, harnessEvents, floating, examples } = set;
  return JSON.stringify({ layout, platforms, harnessEvents, floating, examples }, null, 2) + '\n';
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
          'packages/react/storybook-static/index.json, with each example\'s code read from the\n' +
          'React, Lit and React Native stories and any generated SwiftUI view.\n',
      );
      return 0;
    } else {
      process.stderr.write(`docs_examples.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
  }

  const written = new Map<string, string>();
  let total = 0;
  let grids = 0;
  const gaps: string[] = [];
  const snippetGaps: string[] = [];
  /** Story modules the evaluation could not import, which fell back to the parse. */
  const evaluated: string[] = [];
  const counts: Record<Platform, number> = { react: 0, lit: 0, rn: 0, swift: 0 };
  try {
    if (!existsSync(paths.INDEX)) {
      throw new ExamplesError(`${relToRoot(paths.INDEX)} missing — build Storybook first: \`${BUILD_COMMAND}\``);
    }
    if (!existsSync(paths.COMPONENTS)) {
      throw new ExamplesError(`${relToRoot(paths.COMPONENTS)} missing — run \`pnpm parse\` first`);
    }
    const stories = manifestStories(JSON.parse(readText(paths.INDEX)));
    const components = componentInfo(JSON.parse(readText(paths.COMPONENTS)));
    const options = snippetOptions();
    // The args, evaluated — see ./story_args.ts. One child process for the whole run, and `null`
    // where the modules cannot be imported, which is when the parse's own encoding stands in.
    const runtime = evaluateStoryArgs(paths.STORIES);
    evaluated.push(...(runtime?.problems ?? []));
    for (const name of storyModules(paths.STORIES)) {
      const file = join(paths.STORIES, `${name}.stories.tsx`);
      const component = components.get(name);
      if (component === undefined) {
        throw new ExamplesError(`${name}.stories.tsx has no component in generated/components.json — there is no page to put its examples on`);
      }
      const text = readText(file);
      const parsed = withRuntimeArgs(parseStories(file, text), runtime?.modules.get(name));
      const set = examplesFor(name, parsed, stories, component, codeSource(name, text, component, options));
      written.set(join(paths.OUT, `${name}.json`), render(set));
      total += set.examples.length;
      if (set.layout === 'sweep') grids += 1;
      snippetGaps.push(...set.problems);
      for (const example of set.examples) {
        for (const platform of Object.keys(counts) as Platform[]) if (example.snippets[platform] !== null) counts[platform] += 1;
        for (const [path, text] of unsupportedIn(example.args)) {
          gaps.push(`${name}/${example.title}: ${path} = ${text.replace(/\s+/g, ' ').slice(0, 100)}`);
        }
      }
    }
  } catch (e) {
    // A story module that will not evaluate is the same class of input problem as a missing manifest:
    // it is reported and the run stops, rather than quietly shipping examples built from the parse.
    if (!(e instanceof ExamplesError) && !(e instanceof StoryArgsError)) throw e;
    process.stderr.write(`✖ ${e.message}\n`);
    return 1;
  }

  // A single module that would not import: the rest of the run is still correct, and the one that
  // fell back to the parse is named rather than left to be noticed as a hollow example on the site.
  for (const problem of evaluated) process.stderr.write(`⚠ ${problem}\n`);

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
  if (report && snippetGaps.length > 0) process.stdout.write(`${snippetGaps.map((gap) => `  ◦ ${gap}`).join('\n')}\n`);
  const note = gaps.length === 0 ? '' : `, ${gaps.length} arg${gaps.length === 1 ? '' : 's'} not encodable${report ? '' : ' (--report lists them)'}`;
  process.stdout.write(`✔ examples: ${total} stories across ${written.size} components (${grids} as a sweep grid)${note} → ${out}/\n`);
  process.stdout.write(
    `  snippets: react ${counts.react}, lit ${counts.lit}, rn ${counts.rn}, swift ${counts.swift} of ${total}` +
      `${snippetGaps.length === 0 ? '' : `; ${snippetGaps.length} gap${snippetGaps.length === 1 ? '' : 's'}${report ? '' : ' (--report lists them)'}`}\n`,
  );
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
