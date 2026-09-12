/** tools/site_nav.ts — the website's generated nav data (top links + phase-grouped docs sidebar). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as nav from '../site_nav.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...nav.paths };
afterEach(() => {
  Object.assign(nav.paths, saved);
});

/** A regen.ps1 with the same shape as the real one: two component phases and a pattern phase. */
const REGEN = `param([string]$From = "")
# Phases in composition order.
$phases = @(
  @{ name = "Primitives"; components = "Icon,Text" },
  @{ name = "Core";       components = "Button,Link,Input" },
  @{ name = "Patterns";   pattern = "SettingsPage" }
)
Log "done"
`;

const entry = (name: string): nav.Entry => ({ id: name.toLowerCase(), component: { name } });
const COMPONENTS = ['Link', 'Icon', 'Input', 'Button', 'Text'].map(entry); // parser order, not phase order

let root = '';

beforeEach(() => {
  root = tmp();
  Object.assign(nav.paths, {
    ROOT: root,
    COMPONENTS: join(root, 'generated', 'components.json'),
    REGEN: join(root, 'regen.ps1'),
    OUT: join(root, 'generated', 'nav.json'),
  });
  write(nav.paths.REGEN, REGEN);
  write(nav.paths.COMPONENTS, JSON.stringify(COMPONENTS));
});

describe('parsePhases', () => {
  test('reads the phase order, skipping phases that name a pattern', () => {
    expect(nav.parsePhases(REGEN)).toEqual([
      ['Primitives', ['Icon', 'Text']],
      ['Core', ['Button', 'Link', 'Input']],
    ]);
  });

  test('the real regen.ps1 is parseable and covers every component', () => {
    const phases = nav.parsePhases(readFileSync(join(saved.ROOT, 'regen.ps1'), 'utf8'));
    expect(phases.map(([name]) => name)).toEqual([
      'Primitives', 'Core', 'Controls', 'Focus', 'Overlays', 'Selection', 'Numeric', 'Rows', 'Grids', 'Streams',
    ]);
    expect(phases.flatMap(([, names]) => names)).toHaveLength(51);
  });

  test('an unparseable file is an error, not an empty sidebar', () => {
    expect(() => nav.parsePhases('# no phases here\n')).toThrow(nav.NavError);
  });
});

describe('buildNav', () => {
  test('groups in phase order, and orders components within a phase as regen.ps1 does', () => {
    const built = nav.buildNav(COMPONENTS, nav.parsePhases(REGEN));
    expect(built.docs).toEqual([
      { phase: 'Primitives', components: [{ name: 'Icon', slug: 'icon' }, { name: 'Text', slug: 'text' }] },
      {
        phase: 'Core',
        components: [{ name: 'Button', slug: 'button' }, { name: 'Link', slug: 'link' }, { name: 'Input', slug: 'input' }],
      },
    ]);
    expect(built.top.map((item) => item.label)).toEqual(['Homepage', 'Docs', 'GitHub', 'About']);
    expect(built.top.filter((item) => item.external)).toEqual([{ label: 'GitHub', href: nav.REPO_URL, external: true }]);
  });

  test('a component in no phase is an error', () => {
    expect(() => nav.buildNav([...COMPONENTS, entry('Dialog')], nav.parsePhases(REGEN))).toThrow(/no regen\.ps1 phase composes Dialog/);
  });

  test('a phase naming a component the schema lacks is an error', () => {
    const withoutIcon = COMPONENTS.filter((e) => e.component?.name !== 'Icon');
    expect(() => nav.buildNav(withoutIcon, nav.parsePhases(REGEN))).toThrow(/names Icon, which is not in/);
  });

  test('a component in two phases is an error', () => {
    const twice = REGEN.replace('"Button,Link,Input"', '"Button,Link,Input,Icon"');
    expect(() => nav.buildNav(COMPONENTS, nav.parsePhases(twice))).toThrow(/Icon is in two phases: Primitives and Core/);
  });
});

describe('main', () => {
  test('writes nav.json and is byte-identical on a re-run', () => {
    expect(nav.main([])).toBe(0);
    const first = readFileSync(nav.paths.OUT);
    expect(std.out()).toContain('5 components in 2 phases, 4 top-level links');
    expect(nav.main([])).toBe(0);
    expect(readFileSync(nav.paths.OUT).equals(first)).toBe(true);
    expect(nav.main(['--check'])).toBe(0);
  });

  test('--check fails when nav.json is missing or stale', () => {
    expect(nav.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is missing');
    expect(nav.main([])).toBe(0);
    write(nav.paths.COMPONENTS, JSON.stringify(COMPONENTS.filter((e) => e.component?.name !== 'Text')));
    write(nav.paths.REGEN, REGEN.replace('"Icon,Text"', '"Icon"'));
    expect(nav.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is stale');
  });

  test('a missing components.json says to run parse, and writes nothing', () => {
    Object.assign(nav.paths, { COMPONENTS: join(root, 'generated', 'gone.json') });
    expect(nav.main([])).toBe(1);
    expect(std.err()).toContain('run `pnpm parse` first');
    expect(existsSync(nav.paths.OUT)).toBe(false);
  });

  test('an unknown flag exits 2', () => {
    expect(nav.main(['--phase'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --phase');
  });
});
