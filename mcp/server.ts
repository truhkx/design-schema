/**
 * Design Schema MCP server (the official MCP TypeScript SDK).
 *
 * Serves the design system to AI clients: semantic search over guidance filtered by
 * platform, exact lookups of component schemas and generated code, theme "feel"
 * skills, resolved tokens, and a contrast check. Everything comes from build outputs
 * (generated/, packages/, tokens/) so the server can never disagree with the docs.
 *
 * Run (stdio):   node --import tsx mcp/server.ts
 * Index first:   node --import tsx mcp/index.ts
 *
 * Claude Code:   claude mcp add design-schema -- node --import tsx /abs/path/mcp/server.ts
 * Claude Desktop / Cursor: see the "MCP server" page on the docs site for the JSON config.
 *
 * Each tool's description is the `*_DOC` constant above it — what a client reads before calling it,
 * and the docstring the Python server carried.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { iterErrors, sortedErrors } from '../tools/lib/jsonschema.ts';
import type { Schema } from '../tools/lib/jsonschema.ts';
import { which } from '../tools/lib/proc.ts';
import { appendText, has, pyGet, pyJsonDumps, pyRoundTo, pySorted, pySplitlines, pyStr, pyStrip, readText, sortedNames, truthy, writeText } from '../tools/lib/py.ts';
import { dump as yamlDump } from '../tools/lib/pyyaml.ts';
import { REPO_ROOT } from '../tools/lib/root.ts';
import { camelName, cssName, loadTheme, modes as themeModes, publicName, themes as themeIds } from '../tools/lib/tokens.ts';
import { contrast as _contrast } from '../tools/oklch.ts';
import { splitPlatformNotes } from './index.ts';
import { DB_FILE, readIndex } from './lib/store.ts';
import type { Stored } from './lib/store.ts';

type Dict = Record<string, any>;

/**
 * Everything the tools read and `write_theme` writes. Mutable so a caller can point one somewhere
 * else: the smoke test sends THEME_DOCS to a temporary folder, and the unit tests sandbox the rest.
 * CALL_LOG is every tool call, for dogfooding: which tools, what args, how big the answer.
 */
export const paths = {
  ROOT: REPO_ROOT,
  GENERATED: join(REPO_ROOT, 'generated'),
  PACKAGES: join(REPO_ROOT, 'packages'),
  CALL_LOG: join(REPO_ROOT, 'logs', 'mcp-calls.jsonl'),
  THEME_DOCS: join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'themes'),
  THEME_SCHEMA: join(REPO_ROOT, 'schema', 'theme.schema.json'),
  PROCESS_DOC: join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'process', 'from-vision-to-system.md'),
  LAYOUT_DOC: join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'foundations', 'layout.md'),
  COMPONENT_SCHEMA: join(REPO_ROOT, 'schema', 'component.schema.json'),
};

/** The arguments a caller actually passed, in signature order — what the Python decorator logged. */
function passed(args: Dict, params: string[]): Dict {
  const out: Dict = {};
  for (const p of params) if (has(args, p) && args[p] !== null && args[p] !== undefined) out[p] = args[p];
  return out;
}

function log(tool: string, args: Dict, result: unknown): void {
  try {
    mkdirSync(dirname(paths.CALL_LOG), { recursive: true });
    const size = result !== null && result !== undefined ? pyJsonDumps(result).length : 0;
    const now = new Date();
    const pad = (n: number): string => String(n).padStart(2, '0');
    const t = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    appendText(paths.CALL_LOG, pyJsonDumps({ t, tool, args, resultChars: size }) + '\n');
  } catch {
    // the call log is a convenience; never fail a tool for it
  }
}

/** A tool whose arguments are all optional can be called with none, as its Python signature could. */
type ToolArgs<A> = Record<string, never> extends A ? [args?: A] : [args: A];

/** Wrap a tool so every call lands in the call log, as `@_logged` did. */
function logged<A extends Dict, R>(tool: string, params: string[], fn: (args: A) => R): (...rest: ToolArgs<A>) => R {
  return ((args?: A): R => {
    const given = (args ?? {}) as A;
    const result = fn(given);
    log(tool, passed(given, params), result);
    return result;
  }) as (...rest: ToolArgs<A>) => R;
}

export const PLATFORMS = ['web', 'lit', 'rn', 'swiftui', 'compose'] as const;
export type Platform = (typeof PLATFORMS)[number];
const PLATFORM_PKG: Record<string, string> = { web: 'react', lit: 'lit', rn: 'rn' };
const PLATFORM_LABEL: Record<string, string> = { web: 'React (web)', lit: 'Lit web components', rn: 'React Native', swiftui: 'SwiftUI', compose: 'Jetpack Compose' };

export const INSTRUCTIONS: string =
  "Design Schema is a documentation-first, cross-platform design system. Start with get_theme_skill for the " +
  "system's feel, use search_guidance (with your platform) for how/when to use components, get_component for " +
  'the exact schema, and lookup_code for generated reference implementations on your platform. Never invent ' +
  'colors, sizes, or copy — use tokens from get_tokens and copy templates from the component schema. ' +
  'get_keyboard_model gives the keys a component must handle, get_layout_rules the spacing between components, ' +
  'list_gaps what the docs left ambiguous. To author a theme, start_theme then write_theme.';

// ---------- data access ----------

function components(): Record<string, Dict> {
  const out: Record<string, Dict> = {};
  for (const e of JSON.parse(readText(join(paths.GENERATED, 'components.json'))) as Dict[]) out[e.component.name as string] = e;
  return out;
}

function themes(): Record<string, Dict> {
  const out: Record<string, Dict> = {};
  const f = join(paths.GENERATED, 'themes.json');
  if (!existsSync(f)) return out;
  for (const e of JSON.parse(readText(f)) as Dict[]) out[e.theme.id as string] = e;
  return out;
}

let indexCache: Stored[] | undefined;

/** Every indexed chunk with its vector, read once per process. */
function collection(): Stored[] {
  if (!existsSync(DB_FILE)) throw new Error('Index not built. Run: node --import tsx mcp/index.ts');
  return (indexCache ??= readIndex());
}

function findComponent(name: string): Dict {
  const comps = components();
  for (const key of Object.keys(comps)) {
    if (key.toLowerCase() === name.toLowerCase()) return comps[key] as Dict;
  }
  throw new Error(`Unknown component '${name}'. Known: ${pySorted(Object.keys(comps)).join(', ')}`);
}

/** `subprocess.run(text=True)`: the child's output with universal newlines. */
function universal(s: string | null): string {
  return (s ?? '').replace(/\r\n?/g, '\n');
}

// ---------- search ----------

type Where = Dict;

/** The `where` clauses the search builds: equality and `$in` over string metadata, joined by `$and`. */
function matches(meta: Dict, where: Where): boolean {
  if (Object.hasOwn(where, '$and')) return (where.$and as Where[]).every((w) => matches(meta, w));
  return Object.entries(where).every(([key, cond]) => {
    const value = meta[key];
    if (cond !== null && typeof cond === 'object' && Object.hasOwn(cond as Dict, '$in')) return ((cond as Dict).$in as unknown[]).includes(value);
    return value === cond;
  });
}

/** Cosine distance against an L2-normalised index: `1 - dot`, the space the collection was built in. */
function distance(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += (a[i] as number) * (b[i] as number);
  return 1 - dot;
}

let embedderCache: ((docs: string[]) => Promise<Float32Array[]>) | undefined;

/** The query's vector, from the same local model the index was built with. */
export async function embedQuery(text: string): Promise<Float32Array> {
  if (!embedderCache) {
    const { loadEmbedder } = await import('./lib/embed.ts');
    embedderCache = await loadEmbedder();
  }
  return (await embedderCache([text]))[0] as Float32Array;
}

// ---------- tools ----------

export const SEARCH_GUIDANCE_DOC =
  `Semantic search over the design system's guidance, schemas, themes and generated code.\n\n` +
  '`platform` narrows results to platform-agnostic content plus the notes/code for that platform\n' +
  '(so a React Native developer never gets Lit-only advice). `kinds` defaults to guidance, schema,\n' +
  'platform-mapping and theme — pass ["code", "story"] to search implementations instead.\n' +
  'Returns ranked chunks with text, metadata and a relevance score (1 = identical).';

export type SearchArgs = { query: string; platform?: Platform | undefined; component?: string | undefined; kinds?: string[] | undefined; limit?: number | undefined };

export async function searchGuidance(args: SearchArgs): Promise<Dict[]> {
  const col = collection();
  const kinds = args.kinds ?? ['guidance', 'schema', 'platform-mapping', 'theme'];
  const clauses: Where[] = [{ kind: { $in: kinds } }];
  if (args.platform) clauses.push({ platform: { $in: ['all', args.platform] } });
  if (args.component) clauses.push({ component: findComponent(args.component).component.name });
  const where: Where = clauses.length === 1 ? (clauses[0] as Where) : { $and: clauses };
  const n = Math.max(1, Math.min(args.limit ?? 8, 25));
  const vector = await embedQuery(args.query);
  const ranked = col
    .filter((c) => matches(c.meta, where))
    .map((c) => ({ chunk: c, dist: distance(vector, c.vector) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n * 2);
  const out: Dict[] = [];
  const seen = new Set<string>();
  for (const { chunk, dist } of ranked) {
    // A section and one of its paragraphs can both match; keep whichever ranked first.
    const parent = chunk.id.split('#')[0] as string;
    if (seen.has(parent)) continue;
    seen.add(parent);
    const meta = chunk.meta;
    out.push({
      score: pyRoundTo(1 - dist, 3), component: truthy(meta.component) ? meta.component : null, theme: truthy(meta.theme) ? meta.theme : null,
      platform: meta.platform, section: meta.section, kind: meta.kind,
      granularity: pyGet(meta, 'granularity', 'section'), source: meta.path, text: chunk.text,
    });
    if (out.length >= n) break;
  }
  log('search_guidance', passed(args, ['query', 'platform', 'component', 'kinds', 'limit']), out);
  return out;
}

export const LIST_COMPONENTS_DOC = 'List components with category, status, APG pattern, and the platforms each supports.';

export const listComponents = logged('list_components', ['platform', 'status'], (args: { platform?: Platform | undefined; status?: string | undefined } = {}): Dict[] => {
  const out: Dict[] = [];
  const comps = components();
  for (const name of pySorted(Object.keys(comps))) {
    const e = comps[name] as Dict;
    const c = e.component as Dict;
    const supported = Object.entries(c.platforms as Dict).filter(([, n]) => truthy(pyGet(n as Dict, 'supported', true))).map(([p]) => p);
    if (args.platform && !supported.includes(args.platform)) continue;
    if (args.status && pyGet(c, 'status', 'draft') !== args.status) continue;
    out.push({ name, category: c.category, status: pyGet(c, 'status', 'draft'), apg: pyGet(c, 'apg', null), description: e.description, platforms: supported });
  }
  return out;
});

export const GET_COMPONENT_DOC =
  'Full schema and guidance for one component. With `platform`, only that platform\'s mapping and\n' +
  'notes are included and props/events are annotated with their name on that platform. `behavior` is the\n' +
  "full scenario list (authored + parser-derived) that the component's tests render, narrowed to the platform.";

export const getComponent = logged('get_component', ['name', 'platform'], (args: { name: string; platform?: Platform | undefined }): Dict => {
  const e = findComponent(args.name);
  const c = structuredClone(e.component) as Dict;
  const sections: Record<string, string> = { ...(e.sections as Record<string, string>) };
  const platform = args.platform;
  if (platform) {
    c.platforms = { [platform]: pyGet(c.platforms as Dict, platform, { supported: false, notes: 'Not mapped for this platform.' }) };
    for (const ev of Object.values(pyGet(c, 'events', {}) as Dict)) (ev as Dict).nameOnPlatform = pyGet((ev as Dict).platforms as Dict, platform, null);
    for (const p of Object.values(c.props as Dict)) {
      if (truthy((p as Dict).platforms) && !((p as Dict).platforms as string[]).includes(platform)) (p as Dict).availableOnPlatform = false;
    }
    sections['Platform notes'] = pyGet(splitPlatformNotes(pyGet(sections, 'Platform notes', '') as string), platform, '') as string;
  }
  let behavior: Dict[] = [...((pyGet(c, 'behavior', null) as Dict[] | null) ?? []), ...((pyGet(e, 'behaviorDerived', null) as Dict[] | null) ?? [])];
  if (platform) behavior = behavior.filter((sc) => !truthy(sc.platforms) || (sc.platforms as string[]).includes(platform));
  return { name: c.name, title: e.title, description: e.description, status: pyGet(c, 'status', 'draft'), schema: c, behavior, guidance: sections, source: e.source };
});

export const LOOKUP_CODE_DOC =
  'Everything needed to implement or use a component on one platform: the generated reference\n' +
  'source (and its CSS on web), stories, the platform notes, the exact generation prompt, and the\n' +
  'token names the component\'s style bindings resolve to on that platform.\n\n' +
  'Use this when writing code. The source is the reference implementation produced from the docs;\n' +
  'match its props, events, accessibility attributes and token usage.';

export const lookupCode = logged('lookup_code', ['component', 'platform', 'include'], (args: { component: string; platform: Platform; include?: string[] | undefined }): Dict => {
  const e = findComponent(args.component);
  const c = e.component as Dict;
  const name = c.name as string;
  const platform = args.platform;
  const include = args.include ?? ['source', 'styles', 'stories', 'notes', 'tokens'];
  const result: Dict = {
    component: name, platform, platformLabel: PLATFORM_LABEL[platform],
    supported: pyGet(pyGet(c.platforms as Dict, platform, {}) as Dict, 'supported', Object.hasOwn(c.platforms as Dict, platform)),
  };
  const pkg = PLATFORM_PKG[platform];
  const files: Record<string, string> = {};
  if (pkg) {
    const src = join(paths.PACKAGES, pkg, 'src');
    const candidates: Record<string, string[]> = {
      source: [join(src, `${name}.tsx`), join(src, `${name}.ts`)],
      styles: [join(src, `${name}.css`)],
      stories: [join(src, `${name}.stories.tsx`), join(src, `${name}.stories.ts`)],
    };
    for (const [key, list] of Object.entries(candidates)) {
      if (!include.includes(key)) continue;
      for (const p of list) if (existsSync(p)) files[relative(paths.ROOT, p)] = readText(p);
    }
  }
  result.files = files;
  if (include.includes('notes')) {
    result.platformMapping = pyGet(c.platforms as Dict, platform, {});
    result.platformNotes = pyGet(splitPlatformNotes(pyGet(e.sections as Dict, 'Platform notes', '') as string), platform, '');
    result.events = Object.fromEntries(Object.entries(pyGet(c, 'events', {}) as Dict).map(([ev, spec]) => [ev, pyGet((spec as Dict).platforms as Dict, platform, null)]));
    result.copy = pyGet(c, 'copy', {});
  }
  if (include.includes('prompt')) {
    const p = join(paths.GENERATED, 'prompts', `${name}.${platform}.md`);
    result.generationPrompt = existsSync(p) ? readText(p) : null;
  }
  if (include.includes('tokens')) {
    const bindings: Dict = {};
    for (const [prop, b] of Object.entries(pyGet(c, 'styles', {}) as Dict)) {
      const path = (b as Dict).token as string;
      // Keep {slot} placeholders visible in the platform name so the caller knows to interpolate.
      const marker = path.replace(/\{([a-zA-Z]+)\}/g, (_m, g: string) => `zz${g}zz`);
      const tokenName =
        platform === 'rn'
          ? camelName(marker).replace(/Zz([a-zA-Z]+)zz/g, (_m, g: string) => '{' + g.slice(0, 1).toUpperCase() + g.slice(1).toLowerCase() + '}')
          : 'var(' + cssName(marker).replace(/zz([a-zA-Z]+)zz/g, (_m, g: string) => '{' + g + '}') + ')';
      bindings[prop] = { token: path, name: tokenName, description: pyGet(b as Dict, 'description', null) };
    }
    result.tokenBindings = bindings;
    result.tokenNote =
      '{slot} placeholders take the value of that enum prop, e.g. for variant=primary: ' +
      'var(--color-action-{variant}-background) → var(--color-action-primary-background); ' +
      'colorAction{Variant}Background → colorActionPrimaryBackground.';
  }
  return result;
});

export const LIST_THEMES_DOC = 'Themes available in the system with their tone, excluded word, and modes.';

export const listThemes = logged('list_themes', [], (_args: Dict = {}): Dict[] =>
  Object.entries(themes()).map(([tid, e]) => ({
    id: tid, title: e.title, description: e.description, tone: (e.theme as Dict).tone, not: (e.theme as Dict).not,
    modes: (e.theme as Dict).modes, status: pyGet(e.theme as Dict, 'status', 'draft'),
  })),
);

export const GET_THEME_SKILL_DOC =
  'The theme\'s "feel" skill: identity, the decisions it is derived from, the resolved semantic\n' +
  'tokens, and the guidance on how to make design decisions in its spirit. Read this before\n' +
  'designing or generating anything for the theme.';

export const getThemeSkill = logged('get_theme_skill', ['theme'], (args: { theme?: string | undefined } = {}): string => {
  const theme = args.theme ?? 'calm-precise';
  const p = join(paths.GENERATED, 'prompts', `theme.${theme}.md`);
  if (!existsSync(p)) throw new Error(`Unknown theme '${theme}'. Known: ${themeIds().join(', ')}`);
  return readText(p);
});

export const GET_TOKENS_DOC =
  'Resolved design tokens for a theme and mode, named for the target platform (CSS custom\n' +
  'properties for web/lit, camelCase keys with numeric dimensions for rn). `group` filters by\n' +
  'prefix, e.g. "color.action" or "space".';

export const getTokens = logged('get_tokens', ['theme', 'mode', 'platform', 'group'], (args: { theme?: string | undefined; mode?: string | undefined; platform?: Platform | undefined; group?: string | undefined } = {}): Dict => {
  const theme = args.theme ?? 'calm-precise';
  const mode = args.mode ?? 'light';
  const platform = args.platform ?? 'web';
  if (!themeIds().includes(theme)) throw new Error(`Unknown theme '${theme}'. Known: ${themeIds().join(', ')}`);
  if (!themeModes(theme).includes(mode)) throw new Error(`Theme '${theme}' has no '${mode}' mode.`);
  const out: Dict = {};
  for (const [path, entry] of Object.entries(loadTheme(theme, mode))) {
    const pub = publicName(path);
    if (args.group && !pub.startsWith(args.group)) continue;
    let v: unknown = entry.$value;
    let key: string;
    if (platform === 'rn') {
      key = camelName(path);
      if (entry.$type === 'dimension' && typeof v === 'string' && v.endsWith('px')) v = Number(v.slice(0, -2));
      else if (Array.isArray(v) && entry.$type === 'fontFamily') v = ({ 'system-ui': 'System', 'ui-monospace': 'monospace' } as Dict)[v[0] as string] ?? v[0];
    } else {
      key = cssName(path);
      if (Array.isArray(v) && entry.$type === 'fontFamily') v = v.map((f) => ((f as string).includes(' ') ? `"${f}"` : f)).join(', ');
      else if (entry.$type === 'cubicBezier') v = `cubic-bezier(${(v as unknown[]).map((x) => pyStr(x)).join(', ')})`;
    }
    out[key] = { path: pub, value: v, type: entry.$type };
  }
  return { theme, mode, platform, count: Object.keys(out).length, tokens: out };
});

export const CHECK_CONTRAST_DOC =
  'WCAG 2.2 contrast check. Arguments may be hex colors or token paths (e.g. color.foreground.muted);\n' +
  'token paths resolve through the given theme and mode. Returns the ratio and pass/fail.';

export const checkContrast = logged(
  'check_contrast',
  ['foreground', 'background', 'level', 'large_text', 'theme', 'mode'],
  (args: { foreground: string; background: string; level?: 'AA' | 'AAA' | undefined; large_text?: boolean | undefined; theme?: string | undefined; mode?: string | undefined }): Dict => {
    const theme = args.theme ?? 'calm-precise';
    const mode = args.mode ?? 'light';
    const level = args.level ?? 'AA';
    const largeText = args.large_text ?? false;
    const tokens: Record<string, unknown> = {};
    if (themeIds().includes(theme)) for (const [p, e] of Object.entries(loadTheme(theme, mode))) tokens[publicName(p)] = e.$value;

    const resolveColor = (v: string): string => {
      if (v.startsWith('#')) return v;
      if (Object.hasOwn(tokens, v) && typeof tokens[v] === 'string' && (tokens[v] as string).startsWith('#')) return tokens[v] as string;
      if (v === 'transparent' || tokens[v] === 'transparent') return tokens['color.background'] as string;
      throw new Error(`'${v}' is neither a hex color nor a known color token in ${theme}/${mode}`);
    };

    const fg = resolveColor(args.foreground);
    const bg = resolveColor(args.background);
    const need = ({ 'AA|false': 4.5, 'AA|true': 3.0, 'AAA|false': 7.0, 'AAA|true': 4.5 } as Record<string, number>)[`${level}|${largeText}`] as number;
    const ratio = _contrast(fg, bg);
    return { foreground: fg, background: bg, ratio: pyRoundTo(ratio, 2), required: need, level, largeText, passes: ratio >= need };
  },
);

export const GET_GENERATION_PROMPT_DOC =
  'The self-contained prompt used to generate a component for a platform (rules + schema + guidance).\n' +
  'Run it to (re)generate the component, or read it to understand exactly what the implementation must do.';

export const getGenerationPrompt = logged('get_generation_prompt', ['component', 'platform'], (args: { component: string; platform: Platform }): string => {
  const name = findComponent(args.component).component.name as string;
  const p = join(paths.GENERATED, 'prompts', `${name}.${args.platform}.md`);
  if (!existsSync(p)) throw new Error(`No generation prompt for ${name} on ${args.platform}.`);
  return readText(p);
});

// ---------- keyboard, layout, gaps ----------

/** Repo-relative, forward-slash path for results; absolute when the path lives outside the repo. */
function rel(path: string): string {
  const r = relative(paths.ROOT, path);
  return (r.startsWith('..') || r === '' ? path : r).replace(/\\/g, '/');
}

const KEYBOARD_DEFAULTS = { from: 'inside', expect: 'manual' };

export const GET_KEYBOARD_MODEL_DOC =
  "The component's keyboard model: every rule from its `keyboard` block with `from` (where focus is\n" +
  'before the key: trigger | first | last | inside | any) and `expect` (what the keyboard gate asserts\n' +
  'after it: closes, opens, focus-next, …, or manual when it is documented but not auto-tested) filled\n' +
  'in with their defaults, plus the APG pattern and the a11y requirements the rules imply.';

export const getKeyboardModel = logged('get_keyboard_model', ['component'], (args: { component: string }): Dict => {
  const e = findComponent(args.component);
  const c = e.component as Dict;
  const rules: Dict[] = ((pyGet(c, 'keyboard', null) as Dict[] | null) ?? []).map((r) => ({ ...KEYBOARD_DEFAULTS, ...r }));
  const wanted = ['keyboard-operable', 'escape-dismiss', 'arrow-navigation', 'roving-tabindex', 'focus-trap', 'focus-restore'];
  const keys = (rule: Dict): number => (rule.keys as string[]).length;
  return {
    component: c.name, apg: pyGet(c, 'apg', null), role: (c.a11y as Dict).role,
    requires: ((c.a11y as Dict).requires as string[]).filter((r) => wanted.includes(r)),
    rules,
    autoTested: rules.filter((r) => r.expect !== 'manual').reduce((n, r) => n + keys(r), 0),
    manual: rules.filter((r) => r.expect === 'manual').reduce((n, r) => n + keys(r), 0),
    note: rules.length ? null : 'This component declares no keyboard block; it is not keyboard-interactive or its rules are not yet documented.',
  };
});

/** `str.split(sep, maxsplit)`. */
function splitMax(s: string, sep: string, maxsplit: number): string[] {
  const out: string[] = [];
  let rest = s;
  for (let i = 0; i < maxsplit; i++) {
    const at = rest.indexOf(sep);
    if (at === -1) break;
    out.push(rest.slice(0, at));
    rest = rest.slice(at + sep.length);
  }
  out.push(rest);
  return out;
}

/** Body of a doc split on `## ` headings; text before the first heading is 'Overview'. */
export function docSections(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  let current = 'Overview';
  let buf: string[] = [];
  const parts = splitMax(md, '\n---\n', 2);
  const body = md.startsWith('---') ? (parts[parts.length - 1] as string) : md;
  for (const line of pySplitlines(body)) {
    if (line.startsWith('## ')) {
      out[current] = pyStrip(buf.join('\n'));
      current = pyStrip(line.slice(3));
      buf = [];
    } else {
      buf.push(line);
    }
  }
  out[current] = pyStrip(buf.join('\n'));
  return Object.fromEntries(Object.entries(out).filter(([, v]) => truthy(v)));
}

export const GET_LAYOUT_RULES_DOC =
  'The between-component spacing system: every `layout.*` token (gutter, section, gap, inset, maxWidth,\n' +
  'breakpoint) resolved for a theme and mode, named for CSS and React Native, plus the rules for using them\n' +
  'from the Layout and rhythm foundations page (siblings are spaced by their parent, choose gap by\n' +
  'relationship, surfaces inset / layouts gap, pages have a gutter and a measure, breakpoints are for page\n' +
  'chrome and never for a component, sections not dividers).';

export const getLayoutRules = logged('get_layout_rules', ['theme', 'mode'], (args: { theme?: string | undefined; mode?: string | undefined } = {}): Dict => {
  const theme = args.theme ?? 'calm-precise';
  const mode = args.mode ?? 'light';
  if (!themeIds().includes(theme)) throw new Error(`Unknown theme '${theme}'. Known: ${themeIds().join(', ')}`);
  if (!themeModes(theme).includes(mode)) throw new Error(`Theme '${theme}' has no '${mode}' mode.`);
  const tokens: Dict = {};
  for (const [path, entry] of Object.entries(loadTheme(theme, mode))) {
    const pub = publicName(path);
    if (pub.startsWith('layout.')) tokens[pub] = { value: entry.$value, css: `var(${cssName(path)})`, rn: camelName(path) };
  }
  const doc = paths.LAYOUT_DOC;
  const sections = existsSync(doc) ? docSections(readText(doc)) : {};
  return { theme, mode, tokens, rules: pyGet(sections, 'The rules', ''), sections, source: existsSync(doc) ? rel(doc) : null };
});

export const LIST_GAPS_DOC =
  'What the docs left the generator to guess. Every generation run records its gaps in\n' +
  'generated/gaps/<Name>.<platform>.md; this returns them per component and platform, newest round\n' +
  'first, so a client can see which parts of a doc are ambiguous before relying on them (and fix the\n' +
  'doc rather than the code). Without `component`, every component that has gaps.';

export const listGaps = logged('list_gaps', ['component'], (args: { component?: string | undefined } = {}): Dict[] => {
  const gapsDir = join(paths.GENERATED, 'gaps');
  if (!existsSync(gapsDir)) return [];
  const want = args.component ? (findComponent(args.component).component.name as string).toLowerCase() : null;
  const out: Dict[] = [];
  for (const f of sortedNames(readdirSync(gapsDir).filter((n) => n.endsWith('.md')).map((n) => join(gapsDir, n)))) {
    const stem = (f.split(/[\\/]/).pop() as string).slice(0, -3);
    const cut = stem.lastIndexOf('.');
    const [name, platform] = cut === -1 ? [stem, null] : [stem.slice(0, cut), stem.slice(cut + 1)];
    if (want && name.toLowerCase() !== want) continue;
    const rounds: Dict[] = [];
    for (const m of readText(f).matchAll(/^## ([\s\S]+?) — round (\d+)\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/gm)) {
      const gaps = pySplitlines(m[3] as string).filter((ln) => ln.startsWith('- ')).map((ln) => pyStrip(ln.slice(2)));
      rounds.push({ when: pyStrip(m[1] as string), round: Number(m[2]), gaps });
    }
    rounds.sort((a, b) => (a.when < b.when ? 1 : a.when > b.when ? -1 : (b.round as number) - (a.round as number)));
    out.push({ component: name, platform, rounds, total: rounds.reduce((n, r) => n + (r.gaps as string[]).length, 0), source: rel(f) });
  }
  return out;
});

// ---------- theme authoring ----------

// The five interview questions, in the order of leverage the process doc gives them, each naming the
// theme frontmatter fields it fills in. Allowed values come from the schema at call time.
const THEME_QUESTIONS: Dict[] = [
  {
    id: 'tone', fields: ['tone', 'not'],
    question: 'Two to five adjectives for how the product should feel, and the one word it must never be (the tiebreaker for every borderline decision).',
  },
  {
    id: 'seed', fields: ['seed.color', 'neutralTint', 'statusHues'],
    question: 'One brand color as a hex value; every ramp is derived from it. How much of its hue should bleed into the grays (neutralTint, 0–1)?',
  },
  {
    id: 'type', fields: ['seed.typeface', 'seed.headingTypeface', 'seed.mono'],
    question: "Body typeface ('system' for each platform's own face, or a family name), an optional heading face, and the monospace family.",
  },
  {
    id: 'shape', fields: ['scale.base', 'scale.ratio', 'radius', 'density'],
    question: 'Type scale (body size and modular ratio: 1.2 dense/technical, 1.25 balanced, 1.333 editorial), corner radius preset, and spacing density.',
  },
  {
    id: 'rhythm', fields: ['motion', 'elevation', 'layout.rhythm', 'layout.contentWidth', 'modes'],
    question: 'Motion (none/subtle/expressive), elevation (flat/subtle/pronounced), layout rhythm between sections (tight/normal/loose) with a content width, and which of light/dark to support and which is the default.',
  },
];

function themeSchema(): Dict {
  return JSON.parse(readText(paths.THEME_SCHEMA)) as Dict;
}

const SPEC_KEYS = ['type', 'enum', 'minimum', 'maximum', 'default', 'pattern', 'description', 'minItems', 'maxItems'];
const SPEC_KEYS_AT = ['type', 'enum', 'minimum', 'maximum', 'default', 'pattern', 'description'];

/** Allowed values for a dotted frontmatter path, read from the JSON Schema. */
function fieldSpec(schema: Dict, path: string): Dict {
  let node: Dict | null = schema.$defs.themeDef as Dict;
  for (const part of path.split('.')) {
    node = ((pyGet(node, 'properties', {}) as Dict)[part] ?? null) as Dict | null;
    if (node === null) return {};
    if (Object.hasOwn(node, '$ref')) node = schema.$defs[(node.$ref as string).split('/').pop() as string] as Dict;
  }
  const spec: Dict = {};
  for (const k of SPEC_KEYS) if (Object.hasOwn(node, k)) spec[k] = node[k];
  if (Object.hasOwn(node, 'items') && Object.hasOwn(node.items as Dict, '$ref')) {
    spec.items = pyGet(schema.$defs[((node.items as Dict).$ref as string).split('/').pop() as string] as Dict, 'enum', null);
  }
  if (Object.hasOwn(node, 'properties') && !Object.hasOwn(spec, 'enum')) {
    spec.fields = Object.fromEntries(Object.entries(node.properties as Dict).map(([k, v]) => [k, fieldSpecAt(schema, v as Dict)]));
  }
  return spec;
}

function fieldSpecAt(schema: Dict, node: Dict): Dict {
  if (Object.hasOwn(node, '$ref')) node = schema.$defs[(node.$ref as string).split('/').pop() as string] as Dict;
  const spec: Dict = {};
  for (const k of SPEC_KEYS_AT) if (Object.hasOwn(node, k)) spec[k] = node[k];
  return spec;
}

export const START_THEME_DOC =
  'Begin authoring a theme: the five interview questions from the process doc (tone + excluded word,\n' +
  'seed color, typeface, scale/radius/density, motion/elevation/layout rhythm/modes), each with the\n' +
  'frontmatter fields it fills and the allowed values from schema/theme.schema.json. Ask them one at a\n' +
  'time, then call write_theme with the answers. The reference example is the calm-precise theme doc.';

export const startTheme = logged('start_theme', [], (_args: Dict = {}): Dict => {
  const schema = themeSchema();
  const questions = THEME_QUESTIONS.map((q) => ({ ...q, allowed: Object.fromEntries((q.fields as string[]).map((f) => [f, fieldSpec(schema, f)])) }));
  let stage = '';
  if (existsSync(paths.PROCESS_DOC)) stage = pyGet(docSections(readText(paths.PROCESS_DOC)), 'Stage 1 — The theme doc (the first interaction)', '') as string;
  const example = join(paths.THEME_DOCS, 'calm-precise.md');
  return {
    questions, required: (schema.$defs.themeDef as Dict).required, process: stage,
    example: existsSync(example) ? readText(example) : null,
    bodySections: ['Feel', 'Not <word>', 'References', 'When to use', 'When not to use', 'Accessibility', 'Platform notes'],
    next: 'write_theme(id, answers) with answers = { title, description, tone, not, seed, neutralTint, scale, radius, density, motion, elevation, layout, modes, feel, notFeel?, references?, whenToUse, whenNotToUse?, accessibility?, platformNotes? }',
  };
});

/**
 * The prose half of the theme doc in the calm-precise shape; sections the answers leave out get a
 * truthful default that names the decisions rather than inventing a feel.
 */
function themeBody(t: Dict, a: Dict): string {
  const tone = (t.tone as string[]).join(', ');
  const notWord = t.not as string;
  const pid = t.id as string;
  const or = (v: unknown, fallback: string): string => (truthy(v) ? (v as string) : fallback);
  const feel = or(
    a.feel,
    `${tone}. Surfaces, accent, corners (${t.radius} radius), type (${pyStr(pyGet(t.seed as Dict, 'typeface', 'system'))} at a ${pyStr((t.scale as Dict).ratio)} scale) and ${pyStr(pyGet(t, 'motion', 'subtle'))} motion all follow from the decisions in the frontmatter.`,
  );
  const notFeel = or(a.notFeel, `When a decision is borderline, this is the tiebreaker: if a choice would make the interface read as ${notWord}, make the other choice.`);
  const references = or(a.references, 'Not yet recorded.');
  const when = or(a.whenToUse, `Choose this theme when the product should feel ${tone}.`);
  const whenNot = or(a.whenNotToUse, `Do not use it where the product needs to feel ${notWord}; pick or author another theme.`);
  const a11y = or(
    a.accessibility,
    'Every supported mode is derived to meet WCAG 2.2 AA on every action variant and AAA on headings against the page background; the build proves it with tools/check_contrast.ts. ' +
      'The focus ring is the accent at 2px, visible on every surface. The 24px minimum target is enforced in every component; the 44px comfortable target is used on touch platforms.',
  );
  const notes = (truthy(a.platformNotes) ? a.platformNotes : {}) as Dict;
  const web = or(notes.web, `Apply the theme with \`data-theme="${pid}"\` and switch modes with \`data-mode="dark"\` on the root element.`);
  const lit = or(notes.lit, 'Token custom properties inherit through shadow roots, so the same root attributes theme every custom element without extra wiring.');
  const rn = or(notes.rn, `Import \`packages/tokens/dist/${pid}/rn/tokens.light.js\` or \`.dark.js\` and select with the \`useColorScheme\` hook.`);
  const overview = or(a.overview, `${pyStr(pyGet(a, 'title', pid))} is ${tone} and never ${notWord}.`);
  return `
${overview}

## Feel

${feel}

## Not ${notWord}

${notFeel}

## References

${references}

## When to use

${when}

## When not to use

${whenNot}

## Accessibility

${a11y}

## Platform notes

### Web
${web}

### Lit
${lit}

### React Native
${rn}
`;
}

const THEME_KEYS = ['status', 'tone', 'not', 'seed', 'neutralTint', 'scale', 'radius', 'density', 'motion', 'elevation', 'layout', 'modes', 'statusHues', 'overrides'];

/** `str.capitalize()`: the first character upper, the rest lower. */
function capitalize(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase();
}

export const WRITE_THEME_DOC =
  'Write site/src/content/docs/themes/<id>.md from interview answers in the calm-precise shape, validate the\n' +
  'frontmatter against schema/theme.schema.json, run tools/theme.ts to derive the tokens for every mode, and\n' +
  'return what happened. `answers` carries the frontmatter decisions (tone, not, seed, neutralTint, scale,\n' +
  'radius, density, motion, elevation, layout, modes, statusHues?, overrides?) plus prose (title, description,\n' +
  'feel, notFeel, references, whenToUse, whenNotToUse, accessibility, platformNotes {web, lit, rn}).\n' +
  'Nothing is written when validation fails; an existing doc is kept unless `overwrite` is true. Derivation\n' +
  'errors and contrast problems are returned, not fixed: the caller decides which decision to change.';

export const writeTheme = logged('write_theme', ['id', 'answers', 'overwrite'], (args: { id: string; answers: Dict; overwrite?: boolean | undefined }): Dict => {
  const { id, answers } = args;
  if (!/^[a-z][a-z0-9-]*$/.test(id)) throw new Error('id must be kebab-case: lowercase letters, digits and hyphens, starting with a letter');
  const t: Dict = { id, status: pyGet(answers, 'status', 'draft') };
  for (const k of THEME_KEYS) if (Object.hasOwn(answers, k) && k !== 'status') t[k] = answers[k];
  const problems = sortedErrors(iterErrors(themeSchema() as Schema, { theme: t })).map((e) => `${e.path.map((p) => String(p)).join('.') || '(root)'}: ${e.message}`);
  if (problems.length) return { ok: false, written: null, errors: problems, hint: 'Fix the answers; nothing was written.' };
  const path = join(paths.THEME_DOCS, `${id}.md`);
  if (existsSync(path) && !args.overwrite) return { ok: false, written: null, errors: [`${rel(path)} exists; pass overwrite=true to replace it`] };
  const title = truthy(answers.title) ? (answers.title as string) : capitalize(id.replace(/-/g, ' '));
  const description = truthy(answers.description) ? (answers.description as string) : `${(t.tone as string[]).join(', ')}; never ${t.not}.`;
  const front = yamlDump({ title, description, theme: t }, true, 1000);
  mkdirSync(paths.THEME_DOCS, { recursive: true });
  writeText(path, '---\n' + front + '---\n' + themeBody(t, { ...answers, title }));
  // The generator is TypeScript: `--import tsx` runs it on any Node ≥ 22 (native type stripping needs 22.18+).
  const node = which('node') ?? 'node';
  const options = { cwd: paths.ROOT, encoding: 'utf8' as const, maxBuffer: 64 * 1024 * 1024 };
  const run = spawnSync(node, ['--import', 'tsx', join(paths.ROOT, 'tools', 'theme.ts')], options);
  const errors = pySplitlines(universal(run.stderr)).map(pyStrip).filter((ln) => truthy(ln));
  const tokensDir = join(paths.ROOT, 'tokens', 'themes', id);
  const result: Dict = { ok: run.status === 0, written: rel(path), themeOutput: pyStrip(universal(run.stdout)), errors, tokens: existsSync(tokensDir) ? rel(tokensDir) : null };
  if (run.status === 0) {
    // The contrast gate is TypeScript too.
    const check = spawnSync(node, ['--import', 'tsx', join(paths.ROOT, 'tools', 'check_contrast.ts')], options);
    const stdout = universal(check.stdout);
    const failures = pySplitlines(stdout).map(pyStrip).filter((ln) => ln.startsWith('✖') && ln.includes(id));
    const lines = pySplitlines(pyStrip(stdout));
    result.contrast = { ok: check.status === 0 && !failures.length, failures, summary: lines.length ? (lines[lines.length - 1] as string) : '' };
    result.next =
      "Contrast failures name a token pair; change the seed's lightness or an override rather than the component. " +
      'Then run tools/parse.ts so generated/prompts/theme.<id>.md exists and get_theme_skill can serve it.';
  }
  return result;
});

// ---------- the server ----------

const platformArg = z.enum(PLATFORMS);
const modeArg = z.enum(['light', 'dark']);

/** A tool result: a string as it is, anything else as indented JSON — the shape FastMCP produced. */
function content(result: unknown): { content: { type: 'text'; text: string }[] } {
  return { content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }] };
}

export function createServer(): McpServer {
  const server = new McpServer({ name: 'design-schema', version: '0.0.1' }, { instructions: INSTRUCTIONS });

  server.registerTool(
    'search_guidance',
    {
      description: SEARCH_GUIDANCE_DOC,
      inputSchema: {
        query: z.string(),
        platform: platformArg.optional(),
        component: z.string().optional(),
        kinds: z.array(z.enum(['guidance', 'schema', 'platform-mapping', 'theme', 'code', 'story', 'demo', 'prompt'])).optional(),
        limit: z.number().int().optional(),
      },
    },
    async (args) => content(await searchGuidance(args as SearchArgs)),
  );

  server.registerTool(
    'list_components',
    { description: LIST_COMPONENTS_DOC, inputSchema: { platform: platformArg.optional(), status: z.enum(['draft', 'review', 'stable', 'deprecated']).optional() } },
    (args) => content(listComponents(args)),
  );

  server.registerTool('get_component', { description: GET_COMPONENT_DOC, inputSchema: { name: z.string(), platform: platformArg.optional() } }, (args) => content(getComponent(args)));

  server.registerTool(
    'lookup_code',
    { description: LOOKUP_CODE_DOC, inputSchema: { component: z.string(), platform: platformArg, include: z.array(z.enum(['source', 'styles', 'stories', 'prompt', 'notes', 'tokens'])).optional() } },
    (args) => content(lookupCode(args)),
  );

  server.registerTool('list_themes', { description: LIST_THEMES_DOC, inputSchema: {} }, () => content(listThemes()));

  server.registerTool('get_theme_skill', { description: GET_THEME_SKILL_DOC, inputSchema: { theme: z.string().optional() } }, (args) => content(getThemeSkill(args)));

  server.registerTool(
    'get_tokens',
    { description: GET_TOKENS_DOC, inputSchema: { theme: z.string().optional(), mode: modeArg.optional(), platform: platformArg.optional(), group: z.string().optional() } },
    (args) => content(getTokens(args)),
  );

  server.registerTool(
    'check_contrast',
    {
      description: CHECK_CONTRAST_DOC,
      inputSchema: { foreground: z.string(), background: z.string(), level: z.enum(['AA', 'AAA']).optional(), large_text: z.boolean().optional(), theme: z.string().optional(), mode: modeArg.optional() },
    },
    (args) => content(checkContrast(args)),
  );

  server.registerTool('get_generation_prompt', { description: GET_GENERATION_PROMPT_DOC, inputSchema: { component: z.string(), platform: platformArg } }, (args) => content(getGenerationPrompt(args)));

  server.registerTool('get_keyboard_model', { description: GET_KEYBOARD_MODEL_DOC, inputSchema: { component: z.string() } }, (args) => content(getKeyboardModel(args)));

  server.registerTool('get_layout_rules', { description: GET_LAYOUT_RULES_DOC, inputSchema: { theme: z.string().optional(), mode: modeArg.optional() } }, (args) => content(getLayoutRules(args)));

  server.registerTool('list_gaps', { description: LIST_GAPS_DOC, inputSchema: { component: z.string().optional() } }, (args) => content(listGaps(args)));

  server.registerTool('start_theme', { description: START_THEME_DOC, inputSchema: {} }, () => content(startTheme()));

  server.registerTool(
    'write_theme',
    { description: WRITE_THEME_DOC, inputSchema: { id: z.string(), answers: z.record(z.string(), z.unknown()), overwrite: z.boolean().optional() } },
    (args) => content(writeTheme(args as { id: string; answers: Dict; overwrite?: boolean | undefined })),
  );

  // ---------- resources ----------

  const body = (uri: URL, text: string, mimeType: string): { contents: { uri: string; text: string; mimeType: string }[] } => ({ contents: [{ uri: uri.href, text, mimeType }] });
  const json = (value: unknown): string => JSON.stringify(value, null, 2);

  server.registerResource('components', 'design-schema://components', { mimeType: 'application/json' }, (uri) => body(uri, json(listComponents()), 'application/json'));

  server.registerResource('component', new ResourceTemplate('design-schema://components/{name}', { list: undefined }), { mimeType: 'application/json' }, (uri, vars) =>
    body(uri, json(getComponent({ name: String(vars.name) })), 'application/json'),
  );

  server.registerResource('theme-skill', new ResourceTemplate('design-schema://themes/{theme}/skill', { list: undefined }), { mimeType: 'text/markdown' }, (uri, vars) =>
    body(uri, getThemeSkill({ theme: String(vars.theme) }), 'text/markdown'),
  );

  server.registerResource('component-keyboard', new ResourceTemplate('design-schema://components/{name}/keyboard', { list: undefined }), { mimeType: 'application/json' }, (uri, vars) =>
    body(uri, json(getKeyboardModel({ component: String(vars.name) })), 'application/json'),
  );

  server.registerResource('component-schema', 'design-schema://schema/component', { mimeType: 'application/json' }, (uri) =>
    body(uri, readText(paths.COMPONENT_SCHEMA), 'application/json'),
  );

  return server;
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  await createServer().connect(new StdioServerTransport());
}
