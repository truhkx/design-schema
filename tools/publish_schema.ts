#!/usr/bin/env node
/**
 * Copy the schema package into the public repository's working folder.
 *
 *   node --import tsx tools/publish_schema.ts                 sync into ../design-schema-public
 *   node --import tsx tools/publish_schema.ts --dest <dir>    sync somewhere else
 *   node --import tsx tools/publish_schema.ts --check         exit 1 when the public copy is stale
 *
 * The public repo (git@github.com:truhkx/design-schema.git) carries only schema/*.ts, the derived
 * schema/*.schema.json and LICENSE; its own package.json, tsconfig.json, README.md and allowlist .gitignore live
 * there and are never overwritten. A schema file that imports anything but a sibling, `zod` or a `node:` module
 * would not run outside this repo, so the sync refuses it. Committing and pushing stay manual.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REPO_ROOT } from './lib/root.ts';

export const DEFAULT_DEST: string = resolve(REPO_ROOT, '..', 'design-schema-public');

/** The published files, relative to the repo root: every schema/*.ts and schema/*.schema.json, plus LICENSE. */
export function publishedFiles(root: string): string[] {
  const schema = readdirSync(join(root, 'schema'))
    .filter((name) => name.endsWith('.ts') || name.endsWith('.schema.json'))
    .sort()
    .map((name) => `schema/${name}`);
  return [...schema, 'LICENSE'];
}

/** Module specifiers in `source` that would break outside this repo: anything but './x', 'zod' or 'node:x'. */
export function foreignImports(source: string): string[] {
  const specifiers = [...source.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map((m) => m[1] as string);
  return specifiers.filter((s) => !(s.startsWith('./') || s === 'zod' || s.startsWith('node:')));
}

export interface SyncResult { written: string[]; removed: string[]; }

/** Bring `dest` in line with `root`; with `dryRun`, only report what would change. */
export function sync(root: string, dest: string, dryRun: boolean): SyncResult {
  const files = publishedFiles(root);
  const problems = files
    .filter((f) => f.endsWith('.ts'))
    .flatMap((f) => foreignImports(readFileSync(join(root, f), 'utf8')).map((s) => `${f}: imports '${s}'`));
  if (problems.length > 0) throw new Error(`schema/ is not self-contained:\n  ${problems.join('\n  ')}`);

  const written: string[] = [];
  for (const f of files) {
    const bytes = readFileSync(join(root, f));
    const target = join(dest, f);
    if (existsSync(target) && readFileSync(target).equals(bytes)) continue;
    written.push(f);
    if (!dryRun) {
      mkdirSync(join(target, '..'), { recursive: true });
      writeFileSync(target, bytes);
    }
  }
  const removed: string[] = [];
  const destSchema = join(dest, 'schema');
  if (existsSync(destSchema)) {
    for (const name of readdirSync(destSchema)) {
      const f = `schema/${name}`;
      if (files.includes(f)) continue;
      removed.push(f);
      if (!dryRun) rmSync(join(dest, f), { recursive: true, force: true });
    }
  }
  return { written, removed };
}

export function main(argv: string[]): number {
  const destAt = argv.indexOf('--dest');
  const dest = destAt >= 0 && argv[destAt + 1] ? resolve(argv[destAt + 1] as string) : DEFAULT_DEST;
  const check = argv.includes('--check');
  const { written, removed } = sync(REPO_ROOT, dest, check);
  for (const f of written) process.stdout.write(`${check ? 'stale' : 'wrote'}  ${f}\n`);
  for (const f of removed) process.stdout.write(`${check ? 'extra' : 'removed'}  ${f}\n`);
  if (written.length === 0 && removed.length === 0) process.stdout.write(`${dest} is up to date\n`);
  return check && (written.length > 0 || removed.length > 0) ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
