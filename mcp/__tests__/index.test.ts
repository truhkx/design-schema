/**
 * mcp/index.ts — the chunker that feeds the vector index (port of tests/test_mcp_index.py).
 */
import { describe, expect, test } from 'vitest';

import { PLATFORMS } from '../../schema/platforms.ts';
import { component } from '../../tools/__tests__/fixtures.ts';
import * as ix from '../index.ts';

const { MAX_CHARS, PARA_SPLIT } = ix;

describe('paragraphs', () => {
  test('splits on blank lines', () => {
    const md = 'First paragraph, comfortably longer than the minimum length.\n\nSecond paragraph, also comfortably longer than the minimum.';
    expect(ix.paragraphs(md)).toHaveLength(2);
  });

  test('short fragments are dropped', () => {
    const out = ix.paragraphs('Too short.\n\nThis paragraph is definitely longer than forty characters.');
    expect(out).toHaveLength(1);
    expect(out[0]?.startsWith('This paragraph')).toBe(true);
  });

  test('a fenced block stays one chunk despite blank lines', () => {
    const out = ix.paragraphs('```ts\nconst a = 1;\n\nconst b = 2;\n\nconst c = 3;\n```');
    expect(out).toHaveLength(1);
    expect(out[0]).toContain('const a');
    expect(out[0]).toContain('const c');
  });

  test('prose around a fence is kept separate', () => {
    const md = 'A sentence of prose that is long enough to survive the filter.\n\n```ts\nconst reallyLongVariableName = 1234567890;\n```';
    expect(ix.paragraphs(md)).toHaveLength(2);
  });

  test('empty input', () => {
    expect(ix.paragraphs('')).toEqual([]);
  });
});

describe('splitPlatformNotes', () => {
  test('headings become platform keys', () => {
    expect(ix.splitPlatformNotes('### Web\nw\n### Lit\nl')).toEqual({ web: 'w', lit: 'l' });
  });

  test.each([
    ['Web', 'web'], ['React', 'web'], ['Lit', 'lit'], ['React Native', 'rn'],
    ['RN', 'rn'], ['SwiftUI', 'swiftui'],
  ])('the headings authors actually write are recognised: %s', (heading, key) => {
    expect(Object.keys(ix.splitPlatformNotes(`### ${heading}\nbody`))).toEqual([key]);
  });

  test('every heading maps onto the platform table, and every platform is its own heading', () => {
    for (const platform of Object.values(ix.PLATFORM_HEADINGS)) expect(PLATFORMS).toContain(platform);
    for (const platform of PLATFORMS) expect(ix.PLATFORM_HEADINGS[platform]).toBe(platform);
  });

  test('heading matching is case insensitive', () => {
    expect(Object.keys(ix.splitPlatformNotes('### REACT NATIVE\nbody'))).toEqual(['rn']);
  });

  test('an unknown heading is kept lowercased', () => {
    expect(ix.splitPlatformNotes('### Flutter\nbody')).toEqual({ flutter: 'body' });
  });

  test('text before the first heading is discarded', () => {
    expect(ix.splitPlatformNotes('preamble\n### Web\nw')).toEqual({ web: 'w' });
  });

  test('no headings gives an empty mapping', () => {
    expect(ix.splitPlatformNotes('just prose')).toEqual({});
  });

  test('multi-line bodies are kept and trimmed', () => {
    expect(ix.splitPlatformNotes('### Web\n\nline one\nline two\n\n### Lit\nl').web).toBe('line one\nline two');
  });
});

describe('schemaSummary', () => {
  test('covers every part of the schema', () => {
    const c = component();
    c.apg = 'button';
    c.copy = { required: '{label} is required.' };
    const text = ix.schemaSummary(c);
    expect(text).toContain('Widget (action)');
    expect(text).toContain('anatomy: container, label');
    expect(text).toContain("ARIA APG 'button'");
    expect(text).toContain('label: string, required');
    expect(text).toContain('variant: primary | danger, default primary');
    expect(text).toContain('onPress');
    expect(text).toContain('web: onClick');
    expect(text).toContain('background → color.action.{variant}.background');
    expect(text).toContain('Accessibility role button');
    expect(text).toContain('requires: accessible-name, focus-visible');
    expect(text).toContain('color.action.{variant}.foreground on');
    expect(text).toContain("required = '{label} is required.'");
  });

  test('a copy entry in the object form reads its text, and a plural entry names the param that picks the form', () => {
    const c = component();
    c.copy = {
      required: '{label} is required.',
      sortedBy: { text: 'Sorted by {column}', params: { column: { type: 'string' } } },
      resultCount: { plural: { by: 'count', one: '{count} result', other: '{count} results' }, params: { count: { type: 'number' } } },
    };
    expect(ix.schemaSummary(c)).toContain("Copy templates: required = '{label} is required.'; sortedBy = 'Sorted by {column}'; resultCount = '{count} results' (plural by count).");
  });

  test('optional blocks are omitted when absent', () => {
    const c = component();
    for (const key of ['events', 'styles', 'copy']) delete c[key];
    delete c.a11y.contrast;
    const text = ix.schemaSummary(c);
    expect(text).not.toContain('Events:');
    expect(text).not.toContain('Style bindings');
    expect(text).not.toContain('Copy templates');
    expect(text).not.toContain('Contrast pairs');
  });

  test('a style binding appends its part, state, platforms, per-value tokens and arithmetic when declared', () => {
    const c = component();
    c.styles.paddingBlock = { token: 'space.sm', by: 'size', values: { sm: 'space.xs' }, part: 'label', state: 'hover', platforms: ['web'] };
    c.styles.thumbTravel = { token: 'space.10', computed: { times: 2.5, plus: [{ token: 'space.1' }], minus: [{ binding: 'radius', times: 2 }] } };
    const text = ix.schemaSummary(c);
    expect(text).toContain('radius → radius.md; paddingBlock → space.sm (part label, state hover, platforms web, size=sm → space.xs); thumbTravel → space.10 (computed space.10 × 2.5 + space.1 − radius × 2).');
    expect(ix.schemaSummary(component())).toContain('Style bindings (token per CSS property): background → color.action.{variant}.background; paddingInline → space.{size}; radius → radius.md.');
  });

  test('an event line appends its declared reasons and payload field names', () => {
    const c = component();
    c.events.onPress.reasons = { pointer: 'Clicked or tapped.', keyboard: 'Enter or Space.' };
    c.events.onPress.payload = [{ name: 'open', type: 'boolean' }, { name: 'reason', type: 'enum', values: ['pointer', 'keyboard'] }];
    expect(ix.schemaSummary(c)).toContain('  - onPress: Activated. Platform names — web: onClick, rn: onPress. Reasons: pointer, keyboard. Payload: open, reason.\n');
    expect(ix.schemaSummary(component())).toContain('  - onPress: Activated. Platform names — web: onClick, rn: onPress.\n');
  });

  test('a controlled prop line names its change event and its uncontrolled default', () => {
    const c = component();
    c.events.onChange = { description: 'Changed.', platforms: { web: 'onChange', rn: 'onChange' } };
    c.props.checked = { type: 'boolean', description: 'Checked.', controls: { default: 'defaultChecked', event: 'onChange', state: 'checked' } };
    c.props.defaultChecked = { type: 'boolean', default: false, description: 'Initially checked.' };
    c.props.open = { type: 'boolean', description: 'Open.', controls: { event: 'onChange' } };
    const text = ix.schemaSummary(c);
    expect(text).toContain('  - checked: boolean. Checked. (controlled; changes reported by onChange; uncontrolled default defaultChecked)\n');
    expect(text).toContain('  - defaultChecked: boolean, default False. Initially checked.\n');
    expect(text).toContain('  - open: boolean. Open. (controlled; changes reported by onChange)\n');
  });

  test('prop platform restrictions are surfaced', () => {
    const c = component();
    c.props.variant.platforms = ['web', 'lit'];
    expect(ix.schemaSummary(c)).toContain('(platforms: web, lit)');
  });

  test('a union prop reads as its shape', () => {
    const c = component();
    c.props.value = { type: 'union', shape: 'string | string[]', description: 'Selected ids.' };
    expect(ix.schemaSummary(c)).toContain('value: string | string[]. Selected ids.');
  });

  test('slot parts are marked, and an object composition entry names its component and forwards', () => {
    const c = component();
    c.anatomy.push('footer', 'icon');
    c.props.footer = { type: 'content', description: 'Actions.' };
    c.parts = { footer: { kind: 'slot', slot: { prop: 'footer' } } };
    c.composition = { label: { component: 'Text', forwards: { radius: 'fontSize', paddingInline: 'gap' } }, icon: 'Icon' };
    const text = ix.schemaSummary(c);
    expect(text).toContain('anatomy: container, label, footer (slot), icon.');
    expect(text).toContain('Composition: label is a Text (forwards radius → overrides.fontSize, paddingInline → overrides.gap), icon is a Icon.');
    expect(text).not.toContain('[object Object]');
  });

  test('a summary over the budget is split into continuation chunks', () => {
    const header = 'Widget (action) — anatomy: container, label.';
    const lines = Array.from({ length: 60 }, (_, i) => `  - prop${i}: string. ` + 'x'.repeat(200));
    const summary = [header, ...lines].join('\n');
    expect(summary.length).toBeGreaterThan(MAX_CHARS);
    const out = ix.schemaChunks('Widget', summary, { kind: 'schema' });
    expect(out.map((c) => c.id).slice(0, 2)).toEqual(['schema:Widget', 'schema:Widget#2']);
    expect(out.every((c) => c.text.length <= MAX_CHARS)).toBe(true);
    expect(out.every((c) => c.text.startsWith(header))).toBe(true);
    expect(out.flatMap((c) => c.text.split('\n').slice(1))).toEqual(lines);
    expect(ix.schemaChunks('Widget', header, { kind: 'schema' })).toEqual([{ id: 'schema:Widget', text: header, meta: { kind: 'schema' } }]);
  });

  test('prop a11y notes are surfaced', () => {
    const c = component();
    c.props.label.a11y = 'Becomes the accessible name.';
    expect(ix.schemaSummary(c)).toContain('Accessibility: Becomes the accessible name.');
  });

  test('an empty requires list reads as none', () => {
    const c = component();
    c.a11y.requires = [];
    expect(ix.schemaSummary(c)).toContain('requires: none');
  });
});

describe('sectionChunks', () => {
  const META = { kind: 'guidance', platform: 'all', component: 'Widget' };

  test('a short section produces one chunk', () => {
    const chunks = ix.sectionChunks('guidance:Widget:Overview', 'Widget', 'Overview', 'Short.', META);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.id).toBe('guidance:Widget:Overview');
    expect(chunks[0]?.meta.granularity).toBe('section');
    expect(chunks[0]?.text.startsWith('Widget — Overview')).toBe(true);
  });

  test('a long section is also split into paragraphs', () => {
    // Only sections longer than PARA_SPLIT earn the extra paragraph-level chunks.
    const md = Array.from({ length: 7 }, (_, i) => `Paragraph number ${i} is long enough to be indexed on its own line.`).join('\n\n');
    expect(md.length).toBeGreaterThan(PARA_SPLIT);
    const chunks = ix.sectionChunks('guidance:Widget:Behavior', 'Widget', 'Behavior', md, META);
    expect(chunks).toHaveLength(8);
    expect(chunks.slice(1).map((c) => c.id)).toEqual(Array.from({ length: 7 }, (_, i) => `guidance:Widget:Behavior#p${i}`));
    expect(chunks.slice(1).every((c) => c.meta.granularity === 'paragraph')).toBe(true);
  });

  test('paragraph chunks share the parent id prefix', () => {
    const chunks = ix.sectionChunks('parent', 'Widget', 'Behavior', 'x'.repeat(500), META);
    expect(chunks.every((c) => c.id.split('#')[0] === 'parent')).toBe(true);
  });

  test('section metadata is carried through', () => {
    const chunks = ix.sectionChunks('id', 'Widget', 'Accessibility', 'Short.', META);
    expect(chunks[0]?.meta.section).toBe('Accessibility');
    expect(chunks[0]?.meta.component).toBe('Widget');
  });
});

describe('the real chunks (built from the repo\'s own build outputs)', () => {
  const chunks = ix.allChunks();

  test('something is indexed from every source', () => {
    const kinds = new Set(chunks.map((c) => c.meta.kind));
    for (const kind of ['guidance', 'schema', 'platform-mapping', 'theme', 'code', 'prompt']) expect(kinds).toContain(kind);
  });

  test('ids are unique', () => {
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
  });

  test('every chunk carries the metadata search filters on', () => {
    for (const c of chunks) {
      for (const key of ['kind', 'platform', 'component', 'theme', 'section', 'path']) expect(Object.keys(c.meta), c.id).toContain(key);
    }
  });

  test('metadata values are scalars the store can hold', () => {
    for (const c of chunks) {
      for (const [k, v] of Object.entries(c.meta)) expect(typeof v, `${c.id}.${k} = ${String(v)}`).toBe('string');
    }
  });

  test('no chunk is empty or over the embedding budget', () => {
    for (const c of chunks) {
      expect(c.text.trim(), c.id).toBeTruthy();
      expect(c.text.length, c.id).toBeLessThanOrEqual(MAX_CHARS + 200);
    }
  });

  test('platform is always a known value', () => {
    const allowed = new Set<string>(['all', ...PLATFORMS]);
    for (const c of chunks) expect(allowed, c.id).toContain(c.meta.platform);
  });

  test('code chunks are tagged with their platform and component', () => {
    const code = chunks.filter((c) => ['code', 'story', 'demo'].includes(c.meta.kind as string));
    expect(code.length, 'no generated sources were indexed').toBeGreaterThan(0);
    for (const c of code) expect(PLATFORMS).toContain(c.meta.platform);
    expect(code.some((c) => c.meta.component === 'Button')).toBe(true);
  });

  test('component platform notes are split per platform', () => {
    // A component's "Platform notes" is split by its ### sub-headings and each part tagged with that
    // platform, so an RN developer never sees Lit advice. (Theme docs keep theirs whole, tagged "all".)
    const notes = chunks.filter((c) => c.meta.section === 'Platform notes' && c.meta.component);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.every((c) => c.meta.platform !== 'all')).toBe(true);
    const platforms = new Set(notes.map((c) => c.meta.platform));
    for (const p of ['web', 'lit', 'rn']) expect(platforms).toContain(p);
  });
});
