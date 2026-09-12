#!/usr/bin/env node
/**
 * The gate for `generated/chromatic.json` — the three hosted Storybook URLs job 510 records
 * (site/src/content/docs/process/website-plan.md, "Linking to Storybook").
 *
 * That file is the one artifact in `generated/` that is neither generated nor derivable: a Chromatic
 * project URL exists only once a human has created the project, so it is typed in by hand once and
 * then never again. A typed-in URL is exactly the kind of thing that rots quietly — a wrong slug
 * costs an "Open in Storybook ↗" link per example and nothing announces it, because
 * `apps/website/src/examples.ts` treats an unusable URL as "not published yet" and omits the link
 * rather than failing the build. This is what makes that silent.
 *
 * Two levels, because only one of them works offline:
 *
 *   node tools/chromatic.ts            shape — the three keys, and each value a project URL or ""
 *   node tools/chromatic.ts --fetch    the above, plus every URL is filled in and answers 200
 *
 * `""` means "this package has no Chromatic project yet". It passes the shape check and fails
 * `--fetch`, which is the state the repository is in between job 510 writing this file and the
 * projects actually existing.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readText } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

/** Every path the tool reads. The tests point these at a sandbox. */
export const paths = {
  ROOT: REPO_ROOT,
  URLS: join(REPO_ROOT, 'generated', 'chromatic.json'),
};

/** Raised for a bad `chromatic.json`. */
export class ChromaticError extends Error {}

/**
 * One key per package with a Storybook, using the short names job 510 names — `react`, `lit`, `rn`
 * — not the npm scope. `apps/website/src/examples.ts` reads `react` by that name.
 */
export const PACKAGES: readonly string[] = ['react', 'lit', 'rn'];

/**
 * A Chromatic *project* URL: `https://<slug>.chromatic.com`, no path, no trailing slash.
 *
 * Deliberately not a branch or per-build preview (`https://<branch>--<slug>.chromatic.com`), which
 * is what the CLI prints most loudly and which moves as the branch does — hence the `--` the pattern
 * refuses. The permanent one is the "your project is published at…" line.
 */
const PROJECT_URL = /^https:\/\/(?!.*--)[a-z0-9-]+\.chromatic\.com$/;

/** The three URLs, in `PACKAGES` order, `''` for a package with no project yet. */
export function parse(text: string): Record<string, string> {
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new ChromaticError('generated/chromatic.json is not valid JSON');
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ChromaticError('generated/chromatic.json is not an object of package → URL');
  }
  const entries = data as Record<string, unknown>;

  const extra = Object.keys(entries).filter((key) => !PACKAGES.includes(key));
  if (extra.length > 0) {
    throw new ChromaticError(`generated/chromatic.json has unknown key(s): ${extra.join(', ')} (expected ${PACKAGES.join(', ')})`);
  }

  const urls: Record<string, string> = {};
  for (const pkg of PACKAGES) {
    const value = entries[pkg];
    if (value === undefined) throw new ChromaticError(`generated/chromatic.json has no \`${pkg}\` entry`);
    if (typeof value !== 'string') throw new ChromaticError(`generated/chromatic.json: \`${pkg}\` is not a string`);
    if (value !== '' && !PROJECT_URL.test(value)) {
      throw new ChromaticError(
        `generated/chromatic.json: \`${pkg}\` is not a Chromatic project URL: ${value}\n` +
          '  expected https://<slug>.chromatic.com — the permanent project URL, not a <branch>--<slug> preview',
      );
    }
    urls[pkg] = value;
  }
  return urls;
}

/** Packages whose project has not been created yet. */
export function unpublished(urls: Record<string, string>): string[] {
  return PACKAGES.filter((pkg) => urls[pkg] === '');
}

/**
 * The packages whose URL did not answer 200, with the reason.
 *
 * A GET rather than a HEAD: Chromatic's app URL is a single-page app behind a CDN, and a HEAD is not
 * reliably the same request. The body is not read.
 */
export async function unreachable(urls: Record<string, string>): Promise<string[]> {
  const failures: string[] = [];
  await Promise.all(
    PACKAGES.map(async (pkg) => {
      const url = urls[pkg];
      if (url === undefined || url === '') return;
      try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) failures.push(`${pkg}: ${url} → ${response.status} ${response.statusText}`);
      } catch (e) {
        failures.push(`${pkg}: ${url} → ${e instanceof Error ? e.message : String(e)}`);
      }
    }),
  );
  return failures.sort();
}

function relToRoot(file: string): string {
  return relative(paths.ROOT, file).replaceAll(sep, '/') || '.';
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  let doFetch = false;
  for (const arg of argv) {
    if (arg === '-h' || arg === '--help') {
      process.stdout.write(
        'usage: chromatic.ts [--fetch]\n\n' +
          'Checks generated/chromatic.json holds a Chromatic project URL for react, lit and rn.\n' +
          '--fetch also requires every URL to be filled in and to answer 200 (needs network).\n',
      );
      return 0;
    }
    if (arg === '--fetch') {
      doFetch = true;
      continue;
    }
    process.stderr.write(`chromatic.ts: error: unrecognized arguments: ${arg}\n`);
    return 2;
  }

  let urls: Record<string, string>;
  try {
    if (!existsSync(paths.URLS)) {
      throw new ChromaticError(`${relToRoot(paths.URLS)} missing — see jobs/510-chromatic-storybooks.md`);
    }
    urls = parse(readText(paths.URLS));
  } catch (e) {
    if (!(e instanceof ChromaticError)) throw e;
    process.stderr.write(`✖ ${e.message}\n`);
    return 1;
  }

  const pending = unpublished(urls);
  if (!doFetch) {
    const note = pending.length > 0 ? ` (${pending.join(', ')} not published yet)` : '';
    process.stdout.write(`✔ chromatic: ${PACKAGES.length - pending.length} of ${PACKAGES.length} Storybooks published${note}\n`);
    return 0;
  }

  if (pending.length > 0) {
    process.stderr.write(
      `✖ ${relToRoot(paths.URLS)}: no Chromatic project URL for ${pending.join(', ')}\n` +
        '  create the project(s) and record the URL — jobs/510-chromatic-storybooks.md, "Log"\n',
    );
    return 1;
  }

  const failures = await unreachable(urls);
  if (failures.length > 0) {
    process.stderr.write(
      `✖ ${relToRoot(paths.URLS)}: ${failures.length} of ${PACKAGES.length} Storybooks did not answer 200:\n` +
        failures.map((failure) => `  ${failure}\n`).join(''),
    );
    return 1;
  }

  process.stdout.write(`✔ chromatic: all ${PACKAGES.length} Storybooks answered 200\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = await main();
