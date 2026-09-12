/** tools/chromatic.ts — the gate for generated/chromatic.json, the three hand-typed Storybook URLs. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { parse as parseYaml } from 'yaml';

import * as chromatic from '../chromatic.ts';
import { REPO_ROOT } from '../lib/root.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...chromatic.paths };
afterEach(() => {
  Object.assign(chromatic.paths, saved);
});

/** The shape job 510 writes: one key per package, `''` until the project exists. */
const PUBLISHED = { react: 'https://abc123.chromatic.com', lit: 'https://def456.chromatic.com', rn: 'https://ghi789.chromatic.com' };

let root = '';

beforeEach(() => {
  root = tmp();
  Object.assign(chromatic.paths, { ROOT: root, URLS: join(root, 'generated', 'chromatic.json') });
});

function writeUrls(value: unknown): void {
  write(chromatic.paths.URLS, typeof value === 'string' ? value : JSON.stringify(value));
}

/** A `fetch` that answers with the status each URL is mapped to, and throws for anything unmapped. */
function stubFetch(statuses: Record<string, number>): void {
  vi.stubGlobal('fetch', (input: string | URL) => {
    const url = String(input);
    const status = statuses[url];
    if (status === undefined) return Promise.reject(new Error('getaddrinfo ENOTFOUND'));
    return Promise.resolve({ ok: status >= 200 && status < 300, status, statusText: String(status) } as Response);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parsing', () => {
  test('accepts the three project URLs', () => {
    expect(chromatic.parse(JSON.stringify(PUBLISHED))).toEqual(PUBLISHED);
  });

  test('accepts an empty string — the state before a project has been created', () => {
    expect(chromatic.parse('{"react":"","lit":"","rn":""}')).toEqual({ react: '', lit: '', rn: '' });
    expect(chromatic.unpublished({ react: 'https://a.chromatic.com', lit: '', rn: '' })).toEqual(['lit', 'rn']);
  });

  test('rejects a file the website could not read', () => {
    expect(() => chromatic.parse('not json')).toThrow(chromatic.ChromaticError);
    expect(() => chromatic.parse('[]')).toThrow(/not an object/);
    expect(() => chromatic.parse('{"react":"","lit":""}')).toThrow(/no `rn` entry/);
    expect(() => chromatic.parse('{"react":null,"lit":"","rn":""}')).toThrow(/`react` is not a string/);
    expect(() => chromatic.parse('{"react":"","lit":"","rn":"","web":""}')).toThrow(/unknown key\(s\): web/);
  });

  test('rejects anything that is not the permanent project URL', () => {
    // A branch preview: it moves as the branch does, which is the thing this file must not hold.
    expect(() => chromatic.parse('{"react":"https://main--abc.chromatic.com","lit":"","rn":""}')).toThrow(/preview/);
    expect(() => chromatic.parse('{"react":"https://abc.chromatic.com/","lit":"","rn":""}')).toThrow(/not a Chromatic project URL/);
    expect(() => chromatic.parse('{"react":"https://abc.chromatic.com/?path=/story/x","lit":"","rn":""}')).toThrow(/project URL/);
    expect(() => chromatic.parse('{"react":"http://abc.chromatic.com","lit":"","rn":""}')).toThrow(/project URL/);
    expect(() => chromatic.parse('{"react":"https://example.com","lit":"","rn":""}')).toThrow(/project URL/);
  });
});

describe('the gate', () => {
  test('passes the shape check with nothing published, and says so', async () => {
    writeUrls({ react: '', lit: '', rn: '' });
    expect(await chromatic.main([])).toBe(0);
    expect(std.out()).toContain('0 of 3');
    expect(std.out()).toContain('react, lit, rn not published yet');
  });

  test('passes the shape check when all three are published', async () => {
    writeUrls(PUBLISHED);
    expect(await chromatic.main([])).toBe(0);
    expect(std.out()).toContain('3 of 3');
  });

  test('fails when the file has not been written at all', async () => {
    expect(await chromatic.main([])).toBe(1);
    expect(std.err()).toContain('generated/chromatic.json missing');
  });

  test('--fetch fails, and names the packages, while a project is still missing', async () => {
    writeUrls({ ...PUBLISHED, rn: '' });
    expect(await chromatic.main(['--fetch'])).toBe(1);
    expect(std.err()).toContain('no Chromatic project URL for rn');
  });

  test('--fetch passes when every URL answers 200', async () => {
    writeUrls(PUBLISHED);
    stubFetch(Object.fromEntries(Object.values(PUBLISHED).map((url) => [url, 200])));
    expect(await chromatic.main(['--fetch'])).toBe(0);
    expect(std.out()).toContain('all 3 Storybooks answered 200');
  });

  test('--fetch fails on a URL that 404s and on one that does not resolve', async () => {
    writeUrls(PUBLISHED);
    stubFetch({ [PUBLISHED.react]: 200, [PUBLISHED.lit]: 404 });
    expect(await chromatic.main(['--fetch'])).toBe(1);
    expect(std.err()).toContain('2 of 3');
    expect(std.err()).toContain('lit: https://def456.chromatic.com → 404');
    expect(std.err()).toContain('ENOTFOUND');
  });

  test('--help explains itself and exits 0; an unknown flag is a usage error', async () => {
    expect(await chromatic.main(['--help'])).toBe(0);
    expect(std.out()).toContain('usage: chromatic.ts');
    expect(await chromatic.main(['--nope'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments');
  });
});

/**
 * The `changes` job in chromatic.yml, run for real against fixture file lists.
 *
 * Job 510's gate — "a PR touching only `packages/react` triggers only the react Chromatic job" — is
 * otherwise only observable on a hosted repository, and the logic that answers it is fifteen lines of
 * shell inside a YAML string, which nothing else in this repository would ever execute. This runs the
 * step's own `run:` block with the two lines that need a real repository (the base-sha probe and the
 * `git diff`) swapped for fixtures, so the rest is the script that actually ships.
 */
const WORKFLOW = ['.github/workflows/chromatic.yml', '.github/workflows-pending/chromatic.yml']
  .map((rel) => join(REPO_ROOT, rel))
  .find(existsSync);

/** The suite runs on Windows too, where `bash` is git-bash and not guaranteed to be on PATH. */
const hasBash = (() => {
  try {
    execFileSync('bash', ['-c', 'exit 0'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

describe.skipIf(!hasBash || WORKFLOW === undefined)('chromatic.yml’s changes filter', () => {
  /** The step's real script, with `git` replaced by a file list in $FIXTURE. */
  function filterScript(): string {
    const workflow = parseYaml(readFileSync(WORKFLOW as string, 'utf8')) as {
      jobs: { changes: { steps: { id?: string; run?: string }[] } };
    };
    const run = workflow.jobs.changes.steps.find((step) => step.id === 'filter')?.run;
    expect(run, 'chromatic.yml has no `filter` step').toBeTypeOf('string');
    const harness = (run as string)
      .replace('! git cat-file -e "$BASE^{commit}" 2>/dev/null', 'false')
      .replace('files=$(git diff --name-only "$BASE...HEAD")', 'files=$(cat "$FIXTURE")');
    expect(harness, 'the two git lines the harness replaces have moved').not.toContain('git ');
    return harness;
  }

  /** Runs the filter over `files` and returns the three job outputs. */
  function run(files: string[], base = 'deadbeef'): Record<string, boolean> {
    const dir = tmp();
    const script = write(join(dir, 'filter.sh'), filterScript());
    const fixture = write(join(dir, 'files.txt'), files.join('\n') + '\n');
    const output = write(join(dir, 'github_output'), '');
    execFileSync('bash', [script], {
      env: { ...process.env, BASE: base, FIXTURE: fixture, GITHUB_OUTPUT: output },
      stdio: 'ignore',
    });
    return Object.fromEntries(
      readFileSync(output, 'utf8').trim().split('\n').map((line) => {
        const [key, value] = line.split('=');
        return [key, value === 'true'];
      }),
    );
  }

  test('a change to one package publishes only that package', () => {
    expect(run(['packages/react/src/Button.stories.tsx'])).toEqual({ react: true, lit: false, rn: false });
    expect(run(['packages/lit/src/Tabs.ts'])).toEqual({ react: false, lit: true, rn: false });
    expect(run(['packages/rn/src/Alert.tsx'])).toEqual({ react: false, lit: false, rn: true });
    expect(run(['packages/react/src/a.tsx', 'packages/rn/src/b.tsx'])).toEqual({ react: true, lit: false, rn: true });
  });

  test('a shared input publishes all three', () => {
    // Every preview imports the token CSS, so anything that changes it changes all three Storybooks.
    for (const file of ['tokens/themes/warm-sleek/base.json', 'tools/theme.ts', 'packages/tokens/package.json']) {
      expect(run([file]), file).toEqual({ react: true, lit: true, rn: true });
    }
    expect(run(['storybook/shared/mode.ts'])).toEqual({ react: true, lit: true, rn: true });
    expect(run(['pnpm-lock.yaml'])).toEqual({ react: true, lit: true, rn: true });
    expect(run(['.github/workflows/chromatic.yml'])).toEqual({ react: true, lit: true, rn: true });
  });

  test('a change to nothing it cares about publishes nothing', () => {
    expect(run(['site/src/content/docs/process/publishing.md'])).toEqual({ react: false, lit: false, rn: false });
    // The patterns are anchored: a path that merely contains a package's name is not that package.
    expect(run(['apps/website/src/packages/react-notes.md'])).toEqual({ react: false, lit: false, rn: false });
  });

  test('no usable base publishes all three rather than silently skipping one', () => {
    expect(run(['packages/react/src/a.tsx'], '')).toEqual({ react: true, lit: true, rn: true });
    expect(run(['packages/react/src/a.tsx'], '0'.repeat(40))).toEqual({ react: true, lit: true, rn: true });
  });
});
