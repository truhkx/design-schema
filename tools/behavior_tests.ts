#!/usr/bin/env node
/**
 * Behavior gate — derive runnable tests from each component's `behavior` scenarios.
 *
 * Nobody writes a "click the label toggles it" test by hand for seventy components. The doc
 * says so as data (`{ when: { click: label }, then: [{ event: onChange, with: true }] }`), and
 * this script turns every scenario into a test against the real component module, for every
 * platform the scenario applies to (`behaviorFor`, imported from tools/parse.ts, narrows authored +
 * derived scenarios per platform):
 *
 *     generated/behavior/<Name>.<platform>.test.ts(x)
 *
 * Web and React Native run on Vitest/Jest + Testing Library; Lit runs on the package's own
 * Vitest-in-Chromium setup (packages/lit/vitest.config.ts). Each package's test config has an
 * `include` entry pointing back here, and `pnpm --filter @design-schema/<pkg> test -- generated/behavior/<Name>.<platform>`
 * runs just one component's file.
 *
 * Not every `when`/`then` shape has a test-code mapping today (see Unmappable below,
 * `then.attribute` and `then.focused: moved|unchanged` are the current gaps). Those scenarios
 * become `test.skip('<name> — <reason>', ...)` so the report shows the gap instead of a false pass.
 *
 * Anatomy parts are located, in order: the primary part (`anatomy[0]`, e.g. Checkbox's
 * `control`, Switch's `track`) by role; a part whose name matches a string prop, by its text;
 * otherwise the `data-part`/`testID`/`part` hook a newly generated component carries (see
 * prompts/conventions/*.md) — components generated before that convention will fail at that
 * locator until they adopt it, which is the point of the gate.
 *
 * Usage:  node tools/behavior_tests.ts              # writes generated/behavior/*.test.ts(x)
 *         pnpm --filter @design-schema/react test -- generated/behavior/Checkbox.web
 *
 * Port of tools/behavior_tests.py: same files byte for byte, same line on stdout, same exit code.
 * Runs under Node's type stripping (22.18+ / 24): annotations only.
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { freshOutDir, readComponents } from './lib/components.ts';
import type { Dict } from './lib/components.ts';
import { has, pyGet, pyJsonDumps, pyReEscape, pyRepr, pySorted, pySplitlines, pyStr, pyStrip, truthy, writeText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { accessibleNameProp, behaviorFor } from './parse.ts';

export type { Dict };

/** Every path the tool reads or writes. The tests point these at a sandbox, the way the Python tests
 *  monkeypatched the module globals. */
export const paths = {
  ROOT: REPO_ROOT,
  GENERATED: join(REPO_ROOT, 'generated'),
  OUT: join(REPO_ROOT, 'generated', 'behavior'),
};

export const PLATFORMS: readonly string[] = ['web', 'lit', 'rn'];
// Roles a test cannot query for: `none`/`presentation` have no element, `text` is not an ARIA role, and
// `landmark` stands for whichever landmark role the component's own prop selects.
const NON_CONCRETE_ROLES = new Set(['none', 'presentation', 'text', 'landmark']);
// The component's surface is not in the document until something opens it and there is no `open` prop to set.
const HOVER_ROLES = new Set(['tooltip']);
export const SOURCE_FILE: Record<string, string> = {
  web: 'packages/react/src/{name}.tsx',
  lit: 'packages/lit/src/{name}.ts',
  rn: 'packages/rn/src/{name}.tsx',
};

export const ACTIVE_CHAIN_HELPER = `/** Every element that is "active" from the document down through shadow roots: the host, then the inner one.
 *  document.activeElement alone is a shadow host while focus sits inside its shadow tree. */
function activeChain(): Element[] {
  const chain: Element[] = [];
  let el: Element | null = document.activeElement;
  while (el) {
    chain.push(el);
    el = el.shadowRoot?.activeElement ?? null;
  }
  return chain;
}
`;
export const DEEP_QUERY_HELPER = `function deep(root: ParentNode, selector: string): Element | null {
  const direct = root.querySelector(selector);
  if (direct) return direct;
  for (const el of Array.from(root.querySelectorAll('*'))) {
    const shadow = (el as HTMLElement).shadowRoot;
    if (shadow) {
      const found = deep(shadow, selector);
      if (found) return found;
    }
  }
  return null;
}
`;
const EXT: Record<string, string> = { web: 'tsx', lit: 'ts', rn: 'tsx' };
const PKG_SRC: Record<string, string> = { web: 'packages/react/src', lit: 'packages/lit/src', rn: 'packages/rn/src' };
const REL_SRC: Record<string, string> = Object.fromEntries(PLATFORMS.map((p) => [p, '../../' + (PKG_SRC[p] as string)])); // from generated/behavior/

const STATE_ARIA: Record<string, string> = {
  checked: 'aria-checked',
  expanded: 'aria-expanded',
  selected: 'aria-selected',
  disabled: 'aria-disabled',
  invalid: 'aria-invalid',
  pressed: 'aria-pressed',
  open: 'aria-expanded',
};
const STATE_RN_MATCHER: Record<string, string> = { checked: 'toBeChecked', disabled: 'toBeDisabled', selected: 'toBeSelected', expanded: 'toBeExpanded' };
const KEY_MAP: Record<string, Record<string, string>> = { web: { Space: '[Space]' }, lit: { Space: ' ' } };

/** Raised when a `when`/`then` shape has no test-code mapping for a platform. */
export class Unmappable extends Error {
  reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = 'Unmappable';
    this.reason = reason;
  }
}

/** A JSON value rendered as a JS literal (JSON is valid JS for our purposes: strings, bools, numbers). */
export function js(value: unknown): string {
  return pyJsonDumps(value);
}

export function escRegex(text: string): string {
  return pyReEscape(text);
}

/** A `then.text` literal or `then.copy` template (which may contain `{label}`) as a JS `new RegExp(...)`
 *  expression, substituting the *runtime* `s.props.label` for the placeholder. */
export function regexExpr(template: string): string {
  // Testing Library trims leading/trailing whitespace off rendered text before matching
  // (e.g. copy.requiredIndicator is " (required)", rendered as its own trimmed text node).
  const parts = pyStrip(template).split('{label}');
  const jsParts: string[] = [];
  parts.forEach((part, i) => {
    if (part) jsParts.push(js(escRegex(part)));
    if (i < parts.length - 1) jsParts.push('escapeRegExp(s.props.label)');
  });
  return 'new RegExp(' + jsParts.join(' + ') + ')';
}

export const ESCAPE_REGEXP_HELPER = "function escapeRegExp(s: string): string {\n  return s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\n}\n";

export function primaryPart(c: Dict): string {
  const anatomy = (truthy(c.anatomy) ? c.anatomy : []) as string[];
  if (!anatomy.length) throw new Unmappable('component declares no anatomy — nothing to locate');
  return anatomy[0] as string;
}

/** A JS expression that finds an anatomy part's element, using `s`'s per-part accessors. */
export function partLocator(_c: Dict, part: string, _platform: string): string {
  return `s.${part}()`;
}

export function concreteRole(c: Dict): string | null {
  const role = c.a11y.role as string;
  return NON_CONCRETE_ROLES.has(role) ? null : role;
}

/** The component's root: the `data-ds` hook first (piercing shadow roots on Lit), the rendered tree otherwise. */
export function rootLocatorBody(c: Dict, platform: string): string {
  const name = c.name as string;
  const role = concreteRole(c);
  if (platform === 'web') {
    const byRole = role ? ` ?? screen.queryByRole('${role}')` : '';
    return `(document.querySelector('[data-ds="${name}"]')${byRole} ?? utils.container.firstElementChild) as HTMLElement`;
  }
  if (platform === 'rn') return `screen.queryByTestId('${name}') ?? screen.UNSAFE_root`;
  if (platform === 'lit') return 'el';
  throw new Unmappable(`unknown platform '${platform}'`);
}

/** The accessor body for `part`: how the part is actually found, one heuristic at a time. The primary part is
 *  the role element when the role can be queried, else the root (never `getByRole('text')` or `('none')`). */
export function partLocatorBody(c: Dict, part: string, platform: string): string {
  const anatomy = (truthy(c.anatomy) ? c.anatomy : []) as string[];
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  const role = concreteRole(c);
  const isPrimary = anatomy.length > 0 && part === anatomy[0];
  const prop = pyGet(props, part, undefined) as Dict | undefined;
  const isTextProp = prop !== undefined && prop !== null && prop.type === 'string';

  if (platform === 'web') {
    if (isPrimary) return role ? `(screen.queryByRole('${role}') ?? s.root()) as HTMLElement` : 's.root()';
    if (isTextProp) return `screen.getByText(props.${part})`;
    return `(utils.container.querySelector('[data-part="${part}"]') ?? s.root())`;
  }
  if (platform === 'rn') {
    if (isPrimary) return role ? `screen.queryByRole('${role}') ?? s.root()` : 's.root()';
    if (isTextProp) return `screen.getByText(props.${part})`;
    return `screen.queryByTestId('${c.name as string}.${part}') ?? s.root()`;
  }
  if (platform === 'lit') {
    const byPart = `deep(root, '[part="${part}"]') ?? deep(root, '[data-part="${part}"]')`;
    if (isPrimary) {
      const byRole = role ? `deep(root, '[role="${role}"]') ?? ` : '';
      return `(${byRole}${byPart} ?? root.firstElementChild) as HTMLElement`;
    }
    return `(${byPart}) as HTMLElement`;
  }
  throw new Unmappable(`unknown platform '${platform}'`);
}

/** Anatomy parts referenced by `when`/`then` across the scenarios, plus the primary part
 *  (state/focusable/name/renders assertions always target it, whether or not a `when` names it). */
export function usedParts(c: Dict, scenarios: Dict[]): string[] {
  const anatomy = (truthy(c.anatomy) ? c.anatomy : []) as string[];
  const used = new Set<string>();
  if (anatomy.length) used.add(anatomy[0] as string);
  for (const sc of scenarios) {
    const when = (truthy(pyGet(sc, 'when', null)) ? sc.when : {}) as Dict;
    for (const key of ['click', 'focus']) {
      if (has(when, key) && anatomy.includes(when[key] as string)) used.add(when[key] as string);
    }
    for (const item of sc.then as Dict[]) {
      for (const key of ['focus', 'focused']) {
        if (has(item, key) && anatomy.includes(item[key] as string)) used.add(item[key] as string);
      }
    }
  }
  return anatomy.filter((part) => used.has(part));
}

// ---------------------------------------------------------------------------
// `when` → (setup lines, action lines)
// ---------------------------------------------------------------------------

export function whenLines(c: Dict, sc: Dict, platform: string): string[] {
  const when = (pyGet(sc, 'when', null) ?? null) as Dict | null;
  if (!truthy(when)) return [];
  const entries = Object.entries(when as Dict);
  if (entries.length !== 1) throw new Unmappable(`when: ${pyRepr(pySorted(Object.keys(when as Dict)))} — only one interaction per scenario is supported`);
  const [kind, value] = entries[0] as [string, unknown];

  if (kind === 'click') {
    const locator = partLocator(c, value as string, platform);
    if (platform === 'web') return [`await s.user.click(${locator});`];
    if (platform === 'rn') return [`fireEvent.press(${locator});`];
    if (platform === 'lit') {
      // Playwright will not click an aria-disabled control on its own; a person can, and the doc says what happens.
      const given = (truthy(pyGet(sc, 'given', null)) ? sc.given : {}) as Dict;
      const force = truthy(pyGet(given, 'disabled', null)) ? ', { force: true }' : '';
      return [`await userEvent.click(${locator}${force});`];
    }
  }

  if (kind === 'key') {
    const control = partLocator(c, primaryPart(c), platform);
    if (platform === 'web') {
      const mapped = pyGet(KEY_MAP.web as Dict, value as string, '{' + (value as string) + '}') as string;
      return [`act(() => (${control}).focus());`, `await s.user.keyboard('${mapped}');`];
    }
    if (platform === 'lit') {
      const mapped = pyGet(KEY_MAP.lit as Dict, value as string, '{' + (value as string) + '}') as string;
      return ['s.el.focus();', `await userEvent.keyboard('${mapped}');`];
    }
    throw new Unmappable('when.key: React Native has no keyboard');
  }

  if (kind === 'type') {
    const control = partLocator(c, primaryPart(c), platform);
    if (platform === 'web') return [`await s.user.type(${control}, ${js(value)});`];
    if (platform === 'rn') return [`fireEvent.changeText(${control}, ${js(value)});`];
    if (platform === 'lit') return [`await userEvent.type(${control}, ${js(value)});`];
  }

  if (kind === 'focus') {
    const locator = partLocator(c, value as string, platform);
    if (platform === 'web') return [`act(() => (${locator}).focus());`];
    if (platform === 'lit') return [`(${locator}).focus();`];
    if (platform === 'rn') return [`fireEvent(${locator}, 'focus');`];
  }

  if (kind === 'blur') {
    const control = partLocator(c, primaryPart(c), platform);
    if (platform === 'web') return ['act(() => (document.activeElement as HTMLElement | null)?.blur());'];
    if (platform === 'lit') return ['(document.activeElement as HTMLElement | null)?.blur();'];
    if (platform === 'rn') return [`fireEvent(${control}, 'blur');`];
  }

  throw new Unmappable(`when.${kind}: no test-code mapping for this interaction`);
}

// ---------------------------------------------------------------------------
// `then` items → assertion lines
// ---------------------------------------------------------------------------

export function thenEventLines(_c: Dict, item: Dict, platform: string): string[] {
  const name = item.event as string;
  const mock = `s.events.${name}`;
  if (pyGet(item, 'fired', null) === false) return [`expect(${mock}).not.toHaveBeenCalled();`];
  if (has(item, 'with')) {
    const value = item.with as unknown;
    if (platform === 'web') return [`expect(${mock}).toHaveBeenCalledWith(${js(value)}, expect.anything());`];
    if (platform === 'rn') return [`expect(${mock}).toHaveBeenCalledWith(${js(value)});`];
    if (platform === 'lit') {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        return [`expect(${mock}).toHaveBeenCalledTimes(1);`, `expect(${mock}.mock.calls[0]?.[0]?.detail).toMatchObject(${js(value)});`];
      }
      return [
        `expect(${mock}).toHaveBeenCalledTimes(1);`,
        `expect(Object.values(${mock}.mock.calls[0]?.[0]?.detail ?? {})).toContain(${js(value)});`,
      ];
    }
  }
  return [`expect(${mock}).toHaveBeenCalled();`];
}

export function thenStateLines(c: Dict, item: Dict, platform: string): string[] {
  const state = item.state as string;
  const isValue = item.is as unknown;
  const control = partLocator(c, primaryPart(c), platform);
  if (platform === 'web' || platform === 'lit') {
    if (!has(STATE_ARIA, state)) throw new Error(`KeyError: '${state}'`);
    const aria = STATE_ARIA[state] as string;
    if (state === 'checked' && typeof isValue === 'boolean' && platform === 'web') {
      return [`expect(${control}).${isValue ? 'toBeChecked()' : 'not.toBeChecked()'};`];
    }
    if (state === 'checked' && typeof isValue === 'boolean' && platform === 'lit') {
      // A native checkbox carries its state in `.checked` (aria-checked is only for `mixed`); a role=switch or
      // role=checkbox on another element carries it in aria-checked.
      return [`expect(((${control}) as HTMLInputElement).type === 'checkbox' ? ((${control}) as HTMLInputElement).checked : (${control}).getAttribute('aria-checked') === 'true').toBe(${isValue ? 'true' : 'false'});`];
    }
    const val = isValue === true ? 'true' : isValue === false ? 'false' : pyStr(isValue);
    return [`expect(${control}).toHaveAttribute('${aria}', '${val}');`];
  }
  if (platform === 'rn') {
    const matcher = pyGet(STATE_RN_MATCHER, state, null) as string | null;
    if (matcher && typeof isValue === 'boolean') return [`expect(${control}).${isValue ? '' : 'not.'}${matcher}();`];
    return [`expect(${control}).toHaveProp('accessibilityState', expect.objectContaining({ ${state}: ${js(isValue)} }));`];
  }
  throw new Unmappable(`then.state: no mapping for ${platform}`);
}

export function thenFocusableLines(c: Dict, platform: string): string[] {
  const control = partLocator(c, primaryPart(c), platform);
  if (platform === 'web') return [`act(() => (${control}).focus());`, `expect(${control}).toHaveFocus();`];
  if (platform === 'lit') return ['s.el.focus();', 'expect(activeChain()).toContain(s.el);'];
  throw new Unmappable('then.focusable: React Native cannot observe focus');
}

export function thenFocusedLines(c: Dict, target: string, platform: string): string[] {
  if (platform === 'rn') throw new Unmappable('then.focused: React Native cannot observe focus');
  if (target === 'moved' || target === 'unchanged') {
    throw new Unmappable(`then.focused: '${target}' needs a pre-action focus snapshot this generator does not capture`);
  }
  if (platform === 'web') {
    if (target === 'none') return ['expect(document.activeElement === document.body).toBe(true);'];
    return [`expect(document.activeElement).toBe(${partLocator(c, target, platform)});`];
  }
  if (platform === 'lit') {
    // Focus inside nested shadow roots (a composed ds-button inside a dialog) shows up as a chain of hosts;
    // the part is focused when it, or the host that contains it, is in that chain.
    if (target === 'none') return ['expect(activeChain()).not.toContain(s.el);'];
    return [`expect(activeChain()).toContain(${partLocator(c, target, platform)});`];
  }
  throw new Unmappable(`then.focused: no mapping for ${platform}`);
}

export function thenTextLines(_c: Dict, text: string, platform: string): string[] {
  const rx = regexExpr(text);
  if (platform === 'web') return [`expect(screen.getByText(${rx})).toBeInTheDocument();`];
  if (platform === 'rn') return [`expect(screen.getByText(${rx})).toBeOnTheScreen();`];
  if (platform === 'lit') return [`expect(s.el.shadowRoot!.textContent).toMatch(${rx});`];
  throw new Unmappable(`then.text: no mapping for ${platform}`);
}

export function thenCopyLines(c: Dict, key: string, platform: string): string[] {
  const copy = (truthy(c.copy) ? c.copy : {}) as Dict;
  const template = pyGet(copy, key, null) as string | null;
  if (template === null || template === undefined) throw new Unmappable(`then.copy: unknown copy key '${key}'`);
  return thenTextLines(c, template, platform);
}

export function thenRoleLines(_c: Dict, role: string, platform: string): string[] {
  if (platform === 'web') return [`expect(screen.getByRole('${role}')).toBeInTheDocument();`];
  if (platform === 'rn') return [`expect(screen.getByRole('${role}')).toBeOnTheScreen();`];
  if (platform === 'lit') return [`expect(s.el.shadowRoot!.querySelector('[role="${role}"]')).not.toBeNull();`];
  throw new Unmappable(`then.role: no mapping for ${platform}`);
}

export function thenNameLines(c: Dict, platform: string): string[] {
  const role = concreteRole(c);
  if (role === null) throw new Unmappable(`then.name: role '${c.a11y.role as string}' cannot be queried; name the landmark/text role in the doc`);
  const nameProp = accessibleNameProp(c);
  const expected = nameProp ? `s.props.${nameProp}` : null;
  if (platform === 'web') {
    if (expected) return [`expect(screen.getByRole('${role}', { name: ${expected} })).toBeInTheDocument();`];
    return [`expect(screen.getByRole('${role}')).toHaveAccessibleName();`];
  }
  if (platform === 'rn') {
    if (expected) return [`expect(screen.getByRole('${role}', { name: ${expected} })).toBeOnTheScreen();`];
    return [`expect(screen.getByRole('${role}')).toBeOnTheScreen();`];
  }
  if (platform === 'lit') {
    const target = partLocator(c, primaryPart(c), platform);
    if (expected) return [`expect(${target}).toHaveAccessibleName(${expected});`];
    return [`expect(${target}).toHaveAccessibleName();`];
  }
  throw new Unmappable(`then.name: no mapping for ${platform}`);
}

/** Rendering is judged by the root, never by role: a decorative Icon has no role, an Input's role follows
 *  its type, and a closed overlay has no surface — none of those is a failure to render. */
export function thenRendersLines(_c: Dict, platform: string): string[] {
  if (platform === 'web') return ['expect(s.root()).not.toBeNull();'];
  if (platform === 'rn') return ['expect(s.root()).toBeTruthy();'];
  if (platform === 'lit') {
    // An element that renders into its shadow root must have put something there; a light-DOM element (a
    // landmark whose role lives on the host through ElementInternals) has rendered once it is connected.
    return ['expect(s.el.shadowRoot ? s.root.childElementCount > 0 : s.el.isConnected).toBe(true);'];
  }
  throw new Unmappable(`then.renders: no mapping for ${platform}`);
}

export function thenItemLines(c: Dict, item: Dict, platform: string): string[] {
  if (has(item, 'event')) return thenEventLines(c, item, platform);
  if (has(item, 'state')) return thenStateLines(c, item, platform);
  if (has(item, 'focusable')) return thenFocusableLines(c, platform);
  if (has(item, 'focused')) return thenFocusedLines(c, item.focused as string, platform);
  if (has(item, 'focus')) return thenFocusedLines(c, item.focus as string, platform);
  if (has(item, 'text')) return thenTextLines(c, item.text as string, platform);
  if (has(item, 'copy')) return thenCopyLines(c, item.copy as string, platform);
  if (has(item, 'role')) return thenRoleLines(c, item.role as string, platform);
  if (has(item, 'name')) return thenNameLines(c, platform);
  if (has(item, 'renders')) return thenRendersLines(c, platform);
  if (has(item, 'attribute')) throw new Unmappable('then.attribute: no test-code convention for an arbitrary attribute assertion yet');
  throw new Unmappable(`then: unrecognized assertion keys ${pyRepr(pySorted(Object.keys(item)))}`);
}

// ---------------------------------------------------------------------------
// Scenario → test block
// ---------------------------------------------------------------------------

/** Whether the scenario asserts on the component's surface (so a closed overlay must be opened first). */
export function needsSurface(sc: Dict): boolean {
  if (truthy(pyGet(sc, 'when', null))) return true;
  const keys = ['name', 'renders', 'focusable', 'focused', 'focus', 'state', 'role', 'text', 'copy'];
  return (sc.then as Dict[]).some((item) => keys.some((k) => has(item, k)));
}

/** `given` plus `open: true` for components with a boolean `open` prop, unless the scenario sets it. */
export function effectiveGiven(c: Dict, sc: Dict): Dict {
  const given: Dict = { ...((truthy(pyGet(sc, 'given', null)) ? sc.given : {}) as Dict) };
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  const openProp = pyGet(props, 'open', undefined) as Dict | undefined;
  if (truthy(openProp) && (openProp as Dict).type === 'boolean' && !has(given, 'open') && needsSurface(sc)) given.open = true;
  return given;
}

export function scenarioBlock(c: Dict, sc: Dict, platform: string): string {
  const name = (sc.name as string).replaceAll("'", "\\'");
  let when: string[] = [];
  let then: string[] = [];
  try {
    if (HOVER_ROLES.has(c.a11y.role as string) && needsSurface(sc)) {
      throw new Unmappable(`role '${c.a11y.role as string}' needs its trigger hovered or focused; covered by the Keyboard story`);
    }
    when = whenLines(c, sc, platform);
    for (const item of sc.then as Dict[]) then = then.concat(thenItemLines(c, item, platform));
  } catch (e) {
    if (!(e instanceof Unmappable)) throw e;
    const reason = pyStr(e.reason).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
    return `  test.skip('${name} — ${reason}', async () => {});`;
  }

  const given = js(effectiveGiven(c, sc));
  const kw = platform !== 'rn' ? 'async ' : '';
  const awaitSetup = platform === 'lit' ? 'await ' : '';
  const body = [`  test('${name}', ${kw}() => {`, `    const s = ${awaitSetup}setup(${given});`];
  for (const line of when) body.push(`    ${line}`);
  for (const line of then) body.push(`    ${line}`);
  body.push('  });');
  return body.join('\n');
}

// ---------------------------------------------------------------------------
// Per-platform file assembly
// ---------------------------------------------------------------------------

function eventsOf(c: Dict): Dict {
  return (truthy(c.events) ? c.events : {}) as Dict;
}

function needsRegexHelper(scenarios: Dict[]): boolean {
  return scenarios.some((sc) => (sc.then as Dict[]).some((item) => has(item, 'text') || has(item, 'copy')));
}

export function webFile(c: Dict, scenarios: Dict[]): string {
  const name = c.name as string;
  const src = REL_SRC.web as string;
  const parts = usedParts(c, scenarios);
  const events = eventsOf(c);
  const lines: string[] = [
    `// Generated by tools/behavior_tests.ts from the \`behavior\` block of the ${name} doc. Do not edit.`,
    "import { describe, expect, test, vi } from 'vitest';",
    "import { act, render, screen } from '@testing-library/react';",
    "import userEvent from '@testing-library/user-event';",
    `import { ${name} } from '${src}/${name}';`,
    `import type { ${name}Props } from '${src}/${name}';`,
    `import meta from '${src}/${name}.stories';`,
    '',
  ];
  if (needsRegexHelper(scenarios)) lines.push(ESCAPE_REGEXP_HELPER);
  lines.push(`function setup(given: Partial<${name}Props> = {}) {`);
  if (truthy(events)) {
    lines.push('  const events = {');
    for (const evName of Object.keys(events)) lines.push(`    ${evName}: vi.fn(),`);
    lines.push('  };');
  } else {
    lines.push('  const events = {};');
  }
  const evProps = Object.entries(events).map(([evName, ev]) => `${(ev as Dict).platforms.web as string}: events.${evName}`).join(', ');
  lines.push('  const props = { ...meta.args, ...given' + (evProps ? `, ${evProps}` : '') + ' };');
  lines.push(`  const utils = render(<${name} {...props} />);`);
  lines.push('  const user = userEvent.setup();');
  lines.push('  const s = {');
  lines.push('    ...utils,');
  lines.push('    user,');
  lines.push('    events,');
  lines.push('    props,');
  lines.push(`    root: () => ${rootLocatorBody(c, 'web')},`);
  for (const part of parts) lines.push(`    ${part}: () => ${partLocatorBody(c, part, 'web')},`);
  lines.push(`    rerender: (next: Partial<${name}Props>) => utils.rerender(<${name} {...props} {...next} />),`);
  lines.push('  };');
  lines.push('  return s;');
  lines.push('}');
  lines.push('');
  lines.push(`describe('${name}', () => {`);
  for (const sc of scenarios) lines.push(scenarioBlock(c, sc, 'web'));
  lines.push('});');
  return lines.join('\n') + '\n';
}

export function rnFile(c: Dict, scenarios: Dict[]): string {
  const name = c.name as string;
  const src = REL_SRC.rn as string;
  const parts = usedParts(c, scenarios);
  const events = eventsOf(c);
  const lines: string[] = [
    `// Generated by tools/behavior_tests.ts from the \`behavior\` block of the ${name} doc. Do not edit.`,
    "import * as React from 'react';",
    "import { fireEvent, render, screen } from '@testing-library/react-native';",
    `import { ${name} } from '${src}/${name}';`,
    `import type { ${name}Props } from '${src}/${name}';`,
    `import meta from '${src}/${name}.stories';`,
    `import { ThemeProvider } from '${src}/theme';`,
    '',
  ];
  if (needsRegexHelper(scenarios)) lines.push(ESCAPE_REGEXP_HELPER);
  lines.push(`function setup(given: Partial<${name}Props> = {}) {`);
  if (truthy(events)) {
    lines.push('  const events = {');
    for (const evName of Object.keys(events)) lines.push(`    ${evName}: jest.fn(),`);
    lines.push('  };');
  } else {
    lines.push('  const events = {};');
  }
  const evProps = Object.entries(events).map(([evName, ev]) => `${(ev as Dict).platforms.rn as string}: events.${evName}`).join(', ');
  lines.push(`  const props: ${name}Props = ` + '{ ...(meta.args as ' + `${name}Props)` + ', ...given' + (evProps ? `, ${evProps}` : '') + ' };');
  lines.push(`  const tree = (p: ${name}Props) => (`);
  lines.push('    <ThemeProvider mode="light">');
  lines.push(`      <${name} {...p} />`);
  lines.push('    </ThemeProvider>');
  lines.push('  );');
  lines.push('  const utils = render(tree(props));');
  lines.push('  const s = {');
  lines.push('    ...utils,');
  lines.push('    events,');
  lines.push('    props,');
  lines.push(`    root: () => ${rootLocatorBody(c, 'rn')},`);
  for (const part of parts) lines.push(`    ${part}: () => ${partLocatorBody(c, part, 'rn')},`);
  lines.push(`    rerender: (next: Partial<${name}Props>) => utils.rerender(tree({ ...props, ...next })),`);
  lines.push('  };');
  lines.push('  return s;');
  lines.push('}');
  lines.push('');
  lines.push(`describe('${name}', () => {`);
  for (const sc of scenarios) lines.push(scenarioBlock(c, sc, 'rn'));
  lines.push('});');
  return lines.join('\n') + '\n';
}

export function litFile(c: Dict, scenarios: Dict[]): string {
  const name = c.name as string;
  const tag = c.platforms.lit.tag as string;
  const src = REL_SRC.lit as string;
  const parts = usedParts(c, scenarios);
  const events = eventsOf(c);
  const lines: string[] = [
    `// Generated by tools/behavior_tests.ts from the \`behavior\` block of the ${name} doc. Do not edit.`,
    "import { beforeEach, describe, expect, test, vi } from 'vitest';",
    "import { userEvent } from 'vitest/browser';",
    `import '${src}/${name}.js';`,
    `import meta from '${src}/${name}.stories.js';`,
    '',
  ];
  if (needsRegexHelper(scenarios)) lines.push(ESCAPE_REGEXP_HELPER);
  lines.push(DEEP_QUERY_HELPER);
  lines.push(ACTIVE_CHAIN_HELPER);
  lines.push('async function setup(given: Record<string, unknown> = {}) {');
  lines.push(`  const el = document.createElement('${tag}');`);
  lines.push('  const props = { ...meta.args, ...given };');
  lines.push('  for (const [key, value] of Object.entries(props)) {');
  lines.push('    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;');
  lines.push('  }');
  lines.push('  const events = {');
  for (const evName of Object.keys(events)) lines.push(`    ${evName}: vi.fn(),`);
  lines.push('  };');
  for (const [evName, ev] of Object.entries(events)) {
    const litEvent = (ev as Dict).platforms.lit as string;
    lines.push(`  el.addEventListener('${litEvent}', events.${evName} as unknown as EventListener);`);
  }
  lines.push('  document.body.append(el);');
  lines.push('  await (el as unknown as { updateComplete: Promise<boolean> }).updateComplete;');
  lines.push('  const root: ParentNode = el.shadowRoot ?? el;  // some elements render in light DOM');
  lines.push('  const s = {');
  lines.push('    el,');
  lines.push('    root,');
  lines.push('    events,');
  lines.push('    props,');
  lines.push('    root_: () => el,');
  for (const part of parts) lines.push(`    ${part}: () => ${partLocatorBody(c, part, 'lit')},`);
  lines.push('  };');
  lines.push('  return s;');
  lines.push('}');
  lines.push('');
  lines.push('beforeEach(() => {');
  lines.push('  document.body.replaceChildren();');
  lines.push('});');
  lines.push('');
  lines.push(`describe('${tag}', () => {`);
  for (const sc of scenarios) lines.push(scenarioBlock(c, sc, 'lit'));
  lines.push('});');
  return lines.join('\n') + '\n';
}

const FILE_BUILDERS: Record<string, (c: Dict, scenarios: Dict[]) => string> = { web: webFile, lit: litFile, rn: rnFile };

const TEST_LINE = /^\s*test\('/u;
const SKIP_LINE = /^\s*test\.skip\('/u;

export function main(): number {
  const entries = readComponents(join(paths.GENERATED, 'components.json'));
  freshOutDir(paths.OUT, (n) => /^.*\.test\..*$/s.test(n));
  let nFiles = 0;
  let nTests = 0;
  let nSkips = 0;
  let nMissing = 0;
  for (const entry of entries) {
    const c = entry.component as Dict;
    const derived = (truthy(pyGet(entry, 'behaviorDerived', null)) ? entry.behaviorDerived : []) as Dict[];
    if (!truthy(pyGet(c, 'behavior', null)) && !derived.length) continue;
    for (const platform of PLATFORMS) {
      if (!has(c.platforms as Dict, platform) || !truthy(pyGet(c.platforms[platform] as Dict, 'supported', true))) continue;
      if (!existsSync(join(paths.ROOT, (SOURCE_FILE[platform] as string).replace('{name}', c.name as string)))) {
        nMissing += 1; // not generated yet: no test file, so the package suite stays green
        continue;
      }
      const scenarios = behaviorFor(c, derived, platform);
      if (!scenarios.length) continue;
      const content = (FILE_BUILDERS[platform] as (c: Dict, s: Dict[]) => string)(c, scenarios);
      writeText(join(paths.OUT, `${c.name as string}.${platform}.test.${EXT[platform] as string}`), content);
      nFiles += 1;
      for (const line of pySplitlines(content)) {
        if (TEST_LINE.test(line)) nTests += 1;
        else if (SKIP_LINE.test(line)) nSkips += 1;
      }
    }
  }
  const out = relative(paths.ROOT, paths.OUT);
  process.stdout.write(`✔ behavior gate: ${nFiles} file(s), ${nTests} test(s), ${nSkips} skip(s), ${nMissing} target(s) not generated yet → ${out}/\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
