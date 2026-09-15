/** The shipped docs and the build outputs they produce (port of the parser half of tests/test_docs.py).
 *
 *  Read-only: nothing here writes into the repository. These are the checks that catch a doc that no longer
 *  validates, or a `generated/` tree that has drifted away from the Markdown it came from. */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { expand } from '../check_contrast.ts';
import { themeFrontmatter } from '../../schema/theme.ts';
import { readText, sortedNames } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { loadTheme, modes, publicName, themes } from '../lib/tokens.ts';

const md = (dir: string): string[] => sortedNames(readdirSync(dir).filter((n) => n.endsWith('.md'))).map((n) => join(dir, n));
const COMPONENT_DOCS = md(parse.paths.DOCS);
const THEME_DOCS = md(parse.paths.THEME_DOCS);
const stem = (f: string): string => basename(f, '.md');

const GENERATED = join(REPO_ROOT, 'generated');
const generatedComponents = (): parse.Dict[] => JSON.parse(readFileSync(join(GENERATED, 'components.json'), 'utf8')) as parse.Dict[];
const generatedThemes = (): parse.Dict[] => JSON.parse(readFileSync(join(GENERATED, 'themes.json'), 'utf8')) as parse.Dict[];
const generatedExists = existsSync(join(GENERATED, 'components.json')) && existsSync(join(GENERATED, 'themes.json'));

describe('component docs', () => {
  test('there are component docs to check', () => {
    expect(COMPONENT_DOCS.length).toBeGreaterThan(0);
  });

  test.each(COMPONENT_DOCS.map((f) => [basename(f), f]))('%s: frontmatter validates', (_name, path) => {
    const [fm] = parse.splitFrontmatter(readText(path), path);
    expect(fm, 'no `component:` block').toHaveProperty('component');
    parse.validate(fm, path);
  });

  test.each(COMPONENT_DOCS.map((f) => [basename(f), f]))('%s: sections are allowed and complete', (_name, path) => {
    const [, body] = parse.splitFrontmatter(readText(path), path);
    parse.splitSections(body, path);
  });
});

describe('theme docs', () => {
  test('there are theme docs to check', () => {
    expect(THEME_DOCS.length).toBeGreaterThan(0);
  });

  test.each(THEME_DOCS.map((f) => [basename(f), f]))('%s: id matches the file name', (_name, path) => {
    const [fm] = parse.splitFrontmatter(readText(path), path);
    expect(fm.theme.id).toBe(stem(path));
  });

  test.each(THEME_DOCS.map((f) => [basename(f), f]))('%s: sections are allowed and complete', (_name, path) => {
    const [, body] = parse.splitFrontmatter(readText(path), path);
    parse.splitSections(body, path, parse.THEME_HEADINGS, ['Feel', 'When to use']);
  });
});

describe.skipIf(!generatedExists)('generated is in sync', () => {
  test('one entry per component doc', () => {
    expect(generatedComponents().map((e) => e.id)).toEqual(COMPONENT_DOCS.map(stem));
  });

  test('one entry per theme doc', () => {
    expect(generatedThemes().map((e) => e.theme.id)).toEqual(THEME_DOCS.map(stem));
  });

  test('component frontmatter matches its doc', () => {
    // The generated component is the doc's block after the parser's own passes (extensions merged, `locked`
    // computed, `source` stamped); run the same passes on the doc and compare.
    const [byComponent] = parse.loadExtensions();
    for (const entry of generatedComponents()) {
      const path = join(parse.paths.DOCS, `${entry.id}.md`);
      const [fm] = parse.splitFrontmatter(readText(path), path);
      const added = parse.mergeExtensions(fm.component, byComponent[fm.component.name] ?? []);
      parse.validate(fm, path);
      parse.stampSources(added);
      expect(entry.component, `${basename(path)} is stale — run tools/parse.ts`).toEqual(fm.component);
    }
  });

  test('guidance matches its doc', () => {
    for (const entry of generatedComponents()) {
      const path = join(parse.paths.DOCS, `${entry.id}.md`);
      const [, body] = parse.splitFrontmatter(readText(path), path);
      expect(entry.sections, `${basename(path)} is stale`).toEqual(parse.splitSections(body, path));
    }
  });

  test('a generation prompt exists for every supported platform', () => {
    for (const entry of generatedComponents()) {
      const c = entry.component;
      for (const [platform, notes] of Object.entries(c.platforms as parse.Dict)) {
        if ((notes as parse.Dict).supported === false || !existsSync(join(parse.paths.TEMPLATES, `${platform}.md`))) continue;
        const prompt = join(GENERATED, 'prompts', `${c.name}.${platform}.md`);
        expect(existsSync(prompt), `missing ${basename(prompt)} — run tools/parse.ts`).toBe(true);
      }
    }
  });

  test('a feel skill exists for every theme', () => {
    for (const entry of generatedThemes()) {
      expect(existsSync(join(GENERATED, 'prompts', `theme.${entry.theme.id}.md`))).toBe(true);
    }
  });

  test('no prompt still carries an unreplaced placeholder', () => {
    // Guidance legitimately contains `{{ ... }}` in JSX/Lit samples, so look for
    // the template's own SHOUTING_CASE placeholders only.
    const placeholder = /\{\{[A-Z_]+\}\}/g;
    for (const name of readdirSync(join(GENERATED, 'prompts')).filter((n) => n.endsWith('.md'))) {
      const found = readFileSync(join(GENERATED, 'prompts', name), 'utf8').match(placeholder) ?? [];
      expect(found, `${name} still has ${found.join(', ')}`).toEqual([]);
    }
  });
});

/**
 * The token half of tests/test_docs.py, which read the shipped docs through tools/tokens.py until step 6
 * of process/typescript-and-currency.md ported mcp/server.py — its last importer — and deleted it.
 */
describe('the shipped docs against the token resolver', () => {
  test.each(COMPONENT_DOCS.map((f) => [basename(f), f]))('%s: every style token exists in every theme', (_name, path) => {
    // A style binding must resolve once its {slot}s are filled in.
    const [fm] = parse.splitFrontmatter(readText(path as string), path as string);
    const c = fm.component as parse.Dict;
    for (const theme of themes()) {
      for (const mode of modes(theme)) {
        const names = new Set(Object.keys(loadTheme(theme, mode)).map(publicName));
        for (const [prop, binding] of Object.entries((c.styles ?? {}) as parse.Dict)) {
          for (const ref of expand((binding as parse.Dict).token as string, c.props as parse.Dict)) {
            // Tokens are addressed by their public name, so a slot that expands to `...default` resolves to
            // the group itself. A slot that expands to `none`/`full` renders nothing rather than a token
            // (NO_TOKEN_VALUES in tools/parse.ts), so it needs none.
            if (ref.split('.').some((part) => part === 'none' || part === 'full')) continue;
            expect(names, `${c.name as string}.${prop} → ${ref} missing in ${theme}/${mode}`).toContain(publicName(ref));
          }
        }
      }
    }
  });

  test.each(THEME_DOCS.map((f) => [basename(f), f]))('%s: the frontmatter validates against the theme schema', (_name, path) => {
    const [fm] = parse.splitFrontmatter(readText(path as string), path as string);
    expect(fm).toHaveProperty('theme');
    expect((themeFrontmatter.safeParse(fm).error?.issues ?? []).map((e) => `${e.path.join('.')}: ${e.message}`)).toEqual([]);
  });

  test.each(THEME_DOCS.map((f) => [basename(f), f]))('%s: its tokens were derived', (_name, path) => {
    const [fm] = parse.splitFrontmatter(readText(path as string), path as string);
    expect(themes(), 'run tools/theme.ts').toContain((fm.theme as parse.Dict).id);
  });
});
