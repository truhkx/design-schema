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
import { basename, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ZodType } from 'zod';

import { componentFrontmatter } from '../schema/component.ts';
import { extensionFrontmatter } from '../schema/extension.ts';
import { has, ljust, product, pyGet, pyRepr, pyRstrip, pySplit, pySplitlines, pyStr, pyStrip, readText, sortedNames, truthy, writeTextAtomic } from './lib/py.ts';
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
  // Built token names (public form: a trailing `.default` dropped), for checking that every value an interpolated
  // binding can take resolves to a real token. Read from the built JSON when it exists, else from the theme tree.
  TOKEN_DIST: join(REPO_ROOT, 'packages', 'tokens', 'dist', 'calm-precise', 'json', 'tokens.light.json'),
};

export const PKG: Record<string, string> = { web: 'react', lit: 'lit', rn: 'rn' };

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

// Enum values that a binding renders as "nothing" instead of a token (the templates say so): `none` for a
// background/border/padding, `full` for a max-width. A missing token for these values is not an error.
export const NO_TOKEN_VALUES: Set<string> = new Set(['none', 'full']);
let tokenNamesCache: Set<string> | null | undefined;

/** Public names of every built token, or null when nothing has been built yet (the check is then skipped). */
export function tokenNames(): Set<string> | null {
  if (tokenNamesCache !== undefined) return tokenNamesCache;
  let names: Set<string> | null = null;
  if (existsSync(paths.TOKEN_DIST)) {
    names = new Set(Object.keys(JSON.parse(readText(paths.TOKEN_DIST)) as Dict));
  } else {
    try {
      const ids = tokens.themes();
      if (ids.length) names = new Set(Object.keys(tokens.loadTheme(ids[0] as string, 'light')).map(tokens.publicName));
    } catch {
      names = null; // no derived themes yet: nothing to check against
    }
  }
  tokenNamesCache = names;
  return names;
}

/** Seams the tests replace, the way the Python tests monkeypatched `parse.token_names`. */
export const hooks = { tokenNames };

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

const SLOT = /\{([a-zA-Z]+)\}/g;

function slots(token: string): string[] {
  return [...token.matchAll(SLOT)].map((m) => m[1] as string);
}

export function validate(fm: Dict, file: string): void {
  const problems = schemaErrors(componentFrontmatter, fm);
  if (problems) throw new DocError([`${name(file)}: frontmatter failed schema validation:`, ...problems].join('\n'));
  const c: Dict = fm.component;
  const fileStem = stem(file).replace(/-/g, '').toLowerCase();
  if (String(c.name).toLowerCase() !== fileStem) throw new DocError(`${name(file)}: component.name '${c.name}' should match file name`);
  // Every prop referenced by a token slot must be an enum prop.
  for (const [propName, binding] of Object.entries((pyGet(c, 'styles', {}) ?? {}) as Dict)) {
    for (const slot of slots(binding.token)) {
      const p = pyGet(c.props, slot, null) as Dict | null;
      if (!truthy(p) || (p as Dict).type !== 'enum') {
        throw new DocError(`${name(file)}: styles.${propName} interpolates '{${slot}}' but '${slot}' is not an enum prop`);
      }
    }
  }
  // …and every value the interpolation can take must resolve to a built token (after dropping a trailing
  // `.default`), except the no-op values. Two docs shipped with a value that had no token before this check.
  const names = hooks.tokenNames();
  if (names !== null) {
    for (const [propName, binding] of Object.entries((pyGet(c, 'styles', {}) ?? {}) as Dict)) {
      const token: string = binding.token;
      const slotNames = slots(token);
      if (!slotNames.length) continue;
      for (const combo of product(slotNames.map((s) => c.props[s].values as unknown[]))) {
        let ref = token;
        slotNames.forEach((s, i) => { ref = replaceAll(ref, '{' + s + '}', pyStr(combo[i])); });
        const pub = ref.endsWith('.default') ? ref.split('.').slice(0, -1).join('.') : ref;
        if (!names.has(pub) && !combo.some((v) => NO_TOKEN_VALUES.has(v as string))) {
          throw new DocError(`${name(file)}: ${c.name}: styles.${propName} '${token}' → '${pub}' is not a token`);
        }
      }
    }
  }
  // Overrides: a binding is locked when its token carries an accessibility guarantee — it appears in a contrast
  // pair, or it is a focus ring / minimum target. Generators expose every other binding as a per-instance override.
  const contrastTokens = new Set<unknown>();
  for (const pair of (pyGet(c.a11y, 'contrast', []) ?? []) as Dict[]) for (const k of ['foreground', 'background']) contrastTokens.add(pair[k]);
  for (const [bName, binding] of Object.entries((pyGet(c, 'styles', {}) ?? {}) as Dict)) {
    const auto = contrastTokens.has(binding.token) || bName.startsWith('focusRing') || bName === 'minTarget' || bName === 'dismissTarget';
    binding.locked = Boolean(truthy(pyGet(binding, 'locked', false)) || auto);
  }
  // Composition parts must be anatomy parts, and name a component that exists (or is explicitly planned).
  for (const [part, comp] of Object.entries((truthy(c.composition) ? c.composition : {}) as Record<string, string>)) {
    if (!(c.anatomy as unknown[]).includes(part)) throw new DocError(`${name(file)}: composition.${part} is not in anatomy ${pyRepr(c.anatomy)}`);
    const compName = pyStrip(replaceAll(comp, '(planned)', ''));
    if (!existsSync(join(paths.DOCS, `${compName.toLowerCase()}.md`)) && !comp.includes('(planned)')) {
      throw new DocError(`${name(file)}: composition.${part} names '${comp}', which has no doc (mark it '(planned)')`);
    }
  }
  // Keyboard rules imply keyboard-operable, and Escape implies escape-dismiss.
  const kb: Dict[] = truthy(c.keyboard) ? c.keyboard : [];
  const requires: unknown[] = c.a11y.requires;
  if (truthy(kb) && !requires.includes('keyboard-operable')) throw new DocError(`${name(file)}: has a keyboard block but a11y.requires lacks 'keyboard-operable'`);
  if (kb.some((r) => (r.keys as unknown[]).includes('Escape')) && !requires.includes('escape-dismiss')) {
    throw new DocError(`${name(file)}: keyboard uses Escape but a11y.requires lacks 'escape-dismiss'`);
  }
  // A gesture-triggered event must have a non-gesture alternative (WCAG 2.5.1 / 2.5.7).
  const events = (pyGet(c, 'events', {}) ?? {}) as Dict;
  if (Object.values(events).some((ev) => truthy((ev as Dict).gesture)) && !requires.includes('gesture-alternative')) {
    throw new DocError(`${name(file)}: declares a gesture event but a11y.requires lacks 'gesture-alternative'`);
  }
  // Every event must map (or be explicitly unsupported) on every platform declared for the component.
  for (const [evName, ev] of Object.entries(events)) {
    for (const [platform, notes] of Object.entries(c.platforms as Dict)) {
      if (truthy(pyGet(notes, 'supported', true)) && !has(ev.platforms, platform)) {
        throw new DocError(`${name(file)}: events.${evName} has no mapping for platform '${platform}'`);
      }
    }
  }
  validateBehavior(c, file);
}

export const BEHAVIOR_STATES: Set<string> = new Set(['checked', 'expanded', 'selected', 'disabled', 'invalid', 'pressed', 'open']);
export const BEHAVIOR_FOCUS_TARGETS: Set<string> = new Set(['none', 'moved', 'unchanged']);

/** Cross-reference each authored `behavior` scenario against the rest of the schema:
 *  props/anatomy/events/copy it names must exist, and anything React Native's harness
 *  cannot express (keyboard, focus observation, an `invalid` state) must narrow `platforms`
 *  to exclude 'rn' rather than leave the generator to guess. */
export function validateBehavior(component: Dict, file: string): void {
  const anatomy: unknown[] = truthy(component.anatomy) ? component.anatomy : [];
  const props: Dict = truthy(component.props) ? component.props : {};
  const events: Dict = truthy(component.events) ? component.events : {};
  const copy: Dict = truthy(component.copy) ? component.copy : {};
  const declaredPlatforms = new Set(Object.keys(truthy(component.platforms) ? component.platforms : {}));

  const seenNames = new Set<string>();
  for (const sc of (truthy(component.behavior) ? component.behavior : []) as Dict[]) {
    const scName: string = sc.name;
    if (seenNames.has(scName)) throw new DocError(`${name(file)}: duplicate behavior scenario '${scName}'`);
    seenNames.add(scName);
    if (has(sc, 'derived')) throw new DocError(`${name(file)}: behavior scenario '${scName}' sets 'derived' — only the parser may set that key`);

    const scenarioPlatforms = (sc.platforms ?? null) as string[] | null;
    if (scenarioPlatforms !== null) {
      for (const plat of scenarioPlatforms) {
        if (!declaredPlatforms.has(plat)) throw new DocError(`${name(file)}: scenario '${scName}' platforms includes '${plat}', which the component does not declare`);
      }
    }

    for (const [propName, value] of Object.entries((truthy(sc.given) ? sc.given : {}) as Dict)) {
      const prop = pyGet(props, propName, null) as Dict | null;
      if (prop === null) throw new DocError(`${name(file)}: scenario '${scName}' given: unknown prop '${propName}'`);
      if (prop.type === 'enum' && !(prop.values as unknown[]).includes(value)) {
        throw new DocError(`${name(file)}: scenario '${scName}' given.${propName}: '${value}' is not one of ${pyRepr(prop.values)}`);
      }
      if (prop.type === 'boolean' && typeof value !== 'boolean') {
        throw new DocError(`${name(file)}: scenario '${scName}' given.${propName} must be a boolean, got ${pyRepr(value)}`);
      }
    }

    const when: Dict = truthy(sc.when) ? sc.when : {};
    if (has(when, 'click') && !anatomy.includes(when.click)) throw new DocError(`${name(file)}: scenario '${scName}' when.click: unknown anatomy part '${when.click}'`);
    if (has(when, 'focus') && !anatomy.includes(when.focus)) throw new DocError(`${name(file)}: scenario '${scName}' when.focus: unknown anatomy part '${when.focus}'`);
    if (has(when, 'key')) {
      const effective = scenarioPlatforms !== null ? new Set(scenarioPlatforms) : declaredPlatforms;
      if (effective.has('rn')) throw new DocError(`${name(file)}: scenario '${scName}' uses when.key but React Native has no keyboard — narrow platforms to exclude 'rn'`);
    }

    for (const item of (truthy(sc.then) ? sc.then : []) as Dict[]) {
      if (has(item, 'event')) {
        const ev = item.event;
        if (!has(events, ev)) throw new DocError(`${name(file)}: scenario '${scName}' then.event: unknown event '${ev}'`);
        if (item.fired === false && has(item, 'with')) throw new DocError(`${name(file)}: scenario '${scName}': \`with\` on an event that must not fire`);
      }
      for (const key of ['focus', 'focused']) {
        if (has(item, key)) {
          const target = item[key];
          if (!anatomy.includes(target) && !BEHAVIOR_FOCUS_TARGETS.has(target)) {
            throw new DocError(`${name(file)}: scenario '${scName}' then.${key}: unknown anatomy part '${target}'`);
          }
        }
      }
      if (has(item, 'copy') && !has(copy, item.copy)) throw new DocError(`${name(file)}: scenario '${scName}' then.copy: unknown copy key '${item.copy}'`);
      if (has(item, 'state') && !BEHAVIOR_STATES.has(item.state)) {
        throw new DocError(`${name(file)}: scenario '${scName}' then.state '${item.state}' must be one of ${pyRepr([...BEHAVIOR_STATES].sort())}`);
      }

      const itemPlatforms = (item.platforms ?? null) as string[] | null;
      if (itemPlatforms !== null) {
        for (const plat of itemPlatforms) {
          if (!declaredPlatforms.has(plat)) throw new DocError(`${name(file)}: scenario '${scName}' then item platforms includes '${plat}', which the component does not declare`);
        }
        if (scenarioPlatforms !== null && !itemPlatforms.every((p) => scenarioPlatforms.includes(p))) {
          throw new DocError(`${name(file)}: scenario '${scName}' then item platforms ${pyRepr(itemPlatforms)} outside the scenario's platforms ${pyRepr(scenarioPlatforms)}`);
        }
      }

      let effective: Set<string>;
      if (itemPlatforms !== null) effective = new Set(itemPlatforms);
      else if (scenarioPlatforms !== null) effective = new Set(scenarioPlatforms);
      else effective = declaredPlatforms;
      if (effective.has('rn')) {
        if (has(item, 'focusable')) throw new DocError(`${name(file)}: scenario '${scName}' then.focusable: React Native cannot observe focus — narrow platforms to exclude 'rn'`);
        if (item.state === 'invalid') throw new DocError(`${name(file)}: scenario '${scName}' then.state invalid: React Native has no invalid accessibility state — narrow platforms to exclude 'rn'`);
      }
    }
  }
}

// ARIA widget roles whose element itself takes focus (WAI-ARIA 1.2 widget roles minus composite containers).
export const WIDGET_ROLES: Set<string> = new Set(['button', 'checkbox', 'switch', 'radio', 'textbox', 'searchbox', 'spinbutton', 'combobox', 'slider',
  'link', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'gridcell', 'scrollbar']);

export const ACCESSIBLE_NAME_HINTS: readonly string[] = ['accessible name', 'aria-label', 'accessibilitylabel', 'accessibility label'];
export const ACCESSIBLE_NAME_PROPS: readonly string[] = ['label', 'caption', 'title'];
export const ACCESSIBLE_NAME_PLACEHOLDER = 'Accessible name';

/** The prop that gives the component its accessible name: the first whose `a11y` note says so, else a
 *  required `label`/`caption`/`title`. null when the name is intrinsic (children, heading text) or absent. */
export function accessibleNameProp(component: Dict): string | null {
  const props: Dict = truthy(component.props) ? component.props : {};
  for (const [propName, prop] of Object.entries(props)) {
    const note = pyStr(truthy(prop.a11y) ? prop.a11y : '').toLowerCase();
    if (['string', 'content', 'enum'].includes(prop.type) && ACCESSIBLE_NAME_HINTS.some((h) => note.includes(h))) {
      return propName; // a boolean like BottomSheet's hideTitle can mention the name without supplying it
    }
  }
  for (const propName of ACCESSIBLE_NAME_PROPS) {
    if (has(props, propName) && truthy(props[propName].required)) return propName;
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

  const scenarios: Dict[] = [{ name: 'renders', then: [{ renders: true }], derived: true }];

  for (const [propName, prop] of Object.entries(props)) {
    if (prop.type !== 'enum') continue;
    for (const value of (truthy(prop.values) ? prop.values : []) as unknown[]) {
      const sc: Dict = { name: `renders-${propName}-${pyStr(value)}`, given: { [propName]: value }, then: [{ renders: true }], derived: true };
      if (has(prop, 'platforms')) sc.platforms = prop.platforms; // the same array: PyYAML anchors it when it recurs
      scenarios.push(sc);
    }
  }

  if (requires.includes('accessible-name')) {
    const sc: Dict = { name: 'has-accessible-name', then: [{ name: true }], derived: true };
    const given = accessibleNameGiven(component);
    if (truthy(given)) sc.given = given;
    scenarios.push(sc);
  }

  if (requires.includes('keyboard-operable') && WIDGET_ROLES.has(a11y.role)) {
    // A container (form, navigation, status region) is keyboard-operable through its children; only a widget
    // role names something that itself takes focus.
    scenarios.push({
      name: 'control-is-focusable',
      then: [{ focusable: true }],
      platforms: declaredPlatforms.filter((p) => p !== 'rn').sort(),
      derived: true,
    });
  }

  if (requires.includes('error-identification') && has(props, 'error')) {
    scenarios.push({
      name: 'error-is-identified',
      given: { error: 'Fix this before continuing.' },
      then: [
        { text: 'Fix this before continuing.' },
        { state: 'invalid', is: true, platforms: ['web', 'lit'] },
      ],
      derived: true,
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
 *  and a scenario left with no applicable expectations is dropped entirely. */
export function behaviorFor(component: Dict, derived: Dict[], platform: string): Dict[] {
  const result: Dict[] = [];
  for (const sc of mergedBehavior(component, derived)) {
    const scenarioPlatforms = (sc.platforms ?? null) as string[] | null;
    if (scenarioPlatforms !== null && !scenarioPlatforms.includes(platform)) continue;
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

export type ExtensionRecord = { file: string; name: string; extends: string; extension: Dict; body: string; title: string };

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

/** Merge every extension into the component in place. Add-only: a name that upstream or an earlier extension
 *  already declares is an error naming the extension file. Returns the merged dict items with the file that added
 *  them, for stamping `source` after schema validation (the item schemas forbid unknown keys). */
export function mergeExtensions(c: Dict, exts: ExtensionRecord[]): Added[] {
  const added: Added[] = [];
  const owner = new Map<string, string>(); // "section\0key" -> who declared it
  const ownerKey = (section: string, key: string): string => `${section}\0${key}`;
  for (const section of EXT_SECTIONS) {
    for (const key of Object.keys(truthy(c[section]) ? c[section] : {})) owner.set(ownerKey(section, key), `${c.name}'s own schema`);
  }
  for (const sc of (truthy(c.behavior) ? c.behavior : []) as Dict[]) owner.set(ownerKey('behavior', sc.name), `${c.name}'s own schema`);
  const moduleOwner = new Map<string, string>();
  for (const ext of exts) {
    const x = ext.extension;
    const file = ext.file;
    for (const section of EXT_SECTIONS) {
      for (const [key, value] of Object.entries((truthy(x[section]) ? x[section] : {}) as Dict)) {
        if (owner.has(ownerKey(section, key))) throw new DocError(`${file}: ${section}.${key} collides with ${owner.get(ownerKey(section, key))}`);
        if (section === 'styles' && truthy(value.locked)) throw new DocError(`${file}: styles.${key} is locked — an extension may add only overridable bindings`);
        owner.set(ownerKey(section, key), file);
        if (!has(c, section)) c[section] = {};
        c[section][key] = value;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) added.push([value, file]);
      }
    }
    for (const rule of (truthy(x.keyboard) ? x.keyboard : []) as Dict[]) {
      if (!has(c, 'keyboard')) c.keyboard = [];
      c.keyboard.push(rule);
      added.push([rule, file]);
    }
    for (const sc of (truthy(x.behavior) ? x.behavior : []) as Dict[]) {
      if (owner.has(ownerKey('behavior', sc.name))) throw new DocError(`${file}: behavior scenario '${sc.name}' collides with ${owner.get(ownerKey('behavior', sc.name))}`);
      owner.set(ownerKey('behavior', sc.name), file);
      if (!has(c, 'behavior')) c.behavior = [];
      c.behavior.push(sc);
      added.push([sc, file]);
    }
    for (const mod of Object.keys(truthy(x.modules) ? x.modules : {})) {
      if (moduleOwner.has(mod)) throw new DocError(`${file}: module '${mod}' collides with ${moduleOwner.get(mod)}`);
      moduleOwner.set(mod, file);
    }
  }
  return added;
}

/** After validate() computed `locked`: an extension binding that ended up locked (its token sits in a contrast
 *  pair, or it is a focus ring / target) is a claim the extension may not make. */
export function checkExtensionLocks(c: Dict, added: Added[]): void {
  for (const [bName, binding] of Object.entries((truthy(c.styles) ? c.styles : {}) as Dict)) {
    for (const [item, file] of added) {
      if (item === binding && truthy(binding.locked)) {
        throw new DocError(`${file}: styles.${bName} binds '${binding.token}', which is locked (contrast pair, focus ring or target) — an extension may add only overridable bindings`);
      }
    }
  }
}

export function stampSources(added: Added[]): void {
  for (const [item, file] of added) item.source = file;
}

/** What goes into generated/components.json next to the component: per extension, what it added and its modules
 *  (with `platforms` filled in from the component when omitted). */
export function extensionSummary(c: Dict, exts: ExtensionRecord[]): Dict[] {
  const supported = Object.entries(c.platforms as Dict).filter(([, n]) => truthy(pyGet(n, 'supported', true))).map(([pl]) => pl);
  const out: Dict[] = [];
  for (const ext of exts) {
    const x = ext.extension;
    const modules: Dict = {};
    for (const [modName, m] of Object.entries((truthy(x.modules) ? x.modules : {}) as Dict)) {
      modules[modName] = { ...m, platforms: [...(truthy(m.platforms) ? m.platforms : supported)] };
    }
    const adds: Dict = {};
    for (const sec of EXT_SECTIONS) if (truthy(x[sec])) adds[sec] = Object.keys(x[sec]).sort();
    out.push({
      name: ext.name, file: ext.file, title: ext.title, description: pyGet(x, 'description', ''),
      adds,
      keyboard: (truthy(x.keyboard) ? x.keyboard : []).length, behavior: (truthy(x.behavior) ? x.behavior : []).map((sc: Dict) => sc.name),
      modules,
    });
  }
  return out;
}

/** packages/<pkg>/src/custom/analytics.ts → './custom/analytics' (Lit imports carry the .js extension). */
export function moduleImport(modulePath: string, platform: string): string {
  const s = modulePath.replace(/\.(ts|tsx)$/, '');
  return platform === 'lit' ? `./${s}.js` : `./${s}`;
}

/** The `## Extensions` section of a prompt: each extension's prose plus its module contracts as import + call
 *  instructions. Empty when no extension targets this platform. */
export function extensionsProse(exts: ExtensionRecord[], platform: string, supported: string[]): string {
  const parts: string[] = [];
  for (const ext of exts) {
    const x = ext.extension;
    const modules = Object.entries((truthy(x.modules) ? x.modules : {}) as Dict).filter(([, m]) => (truthy(m.platforms) ? m.platforms : supported).includes(platform));
    const block = [`### ${ext.name} — \`${ext.file}\``, '', truthy(ext.body) ? ext.body : '(no prose)'];
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
 *  (tools/check_modules.py) typechecks the real file against it. Stale stubs are removed.
 *  (The header line named tools/parse.py until the Python tool was retired; that is the one deliberate
 *  difference from its output.) */
export function writeModuleStubs(components: Dict[]): number {
  const stubs = new Map<string, { file: string; lines: string[] }>();
  for (const e of components) {
    for (const ext of (truthy(e.extensions) ? e.extensions : []) as Dict[]) {
      for (const [modName, m] of Object.entries((truthy(ext.modules) ? ext.modules : {}) as Dict)) {
        for (const platform of m.platforms as string[]) {
          if (!has(PKG, platform)) continue;
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
  const lines = ['## Components used', '', `Every one exists in \`packages/${PKG[platform]}/src\`; import from there and read a file only when a prop's behaviour is unclear.`, ''];
  for (const compName of used) {
    const c = comps[compName] as Dict;
    const platforms: Dict = truthy(c.platforms) ? c.platforms : {};
    const notes: Dict = truthy(platforms[platform]) ? platforms[platform] : {};
    const where = truthy(notes.tag) ? notes.tag : truthy(notes.element) ? notes.element : '';
    lines.push(`- \`${compName}\` — \`packages/${PKG[platform]}/src/${compName}.*\`` + (truthy(where) ? ` (${where})` : ''));
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
      for (const platform of Object.keys(PKG)) {
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
      validate(fm, file);
      checkExtensionLocks(c, added);
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
      const fmYaml = yamlDump({ component: c }, true);
      for (const [platform, notes] of Object.entries(c.platforms as Dict)) {
        if (!truthy(pyGet(notes, 'supported', true)) || !existsSync(join(paths.TEMPLATES, `${platform}.md`))) continue;
        writeIfChanged(join(paths.OUT, 'prompts', `${c.name}.${platform}.md`), renderPrompt(c, sections, platform, fmYaml, exts));
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
  for (const e of errors) process.stderr.write(`✖ ${e}\n`);
  process.stdout.write(`${errors.length ? '✖' : '✔'} ${components.length} component(s), ${themes.length} theme(s), ${patterns.length} pattern(s) parsed, ${errors.length} error(s) → ${relative(paths.ROOT, paths.OUT)}/\n`);
  return errors.length ? 1 : 0;
}

/** Reset the token-name cache (tests point TOKEN_DIST elsewhere between cases). */
export function resetCaches(): void {
  tokenNamesCache = undefined;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  process.exitCode = main();
}
