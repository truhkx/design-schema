/**
 * Build the vector index the MCP server searches.
 *
 * Everything indexed here is a build output of the docs, so the index can never
 * say something the docs do not:
 *
 *   generated/components.json   → one chunk per (component, section); platform notes are split
 *                                 by their ### sub-headings and tagged with that platform
 *   generated/themes.json       → one chunk per (theme, section)
 *   schema (frontmatter)        → one "schema summary" chunk per component (props/events/a11y in prose)
 *   packages/<platform>/src/*   → one chunk per generated source file (and demo page), tagged with platform + component;
 *                                 the Swift package's is Sources/DesignSchema/* (schema/platforms.ts `sourceDir`)
 *   generated/prompts/*         → one chunk per generation prompt (theme skills + per-platform)
 *
 * Every chunk carries metadata: kind, platform (all | web | lit | rn | …), component, theme, section,
 * path. `platform` is what lets the search answer "for the platform I'm working on".
 *
 * Store: mcp/.chroma, the sqlite database ChromaDB wrote before this was TypeScript (mcp/lib/store.ts),
 * embedded by the same local all-MiniLM-L6-v2 model (mcp/lib/embed.ts) — no API keys.
 *
 * Usage:  node --import tsx mcp/index.ts            # rebuild mcp/.chroma from scratch
 *
 * Runs under Node's type stripping: annotations only.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ljust, pySplitlines, pyStr, pyStrip, readText, sortedNames, truthy } from '../tools/lib/py.ts';
import { REPO_ROOT } from '../tools/lib/root.ts';
import { resolveRole } from '../schema/component.ts';
import { demoDir, PACKAGE_DIR, PLATFORMS, sourceDir } from '../schema/platforms.ts';
import type { PlatformId } from '../schema/platforms.ts';
import { DB_PATH } from './lib/store.ts';
import type { Chunk, Meta } from './lib/store.ts';

type Dict = Record<string, any>;

export const ROOT: string = REPO_ROOT;
export const GENERATED: string = join(ROOT, 'generated');
export const PACKAGES: string = join(ROOT, 'packages');

/** A lowercased `### ` heading under Platform notes → its platform: every id, plus the names authors write instead. */
export const PLATFORM_HEADINGS: Record<string, PlatformId> = {
  ...Object.fromEntries(PLATFORMS.map((p) => [p, p])),
  react: 'web', 'react native': 'rn',
};
export const MAX_CHARS = 6000; // keep chunks well inside the embedding model's context
export const PARA_SPLIT = 400; // sections longer than this are also indexed paragraph by paragraph for finer retrieval

/** `len(s)` and `s[:n]` count code points, not UTF-16 units. */
const chars = (s: string): string[] => [...s];
const pyLen = (s: string): number => chars(s).length;
const head = (s: string, n: number): string => (s.length <= n ? s : chars(s).slice(0, n).join(''));

/** Split Markdown into paragraphs (blank-line separated), keeping fenced code blocks intact. */
export function paragraphs(md: string): string[] {
  const out: string[] = [];
  let buf: string[] = [];
  let fence = false;
  for (const line of pySplitlines(md)) {
    if (line.startsWith('```')) fence = !fence;
    if (!fence && !pyStrip(line)) {
      if (buf.length) {
        out.push(pyStrip(buf.join('\n')));
        buf = [];
      }
    } else {
      buf.push(line);
    }
  }
  if (buf.length) out.push(pyStrip(buf.join('\n')));
  return out.filter((p) => pyLen(p) > 40);
}

/** One chunk for the whole section plus, when it is long, one per paragraph. */
export function sectionChunks(cid: string, title: string, section: string, md: string, meta: Meta): Chunk[] {
  const chunks: Chunk[] = [{ id: cid, text: `${title} — ${section}\n\n${md}`, meta: { ...meta, section, granularity: 'section' } }];
  if (pyLen(md) > PARA_SPLIT) {
    for (const [i, para] of paragraphs(md).entries()) {
      chunks.push({ id: `${cid}#p${i}`, text: `${title} — ${section}\n\n${para}`, meta: { ...meta, section, granularity: 'paragraph' } });
    }
  }
  return chunks;
}

/** `'### Web\n...\n### Lit\n...'` → `{ web: '...', lit: '...' }` */
export function splitPlatformNotes(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  let current: string | null = null;
  let buf: string[] = [];
  for (const line of pySplitlines(md)) {
    const m = /^###\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) out[current] = pyStrip(buf.join('\n'));
      const heading = pyStrip(m[1] as string).toLowerCase();
      current = PLATFORM_HEADINGS[heading] ?? heading;
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (current) out[current] = pyStrip(buf.join('\n'));
  return out;
}

/** Prose rendering of the frontmatter so 'what props does Button have' embeds well. */
export function schemaSummary(c: Dict): string {
  const lines = [`${c.name} (${c.category}) — anatomy: ${(c.anatomy as string[]).join(', ')}.`];
  if (truthy(c.apg)) lines.push(`Implements the ARIA APG '${pyStr(c.apg)}' pattern.`);
  lines.push('Props:');
  for (const [name, p] of Object.entries(c.props as Dict)) {
    const typ = p.type === 'enum' ? (p.values as string[]).join(' | ') : pyStr(Object.hasOwn(p, 'shape') ? p.shape : p.type);
    const req = truthy(p.required) ? ', required' : '';
    const dflt = Object.hasOwn(p, 'default') ? `, default ${pyStr(p.default)}` : '';
    const plats = truthy(p.platforms) ? ` (platforms: ${(p.platforms as string[]).join(', ')})` : '';
    lines.push(`  - ${name}: ${typ}${req}${dflt}${plats}. ${p.description}` + (truthy(p.a11y) ? ` Accessibility: ${p.a11y}` : ''));
  }
  if (truthy(c.events)) {
    lines.push('Events:');
    for (const [name, e] of Object.entries(c.events as Dict)) {
      const mapping = Object.entries(e.platforms as Dict).map(([k, v]) => `${k}: ${pyStr(v)}`).join(', ');
      lines.push(`  - ${name}: ${e.description} Platform names — ${mapping}.`);
    }
  }
  if (truthy(c.styles)) {
    lines.push('Style bindings (token per CSS property): ' + Object.entries(c.styles as Dict).map(([k, v]) => `${k} → ${v.token}`).join('; ') + '.');
  }
  const a = c.a11y as Dict;
  const role = truthy(a.roleFrom) ? `from the '${pyStr(a.roleFrom)}' prop` : resolveRole(c);
  lines.push(`Accessibility role ${role}; requires: ${(a.requires as string[]).join(', ') || 'none'}.`);
  if (truthy(a.contrast)) {
    lines.push('Contrast pairs: ' + (a.contrast as Dict[]).map((p) => `${p.foreground} on ${p.background} at ${pyStr(Object.hasOwn(p, 'level') ? p.level : 'AA')}`).join('; ') + '.');
  }
  if (truthy(c.keyboard)) {
    lines.push('Keyboard: ' + (c.keyboard as Dict[]).map((r) => `${(r.keys as string[]).join('/')} → ${r.action}` + (truthy(r.when) ? ` (when ${r.when})` : '')).join('; ') + '.');
  }
  if (truthy(c.composition)) {
    lines.push('Composition: ' + Object.entries(c.composition as Dict).map(([part, comp]) => `${part} is a ${pyStr(comp)}`).join(', ') + '.');
  }
  if (truthy(c.copy)) {
    lines.push('Copy templates: ' + Object.entries(c.copy as Dict).map(([k, v]) => `${k} = '${pyStr(v)}'`).join('; ') + '.');
  }
  return lines.join('\n');
}

/**
 * The schema summary as one chunk, or — when a component's props/events/styles outgrow the budget —
 * as a run of continuation chunks split at line boundaries, each repeating the header line so it embeds in context.
 */
export function schemaChunks(name: string, summary: string, meta: Meta): Chunk[] {
  if (pyLen(summary) <= MAX_CHARS) return [{ id: `schema:${name}`, text: summary, meta }];
  const [header, ...lines] = summary.split('\n') as [string, ...string[]];
  const pieces: string[] = [];
  let buf = [header];
  for (const line of lines) {
    if (pyLen([...buf, line].join('\n')) > MAX_CHARS && buf.length > 1) {
      pieces.push(buf.join('\n'));
      buf = [header];
    }
    buf.push(line);
  }
  pieces.push(buf.join('\n'));
  return pieces.map((text, i) => ({ id: `schema:${name}` + (i ? `#${i + 1}` : ''), text, meta }));
}

export function componentChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const entry of JSON.parse(readText(join(GENERATED, 'components.json'))) as Dict[]) {
    const c = entry.component as Dict;
    const name = c.name as string;
    const base: Meta = {
      kind: 'guidance', component: name, category: c.category as string, status: (Object.hasOwn(c, 'status') ? c.status : 'draft') as string,
      path: entry.source as string, theme: '',
    };
    chunks.push(...schemaChunks(name, schemaSummary(c), { ...base, kind: 'schema', platform: 'all', section: 'Schema', granularity: 'section' }));
    for (const [section, md] of Object.entries(entry.sections as Record<string, string>)) {
      if (section === 'Platform notes') {
        for (const [platform, notes] of Object.entries(splitPlatformNotes(md))) {
          const note = ((c.platforms as Dict)[platform]?.notes ?? '') as string;
          const text = pyStrip(notes + (note ? '\n\n' + note : ''));
          chunks.push({
            id: `guidance:${name}:${section}:${platform}`, text: `${name} — ${section} (${platform})\n\n${text}`,
            meta: { ...base, platform, section, granularity: 'section' },
          });
        }
      } else {
        chunks.push(...sectionChunks(`guidance:${name}:${section}`, name, section, md, { ...base, platform: 'all' }));
      }
    }
    // Per-platform mapping row as its own small chunk so 'what element does Button render on RN' hits.
    for (const [platform, notes] of Object.entries(c.platforms as Dict)) {
      const mapping = Object.entries(notes as Dict).filter(([k]) => k !== 'notes').map(([k, v]) => `${k}: ${pyStr(v)}`).join(', ');
      chunks.push({
        id: `platform:${name}:${platform}`, text: `${name} on ${platform}: ${mapping}. ${(notes as Dict).notes ?? ''}`,
        meta: { ...base, kind: 'platform-mapping', platform, section: 'Platform mapping', granularity: 'section' },
      });
    }
  }
  return chunks;
}

export function themeChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  const themesFile = join(GENERATED, 'themes.json');
  if (!existsSync(themesFile)) return chunks;
  for (const entry of JSON.parse(readText(themesFile)) as Dict[]) {
    const t = entry.theme as Dict;
    const base: Meta = {
      kind: 'theme', theme: t.id as string, component: '', category: 'theme', status: (Object.hasOwn(t, 'status') ? t.status : 'draft') as string,
      path: entry.source as string, platform: 'all',
    };
    const decisions =
      `Theme ${entry.title} (${t.id}): tone ${(t.tone as string[]).join(', ')}; must never be ${t.not}. ` +
      `Seed color ${(t.seed as Dict).color}, typeface ${pyStr(Object.hasOwn(t.seed as Dict, 'typeface') ? (t.seed as Dict).typeface : 'system')}, scale ${pyStr((t.scale as Dict).base)}px × ${pyStr((t.scale as Dict).ratio)}, ` +
      `radius ${t.radius}, density ${t.density}, motion ${pyStr(Object.hasOwn(t, 'motion') ? t.motion : 'subtle')}, modes ${((t.modes as Dict).supports as string[]).join(', ')} (default ${(t.modes as Dict).default}).`;
    chunks.push({ id: `theme:${t.id}:decisions`, text: decisions, meta: { ...base, section: 'Decisions', granularity: 'section' } });
    for (const [section, md] of Object.entries(entry.sections as Record<string, string>)) {
      chunks.push(...sectionChunks(`theme:${t.id}:${section}`, entry.title as string, section, md, base));
    }
  }
  return chunks;
}

/** `sorted(dir.glob('*'))`: the entries of one directory, compared as `PurePath` does on this platform. */
function globDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((name) => join(dir, name));
}

export function codeChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const platform of PLATFORMS) {
    const src = sourceDir(ROOT, platform);
    if (!existsSync(src)) continue;
    const pkg = PACKAGE_DIR[platform] as string;
    const demo = demoDir(ROOT, platform);
    for (const f of sortedNames([...globDir(src), ...(demo === null ? [] : globDir(demo))])) {
      if (!statSync(f).isFile() || !['.ts', '.tsx', '.css', '.swift'].includes(extname(f))) continue;
      const name = basename(f);
      const stem = name.split(/[.+]/)[0] as string; // `Icon+Paths.swift` is Icon's
      const component = /^\p{Lu}/u.test(stem) ? stem : '';
      const kind = name.includes('.stories.') ? 'story' : basename(join(f, '..')) === 'demo' ? 'demo' : 'code';
      const text = readText(f);
      chunks.push({
        id: `code:${platform}:${relative(join(PACKAGES, pkg), f)}`, text: `// ${platform} — ${name}\n${head(text, MAX_CHARS)}`,
        meta: {
          kind, platform, component, theme: '', category: 'code',
          status: 'generated', section: name, path: relative(ROOT, f), granularity: 'file',
        },
      });
    }
  }
  return chunks;
}

export function promptChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const f of sortedNames(globDir(join(GENERATED, 'prompts')).filter((p) => p.endsWith('.md')))) {
    const name = basename(f);
    const stem = name.slice(0, -3);
    const text = readText(f);
    let meta: Meta;
    if (name.startsWith('theme.')) {
      const theme = name.slice('theme.'.length, -3);
      meta = { kind: 'prompt', platform: 'all', component: '', theme, category: 'prompt', status: 'generated', section: 'Feel skill', path: relative(ROOT, f), granularity: 'file' };
    } else {
      // Pattern.<Name>.<platform> keeps its dot in the name
      const cut = stem.lastIndexOf('.');
      meta = { kind: 'prompt', platform: stem.slice(cut + 1), component: stem.slice(0, cut), theme: '', category: 'prompt', status: 'generated', section: 'Generation prompt', path: relative(ROOT, f), granularity: 'file' };
    }
    chunks.push({ id: `prompt:${stem}`, text: head(text, MAX_CHARS), meta });
  }
  return chunks;
}

export function allChunks(): Chunk[] {
  return [...componentChunks(), ...themeChunks(), ...codeChunks(), ...promptChunks()];
}

export async function build(): Promise<number> {
  let embed;
  try {
    // Loaded here, not at the top: the ONNX runtime costs a second that `--dry-run` has no use for.
    const { loadEmbedder } = await import('./lib/embed.ts');
    embed = await loadEmbedder((line) => process.stdout.write(line + '\n'));
  } catch (e) {
    process.stderr.write(`✖ the embedding runtime is not available — run: pnpm install\n  ${(e as Error).message}\n`);
    return 1;
  }
  const { writeIndex } = await import('./lib/store.ts');
  const chunks = allChunks();
  const batch = 64;
  const vectors: Float32Array[] = [];
  for (let i = 0; i < chunks.length; i += batch) {
    vectors.push(...(await embed(chunks.slice(i, i + batch).map((c) => c.text))));
    process.stdout.write(`  indexed ${Math.min(i + batch, chunks.length)}/${chunks.length}\n`);
  }
  writeIndex(chunks, vectors);
  const kinds = new Map<string, number>();
  for (const c of chunks) kinds.set(c.meta.kind as string, (kinds.get(c.meta.kind as string) ?? 0) + 1);
  const summary = [...kinds.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}: ${v}`).join(', ');
  process.stdout.write(`✔ ${chunks.length} chunks → ${relative(ROOT, DB_PATH)}  (${summary})\n`);
  return 0;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  if (process.argv.slice(2).includes('--dry-run')) {
    for (const c of allChunks()) process.stdout.write(`${ljust(c.id, 60)} ${ljust(c.meta.platform as string, 6)} ${String(pyLen(c.text)).padStart(5)} chars\n`);
    process.exitCode = 0;
  } else {
    process.exitCode = await build();
  }
}
