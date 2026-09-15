/**
 * Theme frontmatter schema (Zod) — the single source of truth for the decisions a theme is derived from.
 * tools/theme.ts validates every theme doc against it and turns the decisions into full DTCG token files;
 * `node tools/schema.ts` derives ./theme.schema.json from it with `z.toJSONSchema` (never edit the JSON by hand).
 *
 * Zod 4, imported from `zod` so Node can run the tools without a build step. The site bridges it into
 * Starlight's Zod 3 schema in site/src/content.config.ts.
 */
import { z } from 'zod';

const HEX = /^#[0-9a-fA-F]{6}$/;

export const mode = z.enum(['light', 'dark']).meta({ id: 'mode' });

/** An OKLCH hue in degrees. */
const hue = z.number().min(0).max(360);

export const themeDef = z
  .strictObject({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/).describe('Folder and CSS attribute value: tokens/themes/<id>, [data-theme=<id>].'),
    status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
    tone: z.array(z.string().min(1)).min(2).max(5).describe('Adjectives that describe the feel. Used by AI tools as the tie-breaker for borderline decisions.'),
    not: z.string().describe('The one word this theme must never be.'),
    seed: z.strictObject({
      /** Brand color. Near-achromatic (OKLCH chroma < 0.03) means "ink": the action fill is the darkest neutral on light, the lightest on dark. */
      color: z
        .string()
        .regex(HEX)
        .describe('Brand color. The brand ramp is built around it; neutrals are tinted toward its hue unless `neutral` is set. A near-achromatic color (OKLCH chroma below 0.03) is treated as ink: the primary action is the darkest neutral on a light page and the lightest on a dark one, links take the text color, and the focus ring is the brand step that reads at 3:1 on both surfaces.'),
      /** Optional second seed: the neutral ramp takes its hue and (capped) chroma, and the light page is this color lifted, not white. */
      neutral: z
        .string()
        .regex(HEX)
        .optional()
        .describe("Optional second seed for two-seed palettes (sand-and-black, navy-and-cream): the neutral ramp takes this color's hue and chroma (capped at 0.06) instead of a faint cast of the brand hue, the light-mode page is this color lifted (lightness min(L + 0.15, 0.96)) rather than white, and the darkest neutral keeps the hue at low chroma so dark mode is a warm black. Every contrast-chosen step is still chosen against the new surfaces."),
      typeface: z.string().default('system').describe("'system' or a family name. Named families are prepended to the system stack."),
      headingTypeface: z.string().optional().describe('Defaults to typeface.'),
      mono: z.string().default('system'),
    }),
    /** Optional rather than `.default(0.2)`: the check below has to see whether the author wrote it. tools/theme.ts falls back to 0.2. */
    neutralTint: z.number().min(0).max(1).optional().meta({ default: 0.2, description: 'How much of the seed hue bleeds into the neutral ramp. 0 = pure gray.' }),
    scale: z.strictObject({
      base: z.number().min(12).max(20).describe('Body size in px.'),
      ratio: z.number().min(1.1).max(1.5).describe('Modular scale ratio. 1.2 dense/technical, 1.25 balanced, 1.333 editorial.'),
    }),
    radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).describe('Corner preset: none 0/0/0, sm 2/4/6, md 4/8/12, lg 8/12/16, full pill.'),
    density: z.enum(['compact', 'comfortable', 'roomy']).describe('Spacing multiplier 0.75 / 1 / 1.25 on the 4px grid.'),
    motion: z
      .enum(['none', 'subtle', 'expressive'])
      .default('subtle')
      .describe('Transition durations: none 0ms, subtle 120/200ms, expressive 160/320ms. Loop (spinner) is always 800ms. Reduced-motion preferences override at runtime.'),
    elevation: z
      .enum(['flat', 'subtle', 'pronounced'])
      .default('subtle')
      .describe('Overlay shadows: flat = none (overlays rely on the scrim and border), subtle = soft (default), pronounced = deeper and darker. Scales shadow.raised / shadow.overlay in both modes.'),
    layout: z
      .strictObject({
        rhythm: z
          .enum(['tight', 'normal', 'loose'])
          .default('normal')
          .describe('Multiplier on section and stack spacing (0.75 / 1 / 1.5) on top of density. tight for dense tools, loose for marketing and editorial.'),
        contentWidth: z
          .int()
          .min(480)
          .max(1600)
          .default(960)
          .describe('Max width in px of the main content column (layout.maxWidth.content). Page width is 4/3 of it; prose measure is 65 characters at the body size regardless.'),
      })
      .optional()
      .describe('Rhythm BETWEEN components and at page level. Everything inside a component comes from `space.*` via its own bindings; this decides gutters, section spacing, stack presets and measure.'),
    modes: z.strictObject({ default: mode, supports: z.array(mode).min(1) }),
    statusHues: z
      .strictObject({
        danger: hue.default(25),
        success: hue.default(145),
        warning: hue.default(80),
        info: hue.nullable().default(null).describe('null = seed hue'),
      })
      .optional(),
    overrides: z
      .strictObject({ light: z.record(z.string(), z.any()).optional(), dark: z.record(z.string(), z.any()).optional() })
      .optional()
      .describe('Escape hatch: explicit token values per mode, keyed by dotted path. Applied after derivation; still contrast-checked.'),
  })
  .check((ctx) => {
    // Combinations tools/theme.ts would otherwise ignore without a word.
    const t = ctx.value;
    const issue = (path: PropertyKey[], message: string): void => {
      ctx.issues.push({ code: 'custom', input: t, path, message });
    };
    if (t.seed.neutral !== undefined && t.neutralTint !== undefined) {
      issue(['neutralTint'], 'neutralTint has no effect when seed.neutral is set: the neutral ramp takes its hue and chroma from seed.neutral; remove one');
    }
    const seen = new Set<string>();
    for (const [i, m] of t.modes.supports.entries()) {
      if (seen.has(m)) issue(['modes', 'supports', i], `'${m}' is listed twice`);
      seen.add(m);
    }
    if (!t.modes.supports.includes(t.modes.default)) issue(['modes', 'default'], `default mode '${t.modes.default}' is not in modes.supports`);
  })
  .meta({ id: 'themeDef' });

/** The theme doc's frontmatter: Starlight's own fields ride alongside `theme:`, so only themeDef is strict. */
export const themeFrontmatter = z.object({ theme: themeDef });
export type ThemeDef = z.infer<typeof themeDef>;
