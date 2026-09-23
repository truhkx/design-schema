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

  test('an object copy entry merges and is stamped with its source; a plain string is not', () => {
    const plural = { plural: { by: 'count', one: '{count} tracked press', other: '{count} tracked presses' }, params: { count: { type: 'number' } } };
    ext('analytics', { ...ANALYTICS, copy: { trackedCount: plural, tracked: 'Tracked.' } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    const c = entries[0]?.component;
    expect(c.copy.trackedCount).toEqual({ ...plural, source: 'extensions/Widget.analytics.md' });
    expect(c.copy.tracked).toBe('Tracked.');
    expect(entries[0]?.extensions[0].adds.copy).toEqual(['tracked', 'trackedCount']);
  });

  test('an extension may not author source on a copy entry', () => {
    ext('analytics', { ...ANALYTICS, copy: { tracked: { text: 'Tracked.', source: 'extensions/x.md' } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("copy.tracked sets 'source'");
  });

  test('a binding an extension adds is checked against the token manifest', () => {
    ext('glow', { extends: 'Widget', name: 'glow', styles: { glow: { token: 'color.backgroud.subtle' } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("styles.glow.token: Widget: styles.glow 'color.backgroud.subtle' is not a token");
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

  test('a11y.requires cannot be extended, only a11y.contrast', () => {
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

/** Widget plus an optional prop with no default, a copy string, an authored scenario and an unlocked color binding,
 *  so defaults and omit have upstream items of every kind to act on. */
function writeRichWidget(): parse.Dict {
  const c = component();
  c.props.hint = { type: 'string', description: 'Helper text.' };
  c.copy = { empty: 'Nothing here.' };
  c.styles.muted = { token: 'color.foreground.muted' };
  c.behavior = [{ name: 'renders-plain', then: [{ renders: true }] }];
  writeWidget(c);
  return c;
}

function prompt(platform: string): string {
  return readFileSync(join(out, 'prompts', `Widget.${platform}.md`), 'utf8');
}

describe('changing and removing upstream', () => {
  test('anatomy parts are appended, and a binding may style one', () => {
    ext('badge', { extends: 'Widget', name: 'badge', anatomy: ['badge'], styles: { badgeRadius: { token: 'radius.md', part: 'badge' } } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    expect(entries[0]?.component.anatomy).toEqual(['container', 'label', 'badge']);
    expect(entries[0]?.extensions[0].anatomy).toEqual(['badge']);
  });

  test('contrast pairs are appended, where check_contrast reads them', () => {
    const pair = { foreground: 'color.foreground.muted', background: 'color.background.subtle', level: 'AA' };
    ext('muted', { extends: 'Widget', name: 'muted', a11y: { contrast: [pair] } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    expect(entries[0]?.component.a11y.contrast).toContainEqual(pair);
    expect(entries[0]?.extensions[0].contrast).toBe(1);
  });

  test('platforms narrows the props, scenarios, bindings, rules and modules the extension adds', () => {
    const w = component();
    w.a11y.requires.push('keyboard-operable');
    writeWidget(w);
    ext('analytics', {
      ...ANALYTICS,
      platforms: ['web'],
      props: { ...ANALYTICS.props, both: { type: 'boolean', description: 'x', platforms: ['web', 'rn'] } },
      styles: { glow: { token: 'radius.md' } },
      keyboard: [{ keys: ['Enter'], action: 'Tracks.' }],
    });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    const c = entries[0]?.component;
    expect(c.props.track.platforms).toEqual(['web']);
    expect(c.props.both.platforms, 'the intersection with its own').toEqual(['web']);
    expect(c.behavior.find((sc: parse.Dict) => sc.name === 'press-tracks').platforms).toEqual(['web']);
    expect(c.styles.glow.platforms).toEqual(['web']);
    expect(c.keyboard[0].platforms).toEqual(['web']);
    expect(c.props.label, 'upstream is not narrowed').not.toHaveProperty('platforms');
    expect(c.events.onTrack.platforms, 'events are not narrowed').toEqual({ web: 'onTrack', rn: 'onTrack' });
    expect(entries[0]?.extensions[0].platforms).toEqual(['web']);
    expect(entries[0]?.extensions[0].modules.trackPress.platforms, "a module inherits the extension's").toEqual(['web']);
    expect(prompt('web')).toContain("import { trackPress } from './custom/analytics';");
    expect(prompt('rn')).not.toContain('trackPress');
    expect(prompt('rn'), 'nothing of it applies on rn').not.toContain('### analytics');
  });

  test('platforms naming a platform the component does not declare, or does not support', () => {
    ext('x', { extends: 'Widget', name: 'x', platforms: ['swiftui'] });
    let r = run();
    expect(r.code).toBe(1);
    expect(r.err).toContain("extensions/Widget.x.md: platforms includes 'swiftui', which Widget does not support");
    const c = component();
    c.platforms.lit = { supported: false };
    writeWidget(c);
    ext('x', { extends: 'Widget', name: 'x', platforms: ['lit'] });
    r = run();
    expect(r.code).toBe(1);
    expect(r.err).toContain("extensions/Widget.x.md: platforms includes 'lit', which Widget does not support");
  });

  test('an event is not narrowed, so it still maps every supported platform', () => {
    ext('x', { extends: 'Widget', name: 'x', platforms: ['web'], events: { onTrack: { description: 'x', platforms: { web: 'onTrack' } } } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("events.onTrack has no mapping for platform 'rn'");
    expect(err).not.toContain('(merged with');
  });

  test('defaults change upstream defaults, and the summary and prompt say from what', () => {
    writeRichWidget();
    ext('brand', { extends: 'Widget', name: 'brand', defaults: { variant: 'danger', hint: 'Optional' } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    const c = entries[0]?.component;
    expect(c.props.variant.default).toBe('danger');
    expect(c.props.hint.default).toBe('Optional');
    expect(c.props.variant, 'a default is a change, not an addition').not.toHaveProperty('source');
    expect(entries[0]?.extensions[0].defaults).toEqual({ variant: { from: 'primary', to: 'danger' }, hint: { from: null, to: 'Optional' } });
    expect(entries[0]?.extensions[0]).not.toHaveProperty('omits');
    for (const platform of ['web', 'rn']) {
      expect(prompt(platform)).toContain('Defaults changed from upstream: `variant` `primary` → `danger`, `hint` no default → `Optional`.');
    }
  });

  test('omit removes upstream items, and the summary and prompt list them', () => {
    writeRichWidget();
    ext('trim', { extends: 'Widget', name: 'trim', omit: { behavior: ['renders-plain'], props: ['hint'], events: ['onPress'], styles: ['muted'], copy: ['empty'] } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    const c = entries[0]?.component;
    expect(Object.keys(c.props)).not.toContain('hint');
    expect(c.events).toEqual({});
    expect(Object.keys(c.styles)).not.toContain('muted');
    expect(c.copy).toEqual({});
    expect(c.behavior).toEqual([]);
    expect(entries[0]?.extensions[0].omits).toEqual({ props: ['hint'], events: ['onPress'], styles: ['muted'], copy: ['empty'], behavior: ['renders-plain'] });
    expect(prompt('web')).toContain('Removed from upstream: props `hint`, events `onPress`, styles `muted`, copy `empty`, behavior `renders-plain`.');
  });

  test('an extension using no new field keeps its summary keys and its prose byte for byte', () => {
    ext('analytics', ANALYTICS);
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    expect(Object.keys(entries[0]?.extensions[0])).toEqual(['name', 'file', 'title', 'description', 'adds', 'keyboard', 'behavior', 'modules']);
    const record = { file: 'extensions/Widget.analytics.md', name: 'analytics', extends: 'Widget', extension: ANALYTICS, body: 'Why this exists.', title: 'analytics' };
    expect(parse.extensionsProse([record], 'web', ['web', 'rn'])).toBe(
      '## Extensions\n\nThe schema above already includes what these extensions add (items marked `source: extensions/...`). Implement them like any other prop, event, binding, copy string, keyboard rule or scenario.\n\n'
      + '### analytics — `extensions/Widget.analytics.md`\n\nWhy this exists.\n\n'
      + '**Hand-written modules** — import and call them exactly as stated; never create, edit or copy anything under `src/custom/`:\n\n'
      + "- `import { trackPress } from './custom/analytics';` — signature `(name: string, label: string) => void`. Called from onPress when `track` is set.",
    );
  });
});

describe('changing and removing upstream: refusals', () => {
  function fails(message: string | RegExp): string {
    const { code, err } = run();
    expect(code).toBe(1);
    if (typeof message === 'string') expect(err).toContain(message);
    else expect(err).toMatch(message);
    return err;
  }

  test('an anatomy part upstream or an earlier extension has', () => {
    ext('x', { extends: 'Widget', name: 'x', anatomy: ['label'] });
    fails("extensions/Widget.x.md: anatomy.label collides with Widget's own schema");
  });

  test('an anatomy part two extensions add', () => {
    ext('a', { extends: 'Widget', name: 'a', anatomy: ['badge'] });
    ext('b', { extends: 'Widget', name: 'b', anatomy: ['badge'] });
    fails('extensions/Widget.b.md: anatomy.badge collides with extensions/Widget.a.md');
  });

  test('a contrast pair upstream already declares', () => {
    ext('x', { extends: 'Widget', name: 'x', a11y: { contrast: [{ foreground: 'color.action.{variant}.foreground', background: 'color.action.{variant}.background', level: 'AAA' }] } });
    fails("extensions/Widget.x.md: a11y.contrast pair color.action.{variant}.foreground on color.action.{variant}.background collides with Widget's own schema");
  });

  test('a contrast pair two extensions add', () => {
    const a11y = { contrast: [{ foreground: 'color.foreground.muted', background: 'color.background.subtle' }] };
    ext('a', { extends: 'Widget', name: 'a', a11y });
    ext('b', { extends: 'Widget', name: 'b', a11y });
    fails('extensions/Widget.b.md: a11y.contrast pair color.foreground.muted on color.background.subtle collides with extensions/Widget.a.md');
  });

  test('a default for a prop upstream does not declare', () => {
    ext('x', { extends: 'Widget', name: 'x', defaults: { nope: 'x' } });
    fails('extensions/Widget.x.md: defaults.nope names no prop upstream on Widget');
  });

  test('a default for a prop an extension added', () => {
    ext('x', { ...ANALYTICS, name: 'x', defaults: { track: 'signup' } });
    fails('extensions/Widget.x.md: defaults.track names no prop upstream on Widget');
  });

  test('two extensions changing the same default', () => {
    ext('a', { extends: 'Widget', name: 'a', defaults: { variant: 'danger' } });
    ext('b', { extends: 'Widget', name: 'b', defaults: { variant: 'primary' } });
    fails('extensions/Widget.b.md: defaults.variant collides with extensions/Widget.a.md');
  });

  test('a default on a required prop', () => {
    ext('x', { extends: 'Widget', name: 'x', defaults: { label: 'Go' } });
    fails('extensions/Widget.x.md: defaults.label is required, so a default never applies');
  });

  test('an enum default outside its values keeps the prop check message, on the extension file', () => {
    ext('x', { extends: 'Widget', name: 'x', defaults: { variant: 'huge' } });
    const err = fails("extensions/Widget.x.md: defaults.variant: default 'huge' is not one of ['primary', 'danger']");
    expect(err).not.toContain('widget.md:');
  });

  test("the a11y.roleFrom prop: no default change, no omission", () => {
    const c = component();
    delete c.a11y.role;
    c.a11y.roleFrom = 'kind';
    c.props.kind = { type: 'enum', values: ['button', 'link'], default: 'button', description: 'The rendered role.' };
    writeWidget(c);
    ext('x', { extends: 'Widget', name: 'x', defaults: { kind: 'link' } });
    fails("extensions/Widget.x.md: defaults.kind is Widget's a11y.roleFrom — its default decides the rendered role");
    ext('x', { extends: 'Widget', name: 'x', omit: { props: ['kind'] } });
    fails('extensions/Widget.x.md: omit.props.kind carries an accessibility guarantee (a11y.roleFrom)');
  });

  test('omitting a name upstream does not declare: the stranded case after a pull', () => {
    ext('x', { extends: 'Widget', name: 'x', omit: { props: ['gone'] } });
    fails('extensions/Widget.x.md: omit.props.gone names nothing upstream on Widget');
  });

  test('omitting what another extension added', () => {
    ext('a', { ...ANALYTICS, name: 'a' });
    ext('b', { extends: 'Widget', name: 'b', omit: { props: ['track'] } });
    fails('extensions/Widget.b.md: omit.props.track was added by extensions/Widget.a.md; remove it there');
  });

  test('omitting what an earlier extension removed or changed the default of', () => {
    ext('a', { extends: 'Widget', name: 'a', defaults: { variant: 'danger' }, omit: { styles: ['radius'] } });
    ext('b', { extends: 'Widget', name: 'b', omit: { styles: ['radius'] } });
    fails('extensions/Widget.b.md: omit.styles.radius collides with extensions/Widget.a.md');
    ext('b', { extends: 'Widget', name: 'b', omit: { props: ['variant'] } });
    fails('extensions/Widget.b.md: omit.props.variant collides with extensions/Widget.a.md');
  });

  test('omitting a required prop', () => {
    ext('x', { extends: 'Widget', name: 'x', omit: { props: ['label'] } });
    fails('extensions/Widget.x.md: omit.props.label carries an accessibility guarantee (required, a11yRole: accessible-name, the accessible-name prop)');
  });

  test('omitting a prop with an a11yRole', () => {
    const c = component();
    c.props.hint = { type: 'string', description: 'Helper text.', a11yRole: 'description' };
    writeWidget(c);
    ext('x', { extends: 'Widget', name: 'x', omit: { props: ['hint'] } });
    fails('extensions/Widget.x.md: omit.props.hint carries an accessibility guarantee (a11yRole: description)');
  });

  test('omitting a locked binding', () => {
    ext('x', { extends: 'Widget', name: 'x', omit: { styles: ['background'] } });
    fails("extensions/Widget.x.md: omit.styles.background binds 'color.action.{variant}.background', which is locked (a11y.contrast pairs 'color.action.{variant}.background') — an extension may not remove an accessibility guarantee");
  });

  test('an omission a scenario still names: the existing message, then the extensions merged in', () => {
    const c = writeRichWidget();
    c.behavior = [{ name: 'shows-hint', given: { hint: 'Helpful' }, then: [{ text: 'Helpful' }] }];
    writeWidget(c);
    ext('analytics', ANALYTICS);
    ext('trim',{ extends: 'Widget', name: 'trim', omit: { props: ['hint'] } });
    const err = fails(/unknown prop 'hint'\n {2}\(merged with extensions\/Widget\.trim\.md\)\n/);
    expect(err).toContain('widget.md: frontmatter failed schema validation');
  });
});

describe('locks with extension contrast pairs', () => {
  test("a binding locked only by its own extension's pair is accepted, and locked", () => {
    ext('muted', {
      extends: 'Widget', name: 'muted',
      styles: { mutedText: { token: 'color.foreground.muted' } },
      a11y: { contrast: [{ foreground: 'color.foreground.muted', background: 'color.background.subtle' }] },
    });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    expect(entries[0]?.component.styles.mutedText.locked).toBe(true);
    expect(entries[0]?.component.styles.mutedText.source).toBe('extensions/Widget.muted.md');
  });

  test("beside it, an extension binding on an upstream pair's token is refused as today", () => {
    ext('muted', {
      extends: 'Widget', name: 'muted',
      styles: { glow: { token: 'color.action.{variant}.background' } },
      a11y: { contrast: [{ foreground: 'color.foreground.muted', background: 'color.background.subtle' }] },
    });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("extensions/Widget.muted.md: styles.glow binds 'color.action.{variant}.background', which is locked (contrast pair, focus ring or target) — an extension may add only overridable bindings");
  });

  test("a binding locked by another extension's pair is refused as today", () => {
    ext('a', { extends: 'Widget', name: 'a', styles: { mutedText: { token: 'color.foreground.muted' } } });
    ext('b', { extends: 'Widget', name: 'b', a11y: { contrast: [{ foreground: 'color.foreground.muted', background: 'color.background.subtle' }] } });
    const { code, err } = run();
    expect(code).toBe(1);
    expect(err).toContain("extensions/Widget.a.md: styles.mutedText binds 'color.foreground.muted', which is locked (contrast pair, focus ring or target)");
  });

  test('a pair on an upstream binding locks that binding, which is allowed', () => {
    writeRichWidget();
    ext('muted', { extends: 'Widget', name: 'muted', a11y: { contrast: [{ foreground: 'color.foreground.muted', background: 'color.background.subtle' }] } });
    const { code, entries, err } = run();
    expect(code, err).toBe(0);
    expect(entries[0]?.component.styles.muted.locked).toBe(true);
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
