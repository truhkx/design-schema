/**
 * Copy/paste code for the docs site's examples — one snippet per platform, per example (job 532).
 *
 * tools/docs_examples.ts decides *which* examples a component page shows, from the React stories.
 * This module decides what code sits beside each one, and it answers each platform from that
 * platform's own source:
 *
 *   - React    `packages/react/src/<Name>.stories.tsx`
 *   - RN       `packages/rn/src/<Name>.stories.tsx`
 *   - Lit      `packages/lit/src/<Name>.stories.ts`
 *   - SwiftUI  the `#Preview` blocks of `packages/swiftui/Sources/DesignSchema/<Name>.swift`, once
 *              generation has written that file. Until then there is no Swift snippet, and the page
 *              says so — nothing here writes Swift.
 *
 * Nothing is authored. A snippet is a story's own render — the story's `render`, the meta's, or
 * Storybook's implicit `<Component {...args} />` — with the story's args written into it, which is
 * the step that turns "what the story file contains" into "what you would paste into an app":
 *
 *   - `{...args}` becomes the props themselves, and `args.label` the value it stands for;
 *   - an arg the story only inherits from its meta, and that holds the prop's schema default, is left
 *     out — Default reads `<Button label="Save changes" />`, not eight props restating defaults —
 *     while an arg the story sets itself always stays, so "Size Md" still says `size="md"`;
 *   - decorators, `play`, Storybook's own imports and action args never appear;
 *   - the module-level helpers the snippet does use (a `const TABS`, a harness component) come along
 *     verbatim, and relative imports are rewritten to the package a consumer installs.
 *
 * A Lit story renders a lit-html template. When every binding in it resolves to a value, the snippet
 * is the HTML it renders — `<ds-button label="Save changes"></ds-button>` — with `?attr` bindings as
 * present-or-absent attributes and `.prop` bindings as the attribute the element declares for that
 * property. When one does not (an event listener, a property with no attribute, a callback this
 * module cannot evaluate), the snippet is the template as a Lit module with the args written in:
 * still the story's real code, never a guess at what it would have rendered.
 *
 * The other platforms' stories are matched to a React example by export name first — Storybook's
 * title *is* the export name, sentence-cased, on every platform — then by the configuration the story
 * sets: Lit's `Danger` and React's `VariantDanger` both set `variant: 'danger'`. No match is `null`,
 * and the page says there is no story for that scenario rather than showing a different one.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// TypeScript 7 ships no JS API; see tools/docs_examples.ts.
import ts from 'typescript6';

import { readText } from './lib/py.ts';

/** The platforms a component page offers code for, in the JSON's key order. */
export type Platform = 'react' | 'lit' | 'rn' | 'swift';
export const PLATFORMS: readonly Platform[] = ['react', 'lit', 'rn', 'swift'];

/** One example's code, per platform. `null` is "no source for this scenario on this platform". */
export type Snippets = Record<Platform, string | null>;
/** The story export (or SwiftUI preview) each snippet was rendered from — how a snippet traces back. */
export type SnippetSources = Record<Platform, string | null>;

/** A component as the snippets need it: each prop's type (for matching) and schema default (for eliding). */
export interface SnippetComponent {
  props: Record<string, { type: string; default?: unknown }>;
}

/** Per-platform facts read once per run. */
export interface SnippetOptions {
  /** The package name a relative story import is rewritten to. */
  packages: Record<Exclude<Platform, 'swift'>, string>;
  /** Each package's exported names, or `undefined` when its index could not be read (no export check). */
  exports: Partial<Record<Exclude<Platform, 'swift'>, ReadonlySet<string>>>;
  /** Lit: tag → property → the attribute it reflects to, `null` for `attribute: false`. */
  litProperties: LitProperties;
  /** Prop types that are copy, not configuration — ignored when matching stories by what they set. */
  copyTypes: ReadonlySet<string>;
}

export type LitProperties = ReadonlyMap<string, ReadonlyMap<string, string | null>>;

/* ------------------------------------------------------------------ a story module */

interface ImportBinding {
  module: string;
  kind: 'named' | 'default' | 'namespace';
  imported: string;
  typeOnly: boolean;
}

/** A story (or the meta), with any story objects it spreads already merged in. */
export interface StoryDef {
  args: Map<string, ts.Expression>;
  render: ts.Expression | undefined;
}

/** One story module, parsed. Never executed — see tools/docs_examples.ts for why. */
export interface StoryModule {
  source: ts.SourceFile;
  imports: Map<string, ImportBinding>;
  /** Top-level declarations by name, so a snippet can bring the helpers it references along. */
  declarations: Map<string, ts.Statement>;
  consts: Map<string, ts.Expression>;
  meta: StoryDef & { component: ts.Expression | undefined; name: string | undefined };
  /** Named exports, in source order. */
  stories: Map<string, StoryDef>;
}

/** Peels the wrappers that carry no value: `x as T`, `x satisfies T`, `(x)`, `x!`, `<T>x`. */
function unwrap(node: ts.Expression): ts.Expression {
  let current = node;
  for (;;) {
    if (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isTypeAssertionExpression(current)) current = current.expression;
    else if (ts.isParenthesizedExpression(current) || ts.isNonNullExpression(current)) current = current.expression;
    else return current;
  }
}

function isUndefinedExpression(node: ts.Expression): boolean {
  const expression = unwrap(node);
  return ts.isIdentifier(expression) && expression.text === 'undefined';
}

function memberName(name: ts.PropertyName): string | undefined {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : undefined;
}

export function parseStoryModule(fileName: string, text: string): StoryModule {
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
  const module: StoryModule = {
    source,
    imports: new Map(),
    declarations: new Map(),
    consts: new Map(),
    meta: { args: new Map(), render: undefined, component: undefined, name: undefined },
    stories: new Map(),
  };

  const exported: ts.VariableDeclaration[] = [];
  let metaExpression: ts.Expression | undefined;
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (clause === undefined || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const from = statement.moduleSpecifier.text;
      if (clause.name !== undefined) {
        module.imports.set(clause.name.text, { module: from, kind: 'default', imported: 'default', typeOnly: clause.isTypeOnly });
      }
      const bindings = clause.namedBindings;
      if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
        module.imports.set(bindings.name.text, { module: from, kind: 'namespace', imported: '*', typeOnly: clause.isTypeOnly });
      } else if (bindings !== undefined) {
        for (const element of bindings.elements) {
          module.imports.set(element.name.text, {
            module: from,
            kind: 'named',
            imported: (element.propertyName ?? element.name).text,
            typeOnly: clause.isTypeOnly || element.isTypeOnly,
          });
        }
      }
    } else if (ts.isVariableStatement(statement)) {
      const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) === true;
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        module.declarations.set(declaration.name.text, statement);
        if (declaration.initializer !== undefined) module.consts.set(declaration.name.text, declaration.initializer);
        if (isExported) exported.push(declaration);
      }
    } else if (
      (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) &&
      statement.name !== undefined
    ) {
      module.declarations.set(statement.name.text, statement);
    } else if (ts.isExportAssignment(statement) && statement.isExportEquals !== true) {
      metaExpression = statement.expression;
    }
  }

  if (metaExpression !== undefined) {
    const meta = members(resolveObject(metaExpression, module), module);
    const target = unwrap(metaExpression);
    module.meta = {
      args: members(resolveObject(meta.get('args'), module), module),
      render: meta.get('render'),
      component: meta.get('component'),
      name: ts.isIdentifier(target) ? target.text : undefined,
    };
  }
  for (const declaration of exported) {
    const own = members(resolveObject(declaration.initializer, module), module);
    module.stories.set((declaration.name as ts.Identifier).text, {
      args: members(resolveObject(own.get('args'), module), module),
      render: own.get('render'),
    });
  }
  return module;
}

/** An object literal behind an expression: itself, a module const, or a property of one (`Default.args`). */
function resolveObject(node: ts.Expression | undefined, module: StoryModule, seen: ReadonlySet<string> = new Set()): ts.ObjectLiteralExpression | undefined {
  if (node === undefined) return undefined;
  const expression = unwrap(node);
  if (ts.isObjectLiteralExpression(expression)) return expression;
  if (ts.isIdentifier(expression)) {
    if (seen.has(expression.text)) return undefined;
    return resolveObject(module.consts.get(expression.text), module, new Set([...seen, expression.text]));
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return resolveObject(members(resolveObject(expression.expression, module, seen), module).get(expression.name.text), module, seen);
  }
  return undefined;
}

/**
 * An object literal's members as JS would build it: spreads merged in place, a later key replacing an
 * earlier one's value (and keeping its position). `{ ...Default, args: {…} }` is Default's render with
 * new args, which is how the RN stories reuse a render.
 */
function members(object: ts.ObjectLiteralExpression | undefined, module: StoryModule): Map<string, ts.Expression> {
  const out = new Map<string, ts.Expression>();
  if (object === undefined) return out;
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      for (const [key, value] of members(resolveObject(property.expression, module), module)) out.set(key, value);
    } else if (ts.isPropertyAssignment(property)) {
      const key = memberName(property.name);
      if (key !== undefined) out.set(key, property.initializer);
    } else if (ts.isShorthandPropertyAssignment(property)) {
      out.set(property.name.text, property.name);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ evaluation */

/** An expression this module cannot turn into a value. */
const FAIL: unique symbol = Symbol('unevaluable');

/** What a lit-html template rendered to — kept apart from text so it is not escaped a second time. */
class Markup {
  readonly html: string;
  constructor(html: string) {
    this.html = html;
  }
}

/** A render parameter standing for the whole args object (`args`, or a destructuring's `...rest`). */
class ArgsRef {
  readonly omit: ReadonlySet<string>;
  constructor(omit: ReadonlySet<string>) {
    this.omit = omit;
  }
}

/** A render parameter standing for one arg (`({ label }) => …`). */
class ArgRef {
  readonly key: string;
  constructor(key: string) {
    this.key = key;
  }
}

/** The story being rendered into a snippet. */
interface Render {
  platform: Exclude<Platform, 'swift'>;
  module: StoryModule;
  /** Every arg the story renders with: the meta's, overlaid by the story's own. */
  args: Map<string, ts.Expression>;
  /** The keys the story sets itself. */
  own: ReadonlySet<string>;
  component: SnippetComponent;
  options: SnippetOptions;
  /** What kept a snippet from being fully clean, for `--report`. */
  problems: string[];
}

interface Scope {
  render: Render;
  env: ReadonlyMap<string, unknown>;
  seen: ReadonlySet<string>;
}

const moduleScope = (render: Render): Scope => ({ render, env: new Map(), seen: new Set() });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
}

function argValue(render: Render, key: string): unknown {
  const expression = render.args.get(key);
  return expression === undefined ? undefined : evaluate(expression, moduleScope(render));
}

/** An expression's value, or `FAIL`. Data and the few pure operations templates use; never a call into story code. */
function evaluate(node: ts.Expression, scope: Scope): unknown {
  const expression = unwrap(node);
  const { module } = scope.render;

  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;

  if (ts.isIdentifier(expression)) {
    const name = expression.text;
    if (scope.env.has(name)) {
      const bound = scope.env.get(name);
      if (bound instanceof ArgRef) return argValue(scope.render, bound.key);
      return bound instanceof ArgsRef ? FAIL : bound;
    }
    if (name === 'undefined') return undefined;
    const imported = module.imports.get(name);
    if (imported !== undefined) return imported.imported === 'nothing' && imported.module.startsWith('lit') ? undefined : FAIL;
    const initializer = module.consts.get(name);
    if (initializer === undefined || scope.seen.has(name)) return FAIL;
    return evaluate(initializer, { render: scope.render, env: new Map(), seen: new Set([...scope.seen, name]) });
  }

  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      const part = evaluate(span.expression, scope);
      if (typeof part !== 'string' && typeof part !== 'number' && typeof part !== 'boolean') return FAIL;
      text += String(part) + span.literal.text;
    }
    return text;
  }

  if (ts.isPrefixUnaryExpression(expression)) {
    const operand = evaluate(expression.operand, scope);
    if (operand === FAIL) return FAIL;
    if (expression.operator === ts.SyntaxKind.ExclamationToken) return !operand;
    if (typeof operand === 'number' && expression.operator === ts.SyntaxKind.MinusToken) return -operand;
    if (typeof operand === 'number' && expression.operator === ts.SyntaxKind.PlusToken) return operand;
    return FAIL;
  }

  if (ts.isBinaryExpression(expression)) {
    const operator = expression.operatorToken.kind;
    const left = evaluate(expression.left, scope);
    if (left === FAIL) return FAIL;
    if (operator === ts.SyntaxKind.QuestionQuestionToken) return left ?? evaluate(expression.right, scope);
    if (operator === ts.SyntaxKind.BarBarToken) return left || evaluate(expression.right, scope);
    if (operator === ts.SyntaxKind.AmpersandAmpersandToken) return left && evaluate(expression.right, scope);
    const right = evaluate(expression.right, scope);
    if (right === FAIL) return FAIL;
    if (operator === ts.SyntaxKind.EqualsEqualsEqualsToken) return left === right;
    if (operator === ts.SyntaxKind.ExclamationEqualsEqualsToken) return left !== right;
    if (operator === ts.SyntaxKind.PlusToken && (typeof left === 'string' || typeof right === 'string')) {
      return typeof left === 'object' || typeof right === 'object' ? FAIL : String(left) + String(right);
    }
    if (typeof left === 'number' && typeof right === 'number') {
      switch (operator) {
        case ts.SyntaxKind.PlusToken: return left + right;
        case ts.SyntaxKind.MinusToken: return left - right;
        case ts.SyntaxKind.AsteriskToken: return left * right;
        case ts.SyntaxKind.SlashToken: return left / right;
        case ts.SyntaxKind.LessThanToken: return left < right;
        case ts.SyntaxKind.GreaterThanToken: return left > right;
        default: return FAIL;
      }
    }
    return FAIL;
  }

  if (ts.isConditionalExpression(expression)) {
    const condition = evaluate(expression.condition, scope);
    return condition === FAIL ? FAIL : evaluate(condition ? expression.whenTrue : expression.whenFalse, scope);
  }

  if (ts.isArrayLiteralExpression(expression)) {
    const items: unknown[] = [];
    for (const element of expression.elements) {
      if (ts.isSpreadElement(element)) {
        const spread = evaluate(element.expression, scope);
        if (!Array.isArray(spread)) return FAIL;
        items.push(...(spread as unknown[]));
      } else if (ts.isOmittedExpression(element)) {
        items.push(undefined);
      } else {
        const item = evaluate(element, scope);
        if (item === FAIL) return FAIL;
        items.push(item);
      }
    }
    return items;
  }

  if (ts.isObjectLiteralExpression(expression)) {
    const object: Record<string, unknown> = {};
    for (const property of expression.properties) {
      if (ts.isSpreadAssignment(property)) {
        const spread = evaluate(property.expression, scope);
        if (!isPlainObject(spread)) return FAIL;
        Object.assign(object, spread);
      } else if (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) {
        const key = memberName(property.name);
        const value = evaluate(ts.isPropertyAssignment(property) ? property.initializer : property.name, scope);
        if (key === undefined || value === FAIL) return FAIL;
        object[key] = value;
      } else {
        return FAIL;
      }
    }
    return object;
  }

  if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    const target = ts.isIdentifier(unwrap(expression.expression)) ? scope.env.get((unwrap(expression.expression) as ts.Identifier).text) : undefined;
    const key = ts.isPropertyAccessExpression(expression) ? expression.name.text : evaluate(expression.argumentExpression, scope);
    if (key === FAIL) return FAIL;
    if (target instanceof ArgsRef) return typeof key === 'string' ? argValue(scope.render, key) : FAIL;
    return member(evaluate(expression.expression, scope), key, expression.questionDotToken !== undefined);
  }

  if (ts.isTaggedTemplateExpression(expression) && isLitHtml(expression.tag, module)) {
    const rendered = renderTemplate(expression.template, scope);
    return rendered.dynamic ? FAIL : new Markup(dedent(rendered.text));
  }

  if (ts.isCallExpression(expression)) return call(expression, scope);
  return FAIL;
}

function member(target: unknown, key: unknown, optional: boolean): unknown {
  if (target === FAIL) return FAIL;
  if (target === undefined || target === null) return optional ? undefined : FAIL;
  if (Array.isArray(target)) {
    if (key === 'length') return target.length;
    return typeof key === 'number' ? target[key] : FAIL;
  }
  if (typeof target === 'string' && key === 'length') return target.length;
  if (isPlainObject(target) && (typeof key === 'string' || typeof key === 'number')) {
    return Object.hasOwn(target, key) ? target[key] : undefined;
  }
  return FAIL;
}

/** The expression a function returns: an expression body, or a block that is one `return`. */
function returnedExpression(fn: ts.ArrowFunction | ts.FunctionExpression): ts.Expression | undefined {
  if (!ts.isBlock(fn.body)) return fn.body;
  const [only] = fn.body.statements;
  return fn.body.statements.length === 1 && only !== undefined && ts.isReturnStatement(only) ? only.expression : undefined;
}

/** Binds a callback parameter (`tab`, `{ id, label }`) to a value. `false` when the pattern is beyond this. */
function bindPattern(name: ts.BindingName, value: unknown, env: Map<string, unknown>): boolean {
  if (ts.isIdentifier(name)) {
    env.set(name.text, value);
    return true;
  }
  if (!ts.isObjectBindingPattern(name) || !isPlainObject(value)) return false;
  for (const element of name.elements) {
    const key = element.propertyName === undefined ? (ts.isIdentifier(element.name) ? element.name.text : undefined) : memberName(element.propertyName);
    if (element.dotDotDotToken !== undefined || key === undefined || !bindPattern(element.name, value[key], env)) return false;
  }
  return true;
}

/** The calls a template makes on data: `ifDefined`, `String`, and callback-free or pure-callback array methods. */
function call(expression: ts.CallExpression, scope: Scope): unknown {
  const callee = unwrap(expression.expression);
  const [first] = expression.arguments;
  if (ts.isIdentifier(callee)) {
    if (first === undefined || expression.arguments.length !== 1) return FAIL;
    if (callee.text === 'ifDefined') return evaluate(first, scope);
    if (callee.text === 'String') {
      const value = evaluate(first, scope);
      return value === FAIL || typeof value === 'object' ? FAIL : String(value);
    }
    return FAIL;
  }
  if (!ts.isPropertyAccessExpression(callee)) return FAIL;
  const target = evaluate(callee.expression, scope);
  if (!Array.isArray(target)) return FAIL;
  const method = callee.name.text;

  if (method === 'map' || method === 'filter') {
    const fn = first === undefined ? undefined : unwrap(first);
    if (fn === undefined || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) return FAIL;
    const body = returnedExpression(fn);
    if (body === undefined) return FAIL;
    const out: unknown[] = [];
    for (const [index, item] of target.entries()) {
      const env = new Map(scope.env);
      const [itemParameter, indexParameter] = fn.parameters;
      if (itemParameter !== undefined && !bindPattern(itemParameter.name, item, env)) return FAIL;
      if (indexParameter !== undefined && !bindPattern(indexParameter.name, index, env)) return FAIL;
      const value = evaluate(body, { ...scope, env });
      if (value === FAIL) return FAIL;
      if (method === 'map') out.push(value);
      else if (value) out.push(item);
    }
    return out;
  }

  const values = expression.arguments.map((argument) => evaluate(argument, scope));
  if (values.includes(FAIL)) return FAIL;
  if (method === 'join' && values.every((value) => typeof value === 'string') && target.every((item) => typeof item !== 'object')) {
    return target.join(...(values as string[]));
  }
  if (method === 'slice' && values.every((value) => typeof value === 'number')) return target.slice(...(values as number[]));
  if (method === 'concat' && values.every(Array.isArray)) return target.concat(...(values as unknown[][]));
  return FAIL;
}

/* ------------------------------------------------------------------ text helpers */

/** Lines with their common indentation removed, and the blank lines at either end dropped. */
export function dedent(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  while (lines.length > 0 && lines[0]!.trim() === '') lines.shift();
  while (lines.length > 0 && lines.at(-1)!.trim() === '') lines.pop();
  const indent = Math.min(...lines.filter((line) => line.trim() !== '').map((line) => /^[ \t]*/.exec(line)![0].length));
  return lines.map((line) => line.slice(Number.isFinite(indent) ? indent : 0).trimEnd()).join('\n');
}

/** The indentation of the line a node starts on. */
function indentOf(node: ts.Node, source: ts.SourceFile): string {
  const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
  const lineStart = source.getPositionOfLineAndCharacter(line, 0);
  return /^[ \t]*/.exec(source.text.slice(lineStart))![0];
}

/** A node's text with its continuation lines re-based to the node's own line — so it can be moved. */
function rebase(text: string, indent: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line, index) => (index > 0 && line.startsWith(indent) ? line.slice(indent.length) : line))
    .join('\n');
}

const expressionText = (node: ts.Node, source: ts.SourceFile): string => rebase(node.getText(source), indentOf(node, source));

const escapeAttribute = (text: string): string => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const escapeText = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** An identifier in a position that refers to something, rather than naming a member or a declaration. */
function isReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if (parent === undefined) return true;
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return false;
  if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isMethodDeclaration(parent) || ts.isPropertyDeclaration(parent)) && parent.name === node) return false;
  if (ts.isJsxAttribute(parent) && parent.name === node) return false;
  if (ts.isBindingElement(parent) && (parent.propertyName === node || parent.name === node)) return false;
  if ((ts.isParameter(parent) || ts.isVariableDeclaration(parent) || ts.isFunctionDeclaration(parent)) && parent.name === node) return false;
  if (ts.isQualifiedName(parent) && parent.right === node) return false;
  if ((ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) ) return false;
  return true;
}

const STORYBOOK_MODULE = /^(@storybook\/|storybook(\/|$))/;

function usesStorybook(node: ts.Node, module: StoryModule): boolean {
  let found = false;
  const visit = (child: ts.Node): void => {
    if (found) return;
    if (ts.isIdentifier(child) && STORYBOOK_MODULE.test(module.imports.get(child.text)?.module ?? '')) found = true;
    else ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

/* ------------------------------------------------------------------ args → code */

/** Whether an arg the story only inherits holds the prop's schema default, and so says nothing a reader needs. */
function isInheritedDefault(render: Render, key: string, value: unknown): boolean {
  if (render.own.has(key) || value === FAIL || (typeof value === 'object' && value !== null)) return false;
  const prop = Object.hasOwn(render.component.props, key) ? render.component.props[key] : undefined;
  if (prop?.default === undefined) return value === undefined || value === null || value === false || value === '';
  return String(prop.default) === String(value);
}

/** Whether an arg belongs in a snippet: set, not a Storybook action, not an inherited default. */
function isShown(render: Render, key: string): boolean {
  const expression = render.args.get(key);
  if (expression === undefined || isUndefinedExpression(expression) || usesStorybook(expression, render.module)) return false;
  return !isInheritedDefault(render, key, evaluate(expression, moduleScope(render)));
}

function unwrapParentheses(node: ts.Expression): ts.Expression {
  return ts.isParenthesizedExpression(node) ? unwrapParentheses(node.expression) : node;
}

/** The arg's own source, as an expression that can stand where `args.key` stood. */
function argExpression(render: Render, key: string): string {
  const node = render.args.get(key);
  if (node === undefined) return 'undefined';
  const expression = unwrapParentheses(node);
  const text = expressionText(expression, render.module.source);
  const loose =
    ts.isArrowFunction(expression) || ts.isFunctionExpression(expression) || ts.isConditionalExpression(expression) ||
    ts.isBinaryExpression(expression) || ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression);
  return loose ? `(${text})` : text;
}

/** One JSX attribute for an arg: `label="Save"`, `disabled`, `tabs={TABS}`. */
function jsxAttribute(render: Render, key: string): string {
  const expression = unwrapParentheses(render.args.get(key)!);
  if ((ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) && !/["\n&{}<>]/.test(expression.text)) {
    return `${key}="${expression.text}"`;
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return key;
  return `${key}={${expressionText(expression, render.module.source)}}`;
}

function jsxAttributes(render: Render, omit: ReadonlySet<string>): string[] {
  return [...render.args.keys()].filter((key) => key !== 'children' && !omit.has(key) && isShown(render, key)).map((key) => jsxAttribute(render, key));
}

/** A `children` arg as JSX children, or `undefined` when there is none to show. */
function jsxChildren(render: Render, omit: ReadonlySet<string>): string | undefined {
  if (omit.has('children') || !render.args.has('children') || !isShown(render, 'children')) return undefined;
  const expression = unwrapParentheses(render.args.get('children')!);
  if ((ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) && !/[{}<>]/.test(expression.text)) return expression.text;
  const text = expressionText(expression, render.module.source);
  return ts.isJsxElement(expression) || ts.isJsxSelfClosingElement(expression) || ts.isJsxFragment(expression) ? text : `{${text}}`;
}

const indentContinuation = (text: string, indent: string): string => text.replace(/\n/g, `\n${indent}`);

/** The whole args object as a literal, for a render that passes `args` on rather than spreading it. */
function argsObject(render: Render, omit: ReadonlySet<string>): string {
  const entries = [...render.args.keys()]
    .filter((key) => !omit.has(key) && isShown(render, key))
    .map((key) => `${/^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)}: ${argExpression(render, key)}`);
  return entries.length === 0 ? '{}' : `{ ${entries.join(', ')} }`;
}

/**
 * A node's source with the render's parameters written out: `{...args}` as attributes, `args.label` as
 * the arg's own expression, a destructured `label` likewise.
 */
function substitute(node: ts.Node, scope: Scope): string {
  const { render } = scope;
  const { source } = render.module;
  const start = node.getStart(source);
  const edits: { start: number; end: number; text: string }[] = [];
  const bound = (expression: ts.Expression): unknown => {
    const inner = unwrap(expression);
    return ts.isIdentifier(inner) ? scope.env.get(inner.text) : undefined;
  };

  const visit = (child: ts.Node): void => {
    if (ts.isJsxSelfClosingElement(child) || ts.isJsxOpeningElement(child)) {
      const properties = child.attributes.properties;
      const spreads = properties.filter((p): p is ts.JsxSpreadAttribute => ts.isJsxSpreadAttribute(p) && bound(p.expression) instanceof ArgsRef);
      const [spread] = spreads;
      if (spread !== undefined) {
        // An attribute the element sets itself wins over the spread, and would be a duplicate beside it.
        const explicit = properties.flatMap((p) => (ts.isJsxAttribute(p) ? [p.name.getText(source)] : []));
        const omit = new Set([...(bound(spread.expression) as ArgsRef).omit, ...explicit]);
        const children = ts.isJsxSelfClosingElement(child) ? jsxChildren(render, omit) : undefined;
        omit.add('children');
        const attributes = jsxAttributes(render, omit);
        const tag = child.tagName.getText(source);
        const indent = indentOf(child, source);
        const inline = attributes.join(' ');
        if (properties.length === 1 && child.typeArguments === undefined && (inline.includes('\n') || inline.length > 60)) {
          // `<Harness {...args} />` with more than fits one line: the tag is laid out afresh, one prop a line.
          const lines = attributes.map((attribute) => indentContinuation(attribute, `${indent}  `)).join(`\n${indent}  `);
          const close = ts.isJsxOpeningElement(child) ? '>' : children === undefined ? '/>' : `>${children}</${tag}>`;
          edits.push({ start: child.tagName.end, end: child.end, text: `\n${indent}  ${lines}\n${indent}${close}` });
          return;
        }
        // A spread on a line of its own becomes one prop a line at its indentation; one beside other props, a run.
        const spreadIndent = indentOf(spread, source);
        const ownLine = source.text.slice(spread.getStart(source) - spreadIndent.length, spread.getStart(source)) === spreadIndent;
        const text = ownLine ? attributes.map((attribute) => indentContinuation(attribute, spreadIndent)).join(`\n${spreadIndent}`) : inline;
        for (const other of spreads) {
          const replacement = other === spread ? text : '';
          // An empty replacement takes its leading whitespace with it, so `<Button {...args} />` becomes `<Button />`.
          edits.push({ start: replacement === '' ? other.pos : other.getStart(source), end: other.end, text: replacement });
        }
        if (children !== undefined) {
          edits.push({ start: child.attributes.end, end: child.end, text: `>${children}</${tag}>` });
        }
        for (const property of properties) if (!spreads.includes(property as ts.JsxSpreadAttribute)) visit(property);
        return;
      }
    }
    if (ts.isPropertyAccessExpression(child) && bound(child.expression) instanceof ArgsRef) {
      edits.push({ start: child.getStart(source), end: child.end, text: argExpression(render, child.name.text) });
      return;
    }
    if (ts.isIdentifier(child) && isReference(child)) {
      const binding = scope.env.get(child.text);
      const text = binding instanceof ArgRef ? argExpression(render, binding.key) : binding instanceof ArgsRef ? argsObject(render, binding.omit) : undefined;
      if (text !== undefined) {
        const shorthand = child.parent !== undefined && ts.isShorthandPropertyAssignment(child.parent);
        edits.push({ start: child.getStart(source), end: child.end, text: shorthand ? `${child.text}: ${text}` : text });
      }
      return;
    }
    ts.forEachChild(child, visit);
  };
  visit(node);

  let text = source.text.slice(start, node.end);
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    text = text.slice(0, Math.max(0, edit.start - start)) + edit.text + text.slice(edit.end - start);
  }
  return rebase(text, indentOf(node, source));
}

/** The render's parameters bound to the args they stand for, or `undefined` for a shape this module does not read. */
function bindParameters(fn: ts.ArrowFunction | ts.FunctionExpression): Map<string, unknown> | undefined {
  const env = new Map<string, unknown>();
  const [first] = fn.parameters;
  if (first === undefined) return env;
  if (ts.isIdentifier(first.name)) {
    env.set(first.name.text, new ArgsRef(new Set()));
    return env;
  }
  if (!ts.isObjectBindingPattern(first.name)) return undefined;
  const named = new Set<string>();
  for (const element of first.name.elements) {
    if (!ts.isIdentifier(element.name)) return undefined;
    if (element.dotDotDotToken !== undefined) continue;
    const key = element.propertyName === undefined ? element.name.text : memberName(element.propertyName);
    if (key === undefined) return undefined;
    named.add(key);
    env.set(element.name.text, new ArgRef(key));
  }
  const rest = first.name.elements.find((element) => element.dotDotDotToken !== undefined);
  if (rest !== undefined && ts.isIdentifier(rest.name)) env.set(rest.name.text, new ArgsRef(named));
  return env;
}

/* ------------------------------------------------------------------ assembling a module */

/**
 * The snippet's body with the imports and module-level helpers it references in front of it.
 *
 * References are found by parsing the body, not by searching its text, and followed transitively: a
 * harness component brings its own imports along, a `const TABS` its element type.
 */
function assemble(render: Render, body: string, leading: string[] = []): string {
  const { module, options, platform } = render;
  const declared = new Set<ts.Statement>();
  const imported = new Set<string>();
  const scan = (text: string): void => {
    const file = ts.createSourceFile(`snippet.${render.platform === 'lit' ? 'ts' : 'tsx'}`, text, ts.ScriptTarget.Latest, true, render.platform === 'lit' ? ts.ScriptKind.TS : ts.ScriptKind.TSX);
    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node) && isReference(node)) {
        const name = node.text;
        const declaration = module.declarations.get(name);
        if (module.imports.has(name)) imported.add(name);
        else if (declaration !== undefined && !declared.has(declaration) && !module.stories.has(name) && name !== module.meta.name) {
          declared.add(declaration);
          scan(declaration.getText(module.source));
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  };
  scan(body);

  const groups = new Map<string, { namespaces: string[]; defaults: string[]; named: { text: string; typeOnly: boolean }[] }>();
  for (const [local, binding] of module.imports) {
    if (!imported.has(local)) continue;
    if (STORYBOOK_MODULE.test(binding.module)) {
      render.problems.push(`references \`${local}\` from ${binding.module}`);
      continue;
    }
    const relative = binding.module.startsWith('.');
    const target = relative ? options.packages[platform] : binding.module;
    const exported = options.exports[platform];
    if (relative && binding.kind === 'named' && exported !== undefined && !exported.has(binding.imported)) {
      render.problems.push(`imports \`${binding.imported}\`, which ${target} does not export`);
    }
    const group = groups.get(target) ?? { namespaces: [], defaults: [], named: [] };
    groups.set(target, group);
    if (binding.kind === 'namespace') group.namespaces.push(local);
    else if (binding.kind === 'default') group.defaults.push(local);
    else group.named.push({ text: binding.imported === local ? local : `${binding.imported} as ${local}`, typeOnly: binding.typeOnly });
  }

  const imports = [...leading];
  for (const [target, group] of groups) {
    for (const name of group.namespaces) imports.push(`import * as ${name} from '${target}';`);
    for (const name of group.defaults) imports.push(`import ${name} from '${target}';`);
    if (group.named.length === 0) continue;
    const allTypes = group.named.every((name) => name.typeOnly);
    const names = group.named.map((name) => (name.typeOnly && !allTypes ? `type ${name.text}` : name.text));
    imports.push(`import ${allTypes ? 'type ' : ''}{ ${names.join(', ')} } from '${target}';`);
  }
  const helpers = [...declared]
    .sort((a, b) => a.pos - b.pos)
    .map((statement) => statement.getText(module.source).replace(/^export\s+/, ''));
  return [imports.join('\n'), ...helpers, body].filter((part) => part !== '').join('\n\n');
}

/* ------------------------------------------------------------------ React and React Native */

function renderJsx(render: Render, story: StoryDef): string | null {
  const { module } = render;
  const renderFn = story.render ?? module.meta.render;
  if (renderFn === undefined) {
    // Storybook's implicit render: the meta's component with the args as props.
    const component = module.meta.component === undefined ? undefined : unwrap(module.meta.component);
    if (component === undefined || !ts.isIdentifier(component)) return null;
    const tag = component.text;
    const attributes = jsxAttributes(render, new Set());
    const children = jsxChildren(render, new Set());
    const inline = attributes.join(' ');
    const multiline = inline.includes('\n') || `<${tag} ${inline} />`.length > 80;
    const opening = attributes.length === 0 ? `<${tag}` : multiline ? `<${tag}\n  ${attributes.map((a) => indentContinuation(a, '  ')).join('\n  ')}\n` : `<${tag} ${inline}`;
    const element =
      children === undefined
        ? `${opening}${multiline ? '/>' : ' />'}`
        : `${opening}>${children.includes('\n') || multiline ? `\n  ${indentContinuation(children, '  ')}\n` : children}</${tag}>`;
    return assemble(render, element);
  }

  // `render: controlled`, where `const controlled = (args) => …` sits at module level and several
  // stories share it (Popover's): the same function, reached by name.
  const named = unwrap(renderFn);
  const declared = ts.isIdentifier(named) ? module.consts.get(named.text) : undefined;
  const fn = declared === undefined ? named : unwrap(declared);
  if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) {
    render.problems.push('render is not an inline function');
    return null;
  }
  const env = bindParameters(fn);
  if (env === undefined) {
    render.problems.push('render destructures its args in a shape this tool does not read');
    return null;
  }
  const scope: Scope = { render, env, seen: new Set() };
  if (!ts.isBlock(fn.body)) return assemble(render, substitute(unwrapParentheses(fn.body), scope));

  const statements = [...fn.body.statements];
  const last = statements.pop();
  if (last !== undefined && ts.isReturnStatement(last) && last.expression !== undefined && statements.every(ts.isFunctionDeclaration)) {
    // Helper components declared inside the render are ordinary module-level components in an app.
    const parts = [...statements.map((statement) => substitute(statement, scope)), substitute(unwrapParentheses(last.expression), scope)];
    return assemble(render, parts.join('\n\n'));
  }
  // A render with hooks or other statements is a component; it stays one.
  return assemble(render, `function Example() ${substitute(fn.body, scope)}\n\n<Example />`);
}

/* ------------------------------------------------------------------ Lit */

function isLitHtml(tag: ts.Expression, module: StoryModule): boolean {
  return ts.isIdentifier(tag) && tag.text === 'html' && /^lit(-html)?(\/|$)/.test(module.imports.get('html')?.module ?? '');
}

/** ` name=`, ` ?name=`, ` .name=`, ` @name=` at the end of the text before a binding, with its opening quote. */
const ATTRIBUTE_TAIL = /(\s+)([.?@]?)([^\s"'<>/=`]+)=(["']?)$/;

const insideTag = (text: string): boolean => text.lastIndexOf('<') > text.lastIndexOf('>');
const openTag = (text: string): string | undefined => /<([a-zA-Z][\w-]*)[^<]*$/.exec(text)?.[1];

function isChildValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.every(isChildValue);
  return value instanceof Markup || value === undefined || value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function childText(value: unknown): string {
  if (value instanceof Markup) return value.html;
  if (Array.isArray(value)) return value.map(childText).filter((text) => text !== '').join('\n');
  if (typeof value === 'string' || typeof value === 'number') return escapeText(String(value));
  return '';
}

/** The spread a template span keeps when it cannot be resolved: its source, with the args written in. */
function spanCode(expression: ts.Expression, scope: Scope): string {
  return `\${${substitute(expression, scope)}}`;
}

/** The arg a binding reads directly — `args.size`, `ifDefined(args.value)` — for the default check. */
function argKeyOf(node: ts.Expression, scope: Scope): string | undefined {
  let expression = unwrap(node);
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression) && expression.expression.text === 'ifDefined' && expression.arguments[0] !== undefined) {
    expression = unwrap(expression.arguments[0]);
  }
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) && scope.env.get(expression.expression.text) instanceof ArgsRef) {
    return expression.name.text;
  }
  const bound = ts.isIdentifier(expression) ? scope.env.get(expression.text) : undefined;
  return bound instanceof ArgRef ? bound.key : undefined;
}

/**
 * A lit-html template, rendered as far as its values allow.
 *
 * `dynamic` is whether any binding is left as a `${…}` — the caller then emits a Lit module instead of
 * plain HTML. Bindings are read the way lit-html reads them: by the text before the `${`.
 */
function renderTemplate(template: ts.TemplateLiteral, scope: Scope): { text: string; dynamic: boolean } {
  if (ts.isNoSubstitutionTemplateLiteral(template)) return { text: template.text, dynamic: false };
  let out = template.head.text;
  let dynamic = false;
  for (const span of template.templateSpans) {
    let literal = span.literal.text;
    const value = evaluate(span.expression, scope);
    const attribute = insideTag(out) ? ATTRIBUTE_TAIL.exec(out) : null;

    if (attribute !== null) {
      const [whole, space = ' ', prefix, name = '', quote = ''] = attribute;
      const set = (text: string): void => {
        out = out.slice(0, out.length - whole.length) + text;
        if (quote !== '' && literal.startsWith(quote)) literal = literal.slice(1);
      };
      const keep = (): void => {
        dynamic = true;
        out += spanCode(span.expression, scope);
      };
      const key = argKeyOf(span.expression, scope);
      if (prefix === '@' || value === FAIL) keep();
      else if (key !== undefined && isInheritedDefault(scope.render, key, value)) set('');
      else if (prefix === '?') set(value ? `${space}${name}` : '');
      else if (prefix === '.') {
        // A property binding is plain HTML only when the element reflects that property to an attribute.
        const reflected = scope.render.options.litProperties.get(openTag(out) ?? '')?.get(name);
        if (typeof reflected !== 'string' || (typeof value === 'object' && value !== null)) keep();
        else if (value === undefined || value === null || value === false) set('');
        else set(value === true ? `${space}${reflected}` : `${space}${reflected}="${escapeAttribute(String(value))}"`);
      } else if (value === undefined || value === null) set('');
      else if (typeof value === 'object') keep();
      else set(`${space}${name}="${escapeAttribute(String(value))}"`);
    } else if (value === FAIL || !isChildValue(value)) {
      dynamic = true;
      out += spanCode(span.expression, scope);
    } else {
      const indent = /(^|\n)([ \t]*)[^\n]*$/.exec(out)?.[2] ?? '';
      out += indentContinuation(childText(value), indent);
    }
    out += literal;
  }
  return { text: out, dynamic };
}

/** An opening tag, with every attribute captured whole so a quoted value's spaces survive. */
const OPEN_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>/=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"'<>=`]+))?)*)\s*(\/?)>/g;
const TAG_ATTRIBUTE = /[^\s"'<>/=]+(?:=(?:"[^"]*"|'[^']*'|[^\s"'<>=`]+))?/g;

/** Rendered markup, tidied: a tag whose attributes were mostly defaults goes back onto one line. */
export function formatMarkup(text: string): string {
  const html = dedent(text).replace(/<\/([a-zA-Z][\w-]*)\s+>/g, '</$1>');
  return html.replace(OPEN_TAG, (whole: string, tag: string, attributes: string, slash: string, offset: number) => {
    if (!whole.includes('\n')) return whole;
    const inline = `<${tag}${(attributes.match(TAG_ATTRIBUTE) ?? []).map((attribute) => ` ${attribute}`).join('')}${slash === '' ? '' : ' /'}>`;
    const column = offset - (html.lastIndexOf('\n', offset - 1) + 1);
    return inline.includes('\n') || column + inline.length > 100 ? whole : inline;
  });
}

function renderLit(render: Render, story: StoryDef): string | null {
  const renderFn = story.render ?? render.module.meta.render;
  const fn = renderFn === undefined ? undefined : unwrap(renderFn);
  if (fn === undefined || !(ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
    render.problems.push('no inline render function');
    return null;
  }
  const env = bindParameters(fn);
  const body = returnedExpression(fn);
  const template = body === undefined ? undefined : unwrap(body);
  if (env === undefined || template === undefined || !ts.isTaggedTemplateExpression(template) || !isLitHtml(template.tag, render.module)) {
    render.problems.push('render does not return one html`` template');
    return null;
  }
  const { text, dynamic } = renderTemplate(template.template, { render, env, seen: new Set() });
  if (!dynamic) return formatMarkup(text);
  const markup = formatMarkup(text).replace(/`/g, '\\`');
  return assemble(render, `html\`\n${markup.replace(/^/gm, '  ')}\n\`;`, [`import '${render.options.packages.lit}';`]);
}

/** Every `@property()` a Lit element declares, by tag, with the attribute each reflects to. Read, never imported. */
export function litProperties(directory: string): LitProperties {
  const tags = new Map<string, Map<string, string | null>>();
  if (!existsSync(directory)) return tags;
  const DECORATOR = /@customElement\(\s*['"]([^'"]+)['"]\s*\)|@property\(([^)]*)\)\s*(?:(?:public|protected|private|override|declare|static|readonly|accessor)\s+)*(\w+)/g;
  for (const file of readdirSync(directory)) {
    if (!file.endsWith('.ts') || /\.(stories|test|spec|d)\.ts$/.test(file)) continue;
    let current: Map<string, string | null> | undefined;
    for (const match of readText(join(directory, file)).matchAll(DECORATOR)) {
      if (match[1] !== undefined) {
        current = new Map();
        tags.set(match[1], current);
        continue;
      }
      const options = match[2] ?? '';
      const property = match[3] ?? '';
      const named = /attribute:\s*['"]([^'"]+)['"]/.exec(options)?.[1];
      current?.set(property, /attribute:\s*false/.test(options) ? null : (named ?? property.toLowerCase()));
    }
  }
  return tags;
}

/* ------------------------------------------------------------------ SwiftUI */

/** `#Preview("Name") { … }` bodies by name — `''` for an unnamed one — from a generated view file. */
export function swiftPreviews(text: string): Map<string, string> {
  const previews = new Map<string, string>();
  for (const match of text.matchAll(/#Preview\s*(?:\(\s*"((?:[^"\\]|\\.)*)"[^{]*?\))?\s*\{/g)) {
    const open = (match.index ?? 0) + match[0].length - 1;
    let depth = 0;
    let inString = false;
    let index = open;
    for (; index < text.length; index++) {
      const char = text[index];
      if (inString) {
        if (char === '\\') index++;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === '{') depth++;
      else if (char === '}' && --depth === 0) break;
    }
    if (!previews.has(match[1] ?? '')) previews.set(match[1] ?? '', dedent(text.slice(open + 1, index)));
  }
  return previews;
}

/* ------------------------------------------------------------------ matching and the entry point */

/** Every platform's source for one component. `null` where the platform has none. */
export interface PlatformSources {
  react: StoryModule;
  lit: StoryModule | null;
  rn: StoryModule | null;
  swift: Map<string, string> | null;
}

export interface ExampleCode {
  snippets: Snippets;
  stories: SnippetSources;
  /** What kept a snippet from being produced or fully clean, for `--report`. */
  problems: string[];
}

/** What a story configures — its own args that are not copy — as a comparable key, or `undefined` for none. */
function configuration(module: StoryModule, story: StoryDef, platform: Exclude<Platform, 'swift'>, component: SnippetComponent, options: SnippetOptions): string | undefined {
  const render = newRender(platform, module, story, component, options);
  const entries = [...story.args.keys()]
    .filter((key) => !options.copyTypes.has((Object.hasOwn(component.props, key) ? component.props[key]?.type : undefined) ?? ''))
    .sort()
    .map((key) => {
      const value = argValue(render, key);
      return `${key}=${value === FAIL ? `source:${story.args.get(key)!.getText(module.source)}` : JSON.stringify(value)}`;
    });
  return entries.length === 0 ? undefined : entries.join('&');
}

/** The platform story that covers a React example: the same export, or the one story that configures the same. */
export function matchStory(exportName: string, react: StoryModule, other: StoryModule, platform: 'lit' | 'rn', component: SnippetComponent, options: SnippetOptions): string | null {
  if (other.stories.has(exportName)) return exportName;
  const story = react.stories.get(exportName);
  const wanted = story === undefined ? undefined : configuration(react, story, 'react', component, options);
  if (wanted === undefined) return null;
  const candidates = [...other.stories].filter(([name, candidate]) => !react.stories.has(name) && configuration(other, candidate, platform, component, options) === wanted);
  // Two stories can set the same thing — Lit's `Secondary` and `Expanded` both set `variant: 'secondary'`,
  // the second to frame a render of its own. The plain args story is the one that is about that setting.
  const plain = candidates.filter(([, candidate]) => candidate.render === undefined);
  const [only] = candidates.length === 1 ? candidates : plain.length === 1 ? plain : [];
  return only === undefined ? null : only[0];
}

function newRender(platform: Exclude<Platform, 'swift'>, module: StoryModule, story: StoryDef, component: SnippetComponent, options: SnippetOptions): Render {
  return {
    platform,
    module,
    args: new Map([...module.meta.args, ...story.args]),
    own: new Set(story.args.keys()),
    component,
    options,
    problems: [],
  };
}

/** One example's code on every platform. */
export function exampleCode(exportName: string, title: string, sources: PlatformSources, component: SnippetComponent, options: SnippetOptions): ExampleCode {
  const code: ExampleCode = {
    snippets: { react: null, lit: null, rn: null, swift: null },
    stories: { react: null, lit: null, rn: null, swift: null },
    problems: [],
  };
  const produce = (platform: Exclude<Platform, 'swift'>, module: StoryModule, name: string): void => {
    const story = module.stories.get(name);
    if (story === undefined) return;
    const render = newRender(platform, module, story, component, options);
    const snippet = platform === 'lit' ? renderLit(render, story) : renderJsx(render, story);
    code.snippets[platform] = snippet;
    code.stories[platform] = snippet === null ? null : name;
    code.problems.push(...render.problems.map((problem) => `${platform} ${name}: ${problem}`));
  };

  produce('react', sources.react, exportName);
  for (const platform of ['lit', 'rn'] as const) {
    const module = sources[platform];
    if (module === null) continue;
    const match = matchStory(exportName, sources.react, module, platform, component, options);
    if (match === null) code.problems.push(`${platform}: no story matches ${exportName}`);
    else produce(platform, module, match);
  }
  if (sources.swift !== null) {
    const name = [exportName, title, ...(exportName === 'Default' ? [''] : [])].find((candidate) => sources.swift!.has(candidate));
    if (name === undefined) code.problems.push(`swift: no #Preview matches ${exportName}`);
    else {
      code.snippets.swift = `import DesignSchema\n\n${sources.swift.get(name)!}`;
      code.stories.swift = name === '' ? '#Preview' : name;
    }
  }
  return code;
}
