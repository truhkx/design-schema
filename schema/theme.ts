/**
 * Theme frontmatter schema (Zod). Mirrors ./theme.schema.json — the decisions a
 * theme is derived from. tools/theme.py turns these into full DTCG token files.
 */
import { z } from 'astro/zod';

export const mode = z.enum(['light', 'dark']);

export const themeDef = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  status: z.enum(['draft', 'review', 'stable', 'deprecated']).default('draft'),
  tone: z.array(z.string()).min(2).max(5),
  not: z.string(),
  seed: z.object({
    /** Brand color. Near-achromatic (OKLCH chroma < 0.03) means "ink": the action fill is the darkest neutral on light, the lightest on dark. */
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    /** Optional second seed: the neutral ramp takes its hue and (capped) chroma, and the light page is this color lifted, not white. */
    neutral: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    typeface: z.string().default('system'),
    headingTypeface: z.string().optional(),
    mono: z.string().default('system'),
  }),
  neutralTint: z.number().min(0).max(1).default(0.2),
  scale: z.object({ base: z.number().min(12).max(20), ratio: z.number().min(1.1).max(1.5) }),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
  density: z.enum(['compact', 'comfortable', 'roomy']),
  motion: z.enum(['none', 'subtle', 'expressive']).default('subtle'),
  elevation: z.enum(['flat', 'subtle', 'pronounced']).default('subtle'),
  layout: z
    .object({
      rhythm: z.enum(['tight', 'normal', 'loose']).default('normal'),
      contentWidth: z.number().min(480).max(1600).default(960),
    })
    .optional(),
  modes: z.object({ default: mode, supports: z.array(mode).min(1) }),
  statusHues: z
    .object({
      danger: z.number().optional(),
      success: z.number().optional(),
      warning: z.number().optional(),
      info: z.number().nullable().optional(),
    })
    .optional(),
  overrides: z
    .object({ light: z.record(z.string(), z.any()).optional(), dark: z.record(z.string(), z.any()).optional() })
    .optional(),
});

export const themeFrontmatter = z.object({ theme: themeDef });
export type ThemeDef = z.infer<typeof themeDef>;
