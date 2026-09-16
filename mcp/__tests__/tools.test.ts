/**
 * mcp/server.ts — get_keyboard_model, get_layout_rules, list_gaps, start_theme, write_theme
 * (port of tests/test_mcp_tools_extra.py).
 *
 * Same approach as server.test.ts: the tools as plain functions, with the call log and the on-disk
 * folders redirected to a temp folder where a tool would otherwise write, and the two child processes
 * `write_theme` runs replaced at `spawnSync`.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useTmp, write } from '../../tools/__tests__/fixtures.ts';
import { themeFrontmatter } from '../../schema/theme.ts';
import { load as yamlLoad } from '../../tools/lib/pyyaml.ts';
import * as s from '../server.ts';

type Dict = Record<string, any>;

// `node --import tsx tools/theme.ts` and `… check_contrast.ts`: no test may spawn either.
const mocked = vi.hoisted(() => ({ spawn: null as null | ((...args: any[]) => unknown), modes: null as null | ((theme: string) => string[]) }));

vi.mock('node:child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return { ...actual, spawnSync: (...args: any[]) => (mocked.spawn ? mocked.spawn(...args) : actual.spawnSync(args[0] as string)) };
});

vi.mock('../../tools/lib/tokens.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../tools/lib/tokens.ts')>();
  return { ...actual, modes: (theme: string) => (mocked.modes ?? actual.modes)(theme) };
});

const tmp = useTmp();
const savedPaths = { ...s.paths };

beforeEach(() => {
  s.paths.CALL_LOG = join(tmp(), 'mcp-calls.jsonl');
});

afterEach(() => {
  Object.assign(s.paths, savedPaths);
  mocked.spawn = null;
  mocked.modes = null;
});

describe('lookup_code on swiftui', () => {
  const swiftSource = (root: string): string => join(root, 'packages', 'swiftui', 'Sources', 'DesignSchema');

  test('the files come from the Swift package source: the type and its extension files, nothing else', () => {
    const root = tmp();
    const src = swiftSource(root);
    write(join(src, 'Icon.swift'), 'public struct Icon: View {}');
    write(join(src, 'Icon+Paths.swift'), 'extension Icon {}');
    write(join(src, 'IconButton.swift'), 'public struct IconButton: View {}');
    write(join(src, 'Support', 'Gallery+Icon.swift'), 'extension Gallery {}');
    s.paths.ROOT = root;
    const out = s.lookupCode({ component: 'Icon', platform: 'swiftui', include: ['source', 'styles', 'stories'] });
    expect(out.platformLabel).toBe('SwiftUI (iOS)');
    expect(out.supported).toBe(true);
    expect(Object.keys(out.files).map((f) => f.replaceAll('\\', '/'))).toEqual([
      'packages/swiftui/Sources/DesignSchema/Icon.swift',
      'packages/swiftui/Sources/DesignSchema/Icon+Paths.swift',
    ]);
    expect(out.files[join('packages', 'swiftui', 'Sources', 'DesignSchema', 'Icon+Paths.swift')]).toBe('extension Icon {}');
  });

  test('a component not generated for swiftui yet returns no files', () => {
    s.paths.ROOT = tmp();
    expect(s.lookupCode({ component: 'Button', platform: 'swiftui', include: ['source'] }).files).toEqual({});
  });
});

describe('get_keyboard_model', () => {
  test('rules carry from and expect with defaults filled', () => {
    const kb = s.getKeyboardModel({ component: 'Dialog' });
    expect((kb.rules as Dict[]).length, 'Dialog documents its keyboard model').toBeGreaterThan(0);
    for (const r of kb.rules as Dict[]) {
      expect(['trigger', 'first', 'last', 'inside', 'any']).toContain(r.from);
      expect(r.expect).toBeTruthy();
    }
    expect((kb.autoTested as number) + (kb.manual as number)).toBe((kb.rules as Dict[]).reduce((n, r) => n + (r.keys as string[]).length, 0));
  });

  test('Escape on Dialog closes', () => {
    const kb = s.getKeyboardModel({ component: 'dialog' });
    const escape = (kb.rules as Dict[]).find((r) => (r.keys as string[]).includes('Escape')) as Dict;
    expect(escape.expect).toBe('closes');
    expect(kb.requires).toContain('escape-dismiss');
    expect(kb.requires).toContain('keyboard-operable');
  });

  test('a component without a keyboard block says so', () => {
    const kb = s.getKeyboardModel({ component: 'Text' });
    expect(kb.rules).toEqual([]);
    expect(kb.note).toBeTruthy();
  });

  test('defaults are applied without mutating the component data', () => {
    const generated = join(tmp(), 'generated');
    mkdirSync(generated, { recursive: true });
    const entry = {
      source: 'widget.md', title: 'Widget', description: '',
      sections: {},
      component: { name: 'Widget', apg: null, a11y: { role: 'button', requires: ['keyboard-operable'] }, keyboard: [{ keys: ['Enter'], action: 'Activates.' }] },
    };
    writeFileSync(join(generated, 'components.json'), JSON.stringify([entry]), 'utf8');
    s.paths.GENERATED = generated;
    const kb = s.getKeyboardModel({ component: 'Widget' });
    expect(kb.rules).toEqual([{ from: 'inside', expect: 'manual', keys: ['Enter'], action: 'Activates.' }]);
    expect(JSON.parse(readFileSync(join(generated, 'components.json'), 'utf8'))[0].component.keyboard[0]).not.toHaveProperty('from');
    expect(kb.manual).toBe(1);
    expect(kb.autoTested).toBe(0);
  });

  test('an expect list counts as auto-tested, and native manual rules are counted apart', () => {
    const generated = join(tmp(), 'generated');
    mkdirSync(generated, { recursive: true });
    const keyboard = [
      { keys: ['Escape'], action: 'Closes and returns focus.', expect: ['closes', 'focus-trigger'], target: 'list' },
      { keys: ['Enter', ' '], action: 'Activates the focused control.', native: true },
      { keys: ['Home'], action: 'Moves to the first item.' },
    ];
    const entry = { source: 'widget.md', title: 'Widget', description: '', sections: {}, component: { name: 'Widget', apg: null, a11y: { role: 'combobox', requires: ['keyboard-operable'] }, keyboard } };
    writeFileSync(join(generated, 'components.json'), JSON.stringify([entry]), 'utf8');
    s.paths.GENERATED = generated;
    const kb = s.getKeyboardModel({ component: 'Widget' });
    expect((kb.rules as Dict[])[0]).toMatchObject({ expect: ['closes', 'focus-trigger'], target: 'list', from: 'inside' });
    expect([kb.autoTested, kb.manual, kb.native]).toEqual([1, 1, 2]);
    expect(s.GET_KEYBOARD_MODEL_DOC).toMatch(/given[\s\S]*target[\s\S]*repeat[\s\S]*platforms[\s\S]*native/);
  });

  test('an unknown component raises', () => {
    expect(() => s.getKeyboardModel({ component: 'Gadget' })).toThrow(/Unknown component/);
  });
});

describe('get_layout_rules', () => {
  test('returns every layout token named for both platforms', () => {
    const out = s.getLayoutRules({ theme: 'calm-precise', mode: 'light' });
    const names = Object.keys(out.tokens as Dict);
    // layout.gutter.default drops its last segment
    for (const n of ['layout.gap.normal', 'layout.section.md', 'layout.inset.md', 'layout.gutter', 'layout.maxWidth.prose', 'layout.maxWidth.content', 'layout.maxWidth.page']) {
      expect(names).toContain(n);
    }
    expect(names.every((k) => k.startsWith('layout.'))).toBe(true);
    const t = (out.tokens as Dict)['layout.gap.normal'];
    expect(t.css).toBe('var(--layout-gap-normal)');
    expect(t.rn).toBe('layoutGapNormal');
    expect((t.value as string).endsWith('px')).toBe(true);
  });

  test('page width is four thirds of content', () => {
    const t = s.getLayoutRules({ theme: 'calm-precise' }).tokens as Dict;
    const content = parseInt((t['layout.maxWidth.content'].value as string).replace(/px$/, ''), 10);
    const page = parseInt((t['layout.maxWidth.page'].value as string).replace(/px$/, ''), 10);
    expect(page).toBe(Math.round((content * 4) / 3));
  });

  test('rules text comes from the foundations page', () => {
    const out = s.getLayoutRules();
    expect(out.rules).toContain('Siblings are spaced by their parent');
    expect(out.sections).toHaveProperty('The rules');
    expect((out.source as string).endsWith('foundations/layout.md')).toBe(true);
  });

  test('an unknown theme raises', () => {
    expect(() => s.getLayoutRules({ theme: 'no-such-theme' })).toThrow(/Unknown theme/);
  });

  test('an unsupported mode raises', () => {
    mocked.modes = () => ['light'];
    expect(() => s.getLayoutRules({ theme: 'calm-precise', mode: 'dark' })).toThrow(/has no 'dark' mode/);
  });
});

describe('list_gaps', () => {
  const GAP_FILE = `# Gaps reported while generating Widget for web

## 2026-09-09 21:07 — round 1

- Widget: first guess.
- Widget: second guess.

## 2026-09-09 21:08 — round 2

- Widget: only guess in round two.
`;

  const sandbox = (): string => {
    const generated = join(tmp(), 'generated');
    mkdirSync(join(generated, 'gaps'), { recursive: true });
    copyFileSync(join(savedPaths.GENERATED, 'components.json'), join(generated, 'components.json'));
    s.paths.GENERATED = generated;
    s.paths.ROOT = tmp();
    write(join(generated, 'gaps', 'Widget.web.md'), GAP_FILE);
    write(join(generated, 'gaps', 'Button.rn.md'), '# Gaps\n\n## 2026-09-09 10:00 — round 1\n\n- Button: one.\n');
    return generated;
  };

  test('rounds are parsed newest first with their bullets', () => {
    sandbox();
    const widget = s.listGaps().find((g) => g.component === 'Widget') as Dict;
    expect(widget.platform).toBe('web');
    expect(widget.total).toBe(3);
    expect((widget.rounds as Dict[]).map((r) => r.round)).toEqual([2, 1]);
    expect((widget.rounds as Dict[])[0]?.gaps).toEqual(['Widget: only guess in round two.']);
    expect(widget.source).toBe('generated/gaps/Widget.web.md');
  });

  test('the component filter is case insensitive and resolves known names', () => {
    sandbox();
    expect(s.listGaps({ component: 'button' }).map((g) => g.component)).toEqual(['Button']);
  });

  test('no gaps folder means an empty list', () => {
    s.paths.GENERATED = tmp();
    expect(s.listGaps()).toEqual([]);
  });
});

describe('start_theme', () => {
  test('five questions in leverage order with allowed values', () => {
    const st = s.startTheme();
    expect((st.questions as Dict[]).map((q) => q.id)).toEqual(['tone', 'seed', 'type', 'shape', 'rhythm']);
    const allowed: Dict = {};
    for (const q of st.questions as Dict[]) Object.assign(allowed, q.allowed);
    expect(allowed.radius.enum).toEqual(['none', 'sm', 'md', 'lg', 'full']);
    expect(allowed.density.enum).toEqual(['compact', 'comfortable', 'roomy']);
    expect(allowed['scale.ratio'].minimum).toBe(1.1);
    expect(allowed['scale.ratio'].maximum).toBe(1.5);
    expect((allowed['seed.color'].pattern as string).startsWith('^#')).toBe(true);
    expect(allowed.tone.minItems).toBe(2);
    expect(allowed.tone.maxItems).toBe(5);
    expect(allowed.modes.fields.default.enum).toEqual(['light', 'dark']);
  });

  test('the shape question carries tuning from the schema', () => {
    const shape = (s.startTheme().questions as Dict[]).find((q) => q.id === 'shape') as Dict;
    expect(Object.keys(shape.allowed.tuning.fields)).toEqual(['radius', 'lineHeight', 'fontWeight']);
  });

  test('carries the process text and the example doc', () => {
    const st = s.startTheme();
    expect((st.process as string).toLowerCase()).toContain('excluded word');
    expect((st.example as string).startsWith('---\ntitle: Calm & precise')).toBe(true);
    expect(st.required).toEqual(['id', 'tone', 'not', 'seed', 'scale', 'radius', 'density', 'modes']);
  });
});

const GOOD: Dict = {
  title: 'Warm test', description: 'A test theme.',
  tone: ['warm', 'sleek'], not: 'cold',
  seed: { color: '#C89A5C', typeface: 'Google Sans' }, neutralTint: 0.35,
  scale: { base: 16, ratio: 1.25 }, radius: 'md', density: 'comfortable',
  motion: 'expressive', elevation: 'pronounced', layout: { rhythm: 'normal', contentWidth: 1040 },
  modes: { default: 'light', supports: ['light', 'dark'] },
  feel: 'Cream surfaces and a pale-oak accent.', whenToUse: 'Consumer products.',
  platformNotes: { web: 'Load Google Sans yourself.' },
};

describe('write_theme', () => {
  let docs = '';
  let calls: string[][] = [];

  beforeEach(() => {
    docs = join(tmp(), 'themes');
    mkdirSync(docs, { recursive: true });
    s.paths.THEME_DOCS = docs;
    calls = [];
    mocked.spawn = (_cmd: string, argv: string[]) => {
      calls.push(argv);
      const script = argv[argv.length - 1] as string; // both run as `node --import tsx <script>`
      const stdout = script.endsWith('theme.ts') ? '✔ themes: warm-test (light, dark) → tokens/themes/' : '404 pairs checked, 0 failures';
      return { status: 0, stdout, stderr: '' };
    };
  });

  test('writes the doc in the calm-precise shape and runs the derivation', () => {
    const out = s.writeTheme({ id: 'warm-test', answers: GOOD });
    expect(out.ok).toBe(true);
    expect((out.written as string).endsWith('themes/warm-test.md')).toBe(true);
    const text = readFileSync(join(docs, 'warm-test.md'), 'utf8').replace(/\r\n/g, '\n');
    expect(text.startsWith('---\ntitle: Warm test\ndescription: A test theme.\ntheme:\n  id: warm-test\n  status: draft\n')).toBe(true);
    for (const heading of ['## Feel', '## Not cold', '## References', '## When to use', '## When not to use', '## Accessibility', '## Platform notes', '### Web', '### Lit', '### React Native']) {
      expect(text, heading).toContain(heading);
    }
    expect(text).toContain('Cream surfaces and a pale-oak accent.');
    expect(text).toContain('Load Google Sans yourself.');
    expect(calls.length, 'theme.ts, then check_contrast.ts').toBe(2);
    expect((calls[0]?.at(-1) as string).endsWith('theme.ts')).toBe(true);
    expect((calls[1]?.at(-1) as string).endsWith('check_contrast.ts')).toBe(true);
    expect(out.contrast.ok).toBe(true);
    expect(out.contrast.failures).toEqual([]);
  });

  test('the frontmatter round-trips through the theme schema', () => {
    s.writeTheme({ id: 'warm-test', answers: GOOD });
    const raw = readFileSync(join(docs, 'warm-test.md'), 'utf8').replace(/\r\n/g, '\n');
    const fm = yamlLoad(raw.split('\n---\n')[0]?.replace(/^-+\n/, '') as string) as Dict;
    expect(themeFrontmatter.safeParse(fm).error?.issues ?? []).toEqual([]);
    expect(fm.theme.layout).toEqual({ rhythm: 'normal', contentWidth: 1040 });
  });

  test('invalid answers write nothing', () => {
    const out = s.writeTheme({ id: 'warm-test', answers: { ...GOOD, seed: { color: '#12345' }, radius: 'round' } });
    expect(out.ok).toBe(false);
    expect(out.written).toBe(null);
    expect((out.errors as string[]).some((e) => e.includes('seed.color'))).toBe(true);
    expect((out.errors as string[]).some((e) => e.includes('radius'))).toBe(true);
    expect(existsSync(join(docs, 'warm-test.md'))).toBe(false);
    expect(calls).toEqual([]);
  });

  test('a combination tools/theme.ts would ignore is an error, in the Zod message', () => {
    const out = s.writeTheme({ id: 'warm-test', answers: { ...GOOD, seed: { color: '#1E1A16', neutral: '#C9B99C' } } });
    expect(out.ok).toBe(false);
    expect(out.errors).toEqual(['theme.neutralTint: neutralTint has no effect when seed.neutral is set: the neutral ramp takes its hue and chroma from seed.neutral; remove one']);
    expect(calls).toEqual([]);
  });

  test('a misspelled override path is an error, in the schema message, and nothing is written', () => {
    const out = s.writeTheme({ id: 'warm-test', answers: { ...GOOD, overrides: { light: { 'color.action.primry.background': '#3B5BDB' } } } });
    expect(out.ok).toBe(false);
    expect(out.written).toBe(null);
    expect(out.errors).toEqual(["theme.overrides.light.color.action.primry.background: overrides.light: 'color.action.primry.background' is not a mode token"]);
    expect(existsSync(join(docs, 'warm-test.md'))).toBe(false);
    expect(calls).toEqual([]);
  });

  test('tuning passes through to the doc', () => {
    s.writeTheme({ id: 'warm-test', answers: { ...GOOD, tuning: { radius: { md: 6 } } } });
    const raw = readFileSync(join(docs, 'warm-test.md'), 'utf8').replace(/\r\n/g, '\n');
    const fm = yamlLoad(raw.split('\n---\n')[0]?.replace(/^-+\n/, '') as string) as Dict;
    expect(fm.theme.tuning).toEqual({ radius: { md: 6 } });
  });

  test('an existing doc is kept unless overwrite', () => {
    writeFileSync(join(docs, 'warm-test.md'), 'original', 'utf8');
    const out = s.writeTheme({ id: 'warm-test', answers: GOOD });
    expect(out.ok).toBe(false);
    expect((out.errors as string[])[0]).toContain('overwrite=true');
    expect(readFileSync(join(docs, 'warm-test.md'), 'utf8')).toBe('original');
    expect(s.writeTheme({ id: 'warm-test', answers: GOOD, overwrite: true }).ok).toBe(true);
  });

  test.each(['Warm', 'warm test', '1warm', 'warm_test', '../x'])('the id must be kebab-case: %s', (badId) => {
    expect(() => s.writeTheme({ id: badId, answers: GOOD })).toThrow(/kebab-case/);
  });

  test('derivation errors are returned, not raised', () => {
    mocked.spawn = () => ({ status: 1, stdout: '✖ themes: none', stderr: '✖ warm-test.md:\n  - seed.color: bad' });
    const out = s.writeTheme({ id: 'warm-test', answers: GOOD });
    expect(out.ok).toBe(false);
    expect(out.errors).toEqual(['✖ warm-test.md:', '- seed.color: bad']);
    expect(out).not.toHaveProperty('contrast');
  });

  test('contrast failures are reported for the caller to decide', () => {
    mocked.spawn = (_cmd: string, argv: string[]) =>
      (argv[argv.length - 1] as string).endsWith('theme.ts')
        ? { status: 0, stdout: '✔ themes', stderr: '' }
        : { status: 1, stdout: '✖ Button warm-test/light color.a on color.b: 3.9:1 (needs 4.5 for AA)\n1 failure', stderr: '' };
    const out = s.writeTheme({ id: 'warm-test', answers: GOOD });
    expect(out.ok).toBe(true);
    expect(out.contrast.ok).toBe(false);
    expect(out.contrast.failures).toEqual(['✖ Button warm-test/light color.a on color.b: 3.9:1 (needs 4.5 for AA)']);
    expect(out.next).toContain('seed');
  });
});
