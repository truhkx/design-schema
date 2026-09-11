#!/usr/bin/env node
/**
 * Derive schema/component.schema.json from the Zod schema in schema/component.ts.
 *
 *   node tools/schema.ts            writes the JSON schema (only when it changed)
 *   node tools/schema.ts --check    exits 1 when the committed JSON schema is stale
 *
 * The JSON is documentation and a resource the MCP server serves; validation itself runs against the Zod
 * schema in tools/parse.ts, so the two can never drift. `io: 'input'` describes what a doc may contain
 * (defaults optional, unknown keys rejected only where the Zod object is strict).
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { componentFrontmatter } from '../schema/component.ts';
import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

export const SCHEMA_FILE: string = join(REPO_ROOT, 'schema', 'component.schema.json');

export function componentJsonSchema(): Record<string, unknown> {
  const generated = z.toJSONSchema(componentFrontmatter, { target: 'draft-2020-12', io: 'input' }) as Record<string, unknown>;
  const { $schema, ...rest } = generated;
  return {
    $schema,
    $id: 'https://design-schema.dev/schema/component.schema.json',
    title: 'Component frontmatter',
    description: 'Machine-readable half of a component doc. Lives under the `component:` key of the Markdown frontmatter. Derived from schema/component.ts by tools/schema.ts — do not edit by hand.',
    ...rest,
  };
}

export function renderSchema(): string {
  return JSON.stringify(componentJsonSchema(), null, 2) + '\n';
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const text = renderSchema();
  const rel = relative(REPO_ROOT, SCHEMA_FILE);
  const current = existsSync(SCHEMA_FILE) ? readText(SCHEMA_FILE) : null;
  if (argv.includes('--check')) {
    if (current === text) {
      process.stdout.write(`✔ ${rel} matches schema/component.ts\n`);
      return 0;
    }
    process.stderr.write(`✖ ${rel} is stale — run node tools/schema.ts\n`);
    return 1;
  }
  if (current === text) {
    process.stdout.write(`✔ ${rel} unchanged\n`);
  } else {
    writeTextAtomic(SCHEMA_FILE, text);
    process.stdout.write(`✔ ${rel} written from schema/component.ts\n`);
  }
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
