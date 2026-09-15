/** schema/platforms.ts — the one platform table: the list, the package folders every tool resolves through
 *  `sourceDir` and `demoDir`, and the Lit `tag` rule componentDef enforces on top of it. */
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { componentDef, PLATFORMS as COMPONENT_PLATFORMS, platformId as componentPlatformId } from '../../schema/component.ts';
import { demoDir, isPlatform, isTsPlatform, PACKAGE_DIR, PLATFORM_LABEL, PLATFORMS, platformId, SOURCE_EXT, sourceDir, TS_PLATFORMS } from '../../schema/platforms.ts';
import type { Dict } from '../parse.ts';
import { component } from './fixtures.ts';

const ROOT = join('repo', 'root');

describe('the table', () => {
  test('four platforms, and schema/component.ts re-exports the same list and enum', () => {
    expect(PLATFORMS).toEqual(['web', 'lit', 'rn', 'swiftui']);
    expect(COMPONENT_PLATFORMS).toBe(PLATFORMS);
    expect(componentPlatformId).toBe(platformId);
    expect(platformId.safeParse('compose').success).toBe(false);
  });

  test('every platform has a label, a package folder and a source extension, and nothing else does', () => {
    for (const table of [PLATFORM_LABEL, PACKAGE_DIR, SOURCE_EXT]) expect(Object.keys(table)).toEqual([...PLATFORMS]);
  });

  test('the TypeScript platforms are the table minus the Swift package', () => {
    expect(TS_PLATFORMS).toEqual(['web', 'lit', 'rn']);
    expect(PLATFORMS.filter(isTsPlatform)).toEqual([...TS_PLATFORMS]);
    expect(isPlatform('swiftui')).toBe(true);
    expect(isPlatform('compose')).toBe(false);
  });
});

describe('sourceDir', () => {
  test('a TypeScript package keeps its sources in src/, under its package folder', () => {
    expect(sourceDir(ROOT, 'web')).toBe(join(ROOT, 'packages', 'react', 'src'));
    expect(sourceDir(ROOT, 'lit')).toBe(join(ROOT, 'packages', 'lit', 'src'));
    expect(sourceDir(ROOT, 'rn')).toBe(join(ROOT, 'packages', 'rn', 'src'));
  });

  test("the Swift package uses SwiftPM's layout", () => {
    expect(sourceDir(ROOT, 'swiftui')).toBe(join(ROOT, 'packages', 'swiftui', 'Sources', 'DesignSchema'));
  });

  test('an unknown platform throws instead of naming packages/undefined', () => {
    expect(() => sourceDir(ROOT, 'compose')).toThrow("unknown platform 'compose' (choose from web, lit, rn, swiftui)");
  });
});

describe('demoDir', () => {
  test('a TypeScript package keeps its pattern pages in demo/', () => {
    expect(demoDir(ROOT, 'web')).toBe(join(ROOT, 'packages', 'react', 'demo'));
    expect(demoDir(ROOT, 'lit')).toBe(join(ROOT, 'packages', 'lit', 'demo'));
    expect(demoDir(ROOT, 'rn')).toBe(join(ROOT, 'packages', 'rn', 'demo'));
  });

  test('the Swift package has none', () => {
    expect(demoDir(ROOT, 'swiftui')).toBeNull();
  });

  test('an unknown platform throws', () => {
    expect(() => demoDir(ROOT, 'flutter')).toThrow("unknown platform 'flutter'");
  });
});

describe('the Lit tag check', () => {
  const TAG_MESSAGE = "platforms.lit needs a 'tag' (the custom element name) unless it is supported: false";

  function withLit(lit: Dict): Dict {
    const c = component();
    c.platforms.lit = lit;
    c.events.onPress.platforms.lit = 'press';
    return c;
  }

  const issues = (c: Dict): { path: PropertyKey[]; message: string }[] => {
    const r = componentDef.safeParse(c);
    return r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
  };

  test('a supported Lit mapping without a tag is rejected at platforms.lit.tag', () => {
    expect(issues(withLit({ element: 'button' }))).toEqual([{ path: ['platforms', 'lit', 'tag'], message: TAG_MESSAGE }]);
    expect(issues(withLit({ supported: true }))).toEqual([{ path: ['platforms', 'lit', 'tag'], message: TAG_MESSAGE }]);
  });

  test('a Lit mapping with a tag passes', () => {
    expect(issues(withLit({ tag: 'ds-button' }))).toEqual([]);
  });

  test('supported: false needs no tag', () => {
    const c = component();
    c.platforms.lit = { supported: false, notes: 'Not built for Lit.' };
    expect(issues(c)).toEqual([]);
  });

  test('a component with no Lit mapping needs no tag', () => {
    expect(issues(component())).toEqual([]);
  });
});
