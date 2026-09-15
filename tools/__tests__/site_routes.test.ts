/** tools/site_routes.ts — the deploy gate: every route the site promises has a page in dist/. */
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as routes from '../site_routes.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...routes.paths };
afterEach(() => {
  Object.assign(routes.paths, saved);
});

/** A nav.json with the shape tools/site_nav.ts writes: two phases, three components. */
const NAV = JSON.stringify({
  top: [{ label: 'Docs', href: '/docs' }],
  docs: [
    { phase: 'Primitives', components: [{ name: 'Icon', slug: 'icon' }, { name: 'Text', slug: 'text' }] },
    { phase: 'Core', components: [{ name: 'Button', slug: 'button' }] },
  ],
});

/** Big enough to clear the "a page that holds nothing is as broken as one that is absent" floor. */
const PAGE = `<!doctype html><html><body>${'x'.repeat(600)}</body></html>`;

let root = '';
let dist = '';

beforeEach(() => {
  root = tmp();
  dist = join(root, 'apps', 'website', 'dist');
  Object.assign(routes.paths, { ROOT: root, NAV: join(root, 'generated', 'nav.json'), DIST: dist });
  write(routes.paths.NAV, NAV);
});

/** Writes a full, passing build output. Individual tests break one page at a time from here. */
function buildAll(): void {
  for (const route of routes.expectedRoutes(NAV)) write(routes.pageFor(dist, route), PAGE);
}

describe('the route list', () => {
  test('is the fixed pages plus one per component in the generated nav', () => {
    expect(routes.expectedRoutes(NAV)).toEqual([
      '/',
      '/about',
      '/docs',
      '/docs/foundations',
      '/docs/patterns',
      '/docs/naming-demo',
      '/docs/components/icon',
      '/docs/components/text',
      '/docs/components/button',
    ]);
  });

  test('keeps the generator’s phase order, so a failure reads in sidebar order', () => {
    expect(routes.componentRoutes(NAV)).toEqual([
      '/docs/components/icon',
      '/docs/components/text',
      '/docs/components/button',
    ]);
  });

  test('rejects a nav.json the site could not have been built from', () => {
    expect(() => routes.componentRoutes('not json')).toThrow(routes.RoutesError);
    expect(() => routes.componentRoutes('{"top":[]}')).toThrow(/no `docs` groups/);
    expect(() => routes.componentRoutes('{"docs":[]}')).toThrow(/lists no components/);
    expect(() => routes.componentRoutes('{"docs":[{"components":[{}]}]}')).toThrow(/no slug/);
  });

  test('maps a route to Astro’s directory output', () => {
    expect(routes.pageFor(dist, '/')).toBe(join(dist, 'index.html'));
    expect(routes.pageFor(dist, '/about')).toBe(join(dist, 'about', 'index.html'));
    expect(routes.pageFor(dist, '/docs/components/button')).toBe(join(dist, 'docs', 'components', 'button', 'index.html'));
  });
});

describe('the gate', () => {
  test('passes a complete build and says what it counted', () => {
    buildAll();
    expect(routes.main([dist])).toBe(0);
    expect(std.out()).toContain('9 pages');
    expect(std.out()).toContain('(3 components)');
  });

  test('defaults to apps/website/dist', () => {
    buildAll();
    expect(routes.main([])).toBe(0);
  });

  test('fails, and names the route, when a component page is missing', () => {
    buildAll();
    write(routes.pageFor(dist, '/docs/components/text'), ''); // truncated, not deleted
    expect(routes.main([dist])).toBe(1);
    expect(std.err()).toContain('/docs/components/text');
    expect(std.err()).toContain('1 of 9 routes');
  });

  test('fails when /about was never built', () => {
    buildAll();
    // The whole point of the gate: `astro build` exits 0 with the page simply absent.
    write(routes.pageFor(dist, '/about'), PAGE.slice(0, 10));
    expect(routes.main([dist])).toBe(1);
    expect(std.err()).toContain('/about');
  });

  test('fails when there is no build output at all', () => {
    expect(routes.main([join(root, 'nope')])).toBe(1);
    expect(std.err()).toContain('run `pnpm --filter website build`');
  });

  test('fails when the nav data has not been generated', () => {
    buildAll();
    Object.assign(routes.paths, { NAV: join(root, 'generated', 'gone.json') });
    expect(routes.main([dist])).toBe(1);
    expect(std.err()).toContain('run `pnpm nav`');
  });

  test('--help explains itself and exits 0; an unknown flag is a usage error', () => {
    expect(routes.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: site_routes.ts');
    expect(routes.main(['--nope'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments');
  });
});
