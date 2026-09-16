/**
 * Theme frontmatter schema (Zod) — the single source of truth for the decisions a theme is derived from.
 * tools/theme.ts validates every theme doc against it and turns the decisions into full DTCG token files;
 * `node tools/schema.ts` derives ./theme.schema.json from it with `z.toJSONSchema` (never edit the JSON by hand).
 *
 * Zod 4, imported from `zod` so Node can run the tools without a build step. The site bridges it into
 * Starlight's Zod 3 schema in site/src/content.config.ts.
 */
import { z } from 'zod';

import { LOCKED_TOKENS } from './component.ts';
import { pyRepr } from './lib.ts';
import { TOKENS } from './tokens.ts';
import type { TokenLayer, TokenType } from './tokens.ts';

const HEX = /^#[0-9a-fA-F]{6}$/;

export const mode = z.enum(['light', 'dark']).meta({ id: 'mode' });

/** An OKLCH hue in degrees. */
const hue = z.number().min(0).max(360);

/** The layer each `overrides` key writes into. */
const OVERRIDE_LAYERS: Readonly<Record<'base' | 'light' | 'dark', TokenLayer>> = { base: 'base', light: 'mode', dark: 'mode' };

/** A full token path for a full or public name (color.foreground → color.foreground.default), or null. */
export function overridePath(name: string): string | null {
  if (Object.hasOwn(TOKENS, name)) return name;
  return Object.hasOwn(TOKENS, `${name}.default`) ? `${name}.default` : null;
}

const lockedEntryMatches = (entry: string, path: string): boolean => (entry.endsWith('.') ? path.startsWith(entry) : path === entry);

/** The LOCKED_TOKENS entries that are accessibility floors rather than colors: tools/check_contrast.ts checks the
 *  color ones through the pairs components declare, so only these can't be overridden. */
const LOCKED_FLOORS = LOCKED_TOKENS.filter((entry) => Object.entries(TOKENS).some(([p, info]) => lockedEntryMatches(entry, p) && info.type !== 'color'));

const COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const DIMENSION = /^-?\d+(?:\.\d+)?px$/;
const DURATION = /^\d+(?:\.\d+)?ms$/;
const REFERENCE = /^\{([^{}]+)\}$/;

/** True when `value` fits a token of `type`. A `{path}` reference names an existing token of the same type; under
 *  `base` it must be a base token, since base.json is written before any mode. */
function fitsType(type: TokenType, value: unknown, layer: TokenLayer): boolean {
  const ref = typeof value === 'string' ? REFERENCE.exec(value) : null;
  if (ref) {
    const target = Object.hasOwn(TOKENS, ref[1] as string) ? TOKENS[ref[1] as string] : undefined;
    return target !== undefined && target.type === type && (layer === 'mode' || target.layer === 'base');
  }
  switch (type) {
    case 'color': return typeof value === 'string' && (COLOR.test(value) || value === 'transparent');
    case 'dimension': return typeof value === 'string' && DIMENSION.test(value);
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'fontWeight': return Number.isInteger(value) && (value as number) >= 100 && (value as number) <= 900;
    case 'fontFamily': return typeof value === 'string' || (Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string'));
    case 'duration': return typeof value === 'string' && DURATION.test(value);
    case 'cubicBezier': return Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === 'number' && Number.isFinite(v));
    case 'shadow': {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
      const s = value as Record<string, unknown>;
      const fields: [string, TokenType, boolean][] = [['color', 'color', true], ['offsetX', 'dimension', true], ['offsetY', 'dimension', true], ['blur', 'dimension', true], ['spread', 'dimension', false]];
      if (Object.keys(s).some((k) => !fields.some(([f]) => f === k))) return false;
      return fields.every(([f, t, required]) => (Object.hasOwn(s, f) ? fitsType(t, s[f], layer) : !required));
    }
  }
}

/** The token each `tuning` value sets, keyed by its `tuning.<group>.<name>` path. */
const TUNED_TOKENS: Readonly<Record<string, string>> = {
  'radius.sm': 'radius.sm', 'radius.md': 'radius.md', 'radius.lg': 'radius.lg',
  'lineHeight.tight': 'font.lineHeight.tight', 'lineHeight.normal': 'font.lineHeight.normal', 'lineHeight.loose': 'font.lineHeight.loose',
  'fontWeight.regular': 'font.weight.regular', 'fontWeight.medium': 'font.weight.medium', 'fontWeight.semibold': 'font.weight.semibold', 'fontWeight.bold': 'font.weight.bold',
};

/** What tools/theme.ts derives for each tuned token when `tuning` leaves it out (radius steps come from the preset). */
const LINE_HEIGHTS = { tight: 1.2, normal: 1.5, loose: 1.7 } as const;
const FONT_WEIGHTS = { regular: 400, medium: 500, semibold: 600, bold: 700 } as const;

/** Token path → value, the keys `overrides.<layer>` accepts. */
const tokenOverrides = z.record(z.string(), z.unknown());
const radiusStep = z.int().min(0).max(48);
const lineHeight = z.number().min(1.0).max(2.2);
const fontWeight = z.int().min(100).max(900).multipleOf(100);

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
      .strictObject({ base: tokenOverrides.optional(), light: tokenOverrides.optional(), dark: tokenOverrides.optional() })
      .optional()
      .describe(
        "Escape hatch: explicit token values, keyed by a token's full or public path (schema/tokens.ts). `base` sets base-layer tokens (palette, type, spacing, radius, motion) before the modes are derived, so mode choices see them; `light` and `dark` set mode tokens after derivation. Each value must fit its token's type or be a `{path}` reference to a token of the same type. size.target.* and border.width.focus are accessibility floors and can't be overridden. Still contrast-checked.",
      ),
    tuning: z
      .strictObject({
        radius: z
          .strictObject({ sm: radiusStep.optional(), md: radiusStep.optional(), lg: radiusStep.optional() })
          .optional()
          .describe('Corner steps in px (0–48), replacing the preset\'s three steps. radius.full stays 999px. No effect with radius: none.'),
        lineHeight: z
          .strictObject({ tight: lineHeight.optional(), normal: lineHeight.optional(), loose: lineHeight.optional() })
          .optional()
          .describe('Line heights (1.0–2.2), tight ≤ normal ≤ loose. Defaults 1.2 / 1.5 / 1.7.'),
        fontWeight: z
          .strictObject({ regular: fontWeight.optional(), medium: fontWeight.optional(), semibold: fontWeight.optional(), bold: fontWeight.optional() })
          .optional()
          .describe('Font weights (100–900 in steps of 100), ascending. Defaults 400 / 500 / 600 / 700.'),
      })
      .optional()
      .describe('Named adjustments to base values the derivation otherwise fixes, so a theme can state them without an override. Each value left out keeps its derived default.'),
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

    // Overrides name real tokens of the layer they write, with values of the token's type. tools/theme.ts would
    // otherwise create a typeless token nothing reads.
    for (const key of ['base', 'light', 'dark'] as const) {
      const layer = OVERRIDE_LAYERS[key];
      for (const [name, value] of Object.entries(t.overrides?.[key] ?? {})) {
        const at: PropertyKey[] = ['overrides', key, name];
        const path = overridePath(name);
        const info = path === null ? undefined : TOKENS[path];
        if (path === null || info === undefined || info.layer !== layer) {
          const belongs = info === undefined ? '' : info.layer === 'base' ? ': it is a base token, so it goes under overrides.base' : ': it is a mode token, so it goes under overrides.light or overrides.dark';
          issue(at, `overrides.${key}: '${name}' is not a ${layer} token${belongs}`);
          continue;
        }
        const locked = LOCKED_FLOORS.find((entry) => lockedEntryMatches(entry, path));
        if (locked !== undefined) {
          issue(at, `overrides.${key}.${name}: can't be overridden: LOCKED_TOKENS has '${locked.endsWith('.') ? `${locked}*` : locked}', an accessibility floor`);
          continue;
        }
        // tools/theme.ts derives the mode colors from the base palette by contrast, so a palette step has to be a literal.
        const palette = path.startsWith('color.palette.');
        if (palette ? !(typeof value === 'string' && HEX.test(value)) : !fitsType(info.type, value, layer)) {
          issue(at, `overrides.${key}.${name}: expected a ${palette ? '#rrggbb color' : info.type} value, got ${pyRepr(value)}`);
        }
      }
    }

    // Tuning: a value with no effect, values out of order, and a token set in two places.
    if (t.tuning?.radius !== undefined && t.radius === 'none') {
      issue(['tuning', 'radius'], 'tuning.radius has no effect when radius is none: every corner is 0px; remove one');
    }
    const ordered = <K extends string>(group: 'lineHeight' | 'fontWeight', defaults: Readonly<Record<K, number>>, strict: boolean): void => {
      const tuned = (t.tuning?.[group] ?? {}) as Partial<Record<K, number>>;
      if (Object.keys(tuned).length === 0) return;
      const names = Object.keys(defaults) as K[];
      const values = names.map((n) => tuned[n] ?? defaults[n]);
      for (let i = 1; i < names.length; i += 1) {
        const [a, b] = [values[i - 1] as number, values[i] as number];
        if (strict ? a >= b : a > b) {
          const shown = names.map((n, j) => `${n} ${values[j]}${tuned[n] === undefined ? ' (default)' : ''}`).join(', ');
          issue(['tuning', group], `tuning.${group} must be ${strict ? 'ascending' : `${names.join(' ≤ ')}`}: ${shown}`);
          return;
        }
      }
    };
    ordered('lineHeight', LINE_HEIGHTS, false);
    ordered('fontWeight', FONT_WEIGHTS, true);
    const baseOverrides = new Map(Object.keys(t.overrides?.base ?? {}).map((name) => [overridePath(name), name] as const));
    for (const [group, values] of Object.entries(t.tuning ?? {})) {
      for (const name of Object.keys(values ?? {})) {
        const token = TUNED_TOKENS[`${group}.${name}`] as string;
        if (baseOverrides.has(token)) {
          issue(['overrides', 'base', baseOverrides.get(token) as string], `${token} is set in both tuning.${group}.${name} and overrides.base; set it in one place`);
        }
      }
    }
  })
  .meta({ id: 'themeDef' });

/** The theme doc's frontmatter: Starlight's own fields ride alongside `theme:`, so only themeDef is strict. */
export const themeFrontmatter = z.object({ theme: themeDef });
export type ThemeDef = z.infer<typeof themeDef>;
