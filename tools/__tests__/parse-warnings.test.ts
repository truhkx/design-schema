/** tools/parse.ts's warning channel: `warn`/`takeWarnings`, the summary line, generated/parse-warnings.json and
 *  DS_WARNINGS_AS_ERRORS. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { componentWarnings } from '../../schema/component.ts';
import type { ComponentDef } from '../../schema/component.ts';
import { readText } from '../lib/py.ts';
import * as parse from '../parse.ts';
import { BODY, component, fmText, useStd, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();
const std = useStd();

afterEach(() => {
  delete process.env.DS_WARNINGS_AS_ERRORS;
  parse.takeWarnings();
});

/** A temp tree with one valid component doc per name, the parser pointed at it. */
function sandbox(names: string[] = ['Widget']): string {
  const root = tmp();
  const templates = join(root, 'templates');
  write(join(templates, 'web.md'), '{{NAME}}|{{PLATFORM}}');
  write(join(templates, 'rn.md'), '{{NAME}}|{{PLATFORM}}');
  write(join(templates, 'theme.md'), '{{NAME}}');
  for (const n of names) {
    const c = component();
    c.name = n;
    write(join(root, 'components', `${n.toLowerCase()}.md`), '---\n' + fmText(c) + '---\n' + BODY);
  }
  Object.assign(parse.paths, {
    ROOT: root, DOCS: join(root, 'components'), THEME_DOCS: join(root, 'themes'), OUT: join(root, 'generated'), TEMPLATES: templates,
    EXT_DOCS: join(root, 'extensions'), PATTERN_DOCS: join(root, 'patterns'),
  });
  return root;
}

const warningsFile = (root: string): unknown => JSON.parse(readFileSync(join(root, 'generated', 'parse-warnings.json'), 'utf8'));

describe('warn and takeWarnings', () => {
  test('returns what was recorded since the last call, then clears', () => {
    parse.warn('site/a.md', 'first');
    expect(parse.takeWarnings()).toEqual([{ file: 'site/a.md', message: 'first' }]);
    expect(parse.takeWarnings()).toEqual([]);
  });

  test('componentWarnings finds nothing in the fixture component', () => {
    expect(componentWarnings(component() as ComponentDef)).toEqual([]);
  });

  test('a fixture validator calling warn yields exactly that warning', () => {
    sandbox();
    parse.hooks.componentWarnings = (c) => {
      parse.warn('components/widget.md', `${c.name} is fine but could be finer`);
      return [];
    };
    parse.main();
    expect(warningsFile(tmp())).toEqual([{ file: 'components/widget.md', message: 'Widget is fine but could be finer' }]);
    expect(parse.takeWarnings(), 'main takes the warnings it reports').toEqual([]);
  });
});

describe('main', () => {
  test('zero warnings leaves the summary line unchanged and writes []', () => {
    const root = sandbox();
    expect(parse.main()).toBe(0);
    expect(std.out()).toBe('✔ 1 component(s), 0 theme(s), 0 pattern(s) parsed, 0 error(s) → generated/\n');
    expect(std.err()).toBe('');
    expect(readText(join(root, 'generated', 'parse-warnings.json'))).toBe('[]\n');
  });

  test('a component warning is forwarded with its path, printed, and counted', () => {
    const root = sandbox();
    parse.hooks.componentWarnings = () => [{ path: 'keyboard.3.target', message: 'names no anatomy part' }];
    expect(parse.main(), 'a warning never fails the run').toBe(0);
    expect(std.out()).toBe('✔ 1 component(s), 0 theme(s), 0 pattern(s) parsed, 0 error(s), 1 warning(s) → generated/\n');
    expect(std.err()).toBe('⚠ components/widget.md: keyboard.3.target: names no anatomy part\n');
    expect(warningsFile(root)).toEqual([{ file: 'components/widget.md', message: 'keyboard.3.target: names no anatomy part' }]);
  });

  test('a warning does not change components.json', () => {
    const root = sandbox();
    parse.main();
    const before = readFileSync(join(root, 'generated', 'components.json'), 'utf8');
    parse.hooks.componentWarnings = () => [{ path: 'name', message: 'x' }];
    parse.main();
    expect(readFileSync(join(root, 'generated', 'components.json'), 'utf8')).toBe(before);
  });

  test('generated/parse-warnings.json is sorted by file then message, two-space JSON with a trailing newline', () => {
    const root = sandbox(['Widget', 'Gadget']);
    parse.hooks.componentWarnings = (c) => {
      if (c.name === 'Widget') parse.warn('components/aaa.md', 'direct');
      return [{ path: 'styles', message: 'zeta' }, { path: 'props', message: 'alpha' }];
    };
    parse.main();
    const text = readText(join(root, 'generated', 'parse-warnings.json')); // the platform's line ending, like every generated file
    const expected = [
      { file: 'components/aaa.md', message: 'direct' },
      { file: 'components/gadget.md', message: 'props: alpha' },
      { file: 'components/gadget.md', message: 'styles: zeta' },
      { file: 'components/widget.md', message: 'props: alpha' },
      { file: 'components/widget.md', message: 'styles: zeta' },
    ];
    expect(text).toBe(JSON.stringify(expected, null, 2) + '\n');
    expect(std.out()).toContain('0 error(s), 5 warning(s) →');
  });

  test('DS_WARNINGS_AS_ERRORS=1 counts every warning as an error and fails the run', () => {
    sandbox();
    parse.hooks.componentWarnings = () => [{ path: 'keyboard.3.target', message: 'names no anatomy part' }];
    process.env.DS_WARNINGS_AS_ERRORS = '1';
    expect(parse.main()).toBe(1);
    expect(std.err()).toBe('✖ components/widget.md: keyboard.3.target: names no anatomy part\n');
    expect(std.out()).toBe('✖ 1 component(s), 0 theme(s), 0 pattern(s) parsed, 1 error(s) → generated/\n');
  });

  test('DS_WARNINGS_AS_ERRORS=1 with no warnings still passes', () => {
    sandbox();
    process.env.DS_WARNINGS_AS_ERRORS = '1';
    expect(parse.main()).toBe(0);
  });
});
