/**
 * Extension frontmatter schema (Zod). Mirrors ./extension.schema.json.
 *
 * An extension doc (site/src/content/docs/extensions/<Component>.<name>.md) adds props, events,
 * unlocked style bindings, copy, keyboard rules, behavior scenarios and hand-written modules to a
 * system component. tools/parse.py merges it into the component at parse time; this schema only
 * validates the doc for the site. The prop/event/style/keyboard/behavior shapes are the component
 * schema's own, reused from ./component.
 */
import { z } from 'astro/zod';
import { componentDef, platformId } from './component';

/** A hand-written module the generated component must import and call, never rewrite. */
export const moduleDef = z.object({
  /** Relative to packages/<platform>/src/, always under custom/. */
  path: z.string().regex(/^custom\/[A-Za-z0-9_./-]+\.(ts|tsx)$/, 'custom/<file>.ts'),
  /** TypeScript function type, e.g. '(name: string, label: string) => void'. */
  signature: z.string(),
  /** Exactly where the component calls it, in one sentence. */
  wire: z.string(),
  /** Omit = every platform the component supports. */
  platforms: z.array(platformId).min(1).optional(),
});

const shape = componentDef.shape;

export const extensionDef = z.object({
  extends: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
  name: z.string().regex(/^[a-z][a-z0-9-]*$/),
  description: z.string().optional(),
  props: shape.props.optional(),
  events: shape.events.removeDefault().optional(),
  styles: shape.styles.removeDefault().optional(),
  copy: z.record(z.string(), z.string()).optional(),
  keyboard: shape.keyboard,
  behavior: shape.behavior,
  /** Export name → module contract. */
  modules: z.record(z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/), moduleDef).optional(),
});

export const extensionFrontmatter = z.object({ extension: extensionDef });
export type ExtensionDef = z.infer<typeof extensionDef>;
export type ModuleDef = z.infer<typeof moduleDef>;
