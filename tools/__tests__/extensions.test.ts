/** Extensions: tools/parse.ts merges site/src/content/docs/extensions/*.md into components and writes module stubs
 *  The gate half — every declared module exists, exports its name and matches its stub — is check_modules.test.ts. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { dump } from '../lib/pyyaml.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { component, usePaths, useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();
const std = useStd();

const BODY = '\n## When to use\n\nUse it.\n\n## Accessibility\n\nFine.\n';

const ANALYTICS: parse.Dict = {
  extends: 'Widget', name: 'analytics',
  props: { track: { type: 'string', description: 'Event name.' } },
  events: { onTrack: { description: 'After press.', platforms: { web: 'onTrack', rn: 'onTrack' } } },
  behavior: [{ name: 'press-tracks', given: { track: 'signup' }, when: { click: 'container' }, then: [{ event: 'onTrack', with: { name: 'signup' } }] }],
  modules: { trackPress: { path: 'custom/analytics.ts', signature: '(name: string, label: string) => void', wire: 'Called from onPress when `track` is set.' } },
};

let docs = '';
let exts = '';
let out = '';

function writeWidget(c: parse.Dict): void {
  write(join(docs, 'widget.md'), '---\n' + dump({ title: 'Widget', component: c }) + '---\n' + BODY);
}

function ext(name: string, block: parse.Dict, body = 'Why this exists.'): string {
  return write(join(exts, `${block.extends}.${name}.md`), '---\n' + dump({ title: name, extension: block }) + '---\n\n' + body + '\n');
}

function run(): { code: number; entries: parse.Dict[]; err: string } {
  const code = parse.main();
  const cj = join(out, 'components.json');
  const entries = existsSync(cj) ? (JSON.parse(readFileSync(cj, 'utf8')) as parse.Dict[]) : [];
  return { code, entries, err: std.err() };
}

beforeEach(() => {
  const root = tmp();
  docs = join(root, 'components');
  exts = join(root, 'extensions');
  out = join(root, 'generated');
  const templates = join(root, 'templates');
  for (const t of ['web', 'rn']) write(join(templates, `${t}.md`), '{{NAME}}|{{PLATFORM}}\n{{SCHEMA_YAML}}\n{{GUIDANCE}}\n{{PLATFORM_NOTES}}');
  write(join(templates, 'theme.md'), '{{NAME}}');
  for (const d of [docs, exts, out]) write(join(d, '.keep'), '');
  Object.assign(parse.paths, { DOCS: docs, EXT_DOCS: exts, OUT: out, TEMPLATES: templates, THEME_DOCS: join(root, 'no-themes'), PATTERN_DOCS: join(root, 'no-patterns'), ROOT: root });
  parse.hooks.tokenNames = () => null;
  writeWidget(component());
});

describe('merge', () => {
  test('props events behavior and modules merge into the component', () => {
    ext('analytics', ANALYTICS);
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    const c = entries[0]?.component;
    expect(c.props.track.source).toBe('extensions/Widget.analytics.md');
    expect(c.events.onTrack.source).toBe('extensions/Widget.analytics.md');
    expect(c.behavior.map((sc: parse.Dict) => sc.name)).toEqual(['press-tracks']);
    expect(c.behavior[0].source).toBe('extensions/Widget.analytics.md');
    expect(c.props.label, 'upstream items are not stamped').not.toHaveProperty('source');
    const summary = entries[0]?.extensions;
    expect(summary[0].adds).toEqual({ props: ['track'], events: ['onTrack'] });
    expect(summary[0].modules.trackPress.platforms, "omitted platforms = the component's").toEqual(['web', 'rn']);
  });

  test('the prompt carries the prose and the module contract', () => {
    ext('analytics', ANALYTICS, 'Product analytics needs the press.');
    run();
    const web = readFileSync(join(out, 'prompts', 'Widget.web.md'), 'utf8');
    expect(web).toContain('## Extensions');
    expect(web).toContain('Product analytics needs the press.');
    expect(web).toContain("import { trackPress } from './custom/analytics';");
    expect(web).toContain('(name: string, label: string) => void');
    expect(web).toContain('Called from onPress');
    expect(web, 'the schema YAML in the prompt shows the origin').toContain('source: extensions/Widget.analytics.md');
  });

  test('lit imports carry the js extension', () => {
    expect(parse.moduleImport('custom/analytics.ts', 'lit')).toBe('./custom/analytics.js');
    expect(parse.moduleImport('custom/deep/thing.tsx', 'web')).toBe('./custom/deep/thing');
  });

  test('module stubs are written per platform', () => {
    ext('analytics', ANALYTICS);
    run();
    const stub = join(out, 'modules', 'web', 'custom', 'analytics.d.ts');
    expect(existsSync(stub)).toBe(true);
    expect(readFileSync(stub, 'utf8')).toContain('export declare const trackPress: (name: string, label: string) => void;');
    expect(existsSync(join(out, 'modules', 'rn', 'custom', 'analytics.d.ts'))).toBe(true);
    expect(existsSync(join(out, 'modules', 'lit')), 'the component does not declare lit').toBe(false);
  });

  test('stale stubs are removed', () => {
    const stale = write(join(out, 'modules', 'web', 'custom', 'old.d.ts'), 'export declare const gone: () => void;');
    ext('analytics', ANALYTICS);
    run();
    expect(existsSync(stale)).toBe(false);
  });

  test('a component without extensions is untouched', () => {
    const { code, entries } = run();
    expect(code).toBe(0);
    expect(entries[0]?.extensions).toEqual([]);
    expect(readFileSync(join(out, 'prompts', 'Widget.web.md'), 'utf8')).not.toContain('## Extensions');
  });

  test('extension scenarios are validated against the merged schema', () => {
    ext('analytics', { ...ANALYTICS, behavior: [{ name: 'x', given: { nope: 1 }, then: [{ renders: true }] }] });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("unknown prop 'nope'");
  });
});

describe('collisions and forbidden', () => {
  test('a prop upstream declares', () => {
    ext('dup', { extends: 'Widget', name: 'dup', props: { label: { type: 'string', description: 'x' } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("extensions/Widget.dup.md: props.label collides with Widget's own schema");
  });

  test('two extensions adding the same event', () => {
    const ev = { events: { onTrack: { description: 'x', platforms: { web: 'onTrack', rn: 'onTrack' } } } };
    ext('a', { extends: 'Widget', name: 'a', ...ev });
    ext('b', { extends: 'Widget', name: 'b', ...ev });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain('extensions/Widget.b.md: events.onTrack collides with extensions/Widget.a.md');
  });

  test('a behavior name that already exists', () => {
    const c = component();
    c.behavior = [{ name: 'press-tracks', then: [{ renders: true }] }];
    writeWidget(c);
    ext('analytics', ANALYTICS);
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("behavior scenario 'press-tracks' collides with Widget's own schema");
  });

  test('an explicitly locked binding', () => {
    ext('lock', { extends: 'Widget', name: 'lock', styles: { glow: { token: 'space.1', locked: true } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain('styles.glow is locked');
  });

  test('a binding a contrast pair locks', () => {
    // VALID_COMPONENT's contrast pair names color.action.{variant}.background; binding it again is locked by the parser.
    ext('lock', { extends: 'Widget', name: 'lock', styles: { glow: { token: 'color.action.{variant}.background' } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("styles.glow binds 'color.action.{variant}.background', which is locked");
  });

  test('a11y and anatomy cannot be extended', () => {
    ext('a11y', { extends: 'Widget', name: 'a11y', a11y: { requires: ['focus-trap'] } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain('extensions/Widget.a11y.md: frontmatter failed schema validation');
    expect(err).toContain('a11y');
  });

  test('two extensions declaring the same module', () => {
    const mod = { modules: { trackPress: { path: 'custom/a.ts', signature: '() => void', wire: 'x' } } };
    ext('a', { extends: 'Widget', name: 'a', ...mod });
    ext('b', { extends: 'Widget', name: 'b', ...mod });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("module 'trackPress' collides with extensions/Widget.a.md");
  });

  test('extending a component that does not exist', () => {
    ext('x', { extends: 'Gadget', name: 'x' });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("extensions/Gadget.x.md: extends 'Gadget', which has no component doc");
  });

  test('the file name must match extends and name', () => {
    write(join(exts, 'Widget.wrong.md'), '---\nextension:\n  extends: Widget\n  name: right\n---\n');
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain('file should be named Widget.right.md');
  });

  test('a module path outside custom is a schema error', () => {
    ext('m', { extends: 'Widget', name: 'm', modules: { f: { path: 'utils/f.ts', signature: '() => void', wire: 'x' } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain('modules.f.path');
  });
});

describe('the repository', () => {
  /** The shipped example: Button.analytics.md and the module stubs the parser wrote for it. */
  const cj = join(REPO_ROOT, 'generated', 'components.json');

  test('the example extension parses into Button', () => {
    if (!existsSync(cj)) return; // run tools/parse.ts first
    const entries = JSON.parse(readFileSync(cj, 'utf8')) as parse.Dict[];
    const button = entries.find((e) => e.component.name === 'Button') as parse.Dict;
    expect(button.component.props.track.source).toBe('extensions/Button.analytics.md');
    expect(button.extensions[0].modules).toHaveProperty('trackPress');
  });

  test.each(['web', 'lit', 'rn'])('the %s stub exists', (platform) => {
    if (!existsSync(cj)) return;
    expect(existsSync(join(REPO_ROOT, 'generated', 'modules', platform, 'custom', 'analytics.d.ts'))).toBe(true);
  });
});
