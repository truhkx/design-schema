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
 * The `swift` platform does not write into that tree: SwiftUI wants one file per theme carrying both
 * modes, so it is formatted in memory per mode and assembled into
 * packages/swiftui/Sources/DesignSchemaTokens/ (see "the Swift platform" below).
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

// ---------- the Swift platform ----------
// process/ios-platform.md, "Tokens". Every value transform below emits Swift *source* — the literal that
// goes on the right of a `static let` — and the format turns `$type` into the declared Swift type. The
// transforms are transitive (a semantic token whose value is `{color.palette.neutral.800}` is transformed
// after the reference resolves) and therefore idempotent: each one passes a value it has already
// converted straight through.

/** A Swift floating-point literal: `4`, `0.12`, `1.5` — never `4.0000000001` and never an exponent. */
const swiftNum = (n) => {
  const r = Math.round(Number(n) * 1e6) / 1e6;
  return Object.is(r, -0) ? '0' : String(r);
};
const round4 = (n) => Math.round(n * 1e4) / 1e4;

/** `#3b5bdb` / `#0000001a` / `transparent` → `Color(red:green:blue:opacity:)`, sRGB channels in 0…1. */
const swiftColor = (hex) => {
  if (hex === 'transparent') return 'Color.clear';
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const channel = (i) => round4(Number.parseInt(h.slice(i, i + 2), 16) / 255);
  const [r, g, b] = [0, 2, 4].map(channel);
  const a = h.length === 8 ? channel(6) : 1;
  const rgb = `red: ${swiftNum(r)}, green: ${swiftNum(g)}, blue: ${swiftNum(b)}`;
  return a === 1 ? `Color(${rgb})` : `Color(${rgb}, opacity: ${swiftNum(a)})`;
};

const FONT_WEIGHT = {
  100: '.ultraLight', 200: '.thin', 300: '.light', 400: '.regular', 500: '.medium',
  600: '.semibold', 700: '.bold', 800: '.heavy', 900: '.black',
};
// SwiftUI's system designs. Anything else in a stack is a real family name and stays a string, so
// `Font.Design` says *how* to render and `family` says *what* — warm-sleek's "Google Sans" needs both.
const FONT_DESIGN = { 'system-ui': '.default', 'ui-monospace': '.monospaced' };

const swiftFontFamily = (value) => {
  const stack = Array.isArray(value) ? value : [value];
  const design = stack.map((f) => FONT_DESIGN[f]).find(Boolean) ?? '.default';
  const family = FONT_DESIGN[stack[0]] ? null : stack[0];
  return family
    ? `FontFamilyToken(design: ${design}, family: ${JSON.stringify(family)})`
    : `FontFamilyToken(design: ${design})`;
};

StyleDictionary.registerTransform({
  name: 'color/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'color',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return typeof v === 'string' && !v.startsWith('Color') ? swiftColor(v) : v;
  },
});
// Points, not pixels: the px values are read as pt, the same convention as the React Native build.
StyleDictionary.registerTransform({
  name: 'dimension/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'dimension',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return swiftNum(typeof v === 'string' ? Number.parseFloat(v) : v);
  },
});
// `TimeInterval` is seconds; the DTCG value is milliseconds.
StyleDictionary.registerTransform({
  name: 'duration/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'duration',
  transform: (token) => {
    const v = token.$value ?? token.value;
    if (typeof v === 'string') return v.endsWith('ms') ? swiftNum(Number.parseFloat(v) / 1000) : v;
    return swiftNum(Number(v) / 1000); // a bare DTCG duration is milliseconds too
  },
});
StyleDictionary.registerTransform({
  name: 'number/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'number',
  transform: (token) => swiftNum(token.$value ?? token.value),
});
StyleDictionary.registerTransform({
  name: 'fontWeight/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'fontWeight',
  transform: (token) => {
    const v = token.$value ?? token.value;
    if (typeof v === 'string' && v.startsWith('.')) return v;
    return FONT_WEIGHT[Number(v)] ?? '.regular';
  },
});
StyleDictionary.registerTransform({
  name: 'fontFamily/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'fontFamily',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return typeof v === 'string' && v.startsWith('FontFamilyToken(') ? v : swiftFontFamily(v);
  },
});
StyleDictionary.registerTransform({
  name: 'cubicBezier/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'cubicBezier',
  transform: (token) => {
    const v = token.$value ?? token.value;
    return Array.isArray(v) ? `.timingCurve(${v.map(swiftNum).join(', ')})` : v;
  },
});
StyleDictionary.registerTransform({
  name: 'shadow/swift',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'shadow',
  transform: (token) => {
    const v = token.$value ?? token.value;
    if (typeof v === 'string') return v;
    const pt = (s) => swiftNum(px(s));
    return `ShadowToken(color: ${swiftColor(v.color)}, x: ${pt(v.offsetX)}, y: ${pt(v.offsetY)}, blur: ${pt(v.blur)}, spread: ${pt(v.spread ?? '0px')})`;
  },
});

/** `$type` → [declared Swift type, the `TokenValue` case that carries it]. */
const SWIFT_TYPES = {
  color: ['Color', 'color'],
  dimension: ['CGFloat', 'dimension'],
  duration: ['TimeInterval', 'duration'],
  cubicBezier: ['Animation', 'animation'],
  fontWeight: ['Font.Weight', 'fontWeight'],
  fontFamily: ['FontFamilyToken', 'fontFamily'],
  number: ['Double', 'number'],
  shadow: ['ShadowToken', 'shadow'],
};

// Not exhaustive — just what a token name could plausibly collide with once `default` is dropped.
const SWIFT_KEYWORDS = new Set([
  'class', 'default', 'deinit', 'enum', 'extension', 'func', 'import', 'init', 'internal', 'let',
  'operator', 'private', 'protocol', 'public', 'static', 'struct', 'subscript', 'typealias', 'var',
  'break', 'case', 'continue', 'do', 'else', 'for', 'if', 'in', 'repeat', 'return', 'switch', 'where',
  'while', 'as', 'catch', 'false', 'guard', 'is', 'nil', 'super', 'self', 'Self', 'throw', 'throws',
  'true', 'try', 'inout',
]);
const swiftIdent = (name) => (SWIFT_KEYWORDS.has(name) ? `\`${name}\`` : name);

// TokenRef.swift extends `Theme` with one accessor per token, so a token whose camel name is one of
// these would shadow the thing it is implemented in terms of. Every name has at least two segments
// today, which is why none of them collide — this is the check that says so out loud.
const THEME_MEMBERS = new Set([
  'definition', 'colorScheme', 'id', 'title', 'color', 'dimension', 'duration', 'animation',
  'fontWeight', 'fontFamily', 'number', 'shadow',
]);

// Every dotted name the Swift build saw, in source order, with the Swift type it resolves to. Populated
// by the format below (all themes declare the same names, so writing it once per mode is idempotent) and
// read after the theme loop to emit TokenRef.swift.
const swiftRefs = new Map();

/**
 * One mode's `public enum Light { … }` / `enum Dark { … }`: a typed constant per token plus the
 * `TokenTable` the `Theme` subscript reads.
 *
 * The table is built from explicitly typed chunks rather than one 197-entry dictionary literal — Swift's
 * type checker gives up on literals that large ("unable to type-check this expression in reasonable
 * time") and chunking is the standard way out.
 */
const CHUNK = 32;
const swiftModeEnum = (mode, tokens) => {
  const name = mode[0].toUpperCase() + mode.slice(1);
  const rows = tokens.map((token) => {
    const [type, kind] = SWIFT_TYPES[token.$type] ?? [];
    if (!type) throw new Error(`swift: no mapping for $type "${token.$type}" (${token.name})`);
    const ref = dropDefault(token.path).join('.');
    if (swiftRefs.has(token.name) && swiftRefs.get(token.name).ref !== ref) {
      throw new Error(`swift: two tokens share the Swift name "${token.name}"`);
    }
    if (THEME_MEMBERS.has(token.name)) throw new Error(`swift: "${ref}" would shadow Theme.${token.name}`);
    swiftRefs.set(token.name, { ref, type, kind });
    return { ident: swiftIdent(token.name), type, kind, value: token.$value ?? token.value };
  });

  const chunks = [];
  for (let i = 0; i < rows.length; i += CHUNK) chunks.push(rows.slice(i, i + CHUNK));

  const lets = rows.map((r) => `        public static let ${r.ident}: ${r.type} = ${r.value}`).join('\n');
  const entries = chunks
    .map(
      (chunk, i) =>
        `        private static let entries${i}: [(TokenRef, TokenValue)] = [\n` +
        chunk.map((r) => `            (.${r.ident}, .${r.kind}(${r.ident})),`).join('\n') +
        '\n        ]',
    )
    .join('\n\n');
  const joined = chunks.map((_, i) => `entries${i}`).join(', ');

  return (
    `    public enum ${name} {\n${lets}\n\n${entries}\n\n` +
    `        public static let table = TokenTable(Dictionary(uniqueKeysWithValues: [${joined}].joined()))\n` +
    '    }'
  );
};

StyleDictionary.registerFormat({
  name: 'swift/theme-mode',
  format: ({ dictionary, file }) => swiftModeEnum(file.options.mode, dictionary.allTokens),
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
      // Formatted, never built: the output is one mode's enum, and the two modes are assembled into
      // packages/swiftui/Sources/DesignSchemaTokens/<ThemeName>.swift after the mode loop. `buildPath`
      // is unused but Style Dictionary insists the key exists and ends in a slash.
      swift: {
        transforms: [
          'attribute/cti', 'name/camel-no-default', 'color/swift', 'dimension/swift', 'duration/swift',
          'number/swift', 'fontWeight/swift', 'fontFamily/swift', 'cubicBezier/swift', 'shadow/swift',
        ],
        buildPath: path.join(out, 'swift/'),
        files: [{ destination: `${mode}.swift`, format: 'swift/theme-mode', options: { mode } }],
      },
    },
  };
};

// ---------- the token-name contract (packages/tokens/dist/names.{js,d.ts}) ----------
// Theme- and mode-independent: the dotted public names every theme provides, in source order, plus the
// helpers the generated components import. Style Dictionary has no format for a cross-theme file, so this
// walks the DTCG source itself — the same walk the retired Python token fallback did.

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
      // `', '` between entries, the separator Python's json.dumps used, so the file the Python fallback
      // wrote and the one Style Dictionary writes differ only in the "Generated by" marker.
      'export const TOKEN_NAMES = [' + names.map((n) => JSON.stringify(n)).join(', ') + '];\n' +
      "const kebab = (ref) => ref.replace(/\\./g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();\n" +
      'export const cssVar = (ref) => `var(--${kebab(ref)})`;\n' +
      "export const tokenKey = (ref) => ref.split('.').map((s, i) => (i === 0 ? s : s[0].toUpperCase() + s.slice(1))).join('');\n" +
      'export const resolveToken = (tokens, ref) => tokens[tokenKey(ref)];\n',
  );
}

// ---------- packages/swiftui/Sources/DesignSchemaTokens ----------

const SWIFT_OUT = path.join(here, '..', 'packages', 'swiftui', 'Sources', 'DesignSchemaTokens');
const THEME_DOCS = path.join(here, '..', 'site', 'src', 'content', 'docs', 'themes');

/** `calm-precise` → `CalmPrecise`. */
const pascal = (id) => id.split(/[^A-Za-z0-9]+/).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');

/** The theme doc's frontmatter title (`Calm & precise`), which is what the gallery's switcher shows. */
async function themeTitle(theme) {
  try {
    const doc = await fs.readFile(path.join(THEME_DOCS, `${theme}.md`), 'utf8');
    const title = doc.match(/^---\s*\n([\s\S]*?)\n---/)?.[1].match(/^title:\s*(.+?)\s*$/m)?.[1];
    if (title) return title.replace(/^['"]|['"]$/g, '');
  } catch {
    /* a theme with no doc still builds — fall back to its id */
  }
  return theme;
}

const swiftHeader = (file, source) =>
  `//  ${file}\n//\n//  Generated by tokens/build.mjs — do not edit; edit ${source} and run \`pnpm themes\`.\n`;

/** `<ThemeName>.swift` — the two mode enums the format produced, plus the `ThemeDefinition` that pairs them. */
async function writeSwiftTheme(theme, bodies) {
  const name = pascal(theme);
  const title = await themeTitle(theme);
  // A theme that declares only one mode reuses it for the other, so `Theme` never resolves an empty table.
  const light = bodies.light ?? bodies.dark.replace('enum Dark {', 'enum Light {');
  const dark = bodies.dark ?? bodies.light.replace('enum Light {', 'enum Dark {');
  await fs.writeFile(
    path.join(SWIFT_OUT, `${name}.swift`),
    `${swiftHeader(`${name}.swift`, `site/src/content/docs/themes/${theme}.md`)}\nimport SwiftUI\n\n` +
      `public enum ${name} {\n` +
      '    public static let definition = ThemeDefinition(\n' +
      `        id: ${JSON.stringify(theme)},\n` +
      `        title: ${JSON.stringify(title)},\n` +
      '        light: Light.table,\n        dark: Dark.table\n    )\n\n' +
      `${light}\n\n${dark}\n}\n`,
  );
}

/** `TokenRef.swift` — one case per token, plus the named accessors components read off `Theme`. */
async function writeSwiftTokenRef() {
  const refs = [...swiftRefs.entries()].map(([name, meta]) => ({ name, ...meta }));
  const cases = refs.map((r) => `    case ${swiftIdent(r.name)} = ${JSON.stringify(r.ref)}`).join('\n');
  const accessors = refs.map((r) => `    var ${swiftIdent(r.name)}: ${r.type} { ${r.kind}(.${swiftIdent(r.name)}) }`).join('\n');
  await fs.writeFile(
    path.join(SWIFT_OUT, 'TokenRef.swift'),
    `${swiftHeader('TokenRef.swift', 'the theme docs')}\nimport SwiftUI\n\n` +
      '/// Every token name the themes provide, as its dotted public name. This is the type an `overrides`\n' +
      '/// map is keyed by, and the type `theme[ref]` resolves.\n' +
      `public enum TokenRef: String, CaseIterable, Sendable {\n${cases}\n}\n\n` +
      '/// The named accessors, resolved for whichever mode the theme was built with — a component reads\n' +
      '/// `theme.colorBackground` and never asks which color scheme it is in.\n' +
      `public extension Theme {\n${accessors}\n}\n`,
  );
}

/** `Themes.swift` — the registry the gallery and `\\.dsTheme`'s fallback read. */
async function writeSwiftThemes(themes) {
  const all = themes.map((t) => `        ${pascal(t)}.definition,`).join('\n');
  await fs.writeFile(
    path.join(SWIFT_OUT, 'Themes.swift'),
    `${swiftHeader('Themes.swift', 'the theme docs')}\n` +
      '/// The themes the token build emitted, in the order the docs list them.\n' +
      `public enum Themes {\n    public static let all: [ThemeDefinition] = [\n${all}\n    ]\n\n` +
      '    /// What `\\.dsTheme` resolves to when no `.dsTheme(_:)` is installed above a view.\n' +
      `    public static let fallback: ThemeDefinition = ${pascal(themes[0])}.definition\n}\n`,
  );
}

const themes = (await fs.readdir(THEMES_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
await fs.mkdir(SWIFT_OUT, { recursive: true });
for (const theme of themes) {
  const modes = [];
  const swiftBodies = {};
  for (const mode of MODES) {
    try {
      await fs.access(path.join(THEMES_DIR, theme, `${mode}.json`));
    } catch {
      continue;
    }
    modes.push(mode);
    const sd = new StyleDictionary(config(theme, mode));
    for (const platform of Object.keys(config(theme, mode).platforms)) {
      if (platform !== 'swift') await sd.buildPlatform(platform);
    }
    [{ output: swiftBodies[mode] }] = await sd.formatPlatform('swift');
  }
  // Single CSS entry per theme: light (:root) + dark overrides.
  const cssDir = path.join(here, '..', 'packages', 'tokens', 'dist', theme, 'css');
  const merged = (await Promise.all(modes.map((m) => fs.readFile(path.join(cssDir, `tokens.${m}.css`), 'utf8')))).join('\n');
  await fs.writeFile(path.join(cssDir, 'tokens.css'), `/* Theme: ${theme} */\n${merged}`);
  await writeNames(theme, modes);
  await writeSwiftTheme(theme, swiftBodies);
  console.log(`✔ ${theme} (${modes.join(', ')}) →`, path.relative(process.cwd(), path.join(here, '..', 'packages', 'tokens', 'dist', theme)));
}
await writeSwiftTokenRef();
await writeSwiftThemes(themes);
console.log(`✔ swift (${swiftRefs.size} tokens × ${themes.length} themes) →`, path.relative(process.cwd(), SWIFT_OUT));
