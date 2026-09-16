/** tools/site_nav.ts — the website's generated nav data (top links + phase-grouped docs sidebar). */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { PhasesError } from '../lib/phases.ts';
import type { Phase } from '../lib/phases.ts';
import * as nav from '../site_nav.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...nav.paths };
afterEach(() => {
  Object.assign(nav.paths, saved);
});

/** A phases file with the same shape as the real one: two component phases and a pattern phase. */
const PHASES: { description: string; phases: Phase[] } = {
  description: 'Phases in composition order.',
  phases: [
    { name: 'Primitives', components: ['Icon', 'Text'] },
    { name: 'Core', components: ['Button', 'Link', 'Input'] },
    { name: 'Patterns', pattern: 'SettingsPage' },
  ],
};
const PHASES_TEXT = JSON.stringify(PHASES, null, 2);

/** PHASES with one phase's components replaced. */
function withComponents(phase: string, components: string[]): string {
  return JSON.stringify({ ...PHASES, phases: PHASES.phases.map((p) => (p.name === phase ? { ...p, components } : p)) });
}

const entry = (name: string): nav.Entry => ({ id: name.toLowerCase(), component: { name } });
const COMPONENTS = ['Link', 'Icon', 'Input', 'Button', 'Text'].map(entry); // parser order, not phase order

let root = '';

beforeEach(() => {
  root = tmp();
  Object.assign(nav.paths, {
    ROOT: root,
    COMPONENTS: join(root, 'generated', 'components.json'),
    PHASES: join(root, 'tools', 'regen-phases.json'),
    OUT: join(root, 'generated', 'nav.json'),
  });
  write(nav.paths.PHASES, PHASES_TEXT);
  write(nav.paths.COMPONENTS, JSON.stringify(COMPONENTS));
});

describe('parsePhases', () => {
  test('reads the phase order, skipping phases that name a pattern', () => {
    expect(nav.parsePhases(PHASES_TEXT)).toEqual([
      ['Primitives', ['Icon', 'Text']],
      ['Core', ['Button', 'Link', 'Input']],
    ]);
  });

  test('the real tools/regen-phases.json is parseable and covers every component', () => {
    const phases = nav.parsePhases(readFileSync(saved.PHASES, 'utf8'));
    expect(phases.map(([name]) => name)).toEqual([
      'Primitives', 'Core', 'Controls', 'Focus', 'Overlays', 'Selection', 'Numeric', 'Rows', 'Grids', 'Streams',
    ]);
    expect(phases.flatMap(([, names]) => names)).toHaveLength(51);
  });

  test('an unparseable file is an error, not an empty sidebar', () => {
    expect(() => nav.parsePhases('# no phases here\n')).toThrow(PhasesError);
  });
});

describe('buildNav', () => {
  test('groups in phase order, and orders components within a phase as the phases file does', () => {
    const built = nav.buildNav(COMPONENTS, nav.parsePhases(PHASES_TEXT));
    expect(built.docs).toEqual([
      { phase: 'Primitives', components: [{ name: 'Icon', slug: 'icon' }, { name: 'Text', slug: 'text' }] },
      {
        phase: 'Core',
        components: [{ name: 'Button', slug: 'button' }, { name: 'Link', slug: 'link' }, { name: 'Input', slug: 'input' }],
      },
    ]);
    expect(built.top.map((item) => item.label)).toEqual(['Docs', 'GitHub', 'About']);
    expect(built.top.filter((item) => item.external)).toEqual([{ label: 'GitHub', href: nav.REPO_URL, external: true }]);
  });

  test('a component in no phase is an error', () => {
    expect(() => nav.buildNav([...COMPONENTS, entry('Dialog')], nav.parsePhases(PHASES_TEXT))).toThrow(
      /no tools\/regen-phases\.json phase composes Dialog/,
    );
  });

  test('a phase naming a component the schema lacks is an error', () => {
    const withoutIcon = COMPONENTS.filter((e) => e.component?.name !== 'Icon');
    expect(() => nav.buildNav(withoutIcon, nav.parsePhases(PHASES_TEXT))).toThrow(/names Icon, which is not in/);
  });

  test('a component in two phases is an error', () => {
    const twice = withComponents('Core', ['Button', 'Link', 'Input', 'Icon']);
    expect(() => nav.buildNav(COMPONENTS, nav.parsePhases(twice))).toThrow(/Icon is in two phases: Primitives and Core/);
  });
});

describe('main', () => {
  test('writes nav.json and is byte-identical on a re-run', () => {
    expect(nav.main([])).toBe(0);
    const first = readFileSync(nav.paths.OUT);
    expect(std.out()).toContain('5 components in 2 phases, 3 top-level links');
    expect(nav.main([])).toBe(0);
    expect(readFileSync(nav.paths.OUT).equals(first)).toBe(true);
    expect(nav.main(['--check'])).toBe(0);
  });

  test('--check fails when nav.json is missing or stale', () => {
    expect(nav.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is missing');
    expect(nav.main([])).toBe(0);
    write(nav.paths.COMPONENTS, JSON.stringify(COMPONENTS.filter((e) => e.component?.name !== 'Text')));
    write(nav.paths.PHASES, withComponents('Primitives', ['Icon']));
    expect(nav.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is stale');
  });

  test('a missing components.json says to run parse, and writes nothing', () => {
    Object.assign(nav.paths, { COMPONENTS: join(root, 'generated', 'gone.json') });
    expect(nav.main([])).toBe(1);
    expect(std.err()).toContain('run `pnpm parse` first');
    expect(existsSync(nav.paths.OUT)).toBe(false);
  });

  test('a missing phases file exits 1 and names the file', () => {
    Object.assign(nav.paths, { PHASES: join(root, 'tools', 'gone-phases.json') });
    expect(nav.main([])).toBe(1);
    expect(std.err()).toContain('✖ tools/gone-phases.json missing');
    expect(existsSync(nav.paths.OUT)).toBe(false);
  });

  test('a malformed phases file exits 1 with the message, not a stack trace', () => {
    write(nav.paths.PHASES, JSON.stringify(PHASES.phases));
    expect(nav.main([])).toBe(1);
    expect(std.err()).toContain('✖ tools/regen-phases.json: the top level is a bare array');
  });

  test('an unknown flag exits 2', () => {
    expect(nav.main(['--phase'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --phase');
  });
});
