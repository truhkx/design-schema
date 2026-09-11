/**
 * Component frontmatter schema (Zod) — the single source of truth.
 *
 * This is the machine-readable half of a component doc. It lives under the
 * `component:` key of the Markdown frontmatter so it never collides with
 * Starlight's own page fields (title, description, sidebar…).
 *
 * tools/parse.ts validates every doc against it, and `node tools/schema.ts` derives
 * ./component.schema.json from it with `z.toJSONSchema` (never edit the JSON by hand).
 * The `.meta({ id })` names become the JSON schema's `$defs`, which
 * ./extension.schema.json references across files.
 *
 * Zod 4, imported from `zod` so Node can run the tools without a build step.
 */
import { z } from 'zod';

export const PLATFORMS = ['web', 'lit', 'rn', 'swiftui', 'compose'] as const;
export const platformId = z.enum(PLATFORMS).meta({ id: 'platformId' });

/** A reference to a design token by path, e.g. `color.foreground.strong`.
 *  Braces interpolate a prop value: `space.{size}` → `space.md` when size=md. */
export const tokenRef = z
  .string()
  .regex(/^[a-z][a-z0-9]*(\.(\{[a-zA-Z]+\}|[a-zA-Z0-9-]+))+$/, 'Expected a dotted token path like color.foreground.strong')
  .meta({ id: 'tokenRef', description: 'Dotted token path, e.g. color.foreground.strong. Braces interpolate a prop value: space.{size}.' });

export const propDef = z
  .strictObject({
    type: z.enum(['string', 'number', 'boolean', 'enum', 'content', 'array', 'object', 'function']),
    description: z.string(),
    /** For array/object/function props: TypeScript-like shape of the value. */
    shape: z.string().optional().describe("For array/object/function props: the item or field shape in TypeScript-like notation, e.g. '{ value: string; label: string; description?: string; disabled?: boolean }[]'."),
    required: z.boolean().default(false),
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
    values: z.array(z.string()).optional(), // enum only
    a11y: z.string().optional(),            // why this prop matters for accessibility
    platforms: z.array(platformId).optional(), // omit = all platforms
  })
  .refine((p) => p.type !== 'enum' || Array.isArray(p.values), { message: "an enum prop needs 'values'", path: ['values'] })
  .meta({ id: 'propDef' });

export const eventDef = z
  .strictObject({
    description: z.string(),
    /** True when the natural trigger is a touch gesture; requires `gesture-alternative` in a11y.requires. */
    gesture: z.boolean().default(false).describe('True when the natural trigger is a touch gesture (swipe, drag, long-press). Components declaring a gesture event must also list gesture-alternative in a11y.requires.'),
    /** Platform-neutral name → what it becomes on each platform. */
    platforms: z.partialRecord(platformId, z.string()),
  })
  .meta({ id: 'eventDef' });

export const styleBinding = z
  .strictObject({
    token: tokenRef,
    description: z.string().optional(),
    /** Not overridable per instance. Contrast-bearing colors, focus rings and target sizes are locked automatically. */
    locked: z.boolean().default(false).describe('Not overridable per instance. Bindings whose tokens appear in a11y.contrast, and every focusRing*/minTarget binding, are locked automatically by the parser; set this for others (e.g. a size that keeps a target reachable).'),
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

export const a11yDef = z
  .strictObject({
    role: z.string(),
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
    tag: z.string().optional(),       // Lit custom element tag
    attributes: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
    reflect: z.array(z.string()).optional(),
    supported: z.boolean().default(true),
    notes: z.string().optional(),
  })
  .meta({ id: 'platformNotes' });

/** Authored given/when/then scenarios for the behavior gate; the parser adds schema-derived ones. */
export const behaviorScenario = z
  .strictObject({
    name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).describe('kebab-case; becomes the test name.'),
    description: z.string().optional().describe('Why this scenario exists, when the name is not enough.'),
    given: z.record(z.string(), z.unknown()).optional().describe('Props to render with (prop name -> value). Omit for defaults.'),
    when: z.record(z.string(), z.unknown()).optional().describe('One interaction: { click: <anatomy part> }, { key: <Key> }, { type: <text> }, { focus: <part> }, { blur: true }. Omit for a pure render assertion.'),
    then: z.array(z.record(z.string(), z.unknown())).min(1).describe('Assertions, one object each: { event, with? | fired: false }, { state: checked|expanded|selected|disabled|invalid|pressed|open, is }, { focusable }, { focused: <part> }, { text }, { copy: <copy key> }, { role }, { name }, { attribute, is }, { renders: true }.'),
    platforms: z.array(platformId).optional().describe('Restrict to these platforms (default: all).'),
  })
  .meta({ id: 'behaviorScenario' });

/** Key → action from the APG pattern. */
export const keyboardRule = z
  .strictObject({
    keys: z.array(z.string()).min(1).describe("Key names as in KeyboardEvent.key (Escape, Enter, ' ', ArrowDown, Tab, Home, End) or 'Shift+Tab'."),
    action: z.string().describe('What happens, in one sentence, from the APG pattern.'),
    when: z.string().optional().describe("Focus location or state the rule applies in, e.g. 'focus on trigger', 'menu open'."),
    from: z.enum(['trigger', 'first', 'last', 'inside', 'any']).default('inside').describe('Where focus is before the key is pressed, for the keyboard gate: the element with aria-haspopup/aria-expanded (trigger), the first/last focusable inside the component, anywhere inside, or wherever it is.'),
    expect: z
      .enum(['closes', 'opens', 'focus-next', 'focus-prev', 'focus-first', 'focus-last', 'focus-wraps-to-first', 'focus-wraps-to-last', 'focus-trigger', 'focus-unchanged', 'toggles', 'selects', 'manual'])
      .default('manual')
      .describe("Machine-checkable outcome the keyboard gate asserts after the key: the component's role element disappears/appears, focus moves as named, aria-expanded/aria-checked flips (toggles) or the focused item becomes checked/selected (selects). `manual` means the rule is documented but not auto-tested."),
  })
  .meta({ id: 'keyboardRule' });

export const componentDef = z
  .strictObject({
    name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
    category: z.enum(['action', 'typography', 'input', 'layout', 'feedback', 'navigation', 'container', 'overlay', 'data', 'primitive']),
    status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
    /** APG pattern slug this component implements, e.g. 'dialog-modal'. */
    apg: z.string().optional().describe("Slug of the W3C ARIA Authoring Practices pattern this component implements, e.g. 'dialog-modal'. Behavior follows the APG when systems disagree."),
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
  .meta({ id: 'componentDef' });

/** The whole frontmatter: Starlight's own fields (title, description, sidebar…) ride alongside `component`. */
export const componentFrontmatter = z.object({
  component: componentDef,
});

export type ComponentDef = z.infer<typeof componentDef>;
export type PlatformId = z.infer<typeof platformId>;
