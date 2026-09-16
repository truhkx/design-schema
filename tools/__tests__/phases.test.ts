/** tools/lib/phases.ts — tools/regen-phases.json, the regeneration phase order, and regen.ps1's read of it. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { PHASES_FILE, PhasesError, componentPhases, parsePhasesJson, readPhases } from '../lib/phases.ts';
import type { Phase } from '../lib/phases.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useTmp } from './fixtures.ts';

const tmp = useTmp();

const SOURCE = 'phases.json';
const parse = (data: unknown): Phase[] => parsePhasesJson(JSON.stringify(data), SOURCE);
const withPhases = (...phases: unknown[]): { phases: unknown[] } => ({ phases });

function expectPhasesError(fn: () => unknown, pattern: RegExp): void {
  let caught: unknown;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  expect(caught, 'expected a PhasesError').toBeInstanceOf(PhasesError);
  expect((caught as Error).message.startsWith(`${SOURCE}: `)).toBe(true);
  expect((caught as Error).message).toMatch(pattern);
}

describe('parsePhasesJson', () => {
  test('text that is not JSON', () => {
    expectPhasesError(() => parsePhasesJson('{ phases: [', SOURCE), /^phases\.json: not valid JSON/);
  });

  test('a bare array names the object shape and the PowerShell reason', () => {
    expectPhasesError(() => parse([{ name: 'Core', components: ['Button'] }]), /^phases\.json: .*\{ "phases": \[\.\.\.\] \}.*PowerShell/);
  });

  test('an object with no phases array', () => {
    expectPhasesError(() => parse({ description: 'x' }), /^phases\.json: expected an object with a "phases" array/);
    expectPhasesError(() => parse({ phases: 'Core' }), /^phases\.json: expected an object with a "phases" array/);
    expectPhasesError(() => parse('Core'), /^phases\.json: expected an object/);
  });

  test('a phase with no non-empty string name', () => {
    expectPhasesError(() => parse(withPhases({ components: ['Button'] })), /^phases\.json: phase 1 has no "name"/);
    expectPhasesError(() => parse(withPhases({ name: '', components: ['Button'] })), /^phases\.json: phase 1 has no "name"/);
    expectPhasesError(() => parse(withPhases({ name: 'Core', components: ['Button'] }, { name: 7, pattern: 'P' })), /^phases\.json: phase 2 has no "name"/);
  });

  test('a phase with both components and pattern', () => {
    expectPhasesError(() => parse(withPhases({ name: 'Core', components: ['Button'], pattern: 'SettingsPage' })), /^phases\.json: phase Core .*not both/);
  });

  test('a phase with neither components nor pattern', () => {
    expectPhasesError(() => parse(withPhases({ name: 'Core' })), /^phases\.json: phase Core .*not neither/);
  });

  test('components that are not a non-empty array of non-empty strings', () => {
    for (const components of [[], 'Button,Link', ['Button', ''], ['Button', 3]]) {
      expectPhasesError(() => parse(withPhases({ name: 'Core', components })), /^phases\.json: phase Core "components" must be/);
    }
  });

  test('a pattern that is not a non-empty string', () => {
    for (const pattern of ['', ['SettingsPage'], null]) {
      expectPhasesError(() => parse(withPhases({ name: 'Patterns', pattern })), /^phases\.json: phase Patterns /);
    }
  });

  test('two phases with the same name', () => {
    expectPhasesError(
      () => parse(withPhases({ name: 'Core', components: ['Button'] }, { name: 'Core', components: ['Link'] })),
      /^phases\.json: two phases are named Core/,
    );
  });
});

describe('readPhases', () => {
  test('a missing file is a PhasesError that names it', () => {
    const file = join(tmp(), 'regen-phases.json');
    expect(() => readPhases(file)).toThrow(PhasesError);
    expect(() => readPhases(file)).toThrow(`${file}: missing`);
  });

  test('the real file reads by default', () => {
    expect(readPhases().map((p) => p.name)).toContain('Patterns');
    expect(PHASES_FILE).toBe(join(REPO_ROOT, 'tools', 'regen-phases.json'));
  });
});

describe('componentPhases', () => {
  test('keeps component phases in order and skips pattern phases', () => {
    const phases = parse(
      withPhases(
        { name: 'Primitives', components: ['Icon', 'Text'] },
        { name: 'Patterns', pattern: 'SettingsPage' },
        { name: 'Core', components: ['Button', 'Link', 'Input'] },
      ),
    );
    expect(componentPhases(phases)).toEqual([
      ['Primitives', ['Icon', 'Text']],
      ['Core', ['Button', 'Link', 'Input']],
    ]);
  });
});

describe('regen.ps1', () => {
  test('reads its phases from tools/regen-phases.json instead of a literal', () => {
    const script = readFileSync(join(REPO_ROOT, 'regen.ps1'), 'utf8');
    expect(script).toContain('tools\\regen-phases.json');
    expect(script).toContain('ConvertFrom-Json');
    expect(script).toContain('-join ","');
    expect(script).not.toContain('@{ name =');
  });
});
