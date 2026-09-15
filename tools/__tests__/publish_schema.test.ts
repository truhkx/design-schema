import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { REPO_ROOT } from '../lib/root.ts';
import { foreignImports, publishedFiles, sync } from '../publish_schema.ts';

describe('publish_schema', () => {
  test('every published schema file imports only siblings, zod and node: modules', () => {
    const problems = publishedFiles(REPO_ROOT)
      .filter((f) => f.endsWith('.ts'))
      .flatMap((f) => foreignImports(readFileSync(join(REPO_ROOT, f), 'utf8')).map((s) => `${f}: ${s}`));
    expect(problems).toEqual([]);
  });

  test('foreignImports flags a reach into tools/ and a third-party package', () => {
    const source = "import { z } from 'zod';\nimport { join } from 'node:path';\nimport { a } from './lib.ts';\n"
      + "import { expand } from '../tools/check_contrast.ts';\nexport { b } from 'yaml';\n";
    expect(foreignImports(source)).toEqual(['../tools/check_contrast.ts', 'yaml']);
  });

  test('sync writes the package, leaves the public repo\'s own files alone, and removes stale schema files', () => {
    const dest = mkdtempSync(join(tmpdir(), 'publish-schema-'));
    try {
      writeFileSync(join(dest, 'README.md'), 'public readme');
      const first = sync(REPO_ROOT, dest, false);
      expect(first.written).toEqual(publishedFiles(REPO_ROOT));
      expect(readFileSync(join(dest, 'README.md'), 'utf8')).toBe('public readme');

      writeFileSync(join(dest, 'schema', 'gone.ts'), 'export {};');
      expect(sync(REPO_ROOT, dest, true)).toEqual({ written: [], removed: ['schema/gone.ts'] });
      expect(sync(REPO_ROOT, dest, false).removed).toEqual(['schema/gone.ts']);
      expect(sync(REPO_ROOT, dest, true)).toEqual({ written: [], removed: [] });
    } finally {
      rmSync(dest, { recursive: true, force: true });
    }
  });
});
