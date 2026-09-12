/** tools/check_modules.ts — the gate over the hand-written modules an extension declares. The parser half
 *  (merging site/src/content/docs/extensions/*.md and writing the stubs) is tools/parse.ts, tested in
 *  extensions.test.ts. Port of tests/test_extensions.py's gate half. See process/extending-components.md. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import * as cm from '../check_modules.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useTmp, write } from './fixtures.ts';

const tmp = useTmp();

const COMPONENTS: cm.Dict[] = [
  {
    component: { name: 'Widget' },
    extensions: [
      {
        name: 'analytics',
        modules: { trackPress: { path: 'custom/analytics.ts', signature: '(name: string) => void', wire: 'x', platforms: ['web', 'rn'] } },
      },
    ],
  },
];

describe('export detection', () => {
  test.each([
    ['export function trackPress(n: string) {}', true],
    ['export const trackPress = (n: string) => {};', true],
    ['export async function trackPress() {}', true],
    ['function trackPress() {}\nexport { trackPress };', true],
    ['function tp() {}\nexport { tp as trackPress };', true],
    ['export function trackPressed() {}', false],
    ['function trackPress() {}', false],
  ] as [string, boolean][])('%s', (src, ok) => {
    expect(cm.exportsName(src, 'trackPress')).toBe(ok);
  });
});

describe('declaredModules', () => {
  test('filters by platform', () => {
    expect(cm.declaredModules(COMPONENTS, 'web').map((m) => m.name)).toEqual(['trackPress']);
    expect(cm.declaredModules(COMPONENTS, 'lit')).toEqual([]);
  });
});

describe('run', () => {
  test('a missing file and a missing export are findings', () => {
    const root = tmp();
    const pk = join(root, 'packages');
    const opts = { typecheck: false, components: COMPONENTS, packages: pk, generated: join(root, 'g') };
    const target = join(pk, 'react', 'src', 'custom', 'analytics.ts');
    expect(cm.run('web', opts)).toEqual([
      "Widget.analytics: module 'trackPress' expects packages/react/src/custom/analytics.ts, which does not exist",
    ]);
    write(target, 'export const other = 1;');
    expect(cm.run('web', opts)).toEqual([
      "Widget.analytics: packages/react/src/custom/analytics.ts does not export 'trackPress'",
    ]);
    write(target, 'export function trackPress(n: string) {}');
    expect(cm.run('web', opts)).toEqual([]);
  });

  test('nothing declared means nothing to check', () => {
    const root = tmp();
    expect(cm.run('lit', { components: COMPONENTS, packages: root, generated: root })).toEqual([]);
  });

  test('a missing components.json is the one finding', () => {
    const root = tmp();
    expect(cm.run('web', { packages: root, generated: join(root, 'nothing') })).toEqual([
      'generated/components.json missing — run tools/parse.ts',
    ]);
  });
});

describe('the check program', () => {
  test('pairs each real export with its stub', () => {
    const root = tmp();
    const checkDir = join(root, 'packages', 'react', '.modules-check');
    const stubs = join(root, 'generated', 'modules', 'web');
    const prog = cm.checkProgram(cm.declaredModules(COMPONENTS, 'web'), 'web', checkDir, stubs);
    expect(prog).toContain("import * as real0 from '../src/custom/analytics';");
    expect(prog).toContain("import type * as stub0 from '../../../generated/modules/web/custom/analytics';");
    expect(prog).toContain('const check0: typeof stub0.trackPress = real0.trackPress;');
  });

  test('react native pulls in its globals', () => {
    const root = tmp();
    const checkDir = join(root, 'packages', 'rn', '.modules-check');
    const prog = cm.checkProgram(cm.declaredModules(COMPONENTS, 'rn'), 'rn', checkDir, join(root, 'generated', 'modules', 'rn'));
    expect(prog.split('\n')[1]).toBe("import 'react-native';");
  });

  test('relative paths always start with a dot', () => {
    const root = tmp();
    expect(cm.relpath(join(root, 'a', 'b'), join(root, 'a'))).toBe('./b');
    expect(cm.relpath(join(root, 'x'), join(root, 'a', 'b'))).toBe('../../x');
  });

  test('the tsconfig widens rootDir to the repo root so the stubs resolve', () => {
    expect(cm.tsconfig()).toEqual({
      extends: '../tsconfig.json',
      compilerOptions: { noEmit: true, composite: false, incremental: false, rootDir: '../..' },
      include: ['check.ts'],
    });
  });
});

describe('the flags', () => {
  test('--platform is required', () => {
    expect(() => cm.parseArgs([])).toThrow('the following arguments are required: --platform');
  });

  test('--no-typecheck and a platform choice', () => {
    expect(cm.parseArgs(['--platform', 'rn', '--no-typecheck'])).toEqual({ platform: 'rn', noTypecheck: true });
    expect(() => cm.parseArgs(['--platform', 'swiftui'])).toThrow("invalid choice: 'swiftui'");
  });
});

describe('the repository', () => {
  /** The shipped example: Button.analytics.md and the three custom/analytics.ts modules. */
  test.each(['react', 'lit', 'rn'])('the %s example module exports trackPress', (pkg) => {
    const src = readFileSync(join(REPO_ROOT, 'packages', pkg, 'src', 'custom', 'analytics.ts'), 'utf8');
    expect(cm.exportsName(src, 'trackPress')).toBe(true);
  });

  test('the example extension declares one module per platform', () => {
    const cj = join(REPO_ROOT, 'generated', 'components.json');
    if (!existsSync(cj)) return; // run tools/parse.ts first
    const entries = JSON.parse(readFileSync(cj, 'utf8')) as cm.Dict[];
    for (const platform of ['web', 'lit', 'rn']) {
      expect(cm.declaredModules(entries, platform).map((m) => m.name)).toContain('trackPress');
    }
  });
});
