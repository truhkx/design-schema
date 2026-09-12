#!/usr/bin/env node
/**
 * The deploy gate for apps/website: every route the site promises is a real page in the build
 * output (site/src/content/docs/process/website-plan.md, job 509 — "the deployed site serves `/`,
 * `/about`, and all 51 `/docs/components/<slug>` routes").
 *
 * A static build's characteristic failure is quiet: `getStaticPaths` returns one path fewer, or a
 * page is renamed, and `astro build` still exits 0 — the route is simply not in `dist/` and the
 * deploy ships a 404 that nothing announces. This reads the route list from the same place the site
 * does (generated/nav.json, which tools/site_nav.ts writes from the schema) and checks the file is
 * there for each one, so the count is never written down twice and a 52nd component is a route this
 * gate expects the moment the schema has it.
 *
 * It checks the page has content, too, not merely that the file exists: an empty or near-empty
 * index.html is the other way a build can succeed and the page still be missing.
 *
 * Usage:  node tools/site_routes.ts [dist]        (default: apps/website/dist)
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  NAV: join(REPO_ROOT, 'generated', 'nav.json'),
  DIST: join(REPO_ROOT, 'apps', 'website', 'dist'),
};

/** Raised for a bad input (a missing nav.json, a dist that was never built). */
export class RoutesError extends Error {}

/**
 * The routes that are not in the nav data: the home page, the content page the header links to, the
 * docs landing page, and the docs sections — Foundations, Patterns, and (job 523) the naming demo.
 *
 * `apps/website/src/nav.ts` holds the same section routes for the same reason — nav.json describes
 * the 51 components and nothing else — so these are the hand-written half, and they are hand-written
 * in exactly two places, both of which say so.
 */
export const FIXED_ROUTES: readonly string[] = ['/', '/about', '/docs', '/docs/foundations', '/docs/patterns', '/docs/naming-demo'];

/** One component page per component in the generated nav, in the generator's own phase order. */
export function componentRoutes(navText: string): string[] {
  let nav: { docs?: { components?: { slug?: string }[] }[] };
  try {
    nav = JSON.parse(navText) as typeof nav;
  } catch {
    throw new RoutesError('generated/nav.json is not valid JSON — re-run `pnpm nav`');
  }
  if (!Array.isArray(nav.docs)) throw new RoutesError('generated/nav.json has no `docs` groups — re-run `pnpm nav`');

  const routes: string[] = [];
  for (const group of nav.docs) {
    for (const component of group.components ?? []) {
      if (!component.slug) throw new RoutesError('generated/nav.json has a component with no slug — re-run `pnpm nav`');
      routes.push(`/docs/components/${component.slug}`);
    }
  }
  if (routes.length === 0) throw new RoutesError('generated/nav.json lists no components — re-run `pnpm nav`');
  return routes;
}

/** Every route the site promises. */
export function expectedRoutes(navText: string): string[] {
  return [...FIXED_ROUTES, ...componentRoutes(navText)];
}

/**
 * Where a route's page lives in Astro's default (directory) build output: `/` is `index.html`,
 * `/about` is `about/index.html`.
 */
export function pageFor(dist: string, route: string): string {
  const segments = route.split('/').filter(Boolean);
  return join(dist, ...segments, 'index.html');
}

/** A page that exists but holds nothing is as broken as one that is absent. */
const MIN_PAGE_BYTES = 512;

/** Routes with no page, or with a page too small to be one. */
export function missingRoutes(dist: string, routes: readonly string[]): string[] {
  return routes.filter((route) => {
    const page = pageFor(dist, route);
    if (!existsSync(page)) return true;
    return statSync(page).size < MIN_PAGE_BYTES;
  });
}

function relToRoot(file: string): string {
  return relative(paths.ROOT, file).replaceAll(sep, '/') || '.';
}

export function main(argv: string[] = process.argv.slice(2)): number {
  let dist = paths.DIST;
  let seenDist = false;
  for (const arg of argv) {
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(
        'usage: site_routes.ts [dist]\n\n' +
          "Checks apps/website's build output has a page for every route the site promises:\n" +
          `${FIXED_ROUTES.join(', ')}, and /docs/components/<slug> for every component in generated/nav.json.\n`,
      );
      return 0;
    }
    if (arg.startsWith('-')) {
      process.stderr.write(`site_routes.ts: error: unrecognized arguments: ${arg}\n`);
      return 2;
    }
    if (seenDist) {
      process.stderr.write(`site_routes.ts: error: more than one dist directory: ${arg}\n`);
      return 2;
    }
    dist = resolve(arg);
    seenDist = true;
  }

  let routes: string[];
  try {
    if (!existsSync(paths.NAV)) throw new RoutesError(`${relToRoot(paths.NAV)} missing — run \`pnpm nav\` first`);
    if (!existsSync(dist)) {
      throw new RoutesError(`${relToRoot(dist)} missing — run \`pnpm --filter website build\` first`);
    }
    routes = expectedRoutes(readText(paths.NAV));
  } catch (e) {
    if (!(e instanceof RoutesError)) throw e;
    process.stderr.write(`✖ ${e.message}\n`);
    return 1;
  }

  const missing = missingRoutes(dist, routes);
  if (missing.length > 0) {
    process.stderr.write(
      `✖ ${relToRoot(dist)}: ${missing.length} of ${routes.length} routes have no page:\n` +
        missing.map((route) => `  ${route} → ${relToRoot(pageFor(dist, route))}\n`).join(''),
    );
    return 1;
  }

  const components = routes.length - FIXED_ROUTES.length;
  process.stdout.write(`✔ routes: ${routes.length} pages in ${relToRoot(dist)} (${components} components)\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
