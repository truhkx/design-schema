/**
 * Component frontmatter schema (Zod).
 *
 * This is the machine-readable half of a component doc. It lives under the
 * `component:` key of the Markdown frontmatter so it never collides with
 * Starlight's own page fields (title, description, sidebar…).
 *
 * The same shape is expressed as JSON Schema in ./component.schema.json,
 * which is what the Python tooling (parser, MCP server) validates against.
 * Keep the two in sync — a generator step for this is on the roadmap.
 */
import { z } from 'astro/zod';

export const PLATFORMS = ['web', 'lit', 'rn', 'swiftui', 'compose'] as const;
export const platformId = z.enum(PLATFORMS);

/** A reference to a design token by path, e.g. `color.foreground.strong`.
 *  Braces interpolate a prop value: `space.{size}` → `space.md` when size=md. */
export const tokenRef = z
  .string()
  .regex(/^[a-z][a-z0-9]*(\.(\{[a-zA-Z]+\}|[a-zA-Z0-9-]+))+$/, 'Expected a dotted token path like color.foreground.strong');

export const propDef = z.object({
  type: z.enum(['string', 'number', 'boolean', 'enum', 'content', 'array', 'object', 'function']),
  /** For array/object/function props: TypeScript-like shape of the value. */
  shape: z.string().optional(),
  description: z.string(),
  required: z.boolean().default(false),
  default: z.union([z.string(), z.number(), z.boolean()]).optional(),
  values: z.array(z.string()).optional(), // enum only
  a11y: z.string().optional(),            // why this prop matters for accessibility
  platforms: z.array(platformId).optional(), // omit = all platforms
});

export const eventDef = z.object({
  description: z.string(),
  /** True when the natural trigger is a touch gesture; requires `gesture-alternative` in a11y.requires. */
  gesture: z.boolean().default(false),
  /** Platform-neutral name → what it becomes on each platform. */
  platforms: z.record(platformId, z.string()),
});

export const styleBinding = z.object({
  token: tokenRef,
  description: z.string().optional(),
  /** Not overridable per instance. Contrast-bearing colors, focus rings and target sizes are locked automatically. */
  locked: z.boolean().default(false),
});

export const contrastPair = z.object({
  foreground: tokenRef,
  background: tokenRef,
  level: z.enum(['AA', 'AAA']).default('AA'),
  large: z.boolean().default(false), // large text threshold (3:1 / 4.5:1)
});

export const a11yDef = z.object({
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
});

export const platformNotes = z.object({
  element: z.string().optional(),   // web element / RN component / SwiftUI view
  tag: z.string().optional(),       // Lit custom element tag
  attributes: z.array(z.string()).optional(),
  props: z.array(z.string()).optional(),
  reflect: z.array(z.string()).optional(),
  supported: z.boolean().default(true),
  notes: z.string().optional(),
});

export const componentDef = z.object({
  name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
  category: z.enum(['action', 'typography', 'input', 'layout', 'feedback', 'navigation', 'container', 'overlay', 'data', 'primitive']),
  status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
  /** APG pattern slug this component implements, e.g. 'dialog-modal'. */
  apg: z.string().optional(),
  anatomy: z.array(z.string()).min(1),
  props: z.record(z.string(), propDef),
  events: z.record(z.string(), eventDef).default({}),
  styles: z.record(z.string(), styleBinding).default({}),
  a11y: a11yDef,
  /** Authored given/when/then scenarios for the behavior gate; the parser adds schema-derived ones. */
  behavior: z
    .array(
      z.object({
        name: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
        description: z.string().optional(),
        given: z.record(z.string(), z.unknown()).optional(),
        when: z.record(z.string(), z.unknown()).optional(),
        then: z.array(z.record(z.string(), z.unknown())).min(1),
        platforms: z.array(platformId).optional(),
      }),
    )
    .optional(),
  /** Key → action from the APG pattern. */
  keyboard: z
    .array(
      z.object({
        keys: z.array(z.string()).min(1),
        action: z.string(),
        when: z.string().optional(),
        from: z.enum(['trigger', 'first', 'last', 'inside', 'any']).default('inside'),
        expect: z
          .enum(['closes', 'opens', 'focus-next', 'focus-prev', 'focus-first', 'focus-last', 'focus-wraps-to-first', 'focus-wraps-to-last', 'focus-trigger', 'focus-unchanged', 'toggles', 'selects', 'manual'])
          .default('manual'),
      }),
    )
    .optional(),
  /** Anatomy part → the system component it must be built from. */
  composition: z.record(z.string(), z.string()).optional(),
  /** Strings the component renders itself; templates may use {label}, {count}. */
  copy: z.record(z.string(), z.string()).optional(),
  platforms: z.record(platformId, platformNotes),
});

export const componentFrontmatter = z.object({
  component: componentDef,
});

export type ComponentDef = z.infer<typeof componentDef>;
export type PlatformId = z.infer<typeof platformId>;
