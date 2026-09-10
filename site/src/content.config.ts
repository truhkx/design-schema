import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'astro/zod';
import { componentDef } from '../../schema/component';
import { themeDef } from '../../schema/theme';

// Every doc page gets Starlight's own frontmatter (title, description, sidebar…).
// Component docs additionally carry `component:` and theme docs carry `theme:`.
// Both are optional here so ordinary pages validate; tools/parse.py and
// tools/theme.py enforce the full schema for their respective folders.
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        component: componentDef.optional(),
        theme: themeDef.optional(),
      }),
    }),
  }),
};
