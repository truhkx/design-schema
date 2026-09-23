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
import { controlledPairs, copyText, NON_QUERYABLE_ROLES, normalizeKey, resolveRole, roleIn, WIDGET_ROLES } from '../schema/component.ts';
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
export const FOCUS_INTO_HELPER = `const FOCUSABLE = 'input, button, select, textarea, a[href], [tabindex]';
/** Focus the element a key press lands on. \`when.key\` is pressed on the primary part, but a composite that
 *  manages a roving tabindex (a tablist, a radiogroup, a toolbar) is not focusable itself: .focus() on it is a
 *  no-op and the key would go to document.body instead of the component. Focus what it delegates to — the
 *  element carrying tabindex="0", else the first focusable descendant. An already-focusable part focuses itself. */
function focusInto(el: Element | null): void {
  if (el === null) return;
  const target = el.matches(FOCUSABLE) ? el : (el.querySelector('[tabindex="0"]') ?? el.querySelector(FOCUSABLE) ?? el);
  (target as HTMLElement).focus();
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
/** The Lit probes' view of what a host renders, walked the way keyboard_tests.ts's HELPERS walk focusables: the
 *  flat tree — a shadow host's shadow root instead of its light children, and a <slot>'s assigned nodes (or its
 *  fallback) in its place. That reaches slotted text and the shadow text of a composed ds-* child (ds-button
 *  renders its `label` property in its own shadow root), neither of which `shadowRoot.textContent` contains. */
export const FLAT_TEXT_HELPER = `function flatText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node as Text).data;
  if (node instanceof HTMLStyleElement || node instanceof HTMLScriptElement) return '';
  if (node instanceof HTMLSlotElement) return node.assignedNodes({ flatten: true }).map(flatText).join('');
  const scope: Node = (node as HTMLElement).shadowRoot ?? node;
  return Array.from(scope.childNodes).map(flatText).join('');
}
`;
/** The accessible name a Lit host carries itself — prompts/conventions/lit.md puts `aria-label` and
 *  `aria-labelledby` on the host as plain attributes — or null when it carries none, so the probe falls back
 *  to the element the part locator finds. `aria-labelledby` ids resolve in the host's own root node. */
export const HOST_NAME_HELPER = `function hostName(el: Element): string | null {
  const label = el.getAttribute('aria-label')?.trim();
  if (label) return label;
  const ids = el.getAttribute('aria-labelledby')?.trim();
  if (!ids) return null;
  const scope = el.getRootNode() as Document | ShadowRoot;
  const named = ids.split(/\\s+/).map((id) => scope.getElementById(id)).filter((n): n is HTMLElement => n !== null);
  const text = named.map((n) => flatText(n).replace(/\\s+/g, ' ').trim()).join(' ').trim();
  return text || null;
}
`;
/** The widget roles a click activates directly. `gridcell` is the exception: a cell's control is what it holds (the
 *  APG grid puts the Checkbox or Button inside the cell), and a cell holding none is still the part it falls back to. */
export const ACTIVATABLE_ROLES: string[] = WIDGET_ROLES.filter((r) => r !== 'gridcell');
/** What a person can activate: a native control, or an element carrying one of those widget roles. */
export const INTERACTIVE_SELECTOR = ['button', 'a[href]', 'input:not([type="hidden"])', 'select', 'textarea', ...ACTIVATABLE_ROLES.map((r) => `[role="${r}"]`)].join(', ');
/** Roles that make an element a thing clicked as a whole rather than a wrapper: a window (dialog, alertdialog) or a
 *  composite widget (radiogroup, tablist, listbox…). A live region (Feed's `status` around its show-new Button) or a
 *  landmark still wraps the control it holds. */
export const CONTAINER_ROLES = ['dialog', 'alertdialog', 'combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'];
export const OWN_ROLE_SELECTOR = ['dialog', ...CONTAINER_ROLES.map((r) => `[role="${r}"]`)].join(', ');
/** A part is often a wrapper — a `closeButton` span around a composed Button, a row cell around a Checkbox — and a
 *  click on the wrapper never reaches the control. `activatable` is the part when it is interactive itself, else
 *  its first interactive descendant, else the part. It never descends from the component's root (a part locator
 *  falls back to the root when the part is not rendered, and the root's first control is not the part), nor from
 *  a window or composite (CONTAINER_ROLES: AlertDialog's primary part is located by role, so a click on its scrim
 *  is a click on the alertdialog — not on the Cancel button inside it). A focused part is the part or that control: a
 *  focusable surface (tabindex="-1") is not interactive, but focus landing on it is still focus on the part. */
export const WEB_ACTIVATABLE_HELPER = `const INTERACTIVE = ${js(INTERACTIVE_SELECTOR)};
const OWN_ROLE = ${js(OWN_ROLE_SELECTOR)};
function activatable(el: Element | null, root: Element | null): HTMLElement {
  if (el === null || el === root || el.matches(INTERACTIVE) || el.matches(OWN_ROLE)) return el as HTMLElement;
  return (el.querySelector(INTERACTIVE) ?? el) as HTMLElement;
}
function focusedPart(el: Element | null, root: Element | null): Element | null {
  return el === null || document.activeElement === el ? el : activatable(el, root);
}
`;
/** Lit's `activatable` walks the flat tree, like FLAT_TEXT_HELPER: a composed ds-button's own shadow root and a
 *  <slot>'s assigned nodes are where the control is. `isDisabled` is Playwright's "not enabled" — a disabled native
 *  control, or aria-disabled on it or any ancestor across shadow hosts — so a control disabled by state (Carousel's
 *  previous button on the first slide, NumberInput's decrement at the minimum) is clicked with force instead of
 *  timing out on actionability. `clickOptions` also aims the click at a point where the element is on top: a
 *  scrim's centre is under the panel it dims, so Playwright would wait on "intercepts pointer events" forever;
 *  a corner or edge of the scrim is where a person taps it. The probe waits for running animations first (a
 *  SidePanel's scrim centre is exposed until its surface finishes sliding over it), then polls, two seconds in
 *  all; nowhere exposed by then (a panel still sliding in) leaves Playwright's own wait for a stable, visible
 *  target in charge. A plain area (a scrim — no control to activate) is clicked at the probed point with force, so
 *  the pointer lands where the probe saw the area on top instead of Playwright re-checking a layout still settling;
 *  a control keeps Playwright's checks. `located` is a locator that can only mean `el`: vitest turns an Element into one
 *  with Playwright's selector generator, which inside shadow roots can name another element (DatePicker's button
 *  as `getByLabel('Choose date')`, which its closed dialog shares; SidePanel's scrim as `locator('div').first()`).
 *  A test id stamped on the element cannot. `pointerAt` aims the pointer at the control's host in the part's own
 *  tree (the composed ds-button, not the <button> in its shadow root; a host with no box of its own, like Table's
 *  select-all ds-checkbox, is not visible to Playwright, so the pointer stays on the control) — hit testing carries a real click from the
 *  host to the control, while Playwright's hit-target check can report the host as intercepting its own shadow
 *  content — and forces when the control itself is disabled. */
export const LIT_ACTIVATABLE_HELPER = `const INTERACTIVE = ${js(INTERACTIVE_SELECTOR)};
const OWN_ROLE = ${js(OWN_ROLE_SELECTOR)};
function flatChildren(node: Node): Node[] {
  if (node instanceof HTMLSlotElement) return node.assignedNodes({ flatten: true });
  return Array.from(((node as HTMLElement).shadowRoot ?? node).childNodes);
}
function firstInteractive(node: Node): Element | null {
  for (const child of flatChildren(node)) {
    if (!(child instanceof Element)) continue;
    if (child.matches(INTERACTIVE)) return child;
    const found = firstInteractive(child);
    if (found) return found;
  }
  return null;
}
function activatable(el: Element | null, root: Element | null): HTMLElement {
  if (el === null || el === root || el.matches(INTERACTIVE) || el.matches(OWN_ROLE)) return el as HTMLElement;
  return (firstInteractive(el) ?? el) as HTMLElement;
}
function focusedPart(el: Element | null, root: Element | null): Element | null {
  return el === null || activeChain().includes(el) ? el : activatable(el, root);
}
function isDisabled(el: Element | null): boolean {
  if (el?.matches(':disabled')) return true;
  for (let n: Element | null = el; n; n = n.parentElement ?? ((n.getRootNode() as ShadowRoot).host ?? null)) {
    if (n.getAttribute('aria-disabled') === 'true') return true;
  }
  return false;
}
function hits(el: Element, x: number, y: number): boolean {
  let n: Element | null = document.elementFromPoint(x, y);
  for (let inner = n?.shadowRoot?.elementFromPoint(x, y) ?? null; n && inner && inner !== n; inner = n.shadowRoot?.elementFromPoint(x, y) ?? null) n = inner;
  for (let m: Element | null = n; m; m = m.parentElement ?? ((m.getRootNode() as ShadowRoot).host ?? null)) if (m === el) return true;
  return false;
}
const PROBES = [[0.5, 0.5], [0.02, 0.02], [0.98, 0.02], [0.02, 0.98], [0.98, 0.98], [0.5, 0.02], [0.5, 0.98], [0.02, 0.5], [0.98, 0.5]];
type ClickOptions = { force?: boolean; position?: { x: number; y: number } };
async function clickOptions(el: Element | null, area: boolean): Promise<ClickOptions> {
  if (el === null) return {};
  const frame = (): Promise<number> => new Promise((f) => requestAnimationFrame(f));
  const deadline = performance.now() + 2000;
  while (performance.now() < deadline && document.getAnimations().some((a) => a.playState === 'running')) await frame();
  do {
    const r = el.getBoundingClientRect();
    // An area's centre is what an overlay's surface covers; its edges are where a person taps it.
    for (const [fx, fy] of area ? [...PROBES.slice(1), PROBES[0]!] : PROBES) {
      const x = r.left + r.width * fx!;
      const y = r.top + r.height * fy!;
      if (!hits(el, x, y)) continue;
      if (area) return { position: { x: x - r.left, y: y - r.top }, force: true };
      return fx === 0.5 && fy === 0.5 ? {} : { position: { x: x - r.left, y: y - r.top } };
    }
    await frame();
  } while (performance.now() < deadline);
  return {};
}
let stamped = 0;
function located(el: Element | null): Locator {
  if (el === null) return el as unknown as Locator;
  const id = \`ds-behavior-\${++stamped}\`;
  el.setAttribute('data-testid', id);
  return page.getByTestId(id);
}
async function pointerAt(control: Element | null, part: Element | null): Promise<[Locator, ClickOptions]> {
  let el = control;
  while (el && part && el.getRootNode() !== part.getRootNode() && el.getRootNode() instanceof ShadowRoot) {
    const host = (el.getRootNode() as ShadowRoot).host;
    const box = host.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) break; // display: contents or an empty inline box — Playwright's "not visible"
    el = host;
  }
  if (isDisabled(control)) return [located(el), { force: true }];
  return [located(el), await clickOptions(el, control !== null && !control.matches(INTERACTIVE))];
}
`;
/** React Native's press bubbles up and never down, so a wrapper View's testID node never reaches its Pressable.
 *  Press the node itself when it is a control, else the first node under it that is (never under the root or a
 *  window/composite node, as on web): a widget role (the ARIA names plus React Native's own) or an onPress. A composite match (the Pressable) is pressed through its host
 *  view, so Testing Library still sees the host's disabled state. Decorative roles (image, text) are not controls. */
export const RN_ACTIVATABLE_HELPER = `type TestNode = ReturnType<typeof screen.getByTestId>;
const CONTROL_ROLES = new Set(${js([...ACTIVATABLE_ROLES, 'adjustable', 'imagebutton', 'togglebutton'])});
function isControl(n: TestNode): boolean {
  return CONTROL_ROLES.has(n.props.role ?? n.props.accessibilityRole) || typeof n.props.onPress === 'function';
}
const CONTAINER_ROLES = new Set(${js(CONTAINER_ROLES)});
function hasOwnRole(n: TestNode): boolean {
  return CONTAINER_ROLES.has(n.props.role ?? n.props.accessibilityRole);
}
function activatable(node: TestNode, root: TestNode): TestNode {
  const hit = isControl(node) ? node : node === root || hasOwnRole(node) ? undefined : node.findAll(isControl)[0];
  if (hit === undefined) return node;
  return typeof hit.type === 'string' ? hit : (hit.findAll((n: TestNode) => typeof n.type === 'string')[0] ?? hit);
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

/** The component's root as the generated test holds it: what `activatable` never descends from. */
function rootExpr(platform: string): string {
  return platform === 'lit' ? 's.el' : 's.root()';
}

/** The control `part` stands for (see WEB_ACTIVATABLE_HELPER), as the generated test finds it. */
export function activatableExpr(c: Dict, part: string, platform: string): string {
  return `activatable(${partLocator(c, part, platform)}, ${rootExpr(platform)})`;
}

/** The role a test can find the component by on `platform`: its resolved role, or null when that is unresolved (a
 *  `roleFrom` prop with no default) or one of NON_QUERYABLE_ROLES. */
export function concreteRole(c: Dict, platform?: string): string | null {
  const role = resolveRole(c, undefined, platform);
  return role === null || roleIn(NON_QUERYABLE_ROLES, role) ? null : role;
}

/** The component's root: the `data-ds` hook first (piercing shadow roots on Lit), the rendered tree otherwise. */
export function rootLocatorBody(c: Dict, platform: string): string {
  const name = c.name as string;
  const role = concreteRole(c, platform);
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
  const role = concreteRole(c, platform);
  const isPrimary = anatomy.length > 0 && part === anatomy[0];
  const prop = pyGet(props, part, undefined) as Dict | undefined;
  const isTextProp = prop !== undefined && prop !== null && scalarType(prop) === 'string';

  if (platform === 'web') {
    if (isPrimary) return role ? `(screen.queryByRole('${role}') ?? s.root()) as HTMLElement` : 's.root()';
    if (isTextProp) return `screen.getByText(props.${part})`;
    // Searched from `document`, not the render container: every modal overlay portals its surface into
    // document.body, so a container-scoped lookup misses the part and silently falls back to the root —
    // which makes a click on the close button read as a scrim click. `screen` queries document too.
    return `(document.querySelector('[data-part="${part}"]') ?? s.root())`;
  }
  if (platform === 'rn') {
    if (isPrimary) return role ? `screen.queryByRole('${role}') ?? s.root()` : 's.root()';
    if (isTextProp) return `screen.getByText(props.${part})`;
    return `screen.queryByTestId('${c.name as string}.${part}') ?? s.root()`;
  }
  if (platform === 'lit') {
    // The host first: prompts/conventions/lit.md puts role and naming attributes on it, and a host that
    // is the part says so with `part` / `data-part` (Carousel's region). Only then its shadow tree.
    const onHost = (selector: string): string => `(el.matches('${selector}') ? el : null)`;
    const byPart = `${onHost(`[part~="${part}"], [data-part="${part}"]`)} ?? deep(root, '[part="${part}"]') ?? deep(root, '[data-part="${part}"]')`;
    if (isPrimary) {
      const byRole = role ? `${onHost(`[role="${role}"]`)} ?? deep(root, '[role="${role}"]') ?? ` : '';
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

/** `given` keys that switch the whole component off for a pointer (Button's `loading` is aria-disabled). */
const DISABLING_PROPS = ['disabled', 'loading'];

/** A list prop whose entries can each be disabled — `items`, `options`, `tabs` shaped `{ …; disabled?: boolean }`. */
function hasDisableableEntries(c: Dict): boolean {
  const props = (truthy(c.props) ? c.props : {}) as Dict;
  return Object.values(props).some((p) => (p as Dict).type === 'array' && /\bdisabled\??\s*:/u.test(pyStr(pyGet(p as Dict, 'shape', ''))));
}

/** Whether a click on `part` could land on a disabled target: the scenario's `given` disables the component, or
 *  gives a list with a `disabled: true` entry, or `part` is an item part — any part but the primary one of a
 *  component whose list entries can be disabled, since the entry the part locator finds may be one of those. */
export function mayBeDisabled(c: Dict, sc: Dict, part: string): boolean {
  const given = (truthy(pyGet(sc, 'given', null)) ? sc.given : {}) as Dict;
  if (DISABLING_PROPS.some((k) => truthy(pyGet(given, k, null)))) return true;
  const isDisabledEntry = (v: unknown): boolean => v !== null && typeof v === 'object' && (v as Dict).disabled === true;
  if (Object.values(given).some((v) => Array.isArray(v) && v.some(isDisabledEntry))) return true;
  const anatomy = (truthy(c.anatomy) ? c.anatomy : []) as string[];
  return part !== anatomy[0] && hasDisableableEntries(c);
}

export function whenLines(c: Dict, sc: Dict, platform: string): string[] {
  const when = (pyGet(sc, 'when', null) ?? null) as Dict | null;
  if (!truthy(when)) return [];
  const entries = Object.entries(when as Dict);
  if (entries.length !== 1) throw new Unmappable(`when: ${pyRepr(pySorted(Object.keys(when as Dict)))} — only one interaction per scenario is supported`);
  const [kind, value] = entries[0] as [string, unknown];

  if (kind === 'click') {
    const target = activatableExpr(c, value as string, platform);
    // Neither Playwright nor user-event will click a control that looks disabled; a person can, and the doc says
    // what happens. Forcing an enabled target changes nothing, so any chance of a disabled one forces.
    const force = mayBeDisabled(c, sc, value as string);
    if (platform === 'web') return [force ? `await userEvent.setup({ pointerEventsCheck: 0 }).click(${target});` : `await s.user.click(${target});`];
    if (platform === 'rn') return [`fireEvent.press(${target});`];
    if (platform === 'lit') {
      // What the scenario cannot say — a control disabled by state — is checked when the click happens.
      if (force) return [`await userEvent.click(located(${target}), { force: true });`];
      const part = partLocator(c, value as string, platform);
      return [`await userEvent.click(...(await pointerAt(activatable(${part}, s.el), ${part})));`];
    }
  }

  if (kind === 'key') {
    const control = partLocator(c, primaryPart(c), platform);
    if (platform === 'web') return [`act(() => focusInto(${control}));`, `await s.user.keyboard('${keyStroke(value as string, platform)}');`];
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

/** Web and rn handlers take the declared payload fields as positional arguments, exactly those and in order.
 *  An object `with` on a payload of two or more fields is keyed by field name; anything else is one argument. */
function positionalEventLines(mock: string, payload: Dict[] | undefined, value: unknown): string[] {
  if (payload === undefined || payload.length < 2 || value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [`expect(${mock}).toHaveBeenCalledWith(${js(value)});`];
  }
  const w = value as Dict;
  const fields = payload.map((f) => f.name as string);
  if (fields.every((f) => has(w, f))) return [`expect(${mock}).toHaveBeenCalledWith(${fields.map((f) => js(w[f])).join(', ')});`];
  // A `with` naming only some fields: pin the arity, then each named position.
  return [
    `expect(${mock}).toHaveBeenCalledTimes(1);`,
    `expect(${mock}.mock.calls[0]).toHaveLength(${fields.length});`,
    ...fields.flatMap((f, i) => (has(w, f) ? [`expect(${mock}.mock.calls[0]?.[${i}]).toEqual(${js(w[f])});`] : [])),
  ];
}

export function thenEventLines(c: Dict, item: Dict, platform: string): string[] {
  const name = item.event as string;
  const mock = `s.events.${name}`;
  if (pyGet(item, 'fired', null) === false) return [`expect(${mock}).not.toHaveBeenCalled();`];
  if (has(item, 'with')) {
    const value = item.with as unknown;
    const payload = (c.events as Dict | undefined)?.[name]?.payload as Dict[] | undefined;
    if (platform === 'web' || platform === 'rn') return positionalEventLines(mock, payload, value);
    if (platform === 'lit') {
      // A declared one-field payload names the detail key a scalar `with` is.
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
    return [`expect(document.activeElement).toBe(focusedPart(${partLocator(c, target, platform)}, ${rootExpr(platform)}));`];
  }
  if (platform === 'lit') {
    // Focus inside nested shadow roots (a composed ds-button inside a dialog) shows up as a chain of hosts;
    // the part is focused when it, or the control it wraps, is in that chain.
    if (target === 'none') return ['expect(activeChain()).not.toContain(s.el);'];
    return [`expect(activeChain()).toContain(focusedPart(${partLocator(c, target, platform)}, ${rootExpr(platform)}));`];
  }
  throw new Unmappable(`then.focused: no mapping for ${platform}`);
}

export function thenTextLines(_c: Dict, text: string, platform: string): string[] {
  const rx = regexExpr(text);
  if (platform === 'web') return [`expect(screen.getByText(${rx})).toBeInTheDocument();`];
  if (platform === 'rn') return [`expect(screen.getByText(${rx})).toBeOnTheScreen();`];
  // The host's flat tree: its shadow text, the content slotted into it, and composed ds-* children's own shadow text.
  if (platform === 'lit') return [`expect(flatText(s.el)).toMatch(${rx});`];
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
  if (platform === 'lit') {
    // The host itself (where prompts/conventions/lit.md puts the role), else its shadow tree, else its light DOM
    // children — slotted content, such as Tooltip's role="tooltip" bubble.
    const sel = `'[role="${role}"]'`;
    return [`expect(s.el.matches(${sel}) || deep(s.root, ${sel}) !== null || deep(s.el, ${sel}) !== null).toBe(true);`];
  }
  throw new Unmappable(`then.role: no mapping for ${platform}`);
}

/** `name: true` asserts the name the naming prop gives (or any non-empty one); `name: '<text>'` that exact name. */
export function thenNameLines(c: Dict, platform: string, name: true | string = true): string[] {
  const role = concreteRole(c, platform);
  if (role === null) {
    const shown = c.a11y.roleFrom !== undefined ? `from prop '${c.a11y.roleFrom as string}'` : `'${resolveRole(c, undefined, platform) as string}'`;
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
    // The host's own aria-label / aria-labelledby first; only a host that names nothing defers to the part.
    const target = partLocator(c, primaryPart(c), platform);
    // hostName() is null or non-empty, so with no expected name a named host has already passed.
    if (!expected) return [`if (hostName(s.el) === null) expect(${target}).toHaveAccessibleName();`];
    return [`if (hostName(s.el) !== null) expect(hostName(s.el)).toBe(${expected});`, `else expect(${target}).toHaveAccessibleName(${expected});`];
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
    const role = resolveRole(c, effectiveGiven(c, sc), platform);
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
    const role = resolveRole(c, given, 'swiftui');
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

/** A `then.name` needs Lit's `hostName`, and it or a text/copy assertion needs `flatText`. */
function needsHostNameHelper(scenarios: Dict[]): boolean {
  return scenarios.some((sc) => (sc.then as Dict[]).some((item) => has(item, 'name')));
}

/** A click, or a focused part, needs `activatable` (and `focusedPart`). */
function needsActivatableHelper(scenarios: Dict[]): boolean {
  return scenarios.some((sc) => has((truthy(pyGet(sc, 'when', null)) ? sc.when : {}) as Dict, 'click')
    || (sc.then as Dict[]).some((item) => has(item, 'focused') && !['moved', 'unchanged', 'none'].includes(item.focused as string)));
}

/** A key press needs `focusInto`, which is emitted only where it is used. */
function needsFocusHelper(scenarios: Dict[]): boolean {
  return scenarios.some((sc) => has((truthy(pyGet(sc, 'when', null)) ? sc.when : {}) as Dict, 'key'));
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
  if (needsFocusHelper(scenarios)) lines.push(FOCUS_INTO_HELPER);
  if (needsActivatableHelper(scenarios)) lines.push(WEB_ACTIVATABLE_HELPER);
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
  if (needsActivatableHelper(scenarios)) lines.push(RN_ACTIVATABLE_HELPER);
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
    // `located` (LIT_ACTIVATABLE_HELPER) builds its locators from `page`.
    needsActivatableHelper(scenarios) ? "import { page, userEvent } from 'vitest/browser';\nimport type { Locator } from 'vitest/browser';" : "import { userEvent } from 'vitest/browser';",
    `import '${src}/${name}.js';`,
    `import meta from '${src}/${name}.stories.js';`,
    '',
  ];
  if (needsRegexHelper(scenarios)) lines.push(ESCAPE_REGEXP_HELPER);
  lines.push(DEEP_QUERY_HELPER);
  if (needsRegexHelper(scenarios) || needsHostNameHelper(scenarios)) lines.push(FLAT_TEXT_HELPER);
  if (needsHostNameHelper(scenarios)) lines.push(HOST_NAME_HELPER);
  lines.push(ACTIVE_CHAIN_HELPER);
  if (needsActivatableHelper(scenarios)) lines.push(LIT_ACTIVATABLE_HELPER);
  lines.push('async function setup(given: Record<string, unknown> = {}) {');
  lines.push(`  const el = document.createElement('${tag}');`);
  lines.push('  const props = { ...meta.args, ...given };');
  lines.push('  for (const [key, value] of Object.entries(props)) {');
  lines.push('    if (value === undefined) continue;');
  lines.push('    // `children` is slotted light-DOM content, and `Element.children` is getter-only:');
  lines.push('    // assigning it throws and takes the whole file down at setup. Slot a string into the');
  lines.push('    // default slot the way the stories do; a richer value cannot be expressed here.');
  lines.push('    if (key === \'children\') {');
  lines.push('      if (typeof value === \'string\') el.append(value);');
  lines.push('      continue;');
  lines.push('    }');
  lines.push('    (el as unknown as Record<string, unknown>)[key] = value;');
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
