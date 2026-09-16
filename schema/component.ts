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

import { conventionDrift, eventFires, eventPayload, eventReasons, eventTiming } from './events.ts';
import { expand, product, pyRepr } from './lib.ts';
import { platformId } from './platforms.ts';
import { isToken, NO_TOKEN_VALUES, tokenPublicName } from './tokens.ts';
import { enumValues, VOCAB, VOCAB_NAMES, vocabName } from './vocab.ts';

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

/** States a `then.state` assertion can name. */
export const BEHAVIOR_STATES = ['checked', 'expanded', 'selected', 'disabled', 'invalid', 'pressed', 'open'] as const;

/** States a style binding can apply in: the behavior states, plus the interaction states no assertion names.
 *  `active` is the keyboard-active item in a composite (Listbox's active option), not a pressed pointer. */
export const STYLE_STATES = [...BEHAVIOR_STATES, 'hover', 'focus-visible', 'active', 'dragging'] as const;

/** The controlled/uncontrolled contract of one prop. componentDef checks what it names, since a prop cannot see its
 *  siblings or the component's events. */
export const propControls = z
  .strictObject({
    event: z.string().describe('The event that reports a requested change; the consumer updates this prop in response.'),
    default: z.string().optional().describe('The prop that seeds the value when this prop is omitted, e.g. defaultChecked.'),
    state: z.enum(BEHAVIOR_STATES).optional().describe('For a boolean prop: the behavior state it drives, so a then.state assertion can be tied to it.'),
  })
  .describe('This prop is controlled when it is given and uncontrolled when it is omitted: event reports a requested change, default names the prop that seeds the uncontrolled value, and state names the behavior state a boolean prop drives.');

/** The literal a prop's `default` holds; an extension's `defaults` reuses it. */
export const propDefault = z.union([z.string(), z.number(), z.boolean()]);

/** A package version. The packages share one version (process/publishing.md), so this dates a field for every one. */
export const sinceVersion = z.string().regex(/^\d+\.\d+\.\d+$/, 'Expected a package version like 0.2.0');

/** Why something is on its way out, since when, and what replaces it. componentDef checks what `use` names. */
export const deprecation = z
  .strictObject({
    reason: z.string().describe('Why callers should move off it.'),
    since: sinceVersion.optional().describe('The package version that deprecated it.'),
    use: z.string().optional().describe('The replacement: another prop or event of the component for a prop or event, another value of the prop for a value, another component for a component.'),
  })
  .meta({ id: 'deprecation' });

const lifecycle = {
  since: sinceVersion.optional().describe('The package version it arrived in.'),
  deprecated: deprecation.optional(),
};

export const propDef = z
  .strictObject({
    type: z.enum(['string', 'number', 'integer', 'boolean', 'enum', 'content', 'array', 'object', 'function', 'union']).describe("A value of more than one kind (a single id or an array of them) is 'union', with the kinds spelled out in shape. A whole number (a count, an index, a precision) is 'integer', emitted as a number."),
    description: z.string(),
    /** For array/object/function props: TypeScript-like shape of the value. Required for union props. */
    shape: z.string().optional().describe("For array/object/function/union props: the item or field shape in TypeScript-like notation, e.g. '{ value: string; label: string; description?: string; disabled?: boolean }[]' or 'string | string[]'. Required for union."),
    required: z.boolean().default(false),
    default: propDefault.optional(),
    values: z.array(z.string()).optional(), // enum only
    enumRef: vocabName.optional().describe('For an enum prop: the shared vocabulary (schema/vocab.ts) it takes its values from. values, when present, narrows it to a subset.'),
    a11y: z.string().optional(),            // why this prop matters for accessibility
    a11yRole: z.enum(['accessible-name', 'description', 'error']).optional().describe('What this prop contributes to the accessibility tree.'),
    platforms: z.array(platformId).optional(), // omit = all platforms
    valuesOn: z
      .record(z.string(), z.array(platformId).min(1))
      .optional()
      .describe("For an enum prop: value → the platforms it is offered on, each one the component (and this prop's platforms) declares. A value not listed is offered everywhere."),
    controls: propControls.optional(),
    ...lifecycle,
    valueLifecycle: z
      .record(z.string(), z.strictObject({ since: sinceVersion, deprecated: deprecation }).partial())
      .optional()
      .describe("For an enum prop: value → when it arrived (since) and whether it is on its way out (deprecated, whose use names another value of this prop). A sibling of values, which stays a plain list."),
    source,
  })
  .refine((p) => p.type !== 'enum' || Array.isArray(p.values) || p.enumRef !== undefined, { message: "an enum prop needs 'values'", path: ['values'] })
  .check((ctx) => {
    const p = ctx.value;
    const issue = (path: PropertyKey[], message: string): void => {
      ctx.issues.push({ code: 'custom', input: p, path, message });
    };
    if (p.type === 'union' && p.shape === undefined) issue(['shape'], "a union prop needs 'shape'");
    // valueLifecycle dates the values of an enum, and a deprecated value points at another value of the same prop.
    if (p.valueLifecycle !== undefined) {
      if (p.type !== 'enum') {
        issue(['valueLifecycle'], 'valueLifecycle is only for enum props');
      } else if (Array.isArray(p.values) || p.enumRef !== undefined) {
        const values = enumValues(p);
        for (const [value, life] of Object.entries(p.valueLifecycle)) {
          if (!values.includes(value)) issue(['valueLifecycle', value], `valueLifecycle.${value} is not one of ${pyRepr(values)}`);
          const use = life.deprecated?.use;
          if (use !== undefined && (use === value || !values.includes(use))) {
            issue(['valueLifecycle', value, 'deprecated', 'use'], `valueLifecycle.${value}.deprecated.use names '${use}', which is not another value of this prop`);
          }
        }
      }
    }
    // enumRef names the vocabulary an enum takes its values from; values beside it narrow that vocabulary.
    if (p.enumRef !== undefined) {
      if (p.type !== 'enum') issue(['enumRef'], `enumRef needs an enum prop, got '${p.type}'`);
      const vocab: readonly string[] = VOCAB[p.enumRef];
      for (const [i, value] of (p.values ?? []).entries()) {
        if (!vocab.includes(value)) issue(['values', i], `value ${pyRepr(value)} is not one of VOCAB.${p.enumRef} ${pyRepr(vocab)}`);
      }
    }
    // A default is a literal the prop's own type allows: the scalar itself, a whole number for an integer, one of an
    // enum's values, and nothing for the types a literal cannot spell (content, array, object, function, union).
    if (p.default === undefined) return;
    if (p.type === 'integer') {
      if (typeof p.default !== 'number' || !Number.isInteger(p.default)) issue(['default'], `an integer prop's default must be an integer, got ${pyRepr(p.default)}`);
    } else if (SCALAR_PROP_TYPES.includes(p.type)) {
      if (typeof p.default !== p.type) issue(['default'], `a ${p.type} prop's default must be a ${p.type}, got ${pyRepr(p.default)}`);
    } else if (p.type === 'enum') {
      const values = enumValues(p);
      if ((Array.isArray(p.values) || p.enumRef !== undefined) && !values.includes(p.default as string)) issue(['default'], `default ${pyRepr(p.default)} is not one of ${pyRepr(values)}`);
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
    payload: eventPayload.optional(),
    reasons: eventReasons.optional(),
    fires: eventFires.optional(),
    cancelable: z.boolean().optional().describe("True when the handler can veto the component's default action (the close, the edit, the navigation). How it vetoes on each platform (return false, preventDefault) belongs in the platform notes. Never true on an after-change event, which has nothing left to cancel."),
    timing: eventTiming.optional(),
    ...lifecycle,
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

/** Which rule locks a binding, as text for an error message; null when none does. `tokens` is every token the
 *  binding can resolve to (`bindingTokens`), or one token. `contrastTokens` are the foreground and background tokens
 *  of the component's a11y.contrast pairs; `props` supplies the enum values `{slot}` interpolation expands over, on
 *  both the binding's tokens and the pair's. */
export function lockRule(bindingName: string, tokens: string | readonly string[], contrastTokens: Iterable<string>, props: Record<string, unknown> = {}): string | null {
  const paths = (typeof tokens === 'string' ? [tokens] : tokens).flatMap((token) => tokenPaths(token, props));
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

/** True when a binding must be locked: one of its tokens is a LOCKED_TOKENS token or is in a contrast pair
 *  (literally or after expanding `{slot}` interpolation), or its name matches LOCKED_BINDING_NAMES. */
export function mustLock(bindingName: string, tokens: string | readonly string[], contrastTokens: Iterable<string>, props: Record<string, unknown> = {}): boolean {
  return lockRule(bindingName, tokens, contrastTokens, props) !== null;
}

/** One term of a computed binding: a token or another binding of the same component, optionally multiplied. */
export type StyleOperand = { token: string; times?: number | undefined } | { binding: string; times?: number | undefined };
type ComputedSource = { times?: number | undefined; plus?: readonly StyleOperand[] | undefined; minus?: readonly StyleOperand[] | undefined };
type BindingSource = { token: string; values?: Record<string, string> | undefined; computed?: ComputedSource | undefined };

/** Every token a binding can resolve to, first seen first: `token`, each `values` token, each `computed` token
 *  operand. Locking and token existence read all of them. */
export function bindingTokens(binding: BindingSource): string[] {
  const operands = [...(binding.computed?.plus ?? []), ...(binding.computed?.minus ?? [])];
  const tokens = [binding.token, ...Object.values(binding.values ?? {}), ...operands.flatMap((op) => ('token' in op ? [op.token] : []))];
  return [...new Set(tokens)];
}

/** A computed binding's value: `token × times + Σ plus − Σ minus`, each operand its token or binding times its own
 *  `times`. Without `computed` it is the token's value. Pure: the caller resolves tokens and other bindings. */
export function computeBinding(binding: BindingSource, resolveToken: (token: string) => number, resolveBinding: (name: string) => number): number {
  const operand = (op: StyleOperand): number => ('token' in op ? resolveToken(op.token) : resolveBinding(op.binding)) * (op.times ?? 1);
  const sum = (ops: readonly StyleOperand[] = []): number => ops.reduce((total, op) => total + operand(op), 0);
  const { computed } = binding;
  return resolveToken(binding.token) * (computed?.times ?? 1) + sum(computed?.plus) - sum(computed?.minus);
}

const positiveTimes = z.number().positive().finite().optional().describe('A positive finite multiplier.');

export const styleOperand = z
  .union(
    [
      z.strictObject({ token: tokenRef, times: positiveTimes }),
      z.strictObject({ binding: z.string().describe('Another styles binding of this component.'), times: positiveTimes }),
    ],
    { error: 'Expected { token: <tokenRef>, times? } or { binding: <styles key>, times? }' },
  )
  .describe('A token or another styles binding, optionally multiplied by times.');

export const styleComputed = z
  .strictObject({
    times: positiveTimes.describe("Multiplies the binding's token."),
    plus: z.array(styleOperand).min(1).optional().describe('Operands added.'),
    minus: z.array(styleOperand).min(1).optional().describe('Operands subtracted. Not allowed on a binding that must lock.'),
  })
  .refine((c) => c.times !== undefined || c.plus !== undefined || c.minus !== undefined, { message: "computed needs at least one of 'times', 'plus' or 'minus'" })
  .describe('A derived size, read as token × times + Σ plus − Σ minus, so no literal multiple lives in prose or code.');

export const styleBinding = z
  .strictObject({
    token: tokenRef,
    description: z.string().optional(),
    part: z.string().optional().describe('The anatomy part the binding styles. Omitted means the root.'),
    state: z.enum(STYLE_STATES).optional().describe('The state the binding applies in (active is the keyboard-active item in a composite). Omitted means every state.'),
    platforms: z.array(platformId).optional().describe('The platforms the binding applies on, each one the component declares. Omitted means all.'),
    by: z.string().optional().describe("An enum or boolean prop whose value picks the token from values. Needs values, and the token may not also interpolate {<by>}."),
    values: z.record(z.string(), tokenRef).optional().describe("Value of the by prop ('true'/'false' for a boolean) → the token used instead of token for that value."),
    computed: styleComputed.optional(),
    /** Not overridable per instance. `mustLock` decides which bindings lock automatically. */
    locked: z.boolean().default(false).describe('Not overridable per instance. The parser locks a binding automatically when (1) any token it can resolve to (token, a values token, a computed token operand) is a focus-indicator or target-size token (color.border.focus, color.inverse.focus, border.width.focus, size.target.*), (2) such a token appears in an a11y.contrast pair, literally or after expanding {slot} interpolation over the enum values, or (3) its name starts with focusRing or is minTarget or dismissTarget. Setting locked: false on such a binding is an error; set locked: true for others (e.g. a size that keeps a target reachable).'),
    source,
  })
  .meta({ id: 'styleBinding' });

/** States a contrast pair can hold in. No `disabled`: WCAG 1.4.3 and 1.4.11 exempt inactive components. */
export const CONTRAST_STATES = ['default', 'hover', 'pressed', 'focus', 'selected', 'checked', 'expanded', 'open', 'invalid'] as const;

export const contrastPair = z
  .strictObject({
    foreground: tokenRef,
    background: tokenRef,
    level: z.enum(['AA', 'AAA']).default('AA'),
    large: z.boolean().default(false).describe('Large text only (18pt, or 14pt bold): checked at 3:1 for AA and 4.5:1 for AAA. Component boundaries, focus and state indicators and meaningful icons are not text; they set nonText.'),
    nonText: z.boolean().optional().describe('The pair is a WCAG 1.4.11 non-text pair (a component boundary, a focus or state indicator, a meaningful icon), checked at 3:1. Only at level AA, and never with large.'),
    state: z.enum(CONTRAST_STATES).optional().describe('The state the pair holds in, e.g. checked for a thumb on its checked track. Omitted means every state. There is no disabled: WCAG 1.4.3 and 1.4.11 exempt inactive components, so a disabled pair has nothing to check.'),
    surface: tokenRef.optional().describe('What a background that resolves to transparent is checked against, instead of color.background: the surface the component really sits on, e.g. color.overlay.surface.'),
    only: z
      .record(z.string(), z.array(z.string()).min(1))
      .optional()
      .describe("Narrows {slot} expansion: an enum prop interpolated in foreground or background → the subset of its values the pair covers, e.g. { tone: [success, danger] }. A prop not listed expands over all its values."),
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

/** The accessibility requirements a component can declare in `a11y.requires`. */
export const A11Y_REQUIREMENTS = [
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
] as const;

const a11yRequirement = z.enum(A11Y_REQUIREMENTS);

export const a11yDef = z
  .strictObject({
    role: ariaRole.optional().describe('The WAI-ARIA 1.2 role the component root renders (none or presentation when it adds nothing). Exactly one of role and roleFrom.'),
    roleFrom: z.string().optional().describe('the enum prop whose value is the rendered role'),
    requires: z.array(a11yRequirement),
    requiresOn: z
      .partialRecord(a11yRequirement, z.array(platformId).min(1))
      .optional()
      .describe('Requirement → the platforms it applies on, each one the component declares, e.g. target-44px: [rn, swiftui] for a comfortable target only touch platforms need. Every key is in requires; a requirement not listed applies on every platform.'),
    contrast: z.array(contrastPair).optional(),
  })
  .meta({ id: 'a11yDef' });

/** One reflected attribute: a prop name or its kebab-case attribute, or the prop and the attribute it reflects to. */
export const reflectItem = z
  .union([
    z.string(),
    z.strictObject({
      prop: z.string().describe('The prop that reflects.'),
      attribute: z.string().regex(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/, 'Expected a kebab-case attribute name').describe("The host attribute it reflects to. For a boolean prop that defaults to true, the negated form (no-dismiss for dismissible), never the prop's own kebab-case."),
    }),
  ])
  .meta({ id: 'reflectItem', description: "A prop name or its kebab-case attribute name, or { prop, attribute } when the attribute is not the prop's kebab-case (the negated attribute of a boolean that defaults to true)." });

export const platformNotes = z
  .strictObject({
    element: z.string().optional(),   // web element / RN component / SwiftUI view
    tag: z.string().optional().describe('The Lit custom element tag, e.g. ds-button. Required in a platforms.lit block unless supported is false.'),
    attributes: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
    reflect: z.array(reflectItem).optional().describe('The props the element reflects to host attributes, for styling by attribute selector: a prop name, its kebab-case, or { prop, attribute }.'),
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

/** A behavior scenario's or an example's name: kebab-case. */
const KEBAB_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Authored given/when/then scenarios for the behavior gate; the parser adds schema-derived ones. */
export const behaviorScenario = z
  .strictObject({
    name: z.string().regex(KEBAB_NAME).describe('kebab-case; becomes the test name.'),
    description: z.string().optional().describe('Why this scenario exists, when the name is not enough.'),
    given: z.record(z.string(), z.unknown()).optional().describe('Props to render with (prop name -> value), over the Default story\'s args. Omit for defaults.'),
    when: whenClause.optional().describe("Exactly one interaction: { click: <part> }, { key: <keyChord> } pressed on the primary part, { type: <text> } into the primary part, { focus: <part> }, { blur: true }, { set: { <prop>: <value> } } (a controlled prop change, applied as a re-render), { hover: <part> }. Omit for a pure render assertion."),
    then: z.array(thenClause).min(1).describe("Assertions, one object each, each with optional platforms: [<platformId>] to narrow just itself: { event, with? } or { event, fired: false } (with is the handler's argument; when the event declares a payload of two or more fields, an object keyed by those field names, and a reason in it must be one of the event's reasons); { state: checked|expanded|selected|disabled|invalid|pressed|open, is: true|false|'mixed' }; { focusable: <bool> }; { renders: <bool> }; { focused: <part>|none|moved|unchanged }; { text: <text> }; { copy: <copy key> }; { role: <role> }; { name: true } (non-empty) or { name: <exact accessible name> }; { attribute: <name>, is: <string>|<bool>|null, on?: <part> } (null asserts the attribute is absent)."),
    platforms: z.array(platformId).optional().describe('Restrict to these platforms (default: all).'),
    derived: z.boolean().optional().describe('Set by the parser on scenarios it derives from the schema (generated/components.json behaviorDerived). Never authored.'),
    source,
  })
  .meta({ id: 'behaviorScenario' });

/** One authored usage example: the props it renders with, for the site and the stories. componentDef checks what
 *  `given` and `platforms` name. */
export const componentExample = z
  .strictObject({
    name: z.string().regex(KEBAB_NAME).describe('kebab-case; unique among the examples.'),
    description: z.string().describe('What the example shows, in one sentence.'),
    given: z.record(z.string(), z.unknown()).describe('Props to render with (prop name -> value). Each names a prop and fits its type.'),
    platforms: z.array(platformId).optional().describe('The platforms the example applies on, each one the component declares. Omitted means all.'),
  })
  .meta({ id: 'componentExample' });

export const CONSTANT_UNITS = ['ms', 'px', 'px/ms', 'ratio', 'count'] as const;

/** A number the component's logic reads (a delay, a threshold, a debounce), as a token times a factor or a literal. */
export const constantDef = z
  .strictObject({
    description: z.string().describe('What the logic uses the number for.'),
    token: tokenRef.optional().describe('The token the value is read from, e.g. motion.duration.base. Exactly one of token and value.'),
    multiply: z.number().positive().optional().describe('Multiplies the token, e.g. 3 for motion.duration.base × 3. Only with token.'),
    value: z.number().optional().describe('A literal value, when no token carries it. Exactly one of token and value.'),
    unit: z.enum(CONSTANT_UNITS).describe('The unit the logic reads the number in.'),
  })
  .check((ctx) => {
    const k = ctx.value;
    if ((k.token === undefined) === (k.value === undefined)) ctx.issues.push({ code: 'custom', input: k, path: [], message: "a constant needs exactly one of 'token' and 'value'" });
    if (k.multiply !== undefined && k.token === undefined) ctx.issues.push({ code: 'custom', input: k, path: ['multiply'], message: "multiply needs 'token'" });
  })
  .meta({ id: 'constantDef' });

/** What the keyboard gate can assert after a key. `manual` means documented but not auto-tested. */
export const KEYBOARD_EXPECTS = ['closes', 'opens', 'focus-next', 'focus-prev', 'focus-first', 'focus-last', 'focus-wraps-to-first', 'focus-wraps-to-last',
  'focus-trigger', 'focus-unchanged', 'toggles', 'selects', 'manual'] as const;

const keyboardExpect = z.enum(KEYBOARD_EXPECTS);

/** A keyboard rule's outcomes as a list, whichever form `expect` takes: a string is a one-item list, and an absent
 *  `expect` is `manual`. Readers call this rather than branching on the type. */
export function expectList(rule: { expect?: string | readonly string[] | undefined }): string[] {
  const exp = rule.expect ?? 'manual';
  return typeof exp === 'string' ? [exp] : [...exp];
}

/** Key → action from the APG pattern. */
export const keyboardRule = z
  .strictObject({
    keys: z.array(keyChord).min(1).describe("Key chords: KeyboardEvent.key names (Escape, Enter, ' ' or Space, ArrowDown, Tab, Home, End), optionally behind Shift+/Control+/Alt+/Meta+ ('Shift+Tab', 'Control+a', 'Control+Home'), or a-z for typeahead."),
    action: z.string().describe('What happens, in one sentence, from the APG pattern.'),
    when: z.string().optional().describe("Focus location or state the rule applies in, e.g. 'focus on trigger', 'menu open'. Prose: a prop state the gate must set belongs in given."),
    from: z.enum(['trigger', 'first', 'last', 'inside', 'any']).default('inside').describe('Where focus is before the key is pressed, for the keyboard gate: the element with aria-haspopup/aria-expanded (trigger), the first/last focusable inside the component, anywhere inside, or wherever it is.'),
    expect: z
      .union([keyboardExpect, z.array(keyboardExpect.exclude(['manual'])).min(2)])
      .default('manual')
      .describe("Machine-checkable outcome the keyboard gate asserts after the key: the component's role element (or target) disappears/appears, focus moves as named, aria-expanded/aria-checked flips (toggles) or the focused item becomes checked/selected (selects). A list of two or more outcomes (no manual, no duplicates, not both closes and opens) is asserted in order. `manual` means the rule is documented but not auto-tested."),
    given: z.record(z.string(), z.unknown()).optional().describe("Props the Keyboard story renders with for this rule (prop name -> value), over the story's own args. Each value fits its prop and is a boolean, a number or a string of letters, digits, spaces, _ and -, because it travels in a Storybook URL."),
    target: part.optional().describe('The anatomy part closes/opens assert on, instead of the component root. Only with closes or opens in expect.'),
    repeat: z.number().int().min(1).max(20).optional().describe('Press the chord this many times before asserting. Above 1 only with focus-next or focus-prev, which then expect a move of that many.'),
    platforms: z.array(platformId).optional().describe('The platforms the rule applies on, each one the component declares. Omitted means every declared platform.'),
    native: z.boolean().optional().describe("The rule is the rendered native element's own behavior (a button's Enter, an input's caret on Home/End): generators implement nothing for it, and the gate still asserts its expect when there is one."),
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

/** Storybook's own validation for a URL arg value: `args=key:value` drops anything else. */
const STORY_ARG = /^[A-Za-z0-9 _-]*$/;

/** A value a keyboard rule's `given` can carry in a Storybook URL: a boolean, a finite number or a plain string. */
function isStoryArg(value: unknown): boolean {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && STORY_ARG.test(value);
}

/** What a composition entry passes to one child prop: a literal, or `{ from }` to pass a parent prop through. */
export const compositionProp = z
  .union([z.string(), z.number(), z.boolean(), z.strictObject({ from: z.string().describe('The parent prop whose value is passed through.') })])
  .meta({ id: 'compositionProp', description: 'A literal (string, number or boolean) the child prop receives, or { from: <parent prop> } to pass the parent prop through.' });

/** One composition value: the component's name, or an object that also says what the parent passes to it. */
export const compositionEntry = z
  .union([
    z.string(),
    z.strictObject({
      component: z.string().describe("The system component the part is built from, spelled as the string form is, including a '(planned)' suffix."),
      props: z.record(z.string(), compositionProp).optional().describe('Child prop → the literal it receives, or { from: <parent prop> } to pass a parent prop through. The parser checks each is a child prop the value fits.'),
      forwards: z.record(z.string(), z.string()).optional().describe("Parent styles binding → the child binding that receives it through the child's overrides. The parser checks the child binding exists and is not locked."),
    }),
  ])
  .meta({ id: 'compositionEntry', description: 'The system component an anatomy part is built from: its name, or { component, props?, forwards? }.' });

export type CompositionEntry = z.infer<typeof compositionEntry>;

/** The component a composition entry names, without its `(planned)` suffix, and whether it is planned. */
export function compositionTarget(entry: string | { component: string }): { component: string; planned: boolean } {
  const spelled = typeof entry === 'string' ? entry : entry.component;
  return { component: spelled.split('(planned)').join('').trim(), planned: spelled.includes('(planned)') };
}

/** What an anatomy part is. */
export const PART_KINDS = ['element', 'component', 'slot'] as const;
export type PartKind = (typeof PART_KINDS)[number];

/** A slot part's names across the platforms. */
export const slotDef = z
  .strictObject({
    default: z.boolean().optional().describe("The unnamed slot: Lit's default <slot>, React and React Native children, SwiftUI's content @ViewBuilder. At most one per component."),
    prop: z.string().optional().describe('The type: content prop that fills the slot on prop-based platforms.'),
    required: z.boolean().optional().describe('The consumer must fill the slot.'),
    platforms: z.partialRecord(platformId, z.string()).optional().describe('Per-platform name: the Lit <slot name>, the React or React Native prop, the SwiftUI @ViewBuilder parameter label. Omitted names derive from the part (see slotName).'),
  })
  .meta({ id: 'slotDef' });

export const partDef = z
  .strictObject({
    kind: z.enum(PART_KINDS).describe('element: a plain element the component renders. component: built from the system component its composition entry names. slot: a named insertion point the consumer fills, where the component renders no element of its own.'),
    description: z.string().optional(),
    slot: slotDef.optional().describe('Only on kind: slot.'),
  })
  .meta({ id: 'partDef' });

type PartSource = {
  composition?: Record<string, unknown> | undefined;
  parts?: Record<string, { kind: PartKind; slot?: { default?: boolean | undefined; prop?: string | undefined; platforms?: Partial<Record<string, string>> | undefined } | undefined }> | undefined;
};

/** `headingLevel` → `heading-level`: a camelCase name as a Lit attribute or slot name. */
function kebabCase(name: string): string {
  return name.replace(/(?<!^)(?=[A-Z])/g, '-').toLowerCase();
}

/** A reflect entry resolved to the prop and the attribute it reflects to: an object entry as written, a string equal
 *  to a prop name or to its kebab-case as that prop, and otherwise null. */
export function reflectEntry(c: { props?: Record<string, unknown> | undefined }, entry: string | { prop: string; attribute: string }): { prop: string; attribute: string } | null {
  if (typeof entry !== 'string') return { prop: entry.prop, attribute: entry.attribute };
  const props = Object.keys(c.props ?? {});
  const prop = props.find((p) => p === entry) ?? props.find((p) => kebabCase(p) === entry);
  return prop === undefined ? null : { prop, attribute: kebabCase(prop) };
}

const ownPart = (component: PartSource, part: string): NonNullable<PartSource['parts']>[string] | undefined =>
  component.parts !== undefined && Object.hasOwn(component.parts, part) ? component.parts[part] : undefined;

/** The part's declared kind; else `component` when composition builds it; else `element`. */
export function partKind(component: PartSource, part: string): PartKind {
  const declared = ownPart(component, part)?.kind;
  if (declared !== undefined) return declared;
  return component.composition !== undefined && Object.hasOwn(component.composition, part) ? 'component' : 'element';
}

/** A slot's name on one platform: the declared name; else on Lit '' for the default slot or the part in kebab-case;
 *  else `slot.prop`, or the default slot's `children` (web, rn) or `content` (swiftui), or the part name. */
export function slotName(component: PartSource, part: string, platform: string): string {
  const slot = ownPart(component, part)?.slot ?? {};
  const declared = slot.platforms?.[platform];
  if (declared !== undefined) return declared;
  const isDefault = slot.default === true;
  if (platform === 'lit') return isDefault ? '' : kebabCase(part);
  if (slot.prop !== undefined) return slot.prop;
  if (isDefault) return platform === 'swiftui' ? 'content' : 'children';
  return part;
}

const LIT_SLOT_NAME = /^[a-z][a-z0-9-]*$/;
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** The checks a form field can run, in precedence order after an authored `error`. */
export const FORM_VALIDATIONS = ['required', 'invalid', 'range', 'pattern', 'custom'] as const;
export const FORM_VALUE_TYPES = ['string', 'boolean', 'number', 'string[]', 'date', 'date-range', 'number-range'] as const;
/** Value types a scalar prop cannot hold: the value prop is a union, array or object. */
const COMPOUND_VALUE_TYPES: readonly string[] = ['string[]', 'date-range', 'number-range'];
const COMPOUND_PROP_TYPES: readonly string[] = ['union', 'array', 'object'];

/** How a component takes part in a form. componentDef checks what it names, since the block cannot see the props,
 *  copy or events. */
export const formDef = z
  .strictObject({
    role: z.enum(['field', 'container']).describe('field: the component contributes one value to a form. container: the component (Form) collects the values of the fields inside it.'),
    value: z.string().optional().describe('The prop that holds the submitted value, e.g. value or checked. Required for role field.'),
    valueType: z.enum(FORM_VALUE_TYPES).optional().describe("The type of the submitted value. boolean needs a boolean value prop; string[], date-range and number-range need a union, array or object value prop. Required for role field."),
    name: z.string().optional().describe('The prop whose value keys this field in the submitted record. Omitted means the convention, a prop called name.'),
    validation: z.array(z.enum(FORM_VALIDATIONS)).optional().describe("The checks the field runs, in precedence order after an authored error: required (needs a required prop), invalid (the platform's own validity, e.g. a malformed email), range (min/max), pattern, custom (a consumer validator)."),
    messages: z.partialRecord(z.enum(FORM_VALIDATIONS), z.string()).optional().describe('Validation → the copy key of the message shown when that check fails.'),
    discovery: z.enum(['attribute', 'context']).optional().describe('How the container finds its fields. attribute: each field carries data-ds-field and the container queries for it. context: each field registers itself with the container through a context (FormContext, an environment value).'),
  })
  .describe('How the component joins a form: a field contributes a typed value under a name and runs validation; a container collects the values.')
  .meta({ id: 'formDef' });

export const OVERLAY_DISMISS = ['escape', 'outside-press', 'scrim', 'focus-out', 'close-button', 'swipe'] as const;

/** A layered component's stacking, positioning and dismissal. componentDef checks what it names. */
export const overlayDef = z
  .strictObject({
    layer: z.enum(['modal', 'popover', 'tooltip', 'toast', 'sheet']).describe('The layer the component renders in: modal (a dialog over an inert page), popover (an anchored popup: menu, listbox, date grid), tooltip (a non-interactive hint), toast (a transient notice), sheet (a panel from a screen edge).'),
    anchor: z.string().optional().describe('The anatomy part the layer is positioned against, e.g. trigger. Omitted for an unanchored layer (a centered dialog, a sheet, a toast).'),
    placement: z.string().optional().describe('The enum prop holding the preferred side or alignment relative to the anchor, e.g. placement.'),
    collision: z.enum(['flip', 'flip-shift', 'shift', 'none']).optional().describe('What happens when the preferred placement would overflow the viewport: flip to the opposite side, flip then shift along the edge, only shift, or nothing. Needs anchor.'),
    open: z.string().optional().describe('The boolean prop that controls visibility.'),
    closeEvent: z.string().optional().describe('The event fired when the layer is dismissed.'),
    dismiss: z.array(z.enum(OVERLAY_DISMISS)).optional().describe('The ways a user dismisses the layer: escape (needs escape-dismiss in a11y.requires), outside-press, scrim (a press on the backdrop), focus-out, close-button, swipe.'),
    modal: z.boolean().optional().describe('True when the layer traps focus and makes the page behind it inert; then a11y.requires must list focus-trap, focus-restore, escape-dismiss and inert-background.'),
  })
  .describe('How the component layers over the page: its layer, what it anchors to and how it handles overflow, the prop and event that open and close it, and how it is dismissed.')
  .meta({ id: 'overlayDef' });

/** The CLDR plural categories, in CLDR order. `other` is the one every locale has. */
export const PLURAL_CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other'] as const;

/** A named placeholder in a copy template: `{count}`. */
const COPY_PLACEHOLDER = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;

/** What a copy template's placeholder holds. */
export const copyParam = z
  .strictObject({
    type: z.enum(['string', 'number', 'date']).describe('The kind of value the placeholder receives: a string inserted as is, a number (formatted for the locale, and the only kind plural.by may name), or a date (formatted for the locale).'),
    description: z.string().optional().describe('What the value is, for translators and generators, e.g. "the column header text".'),
  })
  .describe('One placeholder a copy template uses: its value type, and what it is.')
  .meta({ id: 'copyParam' });

export const pluralForms = z
  .strictObject({
    by: z.string().describe('The number param whose value picks the form by the locale\'s CLDR plural rules.'),
    zero: z.string().optional().describe('The CLDR zero form, for locales that have one (Arabic, Latvian). English picks other for 0.'),
    one: z.string().optional().describe('The CLDR one form, e.g. "{count} item".'),
    two: z.string().optional().describe('The CLDR two form, for locales that have one (Arabic, Welsh).'),
    few: z.string().optional().describe('The CLDR few form, for locales that have one (Polish, Russian, Arabic).'),
    many: z.string().optional().describe('The CLDR many form, for locales that have one (Polish, Russian, Arabic).'),
    other: z.string().describe('The CLDR other form, used for every count no other form covers. Required: every locale has it.'),
  })
  .describe('The forms of a template that takes a count, one per CLDR plural category; by names the number param that picks one.')
  .meta({ id: 'pluralForms' });

export const copyEntry = z
  .strictObject({
    text: z.string().optional().describe('The template, for a string with no plural forms. Exactly one of text and plural.'),
    plural: pluralForms.optional().describe('The template\'s CLDR plural forms, picked by a number param. Exactly one of text and plural.'),
    params: z.record(z.string().regex(/^[a-z][a-zA-Z0-9]*$/, 'Expected a camelCase param name'), copyParam).optional().describe('Placeholder name → what it holds. Every {name} in text or a plural form is a declared param or a prop of the component, and every declared param is used by a placeholder or by plural.by.'),
    description: z.string().optional().describe('What the string is for and where it appears, for translators and generators.'),
    platforms: z.array(platformId).min(1).optional().describe('The platforms the component renders this string on, each one the component declares. Omitted means all.'),
    source,
  })
  .describe('A copy template with its placeholders declared: text or CLDR plural forms, the params they use, a description, and the platforms it is rendered on.')
  .meta({ id: 'copyEntry' });

export type CopyEntry = z.infer<typeof copyEntry>;

/** A copy value's text, whichever form it takes: the string itself, `text`, or the plural `other` form. */
export function copyText(entry: string | CopyEntry): string {
  if (typeof entry === 'string') return entry;
  return entry.text ?? entry.plural?.other ?? '';
}

/** Every template a copy value holds: the string, or `text` and each plural form in CLDR order. */
function copyTemplates(entry: string | CopyEntry): [PropertyKey[], string][] {
  if (typeof entry === 'string') return [[[], entry]];
  const forms: [PropertyKey[], string | undefined][] = [[['text'], entry.text], ...PLURAL_CATEGORIES.map((k): [PropertyKey[], string | undefined] => [['plural', k], entry.plural?.[k]])];
  return forms.filter((form): form is [PropertyKey[], string] => form[1] !== undefined);
}

const placeholdersIn = (template: string): string[] => [...new Set([...template.matchAll(COPY_PLACEHOLDER)].map((m) => m[1] as string))];

/** Every `{name}` a copy value uses, across `text` and all plural forms, first seen first. */
export function copyPlaceholders(entry: string | CopyEntry): string[] {
  return [...new Set(copyTemplates(entry).flatMap(([, template]) => placeholdersIn(template)))];
}

export const componentDef = z
  .strictObject({
    name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
    category: z.enum(['action', 'typography', 'input', 'layout', 'feedback', 'navigation', 'container', 'overlay', 'data', 'primitive']),
    status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
    since: lifecycle.since,
    deprecated: deprecation.optional().describe("Why the component is on its way out and what replaces it (use names another component). Only with status: deprecated."),
    /** APG pattern slug this component implements, e.g. 'dialog-modal'. */
    apg: z.enum(APG_PATTERNS).optional().describe("Slug of the W3C ARIA Authoring Practices pattern this component implements, e.g. 'dialog-modal'. Behavior follows the APG when systems disagree."),
    anatomy: z.array(z.string()).min(1),
    parts: z.record(z.string(), partDef).optional().describe("Anatomy part → what it is: kind element, component (built from its composition entry) or slot (a named insertion point the consumer fills), with a slot's names across platforms. Parts not listed are components when composition names them and elements otherwise."),
    props: z.record(z.string(), propDef),
    events: z.record(z.string(), eventDef).default({}),
    styles: z.record(z.string(), styleBinding).default({}),
    constants: z
      .record(z.string().regex(/^[a-z][a-zA-Z0-9]*$/, 'Expected a camelCase constant name'), constantDef)
      .optional()
      .describe("Numbers the component's logic reads (a hover delay, a swipe threshold, a debounce): a token times multiply, or a literal value, with its unit. Not styles: a style binding is in styles."),
    a11y: a11yDef,
    keyboard: z.array(keyboardRule).optional().describe('The keyboard model, key → action, taken from the APG pattern. Generators implement every rule; the planned keyboard gate presses every key and checks the action.'),
    /** Anatomy part → the system component it must be built from. */
    composition: z.record(z.string(), compositionEntry).optional().describe("Anatomy part → the system component it MUST be built from (closeButton: Button, title: Heading), or { component, props?, forwards? } to also say which props the parent passes to it and which of the parent's styles bindings reach the child's overrides. Parts not listed are plain elements. The parser checks the component exists or is marked (planned)."),
    behavior: z.array(behaviorScenario).optional().describe('Authored given/when/then scenarios the behavior gate turns into tests on every platform. Schema-derived scenarios (renders, accessible name, focusable, error identified, one per enum value) are added by the parser; author only what the schema cannot infer.'),
    examples: z.array(componentExample).min(1).optional().describe('Authored usage examples: a kebab-case name, what it shows, the props it renders with, and optionally the platforms it applies on.'),
    /** Strings the component renders itself: a template string, or an entry that declares its params and plurals. */
    copy: z
      .record(z.string(), z.union([z.string(), copyEntry]))
      .optional()
      .describe('User-facing strings the component renders itself (validation messages, summary headings). Each is a template string, or { text | plural, params, description, platforms } that declares what each {placeholder} holds and the CLDR plural forms a count picks. A placeholder names a declared param or a prop ({label} reads the label prop). Generators must use these verbatim so copy is consistent across platforms and localizable in one place.'),
    form: formDef.optional(),
    overlay: overlayDef.optional(),
    platforms: z.partialRecord(platformId, platformNotes),
  })
  .check((ctx) => {
    // Cross-field rules that read only this block and the token manifest (schema/tokens.ts). Rules that need other docs
    // (file name, composition targets, target and keyboard operability through a composed component) stay in
    // tools/parse.ts.
    const c = ctx.value;
    const issue = (path: PropertyKey[], message: string): void => {
      ctx.issues.push({ code: 'custom', input: c, path, message });
    };
    const requires: readonly string[] = c.a11y.requires;
    const lacks = (req: string): boolean => !requires.includes(req);
    const requiresAt = (req: string): PropertyKey[] => ['a11y', 'requires', requires.indexOf(req)];
    const keyboard = c.keyboard ?? [];
    const composed = Object.values(c.composition ?? {}).some((entry) => compositionTarget(entry).component !== '');
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

    // Style bindings. Every prop referenced by a token slot must be an enum prop, on every token the binding can
    // resolve to, and every token it can resolve to is in the manifest; the part, platforms, by prop and computed
    // operands it names exist; and a binding that must lock derives no value below its token.
    const pairTokens = (c.a11y.contrast ?? []).flatMap((pair) => [pair.foreground, pair.background]);
    for (const [bName, binding] of Object.entries(c.styles)) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['styles', bName, ...rest];
      const slotRule = (token: string, path: PropertyKey[]): void => {
        for (const [, slot] of token.matchAll(SLOT)) {
          if (!Object.hasOwn(c.props, slot as string) || c.props[slot as string]?.type !== 'enum') {
            issue(path, `styles.${bName} interpolates '{${slot}}' but '${slot}' is not an enum prop`);
          }
        }
      };
      // A literal token is a token. An interpolated one resolves to a token for every combination of its slots' enum
      // values (a trailing `.default` dropped), except a combination holding a no-op value; the first combination that
      // does not is reported. A slot on a non-enum prop is slotRule's to report.
      const tokenRule = (token: string, path: PropertyKey[]): void => {
        const slotNames = [...token.matchAll(SLOT)].map((m) => m[1] as string);
        if (!slotNames.length) {
          if (!isToken(token)) issue(path, `${c.name}: styles.${bName} '${token}' is not a token`);
          return;
        }
        const slotProps = slotNames.map((s) => (Object.hasOwn(c.props, s) ? c.props[s] : undefined));
        if (slotProps.some((p) => p?.type !== 'enum')) return;
        for (const combo of product(slotProps.map((p) => [...enumValues(p ?? {})]))) {
          let ref = token;
          slotNames.forEach((s, i) => { ref = ref.replaceAll(`{${s}}`, combo[i] as string); });
          const pub = tokenPublicName(ref);
          if (!isToken(pub) && !combo.some((v) => NO_TOKEN_VALUES.has(v))) {
            issue(path, `${c.name}: styles.${bName} '${token}' → '${pub}' is not a token`);
            return;
          }
        }
      };
      slotRule(binding.token, at('token'));
      tokenRule(binding.token, at('token'));
      for (const [value, token] of Object.entries(binding.values ?? {})) {
        slotRule(token, at('values', value));
        tokenRule(token, at('values', value));
      }
      if (binding.part !== undefined && !anatomy.includes(binding.part)) issue(at('part'), `styles.${bName}.part '${binding.part}' is not in anatomy ${pyRepr(c.anatomy)}`);
      for (const [j, plat] of (binding.platforms ?? []).entries()) {
        if (!declared.has(plat)) issue(at('platforms', j), `styles.${bName} platforms includes '${plat}', which the component does not declare`);
      }
      const { by, values } = binding;
      if (by !== undefined && values === undefined) issue(at('by'), `styles.${bName}.by needs 'values'`);
      if (values !== undefined && by === undefined) issue(at('values'), `styles.${bName}.values needs 'by'`);
      if (by !== undefined) {
        const prop = Object.hasOwn(c.props, by) ? c.props[by] : undefined;
        const byValues: readonly string[] | null = prop?.type === 'enum' ? enumValues(prop) : prop?.type === 'boolean' ? ['true', 'false'] : null;
        if (byValues === null) issue(at('by'), `styles.${bName}.by '${by}' is not an enum or boolean prop`);
        for (const value of byValues === null ? [] : Object.keys(values ?? {})) {
          if (!byValues?.includes(value)) issue(at('values', value), `styles.${bName}.values has '${value}', which is not a value of '${by}' ${pyRepr(byValues)}`);
        }
        if (values !== undefined && binding.token.includes(`{${by}}`)) issue(at('token'), `styles.${bName} interpolates '{${by}}' and declares values by '${by}'; a binding uses one or the other`);
      }
      const computed = binding.computed;
      if (computed === undefined) continue;
      for (const side of ['plus', 'minus'] as const) {
        for (const [i, op] of (computed[side] ?? []).entries()) {
          if ('token' in op) {
            slotRule(op.token, at('computed', side, i, 'token'));
            tokenRule(op.token, at('computed', side, i, 'token'));
          } else if (op.binding === bName) issue(at('computed', side, i, 'binding'), `styles.${bName}.computed.${side}.${i}.binding names the binding itself`);
          else if (!Object.hasOwn(c.styles, op.binding)) issue(at('computed', side, i, 'binding'), `styles.${bName}.computed.${side}.${i}.binding names '${op.binding}', which is not a styles binding of this component`);
        }
      }
      const rule = lockRule(bName, bindingTokens(binding), pairTokens, c.props);
      if (rule !== null && computed.minus !== undefined) {
        issue(at('computed', 'minus'), `styles.${bName} must be locked (${rule}), so computed may not subtract: a derived value could shrink the guarantee below its token`);
      }
      if (rule !== null && computed.times !== undefined && computed.times < 1) {
        issue(at('computed', 'times'), `styles.${bName} must be locked (${rule}), so computed.times may not be below 1: a derived value could shrink the guarantee below its token`);
      }
    }
    // Computed bindings may lean on each other, but not in a circle. A cycle is reported once, on its member that
    // comes first in styles order.
    const bindingNames = Object.keys(c.styles);
    const leansOn = (bName: string): string[] => {
      const comp = c.styles[bName]?.computed;
      return [...(comp?.plus ?? []), ...(comp?.minus ?? [])].flatMap((op) => ('binding' in op && op.binding !== bName && Object.hasOwn(c.styles, op.binding) ? [op.binding] : []));
    };
    for (const [first, start] of bindingNames.entries()) {
      const seen = new Set<string>();
      const walk = (node: string, trail: string[]): string[] | null => {
        for (const next of leansOn(node)) {
          if (next === start) return trail;
          if (bindingNames.indexOf(next) <= first || seen.has(next)) continue;
          seen.add(next);
          const found = walk(next, [...trail, next]);
          if (found !== null) return found;
        }
        return null;
      };
      const cycle = walk(start, [start]);
      if (cycle !== null) issue(['styles', start, 'computed'], `styles.${start}.computed forms a cycle: ${[...cycle, start].join(' → ')}`);
    }
    // Constants: a token constant names a real token, and a constant does not share a name with a styles binding.
    for (const [kName, k] of Object.entries(c.constants ?? {})) {
      if (Object.hasOwn(c.styles, kName)) issue(['constants', kName], `constants.${kName} collides with styles.${kName}`);
      const token = k.token;
      if (token === undefined) continue;
      let refs: string[];
      try {
        refs = token.includes('{') ? expand(token, c.props) : [token];
      } catch {
        continue;
      }
      if (refs.some((ref) => !isToken(ref))) issue(['constants', kName, 'token'], `${c.name}: constants.${kName} '${token}' is not a token`);
    }
    // Lifecycle: a deprecated component says so in status, and a deprecated prop or event points at another prop or
    // event of this component. A component's use names another doc, so tools/parse.ts checks it.
    if (c.deprecated !== undefined && c.status !== 'deprecated') issue(['deprecated'], `has a deprecated block but status is '${c.status}'`);
    for (const section of ['props', 'events'] as const) {
      for (const [itemName, item] of Object.entries(c[section])) {
        const use = item.deprecated?.use;
        if (use !== undefined && (use === itemName || (!Object.hasOwn(c.props, use) && !Object.hasOwn(c.events, use)))) {
          issue([section, itemName, 'deprecated', 'use'], `${section}.${itemName}.deprecated.use names '${use}', which is not another prop or event of this component`);
        }
      }
    }
    // Composition parts must be anatomy parts.
    for (const part of Object.keys(c.composition ?? {})) {
      if (!anatomy.includes(part)) issue(['composition', part], `composition.${part} is not in anatomy ${pyRepr(c.anatomy)}`);
    }
    // An object entry names this component's props and bindings; what it names on the child needs the child doc, so
    // tools/parse.ts checks that half.
    for (const [part, entry] of Object.entries(c.composition ?? {})) {
      if (typeof entry === 'string') continue;
      for (const [key, value] of Object.entries(entry.props ?? {})) {
        if (typeof value === 'object' && !Object.hasOwn(c.props, value.from)) {
          issue(['composition', part, 'props', key, 'from'], `composition.${part}.props.${key}.from names '${value.from}', which is not a prop of this component`);
        }
      }
      for (const binding of Object.keys(entry.forwards ?? {})) {
        if (!Object.hasOwn(c.styles, binding)) issue(['composition', part, 'forwards', binding], `composition.${part}.forwards.${binding} is not a styles binding of this component`);
      }
    }
    // Part kinds: a declared part is an anatomy part, agrees with composition, and a slot names a content prop and
    // resolves to one valid, distinct name on each platform.
    const parts = c.parts ?? {};
    const slotParts = new Set(Object.entries(parts).filter(([, p]) => p.kind === 'slot').map(([pName]) => pName));
    const isContentProp = (propName: string): boolean => Object.hasOwn(c.props, propName) && c.props[propName]?.type === 'content';
    let defaultSlot: string | null = null;
    const slotNames = new Map<string, string>(); // `${platform}\0${name}` → the part that resolved to it
    for (const [pName, p] of Object.entries(parts)) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['parts', pName, ...rest];
      const where = `parts.${pName}`;
      if (!anatomy.includes(pName)) issue(at(), `${where} is not in anatomy ${pyRepr(c.anatomy)}`);
      const entry = c.composition !== undefined && Object.hasOwn(c.composition, pName) ? c.composition[pName] : undefined;
      if (p.kind === 'component' && entry === undefined) issue(at('kind'), `${where} is kind 'component' but composition has no entry for '${pName}'`);
      if (p.kind !== 'component' && entry !== undefined) issue(at('kind'), `${where} is kind '${p.kind}' but composition builds it from ${compositionTarget(entry).component}, so its kind is 'component'`);
      if (p.slot !== undefined && p.kind !== 'slot') issue(at('slot'), `${where}.slot needs kind 'slot', got '${p.kind}'`);
      if (p.kind !== 'slot') continue;
      const slot = p.slot ?? {};
      if (slot.prop !== undefined) {
        if (!isContentProp(slot.prop)) issue(at('slot', 'prop'), `${where}.slot.prop names '${slot.prop}', which is not a content prop`);
      } else {
        const byName = new Map<string, string[]>();
        for (const plat of (['web', 'rn'] as const).filter((pl) => declared.has(pl))) {
          const propName = slotName(c, pName, plat);
          byName.set(propName, [...(byName.get(propName) ?? []), plat]);
        }
        for (const [propName, plats] of byName) {
          if (!isContentProp(propName)) issue(p.slot === undefined ? at() : at('slot'), `${where} resolves to '${propName}' on ${plats.join(' and ')}, which is not a content prop (name one with slot.prop)`);
        }
      }
      if (slot.default === true) {
        if (defaultSlot !== null) issue(at('slot', 'default'), `${where} is a second default slot; parts.${defaultSlot} is already the default`);
        else defaultSlot = pName;
      }
      for (const [plat, slotLabel] of Object.entries(slot.platforms ?? {})) {
        const platAt = at('slot', 'platforms', plat);
        if (!declared.has(plat)) issue(platAt, `${where}.slot.platforms has '${plat}', which the component does not declare`);
        else if (plat === 'lit' && slot.default === true) issue(platAt, `${where} is the default slot, which has no Lit name`);
        else if (plat === 'lit' && !LIT_SLOT_NAME.test(slotLabel)) issue(platAt, `${where}.slot.platforms.lit '${slotLabel}' is not a Lit slot name (lowercase letters, digits and dashes)`);
        else if (plat !== 'lit' && !IDENTIFIER.test(slotLabel)) issue(platAt, `${where}.slot.platforms.${plat} '${slotLabel}' is not an identifier`);
      }
      for (const plat of declared) {
        const resolvedName = slotName(c, pName, plat);
        const other = slotNames.get(`${plat}\0${resolvedName}`);
        if (other !== undefined) issue(at(), `${where} resolves to '${resolvedName}' on ${plat}, as parts.${other} does`);
        else slotNames.set(`${plat}\0${resolvedName}`, pName);
      }
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
        const notRoles = enumValues(prop).filter((v) => !roleIn(ARIA_ROLES, v));
        if (notRoles.length) issue(['a11y', 'roleFrom'], `a11y.roleFrom '${roleFrom}' has values that are not ARIA roles: ${pyRepr(notRoles)}`);
      }
    }
    // Every event must map (or be explicitly unsupported) on every platform declared for the component.
    for (const [evName, ev] of Object.entries(c.events)) {
      for (const [platform, notes] of Object.entries(c.platforms)) {
        if (notes?.supported !== false && !Object.hasOwn(ev.platforms, platform)) issue(['events', evName, 'platforms'], `events.${evName} has no mapping for platform '${platform}'`);
      }
    }
    // Event contracts (schema/events.ts): the payload carries the reasons, a controlled reason needs a controlled
    // source, nothing is left to veto after the change, and timing.before orders distinct events of this component
    // one way.
    const eventNames = Object.keys(c.events);
    for (const [evName, ev] of Object.entries(c.events)) {
      const evAt = (...rest: PropertyKey[]): PropertyKey[] => ['events', evName, ...rest];
      const reasonKeys = ev.reasons === undefined ? null : Object.keys(ev.reasons);
      if (reasonKeys !== null && ev.payload !== undefined) {
        const i = ev.payload.findIndex((f) => f.name === 'reason');
        const field = ev.payload[i];
        const values: readonly string[] = field?.values ?? [];
        if (field === undefined) {
          issue(evAt('payload'), `events.${evName} declares reasons but its payload has no 'reason' field`);
        } else if (field.type !== 'enum') {
          issue(evAt('payload', i, 'type'), `events.${evName} payload field 'reason' must be an enum of its reasons, got '${field.type}'`);
        } else if (values.length !== reasonKeys.length || !reasonKeys.every((r) => values.includes(r))) {
          issue(evAt('payload', i, 'values'), `events.${evName} payload field 'reason' values ${pyRepr(values)} are not its reasons ${pyRepr(reasonKeys)}`);
        }
      }
      if (reasonKeys?.includes('controlled') && ev.fires !== undefined && !ev.fires.includes('controlled')) {
        issue(evAt('fires'), `events.${evName} has a 'controlled' reason but fires lacks 'controlled'`);
      }
      if (ev.cancelable === true && ev.timing?.phase === 'after-change') {
        issue(evAt('cancelable'), `events.${evName} is cancelable but fires after-change, when nothing is left to cancel`);
      }
      for (const [j, other] of (ev.timing?.before ?? []).entries()) {
        if (other === evName) {
          issue(evAt('timing', 'before', j), `events.${evName} timing.before names the event itself`);
        } else if (!Object.hasOwn(c.events, other)) {
          issue(evAt('timing', 'before', j), `events.${evName} timing.before names '${other}', which is not an event of this component`);
        } else if (eventNames.indexOf(other) < eventNames.indexOf(evName) && (c.events[other]?.timing?.before ?? []).includes(evName)) {
          // Reported once, on the later of the two.
          issue(evAt('timing', 'before', j), `events.${evName} and events.${other} each list the other in timing.before`);
        }
      }
    }
    // Controlled props: what `controls` names exists, the default prop can stand in for the controlled one, and a
    // controlled prop has no default of its own, since a default would make every instance controlled.
    const seededBy = new Map<string, string>();
    for (const [pName, p] of Object.entries(c.props)) {
      const controls = p.controls;
      if (controls === undefined) continue;
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['props', pName, ...rest];
      const where = `props.${pName}.controls`;
      if (!Object.hasOwn(c.events, controls.event)) issue(at('controls', 'event'), `${where}.event names '${controls.event}', which is not an event of this component`);
      if (p.default !== undefined) issue(at('default'), `${where}: a controlled prop takes no default, because a default would make every instance controlled`);
      if (controls.state !== undefined && p.type !== 'boolean') issue(at('controls', 'state'), `${where}.state '${controls.state}' needs a boolean prop, got '${p.type}'`);
      const dName = controls.default;
      if (dName === undefined) continue;
      const dAt = at('controls', 'default');
      const d = Object.hasOwn(c.props, dName) ? c.props[dName] : undefined;
      if (dName === pName) {
        issue(dAt, `${where}.default names the prop itself`);
        continue;
      }
      if (d === undefined) {
        issue(dAt, `${where}.default names '${dName}', which is not a prop`);
        continue;
      }
      const other = seededBy.get(dName);
      if (other !== undefined) issue(dAt, `${where}.default '${dName}' already seeds props.${other}`);
      else seededBy.set(dName, pName);
      if (d.type !== p.type) {
        issue(dAt, `${where}.default '${dName}' is type '${d.type}', not '${p.type}'`);
      } else if ((d.shape !== undefined || p.shape !== undefined) && d.shape !== p.shape) {
        issue(dAt, `${where}.default '${dName}' has shape ${pyRepr(d.shape ?? null)}, not ${pyRepr(p.shape ?? null)}`);
      } else if (p.type === 'enum') {
        const values = enumValues(p);
        const dValues = enumValues(d);
        if (values.length !== dValues.length || !values.every((v) => dValues.includes(v))) {
          issue(dAt, `${where}.default '${dName}' has values ${pyRepr(dValues)}, not ${pyRepr(values)}`);
        }
      }
      if (d.required) issue(dAt, `${where}.default '${dName}' is required, but it is only read when '${pName}' is omitted`);
      if (d.controls !== undefined) issue(dAt, `${where}.default '${dName}' declares controls itself`);
      if (d.platforms !== undefined && p.platforms !== undefined && !d.platforms.every((plat) => (p.platforms as readonly string[]).includes(plat))) {
        issue(dAt, `${where}.default '${dName}' platforms ${pyRepr(d.platforms)} are not within ${pyRepr(p.platforms)}`);
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
    // A non-text pair has one threshold, 3:1 at AA; `only` narrows the enum props the pair's own slots expand over.
    for (const [i, pair] of contrast.entries()) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['a11y', 'contrast', i, ...rest];
      if (pair.nonText === true && pair.large) issue(at('large'), "a nonText pair has no large-text threshold; remove 'large'");
      if (pair.nonText === true && pair.level === 'AAA') issue(at('level'), 'WCAG 1.4.11 has no AAA level; a nonText pair is checked at 3:1 — use level AA');
      // Every token the pair expands to (over `only`, as tools/check_contrast.ts reads it) is in the manifest. A slot on
      // a non-enum prop has nothing to expand over and is left to the contrast checker.
      for (const field of ['foreground', 'background', 'surface'] as const) {
        const token = pair[field];
        if (token === undefined) continue;
        let refs: string[];
        try {
          refs = expand(token, c.props, pair.only);
        } catch {
          continue;
        }
        const unknown = refs.find((ref) => !isToken(ref));
        if (unknown !== undefined) issue(at(field), `${c.name}: a11y.contrast[${i}].${field} '${unknown}' is not a token`);
      }
      const slots = new Set([...`${pair.foreground} ${pair.background}`.matchAll(SLOT)].map((m) => m[1] as string));
      for (const [key, values] of Object.entries(pair.only ?? {})) {
        const prop = Object.hasOwn(c.props, key) ? c.props[key] : undefined;
        if (!slots.has(key)) {
          issue(at('only', key), `a11y.contrast.${i}.only has '${key}', which is not a {slot} in its foreground or background`);
        } else if (prop?.type !== 'enum') {
          issue(at('only', key), `a11y.contrast.${i}.only '${key}' is not an enum prop`);
        } else {
          const propValues = enumValues(prop);
          for (const [j, value] of values.entries()) {
            if (!propValues.includes(value)) issue(at('only', key, j), `a11y.contrast.${i}.only.${key} has '${value}', which is not one of ${pyRepr(propValues)}`);
          }
        }
      }
    }
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

    // Copy entries in the object form: one of text and plural, a plural picked by a number param, and params that
    // match the placeholders. A placeholder may read a prop instead ({label}). A plain string has nowhere to declare
    // a param, so componentWarnings reports its placeholders.
    for (const [key, entry] of Object.entries(c.copy ?? {})) {
      if (typeof entry === 'string') continue;
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['copy', key, ...rest];
      const params = entry.params ?? {};
      if ((entry.text === undefined) === (entry.plural === undefined)) issue(at(), `copy.${key} needs exactly one of 'text' and 'plural'`);
      const by = entry.plural?.by;
      if (by !== undefined && (!Object.hasOwn(params, by) || params[by]?.type !== 'number')) {
        issue(at('plural', 'by'), `copy.${key}.plural.by names '${by}', which is not a number param`);
      }
      const used = new Set<string>(by === undefined ? [] : [by]);
      for (const [path, template] of copyTemplates(entry)) {
        for (const placeholder of placeholdersIn(template)) {
          used.add(placeholder);
          if (!Object.hasOwn(params, placeholder) && !Object.hasOwn(c.props, placeholder)) {
            issue(at(...path), `copy.${key} uses '{${placeholder}}', which is not a declared param or a prop`);
          }
        }
      }
      for (const param of Object.keys(params)) {
        if (!used.has(param)) issue(at('params', param), `copy.${key}.params.${param} is declared but no placeholder or plural.by uses it`);
      }
    }

    // The form block names this component's props and copy, and its value prop can hold its value type.
    const propOf = (propName: string): (typeof c.props)[string] | undefined => (Object.hasOwn(c.props, propName) ? c.props[propName] : undefined);
    const form = c.form;
    if (form !== undefined) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['form', ...rest];
      if (form.role === 'field' && form.value === undefined) issue(at(), "form.role is 'field' but form has no 'value'");
      if (form.role === 'field' && form.valueType === undefined) issue(at(), "form.role is 'field' but form has no 'valueType'");
      for (const key of ['value', 'name'] as const) {
        const propName = form[key];
        if (propName !== undefined && propOf(propName) === undefined) issue(at(key), `form.${key} '${propName}' is not a prop`);
      }
      const valueProp = form.value === undefined ? undefined : propOf(form.value);
      if (valueProp !== undefined && form.valueType === 'boolean' && valueProp.type !== 'boolean') {
        issue(at('valueType'), `form.valueType 'boolean' needs a boolean value prop, but '${form.value}' is type '${valueProp.type}'`);
      }
      if (valueProp !== undefined && form.valueType !== undefined && COMPOUND_VALUE_TYPES.includes(form.valueType) && !COMPOUND_PROP_TYPES.includes(valueProp.type)) {
        issue(at('valueType'), `form.valueType '${form.valueType}' needs a union, array or object value prop, but '${form.value}' is type '${valueProp.type}'`);
      }
      const requiredAt = (form.validation ?? []).indexOf('required');
      if (requiredAt >= 0 && propOf('required') === undefined) issue(at('validation', requiredAt), "form.validation has 'required' but props has no 'required'");
      for (const [check, key] of Object.entries(form.messages ?? {})) {
        if (key !== undefined && !Object.hasOwn(c.copy ?? {}, key)) issue(at('messages', check), `form.messages.${check} names '${key}', which is not a copy key`);
      }
    }

    // The overlay block names this component's anatomy, props and events, and declares the requirements its
    // dismissal and modality imply.
    const overlay = c.overlay;
    if (overlay !== undefined) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['overlay', ...rest];
      if (overlay.anchor !== undefined && !anatomy.includes(overlay.anchor)) issue(at('anchor'), `overlay.anchor '${overlay.anchor}' is not in anatomy ${pyRepr(c.anatomy)}`);
      if (overlay.placement !== undefined && propOf(overlay.placement)?.type !== 'enum') issue(at('placement'), `overlay.placement '${overlay.placement}' is not an enum prop`);
      if (overlay.collision !== undefined && overlay.anchor === undefined) issue(at('collision'), `overlay.collision '${overlay.collision}' needs 'anchor'`);
      if (overlay.open !== undefined && propOf(overlay.open)?.type !== 'boolean') issue(at('open'), `overlay.open '${overlay.open}' is not a boolean prop`);
      if (overlay.closeEvent !== undefined && !Object.hasOwn(c.events, overlay.closeEvent)) issue(at('closeEvent'), `overlay.closeEvent '${overlay.closeEvent}' is not an event of this component`);
      const escapeAt = (overlay.dismiss ?? []).indexOf('escape');
      if (escapeAt >= 0 && lacks('escape-dismiss')) issue(at('dismiss', escapeAt), "overlay.dismiss has 'escape' but a11y.requires lacks 'escape-dismiss'");
      const missing = overlay.modal === true ? MODAL_REQUIRES.filter(lacks) : [];
      if (missing.length) issue(at('modal'), `overlay.modal is true but a11y.requires lacks ${missing.map((r) => `'${r}'`).join(', ')}`);
    }

    // Per-platform narrowing: a narrowed requirement is one the component requires, a narrowed value is a value of an
    // enum prop, and every narrowing list stays within the platforms the component, and the prop, declare.
    // (styles.<b>.platforms is checked with the bindings above.)
    const narrowRule = (plats: readonly string[], path: PropertyKey[], where: string, prop?: { name: string; platforms?: readonly string[] | undefined }): void => {
      for (const [j, plat] of plats.entries()) {
        if (!declared.has(plat)) issue([...path, j], `${where} includes '${plat}', which the component does not declare`);
        else if (prop?.platforms !== undefined && !prop.platforms.includes(plat)) issue([...path, j], `${where} includes '${plat}', which props.${prop.name}.platforms ${pyRepr(prop.platforms)} does not`);
      }
    };
    for (const [req, plats] of Object.entries(c.a11y.requiresOn ?? {})) {
      const at: PropertyKey[] = ['a11y', 'requiresOn', req];
      if (!requires.includes(req)) issue(at, `a11y.requiresOn has '${req}', which a11y.requires does not list`);
      narrowRule(plats ?? [], at, `a11y.requiresOn.${req}`);
    }
    for (const [pName, p] of Object.entries(c.props)) {
      if (p.valuesOn === undefined) continue;
      const at: PropertyKey[] = ['props', pName, 'valuesOn'];
      if (p.type !== 'enum') {
        issue(at, `props.${pName}.valuesOn needs an enum prop, got '${p.type}'`);
        continue;
      }
      const values = enumValues(p);
      for (const [value, plats] of Object.entries(p.valuesOn)) {
        if (!values.includes(value)) issue([...at, value], `props.${pName}.valuesOn has '${value}', which is not one of ${pyRepr(values)}`);
        narrowRule(plats, [...at, value], `props.${pName}.valuesOn.${value}`, { name: pName, platforms: p.platforms });
      }
    }
    for (const [key, entry] of Object.entries(c.copy ?? {})) {
      if (typeof entry !== 'string' && entry.platforms !== undefined) narrowRule(entry.platforms, ['copy', key, 'platforms'], `copy.${key} platforms`);
    }

    // An object reflect entry names a prop, and a boolean that defaults to true reflects to its negated attribute
    // (prompts/conventions/lit.md). The string form stays valid; componentWarnings reports what it gets wrong.
    for (const [plat, notes] of Object.entries(c.platforms)) {
      for (const [i, entry] of (notes?.reflect ?? []).entries()) {
        if (typeof entry === 'string') continue;
        const at: PropertyKey[] = ['platforms', plat, 'reflect', i];
        const prop = propOf(entry.prop);
        if (prop === undefined) {
          issue([...at, 'prop'], `platforms.${plat}.reflect.${i}.prop names '${entry.prop}', which is not a prop`);
        } else if (prop.type === 'boolean' && prop.default === true && entry.attribute === kebabCase(entry.prop)) {
          issue([...at, 'attribute'], `platforms.${plat}.reflect.${i} reflects '${entry.prop}' as '${entry.attribute}', but '${entry.prop}' defaults to true, so its attribute is the negated form (prompts/conventions/lit.md)`);
        }
      }
    }

    /** Props named with values (a scenario's `given` and `when.set`, a keyboard rule's `given`) exist and the values
     *  fit their types. `subject` opens each message; `urlSafe` also requires a value a Storybook URL arg can carry. */
    const propValueRule = (subject: string, path: PropertyKey[], where: string, values: Record<string, unknown>, urlSafe = false): void => {
      for (const [propName, value] of Object.entries(values)) {
        const prop = Object.hasOwn(c.props, propName) ? c.props[propName] : undefined;
        if (prop === undefined) {
          issue([...path, propName], `${subject} ${where}: unknown prop '${propName}'`);
        } else if (prop.type === 'enum' && !enumValues(prop).includes(value as string)) {
          issue([...path, propName], `${subject} ${where}.${propName}: '${String(value)}' is not one of ${pyRepr(enumValues(prop))}`);
        } else if (prop.type === 'integer' && (typeof value !== 'number' || !Number.isInteger(value))) {
          issue([...path, propName], `${subject} ${where}.${propName} must be an integer, got ${pyRepr(value)}`);
        } else if ((prop.type === 'boolean' || prop.type === 'string' || prop.type === 'number') && typeof value !== prop.type) {
          issue([...path, propName], `${subject} ${where}.${propName} must be a ${prop.type}, got ${pyRepr(value)}`);
        } else if (prop.type === 'union' && !isJsonValue(value)) {
          // The shape is TypeScript-like prose, not a type this check can read, so any JSON value passes.
          issue([...path, propName], `${subject} ${where}.${propName} must be a JSON value (${String(prop.shape)}), got ${pyRepr(value)}`);
        } else if (urlSafe && !isStoryArg(value)) {
          issue([...path, propName], `${subject} ${where}.${propName} must be a boolean, a number, or a string of letters, digits, spaces, _ and - (it travels in a Storybook URL), got ${pyRepr(value)}`);
        }
      }
    };

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
      for (const [path, where, values] of propValues) propValueRule(`scenario '${scName}'`, at(...path), where, values);

      for (const key of ['click', 'focus', 'hover']) {
        if (key in when && !anatomy.includes(when[key] as string)) issue(at('when', key), `scenario '${scName}' when.${key}: unknown anatomy part '${String(when[key])}'`);
        else if (key in when && slotParts.has(when[key] as string)) issue(at('when', key), `scenario '${scName}' when.${key}: '${String(when[key])}' is a slot, which renders no element of its own`);
      }
      if ('key' in when && (scenarioPlatforms !== null ? scenarioPlatforms.includes('rn') : declared.has('rn'))) {
        issue(at('when', 'key'), `scenario '${scName}' uses when.key but React Native has no keyboard — narrow platforms to exclude 'rn'`);
      }

      for (const [k, clause] of sc.then.entries()) {
        const item = clause as Record<string, unknown>;
        if ('event' in item && !Object.hasOwn(c.events, item.event as string)) issue(at('then', k, 'event'), `scenario '${scName}' then.event: unknown event '${String(item.event)}'`);
        // An object `with` is keyed by payload field names and its reason is a declared reason; with exactly one
        // payload field, `with` is that field's value and is not read here.
        const ev = 'event' in item && Object.hasOwn(c.events, item.event as string) ? c.events[item.event as string] : undefined;
        const withValue = item.with;
        if (ev !== undefined && ev.payload?.length !== 1 && withValue !== null && typeof withValue === 'object' && !Array.isArray(withValue)) {
          const w = withValue as Record<string, unknown>;
          if (ev.reasons !== undefined && 'reason' in w && (typeof w.reason !== 'string' || !Object.hasOwn(ev.reasons, w.reason))) {
            issue(at('then', k, 'with', 'reason'), `scenario '${scName}' then.with.reason: ${pyRepr(w.reason)} is not one of events.${String(item.event)} reasons ${pyRepr(Object.keys(ev.reasons))}`);
          }
          const fields = (ev.payload ?? []).map((f) => f.name);
          if (fields.length >= 2) {
            for (const key of Object.keys(w)) {
              if (!fields.includes(key)) issue(at('then', k, 'with', key), `scenario '${scName}' then.with.${key}: not a payload field of events.${String(item.event)} ${pyRepr(fields)}`);
            }
          }
        }
        if ('focused' in item && !anatomy.includes(item.focused as string) && !(BEHAVIOR_FOCUS_TARGETS as readonly string[]).includes(item.focused as string)) {
          issue(at('then', k, 'focused'), `scenario '${scName}' then.focused: unknown anatomy part '${String(item.focused)}'`);
        } else if ('focused' in item && slotParts.has(item.focused as string)) {
          issue(at('then', k, 'focused'), `scenario '${scName}' then.focused: '${String(item.focused)}' is a slot, which renders no element of its own`);
        }
        if (item.on !== undefined && !anatomy.includes(item.on as string)) issue(at('then', k, 'on'), `scenario '${scName}' then.attribute.on: unknown anatomy part '${String(item.on)}'`);
        else if (item.on !== undefined && slotParts.has(item.on as string)) issue(at('then', k, 'on'), `scenario '${scName}' then.attribute.on: '${String(item.on)}' is a slot, which renders no element of its own`);
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

    // Examples: unique names, declared platforms, and a `given` checked as a scenario's is.
    const exampleNames = new Set<string>();
    for (const [i, ex] of (c.examples ?? []).entries()) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['examples', i, ...rest];
      if (exampleNames.has(ex.name)) issue(at('name'), `duplicate example '${ex.name}'`);
      exampleNames.add(ex.name);
      for (const [j, plat] of (ex.platforms ?? []).entries()) {
        if (!declared.has(plat)) issue(at('platforms', j), `example '${ex.name}' platforms includes '${plat}', which the component does not declare`);
      }
      propValueRule(`example '${ex.name}'`, at('given'), 'given', ex.given);
    }

    // Keyboard rules: the props, part and platforms the gate reads exist, and the outcomes can all hold after the
    // same presses.
    for (const [i, rule] of keyboard.entries()) {
      const at = (...rest: PropertyKey[]): PropertyKey[] => ['keyboard', i, ...rest];
      const subject = `keyboard rule ${i}`;
      const outcomes = expectList(rule);
      propValueRule(subject, at('given'), 'given', rule.given ?? {}, true);
      if (rule.target !== undefined) {
        if (!anatomy.includes(rule.target)) issue(at('target'), `${subject} target: unknown anatomy part '${rule.target}'`);
        if (!outcomes.includes('closes') && !outcomes.includes('opens')) issue(at('target'), `${subject} target '${rule.target}' needs closes or opens in expect, got ${pyRepr(outcomes)}`);
      }
      for (const [j, plat] of (rule.platforms ?? []).entries()) {
        if (!declared.has(plat)) issue(at('platforms', j), `${subject} platforms includes '${plat}', which the component does not declare`);
      }
      if (Array.isArray(rule.expect)) {
        for (const [j, outcome] of outcomes.entries()) {
          if (outcomes.indexOf(outcome) < j) issue(at('expect', j), `${subject} expect lists '${outcome}' twice`);
        }
        if (outcomes.includes('closes') && outcomes.includes('opens')) issue(at('expect'), `${subject} expect has both 'closes' and 'opens'`);
      }
      if (rule.repeat !== undefined && rule.repeat > 1 && !outcomes.includes('focus-next') && !outcomes.includes('focus-prev')) {
        issue(at('repeat'), `${subject} repeat ${rule.repeat} needs focus-next or focus-prev in expect, got ${pyRepr(outcomes)}`);
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

/** A finding about one component that does not fail the parse: `path` is the dotted field path (`keyboard.3.target`). */
export type ComponentWarning = { path: string; message: string };

/** Warnings about one parsed component, for rules on their way to becoming errors (a phase 2 check lands here one
 *  job before the doc migration that satisfies it). Pure, so a test can run it over generated/components.json.
 *  Not a Zod `.check`: Zod issues are errors. tools/parse.ts forwards each through its `warn` channel. */
export function componentWarnings(c: ComponentDef): ComponentWarning[] {
  return [...conventionDrift(c), ...orphanDefaults(c), ...untargetedKeyboardRules(c), ...missingFormOrOverlay(c), ...undeclaredCopyPlaceholders(c), ...missingCopyKeys(c), ...reflectWarnings(c), ...unreflectedSlots(c), ...largeNonTextPairs(c), ...vocabSubsets(c), ...lifecycleWarnings(c)];
}

type Deprecatable = { deprecated?: { use?: string | undefined } | undefined };

/** What a doc can live with while callers move off something deprecated: a default that is a deprecated value, a
 *  deprecated prop that is still required, status deprecated with no deprecated block, a `use` that points at
 *  something itself deprecated, and an authored scenario or example that renders with a deprecated prop or value. */
function lifecycleWarnings(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  const props = c.props;
  // generated/components.json leaves out an empty events block, which parsing would default.
  const events = c.events ?? {};
  const deprecatedValue = (p: (typeof props)[string], value: unknown): boolean =>
    typeof value === 'string' && p.valueLifecycle !== undefined && Object.hasOwn(p.valueLifecycle, value) && p.valueLifecycle[value]?.deprecated !== undefined;
  const deprecatedIn = (items: Record<string, Deprecatable>, itemName: string): boolean => Object.hasOwn(items, itemName) && items[itemName]?.deprecated !== undefined;

  if (c.status === 'deprecated' && c.deprecated === undefined) {
    out.push({ path: 'status', message: "is 'deprecated' but there is no deprecated block, so nothing says why or what replaces it" });
  }
  for (const [pName, p] of Object.entries(props)) {
    if (deprecatedValue(p, p.default)) out.push({ path: `props.${pName}.default`, message: `'${String(p.default)}' is a deprecated value` });
    if (p.required && p.deprecated !== undefined) out.push({ path: `props.${pName}.required`, message: 'is required but deprecated, so a caller cannot stop passing it' });
    for (const [value, life] of Object.entries(p.valueLifecycle ?? {})) {
      const use = life.deprecated?.use;
      if (use !== undefined && use !== value && deprecatedValue(p, use)) out.push({ path: `props.${pName}.valueLifecycle.${value}.deprecated.use`, message: `names '${use}', which is itself deprecated` });
    }
  }
  const useRule = (section: string, items: Record<string, Deprecatable>): void => {
    for (const [itemName, item] of Object.entries(items)) {
      const use = item.deprecated?.use;
      if (use !== undefined && use !== itemName && (deprecatedIn(props, use) || deprecatedIn(events, use))) {
        out.push({ path: `${section}.${itemName}.deprecated.use`, message: `names '${use}', which is itself deprecated` });
      }
    }
  };
  useRule('props', props);
  useRule('events', events);
  const givenRule = (path: string, subject: string, given: Record<string, unknown>): void => {
    for (const [pName, value] of Object.entries(given)) {
      const p = Object.hasOwn(props, pName) ? props[pName] : undefined;
      if (p?.deprecated !== undefined) out.push({ path: `${path}.${pName}`, message: `${subject} sets '${pName}', which is deprecated` });
      else if (p !== undefined && deprecatedValue(p, value)) out.push({ path: `${path}.${pName}`, message: `${subject} sets '${pName}' to '${String(value)}', which is a deprecated value` });
    }
  };
  for (const [i, sc] of (c.behavior ?? []).entries()) {
    if (sc.derived !== true) givenRule(`behavior.${i}.given`, `scenario '${sc.name}'`, sc.given ?? {});
  }
  for (const [i, ex] of (c.examples ?? []).entries()) givenRule(`examples.${i}.given`, `example '${ex.name}'`, ex.given);
  return out;
}

/** An enum prop with no `enumRef` whose values all belong to one vocabulary (the first, in VOCAB order, that holds
 *  them): the doc spells out a list the vocabulary already names. */
function vocabSubsets(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  for (const [name, p] of Object.entries(c.props)) {
    const values = p.values;
    if (p.type !== 'enum' || p.enumRef !== undefined || values === undefined || values.length === 0) continue;
    const vocab = VOCAB_NAMES.find((v) => values.every((value) => (VOCAB[v] as readonly string[]).includes(value)));
    if (vocab !== undefined) out.push({ path: `props.${name}.values`, message: `values are a subset of VOCAB.${vocab}; set enumRef: ${vocab}` });
  }
  return out;
}

/** Token families that are never text: boundaries, controls, inverse status indicators, icons and focus colors. */
const NON_TEXT_FOREGROUND = /^color\.(border|control|inverse\.status)\.|\.(icon|focus)$/;

/** A `large: true` pair whose foreground is a non-text token: large text standing in for WCAG 1.4.11's 3:1. */
function largeNonTextPairs(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  for (const [i, pair] of (c.a11y.contrast ?? []).entries()) {
    if (pair.large !== true || pair.nonText !== undefined || !NON_TEXT_FOREGROUND.test(pair.foreground)) continue;
    out.push({ path: `a11y.contrast.${i}.large`, message: `large: true on a non-text pair (${pair.foreground}); WCAG 1.4.11 pairs set nonText: true` });
  }
  return out;
}

/** A string reflect entry that resolves to a boolean prop defaulting to true, which the Lit convention exposes and
 *  reflects negated; and a string entry that resolves to no prop, which leaves the generator to guess the mapping. */
function reflectWarnings(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  for (const [plat, notes] of Object.entries(c.platforms)) {
    for (const [i, entry] of (notes?.reflect ?? []).entries()) {
      if (typeof entry !== 'string') continue;
      const path = `platforms.${plat}.reflect.${i}`;
      const resolved = reflectEntry(c, entry);
      const prop = resolved === null ? undefined : c.props[resolved.prop];
      if (resolved === null) {
        out.push({ path, message: `reflects '${entry}', which resolves to no prop; write { prop, attribute } to name the prop it reflects` });
      } else if (prop?.type === 'boolean' && prop.default === true) {
        out.push({ path, message: `reflects '${entry}' un-negated, but '${resolved.prop}' defaults to true (prompts/conventions/lit.md: reflect the negated attribute)` });
      }
    }
  }
  return out;
}

/** A binding token that interpolates `{p}` on a component with a supported Lit block whose reflect list does not
 *  resolve `p`: the element has no host attribute to select the token by. A binding narrowed away from Lit is skipped. */
function unreflectedSlots(c: ComponentDef): ComponentWarning[] {
  const lit = c.platforms.lit;
  if (lit === undefined || lit.supported === false) return [];
  const reflected = new Set((lit.reflect ?? []).flatMap((entry) => reflectEntry(c, entry)?.prop ?? []));
  const out: ComponentWarning[] = [];
  // generated/components.json leaves out an empty styles block, which parsing would default.
  for (const [bName, binding] of Object.entries(c.styles ?? {})) {
    if (binding.platforms !== undefined && !binding.platforms.includes('lit')) continue;
    const slots = new Set([...binding.token.matchAll(SLOT)].map((m) => m[1] as string));
    for (const slot of slots) {
      if (!reflected.has(slot)) out.push({ path: `styles.${bName}.token`, message: `interpolates '{${slot}}', but platforms.lit.reflect does not resolve '${slot}', so the Lit element has no attribute to select the token by` });
    }
  }
  return out;
}

type NarrowSource = {
  props?: Record<string, { values?: readonly string[] | undefined; enumRef?: string | undefined; valuesOn?: Record<string, readonly string[]> | undefined }> | undefined;
  a11y?: { requires?: readonly string[] | undefined; requiresOn?: Partial<Record<string, readonly string[]>> | undefined } | undefined;
  copy?: Record<string, string | { platforms?: readonly string[] | undefined }> | undefined;
  styles?: Record<string, { platforms?: readonly string[] | undefined }> | undefined;
};

/** The component as one platform sees it: a copy without every requirement (`a11y.requiresOn`), enum value
 *  (`valuesOn`), copy entry and style binding narrowed away from `platform`. The narrowing keys stay, and props that
 *  `propDef.platforms` narrows are left alone (their readers mark or skip them). Pure: `c` is not modified. */
export function narrowForPlatform<C extends NarrowSource>(c: C, platform: string): C {
  const on = (plats: readonly string[] | undefined): boolean => plats === undefined || plats.includes(platform);
  const out: Record<string, unknown> = { ...c };
  const { a11y, props, copy, styles } = c;
  if (a11y !== undefined) {
    const requiresOn = a11y.requiresOn ?? {};
    out.a11y = a11y.requires === undefined ? { ...a11y } : { ...a11y, requires: a11y.requires.filter((r) => on(Object.hasOwn(requiresOn, r) ? requiresOn[r] : undefined)) };
  }
  if (props !== undefined) {
    out.props = Object.fromEntries(
      Object.entries(props).map(([name, p]) => {
        const { valuesOn } = p;
        if ((p.values === undefined && p.enumRef === undefined) || valuesOn === undefined) return [name, p];
        return [name, { ...p, values: enumValues(p).filter((v) => on(Object.hasOwn(valuesOn, v) ? valuesOn[v] : undefined)) }];
      }),
    );
  }
  if (copy !== undefined) out.copy = Object.fromEntries(Object.entries(copy).filter(([, entry]) => typeof entry === 'string' || on(entry.platforms)));
  if (styles !== undefined) out.styles = Object.fromEntries(Object.entries(styles).filter(([, binding]) => on(binding.platforms)));
  return out as C;
}

/** A plain copy string's placeholder that names no prop: nothing declares what it holds, so each generator guesses.
 *  The object form declares it in params, and componentDef checks that. */
function undeclaredCopyPlaceholders(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  for (const [key, entry] of Object.entries(c.copy ?? {})) {
    if (typeof entry !== 'string') continue;
    for (const placeholder of copyPlaceholders(entry)) {
      if (!Object.hasOwn(c.props, placeholder)) out.push({ path: `copy.${key}`, message: `'{${placeholder}}' names no prop, so nothing declares what it holds; use the object form and declare it in params` });
    }
  }
  return out;
}

const COPY_REFERENCE = /copy\.([a-zA-Z][a-zA-Z0-9]*)/g;

/** A `copy.<key>` reference in prose the generators read (descriptions, keyboard actions and conditions, platform
 *  notes) that names no copy key, so a generator invents the string. */
function missingCopyKeys(c: ComponentDef): ComponentWarning[] {
  const texts: [string, string | undefined][] = [
    ...Object.entries(c.props).map(([name, p]): [string, string | undefined] => [`props.${name}.description`, p.description]),
    // generated/components.json leaves out an empty events or styles block, which parsing would default.
    ...Object.entries(c.events ?? {}).map(([name, ev]): [string, string | undefined] => [`events.${name}.description`, ev.description]),
    ...Object.entries(c.styles ?? {}).map(([name, b]): [string, string | undefined] => [`styles.${name}.description`, b.description]),
    ...(c.behavior ?? []).map((sc, i): [string, string | undefined] => [`behavior.${i}.description`, sc.description]),
    ...(c.keyboard ?? []).flatMap((rule, i): [string, string | undefined][] => [[`keyboard.${i}.action`, rule.action], [`keyboard.${i}.when`, rule.when]]),
    ...Object.entries(c.platforms).map(([plat, notes]): [string, string | undefined] => [`platforms.${plat}.notes`, notes?.notes]),
  ];
  const out: ComponentWarning[] = [];
  for (const [path, text] of texts) {
    if (text === undefined) continue;
    const keys = new Set([...text.matchAll(COPY_REFERENCE)].map((m) => m[1] as string));
    for (const key of keys) {
      if (!Object.hasOwn(c.copy ?? {}, key)) out.push({ path, message: `names copy.${key}, which is not a copy key` });
    }
  }
  return out;
}

/** An overlay with no overlay block, and a field-shaped component (a `name` and an `error` prop) with no form block:
 *  their dismissal, positioning and form contract live only in prose. */
function missingFormOrOverlay(c: ComponentDef): ComponentWarning[] {
  const out: ComponentWarning[] = [];
  if (c.category === 'overlay' && c.overlay === undefined) {
    out.push({ path: 'category', message: "is 'overlay' but there is no overlay block, so layer, anchor, collision and dismissal live only in prose" });
  }
  if (Object.hasOwn(c.props, 'name') && Object.hasOwn(c.props, 'error') && c.form === undefined) {
    out.push({ path: 'props', message: "has 'name' and 'error' but there is no form block, so how the field joins a Form lives only in prose" });
  }
  return out;
}

/** A closes/opens rule with no `target` on a component whose root is a widget (a combobox input, a button trigger):
 *  the keyboard gate would assert that the widget itself disappears or appears, when the popup is what changes. */
function untargetedKeyboardRules(c: ComponentDef): ComponentWarning[] {
  const role = resolveRole(c);
  if (!roleIn(WIDGET_ROLES, role)) return [];
  const out: ComponentWarning[] = [];
  for (const [i, rule] of (c.keyboard ?? []).entries()) {
    const outcome = expectList(rule).find((o) => o === 'closes' || o === 'opens');
    if (outcome === undefined || rule.target !== undefined) continue;
    out.push({ path: `keyboard.${i}.expect`, message: `'${outcome}' has no target, so the keyboard gate asserts on the ${role} root, which stays visible; name the part that ${outcome === 'closes' ? 'closes' : 'opens'} in target` });
  }
  return out;
}

type ControlsSource = { props?: Record<string, { controls?: { event: string; default?: string | undefined; state?: string | undefined } | undefined }> | undefined };

/** One controlled prop: the prop, the prop that seeds it when omitted, the event that reports a change, and the
 *  behavior state it drives. `declared` is false for a pair found by name alone. */
export type ControlledPair = { prop: string; default: string | null; event: string | null; state: string | null; declared: boolean };

const DEFAULT_PREFIX = /^default([A-Z].*)$/;

/** The `<x>` a `default<X>` prop name seeds by the naming convention, or null when the name has no such form. */
function seededName(propName: string): string | null {
  const m = DEFAULT_PREFIX.exec(propName);
  const rest = m?.[1];
  return rest === undefined ? null : (rest[0] as string).toLowerCase() + rest.slice(1);
}

/** The component's controlled props. Props that declare `controls` come first. Until job 651 removes it, a prop
 *  without `controls` still pairs by name with a `default<X>` sibling that no declared pair uses, with
 *  `declared: false` and no event; a `default<X>` with no `<x>` is not a pair. */
export function controlledPairs(component: ControlsSource): ControlledPair[] {
  const props = component.props ?? {};
  const declared: ControlledPair[] = [];
  for (const [name, p] of Object.entries(props)) {
    const controls = p.controls;
    if (controls !== undefined) declared.push({ prop: name, default: controls.default ?? null, event: controls.event, state: controls.state ?? null, declared: true });
  }
  const seeds = new Set(declared.map((pair) => pair.default));
  const byName: ControlledPair[] = [];
  for (const [dName, d] of Object.entries(props)) {
    const name = seededName(dName);
    if (name === null || !Object.hasOwn(props, name) || props[name]?.controls !== undefined || d.controls !== undefined || seeds.has(dName) || seeds.has(name)) continue;
    byName.push({ prop: name, default: dName, event: null, state: null, declared: false });
  }
  return [...declared, ...byName];
}

/** A `default<X>` prop with no `<x>` prop that no `controls.default` names seeds nothing. */
function orphanDefaults(c: ControlsSource): ComponentWarning[] {
  const props = c.props ?? {};
  const seeds = new Set(Object.values(props).map((p) => p.controls?.default));
  const out: ComponentWarning[] = [];
  for (const dName of Object.keys(props)) {
    const name = seededName(dName);
    if (name === null || Object.hasOwn(props, name) || seeds.has(dName)) continue;
    out.push({ path: `props.${dName}`, message: `seeds '${name}', which is not a prop` });
  }
  return out;
}
