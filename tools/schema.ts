#!/usr/bin/env node
/**
 * Derive schema/component.schema.json and schema/naming.schema.json from the Zod schemas in
 * schema/component.ts and schema/naming.ts.
 *
 *   node tools/schema.ts            writes the JSON schemas (only when they changed)
 *   node tools/schema.ts --check    exits 1 when a committed JSON schema is stale
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
import { namingFrontmatter } from '../schema/naming.ts';
import { readText, writeTextAtomic } from './lib/py.ts';
import { REPO_ROOT } from './lib/root.ts';

export const SCHEMA_FILE: string = join(REPO_ROOT, 'schema', 'component.schema.json');
export const NAMING_SCHEMA_FILE: string = join(REPO_ROOT, 'schema', 'naming.schema.json');

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

export function namingJsonSchema(): Record<string, unknown> {
  const generated = z.toJSONSchema(namingFrontmatter, { target: 'draft-2020-12', io: 'input' }) as Record<string, unknown>;
  const { $schema, ...rest } = generated;
  return {
    $schema,
    $id: 'https://design-schema.dev/schema/naming.schema.json',
    title: 'Naming frontmatter',
    description: "A brand's renames of the generated identifiers. Lives under the `naming:` key of themes/<brand>/naming.md, a sibling of the theme doc. Every key is optional: no naming.md at all is the default, unrenamed case. Derived from schema/naming.ts by tools/schema.ts — do not edit by hand.",
    ...rest,
  };
}

/** file → (its JSON text, the Zod module it came from). */
export function targets(): { file: string; source: string; text: string }[] {
  return [
    { file: SCHEMA_FILE, source: 'schema/component.ts', text: JSON.stringify(componentJsonSchema(), null, 2) + '\n' },
    { file: NAMING_SCHEMA_FILE, source: 'schema/naming.ts', text: JSON.stringify(namingJsonSchema(), null, 2) + '\n' },
  ];
}

export function renderSchema(): string {
  return JSON.stringify(componentJsonSchema(), null, 2) + '\n';
}

export function renderNamingSchema(): string {
  return JSON.stringify(namingJsonSchema(), null, 2) + '\n';
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const check = argv.includes('--check');
  let status = 0;
  for (const { file, source, text } of targets()) {
    const rel = relative(REPO_ROOT, file);
    const current = existsSync(file) ? readText(file) : null;
    if (check) {
      if (current === text) {
        process.stdout.write(`✔ ${rel} matches ${source}\n`);
      } else {
        process.stderr.write(`✖ ${rel} is stale — run node tools/schema.ts\n`);
        status = 1;
      }
      continue;
    }
    if (current === text) {
      process.stdout.write(`✔ ${rel} unchanged\n`);
    } else {
      writeTextAtomic(file, text);
      process.stdout.write(`✔ ${rel} written from ${source}\n`);
    }
  }
  return status;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main();
