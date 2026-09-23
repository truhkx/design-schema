/** tools/parse.ts — component docs to generated/components.json and the prompts (port of tests/test_parse.py). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { behaviorScenario, componentDef } from '../../schema/component.ts';
import { readText } from '../lib/py.ts';
import { dump } from '../lib/pyyaml.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { BODY, component, expectDocError, fmText, theme, usePaths, useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();
const std = useStd();

describe('generated/components.json', () => {
  /** The parser's output is schema data: stamped `source` markers and derived scenarios included. */
  test('every component and derived scenario revalidates', () => {
    const file = join(REPO_ROOT, 'generated', 'components.json');
    expect(existsSync(file), 'generated/components.json is missing — run pnpm parse').toBe(true);
    const entries = JSON.parse(readFileSync(file, 'utf8')) as parse.Dict[];
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const c = componentDef.safeParse(entry.component);
      expect(c.success, `${entry.id}.component: ${c.error?.message}`).toBe(true);
      for (const sc of entry.behaviorDerived as unknown[]) {
        const r = behaviorScenario.safeParse(sc);
        expect(r.success, `${entry.id}.behaviorDerived: ${r.error?.message}`).toBe(true);
      }
    }
  });
});

describe('splitFrontmatter', () => {
  test('splits frontmatter from body', () => {
    const f = write(join(tmp(), 'x.md'), '---\ntitle: Button\n---\nBody text\n');
    const [fm, body] = parse.splitFrontmatter(readText(f), f);
    expect(fm).toEqual({ title: 'Button' });
    expect(body).toBe('Body text\n');
  });

  test('missing frontmatter is an error', () => {
    expectDocError(() => parse.splitFrontmatter('# Just a heading\n', join(tmp(), 'x.md')), 'missing YAML frontmatter');
  });

  test('invalid yaml is reported with the file name', () => {
    expectDocError(() => parse.splitFrontmatter('---\na: [1, 2\n---\nbody\n', join(tmp(), 'broken.md')), 'broken.md: invalid YAML');
  });

  test('empty frontmatter becomes an empty mapping', () => {
    const [fm] = parse.splitFrontmatter('---\n\n---\nbody\n', join(tmp(), 'x.md'));
    expect(fm).toEqual({});
  });

  test('body may itself contain a horizontal rule', () => {
    const [, body] = parse.splitFrontmatter('---\ntitle: X\n---\nbefore\n\n---\n\nafter\n', join(tmp(), 'x.md'));
    expect(body).toContain('before');
    expect(body).toContain('after');
  });
});

describe('splitSections', () => {
  const file = (): string => join(tmp(), 'x.md');

  test('text before the first heading becomes overview', () => {
    const s = parse.splitSections(BODY, file());
    expect(s.Overview).toBe('Intro prose before any heading.');
    expect(s['When to use']).toBe('Use it when you need it.');
  });

  test('empty sections are dropped', () => {
    const body = '## When to use\n\nyes\n\n## Accessibility\n\nyes\n';
    expect(parse.splitSections(body, file())).not.toHaveProperty('Overview');
  });

  test('unknown heading is rejected and lists the allowed ones', () => {
    expectDocError(() => parse.splitSections(BODY + '\n## Vibes\n\nnope\n', file()), "'## Vibes' is not allowed");
  });

  test('duplicate heading is rejected', () => {
    expectDocError(() => parse.splitSections(BODY + '\n## When to use\n\nagain\n', file()), 'duplicate section');
  });

  test.each(['When to use', 'Accessibility'])('required section %s must be present', (missing) => {
    const body = BODY.replace(`## ${missing}`, '## Behavior');
    expectDocError(() => parse.splitSections(body, file()), `required section '## ${missing}'`);
  });

  test('a required section that is present but empty still fails', () => {
    const body = '## When to use\n\nyes\n\n## Accessibility\n\n';
    expectDocError(() => parse.splitSections(body, file()), "required section '## Accessibility'");
  });

  test('a heading may be qualified with a suffix', () => {
    expect(parse.splitSections(BODY + '\n## Examples with icons\n\nsome\n', file())).toHaveProperty('Examples with icons');
  });

  test('a prefix that is not a word boundary is still rejected', () => {
    expectDocError(() => parse.splitSections(BODY + '\n## Behaviors\n\nsome\n', file()), 'not allowed');
  });

  test('hashes inside a fenced code block are not headings', () => {
    const s = parse.splitSections(BODY + '\n## Examples\n\n```md\n## Not A Heading\n```\n', file());
    expect(s).not.toHaveProperty('Not A Heading');
    expect(s.Examples).toContain('## Not A Heading');
  });

  test('sub headings are kept inside their section', () => {
    const s = parse.splitSections(BODY + '\n## Platform notes\n\n### Web\n\nweb text\n', file());
    expect(s['Platform notes']).toContain('### Web');
  });

  test('the allowed and required lists are configurable', () => {
    const s = parse.splitSections('## Feel\n\nquiet\n\n## When to use\n\nalways\n', join(tmp(), 't.md'), parse.THEME_HEADINGS, ['Feel', 'When to use']);
    expect(s.Feel).toBe('quiet');
  });
});

describe('validate', () => {
  const check = (c: parse.Dict, stem = 'widget'): void => parse.validate({ component: c }, join(tmp(), `${stem}.md`));

  test('a well formed component passes', () => {
    check(component());
  });

  test('schema errors are reported with their path', () => {
    const c = component();
    c.category = 'vibes';
    expectDocError(() => check(c), 'component.category');
  });

  test('missing required frontmatter key fails', () => {
    const c = component();
    delete c.a11y;
    expectDocError(() => check(c), 'failed schema validation');
  });

  test('name must match the file name', () => {
    expectDocError(() => check(component(), 'gadget'), 'should match file name');
  });

  test('a doc may not author source, which only stampSources sets', () => {
    const c = component();
    c.props.label.source = 'extensions/Widget.x.md';
    expectDocError(() => check(c), "props.label sets 'source'");
    const k = component();
    k.a11y.requires.push('keyboard-operable');
    k.keyboard = [{ keys: ['Enter'], action: 'x', source: 'extensions/Widget.x.md' }];
    expectDocError(() => check(k), "keyboard.0 sets 'source'");
  });

  test('hyphens in the file name are ignored when matching', () => {
    const c = component();
    c.name = 'TextField';
    c.styles = { radius: { token: 'radius.md' } };
    check(c, 'text-field');
  });

  test('a token slot must name an enum prop', () => {
    const c = component();
    c.styles.background = { token: 'color.action.{label}.background' };
    expectDocError(() => check(c), "'label' is not an enum prop");
  });

  test('a token slot naming no prop at all is rejected', () => {
    const c = component();
    c.styles.background = { token: 'color.action.{tone}.background' };
    expectDocError(() => check(c), "interpolates '{tone}'");
  });

  test('a gesture event requires a non gesture alternative', () => {
    const c = component();
    c.events.onSwipe = { description: 'Swiped.', gesture: true, platforms: { web: 'onSwipe', rn: 'onSwipe' } };
    expectDocError(() => check(c), 'gesture-alternative');
  });

  test('a gesture event passes once the alternative is declared', () => {
    const c = component();
    c.events.onSwipe = { description: 'Swiped.', gesture: true, platforms: { web: 'onSwipe', rn: 'onSwipe' } };
    c.a11y.requires.push('gesture-alternative');
    check(c);
  });

  test('every event must map on every supported platform', () => {
    const c = component();
    delete c.events.onPress.platforms.rn;
    expectDocError(() => check(c), "no mapping for platform 'rn'");
  });

  test('an unsupported platform needs no event mapping', () => {
    const c = component();
    c.platforms.lit = { supported: false, notes: 'Not mapped yet.' };
    check(c);
  });

  test('an enum prop without values is a schema error', () => {
    const c = component();
    delete c.props.size.values;
    delete c.props.size.enumRef;
    expectDocError(() => check(c), 'component.props.size.values');
  });

  test('an unknown key is a schema error', () => {
    const c = component();
    c.props.label.colour = 'red';
    expectDocError(() => check(c), 'component.props.label');
  });

  test("a deprecated component's use names another component with a doc", () => {
    parse.paths.DOCS = tmp();
    write(join(tmp(), 'button.md'), '');
    const c = component();
    c.status = 'deprecated';
    c.deprecated = { reason: 'Replaced.', use: 'Button' };
    check(c);
    c.deprecated.use = 'Gadget';
    expectDocError(() => check(c), "deprecated.use names 'Gadget', which is not another component with a doc");
    c.deprecated.use = 'Widget';
    write(join(tmp(), 'widget.md'), '');
    expectDocError(() => check(c), "deprecated.use names 'Widget', which is not another component with a doc");
  });

  test('a composition naming a deprecated component is an error, with the text the warning had until job 651', () => {
    parse.takeWarnings();
    Object.assign(parse.paths, { DOCS: tmp(), ROOT: tmp() });
    const badge = component();
    Object.assign(badge, { name: 'Badge', status: 'deprecated', deprecated: { reason: 'Replaced.', use: 'Widget' } });
    write(join(tmp(), 'badge.md'), '---\n' + fmText(badge) + '---\n' + BODY);
    const c = component();
    c.composition = { label: 'Badge' };
    expectDocError(() => check(c), 'widget.md: composition.label: Badge is deprecated; use Widget');
    expect(parse.takeWarnings()).toEqual([]);
    badge.status = 'review';
    delete badge.deprecated;
    write(join(tmp(), 'badge.md'), '---\n' + fmText(badge) + '---\n' + BODY);
    check(c);
    expect(parse.takeWarnings()).toEqual([]);
  });

  test('starlight fields beside the component block are fine', () => {
    parse.validate({ title: 'Widget', description: 'A widget.', sidebar: { order: 2 }, component: component() }, join(tmp(), 'widget.md'));
  });
});

describe('renderPrompt', () => {
  test('every placeholder is substituted', () => {
    const templates = join(tmp(), 'templates');
    write(join(templates, 'web.md'), '# {{NAME}} for {{PLATFORM}}\n\n{{SCHEMA_YAML}}\n\n{{GUIDANCE}}\n\n{{PLATFORM_NOTES}}\n');
    parse.paths.TEMPLATES = templates;
    const c = component();
    const out = parse.renderPrompt(c, { 'When to use': 'Use it.', Accessibility: 'A11y.' }, 'web', fmText(c));
    expect(out).toContain('# Widget for web');
    expect(out).toContain('name: Widget');
    expect(out).toContain('## When to use\n\nUse it.');
    expect(out).toContain('element: button');
    expect(out).not.toContain('{{');
  });

  test('guidance follows the canonical section order', () => {
    const templates = join(tmp(), 'templates');
    write(join(templates, 'web.md'), '{{GUIDANCE}}');
    parse.paths.TEMPLATES = templates;
    const c = component();
    const out = parse.renderPrompt(c, { Accessibility: 'A.', Overview: 'O.', 'When to use': 'W.' }, 'web', fmText(c));
    expect(out.indexOf('## Overview')).toBeLessThan(out.indexOf('## When to use'));
    expect(out.indexOf('## When to use')).toBeLessThan(out.indexOf('## Accessibility'));
  });
});

describe('main', () => {
  /** main() reads DOCS + THEME_DOCS and writes generated/. */
  function sandbox(): { docs: string; out: string } {
    const root = tmp();
    const docs = join(root, 'components');
    const themes = join(root, 'themes');
    const out = join(root, 'generated');
    const templates = join(root, 'templates');
    write(join(templates, 'web.md'), '{{NAME}}|{{PLATFORM}}|{{SCHEMA_YAML}}|{{GUIDANCE}}|{{PLATFORM_NOTES}}');
    write(join(templates, 'rn.md'), '{{NAME}}|{{PLATFORM}}|{{SCHEMA_YAML}}|{{GUIDANCE}}|{{PLATFORM_NOTES}}');
    write(join(templates, 'theme.md'), '{{NAME}}|{{TONE}}|{{NOT}}|{{THEME_YAML}}|{{TOKENS_LIGHT}}|{{GUIDANCE}}');
    for (const d of [docs, themes, out]) write(join(d, '.keep'), '');
    Object.assign(parse.paths, {
      DOCS: docs, THEME_DOCS: themes, OUT: out, TEMPLATES: templates, ROOT: root,
      EXT_DOCS: join(root, 'extensions'), // none: the real extensions extend real components
      PATTERN_DOCS: join(root, 'patterns'), // none: the real pattern names real components
    });
    return { docs, out };
  }
  const entries = (out: string): parse.Dict[] => JSON.parse(readFileSync(join(out, 'components.json'), 'utf8')) as parse.Dict[];

  test('writes components json and a prompt per platform', () => {
    const { docs, out } = sandbox();
    write(join(docs, 'widget.md'), '---\n' + fmText(component(), { title: 'Widget', description: 'A widget.' }) + '---\n' + BODY);
    expect(parse.main()).toBe(0);
    const e = entries(out);
    expect(e.map((x) => x.id)).toEqual(['widget']);
    expect(e[0]?.title).toBe('Widget');
    expect(e[0]?.published, 'status review counts as published').toBe(true);
    expect(e[0]?.sections['When to use']).toBe('Use it when you need it.');
    expect(existsSync(join(out, 'prompts', 'Widget.web.md'))).toBe(true);
    expect(existsSync(join(out, 'prompts', 'Widget.rn.md'))).toBe(true);
  });

  test('draft components are marked unpublished', () => {
    const { docs, out } = sandbox();
    const c = component();
    c.status = 'draft';
    write(join(docs, 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    parse.main();
    expect(entries(out)[0]?.published).toBe(false);
  });

  test('no prompt is written for a platform without a template', () => {
    const { docs, out } = sandbox();
    const c = component();
    c.platforms.lit = { tag: 'ds-widget', reflect: ['variant', 'size'] };
    c.events.onPress.platforms.lit = 'press';
    write(join(docs, 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    expect(parse.main()).toBe(0);
    expect(existsSync(join(out, 'prompts', 'Widget.lit.md'))).toBe(false);
  });

  test('no prompt is written for an unsupported platform', () => {
    const { docs, out } = sandbox();
    const c = component();
    c.platforms.rn = { supported: false, notes: 'Later.' };
    write(join(docs, 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    expect(parse.main()).toBe(0);
    expect(existsSync(join(out, 'prompts', 'Widget.rn.md'))).toBe(false);
  });

  test('a doc without a component block is an error', () => {
    const { docs } = sandbox();
    write(join(docs, 'widget.md'), '---\ntitle: Widget\n---\n' + BODY);
    expect(parse.main()).toBe(1);
    expect(std.err()).toContain('no `component:` block');
  });

  test('one bad doc does not stop the others', () => {
    const { docs, out } = sandbox();
    write(join(docs, 'widget.md'), '---\n' + fmText(component()) + '---\n' + BODY);
    write(join(docs, 'broken.md'), 'no frontmatter at all\n');
    expect(parse.main()).toBe(1);
    expect(entries(out).map((x) => x.id)).toEqual(['widget']);
  });

  test('zero docs is not a failure', () => {
    const { out } = sandbox();
    expect(parse.main()).toBe(0);
    expect(entries(out)).toEqual([]);
    expect(std.out()).toBe('✔ 0 component(s), 0 theme(s), 0 pattern(s) parsed, 0 error(s) → generated/\n');
  });
});

describe('parseThemes', () => {
  test('a theme without derived tokens is reported', () => {
    const root = tmp();
    const themes = join(root, 'themes');
    const out = join(root, 'generated');
    const templates = join(root, 'templates');
    write(join(templates, 'theme.md'), '{{NAME}}|{{TOKENS_LIGHT}}');
    write(join(themes, 'test-theme.md'), '---\n' + dump({ title: 'T', theme: theme() }) + '---\n\n## Feel\n\nq\n\n## When to use\n\na\n');
    write(join(out, '.keep'), '');
    Object.assign(parse.paths, { THEME_DOCS: themes, OUT: out, TEMPLATES: templates, ROOT: root });
    const [themesOut, errors] = parse.parseThemes();
    expect(themesOut).toEqual([]);
    expect(errors.some((e) => e.includes('run tools/theme.ts first'))).toBe(true);
  });
});

describe('Declared contracts: Keyboard', () => {
  /** The section's lines, or [] when it is absent. */
  function keyboardLines(c: parse.Dict, platform: string): string[] {
    const section = /## Keyboard\n\n([\s\S]*?)\n\n/.exec(parse.contractSections(componentDef.parse(c) as parse.Dict, platform));
    return section?.[1]?.split('\n') ?? [];
  }

  test('a doc with only plain rules lists every rule', () => {
    const c = component();
    c.a11y.requires = [...c.a11y.requires, 'keyboard-operable', 'arrow-navigation'];
    c.keyboard = [
      { keys: ['ArrowLeft'], action: 'Moves to the previous item.', expect: 'focus-prev' },
      { keys: ['ArrowRight'], action: 'Moves to the next item.', expect: 'focus-next' },
      { keys: ['Home'], action: 'Moves to the first item.', expect: 'focus-first' },
    ];
    expect(keyboardLines(c, 'web')).toEqual([
      '- `ArrowLeft` (Moves to the previous item.): expect focus-prev',
      '- `ArrowRight` (Moves to the next item.): expect focus-next',
      '- `Home` (Moves to the first item.): expect focus-first',
    ]);
  });

  test('a mixed doc lists every rule in doc order, with contract detail only where declared', () => {
    const c = component();
    c.a11y.requires = [...c.a11y.requires, 'keyboard-operable'];
    c.keyboard = [
      { keys: ['Home'], action: 'Moves to the first item.', expect: 'focus-first' },
      { keys: ['Enter', ' '], action: 'Presses the native button.', expect: 'toggles', native: true },
      { keys: ['End'], action: 'Moves to the last item.', expect: 'focus-last' },
      { keys: ['Tab'], action: 'Moves on.', expect: 'focus-next', repeat: 2 },
    ];
    expect(keyboardLines(c, 'web')).toEqual([
      '- `Home` (Moves to the first item.): expect focus-first',
      '- `Enter`, ` ` (Presses the native button.): expect toggles; native: the rendered element already does this',
      '- `End` (Moves to the last item.): expect focus-last',
      '- `Tab` (Moves on.): expect focus-next; repeat 2',
    ]);
  });
});
