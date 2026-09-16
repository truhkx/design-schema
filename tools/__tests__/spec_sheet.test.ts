/**
 * tools/spec_sheet.ts — the generated spec-sheet page over a token dist and components.json
 * (port of tests/test_spec_sheet.py).
 */
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { readText } from '../lib/py.ts';
import * as ss from '../spec_sheet.ts';
import type { Dict, Tokens } from '../spec_sheet.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const PROPS: Dict = {
  variant: { type: 'enum', values: ['primary', 'ghost'], description: 'Emphasis.' },
  surface: { type: 'enum', values: ['default', 'subtle'], description: 'Background.' },
  label: { type: 'string', description: 'Text.' },
};

const LIGHT: Tokens = {
  'color.palette.brand.500': '#496ded',
  'color.foreground': '#2a2b2f',
  'color.foreground.muted': '#767676', // 4.54:1 on white — passes AA
  'color.background': '#ffffff',
  'color.background.subtle': '#f6f7f8',
  'color.link': '#3553d2',
  'color.action.primary.background': '#3553d2',
  'color.action.primary.foreground': '#ffffff',
  'color.action.ghost.background': 'transparent',
  'color.action.ghost.foreground': '#3553d2',
  'color.status.info.background': '#f1f5ff',
  'color.status.info.foreground': '#405bb6',
  'color.status.info.icon': '#99b5ff', // 1.85:1 — fails even the 3.0 graphic floor
  'color.inverse.surface': '#17181b',
  'color.inverse.foreground': '#f6f7f8',
  'font.family.body': ['system-ui', 'Segoe UI', 'sans-serif'],
  'font.weight.regular': 400,
  'font.size.md': '16px',
  'font.size.lg': '19px',
  'font.lineHeight.normal': 1.5,
  'space.1': '4px',
  'space.10': '40px',
  'space.sm': '8px',
  'layout.gap.normal': '8px',
  'layout.maxWidth.page': '1280px',
  'radius.md': '4px',
  'shadow.raised': { color: '#0000001a', offsetX: '0px', offsetY: '1px', blur: '3px', spread: '0px' },
  'motion.easing.standard': [0.2, 0, 0, 1],
};
const DARK: Tokens = { ...LIGHT, 'color.foreground': '#ecedee', 'color.background': '#17181b', 'color.action.primary.foreground': '#17181b' };

const COMPONENTS: Dict[] = [
  {
    id: 'widget',
    title: 'Widget',
    component: {
      name: 'Widget',
      props: PROPS,
      styles: {
        background: { token: 'color.action.{variant}.background', locked: false },
        surface: { token: 'color.background.{surface}', locked: true, description: 'Page | subtle.' },
        shadow: { token: 'shadow.raised', locked: false },
        missing: { token: 'color.nope', locked: false },
        badSlot: { token: 'color.{label}.x', locked: false },
      },
    },
  },
  { id: 'plain', title: 'Plain', component: { name: 'Plain', props: {}, styles: {} } },
];

const tmp = useTmp();
const std = useStd();

const savedPaths = { ...ss.paths };
afterEach(() => {
  Object.assign(ss.paths, savedPaths);
});

/** A fake dist with two themes, a components.json, and an output path, all under tmp. */
function sandbox(): string {
  const dist = join(tmp(), 'dist');
  for (const theme of ['fake', 'other']) {
    write(join(dist, theme, 'json', 'tokens.light.json'), JSON.stringify(LIGHT));
    write(join(dist, theme, 'json', 'tokens.dark.json'), JSON.stringify(DARK));
  }
  const generated = write(join(tmp(), 'components.json'), JSON.stringify(COMPONENTS));
  const out = join(tmp(), 'site', 'spec-sheet.md');
  Object.assign(ss.paths, { ROOT: tmp(), DIST: dist, GENERATED: generated, OUT: out });
  return out;
}

function page(out: string, argv: string[] = ['--theme', 'fake']): string {
  expect(ss.main(argv)).toBe(0);
  return readText(out);
}

describe('formatting', () => {
  test('lookup drops a trailing default segment', () => {
    expect(ss.lookup(LIGHT, 'color.background.default')).toBe('#ffffff');
    expect(ss.lookup(LIGHT, 'color.background.subtle')).toBe('#f6f7f8');
    expect(ss.lookup(LIGHT, 'color.nope')).toBeNull();
  });

  test('values render as display text', () => {
    expect(ss.fmt(null)).toBe('—');
    expect(ss.fmt(LIGHT['shadow.raised'])).toBe('0px 1px 3px 0px #0000001a');
    expect(ss.fmt(LIGHT['motion.easing.standard'])).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(ss.fmt(LIGHT['font.family.body'])).toBe('system-ui, Segoe UI, sans-serif');
    expect(ss.fmt(400)).toBe('400');
  });

  test('multi-word families are quoted for CSS', () => {
    expect(ss.cssFontFamily(LIGHT['font.family.body'])).toBe("system-ui, 'Segoe UI', sans-serif");
  });

  test('color cells carry a swatch and pipes are escaped', () => {
    expect(ss.cell('#3553d2')).toContain('background: #3553d2"');
    expect(ss.cell('#3553d2')).toContain('`#3553d2`');
    expect(ss.cell('4px')).toBe('4px');
    expect(ss.textCell('a | b\nc')).toBe('a \\| b c');
  });

  test('a pixel bar is sized by the rounded pixel value', () => {
    expect(ss.px('12px')).toBe(12);
    expect(ss.px('1.5px')).toBe(2); // round() is half to even
    expect(ss.px('2.5px')).toBe(2);
    expect(ss.px('1rem')).toBeNull();
    expect(ss.px(16)).toBeNull();
  });
});

describe('contrast', () => {
  test('a transparent background is checked against the page', () => {
    expect(ss.ratio(LIGHT, 'color.action.ghost.foreground', 'color.action.ghost.background')).toBeCloseTo(
      ss.ratio(LIGHT, 'color.action.ghost.foreground', 'color.background') as number,
      10,
    );
  });

  test('non-color or missing operands give null', () => {
    expect(ss.ratio(LIGHT, 'color.nope', 'color.background')).toBeNull();
    expect(ss.ratio(LIGHT, 'space.1', 'color.background')).toBeNull();
  });

  test('pairs use text and graphic floors', () => {
    const pairs = new Map(ss.contrastPairs(LIGHT).map(([fg, bg, need]) => [`${fg}|${bg}`, need]));
    expect(pairs.get('color.action.primary.foreground|color.action.primary.background')).toBe(4.5);
    expect(pairs.get('color.foreground.muted|color.background')).toBe(4.5);
    expect(pairs.get('color.link|color.background')).toBe(4.5);
    expect(pairs.get('color.status.info.foreground|color.status.info.background')).toBe(4.5);
    expect(pairs.get('color.status.info.icon|color.status.info.background')).toBe(3.0);
    expect(pairs.get('color.inverse.foreground|color.inverse.surface')).toBe(4.5);
    expect(pairs.has('color.palette.brand.500|color.background')).toBe(false);
  });
});

describe('styleRows', () => {
  const modes = { light: LIGHT, dark: DARK };

  test('a per-value token gets its own row, and part and state prefix the description', () => {
    const comp: Dict = {
      props: PROPS,
      styles: {
        paddingBlock: { token: 'space.sm', by: 'variant', values: { ghost: 'space.1' }, part: 'label', state: 'hover', description: 'Block padding.', locked: false },
        gap: { token: 'layout.gap.normal', state: 'active', locked: true },
        radius: { token: 'radius.md', locked: false, description: 'Corners.' },
      },
    };
    expect(ss.styleRows(comp, modes)).toEqual([
      ['`paddingBlock`', '`space.sm`', ss.cell('8px'), ss.cell('8px'), 'no', 'part `label`, state `hover`: Block padding.'],
      ['`paddingBlock` (variant=ghost)', '`space.1`', ss.cell('4px'), ss.cell('4px'), 'no', 'part `label`, state `hover`: Block padding.'],
      ['`gap`', '`layout.gap.normal`', ss.cell('8px'), ss.cell('8px'), 'yes', 'state `active`.'],
      ['`radius`', '`radius.md`', ss.cell('4px'), ss.cell('4px'), 'no', 'Corners.'],
    ]);
  });

  // What job 640's fold does to the page: Input's paddingBlock/paddingBlockSm pair becomes one binding whose sm row
  // carries the token the deleted key held, and a part with no description still says which part it styles.
  test("a folded pair's two rows, and a part with no description", () => {
    const comp: Dict = {
      props: { ...PROPS, size: { type: 'enum', values: ['sm', 'md'], default: 'md', description: 'Size.' } },
      styles: {
        paddingBlock: { token: 'space.sm', by: 'size', values: { sm: 'space.1' }, locked: false },
        labelWeight: { token: 'font.weight.regular', part: 'label', locked: false },
      },
    };
    expect(ss.styleRows(comp, modes)).toEqual([
      ['`paddingBlock`', '`space.sm`', ss.cell('8px'), ss.cell('8px'), 'no', ''],
      ['`paddingBlock` (size=sm)', '`space.1`', ss.cell('4px'), ss.cell('4px'), 'no', ''],
      ['`labelWeight`', '`font.weight.regular`', ss.cell(400), ss.cell(400), 'no', 'part `label`.'],
    ]);
  });
});

describe('main', () => {
  let out = '';
  beforeEach(() => {
    out = sandbox();
  });

  test('writes the page and prints the summary', () => {
    expect(ss.main(['--theme', 'fake'])).toBe(0);
    expect(readText(out)).not.toBe('');
    expect(std.out().startsWith(`✔ spec sheet: ${Object.keys(LIGHT).length} tokens, 2 components → site/spec-sheet.md`)).toBe(true);
  });

  test('defaults to the calm-precise theme', () => {
    expect(ss.main([])).toBe(1); // not in the fake dist
    expect(std.err()).toContain('calm-precise');
  });

  test('frontmatter and generated marker', () => {
    const text = page(out);
    expect(text.startsWith('---\ntitle: Spec sheet\n')).toBe(true);
    expect(text).toContain('sidebar:\n  order: 9\n---\n<!-- generated by tools/spec_sheet.ts');
  });

  test('other themes are mentioned in the intro', () => {
    const text = page(out);
    expect(text).toContain('**fake**');
    expect(text).toContain('`other`');
    expect((text.split('## Spacing scale')[0] as string).split('theme and')[1]).not.toContain('`fake`'); // not listed as an "other"
  });

  test('sections come in order', () => {
    const text = page(out);
    const idx = ['## Spacing scale', '## Layout rhythm', '## Type scale', '## Color roles', '## Components', '## Widget', '## Plain'].map((h) => text.indexOf(h));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
    expect(idx.every((i) => i >= 0)).toBe(true);
  });

  test('spacing bars are sized by pixel value and sorted numerically', () => {
    const text = page(out);
    expect(text).toContain('>space.1</span><div style="inline-size: 4px;');
    expect(text).toContain('>space.10</span><div style="inline-size: 40px;');
    expect(text.indexOf('space.1<')).toBeLessThan(text.indexOf('space.10<'));
    expect(text.indexOf('space.10<')).toBeLessThan(text.indexOf('space.sm<'));
    expect(text).toContain('>layout.maxWidth.page</span><div style="inline-size: 1280px;');
  });

  test('the type scale renders each size at its value', () => {
    const text = page(out);
    expect(text).toContain('font-size: 19px; line-height: 1.5');
    expect(text).toContain('<code>font.size.lg</code> 19px');
    expect(text).toContain('<code>font.lineHeight.normal</code>');
    expect(text).toContain('| `font.weight.regular` | 400 |');
  });

  test('the color table has light, dark and contrast', () => {
    const text = page(out);
    const row = text.split('\n').find((l) => l.startsWith('| `color.foreground` |')) as string;
    expect(row).toContain('`#2a2b2f`');
    expect(row).toContain('`#ecedee`');
    expect(row).toContain('on `color.background` (needs 4.5): light 14.14:1 AA pass; dark');
    const icon = text.split('\n').find((l) => l.startsWith('| `color.status.info.icon` |')) as string;
    expect(icon).toContain('(needs 3.0): light 1.85:1 AA fail');
    expect(text.split('## Components')[0]).not.toContain('color.palette.brand.500');
  });

  test('interpolated bindings expand and default collapses', () => {
    const text = page(out);
    expect(text).toContain('| `background` | `color.action.primary.background` |');
    expect(text).toContain('| `background` | `color.action.ghost.background` |');
    expect(text).toContain('| `surface` | `color.background` |'); // {surface}=default → the group itself
    expect(text).toContain('| `surface` | `color.background.subtle` |');
    expect(text).not.toContain('color.background.default');
  });

  test('locked and description columns', () => {
    const text = page(out);
    const surface = text.split('\n').find((l) => l.startsWith('| `surface` | `color.background` |')) as string;
    expect(surface.endsWith('| yes | Page \\| subtle. |')).toBe(true);
    expect(text).toContain('| `shadow` | `shadow.raised` | 0px 1px 3px 0px #0000001a | 0px 1px 3px 0px #0000001a | no |  |');
  });

  test('unresolvable tokens show a dash rather than crashing', () => {
    const text = page(out);
    expect(text).toContain('| `missing` | `color.nope` | — | — | no |  |');
    expect(text).toContain('| `badSlot` | `color.{label}.x` | — | — | no |  |');
  });

  test('a component without styles still gets a section', () => {
    const text = page(out);
    expect(text).toContain('## Plain\n\n[Component doc](/components/plain/)\n\n*No style bindings.*');
  });

  test('missing components.json is a clear failure', () => {
    ss.paths.GENERATED = join(tmp(), 'nope.json');
    expect(ss.main(['--theme', 'fake'])).toBe(1);
    expect(std.err()).toContain('run tools/parse.ts first');
  });

  test('an unknown flag exits 2 the way argparse does', () => {
    expect(ss.main(['--nope'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --nope');
    expect(std.err()).toContain('usage: spec_sheet.ts [-h] [--theme THEME]');
  });

  test('--help prints the usage and exits 0', () => {
    expect(ss.main(['--help'])).toBe(0);
    expect(std.out()).toContain('--theme THEME  theme id under packages/tokens/dist/ (default calm-precise)');
  });
});
