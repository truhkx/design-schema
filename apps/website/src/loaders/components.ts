/**
 * The schema loader — an Astro 5 Content Layer loader for the `components` collection.
 *
 * It reads `generated/components.json` (written by `tools/parse.ts` from the 51 component docs)
 * *in place*. Nothing is copied into apps/website: the docs stay the single source of truth, and
 * `pnpm parse` is all it takes for the website to pick up a schema change.
 *
 * The collection's Zod schema lives in ../content.config.ts, where `z` comes from `astro:content`;
 * this file only turns the JSON array into store entries.
 */
import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Loader } from 'astro/loaders';

/** Resolved from this module, not from the Astro root, so the path survives a config move. */
const COMPONENTS_JSON = new URL('../../../../generated/components.json', import.meta.url);

export function componentsLoader(): Loader {
  const file = fileURLToPath(COMPONENTS_JSON);

  return {
    name: 'design-schema-components',
    async load({ store, parseData, generateDigest, watcher, logger, config }) {
      const displayPath = relative(fileURLToPath(config.root), file).replaceAll('\\', '/');

      const read = async () => {
        // components.json is generated, so it is gitignored: a fresh clone has to run the parser
        // before it can build the site. Say that instead of surfacing a bare ENOENT.
        const json = await readFile(file, 'utf8').catch((cause: unknown) => {
          if ((cause as { code?: string }).code === 'ENOENT') {
            throw new Error(`${displayPath} is missing. Run \`pnpm parse\` at the repo root first.`, { cause });
          }
          throw cause;
        });
        const parsed: unknown = JSON.parse(json);
        if (!Array.isArray(parsed)) {
          throw new Error(`${displayPath} should be an array of component entries. Run \`pnpm parse\`.`);
        }
        // A full reload every time: the file is regenerated wholesale, so there is no per-entry
        // mtime to diff against and a stale entry would be worse than a slightly slower build.
        store.clear();
        for (const entry of parsed) {
          const id = (entry as { id?: unknown }).id;
          if (typeof id !== 'string' || id === '') {
            throw new Error(`Every entry in ${displayPath} needs a string \`id\` (the component slug).`);
          }
          const data = await parseData({ id, data: entry as Record<string, unknown>, filePath: displayPath });
          store.set({ id, data, digest: generateDigest(data) });
        }
        logger.info(`Loaded ${parsed.length} component schemas from ${displayPath}`);
      };

      await read();

      // In dev, re-read when `pnpm parse` rewrites the file. The watcher is absent in a build.
      if (watcher) {
        watcher.add(file);
        watcher.on('change', (changed) => {
          if (changed === file) void read();
        });
      }
    },
  };
}
