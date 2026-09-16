/**
 * tools/theme.ts — theme doc frontmatter to DTCG token files. Port of tests/test_theme.py,
 * tests/test_theme_derivation.py and tests/test_two_seed.py.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import * as cc from '../check_contrast.ts';
import { expand } from '../check_contrast.ts';
import { pyJsonDumps, pyRound, product } from '../lib/py.ts';
import { dump as yamlDump } from '../lib/pyyaml.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { flatten, publicName, resolve as resolveTokens } from '../lib/tokens.ts';
import { contrast, hexToOklch, luminance } from '../oklch.ts';
import * as th from '../theme.ts';
import type { Dict } from '../theme.ts';
import { theme as themeFixture, useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const savedPaths = { ...th.paths };
afterEach(() => {
  Object.assign(th.paths, savedPaths);
});

/** The derived tree exactly as it lands on disk — plain objects, so tests can index it like the Python dicts. */
const asJson = (v: unknown): Dict => JSON.parse(pyJsonDumps(v, 2)) as Dict;

function deepMerge(a: Dict, b: Dict): Dict {
  for (const [k, v] of Object.entries(b)) {
    const isTree = (x: unknown): x is Dict => typeof x === 'object' && x !== null && !Array.isArray(x);
    if (isTree(v) && isTree(a[k])) deepMerge(a[k] as Dict, v);
    else a[k] = v;
  }
  return a;
}

/** base + mode merged and resolved the way tokens.loadTheme does on disk. */
function resolved(base: Dict, modeTree: Dict, publicNames = false): Record<string, any> {
  const tree = deepMerge(deepMerge({}, asJson(base)), asJson(modeTree));
  const out: Record<string, any> = {};
  for (const [p, e] of Object.entries(resolveTokens(flatten(tree)))) out[publicNames ? publicName(p) : p] = e.$value;
  return out;
}

const px = (v: string): number => parseInt(v.replace(/px$/, ''), 10);

describe('T', () => {
  test('wraps a value and carries extras', () => {
    expect(th.T('8px')).toEqual({ $value: '8px' });
    expect(th.T('8px', { $type: 'dimension' })).toEqual({ $value: '8px', $type: 'dimension' });
  });
});

describe('ramp', () => {
  test('one step per lightness target', () => {
    const r = th.ramp(268, 0.19, th.RAMP_L);
    expect(Object.keys(r)).toEqual(Object.keys(th.RAMP_L));
    expect(Object.values(r).every((v) => Object.keys(v as Dict).join() === '$value')).toBe(true);
  });

  test('pinned ends are pure white and black', () => {
    // NEUTRAL_L pins 0 to L=1.0 and 1000 to L=0.0; both must lose all chroma.
    const n = th.ramp(268, 0.03, th.NEUTRAL_L, 0.5);
    expect(n['0'].$value).toBe('#ffffff');
    expect(n['1000'].$value).toBe('#000000');
  });

  test('lightness decreases monotonically down the ramp', () => {
    const r = th.ramp(268, 0.19, th.RAMP_L, 0.52);
    const ls = Object.keys(th.RAMP_L).map((step) => hexToOklch(r[step].$value as string)[0]);
    expect(ls).toEqual([...ls].sort((a, b) => b - a));
  });

  test('each step lands on its lightness target', () => {
    const r = th.ramp(145, 0.17, th.RAMP_L);
    for (const [step, target] of Object.entries(th.RAMP_L)) {
      expect(hexToOklch(r[step].$value as string)[0]).toBeCloseTo(target, 2);
    }
  });

  test('hue is stable across the ramp', () => {
    const hues = Object.keys(th.RAMP_L).map((s) => hexToOklch(th.ramp(145, 0.17, th.RAMP_L)[s].$value as string)[2]);
    expect(Math.max(...hues) - Math.min(...hues)).toBeLessThan(8);
  });

  test('chroma peaks near the seed lightness', () => {
    const r = th.ramp(268, 0.19, th.RAMP_L, 0.58);
    const c = (s: string): number => hexToOklch(r[s].$value as string)[1] as number;
    expect(c('500')).toBeGreaterThan(c('50'));
    expect(c('500')).toBeGreaterThan(c('900'));
  });

  test('zero chroma peak produces grays', () => {
    for (const v of Object.values(th.ramp(268, 0.0, th.RAMP_L))) {
      expect(hexToOklch((v as Dict).$value as string)[1]).toBeCloseTo(0, 6);
    }
  });
});

describe('lightestPassing', () => {
  const RAMP: Dict = { '400': { $value: '#b9c4f2' }, '500': { $value: '#7b8fe0' },
    '600': { $value: '#3553d2' }, '700': { $value: '#243ab3' } };

  test('returns the first candidate that meets the floor', () => {
    expect(th.lightestPassing(['400', '500', '600', '700'], RAMP, '#ffffff', 4.5)).toBe('600');
  });

  test('candidate order, not step order, decides', () => {
    expect(th.lightestPassing(['700', '600'], RAMP, '#ffffff', 4.5)).toBe('700');
  });

  test('falls back to the last candidate when none pass', () => {
    // Nothing on this ramp reaches 21:1; the darkest listed option is returned.
    expect(th.lightestPassing(['400', '500'], RAMP, '#ffffff', 21.0)).toBe('500');
  });

  test('a lower floor lets a lighter step through', () => {
    expect(th.lightestPassing(['400', '500', '600'], RAMP, '#ffffff', 3.0)).toBe('500');
  });
});

describe('deriveBase', () => {
  test('palette has every ramp', () => {
    const p = th.deriveBase(themeFixture()).color.palette as Dict;
    for (const k of ['neutral', 'brand', 'danger', 'success', 'warning', 'info']) expect(Object.keys(p)).toContain(k);
  });

  test('brand ramp is built around the seed hue', () => {
    const t = themeFixture();
    const seedH = hexToOklch(t.seed.color as string)[2] as number;
    const brand = th.deriveBase(t).color.palette.brand as Dict;
    expect(hexToOklch(brand['500'].$value as string)[2]).toBeCloseTo(seedH, 0);
  });

  test('status hues have their conventional defaults', () => {
    const p = th.deriveBase(themeFixture()).color.palette as Dict;
    expect(hexToOklch(p.danger['500'].$value as string)[2]).toBeCloseTo(25, 0);
    expect(hexToOklch(p.success['500'].$value as string)[2]).toBeCloseTo(145, 0);
  });

  test('status hues can be overridden in the doc', () => {
    const t = { ...themeFixture(), statusHues: { danger: 12 } };
    expect(hexToOklch(th.deriveBase(t).color.palette.danger['500'].$value as string)[2]).toBeCloseTo(12, 0);
  });

  test('info defaults to the seed hue', () => {
    const p = th.deriveBase(themeFixture()).color.palette as Dict;
    expect(hexToOklch(p.info['500'].$value as string)[2]).toBeCloseTo(hexToOklch(p.brand['500'].$value as string)[2] as number, 0);
  });

  test('neutralTint controls how far grays lean to the seed', () => {
    const cool = th.deriveBase({ ...themeFixture(), neutralTint: 1.0 }).color.palette.neutral as Dict;
    const flat = th.deriveBase({ ...themeFixture(), neutralTint: 0.0 }).color.palette.neutral as Dict;
    expect(hexToOklch(cool['500'].$value as string)[1]).toBeGreaterThan(hexToOklch(flat['500'].$value as string)[1] as number);
    expect(hexToOklch(flat['500'].$value as string)[1]).toBeCloseTo(0, 6);
  });

  test('the type scale is the modular scale with md at the base', () => {
    const sizes = asJson(th.deriveBase(themeFixture()).font.size);
    expect(sizes.md.$value).toBe('16px'); // base
    expect(sizes.sm.$value).toBe('13px'); // 16 / 1.2
    expect(sizes.lg.$value).toBe('19px'); // 16 * 1.2
    expect(Object.keys(sizes).filter((k) => k !== '$type')).toEqual(th.SIZE_NAMES);
  });

  test('a bigger ratio spreads the scale', () => {
    const wide = asJson(th.deriveBase({ ...themeFixture(), scale: { base: 16, ratio: 1.5 } }).font.size);
    expect(px(wide['4xl'].$value as string)).toBeGreaterThan(40);
  });

  test.each([['compact', '9px'], ['comfortable', '12px'], ['roomy', '15px']])(
    'density %s scales the spacing grid', (density, step3) => {
      const space = asJson(th.deriveBase({ ...themeFixture(), density }).space);
      expect(space['3'].$value).toBe(step3);
      expect(space['0'].$value).toBe('0px'); // zero stays zero at every density
    });

  test('spacing aliases reference numbered steps', () => {
    const space = asJson(th.deriveBase(themeFixture()).space);
    expect(space.sm.$value).toBe('{space.2}');
    expect(space.md.$value).toBe('{space.3}');
    expect(space.lg.$value).toBe('{space.4}');
  });

  test.each([['none', '0px'], ['sm', '4px'], ['md', '8px'], ['lg', '12px'], ['full', '999px']])(
    'radius %s sets radius.md', (radius, expected) => {
      expect(th.deriveBase({ ...themeFixture(), radius }).radius.md.$value).toBe(expected);
    });

  test('radius full is always a pill', () => {
    expect(th.deriveBase(themeFixture()).radius.full.$value).toBe('999px');
  });

  test.each([['none', '0ms'], ['subtle', '120ms'], ['expressive', '160ms']])(
    'motion %s sets the durations', (motion, fast) => {
      expect(th.deriveBase({ ...themeFixture(), motion }).motion.duration.fast.$value).toBe(fast);
    });

  test('the system typeface uses the platform stack unchanged', () => {
    const fam = th.deriveBase(themeFixture()).font.family as Dict;
    expect(fam.body.$value).toEqual(th.SYSTEM_SANS);
    expect(fam.mono.$value).toEqual(th.SYSTEM_MONO);
  });

  test('a named typeface is prepended as the first choice', () => {
    const t = themeFixture();
    t.seed = { ...t.seed, typeface: 'Inter', headingTypeface: 'Söhne', mono: 'JetBrains Mono' };
    const fam = th.deriveBase(t).font.family as Dict;
    expect(fam.body.$value).toEqual(['Inter', ...th.SYSTEM_SANS]);
    expect(fam.heading.$value).toEqual(['Söhne', ...th.SYSTEM_SANS]);
    expect(fam.mono.$value).toEqual(['JetBrains Mono', ...th.SYSTEM_MONO]);
  });

  test('the heading face falls back to the body face', () => {
    const t = themeFixture();
    t.seed = { ...t.seed, typeface: 'Inter' };
    const fam = th.deriveBase(t).font.family as Dict;
    expect(fam.heading.$value).toEqual(fam.body.$value);
  });

  test('target sizes meet the WCAG minimums', () => {
    const target = th.deriveBase(themeFixture()).size.target as Dict;
    expect(target.min.$value).toBe('24px'); // WCAG 2.2 AA (2.5.8)
    expect(target.comfortable.$value).toBe('44px'); // touch
  });
});

describe('deriveMode', () => {
  test.each(['light', 'dark'])('%s has every semantic group', (mode) => {
    const c = th.deriveMode(th.deriveBase(themeFixture()), mode).color as Dict;
    for (const k of ['foreground', 'background', 'border', 'action']) expect(Object.keys(c)).toContain(k);
    expect(Object.keys(c.action as Dict).sort()).toEqual(['danger', 'ghost', 'primary', 'secondary']);
  });

  test.each(['light', 'dark'])('%s semantic values are references, not literals', (mode) => {
    const c = th.deriveMode(th.deriveBase(themeFixture()), mode).color as Dict;
    expect(c.foreground.default.$value as string).toMatch(/^\{color\.palette\./);
    expect(c.action.ghost.background.$value).toBe('transparent'); // ghost is the one literal
  });

  test.each(product([['light', 'dark'], ['primary', 'secondary', 'danger']]))(
    '%s action %s text meets AA on its own background', (mode, variant) => {
      const base = th.deriveBase(themeFixture());
      const flat = resolved(base, th.deriveMode(base, mode as string));
      expect(contrast(flat[`color.action.${variant}.foreground`], flat[`color.action.${variant}.background`])).toBeGreaterThanOrEqual(4.5);
    });

  test.each(['light', 'dark'])('%s ghost text meets AA on the page background', (mode) => {
    const base = th.deriveBase(themeFixture());
    const flat = resolved(base, th.deriveMode(base, mode));
    expect(contrast(flat['color.action.ghost.foreground'], flat['color.background.default'])).toBeGreaterThanOrEqual(4.5);
  });

  test.each(['light', 'dark'])('%s body and muted text meet AA on the page background', (mode) => {
    const base = th.deriveBase(themeFixture());
    const flat = resolved(base, th.deriveMode(base, mode));
    const bg = flat['color.background.default'];
    expect(contrast(flat['color.foreground.default'], bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(flat['color.foreground.muted'], bg)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(['light', 'dark'])('%s strong border meets the non-text UI floor', (mode) => {
    // WCAG 1.4.11 asks 3:1 for meaningful non-text boundaries.
    const base = th.deriveBase(themeFixture());
    const flat = resolved(base, th.deriveMode(base, mode));
    expect(contrast(flat['color.border.strong'], flat['color.background.default'])).toBeGreaterThanOrEqual(3.0);
  });

  test('light and dark invert the page background', () => {
    const base = th.deriveBase(themeFixture());
    const light = resolved(base, th.deriveMode(base, 'light'));
    const dark = resolved(base, th.deriveMode(base, 'dark'));
    expect(luminance(light['color.background.default'])).toBeGreaterThan(luminance(dark['color.background.default']));
  });

  test('hover steps stay inside the ramp', () => {
    const base = th.deriveBase(themeFixture());
    const rampSteps = Object.keys(base.color.palette.brand as Dict);
    for (const mode of ['light', 'dark']) {
      const tree = th.deriveMode(base, mode);
      for (const variant of ['primary', 'danger']) {
        const ref = tree.color.action[variant].backgroundHover.$value as string;
        expect(rampSteps, `${variant}/${mode}: ${ref}`).toContain(ref.replace(/[{}]/g, '').split('.').at(-1));
      }
    }
  });

  test('hover is darker than rest in light and lighter in dark', () => {
    const base = th.deriveBase(themeFixture());
    const light = resolved(base, th.deriveMode(base, 'light'));
    const dark = resolved(base, th.deriveMode(base, 'dark'));
    expect(luminance(light['color.action.primary.backgroundHover'])).toBeLessThan(luminance(light['color.action.primary.background']));
    expect(luminance(dark['color.action.primary.backgroundHover'])).toBeGreaterThan(luminance(dark['color.action.primary.background']));
  });

  test('a hostile seed still produces passing actions', () => {
    // Yellow is the classic case where 500 cannot carry white text.
    const t = themeFixture();
    t.seed = { ...t.seed, color: '#FFD400' };
    const base = th.deriveBase(t);
    const flat = resolved(base, th.deriveMode(base, 'light'));
    expect(contrast(flat['color.action.primary.foreground'], flat['color.action.primary.background'])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('layout', () => {
  test('contentWidth defaults to 960', () => {
    expect(th.deriveBase(themeFixture()).layout.maxWidth.content.$value).toBe('960px');
  });

  test('maxWidth.page is four thirds of contentWidth', () => {
    const layout = th.deriveBase({ ...themeFixture(), layout: { contentWidth: 900 } }).layout as Dict;
    expect(layout.maxWidth.content.$value).toBe('900px');
    expect(layout.maxWidth.page.$value).toBe('1200px');
  });

  test.each([['tight', '6px'], ['normal', '8px'], ['loose', '12px']])(
    'rhythm %s scales the between-component gap', (rhythm, gapNormal) => {
      expect(th.deriveBase({ ...themeFixture(), layout: { rhythm } }).layout.gap.normal.$value).toBe(gapNormal);
    });

  test.each([['compact', '6px'], ['comfortable', '8px'], ['roomy', '10px']])(
    'density %s also scales the same gap', (density, gapNormal) => {
      expect(th.deriveBase({ ...themeFixture(), density }).layout.gap.normal.$value).toBe(gapNormal);
    });

  test('density and rhythm compound', () => {
    // 8 * 0.75 (compact) * 1.5 (loose) = 9
    const layout = th.deriveBase({ ...themeFixture(), density: 'compact', layout: { rhythm: 'loose' } }).layout as Dict;
    expect(layout.gap.normal.$value).toBe('9px');
  });

  test('gap.none stays a reference and is not scaled', () => {
    expect(th.deriveBase({ ...themeFixture(), layout: { rhythm: 'loose' } }).layout.gap.none.$value).toBe('{space.0}');
  });

  test.each([['comfortable', 'normal', 48, 16], ['compact', 'tight', 27, 9], ['roomy', 'loose', 90, 30], ['compact', 'loose', 54, 18]])(
    'between-component steps scale by density (%s) × rhythm (%s)', (density, rhythm, sectionMd, gapLoose) => {
      const layout = th.deriveBase({ ...themeFixture(), density, layout: { rhythm } }).layout as Dict;
      expect(px(layout.section.md.$value as string)).toBe(sectionMd);
      expect(px(layout.gap.loose.$value as string)).toBe(gapLoose);
    });

  test('section and gap keep their proportions at every rhythm', () => {
    for (const rhythm of Object.keys(th.RHYTHM)) {
      const layout = th.deriveBase({ ...themeFixture(), layout: { rhythm } }).layout as Dict;
      const [sm, md, lg] = ['sm', 'md', 'lg'].map((k) => px(layout.section[k].$value as string));
      expect(sm).toBeLessThan(md as number);
      expect(md).toBeLessThan(lg as number);
      const [tight, normal, loose] = ['tight', 'normal', 'loose'].map((k) => px(layout.gap[k].$value as string));
      expect(tight).toBeLessThan(normal as number);
      expect(normal).toBeLessThan(loose as number);
    }
  });

  test('within-component spacing is untouched by rhythm', () => {
    // Density scales `space`; rhythm must not, or a loose page would also loosen every button.
    const tight = asJson(th.deriveBase({ ...themeFixture(), layout: { rhythm: 'tight' } }).space);
    const loose = asJson(th.deriveBase({ ...themeFixture(), layout: { rhythm: 'loose' } }).space);
    expect(tight).toEqual(loose);
  });

  test('gutter and inset are references into space', () => {
    const layout = th.deriveBase(themeFixture()).layout as Dict;
    expect(layout.gutter.default.$value).toBe('{space.6}');
    expect(layout.inset.md.$value).toBe('{space.md}');
    expect(layout.gap.none.$value).toBe('{space.0}');
  });

  test('a missing layout block means normal rhythm at 960', () => {
    const t = themeFixture();
    delete t.layout;
    const layout = th.deriveBase(t).layout as Dict;
    expect(layout.maxWidth.content.$value).toBe('960px');
    expect(px(layout.gap.normal.$value as string)).toBe(8);
  });

  test.each([[960, 1280], [1040, 1387], [720, 960]])('page is four thirds of content (%i)', (content, page) => {
    const mw = th.deriveBase({ ...themeFixture(), layout: { contentWidth: content } }).layout.maxWidth as Dict;
    expect(mw.content.$value).toBe(`${content}px`);
    expect(mw.page.$value).toBe(`${page}px`);
  });

  test('prose is a 65-character measure at the body size', () => {
    const mw = th.deriveBase({ ...themeFixture(), scale: { base: 16, ratio: 1.2 } }).layout.maxWidth as Dict;
    expect(mw.prose.$value).toBe(`${pyRound(16 * 0.55 * 65)}px`);
    const bigger = th.deriveBase({ ...themeFixture(), scale: { base: 20, ratio: 1.2 } }).layout.maxWidth as Dict;
    expect(px(bigger.prose.$value as string)).toBeGreaterThan(px(mw.prose.$value as string));
  });

  test('widths are absolute pixels so React Native can use them', () => {
    const mw = th.deriveBase(themeFixture()).layout.maxWidth as Dict;
    for (const k of ['prose', 'content', 'page']) {
      expect(mw[k].$value as string).toMatch(/px$/);
      expect(mw[k].$value as string).not.toContain('{');
    }
  });

  test('breakpoints are the conventional 640/768/1024', () => {
    const bp = th.deriveBase(themeFixture()).layout.breakpoint as Dict;
    expect([bp.sm.$value, bp.md.$value, bp.lg.$value]).toEqual(['640px', '768px', '1024px']);
  });

  test('no density, rhythm or contentWidth moves a breakpoint', () => {
    // The one layout group that describes the device rather than the theme: a compact tool still has to
    // decide "does a sidebar fit?" at the width a roomy one does.
    const baseline = asJson(th.deriveBase(themeFixture()).layout.breakpoint);
    for (const density of Object.keys(th.DENSITY)) {
      for (const rhythm of Object.keys(th.RHYTHM)) {
        const layout = th.deriveBase({ ...themeFixture(), density, layout: { rhythm, contentWidth: 1120 } }).layout as Dict;
        expect(asJson(layout.breakpoint), `${density}/${rhythm}`).toEqual(baseline);
      }
    }
  });

  test('breakpoints are absolute pixels, not references — a media query cannot resolve one', () => {
    const bp = th.deriveBase(themeFixture()).layout.breakpoint as Dict;
    for (const k of ['sm', 'md', 'lg']) {
      expect(bp[k].$value as string).toMatch(/^\d+px$/);
    }
  });
});

describe('inverse colors', () => {
  test.each(['light', 'dark'])('%s foreground, link and muted meet AA on the inverse surface', (mode) => {
    const base = th.deriveBase(themeFixture());
    const flat = resolved(base, th.deriveMode(base, mode));
    const surface = flat['color.inverse.surface'];
    expect(contrast(flat['color.inverse.foreground'], surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(flat['color.inverse.link'], surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(flat['color.inverse.muted'], surface)).toBeGreaterThanOrEqual(4.5);
  });

  test.each(['light', 'dark'])('%s status icons meet the non-text floor on the inverse surface', (mode) => {
    const base = th.deriveBase(themeFixture());
    const flat = resolved(base, th.deriveMode(base, mode));
    for (const tone of ['info', 'success', 'warning', 'danger']) {
      expect(contrast(flat[`color.inverse.status.${tone}`], flat['color.inverse.surface']), `${tone}/${mode}`).toBeGreaterThanOrEqual(3.0);
    }
  });

  test('the inverse surface flips the page in each mode', () => {
    const base = th.deriveBase(themeFixture());
    for (const mode of ['light', 'dark']) {
      const flat = resolved(base, th.deriveMode(base, mode));
      const page = luminance(flat['color.background.default']);
      const inv = luminance(flat['color.inverse.surface']);
      expect(mode === 'light' ? page > inv : page < inv, mode).toBe(true);
    }
  });

  test('the focus ring on the inverse surface reuses the link step', () => {
    const base = th.deriveBase(themeFixture());
    for (const mode of ['light', 'dark']) {
      const inv = th.inverseColors(base.color.palette as Dict, mode);
      expect(inv.focus.$value).toBe(inv.link.$value);
    }
  });

  test('a hostile seed still yields a readable inverse link', () => {
    const t = themeFixture();
    t.seed = { ...t.seed, color: '#FFEBBA' }; // nearly colorless, very light
    const base = th.deriveBase(t);
    for (const mode of ['light', 'dark']) {
      const flat = resolved(base, th.deriveMode(base, mode));
      expect(contrast(flat['color.inverse.link'], flat['color.inverse.surface']), mode).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('alphaHex', () => {
  test('appends the alpha byte', () => {
    expect(th.alphaHex('#3b5bdb', 0.4)).toBe('#3b5bdb66');
    expect(th.alphaHex('#000000', 0.0)).toBe('#00000000');
    expect(th.alphaHex('#000000', 1.0)).toBe('#000000ff');
  });

  test('an existing alpha is replaced, not stacked', () => {
    expect(th.alphaHex('#00000080', 0.5)).toBe('#00000080');
  });
});

describe('shadows', () => {
  const INK = '#000000';

  test('two steps as DTCG shadow objects', () => {
    const s = th.shadows(INK, 1.0, false);
    expect(s.$type).toBe('shadow');
    expect(Object.keys(s).sort()).toEqual(['$type', 'overlay', 'raised']);
    const raised = s.raised.$value as Dict;
    expect(Object.keys(raised).sort()).toEqual(['blur', 'color', 'offsetX', 'offsetY', 'spread']);
    expect(raised.offsetX).toBe('0px');
    expect(raised.spread).toBe('0px');
  });

  test('subtle elevation gives the base geometry and opacity', () => {
    const s = th.shadows(INK, th.ELEVATION.subtle as number, false);
    expect(s.raised.$value).toEqual({ color: '#0000001a', offsetX: '0px', offsetY: '1px', blur: '3px', spread: '0px' });
    expect(s.overlay.$value.offsetY).toBe('8px');
    expect(s.overlay.$value.blur).toBe('24px');
    expect(s.overlay.$value.color).toBe('#0000002e');
  });

  test('pronounced elevation scales offset, blur and opacity', () => {
    const base = th.shadows(INK, 1.0, false).overlay.$value as Dict;
    const big = th.shadows(INK, th.ELEVATION.pronounced as number, false).overlay.$value as Dict;
    expect(px(big.offsetY as string)).toBeGreaterThan(px(base.offsetY as string));
    expect(px(big.blur as string)).toBeGreaterThan(px(base.blur as string));
    expect(parseInt((big.color as string).slice(7), 16)).toBeGreaterThan(parseInt((base.color as string).slice(7), 16));
    expect(big.blur).toBe(`${pyRound(24 * (th.ELEVATION.pronounced as number))}px`);
  });

  test('flat elevation has zero alpha and no geometry', () => {
    const s = th.shadows(INK, th.ELEVATION.flat as number, false);
    for (const step of ['raised', 'overlay']) {
      const v = s[step].$value as Dict;
      expect(v.color as string).toMatch(/00$/); // fully transparent
      expect(v.offsetY).toBe('0px');
      expect(v.blur).toBe('0px');
    }
  });

  test('opacity is capped at fully opaque', () => {
    expect(th.shadows(INK, 10.0, true).overlay.$value.color).toBe('#000000ff');
  });

  test('dark-mode shadows are stronger than light', () => {
    const light = th.shadows(INK, 1.0, false);
    const dark = th.shadows(INK, 1.0, true);
    for (const step of ['raised', 'overlay']) {
      expect(parseInt((dark[step].$value.color as string).slice(7), 16))
        .toBeGreaterThan(parseInt((light[step].$value.color as string).slice(7), 16));
    }
  });

  test('shadows are cast in the darkest neutral', () => {
    expect(th.shadows('#1a1814', 1.0, false).raised.$value.color as string).toMatch(/^#1a1814/);
  });

  test.each(Object.keys(th.ELEVATION))('deriveMode carries the shadow group at %s elevation', (elevation) => {
    const base = th.deriveBase(themeFixture());
    const tree = th.deriveMode(base, 'light', th.ELEVATION[elevation] as number);
    expect(tree.shadow).toEqual(th.shadows(base.color.palette.neutral['1000'].$value as string, th.ELEVATION[elevation] as number, false));
  });

  test('deriveMode defaults to subtle elevation', () => {
    const base = th.deriveBase(themeFixture());
    expect(th.deriveMode(base, 'dark').shadow).toEqual(th.deriveMode(base, 'dark', th.ELEVATION.subtle as number).shadow);
  });
});

describe('controlPair', () => {
  const CANDIDATES = ['600', '700', '500', '800'];
  const palette = (): Dict => th.deriveBase(themeFixture()).color.palette as Dict;

  test('the selected fill meets 3:1 on both the page and the control surface', () => {
    const p = palette();
    const pageBg = p.neutral['0'].$value as string;
    const [step] = th.controlPair(p.brand as Dict, p.neutral as Dict, pageBg, pageBg, CANDIDATES);
    const fill = p.brand[step].$value as string;
    expect(contrast(fill, pageBg)).toBeGreaterThanOrEqual(3.0);
  });

  test('the indicator ink meets 4.5:1 against the chosen fill', () => {
    const p = palette();
    const white = p.neutral['0'].$value as string;
    const [step, ink] = th.controlPair(p.brand as Dict, p.neutral as Dict, white, white, CANDIDATES);
    expect(contrast(p.neutral[ink].$value as string, p.brand[step].$value as string)).toBeGreaterThanOrEqual(4.5);
  });

  test('candidate order, not ramp order, decides', () => {
    const p = palette();
    const white = p.neutral['0'].$value as string;
    // 600 and 700 both clear every floor against white; listing 700 first must win.
    expect(th.controlPair(p.brand as Dict, p.neutral as Dict, white, white, ['700', '600'])[0]).toBe('700');
  });

  test('a candidate that fails the control surface is skipped even if it passes the page', () => {
    const p = palette();
    const pageBg = p.neutral['0'].$value as string;
    const controlBg = p.neutral['800'].$value as string;
    // 600 clears 3:1 against the white page but not against the darker control surface.
    expect(contrast(p.brand['600'].$value as string, controlBg)).toBeLessThan(3.0);
    expect(contrast(p.brand['600'].$value as string, pageBg)).toBeGreaterThanOrEqual(3.0);
    const [step] = th.controlPair(p.brand as Dict, p.neutral as Dict, pageBg, controlBg, ['600', '500']);
    expect(step).toBe('500');
    expect(contrast(p.brand[step].$value as string, controlBg)).toBeGreaterThanOrEqual(3.0);
  });

  test('falls back to the last candidate with white ink when none pass', () => {
    const p = palette();
    // A control surface as dark as the candidate itself never clears 3:1.
    expect(th.controlPair(p.brand as Dict, p.neutral as Dict, p.neutral['0'].$value as string, p.brand['500'].$value as string, ['500']))
      .toEqual(['500', '0']);
  });
});

describe('applyOverrides', () => {
  test('replaces an existing leaf', () => {
    const tree: Dict = { color: { foreground: { default: { $value: '{color.palette.neutral.800}' } } } };
    th.applyOverrides(tree, { 'color.foreground.default': '#123456' });
    expect(tree.color.foreground.default).toEqual({ $value: '#123456' });
  });

  test('throws on a path the tree does not hold, creating nothing', () => {
    const tree: Dict = { color: { action: { primary: { background: { $value: '{color.palette.brand.600}' } } } } };
    expect(() => th.applyOverrides(tree, { 'color.action.primry.background': '#abcdef' })).toThrow("applyOverrides: 'color.action.primry.background' is not a token in this tree");
    expect(() => th.applyOverrides(tree, { 'colour.action.primary.background': '#abcdef' })).toThrow('is not a token in this tree');
    expect(tree).toEqual({ color: { action: { primary: { background: { $value: '{color.palette.brand.600}' } } } } });
  });

  test('a public name lands on the .default leaf', () => {
    const tree: Dict = { color: { foreground: { default: { $value: '{color.palette.neutral.800}' }, muted: { $value: '#777777' } } } };
    th.applyOverrides(tree, { 'color.foreground': '#123456' });
    expect(tree.color.foreground).toEqual({ default: { $value: '#123456' }, muted: { $value: '#777777' } });
  });

  test('a leaf in a Map group is replaced in place', () => {
    const base = th.deriveBase(themeFixture());
    th.applyOverrides(base, { 'space.3': '10px' });
    const space = asJson(base.space);
    expect(space['3'].$value).toBe('10px');
    expect(Object.keys(space)).toEqual(Object.keys(asJson(th.deriveBase(themeFixture()).space)));
  });

  test('empty overrides change nothing', () => {
    const tree: Dict = { color: { fg: { $value: '#000' } } };
    th.applyOverrides(tree, {});
    expect(tree).toEqual({ color: { fg: { $value: '#000' } } });
  });

  test('a reference can be used as the override value', () => {
    const tree: Dict = { color: { border: { focus: { $value: '{color.palette.brand.500}' } } } };
    th.applyOverrides(tree, { 'color.border.focus': '{color.palette.brand.700}' });
    expect(tree.color.border.focus.$value).toBe('{color.palette.brand.700}');
  });
});

describe('main', () => {
  const std = useStd();

  /** main() reads theme docs from paths.DOCS and writes token files to paths.OUT. */
  function run(docsText: string, name = 'test-theme.md'): [number, string] {
    const docs = join(tmp(), 'docs');
    const out = join(tmp(), 'out');
    write(join(docs, name), docsText);
    Object.assign(th.paths, { ROOT: tmp(), DOCS: docs, OUT: out });
    return [th.main(), out];
  }

  const doc = (t: Dict, body = '\nSome prose.\n'): string =>
    '---\n' + yamlDump({ title: 'Test', theme: t }) + '---\n' + body;

  test('writes base, the modes and the source decisions', () => {
    const [code, out] = run(doc(themeFixture()));
    expect(code).toBe(0);
    for (const f of ['base.json', 'light.json', 'dark.json', 'theme.json']) {
      expect(existsSync(join(out, 'test-theme', f)), f).toBe(true);
    }
    expect(JSON.parse(readFileSync(join(out, 'test-theme', 'theme.json'), 'utf8')).id).toBe('test-theme');
  });

  test('only declared modes are written', () => {
    const t = themeFixture();
    t.modes = { default: 'light', supports: ['light'] };
    const [, out] = run(doc(t));
    expect(existsSync(join(out, 'test-theme', 'light.json'))).toBe(true);
    expect(existsSync(join(out, 'test-theme', 'dark.json'))).toBe(false);
  });

  test('the id must match the file name', () => {
    const [code] = run(doc(themeFixture()), 'other-name.md');
    expect(code).toBe(1);
    expect(std.err()).toContain('should match file name');
  });

  test('schema violations fail the build', () => {
    const t = themeFixture();
    t.density = 'cavernous';
    expect(run(doc(t))[0]).toBe(1);
    expect(std.err()).toContain('✖ test-theme.md:\n  - theme.density: Invalid option: expected one of "compact"|"comfortable"|"roomy"\n');
  });

  // One failing fixture per rule schema/theme.ts adds: combinations tools/theme.ts would otherwise ignore, and
  // values the hand-written JSON schema let through.
  test.each<[string, (t: Dict) => void, string]>([
    ['neutralTint beside seed.neutral', (t) => { t.seed.neutral = '#C9B99C'; },
      'theme.neutralTint: neutralTint has no effect when seed.neutral is set: the neutral ramp takes its hue and chroma from seed.neutral; remove one'],
    ['a mode listed twice', (t) => { t.modes = { default: 'light', supports: ['light', 'dark', 'light'] }; },
      "theme.modes.supports.2: 'light' is listed twice"],
    ['a default mode not supported', (t) => { t.modes = { default: 'dark', supports: ['light'] }; },
      "theme.modes.default: default mode 'dark' is not in modes.supports"],
    ['a fractional content width', (t) => { t.layout = { rhythm: 'normal', contentWidth: 960.5 }; },
      'theme.layout.contentWidth: Invalid input: expected int, received number'],
    ['a status hue past 360', (t) => { t.statusHues = { danger: 400 }; },
      'theme.statusHues.danger: Too big: expected number to be <=360'],
    ['an empty tone word', (t) => { t.tone = ['calm', '']; },
      'theme.tone.1: Too small: expected string to have >=1 characters'],
    ['a misspelled mode override path', (t) => { t.overrides = { light: { 'color.action.primry.background': '#3B5BDB' } }; },
      "theme.overrides.light.color.action.primry.background: overrides.light: 'color.action.primry.background' is not a mode token"],
    ['a base token under light', (t) => { t.overrides = { light: { 'radius.md': '10px' } }; },
      "theme.overrides.light.radius.md: overrides.light: 'radius.md' is not a mode token: it is a base token, so it goes under overrides.base"],
    ['a color value on a dimension token', (t) => { t.overrides = { base: { 'radius.md': '#3B5BDB' } }; },
      "theme.overrides.base.radius.md: overrides.base.radius.md: expected a dimension value, got '#3B5BDB'"],
    ['a dangling reference', (t) => { t.overrides = { dark: { 'color.border.focus': '{color.palette.brand.1200}' } }; },
      "theme.overrides.dark.color.border.focus: overrides.dark.color.border.focus: expected a color value, got '{color.palette.brand.1200}'"],
    ['an override of a target size', (t) => { t.overrides = { base: { 'size.target.min': '20px' } }; },
      "theme.overrides.base.size.target.min: overrides.base.size.target.min: can't be overridden: LOCKED_TOKENS has 'size.target.*', an accessibility floor"],
    ['tuning.radius with radius none', (t) => { t.radius = 'none'; t.tuning = { radius: { md: 6 } }; },
      'theme.tuning.radius: tuning.radius has no effect when radius is none: every corner is 0px; remove one'],
    ['line heights out of order', (t) => { t.tuning = { lineHeight: { tight: 1.6, normal: 1.4 } }; },
      'theme.tuning.lineHeight: tuning.lineHeight must be tight ≤ normal ≤ loose: tight 1.6, normal 1.4, loose 1.7 (default)'],
    ['one token in both tuning and overrides.base', (t) => { t.tuning = { radius: { md: 6 } }; t.overrides = { base: { 'radius.md': '10px' } }; },
      'theme.overrides.base.radius.md: radius.md is set in both tuning.radius.md and overrides.base; set it in one place'],
  ])('rejects %s', (_name, mutate, line) => {
    const t = themeFixture();
    mutate(t);
    const [code, out] = run(doc(t));
    expect(code).toBe(1);
    expect(std.err()).toBe(`✖ test-theme.md:\n  - ${line}\n`);
    expect(existsSync(join(out, 'test-theme'))).toBe(false);
  });

  test('docs without a theme block are ignored', () => {
    const [code, out] = run('---\ntitle: Just a page\n---\n\nProse.\n', 'page.md');
    expect(code).toBe(0);
    expect(!existsSync(out) || readdirSync(out).length === 0).toBe(true);
  });

  test('overrides are applied to the written mode', () => {
    const t = themeFixture();
    t.overrides = { light: { 'color.border.focus': '#ff00ff' } };
    const [, out] = run(doc(t));
    const light = JSON.parse(readFileSync(join(out, 'test-theme', 'light.json'), 'utf8'));
    expect(light.color.border.focus.$value).toBe('#ff00ff');
  });

  const written = (out: string, file: string): Dict => JSON.parse(readFileSync(join(out, 'test-theme', file), 'utf8')) as Dict;

  test('a base override lands in base.json', () => {
    const t = themeFixture();
    t.overrides = { base: { 'radius.md': '10px' } };
    const [code, out] = run(doc(t));
    expect(code).toBe(0);
    expect(written(out, 'base.json').radius.md.$value).toBe('10px');
  });

  test('a tuned radius step lands in base.json in px', () => {
    const t = themeFixture();
    t.tuning = { radius: { md: 6 } };
    const [code, out] = run(doc(t));
    expect(code).toBe(0);
    const radius = written(out, 'base.json').radius as Dict;
    expect([radius.sm.$value, radius.md.$value, radius.lg.$value, radius.full.$value]).toEqual(['2px', '6px', '6px', '999px']);
  });

  test('a public-name override lands on the .default leaf', () => {
    const t = themeFixture();
    t.overrides = { light: { 'color.foreground': '#123456' } };
    const [code, out] = run(doc(t));
    expect(code).toBe(0);
    expect(written(out, 'light.json').color.foreground.default.$value).toBe('#123456');
    expect(written(out, 'light.json').color.foreground).not.toHaveProperty('$value');
  });

  test('an overridden color is still contrast-checked', () => {
    const t = themeFixture();
    t.overrides = { light: { 'color.action.primary.background': '#F5F5F5' } };
    const [code, out] = run(doc(t));
    expect(code).toBe(0);
    const generated = join(tmp(), 'components.json');
    writeFileSync(generated, JSON.stringify([{ component: { name: 'Button', props: {}, a11y: { role: 'button', requires: [],
      contrast: [{ foreground: 'color.action.primary.foreground', background: 'color.action.primary.background', level: 'AA' }] } } }]), 'utf8');
    const saved = { paths: { ...cc.paths }, hooks: { ...cc.hooks } };
    try {
      cc.paths.GENERATED = generated;
      cc.hooks.themes = () => ['test-theme'];
      cc.hooks.modes = () => ['light'];
      cc.hooks.loadTheme = (theme, mode) => resolveTokens(flatten(deepMerge(written(out, 'base.json'), JSON.parse(readFileSync(join(out, theme, `${mode}.json`), 'utf8')))));
      expect(cc.main()).toBe(1);
    } finally {
      Object.assign(cc.paths, saved.paths);
      Object.assign(cc.hooks, saved.hooks);
    }
    expect(std.out()).toMatch(/^✖ Button\s+test-theme\/light\s+color\.action\.primary\.foreground on color\.action\.primary\.background: 1\.\d\d:1/m);
    expect(std.out()).toContain('1 pairs checked, 1 failures');
  });

  test('the output is loadable by the resolver', () => {
    const [, out] = run(doc(themeFixture()));
    const tree = deepMerge(
      JSON.parse(readFileSync(join(out, 'test-theme', 'base.json'), 'utf8')),
      JSON.parse(readFileSync(join(out, 'test-theme', 'light.json'), 'utf8')),
    );
    const flat = resolveTokens(flatten(tree));
    expect(flat['color.action.primary.background']?.$value as string).toMatch(/^#/);
  });

  test('the reported line names every theme it built', () => {
    run(doc(themeFixture()));
    expect(std.out()).toBe('✔ themes: test-theme (light, dark) → out/\n');
  });
});

// ---------- two-seed palettes (`seed.neutral`) and the achromatic "ink" brand rule ----------

const SAND = '#C9B99C';
const INK = '#1E1A16';
// WCAG 2.2: 4.5:1 normal text, 3:1 large text at AA; 7:1 / 4.5:1 at AAA.
const THRESHOLDS: Record<string, number> = { 'AA|false': 4.5, 'AA|true': 3.0, 'AAA|false': 7.0, 'AAA|true': 4.5, 'AA|nonText': 3.0 };

const twoSeed = (t: Dict): Dict => ({ ...t, seed: { ...t.seed, color: INK, neutral: SAND } });

describe('unchanged without the new fields', () => {
  test.each(['calm-precise', 'warm-sleek'])('the committed tokens for %s are what the code derives', (themeId) => {
    // The on-disk tokens for the one-seed themes must not move: derive them again and compare.
    const folder = join(REPO_ROOT, 'tokens', 'themes', themeId);
    if (!existsSync(join(folder, 'theme.json'))) return; // run tools/theme.ts first
    const t = JSON.parse(readFileSync(join(folder, 'theme.json'), 'utf8')) as Dict;
    expect(Object.keys(t.seed as Dict)).not.toContain('neutral');
    expect(asJson(th.deriveBase(t))).toEqual(JSON.parse(readFileSync(join(folder, 'base.json'), 'utf8')));
    for (const mode of t.modes.supports as string[]) {
      const tree = th.deriveMode(th.deriveBase(t), mode, th.ELEVATION[(t.elevation as string) ?? 'subtle'] as number, th.isInk(t.seed.color as string));
      th.applyOverrides(tree, ((t.overrides as Dict) ?? {})[mode] ?? {});
      expect(asJson(tree), `${themeId}/${mode} drifted`).toEqual(JSON.parse(readFileSync(join(folder, `${mode}.json`), 'utf8')));
    }
  });

  test('a chromatic seed is not ink', () => {
    expect(th.isInk(themeFixture().seed.color as string)).toBe(false);
    expect(th.isInk(INK)).toBe(true);
  });
});

describe('neutral seed', () => {
  test('targets compress the light end and lift the dark end', () => {
    const t = th.neutralTargets(hexToOklch(SAND)[0] as number);
    expect(t['0']).toBeCloseTo(Math.min((hexToOklch(SAND)[0] as number) + 0.15, 0.96), 3);
    expect(t['0']).toBeGreaterThan(t['50'] as number);
    expect(t['50']).toBeGreaterThan(t['100'] as number);
    expect(t['100']).toBeGreaterThan(t['200'] as number);
    expect(t['200']).toBeGreaterThan(t['300'] as number);
    expect(t['300']).toBe(0.80); // order kept, 300 untouched
    expect(t['1000']).toBe(th.NEUTRAL_BOTTOM);
    expect(t['900']).toBeGreaterThan(t['1000'] as number);
    expect(t['500']).toBe(th.NEUTRAL_L['500']);
  });

  test('a dark neutral seed still gets a light page', () => {
    expect(th.neutralTargets(0.3)['0']).toBe(th.NEUTRAL_TOP_MIN);
  });

  test('the page is sand, not white', () => {
    const n = th.deriveBase(twoSeed(themeFixture())).color.palette.neutral as Dict;
    const [L, C, H] = hexToOklch(n['0'].$value as string);
    expect(n['0'].$value).not.toBe('#ffffff');
    expect(L).toBeCloseTo(Math.min((hexToOklch(SAND)[0] as number) + 0.15, 0.96), 2);
    expect(C).toBeGreaterThan(0.005);
    expect(Math.abs(H - (hexToOklch(SAND)[2] as number))).toBeLessThan(10); // the page carries the sand hue
  });

  test('the darkest step is a warm black, not pure black', () => {
    const n = th.deriveBase(twoSeed(themeFixture())).color.palette.neutral as Dict;
    const [L, C, H] = hexToOklch(n['1000'].$value as string);
    expect(n['1000'].$value).not.toBe('#000000');
    expect(L).toBeLessThan(0.15);
    expect(C).toBeGreaterThan(0);
    expect(C).toBeLessThan(0.02);
    expect(Math.abs(H - (hexToOklch(SAND)[2] as number))).toBeLessThan(25);
  });

  test('chroma is capped', () => {
    const t = themeFixture();
    const loud = { ...t, seed: { ...t.seed, neutral: '#E0A040' } }; // a saturated 'neutral'
    const n = th.deriveBase(loud).color.palette.neutral as Dict;
    const peak = Math.max(...Object.values(n).map((v) => hexToOklch((v as Dict).$value as string)[1] as number));
    expect(peak).toBeLessThanOrEqual(th.NEUTRAL_CHROMA_MAX + 1e-6);
  });

  test('neutralTint no longer matters when a neutral seed is set', () => {
    const a = th.deriveBase({ ...twoSeed(themeFixture()), neutralTint: 0.1 }).color.palette.neutral as Dict;
    const b = th.deriveBase({ ...twoSeed(themeFixture()), neutralTint: 0.9 }).color.palette.neutral as Dict;
    expect(a).toEqual(b);
  });
});

describe('ink brand', () => {
  const flats = (): [Dict, Dict] => {
    const base = th.deriveBase(twoSeed(themeFixture()));
    return [{ light: resolved(base, th.deriveMode(base, 'light', 1.0, true), true),
      dark: resolved(base, th.deriveMode(base, 'dark', 1.0, true), true) }, base];
  };

  test('light primary is the darkest neutral with light ink', () => {
    const [f, base] = flats();
    const n = base.color.palette.neutral as Dict;
    expect(f.light['color.action.primary.background']).toBe(n['1000'].$value);
    expect(f.light['color.action.primary.foreground']).toBe(n['0'].$value);
  });

  test('dark primary is the inverse', () => {
    const [f, base] = flats();
    const n = base.color.palette.neutral as Dict;
    expect(f.dark['color.action.primary.background']).toBe(n['0'].$value);
    expect(f.dark['color.action.primary.foreground']).toBe(n['1000'].$value);
  });

  test.each(['light', 'dark'])('%s links are the text color', (mode) => {
    const [f] = flats();
    expect(f[mode]['color.link']).toBe(f[mode]['color.foreground']);
  });

  test.each(['light', 'dark'])('%s focus ring reads on page and control', (mode) => {
    const [f] = flats();
    expect(contrast(f[mode]['color.border.focus'], f[mode]['color.background'])).toBeGreaterThanOrEqual(3.0);
    expect(contrast(f[mode]['color.border.focus'], f[mode]['color.control.background'])).toBeGreaterThanOrEqual(3.0);
  });

  test.each(['light', 'dark'])('%s selected control follows the inversion', (mode) => {
    const [f, base] = flats();
    const n = base.color.palette.neutral as Dict;
    const [fill, ink] = mode === 'dark' ? ['0', '1000'] : ['1000', '0'];
    expect(f[mode]['color.control.selectedBackground']).toBe(n[fill as string].$value);
    expect(f[mode]['color.control.selectedForeground']).toBe(n[ink as string].$value);
  });

  test('status hues are untouched', () => {
    const plain = th.deriveBase(themeFixture()).color.palette as Dict;
    const ink = th.deriveBase(twoSeed(themeFixture())).color.palette as Dict;
    for (const tone of ['danger', 'success', 'warning']) expect(plain[tone]).toEqual(ink[tone]);
  });

  test.each(['light', 'dark'])('%s primary and danger text still meet AA', (mode) => {
    const [f] = flats();
    for (const variant of ['primary', 'secondary', 'danger']) {
      expect(contrast(f[mode][`color.action.${variant}.foreground`], f[mode][`color.action.${variant}.background`]), `${variant}/${mode}`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  test('the rule is detected from the ramp when not told', () => {
    const base = th.deriveBase(twoSeed(themeFixture()));
    expect(th.deriveMode(base, 'light')).toEqual(th.deriveMode(base, 'light', 1.0, true));
    const chromatic = th.deriveBase(themeFixture());
    expect(th.deriveMode(chromatic, 'light')).toEqual(th.deriveMode(chromatic, 'light', 1.0, false));
  });
});

describe('every declared pair passes on sand', () => {
  // The same loop as tools/check_contrast.ts, in-process, over the sand-and-ink palette for every component.
  test('all components', () => {
    const componentsJson = join(REPO_ROOT, 'generated', 'components.json');
    if (!existsSync(componentsJson)) return; // run tools/parse.ts first
    const components = JSON.parse(readFileSync(componentsJson, 'utf8')) as Dict[];
    const base = th.deriveBase(twoSeed(themeFixture()));
    const palettes: Dict = {
      light: resolved(base, th.deriveMode(base, 'light', 1.0, true), true),
      dark: resolved(base, th.deriveMode(base, 'dark', 1.0, true), true),
    };
    const failures: string[] = [];
    let checked = 0;
    for (const entry of components) {
      const c = entry.component as Dict;
      for (const pair of ((c.a11y as Dict)?.contrast as Dict[]) ?? []) {
        // A WCAG 1.4.11 pair has one floor, 3:1 at AA, whatever `large` would have said.
        const kind = pair.nonText === true ? 'nonText' : String((pair.large as boolean) ?? false);
        const need = THRESHOLDS[`${(pair.level as string) ?? 'AA'}|${kind}`] as number;
        const fgs = expand(pair.foreground as string, c.props as Dict);
        const bgs = expand(pair.background as string, c.props as Dict);
        const combos = fgs.length === bgs.length && fgs.length > 1 ? fgs.map((f, i) => [f, bgs[i]]) : product([fgs, bgs]);
        for (const [fgRef, bgRef] of combos as string[][]) {
          for (const [mode, tokens] of Object.entries(palettes)) {
            const fg = tokens[fgRef as string];
            let bg = tokens[bgRef as string];
            if (fg === undefined || bg === undefined) continue; // the token-existence test elsewhere owns this
            if (bg === 'transparent') bg = tokens['color.background'];
            checked += 1;
            const ratio = contrast(fg as string, bg as string);
            if (ratio < need) failures.push(`${c.name} ${mode}: ${fgRef} on ${bgRef} ${ratio.toFixed(2)} < ${need}`);
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(failures.join('\n')).toBe('');
  });
});
