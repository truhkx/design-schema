/**
 * Extension frontmatter schema (Zod). `node tools/schema.ts` derives ./extension.schema.json from it.
 *
 * An extension doc (site/src/content/docs/extensions/<Component>.<name>.md) adds props, events,
 * unlocked style bindings, copy, keyboard rules, behavior scenarios, anatomy parts, contrast pairs and
 * hand-written modules to a system component, and can change an upstream prop's default, remove
 * upstream items and narrow what it adds to some platforms. tools/parse.ts validates the doc against
 * this schema and merges it into the component at parse time. The prop/event/style/keyboard/behavior/
 * contrast shapes are the component schema's own, reused from ./component.
 */
import { z } from 'zod';
import { componentDef, contrastPair, platformId, propDefault } from './component.ts';

/** A hand-written module the generated component must import and call, never rewrite. */
export const moduleDef = z
  .strictObject({
    /** Relative to packages/<platform>/src/, always under custom/. */
    path: z.string().regex(/^custom\/[A-Za-z0-9_./-]+\.(ts|tsx)$/, 'custom/<file>.ts').describe('Relative to packages/<platform>/src/, always under custom/.'),
    /** TypeScript function type, e.g. '(name: string, label: string) => void'. */
    signature: z.string().describe("TypeScript function type, e.g. '(name: string, label: string) => void'."),
    /** Exactly where the component calls it, in one sentence. */
    wire: z.string().describe('Exactly where the component calls it, in one sentence.'),
    /** Omit = every platform the component supports. */
    platforms: z.array(platformId).min(1).optional().describe('Omit = every platform the component supports.'),
  })
  .meta({ id: 'moduleDef' });

const shape = componentDef.shape;

const upstreamNames = z.array(z.string()).min(1);

export const extensionDef = z
  .strictObject({
    extends: z.string().regex(/^[A-Z][A-Za-z0-9]*$/).describe('The component this extends, by schema name.'),
    name: z.string().regex(/^[a-z][a-z0-9-]*$/).describe('The concern, kebab-case; the file is <Component>.<name>.md.'),
    description: z.string().optional(),
    platforms: z.array(platformId).min(1).optional().describe('The platforms the extension targets, each one the component supports. Omitted means every platform the component supports.'),
    anatomy: z.array(z.string()).min(1).optional().describe("Parts appended to the component's anatomy."),
    props: shape.props.optional(),
    events: shape.events.removeDefault().optional(),
    styles: shape.styles.removeDefault().optional().describe('Unlocked bindings only; the parser rejects `locked: true` and any token a contrast pair locks, unless the pair is one this extension adds.'),
    copy: shape.copy,
    keyboard: shape.keyboard,
    behavior: shape.behavior,
    a11y: z
      .strictObject({ contrast: z.array(contrastPair).min(1) })
      .optional()
      .describe("Contrast pairs appended to the component's a11y.contrast; role and requires are claims about the upstream component, so they are not allowed."),
    defaults: z.record(z.string(), propDefault).optional().describe('Upstream prop name → the default this extension gives it instead.'),
    omit: z
      .strictObject({ props: upstreamNames, events: upstreamNames, styles: upstreamNames, copy: upstreamNames, behavior: upstreamNames })
      .partial()
      .optional()
      .describe('Section → names of upstream items removed from the merged component (behavior entries are authored scenario names).'),
    /** Export name → module contract. */
    modules: z.record(z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), moduleDef).optional().describe('Export name → module contract.'),
  })
  .meta({ id: 'extensionDef' });

export const extensionFrontmatter = z.object({ extension: extensionDef });
export type ExtensionDef = z.infer<typeof extensionDef>;
export type ModuleDef = z.infer<typeof moduleDef>;
