#!/usr/bin/env node
/**
 * Parse component docs → machine-readable output.
 *
 * For every site/src/content/docs/components/*.md:
 *   1. split YAML frontmatter from the Markdown body
 *   2. validate frontmatter.component against the Zod schema in schema/component.ts
 *   3. split the body into sections by `## ` heading and check them against ALLOWED_HEADINGS
 *   4. emit generated/components.json  (frontmatter + sections, one entry per component)
 *   5. emit generated/prompts/<Name>.<platform>.md — the generation prompt ("mini-skill")
 *      for each supported platform: frontmatter + guidance + prompts/templates/<platform>.md
 *
 * Exit code 1 on any validation error, so this can gate CI and the site build.
 *
 * Usage: node tools/parse.ts
 *
 * Runs under Node's type stripping (22.18+ / 24): annotations only — no enums, namespaces or parameter
 * properties. The YAML embedded in the prompts is written by tools/lib/pyyaml.ts, a port of PyYAML's dumper, so
 * the prompts (and the generation lock hashes over them) are byte-identical to what tools/parse.py produced.
 */
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';

import type { ComponentDef, CompositionEntry } from '../schema/component.ts';
import { BEHAVIOR_FOCUS_TARGETS, BEHAVIOR_STATES, behaviorScenario, bindingTokens, componentFrontmatter, componentWarnings, compositionTarget, computeBinding, controlledPairs, copyText, expectList, lockRule, narrowForPlatform, partKind, PLURAL_CATEGORIES, propDef, resolveRole, roleIn, slotName, TARGET_REQUIRES, TARGET_TOKEN, WIDGET_ROLES } from '../schema/component.ts';
import { enumValues } from '../schema/vocab.ts';
import { extensionFrontmatter } from '../schema/extension.ts';
import { isTsPlatform, PACKAGE_DIR, TS_PLATFORMS } from '../schema/platforms.ts';
import { PLATFORMS as KEYBOARD_PLATFORMS, storyId, storyUrl } from './keyboard_tests.ts';
import { has, ljust, pyGet, pyRepr, pyRstrip, pySplit, pySplitlines, pyStr, pyStrip, readText, sortedNames, truthy, writeTextAtomic } from './lib/py.ts';
import { dump as yamlDump, load as yamlLoad } from './lib/pyyaml.ts';
import { REPO_ROOT } from './lib/root.ts';
import * as tokens from './lib/tokens.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dict = Record<string, any>;

const CONTENT = join(REPO_ROOT, 'site', 'src', 'content', 'docs');

/** Every path the tool reads or writes. Tests point these at a sandbox, the way the Python tests monkeypatched
 *  the module globals. */
export const paths = {
  ROOT: REPO_ROOT,
  DOCS: join(CONTENT, 'components'),
  THEME_DOCS: join(CONTENT, 'themes'),
  EXT_DOCS: join(CONTENT, 'extensions'),
  PATTERN_DOCS: join(CONTENT, 'patterns'),
  TEMPLATES: join(REPO_ROOT, 'prompts', 'templates'),
  OUT: join(REPO_ROOT, 'generated'),
};

// The prose body is guidance, not schema. Sections are fixed so the docs site,
// the MCP server, and the prompt builder can address them by name.
export const THEME_HEADINGS: string[] = ['Overview', 'Feel', 'Not', 'References', 'When to use', 'When not to use', 'Accessibility', 'Platform notes'];
export const ALLOWED_HEADINGS: string[] = [
  'Overview',
  'When to use',
  'When not to use',
  'Behavior',
  'Content guidelines',
  'Accessibility',
  'Platform notes',
  'Examples',
  'Related',
];
export const REQUIRED_HEADINGS: string[] = ['When to use', 'Accessibility'];
const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
export const STATUS_PUBLISHED: Set<string> = new Set(['review', 'stable']);

export class DocError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocError';
  }
}

// ---------------------------------------------------------------- warnings
// The one channel for findings that do not fail the parse (schema-hardening.md, "Rules every job follows"): a
// stricter rule lands here one job before the doc migration that satisfies it. A warning never throws and never
// changes what the parser writes, other than generated/parse-warnings.json. DS_WARNINGS_AS_ERRORS=1 counts them
// as errors.

export type Warning = { file: string; message: string };
let warnings: Warning[] = [];

/** Record one warning. `file` is the repo-relative doc path. */
export function warn(file: string, message: string): void {
  warnings.push({ file, message });
}

/** The warnings recorded since the last call, which clears them. */
export function takeWarnings(): Warning[] {
  const taken = warnings;
  warnings = [];
  return taken;
}

function name(file: string): string {
  return basename(file);
}

function stem(file: string): string {
  const n = basename(file);
  return n.slice(0, n.length - extname(n).length);
}

/** `*.md` files of a folder, in Python's `sorted(Path.glob("*.md"))` order; none when the folder is missing. */
function mdFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return sortedNames(readdirSync(dir).filter((n) => n.endsWith('.md'))).map((n) => join(dir, n));
}

/** `str(path.relative_to(ROOT))` (the platform's separators, as the Python tool wrote it), or the path itself
 *  when it is not under ROOT. */
function relToRoot(file: string): string {
  const rel = relative(paths.ROOT, file);
  return rel.startsWith('..') || isAbsolute(rel) ? file : rel;
}

/** A doc's repo-relative path with forward slashes, so generated/parse-warnings.json is the same on every OS. */
export function docPath(file: string): string {
  return relToRoot(file).split(sep).join('/');
}

/** `str.replace(old, new)`: every occurrence, the replacement taken literally. */
function replaceAll(text: string, placeholder: string, value: string): string {
  return text.split(placeholder).join(value);
}

function jsonDumps(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/** Atomic write that leaves the file untouched when the content is identical, so concurrent generator
 *  runs (one per platform) re-parsing the same docs neither race on the file nor bump its mtime.
 *  Returns true when the file was (re)written. */
export function writeIfChanged(file: string, text: string): boolean {
  if (existsSync(file) && readText(file) === text) return false;
  writeTextAtomic(file, text);
  return true;
}

export function splitFrontmatter(text: string, file: string): [Dict, string] {
  const m = FRONTMATTER.exec(text);
  if (!m) throw new DocError(`${name(file)}: missing YAML frontmatter block`);
  let fm: unknown;
  try {
    fm = yamlLoad(m[1] as string);
  } catch (e) {
    throw new DocError(`${name(file)}: invalid YAML frontmatter: ${e instanceof Error ? e.message : String(e)}`);
  }
  return [truthy(fm) ? (fm as Dict) : {}, m[2] as string];
}

/** {'When to use': '...markdown...', ...}; text before the first ## goes to 'Overview'. */
export function splitSections(body: string, file: string, allowed: string[] = ALLOWED_HEADINGS, required: string[] = REQUIRED_HEADINGS): Record<string, string> {
  const sections: Record<string, string> = {};
  let current = 'Overview';
  let buf: string[] = [];
  let inFence = false;
  for (const line of pySplitlines(body)) {
    if (line.startsWith('```')) inFence = !inFence;
    if (!inFence && line.startsWith('## ')) {
      sections[current] = pyStrip(buf.join('\n'));
      current = pyStrip(line.slice(3));
      if (!allowed.some((h) => current === h || current.startsWith(h + ' '))) {
        throw new DocError(`${name(file)}: heading '## ${current}' is not allowed. Use one of: ${allowed.join(', ')}`);
      }
      if (has(sections, current)) throw new DocError(`${name(file)}: duplicate section '## ${current}'`);
      buf = [];
    } else {
      buf.push(line);
    }
  }
  sections[current] = pyStrip(buf.join('\n'));
  for (const h of required) {
    if (!truthy(pyGet(sections, h, null))) throw new DocError(`${name(file)}: required section '## ${h}' is missing or empty`);
  }
  return Object.fromEntries(Object.entries(sections).filter(([, v]) => truthy(v)));
}

/** Seams the tests replace, the way the Python tests monkeypatched module globals. */
export const hooks = { componentWarnings };

function schemaErrors(schema: ZodType, data: unknown): string[] | null {
  const r = schema.safeParse(data);
  if (r.success) return null;
  const issues = [...r.error.issues].sort((a, b) => {
    const x = a.path.map(String);
    const y = b.path.map(String);
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      if (x[i] === undefined) return -1;
      if (y[i] === undefined) return 1;
      if (x[i] !== y[i]) return (x[i] as string) < (y[i] as string) ? -1 : 1;
    }
    return 0;
  });
  return issues.map((i) => `  - ${i.path.map(String).join('.') || '(root)'}: ${i.message}`);
}

/** The first prop, event, style binding, keyboard rule or scenario that authors `source`, as a dotted path; null
 *  when none does. The schema accepts the key because `stampSources` sets it; a doc may not. */
/** The foreground and background tokens of every a11y.contrast pair, as authored (interpolation unexpanded). */
function contrastTokens(c: Dict): string[] {
  return ((pyGet(c.a11y, 'contrast', []) ?? []) as Dict[]).flatMap((pair) => [pair.foreground, pair.background]);
}

export function authoredSource(block: Dict): string | null {
  for (const section of ['props', 'events', 'styles', 'copy']) {
    for (const [key, item] of Object.entries((truthy(block[section]) ? block[section] : {}) as Dict)) {
      if (typeof item === 'object' && item !== null && has(item, 'source')) return `${section}.${key}`;
    }
  }
  for (const section of ['keyboard', 'behavior']) {
    const items = (truthy(block[section]) ? block[section] : []) as Dict[];
    const i = items.findIndex((item) => typeof item === 'object' && item !== null && has(item, 'source'));
    if (i >= 0) return `${section}.${i}`;
  }
  return null;
}

/** Give every enum prop that names `enumRef` and spells out no `values` its vocabulary's values, in place. Runs once,
 *  right after schema validation, so generated/components.json always carries `values` and no reader downstream
 *  needs schema/vocab.ts. A prop with `values` keeps them: they narrow the vocabulary. */
export function resolveEnumRefs(c: Dict): void {
  for (const prop of Object.values((c.props ?? {}) as Dict) as Dict[]) {
    if (prop.type === 'enum' && prop.enumRef !== undefined && prop.values === undefined) prop.values = [...enumValues(prop)];
  }
}

export function validate(fm: Dict, file: string): void {
  const problems = schemaErrors(componentFrontmatter, fm);
  if (problems) throw new DocError([`${name(file)}: frontmatter failed schema validation:`, ...problems].join('\n'));
  const c: Dict = fm.component;
  resolveEnumRefs(c);
  const sourced = authoredSource(c);
  if (sourced !== null) throw new DocError(`${name(file)}: ${sourced} sets 'source' — only the parser may set that key`);
  const fileStem = stem(file).replace(/-/g, '').toLowerCase();
  if (String(c.name).toLowerCase() !== fileStem) throw new DocError(`${name(file)}: component.name '${c.name}' should match file name`);
  // Overrides: a binding is locked when it carries an accessibility guarantee — schema/component.ts's `mustLock`,
  // over every token the binding can resolve to. Generators expose every other binding as a per-instance override.
  // An explicit `locked: false` cannot opt out.
  const pairTokens = contrastTokens(c);
  for (const [bName, binding] of Object.entries((pyGet(c, 'styles', {}) ?? {}) as Dict)) {
    const rule = lockRule(bName, bindingTokens(binding as { token: string }), pairTokens, c.props);
    if (rule !== null && binding.locked === false) {
      throw new DocError(`${name(file)}: styles.${bName} sets locked: false, but '${binding.token}' must be locked (${rule})`);
    }
    binding.locked = Boolean(truthy(pyGet(binding, 'locked', false)) || rule !== null);
  }
  // Composition parts name a component that exists (or is explicitly planned); the schema checked they are anatomy parts.
  const composition = (truthy(c.composition) ? c.composition : {}) as Record<string, CompositionEntry>;
  for (const [part, entry] of Object.entries(composition)) {
    const target = compositionTarget(entry);
    if (!existsSync(composedFile(target.component)) && !target.planned) {
      throw new DocError(`${name(file)}: composition.${part} names '${typeof entry === 'string' ? entry : entry.component}', which has no doc (mark it '(planned)')`);
    }
  }
  // A deprecated component's replacement is another component with a doc; the schema checked the props and events a
  // prop's or event's use names.
  const use = c.deprecated?.use;
  if (use !== undefined && (use === c.name || !existsSync(composedFile(use)))) {
    throw new DocError(`${name(file)}: deprecated.use names '${use}', which is not another component with a doc`);
  }
  validateCompositionEntries(c, composition, file);
  checkUndeclaredFields(c, composition, file);
  checkDeprecatedComposition(composition, file);
  checkProseForwards(c, composition, file);
  // The halves of the target and keyboard-operable rules that read other docs. The schema accepted the doc because it
  // composes something; one composed component must then declare the requirement itself.
  const requires: string[] = c.a11y.requires;
  const target = requires.find((r) => TARGET_REQUIRES.includes(r));
  if (target !== undefined && !Object.values((pyGet(c, 'styles', {}) ?? {}) as Dict).some((b) => (b.token as string).startsWith(TARGET_TOKEN))) {
    if (!composedRequires(composition).some((reqs) => reqs.some((r) => TARGET_REQUIRES.includes(r)))) {
      throw new DocError(`${name(file)}: a11y.requires has '${target}' but no styles binding is on a ${TARGET_TOKEN}* token and no composed component declares a target requirement`);
    }
  }
  const role = resolveRole(c);
  if (requires.includes('keyboard-operable') && !truthy(c.keyboard) && !roleIn(WIDGET_ROLES, role)) {
    if (!composedRequires(composition).some((reqs) => reqs.includes('keyboard-operable'))) {
      throw new DocError(`${name(file)}: a11y.requires has 'keyboard-operable' but there is no keyboard block, a11y.role '${role}' is not a natively focusable widget role, and no composed component declares 'keyboard-operable'`);
    }
  }
  for (const sc of (truthy(c.behavior) ? c.behavior : []) as Dict[]) {
    if (has(sc, 'derived')) throw new DocError(`${name(file)}: behavior scenario '${sc.name}' sets 'derived' — only the parser may set that key`);
  }
}

/** The doc file of a composed component, by its name without `(planned)`. */
function composedFile(component: string): string {
  return join(paths.DOCS, `${component.toLowerCase()}.md`);
}

/** The `component:` block of a composed component's doc, as authored (no `locked` filled in); null when it has none. */
function composedDoc(component: string): Dict | null {
  const file = composedFile(component);
  if (!existsSync(file)) return null;
  const [fm] = splitFrontmatter(readText(file), file);
  return (fm.component ?? {}) as Dict;
}

/** `a11y.requires` of every component a composition names that has a doc (a planned one has none yet). */
function composedRequires(composition: Record<string, CompositionEntry>): string[][] {
  return Object.values(composition).flatMap((entry) => {
    const child = composedDoc(compositionTarget(entry).component);
    return child === null ? [] : [(child.a11y?.requires ?? []) as string[]];
  });
}

/** A composition part built from a component whose doc has status deprecated: the part is built from something on its
 *  way out. An error since job 651 (a warning until then, with the same text); a planned child has no doc, and a
 *  child doc that does not read is reported when that doc parses. */
function checkDeprecatedComposition(composition: Record<string, CompositionEntry>, file: string): void {
  for (const [part, entry] of Object.entries(composition)) {
    const target = compositionTarget(entry);
    let child: Dict | null = null;
    try {
      child = target.planned ? null : composedDoc(target.component);
    } catch (e) {
      if (!(e instanceof DocError)) throw e;
    }
    if (child?.status !== 'deprecated') continue;
    const replacement = child.deprecated?.use;
    throw new DocError(`${name(file)}: composition.${part}: ${target.component} is deprecated${typeof replacement === 'string' ? `; use ${replacement}` : ''}`);
  }
}

/** A child binding that no override reaches: authored `locked: true`, or locked by `lockRule` the way `validate`
 *  locks the child's own doc. */
function childLocked(child: Dict, bName: string, binding: Dict): boolean {
  return binding.locked === true || lockRule(bName, bindingTokens(binding as { token: string }), ((child.a11y?.contrast ?? []) as Dict[]).flatMap((pair) => [pair.foreground, pair.background]), (child.props ?? {}) as Dict) !== null;
}

/** Whether a literal can be a value of the prop: a scalar of its type, a whole number for an integer, one of an
 *  enum's values, text for content, anything for a union (its shape is prose), and nothing for array, object and
 *  function props. */
function literalFits(prop: Dict, value: string | number | boolean): boolean {
  if (prop.type === 'integer') return typeof value === 'number' && Number.isInteger(value);
  if (SCALAR_TYPES.includes(prop.type)) return typeof value === prop.type;
  if (prop.type === 'enum') return typeof value === 'string' && ((prop.values ?? []) as unknown[]).includes(value);
  if (prop.type === 'content') return typeof value === 'string';
  return prop.type === 'union';
}

const SCALAR_TYPES: readonly string[] = ['string', 'number', 'boolean'];

/** The half of an object composition entry that reads the child doc: every passed prop is a child prop its value
 *  fits, and every forward reaches a child binding the child's `overrides` can set. The schema checked the parent's
 *  half. A planned child has no doc to read. */
function validateCompositionEntries(c: Dict, composition: Record<string, CompositionEntry>, file: string): void {
  for (const [part, entry] of Object.entries(composition)) {
    if (typeof entry === 'string') continue;
    const target = compositionTarget(entry);
    const child = target.planned ? null : composedDoc(target.component);
    if (child === null) continue;
    const childName = target.component;
    const where = `${name(file)}: composition.${part}`;
    const childProps = (child.props ?? {}) as Dict;
    for (const [key, value] of Object.entries(entry.props ?? {})) {
      const prop = has(childProps, key) ? (childProps[key] as Dict) : undefined;
      if (prop === undefined) throw new DocError(`${where}.props.${key}: ${childName} has no prop '${key}'`);
      if (typeof value !== 'object') {
        if (literalFits(prop, value)) continue;
        if (prop.type === 'enum') throw new DocError(`${where}.props.${key}: ${pyRepr(value)} is not one of ${childName}.${key} values ${pyRepr(prop.values ?? [])}`);
        throw new DocError(`${where}.props.${key}: ${childName}.${key} is type '${prop.type}', which the literal ${pyRepr(value)} does not fit`);
      }
      const from = c.props[value.from] as Dict;
      if (from.type !== prop.type) throw new DocError(`${where}.props.${key}: ${c.name}.${value.from} is type '${from.type}', not ${childName}.${key}'s '${prop.type}'`);
      if (prop.type === 'enum') {
        const childValues = (prop.values ?? []) as unknown[];
        const outside = ((from.values ?? []) as unknown[]).filter((v) => !childValues.includes(v));
        if (outside.length) throw new DocError(`${where}.props.${key}: ${c.name}.${value.from} values ${pyRepr(outside)} are not among ${childName}.${key} values ${pyRepr(childValues)}`);
      }
    }
    const childStyles = (child.styles ?? {}) as Dict;
    for (const [binding, targetBinding] of Object.entries(entry.forwards ?? {})) {
      if (!has(childStyles, targetBinding)) throw new DocError(`${where}.forwards.${binding}: ${childName} has no styles binding '${targetBinding}'`);
      if (childLocked(child, targetBinding, childStyles[targetBinding] as Dict)) {
        throw new DocError(`${where}.forwards.${binding}: ${childName}.${targetBinding} is locked, so no override reaches it`);
      }
    }
  }
}

const PROSE_OVERRIDE = /overrides\.([A-Za-z][A-Za-z0-9]*)/g;

/** A style binding whose description forwards it to a composed child's `overrides.<key>` (a key other than its own
 *  name) and names that child: reject when the child has no such binding or locks it. Prose that claims a forward the
 *  child cannot receive is wrong wherever it is written; a forward the child can receive belongs in `forwards`, which
 *  `validateCompositionEntries` checks. A warning in job 612, an error since the phase 3 migration (job 639). This
 *  reads the child doc, so it stays in the parser layer rather than a Zod `.check`. */
function checkProseForwards(c: Dict, composition: Record<string, CompositionEntry>, file: string): void {
  const children = [...new Set(Object.values(composition).map(compositionTarget).filter((t) => !t.planned).map((t) => t.component))];
  for (const [bName, binding] of Object.entries((pyGet(c, 'styles', {}) ?? {}) as Dict)) {
    const text = typeof binding.description === 'string' ? binding.description : '';
    const keys = [...new Set([...text.matchAll(PROSE_OVERRIDE)].map((m) => m[1] as string))].filter((key) => key !== bName);
    if (!keys.length) continue;
    for (const childName of children.filter((n) => new RegExp(`\\b${n}s?\\b`).test(text))) {
      const child = composedDoc(childName);
      if (child === null) continue;
      const childStyles = (child.styles ?? {}) as Dict;
      for (const key of keys) {
        if (!has(childStyles, key)) throw new DocError(`${name(file)}: styles.${bName}: forwarded to ${childName} as overrides.${key}, but ${childName} has no '${key}' binding`);
        if (childLocked(child, key, childStyles[key] as Dict)) throw new DocError(`${name(file)}: styles.${bName}: forwarded to ${childName} as overrides.${key}, but ${childName}.${key} is locked, so no override reaches it`);
      }
    }
  }
}

/** The half of the form block that reads other docs: a form container composing a component with `name` and `error`
 *  props but no form block cannot say how that child joins it. A child declaring `form.role: field` is fine. A warning
 *  until the phase 3 migration gave every field its form block; an error since. */
function checkUndeclaredFields(c: Dict, composition: Record<string, CompositionEntry>, file: string): void {
  if (c.form?.role !== 'container') return;
  for (const [part, entry] of Object.entries(composition)) {
    const target = compositionTarget(entry);
    const child = target.planned ? null : composedDoc(target.component);
    if (child === null || child.form !== undefined) continue;
    const childProps = (child.props ?? {}) as Dict;
    if (has(childProps, 'name') && has(childProps, 'error')) {
      throw new DocError(`${name(file)}: composition.${part}: ${target.component} has 'name' and 'error' props but no form block, so ${String(c.name)} cannot tell how it joins as a field`);
    }
  }
}

export { BEHAVIOR_FOCUS_TARGETS, BEHAVIOR_STATES };

export const ACCESSIBLE_NAME_PLACEHOLDER = 'Accessible name';

/** The prop that gives the component its accessible name: the one that declares `a11yRole: accessible-name`
 *  (`componentDef` allows at most one). null when the name is intrinsic (children, heading text) or absent. */
export function accessibleNameProp(component: Dict): string | null {
  const props: Dict = truthy(component.props) ? component.props : {};
  for (const [propName, prop] of Object.entries(props)) {
    if (prop.a11yRole === 'accessible-name') return propName;
  }
  return null;
}

/** `given` for the derived has-accessible-name scenario: the naming prop with a value when it is optional
 *  (Icon's `label`), because the Default story leaves it out and the name would otherwise be empty. A required
 *  prop is already set by the story; an intrinsic name needs nothing. */
export function accessibleNameGiven(component: Dict): Dict | null {
  const propName = accessibleNameProp(component);
  if (propName === null) return null;
  const prop: Dict = component.props[propName];
  if (truthy(prop.required)) return null;
  if (prop.type === 'enum' && truthy(prop.values)) return { [propName]: prop.values[0] };
  if (prop.type === 'string' || prop.type === 'content') return { [propName]: ACCESSIBLE_NAME_PLACEHOLDER };
  return null;
}

/** Scenarios the schema already implies, so authors only write what it cannot infer:
 *  one render per enum value, an accessible-name check, a focusable check for
 *  keyboard-operable controls, and an error-identification check when there's an `error` prop. */
export function deriveBehavior(component: Dict): Dict[] {
  const props: Dict = truthy(component.props) ? component.props : {};
  const a11y: Dict = truthy(component.a11y) ? component.a11y : {};
  const requires: unknown[] = truthy(a11y.requires) ? a11y.requires : [];
  const declaredPlatforms = Object.keys(truthy(component.platforms) ? component.platforms : {});

  // Every derived scenario goes through the schema, so a shape or name it rejects fails the parse here rather
  // than reaching generated/components.json.
  const scenarios: Dict[] = [];
  const derive = (sc: Dict): void => { scenarios.push(behaviorScenario.parse({ ...sc, derived: true })); };

  derive({ name: 'renders', then: [{ renders: true }] });

  for (const [propName, prop] of Object.entries(props)) {
    if (prop.type !== 'enum') continue;
    for (const value of (truthy(prop.values) ? prop.values : []) as unknown[]) {
      const sc: Dict = { name: `renders-${kebab(propName)}-${kebab(String(value))}`, given: { [propName]: value }, then: [{ renders: true }] };
      if (has(prop, 'platforms')) sc.platforms = prop.platforms;
      derive(sc);
    }
  }

  if (requires.includes('accessible-name')) {
    const sc: Dict = { name: 'has-accessible-name', then: [{ name: true }] };
    const given = accessibleNameGiven(component);
    if (truthy(given)) sc.given = given;
    derive(sc);
  }

  if (requires.includes('keyboard-operable') && roleIn(WIDGET_ROLES, resolveRole({ ...component, a11y }))) {
    // A container (form, navigation, status region) is keyboard-operable through its children; only a widget
    // role names something that itself takes focus.
    derive({
      name: 'control-is-focusable',
      then: [{ focusable: true }],
      platforms: declaredPlatforms.filter((p) => p !== 'rn').sort(),
    });
  }

  if (requires.includes('error-identification') && has(props, 'error')) {
    derive({
      name: 'error-is-identified',
      given: { error: 'Fix this before continuing.' },
      then: [
        { text: 'Fix this before continuing.' },
        { state: 'invalid', is: true, platforms: ['web', 'lit'] },
      ],
    });
  }

  // An overlay dismissed by Escape reports it through its close event. React Native has no keyboard.
  const overlay: Dict = truthy(component.overlay) ? component.overlay : {};
  if (((overlay.dismiss ?? []) as unknown[]).includes('escape') && typeof overlay.open === 'string' && typeof overlay.closeEvent === 'string') {
    derive({
      name: `escape-fires-${kebab(overlay.closeEvent)}`,
      given: { [overlay.open]: true },
      when: { key: 'Escape' },
      then: [{ event: overlay.closeEvent }],
      platforms: declaredPlatforms.filter((p) => p !== 'rn').sort(),
    });
  }

  return scenarios;
}

/** Authored scenarios plus the derived ones, minus any derived scenario whose name an author already used. */
export function mergedBehavior(component: Dict, derived: Dict[]): Dict[] {
  const authored: Dict[] = truthy(component.behavior) ? component.behavior : [];
  const names = new Set(authored.map((sc) => sc.name));
  return [...authored, ...derived.filter((sc) => !names.has(sc.name))];
}

/** The merged scenario list narrowed to one platform: scenarios and `then` items whose
 *  `platforms` exclude it are dropped (with the now-redundant key stripped from survivors),
 *  and a scenario left with no applicable expectations is dropped entirely. The component is
 *  narrowed too (`narrowForPlatform`): a scenario that sets an enum value the platform does not
 *  offer is dropped, and so is a derived scenario only a requirement narrowed away implies. */
export function behaviorFor(component: Dict, derived: Dict[], platform: string): Dict[] {
  const narrowed = narrowForPlatform(component, platform);
  const requires = (c: Dict): unknown[] => (c.a11y?.requires ?? []) as unknown[];
  const names = (c: Dict): Set<unknown> => new Set(deriveBehavior(c).map((sc) => sc.name));
  const kept = requires(narrowed).length === requires(component).length ? null : names(narrowed);
  const lost = kept === null ? new Set<unknown>() : new Set([...names(component)].filter((n) => !kept.has(n)));
  const offersAll = (values: unknown): boolean =>
    Object.entries((values ?? {}) as Dict).every(([propName, value]) => {
      const before = (component.props ?? {})[propName] as Dict | undefined;
      const after = (narrowed.props ?? {})[propName] as Dict | undefined;
      return !Array.isArray(before?.values) || !before.values.includes(value) || !Array.isArray(after?.values) || after.values.includes(value);
    });
  const result: Dict[] = [];
  for (const sc of mergedBehavior(component, derived)) {
    const scenarioPlatforms = (sc.platforms ?? null) as string[] | null;
    if (scenarioPlatforms !== null && !scenarioPlatforms.includes(platform)) continue;
    if ((sc.derived === true && lost.has(sc.name)) || !offersAll(sc.given) || !offersAll((sc.when as Dict | undefined)?.set)) continue;
    const thenItems: Dict[] = [];
    for (let item of sc.then as Dict[]) {
      const itemPlatforms = (item.platforms ?? null) as string[] | null;
      if (itemPlatforms !== null) {
        if (!itemPlatforms.includes(platform)) continue;
        item = Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'platforms'));
      }
      thenItems.push(item);
    }
    if (!thenItems.length) continue;
    result.push({ ...sc, then: thenItems });
  }
  return result;
}

// ---------------------------------------------------------------- extensions
// An extension doc (site/src/content/docs/extensions/<Component>.<name>.md) adds to a component's schema at parse
// time — add-only, no collisions, no locked bindings — and declares hand-written modules the generated code must
// call. See site/src/content/docs/process/extending-components.md for the contract.

export const EXT_SECTIONS: readonly string[] = ['props', 'events', 'styles', 'copy'];

/** The sections an extension's `omit` removes upstream items from, in the order the summary and prose list them. */
export const OMIT_SECTIONS: readonly string[] = [...EXT_SECTIONS, 'behavior'];

/** `upstreamDefaults` is filled in by `mergeExtensions`: each prop the extension's `defaults` changed → the upstream
 *  default it replaced (null when upstream had none), for `extensionSummary` and `extensionsProse`. */
export type ExtensionRecord = { file: string; name: string; extends: string; extension: Dict; body: string; title: string; upstreamDefaults?: Record<string, unknown> };

/** {component name: [extension records]} in file order, plus the errors of docs that did not validate.
 *  A record: file (repo-relative), name, extends, extension (the frontmatter block), body (prose), title. */
export function loadExtensions(): [Record<string, ExtensionRecord[]>, string[]] {
  const byComponent: Record<string, ExtensionRecord[]> = {};
  const errors: string[] = [];
  if (!existsSync(paths.EXT_DOCS)) return [byComponent, errors];
  for (const file of mdFiles(paths.EXT_DOCS)) {
    const rel = `extensions/${name(file)}`;
    try {
      const [fm, body] = splitFrontmatter(readText(file), file);
      if (!has(fm, 'extension')) throw new DocError(`${rel}: no \`extension:\` block in frontmatter`);
      const problems = schemaErrors(extensionFrontmatter, fm);
      if (problems) throw new DocError([`${rel}: frontmatter failed schema validation:`, ...problems].join('\n'));
      const x: Dict = fm.extension;
      const sourced = authoredSource(x);
      if (sourced !== null) throw new DocError(`${rel}: ${sourced} sets 'source' — only the parser may set that key`);
      const expected = `${x.extends}.${x.name}.md`;
      if (name(file) !== expected) throw new DocError(`${rel}: file should be named ${expected} (extends + name)`);
      (byComponent[x.extends] ??= []).push({ file: rel, name: x.name, extends: x.extends, extension: x, body: pyStrip(body), title: pyGet(fm, 'title', stem(file)) as string });
    } catch (e) {
      if (!(e instanceof DocError)) throw e;
      errors.push(e.message);
    }
  }
  return [byComponent, errors];
}

export type Added = [Dict, string];

/** The platforms an item keeps under an extension's `platforms`: the extension's, or the intersection with the
 *  item's own. */
function narrowPlatforms(item: Dict, platforms: string[]): void {
  item.platforms = Array.isArray(item.platforms) ? (item.platforms as string[]).filter((p) => platforms.includes(p)) : [...platforms];
}

/** Whether an extension changes or removes anything upstream declares, rather than only adding. */
function reshapesUpstream(ext: ExtensionRecord): boolean {
  return truthy(ext.extension.defaults) || truthy(ext.extension.omit);
}

/** The line a schema error gets when the component it reports on was reshaped by `defaults` or `omit`, so the
 *  error in the component doc points at the extensions that made it; empty when no extension did. */
export function mergedWithLine(exts: ExtensionRecord[]): string {
  const files = exts.filter(reshapesUpstream).map((ext) => ext.file);
  return files.length ? `\n  (merged with ${files.join(', ')})` : '';
}

/** Merge every extension into the component in place, in file order. For each extension: the add-only sections (a
 *  name that upstream or an earlier extension already declares is an error naming the extension file), then anatomy
 *  parts and contrast pairs (appended, same collision rule), then the `platforms` narrowing of what it added, then
 *  `defaults` and finally `omit`, both on upstream items only. Returns the merged dict items with the file that added
 *  them, for stamping `source` after schema validation (which rejects a `source` a doc authored itself). An object
 *  copy entry is stamped like any other item; a plain copy string cannot carry the marker, and `extensionSummary`
 *  lists both under `adds.copy`. Contrast pairs are not stamped: `checkExtensionLocks` finds them on the record. */
export function mergeExtensions(c: Dict, exts: ExtensionRecord[]): Added[] {
  const added: Added[] = [];
  const upstream = `${c.name}'s own schema`;
  const owner = new Map<string, string>(); // "section\0key" -> who declared it
  const ownerKey = (section: string, key: string): string => `${section}\0${key}`;
  for (const section of EXT_SECTIONS) {
    for (const key of Object.keys(truthy(c[section]) ? c[section] : {})) owner.set(ownerKey(section, key), upstream);
  }
  for (const sc of (truthy(c.behavior) ? c.behavior : []) as Dict[]) owner.set(ownerKey('behavior', sc.name), upstream);
  for (const part of (Array.isArray(c.anatomy) ? c.anatomy : []) as string[]) owner.set(ownerKey('anatomy', part), upstream);
  const pairKey = (pair: Dict): string => ownerKey('contrast', `${pair.foreground}\0${pair.background}`);
  for (const pair of (pyGet(c.a11y, 'contrast', []) ?? []) as Dict[]) owner.set(pairKey(pair), upstream);
  const upstreamProps = new Set(Object.keys(truthy(c.props) ? c.props : {}));
  const moduleOwner = new Map<string, string>();
  const defaultOwner = new Map<string, string>(); // prop -> the extension that changed its default
  const omitOwner = new Map<string, string>(); // "section\0name" -> the extension that removed it
  for (const ext of exts) {
    const x = ext.extension;
    const file = ext.file;
    const mine: Dict[] = []; // props, bindings, rules and scenarios this extension adds, for the platforms narrowing
    for (const section of EXT_SECTIONS) {
      for (const [key, value] of Object.entries((truthy(x[section]) ? x[section] : {}) as Dict)) {
        if (owner.has(ownerKey(section, key))) throw new DocError(`${file}: ${section}.${key} collides with ${owner.get(ownerKey(section, key))}`);
        if (section === 'styles' && truthy(value.locked)) throw new DocError(`${file}: styles.${key} is locked — an extension may add only overridable bindings`);
        owner.set(ownerKey(section, key), file);
        if (!has(c, section)) c[section] = {};
        c[section][key] = value;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) added.push([value, file]);
        if (section === 'props' || section === 'styles') mine.push(value);
      }
    }
    for (const rule of (truthy(x.keyboard) ? x.keyboard : []) as Dict[]) {
      if (!has(c, 'keyboard')) c.keyboard = [];
      c.keyboard.push(rule);
      added.push([rule, file]);
      mine.push(rule);
    }
    for (const sc of (truthy(x.behavior) ? x.behavior : []) as Dict[]) {
      if (owner.has(ownerKey('behavior', sc.name))) throw new DocError(`${file}: behavior scenario '${sc.name}' collides with ${owner.get(ownerKey('behavior', sc.name))}`);
      owner.set(ownerKey('behavior', sc.name), file);
      if (!has(c, 'behavior')) c.behavior = [];
      c.behavior.push(sc);
      added.push([sc, file]);
      mine.push(sc);
    }
    for (const mod of Object.keys(truthy(x.modules) ? x.modules : {})) {
      if (moduleOwner.has(mod)) throw new DocError(`${file}: module '${mod}' collides with ${moduleOwner.get(mod)}`);
      moduleOwner.set(mod, file);
    }
    for (const part of (truthy(x.anatomy) ? x.anatomy : []) as string[]) {
      if (owner.has(ownerKey('anatomy', part))) throw new DocError(`${file}: anatomy.${part} collides with ${owner.get(ownerKey('anatomy', part))}`);
      owner.set(ownerKey('anatomy', part), file);
      if (!Array.isArray(c.anatomy)) c.anatomy = [];
      c.anatomy.push(part);
    }
    for (const pair of (pyGet(x.a11y, 'contrast', []) ?? []) as Dict[]) {
      if (owner.has(pairKey(pair))) throw new DocError(`${file}: a11y.contrast pair ${pair.foreground} on ${pair.background} collides with ${owner.get(pairKey(pair))}`);
      owner.set(pairKey(pair), file);
      if (typeof c.a11y !== 'object' || c.a11y === null) c.a11y = {};
      if (!Array.isArray(c.a11y.contrast)) c.a11y.contrast = [];
      c.a11y.contrast.push(pair);
    }
    if (truthy(x.platforms)) {
      const declared = (truthy(c.platforms) ? c.platforms : {}) as Dict;
      for (const p of x.platforms as string[]) {
        if (!has(declared, p) || !truthy(pyGet(declared[p], 'supported', true))) throw new DocError(`${file}: platforms includes '${p}', which ${c.name} does not support`);
      }
      // Events are not narrowed: eventDef.platforms is a per-platform mapping, which must still name every platform.
      for (const item of mine) narrowPlatforms(item, x.platforms);
    }
    const upstreamDefaults: Record<string, unknown> = {};
    for (const [propName, value] of Object.entries((truthy(x.defaults) ? x.defaults : {}) as Dict)) {
      const where = `${file}: defaults.${propName}`;
      if (!upstreamProps.has(propName)) throw new DocError(`${where} names no prop upstream on ${c.name}`);
      const other = defaultOwner.get(propName) ?? omitOwner.get(ownerKey('props', propName));
      if (other !== undefined) throw new DocError(`${where} collides with ${other}`);
      const prop = c.props[propName] as Dict;
      if (pyGet(c.a11y, 'roleFrom', null) === propName) throw new DocError(`${where} is ${c.name}'s a11y.roleFrom — its default decides the rendered role`);
      if (prop.required === true) throw new DocError(`${where} is required, so a default never applies`);
      defaultOwner.set(propName, file);
      upstreamDefaults[propName] = has(prop, 'default') ? prop.default : null;
      prop.default = value;
      const result = propDef.safeParse(prop);
      const issues = result.success ? [] : result.error.issues.filter((i) => i.path[0] === 'default');
      if (issues.length) throw new DocError(issues.map((i) => `${where}: ${i.message}`).join('\n'));
    }
    if (truthy(x.defaults)) ext.upstreamDefaults = upstreamDefaults;
    const omit = (truthy(x.omit) ? x.omit : {}) as Dict;
    for (const section of OMIT_SECTIONS) {
      for (const itemName of (truthy(omit[section]) ? omit[section] : []) as string[]) {
        const where = `${file}: omit.${section}.${itemName}`;
        const declaredBy = owner.get(ownerKey(section, itemName));
        if (declaredBy !== undefined && declaredBy !== upstream) throw new DocError(`${where} was added by ${declaredBy}; remove it there`);
        const other = omitOwner.get(ownerKey(section, itemName)) ?? (section === 'props' ? defaultOwner.get(itemName) : undefined);
        if (other !== undefined) throw new DocError(`${where} collides with ${other}`);
        if (declaredBy === undefined) throw new DocError(`${where} names nothing upstream on ${c.name}`);
        if (section === 'props') {
          const prop = c.props[itemName] as Dict;
          const guarantees = [
            ...(prop.required === true ? ['required'] : []),
            ...(has(prop, 'a11yRole') ? [`a11yRole: ${prop.a11yRole}`] : []),
            ...(pyGet(c.a11y, 'roleFrom', null) === itemName ? ['a11y.roleFrom'] : []),
            ...(accessibleNameProp(c) === itemName ? ['the accessible-name prop'] : []),
          ];
          if (guarantees.length) throw new DocError(`${where} carries an accessibility guarantee (${guarantees.join(', ')})`);
        }
        if (section === 'styles') {
          const binding = c.styles[itemName] as Dict;
          const rule = binding.locked === true ? 'locked: true' : lockRule(itemName, bindingTokens(binding as { token: string }), contrastTokens(c), c.props);
          if (rule !== null) throw new DocError(`${where} binds '${binding.token}', which is locked (${rule}) — an extension may not remove an accessibility guarantee`);
        }
        omitOwner.set(ownerKey(section, itemName), file);
        owner.delete(ownerKey(section, itemName));
        if (section === 'behavior') c.behavior = (c.behavior as Dict[]).filter((sc) => sc.name !== itemName);
        else delete c[section][itemName];
      }
    }
  }
  return added;
}

/** After the merge: an extension binding that `lockRule` would lock (any token it can resolve to is a focus or
 *  target token or sits in a contrast pair, or its name is a focus ring / target) is a claim the extension may not
 *  make. The one exception is a binding locked only by a contrast pair the same extension adds: the extension states
 *  that guarantee itself, and `validate` has already locked the binding. */
export function checkExtensionLocks(c: Dict, added: Added[], exts: ExtensionRecord[] = []): void {
  const pairs = (pyGet(c.a11y, 'contrast', []) ?? []) as Dict[];
  for (const [bName, binding] of Object.entries((truthy(c.styles) ? c.styles : {}) as Dict)) {
    for (const [item, file] of added) {
      if (item !== binding) continue;
      const own = new Set((pyGet(exts.find((ext) => ext.file === file)?.extension.a11y, 'contrast', []) ?? []) as Dict[]);
      const pairTokens = pairs.filter((pair) => !own.has(pair)).flatMap((pair) => [pair.foreground, pair.background]);
      if (lockRule(bName, bindingTokens(binding as { token: string }), pairTokens, c.props) !== null) {
        throw new DocError(`${file}: styles.${bName} binds '${binding.token}', which is locked (contrast pair, focus ring or target) — an extension may add only overridable bindings`);
      }
    }
  }
}

export function stampSources(added: Added[]): void {
  for (const [item, file] of added) item.source = file;
}

/** The platforms a module is called on: its own, else its extension's, else every platform the component supports. */
function modulePlatforms(m: Dict, x: Dict, supported: string[]): string[] {
  return [...(truthy(m.platforms) ? m.platforms : truthy(x.platforms) ? x.platforms : supported)];
}

/** What goes into generated/components.json next to the component: per extension, what it added and its modules
 *  (with `platforms` filled in from the extension, then the component, when omitted). An extension that uses
 *  `anatomy`, `a11y`, `platforms`, `defaults` or `omit` also gets `anatomy`, `contrast` (a count), `platforms`,
 *  `defaults` ({ prop: { from, to } }) and `omits` ({ section: [names] }); one that does not gets none of those keys. */
export function extensionSummary(c: Dict, exts: ExtensionRecord[]): Dict[] {
  const supported = Object.entries(c.platforms as Dict).filter(([, n]) => truthy(pyGet(n, 'supported', true))).map(([pl]) => pl);
  const out: Dict[] = [];
  for (const ext of exts) {
    const x = ext.extension;
    const modules: Dict = {};
    for (const [modName, m] of Object.entries((truthy(x.modules) ? x.modules : {}) as Dict)) {
      modules[modName] = { ...m, platforms: modulePlatforms(m, x, supported) };
    }
    const adds: Dict = {};
    for (const sec of EXT_SECTIONS) if (truthy(x[sec])) adds[sec] = Object.keys(x[sec]).sort();
    const entry: Dict = {
      name: ext.name, file: ext.file, title: ext.title, description: pyGet(x, 'description', ''),
      adds,
      keyboard: (truthy(x.keyboard) ? x.keyboard : []).length, behavior: (truthy(x.behavior) ? x.behavior : []).map((sc: Dict) => sc.name),
      modules,
    };
    if (truthy(x.anatomy)) entry.anatomy = [...x.anatomy];
    if (truthy(x.a11y)) entry.contrast = x.a11y.contrast.length;
    if (truthy(x.platforms)) entry.platforms = [...x.platforms];
    if (truthy(x.defaults)) entry.defaults = Object.fromEntries(Object.entries(x.defaults as Dict).map(([p, to]) => [p, { from: ext.upstreamDefaults?.[p] ?? null, to }]));
    if (truthy(x.omit)) entry.omits = Object.fromEntries(OMIT_SECTIONS.filter((sec) => truthy(x.omit[sec])).map((sec) => [sec, [...x.omit[sec]]]));
    out.push(entry);
  }
  return out;
}

/** A default as prose: the literal in backticks, or "no default". */
function defaultProse(value: unknown): string {
  return value === null || value === undefined ? 'no default' : `\`${String(value)}\``;
}

/** The lines that tell the model what an extension changed or removed upstream. The component's guidance prose still
 *  describes upstream, so without them the model would put the items back. Empty for an extension that only adds. */
function reshapeLines(ext: ExtensionRecord): string[] {
  const x = ext.extension;
  const lines: string[] = [];
  if (truthy(x.defaults)) {
    const changes = Object.entries(x.defaults as Dict).map(([p, to]) => `\`${p}\` ${defaultProse(ext.upstreamDefaults?.[p] ?? null)} → ${defaultProse(to)}`);
    lines.push(`Defaults changed from upstream: ${changes.join(', ')}.`);
  }
  if (truthy(x.omit)) {
    const removed = OMIT_SECTIONS.flatMap((sec) => ((truthy(x.omit[sec]) ? x.omit[sec] : []) as string[]).map((n) => `${sec} \`${n}\``));
    lines.push(`Removed from upstream: ${removed.join(', ')}.`);
  }
  return lines;
}

/** packages/<pkg>/src/custom/analytics.ts → './custom/analytics' (Lit imports carry the .js extension). */
export function moduleImport(modulePath: string, platform: string): string {
  const s = modulePath.replace(/\.(ts|tsx)$/, '');
  return platform === 'lit' ? `./${s}.js` : `./${s}`;
}

/** The `## Extensions` section of a prompt: each extension's prose, what it changed or removed upstream, and its
 *  module contracts as import + call instructions. An extension whose `platforms` leave this platform out adds
 *  nothing here, so only what it changed or removed upstream (which applies everywhere) is listed, without its prose.
 *  Empty when no extension has anything for this platform. */
export function extensionsProse(exts: ExtensionRecord[], platform: string, supported: string[]): string {
  const parts: string[] = [];
  for (const ext of exts) {
    const x = ext.extension;
    const reshaped = reshapeLines(ext);
    if (truthy(x.platforms) && !(x.platforms as string[]).includes(platform)) {
      if (reshaped.length) parts.push([`### ${ext.name} — \`${ext.file}\``, '', ...reshaped.flatMap((line, i) => (i ? ['', line] : [line]))].join('\n'));
      continue;
    }
    const modules = Object.entries((truthy(x.modules) ? x.modules : {}) as Dict).filter(([, m]) => modulePlatforms(m, x, supported).includes(platform));
    const block = [`### ${ext.name} — \`${ext.file}\``, '', truthy(ext.body) ? ext.body : '(no prose)'];
    for (const line of reshaped) block.push('', line);
    if (modules.length) {
      block.push('', '**Hand-written modules** — import and call them exactly as stated; never create, edit or copy anything under `src/custom/`:', '');
      for (const [modName, m] of modules) {
        block.push(`- \`import { ${modName} } from '${moduleImport(m.path, platform)}';\` — signature \`${m.signature}\`. ${m.wire}`);
      }
    }
    parts.push(block.join('\n'));
  }
  if (!parts.length) return '';
  return '## Extensions\n\nThe schema above already includes what these extensions add (items marked `source: extensions/...`). Implement them like any other prop, event, binding, copy string, keyboard rule or scenario.\n\n' + parts.join('\n\n');
}

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}

function pathKey(p: string): string {
  const r = resolve(p);
  return process.platform === 'win32' ? r.toLowerCase() : r;
}

/** generated/modules/<platform>/<path>.d.ts per declared module, from its signature. The `modules` gate
 *  (tools/check_modules.ts) typechecks the real file against it. Stale stubs are removed.
 *  (The header line named tools/parse.py until the Python tool was retired; that is the one deliberate
 *  difference from its output.) */
export function writeModuleStubs(components: Dict[]): number {
  const stubs = new Map<string, { file: string; lines: string[] }>();
  for (const e of components) {
    for (const ext of (truthy(e.extensions) ? e.extensions : []) as Dict[]) {
      for (const [modName, m] of Object.entries((truthy(ext.modules) ? ext.modules : {}) as Dict)) {
        for (const platform of m.platforms as string[]) {
          if (!isTsPlatform(platform)) continue; // a stub is a .d.ts: modules exist on the TypeScript packages only
          const f = join(paths.OUT, 'modules', platform, (m.path as string).replace(/\.(ts|tsx)$/, '.d.ts'));
          const entry = stubs.get(pathKey(f)) ?? { file: f, lines: [] };
          entry.lines.push(`/** ${e.component.name}.${ext.name}: ${m.wire} */\nexport declare const ${modName}: ${m.signature};`);
          stubs.set(pathKey(f), entry);
        }
      }
    }
  }
  for (const { file, lines } of stubs.values()) {
    writeIfChanged(file, "// Generated by tools/parse.ts from the extension docs' `modules` signatures. Do not edit.\n" + lines.join('\n') + '\n');
  }
  const modulesDir = join(paths.OUT, 'modules');
  if (existsSync(modulesDir)) {
    for (const old of walkFiles(modulesDir)) {
      if (old.endsWith('.d.ts') && !stubs.has(pathKey(old))) unlinkSync(old);
    }
  }
  return stubs.size;
}

// ---------------------------------------------------------------- patterns
// A pattern doc (site/src/content/docs/patterns/<name>.md) is a page made only of system components. It has no
// `component:` block; its contract is the code block under "## Structure" (a tree of components with props) plus
// "## Behaviors the page must show". The parser checks every component and prop the tree names against the
// component schemas and emits one prompt per platform from prompts/templates/pattern-<platform>.md.

export const PATTERN_HEADINGS: string[] = ['Overview', 'What the page is', 'Structure', 'Behaviors the page must show', 'Themes and platforms',
  'Seams to look for', 'Acceptance'];
export const PATTERN_REQUIRED: string[] = ['Structure', 'Behaviors the page must show'];
const FENCE = /```[^\n]*\n([\s\S]*?)```/;
const KEYED = /([A-Za-z_][A-Za-z0-9_]*)=("([^"]*)"|[^\s"]+)/g;
const QUOTED = /"([^"]*)"/g;
const PARENS = /\(([^)]*)\)/g;
const CAMEL = /[a-z][A-Z]/;

/** 'Settings page' → 'SettingsPage' (the demo file, the story and the target name). */
export function patternName(title: string): string {
  return (title.match(/[A-Za-z0-9]+/g) ?? []).map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join('');
}

export function kebab(s: string): string {
  return s.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();
}

export type StructureNode = {
  line: number; depth: number; component: string; props: Record<string, string>; questions: Record<string, string>;
  flags: string[]; copy: string[]; notes: string[]; partOf?: string; part?: string | null;
};

/** The Structure tree, one node per non-empty line: component (first word), `prop=value` props, bare-word
 *  flags (a boolean prop, an event, a part or an enum shorthand — validated later), quoted copy, parenthesised
 *  or trailing prose as notes, and `prop=value?` open questions. Depth is the indent in two-space steps. */
export function parseStructure(text: string): StructureNode[] {
  const nodes: StructureNode[] = [];
  pySplitlines(text).forEach((raw, i) => {
    const lineno = i + 1;
    if (!truthy(pyStrip(raw))) return;
    const indent = raw.length - raw.replace(/^ +/, '').length;
    let line = pyStrip(raw);
    const props: Record<string, string> = {};
    const questions: Record<string, string> = {};
    const rest: string[] = [];
    let pos = 0;
    for (const m of line.matchAll(KEYED)) {
      rest.push(line.slice(pos, m.index));
      const key = m[1] as string;
      const value = (m[3] !== undefined ? m[3] : m[2]) as string;
      if (value.endsWith('?')) questions[key] = value.slice(0, -1);
      else props[key] = value;
      pos = (m.index as number) + m[0].length;
    }
    rest.push(line.slice(pos));
    line = rest.join(' ');
    const notes = [...line.matchAll(PARENS)].map((m) => pyStrip(m[1] as string)).filter((n) => truthy(n));
    line = line.replace(PARENS, ' ');
    const copy = [...line.matchAll(QUOTED)].map((m) => m[1] as string);
    let head = line;
    let tail = '';
    if (line.includes('"')) {
      const at = line.indexOf('"');
      head = line.slice(0, at);
      tail = pyStrip(('"' + line.slice(at + 1)).replace(QUOTED, ' ')); // prose after the copy, e.g. '→ AlertDialog', 'on successful submit'
    }
    if (truthy(tail)) notes.push(tail);
    const words = pySplit(head);
    if (!words.length) return;
    nodes.push({ line: lineno, depth: Math.floor(indent / 2), component: words[0] as string, props, questions, flags: words.slice(1), copy, notes });
  });
  return nodes;
}

/** `TabPanel` → (Tabs, 'panel'): a component name (or its singular) followed by a capitalised anatomy part. */
export function resolvePart(partName: string, comps: Record<string, Dict>): [Dict | null, string | null] {
  for (const [cname, c] of Object.entries(comps)) {
    for (const part of (truthy(c.anatomy) ? c.anatomy : []) as string[]) {
      const cap = part.slice(0, 1).toUpperCase() + part.slice(1);
      if (partName === cname + cap || partName === cname.replace(/s+$/, '') + cap) return [c, part];
    }
  }
  return [null, null];
}

/** Every component must exist; every `prop=value` must name a prop or event (enum values checked); a camelCase
 *  flag must be a prop or event; other bare words are enum shorthands, parts, or prose. Returns the components
 *  used, in order of first use. */
export function validateStructure(nodes: StructureNode[], comps: Record<string, Dict>, file: string): string[] {
  const used: string[] = [];
  for (const n of nodes) {
    const compName = n.component;
    let c = pyGet(comps, compName, null) as Dict | null;
    if (c === null) {
      const [resolved, part] = resolvePart(compName, comps);
      c = resolved;
      if (c === null) throw new DocError(`${file}: line ${n.line}: unknown component '${compName}'`);
      n.partOf = c.name;
      n.part = part;
      continue;
    }
    if (!used.includes(compName)) used.push(compName);
    const props: Dict = truthy(c.props) ? c.props : {};
    const events: Dict = truthy(c.events) ? c.events : {};
    const anatomy = new Set<string>(truthy(c.anatomy) ? c.anatomy : []);
    const enumValues = new Set<unknown>();
    for (const pd of Object.values(props) as Dict[]) if (pd.type === 'enum') for (const v of (truthy(pd.values) ? pd.values : []) as unknown[]) enumValues.add(v);
    for (const [key, value] of Object.entries(n.props)) {
      if (!has(props, key) && !has(events, key)) throw new DocError(`${file}: line ${n.line}: ${compName} has no prop or event '${key}'`);
      const pd = pyGet(props, key, null) as Dict | null;
      if (truthy(pd) && (pd as Dict).type === 'enum' && !((pd as Dict).values as unknown[]).includes(pyStr(value))) {
        throw new DocError(`${file}: line ${n.line}: ${compName}.${key}: '${value}' is not one of ${pyRepr((pd as Dict).values)}`);
      }
    }
    for (const flag of n.flags) {
      if (has(props, flag) || has(events, flag) || anatomy.has(flag) || enumValues.has(flag)) continue;
      if (CAMEL.test(flag)) throw new DocError(`${file}: line ${n.line}: ${compName} has no prop or event '${flag}'`);
    }
  }
  return used;
}

export function patternComponentsSection(used: string[], comps: Record<string, Dict>, platform: string): string {
  const lines = ['## Components used', '', `Every one exists in \`packages/${PACKAGE_DIR[platform]}/src\`; import from there and read a file only when a prop's behaviour is unclear.`, ''];
  for (const compName of used) {
    const c = comps[compName] as Dict;
    const platforms: Dict = truthy(c.platforms) ? c.platforms : {};
    const notes: Dict = truthy(platforms[platform]) ? platforms[platform] : {};
    const where = truthy(notes.tag) ? notes.tag : truthy(notes.element) ? notes.element : '';
    lines.push(`- \`${compName}\` — \`packages/${PACKAGE_DIR[platform]}/src/${compName}.*\`` + (truthy(where) ? ` (${where})` : ''));
  }
  return lines.join('\n');
}

/** Pattern docs → generated/prompts/Pattern.<Name>.<platform>.md per platform that has a pattern template. */
export function parsePatterns(components: Dict[]): [Dict[], string[]] {
  const patterns: Dict[] = [];
  const errors: string[] = [];
  if (!existsSync(paths.PATTERN_DOCS)) return [patterns, errors];
  const comps: Record<string, Dict> = {};
  for (const e of components) comps[e.component.name] = e.component;
  for (const file of mdFiles(paths.PATTERN_DOCS)) {
    try {
      const [fm, body] = splitFrontmatter(readText(file), file);
      if (has(fm, 'component') || has(fm, 'theme')) throw new DocError(`${name(file)}: has a component:/theme: block, so it is not a pattern`);
      const sections = splitSections(body, file, PATTERN_HEADINGS, PATTERN_REQUIRED);
      const m = FENCE.exec(sections.Structure as string);
      if (!m) throw new DocError(`${name(file)}: the Structure section has no code block`);
      const structure = pyRstrip(m[1] as string);
      const nodes = parseStructure(structure);
      const used = validateStructure(nodes, comps, name(file));
      const title = pyStr(pyGet(fm, 'title', stem(file)));
      const pName = patternName(title);
      const behaviors = sections['Behaviors the page must show'] as string;
      const guidance = PATTERN_HEADINGS.filter((h) => has(sections, h) && h !== 'Structure' && h !== 'Behaviors the page must show').map((h) => `## ${h}\n\n${sections[h]}`).join('\n\n');
      const written: string[] = [];
      // A pattern page lands in the package's demo/, which only the TypeScript packages have.
      for (const platform of TS_PLATFORMS) {
        const templatePath = join(paths.TEMPLATES, `pattern-${platform}.md`);
        if (!existsSync(templatePath)) continue;
        let prompt = readText(templatePath);
        prompt = replaceAll(prompt, '{{NAME}}', pName);
        prompt = replaceAll(prompt, '{{TITLE}}', title);
        prompt = replaceAll(prompt, '{{PLATFORM}}', platform);
        prompt = replaceAll(prompt, '{{KEBAB}}', kebab(pName));
        prompt = replaceAll(prompt, '{{COMPONENTS}}', patternComponentsSection(used, comps, platform));
        prompt = replaceAll(prompt, '{{STRUCTURE}}', structure);
        prompt = replaceAll(prompt, '{{BEHAVIORS}}', behaviors);
        prompt = replaceAll(prompt, '{{GUIDANCE}}', guidance);
        writeIfChanged(join(paths.OUT, 'prompts', `Pattern.${pName}.${platform}.md`), prompt);
        written.push(platform);
      }
      const questions: Dict = {};
      for (const n of nodes) if (truthy(n.questions)) questions[n.component] = n.questions;
      patterns.push({ id: stem(file), name: pName, title, components: used, platforms: written, questions, source: relToRoot(file) });
    } catch (e) {
      if (!(e instanceof DocError)) throw e;
      errors.push(e.message);
    }
  }
  return [patterns, errors];
}

// ---------------------------------------------------------------- declared contracts
// What the phase 2 fields ask of a generator, resolved for one platform (emitted event names, slot names, computed
// expressions, narrowed copy), so the model builds from values instead of recomputing them. Each section is empty,
// heading and all, when the component uses none of its fields, so a doc that uses none keeps the prompt it had.

function contractSection(title: string, lines: string[]): string {
  return lines.length ? `## ${title}\n\n${lines.join('\n')}\n\n` : '';
}

/** False when the item's own `platforms` leave `platform` out. */
const onPlatform = (item: Dict | undefined, platform: string): boolean => !Array.isArray(item?.platforms) || (item.platforms as string[]).includes(platform);

const quoted = (value: unknown): string => JSON.stringify(value);

/** The name an event is emitted under on `platform`. */
function emittedName(c: Dict, event: string, platform: string): string {
  return pyStr(((c.events ?? {}) as Dict)[event]?.platforms?.[platform] ?? event);
}

/** A token as the platform writes it: a custom property on web and Lit, a theme value on React Native and SwiftUI. */
function platformToken(token: string, platform: string): string {
  if (platform === 'web' || platform === 'lit') return `var(${tokens.cssName(token)})`;
  return `${platform === 'rn' ? 't' : 'theme'}.${tokens.camelName(token)}`;
}

/** Another binding of the component as the platform reads it: its override hook on web and Lit, its resolved value
 *  by binding name on React Native and SwiftUI. */
function platformBinding(c: Dict, binding: string, platform: string): string {
  if (platform === 'web') return `var(--ds-${kebab(c.name)}-${kebab(binding)})`;
  if (platform === 'lit') return `var(--ds-${pyStr(c.platforms?.lit?.tag ?? `ds-${kebab(c.name)}`).replace(/^ds-/, '')}-${kebab(binding)})`;
  return binding;
}

type ContractTerm = { token: string } | { binding: string };

/** Σ coefficient × term as the platform writes it: a `calc()` of custom properties on web and Lit, arithmetic on
 *  theme values on React Native and SwiftUI. */
function termExpression(c: Dict, terms: [ContractTerm, number][], platform: string): string {
  let expr = '';
  for (const [term, coefficient] of terms) {
    if (coefficient === 0) continue;
    const ref = 'token' in term ? platformToken(term.token, platform) : platformBinding(c, term.binding, platform);
    const size = Math.abs(Number(coefficient.toFixed(6)));
    const text = size === 1 ? ref : `${ref} * ${size}`;
    expr += expr === '' ? (coefficient < 0 ? `-${text}` : text) : ` ${coefficient < 0 ? '-' : '+'} ${text}`;
  }
  if (expr === '') return '0';
  return (platform === 'web' || platform === 'lit') && expr.includes(' ') ? `calc(${expr})` : expr;
}

/** A computed binding as a token expression. `computeBinding` is linear in every token and binding it reads, so
 *  evaluating it with one term at 1 and every other at 0 gives that term's coefficient: the expression is the formula
 *  `computeBinding` evaluates, not a second reading of `computed`. */
export function computedExpression(c: Dict, binding: Dict, platform: string): string {
  const computed = (binding.computed ?? {}) as Dict;
  const terms: ContractTerm[] = [{ token: binding.token }];
  for (const op of [...(computed.plus ?? []), ...(computed.minus ?? [])] as Dict[]) {
    const term: ContractTerm = 'token' in op ? { token: op.token } : { binding: op.binding };
    if (!terms.some((t) => quoted(t) === quoted(term))) terms.push(term);
  }
  const source = binding as Parameters<typeof computeBinding>[0];
  const coefficient = (term: ContractTerm): number =>
    computeBinding(source, (t) => ('token' in term && term.token === t ? 1 : 0), (b) => ('binding' in term && term.binding === b ? 1 : 0));
  return termExpression(c, terms.map((term): [ContractTerm, number] => [term, coefficient(term)]), platform);
}

const EVENT_CONTRACT_FIELDS: readonly string[] = ['payload', 'reasons', 'fires', 'cancelable', 'timing'];

function eventsContract(c: Dict, platform: string): string {
  const lines: string[] = [];
  for (const [name, ev] of Object.entries((c.events ?? {}) as Dict)) {
    if (!EVENT_CONTRACT_FIELDS.some((k) => ev[k] !== undefined)) continue;
    lines.push(`- \`${name}\`: emit \`${emittedName(c, name, platform)}\``);
    if (ev.payload !== undefined) {
      const fields = (ev.payload as Dict[]).map((f) => `\`${f.name}: ${f.type === 'enum' ? (f.values as string[]).map((v) => `'${v}'`).join(' | ') : pyStr(f.shape ?? f.type)}\``);
      lines.push(`  - payload, ${platform === 'lit' ? 'the keys of `CustomEvent.detail`' : 'positional, in this order'}: ${fields.length ? fields.join(', ') : 'none (the handler takes no arguments)'}`);
    }
    if (ev.reasons !== undefined) lines.push(`  - reasons: ${Object.entries(ev.reasons as Dict).map(([r, when]) => `\`${r}\` (${pyStr(when)})`).join('; ')}`);
    if (ev.cancelable !== undefined) lines.push(`  - cancelable: ${ev.cancelable === true ? 'yes' : 'no'}`);
    if (ev.fires !== undefined) lines.push(`  - fires on: ${(ev.fires as string[]).join(', ')}`);
    if (ev.timing !== undefined) {
      const before = (ev.timing.before ?? []) as string[];
      lines.push(`  - timing: ${pyStr(ev.timing.phase)}${before.length ? `, fired before ${before.map((b) => `\`${emittedName(c, b, platform)}\``).join(', ')}` : ''}`);
    }
  }
  return contractSection('Events', lines);
}

function controlledContract(c: Dict, platform: string): string {
  const props = (c.props ?? {}) as Dict;
  const lines = controlledPairs(c)
    .filter((pair) => onPlatform(props[pair.prop], platform))
    .map((pair) => {
      const bits = [`\`${pair.prop}\` is controlled when given, uncontrolled ${pair.default === null ? 'from its initial state' : `from \`${pair.default}\``} when omitted`];
      if (pair.event !== null) bits.push(`changes reported by \`${pair.event}\` (emit \`${emittedName(c, pair.event, platform)}\`)`);
      if (pair.state !== null) bits.push(`drives state \`${pair.state}\``);
      return `- ${bits.join('; ')}`;
    });
  return contractSection('Controlled state', lines);
}

function slotSpelling(name: string, platform: string): string {
  if (platform === 'lit') return name === '' ? 'the default `<slot>`' : `\`<slot name="${name}">\``;
  if (platform === 'swiftui') return `\`@ViewBuilder\` parameter \`${name}\``;
  return `prop \`${name}\``;
}

function partsContract(c: Dict, platform: string): string {
  const composition = (c.composition ?? {}) as Dict;
  if (c.parts === undefined && !Object.values(composition).some((entry) => typeof entry !== 'string')) return '';
  const lines: string[] = [];
  for (const part of (c.anatomy ?? []) as string[]) {
    const kind = partKind(c, part);
    if (kind === 'slot') {
      lines.push(`- \`${part}\`: slot, ${slotSpelling(slotName(c, part, platform), platform)}${c.parts?.[part]?.slot?.required === true ? ', required' : ''}`);
      continue;
    }
    if (kind !== 'component' || !has(composition, part)) {
      lines.push(`- \`${part}\`: ${kind}`);
      continue;
    }
    const entry = composition[part];
    const target = compositionTarget(entry);
    const bits = [`component \`${target.component}\`${target.planned ? ' (planned)' : ''}`];
    if (typeof entry !== 'string') {
      const props = Object.entries((entry.props ?? {}) as Dict).map(([k, v]) => (v !== null && typeof v === 'object' ? `\`${k}\` ← prop \`${v.from}\`` : `\`${k}\` = ${quoted(v)}`));
      const forwards = Object.entries((entry.forwards ?? {}) as Dict).map(([from, to]) => `\`${from}\` → \`overrides.${pyStr(to)}\``);
      if (props.length) bits.push(`props ${props.join(', ')}`);
      if (forwards.length) bits.push(`forwards ${forwards.join(', ')}`);
    }
    lines.push(`- \`${part}\`: ${bits.join('; ')}`);
  }
  return contractSection('Parts and slots', lines);
}

const BINDING_CONTRACT_FIELDS: readonly string[] = ['part', 'state', 'platforms', 'by', 'values', 'computed'];

function stylesContract(c: Dict, platform: string): string {
  const lines: string[] = [];
  for (const [bName, b] of Object.entries((c.styles ?? {}) as Dict)) {
    if (!BINDING_CONTRACT_FIELDS.some((k) => b[k] !== undefined)) continue;
    const bits = [`token \`${b.token}\``];
    if (b.part !== undefined) bits.push(`part \`${b.part}\``);
    if (b.state !== undefined) bits.push(`state \`${b.state}\``);
    if (b.platforms !== undefined) bits.push(`on ${(b.platforms as string[]).join(', ')}`);
    if (b.by !== undefined) bits.push(`by \`${b.by}\`: ${Object.entries((b.values ?? {}) as Dict).map(([v, t]) => `${v} → \`${pyStr(t)}\``).join(', ')}, any other value → \`${b.token}\``);
    if (b.computed !== undefined) bits.push(`computed \`${computedExpression(c, b, platform)}\``);
    if (b.locked === true) bits.push('locked');
    lines.push(`- \`${bName}\`: ${bits.join('; ')}`);
  }
  return contractSection('Style bindings', lines);
}

const RULE_CONTRACT_FIELDS: readonly string[] = ['given', 'target', 'repeat', 'platforms', 'native'];
const ruleUsesContract = (rule: Dict): boolean => RULE_CONTRACT_FIELDS.some((k) => rule[k] !== undefined) || Array.isArray(rule.expect);

function keyboardContract(c: Dict, platform: string): string {
  const rules = (c.keyboard ?? []) as Dict[];
  const suffix = KEYBOARD_PLATFORMS[platform]?.suffix;
  const lines: string[] = [];
  let excluded = 0;
  // Every rule is listed, because the template says the section is the whole contract; the
  // contract fields only add detail to the line of a rule that carries them.
  for (const rule of rules) {
    if (!onPlatform(rule, platform)) {
      excluded += 1;
      continue;
    }
    const line = `- ${(rule.keys as string[]).map((k) => `\`${k}\``).join(', ')} (${pyStr(rule.action)}): expect ${expectList(rule).join(', then ')}`;
    if (!ruleUsesContract(rule)) {
      lines.push(line);
      continue;
    }
    const bits: string[] = [];
    if (rule.target !== undefined) bits.push(`target part \`${rule.target}\``);
    if (rule.repeat !== undefined) bits.push(`repeat ${String(rule.repeat)}`);
    if (rule.given !== undefined) {
      bits.push(`given ${Object.entries(rule.given as Dict).map(([k, v]) => `\`${k}: ${quoted(v)}\``).join(', ')}`);
      if (suffix !== undefined) bits.push(`story URL \`${storyUrl(storyId(c.name, suffix), rule.given)}\``);
    }
    if (rule.native === true) bits.push('native: the rendered element already does this');
    lines.push(bits.length ? `${line}; ${bits.join('; ')}` : line);
  }
  if (excluded) lines.push(`- ${excluded} rule(s) in the schema do not apply on ${platform}; implement none of them`);
  return contractSection('Keyboard', lines);
}

function formOverlayContract(c: Dict, platform: string): string {
  const blocks: Dict = {};
  if (c.form !== undefined) blocks.form = c.form;
  if (c.overlay !== undefined) blocks.overlay = c.overlay;
  if (!Object.keys(blocks).length) return '';
  const lines = ['```yaml', pyStrip(yamlDump(blocks, true)), '```'];
  if (c.overlay?.closeEvent !== undefined) lines.push('', `\`overlay.closeEvent\` emits \`${emittedName(c, c.overlay.closeEvent, platform)}\`.`);
  return contractSection('Form and overlay', lines);
}

function copyContract(c: Dict): string {
  const copy = (c.copy ?? {}) as Dict;
  if (!Object.values(copy).some((entry) => typeof entry !== 'string')) return '';
  const lines = Object.entries(copy).map(([key, entry]) => {
    const bits = [quoted(copyText(entry))];
    if (typeof entry !== 'string') {
      const params = Object.entries((entry.params ?? {}) as Dict).map(([n, p]) => `\`${n}\` (${pyStr(p.type)})`);
      if (params.length) bits.push(`params ${params.join(', ')}`);
      const plural = entry.plural as Dict | undefined;
      if (plural !== undefined) bits.push(`plural by \`${plural.by}\`: ${PLURAL_CATEGORIES.filter((k) => plural[k] !== undefined).map((k) => `${k} ${quoted(plural[k])}`).join(', ')}`);
    }
    return `- \`${key}\`: ${bits.join('; ')}`;
  });
  return contractSection('Copy', lines);
}

function constantsContract(c: Dict, platform: string): string {
  const lines: string[] = [];
  for (const [name, k] of Object.entries((c.constants ?? {}) as Dict)) {
    const value = k.token === undefined ? String(k.value) : `\`${termExpression(c, [[{ token: k.token }, k.multiply ?? 1]], platform)}\` (\`${k.token}\`${k.multiply === undefined ? '' : ` × ${String(k.multiply)}`})`;
    lines.push(`- constant \`${name}\`: ${value} ${pyStr(k.unit)}`);
  }
  for (const ex of (c.examples ?? []) as Dict[]) {
    if (!onPlatform(ex, platform)) continue;
    const story = (ex.name as string).split('-').map((w) => w.slice(0, 1).toUpperCase() + w.slice(1)).join('');
    const given = Object.entries(ex.given as Dict).map(([p, v]) => `\`${p}: ${quoted(v)}\``).join(', ');
    lines.push(`- example \`${ex.name}\`, story \`${story}\`: given ${given || 'no props'}; ${pyStr(ex.description)}`);
  }
  return contractSection('Constants and examples', lines);
}

function lifecycleContract(c: Dict, platform: string): string {
  const events = (c.events ?? {}) as Dict;
  const useName = (use: unknown): string | null => (typeof use !== 'string' ? null : has(events, use) ? `\`${use}\` (emit \`${emittedName(c, use, platform)}\`)` : `\`${use}\``);
  const note = (d: Dict): string => [d.since === undefined ? null : `since ${pyStr(d.since)}`, useName(d.use) === null ? null : `use ${useName(d.use) as string}`, pyStr(d.reason)].filter((s) => s !== null).join('; ');
  const lines: string[] = [];
  if (c.deprecated !== undefined) lines.push(`- component \`${c.name}\`: ${note(c.deprecated)}`);
  for (const [pName, p] of Object.entries((c.props ?? {}) as Dict)) {
    if (!onPlatform(p, platform)) continue;
    if (p.deprecated !== undefined) lines.push(`- prop \`${pName}\`: ${note(p.deprecated)}`);
    const offered = p.type === 'enum' ? enumValues(p) : [];
    for (const [value, life] of Object.entries((p.valueLifecycle ?? {}) as Dict)) {
      if (life.deprecated === undefined || !offered.includes(value)) continue;
      lines.push(`- value \`${pName}: ${value}\`: ${note(life.deprecated)}`);
    }
  }
  for (const [evName, ev] of Object.entries(events)) {
    if (ev.deprecated !== undefined) lines.push(`- event \`${evName}\` (emit \`${emittedName(c, evName, platform)}\`): ${note(ev.deprecated)}`);
  }
  return contractSection('Lifecycle', lines);
}

/** The declared-contract sections of one platform's prompt, in the order the templates' rules name them. The
 *  component is narrowed to the platform first, so nothing narrowed away from it appears. */
export function contractSections(component: Dict, platform: string): string {
  const c = narrowForPlatform(component, platform);
  return [
    eventsContract(c, platform),
    controlledContract(c, platform),
    partsContract(c, platform),
    stylesContract(c, platform),
    keyboardContract(c, platform),
    formOverlayContract(c, platform),
    copyContract(c),
    constantsContract(c, platform),
    lifecycleContract(c, platform),
  ].join('');
}

export function renderPrompt(c: Dict, sections: Record<string, string>, platform: string, fmYaml: string, extensions: ExtensionRecord[] | null = null): string {
  const template = readText(join(paths.TEMPLATES, `${platform}.md`));
  let guidance = ALLOWED_HEADINGS.filter((h) => has(sections, h)).map((h) => `## ${h}\n\n${sections[h]}`).join('\n\n');
  if (truthy(extensions)) {
    const supported = Object.entries(c.platforms as Dict).filter(([, n]) => truthy(pyGet(n, 'supported', true))).map(([pl]) => pl);
    const prose = extensionsProse(extensions as ExtensionRecord[], platform, supported);
    if (truthy(prose)) guidance = guidance + '\n\n' + prose;
  }
  const scenarios = behaviorFor(c, deriveBehavior(c), platform);
  const behaviorYaml = scenarios.length ? pyStrip(yamlDump(scenarios, true)) : '[]';
  if (!template.includes('{{BEHAVIOR_YAML}}')) {
    // A template without the placeholder must still hand the generator its scenarios (the tests gate runs them).
    guidance += '\n\n## Behavior scenarios (' + String(scenarios.length) + ')\n\nOne test per scenario, in this order.\n\n```yaml\n' + behaviorYaml + '\n```';
  }
  const styles: Dict = pyGet(c, 'styles', {}) ?? {};
  const overridable = Object.entries(styles).filter(([, v]) => !truthy(v.locked)).map(([k]) => `\`${k}\``).join(', ');
  const locked = Object.entries(styles).filter(([, v]) => truthy(v.locked)).map(([k]) => `\`${k}\``).join(', ');
  let out = template;
  out = replaceAll(out, '{{NAME}}', c.name);
  out = replaceAll(out, '{{PLATFORM}}', platform);
  out = replaceAll(out, '{{SCHEMA_YAML}}', pyStrip(fmYaml));
  out = replaceAll(out, '{{GUIDANCE}}', guidance);
  out = replaceAll(out, '{{PLATFORM_NOTES}}', pyStrip(yamlDump(c.platforms[platform], false)));
  out = replaceAll(out, '{{OVERRIDABLE}}', truthy(overridable) ? overridable : 'none');
  out = replaceAll(out, '{{LOCKED}}', truthy(locked) ? locked : 'none');
  out = replaceAll(out, '{{BEHAVIOR_COUNT}}', String(scenarios.length));
  out = replaceAll(out, '{{BEHAVIOR_YAML}}', behaviorYaml);
  // Last, so no text a section quotes is read as a placeholder. The template puts it directly before a heading, and
  // every section ends in a blank line, so an empty result leaves the prompt as it was.
  out = replaceAll(out, '{{CONTRACTS}}', contractSections(c, platform));
  return out;
}

/** Theme docs → generated/themes.json + generated/prompts/theme.<id>.md (the 'feel' skill). */
export function parseThemes(): [Dict[], string[]] {
  const themes: Dict[] = [];
  const errors: string[] = [];
  const template = readText(join(paths.TEMPLATES, 'theme.md'));
  for (const file of mdFiles(paths.THEME_DOCS)) {
    try {
      const [fm, body] = splitFrontmatter(readText(file), file);
      if (!has(fm, 'theme')) continue;
      const t: Dict = fm.theme;
      const sections = splitSections(body, file, THEME_HEADINGS, ['Feel', 'When to use']);
      let light: Record<string, tokens.TokenEntry>;
      try {
        light = tokens.loadTheme(t.id, 'light');
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') throw new DocError(`${name(file)}: tokens/themes/${t.id} missing — run tools/theme.ts first`);
        throw e;
      }
      const resolved: Dict = {};
      for (const [p, e] of Object.entries(light)) if (p.startsWith('color.') && !p.includes('palette')) resolved[tokens.publicName(p)] = e.$value;
      const tokensTxt = Object.entries(resolved).map(([p, v]) => `${ljust(tokens.cssName(p), 44)} ${pyStr(v)}`).join('\n');
      const guidance = Object.entries(sections).filter(([h]) => h !== 'Overview').map(([h, v]) => `## ${h}\n\n${v}`).join('\n\n');
      let prompt = template;
      prompt = replaceAll(prompt, '{{NAME}}', pyStr(pyGet(fm, 'title', t.id)));
      prompt = replaceAll(prompt, '{{TONE}}', (t.tone as string[]).join(', '));
      prompt = replaceAll(prompt, '{{NOT}}', pyStr(t.not));
      prompt = replaceAll(prompt, '{{THEME_YAML}}', pyStrip(yamlDump({ theme: t }, false)));
      prompt = replaceAll(prompt, '{{TOKENS_LIGHT}}', tokensTxt);
      prompt = replaceAll(prompt, '{{GUIDANCE}}', guidance);
      writeIfChanged(join(paths.OUT, 'prompts', `theme.${t.id}.md`), prompt);
      themes.push({
        id: t.id, title: pyGet(fm, 'title', t.id), description: pyGet(fm, 'description', ''),
        published: STATUS_PUBLISHED.has(pyGet(t, 'status', 'draft') as string), theme: t, sections,
        source: relToRoot(file),
      });
    } catch (e) {
      if (!(e instanceof DocError)) throw e;
      errors.push(e.message);
    }
  }
  writeIfChanged(join(paths.OUT, 'themes.json'), jsonDumps(themes) + '\n');
  return [themes, errors];
}

export function main(): number {
  takeWarnings();
  mkdirSync(join(paths.OUT, 'prompts'), { recursive: true });
  const components: Dict[] = [];
  const [byComponent, errors] = loadExtensions();
  const seenComponents = new Set<string>();
  for (const file of mdFiles(paths.DOCS)) {
    try {
      const text = readText(file);
      const [fm, body] = splitFrontmatter(text, file);
      if (!has(fm, 'component')) throw new DocError(`${name(file)}: no \`component:\` block in frontmatter`);
      const c: Dict = fm.component;
      seenComponents.add(pyStr(pyGet(c, 'name', '')));
      const exts = pyGet(byComponent, pyStr(pyGet(c, 'name', '')), []) as ExtensionRecord[];
      const added = mergeExtensions(c, exts);
      try {
        validate(fm, file);
      } catch (e) {
        // A schema error on a component an extension reshaped (a scenario still naming an omitted prop) names the
        // extensions, since the component doc alone does not explain it.
        if (e instanceof DocError && mergedWithLine(exts)) throw new DocError(e.message + mergedWithLine(exts));
        throw e;
      }
      for (const w of hooks.componentWarnings(c as ComponentDef)) warn(docPath(file), `${w.path}: ${w.message}`);
      checkExtensionLocks(c, added, exts);
      stampSources(added);
      const sections = splitSections(body, file);
      const entry: Dict = {
        id: stem(file),
        title: pyGet(fm, 'title', c.name),
        description: pyGet(fm, 'description', ''),
        published: STATUS_PUBLISHED.has(pyGet(c, 'status', 'draft') as string),
        component: c,
        behaviorDerived: deriveBehavior(c),
        sections,
        extensions: extensionSummary(c, exts),
        source: relToRoot(file),
      };
      components.push(entry);
      for (const [platform, notes] of Object.entries(c.platforms as Dict)) {
        if (!truthy(pyGet(notes, 'supported', true)) || !existsSync(join(paths.TEMPLATES, `${platform}.md`))) continue;
        // Each prompt sees the component narrowed to its platform: no requirement, enum value, copy entry or binding
        // the doc narrows away from it.
        const view = narrowForPlatform(c, platform);
        writeIfChanged(join(paths.OUT, 'prompts', `${c.name}.${platform}.md`), renderPrompt(view, sections, platform, yamlDump({ component: view }, true), exts));
      }
    } catch (e) {
      if (!(e instanceof DocError)) throw e;
      errors.push(e.message);
    }
  }
  for (const [compName, exts] of Object.entries(byComponent)) {
    if (!seenComponents.has(compName)) errors.push(...exts.map((ext) => `${ext.file}: extends '${compName}', which has no component doc`));
  }
  writeIfChanged(join(paths.OUT, 'components.json'), jsonDumps(components) + '\n');
  writeModuleStubs(components);
  const [patterns, patternErrors] = parsePatterns(components);
  errors.push(...patternErrors);
  const [themes, themeErrors] = parseThemes();
  errors.push(...themeErrors);
  const found = takeWarnings().sort((a, b) => (a.file !== b.file ? (a.file < b.file ? -1 : 1) : a.message < b.message ? -1 : a.message > b.message ? 1 : 0));
  writeIfChanged(join(paths.OUT, 'parse-warnings.json'), jsonDumps(found) + '\n');
  const strict = process.env.DS_WARNINGS_AS_ERRORS === '1';
  if (strict) errors.push(...found.map((w) => `${w.file}: ${w.message}`));
  for (const e of errors) process.stderr.write(`✖ ${e}\n`);
  if (!strict) for (const w of found) process.stderr.write(`⚠ ${w.file}: ${w.message}\n`);
  const warned = !strict && found.length ? `, ${found.length} warning(s)` : '';
  process.stdout.write(`${errors.length ? '✖' : '✔'} ${components.length} component(s), ${themes.length} theme(s), ${patterns.length} pattern(s) parsed, ${errors.length} error(s)${warned} → ${relative(paths.ROOT, paths.OUT)}/\n`);
  return errors.length ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  process.exitCode = main();
}
