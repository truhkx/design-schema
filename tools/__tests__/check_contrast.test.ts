/** tools/check_contrast.ts — the WCAG gate over every declared contrast pair (port of tests/test_check_contrast.py). */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import * as cc from '../check_contrast.ts';
import type { Dict } from '../check_contrast.ts';
import { pyFixed } from '../lib/py.ts';
import type { TokenEntry } from '../lib/tokens.ts';
import * as oklch from '../oklch.ts';
import { useStd, useTmp } from './fixtures.ts';

const PROPS: Dict = {
  variant: { type: 'enum', values: ['primary', 'danger'], description: 'Emphasis.' },
  size: { type: 'enum', values: ['sm', 'md'], description: 'Size.' },
  label: { type: 'string', description: 'Text.' },
};

const tmp = useTmp();
const std = useStd();

/** Restore `cc.paths` and `cc.hooks` after every test (pytest's `monkeypatch`). */
const savedPaths = { ...cc.paths };
const savedHooks = { ...cc.hooks };
afterEach(() => {
  Object.assign(cc.paths, savedPaths);
  Object.assign(cc.hooks, savedHooks);
});

describe('luminance and contrast', () => {
  test('matches the shared oklch implementation', () => {
    // Python carried two copies that must not drift; the port has one, re-exported.
    for (const h of ['#ffffff', '#000000', '#3b5bdb', '#767676', '#abc']) expect(cc.luminance(h)).toBeCloseTo(oklch.luminance(h), 12);
  });

  test('shorthand hex is accepted', () => {
    expect(cc.luminance('#fff')).toBeCloseTo(1, 6);
  });

  test('endpoints and range', () => {
    expect(cc.contrast('#ffffff', '#000000')).toBeCloseTo(21, 6);
    expect(cc.contrast('#123456', '#123456')).toBeCloseTo(1, 6);
  });

  test('contrast is symmetric', () => {
    expect(cc.contrast('#3b5bdb', '#ffffff')).toBeCloseTo(cc.contrast('#ffffff', '#3b5bdb'), 6);
  });
});

describe('thresholds', () => {
  test('the four WCAG levels', () => {
    expect(cc.threshold('AA', false)).toBe(4.5);
    expect(cc.threshold('AA', true)).toBe(3.0);
    expect(cc.threshold('AAA', false)).toBe(7.0);
    expect(cc.threshold('AAA', true)).toBe(4.5);
  });

  test('an unknown level is a KeyError, as the Python dict lookup was', () => {
    expect(() => cc.threshold('AAAA', false)).toThrow('KeyError');
  });
});

describe('expand', () => {
  test('a reference without slots is returned as is', () => {
    expect(cc.expand('color.foreground.muted', PROPS)).toEqual(['color.foreground.muted']);
  });

  test('one slot expands to one reference per enum value', () => {
    expect(cc.expand('color.action.{variant}.background', PROPS)).toEqual(['color.action.primary.background', 'color.action.danger.background']);
  });

  test('two slots expand to the cartesian product', () => {
    expect(cc.expand('a.{variant}.{size}', PROPS)).toEqual(['a.primary.sm', 'a.primary.md', 'a.danger.sm', 'a.danger.md']);
  });

  test('a repeated slot is substituted everywhere', () => {
    expect(cc.expand('a.{variant}.b.{variant}', PROPS)[0]).toBe('a.primary.b.primary');
  });

  test('a trailing .default is dropped (public names)', () => {
    expect(cc.expand('color.surface.{variant}.default', { variant: { type: 'enum', values: ['x'] } })).toEqual(['color.surface.x']);
  });

  test('a slot naming a non-enum prop is rejected', () => {
    expect(() => cc.expand('color.{label}.background', PROPS)).toThrow("'{label}' must name an enum prop");
  });

  test('a slot naming no prop is rejected', () => {
    expect(() => cc.expand('color.{tone}.background', PROPS)).toThrow('must name an enum prop');
  });
});

describe('main', () => {
  /** Point main() at a components.json and a palette we control. */
  function sandbox(): (component: Dict) => void {
    const generated = join(tmp(), 'components.json');
    cc.paths.GENERATED = generated;
    cc.hooks.themes = () => ['fake'];
    cc.hooks.modes = () => ['light'];
    const palette: Record<string, string> = {
      'color.background.default': '#ffffff',
      'color.foreground.muted': '#767676', // 4.54:1 on white — passes AA, fails AAA
      'color.action.primary.background': '#3553d2',
      'color.action.primary.foreground': '#ffffff',
      'color.action.danger.background': '#b51d26',
      'color.action.danger.foreground': '#ffffff',
      'color.action.ghost.background': 'transparent',
      'color.action.ghost.foreground': '#3553d2',
    };
    cc.hooks.loadTheme = () => Object.fromEntries(Object.entries(palette).map(([p, v]) => [p, { $value: v, $type: 'color' } as TokenEntry]));
    return (component: Dict): void => {
      writeFileSync(generated, JSON.stringify([{ component }]), 'utf8');
    };
  }

  const component = (pairs: Dict[], props: Dict = PROPS): Dict => ({ name: 'Widget', props, a11y: { role: 'button', requires: [], contrast: pairs } });

  test('a missing generated file is a clear failure', () => {
    cc.paths.GENERATED = join(tmp(), 'nope.json');
    expect(cc.main()).toBe(1);
    expect(std.err()).toContain('run tools/parse.ts first');
  });

  test('a passing pair returns zero', () => {
    sandbox()(component([{ foreground: 'color.foreground.muted', background: 'color.background', level: 'AA' }]));
    expect(cc.main()).toBe(0);
    expect(std.out()).toContain('0 failures');
  });

  test('the same pair fails at AAA', () => {
    sandbox()(component([{ foreground: 'color.foreground.muted', background: 'color.background', level: 'AAA' }]));
    expect(cc.main()).toBe(1);
    expect(std.out()).toContain('1 failures');
  });

  test('large text uses the lower floor', () => {
    sandbox()(component([{ foreground: 'color.foreground.muted', background: 'color.background', level: 'AAA', large: true }]));
    expect(cc.main()).toBe(0);
  });

  test('level defaults to AA', () => {
    sandbox()(component([{ foreground: 'color.foreground.muted', background: 'color.background' }]));
    expect(cc.main()).toBe(0);
    expect(std.out()).toContain('needs 4.5 for AA');
  });

  test('the report line is what the Python tool printed', () => {
    sandbox()(component([{ foreground: 'color.foreground.muted', background: 'color.background', large: true }]));
    cc.main();
    // `{name:<8} {theme:<18}`, `{ratio:.2f}`, `needs {need}` with Python's float repr (3.0, not 3).
    expect(std.out()).toBe('✔ Widget   fake/light         color.foreground.muted on color.background: 4.54:1 (needs 3.0 for AA)\n\n1 pairs checked, 0 failures\n');
  });

  test('matching slots are zipped, not crossed', () => {
    // variant↔variant: primary-on-primary and danger-on-danger, never primary-on-danger.
    sandbox()(component([{ foreground: 'color.action.{variant}.foreground', background: 'color.action.{variant}.background' }]));
    expect(cc.main()).toBe(0);
    const out = std.out();
    expect(out).toContain('2 pairs checked');
    expect(out).toContain('color.action.primary.foreground on color.action.primary.background');
    expect(out).not.toContain('primary.foreground on color.action.danger');
  });

  test('a transparent background is checked against the page', () => {
    sandbox()(component([{ foreground: 'color.action.ghost.foreground', background: 'color.action.ghost.background' }], { variant: PROPS.variant as Dict }));
    expect(cc.main()).toBe(0);
    expect(std.out()).toContain('1 pairs checked');
  });

  test('a transparent background with no page background is a KeyError, as the Python subscript was', () => {
    const generated = join(tmp(), 'components.json');
    cc.paths.GENERATED = generated;
    cc.hooks.themes = () => ['fake'];
    cc.hooks.modes = () => ['light'];
    cc.hooks.loadTheme = () => ({ 'color.action.ghost.foreground': { $value: '#3553d2', $type: 'color' } as TokenEntry,
      'color.action.ghost.background': { $value: 'transparent', $type: 'color' } as TokenEntry });
    writeFileSync(generated, JSON.stringify([{ component: component([{ foreground: 'color.action.ghost.foreground', background: 'color.action.ghost.background' }], {}) }]), 'utf8');
    expect(() => cc.main()).toThrow("KeyError: 'color.background'");
  });

  test('an unknown token is a failure, not a crash', () => {
    sandbox()(component([{ foreground: 'color.nope', background: 'color.background' }]));
    expect(cc.main()).toBe(1);
    expect(std.out()).toContain('unknown token color.nope');
  });

  test('a component with no declared pairs is skipped', () => {
    sandbox()({ name: 'Widget', props: PROPS, a11y: { role: 'none', requires: [] } });
    expect(cc.main()).toBe(0);
    expect(std.out()).toContain('0 pairs checked');
  });

  test('a null contrast list is treated as empty', () => {
    sandbox()({ name: 'Widget', props: PROPS, a11y: { role: 'none', requires: [], contrast: null } });
    expect(cc.main()).toBe(0);
  });
});

describe('the ratio format', () => {
  test('`.2f` rounds ties to even on the exact value, as Python does', () => {
    expect(pyFixed(4.545, 2)).toBe('4.54'); // 4.545 is below the tie in binary; both agree
    expect(pyFixed(1.125, 2)).toBe('1.12'); // an exact binary tie: Python gives 1.12, toFixed gives 1.13
    expect(pyFixed(1.375, 2)).toBe('1.38');
    expect(pyFixed(20.999, 2)).toBe('21.00');
    expect(pyFixed(3, 1)).toBe('3.0');
  });
});

describe('the real docs', () => {
  // The gate as the build runs it: every declared pair in every shipped theme.
  test('the repository passes its own contrast gate', () => {
    expect(cc.main(), std.out()).toBe(0);
  });

  test('something was actually checked', () => {
    cc.main();
    const lines = std.out().trimEnd().split('\n');
    const checked = Number((lines[lines.length - 1] as string).split(' pairs')[0]);
    expect(checked).toBeGreaterThan(0);
  });
});
