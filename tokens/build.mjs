/**
 * Token build — Style Dictionary 4 (DTCG format), theme × mode.
 *
 *   tokens/themes/<id>/base.json          derived ramps & scales (by tools/theme.ts — do not edit)
 *   tokens/themes/<id>/{light,dark}.json  semantic layer per mode; same NAMES, different values
 *
 * Outputs (packages/tokens/dist/<id>/ — inside the @design-schema/tokens package so its `exports` resolve):
 *   css/tokens.css            :root,[data-mode="light"] { --color-foreground: … }  +  [data-mode="dark"] { … }
 *   js/tokens.{mode}.js       flat ESM objects for React / Lit (values as CSS strings)
 *   rn/tokens.{mode}.js       flat ESM objects for React Native (dimensions as numbers, first font family)
 *   json/tokens.{mode}.json   resolved values — consumed by the docs site and the MCP server
 *
 * Naming rule: a trailing `default` segment is dropped, so
 *   color.foreground.default  → --color-foreground   / tokens.colorForeground
 *   color.foreground.strong   → --color-foreground-strong / tokens.colorForegroundStrong
 */
import StyleDictionary from 'style-dictionary';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = path.join(here, 'themes');
const MODES = ['light', 'dark'];

const dropDefault = (p) => (p.at(-1) === 'default' ? p.slice(0, -1) : p);
const kebab = (parts) => parts.join('-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const camel = (parts) =>
  parts
    .map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '');

StyleDictionary.registerTransform({
  name: 'name/kebab-no-default',
  type: 'name',
  transform: (token) => kebab(dropDefault(token.path)),
});
StyleDictionary.registerTransform({
  name: 'name/camel-no-default',
  type: 'name',
  transform: (token) => camel(dropDefault(token.path)),
});
// The resolved JSON is keyed by the dotted public name — the shape tools/parse.ts, tools/spec_sheet.ts,
// the MCP server and the docs site's ThemeSwatches all read.
StyleDictionary.registerTransform({
  name: 'name/dot-no-default',
  type: 'name',
  transform: (token) => dropDefault(token.path).join('.'),
});
// React Native wants unitless numbers for dimensions.
StyleDictionary.registerTransform({
  name: 'dimension/px-to-number',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'dimension',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return typeof v === 'string' && v.endsWith('px') ? Number.parseFloat(v) : v;
  },
});
// CSS wants a comma-separated font stack; RN wants the first family only.
StyleDictionary.registerTransform({
  name: 'fontFamily/css-stack',
  type: 'value',
  filter: (token) => token.$type === 'fontFamily',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return Array.isArray(v) ? v.map((f) => (f.includes(' ') ? `"${f}"` : f)).join(', ') : v;
  },
});
StyleDictionary.registerTransform({
  name: 'fontFamily/first',
  type: 'value',
  filter: (token) => token.$type === 'fontFamily',
  transform: (token) => {
    const v = token.$value ?? token.value;
    const first = Array.isArray(v) ? v[0] : v;
    return { 'system-ui': 'System', 'ui-monospace': 'monospace' }[first] ?? first; // RN has no CSS generic families
  },
});

StyleDictionary.registerTransform({
  name: 'duration/ms-to-number',
  type: 'value',
  filter: (token) => token.$type === 'duration',
  transform: (token) => Number.parseInt(token.$value ?? token.value, 10),
});
// DTCG shadow → CSS box-shadow string, or the RN shadow/elevation object.
const px = (s) => (typeof s === 'string' && s.endsWith('px') ? Number.parseFloat(s) : s);
StyleDictionary.registerTransform({
  name: 'shadow/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return typeof v === 'string' ? v : `${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread ?? '0px'} ${v.color}`;
  },
});
StyleDictionary.registerTransform({
  name: 'shadow/rn',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token) => {
    const v = token.$value ?? token.value;
    if (typeof v === 'string') return v;
    const alpha = v.color.length === 9 ? Number.parseInt(v.color.slice(7, 9), 16) / 255 : 1;
    return {
      shadowColor: v.color.slice(0, 7),
      shadowOffset: { width: px(v.offsetX), height: px(v.offsetY) },
      shadowRadius: px(v.blur) / 2,
      shadowOpacity: Math.round(alpha * 1000) / 1000,
      elevation: Math.max(1, Math.round(px(v.blur) / 4)),
    };
  },
});
StyleDictionary.registerTransform({
  name: 'cubicBezier/css',
  type: 'value',
  filter: (token) => token.$type === 'cubicBezier',
  transform: (token) => `cubic-bezier(${(token.$value ?? token.value).join(', ')})`,
});

const config = (theme, mode) => {
  const out = path.join(here, '..', 'packages', 'tokens', 'dist', theme);
  return {
    log: { verbosity: 'verbose' },
    source: [path.join(THEMES_DIR, theme, 'base.json'), path.join(THEMES_DIR, theme, `${mode}.json`)],
    platforms: {
      css: {
        transforms: ['attribute/cti', 'name/kebab-no-default', 'fontFamily/css-stack', 'cubicBezier/css', 'shadow/css'],
        buildPath: path.join(out, 'css/'),
        files: [
          {
            destination: `tokens.${mode}.css`,
            format: 'css/variables',
            options: {
              selector: mode === 'light' ? ':root, [data-mode="light"]' : '[data-mode="dark"]',
              outputReferences: true,
            },
          },
        ],
      },
      js: {
        transforms: ['attribute/cti', 'name/camel-no-default', 'fontFamily/css-stack', 'cubicBezier/css', 'shadow/css'],
        buildPath: path.join(out, 'js/'),
        files: [
          { destination: `tokens.${mode}.js`, format: 'javascript/es6' },
          { destination: `tokens.${mode}.d.ts`, format: 'typescript/es6-declarations' },
        ],
      },
      rn: {
        transforms: ['attribute/cti', 'name/camel-no-default', 'dimension/px-to-number', 'duration/ms-to-number', 'fontFamily/first', 'shadow/rn'],
        buildPath: path.join(out, 'rn/'),
        files: [
          { destination: `tokens.${mode}.js`, format: 'javascript/es6' },
          { destination: `tokens.${mode}.d.ts`, format: 'typescript/es6-declarations' },
        ],
      },
      json: {
        transforms: ['attribute/cti', 'name/dot-no-default'],
        buildPath: path.join(out, 'json/'),
        files: [{ destination: `tokens.${mode}.json`, format: 'json/flat' }],
      },
    },
  };
};

// ---------- the token-name contract (packages/tokens/dist/names.{js,d.ts}) ----------
// Theme- and mode-independent: the dotted public names every theme provides, in source order, plus the
// helpers the generated components import. Style Dictionary has no format for a cross-theme file, so this
// walks the DTCG source itself — the same walk tools/tokens.py did before the Python fallback was removed.

const RESERVED = new Set(['$type', '$description', '$value', '$extensions', '$deprecated']);
const isTree = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

const deepMerge = (a, b) => {
  for (const [k, v] of Object.entries(b)) {
    if (isTree(v) && isTree(a[k])) deepMerge(a[k], v);
    else a[k] = v;
  }
  return a;
};

/** Every `$value` leaf as a dotted path, depth first, with a trailing `default` segment dropped. */
const tokenNames = (tree, path = [], out = []) => {
  if ('$value' in tree) {
    out.push(dropDefault(path).join('.'));
    return out;
  }
  for (const [k, v] of Object.entries(tree)) {
    if (RESERVED.has(k) || !isTree(v)) continue;
    tokenNames(v, [...path, k], out);
  }
  return out;
};

async function writeNames(theme, modes) {
  const tree = {};
  for (const f of ['base.json', `${modes[0]}.json`]) {
    deepMerge(tree, JSON.parse(await fs.readFile(path.join(THEMES_DIR, theme, f), 'utf8')));
  }
  const names = tokenNames(tree);
  const dist = path.join(here, '..', 'packages', 'tokens', 'dist');
  await fs.writeFile(
    path.join(dist, 'names.d.ts'),
    '// Generated by tokens/build.mjs — the dotted token names every theme provides.\n' +
      'export type TokenRef =\n  | ' + names.map((n) => JSON.stringify(n)).join('\n  | ') + ';\n' +
      'export declare const TOKEN_NAMES: readonly TokenRef[];\n' +
      "/** 'space.lg' → 'var(--space-lg)' */\nexport declare function cssVar(ref: TokenRef): string;\n" +
      "/** 'space.lg' → 'spaceLg' (the key in the JS/RN token objects) */\nexport declare function tokenKey(ref: TokenRef): string;\n" +
      "/** Resolve a ref against a loaded token object: resolveToken(tokens, 'space.lg') */\n" +
      'export declare function resolveToken<T extends Record<string, unknown>>(tokens: T, ref: TokenRef): T[keyof T];\n',
  );
  await fs.writeFile(
    path.join(dist, 'names.js'),
    '// Generated by tokens/build.mjs\n' +
      'export const TOKEN_NAMES = ' + JSON.stringify(names) + ';\n' +
      "const kebab = (ref) => ref.replace(/\\./g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();\n" +
      'export const cssVar = (ref) => `var(--${kebab(ref)})`;\n' +
      "export const tokenKey = (ref) => ref.split('.').map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('');\n" +
      'export const resolveToken = (tokens, ref) => tokens[tokenKey(ref)];\n',
  );
}

const themes = (await fs.readdir(THEMES_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
for (const theme of themes) {
  const modes = [];
  for (const mode of MODES) {
    try {
      await fs.access(path.join(THEMES_DIR, theme, `${mode}.json`));
    } catch {
      continue;
    }
    modes.push(mode);
    await new StyleDictionary(config(theme, mode)).buildAllPlatforms();
  }
  // Single CSS entry per theme: light (:root) + dark overrides.
  const cssDir = path.join(here, '..', 'packages', 'tokens', 'dist', theme, 'css');
  const merged = (await Promise.all(modes.map((m) => fs.readFile(path.join(cssDir, `tokens.${m}.css`), 'utf8')))).join('\n');
  await fs.writeFile(path.join(cssDir, 'tokens.css'), `/* Theme: ${theme} */\n${merged}`);
  await writeNames(theme, modes);
  console.log(`✔ ${theme} (${modes.join(', ')}) →`, path.relative(process.cwd(), path.join(here, '..', 'packages', 'tokens', 'dist', theme)));
}
