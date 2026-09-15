/**
 * mcp/server.ts — the tools AI clients call (port of tests/test_mcp_server.py).
 *
 * The tools are exercised as plain functions, so these tests cover behavior rather than the wire
 * protocol; `createServer()` registering them is covered by `pnpm mcp:smoke` and a real client.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useTmp } from '../../tools/__tests__/fixtures.ts';
import { DB_FILE } from '../lib/store.ts';
import * as s from '../server.ts';

// The one seam the Python tests monkeypatched: a theme that supports fewer modes than it really does.
const mocked = vi.hoisted(() => ({ modes: null as null | ((theme: string) => string[]) }));

vi.mock('../../tools/lib/tokens.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../tools/lib/tokens.ts')>();
  return { ...actual, modes: (theme: string) => (mocked.modes ?? actual.modes)(theme) };
});

const tmp = useTmp();
const savedPaths = { ...s.paths };

beforeEach(() => {
  // Keep the dogfooding log out of the repo while tests run.
  s.paths.CALL_LOG = join(tmp(), 'mcp-calls.jsonl');
});

afterEach(() => {
  Object.assign(s.paths, savedPaths);
  mocked.modes = null;
});

const lastCall = (): Record<string, any> => {
  const lines = readFileSync(s.paths.CALL_LOG, 'utf8').trim().split(/\r?\n/);
  return JSON.parse(lines[lines.length - 1] as string) as Record<string, any>;
};

describe('the call log', () => {
  test('a tool call is recorded', () => {
    s.listComponents();
    const entry = lastCall();
    expect(entry.tool).toBe('list_components');
    expect(entry.resultChars).toBeGreaterThan(0);
  });

  test('arguments are recorded and absent values dropped', () => {
    s.listComponents({ platform: 'rn' });
    expect(lastCall().args).toEqual({ platform: 'rn' });
  });

  test('logging failure never breaks the tool', () => {
    s.paths.CALL_LOG = join(tmp(), 'no', 'such', 'dir', '\0bad');
    expect(s.listComponents().length, 'the tool must still answer').toBeGreaterThan(0);
  });
});

describe('component lookup', () => {
  test('lookup is case insensitive', () => {
    expect(s.getComponent({ name: 'button' }).name).toBe('Button');
    expect(s.getComponent({ name: 'BUTTON' }).name).toBe('Button');
  });

  test('an unknown name lists what is available', () => {
    expect(() => s.getComponent({ name: 'Nope' })).toThrow(/Unknown component 'Nope'\. Known: /);
  });
});

describe('list_components', () => {
  test('returns every component with its summary fields', () => {
    const out = s.listComponents();
    expect(out.length).toBeGreaterThan(0);
    for (const c of out) expect(Object.keys(c).sort()).toEqual(['apg', 'category', 'description', 'name', 'platforms', 'status']);
  });

  test('sorted by name', () => {
    const names = s.listComponents().map((c) => c.name as string);
    expect(names).toEqual([...names].sort());
  });

  test('platform filter keeps only components supporting it', () => {
    for (const c of s.listComponents({ platform: 'rn' })) expect(c.platforms).toContain('rn');
  });

  test('a platform no doc declares yields nothing', () => {
    // The protocol's platform enum rejects it before the tool runs; called directly, the tool just matches nothing.
    expect(s.listComponents({ platform: 'flutter' as s.Platform })).toEqual([]);
  });

  test('status filter', () => {
    expect(s.listComponents({ status: 'review' }).every((c) => c.status === 'review')).toBe(true);
    expect(s.listComponents({ status: 'deprecated' })).toEqual([]);
  });
});

describe('get_component', () => {
  test('returns schema and guidance together', () => {
    const out = s.getComponent({ name: 'Button' });
    expect(out.name).toBe('Button');
    expect(out.schema.props.variant.type).toBe('enum');
    expect(out.guidance).toHaveProperty('When to use');
    expect((out.source as string).endsWith('button.md')).toBe(true);
  });

  test('without a platform every platform is present', () => {
    expect(Object.keys(s.getComponent({ name: 'Button' }).schema.platforms).length).toBeGreaterThan(1);
  });

  test('with a platform only that mapping survives', () => {
    expect(Object.keys(s.getComponent({ name: 'Button', platform: 'rn' }).schema.platforms)).toEqual(['rn']);
  });

  test('events are annotated with their name on the platform', () => {
    expect(s.getComponent({ name: 'Button', platform: 'web' }).schema.events.onPress.nameOnPlatform).toBe('onClick');
    expect(s.getComponent({ name: 'Button', platform: 'rn' }).schema.events.onPress.nameOnPlatform).toBe('onPress');
  });

  test('props missing on the platform are flagged', () => {
    const props = s.getComponent({ name: 'Button', platform: 'swiftui' }).schema.props as Record<string, any>;
    const restricted = Object.values(props).filter((p) => p.platforms);
    expect(restricted.length, 'Button has at least one platform-restricted prop').toBeGreaterThan(0);
    expect(restricted.every((p) => p.availableOnPlatform === false)).toBe(true);
  });

  test('an unmapped platform is reported as unsupported', () => {
    expect(s.getComponent({ name: 'Button', platform: 'flutter' as s.Platform }).schema.platforms.flutter.supported).toBe(false);
  });

  test('platform notes are narrowed to that platform', () => {
    const web = s.getComponent({ name: 'Button', platform: 'web' }).guidance['Platform notes'];
    const rn = s.getComponent({ name: 'Button', platform: 'rn' }).guidance['Platform notes'];
    expect(web).toBeTruthy();
    expect(rn).toBeTruthy();
    expect(web).not.toBe(rn);
  });

  test('the component data is not mutated between calls', () => {
    s.getComponent({ name: 'Button', platform: 'rn' });
    expect(Object.keys(s.getComponent({ name: 'Button' }).schema.platforms).length).toBeGreaterThan(1);
  });
});

describe('lookup_code', () => {
  test('returns the generated source for the platform', () => {
    const out = s.lookupCode({ component: 'Button', platform: 'rn' });
    expect(out.supported).toBe(true);
    expect(out.platformLabel).toBe('React Native');
    expect(Object.keys(out.files).some((f) => f.endsWith('Button.tsx'))).toBe(true);
    expect(Object.values(out.files as Record<string, string>).join('')).toContain('export function Button');
  });

  test('web also returns the stylesheet', () => {
    const files = s.lookupCode({ component: 'Button', platform: 'web', include: ['source', 'styles'] }).files;
    expect(Object.keys(files).some((f) => f.endsWith('.css'))).toBe(true);
  });

  test('include selects what comes back', () => {
    const out = s.lookupCode({ component: 'Button', platform: 'rn', include: ['notes'] });
    expect(out.files).toEqual({});
    expect(out.platformNotes).toBeTruthy();
    expect(out).not.toHaveProperty('tokenBindings');
  });

  test('notes carry the platform mapping, events and copy', () => {
    const out = s.lookupCode({ component: 'Button', platform: 'web', include: ['notes'] });
    expect(out.platformMapping.element).toBe('button');
    expect(out.events.onPress).toBe('onClick');
    expect(out).toHaveProperty('copy');
  });

  test('the generation prompt can be included', () => {
    const out = s.lookupCode({ component: 'Button', platform: 'web', include: ['prompt'] });
    expect(out.generationPrompt).toBeTruthy();
    expect(out.generationPrompt).toContain('Button');
  });

  test('token bindings are named for the web platform', () => {
    const b = s.lookupCode({ component: 'Button', platform: 'web', include: ['tokens'] }).tokenBindings;
    expect(b.radius.name).toBe('var(--radius-md)');
    expect(b.background.name).toBe('var(--color-action-{variant}-background)');
  });

  test('token bindings are named for React Native', () => {
    const b = s.lookupCode({ component: 'Button', platform: 'rn', include: ['tokens'] }).tokenBindings;
    expect(b.radius.name).toBe('radiusMd');
    expect(b.background.name).toBe('colorAction{Variant}Background');
  });

  test('bindings keep the original token path', () => {
    expect(s.lookupCode({ component: 'Button', platform: 'rn', include: ['tokens'] }).tokenBindings.background.token).toBe('color.action.{variant}.background');
  });

  test('an unknown component raises', () => {
    expect(() => s.lookupCode({ component: 'Nope', platform: 'web' })).toThrow(/Unknown component/);
  });
});

describe('themes', () => {
  test('list_themes describes each theme', () => {
    const themes = s.listThemes();
    expect(themes.length).toBeGreaterThan(0);
    for (const t of themes) expect(Object.keys(t).sort()).toEqual(['description', 'id', 'modes', 'not', 'status', 'title', 'tone']);
  });

  test('the theme skill carries the identity and resolved tokens', () => {
    const skill = s.getThemeSkill({ theme: 'calm-precise' });
    expect(skill).toContain('calm');
    expect(skill).toContain('playful');
    expect(skill).toContain('--color-action-primary-background');
  });

  test('an unknown theme lists the known ones', () => {
    expect(() => s.getThemeSkill({ theme: 'nope' })).toThrow(/Unknown theme 'nope'\. Known: /);
  });
});

describe('get_tokens', () => {
  test('web tokens are css custom properties', () => {
    const out = s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'web' });
    expect(out.count).toBe(Object.keys(out.tokens).length);
    expect(out.count).toBeGreaterThan(0);
    const entry = out.tokens['--color-action-primary-background'];
    expect(entry).toBeDefined();
    expect((entry.value as string).startsWith('#')).toBe(true);
    expect(entry.path).toBe('color.action.primary.background');
  });

  test('rn tokens are camelCase with numeric dimensions', () => {
    const out = s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'rn' });
    expect(out.tokens.spaceMd.value).toBe(12);
    expect(typeof out.tokens.radiusMd.value).toBe('number');
  });

  test('rn font families collapse to a native name', () => {
    expect(s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'rn' }).tokens.fontFamilyBody.value).toBe('System');
  });

  test('web font families are css stacks', () => {
    const v = s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'web' }).tokens['--font-family-body'].value as string;
    expect(v.startsWith('system-ui,')).toBe(true);
    expect(v).toContain('"Segoe UI"');
  });

  test('web easing is a css function', () => {
    const v = s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'web' }).tokens['--motion-easing-standard'].value as string;
    expect(v.startsWith('cubic-bezier(')).toBe(true);
  });

  test('group filters by token path prefix', () => {
    const out = s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'web', group: 'color.action.primary' });
    expect(out.count).toBe(3);
    expect(Object.values(out.tokens as Record<string, any>).every((e) => (e.path as string).startsWith('color.action.primary'))).toBe(true);
  });

  test('a group that matches nothing is empty, not an error', () => {
    expect(s.getTokens({ theme: 'calm-precise', mode: 'light', platform: 'web', group: 'nope.nothing' }).count).toBe(0);
  });

  test('light and dark differ', () => {
    const light = s.getTokens({ theme: 'calm-precise', mode: 'light' }).tokens['--color-background'].value;
    const dark = s.getTokens({ theme: 'calm-precise', mode: 'dark' }).tokens['--color-background'].value;
    expect(light).not.toBe(dark);
  });

  test('an unknown theme is rejected', () => {
    expect(() => s.getTokens({ theme: 'nope' })).toThrow(/Unknown theme 'nope'/);
  });

  test('a mode the theme does not support is rejected', () => {
    mocked.modes = () => ['light'];
    expect(() => s.getTokens({ theme: 'calm-precise', mode: 'dark' })).toThrow(/has no 'dark' mode/);
  });
});

describe('check_contrast', () => {
  test('hex pairs', () => {
    const out = s.checkContrast({ foreground: '#ffffff', background: '#000000' });
    expect(out.ratio).toBe(21.0);
    expect(out.passes).toBe(true);
  });

  test('token paths resolve through the theme', () => {
    const out = s.checkContrast({ foreground: 'color.foreground.muted', background: 'color.background' });
    expect((out.foreground as string).startsWith('#')).toBe(true);
    expect((out.background as string).startsWith('#')).toBe(true);
    expect(out.passes).toBe(true);
  });

  test('a transparent token falls back to the page background', () => {
    const out = s.checkContrast({ foreground: 'color.action.ghost.foreground', background: 'color.action.ghost.background' });
    expect(out.background).toBe(s.checkContrast({ foreground: '#000', background: 'color.background' }).background);
  });

  test('the literal word transparent is accepted', () => {
    expect(s.checkContrast({ foreground: 'color.foreground', background: 'transparent' }).passes).toBe(true);
  });

  test.each([
    ['AA', false, 4.5], ['AA', true, 3.0], ['AAA', false, 7.0], ['AAA', true, 4.5],
  ] as const)('the required ratio follows level and text size: %s large=%s', (level, large, need) => {
    expect(s.checkContrast({ foreground: '#000000', background: '#ffffff', level, large_text: large }).required).toBe(need);
  });

  test('a failing pair is reported as failing', () => {
    const out = s.checkContrast({ foreground: '#ffffff', background: '#f6f7f8' });
    expect(out.passes).toBe(false);
    expect(out.ratio).toBeLessThan(4.5);
  });

  test('dark mode resolves different colors', () => {
    const light = s.checkContrast({ foreground: 'color.foreground', background: 'color.background', mode: 'light' });
    const dark = s.checkContrast({ foreground: 'color.foreground', background: 'color.background', mode: 'dark' });
    expect(light.foreground).not.toBe(dark.foreground);
  });

  test('an unknown token is rejected with a useful message', () => {
    expect(() => s.checkContrast({ foreground: 'color.nope', background: '#ffffff' })).toThrow(/neither a hex color nor a known color token/);
  });

  test('a non-color token is rejected', () => {
    expect(() => s.checkContrast({ foreground: 'space.md', background: '#ffffff' })).toThrow(/neither a hex color/);
  });
});

describe('get_generation_prompt', () => {
  test('returns the prompt for the platform', () => {
    const prompt = s.getGenerationPrompt({ component: 'Button', platform: 'web' });
    expect(prompt).toContain('Button');
    expect(prompt.length).toBeGreaterThan(200);
  });

  test('the component name is matched case insensitively', () => {
    expect(s.getGenerationPrompt({ component: 'button', platform: 'web' })).toBe(s.getGenerationPrompt({ component: 'Button', platform: 'web' }));
  });

  test('a platform without a prompt raises', () => {
    expect(() => s.getGenerationPrompt({ component: 'Button', platform: 'flutter' as s.Platform })).toThrow(/No generation prompt/);
  });
});

describe.skipIf(!existsSync(DB_FILE))('search_guidance (needs the vector index: pnpm mcp:index)', () => {
  test('results carry score, text and provenance', async () => {
    const out = await s.searchGuidance({ query: 'when should I use a button', limit: 3 });
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(3);
    for (const r of out) {
      expect(Object.keys(r).sort()).toEqual(['component', 'granularity', 'kind', 'platform', 'score', 'section', 'source', 'text', 'theme']);
      expect(r.text).toBeTruthy();
    }
  });

  test('results come back ranked', async () => {
    const scores = (await s.searchGuidance({ query: 'focus ring', limit: 5 })).map((r) => r.score as number);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  test('limit is honoured', async () => {
    expect((await s.searchGuidance({ query: 'form validation', limit: 2 })).length).toBeLessThanOrEqual(2);
  });

  test("a platform filter excludes other platforms' notes", async () => {
    for (const r of await s.searchGuidance({ query: 'platform notes', platform: 'rn', limit: 8 })) expect(['all', 'rn']).toContain(r.platform);
  });

  test('a component filter pins the component', async () => {
    for (const r of await s.searchGuidance({ query: 'accessibility', component: 'Input', limit: 5 })) expect(r.component).toBe('Input');
  });

  test('the component filter accepts any casing', async () => {
    expect((await s.searchGuidance({ query: 'accessibility', component: 'input', limit: 1 })).length).toBeGreaterThan(0);
  });

  test('kinds selects what is searched', async () => {
    for (const r of await s.searchGuidance({ query: 'focus ring outline', kinds: ['code'], limit: 3 })) expect(r.kind).toBe('code');
  });

  test('the default kinds exclude generated code', async () => {
    expect((await s.searchGuidance({ query: 'button', limit: 10 })).every((r) => r.kind !== 'code')).toBe(true);
  });

  test('a section and its paragraphs are not both returned', async () => {
    const out = await s.searchGuidance({ query: 'how do I announce a validation error', limit: 8 });
    const parents = out.map((r) => `${r.source as string}${r.section as string}`);
    expect(new Set(parents).size).toBe(parents.length);
  });
});
