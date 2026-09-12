/** tools/check_deps.ts — the generated packages may not grow runtime dependencies.
 *  (Port of tests/test_check_deps.py.) */
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as cd from '../check_deps.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...cd.paths };
afterEach(() => {
  Object.assign(cd.paths, saved);
});

type Dict = Record<string, unknown>;
const manifest = (fields: Dict = {}): Dict => ({ name: '@design-schema/x', version: '0.0.1', ...fields });

describe('checkPackage', () => {
  test('the allowed set passes for every package', () => {
    expect(cd.checkPackage('react', manifest({ peerDependencies: { react: '>=18', 'react-dom': '>=18' } }))).toEqual([]);
    expect(cd.checkPackage('lit', manifest({ dependencies: { lit: '^3.2.0' }, devDependencies: { vitest: '^3' } }))).toEqual([]);
    expect(cd.checkPackage('rn', manifest({ dependencies: { 'react-native-svg': '15.15.5' }, peerDependencies: { react: '>=18', 'react-native': '>=0.74' } }))).toEqual([]);
    expect(cd.checkPackage('tokens', manifest())).toEqual([]);
  });

  test('the tokens package is allowed everywhere but tokens', () => {
    for (const name of ['react', 'lit', 'rn']) {
      expect(cd.checkPackage(name, manifest({ dependencies: { '@design-schema/tokens': 'workspace:*' } }))).toEqual([]);
    }
    expect(cd.checkPackage('tokens', manifest({ dependencies: { '@design-schema/tokens': 'workspace:*' } })).length).toBe(1);
  });

  test('react-native-svg is allowed only in rn', () => {
    expect(cd.checkPackage('rn', manifest({ dependencies: { 'react-native-svg': '15.15.5' } }))).toEqual([]);
    expect(cd.checkPackage('react', manifest({ dependencies: { 'react-native-svg': '15.15.5' } }))).toEqual([
      "packages/react: dependencies has 'react-native-svg', which is not an allowed runtime dependency (allowed: @design-schema/tokens, react, react-dom)",
    ]);
  });

  test.each(cd.RUNTIME_FIELDS)('the %s field is checked', (field) => {
    const findings = cd.checkPackage('lit', manifest({ [field]: { lodash: '^4' } }));
    expect(findings.length).toBe(1);
    expect(findings[0]).toContain(`${field} has 'lodash'`);
  });

  test('devDependencies are free', () => {
    expect(cd.checkPackage('rn', manifest({ devDependencies: { jest: '^29', lodash: '^4' } }))).toEqual([]);
  });

  test('findings are sorted and name the package', () => {
    const findings = cd.checkPackage('react', manifest({ dependencies: { zod: '^3', axios: '^1' } }));
    expect(findings.map((f) => f.split("'")[1])).toEqual(['axios', 'zod']);
    expect(findings.every((f) => f.startsWith('packages/react: '))).toBe(true);
  });

  test('unknown packages are not checked', () => {
    expect(cd.checkPackage('site', manifest({ dependencies: { astro: '^5' } }))).toEqual([]);
  });
});

describe('checkAll', () => {
  let packages = '';

  beforeEach(() => {
    packages = tmp();
    const pkg = (name: string, fields: Dict): void => void write(join(packages, name, 'package.json'), JSON.stringify(manifest(fields)));
    pkg('react', { peerDependencies: { react: '>=18' } });
    pkg('lit', { dependencies: { lit: '^3' } });
    pkg('rn', { dependencies: { 'react-native-svg': '15.15.5', lodash: '^4' } });
    pkg('site', { dependencies: { astro: '^5' } });
  });

  test('walks only the generated packages', () => {
    const findings = cd.checkAll(packages);
    expect(findings.length).toBe(1);
    expect(findings[0]).toContain("packages/rn: dependencies has 'lodash'");
  });

  test('only narrows to one package', () => {
    expect(cd.checkAll(packages, 'rn').length).toBe(1);
    expect(cd.checkAll(packages, 'lit')).toEqual([]);
  });

  test('a missing package is skipped', () => {
    expect(cd.checkAll(join(packages, 'nothing-here'))).toEqual([]);
  });

  test('main reports and exits non-zero on a finding', () => {
    cd.paths.PACKAGES = packages;
    expect(cd.main([])).toBe(1);
    expect(std.out()).toContain("✖ packages/rn: dependencies has 'lodash'");
    expect(std.out()).toContain('1 finding(s)');
    expect(cd.main(['--platform', 'web'])).toBe(0);
  });
});

describe('the flags', () => {
  test('an unknown platform is an argparse error', () => {
    expect(cd.main(['--platform', 'swiftui'])).toBe(2);
    expect(std.err()).toContain("argument --platform: invalid choice: 'swiftui'");
  });

  test('--help prints the usage and exits 0', () => {
    expect(cd.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: check_deps.ts');
  });
});

describe('the repository', () => {
  test('the real packages pass', () => {
    expect(cd.checkAll()).toEqual([]);
  });
});
