/**
 * Component frontmatter schema (Zod) — the single source of truth.
 *
 * This is the machine-readable half of a component doc. It lives under the
 * `component:` key of the Markdown frontmatter so it never collides with
 * Starlight's own page fields (title, description, sidebar…).
 *
 * tools/parse.ts validates every doc against it, and `node tools/schema.ts` derives
 * ./component.schema.json from it with `z.toJSONSchema` (never edit the JSON by hand).
 * The `.meta({ id })` names become the JSON schema's `$defs` (./extension.schema.json
 * inlines the ones it reuses).
 *
 * Zod 4, imported from `zod` so Node can run the tools without a build step.
 */
import { z } from 'zod';

import { expand, pyRepr } from './lib.ts';
import { platformId } from './platforms.ts';

// The platform table lives in ./platforms.ts; these names stay importable from here.
export { PLATFORMS, platformId } from './platforms.ts';

/** Stamped by tools/parse.ts on items an extension doc contributed; never authored. */
const source = z.string().optional().describe('Set by the parser: the extension doc that added this item, e.g. extensions/Button.analytics.md. Never authored.');

/** A reference to a design token by path, e.g. `color.foreground.strong`.
 *  Braces interpolate a prop value: `space.{size}` → `space.md` when size=md. */
export const tokenRef = z
  .string()
  .regex(/^[a-z][a-z0-9]*(\.(\{[a-zA-Z]+\}|[a-zA-Z0-9-]+))+$/, 'Expected a dotted token path like color.foreground.strong')
  .meta({ id: 'tokenRef', description: 'Dotted token path, e.g. color.foreground.strong. Braces interpolate a prop value: space.{size}.' });

/** Prop types whose `default` is a literal of the same JavaScript type. */
const SCALAR_PROP_TYPES: readonly string[] = ['boolean', 'number', 'string'];

export const propDef = z
  .strictObject({
    type: z.enum(['string', 'number', 'boolean', 'enum', 'content', 'array', 'object', 'function', 'union']).describe("A value of more than one kind (a single id or an array of them) is 'union', with the kinds spelled out in shape."),
    description: z.string(),
    /** For array/object/function props: TypeScript-like shape of the value. Required for union props. */
    shape: z.string().optional().describe("For array/object/function/union props: the item or field shape in TypeScript-like notation, e.g. '{ value: string; label: string; description?: string; disabled?: boolean }[]' or 'string | string[]'. Required for union."),
    required: z.boolean().default(false),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    values: z.array(z.string()).optional(), // enum only
    a11y: z.string().optional(),            // why this prop matters for accessibility
    a11yRole: z.enum(['accessible-name', 'description', 'error']).optional().describe('What this prop contributes to the accessibility tree.'),
    platforms: z.array(platformId).optional(), // omit = all platforms
    source,
  })
  .refine((p) => p.type !== 'enum' || Array.isArray(p.values), { message: "an enum prop needs 'values'", path: ['values'] })
  .check((ctx) => {
    const p = ctx.value;
    const issue = (path: PropertyKey[], message: string): void => {
      ctx.issues.push({ code: 'custom', input: p, path, message });
    };
    if (p.type === 'union' && p.shape === undefined) issue(['shape'], "a union prop needs 'shape'");
    // A default is a literal the prop's own type allows: the scalar itself, one of an enum's values, and nothing
    // for the types a literal cannot spell (content, array, object, function, union).
    if (p.default === undefined) return;
    if (SCALAR_PROP_TYPES.includes(p.type)) {
      if (typeof p.default !== p.type) issue(['default'], `a ${p.type} prop's default must be a ${p.type}, got ${pyRepr(p.default)}`);
    } else if (p.type === 'enum') {
      if (Array.isArray(p.values) && !p.values.includes(p.default as string)) issue(['default'], `default ${pyRepr(p.default)} is not one of ${pyRepr(p.values)}`);
    } else {
      issue(['default'], `a ${p.type} prop takes no default`);
    }
  })
  .meta({ id: 'propDef' });

export const eventDef = z
  .strictObject({
    description: z.string(),
    /** True when the natural trigger is a touch gesture; requires `gesture-alternative` in a11y.requires. */
    gesture: z.boolean().default(false).describe('True when the natural trigger is a touch gesture (swipe, drag, long-press). Components declaring a gesture event must also list gesture-alternative in a11y.requires.'),
    /** Platform-neutral name → what it becomes on each platform. */
    platforms: z.partialRecord(platformId, z.string()),
    source,
  })
  .meta({ id: 'eventDef' });

/** Tokens that carry an accessibility guarantee wherever they are bound: the focus indicator and the target sizes.
 *  An entry ending in `.` is a prefix. */
export const LOCKED_TOKENS = ['color.border.focus', 'color.inverse.focus', 'border.width.focus', 'size.target.'] as const;

/** The name rule tokens replaced, kept so nothing it locked becomes overridable. An entry ending in `*` is a prefix. */
export const LOCKED_BINDING_NAMES = ['focusRing*', 'minTarget', 'dismissTarget'] as const;

const matches = (entry: string, value: string, wildcard: string): boolean =>
  entry.endsWith(wildcard) ? value.startsWith(entry.slice(0, -wildcard.length)) : value === entry;

/** `token` and, when it interpolates, every path it takes over the enum props (`expand`, as the contrast checker
 *  reads pairs). A slot that names no enum prop leaves only the literal; the parser reports that elsewhere. */
function tokenPaths(token: string, props: Record<string, unknown>): string[] {
  try {
    return [token, ...expand(token, props)];
  } catch {
    return [token];
  }
}

/** Which rule locks a binding, as text for an error message; null when none does. `contrastTokens` are the
 *  foreground and background tokens of the component's a11y.contrast pairs; `props` supplies the enum values
 *  `{slot}` interpolation expands over, on both the binding's token and the pair's. */
export function lockRule(bindingName: string, token: string, contrastTokens: Iterable<string>, props: Record<string, unknown> = {}): string | null {
  const paths = tokenPaths(token, props);
  const lockedToken = LOCKED_TOKENS.find((entry) => paths.some((p) => matches(entry, p, '.')));
  if (lockedToken !== undefined) return `LOCKED_TOKENS has '${lockedToken.endsWith('.') ? `${lockedToken}*` : lockedToken}'`;
  for (const pairToken of contrastTokens) {
    const pairPaths = tokenPaths(pairToken, props);
    if (paths.some((p) => pairPaths.includes(p))) return `a11y.contrast pairs '${pairToken}'`;
  }
  const lockedName = LOCKED_BINDING_NAMES.find((entry) => matches(entry, bindingName, '*'));
  if (lockedName !== undefined) return `LOCKED_BINDING_NAMES has '${lockedName}'`;
  return null;
}

/** True when a binding must be locked: its token is a LOCKED_TOKENS token, its token is in a contrast pair
 *  (literally or after expanding `{slot}` interpolation), or its name matches LOCKED_BINDING_NAMES. */
export function mustLock(bindingName: string, token: string, contrastTokens: Iterable<string>, props: Record<string, unknown> = {}): boolean {
  return lockRule(bindingName, token, contrastTokens, props) !== null;
}

export const styleBinding = z
  .strictObject({
    token: tokenRef,
    description: z.string().optional(),
    /** Not overridable per instance. `mustLock` decides which bindings lock automatically. */
    locked: z.boolean().default(false).describe('Not overridable per instance. The parser locks a binding automatically when (1) its token is a focus-indicator or target-size token (color.border.focus, color.inverse.focus, border.width.focus, size.target.*), (2) its token appears in an a11y.contrast pair, literally or after expanding {slot} interpolation over the enum values, or (3) its name starts with focusRing or is minTarget or dismissTarget. Setting locked: false on such a binding is an error; set locked: true for others (e.g. a size that keeps a target reachable).'),
    source,
  })
  .meta({ id: 'styleBinding' });

export const contrastPair = z
  .strictObject({
    foreground: tokenRef,
    background: tokenRef,
    level: z.enum(['AA', 'AAA']).default('AA'),
    large: z.boolean().default(false), // large text threshold (3:1 / 4.5:1)
  })
  .meta({ id: 'contrastPair' });

/** The WAI-ARIA 1.2 concrete roles, plus `none` and `presentation`. No abstract roles (`landmark`, `widget`,
 *  `section`…): a doc names the role the element carries. */
export const ARIA_ROLES = [
  // widget
  'button', 'checkbox', 'gridcell', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'progressbar',
  'radio', 'scrollbar', 'searchbox', 'separator', 'slider', 'spinbutton', 'switch', 'tab', 'tabpanel', 'textbox', 'treeitem',
  // composite
  'combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid',
  // document structure
  'application', 'article', 'blockquote', 'caption', 'cell', 'code', 'columnheader', 'definition', 'deletion', 'directory',
  'document', 'emphasis', 'feed', 'figure', 'generic', 'group', 'heading', 'img', 'insertion', 'list', 'listitem', 'math',
  'meter', 'note', 'paragraph', 'row', 'rowgroup', 'rowheader', 'strong', 'subscript', 'superscript', 'table', 'term',
  'time', 'toolbar', 'tooltip',
  // landmark
  'banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search',
  // live region
  'alert', 'log', 'marquee', 'status', 'timer',
  // window
  'alertdialog', 'dialog',
  // no role
  'none', 'presentation',
] as const;
export const ariaRole = z.enum(ARIA_ROLES).meta({ id: 'ariaRole' });
export type AriaRole = (typeof ARIA_ROLES)[number];

/** ARIA widget roles whose element itself takes focus (WAI-ARIA 1.2 widget roles minus composite containers). */
export const WIDGET_ROLES = ['button', 'checkbox', 'switch', 'radio', 'textbox', 'searchbox', 'spinbutton', 'combobox', 'slider',
  'link', 'tab', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem', 'gridcell', 'scrollbar'] as const satisfies readonly AriaRole[];

export const LANDMARK_ROLES = ['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search'] as const satisfies readonly AriaRole[];

/** Roles a test cannot find the element by: `none` and `presentation` remove the role, and `generic` (a bare div or
 *  span) is not exposed to `getByRole` without a name. Every other role is queryable once the element carries it. */
export const NON_QUERYABLE_ROLES = ['none', 'presentation', 'generic'] as const satisfies readonly AriaRole[];

/** True when `role` is one of `roles`; a null role (unresolved `roleFrom`) is in no partition. */
export function roleIn(roles: readonly string[], role: string | null | undefined): boolean {
  return role !== null && role !== undefined && roles.includes(role);
}

type RoleSource = { a11y?: { role?: string | undefined; roleFrom?: string | undefined }; props?: Record<string, { default?: unknown }> };

/** The role the component renders: `a11y.role`, else the `roleFrom` prop's value in `given`, else that prop's
 *  `default`, else null (the role is only known once the prop is set). */
export function resolveRole(component: RoleSource, given?: Record<string, unknown>): string | null {
  const { role, roleFrom } = component.a11y ?? {};
  if (role !== undefined) return role;
  if (roleFrom === undefined) return null;
  const value = given?.[roleFrom] ?? component.props?.[roleFrom]?.default;
  return typeof value === 'string' ? value : null;
}

export const a11yDef = z
  .strictObject({
    role: ariaRole.optional().describe('The WAI-ARIA 1.2 role the component root renders (none or presentation when it adds nothing). Exactly one of role and roleFrom.'),
    roleFrom: z.string().optional().describe('the enum prop whose value is the rendered role'),
    requires: z.array(
      z.enum([
        'accessible-name',
        'focus-visible',
        'keyboard-operable',
        'target-24px',
        'target-44px',
        'contrast-aa',
        'contrast-aaa',
        'heading-hierarchy',
        'label-association',
        'error-identification',
        'focus-trap',
        'focus-restore',
        'escape-dismiss',
        'arrow-navigation',
        'roving-tabindex',
        'expanded-state',
        'selected-state',
        'live-region',
        'reduced-motion',
        'gesture-alternative',
        'landmark-role',
        'inert-background',
        'scroll-lock',
        'no-hover-only',
      ]),
    ),
    contrast: z.array(contrastPair).optional(),
  })
  .meta({ id: 'a11yDef' });

export const platformNotes = z
  .strictObject({
    element: z.string().optional(),   // web element / RN component / SwiftUI view
    tag: z.string().optional().describe('The Lit custom element tag, e.g. ds-button. Required in a platforms.lit block unless supported is false.'),
    attributes: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
    reflect: z.array(z.string()).optional(),
    supported: z.boolean().default(true),
    notes: z.string().optional(),
  })
  .meta({ id: 'platformNotes' });

/** One key press: `KeyboardEvent.key` names, optionally behind modifiers (`Shift+Tab`). `Space` is accepted as an
 *  alias for `' '`, because a bare space is easy to miss in YAML; `normalizeKey` turns it back. `a-z` is a
 *  typeahead range, not one key. */
export const keyChord = z
  .string()
  .regex(
    /^((Shift|Control|Alt|Meta)\+)*(Escape|Enter| |Space|Tab|Backspace|Delete|Home|End|PageUp|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F([1-9]|1[0-2])|\*|,|a-z|[a-z0-9])$/,
    "Expected a KeyboardEvent.key name, optionally behind Shift+/Control+/Alt+/Meta+ (Enter, ' ', Space, ArrowDown, Shift+Tab, F2, a)",
  )
  .meta({ id: 'keyChord', description: "A KeyboardEvent.key name, optionally behind Shift+/Control+/Alt+/Meta+ modifiers: Escape, Enter, ' ' (or Space), Tab, Backspace, Delete, Home, End, PageUp, PageDown, the four arrows, F1-F12, *, a comma, a lowercase letter or digit, or a-z for a typeahead range." });

/** `Space` → `' '`, the `KeyboardEvent.key` it stands for; every other chord is already canonical. */
export function normalizeKey(k: string): string {
  return k.replace(/(^|\+)Space$/, '$1 ');
}

/** States a `then.state` assertion can name. */
export const BEHAVIOR_STATES = ['checked', 'expanded', 'selected', 'disabled', 'invalid', 'pressed', 'open'] as const;
/** What `then.focused` accepts besides an anatomy part. */
export const BEHAVIOR_FOCUS_TARGETS = ['none', 'moved', 'unchanged'] as const;

/** An anatomy part by name. The parser checks it is in `anatomy`. */
const part = z.string();

/** The one interaction a scenario performs. */
export const whenClause = z
  .union(
    [
      z.strictObject({ click: part }),
      z.strictObject({ key: keyChord }),
      z.strictObject({ type: z.string() }),
      z.strictObject({ focus: part }),
      z.strictObject({ blur: z.literal(true) }),
      z.strictObject({ set: z.record(z.string(), z.unknown()) }),
      z.strictObject({ hover: part }),
    ],
    { error: 'Expected exactly one of { click: <part> }, { key: <keyChord> }, { type: <text> }, { focus: <part> }, { blur: true }, { set: { <prop>: <value> } }, { hover: <part> }' },
  )
  .meta({ id: 'whenClause' });

/** Every assertion may narrow itself to some of the scenario's platforms. */
const thenPlatforms = { platforms: z.array(platformId).optional() };

/** One assertion a scenario makes. */
export const thenClause = z
  .union(
    [
      z.strictObject({ event: z.string(), with: z.unknown().optional(), ...thenPlatforms }),
      z.strictObject({ event: z.string(), fired: z.literal(false), ...thenPlatforms }),
      z.strictObject({ state: z.enum(BEHAVIOR_STATES), is: z.union([z.boolean(), z.literal('mixed')]), ...thenPlatforms }),
      z.strictObject({ focusable: z.boolean(), ...thenPlatforms }),
      z.strictObject({ renders: z.boolean(), ...thenPlatforms }),
      z.strictObject({ focused: z.union([z.enum(BEHAVIOR_FOCUS_TARGETS), part]), ...thenPlatforms }),
      z.strictObject({ text: z.string(), ...thenPlatforms }),
      z.strictObject({ copy: z.string(), ...thenPlatforms }),
      z.strictObject({ role: z.string(), ...thenPlatforms }),
      z.strictObject({ name: z.union([z.literal(true), z.string()]), ...thenPlatforms }),
      z.strictObject({ attribute: z.string(), is: z.union([z.string(), z.boolean(), z.null()]), on: part.optional(), ...thenPlatforms }),
    ],
    { error: 'Expected one assertion: event (with?, or fired: false), state + is, focusable, renders, focused, text, copy, role, name, or attribute + is (on?)' },
  )
  .meta({ id: 'thenClause' });

/** Authored given/when/then scenarios for the behavior gate; the parser adds schema-derived ones. */
export const behaviorScenario = z
  .strictObject({
    name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).describe('kebab-case; becomes the test name.'),
    description: z.string().optional().describe('Why this scenario exists, when the name is not enough.'),
    given: z.record(z.string(), z.unknown()).optional().describe('Props to render with (prop name -> value), over the Default story\'s args. Omit for defaults.'),
    when: whenClause.optional().describe("Exactly one interaction: { click: <part> }, { key: <keyChord> } pressed on the primary part, { type: <text> } into the primary part, { focus: <part> }, { blur: true }, { set: { <prop>: <value> } } (a controlled prop change, applied as a re-render), { hover: <part> }. Omit for a pure render assertion."),
    then: z.array(thenClause).min(1).describe("Assertions, one object each, each with optional platforms: [<platformId>] to narrow just itself: { event, with? } or { event, fired: false }; { state: checked|expanded|selected|disabled|invalid|pressed|open, is: true|false|'mixed' }; { focusable: <bool> }; { renders: <bool> }; { focused: <part>|none|moved|unchanged }; { text: <text> }; { copy: <copy key> }; { role: <role> }; { name: true } (non-empty) or { name: <exact accessible name> }; { attribute: <name>, is: <string>|<bool>|null, on?: <part> } (null asserts the attribute is absent)."),
    platforms: z.array(platformId).optional().describe('Restrict to these platforms (default: all).'),
    derived: z.boolean().optional().describe('Set by the parser on scenarios it derives from the schema (generated/components.json behaviorDerived). Never authored.'),
    source,
  })
  .meta({ id: 'behaviorScenario' });

/** Key → action from the APG pattern. */
export const keyboardRule = z
  .strictObject({
    keys: z.array(keyChord).min(1).describe("Key chords: KeyboardEvent.key names (Escape, Enter, ' ' or Space, ArrowDown, Tab, Home, End), optionally behind Shift+/Control+/Alt+/Meta+ ('Shift+Tab', 'Control+a', 'Control+Home'), or a-z for typeahead."),
    action: z.string().describe('What happens, in one sentence, from the APG pattern.'),
    when: z.string().optional().describe("Focus location or state the rule applies in, e.g. 'focus on trigger', 'menu open'."),
    from: z.enum(['trigger', 'first', 'last', 'inside', 'any']).default('inside').describe('Where focus is before the key is pressed, for the keyboard gate: the element with aria-haspopup/aria-expanded (trigger), the first/last focusable inside the component, anywhere inside, or wherever it is.'),
    expect: z
      .enum(['closes', 'opens', 'focus-next', 'focus-prev', 'focus-first', 'focus-last', 'focus-wraps-to-first', 'focus-wraps-to-last', 'focus-trigger', 'focus-unchanged', 'toggles', 'selects', 'manual'])
      .default('manual')
      .describe("Machine-checkable outcome the keyboard gate asserts after the key: the component's role element disappears/appears, focus moves as named, aria-expanded/aria-checked flips (toggles) or the focused item becomes checked/selected (selects). `manual` means the rule is documented but not auto-tested."),
    source,
  })
  .meta({ id: 'keyboardRule' });

/** The W3C ARIA Authoring Practices pattern slugs (https://www.w3.org/WAI/ARIA/apg/patterns/). */
export const APG_PATTERNS = ['accordion', 'alert', 'alertdialog', 'breadcrumb', 'button', 'carousel', 'checkbox', 'combobox', 'dialog-modal',
  'disclosure', 'feed', 'grid', 'landmarks', 'link', 'listbox', 'menubar', 'menu-button', 'meter', 'radio', 'slider', 'slider-multithumb',
  'spinbutton', 'switch', 'table', 'tabs', 'toolbar', 'tooltip', 'treeview', 'treegrid', 'windowsplitter'] as const;

/** APG patterns that trap focus in a modal layer, and what each must then declare. */
export const MODAL_APG: readonly string[] = ['dialog-modal', 'alertdialog'];
export const MODAL_REQUIRES = ['focus-trap', 'focus-restore', 'escape-dismiss', 'inert-background'] as const;

/** Target-size requirements; each needs a binding on a TARGET_TOKEN token (or a composed component that declares one). */
export const TARGET_REQUIRES: readonly string[] = ['target-24px', 'target-44px'];
export const TARGET_TOKEN = 'size.target.';

const SLOT = /\{([a-zA-Z]+)\}/g;

/** A string, finite number, boolean or null, or an array or plain object of them: what YAML hands a union prop. */
function isJsonValue(value: unknown): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) return Object.values(value).every(isJsonValue);
  return false;
}

export const componentDef = z
  .strictObject({
    name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
    category: z.enum(['action', 'typography', 'input', 'layout', 'feedback', 'navigation', 'container', 'overlay', 'data', 'primitive']),
    status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
    /** APG pattern slug this component implements, e.g. 'dialog-modal'. */
    apg: z.enum(APG_PATTERNS).optional().describe("Slug of the W3C ARIA Authoring Practices pattern this component implements, e.g. 'dialog-modal'. Behavior follows the APG when systems disagree."),
    anatomy: z.array(z.string()).min(1),
    props: z.record(z.string(), propDef),
    events: z.record(z.string(), eventDef).default({}),
    styles: z.record(z.string(), styleBinding).default({}),
    a11y: a11yDef,
    keyboard: z.array(keyboardRule).optional().describe('The keyboard model, key → action, taken from the APG pattern. Generators implement every rule; the planned keyboard gate presses every key and checks the action.'),
    /** Anatomy part → the system component it must be built from. */
    composition: z.record(z.string(), z.string()).optional().describe('Anatomy part → the system component it MUST be built from (closeButton: Button, title: Heading). Parts not listed are plain elements. The parser checks the component exists or is marked (planned).'),
    behavior: z.array(behaviorScenario).optional().describe('Authored given/when/then scenarios the behavior gate turns into tests on every platform. Schema-derived scenarios (renders, accessible name, focusable, error identified, one per enum value) are added by the parser; author only what the schema cannot infer.'),
    /** Strings the component renders itself; templates may use {label}, {count}. */
    copy: z.record(z.string(), z.string()).optional().describe('User-facing strings the component renders itself (validation messages, summary headings). Templates may use {label}, {count}. Generators must use these verbatim so copy is consistent across platforms and localizable in one place.'),
    platforms: z.partialRecord(platformId, platformNotes),
  })
  .check((ctx) => {
    // Cross-field rules that read only this block. Rules that need other docs or built tokens (file name, composition
    // targets, token existence, target and keyboard operability through a composed component) stay in tools/parse.ts.
    const c = ctx.value;
    const issue = (path: PropertyKey[], message: string): void => {
      ctx.issues.push({ code: 'custom', input: c, path, message });
    };
    const requires: readonly string[] = c.a11y.requires;
    const lacks = (req: string): boolean => !requires.includes(req);
    const requiresAt = (req: string): PropertyKey[] => ['a11y', 'requires', requires.indexOf(req)];
    const keyboard = c.keyboard ?? [];
    const composed = Object.keys(c.composition ?? {}).length > 0;
    const anatomy: readonly string[] = c.anatomy;
    const declared = new Set<string>(Object.keys(c.platforms));
    /** [rule index, key index, key] of the first keyboard key `test` accepts. */
    const findKey = (test: (key: string) => boolean): [number, number, string] | null => {
      for (const [i, rule] of keyboard.entries()) {
        const j = rule.keys.findIndex(test);
        if (j >= 0) return [i, j, rule.keys[j] as string];
      }
      return null;
    };

    // Every prop referenced by a token slot must be an enum prop.
    for (const [bName, binding] of Object.entries(c.styles)) {
      for (const [, slot] of binding.token.matchAll(SLOT)) {
        if (!Object.hasOwn(c.props, slot as string) || c.props[slot as string]?.type !== 'enum') {
          issue(['styles', bName, 'token'], `styles.${bName} interpolates '{${slot}}' but '${slot}' is not an enum prop`);
        }
      }
    }
    // Composition parts must be anatomy parts.
    for (const part of Object.keys(c.composition ?? {})) {
      if (!anatomy.includes(part)) issue(['composition', part], `composition.${part} is not in anatomy ${pyRepr(c.anatomy)}`);
    }
    // Keyboard rules imply keyboard-operable, Escape implies escape-dismiss, an arrow key implies arrow-navigation.
    if (keyboard.length && lacks('keyboard-operable')) issue(['keyboard'], "has a keyboard block but a11y.requires lacks 'keyboard-operable'");
    const escape = findKey((k) => k === 'Escape');
    if (escape && lacks('escape-dismiss')) issue(['keyboard', escape[0], 'keys', escape[1]], "keyboard uses Escape but a11y.requires lacks 'escape-dismiss'");
    const arrow = findKey((k) => /(^|\+)Arrow/.test(k));
    if (arrow && lacks('arrow-navigation')) issue(['keyboard', arrow[0], 'keys', arrow[1]], `keyboard uses ${arrow[2]} but a11y.requires lacks 'arrow-navigation'`);
    // A gesture-triggered event must have a non-gesture alternative (WCAG 2.5.1 / 2.5.7).
    const gesture = Object.entries(c.events).find(([, ev]) => ev.gesture);
    if (gesture && lacks('gesture-alternative')) issue(['events', gesture[0], 'gesture'], "declares a gesture event but a11y.requires lacks 'gesture-alternative'");
    // The role is declared, or read from an enum prop whose every value is a role.
    const { roleFrom } = c.a11y;
    if ((c.a11y.role === undefined) === (roleFrom === undefined)) issue(['a11y'], "a11y needs exactly one of 'role' and 'roleFrom'");
    if (roleFrom !== undefined) {
      const prop = Object.hasOwn(c.props, roleFrom) ? c.props[roleFrom] : undefined;
      if (prop?.type !== 'enum') {
        issue(['a11y', 'roleFrom'], `a11y.roleFrom '${roleFrom}' is not an enum prop`);
      } else {
        const notRoles = (prop.values ?? []).filter((v) => !roleIn(ARIA_ROLES, v));
        if (notRoles.length) issue(['a11y', 'roleFrom'], `a11y.roleFrom '${roleFrom}' has values that are not ARIA roles: ${pyRepr(notRoles)}`);
      }
    }
    // Every event must map (or be explicitly unsupported) on every platform declared for the component.
    for (const [evName, ev] of Object.entries(c.events)) {
      for (const [platform, notes] of Object.entries(c.platforms)) {
        if (notes?.supported !== false && !Object.hasOwn(ev.platforms, platform)) issue(['events', evName, 'platforms'], `events.${evName} has no mapping for platform '${platform}'`);
      }
    }
    // Lit registers the component as a custom element, so a supported Lit mapping must name the tag.
    const lit = c.platforms.lit;
    if (lit !== undefined && lit.supported !== false && lit.tag === undefined) {
      issue(['platforms', 'lit', 'tag'], "platforms.lit needs a 'tag' (the custom element name) unless it is supported: false");
    }

    // Accessibility invariants: a requirement is only as real as the field that implements it.
    if (requires.includes('error-identification') && !Object.hasOwn(c.props, 'error')) {
      issue(requiresAt('error-identification'), "a11y.requires has 'error-identification' but props has no 'error'");
    }
    const contrast = c.a11y.contrast ?? [];
    if (contrast.length && lacks('contrast-aa') && lacks('contrast-aaa')) issue(['a11y', 'contrast'], "has a11y.contrast pairs but a11y.requires lacks 'contrast-aa' or 'contrast-aaa'");
    const aaa = contrast.findIndex((pair) => pair.level === 'AAA');
    if (aaa >= 0 && lacks('contrast-aaa')) issue(['a11y', 'contrast', aaa, 'level'], "a11y.contrast has a level AAA pair but a11y.requires lacks 'contrast-aaa'");
    const target = requires.find((r) => TARGET_REQUIRES.includes(r));
    if (target !== undefined && !composed && !Object.values(c.styles).some((b) => b.token.startsWith(TARGET_TOKEN))) {
      issue(requiresAt(target), `a11y.requires has '${target}' but no styles binding is on a ${TARGET_TOKEN}* token and composition names no component`);
    }
    const role = resolveRole(c);
    if (requires.includes('keyboard-operable') && !keyboard.length && !roleIn(WIDGET_ROLES, role) && !composed) {
      issue(requiresAt('keyboard-operable'), `a11y.requires has 'keyboard-operable' but there is no keyboard block, a11y.role '${role}' is not a natively focusable widget role, and composition names no component`);
    }
    if (c.apg !== undefined && MODAL_APG.includes(c.apg)) {
      const missing = MODAL_REQUIRES.filter(lacks);
      if (missing.length) issue(['apg'], `apg '${c.apg}' is modal but a11y.requires lacks ${missing.map((r) => `'${r}'`).join(', ')}`);
    }

    // Behavior scenarios: what the clause shapes cannot see. Props, anatomy, events and copy a scenario names must
    // exist, and anything React Native's harness cannot express (keyboard, focus observation, an `invalid` state)
    // must narrow `platforms` to exclude 'rn' rather than leave the generator to guess.
    const seenNames = new Set<string>();
    for (const [i, sc] of (c.behavior ?? []).entries()) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['behavior', i, ...rest];
      const scName = sc.name;
      if (seenNames.has(scName)) issue(at('name'), `duplicate behavior scenario '${scName}'`);
      seenNames.add(scName);

      const scenarioPlatforms = sc.platforms ?? null;
      for (const [j, plat] of (scenarioPlatforms ?? []).entries()) {
        if (!declared.has(plat)) issue(at('platforms', j), `scenario '${scName}' platforms includes '${plat}', which the component does not declare`);
      }

      // `given` and a controlled `when.set` both name props with values.
      const when = (sc.when ?? {}) as Record<string, unknown>;
      const propValues: [PropertyKey[], string, Record<string, unknown>][] = [
        [['given'], 'given', sc.given ?? {}],
        [['when', 'set'], 'when.set', (when.set ?? {}) as Record<string, unknown>],
      ];
      for (const [path, where, values] of propValues) {
        for (const [propName, value] of Object.entries(values)) {
          const prop = Object.hasOwn(c.props, propName) ? c.props[propName] : undefined;
          if (prop === undefined) {
            issue(at(...path, propName), `scenario '${scName}' ${where}: unknown prop '${propName}'`);
          } else if (prop.type === 'enum' && !(prop.values ?? []).includes(value as string)) {
            issue(at(...path, propName), `scenario '${scName}' ${where}.${propName}: '${String(value)}' is not one of ${pyRepr(prop.values)}`);
          } else if ((prop.type === 'boolean' || prop.type === 'string' || prop.type === 'number') && typeof value !== prop.type) {
            issue(at(...path, propName), `scenario '${scName}' ${where}.${propName} must be a ${prop.type}, got ${pyRepr(value)}`);
          } else if (prop.type === 'union' && !isJsonValue(value)) {
            // The shape is TypeScript-like prose, not a type this check can read, so any JSON value passes.
            issue(at(...path, propName), `scenario '${scName}' ${where}.${propName} must be a JSON value (${String(prop.shape)}), got ${pyRepr(value)}`);
          }
        }
      }

      for (const key of ['click', 'focus', 'hover']) {
        if (key in when && !anatomy.includes(when[key] as string)) issue(at('when', key), `scenario '${scName}' when.${key}: unknown anatomy part '${String(when[key])}'`);
      }
      if ('key' in when && (scenarioPlatforms !== null ? scenarioPlatforms.includes('rn') : declared.has('rn'))) {
        issue(at('when', 'key'), `scenario '${scName}' uses when.key but React Native has no keyboard — narrow platforms to exclude 'rn'`);
      }

      for (const [k, clause] of sc.then.entries()) {
        const item = clause as Record<string, unknown>;
        if ('event' in item && !Object.hasOwn(c.events, item.event as string)) issue(at('then', k, 'event'), `scenario '${scName}' then.event: unknown event '${String(item.event)}'`);
        if ('focused' in item && !anatomy.includes(item.focused as string) && !(BEHAVIOR_FOCUS_TARGETS as readonly string[]).includes(item.focused as string)) {
          issue(at('then', k, 'focused'), `scenario '${scName}' then.focused: unknown anatomy part '${String(item.focused)}'`);
        }
        if (item.on !== undefined && !anatomy.includes(item.on as string)) issue(at('then', k, 'on'), `scenario '${scName}' then.attribute.on: unknown anatomy part '${String(item.on)}'`);
        if ('copy' in item && !Object.hasOwn(c.copy ?? {}, item.copy as string)) issue(at('then', k, 'copy'), `scenario '${scName}' then.copy: unknown copy key '${String(item.copy)}'`);

        const itemPlatforms = (item.platforms ?? null) as string[] | null;
        if (itemPlatforms !== null) {
          for (const [j, plat] of itemPlatforms.entries()) {
            if (!declared.has(plat)) issue(at('then', k, 'platforms', j), `scenario '${scName}' then item platforms includes '${plat}', which the component does not declare`);
          }
          if (scenarioPlatforms !== null && !itemPlatforms.every((p) => (scenarioPlatforms as readonly string[]).includes(p))) {
            issue(at('then', k, 'platforms'), `scenario '${scName}' then item platforms ${pyRepr(itemPlatforms)} outside the scenario's platforms ${pyRepr(scenarioPlatforms)}`);
          }
        }

        const effective: Set<string> = itemPlatforms !== null ? new Set(itemPlatforms) : scenarioPlatforms !== null ? new Set(scenarioPlatforms) : declared;
        if (effective.has('rn')) {
          if ('focusable' in item) issue(at('then', k, 'focusable'), `scenario '${scName}' then.focusable: React Native cannot observe focus — narrow platforms to exclude 'rn'`);
          if (item.state === 'invalid') issue(at('then', k, 'state'), `scenario '${scName}' then.state invalid: React Native has no invalid accessibility state — narrow platforms to exclude 'rn'`);
        }
      }
    }
  })
  .meta({ id: 'componentDef' });

/** The whole frontmatter: Starlight's own fields (title, description, sidebar…) ride alongside `component`. */
export const componentFrontmatter = z.object({
  component: componentDef,
});

export type ComponentDef = z.infer<typeof componentDef>;
export type PlatformId = z.infer<typeof platformId>;
