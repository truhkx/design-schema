/**
 * The website's content pipeline — two Astro 5 Content Layer loaders, no copies.
 *
 *   `components` — the schema loader: `generated/components.json`, read in place.
 *   `docs`       — the prose loader: every markdown file under `../../site/src/content/docs`,
 *                  read in place.
 *
 * Both are keyed by the same slug, so a component page joins them without a lookup table:
 * `getEntry('components', 'button')` is the schema, `getEntry('docs', 'button')` is the prose body
 * of site/src/content/docs/components/button.md. site/ keeps owning the markdown — it is still the
 * contributor reference — and this app renders it through our own chrome instead of Starlight's.
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { componentsLoader } from './loaders/components';
import { componentDef, type ComponentDef } from '../../../schema/component';

// `componentDef` is a Zod 4 schema (schema/component.ts is the single source of truth and runs
// under Node without a build), while Astro's collection schemas are its bundled Zod 3. Parse with
// the Zod 4 schema and report its issues through Zod 3 — the same bridge site/src/content.config.ts
// uses, so both sites reject exactly the same malformed schema. Parsing rather than passing through
// also fills the defaults the docs leave implicit (`required: false`, `locked: false`, …), which is
// what a props table wants to read. The `source` markers tools/parse.ts stamps on extension-added
// items are schema fields, so the block parses as generated.
const component = z.unknown().transform((value, ctx): ComponentDef => {
  const result = componentDef.safeParse(value);
  if (result.success) return result.data;
  for (const issue of result.error.issues) {
    ctx.addIssue({ code: 'custom', path: issue.path.map(String), message: issue.message });
  }
  return z.NEVER;
});

const components = defineCollection({
  loader: componentsLoader(),
  schema: z.object({
    /** The component slug, e.g. `button`. Same value as the entry id. */
    id: z.string(),
    title: z.string(),
    description: z.string(),
    published: z.boolean(),
    /** The machine-readable contract: anatomy, props, events, a11y, styles, keyboard, behavior. */
    component,
    /** Scenarios tools/behavior_tests.ts derives from the schema. Not rendered yet. */
    behaviorDerived: z.array(z.record(z.unknown())).default([]),
    /** The doc's prose, one markdown string per `##` heading. The `docs` collection has it too,
     *  as renderable content; this copy is handy for a single section without a full render. */
    sections: z.record(z.string()).default({}),
    /** Extension docs that add props/events/modules to this component (see process/extending-components). */
    extensions: z.array(z.record(z.unknown())).default([]),
    /** The doc this entry was parsed from, relative to the repo root. */
    source: z.string(),
  }),
});

/**
 * The slug an entry is keyed by: the file's basename, which for a component doc is exactly the
 * `id` in generated/components.json. Basenames are unique across site/src/content/docs today; a
 * future collision would surface as Astro's duplicate-id warning rather than silently win.
 */
function slugFor(entry: string): string {
  const name = entry.split(/[\\/]/).pop() ?? entry;
  return name.replace(/\.md$/, '');
}

const docs = defineCollection({
  // Relative to this app's root (apps/website), so the markdown is read where it lives.
  loader: glob({ base: '../../site/src/content/docs', pattern: '**/*.md', generateId: ({ entry }) => slugFor(entry) }),
  // Only the fields this app renders are typed. The rest of the frontmatter (`component:`,
  // `theme:`, `extension:`) passes through untouched — the `components` collection above is the
  // typed view of `component:`, and re-validating it here would just duplicate that work.
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      sidebar: z
        .object({ label: z.string().optional(), order: z.number().optional(), hidden: z.boolean().optional() })
        .passthrough()
        .optional(),
    })
    .passthrough(),
});

export const collections = { components, docs };
