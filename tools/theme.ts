/**
 * Theme generator: theme doc frontmatter → DTCG token files. Port of tools/theme.py.
 *
 * For every site/src/content/docs/themes/*.md with a `theme:` block:
 *   1. validate against schema/theme.schema.json
 *   2. derive ramps in OKLCH (neutral tinted toward the seed hue, brand around the seed, status hues)
 *   3. derive type scale, spacing, radius, target sizes from scale/density/radius
 *   4. choose semantic mappings per mode so declared contrast floors hold (then check_contrast.ts proves it)
 *   5. apply `overrides`
 *   6. write tokens/themes/<id>/{base,light,dark}.json
 *
 * Usage: node tools/theme.ts
 *
 * Runs under Node's type stripping: annotations only. Groups whose keys are numbers ("0", "50", …) are
 * built as `Map`s, because a plain JavaScript object hoists integer-like keys to the front and the token
 * files have to come out in the Python order, byte for byte.
 */
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { iterErrors, errorLine, sortedErrors } from './lib/jsonschema.ts';
import { has, pyGet, pyJsonDumps, pyRound, pyRoundTo, readText, sortedNames, truthy, writeText } from './lib/py.ts';
import { load as yamlLoad } from './lib/pyyaml.ts';
import { REPO_ROOT } from './lib/root.ts';
import { contrast, hexToOklch, oklchToHex } from './oklch.ts';

export type Dict = Record<string, any>;
/** A token group written in insertion order even when its keys are numbers. */
export type Group = Map<string, unknown>;

/** Mutable so the tests can point the tool at a temp tree, the way pytest's `monkeypatch` did. */
export const paths = {
  ROOT: REPO_ROOT,
  DOCS: join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'themes'),
  SCHEMA: join(REPO_ROOT, 'schema', 'theme.schema.json'),
  OUT: join(REPO_ROOT, 'tokens', 'themes'),
};
const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n/;

// OKLCH lightness targets. Equal perceptual steps; ends pinned to white/black.
export const NEUTRAL_L: Record<string, number> = {
  '0': 1.0, '50': 0.975, '100': 0.945, '200': 0.89, '300': 0.80, '400': 0.67, '500': 0.55,
  '600': 0.46, '700': 0.38, '800': 0.29, '900': 0.21, '1000': 0.0,
};
export const RAMP_L: Record<string, number> = {
  '50': 0.97, '100': 0.93, '200': 0.87, '300': 0.78, '400': 0.68, '500': 0.58, '600': 0.50,
  '700': 0.42, '800': 0.34, '900': 0.26,
};
export const SYSTEM_SANS: string[] = ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'];
export const SYSTEM_MONO: string[] = ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'];
export const RADIUS: Record<string, [number, number, number, number]> = {
  none: [0, 0, 0, 0], sm: [2, 4, 6, 999], md: [4, 8, 12, 999], lg: [8, 12, 16, 999], full: [999, 999, 999, 999],
};
export const DENSITY: Record<string, number> = { compact: 0.75, comfortable: 1.0, roomy: 1.25 };
export const RHYTHM: Record<string, number> = { tight: 0.75, normal: 1.0, loose: 1.5 };
/** Multiplier on overlay shadow blur and opacity. */
export const ELEVATION: Record<string, number> = { flat: 0.0, subtle: 1.0, pronounced: 1.6 };
export const MOTION: Record<string, { fast: string; base: string }> = {
  none: { fast: '0ms', base: '0ms' },
  subtle: { fast: '120ms', base: '200ms' },
  expressive: { fast: '160ms', base: '320ms' },
};
export const SIZE_NAMES: string[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

/** DTCG token. */
export function T(v: unknown, extra: Dict = {}): Dict {
  return { $value: v, ...extra };
}

/** `{"$type": t, **group}` with the Python key order kept. */
function group(type: string | null, entries: Iterable<readonly [string, unknown]>, extra: Dict = {}): Group {
  const m: Group = new Map();
  if (type !== null) m.set('$type', type);
  for (const [k, v] of Object.entries(extra)) m.set(k, v);
  for (const [k, v] of entries) m.set(k, v);
  return m;
}

/** Chroma peaks near the seed lightness and tapers toward both ends so tints and shades stay clean. */
export function ramp(hue: number, chromaPeak: number, lTargets: Record<string, number>, seedL: number | null = null): Dict {
  const out: Dict = {};
  for (const [step, L] of Object.entries(lTargets)) {
    let c: number;
    if (L === 0.0 || L === 1.0) {
      c = 0.0;
    } else {
      const center = seedL !== null ? seedL : 0.58;
      const falloff = 1 - Math.min(1, Math.abs(L - center) / 0.55) ** 2;
      c = chromaPeak * Math.max(0.15, falloff);
    }
    out[step] = T(oklchToHex(L, c, hue));
  }
  return out;
}

// Two-seed palettes. With `seed.neutral` the grays take that color's hue and (capped) chroma instead of a faint
// cast of the brand hue, the light-mode page is that color lifted rather than white, and the darkest step stays
// warm rather than pure black. Without it nothing below runs and the output is byte-identical to before.
export const NEUTRAL_CHROMA_MAX = 0.06;
export const NEUTRAL_TOP_LIFT = 0.15;
export const NEUTRAL_TOP_MAX = 0.96;
/** A dark "neutral" seed still needs a light page to sit on. */
export const NEUTRAL_TOP_MIN = 0.86;
/** The darkest step: near-black with the hue kept, never #000. */
export const NEUTRAL_BOTTOM = 0.10;
/** Below this chroma the brand is "ink": the darkest neutral is the action fill in light mode, the lightest in dark. */
export const INK_CHROMA = 0.03;

/** NEUTRAL_L with the light end compressed under min(L + 0.15, 0.96) and the dark end lifted off 0.0. */
export function neutralTargets(neutralL: number): Record<string, number> {
  const top = Math.max(NEUTRAL_TOP_MIN, Math.min(neutralL + NEUTRAL_TOP_LIFT, NEUTRAL_TOP_MAX));
  const out: Record<string, number> = {};
  for (const [step, L] of Object.entries(NEUTRAL_L)) {
    if (L >= 0.80) out[step] = pyRoundTo(0.80 + ((L - 0.80) * (top - 0.80)) / 0.20, 4);
    else if (L <= 0.21) out[step] = pyRoundTo(NEUTRAL_BOTTOM + (L / 0.21) * (0.21 - NEUTRAL_BOTTOM), 4);
    else out[step] = L;
  }
  return out;
}

export function isInk(seedColor: string): boolean {
  return (hexToOklch(seedColor)[1] as number) < INK_CHROMA;
}

/** First step (in the given order) whose contrast against `against` meets the floor. */
export function lightestPassing(candidates: string[], rampIn: Dict, against: string, floor: number): string {
  for (const step of candidates) {
    if (contrast(rampIn[step].$value as string, against) >= floor) return step;
  }
  return candidates[candidates.length - 1] as string;
}

const ref = (path: string): string => `{${path}}`;

export function deriveBase(t: Dict): Dict {
  const [seedL, seedC, seedH] = hexToOklch(t.seed.color as string);
  const tint = pyGet(t, 'neutralTint', 0.2) as number;
  const hues: Dict = { danger: 25, success: 145, warning: 80, info: null, ...(pyGet(t, 'statusHues', {}) as Dict) };
  const neutralSeed = pyGet(t.seed, 'neutral', undefined) as string | undefined;
  let neutral: Dict;
  if (truthy(neutralSeed)) {
    const [nL, nC, nH] = hexToOklch(neutralSeed as string);
    neutral = ramp(nH, Math.min(nC, NEUTRAL_CHROMA_MAX), neutralTargets(nL), nL);
  } else {
    neutral = ramp(seedH, 0.03 * tint, NEUTRAL_L, 0.5);
  }
  const palette: Dict = {
    $description: 'Derived by tools/theme.ts — edit the theme doc, not this file.',
    neutral,
    brand: ramp(seedH, seedC, RAMP_L, seedL),
    danger: ramp(hues.danger as number, 0.19, RAMP_L),
    success: ramp(hues.success as number, 0.17, RAMP_L),
    warning: ramp(hues.warning as number, 0.16, RAMP_L),
    info: ramp(hues.info !== null && hues.info !== undefined ? (hues.info as number) : seedH, 0.15, RAMP_L),
  };
  // Typography
  const face = pyGet(t.seed, 'typeface', 'system') as string;
  const headingFace = pyGet(t.seed, 'headingTypeface', face) as string;
  const mono = pyGet(t.seed, 'mono', 'system') as string;
  const stack = (f: string, base: string[]): string[] => (f === 'system' ? base : [f, ...base]);
  const basePx = t.scale.base as number;
  const ratio = t.scale.ratio as number;
  const sizes: [string, unknown][] = SIZE_NAMES.map((name, i) => [name, T(`${pyRound(basePx * ratio ** (i - 2))}px`)]);
  // Spacing on a 4px grid scaled by density
  const mult = DENSITY[t.density as string] as number;
  const steps: [string, number][] = [['0', 0], ['1', 4], ['2', 8], ['3', 12], ['4', 16], ['5', 20], ['6', 24],
    ['8', 32], ['10', 40], ['12', 48], ['16', 64], ['20', 80]];
  const space: [string, unknown][] = steps.map(([k, v]) => [k, T(`${pyRound(v * mult)}px`)]);
  space.push(['sm', T('{space.2}')], ['md', T('{space.3}')], ['lg', T('{space.4}')]);
  // Layout rhythm: BETWEEN components and at page level. Density already scales `space`; rhythm scales the
  // between-component steps again so a compact tool and a loose marketing page can share one density.
  const layoutD = (truthy(pyGet(t, 'layout', null)) ? (t.layout as Dict) : {}) as Dict;
  const rhythm = RHYTHM[pyGet(layoutD, 'rhythm', 'normal') as string] as number;
  const contentW = Math.trunc(pyGet(layoutD, 'contentWidth', 960) as number);
  const px = (v: number): Dict => T(`${pyRound(v)}px`);
  const layout: Dict = {
    $type: 'dimension',
    gutter: { $description: 'Horizontal page padding at each breakpoint.',
      narrow: T('{space.4}'), default: T('{space.6}'), wide: T('{space.8}') },
    section: { $description: 'Vertical space between page sections (a Landmark, a heading group, a card row).',
      sm: px(32 * mult * rhythm), md: px(48 * mult * rhythm), lg: px(64 * mult * rhythm) },
    gap: { $description: 'Gap between siblings in either direction — the presets Stack, Card and Container expose. Scaled by density and rhythm.',
      none: T('{space.0}'), tight: px(4 * mult * rhythm), normal: px(8 * mult * rhythm), loose: px(16 * mult * rhythm), section: px(32 * mult * rhythm) },
    inset: { $description: 'Padding presets surfaces expose (Box, Card): sm/md/lg map to the space aliases.',
      none: T('{space.0}'), sm: T('{space.sm}'), md: T('{space.md}'), lg: T('{space.lg}'), xl: T('{space.8}') },
    maxWidth: { $description: 'Column widths. prose is a 65-character measure at the body size (px, so React Native can use it).',
      prose: px(basePx * 0.55 * 65), content: px(contentW), page: px((contentW * 4) / 3) },
    // Viewport breakpoints for page-level chrome only (foundations/layout.md, "Breakpoints are for page
    // chrome"). Plain pixel values, deliberately untouched by density and rhythm: those scale how much room
    // the content takes, while a breakpoint asks how much room the *device* has, which no theme decides.
    breakpoint: { $description: 'Viewport breakpoints for page chrome (header, docs layout) — not for components, which stay container-query-driven. Fixed px; density and rhythm do not scale them.',
      sm: T('640px'), md: T('768px'), lg: T('1024px') },
  };
  const [rSm, rMd, rLg, rFull] = RADIUS[t.radius as string] as [number, number, number, number];
  const motion = MOTION[pyGet(t, 'motion', 'subtle') as string] as { fast: string; base: string };
  return {
    color: { $type: 'color', palette },
    font: {
      family: { $type: 'fontFamily',
        body: T(stack(face, SYSTEM_SANS)),
        heading: T(stack(headingFace, SYSTEM_SANS)),
        mono: T(stack(mono, SYSTEM_MONO)) },
      weight: { $type: 'fontWeight', regular: T(400), medium: T(500), semibold: T(600), bold: T(700) },
      size: group('dimension', sizes),
      lineHeight: { $type: 'number', tight: T(1.2), normal: T(1.5), loose: T(1.7) },
    },
    space: group('dimension', space),
    layout,
    size: { $type: 'dimension', target: { min: T('24px'), comfortable: T('44px') } },
    radius: { $type: 'dimension', none: T('0px'), sm: T(`${rSm}px`), md: T(`${rMd}px`), lg: T(`${rLg}px`), full: T(`${rFull}px`) },
    border: { width: { $type: 'dimension', thin: T('1px'), focus: T('2px') } },
    opacity: { $type: 'number', disabled: T(0.5) },
    // Stacking order for overlays. Numbers, not dimensions; the same on every platform (zIndex on RN).
    layer: { $type: 'number', base: T(0), raised: T(1), dropdown: T(100), sheet: T(200), dialog: T(300), toast: T(400) },
    motion: {
      duration: { $type: 'duration', fast: T(motion.fast), base: T(motion.base), loop: T('800ms') },
      easing: { $type: 'cubicBezier', standard: T([0.2, 0, 0, 1]), exit: T([0.4, 0, 1, 1]) },
    },
  };
}

/**
 * color.status.<tone>.{background, foreground, border} for info/success/warning/danger.
 * Light: tinted 50 background with the darkest-passing text; dark: 900 background with a light tint as text.
 */
export function statusColors(p: Dict, mode: string, bg: string): Dict {
  const out: Dict = {};
  for (const tone of ['info', 'success', 'warning', 'danger']) {
    const rampIn = p[tone] as Dict;
    let surface: string;
    let text: string;
    let border: string;
    let icon: string;
    if (mode === 'light') {
      surface = '50';
      text = lightestPassing(['600', '700', '800', '900'], rampIn, rampIn[surface].$value as string, 4.5);
      border = '300';
      icon = lightestPassing(['600', '700'], rampIn, bg, 3.0);
    } else {
      surface = '900';
      text = lightestPassing(['200', '100', '50'], rampIn, rampIn[surface].$value as string, 4.5);
      border = '700';
      icon = lightestPassing(['300', '200'], rampIn, bg, 3.0);
    }
    out[tone] = { background: T(ref(`color.palette.${tone}.${surface}`)), foreground: T(ref(`color.palette.${tone}.${text}`)),
      border: T(ref(`color.palette.${tone}.${border}`)), icon: T(ref(`color.palette.${tone}.${icon}`)) };
  }
  return out;
}

/**
 * (selectedBackground step, selectedForeground neutral step) for checks/radios/switch tracks.
 * The fill must read as a UI boundary (3:1 against both the page and the control surface, WCAG 1.4.11)
 * and its indicator must read as text (4.5:1). Dark modes usually need a lighter brand step with dark ink.
 */
export function controlPair(b: Dict, n: Dict, bg: string, controlBg: string, candidates: string[]): [string, string] {
  for (const step of candidates) {
    const fill = b[step].$value as string;
    if (contrast(fill, bg) < 3.0 || contrast(fill, controlBg) < 3.0) continue;
    for (const ink of ['0', '1000']) {
      if (contrast(n[ink].$value as string, fill) >= 4.5) return [step, ink];
    }
  }
  return [candidates[candidates.length - 1] as string, '0'];
}

/** The brand step that reads as a boundary (3:1, WCAG 1.4.11) against both the page and the control surface. */
export function focusStep(b: Dict, pageBg: string, controlBg: string, candidates: string[]): string {
  for (const step of candidates) {
    if (contrast(b[step].$value as string, pageBg) >= 3.0 && contrast(b[step].$value as string, controlBg) >= 3.0) return step;
  }
  return candidates[candidates.length - 1] as string;
}

/**
 * The achromatic brand rule. An ink seed has no hue to carry an action, so the fill is the darkest neutral on
 * a light page and the lightest neutral on a dark one (the inverse), with the opposite end as its text; links are
 * the text color (Link always underlines, so color was never the only cue); the focus ring is the brand step that
 * passes 3:1 on both surfaces; the selected control fill follows the same inversion. Status hues are untouched.
 */
export function applyInk(semantic: Dict, b: Dict, n: Dict, mode: string, bg: string, controlBg: string): void {
  const dark = mode === 'dark';
  const [fill, ink, hover] = dark ? ['0', '1000', '100'] : ['1000', '0', '800'];
  semantic.action.primary = { background: T(ref(`color.palette.neutral.${fill}`)),
    backgroundHover: T(ref(`color.palette.neutral.${hover}`)),
    foreground: T(ref(`color.palette.neutral.${ink}`)) };
  semantic.link = { default: T(ref('color.foreground.default')), hover: T(ref('color.foreground.strong')),
    visited: T(ref('color.foreground.muted')) };
  const candidates = dark ? ['300', '400', '200', '500'] : ['500', '600', '700', '400'];
  semantic.border.focus = T(ref(`color.palette.brand.${focusStep(b, bg, controlBg, candidates)}`));
  semantic.control.selectedBackground = T(ref(`color.palette.neutral.${fill}`));
  semantic.control.selectedForeground = T(ref(`color.palette.neutral.${ink}`));
}

export function alphaHex(hexColor: string, alpha: number): string {
  return `${hexColor.slice(0, 7)}${pyRound(alpha * 255).toString(16).padStart(2, '0')}`;
}

/** Two elevation steps as DTCG shadow objects. Dark modes need stronger shadows to read at all. */
export function shadows(ink: string, elevation: number, dark: boolean): Dict {
  const [aRaised, aOverlay] = dark ? [0.35, 0.5] : [0.10, 0.18];
  const sh = (y: number, blur: number, a: number): Dict =>
    T({ color: alphaHex(ink, Math.min(1.0, a * elevation)), offsetX: '0px', offsetY: `${pyRound(y * elevation)}px`,
      blur: `${pyRound(blur * elevation)}px`, spread: '0px' });
  return { $type: 'shadow', raised: sh(1, 3, aRaised), overlay: sh(8, 24, aOverlay) };
}

/**
 * color.inverse.* — the flipped surface used by Tooltip and Toast (dark on light, light on dark).
 * Every step is chosen for contrast against the inverse surface, so text, links and status icons read on it.
 */
export function inverseColors(p: Dict, mode: string): Dict {
  const n = p.neutral as Dict;
  const b = p.brand as Dict;
  const [surfaceStep, fg, mutedCands, linkCands, iconCands] = mode === 'light'
    ? ['900', '50', ['300', '200'], ['300', '200', '100'], ['300', '200']]
    : ['100', '900', ['600', '700'], ['700', '800'], ['600', '700']];
  const surface = n[surfaceStep as string].$value as string;
  const muted = lightestPassing(mutedCands as string[], n, surface, 4.5);
  const link = lightestPassing(linkCands as string[], b, surface, 4.5);
  const status: Dict = { neutral: T(ref(`color.palette.neutral.${fg}`)) };
  for (const tone of ['info', 'success', 'warning', 'danger']) {
    status[tone] = T(ref(`color.palette.${tone}.${lightestPassing(iconCands as string[], p[tone] as Dict, surface, 3.0)}`));
  }
  return { surface: T(ref(`color.palette.neutral.${surfaceStep}`)), foreground: T(ref(`color.palette.neutral.${fg}`)),
    muted: T(ref(`color.palette.neutral.${muted}`)), link: T(ref(`color.palette.brand.${link}`)),
    focus: T(ref(`color.palette.brand.${link}`)), status };
}

export function deriveMode(base: Dict, mode: string, elevation = 1.0, ink: boolean | null = null): Dict {
  const p = base.color.palette as Dict;
  const n = p.neutral as Dict;
  const b = p.brand as Dict;
  const d = p.danger as Dict;
  // Detect from the ramp when the caller does not know the seed.
  const isInkBrand = ink === null ? (hexToOklch(b['500'].$value as string)[1] as number) < INK_CHROMA : ink;
  const white = n['0'].$value as string;
  let bg: string;
  let semantic: Dict;
  if (mode === 'light') {
    bg = n['0'].$value as string;
    const primary = lightestPassing(['500', '600', '700'], b, white, 4.5);
    const ghost = lightestPassing(['600', '700', '800'], b, bg, 4.5);
    const danger = lightestPassing(['600', '700'], d, white, 4.5);
    // Must read on background.strong too (Box/Card surfaces).
    const muted = lightestPassing(['500', '600', '700'], n, n['100'].$value as string, 4.5);
    // Non-text UI boundary: 3:1 (WCAG 1.4.11).
    const borderStrong = lightestPassing(['400', '500'], n, bg, 3.0);
    const [selected, selectedInk] = controlPair(b, n, bg, n['0'].$value as string, ['600', '700', '500', '800']);
    semantic = {
      foreground: { default: T(ref('color.palette.neutral.800')), strong: T(ref('color.palette.neutral.1000')),
        muted: T(ref(`color.palette.neutral.${muted}`)), onAction: T(ref('color.palette.neutral.0')),
        danger: T(ref(`color.palette.danger.${danger}`)) },
      background: { default: T(ref('color.palette.neutral.0')), subtle: T(ref('color.palette.neutral.50')),
        strong: T(ref('color.palette.neutral.100')) },
      border: { default: T(ref('color.palette.neutral.200')), strong: T(ref(`color.palette.neutral.${borderStrong}`)),
        focus: T(ref('color.palette.brand.500')), danger: T(ref(`color.palette.danger.${danger}`)) },
      link: { default: T(ref(`color.palette.brand.${ghost}`)), hover: T(ref(`color.palette.brand.${Math.min(900, parseInt(ghost, 10) + 100)}`)),
        visited: T(ref(`color.palette.brand.${Math.min(900, parseInt(ghost, 10) + 200)}`)) },
      control: { background: T(ref('color.palette.neutral.0')), border: T(ref(`color.palette.neutral.${borderStrong}`)),
        selectedBackground: T(ref(`color.palette.brand.${selected}`)), selectedForeground: T(ref(`color.palette.neutral.${selectedInk}`)),
        trackOff: T(ref(`color.palette.neutral.${borderStrong}`)) },
      status: statusColors(p, 'light', bg),
      overlay: { scrim: T(alphaHex(n['1000'].$value as string, 0.4)), surface: T(ref('color.palette.neutral.0')) },
      inverse: inverseColors(p, 'light'),
      action: {
        primary: { background: T(ref(`color.palette.brand.${primary}`)),
          backgroundHover: T(ref(`color.palette.brand.${parseInt(primary, 10) + 100}`)),
          foreground: T(ref('color.foreground.onAction')) },
        secondary: { background: T(ref('color.background.strong')), backgroundHover: T(ref('color.palette.neutral.200')),
          foreground: T(ref('color.foreground.strong')) },
        ghost: { background: T('transparent'), backgroundHover: T(ref('color.background.subtle')),
          foreground: T(ref(`color.palette.brand.${ghost}`)) },
        danger: { background: T(ref(`color.palette.danger.${danger}`)),
          backgroundHover: T(ref(`color.palette.danger.${Math.min(900, parseInt(danger, 10) + 100)}`)),
          foreground: T(ref('color.foreground.onAction')) },
      },
    };
  } else {
    bg = n['900'].$value as string;
    const primary = lightestPassing(['500', '600', '700'], b, white, 4.5);
    const ghost = lightestPassing(['300', '200', '100'], b, bg, 4.5);
    const danger = lightestPassing(['500', '600'], d, white, 4.5);
    const dangerFg = lightestPassing(['300', '200'], d, bg, 4.5);
    // Must read on background.strong (neutral.700) too.
    const muted = lightestPassing(['400', '300', '200'], n, n['700'].$value as string, 4.5);
    const borderStrong = lightestPassing(['500', '400'], n, bg, 3.0);
    const [selected, selectedInk] = controlPair(b, n, bg, n['800'].$value as string, ['500', '400', '300', '600']);
    semantic = {
      foreground: { default: T(ref('color.palette.neutral.100')), strong: T(ref('color.palette.neutral.0')),
        muted: T(ref(`color.palette.neutral.${muted}`)), onAction: T(ref('color.palette.neutral.0')),
        danger: T(ref(`color.palette.danger.${dangerFg}`)) },
      background: { default: T(ref('color.palette.neutral.900')), subtle: T(ref('color.palette.neutral.800')),
        strong: T(ref('color.palette.neutral.700')) },
      border: { default: T(ref('color.palette.neutral.700')), strong: T(ref(`color.palette.neutral.${borderStrong}`)),
        focus: T(ref('color.palette.brand.300')), danger: T(ref(`color.palette.danger.${dangerFg}`)) },
      link: { default: T(ref(`color.palette.brand.${ghost}`)), hover: T(ref(`color.palette.brand.${Math.max(50, parseInt(ghost, 10) - 100)}`)),
        visited: T(ref(`color.palette.brand.${Math.max(50, parseInt(ghost, 10) - 200)}`)) },
      control: { background: T(ref('color.palette.neutral.800')), border: T(ref(`color.palette.neutral.${borderStrong}`)),
        selectedBackground: T(ref(`color.palette.brand.${selected}`)), selectedForeground: T(ref(`color.palette.neutral.${selectedInk}`)),
        trackOff: T(ref(`color.palette.neutral.${borderStrong}`)) },
      status: statusColors(p, 'dark', bg),
      overlay: { scrim: T(alphaHex(n['1000'].$value as string, 0.6)), surface: T(ref('color.palette.neutral.800')) },
      inverse: inverseColors(p, 'dark'),
      action: {
        primary: { background: T(ref(`color.palette.brand.${primary}`)),
          backgroundHover: T(ref(`color.palette.brand.${Math.max(400, parseInt(primary, 10) - 100)}`)),
          foreground: T(ref('color.foreground.onAction')) },
        secondary: { background: T(ref('color.background.strong')), backgroundHover: T(ref('color.palette.neutral.600')),
          foreground: T(ref('color.foreground.strong')) },
        ghost: { background: T('transparent'), backgroundHover: T(ref('color.background.subtle')),
          foreground: T(ref(`color.palette.brand.${ghost}`)) },
        danger: { background: T(ref(`color.palette.danger.${danger}`)),
          backgroundHover: T(ref(`color.palette.danger.${Math.min(900, parseInt(danger, 10) + 100)}`)),
          foreground: T(ref('color.foreground.onAction')) },
      },
    };
  }
  if (isInkBrand) applyInk(semantic, b, n, mode, bg, mode === 'light' ? (n['0'].$value as string) : (n['800'].$value as string));
  return { color: { $type: 'color', $description: `Semantic layer (${mode}) — derived by tools/theme.ts.`, ...semantic },
    shadow: shadows(n['1000'].$value as string, elevation, mode === 'dark') };
}

export function applyOverrides(tree: Dict, overrides: Dict): void {
  for (const [path, value] of Object.entries(overrides)) {
    let node = tree;
    const parts = path.split('.');
    for (const part of parts.slice(0, -1)) {
      if (!Object.hasOwn(node, part)) node[part] = {};
      node = node[part] as Dict;
    }
    node[parts[parts.length - 1] as string] = T(value);
  }
}

/** `sorted(DOCS.glob("*.md"))`, tolerating a docs folder that does not exist. */
function themeDocs(dir: string): string[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  return sortedNames(names.filter((name) => extname(name) === '.md')).map((name) => join(dir, name));
}

export function main(): number {
  const schema = JSON.parse(readFileSync(paths.SCHEMA, 'utf8')) as Dict;
  const errors: string[] = [];
  const built: string[] = [];
  for (const path of themeDocs(paths.DOCS)) {
    const m = FRONTMATTER.exec(readText(path));
    const fm = (m ? yamlLoad(m[1] as string) : {}) as Dict;
    if (!has(fm, 'theme')) continue;
    const errs = sortedErrors(iterErrors(schema, fm));
    if (errs.length) {
      errors.push(`${basename(path)}:\n` + errs.map(errorLine).join('\n'));
      continue;
    }
    const t = fm.theme as Dict;
    if (t.id !== basename(path, '.md')) {
      errors.push(`${basename(path)}: theme.id '${t.id}' should match file name`);
      continue;
    }
    const out = join(paths.OUT, t.id as string);
    mkdirSync(out, { recursive: true });
    const base = deriveBase(t);
    writeText(join(out, 'base.json'), pyJsonDumps(base, 2) + '\n');
    const overrides = truthy(pyGet(t, 'overrides', null)) ? (t.overrides as Dict) : {};
    for (const mode of t.modes.supports as string[]) {
      const tree = deriveMode(base, mode, ELEVATION[pyGet(t, 'elevation', 'subtle') as string] as number, isInk(t.seed.color as string));
      applyOverrides(tree, truthy(pyGet(overrides, mode, null)) ? (overrides[mode] as Dict) : {});
      writeText(join(out, `${mode}.json`), pyJsonDumps(tree, 2) + '\n');
    }
    writeText(join(out, 'theme.json'), pyJsonDumps(t, 2) + '\n');
    built.push(`${t.id} (${(t.modes.supports as string[]).join(', ')})`);
  }
  for (const e of errors) process.stderr.write(`✖ ${e}\n`);
  process.stdout.write(`${errors.length ? '✖' : '✔'} themes: ${built.join(', ') || 'none'} → ${relative(paths.ROOT, paths.OUT)}/\n`);
  return errors.length ? 1 : 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  process.exitCode = main();
}
