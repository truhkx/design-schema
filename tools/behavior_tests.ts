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
 * SwiftUI is the fourth platform and the odd one out in two ways. Its cases are Swift Testing `@Test`s, so
 * they are written where SwiftPM looks for them:
 *
 *     packages/swiftui/Tests/DesignSchemaTests/Generated/<Name>BehaviorTests.swift
 *
 * And unlike the three above they are *committed*: `swift test` runs on a macOS runner
 * (.github/workflows/swiftui-gates.yml) that never runs `pnpm install`, so a file it cannot derive has to
 * travel with the branch. `node tools/behavior_tests.ts --check` fails when what is on disk is not what this
 * script would write, which is how CI keeps them from going stale.
 *
 * A Swift case renders the component with the scenario's `given` props inside a `DSHost`
 * (packages/swiftui/Sources/DesignSchema/Support/Testing.swift), acts on it through the accessibility
 * identifiers the conventions require (`<Name>` on the root, `<Name>.<part>` on each anatomy part), and
 * asserts against the accessibility tree — label, value, traits, identifier presence. Focus is the standing
 * gap: nothing in a `swift test` process can move or observe SwiftUI focus, so those scenarios are
 * `.disabled` with that reason and the iPad keyboard gate (Tests/DesignSchemaUITests) is what checks them.
 *
 * Not every `when`/`then` shape (schema/component.ts `whenClause`/`thenClause`) has a test-code mapping on every
 * platform (see Unmappable below; `then.focused: moved|unchanged` is the gap everywhere). Those scenarios
 * become `test.skip('<name> — <reason>', ...)` so the report shows the gap instead of a false pass.
 *
 * Anatomy parts are located, in order: the primary part (`anatomy[0]`, e.g. Checkbox's
 * `control`, Switch's `track`) by role; a part whose name matches a string prop, by its text;
 * otherwise the `data-part`/`testID`/`part` hook a newly generated component carries (see
 * prompts/conventions/*.md) — components generated before that convention will fail at that
 * locator until they adopt it, which is the point of the gate.
 *
 * Usage:  node tools/behavior_tests.ts              # writes generated/behavior/*.test.ts(x) and the Swift cases
 *         node tools/behavior_tests.ts --check      # the committed Swift cases match the docs (CI)
 *         pnpm --filter @design-schema/react test -- generated/behavior/Checkbox.web
 *
 * Port of tools/behavior_tests.py: same files byte for byte, same line on stdout, same exit code — the
 * `swiftui` emitter and `--check` are additions, and the Python version never had an iOS package.
 * Runs under Node's type stripping (22.18+ / 24): annotations only.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { freshOutDir, readComponents } from './lib/components.ts';
import type { Dict } from './lib/components.ts';
import { has, pyGet, pyJsonDumps, pyReEscape, pyRepr, pySorted, pySplitlines, pyStr, pyStrip, readText, truthy, writeText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';
import { controlledPairs, copyText, NON_QUERYABLE_ROLES, normalizeKey, resolveRole, roleIn } from '../schema/component.ts';
import { PLATFORMS, SOURCE_EXT, sourceDir, TS_PLATFORMS } from '../schema/platforms.ts';
import { accessibleNameProp, behaviorFor } from './parse.ts';

export type { Dict };

/** Every path the tool reads or writes. The tests point these at a sandbox, the way the Python tests
 *  monkeypatched the module globals. */
export const paths = {
  ROOT: REPO_ROOT,
  GENERATED: join(REPO_ROOT, 'generated'),
  OUT: join(REPO_ROOT, 'generated', 'behavior'),
};

// The component's surface only shows while its trigger is hovered: web and Lit hover the trigger first; React
// Native and SwiftUI have no hover to perform.
const HOVER_ROLES = new Set(['tooltip']);

/** The component's own source file on a platform; while it is missing the component is not generated there yet. */
export function sourceFile(root: string, name: string, platform: string): string {
  return join(sourceDir(root, platform), `${name}.${SOURCE_EXT[platform] as string}`);
}

/** Where the Swift cases go. Derived from `paths.ROOT` rather than stored beside it, so a test that
 *  sandboxes the root cannot write into the real package. */
export function swiftOutDir(): string {
  return join(paths.ROOT, 'packages', 'swiftui', 'Tests', 'DesignSchemaTests', 'Generated');
}

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
// The three JavaScript platforms share `scenarioBlock` and import the component from its package source, relative to
// generated/behavior/; `swiftui` has its own emitter below.
const REL_SRC: Record<string, string> = Object.fromEntries(
  TS_PLATFORMS.map((p) => [p, relative(join(REPO_ROOT, 'generated', 'behavior'), sourceDir(REPO_ROOT, p)).replaceAll('\\', '/')]),
);

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
// React Native's accessibilityState has no `open`; an open disclosure is `expanded` there.
const STATE_RN: Record<string, string> = { open: 'expanded' };
/** Each platform's user-event spelling for a `KeyboardEvent.key` that is not written `{<key>}` there. */
const KEY_MAP: Record<string, Record<string, string>> = { web: { ' ': '[Space]' }, lit: { ' ': ' ' } };

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

/** The role a test can find the component by: its resolved role, or null when that is unresolved (a `roleFrom` prop
 *  with no default) or one of NON_QUERYABLE_ROLES. */
export function concreteRole(c: Dict): string | null {
  const role = resolveRole(c);
  return role === null || roleIn(NON_QUERYABLE_ROLES, role) ? null : role;
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

/** The type a prop's literal takes: its `type`, except that an `integer` is a `number`, and a `union` whose
 *  `shape` starts with a scalar (`string | string[]`, `number | [number, number]`) reads as that scalar, the way
 *  it was typed before `union` existed. A given value is still rendered by its runtime type. */
export function scalarType(prop: Dict): string {
  if (prop.type === 'integer') return 'number';
  if (prop.type !== 'union') return prop.type as string;
  const first = pyStr(pyGet(prop, 'shape', '')).split('|')[0]?.trim();
  return first === 'string' || first === 'number' || first === 'boolean' ? first : 'union';
}

/** The accessor body for `part`: how the part is actually found, one heuristic at a time. The primary part is
 *  the role element when the role can be queried, else the root (never `getByRole('text')` or `('none')`). */
export function partLocatorBody(c: Dict, part: string, platform: string): string {
  const anatomy = (truthy(c.anatomy) ? c.anatomy : []) as string[];
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  const role = concreteRole(c);
  const isPrimary = anatomy.length > 0 && part === anatomy[0];
  const prop = pyGet(props, part, undefined) as Dict | undefined;
  const isTextProp = prop !== undefined && prop !== null && scalarType(prop) === 'string';

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
    for (const key of ['click', 'focus', 'hover']) {
      if (has(when, key) && anatomy.includes(when[key] as string)) used.add(when[key] as string);
    }
    for (const item of sc.then as Dict[]) {
      for (const key of ['focused', 'on']) {
        if (has(item, key) && anatomy.includes(item[key] as string)) used.add(item[key] as string);
      }
    }
  }
  return anatomy.filter((part) => used.has(part));
}

// ---------------------------------------------------------------------------
// `when` → (setup lines, action lines)
// ---------------------------------------------------------------------------

/** A `keyChord` in user-event's `keyboard()` syntax, which web and Lit share: modifiers held (`{Shift>}`), the
 *  key, modifiers released. A printable key types itself; a named one is `{<name>}` unless KEY_MAP says otherwise. */
export function keyStroke(chord: string, platform: string): string {
  if (chord === 'a-z') throw new Unmappable("when.key: 'a-z' is a typeahead range, not one key press");
  const modifiers = normalizeKey(chord).split('+');
  const key = modifiers.pop() as string;
  const stroke = pyGet((KEY_MAP[platform] ?? {}) as Dict, key, key.length === 1 ? key : `{${key}}`) as string;
  return modifiers.map((m) => `{${m}>}`).join('') + stroke + [...modifiers].reverse().map((m) => `{/${m}}`).join('');
}

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
    if (platform === 'web') return [`act(() => (${control}).focus());`, `await s.user.keyboard('${keyStroke(value as string, platform)}');`];
    if (platform === 'lit') return ['s.el.focus();', `await userEvent.keyboard('${keyStroke(value as string, platform)}');`];
    throw new Unmappable('when.key: React Native has no keyboard');
  }

  if (kind === 'set') {
    // A controlled prop change: the harness re-renders with the scenario's props merged with these.
    if (platform === 'web' || platform === 'rn') return [`s.rerender(${js(value)});`];
    if (platform === 'lit') return [`Object.assign(s.el, ${js(value)});`, 'await (s.el as unknown as { updateComplete: Promise<boolean> }).updateComplete;'];
  }

  if (kind === 'hover') {
    const locator = partLocator(c, value as string, platform);
    if (platform === 'web') return [`await s.user.hover(${locator});`];
    if (platform === 'lit') return [`await userEvent.hover(${locator});`];
    throw new Unmappable('when.hover: React Native has no pointer to hover with');
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

export function thenEventLines(c: Dict, item: Dict, platform: string): string[] {
  const name = item.event as string;
  const mock = `s.events.${name}`;
  if (pyGet(item, 'fired', null) === false) return [`expect(${mock}).not.toHaveBeenCalled();`];
  if (has(item, 'with')) {
    const value = item.with as unknown;
    if (platform === 'web') return [`expect(${mock}).toHaveBeenCalledWith(${js(value)}, expect.anything());`];
    if (platform === 'rn') return [`expect(${mock}).toHaveBeenCalledWith(${js(value)});`];
    if (platform === 'lit') {
      // A declared one-field payload names the detail key a scalar `with` is.
      const payload = (c.events as Dict | undefined)?.[name]?.payload as Dict[] | undefined;
      const field = payload?.length === 1 ? (payload[0]?.name as string) : null;
      if (field !== null && (value === null || typeof value !== 'object')) {
        return [`expect(${mock}).toHaveBeenCalledTimes(1);`, `expect(${mock}.mock.calls[0]?.[0]?.detail?.${field}).toEqual(${js(value)});`];
      }
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
    const rnState = pyGet(STATE_RN, state, state) as string;
    const matcher = pyGet(STATE_RN_MATCHER, rnState, null) as string | null;
    if (matcher && typeof isValue === 'boolean') return [`expect(${control}).${isValue ? '' : 'not.'}${matcher}();`];
    return [`expect(${control}).toHaveProp('accessibilityState', expect.objectContaining({ ${rnState}: ${js(isValue)} }));`];
  }
  throw new Unmappable(`then.state: no mapping for ${platform}`);
}

export function thenFocusableLines(c: Dict, platform: string, focusable = true): string[] {
  const control = partLocator(c, primaryPart(c), platform);
  const not = focusable ? '' : 'not.';
  if (platform === 'web') return [`act(() => (${control}).focus());`, `expect(${control}).${not}toHaveFocus();`];
  if (platform === 'lit') return ['s.el.focus();', `expect(activeChain()).${not}toContain(s.el);`];
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
  const entry = pyGet(copy, key, null) as Parameters<typeof copyText>[0] | null;
  if (entry === null || entry === undefined) throw new Unmappable(`then.copy: unknown copy key '${key}'`);
  return thenTextLines(c, copyText(entry), platform);
}

export function thenRoleLines(_c: Dict, role: string, platform: string): string[] {
  if (platform === 'web') return [`expect(screen.getByRole('${role}')).toBeInTheDocument();`];
  if (platform === 'rn') return [`expect(screen.getByRole('${role}')).toBeOnTheScreen();`];
  if (platform === 'lit') return [`expect(s.el.shadowRoot!.querySelector('[role="${role}"]')).not.toBeNull();`];
  throw new Unmappable(`then.role: no mapping for ${platform}`);
}

/** `name: true` asserts the name the naming prop gives (or any non-empty one); `name: '<text>'` that exact name. */
export function thenNameLines(c: Dict, platform: string, name: true | string = true): string[] {
  const role = concreteRole(c);
  if (role === null) {
    const shown = c.a11y.roleFrom !== undefined ? `from prop '${c.a11y.roleFrom as string}'` : `'${resolveRole(c) as string}'`;
    throw new Unmappable(`then.name: role ${shown} cannot be queried; name the landmark/text role in the doc`);
  }
  const nameProp = accessibleNameProp(c);
  const expected = typeof name === 'string' ? js(name) : nameProp ? `s.props.${nameProp}` : null;
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
export function thenRendersLines(_c: Dict, platform: string, renders = true): string[] {
  if (platform === 'web') return [`expect(s.root()).${renders ? 'not.' : ''}toBeNull();`];
  // The root falls back to UNSAFE_root, which always exists; nothing rendered is an empty tree.
  if (platform === 'rn') return [renders ? 'expect(s.root()).toBeTruthy();' : 'expect(screen.toJSON()).toBeNull();'];
  if (platform === 'lit') {
    // An element that renders into its shadow root must have put something there; a light-DOM element (a
    // landmark whose role lives on the host through ElementInternals) has rendered once it is connected.
    return [`expect(s.el.shadowRoot ? s.root.childElementCount > 0 : s.el.isConnected).toBe(${renders ? 'true' : 'false'});`];
  }
  throw new Unmappable(`then.renders: no mapping for ${platform}`);
}

/** `{ attribute, is, on? }` on the primary part or `on`: a string or boolean is the attribute's value, null its absence.
 *  React Native has no attributes; the same name is a prop of the host element there. */
export function thenAttributeLines(c: Dict, item: Dict, platform: string): string[] {
  const attr = js(item.attribute as string);
  const isValue = item.is as string | boolean | null;
  const target = partLocator(c, has(item, 'on') ? (item.on as string) : primaryPart(c), platform);
  if (platform === 'web' || platform === 'lit') {
    if (isValue === null) return [`expect(${target}).not.toHaveAttribute(${attr});`];
    return [`expect(${target}).toHaveAttribute(${attr}, ${js(String(isValue))});`];
  }
  if (platform === 'rn') {
    if (isValue === null) return [`expect(${target}).not.toHaveProp(${attr});`];
    return [`expect(${target}).toHaveProp(${attr}, ${js(isValue)});`];
  }
  throw new Unmappable(`then.attribute: no mapping for ${platform}`);
}

export function thenItemLines(c: Dict, item: Dict, platform: string): string[] {
  if (has(item, 'event')) return thenEventLines(c, item, platform);
  if (has(item, 'state')) return thenStateLines(c, item, platform);
  if (has(item, 'attribute')) return thenAttributeLines(c, item, platform);
  if (has(item, 'focusable')) return thenFocusableLines(c, platform, item.focusable !== false);
  if (has(item, 'focused')) return thenFocusedLines(c, item.focused as string, platform);
  if (has(item, 'text')) return thenTextLines(c, item.text as string, platform);
  if (has(item, 'copy')) return thenCopyLines(c, item.copy as string, platform);
  if (has(item, 'role')) return thenRoleLines(c, item.role as string, platform);
  if (has(item, 'name')) return thenNameLines(c, platform, item.name as true | string);
  if (has(item, 'renders')) return thenRendersLines(c, platform, item.renders !== false);
  throw new Unmappable(`then: unrecognized assertion keys ${pyRepr(pySorted(Object.keys(item)))}`);
}

// ---------------------------------------------------------------------------
// Scenario → test block
// ---------------------------------------------------------------------------

/** Whether the scenario asserts on the component's surface (so a closed overlay must be opened first). */
export function needsSurface(sc: Dict): boolean {
  if (truthy(pyGet(sc, 'when', null))) return true;
  const keys = ['name', 'renders', 'focusable', 'focused', 'state', 'role', 'text', 'copy', 'attribute'];
  return (sc.then as Dict[]).some((item) => keys.some((k) => has(item, k)));
}

/** The boolean prop that opens the component's surface: the controlled prop whose `state` is `open`, else a
 *  boolean prop named `open`; null when there is neither. */
function openPropName(c: Dict): string | null {
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  const name = controlledPairs(c).find((pair) => pair.state === 'open')?.prop ?? 'open';
  const prop = pyGet(props, name, undefined) as Dict | undefined;
  return truthy(prop) && (prop as Dict).type === 'boolean' ? name : null;
}

/** `given` plus the open prop set to true (see `openPropName`), unless the scenario sets it. */
export function effectiveGiven(c: Dict, sc: Dict): Dict {
  const given: Dict = { ...((truthy(pyGet(sc, 'given', null)) ? sc.given : {}) as Dict) };
  const open = openPropName(c);
  if (open !== null && !has(given, open) && needsSurface(sc)) given[open] = true;
  return given;
}

export function scenarioBlock(c: Dict, sc: Dict, platform: string): string {
  const name = (sc.name as string).replaceAll("'", "\\'");
  let when: string[] = [];
  let then: string[] = [];
  try {
    const role = resolveRole(c, effectiveGiven(c, sc));
    if (role !== null && HOVER_ROLES.has(role) && needsSurface(sc)) {
      if (platform === 'rn') throw new Unmappable(`role '${role}' needs its trigger hovered or focused; covered by the Keyboard story`);
      // The trigger is the first anatomy part; a scenario with its own interaction performs that instead, and one
      // whose controlled open prop already shows the surface needs no hover (Lit's harness slots no trigger).
      const open = openPropName(c);
      if (!truthy(pyGet(sc, 'when', null)) && (open === null || effectiveGiven(c, sc)[open] !== true)) when = whenLines(c, { ...sc, when: { hover: primaryPart(c) } }, platform);
    }
    when = when.concat(whenLines(c, sc, platform));
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
// SwiftUI: the same scenarios as Swift Testing cases
// ---------------------------------------------------------------------------

/** Argument labels that would be a parse error bare. A doc prop is camelCase, so this is short. */
const SWIFT_KEYWORDS = new Set(['associatedtype', 'as', 'break', 'case', 'catch', 'class', 'continue', 'default', 'defer', 'deinit',
  'do', 'else', 'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'for', 'func', 'guard', 'if', 'import', 'in', 'init',
  'inout', 'internal', 'is', 'let', 'nil', 'operator', 'private', 'protocol', 'public', 'repeat', 'rethrows', 'return', 'self',
  'static', 'struct', 'subscript', 'super', 'switch', 'throw', 'throws', 'true', 'try', 'typealias', 'var', 'where', 'while']);

/** ARIA roles a `then.role` can be checked against, and the trait that carries them. Deliberately partial:
 *  a role with no trait on both hosts (`heading` — AppKit has no such role, and AppKit is what `swift test`
 *  reads on the Mac) is a skip with its reason, not an assertion that can never hold. */
export const SWIFT_ROLE_TRAIT: Record<string, string> = {
  button: 'button',
  link: 'link',
  img: 'image',
  image: 'image',
  text: 'staticText',
  searchbox: 'searchField',
  slider: 'adjustable',
  spinbutton: 'adjustable',
};

/** A Swift string literal. */
export function swiftString(value: unknown): string {
  const text = pyStr(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t');
  return `"${text}"`;
}

/** An argument label, back-ticked when the doc's prop name is a Swift keyword. */
export function swiftLabel(name: string): string {
  return SWIFT_KEYWORDS.has(name) ? `\`${name}\`` : name;
}

/** A doc enum value as the nested `enum`'s case. Values that are quoted digits (Heading `level`, Stack
 *  `gap`) stay numbers: the template says those initializers take `Int` as well. A value that *starts* with
 *  digits cannot be a Swift identifier at all, so the digits move to the end (`2xl` → `xl2`) — the rule
 *  prompts/conventions/swiftui.md gives the generator, so the component and this test agree on the name. */
export function swiftCase(value: unknown): string {
  const text = pyStr(value);
  if (/^-?\d+$/u.test(text)) return text;
  let camel = text.replace(/[^A-Za-z0-9]+(.)?/gu, (_m, next: string | undefined) => (next ? next.toUpperCase() : ''));
  const leadingDigits = /^(\d+)([A-Za-z].*)$/u.exec(camel);
  if (leadingDigits) camel = `${leadingDigits[2] as string}${leadingDigits[1] as string}`;
  if (!/^[A-Za-z][A-Za-z0-9]*$/u.test(camel)) throw new Unmappable(`enum value '${text}' has no Swift case name`);
  return '.' + camel[0]?.toLowerCase() + camel.slice(1);
}

/** A scenario name as a Swift function name: `renders-variant-primary` → `rendersVariantPrimary`. */
export function swiftFunctionName(name: string, used: Set<string>): string {
  const camel = name.replace(/[^A-Za-z0-9]+(.)?/gu, (_m, next: string | undefined) => (next ? next.toUpperCase() : ''));
  let base = /^[A-Za-z]/u.test(camel) ? camel[0]?.toLowerCase() + camel.slice(1) : `scenario${camel}`;
  if (SWIFT_KEYWORDS.has(base)) base = `${base}Scenario`;
  let candidate = base;
  for (let n = 2; used.has(candidate); n += 1) candidate = `${base}${n}`;
  used.add(candidate);
  return candidate;
}

/** The value the scenario passes for a prop: the `given` one, or something the prop's own type allows when
 *  the prop is required and the scenario said nothing. There is no `meta.args` on this platform — a Swift
 *  initializer has the doc's defaults built in, so only the required props need filling. */
export function swiftPropValue(propName: string, prop: Dict, value: unknown, given: boolean): string {
  const type = scalarType(prop);
  if (given) {
    if (type === 'enum') return swiftCase(value);
    // A `content` prop is a @ViewBuilder closure, so even a string the doc supplies (parse.ts fills the
    // derived accessible-name scenario in with one) has to arrive as a view.
    if (type === 'content' && typeof value === 'string') return `{ SwiftUI.Text(${swiftString(value)}) }`;
    if (typeof value === 'string') return swiftString(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return pyStr(value);
    throw new Unmappable(`given.${propName}: no Swift literal for ${pyRepr(value)}`);
  }
  if (type === 'string') return swiftString(propName[0]?.toUpperCase() + propName.slice(1));
  if (type === 'enum') {
    const values = (truthy(prop.values) ? prop.values : []) as unknown[];
    return swiftCase(pyGet(prop, 'default', values[0]));
  }
  if (type === 'boolean') return truthy(pyGet(prop, 'default', false)) ? 'true' : 'false';
  if (type === 'number') return pyStr(pyGet(prop, 'default', 0));
  if (type === 'content') return `{ SwiftUI.Text(${swiftString(propName[0]?.toUpperCase() + propName.slice(1))}) }`;
  throw new Unmappable(`prop '${propName}' is required and ${type}: no literal this generator can synthesize`);
}

/** Is this prop declared for swiftui at all? A prop narrowed to other platforms (Button's `loading`) is not
 *  an initializer parameter here. */
function onSwiftUI(prop: Dict): boolean {
  const platforms = pyGet(prop, 'platforms', null) as string[] | null;
  return platforms === null || platforms.includes('swiftui');
}

/**
 * SwiftUI's controlled/uncontrolled idiom: where a controlled prop has a default prop (`controlledPairs`:
 * `open` seeded by `defaultOpen`), the initializer takes the controlled prop as a `Binding<Bool>?` and the
 * default prop as the initial value (prompts/templates/swiftui.md). A scenario that sets the controlled prop to a
 * literal is describing that initial state, and the default parameter is the only one a literal typechecks against.
 */
export function swiftUncontrolled(props: Dict, given: Dict): Dict {
  const seeds = new Map(controlledPairs({ props }).flatMap((pair) => (pair.default === null ? [] : [[pair.prop, pair.default] as const])));
  const remapped: Dict = {};
  for (const [key, value] of Object.entries(given)) {
    const seed = seeds.get(key);
    if (seed !== undefined && has(props, seed) && !has(given, seed)) remapped[seed] = value;
    else remapped[key] = value;
  }
  return remapped;
}

/** The initializer call's arguments: the doc's props in the doc's order, then one spy per event. */
export function swiftInitArgs(c: Dict, authored: Dict): string[] {
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  for (const key of Object.keys(authored)) {
    if (!has(props, key)) throw new Unmappable(`given.${key}: the doc declares no such prop`);
  }
  const given = swiftUncontrolled(props, authored);
  const args: string[] = [];
  for (const [propName, prop] of Object.entries(props)) {
    const isGiven = has(given, propName);
    if (!onSwiftUI(prop as Dict)) {
      if (isGiven) throw new Unmappable(`given.${propName}: the doc does not declare this prop for swiftui`);
      continue;
    }
    if (!isGiven && !truthy((prop as Dict).required)) continue;
    args.push(`${swiftLabel(propName)}: ${swiftPropValue(propName, prop as Dict, given[propName], isGiven)}`);
  }
  for (const [evName, ev] of Object.entries(eventsOf(c))) {
    const swiftName = pyGet((ev as Dict).platforms as Dict, 'swiftui', null) as string | null;
    if (!truthy(swiftName)) continue; // an event with no swiftui name is not a parameter; asserting on it is the skip
    args.push(`${swiftLabel(swiftName as string)}: events.spy(${swiftString(evName)})`);
  }
  return args;
}

/** `<Name>` and `<Name>.<part>` — the identifiers prompts/conventions/swiftui.md requires. The root is the
 *  fallback for every part, because `.accessibilityElement(children: .combine)` folds parts into it. */
export function swiftPartArgs(c: Dict, part: string): string {
  return `${swiftString(`${c.name as string}.${part}`)}, or: ${swiftString(c.name as string)}`;
}

/** The value the scenario gives the prop that carries the accessible name, when it is a literal this
 *  generator knows. `null` when the name is intrinsic or comes from content. */
export function swiftNameValue(c: Dict, given: Dict): string | null {
  const propName = accessibleNameProp(c);
  if (propName === null) return null;
  if (has(given, propName)) return typeof given[propName] === 'string' ? (given[propName] as string) : null;
  const prop = pyGet((truthy(c.props) ? c.props : {}) as Dict, propName, {}) as Dict;
  if (scalarType(prop) !== 'string' || !truthy(prop.required)) return null;
  return (propName[0]?.toUpperCase() ?? '') + propName.slice(1);
}

export function swiftWhenLines(c: Dict, sc: Dict): string[] {
  const when = (pyGet(sc, 'when', null) ?? null) as Dict | null;
  if (!truthy(when)) return [];
  const entries = Object.entries(when as Dict);
  if (entries.length !== 1) throw new Unmappable(`when: ${pyRepr(pySorted(Object.keys(when as Dict)))} — only one interaction per scenario is supported`);
  const [kind, value] = entries[0] as [string, unknown];

  if (kind === 'click') return [`try host.activate(${swiftPartArgs(c, value as string)})`];
  if (kind === 'key') return [`try host.send(key: ${swiftString(value)})`];
  if (kind === 'type') throw new Unmappable('when.type: text entry needs a UI test on a simulator, not a hosted view');
  if (kind === 'focus' || kind === 'blur') {
    throw new Unmappable(`when.${kind}: SwiftUI focus cannot be moved from a hosted view; the iPad keyboard gate drives it`);
  }
  if (kind === 'set') throw new Unmappable('when.set: a hosted view is built once from literal props; a controlled change needs a Binding the test owns');
  if (kind === 'hover') throw new Unmappable('when.hover: a hosted view has no pointer to hover with');
  throw new Unmappable(`when.${kind}: no test-code mapping for this interaction`);
}

/** Every assertion ends with the tree, because "no element with that identifier" is the failure a person
 *  reading the gate report has to diagnose, and the tree is what tells them which part is missing. */
function swiftExpect(condition: string): string {
  return `#expect(${condition}, "\\(host.dump())")`;
}

/** A `then.event.with` value as the string `DSValue` records it as. Swift writes `true`, not Python's
 *  `True`, and the comparison is numeric when both sides parse as numbers. */
export function swiftExpected(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string' || typeof value === 'number') return pyStr(value);
  throw new Unmappable(`then.event.with: no Swift comparison for ${pyRepr(value)}`);
}

export function swiftThenItemLines(c: Dict, item: Dict, given: Dict): string[] {
  if (has(item, 'event')) {
    const name = item.event as string;
    const ev = pyGet(eventsOf(c), name, null) as Dict | null;
    if (!truthy(ev) || !truthy(pyGet((ev as Dict).platforms as Dict, 'swiftui', null))) {
      throw new Unmappable(`then.event '${name}': the doc names no swiftui closure for it`);
    }
    const log = `"\\(events.describe(${swiftString(name)}))"`;
    if (pyGet(item, 'fired', null) === false) return [`#expect(events.count(${swiftString(name)}) == 0, ${log})`];
    if (has(item, 'with')) {
      const value = item.with as unknown;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        const fields = Object.entries(value as Dict).map(([k, v]) => `${swiftString(k)}: ${swiftString(swiftExpected(v))}`);
        return [`#expect(events.fired(${swiftString(name)}, with: [${fields.join(', ')}]), ${log})`];
      }
      return [`#expect(events.fired(${swiftString(name)}, with: ${swiftString(swiftExpected(value))}), ${log})`];
    }
    return [`#expect(events.fired(${swiftString(name)}), ${log})`];
  }

  if (has(item, 'state')) {
    const state = item.state as string;
    const isValue = item.is as unknown;
    const node = `try host.require(${swiftPartArgs(c, primaryPart(c))})`;
    if (state === 'expanded' || state === 'open') {
      if (typeof isValue !== 'boolean') throw new Unmappable(`then.state ${state}: '${pyStr(isValue)}' is not the expanded/collapsed the conventions name`);
      return [swiftExpect(`${node}.value == ${swiftString(isValue ? 'expanded' : 'collapsed')}`)];
    }
    if (state === 'selected') {
      if (typeof isValue !== 'boolean') throw new Unmappable("then.state selected: only true/false maps to the .isSelected trait");
      return [swiftExpect(`${node}.traits.contains(.selected) == ${isValue ? 'true' : 'false'}`)];
    }
    if (state === 'disabled') {
      if (typeof isValue !== 'boolean') throw new Unmappable('then.state disabled: only true/false maps to the accessibility tree');
      return [swiftExpect(`${node}.isEnabled == ${isValue ? 'false' : 'true'}`)];
    }
    throw new Unmappable(`then.state ${state}: prompts/conventions/swiftui.md names no accessibility spelling for it`);
  }

  if (has(item, 'focusable') || has(item, 'focused')) {
    throw new Unmappable('then.focus: a hosted view cannot move or observe SwiftUI focus; the iPad keyboard gate checks it');
  }

  if (has(item, 'text') || has(item, 'copy')) {
    let template: string;
    if (has(item, 'text')) {
      template = item.text as string;
    } else {
      const copy = (truthy(c.copy) ? c.copy : {}) as Dict;
      const found = pyGet(copy, item.copy as string, null) as Parameters<typeof copyText>[0] | null;
      if (found === null || found === undefined) throw new Unmappable(`then.copy: unknown copy key '${item.copy as string}'`);
      template = copyText(found);
    }
    const expected = pyStrip(template);
    if (expected.includes('{label}')) {
      const label = swiftNameValue(c, given);
      if (label === null) throw new Unmappable('then.text: the copy names {label} and this scenario sets no literal one');
      return [swiftExpect(`host.containsText(${swiftString(expected.replaceAll('{label}', label))})`)];
    }
    return [swiftExpect(`host.containsText(${swiftString(expected)})`)];
  }

  if (has(item, 'role')) {
    const role = item.role as string;
    const trait = pyGet(SWIFT_ROLE_TRAIT, role, null) as string | null;
    if (!truthy(trait)) throw new Unmappable(`then.role '${role}': SwiftUI's accessibility tree carries no trait for it; the gallery audit checks the role`);
    return [swiftExpect(`host.containsTrait(.${trait as string})`)];
  }

  if (has(item, 'name')) {
    const expected = typeof item.name === 'string' ? item.name : swiftNameValue(c, given);
    const node = `try host.require(${swiftString(c.name as string)})`;
    if (expected === null) return [swiftExpect(`${node}.label.isEmpty == false`)];
    return [swiftExpect(`${node}.label == ${swiftString(expected)}`)];
  }

  if (has(item, 'renders')) {
    const exists = `host.exists(${swiftString(c.name as string)})`;
    return [swiftExpect(item.renders === false ? `${exists} == false` : exists)];
  }
  if (has(item, 'attribute')) throw new Unmappable('then.attribute: an accessibility tree has no attributes; assert the label, value or trait instead');
  throw new Unmappable(`then: unrecognized assertion keys ${pyRepr(pySorted(Object.keys(item)))}`);
}

/** A Swift string literal's contents, for a `.disabled` comment. */
function swiftReason(reason: string): string {
  return swiftString(reason);
}

export function swiftScenarioBlock(c: Dict, sc: Dict, used: Set<string>): string {
  const name = sc.name as string;
  const fn = swiftFunctionName(name, used);
  const given = effectiveGiven(c, sc);
  let when: string[] = [];
  let then: string[] = [];
  let args: string[] = [];
  try {
    const role = resolveRole(c, given);
    if (role !== null && HOVER_ROLES.has(role) && needsSurface(sc)) {
      throw new Unmappable(`role '${role}' needs its trigger hovered or focused; covered by the Keyboard story`);
    }
    args = swiftInitArgs(c, given);
    when = swiftWhenLines(c, sc);
    for (const item of sc.then as Dict[]) then = then.concat(swiftThenItemLines(c, item, given));
  } catch (e) {
    if (!(e instanceof Unmappable)) throw e;
    return [
      `    @Test(${swiftString(name)}, .disabled(${swiftReason(pyStr(e.reason))}))`,
      `    func ${fn}() throws {}`,
    ].join('\n');
  }

  const body: string[] = [`    @Test(${swiftString(name)})`, `    func ${fn}() throws {`];
  const hasEvents = args.some((arg) => arg.includes('events.spy('));
  if (hasEvents) body.push('        let events = DSEventLog()');
  body.push('        let host = DSHost {');
  if (args.length) {
    body.push(`            DesignSchema.${c.name as string}(`);
    args.forEach((arg, i) => body.push(`                ${arg}${i < args.length - 1 ? ',' : ''}`));
    body.push('            )');
  } else {
    body.push(`            DesignSchema.${c.name as string}()`);
  }
  body.push('        }');
  for (const line of when) body.push(`        ${line}`);
  for (const line of then) body.push(`        ${line}`);
  // An event-only scenario never names the host; Swift would warn that the binding is unused, and a warning
  // in the log is a diagnostic line in the gate report.
  if (![...when, ...then].some((line) => line.includes('host'))) body.push('        _ = host');
  body.push('    }');
  return body.join('\n');
}

export function swiftFile(c: Dict, scenarios: Dict[]): string {
  const name = c.name as string;
  const lines: string[] = [
    `//  ${name}BehaviorTests.swift`,
    '//',
    `//  Generated by tools/behavior_tests.ts from the \`behavior\` block of the ${name} doc. Do not edit —`,
    '//  the next run of the behavior gate overwrites it, and `node tools/behavior_tests.ts --check` fails',
    '//  when what is here is not what the docs say.',
    '//',
    '//  Each case renders the component with the scenario\'s `given` props in a `DSHost`',
    '//  (Sources/DesignSchema/Support/Testing.swift), performs its `when` through the accessibility',
    '//  identifiers the conventions require, and asserts its `then` against the accessibility tree. A',
    '//  scenario with no mapping on this platform is `.disabled` with the reason, so the gate report shows',
    '//  the gap rather than a false pass.',
    '',
    'import SwiftUI',
    'import Testing',
    '@testable import DesignSchema',
    '',
    '@MainActor',
    `@Suite(${swiftString(`${name} behavior`)})`,
    `struct ${name}BehaviorTests {`,
  ];
  const used = new Set<string>();
  scenarios.forEach((sc, i) => {
    if (i > 0) lines.push('');
    lines.push(swiftScenarioBlock(c, sc, used));
  });
  lines.push('}');
  return lines.join('\n') + '\n';
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

const FILE_BUILDERS: Record<string, (c: Dict, scenarios: Dict[]) => string> = { web: webFile, lit: litFile, rn: rnFile, swiftui: swiftFile };

const TEST_LINE = /^\s*test\('/u;
const SKIP_LINE = /^\s*test\.skip\('/u;
const SWIFT_TEST_LINE = /^\s*@Test\(/u;
/** The name the Swift cases are written under; also what `--check` compares and what it prunes. */
export const SWIFT_FILE = /^.*BehaviorTests\.swift$/su;

function isSwiftUI(platform: string): boolean {
  return platform === 'swiftui';
}

/** `<name>.<platform>.test.<ext>` for the three JS platforms, `<Name>BehaviorTests.swift` for Swift. */
export function outFile(name: string, platform: string): string {
  return isSwiftUI(platform)
    ? join(swiftOutDir(), `${name}BehaviorTests.swift`)
    : join(paths.OUT, `${name}.${platform}.test.${SOURCE_EXT[platform] as string}`);
}

export function main(argv: readonly string[] = process.argv.slice(2)): number {
  const check = argv.includes('--check');
  const entries = readComponents(join(paths.GENERATED, 'components.json'));
  if (!check) {
    freshOutDir(paths.OUT, (n) => /^.*\.test\..*$/s.test(n));
    freshOutDir(swiftOutDir(), (n) => SWIFT_FILE.test(n));
  }
  let nFiles = 0;
  let nTests = 0;
  let nSkips = 0;
  let nMissing = 0;
  const swift = new Map<string, string>(); // what --check compares against the working tree
  for (const entry of entries) {
    const c = entry.component as Dict;
    const derived = (truthy(pyGet(entry, 'behaviorDerived', null)) ? entry.behaviorDerived : []) as Dict[];
    if (!truthy(pyGet(c, 'behavior', null)) && !derived.length) continue;
    for (const platform of PLATFORMS) {
      if (!has(c.platforms as Dict, platform) || !truthy(pyGet(c.platforms[platform] as Dict, 'supported', true))) continue;
      if (!existsSync(sourceFile(paths.ROOT, c.name as string, platform))) {
        nMissing += 1; // not generated yet: no test file, so the package suite stays green
        continue;
      }
      const scenarios = behaviorFor(c, derived, platform);
      if (!scenarios.length) continue;
      const content = (FILE_BUILDERS[platform] as (c: Dict, s: Dict[]) => string)(c, scenarios);
      const file = outFile(c.name as string, platform);
      if (isSwiftUI(platform)) swift.set(file, content);
      else if (check) continue; // the JS platforms' output is gitignored — there is nothing to be stale
      if (!check) writeText(file, content);
      nFiles += 1;
      for (const line of pySplitlines(content)) {
        if (isSwiftUI(platform)) {
          if (SWIFT_TEST_LINE.test(line)) {
            if (line.includes('.disabled(')) nSkips += 1;
            else nTests += 1;
          }
        } else if (TEST_LINE.test(line)) nTests += 1;
        else if (SKIP_LINE.test(line)) nSkips += 1;
      }
    }
  }
  if (check) return checkSwift(swift);
  const out = relative(paths.ROOT, paths.OUT);
  process.stdout.write(`✔ behavior gate: ${nFiles} file(s), ${nTests} test(s), ${nSkips} skip(s), ${nMissing} target(s) not generated yet → ${out}/\n`);
  return 0;
}

/**
 * The Swift cases are the one output of this script that is committed — the macOS runner cannot derive
 * them (.github/workflows/swiftui-gates.yml never runs `pnpm install`) — so CI has to say when the docs
 * have moved on and the checked-in file has not.
 */
export function checkSwift(expected: Map<string, string>): number {
  const dir = swiftOutDir();
  const stale: string[] = [];
  for (const [file, content] of expected) {
    if (!existsSync(file)) stale.push(`missing: ${relative(paths.ROOT, file)}`);
    else if (readText(file) !== content) stale.push(`out of date: ${relative(paths.ROOT, file)}`);
  }
  if (existsSync(dir)) {
    for (const name of pySorted(readdirSync(dir))) {
      if (SWIFT_FILE.test(name) && !expected.has(join(dir, name))) stale.push(`no longer derived: ${relative(paths.ROOT, join(dir, name))}`);
    }
  }
  if (stale.length) {
    for (const line of stale) process.stderr.write(`✖ behavior gate (swiftui): ${line}\n`);
    process.stderr.write('  run `node tools/behavior_tests.ts` and commit the result\n');
    return 1;
  }
  process.stdout.write(`✔ behavior gate (swiftui): ${expected.size} committed file(s) are current\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
