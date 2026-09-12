import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { componentDef, type ComponentDef } from '../../schema/component';
import { themeDef } from '../../schema/theme';

// Every doc page gets Starlight's own frontmatter (title, description, sidebar…).
// Component docs additionally carry `component:` and theme docs carry `theme:`.
// Both are optional here so ordinary pages validate; tools/parse.ts and
// tools/theme.ts enforce the full schema for their respective folders.
//
// `componentDef` is a Zod 4 schema (schema/component.ts is the single source of truth and runs
// under Node without a build), while Starlight's schema builder is Astro's bundled Zod 3. The
// transform below bridges the two: the doc's `component:` block is parsed by the Zod 4 schema
// (defaults filled, unknown keys rejected) and its issues are reported through Zod 3.
const component = z
  .unknown()
  .optional()
  .transform((value, ctx): ComponentDef | undefined => {
    if (value === undefined) return undefined;
    const result = componentDef.safeParse(value);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      ctx.addIssue({ code: 'custom', path: issue.path.map(String), message: issue.message });
    }
    return z.NEVER;
  });

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        component,
        theme: themeDef.optional(),
      }),
    }),
  }),
};
